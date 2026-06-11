import { Link } from "@/lib/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";

export const metadata = { title: "Kết quả tìm kiếm — QS Technology" };

type Result = {
  href: string;
  cat: string;
  url: string;
  title: string;
  excerpt: string;
  meta: string[];
  thumb: "product" | "pdf" | "case" | "news" | "faq" | "app";
};

const sampleResults: Result[] = [
  {
    href: "/products/f86",
    cat: "[ Sản phẩm · F-series ]",
    url: "qstechnology.vn / products / f86",
    title: "F86 — controller 6 trục, 8\" touch, EtherCAT",
    excerpt: "Bộ điều khiển CNC 6 trục với màn hình cảm ứng 8 inch, hỗ trợ EtherCAT chuẩn cho servo Yaskawa, Delta, Mitsubishi. Sản phẩm chủ lực của QS cho dây chuyền cơ khí chính xác.",
    meta: ["Sản phẩm", "Cập nhật 04/2026", "Score · 9.8"],
    thumb: "product",
  },
  {
    href: "/downloads",
    cat: "[ Manual · F-series ]",
    url: "downloads / f86-manual-vn-v4.2.pdf",
    title: "Hướng dẫn lập trình F86 — chương 4: cấu hình EtherCAT",
    excerpt: "Hướng dẫn chi tiết cấu hình bus EtherCAT trên controller F86: ánh xạ slave, cài tham số PDO, đồng bộ DC, đặt chu kỳ giao tiếp. Bao gồm bảng tương thích với 12 dòng servo phổ biến.",
    meta: ["PDF · 8.4 MB", "Tiếng Việt · v4.2", "Score · 9.5"],
    thumb: "pdf",
  },
  {
    href: "/applications",
    cat: "[ Case study · Q1/2026 ]",
    url: "case-studies / precitech-long-an",
    title: "Precitech Long An — 24 dòng phay đồng bộ EtherCAT với F86",
    excerpt: "Tổng công ty PRECITECH triển khai 24 controller F86 trên dây chuyền gia công linh kiện ô tô, đồng bộ qua EtherCAT. Sản lượng tăng 38%, phế phẩm giảm về 0,4%.",
    meta: ["Case study", "04/2026", "Score · 9.2"],
    thumb: "case",
  },
  {
    href: "/news",
    cat: "[ Tin tức · Kỹ thuật ]",
    url: "news / firmware-v4-2-mastercam",
    title: "Firmware v4.2 cho F86 & Astro — bổ sung post-processor Mastercam",
    excerpt: "Phiên bản 4.2 cải thiện look-ahead 18% trên đường cong, hỗ trợ G-code macro tuỳ biến G65/G66, và đồng bộ EtherCAT ổn định hơn ở tốc độ cao.",
    meta: ["Tin tức", "02/04/2026", "Score · 8.9"],
    thumb: "news",
  },
  {
    href: "/applications",
    cat: "[ Ứng dụng · Phay CNC ]",
    url: "applications / cnc-milling",
    title: "Máy phay CNC 6 trục với F86 — cấu hình tiêu chuẩn QS",
    excerpt: "Sơ đồ wiring, cấu hình servo, danh sách phụ kiện đề xuất khi ghép F86 với máy phay BT30/BT40 phổ thông trên thị trường Việt Nam.",
    meta: ["Ứng dụng", "14 ảnh kỹ thuật", "Score · 8.1"],
    thumb: "app",
  },
];

const filters = [
  { l: "Tất cả",        ct: "24", on: true },
  { l: "Sản phẩm",      ct: "06" },
  { l: "Tài liệu PDF",  ct: "08" },
  { l: "Case studies",  ct: "03" },
  { l: "Tin tức",       ct: "04" },
  { l: "FAQ",           ct: "03" },
];

const tabs = [
  { l: "Tất cả",        ct: "24", active: true },
  { l: "Sản phẩm",      ct: "06" },
  { l: "Tài liệu",      ct: "08" },
  { l: "Tin tức",       ct: "04" },
  { l: "Case studies",  ct: "03" },
  { l: "FAQ",           ct: "03" },
];

const recent = [
  ["02 / 05 / 26", "F86 alarm 2104"],
  ["28 / 04 / 26", "Astro 10i price"],
  ["25 / 04 / 26", "post-processor Mastercam"],
  ["22 / 04 / 26", "F54 datasheet"],
];

export default async function SearchPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Static export can't read `searchParams` at build. This page ships as a
  // static results demo; live querying is deferred to a future client-side
  // search (the GET form still points at /search for that later wiring).
  const query = "F86 EtherCAT";

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
               style={{ background: "linear-gradient(180deg, #fafaf7, #f0eee8)", padding: "48px 0 32px" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12">
          <div className="qs-crumb">
            <Link href="/">Home</Link><span className="sep">/</span>
            <span className="here">Tìm kiếm</span>
          </div>
          <h1 className="font-display font-bold mt-3.5 leading-[1.05] tracking-[-.015em]"
              style={{ fontSize: "clamp(34px, 3.6vw, 44px)" }}>
            Kết quả cho "<em className="not-italic bg-gold-grad bg-clip-text text-transparent">{query}</em>"
          </h1>
          <div className="mt-3.5 font-mono text-[11px] text-muted tracking-[.14em] uppercase">
            <b className="text-ink font-medium">{sampleResults.length * 4}</b> kết quả · 0,18 giây · sắp xếp theo độ liên quan
          </div>
        </div>
      </section>

      {/* INPUT */}
      <section className="bg-white border-b border-line sticky top-[72px] z-30 py-6">
        <div className="max-w-wrap mx-auto px-12">
          <form action="/search" method="get" className="flex gap-3.5 items-center border border-ink bg-white px-[18px] py-3.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0 opacity-50">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/>
            </svg>
            <input name="q" defaultValue={query} autoComplete="off"
                   className="flex-1 border-0 outline-0 text-lg font-display font-medium text-ink"/>
            <button type="submit" className="px-4 py-2.5 bg-ink text-white font-mono text-[11px] tracking-[.14em] uppercase cursor-pointer">Tìm</button>
          </form>
        </div>
      </section>

      {/* TABS */}
      <section className="bg-white border-b border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="flex flex-wrap">
            {tabs.map(t => (
              <button key={t.l}
                      className={`py-3.5 px-[18px] font-mono text-[11px] tracking-[.14em] uppercase cursor-pointer bg-transparent border-0 border-b-2
                                  ${t.active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}>
                <b className="font-display text-[13px] tracking-normal normal-case font-semibold text-ink">{t.l}</b>
                <span className="font-mono text-[11px] text-gold-1 ml-2">{t.ct}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="bg-white py-12 pb-24">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1fr_280px] gap-12 items-start">
          <div>
            <div className="flex flex-col gap-px bg-line border border-line">
              {sampleResults.map(r => (
                <Link key={r.url} href={r.href}
                      className="bg-white px-7 py-6 grid grid-cols-[120px_1fr] gap-6 text-ink relative
                                 hover:bg-paper hover:pl-[34px] transition-all
                                 before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:bg-gold before:w-0
                                 hover:before:w-[3px] before:transition-all">
                  <Thumb kind={r.thumb}/>
                  <div>
                    <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase flex gap-3.5">
                      <span>{r.cat}</span>
                      <span className="text-muted">{r.url}</span>
                    </div>
                    <h3 className="mt-1.5 mb-1.5 font-display text-[19px] font-semibold leading-[1.3] tracking-[-.005em]"
                        dangerouslySetInnerHTML={{ __html: highlight(r.title, query) }}/>
                    <p className="m-0 text-[#3a3a3a] text-[13.5px] leading-[1.6] max-w-[65ch]"
                       dangerouslySetInnerHTML={{ __html: highlight(r.excerpt, query) }}/>
                    <div className="mt-2.5 font-mono text-[10px] text-muted tracking-[.12em] uppercase flex gap-[18px]">
                      {r.meta.map(m => <span key={m}>{m}</span>)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-line">
              <div className="font-mono text-[11px] text-muted tracking-[.12em]">
                Hiển thị 1–{sampleResults.length} / {sampleResults.length * 4} kết quả
              </div>
              <div className="flex gap-1">
                {["1","2","3","4","→"].map((p, i) => (
                  <a key={p} href="#"
                     className={`w-9 h-9 border border-line grid place-items-center font-mono text-xs
                                 ${i === 0 ? "bg-ink text-white border-ink" : "bg-white text-ink"}`}>{p}</a>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="sticky top-40 flex flex-col gap-6">
            <div className="border border-line bg-paper p-[22px]">
              <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-3.5">[ Lọc theo loại ]</div>
              <ul className="list-none p-0 m-0 flex flex-col">
                {filters.map(f => (
                  <li key={f.l}
                      className={`flex justify-between py-2 border-b border-line last:border-b-0 text-[13px] cursor-pointer ${f.on ? "font-semibold" : ""}`}>
                    <span>{f.l}</span>
                    <span className="font-mono text-[10px] text-gold-1">{f.ct}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-line bg-paper p-[22px]">
              <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-3.5">[ Tìm kiếm gần đây ]</div>
              <ul className="list-none p-0 m-0 flex flex-col">
                {recent.map(([d, t]) => (
                  <li key={t}>
                    <Link href={`/search?q=${encodeURIComponent(t)}`}
                          className="block py-2.5 border-b border-dashed border-line last:border-b-0 text-[13px] text-[#3a3a3a] leading-[1.5] hover:text-ink">
                      <span className="block font-mono text-[10px] text-gold-1 tracking-[.1em] mb-0.5">{d}</span>
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-ink bg-ink text-[#cfc9b8] p-[22px]">
              <div className="font-mono text-[10px] text-gold-2 tracking-[.16em] uppercase mb-3.5">[ Không thấy thứ cần tìm? ]</div>
              <p className="m-0 mb-3.5 text-[13px] leading-[1.6] text-[#a8a499]">
                Đội kỹ thuật QS có thể tìm hộ bạn — gửi yêu cầu qua helpdesk hoặc Zalo.
              </p>
              <Link className="qs-btn qs-btn-gold qs-btn-sm inline-flex" href="/contact">Liên hệ kỹ thuật →</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, query: string) {
  const safe = escapeHtml(text);
  const tokens = query.split(/\s+/).filter(t => t.length > 1).map(escapeReg);
  if (!tokens.length) return safe;
  const re = new RegExp(`(${tokens.join("|")})`, "gi");
  return safe.replace(re, '<mark class="bg-[#fff5d8] text-ink px-0.5 border-b border-gold">$1</mark>');
}

function Thumb({ kind }: { kind: Result["thumb"] }) {
  const wrap = "aspect-[5/4] bg-paper-2 border border-line overflow-hidden grid place-items-center";
  if (kind === "faq") {
    return <div className={`${wrap} bg-ink text-gold-2 font-display text-3xl font-bold`}>?</div>;
  }
  return (
    <div className={wrap}>
      <svg viewBox="0 0 100 80" className="w-full h-full">
        {kind === "product" && (<>
          <rect x="6" y="10" width="88" height="60" fill="#1a1a1a" stroke="#3a3a3a"/>
          <rect x="14" y="18" width="60" height="36" fill="#0a3a3a"/>
          <g fill="#3a3a3a"><rect x="78" y="18" width="12" height="10"/><rect x="78" y="32" width="12" height="10"/><rect x="78" y="46" width="12" height="10"/></g>
          <rect x="14" y="58" width="60" height="6" fill="#e8c878"/>
        </>)}
        {kind === "pdf" && (<>
          <rect x="14" y="6" width="60" height="68" fill="#fff" stroke="#d8d6cf"/>
          <rect x="14" y="6" width="20" height="20" fill="#f5f3ee"/>
          <rect x="20" y="48" width="48" height="12" fill="#c8553d"/>
          <text x="44" y="58" fontFamily="JetBrains Mono,monospace" fontSize="6" fontWeight="700" fill="#fff" textAnchor="middle">PDF</text>
        </>)}
        {kind === "case" && (<>
          <rect width="100" height="80" fill="#1a1815"/>
          <rect x="20" y="20" width="60" height="40" fill="#cfc9b8"/>
          <rect x="26" y="26" width="30" height="20" fill="#0a1a2a"/>
        </>)}
        {kind === "news" && (<>
          <rect width="100" height="80" fill="#2a2520"/>
          <rect x="14" y="20" width="72" height="40" fill="#cfc9b8"/>
          <circle cx="50" cy="40" r="10" fill="#e8c878"/>
        </>)}
        {kind === "app" && (<>
          <rect x="20" y="14" width="60" height="22" fill="#cfc9b8" stroke="#8a8680"/>
          <rect x="26" y="38" width="48" height="32" fill="#a8a499" stroke="#5a5650"/>
        </>)}
      </svg>
    </div>
  );
}
