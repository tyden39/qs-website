---
phase: 3
title: "Products page filter chips, sort, category tree"
status: done
priority: P2
dependencies: [2]
---

# Phase 3: Products page filter, sort, category tree

## Overview
Make the products listing toolbar real: filter chips, sort `<select>`, and the sidebar category tree currently do nothing. The list is server-rendered from `getAllProducts`; add a client layer for filtering/sorting without breaking SSG.

## Requirements
- Functional: filter chips (Bộ SP tiêu chuẩn / F-series / Astro / Cảm ứng) narrow the visible products; sort `<select>` reorders (newest / axis / display); category tree filters or links to real targets; product count reflects the filtered total.
- Non-functional: stays static-export compatible; preserves card design + i18n.

## Architecture
- Keep `Products` server component fetching `getAllProducts(locale)`; pass the full list into a new client child (`products/_components/product-list-filter.tsx`) that owns chip/sort/category state and renders `ProductBundleCard`.
- Filtering by tags/series derived from product data (verify `lib/data/products.ts` has series/axis/display fields; if missing, add or map).
- Sort comparators for the 3 options. Filter state optionally in URL (`?series=&sort=`) for shareable/back-button.
- Category tree: decide per item — either filter the same list (if products carry machine-type/axis) or link to a real filtered URL. Replace all `href="#"`.

## Related Code Files
- Create: `app/[locale]/products/_components/product-list-filter.tsx` (client)
- Modify: `app/[locale]/products/page.tsx` (delegate toolbar + list to client child; fix breadcrumb `href="#"`)
- Reference: `lib/data/products.ts`, `components/products/product-bundle-card.tsx`
- Coordinate: `messages/*/product.json` (filter/sort/tree labels — multilang plan also edits this JSX)

## Implementation Steps
1. Inspect `lib/data/products.ts` for filterable fields (series, axis count, display size, tags). Add/normalize if absent.
2. Build client filter component; move chips, sort select, list render into it.
3. Implement chip filter (single-active, toggleable), sort comparators, live count.
4. Resolve category tree: filter or link; remove every `href="#"`. Fix breadcrumb link.
5. Keep empty state when a filter yields zero.

## Success Criteria
- [ ] Clicking a chip filters the list and updates the count.
- [ ] Sort select reorders the list.
- [ ] No `href="#"` remains on the products page.
- [ ] i18n labels intact for vi/en.

## Risk Assessment
- **Merge conflict** with `260630-1045-multilang-core-pages` (rewrites same toolbar JSX). Mitigation: land multilang first or do both in one edit pass; this plan is `blockedBy` it.
- Missing structured fields on products. Mitigation: extend data model in step 1 before wiring filters.
