import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "./_components/contact-form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("meta.title") };
}

export default async function Contact({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
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

      {/* FORM */}
      <section id="contact-form" className="relative overflow-hidden py-16 sm:py-24 scroll-mt-24"
               style={{ background: "linear-gradient(180deg, #f0eee8 0%, #fafaf7 100%)" }}>
        {/* Blueprint grid + decorative accents so the lone form panel doesn't sit on a bare canvas. */}
        <div className="absolute inset-0 qs-grid-bg opacity-40"></div>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-grad"></div>
        <div aria-hidden className="absolute -left-10 top-24 w-40 h-40 border border-line rotate-45 opacity-40 hidden md:block"></div>
        <div aria-hidden className="absolute -right-14 bottom-16 w-56 h-56 border border-line rounded-full opacity-30 hidden md:block"></div>
        <div aria-hidden className="absolute left-1/2 -translate-x-1/2 top-12 font-mono text-[11px] text-gold-1 tracking-[.2em] uppercase opacity-60 hidden lg:block">[ {t("hero.eyebrow")} ]</div>

        <div className="relative max-w-[640px] mx-auto px-5 sm:px-8">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
