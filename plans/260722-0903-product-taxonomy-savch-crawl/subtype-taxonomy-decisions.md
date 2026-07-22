# Sub-type taxonomy — quyết định & việc còn lại

Chốt với user 2026-07-22 (chat). Trạng thái: **taxonomy đã chốt, code đã xong**.
Liên quan: [servo-subgroup-crawl.md](servo-subgroup-crawl.md) (data mục 1),
[products-ia-ui-design.md](products-ia-ui-design.md) (IA gốc),
[../260722-1032-products-group-landing/plan.md](../260722-1032-products-group-landing/plan.md) (trang nhóm).

## Taxonomy đã chốt

| Nhóm | Loại (type) | Ghi chú |
|---|---|---|
| Máy móc | máy CNC · máy tự động hóa · máy kiểm tra | CNC = QSM-215, VMC-300, QSM-R4020, PJM-420, JW-230 · tự động hóa = RBT-01 · kiểm tra = CWM-050 (user chốt: KHÔNG gộp vào tự động hóa) |
| Bộ điều khiển | motion · cnc · robot · cobot | đã gán — xem mục 2 |
| Servo | driver · motor · cable | user chốt gộp connector vào section "Cáp & đầu nối" (crawl không tìm được mã đầu nối bán lẻ) |
| Biến tần | không chia | 4 series giữ phẳng |
| DNC | không chia | 2 sản phẩm |
| Phụ kiện | không chia | 7 sản phẩm |

Cách trình bày đã thống nhất: **không tạo route con** — mỗi trang nhóm render section
theo type + anchor + hàng chip điều hướng; section rỗng thì ẩn; card trên landing liệt
kê tên các loại thay vì chỉ đếm số; trang chi tiết `/products/[slug]` giữ nguyên.

## Quyết định khác của user (2026-07-22)

| Câu hỏi | Chốt |
|---|---|
| Connector | Gộp vào section "Cáp & đầu nối", không tạo type riêng |
| Motor | 1 card gộp dải 0.2 – 45 kW |
| Mã SCH / DL- / SA2FK | Giữ nguyên mã Savch, không thêm tiền tố QS |

## Trạng thái 3 đầu việc

### Mục 1 — Crawl servo (DONE)
Data + ảnh: [servo-subgroup-crawl.md](servo-subgroup-crawl.md) và `assets/`.

### Mục 2 — Type của 7 controllers (DONE — DỮ LIỆU TẠM)

User yêu cầu gán rải cho đủ 4 loại để nhìn thấy đủ 4 section trên UI. **Đây không
phải phân loại thật** — cần rà lại theo thực tế sản phẩm trước khi lên production.

| Sản phẩm | type hiện tại (tạm) |
|---|---|
| F54 | cnc |
| F86 | cnc |
| F10T | motion |
| Astro 6AH | robot |
| Astro 6AV | cobot |
| Astro 10S | cnc |
| Astro 10i | motion |

### Mục 3 — Code (DONE)

Đã làm, `tsc` + `eslint` + `i18n:check` + `next build` (12 route locale) đều pass:

1. **Data**
   - `data/products.ts` — type `ControllerType`; `data/products.json` — field `type` cho 7 model.
   - `data/machines.ts` — type `MachineType` + bảng `MACHINE_TYPE` (milling/router/jewelry → cnc).
   - `data/series.ts` / `series.json` — field `kind`; thêm 3 entry servo: `sch-motor`,
     `dl-power-cable`, `sa2fk-encoder-cable` (spec lấy từ crawl).
   - `lib/data/{products,machines,series}.ts` — đưa type/kind ra view, thêm thứ tự section
     `CONTROLLER_TYPES` / `MACHINE_TYPES` / `SERIES_KINDS`.
2. **Ảnh** — 7 file webp mới trong `public/img/products/series/` (sdv3, sda2, servo-motor-sch,
   s600, s3100, penta, uhs-bldc). Đã gắn vào `series.json`; 4 series biến tần và 2 driver
   servo không còn khung "đang cập nhật". Card cáp vẫn chưa có ảnh (crawl chỉ có line-art).
3. **UI** — `_components/type-sections.tsx` (TypeNav chip + TypeSection anchor, dùng chung),
   áp vào `series-list.tsx`, `product-list-filter.tsx` (section theo type sau khi lọc giao
   tiếp) và `cnc/_components/machine-list.tsx` (prop `sections` tuỳ chọn, trang /cnc giữ
   danh sách phẳng).
4. **Landing** — `group-grid.tsx` thêm dòng liệt kê tên loại dưới blurb; thumb nhóm servo
   và biến tần trỏ sang render series mới.
5. **i18n** — `product.page.types.*` (vi/en); bỏ `product.seriesCard.composition` cùng dải
   "cấu thành bộ servo" trên card (đã lỗi thời khi motor/cáp có card riêng).

## Còn lại

1. Rà lại type thật cho 7 controllers (mục 2) — hiện là dữ liệu tạm.
2. Ảnh cáp DL- / SA2FK (chưa có ảnh sản phẩm thật).
3. `assets/` 17 MB trong `plans/` — quyết định giữ hay xoá sau khi đã tích hợp ảnh.
4. Bảng mã motor/cáp chi tiết mới nằm ở `servo-subgroup-crawl.md`, chưa lên web —
   nếu muốn khách tra mã thì cần trang chi tiết cho từng series servo.
