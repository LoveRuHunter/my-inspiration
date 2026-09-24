import type { GalaxyPosition, Planet } from './types';

/**
 * Евклидово расстояние в галактических координатах.
 * Заглушка на будущее — в проде это будет PostGIS ST_3DDistance.
 */
export function distance(a: GalaxyPosition, b: GalaxyPosition): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Возвращает планеты в радиусе N от заданной точки.
 * Аналог: `SELECT * FROM planets WHERE ST_3DDWithin(position, $1, $2)`.
 */
export function planetsWithinRadius(
  planets: Planet[],
  origin: GalaxyPosition,
  radius: number,
): Planet[] {
  return planets
    .filter((p) => distance(p.position, origin) <= radius)
    .sort((a, b) => distance(a.position, origin) - distance(b.position, origin));
}
