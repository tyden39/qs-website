# Brainstorm: Migration sang Static + Cloudflare Pages

**Date:** 2026-05-26 (revised 2026-05-27)
**Status:** Approved, ready for `/ck:plan`

> **Lưu ý:** Bản đầu brainstorm hướng VPS + Coolify (giữ CMS động). Sau khi làm rõ yêu
> cầu, user quyết **bỏ admin CMS**, content sửa bằng code + rebuild, và tách lead sang
> một **CRM/ERP riêng (build sau)**. Kiến trúc xoay sang **static export** — rẻ hơn,
> đơn giản hơn, zero ops. Phần VPS giữ lại ở cuối làm tham chiếu phương án B.

> **Cập nhật 2026-05-27 (content editing):** Làm rõ thêm — người cập nhật content chính
> là **non-dev (sales/MKT)**, không sửa được TS + git. Quyết bổ sung: sau khi static
> export chạy ổn, gắn **Git-based CMS (Sveltia)** đọc/ghi content dạng file trong repo.
> Vẫn **static + $0 + zero-ops** (commit thẳng vào git → Cloudflare auto-build), KHÔNG
> phục sinh server/DB/auth. Bắt buộc refactor `data/*.ts` → `content/*.{yaml,mdx}` + Zod
> trước. Chi tiết ở mục **"Content editing (non-dev)"** và **Phase 6**.

## Problem statement

Rebuild stack rời Vercel, truy cập global, tối ưu chi phí. Sau discovery: nhu cầu thực
là một **website giới thiệu (marketing/catalogue) tĩnh**, thu lead về một CRM/ERP riêng.

## Decisions (locked)

| Quyết định | Chọn |
|---|---|
| Admin CMS (server/DB) | **Bỏ** — không server runtime, không DB, không auth |
| Content editing | **Git-based CMS (Sveltia)** ghi file trong repo (Phase 6, sau khi static ổn) vì người sửa là non-dev |
| Content storage | Refactor `data/*.ts` → `content/*.{yaml,mdx}` + Zod validate (nền cho CMS) |
| Hosting | **Cloudflare Pages** (static export) |
| Auth / upload / DB-content | **Bỏ** toàn bộ (CMS auth = GitHub OAuth qua Worker relay, $0) |
| Lead capture | Qua **Pages Function lá chắn** → forward về **CRM/ERP riêng** |
| CRM/ERP | **Ngoài scope** — project riêng, build sau |
| Lead giai đoạn đầu | **Form ẩn/disable tới khi CRM xong** (không email/D1 fallback) |
| Audience | VN + APAC chính (Cloudflare edge phủ global) |
| Budget | ~$0-1/mo |

## Tại sao static giải quyết được mọi rủi ro Workers

App viết cho Node. Cloudflare Pages SSR chạy trên Workers (không phải Node) → 3 rủi ro.
Chuyển sang **static export** thì cả 3 biến mất:

| Rủi ro (khi chạy SSR trên Workers) | Static export |
|---|---|
| #1 `isomorphic-dompurify` (jsdom, Node-only) cho sanitize Tiptap HTML | News content do dev viết trong `data/*.ts` = tin cậy → **không cần sanitize runtime** |
| #2 `db.transaction` (mọi admin write bọc transaction, cần ws/Neon Pool) | Bỏ admin/DB → **không còn transaction** |
| #3 OpenNext adapter chạy sau Next.js release → rủi ro vỡ khi update | Static export = HTML thuần, **không cần adapter** |

## Kiến trúc

```
Browser (global)
   │
   ▼
Cloudflare Pages (FREE)
 ├─ Static HTML/CSS/JS  ← next build (output: "export")
 │   • products / services / news / applications / about / downloads
 │   • i18n VI/EN (path-based /vi /en)
 │   • content nguồn từ data/*.ts (baked tại build)
 │   • served từ 300+ edge PoP → nhanh toàn cầu
 │
 └─ Pages Function /api/lead  (Worker lá chắn — FUTURE, khi CRM sẵn sàng)
     • Turnstile verify · rate limit · validate zod
     • forward { name,email,company,message,source } → CRM_API_URL (env)
        │
        ▼
   CRM/ERP riêng  ◄── OUT OF SCOPE, project khác
```

### Chi phí

| Item | Cost |
|---|---|
| Cloudflare Pages (static + functions) | $0 |
| Turnstile (khi bật form) | $0 |
| Domain | ~$1/mo |
| **Total** | **~$0-1/mo** |

vs VPS $7.5 vs Vercel $45+. Không server, không DB, không ops.

## Code: giữ / bỏ

| Giữ | Bỏ khỏi build |
|---|---|
| Public pages + UI components | `app/admin/**` (CMS, 10 server actions) |
| `data/*.ts` (nguồn content) | Better Auth (`lib/auth/**`, `/api/auth`) |
| 3 form UI (client, **ẩn tới khi CRM xong**) | `/api/upload` + Vercel Blob + upload |
| next-intl (path-based) | `/api/leads` (thay bằng Pages Function sau) |
| i18n messages | `/api/cron/prune-audit` |
| | Drizzle CMS schema, `db.transaction` |
| | `@vercel/blob`, `botid`, `ws`, `@neondatabase/serverless`, `isomorphic-dompurify`, `better-auth`, `@upstash/*` |

→ `package.json` gọn đi đáng kể.

## Content editing (non-dev) — Git-based CMS

Người cập nhật content chính là **sales/MKT (non-dev)**, không sửa TS + git được. Giải:
gắn **Git-based CMS** đọc/ghi content dạng file trong chính repo — vẫn static, vẫn $0,
vẫn zero-ops (KHÔNG server, KHÔNG DB, KHÔNG resurrect admin cũ).

```
Sales/MKT ──(form UI, không thấy git)──► Sveltia CMS (admin/ tĩnh)
                                            │ commit + push
                                            ▼
                                  content/*.{yaml,mdx}  (trong repo)
                                            │ git push tự kích hoạt
                                            ▼
                                  Cloudflare Pages build → static edge
```

**Vì sao Git-based (không phải headless CMS):** commit thẳng vào git → không vendor bill,
không external dependency lúc build, content versioned theo git. Đúng tinh thần brainstorm.

**Chọn Sveltia CMS** (kế thừa hiện đại của Decap): i18n VI/EN side-by-side, `list` widget
xử lý `specs[]`/`bullets[]` lồng nhau, config 1 file YAML, UI nhanh. Editor thấy
**danh sách (collection list)** kiểu admin: sidebar = mỗi collection (Products, News,
Services, Applications, Datasheets) → list tất cả bản ghi → click sửa form / "New".

**Điều kiện bắt buộc:** content phải nằm dạng file (`content/products/*.yaml`, news dùng
MDX), mỗi bản ghi 1 file → CMS mới liệt kê/sửa được. Nếu giữ `data/*.ts` (mảng trong
code) thì CMS không đọc được. → cần Phase 6.1 refactor TS → file + Zod validate lúc build.

| Đánh đổi | Thực tế |
|---|---|
| Latency | Mỗi save = commit → build ~1-2 phút mới live. Set kỳ vọng cho sales. |
| Auth | GitHub OAuth qua 1 Cloudflare Worker relay (vẫn $0); editor cần GitHub account write repo |
| Type-safety | Mất compile-time, thay bằng Zod runtime; CMS widget đã ràng schema nên ít rủi ro |
| Ảnh | Image widget commit vào repo (site nhỏ OK); nặng về sau → chuyển R2 ($0 tier) |
| i18n sync | Bắt VI/EN khớp; Sveltia hiện 2 cột để điền song song |

**Loại:** Headless CMS (Sanity/Storyblok) — thừa, vendor lock, vi phạm YAGNI. Google
Sheets — build dễ vỡ, khó tả `specs[]` lồng nhau, mất version control; chỉ cân nhắc nếu
editor dị ứng mọi UI kiểu CMS.

## Static-export blockers (minor, cần xử lý)

1. **`app/opengraph-image.tsx` dùng `runtime = "edge"`** → static không chạy dynamic OG.
   Giải: bỏ `runtime=edge`, pre-generate tại build; hoặc dùng OG image tĩnh.
2. **next-intl middleware (`proxy.ts`)** không chạy trên static → mất auto-detect
   Accept-Language. Path routing `/vi` `/en` vẫn chạy. Giải: dùng static-export mode
   của next-intl (`generateStaticParams` + `setRequestLocale`), default `/vi`, hoặc
   redirect locale phía client.
3. **`next/image`** → set `images.unoptimized: true` hoặc Cloudflare image loader.
4. **`generateStaticParams`** cho products/services/news/applications/datasheets:
   xác minh tất cả route động đều khai báo (applications hiện resolve runtime → cần thêm).

## Migration phases (đề xuất cho /ck:plan)

### Phase 1: Strip backend, revert content sang data files
- Xoá `app/admin/**`, `lib/auth/**`, `app/api/{upload,auth,cron,leads}`
- Đảm bảo mọi public page đọc từ `data/*.ts` (không import `lib/db`)
- Gỡ deps: vercel/blob, botid, ws, neondatabase, dompurify, better-auth, upstash, drizzle
- Verify `next build` không còn server-only code

### Phase 2: Bật static export + fix blockers
- `next.config.mjs`: `output: "export"`, `images.unoptimized: true`
- Sửa opengraph-image (bỏ edge runtime / static OG)
- next-intl static mode + `generateStaticParams` đầy đủ (gồm applications)
- Cập nhật CSP (bỏ vercel blob domain)
- `next build` ra thư mục `out/` tĩnh, chạy thử local

### Phase 3: Deploy Cloudflare Pages
- Tạo Cloudflare Pages project, connect GitHub repo
- Build command `next build`, output dir `out`
- Add domain vào Cloudflare DNS (chưa cutover — dùng `*.pages.dev` test)
- Verify i18n, routing, ảnh, SEO (sitemap/robots/OG) trên preview URL

### Phase 4: Cutover domain
- Lower TTL trước 1 ngày
- Trỏ domain prod sang Pages
- Monitor; giữ Vercel deployment 1 tuần làm rollback

### (Future, ngoài scope) Phase 5: Lead Pages Function + CRM
- Khi CRM/ERP sẵn sàng: viết `/functions/api/lead.ts` (Turnstile + rate limit +
  validate + forward `CRM_API_URL`), bật lại 3 form, thêm Turnstile site key.

### Phase 6: Content editing cho non-dev (Git-based CMS) — sau khi Phase 4 cutover ổn
Tách riêng khỏi migration để cô lập rủi ro; chỉ làm khi static đã chạy production.
- **6.1 Content refactor:** chuyển `data/*.ts` → `content/{products,news,services,
  applications,datasheets}/*.{yaml,mdx}` (mỗi bản ghi 1 file); viết loader + Zod schema
  validate lúc build; verify `next build` ra output y hệt trước refactor.
- **6.2 Gắn Sveltia CMS:** `public/admin/` (index + `config.yml`: collections + i18n
  VI/EN + widgets cho `specs[]`/`bullets[]`/ảnh); Cloudflare Worker OAuth relay cho
  GitHub login; test loop commit → build → live.
- **6.3 Onboard editor:** cấp GitHub repo access cho sales/MKT, hướng dẫn 1 trang, chạy
  thử 1 bài news end-to-end.
- **PoC trước khi cam kết:** chuyển riêng `data/news.ts` → MDX + Sveltia, xác nhận
  non-dev sửa được 1 bài và build lên Cloudflare preview; mượt thì nhân rộng.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Mất nhiều code CMS vừa build (5 commit) | User xác nhận chấp nhận; có thể giữ branch `cms-archive` để khôi phục nếu sau cần admin |
| Sửa content phải rebuild | Cloudflare Pages auto-build on git push → workflow vẫn nhẹ |
| next-intl trên static lệch hành vi locale | Dùng static-export mode chính thức; test kỹ VI/EN |
| applications slug resolve runtime | Chuyển sang `generateStaticParams` hoặc data-driven |
| Form thu lead bị trễ tới khi CRM xong | Đã quyết: ẩn form tới lúc đó; web vẫn launch được |
| Refactor content TS→file làm vỡ output | Verify `next build` diff trước/sau bằng PoC `news` trước khi nhân rộng (Phase 6.1) |
| Non-dev sửa lệch schema / VI-EN | CMS widget ràng schema + Zod build-time fail-fast; Sveltia i18n 2 cột |
| Build latency sau mỗi save (~1-2′) | Set kỳ vọng cho editor; marketing site không cần realtime |
| Repo phình vì ảnh commit qua CMS | Site nhỏ chấp nhận; ngưỡng nặng → chuyển asset sang Cloudflare R2 ($0 tier) |

## Success criteria

- [ ] `next build` xuất `out/` tĩnh, không server-only error
- [ ] Mọi public route (VI/EN) render đúng trên Pages preview
- [ ] SEO giữ nguyên: sitemap, robots, OG, hreflang, JSON-LD
- [ ] TTFB toàn cầu < 100ms (static edge)
- [ ] Cost ≤ $1/mo
- [ ] Cutover < 5 phút downtime, rollback path verified

## Out of scope

- CRM/ERP system (project riêng, brainstorm + hosting riêng)
- Lead Pages Function (làm cùng lúc CRM)
- **Server-side admin CMS** (DB/auth/server runtime — đã bỏ hẳn)
- Auth, upload, runtime DB

> Lưu ý: **Git-based content CMS (Sveltia)** KHÔNG nằm out-of-scope nữa — đã đưa vào
> **Phase 6** (future, sau cutover). Đây là CMS tĩnh ghi file vào git, khác hẳn admin
> CMS server/DB ở trên.

## Next step

→ `/ck:plan` để break Phase 1-4 thành tasks chi tiết với file paths cụ thể.

---

## Phụ lục: Phương án B (tham chiếu) — VPS + Coolify nếu sau cần CMS động lại

Contabo VPS S SG $7.50/mo + Coolify + Cloudflare Tunnel + Supabase Postgres + R2 +
Better Auth (giữ) + Upstash + Resend. Giữ toàn bộ CMS động. Dùng nếu quay lại nhu cầu
sửa content qua web UI mà không rebuild. Chi tiết xem lịch sử brainstorm.
