import {
  productSeries,
  type ProductSeries,
  type SeriesCategory,
  type SeriesKind,
  type SeriesSpec,
  type SeriesDetail,
} from "@/data/series";
import type { Locale } from "@/lib/i18n/config";

export type { SeriesCategory, SeriesKind, SeriesSpec };

/** A model-selection table resolved to one locale (headers/caption localized;
 *  rows stay as-is since cells are locale-neutral model codes / ratings). */
export type SeriesModelTableView = {
  caption: string;
  note?: string;
  filterCol?: string;
  cols: { key: string; label: string }[];
  rows: string[][];
};

export type SeriesDetailView = {
  naming?: { code: string; lines: string[] };
  tables: SeriesModelTableView[];
};

function toDetailView(d: SeriesDetail, en: boolean): SeriesDetailView {
  return {
    naming: d.naming
      ? { code: d.naming.code, lines: en ? d.naming.linesEn : d.naming.lines }
      : undefined,
    tables: d.tables.map((t) => ({
      caption: en ? t.captionEn : t.caption,
      note: en ? t.noteEn : t.note,
      filterCol: t.filterCol,
      cols: t.cols.map((c) => ({ key: c.key, label: en ? c.labelEn : c.label })),
      rows: t.rows,
    })),
  };
}

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
  /** Datasheet body for the detail page; null where only series specs exist. */
  detail: SeriesDetailView | null;
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
    detail: s.detail ? toDetailView(s.detail, en) : null,
  };
}

export function getSeries(locale: Locale, category: SeriesCategory): SeriesView[] {
  return productSeries.filter((s) => s.category === category).map((s) => toView(s, locale));
}

export function getSeriesCount(category: SeriesCategory): number {
  return productSeries.filter((s) => s.category === category).length;
}

/** Every series slug — feeds `generateStaticParams` and the sitemap so each
 *  series gets a statically rendered detail page. */
export function getSeriesSlugs(): string[] {
  return productSeries.map((s) => s.slug);
}

export function getSeriesBySlug(slug: string, locale: Locale): SeriesView | null {
  const s = productSeries.find((x) => x.slug === slug);
  return s ? toView(s, locale) : null;
}
