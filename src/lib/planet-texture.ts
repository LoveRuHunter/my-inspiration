/**
 * Процедурные текстуры планет через <canvas> → THREE.CanvasTexture.
 *
 * Никаких внешних файлов: генерируем узнаваемые «biome-текстуры»
 * (пустыня, лёд, лес, океан, вулкан, город, болото, каменистая пустошь)
 * прямо в памяти. Кэшируем по planetId, чтобы не пересчитывать.
 */

import * as THREE from 'three';

export type PlanetBiome =
  'urban' | 'desert' | 'ice' | 'forest' | 'ocean' | 'volcanic' | 'swamp' | 'rocky' | 'gas';

const cache = new Map<string, THREE.CanvasTexture>();

/**
 * Быстрое хеширование id для seed'а PRNG.
 */
function seededRng(seed: string): () => number {
  let s = 0;
  for (let i = 0; i < seed.length; i++) {
    s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/**
 * Value noise 2D — плавный «шум» для текстур.
 * Не идеальный Perlin, но для декоративных карт работает.
 */
function makeNoise2D(seed: string) {
  const rnd = seededRng(seed);
  const grid = 64;
  const data: number[] = [];
  for (let i = 0; i < grid * grid; i++) data.push(rnd());

  function sample(x: number, y: number): number {
    // Оборачиваем по X — чтобы шов на UV-развёртке был бесшовным
    x = ((x % grid) + grid) % grid;
    y = Math.max(0, Math.min(grid - 1, y));
    const x0 = Math.floor(x);
    const x1 = (x0 + 1) % grid;
    const y0 = Math.floor(y);
    const y1 = Math.min(grid - 1, y0 + 1);
    const sx = x - x0;
    const sy = y - y0;
    const a = data[y0 * grid + x0];
    const b = data[y0 * grid + x1];
    const c = data[y1 * grid + x0];
    const d = data[y1 * grid + x1];
    const u = sx * sx * (3 - 2 * sx);
    const v = sy * sy * (3 - 2 * sy);
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  }

  function fbm(x: number, y: number, octaves = 4): number {
    let sum = 0;
    let amp = 0.5;
    let freq = 1;
    let norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * sample(x * freq, y * freq);
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return sum / norm;
  }

  return { sample, fbm };
}

interface BiomePalette {
  low: [number, number, number];
  mid: [number, number, number];
  high: [number, number, number];
  accent?: [number, number, number];
}

/**
 * Персональные палитры для планет, которые не вписываются в общую биомную палитру
 * или должны выглядеть канонично. Приоритет над BIOME_PALETTE.
 */
const PLANET_PALETTE_OVERRIDE: Record<string, BiomePalette> = {
  // Hoth — чистый голубоватый лёд, видные тёмные трещины и скальные выходы.
  hoth: {
    low: [170, 195, 225],
    mid: [220, 235, 250],
    high: [255, 255, 255],
    accent: [40, 60, 90],
  },
  // Mandalore — каменистая пустошь, стально-серые моря, светлые возвышенности.
  mandalore: {
    low: [85, 90, 105],
    mid: [135, 145, 165],
    high: [210, 215, 230],
    accent: [50, 75, 115],
  },
  // Dagobah — тёмные болота, но заметные материки и чёрная вода трясины.
  dagobah: {
    low: [40, 55, 35],
    mid: [80, 110, 55],
    high: [140, 165, 85],
    accent: [15, 25, 30],
  },
};

const BIOME_PALETTE: Record<PlanetBiome, BiomePalette> = {
  urban: {
    low: [40, 45, 65],
    mid: [90, 105, 135],
    high: [200, 220, 255],
    accent: [255, 200, 80], // огни города
  },
  desert: {
    low: [140, 90, 45],
    mid: [200, 150, 80],
    high: [235, 200, 140],
    accent: [95, 55, 30], // тёмные каньоны, выходы скальной породы
  },
  ice: {
    low: [140, 175, 220],
    mid: [200, 225, 250],
    high: [255, 255, 255],
    accent: [60, 80, 110], // трещины, обнажения темной породы
  },
  forest: {
    low: [30, 60, 30],
    mid: [55, 105, 50],
    high: [150, 180, 90],
    accent: [25, 55, 80], // реки/озёра между материками
  },
  ocean: {
    low: [10, 40, 90],
    mid: [40, 100, 160],
    high: [140, 200, 220],
    accent: [90, 140, 80], // острова
  },
  volcanic: {
    low: [30, 15, 10],
    mid: [90, 40, 25],
    high: [220, 90, 30],
    accent: [255, 180, 40],
  },
  swamp: {
    low: [30, 40, 25],
    mid: [65, 80, 40],
    high: [110, 130, 70],
    accent: [20, 30, 40], // тёмная вода трясины
  },
  rocky: {
    low: [60, 55, 50],
    mid: [120, 110, 100],
    high: [200, 190, 180],
    accent: [70, 90, 130], // металлические моря/впадины
  },
  gas: {
    low: [90, 80, 50],
    mid: [180, 145, 80],
    high: [235, 210, 155],
  },
};

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function colorFor(v: number, palette: BiomePalette): [number, number, number] {
  if (v < 0.5) return lerpColor(palette.low, palette.mid, v * 2);
  return lerpColor(palette.mid, palette.high, (v - 0.5) * 2);
}

interface GenerateOptions {
  planetId: string;
  biome: PlanetBiome;
  width?: number;
  height?: number;
}

/**
 * Генерирует текстуру-карту сферы. Учёт того, что на полюсах пиксели
 * растягиваются: используем y-искажение sin, чтобы полосы шли ровно
 * по параллелям, а не сжимались у полюсов.
 */
export function generatePlanetTexture({
  planetId,
  biome,
  width = 512,
  height = 256,
}: GenerateOptions): THREE.CanvasTexture {
  const cacheKey = `${planetId}:${biome}:${width}x${height}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const noise = makeNoise2D(planetId);
  const noise2 = makeNoise2D(planetId + ':detail');
  const continentNoise = makeNoise2D(planetId + ':continents');
  // Персональные палитры — если планета входит в override, берём её, иначе — базовую биомную.
  // Так Hoth/Mandalore/Dagobah получают узнаваемый канонический окрас.
  const palette = PLANET_PALETTE_OVERRIDE[planetId] ?? BIOME_PALETTE[biome];

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = v * Math.PI; // 0..π
    const latFactor = Math.sin(lat); // «сжатие» у полюсов
    for (let x = 0; x < width; x++) {
      const u = x / width;
      // «Экватор — теплее, полюса — холоднее»
      const nx = u * 8;
      const ny = v * 4;
      let base = noise.fbm(nx, ny, 5);
      const detail = noise2.fbm(nx * 3, ny * 3, 3) * 0.25;
      base = Math.max(0, Math.min(1, base + detail - 0.1));

      // Континентальный слой — крупные материки на низкой частоте.
      // Формирует визуальный контраст суша/вода, благодаря которому планета перестаёт быть «шаром одного цвета».
      const continent = continentNoise.fbm(nx * 0.35, ny * 0.35, 3);

      // Полярные шапки для холодных биомов
      let value = base;
      if (biome === 'ice') {
        value = Math.min(1, base + (1 - latFactor) * 0.5);
      } else if (biome === 'ocean') {
        // Оценка «суша» vs «вода» через порог
        if (base < 0.55) {
          value = base * 0.4;
        }
      }

      let [r, g, b] = colorFor(value, palette);

      // Специфичные «фишки»
      if (biome === 'urban' && palette.accent) {
        // Огни городов на «тёмных» участках
        const cityNoise = noise2.sample(nx * 6, ny * 6);
        if (cityNoise > 0.72 && base < 0.55) {
          const glow = (cityNoise - 0.72) / 0.28;
          r = r + (palette.accent[0] - r) * glow;
          g = g + (palette.accent[1] - g) * glow;
          b = b + (palette.accent[2] - b) * glow;
        }
      }
      if (biome === 'volcanic' && palette.accent) {
        // Раскалённые трещины в тёмных зонах
        const crack = Math.abs(noise2.fbm(nx * 5, ny * 5, 3) - 0.5);
        if (crack < 0.05) {
          const heat = 1 - crack / 0.05;
          r = r + (palette.accent[0] - r) * heat;
          g = g + (palette.accent[1] - g) * heat;
          b = b + (palette.accent[2] - b) * heat;
        }
      }
      if (biome === 'ocean' && palette.accent && base > 0.55) {
        // Более зелёные острова на «суше»
        const isle = (base - 0.55) / 0.45;
        r = r + (palette.accent[0] - r) * isle * 0.6;
        g = g + (palette.accent[1] - g) * isle * 0.6;
        b = b + (palette.accent[2] - b) * isle * 0.6;
      }

      // Ледяные трещины и обнажения породы — чтобы Hoth, Mygeeto, Ilum
      // не были одноцветными шарами. Акцент-цвет = темная скала/трещина.
      if (biome === 'ice' && palette.accent) {
        // Крупные "каналы" тёмной породы в самых низких участках рельефа.
        if (continent < 0.35) {
          const t = Math.max(0, (0.35 - continent) / 0.35);
          const mix = Math.min(0.7, 0.25 + t * 0.5);
          r = r + (palette.accent[0] - r) * mix;
          g = g + (palette.accent[1] - g) * mix;
          b = b + (palette.accent[2] - b) * mix;
        }
        // Тонкие "трещины" — узкие полосы тёмного цвета по паттерну шума.
        const crack = Math.abs(noise2.fbm(nx * 4, ny * 4, 3) - 0.5);
        if (crack < 0.03) {
          const heat = 1 - crack / 0.03;
          r = r + (palette.accent[0] - r) * heat * 0.6;
          g = g + (palette.accent[1] - g) * heat * 0.6;
          b = b + (palette.accent[2] - b) * heat * 0.6;
        }
      }

      // Пустынные каньоны/дюны — чтобы Tatooine, Geonosis, Ryloth не были
      // плоскими оранжевыми шарами. Акцент = тёмные каньоны/скалы.
      if (biome === 'desert' && palette.accent) {
        // Крупные впадины — каньоны, солёные равнины.
        if (continent < 0.38) {
          const t = Math.max(0, (0.38 - continent) / 0.38);
          const mix = Math.min(0.55, 0.2 + t * 0.4);
          r = r + (palette.accent[0] - r) * mix;
          g = g + (palette.accent[1] - g) * mix;
          b = b + (palette.accent[2] - b) * mix;
        } else if (continent > 0.7) {
          // Светлые сандстоновые плато.
          const highT = Math.min(1, (continent - 0.7) / 0.3);
          r = r + (palette.high[0] - r) * highT * 0.4;
          g = g + (palette.high[1] - g) * highT * 0.4;
          b = b + (palette.high[2] - b) * highT * 0.4;
        }
      }

      // Континенты для forest/swamp/rocky — чтобы Endor, Kashyyyk, Dagobah, Mandalore
      // не были одноцветными шарами. Акцент-цвет = вода/море/трясина.
      if ((biome === 'forest' || biome === 'swamp' || biome === 'rocky') && palette.accent) {
        // Порог выбран так, чтобы ~40% площади было «водой», остальное — сушей.
        if (continent < 0.46) {
          const t = Math.max(0, (0.46 - continent) / 0.46); // 0..1
          // Более выраженный переход к акценту (воде), чтобы контуры материков читались.
          const mix = Math.min(0.92, 0.45 + t * 0.55);
          r = r + (palette.accent[0] - r) * mix;
          g = g + (palette.accent[1] - g) * mix;
          b = b + (palette.accent[2] - b) * mix;
        } else if (continent > 0.6) {
          // Крупные материки — заметно светлее (возвышенности).
          const highT = Math.min(1, (continent - 0.6) / 0.4);
          r = r + (palette.high[0] - r) * highT * 0.55;
          g = g + (palette.high[1] - g) * highT * 0.55;
          b = b + (palette.high[2] - b) * highT * 0.55;
        }

        // Для forest — дополнительно рисуем тонкие «реки» на суше:
        // узкие тёмные полосы по паттерну шума в тех зонах, где рельеф уже суша.
        if (biome === 'forest' && continent >= 0.46) {
          const river = Math.abs(noise2.fbm(nx * 3.5, ny * 3.5, 3) - 0.5);
          if (river < 0.035) {
            const flow = 1 - river / 0.035;
            r = r + (palette.accent[0] - r) * flow * 0.55;
            g = g + (palette.accent[1] - g) * flow * 0.55;
            b = b + (palette.accent[2] - b) * flow * 0.55;
          }
        }
      }
      if (biome === 'gas') {
        // Широтные полосы газового гиганта
        const band = Math.sin(v * Math.PI * 6) * 0.5 + 0.5;
        const bandColor = lerpColor(palette.mid, palette.high, band);
        r = r * 0.5 + bandColor[0] * 0.5;
        g = g * 0.5 + bandColor[1] * 0.5;
        b = b * 0.5 + bandColor[2] * 0.5;
      }

      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  cache.set(cacheKey, texture);
  return texture;
}

/**
 * Маппинг planetId → биом. Не завязываемся на канонические тексты — только
 * визуальный тип, чтобы генератор понимал, какую палитру использовать.
 */
export const PLANET_BIOME: Record<string, PlanetBiome> = {
  // Существующие
  coruscant: 'urban',
  tatooine: 'desert',
  mandalore: 'rocky',
  naboo: 'ocean',
  hoth: 'ice',
  kashyyyk: 'forest',
  dagobah: 'swamp',
  endor: 'forest',
  // Новые (14 планет)
  mustafar: 'volcanic',
  kamino: 'ocean',
  geonosis: 'desert',
  utapau: 'rocky',
  felucia: 'forest',
  mygeeto: 'ice',
  corellia: 'urban',
  ryloth: 'desert',
  'mon-cala': 'ocean',
  dantooine: 'forest',
  ilum: 'ice',
  dathomir: 'swamp',
  christophsis: 'urban',
  exegol: 'rocky',
};

export function biomeFor(planetId: string, climate?: string, terrain?: string): PlanetBiome {
  const explicit = PLANET_BIOME[planetId];
  if (explicit) return explicit;
  const t = `${climate ?? ''} ${terrain ?? ''}`.toLowerCase();
  if (t.includes('пустын') || t.includes('desert')) return 'desert';
  if (t.includes('лёд') || t.includes('лед') || t.includes('ice') || t.includes('снеж'))
    return 'ice';
  if (t.includes('лес') || t.includes('джунг') || t.includes('forest')) return 'forest';
  if (t.includes('океан') || t.includes('морск') || t.includes('ocean')) return 'ocean';
  if (t.includes('вулкан') || t.includes('лав') || t.includes('volcanic')) return 'volcanic';
  if (t.includes('болот') || t.includes('swamp')) return 'swamp';
  if (t.includes('город') || t.includes('urban') || t.includes('city')) return 'urban';
  if (t.includes('газ') || t.includes('gas')) return 'gas';
  return 'rocky';
}
