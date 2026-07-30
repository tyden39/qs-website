import type { Metadata } from "next";
import Image from "@/components/media/image";
import { Link } from "@/lib/i18n/navigation";
import ContactCta from "@/components/contact-cta";
import Reveal from "@/components/reveal";
import RailNudge from "@/components/rail-nudge";
import { CategoryIcon } from "@/components/category-icon";
import { ProductVideo } from "../../electronics/_components/product-video";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getApplicationBySlug, getApplicationProducts, getApplicationSlugs } from "@/lib/data/applications";
import { buildAlternates } from "@/lib/seo/alternates";
import { seoDescription } from "@/lib/seo/text";
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
  const description = seoDescription(a?.summary ?? "");
  const alternates = buildAlternates(`/applications/${slug}`, locale);
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
      images: [
        {
          url: a?.heroImage ?? "/og-default-v2.png",
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
const appSlugs = ["phay-cnc", "cua-long", "dan-keo", "uon-lo-xo", "mong-go", "kim-hoan",
                  "dieu-khac-da", "cat-da", "dieu-khac-go"];
const relatedAppsMeta = [
  { slug: "cua-long", n: "02" },
  { slug: "dan-keo", n: "03" },
  { slug: "uon-lo-xo", n: "04" },
];

type CopyItem = { t: string; d?: string };
/** Visual for one copy item: a photo when the reference sheet has one, else a glyph.
 *  `contain` keeps line-art drawings whole instead of cropping them like a photo. */
type Media = { icon?: string; image?: string; contain?: boolean };

/** Photos cropped from the machine's reference sheet, in the order the copy lists them. */
const photos = (slug: string, names: string[]): Media[] =>
  names.map((name) => ({ image: `/img/applications/${slug}/${name}.webp` }));

/** Line drawings from a reference sheet — centred on a square frame, so they show
 *  whole at a common scale instead of being cropped like a photo. */
const drawings = (slug: string, files: string[]): Media[] =>
  files.map((file) => ({ image: `/img/applications/${slug}/${file}`, contain: true }));

// Media for the copy blocks below, keyed by position — the item titles are
// translated, so they can't identify an image or glyph across locales. Machines
// missing from a map render their copy without a visual.
const STRENGTH_MEDIA: Record<string, Media[]> = {
  "phay-cnc": [{ icon: "precision" }, { icon: "stability" }, { icon: "performance" }, { icon: "usability" }],
  "cua-long": [{ icon: "precision" }, { icon: "stability" }, { icon: "flexible-config" }, { icon: "productivity" }],
  "mong-go": [{ icon: "precision" }, { icon: "stability" }, { icon: "flexible-config" }, { icon: "productivity" }],
  "dan-keo": [{ icon: "precision" }, { icon: "stability" }, { icon: "flexible-config" }, { icon: "productivity" }],
  "uon-lo-xo": [{ icon: "precision" }, { icon: "stability" }, { icon: "flexible-config" }, { icon: "productivity" }],
  "kim-hoan": [{ icon: "precision" }, { icon: "stability" }, { icon: "flexible-config" }, { icon: "productivity" }],
  "dieu-khac-da": [{ icon: "precision" }, { icon: "stability" }, { icon: "carving" }, { icon: "productivity" }],
  "cat-da": [{ icon: "precision" }, { icon: "stability" }, { icon: "flexible-config" }, { icon: "productivity" }],
  "dieu-khac-go": [{ icon: "precision" }, { icon: "stability" }, { icon: "carving" }, { icon: "productivity" }],
};
const CAPABILITY_MEDIA: Record<string, Media[]> = {
  "phay-cnc": photos("phay-cnc", ["face-milling", "slot-milling", "drill-tap", "surface-3d", "probing"]),
  "cua-long": drawings("cua-long",
    ["straight-cut.webp", "curve-cut.webp", "arc-cut.webp", "contour-2d.webp", "logo-text.webp",
     "ornament.webp", "nesting.webp"]),
  "mong-go": photos("mong-go",
    ["square-tenon", "straight-tenon", "angled-tenon", "mortise", "dowel-hole", "groove", "custom-profile"]),
  "dan-keo": photos("dan-keo",
    ["line-straight", "line-rect", "line-circle", "line-curve", "dot", "bead", "line-3d"]),
  "uon-lo-xo": photos("uon-lo-xo",
    ["compression", "extension", "torsion", "formed", "non-standard", "double-torsion", "flat-wire", "complex"]),
  "kim-hoan": photos("kim-hoan",
    ["engraving", "surface-3d", "micro-drill", "lettering", "sculpt-3d", "polishing"]),
  "dieu-khac-da": photos("dieu-khac-da",
    ["statue-3d", "relief", "ornament", "portrait", "architectural", "art-piece", "hand-carving"]),
  "cat-da": photos("cat-da",
    ["straight-cut", "contour-2d", "arc-cut", "logo-text", "cladding", "decorative-detail", "pattern-copy"]),
  "dieu-khac-go": photos("dieu-khac-go",
    ["statue-3d", "relief", "ornament", "portrait", "furniture-detail", "hand-carving", "art-piece"]),
};
const COMPAT_MEDIA: Record<string, Media[]> = {
  "phay-cnc": [{ icon: "multi-axis" }, { icon: "gcode" }, { icon: "cam" }, { icon: "flexible-config" }],
  "cua-long": photos("cua-long",
    ["natural-wood", "mdf", "plywood", "engineering-plastic", "mica", "composite", "insulation-panel", "non-metal-sheet"]),
  "mong-go": photos("mong-go", ["natural-wood", "hardwood", "softwood", "engineered-wood"]),
  "dan-keo": photos("dan-keo",
    ["silicone", "epoxy", "uv", "ab-glue", "hot-melt", "anaerobic", "thermal", "nano-bead"]),
  "uon-lo-xo": [{ icon: "wire-round" }, { icon: "wire-square" }, { icon: "wire-flat" }, { icon: "wire-length" }],
  "kim-hoan": photos("kim-hoan", ["gold", "silver", "platinum", "copper", "gemstone", "wax"]),
  "dieu-khac-da": photos("dieu-khac-da",
    ["natural-stone", "marble", "granite", "artificial-stone", "stone-composite"]),
  "cat-da": photos("cat-da",
    ["natural-stone", "granite", "marble", "artificial-stone", "stone-composite"]),
  "dieu-khac-go": photos("dieu-khac-go",
    ["natural-wood", "hardwood", "softwood", "engineered-wood", "industrial-wood"]),
};
const CONTROL_MEDIA: Record<string, Media[]> = {
  "cua-long": [{ icon: "motion" }, { icon: "cutting" }, { icon: "performance" }, { icon: "gcode" }, { icon: "io" }],
  "mong-go": [{ icon: "multi-axis" }, { icon: "gcode" }, { icon: "productivity" }, { icon: "io" }, { icon: "stability" }],
  "dan-keo": [{ icon: "multi-axis" }, { icon: "dispensing" }, { icon: "gcode" }, { icon: "dnc" }, { icon: "io" },
              { icon: "stability" }],
  "uon-lo-xo": [{ icon: "multi-axis" }, { icon: "gcode" }, { icon: "coil" }, { icon: "io" }, { icon: "stability" }],
  "kim-hoan": [{ icon: "multi-axis" }, { icon: "surface-3d" }, { icon: "milling" }, { icon: "dnc" }, { icon: "stability" }],
  "dieu-khac-da": [{ icon: "multi-axis" }, { icon: "surface-3d" }, { icon: "gcode" }, { icon: "performance" },
                   { icon: "io" }, { icon: "stability" }],
  "cat-da": [{ icon: "multi-axis" }, { icon: "motion" }, { icon: "gcode" }, { icon: "performance" },
             { icon: "io" }, { icon: "stability" }],
  "dieu-khac-go": [{ icon: "multi-axis" }, { icon: "surface-3d" }, { icon: "gcode" }, { icon: "performance" },
                   { icon: "io" }, { icon: "stability" }],
};
const MACHINE_PART_MEDIA: Record<string, Media[]> = {
  "cua-long": [{ icon: "motion" }, { icon: "cutting" }],
  "mong-go": [{ icon: "drill-tap" }, { icon: "milling" }, { icon: "motion" }, { icon: "controllers" }],
  "dan-keo": [{ icon: "dispensing" }, { icon: "pump" }, { icon: "motion" }, { icon: "controllers" }],
  "uon-lo-xo": [{ icon: "bending" }, { icon: "motion" }, { icon: "cutting" }, { icon: "machine" }, { icon: "controllers" }],
  "kim-hoan": [{ icon: "router" }, { icon: "multi-axis" }, { icon: "motion" }, { icon: "controllers" }],
  "dieu-khac-da": [{ icon: "router" }, { icon: "carving" }, { icon: "machine" }, { icon: "motion" },
                   { icon: "controllers" }],
  "cat-da": [{ icon: "router" }, { icon: "cutting" }, { icon: "machine" }, { icon: "motion" }, { icon: "pump" },
             { icon: "controllers" }],
  "dieu-khac-go": [{ icon: "router" }, { icon: "carving" }, { icon: "machine" }, { icon: "motion" },
                   { icon: "controllers" }],
};
const BENEFIT_MEDIA: Record<string, Media[]> = {
  "cua-long": [{ icon: "precision" }, { icon: "usability" }, { icon: "productivity" }, { icon: "gcode" }, { icon: "flexible-config" }],
  "mong-go": [{ icon: "precision" }, { icon: "productivity" }, { icon: "usability" }, { icon: "cost" },
              { icon: "flexible-config" }, { icon: "stability" }],
  "dan-keo": [{ icon: "precision" }, { icon: "productivity" }, { icon: "cost" }, { icon: "usability" },
              { icon: "flexible-config" }, { icon: "stability" }],
  "uon-lo-xo": [{ icon: "precision" }, { icon: "productivity" }, { icon: "cost" }, { icon: "usability" },
                { icon: "flexible-config" }, { icon: "stability" }],
  "kim-hoan": [{ icon: "precision" }, { icon: "jewelry" }, { icon: "productivity" }, { icon: "usability" },
               { icon: "flexible-config" }, { icon: "stability" }],
  "dieu-khac-da": [{ icon: "precision" }, { icon: "carving" }, { icon: "usability" }, { icon: "productivity" },
                   { icon: "flexible-config" }, { icon: "stability" }],
  "cat-da": [{ icon: "precision" }, { icon: "cutting" }, { icon: "usability" }, { icon: "productivity" },
             { icon: "flexible-config" }, { icon: "stability" }],
  "dieu-khac-go": [{ icon: "precision" }, { icon: "carving" }, { icon: "usability" }, { icon: "productivity" },
                   { icon: "flexible-config" }, { icon: "stability" }],
};
/** Finished parts photographed on the reference sheet — decoration, so no captions. */
const GALLERY_IMAGES: Record<string, string[]> = {
  "cua-long": ["horse", "mandala", "lettering", "flower-panel", "gears", "dino"]
    .map((name) => `/img/applications/cua-long/product-${name}.webp`),
  "kim-hoan": ["ring-solitaire", "pendant-wheel", "band", "buddha", "earrings"]
    .map((name) => `/img/applications/kim-hoan/product-${name}.webp`),
};

/** Five capabilities fill one row and six split evenly in threes; every other
 *  count reads best in fours. Cards carry their own rules rather than showing
 *  through a gap, so a part-filled last row ends in blank space instead of an
 *  empty tinted cell. */
const capabilityColumns = (count: number) =>
  count === 5 ? "lg:grid-cols-5" : count === 6 ? "lg:grid-cols-3" : "lg:grid-cols-4";

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
    {
      heroLede: string;
      tagline?: string;
      strengths?: CopyItem[];
      control?: { heading?: string; items: CopyItem[] };
      machineParts?: { heading?: string; items: CopyItem[] };
      capabilityHeading?: string;
      capabilities?: CopyItem[];
      industries?: { heading?: string; items: string[] };
      compat?: { heading?: string; lede?: string; items: CopyItem[] };
      /** The third checklist some sheets print beside the compatibility grid —
       *  machine types for one machine, controller advantages for another. */
      highlights?: { heading: string; items: string[] };
      benefits?: { heading?: string; items: CopyItem[] };
      closing?: string;
    }
  >;
  const machine_ = machines?.[slug];
  const heroLede = machine_?.heroLede ?? t("heroLede");
  const strengths = machine_?.strengths ?? [];
  const strengthMedia = STRENGTH_MEDIA[slug] ?? [];
  const capabilities = machine_?.capabilities ?? [];
  const capabilityMedia = CAPABILITY_MEDIA[slug] ?? [];
  const capColumns = capabilityColumns(capabilities.length);
  const control = machine_?.control;
  const machineParts = machine_?.machineParts;
  const industries = machine_?.industries;
  const compat = machine_?.compat;
  const compatMedia = COMPAT_MEDIA[slug] ?? [];
  const highlights = machine_?.highlights;
  const benefits = machine_?.benefits;
  const benefitMedia = BENEFIT_MEDIA[slug] ?? [];
  const gallery = GALLERY_IMAGES[slug] ?? [];
  const relatedApps = relatedAppsMeta.map((r) => ({ ...r, t: machineFor(r.slug) }));
  const appData = await getApplicationBySlug(slug, locale);
  const relatedProducts = getApplicationProducts(slug, locale);
  const techArticleJsonLd = appData ? buildTechArticle(appData, locale) : null;
  const breadcrumb = buildTrail(locale, t("breadcrumb.home"), [
    { name: t("breadcrumb.applications"), path: "/applications" },
    { name: machine, path: `/applications/${slug}` },
  ]);

  return (
    <div className="qs-detail-type">
      {techArticleJsonLd && <JsonLd data={techArticleJsonLd} />}
      <JsonLd data={breadcrumb} />
      {/* DARK HERO */}
      <section className="relative overflow-hidden bg-ink text-[#cfc9b8] border-b border-[#2a2620]">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.15]" aria-hidden="true"></div>
        {/* breathing gold atmosphere behind the detail plate */}
        <div className="qs-glow hidden sm:block right-[4%] top-[-25%] w-[34%] h-[150%]" aria-hidden="true"></div>
        <div className="relative max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 pt-12 pb-16">
          <div className="qs-crumb qs-crumb-dark mb-8 text-[#a8a499]">
            <Link href="/">{t("breadcrumb.home")}</Link><span className="sep">/</span>
            <Link href="/applications">{t("breadcrumb.applications")}</Link><span className="sep">/</span>
            <span className="here text-gold-2! capitalize">{machine}</span>
          </div>
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-end">
            <div className="order-2 md:order-1">
              <span className="inline-block qs-rise font-mono text-label text-gold-2 tracking-[.16em] uppercase" style={{ animationDelay: "0ms" }}>{t("appLabel", { idx: String(idx).padStart(2, "0") })}</span>
              <h1 className="qs-rise font-display font-bold tracking-[-.02em] text-white mt-3.5"
                  style={{fontSize:"clamp(40px,9vw,72px)", lineHeight:".95", animationDelay: "80ms"}}>
                {t("heroLine1")}<br/>{t("heroForPrefix")} {machine.toLowerCase()}
              </h1>
              {machine_?.tagline && (
                <p className="qs-rise mt-5 inline-block border-l-2 border-gold pl-3 font-display font-semibold text-body text-gold-2 m-0"
                   style={{ animationDelay: "140ms" }}>
                  {machine_.tagline}
                </p>
              )}
              <p className="qs-rise mt-6 text-title leading-[1.6] text-[#a8a499] max-w-[55ch] sm:text-justify" style={{ animationDelay: "180ms" }}>
                {heroLede}
              </p>
            </div>
            {/* Square plate rather than the taller portrait it used to be: the
                shop-floor stills are landscape, so a shorter frame crops less of
                the machine away and keeps the hero from pushing the copy down. */}
            <div className="qs-rise relative order-1 aspect-square border overflow-hidden md:order-2"
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

      {/* CONTROLLER STRENGTHS — reads straight off the hero lede, so it stays
          headingless and acts as the band between hero and the detail sections. */}
      {strengths.length > 0 && (
        <section className="bg-paper border-b border-line py-10 sm:py-12">
          <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {strengths.map((s, i) => (
                <Reveal key={s.t} delay={i * 70}>
                  <CategoryIcon name={strengthMedia[i]?.icon ?? ""} className="w-9 h-9 text-gold-1" />
                  <h3 className="font-display font-bold text-title tracking-[-.01em] mt-4 mb-1.5 m-0">{s.t}</h3>
                  <p className="text-meta text-muted leading-[1.6] m-0">{s.d}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTROL CENTRE — what the controller drives, and the machine it drives */}
      {control && (
        <section className="py-8 sm:py-10 lg:py-14 bg-white border-b border-line">
          <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
            <div className="mb-10 pb-4 border-b border-line">
              <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">{t("controlEyebrow")}</span>
              <h2 className="qs-h2 mt-1.5">{control.heading ?? t("controlHeading")}</h2>
            </div>
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-start">
              <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
                {control.items.map((c, i) => (
                  <Reveal key={c.t} delay={i * 70}>
                    <CategoryIcon name={CONTROL_MEDIA[slug]?.[i]?.icon ?? ""} className="w-8 h-8 text-gold-1" />
                    <h3 className="font-display font-bold text-title tracking-[-.01em] mt-3 mb-1.5 m-0">{c.t}</h3>
                    <p className="text-meta text-muted leading-[1.6] m-0">{c.d}</p>
                  </Reveal>
                ))}
              </div>
              {machineParts && (
                <div className="bg-paper border border-line p-7">
                  <h3 className="font-mono text-label text-gold-1 tracking-[.14em] uppercase m-0">
                    {machineParts.heading}
                  </h3>
                  <dl className="mt-5 m-0">
                    {machineParts.items.map((p, i) => (
                      <div key={p.t} className={`flex gap-3.5 py-3.5 ${i > 0 ? "border-t border-line" : ""}`}>
                        <CategoryIcon name={MACHINE_PART_MEDIA[slug]?.[i]?.icon ?? ""}
                                      className="w-5 h-5 text-gold-1 shrink-0 mt-0.5" />
                        <div>
                          <dt className="font-display font-semibold text-body leading-[1.3]">{p.t}</dt>
                          <dd className="text-meta text-muted leading-[1.55] m-0 mt-1">{p.d}</dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CAPABILITIES */}
      {capabilities.length > 0 && (
        <section className="py-8 sm:py-10 lg:py-14 bg-white border-b border-line">
          <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
            <div className="mb-10 pb-4 border-b border-line">
              <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">{t("capabilityEyebrow")}</span>
              <h2 className="qs-h2 mt-1.5">{machine_?.capabilityHeading ?? t("capabilityHeading")}</h2>
            </div>
            <div className={`grid grid-cols-2 ${capColumns}`}>
              {capabilities.map((c, i) => (
                /* Cards own a full rule and overlap by a pixel, so a part-filled
                   last row ends in blank space instead of a dangling line. */
                <Reveal key={c.t} className="flex -ml-px -mt-px" delay={i * 70}>
                  <div className="w-full bg-white p-6 flex flex-col relative border border-line
                                  before:content-[''] before:absolute before:top-0 before:left-6 before:w-8 before:h-0.5 before:bg-gold">
                    {/* 10:9 matches the source frame, so the photo shows whole */}
                    {capabilityMedia[i]?.image ? (
                      <div className="relative aspect-10/9 mt-2 border border-line overflow-hidden bg-white">
                        <Image src={capabilityMedia[i].image!} alt={c.t} fill
                               sizes="(max-width:1024px) 45vw, 20vw"
                               className={capabilityMedia[i].contain ? "object-contain p-2" : "object-cover"} />
                      </div>
                    ) : (
                      <CategoryIcon name={capabilityMedia[i]?.icon ?? ""} className="w-8 h-8 text-gold-1 mt-2" />
                    )}
                    <h3 className="font-display font-bold text-title tracking-[-.01em] mt-4 m-0 leading-[1.2]">{c.t}</h3>
                    {c.d && <p className="text-meta text-muted leading-[1.6] mt-2 m-0">{c.d}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MACHINING COMPATIBILITY */}
      {compat && (
        <section className="py-8 sm:py-10 lg:py-14 bg-paper border-b border-line">
          <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 items-start">
            <div>
              <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">{t("compatEyebrow")}</span>
              <h2 className="qs-h2 mt-1.5 max-w-[20ch]">{compat.heading ?? t("compatHeading")}</h2>
              {compat.lede && <p className="text-body leading-[1.75] text-[#3a3a3a] mt-5 m-0">{compat.lede}</p>}
              {industries && (
                <div className="mt-7">
                  <h3 className="font-mono text-label text-gold-1 tracking-[.14em] uppercase m-0">
                    {industries.heading ?? t("industriesHeading")}
                  </h3>
                  <ul className="mt-4 m-0 p-0 list-none grid gap-2.5">
                    {industries.items.map((item) => (
                      <li key={item} className="flex gap-3 text-body leading-[1.5] text-[#3a3a3a]">
                        <span aria-hidden className="text-gold-1 font-mono">+</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div>
              <div className="grid grid-cols-2 gap-px bg-line border border-line">
                {compat.items.map((c, i) => (
                  <Reveal key={c.t} className="flex" delay={i * 70}>
                    <div className="w-full bg-white px-6 py-7 flex flex-col items-start gap-3">
                      {compatMedia[i]?.image ? (
                        /* Material swatch: sized like the glyph it replaces so both
                           variants of this block keep the same rhythm. */
                        <Image src={compatMedia[i].image!} alt={c.t} width={80} height={80}
                               className="w-20 h-20 object-contain" />
                      ) : (
                        <CategoryIcon name={compatMedia[i]?.icon ?? ""} className="w-8 h-8 text-gold-1" />
                      )}
                      <h3 className="font-display font-bold text-body tracking-[-.01em] m-0 leading-[1.25]">{c.t}</h3>
                      {c.d && <p className="font-mono text-label-xs text-muted tracking-[.08em] uppercase m-0 leading-[1.5]">{c.d}</p>}
                    </div>
                  </Reveal>
                ))}
              </div>
              {highlights && (
                <div className="mt-6 bg-white border border-line p-7">
                  <h3 className="font-mono text-label text-gold-1 tracking-[.14em] uppercase m-0">{highlights.heading}</h3>
                  <ul className="mt-4 m-0 p-0 list-none grid sm:grid-cols-2 gap-x-7 gap-y-2.5">
                    {highlights.items.map((item) => (
                      <li key={item} className="flex gap-3 text-meta leading-[1.55] text-[#3a3a3a]">
                        <span aria-hidden className="text-gold-1 font-mono">✓</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* BENEFITS */}
      {benefits && (
        <section className="py-8 sm:py-10 lg:py-14 bg-white border-b border-line">
          <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
            <div className="mb-10 pb-4 border-b border-line">
              <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">{t("benefitEyebrow")}</span>
              <h2 className="qs-h2 mt-1.5">{benefits.heading ?? t("benefitHeading")}</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-9">
              {benefits.items.map((b, i) => (
                <Reveal key={b.t} delay={i * 70}>
                  <CategoryIcon name={benefitMedia[i]?.icon ?? ""} className="w-8 h-8 text-gold-1" />
                  <h3 className="font-display font-bold text-title tracking-[-.01em] mt-3 mb-1.5 m-0">{b.t}</h3>
                  <p className="text-meta text-muted leading-[1.6] m-0">{b.d}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FINISHED PARTS */}
      {gallery.length > 0 && (
        <section className="py-8 sm:py-10 lg:py-14 bg-paper border-b border-line">
          <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
            <div className="mb-10 pb-4 border-b border-line">
              <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">{t("galleryEyebrow")}</span>
              <h2 className="qs-h2 mt-1.5">{t("galleryHeading")}</h2>
            </div>
            {/* One row wide, however many parts the sheet photographed. */}
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 ${
              gallery.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-6"}`}>
              {gallery.map((src, i) => (
                <Reveal key={src} delay={i * 60}>
                  <div className="relative aspect-square border border-line overflow-hidden bg-white">
                    <Image src={src} alt="" fill sizes="(max-width:1024px) 45vw, 16vw" className="object-cover" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VIDEO — the machine running on the shop floor, only for the machine types
          that have a clip. paper-2 because the block above it varies (white benefits,
          or the paper finished-parts gallery) — the third tone reads as its own band
          either way, and the white products below keep it off the paper-2 closing CTA. */}
      {appData?.video && (
        <section className="py-8 sm:py-10 lg:py-14 bg-paper-2 border-b border-line">
          <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
            <div className="max-w-[900px] mx-auto text-center">
              <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">{t("videoEyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("videoHeading", { machine })}</h2>
            </div>
            <div className="max-w-[900px] mx-auto mt-8">
              <ProductVideo
                youtubeId={appData.video.youtubeId}
                hd={appData.video.hd}
                title={t("videoHeading", { machine })}
                playLabel={t("videoPlay")}
              />
            </div>
          </div>
        </section>
      )}

      {/* MATCHING PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="py-8 sm:py-10 lg:py-14 bg-white border-b border-line">
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
                            md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible">
              {relatedProducts.map((p, i) => (
                <Reveal key={p.slug} className="qs-reveal-desktop flex items-stretch w-full shrink-0 snap-start md:w-auto -ml-px -mt-px" delay={i * 70}>
                <Link
                  href={`/electronics/${p.slug}`}
                  className="group w-full bg-white p-6 flex flex-col hover:bg-paper transition-colors relative
                             border border-line
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
      <ContactCta
        bordered
        eyebrow={machine_?.closing}
        heading={t("ctaHeading", { machine })}
        body={t("ctaBody")}
        ctaLabel={t("ctaBtn")}
      />
    </div>
  );
}
