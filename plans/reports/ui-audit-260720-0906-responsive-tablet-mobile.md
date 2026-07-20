# Responsive Audit — Tablet & Mobile (qs-website)

Date: 2026-07-20 · Scope: Header, home, product detail, CNC datasheet, footer, search, forms.
Chuẩn tham chiếu: Apple HIG / Material Design / WCAG (44px touch target, 16px body mobile, hover-vs-tap).

## P1 — Nghiêm trọng (touch / tablet)

### 1. AppDeck filmstrip hover-only nhưng hiển thị trên tablet
- `components/app-deck.tsx:48` (`hidden md:flex`), CSS `.qs-strip:hover` `app/globals.css:288-313`.
- Tablet (768px+) là touch: không có hover → panel không thể mở bằng tay; tap = `<Link>` điều hướng ngay. User không đọc được mô tả panel nào ngoài panel autoplay đang mở.
- Fix options: (a) đổi ngưỡng `md:` → `lg:` để tablet dùng stacked cards mobile; (b) trên `(pointer: coarse)`: tap 1 mở panel, tap 2 điều hướng (chuyển active bằng onClick + preventDefault khi chưa mở); (c) giữ autoplay + thêm nút "Xem chi tiết" rõ ràng trong panel mở.
- Khuyến nghị: (a) nhanh nhất, (b) đúng UX nhất.

### 2. Hero slider không có swipe trên touch
- `components/hero-slider.tsx` — chỉ điều khiển bằng phím ←/→ và selector bar nằm cuối hero (phải cuộn qua ~3 màn hình mới thấy trên phone).
- Fix: thêm touch swipe (pointerdown/up threshold ~40px) hoặc scroll-snap; hoặc thêm dots/arrows nổi ngay cạnh ảnh trên mobile.

### 3. Touch target < 44px
- `.qs-icon-btn` 36×36 (`app/globals.css:499`) — nút search + hamburger.
- Nút đóng search `w-8 h-8` = 32px (`components/SearchPanel.tsx` line ~64).
- Fix: 44px trên coarse pointer (`@media (pointer:coarse){ .qs-icon-btn{width:44px;height:44px} }`) hoặc mở rộng hit-area bằng pseudo-element; nav mobile còn nhiều chỗ trống nên tăng thật kích thước là ổn.

### 4. Bảng thông số multi-protocol mất ngữ cảnh khi cuộn ngang
- `app/[locale]/products/[slug]/page.tsx:114-160` — `minWidth: 132 + n*150` (≥582px với 3 protocol) trong `overflow-x-auto`.
- Mobile: cuộn phải → mất cột tên thông số; không có sticky column, không có fade/hint báo cuộn được.
- Fix: (a) `position: sticky; left: 0` cho cột label + shadow phải; (b) gradient fade mép phải + hint "vuốt ngang để xem"; (c) mobile-only: đổi thành accordion theo protocol (mỗi protocol 1 card 2 cột label/value).

## P2 — Cao (bố cục mobile)

### 5. Hero trang chủ quá dài trên mobile (~3 màn hình trước nội dung đầu tiên)
- `hero-slider.tsx:106` `min-h-[clamp(580px,84vh,860px)]` + ảnh `order-first` clamp(300px,44vh,560px) + h1 46px + desc `min-h-[9.5rem]` + 2 CTA + spec list `min-h-[17.5rem]` + selector 3 hàng.
- Vi phạm content-priority: mobile nên thấy value prop + CTA trong 1–1.5 màn hình.
- Fix: mobile ẩn/thu gọn spec readout (2 cột chip compact hoặc `<details>` "Thông số nhanh"); selector 3 hàng → dots; giảm `min-h` ảnh còn ~36vh; bỏ `min-h` desc (xem #6).

### 6. `min-h` đặt trước cho copy gây khoảng trống lớn
- `hero-slider.tsx:129` desc `min-h-[9.5rem]` (152px) và spec `min-h-[17.5rem]` — copy ngắn → trống trải rõ trên mobile.
- Fix: `line-clamp-4` + min-h theo đúng số dòng clamp, hoặc đo max height theo locale lúc build; chấp nhận reflow nhỏ đổi lại gọn hơn.

### 7. Tablet (768–1023px) là "mobile kéo giãn"
- Nav hamburger dưới `lg` dù tablet ngang đủ chỗ; hero 1 cột; hero stats `grid-cols-2` tới tận lg; datasheet 2 panel xếp dọc.
- Fix đề xuất tier `md`: hero 2 cột (text trái / ảnh phải, spec chips dưới); `heroStats` → `md:grid-cols-4` (`products/[slug]/page.tsx:485`); machine hero `md:grid-cols-2`; cân nhắc nav rút gọn (5 mục chính, không cần hamburger) ở md–lg nếu label vừa.

### 8. Search panel lệch mốc nav mobile
- `app/globals.css:521` `.qs-search-panel{ top:72px }` — nav mobile cao 64px (+topstrip khi ở đầu trang) → panel chồng lên nav hoặc hở 8px tuỳ scroll.
- Fix: đồng bộ mốc như mobile drawer (`top-16 lg:top-[72px]`) hoặc anchor `absolute top-full` vào `.qs-nav`.

### 9. Download list mobile mất ngữ cảnh cột
- `products/[slug]/page.tsx:380` header `hidden md:grid` → mobile hiện version/date trơ trọi không nhãn.
- Fix: mobile thêm micro-label inline ("Phiên bản · 2025/01") hoặc gộp version vào dòng tên.

## P3 — Trung bình (typography & nội dung)

### 10. Cỡ chữ dưới chuẩn mobile
- Body 15px (`globals.css:47`); mô tả cards 13–13.5px; mono labels 9–10px (fig caption hero `text-[9px]` trên nền tối, muted #8a8676).
- Fix: mobile body ≥16px cho đoạn văn chính (`qs-lede`, prose, desc card); micro-mono 9px chỉ dùng thuần trang trí — caption mang thông tin nâng ≥11px; kiểm tra contrast muted-on-dark (#8a8676 / #0a0a0a ≈ 4.0:1 — dưới 4.5:1 cho chữ nhỏ).

### 11. Hotline bị ẩn đúng nơi cần nhất
- `Header.tsx:50` topstrip hotline `hidden md:inline` — mobile (nơi tap-to-call giá trị nhất) không thấy; chỉ còn trong drawer + footer.
- Fix: mobile topstrip ưu tiên hotline thay tagline, hoặc floating-contact đảm nhiệm (xác nhận floating-contact có nút gọi).

### 12. Locale switcher <640px chỉ nằm trong drawer (`Header.tsx:86,141`) — khó phát hiện; cân nhắc giữ ở bar (chỉ icon cờ).

### 13. Nội dung mô tả nhóm ảnh tour bị ẩn mobile
- `products/[slug]/page.tsx:303` `hidden sm:block` — mobile mất câu giải thích nhóm ("ảnh thực tế / màn hình UI / lắp trên máy").
- Fix: hiện bản rút gọn dưới tag thay vì ẩn hẳn.

### 14. Footer lệch hệ breakpoint + link chết
- `globals.css:664-672` breakpoints 900/560 tự chế lệch hệ 640/768/1024 của Tailwind (breakpoint-consistency).
- `Footer.tsx:91` "Privacy · Terms · Cookies" là text không có href — hoặc làm link thật hoặc bỏ.

### 15. Chi tiết nhỏ
- Home product cards `p-8` + stage `min-h-[248px]` trên mobile → giảm `p-5` mobile (`app/[locale]/page.tsx:132,142`).
- Lightbox (`product-image-lightbox`, `machine-hero-gallery`) không có swipe chuyển ảnh trên touch — chỉ nút prev/next; thêm swipe.
- `.qs-wrap` (`globals.css:73`, px-12 cố định) không còn nơi nào dùng → dead CSS, xoá.
- Product detail h1 `clamp(44px,7vw,92px)` — tag dài xuống dòng nhiều trên 360px; cân nhắc floor 36–40px.

## Điểm đã làm tốt (giữ nguyên)
- `prefers-reduced-motion` phủ toàn diện mọi animation.
- Mobile drawer chuẩn: body scroll-lock, backdrop, aria-expanded/controls, đóng theo route.
- Form input `text-base sm:text-sm` → chống iOS auto-zoom.
- `100dvh` thay 100vh; tab strip sticky offset khớp nav 64/72; ảnh dùng next/image + sizes + lazy đúng.
- Sticky tab + hash deep-link ở product detail hoạt động tốt.

## Thứ tự triển khai đề xuất
1. **Sprint 1 (touch):** #1 AppDeck, #3 touch targets, #2 hero swipe, #8 search panel offset.
2. **Sprint 2 (mobile layout):** #5+#6 hero mobile, #4 spec table sticky column, #9 downloads.
3. **Sprint 3 (tablet + type):** #7 md-tier, #10 type scale, #11–#15.

## Unresolved questions
- Tablet có nằm trong traffic đáng kể không (analytics)? Quyết định đầu tư tier `md` riêng hay chỉ fix touch.
- AppDeck: chọn phương án (a) stacked tới lg hay (b) tap-to-expand?
- Spec table mobile: sticky column hay accordion theo protocol (ảnh hưởng cách so sánh protocol)?
- "Privacy · Terms · Cookies": có trang thật để link không, hay bỏ?

---

## Implementation status (2026-07-20, cùng ngày)

Decisions: md tier = YES · AppDeck = option (a) · spec table = accordion per protocol · Privacy/Terms = bỏ.

Done (build + tsc pass; `yarn lint` hỏng sẵn — `next lint` không tương thích, pre-existing):
- #1 AppDeck → `hidden lg:flex`; mobile/tablet stacked cards `lg:hidden` + 2-up từ sm.
- #2 Hero swipe + #15 lightbox/gallery swipe → hook mới `lib/use-swipe.ts` dùng chung (hero-slider, product-image-lightbox, machine-hero-gallery, product-hero-gallery).
- #3 `.qs-icon-btn` 44px trên `pointer: coarse`; nút đóng search 44px.
- #4+quyết định: SpecDatasheet multi-protocol → `SpecAccordion` (details/summary per protocol) dưới md; single-protocol giữ grid.
- #5+#6 Hero mobile: bỏ min-h 84vh mobile, ảnh clamp 240px/36vh, desc 16px + line-clamp-4 + min-h khớp clamp, spec list 2-col grid (md 4-col full-width, lg cột dọc như cũ), selector 3 hàng → dots 44px dưới sm.
- #7 md tier: home hero 2-col md (specs span 2), About/CTA/news-feed/video-reel md 2-col, product hero + heroStats md, machine hero md 2-col.
- #8 `.qs-search-panel` top 64px (<lg) / 72px (lg+).
- #9 Version có nhãn inline dưới md ở download list.
- #10 body 16px mặc định, 15px từ lg; fig caption 9px→10px màu sáng hơn.
- #11 Hotline tel: hiện trên topstrip mobile.
- #13 Tour group desc hiện bản mobile dưới tag row.
- #14 Footer breakpoints → 1023/639; bỏ "Privacy · Terms · Cookies".
- Bonus: `px-12` cố định ở 10 trang (services, news, about, downloads, applications, search, not-found) → `px-5 sm:px-8 lg:px-12`; xoá `.qs-wrap` chết; h1 product detail floor 44→36px.

Deferred (chưa làm, lý do):
- Locale switcher <640px vẫn trong drawer — bar 360px không đủ chỗ nếu thêm VI/EN.
- Nav rút gọn ở md–lg (bỏ hamburger) — cần cân nhắc label dài VI, để sau.
- Text phụ 13–13.5px trên card giữ nguyên — đã bù bằng body 16px; nâng tiếp nếu có feedback thực tế.
