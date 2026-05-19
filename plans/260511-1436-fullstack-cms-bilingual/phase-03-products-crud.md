---
phase: 3
title: "Products CRUD"
status: completed
priority: P1
effort: "5d"
dependencies: [2]
execution: parallel
stream: A
---

# Phase 3: Products CRUD (Parallel Stream A)

## Overview

Build admin CRUD đầy đủ cho Products entity. Pattern này (bilingual form + Server Actions + audit + revalidateTag + image upload) sẽ được references bởi streams khác.

**Parallel execution:** Chạy đồng thời với Phase 4, 5, 6, 7, 8, 9. Owns toàn bộ `app/admin/products/*` + `lib/data/products.ts` + `lib/validation/product-schema.ts` + `app/admin/_actions/products.ts`. KHÔNG edit shared files (sidebar, messages/vi.json common namespace, catalog schema).

## File Ownership (NO OTHER STREAM TOUCHES)

- `app/admin/products/page.tsx`
- `app/admin/products/new/page.tsx`
- `app/admin/products/[id]/edit/page.tsx`
- `app/admin/products/_components/*`
- `app/admin/_actions/products.ts`
- `lib/validation/product-schema.ts`

**Reads from (shared, do not modify):**
- `lib/db/schema/catalog.ts` (products table — FROZEN by Phase 2)
- `lib/data/products.ts` (Phase 2 created; Phase 3 may add `getProductById` if needed)
- `app/admin/_actions/audit.ts`
- `app/api/upload/route.ts`
- `app/admin/_components/admin-shell.tsx`

**Writes to (own namespace only — Updated Session 2 F11):**
- `messages/vi/product.json` (public-side product i18n keys)
- `messages/vi/admin-products.json` (admin form labels, error messages)

## Requirements

**Functional:**
- `/admin/products` list view với TanStack Table (sort, filter, paginate, thumbnail preview)
- `/admin/products/new` + `/admin/products/[id]/edit` bilingual VI+EN form
- Image upload Vercel Blob multi-file với alt text bilingual required
- Server Actions: `createProduct`, `updateProduct`, `deleteProduct`
- Sau mutation: `revalidateTag('products')` + `revalidateTag(\`product:${slug}\`)`
- Audit log mỗi mutation (diff jsonb)
- Slug auto-generate từ `name.vi` với manual override
- Slug uniqueness validation (DB constraint + Zod refine)

**Non-functional:**
- Form validation Zod, error inline
- Optimistic UI cho delete với rollback
- Image upload progress indicator
- useFieldArray cho `bullets`, `specs`, `images` (nested arrays)

## Architecture

```
app/admin/products/
├── page.tsx                  list + DataTable
├── new/page.tsx              ProductForm (mode=create)
├── [id]/edit/page.tsx        ProductForm (mode=edit, defaults from DB)
└── _components/
    ├── product-form.tsx      bilingual fields, react-hook-form + zod
    ├── product-columns.tsx   TanStack columns
    └── image-uploader.tsx    multi-file upload với alt input

app/admin/_actions/products.ts:
  createProduct, updateProduct, deleteProduct

lib/validation/product-schema.ts:
  Zod schema shared bởi form + action
```

**Bilingual form pattern (FROZEN — other CRUD streams reference):**
```tsx
<Tabs defaultValue="vi">
  <TabsList>
    <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
    <TabsTrigger value="en">English</TabsTrigger>
  </TabsList>
  <TabsContent value="vi">
    <Input {...register('name.vi', { required: true })} />
    <Textarea {...register('desc.vi')} />
  </TabsContent>
  <TabsContent value="en">
    <Input {...register('name.en')} placeholder="Optional, fallback to VI" />
    <Textarea {...register('desc.en')} />
  </TabsContent>
</Tabs>
```

**Server Action pattern — Updated Session 2 (F5):** Use `defineAdminAction` HOF from `lib/auth/define-admin-action.ts` (Phase 2). The wrapper handles auth + transaction + (optionally) audit inside transaction. ESLint enforces this — bare `export async function` in `app/admin/_actions/*` will fail build.

```ts
'use server';
import { defineAdminAction } from '@/lib/auth/define-admin-action';
import { productSchema } from '@/lib/validation/product-schema';

export const createProduct = defineAdminAction(['admin', 'editor'], async (session, input) => {
  const parsed = productSchema.parse(input);
  // Inside transaction (defineAdminAction wraps in db.transaction)
  const [row] = await tx.insert(products).values({ ...parsed, updatedBy: session.user.id }).returning();
  await logAudit({ action: 'create', entity: 'product', entityId: row.id, diff: parsed });
  revalidateTag('products');
  revalidateTag(`product:${row.slug}`);
  return { ok: true, id: row.id };
});
```

## Related Code Files

**Create:**
- `app/admin/products/page.tsx` (overwrites Phase 2 STUB)
- `app/admin/products/new/page.tsx`
- `app/admin/products/[id]/edit/page.tsx`
- `app/admin/products/_components/product-form.tsx`
- `app/admin/products/_components/product-columns.tsx`
- `app/admin/products/_components/image-uploader.tsx`
- `app/admin/_actions/products.ts`
- `lib/validation/product-schema.ts` (fills Phase 2 stub)

**Modify:**
- `messages/vi.json` → add keys to `product.*` namespace only

## Implementation Steps

1. **Zod schema** (`lib/validation/product-schema.ts`)
   - `productSchema`: slug, series (enum F|Astro), axes, display, badge, tag {vi,en}, name {vi:required,en:optional}, desc {vi,en}, bullets array, specs array of {l,v}, images array of {url, alt:{vi:required,en:required}}, status enum, sort
   - Slug refine: must be unique (server-side check passing current id)
   - `createProductSchema` = productSchema (no id)
   - `updateProductSchema` = productSchema with id required

2. **Server Actions** (`app/admin/_actions/products.ts`)
   - `requireRole(['admin', 'editor'])` helper (consider moving to shared `lib/auth/require.ts` if not already in Phase 2)
   - `createProduct(input)` — pattern frozen above
   - `updateProduct(id, input)` — capture old values for diff, audit log
   - `deleteProduct(id)` — hard delete + audit log
   - All revalidateTag

3. **List page** (`app/admin/products/page.tsx`)
   - Server component: `await db.select().from(products).orderBy(desc(products.updatedAt))`
   - Render TanStack Table client component with columns
   - "New product" button → `/admin/products/new`
   - Search box (client-side filter trên small dataset)

4. **Columns** (`product-columns.tsx`)
   - thumbnail (first image) / name.vi / series / status badge / updatedAt / actions menu (edit/delete)
   - Delete với confirm dialog (shadcn AlertDialog) + optimistic UI

5. **Product form** (`product-form.tsx`)
   - Bilingual tabs (VI/EN) per text field
   - Fields: slug (auto-generate từ name.vi, manual override), series select, axes, display, badge, tag {vi,en}, name {vi,en}, desc {vi,en}, bullets useFieldArray, specs useFieldArray of {l,v}, images via ImageUploader, status, sort
   - Submit → Server Action
   - Show validation errors inline
   - Submit button disable while pending

6. **Image uploader** (`image-uploader.tsx`) — **Updated Session 2 (F4, F8)**
   - **Client-direct-upload pattern** via `@vercel/blob/client` upload():
     ```ts
     import { upload } from '@vercel/blob/client';
     const blob = await upload(file.name, file, {
       access: 'public',
       handleUploadUrl: '/api/upload',  // Phase 2 issues signed token
       contentType: file.type,
     });
     // blob.url is the public URL
     ```
   - **Reject SVG client-side** (`file.type === 'image/svg+xml'`) before upload kicks off — defense in depth (Phase 2 also rejects server-side via `allowedContentTypes`).
   - Whitelist client: `image/png`, `image/jpeg`, `image/webp` only.
   - Preview thumbnails + alt text input bilingual cho mỗi image
   - Store array `{ url, alt: {vi, en} }` vào form state
   - Reorder drag-and-drop (optional, defer if time tight)

7. **Edit page** (`[id]/edit/page.tsx`)
   - Fetch product by id (server component)
   - Pass to ProductForm with `defaultValues`
   - Same form, mode='edit'

8. **i18n keys**
   - Add `messages/vi.json` → `product.*`: `list.title`, `list.empty`, `form.fields.name`, `form.fields.desc`, `form.errors.slugTaken`, `delete.confirm`, etc.
   - DO NOT add anything outside `product.*` namespace

9. **Smoke test (own scope)**
   - Login với admin user
   - Create product mới → check DB + public page có hiện sau revalidate
   - Edit → check diff đúng trong audit
   - Delete → confirm + check audit
   - Upload 3 images với bilingual alt → check Blob
   - Slug collision test → expect Zod error

## Success Criteria

- [ ] `/admin/products` list table với sort/filter
- [ ] Create/Edit/Delete product end-to-end
- [ ] Image upload Vercel Blob work với bilingual alt
- [ ] Bilingual form: VI required, EN optional
- [ ] Slug uniqueness validation (DB constraint + Zod refine)
- [ ] Audit log insert mỗi mutation với diff đúng
- [ ] `revalidateTag` trigger ISR refresh public `/products` + `/products/[slug]`
- [ ] useFieldArray cho bullets/specs/images work với 20+ entries
- [ ] Mobile-responsive (uses Phase 2 admin shell)
- [ ] `tsc --noEmit` pass, no warnings

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Form state phức tạp với nested arrays | useFieldArray + zod array. Test với 20+ specs |
| Slug collision khi edit | Zod refine kiểm slug khác id hiện tại; DB unique constraint as backstop |
| Image upload Vercel Blob fail giữa chừng | Optimistic add to preview, retry button. Orphan blobs cleanup Phase 10 |
| Server Action không trigger revalidate đúng tag | Console log tag invalidate, test với DevTools Network tab |
| Other stream conflict on shared schema | Don't alter `lib/db/schema/catalog.ts` — escalate to user if column truly missing |
| Other stream conflict on messages/vi.json | Only edit `product.*` namespace; commit messages clearly say "product i18n keys only" |

## Parallel Coordination Notes

- **No dependency on other Phase 3–9 streams** — can start same day as Phase 2 completes.
- **Output reference for other CRUD streams (Phases 4, 5, 6):** Form pattern, Server Action pattern, image upload pattern. They reference but don't import.
- **Phase 7 (SEO)** adds `generateMetadata` to `app/[locale]/products/[slug]/page.tsx` — Phase 3 doesn't touch public pages (only admin).
- **Phase 8 (i18n EN)** translates `product.*` namespace AFTER Phase 3 stabilizes keys.
