/**
 * tRPC-роутер Holocron.
 *
 * Пока читает из mock-данных, но структура сразу такая, чтобы позже
 * заменить импорты на Drizzle-репозитории поверх Postgres/PostGIS.
 */

import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import superjson from 'superjson';

import { CHARACTERS, CHARACTER_BY_ID } from '../src/data/characters';
import { CREATURES } from '../src/data/creatures';
import { PLANETS, PLANET_BY_ID } from '../src/data/planets';
import { TIMELINE } from '../src/data/timeline';
import { planetsWithinRadius } from '../src/lib/geo';
import type { Character, Creature, EraId, Planet, TimelineEvent } from '../src/lib/types';

const t = initTRPC.create({
  transformer: superjson,
});

const eraSchema = z.enum([
  'old-republic',
  'high-republic',
  'clone-wars',
  'empire',
  'new-republic',
  'first-order',
]);

const habitatSchema = z.enum([
  'urban',
  'desert',
  'forest',
  'ice',
  'ocean',
  'volcanic',
  'swamp',
  'space',
]);

const dangerSchema = z.enum(['low', 'medium', 'high', 'extreme']);

export const appRouter = t.router({
  listPlanets: t.procedure.query((): Planet[] => PLANETS),

  getPlanet: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }): Planet | undefined => PLANET_BY_ID[input.id]),

  getPlanetByEra: t.procedure
    .input(z.object({ id: z.string(), eraId: eraSchema }))
    .query(({ input }) => {
      const planet = PLANET_BY_ID[input.id];
      if (!planet) return undefined;
      const snapshot = planet.eras.find((e) => e.eraId === input.eraId);
      return { planet, snapshot };
    }),

  listCharactersByPlanet: t.procedure
    .input(z.object({ planetId: z.string() }))
    .query(({ input }): Character[] => CHARACTERS.filter((c) => c.homePlanetId === input.planetId)),

  listCreaturesByPlanet: t.procedure
    .input(z.object({ planetId: z.string() }))
    .query(({ input }): Creature[] =>
      CREATURES.filter((c) => c.planetIds.includes(input.planetId)),
    ),

  listTimelineByEra: t.procedure
    .input(z.object({ eraId: eraSchema }))
    .query(({ input }): TimelineEvent[] => TIMELINE.filter((e) => e.eraId === input.eraId)),

  listCreatures: t.procedure
    .input(
      z
        .object({
          eraId: eraSchema.optional(),
          habitat: habitatSchema.optional(),
          danger: dangerSchema.optional(),
        })
        .optional(),
    )
    .query(({ input }): Creature[] =>
      CREATURES.filter((c) => {
        if (input?.eraId && !c.eras.includes(input.eraId as EraId)) return false;
        if (input?.habitat && c.habitat !== input.habitat) return false;
        if (input?.danger && c.danger !== input.danger) return false;
        return true;
      }),
    ),

  neighbors: t.procedure
    .input(z.object({ id: z.string(), radius: z.number().positive() }))
    .query(({ input }): Planet[] => {
      const planet = PLANET_BY_ID[input.id];
      if (!planet) return [];
      return planetsWithinRadius(PLANETS, planet.position, input.radius).filter(
        (p) => p.id !== input.id,
      );
    }),

  getCharacter: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }): Character | undefined => CHARACTER_BY_ID[input.id]),
});

export type AppRouter = typeof appRouter;
