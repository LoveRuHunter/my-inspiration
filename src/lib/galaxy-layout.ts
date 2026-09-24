/**
 * Пространственная раскладка планет для 3D-карты.
 *
 * Проблема: жёсткие координаты `position: { x, y, z }` в data/planets.ts
 * не масштабируются с ростом числа планет — центр перегружен, лейблы
 * налипают друг на друга. Решение — детерминированно пересчитывать
 * позиции по кольцам регионов вокруг Корусанта.
 *
 * Дизайн:
 *   - Ядро (core) остаётся у центра. Корусант закреплён в (0, 0, 0).
 *   - Каждый регион получает базовый радиус кольца.
 *   - Угол планеты берётся из её исходных (x, y) координат data-файла —
 *     это сохраняет авторскую относительную ориентацию слоёв.
 *   - Мелкий детерминированный джиттер разводит планеты, чьи углы
 *     случайно совпали (сохраняя воспроизводимость между рендерами).
 *   - Вертикаль (scene Y) — из исходного z с масштабом, чтобы регион-кольцо
 *     не были плоским блином.
 *
 * Всё чисто, детерминированно и без Math.random() — совместимо со строгими
 * правилами React Compiler v7.
 */

import type { Planet, Region } from '@/lib/types';

/**
 * Базовый радиус кольца для каждого региона, в единицах сцены Three.js.
 * Корусант (core-hub) обрабатывается отдельно: он всегда в центре.
 */
const REGION_RING_RADIUS: Record<Region, number> = {
  core: 3.2,
  colonies: 5.5,
  'inner-rim': 7.5,
  expansion: 9.5,
  'mid-rim': 11.5,
  'outer-rim': 14.5,
  unknown: 18.5,
};

/**
 * Смещение по вертикали (scene Y) — по региону, чтобы кольца
 * ложились слоями, а не одним диском. Внешние регионы — глубже.
 */
const REGION_Y_TIER: Record<Region, number> = {
  core: 0,
  colonies: -0.4,
  'inner-rim': -0.8,
  expansion: -1.2,
  'mid-rim': -1.6,
  'outer-rim': -2.0,
  unknown: 2.4,
};

/**
 * Множитель для остаточной вертикальной вариации (data.z),
 * чтобы планеты в одном регионе не лежали идеально плоско.
 */
const Y_JITTER_SCALE = 0.045;

/**
 * Детерминированный псевдо-рандом на основе id планеты.
 * Возвращает число в [-1, 1].
 */
function idNoise(id: string, salt: number): number {
  let acc = salt;
  for (let i = 0; i < id.length; i++) {
    acc = (acc * 31 + id.charCodeAt(i)) | 0;
  }
  // sin даёт распределение в [-1, 1] без Math.random.
  return Math.sin(acc * 0.917);
}

export interface LayoutPosition {
  /** Готовая позиция в сцене (единицы Three.js). */
  scene: [number, number, number];
  /** Радиус кольца региона — для рисования подсказок-контуров. */
  ringRadius: number;
  /** Угол планеты на своём кольце (радианы). */
  angle: number;
}

/**
 * Возвращает позицию планеты в мире сцены.
 * Корусант — всегда центр. Остальные — на кольце своего региона.
 */
export function computePlanetLayout(planet: Planet): LayoutPosition {
  // Корусант — центр галактики.
  if (planet.id === 'coruscant') {
    return { scene: [0, 0, 0], ringRadius: 0, angle: 0 };
  }

  const region = planet.region;
  const baseRadius = REGION_RING_RADIUS[region] ?? REGION_RING_RADIUS['mid-rim'];

  // Угол вычисляется из авторских координат — сохраняем относительное
  // расположение секторов. Если обе координаты 0 — берём хеш имени.
  const hasDir = planet.position.x !== 0 || planet.position.y !== 0;
  const rawAngle = hasDir
    ? Math.atan2(planet.position.y, planet.position.x)
    : idNoise(planet.id, 7) * Math.PI;

  // Детерминированный джиттер по углу — раздвигает планеты,
  // случайно совпавшие по направлению.
  const angleJitter = idNoise(planet.id, 13) * 0.35;
  const angle = rawAngle + angleJitter;

  // Радиус — базовый радиус кольца + лёгкий джиттер, чтобы кольцо
  // не выглядело идеальной окружностью.
  const radiusJitter = idNoise(planet.id, 29) * 0.9;
  const radius = baseRadius + radiusJitter;

  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  // Вертикаль: базовый ярус региона + остаточная вариация из data.z.
  const yBase = REGION_Y_TIER[region] ?? 0;
  const yVariance = planet.position.z * Y_JITTER_SCALE;
  const y = yBase + yVariance;

  return {
    scene: [x, y, z],
    ringRadius: baseRadius,
    angle,
  };
}

/** Русские названия регионов для подписей колец на карте. */
const REGION_LABEL: Record<Region, string> = {
  core: 'Ядро',
  colonies: 'Колонии',
  'inner-rim': 'Внутреннее кольцо',
  expansion: 'Расширение',
  'mid-rim': 'Среднее кольцо',
  'outer-rim': 'Внешнее кольцо',
  unknown: 'Неизведанные регионы',
};

export interface RegionRing {
  region: Region;
  radius: number;
  label: string;
}

/**
 * Кольца регионов, реально представленных в наборе планет.
 * Отсортированы от центра к краю.
 *
 * Ядро не включаем:
 *   - Корусант сам есть Ядро (radius = 0, он в центре).
 *   - Кореллия (единственная планета на ядро-кольце) всё равно видна,
 *     но отдельное кольцо «Ядро» вокруг Корусанта перегружает центр
 *     и его подпись налагается на Кореллию.
 */
export function regionRings(regions: Region[]): RegionRing[] {
  const seen = new Map<Region, number>();
  for (const r of regions) {
    if (r === 'core') continue;
    const radius = REGION_RING_RADIUS[r];
    if (radius !== undefined && radius > 0 && !seen.has(r)) {
      seen.set(r, radius);
    }
  }
  return Array.from(seen.entries())
    .map(([region, radius]) => ({ region, radius, label: REGION_LABEL[region] }))
    .sort((a, b) => a.radius - b.radius);
}

/** Список уникальных радиусов колец — тонкая обёртка для старого API. */
export function regionRingRadii(regions: Region[]): number[] {
  return regionRings(regions).map((r) => r.radius);
}
