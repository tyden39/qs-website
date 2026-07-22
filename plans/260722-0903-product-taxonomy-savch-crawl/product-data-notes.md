# Product Taxonomy Consolidation + Savch Crawl Notes

**Ngày:** 2026-07-22
**Nguồn crawl:** savch.net (Savch / Quanzhou Sangchuan Electrical Equipment Co., Ltd.)
**Mục đích:** Tổng hợp lại danh mục sản phẩm & crawl dữ liệu servo + biến tần.

---

## 1. TAXONOMY MỚI (yêu cầu chốt)

Cấu trúc tab sản phẩm hiện tại: `Controllers (CNC) · DNC · Accessory`.
Cấu trúc **mới** theo yêu cầu:

| # | Danh mục | Ghi chú thay đổi |
|---|----------|------------------|
| 1 | **Bộ điều khiển** (Controllers) | ❗ **Bỏ chữ "CNC"** — vì có nhiều loại motion: CNC, Robot, Cobot, Motion. Tên chung là "Bộ điều khiển". |
| 2 | **Servo** | Mới. Gồm 4 nhóm con: **Driver · Motor · Cable · Connector**. |
| 3 | **Biến tần** (Frequency Converter / Inverter) | Mới. 4 series từ Savch. |
| 4 | DNC | Giữ nguyên (đã có). |
| 5 | Phụ kiện (Accessory) | Giữ nguyên (đã có). |

> **Lưu ý ngôn ngữ hiện tại trong code:** heading dùng `t("heading")` tách từ cuối làm gold —
> "Bộ điều khiển CNC" → gold "CNC". Khi bỏ "CNC", cần cập nhật cả `messages/*/product.json`
> (heading, tabs.controllers.label, và mọi chuỗi `tag`/`desc` chứa "CNC" trong `products.json`).

---

## 2. BỘ ĐIỀU KHIỂN (Controllers) — hiện có trong repo

Nguồn: `data/products.json`. 5 model, tất cả đang gắn nhãn "CNC" cần rà lại:

| Model | Trục | Màn hình | Loop | Giao tiếp |
|-------|------|----------|------|-----------|
| F54 | 4 | 5" | Open | Pulse Train |
| F86 | 6 | 8" | Open | Pulse Train · EtherCAT |
| F10T | 6 | 10.4" touch | Open | Pulse Train · EtherCAT |
| Astro 6AH | 6 | 8" | Closed | Pulse Train · EtherCAT · Mechatrolink MII/MIII |
| Astro 6AV | 6 | 8" | Closed | Pulse Train · EtherCAT · Mechatrolink MII/MIII |

**Việc cần làm:** thay "Bộ điều khiển CNC" → "Bộ điều khiển" trong `tag`, `desc`, `bundle.label`,
alt text và i18n. Giữ nội dung CNC trong phần mô tả kỹ thuật nếu là mô tả chức năng thực (G-code…).

---

## 3. SERVO (crawl từ savch.net)

Savch có **2 series servo**. Trang chi tiết không lộ part-number của motor/cable/connector
(nằm trong PDF tải về) — cần bổ sung sau từ catalog PDF.

### 3.1 SDV3 — Compact Series (紧凑系列)
Nguồn: https://savch.net/sdv3home.html (và /sdv3home/55.html)

- **Loại:** AC Servo Drive nhỏ gọn
- **Công suất:** 0.4 ~ 4.0 kW
- **Điện áp:** 1-pha 220V / 3-pha 220V / 3-pha 440V
- **Tần số:** 0 ~ 250 Hz
- **Giao tiếp:** EtherCAT · Modbus · CANopen · CANlink · PROFINET
- **Tài liệu:** User manual v1.2a; EtherCAT/CANopen app manual; wiring diagram; 2D/3D CAD; CE
- **Phần mềm:** SavchSoft_SRV v1.1.14.0710; USB driver; EtherCAT ESI file

### 3.2 SDA2 — High-Performance Series (高性能系列)
Nguồn: https://savch.net/sda2home.html

- **Loại:** Servo driver hiệu năng cao, đa dụng (universal high-performance)
- **Công suất:** 0.4 ~ 55 kW (dải rộng hơn SDV3 nhiều)
- **Điện áp:** 1-pha 220V / 3-pha 220V / 3-pha 380V
- **Tần số:** 0 ~ 250 Hz
- **Ứng dụng:** máy khắc laser, cánh tay robot, actuator tuyến tính, máy ép nhựa,
  gia công gỗ/kính, thiết bị hàn, máy dệt, máy CNC, dây chuyền đóng gói
- **Khác biệt vs SDV3:** dải công suất lớn hơn, định vị "high-performance", dùng cho tải nặng/robot

### 3.3 Cấu thành bộ Servo (4 nhóm con theo yêu cầu)

| Nhóm con | Trạng thái dữ liệu | Ghi chú |
|----------|--------------------|---------|
| **Driver** | ✅ Có (SDV3, SDA2) | Thông số ở trên |
| **Motor** | ⚠️ Thiếu part-number | Cần trích từ PDF catalog / dimensional drawings |
| **Cable** | ⚠️ Thiếu | Power cable + encoder cable, theo model motor |
| **Connector** | ⚠️ Thiếu | Đầu nối động lực + encoder |

> **Đề xuất bổ sung:** tải PDF datasheet SDV3/SDA2 từ savch.net để lấy bảng motor (flange size,
> rated torque, rpm), mã cable & connector. WebFetch không đọc được bảng trong PDF/ảnh.

---

## 4. BIẾN TẦN (Frequency Converters / Inverters) — crawl từ savch.net

Savch có **4 series biến tần**:

### 4.1 S600 / S600E — Mini Series (迷你系列)
Nguồn: https://savch.net/minixilieS600E.html

- **Định vị:** Biến tần đa dụng nhỏ gọn, kinh tế cho thiết bị tự động nhỏ
- **Công suất:** 0.4 ~ 5.5 kW
- **Điện áp:** 1-pha 220V / 3-pha 220V / 3-pha 440V
- **Tần số:** 0.1 ~ 500 Hz
- **Điều khiển:** V/f · SVC (sensorless vector control)
- **2 biến thể:**
  - **S600E** — Open-loop vector, motor **PM** (nam châm vĩnh cửu)
  - **S600** — Open-loop vector, motor **IM** (không đồng bộ)
- **Ứng dụng:** logistics, điện tử, gia công, dệt may, in ấn & đóng gói

### 4.2 S3100A / S3100E — General-Purpose Series (通用系列)
Nguồn: https://savch.net/tongyongxilieS3100AE.html

- **Định vị:** Biến tần vector đa dụng, DSP nâng cấp, độ chính xác tốc độ & đáp ứng moment cao
- **Công suất:** 0.4 ~ 630 kW (dải rất rộng)
- **Điện áp:** 1-pha 220V / 3-pha 220V / 3-pha 440V
- **Tần số:** 0.1 ~ 3200 Hz (tần số cao)
- **Điều khiển:** V/f · SVC
- **Motor:** hỗ trợ cả IM (không đồng bộ) và PM (đồng bộ nam châm vĩnh cửu)

### 4.3 Penta — Engineering Series (工程型系列)
Nguồn: https://savch.net/gongcheng.html

- **Sinus Penta 12T**
  - Chuyên cho **mỏ than** (coal mine)
  - Moment khởi động cao, đáp ứng nhanh
  - Thiết kế tản nhiệt substrate độc lập, không cần tháo rời khi bảo trì
- **Sinus Penta**
  - **5 chế độ điều khiển**
  - "Một máy, bốn tải" (one machine, four loads) + điều khiển từ xa
  - Ứng dụng: máy trộn, máy nén khí, máy nghiền, máy hút bụi, máy xay
  - Nhiều chứng chỉ an toàn
- ⚠️ Thiếu: dải công suất/điện áp cụ thể (nằm trong trang chi tiết/PDF)

### 4.4 Ultra-High-Speed Inverter (超高速变频器)
Nguồn: https://savch.net/chaogaosubianpinqi.html — thuộc nhóm 能源类 (Energy)

- **Tên:** Bộ điều khiển motor BLDC nam châm vĩnh cửu siêu tốc
- **Công suất:** 15 ~ 500 kW
- **Điện áp:** 220 ~ 2000 V
- **Tốc độ tối đa:** 36,000 rpm
- **Motor:** nam châm vĩnh cửu 2–6 cặp cực (2-6 pole pair PM)

---

## 5. BẢN ĐỒ ĐIỀU HƯỚNG SAVCH.NET (tham chiếu URL)

| Danh mục | URL |
|----------|-----|
| 变频器 Inverters (index) | /bianpingqi.html |
| 伺服 Servo (index) | /sifu.html |
| 能源类 Energy | /nengyuan.html |
| 驱控一体机 Drive-control integrated | /yitiji.html |
| 特殊类 Special | /teshu.html |
| 控制类 Control | /kongzhilei.html |
| 配件类 Accessories | /peijian.html |
| Mini S600/E | /minixilieS600E.html |
| General S3100A/E | /tongyongxilieS3100AE.html |
| Engineering Penta | /gongcheng.html |
| Ultra-high-speed | /chaogaosubianpinqi.html |
| Compact servo SDV3 | /sdv3home.html |
| High-perf servo SDA2 | /sda2home.html |
| Bus controller | /zongxiankongzhiqi.html |

---

## 6. VIỆC CÒN THIẾU / CẦN QUYẾT ĐỊNH

1. **Ảnh sản phẩm:** repo chưa có ảnh servo/biến tần Savch. Cần tải/chụp ảnh cho product cards.
2. **Part-number motor/cable/connector:** không lộ trên web HTML — nằm trong PDF datasheet. Cần
   tải PDF (WebFetch không đọc bảng PDF).
3. **Quyết định kinh doanh:** đưa sản phẩm thương hiệu Savch (Sanchuan) vào catalog QS —
   xác nhận đây là dòng QS phân phối/OEM, và tên hiển thị (giữ "Savch" hay rebrand "QS").
4. **Thông số Penta:** dải kW/V cụ thể cần crawl trang chi tiết Penta (chưa lộ ở trang index).
5. **Schema code:** taxonomy mới cần:
   - Thêm tab "Servo" và "Biến tần" trong `app/[locale]/products/page.tsx`
   - File data mới: `data/servo.json`, `data/inverter.json` (hoặc mở rộng `catalog.json` với category mới)
   - i18n: `messages/{vi,en}/product.json` — thêm `tabs.servo`, `tabs.inverter`, sửa `tabs.controllers` bỏ "CNC"
   - Bỏ "CNC" khỏi heading + toàn bộ `tag`/`desc`/alt trong `products.json`

---

## 7. QUYẾT ĐỊNH ĐÃ CHỐT (2026-07-22)

- **Servo v1:** cần **đầy đủ part-number** motor/cable/connector → phải tải & đọc PDF datasheet SDV3/SDA2.
- **Series lên web:** **tất cả** — SDV3 + SDA2 (servo), S600 + S3100 (biến tần), Penta + Ultra-high-speed.
- **Branding:** **Servo → rebrand QS**. Biến tần: giữ Savch (mặc định, chưa yêu cầu đổi).
- **Code:** làm **"bỏ CNC" trước**; chưa thêm tab Servo/Biến tần (chờ ảnh + part-number).

## 8. ĐÃ LÀM — Bỏ "CNC" khỏi "Bộ điều khiển"

Chỉ đổi **nhãn loại sản phẩm**; **giữ nguyên** "máy CNC" / "CNC machine" / "CNC milling" (máy thật mà controller điều khiển).

- `data/products.json` — tag/tagEn, desc/descEn, overview/overviewEn, toàn bộ alt gallery: "Bộ điều khiển CNC …" → "Bộ điều khiển …"; "CNC Controller/controller" → "Controller/controller".
- `messages/vi/product.json` + `messages/en/product.json` — heading, breadcrumb, tab label, sidebar heading, packageHeading, category, list subtitle.
- `lib/data/products.ts` — regex `localizeBaseAlt` cập nhật theo alt mới (bỏ "CNC").
- Comment trong `app/[locale]/products/page.tsx` + `product-category-tabs.tsx`.
- ✅ JSON hợp lệ, `tsc --noEmit` sạch.

## 9. CHƯA LÀM / CẦN QUYẾT ĐỊNH TIẾP

- **Brand copy chứa "CNC" (chưa đụng — quyết định marketing riêng):**
  - `messages/vi/about.json` — "đơn vị đầu tiên… bộ điều khiển CNC tại Việt Nam" (câu lịch sử, đổi sẽ đổi nghĩa).
  - `messages/en/common.json` — tagline "CNC controllers, Made in Vietnam".
  - `app/opengraph-image.tsx`, `lib/seo/og-image-template.tsx` — ảnh OG "Bộ điều khiển CNC / CNC Controller".
  - `data/catalog.json` — mô tả phụ kiện "cho bộ điều khiển CNC" (mô tả tương thích).
  - → **Hỏi:** có đổi luôn brand tagline + OG + about không, hay giữ (vì là định vị lịch sử)?
- **Servo/Biến tần lên web:** cần **PDF datasheet** (part-number motor/cable/connector) + **ảnh sản phẩm** + **bộ tên rebrand QS cho servo** trước khi dựng tab/data.
- **Penta:** thiếu dải kW/V cụ thể — cần crawl trang chi tiết Penta.
