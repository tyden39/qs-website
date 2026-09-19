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

/**
 * One entry in an overview section's list. `title` is optional because the two
 * shapes a catalogue section uses both land here: a named capability ("Đo chiều
 * dài dao theo trục Z" plus its explanation) and a bare bullet in a run-on list
 * ("Tính chiều dài hoặc độ lệch dụng cụ.").
 */
export type CatalogOverviewItem = {
  title?: string;
  titleEn?: string;
  body: string;
  bodyEn: string;
};

/**
 * A titled block of prose above the spec table — what the product does, how it
 * works. Distinct from `specsIntro`, which is a single lead paragraph the spec
 * band carries; a section can run several paragraphs and close on a list.
 */
export type CatalogOverviewSection = {
  heading: string;
  headingEn: string;
  body?: string[];
  bodyEn?: string[];
  items?: CatalogOverviewItem[];
  /** Shot that runs alongside this section's copy, where there is one. */
  photo?: CatalogPhoto;
};

/** The product's own video on the QS Technology YouTube channel. */
export type CatalogVideo = { youtubeId: string; title: string; titleEn: string };

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
  /** Prose bands between the hero and the spec table, where the catalogue
   *  documents the product at more length than the hero lede allows. */
  overview?: CatalogOverviewSection[];
  /** Lead paragraph above the spec table, where the catalogue wrote one. */
  specsIntro?: string;
  specsIntroEn?: string;
  /** Shot that runs alongside that paragraph — the board in situ, typically. */
  specsPhoto?: CatalogPhoto;
  image: CatalogPhoto;
  /** Extra hardware shots beyond `image` — port sides, rear face, mounting. */
  gallery?: CatalogPhoto[];
  features: CatalogFeature[];
  video?: CatalogVideo;
  sourceUrl: string;
};

export const catalogProducts = catalogData as unknown as CatalogProduct[];
