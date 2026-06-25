import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import Reveal from "@/components/reveal";
import CountUp from "@/components/count-up";
import Marquee from "@/components/marquee";
import CircuitTraces from "@/components/circuit-traces";
import AppDeck from "@/components/app-deck";
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

const stats = [
  { to: 6, pad: 2, suffix: "", l: "Dòng controller" },
  { to: 800, pad: 0, suffix: "+", l: "Dây chuyền sản xuất" },
  { to: 35, pad: 0, suffix: "", l: "Tỉnh thành hỗ trợ" },
  { to: 24, pad: 0, suffix: "", l: "Tháng bảo hành" },
];

const heroSpecs: [string, string][] = [
  ["Trục điều khiển", "6 · vòng kín"],
  ["Giao thức", "EtherCAT · MLK"],
  ["Màn hình", "10.1″ IPS cảm ứng"],
  ["Nội suy", "Nano · tốc độ cao"],
  ["Xuất xứ", "Bình Dương · VN"],
];

const machineTypes = [
  "Phay CNC", "Tiện CNC", "Router gỗ", "Uốn lò xo", "Dán keo tự động",
  "Khắc laser", "Cắt plasma", "Kim hoàn", "Chấn tôn", "Đột dập", "Mài CNC", "Đóng gói",
];
const tickerTags = [
  "Made in Vietnam", "QS Firmware", "EtherCAT", "Mechatrolink MII/MIII",
  "Pulse Train", "Closed-loop servo", "Hỗ trợ 35 tỉnh thành", "Bảo hành 24 tháng",
];

const apps = [
  { slug: "phay-cnc", n: "01", t: "Máy phay CNC", img: "/home/app-phay-cnc.webp", d: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Điều khiển 6 trục vòng kín cho gia công khuôn mẫu và chi tiết phức tạp." },
  { slug: "cua-long", n: "02", t: "Máy cưa lọng", img: "/home/app-cua-long.webp", d: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nội suy mượt mà, đường cắt sắc nét trên vật liệu gỗ và composite." },
  { slug: "dan-keo", n: "03", t: "Máy dán keo", img: "/home/app-dan-keo.webp", d: "Ut enim ad minim veniam, quis nostrud exercitation. Định lượng keo chính xác, đồng bộ tốc độ băng tải theo thời gian thực." },
  { slug: "uon-lo-xo", n: "05", t: "Máy uốn lò xo", img: "/home/app-uon-lo-xo.webp", d: "Duis aute irure dolor in reprehenderit in voluptate velit. Điều khiển góc uốn và bước xoắn ổn định cho sản xuất hàng loạt." },
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
      {/* HERO — full dark stage: thesis left, product centered over a gold glow, spec readout right */}
      <section className="relative bg-ink text-[#cfc9b8] overflow-hidden border-b border-[#221e18]">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.14]" aria-hidden="true"></div>
        {/* PCB trace network — concentrated in the top-left & bottom-right corners, faded inward so it never sinks the text */}
        <div className="absolute top-0 left-0 w-[34%] h-[50%] opacity-[.6] [mask-image:radial-gradient(ellipse_at_top_left,#000_38%,transparent_74%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_left,#000_38%,transparent_74%)]" aria-hidden="true">
          <CircuitTraces variant="dark" className="w-full h-full" />
        </div>
        <div className="absolute bottom-0 right-0 w-[34%] h-[50%] opacity-[.6] rotate-180 [mask-image:radial-gradient(ellipse_at_top_left,#000_38%,transparent_74%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_left,#000_38%,transparent_74%)]" aria-hidden="true">
          <CircuitTraces variant="dark" className="w-full h-full" />
        </div>
        {/* gold radial glow pool, centered behind the product — gently breathes like an ember */}
        <div className="absolute inset-0 hidden lg:flex items-center justify-center" aria-hidden="true">
          <div className="qs-glow !relative" style={{ width: "600px", height: "600px" }}></div>
        </div>

        {/* blueprint registration ticks */}
        <div className="hidden lg:block absolute top-7 left-7 w-4 h-4 border-l border-t border-[#3a352c]" aria-hidden="true"></div>
        <div className="hidden lg:block absolute top-7 right-7 w-4 h-4 border-r border-t border-[#3a352c]" aria-hidden="true"></div>
        <div className="hidden lg:block absolute bottom-7 left-7 w-4 h-4 border-l border-b border-[#3a352c]" aria-hidden="true"></div>
        <div className="hidden lg:block absolute bottom-7 right-7 w-4 h-4 border-r border-b border-[#3a352c]" aria-hidden="true"></div>

        <div className="relative qs-wrap-wide grid lg:grid-cols-[1fr_minmax(300px,360px)_0.92fr] gap-10 xl:gap-16 items-center min-h-[clamp(580px,84vh,860px)] py-16 lg:py-24">
          {/* LEFT — thesis */}
          <div className="text-center lg:text-left">
            <span className="qs-eyebrow qs-rise !text-gold-2 before:hidden justify-center lg:justify-start" style={{ animationDelay: "60ms" }}>
              <span className="qs-live-dot mr-1" aria-hidden="true"></span>QS Technology · Made by Vietnam · 2026
            </span>
            <h1 className="qs-h1 mt-4 text-white" style={{ fontSize: "clamp(46px,6vw,96px)", lineHeight: ".94" }}>
              <span className="block overflow-hidden pb-[.04em]">
                <span className="qs-rise inline-block" style={{ animationDelay: "150ms" }}>
                  <span className="qs-gold-shimmer font-semibold">Astro 10i</span>
                </span>
              </span>
              <span className="block overflow-hidden pb-[.04em]">
                <span className="qs-rise inline-block" style={{ animationDelay: "270ms" }}>Controller</span>
              </span>
            </h1>
            <p className="mt-7 text-lg leading-[1.7] text-[#b4afa0] max-w-[50ch] mx-auto lg:mx-0 qs-rise" style={{ animationDelay: "400ms" }}>
              Thuộc dòng Premium High-End của QS Technology. Cấu hình mạnh mẽ và thuật toán nội suy tốc độ cao đem đến trải nghiệm gia công mượt mà, ổn định — vượt xa các bộ điều khiển thông thường.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-9 qs-rise" style={{ animationDelay: "500ms" }}>
              <Link className="qs-btn qs-btn-gold" href="/products/astro-10i">Thông tin chi tiết <span className="arr">→</span></Link>
              <Link className="qs-btn bg-transparent border border-[#3a352c] text-[#e8e6df] hover:bg-white hover:text-ink hover:border-white" href="/products">Xem toàn bộ controller</Link>
            </div>
          </div>

          {/* CENTER — product render */}
          <Reveal delay={120} className="order-first lg:order-none">
            <div className="qs-float relative bg-white border border-line p-6 w-full max-w-[340px] mx-auto shadow-[0_40px_80px_-30px_rgba(0,0,0,.7)]">
              <div className="flex items-center gap-1.5 pb-4 mb-4 border-b border-line">
                <span className="w-2.5 h-2.5 rounded-full bg-rust"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-line-2"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-line-2"></span>
                <span className="ml-auto font-mono text-[10px] tracking-[.16em] uppercase text-muted">Astro 10i</span>
              </div>
              <div className="relative overflow-hidden">
                <Image src="/home/hero-astro10i.webp" alt="Bộ điều khiển CNC QS Astro 10i" width={700} height={1373}
                       priority className="w-full h-auto block" />
                <div className="qs-scan" aria-hidden="true"></div>
              </div>
              <div className="mt-4 font-mono text-[9px] tracking-[.18em] uppercase text-muted">FIG. 01 · CNC CONTROLLER · ASTRO 10i</div>
            </div>
          </Reveal>

          {/* RIGHT — spec readout */}
          <ul className="flex flex-col text-[#cfc9b8] w-full max-w-[420px] mx-auto lg:mx-0">
            <li className="font-mono text-[10px] tracking-[.22em] uppercase text-[#8a8676] pb-3 qs-rise" style={{ animationDelay: "340ms" }}>Thông số kỹ thuật</li>
            {heroSpecs.map(([k, v], i) => (
              <li key={k}
                  className="flex items-baseline justify-between gap-4 py-3.5 border-t border-[#2a2620] qs-rise"
                  style={{ animationDelay: `${420 + i * 90}ms` }}>
                <span className="font-mono text-[10px] tracking-[.18em] uppercase text-[#8a8676]">{k}</span>
                <span className="font-display text-[15px] font-medium text-white text-right">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* STATS — same ink world as the hero, joined by a lit gold seam + a soft gold wash bleeding down */}
      <section className="relative bg-ink text-[#e8e6df] overflow-hidden pb-14 lg:pb-16">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(232,200,120,.6),transparent)" }} aria-hidden="true"></div>
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[85%] h-56 opacity-80" style={{ background: "radial-gradient(ellipse at top, rgba(232,200,120,.16), transparent 70%)" }} aria-hidden="true"></div>
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
        <div className="relative qs-wrap-wide">
          {/* caption strip */}
          <div className="flex items-center justify-between gap-4 pt-12 pb-7">
            <span className="qs-eyebrow !text-gold-2 before:hidden">
              <span className="qs-live-dot mr-1" aria-hidden="true"></span>QS · bằng những con số
            </span>
            <span className="hidden sm:inline font-mono text-[10px] text-[#6b6453] tracking-[.18em] uppercase">Số liệu cập nhật · 2026</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#241f17] border-t border-[#241f17]">
            {stats.map((s, i) => (
              <Reveal key={s.l} delay={i * 70} className="group relative py-9 lg:py-12 px-6 lg:px-9">
                {/* index tick */}
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="w-6 h-px bg-gold transition-all duration-300 group-hover:w-10"></span>
                  <span className="font-mono text-[10px] text-[#6b6453] tracking-[.22em]">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="font-display font-bold leading-none tracking-[-.02em]" style={{ fontSize: "clamp(38px,4vw,60px)" }}>
                  <CountUp to={s.to} pad={s.pad} suffix={s.suffix} repeatEvery={6000 + i * 900}
                           className="qs-gold-shimmer" />
                </div>
                <div className="mt-3 font-mono text-[10px] tracking-[.2em] uppercase text-[#8a8676]">{s.l}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS — contained wide, 3-up datasheet cards */}
      <section className="relative py-24 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-line mb-12">
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Products · cập nhật 13.06.2026 ]</span>
                <h2 className="qs-h2 mt-3">QS Controller</h2>
              </div>
              <p className="text-sm text-muted leading-[1.6] max-w-[42ch] md:text-right">
                Sáu dòng bộ điều khiển cho phay, tiện, uốn và dán keo — chọn theo số trục và giao thức điều khiển.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line">
            {homeProducts.map((item, i) => (
              <Reveal key={`${item.slug}-${i}`} className="h-full" delay={i * 80}>
                <Link href={`/products/${item.slug}`}
                      className="group h-full bg-white p-8 flex flex-col gap-4 hover:bg-paper transition-colors relative
                                 before:content-[''] before:absolute before:top-0 before:left-8 before:w-8 before:h-0.5 before:bg-gold">
                  <div className="font-mono text-[11px] text-gold-1 tracking-[.16em]">{item.lbl}</div>
                  <h3 className="font-display font-semibold text-[23px] tracking-[-.01em] m-0">{item.name}</h3>
                  <p className="text-[13px] text-muted leading-[1.55] m-0">{item.desc}</p>
                  <div className="relative flex-1 min-h-[220px] border border-line overflow-hidden mt-1"
                       style={{ background: "radial-gradient(circle, #fff, #f0eee8)" }}>
                    <Image src={item.img} alt={item.name} fill sizes="(max-width:1024px) 100vw, 30vw"
                           className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.04]" />
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-line font-mono text-[11px] tracking-[.12em] uppercase text-muted">
                    <span className="leading-[1.5]">{item.meta[0]}<br />{item.meta[1]}</span>
                    <span className="text-ink transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="flex justify-center mt-12">
            <Link className="qs-btn qs-btn-gold" href="/products">Xem tất cả controller <span className="arr">→</span></Link>
          </Reveal>
        </div>
      </section>

      {/* TICKER — running dual-row marquee band */}
      <div className="bg-ink text-[#cfc9b8] border-y border-[#2a2620] overflow-hidden">
        <div className="py-3.5 border-b border-[#2a2620]">
          <Marquee items={machineTypes} speed={52} />
        </div>
        <div className="py-3.5 text-[#8a8676]">
          <Marquee items={tickerTags} speed={46} reverse />
        </div>
      </div>

      {/* APPLICATIONS — contained hover-expand accordion */}
      <section className="relative py-24 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-line">
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Applications · 04 ngành ]</span>
                <h2 className="qs-h2 mt-3">Ứng dụng theo ngành.</h2>
              </div>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/applications">Xem tất cả <span className="arr">→</span></Link>
            </div>
          </Reveal>

          {/* desktop: chồng xéo top-left → bottom-right, thẻ active mở rộng sẵn, lia tới đâu active tới đó */}
          <Reveal className="mt-12">
            <AppDeck items={apps} />
          </Reveal>

          {/* mobile: stacked cards */}
          <div className="md:hidden mt-10 flex flex-col gap-3">
            {apps.map((a, i) => (
              <Reveal key={a.slug} delay={i * 70}>
                <Link href={`/applications/${a.slug}`}
                      className="group relative block h-[240px] overflow-hidden bg-ink-2 border border-line">
                  <Image src={a.img} alt={a.t} fill sizes="100vw"
                         className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(10,10,8,.92) 0%,rgba(10,10,8,.2) 50%,transparent 78%)" }}></div>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="font-mono text-[10px] text-gold-2 tracking-[.2em] uppercase">Application {a.n}</span>
                    <h4 className="font-display font-semibold text-white text-lg mt-1.5 leading-tight">{a.t}</h4>
                    <p className="text-[#cfc9b8] text-[13px] leading-[1.55] mt-2">{a.d}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT — full-bleed dark, factory photo bleeding to the left edge */}
      <section className="bg-ink text-[#cfc9b8] grid lg:grid-cols-2 items-stretch overflow-hidden">
        <Reveal className="relative min-h-[360px] lg:h-full">
          <Image src="/home/about-qs.webp" alt="Nhà máy QS Technology" fill
                 sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          <div className="absolute inset-0 bg-[#0a0a0a]/20"></div>
        </Reveal>
        <div className="relative py-20 lg:py-28 px-6 sm:px-10 lg:px-16 xl:px-20 overflow-hidden">
          <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
          <CircuitTraces variant="dark" className="absolute inset-y-0 right-[-10%] w-[70%] opacity-[.45]" />
          <Reveal className="relative max-w-[640px]">
            <span className="font-mono text-[11px] text-gold-2 tracking-[.16em] uppercase">[ About us · EST. Bình Dương ]</span>
            <h2 className="qs-h2 text-white mt-3">Đôi nét về QS Technology Co., LTD.</h2>
            <p className="text-[#a8a499] text-base leading-[1.7] mt-5">
              QS Technology Co., LTD. Chúng tôi tự hào là đơn vị tiên phong phát triển, ứng dụng và thương mại sản phẩm bộ điều khiển CNC “Made By Vietnam”. Sau nhiều năm phát triển, những sản phẩm mang thương hiệu QS Technology ngày càng nhận được nhiều sự tin tưởng, quan tâm từ khách hàng trong cũng như ngoài nước.
            </p>
            <p className="text-[#a8a499] text-base leading-[1.7] mt-4">
              Bên cạnh đó, từ những thế mạnh và kinh nghiệm tích lũy sau nhiều năm hoạt động trong lĩnh vực chế tạo máy, hệ thống tự động hóa và board mạch điện tử, chúng tôi tự tin làm chủ phần công nghệ lõi, phát triển đa dạng và làm hài lòng những mong muốn của khách hàng.
            </p>
            <Link className="qs-btn qs-btn-gold mt-8" href="/about">Xem thêm <span className="arr">→</span></Link>
          </Reveal>
        </div>
      </section>

      {/* VIDEO — contained wide */}
      <section className="relative py-24 bg-paper border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-line mb-12">
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Showreel · 02:14 ]</span>
                <h2 className="qs-h2 mt-3">QS Controller Videos</h2>
              </div>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="#">Kênh YouTube <span className="arr">→</span></Link>
            </div>
          </Reveal>
          <Reveal>
            <div className="grid lg:grid-cols-[2.3fr_1fr] gap-px bg-line border border-line">
              <div className="group relative bg-ink-2 aspect-video overflow-hidden">
                <Image src="/home/video-thumb.webp" alt="QS F86 — Ứng dụng trên máy uốn lò xo CNC" fill
                       sizes="(max-width:1024px) 100vw, 60vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
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

      {/* CTA — full-bleed dark band */}
      <section className="relative bg-ink text-[#cfc9b8] overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
        <CircuitTraces variant="dark" className="absolute inset-y-0 left-[-6%] w-[52%] opacity-[.45]" />
        <div className="qs-glow" style={{ bottom: "-150px", left: "24%", width: "440px", height: "440px" }} aria-hidden="true"></div>
        <div className="relative qs-wrap-wide py-20 lg:py-24 grid lg:grid-cols-[1fr_360px] gap-12 items-center">
          <Reveal>
            <h3 className="font-display font-bold text-white tracking-[-.015em] leading-[1.08] m-0"
                style={{ fontSize: "clamp(30px,3.4vw,46px)" }}>Cần controller cho dòng máy đặc thù?</h3>
            <p className="text-[#a8a499] mt-5 max-w-[60ch] text-base leading-[1.7]">
              Thông qua việc tự chủ hoàn toàn về công nghệ — từ thiết kế, lập trình, xây dựng hệ điều hành đến sản xuất và bảo trì — chúng tôi linh hoạt và nhanh chóng trong việc phát triển sản phẩm mới, cải tiến sản phẩm và đáp ứng các yêu cầu đặc biệt của khách hàng.
            </p>
            <Link className="qs-btn qs-btn-gold mt-8" href="/contact">Liên hệ ngay <span className="arr">→</span></Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative border border-[#2a2620] overflow-hidden">
              <Image src="/home/cta-controller.webp" alt="Bộ điều khiển CNC QS" width={800} height={533}
                     sizes="(max-width:1024px) 100vw, 360px" className="w-full h-auto block" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* NEWS — contained wide (closing section) */}
      <section className="relative py-24 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-line mb-12">
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Newsroom · Q1/2026 ]</span>
                <h2 className="qs-h2 mt-3">Tin tức &amp; sự kiện</h2>
              </div>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/news">Xem tất cả <span className="arr">→</span></Link>
            </div>
          </Reveal>
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8">
            <Reveal className="h-full">
              <Link href="/news/astro-12x"
                    className="group h-full bg-white border border-line flex flex-col hover:border-ink transition-colors">
                <div className="relative aspect-[16/9] bg-ink-2 border-b border-line overflow-hidden">
                  <Image src="/home/news-ethercat.webp" alt="QS ra mắt dòng controller EtherCAT, Mechatrolink MII/MIII" fill
                         sizes="(max-width:1024px) 100vw, 55vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="p-8">
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
    </>
  );
}
