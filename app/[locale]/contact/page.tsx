import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CircuitTraces from "@/components/circuit-traces";
import { ContactForm } from "./_components/contact-form";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildTrail, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  const title = t("meta.title");
  const description = seo("contactDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/contact", locale),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/contact",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Contact({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const breadcrumb = buildTrail(locale, nav("home"), [
    { name: nav("contact"), path: "/contact" },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line py-8 sm:py-12 pb-8 sm:pb-10"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-50" aria-hidden="true"></div>
        <div className="qs-glow hidden sm:block right-[2%] top-[-40%] w-[36%] h-[150%]" aria-hidden="true"></div>
        <CircuitTraces
          variant="light"
          className="hidden md:block absolute inset-y-0 right-0 w-[38%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_right,#000_22%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_22%,transparent_72%)]"
        />
        <div className="relative max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 grid md:grid-cols-[1.2fr_1fr] gap-8 md:gap-16 md:items-end">
          <div>
            <div className="qs-eyebrow qs-rise" style={{ animationDelay: "0ms" }}>{t("hero.eyebrow")}</div>
            <h1 className="font-display font-bold tracking-tight leading-[.98] sm:leading-[.95] mt-3.5"
                style={{fontSize:"clamp(36px,5vw,64px)"}}>
              <span className="block overflow-hidden pb-[.06em]">
                <span className="block qs-rise" style={{ animationDelay: "110ms" }}>
                  {t.rich("hero.heading", {
                    gold: (chunks) => (
                      <span className="bg-gold-grad bg-clip-text text-transparent">{chunks}</span>
                    ),
                  })}
                </span>
              </span>
            </h1>
          </div>
          <p className="text-title leading-[1.7] text-[#3a3a3a] max-w-[55ch] qs-rise" style={{ animationDelay: "260ms" }}>
            {t("hero.body")}
          </p>
        </div>
      </section>

      {/* FORM */}
      {/* The section's own padding is all that separates the form panel from the hero,
          so nothing floats behind it — a watermark label used to sit here and the card
          cut through it. The panel's own eyebrow carries the same wording anyway. */}
      {/* The band used to repeat the hero's warm paper gradient, so the two halves of
          the page read as one undifferentiated surface with a card dropped in the
          middle. It flips to the site's dark closing-band treatment instead: the white
          form panel gains real contrast, and the boundary under the hero becomes a
          deliberate cut. It runs straight into the equally dark footer below, which
          carries a gold hairline on its top edge so the two slabs stay distinct. */}
      <section id="contact-form"
               className="qs-closing-cta relative overflow-hidden bg-ink scroll-mt-24
                          py-10 sm:py-12 lg:py-16">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.12]" aria-hidden="true"></div>
        <div className="qs-glow left-1/2 -translate-x-1/2 top-[-34%] w-[56%] h-[120%]" aria-hidden="true"></div>
        {/* Traces on both flanks: on desktop the 640px form column leaves wide empty
            margins, and the brand's PCB current fills them instead of dead ink. */}
        <CircuitTraces
          variant="dark"
          className="hidden md:block absolute inset-y-0 left-[-6%] w-[40%] opacity-[.42] [mask-image:radial-gradient(ellipse_at_left,#000_20%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_left,#000_20%,transparent_70%)]"
        />
        <CircuitTraces
          variant="dark"
          className="hidden md:block absolute inset-y-0 right-[-6%] w-[40%] opacity-[.42] [mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_70%)]"
        />
        <div className="relative max-w-[640px] mx-auto px-5 sm:px-8">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
