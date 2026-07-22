import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import CircuitTraces from "@/components/circuit-traces";
import { buildSeriesProduct, buildTrail, JsonLd } from "@/lib/seo/jsonld";
import type { SeriesView } from "@/lib/data/series";
import type { Locale } from "@/lib/i18n/config";
import { SeriesModelTable } from "./series-model-table";

/**
 * Detail page for a drive-line series (QS Servo drives/motors/cables, Savch
 * inverters). The catalogue sells these at series level, so the page is a
 * datasheet: hero → series specs → model-code decode → model-selection tables →
 * quote CTA. A series that carries no per-model breakdown yet (`detail === null`)
 * simply shows the series specs and a "contact for the full list" note — never a
 * dead section.
 */

/** Which list page each category's crumb walks back through. */
const CATEGORY_PATH: Record<SeriesView["category"], string> = {
  servo: "/products/servo",
  inverter: "/products/inverters",
};

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

  const categoryPath = CATEGORY_PATH[series.category];
  const categoryLabel = tGroups(`${series.category}.label`);
  const productJsonLd = buildSeriesProduct(series, locale);
  const breadcrumb = buildTrail(locale, tCrumb("home"), [
    { name: tCrumb("products"), path: "/products" },
    { name: categoryLabel, path: categoryPath },
    { name: series.name, path: `/products/${series.slug}` },
  ]);

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
            <Link href="/products">{tCrumb("products")}</Link>
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
                <a
                  className="qs-btn border border-white/25 bg-transparent text-white hover:bg-white hover:text-ink"
                  href="#specs"
                >
                  {t("specsHeading")}
                </a>
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
        </div>
      </section>

      {/* ── Series specifications ── */}
      <section
        id="specs"
        className="relative overflow-hidden bg-paper border-b border-line py-12 sm:py-16 lg:py-24"
      >
        <CircuitTraces
          variant="light"
          className="hidden md:block absolute inset-y-0 right-0 w-[34%] opacity-[.45] [mask-image:radial-gradient(ellipse_at_right,#000_18%,transparent_66%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_18%,transparent_66%)]"
        />
        <div className="relative qs-wrap-wide">
          <div className="qs-eyebrow mb-2">{t("specsEyebrow")}</div>
          <h2 className="qs-h2 mb-8">{t("specsHeading")}</h2>
          <div className="border border-line">
            <div className="bg-[#11120f] px-4 py-3.5">
              <span className="font-display text-body font-bold tracking-[-.01em] text-white">
                {series.name}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-px bg-line border-t border-line">
              {series.specs.map((s) => (
                <div key={s.l} className="bg-white px-4 py-3.5 flex flex-col gap-1">
                  <span className="font-mono text-label-xs leading-snug tracking-[.06em] uppercase text-muted">
                    {s.l}
                  </span>
                  <span className="text-meta font-semibold tracking-[-.005em] text-ink tabular-nums">
                    {s.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Model code + selection tables (datasheet body) ── */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white border-b border-line">
        <div className="qs-wrap-wide">
          {series.detail ? (
            <div className="flex flex-col gap-14">
              {series.detail.naming && (
                <div>
                  <div className="qs-eyebrow mb-2">{t("namingEyebrow")}</div>
                  <h2 className="qs-h2 mb-6">{t("namingHeading")}</h2>
                  <div className="border border-line bg-paper p-6 lg:p-8">
                    <div className="font-display text-title sm:text-subhead font-bold tracking-[-.02em] text-ink">
                      {series.detail.naming.code}
                    </div>
                    <ul className="mt-5 flex flex-col gap-2.5 m-0 p-0 list-none">
                      {series.detail.naming.lines.map((line) => (
                        <li
                          key={line}
                          className="flex gap-3 text-meta leading-[1.6] text-[#3a3a3a]"
                        >
                          <span aria-hidden className="text-gold-1">
                            ▸
                          </span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {series.detail.tables.length > 0 && (
                <div>
                  <div className="qs-eyebrow mb-2">{t("tablesEyebrow")}</div>
                  <h2 className="qs-h2 mb-8">{t("tablesHeading")}</h2>
                  <div className="flex flex-col gap-12">
                    {series.detail.tables.map((table) => (
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
