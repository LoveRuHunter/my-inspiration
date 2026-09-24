import { describe, expect, it } from 'vitest';
import { isEraId, readUrlState, writeUrlState } from './url-state';

describe('url-state', () => {
  it('распознаёт валидные эпохи', () => {
    expect(isEraId('empire')).toBe(true);
    expect(isEraId('nope')).toBe(false);
    expect(isEraId(null)).toBe(false);
  });

  it('читает состояние из строки запроса', () => {
    const s = readUrlState('?era=empire&planet=tatooine&view=bestiary');
    expect(s).toEqual({ era: 'empire', planetId: 'tatooine', view: 'bestiary' });
  });

  it('падает на view=map по умолчанию', () => {
    const s = readUrlState('?era=empire');
    expect(s.view).toBe('map');
  });

  it('пишет состояние в history без параметра view=map', () => {
    writeUrlState({ era: 'empire', planetId: 'tatooine', view: 'map' });
    expect(window.location.search).toContain('era=empire');
    expect(window.location.search).toContain('planet=tatooine');
    expect(window.location.search).not.toContain('view=');
  });
});
