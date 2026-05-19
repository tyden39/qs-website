import Link from "next/link";

export const metadata = { title: "Datasheet kỹ thuật — Downloads — QS Technology" };

const filters = [
  { gh:"Loại tài liệu", items:[
    { l:"Datasheet", c:"38", on:true },
    { l:"Catalogue", c:"24" },
    { l:"Manual / HD", c:"16" },
    { l:"Firmware", c:"12" },
    { l:"CAD / DXF", c:"10" },
  ]},
  { gh:"Dòng sản phẩm", items:[
    { l:"F-series", c:"18", on:true },
    { l:"Astro-series", c:"20", on:true },
    { l:"Servo & phụ kiện", c:"8" },
  ]},
  { gh:"Định dạng", items:[
    { l:"PDF", c:"32", on:true },
    { l:"DXF / STEP", c:"10" },
    { l:"BIN / Firmware", c:"12" },
    { l:"ZIP / bundle", c:"6" },
  ]},
  { gh:"Ngôn ngữ", items:[
    { l:"Tiếng Việt", c:"28", on:true },
    { l:"English", c:"22" },
  ]},
];

type Doc = {
  ext:"PDF"|"DXF"|"BIN"|"ZIP";
  ttl:string; ref:string;
  tag:string; tagGold?:boolean;
  ver:string; date:string; size:string;
};

const docs: Doc[] = [
  { ext:"PDF", ttl:"F54 — Datasheet kỹ thuật chi tiết", ref:"QS-DS-F54 · Tiếng Việt · 24 trang", tag:"Datasheet", ver:"v 2.4", date:"12 / 03 / 2026", size:"3.2 MB" },
  { ext:"PDF", ttl:"F86 — Datasheet kỹ thuật chi tiết", ref:"QS-DS-F86 · Tiếng Việt · 28 trang", tag:"Datasheet", ver:"v 2.4", date:"12 / 03 / 2026", size:"3.8 MB" },
  { ext:"PDF", ttl:"F10T (Cảm ứng) — Datasheet + sơ đồ chân", ref:"QS-DS-F10T · Tiếng Việt · 32 trang", tag:"Mới", tagGold:true, ver:"v 2.5", date:"28 / 02 / 2026", size:"4.6 MB" },
  { ext:"PDF", ttl:"Astro 6AH — Datasheet (vòng kín)", ref:"QS-DS-A6AH · Tiếng Việt · 24 trang", tag:"Datasheet", ver:"v 2.4", date:"15 / 02 / 2026", size:"3.4 MB" },
  { ext:"PDF", ttl:"Astro 6AV — Datasheet (vertical install)", ref:"QS-DS-A6AV · Tiếng Việt · 24 trang", tag:"Datasheet", ver:"v 2.3", date:"15 / 02 / 2026", size:"3.3 MB" },
  { ext:"DXF", ttl:"Astro 10i — Bản vẽ lắp đặt cơ khí (DXF + STEP)", ref:"QS-CAD-A10i · Bundle", tag:"CAD", ver:"v 1.2", date:"02 / 02 / 2026", size:"5.9 MB" },
  { ext:"BIN", ttl:"Firmware F-series — v2.1.4 (stable)", ref:"QS-FW-F-2.1.4 · Cho F54 / F86 / F10T", tag:"Stable", tagGold:true, ver:"v 2.1.4", date:"28 / 03 / 2026", size:"8.6 MB" },
  { ext:"ZIP", ttl:"Bundle so sánh — F-series & Astro-series", ref:"QS-CMP-2026 · 6 datasheet + bảng so sánh", tag:"Bundle", ver:"v 1.0", date:"20 / 01 / 2026", size:"22.4 MB" },
];

const extStyles: Record<Doc["ext"], string> = {
  PDF: "bg-white text-ink",
  BIN: "bg-[#0e0e0c] text-gold-2",
  DXF: "bg-[#1a3a52] text-[#5ab8e0]",
  ZIP: "bg-gold text-ink",
};

export default function DownloadsList() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0e0e0c] text-[#cfc9b8] border-b border-[#2a2620]">
        <div className="absolute inset-0 qs-grid-bg opacity-[.12]"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-9 pb-11">
          <div className="qs-crumb mb-5">
            <Link href="/" className="!text-[#a8a499]">Trang chủ</Link>
            <span className="sep" style={{color:"#5a5650"}}>/</span>
            <Link href="/downloads" className="!text-[#a8a499]">Tải tài liệu</Link>
            <span className="sep" style={{color:"#5a5650"}}>/</span>
            <span className="here !text-gold-2">Datasheet kỹ thuật</span>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <div className="qs-eyebrow !text-gold-2">Document Library · Category 02 / 04</div>
              <h1 className="font-display font-bold text-[48px] text-white tracking-[-.02em] m-0 mt-2">Datasheet kỹ thuật</h1>
              <div className="mt-2.5 text-[#a8a499] text-[15px]">Thông số chi tiết, sơ đồ chân và quy chuẩn lắp đặt cho từng model controller QS.</div>
            </div>
            <div className="flex gap-8 text-right">
              {[{v:"38",l:"Tài liệu"},{v:"2026",l:"Phiên bản"},{v:"VN/EN",l:"Ngôn ngữ"}].map(s => (
                <div key={s.l}>
                  <div className="font-display text-[24px] font-bold text-gold-2">{s.v}</div>
                  <div className="font-mono text-[10px] text-[#7a7570] tracking-[.16em] uppercase mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="py-12 pb-24 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="grid grid-cols-[260px_1fr] gap-12 items-start">
            {/* SIDEBAR */}
            <aside>
              <span className="font-mono text-[10px] text-gold-3 tracking-[.16em] uppercase mb-3.5 block">Bộ lọc</span>
              {filters.map(f => (
                <div key={f.gh} className="border border-line bg-white mb-4">
                  <div className="px-4.5 py-3.5 border-b border-line font-mono text-[11px] text-ink tracking-[.12em] uppercase font-semibold">{f.gh}</div>
                  <ul className="list-none py-2 m-0">
                    {f.items.map(it => (
                      <li key={it.l} className="flex items-center gap-2.5 px-4.5 py-2">
                        <input type="checkbox" defaultChecked={it.on} className="w-3.5 h-3.5 accent-ink"/>
                        <label className="flex-1 text-[13px] text-[#3a3a3a] cursor-pointer">{it.l}</label>
                        <span className="font-mono text-[10px] text-muted tracking-[.08em]">{it.c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <button className="w-full bg-transparent border border-line py-2.5 px-3.5 font-mono text-[11px] tracking-[.12em] text-muted uppercase">Xóa bộ lọc ✕</button>
            </aside>

            {/* MAIN */}
            <main>
              {/* toolbar */}
              <div className="flex justify-between items-center px-5 py-3.5 bg-paper border border-line mb-5">
                <div className="flex gap-6 items-center">
                  <span className="font-mono text-[11px] text-muted tracking-[.1em]">Hiển thị <b className="text-ink font-semibold">1–08</b> / 38 tài liệu</span>
                  <div className="flex gap-1.5">
                    {["Datasheet","F-series","Astro","PDF","VN"].map(c => (
                      <span key={c} className="inline-flex items-center gap-1.5 bg-white border border-ink px-2.5 py-1 font-mono text-[10px] text-ink tracking-[.1em] uppercase">
                        {c} <span className="text-muted cursor-pointer">✕</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="font-mono text-[11px] text-muted tracking-[.1em] uppercase">Sắp xếp</span>
                  <select className="font-mono text-[11px] tracking-[.08em] uppercase border border-line px-3 py-1.5 bg-white">
                    <option>Mới nhất</option><option>Tên A–Z</option><option>Lượt tải nhiều</option>
                  </select>
                  <div className="flex border border-line">
                    <button className="w-8 h-8 grid place-items-center bg-ink text-white">≡</button>
                    <button className="w-8 h-8 grid place-items-center bg-white">▦</button>
                  </div>
                </div>
              </div>

              {/* table */}
              <table className="w-full border-collapse bg-white border border-line text-sm">
                <thead>
                  <tr className="bg-[#0e0e0c] text-[#cfc9b8]">
                    {["Tên tài liệu","Loại","Phiên bản","Cập nhật","Dung lượng","Thao tác"].map((h,i) => (
                      <th key={h} className={`px-4.5 py-3.5 font-mono text-[10px] font-semibold tracking-[.16em] uppercase border-b border-[#2a2620] ${i>=4 ? "text-right" : "text-left"} ${i===0 ? "w-[48%]" : ""} ${i===5 ? "w-40" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {docs.map(d => (
                    <tr key={d.ttl} className="border-b border-line hover:bg-paper transition-colors">
                      <td className="p-4.5 align-middle">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-[60px] flex-shrink-0 border border-line grid place-items-center font-display font-extrabold text-[11px] tracking-[-.02em] relative ${extStyles[d.ext]}`}>
                            {d.ext}
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="font-semibold text-ink text-[15px] tracking-[-.005em]">{d.ttl}</div>
                            <div className="font-mono text-[11px] text-muted tracking-[.06em]">{d.ref}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4.5 align-middle">
                        <span className={`inline-block px-2.5 py-1 font-mono text-[10px] tracking-[.12em] uppercase border ${d.tagGold ? "bg-gold border-gold-3 text-ink" : "bg-paper border-line text-ink"}`}>{d.tag}</span>
                      </td>
                      <td className="p-4.5 align-middle font-mono text-xs text-[#3a3a3a] tracking-[.04em]">{d.ver}</td>
                      <td className="p-4.5 align-middle font-mono text-[11px] text-muted tracking-[.06em]">{d.date}</td>
                      <td className="p-4.5 align-middle font-mono text-xs text-ink tracking-[.04em] text-right">{d.size}</td>
                      <td className="p-4.5 align-middle text-right whitespace-nowrap">
                        <a className="inline-flex items-center justify-center w-9 h-9 border border-line ml-1 text-ink hover:bg-ink hover:text-white" title="Xem trước">⌕</a>
                        <a className="inline-flex items-center justify-center h-9 border border-ink bg-ink text-white ml-1 px-4 font-mono text-[11px] tracking-[.14em] uppercase hover:bg-gold-3 hover:border-gold-3">Tải ↓</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* pager */}
              <div className="flex justify-between items-center mt-8 py-4">
                <div className="font-mono text-[11px] text-muted tracking-[.1em]">Trang 1 / 5 · 38 tài liệu</div>
                <div className="flex gap-1.5">
                  {["‹","1","2","3","4","5","›"].map((b,i) => (
                    <button key={i} className={`w-10 h-10 border border-line font-mono text-[13px] font-semibold ${b==="1" ? "bg-ink text-white border-ink" : "bg-white hover:border-ink"}`}>{b}</button>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>
    </>
  );
}
