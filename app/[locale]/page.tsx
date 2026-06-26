import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import Reveal from "@/components/reveal";
import CountUp from "@/components/count-up";
import Marquee from "@/components/marquee";
import CircuitTraces from "@/components/circuit-traces";
import AppDeck from "@/components/app-deck";
import HeroSlider, { type HeroSlide } from "@/components/hero-slider";
import NewsFeed, { type NewsItem } from "@/components/news-feed";
import VideoReel, { type VideoItem } from "@/components/video-reel";
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
  { to: 6, pad: 2, suffix: "", l: "Dòng controller", d: "F-series & Astro — từ phổ thông đến cao cấp" },
  { to: 800, pad: 0, suffix: "+", l: "Dây chuyền sản xuất", d: "Vận hành ổn định tại nhà máy khách hàng" },
  { to: 35, pad: 0, suffix: "", l: "Tỉnh thành hỗ trợ", d: "Kỹ thuật triển khai & bảo trì tận nơi" },
  { to: 24, pad: 0, suffix: "", l: "Tháng bảo hành", d: "Bảo hành chính hãng + hỗ trợ dài hạn" },
];

const heroSlides: HeroSlide[] = [
  {
    tag: "Dòng cao cấp · 2026",
    name: "Astro 10i",
    sub: "Bộ điều khiển",
    desc: "Thuộc dòng cao cấp của QS Technology. Cấu hình mạnh mẽ và thuật toán nội suy tốc độ cao đem đến trải nghiệm gia công mượt mà, ổn định — vượt xa các bộ điều khiển thông thường.",
    href: "/products/astro-10i",
    img: "/home/hero-astro10i.webp",
    fig: "HÌNH 01 · BỘ ĐIỀU KHIỂN CNC · ASTRO 10i",
    specs: [
      ["Trục điều khiển", "6 · vòng kín"],
      ["Giao thức", "EtherCAT · MLK"],
      ["Màn hình", "10.1″ IPS cảm ứng"],
      ["Nội suy", "Nano · tốc độ cao"],
      ["Xuất xứ", "Bình Dương · VN"],
    ],
  },
  {
    tag: "Chủ lực · vòng kín",
    name: "Astro 6AH",
    sub: "Bộ điều khiển",
    desc: "Dòng chủ lực 6 trục vòng kín với EtherCAT và Mechatrolink MII/MIII — dành cho gia công khuôn mẫu và linh kiện y tế đòi hỏi độ chính xác cao nhất.",
    href: "/products/astro-6ah",
    img: "/home/product-astro-6ah.webp",
    fig: "HÌNH 02 · BỘ ĐIỀU KHIỂN CNC · ASTRO 6AH",
    specs: [
      ["Trục điều khiển", "6 · vòng kín"],
      ["Giao thức", "EtherCAT · MII/MIII"],
      ["Ứng dụng", "Khuôn mẫu · y tế"],
      ["Động cơ servo", "Vòng kín đồng bộ"],
      ["Xuất xứ", "Bình Dương · VN"],
    ],
  },
  {
    tag: "Đa dụng · phổ thông",
    name: "F86",
    sub: "Bộ điều khiển",
    desc: "Bộ điều khiển 6 trục ứng dụng trên đa dạng dòng máy — phay, cưa lọng, dán keo. Hỗ trợ điều khiển Pulse Train và EtherCAT, dễ tích hợp, chi phí tối ưu.",
    href: "/products/f86",
    img: "/home/product-f86.webp",
    fig: "HÌNH 03 · BỘ ĐIỀU KHIỂN CNC · F86",
    specs: [
      ["Trục điều khiển", "6 · hở/kín"],
      ["Giao thức", "Pulse Train · EtherCAT"],
      ["Ứng dụng", "Phay · cưa · dán keo"],
      ["Tích hợp", "Nhanh · linh hoạt"],
      ["Xuất xứ", "Bình Dương · VN"],
    ],
  },
];

const machineTypes = [
  "Phay CNC", "Tiện CNC", "Router gỗ", "Uốn lò xo", "Dán keo tự động",
  "Khắc laser", "Cắt plasma", "Kim hoàn", "Chấn tôn", "Đột dập", "Mài CNC", "Đóng gói",
];
const tickerTags = [
  "Made in Vietnam", "QS Firmware", "EtherCAT", "Mechatrolink MII/MIII",
  "Pulse Train", "Servo vòng kín", "Hỗ trợ 35 tỉnh thành", "Bảo hành 24 tháng",
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
    lbl: "[ Dòng F ]",
    name: "Bộ điều khiển F86",
    desc: "Bộ điều khiển 6 trục ứng dụng trên đa dạng dòng máy. Hỗ trợ điều khiển Pulse Train — EtherCAT.",
    img: "/home/product-f86.webp",
    meta: ["6 trục · vòng kín", "pulse train / ethercat"],
  },
  {
    slug: "astro-6ah",
    lbl: "[ Dòng Astro ]",
    name: "Bộ điều khiển Astro 6AH",
    desc: "Dòng chủ lực 6 trục vòng kín, EtherCAT, cho gia công khuôn mẫu và linh kiện y tế chính xác cao.",
    img: "/home/product-astro-6ah.webp",
    meta: ["6 trục · vòng kín", "pulse train / ethercat / mechatrolink mii,miii"],
  },
  {
    slug: "f86",
    lbl: "[ Dòng F ]",
    name: "Bộ điều khiển F86",
    desc: "Bộ điều khiển 6 trục ứng dụng trên đa dạng dòng máy. Hỗ trợ điều khiển Pulse Train — EtherCAT.",
    img: "/home/product-f86-open.webp",
    meta: ["6 trục · vòng hở", "pulse train / ethercat"],
  },
];

// Thumbnail tự lấy từ YouTube theo youtubeId. duration tùy chọn (bỏ trống → ẩn badge).
const videos: VideoItem[] = [
  { youtubeId: "TCkwmd2HUOw", title: "Tính năng cơ bản bộ điều khiển CNC F54 — Phần 1" },
  { youtubeId: "b-O5la5o5m0", title: "Tính năng cơ bản bộ điều khiển CNC F54 — Phần 2" },
  { youtubeId: "j-RXLvCzxEI", title: "Tính năng cơ bản bộ điều khiển CNC F54 — Phần 3" },
];

const news: NewsItem[] = [
  {
    href: "/news/astro-12x",
    img: "/home/news-ethercat.webp",
    badge: "Sản phẩm mới",
    cat: "Sản phẩm",
    date: "28 · 04 · 2026",
    read: "4 phút đọc",
    title: "QS cho ra mắt dòng bộ điều khiển EtherCAT, Mechatrolink MII/MIII",
    desc: "Phiên bản mở rộng EtherCAT, hỗ trợ tới 12 trục đồng bộ, tích hợp module thị giác máy. Dự kiến giao hàng từ Q3/2026 cho khách hàng OEM trong nước.",
  },
  {
    href: "/news",
    img: "/home/video-thumb.webp",
    badge: "Sự kiện",
    cat: "Sự kiện",
    date: "22 · 04 · 2026",
    read: "3 phút đọc",
    title: 'QS góp mặt vòng chung kết "The Future Brand — Made By Vietnam" 2025',
    desc: "Đại diện QS Technology trình bày giải pháp bộ điều khiển CNC nội địa trước hội đồng giám khảo và cộng đồng doanh nghiệp sản xuất Việt Nam.",
  },
  {
    href: "/news/precitech-long-an",
    img: "/home/product-f86.webp",
    badge: "Khách hàng",
    cat: "Khách hàng",
    date: "15 · 04 · 2026",
    read: "2 phút đọc",
    title: "Bàn giao 24 bộ điều khiển F86 cho Tổng công ty PRECITECH Long An",
    desc: "Lô 24 bộ điều khiển F86 được lắp đặt, nghiệm thu trên dây chuyền phay CNC kèm chương trình đào tạo vận hành tại nhà máy khách hàng.",
  },
  {
    href: "/news/firmware-v42",
    img: "/home/product-f86-open.webp",
    badge: "Kỹ thuật",
    cat: "Kỹ thuật",
    date: "02 · 04 · 2026",
    read: "5 phút đọc",
    title: "Firmware v4.2 — bổ sung G-code tuỳ biến và post-processor Mastercam",
    desc: "Bản firmware mới cho phép tuỳ biến lệnh G-code, đồng bộ post-processor Mastercam và cải thiện độ mượt nội suy ở tốc độ cao.",
  },
  {
    href: "/news/binh-duong-expansion",
    img: "/home/about-qs.webp",
    badge: "Công ty",
    cat: "Công ty",
    date: "18 · 03 · 2026",
    read: "3 phút đọc",
    title: "QS mở rộng nhà máy Bình Dương lên 4.200m² — công suất tăng 2,5×",
    desc: "Nhà máy mới nâng năng lực sản xuất board mạch và lắp ráp bộ điều khiển, rút ngắn thời gian giao hàng cho thị trường trong nước.",
  },
];

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  await params;

  return (
    <>
      {/* HERO — dark blueprint stage as a product slider (thesis · device render · spec readout) */}
      <HeroSlider slides={heroSlides} />

      {/* TICKER — running dual-row marquee band, lifted up against the hero with a paper gap above */}
      <div className="mt-12 lg:mt-16 bg-ink text-[#cfc9b8] border-y border-[#2a2620] overflow-hidden">
        <div className="py-3.5 border-b border-[#2a2620]">
          <Marquee items={machineTypes} speed={52} />
        </div>
        <div className="py-3.5 text-[#8a8676]">
          <Marquee items={tickerTags} speed={46} reverse />
        </div>
      </div>

      {/* PRODUCTS — contained wide, 3-up datasheet cards */}
      <section className="relative py-24 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute bottom-0 right-0 w-[44%] h-[72%] opacity-[.55] [mask-image:radial-gradient(ellipse_at_bottom_right,#000_26%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_at_bottom_right,#000_26%,transparent_72%)]" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-line mb-12">
              <span className="qs-trace pointer-events-none absolute left-0 right-0 bottom-[-1px] h-px" aria-hidden="true"></span>
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2"><span className="qs-live-dot"></span>[ Sản phẩm · cập nhật 13.06.2026 ]</span>
                <h2 className="qs-h2 mt-3">Bộ điều khiển QS</h2>
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
                      className="group h-full bg-white p-8 flex flex-col gap-4 relative transition-all duration-300
                                 hover:-translate-y-2 hover:z-10 hover:shadow-[0_30px_60px_-22px_rgba(20,16,8,.45)]
                                 hover:ring-1 hover:ring-gold-2/70
                                 before:content-[''] before:absolute before:top-0 before:left-8 before:w-8 before:h-0.5 before:bg-gold
                                 before:transition-all before:duration-300 group-hover:before:w-20 group-hover:before:bg-gold-2">
                  <div className="font-mono text-[11px] text-gold-1 tracking-[.16em]">{item.lbl}</div>
                  <h3 className="font-display font-semibold text-[23px] tracking-[-.01em] m-0 transition-colors group-hover:text-gold-1">{item.name}</h3>
                  <p className="text-[13px] text-muted leading-[1.55] m-0">{item.desc}</p>
                  {/* product stage — shared showroom: blueprint grid + gold pedestal,
                      products bottom-aligned on one baseline so the lineup reads as a set */}
                  <div className="relative flex-1 min-h-[248px] border border-line group-hover:border-gold-2/60 overflow-hidden mt-1 transition-all duration-500 group-hover:shadow-[inset_0_0_42px_rgba(232,200,120,.18)]"
                       style={{ background: "linear-gradient(180deg,#ffffff 0%,#f1efe8 100%)" }}>
                    <div className="absolute inset-0 qs-grid-bg opacity-40" aria-hidden="true"></div>
                    {/* perpetual scan beam reading the product (staggered per card) */}
                    <div className="pointer-events-none absolute inset-x-6 top-0 h-[2px] qs-scan" style={{ animationDelay: `${i * 1.5}s` }} aria-hidden="true"></div>
                    {/* pedestal spotlight — ambient breathe, always alive */}
                    <div className="qs-breathe pointer-events-none absolute inset-x-0 bottom-0 h-3/4"
                         style={{ background: "radial-gradient(ellipse 58% 64% at 50% 102%, rgba(232,200,120,.32), transparent 70%)" }}></div>
                    {/* extra bloom layered in on hover */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                         style={{ background: "radial-gradient(ellipse 56% 60% at 50% 102%, rgba(232,200,120,.3), transparent 68%)" }}></div>
                    {/* gold baseline the product stands on */}
                    <div className="pointer-events-none absolute left-6 right-6 bottom-7 h-px bg-gradient-to-r from-transparent via-gold-2/70 to-transparent transition-opacity duration-500 opacity-50 group-hover:opacity-100"></div>
                    {/* corner ticks on hover */}
                    <div className="pointer-events-none absolute inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-gold-2"></span>
                      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-gold-2"></span>
                      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-gold-2"></span>
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-gold-2"></span>
                    </div>
                    {/* product levitates on a perpetual loop (staggered per card) */}
                    <div className="qs-float absolute inset-0" style={{ animationDelay: `${i * 1.2}s` }}>
                      <Image src={item.img} alt={item.name} fill sizes="(max-width:1024px) 100vw, 30vw"
                             className="object-contain object-bottom px-7 pt-7 pb-8 origin-bottom transition-[transform,filter] duration-500 group-hover:scale-[1.06] group-hover:[filter:brightness(1.06)_contrast(1.04)_drop-shadow(0_16px_22px_rgba(232,200,120,.4))]" />
                    </div>
                    {/* light sheen sweeping across the render on hover */}
                    <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms] ease-out"
                         style={{ background: "linear-gradient(115deg, transparent 38%, rgba(255,255,255,.5) 50%, transparent 62%)" }} aria-hidden="true"></div>
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

      {/* STATS — dark metrics band between the product showrooms, lit by a gold seam + soft gold wash */}
      <section className="relative bg-ink text-[#e8e6df] overflow-hidden pb-14 lg:pb-16">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(232,200,120,.6),transparent)" }} aria-hidden="true"></div>
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[85%] h-56 opacity-80" style={{ background: "radial-gradient(ellipse at top, rgba(232,200,120,.16), transparent 70%)" }} aria-hidden="true"></div>
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
        <div className="relative qs-wrap-wide">
          {/* caption strip */}
          <div className="pt-12 pb-8">
            <div className="flex items-center justify-between gap-4">
              <span className="qs-eyebrow !text-gold-2 before:hidden">
                <span className="qs-live-dot mr-1" aria-hidden="true"></span>QS · bằng những con số
              </span>
              <span className="hidden sm:inline font-mono text-[10px] text-[#6b6453] tracking-[.18em] uppercase">Số liệu cập nhật · 2026</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mt-6">
              <h2 className="qs-h2 text-white max-w-[16ch]">Năng lực QS qua từng con số</h2>
              <p className="text-sm text-[#a8a499] leading-[1.7] max-w-[48ch]">
                Từ nghiên cứu phần cứng, phát triển firmware đến triển khai và bảo trì hiện trường — các con số phản ánh năng lực vận hành thực tế của QS Technology.
              </p>
            </div>
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
                <p className="mt-2.5 text-[12.5px] leading-[1.55] text-[#7e7a6e] max-w-[26ch]">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* APPLICATIONS — contained hover-expand accordion */}
      <section className="relative py-24 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-line">
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Ứng dụng · 04 ngành ]</span>
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
                    <span className="font-mono text-[10px] text-gold-2 tracking-[.2em] uppercase">Ứng dụng {a.n}</span>
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
        <Reveal className="relative min-h-[360px] lg:h-full overflow-hidden">
          {/* ambient ken-burns drift — slow perpetual zoom/pan */}
          <Image src="/home/about-qs.webp" alt="Nhà máy QS Technology" fill
                 sizes="(max-width:1024px) 100vw, 50vw" className="object-cover qs-kenburns" />
          {/* dark tint + seam blend into the text column on desktop */}
          <div className="absolute inset-0 bg-[#0a0a0a]/25"></div>
          <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-transparent via-transparent to-ink/95"></div>
          {/* live caption */}
          <div className="absolute left-6 bottom-6 flex items-center gap-2 font-mono text-[10px] tracking-[.18em] uppercase text-[#e8e6df]">
            <span className="qs-live-dot" aria-hidden="true"></span>Nhà máy Bình Dương
          </div>
        </Reveal>
        <div className="relative py-20 lg:py-28 px-6 sm:px-10 lg:px-16 xl:px-20 overflow-hidden">
          <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
          <CircuitTraces variant="dark" className="absolute inset-y-0 right-[-10%] w-[70%] opacity-[.45]" />
          <Reveal className="relative max-w-[640px]">
            <span className="font-mono text-[11px] text-gold-2 tracking-[.16em] uppercase">[ Về chúng tôi · Thành lập tại Bình Dương ]</span>
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

      {/* SHOWREEL — broadcast control room on a light stage */}
      <section className="relative py-24 bg-paper border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute top-0 left-0 w-[40%] h-[64%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_top_left,#000_24%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_left,#000_24%,transparent_70%)]" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-line mb-12">
              <span className="qs-trace pointer-events-none absolute left-0 right-0 bottom-[-1px] h-px" aria-hidden="true"></span>
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2"><span className="qs-live-dot"></span>[ Video · Đang phát sóng ]</span>
                <h2 className="qs-h2 mt-3">Video bộ điều khiển QS</h2>
              </div>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="#">Kênh YouTube <span className="arr">→</span></Link>
            </div>
          </Reveal>
          <Reveal>
            <VideoReel items={videos} />
          </Reveal>
        </div>
      </section>

      {/* CTA — full-bleed dark band */}
      <section className="relative bg-ink text-[#cfc9b8] overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
        <CircuitTraces variant="dark" className="absolute inset-y-0 left-[-6%] w-[52%] opacity-[.45]" />
        <div className="qs-glow" style={{ bottom: "-150px", left: "24%", width: "440px", height: "440px" }} aria-hidden="true"></div>
        <div className="relative qs-wrap-wide py-14 lg:py-16 grid lg:grid-cols-[1fr_minmax(480px,620px)] gap-12 items-center">
          <Reveal>
            <h3 className="font-display font-bold text-white tracking-[-.015em] leading-[1.08] m-0"
                style={{ fontSize: "clamp(30px,3.4vw,46px)" }}>Cần controller cho dòng máy đặc thù?</h3>
            <p className="text-[#a8a499] mt-5 max-w-[60ch] text-base leading-[1.7]">
              Thông qua việc tự chủ hoàn toàn về công nghệ — từ thiết kế, lập trình, xây dựng hệ điều hành đến sản xuất và bảo trì — chúng tôi linh hoạt và nhanh chóng trong việc phát triển sản phẩm mới, cải tiến sản phẩm và đáp ứng các yêu cầu đặc biệt của khách hàng.
            </p>
            <Link className="qs-btn qs-btn-gold mt-8" href="/contact">Liên hệ ngay <span className="arr">→</span></Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="group relative border border-[#2a2620] overflow-hidden transition-colors duration-500 hover:border-gold-2/50">
              <Image src="/home/cta-controller.webp" alt="Bộ điều khiển CNC QS" width={800} height={533}
                     sizes="(max-width:1024px) 100vw, 620px"
                     className="w-full h-auto block transition-transform duration-700 ease-out group-hover:scale-[1.05]" />
              {/* gold inner glow lighting up on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_60px_rgba(232,200,120,.25)]" aria-hidden="true"></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* NEWSROOM — editorial wire feed (closing section) */}
      <section className="relative py-24 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute bottom-0 left-0 w-[42%] h-[70%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_bottom_left,#000_26%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_at_bottom_left,#000_26%,transparent_72%)]" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-line mb-12">
              <span className="qs-trace pointer-events-none absolute left-0 right-0 bottom-[-1px] h-px" aria-hidden="true"></span>
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2"><span className="qs-live-dot"></span>[ Tin tức · Quý 1/2026 ]</span>
                <h2 className="qs-h2 mt-3">Tin tức &amp; sự kiện</h2>
              </div>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/news">Xem tất cả <span className="arr">→</span></Link>
            </div>
          </Reveal>
          <Reveal>
            <NewsFeed items={news} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
