import type { Metadata } from "next";
import Image from "@/components/media/image";
import { Link } from "@/lib/i18n/navigation";
import CircuitTraces from "@/components/circuit-traces";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LiveWebsiteTree } from "./_components/live-website-tree";
import { LiveWebsiteDocsProvider } from "@/lib/crm/live-website-docs-context";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildTrail, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "downloads" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  const title = t("meta.title");
  const description = seo("downloadsDescription");
  const alternates = buildAlternates("/downloads", locale);
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: alternates.canonical,
      images: [{ url: "/og-default-v2.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Downloads({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "downloads.index" });

  const nav = await getTranslations({ locale, namespace: "nav" });
  const breadcrumb = buildTrail(locale, nav("home"), [
    { name: nav("downloads"), path: "/downloads" },
  ]);

  return (
    <LiveWebsiteDocsProvider>
      <JsonLd data={breadcrumb} />
      {/* HERO */}
      <section
        className="relative overflow-hidden border-b border-line"
        style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}
      >
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-50" aria-hidden="true"></div>
        {/* breathing gold atmosphere + brand PCB signature bleeding off the right */}
        <div className="qs-glow hidden sm:block right-[6%] top-[-30%] w-[34%] h-[150%]" aria-hidden="true"></div>
        <CircuitTraces
          variant="light"
          className="hidden lg:block absolute bottom-0 right-0 w-[40%] h-[86%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_bottom_right,#000_22%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_at_bottom_right,#000_22%,transparent_72%)]"
        />
        <div className="relative z-10 max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 pt-12 pb-16">
          <div className="qs-crumb mb-8">
            <Link href="/">{t("breadcrumb.home")}</Link>
            <span className="sep">/</span>
            <span className="here">{t("breadcrumb.current")}</span>
          </div>
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
            <div className="order-2 lg:order-none">
              <div className="qs-eyebrow qs-rise" style={{ animationDelay: "0ms" }}>{t("hero.eyebrow")}</div>
              <h1 className="qs-h1 mt-3.5">
                <span className="block overflow-hidden pb-[.06em]">
                  <span className="block qs-rise" style={{ animationDelay: "90ms" }}>{t("hero.heading1")}</span>
                </span>
                <span className="block overflow-hidden pb-[.06em]">
                  <span className="block qs-rise" style={{ animationDelay: "190ms" }}>
                    <em className="not-italic font-semibold qs-gold-shimmer">
                      {t("hero.headingEm")}
                    </em>
                  </span>
                </span>
              </h1>
              <p className="qs-lede mt-5 max-w-[52ch] sm:text-justify qs-rise" style={{ animationDelay: "300ms" }}>{t("hero.lede")}</p>
            </div>

            {/* hero image */}
            <div className="order-1 lg:order-none qs-rise relative aspect-4/3 overflow-hidden" style={{ animationDelay: "260ms" }}>
              <Image
                src="/downloads/hero.webp"
                alt={t("hero.imageAlt")}
                fill
                priority
                sizes="(max-width:768px) 100vw, 45vw"
                className="w-full h-full object-contain"
              />
              {/* gold blueprint scan sweeping the documents */}
              <div className="qs-scan" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </section>

      {/* LIBRARY TREE — entirely ERP-driven now (see live-website-tree.tsx):
          whatever the CRM's CompanyDoc "Website" branch currently holds is
          exactly what renders here, fetched client-side on every visit. */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <LiveWebsiteTree />
        </div>
      </section>

      {/* HELPERS */}
      <section className="qs-closing-cta py-10 sm:py-12 lg:py-14 bg-paper border-t border-line">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-line p-6 sm:p-7 relative
                          before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
            <div className="font-mono text-label-xs text-gold-1 tracking-[.16em] uppercase">{t("plc.tag")}</div>
            <h3 className="font-display font-semibold text-subhead tracking-[-.01em] mt-2.5 mb-3">{t("plc.heading")}</h3>
            <p className="text-meta text-[#4a4842] leading-[1.7] m-0 mb-5">{t("plc.body")}</p>
            <Link className="qs-btn qs-btn-gold qs-btn-sm" href="/contact">{t("plc.register")}</Link>
          </div>
          <div className="bg-white border border-line p-6 sm:p-7 relative
                          before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
            <div className="font-mono text-label-xs text-gold-1 tracking-[.16em] uppercase">{t("macro.tag")}</div>
            <h3 className="font-display font-semibold text-subhead tracking-[-.01em] mt-2.5 mb-3">{t("macro.heading")}</h3>
            <p className="text-meta text-[#4a4842] leading-[1.7] m-0 mb-5">{t("macro.body")}</p>
            <div className="flex gap-3">
              <Link className="qs-btn qs-btn-gold qs-btn-sm" href="/contact">{t("macro.request")}</Link>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/contact">{t("macro.contact")}</Link>
            </div>
          </div>
        </div>
      </section>
    </LiveWebsiteDocsProvider>
  );
}
