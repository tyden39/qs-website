import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Reveal from "@/components/reveal";
import Marquee from "@/components/marquee";
import CountUp from "@/components/count-up";
import CircuitTraces from "@/components/circuit-traces";
import MachineAnnotation, { type CalloutText } from "./_components/machine-annotation";
import CncFeatureVideo from "./_components/cnc-feature-video";
import RuntimeMonitor from "./_components/runtime-monitor";
import WorkpieceCompare from "./_components/workpiece-compare";
import MachineConfigurator from "./_components/machine-configurator";
import { buildAlternates } from "@/lib/seo/alternates";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cnc" });
  const title = t("seo.title");
  const description = t("seo.description");
  return {
    title,
    description,
    alternates: buildAlternates("/cnc"),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/cnc",
      images: [{ url: "/home/app-phay-cnc.webp", width: 1600, height: 1067, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// Static, non-translated fields (assets, numbers, routing) — localized text is
// merged in from the `cnc` namespace by position, mirroring the home page.
const MACHINE_IMG = "/home/app-phay-cnc.webp";
const VIDEO_ID = "kLcNpeHu-2A";

// Digital readout in the hero — axis travels shown like a machine DRO.
const droAxes = [
  { axis: "X", to: 850 },
  { axis: "Y", to: 500 },
  { axis: "Z", to: 540 },
] as const;

// Stat band values; suffix/label come from i18n (vi "12.000 v/ph" vs en "12,000 rpm"
// differ in thousands separator, so the ".000"/",000" part lives in the suffix).
const statValues = [
  { to: 12 },
  { to: 24 },
  { to: 36 },
  { to: 5, prefix: "±" },
] as const;

export default async function CncPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "cnc" });

  const callouts = t.raw("hero.callouts") as CalloutText[];
  const ticker = t.raw("ticker") as string[];
  const tickerWords = Array.from({ length: 3 }, () => ticker).flat();
  const stats = (t.raw("stats.items") as { suffix: string; label: string }[]).map(
    (txt, i) => ({ ...statValues[i], ...txt }),
  );
  const specGroups = t.raw("specs.groups") as { title: string; rows: [string, string][] }[];
  // Real downloadable PDF (the localized product catalogue) instead of the generic
  // /downloads index — the closest published spec document for the machine.
  const datasheetHref = `/downloads/catalogue/qs-product-catalogue-2024-${locale}.pdf`;

  return (
    <>
      {/* HERO — dark machine hall: thesis copy + annotated machine figure (the page signature) */}
      <section className="relative bg-ink text-[#cfc9b8] overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
        <CircuitTraces variant="dark" className="absolute inset-y-0 left-[-8%] w-[46%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_left,#000_20%,transparent_66%)] [-webkit-mask-image:radial-gradient(ellipse_at_left,#000_20%,transparent_66%)]" />
        <div className="qs-glow" style={{ top: "-140px", right: "18%", width: "420px", height: "420px" }} aria-hidden="true"></div>
        <div className="relative qs-wrap-wide py-16 lg:py-24 grid lg:grid-cols-[minmax(400px,1fr)_1.35fr] gap-12 lg:gap-16 items-center">
          <Reveal>
            <span className="font-mono text-[11px] text-gold-2 tracking-[.16em] uppercase inline-flex items-center gap-2">
              <span className="qs-live-dot" aria-hidden="true"></span>{t("hero.eyebrow")}
            </span>
            <div className="mt-5 inline-block font-mono text-[11px] tracking-[.2em] uppercase text-ink bg-gold px-2.5 py-1">{t("hero.model")}</div>
            <h1 className="qs-h1 text-white mt-4">{t("hero.heading")}</h1>
            <p className="text-[#a8a499] text-base leading-[1.7] mt-6 max-w-[54ch]">{t("hero.lede")}</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link className="qs-btn qs-btn-gold" href="/contact">{t("hero.ctaQuote")} <span className="arr">→</span></Link>
              <a className="qs-btn bg-transparent text-white border border-[#4a453a] hover:bg-white/10" href="#specs">{t("hero.ctaSpecs")} <span className="arr">↓</span></a>
            </div>
            {/* DRO — axis travels rendered like the machine's digital readout */}
            <div className="mt-10 border border-[#2a2620]">
              <div className="px-4 py-2 border-b border-[#2a2620] font-mono text-[10px] tracking-[.18em] uppercase text-muted flex justify-between">
                <span>{t("hero.droLabel")}</span><span>{t("hero.droUnit")}</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-[#2a2620]">
                {droAxes.map((a, i) => (
                  <div key={a.axis} className="px-4 py-3.5">
                    <span className="block font-mono text-[10px] tracking-[.2em] text-gold-1">{a.axis}</span>
                    <span className="block font-mono text-[22px] lg:text-[24px] text-gold-2 tracking-[.02em] mt-1 tabular-nums">
                      <CountUp to={a.to} suffix=".00" duration={1400 + i * 300} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <MachineAnnotation
              img={MACHINE_IMG}
              alt={t("hero.imgAlt")}
              caption={t("hero.diagramCaption")}
              legendLabel={t("hero.legendLabel")}
              callouts={callouts}
            />
          </Reveal>
        </div>
      </section>

      {/* TICKER — running spec band separating the hero from the light body */}
      <div className="bg-ink text-[#cfc9b8] border-y border-[#2a2620] overflow-hidden">
        <div className="py-3.5 border-b border-[#2a2620]">
          <Marquee items={tickerWords} speed={50} />
        </div>
        <div className="py-3.5 text-[#8a8676]">
          <Marquee items={tickerWords} speed={44} reverse />
        </div>
      </div>

      {/* RUNTIME MONITOR — DNC-style live shop-floor readout (simulated demo data) */}
      <RuntimeMonitor locale={locale} />

      {/* STATS — headline figures counting up on scroll */}
      <section className="relative py-20 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute top-0 right-0 w-[38%] h-[80%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_top_right,#000_24%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_right,#000_24%,transparent_70%)]" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <span className="qs-eyebrow">{t("stats.eyebrow")}</span>
            <h2 className="qs-h2 mt-3">{t("stats.heading")}</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 80} className="h-full">
                <div className="h-full bg-white px-6 py-8 relative
                                before:content-[''] before:absolute before:top-0 before:left-6 before:w-8 before:h-0.5 before:bg-gold">
                  <div className="font-display font-bold text-ink tracking-[-.02em] tabular-nums" style={{ fontSize: "clamp(28px,2.6vw,40px)" }}>
                    {"prefix" in s && s.prefix}<CountUp to={s.to} duration={1500 + i * 200} />
                    <span className="text-gold-1 text-[.55em] font-semibold tracking-normal">{s.suffix}</span>
                  </div>
                  <div className="font-mono text-[11px] tracking-[.14em] uppercase text-muted mt-2.5">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARE — before/after workpiece drag slider */}
      <section className="relative bg-ink text-[#cfc9b8] py-24 overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
        <CircuitTraces variant="dark" className="absolute inset-y-0 left-[-8%] w-[44%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_left,#000_20%,transparent_66%)] [-webkit-mask-image:radial-gradient(ellipse_at_left,#000_20%,transparent_66%)]" />
        <div className="qs-glow" style={{ top: "-140px", left: "16%", width: "420px", height: "420px" }} aria-hidden="true"></div>
        <div className="relative qs-wrap-wide grid lg:grid-cols-[minmax(320px,.85fr)_1.15fr] gap-10 lg:gap-16 items-center">
          <Reveal>
            <span className="font-mono text-[11px] text-gold-2 tracking-[.16em] uppercase inline-flex items-center gap-2"><span className="qs-live-dot"></span>{t("compare.eyebrow")}</span>
            <h2 className="qs-h2 text-white mt-3">{t("compare.heading")}</h2>
            <p className="text-[#a8a499] text-[15px] leading-[1.7] mt-5 max-w-[52ch]">{t("compare.body")}</p>
          </Reveal>
          <Reveal delay={120}>
            <WorkpieceCompare
              img={MACHINE_IMG}
              alt={t("hero.imgAlt")}
              beforeLabel={t("compare.before")}
              afterLabel={t("compare.after")}
              hint={t("compare.hint")}
            />
          </Reveal>
        </div>
      </section>

      {/* CONFIGURATOR — interactive spec builder + quote deep-link */}
      <section className="relative py-24 bg-paper border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute top-0 right-0 w-[38%] h-[70%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_top_right,#000_24%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_right,#000_24%,transparent_70%)]" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="pb-7 border-b border-line mb-12 max-w-[70ch]">
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2"><span className="qs-live-dot"></span>{t("configurator.eyebrow")}</span>
              <h2 className="qs-h2 mt-3">{t("configurator.heading")}</h2>
              <p className="text-[15px] leading-[1.7] text-muted mt-4 m-0">{t("configurator.body")}</p>
            </div>
          </Reveal>
          <Reveal>
            <MachineConfigurator locale={locale} />
          </Reveal>
        </div>
      </section>

      {/* SPECS — grouped datasheet table */}
      <section id="specs" className="relative py-24 bg-paper border-t border-line overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute bottom-0 left-0 w-[40%] h-[64%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_bottom_left,#000_24%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_bottom_left,#000_24%,transparent_70%)]" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-line mb-12">
              <span className="qs-trace pointer-events-none absolute left-0 right-0 bottom-[-1px] h-px" aria-hidden="true"></span>
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2"><span className="qs-live-dot"></span>{t("specs.eyebrow")}</span>
                <h2 className="qs-h2 mt-3">{t("specs.heading")}</h2>
              </div>
              <a className="qs-btn qs-btn-ghost qs-btn-sm" href={datasheetHref} download target="_blank" rel="noopener noreferrer">{t("specs.download")} <span className="arr">↓</span></a>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-x-14 gap-y-12">
            {specGroups.map((g, gi) => (
              <Reveal key={g.title} delay={gi * 80}>
                <h3 className="font-mono text-[11px] tracking-[.2em] uppercase text-gold-1 pb-3 border-b-2 border-gold/60 flex items-center justify-between">
                  {g.title}
                  <span className="text-muted">{String(gi + 1).padStart(2, "0")}</span>
                </h3>
                <dl className="m-0">
                  {g.rows.map(([k, v]) => (
                    <div key={k} className="group flex items-baseline justify-between gap-6 py-3 border-b border-line transition-[background-color,padding] duration-300 hover:bg-white/80 hover:px-2">
                      <dt className="text-[13px] text-muted transition-colors duration-300 group-hover:text-gold-1 m-0">{k}</dt>
                      <dd className="font-mono text-[13px] text-ink text-right whitespace-nowrap m-0">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-[13px] text-muted m-0 max-w-[64ch]">{t("specs.note")}</p>
            <Link className="qs-link shrink-0" href="/products/astro-10i">{t("specs.controllerLink")} →</Link>
          </Reveal>
        </div>
      </section>

      {/* VIDEO — the machine cutting on camera */}
      <section className="relative bg-ink text-[#cfc9b8] py-24 overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
        <CircuitTraces variant="dark" className="absolute inset-y-0 right-[-8%] w-[48%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_66%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_66%)]" />
        <div className="qs-glow" style={{ bottom: "-160px", left: "20%", width: "440px", height: "440px" }} aria-hidden="true"></div>
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-[#2a2620] mb-12">
              <div>
                <span className="font-mono text-[11px] text-gold-2 tracking-[.16em] uppercase inline-flex items-center gap-2"><span className="qs-live-dot"></span>{t("video.eyebrow")}</span>
                <h2 className="qs-h2 text-white mt-3">{t("video.heading")}</h2>
                <p className="text-[#a8a499] text-[15px] leading-[1.7] mt-4 max-w-[64ch] m-0">{t("video.body")}</p>
              </div>
              <a className="qs-btn bg-transparent text-white border border-[#4a453a] hover:bg-white/10 qs-btn-sm shrink-0" href="https://youtube.com/@qstechnology7516" target="_blank" rel="noopener noreferrer">{t("video.youtube")} <span className="arr">→</span></a>
            </div>
          </Reveal>
          <Reveal>
            <div className="max-w-[980px] mx-auto">
              <CncFeatureVideo youtubeId={VIDEO_ID} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA — closing consultation band */}
      <section className="relative py-24 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute top-0 left-0 w-[36%] h-[70%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_top_left,#000_24%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_left,#000_24%,transparent_70%)]" />
        <div className="relative qs-wrap-wide max-w-[880px] text-center">
          <Reveal>
            <h2 className="qs-h2">{t("cta.heading")}</h2>
            <p className="qs-lede mx-auto mt-5">{t("cta.body")}</p>
            <div className="flex flex-wrap justify-center gap-3 mt-9">
              <Link className="qs-btn qs-btn-gold" href="/contact">{t("cta.button")} <span className="arr">→</span></Link>
              <a className="qs-btn qs-btn-ghost" href="tel:+84909663350">{t("cta.hotline")} · (+84) 909.663.350</a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
