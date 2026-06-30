---
phase: 4
title: "News category filtering + pagination"
status: done
priority: P2
dependencies: [2]
---

# Phase 4: News category filtering + pagination

## Overview
News category tabs are dead `href="#"` links and the grid has no working pagination. Make tabs filter the article grid and add real pagination.

## Requirements
- Functional: clicking a category tab filters the article grid to that category with an active-state indicator; pagination (or "load more") pages through articles; counts reflect reality.
- Non-functional: static-export compatible; preserves featured-article + grid layout and i18n.

## Architecture
- Move the tab + grid into a client child (`news/_components/news-list-filter.tsx`) fed by the full article list from `lib/data/news.ts`. Featured article can stay server-rendered above.
- Tab state filters by category; optional URL sync (`?cat=&page=`). Pagination slices (e.g., 9/page) or "load more".
- Replace hardcoded tab counts with derived counts.

## Related Code Files
- Create: `app/[locale]/news/_components/news-list-filter.tsx` (client)
- Modify: `app/[locale]/news/page.tsx` (delegate tabs+grid; remove `href="#"`)
- Reference: `lib/data/news.ts`
- Coordinate: `messages/*/news.json` (multilang plan touches this page too)

## Implementation Steps
1. Confirm `lib/data/news.ts` exposes category per article + full list.
2. Build client filter component (tabs + grid + pagination).
3. Wire tab filter with active state + live counts; remove all `href="#"`.
4. Implement pagination/load-more slicing.
5. Empty state per category when none.

## Success Criteria
- [ ] Tabs filter the grid; active tab highlighted; counts accurate.
- [ ] Pagination/load-more navigates the full set.
- [ ] No `href="#"` remains on the news page.
- [ ] vi/en labels intact.

## Risk Assessment
- Merge conflict with multilang plan (same page JSX). Mitigation: `blockedBy` it; land multilang first or combine.
- Category taxonomy mismatch between tabs and data. Mitigation: derive tabs from data categories, don't hardcode.
