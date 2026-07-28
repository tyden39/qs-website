import { getTranslations } from "next-intl/server";
import { getSeries, type SeriesCategory } from "@/lib/data/series";
import { SeriesCard } from "@/components/products/series-card";
import { SortableCardList } from "./sortable-card-list";
import type { Locale } from "@/lib/i18n/config";

/**
 * List panel for a drive-line group (QS servo or inverters): full-width series
 * cards, one per row — a series carries enough spec to warrant the space. Every
 * series in the category sits in one flat list; drives and motors are not split
 * into sections. Group blurb and support live in the CategoryShell.
 */
export async function SeriesList({
  locale,
  category,
}: {
  locale: Locale;
  category: SeriesCategory;
}) {
  const tb = await getTranslations({ locale, namespace: "product.page.toolbar" });
  const series = getSeries(locale, category);

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
