# Servo sub-group crawl — motor / cable / connector (savch.net)

Date: 2026-07-22. Nguồn: brochure PDF chính hãng tải từ trang chi tiết savch.net
(`/sdv3home/55.html`, `/sda2home/57.html`). Web HTML không có trang riêng cho
motor/cable/connector — 配件类 (accessories) trên savch.net rỗng; toàn bộ part-number
nằm trong brochure (彩页).

- SDV3 brochure (TQ): `savch.net/uploads/20260427/ab81e1dfb54604b0184e63ac723a192c.pdf` (27 trang, dạng ảnh)
- SDA2 catalog (EN): `vi.savch.net/uploads/20250211/25745bd151dcc0920e8808496bd544be.pdf` (30 trang, dạng ảnh —
  bản savch.net tải quá chậm, dùng mirror vi.savch.net)
- PDF gốc + ảnh đã trích: `plans/260722-0903-product-taxonomy-savch-crawl/assets/`
  (17MB — xoá sau khi tích hợp xong nếu không muốn giữ trong repo).

---

## 1. MOTOR — dòng SCH (H series), đi với driver SDV3

Mã motor: `SCH` + frame (060/080/110/130/180) + công suất (vd 201 = 200W, 751 = 750W,
102 = 1000W, 382 = 3800W) + hậu tố tốc độ/loại (C/B/E/A/H). Điện áp theo driver ghép:
`SDV3-2S/2T…` = 220V, `SDV3-4T…` = 380V. Cách điện F Class (155°C), −20~+40°C,
phanh (抱闸) DC24V±10% tuỳ chọn.

### H series 220V

| Frame | Motor | W | Driver ghép | Nm | rpm (max) | A | kg |
|---|---|---|---|---|---|---|---|
| 60 | SCH060201C | 200 | SDV3-2S0.4G | 0.64 | 3000 (3600) | 1.8 | 1.2 |
| 60 | SCH060401C | 400 | SDV3-2S0.4G | 1.27 | 3000 (3600) | 2.6 | 1.6 |
| 80 | SCH080751C | 750 | SDV3-2S0.75G | 2.39 | 3000 (3600) | 3 | 2.9 |
| 80 | SCH080731B | 730 | SDV3-2S0.75G | 3.5 | 2000 (2400) | 3 | 3.9 |
| 80 | SCH080102E | 1000 | SDV3-2S1.0G | 4 | 2500 (3000) | 4.4 | 4.1 |
| 110 | SCH110122C | 1200 | SDV3-2S1.0G | 4 | 3000 (3600) | 5 | 6 |
| 110 | SCH110152C | 1500 | SDV3-2S1.5G | 5 | 3000 (3600) | 6 | 6.8 |
| 110 | SCH110122B | 1200 | SDV3-2S1.0G | 6 | 2000 (2400) | 4.5 | 7.9 |
| 110 | SCH110182C | 1800 | SDV3-2S1.5G | 6 | 3000 (3600) | 6 | 7.9 |
| 130 | SCH130102E | 1000 | SDV3-2S1.0G | 4 | 2500 (3000) | 4 | 6.2 |
| 130 | SCH130132E | 1300 | SDV3-2S1.0G | 5 | 2500 (3000) | 5 | 6.6 |
| 130 | SCH130152E | 1500 | SDV3-2S1.5G | 6 | 2500 (3000) | 6 | 7.4 |
| 130 | SCH130102A | 1000 | SDV3-2S1.0G | 10 | 1000 (1200) | 4.5 | 10.2 |
| 130 | SCH130152H | 1500 | SDV3-2S1.5G | 10 | 1500 (1800) | 6 | 10.2 |
| 130 | SCH130202E | 2000 | SDV3-2T2.0G | 7.7 | 2500 (3000) | 7.5 | 8.3 |
| 130 | SCH130262E | 2600 | SDV3-2T2.0G | 10 | 2500 (3000) | 10 | 9.8 |
| 130 | SCH130232H | 2300 | SDV3-2T2.0G | 15 | 1500 (1800) | 9.5 | 12.6 |
| 130 | SCH130382E | 3800 | SDV3-2T3.0G | 15 | 2500 (3000) | 13.5 | 11.8 |
| 180 | SCH180252H | 2500 | SDV3-2T2.0G | 17 | 1500 (1800) | 10 | 19.5 |
| 180 | SCH180302H | 3000 | SDV3-2T3.0G | 19 | 1500 (1800) | 12 | 20.5 |

### H series 380V

| Frame | Motor | W | Driver ghép | Nm | rpm (max) | A | kg |
|---|---|---|---|---|---|---|---|
| 80 | SCH080751C | 750 | SDV3-4T0.75G | 2.39 | 3000 (3600) | 1.6 | 2.9 |
| 80 | SCH080731B | 730 | SDV3-4T0.75G | 3.5 | 2000 (2400) | 1.8 | 3.9 |
| 80 | SCH080102E | 1000 | SDV3-4T1.0G | 4 | 2500 (3000) | 2.3 | 4.1 |
| 110 | SCH110122C | 1200 | SDV3-4T1.0G | 4 | 3000 (3600) | 3.0 | 6 |
| 110 | SCH110152C | 1500 | SDV3-4T1.5G | 5 | 3000 (3600) | 4.5 | 6.8 |
| 110 | SCH110122B | 1200 | SDV3-4T1.0G | 6 | 2000 (2400) | 3.0 | 7.9 |
| 110 | SCH110182C | 1800 | SDV3-4T1.5G | 6 | 3000 (3600) | 4.5 | 7.9 |
| 130 | SCH130102E | 1000 | SDV3-4T1.0G | 4 | 2500 (3000) | 2.6 | 7.7 |
| 130 | SCH130132E | 1300 | SDV3-4T1.0G | 5 | 2500 (3000) | 3.0 | 8.2 |
| 130 | SCH130152E | 1500 | SDV3-4T1.5G | 6 | 2500 (3000) | 4.0 | 8.9 |
| 130 | SCH130202E | 2000 | SDV3-4T2.0G | 7.7 | 2500 (3000) | 4.7 | 10.0 |
| 130 | SCH130102A | 1000 | SDV3-4T1.0G | 10 | 1000 (1200) | 2.5 | 10.1 |
| 130 | SCH130152H | 1500 | SDV3-4T1.5G | 10 | 1500 (1800) | 3.5 | 12.1 |
| 130 | SCH130262E | 2600 | SDV3-4T2.0G | 10 | 2500 (3000) | 6.0 | 9.1 |
| 130 | SCH130232H | 2300 | SDV3-4T2.0G | 15 | 1500 (1800) | 5.0 | 12.6 |
| 130 | SCH130382E | 3800 | SDV3-4T4.0G | 15 | 2500 (3000) | 8.8 | 14.5 |
| 180 | SCH180302H | 3000 | SDV3-4T3.0G | 19 | 1500 (1800) | 7.5 | 20.5 |
| 180 | SCH180432H | 4300 | SDV3-4T4.0G | 27 | 1500 (1800) | 10 | 25.5 |

Tổng: **~25 mã motor** (một số mã dùng chung 220V/380V), frame 60–180, 200W–4.3kW.
Kích thước cơ khí từng frame: brochure trang in 21–23 (đã render sẵn trong scratchpad).

## 2. CABLE — 2 họ, part-number đầy đủ

Quy tắc: `L` cuối mã = chiều dài cáp (mét). Nguồn: brochure trang in 24–25.

### Cáp động lực (động 力线, prefix DL-)

| Mã | Phanh | Motor tương thích |
|---|---|---|
| DL-SCH086(ZD1V)-N-L | không | SCH060–SCH090 |
| DL-SCH086(ZD1V)-B-L | có | SCH060–SCH090 |
| DL-SCH130(ZD1V)-N-L / -B-L | không / có | SCH110–SCH130 |
| DL-SCH180(ZD1V)-N-L / -B-L | không / có | SCH180 |

Decode: `DL` = power cable · nhóm size (SCH086/SCH130/SCH180) · `N` không phanh /
`B` có phanh · `L` chiều dài (m).

### Cáp encoder / phản hồi (反馈线, prefix SA2FK-)

| Mã | Encoder | Motor tương thích |
|---|---|---|
| SA2FK-P1S(ZD1Y)-L | INC | SCH060–SCH090 |
| SA2FK-P1D(ZD1Y)-L | ABS (kèm hộp pin) | SCH060–SCH090 |
| SA2FK-P2S(ZD1Y)-L | INC | SCH110–SCH180 |
| SA2FK-P2D(ZD1Y)-L | ABS (kèm hộp pin) | SCH110–SCH180 |

Decode: `P1`/`P2` = nhóm frame motor · `S` = INC, `D` = ABS · `L` = chiều dài (m).

## 3. CONNECTOR

**Không có part-number riêng trên savch.net lẫn brochure** — đầu nối đi liền bộ cáp
(aviation plug cho frame ≥110, đầu rời cho frame nhỏ; xem hình cáp trang in 24).
→ Đề xuất: gộp connector vào section Cable trên web ("Cáp & đầu nối"), hoặc chờ QS
tự cung cấp mã connector bán lẻ. **Cần user chốt.**

## 4. SDA2 — motor & cáp (từ SDA2 Servo Catalog(H), bản EN)

### Driver SDA2 — 7 size

| Size | 220V (2S/2T) | 380V (4T) |
|---|---|---|
| 1 | 0.4–1.0G | — |
| 2 | 1.5–2.0G | 0.75–1.5G |
| 3 | 3.0–4.0G | 2.0–4.0G |
| 4 | — | 5.5–11G |
| 5 | — | 15–18.5G |
| 6 | — | 22G |
| 7 | — | 30G–55G |

### Motor SDA2 — H series + HS series (high-speed, hậu tố `-□5`, max 6000 rpm)

Frame 60–180 dùng chung mã SCH với SDV3 (cùng motor, khác driver ghép `SDA2-…`).
Phần mở rộng riêng của SDA2:

**HS series 220V (high-speed):** SCH060201C-□5 (200W), SCH060401C-□5 (400W),
SCH080751C-□5 (750W), SCH130851H-□5 (850W), SCH130132H-□5 (1300W),
SCH130182H-□5 (1800W), SCH130232H-□5 (2300W).

**H series 380V frame lớn (chỉ SDA2):**

| Frame | Motor | kW | Driver ghép | Nm | rpm | A | kg |
|---|---|---|---|---|---|---|---|
| 180 | SCH180552H | 5.5 | SDA2-4T5.5G | 35 | 1500 (1800) | 12 | 30.5 |
| 180 | SCH180752H | 7.5 | SDA2-4T7.5G | 48 | 1500 (1800) | 20 | 40 |
| 200 | SCH200832H | 8.3 | SDA2-4T7.5G | 53 | 1500 | 18 | 46 |
| 200 | SCH200113B | 11.1 | SDA2-4T11G | 53 | 2000 | 22 | 46 |
| 200 | SCH200113H | 11 | SDA2-4T11G | 70 | 1500 | 21 | 52 |
| 200 | SCH200133H | 13 | SDA2-4T11G | 84 | 1500 | 23 | 59 |
| 200 | SCH200153B | 15 | SDA2-4T15G | 70 | 2000 | 28 | 52 |
| 200 | SCH200183B | 18 | SDA2-4T18.5G | 84 | 2000 | 32 | 59 |
| 230 | SCH230233H | 23 | SDA2-4T22G | 149 | 1500 | 54 | — |
| 230 | SCH230293H | 29 | SDA2-4T30G | 185 | 1500 | 65.5 | — |
| 230 | SCH230353H | 35 | SDA2-4T37G | 223 | 1500 | 79 | — |
| 260 | SCH260383H | 38 | SDA2-4T30G | 242 | 1500 | 67.5 | — |
| 260 | SCH260453H | 45 | SDA2-4T45G | 286 | 1500 | 93 | — |

Frame 200–260: IP54, làm mát quạt (fan cooling), không kèm cáp động lực từ nhà máy
("SCH200~SCH260 motor is without power cable from factory").

### Cáp SDA2 (ký hiệu ZD1Y, thêm tuỳ chọn `-R` = flexible cable)

| Mã | Loại | Motor tương thích |
|---|---|---|
| DL-SCH086(ZD1Y)-N/B-L(-R) | động lực | SCH060–SCH090 |
| DL-SCH130(ZD1Y)-N/B-L(-R) | động lực | SCH110–SCH130 |
| DL-SCH180(ZD1Y)-N/B-L(-R) | động lực | SCH180 |
| SA2FK-P1S(ZD1Y)-L(-R) | encoder | SCH060–SCH090 |
| SA2FK-P2S(ZD1Y)-L(-R) | encoder | SCH110–SCH260 |
| SA2FK-P2F(ZD1Y)-L(-R) | encoder 2500-line | SCH110–SCH260 |

Encoder code: `F` = 2500 line · `S` = 17/20-bit INC · `D` = 17/20-bit ABS (kèm pin).

## 5. Ảnh đã thu — `assets/` trong thư mục plan này

`assets/web-thumbs/` — 8 thumbnail web chính hãng 300×225 (sdv3, sda2, s600, s600e,
s3100, penta, penta-12t, uhs-bldc) → giải quyết luôn ảnh `image: null` của 4 series
biến tần + 2 series servo trong `data/series.json` (chất lượng thấp, dùng tạm).

`assets/renders/` — ảnh nhúng chất lượng cao trích từ PDF:

| File | Nội dung | Gợi ý dùng |
|---|---|---|
| sdv3-emb-p01-245.png (1411×724) | Dàn driver SDV3 + motor SCH | Hero/series card servo |
| sdv3-emb-p05-35.png (412×335) | Motor SCH đơn (ảnh thực) | Card sub-group Motor |
| sdv3-emb-p13-118.png, p14-122.png (~1000px) | Driver SDV3 cận cảnh | Card Driver SDV3 |
| sda2-emb-p01-205.png, p02-12.png, p02-8.png | Driver SDA2 cận cảnh | Card Driver SDA2 |
| sdv3-emb-p02-5.png, p02-9.png | Dàn biến tần Savch (S600/S3100) | Fallback nhóm biến tần |

Chưa có: ảnh riêng cáp/connector (chỉ có line-art trong PDF), ảnh motor frame lớn.

## Đề xuất mapping vào series.json (khi code)

- `kind: "driver"` — SDV3, SDA2 (đã có, thêm field + ảnh render).
- `kind: "motor"` — 1–2 entry dạng series: "SCH H series" (200W–4.3kW, frame 60–180,
  đi cả SDV3/SDA2) + "SCH H series công suất lớn" (5.5–45kW, frame 180–260, chỉ SDA2);
  hoặc gộp 1 card motor với spec range 0.2–45kW. Bảng mã chi tiết giữ trong file này.
- `kind: "cable"` — 2 entry: cáp động lực DL-… và cáp encoder SA2FK-… (spec = bảng
  tương thích + tuỳ chọn phanh/encoder/flexible).

## Unresolved

1. Connector không có mã riêng (đi liền bộ cáp) → gộp section "Cáp & đầu nối" hay chờ mã từ QS?
2. Rebrand QS: giữ mã SCH/DL/SA2FK nguyên trạng (ordering parity) hay thêm tiền tố QS?
3. Motor hiển thị 1 card gộp hay tách thường/công suất lớn (xem đề xuất mapping)?
4. assets/ nặng 17MB trong plans/ — giữ hay xoá sau tích hợp?
