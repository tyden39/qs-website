# Project Overview · PDR

## Product

**QS Technology Corporate Website** — a Vietnamese-language marketing site for QS Technology Co., Ltd., a manufacturer of CNC controllers, servo drives and automation boards based in Bình Dương, Vietnam.

The site is a brochure-style web property: it presents the company's product catalogue, applications, services and editorial content. There is no checkout, no user accounts, no backend services. Lead capture happens through static HTML forms and `tel:` / `mailto:` links — backend wiring is deferred.

## Goals

1. **Catalogue presentation** — give Vietnamese OEMs and machine builders a clear view of QS's six controller models (F-series + Astro-series).
2. **Lead capture** — funnel quote requests, custom-engineering inquiries and field-service tickets to QS sales/support inboxes.
3. **Authority signals** — surface plant capacity, deployment counts, ISO certification and timelines that establish QS as a credible domestic alternative to imported controllers.
4. **Content distribution** — host announcements (new models, firmware releases, customer wins) and downloadable technical assets (datasheets, manuals, firmware binaries).

## Audience

- **Primary**: Vietnamese SME machine builders / system integrators evaluating CNC controllers for milling, bending, gluing, woodworking, jewellery and food-processing machines.
- **Secondary**: Existing QS customers needing datasheets, firmware updates or support contacts.
- **Tertiary**: International OEM partners scoping out custom-engineering capacity (8-week PCB-to-deployment service).

Site language is **Vietnamese** (`lang="vi"`). English translation is on the roadmap but not implemented.

## Functional requirements

| Area                | Requirement                                                                                  | Status   |
|---------------------|----------------------------------------------------------------------------------------------|----------|
| Home                | Hero, product strip, applications grid, dark stats, video reel, news, CTA                    | Done     |
| Products list       | Filterable list of all 6 controllers with sidebar by machine type                            | Done (filtering UI is static — no client filter logic) |
| Product detail      | Hero, sticky tabs, full spec table, full-package accessory grid, related products, CTA       | Done     |
| Applications list   | Grid of 7 application case studies + CTA to download catalogue                               | Done     |
| Application detail  | Dark hero, 4-step workflow, spec table, deployments, related apps                            | Done     |
| Services list       | Custom-manufacturing pitch, capabilities, 8-week process, contact form                       | Done     |
| Service detail      | Hero, 5-step process, what's included, 3 pricing tiers, FAQs                                 | Done (only `retrofit` slug populated) |
| News list           | Featured article + grid + tabs + newsletter signup                                           | Done     |
| News detail         | Long-form article with TOC, hero image, body, tags, related                                  | Done (rich body only for `astro-12x`; others fall back to excerpt) |
| Downloads           | Category cards + featured documents + helper CTAs                                            | Done     |
| Datasheets          | Filterable doc table with sidebar facets and pagination UI                                   | Done (filters are static UI) |
| About               | Story, milestones, values, factory stats, leadership                                         | Done     |
| Contact             | Channels, request form, two offices, FAQ                                                     | Done     |
| Search              | Search input + faceted results + recent queries                                              | Done (results are sample data; no real index) |
| Search trigger      | Header search button opens fullwidth panel with featured products                            | Done     |
| 404                 | Branded not-found page with CTAs                                                             | Done     |
| Footer              | 4-column nav + social + bottom bar                                                           | Done     |

## Non-functional requirements

- **Render strategy**: Server Components everywhere except `Header` and `SearchPanel` (which need `usePathname` and DOM event handlers).
- **Static export friendly**: All dynamic routes implement `generateStaticParams`. The site can be built with `next build` and served as static assets behind any CDN.
- **Performance**: Use `next/font/google` for self-hosted Inter / Inter Tight / JetBrains Mono. Use `next/image` with `priority` for the header logo.
- **Accessibility**: Every interactive control needs `aria-label`. The search panel closes on `Escape`. Outline focus styles must remain visible.
- **Browser support**: Modern evergreen browsers (Chrome / Edge / Safari / Firefox latest). No IE.
- **No backend dependencies**: No database, no API routes, no environment variables required to run.

## Out of scope (current build)

- Form submission backend (Resend / SendGrid / custom email)
- Real search index (currently sample data on `/search`)
- Internationalisation / English variant
- CMS / MDX-driven news content
- Authentication / gated downloads
- Sitemap.xml, robots.txt, JSON-LD structured data
- Analytics / consent banners
- Real product imagery (current visuals are inline SVG placeholders styled as technical drawings)

These are tracked in `project-roadmap.md`.

## Constraints

- **Content language is Vietnamese.** Do not translate copy; reach out to product owner before adjusting wording.
- **Design system is fixed.** All new UI must compose from the `qs-*` primitives in `app/globals.css`. Do not introduce new colour tokens or typography without updating `design-guidelines.md`.
- **No new dependencies without review.** Current dependency graph is intentionally narrow (next + react + tailwind only).
- **Data shape is the source of truth.** Page templates iterate over `data/*.ts` arrays. Add new products by extending those arrays — do not duplicate copy across pages.

## Success metrics

- All 6 product detail routes render at build time.
- Lighthouse scores ≥ 90 on Performance / Accessibility / Best Practices for `/`, `/products`, `/products/f86`.
- Zero TypeScript errors under `tsc --noEmit`.
- `yarn build` completes cleanly with zero warnings.
