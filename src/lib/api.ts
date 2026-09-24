/**
 * Асинхронный слой доступа к данным.
 *
 * Ходит в tRPC-роутер (server/router.ts). Если бэкенд недоступен,
 * автоматически падает на локальные mock-данные, чтобы UI не ломался.
 * getCharacter — синхронный, поэтому всегда читается из локального кэша.
 */

import { CHARACTERS, CHARACTER_BY_ID } from '@/data/characters';
import { CREATURES } from '@/data/creatures';
import { PLANETS, PLANET_BY_ID } from '@/data/planets';
import { TIMELINE } from '@/data/timeline';
import { planetsWithinRadius } from '@/lib/geo';
import { trpc } from '@/lib/trpc';
import type { Character, Creature, EraId, Planet, TimelineEvent } from '@/lib/types';

async function withFallback<T>(remote: () => Promise<T>, local: () => T): Promise<T> {
  try {
    return await remote();
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[api] tRPC недоступен, используем локальные данные:', err);
    }
    return local();
  }
}

export const api = {
  listPlanets(): Promise<Planet[]> {
    return withFallback(
      () => trpc.listPlanets.query(),
      () => PLANETS,
    );
  },

  getPlanet(id: string): Promise<Planet | undefined> {
    return withFallback(
      () => trpc.getPlanet.query({ id }),
      () => PLANET_BY_ID[id],
    );
  },

  getPlanetByEra(id: string, eraId: EraId) {
    return withFallback(
      () => trpc.getPlanetByEra.query({ id, eraId }),
      () => {
        const planet = PLANET_BY_ID[id];
        if (!planet) return undefined;
        const snapshot = planet.eras.find((e) => e.eraId === eraId);
        return { planet, snapshot };
      },
    );
  },

  listCharactersByPlanet(planetId: string): Promise<Character[]> {
    return withFallback(
      () => trpc.listCharactersByPlanet.query({ planetId }),
      () => CHARACTERS.filter((c) => c.homePlanetId === planetId),
    );
  },

  listCreaturesByPlanet(planetId: string): Promise<Creature[]> {
    return withFallback(
      () => trpc.listCreaturesByPlanet.query({ planetId }),
      () => CREATURES.filter((c) => c.planetIds.includes(planetId)),
    );
  },

  listTimelineByEra(eraId: EraId): Promise<TimelineEvent[]> {
    return withFallback(
      () => trpc.listTimelineByEra.query({ eraId }),
      () => TIMELINE.filter((e) => e.eraId === eraId),
    );
  },

  listCreatures(filters?: {
    eraId?: EraId;
    habitat?: Creature['habitat'];
    danger?: Creature['danger'];
  }): Promise<Creature[]> {
    return withFallback(
      () => trpc.listCreatures.query(filters ?? {}),
      () =>
        CREATURES.filter((c) => {
          if (filters?.eraId && !c.eras.includes(filters.eraId)) return false;
          if (filters?.habitat && c.habitat !== filters.habitat) return false;
          if (filters?.danger && c.danger !== filters.danger) return false;
          return true;
        }),
    );
  },

  neighbors(id: string, radius: number): Promise<Planet[]> {
    return withFallback(
      () => trpc.neighbors.query({ id, radius }),
      () => {
        const planet = PLANET_BY_ID[id];
        if (!planet) return [];
        return planetsWithinRadius(PLANETS, planet.position, radius).filter((p) => p.id !== id);
      },
    );
  },

  getCharacter(id: string): Character | undefined {
    return CHARACTER_BY_ID[id];
  },
};
