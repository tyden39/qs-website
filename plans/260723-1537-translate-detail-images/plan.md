# Dịch & thay chữ trên ảnh detail servo/biến tần

Status: done (áp dụng lên public/ ngày 2026-07-23)

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

## Tiến độ — HOÀN TẤT
- [x] Pilot sdv3/params/01 — đạt chuẩn, user duyệt.
- [x] Glossary 1182 mục (batch1 422 freq≥2 + batch2 327 core + batch3 433 penta).
- [x] Toàn bộ 6 series đã dịch & ghi đè public/ (87 ảnh).
- Còn ~2 ô lẻ giữ nguyên: OCR noise "品品品品品", nhãn kích thước "442(H1)";
  vài nhãn CJK dọc trong sơ đồ mạch cố ý giữ nguyên (đúng yêu cầu "giữ sơ đồ").
- Vài ô OCR bỏ sót lẻ tẻ (vd "振动" ở sdv3/params/02) — không đáng kể.

## Chạy lại / thêm ảnh
1. OCR: `python3 scripts/img-i18n/batch-ocr.py .image-i18n-work/specs-raw [series...]`
2. Dịch thêm chuỗi thiếu → cập nhật `.image-i18n-work/glossary.json`
3. Fill: `python3 scripts/img-i18n/fill-glossary.py specs-raw glossary.json specs-vi`
4. Preview: `batch-render.py .image-i18n-work/specs-vi --preview <dir>`
5. Apply: `batch-render.py .image-i18n-work/specs-vi --apply`
Yêu cầu: `pip install --user --break-system-packages rapidocr-onnxruntime`

## Rollback
Khôi phục: `cp -r .backup-zh-detail-images/series/* public/img/products/series/`
