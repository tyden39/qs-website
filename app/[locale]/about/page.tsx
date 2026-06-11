import { Link } from "@/lib/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";

export const metadata = { title: "Giới thiệu — QS Technology" };

const milestones = [
  ["2014", "Khởi nghiệp",  "Thành lập QS tại TP.HCM"],
  ["2016", "Sản phẩm đầu", "F54 ra mắt — 1 trục, 5\""],
  ["2018", "Mở rộng",      "F86 — controller 6 trục đầu tiên"],
  ["2020", "R&D mới",      "Astro-series vòng kín ra mắt"],
  ["2023", "Nhà máy",      "Khánh thành plant Bình Dương 4,200m²"],
  ["2026", "Hôm nay",      "800+ hệ thống · 14 ứng dụng · 35 tỉnh"],
];

const values = [
  { n:"01", t:"Tự chủ phần cứng", d:"Mọi controller QS đều do đội kỹ sư trong nước thiết kế PCB, lựa chọn linh kiện và viết firmware. Không phụ thuộc supply chain nước ngoài cho lõi sản phẩm." },
  { n:"02", t:"Hỗ trợ tại chỗ",   d:"Đội kỹ thuật QS có mặt trong vòng 24h tại 35 tỉnh thành. Khách hàng nói chuyện trực tiếp với người viết firmware, không qua đại lý trung gian." },
  { n:"03", t:"Bảo hành dài",     d:"Bảo hành 24 tháng cho phần cứng, hỗ trợ firmware miễn phí trọn đời sản phẩm. Linh kiện thay thế luôn sẵn ít nhất 8 năm sau khi ngừng sản xuất." },
];

const plantStats = [
  ["Diện tích",    "4,200 m²"],
  ["Số chuyền SMT","02 dây"],
  ["Công suất tháng","~ 1,800 bo"],
  ["Burn-in",      "100% sản phẩm"],
  ["Chứng nhận",   "ISO 9001:2015"],
  ["Nhân lực",     "62 người"],
];

const leaders = [
  { i:"QH", name:"Nguyễn Quang Huy", role:"Founder / CEO",
    bio:"Kỹ sư điện tử, 18 năm kinh nghiệm thiết kế hệ thống nhúng. Đồng tác giả firmware F-series và Astro-series." },
  { i:"TM", name:"Lê Thanh Mai", role:"CTO / R&D Lead",
    bio:"Tốt nghiệp Bách khoa Hà Nội, từng phát triển PLC cho Mitsubishi VN. Chịu trách nhiệm Astro-series." },
  { i:"DT", name:"Trần Đức Tâm", role:"Plant Director",
    bio:"Phụ trách nhà máy Bình Dương, 12 năm trong sản xuất điện tử. Chứng chỉ Lean Six Sigma Black Belt." },
  { i:"PV", name:"Phạm Vĩ Khang", role:"Head of Field Service",
    bio:"Quản lý đội triển khai 24 kỹ sư phủ 35 tỉnh thành. SLA hỗ trợ tại chỗ trong 24 giờ." },
];

export default async function About({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line py-20 pb-24"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 grid md:grid-cols-[1.1fr_1fr] gap-16 items-end">
          <div>
            <div className="qs-eyebrow">Về chúng tôi · Est. 2014</div>
            <h1 className="font-display font-bold tracking-tight leading-[.95] mt-3.5"
                style={{fontSize:"clamp(56px,7vw,88px)"}}>
              Mười hai năm<br/>
              chế tạo controller<br/>
              <em className="not-italic font-semibold bg-gold-grad bg-clip-text text-transparent">tại Việt Nam.</em>
            </h1>
          </div>
          <div>
            <p className="text-[17px] leading-[1.7] text-[#3a3a3a] m-0">
              QS Technology được thành lập năm 2014 tại TP.HCM bởi nhóm kỹ sư điện tử và cơ khí với mục tiêu tự chủ phần cứng điều khiển CNC cho ngành cơ khí chính xác trong nước. Hôm nay, sáu dòng controller QS đang vận hành trên hơn 800 dây chuyền sản xuất.
            </p>
            <div className="font-mono text-[10px] text-muted tracking-[.18em] uppercase pt-4.5 border-t border-line mt-8">
              Hồ sơ năng lực · Cập nhật Q1/2026
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="py-24 bg-white border-b border-line">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1fr_2fr] gap-16">
          <div>
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ 01 ]</span>
            <h2 className="font-display font-bold text-[36px] tracking-[-.015em] mt-2 leading-[1.1]">Câu chuyện QS</h2>
          </div>
          <div>
            <p className="text-[15px] leading-[1.75] text-[#3a3a3a] m-0 mb-4.5">
              Năm 2014, ba kỹ sư của một xưởng cơ khí tại Tân Bình quyết định viết firmware riêng cho máy phay CNC sau khi controller nhập khẩu hỏng và phải chờ linh kiện nửa năm. Dòng F-series ra đời từ chính nhu cầu thực tế đó.
            </p>
            <p className="text-[15px] leading-[1.75] text-[#3a3a3a] m-0 mb-4.5">
              Sau hai năm phát triển, controller F54 đầu tiên được lắp đặt tại một xưởng làm cửa nhôm ở Bình Dương — và vận hành liên tục đến hôm nay. Từ một sản phẩm ban đầu, QS mở rộng sang Astro-series cho dây chuyền tự động hoá, rồi servo motor và board mở rộng để cung cấp giải pháp trọn gói.
            </p>
            <p className="text-[15px] leading-[1.75] text-[#3a3a3a] m-0">
              Hôm nay, QS Technology có nhà máy 4.200 m² tại Bình Dương, đội R&amp;D 18 kỹ sư và mạng lưới đối tác triển khai phủ khắp 35 tỉnh thành. Triết lý không đổi: <strong className="font-semibold text-ink">phần cứng do mình thiết kế, firmware do mình viết, hỗ trợ kỹ thuật trực tiếp tại Việt Nam.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-24 bg-paper border-b border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ 02 · 12 năm phát triển ]</span>
              <h2 className="qs-h2 mt-2">Mốc thời gian</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-line border border-line">
            {milestones.map(([y,t,d]) => (
              <div key={y} className="bg-white p-5 flex flex-col gap-2 relative
                                       before:content-[''] before:absolute before:top-0 before:left-5 before:w-6 before:h-0.5 before:bg-gold">
                <div className="font-display font-bold text-[28px] text-gold-1 tracking-[-.02em]">{y}</div>
                <div className="font-mono text-[9px] text-muted tracking-[.16em] uppercase">{t}</div>
                <div className="font-display text-sm font-semibold leading-[1.35] tracking-[-.005em] mt-1">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="border-b border-line pb-6 mb-10">
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ 03 · Triết lý ]</span>
            <h2 className="qs-h2 mt-2">Ba điều QS không thay đổi</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map(v => (
              <div key={v.n} className="border border-line p-8 relative
                                         before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
                <div className="font-mono text-[11px] text-gold-1 tracking-[.16em]">[ {v.n} ]</div>
                <h3 className="font-display font-semibold text-[22px] tracking-[-.01em] mt-3.5 mb-2.5 m-0">{v.t}</h3>
                <p className="text-[#4a4842] text-sm leading-[1.7] m-0">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FACTORY */}
      <section className="py-24 bg-ink text-[#cfc9b8] relative overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg opacity-[.12]"></div>
        <div className="relative max-w-wrap mx-auto px-12">
          <div>
            <span className="font-mono text-[11px] text-gold-2 tracking-[.16em] uppercase">[ 04 · Nhà máy Bình Dương ]</span>
            <h2 className="font-display font-bold text-4xl text-white tracking-[-.015em] mt-2 leading-[1.1]">Sản xuất trong nước,<br/>kiểm soát đến từng PCB.</h2>
          </div>
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-12 mt-12 items-start">
            <div className="aspect-[5/3] bg-ink-2 border border-[#2a2620] overflow-hidden grid place-items-center">
              <span className="font-mono text-xs text-gold-2/40 tracking-[.18em] uppercase">FIG · FACTORY · BINH DUONG · 4,200 m²</span>
            </div>
            <ul className="list-none p-0 m-0 grid grid-cols-1 gap-px bg-[#2a2620] border border-[#2a2620]">
              {plantStats.map(([l,v]) => (
                <li key={l} className="bg-ink p-5 flex justify-between items-baseline">
                  <span className="font-mono text-[10px] text-[#7a7570] tracking-[.16em] uppercase">{l}</span>
                  <span className="font-display text-lg font-semibold text-gold-2">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* LEADERS */}
      <section className="py-24 bg-paper border-y border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ 05 · Lãnh đạo ]</span>
              <h2 className="qs-h2 mt-2">Đội ngũ điều hành</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {leaders.map(l => (
              <div key={l.i} className="bg-white border border-line p-7 grid grid-cols-[64px_1fr] gap-6 relative
                                         before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
                <div className="w-16 h-16 bg-paper-2 border border-line grid place-items-center font-display font-bold text-xl tracking-[-.01em] text-ink-3">{l.i}</div>
                <div>
                  <h3 className="font-display font-semibold text-lg m-0 leading-[1.2]">{l.name}</h3>
                  <span className="font-mono text-[10px] text-gold-1 tracking-[.14em] uppercase block mt-1.5">{l.role}</span>
                  <p className="text-sm text-[#4a4842] leading-[1.7] m-0 mt-3">{l.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="bg-ink text-[#cfc9b8] p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h3 className="font-display font-bold text-3xl text-white tracking-[-.01em] m-0">Muốn ghé thăm nhà máy QS?</h3>
              <p className="text-[#a8a499] mt-2 max-w-[60ch] m-0 text-[15px]">Nhà máy mở cho khách hàng và đối tác đặt lịch thăm quan vào thứ 3 và thứ 5 hàng tuần. Đăng ký trước 7 ngày.</p>
            </div>
            <Link className="qs-btn qs-btn-gold" href="/contact">Đặt lịch thăm quan →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
