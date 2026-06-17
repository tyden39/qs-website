import type { Metadata } from "next";
import Link from "next/link";
import { getApplicationBySlug, getApplicationSlugs } from "@/lib/data/applications";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildTechArticle, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";
import { routing } from "@/lib/i18n/routing";

export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = getApplicationSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = await getApplicationBySlug(slug, locale);
  const title = a?.title ?? slug.replace(/-/g, " ");
  const description = a?.summary?.slice(0, 160) ?? "";
  return {
    title,
    description,
    alternates: buildAlternates(`/applications/${slug}`),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: `/applications/${slug}`,
      images: [
        {
          url: a?.heroImage ?? "/og-default.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const machineMap: Record<string, string> = {
  "phay-cnc":   "Máy Phay CNC",
  "cua-long":   "Máy Cưa Lọng",
  "dan-keo":    "Máy Dán Keo",
  "thuc-pham":  "Máy Cắt Thực Phẩm",
  "uon-lo-xo":  "Máy Uốn Lò Xo",
  "mong-go":    "Máy Làm Mộng",
  "kim-hoan":   "Máy Kim Hoàn",
};

const workflow = [
  { n:"01", l:"Input · G-code",    t:"Nhập chương trình gia công",      d:"File NC được nạp qua USB, Ethernet hoặc DNC. Bộ điều khiển phân tích và mô phỏng đường chạy dao trên màn hình trước khi chạy thật." },
  { n:"02", l:"Plan · Path",       t:"Tính toán quỹ đạo servo",          d:"Look-ahead 256 block, gia tốc S-curve và bù sai số dao. Quỹ đạo được làm mượt theo NURBS để đạt finish bề mặt tốt nhất." },
  { n:"03", l:"Drive · EtherCAT",  t:"Điều khiển servo & spindle",       d:"Tín hiệu xung/encoder qua EtherCAT 1ms tới các trục X/Y/Z và biến tần spindle. Vòng kín kiểm tra vị trí từng chu kỳ." },
  { n:"04", l:"Monitor · HMI",     t:"Giám sát & báo lỗi",                d:"HMI hiển thị tọa độ, tốc độ, dòng spindle, alarm. Dữ liệu chu trình ghi log để phục vụ truy xuất nguồn gốc và OEE." },
];

const specs = [
  ["Số trục",         "3 trục (X / Y / Z) — mở rộng 4–6 trục"],
  ["Hành trình",      "600 × 400 × 320 mm"],
  ["Độ chính xác",    "±0.005 mm"],
  ["Tốc độ chạy dao", "10 000 mm/min"],
  ["Tốc độ spindle",  "14 000 RPM"],
  ["Bộ điều khiển",   "QS Astro 6AH · 8\" HMI"],
  ["Giao tiếp",       "EtherCAT · USB · Ethernet · RS-232"],
];

const deployments = [
  { name:"Cơ khí Tân Bình",  loc:"HCM · 2024 · 12 máy phay 3 trục Astro 6AH cho dây chuyền linh kiện ô tô." },
  { name:"Khuôn mẫu Hà Nam", loc:"Hà Nam · 2025 · Hệ thống 5 trục với F10T Touch cho khuôn nhựa kỹ thuật cao." },
  { name:"Y khoa Đồng Nai",  loc:"Đồng Nai · 2024 · 6 máy phay y tế Astro 10i cho gia công implant Titan." },
];

const relatedApps = [
  { slug:"cua-long", n:"02", t:"Máy Cưa Lọng" },
  { slug:"dan-keo",  n:"03", t:"Máy Dán Keo" },
  { slug:"uon-lo-xo",n:"05", t:"Máy Uốn Lò Xo" },
];

export default async function ApplicationDetail({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const machine = machineMap[slug] ?? slug.replace(/-/g, " ");
  const idx = Object.keys(machineMap).indexOf(slug) + 1 || 1;
  const appData = await getApplicationBySlug(slug, locale);
  const techArticleJsonLd = appData ? buildTechArticle(appData, locale) : null;

  return (
    <>
      {techArticleJsonLd && <JsonLd data={techArticleJsonLd} />}
      {/* DARK HERO */}
      <section className="relative overflow-hidden bg-ink text-[#cfc9b8] border-b border-[#2a2620]">
        <div className="absolute inset-0 qs-grid-bg opacity-[.15]"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-12 pb-16">
          <div className="qs-crumb mb-8">
            <Link href="/" className="text-[#a8a499]!">Trang chủ</Link><span className="sep text-[#a8a499]!">/</span>
            <Link href="/applications" className="text-[#a8a499]!">Ứng dụng</Link><span className="sep text-[#a8a499]!">/</span>
            <span className="here text-gold-2! capitalize">{machine}</span>
          </div>
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-16 items-end">
            <div>
              <span className="font-mono text-[11px] text-gold-2 tracking-[.16em] uppercase">[ Application · {String(idx).padStart(2,"0")} / 14 ]</span>
              <h1 className="font-display font-bold tracking-[-.02em] text-white mt-3.5"
                  style={{fontSize:"72px", lineHeight:".95"}}>
                Bộ điều khiển<br/>cho {machine.toLowerCase()}
              </h1>
              <p className="mt-6 text-[17px] leading-[1.6] text-[#a8a499] max-w-[55ch]">
                Máy phay CNC sử dụng các công cụ cắt xoay để loại bỏ vật liệu khỏi phôi — gia công các bộ phận tùy chỉnh phức tạp với độ chính xác cao và sản lượng lớn cho khuôn mẫu, linh kiện cơ khí và thiết bị y tế.
              </p>
              <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-[#2a2620]">
                {[["3–6","Số trục"],["±0.005","Độ chính xác (mm)"],["14k","Tốc độ (RPM)"]].map(([v,l]) => (
                  <div key={l}>
                    <div className="font-display font-bold text-[32px] text-gold-2 tracking-[-.01em]">{v}</div>
                    <div className="font-mono text-[10px] text-[#7a7570] tracking-[.16em] uppercase mt-1.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-4/5 border overflow-hidden"
                 style={{ background:"linear-gradient(135deg, #1a1815, #0a0a08)", borderColor:"#2a2620" }}>
              <div className="absolute inset-4.5 border border-dashed border-gold opacity-25"></div>
              <div className="grid place-items-center h-full">
                <svg viewBox="0 0 200 250" className="w-3/4 h-3/4">
                  <rect x="40" y="60" width="120" height="40" fill="#cfc9b8" stroke="#8a8680"/>
                  <rect x="50" y="100" width="100" height="80" fill="#a8a499" stroke="#5a5650"/>
                  <rect x="90" y="20" width="20" height="40" fill="#3a3530"/>
                  <circle cx="100" cy="180" r="14" fill="#c8553d"/>
                </svg>
              </div>
              <div className="absolute top-4 right-4 font-mono text-[10px] tracking-[.18em] uppercase text-gold-2/60">+ DETAIL · 02</div>
              <div className="absolute bottom-4 left-4 font-mono text-[10px] tracking-[.18em] uppercase text-gold-2/60">SCALE 1 : 4</div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="py-20 bg-white border-b border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Workflow · 4 steps ]</span>
              <h2 className="qs-h2 mt-2">Quy trình vận hành</h2>
            </div>
            <p className="text-sm text-muted leading-[1.7] max-w-[44ch] m-0">
              Bộ điều khiển QS đảm nhiệm toàn bộ chuỗi từ nhập file CAD/CAM đến điều khiển servo và giám sát chu trình. Bốn bước dưới đây mô tả luồng dữ liệu và tín hiệu điển hình của một máy phay 3 trục.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-px bg-line border border-line">
            {workflow.map(s => (
              <div key={s.n} className="bg-white p-7 relative
                                         before:content-[''] before:absolute before:top-0 before:left-7 before:w-8 before:h-0.5 before:bg-gold">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">{s.n} {s.l}</div>
                <h3 className="font-display font-semibold text-lg mt-3 m-0 leading-[1.3]">{s.t}</h3>
                <p className="text-sm text-muted leading-[1.6] mt-2.5 m-0">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPEC TABLE */}
      <section className="py-20 bg-paper border-b border-line">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1fr_1.4fr] gap-16 items-start">
          <div>
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Specification ]</span>
            <h2 className="qs-h2 mt-2">Thông số kỹ thuật tham khảo</h2>
            <p className="text-[15px] leading-[1.7] text-[#3a3a3a] mt-5">
              Cấu hình điển hình cho một dòng máy phay 3 trục cỡ trung dùng controller QS Astro 6AH — phù hợp gia công khuôn mẫu, linh kiện cơ khí chính xác.
            </p>
            <div className="flex gap-3 mt-7">
              <Link className="qs-btn qs-btn-gold qs-btn-sm" href="/products/astro-6ah">Xem controller phù hợp</Link>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/downloads">Tải datasheet ↓</Link>
            </div>
          </div>
          <ul className="list-none p-0 m-0 border border-line bg-white">
            {specs.map(([l,v], i) => (
              <li key={l} className={`grid grid-cols-[200px_1fr] gap-4 px-5 py-4 ${i % 2 === 0 ? "bg-paper-2" : ""} ${i < specs.length - 1 ? "border-b border-line" : ""}`}>
                <span className="font-mono text-[11px] text-muted tracking-[.14em] uppercase">{l}</span>
                <span className="font-display text-[15px] font-semibold text-ink">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* DEPLOYMENTS */}
      <section className="py-20 bg-white border-b border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Field deployment ]</span>
              <h2 className="qs-h2 mt-2">Đã triển khai tại</h2>
            </div>
            <span className="font-mono text-[11px] text-muted tracking-[.1em] uppercase">3 of 14 dự án</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {deployments.map(d => (
              <div key={d.name} className="bg-white border border-line p-7 relative
                                            before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
                <h3 className="font-display font-semibold text-lg m-0 mb-2.5">{d.name}</h3>
                <p className="text-sm text-[#4a4842] leading-[1.7] m-0">{d.loc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RELATED + BACK */}
      <section className="py-20 bg-paper">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Next ]</span>
              <h2 className="qs-h2 mt-2">Ứng dụng liên quan</h2>
            </div>
            <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/applications">← Tất cả ứng dụng</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedApps.map(r => (
              <Link key={r.slug} href={`/applications/${r.slug}`}
                    className="bg-white border border-line p-7 hover:-translate-y-0.5 hover:border-ink transition-all">
                <span className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">Application {r.n}</span>
                <h3 className="font-display font-semibold text-lg m-0 mt-2.5">{r.t}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
