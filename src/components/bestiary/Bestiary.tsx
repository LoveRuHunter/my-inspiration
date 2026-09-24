import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { api } from '@/lib/api';
import type { Creature, Danger, Habitat } from '@/lib/types';
import { useHolocronStore } from '@/store/holocron-store';
import { creatureAvatarUrl } from '@/lib/avatars';
import { SmartImage } from '@/components/SmartImage';

const HABITATS: Habitat[] = [
  'urban',
  'desert',
  'forest',
  'ice',
  'ocean',
  'volcanic',
  'swamp',
  'space',
];
const DANGERS: Danger[] = ['low', 'medium', 'high', 'extreme'];

const DANGER_COLOR: Record<Danger, string> = {
  low: 'border-emerald-400/40 text-emerald-300',
  medium: 'border-amber-400/40 text-amber-300',
  high: 'border-orange-400/40 text-orange-300',
  extreme: 'border-rose-400/40 text-rose-300',
};

export function Bestiary() {
  const eraId = useHolocronStore((s) => s.eraId);
  const [habitat, setHabitat] = useState<Habitat | null>(null);
  const [danger, setDanger] = useState<Danger | null>(null);
  const [items, setItems] = useState<Creature[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await api.listCreatures({
        eraId,
        habitat: habitat ?? undefined,
        danger: danger ?? undefined,
      });
      if (!cancelled) setItems(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [eraId, habitat, danger]);

  const filtered = useMemo(() => items, [items]);

  return (
    <div className="scrollbar-holo h-full overflow-y-auto px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h2 className="holo-title text-lg">Бестиарий Галактики</h2>
          <p className="mt-1 text-sm text-holo-bone/60">
            Существа, задокументированные во вселенной. Фильтры: эпоха, среда обитания, уровень
            опасности.
          </p>
        </div>

        <div className="holo-panel mb-6 flex flex-wrap gap-3 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[10px] uppercase text-holo-bone/60">Среда:</span>
            <button
              className="holo-button !px-2 !py-1 !text-xs"
              data-active={habitat === null}
              onClick={() => setHabitat(null)}
            >
              все
            </button>
            {HABITATS.map((h) => (
              <button
                key={h}
                className="holo-button !px-2 !py-1 !text-xs"
                data-active={habitat === h}
                onClick={() => setHabitat(h)}
              >
                {h}
              </button>
            ))}
          </div>
          <div className="mx-3 h-6 w-px bg-holo-edge/60" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[10px] uppercase text-holo-bone/60">
              Опасность:
            </span>
            <button
              className="holo-button !px-2 !py-1 !text-xs"
              data-active={danger === null}
              onClick={() => setDanger(null)}
            >
              все
            </button>
            {DANGERS.map((d) => (
              <button
                key={d}
                className="holo-button !px-2 !py-1 !text-xs"
                data-active={danger === d}
                onClick={() => setDanger(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <motion.ul layout className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <motion.li
              layout
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="holo-panel p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SmartImage
                    src={c.imageUrl ?? creatureAvatarUrl(c.id)}
                    fallback={creatureAvatarUrl(c.id)}
                    alt=""
                    loading="lazy"
                    className="h-14 w-14 flex-shrink-0 rounded-md border border-holo-edge/60 bg-holo-void/60 object-cover"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-holo-crystal">{c.name}</h3>
                    <p className="text-[11px] text-holo-bone/60">{c.species}</p>
                  </div>
                </div>
                <span className={cn('holo-chip !text-[10px] uppercase', DANGER_COLOR[c.danger])}>
                  {c.danger}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-holo-bone/80">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="holo-chip">среда: {c.habitat}</span>
                {c.planetIds.map((p) => (
                  <span key={p} className="holo-chip">
                    {p}
                  </span>
                ))}
              </div>
            </motion.li>
          ))}
        </motion.ul>

        {filtered.length === 0 && (
          <div className="holo-panel p-8 text-center text-sm text-holo-bone/60">
            В выбранной эпохе не задокументировано ни одной особи под эти фильтры.
          </div>
        )}
      </div>
    </div>
  );
}
