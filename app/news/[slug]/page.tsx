import { notFound } from "next/navigation";
import Link from "next/link";
import { news } from "@/data/news";

export function generateStaticParams() { return news.map(n => ({ slug: n.slug })); }

const articleBody = {
  intro: "Bình Dương, 28/04/2026 — QS Technology hôm nay chính thức công bố Astro 12X, dòng controller mới nhất trong gia đình Astro-series, với khả năng điều khiển đồng thời 12 trục servo qua giao thức EtherCAT thời gian thực. Đây là sản phẩm đầu bảng của QS, hướng tới các dây chuyền tự động hoá phức tạp như máy gia công đa trục, robot công nghiệp và hệ thống cấp phôi tự động.",
  intro2: "So với Astro 10i đang là flagship hiện tại với 6 trục đồng bộ, Astro 12X tăng gấp đôi số trục, chu kỳ EtherCAT giảm từ 500 µs xuống 250 µs, đồng thời tích hợp sẵn module xử lý hình ảnh (machine vision) qua cổng GigE Vision — cho phép triển khai các ứng dụng pick-and-place, kiểm tra chất lượng inline mà không cần thiết bị bên thứ ba.",
  sections: [
    { id:"why-12-axis", h:"Vì sao là 12 trục?",
      paras:[
        "Trong khảo sát khách hàng OEM năm 2025 của QS, 43% trong số 120 nhà tích hợp được hỏi cho biết họ đang phải ghép 2 controller để đủ số trục cho dây chuyền của mình — đặc biệt là các máy CNC 5-trục có cụm đổi dao tự động ATC, hoặc dây chuyền cấp phôi có nhiều cánh tay robot.",
      ],
      quote: { text:"Chúng tôi muốn loại bỏ tình huống khách hàng phải dùng 2 controller riêng và đồng bộ qua bus chậm. Astro 12X là câu trả lời — một bộ điều khiển duy nhất cho cả dây chuyền.", cite:"— Lê Thanh Mai, CTO QS Technology" },
      after:["Astro 12X được phát triển trong 18 tháng, với hơn 400 giờ thử nghiệm thực tế tại 3 nhà máy đối tác ở Bình Dương, Long An và Hải Phòng. Phiên bản đang trưng bày tại VME 2026 là bản pilot đã chạy liên tục 720 giờ trên dây chuyền tiện-phay 8 trục mà không gặp sự cố nào."],
    },
    { id:"specs", h:"Thông số nổi bật",
      list:[
        "12 trục servo đồng bộ qua EtherCAT, chu kỳ 250 µs / 500 µs có thể chọn",
        "Giao diện cảm ứng 12.1\" độ phân giải 1280×800, gorilla glass, chống dầu IP65 mặt trước",
        "Module thị giác máy GigE Vision tích hợp, hỗ trợ camera Basler / Hikvision lên tới 5 MP",
        "Bộ nhớ chương trình 64 GB SSD công nghiệp, lưu trữ tới 12.000 program",
        "Kết nối 2× Gigabit Ethernet, Wi-Fi 6, Modbus TCP, OPC UA, MQTT",
        "Vỏ nhôm đúc CNC tản nhiệt thụ động, không cần quạt — vận hành 0–55°C",
      ],
    },
    { id:"shipping", h:"Lộ trình giao hàng",
      paras:[
        "Đặt hàng mở từ 15/05/2026, ưu tiên cho khách hàng đang vận hành Astro 10i và F86. Lô đầu 60 chiếc dự kiến giao tháng 9/2026, công suất ổn định 80 chiếc/tháng từ Q4. Giá niêm yết phiên bản tiêu chuẩn 89 triệu VND, bao gồm bảo hành 24 tháng và đào tạo vận hành 3 ngày tại nhà máy QS.",
      ],
    },
    { id:"demo", h:"Tham gia demo trực tiếp",
      paras:[
        "Astro 12X sẽ được trưng bày và demo trực tiếp tại VME 2026, Booth A23, SECC TP.HCM từ 22–25/04/2026. Khách hàng có nhu cầu trao đổi sâu về cấu hình có thể đặt lịch riêng với đội kỹ thuật qua email sales@qstechnology.vn hoặc hotline +84 28 3636 1234.",
      ],
    },
  ],
  tags:["astro-12x","flagship","ethercat","12-axis","machine-vision","vme-2026","san-pham-moi"],
};

export default function NewsDetail({ params }: { params: { slug: string } }) {
  const n = news.find(x => x.slug === params.slug);
  if (!n) notFound();
  const others = news.filter(x => x.slug !== params.slug).slice(0, 3);
  const isFlagship = params.slug === "astro-12x";

  return (
    <article>
      {/* CRUMB */}
      <div className="bg-white border-b border-line py-3.5">
        <div className="max-w-wrap mx-auto px-12 flex items-center gap-2.5 font-mono text-[11px] text-muted tracking-[.12em] uppercase">
          <Link href="/" className="hover:text-ink">Trang chủ</Link><span className="text-gold-1">/</span>
          <Link href="/news" className="hover:text-ink">Tin tức</Link><span className="text-gold-1">/</span>
          <Link href="/news" className="hover:text-ink">{n.cat}</Link><span className="text-gold-1">/</span>
          <span className="text-ink font-semibold">{n.title.slice(0, 40)}…</span>
        </div>
      </div>

      {/* HEAD */}
      <section className="py-16 pb-12 bg-white border-b border-line">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1fr_320px] gap-16 items-start">
          <div>
            <div className="flex gap-2 items-center">
              <span className="inline-block font-mono text-[10px] bg-gold text-ink-2 py-1 px-3 tracking-[.16em] uppercase font-semibold">[ {n.cat} ]</span>
              {isFlagship && <span className="inline-block font-mono text-[10px] bg-ink text-gold-2 py-1 px-3 tracking-[.16em] uppercase font-semibold">[ Tin nổi bật ]</span>}
            </div>
            <h1 className="font-display font-bold tracking-[-.02em] leading-[1.1] text-balance mt-4.5 mb-6"
                style={{fontSize:"clamp(40px,5vw,60px)"}}>{n.title}</h1>
            <p className="text-lg leading-[1.7] text-[#3a3a3a] max-w-[65ch] text-pretty">{n.excerpt}</p>
          </div>
          <aside className="border border-line p-6 flex flex-col gap-4 bg-paper">
            {[
              ["Ngày đăng",  n.date],
              ["Tác giả",    "QS Newsroom"],
              ["Đọc trong",  "4 phút · 820 từ"],
              ["Chuyên mục", n.cat],
            ].map(([l,v]) => (
              <div key={l} className="flex flex-col gap-1">
                <span className="font-mono text-[9px] text-muted tracking-[.18em] uppercase">{l}</span>
                <span className="font-display text-sm font-semibold text-ink">{v}</span>
              </div>
            ))}
            <hr className="border-0 border-t border-line m-0"/>
            <div>
              <span className="font-mono text-[9px] text-muted tracking-[.18em] uppercase block mb-2">Chia sẻ</span>
              <div className="flex gap-2">
                {["FB","TW","LI"].map(s => (
                  <a key={s} href="#" className="w-8 h-8 border border-line grid place-items-center text-muted hover:text-ink hover:border-ink font-mono text-[10px]">{s}</a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* HERO IMG */}
      <section className="bg-ink-2 border-b border-line">
        <div className="aspect-[21/9] relative overflow-hidden">
          <svg viewBox="0 0 1200 514" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
            <rect width="1200" height="514" fill="#1a1815"/>
            <g fill="#3a3530"><rect x="120" y="80" width="400" height="354"/><rect x="540" y="80" width="240" height="354"/><rect x="800" y="80" width="280" height="354"/></g>
            <rect x="160" y="160" width="320" height="200" fill="#0a1a2a"/>
            <text x="200" y="220" fontFamily="JetBrains Mono,monospace" fontSize="22" fill="#e8c878">QS · 2026</text>
            <text x="200" y="260" fontFamily="JetBrains Mono,monospace" fontSize="40" fill="#fff" fontWeight="700">ASTRO 12X</text>
            <circle cx="940" cy="260" r="40" fill="#c8553d"/>
            <circle cx="940" cy="260" r="18" fill="#e8c878"/>
          </svg>
          <div className="absolute left-0 right-0 bottom-0 px-6 py-3.5 text-[#7a7570] font-mono text-[10px] tracking-[.18em]"
               style={{background:"linear-gradient(0deg,rgba(10,10,8,.85),transparent)"}}>
            FIG. 01 · QS ASTRO 12X · 12-AXIS CONTROLLER · DEMO UNIT · BINH DUONG PLANT · 04/2026
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="py-20 bg-white">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1fr_240px] gap-20 items-start">
          <article className="text-base leading-[1.85] text-[#2a2520] max-w-[68ch]">
            {isFlagship ? (
              <>
                <p className="m-0 mb-6 text-pretty">{articleBody.intro}</p>
                <p className="m-0 mb-6 text-pretty">{articleBody.intro2}</p>

                {articleBody.sections.map(s => (
                  <div key={s.id}>
                    <h2 id={s.id} className="font-display font-bold text-[28px] tracking-[-.01em] leading-[1.2] mt-12 mb-4
                                              before:content-[''] before:block before:w-8 before:h-0.5 before:bg-gold-grad before:mb-3.5">
                      {s.h}
                    </h2>
                    {s.paras?.map((p, i) => <p key={i} className="m-0 mb-6">{p}</p>)}
                    {s.quote && (
                      <blockquote className="my-8 py-6 px-7 bg-paper border-l-[3px] border-gold-2 font-display italic text-lg text-ink leading-[1.5] m-0">
                        "{s.quote.text}"
                        <cite className="block mt-3.5 font-mono text-[11px] not-italic text-muted tracking-[.12em]">{s.quote.cite}</cite>
                      </blockquote>
                    )}
                    {s.after?.map((p, i) => <p key={i} className="m-0 mb-6">{p}</p>)}
                    {s.list && (
                      <ul className="list-none p-0 m-0 mb-6">
                        {s.list.map(item => (
                          <li key={item} className="py-2.5 pl-6 border-b border-line relative
                                                    before:content-['▸'] before:absolute before:left-1 before:top-2.5 before:text-gold-1 before:text-xs">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {/* Tags */}
                <div className="mt-12 pt-6 border-t border-line">
                  <span className="font-mono text-[10px] text-muted tracking-[.16em] uppercase block mb-3">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {articleBody.tags.map(t => (
                      <span key={t} className="qs-tag">{t}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="m-0 mb-6 text-pretty">{n.excerpt}</p>
                <p className="m-0 mb-6 text-pretty">Bài viết chi tiết đang được biên tập. Theo dõi QS Newsroom để nhận thông tin cập nhật mới nhất về sản phẩm, sự kiện và đối tác.</p>
              </>
            )}
          </article>

          <aside className="border-l border-line pl-8 sticky top-32">
            <div className="font-mono text-[10px] text-gold-1 tracking-[.18em] uppercase mb-4">[ Trong bài ]</div>
            <ul className="list-none p-0 m-0 space-y-2.5">
              {(isFlagship ? articleBody.sections : []).map(s => (
                <li key={s.id}><a href={`#${s.id}`} className="text-sm text-muted hover:text-ink leading-[1.4] block">{s.h}</a></li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* RELATED */}
      <section className="py-20 bg-paper border-t border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Bài liên quan ]</span>
              <h2 className="qs-h2 mt-2">Đọc thêm</h2>
            </div>
            <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/news">Tất cả tin tức →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {others.map(o => (
              <Link key={o.slug} href={`/news/${o.slug}`}
                    className="bg-white border border-line p-7 hover:-translate-y-0.5 hover:border-ink transition-all">
                <span className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ {o.cat} ]</span>
                <h3 className="font-display font-semibold text-lg leading-[1.35] tracking-[-.005em] mt-3 mb-3">{o.title}</h3>
                <div className="font-mono text-[10px] text-muted tracking-[.14em] pt-3.5 border-t border-line">{o.date}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
