# Phase 5 — Đóng gói `yarn admin` + tài liệu

## Files
- Sửa: `package.json` scripts:
  - `admin`: build client nếu `admin/dist` thiếu/cũ → chạy server → mở trình duyệt.
  - `admin:dev`: Vite + server song song (dev).
  - `admin:build`: chỉ build client.
- Tạo: `scripts/admin/open-browser.ts` (mở `http://127.0.0.1:<port>` cross-platform).
- Tạo: `docs/admin-guide.md` (HDSD cho người dùng cuối, tiếng Việt).
- Sửa: `README.md` (mục "Chỉnh sửa nội dung bằng trang admin").

## `yarn admin` (trải nghiệm người dùng cuối)
1. Kiểm tra `admin/dist` tồn tại; nếu không → `admin:build` tự chạy.
2. Kiểm tra git: có `origin`, push được (`git ls-remote`) → nếu lỗi, in hướng dẫn cấu hình SSH/token.
3. Chạy server (bind 127.0.0.1), tự mở trình duyệt.
4. Người dùng sửa → Publish → push → Cloudflare build.

## docs/admin-guide.md (nội dung)
- Cài 1 lần: cài Node LTS, `git clone`, `yarn install`, cấu hình quyền push GitHub (SSH key hoặc HTTPS).
- Dùng hằng ngày: `yarn admin` → sửa → nút Publish → chờ ~vài phút site cập nhật.
- Xử lý sự cố: git chưa cấu hình, port bận, publish lỗi do conflict (cần người kỹ thuật).

## Validation
- Trên máy sạch (Node + repo + quyền git): `yarn install` → `yarn admin` → sửa → Publish → commit lên GitHub, Cloudflare deploy.
- `admin/` KHÔNG bị đưa vào `out/` khi `yarn build` site (kiểm tra `out/` không chứa file admin).
