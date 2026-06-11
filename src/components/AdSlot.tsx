import { Megaphone } from "lucide-react";

/**
 * AdSense placeholder slot. When going live, replace the inner div with the
 * standard <ins class="adsbygoogle"> snippet and your data-ad-slot id, and
 * enable the adsbygoogle.js script tag in index.html.
 */
export function AdSlot({ variant = "banner", label }: { variant?: "banner" | "rect" | "skyscraper"; label?: string }) {
  const sizes = {
    banner: "h-[90px] w-full",
    rect: "h-[250px] w-full",
    skyscraper: "h-[600px] w-full max-w-[300px]",
  };
  return (
    <div
      className={`bento-card flex items-center justify-center gap-2 border-dashed ${sizes[variant]}`}
      role="complementary"
      aria-label="Advertisement"
      data-ad-placeholder={variant}
    >
      <Megaphone size={14} className="text-slate-500" />
      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
        {label ?? "Advertisement"} · AdSense {variant}
      </span>
    </div>
  );
}
