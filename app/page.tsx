import Link from "next/link";
import { products } from "@/data/products";
import { news } from "@/data/news";

export default function Home() {
  // Template uses F54, F10T, Astro 10i in product strip
  const featProducts = ["f54", "f10t", "astro-10i"]
    .map(s => products.find(p => p.slug === s)!)
    .filter(Boolean);
  const featNews = news[0];
  const restNews = news.slice(1, 5);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-16 pb-20">
          <div className="grid md:grid-cols-[1.05fr_1fr] gap-16 items-center">
            <div>
              <div className="qs-eyebrow">QS Technology · Made in Vietnam · 2026</div>
              <h1 className="qs-h1 mt-3.5" style={{fontSize:"clamp(56px,7vw,96px)", lineHeight:".95"}}>
                Bộ điều khiển<br/>
                <em className="not-italic font-semibold bg-gold-grad bg-clip-text text-transparent">CNC</em> chế tạo<br/>
                tại Việt Nam.
              </h1>
              <p className="mt-6 text-lg leading-[1.65] text-[#3a3a3a] max-w-[55ch]">
                Sáu dòng controller cho phay, uốn, dán keo, kim hoàn — phần cứng QS, firmware QS, hỗ trợ kỹ thuật trong nước. Đã triển khai trên 800+ dây chuyền tại Việt Nam và khu vực.
              </p>
              <div className="flex gap-3 mt-8">
                <Link className="qs-btn qs-btn-gold" href="/products">Xem 6 model controller →</Link>
                <Link className="qs-btn qs-btn-ghost" href="/services">Đặt chế tạo riêng</Link>
              </div>
              <div className="mt-12 pt-6 border-t border-line flex gap-8 items-center font-mono text-[11px] text-muted tracking-[.14em] uppercase">
                <div><b className="block text-ink font-display text-2xl font-bold tracking-[-.01em] normal-case">12</b>năm kinh nghiệm</div>
                <div><b className="block text-ink font-display text-2xl font-bold tracking-[-.01em] normal-case">800+</b>hệ thống đã giao</div>
                <div><b className="block text-ink font-display text-2xl font-bold tracking-[-.01em] normal-case">14</b>loại ứng dụng</div>
              </div>
            </div>

            {/* hero visual */}
            <div className="relative bg-white border border-line p-6 aspect-[4/5]">
              <div className="absolute inset-3.5 border border-dashed border-gold opacity-30 pointer-events-none"></div>
              <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <linearGradient id="hm-m" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#e8e6e0"/><stop offset="1" stopColor="#a8a499"/>
                  </linearGradient>
                  <linearGradient id="hm-s" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#1a3a52"/><stop offset="1" stopColor="#0a1a2a"/>
                  </linearGradient>
                </defs>
                <rect x="40" y="60" width="320" height="380" fill="url(#hm-m)" stroke="#6a6660" strokeWidth="2" rx="6"/>
                <rect x="60" y="80" width="200" height="140" fill="url(#hm-s)"/>
                <text x="74" y="104" fontFamily="JetBrains Mono,monospace" fontSize="10" fill="#5ab8e0">QS COORD · MM</text>
                <text x="74" y="138" fontFamily="JetBrains Mono,monospace" fontSize="20" fill="#fff" fontWeight="700">X 279.030</text>
                <text x="74" y="166" fontFamily="JetBrains Mono,monospace" fontSize="20" fill="#fff" fontWeight="700">Y 235.003</text>
                <text x="74" y="194" fontFamily="JetBrains Mono,monospace" fontSize="20" fill="#e8c878" fontWeight="700">Z 102.322</text>
                <g fill="#3a3530">
                  {[80,108,136,164,192].map(y =>
                    [270,298,326].map(x => <rect key={`${x}-${y}`} x={x} y={y} width="22" height="22"/>)
                  )}
                </g>
                <g fill="#2a2520">
                  <rect x="60" y="240" width="80" height="80"/>
                  <rect x="148" y="240" width="80" height="80"/>
                  <rect x="236" y="240" width="80" height="80"/>
                </g>
                <circle cx="340" cy="280" r="22" fill="#c8553d"/>
                <circle cx="340" cy="280" r="10" fill="#e8c878"/>
                <g transform="translate(60,340)" fill="#cfc9b8" stroke="#5a5650">
                  <rect x="0" y="0" width="60" height="60"/>
                  <rect x="80" y="0" width="60" height="60"/>
                  <rect x="160" y="0" width="60" height="60"/>
                  <rect x="240" y="0" width="60" height="60"/>
                </g>
                <text x="200" y="430" fontFamily="JetBrains Mono,monospace" fontSize="9" fill="#3a3530" textAnchor="middle">QS · ASTRO 6AH · 6-AXIS</text>
              </svg>
              <div className="absolute bottom-4 left-6 font-mono text-[9px] tracking-[.18em] uppercase text-muted">FIG. 01 · CNC CONTROLLER · ASTRO 6AH</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT STRIP */}
      <section className="py-24 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Catalog · 03 of 06 ]</span>
              <h2 className="qs-h2 mt-2">Sản phẩm chủ lực</h2>
            </div>
            <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/products">Xem tất cả 6 model →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line">
            {[
              { p: featProducts[0], lbl: "[ F-series · 01 ]", desc: "Controller 5-inch cho máy phay 3 trục cơ bản, vòng hở, lý tưởng cho xưởng cơ khí nhỏ.", meta: "3 trục · 5\"" },
              { p: featProducts[1], lbl: "[ F-series · 03 ]", desc: "Controller cảm ứng 10.4-inch, hỗ trợ tới 6 trục, giao diện touch-friendly cho vận hành nhanh.", meta: "6 trục · 10.4\" Touch", suffix: "Cảm ứng" },
              { p: featProducts[2], lbl: "[ Astro · 06 ]",     desc: "Flagship 6 trục vòng kín, EtherCAT, cho gia công khuôn mẫu và linh kiện y tế chính xác cao.", meta: "6 trục · Vòng kín" },
            ].map(item => item.p && (
              <Link key={item.p.slug} href={`/products/${item.p.slug}`}
                    className="bg-white p-7 flex flex-col gap-3.5 hover:bg-paper transition-colors relative
                               before:content-[''] before:absolute before:top-0 before:left-6 before:w-8 before:h-0.5 before:bg-gold">
                <div className="font-mono text-[11px] text-gold-1 tracking-[.16em]">{item.lbl}</div>
                <h3 className="font-display font-semibold text-[22px] tracking-[-.01em] m-0">
                  {item.p.name}
                  {item.suffix && <span className="font-mono text-[10px] text-gold-1 tracking-[.1em] uppercase font-normal ml-2">{item.suffix}</span>}
                </h3>
                <p className="text-[13px] text-muted leading-[1.55] m-0">{item.desc}</p>
                <div className="flex-1 grid place-items-center p-4 min-h-[140px] border border-line"
                     style={{background:"radial-gradient(circle, #fff, #f0eee8)"}}>
                  <span className="font-display text-3xl font-bold tracking-[-.02em] text-ink-3/40">{item.p.name}</span>
                </div>
                <div className="flex justify-between items-center pt-3.5 border-t border-line font-mono text-[11px] tracking-[.12em] uppercase">
                  <span>{item.meta}</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* APPS */}
      <section className="py-24 bg-paper">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Applications · 04 of 14 ]</span>
              <h2 className="qs-h2 mt-2">Một controller — nhiều loại máy</h2>
            </div>
            <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/applications">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { slug:"phay-cnc",   n:"01", t:"Máy phay CNC" },
              { slug:"cua-long",   n:"02", t:"Máy cưa lọng" },
              { slug:"dan-keo",    n:"03", t:"Máy dán keo" },
              { slug:"uon-lo-xo",  n:"05", t:"Máy uốn lò xo" },
            ].map(a => (
              <Link key={a.slug} href={`/applications/${a.slug}`}
                    className="bg-white border border-line p-6 flex flex-col gap-3.5 hover:-translate-y-0.5 hover:border-ink transition-all">
                <div className="aspect-[5/4] border border-line grid place-items-center"
                     style={{background:"radial-gradient(circle, #fff, #f0eee8)"}}>
                  <span className="font-mono text-[10px] text-muted tracking-[.16em]">FIG · {a.n}</span>
                </div>
                <span className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">App {a.n}</span>
                <h4 className="font-display font-semibold text-[17px] m-0">{a.t}</h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS DARK */}
      <section className="py-20 bg-ink text-[#cfc9b8] relative overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg opacity-[.12]"></div>
        <div className="relative max-w-wrap mx-auto px-12">
          <div className="grid md:grid-cols-[1fr_2fr] gap-16 mb-10 items-end">
            <div>
              <span className="font-mono text-[11px] text-gold-2 tracking-[.16em] uppercase">[ By the numbers ]</span>
              <h2 className="qs-h2 text-white mt-2">Vận hành thực tế</h2>
            </div>
            <p className="text-[#a8a499] text-base leading-[1.7] max-w-[60ch]">
              Số liệu thu thập từ các dây chuyền QS đang vận hành tại Việt Nam, Lào, Campuchia tính đến Q1/2026.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-[#2a2620] bg-[#2a2620]">
            {[
              ["800+",   "Hệ thống",          "Đã bàn giao và đang vận hành liên tục."],
              ["14",     "Ứng dụng",          "Từ phay, uốn, dán keo đến kim hoàn, thực phẩm."],
              ["12 yr",  "Kinh nghiệm",       "Thiết kế firmware controller từ 2014."],
              ["±0.005", "Độ chính xác (mm)", "Đạt được trên dòng Astro vòng kín."],
            ].map(([v,l,d]) => (
              <div key={l} className="bg-ink p-7 flex flex-col gap-2 relative
                                       before:content-[''] before:absolute before:top-0 before:left-0 before:w-8 before:h-0.5 before:bg-gold">
                <div className="font-display font-bold text-5xl text-gold-2 tracking-[-.02em] leading-none">{v}</div>
                <div className="font-mono text-[10px] text-[#7a7570] tracking-[.16em] uppercase mt-2">{l}</div>
                <div className="text-[13px] text-[#a8a499] leading-[1.5] mt-1.5">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="py-24 bg-white border-t border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Showreel · 02:14 ]</span>
              <h2 className="qs-h2 mt-2">Xem controller QS hoạt động</h2>
            </div>
            <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="#">Kênh YouTube →</Link>
          </div>
          <div className="grid md:grid-cols-[2fr_1fr] gap-px bg-line border border-line">
            <div className="relative bg-ink-2 aspect-video overflow-hidden">
              <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
                <defs>
                  <linearGradient id="vbg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#1a1815"/><stop offset="1" stopColor="#2a2520"/></linearGradient>
                </defs>
                <rect width="800" height="450" fill="url(#vbg)"/>
                <rect x="180" y="120" width="440" height="220" fill="#cfc9b8" stroke="#5a5650" strokeWidth="2"/>
                <rect x="200" y="140" width="200" height="120" fill="#0a1a2a"/>
                <text x="214" y="172" fontFamily="JetBrains Mono,monospace" fontSize="14" fill="#5ab8e0">QS · ASTRO 6AH</text>
                <text x="214" y="200" fontFamily="JetBrains Mono,monospace" fontSize="20" fontWeight="700" fill="#fff">RUN · 00:42</text>
                <text x="214" y="228" fontFamily="JetBrains Mono,monospace" fontSize="12" fill="#e8c878">FEED 1820 mm/min</text>
                <circle cx="580" cy="170" r="14" fill="#c8553d"/>
                <circle cx="580" cy="170" r="6" fill="#e8c878"/>
              </svg>
              <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full grid place-items-center border-0 cursor-pointer text-ink-2 transition-all hover:scale-105"
                      style={{background:"rgba(232,200,120,.95)", boxShadow:"0 0 0 6px rgba(232,200,120,.18)"}}
                      aria-label="Phát video">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <div className="absolute left-0 right-0 bottom-0 px-5 py-4 text-white flex items-center gap-3.5"
                   style={{background:"linear-gradient(0deg,rgba(10,10,8,.85),transparent)"}}>
                <span className="font-mono text-[11px] bg-gold text-ink-2 py-0.5 px-2 font-semibold">02:14</span>
                <span className="font-display text-sm font-medium">QS Astro 6AH — gia công khuôn nhôm tại Bình Dương</span>
              </div>
            </div>
            <div className="flex flex-col bg-paper">
              {[
                ["01 · Astro 6AH gia công khuôn nhôm", "02:14"],
                ["02 · Lắp đặt F86 trên máy phay 6 trục", "03:48"],
                ["03 · Hệ thống dán keo dùng F54", "01:36"],
                ["04 · Máy uốn lò xo điều khiển QS", "02:52"],
              ].map(([t, d]) => (
                <a key={t} href="#" className="flex-1 px-5 py-4 flex items-center border-b border-line last:border-b-0 text-ink hover:bg-white hover:pl-6 transition-all text-[13px] leading-[1.5]">
                  <div className="flex justify-between items-center w-full gap-3.5">
                    <span>{t}</span>
                    <span className="font-mono text-[10px] text-gold-1 tracking-[.1em] shrink-0">{d}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section className="py-24 bg-paper">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Newsroom · Q1/2026 ]</span>
              <h2 className="qs-h2 mt-2">Tin tức &amp; sự kiện</h2>
            </div>
            <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/news">Xem tất cả →</Link>
          </div>
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-8">
            <Link href={`/news/${featNews.slug}`}
                  className="bg-white border border-line flex flex-col hover:border-ink transition-colors">
              <div className="aspect-[5/3] bg-ink-2 border-b border-line overflow-hidden">
                <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
                  <rect width="600" height="360" fill="#1a1815"/>
                  <g fill="#3a3530"><rect x="60" y="80" width="200" height="200"/><rect x="280" y="80" width="120" height="200"/><rect x="420" y="80" width="120" height="200"/></g>
                  <rect x="80" y="120" width="160" height="100" fill="#0a1a2a"/>
                  <text x="100" y="150" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="#e8c878">QS · 2026</text>
                  <text x="100" y="180" fontFamily="JetBrains Mono,monospace" fontSize="20" fill="#fff" fontWeight="700">ASTRO 12X</text>
                  <circle cx="500" cy="180" r="20" fill="#c8553d"/>
                </svg>
              </div>
              <div className="p-7">
                <span className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ {featNews.cat} ]</span>
                <h3 className="font-display font-semibold text-2xl mt-2.5 mb-3.5 leading-[1.25] tracking-[-.01em]">{featNews.title}</h3>
                <p className="text-[#4a4842] text-sm leading-[1.65] m-0">{featNews.excerpt}</p>
                <div className="mt-4 pt-3.5 border-t border-line font-mono text-[10px] text-muted tracking-[.14em]">{featNews.date} · 4 phút đọc</div>
              </div>
            </Link>
            <div className="grid gap-px bg-line border border-line">
              {restNews.map(n => (
                <Link key={n.slug} href={`/news/${n.slug}`}
                      className="bg-white p-6 grid grid-cols-[90px_1fr] gap-4 hover:bg-paper-2 hover:pl-7 transition-all">
                  <div className="font-mono text-[10px] text-gold-1 tracking-[.14em] pt-1.5">{n.date}</div>
                  <div>
                    <span className="font-mono text-[9px] text-muted tracking-[.16em] uppercase block mb-1.5">{n.cat}</span>
                    <h4 className="font-display font-semibold text-[15px] leading-[1.4] m-0 tracking-[-.005em]">{n.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="bg-ink text-[#cfc9b8] p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h3 className="font-display font-bold text-3xl text-white tracking-[-.01em] m-0">Cần controller cho dòng máy đặc thù?</h3>
              <p className="text-[#a8a499] mt-2 max-w-[60ch] m-0 text-[15px]">Đội kỹ thuật QS thiết kế PCB, viết firmware và bàn giao trọn gói trong 8 tuần — phù hợp 100% cho dây chuyền của bạn.</p>
            </div>
            <Link className="qs-btn qs-btn-gold" href="/services">Đặt chế tạo riêng →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
