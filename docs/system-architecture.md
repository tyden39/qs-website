# System Architecture

## High-level

```
┌────────────────────────────────────────────────────────────────────┐
│  Browser                                                           │
│  ┌──────────────┐   ┌────────────────┐   ┌──────────────────────┐  │
│  │  Header (CC) │   │ SearchPanel CC │   │  Page (RSC)          │  │
│  │  active link │   │ keydown/scroll │   │  reads data/*.ts     │  │
│  └──────────────┘   └────────────────┘   └──────────────────────┘  │
│           ↑ DOM-class toggle ↑                                     │
└────────────┴──────────────────┴────────────────────────────────────┘
              ↑ HTML/CSS/JS shipped from Next.js build
┌────────────────────────────────────────────────────────────────────┐
│  Build time (next build)                                           │
│  • generateStaticParams() over products / services / news → SSG    │
│  • Tailwind v4 scans @source globs → emits a single stylesheet     │
│  • next/font/google → self-hosts Inter, Inter Tight, JetBrains Mono│
│  • next/image                                                      │
└────────────────────────────────────────────────────────────────────┘
```

There is **no server runtime, no database, no API routes**. Every page resolves at build time.

## Rendering strategy

| Layer              | Component / file                | Type                 |
|--------------------|---------------------------------|----------------------|
| Root layout        | `app/layout.tsx`                | Server (RSC)         |
| Header             | `components/Header.tsx`         | **Client** — needs `usePathname` and a click handler that mutates DOM classes |
| Search panel       | `components/SearchPanel.tsx`    | **Client** — needs `useEffect` for keyboard / scroll listeners |
| Footer             | `components/Footer.tsx`         | Server               |
| All `app/**/page.tsx` | every route                  | Server (RSC)         |

Server-rendered pages call `generateStaticParams()` for dynamic routes:

- `app/products/[slug]` ← `products.map(p => ({ slug: p.slug }))`
- `app/services/[slug]` ← `services.map(s => ({ slug: s.slug }))`
- `app/news/[slug]`     ← `news.map(n => ({ slug: n.slug }))`
- `app/applications/[slug]` does **not** use `generateStaticParams` — slugs are resolved against an inline `machineMap` and unknown slugs fall through to a generic title.

The `[slug]` page handlers receive `params: Promise<{ slug: string }>` (Next.js 16 signature) and `await` them inside the component body.

## Data flow

```
data/products.ts ─┬─→ app/page.tsx                  (home strip)
                  ├─→ app/products/page.tsx         (catalogue)
                  └─→ app/products/[slug]/page.tsx  (detail)

data/services.ts ─┬─→ (not imported by /services list — list page is hardcoded)
                  └─→ app/services/[slug]/page.tsx

data/news.ts     ─┬─→ app/page.tsx                  (news section)
                  ├─→ app/news/page.tsx
                  └─→ app/news/[slug]/page.tsx
```

`app/services/page.tsx` is a static marketing page; it does **not** iterate over `services`. The list of "what you get" tiles is local to that file. Only the detail route reads from `data/services.ts`.

## Routing map

```
/                          home
/products                  list (sidebar facets are static)
/products/[slug]           detail · 6 SSG paths
/services                  custom-engineering pitch
/services/[slug]           detail · 1 SSG path (retrofit)
/applications              7 application tiles
/applications/[slug]       detail · slugs resolved at request time
/news                      list
/news/[slug]               detail · 7 SSG paths (astro-12x is rich)
/downloads                 document hub
/downloads/datasheets      filterable doc table
/about                     company profile
/contact                   contact channels + form
/search?q=…                search results (sample data)
*                          → app/not-found.tsx
```

The header search button does not navigate to `/search`; it opens an in-page panel managed by `SearchPanel`. The panel itself does not currently submit to `/search` — it only links to featured products. The `/search` page exists for direct URL access (e.g. `/search?q=F86`).

## Styling pipeline

Tailwind v4 with **CSS-first** configuration:

1. `app/globals.css` is the single Tailwind entrypoint (`@import "tailwindcss"`).
2. Tokens are declared inside `@theme { ... }` — no `tailwind.config.ts`.
3. `@source "../app/**/*.{ts,tsx}"` and `@source "../components/**/*.{ts,tsx}"` tell Tailwind which files to scan for class names.
4. `@layer components` declares `qs-*` primitives (buttons, eyebrow, h1/h2/h3, card, section-head, image placeholders).
5. Header / nav / footer / search-panel rules live **outside** the component layer at the bottom of `globals.css` because they reference DOM ids (`#qs-search-panel`, `#qs-search-backdrop`, `.qs-nav`).

Inline `style={{...}}` is used for design-token gradients and a few aspect-ratios that don't have first-class Tailwind utilities — keep this consistent rather than introducing arbitrary class strings.

## Search panel mechanics

1. `Header.tsx` calls `openSearch()` which adds `.open` to `#qs-search-panel` and `#qs-search-backdrop`, then focuses `#qs-search-field`.
2. `SearchPanel.tsx` (mounted in root layout) wires:
   - `Escape` keydown → close
   - `scroll` / `resize` → recompute panel `top` to sit below the sticky nav
3. The backdrop's `onClick` and the close button's `onClick` both call `close()` — same DOM-class toggle in reverse.

This deliberately avoids React state for visibility — opening/closing is a CSS transition driven by the `.open` class to keep the trigger logic in the Header (a separate component tree) lightweight.

## Fonts

`app/layout.tsx` configures three Google fonts via `next/font/google`:

- `Inter` → `--font-sans`
- `Inter_Tight` → `--font-display`
- `JetBrains_Mono` → `--font-mono`

CSS variables flow into Tailwind via `@theme` declarations referencing those same custom properties. This means font swaps are isolated to `layout.tsx` + `globals.css`.

## Build & deploy

- Local: `yarn build` produces the static export in `out/`. `yarn start` serves it for a quick local check.
- Host is **Firebase Hosting** (project `qstcnc-6207d`, site `qstcnc-6207d`). `output: "export"` means there is no server runtime to deploy — only the `out/` directory is uploaded.
- `firebase.json` holds everything the edge does: the 301 redirect table for old/renamed routes, security headers (CSP, HSTS, nosniff, frame-deny, permissions-policy), and `Cache-Control` for `/_next/static`, `/downloads`, and `/img`. `trailingSlash: true` matches Next's `trailingSlash: true`, so `/vi/about` gets a 301 to `/vi/about/`.
  - `/` is 301'd to `/vi/`. There is no page at `/` in the app tree at all — the whole site lives under a locale prefix, and Vietnamese is the default. This used to be a prerendered landing page that sniffed `navigator.language` and called `location.replace`, but a static export can only run that after the document and its JS have loaded, so visitors saw a "redirecting…" screen on the way in. The trade-off of doing it at the edge instead: a first-time English visitor lands on Vietnamese and has to use the language switcher once. Note that a 301 is cached hard by browsers, so flipping the default locale later means visitors who have already been redirected keep going to `/vi/` until their cache clears.
    - A returning visitor's choice is still honoured, by an inline `<script>` in the `<head>` of `app/[locale]/layout.tsx` (shipped on the Vietnamese tree only): if the path is exactly `/vi/` — where the host redirect deposits everyone — and `localStorage.locale` reads `"en"`, it replaces the location with `/en/`, carrying over any query and hash. The language switcher writes that key.
    - Two limits on that script are deliberate, not oversights. It ignores deeper paths, because a shared `/vi/electronics/…` link is an explicit destination and rewriting it would override whoever sent it; `/` is the only entry point where a locale was assumed rather than asked for. And it reads only the stored choice, never `navigator.language`: sniffing would bounce every first-time English visitor, and Googlebot executes JS, so a crawl of `/vi/` that redirected itself away would undermine the page being indexed. An absent `localStorage` entry is exactly the crawler's state, so it stays put.
    - It is a raw `<script dangerouslySetInnerHTML>`, not `next/script`, for the same reason as the 404 script below — from a route, `strategy="beforeInteractive"` runs after first paint, which here would mean a visible flash of Vietnamese before the swap.
  - Redirects that must forward a path tail use RE2 named captures (`"regex": "^/vi/cnc/(?P<rest>.*)$"` → `/vi/machine-building/:rest`). The glob form `:rest*` only captures a **single** path segment on Firebase, so it silently 404s deeper URLs.
  - `out/404.html` is served automatically for unmatched paths; no rewrite rule is needed or wanted (a `**` rewrite would mask real 404s). One file has to answer for both locales, so it is prerendered in Vietnamese and swapped to English by an inline script that reads the URL prefix, then the saved or browser language. That script is a plain `<script dangerouslySetInnerHTML>` at the end of `<body>`, **not** `next/script`: `strategy="beforeInteractive"` is only honoured in the root layout, and from a route Next instead serialises the source into `self.__next_s` for the async React runtime chunk to fetch and replay, which runs long after first paint. The same mistake used to make `/` show a visible "redirecting…" screen.
  - HSTS is deliberately **not** in `firebase.json`: Firebase always sends its own `Strict-Transport-Security: max-age=31556926; includeSubDomains; preload` and overrides any value configured here. Because it carries `includeSubDomains`, every `qstcnc.com` subdomain must serve valid HTTPS or browsers will refuse it after one visit to the apex.
  - HTML pages get Firebase's default `Cache-Control: max-age=3600` (Cloudflare Pages served `max-age=0`). Repeat visitors can therefore see content up to an hour stale; that is accepted on purpose because transfer allowance, not freshness, is the scarce resource here.
- Commands: `firebase hosting:channel:deploy <name> --expires 7d` for a throwaway preview URL, `firebase deploy --only hosting` for live.
- No build-time secrets. `NEXT_PUBLIC_APP_URL` is unset in CI and falls back to `https://qstcnc.com`, which is what sitemap/canonical/hreflang bake in — preview channels therefore still declare the production canonical, by design.
- Bandwidth is the live constraint, not build time: the export is ~400 MB (mostly product photos and PDF/RAR datasheets) against the Spark plan's 10 GB/month transfer allowance. Watch the Firebase console Usage dashboard; the site is disabled for the rest of the cycle if the allowance is exceeded.

## Cross-cutting decisions

- **No client state library.** Header, SearchPanel: local state + DOM class toggling. Anything more complex would require justification.
- **No testing framework.** Visual regression is currently human-driven against the `template/` HTML reference.
- **No analytics, no consent banners, no third-party scripts.** Keep `<head>` clean.
- **Form submissions are inert.** All `<form>` elements lack `action` / `onSubmit`. Backend wiring is roadmap work — when it lands, prefer a server action over an API route to stay zero-runtime.
