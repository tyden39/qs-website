# Code standards

Conventions this repository actually follows, derived from the code. Where the
codebase is inconsistent, that is said plainly rather than papered over.

---

## Language and tooling

| Setting | Value | Source |
|---|---|---|
| Node | 20 | `.nvmrc` |
| Package manager | yarn 1.22.22 | `package.json` `packageManager` |
| TypeScript | 6, `strict: true`, `noEmit` | `tsconfig.json` |
| Module resolution | `bundler`, `resolveJsonModule` | `tsconfig.json` |
| Path alias | `@/*` → repository root | `tsconfig.json` |
| Lint | ESLint 9 flat config spreading `eslint-config-next` | `eslint.config.mjs` |
| CSS | Tailwind v4, configured in CSS (`@theme`), not JS | `app/globals.css`, `postcss.config.mjs` |

`next lint` no longer exists in Next 16, so `yarn lint` runs `eslint .` against
the flat config, which ignores `out/`, `.next/`, `node_modules/`, `public/` and
`next-env.d.ts`.

**There is no test framework.** `jsdom` and `node-fetch` are devDependencies
used by content-tooling scripts. Do not describe or assume a test suite; if one
is added, this section is the first thing to update.

---

## File naming

**Rule: kebab-case for every module, including React components.**

`hero-slider.tsx`, `contact-form.tsx`, `series-model-table.tsx`,
`image-loader.ts`, `crm-lead-schema.ts`, `use-filter-params.ts`,
`build-search-index.ts`.

**The exception, stated honestly:** three shared components are PascalCase —
`components/Header.tsx`, `components/Footer.tsx`, `components/SearchPanel.tsx`.
They predate the convention and were never renamed. Every one of the other 21
files under `components/` is kebab-case. **Do not add new PascalCase files.** If
these three are ever renamed, the import sites are `app/[locale]/layout.tsx` for
all three, plus `Header`'s own internal imports.

Exported React component names stay PascalCase regardless of the filename
(`export default function HeroSlider`, `export function SeriesDetail`) — that is
a React requirement, not a filename one.

Directories are kebab-case, except the App Router's own `[locale]` / `[slug]`
dynamic-segment syntax and the `_components` private-folder prefix.

---

## Directory conventions

### `_components/` is route-private

Any directory under `app/` prefixed with `_` is excluded from routing, so UI that
belongs to exactly one route sits beside the page that owns it:

```
app/[locale]/electronics/
  page.tsx
  [slug]/page.tsx
  _components/          ← 15 files, only these routes use them
```

Put a component in `components/` **only** when a second route imports it. The one
current cross-route reach — `machine-building/_components/line-machine-detail.tsx`
importing `ProductVideo` from `electronics/_components/` — is a sign that piece
has outgrown its home; new sharing should promote to `components/` instead of
reaching sideways.

### The three-layer content path

```
data/<entity>.json     rows (authored in the internal admin app)
data/<entity>.ts       TypeScript types + `export const x = json as unknown as T[]`
lib/data/<entity>.ts   locale resolution and derivation → <Entity>View
app/**/page.tsx        rendering only
```

Rules:

- Pages import from `lib/data/…`, never from `data/…` for content. (`data/` type
  imports are fine when a component needs the shape.)
- `data/*.ts` holds types, shared constants (`HIGHLIGHT_COUNT`, `MACHINE_TYPE`,
  `HERO_TRIPTYCH`) and the re-export — no transformation logic.
- All localisation, fallback and derivation happens in `lib/data/*.ts` and lands
  in a `…View` type whose fields are plain resolved values.

---

## Server-first rendering

React Server Components are the default. `"use client"` appears in exactly 30
files, and only where interaction requires it:

| Client-side because | Examples |
|---|---|
| stateful UI / event handlers | `Header`, `product-detail-tabs`, `downloads-tree`, `hero-slider` |
| browser APIs (`localStorage`, `IntersectionObserver`, `history`) | `search-results`, `reveal`, `use-filter-params` |
| forms | `contact-form` |
| in-browser search | `SearchPanel`, `search-results`, indirectly `lib/search/engine.ts` |
| shared client hooks | `lib/use-swipe`, `use-zoom-pan`, `use-reduced-motion`, `use-user-engaged` |

Everything else — every page, every detail template, every list shell — is a
server component that reads data at build time and emits HTML. When adding a
component, start server-side and add `"use client"` only when something actually
needs the browser.

Server components read copy with `getTranslations` from `next-intl/server`;
client components use `useTranslations`. A client component's namespace must be
listed in `CLIENT_MESSAGE_PATHS` (`lib/i18n/client-messages.ts`) or its keys will
not exist in the browser — and an entry there that resolves to nothing throws
during prerender, so the list stays honest by construction.

---

## Bilingual content convention

**Vietnamese is primary; English is a sibling field.**

```ts
type News = {
  title: string;       // Vietnamese — always present
  titleEn?: string;    // English — optional
  excerpt: string;
  excerptEn?: string;
};
```

Resolution happens once, in the view layer:

```ts
const en = locale === "en";
const title = (en ? n.titleEn : null) ?? n.title;
```

The `?? primary` fallback is deliberate and per-field, so a partially translated
row still renders rather than showing an empty heading.

Rules:

- Suffix is exactly `En` on the sibling: `desc`/`descEn`, `alt`/`altEn`,
  `v`/`vEn`, `label`/`labelEn`, `caption`/`captionEn`, `body`/`bodyEn`.
- Store locale-neutral values **once**. Model codes, part numbers, voltage
  ratings, dimensions and axis counts are the same in both languages and get one
  field.
- Where the value itself is an image with baked-in text (manufacturer datasheet
  figures), the locale picks the **file**, not just the alt: `src` / `srcEn`.
- Deeply nested strings use `{ vi, en }` pairs instead of parallel fields. This
  is used inside the series datasheet blocks (`type Loc = { vi: string; en: string }`),
  where parallel `*En` fields would nest four levels deep and read far worse. The
  view layer collapses each pair to the active locale.
- Repeating formulaic vocabulary (bundle labels, spec section headings, alt-text
  patterns) is translated by a lookup map in `lib/data/products.ts` rather than
  duplicated on every row. Genuine prose is authored per row.
- Chrome copy — labels, headings, button text, anything not per-row — belongs in
  `messages/<locale>/<namespace>.json`, not in the data files and not in JSX.
- Spec rows that carry a stable label reference an i18n key rather than a string:
  `MachineSpec` is `{ k, v, vEn? }` where `k` resolves through
  `cnc.machines.labels`.

Run `yarn i18n:check` after touching `messages/`. It flattens both locales and
fails on any missing or extra key.

---

## Documentation-in-code norm

This codebase carries **heavy explanatory file-header and inline comments, and
that is the established standard.** They explain *why*, not *what* — the
alternative that was tried, the constraint that forced the shape, the failure
mode being defended against. Representative examples:

- `next.config.mjs` explains why both size lists mirror the variant ladder (a
  width with no file behind it prints the same variant twice).
- `data/catalog.ts` explains why catalogue items do not reuse the `Product` type.
- `lib/use-filter-params.ts` explains why it is not `useSearchParams`.
- `app/globals.css` explains why several rules are deliberately left unlayered
  (in Tailwind v4, `@layer components` loses to utilities, so a reset that must
  win has to sit outside a layer).
- `lib/search/engine.ts` explains why the BM25 passes are ordered strictest-first
  in Vietnamese.

Follow the norm when you change something non-obvious. A comment restating the
code adds nothing; a comment recording the constraint stops the next person
"simplifying" the code back into the bug.

Do **not** put plan identifiers, phase numbers, ticket codes or audit labels in
comments, commit messages or test names. State the invariant.

---

## TypeScript conventions

- `strict` is on; do not weaken it locally.
- Discriminated unions for anything with distinct outcomes — the CRM client
  returns `{ ok: true } | { ok: false; kind: "validation" | "rate_limit" |
  "server" | "network"; … }`, and the series datasheet body is a `SheetBlock`
  union keyed on `kind`.
- `as const` for literal tuples and lookup keys (`locales`, `VARIANT_WIDTHS`,
  `CRM_SERVICE_CODES`, `CLIENT_MESSAGE_PATHS`), with the type derived from the
  value (`type Locale = (typeof locales)[number]`).
- JSON imports are cast once at the boundary
  (`export const products = productsData as unknown as Product[]`) and never
  again downstream.
- Optional-vs-null: source data uses optional fields (`taglineEn?`), view types
  normalise to `T | null` (`controller: string | null`) so templates test one
  thing.
- `Record<K, V>` for lookup maps with an exhaustive key type, e.g.
  `TYPE_WEIGHT: Record<SearchRecord["type"], number>` — adding a search type then
  fails to compile until it is weighted.
- Type-only imports use `import type` (enforced by `isolatedModules`).

---

## Styling conventions

- Design tokens live in the `@theme` block of `app/globals.css`. Never hard-code
  a hex or a font-size that a token already names.
- Every text size maps to one of the nine scale steps (`text-label-xs` through
  `text-h2`). Decorative one-offs — giant stat numerals, watermarks — may use an
  arbitrary value.
- Reusable composites are `qs-*` classes in `@layer components`
  (`qs-btn`, `qs-card`, `qs-eyebrow`, `qs-crumb`, `qs-section-head`). One-off
  layout stays as Tailwind utilities in the JSX.
- Some rules are unlayered on purpose. In Tailwind v4 an `@layer components`
  rule loses to any utility class, so a reset that must beat a utility (the
  `.qs-select` appearance reset, the paused-animation rules) sits outside the
  layer. Where a per-instance override must still be possible, the value is
  supplied as a `var()` fallback rather than a declaration.
- Every motion rule has a `@media (prefers-reduced-motion: reduce)` counterpart.
  Adding an animation without one is a bug.
- Animations gated behind hover must also be *paused* when idle —
  `opacity: 0` alone never stops the animation clock, so the browser keeps
  compositing an invisible element every frame.

---

## Images

Import `@/components/media/image`, never `next/image` directly. The wrapper
decides `unoptimized` and `fetchPriority` on your behalf; going around it either
emits a srcset whose entries all resolve to the same file or leaves an LCP hero
queued behind the rest of the document.

Always pass real `width`/`height` (or `fill` + `sizes`). Intrinsic dimensions are
stored alongside the source in the data (`{ src, w, h }`) precisely so this is
easy.

New images go in `public/` as `.webp`; the variant generator picks them up on the
next `yarn dev` / `yarn build`. Only `lib/media/image-manifest.json` is
committed — the generated `-<w>w.webp` files are gitignored.

---

## SEO conventions

- Every absolute URL goes through `localeUrl(path, locale)` from
  `lib/seo/app-url.ts`. A hand-built URL that differs by a missing prefix or
  trailing slash reads to a crawler as a different page.
- Every indexable route exports `generateMetadata` with `alternates:
  buildAlternates(path, locale)`.
- Titles and descriptions pass through `seoTitle` / `socialTitle` /
  `seoDescription` in `lib/seo/text.ts`, which truncate on a word boundary and
  budget for the ` | QS Technology` suffix the layout template appends.
- Non-content routes (403, not-found, search) set `robots: { index: false,
  follow: false }` and stay out of the sitemap.

---

## Security conventions

- Never trust crawled HTML. News bodies are sanitized (`isomorphic-dompurify`)
  before rendering.
- `dangerouslySetInnerHTML` is used for exactly four things, all of them
  first-party constants: the three parse-time inline scripts (saved-locale
  redirect, reveal failsafe, 404 localiser), and the filter pre-paint primer.
  Any new use needs the same justification.
- Public env vars (`NEXT_PUBLIC_*`) are inlined into the client bundle. Nothing
  secret may ever be named that way, and this project has no server to hold a
  secret anyway.
- Form input is validated with zod on the client before the POST, and again by
  the CRM. Client validation is UX, not a control.
- Any new outbound origin must be added to the CSP `connect-src` in
  `firebase.json`, or the browser will block it in production while it works
  locally.

---

## Git conventions

- Conventional commit format where a message is written at all:
  `feat(electronics): rework the servo/inverter catalogue presentation`,
  `fix(nav): source Applications dropdown labels from the page's material groups`.
  A large share of recent history is the bare message `update`; prefer the
  conventional form.
- No AI attribution or tool references in commit messages.
- Never commit `.env*`, credentials, or the large source-asset folders
  (`images-origin/`, the Vietnamese-named photo directories) — all are already
  gitignored.
- Generated artefacts stay out of git: `out/`, `.next/`,
  `public/search-index.*.json`, `public/**/*-<w>w.webp`. The image manifest is
  the deliberate exception, because a clean checkout must typecheck.

---

## Checklist before opening a change

1. `yarn lint` clean.
2. `yarn i18n:check` passing if `messages/` changed.
3. `yarn build` succeeds — the export catches missing static params, stale
   client-message paths and image loader problems that dev mode tolerates.
4. New copy is in `messages/`, not in JSX.
5. New client components are justified; server-by-default was tried first.
6. New animations have a reduced-motion counterpart.
7. New routes have `generateMetadata` with alternates, and are in the sitemap if
   indexable.
8. Non-obvious decisions have a comment recording the constraint.
