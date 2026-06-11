"use client";
import { useEffect } from "react";
import { Link } from "@/lib/i18n/navigation";

const featured = [
  { slug: "f54",      name: "F54",       meta: "3-axis · 5\" display",  tag: "Phay & router" },
  { slug: "f86",      name: "F86",       meta: "6-axis · 8\" display",  tag: "CNC đa trục" },
  { slug: "f10t",     name: "F10T",      meta: "Touch 10.4\"",          tag: "Tiện CNC" },
  { slug: "astro-6ah",name: "Astro 6AH", meta: "Closed-loop servo",     tag: "Servo & drive" },
  { slug: "astro-10i",name: "Astro 10i", meta: "Flagship · EtherCAT",   tag: "Servo cao cấp" },
];

function close() {
  document.getElementById("qs-search-panel")?.classList.remove("open");
  document.getElementById("qs-search-backdrop")?.classList.remove("open");
}

export default function SearchPanel() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    const syncTop = () => {
      const nav = document.querySelector(".qs-nav") as HTMLElement | null;
      const panel = document.getElementById("qs-search-panel");
      if (nav && panel) panel.style.top = `${nav.getBoundingClientRect().bottom}px`;
    };
    syncTop();
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", syncTop, { passive: true });
    window.addEventListener("resize", syncTop);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", syncTop);
      window.removeEventListener("resize", syncTop);
    };
  }, []);

  return (
    <>
      <div id="qs-search-panel" className="qs-search-panel">
        <div className="max-w-wrap mx-auto px-12 pt-7 pb-9 max-h-[min(72vh,640px)] overflow-y-auto">
          {/* search input */}
          <div className="flex items-center gap-3 border-0 border-b-2 border-ink px-1 pb-3.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-55"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
            <input id="qs-search-field" placeholder="Tìm sản phẩm, model — F54, Astro 6AH…" autoComplete="off"
                   className="flex-1 border-0 outline-0 bg-transparent text-lg font-display font-medium text-ink placeholder:text-muted placeholder:font-normal"/>
            <button onClick={close} aria-label="Đóng" className="w-8 h-8 grid place-items-center text-muted hover:text-ink text-sm">✕</button>
          </div>

          {/* featured products */}
          <div className="mt-6">
            <div className="font-mono text-[10px] tracking-[.18em] uppercase text-muted mb-3.5">Sản phẩm nổi bật</div>
            <div className="grid gap-px bg-line border border-line"
                 style={{gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))"}}>
              {featured.map(p => (
                <Link key={p.slug} href={`/products/${p.slug}`} onClick={close}
                      className="bg-white p-4 hover:bg-paper transition-colors flex flex-col text-ink">
                  <div className="h-20 bg-paper-2 grid place-items-center mb-3 border border-line font-mono text-[10px] text-muted">
                    {p.name}
                  </div>
                  <div className="flex flex-col gap-[3px]">
                    <b className="font-display font-bold text-base tracking-[-.01em]">{p.name}</b>
                    <span className="font-mono text-[10px] text-muted tracking-[.1em]">{p.meta}</span>
                    <span className="text-xs text-[#4a4842] mt-0.5">{p.tag}</span>
                  </div>
                </Link>
              ))}
              <Link href="/products" onClick={close}
                    className="bg-ink hover:bg-[#0a0a0a] p-4 flex flex-col text-white transition-colors">
                <div className="h-20 bg-[#0a0a0a] grid place-items-center mb-3 border border-ink-3 text-gold-2">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </div>
                <div className="flex flex-col gap-[3px]">
                  <b className="font-display font-bold text-base tracking-[-.01em] bg-gold-grad bg-clip-text text-transparent">Xem tất cả</b>
                  <span className="font-mono text-[10px] text-[#a8a499] tracking-[.1em]">26 sản phẩm</span>
                  <span className="text-xs text-[#a8a499] mt-0.5">Catalog đầy đủ</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div id="qs-search-backdrop" onClick={close} className="qs-search-backdrop"></div>
    </>
  );
}
