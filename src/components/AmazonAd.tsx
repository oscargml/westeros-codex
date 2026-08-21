import { ShoppingBag, ExternalLink } from "lucide-react";

const AMAZON_AFFILIATE_URL =
  "https://www.amazon.com?&linkCode=ll2&tag=velmorpub-20&linkId=28d299a5e0360846a7420147af6e1aa1&language=en_US&ref_=as_li_ss_tl";

/** Amazon affiliate ad banner — full-width promo card linking to Amazon. */
export function AmazonAd() {
  return (
    <section aria-label="Advertisement" className="bento-card relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-glow/10 blur-3xl" />
      <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-slate-500">Sponsored · Affiliate Link</p>
      <div className="mt-3 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-glow/40 bg-amber-glow/10">
            <ShoppingBag size={22} className="text-amber-glow" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white">Stock your keep on Amazon</h2>
            <p className="mt-0.5 max-w-xl text-sm leading-relaxed text-slate-400">
              Books, box sets, collectibles &amp; everything else — shopping through this link supports the Codex at no
              extra cost to you.
            </p>
          </div>
        </div>
        <a
          href={AMAZON_AFFILIATE_URL}
          target="_blank"
          rel="noopener sponsored"
          className="flex shrink-0 items-center gap-2 rounded-full border border-amber-glow/50 bg-amber-glow/10 px-5 py-2.5 font-mono text-[11px] uppercase tracking-wide text-amber-glow transition-colors hover:bg-amber-glow/20"
        >
          Shop on Amazon <ExternalLink size={13} />
        </a>
      </div>
    </section>
  );
}
