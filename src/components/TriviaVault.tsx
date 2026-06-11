import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Shuffle, ChevronDown } from "lucide-react";
import type { Character } from "../types";
import { CHARACTERS } from "../data";

interface Fact {
  character: Character;
  fact: string;
}

const PAGE = 12;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TriviaVault({ onSelect }: { onSelect: (c: Character) => void }) {
  const allFacts = useMemo<Fact[]>(
    () => CHARACTERS.flatMap((c) => c.trivia.map((fact) => ({ character: c, fact }))),
    []
  );
  const [who, setWho] = useState<string | null>(null);
  const [order, setOrder] = useState<Fact[]>(allFacts);
  const [limit, setLimit] = useState(PAGE);

  const facts = useMemo(
    () => (who ? order.filter((f) => f.character.id === who) : order),
    [order, who]
  );
  const shown = facts.slice(0, limit);

  return (
    <section id="trivia" className="bento-card p-4 sm:p-6">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <Sparkles size={18} className="text-amber-glow" /> The Trivia Vault
        </h2>
        <button
          onClick={() => { setOrder(shuffle(allFacts)); setLimit(PAGE); }}
          className="flex items-center gap-1.5 rounded-full border border-cerulean/40 bg-cerulean/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-cerulean hover:bg-cerulean/20"
        >
          <Shuffle size={12} /> Shuffle
        </button>
      </div>
      <p className="mb-4 max-w-2xl text-xs text-slate-400">
        All {allFacts.length} deep-cut facts from the database — production secrets, lore connections, and numbers the
        show never said out loud. Tap a sigil to open that character's full profile.
      </p>

      {/* character filter chips */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          onClick={() => { setWho(null); setLimit(PAGE); }}
          className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${
            who === null
              ? "border-amber-glow/60 bg-amber-glow/15 text-amber-glow"
              : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500"
          }`}
        >
          All
        </button>
        {CHARACTERS.map((c) => (
          <button
            key={c.id}
            onClick={() => { setWho(who === c.id ? null : c.id); setLimit(PAGE); }}
            title={c.name}
            className={`rounded-full border px-2 py-1 text-xs leading-none ${
              who === c.id
                ? "border-amber-glow/60 bg-amber-glow/15"
                : "border-slate-700 bg-slate-900 hover:border-slate-500"
            }`}
          >
            {c.sigil}
          </button>
        ))}
      </div>

      {/* fact grid */}
      <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((f, i) => (
            <motion.article
              key={`${f.character.id}-${f.fact.slice(0, 24)}`}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.2) }}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <button
                onClick={() => onSelect(f.character)}
                className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-cerulean hover:text-amber-glow"
              >
                <span className="text-sm">{f.character.sigil}</span> {f.character.name}
              </button>
              <p className="text-xs leading-relaxed text-slate-300">{f.fact}</p>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {shown.length < facts.length && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setLimit((l) => l + PAGE)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-900 px-4 py-2 font-mono text-[10px] uppercase tracking-wide text-slate-300 hover:border-amber-glow/50 hover:text-amber-glow"
          >
            <ChevronDown size={12} /> Show {Math.min(PAGE, facts.length - shown.length)} more ({facts.length - shown.length} left)
          </button>
        </div>
      )}
    </section>
  );
}
