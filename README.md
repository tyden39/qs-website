# QS Technology website (`qs-shop`)

Bilingual (Vietnamese default, English secondary) marketing and product-catalogue
site for QS Technology Co., Ltd. — CNC controllers, servo drives, inverters, CNC
machines and factory automation, built in Vietnam.

Next.js 16 App Router, exported as a **fully static site** (`output: "export"`)
and served from Firebase Hosting. There is no server runtime, no database and no
API route: every page is HTML on disk, all content comes from JSON files in the
repo, and the only network call the site makes at runtime is the contact form
POSTing a lead to the CRM.

---

## Quick start

```bash
nvm use                 # Node 20 (.nvmrc)
yarn install
cp .env.example .env.local
yarn dev                # http://localhost:3000/vi/
```

`yarn dev` and `yarn build` both run two generators first (`predev` / `prebuild`):

| Generator | Writes | Why |
|---|---|---|
| `scripts/build-search-index.ts` | `public/search-index.{vi,en}.json` | search runs in the browser, so the index must exist as a static file |
| `scripts/generate-image-variants.ts` | `public/**/*-<width>w.webp` + `lib/media/image-manifest.json` | a static export has no request-time image optimizer, so every responsive width is pre-rendered |

Both outputs except the manifest are gitignored and rebuilt on demand.

### Scripts

| Command | Does |
|---|---|
| `yarn dev` | dev server (generators run first) |
| `yarn build` | static export into `out/` (generators run first) |
| `yarn start` | serve a previously built app |
| `yarn lint` | ESLint 9 flat config (`eslint.config.mjs`) |
| `yarn search:index` | rebuild the search index only |
| `yarn img:variants` | rebuild image variants + manifest only |
| `yarn i18n:check` | fail if `messages/en` and `messages/vi` key sets differ |
| `yarn deploy:prod` | `yarn build` + `firebase deploy --only hosting` to project `qstcnc-6207d` |

There is **no test framework in this repo.** `jsdom` and `node-fetch` are
devDependencies used by one-off tooling scripts, not by a test runner.

### Environment

`.env.example` holds both variables; both are public and inlined into the client bundle.

| Variable | Default | Used for |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://qstcnc.com` (fallback in code) | canonical URLs, hreflang, sitemap, JSON-LD, OG image resolution — baked in at build time |
| `NEXT_PUBLIC_CRM_API_BASE` | `https://crm.qstcnc.com/api/v1` | contact form target; the CRM origin must also be in the CSP `connect-src` in `firebase.json` |

---

## Layout

```
app/
  layout.tsx            pass-through root (no <html>); owns metadataBase
  not-found.tsx         owns its own document → out/404.html for the whole site
  robots.ts sitemap.ts opengraph-image.tsx
  globals.css           Tailwind v4 @theme tokens + the qs-* utility layer
  [locale]/
    layout.tsx          the real <html lang>; header, footer, search, JSON-LD
    page.tsx            home
    about  contact  downloads  search  403  not-found
    news/[slug]  services/[slug]  applications/[slug]
    electronics/        + servo, inverters, dnc, accessories, [slug]
    machine-building/   + [slug]
    */_components/      route-private UI (not importable as a route)
components/             shared UI (Header, Footer, SearchPanel, media/, products/)
data/                   *.json content + *.ts types that re-export it
lib/
  i18n/ data/ media/ search/ seo/ crm/ validation/   + use-*.ts client hooks
messages/{vi,en}/       15 UI-copy namespaces per locale
scripts/                build-time generators + one-off content tooling
public/                 images, PDF download library, generated search index
```

## Routing and locales

- Locales `["vi", "en"]`, default `vi`, `localePrefix: "always"` — every public
  URL carries a prefix (`/vi/…`, `/en/…`) and, because `trailingSlash: true`, a
  trailing slash. There is no `app/page.tsx`; Firebase 301s `/` to `/vi/`.
- A small inline script in the Vietnamese layout re-routes `/vi/` (and only
  `/vi/`) to `/en/` when the visitor previously chose English. It never sniffs
  `navigator.language`, so crawlers and first-time visitors stay put.
- Static UI copy lives in `messages/<locale>/<namespace>.json` and is read with
  next-intl. Only the namespaces listed in `lib/i18n/client-messages.ts` are
  serialised to the browser — the rest stay server-side, which cuts roughly 60%
  off the per-page message payload.

## Content model

Content is file-backed. `data/<entity>.json` holds the rows (authored in an
internal admin app and landed here as JSON); `data/<entity>.ts` holds the
TypeScript types and re-exports the JSON; `lib/data/<entity>.ts` resolves a row
to a locale-specific view the pages render.

| Entity | Rows today | Notes |
|---|---|---|
| `products` | 7 | CNC controllers (F and Astro series) |
| `catalog` | 11 | 2 DNC transfer units + 9 accessories |
| `series` | 4 | QS Servo drive/motor, Savch S600 / S3100 inverters |
| `machines` | 7 | milling, router, jewelry, automation |
| `news` | 15 | crawled from the legacy WordPress site, body is sanitized HTML |
| `applications` | 9 | machine-type case studies |
| `services` | 1 | retrofit; its copy lives in `messages/*/service.json` |
| `downloads` | 22 | local PDFs/ZIPs under `public/downloads/` |

Controllers, catalogue items and series deliberately do **not** share one
`Product` type: a controller is described by axis count, control protocol columns
and a machine kit; a DB9 cable has none of those; a drive series has no single
part number at all because the catalogue sells whole series. One merged type
would leave most fields empty on most rows.

**Bilingual convention:** Vietnamese is the primary field and English is a
sibling — `desc`/`descEn`, `title`/`titleEn`, `v`/`vEn`, `alt`/`altEn`. The view
layer falls back to the Vietnamese value when the English one is missing, so a
partially translated row still renders. Locale-neutral values (model codes,
ratings, dimensions) are stored once. A few manufacturer datasheet figures carry
baked-in text and therefore need a per-locale file (`src` / `srcEn`).

## Search

Entirely client-side. The build flattens every page-backed content type into
`public/search-index.<locale>.json`; the browser fetches it on first use and
runs Orama in-memory: BM25 over title / keywords / excerpt (boost 3 / 2 / 1),
plus an fzf-style fuzzy subsequence pass over titles and meta lines so a
compressed model query like `as10` reaches "Astro 10i". All indexed text and all
queries are diacritic-folded, so `dieu khien` matches `điều khiển`. A per-type
weight ranks pages above their paperwork (PDF records score ×0.6) so a model
query does not return twelve manuals ahead of the product page.

## Images

`scripts/generate-image-variants.ts` pre-renders a width ladder
(256 / 384 / 640 / 768 / 960) as `foo-<w>w.webp` beside each original, and writes
each source's intrinsic width to `lib/media/image-manifest.json`. A custom
`next/image` loader (`lib/media/image-loader.ts`) maps a requested srcset width
onto the smallest rung that fits, or returns the untouched original. Import
`@/components/media/image` instead of `next/image`: it drops the srcset entirely
for assets the ladder cannot help (logos, PNGs, remote posters) and gives
`priority` images a real `fetchpriority="high"`.

## Contact form

The one runtime dependency. `app/[locale]/contact/_components/contact-form.tsx`
validates with zod, then POSTs to `{NEXT_PUBLIC_CRM_API_BASE}/public/leads` —
unauthenticated, rate-limited 5 requests/minute/IP by the CRM. The client returns
a discriminated result (`ok`, `validation`, `rate_limit`, `server`, `network`) so
each outcome gets its own message. A honeypot field is dropped silently.

## Deployment

`yarn deploy:prod` builds and pushes `out/` to Firebase Hosting. Because a static
export ignores Next's `headers()` and `redirects()`, **both the security headers
and the entire 301 table live in `firebase.json`** — legacy unprefixed paths to
`/vi/…`, `/products/*` to `/electronics/*`, `/cnc/*` to `/machine-building/*`,
plus one renamed machine slug. Cache-Control is set there too
(`_next/static` immutable 1y, `/downloads/**` 1d, `/img/**` 7d).

More detail lives in `docs/`:

| Doc | Covers |
|---|---|
| `docs/codebase-summary.md` | file-by-file tour of the repo |
| `docs/system-architecture.md` | build pipeline, runtime path, diagrams |
| `docs/code-standards.md` | conventions actually followed in this repo |
| `docs/design-guidelines.md` | tokens, type scale, motion, component primitives |
| `docs/deployment-guide.md` | build, deploy, headers, redirects, rollback |
| `docs/project-overview-pdr.md` | product scope, requirements, acceptance criteria |
| `docs/project-roadmap.md` | verified gaps and suggested next steps |
