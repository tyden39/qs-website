export type Product = {
  slug: string;
  name: string;
  axes: string;
  display: string;
  tag: string;
  series: "F" | "Astro";
  badge?: string;
  desc: string;
  bullets: string[];
  specs: { l: string; v: string }[];
};

export const products: Product[] = [
  { slug:"f54", name:"F54", axes:"4 trục", display:"5\"", series:"F", badge:"Recommended",
    tag:"Bộ điều khiển CNC F54",
    desc:"Bộ điều khiển CNC 4 trục F54 thiết kế nhỏ gọn, hiệu năng mạnh mẽ. Có hồi tiếp encoder phase Z và tích hợp PLC ladder cho phép theo dõi trạng thái máy và lập trình mở rộng ứng dụng.",
    bullets:[
      "Kích thước màn hình: 5 inches",
      "Số trục điều khiển tối đa: 4 trục",
      "Điều khiển dạng vòng hở",
    ],
    specs:[
      {l:"Số trục điều khiển",v:"4 trục"},
      {l:"Kích thước",v:"220 × 140 × 30 mm"},
      {l:"Màn hình",v:"5 inches · 480 × 272 px"},
      {l:"Số cổng I/O",v:"16 / 6"},
      {l:"Bộ nhớ",v:"4 GB"},
      {l:"PLC",v:"Ladder tích hợp"},
      {l:"Encoder",v:"Hồi tiếp phase Z"},
      {l:"Điện áp",v:"24 VDC ± 10%"},
    ] },

  { slug:"f86", name:"F86", axes:"6 trục", display:"8\"", series:"F",
    tag:"Bộ điều khiển CNC F86",
    desc:"Controller 8-inch cho máy phay 6 trục có ATC, gia công khuôn nhôm, khuôn nhựa kỹ thuật. Look-ahead 256 block, hỗ trợ post-processor Mastercam và NX.",
    bullets:[
      "Kích thước màn hình: 8 inches",
      "Số trục điều khiển tối đa: 6 trục",
      "Điều khiển dạng vòng hở",
    ],
    specs:[
      {l:"Số trục",v:"6"},
      {l:"Màn hình",v:"8\" 1024×768"},
      {l:"I/O",v:"40in / 32out"},
      {l:"Bộ nhớ",v:"16 GB"},
      {l:"Nguồn",v:"24 VDC"},
      {l:"Bảo hành",v:"24 tháng"},
    ] },

  { slug:"f10t", name:"F10T", axes:"6 trục", display:"10.4\" cảm ứng", series:"F", badge:"Touch",
    tag:"Bộ điều khiển F10T (Cảm ứng)",
    desc:"Controller cảm ứng 10.4-inch cho máy tiện CNC chính xác, biến thể F10T-R có cụm màn xoay 270° cho máy phay đứng/nằm.",
    bullets:[
      "Kích thước màn hình: 10.4 inches",
      "Số trục điều khiển tối đa: 6 trục",
      "Điều khiển dạng vòng hở",
    ],
    specs:[
      {l:"Số trục",v:"6"},
      {l:"Màn hình",v:"10.4\" cảm ứng"},
      {l:"I/O",v:"32in / 24out"},
      {l:"Bộ nhớ",v:"16 GB"},
      {l:"Nguồn",v:"24 VDC"},
      {l:"Bảo hành",v:"24 tháng"},
    ] },

  { slug:"astro-6ah", name:"Astro 6AH", axes:"6 trục", display:"8\"", series:"Astro",
    tag:"Bộ điều khiển Astro 6AH",
    desc:"Controller vòng kín cho dây chuyền tự động hoá, hỗ trợ servo encoder tuyệt đối, giao tiếp EtherCAT thời gian thực.",
    bullets:[
      "Kích thước màn hình: 8 inches",
      "Số trục điều khiển tối đa: 6 trục",
      "Điều khiển dạng vòng kín",
    ],
    specs:[
      {l:"Số trục",v:"6 vòng kín"},
      {l:"Encoder",v:"Tuyệt đối"},
      {l:"Cycle",v:"500 µs"},
      {l:"Fieldbus",v:"EtherCAT"},
      {l:"Nguồn",v:"24 VDC"},
      {l:"Bảo hành",v:"24 tháng"},
    ] },

  { slug:"astro-6av", name:"Astro 6AV", axes:"6 trục", display:"8\"", series:"Astro",
    tag:"Bộ điều khiển Astro 6AV",
    desc:"Phiên bản vertical của Astro 6AH với HMI dọc, vòng kín 6 trục, tích hợp module vision option cho ứng dụng pick-and-place.",
    bullets:[
      "Kích thước màn hình: 8 inches",
      "Số trục điều khiển tối đa: 6 trục",
      "Điều khiển dạng vòng kín",
    ],
    specs:[
      {l:"Số trục",v:"6 vòng kín"},
      {l:"Encoder",v:"Tuyệt đối"},
      {l:"Cycle",v:"500 µs"},
      {l:"Vision",v:"Module option"},
      {l:"Nguồn",v:"24 VDC"},
      {l:"Bảo hành",v:"24 tháng"},
    ] },

  { slug:"astro-10i", name:"Astro 10i", axes:"6 trục", display:"10.4\"", series:"Astro", badge:"Flagship",
    tag:"Bộ điều khiển Astro 10i",
    desc:"Flagship 6 trục vòng kín, EtherCAT, cho gia công khuôn mẫu và linh kiện y tế chính xác cao.",
    bullets:[
      "Kích thước màn hình: 10.4 inches",
      "Số trục điều khiển tối đa: 6 trục",
      "Điều khiển dạng vòng kín",
    ],
    specs:[
      {l:"Số trục",v:"6"},
      {l:"Cycle",v:"250 µs"},
      {l:"Fieldbus",v:"EtherCAT"},
      {l:"OPC UA",v:"Có"},
      {l:"Nguồn",v:"24 VDC"},
      {l:"Bảo hành",v:"24 tháng"},
    ] },
];
