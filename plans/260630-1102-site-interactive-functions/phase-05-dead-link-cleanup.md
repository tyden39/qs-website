---
phase: 5
title: "Dead link cleanup"
status: done
priority: P3
dependencies: []
---

# Phase 5: Dead link cleanup

## Overview
Wire or remove every remaining `href="#"` placeholder outside the search/products/news flows. Independent of other phases.

## Requirements
- Functional: each placeholder link resolves to a real destination (route, `tel:`/`mailto:`/maps, external share intent, or in-page anchor) or is removed if there's no target.
- Non-functional: external links get `rel="noopener"`/`target="_blank"`; CSP in `public/_headers` updated if share intents need new origins (usually none — share URLs are top-level navigations).

## Inventory (verified)
- `app/[locale]/contact/page.tsx:61` channel cards → `tel:` / `mailto:` / Google Maps per channel type.
- `app/[locale]/contact/page.tsx:115` "Đặt lịch thăm quan" → contact form anchor or booking target (confirm).
- `app/[locale]/downloads/page.tsx:120` "Xem tất cả" → `/downloads/datasheets` or remove.
- `app/[locale]/downloads/page.tsx:136` "Tải ↓" → **SKIP for now** (no real PDF files yet — user deferred). Leave as-is or disable visually; do not fake a download.
- `app/[locale]/downloads/page.tsx:154` "Đăng nhập" → real auth route or remove (no auth exists; likely remove/disable).
- `app/[locale]/news/[slug]/page.tsx:150` FB/TW/LI share → share intent URLs with encoded article URL+title.
- `app/[locale]/page.tsx:277` showreel "YouTube" → real QS YouTube channel URL.

## Related Code Files
- Modify: `app/[locale]/contact/page.tsx`, `app/[locale]/downloads/page.tsx`, `app/[locale]/news/[slug]/page.tsx`, `app/[locale]/page.tsx`
- Reference: `public/_headers` (CSP)

## Implementation Steps
1. Contact channel cards: map each `channel` to its real `href` (phone/email/map) instead of `#`.
2. Build share-intent hrefs in news detail (FB sharer, Twitter/X intent, LinkedIn share) using the canonical article URL.
3. Showreel link → confirmed YouTube channel URL (needs the URL — open question).
4. Downloads: point "Xem tất cả" to datasheets; "Tải"/"Đăng nhập" resolved per open questions (real file / gated / removed).
5. Grep to confirm zero `href="#"` remain repo-wide after phases 2–5.

## Success Criteria
- [ ] `grep -rn 'href="#"' app components` returns nothing **except** the deferred downloads "Tải ↓" links (no PDFs yet).
- [ ] External links have `rel="noopener"` + `target="_blank"`.
- [ ] Share buttons open correct prefilled share dialogs.

## Risk Assessment
- Some targets need real data (YouTube URL, whether download files exist). Mitigation: resolve open questions before wiring those specific links; remove rather than fake.
