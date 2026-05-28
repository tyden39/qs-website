---
title: "Fullstack CMS + Bilingual (VI/EN) cho QS Website — Parallel Execution"
description: ""
status: pending
priority: P2
branch: "main"
tags: []
blockedBy: [260528-1030-static-cloudflare-pages-migration]
blocks: []
supersededBy: 260528-1030-static-cloudflare-pages-migration
created: "2026-05-16T07:34:22.305Z"
createdBy: "ck:plan"
source: skill
---

> **⚠️ SUPERSEDED 2026-05-28.** Direction reversed: the dynamic CMS, DB, auth,
> upload and lead-capture surface implemented under this plan is being torn
> down. See [Static + Cloudflare Pages Migration](../260528-1030-static-cloudflare-pages-migration/plan.md)
> for the current direction. Implementation commits remain reachable via the
> `cms-archive` git tag (created in Phase 1 of the migration) if any code
> needs to be revived.

# Fullstack CMS + Bilingual (VI/EN) cho QS Website — Parallel Execution

## Overview

Convert QS Technology static brochure Next.js site (currently hardcoded `data/*.ts`) into fullstack CMS với **parallel execution structure** (fan-out by entity):

- Neon Postgres + Drizzle ORM (TS-native, schema dễ port master Go sau)
- Better Auth (1 user table, role-based: `admin` / `editor` / `customer`) — UI cho admin only, schema sẵn cho client
- Admin CRUD `/admin/*` cho products, news, applications, services, datasheets, leads
- Bilingual VI/EN từ ngày 1 với next-intl + JSON column cho translatable fields
- SEO build sẵn: metadata, sitemap, robots, OG image động, JSON-LD typed
- Deploy Vercel (Fluid Compute, no Cloudflare proxy)
- Standalone — sync master Go service sau (Phương án B trong brainstorm)

**Brainstorm report:** [plans/reports/brainstorm-260511-1436-fullstack-cms-bilingual.md](../reports/brainstorm-260511-1436-fullstack-cms-bilingual.md)

**Scope:** Solo dev `ducnt` ~35–40d sequential. Optional async multi-agent fan-out can compress to ~20d wall, but file ownership boundaries are advisory not enforced. KHÔNG over-engineer.

**Execution model (revised after Red Team Session 2):**
- **Phase 1 + 2:** Sequential bottlenecks (foundation + shared infra). Phase 2 effort re-estimated 5d→7d to absorb content extraction (F6).
- **Phase 3–9:** Logically independent streams. For solo dev: sequential with optional bundling (e.g., Products+News in one week). For multi-agent: async fan-out OK. File ownership tables remain useful for commit hygiene.
- **Phase 10:** Sequential convergence (QA + deploy)

**Decisions (verified Session 1, locked):**
- Slug: cùng slug 2 locale (`/products/f86` & `/en/products/f86`)
- Image alt: bilingual required
- Audit retention: 180 ngày
- Admin invite flow: admin invite editor (no self-register)
- Locale default: always-VI (no Accept-Language redirect)
- Cache API: Next 16 `'use cache'` Cache Components (directive + `cacheTag` + `cacheLife`)
- First admin: `scripts/create-admin.ts` đọc `ADMIN_EMAIL`+`ADMIN_PASSWORD` env, idempotent (Better Auth API)
- News body migration: HTML → Tiptap JSON ngay lúc seed bằng `@tiptap/html` `generateJSON()`
- ~~Auth middleware runtime: Node.js (`export const runtime = 'nodejs'`)~~ → **Updated Session 2 (F7):** Next 16 deprecates `middleware.ts`; use `proxy.ts` (Node-only by default, runtime not configurable). Move auth gating to layouts (`app/admin/layout.tsx`); `proxy.ts` handles routing + locale only.
- **Updated Session 2 (F2):** DB driver switched from `drizzle-orm/neon-http` → `drizzle-orm/neon-serverless` (WebSocket Pool) for Better Auth transaction support.
- **Updated Session 2 (F11):** `messages/vi.json` split into per-namespace files under `messages/vi/*.json`; built-time merge via next-intl config.
- **Updated Session 2 (F8):** File uploads use Vercel Blob client-direct-upload (`@vercel/blob/client` handleUpload); `/api/upload` becomes signed-token issuer only.
- **Updated Session 2 (F13):** Enable Better Auth cookie-cache plugin to avoid DB query per request in middleware/layout.
- CRM Go sync: phase 11+, ngoài scope

### Package Versions (pinned 2026-05-19 — latest stable)

| Package | Version | Notes |
|---------|---------|-------|
| `next` | `^16.2.6` | bump từ 16.2.5 |
| `react` / `react-dom` | `^19.2.6` | unchanged |
| `typescript` | `^6.0.3` | unchanged |
| `tailwindcss` / `@tailwindcss/postcss` | `^4.3.0` | bump từ 4.2.4 |
| `@types/node` | `^25.9.0` | bump |
| `drizzle-orm` | `^0.45.2` | new |
| `drizzle-kit` | `^0.31.10` | new (devDep) |
| `@neondatabase/serverless` | `^1.1.0` | new (v1 stable) |
| `ws` / `@types/ws` | `^8.20.1` / `^8.18.1` | new |
| `better-auth` | `^1.6.11` | new |
| `@better-auth/cli` | `^1.4.21` | new (devDep) |
| `next-intl` | `^4.12.0` | v4 — check migration guide vs v3 examples |
| `@vercel/blob` | `^2.4.0` | v2 — `handleUpload` signed-token API stable |
| `zod` | `^4.4.3` | **v4 breaking change vs v3** — error API mới, `z.coerce.*` chuyển sang `z.coerce({…})` |
| `react-hook-form` | `^7.76.0` | new |
| `@hookform/resolvers` | `^5.2.2` | **v5 breaking** — Zod 4 adapter mới (`zodResolver` import path không đổi) |
| `isomorphic-dompurify` | `^3.13.0` | new |
| `@tiptap/*` (react, starter-kit, extension-link, extension-image, extension-code-block-lowlight) | `^3.23.4` | **v3 breaking change vs v2** — `<EditorContent>` API, mark/node naming, schema mới |
| `lowlight` | `^3.3.0` | v3 cần highlight.js v11+ ESM |
| `@tailwindcss/typography` | `^0.5.19` | devDep |
| `resend` | `^6.12.3` | v6 |
| `react-email` / `@react-email/components` | `^6.1.5` / `^1.0.12` | **v6 breaking** vs v3 — CLI command đổi (`email dev` → `npx react-email dev`) |
| `@upstash/ratelimit` | `^2.0.8` | v2 — algorithm API tweak |
| `@upstash/redis` | `^1.38.0` | |
| `botid` | `^1.5.11` | **Package renamed**: was `@vercel/botid`, official npm là `botid` (kept `import { ... } from 'botid'`) |
| `schema-dts` | `^2.0.0` | JSON-LD types |

**Breaking-change migration callouts (apply during phase implementation):**
- **Zod 4:** lots of plans dùng `.refine` patterns — Zod 4 đổi `errorMap` → `error` callback, `z.string().email()` chuyển sang `z.email()`. Khi viết `lib/validation/*-schema.ts` (Phase 2 + per-entity), follow Zod 4 docs.
- **next-intl 4:** `defineRouting` signature giữ nguyên nhưng `createMiddleware` đổi tên thành `createIntlMiddleware`; `getTranslations` server-side đổi import path. Phase 1 step 6 + phase 8 cần verify.
- **Tiptap 3:** `useEditor` config dùng `immediatelyRender: false` cho SSR; `extension-code-block-lowlight` dùng `CodeBlockLowlight.configure({ lowlight })` với lowlight v3 ESM. Phase 4 editor wrapper cần adapt.
- **react-email 6 / @react-email/components 1.x:** template syntax giữ nguyên, nhưng CLI runner đổi sang `npx react-email dev`; render API là `await render(<Template />)` (async). Phase 6 cần await.
- **botid (rebrand):** thay `import { ... } from '@vercel/botid'` → `import { ... } from 'botid'`. Phase 6 step 2 fix.

## Phases

| Phase | Name | Status | Dependencies | Execution |
|-------|------|--------|--------------|-----------|
| 1 | [Foundation](./phase-01-foundation.md) | Completed | — | Sequential |
| 2 | [Schema + Data Layer + Admin Shell](./phase-02-schema-data-shell.md) | Completed | 1 | Sequential |
| 3 | [Products CRUD](./phase-03-products-crud.md) | Completed | 2 | **Parallel stream A** |
| 4 | [News CRUD (Tiptap)](./phase-04-news-tiptap.md) | Completed | 2 | **Parallel stream B** |
| 5 | [Applications + Services CRUD](./phase-05-applications-services-crud.md) | Completed | 2 | **Parallel stream C** |
| 6 | [Datasheets + Leads + Public Forms](./phase-06-datasheets-leads-forms.md) | Completed | 2 | **Parallel stream D** |
| 7 | [SEO Complete](./phase-07-seo-complete.md) | Completed | 2 | **Parallel stream E** |
| 8 | [i18n EN + Locale Switcher](./phase-08-i18n-en-locale-switcher.md) | Completed | 2 | **Parallel stream F** |
| 9 | [Admin Polish (audit/users/invite)](./phase-09-admin-polish.md) | Completed | 2 | **Parallel stream G** |
| 10 | [QA & Production Deploy](./phase-10-qa-production-deploy.md) | Pending | 3,4,5,6,7,8,9 | Sequential |

## Parallel Execution Map

```
Phase 1 ──► Phase 2 ──┬──► Phase 3 (Products) ────────┐
                       ├──► Phase 4 (News+Tiptap) ─────┤
                       ├──► Phase 5 (Apps+Services) ───┤
                       ├──► Phase 6 (Datasheets+Leads) ├──► Phase 10 (QA+Deploy)
                       ├──► Phase 7 (SEO) ─────────────┤
                       ├──► Phase 8 (i18n EN) ─────────┤
                       └──► Phase 9 (Admin Polish) ────┘
```

## File Ownership Boundaries

Phase 2 pre-bakes **all cross-cutting infrastructure** so parallel streams have clean ownership:
- Catalog schema (all entities finalized upfront)
- Admin shell + sidebar (placeholder nav for all modules)
- `messages/vi.json` skeleton with namespaces for all entities
- Shared helpers: `lib/data/i18n-field.ts`, `app/admin/_actions/audit.ts`, `app/api/upload/route.ts`
- `lib/validation/*-schema.ts` stub files per entity

| Stream | Owns (no other stream edits) |
|--------|------------------------------|
| Phase 3 Products | `app/admin/products/*`, `app/[locale]/products/*`, `lib/data/products.ts`, `lib/validation/product-schema.ts`, `app/admin/_actions/products.ts` |
| Phase 4 News | `app/admin/news/*`, `app/[locale]/news/*`, `lib/data/news.ts`, `lib/validation/news-schema.ts`, `app/admin/_actions/news.ts`, `components/tiptap-*` |
| Phase 5 Apps+Services | `app/admin/applications/*`, `app/admin/services/*`, `app/[locale]/applications/*`, `app/[locale]/services/*`, `lib/data/{applications,services}.ts`, `app/admin/_actions/{applications,services}.ts` |
| Phase 6 Datasheets+Leads | `app/admin/datasheets/*`, `app/admin/leads/*`, `app/[locale]/downloads/*`, `app/[locale]/contact/_components/*`, `lib/email/*`, `lib/ratelimit.ts`, `app/admin/_actions/{datasheets,leads}.ts` |
| Phase 7 SEO | `app/sitemap.ts`, `app/robots.ts`, `app/**/opengraph-image.tsx`, `lib/seo/*`, `generateMetadata` additions in `app/[locale]/**/page.tsx` |
| Phase 8 i18n EN | `messages/en.json` (full), `components/locale-switcher.tsx`, `scripts/translate-data.ts`, `scripts/check-i18n-keys.ts` |
| Phase 9 Admin Polish | `app/admin/audit/*`, `app/admin/users/*`, `app/admin/settings/*`, `app/[locale]/accept-invite/*` (Updated Session 2 F14 — moved out of `(auth)` group), `lib/email/templates/admin-invite.tsx`, `app/admin/_actions/users.ts` |

**Coordination required (cross-stream):**
- `app/admin/_components/sidebar.tsx`: Phase 2 creates with ALL nav links upfront (links may 404 until stream lands)
- `messages/vi.json`: Phase 2 creates namespace skeleton; each stream adds keys to its OWN namespace
- `lib/db/schema/catalog.ts`: Phase 2 FREEZES all entity columns upfront; streams DO NOT alter schema
- `app/[locale]/**/page.tsx` (public pages): Phase 2 refactors all to fetch DB; streams add `generateMetadata` later via Phase 7

## Dependencies

<!-- Cross-plan dependencies -->

## Validation Log

### Session 1 — 2026-05-11 (post-creation validation)

**Verification Results**
- Claims checked: 3 (existing codebase facts)
- Verified: 3 | Failed: 0 | Unverified: 0
- Tier: Standard (focused — most plan claims forward-looking)
- Evidence:
  - ✅ Next.js 16.2.5 confirmed (`package.json`) — bumped to `^16.2.6` on 2026-05-19 (see Package Versions block)
  - ✅ `machineMap` inline trong `app/applications/[slug]/page.tsx:3` confirmed
  - ✅ Existing structure (`app/`, `components/`, `data/`) matches plan assumptions

**Questions Asked: 4**

| # | Decision | Selected | Affects |
|---|---|---|---|
| 1 | Cache API | Next 16 `'use cache'` Cache Components (directive + `cacheTag` + `cacheLife`) — không dùng `unstable_cache` | Phase 1 (enable `experimental.useCache`), Phase 2 (data access pattern) |
| 2 | First admin user | `scripts/create-admin.ts` đọc `ADMIN_EMAIL`+`ADMIN_PASSWORD` env, idempotent (Better Auth API) | Phase 2 (Step 0), Phase 10 (prod create) |
| 3 | News body migration | HTML → Tiptap JSON ngay lúc seed bằng `@tiptap/html` `generateJSON()` — preserve fidelity cho admin re-edit | Phase 2 (seed step), Phase 4 (Tiptap edits JSON) |
| 4 | Auth middleware runtime | Node.js (`export const runtime = 'nodejs'`) — tránh edge incompat với Better Auth | Phase 1 (middleware setup), Phase 2 (auth gate) |

### Session 2 — 2026-05-16 (replan parallel)

**Restructure decisions:**
- Approach: Fan-out by entity (chosen via user confirmation)
- Preserve 100% verified technical decisions from Session 1
- Old 8-phase sequential plan → 10-phase parallel plan
- Phase 2 absorbed admin shell setup from old Phase 3 to enable clean fan-out
- Phase 9 (Admin Polish) split from old Phase 7 (i18n + polish) — admin polish now parallel với i18n EN
- Phase 10 (QA + Deploy) unchanged from old Phase 8

**File restructuring:**
| Old Phase | New Phase | Notes |
|-----------|-----------|-------|
| 1 Foundation | 1 Foundation | Unchanged |
| 2 Data Migration & Public Read | 2 Schema + Data Layer + Admin Shell | Merged with admin shell setup from old phase 3 |
| 3 Admin Shell & Products CRUD | 3 Products CRUD | Admin shell moved to phase 2; only products portion remains |
| 4 News + Apps + Services CRUD | 4 News (Tiptap) + 5 Apps+Services | Split into 2 streams |
| 5 Datasheets + Leads + Forms | 6 Datasheets + Leads + Forms | Renumbered |
| 6 SEO Complete | 7 SEO Complete | Renumbered, now parallel |
| 7 i18n + Admin Polish | 8 i18n EN + 9 Admin Polish | Split into 2 streams |
| 8 QA & Deploy | 10 QA & Deploy | Renumbered |

## Red Team Review

### Session 2 — 2026-05-16

**Mode:** `--parallel` auto-triggered red-team after replan.
**Reviewers:** 4 hostile (Security Adversary, Failure Mode Analyst, Assumption Destroyer, Scope & Complexity Critic) — each delivered 10 findings.
**Consolidation:** 40 raw findings → 15 after dedup + evidence filter.
**Severity:** 6 Critical, 9 High.
**Disposition:** 14 Accepted, 1 user-reaffirmed (F15 scope kept).

| # | Finding | Severity | Disposition | Applied To |
|---|---------|----------|-------------|------------|
| F1 | News HTML→Tiptap migration migrates nothing (`data/news.ts` has no body) | Critical | Accept — extract body from `app/news/[slug]/page.tsx` | Phase 2, Phase 4 |
| F2 | Neon HTTP driver incompatible with Better Auth (no transactions) | Critical | Accept — switch to `drizzle-orm/neon-serverless` | Phase 1, Phase 2 |
| F3 | Stored XSS: Tiptap → dangerouslySetInnerHTML, no DOMPurify, no CSP | Critical | Accept — DOMPurify write+read + CSP nonce | Phase 1, Phase 4 |
| F4 | File upload `image/*` admits SVG; no magic-byte check | Critical | Accept — block SVG + magic-byte sniff | Phase 2 |
| F5 | `requireRole` not enforced across parallel streams | Critical | Accept — Phase 2 creates `lib/auth/require.ts` + `defineAdminAction` HOF + eslint rule | Phase 2, Phase 3–9 |
| F6 | Phase 2 hidden scope: applications/datasheets seed data doesn't exist | Critical | Accept — extract content from page.tsx; re-estimate 5d→7d | Phase 2 |
| F7 | `middleware.ts` deprecated in Next 16 | High | Accept — rename to `proxy.ts`, drop `runtime = 'nodejs'` | Phase 1, Phase 2 |
| F8 | 1MB Server Action body limit breaks Tiptap/PDF upload | High | Accept — Vercel Blob client-direct-upload | Phase 2, Phase 4, Phase 6 |
| F9 | `@tiptap/html` `generateJSON()` requires DOM at runtime | High | Moot (F1 makes migration unnecessary) | — |
| F10 | "20d wall time" claim assumes 7 capable workers; solo dev = 35d+ | High | Accept — re-state effort, drop parallel framing language | plan.md, all phases |
| F11 | `messages/vi.json` concurrent commits = merge conflicts | High | Accept — split into per-namespace files under `messages/vi/*.json` | Phase 2, Phase 8 |
| F12 | `lib/email/*` parallel dependency Phase 9→Phase 6 | High | Accept — Phase 2 creates skeleton | Phase 2, Phase 6, Phase 9 |
| F13 | Auth middleware DB query per request, no cache | High | Accept — Better Auth cookie cache plugin + `React.cache()` wrap | Phase 1, Phase 2 |
| F14 | Invite flow: `(auth)` URL strip + weak token + GET-mark-used race | High | Accept — full hardening (path, entropy, atomic claim, POST-only mark) | Phase 9 |
| F15 | YAGNI scope cuts (audit/invite/Satori/9 JSON-LD/Tiptap/4 forms) | High | **User-reaffirmed: keep original scope.** Audit cannot reverse brainstorm decision. | (none) |

### Whole-Plan Consistency Sweep — Session 2
- Searched all phase files for `unstable_cache`, `middleware.ts` (post-rename), `neon-http`, `messages/vi.json` (post-split), old `(auth)/accept-invite` paths
- Reconciled `plan.md` Decisions block with applied findings
- No unresolved contradictions
- **Result: ready for `/ck:cook` (or `/ck:plan validate` for additional gate)**
