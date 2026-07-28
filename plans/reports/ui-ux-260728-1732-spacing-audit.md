# Spacing Audit — padding / margin / gap toàn site

Date: 2026-07-28 · Scope: `app/[locale]/**`, `components/**`, `app/globals.css`

## Tóm tắt

Nhịp spacing tổng thể **ổn** — 86 lần `px-5`, 71 `py-12`, 67 `py-16`, 52 `py-24`, tức là hầu hết
section dùng cùng một thang `py-12 sm:py-16 lg:py-24`. Vấn đề không phải là "một chỗ nào đó
padding sai", mà là **thang đó bị áp dụng đồng loạt không phân cấp**, cộng thêm 4 chỗ cụ thể
cộng dồn ra khoảng trắng thật sự quá lố.

Xếp theo mức độ ảnh hưởng:

---

## 1. Khoảng trắng trước Footer — 256px desktop / 180px mobile (NẶNG NHẤT)

`components/Footer.tsx:16` → `mt-24`
`app/globals.css:656` → `.qs-foot-inner { padding: 64px … 0 }`

Ba lớp spacing chồng lên nhau ở cuối **mọi trang**:

| Viewport | section cuối `pb` | footer `mt-24` | `.qs-foot-inner` `padding-top` | **Tổng** |
|---|---|---|---|---|
| ≥1024px | 96px (`lg:py-24`) | 96px | 64px | **256px** |
| 640–1023px | 64px (`sm:py-16`) | 96px | 48px | **208px** |
| <640px | 48px (`py-12`) | 96px | 36px | **180px** |

`mt-24` **không responsive** — 96px giữ nguyên trên màn 375px. Trên iPhone SE (667px cao),
riêng khoảng chuyển giao content→footer đã chiếm **~27% chiều cao màn hình** và hoàn toàn
trống (chỉ là nền `#f5f3ee`).

Đây là chỗ duy nhất trong audit mà từ "quá lố" đúng nghĩa đen.

**Đề xuất:** `mt-24` → `mt-10 sm:mt-14 lg:mt-20`, hoặc bỏ hẳn `mt` và để `.qs-foot-inner`
padding-top gánh (footer đã có nền đen tự tách khỏi page rồi, không cần dải trống 96px nữa).

---

## 2. Section cùng nền dính nhau, mỗi bên `py-24` → hố trắng 192px

Hai section full-padding gặp nhau thì padding của chúng cộng dồn: 96 + 96 = **192px** trên
desktop. Qua chỗ **đổi nền**, 192px đó đọc được là "chuyển chương" — hợp lý. Nhưng khi hai
section **cùng nền**, ranh giới duy nhất là `border-line` 1px, nên cùng khoảng đó chỉ đọc ra
là trang bị đứt quãng.

> **Đính chính so với bản đầu:** danh sách 12 cặp ban đầu dựa trên grep so sánh các thẻ
> `<section>` liên tiếp trong source, bỏ qua các element chen giữa và các nhánh render có
> điều kiện. Sau khi build và parse HTML thật (kiểm tra sibling thực sự trong DOM), con số
> đúng là **82 chỗ trên 54 trang** (27 trang mỗi locale) — và **tất cả đều là `bg-white` +
> `bg-white`**. Các cặp từng bị liệt kê ở `page.tsx` (dải ticker chen giữa),
> `electronics/[slug]`, `series-detail.tsx`, `machine-building` đều là **dương tính giả** —
> chúng không phải sibling liền kề trong DOM.

Phân bố thật (đã verify từ HTML build ra):

| Nhóm trang | Số trang | Số chỗ / trang |
|---|---|---|
| `applications/[slug]` | 9 | 1–3 |
| `news/[slug]` + `news` index | 15 | 1 |
| `downloads` | 1 | 1 |
| `services/[slug]` | 1 | 1 |

Đáng chú ý: **`phay-cnc` chỉ có 1 chỗ, 8 trang application còn lại có 2–3**. Vì `phay-cnc`
không có dữ liệu `control` và `benefits` nên section đứng cạnh nó là nền khác. Đây là lý do
**không thể sửa tĩnh bằng class trên từng trang** — cùng một dòng JSX sẽ đúng ở 8 trang và sai
ở 1 trang.

**Đã sửa** — quy tắc adjacent-sibling trong `app/globals.css` (ngay trên `.qs-nav`):
chỉ khớp khi hai section cùng surface **thật sự** đứng cạnh nhau trong DOM đã render, nên tự
đúng với mọi nhánh điều kiện. Halve padding-top của section thứ hai:

| Viewport | Trước | Sau |
|---|---|---|
| ≥1024px | 96 + 96 = 192px | 96 + 48 = **144px** |
| 640–1023px | 64 + 64 = 128px | 64 + 32 = **96px** |
| <640px | 48 + 48 = 96px | 48 + 24 = **72px** |

Quy tắc khoá theo `sm:py-16` — bậc padding mà mọi section nhóm này dùng chung — nên section
nào không theo thang đó (vd. `machine-datasheet` dùng `py-10`) cũng tự động không bị đụng tới.

---

## 3. Nhịp section đơn điệu — không có phân cấp

> **Đã sửa một phần** — xem "Bậc compact cho CTA" bên dưới.


`py-12 sm:py-16 lg:py-24` được dùng **52 lần**, gán cho mọi loại section bất kể nội dung nặng
hay nhẹ. `app/[locale]/applications/[slug]/page.tsx` có **6 section liên tiếp** đúng chuỗi đó.

Trang detail đó, chỉ tính riêng padding của section: hero `pt-12 pb-16` (112px) + strengths
`py-10 sm:py-12` (96px) + 6 × 192px + footer 256px ≈ **1620px chrome dọc** trên desktop, trước
khi tính một dòng nội dung nào.

Rule liên quan (skill): *section-spacing-hierarchy* — cần các bậc rõ ràng theo mức phân cấp,
không phải một giá trị duy nhất.

**Đề xuất:** 3 bậc thay vì 1
- Chuyển chương / đổi nền: `py-12 sm:py-16 lg:py-24` (giữ nguyên)
- Section nội dung thường: `py-10 sm:py-12 lg:py-16`
- Section phụ trợ (stat strip, breadcrumb band, CTA): `py-8 sm:py-10 lg:py-12`

### Đã làm: bậc compact cho CTA (6 chỗ)

Gán bậc cho cả 50 section là 50 phán đoán cảm tính. Thay vào đó chỉ lấy nhóm có **lập luận
khách quan**: CTA dạng **card tối lồng trong section**. Card đã tự mang `p-7 sm:p-10 lg:p-12`,
nên section bọc thêm `lg:py-24` là **đếm khoảng thở hai lần** — 96px section + 48px card = 144px
từ mép chữ ra mép trang.

Hạ 6 section này xuống `py-8 sm:py-10 lg:py-12` → còn 48 + 48 = 96px.

| File | Dòng |
|---|---|
| `app/[locale]/applications/page.tsx` | 252 |
| `app/[locale]/applications/[slug]/page.tsx` | 540 |
| `app/[locale]/electronics/[slug]/page.tsx` | 724 |
| `app/[locale]/electronics/_components/catalog-detail.tsx` | 320 |
| `app/[locale]/electronics/_components/series-detail.tsx` | 441 |
| `app/[locale]/services/[slug]/page.tsx` | 241 |

Ở `services/[slug]:243` card dùng `p-12` phẳng (48px kể cả trên điện thoại), lệch với 5 card
anh em — đã đưa về `p-7 sm:p-10 lg:p-12`.

**Cố ý giữ nguyên `lg:py-24`:**
- **CTA dạng band căn giữa** — `services/page.tsx:161`, `machine-building/page.tsx:174`,
  `line-machine-detail.tsx:348`. Không có card bên trong, padding của section **chính là**
  khoảng thở; giảm sẽ bị chật.
- **`about/page.tsx:233`** — dải pull-quote nền tối, là một nhịp nghỉ thị giác có chủ đích.
- **`applications/[slug]:472`** — gallery ảnh, nội dung không hề mỏng.

### Đã tách: `components/contact-cta.tsx`

6 khối CTA card này gần như giống hệt nhau ở 6 file, nên đã gộp thành một component dùng
chung. Diff: **−92 dòng / +54 dòng** trên 6 file gọi, cộng 48 dòng component.

Props giữ tối thiểu — chỉ những gì thật sự khác giữa 6 chỗ:

| Prop | Dùng cho |
|---|---|
| `heading`, `body`, `ctaLabel` | nội dung, khác nhau ở cả 6 |
| `eyebrow?` | chỉ `applications/[slug]` có (từ `machine_.closing`) |
| `wrap` | `"wide"` (3 chỗ) hoặc `"detail"` (3 chỗ dùng `qs-wrap-detail`) |
| `bordered` | `border-t border-line` trên section — 3 có, 3 không |

Không nhận `href`: cả 6 đều trỏ `/contact`, thêm prop lúc này là thừa (YAGNI). Khi nào có
chỗ cần đích khác thì thêm.

**Hai chỗ chuẩn hoá làm đổi giao diện `services/[slug]`** — trước đó nó là bản lệch duy nhất:

| | Trước | Sau (theo 5 chỗ còn lại) |
|---|---|---|
| Nền thẻ | `bg-ink` (`#0a0a0a`), không viền | `bg-[#11120f]` + `border border-[#28261f]` |
| Chữ mô tả | `text-meta` | `text-body leading-relaxed` |

Thẻ sáng lên một chút, có thêm viền 1px, và chữ mô tả to hơn một bậc. Đây là hệ quả cố ý của
việc dùng chung; nếu muốn giữ nguyên bản cũ thì phải thêm prop biến thể.

---

## 4. Gap nhảy bậc sai breakpoint — 64px gap dọc khi vẫn còn 1 cột

Grid khai báo cột ở `md:` (768px) hoặc `lg:` (1024px) nhưng gap lại nhảy lên `sm:gap-16`
(640px). Trong vùng 640px → điểm chia cột, layout **vẫn là 1 cột** nên `gap-16` biến thành
**64px khoảng trống dọc** giữa hai khối xếp chồng.

| File | Dòng | Class | Vùng lỗi |
|---|---|---|---|
| `app/[locale]/about/page.tsx` | 73 | `grid lg:grid-cols-[1.05fr_1fr] gap-10 sm:gap-16` | 640–1023px (rộng nhất) |
| `app/[locale]/about/page.tsx` | 105 | `grid md:grid-cols-2 gap-10 sm:gap-16` | 640–767px |
| `app/[locale]/services/[slug]/page.tsx` | 88 | `grid md:grid-cols-[1.2fr_1fr] gap-10 sm:gap-16` | 640–767px |
| `app/[locale]/services/[slug]/page.tsx` | 173 | `grid md:grid-cols-[1fr_1.2fr] gap-10 sm:gap-16` | 640–767px |
| `app/[locale]/applications/[slug]/page.tsx` | 261 | `grid md:grid-cols-[1.2fr_1fr] gap-10 sm:gap-16` | 640–767px |
| `app/[locale]/applications/[slug]/page.tsx` | 393 | `grid md:grid-cols-[1fr_1.1fr] gap-10 sm:gap-16` | 640–767px |

Pattern **đúng** đã tồn tại trong repo — dùng làm mẫu sửa:
- `app/[locale]/contact/page.tsx:53` → `md:grid-cols-[1.2fr_1fr] gap-8 md:gap-16`
- `app/[locale]/news/[slug]/page.tsx:134` → `md:grid-cols-[1fr_320px] gap-8 md:gap-16`

**Đề xuất:** đổi `sm:gap-16` → `md:gap-16` (và ở `about/page.tsx:73` là `lg:gap-16`), khớp
prefix của gap với prefix của `grid-cols`.

---

## 5. Giá trị lẻ ngoài thang 4/8 — 100+ lần

`py-3.5` ×19, `mt-3.5` ×17, `mt-7` ×14, `mt-9` ×10, `gap-3.5` ×10, `mb-7` ×8, `pb-7` ×5,
`pb-14` ×5, `py-7` ×4, `gap-14` ×4, `mt-14` ×3, `gap-7` ×3, `mb-4.5` ×2, `pt-4.5` ×1…

Không phải lỗi thị giác — nhưng làm thang spacing mất tính hệ thống, và mỗi lần thêm component
mới lại phải đoán "chỗ này 7 hay 8". Rule *spacing-scale* (4/8pt).

**Khuyến nghị: KHÔNG viết lại đồng loạt.** Sửa ~100 giá trị sẽ tạo diff rất lớn, dịch chuyển
thị giác lắt nhắt ở khắp nơi, tốn công review, mà không giải quyết vấn đề nào người dùng thấy
được. Dọn dần khi đã sờ vào file vì lý do khác.

### 5b. Phần đáng làm trong #5: section header bị tách làm 3 phiên bản

`app/globals.css:168` đã có sẵn token `.qs-section-head`:

```
flex flex-col items-start gap-4 pb-5 border-b border-line mb-8
md:flex-row md:items-end md:justify-between md:gap-8 md:pb-6 md:mb-10
```

Được dùng **8 chỗ**. Nhưng `app/[locale]/page.tsx` tự viết lại đúng khối đó **4 lần**, với
spacing khác:

| Vị trí | Spacing | Lệch so với token |
|---|---|---|
| `page.tsx:121, 319, 367` | `gap-4 sm:gap-6 pb-5 sm:pb-7 mb-7 sm:mb-9 lg:mb-12` | `mb` 48px vs 40px, `pb` 28px vs 24px |
| `page.tsx:218` | `gap-6 pb-7` (không có `mb`) | thiếu hẳn margin dưới |

Cùng một thành phần thị giác, 3 nhịp khác nhau — đây mới là phần của #5 có ảnh hưởng thật.
Chênh lệch nhỏ (4–8px) nên **không phải "quá lố"**, mà là bất nhất.

**Đã gộp** cả 4 về `.qs-section-head`. Ba chỗ có hairline `qs-trace` chạy bên dưới nên giữ
thêm `relative` để neo phần tử absolute đó.

Bẫy đã tránh: header ở `:218` vốn **không có** margin dưới — khoảng cách do khối kế tiếp
(`<Reveal className="mt-7 sm:mt-9 lg:mt-12">`) gánh. Token lại tự mang `mb-8 md:mb-10`, nên
nếu chỉ đổi class mà giữ nguyên `mt` thì khoảng cách **cộng dồn thành 60px** — ngược hẳn mục
tiêu. Đã bỏ `mt` ở khối kế tiếp.

Nhịp header sau khi gộp (trước → sau): `<640px` 28→32px, `640–767` 36→32px, `768–1023`
36→40px, `≥1024` 48→40px. Trang chủ giờ dùng chung nhịp với 8 chỗ còn lại của site.

---

## 6. Outlier đơn lẻ — **đã sửa**

- `app/[locale]/page.tsx:296` → `lg:py-28` (112px) là chỗ duy nhất trong repo dùng `py-28`.
  Đã hạ về `lg:py-24`. (Đây là cột chữ của dải about 2 cột nền tối, padding của nó quyết định
  chiều cao dải — dải thấp đi 16px ở desktop.)
- `app/[locale]/applications/[slug]/page.tsx:300` → stat grid `gap-8 sm:gap-10`, row-gap 40px
  cho khối số liệu ngắn. Đã hạ về `gap-6 sm:gap-8`.

## Không phải vấn đề (đã kiểm tra, giữ nguyên)

- `--qs-bleed: 27vw` / `--qs-bleed-gap: 40px` (`globals.css:424`) — padding-right của
  `.qs-hero-copy` là kết quả tính toán từ chiều rộng figure tràn viền, có comment giải thích
  đầy đủ. Đúng chủ đích.
- `machine-datasheet.tsx` — 6 section `py-10 bg-paper` liên tiếp. Nhịp 80px giữa các khối là
  hợp lý cho datasheet; vấn đề ở đây (nếu có) là **thiếu** phân tách, không phải thừa.
- Gutter ngang `px-5 sm:px-8 lg:px-12` — nhất quán, đúng chuẩn adaptive gutter.
- Header `h-[64px] lg:h-[72px]`, menu `px-4 py-2.5` — touch target đạt chuẩn, không dư.

---

## Trạng thái

| # | Mục | Trạng thái |
|---|---|---|
| 1 | Footer `mt-24` | **Đã sửa** — `mt-10 sm:mt-14 lg:mt-20` |
| 2 | Section cùng nền | **Đã sửa** — quy tắc sibling trong `globals.css` |
| 3 | Phân cấp bậc cho section | **Đã sửa phần CTA card** (6 chỗ); phần còn lại chưa |
| 4 | `sm:gap-16` → `md:gap-16` | **Đã sửa** — 6 chỗ |
| 5 | Giá trị lẻ ngoài thang 4/8 | **Khuyến nghị không làm đồng loạt** — chốt giữ nguyên |
| 5b | 4 section header tự viết ở `page.tsx` | **Đã gộp** về `.qs-section-head` |
| 6 | `lg:py-28`, stat grid `sm:gap-10` | **Đã sửa** |

Verify: `yarn build` xanh, `yarn lint` không phát sinh lỗi mới (1 error + 2 warning còn lại
là có sẵn ở `product-category-tree.tsx` và `product-video.tsx`, ngoài phạm vi sửa).

Đo lại từ HTML build ra sau khi sửa: số chỗ còn được quy tắc sibling siết **82 → 64 trên 52
trang**; 18 chỗ rời khỏi quy tắc vì section thứ hai nay là CTA bậc compact, tự đã mỏng. 66
section CTA render ở bậc compact.

## Câu hỏi còn mở

- Dải trống trước footer là chủ đích thiết kế (dải thở trước khối đen) hay mặc định copy lại?
  Hiện đã cho responsive và giữ lại ~80% giá trị cũ ở desktop, chỉ cắt mạnh ở mobile.
- `services/[slug]` giờ dùng chung `ContactCta` nên thẻ CTA của nó đổi nền/viền/cỡ chữ mô tả
  (chi tiết ở mục 3). Nếu bản cũ là chủ đích thì cần thêm prop biến thể — hiện coi là chuẩn hoá.

**Đã chốt:** mục 3 phần còn lại (44 section ngoài nhóm CTA card) **giữ nguyên** một bậc duy
nhất. Mục 5 **không** viết lại đồng loạt. 6 khối CTA đã tách thành component dùng chung.
- Ngoài phạm vi audit: lúc 17:46 có thay đổi từ ngoài session này — `cnc-feature-video.tsx` bị
  xoá và section video gỡ khỏi `machine-building/page.tsx`. Việc này khiến section danh mục
  (`page.tsx:163`, `bg-paper`) và section CTA (`:174`, `bg-paper`) thành liền kề cùng nền —
  một hố 192px mới. Quy tắc ở mục 2 tự bắt được mà không ai phải sửa dòng nào.
