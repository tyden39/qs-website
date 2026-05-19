---
phase: 2
title: "Schema + Data Layer + Admin Shell"
status: pending
priority: P1
effort: "7d"  # Red Team Session 2 (F6): re-estimated to absorb content extraction work
dependencies: [1]
execution: sequential
---

# Phase 2: Schema + Data Layer + Admin Shell

## Overview

**The single sequential bottleneck between Foundation and parallel fan-out.** Pre-bakes ALL cross-cutting infrastructure so Phases 3–9 can run independently with minimal file conflicts:

**Red Team Session 2 additions:**
- **F6:** Step 0 NEW — extract hardcoded content from `app/{news,applications,services}/[slug]/page.tsx` into `data/*.ts` modules (re-estimate Phase 2 5d→7d)
- **F2:** `lib/db/client.ts` uses `drizzle-orm/neon-serverless` (Pool), not `neon-http`
- **F5:** Phase 2 MUST create `lib/auth/require.ts` + `lib/auth/define-admin-action.ts` (HOF) + eslint rule
- **F8:** `/api/upload/route.ts` becomes signed-token issuer for Vercel Blob client-direct-upload (no body through Server Action)
- **F11:** `messages/vi.json` skeleton split into per-namespace files (`messages/vi/common.json`, `messages/vi/admin-products.json`, etc.); next-intl config merges at build
- **F12:** Phase 2 creates `lib/email/{client,send}.ts` skeleton (Resend init + typed sendEmail signature)
- **F13:** Better Auth cookie cache plugin enabled (Phase 1 setup); `requireRole` wraps with `React.cache()` for per-request memoization


1. Finalize catalog schema for ALL entities (products, news, applications, services, datasheets, leads, audit_log) — schemas locked here, no stream alters later
2. Build shared data access helpers (`pickLocale`, i18n field utility, cache pattern reference)
3. Seed script reading `data/*.ts` → DB (idempotent)
4. Refactor ALL public pages to fetch DB (not per-entity per-stream — done centrally to avoid coordination pain)
5. Admin shell layout + auth gate + login + create-admin script
6. Skeleton routes for all admin modules (placeholders, streams flesh out in Phase 3–9)
7. Shared infrastructure: `/api/upload`, audit logging helper, validation schema stubs, sidebar with all nav entries

Sau phase này:
- Public site đã chạy 100% từ DB
- Admin login work, shell renders, sidebar shows all entities (links 404 cho modules chưa implement)
- Parallel streams chỉ cần fill in admin/<entity>/* và admin/_actions/<entity>.ts

## Requirements

**Functional:**
- Schema catalog đầy đủ cho 5 content entities (products, news, applications, services, datasheets) + leads + audit_log + invites
- JSON column cho translatable fields (`name`, `desc`, `body_html`, etc.) — locked structure
- Seed script idempotent — chạy nhiều lần không duplicate
- Mọi public page (`/`, `/products`, `/products/[slug]`, `/news`, `/news/[slug]`, `/applications`, `/applications/[slug]`, `/services`, `/services/[slug]`, `/downloads`, `/downloads/datasheets`, `/about`, `/contact`) render từ DB
- `generateStaticParams` × 2 locales × N slugs
- ISR với `'use cache'` + cacheTag per entity
- Fallback `en → vi` nếu EN field null
- `/login` form work (Better Auth email+password)
- Middleware: `/admin/*` chưa auth → redirect `/login`; role `customer` → 403
- `/admin/dashboard` placeholder renders với entity counts
- Admin shell: sidebar + topbar + user menu + locale switcher (admin UI)
- Sidebar nav: Dashboard / Products / News / Applications / Services / Datasheets / Leads / Audit / Users / Settings (all linkable, modules show "Coming soon" cho streams chưa land)
- `scripts/create-admin.ts` env-driven idempotent (Better Auth API)

**Non-functional:**
- Build time tăng không quá 2× so với baseline
- Lighthouse Performance ≥ 90 trên home + product detail
- `yarn build` pass, `tsc --noEmit` pass

## Architecture

```
lib/db/schema/
├── auth.ts         users, sessions, accounts, verifications, invites
├── catalog.ts      products, applications, services, news, datasheets (FROZEN columns)
└── runtime.ts      leads, audit_log

lib/data/
├── i18n-field.ts   pickLocale helper
├── products.ts     getAllProducts(locale), getProductBySlug(slug, locale)
├── news.ts
├── applications.ts
├── services.ts
└── datasheets.ts
   (All use 'use cache' directive + cacheTag + cacheLife per Session 1 decision)

scripts/
├── seed.ts         idempotent, reads data/*.ts → DB
└── create-admin.ts ADMIN_EMAIL + ADMIN_PASSWORD env, Better Auth API

app/[locale]/(auth)/
└── login/
    ├── page.tsx
    └── login-form.tsx

app/admin/
├── layout.tsx                  auth gate role check, AdminShell
├── dashboard/page.tsx          entity counts placeholder
├── products/page.tsx           STUB "Coming soon" (Phase 3 implements)
├── news/page.tsx               STUB
├── applications/page.tsx       STUB
├── services/page.tsx           STUB
├── datasheets/page.tsx         STUB
├── leads/page.tsx              STUB
├── audit/page.tsx              STUB
├── users/page.tsx              STUB
├── settings/page.tsx           STUB
├── _components/
│   ├── admin-shell.tsx         sidebar + topbar + Sheet for mobile
│   ├── sidebar.tsx             ALL nav links (placeholder for not-yet-impl)
│   └── user-menu.tsx           logout, profile
└── _actions/
    └── audit.ts                logAudit helper (shared)

app/api/
├── auth/[...all]/route.ts      Better Auth handler
└── upload/route.ts             SHARED upload endpoint (Vercel Blob)

lib/validation/
├── product-schema.ts           STUB (Phase 3 fills)
├── news-schema.ts              STUB (Phase 4 fills)
├── application-schema.ts       STUB (Phase 5 fills)
├── service-schema.ts           STUB (Phase 5 fills)
├── datasheet-schema.ts         STUB (Phase 6 fills)
└── lead-schema.ts              STUB (Phase 6 fills)

messages/vi.json    namespace skeleton:
  common, nav, home, product, news, application, service,
  contact, admin, auth, seo

app/[locale]/                   ALL public pages refactored to fetch DB
├── page.tsx                    home — getAllProducts + recent news
├── products/page.tsx           list
├── products/[slug]/page.tsx    detail (generateStaticParams)
├── news/page.tsx
├── news/[slug]/page.tsx        (read body_html.vi for now, body_json available)
├── applications/page.tsx
├── applications/[slug]/page.tsx
├── services/page.tsx
├── services/[slug]/page.tsx
├── downloads/page.tsx
├── downloads/datasheets/page.tsx
├── about/page.tsx
└── contact/page.tsx            (form remains static — Phase 6 wires)

middleware.ts                   next-intl + auth gate /admin (Node runtime)
```

**Bilingual data pattern (FROZEN — streams reuse):**
```ts
function pickLocale<T>(field: { vi: T; en?: T } | null, locale: 'vi' | 'en'): T | null {
  if (!field) return null;
  return field[locale] ?? field.vi ?? null;
}
```

**Cache pattern (FROZEN — streams reuse):**
```ts
import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife } from 'next/cache';

export async function getAllProducts(locale: Locale) {
  'use cache';
  cacheTag('products');
  cacheLife('hours');
  const rows = await db.select().from(products).where(eq(products.status, 'published')).orderBy(products.sort);
  return rows.map(r => transformProduct(r, locale));
}
```

**Admin shell auth gate (FROZEN):**
```tsx
// app/admin/layout.tsx
export default async function AdminLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login?callbackUrl=/admin/dashboard');
  if (!['admin', 'editor'].includes(session.user.role)) redirect('/403');
  return <AdminShell user={session.user}>{children}</AdminShell>;
}
```

**Sidebar nav (FROZEN — streams DO NOT edit this file):**
```tsx
const nav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Box },
  { href: '/admin/news', label: 'News', icon: Newspaper },
  { href: '/admin/applications', label: 'Applications', icon: Cog },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/datasheets', label: 'Datasheets', icon: FileText },
  { href: '/admin/leads', label: 'Leads', icon: Inbox },
  { href: '/admin/audit', label: 'Audit', icon: ScrollText, role: 'admin' },
  { href: '/admin/users', label: 'Users', icon: Users, role: 'admin' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, role: 'admin' },
];
```

## Related Code Files

**Create:**
- `lib/db/schema/catalog.ts` (FULL columns — locked)
- `lib/db/schema/runtime.ts` (leads, audit_log, invites)
- `lib/data/i18n-field.ts`
- `lib/data/products.ts`
- `lib/data/news.ts`
- `lib/data/applications.ts`
- `lib/data/services.ts`
- `lib/data/datasheets.ts`
- `scripts/seed.ts`
- `scripts/create-admin.ts`
- `app/[locale]/(auth)/login/page.tsx`
- `app/[locale]/(auth)/login/login-form.tsx`
- `app/(error)/403/page.tsx`
- `app/admin/layout.tsx`
- `app/admin/dashboard/page.tsx`
- `app/admin/{products,news,applications,services,datasheets,leads,audit,users,settings}/page.tsx` (STUBS)
- `app/admin/_components/admin-shell.tsx`
- `app/admin/_components/sidebar.tsx`
- `app/admin/_components/user-menu.tsx`
- `app/admin/_actions/audit.ts`
- `app/api/upload/route.ts`
- `lib/validation/{product,news,application,service,datasheet,lead}-schema.ts` (STUBS)

**Modify:**
- `middleware.ts` — auth gate for `/admin/*`
- All `app/[locale]/**/page.tsx` — replace `import { products } from "@/data/products"` → `await getAllProducts(locale)`
- `components/SearchPanel.tsx` — derive featured from DB
- `messages/vi.json` — namespace skeleton for all entities

**Delete (after smoke test):**
- `data/products.ts`
- `data/news.ts`
- `data/services.ts`
- (Keep in git history; revert if needed)

## Implementation Steps

### Step 0: Content Extraction (NEW — Red Team Session 2 F6)

**Why:** Phase 2 seed previously assumed `data/applications.ts`, `data/datasheets.ts`, and a body field in `data/news.ts` — none exist. Content is hardcoded in `app/{news,applications,services}/[slug]/page.tsx`. Extract before seed.

1. **Extract news bodies** (~2h)
   - Open each `app/news/[slug]/page.tsx`
   - Copy body JSX → render to HTML string (or paste raw HTML if already HTML in JSX)
   - Extend `data/news.ts` type: add `body: string` (HTML), keep VI-only for now
   - Result: every news entry now has body content

2. **Create `data/applications.ts`** (~3h)
   - Open each `app/applications/[slug]/page.tsx`
   - Extract: title, summary, hero_image, workflow array, specs array, deployments array
   - Define `type Application = {...}` matching Phase 2 schema shape
   - Result: 7 application entries with full structure

3. **Create `data/datasheets.ts`** (~1h)
   - Open `app/downloads/datasheets/page.tsx` (or wherever PDF list lives)
   - Extract: name, file path (placeholder PDFs OK — real PDFs uploaded post-launch), product slug, category, lang
   - Define `type Datasheet = {...}`
   - Result: sample datasheet entries pointing at placeholder URLs

4. **Verify extracted data renders** — Smoke test: each `data/*.ts` import in a throwaway TS file, log structure, ensure parseable.

### Steps 1–17 (existing, after Step 0 completes)

1. **Catalog schema full columns** (`lib/db/schema/catalog.ts`)
   - Products: id, slug (unique), series, axes, display, badge, tag jsonb, name jsonb, desc jsonb, bullets jsonb[], specs jsonb[], images jsonb[], status, sort, publishedAt, createdAt, updatedAt, updatedBy
   - News: id, slug, title jsonb, excerpt jsonb, body_html jsonb, body_json jsonb (Tiptap), cover_image, tags text[], publishedAt, status, audit fields
   - Applications: id, slug, title jsonb, summary jsonb, hero_image, workflow jsonb[], specs jsonb[], deployments jsonb[]
   - Services: id, slug, title jsonb, hero jsonb, process jsonb[], included jsonb[], faqs jsonb[], tiers jsonb[]
   - Datasheets: id, name jsonb, file_url, product_id (fk products), category, lang ('vi'|'en'|'both'), size_bytes
   - **LOCKED:** Phase 3–9 streams do NOT alter these columns

2. **Runtime schema** (`lib/db/schema/runtime.ts`)
   - leads: id, source, name, email, phone, company, message, payload jsonb, status enum, assignedTo (fk users), locale, ip, userAgent, createdAt
   - audit_log: id, actorId, action, entity, entityId, diff jsonb, createdAt
   - invites: id, email, token, role, expiresAt, used, createdBy, createdAt

3. **Generate + run migration**
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

4. **Data access layer** (`lib/data/*.ts`)
   - 5 files (products, news, applications, services, datasheets)
   - Each: `getAll<Entity>(locale)`, `get<Entity>BySlug(slug, locale)`, `get<Entity>Count()` for dashboard
   - All use `'use cache'` + `cacheTag` + `cacheLife('hours')` per Session 1 decision
   - `lib/data/i18n-field.ts` exports `pickLocale<T>()`

5. **Seed script** (`scripts/seed.ts`) — **Updated Session 2 (F1, F9)**
   - Import `data/products.ts`, `data/news.ts` (now has `body` field after Step 0), `data/services.ts`, `data/applications.ts` (created in Step 0), `data/datasheets.ts` (created in Step 0)
   - Insert với `ON CONFLICT (slug) DO UPDATE SET ...` (idempotent)
   - VI fields = data hiện tại, EN fields = null (Phase 8 dịch sau)
   - **News body:** seed inserts `body_html.vi` (HTML extracted from page.tsx in Step 0); `body_json.vi` left NULL — Tiptap parses HTML to JSON client-side on first admin re-edit (DOM available, no `@tiptap/html` server-side dependency needed)
   - **Sanitize at seed (F3):** Run extracted HTML through `isomorphic-dompurify` `sanitize(html, { ALLOWED_TAGS: [...] })` before insert. Strip any `<script>`, event handlers, javascript: URLs.
   - Run: `tsx scripts/seed.ts`
   - Output: `Inserted N products, M news, K services, L applications, P datasheets`

6. **Create-admin script** (`scripts/create-admin.ts`)
   - Read `ADMIN_EMAIL`, `ADMIN_PASSWORD` từ env
   - Call Better Auth `signUp.email()` với role override = 'admin'
   - Idempotent: nếu email tồn tại → update password + role
   - Run: `ADMIN_EMAIL=... ADMIN_PASSWORD=... tsx scripts/create-admin.ts`

7. **Refactor public pages to DB**
   - Replace mọi `import { products } from "@/data/products"` → `await getAllProducts(locale)`
   - `generateStaticParams` query DB cho slug × locales
   - Apply `pickLocale` helper khi render
   - News detail render `body_html.vi` qua `dangerouslySetInnerHTML` (Phase 4 wires Tiptap edit but display logic done now)
   - **Test mọi URL còn render** trước khi proceed

8. **Login page + middleware role gate**
   - `app/[locale]/(auth)/login/page.tsx` — shadcn Form + Better Auth client `signIn.email()`
   - Redirect: `?callbackUrl=` query → callback, mặc định `/admin/dashboard`
   - Middleware: read session từ Better Auth, check `/admin/*` requires role in `[admin, editor]` (Node runtime per Session 1 decision)

9. **Admin shell**
   - `app/admin/layout.tsx`: auth gate + AdminShell wrapper
   - `app/admin/_components/admin-shell.tsx`: sidebar + topbar
   - `app/admin/_components/sidebar.tsx`: ALL nav links upfront (LOCKED — streams DO NOT edit)
   - `app/admin/_components/user-menu.tsx`: logout, profile
   - Use shadcn `Sheet` cho mobile sidebar

10. **Admin dashboard placeholder**
    - `app/admin/dashboard/page.tsx`: Card grid với entity counts (products, news, applications, services, datasheets, leads, audit log entries)
    - Each card linkable đến `/admin/<entity>`

11. **Admin module STUB pages**
    - Mỗi `app/admin/<entity>/page.tsx` render placeholder: "Module coming soon — Phase X implements"
    - Streams Phase 3–9 overwrite các file này (clean ownership)

12. **Shared upload endpoint** (`app/api/upload/route.ts`) — **Updated Session 2 (F4, F8)**
    - **PATTERN CHANGE:** Client-direct-upload via `@vercel/blob/client` handleUpload — files go browser→Blob directly, NEVER through Server Action body. Bypasses 1MB Server Action limit and 4.5MB function limit. Supports up to 5TB.
    - `/api/upload/route.ts` now issues SIGNED TOKENS only (not file bytes):
      ```ts
      import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
      export async function POST(request: Request) {
        const body = (await request.json()) as HandleUploadBody;
        const jsonResponse = await handleUpload({
          body,
          request,
          onBeforeGenerateToken: async (pathname, clientPayload) => {
            const session = await requireRole(['admin', 'editor']);
            return {
              allowedContentTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'], // F4: NO svg, NO image/*
              maximumSizeInBytes: 50 * 1024 * 1024,  // 50MB cap
              tokenPayload: JSON.stringify({ userId: session.user.id }),
            };
          },
          onUploadCompleted: async ({ blob, tokenPayload }) => {
            // F4: magic-byte sniff post-upload (worker function or queue)
            // Log uploads for orphan-cleanup audit
          },
        });
        return Response.json(jsonResponse);
      }
      ```
    - **F4 server-side validation:** explicit whitelist `[image/png, image/jpeg, image/webp, application/pdf]`. NO `image/*` wildcard. NO svg. After upload, sniff magic bytes (PNG `89 50 4E 47`, JPEG `FF D8 FF`, WebP `RIFF....WEBP`, PDF `%PDF-`) — quarantine + delete if mismatch.
    - Streams reuse — không copy logic

13. **Audit helper** (`app/admin/_actions/audit.ts`)
    - `logAudit({ action, entity, entityId, diff })` — session.user.id as actor
    - Streams import this — không re-implement

13b. **Auth helpers** (`lib/auth/require.ts` + `lib/auth/define-admin-action.ts`) — **NEW Session 2 (F5, F13)**
    - `lib/auth/require.ts`:
      ```ts
      import { cache } from 'react';
      import { auth } from './server';
      export const getCachedSession = cache(async () => {
        return auth.api.getSession({ headers: await headers() });
      });
      export async function requireRole(roles: Array<'admin' | 'editor' | 'customer'>) {
        const session = await getCachedSession();
        if (!session) throw new Response('Unauthorized', { status: 401 });
        if (!roles.includes(session.user.role)) throw new Response('Forbidden', { status: 403 });
        return session;
      }
      ```
    - `lib/auth/define-admin-action.ts` — **HOF that wraps every Server Action**:
      ```ts
      export function defineAdminAction<Args extends any[], Result>(
        roles: Array<'admin' | 'editor'>,
        handler: (session: Session, ...args: Args) => Promise<Result>
      ) {
        return async (...args: Args): Promise<Result> => {
          const session = await requireRole(roles);
          // All audit logging inside a transaction with the handler
          return db.transaction(async (tx) => {
            const result = await handler(session, ...args);
            return result;
          });
        };
      }
      ```
    - **eslint rule:** add to `.eslintrc.json` custom rule: any export in `app/admin/_actions/*.ts` MUST be a `defineAdminAction(...)` call. Build fails otherwise.
    - All Phase 3–9 server actions MUST use `defineAdminAction` instead of inline `requireRole` checks.

13c. **Email infrastructure** (`lib/email/client.ts` + `lib/email/send.ts`) — **NEW Session 2 (F12)**
    - `lib/email/client.ts`: `export const resend = new Resend(process.env.RESEND_API_KEY!);`
    - `lib/email/send.ts`: typed wrapper `export async function sendEmail<T extends keyof EmailTemplateMap>(template: T, props: EmailTemplateMap[T], to: string): Promise<void>`
    - Templates added per stream: Phase 6 (lead-notification, newsletter-confirm), Phase 9 (admin-invite)

14. **Validation schema stubs** (`lib/validation/*.ts`)
    - Each stream sẽ flesh out — chỉ tạo file stub có default export Zod object empty
    - Avoids "file not found" when streams import early

15. **messages/vi/* per-namespace files** — **Updated Session 2 (F11)**
    - **Pattern change:** Split single `messages/vi.json` into per-namespace files to eliminate concurrent-commit conflicts:
      ```
      messages/vi/
      ├── common.json       Phase 2 creates, filled with common.save/cancel/delete/etc.
      ├── nav.json          Phase 2 creates
      ├── home.json         Phase 2 creates
      ├── auth.json         Phase 2 creates (login/logout/etc.)
      ├── seo.json          Phase 2 creates (siteName/siteDescription)
      ├── product.json      Phase 3 fills
      ├── news.json         Phase 4 fills
      ├── application.json  Phase 5 fills
      ├── service.json      Phase 5 fills
      ├── contact.json      Phase 6 fills
      ├── downloads.json    Phase 6 fills
      ├── admin-leads.json  Phase 6 fills
      ├── admin-datasheets.json Phase 6 fills
      ├── admin-products.json Phase 3 fills
      ├── admin-news.json   Phase 4 fills
      ├── admin-applications.json Phase 5 fills
      ├── admin-services.json Phase 5 fills
      ├── admin-audit.json  Phase 9 fills
      ├── admin-users.json  Phase 9 fills
      ├── admin-settings.json Phase 9 fills
      └── auth-invite.json  Phase 9 fills
      ```
    - **next-intl config merge** in `lib/i18n/request.ts`:
      ```ts
      import { getRequestConfig } from 'next-intl/server';
      import fs from 'node:fs/promises';
      import path from 'node:path';

      export default getRequestConfig(async ({ locale }) => {
        const dir = path.join(process.cwd(), `messages/${locale}`);
        const files = await fs.readdir(dir);
        const messages: Record<string, any> = {};
        for (const file of files) {
          if (!file.endsWith('.json')) continue;
          const namespace = file.replace(/\.json$/, '').replace(/-/g, '.');
          const content = JSON.parse(await fs.readFile(path.join(dir, file), 'utf-8'));
          // Build nested namespace from filename
          const keys = namespace.split('.');
          let target = messages;
          for (let i = 0; i < keys.length - 1; i++) {
            target[keys[i]] ??= {};
            target = target[keys[i]];
          }
          target[keys[keys.length - 1]] = content;
        }
        return { locale, messages };
      });
      ```
    - Per-file ownership = git-friendly; each stream commits only its file. Phase 8 EN structure mirrors `messages/en/`.

16. **Build performance check**
    - `yarn build` time so với baseline
    - Nếu > 2× → check queries có batch không

17. **Cleanup**
    - Sau khi tất cả page work + manual smoke test → xóa `data/products.ts`, `data/news.ts`, `data/services.ts`
    - Update `docs/system-architecture.md` reflect DB-backed

## Success Criteria

- [ ] Catalog schema 5 entities + leads + audit_log + invites — migrations applied
- [ ] Seed script idempotent (run 2× same result), populates 6 products + 7 news + 7 applications + 1 service + sample datasheets
- [ ] News bodies migrated HTML → Tiptap JSON (verify by SQL: `SELECT slug, body_json IS NOT NULL FROM news`)
- [ ] All public routes render từ DB (verify with query log)
- [ ] `generateStaticParams` × 2 locales work
- [ ] ISR `revalidateTag` work (test: update DB → tag invalidate → page refresh)
- [ ] Fallback EN→VI work khi EN null
- [ ] `data/*.ts` deleted, không còn import nào
- [ ] `/login` work với email/password
- [ ] Middleware redirect chưa auth + role gate
- [ ] `/admin/dashboard` render với entity counts
- [ ] All 10 admin STUB routes render placeholder (Products/News/Apps/Services/Datasheets/Leads/Audit/Users/Settings)
- [ ] Sidebar shows all entries, mobile Sheet work
- [ ] `scripts/create-admin.ts` creates/updates admin user idempotent
- [ ] `/api/upload` accepts image + PDF với auth check
- [ ] `logAudit` helper callable from any action
- [ ] All `lib/validation/*-schema.ts` stubs exist
- [ ] `messages/vi.json` namespaces defined
- [ ] `yarn build` zero warnings, `tsc --noEmit` zero errors
- [ ] `docs/system-architecture.md` updated

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Schema "locked" decision wrong — stream needs column later | Phase 2 reviews ALL old phase files for column requirements before freezing. Streams escalate to user nếu thực sự cần add column |
| Build time bùng nổ với generateStaticParams × 2 locales | Limit fetch trong generateStaticParams chỉ select `slug`; full data fetch trong page |
| Seed script run lại tạo duplicate | `ON CONFLICT (slug) DO UPDATE` — idempotent |
| Public page refactor breaks existing links | Test mọi route trước khi delete `data/*.ts`. Keep in git history as safety net |
| Better Auth session check trong middleware | Test sớm — fallback dùng API route check nếu Node middleware fail |
| Admin shell STUB pages link to `/admin/<entity>` 404 nội bộ (TanStack Table chưa có) | STUB renders "Coming soon" — explicit messaging, no 404 |
| News HTML rich content render unsafe | `dangerouslySetInnerHTML` chỉ cho admin-authored content (Phase 4 reaffirms). Tailwind typography styles `.prose` |
| `app/api/upload` shared by all streams | Documented contract; auth + type check upfront. Streams call same endpoint |
| Sidebar links ordering bikeshed | LOCKED in Phase 2; if change needed, do in Phase 10 |
| `messages/vi.json` merge conflict between streams | Each stream owns its OWN namespace; no two streams write same key |

## Notes

- **This phase is the parallelization enabler.** Spending an extra day here to pre-bake shared infra saves 5× across 7 parallel streams.
- KHÔNG implement CRUD any entity here — streams do that.
- KHÔNG translate UI strings to EN — Phase 8 does that.
- KHÔNG add SEO metadata — Phase 7 does that (but `metadataBase` set up here).
