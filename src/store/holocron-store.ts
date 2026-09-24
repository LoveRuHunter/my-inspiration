import { create } from 'zustand';
import type { EraId } from '@/lib/types';
import { readUrlState, writeUrlState } from '@/lib/url-state';

export type HolocronView = 'map' | 'bestiary' | 'graph';

export interface HolocronState {
  eraId: EraId;
  selectedPlanetId: string | null;
  view: HolocronView;
  aiOpen: boolean;
  /** Панель планеты свёрнута в боковую вкладку. Не в URL — только в текущей сессии. */
  panelCollapsed: boolean;

  setEra: (era: EraId) => void;
  selectPlanet: (planetId: string | null) => void;
  setView: (view: HolocronView) => void;
  toggleAi: (open?: boolean) => void;
  togglePanel: (collapsed?: boolean) => void;
  hydrateFromUrl: () => void;
}

const DEFAULT_ERA: EraId = 'clone-wars';

function initialFromUrl(): {
  eraId: EraId;
  selectedPlanetId: string | null;
  view: HolocronView;
} {
  if (typeof window === 'undefined') {
    return { eraId: DEFAULT_ERA, selectedPlanetId: null, view: 'map' };
  }
  const url = readUrlState();
  return {
    eraId: url.era ?? DEFAULT_ERA,
    selectedPlanetId: url.planetId,
    view: url.view,
  };
}

function sync(state: HolocronState) {
  if (typeof window === 'undefined') return;
  writeUrlState({
    era: state.eraId,
    planetId: state.selectedPlanetId,
    view: state.view,
  });
}

export const useHolocronStore = create<HolocronState>((set, get) => ({
  ...initialFromUrl(),
  aiOpen: false,
  panelCollapsed: false,

  setEra: (era) => {
    set({ eraId: era });
    sync(get());
  },
  selectPlanet: (planetId) => {
    // При выборе новой планеты автоматически раскрываем панель.
    set({ selectedPlanetId: planetId, panelCollapsed: planetId ? false : get().panelCollapsed });
    sync(get());
  },
  setView: (view) => {
    set({ view });
    sync(get());
  },
  toggleAi: (open) => {
    set((s) => ({ aiOpen: open ?? !s.aiOpen }));
  },
  togglePanel: (collapsed) => {
    set((s) => ({ panelCollapsed: collapsed ?? !s.panelCollapsed }));
  },
  hydrateFromUrl: () => {
    const url = readUrlState();
    set({
      eraId: url.era ?? DEFAULT_ERA,
      selectedPlanetId: url.planetId,
      view: url.view,
    });
  },
}));
