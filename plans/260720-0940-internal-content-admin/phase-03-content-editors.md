# Phase 3 — Editor nội dung có cấu trúc

Form theo schema cho từng loại data (đọc/ghi `data/*.json` qua API Phase 1).

## Files
- Tạo: `admin/src/editors/products.tsx`, `machines.tsx`, `news.tsx`, `applications.tsx`, `services.tsx`, `downloads.tsx`.
- Tạo: `admin/src/components/field-*.tsx` (text, textarea, số, select union, mảng lồng nhau, ảnh, song ngữ vi/en).
- Dùng lại zod schema từ `scripts/admin/schemas/*` (chia sẻ type).

## Yêu cầu từng editor
- Danh sách bản ghi (theo `slug`) → chọn để sửa; thêm/xoá/nhân bản; sắp xếp thứ tự nếu UI cần.
- Mảng lồng nhau: specs, workflow steps, gallery photos, kit items, use cases... → thêm/xoá/kéo thả.
- Trường ảnh dùng `asset-picker` (Phase 2), lưu path tương đối `/img/...`.
- Trường song ngữ (`*En`, vd `titleEn`, `descEn`): 2 ô vi/en cạnh nhau.
- **Products**: gồm `video?: { youtubeId, title? }` — ô nhập ID + preview thumbnail YouTube.
- Validate trước khi lưu; hiện lỗi theo field; nút Lưu gọi `PUT /api/content/:type`.

## Ràng buộc
- Không đổi shape data (giữ khớp type site). Giữ field optional bằng cách bỏ key khi trống.
- Union hẹp (KitIcon, GalleryPlace, MachineCategory...) → dropdown giới hạn giá trị hợp lệ.

## Validation
- Sửa 1 sản phẩm (kể cả thêm ảnh gallery + video ID) → lưu → `data/products.json` đổi đúng.
- `yarn build` site vẫn xanh với data đã sửa.
