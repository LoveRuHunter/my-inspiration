/**
 * Стилизованные SVG-портреты персонажей.
 *
 * Не копируем защищённые арты Lucasfilm — рисуем сами узнаваемые архетипы:
 * капюшон джедая, шлем мандалорца, зелёное «йоду»-лицо, лицо вуки, слизень-хатт,
 * гунган с длинными ушами, ситх в тёмной хламиде. Цвета фракций и волос
 * привязаны к канону, но всё нарисовано с нуля.
 */

import { useMemo } from 'react';

export type CharacterArchetype =
  | 'jedi-hooded'
  | 'jedi-open'
  | 'royal'
  | 'smuggler'
  | 'sith-hooded'
  | 'yoda-species'
  | 'wookiee'
  | 'hutt'
  | 'mandalorian-helmet'
  | 'mandalorian-warrior'
  | 'gungan'
  | 'twi-lek'
  | 'togruta'
  | 'mon-calamari'
  | 'zabrak'
  | 'nightsister'
  | 'kaminoan'
  | 'pau-an'
  | 'cerean'
  | 'geonosian';

interface Palette {
  bg: string;
  bgAccent: string;
  skin: string;
  hair: string;
  robe: string;
  robeShadow: string;
  eyes: string;
}

interface CharacterVisual {
  archetype: CharacterArchetype;
  palette: Palette;
}

const FACTION_BG = {
  jedi: { bg: '#0a1f3a', accent: '#1a3a52' },
  empire: { bg: '#2a0808', accent: '#3a0f0f' },
  sith: { bg: '#160404', accent: '#2a0808' },
  rebellion: { bg: '#3a1a08', accent: '#5a2a0a' },
  mandalorian: { bg: '#141a24', accent: '#2a3540' },
  royal: { bg: '#2a1a3a', accent: '#3a2a5a' },
  hutt: { bg: '#1a2a1a', accent: '#2a3a1a' },
  wookiee: { bg: '#2a1a0a', accent: '#4a2a1a' },
  gungan: { bg: '#0a2a3a', accent: '#1a4a5a' },
  nightsister: { bg: '#2a0a1a', accent: '#5a1a2a' },
  separatist: { bg: '#1a1a1a', accent: '#3a2a1a' },
  neutral: { bg: '#0f1526', accent: '#1a1f2e' },
};

const CHARACTER_VISUAL: Record<string, CharacterVisual> = {
  anakin: {
    archetype: 'jedi-open',
    palette: {
      ...paletteFrom(FACTION_BG.jedi),
      skin: '#f2d3b1',
      hair: '#3a1f10',
      robe: '#3a2a1a',
      robeShadow: '#1e1610',
      eyes: '#2a5f8a',
    },
  },
  'obi-wan': {
    archetype: 'jedi-hooded',
    palette: {
      ...paletteFrom(FACTION_BG.jedi),
      skin: '#f2d3b1',
      hair: '#8a6b3e',
      robe: '#6b4f2a',
      robeShadow: '#3a2a15',
      eyes: '#3a5f7a',
    },
  },
  luke: {
    archetype: 'jedi-open',
    palette: {
      ...paletteFrom(FACTION_BG.rebellion),
      skin: '#f4d9b4',
      hair: '#c39a5c',
      robe: '#2a2a2a',
      robeShadow: '#1a1a1a',
      eyes: '#4a7fa8',
    },
  },
  mace: {
    archetype: 'jedi-hooded',
    palette: {
      ...paletteFrom({ bg: '#2a0f3a', accent: '#4a1a5a' }),
      skin: '#5a2f1a',
      hair: '#0a0a0a',
      robe: '#3a2a1a',
      robeShadow: '#1a1005',
      eyes: '#3a2a1a',
    },
  },
  yoda: {
    archetype: 'yoda-species',
    palette: {
      ...paletteFrom({ bg: '#0a2a1a', accent: '#1a4a2a' }),
      skin: '#8fbf5a',
      hair: '#c8c8b8',
      robe: '#6b5f3a',
      robeShadow: '#3a3520',
      eyes: '#8b6d3a',
    },
  },
  palpatine: {
    archetype: 'sith-hooded',
    palette: {
      ...paletteFrom(FACTION_BG.sith),
      skin: '#c9b598',
      hair: '#cccccc',
      robe: '#0a0405',
      robeShadow: '#000000',
      eyes: '#f5d040',
    },
  },
  padme: {
    archetype: 'royal',
    palette: {
      ...paletteFrom(FACTION_BG.royal),
      skin: '#f5dcbe',
      hair: '#2a1810',
      robe: '#6b1a3a',
      robeShadow: '#3a0a20',
      eyes: '#5a3a2a',
    },
  },
  leia: {
    archetype: 'royal',
    palette: {
      bg: '#e8e8dc',
      bgAccent: '#c8c8bc',
      skin: '#f2d3b1',
      hair: '#2a1810',
      robe: '#ffffff',
      robeShadow: '#c8c8c8',
      eyes: '#5a3a2a',
    },
  },
  han: {
    archetype: 'smuggler',
    palette: {
      ...paletteFrom(FACTION_BG.rebellion),
      skin: '#f4d9b4',
      hair: '#3a2510',
      robe: '#2a1810',
      robeShadow: '#1a0a05',
      eyes: '#4a5f7a',
    },
  },
  chewbacca: {
    archetype: 'wookiee',
    palette: {
      ...paletteFrom(FACTION_BG.wookiee),
      skin: '#6b4520',
      hair: '#4a2f15',
      robe: '#8a5a2a',
      robeShadow: '#3a2510',
      eyes: '#8b6d3a',
    },
  },
  jabba: {
    archetype: 'hutt',
    palette: {
      ...paletteFrom(FACTION_BG.hutt),
      skin: '#a89555',
      hair: '#6b5a35',
      robe: '#5a4a2a',
      robeShadow: '#3a3020',
      eyes: '#c96f3a',
    },
  },
  'bo-katan': {
    archetype: 'mandalorian-warrior',
    palette: {
      ...paletteFrom(FACTION_BG.mandalorian),
      skin: '#f4d9b4',
      hair: '#c8542a',
      robe: '#4a5560',
      robeShadow: '#2a3540',
      eyes: '#3a6f7a',
    },
  },
  sabine: {
    archetype: 'mandalorian-warrior',
    palette: {
      ...paletteFrom({ bg: '#2a0f3a', accent: '#4a1a5a' }),
      skin: '#f2d3b1',
      hair: '#c04ad8',
      robe: '#5a3a6a',
      robeShadow: '#2a1a3a',
      eyes: '#5a3a2a',
    },
  },
  'din-djarin': {
    archetype: 'mandalorian-helmet',
    palette: {
      ...paletteFrom(FACTION_BG.mandalorian),
      skin: '#f4d9b4',
      hair: '#2a1810',
      robe: '#3a4550',
      robeShadow: '#1a2530',
      eyes: '#0a0a0a',
    },
  },
  'jar-jar': {
    archetype: 'gungan',
    palette: {
      ...paletteFrom(FACTION_BG.gungan),
      skin: '#c99a55',
      hair: '#8a6b3a',
      robe: '#3a4a5a',
      robeShadow: '#1a2a3a',
      eyes: '#f5d040',
    },
  },
  // ================ Новые персонажи ================
  'jango-fett': {
    archetype: 'mandalorian-helmet',
    palette: {
      ...paletteFrom(FACTION_BG.mandalorian),
      skin: '#c99a70',
      hair: '#1a1005',
      robe: '#2a3540',
      robeShadow: '#141a24',
      eyes: '#8a95a0',
    },
  },
  'boba-fett': {
    archetype: 'mandalorian-helmet',
    palette: {
      ...paletteFrom({ bg: '#1a2a1a', accent: '#3a4a2a' }),
      skin: '#d0a878',
      hair: '#2a1810',
      robe: '#5a6a3a',
      robeShadow: '#2a3520',
      eyes: '#3a4025',
    },
  },
  'lama-su': {
    archetype: 'kaminoan',
    palette: {
      ...paletteFrom({ bg: '#0a1a2a', accent: '#1a3a4a' }),
      skin: '#e5eaea',
      hair: '#c0c8c8',
      robe: '#405060',
      robeShadow: '#20303a',
      eyes: '#4a6f80',
    },
  },
  dooku: {
    archetype: 'sith-hooded',
    palette: {
      ...paletteFrom({ bg: '#1a1005', accent: '#3a2a15' }),
      skin: '#d5c0a5',
      hair: '#d0d0d0',
      robe: '#0a0405',
      robeShadow: '#000000',
      eyes: '#4a3520',
    },
  },
  poggle: {
    archetype: 'geonosian',
    palette: {
      ...paletteFrom({ bg: '#2a1a0a', accent: '#5a3a1a' }),
      skin: '#9a6a3a',
      hair: '#5a3a1a',
      robe: '#3a2510',
      robeShadow: '#1a1005',
      eyes: '#f5a040',
    },
  },
  grievous: {
    archetype: 'mandalorian-helmet',
    palette: {
      ...paletteFrom({ bg: '#1a1005', accent: '#3a2a15' }),
      skin: '#e0d5c0',
      hair: '#2a1810',
      robe: '#8a8570',
      robeShadow: '#3a3525',
      eyes: '#f5d040',
    },
  },
  'tion-medon': {
    archetype: 'pau-an',
    palette: {
      ...paletteFrom({ bg: '#1a1a20', accent: '#3a3a45' }),
      skin: '#c0b5a5',
      hair: '#d5d0c5',
      robe: '#2a2a25',
      robeShadow: '#1a1a15',
      eyes: '#3a3025',
    },
  },
  aayla: {
    archetype: 'twi-lek',
    palette: {
      ...paletteFrom(FACTION_BG.jedi),
      skin: '#4a80a0',
      hair: '#2a4a60',
      robe: '#5a3a25',
      robeShadow: '#2a1810',
      eyes: '#5a3a20',
    },
  },
  'shaak-ti': {
    archetype: 'togruta',
    palette: {
      ...paletteFrom(FACTION_BG.jedi),
      skin: '#c05a4a',
      hair: '#f5f5f0',
      robe: '#4a3520',
      robeShadow: '#2a1810',
      eyes: '#3a2a15',
    },
  },
  'ki-adi-mundi': {
    archetype: 'cerean',
    palette: {
      ...paletteFrom(FACTION_BG.jedi),
      skin: '#e5d0b5',
      hair: '#c0a080',
      robe: '#5a4025',
      robeShadow: '#2a1810',
      eyes: '#4a5f7a',
    },
  },
  'cham-syndulla': {
    archetype: 'twi-lek',
    palette: {
      ...paletteFrom(FACTION_BG.rebellion),
      skin: '#8fa055',
      hair: '#5a6a35',
      robe: '#2a3025',
      robeShadow: '#151815',
      eyes: '#3a2510',
    },
  },
  'hera-syndulla': {
    archetype: 'twi-lek',
    palette: {
      ...paletteFrom(FACTION_BG.rebellion),
      skin: '#7a9550',
      hair: '#4a5a30',
      robe: '#4a3520',
      robeShadow: '#2a1810',
      eyes: '#7fa050',
    },
  },
  ackbar: {
    archetype: 'mon-calamari',
    palette: {
      ...paletteFrom(FACTION_BG.rebellion),
      skin: '#d08540',
      hair: '#a05a20',
      robe: '#e5e0d5',
      robeShadow: '#8a8570',
      eyes: '#1a0a05',
    },
  },
  revan: {
    archetype: 'sith-hooded',
    palette: {
      ...paletteFrom({ bg: '#1a0a1a', accent: '#3a1a3a' }),
      skin: '#e5d0b5',
      hair: '#2a1810',
      robe: '#2a1a2a',
      robeShadow: '#0a050a',
      eyes: '#c04a4a',
    },
  },
  talzin: {
    archetype: 'nightsister',
    palette: {
      ...paletteFrom(FACTION_BG.nightsister),
      skin: '#e5d5d0',
      hair: '#1a0a0a',
      robe: '#3a1a1a',
      robeShadow: '#1a0505',
      eyes: '#5aa0d0',
    },
  },
  maul: {
    archetype: 'zabrak',
    palette: {
      ...paletteFrom(FACTION_BG.sith),
      skin: '#c04a3a',
      hair: '#1a0505',
      robe: '#1a0a0a',
      robeShadow: '#0a0505',
      eyes: '#f5c020',
    },
  },
  'savage-opress': {
    archetype: 'zabrak',
    palette: {
      ...paletteFrom(FACTION_BG.sith),
      skin: '#c96040',
      hair: '#1a0505',
      robe: '#2a1a1a',
      robeShadow: '#0a0505',
      eyes: '#f5c020',
    },
  },
  ventress: {
    archetype: 'nightsister',
    palette: {
      ...paletteFrom({ bg: '#1a0a1a', accent: '#3a1a3a' }),
      skin: '#f0e5dd',
      hair: '#f5f5f0',
      robe: '#2a2a2a',
      robeShadow: '#0a0a0a',
      eyes: '#5aa0d0',
    },
  },
  ahsoka: {
    archetype: 'togruta',
    palette: {
      ...paletteFrom(FACTION_BG.jedi),
      skin: '#f5934a',
      hair: '#f0f0f0',
      robe: '#4a2f20',
      robeShadow: '#2a1810',
      eyes: '#5aa0d0',
    },
  },
  qira: {
    archetype: 'royal',
    palette: {
      ...paletteFrom({ bg: '#2a1a0f', accent: '#4a2a1a' }),
      skin: '#f2d3b1',
      hair: '#3a1810',
      robe: '#5a2f20',
      robeShadow: '#2a1810',
      eyes: '#4a5f7a',
    },
  },
  snoke: {
    archetype: 'sith-hooded',
    palette: {
      ...paletteFrom(FACTION_BG.sith),
      skin: '#c9a598',
      hair: '#5a3520',
      robe: '#c9a04a',
      robeShadow: '#5a4020',
      eyes: '#4a90c0',
    },
  },
};

function paletteFrom(bg: { bg: string; accent: string }) {
  return {
    bg: bg.bg,
    bgAccent: bg.accent,
    skin: '#f2d3b1',
    hair: '#3a2510',
    robe: '#2a2a2a',
    robeShadow: '#1a1a1a',
    eyes: '#3a5f7a',
  } as Palette;
}

const DEFAULT_VISUAL: CharacterVisual = {
  archetype: 'jedi-open',
  palette: paletteFrom(FACTION_BG.neutral),
};

interface Props {
  characterId: string;
  size?: number;
  className?: string;
}

export function CharacterPortrait({ characterId, size = 80, className }: Props) {
  const visual = useMemo(() => CHARACTER_VISUAL[characterId] ?? DEFAULT_VISUAL, [characterId]);

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
      <defs>
        <radialGradient id={`cbg-${characterId}`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={visual.palette.bgAccent} />
          <stop offset="100%" stopColor={visual.palette.bg} />
        </radialGradient>
        <clipPath id={`cclip-${characterId}`}>
          <circle cx="50" cy="50" r="49" />
        </clipPath>
      </defs>

      <g clipPath={`url(#cclip-${characterId})`}>
        <rect width="100" height="100" fill={`url(#cbg-${characterId})`} />
        <Archetype id={characterId} archetype={visual.archetype} p={visual.palette} />
      </g>
      <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(0,0,0,0.35)" />
    </svg>
  );
}

interface ArchetypeProps {
  id: string;
  archetype: CharacterArchetype;
  p: Palette;
}

function Archetype({ id, archetype, p }: ArchetypeProps) {
  switch (archetype) {
    case 'jedi-hooded':
      return <JediHooded p={p} />;
    case 'jedi-open':
      return <JediOpen id={id} p={p} />;
    case 'royal':
      return <Royal id={id} p={p} />;
    case 'smuggler':
      return <Smuggler p={p} />;
    case 'sith-hooded':
      return <SithHooded p={p} />;
    case 'yoda-species':
      return <YodaSpecies p={p} />;
    case 'wookiee':
      return <Wookiee p={p} />;
    case 'hutt':
      return <Hutt p={p} />;
    case 'mandalorian-helmet':
      return <MandalorianHelmet p={p} />;
    case 'mandalorian-warrior':
      return <MandalorianWarrior id={id} p={p} />;
    case 'gungan':
      return <Gungan p={p} />;
    case 'twi-lek':
      return <TwiLek p={p} />;
    case 'togruta':
      return <Togruta p={p} />;
    case 'mon-calamari':
      return <MonCalamari p={p} />;
    case 'zabrak':
      return <Zabrak id={id} p={p} />;
    case 'nightsister':
      return <Nightsister p={p} />;
    case 'kaminoan':
      return <Kaminoan p={p} />;
    case 'pau-an':
      return <PauAn p={p} />;
    case 'cerean':
      return <Cerean p={p} />;
    case 'geonosian':
      return <Geonosian p={p} />;
    default:
      return null;
  }
}

// ============ Архетипы ============

function Head({ p, y = 48 }: { p: Palette; y?: number }) {
  return (
    <>
      {/* Шея */}
      <rect x="42" y={y + 18} width="16" height="12" fill={p.skin} />
      {/* Голова */}
      <ellipse cx="50" cy={y} rx="16" ry="18" fill={p.skin} />
      {/* Тень щеки */}
      <ellipse cx="58" cy={y + 3} rx="6" ry="10" fill="rgba(0,0,0,0.12)" />
    </>
  );
}

function Eyes({ p, cy = 46, gap = 6 }: { p: Palette; cy?: number; gap?: number }) {
  return (
    <>
      <ellipse cx={50 - gap} cy={cy} rx="1.6" ry="2" fill={p.eyes} />
      <ellipse cx={50 + gap} cy={cy} rx="1.6" ry="2" fill={p.eyes} />
      {/* Брови */}
      <rect x={50 - gap - 3} y={cy - 4} width="6" height="1.2" fill={p.hair} rx="0.5" />
      <rect x={50 + gap - 3} y={cy - 4} width="6" height="1.2" fill={p.hair} rx="0.5" />
    </>
  );
}

function Mouth({ y = 55 }: { y?: number }) {
  return (
    <path d={`M 46 ${y} Q 50 ${y + 2} 54 ${y}`} stroke="#5a2a1a" strokeWidth="1.2" fill="none" />
  );
}

function Robe({ p }: { p: Palette }) {
  return (
    <>
      <path d="M 15 100 L 25 72 Q 50 65 75 72 L 85 100 Z" fill={p.robe} />
      <path
        d="M 25 72 L 40 92 L 50 78 L 60 92 L 75 72 L 65 100 L 35 100 Z"
        fill={p.robeShadow}
        opacity="0.5"
      />
    </>
  );
}

function JediHooded({ p }: { p: Palette }) {
  return (
    <>
      <Robe p={p} />
      <Head p={p} />
      {/* Капюшон */}
      <path
        d="M 20 55 Q 20 30 50 26 Q 80 30 80 55 L 78 62 Q 65 45 50 44 Q 35 45 22 62 Z"
        fill={p.robe}
      />
      <path
        d="M 24 55 Q 24 34 50 30 Q 76 34 76 55"
        fill="none"
        stroke={p.robeShadow}
        strokeWidth="1"
        opacity="0.6"
      />
      {/* Волосы под капюшоном */}
      <path d="M 36 42 Q 50 38 64 42 L 60 48 L 40 48 Z" fill={p.hair} />
      <Eyes p={p} />
      <Mouth />
      {/* Борода / щетина */}
      <path d="M 40 56 Q 50 62 60 56 L 58 62 Q 50 66 42 62 Z" fill={p.hair} opacity="0.55" />
    </>
  );
}

function JediOpen({ id, p }: { id: string; p: Palette }) {
  // Разные причёски для Anakin/Luke
  const isLuke = id === 'luke';
  return (
    <>
      <Robe p={p} />
      <Head p={p} />
      {/* Волосы */}
      {isLuke ? (
        <path
          d="M 33 42 Q 34 30 50 28 Q 66 30 67 42 L 64 45 Q 58 34 50 34 Q 42 34 36 45 Z"
          fill={p.hair}
        />
      ) : (
        <>
          <path
            d="M 32 44 Q 33 30 50 28 Q 67 30 68 44 L 66 50 Q 62 34 50 34 Q 38 34 34 50 Z"
            fill={p.hair}
          />
          {/* Косичка падавана */}
          <path d="M 32 46 L 30 62 L 32 64 L 34 46 Z" fill={p.hair} />
        </>
      )}
      <Eyes p={p} />
      <Mouth />
    </>
  );
}

function Royal({ id, p }: { id: string; p: Palette }) {
  const isLeia = id === 'leia';
  return (
    <>
      <Robe p={p} />
      <Head p={p} />
      {isLeia ? (
        <>
          {/* Знаменитые «булочки» */}
          <circle cx="30" cy="46" r="10" fill={p.hair} />
          <circle cx="70" cy="46" r="10" fill={p.hair} />
          <circle cx="30" cy="46" r="6" fill={p.robeShadow} opacity="0.4" />
          <circle cx="70" cy="46" r="6" fill={p.robeShadow} opacity="0.4" />
          <path d="M 34 40 Q 50 34 66 40 L 62 48 Q 50 42 38 48 Z" fill={p.hair} />
        </>
      ) : (
        <>
          {/* Королевская причёска Падме — высокая, с изгибами */}
          <path
            d="M 28 44 Q 26 20 50 22 Q 74 20 72 44 L 68 50 Q 66 30 50 28 Q 34 30 32 50 Z"
            fill={p.hair}
          />
          {/* Украшения */}
          <circle cx="50" cy="26" r="2.2" fill="#f5d040" />
          <circle cx="38" cy="30" r="1.5" fill="#f5d040" />
          <circle cx="62" cy="30" r="1.5" fill="#f5d040" />
        </>
      )}
      <Eyes p={p} />
      <Mouth />
      {/* Помада */}
      <path d="M 45 55 Q 50 57 55 55 Q 50 58 45 55 Z" fill="#8a2a3a" opacity="0.6" />
    </>
  );
}

function Smuggler({ p }: { p: Palette }) {
  return (
    <>
      <Robe p={p} />
      <Head p={p} />
      {/* Растрёпанные волосы */}
      <path
        d="M 33 40 Q 34 30 50 28 Q 66 30 67 40 L 64 44 Q 58 34 50 34 Q 42 34 36 44 Z"
        fill={p.hair}
      />
      {/* Ассиметричный локон */}
      <path d="M 32 42 Q 30 50 35 55 L 38 45 Z" fill={p.hair} />
      <Eyes p={p} />
      <Mouth y={56} />
      {/* Ухмылка */}
      <path d="M 54 55 L 57 54" stroke="#5a2a1a" strokeWidth="1" fill="none" />
    </>
  );
}

function SithHooded({ p }: { p: Palette }) {
  return (
    <>
      <Robe p={p} />
      {/* Тёмный капюшон, глубоко нависает */}
      <path d="M 12 100 L 15 40 Q 50 22 85 40 L 88 100 Z" fill={p.robe} />
      {/* Лицо в тени */}
      <ellipse cx="50" cy="55" rx="14" ry="17" fill={p.skin} opacity="0.85" />
      <ellipse cx="50" cy="60" rx="14" ry="17" fill="rgba(0,0,0,0.6)" />
      {/* Морщины */}
      <path
        d="M 40 52 Q 50 55 60 52"
        stroke={p.robeShadow}
        strokeWidth="0.8"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M 42 58 Q 50 61 58 58"
        stroke={p.robeShadow}
        strokeWidth="0.8"
        fill="none"
        opacity="0.6"
      />
      {/* Жёлтые глаза ситха */}
      <circle cx="44" cy="53" r="1.8" fill={p.eyes} />
      <circle cx="56" cy="53" r="1.8" fill={p.eyes} />
      <circle cx="44" cy="53" r="0.6" fill="#000" />
      <circle cx="56" cy="53" r="0.6" fill="#000" />
      {/* Свечение */}
      <circle cx="44" cy="53" r="3" fill={p.eyes} opacity="0.25" />
      <circle cx="56" cy="53" r="3" fill={p.eyes} opacity="0.25" />
      <path d="M 45 63 Q 50 65 55 63" stroke="#2a0a0a" strokeWidth="1" fill="none" />
    </>
  );
}

function YodaSpecies({ p }: { p: Palette }) {
  return (
    <>
      <Robe p={p} />
      {/* Голова с большими ушами */}
      <ellipse cx="50" cy="52" rx="20" ry="20" fill={p.skin} />
      {/* Уши */}
      <path d="M 30 45 L 12 30 L 22 50 Z" fill={p.skin} />
      <path d="M 30 45 L 12 30 L 22 50 Z" fill="rgba(0,0,0,0.15)" opacity="0.6" />
      <path d="M 70 45 L 88 30 L 78 50 Z" fill={p.skin} />
      <path d="M 70 45 L 88 30 L 78 50 Z" fill="rgba(0,0,0,0.15)" opacity="0.6" />
      {/* Реденькие волосы */}
      <path d="M 40 34 Q 50 30 60 34 L 55 38 L 45 38 Z" fill={p.hair} opacity="0.7" />
      <path d="M 35 36 L 32 30 Z M 65 36 L 68 30 Z" stroke={p.hair} strokeWidth="1.2" />
      {/* Морщины на лбу */}
      <path d="M 38 42 Q 50 45 62 42" stroke="#5a7f3a" strokeWidth="0.8" fill="none" />
      <path d="M 40 46 Q 50 48 60 46" stroke="#5a7f3a" strokeWidth="0.8" fill="none" />
      {/* Большие глаза */}
      <ellipse cx="42" cy="54" rx="3" ry="3.5" fill="#fff" />
      <ellipse cx="58" cy="54" rx="3" ry="3.5" fill="#fff" />
      <circle cx="42" cy="55" r="1.6" fill={p.eyes} />
      <circle cx="58" cy="55" r="1.6" fill={p.eyes} />
      {/* Ноздри */}
      <ellipse cx="47" cy="62" rx="0.8" ry="1" fill="#3a5020" />
      <ellipse cx="53" cy="62" rx="0.8" ry="1" fill="#3a5020" />
      {/* Рот */}
      <path d="M 42 68 Q 50 72 58 68" stroke="#3a5020" strokeWidth="1.2" fill="none" />
    </>
  );
}

function Wookiee({ p }: { p: Palette }) {
  return (
    <>
      {/* Плечи мохнатые */}
      <path d="M 5 100 L 12 65 Q 50 60 88 65 L 95 100 Z" fill={p.hair} />
      {/* Голова — мохнатая */}
      <ellipse cx="50" cy="50" rx="24" ry="26" fill={p.hair} />
      {/* Кустистая шерсть по краям */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const x1 = 50 + Math.cos(angle) * 24;
        const y1 = 50 + Math.sin(angle) * 26;
        const x2 = 50 + Math.cos(angle) * 30;
        const y2 = 50 + Math.sin(angle) * 32;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={p.hair} strokeWidth="2" />;
      })}
      {/* Морда светлее */}
      <ellipse cx="50" cy="56" rx="10" ry="12" fill={p.skin} opacity="0.9" />
      {/* Глаза */}
      <circle cx="45" cy="49" r="1.6" fill={p.eyes} />
      <circle cx="55" cy="49" r="1.6" fill={p.eyes} />
      {/* Нос */}
      <path d="M 48 56 L 52 56 L 50 60 Z" fill="#1a0a05" />
      {/* Рот приоткрыт, видны клыки */}
      <path d="M 44 64 Q 50 68 56 64 L 56 66 L 44 66 Z" fill="#2a0a05" />
      <path d="M 48 64 L 48 67 M 52 64 L 52 67" stroke="#fff" strokeWidth="1" />
      {/* Ремень боукастера */}
      <path d="M 20 78 L 80 68" stroke="#5a3f20" strokeWidth="3" fill="none" />
    </>
  );
}

function Hutt({ p }: { p: Palette }) {
  return (
    <>
      {/* Массивная голова-слизень */}
      <ellipse cx="50" cy="55" rx="35" ry="30" fill={p.skin} />
      {/* Складки жира */}
      <ellipse cx="50" cy="70" rx="32" ry="8" fill={p.robeShadow} opacity="0.4" />
      <path
        d="M 20 55 Q 50 62 80 55"
        stroke={p.robeShadow}
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M 22 62 Q 50 68 78 62"
        stroke={p.robeShadow}
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />
      {/* Пятна */}
      <circle cx="35" cy="40" r="2" fill={p.hair} opacity="0.5" />
      <circle cx="62" cy="45" r="1.5" fill={p.hair} opacity="0.5" />
      <circle cx="45" cy="72" r="2.5" fill={p.hair} opacity="0.5" />
      {/* Ленивые глаза-щелки */}
      <path d="M 36 42 Q 42 40 46 42" stroke="#2a1a05" strokeWidth="2" fill="none" />
      <path d="M 54 42 Q 60 40 64 42" stroke="#2a1a05" strokeWidth="2" fill="none" />
      <circle cx="41" cy="43" r="1" fill={p.eyes} />
      <circle cx="59" cy="43" r="1" fill={p.eyes} />
      {/* Ноздри-щели */}
      <ellipse cx="46" cy="52" rx="1" ry="1.5" fill="#2a1a05" />
      <ellipse cx="54" cy="52" rx="1" ry="1.5" fill="#2a1a05" />
      {/* Огромный рот */}
      <path d="M 30 62 Q 50 74 70 62 L 65 66 Q 50 70 35 66 Z" fill="#3a1a05" />
    </>
  );
}

function MandalorianHelmet({ p }: { p: Palette }) {
  return (
    <>
      <Robe p={p} />
      {/* Шлем бескаровый */}
      <path d="M 30 58 Q 30 26 50 22 Q 70 26 70 58 L 68 66 L 32 66 Z" fill={p.robe} />
      {/* Купол шлема — блик */}
      <path d="M 34 30 Q 50 24 66 30 L 62 40 Q 50 34 38 40 Z" fill="#8a95a0" opacity="0.55" />
      {/* T-визор */}
      <path d="M 38 38 L 62 38 L 62 44 L 55 44 L 55 55 L 45 55 L 45 44 L 38 44 Z" fill="#0a0a0a" />
      {/* Свечение визора */}
      <path
        d="M 40 39 L 60 39 L 60 43 L 40 43 Z M 47 44 L 53 44 L 53 54 L 47 54 Z"
        fill="#4a7fa8"
        opacity="0.35"
      />
      {/* Царапины бескара */}
      <path d="M 42 32 L 48 34" stroke="#8a95a0" strokeWidth="0.5" opacity="0.6" />
      <path d="M 58 50 L 62 52" stroke="#8a95a0" strokeWidth="0.5" opacity="0.6" />
      {/* Плечевая броня */}
      <path d="M 15 100 L 20 72 Q 30 68 30 66 L 30 88 L 25 100 Z" fill={p.robeShadow} />
      <path d="M 85 100 L 80 72 Q 70 68 70 66 L 70 88 L 75 100 Z" fill={p.robeShadow} />
    </>
  );
}

function MandalorianWarrior({ id, p }: { id: string; p: Palette }) {
  const isSabine = id === 'sabine';
  return (
    <>
      <Robe p={p} />
      <Head p={p} />
      {/* Волосы */}
      <path
        d="M 32 42 Q 33 26 50 24 Q 67 26 68 42 L 65 46 Q 60 32 50 32 Q 40 32 35 46 Z"
        fill={p.hair}
      />
      {isSabine && (
        <>
          {/* Разноцветные пряди */}
          <path d="M 34 38 L 36 34 L 38 40 Z" fill="#f5d040" />
          <path d="M 62 40 L 64 34 L 66 40 Z" fill="#f5502a" />
        </>
      )}
      <Eyes p={p} />
      {/* Боевая раскраска */}
      <path
        d={
          isSabine
            ? 'M 36 50 Q 40 52 44 50 L 42 46 Z M 56 50 Q 60 52 64 50 L 58 46 Z'
            : 'M 40 44 L 44 48 L 40 48 Z M 60 44 L 56 48 L 60 48 Z'
        }
        fill={isSabine ? '#f5502a' : '#c0392a'}
        opacity="0.75"
      />
      <Mouth />
      {/* Пластина брони на плече */}
      <path d="M 15 100 L 18 72 Q 25 68 25 65 L 25 82 L 22 100 Z" fill={p.robeShadow} />
    </>
  );
}

function Gungan({ p }: { p: Palette }) {
  return (
    <>
      <Robe p={p} />
      {/* Голова — вытянутая */}
      <ellipse cx="50" cy="48" rx="15" ry="20" fill={p.skin} />
      {/* Длинные висячие уши-«хайлу» */}
      <path d="M 34 45 Q 20 55 22 90 L 30 90 Q 30 60 38 55 Z" fill={p.skin} />
      <path d="M 66 45 Q 80 55 78 90 L 70 90 Q 70 60 62 55 Z" fill={p.skin} />
      {/* Тени на ушах */}
      <path d="M 22 90 L 30 90 Q 28 70 26 68 Z" fill="rgba(0,0,0,0.15)" />
      <path d="M 78 90 L 70 90 Q 72 70 74 68 Z" fill="rgba(0,0,0,0.15)" />
      {/* Стебельки-глаза */}
      <path d="M 43 32 L 41 20" stroke={p.skin} strokeWidth="4" strokeLinecap="round" />
      <path d="M 57 32 L 59 20" stroke={p.skin} strokeWidth="4" strokeLinecap="round" />
      <circle cx="41" cy="18" r="4" fill={p.skin} />
      <circle cx="59" cy="18" r="4" fill={p.skin} />
      {/* Глаза-шарики */}
      <circle cx="41" cy="18" r="2.2" fill={p.eyes} />
      <circle cx="59" cy="18" r="2.2" fill={p.eyes} />
      <circle cx="41" cy="17" r="0.7" fill="#000" />
      <circle cx="59" cy="17" r="0.7" fill="#000" />
      {/* Морда — уточкой */}
      <ellipse cx="50" cy="60" rx="10" ry="6" fill={p.skin} />
      <ellipse cx="50" cy="62" rx="10" ry="5" fill={p.robeShadow} opacity="0.35" />
      {/* Ноздри */}
      <ellipse cx="47" cy="58" rx="0.7" ry="1" fill="#3a2510" />
      <ellipse cx="53" cy="58" rx="0.7" ry="1" fill="#3a2510" />
      {/* Улыбка */}
      <path d="M 44 63 Q 50 66 56 63" stroke="#3a2510" strokeWidth="1.2" fill="none" />
    </>
  );
}

function TwiLek({ p }: { p: Palette }) {
  return (
    <>
      <Robe p={p} />
      <Head p={p} />
      {/* Лекку — длинные головные хвосты */}
      <path d="M 34 46 Q 24 60 26 92 L 32 92 Q 30 66 38 54 Z" fill={p.skin} />
      <path d="M 66 46 Q 76 60 74 92 L 68 92 Q 70 66 62 54 Z" fill={p.skin} />
      {/* Кольца-полосы на лекку */}
      <path d="M 27 62 L 33 62" stroke={p.robeShadow} strokeWidth="1" opacity="0.5" />
      <path d="M 27 74 L 33 74" stroke={p.robeShadow} strokeWidth="1" opacity="0.5" />
      <path d="M 68 62 L 74 62" stroke={p.robeShadow} strokeWidth="1" opacity="0.5" />
      <path d="M 68 74 L 74 74" stroke={p.robeShadow} strokeWidth="1" opacity="0.5" />
      {/* Головной убор (льняная повязка) */}
      <path d="M 36 38 Q 50 32 64 38 L 62 44 L 38 44 Z" fill={p.hair} opacity="0.85" />
      <Eyes p={p} />
      <Mouth />
    </>
  );
}

function Togruta({ p }: { p: Palette }) {
  return (
    <>
      <Robe p={p} />
      <Head p={p} />
      {/* Монтралс — три рога-выроста */}
      <path d="M 42 34 L 34 14 L 40 18 L 44 34 Z" fill={p.hair} />
      <path d="M 58 34 L 66 14 L 60 18 L 56 34 Z" fill={p.hair} />
      <path d="M 48 32 L 46 12 L 50 8 L 54 12 L 52 32 Z" fill={p.hair} />
      {/* Полосы (монтралс-паттерн) */}
      <path d="M 37 22 L 43 22" stroke={p.robeShadow} strokeWidth="1" />
      <path d="M 57 22 L 63 22" stroke={p.robeShadow} strokeWidth="1" />
      <path d="M 48 16 L 52 16" stroke={p.robeShadow} strokeWidth="1" />
      {/* Лекку-наконечники */}
      <path d="M 34 46 Q 28 60 30 82 L 36 80 Q 36 64 40 52 Z" fill={p.skin} />
      <path d="M 66 46 Q 72 60 70 82 L 64 80 Q 64 64 60 52 Z" fill={p.skin} />
      <path d="M 32 60 L 36 60 M 32 72 L 36 72" stroke="#fff" strokeWidth="1" opacity="0.7" />
      <path d="M 64 60 L 68 60 M 64 72 L 68 72" stroke="#fff" strokeWidth="1" opacity="0.7" />
      <Eyes p={p} />
      <Mouth />
    </>
  );
}

function MonCalamari({ p }: { p: Palette }) {
  return (
    <>
      {/* Адмиральский китель */}
      <path d="M 12 100 L 20 68 Q 50 62 80 68 L 88 100 Z" fill={p.robe} />
      <path d="M 40 68 L 45 100 L 55 100 L 60 68 Z" fill={p.robeShadow} opacity="0.6" />
      {/* Золотые пуговицы */}
      <circle cx="48" cy="74" r="1.2" fill="#c9a04a" />
      <circle cx="52" cy="74" r="1.2" fill="#c9a04a" />
      <circle cx="48" cy="82" r="1.2" fill="#c9a04a" />
      <circle cx="52" cy="82" r="1.2" fill="#c9a04a" />
      {/* Шея */}
      <rect x="42" y="62" width="16" height="8" fill={p.skin} />
      {/* Голова вытянутая кверху */}
      <ellipse cx="50" cy="40" rx="18" ry="22" fill={p.skin} />
      {/* Плавники-уши */}
      <path d="M 32 42 Q 20 46 22 58 L 30 54 Q 32 48 34 46 Z" fill={p.skin} />
      <path d="M 68 42 Q 80 46 78 58 L 70 54 Q 68 48 66 46 Z" fill={p.skin} />
      {/* Пятна амфибии */}
      <ellipse cx="42" cy="30" rx="3" ry="2" fill={p.robeShadow} opacity="0.35" />
      <ellipse cx="58" cy="32" rx="2.5" ry="1.8" fill={p.robeShadow} opacity="0.35" />
      <ellipse cx="50" cy="48" rx="3" ry="2" fill={p.robeShadow} opacity="0.3" />
      {/* Огромные выпуклые глаза */}
      <ellipse cx="40" cy="42" rx="5" ry="6" fill="#f5e8c0" />
      <ellipse cx="60" cy="42" rx="5" ry="6" fill="#f5e8c0" />
      <circle cx="40" cy="43" r="2" fill={p.eyes} />
      <circle cx="60" cy="43" r="2" fill={p.eyes} />
      <circle cx="41" cy="42" r="0.6" fill="#fff" />
      <circle cx="61" cy="42" r="0.6" fill="#fff" />
      {/* Короткие макушки-гребни */}
      <path
        d="M 38 22 L 42 26 M 50 18 L 50 24 M 62 22 L 58 26"
        stroke={p.robeShadow}
        strokeWidth="1.5"
      />
      {/* Рот-щель */}
      <path d="M 42 54 Q 50 58 58 54" stroke="#3a1a10" strokeWidth="1.5" fill="none" />
    </>
  );
}

function Zabrak({ id, p }: { id: string; p: Palette }) {
  const isMaul = id === 'maul';
  return (
    <>
      <Robe p={p} />
      <Head p={p} />
      {/* Корона рогов */}
      <path d="M 36 32 L 34 22 L 38 30 Z" fill={p.hair} />
      <path d="M 42 30 L 41 20 L 44 28 Z" fill={p.hair} />
      <path d="M 50 28 L 50 18 L 52 26 Z" fill={p.hair} />
      <path d="M 58 30 L 59 20 L 56 28 Z" fill={p.hair} />
      <path d="M 64 32 L 66 22 L 62 30 Z" fill={p.hair} />
      {/* Татуировки (Мол/Сэвидж) */}
      <path d="M 40 42 L 44 46 L 42 50 Z" fill="#1a0a0a" opacity="0.7" />
      <path d="M 60 42 L 56 46 L 58 50 Z" fill="#1a0a0a" opacity="0.7" />
      <path
        d="M 46 52 L 50 56 L 54 52"
        stroke="#1a0a0a"
        strokeWidth="1.5"
        fill="none"
        opacity="0.75"
      />
      {isMaul && (
        <>
          <path d="M 50 42 L 50 60" stroke="#1a0a0a" strokeWidth="1" opacity="0.6" />
          <path
            d="M 44 58 Q 50 62 56 58"
            stroke="#1a0a0a"
            strokeWidth="1.2"
            fill="none"
            opacity="0.6"
          />
        </>
      )}
      {/* Жёлтые глаза ситха */}
      <circle cx="44" cy="46" r="1.8" fill={p.eyes} />
      <circle cx="56" cy="46" r="1.8" fill={p.eyes} />
      <circle cx="44" cy="46" r="0.7" fill="#1a0505" />
      <circle cx="56" cy="46" r="0.7" fill="#1a0505" />
      <circle cx="44" cy="46" r="2.6" fill={p.eyes} opacity="0.25" />
      <circle cx="56" cy="46" r="2.6" fill={p.eyes} opacity="0.25" />
      <Mouth y={55} />
    </>
  );
}

function Nightsister({ p }: { p: Palette }) {
  return (
    <>
      <Robe p={p} />
      {/* Капюшон-плащ */}
      <path d="M 18 100 L 22 44 Q 50 26 78 44 L 82 100 Z" fill={p.robe} />
      {/* Бледное лицо */}
      <ellipse cx="50" cy="52" rx="15" ry="18" fill={p.skin} />
      {/* Тени под капюшоном */}
      <ellipse cx="50" cy="42" rx="14" ry="6" fill="rgba(0,0,0,0.4)" />
      {/* Чёрные волосы (если видны) */}
      <path d="M 38 42 Q 50 38 62 42 L 60 48 L 40 48 Z" fill={p.hair} />
      {/* Ритуальные татуировки — чёрные линии от глаз */}
      <path d="M 44 55 L 42 62" stroke="#1a0505" strokeWidth="0.8" />
      <path d="M 56 55 L 58 62" stroke="#1a0505" strokeWidth="0.8" />
      <path d="M 40 50 L 38 46" stroke="#1a0505" strokeWidth="0.6" />
      <path d="M 60 50 L 62 46" stroke="#1a0505" strokeWidth="0.6" />
      {/* Глаза — бледно-голубые, светящиеся */}
      <circle cx="44" cy="52" r="1.6" fill={p.eyes} />
      <circle cx="56" cy="52" r="1.6" fill={p.eyes} />
      <circle cx="44" cy="52" r="3" fill={p.eyes} opacity="0.25" />
      <circle cx="56" cy="52" r="3" fill={p.eyes} opacity="0.25" />
      <path d="M 46 62 Q 50 64 54 62" stroke="#3a0a15" strokeWidth="1" fill="none" />
    </>
  );
}

function Kaminoan({ p }: { p: Palette }) {
  return (
    <>
      {/* Длинное тело-воротник */}
      <path d="M 20 100 L 30 76 Q 50 72 70 76 L 80 100 Z" fill={p.robe} />
      <path d="M 40 76 L 42 100 L 58 100 L 60 76 Z" fill={p.robeShadow} opacity="0.5" />
      {/* Длинная, тонкая шея */}
      <rect x="46" y="52" width="8" height="24" fill={p.skin} />
      <rect x="46" y="52" width="8" height="24" fill={p.robeShadow} opacity="0.15" />
      {/* Маленькая вытянутая голова */}
      <ellipse cx="50" cy="38" rx="10" ry="16" fill={p.skin} />
      {/* Акцентированная макушка-гребень */}
      <path d="M 46 24 Q 50 16 54 24 Q 52 22 50 22 Q 48 22 46 24 Z" fill={p.skin} />
      {/* Гладкий овал лица, большие миндалевидные глаза */}
      <ellipse cx="46" cy="38" rx="3" ry="2" fill="#0a0a0a" />
      <ellipse cx="54" cy="38" rx="3" ry="2" fill="#0a0a0a" />
      <ellipse cx="46" cy="38" rx="1.5" ry="1" fill={p.eyes} />
      <ellipse cx="54" cy="38" rx="1.5" ry="1" fill={p.eyes} />
      {/* Маленькие ноздри и рот */}
      <ellipse cx="48" cy="44" rx="0.6" ry="0.8" fill={p.robeShadow} />
      <ellipse cx="52" cy="44" rx="0.6" ry="0.8" fill={p.robeShadow} />
      <path d="M 47 48 Q 50 49 53 48" stroke={p.robeShadow} strokeWidth="0.8" fill="none" />
    </>
  );
}

function PauAn({ p }: { p: Palette }) {
  return (
    <>
      <Robe p={p} />
      {/* Вытянутая серая голова */}
      <ellipse cx="50" cy="46" rx="14" ry="22" fill={p.skin} />
      {/* Глубокие впадины на щеках */}
      <path
        d="M 40 50 Q 42 58 40 66"
        stroke={p.robeShadow}
        strokeWidth="1"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M 60 50 Q 58 58 60 66"
        stroke={p.robeShadow}
        strokeWidth="1"
        fill="none"
        opacity="0.55"
      />
      {/* Седые волосы, зачёсанные назад */}
      <path d="M 36 28 Q 50 22 64 28 L 60 34 L 40 34 Z" fill={p.hair} />
      <path d="M 40 30 L 40 38 M 50 27 L 50 35 M 60 30 L 60 38" stroke={p.hair} strokeWidth="0.8" />
      {/* Глубоко посаженные глаза */}
      <ellipse cx="44" cy="46" rx="3" ry="3" fill="rgba(0,0,0,0.55)" />
      <ellipse cx="56" cy="46" rx="3" ry="3" fill="rgba(0,0,0,0.55)" />
      <circle cx="44" cy="47" r="1.2" fill={p.eyes} />
      <circle cx="56" cy="47" r="1.2" fill={p.eyes} />
      {/* Морщины */}
      <path
        d="M 42 40 Q 50 42 58 40"
        stroke={p.robeShadow}
        strokeWidth="0.8"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M 44 55 Q 50 58 56 55"
        stroke={p.robeShadow}
        strokeWidth="0.6"
        fill="none"
        opacity="0.5"
      />
      {/* Тонкий рот */}
      <path d="M 44 62 Q 50 64 56 62" stroke="#3a2510" strokeWidth="1" fill="none" />
    </>
  );
}

function Cerean({ p }: { p: Palette }) {
  return (
    <>
      <Robe p={p} />
      {/* Гигантский конусовидный череп */}
      <path d="M 34 50 Q 34 30 50 12 Q 66 30 66 50 L 62 60 L 38 60 Z" fill={p.skin} />
      {/* Лицо (нижняя часть черепа) */}
      <ellipse cx="50" cy="56" rx="12" ry="12" fill={p.skin} />
      {/* Шея */}
      <rect x="44" y="64" width="12" height="10" fill={p.skin} />
      {/* Волосы на макушке */}
      <path d="M 40 20 Q 50 14 60 20 L 58 28 L 42 28 Z" fill={p.hair} opacity="0.85" />
      {/* Глаза */}
      <ellipse cx="44" cy="54" rx="1.6" ry="2" fill={p.eyes} />
      <ellipse cx="56" cy="54" rx="1.6" ry="2" fill={p.eyes} />
      <rect x="41" y="50" width="6" height="1" fill={p.hair} />
      <rect x="53" y="50" width="6" height="1" fill={p.hair} />
      {/* Борода */}
      <path d="M 42 62 Q 50 68 58 62 L 56 68 Q 50 72 44 68 Z" fill={p.hair} opacity="0.7" />
      <path d="M 44 60 Q 50 63 56 60" stroke="#5a2a1a" strokeWidth="0.8" fill="none" />
    </>
  );
}

function Geonosian({ p }: { p: Palette }) {
  return (
    <>
      <Robe p={p} />
      {/* Насекомеподобная вытянутая голова */}
      <path d="M 32 50 Q 30 30 50 20 Q 70 30 68 50 L 60 66 L 40 66 Z" fill={p.skin} />
      {/* Гребень-шлем архидьяка */}
      <path d="M 38 26 L 50 8 L 62 26 Z" fill={p.hair} />
      <path d="M 44 22 L 50 12 L 56 22" stroke={p.robeShadow} strokeWidth="0.8" fill="none" />
      {/* Императорские складки век */}
      <path d="M 34 44 Q 42 42 46 46" stroke={p.robeShadow} strokeWidth="1" fill="none" />
      <path d="M 54 46 Q 58 42 66 44" stroke={p.robeShadow} strokeWidth="1" fill="none" />
      {/* Горящие красно-оранжевые глаза */}
      <ellipse cx="42" cy="48" rx="3" ry="2" fill={p.eyes} />
      <ellipse cx="58" cy="48" rx="3" ry="2" fill={p.eyes} />
      <circle cx="42" cy="48" r="0.8" fill="#1a0505" />
      <circle cx="58" cy="48" r="0.8" fill="#1a0505" />
      {/* Щёчные выросты */}
      <path d="M 32 52 L 28 56 L 34 58 Z" fill={p.skin} />
      <path d="M 68 52 L 72 56 L 66 58 Z" fill={p.skin} />
      {/* Жвалы */}
      <path d="M 44 60 L 42 66 L 46 62 Z" fill={p.robeShadow} />
      <path d="M 56 60 L 58 66 L 54 62 Z" fill={p.robeShadow} />
      <path d="M 46 60 Q 50 64 54 60" stroke={p.robeShadow} strokeWidth="1" fill="none" />
    </>
  );
}
