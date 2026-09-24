import type { EraId } from './types';

const ERA_IDS: EraId[] = [
  'old-republic',
  'high-republic',
  'clone-wars',
  'empire',
  'new-republic',
  'first-order',
];

export function isEraId(value: string | null): value is EraId {
  return value != null && (ERA_IDS as string[]).includes(value);
}

export interface HolocronUrlState {
  era: EraId | null;
  planetId: string | null;
  view: 'map' | 'bestiary' | 'graph';
}

export function readUrlState(search: string = window.location.search): HolocronUrlState {
  const params = new URLSearchParams(search);
  const era = params.get('era');
  const view = params.get('view');
  return {
    era: isEraId(era) ? era : null,
    planetId: params.get('planet'),
    view: view === 'bestiary' || view === 'graph' ? view : 'map',
  };
}

export function writeUrlState(state: HolocronUrlState): void {
  const params = new URLSearchParams();
  if (state.era) params.set('era', state.era);
  if (state.planetId) params.set('planet', state.planetId);
  if (state.view !== 'map') params.set('view', state.view);
  const q = params.toString();
  const next = `${window.location.pathname}${q ? `?${q}` : ''}`;
  window.history.replaceState(null, '', next);
}
