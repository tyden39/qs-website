# /products — Group Landing + Category List Pages

Status: done (2026-07-22) — tsc, eslint, i18n:check, `next build` all pass; all 12 locale
routes prerender. Remaining: real renders for servo/inverter series (cards show the
dashed updating frame until then).

User request supersedes the flat 6-tab IA (plans/260722-0903-…/products-ia-ui-design.md):
`/products` becomes a **group landing** showing 6 groups — Máy móc · Bộ điều khiển · Servo ·
Biến tần · Thiết bị truyền DNC · Phụ kiện. Clicking a group opens its own **list page** with a
back button to /products.

## Routes

```
/products                → group landing (hero kept, tabs → 6 group cards)
/products/machines       → MachineList            (detail → /cnc/[slug], unchanged)
/products/controllers    → ProductListFilter      (detail → /products/[slug])
/products/servo          → SeriesList (QS Servo: SDV3, SDA2 + composition strip)
/products/inverters      → SeriesList (Savch: S600/E, S3100A/E, Penta, UHS BLDC)
/products/dnc            → CatalogList("dnc")
/products/accessories    → CatalogList("accessory")
/products/[slug]         → unchanged (static segments win over dynamic)
```

No slug collisions (checked products.json + catalog.json).

## Work items

1. `data/series.json` + `data/series.ts` + `lib/data/series.ts` — servo/inverter series
   (facts from plans/260722-0903-…/product-data-notes.md; vi+en spec arrays; image optional).
2. `components/products/series-card.tsx` — series card per locked card grammar
   (omit unknown cells, quote CTA → /contact, dashed-gold placeholder when no render).
3. `_components/category-page.tsx` — group registry (id/segment/seo keys) + `CategoryShell`
   (breadcrumb JSON-LD + back link + H1 + count) + shared `generateMetadata` builder.
4. `_components/series-list.tsx` — two-col shell mirroring CatalogList (blurb rail + support).
5. Six thin `page.tsx` route files.
6. Landing `page.tsx` — replace `ProductCategoryTabs` with static group grid; delete
   `product-category-tabs.tsx`.
7. i18n — product.json `tabs` → `groups` (6 entries), `seriesCard` strings, back/viewList;
   seo.json per-category title/description (vi+en parity).
8. `app/sitemap.ts` — add 6 category paths.
9. Detail breadcrumbs (`[slug]/page.tsx`, catalog-detail) — category crumb points to the
   category list page.

## Acceptance

- All 6 groups reachable from /products; each list page has back → /products.
- Servo/inverter cards show series-level facts only, no dead links, no phantom counts.
- `tsc --noEmit`, lint, vi/en i18n parity pass.
