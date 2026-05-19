# Project Roadmap

> Last updated: 2026-05-07
> Branch: `main`
> Recent commits indicate the migration from the static HTML template to Next.js is complete and core pages are built.

## Phases

### Phase 1 — Static migration · ✅ Complete

Move the original HTML site (under `template/`) onto Next.js App Router, port design tokens to Tailwind v4, and stand up every public route.

- ✅ Next.js 16 + React 19 + TypeScript 6 scaffold
- ✅ Tailwind v4 CSS-first design system (`app/globals.css`)
- ✅ Header, Footer, SearchPanel components
- ✅ Home, Products (list + 6 details), Services (list + retrofit detail), Applications (list + 7 details), News (list + 7 details), About, Contact, Downloads, Datasheets, Search, 404
- ✅ Vietnamese copy across all pages
- ✅ `generateStaticParams` for products / services / news
- ✅ next/font/google for Inter, Inter Tight, JetBrains Mono

### Phase 2 — Content data hardening · 🟡 In progress

Tighten the boundary between layout and content so editors don't need to touch JSX.

- ✅ `data/products.ts` covers all 6 controllers with full specs
- ✅ `data/services.ts` covers retrofit
- ⏳ Extract `data/applications.ts` (currently inlined in `app/applications/page.tsx` and `app/applications/[slug]/page.tsx`)
- ⏳ Replace hard-coded `articleBody` in `app/news/[slug]/page.tsx` with structured fields on each `News` entry (or move to MDX)
- ⏳ Replace hand-maintained `featured` list in `components/SearchPanel.tsx` with derived data from `data/products.ts`
- ⏳ Move the helper `Field` / `RadioGroup` duplicates (services + contact) into a shared `components/forms/*` module once a third form appears

### Phase 3 — SEO & metadata · 🔴 Not started

- ⏳ Per-route `generateMetadata` (canonical URLs, descriptions, OG tags)
- ⏳ `app/sitemap.ts`
- ⏳ `app/robots.ts`
- ⏳ JSON-LD structured data for `Product`, `Organization`, `BreadcrumbList`
- ⏳ Open Graph image generation via `opengraph-image.tsx`

### Phase 4 — Lead capture backend · 🔴 Not started

Forms on `/services`, `/contact`, `/news` (newsletter), `/downloads` (request for documents) currently submit nowhere.

- ⏳ Decide on transport: server action + Resend / Postmark / SendGrid, or external form provider (Formspree)
- ⏳ Add anti-spam (honeypot + simple rate limit)
- ⏳ Confirmation page or inline success state
- ⏳ Email template for QS sales team
- ⏳ Validate Vietnamese names, phone numbers (+84), email addresses on the server side

### Phase 5 — Search · 🔴 Not started

`/search` currently renders a hard-coded `sampleResults` array. The header search panel doesn't even submit to it.

- ⏳ Build a build-time index from `data/*.ts` + page metadata
- ⏳ Wire `SearchPanel`'s input to navigate to `/search?q=…`
- ⏳ Render real results with relevance scoring (likely client-side `match-sorter` over a JSON index)
- ⏳ Recent-search persistence via `localStorage`

### Phase 6 — Document hosting · 🔴 Not started

`/downloads` and `/downloads/datasheets` show a curated list with `Tải ↓` buttons that link to `#`. No actual files exist.

- ⏳ Decide on storage (Vercel Blob, S3, or static under `public/downloads/`)
- ⏳ Wire `Tải` buttons to real URLs
- ⏳ Track download counts (optional)
- ⏳ Gated downloads for select assets (deferred — needs auth)

### Phase 7 — Real product imagery · 🔴 Not started

All visuals are inline SVG schematic placeholders. Replace with photography for production launch.

- ⏳ Photoshoot brief covering 6 controllers, factory floor, retrofit before/after
- ⏳ Image processing pipeline (AVIF + WebP + responsive sizes)
- ⏳ Replace SVG placeholders in `app/page.tsx`, `app/products/page.tsx`, `app/products/[slug]/page.tsx`, `app/applications/[slug]/page.tsx`, `app/news/[slug]/page.tsx`

### Phase 8 — Internationalisation · 🔴 Not started

Currently Vietnamese-only. English market is on the wishlist.

- ⏳ Adopt `next-intl` or routing-based i18n
- ⏳ Translate copy in `data/*.ts` (rather than UI strings — UI strings live in JSX)
- ⏳ Language toggle in `Header` (already styled — currently inert)
- ⏳ Localised metadata + sitemap

### Phase 9 — Quality & ops · 🔴 Not started

- ⏳ Add Playwright smoke tests (route render + navigation)
- ⏳ CI: typecheck + lint + build on every PR
- ⏳ Lighthouse budget enforcement
- ⏳ Deploy to Vercel with preview deployments per PR
- ⏳ Sentry / error reporting (optional)
- ⏳ Privacy-respecting analytics (Plausible / Vercel Analytics)

## Backlog (no commitment)

- MDX-driven news bodies
- Tweaks panel (live design-token editor — present in original HTML version)
- Customer logos strip on home
- Case-study pages distinct from applications (longer-form narratives with photos and metrics)
- Career page (was present in HTML template)
- Cookie consent banner (only if analytics ships)

## Definition of done (per phase)

A phase is "done" when:

- All checkboxes are ✅
- `yarn build && yarn lint` pass with zero warnings
- TypeScript has zero errors
- Manual smoke test: every public route loads without console errors
- `docs/codebase-summary.md` and `docs/system-architecture.md` updated to reflect the new state

## Open questions

- Will lead-capture forms be wired to a single inbox or routed by `reqtype` (sales / engineering / support)?
- Are real product photos available, or do we keep the SVG-schematic aesthetic indefinitely as a brand choice?
- Is the search index sourced only from on-site content, or should it also surface PDF datasheets (requires PDF text extraction)?
- Does internationalisation need full URL localisation (`/en/...`) or just per-segment language toggles?
