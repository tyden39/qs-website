# Dịch & thay chữ trên ảnh detail servo/biến tần

Status: in-progress

## Mục tiêu
Dịch chữ Trung → Việt và thay trực tiếp trên các ảnh detail (intro/params/accessories)
của 6 series: servo (sdv3, sda2) và biến tần (s600, s600e, s3100, penta-12t). 87 ảnh.

## Phương pháp (đã chốt với user)
- OCR (RapidOCR, model tiếng Trung) → bounding box + chữ Trung.
- Dịch từng box có ký tự CJK → tiếng Việt (giữ nguyên box thuần số/mã model).
- Renderer PIL: tự lấy màu nền/chữ mỗi box, xoá chữ gốc, vẽ lại bằng Be Vietnam Pro.
  - Cỡ chữ ĐỒNG NHẤT theo nhóm (`grp`).
  - Tự chống tràn sang box lân cận cùng hàng.
  - Căn lề trái/phải/giữa theo layout gốc (nhãn callout căn phải về chấm).
- Chỉ tiếng Việt (ghi đè `src`; EN locale dùng bản -en đã có cho figure).
- Ảnh sơ đồ mạch dày: chỉ dịch chữ lớn (tiêu đề/nhãn mục), giữ nhãn siêu nhỏ nguyên.

## Hạ tầng
- `scripts/img-i18n/translate-image.py` — renderer (image + spec.json → webp).
- `scripts/img-i18n/batch-ocr.py` — OCR toàn bộ → specs JSON.
- Backup bản Trung: `.backup-zh-detail-images/` (untracked, khôi phục được).
- Specs làm việc: scratchpad `specs/`.

## Tiến độ
- [x] Pilot sdv3/params/01 — đạt chuẩn, user duyệt.
- [ ] sdv3 (params 5, accessories 12, intro data-driven)
- [ ] sda2 (intro 1, params 2, accessories 10)
- [ ] s600 (intro 1, params 6, accessories 4)
- [ ] s600e (intro 1, params 6, accessories 4)
- [ ] s3100 (intro 3, params 9, accessories 2)
- [ ] penta-12t (intro 5, params 5, accessories 4)

## Rollback
Khôi phục: `cp -r .backup-zh-detail-images/series/* public/img/products/series/`
