# Trang chi tiết series servo & biến tần (datasheet-grade)

Status: **DONE** — Phase 1 (nền) + Phase 2 (servo datasheet) + Phase 3 (S600 + Penta;
UHS-BLDC giữ spec series) + Phase 4 (ảnh + Product JSON-LD) đều DONE.
Branch: `feat/products-series-detail`.

## Mục tiêu
Mỗi series servo (5) và biến tần (4) có trang chi tiết `/products/[slug]` datasheet-grade:
bảng mã model đầy đủ (kW/điện áp/dòng điện/frame), quy tắc mã, spec kỹ thuật chung,
downloads, CTA báo giá. Song ngữ vi/en, tương thích static export.

## Kiến trúc (đã chốt)
- Route: **mở rộng `app/[locale]/products/[slug]/page.tsx`** resolve thêm series
  (`getSeriesBySlug`). 9 slug series (sdv3, sda2, sch-motor, dl-power-cable,
  sa2fk-encoder-cable, s600, s3100, penta, uhs-bldc) KHÔNG đụng slug catalog/product.
- Data: thêm khối `detail` vào `data/series.json` + type trong `data/series.ts`;
  view/resolver trong `lib/data/series.ts` (`getSeriesBySlug`, `getSeriesSlugs`).
  `generateStaticParams` gộp thêm series slugs.
- Component detail series mới (tái dùng khung `catalog-detail`/`product-detail-tabs`):
  hero + bảng model (dài, scroll-x, accordion mobile) + spec chung + downloads + CTA.
- `SeriesCard` (list): đổi CTA "Nhận báo giá →" → "Xem chi tiết →" (quote demote) khi
  series có trang — theo ghi chú IA `products-ia-ui-design.md` (primary flips same slot).
- SEO: Product + breadcrumb JSON-LD (tái dùng `lib/seo/jsonld`), alternates, sitemap
  thêm series slugs.
- i18n: keys mới cho detail series ở `messages/{vi,en}/product.json`.

## Trạng thái dữ liệu
| Series | Bảng model | Nguồn | Trạng thái |
|---|---|---|---|
| SDV3 (driver) + SCH motor + cáp | ✅ đầy đủ | `260722-0903…/servo-subgroup-crawl.md` | cần cấu trúc hóa vào data |
| SDA2 (driver + frame lớn) | ✅ đầy đủ | như trên | như trên |
| S3100A/E (biến tần) | ✅ đã trích | `inverter-crawl-s3100.md` (~40 model) | ✅ seed (Phase 1) |
| S600/S600E | ✅ đầy đủ | brochure `savch.net/minixilieS600E/8.html` (bộ `/uploads/20251014/*.png`) | ✅ seed 2 bảng 220 V/440 V (10 model) |
| Penta (12T/1140 V) | ✅ đầy đủ | ảnh `/uploads/20250715/*.jpg` (S33/S53/S63) | ✅ seed naming + 16 model 1140 V |
| UHS-BLDC | ❌ không có | trang savch chỉ có ảnh sản phẩm, không có bảng chọn | giữ spec series (fallback "liên hệ") |

Ảnh render hero: servo có sẵn PDF-render trong `260722-0903…/assets/renders/` (chưa vào
`public/`); biến tần mới có web-thumb thấp trong `public/img/products/series/`.

## Phát hiện quan trọng (từ crawl 2026-07-22)
- Bảng model biến tần Savch **nằm trong ảnh/PDF brochure**, không có HTML — phải đọc bằng
  mắt để chép chính xác (dòng điện/kW là số an toàn điện, không OCR).
- Mỗi series biến tần ~14 ảnh brochure → transcription là công lớn, cần làm từng series.
- Server savch.net chậm/hay đứt tải → tải có retry, một số ảnh cần tải lại.

## Phases (mỗi phase độc lập shippable)
1. **Nền data + route — ✅ DONE (2026-07-22).** Type `SeriesDetail`/`SeriesModelTable` trong
   `data/series.ts`; resolver `getSeriesBySlug`/`getSeriesSlugs` + `SeriesDetailView` trong
   `lib/data/series.ts`; component `_components/series-detail.tsx` (hero → spec series →
   naming → bảng model → CTA, fallback "coming soon" khi chưa có detail); route
   `[slug]/page.tsx` resolve series (metadata + generateStaticParams); `SeriesCard` flip CTA
   → "Xem chi tiết"; sitemap + i18n vi/en (`product.seriesDetail`). **S3100 detail seed đầy
   đủ** (40 model). Verified: tsc + lint + i18n parity + build export 9/9 trang × 2 locale,
   S3100 render đúng 207 `<td>`.
2. **Servo datasheet — ✅ DONE (2026-07-22).** Seed `detail` cho 5 series servo trong
   `data/series.json`: `sch-motor` (naming + 1 bảng 51 model, filterCol=`volt` → chip
   220 V/380 V, gộp H series SDV3 + frame lớn SDA2 + note HS/fan-cooled); `dl-power-cable`
   & `sa2fk-encoder-cable` (naming + bảng tương thích, cell encoder giữ token neutral
   INC/ABS/2500-line); `sdv3` (naming-only, trỏ sang cột "Driver ghép" bảng motor);
   `sda2` (naming + bảng 7 cỡ khung theo công suất). Component client mới
   `_components/series-model-table.tsx` (chip filter theo filterCol, tái dùng style chip
   group-list); `series-detail.tsx` chuyển sang dùng nó + guard ẩn mục bảng khi
   `tables` rỗng (naming-only). Verified: tsc + lint (chỉ warning cũ) + build export;
   motor render 408 `<td>` (51×8) × 2 locale, chip 220 V/380 V hiện, SDA2 21 `<td>`,
   SDV3 không render mục bảng.
3. **Biến tần datasheet còn lại — ✅ DONE (2026-07-22, trừ UHS).**
   - **S600/S600E**: brochure thật nằm ở sub-page `savch.net/minixilieS600E/8.html` (bộ
     `/uploads/20251014/*.png`), KHÔNG phải trang landing `/S600.html` (chỉ có banner+ảnh
     sản phẩm). Seed `detail`: naming (`S600/E-2T|4T<kW>G`, IM/PM) + 2 bảng
     `220 V` (5 model) và `440 V` (5 model) — kW/HP/kVA/dòng ra/dòng vào 1φ&3φ, đọc mắt
     full-res, chính xác số A. Render 55 `<td>` × 2 locale.
   - **Penta**: brochure = IECCO **Sinus Penta 1140 V / 12 xung** (= bản Penta 12T; Savch OEM
     lại, brand giữ Savch theo quyết định cũ). Seed `detail`: naming decode config-string
     (`SINUS PENTA <spec> 12T XA2KD`) + 1 bảng chọn 16 model (khung S33×3, S53×7, S63×6),
     cột std/heavy kW-A + Inom, `filterCol=frame` (chip S33/S53/S63). Bỏ cột 轻载(light) vì
     brochure in lỗi ở model 0076 (light KW < standard); dùng standard/heavy là số sạch.
     Render 112 `<td>` × 2 locale.
   - **UHS-BLDC**: savch KHÔNG publish bảng chọn (trang chỉ ảnh sản phẩm; sub-page `/8.html`
     chỉ trỏ lại brochure S600). Là dòng engineering cấu hình theo đơn (15–500 kW, per-order)
     → giữ spec series là FACT, trang hiện fallback "liên hệ để tra mã đầy đủ". Cần datasheet
     PDF riêng từ hãng nếu muốn bảng — chưa có nguồn.
   - Format `data/series.json`: giữ style compact inline `{ "l", "v" }` (printer ngưỡng 140
     ký tự: spec/col/row inline, image/naming.lines expand) để diff sạch.
4. **Ảnh + polish — ✅ DONE (2026-07-22).** Hero webp cho 7 series đã vào
   `public/img/products/series/` (2 cáp DL/SA2FK giữ khung fallback tên — chưa có ảnh).
   `buildSeriesProduct` trong `lib/seo/jsonld.tsx` (Product node priceless, `sku`=slug,
   image tuyệt đối qua `APP_URL` hoặc fallback `og-default.png` khi series không có ảnh);
   `series-detail.tsx` emit Product + breadcrumb JSON-LD. Downloads mapping: **bỏ** —
   không có entry download nào trỏ series slug (`data/downloads.json`), YAGNI. Verified:
   tsc + lint (chỉ warning cũ) + build export 9/9 × 2 locale; s600/penta có image tuyệt
   đối, dl-power-cable fallback og-default, mỗi trang đúng 1 Product + 1 Breadcrumb node.

## Rủi ro
- Mixed-fidelity: series có bảng đầy đủ cạnh series chưa → giữ "spec series là FACT",
  không dead link, phần bảng thiếu để "liên hệ để tra mã đầy đủ" thay vì bỏ trống.
- Rebrand servo QS: giữ mã SCH/DL/SA2FK nguyên (ordering parity) — quyết định cũ.

## Quyết định còn treo
- ~~Connector~~ → chốt: đầu nối đi liền bộ cáp, ghi trong copy DL-/SA2FK- (không tách card).
- ~~Motor 1 card hay tách~~ → chốt: 1 card `sch-motor` gộp, lọc theo điện áp trong bảng.
- ~~Penta/UHS có bảng kW-selection gọn không~~ → chốt: Penta CÓ bảng 1140 V (16 model, đã seed);
  UHS KHÔNG có bảng publish (per-order) → giữ spec series.
