export type KitIcon =
  | "controller"
  | "drive"
  | "motor"
  | "psu"
  | "mpg"
  | "ioboard";

export type KitItem = { label: string; icon: KitIcon };

/** Transparent front-face render with intrinsic pixel dimensions. */
export type ProductPhoto = { src: string; w: number; h: number };

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
  /** Front-face controller render used as the card thumbnail. */
  image: ProductPhoto;
  /** Components shipped in the machine kit built around this controller. */
  bundle: KitItem[];
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
    ],
    image:{src:"/products/f54-front.webp", w:900, h:581},
    bundle:[
      {label:"Bộ điều khiển F54", icon:"controller"},
      {label:"Servo Drive Wecon 400W", icon:"drive"},
      {label:"Servo Motor Wecon 400W", icon:"motor"},
      {label:"Nguồn 24V-2.2A MeanWell", icon:"psu"},
      {label:"Tay quay MPG 4 trục", icon:"mpg"},
      {label:"Board I/O Link_07", icon:"ioboard"},
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
    ],
    image:{src:"/products/f86-front.webp", w:900, h:667},
    bundle:[
      {label:"Bộ điều khiển F86", icon:"controller"},
      {label:"Servo Drive Wecon 750W", icon:"drive"},
      {label:"Servo Motor Wecon 750W", icon:"motor"},
      {label:"Nguồn 24V-4.5A MeanWell", icon:"psu"},
      {label:"Tay quay MPG 6 trục", icon:"mpg"},
      {label:"Board I/O Link_07", icon:"ioboard"},
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
    ],
    image:{src:"/products/f10t-front.webp", w:900, h:667},
    bundle:[
      {label:"Bộ điều khiển F10T", icon:"controller"},
      {label:"Servo Drive Wecon 750W", icon:"drive"},
      {label:"Servo Motor Wecon 750W", icon:"motor"},
      {label:"Nguồn 24V-4.5A MeanWell", icon:"psu"},
      {label:"Tay quay MPG 6 trục", icon:"mpg"},
      {label:"Board I/O Link_07", icon:"ioboard"},
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
    ],
    image:{src:"/products/astro-6ah-front.webp", w:900, h:817},
    bundle:[
      {label:"Bộ điều khiển Astro 6AH", icon:"controller"},
      {label:"Servo Drive EtherCAT 1kW", icon:"drive"},
      {label:"Servo Motor encoder tuyệt đối", icon:"motor"},
      {label:"Nguồn 24V-6.5A MeanWell", icon:"psu"},
      {label:"Tay quay MPG 6 trục", icon:"mpg"},
      {label:"Board EtherCAT I/O Slice", icon:"ioboard"},
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
    ],
    image:{src:"/products/astro-6av-front.webp", w:402, h:900},
    bundle:[
      {label:"Bộ điều khiển Astro 6AV", icon:"controller"},
      {label:"Servo Drive EtherCAT 1kW", icon:"drive"},
      {label:"Servo Motor encoder tuyệt đối", icon:"motor"},
      {label:"Module Vision option", icon:"ioboard"},
      {label:"Nguồn 24V-6.5A MeanWell", icon:"psu"},
      {label:"Tay quay MPG 6 trục", icon:"mpg"},
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
    ],
    image:{src:"/products/astro-10i-front.webp", w:459, h:900},
    bundle:[
      {label:"Bộ điều khiển Astro 10i", icon:"controller"},
      {label:"Servo Drive EtherCAT 1.5kW", icon:"drive"},
      {label:"Servo Motor encoder tuyệt đối", icon:"motor"},
      {label:"Nguồn 24V-10A MeanWell", icon:"psu"},
      {label:"Tay quay MPG 6 trục", icon:"mpg"},
      {label:"Gateway OPC UA / EtherCAT", icon:"ioboard"},
    ] },
];
