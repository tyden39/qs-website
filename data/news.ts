export type News = {
  slug: string;
  title: string;
  date: string;
  cat: string;
  excerpt: string;
  body: string; // HTML — sanitized at seed time, rendered with prose styles.
  tags?: string[];
};

const astro12xBody = `
<p>TP. Hồ Chí Minh, 28/04/2026 — QS Technology hôm nay chính thức công bố Astro 12X, dòng controller mới nhất trong gia đình Astro-series, với khả năng điều khiển đồng thời 12 trục servo qua giao thức EtherCAT thời gian thực. Đây là sản phẩm đầu bảng của QS, hướng tới các dây chuyền tự động hoá phức tạp như máy gia công đa trục, robot công nghiệp và hệ thống cấp phôi tự động.</p>
<p>So với Astro 10i đang là flagship hiện tại với 6 trục đồng bộ, Astro 12X tăng gấp đôi số trục, chu kỳ EtherCAT giảm từ 500 µs xuống 250 µs, đồng thời tích hợp sẵn module xử lý hình ảnh (machine vision) qua cổng GigE Vision — cho phép triển khai các ứng dụng pick-and-place, kiểm tra chất lượng inline mà không cần thiết bị bên thứ ba.</p>
<h2 id="why-12-axis">Vì sao là 12 trục?</h2>
<p>Trong khảo sát khách hàng OEM năm 2025 của QS, 43% trong số 120 nhà tích hợp được hỏi cho biết họ đang phải ghép 2 controller để đủ số trục cho dây chuyền của mình — đặc biệt là các máy CNC 5-trục có cụm đổi dao tự động ATC, hoặc dây chuyền cấp phôi có nhiều cánh tay robot.</p>
<blockquote><p>"Chúng tôi muốn loại bỏ tình huống khách hàng phải dùng 2 controller riêng và đồng bộ qua bus chậm. Astro 12X là câu trả lời — một bộ điều khiển duy nhất cho cả dây chuyền."</p><cite>— Lê Thanh Mai, CTO QS Technology</cite></blockquote>
<p>Astro 12X được phát triển trong 18 tháng, với hơn 400 giờ thử nghiệm thực tế tại 3 nhà máy đối tác ở TP. Hồ Chí Minh, Long An và Hải Phòng. Phiên bản đang trưng bày tại VME 2026 là bản pilot đã chạy liên tục 720 giờ trên dây chuyền tiện-phay 8 trục mà không gặp sự cố nào.</p>
<h2 id="specs">Thông số nổi bật</h2>
<ul>
<li>12 trục servo đồng bộ qua EtherCAT, chu kỳ 250 µs / 500 µs có thể chọn</li>
<li>Giao diện cảm ứng 12.1" độ phân giải 1280×800, gorilla glass, chống dầu IP65 mặt trước</li>
<li>Module thị giác máy GigE Vision tích hợp, hỗ trợ camera Basler / Hikvision lên tới 5 MP</li>
<li>Bộ nhớ chương trình 64 GB SSD công nghiệp, lưu trữ tới 12.000 program</li>
<li>Kết nối 2× Gigabit Ethernet, Wi-Fi 6, Modbus TCP, OPC UA, MQTT</li>
<li>Vỏ nhôm đúc CNC tản nhiệt thụ động, không cần quạt — vận hành 0–55°C</li>
</ul>
<h2 id="shipping">Lộ trình giao hàng</h2>
<p>Đặt hàng mở từ 15/05/2026, ưu tiên cho khách hàng đang vận hành Astro 10i và F86. Lô đầu 60 chiếc dự kiến giao tháng 9/2026, công suất ổn định 80 chiếc/tháng từ Q4. Giá niêm yết phiên bản tiêu chuẩn 89 triệu VND, bao gồm bảo hành 24 tháng và đào tạo vận hành 3 ngày tại nhà máy QS.</p>
<h2 id="demo">Tham gia demo trực tiếp</h2>
<p>Astro 12X sẽ được trưng bày và demo trực tiếp tại VME 2026, Booth A23, SECC TP.HCM từ 22–25/04/2026. Khách hàng có nhu cầu trao đổi sâu về cấu hình có thể đặt lịch riêng với đội kỹ thuật qua email sales@qstechnology.vn hoặc hotline +84 28 3636 1234.</p>
`.trim();

const placeholderBody = (excerpt: string) => `
<p>${excerpt}</p>
<p>Bài viết chi tiết đang được biên tập. Theo dõi QS Newsroom để nhận thông tin cập nhật mới nhất về sản phẩm, sự kiện và đối tác.</p>
`.trim();

export const news: News[] = [
  {
    slug: "astro-12x",
    title: "QS công bố Astro 12X — flagship 12 trục cho dây chuyền tự động hoá",
    date: "28 · 04 · 2026",
    cat: "Sản phẩm mới",
    excerpt:
      "Phiên bản mở rộng EtherCAT, hỗ trợ tới 12 trục đồng bộ với chu kỳ 250µs, tích hợp module thị giác máy. Dự kiến giao hàng từ Q3/2026 cho khách hàng OEM trong nước. Đây là controller có số trục lớn nhất từng được sản xuất tại Việt Nam.",
    body: astro12xBody,
    tags: ["astro-12x", "flagship", "ethercat", "12-axis", "machine-vision", "vme-2026", "san-pham-moi"],
  },
  {
    slug: "vme-2026",
    title: "QS tham dự VME 2026 — Booth A23 tại SECC TP.HCM",
    date: "22 · 04 · 2026",
    cat: "Sự kiện",
    excerpt:
      "Triển lãm Cơ khí Chế tạo & Phụ trợ 2026 sẽ diễn ra 22–25/04 tại Trung tâm Hội chợ Triển lãm Sài Gòn. QS giới thiệu Astro 12X mới và demo trực tiếp.",
    body: placeholderBody(
      "Triển lãm Cơ khí Chế tạo & Phụ trợ 2026 sẽ diễn ra 22–25/04 tại Trung tâm Hội chợ Triển lãm Sài Gòn. QS giới thiệu Astro 12X mới và demo trực tiếp."
    ),
  },
  {
    slug: "precitech-long-an",
    title: "Bàn giao 24 controller F86 cho PRECITECH Long An",
    date: "15 · 04 · 2026",
    cat: "Khách hàng",
    excerpt:
      "Lô hàng được lắp đặt trên dây chuyền phay khuôn nhôm tại nhà máy mới của PRECITECH, dự kiến vận hành từ tháng 5/2026.",
    body: placeholderBody(
      "Lô hàng được lắp đặt trên dây chuyền phay khuôn nhôm tại nhà máy mới của PRECITECH, dự kiến vận hành từ tháng 5/2026."
    ),
  },
  {
    slug: "firmware-v42",
    title: "Firmware v4.2 — G-code tuỳ biến và post-processor Mastercam",
    date: "02 · 04 · 2026",
    cat: "Kỹ thuật",
    excerpt:
      "Bản cập nhật miễn phí cho toàn bộ controller QS từ 2018 trở đi, bổ sung 14 macro G-code và file post cho Mastercam 2026.",
    body: placeholderBody(
      "Bản cập nhật miễn phí cho toàn bộ controller QS từ 2018 trở đi, bổ sung 14 macro G-code và file post cho Mastercam 2026."
    ),
  },
  {
    slug: "binh-duong-expansion",
    title: "QS mở rộng nhà máy TP. Hồ Chí Minh lên 4.200m²",
    date: "18 · 03 · 2026",
    cat: "Công ty",
    excerpt:
      "Khu mở rộng 1.800m² đi vào vận hành từ tháng 3/2026, nâng công suất bo mạch hàng tháng từ 720 lên 1.800. Tuyển thêm 18 nhân sự sản xuất.",
    body: placeholderBody(
      "Khu mở rộng 1.800m² đi vào vận hành từ tháng 3/2026, nâng công suất bo mạch hàng tháng từ 720 lên 1.800. Tuyển thêm 18 nhân sự sản xuất."
    ),
  },
  {
    slug: "f10t-r",
    title: "F10T phiên bản touch xoay 270° ra mắt — F10T-R",
    date: "10 · 03 · 2026",
    cat: "Sản phẩm",
    excerpt:
      "Biến thể có cụm màn xoay điện tử cho máy phay đứng / nằm chuyển đổi. Đặt hàng trước nhận ưu đãi 8% đến 30/05/2026.",
    body: placeholderBody(
      "Biến thể có cụm màn xoay điện tử cho máy phay đứng / nằm chuyển đổi. Đặt hàng trước nhận ưu đãi 8% đến 30/05/2026."
    ),
  },
  {
    slug: "shark-haiphong",
    title: "Triển khai Astro 10i tại xưởng đóng tàu SHARK Hải Phòng",
    date: "25 · 02 · 2026",
    cat: "Khách hàng",
    excerpt:
      "Hệ thống điều khiển 6 trục cho máy phay tấm thép vỏ tàu kích thước lớn. Là đơn hàng đầu tiên của QS trong ngành đóng tàu.",
    body: placeholderBody(
      "Hệ thống điều khiển 6 trục cho máy phay tấm thép vỏ tàu kích thước lớn. Là đơn hàng đầu tiên của QS trong ngành đóng tàu."
    ),
  },
];
