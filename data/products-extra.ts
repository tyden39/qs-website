// Additive product enrichment crawled from qstcnc.com (WooCommerce Store API).
// Keyed by the local product slug in data/products.ts — that file is the curated
// source of truth and is intentionally NOT modified here. Merged into ProductView
// by lib/data/products.ts. Vietnamese-only, matching the existing seed.

export type ProductGalleryPhoto = { src: string; w: number; h: number; alt: string };

export type ProductExtra = {
  /** Long marketing overview (sanitized HTML, prose-rendered). */
  overview?: string;
  /** Per-model feature highlights from the catalogue short description. */
  highlights?: string[];
  /** Real product photos hosted locally under /public. */
  gallery?: ProductGalleryPhoto[];
  documents?: string[];
  software?: string[];
  accessories?: string[];
  /** Original product page on the legacy site. */
  sourceUrl?: string;
};

export const productExtras: Record<string, ProductExtra> = {
  "f86": {
    overview: `<p>Bộ điều khiển CNC F86 thuộc dòng sản phẩm mới của QS Technology với thiết kế kích thước lớn hơn, màn hình hiển thị lớn hơn lên đến 8 Inches có độ phân giải 800 x 600 px khiến cho việc vận hành cũng như theo dõi các thông tin vận hành của máy trở nên trực quan và dễ dàng hơn với người vận hành. Ngoài ra giao diện vận hành được thiết kế hiện đại, mới mẻ là một điểm cộng thu hút người dùng từ ánh nhìn đầu tiên. Bộ điều khiển F86 cho phép điều khiển từ 4 đến 6 trục đồng thời.và có thêm chức năng hồi tiếp Encoder phase Z giúp cho người vận hành có thể điều khiển các trục về vị trí home được chính xác hơn. Với bộ vi xử lý hiệu năng cao bộ điều khiển F86 được tích hợp một module xử lý PLC cho phép người dùng có thể theo dõi trạng thái hoạt động, lập trình mở rộng chức năng hoạt động của máy. Bên cạnh đó cho phép lập trình Macro là một điểm mạnh của bộ điều khiển F86.</p>`,
    gallery: [
      { src: "/img/products/crawled/f86/gallery-1.webp", w: 1280, h: 970, alt: "Bộ điều khiển CNC 6 trục F86" },
      { src: "/img/products/crawled/f86/gallery-2.webp", w: 1400, h: 1297, alt: "Bộ điều khiển CNC 6 trục F86" },
      { src: "/img/products/crawled/f86/gallery-3.webp", w: 1400, h: 929, alt: "Bộ điều khiển CNC 6 trục F86" },
      { src: "/img/products/crawled/f86/gallery-4.webp", w: 1400, h: 788, alt: "Bộ điều khiển CNC 6 trục F86" },
    ],
    documents: ["Operation Manual"],
    software: ["QS Editor", "QS Explorer"],
    accessories: ["Board - I/O Link-32-V1-10722", "Board I/O Link RLTR_07_V10723", "Board PID-V1-10722", "Board-DAC-12FCV1-1222"],
    sourceUrl: "https://qstcnc.com/san-pham/bo-dieu-khien-cnc-6-truc-f86",
  },
  "astro-10i": {
    overview: `<p>Bộ điều khiển CNC Astro 10i, là dòng sản phẩm cao cấp nhất của QS Technology, với đầy đủ các tính năng, hiệu năng mạnh mẽ, điều khiển theo dạng vòng kín, tích hợp FPGA sẽ mang đến những trải nghiệm tốt nhất cho người vận hành … Bộ điều khiển Astro 10i là một phiên bản nâng cấp từ các dòng Astro 6AV và Astro-6AH với bàn phím các nút chức năng được mở rộng hơn cũng như là được tích hợp các thêm các thiết bị điện tử khác như công tắc, nút dừng khẩn cấp.. Ngoài ra với kích thước màn hình 10.4 Inch với độ phân giải 800 x 600 giúp cho người vận hành có thể theo dõi các thông số rõ ràng, chi tiết.</p>`,
    highlights: [
      "LCD 10.4 Inch",
      "6 trục điều khiển đồng thời",
      "Só trục chính điều khiển đồng thời: 2",
      "Số cổng Input/Output: 24/16",
      "Số cổng I/O mở rộng tối đa: 256/256",
      "Real-time PLC debug",
      "Look-Ahead 1000 dòng",
      "Tính năng bù rơ cơ khí (backlash)",
      "Tính năng bù sai số hành trình (pitch error)",
      "Hồi tiếp Encoder: Tất cả các trục",
    ],
    gallery: [
      { src: "/img/products/crawled/astro-10i/gallery-1.webp", w: 1339, h: 2227, alt: "Bộ điều khiển CNC 6 trục Astro 10i" },
      { src: "/img/products/crawled/astro-10i/gallery-2.webp", w: 1400, h: 2488, alt: "Bộ điều khiển CNC 6 trục Astro 10i" },
    ],
    documents: ["Catalog", "Operation Manual"],
    software: ["QS Editor", "QS Explorer"],
    accessories: ["Board - I/O Link-32-V1-10722", "Board I/O Link RLTR_07_V10723", "Board PID-V1-10722", "Board-DAC-12FCV1-1222"],
    sourceUrl: "https://qstcnc.com/san-pham/bo-dieu-khien-cnc-6-truc-astro-10i",
  },
  "astro-6av": {
    overview: `<p>Bộ điều khiển CNC thuộc series Astro, là dòng sản phẩm cao cấp của QS Technology, với đầy đủ các tính năng, hiệu năng mạnh mẽ, điều khiển theo dạng vòng kín, tích hợp FPGA sẽ mang đến những trải nghiệm tốt nhất cho người vận hành … Bộ điều khiển Astro-6AV là một phiên bản dọc của bộ điều khiển Astro-6AH với bàn phím các nút chức năng được mở rộng hơn cũng như là được tích hợp tay quay MPG. Ngoài ra với kích thước màn hình 8 Inch với độ phân giải 800 x 600 giúp cho người vận hành có thể theo dõi các thông số rõ ràng, chi tiết.</p>`,
    highlights: [
      "LCD 8 Inch",
      "6 trục điều khiển đồng thời",
      "Số trục chính điều khiển đồng thời: 2",
      "Số cổng Input/Output: 24/16",
      "Số cổng I/O mở rộng tối đa: 256/256",
      "Real-time PLC debug",
      "Look-Ahead 500 dòng",
      "Tính năng bù rơ cơ khí (backlash)",
      "Tính năng bù sai số hành trình (pitch error)",
      "Hồi tiếp Encoder: Tất cả các trục",
    ],
    gallery: [
      { src: "/img/products/crawled/astro-6av/gallery-1.webp", w: 1339, h: 2227, alt: "Bộ điều khiển CNC 6 trục Astro-6A (V)" },
      { src: "/img/products/crawled/astro-6av/gallery-2.webp", w: 1400, h: 2473, alt: "Bộ điều khiển CNC 6 trục Astro-6A (V)" },
      { src: "/img/products/crawled/astro-6av/gallery-3.webp", w: 1400, h: 1394, alt: "Bộ điều khiển CNC 6 trục Astro-6A (V)" },
    ],
    documents: ["Catalog", "Operation Manual"],
    software: ["QS Editor", "QS Explorer"],
    accessories: ["Board - I/O Link-32-V1-10722", "Board I/O Link RLTR_07_V10723", "Board PID-V1-10722", "Board-DAC-12FCV1-1222"],
    sourceUrl: "https://qstcnc.com/san-pham/astro-series-6av",
  },
  "f10t": {
    overview: `<p>Bộ điều khiển F10T là dòng bộ điều khiển CNC sử dụng màn hình cảm ứng điện dung, cho phép điều khiển từ 4 – 6 trục. Kích thước màn hình 10.4 Inch với độ phân giải 800 x 600. Độ chống nhiễu tín hiệu cao. Được tích hợp PLC ladder cho phép người dùng có thể theo dõi trạng thái hoạt động của máy, mở rộng thêm các ựng dụng khi cần thiết.</p>`,
    highlights: [
      "LCD 10.4 Inch",
      "6 trục điều khiển đồng thời",
      "Số trục chính điều khiển đồng thời: 1",
      "Số cổng Input/Output: 24/16",
      "Số cổng I/O mở rộng tối đa: 256/256",
      "Real-time PLC debug",
      "Look-Ahead 250 dòng",
      "Tính năng bù rơ cơ khí",
      "Hồi tiếp encoder: Phase Z",
    ],
    gallery: [
      { src: "/img/products/crawled/f10t/gallery-1.webp", w: 1339, h: 1015, alt: "Bộ điều khiển CNC 6 trục F10T (Touch)" },
      { src: "/img/products/crawled/f10t/gallery-2.webp", w: 1400, h: 1151, alt: "Bộ điều khiển CNC 6 trục F10T (Touch)" },
      { src: "/img/products/crawled/f10t/gallery-3.webp", w: 1400, h: 916, alt: "Bộ điều khiển CNC 6 trục F10T (Touch)" },
    ],
    documents: ["Catalog", "Operation Manual"],
    software: ["QS Editor", "QS Explorer"],
    accessories: ["Board - I/O Link-32-V1-10722", "Board I/O Link RLTR_07_V10723", "Board PID-V1-10722", "Board-DAC-12FCV1-1222"],
    sourceUrl: "https://qstcnc.com/san-pham/astro-series-10t",
  },
  "astro-6ah": {
    overview: `<p>Bộ điều khiển CNC thuộc series Astro là dòng sản phẩm cao cấp của QS Technology, với đầy đủ các chức năng như là: hồi tiếp tín hiệu encoder của tất cả các trục, tích hợp PLC, lập trình Macro,.., Bảng điều khiển có nhiều chức năng và được chia ra làm 2 phần có kèm theo nút dừng khẩn cấp. Kiểu dáng của bộ điều khiển Astro 6AH phù hợp với hầu hết các dạng máy CNC. Việc bộ điều khiển Astro 6AH có chức năng thu thập tín hiệu hồi tiếp từ encoder của tất cả các trục sẽ giúp người dùng có thể vận hành máy được an toàn cũng như chính xác hơn. Tốc độ nội suy đồng thời các trục của bộ điều khiển Astro 6AH sẽ vượt trội hơn các dòng bộ điều khiển như F54, F86</p>`,
    highlights: [
      "LCD 8 Inch",
      "6 trục điều khiển đồng thời",
      "Số trục chính điều khiển đồng thời: 2",
      "Số cổng Input/Output: 24/16",
      "Số cổng I/O mở rộng tối đa: 256/256",
      "Real-time PLC debug",
      "Look-Ahead 500 dòng",
      "Tính năng bù rơ cơ khí (backlash)",
      "Tính năng bù sai số hành trình (pitch error)",
      "Hồi tiếp encoder: tất cả các trục",
    ],
    gallery: [
      { src: "/img/products/crawled/astro-6ah/gallery-1.webp", w: 1338, h: 1015, alt: "Bộ điều khiển CNC 6 trục Astro-6A (H)" },
      { src: "/img/products/crawled/astro-6ah/gallery-2.webp", w: 1400, h: 1650, alt: "Bộ điều khiển CNC 6 trục Astro-6A (H)" },
      { src: "/img/products/crawled/astro-6ah/gallery-3.webp", w: 1400, h: 2473, alt: "Bộ điều khiển CNC 6 trục Astro-6A (H)" },
      { src: "/img/products/crawled/astro-6ah/gallery-4.webp", w: 1400, h: 929, alt: "Bộ điều khiển CNC 6 trục Astro-6A (H)" },
    ],
    documents: ["Catalog", "Operation Manual"],
    software: ["QS Editor", "QS Explorer"],
    accessories: ["Board - I/O Link-32-V1-10722", "Board I/O Link RLTR_07_V10723", "Board PID-V1-10722", "Board-DAC-12FCV1-1222"],
    sourceUrl: "https://qstcnc.com/san-pham/astro-series-6ah",
  },
  "f54": {
    overview: `<p>Bộ điều khiển CNC 4 trục F54 là dạng bộ điều khiển được thiết kế nhỏ gọn, nhưng hiệu năng vô cùng mạnh mẽ có hồi tiếp encoder phase Z cùng với việc được tích hợp PLC ladder cho phép người dùng có thể theo dõi trạng thái của máy cũng như lập trình để mở rộng ứng dụng của máy. Với bộ vi xử lý hiệu năng cao, kích thước màn hình 5 inches có độ phân giải 480 x 272 px giúp người dùng có thể dễ dàng theo dõi các thông số, thông tin hiển thị trên bộ điều khiển.</p>
<p>Ngoài ra giao diện người dùng được thiết kế theo phong cách hiện đại, thân thiện và trực quan tất cả thông tin hiển thị</p>`,
    gallery: [
      { src: "/img/products/crawled/f54/gallery-1.webp", w: 1339, h: 1015, alt: "Bộ điều khiển CNC 4 trục F54" },
      { src: "/img/products/crawled/f54/gallery-2.webp", w: 1400, h: 1015, alt: "Bộ điều khiển CNC 4 trục F54" },
      { src: "/img/products/crawled/f54/gallery-3.webp", w: 1400, h: 916, alt: "Bộ điều khiển CNC 4 trục F54" },
      { src: "/img/products/crawled/f54/gallery-4.webp", w: 1400, h: 792, alt: "Bộ điều khiển CNC 4 trục F54" },
    ],
    documents: ["Catalog", "Operation Manual"],
    software: ["QS Editor", "QS Explorer"],
    accessories: ["4 Axis MPG Handwheel", "Board - I/O Link-32-V1-10722", "Board I/O Link RLTR_07_V10723", "Board PID-V1-10722", "Board-DAC-12FCV1-1222"],
    sourceUrl: "https://qstcnc.com/san-pham/f54-controller",
  },
};
