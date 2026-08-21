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


