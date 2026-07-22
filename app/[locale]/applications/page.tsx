import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildTrail, JsonLd } from "@/lib/seo/jsonld";
import { ProductVideo } from "../products/_components/product-video";
import type { Locale } from "@/lib/i18n/config";

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

// Shop-floor still + short label for each existing case study. Order matches
// `application.index.items` so the label/machine lookup by index stays in sync.
const appAssets = [
  { slug: "phay-cnc", img: "/home/app-phay-cnc.webp" },
  { slug: "cua-long", img: "/home/app-cua-long.webp" },
  { slug: "dan-keo", img: "/home/app-dan-keo.webp" },
  { slug: "uon-lo-xo", img: "/home/app-uon-lo-xo.webp" },
  { slug: "mong-go", img: "/home/app-mong-go.webp" },
  { slug: "kim-hoan", img: "/home/app-kim-hoan.webp" },
];

type AppSubItem = { kind: "case"; slug: string } | { kind: "soon"; key: string };

// Material-based taxonomy for the index (index-only regroup). Each row aligns
// with `application.index.groups`: existing case studies link to their detail
// page; sub-types without content yet render as "coming soon" placeholders.
const appTaxonomy: AppSubItem[][] = [
  [{ kind: "case", slug: "phay-cnc" }],
  [{ kind: "soon", key: "dieu-khac-go" }, { kind: "case", slug: "cua-long" }, { kind: "case", slug: "mong-go" }],
  [{ kind: "soon", key: "dieu-khac-da" }, { kind: "soon", key: "cat-da" }],
  [{ kind: "case", slug: "kim-hoan" }],
  [{ kind: "case", slug: "dan-keo" }, { kind: "case", slug: "uon-lo-xo" }],
];

export default async function Applications({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "application.index" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  const appText = t.raw("items") as { t: string; machine: string }[];
  const groupMeta = t.raw("groups") as { name: string; tag: string; desc: string; axes?: string }[];
  const soon = t.raw("soon") as { label: string; imageLabel: string; items: Record<string, string> };
  // Resolve a case sub-item to its shop-floor image + labels from the shared rows.
  const caseAt = (slug: string) => {
    const i = appAssets.findIndex((a) => a.slug === slug);
    return { img: appAssets[i].img, label: appText[i].t, machine: appText[i].machine };
  };
  const groups = groupMeta.map((meta, gi) => ({ ...meta, n: String(gi + 1).padStart(2, "0"), items: appTaxonomy[gi] }));
  const caseCount = appTaxonomy.flat().filter((it) => it.kind === "case").length;
  const breadcrumb = buildTrail(locale, t("breadcrumb.home"), [
    { name: seo("applicationsTitle"), path: "/applications" },
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
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-none">
              <div className="qs-eyebrow qs-rise" style={{ animationDelay: "0ms" }}>{t("eyebrow")}</div>
              <h1 className="qs-h1 mt-3.5 qs-rise" style={{ animationDelay: "90ms" }}>
                <em className="not-italic qs-gold-shimmer">{t("heading")}</em>
              </h1>
              <p className="qs-lede mt-5 qs-rise" style={{ animationDelay: "190ms" }}>
                {t("lede")}
              </p>
            </div>
            {/* Controller family montage — the full QS lineup on the dark board panel */}
            <div className="order-1 lg:order-none qs-rise relative aspect-[4/3] border overflow-hidden"
                 style={{ background:"linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)", borderColor:"#2a2a2a", animationDelay: "260ms" }}>
              <div className="absolute inset-0 qs-grid-bg opacity-20" aria-hidden="true"></div>
              <Image src="/home/app-hero-controllers.webp" alt={t("heading")} fill priority
                     sizes="(max-width:768px) 100vw, 58vw"
                     className="object-contain p-6" />
              {/* gold blueprint scan sweeping the panel */}
              <div className="qs-scan" aria-hidden="true"></div>
              <div className="absolute top-3.5 right-3.5 w-16 h-px bg-gold"></div>
              <div className="absolute bottom-3.5 left-3.5 font-mono text-label-xs text-gold-2 tracking-[.18em] uppercase">QS TECHNOLOGY · CONTROLLERS · v2026</div>
            </div>
          </div>
        </div>
      </section>

      {/* GROUPED BY MATERIAL */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white" id="list">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">{t("catalogEyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("catalogHeading")}</h2>
            </div>
            <span className="font-mono text-label text-muted tracking-[.1em] uppercase">{t("caseStudies", { count: caseCount })}</span>
          </div>
          {/* Each material group is its own bordered block with breathing room
              between them, so the catalog reads as distinct sections instead of
              one continuous grid. The tinted header band + gold rail mark where a
              group starts; existing case studies link out, new sub-types render as
              non-clickable "coming soon" placeholders (no dead links). */}
          <div className="space-y-6 sm:space-y-8">
            {groups.map((g) => (
              <div key={g.name} className="border border-line bg-white">
                {/* header band — tinted + gold rail so the group start is unmistakable */}
                <div className="relative flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2.5 bg-paper border-b border-line py-5 pl-7 sm:pl-8 pr-5 sm:pr-7
                                before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gold">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                    <span className="font-mono font-bold text-subhead text-gold-1 leading-none tracking-[.02em]">{g.n}</span>
                    <span className="font-mono text-label-xs text-muted tracking-[.16em] uppercase">/ {String(groups.length).padStart(2, "0")}</span>
                    <h3 className="font-display font-bold text-subhead tracking-[-.01em] m-0 ml-1">{g.name}</h3>
                    <span className="font-mono text-label-xs text-muted tracking-[.16em] uppercase">· {g.tag}</span>
                    {g.axes && (
                      <span className="font-mono text-label-xs text-gold-1 tracking-[.14em] uppercase border border-gold/40 rounded-full px-2 py-0.5">{g.axes}</span>
                    )}
                  </div>
                  <p className="text-meta text-muted leading-[1.5] m-0 max-w-[54ch]">{g.desc}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line">
                  {g.items.map((it) =>
                    it.kind === "case" ? (
                      (() => {
                        const c = caseAt(it.slug);
                        return (
                          <Link key={it.slug} href={`/applications/${it.slug}`}
                                className="group bg-white p-5 flex flex-col gap-3 hover:bg-paper transition-colors relative
                                           before:content-[''] before:absolute before:top-0 before:left-5 before:w-8 before:h-0.5 before:bg-gold">
                            <div className="font-mono text-label-xs text-gold-1 tracking-[.16em] uppercase">{c.label}</div>
                            <div className="relative aspect-[4/3] border border-line overflow-hidden bg-paper">
                              <Image src={c.img} alt={c.machine} fill sizes="(max-width:768px) 50vw, 25vw"
                                     className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                              <div className="qs-scan" aria-hidden="true"></div>
                            </div>
                            <div className="flex justify-between items-center pt-2 mt-auto font-mono text-label-xs tracking-[.12em] uppercase text-gold-1">
                              <span>{t("detail")}</span>
                              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                            </div>
                          </Link>
                        );
                      })()
                    ) : (
                      <div key={it.key} className="bg-white p-5 flex flex-col gap-3">
                        <div className="font-mono text-label-xs text-muted tracking-[.16em] uppercase">{soon.items[it.key]}</div>
                        <div className="relative aspect-[4/3] border border-dashed border-gold/40 overflow-hidden flex items-center justify-center px-3 text-center"
                             style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}>
                          <span className="font-mono text-label-xs text-muted tracking-[.14em] uppercase">{soon.imageLabel}</span>
                        </div>
                        <div className="pt-2 mt-auto font-mono text-label-xs tracking-[.12em] uppercase text-muted">{soon.label}</div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO — centered feature clip below the catalog */}
      <section className="py-12 sm:py-16 lg:py-24 bg-paper border-t border-line">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-[900px] mx-auto text-center">
            <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">{t("videoEyebrow")}</span>
            <h2 className="qs-h2 mt-2">{t("videoHeading")}</h2>
          </div>
          <div className="max-w-[900px] mx-auto mt-8">
            <ProductVideo youtubeId={APP_VIDEO_ID} title={t("videoHeading")} playLabel={t("videoPlay")} />
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white border-t border-line">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <div className="bg-[#11120f] text-[#cfc9b8] p-7 sm:p-10 lg:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center border border-[#28261f]">
            <div>
              <h3 className="font-display font-bold text-h2 text-white tracking-[-.01em] m-0">{t("ctaHeading")}</h3>
              <p className="text-[#a8a499] mt-2 max-w-[60ch] m-0 text-body leading-relaxed">{t("ctaBody")}</p>
            </div>
            <Link className="qs-btn qs-btn-gold" href="/contact">{t("ctaBtn")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
