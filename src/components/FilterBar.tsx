import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Filter, Castle, Globe2, Compass, HeartPulse, Tv, Scissors } from "lucide-react";
import type { Alignment, Faction, FilterState, LifeStatus, Region } from "../types";
import { CHARACTERS } from "../data";

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      layout
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors ${
        active
          ? "border-amber-glow/60 bg-amber-glow/15 text-amber-glow"
          : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-slate-200"
      }`}
    >
      {label}
    </motion.button>
  );
}

function Group({ icon: Icon, title, children }: { icon: typeof Castle; title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
        <Icon size={11} /> {title}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function FilterBar({
  filters,
  setFilters,
  resultCount,
  expanded,
  setExpanded,
}: {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  resultCount: number;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}) {
  const factions = useMemo(() => [...new Set(CHARACTERS.map((c) => c.house))].sort(), []);
  const origins = useMemo(() => [...new Set(CHARACTERS.map((c) => c.origin))].sort(), []);
  const alignments = useMemo(() => [...new Set(CHARACTERS.map((c) => c.alignment))].sort(), []);
  const statuses: LifeStatus[] = ["Alive", "Deceased", "Resurrected", "Transformed"];
  const hairColors = useMemo(
    () => [...new Set(CHARACTERS.map((c) => c.physical.hair.split(/[ ,(—-]/)[0]))].filter(Boolean).sort(),
    []
  );
  const seasons = [1, 2, 3, 4, 5, 6, 7, 8];

  const toggle = <T,>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const activeCount =
    filters.factions.length +
    filters.origins.length +
    filters.alignments.length +
    filters.statuses.length +
    (filters.debutSeason ? 1 : 0) +
    (filters.hairColor ? 1 : 0);

  return (
    <motion.div layout className="bento-card p-4">
      {/* search row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            placeholder="Fuzzy search — names, aliases, episodes, lore keywords…"
            aria-label="Search characters"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-9 font-sans text-sm text-slate-200 placeholder:text-slate-500 focus:border-cerulean/60 focus:outline-none focus:ring-1 focus:ring-cerulean/40"
          />
          {filters.query && (
            <button
              onClick={() => setFilters({ ...filters, query: "" })}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
            expanded || activeCount > 0
              ? "border-amber-glow/50 bg-amber-glow/10 text-amber-glow"
              : "border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Filter size={13} />
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-amber-glow/20 px-1.5 text-[10px]">{activeCount}</span>
          )}
        </motion.button>
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-slate-500">
        <span>{resultCount} profile{resultCount === 1 ? "" : "s"} matched</span>
        {activeCount > 0 && (
          <button
            onClick={() =>
              setFilters({ query: filters.query, factions: [], origins: [], alignments: [], statuses: [], debutSeason: null, hairColor: null })
            }
            className="text-blood hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* expandable filter groups */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-4 border-t border-slate-800 pt-4 sm:grid-cols-2">
              <Group icon={Castle} title="Faction / House">
                {factions.map((f) => (
                  <Chip
                    key={f}
                    label={f}
                    active={filters.factions.includes(f)}
                    onClick={() => setFilters({ ...filters, factions: toggle(filters.factions, f as Faction) })}
                  />
                ))}
              </Group>
              <Group icon={Globe2} title="Origin Region">
                {origins.map((o) => (
                  <Chip
                    key={o}
                    label={o}
                    active={filters.origins.includes(o)}
                    onClick={() => setFilters({ ...filters, origins: toggle(filters.origins, o as Region) })}
                  />
                ))}
              </Group>
              <Group icon={Compass} title="Core Alignment">
                {alignments.map((a) => (
                  <Chip
                    key={a}
                    label={a}
                    active={filters.alignments.includes(a)}
                    onClick={() => setFilters({ ...filters, alignments: toggle(filters.alignments, a as Alignment) })}
                  />
                ))}
              </Group>
              <Group icon={HeartPulse} title="Life Status">
                {statuses.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    active={filters.statuses.includes(s)}
                    onClick={() => setFilters({ ...filters, statuses: toggle(filters.statuses, s) })}
                  />
                ))}
              </Group>
              <Group icon={Tv} title="Debut Season">
                {seasons.map((s) => (
                  <Chip
                    key={s}
                    label={`S${s}`}
                    active={filters.debutSeason === s}
                    onClick={() => setFilters({ ...filters, debutSeason: filters.debutSeason === s ? null : s })}
                  />
                ))}
              </Group>
              <Group icon={Scissors} title="Hair (Physical Trait)">
                {hairColors.map((h) => (
                  <Chip
                    key={h}
                    label={h}
                    active={filters.hairColor === h}
                    onClick={() => setFilters({ ...filters, hairColor: filters.hairColor === h ? null : h })}
                  />
                ))}
              </Group>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
