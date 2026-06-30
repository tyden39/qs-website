import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getApplicationBySlug, getApplicationSlugs } from "@/lib/data/applications";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildTechArticle, JsonLd } from "@/lib/seo/jsonld";
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
    alternates: buildAlternates(`/applications/${slug}`),
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
const appSlugs = ["phay-cnc", "cua-long", "dan-keo", "thuc-pham", "uon-lo-xo", "mong-go", "kim-hoan"];
const relatedAppsMeta = [
  { slug: "cua-long", n: "02" },
  { slug: "dan-keo", n: "03" },
  { slug: "uon-lo-xo", n: "05" },
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
  const heroStats = t.raw("heroStats") as [string, string][];
  const workflow = (t.raw("workflow") as { l: string; t: string; d: string }[]).map((w, i) => ({ ...w, n: String(i + 1).padStart(2, "0") }));
  const specs = t.raw("specs") as [string, string][];
  const deployments = t.raw("deployments") as { name: string; loc: string }[];
  const relatedApps = relatedAppsMeta.map((r) => ({ ...r, t: machineFor(r.slug) }));
  const appData = await getApplicationBySlug(slug, locale);
  const techArticleJsonLd = appData ? buildTechArticle(appData, locale) : null;

  return (
    <>
      {techArticleJsonLd && <JsonLd data={techArticleJsonLd} />}
      {/* DARK HERO */}
      <section className="relative overflow-hidden bg-ink text-[#cfc9b8] border-b border-[#2a2620]">
        <div className="absolute inset-0 qs-grid-bg opacity-[.15]"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-12 pb-16">
          <div className="qs-crumb mb-8">
            <Link href="/" className="text-[#a8a499]!">{t("breadcrumb.home")}</Link><span className="sep text-[#a8a499]!">/</span>
            <Link href="/applications" className="text-[#a8a499]!">{t("breadcrumb.applications")}</Link><span className="sep text-[#a8a499]!">/</span>
            <span className="here text-gold-2! capitalize">{machine}</span>
          </div>
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-16 items-end">
            <div>
              <span className="font-mono text-[11px] text-gold-2 tracking-[.16em] uppercase">{t("appLabel", { idx: String(idx).padStart(2, "0") })}</span>
              <h1 className="font-display font-bold tracking-[-.02em] text-white mt-3.5"
                  style={{fontSize:"72px", lineHeight:".95"}}>
                {t("heroLine1")}<br/>{t("heroForPrefix")} {machine.toLowerCase()}
              </h1>
              <p className="mt-6 text-[17px] leading-[1.6] text-[#a8a499] max-w-[55ch]">
                {t("heroLede")}
              </p>
              <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-[#2a2620]">
                {heroStats.map(([v,l]) => (
                  <div key={l}>
                    <div className="font-display font-bold text-[32px] text-gold-2 tracking-[-.01em]">{v}</div>
                    <div className="font-mono text-[10px] text-[#7a7570] tracking-[.16em] uppercase mt-1.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-4/5 border overflow-hidden"
                 style={{ background:"linear-gradient(135deg, #1a1815, #0a0a08)", borderColor:"#2a2620" }}>
              <div className="absolute inset-4.5 border border-dashed border-gold opacity-25"></div>
              <div className="grid place-items-center h-full">
                <svg viewBox="0 0 200 250" className="w-3/4 h-3/4">
                  <rect x="40" y="60" width="120" height="40" fill="#cfc9b8" stroke="#8a8680"/>
                  <rect x="50" y="100" width="100" height="80" fill="#a8a499" stroke="#5a5650"/>
                  <rect x="90" y="20" width="20" height="40" fill="#3a3530"/>
                  <circle cx="100" cy="180" r="14" fill="#c8553d"/>
                </svg>
              </div>
              <div className="absolute top-4 right-4 font-mono text-[10px] tracking-[.18em] uppercase text-gold-2/60">+ DETAIL · 02</div>
              <div className="absolute bottom-4 left-4 font-mono text-[10px] tracking-[.18em] uppercase text-gold-2/60">SCALE 1 : 4</div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="py-20 bg-white border-b border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("workflowEyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("workflowHeading")}</h2>
            </div>
            <p className="text-sm text-muted leading-[1.7] max-w-[44ch] m-0">
              {t("workflowLede")}
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-px bg-line border border-line">
            {workflow.map(s => (
              <div key={s.n} className="bg-white p-7 relative
                                         before:content-[''] before:absolute before:top-0 before:left-7 before:w-8 before:h-0.5 before:bg-gold">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">{s.n} {s.l}</div>
                <h3 className="font-display font-semibold text-lg mt-3 m-0 leading-[1.3]">{s.t}</h3>
                <p className="text-sm text-muted leading-[1.6] mt-2.5 m-0">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
