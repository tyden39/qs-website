---
phase: 7
title: "SEO Complete"
status: pending
priority: P1
effort: "5d"
dependencies: [2]
execution: parallel
stream: E
---

# Phase 7: SEO Complete (Parallel Stream E)

## Overview

Hoàn thiện toàn bộ SEO surface: per-route metadata, dynamic sitemap multi-locale, robots, OG image động (Satori), JSON-LD typed, canonical, hreflang, semantic image alt. Target Lighthouse SEO ≥ 95.

**Parallel execution:** Chạy đồng thời với Phase 3, 4, 5, 6, 8, 9. **Reads** from public pages (Phase 2 already DB-backed) + adds metadata. Coordinates lightly với each entity stream on `generateMetadata` signature.

## File Ownership

- `app/sitemap.ts`
- `app/robots.ts`
- `app/opengraph-image.tsx` (default)
- `app/[locale]/products/[slug]/opengraph-image.tsx`
- `app/[locale]/news/[slug]/opengraph-image.tsx`
- `app/[locale]/applications/[slug]/opengraph-image.tsx`
- `lib/seo/*` (jsonld, alternates, og-image-template)
- `public/og-default.png`

**Adds (low conflict — only adds `generateMetadata` export + JSON-LD `<script>` to public page files; Phase 2 already created these page files with body content):**
- `generateMetadata` export in `app/[locale]/page.tsx`
- `generateMetadata` + JSON-LD `<script>` in `app/[locale]/products/[slug]/page.tsx`
- Same for news/[slug], applications/[slug], services/[slug], and list pages (BreadcrumbList JSON-LD)

**Coordination rule:** Phase 7 only **appends** to public page files (new export + JSON-LD render at bottom of component). Other streams don't edit public page files (Phase 6 only edits `_components/`). No conflict expected.

**Writes to (Updated Session 2 F11):**
- `messages/vi/seo.json` (Phase 2 created file; Phase 7 adds keys)

## Requirements

**Functional:**
- `metadataBase` config with production URL
- Every public route has `generateMetadata` with: title, description, OG (image, type), Twitter Card, canonical, alternates (vi/en/x-default)
- `app/sitemap.ts` reads Drizzle, generates URLs for all entities × 2 locales
- `app/robots.ts` allow public, disallow `/admin/`, `/api/`, `/account/`, `/login`
- `app/opengraph-image.tsx` (root) + per-detail OG image generation
- JSON-LD typed with `schema-dts`:
  - Root: Organization + WebSite + SearchAction
  - Product detail: Product
  - News detail: Article
  - Application detail: TechArticle hoặc Product
  - Services detail: Service + FAQPage
  - List pages: BreadcrumbList
- Hreflang `<link rel="alternate">` triple (vi/en/x-default)
- Semantic HTML: `<article>`, `<nav>`, `<main>`, proper heading hierarchy
- Image alt bilingual required (already enforced by Phase 3, 4, 5 Zod schemas — Phase 7 verifies)

**Non-functional:**
- Lighthouse SEO ≥ 95 trên home + product detail + news detail
- Google Rich Results Test pass
- No duplicate content warning

## Architecture

```
app/
├── layout.tsx                       Root metadataBase, default OG, Organization JSON-LD
├── sitemap.ts                       Multi-locale dynamic
├── robots.ts
├── opengraph-image.tsx              Default OG (1200x630)
└── [locale]/
    ├── layout.tsx                   Locale-specific metadata, WebSite + SearchAction JSON-LD
    ├── page.tsx                     Home: generateMetadata
    ├── products/
    │   ├── page.tsx                 BreadcrumbList
    │   └── [slug]/
    │       ├── page.tsx             Product JSON-LD + per-route metadata
    │       └── opengraph-image.tsx  Per-product OG with Satori
    ├── news/[slug]/
    │   ├── page.tsx                 Article JSON-LD
    │   └── opengraph-image.tsx
    ├── applications/[slug]/
    │   ├── page.tsx
    │   └── opengraph-image.tsx
    └── services/[slug]/page.tsx     Service + FAQPage JSON-LD

lib/seo/
├── jsonld.ts                       typed schema-dts builders
├── alternates.ts                   buildAlternates(path)
└── og-image-template.tsx           shared Satori template
```

**generateMetadata pattern (FROZEN):**
```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'product' });
  const product = await getProductBySlug(slug, locale);
  if (!product) return {};
  return {
    title: `${product.name} — ${t('siteTitle')}`,
    description: product.desc?.slice(0, 160),
    alternates: {
      canonical: `/products/${slug}`,
      languages: {
        vi: `/products/${slug}`,
        en: `/en/products/${slug}`,
        'x-default': `/products/${slug}`,
      },
    },
    openGraph: {
      title: product.name,
      description: product.desc,
      type: 'website',
      locale,
      url: `/products/${slug}`,
      images: [{ url: product.images?.[0]?.url ?? '/og-default.png', width: 1200, height: 630, alt: product.images?.[0]?.alt?.[locale] }],
    },
    twitter: { card: 'summary_large_image', title: product.name, description: product.desc },
  };
}
```

**JSON-LD pattern:**
```tsx
import type { Product, WithContext } from 'schema-dts';

function buildProductJsonLd(product, locale): WithContext<Product> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.desc,
    brand: { '@type': 'Brand', name: 'QS Technology' },
    image: product.images.map(i => i.url),
    sku: product.slug,
  };
}

<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProductJsonLd(product, locale)) }} />
```

## Related Code Files

**Create:**
- `app/sitemap.ts`
- `app/robots.ts`
- `app/opengraph-image.tsx` (default)
- `app/[locale]/products/[slug]/opengraph-image.tsx`
- `app/[locale]/news/[slug]/opengraph-image.tsx`
- `app/[locale]/applications/[slug]/opengraph-image.tsx`
- `lib/seo/jsonld.ts`
- `lib/seo/alternates.ts`
- `lib/seo/og-image-template.tsx`
- `public/og-default.png`

**Modify (append-only — add `generateMetadata` export + JSON-LD `<script>`):**
- `app/layout.tsx` — metadataBase, default Organization JSON-LD
- `app/[locale]/layout.tsx` — locale metadata, WebSite + SearchAction JSON-LD
- `app/[locale]/page.tsx` (home) — generateMetadata
- `app/[locale]/products/page.tsx` — BreadcrumbList JSON-LD
- `app/[locale]/products/[slug]/page.tsx` — generateMetadata + Product JSON-LD
- `app/[locale]/news/page.tsx` — BreadcrumbList
- `app/[locale]/news/[slug]/page.tsx` — generateMetadata + Article JSON-LD
- `app/[locale]/applications/page.tsx` — BreadcrumbList
- `app/[locale]/applications/[slug]/page.tsx` — generateMetadata + TechArticle JSON-LD
- `app/[locale]/services/page.tsx` — BreadcrumbList
- `app/[locale]/services/[slug]/page.tsx` — generateMetadata + Service + FAQPage JSON-LD
- `next.config.mjs` — `images.remotePatterns` cho `blob.vercel-storage.com` nếu chưa
- `messages/vi.json` → `seo.*` keys (siteName, siteDescription, defaultOgAlt)

**Dependencies:**
```bash
yarn add -D schema-dts@^2.0.0  # types-only — devDep is sufficient
```

## Implementation Steps

1. **metadataBase setup** (`app/layout.tsx`)
   - `metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://qstech.vn')`
   - Default title template, icons

2. **Alternates helper** (`lib/seo/alternates.ts`)
   - `buildAlternates(path)` returns `{ canonical, languages: { vi, en, 'x-default' } }`

3. **Sitemap** (`app/sitemap.ts`)
   - Read all entity slugs from DB
   - Generate entries × 2 locales với alternates
   - Include static pages (home, /about, /contact, /downloads, /search)

4. **Robots** (`app/robots.ts`)
   - Allow `/`, disallow `/admin/`, `/api/`, `/account/`, `/login`
   - Sitemap URL

5. **OG image Satori**
   - Default `app/opengraph-image.tsx`: brand logo + tagline
   - Per-detail (product, news, application): title + image + spec highlights
   - Use `ImageResponse` từ `next/og`
   - Load font Inter từ Google Fonts trong OG render

6. **JSON-LD builders** (`lib/seo/jsonld.ts`)
   - Typed functions per schema type: `buildOrganization()`, `buildWebSite()`, `buildProduct()`, `buildArticle()`, `buildTechArticle()`, `buildService()`, `buildFAQPage()`, `buildBreadcrumbList()`

7. **Per-route generateMetadata**
   - Apply pattern to all public routes
   - Home: brand metadata
   - List pages: title generic
   - Detail pages: title from DB entity, description from desc/excerpt, OG image from entity image

8. **Image alt bilingual verification**
   - Check Phase 3, 4, 5 Zod schemas have `alt: { vi: required, en: required }`
   - Backfill migration: `UPDATE products SET images = ... SET alt.en = alt.vi WHERE images[i].alt.en IS NULL`

9. **Hreflang sanity test**
   - View source check `<link rel="alternate">` correct
   - Test with hreflang.org/checker/

10. **Verify**
    - Lighthouse SEO ≥ 95 home / product detail / news detail
    - Google Rich Results Test for Product + Article + Organization → pass
    - Sitemap.xml loads, contains all URLs × 2 locales
    - Robots.txt loads, disallow correct
    - OG preview via opengraph.xyz

## Success Criteria

- [ ] metadataBase configured, every public route has generateMetadata
- [ ] sitemap.xml dynamic, multi-locale, includes all entity URLs
- [ ] robots.txt correct
- [ ] OG image: default + product + news + application
- [ ] JSON-LD: Organization, WebSite, Product, Article, BreadcrumbList, FAQPage
- [ ] schema-dts typed, no `any`
- [ ] Hreflang alternates correct vi/en/x-default
- [ ] Image alt bilingual enforced (backfilled)
- [ ] Lighthouse SEO ≥ 95 trên 3 representative pages
- [ ] Google Rich Results Test pass

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Sitemap quá lớn (> 50k URLs) | Hiện < 200 URLs × 2 locales. Khi cần → sitemap index |
| OG image Satori render slow | Vercel cache OG image qua CDN, 1 render per slug |
| schema-dts types phức tạp | Wrapper functions per type |
| Hreflang sai gây duplicate content | Test với hreflang.org/checker/ |
| Image alt EN backfill block existing data | Backfill SQL: alt.en = alt.vi |
| Canonical URL trỏ sai (locale prefix) | VI canonical = no prefix, EN = /en prefix |
| OG image Satori Vercel-only | OK — deploy Vercel, no portability issue MVP |
| Phase 4 changes news page DOM → Phase 7 metadata description wrong | Phase 7 reads `excerpt.vi` (stable field) — Phase 4 ensures excerpt populated |
| Conflict with other streams editing public pages | Other streams only edit `_components/` subdirs; Phase 7 only adds metadata + JSON-LD render → no overlap |

## Parallel Coordination Notes

- **Reads from Phase 2 outputs** (DB schemas, data access layer).
- **No dependency on Phase 3, 4, 5, 6 admin CRUD** — only reads public pages.
- **Coordinates lightly with Phase 6** on `app/[locale]/services/page.tsx` (Phase 6 mounts inquiry form, Phase 7 adds metadata). Different file regions → no merge conflict.
- **Phase 8 i18n** translates `seo.*` keys after Phase 7 stabilizes.
