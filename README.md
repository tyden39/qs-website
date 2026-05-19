# QS Technology — Corporate Website

Vietnamese marketing site for **QS Technology Co., Ltd.**, a Vietnam-based manufacturer of CNC controllers, servo drives and automation boards. Built on **Next.js 16 App Router** with content rendered server-side from static TypeScript data modules.

## Stack

- **Next.js** 16.2 · **React** 19.2 · **TypeScript** 6
- **Tailwind CSS** 4.2 (CSS-first config via `@theme` in `app/globals.css`)
- **Fonts**: Inter Tight (display) · Inter (body) · JetBrains Mono (technical labels)
- **Package manager**: yarn
- **Static-friendly** — pages are RSC by default; no database, no API routes

## Quick start

```bash
yarn install
yarn dev          # http://localhost:3000
yarn build && yarn start
yarn lint
```

## Repository layout

```
qs-website/
├─ app/                         # Next.js App Router
│  ├─ layout.tsx                # Root layout — Header + SearchPanel + Footer
│  ├─ globals.css               # Tailwind v4 + design tokens + qs-* utilities
│  ├─ page.tsx                  # Home
│  ├─ not-found.tsx             # 404
│  ├─ products/                 # /products + [slug]
│  ├─ services/                 # /services + [slug]
│  ├─ applications/             # /applications + [slug]
│  ├─ news/                     # /news + [slug]
│  ├─ downloads/                # /downloads + datasheets
│  ├─ about/                    # /about
│  ├─ contact/                  # /contact
│  └─ search/                   # /search?q=
├─ components/
│  ├─ Header.tsx                # Sticky nav · client (active route + search trigger)
│  ├─ Footer.tsx                # 4-col footer + social links
│  └─ SearchPanel.tsx           # Fullwidth dropdown search (client)
├─ data/
│  ├─ products.ts               # 6 controller models (F-series + Astro)
│  ├─ services.ts               # Custom-engineering / retrofit packages
│  └─ news.ts                   # Press releases
├─ public/                      # Static assets (logo)
├─ template/                    # Original HTML reference (not bundled)
├─ docs/                        # Project documentation (see ./docs)
├─ next.config.mjs
├─ tsconfig.json
└─ package.json
```

## Content model

All content is statically typed and lives in `data/*.ts`. There is no CMS, no database. Editing copy means editing TypeScript:

| File                | Type             | Items |
|---------------------|------------------|-------|
| `data/products.ts`  | `Product[]`      | 6 controllers (F54, F86, F10T, Astro 6AH/6AV/10i) |
| `data/services.ts`  | `Service[]`      | Retrofit packages with process / FAQs / pricing |
| `data/news.ts`      | `News[]`         | Press releases & announcements |

Dynamic routes (`[slug]/page.tsx`) call `generateStaticParams()` so every detail page is pre-rendered at build time.

## Design tokens

Tokens are declared in `app/globals.css` under `@theme` and consumed via Tailwind utilities. Full reference: [docs/design-guidelines.md](./docs/design-guidelines.md).

| Token (CSS var)     | Hex                              | Usage                          |
|---------------------|----------------------------------|--------------------------------|
| `--color-paper`     | `#f5f3ee`                        | Default page background        |
| `--color-paper-2`   | `#ecebe5`                        | Card / placeholder background  |
| `--color-ink`       | `#0a0a0a`                        | Primary text · dark sections   |
| `--color-line`      | `#d8d6cf`                        | Borders / dividers             |
| `--color-muted`     | `#6b6960`                        | Secondary text · mono labels   |
| `--color-gold`      | `#c9a35a`                        | Accent border / icon stroke    |
| `--color-gold-grad` | gradient `#f0d28a → #8a6f35`     | Heading emphasis · gold buttons|
| `--color-rust`      | `#c8553d`                        | Status indicator dots          |

## Component primitives (`@layer components`)

- `.qs-wrap` — 1280px container with horizontal padding
- `.qs-eyebrow` — uppercase mono label with leading gold rule
- `.qs-h1` / `.qs-h2` / `.qs-h3` / `.qs-lede` — display typography
- `.qs-btn` / `.qs-btn-gold` / `.qs-btn-ghost` / `.qs-btn-sm` — button variants
- `.qs-card` — bordered white card with hover lift
- `.qs-section-head` — section heading row with bottom rule
- `.qs-grid-bg` — technical-drawing grid background
- `.qs-tag` / `.qs-crumb` / `.qs-link` — supporting marks

Header / footer / search use scoped `.qs-*` classes declared outside the component layer (also in `app/globals.css`).

## Documentation

| Doc                              | Purpose                                    |
|----------------------------------|--------------------------------------------|
| [project-overview-pdr.md](./docs/project-overview-pdr.md) | Product scope · audience · requirements |
| [codebase-summary.md](./docs/codebase-summary.md) | File-by-file overview                |
| [system-architecture.md](./docs/system-architecture.md) | Rendering · routing · data flow        |
| [code-standards.md](./docs/code-standards.md) | Conventions for naming, structure, styling |
| [design-guidelines.md](./docs/design-guidelines.md) | Tokens · typography · layout patterns  |
| [project-roadmap.md](./docs/project-roadmap.md) | Phases · milestones · open work         |

## License & attribution

Internal corporate website for QS Technology Co., Ltd. Logo and copy are property of QS Technology.
