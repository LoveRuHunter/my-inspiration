import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { TimelineEvent } from '@/lib/types';
import { useHolocronStore } from '@/store/holocron-store';

export function TimelineEvents() {
  const eraId = useHolocronStore((s) => s.eraId);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await api.listTimelineByEra(eraId);
      if (!cancelled) setEvents(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [eraId]);

  const scrollable = events.length > 3;

  return (
    <div className="holo-panel p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="holo-title text-xs">Ключевые события эпохи</h2>
        {scrollable && (
          <span className="font-mono text-[10px] text-holo-bone/40">{events.length}</span>
        )}
      </div>
      <AnimatePresence mode="popLayout">
        {events.length === 0 && (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs italic text-holo-bone/50"
          >
            В архиве нет задокументированных событий этой эпохи.
          </motion.p>
        )}
        {/* Скролл — когда событий больше трёх. Высота выбрана так, чтобы влезало ~3 карточки,
            а остальные прокручивались колёсиком. */}
        <ul
          className={
            scrollable ? 'scrollbar-holo max-h-[228px] space-y-2 overflow-y-auto pr-2' : 'space-y-2'
          }
        >
          {events.map((e) => (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="border-l-2 border-holo-glow/50 pl-3"
            >
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-holo-crystal">{e.title}</p>
                <span className="font-mono text-[10px] text-holo-bone/50">{e.year}</span>
              </div>
              <p className="mt-0.5 text-xs text-holo-bone/70">{e.summary}</p>
            </motion.li>
          ))}
        </ul>
      </AnimatePresence>
    </div>
  );
}
