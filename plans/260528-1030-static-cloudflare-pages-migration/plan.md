---
title: "Static + Cloudflare Pages Migration"
description: "Tear down dynamic CMS, ship the marketing site as Next.js static export on Cloudflare Pages."
status: pending
priority: P1
branch: "main"
tags: [migration, infra, static-export, cloudflare-pages]
blockedBy: []
blocks: [260511-1436-fullstack-cms-bilingual]
created: "2026-05-28T04:32:48.109Z"
createdBy: "ck:plan"
source: skill
---

# Static + Cloudflare Pages Migration

## Overview

Move QS website off Vercel + Neon + Better Auth dynamic CMS onto a **Next.js
static export hosted on Cloudflare Pages**. The CMS shipped 5 commits ago is
being torn down: no server runtime, no DB, no auth, no upload. Content goes
back to `data/*.ts` (dev-edits + rebuild). Lead capture forms are **hidden
until a separate CRM/ERP project is built**.

Source: [brainstorm](../reports/260526-1614-brainstorm-vps-cloudflare-migration.md) (approved 2026-05-27).

**Locked decisions (do not silently reverse during red-team / cook):**

| Decision | Locked value | Source |
|---|---|---|
| Hosting | Cloudflare Pages (static `output: "export"`) | brainstorm §Decisions |
| Admin CMS / server / DB / auth / upload | **Removed entirely** | brainstorm §Decisions |
| Content source of truth | `data/*.ts` (current seed is authoritative — no DB dump) | user confirmation 2026-05-28 |
| Lead capture | **Forms hidden** until CRM/ERP ready (no email/D1 fallback) | brainstorm §Decisions |
| Locale URLs | `localePrefix: "always"` + `/_redirects` mapping old un-prefixed paths → `/vi/*` (301), `/ → /vi/` | user confirmation 2026-05-28 |
| Sveltia git-CMS / Pages Function `/api/lead` | **Future, out of scope** | brainstorm §Out of scope |
| Budget | ~$0–1/mo | brainstorm §Chi phí |

## Architecture (after migration)

```
Browser → Cloudflare Pages (300+ PoP)
            ├─ /vi/**  /en/**     (prerendered HTML/CSS/JS from next build)
            ├─ /_redirects        (/ → /vi, /products → /vi/products, …)
            └─ /_headers          (CSP, X-Content-Type-Options, Referrer-Policy)

Build pipeline:
  git push → Cloudflare Pages build
    └─ pnpm/yarn install
    └─ next build  (output: "export")  ── reads data/*.ts at build, no runtime DB
    └─ publish out/
```

## Code reality check (informs every phase)

The brainstorm assumed public pages import `data/*.ts` directly. In the current
tree they go through a **view-API seam** at [lib/data/](../../lib/data/) which
queries Neon via Drizzle (`"use cache" / cacheTag / cacheLife`). Every public
page calls `getAllProducts(locale)`, `getProductBySlug(slug, locale)`, etc. —
[grep proof](../../app/[locale]/products/page.tsx#L3).

→ Phase 1 keeps that seam and **reimplements `lib/data/*.ts` to read `data/*.ts`
synchronously**. Pages don't change. The `pickLocale` / `toView` shaping logic
is reused. Future Phase 6 (Sveltia) just swaps `data/*.ts` → `content/*.{yaml,mdx}`
behind the same API — same seam, same reuse.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Strip backend & rewire data seam](./phase-01-strip-backend-rewire-data-seam.md) | Pending |
| 2 | [Static export + blockers](./phase-02-static-export-blockers.md) | Pending |
| 3 | [Deploy Cloudflare Pages preview](./phase-03-deploy-cloudflare-pages-preview.md) | Pending |
| 4 | [Cutover domain](./phase-04-cutover-domain.md) | Pending |

## Out of scope (deferred, not "never")

- **Phase 5 — Pages Function `/api/lead` + CRM forward.** Comes alive when the
  separate CRM/ERP project lands. Forms stay hidden until then.
- **Phase 6 — Git-based Sveltia CMS** (`data/*.ts` → `content/`,
  `public/admin/`, GitHub OAuth Worker). Only after Phase 4 cutover is stable.
  Decisions confirmed in brainstorm 2026-06-11 (admin for non-tech editors):
  - Sveltia CMS at `/admin` on the static site itself — no custom admin app,
    no generated `.ts` files (codegen from user input is fragile).
  - Scope: **all 5 entities** (products, news, services, applications,
    datasheets) **+ homepage banner/hero** — hero currently hardcoded in
    `app/[locale]/page.tsx`, must be extracted to `content/pages/home.yaml`.
  - Content format: `content/<entity>/*.yaml` per item (bilingual vi/en
    fields); news → `content/news/*.md` with markdown body, converted to HTML
    at build behind the same `lib/data/*` seam (pages unchanged).
  - Images: Sveltia uploads to `public/uploads/` in repo (move to R2 only if
    repo weight becomes a problem).
  - Auth: create GitHub accounts for data-entry staff, invite to repo with
    write access; OAuth via `sveltia-cms-auth` Cloudflare Worker (free).
  - Publish flow: Sveltia commit → Cloudflare Pages auto-rebuild (~2–5 min
    accepted latency). Build failure keeps last good deploy live — site never
    breaks from bad content; add CI content-schema check for early errors.
  - Open question for implementation: does Sveltia UI ship a Vietnamese
    locale? If not, English UI + Vietnamese field labels in `config.yml`.
- **CRM/ERP system** — separate project / brainstorm.

## Success criteria (whole plan)

- [ ] `next build` produces a complete `out/` directory with zero server-only
      runtime references.
- [ ] Every public route renders correctly on a `*.pages.dev` preview URL in
      both VI and EN.
- [ ] SEO surface intact: sitemap, robots, OG images, hreflang, JSON-LD.
- [ ] Old un-prefixed VI URLs (`/products`, `/news`, …) 301 → `/vi/*`.
- [ ] Production cutover with < 5 min downtime and a verified rollback path
      (Vercel deployment kept warm for 1 week).
- [ ] Monthly hosting cost ≤ $1.

## Dependencies

- **Blocks** [`260511-1436-fullstack-cms-bilingual`](../260511-1436-fullstack-cms-bilingual/plan.md):
  this migration tears down the bulk of that plan's output. The CMS plan should
  be marked superseded once Phase 4 completes.
- No upstream blockers.

## Risk register (cross-phase)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Content drift between DB and `data/*.ts` (user says none, but verify before merge) | Low | High | Phase 1 step 0 diff check: spot-check 3 random rows per entity (DB row vs `data/*.ts`). Abort & dump DB if drift found. |
| Old `/products` URLs lose SEO equity | Med | High | Cloudflare `_redirects` 301 map (Phase 3); verify with `curl -I` before cutover. |
| `generateStaticParams` misses a dynamic route (e.g. applications) → 404 | Med | Med | Phase 2 audit: all `[slug]` routes have explicit `generateStaticParams`. |
| OpenGraph images use `runtime = "edge"` → fail in static | High | Low | Phase 2 fix: convert to build-time generation or static PNG. |
| Cloudflare Pages build env mismatch (Node version, yarn vs pnpm) | Med | Med | Lock Node 22 (matches local v22.21.1) via `.nvmrc` + `NODE_VERSION` in Pages env. |
| Rollback needed mid-cutover | Low | High | Keep Vercel deployment live + DNS TTL ≤ 300 for 24h before cutover. |

## Validation Log

### Session 1 — 2026-06-11
**Trigger:** `/ck:plan validate` invoked on plan before implementation.
**Questions asked:** 4

### Verification Results
- Claims checked: 25
- Verified: 23 | Failed: 2 | Unverified: 0
- Tier: Standard (4 phases — Fact Checker + Contract Verifier)
- Failures:
  1. Node version contradiction — plan pinned Node 20, but local env is v22.21.1
     and Phase 3 says "match the local build version" (phase-03 §Key Insights 3).
  2. Lead-form inventory incomplete — 4 client forms POST to `/api/leads`:
     `app/[locale]/contact/_components/contact-form.tsx`,
     `app/[locale]/downloads/_components/datasheet-request-form.tsx`,
     `app/[locale]/services/_components/inquiry-form.tsx`,
     `components/newsletter-form.tsx`. Plan named only contact + vague "search components".
- Notable verified claims: all Phase 1 delete targets exist; `lib/data/*` seam
  exports match (`getAllProducts`/`getProductBySlug`/`getProductSlugs`/`getProductCount`
  + `*ForAdmin`, `"use cache"` in all 5 files); applications `[slug]` lacks
  `generateStaticParams` while products/news/services have it; `runtime = "edge"`
  in all 4 OG image files; `localePrefix: "as-needed"` in `lib/i18n/routing.ts`;
  all removable deps present in `package.json`; repo is `tyden39/qs-website`;
  yarn 1.22.21 (classic, `--frozen-lockfile` syntax correct).

#### Questions & Answers

1. **[Risks]** The plan pins Node 20 LTS (.nvmrc + NODE_VERSION) but also says
   "match the local build version" — and local runs Node v22.21.1. Which version
   should be pinned everywhere (local, .nvmrc, Cloudflare Pages)?
   - Options: Pin Node 22 (Recommended) | Pin Node 20
   - **Answer:** Pin Node 22
   - **Rationale:** Zero env drift between dev and Pages build; Node 22 is
     current LTS and supported by Cloudflare Pages.

2. **[Scope]** 4 client forms POST to `/api/leads`, not just contact. How should
   each be handled when forms are hidden?
   - Options: Disable all 4 the same way (Recommended) | Free datasheet downloads | Hide newsletter, disable rest
   - **Answer:** Disable all 4 the same way
   - **Rationale:** Uniform "temporarily closed, email us" treatment. Datasheet
     files stay gated (unreachable) until CRM lands — accepted trade-off.

3. **[Tradeoffs]** Which OG image strategy first for static export?
   - Options: Build-time per-slug + static root (Recommended) | All static PNGs | All build-time ImageResponse
   - **Answer:** Build-time per-slug + static root
   - **Rationale:** Root gets a static `app/opengraph-image.png`; entity
     `[slug]` cards prerender via `ImageResponse` at build, with static-PNG
     fallback per family if the Pages build proves flaky.

4. **[Assumptions]** Step 0 drift-check needs the dev Neon DB reachable. Run it?
   - Options: Yes, DB reachable — run check (Recommended) | Skip — seed is authoritative | DB unreachable — skip gracefully
   - **Answer:** Yes, DB reachable — run check
   - **Rationale:** Cheap one-shot guardrail before deleting `lib/db`; verifies
     the locked "seed is authoritative" decision instead of trusting it blindly.

#### Confirmed Decisions
- Node pin: **22** everywhere (`.nvmrc`, `NODE_VERSION`, local) — matches local v22.21.1.
- Lead forms: **all 4** (contact, datasheet-request, service inquiry, newsletter)
  get the same disabled treatment; datasheets stay gated until CRM.
- OG images: static root PNG + build-time per-slug entity cards (fallback: static per family).
- Drift check: **runs** as planned (DB confirmed reachable).

#### Action Items
- [x] Phase 1: enumerate all 4 lead forms explicitly in Modify list + Step 4
- [x] Phase 2: root OG → static PNG (delete `app/opengraph-image.tsx`, add PNG)
- [x] Phase 3: Node pin 20 → 22 (`.nvmrc`, `NODE_VERSION`, risk row)
- [x] plan.md risk register: Node 20 → 22

#### Impact on Phases
- Phase 1: form-disable scope widened from "contact + search components" to 4 named files.
- Phase 2: OG step 3 made concrete (no more hedge between prerender/static for root).
- Phase 3: env pin updated; no other change.
- Phase 4: no impact.

### Whole-Plan Consistency Sweep
- Swept all 5 plan files for stale terms after propagation: "Node 20" /
  "20 LTS" / "search components" remain only inside this Validation Log as
  historical record — no live instruction references them.
- Fixed a propagation-introduced contradiction in phase-02 Related Code Files:
  entity OG entries said "— same." after the root entry changed to
  delete-and-replace; entity entries now state their own instruction
  (remove edge runtime + `generateImageMetadata`). Root OG moved to
  Delete (+ `app/opengraph-image.png` in Create) to avoid a duplicate
  instruction in Modify.
- Phase 2 Key Insight 4 ("static fallback for root + per-slug pre-render for
  entity cards") already matched the validated decision — unchanged.
- Phase 4 has no Node/form/OG references — no changes needed.
- **Unresolved contradictions: 0.**

## Documentation impact

After Phase 4 completes, `docs-manager` agent must update:
- `docs/development-roadmap.md` — close out CMS phase, open "static site" phase.
- `docs/project-changelog.md` — record CMS teardown + static migration.
- `docs/system-architecture.md` — replace Vercel/Neon/Better-Auth diagrams with
  Cloudflare Pages static topology.
