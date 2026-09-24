/**
 * Канонические гипермаршруты галактики.
 *
 * Каждый маршрут — это цепочка планет: рёбра рисуются между соседними
 * элементами массива `planets`. Так карта превращается из «солнца»
 * (все линии из Корусанта) в реальную торговую паутину с несколькими
 * узлами (Корусант, Кашиик, Кореллия).
 *
 * Названия и последовательность максимально близки к канону Legends/Disney:
 * Corellian Run, Perlemian Trade Route, Hydian Way, Rimma Trade Route.
 * Некоторые маршруты — условные соединения, чтобы каждая планета имела
 * хотя бы одну связь.
 */

export interface HyperRoute {
  id: string;
  /** Короткое каноническое название на русском. */
  name: string;
  /** Планеты по порядку прохождения маршрута. Рёбра — между соседями. */
  planets: string[];
}

export const HYPER_ROUTES: HyperRoute[] = [
  {
    id: 'corellian-run',
    name: 'Кореллианский Пробег',
    planets: ['coruscant', 'corellia', 'hoth', 'dagobah', 'utapau', 'kamino'],
  },
  {
    id: 'perlemian',
    name: 'Перлемианский маршрут',
    planets: ['coruscant', 'ilum', 'dathomir'],
  },
  {
    id: 'hydian-way',
    name: 'Хайдиан-Уэй',
    planets: ['coruscant', 'mandalore', 'mygeeto'],
  },
  {
    id: 'rimma',
    name: 'Римма Трейд Раут',
    planets: ['coruscant', 'kashyyyk', 'mon-cala'],
  },
  {
    id: 'jungle-line',
    name: 'Джунглевая линия',
    planets: ['kashyyyk', 'felucia', 'mustafar', 'endor'],
  },
  {
    id: 'outer-arc',
    name: 'Внешняя дуга',
    planets: ['tatooine', 'naboo', 'ryloth', 'geonosis'],
  },
  {
    id: 'senate-line',
    name: 'Сенатская линия',
    planets: ['coruscant', 'naboo'],
  },
  {
    id: 'sith-secret',
    name: 'Тропа ситхов',
    planets: ['dathomir', 'exegol'],
  },
  {
    id: 'wild-passage',
    name: 'Дикий проход',
    planets: ['dantooine', 'christophsis'],
  },
];

/**
 * Все рёбра маршрутов как плоский массив пар планет.
 * Удобно для быстрой проверки соседства: `.some(e => e.a === X && e.b === Y)`.
 */
export interface HyperEdge {
  routeId: string;
  a: string;
  b: string;
}

export function collectHyperEdges(routes: HyperRoute[] = HYPER_ROUTES): HyperEdge[] {
  const edges: HyperEdge[] = [];
  for (const r of routes) {
    for (let i = 0; i < r.planets.length - 1; i++) {
      edges.push({ routeId: r.id, a: r.planets[i], b: r.planets[i + 1] });
    }
  }
  return edges;
}

/**
 * Маршруты, проходящие через указанную планету.
 * Порядок — как в HYPER_ROUTES.
 */
export function routesForPlanet(
  planetId: string,
  routes: HyperRoute[] = HYPER_ROUTES,
): HyperRoute[] {
  return routes.filter((r) => r.planets.includes(planetId));
}

/**
 * Соседи по торговым путям — все планеты, которые лежат на маршрутах,
 * проходящих через planetId. Сам planetId в выводе не появляется.
 *
 * Возвращает массив { planetId, routeIds } — чтобы UI могло показать,
 * по каким именно путям связаны две планеты.
 */
export interface RouteNeighbor {
  planetId: string;
  routeIds: string[];
}

export function planetsOnSharedRoutes(
  planetId: string,
  routes: HyperRoute[] = HYPER_ROUTES,
): RouteNeighbor[] {
  const found = new Map<string, Set<string>>();
  for (const r of routes) {
    if (!r.planets.includes(planetId)) continue;
    for (const p of r.planets) {
      if (p === planetId) continue;
      let set = found.get(p);
      if (!set) {
        set = new Set<string>();
        found.set(p, set);
      }
      set.add(r.id);
    }
  }
  return Array.from(found.entries()).map(([id, ids]) => ({
    planetId: id,
    routeIds: Array.from(ids),
  }));
}

/**
 * Карта id маршрута → весь объект. Удобно для UI, которое встречает routeIds как строки.
 */
export const HYPER_ROUTE_BY_ID: Record<string, HyperRoute> = HYPER_ROUTES.reduce(
  (acc, r) => ({ ...acc, [r.id]: r }),
  {} as Record<string, HyperRoute>,
);
