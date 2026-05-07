import Link from "next/link";

export const metadata = { title: "Tải về — QS Technology" };

export default function Downloads() {
  const sections = [
    { title:"Datasheet sản phẩm", items:["F54 datasheet rev.3","F86 datasheet rev.2","F10T datasheet rev.4","Astro 6AH datasheet","Astro 10i datasheet","Astro 12X datasheet"] },
    { title:"Firmware",            items:["F54 firmware v2.18.1","F86 firmware v3.04.0","F10T firmware v2.07.5","Astro firmware v4.11.0"] },
    { title:"Phần mềm máy tính",   items:["QS Tuner Windows v1.6","QS Tuner Linux v1.6","Vision Studio v0.9 (beta)"] },
    { title:"Tài liệu kỹ thuật",   items:["G-code reference (96tr)","Hướng dẫn lắp đặt servo","Sơ đồ đấu nối điển hình","Hướng dẫn EtherCAT"] },
  ];
  return (
    <section className="py-20">
      <div className="qs-wrap">
        <div className="qs-eyebrow">[ Tài liệu & phần mềm ]</div>
        <h1 className="qs-h2 mt-2 mb-10">Trung tâm tải về</h1>
        <div className="space-y-12">
          {sections.map(s => (
            <div key={s.title}>
              <h2 className="font-display font-semibold text-xl border-b border-line pb-3 mb-5">{s.title}</h2>
              <ul className="grid md:grid-cols-2 gap-px bg-line border border-line">
                {s.items.map(i => (
                  <li key={i} className="bg-white"><Link href="#" className="flex justify-between items-center p-4 hover:bg-paper-2"><span className="text-sm">{i}</span><span className="font-mono text-[10px] text-gold-1">↓ TẢI VỀ</span></Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
