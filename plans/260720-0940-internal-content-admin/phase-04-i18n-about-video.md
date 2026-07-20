# Phase 4 — Editor i18n + About + Video

Sửa `messages/{vi,en}/*.json`. Hybrid: form riêng cho about/home, editor tổng quát cho phần còn lại.

## Files
- Tạo: `admin/src/renderer/editors/about.tsx` (form theo cấu trúc `about.json`: hero, story, missionVision, values[]...).
- Tạo: `admin/src/renderer/editors/i18n.tsx` (editor key-value/tree tổng quát cho mọi file messages).
- Tạo: `admin/src/renderer/editors/video.tsx` (showreel: mảng `home.showreel.videos` + YouTube ID nếu có; và video sản phẩm liên kết Phase 3).
- Tạo: `admin/src/renderer/components/locale-tabs.tsx` (chuyển vi/en, hiển thị song song để dịch).

## Yêu cầu
- **About**: form khớp `about.json` (đã khảo sát: hero/story/missionVision/values items). Sửa vi và en cạnh nhau.
- **i18n tổng quát**: cây key lồng nhau, sửa giá trị chuỗi; cảnh báo nếu key có ở vi mà thiếu ở en (tái dùng logic `scripts/check-i18n-keys.ts`).
- **Video**: showreel ở `home.json` là danh sách tiêu đề; nếu cần thêm YouTube ID cho từng video → mở rộng schema thống nhất với site (xác nhận nơi site đọc ID showreel trước khi đổi shape).
- Ghi giữ nguyên format JSON (indent 2, giữ thứ tự key) để diff git sạch.

## Validation
- Sửa 1 chuỗi about vi + en → lưu → `messages/vi/about.json` + `messages/en/about.json` đổi đúng.
- `yarn i18n:check` pass sau khi sửa.
- Diff git chỉ đổi dòng liên quan (không format lại cả file).
