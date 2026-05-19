import Link from "next/link";

export const metadata = { title: "Liên hệ — QS Technology" };

const channels = [
  { lbl:"Hotline · 24/7",  v:"+84 28 3636 1234",         h:"Hỗ trợ kỹ thuật khẩn cấp ngoài giờ", ic:"☎" },
  { lbl:"Bán hàng",        v:"sales@qstechnology.vn",     h:"Báo giá, đặt hàng lô lớn, OEM",      ic:"✉" },
  { lbl:"Kỹ thuật",        v:"support@qstechnology.vn",   h:"Tư vấn lắp đặt, firmware, lỗi vận hành", ic:"⚙" },
  { lbl:"Zalo OA",         v:"QS Technology",             h:"Chat trực tiếp với kỹ thuật viên",   ic:"Z" },
];

const offices = [
  { n:"01", t:"Trụ sở chính",  name:"QS Technology HQ — TP.HCM",
    addr:["123 KCN Tân Bình, Phường 14","Quận Tân Bình, TP. Hồ Chí Minh","Việt Nam"],
    meta:"T2–T6 · 8:00 – 17:30 · +84 28 3636 1234" },
  { n:"02", t:"Nhà máy sản xuất", name:"QS Plant — Bình Dương",
    addr:["Lô A12, KCN Mỹ Phước 3","Thị xã Bến Cát, Bình Dương","Việt Nam"],
    meta:"Mở cửa thăm quan T3 & T5 · Đặt trước 7 ngày" },
];

const faqs = [
  ["QS có hỗ trợ tại chỗ ngoài TP.HCM không?",
    "Có. Đội kỹ thuật QS có mặt tại chỗ trong 24 giờ trên toàn 35 tỉnh thành. Phí dịch vụ tính theo bảng giá công khai, miễn phí cho khách hàng đang trong thời hạn bảo hành."],
  ["Thời gian giao hàng tiêu chuẩn là bao lâu?",
    "Hàng có sẵn (F54, F86, Astro 6AH) giao trong 3–5 ngày làm việc. Hàng đặt riêng (custom config, OEM) giao trong 4–6 tuần kể từ khi xác nhận đơn."],
  ["Có hỗ trợ chế tạo controller riêng không?",
    "Có. Dịch vụ Custom Engineering của QS thiết kế PCB, viết firmware và bàn giao trọn gói trong 8 tuần. Tối thiểu 50 chiếc cho mỗi đơn hàng OEM."],
  ["Bảo hành và phụ tùng thay thế như thế nào?",
    "Bảo hành 24 tháng cho phần cứng, hỗ trợ firmware miễn phí trọn đời sản phẩm. Linh kiện thay thế cam kết sẵn ít nhất 8 năm sau khi ngừng sản xuất."],
];

export default function Contact() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line py-16 pb-12"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 grid md:grid-cols-[1.2fr_1fr] gap-16 items-end">
          <div>
            <div className="qs-eyebrow">Liên hệ · Hỗ trợ trực tiếp 24h tại 35 tỉnh</div>
            <h1 className="font-display font-bold tracking-tight leading-[.95] mt-3.5"
                style={{fontSize:"clamp(56px,7vw,80px)"}}>
              Nói chuyện trực tiếp<br/>
              với người viết<br/>
              <em className="not-italic font-semibold bg-gold-grad bg-clip-text text-transparent">firmware.</em>
            </h1>
          </div>
          <p className="text-base leading-[1.7] text-[#3a3a3a] max-w-[55ch]">
            Bạn cần tư vấn controller cho dây chuyền cụ thể, đặt chế tạo riêng, báo giá lô hàng hay yêu cầu hỗ trợ kỹ thuật khẩn cấp — đội QS phản hồi trong 4 giờ làm việc, có mặt tại chỗ trong 24 giờ trên toàn quốc.
          </p>
        </div>
      </section>

      {/* QUICK CHANNELS */}
      <section className="py-16 bg-white border-b border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line">
            {channels.map(c => (
              <Link key={c.lbl} href="#" className="bg-white p-7 flex flex-col gap-2.5 hover:bg-paper transition-colors relative
                                                     before:content-[''] before:absolute before:top-0 before:left-7 before:w-8 before:h-0.5 before:bg-gold">
                <div className="w-9 h-9 border border-line grid place-items-center text-gold-1 font-mono text-sm">{c.ic}</div>
                <div className="font-mono text-[10px] text-muted tracking-[.16em] uppercase mt-1.5">{c.lbl}</div>
                <div className="font-display text-lg font-semibold tracking-[-.005em] leading-[1.35]">{c.v}</div>
                <div className="text-xs text-[#5a5650] leading-normal">{c.h}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* INSTRUCTIONS + FORM */}
      <section className="py-24 bg-white">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1fr_1.1fr] gap-16 items-start">
          <div>
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ 01 · Gửi yêu cầu ]</span>
            <h2 className="font-display font-bold text-[36px] tracking-[-.015em] mt-2 mb-5 leading-[1.1]">Cần báo giá<br/>hoặc tư vấn riêng?</h2>
            <p className="text-[15px] leading-[1.7] text-[#3a3a3a] m-0 mb-3">
              Điền thông tin bên cạnh, đội kinh doanh QS sẽ liên hệ trong vòng 4 giờ làm việc (từ 8:00 đến 17:30, T2–T6).
            </p>
            <p className="text-[15px] leading-[1.7] text-[#3a3a3a] m-0">
              Nếu cần phản hồi nhanh hơn, gọi trực tiếp hotline <strong className="font-semibold text-ink">+84 28 3636 1234</strong>.
            </p>

            <div className="bg-paper border border-line p-6 mt-8">
              <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-3">Bao gồm các thông tin sau sẽ giúp tư vấn nhanh hơn</div>
              <ul className="list-none p-0 m-0 space-y-2.5">
                {[
                  "Loại máy bạn đang dùng / muốn thiết kế (phay, tiện, uốn, dán keo…)",
                  "Số trục cần điều khiển và yêu cầu vòng hở / vòng kín",
                  "Kích thước hành trình và độ chính xác mong muốn",
                  "Số lượng đặt mua dự kiến và thời gian cần giao",
                  "Đã từng dùng controller nào trước đây (nếu có)",
                ].map(t => (
                  <li key={t} className="text-[13px] text-[#3a3a3a] pl-4 relative
                                          before:content-['▸'] before:absolute before:left-0 before:top-0 before:text-gold-1">{t}</li>
                ))}
              </ul>
            </div>
          </div>

          <form className="bg-white border border-line p-8">
            <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-5">[ 02 · Form liên hệ ]</div>
            <h3 className="font-display font-semibold text-xl tracking-[-.005em] m-0 mb-6">Yêu cầu báo giá &amp; tư vấn</h3>
            <div className="space-y-5">
              <Field label="Họ & tên *" name="name"/>
              <Field label="Công ty"  name="company"/>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email *"     name="email" type="email"/>
                <Field label="Điện thoại *" name="phone" type="tel"/>
              </div>
              <RadioGroup label="Loại yêu cầu" name="reqtype" options={[
                "Báo giá controller","Đặt chế tạo riêng (custom)","Tư vấn kỹ thuật / lắp đặt",
                "Hỗ trợ sau bán hàng","Đặt lịch thăm nhà máy","Đối tác / phân phối","Khác",
              ]}/>
              <RadioGroup label="Sản phẩm quan tâm" name="product" options={[
                "Chưa xác định — cần tư vấn",
                "F-series (F54 / F86 / F10T)",
                "Astro-series (Astro 6AH / 10i / 12X)",
                "Servo motor & drive",
                "Thiết bị DNC",
                "Phụ kiện CNC",
              ]}/>
              <label className="flex items-start gap-3 text-[13px] text-[#3a3a3a] cursor-pointer">
                <input type="checkbox" className="mt-1 accent-ink"/>
                <span>Tôi đồng ý với <Link href="#" className="text-ink underline">chính sách bảo mật</Link> và cho phép QS lưu trữ thông tin để liên hệ phản hồi.</span>
              </label>
              <button type="submit" className="qs-btn qs-btn-gold w-full justify-center mt-2">Gửi yêu cầu →</button>
            </div>
          </form>
        </div>
      </section>

      {/* OFFICES */}
      <section className="py-20 bg-paper border-y border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ 03 · Văn phòng & nhà máy ]</span>
              <h2 className="qs-h2 mt-2">02 địa điểm tại Việt Nam</h2>
            </div>
            <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="#">Đặt lịch thăm quan →</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {offices.map(o => (
              <div key={o.n} className="bg-white border border-line p-8 relative
                                         before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ {o.n} · {o.t} ]</div>
                <h3 className="font-display font-semibold text-[22px] tracking-[-.01em] mt-2.5 mb-4 m-0">{o.name}</h3>
                <p className="m-0 text-sm text-[#3a3a3a] leading-[1.7]">
                  {o.addr.map((line, i) => (
                    <span key={i}>{line}{i < o.addr.length - 1 && <br/>}</span>
                  ))}
                </p>
                <div className="font-mono text-[11px] text-muted tracking-[.12em] mt-5 pt-4 border-t border-line">{o.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ 04 · Câu hỏi thường gặp ]</span>
              <h2 className="qs-h2 mt-2">Trước khi gọi, có thể bạn đã có câu trả lời</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map(([q,a], i) => (
              <div key={q} className="bg-white border border-line p-7">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-2.5">[ {String(i+1).padStart(2,"0")} ]</div>
                <h4 className="font-display font-semibold text-base m-0 mb-2.5 leading-[1.4]">{q}</h4>
                <p className="text-sm text-[#4a4842] leading-[1.7] m-0">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type="text" }: { label:string; name:string; type?:string }) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-1.5">{label}</span>
      <input name={name} type={type} className="w-full border border-line bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"/>
    </label>
  );
}

function RadioGroup({ label, name, options }: { label:string; name:string; options:string[] }) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <label key={o} className="flex items-center gap-1.5 px-3 py-1.5 border border-line text-[13px] text-[#3a3a3a] cursor-pointer hover:border-ink">
            <input type="radio" name={name} value={o} className="accent-ink"/>{o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
