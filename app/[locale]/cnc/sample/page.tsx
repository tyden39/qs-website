import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import Reveal from "@/components/reveal";
import CircuitTraces from "@/components/circuit-traces";
import {
  Box,
  Gauge,
  Zap,
  Cpu,
  Weight,
  Layers,
  Crosshair,
  Move3d,
  Activity,
  Target,
  GraduationCap,
  FlaskConical,
  Component,
  Download,
  FileText,
  Check,
  ArrowDownToLine,
  PhoneCall,
  type LucideIcon,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

/**
 * SAMPLE — full editorial CNC datasheet (QSM-125) for design review.
 *
 * Static route (`/cnc/sample`) that takes precedence over `/cnc/[slug]`; it
 * carries hardcoded QSM-125 content so the richer datasheet layout — suitable
 * applications, working-space diagram, performance strip, controller card,
 * grouped spec table, standard/optional config and downloads — can be reviewed
 * before it is wired into the real machine detail template. Vietnamese copy.
 */

export const metadata: Metadata = {
  title: "QSM-125 — Trung tâm gia công CNC (Sample)",
  robots: { index: false, follow: false },
};

/* ── Section content (QSM-125, matches the datasheet mockup) ── */

const HERO_SPECS: { icon: LucideIcon; value: string; label: string }[] = [
  { icon: Box, value: "3", label: "Trục" },
  { icon: Gauge, value: "24.000", label: "rpm" },
  { icon: Move3d, value: "250 × 150 × 300", label: "mm" },
  { icon: Zap, value: "2.2", label: "kW" },
];

const APPLICATIONS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Target, title: "Gia công chi tiết chính xác", desc: "Phù hợp cho các chi tiết có dung sai nhỏ và bề mặt hoàn thiện cao." },
  { icon: Component, title: "Sản xuất linh kiện", desc: "Sản xuất linh kiện cơ khí, khuôn mẫu và các chi tiết chuẩn xác." },
  { icon: FlaskConical, title: "R&D và Prototype", desc: "Gia công nguyên mẫu phục vụ nghiên cứu và phát triển sản phẩm." },
  { icon: GraduationCap, title: "Đào tạo CNC", desc: "Giải pháp lý tưởng cho đào tạo và thực hành vận hành CNC." },
];

const HIGHLIGHTS: { img: string; title: string; desc: string }[] = [
  { img: "/img/machines/features/qsm125-casting.webp", title: "Kết cấu đúc nguyên khối", desc: "Độ cứng vững cao, hạn chế rung động, đảm bảo độ ổn định lâu dài." },
  { img: "/img/machines/features/qsm125-guideways.webp", title: "Ray trượt tuyến tính", desc: "Ray tuyến tính chính xác cao, chuyển động mượt mà và tuổi thọ cao." },
  { img: "/img/machines/features/qsm125-lubrication.webp", title: "Bôi trơn tự động", desc: "Hệ thống bôi trơn tự động giúp giảm ma sát và tăng tuổi thọ máy." },
  { img: "/img/machines/features/qsm125-accuracy.webp", title: "Độ chính xác ổn định", desc: "Thiết kế tối ưu đảm bảo độ chính xác và lặp lại trong thời gian dài." },
];

const CAPABILITIES: { img: string; caption: string }[] = [
  { img: "/img/machines/features/qsm125-casting.webp", caption: "Chi tiết nhôm" },
  { img: "/img/machines/features/qsm125-guideways.webp", caption: "Jig & Fixture" },
  { img: "/img/machines/features/qsm125-accuracy.webp", caption: "Chi tiết chính xác" },
  { img: "/img/machines/features/qsm125-lubrication.webp", caption: "Proto & Prototype" },
];

const WORKSPACE: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: Move3d, label: "Hành trình X / Y / Z", value: "250 × 150 × 300 mm" },
  { icon: Layers, label: "Bàn máy", value: "350 × 200 mm" },
  { icon: Weight, label: "Tải trọng bàn", value: "50 kg" },
  { icon: ArrowDownToLine, label: "Khoảng cách spindle nose đến bàn", value: "80 – 380 mm" },
];

const PERFORMANCE: { icon: LucideIcon; value: string; unit: string; label: string }[] = [
  { icon: Gauge, value: "24.000", unit: "rpm", label: "Tốc độ trục chính tối đa" },
  { icon: Zap, value: "2.2", unit: "kW", label: "Công suất trục chính" },
  { icon: Activity, value: "30.000", unit: "mm/min", label: "Tốc độ chạy nhanh" },
  { icon: Crosshair, value: "15.000", unit: "mm/min", label: "Tốc độ cắt tối đa" },
];

const CONTROLLER_TAGS = [
  "EtherCAT Motion Control",
  "Integrated PLC",
  "Macro Programming",
  "High-speed Motion Control",
  "Parameter Management",
  "Expandable Machine Functions",
];

const SPEC_GROUPS: { icon: LucideIcon; title: string; rows: [string, string][] }[] = [
  {
    icon: Box,
    title: "Capacity",
    rows: [
      ["Số trục", "3"],
      ["Hành trình X / Y / Z", "250 × 150 × 300 mm"],
      ["Kích thước bàn", "350 × 200 mm"],
      ["Tải trọng bàn", "50 kg"],
      ["Rãnh T", "12 × 3"],
      ["Khoảng cách spindle nose đến bàn", "80 – 380 mm"],
    ],
  },
  {
    icon: Gauge,
    title: "Spindle",
    rows: [
      ["Tốc độ trục chính", "24.000 rpm"],
      ["Công suất trục chính", "2.2 kW"],
      ["Kiểu trục chính", "BT30"],
      ["Truyền động", "Trực tiếp"],
      ["Làm mát trục chính", "Làm mát bằng gió"],
    ],
  },
  {
    icon: Move3d,
    title: "Feed System",
    rows: [
      ["Tốc độ chạy nhanh", "30.000 mm/min"],
      ["Tốc độ cắt tối đa", "15.000 mm/min"],
      ["Loại trục vít me", "Ray tuyến tính"],
      ["Truyền động vít me", "Đai ốc bi, C3"],
      ["Động cơ servo", "AC Servo"],
    ],
  },
  {
    icon: Crosshair,
    title: "Accuracy",
    rows: [
      ["Độ chính xác định vị", "±0.01 / 300 mm"],
      ["Độ chính xác lặp lại", "±0.005 / 300 mm"],
      ["Độ phân giải", "0.001 / 300 mm"],
      ["Độ vuông góc", "0.01 / 300 mm"],
    ],
  },
  {
    icon: Weight,
    title: "Machine",
    rows: [
      ["Kích thước máy (DxRxC)", "950 × 1.200 × 1.200 mm"],
      ["Trọng lượng máy", "360 kg"],
      ["Bình chứa dung dịch", "120 L"],
      ["Nguồn điện", "AC 1 pha 220 V"],
      ["Áp suất khí nguồn", "0.6 – 0.8 MPa"],
    ],
  },
  {
    icon: Cpu,
    title: "CNC System",
    rows: [
      ["Bộ điều khiển", "QS Astro 6AVE (EtherCAT)"],
      ["Màn hình", "10.4\" TFT Color"],
      ["Ngôn ngữ lập trình", "G-code"],
      ["Giao tiếp", "USB / Ethernet"],
      ["Bộ nhớ chương trình", "0.6 – 0.8 MPa"],
    ],
  },
];

const STANDARD_EQUIP = [
  "Bộ điều khiển QS Astro 6AVE (EtherCAT)",
  "Trục chính 24.000 rpm (BT30)",
  "Hệ thống làm mát bằng gió",
  "Hệ thống bôi trơn tự động",
  "Đèn báo 3 màu",
  "Hệ thống chiếu sáng LED",
  "Hệ thống làm mát dung dịch",
  "Hộp dụng cụ và tài liệu đi kèm",
];

const OPTIONAL_EQUIP = [
  "Băng tải phoi tự động",
  "Đầu dò đo phôi",
  "Bộ làm mát trục chính",
  "Hệ thống hút sương dầu",
  "Mâm cặp & Đồ gá",
  "Bộ kẹp dao",
  "Điện áp 3 pha 380V",
  "Tùy chọn khác theo yêu cầu",
];

const DOWNLOADS: { title: string; sub: string; desc: string }[] = [
  { title: "Brochure sản phẩm", sub: "QSM-125", desc: "Tài liệu giới thiệu tổng quan sản phẩm." },
  { title: "Technical Specification", sub: "QSM-125", desc: "Thông số kỹ thuật chi tiết." },
  { title: "Controller Information", sub: "QS Astro 6AVE", desc: "Tài liệu bộ điều khiển." },
];

export default async function MachineDetailSamplePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden border-b border-line"
        style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}
      >
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-50" aria-hidden="true" />
        <div className="qs-glow hidden sm:block right-[6%] top-[-30%] w-[34%] h-[150%]" aria-hidden="true" />
        <CircuitTraces
          variant="light"
          className="hidden lg:block absolute bottom-0 right-0 w-[40%] h-[86%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_bottom_right,#000_22%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_at_bottom_right,#000_22%,transparent_72%)]"
        />
        <div className="relative z-10 qs-wrap-wide py-14 lg:py-20">
          <nav className="qs-crumb mb-8">
            <Link href="/cnc">Máy CNC</Link>
            <span className="sep">/</span>
            <span className="here">QSM-125</span>
          </nav>
          <div className="grid lg:grid-cols-[minmax(360px,1fr)_1.15fr] gap-12 lg:gap-16 items-center">
            <div>
              <div className="qs-eyebrow qs-rise" style={{ animationDelay: "0ms" }}>
                Trung tâm gia công
              </div>
              <h1 className="qs-h1 mt-3.5 qs-rise" style={{ animationDelay: "90ms" }}>
                <em className="not-italic font-semibold qs-gold-shimmer">QSM-125</em>
              </h1>
              <p className="font-display font-semibold text-ink text-[19px] mt-2 qs-rise" style={{ animationDelay: "170ms" }}>
                Compact CNC Machining Center
              </p>
              <p className="qs-lede mt-5 max-w-[52ch] qs-rise" style={{ animationDelay: "260ms" }}>
                Máy phay CNC 3 trục hiệu suất cao, khung đúc nguyên khối và ray trượt tuyến tính cho gia công cơ khí chính xác.
              </p>

              <dl className="mt-9 grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line qs-rise" style={{ animationDelay: "380ms" }}>
                {HERO_SPECS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label + s.value} className="bg-white px-4 py-4 text-center">
                      <Icon className="w-5 h-5 mx-auto text-gold-1" strokeWidth={1.6} aria-hidden="true" />
                      <dd className="font-display font-semibold text-ink text-[20px] mt-2.5 m-0 tracking-[-.01em]">{s.value}</dd>
                      <dt className="font-mono text-[10px] tracking-[.14em] uppercase text-muted mt-1">{s.label}</dt>
                    </div>
                  );
                })}
              </dl>

              <div className="flex flex-wrap gap-3 mt-8 qs-rise" style={{ animationDelay: "480ms" }}>
                <Link className="qs-btn qs-btn-gold" href="/contact">
                  Nhận báo giá <span className="arr">→</span>
                </Link>
                <Link className="qs-btn qs-btn-ghost inline-flex items-center gap-2" href="/downloads">
                  <Download className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" /> Tải Brochure
                </Link>
              </div>
            </div>

            <div className="qs-rise" style={{ animationDelay: "220ms" }}>
              <div className="relative border border-line bg-white overflow-hidden">
                <div className="relative h-[380px] sm:h-[460px] lg:h-[560px] w-full overflow-hidden bg-white">
                  <div className="qs-float absolute inset-0">
                    <Image
                      src="/img/machines/gallery/qsm-125/front.webp"
                      alt="QSM-125 — mặt trước"
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-contain p-6 lg:p-10"
                      priority
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-3" aria-hidden="true">
                    <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-gold-1/50" />
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-gold-1/50" />
                    <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-gold-1/50" />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-gold-1/50" />
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-line flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-[.16em] uppercase text-muted">QSM-125</span>
                  <span className="font-mono text-[11px] tracking-[.16em] uppercase text-gold-1">3 trục</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ỨNG DỤNG PHÙ HỢP ── */}
      <section className="relative py-20 bg-paper border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="pb-7 border-b border-line mb-10 max-w-[70ch]">
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2">
                <span className="qs-live-dot" />Ứng dụng phù hợp
              </span>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
            {APPLICATIONS.map((a, i) => {
              const Icon = a.icon;
              return (
                <Reveal key={a.title} delay={i * 80}>
                  <div className="group bg-white h-full p-6">
                    <span className="inline-flex items-center justify-center w-11 h-11 border border-line text-gold-1 bg-paper-2/50 transition-colors group-hover:border-gold-1/40">
                      <Icon className="w-5 h-5" strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <h3 className="font-display font-bold text-ink text-[16px] tracking-[-.01em] mt-4">{a.title}</h3>
                    <p className="text-[13.5px] leading-[1.6] text-muted mt-2 m-0">{a.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ĐIỂM NỔI BẬT ── */}
      <section className="relative py-20 bg-paper border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true" />
        <CircuitTraces
          variant="light"
          className="hidden lg:block absolute top-0 left-0 w-[34%] h-full opacity-[.35] [mask-image:radial-gradient(ellipse_at_left,#000_18%,transparent_68%)] [-webkit-mask-image:radial-gradient(ellipse_at_left,#000_18%,transparent_68%)]"
        />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="pb-7 border-b border-line mb-10 max-w-[70ch]">
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2">
                <span className="qs-live-dot" />Điểm nổi bật
              </span>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
            {HIGHLIGHTS.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="group bg-white h-full flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden bg-paper-2/60">
                    <div className="absolute inset-0 qs-grid-bg opacity-50" aria-hidden="true" />
                    <Image
                      src={f.img}
                      alt={`QSM-125 — ${f.title}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="relative object-cover [filter:saturate(.96)_contrast(1.03)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-2.5 z-10" aria-hidden="true">
                      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/60" />
                      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/60" />
                      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/60" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/60" />
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 border-t border-line">
                    <h3 className="font-display font-bold text-ink text-[16px] tracking-[-.01em]">{f.title}</h3>
                    <p className="text-[13.5px] leading-[1.6] text-muted mt-2 m-0">{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── KHẢ NĂNG GIA CÔNG + KHÔNG GIAN GIA CÔNG ── */}
      <section className="relative py-20 bg-paper border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true" />
        <div className="relative qs-wrap-wide grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <Reveal>
            <div className="pb-7 border-b border-line mb-8">
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2">
                <span className="qs-live-dot" />Khả năng gia công
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line">
              {CAPABILITIES.map((c) => (
                <div key={c.caption} className="bg-white">
                  <div className="relative aspect-square overflow-hidden bg-paper-2/60">
                    <Image
                      src={c.img}
                      alt={c.caption}
                      fill
                      sizes="(max-width: 640px) 50vw, 12vw"
                      className="object-cover [filter:saturate(.96)_contrast(1.03)]"
                    />
                  </div>
                  <p className="font-mono text-[11px] tracking-[.06em] text-center text-muted px-2 py-2.5 border-t border-line m-0">
                    {c.caption}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="pb-7 border-b border-line mb-8">
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2">
                <span className="qs-live-dot" />Không gian gia công
              </span>
            </div>
            <div className="grid sm:grid-cols-[minmax(0,240px)_1fr] gap-8 items-center">
              {/* isometric working-envelope wireframe */}
              <svg viewBox="0 0 240 200" className="w-full max-w-[240px] mx-auto sm:mx-0" role="img" aria-label="Vùng làm việc 250 × 150 × 300 mm" fill="none">
                <g stroke="var(--color-gold-1)" strokeWidth="1.3" strokeLinejoin="round">
                  {/* back face */}
                  <path d="M70 40 L190 40 L190 120 L70 120 Z" strokeOpacity=".35" strokeDasharray="4 4" />
                  {/* front face */}
                  <path d="M30 70 L150 70 L150 150 L30 150 Z" />
                  {/* connectors */}
                  <path d="M30 70 L70 40 M150 70 L190 40 M150 150 L190 120 M30 150 L70 120" />
                </g>
                <g stroke="var(--color-gold-1)" strokeWidth="1" strokeOpacity=".6">
                  {/* dim ticks */}
                  <path d="M30 162 L150 162 M30 158 L30 166 M150 158 L150 166" />
                  <path d="M18 70 L18 150 M14 70 L22 70 M14 150 L22 150" />
                  <path d="M158 152 L196 118 M156 148 L162 156 M192 114 L198 122" />
                </g>
                <g fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-muted)">
                  <text x="90" y="176" textAnchor="middle">X 250 mm</text>
                  <text x="8" y="114" textAnchor="middle" transform="rotate(-90 8 114)">Y 150 mm</text>
                  <text x="182" y="146">Z 300 mm</text>
                </g>
              </svg>

              <dl className="m-0 flex-1">
                {WORKSPACE.map((w) => {
                  const Icon = w.icon;
                  return (
                    <div key={w.label} className="flex items-start gap-3 py-3 border-b border-line first:border-t">
                      <Icon className="w-4 h-4 mt-0.5 shrink-0 text-gold-1" strokeWidth={1.6} aria-hidden="true" />
                      <div>
                        <dt className="text-[12px] text-muted m-0">{w.label}</dt>
                        <dd className="font-mono text-[13.5px] text-ink mt-0.5 m-0">{w.value}</dd>
                      </div>
                    </div>
                  );
                })}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HIỆU SUẤT GIA CÔNG + BỘ ĐIỀU KHIỂN CNC ── */}
      <section className="relative py-20 bg-paper border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true" />
        <div className="relative qs-wrap-wide grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          <Reveal className="flex flex-col">
            <div className="pb-7 border-b border-line mb-8">
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2">
                <span className="qs-live-dot" />Hiệu suất gia công
              </span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-line border border-line flex-1">
              {PERFORMANCE.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.label} className="bg-white px-5 py-7 flex flex-col justify-center text-center">
                    <Icon className="w-6 h-6 mx-auto text-gold-1" strokeWidth={1.5} aria-hidden="true" />
                    <div className="font-display font-semibold text-ink text-[26px] mt-3 tracking-[-.02em] leading-none">{p.value}</div>
                    <div className="font-mono text-[10px] tracking-[.12em] uppercase text-gold-1 mt-1.5">{p.unit}</div>
                    <p className="text-[12px] leading-[1.5] text-muted mt-2.5 m-0">{p.label}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={120} className="flex flex-col">
            <div className="pb-7 border-b border-line mb-8">
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2">
                <span className="qs-live-dot" />Bộ điều khiển CNC
              </span>
            </div>
            <div className="grid sm:grid-cols-[220px_1fr] gap-6 items-stretch flex-1">
              <div className="relative border border-line overflow-hidden min-h-[280px]">
                <Image
                  src="/img/products/astro-6av-front.webp"
                  alt="QS Astro 6AVE"
                  fill
                  sizes="220px"
                  className="object-contain p-3"
                />
              </div>
              <div>
                <p className="font-display font-bold text-ink text-[18px] tracking-[-.01em]">
                  QS Astro 6AVE <span className="text-gold-1 font-mono text-[12px] font-normal">(EtherCAT)</span>
                </p>
                <p className="text-[13.5px] leading-[1.65] text-muted mt-2 m-0">
                  Bộ điều khiển CNC thế hệ mới với hiệu năng nâng cao, độ ổn định vượt trội và khả năng mở rộng linh hoạt.
                </p>
                <div className="flex flex-wrap gap-2 mt-6">
                  {CONTROLLER_TAGS.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[.04em] text-ink border border-line bg-white px-2.5 py-1.5">
                      <Check className="w-3 h-3 text-gold-1" strokeWidth={2.4} aria-hidden="true" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── THÔNG SỐ KỸ THUẬT ── */}
      <section className="relative py-20 bg-paper border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="pb-7 border-b border-line mb-10 max-w-[70ch]">
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2">
                <span className="qs-live-dot" />Thông số kỹ thuật
              </span>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-px bg-line border border-line">
            {SPEC_GROUPS.map((g, i) => {
              const Icon = g.icon;
              return (
                <Reveal key={g.title} delay={i * 60}>
                  <div className="bg-white h-full">
                    <div className="flex items-center gap-2 px-4 py-3.5 border-b border-line">
                      <Icon className="w-4 h-4 text-gold-1 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                      <span className="font-display font-bold text-ink text-[14px]">{g.title}</span>
                    </div>
                    <dl className="m-0 px-4 py-1">
                      {g.rows.map(([k, v]) => (
                        <div key={k} className="py-2.5 border-b border-line/70 last:border-b-0">
                          <dt className="text-[11.5px] leading-tight text-muted m-0">{k}</dt>
                          <dd className="font-mono text-[12.5px] text-ink mt-1 m-0">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CẤU HÌNH TIÊU CHUẨN & TÙY CHỌN ── */}
      <section className="relative py-20 bg-paper border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="pb-7 border-b border-line mb-10 max-w-[70ch]">
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2">
                <span className="qs-live-dot" />Cấu hình tiêu chuẩn &amp; Tùy chọn
              </span>
            </div>
          </Reveal>
          <div className="grid lg:grid-cols-2 gap-px bg-line border border-line">
            <div className="bg-white p-7">
              <h3 className="font-display font-bold text-ink text-[16px] mb-5">Trang bị tiêu chuẩn</h3>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 m-0 p-0 list-none">
                {STANDARD_EQUIP.map((it) => (
                  <li key={it} className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-ink">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-gold-1" strokeWidth={2.2} aria-hidden="true" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-7">
              <h3 className="font-display font-bold text-ink text-[16px] mb-5">Tùy chọn</h3>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 m-0 p-0 list-none">
                {OPTIONAL_EQUIP.map((it) => (
                  <li key={it} className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-muted">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-line-2" strokeWidth={2.2} aria-hidden="true" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── TÀI LIỆU TẢI VỀ ── */}
      <section className="relative py-20 bg-paper border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="pb-7 border-b border-line mb-10 max-w-[70ch]">
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2">
                <span className="qs-live-dot" />Tài liệu tải về
              </span>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line border border-line">
            {DOWNLOADS.map((d, i) => (
              <Reveal key={d.title} delay={i * 80}>
                <Link href="/downloads" className="group bg-white h-full p-6 flex items-start gap-4 hover:bg-paper-2/40 transition-colors">
                  <span className="inline-flex items-center justify-center w-12 h-14 border border-line bg-paper-2/50 text-gold-1 shrink-0">
                    <FileText className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-ink text-[15px] tracking-[-.01em]">{d.title}</h3>
                    <p className="font-mono text-[11px] tracking-[.08em] text-gold-1 mt-0.5">{d.sub}</p>
                    <p className="text-[13px] leading-[1.55] text-muted mt-2 m-0">{d.desc}</p>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[.1em] uppercase text-ink mt-3 group-hover:text-gold-1 transition-colors">
                      Tải xuống <span className="arr transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (dark) ── */}
      <section className="relative bg-ink text-[#cfc9b8] py-20 overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true" />
        <CircuitTraces
          variant="dark"
          className="absolute inset-y-0 right-[-8%] w-[48%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_66%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_66%)]"
        />
        <div className="relative qs-wrap-wide grid lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <Reveal>
            <h2 className="qs-h2 text-white max-w-[24ch]">
              Đang tìm kiếm giải pháp CNC phù hợp với ứng dụng của bạn?
            </h2>
            <p className="text-[15px] leading-[1.7] text-[#a8a499] mt-4 max-w-[54ch]">
              Đội ngũ kỹ thuật QS Technology luôn sẵn sàng hỗ trợ và tư vấn giải pháp tối ưu nhất.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="flex flex-col gap-3">
              <Link className="qs-btn qs-btn-gold justify-between" href="/contact">
                Yêu cầu báo giá <span className="arr">→</span>
              </Link>
              <Link
                className="qs-btn bg-transparent text-white border border-[#4a453a] hover:bg-white/10 inline-flex items-center justify-center gap-2"
                href="/contact"
              >
                <PhoneCall className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" /> Liên hệ tư vấn kỹ thuật
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
