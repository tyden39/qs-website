# Cổng kết nối bộ điều khiển CNC

Tài liệu tổng hợp từ `data/products.json` (trường `interfaces` và `specs`). Khi dữ liệu đổi, cập nhật lại theo file JSON, không sửa tay số liệu ở đây.

## Bảng tổng hợp

| Sản phẩm | Trục | Pulse Train | EtherCAT | Mechatrolink MII/MIII | Cổng I/O (vào/ra) |
|---|---|---|---|---|---|
| F54 | 4 trục | Tiêu chuẩn | – | – | 16 / 6 |
| F86 | 6 trục | Tiêu chuẩn | Tùy chọn | – | 24 / 16 + 16 / 16 |
| F10T | 6 trục | Tiêu chuẩn | Tùy chọn | – | 24 / 16 + 16 / 16 |
| Astro 10S | 16 trục | Tiêu chuẩn | Tùy chọn | – | 16 / 16 + 16 / 16 |
| Astro 6AH | 6 trục | Tiêu chuẩn | Tùy chọn | Tùy chọn | 24 / 16 + 16 / 16 + 16 / 16 |
| Astro 6AV | 6 trục | Tiêu chuẩn | Tùy chọn | Tùy chọn | 24 / 16 + 16 / 16 + 16 / 16 |
| Astro 10i | 6 trục | Tiêu chuẩn | Tùy chọn | Tùy chọn | 24 / 16 + 16 / 16 + 16 / 16 |

Ghi chú: I/O ghi theo dạng `vào/ra`. Dữ liệu không nêu loại đầu nối vật lý (RJ45, DB9…).

## Chi tiết từng sản phẩm

### F54

**Giao tiếp**

- Pulse Train: Tiêu chuẩn

**Thông số**

- Control axes: 4 axes
- Dimensions: 220 × 140 × 30 mm
- Display: 5 inches
- I/O ports: 16 / 6
- PLC: Integrated Ladder
- Encoder: Index feedback
- Input voltage: 24VDC, 1.5A
- Control mode: Open loop

### F86

**Giao tiếp**

- Pulse Train: Tiêu chuẩn
- EtherCAT: Tùy chọn

**Thông số**

- Control axes: 6 axes
- Dimensions: 326 × 185 × 30 mm
- Display: 8 inches
- I/O ports: 24 / 16 + 16 / 16
- PLC: Integrated Ladder
- Encoder: Index feedback + All axes
- Input voltage: 24VDC, 1.5A
- Control mode: Open loop

### F10T

**Giao tiếp**

- Pulse Train: Tiêu chuẩn
- EtherCAT: Tùy chọn

**Thông số**

- Control axes: 6 axes
- Dimensions: 254 × 195 × 40 mm
- Display: 10.4 inches (touch screen)
- I/O ports: 24 / 16 + 16 / 16
- PLC: Integrated Ladder
- Encoder: Index feedback + All axes
- Input voltage: 24VDC, 1.5A
- Control mode: Open loop

### Astro 10S

**Giao tiếp**

- Pulse Train: Tiêu chuẩn
- EtherCAT: Tùy chọn

**Thông số**

- Control axes: 16 axes
- Dimensions: 254 × 210 × 40 mm
- Display: 10.4 inches (touch screen)
- I/O ports: 16 / 16 + 16 / 16
- PLC: Integrated Ladder
- Encoder: Index feedback + All axes
- Input voltage: 24VDC, 1.5A
- Control mode: Open loop

### Astro 6AH

**Giao tiếp**

- Pulse Train: Tiêu chuẩn
- EtherCAT: Tùy chọn
- Mechatrolink MII/MIII: Tùy chọn

**Thông số**

- Control axes: 6 axes
- Dimensions: 325 × 285 × 42 mm
- Display: 8 inches
- I/O ports: 24 / 16 + 16 / 16 + 16 / 16
- PLC: Integrated Ladder
- Encoder: All axes
- Input voltage: 24VDC, 1.5A
- Control mode: Closed loop

### Astro 6AV

**Giao tiếp**

- Pulse Train: Tiêu chuẩn
- EtherCAT: Tùy chọn
- Mechatrolink MII/MIII: Tùy chọn

**Thông số**

- Control axes: 6 axes
- Dimensions: 220 × 460 × 42 mm
- Display: 8 inches
- I/O ports: 24 / 16 + 16 / 16 + 16 / 16
- PLC: Integrated Ladder
- Encoder: All axes
- Input voltage: 24VDC, 1.5A
- Control mode: Closed loop

### Astro 10i

**Giao tiếp**

- Pulse Train: Tiêu chuẩn
- EtherCAT: Tùy chọn
- Mechatrolink MII/MIII: Tùy chọn

**Thông số**

- Control axes: 6 axes
- Dimensions: 254 × 485 × 42 mm
- Display: 10.4 inches
- I/O ports: 24 / 16 + 16 / 16 + 16 / 16
- PLC: Integrated Ladder
- Encoder: All axes
- Input voltage: 24VDC, 1.5A
- Control mode: Closed loop
