# Brainstorm Report — QS Website Fullstack CMS + Bilingual

> Date: 2026-05-11
> Branch: `main`
> Scope: Convert static brochure → fullstack Next.js with admin CMS, auth, bilingual EN/VI, SEO. Standalone — sync với master service Go sau.

## Problem Statement

Hiện tại site là Next.js 16 brochure, data hardcoded trong `data/*.ts`. Cần:
- Load data từ DB (admin CRUD được)
- Trang admin nhập liệu
- Auth chung (1 user table, role-based) — UI hiện cho admin, hạ tầng sẵn cho client sau
- SEO build sẵn
- Bilingual VI + EN ngay từ đầu
- Độc lập với hệ Go CRM/ERP. Master data service Go là phase tương lai (Phương án B).

Constraints: 1 dev × 8 tuần. Deploy Vercel. Cấm over-engineer.

## Evaluated Approaches (đã so sánh)

| Approach | Verdict |
|---|---|
| A. Mở rộng CRM Go làm backbone | Loại — user muốn độc lập, không touch CRM giờ |
| **B'. Next.js fullstack monolith (chọn)** | **Phù hợp scope, dễ migrate sau khi master Go ready** |
| C. Headless CMS (Directus/Payload) | Loại — coupling weak với CRM tương lai, sync brittle |
| D. NestJS BFF + Go services | Loại — polyglot, 1 dev không kham |

## Recommended Stack

### Runtime
- **Next.js 16 App Router** (đã có) — RSC + Server Actions = ít boilerplate REST
- **React 19, TypeScript 6, Tailwind v4** (đã có)
- **Node.js 24 LTS** (Vercel default)

### Data
- **Neon Postgres** qua Vercel Marketplace — serverless, dump SQL dễ port master Go sau
- **Drizzle ORM** — TS-native, migration files là SQL → port `sqlc`/`sqlx` cho Go thẳng
- **Zod** — schema validation shared client + server actions + Drizzle

### Auth
- **Better Auth** — 1 user table, role-based (`admin`, `editor`, `customer`)
- Email/password (basic). Plugin `admin` cho user management UI
- Middleware gate `/admin` + future `/account`
- Client UI defer (chỉ schema + endpoints sẵn)

### Admin UI
- **shadcn/ui** — copy-paste components, owns code
- **react-hook-form** + zod resolver
- **TanStack Table** — list view, filter, sort
- **Tiptap** — rich text cho news body (output HTML + JSON)

### Storage & Files
- **Vercel Blob** (public) — product images, news covers, datasheet PDFs
- Datasheets public download (không gate)

### Email
- **Resend + React Email** — lead notifications, admin invites, password reset

### Anti-abuse
- **Vercel BotID** — bot detection form public
- **Upstash Redis** + `@upstash/ratelimit` — rate limit lead form, login, download endpoint
- *Tương đương `@nestjs/throttler` trong Next.js stack*

### SEO
- Next.js native `generateMetadata` per route
- `app/sitemap.ts` đọc Drizzle → multi-locale
- `app/robots.ts` — disallow `/admin`, `/api`, `/account`
- `app/opengraph-image.tsx` per route — Satori dynamic OG
- **JSON-LD** với `schema-dts` typed:
  - `Organization` (root)
  - `Product` (product detail)
  - `Article` (news detail)
  - `BreadcrumbList` (nested)
  - `FAQPage` (services)
  - `WebSite` + `SearchAction`
- `metadataBase` absolute URLs + canonical
- `hreflang` alternates (vi/en)

### i18n
- **next-intl** — App Router compatible, URL strategy `/[locale]/...`
- Locales: `vi` (default, no prefix), `en` (prefix `/en/...`)
- UI strings: messages JSON files (`messages/vi.json`, `messages/en.json`)
- **Data translation strategy**: JSON column trong DB
  ```ts
  name: jsonb // { vi: "...", en: "..." }
  desc: jsonb
  body_html: jsonb
  ```
  - Admin form: 2 inputs per translatable field
  - Fallback: nếu `en` null → render `vi`
  - Drizzle helper: `getLocalizedField(row, locale)`

### Observability
- **Vercel Analytics + Speed Insights** (native)
- **Sentry** optional sau MVP

### Deploy
- **Vercel** (Fluid Compute, Node 24)
- **No Cloudflare proxy** — Vercel đã có CDN/DDoS/WAF. Nếu muốn DNS qua CF thì gray cloud (DNS only)

## Architecture Diagram

```
                          Browser
                            │
                            ▼
              ┌─────────────────────────────┐
              │  Vercel Edge (CDN + WAF)    │
              └──────────────┬──────────────┘
                             ▼
        ┌────────────────────────────────────────────┐
        │  Next.js 16 (Fluid Compute Node 24)        │
        ├────────────────────────────────────────────┤
        │  /[locale]/*           public ISR pages    │
        │  /[locale]/admin/*     SSR + auth gate     │
        │  /api/auth/*           Better Auth         │
        │  /api/revalidate       webhook (future)    │
        │  middleware.ts         locale + auth       │
        │  app/sitemap.ts        multi-locale        │
        │  Server Actions        admin mutations     │
        └────────────────────────────────────────────┘
            │              │              │
            ▼              ▼              ▼
        Neon PG        Vercel Blob    Upstash Redis
        (Drizzle)      (img/pdf)      (ratelimit)
            │
            ▼
        Resend (transactional email)

Future:  Next.js ── webhook/cron ──► Master Data Service Go (Phương án B)
```

## DB Schema (sketch)

```sql
-- Better Auth managed
users (id, email, name, image, email_verified, role, created_at, updated_at)
sessions, accounts, verifications

-- catalog (i18n via JSON column)
products (
  id uuid pk, slug text unique, series text, axes text, display text,
  badge text, tag jsonb,        -- { vi, en }
  name jsonb,                   -- { vi, en }
  desc jsonb,                   -- { vi, en }
  bullets jsonb,                -- [{ vi, en }, ...]
  specs jsonb,                  -- [{ l: {vi,en}, v: {vi,en} }, ...]
  images jsonb,                 -- [{ url, alt:{vi,en} }, ...]
  status text default 'published',
  sort int default 0,
  created_at, updated_at, updated_by
)
applications (id, slug, title jsonb, summary jsonb, hero_image, workflow jsonb, specs jsonb, deployments jsonb, ...)
services (id, slug, title jsonb, hero jsonb, steps jsonb, included jsonb, faqs jsonb, ...)
news (id, slug, title jsonb, excerpt jsonb, body_html jsonb, body_json jsonb, cover_image, tags text[], published_at, ...)
datasheets (id, name jsonb, file_url, product_id fk, category, lang text, size_bytes)

-- runtime (web-only, không sync master)
leads (id, source, name, email, phone, company, message, payload jsonb, status, assigned_to, locale, created_at)
audit_log (id, actor_id, action, entity, entity_id, diff jsonb, created_at)
```

**Lý do thiết kế:**
- Snake_case → 1-1 với Go struct sau
- `jsonb` cho i18n fields → đơn giản hơn translation table, dễ query bằng `->>` operator
- `uuid` id → port master Go giữ nguyên
- `slug` unique → giữ URL hiện tại không vỡ
- `status` enum + `published_at` → draft/published workflow
- `audit_log` ở web (runtime), không sync master

## Routing & i18n URL Structure

```
/                          → /vi (default, no prefix)
/products                  → /vi/products  (404, redirect /products)
/products/f86              → /vi/products/f86
/en                        → English home
/en/products               → English products list
/en/products/f86           → English product detail
/admin                     → admin (no locale prefix, VI UI default, can switch)
```

- `next-intl` middleware xử lý locale detection
- `generateStaticParams` × 2 locales × N slugs = SSG paths
- `hreflang` alternates auto từ metadata

## SEO Build Checklist

- [x] Per-route `generateMetadata` (title, description, OG, Twitter, canonical, alternates)
- [x] `app/sitemap.ts` multi-locale dynamic
- [x] `app/robots.ts`
- [x] `app/opengraph-image.tsx` per major route (home, product, news, application)
- [x] JSON-LD: Organization, Product, Article, BreadcrumbList, FAQPage, WebSite+SearchAction
- [x] `metadataBase` absolute URLs
- [x] Image alt text bilingual
- [x] `next/image` AVIF + WebP
- [x] ISR `revalidateTag` per entity
- [x] Lighthouse target ≥ 90 Performance/Accessibility/SEO/Best Practices

## Phase Plan (8 weeks)

| Tuần | Mục tiêu | Output |
|---|---|---|
| 1 | Foundation | Neon DB connect, Drizzle schema, Better Auth setup, next-intl scaffold, Vercel Blob token, env config |
| 2 | Migration + public read | Seed script từ `data/*.ts`, public pages chuyển sang fetch Drizzle, ISR + revalidateTag |
| 3 | Admin shell + Products CRUD | `/admin` layout, auth middleware, role gate, products list/create/edit/delete với image upload |
| 4 | News (Tiptap) + Applications + Services CRUD | Rich text editor bilingual, CRUD đầy đủ |
| 5 | Datasheets + Leads inbox + Forms wiring | Upload PDF, lead form → DB + email Resend, rate limit Upstash, BotID |
| 6 | SEO complete | generateMetadata × all routes, sitemap, robots, OG images, JSON-LD, hreflang |
| 7 | i18n EN content + admin polish | Translate UI strings, admin UX polish, audit_log viewer, user management |
| 8 | QA + deploy | Lighthouse fix, a11y audit, smoke tests, production deploy, docs update |

## Out of Scope (phase sau)

- Customer portal UI (`/account`) — schema sẵn, defer
- Master Data Service Go (Phương án B) — sync sau
- Analytics dashboard custom (dùng Vercel Analytics)
- ERP integration
- Magic link auth, MFA, passkeys
- Multi-tenant / partner portal
- Sentry error reporting
- Playwright E2E tests (Phase 9)

## Risks & Mitigation

| Risk | Mitigation |
|---|---|
| i18n từ ngày 1 tăng workload nội dung x2 | Cho phép `en` null → fallback `vi`. Bulk translate sau bằng AI proofread |
| Drizzle migration drift | `drizzle-kit generate` mỗi schema change, commit migration files |
| Better Auth còn trẻ (vs NextAuth v5) | Active maintained, OSS, có Discord. Fallback NextAuth v5 nếu gặp bug critical |
| Tiptap learning curve | Setup 1-2 ngày. Có starter kit @tiptap/starter-kit cover 90% use case |
| Vercel Blob cost khi nhiều file | Free 1GB. Datasheets vài MB/file → OK. Monitor sau go-live |
| Sync master Go sau bị schema lock | DB design snake_case, uuid id, không dùng Postgres-only features (generated columns, custom types) |
| ISR revalidation race khi admin update | `revalidateTag(['products', `product:${slug}`])` + audit log để debug |
| SEO bilingual hreflang sai gây duplicate content | Test với Search Console + Lighthouse SEO audit |
| Login form chung nhưng client UI chưa có | Sau login client redirect về `/` (chưa có /account). Document rõ TODO |

## Success Criteria

- [x] All routes hiện tại render từ DB (không còn import `data/*.ts` ở runtime)
- [x] Admin CRUD đủ cho products, news, applications, services, datasheets, leads
- [x] 1 form login chung — admin login được, schema cho client sẵn
- [x] Site có VI + EN với URL `/...` và `/en/...`
- [x] Lighthouse ≥ 90 cả 4 axes trên home, products list, product detail
- [x] Sitemap + robots.txt + JSON-LD validate với Google Rich Results Test
- [x] `yarn build` zero warnings, `tsc --noEmit` zero errors
- [x] Deploy Vercel preview chạy được mọi route
- [x] Lead form gửi email Resend cho QS sales
- [x] Rate limit hoạt động (test bằng curl loop)

## Next Steps

1. User confirm design report này
2. Tạo plan chi tiết với `/ck:plan` — sẽ tách 8 phase thành 8 phase files trong `plans/260511-1436-fullstack-cms-bilingual/`
3. Phase 1 bắt đầu: Neon DB + Drizzle + Better Auth scaffold

## Unresolved Questions

- **Slug strategy bilingual**: dùng cùng slug 2 locale (`/products/f86` & `/en/products/f86`) hay slug khác per locale (`/san-pham/...` vs `/en/products/...`)? Recommend cùng slug để đơn giản.
- **Image alt text**: required bilingual hay chỉ VI? Recommend required bilingual (SEO + a11y).
- **Audit log retention**: lưu mãi mãi hay xoá > 90 ngày? Recommend 180 ngày default.
- **Admin invite flow**: admin tạo user editor và gửi invite email, hay editor self-register rồi admin promote? Recommend invite flow (an toàn hơn).
- **Default locale detection**: header `Accept-Language` redirect `/en` cho EN users, hay luôn về `/` VI? Recommend always-VI (brand chính là VN, EN là secondary).
- **CRM Go integration timeline**: phase nào kích hoạt webhook bridge? Không trong 8 tuần này — phase 9+.
