import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "./_components/contact-form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("meta.title") };
}

// Channel glyphs are decorative; localized text comes from the `contact.page` namespace.
const channelIcons = ["☎", "✉", "⚙", "Z"];

export default async function Contact({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  const channels = (t.raw("page.channels") as { lbl: string; v: string; h: string }[]).map((c, i) => ({ ...c, ic: channelIcons[i] }));
  const checklist = t.raw("page.instructions.checklist") as string[];
  const offices = t.raw("page.offices.items") as { n: string; t: string; name: string; addr: string[]; meta: string }[];
  const faqs = t.raw("page.faq.items") as { q: string; a: string }[];
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line py-12 sm:py-16 pb-10 sm:pb-12"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 grid md:grid-cols-[1.2fr_1fr] gap-8 md:gap-16 md:items-end">
          <div>
            <div className="qs-eyebrow">{t("hero.eyebrow")}</div>
            <h1 className="font-display font-bold tracking-tight leading-[.98] sm:leading-[.95] mt-3.5"
                style={{fontSize:"clamp(38px,7vw,80px)"}}>
              {t("hero.heading")}
            </h1>
          </div>
          <p className="text-[15px] sm:text-base leading-[1.7] text-[#3a3a3a] max-w-[55ch]">
            {t("hero.body")}
          </p>
        </div>
      </section>

      {/* QUICK CHANNELS */}
      <section className="py-12 sm:py-16 bg-white border-b border-line">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line">
            {channels.map(c => (
              <Link key={c.lbl} href="#" className="bg-white p-5 sm:p-7 flex flex-col gap-2.5 hover:bg-paper transition-colors relative
                                                     before:content-[''] before:absolute before:top-0 before:left-5 sm:before:left-7 before:w-8 before:h-0.5 before:bg-gold">
                <div className="w-9 h-9 border border-line grid place-items-center text-gold-1 font-mono text-sm">{c.ic}</div>
                <div className="font-mono text-[10px] text-muted tracking-[.16em] uppercase mt-1.5">{c.lbl}</div>
                <div className="font-display text-base sm:text-lg font-semibold tracking-[-.005em] leading-[1.35] break-words">{c.v}</div>
                <div className="text-xs text-[#5a5650] leading-normal">{c.h}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* INSTRUCTIONS + FORM */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 items-start">
          <div>
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("page.instructions.eyebrow")}</span>
            <h2 className="font-display font-bold text-[28px] sm:text-[36px] tracking-[-.015em] mt-2 mb-5 leading-[1.1]">{t("page.instructions.heading1")}<br/>{t("page.instructions.heading2")}</h2>
            <p className="text-[15px] leading-[1.7] text-[#3a3a3a] m-0 mb-3">
              {t("page.instructions.p1")}
            </p>
            <p className="text-[15px] leading-[1.7] text-[#3a3a3a] m-0">
              {t("page.instructions.p2pre")}<strong className="font-semibold text-ink">+84 28 3636 1234</strong>.
            </p>

            <div className="bg-paper border border-line p-5 sm:p-6 mt-8">
              <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-3">{t("page.instructions.checklistTitle")}</div>
              <ul className="list-none p-0 m-0 space-y-2.5">
                {checklist.map(item => (
                  <li key={item} className="text-[13px] text-[#3a3a3a] pl-4 relative
                                          before:content-['▸'] before:absolute before:left-0 before:top-0 before:text-gold-1">{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* OFFICES */}
      <section className="py-16 sm:py-20 bg-paper border-y border-line">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("page.offices.eyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("page.offices.heading")}</h2>
            </div>
            <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="#">{t("page.offices.bookVisit")}</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {offices.map(o => (
              <div key={o.n} className="bg-white border border-line p-6 sm:p-8 relative
                                         before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ {o.n} · {o.t} ]</div>
                <h3 className="font-display font-semibold text-[22px] tracking-[-.01em] mt-2.5 mb-4 m-0">{o.name}</h3>
                <p className="m-0 text-sm text-[#3a3a3a] leading-[1.7]">
                  {o.addr.map((line, i) => (
                    <span key={i}>{line}{i < o.addr.length - 1 && <br/>}</span>
                  ))}
                </p>
                <div className="font-mono text-[11px] text-muted tracking-[.12em] mt-5 pt-4 border-t border-line">{o.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("page.faq.eyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("page.faq.heading")}</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map(({ q, a }, i) => (
              <div key={q} className="bg-white border border-line p-7">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-2.5">[ {String(i+1).padStart(2,"0")} ]</div>
                <h4 className="font-display font-semibold text-base m-0 mb-2.5 leading-[1.4]">{q}</h4>
                <p className="text-sm text-[#4a4842] leading-[1.7] m-0">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

