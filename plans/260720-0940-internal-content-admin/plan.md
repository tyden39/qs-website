# Trang admin nội bộ chỉnh sửa & push nội dung website

Status: Phase 0 DONE (verified) — tiếp theo: Phase 1

## Tiến độ
- **Phase 0 ✅** Tách data→JSON xong. `data/{products,hero-triptych,machines,news,applications,services,downloads,catalog}.json`;
  các `data/*.ts` giờ chỉ giữ type + re-export JSON. Build xanh, 116 trang HTML không đổi nội dung,
  search-index byte-identical, i18n + tsc pass. Bao gồm cả `catalog.ts` (dữ liệu trang Products).

## Mục tiêu

Công cụ admin **chạy local** (`yarn admin` → `localhost`) cho phép người dùng nội bộ (không rành kỹ thuật)
sửa nội dung website, upload ảnh/PDF, nhập video (YouTube ID), rồi **commit + push lên GitHub** bằng git
sẵn trên máy. Cloudflare Pages tự build & deploy. Admin **tách biệt hoàn toàn** với static export của site.

## Ràng buộc chốt (từ người dùng)

- Chạy **local + local git** (không server backend, không GitHub token — dùng git/SSH sẵn trên máy).
- Đóng gói kiểu **Electron desktop app** (`electron-builder` → installer double-click cho Win/Mac/Linux).
- App là **editor tổng quát mở 1 thư mục qs-website đã clone sẵn** (chọn folder lần đầu, nhớ lại).
  Không tự clone; người dùng/IT clone repo 1 lần trước.
- Phạm vi nội dung: Products/Machines, News, Applications/Services/Downloads, i18n (messages),
  **video** (chỉ YouTube ID, không upload video), **trang giới thiệu** (about.json).

## Ràng buộc kỹ thuật (từ codebase)

- Site = Next 16 `output: "export"` → không có server runtime. Admin KHÔNG nằm trong bản export.
- `data/*.ts` trộn type + data + hằng số/logic (vd `HERO_TRIPTYCH`, `sharedWorkflow`) → phải tách data ra JSON.
- Nội dung song ngữ: một phần trong `data/*` (field `*En`), phần lớn trong `messages/{vi,en}/*.json`.
- Assets: ảnh `public/img/**`, `public/home/`; PDF `public/downloads/**`; video = chỉ ID YouTube.
- ~30 file import từ `data/*` và `lib/data/*` → migration phải giữ render y hệt (build phải xanh).

## Stack

App Electron nằm ở `admin/` (workspace riêng, KHÔNG bundle vào static export của site):

- **Renderer (UI)**: Vite + React 19 + Tailwind.
- **Main process**: Node — logic file I/O + git; expose qua **IPC** (không mở port/HTTP server).
- **Preload**: `contextBridge` expose `window.api` an toàn (contextIsolation on, nodeIntegration off).
- **Logic tách rời**: `admin/src/main/content.ts` (đọc/ghi JSON) + `admin/src/main/git.ts` (git qua child_process)
  — thuần, không phụ thuộc Electron, dễ test.
- **Toolchain**: `electron-vite` (build main/preload/renderer) + `electron-builder` (đóng gói installer).
- **Validation**: `zod` — schema mô tả shape từng loại nội dung, dùng ở main trước khi ghi.
- Scripts: `admin:dev` (electron-vite dev, HMR), `admin:build` (đóng gói installer).

## Phases

| # | Tên | File | Phụ thuộc |
|---|-----|------|-----------|
| 0 | Tách data `.ts` → `.json` (giữ render y hệt) | phase-00-data-to-json.md | — |
| 1 | Electron main + IPC + git (chọn folder, đọc/ghi, commit/push) | phase-01-server-git.md | 0 |
| 2 | Khung renderer + preload + upload asset | phase-02-client-shell-assets.md | 1 |
| 3 | Editor nội dung có cấu trúc (products/machines/news/apps/services/downloads) | phase-03-content-editors.md | 2 |
| 4 | Editor i18n + about + video (messages/about/showreel) | phase-04-i18n-about-video.md | 2 |
| 5 | Đóng gói `electron-builder` (installer) + tài liệu HDSD | phase-05-packaging-docs.md | 1-4 |

## Acceptance (toàn cục)

- `yarn build` (site) xanh sau Phase 0, output HTML không đổi so với trước (diff `out/` không khác về nội dung).
- Mở app Electron → chọn thư mục qs-website → sửa 1 sản phẩm → lưu → thấy đổi trong `data/*.json` của folder đó.
- Upload 1 ảnh → file vào `public/img/...` đúng, path tự gán vào field.
- Nhập YouTube ID cho sản phẩm → lưu đúng field `video.youtubeId`.
- Sửa about + 1 chuỗi i18n vi/en → ghi đúng `messages/{vi,en}/about.json`.
- Nút "Publish" chạy `git add/commit/push` thành công, hiện commit hash; site rebuild trên Cloudflare.
- `admin/` KHÔNG bị bundle vào `out/` khi build site (không lộ ra production).
- `yarn admin:build` xuất được installer chạy trên máy sạch.

## Rủi ro & rollback

- **Migration hỏng render**: giữ commit trước Phase 0; so sánh `out/` trước/sau; revert nếu khác.
- **Ghi file hỏng cú pháp JSON**: server validate zod trước khi ghi + ghi atomic (temp → rename).
- **Push xung đột**: server `git pull --rebase` trước push; nếu conflict thì báo lỗi, không tự resolve.
- **Người dùng chưa cấu hình git/SSH**: admin kiểm tra `git remote` + quyền push lúc khởi động, báo hướng dẫn.

## Câu hỏi mở

- Có cần cơ chế preview (chạy `next dev`/build thử) trong admin trước khi push không? (mặc định: chưa, YAGNI)
- i18n editor: form riêng cho about/home hay editor JSON-tree tổng quát cho các file còn lại? (đề xuất: hybrid)
