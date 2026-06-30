import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts } from "@/lib/data/products";
import { ProductBundleCard } from "@/components/products/product-bundle-card";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildBreadcrumbList, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://qstech.vn";

const titles: Record<string, string> = {
  vi: "Bộ điều khiển CNC",
  en: "CNC Controllers",
};
const descs: Record<string, string> = {
  vi: "Sáu dòng controller cho mọi cấu hình máy — từ phay 3 trục cơ bản đến hệ thống 6 trục công nghiệp với màn hình cảm ứng và EtherCAT.",
  en: "Six controller lines for every machine configuration — from basic 3-axis milling to 6-axis industrial systems with touch screen and EtherCAT.",
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
    alternates: buildAlternates("/products"),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/products",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Products({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const products = await getAllProducts(locale);
  const breadcrumb = buildBreadcrumbList([
    { name: locale === "en" ? "Home" : "Trang chủ", url: `${APP_URL}${locale === "en" ? "/en" : ""}` },
    { name: titles[locale] ?? titles.vi, url: `${APP_URL}${locale === "en" ? "/en" : ""}/products` },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
        style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-12 pb-14">
          <div className="qs-crumb mb-8">
            <Link href="/">Trang chủ</Link><span className="sep">/</span>
            <Link href="#">Sản phẩm</Link><span className="sep">/</span>
            <span className="here">Bộ điều khiển CNC</span>
          </div>
          <div className="grid md:grid-cols-[1fr_1.4fr] gap-12 items-center">
            <div>
              <div className="qs-eyebrow">QS Controller Serires · Controller Series</div>
              <h1 className="qs-h1 mt-3.5" style={{ fontSize: "54px" }}>Bộ điều khiển CNC</h1>
              <p className="qs-lede mt-4">Thông qua việc tự chủ về công nghệ, QS Controller mang lại khả năng tùy biến linh hoạt và đa dạng chức năng. Nhờ đó, hệ thống dễ dàng phát triển mở rộng để đáp ứng trọn vẹn mọi yêu cầu chuyên biệt của khách hàng.</p>
              <div className="mt-7 flex flex-col gap-2.5">
                {["Hiệu năng vượt trội", "Tính năng đa dạng", "Khả năng tùy biến cao"].map(f => (
                  <div key={f} className="flex items-center gap-3.5 text-sm
                                          before:content-[''] before:block before:w-6 before:h-px before:bg-gold">{f}</div>
                ))}
              </div>
              <div className="flex gap-3 mt-7">
                <Link className="qs-btn qs-btn-ghost" href="/downloads">QS Products Catalog</Link>
              </div>
            </div>
            <div className="relative aspect-16/10 bg-white border border-line p-6 overflow-hidden">
              <div className="absolute inset-3 border border-dashed border-gold opacity-30 pointer-events-none"></div>
              <div className="absolute bottom-4 left-6 font-mono text-[10px] tracking-[.18em] uppercase text-muted">[ Series 2026 · F + Astro ]</div>
              <svg viewBox="0 0 540 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <linearGradient id="cat-m" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e8e6e0" /><stop offset="1" stopColor="#a8a499" /></linearGradient>
                  <linearGradient id="cat-s" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1a3a52" /><stop offset="1" stopColor="#0a1a2a" /></linearGradient>
                </defs>
                <g opacity=".7">
                  <rect x="20" y="40" width="140" height="100" fill="url(#cat-m)" stroke="#8a8680" rx="4" />
                  <rect x="30" y="50" width="80" height="60" fill="url(#cat-s)" />
                  <rect x="170" y="60" width="120" height="80" fill="url(#cat-m)" stroke="#8a8680" rx="4" />
                  <rect x="180" y="70" width="60" height="40" fill="url(#cat-s)" />
                </g>
                <rect x="200" y="100" width="180" height="180" fill="url(#cat-m)" stroke="#6a6660" rx="6" />
                <rect x="216" y="116" width="100" height="80" fill="url(#cat-s)" />
                <text x="226" y="132" fontFamily="JetBrains Mono,monospace" fontSize="8" fill="#5ab8e0">QS COORD</text>
                <text x="226" y="152" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="#fff" fontWeight="700">X 279.030</text>
                <text x="226" y="168" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="#fff" fontWeight="700">Y 235.003</text>
                <text x="226" y="184" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="#e8c878" fontWeight="700">Z 102.322</text>
                <circle cx="370" cy="232" r="14" fill="#c8553d" />
                <g transform="translate(40,200)" opacity=".9">
                  <rect x="0" y="0" width="140" height="80" fill="#3a8d4d" />
                  <g fill="#e8c878"><rect x="6" y="6" width="20" height="8" /><rect x="30" y="6" width="20" height="8" /><rect x="54" y="6" width="20" height="8" /><rect x="78" y="6" width="20" height="8" /></g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="py-16" id="list">
        <div className="max-w-wrap mx-auto px-12">
          <div className="grid md:grid-cols-[240px_1fr] gap-16">
            {/* sidebar */}
            <aside>
              <h4 className="font-mono text-[11px] tracking-[.16em] uppercase text-ink m-0 mb-4 pb-3.5 border-b border-ink">Bộ điều khiển máy CNC</h4>
              <ul className="list-none p-0 m-0">
                {[
                  { n: "Máy phay", c: "▾", open: true },
                  { n: "Máy uốn ống", c: "›" },
                  { n: "Máy uốn lò xo", c: "›" },
                  { n: "Máy cưa lọng", c: "›" },
                  { n: "Máy làm mộng", c: "›" },
                  { n: "Máy dán keo", c: "›" },
                  { n: "Máy hàn / cắt plasma", c: "›" },
                  { n: "Máy kim hoàn", c: "›" },
                ].map(({ n, c, open }) => (
                  <li key={n} className="border-b border-line">
                    <a href="#" className="flex justify-between items-center py-3 text-sm font-medium">
                      {n}<span className="text-gold-1">{c}</span>
                    </a>
                    {open ? (
                      <ul className="pb-3 list-none m-0 p-0">
                        {["Máy 3 trục", "Máy 4 trục", "Máy 5 trục", "Máy 6 trục"].map((s, i) => (
                          <li key={s} className="border-0">
                            <a href="#" className={`block py-1.5 px-3 text-[13px] border-l ${i === 0 ? "text-ink border-gold font-medium" : "text-muted border-line"}`}>{s}</a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
              <div className="mt-8 bg-white border border-line p-5">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-2">Hỗ trợ kỹ thuật</div>
                <p className="m-0 text-[13px] text-muted leading-[1.6]">+84 28 3636 1234<br />tech@qstechnology.vn</p>
                <Link className="qs-btn qs-btn-sm mt-3.5" href="/contact">Liên hệ ngay</Link>
              </div>
            </aside>

            {/* list */}
            <main>
              <div className="flex justify-between items-center bg-white border border-line px-6 py-4 mb-6">
                <div className="flex gap-6 items-center">
                  <span className="font-mono text-xs tracking-widest text-muted">Hiển thị <b className="text-ink font-semibold">06</b> / 06 model</span>
                  <div className="flex gap-1.5">
                    {["Bộ SP tiêu chuẩn", "F-series", "Astro", "Cảm ứng"].map((c, i) => (
                      <button key={c} className={`px-3 py-1.5 font-mono text-[11px] tracking-widest uppercase border ${i === 0 ? "bg-ink text-white border-ink" : "border-line text-muted"}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="font-mono text-[11px] text-muted tracking-widest uppercase">Sắp xếp</span>
                  <select className="font-mono text-[11px] tracking-[.08em] uppercase border border-line py-1.5 px-3 bg-white">
                    <option>Mới nhất</option><option>Số trục ↑</option><option>Màn hình ↑</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {products.map((p, i) => (
                  <ProductBundleCard key={p.slug} product={p} index={i} total={products.length} />
                ))}
              </div>
            </main>
          </div>
        </div>
      </section>
    </>
  );
}
