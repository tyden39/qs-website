# Crawl sâu biến tần + servo driver — đối chiếu manual gốc

Date: 2026-07-22. Nối tiếp [product-data-notes.md](product-data-notes.md) (crawl lớp HTML)
và [servo-subgroup-crawl.md](servo-subgroup-crawl.md) (crawl brochure servo).

Lý do: bảng model trong `data/series.json` mỏng. Đợt trước chỉ đọc HTML savch.net —
mà HTML chỉ có phần marketing, toàn bộ bảng thông số nằm trong PDF/ảnh ở tab 资料下载.

## Nguồn đã dùng (PDF text-based, trích được bằng PyMuPDF)

| Series | Tài liệu | URL |
|---|---|---|
| S600 (IM) | S600开环矢量迷你型(IM)手册, 106 tr | `/uploads/20260120/9586ab4071a08815cae06ce5a17ee461.pdf` |
| S600E (PM) | S600E开环矢量迷你型(PM)手册 | `/uploads/20260120/7f4bc00ab1e38bff3bc55f4d0ab2fa34.pdf` |
| S3100A | S3100A通用矢量型(IM)手册, 153 tr | `/uploads/20260618/6be8c6b66fd03a5a32f7a373bb750d02.pdf` |
| SDV3 | 彩页 27 tr (ảnh, đã có sẵn trong `assets/`) | `/uploads/20260427/ab81e1dfb54604b0184e63ac723a192c.pdf` |

Manual biến tần là PDF có text → trích trực tiếp. Brochure servo là PDF ảnh → phải
render trang ra PNG rồi đọc.

## Kết quả đối chiếu

| Series | Trước | Sau | Ghi chú |
|---|---|---|---|
| S600 | 5 + 5 dòng | không đổi | **Đã đúng và đủ.** Manual tr.6 liệt kê đúng 5 model 220 V + 5 model 440 V. S600E (PM) có thông số điện giống hệt S600 (IM) → 1 bảng dùng chung là chính xác. |
| S3100 220 V | 7 dòng | **15 dòng** | Manual tr.11 có 15 model (0.4 – 55 kW). Thiếu 11/15/18.5/22/30/37/45/55 kW. |
| S3100 440 V | 33 dòng | 33 dòng, sửa 1 ô | Đủ 33 model (0.75 – 800 kW). Model 160 kW ghi `304 (340)` — manual tr.12 **không có** giá trị P cho 160 kW; 340 là dòng G của model 185 kW ở bảng kế tiếp. Đã sửa thành `304`. |
| SDV3 | **0 bảng** | 1 bảng 3 dòng | Bảng cỡ khung driver + kích thước, lấy từ brochure tr.13–14. |
| Motor SCH | 51 dòng × 8 cột | **58 dòng × 10 cột** | Thêm quán tính rotor (kg·m²×10⁻⁴) và moment đỉnh. Nguồn: brochure SDV3 tr.15–20 (frame 60–180) + catalog SDA2 tr.18–22 (frame 180–260). Frame 200–260 hãng không công bố moment đỉnh → để `—`. Thêm 7 model **dòng H5** (xem dưới). |
| SDA2 | 7 dòng cỡ khung, **0 mã model** | **23 dòng model** | Manual SDA2 chương 9 (tr.207–208) liệt kê đủ 23 mã: 7 bản 220 V (2S0.4G – 2T4.0G) + 16 bản 380 V (4T0.75G – 4T55G), kèm điện trở hãm nội. Cột cỡ khung ghép từ bảng khung của catalog. Bảng cũ chỉ có dải công suất theo khung, khách không tra được mã. |
| UHS BLDC | không có detail | không đổi | **Không phải thiếu sót.** savch.net (`/chaogaosubianpinqi/244.html`) chỉ công bố 4 thông số — đúng bằng phần `specs` đang có. Không có bảng model nào để lấy. |

## Dòng H5 — 7 model bị bỏ sót

Note cũ của bảng motor viết "Dòng HS cao tốc (hậu tố -□5, tới 6000 v/ph) **đặt riêng**
theo SDA2" → hiểu là hãng không công bố. Sai: catalog SDA2 tr.13–17 có bảng thông số
đầy đủ cho 7 model H5, ngang với dòng H.

| Model | W | Driver | Nm | v/ph (max) | A | J | Peak Nm | kg |
|---|---|---|---|---|---|---|---|---|
| SCH060201C-□5 | 200 | SDA2-2S0.4G | 0.64 | 3000 (6000) | 1.6 | 0.28 | 1.92 | 0.8 |
| SCH060401C-□5 | 400 | SDA2-2S0.4G | 1.27 | 3000 (6000) | 2.6 | 0.52 | 3.81 | 1.1 |
| SCH080751C-□5 | 750 | SDA2-2S0.75G | 2.39 | 3000 (6000) | 4.5 | 2 | 7.17 | 2.1 |
| SCH130851H-□5 | 850 | SDA2-2S1.0G | 5.4 | 1500 (3000) | 6.5 | 13.9 | 16.2 | 6.8 |
| SCH130132H-□5 | 1300 | SDA2-2T1.0G | 8.4 | 1500 (3000) | 9.5 | 20.5 | 25.2 | 9.4 |
| SCH130182H-□5 | 1800 | SDA2-2T1.5G | 11.5 | 1500 (3000) | 12.5 | 30.1 | 34.5 | 11.5 |
| SCH130232H-□5 | 2300 | SDA2-2T2.0G | 14.6 | 1500 (3000) | 16.0 | 40.7 | 43.8 | 12.4 |

Đính chính note cũ: H5 **chỉ có bản 220 V**, chỉ ở frame 60/80/130, chỉ ghép SDA2.
"Tới 6000 v/ph" chỉ đúng với frame 60/80 — frame 130 tối đa 3000 v/ph. Catalog không
công bố thông số phanh cho H5 (bảng H5 không có 3 hàng 抱闸 như bảng H).

Cột `volt` của 7 dòng này ghi `220 V · H5` → thành chip lọc thứ ba trên UI
(220 V: 20 · 380 V: 31 · 220 V · H5: 7).

Ghi chú S600 vs S3100: dải 0.4 – 4.0 kW của hai series có số liệu điện trùng khít
(kVA, dòng ra, dòng vào 1 pha / 3 pha). Đây là **trùng thật** — hai series dùng chung
nền phần cứng ở dải nhỏ, đã đối chiếu manual từng series. Không phải lỗi copy dữ liệu.

## Penta 4T — 32 model, trước không có dòng nào

Trang `/gongcheng/313.html` không có PDF; toàn bộ thông số nằm trong 12 ảnh PNG/JPG.
Đã tải và đọc hết 12/12. Mã model nằm rải ở hai bảng phụ:

- **Bảng chọn điện trở hãm** → cột 型号(4T): đủ 32 mã, nhóm theo khung S05 – S60.
- **Bảng tiết diện cáp & thiết bị bảo vệ** → 变频器额定电流 (Inom) + cầu chì / aptomat /
  contactor cho từng mã.

Ghép hai bảng ra `Bảng chọn model — Sinus Penta 4T (400 V)` (32 dòng × 6 cột).

**Catalog không có bảng kW theo model** — không phải thiếu sót của crawl: Penta chạy
"một máy bốn tải" (nhẹ · tiêu chuẩn · nặng · siêu nặng), cùng một máy cho ra kW khác
nhau tuỳ cấp tải, nên hãng công bố theo dòng định mức. Bảng dùng Inom là đúng cơ chế.
Đã ghi rõ điều này ở `note` để khách không đi tìm cột kW.

Kiểm chứng chéo: mã 0457 và 0524 xuất hiện ở cả bảng 4T lẫn 12T với Inom 720 / 800 A
giống nhau → xác nhận cột 变频器额定电流 chính là Inom của bảng 12T, đặt tên cột nhất quán.

Cột tiết diện cáp bị bỏ: nằm trong ô gộp nhiều dòng, trích text không xác định chắc
biên ô. Chỉ giữ cột ánh xạ 1-1 rõ ràng (cùng nguyên tắc đã áp dụng cho cột dòng hãm
của SDA2).

Dữ liệu khác đã đọc được nhưng chưa dùng (nhóm phụ kiện — user không chọn): kích thước
& khối lượng theo khung S05 – S80, khoảng cách lắp đặt, yêu cầu tản nhiệt, điện kháng
vào/ra, card mở rộng ES847/ES870/ES822/ES836/ES860, lọc EMC, bộ hãm ngoài BU200.
Ghi chú kỹ thuật đáng chú ý: khung **S30 trở xuống có module hãm tích hợp**, từ S40 trở
lên bắt buộc BU200 ngoài; **S05 – S60 là cấp 4T, S65 – S80 là cấp 6T**.

## Còn lại

1. **Ảnh sản phẩm** — card cáp DL- / SA2FK vẫn chưa có ảnh thật.
2. **Manual SDV3** (`e3df5284…`) trả về 130 KB và không có `content-length` → nhiều khả
   năng link hỏng phía savch.net. Không chặn việc gì: dữ liệu SDV3 đã lấy đủ từ brochure.
3. Chưa làm (user không chọn): tab 选配附件 và 资料下载.

## Ghi chú về tải file từ savch.net

Server hay đứt giữa chừng. `curl -C -` (resume) làm hỏng file — nối thêm byte vào phần
đã tải rồi vẫn tính là xong. Cách chạy được: tải lại từ đầu, kiểm tra file hợp lệ
(PNG phải có chunk `IEND` ở cuối, PDF phải mở được bằng PyMuPDF) rồi mới nhận; sai thì
xoá và thử lại. Script: `scratchpad/fetch-penta.sh`. Không kiểm tra thì file cụt trông
y hệt file đủ — 4/12 ảnh Penta và cả hai brochure S600/S3100 đã dính lỗi này.

## Kiểm chứng

`npx tsc --noEmit`, `npx eslint app lib data`, `yarn i18n:check` đều pass (2 warning
`no-img-element` có sẵn từ trước, ở `product-video.tsx`, không liên quan).

Toàn bộ bảng đã kiểm số cột khớp số ô từng dòng:

| Series | Bảng |
|---|---|
| sdv3 | 3×5 |
| sda2 | 23×5 |
| sch-motor | 58×10 |
| dl-power-cable | 3×4 |
| sa2fk-encoder-cable | 5×4 |
| s600 | 5×6 · 5×5 |
| s3100 | 15×6 · 33×5 |
| penta | 32×6 · 16×7 |
| uhs-bldc | — (hãng không công bố) |

`SeriesModelTable` đã cuộn ngang sẵn cho bảng dài nên bảng 10 cột không phá layout.

Lưu ý: `components/products/series-card.tsx` cũng đang có thay đổi chưa commit (bọc
`<Link>` quanh ảnh + tên series). **Không phải từ đợt crawl này** — xuất hiện từ nguồn
khác trong lúc làm.
