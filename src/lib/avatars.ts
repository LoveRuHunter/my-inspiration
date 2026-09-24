/**
 * Аватары персонажей и существ.
 *
 * DiceBear (open-source, CC0, без API-ключа). Для каждого канонического
 * героя настроен свой стиль + палитра, привязанная к фракции и
 * визуальным признакам (цвет волос, фон, «броневой» вид для мандалорцев).
 *
 * У каждого персонажа/существа/планеты в data-файле можно проставить
 * поле `imageUrl` — если оно задано, используется оно, а не DiceBear.
 */

export type AvatarStyle =
  | 'adventurer'
  | 'adventurer-neutral'
  | 'personas'
  | 'lorelei'
  | 'notionists'
  | 'micah'
  | 'bottts'
  | 'bottts-neutral'
  | 'pixel-art'
  | 'shapes';

interface CharacterConfig {
  style: AvatarStyle;
  seed?: string;
  backgroundColor: string; // без '#'
  hairColor?: string; // без '#', для стилей adventurer/lorelei/micah
  skinColor?: string;
  eyeColor?: string;
  flip?: boolean;
}

interface AvatarOptions {
  style?: AvatarStyle;
  size?: number;
  backgroundColor?: string;
}

/**
 * Палитра по фракциям — фон аватара.
 * jedi/republic — светло-синий, empire/sith — тёмно-багровый,
 * rebellion — оранжевый, mandalorian — сталь, hutt — болотный, и т.д.
 */
const FACTION_BG = {
  jedi: '1a3a52',
  republic: '1a3a52',
  empire: '3a0f0f',
  sith: '2a0808',
  rebellion: '5a2a0a',
  resistance: '5a2a0a',
  mandalorian: '2a3540',
  hutt: '2a3a1a',
  independent: '1a1f2e',
} as const;

/**
 * Точечные настройки — стиль, seed, цвет волос, фон под фракцию.
 * seed чуть модифицируем, чтобы принудительно получить разные лица там,
 * где DiceBear иначе выдаст одинаковых «братьев».
 */
const CHARACTER_CONFIG: Record<string, CharacterConfig> = {
  // === Джедаи и Республика ===
  anakin: {
    style: 'adventurer',
    seed: 'anakin-skywalker-v3',
    hairColor: '3a1f10',
    skinColor: 'f2d3b1',
    backgroundColor: FACTION_BG.jedi,
  },
  'obi-wan': {
    style: 'adventurer',
    seed: 'obi-wan-kenobi-v2',
    hairColor: '8a6b3e',
    skinColor: 'f2d3b1',
    backgroundColor: FACTION_BG.jedi,
  },
  yoda: {
    style: 'lorelei',
    seed: 'grand-master-yoda',
    backgroundColor: '2a4a2a',
  },
  mace: {
    style: 'adventurer',
    seed: 'mace-windu-master',
    hairColor: '111111',
    skinColor: '6b3a1e',
    backgroundColor: '4a1a5a',
  },
  luke: {
    style: 'adventurer',
    seed: 'luke-skywalker-hero',
    hairColor: 'c39a5c',
    skinColor: 'f4d9b4',
    backgroundColor: FACTION_BG.rebellion,
  },
  leia: {
    style: 'adventurer',
    seed: 'leia-organa-princess',
    hairColor: '2a1810',
    skinColor: 'f2d3b1',
    backgroundColor: 'f5f5ee',
    flip: true,
  },
  padme: {
    style: 'adventurer',
    seed: 'padme-amidala-queen',
    hairColor: '2a1810',
    skinColor: 'f5dcbe',
    backgroundColor: '5a2a5a',
  },

  // === Империя и ситхи ===
  palpatine: {
    style: 'adventurer',
    seed: 'sheev-palpatine-sith',
    hairColor: 'aaaaaa',
    skinColor: 'e8d4b8',
    backgroundColor: FACTION_BG.sith,
  },

  // === Мандалорцы — стиль bottts, вид «в шлеме» ===
  'bo-katan': {
    style: 'adventurer',
    seed: 'bo-katan-kryze',
    hairColor: 'a8542a',
    skinColor: 'f4d9b4',
    backgroundColor: FACTION_BG.mandalorian,
  },
  sabine: {
    style: 'adventurer',
    seed: 'sabine-wren-artist',
    hairColor: 'a44dd6',
    skinColor: 'f2d3b1',
    backgroundColor: '3a1a4a',
  },
  'din-djarin': {
    style: 'bottts',
    seed: 'mandalorian-mando',
    backgroundColor: FACTION_BG.mandalorian,
  },

  // === Повстанцы / контрабандисты ===
  han: {
    style: 'adventurer',
    seed: 'han-solo-smuggler',
    hairColor: '3a2510',
    skinColor: 'f4d9b4',
    backgroundColor: FACTION_BG.rebellion,
  },
  chewbacca: {
    style: 'bottts',
    seed: 'chewbacca-wookiee-warrior',
    backgroundColor: '4a2a1a',
  },

  // === Хатты и прочие ===
  jabba: {
    style: 'bottts-neutral',
    seed: 'jabba-the-hutt-crimeboss',
    backgroundColor: FACTION_BG.hutt,
  },
  'jar-jar': {
    style: 'lorelei',
    seed: 'jar-jar-binks-gungan',
    backgroundColor: '1a4a5a',
  },
};

const DEFAULT_CONFIG: CharacterConfig = {
  style: 'adventurer',
  backgroundColor: FACTION_BG.independent,
};

const DEFAULTS = {
  size: 128,
};

function buildUrl(config: CharacterConfig, defaultSeed: string, size: number): string {
  const params = new URLSearchParams({
    seed: config.seed ?? defaultSeed,
    size: String(size),
    backgroundColor: config.backgroundColor,
    backgroundType: 'solid',
    radius: '50',
  });
  if (config.hairColor) params.append('hairColor', config.hairColor);
  if (config.skinColor) params.append('skinColor', config.skinColor);
  if (config.eyeColor) params.append('eyesColor', config.eyeColor);
  if (config.flip) params.append('flip', 'true');
  return `https://api.dicebear.com/9.x/${config.style}/svg?${params.toString()}`;
}

export function characterAvatarUrl(id: string, opts: AvatarOptions = {}): string {
  const cfg = CHARACTER_CONFIG[id] ?? DEFAULT_CONFIG;
  const finalCfg: CharacterConfig = {
    ...cfg,
    style: opts.style ?? cfg.style,
    backgroundColor: opts.backgroundColor ?? cfg.backgroundColor,
  };
  return buildUrl(finalCfg, id, opts.size ?? DEFAULTS.size);
}

export function creatureAvatarUrl(id: string, opts: AvatarOptions = {}): string {
  const cfg: CharacterConfig = {
    style: opts.style ?? 'shapes',
    seed: `creature-${id}`,
    backgroundColor: opts.backgroundColor ?? '060b1c',
  };
  return buildUrl(cfg, `creature-${id}`, opts.size ?? DEFAULTS.size);
}

/**
 * Универсальный резолвер: если у сущности есть свой imageUrl — использует его,
 * иначе генерирует аватар DiceBear.
 */
export function resolveImage(
  entity: { id: string; imageUrl?: string | null },
  fallback: (id: string) => string,
): { primary: string; fallback: string } {
  return {
    primary: entity.imageUrl && entity.imageUrl.length > 0 ? entity.imageUrl : fallback(entity.id),
    fallback: fallback(entity.id),
  };
}
