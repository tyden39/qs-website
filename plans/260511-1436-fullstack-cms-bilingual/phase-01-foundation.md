---
phase: 1
title: "Foundation"
status: pending
priority: P1
effort: "5d"
dependencies: []
execution: sequential
---

# Phase 1: Foundation

## Overview

Bootstrap toàn bộ infra layer: Neon Postgres, Drizzle ORM, Better Auth, next-intl, Vercel Blob, env config, shadcn/ui. Sau phase này codebase chưa thay đổi business logic nhưng đã sẵn sàng cho phase 2 (sequential bottleneck before parallel fan-out).

**Execution model:** Sequential — blocks Phase 2. Phase 2 then blocks parallel streams 3–9.

## Requirements

**Functional:**
- DB connection healthy với Neon Postgres
- Drizzle schema khởi tạo + migration cơ chế chạy
- Better Auth login/register/session work với cookie HttpOnly
- next-intl middleware xử lý locale routing (`/` = vi, `/en/*` = en)
- shadcn/ui installed + theme align với design system hiện có
- Vercel Blob token configured
- `.env.example` complete

**Non-functional:**
- `yarn build` pass zero warnings
- `tsc --noEmit` zero errors
- All secrets in `.env.local`, never committed
- DB connection pooling đúng cho serverless. **Updated Session 2 (F2):** Use `drizzle-orm/neon-serverless` (WebSocket Pool) NOT `neon-http` — Better Auth needs transactions and untagged-template support. Fluid Compute reuses instances so pool stays warm.

## Architecture

```
Next.js 16
├── lib/
│   ├── db/
│   │   ├── client.ts          drizzle({ schema })
│   │   ├── schema/
│   │   │   ├── auth.ts        users, sessions, accounts, verifications
│   │   │   ├── catalog.ts     products, applications, services, news, datasheets
│   │   │   └── runtime.ts     leads, audit_log
│   │   └── migrations/        drizzle-kit generated
│   ├── auth/
│   │   ├── server.ts          Better Auth server config
│   │   └── client.ts          Better Auth React client
│   ├── i18n/
│   │   ├── config.ts          locales = ['vi', 'en'], defaultLocale = 'vi'
│   │   ├── request.ts         next-intl getRequestConfig
│   │   └── routing.ts         routing config
│   └── blob.ts                Vercel Blob helpers
├── messages/
│   ├── vi.json                UI strings VI
│   └── en.json                UI strings EN
├── proxy.ts              next-intl + auth gate /admin
├── drizzle.config.ts
└── components/ui/             shadcn/ui copied
```

**i18n routing decision:**
- VI default = no prefix (`/products`, `/news/astro-12x`)
- EN = prefix `/en` (`/en/products`, `/en/news/astro-12x`)
- Slug giữ chung 2 locale
- next-intl `localePrefix: 'as-needed'`

**Auth decision:**
- Better Auth basic email+password, no magic link, no MFA
- Role enum: `admin | editor | customer` (default `customer`)
- Session: cookie HttpOnly, SameSite=Lax, 7 ngày
- Plugin: `admin` cho user management UI (built-in)

## Related Code Files

**Create:**
- `lib/db/client.ts`
- `lib/db/schema/auth.ts`
- `lib/db/schema/catalog.ts`
- `lib/db/schema/runtime.ts`
- `lib/auth/server.ts`
- `lib/auth/client.ts`
- `lib/i18n/config.ts`
- `lib/i18n/request.ts`
- `lib/i18n/routing.ts`
- `lib/blob.ts`
- `messages/vi.json`
- `messages/en.json`
- `proxy.ts`
- `drizzle.config.ts`
- `.env.example`
- `app/[locale]/layout.tsx` (wrap children với NextIntlClientProvider)

**Modify:**
- `app/layout.tsx` → minimal root (chuyển content sang `app/[locale]/layout.tsx`)
- `next.config.mjs` → thêm `createNextIntlPlugin`
- `package.json` → thêm deps
- `tsconfig.json` → path alias nếu cần
- All existing `app/*/page.tsx` → move under `app/[locale]/`

**Delete:** none in this phase

## Implementation Steps

1. **Provision Neon DB qua Vercel Marketplace**
   - `vercel link` project
   - Marketplace → Neon → provision
   - `vercel env pull .env.local` lấy `DATABASE_URL`

2. **Install dependencies** (versions pinned 2026-05-19 — see plan.md → Package Versions table)
   ```bash
   # Bump existing
   yarn add next@^16.2.6
   yarn add -D tailwindcss@^4.3.0 @tailwindcss/postcss@^4.3.0 @types/node@^25.9.0

   # F2: WebSocket pool driver, not neon-http
   yarn add drizzle-orm@^0.45.2 @neondatabase/serverless@^1.1.0 ws@^8.20.1
   yarn add -D @types/ws@^8.18.1 drizzle-kit@^0.31.10

   yarn add better-auth@^1.6.11
   yarn add -D @better-auth/cli@^1.4.21

   yarn add next-intl@^4.12.0
   yarn add @vercel/blob@^2.4.0

   # Zod 4 + matching hookform resolver v5 (breaking change vs v3 — see plan.md callouts)
   yarn add zod@^4.4.3 react-hook-form@^7.76.0 @hookform/resolvers@^5.2.2

   yarn add isomorphic-dompurify@^3.13.0  # F3: sanitize Tiptap HTML at write+read
   ```

3. **shadcn/ui init**
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add button input form label dialog dropdown-menu table card sheet sonner
   ```
   Align colors với existing tokens trong `app/globals.css` (qs-* palette).

4. **Drizzle config + schema khung**
   - `drizzle.config.ts` point tới `lib/db/schema/*`
   - Define minimal tables (Better Auth tự generate cho auth) — chưa cần CRUD column đầy đủ, chỉ enough để compile
   - **Updated Session 2 (F2):** `lib/db/client.ts` uses `drizzle-orm/neon-serverless` (Pool):
     ```ts
     import { Pool } from '@neondatabase/serverless';
     import { drizzle } from 'drizzle-orm/neon-serverless';
     const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
     export const db = drizzle({ client: pool, schema });
     ```

5. **Better Auth setup**
   - **Updated Session 2 (F13):** enable cookie cache plugin to avoid per-request DB queries:
     ```ts
     betterAuth({
       database: drizzle(db),
       plugins: [adminPlugin()],
       emailAndPassword: { enabled: true },
       session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },  // 5 min cache
     })
     ```
   - `lib/auth/client.ts`: `createAuthClient({ baseURL: env.NEXT_PUBLIC_APP_URL })`
   - Mount API: `app/api/auth/[...all]/route.ts` → `toNextJsHandler(auth)`
   - Generate Better Auth schema → Drizzle: `npx @better-auth/cli generate`

6. **next-intl setup**
   - `lib/i18n/routing.ts`: `defineRouting({ locales: ['vi', 'en'], defaultLocale: 'vi', localePrefix: 'as-needed' })`
   - `lib/i18n/request.ts`: getRequestConfig
   - `messages/vi.json` + `messages/en.json` (minimal keys: common.* nav.*)
   - Move `app/page.tsx`, `app/products/*`, `app/news/*`, etc. → `app/[locale]/*`
   - `app/[locale]/layout.tsx` wrap NextIntlClientProvider

7. **Proxy (Next 16 — replaces middleware.ts)**
   - **Updated Session 2 (F7):** Next 16 deprecates `middleware.ts` → use `proxy.ts`. Node runtime is default and not configurable; do NOT set `export const runtime`.
   - `proxy.ts` only handles: `createMiddleware(routing)` for locale routing. **DO NOT** do auth checks in proxy (per Next 16 guidance: proxy is for routing, not auth).
   - Auth gating moves to `app/admin/layout.tsx` (Server Component) where `auth.api.getSession()` runs once per page (Better Auth cookie cache plugin from step 5 prevents DB hammering).
   - Matcher exclude `/api/auth/*`, `/_next/*`, static files
   - `next.config.mjs`: enable `experimental: { useCache: true }` cho Cache Components (phase 2 cần)
   - **F3 addition:** Add CSP headers in `next.config.mjs`:
     ```ts
     headers: async () => [{
       source: '/(.*)',
       headers: [
         { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' blob: data: https://*.public.blob.vercel-storage.com; script-src 'self' 'nonce-{NONCE}'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.resend.com;" },
         { key: 'X-Content-Type-Options', value: 'nosniff' },
         { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
       ]
     }]
     ```

8. **Migration first run**
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

9. **Vercel Blob token**
   - Marketplace → Vercel Blob → provision
   - `vercel env pull` để có `BLOB_READ_WRITE_TOKEN`

10. **Verify**
    - `yarn dev` → home page render với locale routing
    - `/login` form hiện
    - Register test user → check users table
    - `tsc --noEmit` pass
    - `yarn build` pass

## Success Criteria

- [ ] Neon DB provisioned, `DATABASE_URL` trong `.env.local`
- [ ] Vercel Blob provisioned, token trong env
- [ ] Drizzle schema khung compile + migrate
- [ ] Better Auth: register + login + session cookie work
- [ ] next-intl routing: `/` VI, `/en` EN — both render
- [ ] Existing pages moved sang `app/[locale]/*`, still render
- [ ] shadcn/ui components installed, theme aligned
- [ ] middleware redirect `/admin` → `/login` khi chưa auth
- [ ] `yarn build` zero warnings, `tsc --noEmit` zero errors
- [ ] `.env.example` committed, `.env.local` gitignored

<!-- Updated: Validation Session 1 - Middleware locked to Node.js runtime; experimental.useCache enabled for Cache Components -->

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Better Auth + Drizzle schema collision với i18n schema | Generate Better Auth schema trước rồi extend bằng catalog tables |
| Moving pages sang `[locale]` breaks all links | Search-replace `<Link href="/products">` → check `useTranslations()` + `routing.Link`; commit big bang trong phase này |
| ~~Neon HTTP driver vs Pool driver chọn nhầm~~ → **Updated Session 2 (F2)** | Use `drizzle-orm/neon-serverless` (WebSocket Pool) for Better Auth compatibility. `neon-http` lacks transactions which Better Auth requires |
| `localePrefix: 'as-needed'` gây 404 với links cũ | Test mọi route đầu phase 2 trước khi seed data |
| Vercel Blob free 1GB không đủ về sau | Monitor sau go-live; chấp nhận risk MVP |

## Notes

- KHÔNG seed data trong phase này — phase 2 lo
- KHÔNG build admin UI gì cả — phase 2 lo (shell + auth gate) + phase 3-9 streams (entity CRUD)
- Chỉ goal: infra running, mọi page hiện tại vẫn render qua locale routing
