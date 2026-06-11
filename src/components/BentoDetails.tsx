import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Skull, ScrollText, Network, Quote, Sparkle, Clapperboard, Swords,
  CalendarDays, Timer, Milestone, Eye, Fingerprint, MapPin, Crown, Drama, BookOpen,
} from "lucide-react";
import type { Character, RelationshipKind } from "../types";
import { byId } from "../data";
import { StatMeter } from "./StatMeter";
import { AdSlot } from "./AdSlot";

const REL_LABEL: Record<RelationshipKind, string> = {
  family: "Family",
  spouse: "Spouse",
  lover: "Lover",
  mentor: "Mentor",
  apprentice: "Apprentice",
  ally: "Ally",
  rival: "Rival",
  enemy: "Enemy",
  "killer-of": "Killer of",
  "killed-by": "Killed by",
  "sworn-to": "Sworn to",
};

const REL_COLOR: Record<RelationshipKind, string> = {
  family: "border-cerulean/40 text-cerulean",
  spouse: "border-verdant/40 text-verdant",
  lover: "border-blood/40 text-blood",
  mentor: "border-amber-glow/40 text-amber-glow",
  apprentice: "border-amber-glow/40 text-amber-glow",
  ally: "border-verdant/40 text-verdant",
  rival: "border-amber-glow/40 text-amber-glow",
  enemy: "border-blood/40 text-blood",
  "killer-of": "border-blood/40 text-blood",
  "killed-by": "border-blood/40 text-blood",
  "sworn-to": "border-cerulean/40 text-cerulean",
};

function Widget({ icon: Icon, title, children, className = "" }: {
  icon: typeof Skull; title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`bento-card p-4 ${className}`}>
      <h4 className="mb-3 flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-widest text-slate-400">
        <Icon size={13} className="text-amber-glow" /> {title}
      </h4>
      {children}
    </section>
  );
}

function MetaCell({ icon: Icon, label, value }: { icon: typeof Skull; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
      <p className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-slate-500">
        <Icon size={10} /> {label}
      </p>
      <p className="mt-1 font-mono text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}

export function BentoDetails({
  character,
  onClose,
  onNavigate,
}: {
  character: Character | null;
  onClose: () => void;
  onNavigate: (c: Character) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = character ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [character]);

  return (
    <AnimatePresence>
      {character && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm"
        >
          <motion.aside
            key={character.id}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full overflow-y-auto border-l border-slate-700 bg-slate-950 shadow-2xl sm:w-[640px] lg:w-[760px]"
            aria-modal="true"
            role="dialog"
            aria-label={`${character.name} profile`}
          >
            {/* hero */}
            <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 px-5 py-4 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-850 text-3xl">
                    {character.sigil}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-white sm:text-2xl">{character.name}</h2>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-amber-glow">
                      {character.house} · {character.origin} · {character.status}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close profile"
                  className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              {/* alias ticker */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {character.aliases.map((a) => (
                  <span key={a} className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 font-mono text-[9px] text-slate-400">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {/* quote */}
              <Widget icon={Quote} title="Signature Quote" className="sm:col-span-2">
                <blockquote className="font-display text-lg italic leading-snug text-slate-200">
                  “{character.quote}”
                </blockquote>
                <p className="mt-2 font-mono text-[10px] text-slate-500">— portrayed by {character.actor}</p>
              </Widget>

              {/* raw metadata */}
              <Widget icon={Fingerprint} title="Raw Metadata" className="sm:col-span-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <MetaCell icon={CalendarDays} label="Debut" value={`${character.stats.debutEpisode} · ${character.stats.debutYear}`} />
                  <MetaCell icon={Clapperboard} label="Episodes" value={String(character.stats.episodeCount)} />
                  <MetaCell icon={Timer} label="Screen Time" value={`${character.stats.screenTimeMinutes} min`} />
                  <MetaCell icon={Swords} label="Named Kills" value={character.stats.namedKills.toLocaleString()} />
                  <MetaCell icon={Milestone} label="Lore Milestones" value={String(character.stats.loreMilestones)} />
                  <MetaCell icon={MapPin} label="Seat" value={character.seat} />
                  <MetaCell icon={Drama} label="Alignment" value={character.alignment} />
                  <MetaCell icon={Crown} label="First Episode" value={`"${character.firstAppearance.title}"`} />
                </div>
                {character.causeOfDeath && (
                  <p className="mt-3 flex items-start gap-2 rounded-xl border border-blood/30 bg-blood/5 p-2.5 text-xs text-slate-300">
                    <Skull size={13} className="mt-0.5 shrink-0 text-blood" />
                    <span><span className="font-mono text-[10px] uppercase tracking-widest text-blood">Cause of death · </span>{character.causeOfDeath}</span>
                  </p>
                )}
              </Widget>

              {/* attribute meters */}
              <Widget icon={Sparkle} title="Attribute Matrix">
                <div className="space-y-2.5">
                  <StatMeter label="Combat" value={character.stats.combat} accent={character.accent} />
                  <StatMeter label="Intellect" value={character.stats.intellect} accent={character.accent} />
                  <StatMeter label="Loyalty Index" value={character.stats.loyalty} accent={character.accent} />
                  <StatMeter label="Influence" value={character.stats.influence} accent={character.accent} />
                  <StatMeter label="Survivability" value={character.stats.survivability} accent={character.accent} />
                  <StatMeter label="Moral Compass" value={character.stats.moralCompass} accent={character.accent} />
                </div>
              </Widget>

              {/* physical traits */}
              <Widget icon={Eye} title="Physical Profile">
                <dl className="space-y-2 text-sm">
                  {Object.entries({
                    Hair: character.physical.hair,
                    Eyes: character.physical.eyes,
                    Build: character.physical.build,
                    Marks: character.physical.distinguishing,
                  }).map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-mono text-[9px] uppercase tracking-widest text-slate-500">{k}</dt>
                      <dd className="text-xs leading-relaxed text-slate-300">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3 border-t border-slate-800 pt-2">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-slate-500">Titles Held</dt>
                  <ul className="mt-1 space-y-0.5">
                    {character.titles.map((t) => (
                      <li key={t} className="text-xs text-slate-300">• {t}</li>
                    ))}
                  </ul>
                </div>
              </Widget>

              {/* biography */}
              <Widget icon={ScrollText} title="Granular Biography" className="sm:col-span-2">
                <div className="space-y-3">
                  {character.biography.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-slate-300">
                      {i === 0 ? <span className="float-left mr-2 font-display text-4xl font-bold leading-[0.85] text-amber-glow">{p[0]}</span> : null}
                      {i === 0 ? p.slice(1) : p}
                    </p>
                  ))}
                </div>
              </Widget>

              {/* relationship graph */}
              <Widget icon={Network} title="Connection Web" className="sm:col-span-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  {character.relationships.map((rel) => {
                    const target = byId(rel.targetId);
                    return (
                      <button
                        key={`${rel.targetId}-${rel.kind}`}
                        disabled={!target}
                        onClick={() => target && onNavigate(target)}
                        className={`flex items-start gap-2.5 rounded-xl border bg-slate-950/60 p-2.5 text-left transition-colors ${REL_COLOR[rel.kind]} ${target ? "hover:bg-slate-900" : "opacity-60"}`}
                      >
                        <span className="text-lg">{target?.sigil ?? "◌"}</span>
                        <span className="min-w-0">
                          <span className="block font-mono text-[9px] uppercase tracking-widest">{REL_LABEL[rel.kind]}</span>
                          <span className="block truncate font-display text-sm font-semibold text-slate-200">
                            {target?.name ?? rel.targetId}
                          </span>
                          <span className="block text-[11px] leading-snug text-slate-400">{rel.note}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Widget>

              {/* personal timeline */}
              <Widget icon={Milestone} title="Life Timeline" className="sm:col-span-2">
                <ol className="relative ml-2 space-y-4 border-l border-slate-700 pl-5">
                  {character.timeline.map((ev) => (
                    <li key={`${ev.marker}-${ev.title}`} className="relative">
                      <span
                        className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 ${
                          ev.pivotal ? "border-amber-glow bg-amber-glow/30" : "border-slate-600 bg-slate-900"
                        }`}
                      />
                      <p className="font-mono text-[9px] uppercase tracking-widest text-cerulean">{ev.marker} · {ev.era}</p>
                      <p className="font-display text-sm font-semibold text-slate-200">{ev.title}</p>
                      <p className="text-xs leading-relaxed text-slate-400">{ev.description}</p>
                    </li>
                  ))}
                </ol>
              </Widget>

              {/* trivia */}
              <Widget icon={Sparkle} title="Deep-Cut Trivia" className="sm:col-span-2">
                <ul className="space-y-2">
                  {character.trivia.map((t, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-300">
                      <span className="font-mono text-amber-glow">{String(i + 1).padStart(2, "0")}</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </Widget>

              {/* monetization inside drawer */}
              <div className="sm:col-span-2">
                <AdSlot variant="rect" label="In-profile" />
              </div>
              <Widget icon={BookOpen} title="Read the Source Material" className="sm:col-span-2">
                <p className="mb-2 text-xs text-slate-400">
                  {character.name}'s book arc runs far deeper than the screen version. Affiliate links — purchases support the Codex:
                </p>
                <div className="flex flex-wrap gap-2">
                  <a className="rounded-full border border-amber-glow/40 bg-amber-glow/10 px-3 py-1.5 font-mono text-[10px] text-amber-glow hover:bg-amber-glow/20" href="https://www.amazon.com/dp/0553593714?tag=YOUR-AFFILIATE-TAG" target="_blank" rel="noopener sponsored">A Game of Thrones →</a>
                  <a className="rounded-full border border-amber-glow/40 bg-amber-glow/10 px-3 py-1.5 font-mono text-[10px] text-amber-glow hover:bg-amber-glow/20" href="https://www.amazon.com/dp/0345535529?tag=YOUR-AFFILIATE-TAG" target="_blank" rel="noopener sponsored">5-Book Boxed Set →</a>
                  <a className="rounded-full border border-cerulean/40 bg-cerulean/10 px-3 py-1.5 font-mono text-[10px] text-cerulean hover:bg-cerulean/20" href="https://www.amazon.com/dp/1524796280?tag=YOUR-AFFILIATE-TAG" target="_blank" rel="noopener sponsored">Fire &amp; Blood →</a>
                </div>
              </Widget>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
