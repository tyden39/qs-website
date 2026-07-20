# Trang admin nội bộ chỉnh sửa & push nội dung website

Status: DRAFT — chờ duyệt để bắt đầu Phase 0

## Mục tiêu

Công cụ admin **chạy local** (`yarn admin` → `localhost`) cho phép người dùng nội bộ (không rành kỹ thuật)
sửa nội dung website, upload ảnh/PDF, nhập video (YouTube ID), rồi **commit + push lên GitHub** bằng git
sẵn trên máy. Cloudflare Pages tự build & deploy. Admin **tách biệt hoàn toàn** với static export của site.

## Ràng buộc chốt (từ người dùng)

- Chạy **local + local git** (không server, không GitHub token).
- Đóng gói kiểu **`yarn admin`**: cài 1 lần = `clone repo + yarn install`; chạy = `yarn admin`.
- Phạm vi nội dung: Products/Machines, News, Applications/Services/Downloads, i18n (messages),
  **video** (chỉ YouTube ID, không upload video), **trang giới thiệu** (about.json).

## Ràng buộc kỹ thuật (từ codebase)

- Site = Next 16 `output: "export"` → không có server runtime. Admin KHÔNG nằm trong bản export.
- `data/*.ts` trộn type + data + hằng số/logic (vd `HERO_TRIPTYCH`, `sharedWorkflow`) → phải tách data ra JSON.
- Nội dung song ngữ: một phần trong `data/*` (field `*En`), phần lớn trong `messages/{vi,en}/*.json`.
- Assets: ảnh `public/img/**`, `public/home/`; PDF `public/downloads/**`; video = chỉ ID YouTube.
- ~30 file import từ `data/*` và `lib/data/*` → migration phải giữ render y hệt (build phải xanh).

## Stack

- Client: Vite + React 19 + Tailwind trong `admin/` (build riêng, không dính CSP của site).
- Server: Node + Hono chạy qua `tsx` (`scripts/admin/server.ts`) — API file I/O + upload + git.
- Validation: `zod` (đã có sẵn) — schema dùng chung giữa site và admin khi có thể.
- `yarn admin`: build client (nếu chưa) → chạy server serving `admin/dist` → mở trình duyệt.
- `yarn admin:dev`: Vite HMR + server song song (cho lúc phát triển admin).

## Phases

| # | Tên | File | Phụ thuộc |
|---|-----|------|-----------|
| 0 | Tách data `.ts` → `.json` (giữ render y hệt) | phase-00-data-to-json.md | — |
| 1 | Server admin + git (API + commit/push) | phase-01-server-git.md | 0 |
| 2 | Khung client + upload asset + xác thực local | phase-02-client-shell-assets.md | 1 |
| 3 | Editor nội dung có cấu trúc (products/machines/news/apps/services/downloads) | phase-03-content-editors.md | 2 |
| 4 | Editor i18n + about + video (messages/about/showreel) | phase-04-i18n-about-video.md | 2 |
| 5 | Đóng gói `yarn admin` + tài liệu HDSD | phase-05-packaging-docs.md | 1-4 |

## Acceptance (toàn cục)

- `yarn build` (site) xanh sau Phase 0, output HTML không đổi so với trước (diff `out/` không khác về nội dung).
- `yarn admin` mở được UI ở localhost, sửa 1 sản phẩm → lưu → thấy đổi trong `data/*.json`.
- Upload 1 ảnh → file vào `public/img/...` đúng, path tự gán vào field.
- Nhập YouTube ID cho sản phẩm → lưu đúng field `video.youtubeId`.
- Sửa about + 1 chuỗi i18n vi/en → ghi đúng `messages/{vi,en}/about.json`.
- Nút "Publish" chạy `git add/commit/push` thành công, hiện commit hash; site rebuild trên Cloudflare.
- Admin không bị bundle vào `out/` (không lộ ra site production).

## Rủi ro & rollback

- **Migration hỏng render**: giữ commit trước Phase 0; so sánh `out/` trước/sau; revert nếu khác.
- **Ghi file hỏng cú pháp JSON**: server validate zod trước khi ghi + ghi atomic (temp → rename).
- **Push xung đột**: server `git pull --rebase` trước push; nếu conflict thì báo lỗi, không tự resolve.
- **Người dùng chưa cấu hình git/SSH**: admin kiểm tra `git remote` + quyền push lúc khởi động, báo hướng dẫn.

## Câu hỏi mở

- Có cần cơ chế preview (chạy `next dev`/build thử) trong admin trước khi push không? (mặc định: chưa, YAGNI)
- i18n editor: form riêng cho about/home hay editor JSON-tree tổng quát cho các file còn lại? (đề xuất: hybrid)
