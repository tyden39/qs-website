import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

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
      {/* HERO — typographic headline on the left, the climbing figure anchored bottom-right as a journey metaphor */}
      <section className="relative overflow-hidden border-b border-line pt-20 pb-24 min-h-[clamp(420px,52vw,620px)]"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        {/* aspirational figure — transparent PNG, bleeds off the bottom edge, decorative only */}
        <Image
          src="/img/about/walking-man.webp"
          alt=""
          aria-hidden="true"
          width={2048}
          height={1365}
          priority
          sizes="48vw"
          className="hidden lg:block absolute bottom-0 right-0 w-[46%] max-w-[640px] h-auto select-none pointer-events-none"
        />
        <div className="relative z-10 max-w-wrap mx-auto px-12 grid lg:grid-cols-[1.05fr_1fr] gap-16 items-end">
          <div>
            <div className="qs-eyebrow">{t("hero.eyebrow")}</div>
            <h1 className="font-display font-bold tracking-tight leading-[.95] mt-3.5"
                style={{fontSize:"clamp(56px,7vw,88px)"}}>
              {t("hero.heading1")}<br/>
              {t("hero.heading2")}<br/>
              <em className="not-italic font-semibold bg-gold-grad bg-clip-text text-transparent">{t("hero.heading3")}</em>
            </h1>
          </div>
          <div className="lg:pb-2">
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
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative border border-line bg-ink overflow-hidden order-1">
            <Image
              src="/img/about/pcb.webp"
              alt={t("images.pcb")}
              width={1606}
              height={1027}
              sizes="(max-width: 768px) 90vw, 560px"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-3 border border-dashed border-gold/40 pointer-events-none"></div>
            <div className="absolute bottom-0 inset-x-0 flex justify-between items-center px-4 py-3
                            bg-gradient-to-t from-black/75 to-transparent">
              <span className="font-mono text-[9px] text-gold-2 tracking-[.18em] uppercase">QS-MADE PCB</span>
              <span className="font-mono text-[9px] text-white/55 tracking-[.18em] uppercase">qstcnc.com</span>
            </div>
          </div>
          <div className="order-2">
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("story.tag")}</span>
            <h2 className="font-display font-bold text-[36px] tracking-[-.015em] mt-2 mb-6 leading-[1.1]">{t("story.heading")}</h2>
            <p className="text-[15px] leading-[1.75] text-[#3a3a3a] m-0 mb-4.5">{t("story.p1")}</p>
            <p className="text-[15px] leading-[1.75] text-[#3a3a3a] m-0 mb-4.5">{t("story.p2")}</p>
            <p className="text-[15px] leading-[1.75] text-[#3a3a3a] m-0">
              {t("story.p3")}<strong className="font-semibold text-ink">{t("story.p3strong")}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* MISSION / VISION */}
      <section className="py-24 bg-paper border-b border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="border-b border-line pb-6 mb-10">
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("missionVision.eyebrow")}</span>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-line p-10 relative
                            before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
              <div className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("missionVision.mission.label")}</div>
              <p className="text-[16px] leading-[1.75] text-[#3a3a3a] mt-4 m-0">{t("missionVision.mission.body")}</p>
            </div>
            <div className="bg-white border border-line p-10 relative
                            before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
              <div className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("missionVision.vision.label")}</div>
              <p className="text-[16px] leading-[1.75] text-[#3a3a3a] mt-4 m-0">{t("missionVision.vision.body")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES — five real core values rebuilt as connected numbered cells (localizable) */}
      <section className="py-24 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="border-b border-line pb-6 mb-10">
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("values.eyebrow")}</span>
            <h2 className="qs-h2 mt-2">{t("values.heading")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-line border border-line">
            {values.map((v, idx) => (
              <div key={v.t} className="bg-white p-7 flex flex-col relative
                                         before:content-[''] before:absolute before:top-0 before:left-7 before:w-8 before:h-0.5 before:bg-gold-grad">
                <div className="font-display font-bold text-[40px] leading-none text-gold-1/90 tracking-[-.02em]">{String(idx + 1).padStart(2, "0")}</div>
                <h3 className="font-display font-semibold text-[19px] tracking-[-.01em] mt-4 mb-2.5 m-0">{v.t}</h3>
                <p className="text-[#4a4842] text-[13px] leading-[1.65] m-0">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="py-24 bg-ink text-[#cfc9b8] relative overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg opacity-[.12]"></div>
        <div className="relative max-w-wrap mx-auto px-12">
          <div className="max-w-[860px] mx-auto text-center">
            <div className="font-display text-gold-2 text-6xl leading-none mb-4 select-none" aria-hidden="true">&ldquo;</div>
            <blockquote className="font-display font-semibold text-white text-[28px] md:text-[34px] leading-[1.32] tracking-[-.01em] m-0">
              {t("quote.body")}
            </blockquote>
            <div className="font-mono text-[11px] text-gold-2 tracking-[.18em] uppercase mt-8">{t("quote.attribution")}</div>
          </div>
        </div>
      </section>
    </>
  );
}
