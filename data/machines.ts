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

export type MachineCategory = "milling" | "router" | "jewelry" | "automation" | "inspection";

export type MachinePhoto = { src: string; w: number; h: number };

/** A spec row: `k` is an i18n label key, `v` the neutral value string. */
export type MachineSpec = { k: string; v: string };

/**
 * A callout box (the highlighted feature blocks on the datasheet pages). `img`,
 * when present, is a detail photo of that feature (spindle, controller, table…)
 * cropped from the machine's datasheet — the view renders it above the text.
 */
export type MachineFeature = {
  title: string;
  titleEn?: string;
  desc: string;
  descEn?: string;
  img?: string;
};

/**
 * One station in the line-flow strip on the automation/inspection detail
 * template: what enters, what the machine does, what leaves. Localized prose.
 */
export type MachineLineStep = { title: string; titleEn?: string; desc: string; descEn?: string };

/** The machine's operator control system (HMI + safety chrome), shown as a
 *  control-panel card in place of the CNC controller card. */
export type MachineControl = {
  /** Control system as labelled on the machine, e.g. "Siemens SIMATIC HMI". */
  system: string;
  /** Operator-facing control points (touchscreen, e-stop, andon…). */
  points: { label: string; labelEn?: string }[];
};

/** An in-context photo for the gallery strip, with a localized caption. */
export type MachineShot = { src: string; caption: string; captionEn?: string };

/**
 * A studio shot for the CNC hero slideshow. `kind` is an i18n key resolved from
 * `cnc.machines.detail.shots.*` (front, back, left, controller…) so the caption
 * localizes; `src`/`w`/`h` point at the real photo under `/img/machines/gallery`.
 */
export type MachineHeroShot = { src: string; w: number; h: number; kind: string };

/** An industry this machine is deployed in (chip cloud). */
export type MachineApplication = { label: string; labelEn?: string };

export type Machine = {
  slug: string;
  model: string;
  category: MachineCategory;
  /** Controlled motion axes; 0 for non-CNC automation/inspection lines. */
  axes: number;
  /**
   * Controller name as printed on the datasheet, e.g. "QS Astro 10i". Omitted
   * on automation/inspection machines that don't ship a QS controller.
   */
  controller?: string;
  /** Slug of the matching controller in the products catalogue, if any. */
  controllerSlug?: string;
  /** Short positioning line — vi primary, en override. */
  tagline: string;
  taglineEn?: string;
  image: MachinePhoto;
  /**
   * Studio shots for the hero slideshow (CNC datasheet template). When present,
   * the detail hero cross-fades through these instead of the single `image`.
   */
  heroShots?: MachineHeroShot[];
  /** Ordered spec rows; the machine list panel shows the first `HIGHLIGHT_COUNT`. */
  specs: MachineSpec[];
  /** Datasheet callout boxes shown on the detail page. */
  features: MachineFeature[];
  /**
   * Line-station template extras (automation/inspection machines). When present,
   * the detail page renders the light "line station" layout instead of the dark
   * CNC datasheet layout: a process line-flow, an in-context gallery, a control
   * panel card and an applications chip cloud.
   */
  line?: MachineLineStep[];
  control?: MachineControl;
  gallery?: MachineShot[];
  applications?: MachineApplication[];
};

/** How many leading spec rows surface in the list panel / card preview. */
export const HIGHLIGHT_COUNT = 6;

const IMG = (slug: string, w = 1000, h = 800): MachinePhoto => ({
  src: `/img/machines/${slug}.webp`,
  w,
  h,
});
/** Feature detail photo cropped from the datasheet, under `/features`. */
const FIMG = (name: string): string => `/img/machines/features/${name}.webp`;
/** Hero slideshow studio shot, under `/gallery/<slug>`. */
const GIMG = (slug: string, kind: string, w: number, h: number): MachineHeroShot => ({
  src: `/img/machines/gallery/${slug}/${kind}.webp`,
  w,
  h,
  kind,
});

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
    image: IMG("qsm125", 1288, 1400),
    heroShots: [
      GIMG("qsm-125", "front", 1472, 1600),
      GIMG("qsm-125", "back", 1600, 898),
    ],
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
      { title: "Đúc nguyên khối", titleEn: "Monolithic casting", desc: "Tăng độ cứng vững, giảm rung lắc khi gia công.", descEn: "Higher rigidity and less vibration during machining.", img: FIMG("qsm125-casting") },
      { title: "Ray trượt tuyến tính", titleEn: "Linear guideways", desc: "Chuyển động êm ái, độ chính xác cao và tuổi thọ cao.", descEn: "Smooth motion with high accuracy and long service life.", img: FIMG("qsm125-guideways") },
      { title: "Hệ thống bôi trơn", titleEn: "Lubrication system", desc: "Giảm ma sát, tăng tuổi thọ các cơ cấu truyền động.", descEn: "Reduces friction and extends the life of the drive train.", img: FIMG("qsm125-lubrication") },
      { title: "Độ chính xác", titleEn: "Accuracy", desc: "Đảm bảo chất lượng gia công ổn định và đồng đều.", descEn: "Ensures stable and consistent machining quality.", img: FIMG("qsm125-accuracy") },
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
    image: IMG("vmc", 1050, 1400),
    specs: [
      { k: "axes", v: "3" },
      { k: "spindleSpeed", v: "12000 rpm" },
      { k: "spindlePower", v: "8.7 kW" },
      { k: "machineTravel", v: "300 × 300 × 300 mm" },
      { k: "collet", v: "ER32" },
      { k: "controller", v: "QS Astro 6AHE" },
    ],
    features: [
      { title: "Trục chính", titleEn: "Spindle", desc: "Tốc độ 12.000 rpm, đầu kẹp ER32 cho gia công cơ khí đa dạng.", descEn: "12,000 rpm with an ER32 collet for versatile machining.", img: FIMG("vmc-spindle") },
      { title: "Bộ điều khiển", titleEn: "Controller", desc: "QS Astro 6AHE, đồng bộ cơ khí, điện và phần mềm.", descEn: "QS Astro 6AHE, with machine, electrics and software in sync.", img: FIMG("vmc-controller") },
      { title: "3D Touch Probe", titleEn: "3D touch probe", desc: "Dò và thiết lập gốc phôi tự động, tăng độ chính xác.", descEn: "Automatic workpiece probing and zeroing for higher accuracy.", img: FIMG("vmc-probe") },
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
    image: IMG("r4020", 1024, 1130),
    heroShots: [
      GIMG("qsm-r4020", "front", 1600, 1118),
      GIMG("qsm-r4020", "controller", 1536, 1024),
    ],
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
      { title: "Bàn máy", titleEn: "Work table", desc: "Kích thước 4000 × 1800 mm, tải trọng tối đa 500 kg.", descEn: "4000 × 1800 mm surface with a 500 kg maximum load.", img: FIMG("r4020-table") },
      { title: "Trục chính", titleEn: "Spindle", desc: "Tốc độ 18.000 rpm, đầu kẹp ER25 cho phôi lớn.", descEn: "18,000 rpm with an ER25 collet for large workpieces.", img: FIMG("r4020-spindle") },
      { title: "Bộ điều khiển", titleEn: "Controller", desc: "QS Astro 6AH điều khiển đồng thời 5 trục.", descEn: "QS Astro 6AH driving five simultaneous axes.", img: FIMG("r4020-controller") },
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
    image: IMG("pjm", 895, 1200),
    heroShots: [
      GIMG("pjm-420", "front", 1200, 1600),
      GIMG("pjm-420", "left", 1200, 1600),
      GIMG("pjm-420", "right", 1200, 1600),
    ],
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
      { title: "Trục chính", titleEn: "Spindle", desc: "Tốc độ 45.000 rpm, đầu dao HSK25 cho chi tiết tinh xảo.", descEn: "45,000 rpm with an HSK25 tool head for intricate parts.", img: FIMG("pjm-spindle") },
      { title: "Ổ chứa dao ATC", titleEn: "ATC support", desc: "Mâm dao 17 vị trí, thay dao tự động.", descEn: "17-position tool magazine with automatic tool change.", img: FIMG("pjm-atc") },
      { title: "Giao diện vận hành", titleEn: "Operation interface", desc: "Dễ sử dụng và thao tác cho vận hành hàng ngày.", descEn: "Easy to use and operate day to day.", img: FIMG("pjm-interface") },
      { title: "Trục xoay", titleEn: "Rotary axis", desc: "Trục xoay độ chính xác cao, khử rơ (zero backlash).", descEn: "High-precision rotary axis with zero backlash.", img: FIMG("pjm-rotary") },
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
    image: IMG("jw", 683, 1200),
    heroShots: [
      GIMG("jw-230", "front", 906, 1600),
      GIMG("jw-230", "structure", 960, 1011),
      GIMG("jw-230", "cabinet", 1600, 757),
    ],
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
      { title: "Trục chính", titleEn: "Spindle", desc: "Tốc độ 60.000 rpm, đường kính dao tối đa 6 mm.", descEn: "60,000 rpm with a maximum tool diameter of 6 mm.", img: FIMG("jw-spindle") },
      { title: "Hệ thống truyền động", titleEn: "Transmission system", desc: "Ray trượt tuyến tính kết hợp vít me bi cho độ chính xác cao.", descEn: "Linear guideways paired with ball screws for high precision.", img: FIMG("jw-transmission") },
      { title: "Bộ điều khiển", titleEn: "Controller", desc: "QS Astro 6AV điều khiển đồng thời 5 trục.", descEn: "QS Astro 6AV driving five simultaneous axes.", img: FIMG("jw-controller") },
    ],
  },
  {
    slug: "rbt-01",
    model: "RBT-01",
    category: "automation",
    axes: 0,
    tagline: "Xoay và định hướng chai tự động, tăng tốc độ và hiệu quả đóng gói cho ngành bia, dược phẩm, nước uống và sữa.",
    taglineEn: "Automatically rotates and aligns bottles, improving packaging speed and efficiency for the beverage, pharmaceutical, bottled-water and dairy industries.",
    image: { src: "/img/machines/rbt01.webp", w: 1224, h: 1400 },
    specs: [
      { k: "throughput", v: "40 block/min" },
      { k: "productTypes", v: "6" },
      { k: "power", v: "1.2 kW" },
      { k: "controlSystem", v: "Siemens SIMATIC HMI + PLC" },
      { k: "beltType", v: "Băng tải nhựa modular" },
    ],
    features: [
      { title: "Định hướng tự động", titleEn: "Automatic alignment", desc: "Xoay và định hướng chai về đúng vị trí nhãn trước khi đóng gói.", descEn: "Rotates and orients each bottle to the correct label position before packing." },
      { title: "Đa dạng sản phẩm", titleEn: "Multi-format", desc: "Tương thích 6 loại chai, chuyển đổi nhanh giữa các dòng sản phẩm.", descEn: "Handles 6 bottle types with quick changeover between product lines." },
      { title: "Năng suất cao", titleEn: "High throughput", desc: "Đạt 40 block/phút, tăng tốc độ và hiệu quả cho dây chuyền đóng gói.", descEn: "Runs at 40 blocks per minute for faster, more efficient packaging." },
      { title: "Băng tải modular", titleEn: "Modular conveyor", desc: "Băng tải nhựa modular bền, dễ vệ sinh, phù hợp môi trường thực phẩm và dược.", descEn: "A durable, easy-to-clean modular plastic belt suited to food and pharma environments." },
    ],
    line: [
      { title: "Cấp block chai", titleEn: "Bottle blocks in", desc: "Block chai theo băng tải vào trạm; cảm biến quang xác định vị trí từng block.", descEn: "Bottle blocks arrive on the conveyor; photo-eye sensors locate each block." },
      { title: "Xoay & định hướng", titleEn: "Rotate & align", desc: "Cụm đầu xoay servo hạ xuống, kẹp và xoay từng block về đúng hướng nhãn.", descEn: "The servo rotating heads descend, grip and turn each block to the correct label facing." },
      { title: "Ra dây chuyền đóng gói", titleEn: "Out to packing", desc: "Block đã định hướng chuyển tiếp sang công đoạn màng co và đóng thùng.", descEn: "Aligned blocks move on to shrink-wrap and case packing." },
    ],
    control: {
      system: "Siemens SIMATIC HMI",
      points: [
        { label: "Màn hình cảm ứng SIMATIC", labelEn: "SIMATIC touchscreen" },
        { label: "Chọn công thức theo loại chai", labelEn: "Recipe select per bottle type" },
        { label: "Nút dừng khẩn cấp", labelEn: "Emergency stop" },
        { label: "Đèn tháp báo trạng thái", labelEn: "Andon status tower" },
      ],
    },
    gallery: [
      { src: FIMG("rbt01-heads"), caption: "Cụm đầu xoay servo trên băng tải modular", captionEn: "Servo rotating heads over the modular belt" },
      { src: FIMG("rbt01-hmi"), caption: "Bảng điều khiển và màn hình Siemens", captionEn: "Siemens HMI and operator panel" },
      { src: FIMG("rbt01-operator"), caption: "Block 3×3 hoàn thiện sau khi định hướng", captionEn: "Finished 3×3 blocks after alignment" },
    ],
    applications: [
      { label: "Bia & nước giải khát", labelEn: "Beer & beverage" },
      { label: "Dược phẩm", labelEn: "Pharmaceutical" },
      { label: "Nước đóng chai", labelEn: "Bottled water" },
      { label: "Sữa", labelEn: "Dairy" },
    ],
  },
  {
    slug: "cwm-050",
    model: "CWM-050",
    category: "inspection",
    axes: 0,
    tagline: "Kiểm tra trọng lượng sản phẩm và thùng hàng khối lượng lớn, phát hiện thiếu hoặc thừa cân; ứng dụng rộng rãi trong thực phẩm, dược phẩm, hóa chất và công nghiệp.",
    taglineEn: "Weighs large products and cartons, detecting underweight and overweight items — widely used across food, pharmaceutical, chemical, agricultural and industrial lines.",
    image: { src: "/img/machines/cwm050.webp", w: 1217, h: 1400 },
    specs: [
      { k: "capacity", v: "50 kg" },
      { k: "conveyorSpeed", v: "40 m/min" },
      { k: "tolerance", v: "±25 g" },
      { k: "power", v: "500 W" },
      { k: "controlSystem", v: "Delta HMI + PLC DVP" },
      { k: "loadCell", v: "Load cell + đầu cân CAS" },
      { k: "beltType", v: "Băng tải PU thực phẩm" },
    ],
    features: [
      { title: "Cân kiểm tra tự động", titleEn: "Automatic checkweighing", desc: "Cân từng sản phẩm khi chạy qua băng tải, loại sản phẩm thiếu hoặc thừa cân.", descEn: "Weighs each product in motion and flags underweight or overweight items." },
      { title: "Độ chính xác cao", titleEn: "High accuracy", desc: "Sai số ±25 g, giữ khối lượng đồng đều trên toàn dây chuyền.", descEn: "±25 g tolerance keeps weight consistent across the whole line." },
      { title: "Tải trọng lớn", titleEn: "High capacity", desc: "Kiểm tra sản phẩm và thùng hàng khối lượng đến 50 kg.", descEn: "Checks products and cartons weighing up to 50 kg." },
      { title: "Giao diện HMI", titleEn: "HMI interface", desc: "Màn hình cảm ứng theo dõi cân, cảnh báo và thống kê theo thời gian thực.", descEn: "A touchscreen HMI for real-time weighing, alarms and statistics." },
    ],
    line: [
      { title: "Sản phẩm vào", titleEn: "Product in", desc: "Sản phẩm hoặc thùng hàng từ dây chuyền phía trước đi vào băng cân.", descEn: "Products or cartons enter the weighing belt from the upstream line." },
      { title: "Cân động trên băng", titleEn: "Weigh in motion", desc: "Load cell cân từng sản phẩm khi chạy qua, so với dải khối lượng cài đặt.", descEn: "A load cell weighs each item on the move and compares it to the preset range." },
      { title: "Đạt / loại", titleEn: "Accept / reject", desc: "Sản phẩm thiếu hoặc thừa cân được cảnh báo và tách khỏi dây chuyền.", descEn: "Underweight or overweight items are flagged and diverted off the line." },
    ],
    control: {
      system: "Delta DOP HMI",
      points: [
        { label: "Màn hình cảm ứng Delta", labelEn: "Delta touchscreen" },
        { label: "Cài dải cân & sai số", labelEn: "Target weight & tolerance setup" },
        { label: "Nút nguồn & dừng khẩn cấp", labelEn: "Power & emergency stop" },
        { label: "Đèn tháp báo lỗi", labelEn: "Andon alarm tower" },
      ],
    },
    gallery: [
      { src: FIMG("cwm050-belt"), caption: "Băng tải cân PU và cụm thân máy", captionEn: "PU weighing belt and machine body" },
      { src: FIMG("cwm050-hmi"), caption: "Màn hình Delta hiển thị cân, kiểm và sai số", captionEn: "Delta screen showing measure, check and tolerance" },
      { src: FIMG("cwm050-cabinet"), caption: "Tủ điện: PLC, biến tần và đầu cân", captionEn: "Control cabinet: PLC, inverter and weight indicator" },
      { src: FIMG("cwm050-line"), caption: "Cân lắp giữa hai băng tải trong kho", captionEn: "Installed between conveyors on the warehouse line" },
    ],
    applications: [
      { label: "Thực phẩm", labelEn: "Food" },
      { label: "Dược phẩm", labelEn: "Pharmaceutical" },
      { label: "Hóa chất", labelEn: "Chemical" },
      { label: "Nông nghiệp", labelEn: "Agriculture" },
      { label: "Công nghiệp", labelEn: "Industrial" },
    ],
  },
];
