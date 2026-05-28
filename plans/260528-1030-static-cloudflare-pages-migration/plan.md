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
- **Phase 6 — Git-based Sveltia CMS** (`data/*.ts` → `content/*.{yaml,mdx}`,
  `public/admin/`, GitHub OAuth Worker). Only after Phase 4 cutover is stable;
  starts with a `data/news.ts` PoC.
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
| Cloudflare Pages build env mismatch (Node version, yarn vs pnpm) | Med | Med | Lock Node 20 LTS via `.nvmrc` + `NODE_VERSION` in Pages env. |
| Rollback needed mid-cutover | Low | High | Keep Vercel deployment live + DNS TTL ≤ 300 for 24h before cutover. |

## Documentation impact

After Phase 4 completes, `docs-manager` agent must update:
- `docs/development-roadmap.md` — close out CMS phase, open "static site" phase.
- `docs/project-changelog.md` — record CMS teardown + static migration.
- `docs/system-architecture.md` — replace Vercel/Neon/Better-Auth diagrams with
  Cloudflare Pages static topology.
