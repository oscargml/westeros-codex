import { forwardRef } from "react";
import { motion } from "motion/react";
import { Skull, HeartPulse, Sparkles, Snowflake, Clapperboard, Swords, CalendarDays } from "lucide-react";
import type { Character } from "../types";
import { StatMeter } from "./StatMeter";

const STATUS_META: Record<Character["status"], { icon: typeof Skull; cls: string }> = {
  Alive: { icon: HeartPulse, cls: "text-verdant border-verdant/40 bg-verdant/10" },
  Deceased: { icon: Skull, cls: "text-blood border-blood/40 bg-blood/10" },
  Resurrected: { icon: Sparkles, cls: "text-amber-glow border-amber-glow/40 bg-amber-glow/10" },
  Transformed: { icon: Snowflake, cls: "text-cerulean border-cerulean/40 bg-cerulean/10" },
};

const ACCENT_RING: Record<Character["accent"], string> = {
  amber: "hover:glow-amber",
  cerulean: "hover:glow-cerulean",
  blood: "hover:glow-amber",
  verdant: "hover:glow-cerulean",
};

export const CharacterCard = forwardRef<HTMLButtonElement, { character: Character; onSelect: (c: Character) => void }>(
  function CharacterCard({ character, onSelect }, ref) {
  const status = STATUS_META[character.status];
  const StatusIcon = status.icon;

  return (
    <motion.button
      ref={ref}
      layout
      layoutId={`card-${character.id}`}
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(character)}
      className={`bento-card group cursor-pointer p-4 text-left transition-shadow duration-300 ${ACCENT_RING[character.accent]}`}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-850 text-xl">
            {character.sigil}
          </div>
          <div>
            <h3 className="font-display text-base font-semibold leading-tight text-slate-200 group-hover:text-white">
              {character.name}
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">{character.house}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide ${status.cls}`}>
          <StatusIcon size={10} />
          {character.status}
        </span>
      </div>

      {/* alias strip */}
      <p className="mt-3 line-clamp-1 font-sans text-xs italic text-slate-400">
        “{character.aliases[0] ?? character.titles[0]}”
      </p>

      {/* meters */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
        <StatMeter label="Combat" value={character.stats.combat} accent={character.accent} compact />
        <StatMeter label="Intellect" value={character.stats.intellect} accent={character.accent} compact />
        <StatMeter label="Influence" value={character.stats.influence} accent={character.accent} compact />
        <StatMeter label="Survival" value={character.stats.survivability} accent={character.accent} compact />
      </div>

      {/* raw metadata footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 font-mono text-[10px] text-slate-500">
        <span className="flex items-center gap-1" title="Episodes">
          <Clapperboard size={11} /> {character.stats.episodeCount} eps
        </span>
        <span className="flex items-center gap-1" title="Named kills">
          <Swords size={11} /> {character.stats.namedKills.toLocaleString()} kills
        </span>
        <span className="flex items-center gap-1" title="Debut">
          <CalendarDays size={11} /> {character.stats.debutEpisode}
        </span>
      </div>
    </motion.button>
  );
});
