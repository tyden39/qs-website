import {
  productSeries,
  type ProductSeries,
  type SeriesCategory,
  type SeriesKind,
  type SeriesSpec,
  type SeriesDetail,
  type SeriesFigure,
  type SeriesPhoto,
  type SeriesDocumentation,
  type SeriesIntro,
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

/** A datasheet plate resolved to one locale — the figure's text is baked into
 *  the image, so the locale picks the file, not just the `alt`. */
export type SeriesFigureView = { src: string; w: number; h: number; alt: string };

/** A code chunk resolved to one locale. */
export type SeriesCodeSegmentView = { text: string; label: string };

/** A downloadable document resolved to one locale: `title` picks the language,
 *  everything else (category/url/format/size) is locale-neutral. `lang` stays —
 *  it describes the file's own language, which the UI may badge. */
export type SeriesDocumentationView = Omit<SeriesDocumentation, "titleEn">;

export type SeriesDetailView = {
  naming?: {
    code: string;
    lines: string[];
    figure?: SeriesFigureView;
    segments: SeriesCodeSegmentView[];
  };
  /** Rebuilt introduction resolved to one locale: opening line, optional
   *  applications line, and feature groups. */
  intro?: {
    lead: string;
    applications?: string;
    sections: { title: string; items: string[] }[];
  };
  /** Introduction gallery plates resolved to one locale (localized alt). */
  introduction: SeriesFigureView[];
  tables: SeriesModelTableView[];
  figures: SeriesFigureView[];
  paramImages: SeriesFigureView[];
  documentation: SeriesDocumentationView[];
  accessoryImages: SeriesFigureView[];
};

function toIntroView(intro: SeriesIntro, en: boolean) {
  return {
    lead: en ? intro.leadEn : intro.lead,
    applications: en ? intro.applicationsEn : intro.applications,
    sections: intro.sections.map((s) => ({
      title: en ? s.titleEn : s.title,
      items: s.items.map((it) => (en ? it.tEn : it.t)),
    })),
  };
}

function toFigureView(f: SeriesFigure, en: boolean): SeriesFigureView {
  return { src: en ? f.srcEn : f.src, w: f.w, h: f.h, alt: en ? f.altEn : f.alt };
}

/** A gallery photo (single src, localized alt) resolved to a figure view so the
 *  detail page renders every image strip through one component. */
function photoToView(p: SeriesPhoto, en: boolean): SeriesFigureView {
  return { src: p.src, w: p.w, h: p.h, alt: en ? p.altEn : p.alt };
}

function toDetailView(d: SeriesDetail, en: boolean): SeriesDetailView {
  return {
    naming: d.naming
      ? {
          code: d.naming.code,
          lines: en ? d.naming.linesEn : d.naming.lines,
          figure: d.naming.figure ? toFigureView(d.naming.figure, en) : undefined,
          segments: (d.naming.segments ?? []).map((s) => ({
            text: s.text,
            label: en ? s.labelEn : s.label,
          })),
        }
      : undefined,
    intro: d.intro ? toIntroView(d.intro, en) : undefined,
    introduction: (d.introduction ?? []).map((p) => photoToView(p, en)),
    tables: d.tables.map((t) => ({
      caption: en ? t.captionEn : t.caption,
      note: en ? t.noteEn : t.note,
      filterCol: t.filterCol,
      cols: t.cols.map((c) => ({ key: c.key, label: en ? c.labelEn : c.label })),
      rows: t.rows,
    })),
    figures: (d.figures ?? []).map((f) => toFigureView(f, en)),
    paramImages: (d.paramImages ?? []).map((p) => photoToView(p, en)),
    documentation: (d.documentation ?? []).map(({ titleEn, ...doc }) => ({
      ...doc,
      title: en ? titleEn : doc.title,
    })),
    accessoryImages: (d.accessoryImages ?? []).map((p) => photoToView(p, en)),
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

/** Series shown in a category listing — excludes accessory series (motor,
 *  cables) flagged `listed: false`, which are reached from the drive detail. */
export function getSeries(locale: Locale, category: SeriesCategory): SeriesView[] {
  return productSeries
    .filter((s) => s.category === category && s.listed !== false)
    .map((s) => toView(s, locale));
}

export function getSeriesCount(category: SeriesCategory): number {
  return productSeries.filter((s) => s.category === category && s.listed !== false).length;
}

/** Accessory series for a category — the unlisted companion parts (motor,
 *  cables) linked from a drive's detail page. */
export function getSeriesAccessories(locale: Locale, category: SeriesCategory): SeriesView[] {
  return productSeries
    .filter((s) => s.category === category && s.listed === false)
    .map((s) => toView(s, locale));
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
