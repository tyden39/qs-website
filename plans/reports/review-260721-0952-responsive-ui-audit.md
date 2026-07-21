# Responsive UI Audit — qs-website

Date: 2026-07-21 · Method: code review + live checks (dev server, agent-browser) at 360/768/1024/1440px across 15 pages (all list pages + product/cnc details, contact, search, downloads).

## Automated checks — PASSED

- **Horizontal overflow: none** on any page at 360/768/1024 (JS scrollWidth check, 15 pages × 3 widths).
- Viewport meta present (Next default `width=device-width, initial-scale=1`), zoom not disabled.
- Mobile drawer uses `max-h-[calc(100dvh-64px)]` + body scroll-lock; search panel top synced via JS.
- `.qs-btn` min-h 44px mobile; `.qs-icon-btn` bumps 36→44px under `pointer: coarse`; hero dots 44px hit area.
- Swipe rails (home/applications) use snap + `overscroll-x-contain`, collapse to grid at md — correct pattern.
- `prefers-reduced-motion` honored across all animations; reveal-on-scroll opts out on phones for swipe rails.

## Findings (ranked)

### 1. iOS auto-zoom: focusable controls < 16px font (MEDIUM, mobile UX)
iOS Safari zooms the page when a focused input/select/textarea has computed font-size < 16px; user must pinch back.
- `app/[locale]/contact/_components/contact-form.tsx:227` — `inputCls` uses `text-body sm:text-meta` → **15px** on phones (inputs, select, textarea).
- `app/[locale]/products/_components/product-category-tabs.tsx:55` — mobile category `<select>` `text-label` → **11px**.
- `app/[locale]/products/_components/product-list-filter.tsx:164,176,203` — 3 mobile selects `text-label` → **11px**.

Fix: ensure ≥16px below `sm` on these controls only (e.g. `text-[16px] sm:text-meta`). Do NOT add `maximum-scale=1` (a11y).

### 2. Touch targets < 44px without coarse-pointer bump (MEDIUM)
`.qs-icon-btn` already handles this; these don't:
- `components/locale-switcher.tsx:36` — VI/EN buttons **31×21px** (also rendered inside mobile drawer).
- `app/[locale]/news/_components/news-list-filter.tsx:161,168,175` — pagination **36×36px**.
- Breadcrumb links (`.qs-crumb`, 10–11px mono) ≈ 16px tall — low-value nav, but tap-hostile.

Fix: reuse the `@media (pointer: coarse)` min-height/width pattern or `min-h-11` on touch.

### 3. Lightbox sizes in `vh/vw` (LOW)
`components/media/image-lightbox.tsx:110,114` — `max-h-[70vh] max-w-[82vw]`. On iOS, `vh` ignores dynamic browser chrome → image/caption can sit under the toolbar. Prefer `dvh`; caption `text-label` (11px) is small for a phone.

### 4. `not-found.tsx` uses `100vh` (LOW)
`app/[locale]/not-found.tsx:14` — `min-height: calc(100vh - 380px)`; prefer `dvh` (cosmetic only, it's a min-height).

### 5. CNC machine detail very long on phones (INFO/UX)
`/vi/cnc/qsm-215/` at 360px ≈ 11,200px (~31 screens) — stacked spec key-values. Consider collapsing spec groups into accordions below `sm`, or an in-page jump nav.

### 6. Dead CSS (INFO)
`app/globals.css:474` — `.qs-hero-arrow` has no usages in app/components; removable.

## Non-issues verified
- Desktop body 15px is an intentional editorial choice (16px kept on touch viewports) — OK.
- Full-page screenshots show black gaps only because `qs-reveal` waits for scroll — artifact, not a bug.
- `qs-select` unlayered CSS + `color-scheme: light` — correct cross-browser select rendering.
- Contact checkboxes are 13px natives but the whole bordered label row (~40px) is the tap target — acceptable.

## Applied fixes (2026-07-21)

- **#1 iOS zoom — FIXED**: contact `inputCls` → `text-[16px] sm:text-meta`; 3 mobile-only selects → `text-[16px]`; sort select → `text-[16px] lg:text-label`. Verified live at 360px: all visible controls report `font-size: 16px`.
- **#2 touch targets — FIXED**: locale-switcher `pointer-coarse:min-h-11 pointer-coarse:min-w-11`; news pagination `pointer-coarse:w-11/h-11`; breadcrumb links get padding/negative-margin hit-area expansion under `@media (pointer: coarse)` in globals.css. Compiled CSS verified to contain all `pointer-coarse` rules.
- **#3 lightbox — FIXED**: `70vh` → `70dvh` (both branches). Caption size left as-is (design choice).
- **#4 not-found — FIXED**: `calc(100vh - 380px)` → `calc(100dvh - 380px)`.
- **#6 dead CSS — FIXED**: `.qs-hero-arrow` block removed from globals.css.
- **#5 (long CNC detail pages on phones) — NOT applied**: UX judgment call, left for product decision.

Verification: overflow re-check OK (360/768 on products/contact/news/home); `tsc --noEmit` clean; visual check of products toolbar at 360px — 16px select renders cleanly.

Known pre-existing issue: `yarn lint` fails — Next 16 removed `next lint`; script needs migrating to the ESLint CLI (out of scope here).

## Unresolved questions
- None blocking. Item 5 is a product/UX judgment call, not a defect.
