import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { Character, Creature, Planet, PlanetEraSnapshot } from '@/lib/types';
import { useHolocronStore } from '@/store/holocron-store';
import { ERA_BY_ID } from '@/data/eras';
import { PLANET_BY_ID } from '@/data/planets';
import { planetsOnSharedRoutes, routesForPlanet } from '@/data/hyperlanes';
import { creatureAvatarUrl } from '@/lib/avatars';
import { SmartImage } from '@/components/SmartImage';
import { PlanetHeader3D } from '@/components/galaxy/PlanetHeader3D';
import { CharacterPortrait } from '@/components/CharacterPortrait';

export function PlanetPanel() {
  const planetId = useHolocronStore((s) => s.selectedPlanetId);
  const eraId = useHolocronStore((s) => s.eraId);
  const close = useHolocronStore((s) => s.selectPlanet);
  const collapsed = useHolocronStore((s) => s.panelCollapsed);
  const togglePanel = useHolocronStore((s) => s.togglePanel);

  const [planet, setPlanet] = useState<Planet | undefined>();
  const [snapshot, setSnapshot] = useState<PlanetEraSnapshot | undefined>();
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [chars, setChars] = useState<Character[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!planetId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlanet(undefined);
      return;
    }
    (async () => {
      const data = await api.getPlanetByEra(planetId, eraId);
      if (cancelled) return;
      setPlanet(data?.planet);
      setSnapshot(data?.snapshot);
      const [cr, ch] = await Promise.all([
        api.listCreaturesByPlanet(planetId),
        api.listCharactersByPlanet(planetId),
      ]);
      if (cancelled) return;
      setCreatures(cr);
      setChars(ch);
    })();
    return () => {
      cancelled = true;
    };
  }, [planetId, eraId]);

  // Маршруты + соседи по маршрутам — синхронные вычисления из статических данных,
  // не требуют асинхронного API.
  const planetRoutes = useMemo(() => (planetId ? routesForPlanet(planetId) : []), [planetId]);
  const routeNeighbors = useMemo(
    () => (planetId ? planetsOnSharedRoutes(planetId) : []),
    [planetId],
  );

  return (
    <AnimatePresence mode="wait">
      {planet && collapsed && (
        <motion.button
          key="tab"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 60, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => togglePanel(false)}
          aria-label={`Развернуть панель планеты: ${planet.name}`}
          className="pointer-events-auto flex h-40 w-10 flex-col items-center justify-between rounded-l-lg border border-r-0 border-holo-edge/60 bg-holo-deep/80 py-3 backdrop-blur-md transition hover:border-holo-glow hover:bg-holo-deep/95"
        >
          <span className="font-mono text-xs text-holo-glow">❮</span>
          <span
            className="font-mono text-[10px] uppercase tracking-widest text-holo-bone"
            style={{ writingMode: 'vertical-rl' }}
          >
            {planet.name}
          </span>
          <span className="h-2 w-2 rounded-full bg-holo-glow animate-pulse-glow" />
        </motion.button>
      )}

      {planet && !collapsed && (
        <motion.aside
          key={`panel-${planet.id}`}
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 24, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="holo-panel scrollbar-holo pointer-events-auto flex h-full w-[400px] flex-col overflow-y-auto"
        >
          <div className="sticky top-0 z-10 h-48 flex-shrink-0 overflow-hidden border-b border-holo-edge/60 bg-gradient-to-b from-holo-void via-holo-deep to-holo-deep">
            <div className="absolute inset-0 flex items-center justify-center">
              {planet.imageUrl ? (
                <SmartImage
                  src={planet.imageUrl}
                  fallback={`https://api.dicebear.com/9.x/shapes/svg?seed=${planet.id}&size=160`}
                  alt={planet.name}
                  className="h-40 w-40 rounded-full object-cover"
                />
              ) : (
                <PlanetHeader3D planet={planet} size={170} />
              )}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-holo-deep/95 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-holo-glow">
                  {planet.region.replace('-', ' ')} · {planet.sector}
                </p>
                <h3 className="holo-title mt-1 text-lg">{planet.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => togglePanel(true)}
                  className="holo-button !px-2 !py-1 text-xs"
                  aria-label="Свернуть панель"
                  title="Свернуть"
                >
                  ❯
                </button>
                <button
                  onClick={() => close(null)}
                  className="holo-button !px-2 !py-1 text-xs"
                  aria-label="Закрыть панель"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-holo-edge/60 bg-holo-deep/40 px-4 py-3">
            <p className="text-xs leading-relaxed text-holo-bone/80">{planet.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="holo-chip">☀ {planet.climate}</span>
              <span className="holo-chip">⛰ {planet.terrain}</span>
            </div>
          </div>

          <section className="px-4 py-3">
            <h4 className="holo-title mb-2 text-[10px]">Эпоха: {ERA_BY_ID[eraId]?.shortName}</h4>
            {snapshot ? (
              <div className="rounded-md border border-holo-edge/50 bg-holo-deep/60 p-3">
                <p className="text-sm text-holo-crystal">{snapshot.ruler}</p>
                <p className="mt-1 text-xs text-holo-bone/60">
                  Фракция: <span className="text-holo-bone">{snapshot.faction}</span> · Население:{' '}
                  <span className="text-holo-bone">{snapshot.population}</span>
                </p>
                <p className="mt-2 text-xs leading-relaxed text-holo-bone/80">{snapshot.notes}</p>
              </div>
            ) : (
              <p className="text-xs italic text-holo-bone/50">
                Нет данных о планете в выбранную эпоху.
              </p>
            )}
          </section>

          <section className="px-4 py-3">
            <h4 className="holo-title mb-2 text-[10px]">Персонажи</h4>
            {chars.length ? (
              <ul className="space-y-1.5">
                {chars.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 rounded border border-holo-edge/40 bg-holo-deep/50 px-3 py-2"
                  >
                    {c.imageUrl ? (
                      <SmartImage
                        src={c.imageUrl}
                        fallback={`https://api.dicebear.com/9.x/adventurer/svg?seed=${c.id}`}
                        alt=""
                        loading="lazy"
                        className="h-10 w-10 flex-shrink-0 rounded-full border border-holo-edge/60 bg-holo-deep object-cover"
                      />
                    ) : (
                      <CharacterPortrait
                        characterId={c.id}
                        size={40}
                        className="h-10 w-10 flex-shrink-0 rounded-full border border-holo-edge/60"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-holo-bone">{c.name}</p>
                      <p className="truncate text-[11px] text-holo-bone/60">{c.species}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs italic text-holo-bone/50">Никого нет в записях.</p>
            )}
          </section>

          <section className="px-4 py-3">
            <h4 className="holo-title mb-2 text-[10px]">Бестиарий</h4>
            {creatures.length ? (
              <ul className="space-y-1.5">
                {creatures.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start gap-3 rounded border border-holo-edge/40 bg-holo-deep/50 px-3 py-2"
                  >
                    <SmartImage
                      src={c.imageUrl ?? creatureAvatarUrl(c.id)}
                      fallback={creatureAvatarUrl(c.id)}
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 flex-shrink-0 rounded-md border border-holo-edge/60 bg-holo-void/60 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm text-holo-bone">{c.name}</span>
                        <span className="holo-chip">{c.danger}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-holo-bone/60">
                        {c.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs italic text-holo-bone/50">Записей нет.</p>
            )}
          </section>

          <section className="mt-auto border-t border-holo-edge/60 bg-holo-deep/40 px-4 py-3">
            <h4 className="holo-title mb-2 text-[10px]">Гипермаршруты</h4>
            {planetRoutes.length ? (
              <ul className="space-y-3">
                {planetRoutes.map((route) => {
                  const neighborsOnRoute = routeNeighbors.filter((n) =>
                    n.routeIds.includes(route.id),
                  );
                  return (
                    <li key={route.id}>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-holo-glow">
                        ✵ {route.name}
                      </p>
                      {neighborsOnRoute.length ? (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {neighborsOnRoute.map((n) => {
                            const p = PLANET_BY_ID[n.planetId];
                            if (!p) return null;
                            return (
                              <button
                                key={n.planetId}
                                onClick={() => close(p.id)}
                                className="holo-chip hover:border-holo-glow hover:text-holo-crystal"
                                title={`Перейти к ${p.name}`}
                              >
                                {p.name}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-1 text-[11px] italic text-holo-bone/50">
                          Конечная станция маршрута.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs italic text-holo-bone/50">
                Нет зарегистрированных гипермаршрутов через эту систему.
              </p>
            )}
          </section>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
