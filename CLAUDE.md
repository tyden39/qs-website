# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Bilingual (Vietnamese default, English secondary) marketing and product-catalogue site for QS Technology Co., Ltd. — CNC controllers, servo drives, inverters, CNC machines, factory automation.

Next.js 16 App Router exported as a **fully static site** (`output: "export"`, `trailingSlash: true`) and served from Firebase Hosting. No server runtime, no database, no API routes. Every page is HTML on disk; all content comes from JSON in the repo; the only runtime network call is the contact form POSTing a lead to the CRM.

That single constraint — static export — explains most of the non-obvious architecture below. When something looks over-engineered, the reason is usually "there is no server."

## Commands

```bash
nvm use && yarn install         # Node 20 (.nvmrc), yarn 1.22.22
cp .env.example .env.local
yarn dev                        # http://localhost:3000/vi/
yarn build                      # static export into out/
yarn lint                       # eslint . (flat config; `next lint` is gone in Next 16)
yarn i18n:check                 # fails if messages/en and messages/vi key sets differ
yarn search:index               # rebuild public/search-index.{vi,en}.json only
yarn img:variants               # rebuild responsive image variants + manifest only
yarn deploy:prod                # yarn build + wrangler pages deploy → Cloudflare Pages
yarn deploy:firebase            # yarn build + firebase deploy → project qstcnc-6207d (legacy, kept during migration)
```

`predev` / `prebuild` run `search:index` and `img:variants` automatically, so a plain `yarn dev` is enough.

**There is no test framework in this repo.** `jsdom` and `node-fetch` are devDependencies used by one-off content-tooling scripts, not a test runner. Do not claim tests exist or invent a way to "run a single test". `yarn build` is the real gate — the export catches missing static params, stale client-message paths and image-loader problems that dev mode tolerates.

Before finishing a change: `yarn lint` clean, `yarn i18n:check` if `messages/` changed, `yarn build` succeeds.

## Architecture

### Content flows through three layers

```
data/<entity>.json     rows (authored in a separate internal admin app, landed here as JSON)
data/<entity>.ts       TypeScript types + `export const x = json as unknown as T[]` — no logic
lib/data/<entity>.ts   locale resolution + derivation → a `<Entity>View` of plain resolved values
app/**/page.tsx        rendering only
```

Pages import content from `lib/data/…`, never from `data/…` (importing a *type* from `data/` is fine). All localisation and fallback happens in the `lib/data` layer, so templates never branch on locale.

Entities: `products` (CNC controllers), `catalog` (DNC units + accessories), `series` (servo/inverter series), `machines`, `news`, `applications`, `services`, `downloads`.

These deliberately **do not share one `Product` type**. A controller has axis count, control-protocol columns and a machine kit; a DB9 cable has none of those; a drive series has no single part number at all because the catalogue sells whole series rather than part numbers. One merged type would leave most fields empty on most rows. Do not "unify" them.

### Bilingual: Vietnamese primary, English sibling

Per-row content uses parallel fields with an exact `En` suffix — `title`/`titleEn`, `desc`/`descEn`, `v`/`vEn`, `alt`/`altEn`. The view layer resolves once with `(en ? x.titleEn : null) ?? x.title`, so a partially translated row still renders instead of showing an empty heading. Locale-neutral values (model codes, ratings, dimensions) are stored **once**.

Two exceptions worth knowing: deeply nested strings inside the series datasheet blocks use `{ vi, en }` pairs instead (parallel `*En` fields would nest four levels deep); and manufacturer figures with baked-in text need a per-locale *file*, so the pair is `src`/`srcEn`.

Chrome copy — labels, headings, buttons, anything not per-row — belongs in `messages/<locale>/<namespace>.json` (15 namespaces), never in JSX or the data files.

### Rendering and i18n plumbing

Locales `["vi","en"]`, default `vi`, `localePrefix: "always"` — every URL carries a prefix and a trailing slash. There is no `app/page.tsx`; Firebase 301s `/` to `/vi/`. `app/layout.tsx` is a pass-through with no `<html>`; the real `<html lang>` lives in `app/[locale]/layout.tsx`.

Server components are the default and read copy with `getTranslations` from `next-intl/server`. `"use client"` appears in ~30 files, only for stateful UI, browser APIs, forms and the in-browser search. Start server-side and add `"use client"` only when something genuinely needs the browser.

**Gotcha:** a client component's message namespace must be listed in `CLIENT_MESSAGE_PATHS` (`lib/i18n/client-messages.ts`) or its keys simply do not exist in the browser. Only listed namespaces are serialised, which cuts roughly 60% off the per-page message payload.

Route-private UI lives in `app/**/_components/` (the `_` prefix excludes it from routing). Promote to `components/` only when a second route needs it — do not reach sideways into another route's `_components/`.

### Search runs entirely in the browser

`scripts/build-search-index.ts` flattens every page-backed content type into `public/search-index.<locale>.json` at build time; the browser fetches it on first use and runs Orama in-memory. BM25 over title/keywords/excerpt (boost 3/2/1), plus an fzf-style fuzzy subsequence pass over titles so a compressed query like `as10` reaches "Astro 10i". Everything indexed and every query is diacritic-folded, so `dieu khien` matches `điều khiển`. A per-type weight ranks pages above their paperwork (PDF records ×0.6) so a model query does not return twelve manuals ahead of the product page.

Copy that lives in `messages/` rather than the data files is read straight from the JSON by that script — it runs outside next-intl, so there is no `t()` available there.

### Images are pre-rendered, not optimized on demand

A static export has no request-time image optimizer, so `scripts/generate-image-variants.ts` pre-renders a width ladder (256/384/640/768/960) as `foo-<w>w.webp` beside each original and records intrinsic widths in `lib/media/image-manifest.json`. A custom loader (`lib/media/image-loader.ts`) maps each requested srcset width onto a rung that exists. The `deviceSizes`/`imageSizes` lists in `next.config.mjs` mirror the ladder on purpose — a width with no file behind it would print the same variant twice as two candidates.

**Import `@/components/media/image`, never `next/image` directly.** The wrapper decides `unoptimized` and `fetchPriority` for you; going around it either emits a dead srcset or leaves an LCP hero queued behind the document. New images go in `public/` as `.webp`. Only the manifest is committed — the generated `-<w>w.webp` files are gitignored.

### Redirects and headers live in `public/_redirects` and `public/_headers`, not `next.config.mjs`

A static export ignores Next's `headers()` and `redirects()`, so **both the security headers (CSP, nosniff, referrer policy, frame options, permissions policy) and the entire 301 table live as plain files under `public/`** — `_redirects` and `_headers`, Cloudflare Pages' native config format, copied verbatim into `out/` by the export and picked up automatically on deploy. They cover: legacy unprefixed paths → `/vi/…`, `/products/*` → `/electronics/*`, `/cnc/*` → `/machine-building/*`, plus one renamed machine slug. Cache-Control is set there too. Editing `next.config.mjs` for either will silently do nothing.

The project is mid-migration from Firebase Hosting to Cloudflare Pages (`yarn deploy:prod` now runs `wrangler pages deploy`). `firebase.json` is kept in sync as the legacy equivalent for `yarn deploy:firebase` — the two redirect/header tables must be edited together until Firebase is decommissioned, at which point `firebase.json` and `deploy:firebase` should be deleted.

Any new outbound origin must be added to the CSP `connect-src` there, or it works locally and is blocked in production.

### Contact form is the one runtime dependency

`app/[locale]/contact/_components/contact-form.tsx` validates with zod, then POSTs to `{NEXT_PUBLIC_CRM_API_BASE}/public/leads` — unauthenticated, rate-limited 5 req/min/IP by the CRM. `lib/crm/leads-client.ts` returns a discriminated result (`ok` | `validation` | `rate_limit` | `server` | `network`) so each outcome renders its own message.

## Conventions worth not re-deriving

- **kebab-case for every module, including React components.** The three PascalCase files (`components/Header.tsx`, `Footer.tsx`, `SearchPanel.tsx`) predate the rule and were never renamed — do not add more.
- **Design tokens only.** Colors and font sizes are declared in the `@theme` block of `app/globals.css`; every text size maps to one of nine scale steps. Do not hard-code a hex or px a token already names. Reusable composites are `qs-*` classes.
- Only one font family is loaded. `--font-display` and `--font-mono` are role aliases pointing at the same Inter face — the "mono" role means uppercase tracked labels, not an actual monospace font.
- Some CSS rules are unlayered on purpose: in Tailwind v4 an `@layer components` rule loses to any utility, so a reset that must win sits outside the layer.
- Every motion rule needs a `@media (prefers-reduced-motion: reduce)` counterpart. Hover-gated animations must also be *paused* when idle — `opacity: 0` never stops the animation clock.
- Every absolute URL goes through `localeUrl()` (`lib/seo/app-url.ts`); every indexable route exports `generateMetadata` with `buildAlternates()`. A hand-built URL differing by a prefix or trailing slash reads as a separate page to a crawler.
- News bodies are crawled HTML and are sanitized with `isomorphic-dompurify` before rendering. `dangerouslySetInnerHTML` is otherwise reserved for four first-party inline constants.
- **Heavy explanatory file-header comments are the established norm here** — they record *why* (the constraint, the alternative that failed), not *what*. Follow it when changing something non-obvious; it is what stops the next person simplifying the code back into the bug. Never put plan IDs, phase numbers or ticket codes in comments or commit messages.

## Further reading

`docs/` was regenerated from the code and is accurate: `codebase-summary.md` (file-by-file tour), `system-architecture.md` (pipeline diagrams), `code-standards.md` (full conventions), `design-guidelines.md` (tokens, motion), `deployment-guide.md` (Firebase, legacy during migration), `cloudflare-deployment-guide.md` (Cloudflare Pages, current `deploy:prod` target — from-zero setup walkthrough), `project-overview-pdr.md`, `project-roadmap.md` (verified gaps, including several known defects not yet fixed).
