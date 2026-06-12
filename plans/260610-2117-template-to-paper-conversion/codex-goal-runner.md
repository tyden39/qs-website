# Codex Goal Runner — Template → Paper (1 file / goal turn)

Driver cho Codex: chạy conversion bằng **Goal** và Paper MCP trực tiếp. Không dùng `/loop`, `ScheduleWakeup`, hoặc Claude subagent.

---

## CÁCH KHỞI ĐỘNG

Trong Codex, tạo goal:

```
Goal: Đọc plans/260610-2117-template-to-paper-conversion/codex-goal-runner.md và tiếp tục chạy conversion Template → Paper cho tới khi không còn file ⬜ trong conversion-brief.md.
```

Nếu goal đang active, nói:

```
Tiếp tục goal theo plans/260610-2117-template-to-paper-conversion/codex-goal-runner.md
```

Codex làm từng file một. Khi hết context/turn, goal giữ trạng thái; lượt sau đọc lại bảng §8 và tiếp tục từ file ⬜ đầu tiên.

---

## GIAO THỨC MỖI LƯỢT

1. **Đọc context bắt buộc**
   - `README.md`
   - `plans/260610-2117-template-to-paper-conversion/conversion-brief.md`
   - `template/<FILE>.html` của file sẽ chạy
2. **Verify Paper**
   - Gọi `get_guide({topic:"paper-mcp-instructions"})` một lần trong lượt.
   - Gọi `get_basic_info`.
   - Phải thấy file `Scratchpad`, URL chứa `01KTRV3FR2FW3JDK0FQDH62D0G`, và artboard `QS Home — Landing`.
   - Gọi `get_children` trên artboard home để xác nhận `Top Strip`, `Nav`, `Footer` trước khi clone.
3. **Chọn file**
   - Chọn dòng đầu tiên có trạng thái ⬜ trong §8 của `conversion-brief.md`.
   - Bỏ qua ✅ / 🔄 / ⚠️.
   - Nếu không còn ⬜: đánh dấu goal complete và báo tổng kết.
4. **Đánh dấu đang làm**
   - Đổi dòng file đó trong §8 từ ⬜ sang 🔄.
5. **Convert trực tiếp trong Codex**
   - Tạo 1 artboard mới, width `1440px`, height tạm `3000px`-`4800px`.
   - Clone top strip + nav ở đầu; clone footer cuối cùng.
   - Dựng từng section theo thứ tự HTML, từng nhóm nhỏ.
   - Dùng `duplicate_nodes` + `set_text_content` cho card/row lặp lại.
   - Gọi `get_screenshot` sau vài section và sửa lỗi trước khi tiếp tục.
   - Cuối cùng đổi artboard `height: "fit-content"`.
   - Gọi screenshot toàn artboard và tự chấm checklist §7.
   - Gọi `finish_working_on_nodes`.
6. **Cập nhật trạng thái**
   - Nếu xong: đổi dòng file đó thành ✅, ghi tên artboard + ghi chú ngắn.
   - Nếu lỗi/blocker: đổi dòng file đó thành ⚠️, ghi lý do ngắn, dừng goal turn.
7. **Tiếp tục**
   - Nếu còn ngân sách và không có blocker, làm file ⬜ tiếp theo.
   - Nếu cần dừng vì ngân sách/thời gian, để goal active và báo file kế tiếp.

---

## BẢNG MAPPING NAV ACTIVE

| File | ACTIVE_MENU |
|---|---|
| products.html, product-detail.html | Sản phẩm |
| applications.html, application-detail.html | Ứng dụng |
| service.html, service-detail.html | Dịch vụ |
| news.html, news-detail.html | Tin tức |
| contact.html | Liên hệ |
| about.html, careers.html, case-studies.html, case-study-detail.html, support.html, faq.html, downloads.html, downloads-list.html, search.html, 404.html | (none) |

`(none)` = không set active menu.

---

## PROMPT NỘI BỘ CHO MỖI FILE

```
Convert template/<FILE>.html sang 1 artboard Paper mới.
Tuân thủ conversion-brief.md: tokens §2, patterns §3, pitfalls §4, workflow §5, clone §6, checklist §7.
ACTIVE_MENU = <ACTIVE_MENU>.
Không dùng subagent. Không chạy song song. Không hiện node-id trong báo cáo user.
```

---

## PITFALLS CODEx

- Dùng `apply_patch` cho mọi sửa file markdown.
- Trước khi xoá artboard dở, xác minh bằng `get_basic_info` hoặc `get_node_info`.
- Không sửa `loop-runner.md`; file đó giữ nguyên cho Claude Code.
- Không spawn nhiều tác vụ Paper song song; mọi artboard nằm chung một file.
- Nếu đang có dòng 🔄 từ lượt trước, kiểm tra Paper:
  - Nếu artboard dở chưa hoàn tất và user muốn chạy lại: xoá artboard dở, reset dòng về ⬜.
  - Nếu artboard đã hoàn tất nhưng quên cập nhật brief: screenshot/checklist rồi đổi dòng thành ✅.

---

## DỪNG AN TOÀN

- Hết file ⬜: gọi `update_goal(status:"complete")`.
- Blocker thật: ghi ⚠️ vào §8, gọi `finish_working_on_nodes`, báo blocker. Chỉ gọi `update_goal(status:"blocked")` nếu goal đã mắc cùng blocker qua 3 lượt liên tiếp.
- Dừng do hết ngân sách/turn: để goal active, báo file kế tiếp.

## Unresolved

None.
