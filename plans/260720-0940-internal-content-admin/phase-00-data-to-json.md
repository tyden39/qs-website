# Phase 0 — Tách data `.ts` → `.json`

Điều kiện tiên quyết: admin phải đọc/ghi được data an toàn. `data/*.ts` hiện trộn type + data + hằng số.

## Mục tiêu
Mỗi loại nội dung có **1 file JSON data thuần** + **1 file `.ts` giữ type và import JSON**. Render site KHÔNG đổi.

## Files
- Tạo: `data/*.json` (products, machines, news, applications, services, downloads).
- Sửa: `data/*.ts` → chỉ giữ `export type`, hằng số logic thật sự, và
  `import raw from "./x.json"` rồi `export const x = raw as X[]`.
- Không đụng: ~30 consumer trong `app/`, `lib/data/`, `components/` (API export giữ nguyên tên).

## Cách làm
1. Với từng file, tách phần mảng/record dữ liệu thuần → JSON; giữ lại trong `.ts`:
   - `export type ...` (giữ nguyên).
   - Hằng số suy dẫn từ logic (vd `sharedWorkflow` dùng lại nhiều nơi): giữ trong `.ts`,
     hoặc inline vào JSON nếu chỉ là dữ liệu lặp. Ưu tiên JSON hoá dữ liệu, giữ TS cho logic.
   - `HERO_TRIPTYCH` (record): JSON hoá được (thuần data) → `hero-triptych.json` hoặc gộp trong products.json.
2. Đảm bảo `tsconfig.json` cho phép `resolveJsonModule` (Next mặc định có; verify).
3. Ép kiểu khi import: `const products = (raw as ProductsRaw) satisfies Product[]`.

## Validation
- `yarn build` xanh.
- Snapshot so sánh: build ra `out/` trước (lưu lại) và sau → `diff -r` chỉ khác timestamp/hash asset, KHÔNG khác nội dung HTML.
- `yarn i18n:check` vẫn pass.

## Rủi ro
- Field dùng `undefined`/optional: JSON không có `undefined` → bỏ hẳn key thay vì để `null` (trừ khi type cho phép null).
- Union type hẹp (vd `KitIcon`, `GalleryPlace`): JSON là string → ép `as` ở ranh giới import, không nới lỏng type.
- Nếu 1 file có logic quá gắn với data (khó tách sạch) → để lại `.ts`, ghi chú trong plan; admin sẽ không sửa file đó ở bản đầu.

## Rollback
Giữ commit trước Phase 0. Nếu `out/` khác nội dung → revert, xử lý từng file lại.
