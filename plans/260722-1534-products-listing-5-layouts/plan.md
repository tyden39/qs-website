# Plan — 5 layout trưng bày sản phẩm (cấu trúc hiện tại) + vị trí bộ lọc

Status: V6 từng được implement vào `/products` landing rồi **rollback toàn bộ theo yêu cầu user (22/07/2026 chiều)** — landing trở về bản GroupGrid + hero CircuitTraces gốc, `group-explorer.tsx` đã xoá, key `explorer` đã gỡ khỏi messages. Thay vào đó tối ưu các trang nhóm: bỏ hẳn thanh chọn nhóm (switcher pills) trong `category-page.tsx`; thêm icon nét mảnh vào chips TypeNav qua `filter-icons.tsx` mới (9 glyph: motion/cnc/robot/cobot/automation/inspection/driver/motor/cable, id lạ tự ẩn icon). Label "Máy" giữ nguyên. Build + lint + i18n check pass. Khác plan `260722-1424-products-ia-mockups` (IA phương án B): plan này giữ nguyên IA 6 nhóm hiện tại, chỉ so 5 bố cục trình bày + vị trí filter cho trang nhóm.

## Mockup

`mockups/listing-5-layouts.html` — 1 file tự chứa, dữ liệu + ảnh render thật của 7 controller (`data/products.json`), token màu/chữ theo `app/globals.css`, filter chạy thật bằng vanilla JS, có dark mode + reduced-motion.

| # | Layout | Vị trí bộ lọc | Hợp khi |
|---|--------|---------------|---------|
| V1 | Toolbar trên + hàng dọc theo loại (gần hiện trạng) | Thanh ngang sticky: chips loại điều khiển kèm icon + sort | Ít facet như hiện tại; effort thấp nhất |

Filter bộ điều khiển dùng loại (motion / cnc / robot / cobot) kèm icon nét mảnh tự vẽ (trục XY, trục dao, cánh tay robot, tay máy + người) thay vì giao tiếp Pulse Train / EtherCAT / Mechatrolink; giao tiếp vẫn hiện trong thông tin từng model, và còn là facet phụ ở V2/V5.

V6 mở đầu bằng bản mock hero của `/products` thật: cột chữ (eyebrow, "Sản phẩm QS", lede, 3 dòng feature gạch gold) + montage 3 ô Máy → Điều khiển → Truyền động (QSM-215 / Astro 10i / servo drive) với viền dashed gold và vệt scan; V1-V5 là trang nhóm nên giữ header band như site, không có hero.

V6 dùng ảnh thật toàn bộ: thẻ nhóm ở rail có thumb đại diện (QSM-215 / F54 / SDV3 / S600 / Micro DNC 2D / I/O Link 32), mặt hàng trong panel dùng ảnh từ `public/img/machines`, `public/img/products/series`, `public/img/products/catalog`; chỉ 2 cáp servo (DL-SCH, SA2FK) giữ khung "Ảnh đang cập nhật" vì site chưa có ảnh.
| V2 | Sidebar facet trái + lưới thẻ | Rail trái sticky 4 nhóm facet có đếm số + pills áp dụng | Danh mục > ~20 model |
| V3 | Bảng thông số so sánh | Select ngay dưới tiêu đề từng cột, sort bấm tiêu đề | Khách kỹ thuật so sánh nhanh |
| V4 | Tra cứu trước, duyệt sau | Ô tìm mã + segmented loại; aside gọi kỹ thuật sticky | Đa số khách biết mã (chờ số liệu gate plan IA) |
| V5 | Gallery ảnh lớn + ngăn kéo | Drawer phải + pills gỡ được | Mobile-first, ảnh là chủ thể |
| V6 | Group-first: rail 6 nhóm trái + panel master-detail (thêm theo yêu cầu highlight group) | Rail nhóm = filter cấp 1; chips ngữ cảnh theo nhóm = cấp 2 | Muốn nhấn cấu trúc 6 nhóm; dữ liệu thật cả 32 mặt hàng; bản thật cần sync URL /products/<nhóm> giữ SEO |

Quyết định copy (user chốt 22/07/2026): nhóm machines gọi là "Máy" (thay "Máy móc") — đã áp vào mockup và `messages/vi/product.json` (`page.groups.machines.label`); en giữ "Machines", SEO title `productsMachinesTitle` ("Máy móc & tự động hóa") giữ nguyên chờ quyết riêng.

## Khuyến nghị

Giữ V1 làm mặc định với 7 model hiện tại; mượn hành vi drawer V5 cho mobile; nâng V2 khi danh mục mở rộng; V3 làm chế độ xem phụ; V4 chờ decision gate.

## Unresolved

- Người dùng chưa chọn bản nào; chưa có scope implement.
