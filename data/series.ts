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
  sourceUrl: string;
};

export const productSeries = seriesData as unknown as ProductSeries[];
