# Phase 1 — Server admin + Git

Server Node local: API đọc/ghi nội dung + thao tác git. Chạy qua `tsx` (đã có dep).

## Files
- Tạo: `scripts/admin/server.ts` (entry Hono + @hono/node-server).
- Tạo: `scripts/admin/lib/fs-content.ts` (đọc/ghi JSON atomic + validate zod).
- Tạo: `scripts/admin/lib/git.ts` (status, pull --rebase, add, commit, push qua `child_process`).
- Tạo: `scripts/admin/schemas/*.ts` (zod schema cho từng loại; tái dùng type từ `data/*.ts`).
- Sửa: `package.json` scripts + deps (`hono`, `@hono/node-server`).

## API (REST, JSON)
- `GET  /api/content/:type` → trả JSON hiện tại.
- `PUT  /api/content/:type` → validate zod → ghi atomic (temp file → rename).
- `GET  /api/messages/:locale/:file` , `PUT` tương ứng.
- `POST /api/assets` (multipart) → lưu vào `public/<dir>/` theo loại, trả path.
- `GET  /api/git/status` → dirty files, ahead/behind, remote ok?
- `POST /api/git/publish` `{message}` → pull --rebase → add nội dung/asset đã đổi → commit → push; trả hash.

## Quy tắc an toàn
- Chỉ cho ghi trong whitelist đường dẫn: `data/`, `messages/`, `public/img/`, `public/home/`, `public/downloads/`.
- Chặn path traversal (`..`), chuẩn hoá + kiểm tra prefix.
- Ghi atomic; validate zod trước khi ghi, lỗi → 400 kèm chi tiết field.
- Git: kiểm tra `git remote get-url origin` + `git ls-remote` lúc khởi động; nếu fail → cảnh báo rõ (chưa cấu hình SSH/quyền).
- Publish: nếu `git pull --rebase` conflict → abort rebase, trả lỗi "cần xử lý thủ công", KHÔNG tự resolve.
- Chỉ bind `127.0.0.1` (không mở ra LAN).

## Validation
- `curl` PUT 1 product hợp lệ → file đổi; PUT sai schema → 400.
- `POST /api/git/publish` trên thay đổi test → commit + push, hash trả về khớp `git log`.
