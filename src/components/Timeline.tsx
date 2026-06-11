import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { History, Star } from "lucide-react";
import type { Character, Era } from "../types";
import { ERAS } from "../types";
import { CHARACTERS } from "../data";

interface EraEvent {
  character: Character;
  marker: string;
  title: string;
  description: string;
  pivotal: boolean;
}

/** Chronological master timeline: every character's life events bucketed by era. */
export function Timeline({ onSelect }: { onSelect: (c: Character) => void }) {
  const [activeEra, setActiveEra] = useState<Era>("S1 — The Wolf and the Lion");
  const [pivotalOnly, setPivotalOnly] = useState(false);

  const byEra = useMemo(() => {
    const map = new Map<Era, EraEvent[]>();
    for (const era of ERAS) map.set(era, []);
    for (const c of CHARACTERS) {
      for (const ev of c.timeline) {
        map.get(ev.era)?.push({ character: c, ...ev });
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.marker.localeCompare(b.marker, undefined, { numeric: true }));
    }
    return map;
  }, []);

  const events = (byEra.get(activeEra) ?? []).filter((e) => !pivotalOnly || e.pivotal);

  return (
    <section id="timeline" className="bento-card p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <History size={18} className="text-cerulean" />
          Chronicle of Eras
        </h2>
        <button
          onClick={() => setPivotalOnly(!pivotalOnly)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors ${
            pivotalOnly
              ? "border-amber-glow/60 bg-amber-glow/15 text-amber-glow"
              : "border-slate-700 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Star size={11} /> Pivotal only
        </button>
      </div>

      {/* era selector rail */}
      <div className="-mx-1 mb-5 flex gap-1.5 overflow-x-auto px-1 pb-2">
        {ERAS.map((era) => {
          const count = byEra.get(era)?.length ?? 0;
          const active = era === activeEra;
          return (
            <button
              key={era}
              onClick={() => setActiveEra(era)}
              className={`relative shrink-0 rounded-xl border px-3 py-2 text-left transition-colors ${
                active
                  ? "border-cerulean/60 bg-cerulean/10"
                  : "border-slate-800 bg-slate-900 hover:border-slate-600"
              }`}
            >
              <span className={`block font-mono text-[9px] uppercase tracking-widest ${active ? "text-cerulean" : "text-slate-500"}`}>
                {era.split(" — ")[0]}
              </span>
              <span className={`block font-display text-xs font-semibold ${active ? "text-white" : "text-slate-400"}`}>
                {era.includes("—") ? era.split(" — ")[1] : era}
              </span>
              <span className="mt-0.5 block font-mono text-[9px] text-slate-500">{count} events</span>
              {active && (
                <motion.span layoutId="era-underline" className="absolute inset-x-2 -bottom-px h-px bg-cerulean" />
              )}
            </button>
          );
        })}
      </div>

      {/* events for the active era */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeEra + String(pivotalOnly)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          {events.length === 0 && (
            <p className="col-span-full py-6 text-center font-mono text-xs text-slate-500">
              No recorded events match this era.
            </p>
          )}
          {events.map((ev) => (
            <button
              key={`${ev.character.id}-${ev.title}`}
              onClick={() => onSelect(ev.character)}
              className={`group rounded-xl border p-3 text-left transition-colors hover:bg-slate-900 ${
                ev.pivotal ? "border-amber-glow/30 bg-amber-glow/[0.04]" : "border-slate-800 bg-slate-950/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-cerulean">{ev.marker}</span>
                {ev.pivotal && <Star size={10} className="text-amber-glow" />}
              </div>
              <p className="mt-1 font-display text-sm font-semibold text-slate-200 group-hover:text-white">{ev.title}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-400">{ev.description}</p>
              <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                <span>{ev.character.sigil}</span> {ev.character.name}
              </p>
            </button>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
