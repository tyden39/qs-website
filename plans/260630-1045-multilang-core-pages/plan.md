# Multi-language for core pages (home, products, applications, services, datasheets)

Status: done (pending user `yarn build` — command hook-blocked for the agent)
Branch: main
blocks: [260630-1102-site-interactive-functions]  # that plan's products/news filter phases edit the same toolbar JSX — land this first

## Goal
Wire hardcoded VI text on 5 server pages into next-intl namespaces with full VI+EN.
Decisions (user-confirmed): translate everything visible · I author EN · metadata reuses `seo.json` · datasheets heading also translated.

## Approach
- Server pages call `getTranslations({ locale, namespace })`; pull text-only via `t()` / `t.raw()` for arrays. Keep asset/href/slug fields static in page, merge by index.
- Client child components on home (`app-deck`, `video-reel`, `hero-slider`) use `useTranslations("home")` for their few internal labels (provider already passes all messages).
- `generateMetadata` switches to `seo.json` keys; delete per-page `titles`/`descs` objects.
- Keep en/vi key parity (CI `scripts/check-i18n-keys.ts`).

## Namespaces
- new `home.json` — hero slides, products/applications/about/showreel/cta/news sections + child-component labels.
- extend `product.json` `.page` — hero, breadcrumb, sidebar tree, toolbar/filters/sort.
- extend `application.json` `.page` — hero, catalog grid, machine names, pagination.
- extend `service.json` `.page` — hero, fabrication/upgrade/form sections, frame labels, shared lorem.
- extend `downloads.json` — add `datasheets.breadcrumb`; consume existing datasheets keys; convert static metadata → `generateMetadata`.

## Phases
1. home.json (vi+en) + app/[locale]/page.tsx + app-deck/video-reel/hero-slider labels
2. product.json page keys + products/page.tsx
3. application.json page keys + applications/page.tsx
4. service.json page keys + services/page.tsx
5. downloads.json breadcrumb + datasheets/page.tsx (metadata + body)
6. Verify: `tsx scripts/check-i18n-keys.ts`, `next build`/typecheck, code-review

## Acceptance
- Visiting `/en/*` shows English; `/vi/*` shows Vietnamese on all 5 pages.
- No hardcoded VI display strings remain on the 5 pages (asset alts where reasonable).
- i18n key check passes; build/typecheck clean; no regression to Header/other pages.
