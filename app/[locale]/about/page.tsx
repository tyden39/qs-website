import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CircuitTraces from "@/components/circuit-traces";
import Reveal from "@/components/reveal";
import {
  Target,
  Telescope,
  Mountain,
  Cpu,
  PenTool,
  HeartHandshake,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

// Value icons are index-aligned to the five localized value items (order is stable
// across locales): Challenge · Innovation · Creativity · Attitude · Reputation.
const VALUE_ICONS: LucideIcon[] = [Mountain, Cpu, PenTool, HeartHandshake, ShieldCheck];

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("metaTitle") };
}

export default async function About({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const values = t.raw("values.items") as { t: string; d: string }[];
  return (
    <>
      {/* HERO — kinetic typographic headline; the brand PCB signature replaces the old figure,
          carrying the "we engineer the path" journey metaphor with live gold current. */}
      <section className="relative overflow-hidden border-b border-line pt-20 pb-24 min-h-[clamp(420px,52vw,620px)]"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-50" aria-hidden="true"></div>
        {/* breathing gold atmosphere anchored toward the signature */}
        <div className="qs-glow hidden sm:block right-[6%] bottom-[-8%] w-[46%] h-[62%]" aria-hidden="true"></div>
        {/* brand PCB signature — bleeds off the bottom-right, masked to a soft radial fade */}
        <CircuitTraces
          variant="light"
          className="hidden lg:block absolute bottom-0 right-0 w-[48%] h-[86%] opacity-[.6] [mask-image:radial-gradient(ellipse_at_bottom_right,#000_24%,transparent_74%)] [-webkit-mask-image:radial-gradient(ellipse_at_bottom_right,#000_24%,transparent_74%)]"
        />
        <div className="relative z-10 max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 grid lg:grid-cols-[1.05fr_1fr] gap-16 items-end">
          <div>
            <div className="qs-eyebrow qs-rise" style={{ animationDelay: "0ms" }}>{t("hero.eyebrow")}</div>
            <h1 className="font-display font-bold tracking-tight leading-[.95] mt-3.5"
                style={{fontSize:"clamp(56px,7vw,88px)"}}>
              {/* each line masked + rising for a staggered kinetic reveal */}
              <span className="block overflow-hidden pb-[.06em]">
                <span className="block qs-rise" style={{ animationDelay: "90ms" }}>{t("hero.heading1")}</span>
              </span>
              <span className="block overflow-hidden pb-[.06em]">
                <span className="block qs-rise" style={{ animationDelay: "190ms" }}>{t("hero.heading2")}</span>
              </span>
              <span className="block overflow-hidden pb-[.06em]">
                <span className="block qs-rise" style={{ animationDelay: "290ms" }}>
                  <em className="not-italic font-semibold qs-gold-shimmer">{t("hero.heading3")}</em>
                </span>
              </span>
            </h1>
          </div>
          <div className="lg:pb-2 qs-rise" style={{ animationDelay: "440ms" }}>
            <p className="text-[17px] leading-[1.7] text-[#3a3a3a] m-0 max-w-[480px]">
              {t("hero.lede")}
            </p>
            <div className="font-mono text-[10px] text-muted tracking-[.18em] uppercase pt-4.5 border-t border-line mt-8 max-w-[480px]">
              {t("hero.profileNote")}
            </div>
          </div>
        </div>
      </section>

      {/* STORY — the QS-made board sits beside the company narrative */}
      <section className="py-24 bg-white border-b border-line">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 grid md:grid-cols-2 gap-16 items-center">
          <Reveal className="relative border border-line bg-ink overflow-hidden order-1 group">
            <Image
              src="/home/about-qs.webp"
              alt={t("images.factory")}
              width={900}
              height={657}
              sizes="(max-width: 768px) 90vw, 560px"
              className="w-full h-auto object-cover qs-kenburns"
            />
            {/* gold blueprint scan sweeping the photo on view */}
            <div className="qs-scan" aria-hidden="true"></div>
            <div className="absolute inset-3 border border-dashed border-gold/40 pointer-events-none"></div>
            <div className="absolute bottom-0 inset-x-0 flex justify-between items-center px-4 py-3
                            bg-gradient-to-t from-black/75 to-transparent">
              <span className="font-mono text-[9px] text-gold-2 tracking-[.18em] uppercase">QS · HCMC FACTORY</span>
              <span className="font-mono text-[9px] text-white/55 tracking-[.18em] uppercase">qstcnc.com</span>
            </div>
          </Reveal>
          <Reveal className="order-2" delay={120}>
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("story.tag")}</span>
            <h2 className="font-display font-bold text-[36px] tracking-[-.015em] mt-2 mb-6 leading-[1.1]">{t("story.heading")}</h2>
            <p className="text-[15px] leading-[1.75] text-[#3a3a3a] m-0 mb-4.5">{t("story.p1")}</p>
            <p className="text-[15px] leading-[1.75] text-[#3a3a3a] m-0 mb-4.5">{t("story.p2")}</p>
            <p className="text-[15px] leading-[1.75] text-[#3a3a3a] m-0">
              {t("story.p3")}<strong className="font-semibold text-ink">{t("story.p3strong")}</strong>
            </p>
          </Reveal>
        </div>
      </section>

      {/* MISSION / VISION */}
      <section className="relative overflow-hidden py-24 bg-paper border-b border-line">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-40" aria-hidden="true"></div>
        {/* live board current threading in from the right — the brand signature carrying "direction" */}
        <CircuitTraces
          variant="light"
          className="hidden md:block absolute inset-y-0 right-[-6%] w-[48%] opacity-[.55] [mask-image:radial-gradient(ellipse_at_right,#000_18%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_18%,transparent_72%)]"
        />
        {/* breathing gold atmosphere anchored top-right */}
        <div className="qs-glow hidden sm:block right-[3%] top-[-14%] w-[40%] h-[66%]" aria-hidden="true"></div>
        <div className="relative z-10 max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <Reveal className="relative border-b border-line pb-6 mb-10">
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("missionVision.eyebrow")}</span>
            <span className="qs-trace pointer-events-none absolute left-0 right-0 bottom-[-1px] h-px" aria-hidden="true"></span>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8">
            <Reveal className="group qs-card !rounded-none p-10 relative overflow-hidden
                            before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
              {/* blueprint scanner sweeping the card */}
              <div className="qs-scan" aria-hidden="true"></div>
              <Target aria-hidden="true" strokeWidth={1}
                      className="qs-breathe pointer-events-none absolute -right-6 -bottom-6 w-40 h-40 text-gold-1/[.07] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" />
              <div className="relative flex items-center gap-3.5">
                <span className="grid place-items-center w-11 h-11 border border-line bg-white text-gold-1 shrink-0
                                 transition-colors duration-300 group-hover:border-gold/60">
                  <Target aria-hidden="true" className="w-5 h-5" strokeWidth={1.6} />
                </span>
                <div className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("missionVision.mission.label")}</div>
              </div>
              <p className="relative text-[16px] leading-[1.75] text-[#3a3a3a] mt-5 m-0">{t("missionVision.mission.body")}</p>
            </Reveal>
            <Reveal delay={110} className="group qs-card !rounded-none p-10 relative overflow-hidden
                            before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
              {/* second scanner offset in time so the pair pulses out of phase */}
              <div className="qs-scan" style={{ animationDelay: "2.4s" }} aria-hidden="true"></div>
              <Telescope aria-hidden="true" strokeWidth={1}
                         className="qs-breathe pointer-events-none absolute -right-6 -bottom-6 w-40 h-40 text-gold-1/[.07] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" />
              <div className="relative flex items-center gap-3.5">
                <span className="grid place-items-center w-11 h-11 border border-line bg-white text-gold-1 shrink-0
                                 transition-colors duration-300 group-hover:border-gold/60">
                  <Telescope aria-hidden="true" className="w-5 h-5" strokeWidth={1.6} />
                </span>
                <div className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("missionVision.vision.label")}</div>
              </div>
              <p className="relative text-[16px] leading-[1.75] text-[#3a3a3a] mt-5 m-0">{t("missionVision.vision.body")}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* VALUES — five real core values rebuilt as connected numbered cells (localizable) */}
      <section className="relative overflow-hidden py-24 bg-white border-b border-line">
        {/* dot field mirrored from the right — opposite the story section for vertical rhythm */}
        <div className="absolute inset-0 qs-dot-bg qs-dot-drift opacity-70 [mask-image:linear-gradient(to_left,#000_0%,transparent_60%)] [-webkit-mask-image:linear-gradient(to_left,#000_0%,transparent_60%)]" aria-hidden="true"></div>
        {/* soft gold light rising behind the section header */}
        <div className="qs-glow hidden sm:block right-[-6%] top-[-14%] w-[34%] h-[56%]" aria-hidden="true"></div>
        <div className="relative z-10 max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <Reveal className="relative border-b border-line pb-6 mb-10">
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("values.eyebrow")}</span>
            <h2 className="qs-h2 mt-2">{t("values.heading")}</h2>
            <span className="qs-trace pointer-events-none absolute left-0 right-0 bottom-[-1px] h-px" aria-hidden="true"></span>
          </Reveal>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-l border-line">
            {/* gold current flowing along the top bus that connects the five modules */}
            <span className="qs-trace pointer-events-none absolute inset-x-0 top-[-1px] h-px z-10" aria-hidden="true"></span>
            {values.map((v, idx) => {
              const Icon = VALUE_ICONS[idx] ?? Mountain;
              return (
                <Reveal key={v.t} delay={idx * 90}
                        className="group bg-white p-7 flex flex-col relative overflow-hidden transition-colors duration-300 hover:bg-[#fcfbf6] border-r border-b border-line
                                   before:content-[''] before:absolute before:top-0 before:left-7 before:h-0.5 before:bg-gold-grad
                                   before:w-8 before:transition-[width] before:duration-500 hover:before:w-[calc(100%-3.5rem)]">
                  {/* pulsing solder pad — a live joint where the top bus feeds this module */}
                  <span className="pointer-events-none absolute top-[7px] left-1/2 -translate-x-1/2 z-10" aria-hidden="true">
                    <span className="qs-pcb-pad block w-[6px] h-[6px] rounded-full bg-gold-1"
                          style={{ animationDelay: `${idx * 0.4}s` }} />
                  </span>
                  {/* oversized watermark glyph for texture */}
                  <Icon aria-hidden="true" strokeWidth={0.9}
                        className="pointer-events-none absolute -right-5 -bottom-5 w-28 h-28 text-gold-1/[.06] transition-all duration-500 group-hover:scale-110 group-hover:text-gold-1/[.1]" />
                  <div className="relative flex items-center justify-between">
                    <div className="font-display font-bold text-[40px] leading-none text-gold-1/90 tracking-[-.02em] transition-transform duration-300 group-hover:-translate-y-0.5">{String(idx + 1).padStart(2, "0")}</div>
                    <span className="grid place-items-center w-9 h-9 border border-line bg-white text-gold-1 shrink-0
                                     transition-colors duration-300 group-hover:border-gold/60">
                      <Icon aria-hidden="true" className="w-[18px] h-[18px]" strokeWidth={1.6} />
                    </span>
                  </div>
                  <h3 className="relative font-display font-semibold text-[19px] tracking-[-.01em] mt-4 mb-2.5 m-0">{v.t}</h3>
                  <p className="relative text-[#4a4842] text-[13px] leading-[1.65] m-0">{v.d}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="py-24 bg-ink text-[#cfc9b8] relative overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.12]" aria-hidden="true"></div>
        <div className="qs-glow left-1/2 -translate-x-1/2 top-[-30%] w-[60%] h-[130%]" aria-hidden="true"></div>
        {/* brand PCB current threading behind the quote */}
        <CircuitTraces
          variant="dark"
          className="absolute inset-y-0 right-[-8%] w-[52%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_70%)]"
        />
        <div className="relative max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <Reveal className="max-w-[860px] mx-auto text-center">
            <div className="font-display text-gold-2 text-6xl leading-none mb-4 select-none qs-gold-shimmer inline-block" aria-hidden="true">&ldquo;</div>
            <blockquote className="font-display font-semibold text-white text-[28px] md:text-[34px] leading-[1.32] tracking-[-.01em] m-0">
              {t("quote.body")}
            </blockquote>
            <div className="font-mono text-[11px] text-gold-2 tracking-[.18em] uppercase mt-8">{t("quote.attribution")}</div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
