# Phase 5 — Đóng gói `electron-builder` + tài liệu

## Files
- Sửa: `admin/package.json` — scripts + config `electron-builder` (appId, productName, targets).
- Tạo: `admin/electron-builder.yml` (hoặc field `build` trong package.json): targets
  Linux `AppImage`+`deb`, Windows `nsis`, Mac `dmg`; icon; `asar` on.
- Tạo: `admin/build/icon.*` (icon app).
- Tạo: `docs/admin-guide.md` (HDSD tiếng Việt cho người dùng cuối).
- Sửa: `README.md` (mục "Chỉnh sửa nội dung bằng app admin").

## Scripts (trong `admin/`)
- `dev`: `electron-vite dev` (HMR main+renderer).
- `build`: `electron-vite build`.
- `dist`: `electron-vite build && electron-builder` → xuất installer trong `admin/release/`.

## Trải nghiệm người dùng cuối
1. IT/người dùng clone repo qs-website 1 lần (git + SSH đã cấu hình để push).
2. Cài app: tải installer (`.exe`/`.dmg`/`.AppImage`) → cài như phần mềm thường.
3. Mở app → lần đầu chọn thư mục qs-website → app nhớ lại.
4. Sửa nội dung → nút **Publish** → app commit + push → Cloudflare tự build & deploy (~vài phút).

## docs/admin-guide.md (nội dung)
- Chuẩn bị: clone repo, cấu hình quyền push GitHub (SSH key hoặc git credential), cài app.
- Dùng hằng ngày: mở app → chọn/đã nhớ folder → sửa → Publish → chờ site cập nhật.
- Xử lý sự cố: git chưa cấu hình push, publish lỗi do conflict (cần người kỹ thuật kéo/rebase thủ công),
  chọn nhầm thư mục không hợp lệ.

## Validation
- `admin: yarn dist` xuất installer; cài trên máy sạch → mở → chọn folder repo → sửa → Publish → commit lên GitHub.
- Build site (`yarn build` ở repo gốc) KHÔNG kéo `admin/` vào `out/` (admin là workspace tách, ngoài phạm vi Next).
