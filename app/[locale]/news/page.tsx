import type { Metadata } from "next";
import Link from "next/link";
import { getAllNews } from "@/lib/data/news";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildBreadcrumbList, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://qstech.vn";

const titles: Record<string, string> = {
  vi: "Tin tức & Sự kiện",
  en: "News & Events",
};
const descs: Record<string, string> = {
  vi: "Cập nhật mới nhất về sản phẩm, sự kiện và kỹ thuật từ QS Technology.",
  en: "Latest updates on products, events, and technology from QS Technology.",
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
    alternates: buildAlternates("/news"),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/news",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const tabs = [
  ["Tất cả",     "148"],
  ["Sản phẩm",   "42"],
  ["Sự kiện",    "28"],
  ["Khách hàng", "31"],
  ["Kỹ thuật",   "36"],
  ["Công ty",    "11"],
];

export default async function News({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const news = await getAllNews(locale);
  const feat = news[0];
  const rest = news.slice(1);
  const breadcrumb = buildBreadcrumbList([
    { name: locale === "en" ? "Home" : "Trang chủ", url: `${APP_URL}${locale === "en" ? "/en" : ""}` },
    { name: titles[locale] ?? titles.vi, url: `${APP_URL}${locale === "en" ? "/en" : ""}/news` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* HEAD */}
      <section className="relative overflow-hidden border-b border-line py-16 pb-14"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 flex justify-between items-end gap-8">
          <div>
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">Newsroom · Cập nhật Q1/2026</span>
            <h1 className="font-display font-bold text-[64px] tracking-[-.02em] mt-3.5 mb-0 leading-none">
              Tin tức &amp; <em className="not-italic bg-gold-grad bg-clip-text text-transparent">sự kiện</em>
            </h1>
          </div>
          <div className="font-mono text-[11px] text-muted tracking-[.16em] uppercase flex gap-8 items-center">
            <div><b className="text-ink font-display text-2xl font-bold tracking-[-.01em] normal-case block">148</b>bài viết</div>
            <div><b className="text-ink font-display text-2xl font-bold tracking-[-.01em] normal-case block">34</b>sự kiện 2026</div>
            <div><b className="text-ink font-display text-2xl font-bold tracking-[-.01em] normal-case block">06</b>chuyên mục</div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="bg-white border-b border-line sticky top-18 z-30">
        <div className="max-w-wrap mx-auto px-12 flex">
          {tabs.map(([t, c], i) => (
            <a key={t} href="#" className={`py-4 px-5 text-sm font-medium border-b-2 transition-colors ${i===0 ? "text-ink border-gold-2" : "text-[#5a5650] border-transparent hover:text-ink"}`}>
              {t}<span className="font-mono text-[10px] text-muted ml-1.5 tracking-widest">{c}</span>
            </a>
          ))}
        </div>
      </div>

      {/* FEATURED */}
      <section className="py-14 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase mb-5">[ Tin nổi bật ]</div>
          <Link href={`/news/${feat.slug}`}
                className="grid md:grid-cols-[1.3fr_1fr] bg-white border border-line hover:border-ink transition-colors">
            <div className="aspect-[5/3] bg-ink-2 border-r border-line overflow-hidden">
              <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
                <rect width="600" height="360" fill="#1a1815"/>
                <g fill="#3a3530"><rect x="60" y="80" width="200" height="200"/><rect x="280" y="80" width="120" height="200"/><rect x="420" y="80" width="120" height="200"/></g>
                <rect x="80" y="120" width="160" height="100" fill="#0a1a2a"/>
                <text x="100" y="150" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="#e8c878">QS · 2026</text>
                <text x="100" y="180" fontFamily="JetBrains Mono,monospace" fontSize="20" fill="#fff" fontWeight="700">ASTRO 12X</text>
                <circle cx="500" cy="180" r="20" fill="#c8553d"/>
              </svg>
            </div>
            <div className="p-12 flex flex-col justify-center">
              <span className="font-mono text-[10px] bg-gold text-ink-2 py-1 px-2.5 self-start tracking-[.16em] uppercase font-semibold">[ {feat.cat} ]</span>
              <h2 className="font-display font-bold text-[34px] tracking-[-.015em] leading-[1.15] mt-4 mb-4">{feat.title}</h2>
              <p className="text-[#3a3a3a] text-[15px] leading-[1.7] m-0 mb-5">{feat.excerpt}</p>
              <div className="font-mono text-[11px] text-muted tracking-[.14em] pt-4 border-t border-line flex justify-between">
                <span>{feat.date} · QS Newsroom</span><span>4 phút đọc →</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* GRID */}
      <section className="py-14 pb-16 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Bài viết · 02 of 148 ]</span>
              <h2 className="qs-h2 mt-2">Mới nhất ↓</h2>
            </div>
            <span className="font-mono text-[11px] text-muted tracking-[.1em] uppercase">{rest.length} bài</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {rest.map(n => (
              <Link key={n.slug} href={`/news/${n.slug}`}
                    className="bg-white border border-line flex flex-col hover:-translate-y-0.5 hover:border-ink transition-all">
                <div className="aspect-[5/3] border-b border-line bg-paper-2 overflow-hidden grid place-items-center">
                  <span className="font-mono text-[10px] text-muted tracking-[.16em]">FIG · {n.cat.toUpperCase()}</span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ {n.cat} ]</span>
                  <h3 className="font-display font-semibold text-lg leading-[1.35] tracking-[-.005em] mt-2.5 mb-3">{n.title}</h3>
                  <p className="text-[13px] text-[#5a5650] leading-[1.6] flex-1 m-0 mb-4">{n.excerpt}</p>
                  <div className="font-mono text-[10px] text-muted tracking-[.14em] pt-3.5 border-t border-line">{n.date}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* pagination */}
          <div className="flex justify-center gap-1.5 mt-12">
            <button className="px-4 h-9 border border-line grid place-items-center font-mono text-[11px] text-muted hover:border-ink hover:text-ink">← Trước</button>
            <button className="w-9 h-9 border border-ink bg-ink text-white grid place-items-center font-mono text-[11px]">1</button>
            <button className="w-9 h-9 border border-line grid place-items-center font-mono text-[11px] text-muted hover:border-ink hover:text-ink">2</button>
            <button className="w-9 h-9 border border-line grid place-items-center font-mono text-[11px] text-muted hover:border-ink hover:text-ink">3</button>
            <span className="w-9 h-9 grid place-items-center font-mono text-[11px] text-muted">…</span>
            <button className="w-9 h-9 border border-line grid place-items-center font-mono text-[11px] text-muted hover:border-ink hover:text-ink">25</button>
            <button className="px-4 h-9 border border-line grid place-items-center font-mono text-[11px] text-muted hover:border-ink hover:text-ink">Sau →</button>
          </div>

          {/* newsletter */}
          <div className="mt-16 bg-ink text-[#cfc9b8] p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="font-mono text-[10px] text-gold-2 tracking-[.16em] uppercase mb-2">[ Newsletter ]</div>
              <h3 className="font-display font-bold text-2xl text-white tracking-[-.01em] m-0">Nhận tin sản phẩm mới và<br/>cập nhật firmware qua email.</h3>
              <p className="text-[#a8a499] mt-2.5 max-w-[60ch] m-0 text-sm">Mỗi tháng một bản tin, không quảng cáo, hủy đăng ký bất kỳ lúc nào. Dành riêng cho khách hàng và đối tác QS.</p>
            </div>
            <form className="flex gap-0">
              <input className="px-5 py-3 bg-white text-ink border-0 outline-0 text-sm w-72" placeholder="email@cong-ty.vn"/>
              <button className="qs-btn qs-btn-gold rounded-none">Đăng ký →</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
