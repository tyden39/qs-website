# Biến tần & Servo — Tách series + Tab Giới thiệu + Crawl bổ sung

**Ngày:** 2026-07-23
**Nguồn dữ liệu:** `data/series.json` (single source, loaded bởi `data/series.ts`)
**UI:** `app/[locale]/electronics/_components/series-detail.tsx`

## Bối cảnh / Nguyên nhân

- Tab "Giới thiệu" chỉ render từ `detail.intro` (text song ngữ có cấu trúc). Crawler lưu `detail.introduction` (mảng ảnh) — không có trong type, không render. Chỉ sdv3 có `intro` viết tay.
- savch trang danh mục `/bianpingqi.html` hiện 5 card biến tần: S600(IM), S600E(PM), S3100A/E, Sinus Penta, Sinus Penta 12T. Bên mình gộp: s600=(S600+S600E), penta=(Penta+Penta 12T).

## Quyết định (đã chốt với user)

1. Intro = viết lại text song ngữ VI/EN **+** giữ ảnh sơ đồ dạng gallery.
2. penta: giữ ảnh brochure IECCO.
3. Phạm vi: toàn bộ, gồm crawl mới uhs-bldc.
4. Tách cả 2 cặp: s600→S600(IM)+S600E(PM); penta→Sinus Penta + Sinus Penta 12T (→ 6 series biến tần).
5. Thứ tự: **tách series trước**, rồi intro/docs/uhs.

## Phases

### Phase A — Tách series (LÀM TRƯỚC)
- s600 → `s600` (S600, IM, `/minixilieS600E/8.html`) + `s600e` (S600E, PM, `/minixilieS600E/328.html`).
  - Bảng chọn model 220V/440V dùng chung → phân theo variant nếu nguồn phân; nếu chung thì giữ ở cả hai hoặc series chính.
- penta → `penta` (Sinus Penta 4T/400V, `/gongcheng/313.html`) + `penta-12t` (Penta 12T 1140V mỏ than, `/gongcheng/314.html`).
  - **PHÁT HIỆN:** toàn bộ ảnh `penta` hiện tại (intro 01-05, params 01-05, accessories 01-04) đều là brochure IECCO **12T** (1140V, 防爆). Nên:
    - `penta-12t` = LẤY toàn bộ nội dung penta hiện tại: bảng 12T (16 rows) + 5 ảnh intro brochure + 5 params + 4 accessories.
    - `penta` (Sinus Penta chuẩn 400V) = giữ bảng 4T (32 rows) + intro text (5 chế độ ĐK, máy trộn/nén/nghiền/hút bụi/mài). Ảnh riêng phải crawl từ `/gongcheng/313.html` (nếu có); nếu sparse thì chỉ text + bảng.
- Cập nhật `sourceUrl`, `name`, `tag/tagEn`, `desc/descEn`, `specs/specsEn`, ảnh hero, paramImages/accessoryImages/documentation cho từng variant.
- Redirect URL cũ nếu cần (kiểm tra `public/_redirects`).

### Phase B — UI render ảnh introduction
- `data/series.ts`: thêm `introduction?: SeriesPhoto[]` vào `SeriesDetail`.
- `lib/data/series.ts`: `SeriesDetailView.introduction` + map trong `toDetailView`.
- `series-detail.tsx`: introPanel render thêm `SeriesImageStrip` dưới text; điều kiện tab = `intro || introduction?.length`.

### Phase C — Viết intro song ngữ
- Author `detail.intro` (lead/leadEn, applications, sections song ngữ) cho: sda2, s600, s600e, s3100, penta, penta-12t (sdv3 đã có).
- Nội dung lấy từ ảnh nguồn (các block tính năng toàn chữ). Ảnh sơ đồ/biểu đồ/đấu dây giữ trong `introduction`.

### Phase D — Crawl docs còn thiếu
- penta + penta-12t: crawl 资料下载 (documentation) từ trang nguồn.

### Phase E — Crawl full uhs-bldc
- Từ `/chaogaosubianpinqi.html`: intro/specs/paramImages/documentation/accessories.

### Phase F — QA
- `npx tsc --noEmit`, eslint, build; kiểm tra render 6 trang biến tần + sda2.

## Acceptance
- [x] 6 series biến tần (s600, s600e, s3100, penta, penta-12t, uhs-bldc), mỗi cái 1 trang.
- [x] Tab Giới thiệu hiện đủ (text song ngữ + ảnh sơ đồ) cho mọi series có nội dung.
- [~] penta/penta-12t Tài liệu: **savch không có mục tải cho dòng Penta** (313/314 đều docs=0). Không tạo tab rỗng — đúng nguồn.
- [x] uhs-bldc có nội dung thật (intro text + specs 220-2000V/15-500kW/36000rpm). Nguồn savch rất sơ sài (không tab) → chỉ intro + specs hero.
- [x] tsc + eslint pass. Build bị hook chặn từ "build" — validate bằng tsc+eslint.

## Ghi chú tồn tại
- **penta chuẩn (400V)**: savch dùng chung brochure IECCO 12T cho cả 313 và 314 → không có ảnh 400V riêng. penta = intro text + bảng 4T (không ảnh), brochure chỉ ở penta-12t.
- **uhs-bldc Specs tab**: hero hiện 4 thông số chính; panel Specs trống (không có bảng model trên nguồn). Không bịa dữ liệu.
- Ảnh toàn chữ đã bỏ, thay bằng text: sda2/01, s600/02, s600e/02.
