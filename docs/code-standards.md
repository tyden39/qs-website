# Code Standards

## File naming

- **TypeScript/TSX in `app/**`** — Next.js requires `page.tsx`, `layout.tsx`, `not-found.tsx`. Don't rename.
- **Components in `components/`** — PascalCase filenames matching the default export (`Header.tsx`, `Footer.tsx`, `SearchPanel.tsx`). This is the existing convention; keep it.
- **Data modules in `data/`** — kebab-case nouns (`products.ts`, `services.ts`, `news.ts`).
- **Documentation in `docs/`** — kebab-case (`code-standards.md`, `system-architecture.md`).
- **Slugs** — kebab-case lowercase (`f10t`, `astro-6ah`, `phay-cnc`, `uon-lo-xo`). Vietnamese diacritics are stripped.

## Module shape

Static content modules in `data/*.ts` follow a fixed pattern:

```ts
export type Foo = { /* fields */ };

export const foos: Foo[] = [
  { /* item 1 */ },
  /* … */
];
```

When adding a new content type, mirror this shape. Pages iterate the array and pass items down to JSX — they do not reach into individual fields by index.

## Server vs Client components

- **Default to Server Components.** Only add `"use client"` when the file genuinely needs:
  - browser-only APIs (`document`, `window`, `localStorage`)
  - React hooks like `useState`, `useEffect`, `usePathname`
  - DOM event handlers attached via JSX
- Client boundaries should be **as small as possible**. If a page needs one interactive widget, extract just that widget — don't promote the whole page to client.

Currently only `Header` and `SearchPanel` are client components. New interactive widgets should follow the same isolation pattern.

## TypeScript

- `strict: true` is on. No `any` unless you explain why in a comment.
- Prefer **inline literal types** for component props (the existing convention):
  ```tsx
  function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) { … }
  ```
- For multi-page shared shapes (Product, Service, News), declare the type next to the data and `export type`.
- Pages with dynamic params take `params: Promise<{ slug: string }>` and `await` it — this is the Next.js 16 signature.
- `generateStaticParams` returns plain `{ slug: string }[]` from the data module.

## Styling

- **Use Tailwind utilities** for layout, spacing, colour, typography.
- **Use `qs-*` primitives** (`qs-wrap`, `qs-btn`, `qs-eyebrow`, `qs-h1`, `qs-section-head`, `qs-card`, etc.) for repeated patterns. They live in `@layer components` inside `app/globals.css`.
- **Inline `style={{...}}`** is acceptable for:
  - the gold gradient (`background: var(--gold-grad)`)
  - aspect ratios not in the Tailwind defaults
  - one-off radial / linear background gradients
- **Do not** introduce arbitrary `[#hex]` colour values for tokens that exist in the design system. If a colour is missing, add it to `@theme` in `globals.css` and document it in `design-guidelines.md`.
- Mono-spaced "eyebrow" labels follow the format `[ Section · 04 of 06 ]` — keep this convention for new sections.

## Component conventions

- **Inline tile data** is fine for one-off marketing sections (homepage hero, applications grid). Extract into `data/*.ts` only when the content shows up on more than one page.
- **Helper components** (`Field`, `RadioGroup`, `FootCol`, `Social`) live at the bottom of the page/component file that uses them — do not extract until a second consumer appears.
- **Maps over arrays** must supply a stable `key` from the data, not the index, when the data has a natural id (`slug`, `name`).
- **`<Link>` for internal nav, `<a>` for external / `tel:` / `mailto:`.**
- **`<Image>` from `next/image` for raster assets.** Provide `width` and `height`. Use `priority` only on above-the-fold logos.

## Accessibility

- Every icon button needs `aria-label` (`Tìm kiếm`, `Đóng`, `Ngôn ngữ`, etc.).
- The search panel responds to `Escape`. New modal-like surfaces should follow the same pattern.
- Focus-visible outlines from the browser default are preserved — don't blanket-remove with `outline-none` unless you replace it with a visible alternative.
- Vietnamese form labels: keep them outside the input as `<span>`, not `placeholder` only.

## Internationalisation hygiene

- Site language is **Vietnamese** (`lang="vi"`). All visible copy is Vietnamese.
- When introducing new strings, write them in Vietnamese and avoid english-only filler text in production code.
- Avoid hardcoded English UI strings (e.g., button labels). Mono-spaced bracket marks (`[ Catalog · 03 of 06 ]`) are stylistic and stay in English by design.

## Comments

- **Keep code self-documenting.** Don't write comments that restate the obvious.
- **Do** annotate:
  - Why a component is a client component (one-line note above `"use client"`)
  - DOM-class toggling tricks (`SearchPanel`, `Header.openSearch`)
  - Hard-coded fallbacks awaiting a real data shape (e.g. the `articleBody` block in `news/[slug]/page.tsx`)

## Linting

- `yarn lint` runs `next lint`. Fix issues before committing.
- Don't disable rules globally. Use `// eslint-disable-next-line <rule>` with a justification comment.

## Adding a new page

1. Create `app/<segment>/page.tsx` (server component by default).
2. Add `metadata` export with a Vietnamese `title`.
3. Compose layout from `qs-*` primitives + Tailwind utilities.
4. If dynamic, add `[slug]/page.tsx` and implement `generateStaticParams` against a `data/<segment>.ts` module.
5. If the page is reachable from nav, update `components/Header.tsx` (`left` / `right` arrays).
6. Update `docs/codebase-summary.md` and (if structural) `docs/system-architecture.md`.

## Adding a new product

1. Append a `Product` entry to `data/products.ts`.
2. Verify the slug renders at `/products/<slug>` — `generateStaticParams` will pick it up automatically.
3. If the product needs a custom hero or visual, branch inside `app/products/[slug]/page.tsx` based on `slug` (avoid duplicating the whole template).
4. Add the model to the **`featured`** list in `components/SearchPanel.tsx` if it should appear in the dropdown — this list is currently hand-maintained.

## Git hygiene

- Conventional commit format (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- Don't commit `.next/`, `node_modules/`, `tsconfig.tsbuildinfo` (already in `.gitignore`).
- Don't commit build artifacts or generated assets that aren't needed at runtime.
