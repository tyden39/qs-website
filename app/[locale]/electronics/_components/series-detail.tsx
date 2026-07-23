import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { buildSeriesProduct, buildTrail, JsonLd } from "@/lib/seo/jsonld";
import { getSeriesAccessories, type SeriesView } from "@/lib/data/series";
import type { Locale } from "@/lib/i18n/config";
import { SeriesModelTable } from "./series-model-table";
import { SeriesFigures, SeriesNamingFigure, SeriesImageStrip } from "./series-figures";
import { SeriesNamingCode } from "./series-naming-code";
import { ProductDetailTabs, type ProductDetailTab } from "./product-detail-tabs";

/**
 * Detail page for a drive-line series (QS Servo drives/motors/cables, Savch
 * inverters). The catalogue sells these at series level, so the page is a
 * datasheet organised into the same tabs the manufacturer's page uses:
 * Introduction · Specifications · Documentation · Optional accessories.
 *
 * The Specifications tab always keeps the machine-readable series spec grid
 * (and the model-code decode + selection tables where present); the other three
 * tabs mirror the Savch source galleries and download list. A tab with no
 * content is dropped rather than shown empty.
 */

/** Which list page each category's crumb walks back through. */
const CATEGORY_PATH: Record<SeriesView["category"], string> = {
  servo: "/electronics/servo",
  inverter: "/electronics/inverters",
};

/** Order the Documentation tab groups its downloads in — manuals first, then
 *  drawings, tooling, marketing, compliance. Categories with no items are
 *  skipped at render time. */
const DOC_CATEGORY_ORDER = ["manual", "drawing", "software", "brochure", "certificate"] as const;

export async function SeriesDetail({
  series,
  locale,
}: {
  series: SeriesView;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "product.seriesDetail" });
  const tCrumb = await getTranslations({ locale, namespace: "product.detailPage.breadcrumb" });
  const tGroups = await getTranslations({ locale, namespace: "product.page.groups" });

  // Accessory series (motor, cables) are not listed on their own; a drive page
  // surfaces them as the companion parts that complete the servo system.
  const accessories = series.kind === "driver" ? getSeriesAccessories(locale, series.category) : [];

  const categoryPath = CATEGORY_PATH[series.category];
  const categoryLabel = tGroups(`${series.category}.label`);
  const productJsonLd = buildSeriesProduct(series, locale);
  const breadcrumb = buildTrail(locale, tCrumb("home"), [
    { name: tCrumb("products"), path: "/electronics" },
    { name: categoryLabel, path: categoryPath },
    { name: series.name, path: `/electronics/${series.slug}` },
  ]);

  const detail = series.detail;
  const tabLabels = t.raw("tabs") as string[];

  // ── Tab 1: Introduction — the 产品介绍 content. Pure-text manufacturer plates
  //    are re-authored as native bilingual HTML (lead + applications + feature
  //    groups); the diagram/topology/brochure plates that are not pure text are
  //    kept as an image gallery beneath the copy. ──
  const intro = detail?.intro;
  const introImages = detail?.introduction ?? [];
  const introPanel = (intro || introImages.length > 0) && (
    <section className="bg-white border-b border-line py-12 sm:py-16 lg:py-24">
      <div className="qs-wrap-wide">
        <div className="qs-eyebrow mb-2">{t("introEyebrow")}</div>
        <h2 className="qs-h2 mb-6">{t("introHeading")}</h2>
        {intro && (
          <>
            <p className="text-lede leading-[1.75] text-[#2f2c26] max-w-[74ch]">{intro.lead}</p>
            {intro.applications && (
              <p className="mt-4 text-meta leading-[1.8] text-muted max-w-[86ch]">
                {intro.applications}
              </p>
            )}
            {intro.sections.length > 0 && (
              <div className="mt-10 grid gap-px bg-line border border-line md:grid-cols-3">
                {intro.sections.map((sec) => (
                  <div key={sec.title} className="bg-white p-6 lg:p-7 flex flex-col">
                    <div className="flex items-center gap-3 pb-4 border-b border-line">
                      <span className="h-2 w-2 bg-gold-1" aria-hidden="true" />
                      <h3 className="font-display text-title font-bold tracking-[-.02em] text-ink m-0">
                        {sec.title}
                      </h3>
                    </div>
                    <ul className="mt-4 flex flex-col gap-2.5 m-0 p-0 list-none">
                      {sec.items.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2.5 text-meta leading-[1.55] text-[#3a3a3a]"
                        >
                          <span aria-hidden className="text-gold-1 shrink-0">▸</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {introImages.length > 0 && (
          <div className={intro ? "mt-12" : ""}>
            <SeriesImageStrip images={introImages} zoomLabel={t("galleryZoom")} />
          </div>
        )}
      </div>
    </section>
  );

  // Series-level spec grid, rendered inside the hero (dark theme, no header bar)
  // so the key ratings sit with the title rather than behind a tab.
  const heroSpecGrid = (
    <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10 m-0">
      {series.specs.map((s) => (
        <div key={s.l} className="bg-[#141510] px-4 py-3 sm:px-5 sm:py-4">
          <dt className="font-mono text-label-xs tracking-[.16em] uppercase text-[#837b6c]">
            {s.l}
          </dt>
          <dd className="m-0 mt-1.5 font-display text-title font-semibold tracking-[-.02em] text-white tabular-nums">
            {s.v}
          </dd>
        </div>
      ))}
    </dl>
  );

  // ── Tab 2: Specifications — the 产品参数 spec sheets. The model-code decode,
  //    selection tables and datasheet figures already live inside those images,
  //    so the native versions render only as a fallback for series that carry
  //    no param images (e.g. accessory series reached from a drive page). ──
  const specsPanel = (
    <section className="py-12 sm:py-16 lg:py-24 bg-white border-b border-line">
      <div className="qs-wrap-wide">
        {detail && detail.paramImages.length > 0 ? (
          <SeriesImageStrip images={detail.paramImages} zoomLabel={t("galleryZoom")} />
        ) : detail ? (
          <div className="flex flex-col gap-14">
            {detail.naming && (
              <div>
                <div className="qs-eyebrow mb-2">{t("namingEyebrow")}</div>
                <h2 className="qs-h2 mb-6">{t("namingHeading")}</h2>
                {detail.naming.figure ? (
                  <SeriesNamingFigure figure={detail.naming.figure} zoomLabel={t("figuresZoom")} />
                ) : detail.naming.segments.length > 0 ? (
                  <SeriesNamingCode code={detail.naming.code} segments={detail.naming.segments} />
                ) : (
                  <div className="border border-line bg-paper p-6 lg:p-8">
                    <div className="font-display text-title sm:text-subhead font-bold tracking-[-.02em] text-ink">
                      {detail.naming.code}
                    </div>
                    <ul className="mt-5 flex flex-col gap-2.5 m-0 p-0 list-none">
                      {detail.naming.lines.map((line) => (
                        <li key={line} className="flex gap-3 text-meta leading-[1.6] text-[#3a3a3a]">
                          <span aria-hidden className="text-gold-1">▸</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {detail.tables.length > 0 && (
              <div>
                <div className="qs-eyebrow mb-2">{t("tablesEyebrow")}</div>
                <h2 className="qs-h2 mb-8">{t("tablesHeading")}</h2>
                <div className="flex flex-col gap-12">
                  {detail.tables.map((table) => (
                    <SeriesModelTable
                      key={table.caption}
                      table={table}
                      allLabel={t("filterAll")}
                      filterLabel={t("filterLabel")}
                    />
                  ))}
                </div>
              </div>
            )}

            {detail.figures.length > 0 && (
              <SeriesFigures
                figures={detail.figures}
                eyebrow={t("figuresEyebrow")}
                heading={t("figuresHeading")}
                zoomLabel={t("figuresZoom")}
              />
            )}
          </div>
        ) : (
          <div className="border border-dashed border-gold/60 bg-paper p-8 lg:p-10 text-center">
            <p className="m-0 text-body leading-[1.7] text-[#3a3a3a] max-w-[60ch] mx-auto">
              {t("comingSoon")}
            </p>
            <Link className="qs-btn qs-btn-gold mt-6 inline-flex" href="/contact">
              {t("quoteBtn")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );

  // ── Tab 3: Documentation — the 资料下载 download list (URLs kept as-is),
  //    grouped by document type so a long list stays browsable. Each present
  //    category renders its own table; the category badge becomes the group
  //    heading, so the per-row type column is dropped. ──
  const docs = detail?.documentation ?? [];
  const docGroups = DOC_CATEGORY_ORDER.map((category) => ({
    category,
    items: docs.filter((d) => d.category === category),
  })).filter((g) => g.items.length > 0);
  const docsPanel = docs.length > 0 && (
    <section className="py-12 sm:py-16 lg:py-24 bg-paper border-b border-line">
      <div className="qs-wrap-wide">
        <div className="qs-eyebrow mb-2">{t("docsEyebrow")}</div>
        <h2 className="qs-h2 mb-3">{t("docsHeading")}</h2>
        <p className="text-meta text-muted leading-[1.7] max-w-[62ch] mb-10">{t("docsHint")}</p>
        <div className="flex flex-col gap-10">
          {docGroups.map((group) => (
            <div key={group.category}>
              <div className="flex items-baseline gap-3 pb-3 mb-4 border-b border-line">
                <h3 className="font-display text-title font-bold tracking-[-.02em] text-ink m-0">
                  {t(`docsCategory.${group.category}`)}
                </h3>
                <span className="font-mono text-label-xs tracking-[.14em] text-muted tabular-nums">
                  {group.items.length}
                </span>
              </div>
              <div className="border border-line bg-white">
                <div className="hidden md:grid grid-cols-[1fr_90px_120px] gap-4 px-5 py-3 bg-[#0e0e0c] text-[#cfc9b8] font-mono text-label-xs tracking-[.16em] uppercase">
                  <span>{t("docsTable.name")}</span>
                  <span>{t("docsTable.size")}</span>
                  <span className="text-right">{t("docsTable.download")}</span>
                </div>
                {group.items.map((d, i) => (
                  <div
                    key={`${d.url}-${i}`}
                    className="grid grid-cols-1 md:grid-cols-[1fr_90px_120px] gap-x-4 gap-y-2 items-center px-5 py-4 border-t border-line hover:bg-paper transition-colors"
                  >
                    <span className="font-semibold text-ink text-meta tracking-[-.005em] min-w-0">
                      {d.title}
                    </span>
                    <span className="font-mono text-label text-muted md:text-[#3a3a3a]">
                      {d.size_mb ? `${d.size_mb} MB` : "—"}
                    </span>
                    <div className="flex md:justify-end">
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 whitespace-nowrap border border-ink bg-ink text-white px-4 py-2 hover:bg-gold-3 hover:border-gold-3 transition-colors font-mono text-label tracking-[.14em] uppercase"
                      >
                        {d.format.toUpperCase()} ↓
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // ── Tab 4: Accessories — QS companion series (driver pages) + the 可选配件
  //    manufacturer gallery. ──
  const accessoryImages = detail?.accessoryImages ?? [];
  const hasAccessories = accessories.length > 0 || accessoryImages.length > 0;
  const accessoriesPanel = hasAccessories && (
    <section className="py-12 sm:py-16 lg:py-24 bg-white border-b border-line">
      <div className="qs-wrap-wide flex flex-col gap-14">
        {accessories.length > 0 && (
          <div>
            <div className="qs-eyebrow mb-2">{t("accessoriesEyebrow")}</div>
            <h2 className="qs-h2 mb-3">{t("accessoriesHeading")}</h2>
            <p className="text-meta text-muted leading-[1.7] max-w-[62ch] mb-8">
              {t("accessoriesHint")}
            </p>
            <div className="grid gap-px bg-line border border-line sm:grid-cols-2 lg:grid-cols-3">
              {accessories.map((a) => (
                <Link
                  key={a.slug}
                  href={`/electronics/${a.slug}`}
                  className="group bg-white p-6 flex flex-col gap-2 hover:bg-white/60 transition-colors"
                >
                  <span className="font-mono text-label-xs tracking-[.16em] uppercase text-gold-1">
                    {a.tag}
                  </span>
                  <span className="font-display text-title font-bold tracking-[-.02em] text-ink">
                    {a.name}
                  </span>
                  <span className="text-meta leading-[1.6] text-[#3a3a3a] line-clamp-3">
                    {a.desc}
                  </span>
                  <span className="mt-2 font-mono text-label-xs tracking-[.14em] uppercase text-ink group-hover:text-gold-1 transition-colors">
                    {t("accessoriesLink")} <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {accessoryImages.length > 0 && (
          <div>
            <div className="qs-eyebrow mb-2">{t("accessoryImagesEyebrow")}</div>
            <h2 className="qs-h2 mb-8">{t("accessoryImagesHeading")}</h2>
            <SeriesImageStrip images={accessoryImages} zoomLabel={t("galleryZoom")} />
          </div>
        )}
      </div>
    </section>
  );

  // Assemble tabs in the manufacturer's order, dropping any that have no
  // content. Specifications always renders (series specs exist for every series).
  const tabs: ProductDetailTab[] = [];
  if (introPanel) tabs.push({ id: "intro", label: tabLabels[0], content: introPanel });
  tabs.push({ id: "specs", label: tabLabels[1], content: specsPanel });
  if (docsPanel) tabs.push({ id: "docs", label: tabLabels[2], content: docsPanel });
  if (accessoriesPanel) tabs.push({ id: "accessories", label: tabLabels[3], content: accessoriesPanel });

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumb} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#10110f] text-white border-b border-[#28261f]">
        <div className="absolute inset-0 qs-grid-bg opacity-[.12]" />
        <div
          className="absolute -right-20 top-0 h-[420px] w-[420px] rounded-full bg-gold-2/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative qs-wrap-wide pt-8 pb-14 lg:pt-10 lg:pb-16">
          <div className="qs-crumb mb-8 text-[#8f8878]">
            <Link href="/">{tCrumb("home")}</Link>
            <span className="sep">/</span>
            <Link href="/electronics">{tCrumb("products")}</Link>
            <span className="sep">/</span>
            <Link href={categoryPath}>{categoryLabel}</Link>
            <span className="sep">/</span>
            <span className="here text-[#eee9d7]">{series.name}</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.8fr)] gap-10 lg:gap-14 items-center">
            <div className="order-2 md:order-1">
              <small className="block font-mono text-label text-gold-2 tracking-[.18em] uppercase mb-3">
                {series.brand}
              </small>
              <h1 className="font-display font-bold tracking-[-.03em] leading-[1.02] text-balance m-0 text-[clamp(34px,5vw,60px)]">
                {series.name}
              </h1>
              <div className="mt-3 font-mono text-label tracking-[.14em] uppercase text-[#c9c2b3]">
                {series.tag}
              </div>
              <p className="mt-5 text-body leading-[1.7] text-[#c9c2b3] max-w-[64ch]">
                {series.desc}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link className="qs-btn qs-btn-gold" href="/contact">
                  {t("quoteBtn")}
                </Link>
              </div>
            </div>

            <div
              className="relative order-1 grid place-items-center border border-white/10 p-6 md:order-2 lg:p-8 overflow-hidden min-h-[240px]"
              style={{ background: "radial-gradient(circle at 50% 38%, #1b1c17, #101109)" }}
            >
              <div
                className="absolute inset-3 border border-dashed border-gold opacity-25 pointer-events-none"
                aria-hidden="true"
              />
              {series.image ? (
                <Image
                  src={series.image.src}
                  alt={series.image.alt}
                  width={series.image.w}
                  height={series.image.h}
                  priority
                  sizes="(max-width: 768px) 90vw, 460px"
                  className="w-auto max-h-[340px] max-w-full object-contain"
                />
              ) : (
                <span className="relative font-mono text-label-xs tracking-[.16em] uppercase text-[#837b6c]">
                  {series.name}
                </span>
              )}
            </div>
          </div>

          {heroSpecGrid}
        </div>
      </section>

      <ProductDetailTabs tabs={tabs} />

      {/* ── CTA ── */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="qs-wrap-wide">
          <div className="bg-[#11120f] text-[#cfc9b8] p-7 sm:p-10 lg:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center border border-[#28261f]">
            <div>
              <h3 className="font-display font-bold text-h2 text-white tracking-[-.01em] m-0">
                {t("ctaHeading", { name: series.name })}
              </h3>
              <p className="text-[#a8a499] mt-2 max-w-[60ch] m-0 text-body leading-relaxed">
                {t("ctaBody")}
              </p>
            </div>
            <Link className="qs-btn qs-btn-gold" href="/contact">
              {t("ctaBtn")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
