import { datasheets, type Datasheet } from "@/data/datasheets";
import type { Locale } from "@/lib/i18n/config";

export type DatasheetView = {
  slug: string;
  name: string;
  fileUrl: string;
  productSlug: string | null;
  category: string;
  series: string;
  lang: "vi" | "en" | "both";
  ext: string;
  version: string | null;
  docDate: Date | null;
  sizeBytes: number;
  featured: boolean;
};

function toView(d: Datasheet): DatasheetView {
  return {
    slug: d.slug,
    name: d.title,
    fileUrl: d.fileUrl,
    productSlug: d.productSlug ?? null,
    category: d.category,
    series: d.series,
    lang: d.lang,
    ext: d.ext,
    version: d.version,
    docDate: d.date ? new Date(d.date) : null,
    sizeBytes: d.sizeBytes,
    featured: d.featured ?? false,
  };
}

// A datasheet is shown for a locale when it is tagged for that locale or marked
// bilingual ("both") — matching the previous query-time language filter.
export function getAllDatasheets(locale: Locale): DatasheetView[] {
  return datasheets
    .filter((d) => d.lang === locale || d.lang === "both")
    .map(toView);
}
