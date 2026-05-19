import Link from "next/link";

export const metadata = { title: "Dịch vụ chế tạo — QS Technology" };

const capabilities = [
  { n:"01", area:"Hardware",   t:"Thiết kế PCB & cơ khí vỏ",
    d:"PCB 4–8 lớp, layout signal/power chuyên cho môi trường nhiễu công nghiệp. Vỏ nhôm gia công CNC, mặt phím membrane tùy biến.",
    tags:["Altium Designer · KiCAD","4-layer / 8-layer · impedance ctrl","SolidWorks enclosure · IP54"] },
  { n:"02", area:"Firmware",   t:"Firmware & thuật toán quỹ đạo",
    d:"Lõi RTOS chạy look-ahead 256 block, NURBS interpolation, S-curve acceleration. Hỗ trợ G-code chuẩn ISO 6983 và macro mở rộng.",
    tags:["ARM Cortex-M7 / FPGA","FreeRTOS · EtherCAT master","PLC ladder · macro G/M"] },
  { n:"03", area:"Integration", t:"Tích hợp & chạy thử tại xưởng",
    d:"Đội kỹ thuật QS đến tận xưởng khách hàng để lắp đặt, tuning servo, hiệu chuẩn trục và đào tạo vận hành. Bảo hành 24 tháng tại chỗ.",
    tags:["On-site commissioning","Servo tuning · backlash comp","Đào tạo vận hành tiếng Việt"] },
];

const steps = [
  { w:"W1", n:"01", t:"Tư vấn & khảo sát", d:"Phân tích máy hiện tại, requirements I/O, servo, HMI. Báo giá & SOW." },
  { w:"W2", n:"02", t:"Thiết kế PCB",       d:"Schematic + layout. Review cùng khách hàng. Đặt linh kiện." },
  { w:"W3–4", n:"03", t:"Sản xuất prototype", d:"SMT trong nước. Test rung, EMC, nhiệt. Bring-up firmware nền tảng." },
  { w:"W5–6", n:"04", t:"Firmware & HMI",   d:"Cấu hình macro, ladder, giao diện vận hành tiếng Việt cho dòng máy của bạn." },
  { w:"W7–8", n:"05", t:"Lắp đặt & bàn giao", d:"On-site tại xưởng, tuning, FAT/SAT, đào tạo vận hành. Bảo hành 24 tháng." },
];

export default function Service() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-12 pb-18">
          <div className="qs-crumb mb-8">
            <Link href="/">Trang chủ</Link><span className="sep">/</span>
            <span className="here">Dịch vụ</span>
          </div>
          <div className="qs-eyebrow">Service · Custom Manufacturing</div>
          <h1 className="qs-h1 mt-3.5" style={{fontSize:"clamp(54px,7vw,96px)"}}>
            Chế tạo bộ điều khiển<br/>
            <em className="not-italic font-semibold bg-gold-grad bg-clip-text text-transparent">theo yêu cầu</em>
          </h1>
          <p className="qs-lede mt-6 max-w-[62ch]">
            Khi không có bất kỳ controller nào trên thị trường khớp với máy của bạn — chúng tôi thiết kế PCB, viết firmware, sản xuất tại Việt Nam và bàn giao một bộ điều khiển trọn gói cho dây chuyền của bạn.
          </p>

          <div className="mt-12 grid grid-cols-4 border-t border-line pt-6">
            {[
              ["12 năm","Kinh nghiệm"],
              ["8 tuần","Lead-time điển hình"],
              ["100%","Made in Vietnam"],
              ["800+","Bộ đã giao"],
            ].map(([v,l], i) => (
              <div key={l} className={`pr-12 ${i < 3 ? "border-r border-line" : ""}`}>
                <div className="font-display font-bold text-[30px] tracking-[-.01em]">{v}</div>
                <div className="font-mono text-[10px] text-muted tracking-[.16em] uppercase mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PITCH */}
      <section className="py-24 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="grid md:grid-cols-[1fr_1.4fr] gap-16 items-start">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Why custom ]</span>
              <h2 className="qs-h2 mt-2">Khi controller<br/>tiêu chuẩn<br/>không đủ</h2>
            </div>
            <div>
              <p className="text-[17px] leading-[1.75] text-[#3a3a3a] m-0 mb-3.5">
                Bạn đang chế tạo một máy gia công đặc thù — máy uốn ống ba mặt, máy chạm khắc kim hoàn, máy phay 6 trục cho ngành y tế? Các bộ điều khiển CNC nhập khẩu thường thừa tính năng nhưng thiếu I/O hoặc không khớp với protocol servo của bạn — và chi phí cao gấp 3 lần thực tế cần thiết.
              </p>
              <p className="text-[17px] leading-[1.75] text-[#3a3a3a] m-0">
                <strong className="font-semibold text-ink">QS Technology nhận thiết kế và chế tạo bộ điều khiển CNC riêng cho từng dòng máy:</strong> từ PCB, firmware đến HMI tiếng Việt. Khách hàng nhận được phần cứng phù hợp 100% nhu cầu, hỗ trợ kỹ thuật trong nước, và quyền sở hữu firmware trọn đời.
              </p>
              <blockquote className="mt-8 border-l-2 border-gold pl-6 py-1.5 font-display italic text-[22px] leading-[1.4] text-ink max-w-[50ch] m-0">
                "Một controller được thiết kế đúng — không thừa, không thiếu — luôn rẻ hơn một controller mua sẵn cộng với 6 tháng workaround."
                <cite className="block mt-3.5 font-mono text-[11px] not-italic text-muted tracking-[.12em]">— Nguyên tắc kỹ thuật QS</cite>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="py-24 bg-paper border-y border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Capabilities ]</span>
              <h2 className="qs-h2 mt-2">Năng lực kỹ thuật</h2>
            </div>
            <span className="font-mono text-[11px] text-muted tracking-[.1em] uppercase">3 disciplines · 1 team</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {capabilities.map(c => (
              <div key={c.n} className="bg-white border border-line p-8 relative
                                         before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ {c.n} / {c.area} ]</div>
                <h3 className="font-display font-semibold text-[22px] tracking-[-.01em] mt-3 mb-3 m-0">{c.t}</h3>
                <p className="text-sm text-[#4a4842] leading-[1.7] m-0 mb-5">{c.d}</p>
                <ul className="list-none p-0 m-0 flex flex-col gap-1.5 pt-4 border-t border-line">
                  {c.tags.map(tag => (
                    <li key={tag} className="font-mono text-[11px] text-muted tracking-[.08em]">{tag}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-24 bg-white" id="process">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Process · 8 weeks ]</span>
              <h2 className="qs-h2 mt-2">Quy trình chế tạo</h2>
            </div>
            <p className="text-sm text-muted leading-[1.7] max-w-[44ch] m-0">
              Từ buổi tư vấn kỹ thuật đầu tiên đến lúc bộ điều khiển vận hành ổn định trên dây chuyền của bạn — toàn bộ quá trình mất khoảng 8 tuần. Mỗi giai đoạn có deliverable rõ ràng và checkpoint với khách hàng.
            </p>
          </div>
          <div className="grid md:grid-cols-5 gap-px bg-line border border-line">
            {steps.map(s => (
              <div key={s.n} className="bg-white p-6 relative
                                         before:content-[''] before:absolute before:top-0 before:left-6 before:w-8 before:h-0.5 before:bg-gold">
                <div className="font-mono text-xs text-gold-1 tracking-[.16em]">{s.w} · {s.n}</div>
                <h3 className="font-display font-semibold text-[17px] mt-3 m-0 leading-[1.3]">{s.t}</h3>
                <p className="text-[13px] text-muted leading-[1.6] mt-2 m-0">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT INFO + FORM */}
      <section className="py-24 bg-paper border-t border-line" id="quote">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1fr_1.2fr] gap-16 items-start">
          <div>
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Liên hệ ]</span>
            <h2 className="qs-h2 mt-2">Bắt đầu một dự án<br/>chế tạo controller</h2>
            <p className="text-[15px] leading-[1.7] text-[#3a3a3a] mt-5">
              Mô tả ngắn gọn loại máy, số trục, servo bạn đang dùng và mục tiêu. Đội kỹ thuật QS sẽ phản hồi trong vòng 48 giờ làm việc, kèm báo giá sơ bộ và lịch khảo sát.
            </p>
            <ul className="mt-7 space-y-4 list-none p-0 m-0">
              {[
                ["Hotline",   "+84 24 3997 6688"],
                ["Email",     "contact@qstechnology.vn"],
                ["Xưởng",     "KCN Quang Minh, Hà Nội"],
                ["Văn phòng", "Hà Nội · Đà Nẵng · TP.HCM"],
              ].map(([l,v]) => (
                <li key={l} className="grid grid-cols-[110px_1fr] gap-4 items-baseline border-b border-line pb-3.5 last:border-b-0">
                  <span className="font-mono text-[10px] text-muted tracking-[.16em] uppercase">{l}</span>
                  <span className="font-display text-[15px] font-semibold text-ink">{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <form className="bg-white border border-line p-8">
            <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-5">[ Yêu cầu báo giá ]</div>
            <div className="space-y-5">
              <Field label="Họ tên *" name="name"/>
              <Field label="Công ty"  name="company"/>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email *"   name="email"   type="email"/>
                <Field label="Điện thoại" name="phone"   type="tel"/>
              </div>
              <RadioGroup label="Loại máy" name="machine" options={["Máy phay CNC","Máy uốn ống","Máy uốn lò xo","Máy dán keo","Máy kim hoàn","Khác"]}/>
              <RadioGroup label="Số trục"  name="axes"    options={["3 trục","4 trục","5 trục","6+ trục"]}/>
              <button type="submit" className="qs-btn qs-btn-gold w-full justify-center mt-2">Gửi yêu cầu →</button>
            </div>
          </form>
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
