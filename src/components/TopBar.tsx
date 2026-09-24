import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useHolocronStore } from '@/store/holocron-store';
import { AudioController } from '@/components/AudioController';

const VIEWS = [
  { id: 'map', label: 'Карта Галактики' },
  { id: 'bestiary', label: 'Бестиарий' },
  { id: 'graph', label: 'Граф связей' },
] as const;

export function TopBar() {
  const view = useHolocronStore((s) => s.view);
  const setView = useHolocronStore((s) => s.setView);
  const toggleAi = useHolocronStore((s) => s.toggleAi);
  const aiOpen = useHolocronStore((s) => s.aiOpen);

  return (
    <header className="relative z-20 flex items-center justify-between border-b border-holo-edge/60 bg-holo-deep/70 px-6 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative h-9 w-9"
        >
          <div className="absolute inset-0 rounded-full bg-holo-blue/40 blur-md" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full border border-holo-glow/60 bg-holo-deep">
            <span className="font-display text-sm text-holo-crystal">H</span>
          </div>
        </motion.div>
        <div>
          <h1 className="holo-title text-sm">Interactive Holocron</h1>
          <p className="text-xs text-holo-bone/60">Архив Галактики · интерактивный доступ</p>
        </div>
      </div>

      <nav className="flex items-center gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            className={cn('holo-button')}
            data-active={view === v.id}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <AudioController />
        <button
          className="holo-button"
          data-active={aiOpen}
          onClick={() => toggleAi()}
          aria-label="Открыть AI-гид"
        >
          <span className="h-2 w-2 rounded-full bg-holo-glow animate-pulse-glow" />
          AI-гид
        </button>
      </div>
    </header>
  );
}
