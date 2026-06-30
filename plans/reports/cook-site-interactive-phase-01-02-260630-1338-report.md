# Cook report — site interactive functions, phases 1 & 2

Date: 2026-06-30
Plan: `plans/260630-1102-site-interactive-functions/`
Branch: main · Status: phases 1 & 2 done (code-reviewed, build green)

## Phase 1 — forms → CRM public lead endpoint
- New `lib/validation/crm-lead-schema.ts`: service/business codes + zod payload schema (single source, points at qs-crm guide §2).
- New `lib/crm/leads-client.ts`: `createPublicLead()` → `POST {NEXT_PUBLIC_CRM_API_BASE}/public/leads`; discriminated result 201/400/429/server/network.
- Rebuilt `contact-form.tsx` to CRM contract: name+phone required, optional email, `business_field` select (+Other free text), 3 service-code checkboxes, notes, honeypot; full i18n (`contact` namespace); 201/400/429 handling.
- Rewired `inquiry-form.tsx` to the same client; slug→code map (`retrofit→machine_upgrade`); unknown slug sends no `services`. NOTE: component is not mounted anywhere (dead code) — wired for readiness.
- CSP `connect-src += https://crm.qstcnc.com` (`public/_headers`, confirmed in `out/_headers`).
- `.env.example` documents `NEXT_PUBLIC_CRM_API_BASE`; contact i18n extended (vi+en).
- Cleanup: deleted unused `lib/ratelimit.ts`; removed `@upstash/*` deps (verified zero refs). Newsletter + datasheet forms left untouched (out of scope; still POST dead `/api/leads`).

## Phase 2 — static search index + real search
- New `scripts/build-search-index.ts`: flattens products/news/datasheets/applications/service-FAQs → `public/search-index.<locale>.json` per locale (vi 32 / en 26 records, ~19–20 KB raw). Types: product/pdf/news/app/faq.
- Wired as `prebuild` + `predev`; `search:index` manual script; output gitignored; lands in `out/`.
- Rewrote `search-results.tsx`: per-locale fetch, weighted scorer (title^3/keywords^2/excerpt^1), type tabs + sidebar filters + pagination (10/page) via URL params `?q=&type=&page=`, localStorage recents, empty/no-result states, XSS-safe highlight.
- `SearchPanel.tsx` input now submits → locale-aware `/search?q=`.
- `search.json` (vi+en): replaced mock `items/tabs/filters` with `typeLabels` + `emptyPrompt` + `noResults`.

## Code review (subagent) — applied fixes
- HIGH: `search/page.tsx` now uses `generateMetadata`+`getTranslations` and `setRequestLocale` (was hardcoded VI title; EN route shipped VI `<title>`).
- MED: pagination "showing" label corrected — real `{start}–{end}` (was always `1–{shown}`).
- LOW: removed fabricated `0.18s` latency stat from `statsSuffix`.
- LOW: `predev` hook so `next dev` has an index (was empty locally).
- LOW: invalid `?type=` now falls back to `all` (was silent blank column).
- Verified clean by reviewer: highlight() XSS, CRM payload omit-empties + no unknown service codes, email-optional union, response handling, hydration, fetch path, CSP, dead-dep removal.
- Not changed (accepted): raw CRM 400 message shown verbatim (rare; fields client-validated first).

## Verification
- `yarn tsc --noEmit` clean · `yarn i18n:check` PASSED (search 26, contact 62, full parity) · `yarn build` (static export) green · index + CSP present in `out/`.

## Not done / deferred
- Manual live test against `https://crm.qstcnc.com/api/v1/public/leads` (201/400/429) — needs deployed origin in CRM `CORS_ALLOWED_ORIGINS`; not runnable from localhost. Part of phase-06 verify.
- Phases 3–6 untouched.

## Unresolved questions
- None blocking. CRM base path `/api/v1` confirmed against guide curl example. Search page title localization assumed an oversight (fixed); revert finding #1 only if search was intentionally VI-only.
