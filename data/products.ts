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
 * `place` pins where a photo shows:
 *   - "hero" — the single lead image at the top (first hero wins if several)
 *   - "tour" — the "product in detail" grid below
 *   - "hide" — kept in data but not rendered
 * Omit it to let the page decide from the alt text (see classifyShot).
 */
export type GalleryPlace = "hero" | "tour" | "hide";
export type ProductGalleryPhoto = { src: string; w: number; h: number; alt: string; place?: GalleryPlace };

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
export type ProductSpecGroup = { title: string; rows: ProductSpec[] };

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
  /** Legacy QS product-page enrichment, merged here without replacing curated catalogue fields. */
  overview?: string;
  /** English overview, served on the `en` locale (Vietnamese `overview` stays primary). */
  overviewEn?: string;
  highlights?: string[];
  /** English highlights, served on the `en` locale (Vietnamese `highlights` stays primary). */
  highlightsEn?: string[];
  gallery?: ProductGalleryPhoto[];
  documents?: string[];
  software?: string[];
  accessories?: string[];
  sourceUrl?: string;
  detailedSpecs?: ProductSpecGroup[];
  gCodes?: string[];
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

const STANDARD_G_CODES = [
  "G00", "G01", "G02", "G03", "G04", "G17", "G18", "G19", "G20", "G21",
  "G28", "G30", "G31", "G43", "G44", "G49", "G53", "G54", "G55", "G56",
  "G57", "G58", "G59", "G61", "G64", "G65", "G73", "G76", "G80", "G81",
  "G82", "G83", "G84", "G85", "G86", "G87", "G88", "G89", "G90", "G91",
  "G92", "G93", "G94", "G98", "G99",
];

const SHARED_DOCUMENTS = ["Catalog", "Operation Manual"];
const SHARED_SOFTWARE = ["QS Editor", "QS Explorer"];
const SHARED_ACCESSORIES = [
  "Board - I/O Link-32-V1-10722",
  "Board I/O Link RLTR_07_V10723",
  "Board PID-V1-10722",
  "Board-DAC-12FCV1-1222",
];

const fSeriesFunctionRows: ProductSpec[] = [
  { l: "Bù rơ cơ khí (Backlash)", v: "Có" },
  { l: "Bù sai số hành trình (Pitch Error)", v: "Không" },
  { l: "MPG Simulation", v: "Có" },
  { l: "Dry Run", v: "Có" },
  { l: "Optional Stop", v: "Có" },
  { l: "Single Block", v: "Có" },
  { l: "External Offsets", v: "Có" },
  { l: "MPG Offsets", v: "Có" },
];

const astroFunctionRows: ProductSpec[] = [
  { l: "Bù rơ cơ khí (Backlash)", v: "Có" },
  { l: "Bù sai số hành trình (Pitch Error)", v: "Có" },
  { l: "Real-time PLC debug", v: "Có" },
  { l: "Macro programming", v: "Có" },
  { l: "MPG Simulation", v: "Có" },
  { l: "Dry Run", v: "Có" },
  { l: "Optional Stop", v: "Có" },
  { l: "Single Block", v: "Có" },
];

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
    bundle:[ controller("F54"), PART.drive, PART.motor, PART.psu, PART.mpg, PART.ioRLTR ],
    overview:`<p>Bộ điều khiển CNC 4 trục F54 được thiết kế nhỏ gọn nhưng hiệu năng mạnh mẽ, có hồi tiếp encoder phase Z và tích hợp PLC ladder để theo dõi trạng thái máy, lập trình mở rộng ứng dụng. Màn hình 5 inch độ phân giải 480 × 272 px giúp người vận hành dễ theo dõi thông số.</p><p>Giao diện người dùng được thiết kế hiện đại, thân thiện và trực quan. Sản phẩm đã được lắp đặt đồng loạt trên nhiều máy phay CNC, bao gồm hệ máy GS-40 tại nhà máy của khách hàng Hàn Quốc.</p>`,
    highlights:[
      "LCD 5 Inch",
      "4 trục điều khiển đồng thời",
      "Số trục chính điều khiển tối đa: 1",
      "Look-Ahead 250 dòng",
      "Số cổng Input/Output: 16/6",
      "Số cổng I/O mở rộng tối đa: 256/256",
      "Tính năng bù rơ cơ khí (backlash)",
      "Hồi tiếp encoder: Phase Z",
    ],
    overviewEn:`<p>The F54 4-axis CNC controller pairs a compact footprint with strong performance, featuring Z-phase encoder feedback and an integrated PLC ladder for monitoring machine status and extending application logic. The 5-inch, 480 × 272 px display keeps operating parameters easy to read.</p><p>The user interface is modern, friendly and intuitive. The product has been deployed across many CNC milling machines, including the GS-40 line at a Korean customer's factory.</p>`,
    highlightsEn:[
      "5-inch LCD",
      "4 simultaneously controlled axes",
      "Max. spindle axes: 1",
      "Look-Ahead 250 lines",
      "Input/Output ports: 16/6",
      "Max. expanded I/O ports: 256/256",
      "Mechanical backlash compensation",
      "Encoder feedback: Phase Z",
    ],
    gallery: [
      { src: "/img/products/crawled/f54/gallery-1.webp", w: 1339, h: 1015, alt: "Bộ điều khiển CNC 4 trục F54" },
      { src: "/img/products/crawled/f54/gallery-2.webp", w: 1400, h: 1015, alt: "Bộ điều khiển CNC 4 trục F54" },
      { src: "/img/products/crawled/f54/gallery-3.webp", w: 1400, h: 916, alt: "Bộ điều khiển CNC 4 trục F54" },
      { src: "/img/products/crawled/f54/gallery-4.webp", w: 1400, h: 792, alt: "Bộ điều khiển CNC 4 trục F54" },
      { src: "/img/products/crawled/f54/gallery-5.webp", w: 1400, h: 1128, alt: "Bộ điều khiển CNC 4 trục F54" },
      { src: "/img/products/crawled/f54/gallery-6.webp", w: 1400, h: 904, alt: "Bộ điều khiển CNC 4 trục F54" },
      { src: "/img/products/crawled/f54/gallery-7.webp", w: 1400, h: 893, alt: "Mặt sau Bộ điều khiển CNC 4 trục F54" },
      { src: "/img/products/crawled/f54/gallery-8.webp", w: 480, h: 272, alt: "Giao diện vận hành trên Bộ điều khiển CNC 4 trục F54" },
      { src: "/img/products/crawled/f54/gallery-9.webp", w: 480, h: 272, alt: "Giao diện vận hành trên Bộ điều khiển CNC 4 trục F54" },
      { src: "/img/products/crawled/f54/gallery-10.webp", w: 480, h: 272, alt: "Bộ điều khiển CNC 4 trục F54" },
      { src: "/img/products/crawled/f54/gallery-11.webp", w: 1400, h: 2473, alt: "Bộ điều khiển CNC 4 trục F54" },
      { src: "/img/products/crawled/f54/gallery-12.webp", w: 960, h: 720, alt: "Ứng dụng thực tế Bộ điều khiển CNC 4 trục F54 trên máy CNC" },
      { src: "/img/products/crawled/f54/gallery-13.webp", w: 1400, h: 1867, alt: "Ứng dụng thực tế Bộ điều khiển CNC 4 trục F54 trên máy CNC" },
      { src: "/img/products/crawled/f54/gallery-14.webp", w: 1400, h: 1867, alt: "Ứng dụng thực tế Bộ điều khiển CNC 4 trục F54 trên máy CNC" },
    ],
    documents: SHARED_DOCUMENTS,
    software: SHARED_SOFTWARE,
    accessories: ["4 Axis MPG Handwheel", ...SHARED_ACCESSORIES],
    sourceUrl: "https://qstcnc.com/san-pham/f54-controller",
    detailedSpecs:[
      { title:"Đặc tính kỹ thuật", rows:[
        {l:"Kích thước",v:"220 × 140 × 30 mm"},
        {l:"Vật liệu vỏ",v:"Aluminum"},
        {l:"Max. PLC Axis",v:"0"},
        {l:"Standard Axis",v:"4"},
        {l:"Max. Axis Optional",v:"4"},
        {l:"Max. Spindle",v:"1"},
        {l:"Max Spindle Simultaneous Axis Control",v:"4"},
        {l:"Min. Control Unit",v:"0.0001"},
        {l:"Max. Number Of Program Coordinate",v:"18"},
        {l:"Max. Number of Table Tools",v:"40"},
        {l:"Look-Ahead",v:"250"},
        {l:"Block Processing Time",v:"250"},
      ]},
      { title:"Phần cứng", rows:[
        {l:"Standard I/O",v:"16/6"},
        {l:"Optional I/O",v:"256/256"},
        {l:"DA",v:"1"},
        {l:"Monitor",v:"5 Inch"},
        {l:"RS485",v:"1"},
        {l:"USB",v:"1"},
      ]},
      { title:"Chức năng", rows:fSeriesFunctionRows },
    ],
    gCodes: STANDARD_G_CODES },

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
    bundle:[ controller("F86"), PART.drive, PART.motor, PART.psu, PART.mpg, PART.toolSetter, PART.io1616 ],
    overview:`<p>Bộ điều khiển CNC F86 thuộc dòng sản phẩm mới của QS Technology với thiết kế kích thước lớn hơn và màn hình 8 inch độ phân giải 800 × 600 px, giúp vận hành và theo dõi thông tin máy trực quan hơn.</p><p>F86 cho phép điều khiển từ 4 đến 6 trục đồng thời, có hồi tiếp Encoder phase Z để về home chính xác hơn. Bộ điều khiển tích hợp module xử lý PLC ladder, hỗ trợ theo dõi trạng thái hoạt động, lập trình mở rộng chức năng máy và lập trình Macro.</p>`,
    highlights:[
      "LCD 8 Inches",
      "6 trục điều khiển đồng thời",
      "Số trục chính điều khiển tối đa: 2",
      "Look-Ahead 250 lines",
      "Số cổng Input/Output: 24/16",
      "Số cổng I/O mở rộng tối đa: 256/256",
      "Tính năng bù rơ cơ khí (backlash)",
      "Hồi tiếp encoder: Phase Z",
      "Tích hợp module xử lý PLC ladder",
      "Cho phép lập trình Macro",
    ],
    overviewEn:`<p>The F86 CNC controller is part of QS Technology's newer line, with a larger body and an 8-inch, 800 × 600 px display for clearer operation and machine monitoring.</p><p>The F86 controls 4 to 6 axes simultaneously and adds Z-phase encoder feedback for more accurate homing. It integrates a PLC ladder processing module, supporting status monitoring, extended machine functions and Macro programming.</p>`,
    highlightsEn:[
      "8-inch LCD",
      "6 simultaneously controlled axes",
      "Max. spindle axes: 2",
      "Look-Ahead 250 lines",
      "Input/Output ports: 24/16",
      "Max. expanded I/O ports: 256/256",
      "Mechanical backlash compensation",
      "Encoder feedback: Phase Z",
      "Integrated PLC ladder processing module",
      "Macro programming support",
    ],
    gallery: [
      { src: "/img/products/crawled/f86/gallery-1.webp", w: 1280, h: 970, alt: "Bộ điều khiển CNC 6 trục F86" },
      { src: "/img/products/crawled/f86/gallery-2.webp", w: 1400, h: 1297, alt: "Giao diện vận hành trên Bộ điều khiển CNC 6 trục F86" },
      { src: "/img/products/crawled/f86/gallery-3.webp", w: 1400, h: 929, alt: "Sơ đồ kết nối thiết bị ngoại vi cho Bộ điều khiển CNC 6 trục F86" },
      { src: "/img/products/crawled/f86/gallery-4.webp", w: 1400, h: 788, alt: "Ứng dụng thực tế Bộ điều khiển CNC 6 trục F86 trên máy CNC" },
      { src: "/img/products/crawled/f86/gallery-6.webp", w: 1400, h: 1007, alt: "Mặt sau Bộ điều khiển CNC 6 trục F86" },
      { src: "/img/products/crawled/f86/gallery-7.webp", w: 1400, h: 1050, alt: "Ứng dụng thực tế Bộ điều khiển CNC 6 trục F86 trên máy CNC" },
      { src: "/img/products/crawled/f86/gallery-8.webp", w: 1400, h: 1050, alt: "Ứng dụng thực tế Bộ điều khiển CNC 6 trục F86 trên máy CNC" },
      { src: "/img/products/crawled/f86/gallery-9.webp", w: 960, h: 720, alt: "Ứng dụng thực tế Bộ điều khiển CNC 6 trục F86 trên máy CNC" },
      { src: "/img/products/crawled/f86/gallery-10.webp", w: 1400, h: 1050, alt: "Ứng dụng thực tế Bộ điều khiển CNC 6 trục F86 trên máy CNC" },
    ],
    documents: SHARED_DOCUMENTS,
    software: SHARED_SOFTWARE,
    accessories: SHARED_ACCESSORIES,
    sourceUrl: "https://qstcnc.com/san-pham/bo-dieu-khien-cnc-6-truc-f86",
    detailedSpecs:[
      { title:"Đặc tính kỹ thuật", rows:[
        {l:"Kích thước",v:"320 × 185 × 30 mm"},
        {l:"Vật liệu vỏ",v:"Aluminum Anodizing"},
        {l:"Max. PLC Axis",v:"6"},
        {l:"Standard Axis",v:"6"},
        {l:"Max. Axis Optional",v:"6"},
        {l:"Max. Spindle",v:"2"},
        {l:"Max Spindle Simultaneous Axis Control",v:"6"},
        {l:"Min. Control Unit",v:"0.0001"},
        {l:"Max. Number Of Program Coordinate",v:"18"},
        {l:"Max. Number of Table Tools",v:"40"},
        {l:"Look-Ahead",v:"250"},
        {l:"Block Processing Time",v:"250"},
      ]},
      { title:"Phần cứng", rows:[
        {l:"Standard I/O",v:"24/16"},
        {l:"Optional I/O",v:"256/256"},
        {l:"DA",v:"1"},
        {l:"Monitor",v:"8 Inches"},
        {l:"RS485",v:"1"},
        {l:"USB",v:"1"},
      ]},
      { title:"Chức năng", rows:fSeriesFunctionRows },
    ],
    gCodes: STANDARD_G_CODES },

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
    bundle:[ controller("F10T"), PART.drive, PART.motor, PART.psu, PART.mpg, PART.toolSetter, PART.io1616 ],
    overview:`<p>Bộ điều khiển F10T là dòng bộ điều khiển CNC sử dụng màn hình cảm ứng điện dung, cho phép điều khiển từ 4 đến 6 trục. Màn hình 10.4 inch độ phân giải 800 × 600, độ chống nhiễu tín hiệu cao.</p><p>F10T tích hợp PLC ladder để người dùng theo dõi trạng thái hoạt động của máy và mở rộng thêm ứng dụng khi cần thiết.</p>`,
    highlights:[
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
    overviewEn:`<p>The F10T is a CNC controller with a capacitive touchscreen, controlling 4 to 6 axes. Its 10.4-inch, 800 × 600 display offers high signal-noise immunity.</p><p>The F10T integrates a PLC ladder so users can monitor machine status and add further applications as needed.</p>`,
    highlightsEn:[
      "10.4-inch LCD",
      "6 simultaneously controlled axes",
      "Simultaneous spindle axes: 1",
      "Input/Output ports: 24/16",
      "Max. expanded I/O ports: 256/256",
      "Real-time PLC debug",
      "Look-Ahead 250 lines",
      "Mechanical backlash compensation",
      "Encoder feedback: Phase Z",
    ],
    gallery: [
      { src: "/img/products/crawled/f10t/gallery-1.webp", w: 1339, h: 1015, alt: "Bộ điều khiển CNC 6 trục F10T (Touch)" },
      { src: "/img/products/crawled/f10t/gallery-2.webp", w: 1400, h: 1151, alt: "Mặt bên Bộ điều khiển CNC 6 trục F10T (Touch)" },
      { src: "/img/products/crawled/f10t/gallery-3.webp", w: 1400, h: 916, alt: "Sơ đồ kết nối thiết bị ngoại vi cho Bộ điều khiển CNC 6 trục F10T (Touch)" },
      { src: "/img/products/crawled/f10t/gallery-4.webp", w: 1400, h: 824, alt: "Sơ đồ kết nối thiết bị ngoại vi cho Bộ điều khiển CNC 6 trục F10T (Touch)" },
    ],
    documents: SHARED_DOCUMENTS,
    software: SHARED_SOFTWARE,
    accessories: SHARED_ACCESSORIES,
    sourceUrl: "https://qstcnc.com/san-pham/astro-series-10t",
    detailedSpecs:[
      { title:"Đặc tính kỹ thuật", rows:[
        {l:"Kích thước",v:"254 × 210 × 40 mm"},
        {l:"Vật liệu vỏ",v:"Aluminum"},
        {l:"Max. PLC Axis",v:"6"},
        {l:"Standard Axis",v:"6"},
        {l:"Max. Axis Optional",v:"6"},
        {l:"Max. Spindle",v:"2"},
        {l:"Max Spindle Simultaneous Axis Control",v:"6"},
        {l:"Min. Control Unit",v:"0.0001"},
        {l:"Max. Number Of Program Coordinate",v:"18"},
        {l:"Max. Number of Table Tools",v:"40"},
        {l:"Look-Ahead",v:"250"},
        {l:"Block Processing Time",v:"250"},
      ]},
      { title:"Phần cứng", rows:[
        {l:"Standard I/O",v:"24/16"},
        {l:"Optional I/O",v:"256/256"},
        {l:"DA",v:"1"},
        {l:"Monitor",v:"10.4 Inch (Touch)"},
        {l:"RS485",v:"1"},
        {l:"USB",v:"1"},
      ]},
      { title:"Chức năng", rows:fSeriesFunctionRows },
    ],
    gCodes: STANDARD_G_CODES },

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
    bundle:[ controller("Astro 6AH"), PART.drive, PART.motor, PART.psu, PART.mpg, PART.io32, PART.toolSetter, PART.probe ],
    overview:`<p>Bộ điều khiển CNC thuộc series Astro là dòng sản phẩm cao cấp của QS Technology, có hồi tiếp encoder tất cả các trục, tích hợp PLC và hỗ trợ lập trình Macro. Bảng điều khiển nhiều chức năng, chia thành hai phần và có nút dừng khẩn cấp.</p><p>Kiểu dáng Astro 6AH phù hợp với hầu hết dạng máy CNC. Khả năng thu thập tín hiệu hồi tiếp từ encoder giúp vận hành an toàn, chính xác; tốc độ nội suy đồng thời vượt trội hơn các dòng F54, F86.</p>`,
    highlights:[
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
    overviewEn:`<p>The Astro series is QS Technology's premium line, with encoder feedback on every axis, an integrated PLC and Macro programming support. The multi-function control panel is split into two sections and includes an emergency stop.</p><p>The Astro 6AH form factor suits most CNC machine types. Encoder feedback enables safe, precise operation, with simultaneous interpolation speed well above the F54 and F86 lines.</p>`,
    highlightsEn:[
      "8-inch LCD",
      "6 simultaneously controlled axes",
      "Simultaneous spindle axes: 2",
      "Input/Output ports: 24/16",
      "Max. expanded I/O ports: 256/256",
      "Real-time PLC debug",
      "Look-Ahead 500 lines",
      "Mechanical backlash compensation",
      "Pitch error compensation",
      "Encoder feedback: all axes",
    ],
    gallery: [
      { src: "/img/products/crawled/astro-6ah/gallery-1.webp", w: 1338, h: 1015, alt: "Bộ điều khiển CNC 6 trục Astro-6A (H)" },
      { src: "/img/products/crawled/astro-6ah/gallery-2.webp", w: 1400, h: 1650, alt: "Bộ điều khiển CNC 6 trục Astro-6A (H)" },
      { src: "/img/products/crawled/astro-6ah/gallery-3.webp", w: 1400, h: 2473, alt: "Ứng dụng thực tế Bộ điều khiển CNC 6 trục Astro-6A (H) trên máy CNC" },
      { src: "/img/products/crawled/astro-6ah/gallery-4.webp", w: 1400, h: 929, alt: "Sơ đồ kết nối thiết bị ngoại vi cho Bộ điều khiển CNC 6 trục Astro-6A (H)" },
      { src: "/img/products/crawled/astro-6ah/gallery-5.webp", w: 1400, h: 792, alt: "Bộ điều khiển CNC 6 trục Astro-6A (H)" },
      { src: "/img/products/crawled/astro-6ah/gallery-6.webp", w: 1400, h: 792, alt: "Bộ điều khiển CNC 6 trục Astro-6A (H)" },
      { src: "/img/products/crawled/astro-6ah/gallery-7.webp", w: 1400, h: 826, alt: "Bộ điều khiển CNC 6 trục Astro-6A (H)" },
    ],
    documents: SHARED_DOCUMENTS,
    software: SHARED_SOFTWARE,
    accessories: SHARED_ACCESSORIES,
    sourceUrl: "https://qstcnc.com/san-pham/astro-series-6ah",
    detailedSpecs:[
      { title:"Đặc tính kỹ thuật", rows:[
        {l:"Kích thước",v:"325 × 295 × 42 mm"},
        {l:"Vật liệu vỏ",v:"Aluminum"},
        {l:"Max. PLC Axis",v:"6"},
        {l:"Standard Axis",v:"6"},
        {l:"Max. Axis Optional",v:"6"},
        {l:"Max. Spindle",v:"2"},
        {l:"Max Spindle Simultaneous Axis Control",v:"6"},
        {l:"Min. Control Unit",v:"0.0001"},
        {l:"Max. Number Of Program Coordinate",v:"18"},
        {l:"Max. Number of Table Tools",v:"40"},
        {l:"Look-Ahead",v:"500"},
        {l:"Block Processing Time",v:"500"},
      ]},
      { title:"Phần cứng", rows:[
        {l:"Standard I/O",v:"24/16"},
        {l:"Optional I/O",v:"256/256"},
        {l:"DA",v:"2"},
        {l:"Monitor",v:"8 Inch"},
        {l:"RS485",v:"1"},
        {l:"USB",v:"1"},
      ]},
      { title:"Chức năng", rows:astroFunctionRows },
    ],
    gCodes: STANDARD_G_CODES },

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
    bundle:[ controller("Astro 6AV"), PART.drive, PART.motor, PART.psu, PART.mpg, PART.io32, PART.toolSetter, PART.probe ],
    overview:`<p>Bộ điều khiển CNC series Astro là dòng cao cấp của QS Technology với đầy đủ tính năng, hiệu năng mạnh mẽ, điều khiển vòng kín và tích hợp FPGA. Astro-6AV là phiên bản dọc của Astro-6AH, có bàn phím chức năng mở rộng và tích hợp tay quay MPG.</p><p>Màn hình 8 inch độ phân giải 800 × 600 giúp người vận hành theo dõi thông số rõ ràng, chi tiết.</p>`,
    highlights:[
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
    overviewEn:`<p>The Astro series is QS Technology's premium line — fully featured, high-performance, closed-loop control with an integrated FPGA. The Astro-6AV is the vertical version of the Astro-6AH, with an extended function keypad and a built-in MPG handwheel.</p><p>The 8-inch, 800 × 600 display lets operators track parameters clearly and in detail.</p>`,
    highlightsEn:[
      "8-inch LCD",
      "6 simultaneously controlled axes",
      "Simultaneous spindle axes: 2",
      "Input/Output ports: 24/16",
      "Max. expanded I/O ports: 256/256",
      "Real-time PLC debug",
      "Look-Ahead 500 lines",
      "Mechanical backlash compensation",
      "Pitch error compensation",
      "Encoder feedback: all axes",
    ],
    gallery: [
      { src: "/img/products/crawled/astro-6av/gallery-1.webp", w: 1339, h: 2227, alt: "Bộ điều khiển CNC 6 trục Astro-6A (V)" },
      { src: "/img/products/crawled/astro-6av/gallery-2.webp", w: 1400, h: 2473, alt: "Bộ điều khiển CNC 6 trục Astro-6A (V)" },
      { src: "/img/products/crawled/astro-6av/gallery-3.webp", w: 1400, h: 1394, alt: "Sơ đồ kết nối thiết bị ngoại vi cho Bộ điều khiển CNC 6 trục Astro-6A (V)" },
      { src: "/img/products/crawled/astro-6av/gallery-4.webp", w: 1400, h: 2473, alt: "Bộ điều khiển CNC 6 trục Astro-6A (V)" },
      { src: "/img/products/crawled/astro-6av/gallery-5.webp", w: 1400, h: 788, alt: "Bộ điều khiển CNC 6 trục Astro-6A (V)" },
    ],
    documents: SHARED_DOCUMENTS,
    software: SHARED_SOFTWARE,
    accessories: SHARED_ACCESSORIES,
    sourceUrl: "https://qstcnc.com/san-pham/astro-series-6av",
    detailedSpecs:[
      { title:"Đặc tính kỹ thuật", rows:[
        {l:"Kích thước",v:"460 × 220 × 70 mm"},
        {l:"Vật liệu vỏ",v:"Aluminum"},
        {l:"Max. PLC Axis",v:"6"},
        {l:"Standard Axis",v:"6"},
        {l:"Max. Axis Optional",v:"6"},
        {l:"Max. Spindle",v:"2"},
        {l:"Max Spindle Simultaneous Axis Control",v:"6"},
        {l:"Min. Control Unit",v:"0.0001"},
        {l:"Max. Number Of Program Coordinate",v:"18"},
        {l:"Max. Number of Table Tools",v:"40"},
        {l:"Look-Ahead",v:"500"},
        {l:"Block Processing Time",v:"500"},
      ]},
      { title:"Phần cứng", rows:[
        {l:"Standard I/O",v:"24/16"},
        {l:"Optional I/O",v:"256/256"},
        {l:"DA",v:"2"},
        {l:"Monitor",v:"8 Inch"},
        {l:"RS485",v:"1"},
        {l:"USB",v:"1"},
      ]},
      { title:"Chức năng", rows:astroFunctionRows },
    ],
    gCodes: STANDARD_G_CODES },

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
    bundle:[ controller("Astro 10i"), PART.drive, PART.motor, PART.psu, PART.mpg, PART.io32, PART.toolSetter, PART.probe ],
    overview:`<p>Bộ điều khiển CNC Astro 10i là dòng sản phẩm cao cấp nhất của QS Technology, với đầy đủ tính năng, hiệu năng mạnh mẽ, điều khiển vòng kín và tích hợp FPGA để mang lại trải nghiệm vận hành tốt nhất.</p><p>Astro 10i là phiên bản nâng cấp từ Astro 6AV và Astro-6AH, có bàn phím chức năng mở rộng, tích hợp thêm công tắc và nút dừng khẩn cấp. Màn hình 10.4 inch độ phân giải 800 × 600 giúp theo dõi thông số rõ ràng, chi tiết.</p>`,
    highlights:[
      "LCD 10.4 Inch",
      "6 trục điều khiển đồng thời",
      "Số trục chính điều khiển đồng thời: 2",
      "Số cổng Input/Output: 24/16",
      "Số cổng I/O mở rộng tối đa: 256/256",
      "Real-time PLC debug",
      "Look-Ahead 1000 dòng",
      "Tính năng bù rơ cơ khí (backlash)",
      "Tính năng bù sai số hành trình (pitch error)",
      "Hồi tiếp Encoder: Tất cả các trục",
    ],
    overviewEn:`<p>The Astro 10i is QS Technology's top-of-the-range controller — fully featured, high-performance, closed-loop control with an integrated FPGA for the best operating experience.</p><p>The Astro 10i is an upgrade of the Astro 6AV and Astro-6AH, with an extended function keypad and added switches and emergency stop. The 10.4-inch, 800 × 600 display keeps parameters clear and detailed.</p>`,
    highlightsEn:[
      "10.4-inch LCD",
      "6 simultaneously controlled axes",
      "Simultaneous spindle axes: 2",
      "Input/Output ports: 24/16",
      "Max. expanded I/O ports: 256/256",
      "Real-time PLC debug",
      "Look-Ahead 1000 lines",
      "Mechanical backlash compensation",
      "Pitch error compensation",
      "Encoder feedback: all axes",
    ],
    gallery: [
      { src: "/img/products/crawled/astro-10i/gallery-1.webp", w: 1339, h: 2227, alt: "Bộ điều khiển CNC 6 trục Astro 10i" },
      { src: "/img/products/crawled/astro-10i/gallery-3.webp", w: 1400, h: 2609, alt: "Bộ điều khiển CNC 6 trục Astro 10i" },
      { src: "/img/products/crawled/astro-10i/gallery-4.webp", w: 1400, h: 1387, alt: "Sơ đồ kết nối thiết bị ngoại vi cho Bộ điều khiển CNC 6 trục Astro 10i" },
    ],
    documents: SHARED_DOCUMENTS,
    software: SHARED_SOFTWARE,
    accessories: SHARED_ACCESSORIES,
    sourceUrl: "https://qstcnc.com/san-pham/bo-dieu-khien-cnc-6-truc-astro-10i",
    detailedSpecs:[
      { title:"Đặc tính kỹ thuật", rows:[
        {l:"Kích thước",v:"254 × 515 × 42 mm"},
        {l:"Vật liệu vỏ",v:"Aluminum"},
        {l:"Max. PLC Axis",v:"6"},
        {l:"Standard Axis",v:"6"},
        {l:"Max. Axis Optional",v:"6"},
        {l:"Max. Spindle",v:"2"},
        {l:"Max Spindle Simultaneous Axis Control",v:"6"},
        {l:"Min. Control Unit",v:"0.0001"},
        {l:"Max. Number Of Program Coordinate",v:"18"},
        {l:"Max. Number of Table Tools",v:"40"},
        {l:"Look-Ahead",v:"1000"},
        {l:"Block Processing Time",v:"1000"},
      ]},
      { title:"Phần cứng", rows:[
        {l:"Standard I/O",v:"24/16"},
        {l:"Optional I/O",v:"256/256"},
        {l:"DA",v:"2"},
        {l:"Monitor",v:"10.4 Inch"},
        {l:"RS485",v:"1"},
        {l:"USB",v:"1"},
      ]},
      { title:"Chức năng", rows:astroFunctionRows },
    ],
    gCodes: STANDARD_G_CODES },
];
