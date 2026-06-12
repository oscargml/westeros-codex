/**
 * Post-build prerenderer for Westeros Codex.
 *
 * Reads the same character data the React app uses (src/data.ts) and emits
 * fully static, crawlable HTML so search engines and ad reviewers see real
 * content per character instead of an empty SPA shell:
 *
 *   dist/c/<id>.html      one rich page per character (~20 URLs)
 *   dist/characters.html  a browsable index linking every profile
 *   dist/sitemap.xml      every real canonical URL (home, legal, characters)
 *
 * Runs via `tsx scripts/prerender.mts` after `vite build`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CHARACTERS } from "../src/data.ts";
import type { Character } from "../src/types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "..", "dist");
const ORIGIN = "https://gameofthrones.uk";
const TODAY = new Date().toISOString().slice(0, 10);

const nameById = new Map(CHARACTERS.map((c) => [c.id, c.name] as const));

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const HEADER = (active: string) => `  <header class="site-header">
    <div class="bar">
      <a class="brand" href="/">
        <span class="sigil">👑</span>
        <span><span class="name">Westeros Codex</span><p class="tag">GoT Character Database</p></span>
      </a>
      <nav class="site-nav">
        <a href="/">Codex</a>
        <a href="/characters">Characters</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy</a>
      </nav>
    </div>
  </header>`;

const FOOTER = `  <footer class="site-footer">
    <div class="wrap">
      <div class="links">
        <a href="/">Home</a>
        <a href="/characters">Characters</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/disclaimer">Disclaimer</a>
      </div>
      <p class="legal">Westeros Codex — an unofficial fan encyclopedia. Game of Thrones™ &amp; ASOIAF © HBO / George R. R. Martin.</p>
    </div>
  </footer>`;

const FONTS = `  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />`;

const ADSENSE = `  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8643026289824701" crossorigin="anonymous"></script>`;

const ANALYTICS = `  <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZRJR6F1N3B"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-ZRJR6F1N3B');</script>`;

const FAVICON = `  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐺</text></svg>" />`;

function statRow(label: string, value: number, max = 100): string {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return `<tr><th scope="row" style="text-align:left;font-weight:500;color:var(--slate-300);padding:0.3rem 0.75rem 0.3rem 0;">${label}</th><td style="padding:0.3rem 0;"><span style="display:inline-block;height:8px;width:120px;background:var(--slate-800);border-radius:4px;vertical-align:middle;overflow:hidden;"><span style="display:block;height:100%;width:${pct}%;background:var(--amber);"></span></span> <span style="font-family:var(--mono);font-size:0.8rem;color:var(--slate-200);">${value}</span></td></tr>`;
}

function characterPage(c: Character): string {
  const desc = `${c.name} — ${c.house}, ${c.status}. ${c.biography[0].slice(0, 150)}…`;
  const url = `${ORIGIN}/c/${c.id}`;
  const bio = c.biography.map((p) => `<p>${esc(p)}</p>`).join("\n        ");
  const aliases = c.aliases.length ? `<p class="muted"><strong>Also known as:</strong> ${c.aliases.map(esc).join(" · ")}</p>` : "";
  const titles = c.titles.length ? `<p class="muted"><strong>Titles:</strong> ${c.titles.map(esc).join(" · ")}</p>` : "";

  const timeline = c.timeline
    .map(
      (t) => `<li${t.pivotal ? ' style="list-style:none;margin-left:-1.2rem;"' : ""}>${t.pivotal ? "⭐ " : ""}<span style="font-family:var(--mono);font-size:0.72rem;color:var(--cerulean);">${esc(t.marker)}</span> — <strong>${esc(t.title)}</strong>: ${esc(t.description)}</li>`,
    )
    .join("\n          ");

  const rels = c.relationships
    .map((r) => {
      const tname = nameById.get(r.targetId);
      const link = tname ? `<a href="/c/${r.targetId}">${esc(tname)}</a>` : esc(r.targetId);
      return `<li><span style="font-family:var(--mono);font-size:0.68rem;text-transform:uppercase;color:var(--slate-500);">${esc(r.kind)}</span> ${link} — ${esc(r.note)}</li>`;
    })
    .join("\n          ");

  const trivia = c.trivia.map((t) => `<li>${esc(t)}</li>`).join("\n          ");

  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${c.name} — Character Profile`,
    description: desc,
    author: { "@type": "Organization", name: "Westeros Codex" },
    publisher: { "@type": "Organization", name: "Westeros Codex" },
    dateModified: TODAY,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    about: {
      "@type": "Person",
      name: c.name,
      alternateName: c.aliases,
      description: desc,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: ORIGIN + "/" },
      { "@type": "ListItem", position: 2, name: "Characters", item: ORIGIN + "/characters" },
      { "@type": "ListItem", position: 3, name: c.name, item: url },
    ],
  };

  return `<!doctype html>
<html lang="en">
<head>
${ADSENSE}
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(c.name)} — Biography, Timeline &amp; Stats | Westeros Codex</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="keywords" content="${esc([c.name, ...c.aliases, c.house, ...c.keywords, "Game of Thrones"].join(", "))}" />
  <meta name="author" content="Westeros Codex" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${esc(c.name)} — Westeros Codex" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${ORIGIN}/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
${FAVICON}
${FONTS}
  <link rel="stylesheet" href="/site.css" />
${ANALYTICS}
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
</head>
<body>
${HEADER("characters")}
  <main>
    <div class="wrap">
      <p class="muted" style="margin-bottom:0.5rem;"><a href="/">Home</a> › <a href="/characters">Characters</a> › ${esc(c.name)}</p>
      <article class="card">
        <p class="kicker">${c.sigil} ${esc(c.house)} · ${esc(c.status)}</p>
        <h1 class="title">${esc(c.name)}</h1>
        ${aliases}
        ${titles}
        <p class="muted"><strong>Portrayed by:</strong> ${esc(c.actor)} · <strong>Origin:</strong> ${esc(c.origin)} · <strong>Seat:</strong> ${esc(c.seat)} · <strong>First appears:</strong> S${c.firstAppearance.season}E${c.firstAppearance.episode} “${esc(c.firstAppearance.title)}”${c.causeOfDeath ? ` · <strong>Fate:</strong> ${esc(c.causeOfDeath)}` : ""}</p>

        <blockquote style="border-left:3px solid var(--amber);margin:1.5rem 0;padding:0.25rem 0 0.25rem 1rem;font-family:var(--display);font-size:1.2rem;color:#fff;font-style:italic;">“${esc(c.quote)}”</blockquote>

        <h2>Biography</h2>
        ${bio}

        <h2>Attributes &amp; statistics</h2>
        <p class="muted">Editorial scores (0–100) and metadata — our own estimates for comparison, not official canon.</p>
        <table style="border-collapse:collapse;margin:0.5rem 0 1rem;">
          ${statRow("Combat", c.stats.combat)}
          ${statRow("Intellect", c.stats.intellect)}
          ${statRow("Loyalty", c.stats.loyalty)}
          ${statRow("Influence", c.stats.influence)}
          ${statRow("Survivability", c.stats.survivability)}
          ${statRow("Moral compass", c.stats.moralCompass)}
        </table>
        <p class="muted">Screen time: <strong>${c.stats.screenTimeMinutes} min</strong> across <strong>${c.stats.episodeCount} episodes</strong> · Named on-screen kills: <strong>${c.stats.namedKills}</strong> · Lore milestones: <strong>${c.stats.loreMilestones}</strong> · Debut: <strong>${esc(c.stats.debutEpisode)} (${c.stats.debutYear})</strong></p>

        <h2>Timeline</h2>
        <ul>
          ${timeline}
        </ul>

        <h2>Key relationships</h2>
        <ul>
          ${rels}
        </ul>

        <h2>Trivia</h2>
        <ul>
          ${trivia}
        </ul>

        <a class="btn" href="/characters">← All characters</a>
      </article>
    </div>
  </main>
${FOOTER}
</body>
</html>
`;
}

function indexPage(): string {
  const byHouse = new Map<string, Character[]>();
  for (const c of CHARACTERS) {
    const arr = byHouse.get(c.house) ?? [];
    arr.push(c);
    byHouse.set(c.house, arr);
  }
  const sections = [...byHouse.entries()]
    .map(
      ([house, chars]) => `        <h2>${esc(house)}</h2>
        <ul style="columns:2;gap:1.5rem;">
          ${chars.map((c) => `<li><a href="/c/${c.id}">${c.sigil} ${esc(c.name)}</a> <span class="muted">— ${esc(c.status)}</span></li>`).join("\n          ")}
        </ul>`,
    )
    .join("\n");

  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Game of Thrones Characters — Westeros Codex",
    url: `${ORIGIN}/characters`,
    description: `An index of ${CHARACTERS.length} Game of Thrones character profiles with original biographies, timelines and statistics.`,
  };

  return `<!doctype html>
<html lang="en">
<head>
${ADSENSE}
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>All Characters — Game of Thrones Character Index | Westeros Codex</title>
  <meta name="description" content="Browse all ${CHARACTERS.length} Game of Thrones character profiles in the Westeros Codex — original biographies, timelines, relationship maps and statistics, organised by house." />
  <meta name="keywords" content="Game of Thrones characters, GoT character list, House Stark, House Lannister, House Targaryen, character database" />
  <meta name="author" content="Westeros Codex" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${ORIGIN}/characters" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="All Game of Thrones Characters — Westeros Codex" />
  <meta property="og:description" content="Browse every character profile, organised by house." />
  <meta property="og:url" content="${ORIGIN}/characters" />
  <meta property="og:image" content="${ORIGIN}/og-image.png" />
${FAVICON}
${FONTS}
  <link rel="stylesheet" href="/site.css" />
${ANALYTICS}
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
${HEADER("characters")}
  <main>
    <div class="wrap">
      <article class="card">
        <p class="kicker">The full roster</p>
        <h1 class="title">Game of Thrones Characters</h1>
        <p>Every profile below is an original, long-form biography with its own timeline, relationship map, attribute scores and trivia. ${CHARACTERS.length} characters and counting, organised by house.</p>
        <hr />
${sections}
      </article>
    </div>
  </main>
${FOOTER}
</body>
</html>
`;
}

function sitemap(): string {
  const staticUrls = ["/", "/characters", "/about", "/contact", "/privacy", "/terms", "/disclaimer"];
  const urls = [
    ...staticUrls.map((u) => ({ loc: ORIGIN + u, priority: u === "/" ? "1.0" : "0.7" })),
    ...CHARACTERS.map((c) => ({ loc: `${ORIGIN}/c/${c.id}`, priority: "0.8" })),
  ];
  const body = urls
    .map(
      (u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

// ---- write everything ----
mkdirSync(resolve(DIST, "c"), { recursive: true });
for (const c of CHARACTERS) {
  writeFileSync(resolve(DIST, "c", `${c.id}.html`), characterPage(c));
}
writeFileSync(resolve(DIST, "characters.html"), indexPage());
writeFileSync(resolve(DIST, "sitemap.xml"), sitemap());

console.log(`✓ prerendered ${CHARACTERS.length} character pages + characters index + sitemap.xml`);
