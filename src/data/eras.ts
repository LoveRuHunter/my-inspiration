import type { Era } from '@/lib/types';

export const ERAS: Era[] = [
  {
    id: 'old-republic',
    name: 'Эра Старой Республики',
    shortName: 'Old Republic',
    years: '25 000 – 1 000 ДБЯ',
    ruling: 'Галактическая Республика, Орден джедаев',
    accent: '#6ea8ff',
  },
  {
    id: 'high-republic',
    name: 'Эра Высшей Республики',
    shortName: 'High Republic',
    years: '500 – 100 ДБЯ',
    ruling: 'Высшая Республика, расцвет джедаев',
    accent: '#a5c8ff',
  },
  {
    id: 'clone-wars',
    name: 'Войны клонов',
    shortName: 'Clone Wars',
    years: '22 – 19 ДБЯ',
    ruling: 'Республика vs КНС',
    accent: '#7c9cff',
  },
  {
    id: 'empire',
    name: 'Эпоха Империи',
    shortName: 'Empire',
    years: '19 ДБЯ – 4 ПБЯ',
    ruling: 'Галактическая Империя',
    accent: '#4c68b0',
  },
  {
    id: 'new-republic',
    name: 'Новая Республика',
    shortName: 'New Republic',
    years: '4 – 28 ПБЯ',
    ruling: 'Новая Республика, Новый Орден джедаев',
    accent: '#8fb6ff',
  },
  {
    id: 'first-order',
    name: 'Эпоха Первого Ордена',
    shortName: 'First Order',
    years: '28 – 35 ПБЯ',
    ruling: 'Первый Орден vs Сопротивление',
    accent: '#c1d5ff',
  },
];

export const ERA_BY_ID: Record<string, Era> = Object.fromEntries(ERAS.map((e) => [e.id, e]));
