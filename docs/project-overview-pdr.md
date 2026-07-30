# Project overview and product requirements

`qs-shop` — the bilingual marketing and product-catalogue website for QS
Technology Co., Ltd.

This document states what the product is, who it serves, what it must do, and
the criteria a change is judged against. It describes the system **as built**;
anything not yet true is in `project-roadmap.md` and marked as a suggestion
there, not here.

---

## 1. Product summary

QS Technology designs and manufactures CNC controllers, servo drives and
expansion boards in Vietnam, and builds CNC and automation machines around them.
The site is the company's public catalogue and lead channel.

| | |
|---|---|
| Audience | Vietnamese machine builders, integrators, end users and distributors, plus export enquiries in English |
| Primary language | Vietnamese (`vi`) |
| Secondary language | English (`en`) |
| Primary conversion | contact / quote request → CRM lead |
| Secondary conversions | download a manual or catalogue, find a specific model, phone the hotline |
| Production origin | `https://qstcnc.com` |

Company facts the site publishes today: two hotlines
(`+84 909 663 350`, `+84 922 322 338`), a Hóc Môn, Ho Chi Minh City address in
the footer, a stated 4-working-hour response commitment (08:00–17:30, Mon–Fri),
support across 35 provinces, and a 24-month warranty.

### What the site is not

- Not e-commerce. There is no cart, no checkout, no pricing engine, no account.
- Not a CMS. Content is authored in an internal admin application and lands in
  this repository as JSON, then ships with a build.
- Not an application. There is no login (the `/403` route exists as a courtesy
  page and links to `/login`, which this site does not serve), no user data, no
  session, no server.

---

## 2. Content scope

| Content type | Published today | Route |
|---|---:|---|
| CNC controllers | 7 (`f54`, `f86`, `f10t`, `astro-10s`, `astro-6ah`, `astro-6av`, `astro-10i`) | `/[locale]/electronics/[slug]` |
| DNC transfer units | 2 | `/[locale]/electronics/dnc` + detail |
| Accessories | 9 (I/O boards, cables, PSU, touch probe, tool setter, PLC/DAC/PID boards) | `/[locale]/electronics/accessories` + detail |
| Drive / inverter series | 4 (QS Servo `sdv3` + `sch-motor`, Savch `s600`, `s3100`) | `/[locale]/electronics/servo`, `/inverters` + detail |
| Machines | 7 (2 milling, 1 router, 2 jewelry, 2 automation) | `/[locale]/machine-building/[slug]` |
| Applications | 9 machine-type case studies | `/[locale]/applications/[slug]` |
| Services | 1 (`retrofit`) | `/[locale]/services/[slug]` |
| News | 15 articles | `/[locale]/news/[slug]` |
| Downloads | 22 local files + each series' document library (14 / 0 / 10 / 23 documents) | `/[locale]/downloads` |
| Static pages | home, about, contact, search, 403, 404 | — |

### Deliberate structural decisions

**Three product-shaped types, not one.** `Product` (controllers), `CatalogProduct`
(DNC units and accessories) and `ProductSeries` (drives and inverters) are
separate types. A controller is described by axis count, display size, control
protocol columns and a shipped machine kit; a DB9 cable or a 12 V adapter has
none of those; a drive series has no single part number at all. Merging them
would leave most fields empty on most rows and force every template to guard
every field.

**Series are sold at series level.** The catalogue lists SDV3 and S600 as whole
families, not part numbers, because that is how they are quoted and bought. So a
series carries a positioning line plus series-wide specs, and the per-model
breakdown lives in datasheet blocks (model tables, naming-code decode, parameter
grids) inside its detail page rather than as separate catalogue rows.

**Controller sub-types include unpublished branches.** `ControllerType` is
`"motion" | "cnc" | "robot" | "cobot"`, but every model published today is `cnc`.
The other three exist in the browse taxonomy and render a "being prepared" panel.
That is intentional: the taxonomy is the roadmap the sales team sells against.

---

## 3. Functional requirements

### FR-1 Bilingual delivery

- Every public URL carries a locale prefix and a trailing slash
  (`/vi/electronics/f54/`). There is no unprefixed page; `/` is a 301 to `/vi/`.
- `<html lang>` reflects the active locale.
- A locale switcher is present on every page and persists the choice.
- Visiting `/vi/` with a previously stored English choice re-routes to `/en/`.
  Nothing deeper than the locale root is ever re-routed, and browser language is
  never sniffed on a normal page — a shared `/vi/…` link is an explicit
  destination, and a crawler executing JS must not be bounced away from the page
  it is indexing.
- UI copy lives in `messages/<locale>/*.json`; per-row content carries a
  Vietnamese primary field and an optional English sibling with per-field
  fallback, so a partially translated row still renders.

**Acceptance:** `yarn i18n:check` passes; both locale trees build; every
translated page renders with no visible raw key path.

### FR-2 Product discovery

- `/electronics` is a hub with a category tree; `servo`, `inverters`, `dnc` and
  `accessories` have their own list pages.
- List filters are mirrored in the URL (`?g=<group>&t=<type>`) so a narrowed view
  can be shared, bookmarked and walked back.
- A shared filter URL must not visibly paint the unfiltered list first.
- The prerendered HTML always contains the full unfiltered list, so crawlers and
  no-JS visitors see every product.
- Header navigation deep-links into those filters; clicking a leaf for the page
  already on screen filters in place instead of navigating.

**Acceptance:** loading a `?g=…` URL shows only matching cards from first paint;
view-source on a filtered URL still contains every card.

### FR-3 Site search

- Search is available from the header on every page and from `/search`.
- Coverage: controllers, catalogue items, series, machines, news, applications,
  services, and every downloadable document.
- Accent-insensitive: `dieu khien` must find `điều khiển`.
- Model-code tolerant: a compressed query such as `as10` must reach "Astro 10i",
  and `sdv3` must return the series page above its manuals.
- Results are filterable by type and paginated; recent searches are remembered
  locally.
- Runs entirely in the browser — there is no server to query.

**Acceptance:** first keystroke returns suggestions; the queries above return the
stated pages; `/search` is `noindex` and absent from the sitemap.

### FR-4 Documentation library

- `/downloads` presents a three-level tree: product family → model → document
  group.
- Every file's own language is shown as a badge, and all files are listed
  regardless of UI locale — a Vietnamese visitor may still need an English-only
  manual.
- The same document in several languages collapses into one row with per-language
  buttons.
- An archive too large for the host's per-file ceiling is split along a seam the
  content already has (one CAD model per inverter frame size) and shown as one
  expandable row rather than a dozen siblings.
- Product detail pages surface their own files plus the shared software.

**Acceptance:** every listed file resolves with a 200 and the stated size.

### FR-5 Lead capture

- The contact form collects: name (required), phone (required), email
  (optional, validated when present), business field (a known code or free
  text), services of interest (from three fixed codes), and a message
  (≤ 2,000 characters).
- Validation runs client-side with zod before the request.
- Submission POSTs to `{NEXT_PUBLIC_CRM_API_BASE}/public/leads`, unauthenticated.
- Each outcome gets its own message: success, validation rejection, rate limit
  (the CRM allows 5 requests per minute per IP), server error, network error.
- A honeypot field silently drops bot submissions without sending anything.
- Arriving with `?message=<text>` pre-fills the message, so "request a quote for
  this product" links carry context.

**Acceptance:** a valid submission returns 201 and shows the success state; a
blocked or failed request shows the matching message rather than a generic one.

### FR-6 SEO and sharing

- Every indexable route emits title, description, self-referencing canonical, and
  `vi` / `en` / `x-default` hreflang.
- `sitemap.xml` lists both locale variants of every indexable page with the full
  alternate set on each; `lastModified` appears only where a real content date
  exists.
- JSON-LD: Organization and WebSite site-wide, plus Product / Article / Service /
  BreadcrumbList per page.
- OG images: a site default, plus per-slug generated cards for electronics, news
  and applications.
- Error and search pages are `noindex, nofollow` and stay out of the sitemap.
- Titles and descriptions are truncated on a word boundary within the SERP
  budget, accounting for the ` | QS Technology` suffix the layout appends.

**Acceptance:** canonical, hreflang and sitemap URLs are byte-identical for the
same page; no sitemap URL redirects.

### FR-7 Resilience

- A page whose client JS never arrives must still show its content (a 4-second
  parse-time failsafe reveals scroll-reveal content).
- JS switched off must still show content (a `<noscript>` style).
- Search index unavailable → empty results, not an error.
- CRM unreachable → an explicit network message.
- Any unmatched URL → the 404 document, which localises itself in-page.

---

## 4. Non-functional requirements

### NFR-1 No server runtime

The site must remain deployable as static files. That constraint is load-bearing:
it is why image variants are pre-rendered, why search runs in the browser, why
redirects and headers live in `firebase.json`, and why filter state is read from
the URL on the client rather than during render.

Anything that would require a server at request time is out of scope without an
explicit decision to change hosting.

### NFR-2 Performance

- One font family on the critical path. A second display face was measured at
  roughly 55 KB of preloaded subsets competing with the LCP image on every page,
  and was dropped; headings compensate with tighter tracking.
- The LCP element must not fade in — an element starting at `opacity: 0` is not a
  paint, which pushed the metric out by about 2.8s on the home hero on a
  throttled phone profile.
- Responsive images are mandatory. The pre-rendered ladder is
  256/384/640/768/960 with the original as the top rung, and Next's size lists
  mirror it so srcset carries no dead rungs.
- Client message payload is restricted to an explicit allow-list, cutting roughly
  60% of what the provider would otherwise inline into every document.
- Long-lived caching for hashed assets, images and downloads.

### NFR-3 Accessibility

- Minimum 44px touch targets on coarse pointers.
- Every animation has a `prefers-reduced-motion` counterpart.
- Hover states that convey meaning have focus counterparts.
- Nav labels never wrap; Vietnamese labels (roughly 1.6× the English) drive two
  extra breakpoint steps.

### NFR-4 Security

- CSP with `frame-ancestors 'none'`, a single allowed connect origin (the CRM), a
  single allowed remote image host (YouTube posters) and a single allowed frame
  origin (youtube-nocookie), plus nosniff, DENY framing, a strict referrer policy
  and camera/microphone/geolocation/payment disabled.
- Crawled HTML (news bodies) is sanitized before rendering.
- `dangerouslySetInnerHTML` is limited to four first-party constant scripts.
- No secrets exist in the build — there is nothing to protect at runtime, and
  every environment variable is public by construction.

### NFR-5 Maintainability

- Content is data, not markup: a new product is a JSON row, not a new page.
- Content types stay separate where their shapes genuinely differ.
- Every localizable field resolves in one place (`lib/data/*.ts`), never in JSX.
- Non-obvious decisions carry a comment recording the constraint, not a
  restatement of the code. This is an established norm across the repository.

### NFR-6 Browser support

Modern evergreen browsers. Safari is explicitly accommodated where it lags
(the scrollbar styling ships both the standard properties and the legacy
`::-webkit-scrollbar` pseudo-elements).

---

## 5. Constraints and dependencies

| Constraint | Consequence |
|---|---|
| Static export, no server | see NFR-1 |
| Content authored in an external admin app | the repository receives JSON; the site cannot be the source of truth for content, and a content change requires a rebuild and deploy |
| CRM is external and unauthenticated | rate limits and CORS are the CRM's; the site can only report outcomes. The CRM origin must appear in the CSP. |
| CRM stores codes, not labels | service and business-group codes in `lib/validation/crm-lead-schema.ts` must match the CRM exactly; unknown codes are rejected with 400. Display labels are this site's i18n. |
| Manufacturer datasheets are images with baked-in Chinese text | text-and-table plates are re-authored as native bilingual blocks; genuine artwork (dimension drawings, cable illustrations) is cropped out and carried as images; a few figures need a per-locale file |
| Firebase per-file size ceiling | oversized archives are split along a content seam and re-joined visually as one expandable row |
| No test framework | `yarn build` + `yarn lint` + `yarn i18n:check` are the quality gates |

External runtime dependencies at page-view time: **the CRM** (contact form only)
and **YouTube** (embedded players and poster stills). Everything else is served
from the site's own origin.

---

## 6. Definition of done for a change

1. `yarn lint` clean.
2. `yarn build` succeeds — this is the real gate, since the export catches stale
   client-message paths, missing static params and type errors.
3. `yarn i18n:check` passes if `messages/` changed.
4. Both locales render the affected pages, with English falling back gracefully
   where a translation is absent.
5. New copy is in `messages/`, new content is in `data/`, neither is in JSX.
6. New routes emit metadata with alternates and appear in the sitemap if
   indexable.
7. New animation has a reduced-motion counterpart; no new opacity animation on an
   LCP element.
8. New images are `.webp` under `public/` with real intrinsic dimensions passed
   to the image component.
9. Any new outbound origin is added to the CSP `connect-src` in `firebase.json`.
10. Non-obvious decisions are commented with the constraint that forced them.
