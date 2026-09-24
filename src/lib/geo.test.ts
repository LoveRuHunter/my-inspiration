import { describe, expect, it } from 'vitest';
import { distance, planetsWithinRadius } from './geo';
import type { Planet } from './types';

const P = (id: string, x: number, y: number, z: number): Planet => ({
  id,
  name: id,
  sector: '',
  region: 'core',
  climate: '',
  terrain: '',
  position: { x, y, z },
  description: '',
  eras: [],
  creatureIds: [],
  characterIds: [],
});

describe('geo utils', () => {
  it('считает 3D-расстояние', () => {
    expect(distance({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 })).toBeCloseTo(5);
  });

  it('находит планеты в радиусе и сортирует по возрастанию расстояния', () => {
    const planets = [P('a', 0, 0, 0), P('b', 3, 4, 0), P('c', 100, 0, 0), P('d', 1, 1, 1)];
    const result = planetsWithinRadius(planets, { x: 0, y: 0, z: 0 }, 10);
    expect(result.map((p) => p.id)).toEqual(['a', 'd', 'b']);
  });
});
