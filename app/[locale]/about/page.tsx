import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("metaTitle") };
}

// Avatar initials stay static — names are localized data, initials are derived design.
const leaderInitials = ["QH", "TM", "DT", "PV"];

export default async function About({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const milestones = t.raw("timeline.items") as [string, string, string][];
  const values = t.raw("values.items") as { t: string; d: string }[];
  const plantStats = t.raw("factory.stats") as [string, string][];
  const leaders = t.raw("leaders.items") as { name: string; role: string; bio: string }[];
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line py-20 pb-24"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 grid md:grid-cols-[1.1fr_1fr] gap-16 items-end">
          <div>
            <div className="qs-eyebrow">{t("hero.eyebrow")}</div>
            <h1 className="font-display font-bold tracking-tight leading-[.95] mt-3.5"
                style={{fontSize:"clamp(56px,7vw,88px)"}}>
              {t("hero.heading1")}<br/>
              {t("hero.heading2")}<br/>
              <em className="not-italic font-semibold bg-gold-grad bg-clip-text text-transparent">{t("hero.heading3")}</em>
            </h1>
          </div>
          <div>
            <p className="text-[17px] leading-[1.7] text-[#3a3a3a] m-0">
              {t("hero.lede")}
            </p>
            <div className="font-mono text-[10px] text-muted tracking-[.18em] uppercase pt-4.5 border-t border-line mt-8">
              {t("hero.profileNote")}
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="py-24 bg-white border-b border-line">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1fr_2fr] gap-16">
          <div>
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("story.tag")}</span>
            <h2 className="font-display font-bold text-[36px] tracking-[-.015em] mt-2 leading-[1.1]">{t("story.heading")}</h2>
          </div>
          <div>
            <p className="text-[15px] leading-[1.75] text-[#3a3a3a] m-0 mb-4.5">
              {t("story.p1")}
            </p>
            <p className="text-[15px] leading-[1.75] text-[#3a3a3a] m-0 mb-4.5">
              {t("story.p2")}
            </p>
            <p className="text-[15px] leading-[1.75] text-[#3a3a3a] m-0">
              {t("story.p3")}<strong className="font-semibold text-ink">{t("story.p3strong")}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-24 bg-paper border-b border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("timeline.eyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("timeline.heading")}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-line border border-line">
            {milestones.map(([y,t,d]) => (
              <div key={y} className="bg-white p-5 flex flex-col gap-2 relative
                                       before:content-[''] before:absolute before:top-0 before:left-5 before:w-6 before:h-0.5 before:bg-gold">
                <div className="font-display font-bold text-[28px] text-gold-1 tracking-[-.02em]">{y}</div>
                <div className="font-mono text-[9px] text-muted tracking-[.16em] uppercase">{t}</div>
                <div className="font-display text-sm font-semibold leading-[1.35] tracking-[-.005em] mt-1">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="border-b border-line pb-6 mb-10">
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("values.eyebrow")}</span>
            <h2 className="qs-h2 mt-2">{t("values.heading")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v, idx) => (
              <div key={v.t} className="border border-line p-8 relative
                                         before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
                <div className="font-mono text-[11px] text-gold-1 tracking-[.16em]">[ {String(idx + 1).padStart(2, "0")} ]</div>
                <h3 className="font-display font-semibold text-[22px] tracking-[-.01em] mt-3.5 mb-2.5 m-0">{v.t}</h3>
                <p className="text-[#4a4842] text-sm leading-[1.7] m-0">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FACTORY */}
      <section className="py-24 bg-ink text-[#cfc9b8] relative overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg opacity-[.12]"></div>
        <div className="relative max-w-wrap mx-auto px-12">
          <div>
            <span className="font-mono text-[11px] text-gold-2 tracking-[.16em] uppercase">{t("factory.eyebrow")}</span>
            <h2 className="font-display font-bold text-4xl text-white tracking-[-.015em] mt-2 leading-[1.1]">{t("factory.heading1")}<br/>{t("factory.heading2")}</h2>
          </div>
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-12 mt-12 items-start">
            <div className="aspect-[5/3] bg-ink-2 border border-[#2a2620] overflow-hidden grid place-items-center">
              <span className="font-mono text-xs text-gold-2/40 tracking-[.18em] uppercase">{t("factory.figCaption")}</span>
            </div>
            <ul className="list-none p-0 m-0 grid grid-cols-1 gap-px bg-[#2a2620] border border-[#2a2620]">
              {plantStats.map(([l,v]) => (
                <li key={l} className="bg-ink p-5 flex justify-between items-baseline">
                  <span className="font-mono text-[10px] text-[#7a7570] tracking-[.16em] uppercase">{l}</span>
                  <span className="font-display text-lg font-semibold text-gold-2">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* LEADERS */}
      <section className="py-24 bg-paper border-y border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("leaders.eyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("leaders.heading")}</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {leaders.map((l, idx) => (
              <div key={l.name} className="bg-white border border-line p-7 grid grid-cols-[64px_1fr] gap-6 relative
                                         before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
                <div className="w-16 h-16 bg-paper-2 border border-line grid place-items-center font-display font-bold text-xl tracking-[-.01em] text-ink-3">{leaderInitials[idx]}</div>
                <div>
                  <h3 className="font-display font-semibold text-lg m-0 leading-[1.2]">{l.name}</h3>
                  <span className="font-mono text-[10px] text-gold-1 tracking-[.14em] uppercase block mt-1.5">{l.role}</span>
                  <p className="text-sm text-[#4a4842] leading-[1.7] m-0 mt-3">{l.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="bg-ink text-[#cfc9b8] p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h3 className="font-display font-bold text-3xl text-white tracking-[-.01em] m-0">{t("cta.heading")}</h3>
              <p className="text-[#a8a499] mt-2 max-w-[60ch] m-0 text-[15px]">{t("cta.body")}</p>
            </div>
            <Link className="qs-btn qs-btn-gold" href="/contact">{t("cta.button")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
