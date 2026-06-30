---
phase: 2
title: "Build-time static search index + real search"
status: done
priority: P1
dependencies: [1]
---

# Phase 2: Build-time static search index + real search

## Overview
Replace the mocked `sampleResults` with real search over a build-time JSON index generated from `lib/data/*`. Wire the search panel input, and make `/search` tabs, type-filters, and pagination functional client-side.

## Requirements
- Functional: search panel input + Enter/submit → `/search?q=…`. `/search` reads `?q`, queries a static index, renders real ranked results, working category tabs, type filters, and pagination over real result counts.
- Non-functional: index small enough to ship (target < ~150KB/locale gzipped); no server runtime; preserves existing visual design and highlight behavior.

## Architecture
- **Index build**: a script (`scripts/build-search-index.ts`, run in `prebuild`/`build`) reads `lib/data/products.ts`, `news.ts`, `applications.ts`, `datasheets.ts`, `services.ts`, flattens to `{ id, type, title, excerpt, href, meta, locale, keywords }`, writes `public/search-index.<locale>.json` (per-locale, open question confirmed default).
- **Client search**: `search-results.tsx` fetches the index for the active locale on mount, runs a lightweight scorer (token match on title^3 + keywords^2 + excerpt^1; substring + simple fuzzy). Keep existing `highlight()`/`escapeHtml()`.
- **State**: `q` from `useSearchParams`; active type tab + active filters + page in component state (or URL params for shareable links — prefer `?q=&type=&page=`). Tabs/filters narrow by `type`; pagination slices results.
- Counts in tabs/sidebar become live (derived from filtered results), not hardcoded.

## Related Code Files
- Create: `scripts/build-search-index.ts`
- Create (generated, gitignore): `public/search-index.vi.json`, `public/search-index.en.json`
- Modify: `package.json` (add index build to `build`/`prebuild`)
- Modify: `app/[locale]/search/_components/search-results.tsx` (real data, filters, tabs, pagination)
- Modify: `components/SearchPanel.tsx` (input → form submit to `/search?q=`, Enter key)
- Reference: `lib/data/*`, `lib/i18n/navigation.ts` (locale-aware push)

## Implementation Steps
1. Write `build-search-index.ts`: import data loaders, emit per-locale flattened records with `type` ∈ product|pdf|case|news|app|faq, stable `href`, keywords.
2. Hook into build; gitignore generated files; ensure they land in `out/`.
3. SearchPanel: wrap input in a `<form>` that navigates to locale-aware `/search?q=` on submit; keep close-on-select.
4. search-results: fetch `/search-index.<locale>.json`, parse `q`, score + sort, render real cards (reuse `Thumb`, `highlight`).
5. Make tabs filter by `type` with live counts; sidebar type filters toggle (multi or single); pagination slices (e.g., 10/page) with real total + working prev/next.
6. Recent searches: keep as-is (links already work) or back with `localStorage`.
7. Empty state: show "no results" + contact CTA when `q` matches nothing.

## Success Criteria
- [ ] `/search?q=F86` shows real product/manual/news matches, not the fixed 5 mocks.
- [ ] Search panel Enter navigates to results.
- [ ] Tabs + type filters narrow results with accurate live counts; pagination navigates pages.
- [ ] Works for both `/vi` and `/en`.
- [ ] Index regenerates on `build`; no stale committed index.

## Risk Assessment
- Index size growth. Mitigation: store only searchable fields + short excerpt; measure gzipped size.
- Locale data shape differences (i18n fields via `lib/data/i18n-field.ts`). Mitigation: resolve localized strings at index-build time per locale.
- CSP: fetching same-origin JSON is fine; no new origins.
