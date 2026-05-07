export const metadata = { title: "Dịch vụ chế tạo — QS Technology" };

export default function Service() {
  const steps = [
    { n:"01", t:"Khảo sát yêu cầu",    d:"Kỹ sư QS đến nhà máy đo điều kiện thực tế, lấy thông số máy hiện có." },
    { n:"02", t:"Thiết kế phần cứng",   d:"Vẽ schematic, layout PCB, chọn linh kiện theo ngân sách & môi trường." },
    { n:"03", t:"Sản xuất mẫu (DVT)",   d:"Gia công 1–3 board mẫu, test rung lắc, EMC, chạy 72h liên tục." },
    { n:"04", t:"Bàn giao & bảo trì",   d:"Lắp đặt tại nhà máy, đào tạo vận hành, bảo hành 24 tháng tại chỗ." },
  ];
  return (
    <>
      <section className="bg-ink-2 text-white py-24">
        <div className="qs-wrap">
          <div className="qs-eyebrow !text-gold-2 before:!bg-gold-3">[ Dịch vụ chế tạo riêng ]</div>
          <h1 className="qs-h1 mt-3.5 max-w-4xl">Khi controller chuẩn<br/>không vừa nhà máy của bạn.</h1>
          <p className="mt-6 max-w-2xl text-lg text-[#cfc9b8] leading-relaxed">QS thiết kế và sản xuất bộ điều khiển theo yêu cầu — từ board nhỏ 50 × 70 mm đến hệ thống đa trục lớn, làm tại xưởng TP.HCM.</p>
        </div>
      </section>
      <section className="py-24 border-b border-line">
        <div className="qs-wrap">
          <h2 className="qs-h2 mb-10">Quy trình 4 bước</h2>
          <div className="grid md:grid-cols-4 gap-px bg-line border border-line">
            {steps.map(s => (
              <div key={s.n} className="bg-white p-7">
                <div className="font-mono text-xs text-gold-1 tracking-[.16em]">{s.n}</div>
                <h3 className="font-display font-semibold text-lg mt-3">{s.t}</h3>
                <p className="text-sm text-muted leading-relaxed mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
