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

export const applications: Application[] = [
  { slug: "phay-cnc", machine: "Máy Phay CNC", summary: summaryDefault, workflow: sharedWorkflow, specs: sharedSpecs, deployments: sharedDeployments },
  { slug: "cua-long", machine: "Máy Cưa Lọng", summary: summaryDefault, workflow: sharedWorkflow, specs: sharedSpecs, deployments: sharedDeployments },
  { slug: "dan-keo", machine: "Máy Dán Keo", summary: summaryDefault, workflow: sharedWorkflow, specs: sharedSpecs, deployments: sharedDeployments },
  { slug: "thuc-pham", machine: "Máy Cắt Thực Phẩm", summary: summaryDefault, workflow: sharedWorkflow, specs: sharedSpecs, deployments: sharedDeployments },
  { slug: "uon-lo-xo", machine: "Máy Uốn Lò Xo", summary: summaryDefault, workflow: sharedWorkflow, specs: sharedSpecs, deployments: sharedDeployments },
  { slug: "mong-go", machine: "Máy Làm Mộng", summary: summaryDefault, workflow: sharedWorkflow, specs: sharedSpecs, deployments: sharedDeployments },
  { slug: "kim-hoan", machine: "Máy Kim Hoàn", summary: summaryDefault, workflow: sharedWorkflow, specs: sharedSpecs, deployments: sharedDeployments },
];
