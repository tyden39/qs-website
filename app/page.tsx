import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-paper border-b border-line py-24">
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="qs-wrap relative grid md:grid-cols-[1.2fr_1fr] gap-16 items-end">
          <div>
            <div className="qs-eyebrow">QS Technology · Est. 2014 · Made in Vietnam</div>
            <h1 className="qs-h1 mt-3.5">Bộ điều khiển<br/>CNC <em className="not-italic bg-gold-grad bg-clip-text text-transparent">cho nhà máy</em><br/>Việt Nam.</h1>
            <p className="mt-6 text-lg leading-relaxed text-[#3a3a3a] max-w-xl text-pretty">12 năm chế tạo controller, servo và board mở rộng — phần cứng do kỹ sư Việt thiết kế, firmware viết tại TP.HCM, hỗ trợ trực tiếp 24h tại 35 tỉnh thành.</p>
            <div className="mt-8 flex gap-3">
              <Link className="qs-btn qs-btn-gold" href="/products">Xem sản phẩm →</Link>
              <Link className="qs-btn qs-btn-ghost" href="/contact">Liên hệ tư vấn</Link>
            </div>
          </div>
          <div className="border border-line bg-white p-7">
            <div className="font-mono text-[10px] text-gold-1 tracking-[.18em] uppercase">[ Số liệu vận hành · Q1/2026 ]</div>
            <div className="mt-5 grid grid-cols-2 gap-px bg-line">
              {[["800+","hệ thống đang chạy"],["35","tỉnh thành phủ"],["24h","SLA on-site"],["12","năm chế tạo"]].map(([v,l]) => (
                <div key={l} className="bg-white p-5">
                  <div className="font-display font-bold text-3xl bg-gold-grad bg-clip-text text-transparent">{v}</div>
                  <div className="font-mono text-[10px] text-muted tracking-[.14em] uppercase mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="qs-wrap">
          <div className="flex items-end justify-between border-b border-line pb-5 mb-10">
            <div>
              <span className="qs-eyebrow">[ 01 · Sản phẩm ]</span>
              <h2 className="qs-h2 mt-2">Sáu model controller cho mọi loại máy</h2>
            </div>
            <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/products">Tất cả →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { slug: "f54",      name: "F54",      tag: "Phay & router cơ bản",     meta: "3 trục · màn 5\"" },
              { slug: "f86",      name: "F86",      tag: "CNC đa trục",              meta: "6 trục · màn 8\"" },
              { slug: "f10t",     name: "F10T",     tag: "Tiện CNC chính xác",       meta: "Touch 10.1\"" },
              { slug: "astro-6ah",name: "Astro 6AH",tag: "Tự động hoá vòng kín",     meta: "6 trục · servo VK" },
              { slug: "astro-10i",name: "Astro 10i",tag: "Dây chuyền lắp ráp",       meta: "10 trục · EtherCAT" },
              { slug: "astro-12x",name: "Astro 12X",tag: "Flagship 2026",            meta: "12 trục · vision" },
            ].map(p => (
              <Link key={p.slug} href={`/products/${p.slug}`} className="border border-line bg-white block transition-transform hover:-translate-y-0.5 hover:border-ink">
                <div className="aspect-[5/3] bg-paper-2 border-b border-line grid place-items-center font-display text-3xl font-bold tracking-tight">{p.name}</div>
                <div className="p-5">
                  <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">{p.meta}</div>
                  <h3 className="font-display font-semibold text-lg mt-1.5">{p.name} — {p.tag}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PlaceholderSection idx="02" eyebrow="Ứng dụng" title="QS controller chạy ở 14 loại máy"  cta="Xem ứng dụng"  href="/applications" />
      <PlaceholderSection idx="03" eyebrow="Dịch vụ"  title="Chế tạo controller theo yêu cầu" cta="Đặt báo giá"   href="/service" dark />
      <PlaceholderSection idx="04" eyebrow="Tin tức"  title="Astro 12X — flagship 12 trục mới" cta="Đọc tiếp"     href="/news/astro-12x" />
    </>
  );
}

function PlaceholderSection({ idx, eyebrow, title, cta, href, dark = false }:
  { idx:string; eyebrow:string; title:string; cta:string; href:string; dark?:boolean }) {
  return (
    <section className={`py-24 ${dark ? "bg-ink-2 text-[#cfc9b8]" : "bg-paper border-y border-line"}`}>
      <div className="qs-wrap grid md:grid-cols-[1fr_auto] items-end gap-8">
        <div>
          <span className={`qs-eyebrow ${dark ? "!text-gold-2 before:!bg-gold-3" : ""}`}>[ {idx} · {eyebrow} ]</span>
          <h2 className={`qs-h2 mt-2 ${dark ? "text-white" : ""}`}>{title}</h2>
        </div>
        <Link className={dark ? "qs-btn qs-btn-gold" : "qs-btn qs-btn-ghost"} href={href}>{cta} →</Link>
      </div>
    </section>
  );
}
