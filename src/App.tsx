import { GalaxyMap } from '@/components/galaxy/GalaxyMap';
import { TopBar } from '@/components/TopBar';
import { Timeline } from '@/components/Timeline';
import { TimelineEvents } from '@/components/TimelineEvents';
import { PlanetPanel } from '@/components/panels/PlanetPanel';
import { Bestiary } from '@/components/bestiary/Bestiary';
import { CharacterGraph } from '@/components/CharacterGraph';
import { AIGuide } from '@/components/ai/AIGuide';
import { useHolocronStore } from '@/store/holocron-store';
import { useUrlSync } from '@/hooks/use-url-sync';

function App() {
  useUrlSync();
  const view = useHolocronStore((s) => s.view);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <TopBar />

      <main className="relative flex-1 overflow-hidden">
        {view === 'map' && (
          <div className="flex h-full">
            <div className="relative flex-1">
              <GalaxyMap />

              <div className="pointer-events-none absolute bottom-4 left-4 flex items-end gap-3">
                <div className="pointer-events-auto w-full max-w-[520px]">
                  <Timeline />
                </div>
                <div className="pointer-events-auto hidden w-[340px] md:block">
                  <TimelineEvents />
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute right-4 top-4 z-30 h-[calc(100%-2rem)]">
              <PlanetPanel />
            </div>
          </div>
        )}

        {view === 'bestiary' && <Bestiary />}
        {view === 'graph' && <CharacterGraph />}

        <AIGuide />
      </main>

      <footer className="border-t border-holo-edge/60 bg-holo-deep/50 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-holo-bone/40">
        Holocron Terminal · v0.1 · read-only archive interface
      </footer>
    </div>
  );
}

export default App;
