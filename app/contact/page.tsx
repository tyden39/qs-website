export const metadata = { title: "Liên hệ — QS Technology" };

export default function Contact() {
  return (
    <section className="py-20">
      <div className="qs-wrap grid md:grid-cols-[1.2fr_1fr] gap-16">
        <div>
          <div className="qs-eyebrow">[ Liên hệ ]</div>
          <h1 className="qs-h2 mt-2 mb-8">Tư vấn & báo giá</h1>
          <form className="space-y-5 max-w-lg">
            <Field label="Họ và tên"     name="name"    />
            <Field label="Công ty"        name="company" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email"  name="email" type="email" />
              <Field label="SĐT"    name="phone" type="tel" />
            </div>
            <Field label="Mô tả nhu cầu" name="msg"  textarea />
            <button type="submit" className="qs-btn qs-btn-gold">Gửi yêu cầu →</button>
          </form>
        </div>
        <aside className="bg-paper-2 border border-line p-8 self-start">
          <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ Văn phòng chính ]</div>
          <h3 className="font-display font-semibold text-xl mt-2">QS Technology Co., Ltd</h3>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed">
            <li><b className="block text-muted font-mono text-[10px] uppercase tracking-wider">Địa chỉ</b>123 KCN Tân Bình, Q. Tân Bình, TP.HCM</li>
            <li><b className="block text-muted font-mono text-[10px] uppercase tracking-wider">Hotline</b>+84 28 3636 1234</li>
            <li><b className="block text-muted font-mono text-[10px] uppercase tracking-wider">Email</b>sales@qstechnology.vn</li>
            <li><b className="block text-muted font-mono text-[10px] uppercase tracking-wider">Giờ làm việc</b>T2–T7 · 08:00 – 17:30</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

function Field({ label, name, type="text", textarea=false }:{ label:string; name:string; type?:string; textarea?:boolean }) {
  const cls = "w-full border border-line bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-ink transition-colors";
  return (
    <label className="block">
      <span className="block font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-1.5">{label}</span>
      {textarea ? <textarea name={name} rows={4} className={cls}/> : <input name={name} type={type} className={cls}/>}
    </label>
  );
}
