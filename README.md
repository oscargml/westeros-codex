# Westeros Codex

An independent, fan-made **Game of Thrones character encyclopedia** — original
biographies, an eight-season timeline, a relationship graph, attribute
statistics and a trivia vault for every major character.

**Live:** https://gameofthrones.uk

> Unofficial. Not affiliated with HBO, Warner Bros. Discovery or George R. R.
> Martin. See [`/disclaimer`](public/disclaimer.html).

## What it is

A single-page React app (the interactive Codex) **plus** a set of prerendered,
fully static, crawlable pages generated at build time. This hybrid keeps the
rich client-side experience while giving search engines and ad reviewers real,
indexable content at stable URLs.

### Pages

| URL | Source | Notes |
| --- | --- | --- |
| `/` | `index.html` + `src/` | The interactive React SPA (search, filters, graph, timeline) |
| `/characters` | generated → `dist/characters.html` | Index of every profile, grouped by house |
| `/c/<id>` | generated → `dist/c/<id>.html` | One static page per character (bio, stats, timeline, relationships, trivia) |
| `/about` | `public/about.html` | Editorial approach & independence |
| `/contact` | `public/contact.html` | Email + mailto form |
| `/privacy` | `public/privacy.html` | Cookies, **Google AdSense**, **Google Analytics**, opt-outs |
| `/terms` | `public/terms.html` | Terms of service |
| `/disclaimer` | `public/disclaimer.html` | Copyright / fair-use position |
| `/sitemap.xml` | generated | All canonical URLs, `lastmod` set at build |
| `/robots.txt` | `public/robots.txt` | Allows all + `Mediapartners-Google` (AdSense) |

Clean URLs (`/about` instead of `/about.html`) are handled by Vercel via
[`vercel.json`](vercel.json) (`"cleanUrls": true`).

## Tech stack

- **Vite 6** + **React 18** + **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Motion** for animation, **lucide-react** for icons
- **tsx** to run the post-build prerenderer
- Deployed on **Vercel** (auto-deploys from `main`)

## Project layout

```
index.html              SPA entry (meta, AdSense, Analytics, JSON-LD)
src/
  data.ts               Single source of truth — all character data
  types.ts              Domain types
  App.tsx               Main app shell + footer nav
  components/           Cards, graph, timeline, filters, AdSlot, …
public/                 Static assets copied verbatim to dist/
  *.html                Legal/info pages
  site.css              Shared styling for static + prerendered pages
  robots.txt
  og-image.png, favicon.svg, apple-touch-icon.png, logo.png
scripts/
  prerender.mts         Reads src/data.ts → writes dist/c/*.html, characters.html, sitemap.xml
vercel.json             cleanUrls + headers
```

## Local development

```bash
npm install
npm run dev          # SPA at http://localhost:5173

npm run build        # tsc + vite build + prerender → dist/
npm run prerender    # re-run only the static generator (after a build)
npm run preview      # serve the built SPA
```

To preview the full static output (legal + character pages) exactly as deployed:

```bash
npm run build
python -m http.server 8055 --directory dist
# then open http://localhost:8055/c/jon-snow.html etc.
```

## Monetization & SEO

- **Google AdSense** — publisher `ca-pub-8643026289824701` is loaded site-wide
  (SPA + every prerendered page). Auto Ads serve as the fallback; the in-app
  `AdSlot` components mark manual placements to wire `data-ad-slot` IDs into
  later if desired.
- **Affiliate** — the "Citadel Library" cards in `src/App.tsx` use Amazon
  Associates links. **Replace `YOUR-AFFILIATE-TAG`** with your real tag before
  relying on commissions.
- **Google Analytics** — measurement ID `G-ZRJR6F1N3B`.
- **Search Console** — verification meta tag present in `index.html`.
- **Structured data** — `WebSite` (home), `Article` + `BreadcrumbList` (each
  character), `CollectionPage` (characters index).

### Remaining manual steps

1. Replace the Amazon affiliate tag `YOUR-AFFILIATE-TAG` in `src/App.tsx`.
2. Submit `https://gameofthrones.uk/sitemap.xml` in Google Search Console.
3. (Optional) Paste real AdSense `data-ad-slot` IDs into the `AdSlot` units.
