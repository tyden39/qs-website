import type { Metadata } from "next";
import Link from "next/link";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildBreadcrumbList, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://qstech.vn";

const titles: Record<string, string> = {
  vi: "Ứng dụng công nghiệp",
  en: "Industrial Applications",
};
const descs: Record<string, string> = {
  vi: "Bộ điều khiển QS đang vận hành trong nhiều loại máy gia công — từ phay kim loại đến uốn lò xo, dán keo và chế biến thực phẩm.",
  en: "QS controllers operate across many machine types — from metal milling to spring bending, gluing, and food processing.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = titles[locale] ?? titles.vi;
  const description = descs[locale] ?? descs.vi;
  return {
    title,
    description,
    alternates: buildAlternates("/applications"),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/applications",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const apps = [
  { slug:"phay-cnc",         n:"01", t:"Phay CNC",      machine:"Máy Phay CNC" },
  { slug:"cua-long",         n:"02", t:"Cưa Lọng",      machine:"Máy Cưa Lọng" },
  { slug:"dan-keo",          n:"03", t:"Dán Keo",       machine:"Máy Dán Keo" },
  { slug:"thuc-pham",        n:"04", t:"Thực Phẩm",     machine:"Máy Cắt Thực Phẩm" },
  { slug:"uon-lo-xo",        n:"05", t:"Lò Xo",         machine:"Máy Uốn Lò Xo" },
  { slug:"mong-go",          n:"06", t:"Mộng Gỗ",       machine:"Máy Làm Mộng" },
  { slug:"kim-hoan",         n:"07", t:"Kim Hoàn",      machine:"Máy Kim Hoàn" },
];

export default async function Applications({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const breadcrumb = buildBreadcrumbList([
    { name: locale === "en" ? "Home" : "Trang chủ", url: `${APP_URL}${locale === "en" ? "/en" : ""}` },
    { name: titles[locale] ?? titles.vi, url: `${APP_URL}${locale === "en" ? "/en" : ""}/applications` },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-12 pb-14">
          <div className="qs-crumb mb-6">
            <Link href="/">Trang chủ</Link><span className="sep">/</span>
            <span className="here">Ứng dụng</span>
          </div>
          <div className="grid md:grid-cols-[1fr_1.4fr] gap-16 items-center">
            <div>
              <div className="qs-eyebrow">Industrial Applications</div>
              <h1 className="qs-h1 mt-3.5" style={{fontSize:"clamp(48px,6vw,80px)"}}>Ứng Dụng</h1>
              <p className="qs-lede mt-5">
                Bộ điều khiển QS đang vận hành trong tám loại máy gia công khác nhau — từ phay kim loại đến uốn lò xo, dán keo và chế biến thực phẩm. Mỗi case study là một bài toán kỹ thuật riêng.
              </p>
              <div className="grid grid-cols-3 gap-6 mt-10 pt-6 border-t border-line">
                {[["8","Loại ứng dụng"],["800+","Hệ thống đã giao"],["12","Năm vận hành"]].map(([v,l]) => (
                  <div key={l}>
                    <div className="font-display font-bold text-[28px] tracking-[-.01em]">{v}</div>
                    <div className="font-mono text-[10px] text-muted tracking-[.16em] uppercase mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* PCB visual */}
            <div className="relative aspect-video border overflow-hidden"
                 style={{ background:"linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)", borderColor:"#2a2a2a" }}>
              <svg viewBox="0 0 600 340" className="w-full h-full">
                <g stroke="#c9a35a" strokeWidth=".5" fill="none" opacity=".4">
                  <path d="M0 60 L300 60 L340 100 L600 100"/>
                  <path d="M0 140 L240 140 L280 100 L600 110"/>
                  <path d="M0 220 L260 220 L300 180 L600 180"/>
                  <path d="M0 280 L320 280 L360 240 L600 250"/>
                </g>
                <rect x="240" y="80" width="120" height="180" fill="#1a1815" stroke="#c9a35a"/>
                <text x="300" y="180" fontFamily="Inter Tight,sans-serif" fontSize="32" fontWeight="800" fill="#c9a35a" textAnchor="middle">QS</text>
                <g fill="#3a8d4d" opacity=".7">
                  <rect x="60" y="60" width="80" height="60"/>
                  <rect x="60" y="140" width="80" height="60"/>
                  <rect x="440" y="60" width="80" height="60"/>
                  <rect x="440" y="140" width="80" height="60"/>
                </g>
              </svg>
              <div className="absolute top-3.5 right-3.5 w-16 h-px bg-gold"></div>
              <div className="absolute bottom-3.5 left-3.5 font-mono text-[10px] text-gold-2 tracking-[.18em] uppercase">PCB · QS TECHNOLOGY · v2026</div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-16 bg-white border-b border-line">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1fr_2fr] gap-16">
          <div>
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Overview ]</span>
            <h2 className="qs-h2 mt-2">Một bộ điều khiển — tám loại máy</h2>
          </div>
          <div className="text-[17px] leading-[1.7] text-[#3a3a3a]">
            <p className="m-0 mb-3.5">
              Cùng một dòng controller QS có thể được cấu hình cho nhiều loại máy gia công khác nhau, từ phay CNC tiêu chuẩn đến các máy chuyên dụng như uốn lò xo và dán keo. Khả năng mở rộng I/O và tích hợp PLC ladder cho phép tùy biến cho từng ứng dụng cụ thể.
            </p>
            <p className="m-0">
              Mỗi case study dưới đây là một bài toán kỹ thuật thực tế đã được QS triển khai cho các xưởng cơ khí, gỗ, kim hoàn và thực phẩm tại Việt Nam — từ Hà Nội đến Cần Thơ.
            </p>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="py-20 bg-white" id="list">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Catalog · 01 / 02 ]</span>
              <h2 className="qs-h2 mt-2">Ứng Dụng Công Nghiệp</h2>
            </div>
            <span className="font-mono text-[11px] text-muted tracking-[.1em] uppercase">7 / 14 case studies</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line">
            {apps.map(a => (
              <Link key={a.slug} href={`/applications/${a.slug}`}
                    className="bg-white p-6 flex flex-col gap-4 hover:bg-paper transition-colors relative
                               before:content-[''] before:absolute before:top-0 before:left-6 before:w-8 before:h-0.5 before:bg-gold">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ {a.n} ] {a.t}</div>
                <div className="aspect-[5/4] border border-line grid place-items-center"
                     style={{background:"radial-gradient(circle, #fff, #f0eee8)"}}>
                  <span className="font-mono text-[10px] text-muted tracking-[.16em]">FIG · {a.n}</span>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-muted tracking-[.16em] uppercase">Bộ điều khiển cho</div>
                  <h3 className="font-display font-semibold text-[17px] m-0 mt-1.5 leading-[1.3]">{a.machine}</h3>
                </div>
                <div className="flex justify-between items-center pt-3 mt-auto border-t border-line font-mono text-[10px] tracking-[.12em] uppercase">
                  <span>Chi tiết</span><span>→</span>
                </div>
              </Link>
            ))}
            <div className="bg-ink text-[#cfc9b8] p-6 flex flex-col items-center justify-center gap-3">
              <div className="font-display font-bold text-3xl text-gold-2 tracking-[-.01em]">+ 07</div>
              <div className="font-mono text-[10px] text-[#a8a499] tracking-[.16em] uppercase">more</div>
            </div>
          </div>

          {/* PDF CTA + pagination */}
          <div className="mt-12 flex justify-between items-end gap-6">
            <div className="bg-paper border border-line p-7 flex-1 flex justify-between items-center gap-6">
              <div>
                <h4 className="font-display font-semibold text-lg m-0">Tải catalogue đầy đủ</h4>
                <p className="m-0 mt-1 text-sm text-muted">Hơn 14 ứng dụng đã triển khai cho khách hàng trong và ngoài nước.</p>
              </div>
              <Link className="qs-btn qs-btn-gold qs-btn-sm" href="/downloads">Tải PDF ↓</Link>
            </div>
            <div className="flex gap-1.5">
              <button className="w-9 h-9 border border-line grid place-items-center text-muted hover:border-ink hover:text-ink">‹</button>
              <button className="w-9 h-9 border border-ink bg-ink text-white grid place-items-center font-mono text-[11px]">1</button>
              <button className="w-9 h-9 border border-line grid place-items-center font-mono text-[11px] text-muted hover:border-ink hover:text-ink">2</button>
              <button className="w-9 h-9 border border-line grid place-items-center text-muted hover:border-ink hover:text-ink">›</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
