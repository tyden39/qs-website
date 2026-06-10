# Loop Runner — Template → Paper (1 file / vòng, qua /loop + subagent)

Driver cho `/loop` dynamic mode: **mỗi vòng convert đúng 1 file**, spawn 1 subagent, cập nhật plan, rồi schedule vòng kế. Hết file ⬜ → dừng loop.

---

## CÁCH KHỞI ĐỘNG (session mới)

1. Mở **session Claude Code mới** (đảm bảo Paper Desktop đang mở đúng file chứa artboard "QS Home — Landing").
2. Paste lệnh sau (KHÔNG kèm interval → loop tự pace từng vòng):

```
/loop Đọc plans/260610-2117-template-to-paper-conversion/loop-runner.md và chạy ĐÚNG 1 vòng theo "GIAO THỨC MỖI VÒNG" trong đó. Hết file ⬜ thì dừng loop (không schedule wakeup).
```

> Loop sẽ tự lặp tới khi mọi file trong §8 của `conversion-brief.md` ✅ (hoặc gặp lỗi → dừng để bạn xử lý).

---

## GIAO THỨC MỖI VÒNG (controller làm — KHÔNG tự convert)

1. **Đọc** `conversion-brief.md` §8 (bảng trạng thái).
2. **Chọn file**: dòng ĐẦU TIÊN có trạng thái ⬜ (bỏ qua ✅ / 🔄 / ⚠️).
   - Nếu **không còn ⬜** → loop xong. Báo tổng kết, **KHÔNG gọi ScheduleWakeup** (kết thúc loop). DỪNG.
3. **Đánh dấu 🔄** dòng file đó trong §8 (để biết đang chạy nếu crash giữa chừng).
4. **Spawn 1 subagent** (`general-purpose`, foreground — KHÔNG background, KHÔNG song song) với prompt ở mục "PROMPT SUBAGENT" bên dưới, thay `<FILE>` = tên file (vd `products.html`) và `<ACTIVE_MENU>` theo bảng mapping. Chờ subagent trả kết quả.
5. **Xử lý kết quả**:
   - `Status: DONE` / `DONE_WITH_CONCERNS` và §8 đã ✅ → OK.
   - Subagent quên cập nhật §8 → controller tự sửa dòng đó thành ✅ (tên artboard + ghi chú ngắn).
   - `Status: BLOCKED` hoặc lỗi → đổi 🔄 thành ⚠️ kèm lý do, **DỪNG loop** (không schedule wakeup), báo user. Đừng spawn lại prompt y hệt.
6. **Schedule vòng kế**: `ScheduleWakeup` delay ~60s, prompt = lệnh /loop y hệt ở trên (cache còn ấm; subagent đã chạy đồng bộ nên 60s chỉ là nhịp nghỉ ngắn).

**Mỗi vòng = đúng 1 file.** Không gộp nhiều file/vòng. Không chạy ≥2 subagent song song (chung 1 file Paper).

---

## BẢNG MAPPING NAV ACTIVE (menu: Sản phẩm · Ứng dụng · Dịch vụ · Tin tức · Liên hệ)

| File | ACTIVE_MENU |
|---|---|
| products.html, product-detail.html | Sản phẩm |
| applications.html, application-detail.html | Ứng dụng |
| service.html, service-detail.html | Dịch vụ |
| news.html, news-detail.html | Tin tức |
| (đã xong) contact.html | Liên hệ |
| about.html, careers.html, case-studies.html, case-study-detail.html, support.html, faq.html, downloads.html, downloads-list.html, search.html | (none — không set active) |

`(none)` = trang không nằm trong top menu → KHÔNG đổi màu mục nào.

---

## PROMPT SUBAGENT (template — thay `<FILE>` và `<ACTIVE_MENU>`)

```
Bạn là subagent convert 1 template HTML → 1 artboard Paper. Làm TUẦN TỰ, chỉ file này.
Môi trường: macOS, CWD /Users/ducnguyen/workspace/qst/qs-website, branch main.

## BƯỚC 0 — VERIFY PAPER MCP
Gọi mcp__plugin_paper-desktop_paper__get_basic_info.
- Lỗi / không có tool Paper → DỪNG, báo "Status: BLOCKED — subagent không truy cập được Paper MCP". Không làm gì thêm.
- OK (thấy file Scratchpad + artboard "QS Home — Landing" id 1-0) → tiếp.

## CONTEXT BẮT BUỘC ĐỌC
1. Brief: /Users/ducnguyen/workspace/qst/qs-website/plans/260610-2117-template-to-paper-conversion/conversion-brief.md
   → tuân thủ tokens §2, patterns §3, PITFALLS §4, clone §6, checklist §7.
2. File đích: /Users/ducnguyen/workspace/qst/qs-website/template/<FILE> (đọc cả <style> riêng trang).

## WORKFLOW
1. get_guide({topic:"paper-mcp-instructions"}) — 1 lần.
2. (đã get_basic_info ở bước 0).
3. create_artboard width 1440, height tạm ~3000-4500 tuỳ độ dài trang (trang ngắn để thấp hơn), tên "QS <Tên trang tiếng Việt>".
4. Clone chrome: <x-paper-clone node-id="2-0" /> (top strip) + <x-paper-clone node-id="9-0" /> (nav) chèn ĐẦU; <x-paper-clone node-id="93-0" /> (footer) chèn CUỐI sau khi xong nội dung.
   - Verify ID bằng get_children trên 1-0 nếu clone lỗi.
5. NAV ACTIVE: <ACTIVE_MENU>. Nếu khác "(none)": trong createdNodes của lần clone nav, tìm Text node có name = "<ACTIVE_MENU>", update_styles color #8a6f35 + fontWeight 600. Nếu "(none)" → bỏ qua.
6. Dựng từng section theo thứ tự HTML, từng nhóm nhỏ (mỗi write_html ~1 visual group, <15 dòng). Dùng duplicate_nodes + set_text_content cho card/row lặp lại.
7. get_screenshot review sau mỗi vài section; sửa lỗi trước khi đi tiếp.
8. Đổi artboard height:fit-content khi xong.
9. get_screenshot toàn artboard, tự chấm checklist §7.
10. finish_working_on_nodes (BẮT BUỘC).

## PITFALLS QUAN TRỌNG (rút từ contact.html + 404.html — KHÔNG mắc lại)
- ⚠️ flex-grow:1 + flex-basis:0% KHÔNG fill full-width trong Paper → để chia cột/giãn full-width PHẢI set flexBasis % tường minh (vd 2 cột 50/50; 1.4:1 → 58%/42%; 4 cột → 25%). Sau khi dựng grid, get_screenshot kiểm tra có dải trống bên phải không; có thì update_styles set flexBasis %.
- 1 text node = 1 màu, KHÔNG inline rich-text (<em>). Muốn 1 từ khác màu → tách element riêng.
- Gradient text dễ vỡ → dùng màu solid (gold #c9a35a) thay -webkit-background-clip.
- SVG lớn/phức tạp → tái dựng bằng div/rectangle.
- Chỉ flex + padding + gap. KHÔNG display:grid/inline, KHÔNG HTML table, KHÔNG margin trên container layout.
- Repeated rows: icon/trailing dùng slot width cố định + flexShrink:0 để thẳng lane dọc.
- KHÔNG hiện node-id trong văn bản báo cáo.

## SAU KHI XONG — CẬP NHẬT PLAN
Sửa §8 của conversion-brief.md: đổi dòng <FILE> sang ✅, ghi chú = tên artboard + 1 lưu ý ngắn (vd flexBasis dùng cho grid nào, mockup tái dựng ra sao).

## BÁO CÁO CUỐI
Status: DONE | DONE_WITH_CONCERNS | BLOCKED
Summary: 1-2 câu (artboard tên gì, có gì đáng lưu ý).
Concerns: nếu có.
```

---

## GHI CHÚ VẬN HÀNH
- **Tuần tự bắt buộc**: tất cả artboard nằm chung 1 file Paper → 2 subagent song song sẽ tranh node-id/ghi đè. Loop này cố tình 1 file/vòng.
- **Dừng giữa chừng an toàn**: §8 luôn phản ánh điểm dừng (🔄 = đang dở, ✅ = xong, ⚠️ = lỗi). Chạy lại loop sẽ tiếp tục từ ⬜ kế.
- **Pause**: ngắt session/loop bất cứ lúc nào; file đang 🔄 có thể cần xoá artboard dở rồi reset về ⬜ trước khi chạy lại.
- **Còn lại sau home/contact/404**: 17 file ⬜ (products, product-detail, applications, application-detail, service, service-detail, about, news, news-detail, case-studies, case-study-detail, support, faq, downloads, downloads-list, careers, search).
