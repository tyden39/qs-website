import {
  productSeries,
  type ProductSeries,
  type SeriesCategory,
  type SeriesKind,
  type SeriesSpec,
} from "@/data/series";
import type { Locale } from "@/lib/i18n/config";

export type { SeriesCategory, SeriesKind, SeriesSpec };

/** Section order on the servo list page: what drives the motion, what moves,
 *  what connects the two. */
export const SERIES_KINDS: SeriesKind[] = ["driver", "motor", "cable"];

/** A photo resolved to one locale — `alt` already carries the right language. */
export type SeriesImage = { src: string; w: number; h: number; alt: string };

export type SeriesView = {
  slug: string;
  category: SeriesCategory;
  /** Sub-type section; null where the category is not subdivided. */
  kind: SeriesKind | null;
  brand: string;
  name: string;
  tag: string;
  desc: string;
  specs: SeriesSpec[];
  image: SeriesImage | null;
};

function toView(s: ProductSeries, locale: Locale): SeriesView {
  const en = locale === "en";
  return {
    slug: s.slug,
    category: s.category,
    kind: s.kind ?? null,
    brand: s.brand,
    name: s.name,
    tag: en ? s.tagEn : s.tag,
    desc: en ? s.descEn : s.desc,
    specs: en ? s.specsEn : s.specs,
    image: s.image
      ? { src: s.image.src, w: s.image.w, h: s.image.h, alt: en ? s.image.altEn : s.image.alt }
      : null,
  };
}

export function getSeries(locale: Locale, category: SeriesCategory): SeriesView[] {
  return productSeries.filter((s) => s.category === category).map((s) => toView(s, locale));
}

export function getSeriesCount(category: SeriesCategory): number {
  return productSeries.filter((s) => s.category === category).length;
}
