import { useEffect, useRef } from "react";

const AD_CLIENT = "ca-pub-8643026289824701";

/**
 * Slot IDs come from AdSense → Ads → By ad unit → Display ads.
 * Create one responsive display unit per placement and paste its
 * data-ad-slot id here. Empty string = slot not created yet, renders nothing.
 */
const AD_SLOTS: Record<string, string> = {
  Leaderboard: "",
  "Mid-content": "",
  Footer: "",
  "In-profile": "",
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ variant = "banner", label }: { variant?: "banner" | "rect" | "skyscraper"; label?: string }) {
  const slot = AD_SLOTS[label ?? ""] ?? "";
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!slot || pushed.current || !insRef.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ad blocker or script not loaded — fail silently
    }
  }, [slot]);

  if (!slot) return null;

  const minHeights = { banner: 90, rect: 250, skyscraper: 600 };

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: "block", minHeight: minHeights[variant] }}
      data-ad-client={AD_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
