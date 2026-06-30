# Site interactive functions — make placeholder UI actually work

Status: done (pending user `yarn build` sign-off — build runs clean for the agent)
Branch: main
blockedBy: [260630-1045-multilang-core-pages]  # resolved — multilang landed

## Goal
Audit found broad non-functional UI on this static-export (`output: "export"`) Cloudflare Pages site. Wire it up: real lead-capture backend, real search, working product/news filters, and remove dead `href="#"` links.

User-confirmed decisions:
- Forms → **POST to the existing CRM public endpoint** `POST {API_BASE}/public/leads` (per `~/ws/qs/qs-crm/docs/lead-form-page-guide.md`) and **rebuild the contact page** to match its contract. No Cloudflare Function / Upstash.
- Search → **build-time static JSON index, per-locale** + real client-side search/filter/pagination.
- Downloads PDF download links → **skipped for now** (no real files yet).
- Scope → **everything found**, phased by priority.

## Audit summary (what's broken)
| Area | Symptom | Phase |
|------|---------|-------|
| Contact + inquiry forms | POST dead `/api/leads` → rewire to CRM `/public/leads` (contact form rebuilt to CRM contract) | 1 |
| Newsletter + datasheet forms | out of scope — left untouched (don't fit CRM lead contract) | — |
| Search panel input | no submit handler; Enter does nothing | 2 |
| `/search` results | 100% hardcoded `sampleResults`; tabs/filters/pagination dead (`href="#"`) | 2 |
| Products page | sidebar tree `href="#"`, filter chips (no handler), sort `<select>` (no `onChange`) | 3 |
| News page | category tabs `href="#"`; no real pagination | 4 |
| Downloads | "Tải ↓", "Xem tất cả", "Đăng nhập" → `href="#"` | 5 |
| Contact cards, "Đặt lịch", showreel YouTube, news share | `href="#"` | 5 |

Already OK (do not touch): product/service detail `#specs`/`#quote`/`#pricing` anchors resolve; Header search toggle, mobile drawer, hero-slider, video-reel, floating-contact, locale-switcher all work.

## Constraints
- Static export: no Next server/API routes, no `getServerSideProps`. Server logic only via Cloudflare Pages Functions (`/functions/**`) or client-side.
- Pages Functions use `context.env`, **not** `process.env` — `lib/ratelimit.ts` must be adapted (zod `lib/validation/lead-schema.ts` is portable, reuse as-is).
- Honour existing CSP in `public/_headers` when adding share/embed/external origins.
- Keep i18n: new strings go through next-intl namespaces (coordinate with multilang plan).

## Phases
1. `phase-01-wire-forms-to-crm.md` — P1 — **done** — contact + inquiry forms → CRM `/public/leads`; rebuild contact page
2. `phase-02-static-search-index.md` — P1 — **done** — build-time index + real search/filter/pagination on `/search` + panel input
3. `phase-03-products-filter-sort.md` — P2 — **done** — client filter chips, sort, axis category tree
4. `phase-04-news-category-pagination.md` — P2 — **done** — category tab filtering + numeric pagination
5. `phase-05-dead-link-cleanup.md` — P3 — **done** — wired/removed remaining `href="#"` (deferred downloads "Tải" link intentionally left)
6. `phase-06-verify.md` — P1 — **done (local)** — typecheck + i18n check + static build clean; CRM/CORS deploy smoke still needs the live allowlisted origin

## Dependencies
- Phases 3 & 4 edit `products/page.tsx` and `news/page.tsx` toolbar/filter JSX that the in-progress `260630-1045-multilang-core-pages` plan also rewrites → **land multilang first** to avoid merge conflicts, or do 3/4 as the same edit pass. Phases 1, 2, 5 are independent of multilang.

## Acceptance
- Contact + service-inquiry forms POST to the CRM `/public/leads` and return `201` (lead appears in CRM admin); contact page rebuilt to the CRM contract (phone required, service checkboxes, business field).
- `/search?q=F86` returns real matches from products/news/applications; tabs/type-filters/pagination work.
- Search panel input + Enter navigates to `/search?q=…`.
- Products filter chips + sort reorder the visible list; category tree filters or links to real targets.
- News tabs filter the grid; pagination works.
- No `href="#"` remains except intentional placeholders (none expected).
- `tsx scripts/check-i18n-keys.ts` passes; `next build` (static export) clean; `out/` builds.

## Open questions — all resolved
- ~~Lead destination~~ → **CRM** `POST https://crm.qstcnc.com/api/v1/public/leads` (cross-origin); contact page rebuilt per guide. CORS being provisioned CRM-side — treat the deployed origin as allowlisted.
- ~~Search corpus language~~ → **per-locale index files**.
- ~~Downloads PDFs~~ → **skipped for now** (no direct-download links wired in Phase 5).
- ~~Newsletter + datasheet forms~~ → **out of scope**, do not wire (don't fit the CRM lead contract). Leave existing UI untouched.
