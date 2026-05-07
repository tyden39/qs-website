export const metadata = { title: "Giới thiệu — QS Technology" };

export default function About() {
  const milestones = [
    ["2014","Thành lập tại TP.HCM, phát triển F54 đầu tiên."],
    ["2017","Ra mắt F86 — controller 6 trục cho khuôn mẫu."],
    ["2020","Vượt mốc 500 hệ thống đang chạy tại Việt Nam."],
    ["2023","Astro series — vòng kín, EtherCAT thời gian thực."],
    ["2026","Astro 12X flagship — 12 trục + thị giác máy."],
  ];
  return (
    <>
      <section className="bg-paper border-b border-line py-24">
        <div className="qs-wrap">
          <div className="qs-eyebrow">[ Về QS Technology ]</div>
          <h1 className="qs-h1 mt-3.5 max-w-4xl">12 năm chế tạo controller<br/>cho cơ khí Việt Nam.</h1>
        </div>
      </section>
      <section className="py-24">
        <div className="qs-wrap max-w-4xl">
          <h2 className="qs-h2 mb-10">Cột mốc</h2>
          <div className="space-y-px bg-line border border-line">
            {milestones.map(([y,d]) => (
              <div key={y} className="bg-white grid grid-cols-[120px_1fr] gap-6 p-6 items-center">
                <div className="font-display font-bold text-3xl bg-gold-grad bg-clip-text text-transparent">{y}</div>
                <p className="text-base">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
