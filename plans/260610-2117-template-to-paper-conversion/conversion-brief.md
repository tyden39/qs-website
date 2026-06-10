# QS Website — Template → Paper Conversion Brief

Brief dùng chung để convert từng file `template/*.html` thành artboard trong Paper.
**Mục tiêu: mỗi file = 1 session/subagent fresh, giữ context < 200K, không tái khám phá.**

Đọc brief này thay cho việc đọc lại `template/styles/qs.css` (đã chắt lọc tokens bên dưới).
Vẫn phải đọc file HTML đích vì có `<style>` riêng theo trang.

---

## 0. CÁCH DÙNG (mỗi session 1 file)

Prompt mẫu cho session/subagent mới:

```
Đọc /Users/ducnguyen/workspace/qst/qs-website/plans/260610-2117-template-to-paper-conversion/conversion-brief.md
Convert template/<TÊN_FILE>.html sang 1 artboard mới trong Paper.
Tuân thủ tokens, conventions, pitfalls và clone nav/footer như brief chỉ định.
Xong thì cập nhật trạng thái file trong mục §8 của brief.
```

**Mỗi session chỉ làm 1 file.** Xong → `/clear` hoặc đóng session → mở session mới cho file kế.

---

## 1. PREREQUISITES (kiểm tra đầu mỗi session)

1. Paper Desktop đang mở, **đúng file** chứa artboard "QS Home — Landing" (file gốc đã dựng home).
   - File URL tham chiếu: `app.paper.design/file/01KTRV3FR2FW3JDK0FQDH62D0G`
2. Gọi `get_basic_info` → xác nhận MCP nối được + thấy artboard home.
3. **Verify clone IDs còn đúng** (xem §6): gọi `get_screenshot` node `2-0` (top strip), `9-0` (nav), `93-0` (footer). Nếu ID sai/đổi → tìm lại bằng `get_children` trên artboard home rồi cập nhật §6.

> ⚠️ Node-id chỉ đúng trong **file Paper hiện tại**. Nếu tạo file Paper mới → ID vô hiệu, phải dựng lại nav/footer 1 lần rồi ghi ID mới vào đây.

---

## 2. DESIGN TOKENS (từ qs.css — khỏi đọc lại CSS)

### Màu
| Token | Hex | Dùng cho |
|---|---|---|
| ink | `#0a0a0a` | text chính, nền dark, nút primary |
| ink-2 | `#1a1a1a` | nền dark phụ |
| paper | `#f5f3ee` | nền section sáng (xen kẽ với #fff) |
| paper-2 | `#ecebe5` | hover, nền nhạt |
| line | `#d8d6cf` | viền, divider hairline |
| line-2 | `#b8b6ae` | viền đậm hơn |
| muted | `#6b6960` | text phụ, mono label |
| text | `#1a1a1a` | body |
| gold | `#c9a35a` | accent chính (tick, viền nút gold) |
| gold-2 | `#e8c878` | gold sáng (text trên nền dark, số liệu) |
| gold-3 | `#8a6f35` | gold đậm (mono label, eyebrow) |
| gold-grad | `linear-gradient(180deg,#f0d28a 0%,#c9a35a 50%,#8a6f35 100%)` | nút gold, brand wordmark |
| danger | `#c8553d` | đèn/nút đỏ trên mockup |
| dark section bg | `#0e0e0c` | nền stats (đậm hơn ink chút) |
| dark grid line | `#2a2620` | divider trên nền dark |

### Font (đều có sẵn — Inter / Inter Tight / JetBrains Mono)
- `--font-display: 'Inter Tight'` → headings (h1/h2/h3/h4), số liệu lớn
- `--font-sans: 'Inter'` → body, button, menu, link
- `--font-mono: 'JetBrains Mono'` → eyebrow, label, mã số, timestamp, breadcrumb

### Scale chữ (px)
- h1 hero: 56–96px (home dùng 88), weight 700, line-height .95, letter-spacing -.025em
- h2 section: 36px, weight 700, lh 1.1, ls -.02em
- h3: 20–24px, weight 600, ls -.01em
- h4: 15–17px, weight 600
- lede: 18px, lh 1.65, color #3a3a3a
- body: 13–15px, lh 1.55–1.65, color muted/#4a4842
- mono label/eyebrow: 10–11px, ls .14–.18em, UPPERCASE, color gold-3 (sáng) / gold-2 (trên dark)

### Spacing & layout
- Section padding dọc: 80–96px. Ngang: 48px (full-width, không cần wrap 1280 — home đã làm vậy, nhìn ổn trên 1440)
- Artboard desktop: **width 1440px**, height tạm 4000–4800px → **đổi `height: fit-content` khi xong**
- radius: 3px (nút, card), 6px (mockup body)
- Section head: flex space-between, align-items flex-end, padding-bottom 24px, border-bottom 1px line, margin-bottom 40px

---

## 3. COMPONENT PATTERNS (tái dùng cho mọi trang)

**Eyebrow** (mono label có gạch vàng):
```html
<div style="display:inline-flex;align-items:center;gap:10px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8a6f35"><span style="display:block;width:24px;height:1px;background:#c9a35a"></span>NHÃN</div>
```

**Section head** (eyebrow + h2 trái, nút ghost phải):
```html
<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:32px;padding-bottom:24px;border-bottom:1px solid #d8d6cf">
  <div style="display:flex;flex-direction:column;gap:8px"><span [mono label]>[ ... ]</span><h2 [h2 style]>Tiêu đề</h2></div>
  <a [nút ghost sm]>Xem tất cả →</a>
</div>
```

**Nút gold**: `background:linear-gradient(180deg,#f0d28a,#c9a35a 50%,#8a6f35);color:#0a0a0a;border:1px solid #8a6f35;border-radius:3px;padding:11px 18px;font:600 13px Inter`
**Nút ghost**: `background:transparent;color:#0a0a0a;border:1px solid #0a0a0a;border-radius:3px`
**Nút ghost sm**: như ghost, `padding:7px 12px;font-size:12px`

**Card sản phẩm**: nền #fff, padding 28px 24px, gold tick `position:absolute;top:0;left:24px;width:32px;height:2px;background:#c9a35a` ở mép trên; footer card có border-top + mono label + mũi tên →.

**Grid hairline**: container `display:flex;gap:1px;background:#d8d6cf;border:1px solid #d8d6cf` → tạo đường kẻ 1px giữa các cell nền trắng.

**Mockup controller** (thay SVG bằng div): body gradient `#e8e6e0→#a8a499` viền `#6a6660`; display nền navy `#0a1a2a`/`#1a3a52` chữ mono (xanh #5ab8e0, trắng, vàng #e8c878); keypad = lưới ô vuông #3a3530; nút tròn đỏ #c8553d lõi vàng #e8c878.

---

## 4. PITFALLS — BẮT BUỘC TUÂN THỦ (rút từ lần dựng home)

1. **KHÔNG dùng `flex:1` shorthand** — Paper hay không grow đúng, children dồn trái/để trống bên phải. Luôn ghi tường minh:
   `flex-grow:<n>; flex-shrink:1; flex-basis:0%`
   (vd 3 cột bằng nhau → mỗi cột flex-grow:1; tỉ lệ 2:1 → 2 và 1). Container cha nên có `width:100%`.
2. **Không có inline rich-text** — 1 text node = 1 màu. Muốn 1 từ khác màu trong câu (vd "CNC" vàng trong h1) → tách thành element riêng, KHÔNG dùng `<em>` inline (màu sẽ không ăn).
3. **SVG phức tạp → tái dựng bằng div/rectangle** cho editable + sạch. Không paste nguyên SVG lớn.
4. **Build từng nhóm nhỏ** — mỗi `write_html` ≈ 1 nhóm visual (header / 1 card / 1 row). Không viết >15 dòng/lần.
5. **Dùng `duplicate_nodes` + `set_text_content`** cho card/row lặp lại thay vì viết lại HTML → tiết kiệm token nhiều.
6. **Không dùng**: `margin`, `display:grid`, `display:inline`, HTML table. Chỉ flex + padding + gap.
7. **Repeated rows**: icon/trailing dùng slot cố định `flex-shrink:0` + width cố định để thẳng hàng dọc.
8. **fit-content cuối cùng**: dựng xong đổi artboard `height:fit-content`, đừng đoán px.
9. **`get_screenshot` review** sau mỗi vài section; sửa lỗi trước khi đi tiếp.
10. **`get_guide({topic:"paper-mcp-instructions"})` 1 lần đầu session** (subagent là context mới → phải gọi).
11. **`finish_working_on_nodes` khi xong** (bắt buộc).
12. **Không hiện node-id cho user** trong text.

---

## 5. WORKFLOW MỖI FILE

1. `get_guide({topic:"paper-mcp-instructions"})` (1 lần).
2. `get_basic_info` → verify MCP + file đúng.
3. Đọc `template/<file>.html` (gồm `<style>` riêng trang).
4. `create_artboard` width 1440, height ~4000 (tạm), tên = `QS <Tên trang>`.
5. **Clone chrome dùng chung** vào artboard mới (xem §6): top strip → nav → (nội dung) → footer.
6. Dựng từng section theo thứ tự HTML, từng nhóm nhỏ, theo tokens/patterns/pitfalls.
7. `get_screenshot` review sau mỗi vài section.
8. Đổi artboard `height:fit-content`.
9. `get_screenshot` toàn artboard → tự chấm theo checklist §7.
10. `finish_working_on_nodes`.
11. Cập nhật trạng thái file ở §8.

---

## 6. CLONE NAV / FOOTER (node-id từ artboard home)

Dùng cú pháp clone trong `write_html` để chèn bản sao node có sẵn vào artboard mới (rẻ hơn dựng lại):
```html
<x-paper-clone node-id="2-0" />   <!-- Top Strip -->
<x-paper-clone node-id="9-0" />   <!-- Nav -->
<x-paper-clone node-id="93-0" />  <!-- Footer -->
```

| Phần | node-id (home) | Ghi chú |
|---|---|---|
| Top Strip | `2-0` | dải đen mono trên cùng |
| Nav | `9-0` | logo + menu + nút Báo giá |
| Footer | `93-0` | 4 cột + bottom bar |
| Artboard home (tham chiếu) | `1-0` | để screenshot đối chiếu style |

**Cách làm**: sau khi `create_artboard`, dùng `write_html` mode `insert-children` vào artboard mới với 3 thẻ clone (top strip + nav ở đầu). Footer clone chèn cuối cùng sau khi dựng xong nội dung. Sửa trạng thái active của menu nav cho đúng trang (vd trang Sản phẩm → mục "Sản phẩm" active) bằng `update_styles`/`set_text_content` trên node clone tương ứng nếu cần.

> ⚠️ Trước khi clone, **verify ID** bằng `get_screenshot` từng node (§1 bước 3). ID sai → `get_children` trên `1-0` tìm lại.

---

## 7. CHECKLIST CHẤM CHẤT LƯỢNG (cuối mỗi file)

- [ ] **Spacing**: nhịp section 80–96px, divider hairline đều, không cramp/trống bất thường
- [ ] **Typography**: đúng 3 font theo vai trò; hierarchy rõ; không chữ <10px
- [ ] **Contrast**: text đọc được không nheo mắt; dark/light section xen kẽ
- [ ] **Alignment**: mọi grid grow full-width (đã set flex-grow tường minh); lane dọc thẳng
- [ ] **Artboard fit**: đã `fit-content`, không clip / không gap đáy
- [ ] **Chrome**: top strip + nav + footer clone đúng; menu active đúng trang
- [ ] **finish_working_on_nodes** đã gọi

---

## 8. DANH SÁCH FILE & TRẠNG THÁI

Trạng thái: ⬜ chưa làm · 🔄 đang làm · ✅ xong · ⚠️ có vấn đề (ghi chú)

| File | Trạng thái | Artboard / Ghi chú |
|---|---|---|
| home.html | ✅ | "QS Home — Landing" (`1-0`) — bản gốc, nguồn clone |
| contact.html | ✅ | "QS Liên hệ — Contact" — clone nav/footer OK; nav "Liên hệ" active (gold). Pitfall flex-grow:1+basis:0% KHÔNG fill full-width → phải set `flexBasis` % tường minh (25%/58%/42%) cho mọi grid hairline. |
| products.html | ⚠️ | "QS Sản phẩm" (artboard tạo, width 1440) — clone top strip + nav OK, nav "Sản phẩm" active (gold #8a6f35). DỪNG: Paper MCP báo "Weekly MCP limit reached" khi bắt đầu dựng hero. CHƯA dựng nội dung (hero/sidebar/6 product rows/compare strip/footer). Cần chạy lại sau khi reset (2 ngày) hoặc nâng Paper Pro. |
| product-detail.html | ⬜ | |
| applications.html | ⬜ | |
| application-detail.html | ⬜ | |
| service.html | ⬜ | |
| service-detail.html | ⬜ | |
| about.html | ⬜ | |
| news.html | ⬜ | |
| news-detail.html | ⬜ | |
| case-studies.html | ⬜ | |
| case-study-detail.html | ⬜ | |
| support.html | ⬜ | |
| faq.html | ⬜ | |
| downloads.html | ⬜ | |
| downloads-list.html | ⬜ | |
| careers.html | ⬜ | |
| search.html | ⬜ | |
| 404.html | ✅ | "QS 404 — Not Found" — clone top strip/nav/footer OK; section canh giữa (align/justify center, né pitfall flex-grow); số 404 dùng màu solid gold #c9a35a (không gradient-clip) + chấm đỏ; không set nav active (404 không thuộc menu). XÁC NHẬN: subagent gọi được Paper MCP. |

---

## 9. RỦI RO ĐÃ BIẾT (đọc trước khi chạy lô)

1. **MCP trong subagent**: ✅ ĐÃ XÁC NHẬN subagent gọi được Paper MCP (test 404.html). Mỗi subagent vẫn PHẢI tự `get_basic_info` verify ở bước 0.
2. **Clone vỡ nếu đổi file Paper**: node-id `2-0`/`9-0`/`93-0` chỉ đúng trong file Paper hiện tại (`01KTRV3FR2FW3JDK0FQDH62D0G`). Đổi file → vô hiệu.
3. **Trôi chất lượng** giữa các trang: bám checklist §7 mỗi file.
4. **Lỗi giữa lô**: làm TUẦN TỰ (1 subagent/lần — tất cả ghi chung 1 file Paper, chạy song song sẽ giẫm chân). Cập nhật §8 sau mỗi file để biết điểm dừng/chạy lại.

## 10. CHẠY TỰ ĐỘNG QUA /loop
Xem `loop-runner.md` (cùng thư mục) — giao thức loop + prompt subagent dùng chung cho mọi file còn lại.

## Unresolved
- (không còn) — `index.html` đã được user gỡ bỏ; subagent-MCP đã verify.
