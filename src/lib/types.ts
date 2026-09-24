/**
 * Доменные типы Holocron.
 * Модель описана нейтрально, чтобы позже подключить
 * Drizzle + Postgres/PostGIS и Neo4j для графа связей.
 */

export type EraId =
  'old-republic' | 'high-republic' | 'clone-wars' | 'empire' | 'new-republic' | 'first-order';

export interface Era {
  id: EraId;
  name: string;
  shortName: string;
  years: string;
  ruling: string;
  accent: string;
}

export type Faction =
  | 'republic'
  | 'separatists'
  | 'empire'
  | 'rebellion'
  | 'first-order'
  | 'resistance'
  | 'jedi'
  | 'sith'
  | 'mandalorian'
  | 'hutt'
  | 'independent';

export type Danger = 'low' | 'medium' | 'high' | 'extreme';

export type Habitat =
  'urban' | 'desert' | 'forest' | 'ice' | 'ocean' | 'volcanic' | 'swamp' | 'space';

/**
 * Положение планеты в 3D-пространстве галактики.
 * В реальной БД это будет PostGIS geometry(PointZ, <SRID>).
 */
export interface GalaxyPosition {
  x: number;
  y: number;
  z: number;
}

export interface PlanetEraSnapshot {
  eraId: EraId;
  ruler: string;
  faction: Faction;
  population: string;
  notes: string;
}

export type Region =
  'core' | 'colonies' | 'inner-rim' | 'expansion' | 'mid-rim' | 'outer-rim' | 'unknown';

export interface Planet {
  id: string;
  name: string;
  sector: string;
  region: Region;
  climate: string;
  terrain: string;
  position: GalaxyPosition;
  description: string;
  eras: PlanetEraSnapshot[];
  creatureIds: string[];
  characterIds: string[];
  /** Опциональная ссылка на изображение планеты. Если пусто — рисуется процедурно. */
  imageUrl?: string;
  /**
   * Опциональная 2K-текстура для 3D-сферы (равнопрямоугольная проекция).
   * Если задана — используется вместо процедурной. Файлы кладутся в `public/textures/`.
   */
  textureUrl?: string;
  /** Идентификатор планеты в API swapi.tech для подтягивания реальных данных. */
  swapiId?: number;
}

export interface SwapiPlanetData {
  name: string;
  population: string;
  diameter: string;
  rotation_period: string;
  orbital_period: string;
  gravity: string;
  climate: string;
  terrain: string;
  surface_water: string;
}

export interface Creature {
  id: string;
  name: string;
  species: string;
  habitat: Habitat;
  danger: Danger;
  eras: EraId[];
  planetIds: string[];
  description: string;
  /** Опциональная картинка. Если пусто — генерируется DiceBear-аватар. */
  imageUrl?: string;
}

export type RelationKind =
  'father' | 'mother' | 'child' | 'sibling' | 'apprentice' | 'master' | 'killed' | 'ally' | 'rival';

export interface CharacterRelation {
  targetId: string;
  kind: RelationKind;
}

export interface Character {
  id: string;
  name: string;
  species: string;
  affiliation: Faction[];
  eras: EraId[];
  homePlanetId?: string;
  quote?: string;
  bio: string;
  relations: CharacterRelation[];
  /** Опциональная картинка. Если пусто — генерируется DiceBear-аватар. */
  imageUrl?: string;
}

export interface TimelineEvent {
  id: string;
  eraId: EraId;
  year: string;
  title: string;
  planetIds: string[];
  characterIds: string[];
  summary: string;
}
