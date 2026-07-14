/**
 * CNC machine catalogue (MACHINE MANUFACTURING line). Sourced from the QS
 * company profile and the QSM-125 datasheet. Language-neutral fields (model
 * codes, images, numeric specs) live here directly; prose that must be
 * localized (`tagline`, feature `title`/`desc`) carries a `vi` primary plus an
 * optional `en` override, mirroring `data/products.ts`.
 *
 * Spec rows reference a label key (`k`) resolved from the `cnc.machines.labels`
 * i18n dictionary so the same row renders in both languages; `v` is the neutral
 * value with unseparated integers (e.g. "24000 rpm") — the view layer groups
 * thousands per locale (vi: 24.000, en: 24,000).
 */

export type MachineCategory = "milling" | "router" | "jewelry";

export type MachinePhoto = { src: string; w: number; h: number };

/** A spec row: `k` is an i18n label key, `v` the neutral value string. */
export type MachineSpec = { k: string; v: string };

/** A callout box (the highlighted feature blocks on the datasheet pages). */
export type MachineFeature = { title: string; titleEn?: string; desc: string; descEn?: string };

export type Machine = {
  slug: string;
  model: string;
  category: MachineCategory;
  axes: number;
  /** Controller name as printed on the datasheet, e.g. "QS Astro 10i". */
  controller: string;
  /** Slug of the matching controller in the products catalogue, if any. */
  controllerSlug?: string;
  /** Short positioning line — vi primary, en override. */
  tagline: string;
  taglineEn?: string;
  image: MachinePhoto;
  /** Ordered spec rows; the machine list panel shows the first `HIGHLIGHT_COUNT`. */
  specs: MachineSpec[];
  /** Datasheet callout boxes shown on the detail page. */
  features: MachineFeature[];
};

/** How many leading spec rows surface in the list panel / card preview. */
export const HIGHLIGHT_COUNT = 6;

const IMG = (slug: string): MachinePhoto => ({ src: `/img/machines/${slug}.webp`, w: 1000, h: 800 });

export const machines: Machine[] = [
  {
    slug: "qsm-125",
    model: "QSM-125",
    category: "milling",
    axes: 3,
    controller: "QS Astro 6AVE (EtherCAT)",
    controllerSlug: "astro-6av",
    tagline: "Máy phay CNC 3 trục hiệu suất cao, khung đúc nguyên khối và ray trượt tuyến tính cho gia công cơ khí chính xác.",
    taglineEn: "High-performance 3-axis CNC milling machine with a monolithic cast frame and linear guideways for precision machining.",
    image: IMG("qsm125"),
    specs: [
      { k: "axes", v: "3" },
      { k: "spindleSpeed", v: "24000 rpm" },
      { k: "spindlePower", v: "2.2 kW" },
      { k: "machineTravel", v: "250 × 150 × 300 mm" },
      { k: "toolMagazine", v: "12 · ISO20" },
      { k: "controller", v: "QS Astro 6AVE (EtherCAT)" },
      { k: "rapidSpeed", v: "30000 mm/min" },
      { k: "feedSpeed", v: "15000 mm/min" },
      { k: "positioning", v: "±0.01 / 100 mm" },
      { k: "repeatability", v: "0.01 / 100 mm" },
      { k: "resolution", v: "0.001 mm" },
      { k: "machineSize", v: "950 × 1200 × 1200 mm" },
      { k: "tableLoad", v: "50 kg" },
      { k: "weight", v: "300 kg" },
      { k: "powerSupply", v: "AC 1 pha 220 V" },
      { k: "airPressure", v: "0.6 – 0.8 MPa" },
    ],
    features: [
      { title: "Đúc nguyên khối", titleEn: "Monolithic casting", desc: "Tăng độ cứng vững, giảm rung lắc khi gia công.", descEn: "Higher rigidity and less vibration during machining." },
      { title: "Ray trượt tuyến tính", titleEn: "Linear guideways", desc: "Chuyển động êm ái, độ chính xác cao và tuổi thọ cao.", descEn: "Smooth motion with high accuracy and long service life." },
      { title: "Hệ thống bôi trơn", titleEn: "Lubrication system", desc: "Giảm ma sát, tăng tuổi thọ các cơ cấu truyền động.", descEn: "Reduces friction and extends the life of the drive train." },
      { title: "Độ chính xác", titleEn: "Accuracy", desc: "Đảm bảo chất lượng gia công ổn định và đồng đều.", descEn: "Ensures stable and consistent machining quality." },
    ],
  },
  {
    slug: "vmc-300",
    model: "VMC-300",
    category: "milling",
    axes: 3,
    controller: "QS Astro 6AHE",
    controllerSlug: "astro-6ah",
    tagline: "Máy phay CNC 3 trục thiết kế và chế tạo với độ chính xác cao, đáp ứng hiệu quả các nhu cầu gia công cơ khí hiện đại.",
    taglineEn: "A 3-axis CNC milling machine designed and built to high precision, efficiently meeting the demands of modern machining.",
    image: IMG("vmc"),
    specs: [
      { k: "axes", v: "3" },
      { k: "spindleSpeed", v: "12000 rpm" },
      { k: "spindlePower", v: "8.7 kW" },
      { k: "machineTravel", v: "300 × 300 × 300 mm" },
      { k: "collet", v: "ER32" },
      { k: "controller", v: "QS Astro 6AHE" },
    ],
    features: [
      { title: "Trục chính", titleEn: "Spindle", desc: "Tốc độ 12.000 rpm, đầu kẹp ER32 cho gia công cơ khí đa dạng.", descEn: "12,000 rpm with an ER32 collet for versatile machining." },
      { title: "Bộ điều khiển", titleEn: "Controller", desc: "QS Astro 6AHE — đồng bộ cơ khí, điện và phần mềm.", descEn: "QS Astro 6AHE — machine, electrics and software in sync." },
      { title: "3D Touch Probe", titleEn: "3D touch probe", desc: "Dò và thiết lập gốc phôi tự động, tăng độ chính xác.", descEn: "Automatic workpiece probing and zeroing for higher accuracy." },
    ],
  },
  {
    slug: "qsm-r4020",
    model: "QSM-R4020",
    category: "router",
    axes: 5,
    controller: "QS Astro 6AH",
    controllerSlug: "astro-6ah",
    tagline: "Máy CNC Router 5 trục gia công hiệu quả các chi tiết 3D phức tạp trong một lần gá nhờ khả năng thay đổi góc cắt linh hoạt.",
    taglineEn: "A 5-axis CNC router that machines complex 3D parts in a single setup through flexible cutting-angle control.",
    image: IMG("r4020"),
    specs: [
      { k: "axes", v: "5" },
      { k: "spindleSpeed", v: "18000 rpm" },
      { k: "spindlePower", v: "7.5 kW" },
      { k: "machineTravel", v: "4000 × 2000 × 700 mm" },
      { k: "collet", v: "ER25" },
      { k: "controller", v: "QS Astro 6AH" },
      { k: "rapidSpeed", v: "60 m/min" },
      { k: "tableSize", v: "4000 × 1800 mm" },
      { k: "tableLoad", v: "500 kg" },
    ],
    features: [
      { title: "Bàn máy", titleEn: "Work table", desc: "Kích thước 4000 × 1800 mm, tải trọng tối đa 500 kg.", descEn: "4000 × 1800 mm surface with a 500 kg maximum load." },
      { title: "Trục chính", titleEn: "Spindle", desc: "Tốc độ 18.000 rpm, đầu kẹp ER25 cho phôi lớn.", descEn: "18,000 rpm with an ER25 collet for large workpieces." },
      { title: "Bộ điều khiển", titleEn: "Controller", desc: "QS Astro 6AH điều khiển đồng thời 5 trục.", descEn: "QS Astro 6AH driving five simultaneous axes." },
    ],
  },
  {
    slug: "pjm-420",
    model: "PJM-420",
    category: "jewelry",
    axes: 7,
    controller: "QS Astro 10i",
    controllerSlug: "astro-10i",
    tagline: "Trung tâm gia công kim hoàn CNC 7 trục cho chi tiết nhỏ, phức tạp; hoàn thiện 3D một lần gá, tăng năng suất và thẩm mỹ.",
    taglineEn: "A 7-axis CNC jewelry machining center for small, complex parts; complete 3D machining in one setup for higher output and finish.",
    image: IMG("pjm"),
    specs: [
      { k: "axes", v: "7" },
      { k: "spindleSpeed", v: "45000 rpm" },
      { k: "spindlePower", v: "7.5 kW" },
      { k: "machineTravel", v: "380 × 190 × 200 mm" },
      { k: "toolHead", v: "HSK25" },
      { k: "toolMagazine", v: "17" },
      { k: "controller", v: "QS Astro 10i" },
      { k: "rotaryAxis", v: "Độ chính xác cao · khử rơ" },
    ],
    features: [
      { title: "Trục chính", titleEn: "Spindle", desc: "Tốc độ 45.000 rpm, đầu dao HSK25 cho chi tiết tinh xảo.", descEn: "45,000 rpm with an HSK25 tool head for intricate parts." },
      { title: "Ổ chứa dao ATC", titleEn: "ATC support", desc: "Mâm dao 17 vị trí, thay dao tự động.", descEn: "17-position tool magazine with automatic tool change." },
      { title: "Giao diện vận hành", titleEn: "Operation interface", desc: "Dễ sử dụng và thao tác cho vận hành hàng ngày.", descEn: "Easy to use and operate day to day." },
      { title: "Trục xoay", titleEn: "Rotary axis", desc: "Trục xoay độ chính xác cao, khử rơ (zero backlash).", descEn: "High-precision rotary axis with zero backlash." },
    ],
  },
  {
    slug: "jw-230",
    model: "JW-230",
    category: "jewelry",
    axes: 5,
    controller: "QS Astro 6AV",
    controllerSlug: "astro-6av",
    tagline: "Máy kim hoàn CNC 5 trục gia công trang sức tinh xảo, độ chính xác cao, tối ưu thời gian và hiệu suất.",
    taglineEn: "A 5-axis jewelry CNC machine producing intricate designs at high precision while optimizing time and efficiency.",
    image: IMG("jw"),
    specs: [
      { k: "axes", v: "5" },
      { k: "spindleSpeed", v: "60000 rpm" },
      { k: "spindlePower", v: "3 kW" },
      { k: "machineTravel", v: "300 × 200 × 300 mm" },
      { k: "toolCapacity", v: "6 mm" },
      { k: "controller", v: "QS Astro 6AV" },
      { k: "transmission", v: "Ray trượt tuyến tính + vít me bi" },
    ],
    features: [
      { title: "Trục chính", titleEn: "Spindle", desc: "Tốc độ 60.000 rpm, đường kính dao tối đa 6 mm.", descEn: "60,000 rpm with a maximum tool diameter of 6 mm." },
      { title: "Hệ thống truyền động", titleEn: "Transmission system", desc: "Ray trượt tuyến tính kết hợp vít me bi cho độ chính xác cao.", descEn: "Linear guideways paired with ball screws for high precision." },
      { title: "Bộ điều khiển", titleEn: "Controller", desc: "QS Astro 6AV điều khiển đồng thời 5 trục.", descEn: "QS Astro 6AV driving five simultaneous axes." },
    ],
  },
];
