"use client";
import Link from "next/link";

const featured = [
  { slug: "f54",      name: "F54",      meta: "3-axis · 5\" display",   tag: "Phay & router" },
  { slug: "f86",      name: "F86",      meta: "6-axis · 8\" display",   tag: "CNC đa trục" },
  { slug: "f10t",     name: "F10T",     meta: "Touch 10.1\"",           tag: "Tiện CNC" },
  { slug: "astro-6ah",name: "Astro 6AH",meta: "6-axis · vòng kín",      tag: "Tự động hoá" },
  { slug: "astro-10i",name: "Astro 10i",meta: "10-axis · EtherCAT",     tag: "Dây chuyền" },
  { slug: "astro-12x",name: "Astro 12X",meta: "12-axis · Vision",       tag: "Flagship · 2026" },
];

function close(){
  document.getElementById("qs-search-panel")?.classList.remove("open");
  document.getElementById("qs-search-backdrop")?.classList.remove("open");
}

export default function SearchPanel() {
  if (typeof window !== "undefined") {
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); }, { once: false });
  }
  return (
    <>
      <div id="qs-search-backdrop" onClick={close} className="fixed inset-0 bg-ink/40 opacity-0 pointer-events-none transition-opacity z-40 [&.open]:opacity-100 [&.open]:pointer-events-auto"></div>
      <div id="qs-search-panel" className="fixed left-0 right-0 top-[72px] bg-white shadow-[0_24px_40px_-20px_rgba(20,18,14,.18)] z-50 max-h-0 overflow-hidden transition-[max-height] duration-300 [&.open]:max-h-[min(72vh,640px)]">
        <div className="qs-wrap pt-7 pb-9 max-h-[min(72vh,640px)] overflow-y-auto">
          <div className="flex items-center gap-3 border-b border-line pb-3.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input placeholder="Tìm sản phẩm, model — F54, Astro 6AH…" autoComplete="off" className="flex-1 bg-transparent border-0 outline-0 text-base"/>
            <button onClick={close} aria-label="Đóng" className="font-mono text-xs text-muted hover:text-ink">✕ ESC</button>
          </div>
          <div className="mt-7">
            <div className="font-mono text-[10px] text-gold-1 tracking-[.18em] uppercase mb-4">Sản phẩm nổi bật</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
              {featured.map(p => (
                <Link key={p.slug} href={`/products/${p.slug}`} onClick={close} className="border border-line p-3.5 flex gap-3.5 hover:border-ink transition-colors">
                  <div className="w-20 h-12 bg-paper-2 grid place-items-center text-[10px] font-mono text-muted">{p.name}</div>
                  <div className="flex-1 min-w-0">
                    <b className="font-display block text-sm">{p.name}</b>
                    <span className="block text-[11px] text-muted font-mono">{p.meta}</span>
                    <span className="block text-[11px] text-gold-1 mt-0.5">{p.tag}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
