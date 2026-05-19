import Link from "next/link";
import { getAllProducts } from "@/lib/data/products";
import type { Locale } from "@/lib/i18n/config";

export const metadata = { title: "Bộ điều khiển CNC — QS Technology" };

export default async function Products({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const products = await getAllProducts(locale);
  return (
    <>
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
              <div className="qs-eyebrow">Catalog · Controller Series</div>
              <h1 className="qs-h1 mt-3.5" style={{fontSize:"54px"}}>Bộ điều khiển CNC</h1>
              <p className="qs-lede mt-4">Sáu dòng controller cho mọi cấu hình máy — từ phay 3 trục cơ bản đến hệ thống 6 trục công nghiệp với màn hình cảm ứng và Ethercat.</p>
              <div className="mt-7 flex flex-col gap-2.5">
                {["Hiệu năng vượt trội","Tính năng đa dạng","Khả năng tùy biến cao"].map(f => (
                  <div key={f} className="flex items-center gap-3.5 text-sm
                                          before:content-[''] before:block before:w-6 before:h-px before:bg-gold">{f}</div>
                ))}
              </div>
              <div className="flex gap-3 mt-7">
                <Link className="qs-btn qs-btn-gold" href="#list">Xem 6 model <span className="arr">↓</span></Link>
                <Link className="qs-btn qs-btn-ghost" href="/downloads">Tải catalogue PDF</Link>
              </div>
            </div>
            <div className="relative aspect-16/10 bg-white border border-line p-6 overflow-hidden">
              <div className="absolute inset-3 border border-dashed border-gold opacity-30 pointer-events-none"></div>
              <div className="absolute bottom-4 left-6 font-mono text-[10px] tracking-[.18em] uppercase text-muted">[ Series 2026 · F + Astro ]</div>
              <svg viewBox="0 0 540 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <linearGradient id="cat-m" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e8e6e0"/><stop offset="1" stopColor="#a8a499"/></linearGradient>
                  <linearGradient id="cat-s" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1a3a52"/><stop offset="1" stopColor="#0a1a2a"/></linearGradient>
                </defs>
                <g opacity=".7">
                  <rect x="20" y="40" width="140" height="100" fill="url(#cat-m)" stroke="#8a8680" rx="4"/>
                  <rect x="30" y="50" width="80" height="60" fill="url(#cat-s)"/>
                  <rect x="170" y="60" width="120" height="80" fill="url(#cat-m)" stroke="#8a8680" rx="4"/>
                  <rect x="180" y="70" width="60" height="40" fill="url(#cat-s)"/>
                </g>
                <rect x="200" y="100" width="180" height="180" fill="url(#cat-m)" stroke="#6a6660" rx="6"/>
                <rect x="216" y="116" width="100" height="80" fill="url(#cat-s)"/>
                <text x="226" y="132" fontFamily="JetBrains Mono,monospace" fontSize="8" fill="#5ab8e0">QS COORD</text>
                <text x="226" y="152" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="#fff" fontWeight="700">X 279.030</text>
                <text x="226" y="168" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="#fff" fontWeight="700">Y 235.003</text>
                <text x="226" y="184" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="#e8c878" fontWeight="700">Z 102.322</text>
                <circle cx="370" cy="232" r="14" fill="#c8553d"/>
                <g transform="translate(40,200)" opacity=".9">
                  <rect x="0" y="0" width="140" height="80" fill="#3a8d4d"/>
                  <g fill="#e8c878"><rect x="6" y="6" width="20" height="8"/><rect x="30" y="6" width="20" height="8"/><rect x="54" y="6" width="20" height="8"/><rect x="78" y="6" width="20" height="8"/></g>
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
                  { n:"Máy phay", c:"▾", open:true },
                  { n:"Máy uốn ống", c:"›" },
                  { n:"Máy uốn lò xo", c:"›" },
                  { n:"Máy cưa lọng", c:"›" },
                  { n:"Máy làm mộng", c:"›" },
                  { n:"Máy dán keo", c:"›" },
                  { n:"Máy hàn / cắt plasma", c:"›" },
                  { n:"Máy kim hoàn", c:"›" },
                ].map(({n,c,open}) => (
                  <li key={n} className="border-b border-line">
                    <a href="#" className="flex justify-between items-center py-3 text-sm font-medium">
                      {n}<span className="text-gold-1">{c}</span>
                    </a>
                    {open ? (
                      <ul className="pb-3 list-none m-0 p-0">
                        {["Máy 3 trục","Máy 4 trục","Máy 5 trục","Máy 6 trục"].map((s, i) => (
                          <li key={s} className="border-0">
                            <a href="#" className={`block py-1.5 px-3 text-[13px] border-l ${i===0 ? "text-ink border-gold font-medium" : "text-muted border-line"}`}>{s}</a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
              <div className="mt-8 bg-white border border-line p-5">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-2">Hỗ trợ kỹ thuật</div>
                <p className="m-0 text-[13px] text-muted leading-[1.6]">+84 28 3636 1234<br/>tech@qstechnology.vn</p>
                <Link className="qs-btn qs-btn-sm mt-3.5" href="/contact">Liên hệ ngay</Link>
              </div>
            </aside>

            {/* list */}
            <main>
              <div className="flex justify-between items-center bg-white border border-line px-6 py-4 mb-6">
                <div className="flex gap-6 items-center">
                  <span className="font-mono text-xs tracking-widest text-muted">Hiển thị <b className="text-ink font-semibold">06</b> / 06 model</span>
                  <div className="flex gap-1.5">
                    {["Máy 3 trục","F-series","Astro","Cảm ứng"].map((c, i) => (
                      <button key={c} className={`px-3 py-1.5 font-mono text-[11px] tracking-widest uppercase border ${i===0 ? "bg-ink text-white border-ink" : "border-line text-muted"}`}>{c}</button>
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

              <div className="flex flex-col gap-4">
                {products.map((p, i) => (
                  <Link key={p.slug} href={`/products/${p.slug}`}
                        className="bg-white border border-line grid grid-cols-[160px_200px_1fr_56px] items-stretch relative
                                   hover:border-ink-3 hover:-translate-y-0.5 transition-all">
                    <div className="bg-paper border-r border-line p-6 flex flex-col items-center justify-center text-center gap-2.5 relative
                                    after:content-[''] after:absolute after:top-0 after:-right-px after:w-px after:h-8 after:bg-gold">
                      <div className="font-mono text-[10px] tracking-[.16em] uppercase text-muted">Bộ sản phẩm cho</div>
                      <div>
                        <div className="font-display font-extrabold text-[34px] tracking-[-.02em] bg-gold-grad bg-clip-text text-transparent leading-none">3</div>
                        <div className="font-mono text-[11px] tracking-[.14em] text-gold-1 uppercase">Trục</div>
                      </div>
                      {p.badge === "Recommended" && <div className="font-mono text-[9px] tracking-[.16em] text-gold-1 uppercase">[ Recommended ]</div>}
                      {p.badge === "Touch" && <div className="font-mono text-[9px] tracking-[.16em] text-[#3a8d4d] uppercase">[ Touch ]</div>}
                      {p.badge === "Flagship" && <div className="font-mono text-[9px] tracking-[.16em] text-[#3a8d4d] uppercase">[ Flagship ]</div>}
                    </div>
                    <div className="border-r border-line grid place-items-center p-4"
                         style={{background:"radial-gradient(circle, #fff, #f0eee8)"}}>
                      <span className="font-display text-3xl font-bold tracking-tight text-ink-3/40">{p.name}</span>
                    </div>
                    <div className="p-6 flex flex-col justify-center border-r border-line">
                      <div className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase mb-1.5">Model {String(i+1).padStart(2,"0")} / 06</div>
                      <h3 className="font-display font-bold text-[22px] tracking-[-.01em] m-0 mb-3">
                        {p.name}
                        {p.slug === "f10t" && <span className="font-mono text-[11px] text-gold-1 tracking-widest uppercase font-normal ml-2">(Cảm ứng)</span>}
                      </h3>
                      <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
                        {p.bullets.map(b => (
                          <li key={b} className="text-[13px] text-[#3a3a3a] flex gap-2.5 before:content-['—'] before:text-gold-1 before:font-mono">
                            {b.includes(":") ? (
                              <>
                                {b.split(":")[0]}: <b className="font-semibold">{b.split(":").slice(1).join(":").trim()}</b>
                              </>
                            ) : b}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid place-items-center">
                      <div className="w-8 h-8 border border-ink grid place-items-center bg-white text-ink transition-colors">›</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* compare CTA */}
              <div className="mt-12 bg-ink text-[#cfc9b8] p-10 grid md:grid-cols-[1fr_auto] gap-8 items-center">
                <div>
                  <h4 className="font-display font-bold text-2xl text-white tracking-[-.01em] m-0">Không chắc chọn model nào?</h4>
                  <p className="m-0 mt-1.5 text-[#a8a499] text-sm max-w-[50ch]">Tải bảng so sánh thông số chi tiết của cả 6 dòng controller — F-series và Astro-series — đặt cạnh nhau.</p>
                </div>
                <Link className="qs-btn qs-btn-gold" href="/downloads">Tải bảng so sánh PDF <span className="arr">↓</span></Link>
              </div>
            </main>
          </div>
        </div>
      </section>
    </>
  );
}
