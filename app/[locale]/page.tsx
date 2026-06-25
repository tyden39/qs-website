import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import Reveal from "@/components/reveal";
import { buildAlternates } from "@/lib/seo/alternates";
import type { Locale } from "@/lib/i18n/config";

const titles: Record<string, string> = {
  vi: "Bộ điều khiển CNC Made in Vietnam",
  en: "CNC Controllers Made in Vietnam",
};
const descs: Record<string, string> = {
  vi: "Sáu dòng controller cho phay, uốn, dán keo, kim hoàn — phần cứng QS, firmware QS, hỗ trợ kỹ thuật trong nước. Đã triển khai trên 800+ dây chuyền tại Việt Nam.",
  en: "Six controller lines for milling, bending, gluing, and jewellery — QS hardware, QS firmware, domestic technical support. Deployed on 800+ production lines.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = titles[locale] ?? titles.vi;
  const description = descs[locale] ?? descs.vi;
  return {
    title,
    description,
    alternates: buildAlternates("/"),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const apps = [
  { slug: "phay-cnc", n: "01", t: "Máy phay CNC", img: "/home/app-phay-cnc.webp" },
  { slug: "cua-long", n: "02", t: "Máy cưa lọng", img: "/home/app-cua-long.webp" },
  { slug: "dan-keo", n: "03", t: "Máy dán keo", img: "/home/app-dan-keo.webp" },
  { slug: "uon-lo-xo", n: "05", t: "Máy uốn lò xo", img: "/home/app-uon-lo-xo.webp" },
];

const homeProducts = [
  {
    slug: "f86",
    lbl: "[ F-series ]",
    name: "F86 Controller",
    desc: "Controller 6 trục ứng dụng trên đa dạng dòng máy. Hỗ trợ điều khiển Pulse Train — EtherCAT.",
    img: "/home/product-f86.webp",
    meta: ["6 axis · closed loop", "pulse train / ethercat"],
  },
  {
    slug: "astro-6ah",
    lbl: "[ Astro-series ]",
    name: "Astro 6AH Controller",
    desc: "Flagship 6 trục vòng kín, EtherCAT, cho gia công khuôn mẫu và linh kiện y tế chính xác cao.",
    img: "/home/product-astro-6ah.webp",
    meta: ["6 axis · closed loop", "pulse train / ethercat / mechatrolink mii,miii"],
  },
  {
    slug: "f86",
    lbl: "[ F-series ]",
    name: "F86 Controller",
    desc: "Controller 6 trục ứng dụng trên đa dạng dòng máy. Hỗ trợ điều khiển Pulse Train — EtherCAT.",
    img: "/home/product-f86-open.webp",
    meta: ["6 axis · open loop", "pulse train / ethercat"],
  },
];

const playlist: [string, string][] = [
  ["01 · Astro 6AH gia công khuôn nhôm", "02:14"],
  ["02 · Lắp đặt F86 trên máy phay 6 trục", "03:48"],
  ["03 · Hệ thống dán keo dùng F54", "01:36"],
  ["04 · Máy uốn lò xo điều khiển QS", "02:52"],
];

const sideNews = [
  {
    href: "/news",
    date: "22 · 04 · 2026",
    cat: "Sự kiện",
    title: 'QS góp mặt tại vòng chung kết cuộc thi "The Future Brand — Made By Vietnam" 2025',
  },
  {
    href: "/news/precitech-long-an",
    date: "15 · 04 · 2026",
    cat: "Khách hàng",
    title: "Bàn giao 24 controller F86 cho Tổng công ty PRECITECH Long An",
  },
  {
    href: "/news/firmware-v42",
    date: "02 · 04 · 2026",
    cat: "Kỹ thuật",
    title: "Firmware v4.2 — bổ sung G-code tuỳ biến và post-processor Mastercam",
  },
  {
    href: "/news/binh-duong-expansion",
    date: "18 · 03 · 2026",
    cat: "Công ty",
    title: "QS mở rộng nhà máy Bình Dương lên 4.200m² — công suất tăng 2,5×",
  },
];

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  await params;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-16 pb-20">
          <div className="grid md:grid-cols-[1.05fr_1fr] gap-16 items-center">
            <div>
              <Reveal><span className="qs-eyebrow">QS Technology · Made by Vietnam · 2026</span></Reveal>
              <Reveal delay={80}>
                <h1 className="qs-h1 mt-3.5" style={{ fontSize: "clamp(48px,6vw,84px)", lineHeight: ".98" }}>
                  <em className="not-italic font-semibold bg-gold-grad bg-clip-text text-transparent">Astro10i</em><br />
                  Controller
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-6 text-lg leading-[1.65] text-[#3a3a3a] max-w-[55ch]">
                  Thuộc dòng Premium High-End của QS Technology. Sở hữu cấu hình mạnh mẽ vượt trội và thuật toán nội suy tốc độ cao, Astro10i đem đến trải nghiệm gia công mượt mà, chuyên nghiệp — đạt độ ổn định mà các bộ điều khiển thông thường không thể đáp ứng.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="flex gap-3 mt-8">
                  <Link className="qs-btn qs-btn-gold" href="/products/astro-10i">Thông tin chi tiết <span className="arr">→</span></Link>
                </div>
              </Reveal>
            </div>

            {/* hero visual */}
            <Reveal delay={120}>
              <div className="relative bg-white border border-line p-5">
                <div className="flex items-center gap-1.5 pb-4 mb-4 border-b border-line">
                  <span className="w-2.5 h-2.5 rounded-full bg-rust"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-line-2"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-line-2"></span>
                  <span className="ml-auto font-mono text-[10px] tracking-[.16em] uppercase text-muted">Astro 10i</span>
                </div>
                <Image src="/home/hero-astro10i.webp" alt="Bộ điều khiển CNC QS Astro 10i" width={700} height={1373}
                       priority className="w-full h-auto block" />
                <div className="mt-4 font-mono text-[9px] tracking-[.18em] uppercase text-muted">FIG. 01 · CNC CONTROLLER · ASTRO 10i</div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* APPS */}
      <section className="py-24 bg-paper">
        <div className="max-w-wrap mx-auto px-12">
          <Reveal>
            <div className="qs-section-head">
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Applications ]</span>
                <h2 className="qs-h2 mt-2">Ứng dụng.</h2>
              </div>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/applications">Xem tất cả <span className="arr">→</span></Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {apps.map((a, i) => (
              <Reveal key={a.slug} className="h-full" delay={i * 80}>
                <Link href={`/applications/${a.slug}`}
                      className="group h-full bg-white border border-line p-6 flex flex-col gap-3.5 hover:-translate-y-0.5 hover:border-ink transition-all">
                  <div className="relative aspect-[5/4] border border-line overflow-hidden"
                       style={{ background: "radial-gradient(circle, #fff, #f0eee8)" }}>
                    <Image src={a.img} alt={a.t} fill sizes="(max-width:768px) 50vw, 25vw"
                           className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <span className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">Application {a.n}</span>
                  <h4 className="font-display font-semibold text-[17px] m-0">{a.t}</h4>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="flex justify-center mt-10">
            <Link className="qs-btn qs-btn-gold" href="/applications">Xem thêm <span className="arr">→</span></Link>
          </Reveal>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="py-24 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <Reveal>
            <div className="qs-section-head">
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Update: 13-06-2026 ]</span>
                <h2 className="qs-h2 mt-2">QS Controller</h2>
              </div>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/products">Xem tất cả <span className="arr">→</span></Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line">
            {homeProducts.map((item, i) => (
              <Reveal key={`${item.slug}-${i}`} className="h-full" delay={i * 80}>
                <Link href={`/products/${item.slug}`}
                      className="group h-full bg-white p-7 flex flex-col gap-3.5 hover:bg-paper transition-colors relative
                                 before:content-[''] before:absolute before:top-0 before:left-6 before:w-8 before:h-0.5 before:bg-gold">
                  <div className="font-mono text-[11px] text-gold-1 tracking-[.16em]">{item.lbl}</div>
                  <h3 className="font-display font-semibold text-[22px] tracking-[-.01em] m-0">{item.name}</h3>
                  <p className="text-[13px] text-muted leading-[1.55] m-0">{item.desc}</p>
                  <div className="relative flex-1 min-h-[180px] border border-line overflow-hidden"
                       style={{ background: "radial-gradient(circle, #fff, #f0eee8)" }}>
                    <Image src={item.img} alt={item.name} fill sizes="(max-width:768px) 100vw, 33vw"
                           className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <div className="flex justify-between items-center pt-3.5 border-t border-line font-mono text-[11px] tracking-[.12em] uppercase text-muted">
                    <span className="leading-[1.5]">{item.meta[0]}<br />{item.meta[1]}</span>
                    <span className="text-ink">→</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="flex justify-center mt-10">
            <Link className="qs-btn qs-btn-gold" href="/products">Xem thêm <span className="arr">→</span></Link>
          </Reveal>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-20 bg-ink text-[#cfc9b8] relative overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg opacity-[.12]"></div>
        <div className="relative max-w-wrap mx-auto px-12">
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-16 items-center">
            <Reveal>
              <span className="font-mono text-[11px] text-gold-2 tracking-[.16em] uppercase">[ About us ]</span>
              <h2 className="qs-h2 text-white mt-2">Đôi nét về QS Technology Co., LTD.</h2>
              <p className="text-[#a8a499] text-base leading-[1.7] max-w-[64ch] mt-5">
                QS Technology Co., LTD. Chúng tôi tự hào là đơn vị tiên phong phát triển, ứng dụng và thương mại sản phẩm bộ điều khiển CNC “Made By Vietnam”. Sau nhiều năm phát triển, những sản phẩm mang thương hiệu QS Technology ngày càng nhận được nhiều sự tin tưởng, quan tâm từ khách hàng trong cũng như ngoài nước.
              </p>
              <p className="text-[#a8a499] text-base leading-[1.7] max-w-[64ch] mt-4">
                Bên cạnh đó, từ những thế mạnh và kinh nghiệm tích lũy sau nhiều năm hoạt động trong lĩnh vực chế tạo máy, hệ thống tự động hóa và board mạch điện tử, chúng tôi tự tin làm chủ phần công nghệ lõi, phát triển đa dạng và làm hài lòng những mong muốn của khách hàng.
              </p>
              <Link className="qs-btn qs-btn-gold mt-8" href="/about">Xem thêm <span className="arr">→</span></Link>
            </Reveal>
            <Reveal delay={120}>
              <div className="relative border border-[#2a2620] overflow-hidden">
                <Image src="/home/about-qs.webp" alt="Nhà máy QS Technology" width={900} height={657}
                       sizes="(max-width:768px) 100vw, 40vw" className="w-full h-auto block" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="py-24 bg-white border-t border-line">
        <div className="max-w-wrap mx-auto px-12">
          <Reveal>
            <div className="qs-section-head">
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Showreel · 02:14 ]</span>
                <h2 className="qs-h2 mt-2">QS Controller Videos</h2>
              </div>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="#">Kênh YouTube <span className="arr">→</span></Link>
            </div>
          </Reveal>
          <Reveal>
            <div className="grid md:grid-cols-[2fr_1fr] gap-px bg-line border border-line">
              <div className="group relative bg-ink-2 aspect-video overflow-hidden">
                <Image src="/home/video-thumb.webp" alt="QS F86 — Ứng dụng trên máy uốn lò xo CNC" fill
                       sizes="(max-width:768px) 100vw, 66vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full grid place-items-center border-0 cursor-pointer text-ink-2 transition-all hover:scale-105"
                        style={{ background: "rgba(232,200,120,.95)", boxShadow: "0 0 0 6px rgba(232,200,120,.18)" }}
                        aria-label="Phát video">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </button>
                <div className="absolute left-0 right-0 bottom-0 px-5 py-4 text-white flex items-center gap-3.5"
                     style={{ background: "linear-gradient(0deg,rgba(10,10,8,.85),transparent)" }}>
                  <span className="font-mono text-[11px] bg-gold text-ink-2 py-0.5 px-2 font-semibold">02:14</span>
                  <span className="font-display text-sm font-medium">QS F86 — Ứng dụng trên máy uốn lò xo CNC</span>
                </div>
              </div>
              <div className="flex flex-col bg-paper">
                {playlist.map(([t, d]) => (
                  <a key={t} href="#" className="flex-1 px-5 py-4 flex items-center border-b border-line last:border-b-0 text-ink hover:bg-white hover:pl-6 transition-all text-[13px] leading-[1.5]">
                    <div className="flex justify-between items-center w-full gap-3.5">
                      <span>{t}</span>
                      <span className="font-mono text-[10px] text-gold-1 tracking-[.1em] shrink-0">{d}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* NEWS */}
      <section className="py-24 bg-paper">
        <div className="max-w-wrap mx-auto px-12">
          <Reveal>
            <div className="qs-section-head">
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Newsroom · Q1/2026 ]</span>
                <h2 className="qs-h2 mt-2">Tin tức &amp; sự kiện</h2>
              </div>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/news">Xem tất cả <span className="arr">→</span></Link>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-8">
            <Reveal className="h-full">
              <Link href="/news/astro-12x"
                    className="group h-full bg-white border border-line flex flex-col hover:border-ink transition-colors">
                <div className="relative aspect-[5/3] bg-ink-2 border-b border-line overflow-hidden">
                  <Image src="/home/news-ethercat.webp" alt="QS ra mắt dòng controller EtherCAT, Mechatrolink MII/MIII" fill
                         sizes="(max-width:768px) 100vw, 55vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="p-7">
                  <span className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ Sản phẩm mới ]</span>
                  <h3 className="font-display font-semibold text-2xl mt-2.5 mb-3.5 leading-[1.25] tracking-[-.01em]">
                    QS cho ra mắt dòng sản phẩm bộ điều khiển EtherCAT, Mechatrolink MII/MIII
                  </h3>
                  <p className="text-[#4a4842] text-sm leading-[1.65] m-0">
                    Phiên bản mở rộng EtherCAT, hỗ trợ tới 12 trục đồng bộ, tích hợp module thị giác máy. Dự kiến giao hàng từ Q3/2026 cho khách hàng OEM trong nước.
                  </p>
                  <div className="mt-4 pt-3.5 border-t border-line font-mono text-[10px] text-muted tracking-[.14em]">28 · 04 · 2026 · 4 phút đọc</div>
                </div>
              </Link>
            </Reveal>
            <div className="grid gap-px bg-line border border-line">
              {sideNews.map((n, i) => (
                <Reveal key={n.title} className="h-full" delay={i * 80}>
                  <Link href={n.href}
                        className="h-full bg-white p-6 grid grid-cols-[90px_1fr] gap-4 hover:bg-paper-2 hover:pl-7 transition-all">
                    <div className="font-mono text-[10px] text-gold-1 tracking-[.14em] pt-1.5">{n.date}</div>
                    <div>
                      <span className="font-mono text-[9px] text-muted tracking-[.16em] uppercase block mb-1.5">{n.cat}</span>
                      <h4 className="font-display font-semibold text-[15px] leading-[1.4] m-0 tracking-[-.005em]">{n.title}</h4>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <Reveal>
            <div className="bg-ink text-[#cfc9b8] p-12 grid md:grid-cols-[1fr_340px] gap-10 items-center overflow-hidden">
              <div>
                <h3 className="font-display font-bold text-3xl text-white tracking-[-.01em] m-0">Cần controller cho dòng máy đặc thù?</h3>
                <p className="text-[#a8a499] mt-3 max-w-[60ch] m-0 text-[15px] leading-[1.65]">
                  Thông qua việc tự chủ hoàn toàn về công nghệ — từ thiết kế, lập trình, xây dựng hệ điều hành đến sản xuất và bảo trì — chúng tôi linh hoạt và nhanh chóng trong việc phát triển sản phẩm mới, cải tiến sản phẩm và đáp ứng các yêu cầu đặc biệt của khách hàng.
                </p>
                <Link className="qs-btn qs-btn-gold mt-7" href="/contact">Liên hệ ngay <span className="arr">→</span></Link>
              </div>
              <div className="relative">
                <Image src="/home/cta-controller.webp" alt="Bộ điều khiển CNC QS" width={800} height={533}
                       sizes="(max-width:768px) 100vw, 340px" className="w-full h-auto block" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
