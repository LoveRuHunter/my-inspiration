import { cn } from '@/lib/cn';
import { ERAS } from '@/data/eras';
import { useHolocronStore } from '@/store/holocron-store';

export function Timeline() {
  const eraId = useHolocronStore((s) => s.eraId);
  const setEra = useHolocronStore((s) => s.setEra);

  return (
    <div className="holo-panel px-4 py-3">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="holo-title text-xs">Таймлайн эпох</h2>
        <span className="font-mono text-[10px] text-holo-bone/50">
          {ERAS.find((e) => e.id === eraId)?.years}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {ERAS.map((era) => {
          const active = era.id === eraId;
          return (
            <button
              key={era.id}
              onClick={() => setEra(era.id)}
              className="group flex items-center gap-1.5"
              aria-pressed={active}
            >
              <span
                className={cn(
                  'block h-2.5 w-2.5 rounded-full border transition-colors',
                  active
                    ? 'border-holo-glow bg-holo-glow shadow-holo-strong'
                    : 'border-holo-edge bg-holo-deep group-hover:border-holo-glow',
                )}
                style={active ? { backgroundColor: era.accent } : undefined}
              />
              <span
                className={cn(
                  'font-mono text-[10px] uppercase tracking-wider transition-colors',
                  active ? 'text-holo-crystal' : 'text-holo-bone/50 group-hover:text-holo-bone',
                )}
              >
                {era.shortName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
