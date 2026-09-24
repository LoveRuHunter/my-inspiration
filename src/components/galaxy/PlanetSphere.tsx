/**
 * Красивая планета: текстурированная сфера + атмосферное свечение (backside)
 * + внешний additive-ореол + опциональные кольца.
 *
 * Текстура берётся либо из `textureUrl` (реальная карта — .jpg/.webp),
 * либо генерируется процедурно через `generatePlanetTexture()`.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { generatePlanetTexture, type PlanetBiome } from '@/lib/planet-texture';

// Один загрузчик на весь модуль — внутри есть кэш.
const textureLoader = new THREE.TextureLoader();
const realTextureCache = new Map<string, THREE.Texture>();

function loadRealTexture(url: string): Promise<THREE.Texture> {
  const cached = realTextureCache.get(url);
  if (cached) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    textureLoader.load(
      url,
      (t) => {
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.ClampToEdgeWrapping;
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        t.needsUpdate = true;
        realTextureCache.set(url, t);
        resolve(t);
      },
      undefined,
      reject,
    );
  });
}

interface PlanetSphereProps {
  planetId: string;
  biome: PlanetBiome;
  radius: number;
  color: string;
  emissive: string;
  accent: string;
  active: boolean;
  hasRing?: boolean;
  ringColor?: string;
  textureUrl?: string;
  /** Показать внешний additive-ореол (пульсация). По-умолчанию выкл. */
  showAura?: boolean;
  /** Скорость собственного вращения планеты (rad/sec). */
  spinSpeed?: number;
  /**
   * Планета активна в текущей эпохе (есть снапшот). false — визуально приглушается (меньше
   * яркость, прозрачность атмосферы), но не исчезает.
   */
  inEra?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
}

export function PlanetSphere({
  planetId,
  biome,
  radius,
  color,
  emissive,
  accent,
  active,
  hasRing = false,
  ringColor = '#a5c8ff',
  textureUrl,
  showAura = false,
  spinSpeed = 0.08,
  inEra = true,
  onClick,
  onPointerOver,
  onPointerMove,
  onPointerOut,
}: PlanetSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  // accent используется в aura, color — как fallback-тон для атмосферы, если emissive тёмный.
  // Молчим о неиспользуемых параметрах.
  void accent;
  void color;

  // Процедурная текстура — генерится 1 раз, кэшируется по planetId+biome.
  const proceduralTexture = useMemo(
    () => generatePlanetTexture({ planetId, biome, width: 512, height: 256 }),
    [planetId, biome],
  );

  // Реальная текстура: грузим асинхронно. Храним пару [url, texture],
  // чтобы отбрасывать устаревшую текстуру при смене URL без синхронного setState.
  const [loadedTexture, setLoadedTexture] = useState<{
    url: string;
    texture: THREE.Texture;
  } | null>(() => {
    if (!textureUrl) return null;
    const cached = realTextureCache.get(textureUrl);
    return cached ? { url: textureUrl, texture: cached } : null;
  });

  useEffect(() => {
    if (!textureUrl) return;
    let cancelled = false;
    loadRealTexture(textureUrl)
      .then((t) => {
        if (!cancelled) setLoadedTexture({ url: textureUrl, texture: t });
      })
      .catch(() => {
        // Не загрузилась — остаёмся на процедурной.
      });
    return () => {
      cancelled = true;
    };
  }, [textureUrl]);

  const realTexture =
    loadedTexture && loadedTexture.url === textureUrl ? loadedTexture.texture : null;
  const texture = realTexture ?? proceduralTexture;

  // Плавный fade при смене эпохи: текущее значение 0..1 — в ref, чтобы менять в useFrame без setState.
  const eraFadeRef = useRef(inEra ? 1 : 0.35);
  const targetFade = inEra ? 1 : 0.35;

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    // Плавный лерп fade к целевому
    const lerpRate = Math.min(1, delta * 3);
    eraFadeRef.current += (targetFade - eraFadeRef.current) * lerpRate;
    const fade = eraFadeRef.current;

    if (meshRef.current) {
      meshRef.current.rotation.y = t * spinSpeed;
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = fade;
      mat.transparent = fade < 0.999;
    }
    if (showAura && glowRef.current) {
      const pulse = 1 + Math.sin(t * 1.8 + radius * 3) * 0.03;
      glowRef.current.scale.setScalar(pulse * (active ? 1.15 : 1));
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (active ? 0.1 : 0.05) * fade;
    }
    if (atmosphereRef.current) {
      const mat = atmosphereRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (0.22 + Math.sin(t * 1.2) * 0.02 + (active ? 0.06 : 0)) * fade;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.03;
    }
  });

  const scale = active ? 1.35 : 1;

  return (
    <group scale={scale}>
      {/* Основная сфера — с текстурой.
          ВАЖНО: если есть текстура, color обязан быть белым — иначе она тонируется/затемняется.
          Emissive включается только при выборе планеты — чтобы не затирать терминатор. */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerMove={onPointerMove}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          map={texture}
          color="#ffffff"
          roughness={0.85}
          metalness={0.05}
          emissive={active ? emissive : '#000000'}
          emissiveIntensity={active ? 0.35 : 0}
        />
      </mesh>

      {/* Атмосферное свечение — backside-сфера чуть большего радиуса.
          Даёт мягкий ободок света на силуэте планеты. */}
      <mesh ref={atmosphereRef} scale={1.06}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color={emissive}
          side={THREE.BackSide}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>

      {/* Внешний additive-ореол — опционально, только при showAura */}
      {showAura && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[radius * 1.25, 24, 24]} />
          <meshBasicMaterial
            color={emissive}
            transparent
            opacity={active ? 0.1 : 0.05}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Кольца — двухслойные, разной прозрачности */}
      {hasRing && (
        <group ref={ringRef} rotation={[Math.PI / 2.3, 0, 0]}>
          <mesh>
            <ringGeometry args={[radius * 1.4, radius * 1.75, 128]} />
            <meshBasicMaterial
              color={ringColor}
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[radius * 1.78, radius * 2.05, 128]} />
            <meshBasicMaterial
              color={ringColor}
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
