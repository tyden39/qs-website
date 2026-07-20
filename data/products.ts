// Product catalogue data now lives in `products.json` / `hero-triptych.json`
// (edited by the internal admin app). This module keeps the TypeScript types
// and re-exports the JSON so every consumer and the compiler are unchanged.
import productsData from "./products.json";
import heroTriptychData from "./hero-triptych.json";

export type KitIcon =
  | "controller"
  | "drive"
  | "motor"
  | "psu"
  | "mpg"
  | "ioboard"
  | "toolsetter"
  | "probe";

/** Transparent front-face render with intrinsic pixel dimensions. */
export type ProductPhoto = { src: string; w: number; h: number };

/**
 * A component shipped in the kit. `icon` is the schematic SVG fallback;
 * `photo` is the real product render shown when available.
 */
export type KitItem = { label: string; icon: KitIcon; photo?: ProductPhoto };
/**
 * `place` pins where a photo shows:
 *   - "hero" — the single lead image at the top (first hero wins if several)
 *   - "tour" — the "product in detail" grid below
 *   - "hide" — kept in data but not rendered
 * Omit it to let the page decide from the alt text (see classifyShot).
 */
export type GalleryPlace = "hero" | "tour" | "hide";
export type ProductGalleryPhoto = { src: string; w: number; h: number; alt: string; place?: GalleryPlace };

/**
 * The three studio renders shown in the detail-page hero, in display order:
 * front face, rear face, and the controller installed on a machine. Sourced
 * from `images-origin/<model>/` and keyed by product slug.
 */
export type HeroTriptych = { front: ProductPhoto; rear: ProductPhoto; machine: ProductPhoto };

export const HERO_TRIPTYCH = heroTriptychData as unknown as Record<string, HeroTriptych>;

/** A control-interface column in the spec table (catalogue order). */
export type SpecColumn = { name: string; note?: string };

/**
 * A spec row. `v` is either a single value spanning every interface column, or
 * one value per interface column (array length must equal `interfaces.length`).
 */
export type ProductSpec = { l: string; v: string | string[] };

/**
 * A control-protocol column in the spec datasheet (from the QS spec workbook —
 * one sheet per product×protocol). `name` is the protocol, `loop` the control
 * loop mode shown under it. Products publish 1-2 columns.
 */
export type SpecCol = { name: string; loop: string };
/** A spec category (General / Hardware / Software) with its rows. */
export type SpecSection = { title: string; rows: ProductSpec[] };
/**
 * The full technical-spec datasheet: protocol columns plus grouped rows. A
 * row's `v` is one value spanning every column, or one value per column (array
 * length must equal `cols.length`); "—" marks a value that column lacks.
 */
export type ProductSpecSheet = { cols: SpecCol[]; sections: SpecSection[] };

export type Product = {
  slug: string;
  name: string;
  axes: string;
  display: string;
  tag: string;
  series: "F" | "Astro";
  badge?: string;
  desc: string;
  bullets: string[];
  /** English copy, served on the `en` locale (Vietnamese fields stay primary). */
  tagEn: string;
  descEn: string;
  bulletsEn: string[];
  /** Control-interface columns the spec table is split into. */
  interfaces: SpecColumn[];
  specs: ProductSpec[];
  /** Front-face controller render used as the card thumbnail. */
  image: ProductPhoto;
  /** Components shipped in the machine kit built around this controller. */
  bundle: KitItem[];
  /** Legacy QS product-page enrichment, merged here without replacing curated catalogue fields. */
  overview?: string;
  /** English overview, served on the `en` locale (Vietnamese `overview` stays primary). */
  overviewEn?: string;
  highlights?: string[];
  /** English highlights, served on the `en` locale (Vietnamese `highlights` stays primary). */
  highlightsEn?: string[];
  /** Lead photo shown in the overview's right column. Optional — falls back to a placeholder. */
  overviewImage?: ProductPhoto;
  /** Product video (YouTube) rendered below the photo tour in the overview tab. */
  video?: { youtubeId: string; title?: string };
  gallery?: ProductGalleryPhoto[];
  documents?: string[];
  software?: string[];
  accessories?: string[];
  sourceUrl?: string;
  specSheet?: ProductSpecSheet;
  gCodes?: string[];
};

// Specs and bundles follow the QS "CNC Solution Controller" catalogue: only the
// axis count, control loop, and control interface are published per model.
export const products = productsData as unknown as Product[];
