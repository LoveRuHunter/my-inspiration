import { create } from 'zustand';

const STORAGE_KEY = 'holocron:audio:v2';

interface Persisted {
  volume: number;
  muted: boolean;
  playing: boolean;
}

const DEFAULT: Persisted = { volume: 0.55, muted: false, playing: true };

function loadPersisted(): Persisted {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      volume: typeof parsed.volume === 'number' ? parsed.volume : DEFAULT.volume,
      muted: !!parsed.muted,
      playing: parsed.playing !== false,
    };
  } catch {
    return DEFAULT;
  }
}

function savePersisted(p: Persisted): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export interface AudioState {
  playing: boolean;
  volume: number;
  muted: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
}

const persisted = loadPersisted();

export const useAudioStore = create<AudioState>((set, get) => ({
  playing: persisted.playing,
  volume: persisted.volume,
  muted: persisted.muted,
  play: () => {
    set({ playing: true });
    savePersisted({ volume: get().volume, muted: get().muted, playing: true });
  },
  pause: () => {
    set({ playing: false });
    savePersisted({ volume: get().volume, muted: get().muted, playing: false });
  },
  toggle: () => {
    const next = !get().playing;
    set({ playing: next });
    savePersisted({ volume: get().volume, muted: get().muted, playing: next });
  },
  setVolume: (v) => {
    const volume = Math.max(0, Math.min(1, v));
    set({ volume });
    savePersisted({ volume, muted: get().muted, playing: get().playing });
  },
  setMuted: (muted) => {
    set({ muted });
    savePersisted({ volume: get().volume, muted, playing: get().playing });
  },
}));
