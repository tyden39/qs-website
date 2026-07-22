# Plan — /products IA: 5 phương án tổ chức + mockup

Status: mockup/analysis — chưa sửa code site.

## Context

Landing /products hiện tại: 6 thẻ nhóm thiết bị (machines / controllers / servo / inverters / dnc / accessories) → 6 trang nhóm (đã build, đang untracked trên `main`). Mục tiêu trang đã xác định từ chính site: ra lead gọi điện (không giá, không giỏ hàng, support band tel: ở mọi trang nhóm).

Data hiện có: 7 controllers (`products.json`, có `bundle` kit items), 7 máy (`machines.json`, có `controllerSlug`), 9 series servo/biến tần (`series.json`), 9 catalog DNC + phụ kiện (`catalog.json`), 6 ứng dụng (`applications.json`).

## 5 phương án đã phân tích

| # | Trục | Tóm tắt |
|---|------|---------|
| A | Loại thiết bị | Hiện trạng + ô tìm theo mã |
| B | Bài toán khách / mức trọn bộ | 3 lối vào: mua máy / tự ráp–nâng cấp / thay thế–sửa chữa, đặt TRÊN lưới A |
| C | Ngành / ứng dụng | Loại — trùng vai `/applications`, thiếu data mapping, bỏ rơi khách tra mã |
| D | Sơ đồ hệ thống | Điều hướng bằng chuỗi Máy → Controller → Servo → Biến tần → DNC → Phụ kiện |
| E | Hội thoại chọn cấu hình | Wizard 2–3 câu hỏi → cấu hình gợi ý + CTA gọi kèm mã tham chiếu |

Khuyến nghị: **B làm lớp mỏng trên A**. D dùng làm hero minh họa (site đã có montage 3 ô cùng ý tưởng). E là bản tương tác của B — chỉ nâng cấp sau khi có số liệu cuộc gọi.

## Phases

### Phase 1 — Mockup (done)

- `mockups/products-ia-mockups.html` — wireframe 3 hướng B / D / E + bảng chấm điểm, dùng token màu/type thật của site, tên sản phẩm thật.
- Publish artifact để duyệt nhanh.

### Phase 1b — 5 giao diện sample cho phương án B (done)

- `mockups/b-ui-samples.html` — 5 bố cục khác nhau cho cùng IA của B (3 lối vào + tra mã + lưới danh mục):
  - V1 Tam liên thẻ (card, sát ngôn ngữ site) · V2 Băng ngang tuần tự · V3 Hỏi trước-duyệt sau (typography, không ảnh) · V4 Hai cột song hành (lối vào | panel tra cứu sticky) · V5 Kit dẫn đầu (kit + mã + CTA gọi)
- Người dùng chọn 1 bản → chốt làm spec giao diện cho Phase 3.

### Phase 2 — Decision gate (chờ số liệu)

- Sales review ~20 cuộc gọi/Zalo gần nhất: đếm tỷ lệ mở đầu bằng mã hàng vs mô tả nhu cầu.
- Ngưỡng: >70% biết mã → chỉ làm A + search mã nổi bật; ngược lại → triển khai B.

### Phase 3 — Implement (chưa kích hoạt, scope sơ bộ nếu chọn B)

- Landing: thêm khối "Bạn đang cần gì?" (3 lối vào) trên `GroupGrid`; thêm ô tìm theo mã (client-side, index từ slug/name 4 file data).
- 3 trang lối vào mới dưới `/products/` (segment không đụng slug hiện có — xem ràng buộc trong `category-page.tsx`).
- Data mới: `data/kits.json` — 3–5 kit đặt tên (tái dùng `Product.bundle` + `machine.controllerSlug`), mỗi kit 1 đoạn mô tả vi/en.
- Acceptance: khách mới đến CTA gọi trong ≤3 click; khách biết mã đến trang model trong ≤2 thao tác; không đổi URL 6 trang nhóm hiện có; i18n + static export giữ nguyên ràng buộc (`setRequestLocale`, không dynamic API).

## Unresolved

- Số liệu Phase 2 chưa có.
- Tên/segment 3 lối vào (vi/en) chưa chốt.
