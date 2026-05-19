---
phase: 4
title: "News CRUD (Tiptap)"
status: completed
priority: P1
effort: "5d"
dependencies: [2]
execution: parallel
stream: B
---

# Phase 4: News CRUD with Tiptap (Parallel Stream B)

## Overview

Build News admin CRUD với Tiptap rich text editor (bilingual VI/EN). News bodies đã được migrated HTML → Tiptap JSON ở Phase 2 seed; Phase 4 wires editor cho re-edit fidelity.

**Parallel execution:** Chạy đồng thời với Phase 3, 5, 6, 7, 8, 9. Owns `app/admin/news/*` + Tiptap setup. Reuses Phase 3 form pattern (reference only, not import).

**Red Team Session 2 updates:**
- F1+F9: News body now seeded as HTML from extracted page.tsx (Phase 2 Step 0). `body_json` NULL until first admin re-edit (Tiptap parses HTML client-side, no `@tiptap/html` server dependency).
- F3: DOMPurify sanitization at write (Server Action) AND read (public render). CSP nonce in Phase 1 root config.
- F4+F8: Tiptap image upload uses Vercel Blob client-direct-upload. SVG blocked.
- F5: Use `defineAdminAction` HOF for all Server Actions.
- F11: i18n keys split into `messages/vi/news.json` + `messages/vi/admin-news.json`.

## File Ownership (NO OTHER STREAM TOUCHES)

- `app/admin/news/*`
- `app/admin/_actions/news.ts`
- `lib/validation/news-schema.ts`
- `components/tiptap-editor.tsx` (shared, only Phase 4 creates — Phase 9 admin polish does NOT use Tiptap)
- `components/tiptap-toolbar.tsx`

**Reads from:**
- `lib/db/schema/catalog.ts` (news table — FROZEN)
- `lib/data/news.ts` (Phase 2)
- `app/admin/_actions/audit.ts`, `app/api/upload/route.ts`

**Writes to (own namespace only):**
- `messages/vi.json` → `news.*` namespace
- `app/[locale]/news/[slug]/page.tsx` → render `body_html` qua `dangerouslySetInnerHTML` (Phase 2 already did basic render; Phase 4 adds `.prose` typography styling)

## Requirements

**Functional:**
- News CRUD bilingual VI/EN
- Tiptap editor cho `body_html` (HTML) + `body_json` (JSON) — output cả 2
- Image upload trong Tiptap → Vercel Blob → setImage
- Tags multi-select với autocomplete từ existing news tags
- Draft / Published status
- `publishedAt` date picker
- Cover image upload single
- Auto-save draft localStorage (recover prompt khi mở form lại)

**Non-functional:**
- Tiptap toolbar gọn: bold/italic/h2/h3/list/link/image/code/blockquote/undo
- Editor mobile-responsive
- Tiptap bundle lazy-loaded (`dynamic(() => import('./tiptap-editor'), { ssr: false })`)
- Public `/news/[slug]` render with `@tailwindcss/typography` `.prose` styling

## Architecture

```
app/admin/news/
├── page.tsx                  list
├── new/page.tsx              NewsForm (create)
├── [id]/edit/page.tsx        NewsForm (edit, with body_json defaults for fidelity)
└── _components/
    ├── news-form.tsx         bilingual + Tiptap mounting
    ├── news-columns.tsx      TanStack columns
    └── tags-input.tsx        multi-tag với autocomplete

components/
├── tiptap-editor.tsx         shared editor (client only, lazy-loaded)
└── tiptap-toolbar.tsx        toolbar buttons

app/admin/_actions/news.ts:
  createNews, updateNews, deleteNews, getTagSuggestions
```

**Tiptap config (FROZEN):**
```ts
const editor = useEditor({
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
    Image.configure({ inline: false }),
    CodeBlockLowlight.configure({ lowlight }),
  ],
  content: defaultJsonValue,
  onUpdate: ({ editor }) => {
    onChange({ html: editor.getHTML(), json: editor.getJSON() });
  },
});
```

**Image upload trong Tiptap — Updated Session 2 (F4, F8):**
- Custom toolbar button → opens file picker → **`@vercel/blob/client` upload()** (NOT POST through Server Action — bypasses 1MB limit) → returns blob URL → `editor.chain().focus().setImage({ src: url }).run()`
- Client validation: reject `image/svg+xml`; whitelist `image/png|jpeg|webp`
- Loading state khi upload (insert placeholder, replace khi success)

**Bilingual editor strategy:**
- 2 Tiptap instances (1 VI, 1 EN) trong tabs — đơn giản, mỗi tab giữ state riêng
- Memory tradeoff: ~+2MB. Mitigation: lazy load + only mount tab khi visible

## Related Code Files

**Create:**
- `app/admin/news/page.tsx` (overwrites Phase 2 STUB)
- `app/admin/news/new/page.tsx`
- `app/admin/news/[id]/edit/page.tsx`
- `app/admin/news/_components/news-form.tsx`
- `app/admin/news/_components/news-columns.tsx`
- `app/admin/news/_components/tags-input.tsx`
- `app/admin/_actions/news.ts`
- `components/tiptap-editor.tsx`
- `components/tiptap-toolbar.tsx`
- `lib/validation/news-schema.ts` (fills Phase 2 stub)

**Modify:**
- `app/[locale]/news/[slug]/page.tsx` — wrap body container với `.prose qs-prose` className (CSS only)
- `messages/vi.json` → `news.*` keys
- `tailwind.config.ts` — add `@tailwindcss/typography` plugin

**Dependencies (install in this stream):**
```bash
# Tiptap 3.x — breaking change vs 2.x. See plan.md → Package Versions callouts.
yarn add @tiptap/react@^3.23.4 @tiptap/starter-kit@^3.23.4 \
         @tiptap/extension-link@^3.23.4 @tiptap/extension-image@^3.23.4 \
         @tiptap/extension-code-block-lowlight@^3.23.4 lowlight@^3.3.0
yarn add -D @tailwindcss/typography@^0.5.19
```
> Editor wrapper MUST set `useEditor({ immediatelyRender: false, ... })` to avoid Next 16 SSR hydration mismatch (Tiptap 3 default).

## Implementation Steps

1. **Install dependencies** (see Dependencies block above)

2. **Zod schema** (`lib/validation/news-schema.ts`)
   - slug, title {vi:required, en:optional}, excerpt {vi, en}, body_html {vi, en}, body_json {vi, en} (jsonb shapes), cover_image, tags string array, publishedAt date, status enum
   - Refine: if status='published' then publishedAt required

3. **Tiptap editor component** (`components/tiptap-editor.tsx`)
   - Client component, props `{ value: { html, json }, onChange, locale }`
   - Use `useEditor` hook
   - Render `<EditorContent editor={editor} />` + `<TiptapToolbar editor={editor} />`
   - **Lazy load wrapper:** parent imports với `dynamic(() => import('@/components/tiptap-editor'), { ssr: false })`

4. **Toolbar** (`components/tiptap-toolbar.tsx`)
   - Buttons: bold, italic, h2, h3, bullet list, ordered list, blockquote, code, link (prompt URL), image upload (custom), undo, redo
   - Image upload: file input ref → POST `/api/upload` → setImage with returned URL
   - Insert temp placeholder during upload, replace on success

5. **News form** (`news-form.tsx`)
   - Bilingual tabs (VI/EN) with 2 Tiptap instances
   - Fields: slug, title, excerpt, cover_image (ImageUploader pattern reused from Phase 3 if reusable), tags (TagsInput), publishedAt (shadcn DatePicker), status
   - Tags autocomplete: server action `getTagSuggestions()` returns distinct tags from DB
   - On Tiptap update: form setValue `body_html.<locale>` + `body_json.<locale>`
   - Auto-save: useEffect debounced (1s) → `localStorage.setItem('draft:news:<id|new>', JSON.stringify(values))`
   - Recovery prompt on mount nếu draft exists

6. **Server Actions** (`app/admin/_actions/news.ts`)
   - Pattern reuses Phase 3 reference: requireRole → parse → insert/update → audit → revalidateTag
   - Tags: `revalidateTag('news')` + `revalidateTag(\`news:${slug}\`)`
   - `getTagSuggestions()`: `SELECT DISTINCT unnest(tags) FROM news ORDER BY 1`

7. **List page** + columns: slug / title.vi / status / tags / publishedAt / updatedAt / actions

8. **Public news detail styling + sanitization** — **Updated Session 2 (F3)**
   - `app/[locale]/news/[slug]/page.tsx`:
     ```tsx
     import DOMPurify from 'isomorphic-dompurify';
     const safe = DOMPurify.sanitize(bodyHtml, {
       ALLOWED_TAGS: ['p', 'h2', 'h3', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'],
       ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
       ALLOWED_URI_REGEXP: /^(?:(?:https?:|mailto:)|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
     });
     return <div className="prose qs-prose max-w-none" dangerouslySetInnerHTML={{ __html: safe }} />;
     ```
   - **Also sanitize at WRITE time** in Server Action (defense in depth): before `db.insert(news).values({ body_html: ... })`, run same `DOMPurify.sanitize()`. If admin tries to insert `<script>`, the sanitized HTML stripped → audit log captures original vs sanitized diff (forensic trail).
   - Configure Tailwind typography plugin in `tailwind.config.ts`
   - Scope `.prose` chỉ trong news body container — không global
   - **CSP nonce** (Phase 1) further blocks any sanitizer bypass.

9. **i18n keys** — add `news.*` namespace only

10. **Smoke test (own scope)**
    - Create news với rich Tiptap content + 3 inserted images
    - View public `/news/[slug]` → render đúng styling
    - Edit lại → body_json restores fidelity (no structure loss)
    - Tags autocomplete suggests existing
    - Auto-save: refresh page, recover draft

## Success Criteria

- [ ] News CRUD đầy đủ với Tiptap bilingual
- [ ] Tiptap image upload Vercel Blob work
- [ ] Tags autocomplete từ DB
- [ ] Body fidelity: HTML → JSON → Tiptap re-edit → JSON same structure
- [ ] Public `/news/[slug]` render với `.prose` typography đẹp
- [ ] Tiptap bundle lazy-loaded — admin/news/* LCP < 2.5s
- [ ] Auto-save localStorage work với recovery prompt
- [ ] Audit log mutations
- [ ] `revalidateTag('news')` triggers public refresh
- [ ] `tsc --noEmit` pass

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Tiptap bundle size lớn ảnh hưởng admin LCP | `dynamic` lazy load, ssr: false |
| Tiptap HTML XSS nếu attacker compromises admin | Phase 4 scope: only admin/editor write. DOMPurify defer until customer write Phase 11+ |
| Bilingual 2 Tiptap instances memory | Memory tradeoff acceptable (~2MB). Alternative: switch single editor content khi tab change (defer if memory issue) |
| Image upload trong Tiptap fail mid-insert | Insert placeholder image with data-error, toast retry button |
| `@tailwindcss/typography` xung đột với qs-* primitives | Scope `.prose` trong news container only — không apply global |
| Phase 7 SEO needs news body excerpt → conflict | Phase 4 ensures `excerpt.vi` always set (Zod required). Phase 7 reads excerpt for meta description |
| News tags column array — search lib | Postgres native `unnest()` cho suggest. Phase 6+ nếu cần full-text → tsvector |

## Parallel Coordination Notes

- **No dependency on other Phase 3–9 streams.**
- **Reference Phase 3** form pattern + Server Action pattern (don't import — copy-adapt OK)
- **Phase 7 (SEO)** adds `generateMetadata` to `app/[locale]/news/[slug]/page.tsx` — Phase 4 chỉ adds CSS class wrapper
- **Phase 8 (i18n EN)** translates `news.*` keys AFTER Phase 4 stabilizes
- **`components/tiptap-editor.tsx`** is technically shared but only Phase 4 creates/uses it in this plan
