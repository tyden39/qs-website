import { Fragment } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProductBySlug, getProductSlugs, type ProductView } from "@/lib/data/products";
import { getProductDownloads, groupByDocument, formatBytes, type DownloadFile } from "@/lib/data/downloads";
import { KitComponentIcon } from "@/components/products/kit-component-icon";
import CircuitTraces from "@/components/circuit-traces";
import { ProductDetailTabs, type ProductDetailTab } from "../_components/product-detail-tabs";
import { ProductHeroGallery, type HeroShot } from "../_components/product-hero-gallery";
import { ProductVideo } from "../_components/product-video";
import { LightboxProvider, LightboxTrigger, type LightboxShot } from "@/components/products/product-image-lightbox";
import { routing } from "@/lib/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildProduct, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProductBySlug(slug, locale);
  if (!p) return {};
  return {
    title: p.name,
    description: p.desc?.slice(0, 160),
    alternates: buildAlternates(`/products/${slug}`, locale),
    openGraph: {
      title: p.name,
      description: p.desc,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: `/products/${slug}`,
      images: [
        {
          url: p.images?.[0]?.url ?? "/og-default.png",
          width: 1200,
          height: 630,
          alt: p.images?.[0]?.alt ?? p.name,
        },
      ],
    },
    twitter: { card: "summary_large_image", title: p.name, description: p.desc },
  };
}

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

function safeHtml(raw: string): string {
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "b", "u", "ul", "ol", "li", "h2", "h3", "h4", "a", "blockquote"],
    ALLOWED_ATTR: ["href", "title", "rel", "target"],
  });
}

function findSpec(p: ProductView, needles: string[]): string | null {
  const normalizedNeedles = needles.map((n) => n.toLowerCase());
  for (const section of p.specSheet.sections) {
    for (const row of section.rows) {
      const label = row.l.toLowerCase();
      if (normalizedNeedles.some((n) => label.includes(n))) {
        return Array.isArray(row.v) ? row.v.join(" · ") : row.v;
      }
    }
  }
  for (const row of p.specs) {
    const label = row.l.toLowerCase();
    if (normalizedNeedles.some((n) => label.includes(n))) {
      return Array.isArray(row.v) ? row.v.join(" · ") : row.v;
    }
  }
  return null;
}

// Values that carry a status meaning rather than a measurement get a glyph:
// supported → gold tick, unavailable → muted dash, option → outlined chip.
const SUPPORTED = new Set(["Có hỗ trợ", "Supported"]);

function SpecValue({ value }: { value: string }) {
  if (value === "—") {
    return <span className="text-muted/60 select-none" aria-hidden="true">—</span>;
  }
  if (value === "Option") {
    return (
      <span className="inline-flex items-center font-mono text-[9.5px] tracking-[.14em] uppercase text-gold-1 border border-gold-1/40 px-2 py-0.5">
        {value}
      </span>
    );
  }
  if (SUPPORTED.has(value)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink">
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-gold-1 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path d="M3 8.5l3.2 3.2L13 4.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {value}
      </span>
    );
  }
  return <span className="text-[13.5px] font-semibold tracking-[-.005em] text-ink tabular-nums">{value}</span>;
}

// Blueprint-style datasheet: parameter rows on the left, one column per control
// protocol on the right. A value shared across every protocol spans the whole
// value area; differing values sit in their own protocol column.
function SpecDatasheet({ model, sheet }: { model: string; sheet: ProductView["specSheet"] }) {
  const cols = sheet.cols;
  const n = Math.max(cols.length, 1);
  const template = `minmax(132px,1.1fr) repeat(${n}, minmax(0,1fr))`;
  return (
    <div className="overflow-x-auto border border-line">
      <div className="grid gap-px bg-line" style={{ gridTemplateColumns: template, minWidth: 132 + n * 150 }}>
        <div className="bg-[#11120f] px-4 py-3.5 flex items-end">
          <span className="font-display text-[15px] font-bold tracking-[-.01em] text-white">{model}</span>
        </div>
        {cols.map((c) => (
          <div key={c.name} className="bg-[#11120f] px-4 py-3">
            <div className="font-mono text-[11.5px] tracking-[.04em] text-gold-2 leading-tight">{c.name}</div>
            <div className="font-mono text-[9px] tracking-[.14em] uppercase text-[#8f8878] mt-1">{c.loop}</div>
          </div>
        ))}

        {sheet.sections.map((section) => (
          <Fragment key={section.title}>
            <div style={{ gridColumn: "1 / -1" }} className="bg-paper px-4 py-2.5 flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-[.16em] uppercase text-ink">{section.title}</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            {section.rows.map((row) => (
              <Fragment key={section.title + row.l}>
                <div className="bg-white px-4 py-3 flex items-center font-mono text-[10.5px] leading-snug tracking-[.03em] uppercase text-muted">
                  {row.l}
                </div>
                {Array.isArray(row.v) ? (
                  row.v.map((val, i) => (
                    <div key={i} className="bg-white px-4 py-3 flex items-center">
                      <SpecValue value={val} />
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: "2 / -1" }} className="bg-white px-4 py-3 flex items-center">
                    <SpecValue value={row.v} />
                  </div>
                )}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// A photo's `place` pins it: "hero" (the lead gallery up top), "tour" (the
// "product in detail" grid), or "hide". When unset, the first 4 shots make up
// the hero gallery and the rest drop into the tour, each tagged by what its
// alt describes (the gallery item's `kind`, classified in the data layer).
export default async function ProductDetail({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "product.detailPage" });
  const tDl = await getTranslations({ locale, namespace: "downloads.index" });
  const p = await getProductBySlug(slug, locale);
  if (!p) notFound();

  const productJsonLd = buildProduct(p, locale);
  const tabLabels = t.raw("tabs") as string[];
  // Hero value-prop cards: fixed titles, descriptions filled from this model's
  // real catalogue data (axis count, actual control interfaces, display size).
  const featureText = [
    { t: t("features.perf.t"), d: t("features.perf.d", { axes: p.axes }) },
    { t: t("features.io.t"), d: t("features.io.d", { interfaces: p.interfaces.map((i) => i.name).join(", ") }) },
    { t: t("features.custom.t"), d: t("features.custom.d", { display: p.display }) },
  ];
  // Pinned `place: "hero"` photos take over the gallery when present; otherwise
  // the first 4 visible shots (skipping any pinned to "tour") lead. Everything
  // left over drops into the tour. `hide` drops a photo entirely.
  const visible = p.gallery.filter((g) => g.place !== "hide");
  const pinnedHero = visible.filter((g) => g.place === "hero");
  const heroShots: HeroShot[] =
    pinnedHero.length > 0 ? pinnedHero : visible.filter((g) => g.place !== "tour").slice(0, 4);
  const heroSrcs = new Set(heroShots.map((g) => g.src));
  // Hero carousel shots: when studio renders exist, show them front / rear /
  // on-machine in that fixed order; each one feeds the gallery in sequence.
  const heroStudioShots: HeroShot[] | null = p.heroTriptych
    ? (["front", "rear", "machine"] as const).map((kind) => ({
        src: p.heroTriptych![kind].src,
        w: p.heroTriptych![kind].w,
        h: p.heroTriptych![kind].h,
        alt: `${p.name} — ${t(`heroShots.${kind}`)}`,
      }))
    : null;
  const galleryShots: HeroShot[] =
    heroStudioShots ??
    (heroShots.length > 0 ? heroShots : [{ src: p.image.src, w: p.image.w, h: p.image.h, alt: p.tag }]);
  const annotated = visible
    .filter((g) => !heroSrcs.has(g.src))
    // Wiring / connection diagrams aren't part of the photo tour.
    .filter((g) => g.kind !== "wiring")
    .map((g, i) => ({ img: g, kind: g.kind, index: i }));
  const tourShots: LightboxShot[] = annotated.map((x) => x.img);
  // Photo tour split into the same three sections for every model — real product
  // photos, operating-interface screens, and the controller installed on a real
  // machine — keyed off what each shot depicts rather than its position, so a
  // section shows whatever photos exist for it however many that is. `index` is
  // the absolute position in `tourShots` so the lightbox keeps one flat sequence.
  const tourSection = (kind: string): "real" | "ui" | "machine" =>
    kind === "ui" ? "ui" : kind === "application" ? "machine" : "real";
  const tourGroups = (["real", "ui", "machine"] as const)
    .map((id) => ({ id, shots: annotated.filter((x) => tourSection(x.kind) === id) }))
    .filter((g) => g.shots.length > 0);
  const bundlePhotos = p.bundle.map((c) => c.photo ?? (c.icon === "controller" ? p.image : null));
  let bundleSeen = 0;
  const bundleShotIndex = bundlePhotos.map((ph) => (ph ? bundleSeen++ : -1));
  const bundleShots: LightboxShot[] = bundlePhotos
    .map((ph, i) => (ph ? { src: ph.src, w: ph.w, h: ph.h, alt: p.bundle[i].label } : null))
    .filter((x): x is LightboxShot => x !== null);
  const lightboxLabels = { prev: t("lightbox.prev"), next: t("lightbox.next"), close: t("lightbox.close") };
  const overviewHtml = p.overview ?? `<p>${p.desc}</p>`;
  const multiProtocol = p.specSheet.cols.length > 1;
  const heroStats = [
    { l: t("factAxes"), v: p.axes },
    { l: t("factDisplay"), v: p.display },
    { l: "I/O", v: findSpec(p, ["standard i/o", "i/o ports"]) ?? "—" },
    { l: "Look-Ahead", v: findSpec(p, ["look-ahead"]) ?? "—" },
  ];

  const productDownloads = getProductDownloads(slug);
  const docGroups = groupByDocument(productDownloads.filter((d) => d.category !== "software"));
  const softwareGroups = groupByDocument(productDownloads.filter((d) => d.category === "software"));
  const hasDownloads = productDownloads.length > 0;
  const downloadTitle = (d: DownloadFile): string => {
    if (d.titleKey) return tDl(`titles.${d.titleKey}`);
    if (d.category === "operation" || d.category === "installation") return `${d.model} — ${tDl(`docType.${d.category}`)}`;
    return d.model ?? "";
  };

  const overviewPanel = (
    <section className="relative overflow-hidden bg-[#f7f5ef] py-16 lg:py-20">
      <CircuitTraces
        variant="light"
        className="hidden md:block absolute top-0 right-0 w-[44%] h-[72%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_top_right,#000_22%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_right,#000_22%,transparent_70%)]"
      />
      <div className="relative qs-wrap-wide">
        <div className="grid lg:grid-cols-[minmax(0,760px)_minmax(0,1fr)] gap-x-16 gap-y-10 items-center">
          <div className="min-w-0">
            <header className="max-w-[820px]">
              <span className="qs-eyebrow">{t("overviewEyebrow")}</span>
              <h2 className="qs-h2 mt-3">{t("overviewHeading")}</h2>
            </header>
            <div
              className="prose prose-sm max-w-[70ch] mt-8 prose-p:text-[16.5px] prose-p:leading-[1.9] prose-p:text-[#2f2c26] prose-p:my-5"
              dangerouslySetInnerHTML={{ __html: safeHtml(overviewHtml) }}
            />
          </div>

          <aside className="min-w-0 grid">
            {galleryShots[0] ? (
              <div className="relative min-h-[420px] lg:min-h-[480px] grid place-items-center p-6 overflow-hidden">
                <div className="absolute inset-0 qs-dot-bg qs-dot-drift opacity-70" aria-hidden="true" />
                <span className="qs-glow left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
                <Image
                  src={galleryShots[0].src}
                  alt={galleryShots[0].alt ?? p.name}
                  width={galleryShots[0].w}
                  height={galleryShots[0].h}
                  sizes="(max-width: 1024px) 92vw, 560px"
                  className="qs-float relative w-auto max-h-[400px] lg:max-h-[460px] max-w-full object-contain drop-shadow-[0_22px_44px_rgba(0,0,0,.2)]"
                />
              </div>
            ) : (
              <div className="relative min-h-[240px] grid place-items-center p-6 overflow-hidden border border-dashed border-line bg-white">
                <div className="absolute inset-0 qs-grid-bg opacity-30" />
                <span className="relative font-mono text-[11px] tracking-[.16em] uppercase text-muted">{t("overviewPhotoComingSoon")}</span>
              </div>
            )}
          </aside>
        </div>

        {annotated.length > 0 && (
          <div className="mt-14">
            <div className="flex items-end justify-between gap-4 border-b border-line pb-3 mb-8">
              <div>
                <span className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">{t("tourEyebrow")}</span>
                <h3 className="font-display text-xl sm:text-2xl font-semibold tracking-[-.015em] text-ink mt-1.5 mb-0">{t("tourHeading")}</h3>
              </div>
              <span className="font-mono text-[10px] text-muted tracking-[.14em] shrink-0">{String(annotated.length).padStart(2, "0")} / {String(p.gallery.length).padStart(2, "0")}</span>
            </div>
            <div className="flex flex-col gap-10">
              {tourGroups.map((group) => (
                <div key={group.id}>
                  <div className="flex items-baseline gap-4 mb-5">
                    <span className="font-mono text-[13px] sm:text-sm text-gold-1 tracking-[.16em] uppercase">{t(`tourGroups.${group.id}.tag`)}</span>
                    <span className="text-[15px] leading-[1.5] text-muted hidden sm:block">{t(`tourGroups.${group.id}.desc`)}</span>
                    <span className="h-px flex-1 bg-line self-center" />
                    <span className="font-mono text-[10px] text-muted tracking-[.14em] shrink-0">{String(group.shots.length).padStart(2, "0")}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
                    {group.shots.map(({ img, index }) => (
                      <figure key={img.src} className="m-0 bg-white flex flex-col">
                        <LightboxTrigger group={tourShots} index={index} ariaLabel={t("lightbox.zoom")} className="relative min-h-[240px] grid place-items-center p-6 overflow-hidden w-full">
                          <div className="absolute inset-0 qs-grid-bg opacity-30" />
                          <span className="absolute top-3 left-4 font-mono text-[10px] text-gold-1 tracking-[.16em]">{String(index + 1).padStart(2, "0")}</span>
                          <Image
                            src={img.src}
                            alt={img.alt}
                            width={img.w}
                            height={img.h}
                            loading="lazy"
                            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 380px"
                            className="relative w-auto max-h-[260px] max-w-full object-contain"
                          />
                        </LightboxTrigger>
                      </figure>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14">
          <div className="flex items-end justify-between gap-4 border-b border-line pb-3 mb-6">
            <div>
              <span className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">{t("videoEyebrow")}</span>
              <h3 className="font-display text-xl sm:text-2xl font-semibold tracking-[-.015em] text-ink mt-1.5 mb-0">{t("videoHeading")}</h3>
            </div>
          </div>
          <div className="max-w-[960px] mx-auto">
            {p.video ? (
              <ProductVideo youtubeId={p.video.youtubeId} title={p.video.title ?? p.name} playLabel={t("videoPlay")} />
            ) : (
              <div className="relative aspect-video border border-dashed border-line bg-white grid place-items-center overflow-hidden">
                <div className="absolute inset-0 qs-grid-bg opacity-30" />
                <span className="relative font-mono text-[11px] tracking-[.16em] uppercase text-muted">{t("videoComingSoon")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  const specsPanel = (
    <section className="relative overflow-hidden bg-[#f7f5ef] py-16 lg:py-20">
      <CircuitTraces
        variant="light"
        className="hidden md:block absolute top-0 right-0 w-[44%] h-[72%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_top_right,#000_22%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_right,#000_22%,transparent_70%)]"
      />
      <div className="relative qs-wrap-wide">
        <span className="qs-eyebrow">{t("specsEyebrow")}</span>
        <h2 className="qs-h2 mt-3">{t("specsHeading")}</h2>
        {multiProtocol && (
          <p className="text-[13.5px] leading-[1.6] text-muted max-w-[62ch] mt-3 mb-8">{t("specsHint")}</p>
        )}
        <div className={multiProtocol ? "" : "mt-8"}>
          <SpecDatasheet model={p.name} sheet={p.specSheet} />
        </div>
      </div>
    </section>
  );

  const downloadList = (heading: string, count: number, groups: ReturnType<typeof groupByDocument>) => (
    <div className="relative">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-3 mb-4">
        <h3 className="font-display text-lg sm:text-xl font-semibold tracking-[-.015em] text-ink m-0">{heading}</h3>
        <span className="font-mono text-[10px] text-muted tracking-[.14em] shrink-0">{String(count).padStart(2, "0")}</span>
      </div>
      <div className="border border-line bg-white">
        <div className="hidden md:grid grid-cols-[1fr_120px_minmax(200px,auto)] gap-4 px-5 py-3 bg-[#0e0e0c] text-[#cfc9b8] font-mono text-[10px] tracking-[.16em] uppercase">
          <span>{tDl("table.name")}</span>
          <span>{tDl("table.version")}</span>
          <span className="text-right">{tDl("table.download")}</span>
        </div>
        {groups.map((doc) => {
          const head = doc.variants[0];
          return (
            <div key={doc.key} className="grid grid-cols-1 md:grid-cols-[1fr_120px_minmax(200px,auto)] gap-x-4 gap-y-3 items-center px-5 py-4 border-t border-line hover:bg-paper transition-colors">
              <div className="flex items-center gap-4">
                <span className="w-10 h-[52px] flex-shrink-0 border border-line grid place-items-center font-display font-extrabold text-[10px] tracking-[-.02em] bg-white text-ink">
                  {head.ext}
                </span>
                <span className="font-semibold text-ink text-[14px] tracking-[-.005em] min-w-0">{downloadTitle(head)}</span>
              </div>
              <span className="font-mono text-[11px] text-muted md:text-[#3a3a3a]">
                {head.version ?? (head.date ? head.date.slice(0, 7).replace("-", "/") : "—")}
              </span>
              <div className="flex gap-2 md:justify-end">
                {doc.variants.map((v) => (
                  <a key={v.slug} href={v.fileUrl} download className="flex-1 md:flex-initial inline-flex flex-col items-center gap-0.5 whitespace-nowrap border border-ink bg-ink text-white px-4 py-2 hover:bg-gold-3 hover:border-gold-3 transition-colors">
                    <span className="font-mono text-[11px] tracking-[.14em] uppercase">{v.lang.toUpperCase()} ↓</span>
                    <span className="font-mono text-[9px] tracking-[.06em] opacity-60">{formatBytes(v.sizeBytes)}</span>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const resourcesPanel = (
    <section className="relative overflow-hidden py-16 bg-paper">
      <CircuitTraces
        variant="light"
        className="hidden md:block absolute top-0 right-0 w-[44%] h-[72%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_top_right,#000_22%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_right,#000_22%,transparent_70%)]"
      />
      <div className="qs-wrap-wide">
        <div className="qs-section-head">
          <div className="max-w-[62ch]">
            <span className="qs-eyebrow">{t("resourcesEyebrow")}</span>
            <h2 className="qs-h2 mt-2">{t("resourcesHeading")}</h2>
            <p className="text-[14px] text-muted leading-[1.7] mt-3 mb-0">{t("resourcesHint")}</p>
          </div>
          <Link href="/downloads" className="qs-btn qs-btn-ghost qs-btn-sm">{t("resourcesAllLink")}</Link>
        </div>

        <div className="grid gap-10 lg:gap-8 lg:grid-cols-2 items-start">
          {docGroups.length > 0 && downloadList(t("documentsHeading"), docGroups.length, docGroups)}
          {softwareGroups.length > 0 && downloadList(t("softwareHeading"), softwareGroups.length, softwareGroups)}
        </div>
      </div>
    </section>
  );

  const tabs: ProductDetailTab[] = [
    { id: "overview", label: tabLabels[0], content: overviewPanel },
    { id: "specs", label: tabLabels[1], content: specsPanel },
    ...(hasDownloads ? [{ id: "resources", label: tabLabels[2], content: resourcesPanel }] : []),
  ];

  return (
    <LightboxProvider labels={lightboxLabels}>
      <JsonLd data={productJsonLd} />
      <section className="relative overflow-hidden bg-[#10110f] text-white border-b border-[#28261f]">
        <div className="absolute inset-0 qs-grid-bg opacity-[.12]" />
        <div className="absolute -right-20 top-0 h-[420px] w-[420px] rounded-full bg-gold-2/10 blur-3xl" aria-hidden="true" />
        <div className="relative qs-wrap-wide pt-8 pb-14 lg:pt-10 lg:pb-16">
          <div className="qs-crumb mb-8 text-[#8f8878]">
            <Link href="/">{t("breadcrumb.home")}</Link><span className="sep">/</span>
            <Link href="/products">{t("breadcrumb.products")}</Link><span className="sep">/</span>
            <span className="here text-[#eee9d7]">{p.name}</span>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,.86fr)] gap-10 lg:gap-14 items-center">
            <div>
              <small className="block font-mono text-[11px] text-gold-2 tracking-[.18em] uppercase mb-4">{t("modelLine", { name: p.name })}</small>
              <h1 className="font-display font-bold tracking-[-.035em] leading-[.98] text-balance m-0 text-[clamp(44px,7vw,92px)]">
                {p.tag}
              </h1>
              <p className="mt-6 text-[17px] leading-[1.75] text-[#c9c2b3] max-w-[68ch]">{p.desc}</p>
              <div className="mt-8 grid sm:grid-cols-3 gap-px bg-white/10 border border-white/10 max-w-[820px]">
                {featureText.map((f, i) => (
                  <div key={f.t} className="bg-[#141510] p-4">
                    <div className="font-mono text-[10px] tracking-[.18em] text-gold-2/80">0{i + 1}</div>
                    <b className="block text-white font-semibold mt-2">{f.t}</b>
                    <span className="block text-[13px] leading-[1.55] text-[#9f9788] mt-1">{f.d}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="qs-btn qs-btn-gold" href="/contact">{t("quoteBtn")}</Link>
                {hasDownloads ? (
                  <a className="qs-btn border border-white/25 bg-transparent text-white hover:bg-white hover:text-ink" href="#resources">{t("resourcesAllLink")}</a>
                ) : (
                  <Link className="qs-btn border border-white/25 bg-transparent text-white hover:bg-white hover:text-ink" href="/downloads">{t("resourcesAllLink")}</Link>
                )}
              </div>
            </div>

            <ProductHeroGallery shots={galleryShots} name={p.name} calibrationLabel={t("calibrationLabel")} zoomLabel={t("lightbox.zoom")} />
          </div>

          <dl className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {heroStats.map((stat) => (
              <div key={stat.l} className="bg-[#141510] px-4 py-4 sm:px-5 sm:py-5">
                <dt className="font-mono text-[10px] tracking-[.16em] uppercase text-[#837b6c]">{stat.l}</dt>
                <dd className="m-0 mt-2 font-display text-[22px] font-semibold tracking-[-.02em] text-white">{stat.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <ProductDetailTabs tabs={tabs} />

      <section className="py-16 lg:py-20 bg-white">
        <div className="qs-wrap-wide">
          <div className="qs-section-head">
            <div>
              <span className="qs-eyebrow">{t("packageEyebrow", { name: p.name })}</span>
              <h2 className="qs-h2 mt-2">{t("packageHeading")}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-line border border-line">
            {p.bundle.map((c, i) => {
              const photo = c.photo ?? (c.icon === "controller" ? p.image : null);
              return (
                <div key={c.label} className="bg-white p-5 sm:p-6 flex flex-col gap-3 min-h-[238px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] text-gold-1 tracking-[.16em]">[ {String(i + 1).padStart(2, "0")} ]</span>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                  <div className="bg-paper border border-line grid place-items-center p-4 h-[150px]">
                    {photo ? (
                      <LightboxTrigger group={bundleShots} index={bundleShotIndex[i]} ariaLabel={t("lightbox.zoom")} className="grid h-full w-full place-items-center">
                        <Image src={photo.src} alt={c.label} width={photo.w} height={photo.h} sizes="160px" className="max-h-[118px] w-auto max-w-full object-contain" />
                      </LightboxTrigger>
                    ) : (
                      <KitComponentIcon type={c.icon} className="h-3/4 w-auto" />
                    )}
                  </div>
                  <div className="font-display font-semibold text-[15px] text-ink leading-[1.35]">{c.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-18 lg:py-20 bg-white border-t border-line">
        <div className="qs-wrap-wide">
          <div className="bg-[#11120f] text-[#cfc9b8] p-7 sm:p-10 lg:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center border border-[#28261f]">
            <div>
              <h3 className="font-display font-bold text-3xl text-white tracking-[-.01em] m-0">{t("ctaHeading", { name: p.name })}</h3>
              <p className="text-[#a8a499] mt-2 max-w-[60ch] m-0 text-[15px] leading-relaxed">{t("ctaBody")}</p>
            </div>
            <Link className="qs-btn qs-btn-gold" href="/contact">{t("ctaBtn")}</Link>
          </div>
        </div>
      </section>
    </LightboxProvider>
  );
}
