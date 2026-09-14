import type { Metadata } from "next";
import Image from "@/components/media/image";
import { Link } from "@/lib/i18n/navigation";
import { getAllProducts, CONTROLLER_TYPES } from "@/lib/data/products";
import { ProductBundleCard } from "@/components/products/product-bundle-card";
import { ProductListFilter, type ProductFilterItem } from "./_components/product-list-filter";
import { CategoryHeroFigure, CategoryTreeHero, CategoryTreePanels, HERO_FIGURE_SIZES, type CategoryTreeChild, type CategoryTreeGroup } from "./_components/product-category-tree";
import { CatalogList } from "./_components/catalog-list";
import { GROUP_HERO } from "./_components/category-page";
import { SeriesList } from "./_components/series-list";
import { getCatalogProducts } from "@/lib/data/catalog";
import { getSeries, type SeriesCategory } from "@/lib/data/series";
import CircuitTraces from "@/components/circuit-traces";
import ContactCta from "@/components/contact-cta";
import Reveal from "@/components/reveal";
import { FilterPrePaint, PrePaintHeroImage } from "@/lib/filter-prepaint";
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
  const alternates = buildAlternates("/electronics", locale);
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
  // Filter metadata derived from product data; the async card is pre-rendered
  // on the server and handed to the client filter as an opaque node.
  const items: ProductFilterItem[] = products.map((p) => ({
    slug: p.slug,
    axisNum: parseInt(p.axes, 10) || 0,
    displayNum: parseFloat(p.display) || 0,
    // Catalogue sub-type — the subcategory branch the sidebar tree filters by.
    type: p.type,
    // Control interface drives the toolbar chips; derive it from the spec columns.
    controlInterface: p.interfaces.map((c) => c.name).join(" ").toLowerCase(),
    node: <ProductBundleCard key={p.slug} product={p} />,
  }));
  // Controllers' subcategory branches = catalogue types (cnc / motion / robot /
  // cobot), each labelled from i18n and counted from the product data. Every
  // type stays in the tree: the ones the catalogue has not filled yet keep their
  // place as announced-but-empty branches, marked "soon" instead of a count, and
  // their panel shows the same notice in place of the filter's empty state.
  const typeCount = (type: string) => products.filter((p) => p.type === type).length;
  const controllerChildren: CategoryTreeChild[] = CONTROLLER_TYPES.map((ct) => ({
    id: ct,
    icon: ct,
    label: t(`types.controllers.${ct}`),
    count: typeCount(ct),
    soon: typeCount(ct) === 0 ? t("types.soon") : undefined,
  }));
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

  // The hero figure for the active group — a bare render that fills the shared
  // HERO_IMAGE_SLOT (standard size lives in the tree component).
  // `img.scale` shrinks a crowded render inside the slot (see GROUP_HERO).
  const heroFigure = (img: { src: string; scale?: number }, alt: string, priority = false) => (
    // Keyed: the figure crosses the RSC boundary and is reconciled from a lazy
    // reference inside the tree's group list, which React reads as an array child.
    <Image key={img.src} src={img.src} alt={alt} fill priority={priority}
           sizes={HERO_FIGURE_SIZES} className="object-contain"
           style={img.scale ? { transform: `scale(${img.scale})` } : undefined} />
  );
  // Distinct family render for the controllers intro (the servo/inverter/DNC
  // groups reuse their own catalogue art).
  const controllersHero = { src: "/img/products/products-hero-controllers.webp", w: 1600, h: 1609 };

  // One group array feeds both halves of the split catalogue: the hero reads
  // heroTitle/blurb/heroImage + the tree, the panels below read `node`.
  const groups: CategoryTreeGroup[] = [
    {
      id: "controllers",
      label: t("groups.controllers.label"),
      labelGold: t("groups.controllers.labelGold"),
      count: products.length,
      thumb: products[0].image,
      blurb: t("groups.controllers.blurb"),
      heroImage: heroFigure(controllersHero, t("groups.controllers.label"), true),
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
            soon: {
              eyebrow: t("soon.eyebrow"),
              plate: t("soon.plate"),
              body: t("soon.body"),
              contact: t("soon.contact"),
              browse: t("soon.browse"),
            },
            typeLabels: Object.fromEntries(
              CONTROLLER_TYPES.map((ct) => [ct, t(`types.controllers.${ct}`)]),
            ),
          }}
        />
      ),
    },
    {
      id: "servo",
      label: t("groups.servo.label"),
      labelGold: t("groups.servo.labelGold"),
      count: servoSeries.length,
      thumb: seriesThumb("servo"),
      blurb: t("groups.servo.blurb"),
      heroImage: heroFigure(GROUP_HERO.servo, t("groups.servo.label")),
      node: <SeriesList locale={locale} category="servo" />,
    },
    {
      id: "inverter",
      label: t("groups.inverter.label"),
      labelGold: t("groups.inverter.labelGold"),
      count: inverterSeries.length,
      thumb: seriesThumb("inverter"),
      blurb: t("groups.inverter.blurb"),
      heroImage: heroFigure(GROUP_HERO.inverter, t("groups.inverter.label")),
      node: <SeriesList locale={locale} category="inverter" />,
    },
    {
      id: "dnc",
      label: t("groups.dnc.label"),
      labelGold: t("groups.dnc.labelGold"),
      count: dncProducts.length,
      thumb: dncProducts[0].image,
      blurb: t("groups.dnc.blurb"),
      heroImage: heroFigure({ ...dncProducts[0].image, scale: GROUP_HERO.dnc.scale }, t("groups.dnc.label")),
      node: <CatalogList locale={locale} category="dnc" />,
    },
    {
      id: "accessory",
      label: t("groups.accessory.label"),
      labelGold: t("groups.accessory.labelGold"),
      count: accessoryProducts.length,
      thumb: accessoryProducts[0].image,
      blurb: t("groups.accessory.blurb"),
      heroImage: heroFigure(GROUP_HERO.accessory, t("groups.accessory.label")),
      node: <CatalogList locale={locale} category="accessory" />,
    },
  ];

  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* HERO — sidebar tree + the active group's intro/figure */}
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
        <div className="relative z-10 max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 py-12 lg:py-16">
          <div className="qs-crumb mb-7">
            <Link href="/">{t("breadcrumb.home")}</Link><span className="sep">/</span>
            <span className="here">{t("breadcrumb.products")}</span>
          </div>
          {/* Applies the URL filter (group / sub-type / interface) before paint,
              so a shared catalogue link doesn't flash the default view first.
              First group ("controllers") is the no-param default. Rendered before
              the tagged intro/list panels so its style is in place as they parse. */}
          <FilterPrePaint
            keys={[
              { key: "g", def: "controllers", unhide: true },
              { key: "t" },
              { key: "iface" },
            ]}
          />
          <Reveal>
            <CategoryTreeHero
              eyebrow={t("groups.eyebrow")}
              allLabel={t("types.all")}
              viewListLabel={t("groups.viewList")}
              groups={groups}
            />
          </Reveal>
        </div>
        {/* The active group's render, bleeding off the right edge of the hero.
            Sits after the wrapper so the pre-paint primer above still governs
            it, and under the wrapper's z-10 so the copy stays on top. */}
        <CategoryHeroFigure groups={groups} />
        {/* Eager-loads that render when the URL names a group other than the
            default, whose figure is the only one carrying `priority`. */}
        <PrePaintHeroImage param="g" def="controllers" />
      </section>

      {/* LIST — the active group's catalogue, full width below the hero */}
      <section className="py-12 lg:py-16" id="list">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <Reveal>
            <CategoryTreePanels groups={groups} />
          </Reveal>
        </div>
      </section>

      {/* CTA — bordered because the list section above carries no hairline */}
      <ContactCta
        bordered
        heading={t("ctaHeading")}
        body={t("ctaBody")}
        ctaLabel={t("ctaBtn")}
      />
      <FilterPrePaintCleanup />
    </>
  );
}
