import { useMemo } from 'react';
import { planetVisual } from '@/lib/planet-visual';

interface Blob {
  cx: number;
  cy: number;
  r: number;
  opacity: number;
  rx: number;
}

function seededRng(planetId: string): () => number {
  let seed = 0;
  for (let i = 0; i < planetId.length; i++) {
    seed = (seed * 31 + planetId.charCodeAt(i)) >>> 0;
  }
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
}

function generateBlobs(planetId: string): Blob[] {
  const rnd = seededRng(planetId);
  const count = 6 + Math.floor(rnd() * 4);
  return Array.from({ length: count }, () => ({
    cx: 20 + rnd() * 60,
    cy: 20 + rnd() * 60,
    r: 4 + rnd() * 12,
    opacity: 0.15 + rnd() * 0.35,
    rx: 0.6 + rnd() * 0.8,
  }));
}

interface PixelCell {
  x: number;
  y: number;
  color: string;
}

/**
 * Смешивание двух hex-цветов с коэффициентом t (0..1).
 */
function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ra = (pa >> 16) & 0xff;
  const ga = (pa >> 8) & 0xff;
  const ba = pa & 0xff;
  const rb = (pb >> 16) & 0xff;
  const gb = (pb >> 8) & 0xff;
  const bb = pb & 0xff;
  const r = Math.round(ra + (rb - ra) * t);
  const g = Math.round(ga + (gb - ga) * t);
  const bl = Math.round(ba + (bb - ba) * t);
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}`;
}

/**
 * Генерирует пиксельный диск планеты 32×32.
 * Ячейки внутри окружности окрашены в вариации базового цвета —
 * зависят от «широтных полос», hash-шума и локальных пятен-континентов.
 * Ячейки полярных шапок для холодных миров.
 */
function generatePixels(
  planetId: string,
  region: string,
  base: string,
  emissive: string,
  isIcy: boolean,
): PixelCell[] {
  const size = 32;
  const radius = size / 2 - 0.5;
  const rnd = seededRng(planetId + ':pixel');
  const noiseMap: number[] = [];
  for (let i = 0; i < size * size; i++) noiseMap.push(rnd());

  // 3 пятна-«континента»
  const spots = Array.from({ length: 3 + Math.floor(rnd() * 3) }, () => ({
    cx: rnd() * size,
    cy: rnd() * size,
    r: 3 + rnd() * 5,
  }));

  const cells: PixelCell[] = [];
  const cx = size / 2 - 0.5;
  const cy = size / 2 - 0.5;

  const highlight = '#ffffff';
  const shadow = '#020410';

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;

      // 3D-сдвиг для псевдо-объёма: диагональный градиент
      const shading = (dx + dy) / (radius * 2);

      // Широтные полосы для газовых оттенков
      const latBand = Math.sin((y / size) * Math.PI * 3 + rnd() * 0.1) * 0.15;

      // Континенты — тёмнее
      let isContinent = false;
      for (const s of spots) {
        const sd = Math.sqrt((x - s.cx) ** 2 + (y - s.cy) ** 2);
        if (sd < s.r) {
          isContinent = true;
          break;
        }
      }

      // Полярные шапки для льдистых миров
      const isPolar = isIcy && Math.abs(y - cy) > radius * 0.75;

      const noise = noiseMap[y * size + x];

      let color: string;
      if (isPolar) {
        color = mix(base, highlight, 0.55);
      } else if (isContinent) {
        color = mix(base, emissive, 0.55);
      } else {
        color = mix(base, emissive, latBand + 0.2);
      }

      // Блик слева-сверху / тень справа-снизу
      if (shading < -0.5) color = mix(color, highlight, 0.28);
      else if (shading > 0.4) color = mix(color, shadow, 0.35);

      // Небольшой пиксельный шум
      if (noise > 0.9) color = mix(color, highlight, 0.15);
      else if (noise < 0.08) color = mix(color, shadow, 0.2);

      // Терминатор — узкая тёмная кайма справа
      const edgeDist = radius - dist;
      if (edgeDist < 0.6) color = mix(color, shadow, 0.35);

      cells.push({ x, y, color });
    }
  }

  // Небольшая нестабильность: у некоторых планет добавим «атмосферное свечение» через отступ
  void region;
  return cells;
}

interface Props {
  planetId: string;
  region: string;
  size?: number;
  className?: string;
  variant?: 'pixel' | 'illustrated';
}

/**
 * Процедурный SVG-«портрет» планеты. Два стиля:
 *  - pixel (по умолчанию): 32×32 пиксель-арт диск, каждая планета уникальна
 *  - illustrated: гладкий градиент, «континенты» пятнами, кольца, блик
 *
 * Всё детерминировано по id планеты. Никаких внешних текстур,
 * никакого копирайта Lucasfilm.
 */
export function PlanetPortrait({
  planetId,
  region,
  size = 160,
  className,
  variant = 'pixel',
}: Props) {
  const visual = useMemo(() => planetVisual(planetId, region), [planetId, region]);
  const blobs = useMemo(() => generateBlobs(planetId), [planetId]);
  const isIcy = useMemo(
    () => planetId === 'hoth' || planetId === 'ilum' || planetId === 'starkiller',
    [planetId],
  );
  const pixels = useMemo(
    () =>
      variant === 'pixel'
        ? generatePixels(planetId, region, visual.color, visual.emissive, isIcy)
        : [],
    [variant, planetId, region, visual.color, visual.emissive, isIcy],
  );

  if (variant === 'pixel') {
    const grid = 32;
    const cxG = grid / 2;
    const cyG = grid / 2;
    const rG = grid / 2 - 0.5;
    return (
      <svg
        viewBox={`-2 -2 ${grid + 4} ${grid + 4}`}
        width={size}
        height={size}
        className={className}
        shapeRendering="crispEdges"
        aria-hidden
      >
        <defs>
          <radialGradient id={`px-atm-${planetId}`} cx="50%" cy="50%" r="55%">
            <stop offset="55%" stopColor="transparent" />
            <stop offset="85%" stopColor={visual.emissive} stopOpacity="0.55" />
            <stop offset="100%" stopColor={visual.emissive} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`px-glow-${planetId}`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={visual.color} stopOpacity="0.35" />
            <stop offset="70%" stopColor={visual.emissive} stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        {/* Свечение-подложка чтобы даже бледные планеты отделялись от фона */}
        <circle cx={cxG} cy={cyG} r={rG + 3} fill={`url(#px-glow-${planetId})`} />
        <rect x={-2} y={-2} width={grid + 4} height={grid + 4} fill={`url(#px-atm-${planetId})`} />
        {visual.hasRing && (
          <ellipse
            cx={grid / 2}
            cy={grid / 2}
            rx={grid * 0.55}
            ry={grid * 0.12}
            fill="none"
            stroke={visual.ringColor}
            strokeWidth="0.9"
            opacity="0.7"
          />
        )}
        {pixels.map((c) => (
          <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1} height={1} fill={c.color} />
        ))}
        {visual.hasRing && (
          <path
            d={`M ${grid / 2 - grid * 0.55} ${grid / 2} A ${grid * 0.55} ${grid * 0.12} 0 0 0 ${grid / 2 + grid * 0.55} ${grid / 2}`}
            fill="none"
            stroke={visual.ringColor}
            strokeWidth="0.9"
            opacity="0.9"
          />
        )}
      </svg>
    );
  }

  const cx = 50;
  const cy = 50;
  const r = 34;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
      <defs>
        <radialGradient id={`grad-${planetId}`} cx="30%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="30%" stopColor={visual.color} stopOpacity="1" />
          <stop offset="75%" stopColor={visual.emissive} stopOpacity="1" />
          <stop offset="100%" stopColor="#020410" stopOpacity="1" />
        </radialGradient>
        <radialGradient id={`atm-${planetId}`} cx="50%" cy="50%" r="55%">
          <stop offset="70%" stopColor="transparent" />
          <stop offset="85%" stopColor={visual.emissive} stopOpacity="0.35" />
          <stop offset="100%" stopColor={visual.emissive} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`clip-${planetId}`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>

      <circle cx={cx} cy={cy} r={r + 8} fill={`url(#atm-${planetId})`} />
      {visual.hasRing && (
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * 1.75}
          ry={r * 0.35}
          fill="none"
          stroke={visual.ringColor}
          strokeWidth="1.2"
          opacity="0.55"
        />
      )}
      <circle cx={cx} cy={cy} r={r} fill={`url(#grad-${planetId})`} />
      <g clipPath={`url(#clip-${planetId})`} opacity="0.85">
        {blobs.map((b, i) => (
          <ellipse
            key={i}
            cx={cx - r + b.cx * (r / 50)}
            cy={cy - r + b.cy * (r / 50)}
            rx={b.r * b.rx * 0.6}
            ry={b.r * 0.5}
            fill={visual.emissive}
            opacity={b.opacity}
          />
        ))}
      </g>
      {visual.hasRing && (
        <path
          d={`M ${cx - r * 1.75} ${cy} A ${r * 1.75} ${r * 0.35} 0 0 0 ${cx + r * 1.75} ${cy}`}
          fill="none"
          stroke={visual.ringColor}
          strokeWidth="1.2"
          opacity="0.7"
        />
      )}
      <ellipse
        cx={cx - r * 0.35}
        cy={cy - r * 0.4}
        rx={r * 0.35}
        ry={r * 0.18}
        fill="#ffffff"
        opacity="0.18"
      />
    </svg>
  );
}
