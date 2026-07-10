import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildBreadcrumbList, JsonLd } from "@/lib/seo/jsonld";
import { ProductVideo } from "../products/_components/product-video";
import type { Locale } from "@/lib/i18n/config";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://qstech.vn";

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
    alternates: buildAlternates("/applications"),
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
  { slug: "phay-cnc", n: "01" },
  { slug: "cua-long", n: "02" },
  { slug: "dan-keo", n: "03" },
  { slug: "thuc-pham", n: "04" },
  { slug: "uon-lo-xo", n: "05" },
  { slug: "mong-go", n: "06" },
  { slug: "kim-hoan", n: "07" },
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
        <div className="relative z-10 max-w-wrap mx-auto px-12 pt-12 pb-14">
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
            {/* PCB visual — live gold current flows the traces; solder pads breathe */}
            <div className="qs-rise relative aspect-video border overflow-hidden"
                 style={{ background:"linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)", borderColor:"#2a2a2a", animationDelay: "260ms" }}>
              <svg viewBox="0 0 600 340" className="w-full h-full">
                <g stroke="#5a4a24" strokeWidth="1" fill="none" opacity=".55">
                  <path d="M0 60 L300 60 L340 100 L600 100"/>
                  <path d="M0 140 L240 140 L280 100 L600 110"/>
                  <path d="M0 220 L260 220 L300 180 L600 180"/>
                  <path d="M0 280 L320 280 L360 240 L600 250"/>
                </g>
                {/* animated gold current tracing the same paths */}
                <g className="qs-pcb-flow" stroke="#e8c878" strokeWidth="1.4" fill="none">
                  <path d="M0 60 L300 60 L340 100 L600 100"/>
                  <path d="M0 220 L260 220 L300 180 L600 180"/>
                </g>
                <rect x="240" y="80" width="120" height="180" fill="#1a1815" stroke="#c9a35a"/>
                <text x="300" y="180" fontFamily="Inter Tight,sans-serif" fontSize="32" fontWeight="800" fill="#c9a35a" textAnchor="middle">QS</text>
                <g fill="#3a8d4d">
                  <rect className="qs-pcb-pad" x="60" y="60" width="80" height="60"/>
                  <rect className="qs-pcb-pad" x="60" y="140" width="80" height="60"/>
                  <rect className="qs-pcb-pad" x="440" y="60" width="80" height="60"/>
                  <rect className="qs-pcb-pad" x="440" y="140" width="80" height="60"/>
                </g>
              </svg>
              {/* gold blueprint scan sweeping the board */}
              <div className="qs-scan" aria-hidden="true"></div>
              <div className="absolute top-3.5 right-3.5 w-16 h-px bg-gold"></div>
              <div className="absolute bottom-3.5 left-3.5 font-mono text-[10px] text-gold-2 tracking-[.18em] uppercase">PCB · QS TECHNOLOGY · v2026</div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="py-20 bg-white" id="list">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("catalogEyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("catalogHeading")}</h2>
            </div>
            <span className="font-mono text-[11px] text-muted tracking-[.1em] uppercase">{t("caseStudies")}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line">
            {apps.map(a => (
              <Link key={a.slug} href={`/applications/${a.slug}`}
                    className="bg-white p-6 flex flex-col gap-4 hover:bg-paper transition-colors relative
                               before:content-[''] before:absolute before:top-0 before:left-6 before:w-8 before:h-0.5 before:bg-gold">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ {a.n} ] {a.t}</div>
                <div className="aspect-[5/4] border border-line grid place-items-center"
                     style={{background:"radial-gradient(circle, #fff, #f0eee8)"}}>
                  <span className="font-mono text-[10px] text-muted tracking-[.16em]">FIG · {a.n}</span>
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
            <div className="bg-ink text-[#cfc9b8] p-6 flex flex-col items-center justify-center gap-3">
              <div className="font-display font-bold text-3xl text-gold-2 tracking-[-.01em]">+ 07</div>
              <div className="font-mono text-[10px] text-[#a8a499] tracking-[.16em] uppercase">{t("more")}</div>
            </div>
          </div>

          {/* pagination */}
          <div className="mt-12 flex justify-end items-end gap-6">
            <div className="flex gap-1.5">
              <button className="w-9 h-9 border border-line grid place-items-center text-muted hover:border-ink hover:text-ink">‹</button>
              <button className="w-9 h-9 border border-ink bg-ink text-white grid place-items-center font-mono text-[11px]">1</button>
              <button className="w-9 h-9 border border-line grid place-items-center font-mono text-[11px] text-muted hover:border-ink hover:text-ink">2</button>
              <button className="w-9 h-9 border border-line grid place-items-center text-muted hover:border-ink hover:text-ink">›</button>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO — centered feature clip below the catalog */}
      <section className="py-20 bg-paper border-t border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="max-w-[900px] mx-auto text-center">
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("videoEyebrow")}</span>
            <h2 className="qs-h2 mt-2">{t("videoHeading")}</h2>
          </div>
          <div className="max-w-[900px] mx-auto mt-8">
            <ProductVideo youtubeId={APP_VIDEO_ID} title={t("videoHeading")} playLabel={t("videoPlay")} />
          </div>
        </div>
      </section>
    </>
  );
}
