export type KitIcon =
  | "controller"
  | "drive"
  | "motor"
  | "psu"
  | "mpg"
  | "ioboard"
  | "toolsetter"
  | "probe";

/** Transparent front-face render with intrinsic pixel dimensions. */
export type ProductPhoto = { src: string; w: number; h: number };

/**
 * A component shipped in the kit. `icon` is the schematic SVG fallback;
 * `photo` is the real product render shown when available.
 */
export type KitItem = { label: string; icon: KitIcon; photo?: ProductPhoto };

/**
 * Shared component renders reused across kits. I/O Link boards are named by
 * board type (RLTR / 1616 / 32) exactly as the QS catalogue labels them, so
 * each product references the board the catalogue ships with it.
 */
const COMPONENT_PHOTO = {
  servoDrive: { src: "/img/products/components/servo-drive.webp", w: 508, h: 461 },
  servoMotor: { src: "/img/products/components/servo-motor.webp", w: 600, h: 434 },
  psu: { src: "/img/products/components/psu-meanwell.webp", w: 600, h: 471 },
  mpg: { src: "/img/products/components/mpg-pendant.webp", w: 450, h: 504 },
  ioboardRLTR: { src: "/img/products/components/ioboard-rltr.webp", w: 600, h: 611 },
  ioboard1616: { src: "/img/products/components/ioboard-1616.webp", w: 600, h: 508 },
  ioboard32: { src: "/img/products/components/ioboard-32.webp", w: 600, h: 377 },
  toolSetter: { src: "/img/products/components/tool-setter.webp", w: 388, h: 433 },
  touchProbe: { src: "/img/products/components/touch-probe.webp", w: 600, h: 625 },
} as const;

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

// Shared bundle parts (identical render + label across kits that include them).
const PART = {
  drive: { label: "Servo Drive", icon: "drive", photo: COMPONENT_PHOTO.servoDrive } as KitItem,
  motor: { label: "Servo Motor", icon: "motor", photo: COMPONENT_PHOTO.servoMotor } as KitItem,
  psu: { label: "Bộ nguồn 24V", icon: "psu", photo: COMPONENT_PHOTO.psu } as KitItem,
  mpg: { label: "Tay quay MPG 4 trục", icon: "mpg", photo: COMPONENT_PHOTO.mpg } as KitItem,
  ioRLTR: { label: "Board I/O Link RLTR", icon: "ioboard", photo: COMPONENT_PHOTO.ioboardRLTR } as KitItem,
  io1616: { label: "Board I/O Link 1616", icon: "ioboard", photo: COMPONENT_PHOTO.ioboard1616 } as KitItem,
  io32: { label: "Board I/O Link 32", icon: "ioboard", photo: COMPONENT_PHOTO.ioboard32 } as KitItem,
  toolSetter: { label: "Tool Setter", icon: "toolsetter", photo: COMPONENT_PHOTO.toolSetter } as KitItem,
  probe: { label: "3D Touch Probe", icon: "probe", photo: COMPONENT_PHOTO.touchProbe } as KitItem,
};

const controller = (name: string): KitItem => ({ label: `Bộ điều khiển ${name}`, icon: "controller" });

// Specs and bundles follow the QS "CNC Solution Controller" catalogue: only the
// axis count, control loop, and control interface are published per model.
export const products: Product[] = [
  { slug:"f54", name:"F54", axes:"4 trục", display:"5\"", series:"F", badge:"Recommended",
    tag:"Bộ điều khiển CNC F54",
    desc:"Bộ điều khiển CNC 4 trục dạng vòng hở, giao tiếp xung (Pulse Train). Thiết kế nhỏ gọn cho máy CNC cơ bản, đi kèm trọn bộ servo drive, servo motor, nguồn và board I/O Link.",
    bullets:[
      "Số trục điều khiển: 4 trục",
      "Kiểu điều khiển: Vòng hở (Open-loop)",
      "Giao tiếp: Pulse Train",
    ],
    specs:[
      {l:"Số trục điều khiển",v:"4 trục"},
      {l:"Kiểu điều khiển",v:"Vòng hở (Open-loop)"},
      {l:"Giao thức điều khiển",v:"Pulse Train"},
      {l:"Màn hình",v:"5 inches · 480 × 272 px"},
      {l:"Kích thước",v:"220 × 140 × 30 mm"},
      {l:"Số cổng I/O",v:"16 / 6"},
      {l:"Bộ nhớ",v:"4 GB"},
      {l:"PLC",v:"Ladder tích hợp"},
      {l:"Encoder",v:"Hồi tiếp phase Z"},
      {l:"Điện áp đầu vào",v:"24VDC, 1.5A"},
    ],
    image:{src:"/img/products/f54-front.webp", w:900, h:581},
    bundle:[ controller("F54"), PART.drive, PART.motor, PART.psu, PART.mpg, PART.ioRLTR ] },

  { slug:"f86", name:"F86", axes:"6 trục", display:"8\"", series:"F",
    tag:"Bộ điều khiển CNC F86",
    desc:"Bộ điều khiển CNC 6 trục vòng hở, hỗ trợ giao tiếp Pulse Train và EtherCAT. Phù hợp máy phay nhiều trục, đi kèm trọn bộ servo, tool setter và board I/O Link 1616.",
    bullets:[
      "Số trục điều khiển: 6 trục",
      "Kiểu điều khiển: Vòng hở (Open-loop)",
      "Giao tiếp: Pulse Train · EtherCAT",
    ],
    specs:[
      {l:"Số trục điều khiển",v:"6 trục"},
      {l:"Kiểu điều khiển",v:"Vòng hở (Open-loop)"},
      {l:"Giao thức điều khiển",v:"Pulse Train · EtherCAT"},
      {l:"Màn hình",v:"8 inches"},
      {l:"Kích thước",v:"220 × 140 × 30 mm"},
      {l:"Số cổng I/O",v:"16 / 6"},
      {l:"Bộ nhớ",v:"4 GB"},
      {l:"PLC",v:"Ladder tích hợp"},
      {l:"Encoder",v:"Hồi tiếp phase Z"},
      {l:"Điện áp đầu vào",v:"24VDC, 1.5A"},
    ],
    image:{src:"/img/products/f86-front.webp", w:900, h:667},
    bundle:[ controller("F86"), PART.drive, PART.motor, PART.psu, PART.mpg, PART.toolSetter, PART.io1616 ] },

  { slug:"f10t", name:"F10T", axes:"6 trục", display:"10.4\"", series:"F", badge:"Touch",
    tag:"Bộ điều khiển CNC F10T",
    desc:"Bộ điều khiển CNC 6 trục vòng hở với màn hình lớn, hỗ trợ Pulse Train và EtherCAT. Trọn bộ giải pháp gồm servo drive/motor, tool setter và board I/O Link 1616.",
    bullets:[
      "Số trục điều khiển: 6 trục",
      "Kiểu điều khiển: Vòng hở (Open-loop)",
      "Giao tiếp: Pulse Train · EtherCAT",
    ],
    specs:[
      {l:"Số trục điều khiển",v:"6 trục"},
      {l:"Kiểu điều khiển",v:"Vòng hở (Open-loop)"},
      {l:"Giao thức điều khiển",v:"Pulse Train · EtherCAT"},
      {l:"Màn hình",v:"10.4 inches · cảm ứng"},
      {l:"Kích thước",v:"220 × 140 × 30 mm"},
      {l:"Số cổng I/O",v:"16 / 6"},
      {l:"Bộ nhớ",v:"4 GB"},
      {l:"PLC",v:"Ladder tích hợp"},
      {l:"Encoder",v:"Hồi tiếp phase Z"},
      {l:"Điện áp đầu vào",v:"24VDC, 1.5A"},
    ],
    image:{src:"/img/products/f10t-front.webp", w:900, h:667},
    bundle:[ controller("F10T"), PART.drive, PART.motor, PART.psu, PART.mpg, PART.toolSetter, PART.io1616 ] },

  { slug:"astro-6ah", name:"Astro 6AH", axes:"6 trục", display:"8\"", series:"Astro",
    tag:"Bộ điều khiển Astro 6AH",
    desc:"Bộ điều khiển CNC 6 trục vòng kín, hỗ trợ Pulse Train, EtherCAT và Mechatrolink MII/MIII. Giải pháp tự động hoá đầy đủ với servo, board I/O Link 32, tool setter và đầu dò 3D.",
    bullets:[
      "Số trục điều khiển: 6 trục",
      "Kiểu điều khiển: Vòng kín (Closed-loop)",
      "Giao tiếp: Pulse Train · EtherCAT · Mechatrolink MII/MIII",
    ],
    specs:[
      {l:"Số trục điều khiển",v:"6 trục"},
      {l:"Kiểu điều khiển",v:"Vòng kín (Closed-loop)"},
      {l:"Giao thức điều khiển",v:"Pulse Train · EtherCAT · Mechatrolink MII/MIII"},
      {l:"Màn hình",v:"8 inches"},
      {l:"Kích thước",v:"220 × 140 × 30 mm"},
      {l:"Số cổng I/O",v:"16 / 6"},
      {l:"Bộ nhớ",v:"4 GB"},
      {l:"PLC",v:"Ladder tích hợp"},
      {l:"Encoder",v:"Hồi tiếp tuyệt đối"},
      {l:"Điện áp đầu vào",v:"24VDC, 1.5A"},
    ],
    image:{src:"/img/products/astro-6ah-front.webp", w:900, h:817},
    bundle:[ controller("Astro 6AH"), PART.drive, PART.motor, PART.psu, PART.mpg, PART.io32, PART.toolSetter, PART.probe ] },

  { slug:"astro-6av", name:"Astro 6AV", axes:"6 trục", display:"8\"", series:"Astro",
    tag:"Bộ điều khiển Astro 6AV",
    desc:"Phiên bản bố trí dọc của dòng Astro 6 trục vòng kín, hỗ trợ Pulse Train, EtherCAT và Mechatrolink MII/MIII. Đi kèm trọn bộ servo, board I/O Link 32, tool setter và đầu dò 3D.",
    bullets:[
      "Số trục điều khiển: 6 trục",
      "Kiểu điều khiển: Vòng kín (Closed-loop)",
      "Giao tiếp: Pulse Train · EtherCAT · Mechatrolink MII/MIII",
    ],
    specs:[
      {l:"Số trục điều khiển",v:"6 trục"},
      {l:"Kiểu điều khiển",v:"Vòng kín (Closed-loop)"},
      {l:"Giao thức điều khiển",v:"Pulse Train · EtherCAT · Mechatrolink MII/MIII"},
      {l:"Màn hình",v:"8 inches"},
      {l:"Kích thước",v:"220 × 140 × 30 mm"},
      {l:"Số cổng I/O",v:"16 / 6"},
      {l:"Bộ nhớ",v:"4 GB"},
      {l:"PLC",v:"Ladder tích hợp"},
      {l:"Encoder",v:"Hồi tiếp tuyệt đối"},
      {l:"Điện áp đầu vào",v:"24VDC, 1.5A"},
    ],
    image:{src:"/img/products/astro-6av-front.webp", w:402, h:900},
    bundle:[ controller("Astro 6AV"), PART.drive, PART.motor, PART.psu, PART.mpg, PART.io32, PART.toolSetter, PART.probe ] },

  { slug:"astro-10s", name:"Astro 10S", axes:"16 trục", display:"10.4\"", series:"Astro",
    tag:"Bộ điều khiển Astro 10S",
    desc:"Bộ điều khiển CNC 16 trục dạng vòng hở, hỗ trợ Pulse Train và EtherCAT. Giải pháp điều khiển nhiều trục cho dây chuyền phức tạp, đi kèm servo drive/motor, nguồn và board I/O Link 1616.",
    bullets:[
      "Số trục điều khiển: 16 trục",
      "Kiểu điều khiển: Vòng hở (Open-loop)",
      "Giao tiếp: Pulse Train · EtherCAT",
    ],
    specs:[
      {l:"Số trục điều khiển",v:"16 trục"},
      {l:"Kiểu điều khiển",v:"Vòng hở (Open-loop)"},
      {l:"Giao thức điều khiển",v:"Pulse Train · EtherCAT"},
      {l:"Màn hình",v:"10.4 inches"},
      {l:"Kích thước",v:"220 × 140 × 30 mm"},
      {l:"Số cổng I/O",v:"16 / 6"},
      {l:"Bộ nhớ",v:"4 GB"},
      {l:"PLC",v:"Ladder tích hợp"},
      {l:"Encoder",v:"Hồi tiếp phase Z"},
      {l:"Điện áp đầu vào",v:"24VDC, 1.5A"},
    ],
    image:{src:"/img/products/astro-10s-front.webp", w:900, h:733},
    bundle:[ controller("Astro 10S"), PART.drive, PART.motor, PART.psu, PART.mpg, PART.io1616 ] },

  { slug:"astro-10i", name:"Astro 10i", axes:"6 trục", display:"10.4\"", series:"Astro", badge:"Flagship",
    tag:"Bộ điều khiển Astro 10i",
    desc:"Bộ điều khiển CNC 6 trục vòng kín màn hình lớn, hỗ trợ Pulse Train, EtherCAT và Mechatrolink MII/MIII. Trọn bộ giải pháp cao cấp với servo, board I/O Link 32, tool setter và đầu dò 3D.",
    bullets:[
      "Số trục điều khiển: 6 trục",
      "Kiểu điều khiển: Vòng kín (Closed-loop)",
      "Giao tiếp: Pulse Train · EtherCAT · Mechatrolink MII/MIII",
    ],
    specs:[
      {l:"Số trục điều khiển",v:"6 trục"},
      {l:"Kiểu điều khiển",v:"Vòng kín (Closed-loop)"},
      {l:"Giao thức điều khiển",v:"Pulse Train · EtherCAT · Mechatrolink MII/MIII"},
      {l:"Màn hình",v:"10.4 inches"},
      {l:"Kích thước",v:"220 × 140 × 30 mm"},
      {l:"Số cổng I/O",v:"16 / 6"},
      {l:"Bộ nhớ",v:"4 GB"},
      {l:"PLC",v:"Ladder tích hợp"},
      {l:"Encoder",v:"Hồi tiếp tuyệt đối"},
      {l:"Điện áp đầu vào",v:"24VDC, 1.5A"},
    ],
    image:{src:"/img/products/astro-10i-front.webp", w:459, h:900},
    bundle:[ controller("Astro 10i"), PART.drive, PART.motor, PART.psu, PART.mpg, PART.io32, PART.toolSetter, PART.probe ] },
];
