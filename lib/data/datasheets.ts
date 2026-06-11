import type { Locale } from "@/lib/i18n/config";
import { datasheets, type Datasheet } from "@/data/datasheets";

// View contract consumed by the downloads page. Source is now the static
// `data/datasheets.ts` seed; `name` maps from the seed `title`.
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

function toView(row: Datasheet): DatasheetView {
  return {
    slug: row.slug,
    name: row.title,
    fileUrl: row.fileUrl,
    productSlug: row.productSlug ?? null,
    category: row.category,
    series: row.series,
    lang: row.lang,
    ext: row.ext,
    version: row.version,
    docDate: row.date ? new Date(row.date) : null,
    sizeBytes: row.sizeBytes,
    featured: row.featured ?? false,
  };
}

export async function getAllDatasheets(locale: Locale): Promise<DatasheetView[]> {
  return datasheets
    .filter((d) => d.lang === locale || d.lang === "both")
    .map(toView);
}
