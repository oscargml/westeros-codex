import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Crown, Database, Users, Network, Sparkles, BookOpen, Dices, ChevronUp,
  Github, ScrollText, Milestone,
} from "lucide-react";
import type { Character, FilterState } from "./types";
import { CHARACTERS, DB_META } from "./data";
import { searchCharacters } from "./search";
import { CharacterCard } from "./components/CharacterCard";
import { RelationshipGraph } from "./components/RelationshipGraph";
import { BentoDetails } from "./components/BentoDetails";
import { Timeline } from "./components/Timeline";
import { TriviaVault } from "./components/TriviaVault";
import { FilterBar } from "./components/FilterBar";
import { AdSlot } from "./components/AdSlot";
import { AmazonAd } from "./components/AmazonAd";

const EMPTY_FILTERS: FilterState = {
  query: "",
  factions: [],
  origins: [],
  alignments: [],
  statuses: [],
  debutSeason: null,
  hairColor: null,
};

const ALL_TRIVIA = CHARACTERS.flatMap((c) => c.trivia.map((t) => ({ who: c.name, sigil: c.sigil, fact: t })));

function StatCounter({ icon: Icon, label, value }: { icon: typeof Crown; label: string; value: number }) {
  return (
    <div className="bento-card flex items-center gap-3 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-850 text-cerulean">
        <Icon size={16} />
      </div>
      <div>
        <p className="font-mono text-lg font-bold leading-none text-white">{value.toLocaleString()}</p>
        <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">{label}</p>
      </div>
    </div>
  );
}

/** Rotating lore-fact ticker — the "stay a while" widget. */
function TriviaTicker({ onRandom }: { onRandom: () => void }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % ALL_TRIVIA.length), 7000);
    return () => clearInterval(t);
  }, []);
  const item = ALL_TRIVIA[idx];
  return (
    <div className="bento-card flex items-center gap-3 p-3">
      <Sparkles size={16} className="shrink-0 text-amber-glow" />
      <div className="min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="truncate text-xs text-slate-300 sm:whitespace-normal sm:line-clamp-2"
          >
            <span className="mr-1 font-mono text-[10px] text-amber-glow">{item.sigil} DID YOU KNOW ·</span>
            {item.fact}
          </motion.p>
        </AnimatePresence>
      </div>
      <button
        onClick={onRandom}
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-cerulean/40 bg-cerulean/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-cerulean hover:bg-cerulean/20"
        title="Open a random character profile"
      >
        <Dices size={12} /> Random
      </button>
    </div>
  );
}

export default function App() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selected, setSelected] = useState<Character | null>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visible = useMemo(() => {
    let pool = CHARACTERS.filter((c) => {
      if (filters.factions.length && !filters.factions.includes(c.house) && !c.affiliations.some((a) => filters.factions.includes(a))) return false;
      if (filters.origins.length && !filters.origins.includes(c.origin)) return false;
      if (filters.alignments.length && !filters.alignments.includes(c.alignment)) return false;
      if (filters.statuses.length && !filters.statuses.includes(c.status)) return false;
      if (filters.debutSeason && c.firstAppearance.season !== filters.debutSeason) return false;
      if (filters.hairColor && !c.physical.hair.toLowerCase().startsWith(filters.hairColor.toLowerCase())) return false;
      return true;
    });
    return searchCharacters(filters.query, pool).map((r) => r.character);
  }, [filters]);

  const openRandom = () => setSelected(CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]);

  return (
    <div className="min-h-screen">
      {/* sticky header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-void/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <a href="#" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-glow/40 bg-amber-glow/10">
              <Crown size={17} className="text-amber-glow" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold leading-none text-white">Westeros Codex</h1>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">GoT Character Database</p>
            </div>
          </a>
          <nav className="hidden items-center gap-4 font-mono text-[11px] uppercase tracking-wide text-slate-400 sm:flex">
            <a href="#codex" className="hover:text-amber-glow">Codex</a>
            <a href="#graph" className="hover:text-amber-glow">Graph</a>
            <a href="#timeline" className="hover:text-amber-glow">Timeline</a>
            <a href="#trivia" className="hover:text-amber-glow">Trivia</a>
            <a href="#library" className="hover:text-amber-glow">Library</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
        {/* hero */}
        <section className="bento-card relative overflow-hidden p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cerulean/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-amber-glow/10 blur-3xl" />
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cerulean">Fan Encyclopedia · Unofficial</p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
              Every life, death &amp; betrayal in the <span className="text-amber-glow">Game of Thrones</span> universe
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
              {DB_META.totalProfiles} granular biographies · {DB_META.totalTimelineEvents} timeline events ·{" "}
              {DB_META.totalRelationships} mapped relationships · {DB_META.totalTriviaFacts} deep-cut trivia facts.
              Filter by house, era, alignment, fate — or roll the dice.
            </p>
          </motion.div>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatCounter icon={Users} label="Profiles" value={DB_META.totalProfiles} />
            <StatCounter icon={Milestone} label="Timeline Events" value={DB_META.totalTimelineEvents} />
            <StatCounter icon={Network} label="Relationships" value={DB_META.totalRelationships} />
            <StatCounter icon={Database} label="Trivia Facts" value={DB_META.totalTriviaFacts} />
          </div>
        </section>

        <TriviaTicker onRandom={openRandom} />
        <AdSlot variant="banner" label="Leaderboard" />

        {/* codex: search + filters + grid */}
        <section id="codex" className="space-y-4">
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            resultCount={visible.length}
            expanded={filtersExpanded}
            setExpanded={setFiltersExpanded}
          />
          <motion.div layout className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {visible.map((c) => (
                <CharacterCard key={c.id} character={c} onSelect={setSelected} />
              ))}
            </AnimatePresence>
          </motion.div>
          {visible.length === 0 && (
            <div className="bento-card p-10 text-center">
              <p className="font-display text-lg text-slate-300">The ravens found nothing.</p>
              <p className="mt-1 font-mono text-xs text-slate-500">Loosen your filters or try another name, alias, or keyword.</p>
            </div>
          )}
        </section>

        {/* interactive relationship graph */}
        <RelationshipGraph onSelect={setSelected} />

        <AdSlot variant="rect" label="Mid-content" />

        {/* master timeline */}
        <Timeline onSelect={setSelected} />

        {/* Amazon affiliate ad banner */}
        <AmazonAd />

        {/* browsable trivia vault */}
        <TriviaVault onSelect={setSelected} />

        {/* monetization / library */}
        <section id="library" className="bento-card p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <BookOpen size={18} className="text-amber-glow" /> The Citadel Library
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Go deeper than the show ever could. These are affiliate links — buying through them supports the Codex at no
            extra cost to you. <span className="font-mono text-[10px] uppercase text-slate-500">(disclosure: as required by the FTC &amp; Amazon Associates)</span>
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "A Song of Ice and Fire — 5-Book Set", note: "The complete saga so far. Start here.", href: "https://www.amazon.com/dp/0345535529?tag=velmorpub-20" },
              { title: "Fire & Blood", note: "300 years of Targaryen history — the House of the Dragon source.", href: "https://www.amazon.com/dp/1524796280?tag=velmorpub-20" },
              { title: "The World of Ice & Fire", note: "Illustrated lore compendium of Westeros & Essos.", href: "https://www.amazon.com/dp/0553805444?tag=velmorpub-20" },
              { title: "GoT: The Complete Series (Blu-ray)", note: "All eight seasons, remastered.", href: "https://www.amazon.com/dp/B07ZHGFW7Q?tag=velmorpub-20" },
            ].map((b) => (
              <a
                key={b.title}
                href={b.href}
                target="_blank"
                rel="noopener sponsored"
                className="group rounded-xl border border-slate-700 bg-slate-950/60 p-4 transition-colors hover:border-amber-glow/50 hover:bg-slate-900"
              >
                <ScrollText size={16} className="text-amber-glow" />
                <p className="mt-2 font-display text-sm font-semibold text-slate-200 group-hover:text-white">{b.title}</p>
                <p className="mt-1 text-[11px] leading-snug text-slate-400">{b.note}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-amber-glow">Shop on Amazon →</p>
              </a>
            ))}
          </div>
        </section>

        <AdSlot variant="banner" label="Footer" />
      </main>

      {/* footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="mx-auto w-full max-w-7xl px-4 text-center">
          <nav className="mb-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">
            <a href="/characters" className="hover:text-amber-glow">All Characters</a>
            <a href="/about" className="hover:text-amber-glow">About</a>
            <a href="/contact" className="hover:text-amber-glow">Contact</a>
            <a href="/privacy" className="hover:text-amber-glow">Privacy</a>
            <a href="/terms" className="hover:text-amber-glow">Terms</a>
            <a href="/disclaimer" className="hover:text-amber-glow">Disclaimer</a>
          </nav>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Westeros Codex — an unofficial fan encyclopedia. Game of Thrones™ &amp; ASOIAF © HBO / George R.R. Martin.
          </p>
          <p className="mt-2 flex items-center justify-center gap-1.5 font-mono text-[10px] text-slate-600">
            <Github size={11} /> Built with Vite · React · Tailwind v4 · Motion
          </p>
        </div>
      </footer>

      {/* back-to-top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="fixed bottom-5 right-5 z-40 rounded-full border border-slate-600 bg-slate-900 p-3 text-slate-300 shadow-xl hover:text-amber-glow"
          >
            <ChevronUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <BentoDetails character={selected} onClose={() => setSelected(null)} onNavigate={setSelected} />
    </div>
  );
}
