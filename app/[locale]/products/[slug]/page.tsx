import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProducts, getProductBySlug, getProductSlugs } from "@/lib/data/products";
import { routing } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function ProductDetail({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const p = await getProductBySlug(slug, locale);
  if (!p) notFound();
  const all = await getAllProducts(locale);
  const related = all.filter((x) => x.slug !== slug).slice(0, 3);

  const features = [
    { n:"01", t:"Hiệu năng vượt trội",     d:"Vi xử lý hiệu năng cao, độ phân giải 480×272 px" },
    { n:"02", t:"Tính năng đa dạng",       d:"Hồi tiếp encoder phase Z + tích hợp PLC ladder" },
    { n:"03", t:"Khả năng tùy biến cao",   d:"Mở rộng I/O, lập trình ứng dụng theo yêu cầu" },
  ];

  const accessories = [
    { n:"01", l:"Servo Motor × 4" },
    { n:"02", l:"Servo Drive × 4" },
    { n:"03", l:"I/O Link Board" },
    { n:"04", l:"24V Power Supply" },
    { n:"05", l:"MPG Pendant" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-12 pb-16">
          <div className="qs-crumb mb-8">
            <Link href="/">Trang chủ</Link><span className="sep">/</span>
            <Link href="/products">Sản phẩm</Link><span className="sep">/</span>
            <Link href="/products">Bộ điều khiển CNC</Link><span className="sep">/</span>
            <span className="here">{p.name}</span>
          </div>
          <div className="grid md:grid-cols-[1fr_1.1fr] gap-16 items-center">
            <div>
              <small className="block font-mono text-xs text-gold-1 tracking-[.18em] uppercase mb-3.5">Model · {p.name} · Series 2026</small>
              <h1 className="qs-h1">{p.tag}</h1>
              <div className="flex flex-col gap-3.5 mt-8">
                {features.map(f => (
                  <div key={f.n} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 border border-gold grid place-items-center font-mono text-[10px] text-gold-1 shrink-0 mt-0.5">{f.n}</div>
                    <div>
                      <b className="block font-semibold text-[15px]">{f.t}</b>
                      <span className="text-muted text-[13px]">{f.d}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-9">
                <Link className="qs-btn qs-btn-gold" href="#quote">Nhận báo giá →</Link>
                <Link className="qs-btn qs-btn-ghost" href="#specs">Xem thông số</Link>
              </div>
            </div>

            {/* visual */}
            <div className="bg-white border border-line p-10 relative">
              <div className="absolute inset-3 border border-dashed border-gold opacity-30 pointer-events-none"></div>
              <div className="aspect-square grid place-items-center">
                <div className="font-display font-bold text-7xl tracking-[-.02em] text-ink-3/30">{p.name}</div>
              </div>
              <div className="absolute bottom-3 right-4 font-mono text-[10px] tracking-[.18em] uppercase text-muted">QS · {p.name.toUpperCase()}</div>
              <div className="absolute bottom-3 left-4 font-mono text-[10px] tracking-[.18em] uppercase text-muted">0 — 100 — 200mm</div>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <section className="bg-white border-b border-line sticky top-[72px] z-30">
        <div className="max-w-wrap mx-auto px-12 flex gap-0">
          {[
            { n:"01", l:"Thông số kỹ thuật", h:"#specs" },
            { n:"02", l:"Tài liệu",          h:"#docs" },
            { n:"03", l:"Phần mềm",          h:"#sw" },
            { n:"04", l:"Bản vẽ",            h:"#drawing" },
          ].map((t, i) => (
            <a key={t.n} href={t.h} className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-baseline gap-3 ${i===0 ? "text-ink border-gold-2" : "text-[#5a5650] border-transparent hover:text-ink"}`}>
              <span className="font-mono text-[10px] text-gold-1 tracking-[.16em]">{t.n}</span>
              {t.l}
            </a>
          ))}
        </div>
      </section>

      {/* SPECS + QUOTE */}
      <section className="py-20 bg-white" id="specs">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1.4fr_1fr] gap-16 items-start">
          <div>
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ 01 · Thông số kỹ thuật ]</span>
            <h2 className="qs-h2 mt-2 mb-6">Bảng spec đầy đủ</h2>
            <ul className="list-none p-0 m-0 border border-line bg-white">
              {p.specs.map((s, i) => (
                <li key={s.l} className={`grid grid-cols-[200px_1fr] gap-4 px-5 py-4 ${i % 2 === 0 ? "bg-paper" : ""} ${i < p.specs.length - 1 ? "border-b border-line" : ""}`}>
                  <span className="font-mono text-[11px] text-muted tracking-[.14em] uppercase">{s.l}</span>
                  <span className="font-display text-[15px] font-semibold text-ink">{s.v}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside id="quote" className="bg-paper border border-line p-7 sticky top-32">
            <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ Yêu cầu báo giá {p.name} ]</div>
            <h3 className="font-display font-semibold text-xl tracking-[-.005em] mt-2 mb-2">Nhận báo giá nhanh</h3>
            <p className="text-[13px] text-muted leading-[1.6] m-0 mb-5">Phản hồi trong vòng 24 giờ làm việc · giá đại lý cho đơn hàng ≥ 10 cái.</p>
            <Link className="qs-btn qs-btn-gold w-full justify-center" href="/contact">Nhận báo giá →</Link>
          </aside>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="py-20 bg-paper border-y border-line">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1fr_2fr] gap-16">
          <div>
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Tổng quan ]</span>
            <h2 className="qs-h2 mt-2">Mô tả sản phẩm</h2>
          </div>
          <div className="text-[15px] leading-[1.85] text-[#3a3a3a]">
            <p className="m-0 mb-4.5">{p.desc}</p>
            <p className="m-0 mb-4.5">Với bộ vi xử lý hiệu năng cao, kích thước màn hình {p.display} giúp người dùng có thể dễ dàng theo dõi các thông số, thông tin hiển thị trên bộ điều khiển.</p>
            <p className="m-0">Thiết kế chống nhiễu công nghiệp với cấp bảo vệ IP54 cho phép vận hành trong môi trường nhà máy khắc nghiệt. Các port I/O sử dụng kết nối tiêu chuẩn, dễ dàng tích hợp với hệ thống servo có sẵn.</p>
          </div>
        </div>
      </section>

      {/* PACKAGE */}
      <section className="py-20 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Hệ thống tích hợp · {p.name} ]</span>
              <h2 className="qs-h2 mt-2">CNC Controller — Full Package</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-5 gap-px bg-line border border-line">
            {accessories.map(a => (
              <div key={a.n} className="bg-white p-6 flex flex-col gap-3">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em]">[ {a.n} ]</div>
                <div className="aspect-square bg-paper border border-line grid place-items-center">
                  <span className="font-mono text-[10px] text-muted tracking-[.14em]">FIG · {a.n}</span>
                </div>
                <div className="font-display font-semibold text-[15px] text-ink leading-[1.35]">{a.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section className="py-20 bg-paper">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ 05 / Same family ]</span>
              <h2 className="qs-h2 mt-2">Các sản phẩm liên quan</h2>
            </div>
            <div className="flex gap-2">
              <button className="w-9 h-9 border border-line grid place-items-center hover:border-ink">‹</button>
              <button className="w-9 h-9 border border-line grid place-items-center hover:border-ink">›</button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map(r => (
              <Link key={r.slug} href={`/products/${r.slug}`}
                    className="bg-white border border-line p-6 flex flex-col gap-4 hover:-translate-y-0.5 hover:border-ink transition-all">
                <div className="aspect-[5/3] border border-line grid place-items-center"
                     style={{background:"radial-gradient(circle, #fff, #f0eee8)"}}>
                  <span className="font-display text-2xl font-bold tracking-tight text-ink-3/40">{r.name}</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg m-0">{r.name}</h3>
                  <span className="font-mono text-[11px] text-muted tracking-[.12em] uppercase">{r.axes} · {r.display}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white border-t border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="bg-ink text-[#cfc9b8] p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h3 className="font-display font-bold text-3xl text-white tracking-[-.01em] m-0">Cần tư vấn cấu hình {p.name}?</h3>
              <p className="text-[#a8a499] mt-2 max-w-[60ch] m-0 text-[15px]">Kỹ sư QS hỗ trợ chọn cấu hình I/O, sơ đồ đấu nối và driver phù hợp với từng dòng máy CNC.</p>
            </div>
            <Link className="qs-btn qs-btn-gold" href="/contact">Liên hệ kỹ thuật →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
