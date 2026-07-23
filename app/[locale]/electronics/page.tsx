import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getAllProducts, CONTROLLER_TYPES } from "@/lib/data/products";
import { ProductBundleCard } from "@/components/products/product-bundle-card";
import { ProductListFilter, type ProductFilterItem } from "./_components/product-list-filter";
import { ProductCategoryTree, type CategoryTreeChild } from "./_components/product-category-tree";
import { CatalogList } from "./_components/catalog-list";
import { SeriesList } from "./_components/series-list";
import { getCatalogProducts } from "@/lib/data/catalog";
import { getSeries, type SeriesCategory } from "@/lib/data/series";
import CircuitTraces from "@/components/circuit-traces";
import Reveal from "@/components/reveal";
import { FilterPrePaint } from "@/lib/filter-prepaint";
import { FilterPrePaintCleanup } from "@/lib/use-filter-params";
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
  const title = t("productsTitle");
  const description = t("productsDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/electronics", locale),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/electronics",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Static fallbacks for the drive-line tab thumbnails, matching the series
 *  renders used on the category pages, in case a data pass ever leaves the
 *  lead series without art. */
const SERIES_THUMB_FALLBACK: Record<SeriesCategory, { src: string; w: number; h: number }> = {
  servo: { src: "/img/products/series/sdv3.webp", w: 300, h: 225 },
  inverter: { src: "/img/products/series/s3100.webp", w: 300, h: 225 },
};

export default async function Products({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "product.page" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  const products = await getAllProducts(locale);
  const features = t.raw("features") as string[];
  // Only the distinctive product-type term shimmers gold; the generic prefix
  // ("Bộ", …) stays ink. `headingGold` names that term and is matched as a
  // contiguous slice of `heading`. Falls back to the whole heading.
  const heading = t("heading");
  const goldTerm = t("headingGold");
  const goldAt = heading.indexOf(goldTerm);
  const headingLead = goldAt >= 0 ? heading.slice(0, goldAt) : "";
  const headingGold = goldAt >= 0 ? heading.slice(goldAt, goldAt + goldTerm.length) : heading;
  const headingTail = goldAt >= 0 ? heading.slice(goldAt + goldTerm.length) : "";
  // Filter metadata derived from product data; the async card is pre-rendered
  // on the server and handed to the client filter as an opaque node.
  const items: ProductFilterItem[] = products.map((p, i) => ({
    slug: p.slug,
    axisNum: parseInt(p.axes, 10) || 0,
    displayNum: parseFloat(p.display) || 0,
    // Catalogue sub-type — the subcategory branch the sidebar tree filters by.
    type: p.type,
    // Control interface drives the toolbar chips; derive it from the spec columns.
    controlInterface: p.interfaces.map((c) => c.name).join(" ").toLowerCase(),
    node: <ProductBundleCard key={p.slug} product={p} index={i} total={products.length} />,
  }));
  // Controllers' subcategory branches = catalogue types (motion / cnc / robot /
  // cobot), each labelled from i18n and counted from the product data. Types
  // with no product are dropped so the tree never shows an empty branch.
  const typeCount = (type: string) => products.filter((p) => p.type === type).length;
  const controllerChildren: CategoryTreeChild[] = CONTROLLER_TYPES.filter(
    (ct) => typeCount(ct) > 0,
  ).map((ct) => ({ id: ct, icon: ct, label: t(`types.controllers.${ct}`), count: typeCount(ct) }));
  // Each tab is illustrated by the first product in its group, so the thumbnails
  // follow the catalogue instead of hardcoding a path that can go stale.
  const dncProducts = getCatalogProducts(locale, "dnc");
  const accessoryProducts = getCatalogProducts(locale, "accessory");
  const servoSeries = getSeries(locale, "servo");
  const inverterSeries = getSeries(locale, "inverter");
  const seriesThumb = (category: SeriesCategory) =>
    getSeries(locale, category).find((s) => s.image)?.image ?? SERIES_THUMB_FALLBACK[category];
  const breadcrumb = buildTrail(locale, t("breadcrumb.home"), [
    { name: seo("productsTitle"), path: "/electronics" },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
        style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-50" aria-hidden="true"></div>
        {/* breathing gold atmosphere behind the product render */}
        <div className="qs-glow hidden sm:block right-[4%] top-[-30%] w-[38%] h-[150%]" aria-hidden="true"></div>
        {/* brand PCB signature peeking around the render, masked to a soft fade */}
        <CircuitTraces
          variant="light"
          className="hidden lg:block absolute top-0 right-0 w-[42%] h-full opacity-[.4] [mask-image:radial-gradient(ellipse_at_top_right,#000_22%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_right,#000_22%,transparent_70%)]"
        />
        <div className="relative z-10 max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 pt-10 pb-12 lg:pt-12 lg:pb-14">
          <div className="qs-crumb mb-8">
            <Link href="/">{t("breadcrumb.home")}</Link><span className="sep">/</span>
            <span className="here">{t("breadcrumb.products")}</span>
          </div>
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-none">
              <div className="qs-eyebrow qs-rise" style={{ animationDelay: "0ms" }}>{t("eyebrow")}</div>
              <h1 className="qs-h1 mt-3.5 qs-rise" style={{ animationDelay: "90ms" }}>
                {headingLead}
                <em className="not-italic qs-gold-shimmer">{headingGold}</em>
                {headingTail}
              </h1>
              <p className="qs-lede mt-4 qs-rise" style={{ animationDelay: "190ms" }}>{t("lede")}</p>
              <div className="mt-7 flex flex-col gap-2.5 qs-rise" style={{ animationDelay: "290ms" }}>
                {features.map(f => (
                  <div key={f} className="flex items-center gap-3.5 text-meta
                                          before:content-[''] before:block before:w-6 before:h-px before:bg-gold">{f}</div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-none relative aspect-16/10 bg-white border border-line p-6 overflow-hidden">
              <div className="absolute inset-3 border border-dashed border-gold opacity-30 pointer-events-none"></div>
              {/* gold blueprint scan sweeping the controller render */}
              <div className="qs-scan" aria-hidden="true"></div>
              <Image
                src="/img/products/products-hero-controllers.webp"
                alt={seo("productsTitle")}
                width={1600}
                height={1609}
                priority
                sizes="(max-width: 768px) 90vw, 640px"
                className="qs-kenburns w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="py-12 lg:py-16" id="list">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          {/* Applies the URL filter (group / sub-type / interface) before paint,
              so a shared catalogue link doesn't flash the default view first.
              First group ("controllers") is the no-param default. */}
          <FilterPrePaint
            keys={[
              { key: "g", def: "controllers", unhide: true },
              { key: "t" },
              { key: "iface" },
            ]}
          />
          <FilterPrePaintCleanup />
          {/* Catalogue fades up on load, matching the machine-building page. */}
          <Reveal>
          <ProductCategoryTree
            eyebrow={t("groups.eyebrow")}
            allLabel={t("types.all")}
            support={{ title: t("sidebar.support.title"), cta: t("sidebar.support.cta") }}
            groups={[
              {
                id: "controllers",
                label: t("groups.controllers.label"),
                count: products.length,
                thumb: products[0].image,
                children: controllerChildren,
                node: (
                  <ProductListFilter
                    items={items}
                    labels={{
                      filters: t.raw("toolbar.filters") as string[],
                      sortOptions: t.raw("toolbar.sortOptions") as string[],
                      showing: t("toolbar.showing"),
                      ofModels: t("toolbar.ofModels"),
                      filtersLabel: t("toolbar.filtersLabel"),
                      interfaceLabel: t("toolbar.interfaceLabel"),
                      sortLabel: t("toolbar.sortLabel"),
                      emptyState: t("toolbar.empty"),
                    }}
                  />
                ),
              },
              {
                id: "servo",
                label: t("groups.servo.label"),
                count: servoSeries.length,
                thumb: seriesThumb("servo"),
                node: <SeriesList locale={locale} category="servo" />,
              },
              {
                id: "inverter",
                label: t("groups.inverter.label"),
                count: inverterSeries.length,
                thumb: seriesThumb("inverter"),
                node: <SeriesList locale={locale} category="inverter" />,
              },
              {
                id: "dnc",
                label: t("groups.dnc.label"),
                count: dncProducts.length,
                thumb: dncProducts[0].image,
                node: <CatalogList locale={locale} category="dnc" />,
              },
              {
                id: "accessory",
                label: t("groups.accessory.label"),
                count: accessoryProducts.length,
                thumb: accessoryProducts[0].image,
                node: <CatalogList locale={locale} category="accessory" />,
              },
            ]}
          />
          </Reveal>
        </div>
      </section>
    </>
  );
}
