# Cook report — site-wide multi-language (extension)

Date: 2026-06-30 · Branch: main

## Scope
Extend i18n from the first 5 pages to the whole site. User decisions: translate everything visible · agent authors EN.

## Done (VI + EN, parity-checked)
Pages: about · news (list + article) · downloads (index) · contact (page chrome) · search panel · 403 · not-found · products/[slug] · applications/[slug] · services/[slug] (chrome + data) · news/[slug] (chrome + flagship body).
Shared components: Header (top strip + nav) · Footer · floating-contact · newsletter-form · news-feed · product-bundle-card.
OG images: applications/[slug], news/[slug] tag fallbacks now localized.

New namespaces: `about`, `errors`, `footer`, `search`. Extended: `product` (card/detailPage), `application` (index/detailPage), `service` (index/detailPage/**detailData**), `downloads` (index breadcrumb), `news` (feed/list/detailPage/article), `contact` (page), `common` (call/backToTop), `nav` (tagline).

## Notable
- **services data-layer fix:** `data/services.ts` (static "retrofit", VI-only) content moved into `service.detailData.retrofit` (vi+en). `services/[slug]` now reads localized content (falls back to the static module for any untranslated slug). EN visitors now get English service bodies.
- Server pages use `getTranslations({locale, namespace})` + `setRequestLocale`; client components use `useTranslations`. Arrays via `t.raw()`, merged with static asset/href/slug fields by index.

## Verification
- `tsc --noEmit`: exit 0
- `scripts/check-i18n-keys.ts`: PASS (all namespaces, vi/en parity)
- `yarn build`: run by user — passed
- VI sweep clean except intentional/owned (below)

## Intentionally left / owned elsewhere
- Root pre-locale VI defaults: `app/page.tsx` redirect text, `app/layout.tsx` default metadata, `app/opengraph-image.tsx` — root is the x-default = vi layer.
- `components/Footer.tsx` physical factory address — proper noun, identical both locales.
- `contact-form.tsx`, `inquiry-form.tsx`, `datasheet-request-form.tsx` — owned by parallel plan `260630-1102-site-interactive-functions`; their namespaces (`contact.form`, `downloads.request`, `downloads.inquiry`) already exist for that plan to wire.

## Unresolved questions
1. `seo.json` servicesTitle ("Custom Controller Development") still differs from the services page subject (manufacturing/retrofit) — confirm or update seo.json.
2. Forms wiring left to the parallel plan — confirm that ownership split is intended.
