import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Billboard, Line } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { PLANETS } from '@/data/planets';
import { ERA_BY_ID } from '@/data/eras';
import type { EraId, Planet } from '@/lib/types';
import { useHolocronStore } from '@/store/holocron-store';
import { planetVisual, type PlanetVisual } from '@/lib/planet-visual';
import { biomeFor } from '@/lib/planet-texture';
import { PlanetSphere } from './PlanetSphere';
import { computePlanetLayout, regionRings, type RegionRing } from '@/lib/galaxy-layout';
import { HYPER_ROUTES, collectHyperEdges } from '@/data/hyperlanes';

/**
 * Цвет гипермаршрута по эпохе. Синий — Республика, красный — Империя/ПП, зелёный — Новая Республика,
 * фиолетовый — Клонические войны, золотой — Высокая Республика, бронзовый — Старая.
 */
const LANE_COLOR: Record<EraId, string> = {
  'old-republic': '#b58e5a',
  'high-republic': '#ffd166',
  'clone-wars': '#a06bff',
  empire: '#ff4a4a',
  'new-republic': '#5be3a4',
  'first-order': '#ff2f2f',
};

interface PlanetNodeProps {
  planet: Planet;
  visual: PlanetVisual;
  accent: string;
  active: boolean;
  inEra: boolean;
  basePos: [number, number, number];
  onSelect: (id: string) => void;
  /** Коллбэк для HTML-тултипа: планета или null (выйти), экранные координаты курсора. */
  onHover: (planet: Planet | null, x: number, y: number) => void;
}

/**
 * Лейбл планеты по умолчанию скрыт. Показывается только при:
 *   - hover / focus через курсор (hoveredRef),
 *   - выбранной планете (active).
 * Карта остаётся чистой — нет наложения подписей в кластерах.
 */

function PlanetNode({
  planet,
  visual,
  accent,
  active,
  inEra,
  basePos,
  onSelect,
  onHover,
}: PlanetNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const labelMatRef = useRef<THREE.Material & { opacity: number }>(null);
  const hoveredRef = useRef(false);
  const currentAlphaRef = useRef(0);
  const isHub = planet.id === 'coruscant';
  const labelOffset = isHub ? 1.2 : 0.55;

  const [bx, by, bz] = basePos;

  // Лёгкое покачивание группы (bobbing) + видимость лейбла.
  // Лейбл показывается только для active/hub/hovered/очень-близко — это убирает кашу подписей в кластерах.
  useFrame(({ clock }, delta) => {
    const g = groupRef.current;
    if (g) {
      const t = clock.getElapsedTime();
      g.position.y = by + Math.sin(t * 0.6 + bx * 0.7) * 0.03;
    }

    const mat = labelMatRef.current;
    if (mat) {
      // Лейблы — только при hover или выборе планеты. Без оглядки на hub и дистанцию до камеры —
      // чтобы карта оставалась чистой и лейблы не накладывались в кластерах.
      const target = active || hoveredRef.current ? 1 : 0;
      // Плавный lerp — не мигает, когда курсор влетает/вылетает с планеты.
      const lerpRate = Math.min(1, delta * 6);
      currentAlphaRef.current += (target - currentAlphaRef.current) * lerpRate;
      mat.opacity = currentAlphaRef.current;
    }
  });

  const r = visual.radius;
  const biome = biomeFor(planet.id, planet.climate, planet.terrain);

  return (
    <group ref={groupRef} position={[bx, by, bz]}>
      <PlanetSphere
        planetId={planet.id}
        biome={biome}
        radius={r}
        color={visual.color}
        emissive={visual.emissive}
        accent={accent}
        active={active}
        inEra={inEra}
        hasRing={visual.hasRing}
        ringColor={visual.ringColor}
        textureUrl={planet.textureUrl}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(planet.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          hoveredRef.current = true;
          document.body.style.cursor = 'pointer';
          onHover(planet, e.nativeEvent.clientX, e.nativeEvent.clientY);
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          onHover(planet, e.nativeEvent.clientX, e.nativeEvent.clientY);
        }}
        onPointerOut={() => {
          hoveredRef.current = false;
          document.body.style.cursor = 'auto';
          onHover(null, 0, 0);
        }}
      />

      {/* 3D-текст — всегда виден, рендерится как меш в WebGL.
          Прозрачность управляется в useFrame по дистанции до камеры. */}
      <Billboard position={[0, r + labelOffset, 0]}>
        <Text
          fontSize={isHub ? 0.32 : 0.22}
          color={active ? '#ffffff' : '#e6f1ff'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#03060f"
          outlineOpacity={0.95}
          renderOrder={999}
          material-toneMapped={false}
          material-depthTest={false}
          material-transparent={true}
          ref={(mesh) => {
            if (mesh) {
              // Text из drei — это Mesh, у которого material хранит opacity.
              const mat = (mesh as unknown as { material: THREE.Material & { opacity: number } })
                .material;
              labelMatRef.current = mat;
            }
          }}
        >
          {planet.name.toUpperCase()}
        </Text>
      </Billboard>
    </group>
  );
}

interface Lane {
  from: [number, number, number];
  to: [number, number, number];
  id: string;
  /** id первой планеты маршрута. */
  a: string;
  /** id второй планеты маршрута. */
  b: string;
}

/**
 * Активен ли маршрут — если выбранная планета лежит на одном из его концов.
 */
function laneTouches(l: Lane, selectedId: string | null): boolean {
  return selectedId !== null && (l.a === selectedId || l.b === selectedId);
}

/**
 * Анимированный поток частиц по гипермаршрутам. Мелкие светящиеся точки
 * бегут от хаба (Корусант) к выбранной планете. Bloom подхватывает свечение.
 *
 * Частицы генерируются ТОЛЬКО для выбранного маршрута — это убирает визуальный
 * шум на карте: пока пользователь не сфокусировался на планете, линии остаются
 * приглушёнными, а поток «оживляет» именно выбранный путь.
 */
function LaneParticles({
  lanes,
  color,
  selectedId,
}: {
  lanes: Lane[];
  color: string;
  selectedId: string | null;
}) {
  const PARTICLES_PER_LANE = 1;
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Детерминированная инициализация — только для маршрутов, касающихся выбранной планеты.
  const particleDefs = useMemo(() => {
    const list: { offset: number; laneIdx: number; speed: number }[] = [];
    if (!selectedId) return list;
    for (let li = 0; li < lanes.length; li++) {
      if (!laneTouches(lanes[li], selectedId)) continue;
      for (let p = 0; p < PARTICLES_PER_LANE; p++) {
        const seed1 = Math.abs(Math.sin(li * 13.13 + p * 7.31)) % 1;
        const seed2 = Math.abs(Math.sin(li * 17.71 + p * 11.03)) % 1;
        list.push({
          offset: (p / PARTICLES_PER_LANE + seed1 * 0.15) % 1,
          laneIdx: li,
          speed: 0.08 + seed2 * 0.06,
        });
      }
    }
    return list;
  }, [lanes, selectedId]);

  // Мутабельные offsets — в ref, вынесенном useEffect'ом, чтобы не писать в render.
  const offsetsRef = useRef<number[]>([]);
  useEffect(() => {
    offsetsRef.current = particleDefs.map((p) => p.offset);
  }, [particleDefs]);

  useFrame((_, delta) => {
    for (let i = 0; i < particleDefs.length; i++) {
      const p = particleDefs[i];
      const off = offsetsRef.current[i];
      if (off === undefined) continue;
      const nextOff = (off + p.speed * delta) % 1;
      offsetsRef.current[i] = nextOff;
      const lane = lanes[p.laneIdx];
      const mesh = meshRefs.current[i];
      if (!lane || !mesh) continue;
      mesh.position.x = lane.from[0] + (lane.to[0] - lane.from[0]) * nextOff;
      mesh.position.y = lane.from[1] + (lane.to[1] - lane.from[1]) * nextOff;
      mesh.position.z = lane.from[2] + (lane.to[2] - lane.from[2]) * nextOff;
    }
  });

  return (
    <>
      {particleDefs.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

/**
 * Декоративные кольца регионов + русские подписи (Ядро, Колонии, Внешнее кольцо...).
 * Кольцо — тонкая полупрозрачная линия, подпись — 3D-текст на билборде,
 * всегда лицом к камере. Подпись ставится в back-left (угол 3π/4),
 * где обычно меньше планет — так текст читается, не перекрывая объекты.
 */
// ≈135°, back-left — угол, под которым ставится подпись кольца региона.
const REGION_LABEL_ANGLE = (3 * Math.PI) / 4;

function RegionRings({ rings }: { rings: RegionRing[] }) {
  const geometry = useMemo(() => {
    const segments = 96;
    return rings.map((ring) => {
      const points: [number, number, number][] = [];
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        points.push([Math.cos(t) * ring.radius, 0, Math.sin(t) * ring.radius]);
      }
      const labelPos: [number, number, number] = [
        Math.cos(REGION_LABEL_ANGLE) * ring.radius,
        0.15,
        Math.sin(REGION_LABEL_ANGLE) * ring.radius,
      ];
      return { ring, points, labelPos };
    });
  }, [rings]);

  return (
    <>
      {geometry.map(({ ring, points, labelPos }) => (
        <group key={ring.region}>
          <Line
            points={points}
            color="#6ea8ff"
            lineWidth={0.6}
            transparent
            opacity={0.09}
            depthWrite={false}
          />
          <Billboard position={labelPos}>
            <Text
              fontSize={0.35}
              color="#8fb8ff"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.015}
              outlineColor="#03060f"
              outlineOpacity={0.9}
              material-toneMapped={false}
              material-depthTest={false}
              material-transparent={true}
              material-opacity={0.4}
            >
              {ring.label}
            </Text>
          </Billboard>
        </group>
      ))}
    </>
  );
}

/**
 * Гипермаршруты — каноническая сеть торговых путей по HYPER_ROUTES.
 * Каждый маршрут — цепочка планет, ребра между соседними элементами.
 * Сеть выглядит как паутина с несколькими хабами, а не как «солнце» из Корусанта.
 *
 * Подсвечиваются все рёбра, касающиеся выбранной планеты — чтобы видеть её связи.
 */
function HyperLanes({
  laneColor,
  layout,
  selectedId,
}: {
  laneColor: string;
  layout: Map<string, [number, number, number]>;
  selectedId: string | null;
}) {
  const lines = useMemo<Lane[]>(() => {
    const edges = collectHyperEdges(HYPER_ROUTES);
    const result: Lane[] = [];
    for (const e of edges) {
      const from = layout.get(e.a);
      const to = layout.get(e.b);
      if (!from || !to) continue;
      result.push({
        id: `${e.routeId}:${e.a}-${e.b}`,
        a: e.a,
        b: e.b,
        from,
        to,
      });
    }
    return result;
  }, [layout]);

  return (
    <>
      {lines.map((l) => {
        const active = laneTouches(l, selectedId);
        return (
          <Line
            key={l.id}
            points={[l.from, l.to]}
            color={laneColor}
            lineWidth={active ? 1.8 : 1}
            transparent
            opacity={active ? 0.85 : 0.13}
            depthWrite={false}
          />
        );
      })}
      {/* Поток частиц — по всем линиям, касающимся выбранной планеты */}
      <LaneParticles lanes={lines} color={laneColor} selectedId={selectedId} />
    </>
  );
}

/**
 * HTML-тултип, который следует за курсором при наведении на планету.
 * Рендерится поверх канваса, позиционируется по clientX/Y — меньше математики,
 * чем проекция 3D-точки на экран.
 */
interface HoverState {
  planet: Planet;
  x: number;
  y: number;
}

function PlanetTooltip({ hover }: { hover: HoverState | null }) {
  if (!hover) return null;
  const { planet, x, y } = hover;
  // Смещаем от курсора, чтобы не перекрывать его и не мешать hit-test.
  return (
    <div
      className="pointer-events-none fixed z-50 min-w-[10rem] max-w-[16rem] rounded-md border border-holo-edge/70 bg-holo-deep/95 px-3 py-2 shadow-lg shadow-holo-void/60 backdrop-blur-md"
      style={{
        left: x + 14,
        top: y + 14,
        transition: 'opacity 120ms ease',
      }}
      role="tooltip"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-holo-glow">
        {planet.region.replace('-', ' ')}
      </p>
      <p className="holo-title text-sm text-holo-crystal">{planet.name}</p>
      <p className="mt-0.5 truncate text-[11px] text-holo-bone/70">{planet.terrain}</p>
    </div>
  );
}

export function GalaxyMap() {
  const eraId = useHolocronStore((s) => s.eraId);
  const selected = useHolocronStore((s) => s.selectedPlanetId);
  const select = useHolocronStore((s) => s.selectPlanet);

  const [hover, setHover] = useState<HoverState | null>(null);

  const accent = ERA_BY_ID[eraId]?.accent ?? '#6ea8ff';

  const visuals = useMemo(
    () => new Map(PLANETS.map((p) => [p.id, planetVisual(p.id, p.region)])),
    [],
  );

  // Позиции планет — по регион-кольцам, а не по хардкоду data-файла.
  const layout = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    for (const p of PLANETS) {
      map.set(p.id, computePlanetLayout(p).scene);
    }
    return map;
  }, []);

  // Кольца регионов с русскими подписями — визуальная иерархия карты.
  const rings = useMemo(() => regionRings(PLANETS.map((p) => p.region)), []);

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 22, 62], fov: 52 }}
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        onPointerMissed={() => {
          if (selected) select(null);
        }}
      >
        <color attach="background" args={['#03060f']} />
        {/* Туман — от дальней стенки сцены, чтобы не съедал Bloom и не гасил ближние планеты */}
        <fog attach="fog" args={['#03060f', 55, 140]} />

        <Suspense fallback={null}>
          {/* Очень низкий ambient — чтобы был виден терминатор (тёмная сторона) */}
          <ambientLight intensity={0.15} />
          {/* Главный солнечный свет — даёт чёткую тень на планетах */}
          <directionalLight position={[10, 8, 5]} intensity={1.6} color="#ffffff" />
          {/* Свет от соседней туманности — синеватый rim */}
          <pointLight position={[-15, -5, -10]} intensity={0.35} color="#4a6fa8" />
          {/* Небо/земля — hemisphere для мягкого градиента */}
          <hemisphereLight args={['#a5c8ff', '#03060f', 0.2]} />
          {/* Акцентный цветной свет от эпохи */}
          <pointLight position={[0, 6, 0]} intensity={0.5} color={accent} distance={20} />

          {/* Два слоя звёзд: мелкие вдали + крупные вблизи */}
          <Stars radius={200} depth={60} count={2000} factor={5} saturation={0} fade speed={0.2} />
          <Stars radius={60} depth={30} count={3000} factor={2} saturation={0.3} fade speed={0.5} />

          <HyperLanes
            laneColor={LANE_COLOR[eraId] ?? accent}
            layout={layout}
            selectedId={selected}
          />

          {/* Кольца-подсказки регионов с русскими подписями */}
          <RegionRings rings={rings} />

          {PLANETS.map((p) => (
            <PlanetNode
              key={p.id}
              planet={p}
              visual={visuals.get(p.id)!}
              accent={accent}
              active={selected === p.id}
              inEra={p.eras.some((e) => e.eraId === eraId)}
              basePos={layout.get(p.id) ?? [0, 0, 0]}
              onSelect={select}
              onHover={(planet, x, y) => setHover(planet ? { planet, x, y } : null)}
            />
          ))}

          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            zoomSpeed={0.6}
            rotateSpeed={0.5}
            minDistance={10}
            maxDistance={110}
          />

          {/* Bloom — ярче и ниже порог: светятся атмосферы, гипермаршруты и звёзды */}
          <EffectComposer enableNormalPass={false}>
            <Bloom intensity={0.85} luminanceThreshold={0.22} luminanceSmoothing={0.9} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>

      <MapHint />

      {/* HTML-тултип при наведении на планету — следует за курсором вне канваса. */}
      <PlanetTooltip hover={hover} />
    </div>
  );
}

/**
 * Подсказка в верхнем левом углу. Авто-скрывается через 6 сек, можно закрыть вручную,
 * кнопка «?» — вернуть. Состояние помним в localStorage, чтобы не навязываться повторно.
 */
function MapHint() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem('holo:hint-dismissed') !== '1';
  });

  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(() => setVisible(false), 6000);
    return () => window.clearTimeout(t);
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('holo:hint-dismissed', '1');
    }
  };

  const show = () => {
    setVisible(true);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('holo:hint-dismissed');
    }
  };

  if (!visible) {
    return (
      <button
        onClick={show}
        aria-label="Показать подсказку"
        className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-holo-edge/60 bg-holo-deep/70 font-mono text-sm text-holo-glow backdrop-blur-md transition hover:border-holo-glow hover:text-holo-crystal"
      >
        ?
      </button>
    );
  }

  return (
    <div className="absolute left-4 top-4 flex max-w-[280px] items-start gap-2 rounded-md border border-holo-edge/60 bg-holo-deep/70 px-3 py-1.5 backdrop-blur-md">
      <div className="pointer-events-none flex-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-holo-glow">
          Галактика · режим Holocron
        </p>
        <p className="mt-0.5 text-xs text-holo-bone/70">
          Клик по планете — детали. Колесо — приближение. Зажать ЛКМ — вращение.
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Скрыть подсказку"
        className="-mr-1 -mt-0.5 flex h-5 w-5 items-center justify-center rounded text-holo-bone/60 transition hover:bg-holo-edge/30 hover:text-holo-crystal"
      >
        ✕
      </button>
    </div>
  );
}
