---
phase: 2
title: "Static export + blockers"
status: pending
priority: P1
effort: "1d"
dependencies: [1]
---

# Phase 2: Static export + blockers

## Context Links

- [Brainstorm](../reports/260526-1614-brainstorm-vps-cloudflare-migration.md) §Static-export blockers
- Current configs: [next.config.mjs](../../next.config.mjs), [proxy.ts](../../proxy.ts), [lib/i18n/routing.ts](../../lib/i18n/routing.ts)
- OG images: `app/opengraph-image.tsx` + 3 under `app/[locale]/**/[slug]/`

## Overview

Flip the project to `output: "export"` and clear the four blockers that prevent
a clean static build: edge-runtime OG images, next-intl middleware, image
optimization, and dynamic-route `generateStaticParams`. Also flip locale URL
strategy to `always`-prefix (per user decision).

## Key Insights

1. **`output: "export"` is the load-bearing flip.** Once on, Next refuses to
   build anything that uses dynamic features. The blockers list IS the build
   error list — fix in order.
2. **Locale URLs flip to `always`.** Current `localePrefix: "as-needed"` makes
   `/products` (VI) work via middleware rewrite. Static export can't rewrite,
   so we move to `/vi/products` + `/en/products`. The SEO equity of the old
   un-prefixed URLs is preserved in Phase 3 via Cloudflare `_redirects` 301.
3. **`proxy.ts` (Next 16's middleware) is deleted, not muted.** Static export
   doesn't run it. Leaving the file would mislead future readers.
4. **OG images: pre-generate, don't run.** `runtime = "edge"` was a Vercel trick
   to render at request time. In static, we either generate PNGs at build
   (`generateStaticParams` + `ImageResponse`) or ship one static fallback PNG
   per route family. Simpler = static fallback for the root + per-slug pre-render
   for the entity OG cards.
5. **Applications `[slug]` needs explicit `generateStaticParams`.** Currently it
   resolves at request time. Without it, static export errors. Confirm news /
   products / services already export it (they do — verified via grep).

## Requirements

### Functional
- `next build` produces `out/` containing static HTML/CSS/JS for every locale +
  every entity slug.
- Root `/` resolves (static redirect or index page that redirects to `/vi/`).
- All public routes available at `/vi/...` and `/en/...`.
- OG images served as static PNGs for each prerendered route that defines one.
- `next/image` works (unoptimized or with a Cloudflare loader).
- Sitemap, robots, hreflang, JSON-LD intact.

### Non-functional
- Build wall-clock under 2 min on a clean checkout.
- No `unstable_*` / experimental APIs introduced.
- No client-side JS added that wasn't already shipped (export must not inflate
  bundle).

## Architecture

```
next.config.mjs
  output: "export"
  images: { unoptimized: true }
  trailingSlash: true                ← Cloudflare Pages serves /vi/products/ cleanly

lib/i18n/routing.ts
  localePrefix: "always"             ← was "as-needed"

app/[locale]/layout.tsx
  generateStaticParams: locales (already done)
  setRequestLocale (already done)

app/[locale]/{products,services,news,applications}/[slug]/page.tsx
  generateStaticParams: pull slugs via lib/data → static
  dynamicParams = false

app/page.tsx (new)
  Returns a minimal HTML page with <meta http-equiv="refresh" content="0;url=/vi/">
  (Cloudflare _redirects also covers this in Phase 3 — belt + suspenders.)

OG images:
  app/opengraph-image.tsx           → drop runtime=edge, prerender at build
  app/[locale]/<entity>/[slug]/opengraph-image.tsx → ditto, with generateImageMetadata
                                                       producing one PNG per slug
```

## Related Code Files

### Modify
- [next.config.mjs](../../next.config.mjs) — add `output: "export"`,
  `images.unoptimized: true`, `trailingSlash: true`; drop the `async headers()`
  block (CSP moves to `_headers` in Phase 3); drop `experimental.useCache`.
- [lib/i18n/routing.ts](../../lib/i18n/routing.ts) — `localePrefix: "always"`.
- [lib/i18n/request.ts](../../lib/i18n/request.ts) — leave as-is; works at build.
- [app/opengraph-image.tsx](../../app/opengraph-image.tsx) — remove
  `export const runtime = "edge"`; ensure `ImageResponse` works at build (or
  swap to a static `app/opengraph-image.png` if `ImageResponse` proves flaky).
- [app/[locale]/news/[slug]/opengraph-image.tsx](../../app/[locale]/news/[slug]/opengraph-image.tsx) — same.
- [app/[locale]/products/[slug]/opengraph-image.tsx](../../app/[locale]/products/[slug]/opengraph-image.tsx) — same.
- [app/[locale]/applications/[slug]/opengraph-image.tsx](../../app/[locale]/applications/[slug]/opengraph-image.tsx) — same.
- [app/[locale]/applications/[slug]/page.tsx](../../app/[locale]/applications/[slug]/page.tsx) — add
  `generateStaticParams` returning all slugs from `lib/data/applications`.
- [app/[locale]/products/[slug]/page.tsx](../../app/[locale]/products/[slug]/page.tsx) — verify
  `generateStaticParams` covers both locales.
- [app/[locale]/news/[slug]/page.tsx](../../app/[locale]/news/[slug]/page.tsx) — same verification.
- [app/[locale]/services/[slug]/page.tsx](../../app/[locale]/services/[slug]/page.tsx) — same verification.
- [app/sitemap.ts](../../app/sitemap.ts) — confirm it generates at build (no
  request-time deps). Sitemap should emit prefixed URLs (`/vi/...` + `/en/...`).
- [app/robots.ts](../../app/robots.ts) — confirm it generates at build.
- [lib/seo/alternates.ts](../../lib/seo/alternates.ts) (or wherever
  `buildAlternates` lives) — output `hreflang` against the new prefixed paths.

### Create
- [app/page.tsx](../../app/page.tsx) — minimal root page with meta-refresh to
  `/vi/`. Belt-and-suspenders for `_redirects`.

### Delete
- [proxy.ts](../../proxy.ts) — next-intl middleware no longer runs in static.

## Implementation Steps

1. **Flip routing prefix.**
   - Edit `lib/i18n/routing.ts`: `localePrefix: "always"`.
   - Update internal links if any are constructed as raw `/products` (most go
     through next-intl's `<Link>` from `lib/i18n/navigation` — those rewrite
     automatically; grep for raw `href="/products"` etc. and fix).

2. **Add `generateStaticParams` everywhere.**
   - For each `[slug]` route, ensure it exports something like:
     ```ts
     export const dynamicParams = false;
     export async function generateStaticParams() {
       const slugs = await getProductSlugs(); // mirror per entity
       return slugs.flatMap((slug) =>
         routing.locales.map((locale) => ({ locale, slug }))
       );
     }
     ```
   - **Applications page is the new one** — currently lacks it (brainstorm flag).

3. **OG images.**
   - For the root `app/opengraph-image.tsx`: remove `runtime = "edge"`.
   - For entity `[slug]/opengraph-image.tsx`: remove `runtime = "edge"`, add
     `generateImageMetadata` returning one entry per slug × locale. Verify
     `ImageResponse` builds at static time (if Next still requires a Node-only
     font fetch, host the font in `public/fonts/` and read locally).
   - Fallback option (if `ImageResponse` blocks the build): ship a static
     `app/opengraph-image.png` (1200×630) and remove the dynamic OG files. Note
     in PR which path was taken.

4. **Create root redirect.**
   - `app/page.tsx`:
     ```tsx
     export default function RootRedirect() {
       return null;
     }
     export const metadata = {
       robots: { index: false },
       other: { refresh: "0;url=/vi/" },
     };
     ```
     Or render `<meta http-equiv="refresh" .../>` inline. Cloudflare `_redirects`
     in Phase 3 is the primary path; this is fallback.

5. **Delete `proxy.ts`.** Static doesn't run it.

6. **Update `next.config.mjs`.**
   ```js
   const nextConfig = {
     output: "export",
     trailingSlash: true,
     reactStrictMode: true,
     images: { unoptimized: true },
   };
   ```
   - Remove `experimental.useCache`, `images.remotePatterns`, `async headers()`.

7. **Build.**
   - `yarn build` → must produce `out/` with directories for every locale + slug.
   - `npx serve out -p 4000` and click through every route family.
   - Verify `out/_next/static/...` assets are referenced with relative paths
     that work behind Cloudflare Pages (no `localhost` leakage).

8. **Sitemap + hreflang sanity.**
   - Open `out/sitemap.xml` — every URL must be prefixed (`/vi/...` or `/en/...`).
   - Spot-check a page HTML: `<link rel="alternate" hreflang="vi" href=".../vi/products/X/">`
     and `hreflang="x-default" href=".../vi/products/X/">`.

9. **Build size sanity.**
   - `du -sh out/` — should be modest (low MB for marketing site).
   - `find out -name "*.html" | wc -l` — sums to (locales × routes) + dynamic-slug count.

## Todo List

- [ ] Flip `localePrefix` to `always`; fix hard-coded internal hrefs
- [ ] Add `generateStaticParams` + `dynamicParams = false` to applications [slug]
- [ ] Verify generateStaticParams on products/news/services [slug] returns both locales
- [ ] Fix root + entity `opengraph-image.tsx` (remove edge runtime, prerender or static PNG fallback)
- [ ] Create `app/page.tsx` root redirect
- [ ] Delete `proxy.ts`
- [ ] Patch `next.config.mjs` (output export, trailingSlash, images.unoptimized)
- [ ] `yarn build` succeeds and emits `out/`
- [ ] `npx serve out` smoke test all routes VI + EN
- [ ] Inspect sitemap.xml prefixed URLs
- [ ] Verify hreflang on a sample page

## Success Criteria

- [ ] `yarn build` produces complete `out/` with zero warnings about dynamic features
- [ ] Routes generated: every `[locale]/...` × 2 locales, every entity `[slug]` × 2 locales
- [ ] Locally `npx serve out -p 4000` serves every page at `/vi/...` and `/en/...`
- [ ] `out/sitemap.xml` contains prefixed URLs only
- [ ] `out/robots.txt` present
- [ ] OG images emitted as PNG (or static fallback in place)
- [ ] No `proxy.ts` or admin/api routes in `out/`
- [ ] Build wall-clock < 2 min

## Risk Assessment

| Risk | Mitigation |
|---|---|
| `ImageResponse` requires runtime fetch at build → fails on Cloudflare Pages build env | Host fonts in `public/fonts/`; if still flaky, fall back to one static PNG per entity family |
| `generateStaticParams` returns empty (no slugs in `data/*.ts`) → entity routes missing | Build assertion: log slug counts; fail loudly if any entity returns 0 |
| Hard-coded `/products` links in JSX bypass next-intl `<Link>` → broken nav in EN | Grep `href="/(?:products|news|services|applications|downloads)"` and route through `<Link>` |
| Sitemap emits old un-prefixed URLs | Inspect XML; fix by reading from `routing.locales` and concatenating prefix |
| `trailingSlash: true` mismatches existing canonical URLs | Acceptable for static; redirect rules in Phase 3 will handle non-trailing |

## Security Considerations

- CSP moves out of `next.config.mjs` headers and into a Cloudflare `_headers`
  file (Phase 3). The build itself doesn't enforce CSP — verify after Phase 3
  preview deploy.
- No client-side env leakage: `NEXT_PUBLIC_*` vars only.

## Next Steps

→ Phase 3: deploy `out/` to a Cloudflare Pages preview and validate end-to-end
on real edge infrastructure.
