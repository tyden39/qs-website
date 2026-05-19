# Codebase Summary

Total source: ~3,650 LOC of TypeScript/TSX + CSS, all under `app/`, `components/`, `data/`. The `template/` directory is the original HTML reference site — kept for parity checks but **not imported** by the Next.js build.

## Top-level files

| File                      | Purpose                                                              |
|---------------------------|----------------------------------------------------------------------|
| `package.json`            | Declares `next`, `react`, `react-dom`, Tailwind v4 toolchain. Scripts: `dev`, `build`, `start`, `lint`. |
| `tsconfig.json`           | Strict TS, `@/*` path alias to repo root, ES2022 target.             |
| `next.config.mjs`         | `reactStrictMode: true`. No other config.                            |
| `next-env.d.ts`           | Auto-generated Next.js types.                                        |
| `postcss.config.mjs`      | Loads `@tailwindcss/postcss`.                                         |

## `app/` — routes & layout

| Path                                     | LOC | Notes |
|------------------------------------------|-----|-------|
| `app/layout.tsx`                         | 29  | Root layout. Loads three Google fonts as CSS variables (`--font-sans`, `--font-display`, `--font-mono`), applies global `lang="vi"`, mounts `Header`, `SearchPanel`, `Footer`. Exports site-wide `metadata`. |
| `app/globals.css`                        | 216 | Tailwind v4 entry. Declares design tokens under `@theme`, `@source` paths for content scanning, and `@layer components` primitives. Also non-layered `qs-*` rules for Header/Search/Footer. |
| `app/page.tsx`                           | 302 | Home: hero · product strip · applications · dark stats · video reel · news · CTA. |
| `app/not-found.tsx`                      | 39  | Branded 404 with gold-grad numerals. |
| `app/products/page.tsx`                  | 185 | Catalogue listing of all `products` with sidebar by machine type and a comparison-PDF CTA. |
| `app/products/[slug]/page.tsx`           | 202 | Product detail. Uses `generateStaticParams` over `products`. Renders spec table from `Product.specs`, related products, sticky tabs, full-package accessories. |
| `app/services/page.tsx`                  | 205 | Custom-engineering pitch: capabilities · 8-week process · contact form (with helper `Field` and `RadioGroup` components). |
| `app/services/[slug]/page.tsx`           | 217 | Service detail (currently only `retrofit` slug populated). Renders process steps, includes table, 3-tier pricing, FAQs from `Service` data. |
| `app/applications/page.tsx`              | 142 | 7-tile application grid + catalogue download CTA + pagination UI. |
| `app/applications/[slug]/page.tsx`       | 190 | Application detail with dark hero, workflow steps, spec table, deployments. Slug is mapped via inline `machineMap` (no separate data module). |
| `app/news/page.tsx`                      | 133 | Featured article + grid + category tabs + newsletter form. |
| `app/news/[slug]/page.tsx`               | 206 | News article. The `astro-12x` slug renders rich `articleBody` (intro/sections/quote/list/tags); other slugs fall back to excerpt-only. |
| `app/downloads/page.tsx`                 | 178 | Document Center landing page: categories · featured docs · account helpers. |
| `app/downloads/datasheets/page.tsx`      | 190 | Datasheet table with sidebar filters (static UI), pagination, ext badges. |
| `app/about/page.tsx`                     | 194 | Story · 12-year timeline · values · plant stats · leadership · CTA. |
| `app/contact/page.tsx`                   | 208 | Channels · request form · 2 offices · FAQ. Same `Field` / `RadioGroup` helpers as services. |
| `app/search/page.tsx`                    | 283 | Search results with `searchParams.q`. Uses `highlight()` + `escapeHtml()` to mark query tokens. Results are inline `sampleResults` — no real index. |

## `components/` — shared UI

| File                       | LOC | Client | Notes |
|----------------------------|-----|--------|-------|
| `components/Header.tsx`    | 63  | yes    | Sticky top-strip + nav. Uses `usePathname` to mark active route. The search button calls a DOM-mutating `openSearch()` helper that toggles classes on `#qs-search-panel` and `#qs-search-backdrop`. |
| `components/Footer.tsx`    | 78  | no     | 4-column footer with social icons inlined as SVG strings via `dangerouslySetInnerHTML`. Helper components `FootCol` and `Social` defined inline. |
| `components/SearchPanel.tsx` | 85 | yes    | The dropdown panel mounted by root layout. Wires `keydown` (Escape to close), `scroll` and `resize` listeners to keep the panel pinned below the nav. Featured product list is a hard-coded local array (not from `data/products`). |

## `data/` — static content modules

| File                | LOC | Exports                                  |
|---------------------|-----|------------------------------------------|
| `data/products.ts`  | 118 | `Product` type · `products: Product[]` (6 items) |
| `data/services.ts`  | 146 | `Service` and supporting types · `services: Service[]` (only `retrofit` populated) |
| `data/news.ts`      | 45  | `News` type · `news: News[]` (7 items)    |

## `public/`

- `logo-st.png` — only static asset bundled. Used by `Header` and `Footer` via `next/image`.

## `template/` — original HTML reference

Frozen reference set of 20+ static HTML files plus `assets/`, `styles/`, `scripts/` and `uploads/`. **Not imported** by the Next.js build. Use as a source of truth when porting unfinished pages or comparing visual fidelity. Touch only when intentionally syncing with new template revisions.

## Cross-cutting concerns

- **Server Components by default.** Only `Header` and `SearchPanel` are `"use client"`.
- **No environment variables.** Nothing in the codebase reads `process.env`. Build is hermetic.
- **No tests.** No test runner, no fixtures.
- **No data layer.** All content lives in TypeScript modules; pages read them directly. Adding a new product = one entry in `data/products.ts` plus optionally a custom hero/SVG in `app/products/[slug]/page.tsx`.

## Known orphans / inconsistencies

- `app/applications/[slug]/page.tsx` uses an inline `machineMap` instead of a shared `data/applications.ts` module. If the application list grows, extract.
- `components/SearchPanel.tsx` declares a local `featured` list rather than importing from `data/products`. Keeping the two in sync is a manual chore.
- `app/services/[slug]/page.tsx` references `s.hero.line2` and an inline literal "trong 14 ngày" — that hard-coded suffix should move into the `Service` data shape if a non-retrofit service is added.
- `app/news/[slug]/page.tsx` hard-codes the `articleBody` for the `astro-12x` slug. Real article bodies belong in `data/news.ts` (or MDX) — see roadmap.
