import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { CHARACTERS } from '@/data/characters';
import { useHolocronStore } from '@/store/holocron-store';
import { CharacterPortrait } from '@/components/CharacterPortrait';

const RELATION_LABEL: Record<string, string> = {
  father: 'отец',
  mother: 'мать',
  child: 'ребёнок',
  sibling: 'брат/сестра',
  apprentice: 'ученик',
  master: 'учитель',
  killed: 'убил',
  ally: 'союзник',
  rival: 'соперник',
};

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
}

function computeLayout(ids: string[]): Node[] {
  const R = 220;
  const cx = 0;
  const cy = 0;
  return ids.map((id, i) => {
    const angle = (i / ids.length) * Math.PI * 2 - Math.PI / 2;
    return {
      id,
      name: CHARACTERS.find((c) => c.id === id)?.name ?? id,
      x: cx + Math.cos(angle) * R,
      y: cy + Math.sin(angle) * R,
    };
  });
}

const AVATAR_R = 24;

export function CharacterGraph() {
  const eraId = useHolocronStore((s) => s.eraId);

  const { nodes, edges } = useMemo(() => {
    const inEra = CHARACTERS.filter((c) => c.eras.includes(eraId));
    const ids = inEra.map((c) => c.id);
    const layout = computeLayout(ids);
    const byId = new Map(layout.map((n) => [n.id, n]));
    const es = inEra.flatMap((c) =>
      c.relations
        .filter((r) => byId.has(r.targetId))
        .map((r) => ({
          from: byId.get(c.id)!,
          to: byId.get(r.targetId)!,
          kind: r.kind,
          id: `${c.id}->${r.targetId}:${r.kind}`,
        })),
    );
    return { nodes: layout, edges: es };
  }, [eraId]);

  return (
    <div className="scrollbar-holo h-full overflow-y-auto px-6 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4">
          <h2 className="holo-title text-lg">Граф связей персонажей</h2>
          <p className="mt-1 text-sm text-holo-bone/60">
            Фильтр по эпохе. Позже — federation поверх Neo4j (кто кому родня, кто кого убил).
          </p>
        </div>

        <div className="holo-panel relative overflow-hidden">
          <svg viewBox="-320 -280 640 560" className="h-[560px] w-full">
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#6ea8ff" opacity="0.7" />
              </marker>
            </defs>

            {edges.map((e) => (
              <g key={e.id}>
                <line
                  x1={e.from.x}
                  y1={e.from.y}
                  x2={e.to.x}
                  y2={e.to.y}
                  stroke="#6ea8ff"
                  strokeOpacity="0.25"
                  strokeWidth="1"
                  markerEnd="url(#arrow)"
                />
                <text
                  x={(e.from.x + e.to.x) / 2}
                  y={(e.from.y + e.to.y) / 2}
                  fill="#a5c8ff"
                  fontSize="9"
                  textAnchor="middle"
                  className="font-mono"
                  opacity="0.7"
                >
                  {RELATION_LABEL[e.kind] ?? e.kind}
                </text>
              </g>
            ))}

            {nodes.map((n, i) => (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={AVATAR_R + 3}
                  fill="#0a1330"
                  stroke="#6ea8ff"
                  strokeWidth="1.5"
                />
                <foreignObject
                  x={n.x - AVATAR_R}
                  y={n.y - AVATAR_R}
                  width={AVATAR_R * 2}
                  height={AVATAR_R * 2}
                >
                  <div style={{ width: '100%', height: '100%', clipPath: 'circle(50%)' }}>
                    <CharacterPortrait characterId={n.id} size={AVATAR_R * 2} />
                  </div>
                </foreignObject>
                <text
                  x={n.x}
                  y={n.y + AVATAR_R + 18}
                  fill="#e8ecf5"
                  fontSize="11"
                  textAnchor="middle"
                  className="font-sans"
                >
                  {n.name}
                </text>
              </motion.g>
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-holo-void/40 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}
