import { motion } from "motion/react";

const ACCENTS: Record<string, string> = {
  amber: "var(--color-amber-glow)",
  cerulean: "var(--color-cerulean)",
  blood: "var(--color-blood)",
  verdant: "var(--color-verdant)",
};

export function StatMeter({
  label,
  value,
  accent = "cerulean",
  compact = false,
}: {
  label: string;
  value: number;
  accent?: string;
  compact?: boolean;
}) {
  const color = ACCENTS[accent] ?? ACCENTS.cerulean;
  return (
    <div className={compact ? "space-y-0.5" : "space-y-1"}>
      <div className="flex items-baseline justify-between gap-2">
        <span className={`font-mono uppercase tracking-wider text-slate-400 ${compact ? "text-[9px]" : "text-[10px]"}`}>
          {label}
        </span>
        <span className={`font-mono text-slate-300 ${compact ? "text-[9px]" : "text-[10px]"}`}>{value}</span>
      </div>
      <div className={`w-full overflow-hidden rounded-full bg-slate-800 ${compact ? "h-1" : "h-1.5"}`}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}55, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
