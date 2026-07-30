# Codebase summary

A tour of `qs-shop` — the QS Technology bilingual marketing and catalogue site.
Written against the repository as it stands; every path and name below exists in
the tree.

## Shape at a glance

| Area | Files | Lines (source) | What lives there |
|---|---:|---:|---|
| `app/` | 59 | ~12,400 | routes, layouts, route-private UI, SEO route handlers |
| `components/` | 24 | ~3,650 | shared UI reused across routes |
| `lib/` | 37 | ~3,330 | i18n, data views, media, search, SEO, CRM, client hooks |
| `data/` | 17 | ~16,400 | content JSON + its TypeScript types (mostly JSON) |
| `messages/` | 30 | ~4,330 | 15 UI-copy namespaces × 2 locales |
| `scripts/` | 9 | ~1,000 | build generators + one-off content tooling |
| `public/` | 2,120 | — | 454 source WebP images + 1,587 generated variants, 75 download files, generated search index |

Stack: Next.js 16.2 · React 19.2 · TypeScript 6 (strict) · Tailwind CSS v4 ·
next-intl 4.12 · Orama 3.1 · react-hook-form + zod 4 · sharp · schema-dts ·
isomorphic-dompurify · lucide-react. Node 20 (`.nvmrc`), yarn 1.22.

The whole site is `output: "export"` — a directory of HTML. No server, no
database, no API route.

---

## `app/` — routes

### Root level (outside the locale tree)

| File | Role |
|---|---|
| `layout.tsx` | Pass-through. Renders `children` only, no `<html>`. Exists because Next requires a root layout and because `app/not-found.tsx` needs a parent that leaves the document to it. Sets `metadataBase` so routes outside the locale tree still resolve relative OG image paths. |
| `not-found.tsx` | Owns its own `<html>`/`<body>`. The export writes it to `out/404.html`, which Firebase serves for every unmatched URL in both locales. Vietnamese is prerendered; an inline parse-time script swaps in English when the path is under `/en/` or the visitor's stored/browser language is English. |
| `sitemap.ts` | Two `<url>` entries per page (vi + en), each with the full vi/en/x-default alternate set. `lastModified` is emitted only for news, where a real date exists — stamping build time everywhere would teach crawlers to distrust the field. `/search` is deliberately absent because it is noindex. |
| `robots.ts` | Allows `/`, disallows `/admin/`, `/api/`, `/account/`, `/login`; points at `${APP_URL}/sitemap.xml`. |
| `opengraph-image.tsx` | Default 1200×630 OG card, rendered with `next/og` from `lib/seo/og-image-template.tsx`. |
| `globals.css` | Tailwind v4 `@theme` tokens plus the whole `qs-*` component/utility layer. |

There is **no `app/page.tsx`.** The unprefixed root is a 301 to `/vi/` issued by
Firebase.

### `app/[locale]/`

`layout.tsx` is the real document. It loads one font family (Inter, latin +
vietnamese subsets), sets `<html lang>`, renders `Header` / `SearchPanel` /
`Footer` / `FloatingContact`, emits Organization + WebSite JSON-LD, and wraps
everything in `NextIntlClientProvider` fed by `pickClientMessages()` rather than
the full catalogue. It also injects two tiny parse-time scripts: one that
re-routes `/vi/` to `/en/` for a visitor with a saved English choice, and one
scroll-reveal failsafe that un-hides content if no `Reveal` component has claimed
hydration within four seconds.

| Route | Notes |
|---|---|
| `page.tsx` | Home: hero slider, marquee, application deck, video reel, news feed. |
| `about/`, `contact/`, `downloads/`, `search/` | Single pages; `contact` and `downloads` and `search` each carry `_components/`. |
| `news/`, `news/[slug]/` | Article list + detail; detail has its own `opengraph-image.tsx`. |
| `services/`, `services/[slug]/` | Service list + detail. |
| `applications/`, `applications/[slug]/` | Case studies; detail has its own OG image route. |
| `electronics/` | Catalogue hub, plus static list pages `servo/`, `inverters/`, `dnc/`, `accessories/`, plus `[slug]/` for every product, catalogue item and series. Detail has its own OG image route. |
| `machine-building/`, `machine-building/[slug]/` | Machine catalogue and datasheets. |
| `403/`, `not-found.tsx` | Both `noindex, nofollow`. The locale `not-found` is only reached via an explicit `notFound()` call inside the locale tree — unmatched URLs get the root 404 document instead. |

`electronics/[slug]/page.tsx` is a three-way dispatcher: it tries the catalogue
row, then the series row, then the controller row, and renders whichever
template matches. That is why one dynamic segment serves three quite different
detail layouts.

### Route-private `_components/`

Directories prefixed with `_` are not routable, so route-local UI can sit beside
the page that owns it.

| Directory | Contents |
|---|---|
| `electronics/_components/` | 17 files — the largest template family. `category-page.tsx` (shared list-page shell + the `PRODUCT_GROUPS` map), `product-category-tree.tsx`, `product-list-filter.tsx`, `sortable-card-list.tsx`, `catalog-list.tsx` / `catalog-detail.tsx`, `series-list.tsx` / `series-detail.tsx` and its parts (`series-model-table`, `series-figures`, `series-naming-code`, `series-spec-sheet`), `product-detail-tabs.tsx`, `product-hero-gallery.tsx`, `hero-spec-strip.tsx`, `product-video.tsx`, `controller-soon-panel.tsx`. |
| `machine-building/_components/` | `machine-datasheet.tsx` (dark CNC datasheet template), `line-machine-detail.tsx` (light "line station" template for automation/inspection), `machine-hero-gallery.tsx`, `workpiece-compare.tsx`. |
| `contact/_components/` | `contact-form.tsx` — the only outbound POST on the site. |
| `downloads/_components/` | `downloads-tree.tsx` — three-level filter tree (family → product → document group). |
| `news/_components/` | `news-list-filter.tsx`. |
| `search/_components/` | `search-results.tsx` — the full results page, paginated client-side. |

---

## `components/` — shared UI

`Header.tsx`, `Footer.tsx`, `SearchPanel.tsx` are PascalCase; everything added
since is kebab-case (see the code standards doc for the honest note on that).

| File | Role |
|---|---|
| `Header.tsx` | Sticky nav, desktop flyouts and mobile drawer. Catalogue leaves deep-link into a list page's filter tree via `?g=<group>&t=<type>`; a same-page click filters in place instead of navigating. |
| `Footer.tsx` | Industrial "datasheet" footer — masthead, three column groups, social/contact tiles. Most of its styling lives in `globals.css` under `.qs-foot*`. |
| `SearchPanel.tsx` | Header autocomplete. Builds the Orama engine lazily on first keystroke, per locale; shows featured products until the visitor types. |
| `media/image.tsx` | The `next/image` wrapper every component imports. |
| `media/image-lightbox.tsx` | Context provider + trigger for the zoom/pan lightbox. |
| `products/` | `catalog-product-card`, `series-card`, `machine-card`, `product-bundle-card`, `kit-component-icon`. |
| `hero-slider`, `video-reel`, `app-deck`, `news-feed`, `marquee` | Home-page blocks. |
| `reveal.tsx` | Scroll-reveal wrapper; marks the document hydrated so the layout's failsafe stands down. |
| `circuit-traces`, `count-badge`, `category-icon`, `rail-nudge`, `floating-contact`, `locale-switcher`, `contact-cta`, `not-found-content` | Small shared pieces. |

30 files in `app/` + `components/` + `lib/` begin with `"use client"`. Everything
else is a server component.

---

## `lib/`

### `lib/i18n/`
`config.ts` (locales + default), `routing.ts` (`defineRouting`, `localePrefix:
"always"`), `request.ts` (loads every `messages/<locale>/*.json` as a namespace —
one file per namespace so parallel work does not collide on a monolithic blob),
`navigation.ts` (locale-aware `Link`, `usePathname`, `useRouter`),
`client-messages.ts` (`CLIENT_MESSAGE_PATHS` + `pickClientMessages`). The last
one exists because the provider serialises whatever it is handed into every
page's flight payload; `application.detailPage` alone is 30 KB that no client
component can reach. A listed path that resolves to nothing throws at build time
rather than shipping a page whose client components render raw key paths.

### `lib/data/`
One module per entity — `products`, `catalog`, `series`, `machines`, `news`,
`applications`, `services`, `downloads`, plus `machine-datasheet.ts` (derives the
CNC datasheet's spec groups, performance strip and envelope readout from the
machine's own `specs` array rather than duplicating them as content). Each module
exports `get…BySlug(slug, locale)`, `get…Slugs()` and often `getAll…(locale)`,
returning a `…View` type with every localizable field already resolved to one
string. Pages never touch `data/` directly.

`lib/data/products.ts` additionally carries small Vietnamese→English lookup maps
for the repeating catalogue vocabulary (bundle labels, spec section titles, spec
labels, alt-text patterns) so that formulaic strings need not be duplicated per
model, while genuine prose is authored per product as `overviewEn` / `descEn`.

### `lib/media/`
`image-variants.ts` (the `VARIANT_WIDTHS` ladder and the `-<w>w.webp` naming),
`image-loader.ts` (the custom loader), `image-manifest.json` (src → intrinsic
width, the only committed generator output), `image-optimizable.ts` (decides when
the ladder can actually serve more than one file), `image-size.ts` (reads
WebP/PNG/JPEG headers at build time), `article-images.ts`.

### `lib/search/`
`types.ts` (the `SearchRecord` shape shared by builder, engine and both UI
surfaces) and `engine.ts` (Orama index build, diacritic folding, the fuzzy
subsequence matcher, the blended ranker).

### `lib/seo/`
`app-url.ts` (`APP_URL` + `localeUrl()` — every absolute URL the site emits goes
through it so canonicals, hreflang, sitemap and JSON-LD agree byte for byte),
`alternates.ts` (self-referencing canonical per locale, x-default → Vietnamese),
`jsonld.tsx` (schema-dts builders for Organization, WebSite, Product, Article,
Service, BreadcrumbList), `og-image-template.tsx`, `text.ts` (SERP-budget
truncation on a word boundary, with a separate longer budget for social cards
because they wrap onto two lines and carry no brand suffix).

### `lib/crm/` and `lib/validation/`
`leads-client.ts` POSTs the lead; `crm-lead-schema.ts` holds the zod payload
schema and the two code enums the CRM accepts (`CRM_SERVICE_CODES`,
`CRM_BUSINESS_GROUP_CODES`). The CRM stores codes only — the display labels are
this site's i18n.

### Client hooks and helpers
`use-filter-params.ts` (URL-mirrored filter state in a module-level store, read
with `useSyncExternalStore`; deliberately *not* `useSearchParams`, which would opt
the catalogue out of static rendering and hand crawlers an empty shell),
`filter-prepaint.tsx` (a blocking parse-time script that hides non-matching cards
before first paint so a shared filter URL does not flash the unfiltered list),
`use-swipe`, `use-zoom-pan`, `use-reduced-motion`, `use-user-engaged`,
`scroll-to-list`, `youtube-poster`.

---

## `data/` — content

`data/<entity>.json` holds rows; `data/<entity>.ts` holds the types and
re-exports the JSON with a cast. The JSON is authored in an internal admin app
and lands here as a file — that is stated in the header comment of every one of
these modules.

| Entity | Rows | Largest fields / notes |
|---|---:|---|
| `products` | 7 controllers (`f54`, `f86`, `f10t`, `astro-10s`, `astro-6ah`, `astro-6av`, `astro-10i`) | protocol spec sheet, machine kit, photo gallery, hero triptych (front/rear/on-machine, keyed by slug in `hero-triptych.json`) |
| `catalog` | 11 (2 DNC, 9 accessories) | flat spec list, feature walkthrough, optional overview prose |
| `series` | 4 (`sdv3`, `sch-motor`, `s600`, `s3100`) | 320 KB — re-authored bilingual datasheet blocks, model tables, naming decode, per-series document library |
| `machines` | 7 (5 CNC, 2 automation) | spec rows keyed to i18n labels, features, use cases, capabilities, line-station steps |
| `news` | 15 | sanitized HTML bodies, both languages |
| `applications` | 9 | machine name, summary, suited controller slugs, optional YouTube clip |
| `services` | 1 (`retrofit`) | the detail copy actually rendered lives in `messages/*/service.json` under `detailData` |
| `downloads` | 22 | language-neutral rows; display titles composed in the UI from `model` + a localized doc-type label |

Three separate product-ish types exist on purpose. A controller has axes, a
display size, protocol columns and a kit. A DB9 cable or a 12 V adapter has none
of those. A drive series has no single part number at all, because the catalogue
sells whole series (SDV3, S600) rather than individual part numbers — so a series
carries a positioning line plus series-wide specs, and its per-model breakdown
lives in datasheet blocks. Merging them would leave most fields empty on most
rows.

Inside `series`, deeply nested strings use a `{ vi, en }` pair rather than
parallel `*En` fields, because at that nesting depth parallel fields read far
worse; the view layer collapses each pair to the active locale.

---

## `messages/`

15 namespaces per locale: `about`, `application`, `cnc`, `common`, `contact`,
`downloads`, `errors`, `footer`, `home`, `nav`, `news`, `product`, `search`,
`seo`, `service`. `yarn i18n:check` compares the flattened key sets and exits
non-zero on any difference — it currently passes, with `product` (213 keys),
`application` and `cnc` (171 each) the largest.

Copy that a visitor reads but that is not per-row content lives here rather than
in `data/`: download document-type labels, machine spec labels, application
detail-page structure, and the whole `service.detailData.retrofit` block.

---

## `scripts/`

| Script | Run by | Does |
|---|---|---|
| `build-search-index.ts` | `predev` / `prebuild` / `yarn search:index` | Flattens every page-backed content type into `public/search-index.<locale>.json`. Runs outside next-intl, so it reads `messages/<locale>/*.json` directly for labels. Indexes only text visible on the destination page. |
| `generate-image-variants.ts` | `predev` / `prebuild` / `yarn img:variants` | Walks `public/`, re-encodes each non-variant `.webp` at every ladder width smaller than the original (quality 82, concurrency 8, skips up-to-date files), writes `lib/media/image-manifest.json`. |
| `check-i18n-keys.ts` | `yarn i18n:check` | Flattens both locales' namespaces and reports missing/extra keys. |
| `crawl-series-detail-tabs.mjs` | manual | One-off crawler for manufacturer series content. |
| `img-i18n/*.py` | manual | Image-localization tooling (OCR, glossary, render) for datasheet figures with baked-in text. Uses its own Python environment; not part of the Node build. |

---

## Configuration

| File | Key points |
|---|---|
| `next.config.mjs` | `output: "export"`, `trailingSlash: true`, `reactStrictMode`, custom image loader, `deviceSizes [640,768,960,1400]` / `imageSizes [256,384]` mirroring the variant ladder so srcset carries no dead rungs, `remotePatterns` allowing `i.ytimg.com` for YouTube posters. Wrapped in `createNextIntlPlugin("./lib/i18n/request.ts")`. |
| `tsconfig.json` | `strict`, `target ES2022`, `moduleResolution: "bundler"`, `resolveJsonModule`, `@/*` → repo root. |
| `eslint.config.mjs` | Flat config; spreads `eslint-config-next` (Next 16 dropped `next lint`) and adds ignores for `out/`, `.next/`, `public/`, `next-env.d.ts`. |
| `postcss.config.mjs` | `@tailwindcss/postcss` only — Tailwind v4 is configured in CSS, not JS. |
| `firebase.json` | Serves `out/`, `trailingSlash: true`, `cleanUrls: false`, the full 301 table, security headers and Cache-Control. |
| `.firebaserc` | Default project `qstcnc-6207d`. |
| `.gitignore` | Ignores `out/`, `.next/`, the generated search index, generated `-<w>w.webp` variants, source photo/PDF folders, and tooling scratch dirs. Keeps `public/downloads/**/*.pdf` tracked despite the blanket `*.pdf` rule. |

`public/_headers` and `public/_redirects` are leftovers from an earlier
Cloudflare Pages deployment. They are still tracked, but `firebase.json` lists
both in its `ignore` array, so nothing serves them and their contents no longer
describe live behaviour.

---

## Where things happen

| Question | Answer |
|---|---|
| Where does a URL get its locale? | `app/[locale]/layout.tsx` via `setRequestLocale`; `lib/i18n/routing.ts` defines the prefix policy. |
| Where is a product page's HTML decided? | `app/[locale]/electronics/[slug]/page.tsx` picks catalogue vs series vs controller, then delegates to the matching template in `_components/`. |
| Where is search ranked? | `lib/search/engine.ts`, in the browser. |
| Where do responsive images come from? | `scripts/generate-image-variants.ts` at build; `lib/media/image-loader.ts` at render. |
| Where do canonical URLs come from? | `lib/seo/app-url.ts` (`NEXT_PUBLIC_APP_URL`), consumed by `alternates.ts`, `sitemap.ts` and `jsonld.tsx`. |
| Where do redirects and security headers live? | `firebase.json` — a static export ignores Next's `headers()` / `redirects()`. |
| Where does the contact form send data? | `lib/crm/leads-client.ts` → `{NEXT_PUBLIC_CRM_API_BASE}/public/leads`. |
