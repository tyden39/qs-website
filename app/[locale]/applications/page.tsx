import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildBreadcrumbList, JsonLd } from "@/lib/seo/jsonld";
import { ProductVideo } from "../products/_components/product-video";
import type { Locale } from "@/lib/i18n/config";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://qstcnc.com";

// Shop-floor feature clip shown below the catalog list.
const APP_VIDEO_ID = "kLcNpeHu-2A";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const title = t("applicationsTitle");
  const description = t("applicationsDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/applications", locale),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/applications",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const appAssets = [
  { slug: "phay-cnc", n: "01", img: "/home/app-phay-cnc.webp" },
  { slug: "cua-long", n: "02", img: "/home/app-cua-long.webp" },
  { slug: "dan-keo", n: "03", img: "/home/app-dan-keo.webp" },
  { slug: "thuc-pham", n: "04", img: "/home/app-thuc-pham.webp" },
  { slug: "uon-lo-xo", n: "05", img: "/home/app-uon-lo-xo.webp" },
  { slug: "mong-go", n: "06", img: "/home/app-mong-go.webp" },
  { slug: "kim-hoan", n: "07", img: "/home/app-kim-hoan.webp" },
];

export default async function Applications({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "application.index" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  const appText = t.raw("items") as { t: string; machine: string }[];
  const apps = appAssets.map((a, i) => ({ ...a, ...appText[i] }));
  const breadcrumb = buildBreadcrumbList([
    { name: t("breadcrumb.home"), url: `${APP_URL}${locale === "en" ? "/en" : ""}` },
    { name: seo("applicationsTitle"), url: `${APP_URL}${locale === "en" ? "/en" : ""}/applications` },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-50" aria-hidden="true"></div>
        {/* breathing gold atmosphere behind the board panel */}
        <div className="qs-glow hidden sm:block right-[8%] top-[-30%] w-[36%] h-[150%]" aria-hidden="true"></div>
        <div className="relative z-10 max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 pt-12 pb-14">
          <div className="qs-crumb mb-6">
            <Link href="/">{t("breadcrumb.home")}</Link><span className="sep">/</span>
            <span className="here">{t("breadcrumb.current")}</span>
          </div>
          <div className="grid md:grid-cols-[1fr_1.4fr] gap-16 items-center">
            <div>
              <div className="qs-eyebrow qs-rise" style={{ animationDelay: "0ms" }}>{t("eyebrow")}</div>
              <h1 className="qs-h1 mt-3.5 qs-rise" style={{fontSize:"clamp(48px,6vw,80px)", animationDelay: "90ms"}}>
                <em className="not-italic qs-gold-shimmer">{t("heading")}</em>
              </h1>
              <p className="qs-lede mt-5 qs-rise" style={{ animationDelay: "190ms" }}>
                {t("lede")}
              </p>
            </div>
            {/* Controller family montage — the full QS lineup on the dark board panel */}
            <div className="qs-rise relative aspect-[4/3] border overflow-hidden"
                 style={{ background:"linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)", borderColor:"#2a2a2a", animationDelay: "260ms" }}>
              <div className="absolute inset-0 qs-grid-bg opacity-20" aria-hidden="true"></div>
              <Image src="/home/app-hero-controllers.webp" alt={t("heading")} fill priority
                     sizes="(max-width:768px) 100vw, 58vw"
                     className="object-contain p-6" />
              {/* gold blueprint scan sweeping the panel */}
              <div className="qs-scan" aria-hidden="true"></div>
              <div className="absolute top-3.5 right-3.5 w-16 h-px bg-gold"></div>
              <div className="absolute bottom-3.5 left-3.5 font-mono text-[10px] text-gold-2 tracking-[.18em] uppercase">QS TECHNOLOGY · CONTROLLERS · v2026</div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="py-20 bg-white" id="list">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("catalogEyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("catalogHeading")}</h2>
            </div>
            <span className="font-mono text-[11px] text-muted tracking-[.1em] uppercase">{t("caseStudies", { count: apps.length })}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line">
            {apps.map(a => (
              <Link key={a.slug} href={`/applications/${a.slug}`}
                    className="group bg-white p-6 flex flex-col gap-4 hover:bg-paper transition-colors relative
                               before:content-[''] before:absolute before:top-0 before:left-6 before:w-8 before:h-0.5 before:bg-gold">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ {a.n} ] {a.t}</div>
                <div className="relative aspect-[5/4] border border-line overflow-hidden bg-paper">
                  <Image src={a.img} alt={a.machine} fill sizes="(max-width:768px) 50vw, 25vw"
                         className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  <span className="absolute bottom-2 right-2 font-mono text-[10px] text-white/85 tracking-[.16em] mix-blend-difference">FIG · {a.n}</span>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-muted tracking-[.16em] uppercase">{t("controllerFor")}</div>
                  <h3 className="font-display font-semibold text-[17px] m-0 mt-1.5 leading-[1.3]">{a.machine}</h3>
                </div>
                <div className="flex justify-between items-center pt-3 mt-auto border-t border-line font-mono text-[10px] tracking-[.12em] uppercase">
                  <span>{t("detail")}</span><span>→</span>
                </div>
              </Link>
            ))}
            {/* honest catalog summary fills the trailing grid cell */}
            <div className="bg-ink text-[#cfc9b8] p-6 flex flex-col items-center justify-center gap-3">
              <div className="font-display font-bold text-3xl text-gold-2 tracking-[-.01em]">
                {String(apps.length).padStart(2, "0")}
              </div>
              <div className="font-mono text-[10px] text-[#a8a499] tracking-[.16em] uppercase text-center">{t("catalogHeading")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO — centered feature clip below the catalog */}
      <section className="py-20 bg-paper border-t border-line">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-[900px] mx-auto text-center">
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("videoEyebrow")}</span>
            <h2 className="qs-h2 mt-2">{t("videoHeading")}</h2>
          </div>
          <div className="max-w-[900px] mx-auto mt-8">
            <ProductVideo youtubeId={APP_VIDEO_ID} title={t("videoHeading")} playLabel={t("videoPlay")} />
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="py-18 lg:py-20 bg-white border-t border-line">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <div className="bg-[#11120f] text-[#cfc9b8] p-7 sm:p-10 lg:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center border border-[#28261f]">
            <div>
              <h3 className="font-display font-bold text-3xl text-white tracking-[-.01em] m-0">{t("ctaHeading")}</h3>
              <p className="text-[#a8a499] mt-2 max-w-[60ch] m-0 text-[15px] leading-relaxed">{t("ctaBody")}</p>
            </div>
            <Link className="qs-btn qs-btn-gold" href="/contact">{t("ctaBtn")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
