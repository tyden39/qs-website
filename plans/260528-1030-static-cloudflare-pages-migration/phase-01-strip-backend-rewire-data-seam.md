---
phase: 1
title: "Strip backend & rewire data seam"
status: pending
priority: P1
effort: "1d"
dependencies: []
---

# Phase 1: Strip backend & rewire data seam

## Context Links

- [Brainstorm](../reports/260526-1614-brainstorm-vps-cloudflare-migration.md) §Code: giữ / bỏ + §Phase 1
- Current data seam: [lib/data/](../../lib/data/) (DB-backed, to be rewritten)
- Static seed: [data/](../../data/) (becomes the source of truth)

## Overview

Tear out the dynamic CMS surface (admin, auth, DB, upload, cron, leads API) and
collapse the public data layer onto file-backed reads from `data/*.ts`. After
this phase, `next build` must succeed with **zero imports from `lib/db`,
`better-auth`, `@vercel/blob`, `@upstash/*`, `@neondatabase/serverless`, `ws`,
or `isomorphic-dompurify`** anywhere in the build graph.

## Key Insights

1. **The data seam stays.** `lib/data/products.ts` etc. export
   `getAllProducts(locale)` / `getProductBySlug(slug, locale)` / `getProductSlugs()`.
   Every public page already calls them. Rewrite the body to read `data/*.ts`
   synchronously; do not touch page imports. This is the cleanest reuse — and
   it sets up future Phase 6 (Sveltia) to swap the underlying source without
   touching pages again.
2. **The shaping logic is reused.** `pickLocale` + `toView` + the `*View` types
   stay. Only the source flips from `db.select()` → `data/*.ts` arrays.
3. **The static `data/*.ts` files exist and match the seed.** User confirmed
   2026-05-28 that they are current; we still add a one-shot diff check (Step 0)
   before the point of no return.
4. **`"use cache" / cacheTag / cacheLife`** can be dropped — file reads at build
   time are trivially cheap and the cache primitives may add noise in static
   export. Removing them simplifies and aligns with KISS.
5. **`app/[locale]/services/[slug]/page.tsx` already imports `@/data/services`**
   in addition to the lib/data path ([proof](../../app/[locale]/services/[slug]/page.tsx#L4)).
   Unify on the seam.

## Requirements

### Functional
- Public routes render identical content (VI + EN) before and after the rewrite.
- Sitemap output unchanged (same slugs, same locales).
- JSON-LD output unchanged.
- `data/*.ts` exposes the typed shapes that `lib/data/*.ts` previously got from
  Drizzle (adapt `data/*.ts` to include `slug`, `publishedAt`, `status`, image
  alts as i18n objects, etc. — whatever pages consume via View types).

### Non-functional
- No new runtime dependencies.
- Package count drops sharply; verify with `yarn why <pkg>` that the listed
  removed deps have no remaining importers.
- `next build` exits 0 on a clean checkout with no `DATABASE_URL`,
  `BETTER_AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, etc.

## Architecture

```
Before:
  app/[locale]/products/page.tsx
    → lib/data/products.ts  ── db.select() ── Neon
    
After:
  app/[locale]/products/page.tsx     (unchanged)
    → lib/data/products.ts  ── reads data/products.ts (typed array, pure JS)
```

`lib/data/i18n-field.ts` (`pickLocale`) is kept untouched. The `*View` types
stay. The seed files become the contract — Zod schemas are NOT added in this
phase (deferred to Phase 6 when the source moves to YAML/MDX and the schema
becomes meaningful as a build-time guard).

## Related Code Files

### Delete (entire directories / files)
- [app/admin/](../../app/admin/) — every admin route, server action, component.
- [app/api/upload/](../../app/api/upload/), [app/api/leads/](../../app/api/leads/),
  [app/api/auth/](../../app/api/auth/), [app/api/cron/](../../app/api/cron/) — every
  API route folder.
- [lib/auth/](../../lib/auth/)
- [lib/db/](../../lib/db/) (schema, client, migrations directory stays in git
  history for reference; delete from working tree).
- [lib/leads/](../../lib/leads/)
- [drizzle.config.ts](../../drizzle.config.ts)
- [app/[locale]/accept-invite/](../../app/[locale]/accept-invite/) (admin-only, uses lib/db).
- [app/[locale]/(auth)/](../../app/[locale]/(auth)/) (login page, admin-only).

### Modify
- [lib/data/products.ts](../../lib/data/products.ts) — drop Drizzle imports, read
  from `data/products.ts`; remove all `*ForAdmin` exports. Keep `ProductView`,
  `getAllProducts`, `getProductBySlug`, `getProductSlugs`, `getProductCount`.
- [lib/data/news.ts](../../lib/data/news.ts) — same pattern.
- [lib/data/services.ts](../../lib/data/services.ts) — same pattern.
- [lib/data/applications.ts](../../lib/data/applications.ts) — same pattern;
  ensure slug lookup works against `data/applications.ts`.
- [lib/data/datasheets.ts](../../lib/data/datasheets.ts) — same pattern.
- [app/[locale]/services/[slug]/page.tsx](../../app/[locale]/services/[slug]/page.tsx) —
  drop the direct `@/data/services` import; route everything through `lib/data/services`.
- [app/[locale]/contact/](../../app/[locale]/contact/) — disable form submit
  (button greyed + tooltip "Đang chuyển sang hệ thống CRM mới — vui lòng email
  trực tiếp"); keep markup so layout stays. Do NOT remove the page.
- Search component(s) using lead/contact forms — same treatment.
- [package.json](../../package.json) — remove deps listed below; keep `next-intl`,
  `next`, `react*`, `zod`, `tailwindcss*`, `tsx`, `typescript`, `lucide-react`,
  `@hookform/resolvers`, `react-hook-form`. Also remove `i18n:bootstrap` script
  if it depends on db.
- [data/*.ts](../../data/) — if any field consumed by `lib/data/*.ts` is missing
  (e.g. `publishedAt`, locale shape mismatch), patch the seed file. Document each
  diff in the PR.

### Create
- None (the seam stays).

### Dependencies to remove (verify zero importers post-rewrite)
`@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit`, `better-auth`,
`@better-auth/cli`, `@vercel/blob`, `botid`, `ws`, `@types/ws`,
`isomorphic-dompurify`, `@upstash/ratelimit`, `@upstash/redis`,
`@tiptap/*` (admin editor only), `lowlight`, `resend`, `@react-email/components`,
`react-email`, `dotenv` (if only used for db scripts).

## Implementation Steps

0. **Drift check (one-shot guardrail).**
   - User confirmed `data/*.ts` is current. Verify cheaply: with the dev DB
     still reachable, run `tsx scripts/diff-db-vs-seed.ts` (write a 30-line
     script that selects 3 random rows per table and diffs against the matching
     `data/*.ts` entry).
   - If any drift > whitespace, STOP and surface to user before deleting `lib/db`.

1. **Branch + safety net.**
   - `git checkout -b feat/static-cloudflare-migration`
   - `git tag cms-archive` on the current `main` HEAD before deleting anything —
     irreversible code goes behind a recoverable label.

2. **Rewrite `lib/data/*.ts` (5 files).**
   - For each file: strip `drizzle-orm`, `lib/db`, `next/cache` imports.
   - Replace `db.select()...` with a typed import from `data/<entity>.ts`.
   - For `getProductBySlug(slug, locale)`: `data.find(p => p.slug === slug)`.
   - For `getProductSlugs()`: return `data.map(p => p.slug)`.
   - Keep `pickLocale` and `toView` semantics — they map an i18n object to a
     locale-specific string, which `data/*.ts` already produces in seed form.
   - **Remove all `*ForAdmin` exports** — they have no consumer after admin is deleted.

3. **Delete the dynamic surface.**
   - `git rm -r app/admin app/api lib/auth lib/db lib/leads drizzle.config.ts \
       app/[locale]/accept-invite "app/[locale]/(auth)"`
   - `git rm scripts/translate-data.ts` (if it touches db).
   - Drop `i18n:bootstrap` from `package.json` scripts.

4. **Disable lead capture forms.**
   - Set submit handlers to no-op + show static "tạm thời đóng" notice.
   - Leave form markup in place (UX continuity; future CRM hookup is trivial).
   - Remove any `import { Resend }` / `lib/email/*` usage from form code paths.

5. **Prune `package.json` + lockfile.**
   - Delete every dep listed in "Dependencies to remove" above.
   - `rm -rf node_modules .next && yarn install` to regenerate the lockfile clean.
   - `grep -rn "@neondatabase\|drizzle\|better-auth\|@vercel/blob\|botid\|isomorphic-dompurify\|@upstash" app lib components data` must return zero hits.

6. **Confirm build (still dynamic / non-export at this point).**
   - `yarn build` should succeed.
   - Boot `yarn start` and click through `/`, `/products`, `/products/<slug>`,
     `/news`, `/news/<slug>`, `/services/<slug>`, `/applications/<slug>`,
     `/downloads/datasheets`, both VI + EN.
   - Disabled form pages render without errors.

7. **CSP cleanup.**
   - In [next.config.mjs](../../next.config.mjs) drop
     `https://*.public.blob.vercel-storage.com` from `img-src` and
     `https://api.resend.com` from `connect-src`. CSP gets re-emitted as a
     Cloudflare `_headers` file in Phase 3 — this edit just keeps the dev/build
     CSP honest.

8. **Commit + PR.**
   - One commit removing dynamic surface; one rewriting the data seam; one
     pruning deps. Conventional commits, no AI references.
   - Open PR; do **not** merge until Phase 2 succeeds.

## Todo List

- [ ] Run Step 0 drift check, confirm zero drift (or escalate)
- [ ] Create `feat/static-cloudflare-migration` branch + `cms-archive` tag
- [ ] Rewrite `lib/data/products.ts` against `data/products.ts`
- [ ] Rewrite `lib/data/news.ts`
- [ ] Rewrite `lib/data/services.ts`
- [ ] Rewrite `lib/data/applications.ts`
- [ ] Rewrite `lib/data/datasheets.ts`
- [ ] Delete `app/admin/`, `app/api/`, auth/db/leads lib dirs, drizzle config
- [ ] Delete `(auth)` and `accept-invite` locale routes
- [ ] Disable contact / lead forms with "tạm thời đóng" notice
- [ ] Prune `package.json` deps; verify zero importers via grep
- [ ] `yarn build && yarn start` smoke test all public routes VI + EN
- [ ] Tighten CSP in `next.config.mjs`
- [ ] Open PR (do not merge until Phase 2 green)

## Success Criteria

- [ ] `grep -rn "lib/db\|@/lib/auth\|better-auth\|@neondatabase\|drizzle\|@vercel/blob\|@upstash\|isomorphic-dompurify\|botid" app lib components` → 0 results
- [ ] `yarn build` succeeds with NO env vars set beyond `NEXT_PUBLIC_APP_URL`
- [ ] All public routes return 200 in `yarn start` smoke
- [ ] Sitemap.xml output diff vs `main` shows only structural noise (no content loss)
- [ ] Contact / lead form UIs render and degrade gracefully

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Hidden `lib/data/*.ts` consumer in a deleted admin file pulls a `*ForAdmin` export → TS error | After deleting admin, `tsc --noEmit` will catch — fix by removing the dangling export |
| `data/*.ts` field shape doesn't match `View` type contract | Patch seed files in this phase; document the diff in PR |
| Contact form silently keeps POSTing to deleted `/api/leads` | Grep for `/api/leads` in client code; replace with no-op handler |
| Tag `cms-archive` is mis-placed (after a delete) → recovery harder | Apply tag BEFORE any `git rm` |

## Security Considerations

- Deleting `app/api/auth/[...all]` removes the Better Auth surface — no session
  cookies are emitted anymore. The CSP can drop credentialed allowances.
- `.env.local` keys for `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BLOB_*`,
  `UPSTASH_*` become dead — schedule rotation/revocation after Phase 4 cutover
  (Vercel + Neon + Upstash + Vercel Blob dashboards).
- `lib/email/templates/*` Resend usage is gone — revoke the Resend API key.

## Next Steps

→ Phase 2: enable `output: "export"` and fix the static-export blockers
documented in the brainstorm.
