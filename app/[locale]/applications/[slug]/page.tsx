import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import Reveal from "@/components/reveal";
import RailNudge from "@/components/rail-nudge";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getApplicationBySlug, getApplicationProducts, getApplicationSlugs } from "@/lib/data/applications";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildTechArticle, buildTrail, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";
import { routing } from "@/lib/i18n/routing";

export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = getApplicationSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = await getApplicationBySlug(slug, locale);
  const title = a?.title ?? slug.replace(/-/g, " ");
  const description = a?.summary?.slice(0, 160) ?? "";
  return {
    title,
    description,
    alternates: buildAlternates(`/applications/${slug}`, locale),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: `/applications/${slug}`,
      images: [
        {
          url: a?.heroImage ?? "/og-default.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// Slug order drives the machine-name lookup and the application index.
const appSlugs = ["phay-cnc", "cua-long", "dan-keo", "uon-lo-xo", "mong-go", "kim-hoan"];
const relatedAppsMeta = [
  { slug: "cua-long", n: "02" },
  { slug: "dan-keo", n: "03" },
  { slug: "uon-lo-xo", n: "04" },
];

export default async function ApplicationDetail({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "application.detailPage" });
  const tIndex = await getTranslations({ locale, namespace: "application.index" });
  const indexItems = tIndex.raw("items") as { t: string; machine: string }[];
  const machineFor = (s: string) => {
    const i = appSlugs.indexOf(s);
    return i >= 0 ? indexItems[i].machine : s.replace(/-/g, " ");
  };
  const machine = machineFor(slug);
  const idx = appSlugs.indexOf(slug) + 1 || 1;
  // Per-machine content overrides the shared defaults; unknown slugs fall back to the defaults.
  const machines = t.raw("machines") as Record<
    string,
    { heroLede: string; workflowLede: string; workflow: { l: string; t: string; d: string }[] }
  >;
  const machine_ = machines?.[slug];
  const heroLede = machine_?.heroLede ?? t("heroLede");
  const specs = t.raw("specs") as [string, string][];
  const deployments = t.raw("deployments") as { name: string; loc: string }[];
  const relatedApps = relatedAppsMeta.map((r) => ({ ...r, t: machineFor(r.slug) }));
  const appData = await getApplicationBySlug(slug, locale);
  const relatedProducts = getApplicationProducts(slug, locale);
  const techArticleJsonLd = appData ? buildTechArticle(appData, locale) : null;
  const breadcrumb = buildTrail(locale, t("breadcrumb.home"), [
    { name: t("breadcrumb.applications"), path: "/applications" },
    { name: machine, path: `/applications/${slug}` },
  ]);

  return (
    <>
      {techArticleJsonLd && <JsonLd data={techArticleJsonLd} />}
      <JsonLd data={breadcrumb} />
      {/* DARK HERO */}
      <section className="relative overflow-hidden bg-ink text-[#cfc9b8] border-b border-[#2a2620]">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.15]" aria-hidden="true"></div>
        {/* breathing gold atmosphere behind the detail plate */}
        <div className="qs-glow hidden sm:block right-[4%] top-[-25%] w-[34%] h-[150%]" aria-hidden="true"></div>
        <div className="relative max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 pt-12 pb-16">
          <div className="qs-crumb mb-8">
            <Link href="/" className="text-[#a8a499]!">{t("breadcrumb.home")}</Link><span className="sep text-[#a8a499]!">/</span>
            <Link href="/applications" className="text-[#a8a499]!">{t("breadcrumb.applications")}</Link><span className="sep text-[#a8a499]!">/</span>
            <span className="here text-gold-2! capitalize">{machine}</span>
          </div>
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 sm:gap-16 items-end">
            <div className="order-2 md:order-1">
              <span className="inline-block qs-rise font-mono text-label text-gold-2 tracking-[.16em] uppercase" style={{ animationDelay: "0ms" }}>{t("appLabel", { idx: String(idx).padStart(2, "0") })}</span>
              <h1 className="qs-rise font-display font-bold tracking-[-.02em] text-white mt-3.5"
                  style={{fontSize:"clamp(40px,9vw,72px)", lineHeight:".95", animationDelay: "80ms"}}>
                {t("heroLine1")}<br/>{t("heroForPrefix")} {machine.toLowerCase()}
              </h1>
              <p className="qs-rise mt-6 text-lede leading-[1.6] text-[#a8a499] max-w-[55ch]" style={{ animationDelay: "180ms" }}>
                {heroLede}
              </p>
            </div>
            <div className="qs-rise relative order-1 aspect-4/5 border overflow-hidden md:order-2"
                 style={{ background:"linear-gradient(135deg, #1a1815, #0a0a08)", borderColor:"#2a2620", animationDelay: "160ms" }}>
              {appData?.heroImage && (
                <Image src={appData.heroImage} alt={machine} fill sizes="(max-width:768px) 100vw, 40vw"
                       className="qs-kenburns object-cover" priority />
              )}
              <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(10,10,8,.55) 0%,rgba(10,10,8,.12) 55%,transparent 100%)" }}></div>
              {/* gold blueprint scan sweeping the plate */}
              <div className="qs-scan" aria-hidden="true"></div>
              <div className="absolute inset-4.5 border border-dashed border-gold opacity-25 pointer-events-none"></div>
              <div className="absolute top-4 right-4 font-mono text-label-xs tracking-[.18em] uppercase text-gold-2/60">+ DETAIL · 02</div>
              <div className="absolute bottom-4 left-4 font-mono text-label-xs tracking-[.18em] uppercase text-gold-2/60">SCALE 1 : 4</div>
            </div>
          </div>
        </div>
      </section>

      {/* MATCHING PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-24 bg-white border-b border-line">
          <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
            <Reveal className="qs-section-head">
              <div>
                <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">{t("productsEyebrow")}</span>
                <h2 className="qs-h2 mt-2">{t("productsHeading")}</h2>
              </div>
              <p className="text-meta text-muted leading-[1.7] max-w-[44ch] m-0">
                {t("productsLede")}
              </p>
            </Reveal>
            {/* phones: a snap-scrolling rail, one full-width product per screen (swipe cue
                below); from md up the same cards lay out as the 3/4-up grid. */}
            <div id="application-products-rail"
                 className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                            md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible
                            gap-px bg-line border border-line">
              {relatedProducts.map((p, i) => (
                <Reveal key={p.slug} className="qs-reveal-desktop flex items-stretch w-full shrink-0 snap-start md:w-auto" delay={i * 70}>
                <Link
                  href={`/electronics/${p.slug}`}
                  className="group w-full bg-white p-6 flex flex-col hover:bg-paper transition-colors relative
                             before:content-[''] before:absolute before:top-0 before:left-6 before:w-8 before:h-0.5 before:bg-gold"
                >
                  <div className="font-mono text-label-xs text-muted tracking-[.16em] uppercase">{t("productsModel")}</div>
                  <div className="relative aspect-4/3 mt-3 border border-line overflow-hidden"
                       style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}>
                    <Image src={p.image.src} alt={p.tag} fill sizes="(max-width:768px) 100vw, 25vw"
                           className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]" />
                  </div>
                  <h3 className="font-display font-bold text-title tracking-[-.01em] mt-4 m-0 leading-[1.2]">{p.name}</h3>
                  <p className="text-meta text-muted leading-[1.55] mt-2 m-0 line-clamp-2">{p.desc}</p>
                  <div className="flex justify-between items-center pt-4 mt-auto font-mono text-label-xs tracking-[.12em] uppercase text-gold-1">
                    <span>{t("productsViewDetail")}</span><span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
                </Link>
                </Reveal>
              ))}
            </div>
            <RailNudge targetId="application-products-rail" label={tIndex("swipeHint")} className="md:hidden" />
          </div>
        </section>
      )}

      {/* CONTACT CTA */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white border-t border-line">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <div className="bg-[#11120f] text-[#cfc9b8] p-7 sm:p-10 lg:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center border border-[#28261f]">
            <div>
              <h3 className="font-display font-bold text-h2 text-white tracking-[-.01em] m-0">{t("ctaHeading", { machine })}</h3>
              <p className="text-[#a8a499] mt-2 max-w-[60ch] m-0 text-body leading-relaxed">{t("ctaBody")}</p>
            </div>
            <Link className="qs-btn qs-btn-gold" href="/contact">{t("ctaBtn")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
