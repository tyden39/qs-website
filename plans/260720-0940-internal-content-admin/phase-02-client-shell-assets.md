# Phase 2 — Khung client + upload asset + xác thực local

## Files
- Tạo: `admin/` (Vite + React 19 + Tailwind), `admin/index.html`, `admin/src/main.tsx`, `admin/vite.config.ts`.
- Tạo: `admin/src/app.tsx` (layout: sidebar loại nội dung, header trạng thái git, nút Publish).
- Tạo: `admin/src/lib/api.ts` (client gọi API Phase 1).
- Tạo: `admin/src/components/asset-picker.tsx` (chọn file có sẵn / upload mới → trả path).
- Sửa: `.gitignore` (bỏ qua `admin/dist`, `admin/node_modules` nếu tách; giữ source admin trong repo).

## Chức năng khung
- Sidebar: Products, Machines, News, Applications, Services, Downloads, About, i18n, Video.
- Header: badge "N thay đổi chưa publish", nút **Publish** (mở modal nhập commit message).
- Asset picker: liệt kê file trong thư mục đích (vd `public/img/products/`), upload mới, xem preview ảnh.
- Trạng thái tải/lưu rõ ràng; báo lỗi validate theo field.

## Xác thực local
- Không phức tạp: server chỉ bind `127.0.0.1`. Tùy chọn: mật khẩu đơn giản đọc từ `.env` (`ADMIN_PASSWORD`)
  → nếu đặt thì client yêu cầu nhập 1 lần (lưu session). Mặc định tắt (YAGNI cho máy cá nhân).

## Validation
- `yarn admin:dev` mở UI, sidebar điều hướng được.
- Upload 1 ảnh test → vào đúng `public/img/...`, preview hiện, path trả về đúng.
