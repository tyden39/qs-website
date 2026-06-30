# Cook report — multi-language for core pages

Date: 2026-06-30 · Branch: main · Mode: interactive

## Scope (user-confirmed)
Wire hardcoded VI text → next-intl (VI+EN) on: home, products, applications, services, datasheets.
Decisions: translate everything visible · agent authored EN · metadata reuses `seo.json` · datasheets heading also translated.

## Changes
Messages (VI+EN parity kept, `scripts/check-i18n-keys.ts` PASS):
- new `messages/{vi,en}/home.json` (43 keys): hero slides+CTAs, products/applications/about/showreel/cta/news sections, child-component labels.
- `product.json` +`page.*`: breadcrumb, hero, sidebar tree/axes/support, toolbar/filters/sort.
- `application.json` +`index.*`: breadcrumb, hero, catalog grid, 7 machine names, more/detail labels.
- `service.json` +`index.*`: breadcrumb, hero, fabrication/upgrade/form sections, frame labels, shared lorem, specs.
- `downloads.json` +`datasheets.breadcrumb` (consumed pre-existing datasheets keys).

Pages (server components → `getTranslations({locale, namespace})`, `setRequestLocale` added):
- `app/[locale]/page.tsx` — text-only arrays merged with static asset/href arrays by index via `t.raw()`.
- `app/[locale]/products/page.tsx`, `applications/page.tsx`, `services/page.tsx` — removed local `titles`/`descs`, metadata now from `seo.json`.
- `app/[locale]/downloads/datasheets/page.tsx` — static `metadata` → `generateMetadata` (downloads.meta.datasheetsTitle); body consumes `downloads.datasheets.*`.

Client child components (home only) → `useTranslations`:
- `hero-slider.tsx` (`home`): img-alt prefix, region aria, per-slide CTAs.
- `app-deck.tsx` (`home.applications.deck`): label, view-detail, view-all, aria.
- `video-reel.tsx` (`home.showreel`): now-playing, video, playlist, close, play aria.

## Verification
- `tsc --noEmit`: exit 0.
- i18n key parity: PASS (all namespaces).
- Custom path checker: all referenced dotted paths resolve in both locales w/ correct array lengths.
- VI sweep: no rendered Vietnamese left in the 5 pages + 3 components (only dev comments remain).
- `yarn build` NOT run — blocked for agent by `scout-block` hook (pattern `build`). User must run.

## Unresolved questions
1. `seo.json` `servicesTitle`/`servicesDescription` = "Custom Controller Development / PCB design…", which differs from the services page's actual subject (machine manufacturing & upgrade). Per the "reuse seo.json" decision the page `<title>` now reflects the seo.json wording — confirm that's intended, or update seo.json services keys to match the page.
2. Datasheets toolbar count is now plain text (`Showing N documents`) — the bold styling on the number was dropped for an ICU `{count}` message. Acceptable? Can restore with `t.rich` if the bold matters.
3. Two ticker phrases on home ("Motion Controller / Made By Vietnam / QS Technology") left untranslated (brand/English by design).
