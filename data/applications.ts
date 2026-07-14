export type ApplicationWorkflowStep = {
  n: string;
  label: string;
  title: string;
  desc: string;
};

export type ApplicationDeployment = {
  name: string;
  loc: string;
};

export type Application = {
  slug: string;
  machine: string;
  summary: string;
  workflow: ApplicationWorkflowStep[];
  specs: Array<{ label: string; value: string }>;
  deployments: ApplicationDeployment[];
  /** Controller model slugs (see data/products.ts) suited to this machine type. */
  products: string[];
};

const sharedWorkflow: ApplicationWorkflowStep[] = [
  {
    n: "01",
    label: "Input · G-code",
    title: "Nhập chương trình gia công",
    desc:
      "File NC được nạp qua USB, Ethernet hoặc DNC. Bộ điều khiển phân tích và mô phỏng đường chạy dao trên màn hình trước khi chạy thật.",
  },
  {
    n: "02",
    label: "Plan · Path",
    title: "Tính toán quỹ đạo servo",
    desc:
      "Look-ahead 256 block, gia tốc S-curve và bù sai số dao. Quỹ đạo được làm mượt theo NURBS để đạt finish bề mặt tốt nhất.",
  },
  {
    n: "03",
    label: "Drive · EtherCAT",
    title: "Điều khiển servo & spindle",
    desc:
      "Tín hiệu xung/encoder qua EtherCAT 1ms tới các trục X/Y/Z và biến tần spindle. Vòng kín kiểm tra vị trí từng chu kỳ.",
  },
  {
    n: "04",
    label: "Monitor · HMI",
    title: "Giám sát & báo lỗi",
    desc:
      "HMI hiển thị tọa độ, tốc độ, dòng spindle, alarm. Dữ liệu chu trình ghi log để phục vụ truy xuất nguồn gốc và OEE.",
  },
];

const sharedSpecs: Array<{ label: string; value: string }> = [
  { label: "Số trục", value: "3 trục (X / Y / Z) — mở rộng 4–6 trục" },
  { label: "Hành trình", value: "600 × 400 × 320 mm" },
  { label: "Độ chính xác", value: "±0.005 mm" },
  { label: "Tốc độ chạy dao", value: "10 000 mm/min" },
  { label: "Tốc độ spindle", value: "14 000 RPM" },
  { label: "Bộ điều khiển", value: "QS Astro 6AH · 8\" HMI" },
  { label: "Giao tiếp", value: "EtherCAT · USB · Ethernet · RS-232" },
];

const sharedDeployments: ApplicationDeployment[] = [
  { name: "Cơ khí Tân Bình", loc: "HCM · 2024 · 12 máy phay 3 trục Astro 6AH cho dây chuyền linh kiện ô tô." },
  { name: "Khuôn mẫu Hà Nam", loc: "Hà Nam · 2025 · Hệ thống 5 trục với F10T Touch cho khuôn nhựa kỹ thuật cao." },
  { name: "Y khoa Đồng Nai", loc: "Đồng Nai · 2024 · 6 máy phay y tế Astro 10i cho gia công implant Titan." },
];

const summaryDefault =
  "Máy phay CNC sử dụng các công cụ cắt xoay để loại bỏ vật liệu khỏi phôi — gia công các bộ phận tùy chỉnh phức tạp với độ chính xác cao và sản lượng lớn cho khuôn mẫu, linh kiện cơ khí và thiết bị y tế.";

// Per-machine summaries drive the SEO description and JSON-LD; the shared workflow/specs
// remain a reference config until per-machine data is added.
const summaries: Record<string, string> = {
  "phay-cnc": summaryDefault,
  "cua-long":
    "Máy cưa lọng công nghiệp được sử dụng để cắt các biên dạng cong phức tạp trên gỗ, nhựa hoặc vật liệu mỏng với tốc độ cao và đường cắt mượt mà. Hệ thống điều khiển QS giúp duy trì độ ổn định liên tục cho xưởng sản xuất.",
  "dan-keo":
    "Giải pháp rải keo tự động bám sát đường viền biên dạng, ứng dụng mạnh mẽ trong sản xuất giày da, bao bì và linh kiện điện tử. Đảm bảo lượng keo đồng đều, tiết kiệm nguyên liệu và nâng cao năng suất.",
  "thuc-pham":
    "Hệ thống điều khiển tốc độ cao, đảm bảo nhịp cắt chính xác và đồng đều cho các dây chuyền chế biến thịt, bánh, và rau củ quả. Giao diện tối ưu giúp thao tác nhanh chóng và đáp ứng khắt khe các tiêu chuẩn vệ sinh công nghiệp.",
  "uon-lo-xo":
    "Bộ điều khiển chuyên dụng tự động hóa toàn bộ quá trình cấp dây, cuốn, uốn và cắt. Tạo ra các loại lò xo nén, kéo, và lò xo xoắn đa biên độ với độ đồng đều tuyệt đối và sai số thấp nhất.",
  "mong-go":
    "Giải pháp gia công mộng âm dương chính xác cao cho ngành sản xuất nội thất. Rút ngắn thời gian thiết lập phôi, đa dạng hóa các kiểu mộng và đẩy nhanh tốc độ sản xuất hàng loạt cho xưởng mộc công nghiệp.",
  "kim-hoan":
    "Sức mạnh điều khiển nội suy mượt mà kết hợp với độ phân giải vi bước siêu nhỏ. Mang lại những đường chạm khắc, phay cắt cực kỳ tinh xảo trên vàng, bạc và trang sức, đáp ứng tiêu chuẩn khắt khe nhất của ngành kim hoàn.",
};

const machineNames: Array<{ slug: string; machine: string }> = [
  { slug: "phay-cnc", machine: "Máy Phay CNC" },
  { slug: "cua-long", machine: "Máy Cưa Lọng" },
  { slug: "dan-keo", machine: "Máy Dán Keo" },
  { slug: "thuc-pham", machine: "Máy Cắt Thực Phẩm" },
  { slug: "uon-lo-xo", machine: "Máy Uốn Lò Xo" },
  { slug: "mong-go", machine: "Máy Làm Mộng" },
  { slug: "kim-hoan", machine: "Máy Kim Hoàn" },
];

// Controller models suited to each machine type. Slugs match data/products.ts and
// are ordered to follow the catalogue order. Drives both the "Sản phẩm tương ứng"
// section on the application detail page and the product-list category filter.
const ALL_CONTROLLERS = ["f54", "f86", "f10t", "astro-6ah", "astro-6av", "astro-10s", "astro-10i"];
const productsByMachine: Record<string, string[]> = {
  "phay-cnc": ALL_CONTROLLERS,
  "cua-long": ["f86"],
  "dan-keo": ALL_CONTROLLERS,
  "thuc-pham": ["f10t"],
  "uon-lo-xo": ["f86", "astro-10s"],
  "mong-go": ["f54", "f86", "f10t", "astro-6ah", "astro-6av", "astro-10i"],
  "kim-hoan": ALL_CONTROLLERS,
};

export const applications: Application[] = machineNames.map(({ slug, machine }) => ({
  slug,
  machine,
  summary: summaries[slug] ?? summaryDefault,
  workflow: sharedWorkflow,
  specs: sharedSpecs,
  deployments: sharedDeployments,
  products: productsByMachine[slug] ?? [],
}));
