import { beforeEach, describe, expect, it } from 'vitest';
import { useHolocronStore } from './holocron-store';

describe('holocron store', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    useHolocronStore.setState({
      eraId: 'clone-wars',
      selectedPlanetId: null,
      view: 'map',
      aiOpen: false,
    });
  });

  it('переключает эпоху и пишет её в URL', () => {
    useHolocronStore.getState().setEra('empire');
    expect(useHolocronStore.getState().eraId).toBe('empire');
    expect(window.location.search).toContain('era=empire');
  });

  it('выбирает планету и синхронизирует URL', () => {
    useHolocronStore.getState().selectPlanet('tatooine');
    expect(useHolocronStore.getState().selectedPlanetId).toBe('tatooine');
    expect(window.location.search).toContain('planet=tatooine');
  });

  it('переключает вид и удаляет параметр view=map из URL', () => {
    useHolocronStore.getState().setView('bestiary');
    expect(window.location.search).toContain('view=bestiary');
    useHolocronStore.getState().setView('map');
    expect(window.location.search).not.toContain('view=');
  });

  it('тумблер AI-гида работает без аргумента', () => {
    useHolocronStore.getState().toggleAi();
    expect(useHolocronStore.getState().aiOpen).toBe(true);
    useHolocronStore.getState().toggleAi();
    expect(useHolocronStore.getState().aiOpen).toBe(false);
  });
});
