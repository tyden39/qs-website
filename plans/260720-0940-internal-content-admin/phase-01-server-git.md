# Phase 1 — Electron main + IPC + Git

Main process của app: chọn thư mục qs-website, đọc/ghi nội dung, thao tác git. Giao tiếp UI qua IPC (không HTTP).

## Files
- Tạo: `admin/` workspace — `package.json` riêng, `electron.vite.config.ts`, `tsconfig`.
- Tạo: `admin/src/main/index.ts` (entry Electron: tạo BrowserWindow, đăng ký IPC handlers).
- Tạo: `admin/src/main/content.ts` (đọc/ghi JSON atomic + validate zod; thuần, không phụ thuộc Electron).
- Tạo: `admin/src/main/git.ts` (status, pull --rebase, add, commit, push qua `child_process`; thuần).
- Tạo: `admin/src/main/workspace.ts` (chọn/nhớ thư mục repo, kiểm tra hợp lệ).
- Tạo: `admin/src/main/schemas/*.ts` (zod schema mỗi loại nội dung).
- Tạo: `admin/src/preload/index.ts` (contextBridge → `window.api`).

## Chọn & kiểm tra workspace
- Lần đầu: `dialog.showOpenDialog` chọn thư mục; lưu path vào `app.getPath('userData')/config.json`.
- Kiểm tra hợp lệ: có `data/`, `messages/`, `.git/`, `package.json` name = `qs-shop` → nếu không, báo lỗi.
- Kiểm tra git: `git remote get-url origin` + `git ls-remote` → nếu fail, cảnh báo "chưa cấu hình quyền push".

## IPC channels (đều async, trả `{ok, data|error}`)
- `workspace:pick`, `workspace:current`
- `content:read` (type) , `content:write` (type, data) — validate zod trước khi ghi
- `messages:read` (locale, file) , `messages:write`
- `asset:list` (dir) , `asset:import` (dir, sourcePath|bytes) → copy vào `public/<dir>/`, trả path
- `git:status` → dirty files, ahead/behind, remote ok
- `git:publish` (message) → pull --rebase → add nội dung/asset đã đổi → commit → push; trả hash

## Quy tắc an toàn
- `contextIsolation: true`, `nodeIntegration: false`, `sandbox` ở renderer; chỉ preload expose API tối thiểu.
- Ghi chỉ trong whitelist đường dẫn *bên trong workspace*: `data/`, `messages/`, `public/img/`, `public/home/`, `public/downloads/`.
  Chuẩn hoá path + kiểm tra prefix để chặn traversal (`..`, symlink ra ngoài).
- Ghi atomic (temp → rename); validate zod trước, lỗi → trả field chi tiết.
- Publish: `git pull --rebase` conflict → abort, trả lỗi "cần xử lý thủ công", KHÔNG tự resolve.

## Validation
- Chạy `admin:dev`, chọn folder repo → `content:read('products')` trả JSON đúng.
- `content:write` data hợp lệ → file đổi; data sai schema → trả lỗi, KHÔNG ghi.
- `git:publish` trên thay đổi test → commit + push, hash khớp `git log`.
