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

- Local: `yarn build` then `yarn start`.
- Output is suitable for Vercel (zero-config) or any static host once exported. No env vars, no secrets.
- For Vercel, the project will be detected as Next.js automatically; **default to Fluid Compute** (Node.js runtime) — the project does not need Edge.

## Cross-cutting decisions

- **No client state library.** Header, SearchPanel: local state + DOM class toggling. Anything more complex would require justification.
- **No testing framework.** Visual regression is currently human-driven against the `template/` HTML reference.
- **No analytics, no consent banners, no third-party scripts.** Keep `<head>` clean.
- **Form submissions are inert.** All `<form>` elements lack `action` / `onSubmit`. Backend wiring is roadmap work — when it lands, prefer a server action over an API route to stay zero-runtime.
