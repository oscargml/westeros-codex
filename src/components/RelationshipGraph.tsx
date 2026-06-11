import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Share2, MousePointerClick } from "lucide-react";
import type { Character, Faction, RelationshipKind } from "../types";
import { CHARACTERS, byId } from "../data";

/* ---------- edge taxonomy: collapse 11 relationship kinds into 5 visual categories ---------- */

type EdgeCategory = "family" | "romance" | "bond" | "conflict" | "death";

const KIND_TO_CATEGORY: Record<RelationshipKind, EdgeCategory> = {
  family: "family",
  spouse: "family",
  lover: "romance",
  mentor: "bond",
  apprentice: "bond",
  ally: "bond",
  "sworn-to": "bond",
  rival: "conflict",
  enemy: "conflict",
  "killer-of": "death",
  "killed-by": "death",
};

const CATEGORY_META: Record<EdgeCategory, { label: string; color: string; dash?: string }> = {
  family: { label: "Family & Marriage", color: "#4fb6e8" },
  romance: { label: "Romance", color: "#e879b9" },
  bond: { label: "Alliance / Mentorship", color: "#5dc78a" },
  conflict: { label: "Rivalry / Enmity", color: "#f5b952", dash: "5 4" },
  death: { label: "Killer ↔ Victim", color: "#e05a5a", dash: "2 4" },
};

/* ---------- house clusters: every faction gets a color and a sector of the canvas ---------- */

const HOUSE_COLOR: Record<string, string> = {
  "House Stark": "#8fb8d8",
  "House Lannister": "#f5b952",
  "House Targaryen": "#e05a5a",
  "House Baratheon": "#d8c46a",
  "The Crown": "#b48ad8",
  "House Clegane": "#9aa56b",
  "House Bolton": "#d87a6a",
  "Free Folk": "#7ad8c4",
  "Army of the Dead": "#6ad0f0",
};

interface GraphNode {
  c: Character;
  x: number;
  y: number;
}

interface GraphEdge {
  a: string;
  b: string;
  category: EdgeCategory;
  note: string;
}

const W = 1000;
const H = 660;
const CX = W / 2;
const CY = H / 2;

/** Deterministic cluster layout: houses arranged radially, members fanned within their sector. */
function computeLayout(): GraphNode[] {
  const clusters = new Map<Faction, Character[]>();
  for (const c of CHARACTERS) {
    const list = clusters.get(c.house) ?? [];
    list.push(c);
    clusters.set(c.house, list);
  }
  // big clusters first so they get the widest sectors
  const ordered = [...clusters.entries()].sort((a, b) => b[1].length - a[1].length);
  const totalWeight = ordered.reduce((n, [, members]) => n + members.length + 1.6, 0);

  const nodes: GraphNode[] = [];
  let angleCursor = -Math.PI / 2; // start at 12 o'clock
  for (const [, members] of ordered) {
    const sector = ((members.length + 1.6) / totalWeight) * Math.PI * 2;
    const mid = angleCursor + sector / 2;
    const clusterR = members.length === 1 ? 250 : 235;
    const ccx = CX + Math.cos(mid) * clusterR * 0.92;
    const ccy = CY + Math.sin(mid) * clusterR * 0.62; // squash to ellipse
    // fan members around the cluster centre
    members.forEach((c, i) => {
      if (members.length === 1) {
        nodes.push({ c, x: ccx, y: ccy });
        return;
      }
      const fan = (i / members.length) * Math.PI * 2 + mid;
      const r = members.length > 4 ? 62 : 44;
      nodes.push({ c, x: ccx + Math.cos(fan) * r, y: ccy + Math.sin(fan) * r * 0.85 });
    });
    angleCursor += sector;
  }
  return nodes;
}

/** Dedupe bidirectional relationships into single edges. */
function computeEdges(): GraphEdge[] {
  const seen = new Map<string, GraphEdge>();
  for (const c of CHARACTERS) {
    for (const rel of c.relationships) {
      if (!byId(rel.targetId)) continue;
      const [a, b] = [c.id, rel.targetId].sort();
      const category = KIND_TO_CATEGORY[rel.kind];
      const key = `${a}|${b}|${category}`;
      if (!seen.has(key)) seen.set(key, { a, b, category, note: rel.note });
    }
  }
  return [...seen.values()];
}

export function RelationshipGraph({ onSelect }: { onSelect: (c: Character) => void }) {
  const nodes = useMemo(computeLayout, []);
  const edges = useMemo(computeEdges, []);
  const pos = useMemo(() => new Map(nodes.map((n) => [n.c.id, n])), [nodes]);

  const [focus, setFocus] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [activeCats, setActiveCats] = useState<Set<EdgeCategory>>(
    () => new Set(Object.keys(CATEGORY_META) as EdgeCategory[])
  );

  const active = hover ?? focus;
  const neighbors = useMemo(() => {
    if (!active) return null;
    const set = new Set<string>([active]);
    for (const e of edges) {
      if (!activeCats.has(e.category)) continue;
      if (e.a === active) set.add(e.b);
      if (e.b === active) set.add(e.a);
    }
    return set;
  }, [active, edges, activeCats]);

  const toggleCat = (cat: EdgeCategory) =>
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  const handleNodeClick = (id: string) => {
    if (focus === id) {
      const c = byId(id);
      if (c) onSelect(c);
    } else {
      setFocus(id);
    }
  };

  const visibleEdges = edges.filter((e) => activeCats.has(e.category));
  const houses = useMemo(() => [...new Set(CHARACTERS.map((c) => c.house))], []);

  return (
    <section id="graph" className="bento-card p-4 sm:p-6">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <Share2 size={18} className="text-amber-glow" />
          The Web of Westeros
        </h2>
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-slate-500">
          <MousePointerClick size={11} />
          tap to focus · tap again for profile
        </p>
      </div>
      <p className="mb-4 max-w-2xl text-xs text-slate-400">
        Every recorded connection between all {CHARACTERS.length} profiles — clustered by house and clan, colored by
        the nature of the bond. {visibleEdges.length} edges shown.
      </p>

      {/* edge-category filter */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(Object.entries(CATEGORY_META) as [EdgeCategory, (typeof CATEGORY_META)[EdgeCategory]][]).map(
          ([cat, meta]) => (
            <button
              key={cat}
              onClick={() => toggleCat(cat)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-opacity ${
                activeCats.has(cat) ? "border-slate-600 bg-slate-900 text-slate-200" : "border-slate-800 text-slate-600 opacity-50"
              }`}
            >
              <svg width="18" height="6">
                <line x1="0" y1="3" x2="18" y2="3" stroke={meta.color} strokeWidth="2" strokeDasharray={meta.dash} />
              </svg>
              {meta.label}
            </button>
          )
        )}
        {focus && (
          <button
            onClick={() => setFocus(null)}
            className="rounded-full border border-blood/50 bg-blood/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-blood"
          >
            Clear focus
          </button>
        )}
      </div>

      {/* the graph */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full select-none" role="img" aria-label="Character relationship graph">
          {/* edges */}
          <g>
            {visibleEdges.map((e) => {
              const A = pos.get(e.a);
              const B = pos.get(e.b);
              if (!A || !B) return null;
              const meta = CATEGORY_META[e.category];
              const lit = !neighbors || (neighbors.has(e.a) && neighbors.has(e.b) && (e.a === active || e.b === active));
              // curve through an offset midpoint for readability
              const mx = (A.x + B.x) / 2 + (A.y - B.y) * 0.12;
              const my = (A.y + B.y) / 2 + (B.x - A.x) * 0.12;
              return (
                <motion.path
                  key={`${e.a}-${e.b}-${e.category}`}
                  d={`M ${A.x} ${A.y} Q ${mx} ${my} ${B.x} ${B.y}`}
                  fill="none"
                  stroke={meta.color}
                  strokeDasharray={meta.dash}
                  initial={false}
                  animate={{ opacity: lit ? 0.85 : neighbors ? 0.06 : 0.3, strokeWidth: lit && neighbors ? 2.2 : 1.2 }}
                  transition={{ duration: 0.25 }}
                >
                  <title>{e.note}</title>
                </motion.path>
              );
            })}
          </g>
          {/* nodes */}
          <g>
            {nodes.map((n) => {
              const lit = !neighbors || neighbors.has(n.c.id);
              const isActive = active === n.c.id;
              const color = HOUSE_COLOR[n.c.house] ?? "#8593ab";
              return (
                <motion.g
                  key={n.c.id}
                  initial={false}
                  animate={{ opacity: lit ? 1 : 0.18, scale: isActive ? 1.18 : 1 }}
                  transition={{ duration: 0.25 }}
                  style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                  className="cursor-pointer"
                  onMouseEnter={() => setHover(n.c.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => handleNodeClick(n.c.id)}
                >
                  {isActive && <circle cx={n.x} cy={n.y} r={26} fill={color} opacity={0.18} />}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={17}
                    fill="#151b27"
                    stroke={color}
                    strokeWidth={n.c.status === "Deceased" ? 1.2 : 2.4}
                    strokeDasharray={n.c.status === "Deceased" ? "3 3" : undefined}
                  />
                  <text x={n.x} y={n.y + 5.5} textAnchor="middle" fontSize="15">
                    {n.c.sigil}
                  </text>
                  <text
                    x={n.x}
                    y={n.y + 33}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontFamily="JetBrains Mono, monospace"
                    fill={isActive ? "#ffffff" : "#aeb9cc"}
                  >
                    {n.c.name.split(" ")[0]}
                  </text>
                  <title>{`${n.c.name} — ${n.c.house} (${n.c.status})`}</title>
                </motion.g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* house legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {houses.map((h) => (
          <span key={h} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full border" style={{ borderColor: HOUSE_COLOR[h], background: `${HOUSE_COLOR[h]}33` }} />
            {h}
          </span>
        ))}
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-slate-500">
          <span className="h-2.5 w-2.5 rounded-full border border-dashed border-slate-500" />
          dashed ring = deceased
        </span>
      </div>
    </section>
  );
}
