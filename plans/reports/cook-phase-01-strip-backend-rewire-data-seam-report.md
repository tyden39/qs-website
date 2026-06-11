# Phase 1 — Strip backend & rewire data seam (cook report)

**Date:** 2026-06-11 · **Branch:** `feat/static-cloudflare-migration` · **Safety tag:** `cms-archive` (pre-teardown HEAD)
**Status:** DONE. Build green, success gate met. Not committed yet (awaiting user).

## What was done

- **Safety net:** tagged `cms-archive` on old `main` HEAD, branched `feat/static-cloudflare-migration`.
- **Data seam rewritten (5 files)** — `lib/data/{products,news,services,applications,datasheets}.ts` now read static `data/*.ts` seeds; dropped Drizzle/`lib/db`/`next/cache`. Same exported names/shapes consumers import. Removed `*ForAdmin`/admin helpers, `*Count`, `getDatasheetsForProduct` (all admin-only).
- **Dynamic surface deleted:** `app/admin`, `app/api`, `lib/{auth,db,leads,email,blob,ratelimit}`, `lib/data/i18n-field.ts`, `drizzle.config.ts`, `app/[locale]/(auth)`, `app/[locale]/accept-invite`, `components/tiptap-*`, db scripts (`seed`, `create-admin`, `drop-all-tables`, `translate-data`).
- **4 lead forms disabled** (contact, newsletter, datasheet-request, inquiry): `/api/leads` fetch removed, submit disabled, "Đang chuyển sang hệ thống CRM mới — email sales@qstechnology.vn" notice. Markup kept. Datasheet downloads gated (no file open).
- **`news/[slug]`**: dropped `isomorphic-dompurify` sanitization (seed HTML is trusted, in-repo).
- **`package.json`** pruned to 8 deps + 10 devDeps (removed neon/drizzle/better-auth/tiptap/upstash/vercel-blob/resend/react-email/dompurify/botid/ws/dotenv). Lockfile regenerated (`yarn install`).
- **`next.config.mjs`** CSP: dropped vercel-blob `img-src` + resend `connect-src`.

## Verification

- `yarn build` ✅ — no DB env needed; all entity slugs prerendered from seeds (products, news, services, applications).
- Success-gate grep (`lib/db|better-auth|@neondatabase|drizzle|@vercel/blob|@upstash|isomorphic-dompurify|botid`) → **0 hits**.
- `yarn i18n:check` ✅ PASSED.
- Runtime smoke (`yarn start`): 10 routes incl. VI+EN + all entity types → **all 200**.
- `code-reviewer` subagent: no Critical/High. Cleanups applied (deleted orphan `i18n-field.ts`, removed unused `getAllServices`/`getAllApplications`, dropped dead `fileUrl` prop, fixed latent `hero.headline` order). Rebuild ✅.

## Deviations from plan (documented)

1. **Seed↔View shapes had diverged** (CMS rewrote pages to View shapes; `data/*.ts` was older). Honored plan intent (keep the seam) by mapping seed→View per entity, defaulting absent fields (`images:[]`, `coverImage/bodyJson:null`, `publishedAt` parsed from VI date string, `heroImage:null`, `sort`=array index).
2. **`services/[slug]/page.tsx` left rendering from `@/data/services`** (not "unified on seam" as plan step said). The page renders seed-shape fields (`line1`/`packages`/`number`) absent from `ServiceView`; routing through the seam would force a full JSX rewrite. Once the seam is DB-free, leaving the page is zero-risk and satisfies the "no `lib/db`" goal.
3. **Single-language seeds:** seeds are VI-only; EN locale falls back to the same VI text (page chrome is largely hardcoded VI already). Accepted per user ("project is new").
4. **Drift check (Step 0) skipped** per user (project new, no real DB data).

## Unresolved questions

- `next.config.mjs` still has `images.remotePatterns` for the vercel-blob host + a stale CSP comment mentioning the rich-text editor — left for Phase 2 config cleanup (out of scope now).
- Dead `.env.local` secrets (Neon/Better-Auth/Blob/Upstash/Resend) scheduled for revocation in Phase 4, not now.
