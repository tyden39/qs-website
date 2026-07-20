# Phase 2 — Khung renderer + preload + upload asset

UI React trong renderer, gọi main qua `window.api` (preload). Không fetch/HTTP.

## Files
- Tạo: `admin/src/renderer/main.tsx`, `admin/src/renderer/app.tsx` (layout: sidebar loại nội dung, header trạng thái git + nút Publish).
- Tạo: `admin/src/renderer/lib/api.ts` (wrapper gọn quanh `window.api.*`).
- Tạo: `admin/src/renderer/components/workspace-gate.tsx` (màn chọn folder nếu chưa có/không hợp lệ).
- Tạo: `admin/src/renderer/components/asset-picker.tsx` (chọn file có sẵn / import mới → trả path).
- Tạo: `admin/src/renderer/index.css` (Tailwind).
- Cập nhật preload (Phase 1) khai báo type cho `window.api` (d.ts dùng chung).

## Chức năng khung
- **Workspace gate**: nếu chưa chọn folder hợp lệ → hiện nút "Chọn thư mục qs-website"; hiện path đang mở + nút đổi.
- Sidebar: Products, Machines, News, Applications, Services, Downloads, About, i18n, Video.
- Header: badge "N thay đổi chưa publish" (từ `git:status`), nút **Publish** (modal nhập commit message → gọi `git:publish`).
- **Asset picker**: liệt kê file trong thư mục đích (vd `public/img/products/`) qua `asset:list`; import file mới qua
  `asset:import` (dùng `dialog.showOpenDialog` ở main hoặc kéo-thả → gửi bytes); preview ảnh; trả path tương đối.
- Trạng thái tải/lưu rõ; báo lỗi validate theo field.

## Bảo mật
- Không cần mật khẩu: app desktop cục bộ, không mở port. Mọi thao tác file/git qua IPC đã whitelist ở main.

## Validation
- `admin:dev` mở app → workspace gate hoạt động → chọn folder → sidebar điều hướng được.
- Import 1 ảnh test → vào đúng `public/img/...`, preview hiện, path trả về đúng.
