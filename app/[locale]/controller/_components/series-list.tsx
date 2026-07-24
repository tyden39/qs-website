import { getTranslations } from "next-intl/server";
import { getSeries, SERIES_KINDS, type SeriesCategory } from "@/lib/data/series";
import { SeriesCard } from "@/components/products/series-card";
import { SeriesListFilter, type SeriesFilterSection } from "./series-list-filter";
import { SortableCardList } from "./sortable-card-list";
import type { Locale } from "@/lib/i18n/config";

/**
 * List panel for a drive-line group (servo or inverters): full-width series
 * cards, one per row — a series carries enough spec to warrant the space. No
 * filter toolbar: a handful of series is short enough that filtering would be
 * more chrome than help. Group blurb and support live in the CategoryShell.
 *
 * The servo set splits into drive / motor / cable sections; inverters carry no
 * sub-type and render as one flat list. Empty sections never appear.
 */
export async function SeriesList({
  locale,
  category,
}: {
  locale: Locale;
  category: SeriesCategory;
}) {
  const t = await getTranslations({ locale, namespace: "product.page.types" });
  const tb = await getTranslations({ locale, namespace: "product.page.toolbar" });
  const series = getSeries(locale, category);
  const sections = SERIES_KINDS.map((kind) => ({
    kind,
    items: series.filter((s) => s.kind === kind),
  })).filter((s) => s.items.length > 0);

  // A single sub-type (or none) carries no kind chips — the choice would be
  // more chrome than help. It still gets the shared toolbar frame (count + sort)
  // so every group panel matches the controllers' bar.
  if (sections.length <= 1) {
    return (
      <SortableCardList
        items={series.map((s, i) => ({
          key: s.slug,
          name: s.name,
          node: <SeriesCard key={s.slug} series={s} index={i} total={series.length} />,
        }))}
        sortOptions={tb.raw("sortBasic") as string[]}
        showing={tb("showing")}
        unit={tb("ofSeries")}
        sortLabel={tb("sortLabel")}
      />
    );
  }

  const filterSections: SeriesFilterSection[] = sections.map((s) => ({
    id: s.kind,
    label: t(`servo.${s.kind}`),
    items: s.items.map((item, i) => ({
      slug: item.slug,
      node: <SeriesCard key={item.slug} series={item} index={i} total={s.items.length} />,
    })),
  }));

  return (
    <SeriesListFilter
      sections={filterSections}
      allLabel={t("all")}
      navLabel={t("navLabel")}
      totalCount={series.length}
      showingLabel={tb("showing")}
      unitLabel={tb("ofSeries")}
    />
  );
}
