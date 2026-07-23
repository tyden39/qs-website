import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import CircuitTraces from "@/components/circuit-traces";
import WorkpieceCompare from "@/app/[locale]/machine-building/_components/workpiece-compare";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildTrail, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const title = t("servicesTitle");
  const description = t("servicesDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/services", locale),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/services",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Service({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "service.index" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  const intro = t("intro");
  const pillars = t.raw("solution.pillars") as [string, string, string][];
  const upgradeSpecs = t.raw("upgrade.specs") as [string, string, string][];
  const breadcrumb = buildTrail(locale, t("breadcrumb.home"), [
    { name: seo("servicesTitle"), path: "/services" },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-50" aria-hidden="true"></div>
        {/* breathing gold atmosphere + brand PCB signature bleeding off the right */}
        <div className="qs-glow hidden sm:block right-[4%] top-[-40%] w-[36%] h-[150%]" aria-hidden="true"></div>
        <CircuitTraces
          variant="light"
          className="hidden lg:block absolute top-0 right-0 w-[44%] h-full opacity-[.45] [mask-image:radial-gradient(ellipse_at_top_right,#000_24%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_right,#000_24%,transparent_72%)]"
        />
        <div className="relative z-10 max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 pt-12 pb-16">
          <div className="qs-crumb mb-8">
            <Link href="/">{t("breadcrumb.home")}</Link><span className="sep">/</span>
            <span className="here">{t("breadcrumb.current")}</span>
          </div>
          <div className="qs-eyebrow qs-rise" style={{ animationDelay: "0ms" }}>{t("eyebrow")}</div>
          <h1 className="qs-h1 mt-3.5">
            <span className="block overflow-hidden pb-[.06em]">
              <span className="block qs-rise" style={{ animationDelay: "90ms" }}>{t("heading1")}</span>
            </span>
            <span className="block overflow-hidden pb-[.06em]">
              <span className="block qs-rise" style={{ animationDelay: "190ms" }}>
                <em className="not-italic font-semibold qs-gold-shimmer">{t("heading2")}</em>
              </span>
            </span>
          </h1>
          <p className="qs-lede mt-6 max-w-[64ch] qs-rise" style={{ animationDelay: "300ms" }}>{intro}</p>
        </div>
      </section>

      {/* GIẢI PHÁP TOÀN DIỆN */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">{t("solution.eyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("solution.heading")}</h2>
            </div>
          </div>

          <p className="text-lede leading-[1.75] text-[#3a3a3a] max-w-[74ch] m-0">{t("solution.lead")}</p>

          <div className="grid md:grid-cols-3 gap-6 mt-10 sm:mt-12">
            {pillars.map(([num, title, desc]) => (
              <div key={num} className="border border-line bg-paper p-7 relative overflow-hidden">
                <span className="font-mono text-[42px] leading-none font-bold text-gold-1/20 absolute top-4 right-5 select-none" aria-hidden>{num}</span>
                <div className="font-mono text-label-xs text-gold-1 tracking-[.18em] uppercase mb-4">{num}</div>
                <h3 className="font-display font-bold text-title tracking-[-.01em] uppercase m-0">{title}</h3>
                <p className="text-meta leading-[1.7] text-[#4a4842] mt-3 m-0">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASE STUDY — BEFORE / AFTER */}
      <section className="py-12 sm:py-16 lg:py-24 bg-paper border-y border-line">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">{t("upgrade.eyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("upgrade.heading")}</h2>
            </div>
            <span className="font-mono text-label text-muted tracking-[.1em] uppercase">{t("upgrade.tag")}</span>
          </div>

          <div className="border border-line bg-white">
            {/* card header */}
            <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
              <span className="font-display text-lede font-bold tracking-[-.01em] text-ink">{t("upgrade.machine")}</span>
              <span className="font-mono text-label-xs text-muted tracking-[.14em] uppercase">{t("upgrade.machineNote")}</span>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1.05fr)_1fr]">
              {/* before / after drag-to-reveal slider */}
              <div className="p-5 border-b lg:border-b-0 lg:border-r border-line">
                <WorkpieceCompare
                  img="/img/services/upgrade-tc217-after.webp"
                  beforeImg="/img/services/upgrade-tc217-before.webp"
                  alt={t("upgrade.afterFrame")}
                  beforeLabel={t("upgrade.before")}
                  afterLabel={t("upgrade.after")}
                  hint={t("upgrade.hint")}
                  aspectClass="aspect-[5/6]"
                />
              </div>

              {/* before / after spec comparison */}
              <div className="p-6">
                <div className="font-mono text-label-xs text-gold-1 tracking-[.16em] uppercase mb-1">{t("upgrade.specsLabel")}</div>
                <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-x-4 border-b border-line py-2.5 font-mono text-label-xs tracking-[.14em] uppercase">
                  <span className="text-muted">{t("upgrade.componentCol")}</span>
                  <span className="text-[#8a5a2b] text-right">{t("upgrade.before")}</span>
                  <span className="text-ink text-right">{t("upgrade.after")}</span>
                </div>
                <ul className="list-none p-0 m-0">
                  {upgradeSpecs.map(([label, before, after]) => (
                    <li key={label} className="grid grid-cols-[1.3fr_1fr_1fr] gap-x-4 items-baseline border-b border-line py-3 last:border-b-0">
                      <span className="text-meta text-[#4a4842]">{label}</span>
                      <span className="text-meta text-[#8a5a2b] text-right">{before}</span>
                      <span className="font-display text-meta font-semibold text-ink text-right">{after}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIÊN HỆ */}
      <section className="relative overflow-hidden border-t border-line py-12 sm:py-16 lg:py-24" id="contact"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-40" aria-hidden="true"></div>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-grad" aria-hidden="true"></div>
        <div className="qs-glow hidden sm:block right-[6%] top-[-30%] w-[30%] h-[140%]" aria-hidden="true"></div>

        <div className="relative z-10 max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[64ch] text-center flex flex-col items-center">
            <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">{t("contact.eyebrow")}</span>
            <h2 className="qs-h2 mt-2">{t("contact.heading")}</h2>
            <p className="text-lede leading-[1.75] text-[#3a3a3a] mt-5">{t("contact.body")}</p>

            <div className="mt-9">
              <Link href="/contact" className="qs-btn qs-btn-gold">{t("contact.cta")}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
