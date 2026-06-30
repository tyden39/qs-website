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

/** A control-interface column in the spec table (catalogue order). */
export type SpecColumn = { name: string; note?: string };

/**
 * A spec row. `v` is either a single value spanning every interface column, or
 * one value per interface column (array length must equal `interfaces.length`).
 */
export type ProductSpec = { l: string; v: string | string[] };

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
  /** English copy, served on the `en` locale (Vietnamese fields stay primary). */
  tagEn: string;
  descEn: string;
  bulletsEn: string[];
  /** Control-interface columns the spec table is split into. */
  interfaces: SpecColumn[];
  specs: ProductSpec[];
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
    tagEn:"F54 CNC Controller",
    descEn:"4-axis open-loop CNC controller with Pulse Train interface. Compact design for entry-level CNC machines, shipped as a complete kit with servo drive, servo motor, power supply and I/O Link board.",
    bulletsEn:[
      "Control axes: 4 axes",
      "Control mode: Open-loop",
      "Interface: Pulse Train",
    ],
    interfaces:[ {name:"Pulse Train", note:"Standard"} ],
    specs:[
      {l:"Control axes",v:"4 axes"},
      {l:"Dimensions",v:"220 × 140 × 30 mm"},
      {l:"Display",v:"5 inches"},
      {l:"I/O ports",v:"16 / 6"},
      {l:"PLC",v:"Integrated Ladder"},
      {l:"Encoder",v:"Index feedback"},
      {l:"Input voltage",v:"24VDC, 1.5A"},
      {l:"Control mode",v:"Open loop"},
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
    tagEn:"F86 CNC Controller",
    descEn:"6-axis open-loop CNC controller supporting Pulse Train and EtherCAT. Suited to multi-axis milling machines, shipped with a full servo set, tool setter and I/O Link 1616 board.",
    bulletsEn:[
      "Control axes: 6 axes",
      "Control mode: Open-loop",
      "Interface: Pulse Train · EtherCAT",
    ],
    interfaces:[ {name:"Pulse Train", note:"Standard"}, {name:"EtherCAT", note:"Optional"} ],
    specs:[
      {l:"Control axes",v:"6 axes"},
      {l:"Dimensions",v:"326 × 185 × 30 mm"},
      {l:"Display",v:"8 inches"},
      {l:"I/O ports",v:["24 / 16","16 / 16"]},
      {l:"PLC",v:"Integrated Ladder"},
      {l:"Encoder",v:["Index feedback","All axes"]},
      {l:"Input voltage",v:"24VDC, 1.5A"},
      {l:"Control mode",v:"Open loop"},
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
    tagEn:"F10T CNC Controller",
    descEn:"6-axis open-loop CNC controller with a large display, supporting Pulse Train and EtherCAT. Complete solution including servo drive/motor, tool setter and I/O Link 1616 board.",
    bulletsEn:[
      "Control axes: 6 axes",
      "Control mode: Open-loop",
      "Interface: Pulse Train · EtherCAT",
    ],
    interfaces:[ {name:"Pulse Train", note:"Standard"}, {name:"EtherCAT", note:"Optional"} ],
    specs:[
      {l:"Control axes",v:"6 axes"},
      {l:"Dimensions",v:"254 × 195 × 40 mm"},
      {l:"Display",v:"10.4 inches (touch screen)"},
      {l:"I/O ports",v:["24 / 16","16 / 16"]},
      {l:"PLC",v:"Integrated Ladder"},
      {l:"Encoder",v:["Index feedback","All axes"]},
      {l:"Input voltage",v:"24VDC, 1.5A"},
      {l:"Control mode",v:"Open loop"},
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
    tagEn:"Astro 6AH Controller",
    descEn:"6-axis closed-loop CNC controller supporting Pulse Train, EtherCAT and Mechatrolink MII/MIII. A full automation solution with servo, I/O Link 32 board, tool setter and 3D touch probe.",
    bulletsEn:[
      "Control axes: 6 axes",
      "Control mode: Closed-loop",
      "Interface: Pulse Train · EtherCAT · Mechatrolink MII/MIII",
    ],
    interfaces:[ {name:"Pulse Train", note:"Standard"}, {name:"EtherCAT", note:"Optional"}, {name:"Mechatrolink MII/MIII", note:"Optional"} ],
    specs:[
      {l:"Control axes",v:"6 axes"},
      {l:"Dimensions",v:"325 × 285 × 42 mm"},
      {l:"Display",v:"8 inches"},
      {l:"I/O ports",v:["24 / 16","16 / 16","16 / 16"]},
      {l:"PLC",v:"Integrated Ladder"},
      {l:"Encoder",v:"All axes"},
      {l:"Input voltage",v:"24VDC, 1.5A"},
      {l:"Control mode",v:"Closed loop"},
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
    tagEn:"Astro 6AV Controller",
    descEn:"Vertical-layout version of the closed-loop 6-axis Astro line, supporting Pulse Train, EtherCAT and Mechatrolink MII/MIII. Shipped with a full servo set, I/O Link 32 board, tool setter and 3D touch probe.",
    bulletsEn:[
      "Control axes: 6 axes",
      "Control mode: Closed-loop",
      "Interface: Pulse Train · EtherCAT · Mechatrolink MII/MIII",
    ],
    interfaces:[ {name:"Pulse Train", note:"Standard"}, {name:"EtherCAT", note:"Optional"}, {name:"Mechatrolink MII/MIII", note:"Optional"} ],
    specs:[
      {l:"Control axes",v:"6 axes"},
      {l:"Dimensions",v:"220 × 460 × 42 mm"},
      {l:"Display",v:"8 inches"},
      {l:"I/O ports",v:["24 / 16","16 / 16","16 / 16"]},
      {l:"PLC",v:"Integrated Ladder"},
      {l:"Encoder",v:"All axes"},
      {l:"Input voltage",v:"24VDC, 1.5A"},
      {l:"Control mode",v:"Closed loop"},
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
    tagEn:"Astro 10S Controller",
    descEn:"16-axis open-loop CNC controller supporting Pulse Train and EtherCAT. A multi-axis control solution for complex production lines, shipped with servo drive/motor, power supply and I/O Link 1616 board.",
    bulletsEn:[
      "Control axes: 16 axes",
      "Control mode: Open-loop",
      "Interface: Pulse Train · EtherCAT",
    ],
    interfaces:[ {name:"Pulse Train", note:"Standard"}, {name:"EtherCAT", note:"Optional"} ],
    specs:[
      {l:"Control axes",v:"16 axes"},
      {l:"Dimensions",v:"254 × 210 × 40 mm"},
      {l:"Display",v:"10.4 inches (touch screen)"},
      {l:"I/O ports",v:["16 / 16","16 / 16"]},
      {l:"PLC",v:"Integrated Ladder"},
      {l:"Encoder",v:["Index feedback","All axes"]},
      {l:"Input voltage",v:"24VDC, 1.5A"},
      {l:"Control mode",v:"Open loop"},
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
    tagEn:"Astro 10i Controller",
    descEn:"Large-display 6-axis closed-loop CNC controller supporting Pulse Train, EtherCAT and Mechatrolink MII/MIII. A premium complete solution with servo, I/O Link 32 board, tool setter and 3D touch probe.",
    bulletsEn:[
      "Control axes: 6 axes",
      "Control mode: Closed-loop",
      "Interface: Pulse Train · EtherCAT · Mechatrolink MII/MIII",
    ],
    interfaces:[ {name:"Pulse Train", note:"Standard"}, {name:"EtherCAT", note:"Optional"}, {name:"Mechatrolink MII/MIII", note:"Optional"} ],
    specs:[
      {l:"Control axes",v:"6 axes"},
      {l:"Dimensions",v:"254 × 485 × 42 mm"},
      {l:"Display",v:"10.4 inches"},
      {l:"I/O ports",v:["24 / 16","16 / 16","16 / 16"]},
      {l:"PLC",v:"Integrated Ladder"},
      {l:"Encoder",v:"All axes"},
      {l:"Input voltage",v:"24VDC, 1.5A"},
      {l:"Control mode",v:"Closed loop"},
    ],
    image:{src:"/img/products/astro-10i-front.webp", w:459, h:900},
    bundle:[ controller("Astro 10i"), PART.drive, PART.motor, PART.psu, PART.mpg, PART.io32, PART.toolSetter, PART.probe ] },
];
