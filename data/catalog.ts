/**
 * Catalogue products outside the CNC controller line: DNC transfer units and
 * CNC accessories (expansion boards, cables, power supplies).
 *
 * These deliberately do NOT reuse `Product` from `./products`. A controller is
 * described by axes, display size, control-protocol columns and a machine kit;
 * a DB9 cable or a 12V adapter has none of those. Forcing them into one type
 * would leave most fields empty on most rows, so this is a flat spec-list shape
 * that both groups actually fill.
 *
 * Data now lives in `catalog.json` (edited by the internal admin app); this
 * module keeps the types and re-exports the JSON so consumers are unchanged.
 */
import catalogData from "./catalog.json";

/** Which listing tab a product belongs to. */
export type CatalogCategory = "dnc" | "accessory";

/** A row in the flat "Đặc tính kỹ thuật" table. */
export type CatalogSpec = { l: string; v: string };

export type CatalogPhoto = { src: string; w: number; h: number; alt: string; altEn: string };

/** A named capability with supporting copy, rendered as the feature list. */
export type CatalogFeature = {
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  /** Illustration for this feature, when the source page shipped one. */
  photo?: CatalogPhoto;
};

export type CatalogProduct = {
  slug: string;
  category: CatalogCategory;
  /** Model designation as the catalogue prints it — usually locale-neutral. */
  name: string;
  /** English name for the few accessories whose `name` is a Vietnamese phrase. */
  nameEn?: string;
  /** Short label above the name on cards. */
  tag: string;
  tagEn: string;
  desc: string;
  descEn: string;
  specs: CatalogSpec[];
  image: CatalogPhoto;
  features: CatalogFeature[];
  sourceUrl: string;
};

export const catalogProducts = catalogData as unknown as CatalogProduct[];
