import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import Reveal from "@/components/reveal";
import Marquee from "@/components/marquee";
import CircuitTraces from "@/components/circuit-traces";
import RailNudge from "@/components/rail-nudge";
import RailLand from "@/components/rail-land";
import AppDeck from "@/components/app-deck";
import HeroSlider, { type HeroSlide } from "@/components/hero-slider";
import NewsFeed, { type NewsItem } from "@/components/news-feed";
import VideoReel, { type VideoItem } from "@/components/video-reel";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo/alternates";
import { getAllNews } from "@/lib/data/news";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const title = t("homeTitle");
  const description = t("homeDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/", locale),
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

// Static, non-translated fields (assets + routing). Localized text is merged in
// from the `home` namespace inside the component below, keeping copy out of code.
const heroAssets: Pick<HeroSlide, "href" | "img">[] = [
  { href: "/products/astro-10i", img: "/home/hero-astro10i.webp" },
  { href: "/products/astro-6ah", img: "/home/product-astro-6ah.webp" },
  { href: "/products/f86", img: "/home/product-f86.webp" },
];

// Running marquee phrases — repeated so each track spans wider than the viewport for a seamless loop.
const tickerWords = Array.from({ length: 4 }, () => ["Motion Controller", "Made By Vietnam", "QS Technology"]).flat();

const appAssets = [
  { slug: "phay-cnc", n: "01", img: "/home/app-phay-cnc.webp" },
  { slug: "cua-long", n: "02", img: "/home/app-cua-long.webp" },
  { slug: "dan-keo", n: "03", img: "/home/app-dan-keo.webp" },
  { slug: "uon-lo-xo", n: "04", img: "/home/app-uon-lo-xo.webp" },
];

const productAssets = [
  { slug: "f86", img: "/home/product-f86.webp" },
  { slug: "astro-6ah", img: "/home/product-astro-6ah.webp" },
  { slug: "f86", img: "/home/product-f86-open.webp" },
];

// Thumbnails are derived from each youtubeId by VideoReel; titles come from i18n.
const videoIds = ["3bBrcmmvkZw", "kLcNpeHu-2A", "cpoLcWsIfVQ", "W0Z8zw3TkfE", "B1wENfUjn8M"];

// How many latest articles the home newsroom feed surfaces.
const HOME_NEWS_COUNT = 5;
// Fallback cover for the rare seed article that has no image of its own.
const NEWS_FALLBACK_IMG = "/home/news-ethercat.webp";

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  // Opt this page's render scope into static locale resolution so next-intl's
  // <Link> resolves the locale from the stored value instead of headers()
  // (which would force dynamic rendering and break `output: "export"`).
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  // Merge localized text with the static asset/routing fields by position.
  const heroSlides: HeroSlide[] = (
    t.raw("hero.slides") as Omit<HeroSlide, "href" | "img">[]
  ).map((s, i) => ({ ...s, ...heroAssets[i] }));
  const apps = (t.raw("applications.items") as { t: string; d: string }[]).map(
    (txt, i) => ({ ...appAssets[i], ...txt }),
  );
  const homeProducts = (
    t.raw("products.items") as { lbl: string; name: string; desc: string; meta: string[] }[]
  ).map((txt, i) => ({ ...productAssets[i], ...txt }));
  const videoTitles = t.raw("showreel.videos") as string[];
  const videos: VideoItem[] = videoIds.map((youtubeId, i) => ({ youtubeId, title: videoTitles[i] }));

  // Newsroom feed pulls the latest real articles instead of hardcoded placeholders.
  const tNews = await getTranslations({ locale, namespace: "news" });
  const news: NewsItem[] = getAllNews(locale)
    .slice(0, HOME_NEWS_COUNT)
    .map((n) => ({
      href: `/news/${n.slug}`,
      img: n.coverImage ?? NEWS_FALLBACK_IMG,
      cat: n.cat,
      date: n.date,
      title: n.title,
      desc: n.excerpt,
      read: tNews("feed.readMinutes", { count: n.readMinutes }),
      badge: n.cat,
    }));

  return (
    <>
      {/* HERO — dark blueprint stage as a product slider (thesis · device render · spec readout) */}
      <HeroSlider slides={heroSlides} />

      {/* PRODUCTS — contained wide, 3-up datasheet cards */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute bottom-0 right-0 w-[44%] h-[72%] opacity-[.55] [mask-image:radial-gradient(ellipse_at_bottom_right,#000_26%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_at_bottom_right,#000_26%,transparent_72%)]" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-5 sm:pb-7 border-b border-line mb-7 sm:mb-9 lg:mb-12">
              <span className="qs-trace pointer-events-none absolute left-0 right-0 bottom-[-1px] h-px" aria-hidden="true"></span>
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2"><span className="qs-live-dot"></span>{t("products.eyebrow")}</span>
                <h2 className="qs-h2 mt-3">{t("products.heading")}</h2>
              </div>
            </div>
          </Reveal>
          {/* phones/tablets: a snap-scrolling rail, one full-width card per screen. With no
              peeking neighbour to imply the strip scrolls, the swipe cue is the nudge button
              below. md+ returns to the static 3-up grid. */}
          <div id="home-product-rail" className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                          md:grid md:grid-cols-3 md:overflow-visible
                          gap-px bg-line border border-line">
            {/* No height utility on the wrapper or the card: `align-items: stretch` only applies
                to items whose cross-size is auto, so any explicit height (h-full included) opts
                them out of stretching and a short card leaves the container's bg-line showing as
                a grey band. Stretch fills the row in both the flex rail and the md+ grid.
                bg-white sits on the wrapper too, since that is the element being stretched;
                dropped at md+ so the hover lift still reveals the divider grid behind the card. */}
            {homeProducts.map((item, i) => (
              <Reveal key={`${item.slug}-${i}`} className="flex items-stretch w-full shrink-0 snap-start bg-white md:w-auto md:bg-transparent" delay={i * 80}>
                <Link href={`/products/${item.slug}`}
                      className="group w-full bg-white p-5 sm:p-8 flex flex-col gap-4 relative transition-all duration-300
                                 hover:-translate-y-2 hover:z-10 hover:shadow-[0_30px_60px_-22px_rgba(20,16,8,.45)]
                                 hover:ring-1 hover:ring-gold-2/70
                                 before:content-[''] before:absolute before:top-0 before:left-5 sm:before:left-8 before:w-8 before:h-0.5 before:bg-gold
                                 before:transition-all before:duration-300 group-hover:before:w-20 group-hover:before:bg-gold-2">
                  <div className="font-mono text-[11px] text-gold-1 tracking-[.16em]">{item.lbl}</div>
                  <h3 className="font-display font-semibold text-[23px] tracking-[-.01em] m-0 transition-colors group-hover:text-gold-1">{item.name}</h3>
                  <p className="text-[13px] text-muted leading-[1.55] m-0">{item.desc}</p>
                  {/* product stage — shared showroom: blueprint grid + gold pedestal,
                      products centred in the frame so the lineup reads as a set.
                      On the rail the stage grows into whatever height the tallest card forces,
                      so no card ends with dead space under its footer — only one card is on
                      screen at a time there, so the size variance between them never shows.
                      From md+ every card is visible at once, so the height locks to a fixed
                      value and all three renders match. */}
                  <div className="relative flex-1 min-h-[180px] md:flex-none md:h-[200px] lg:h-[248px] border border-line group-hover:border-gold-2/60 overflow-hidden mt-1 transition-all duration-500 group-hover:shadow-[inset_0_0_42px_rgba(232,200,120,.18)]"
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
                             className="object-contain object-center p-7 origin-center transition-[transform,filter] duration-500 group-hover:scale-[1.06] group-hover:[filter:brightness(1.06)_contrast(1.04)_drop-shadow(0_16px_22px_rgba(232,200,120,.4))]" />
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
          <RailNudge targetId="home-product-rail" label={t("products.swipeHint")} className="md:hidden" />
          <Reveal className="flex justify-center mt-7 sm:mt-9 lg:mt-12">
            <Link className="qs-btn qs-btn-gold" href="/products">{t("products.viewAll")} <span className="arr">→</span></Link>
          </Reveal>
        </div>
      </section>

      {/* TICKER — running dual-row marquee band between the product showrooms */}
      <div className="bg-ink text-[#cfc9b8] border-y border-[#2a2620] overflow-hidden">
        <div className="py-2.5 sm:py-3.5 border-b border-[#2a2620]">
          <Marquee items={tickerWords} speed={52} />
        </div>
        <div className="py-2.5 sm:py-3.5 text-[#8a8676]">
          <Marquee items={tickerWords} speed={46} reverse />
        </div>
      </div>

      {/* APPLICATIONS — contained hover-expand accordion */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-line">
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("applications.eyebrow")}</span>
                <h2 className="qs-h2 mt-3">{t("applications.heading")}</h2>
              </div>
            </div>
          </Reveal>

          {/* desktop: chồng xéo top-left → bottom-right, thẻ active mở rộng sẵn, lia tới đâu active tới đó */}
          <Reveal className="mt-7 sm:mt-9 lg:mt-12">
            <AppDeck items={apps} />
          </Reveal>

          {/* mobile/tablet: the filmstrip needs hover, so below lg the same cards render as
              tappable stills — a snap rail on phones (one card per screen, swipe cue below)
              and the 2-up grid from md. No height utility on the wrapper: `align-items:
              stretch` only applies to items whose cross-size is auto, so a fixed height would
              opt the card out of stretching. The min-height on the card sets the floor instead. */}
          <div id="home-applications-rail"
               className="lg:hidden mt-6 sm:mt-8 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                          md:grid md:grid-cols-2 md:overflow-visible
                          gap-px md:gap-3">
            {apps.map((a, i) => (
              <Reveal key={a.slug} delay={i * 70} className="flex items-stretch w-full shrink-0 snap-start md:w-auto">
                <Link href={`/applications/${a.slug}`} data-rail-card
                      className="group relative block w-full min-h-[260px] md:min-h-[240px] overflow-hidden bg-ink-2 border border-line transition-colors duration-500 hover:border-gold-2/55">
                  {/* Photo with perpetual ken-burns drift — alive on touch with no hover needed
                      (matches the About/CTA editorial stills). Replaces the old group-hover:scale,
                      which never fired on touch and would fight the ken-burns transform.
                      Reduced-motion holds at a static 1.06 crop. */}
                  <Image src={a.img} alt={a.t} fill sizes="(max-width:1024px) 100vw, 50vw"
                         className="object-cover qs-kenburns transition-[filter] duration-500 group-hover:brightness-110" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(10,10,8,.92) 0%,rgba(10,10,8,.2) 50%,transparent 78%)" }}></div>
                  {/* Gold scan-line sweeping the still — same language as the desktop deck;
                      staggered per card so the 2-up grid doesn't pulse in sync. display:none
                      under reduced-motion (handled on .qs-scan in globals.css). */}
                  <div className="qs-scan pointer-events-none" style={{ animationDelay: `${i * 1.2}s` }} aria-hidden="true"></div>
                  {/* Decorative frame + corner ticks (deck language); border warms to gold on
                      hover for pointer devices. pointer-events-none so the card stays one tap target. */}
                  <div className="pointer-events-none absolute inset-3 border border-white/12 transition-colors duration-500 group-hover:border-gold-2/55" aria-hidden="true">
                    <span className="absolute -top-px -left-px w-3 h-3 border-t border-l border-gold-2/80" />
                    <span className="absolute -top-px -right-px w-3 h-3 border-t border-r border-gold-2/80" />
                    <span className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-gold-2/80" />
                    <span className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-gold-2/80" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="font-mono text-[10px] text-gold-2 tracking-[.2em] uppercase">{t("applications.mobileLabel")} {a.n}</span>
                    <h4 className="font-display font-semibold text-white text-lg mt-1.5 leading-tight">{a.t}</h4>
                    <p className="text-[#cfc9b8] text-[13px] leading-[1.55] mt-2">{a.d}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <RailLand targetId="home-applications-rail" />
          <RailNudge targetId="home-applications-rail" label={t("applications.swipeHint")} className="md:hidden" />
          <Reveal className="lg:hidden mt-3">
            <Link href="/applications"
                  className="group flex items-center justify-between bg-ink border border-line px-5 py-5">
              <span className="font-display font-semibold text-white text-lg">{t("applications.viewAll")}</span>
              <span className="font-mono text-sm text-gold-2 transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ABOUT — full-bleed dark, factory photo bleeding to the left edge */}
      <section className="bg-ink text-[#cfc9b8] grid md:grid-cols-2 items-stretch overflow-hidden">
        <Reveal className="relative min-h-[240px] sm:min-h-[300px] md:h-full overflow-hidden">
          {/* ambient ken-burns drift — slow perpetual zoom/pan */}
          <Image src="/home/about-qs.webp" alt={t("about.imgAlt")} fill
                 sizes="(max-width:1024px) 100vw, 50vw" className="object-cover qs-kenburns" />
          {/* dark tint + seam blend into the text column on desktop */}
          <div className="absolute inset-0 bg-[#0a0a0a]/25"></div>
          <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-transparent via-transparent to-ink/95"></div>
          {/* live caption */}
          <div className="absolute left-6 bottom-6 flex items-center gap-2 font-mono text-[10px] tracking-[.18em] uppercase text-[#e8e6df]">
            <span className="qs-live-dot" aria-hidden="true"></span>{t("about.caption")}
          </div>
        </Reveal>
        <div className="relative py-12 sm:py-16 lg:py-28 px-5 sm:px-10 lg:px-16 xl:px-20 overflow-hidden">
          <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
          <CircuitTraces variant="dark" className="absolute inset-y-0 right-[-10%] w-[70%] opacity-[.45] [mask-image:radial-gradient(ellipse_at_right,#000_22%,transparent_68%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_22%,transparent_68%)]" />
          <Reveal className="relative max-w-[640px]">
            <span className="font-mono text-[11px] text-gold-2 tracking-[.16em] uppercase">{t("about.eyebrow")}</span>
            <h2 className="qs-h2 text-white mt-3">{t("about.heading")}</h2>
            <p className="text-[#a8a499] text-base leading-[1.7] mt-5">
              {t("about.p1")}
            </p>
            <p className="text-[#a8a499] text-base leading-[1.7] mt-4">
              {t("about.p2")}
            </p>
            <Link className="qs-btn qs-btn-gold mt-8" href="/about">{t("about.cta")} <span className="arr">→</span></Link>
          </Reveal>
        </div>
      </section>

      {/* SHOWREEL — broadcast control room on a light stage */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-paper border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute top-0 left-0 w-[40%] h-[64%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_top_left,#000_24%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_left,#000_24%,transparent_70%)]" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-5 sm:pb-7 border-b border-line mb-7 sm:mb-9 lg:mb-12">
              <span className="qs-trace pointer-events-none absolute left-0 right-0 bottom-[-1px] h-px" aria-hidden="true"></span>
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2"><span className="qs-live-dot"></span>{t("showreel.eyebrow")}</span>
                <h2 className="qs-h2 mt-3">{t("showreel.heading")}</h2>
              </div>
              <a className="qs-btn qs-btn-ghost qs-btn-sm" href="https://youtube.com/@qstechnology7516" target="_blank" rel="noopener noreferrer">{t("showreel.youtube")} <span className="arr">→</span></a>
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
        <CircuitTraces variant="dark" className="absolute inset-y-0 left-[-6%] w-[52%] opacity-[.45] [mask-image:radial-gradient(ellipse_at_left,#000_20%,transparent_66%)] [-webkit-mask-image:radial-gradient(ellipse_at_left,#000_20%,transparent_66%)]" />
        <div className="qs-glow" style={{ bottom: "-150px", left: "24%", width: "440px", height: "440px" }} aria-hidden="true"></div>
        <div className="relative qs-wrap-wide py-12 sm:py-14 lg:py-16 grid md:grid-cols-2 lg:grid-cols-[1fr_minmax(480px,620px)] gap-7 sm:gap-10 md:gap-12 items-center">
          <Reveal>
            <h3 className="font-display font-bold text-white tracking-[-.015em] leading-[1.08] m-0"
                style={{ fontSize: "clamp(30px,3.4vw,46px)" }}>{t("cta.heading")}</h3>
            <p className="text-[#a8a499] mt-5 max-w-[60ch] text-base leading-[1.7]">
              {t("cta.body")}
            </p>
            <Link className="qs-btn qs-btn-gold mt-8" href="/contact">{t("cta.button")} <span className="arr">→</span></Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="group relative border border-[#2a2620] overflow-hidden transition-colors duration-500 hover:border-gold-2/50">
              {/* ambient ken-burns drift — same slow perpetual zoom/pan as the About photo */}
              <Image src="/home/cta-controller.webp" alt={t("cta.imgAlt")} width={800} height={533}
                     sizes="(max-width:1024px) 100vw, 620px"
                     className="w-full h-auto block qs-kenburns" />
              {/* gold inner glow lighting up on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_60px_rgba(232,200,120,.25)]" aria-hidden="true"></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* NEWSROOM — editorial wire feed (closing section) */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute bottom-0 left-0 w-[42%] h-[70%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_bottom_left,#000_26%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_at_bottom_left,#000_26%,transparent_72%)]" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-5 sm:pb-7 border-b border-line mb-7 sm:mb-9 lg:mb-12">
              <span className="qs-trace pointer-events-none absolute left-0 right-0 bottom-[-1px] h-px" aria-hidden="true"></span>
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2"><span className="qs-live-dot"></span>{t("news.eyebrow")}</span>
                <h2 className="qs-h2 mt-3">{t("news.heading")}</h2>
              </div>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/news">{t("news.viewAll")} <span className="arr">→</span></Link>
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
