# Cố vấn: Tối ưu animation cho các danh sách sweep

Ngày: 2026-07-21 · Phạm vi: `app/globals.css` + các consumer list/grid (products, cnc, applications, news, home, footer).
Vai trò: advisory-only, không sửa code.

## TL;DR

Chi phí hiệu năng thật sự không nằm ở "quá nhiều item" (danh sách rất ngắn: 7 sản phẩm, 9 catalog, 7 máy CNC) mà ở **một class CSS bị lặp lại 16 lần khắp site — `.qs-scan`** (`app/globals.css:256-267`) — chạy `animation: qs-scan 4.8s infinite alternate` animate thuộc tính `top` (không composite) + `box-shadow` blur (paint nặng), và **vẫn chạy vô hạn ngay cả khi phần tử đang `opacity:0`** (product-bundle-card, catalog-product-card, app-deck). Đây là điểm sửa có đòn bẩy cao nhất, sửa 1 nơi (globals.css) là fix toàn site. Vấn đề thứ hai là **hai cơ chế stagger song song không nhất quán**: `Reveal` (IntersectionObserver, tốt, đã có ở nhiều nơi) vs inline `animationDelay={i*Xms}` phát ngay khi mount không gate theo scroll (hero-slider, news-feed, home page qs-scan/qs-float, applications page). Khuyến nghị: chuẩn hoá về `Reveal` + `--reveal-delay`, sửa `.qs-scan` sang `transform` và tắt animation khi ẩn bằng `animation-play-state`, giữ nguyên logic tab/carousel hiện có.

## Bối cảnh đã xác minh (sửa lại giả định trong prompt)

- **Không có `clip-path` trong keyframe `qs-sweep-in`** (`app/globals.css:283-287`). `clip-path` chỉ xuất hiện đúng 1 lần, trong khối `prefers-reduced-motion` để reset về `none` (`app/globals.css:508`) — có thể là tàn dư từ version cũ, không phải animation đang chạy. Không cần tối ưu clip-path vì nó không tồn tại trong hiệu ứng thật.
- "Glint lặp vô hạn trên mọi tile" (`app/globals.css:692-714`) chỉ áp dụng cho **Footer** (`.qs-foot-social-row`, `.qs-foot-contact-row` — 3 social + 3 contact = 6 phần tử cố định), không phải danh sách sản phẩm/tin tức. Khối này đã có `prefers-reduced-motion` fallback đầy đủ (`app/globals.css:711-714`) và stagger cố định qua `:nth-child` — không cần sửa gấp.
- Các trang chi tiết CNC (`machine-hero-gallery.tsx`, `workpiece-compare.tsx`, `line-machine-detail.tsx`) **không dùng sweep/stagger entrance** — chỉ hover/transition thường. Nằm ngoài phạm vi vấn đề.

## 1. Chi phí hiệu năng thật — bằng chứng file:line

### 1a. `.qs-scan` — vấn đề lớn nhất, lặp lại 16 lần

```css
/* app/globals.css:256-267 */
.qs-scan {
  position: absolute; left: 0; right: 0; top: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(232,200,120,.9), transparent);
  box-shadow: 0 0 14px 2px rgba(232,200,120,.45);
  animation: qs-scan 4.8s ease-in-out infinite alternate;
}
@keyframes qs-scan {
  0%   { top: 0;    opacity: 0; }
  12%  { opacity: 1; }
  88%  { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
```

Vấn đề kép:
- **Animate `top`** thay vì `transform: translateY()` — trình duyệt phải tính lại vị trí box (self-layout) và paint lại mỗi frame, không được đẩy sang compositor thread như transform. Với `box-shadow` blur cùng lúc, mỗi frame là một lần paint tốn kém (blur là phép toán paint nặng nhất trong CSS).
- **Không có `display:none`/`animation-play-state:paused` khi phần tử vô hình.** Ở `components/products/catalog-product-card.tsx:37` và `components/products/product-bundle-card.tsx:46`:
  ```tsx
  <span aria-hidden className="qs-scan opacity-0 group-hover:opacity-100" />
  ```
  `opacity:0` **không dừng animation** — trình duyệt vẫn tick timer, tính toán `top`/paint mỗi frame cho một layer vô hình. Trên `/products`, tab đang active có 7-9 card cùng lúc chạy animation này vĩnh viễn dù không hover — xác nhận qua `app/[locale]/products/_components/product-category-tabs.tsx:139` dùng `hidden={i !== active}` (HTML `hidden` = `display:none`, nên tab không active được tạm dừng đúng — chỉ tab active mới tốn).
  
  Tương tự `components/app-deck.tsx:76`: `.qs-open ... qs-scan` chạy vô hạn trên cả 4 panel dù panel đóng có `opacity:0` (`app/globals.css:358`).
- Các nơi khác dùng `.qs-scan` luôn hiển thị (không opacity-gate) nên ít nhất animation đó "có ý nghĩa" về mặt hình ảnh, nhưng vẫn chạy `top` không composite: `app/[locale]/page.tsx:164,255` (home, stagger theo `i*1.5s`/`i*1.2s`), `components/news-feed.tsx:86`, `components/video-reel.tsx:124`, `app/[locale]/cnc/_components/cnc-feature-video.tsx:50`, `app/[locale]/cnc/_components/machine-annotation.tsx:35`, `components/hero-slider.tsx:165`, `app/[locale]/about/page.tsx:91,130,145`, `app/[locale]/applications/page.tsx:96,130`, `app/[locale]/applications/[slug]/page.tsx:118`, `app/[locale]/products/page.tsx:123`, `app/[locale]/downloads/page.tsx:100`.

Vì `.qs-scan` là 1 class dùng chung, **sửa keyframe 1 lần trong `globals.css` fix toàn bộ 16 điểm gọi** — đòn bẩy cao, rủi ro thấp.

### 1b. Không phải "hàng trăm item" — nhưng vẫn đáng dọn

`data/products.json` = 7 sản phẩm, `data/catalog.json` = 9, `data/machines.json` = 7 (đếm bằng `grep -c '"slug"'`). Với quy mô này, layout thrash từ nhiều layer cùng lúc trong grid dài **không phải rủi ro thật** — YAGNI: không cần virtualization/batching phức tạp. Chi phí thật là animation **vô hạn, luôn bật**, không phải số lượng item.

### 1c. `.qs-float` — đối chiếu, đây là ví dụ làm ĐÚNG

`app/globals.css:249-253`: `.qs-float { animation: qs-float 6.5s ease-in-out infinite; }`, keyframe chỉ animate `transform: translateY()` — composite-only, rẻ. Dùng ở `app/[locale]/page.tsx:181` với stagger `animationDelay: i*1.2s`. **Không cần sửa** — dùng làm mẫu tham chiếu khi sửa `.qs-scan`.

## 2. Chuẩn hoá stagger cho danh sách — so sánh 3 hướng

Hiện trạng đã có **2 cơ chế song song, không nhất quán**:

| Cơ chế | Nơi dùng | Cách hoạt động |
|---|---|---|
| `Reveal` (`components/reveal.tsx`) | `app/[locale]/page.tsx` (31 lần), `about`, `cnc/page.tsx`, `applications/[slug]`, `cnc/_components/machine-datasheet.tsx`, `cnc/_components/line-machine-detail.tsx` | 1 `IntersectionObserver` mỗi instance, one-shot (`obs.disconnect()` sau khi visible), gắn class `is-visible`, delay qua CSS custom property `--reveal-delay` (`app/globals.css:196-206`), `will-change` chỉ giữ khi chưa visible rồi thả ra (đã tự comment lý do ở dòng 202-204: giữ `will-change` vĩnh viễn làm border 1px bị bo tròn sai trên grid). Đây là pattern làm đúng. |
| Inline `animationDelay` + `qs-rise`/`qs-sweep-in`/`qs-scan`/`qs-float` | `components/hero-slider.tsx:79` (`sweep()`), `components/news-feed.tsx:120`, `app/[locale]/page.tsx:164,181,255`, `app/[locale]/applications/page.tsx:130` | Animation chạy **ngay khi mount**, không gate theo viewport. `both` fill-mode giữ `opacity:0` cho tới khi delay trôi qua (`app/globals.css:275,283`) |

Đây chính là điểm "thiếu nhất quán" mà user hỏi — không phải do performance mà do 2 hệ thống độc lập cùng làm một việc (staggered entrance), maintainers phải nhớ dùng cái nào ở đâu.

**Đánh giá 3 hướng:**

**Hướng A — CSS-only `--i` + `animation-delay`** (set qua inline style hoặc `nth-child`)
- Ưu: không cần JS, không risk hydration mismatch.
- Nhược: vẫn chạy animation ngay khi mount bất kể có trong viewport hay không (đây chính là cách `qs-rise`/`qs-sweep-in` đang làm) → với item dưới fold, animation "lãng phí" chạy xong trước khi user cuộn tới (harmless về mặt UI vì tới lúc visible thì opacity đã = 1, nhưng vẫn tốn 1 lần recalc style + composite trong lúc trang load, ảnh hưởng nhẹ tới TBT lúc initial load nếu danh sách dài).

**Hướng B — 1 `IntersectionObserver` dùng chung cho cả grid** (batch, không tạo observer riêng mỗi item)
- Đã có sẵn pattern mẫu trong repo: `components/rail-land.tsx:44-62` — **một observer** cho cả rail, dùng `root: rail`, đánh dấu `primed` để bỏ qua batch đầu tiên (tránh replay ngay lúc mount), rồi add/remove class để "replay" khi card swipe vào viewport. Đây là ví dụ chất lượng cao có sẵn trong repo, nên nhân bản logic (không phải copy nguyên văn — rail-land có ý nghĩa khác: replay theo swipe, không phải reveal 1 lần) cho danh sách dài (`ProductListFilter`, `MachineList` nếu sau này thêm entrance).
- Hiện tại `Reveal` tạo 1 observer/instance — với ~10-15 instance/trang là chấp nhận được (không phải hàng trăm), nhưng nếu danh sách sản phẩm tăng lên (vd > 30 item), nên gộp thành observer dùng chung theo kiểu `rail-land.tsx` để tránh N observer riêng lẻ.

**Hướng C — `animation-timeline: view()`** (scroll-driven, native, zero-JS)
- Baseline "widely available" kể từ ~2025 (Chrome 115+, Firefox 137+ 2025, Safari 18.2/26). Với Next 16 + React 19 (`package.json:21,23`) là stack hiện đại, dùng được, nhưng **cần fallback CSS `@supports not (animation-timeline: view())`** để giữ hành vi cũ trên trình duyệt cũ hơn — tăng độ phức tạp CSS.
- Ưu điểm lớn nhất: hoàn toàn không cần JS, browser tự pause khi ngoài viewport (native scroll-linked, không tốn main-thread timer).
- Nhược: mất khả năng kiểm soát "one-shot" (view() timeline animate lại mỗi lần cuộn qua lại trừ khi cấu hình `animation-range` cẩn thận), khó test cross-browser, và **đây là thay đổi kiến trúc lớn hơn nhiều so với vấn đề thực tế** (site có danh sách ngắn 7-9 item).

### Khuyến nghị: giữ Hướng B (đã có sẵn), KHÔNG chuyển sang Hướng C

Lý do (YAGNI): danh sách hiện tại quá ngắn (7-9 item) để cần giải pháp scroll-driven native. `Reveal` + `--reveal-delay` đã đúng kiến trúc — chỉ cần **thống nhất dùng nó ở mọi nơi đang tự chế `animationDelay` inline** (news-feed wire list, applications page mobile rail dùng `qs-scan` không phải entrance nên giữ nguyên, home page qs-float/qs-scan giữ nguyên vì đó là "perpetual ambience" không phải "entrance"). Việc chuyển sang `view()` chỉ đáng cân nhắc nếu sau này danh sách sản phẩm phình to (vd > 50 item) — ghi chú lại nhưng không làm ngay.

## 3. Vấn đề đúng đắn / UX

- **Entrance chạy dưới fold**: chỉ ảnh hưởng nhóm dùng inline `animationDelay` (không qua `Reveal`) — `news-feed.tsx:119-120` (wire feed list, có thể ở dưới fold trên `/news`), `hero-slider.tsx` (luôn ở đầu trang, không phải vấn đề). Vì các animation này chạy `both` fill-mode ngay khi mount (không đợi scroll), tới lúc user cuộn tới thì animation đã chạy xong (opacity=1) — **không gây "pop" giật cục**, chỉ tốn một chút CPU lúc initial paint. Rủi ro thấp, không cần sửa gấp; nếu sửa, nên đổi sang `Reveal` để nhất quán (mục 2) hơn là vì lý do performance.
- **`both` fill giữ `opacity:0` nếu JS lỗi**: `.qs-rise`/`.qs-sweep-in` dùng CSS animation thuần (không phụ thuộc JS bật/tắt), nên animation luôn tự chạy kể cả khi JS crash — **không có rủi ro "kẹt ở opacity:0"** cho các animation CSS-only này. Rủi ro thực sự nằm ở `Reveal` (`components/reveal.tsx`): nếu `IntersectionObserver` không chạy (rất hiếm, hỗ trợ 97%+ trình duyệt) — nhưng đã tự phòng: comment ở `reveal.tsx:19` xác nhận có `<noscript>` guard ở root layout giữ nội dung visible khi không có JS. Cần xác minh thêm noscript guard này còn đúng vị trí trong `app/[locale]/layout.tsx` (không đọc trong phiên này, khuyến nghị kiểm tra nhanh trước khi refactor).
- **Stagger tích luỹ quá dài**: với 7-9 item và delay `i*70-80ms`, tổng delay tối đa ~560-720ms — chấp nhận được. Không phải vấn đề ở quy mô hiện tại; chỉ cần cảnh giác nếu danh sách phình to (áp trần delay, vd `Math.min(i * 70, 400)`).
- **SSR/hydration**: `Reveal` render `qs-reveal` class giống nhau cả server và client (`reveal.tsx:53` comment xác nhận chủ đích tránh hydration mismatch), animation hoàn toàn client-driven qua `useEffect` + observer — đúng pattern cho App Router. `product-list-filter.tsx` nhận `node: React.ReactNode` đã render sẵn từ server component (`ProductBundleCard`/`CatalogProductCard` là `async function`) rồi truyền qua boundary vào client component để filter — pattern RSC hợp lý, không có vấn đề hydration ở đây.

## 4. `prefers-reduced-motion` — đủ hay thiếu?

Đã rà toàn bộ các khối `@media (prefers-reduced-motion: reduce)` trong `globals.css` (dòng 244, 375, 408, 468, 480, 489, 502-514, 711, 800, 811, 825). Kết quả:

**Đã che phủ đầy đủ**: `.qs-kenburns`, `.qs-grid-drift`, `.qs-dot-drift`, `.qs-glow`, `.qs-float`, `.qs-rise`, `.qs-sweep-in`, `.qs-marquee-track`, `.qs-pcb-flow`/`.qs-pcb-pad`, `.qs-gold-shimmer`, `.qs-live-dot`, `.qs-trace`, `.qs-breathe`, `.qs-progress`, `.qs-play`, `.qs-fc-pulse`, `.qs-foot-social-row::after`/`.qs-foot-contact-row::after`, `.qs-conveyor`, `.qs-andon`, `.qs-swipe-nudge`, `.qs-rail-land`, `.qs-scan` (2 lần: dòng 275 trong khối riêng, và dòng 508-510 lặp lại — trùng lặp vô hại nhưng đáng dọn khi refactor).

**Thiếu / đáng bổ sung**:
- `.qs-panel` transition `flex-grow .62s` (`app/globals.css:344`) — đây là **transition**, không phải `@keyframes`, nên không tự động bị tắt bởi các rule animation-only. Đã có `app/globals.css:376`: `.qs-panel, .qs-panel .qs-open, .qs-panel .qs-spine, .qs-panel .qs-shot { transition: none; }` — **đã che phủ**, xác nhận đủ.
- Không tìm thấy animation/transition nào bị bỏ sót có ý nghĩa. Kết luận: **khối reduced-motion hiện tại đủ tốt**, không cần bổ sung animation mới nào — chỉ cần dọn trùng lặp `.qs-scan` (dòng 275 vs 508) khi chạm vào file.

## 5. Kế hoạch refactor tối thiểu (ưu tiên theo đòn bẩy/rủi ro)

### Ưu tiên 1 — Sửa `.qs-scan` dùng `transform` thay vì `top`, và pause khi ẩn (globals.css only, ~10 dòng)

File: `app/globals.css:256-267`

```css
.qs-scan {
  position: absolute; left: 0; right: 0; top: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(232,200,120,.9), transparent);
  box-shadow: 0 0 14px 2px rgba(232,200,120,.45);
  animation: qs-scan 4.8s ease-in-out infinite alternate;
  transform: translateY(0);
}
@keyframes qs-scan {
  0%   { transform: translateY(0);    opacity: 0; }
  12%  { opacity: 1; }
  88%  { opacity: 1; }
  100% { transform: translateY(calc(100cqh - 100%)); opacity: 0; }  /* hoặc dùng 100% nếu container có height cố định + position:absolute inset đã set sẵn */
}
```
Lưu ý kỹ thuật: `top:0→100%` đang tính theo % chiều cao container chứa nó; `translateY` cần biết chiều cao pixel hoặc dùng `translateY(100%)` nếu phần tử đã có `height` bằng 0 (line-height 2px) và container overflow:hidden — cần verify layout thực tế của từng nơi dùng (`inset-x-6 top-0 h-[2px]` vs full-height wrapper) trước khi đổi, vì hành vi `top:100%` phụ thuộc container height còn `translateY(100%)` phụ thuộc chính element's height (2px) — **không tương đương 1-1**, cần test trực quan, không chỉ đổi mù.

Đồng thời thêm pause khi ẩn:
```css
/* nơi nào .qs-scan bọc trong hoặc theo sau .opacity-0 (Tailwind), tắt hẳn animation khi invisible */
.group:not(:hover) .qs-scan.opacity-0,
[data-open="false"] .qs-scan {
  animation-play-state: paused;
}
```
Áp cho 2 nơi cụ thể: `catalog-product-card.tsx:37`, `product-bundle-card.tsx:46` (dùng `group-hover:opacity-100`) và `app-deck.tsx:76` (dùng `data-open`). Kiểm chứng bằng DevTools Performance: record 5s trên `/products` khi không hover gì — trước khi sửa sẽ thấy compositor/paint activity liên tục từ các `.qs-scan` ẩn; sau khi sửa, activity phải về ~0 khi không hover.

### Ưu tiên 2 — Thống nhất stagger: chuyển `news-feed.tsx` wire-list và `hero-slider.tsx` sang `Reveal`-style pattern

- `components/news-feed.tsx:113-121`: đổi `style={{ animationDelay: ... }}` + class `qs-rise` sang bọc bằng `Reveal` (hoặc tối thiểu đổi sang custom property `--reveal-delay` để cùng ngôn ngữ với phần còn lại của site) — cân nhắc: đây là carousel tự động (auto-advance mỗi 5.5s), nên "reveal 1 lần rồi disconnect" của `Reveal` phù hợp (không cần replay liên tục), khác với `qs-rise` hiện tại vốn chỉ chạy 1 lần lúc mount.
- `hero-slider.tsx` không cần đổi — nó cross-fade nội dung khi đổi slide (re-key), không phải "list", `qs-sweep-in` ở đây đúng vai trò của nó (replay có chủ đích mỗi lần đổi slide). Không sờ vào.

### Ưu tiên 3 (không gấp) — Dọn trùng lặp reduced-motion cho `.qs-scan`

`app/globals.css:275` và `:508-510` cùng set lại `.qs-scan` trong reduced-motion — gộp về 1 chỗ khi có dịp chạm file, không cần PR riêng.

### Không làm (out of scope theo YAGNI)

- Không cần virtualization/windowing cho list (7-9 item).
- Không cần chuyển sang `animation-timeline: view()` — quá phức tạp so với quy mô danh sách hiện tại.
- Không cần sửa `.qs-float`, `.qs-kenburns`, `.qs-marquee-track` — đã composite-only, đúng chuẩn.
- Không cần thêm reduced-motion mới — khối hiện tại đã đủ.

### Cách kiểm chứng cụ thể

1. **DevTools Performance**: record 5-8s trên `/products` (tab đang active, không hover) trước/sau khi sửa `.qs-scan`. So sánh "Rendering" track — trước khi sửa sẽ có `Paint`/`Layout` lặp lại đều đặn mỗi ~4.8s × N-card dù không tương tác; sau khi sửa phải gần như phẳng.
2. **Rendering tab → "Paint flashing"**: bật để quan sát trực quan vùng nào đang paint lại liên tục ngoài ý muốn (các `.qs-scan` ẩn sẽ hiện highlight xanh dù invisible — bằng chứng trực quan cho stakeholder không đọc code).
3. **Rendering tab → "Layer borders"**: xác nhận `.qs-scan` trước khi sửa KHÔNG có layer riêng (vì `top` không composite) — border layer chỉ bọc quanh phần tử cha lớn hơn thay vì đúng dải 2px, xác nhận đang paint chung với nội dung xung quanh (tốn hơn).
4. **`prefers-reduced-motion`**: test bằng DevTools Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce", xác nhận không còn animation nào chạy trên `/products`, `/`, `/cnc`, footer.
5. **Lighthouse / Core Web Vitals** trước/sau trên `/products` — kỳ vọng cải thiện nhẹ TBT (Total Blocking Time) nếu máy yếu, vì bớt được N animation vô hạn luôn tick trên main thread lúc idle giữa các tương tác (không kỳ vọng thay đổi lớn vì list ngắn, nhưng đo được là bằng chứng khách quan cho PR).

## Assumptions

- **Container height của các `.qs-scan` instance đủ để `top:0→100%` có ý nghĩa hình ảnh** (confidence: medium) — chưa đo px thực tế từng nơi dùng; trước khi đổi sang `translateY`, cần xác minh trực quan (screenshot before/after) từng vị trí vì hành vi `top` vs `translateY` không tương đương 1-1 khi container không có height cố định.
- **`<noscript>` guard cho `Reveal` vẫn còn đúng trong `app/[locale]/layout.tsx`** (confidence: low — không đọc file này trong phiên) — nên verify nhanh trước khi mở rộng phạm vi dùng `Reveal`.
- **Danh sách sản phẩm/catalog/máy CNC sẽ không phình to trong tương lai gần** (confidence: medium, dựa trên business hiện tại là catalogue công nghiệp cố định, không phải marketplace) — nếu sai, cần revisit hướng B/C ở mục 2.

## Validation Log

### Session 1 — 2026-07-21 (validate)

#### Verification Results
- Claims checked: 14 | Verified: 12 | Failed: 1 | Minor drift: 1
- Tier: Light (single-file advisory report)
- **FAILED — Ưu tiên 3 (mục 4 & 5):** claim "`.qs-scan` reduced-motion trùng lặp ở dòng 275 và 508-510" sai. Dòng 275 nằm trong `@media (max-width: 767px)` (tắt scan trên mobile), dòng 510 nằm trong `@media (prefers-reduced-motion: reduce)`. Hai rule khác mục đích, đều cần giữ — **không có trùng lặp**. Hệ quả quan trọng: **vấn đề perf chỉ tồn tại trên desktop** (mobile đã `display:none` toàn bộ `.qs-scan`).
- Minor drift: số call site thực tế là **18** (không phải 16); line number CSS thực tế 260-272 (không phải 256-267).
- Resolved assumption: `<noscript>` guard **tồn tại và đúng** tại `app/[locale]/layout.tsx:99-102` (`.qs-reveal{opacity:1!important;transform:none!important}`) — assumption confidence-low của report đã được xác minh tốt.
- Verified exact: `catalog-product-card.tsx:37`, `product-bundle-card.tsx:46`, `app-deck.tsx:76`, `product-category-tabs.tsx:139` (`hidden=` → inactive tabs paused đúng), data counts 7/9/7, `rail-land.tsx:44-62` shared-observer pattern, `qs-sweep-in` không có clip-path trong keyframes, `.qs-float` transform-only, `.qs-panel` reduced-motion `transition:none`.

#### Decisions
1. **P1 scope → Pause-only trước** (supersedes mục 5 Ưu tiên 1): chỉ dừng animation cho các instance vô hình (`opacity-0` hover cards, app-deck panel đóng). Migration `top`→`transform` **defer** sang follow-up riêng có screenshot verification per call site (18 nơi, không tương đương 1-1).
2. **P2 news-feed → Defer**: không convert sang `Reveal` trong refactor này; ghi nhận inconsistency, convert khi có dịp chạm file.
3. **P3 → Dropped** (superseded bởi verification failure ở trên): không có trùng lặp reduced-motion để dọn.
4. **Evidence cho PR**: DevTools Performance recording before/after trên `/products` (idle, không hover, desktop viewport) + screenshot visual check. Không cần full Lighthouse battery.

#### Whole-Plan Consistency Sweep
- Mục 5 "Ưu tiên 1" (transform migration) và "Ưu tiên 3" trong thân report bị supersede bởi Decisions 1 & 3 ở trên — giữ nguyên thân report làm advisory record, Validation Log này là quyết định cuối.
- Mục "Cách kiểm chứng" items 3 & 5 (layer borders, Lighthouse) không còn bắt buộc theo Decision 4.
- Không còn mâu thuẫn chưa giải quyết.

### Session 2 — 2026-07-21 (implement, /ak:cook)

- Implemented Decision 1 (P1 pause-only) in `app/globals.css` only, no component edits:
  - After `@keyframes qs-scan`: `.group:not(:hover) .qs-scan.opacity-0 { animation-play-state: paused; }` — covers `catalog-product-card.tsx:37` + `product-bundle-card.tsx:46`. Rule must stay unlayered in globals.css: Tailwind arbitrary-property utilities sit in a layer and lose to the `animation:` shorthand.
  - Replaced the scan-line placeholder comment near `.qs-panel` cascade with a 4-rule play-state ladder mirroring the `.qs-open` opacity ladder exactly (base paused → `[data-open="true"]` running → `.qs-strip:hover .qs-panel` paused → `.qs-strip:hover .qs-panel:hover` running) — covers `app-deck.tsx:76`. NOTE: report's proposed `[data-open="false"]` selector was wrong — closed panels carry no `data-open` attribute (undefined), hence the ladder approach.
- Verified: `yarn build` clean; `code-reviewer` subagent PASS on all criteria (state-ladder parity incl. specificity ties, zero collision with the 16 always-visible call sites and Tailwind named groups `group/bd`/`group/tile`, no visual change when visible, reduced-motion/mobile unaffected).
- Deferred items (P2 news-feed → Reveal, top→transform migration) remain open per Decisions 1-2. DevTools before/after recording (Decision 4) not run in this session — CLI only; do manually before PR if evidence needed.

Status: DONE
Summary: Vấn đề hiệu năng thật là `.qs-scan` (globals.css:256-267) chạy vô hạn, animate `top` không composite, và không dừng khi phần tử `opacity:0` — lặp lại ở 16 nơi, sửa 1 lần trong CSS fix toàn site. Danh sách sản phẩm/CNC quá ngắn (7-9 item) nên không cần giải pháp scroll-driven phức tạp; vấn đề thứ hai là 2 cơ chế stagger song song (`Reveal` IntersectionObserver tốt vs inline `animationDelay` không nhất quán) cần gộp về `Reveal`.
Concerns: Đổi `top` sang `transform: translateY()` cho `.qs-scan` cần verify trực quan từng container (không tương đương 1-1 nếu container không có height cố định) — không chỉ đổi mù theo diff text.
