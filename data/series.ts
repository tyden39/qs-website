/**
 * Drive-line series (QS Servo and Savch inverters) sold at series level: the
 * catalogue lists whole series (SDV3, S600…), not individual part numbers, so
 * the shape is a short positioning line plus series-wide spec rows.
 *
 * These deliberately do NOT reuse `CatalogProduct`: a series has no single
 * model designation, spec table preview or feature gallery — and unlike the
 * catalogue rows, series copy (applications, control modes) is prose, so each
 * series carries a full English spec array instead of a label map.
 */
import seriesData from "./series.json";

export type SeriesCategory = "servo" | "inverter";

/**
 * Sub-type inside a category. The servo set is browsed by part role — drive,
 * motor, cable (connectors ship with the cable sets, so they are listed there
 * rather than as a role of their own). Inverters are sold as one flat family
 * and carry no kind.
 */
export type SeriesKind = "driver" | "motor" | "cable";

/** A row in the series-level spec grid. */
export type SeriesSpec = { l: string; v: string };

export type SeriesPhoto = { src: string; w: number; h: number; alt: string; altEn: string };

/** One column of a model-selection table. `key` is stable/locale-neutral; the
 *  header label localizes. */
export type SeriesTableCol = { key: string; label: string; labelEn: string };

/**
 * A model-selection / part-number table on a series detail page. Rows are cell
 * arrays whose order matches `cols`; cells are pure alphanumerics (model codes,
 * ratings) so they stay locale-neutral — only caption/note/headers localize.
 * `filterCol` names a column whose distinct values drive filter chips (e.g.
 * supply voltage) so a long table stays browsable.
 */
export type SeriesModelTable = {
  caption: string;
  captionEn: string;
  note?: string;
  noteEn?: string;
  filterCol?: string;
  cols: SeriesTableCol[];
  rows: string[][];
};

/** Datasheet body of a series detail page. `naming` decodes the model code;
 *  `tables` are the selection/compatibility grids. Absent where a series has no
 *  per-model breakdown yet — the page then shows series-level specs only. */
export type SeriesDetail = {
  naming?: { code: string; lines: string[]; linesEn: string[] };
  tables: SeriesModelTable[];
};

export type ProductSeries = {
  slug: string;
  category: SeriesCategory;
  /** Sub-type section this series is listed under; omitted where the category
   *  is not subdivided (inverters). */
  kind?: SeriesKind;
  /** Brand line printed as the card's mono tag — "QS Servo" or "Savch". */
  brand: string;
  /** Series designation as the catalogue prints it — locale-neutral. */
  name: string;
  /** Positioning label under the brand tag ("Dòng nhỏ gọn"…). */
  tag: string;
  tagEn: string;
  desc: string;
  descEn: string;
  specs: SeriesSpec[];
  specsEn: SeriesSpec[];
  /** Render, once product photography lands; null shows the updating frame. */
  image: SeriesPhoto | null;
  /** Full datasheet body for the detail page; omitted while a series carries
   *  only series-level specs. */
  detail?: SeriesDetail;
  sourceUrl: string;
};

export const productSeries = seriesData as unknown as ProductSeries[];
