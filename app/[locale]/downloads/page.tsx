import Link from "next/link";

export const metadata = { title: "Tải về — QS Technology" };

const categories = [
  { lbl:"24 docs", type:"PDF", t:"Catalogue tổng",
    d:"Bộ catalogue đầy đủ 6 dòng controller F-series và Astro-series — bản tiếng Việt và tiếng Anh.",
    cta:"Xem 24 tài liệu", href:"/downloads/datasheets" },
  { lbl:"38 docs", type:"PDF", t:"Datasheet kỹ thuật",
    d:"Thông số chi tiết từng model: I/O, điện áp, kích thước, sơ đồ chân kết nối servo và biến tần.",
    cta:"Xem 38 tài liệu", href:"/downloads/datasheets" },
  { lbl:"16 docs", type:"PDF", t:"Hướng dẫn vận hành",
    d:"Sách hướng dẫn cho thợ vận hành: thao tác HMI, cài đặt thông số, xử lý alarm thường gặp.",
    cta:"Xem 16 tài liệu", href:"/downloads/datasheets" },
  { lbl:"22 files", type:"FW · CAD", t:"Firmware & CAD",
    d:"Bản firmware mới nhất cho từng model, bản vẽ DXF/STEP để tích hợp vào tủ điện máy.",
    cta:"Xem 22 tệp", href:"/downloads/datasheets" },
];

const featured = [
  { type:"PDF", size:"12.8 MB", pages:"64 pages",
    title:"Catalogue tổng QS 2026", sub:"(Tiếng Việt)",
    desc:"Tổng hợp 6 dòng controller, sơ đồ ứng dụng, bảng so sánh thông số và phụ kiện đi kèm.",
    code:"QS-CAT-2026-VN · v3.1" },
  { type:"PDF", size:"2.4 MB", pages:"16 pages",
    title:"Astro 6AH", sub:"Datasheet kỹ thuật",
    desc:"Sơ đồ chân, thông số servo, kích thước cơ khí và quy chuẩn lắp đặt vào tủ điện.",
    code:"QS-DS-A6AH · v2.4" },
  { type:"BIN", size:"8.6 MB", pages:"v2.1.4",
    title:"Firmware F-series", sub:"v2.1.4 (stable)",
    desc:"Bản cập nhật ổn định cho F54/F86/F10T với cải tiến look-ahead và sửa lỗi alarm 27.",
    code:"QS-FW-F-2.1.4 · 03/2026" },
];

export default function Downloads() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-12 pb-16">
          <div className="qs-crumb mb-8">
            <Link href="/">Trang chủ</Link><span className="sep">/</span>
            <span className="here">Tải tài liệu</span>
          </div>
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-16 items-center">
            <div>
              <div className="qs-eyebrow">Document Center · 2026</div>
              <h1 className="qs-h1 mt-3.5" style={{fontSize:"clamp(48px,6vw,84px)"}}>
                Catalogue,<br/>
                <em className="not-italic font-semibold bg-gold-grad bg-clip-text text-transparent">datasheet</em><br/>&amp; firmware
              </h1>
              <p className="qs-lede mt-5 max-w-[55ch]">
                Tất cả tài liệu kỹ thuật của QS Technology — catalogue dòng controller, datasheet từng model, sách hướng dẫn vận hành, firmware mới nhất và bản vẽ CAD lắp đặt.
              </p>

              {/* search */}
              <div className="mt-8 flex items-center bg-white border border-ink">
                <input className="flex-1 border-0 outline-0 px-6 py-4.5 text-[15px] bg-transparent"
                       placeholder="Tìm datasheet, firmware, catalogue…"/>
                <button className="bg-ink text-white border-0 px-6 py-4.5 font-mono text-[11px] tracking-[.16em] uppercase">Tìm ↵</button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] text-muted tracking-[.16em] uppercase mr-1">PHỔ BIẾN:</span>
                {["Catalogue 2026","F54 · Datasheet","Astro 6AH · Manual","Firmware v2.1.4"].map(q => (
                  <Link key={q} href="#" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-line font-mono text-[11px] tracking-[.08em] uppercase text-muted hover:border-ink hover:text-ink">{q}</Link>
                ))}
              </div>
            </div>

            {/* stack visual */}
            <div className="relative aspect-5/6 grid place-items-center">
              <div className="absolute w-3/5 aspect-8.5/11 bg-white border border-line -rotate-6 left-[10%] top-[15%]"></div>
              <div className="absolute w-3/5 aspect-8.5/11 bg-white border border-line rotate-3 left-[18%] top-[12%]"></div>
              <div className="relative w-3/5 aspect-8.5/11 bg-white border border-ink p-6 z-10">
                <div className="bg-ink h-2 w-1/3 mb-3"></div>
                <div className="h-1 bg-line w-2/3 mb-1.5"></div>
                <div className="h-1 bg-line w-3/4 mb-1.5"></div>
                <div className="h-1 bg-gold w-1/3 mb-4"></div>
                <div className="grid grid-cols-2 gap-1.5 mt-4">
                  {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-paper border border-line"></div>)}
                </div>
                <div className="absolute bottom-3 right-3 font-mono text-[8px] tracking-[.16em] text-muted">QS · CATALOGUE · P. 01 / 64</div>
                <div className="absolute bottom-3 left-3 font-mono text-[8px] tracking-[.16em] text-muted">QS · F86 · P. 02</div>
                <div className="absolute top-3 right-3 font-mono text-[8px] tracking-[.16em] text-muted">P. 04</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Browse · 04 categories ]</span>
              <h2 className="qs-h2 mt-2">Theo loại tài liệu</h2>
            </div>
            <span className="font-mono text-[11px] text-muted tracking-[.1em] uppercase">Cập nhật T03/2026</span>
          </div>
          <div className="grid md:grid-cols-4 gap-px bg-line border border-line">
            {categories.map(c => (
              <Link key={c.t} href={c.href} className="bg-white p-6 flex flex-col gap-3.5 hover:bg-paper transition-colors relative
                                                  before:content-[''] before:absolute before:top-0 before:left-6 before:w-8 before:h-0.5 before:bg-gold">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ {c.lbl} ]</div>
                <div className="self-start font-mono text-[10px] bg-ink text-white py-1 px-2 tracking-[.16em] uppercase font-semibold">{c.type}</div>
                <h3 className="font-display font-semibold text-[19px] tracking-[-.005em] m-0">{c.t}</h3>
                <p className="text-[13px] text-muted leading-[1.6] m-0 flex-1">{c.d}</p>
                <div className="font-mono text-[10px] text-ink tracking-[.12em] uppercase pt-3 mt-2 border-t border-line">{c.cta} →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-20 bg-paper border-y border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Featured · this month ]</span>
              <h2 className="qs-h2 mt-2">Tài liệu nổi bật</h2>
            </div>
            <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="#">Xem tất cả →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-line border border-line">
            {featured.map(f => (
              <div key={f.title} className="bg-white p-7 flex flex-col gap-3">
                <div className="flex gap-2">
                  <span className="font-mono text-[10px] bg-rust text-white py-1 px-2 tracking-[.14em] uppercase font-semibold">{f.type}</span>
                  <span className="font-mono text-[10px] text-muted tracking-[.14em] uppercase">{f.size}</span>
                  <span className="font-mono text-[10px] text-muted tracking-[.14em] uppercase">{f.pages}</span>
                </div>
                <h3 className="font-display font-semibold text-[19px] tracking-[-.005em] m-0 mt-1.5">
                  {f.title} <span className="block font-normal text-base text-muted">{f.sub}</span>
                </h3>
                <p className="text-[13px] text-[#4a4842] leading-[1.7] m-0 flex-1">{f.desc}</p>
                <div className="flex justify-between items-center pt-3.5 border-t border-line">
                  <span className="font-mono text-[10px] text-muted tracking-[.12em]">{f.code}</span>
                  <Link href="#" className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">Tải ↓</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HELPERS */}
      <section className="py-20 bg-white">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-2 gap-6">
          <div className="border border-line p-8 relative
                          before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
            <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ Need an account? ]</div>
            <h3 className="font-display font-semibold text-[22px] tracking-[-.01em] mt-2.5 mb-3">Tài liệu kỹ thuật mở rộng</h3>
            <p className="text-sm text-[#4a4842] leading-[1.7] m-0 mb-6">Một số tài liệu đặc biệt — sơ đồ điện chi tiết, source ladder mẫu, troubleshooting nâng cao — được cấp riêng cho khách hàng đã ký hợp đồng dịch vụ kỹ thuật.</p>
            <div className="flex gap-3">
              <Link className="qs-btn qs-btn-gold qs-btn-sm" href="/contact">Đăng ký tài khoản</Link>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="#">Đăng nhập</Link>
            </div>
          </div>
          <div className="border border-line p-8 relative
                          before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
            <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ Can't find it? ]</div>
            <h3 className="font-display font-semibold text-[22px] tracking-[-.01em] mt-2.5 mb-3">Yêu cầu tài liệu riêng</h3>
            <p className="text-sm text-[#4a4842] leading-[1.7] m-0 mb-6">Cần tài liệu cụ thể không có trong thư viện công khai — bản vẽ EPLAN, sample G-code, video demo? Đội kỹ thuật QS sẽ gửi qua email trong vòng 24 giờ.</p>
            <div className="flex gap-3">
              <Link className="qs-btn qs-btn-gold qs-btn-sm" href="/contact">Yêu cầu tài liệu</Link>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/contact">Liên hệ kỹ thuật</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
