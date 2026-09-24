/**
 * Детерминированные визуальные параметры планеты по её id.
 *
 * Настоящие текстуры планет из фильмов — copyright Lucasfilm.
 * Мы генерируем цвета и параметры материала процедурно, чтобы
 * каждая планета в 3D-карте выглядела уникально.
 */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function hslToHex(h: number, s: number, l: number): string {
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export interface PlanetVisual {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  roughness: number;
  metalness: number;
  hasRing: boolean;
  ringColor: string;
  radius: number;
}

const REGION_HUE: Record<string, number> = {
  core: 210,
  colonies: 220,
  'inner-rim': 200,
  expansion: 190,
  'mid-rim': 260,
  'outer-rim': 30,
  unknown: 280,
};

/**
 * Специфичные оверрайды для узнаваемых планет — только цветовая палитра,
 * никаких защищённых артов. `radius` выбирается по значимости
 * планеты: Столица Галактики визуально весомее второстепенной луны.
 */
const OVERRIDES: Record<string, Partial<PlanetVisual>> = {
  // Галактические хабы — крупные.
  coruscant: {
    color: '#c8ddff',
    emissive: '#6ea8ff',
    emissiveIntensity: 1.1,
    roughness: 0.2,
    radius: 0.7,
  },
  corellia: { color: '#8fb0d6', emissive: '#3a5f92', roughness: 0.55, radius: 0.55 },
  kashyyyk: { color: '#3f6b3a', emissive: '#1e3a1a', roughness: 0.7, radius: 0.55 },

  // Крупные сюжетные миры.
  naboo: { color: '#7bbf95', emissive: '#2f6b45', roughness: 0.45, radius: 0.5 },
  mandalore: {
    color: '#8a9db5',
    emissive: '#4c68b0',
    roughness: 0.6,
    hasRing: true,
    ringColor: '#a5c8ff',
    radius: 0.5,
  },
  'mon-cala': { color: '#3a80c0', emissive: '#1a4a80', roughness: 0.35, radius: 0.5 },
  kamino: { color: '#5a7fa8', emissive: '#2a4f70', roughness: 0.4, radius: 0.5 },

  // Средние — стандарт.
  tatooine: { color: '#e0b57a', emissive: '#8b5a2b', roughness: 0.85, metalness: 0, radius: 0.45 },
  hoth: {
    color: '#e6f1ff',
    emissive: '#a5c8ff',
    emissiveIntensity: 0.9,
    roughness: 0.3,
    radius: 0.45,
  },
  geonosis: { color: '#c07050', emissive: '#602820', roughness: 0.9, radius: 0.45 },
  mustafar: {
    color: '#c04010',
    emissive: '#ff6020',
    emissiveIntensity: 0.8,
    roughness: 0.9,
    radius: 0.45,
  },
  utapau: { color: '#a89680', emissive: '#5a4a38', roughness: 0.85, radius: 0.45 },
  felucia: { color: '#c060a8', emissive: '#8020a0', roughness: 0.5, radius: 0.45 },
  ryloth: { color: '#c07040', emissive: '#603820', roughness: 0.85, radius: 0.45 },
  dantooine: { color: '#7ba065', emissive: '#3f5028', roughness: 0.7, radius: 0.45 },

  // Мелкие/спутники.
  dagobah: { color: '#556b3b', emissive: '#2a3a20', roughness: 0.9, radius: 0.38 },
  endor: { color: '#4a7a3a', emissive: '#254520', roughness: 0.7, hasRing: false, radius: 0.38 },
  mygeeto: { color: '#b0c0d8', emissive: '#4a6890', roughness: 0.4, radius: 0.4 },
  ilum: { color: '#a5d0ff', emissive: '#4a80c0', roughness: 0.4, radius: 0.4 },
  dathomir: { color: '#8a3040', emissive: '#4a1020', roughness: 0.85, radius: 0.42 },
  christophsis: { color: '#5aa0c8', emissive: '#2a5080', roughness: 0.4, radius: 0.4 },
  exegol: {
    color: '#3a2050',
    emissive: '#601a80',
    emissiveIntensity: 0.7,
    roughness: 0.9,
    radius: 0.42,
  },
};

export function planetVisual(id: string, region: string): PlanetVisual {
  const h = hash(id);
  const hue = REGION_HUE[region] ?? h % 360;
  const base: PlanetVisual = {
    color: hslToHex(hue, 50, 55),
    emissive: hslToHex(hue, 70, 30),
    emissiveIntensity: 0.6,
    roughness: 0.5,
    metalness: 0.05,
    hasRing: (h & 0b111) === 0,
    ringColor: hslToHex(hue, 30, 70),
    radius: 0.32 + ((h % 100) / 100) * 0.15,
  };
  return { ...base, ...OVERRIDES[id] };
}
