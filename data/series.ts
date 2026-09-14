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
 * Part role a series plays — drive, motor, cable (connectors ship with the
 * cable sets, so they are not a role of their own). Kept as data only: the
 * catalogue lists every series of a category in one flat list, so the role no
 * longer splits the listing into sections.
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

/**
 * A datasheet figure from the manufacturer. Unlike `SeriesPhoto` these carry
 * baked-in text, so each locale needs its own file rather than just its own
 * `alt`: `src` is the Vietnamese edition, `srcEn` the manufacturer's English
 * original.
 */
export type SeriesFigure = {
  src: string;
  srcEn: string;
  w: number;
  h: number;
  alt: string;
  altEn: string;
};

/** One chunk of a model code plus the label that decodes it. `text` is printed
 *  verbatim as part of the code, so it stays locale-neutral. */
export type SeriesCodeSegment = { text: string; label: string; labelEn: string };

/** A downloadable document catalogued from the manufacturer's 资料下载 tab.
 *  The file itself is mirrored into `public/downloads/series/<slug>/`, so `url`
 *  is a site-relative path — serving it ourselves keeps the download at our own
 *  edge instead of the manufacturer's origin. `lang` is the document's own
 *  language (the file itself), independent of the display `title`, which is
 *  localized (`title` Vietnamese, `titleEn` English). Manufacturer document
 *  names are English-only in practice, so `titleEn` is optional and the view
 *  falls back to `title`. */
export type SeriesDocumentation = {
  title: string;
  titleEn?: string;
  category: "manual" | "drawing" | "software" | "brochure" | "certificate";
  lang: "zh" | "en" | "vi" | "id";
  url: string;
  format: "pdf" | "rar" | "zip";
  size_mb?: number;
  date?: string;
  /** Set on the slices of a document that ships in parts — an archive too large
   *  for the static host's per-file ceiling, split along a seam the content
   *  already has (one CAD model per inverter frame size). Slices carrying the
   *  same `group` share one `title` and collapse into a single expandable row;
   *  `part` names the slice ("Size 1 (4T0.75G-4T2.2G)") and stays
   *  locale-neutral, being model codes throughout. */
  group?: string;
  part?: string;
};

/** One feature group inside the rebuilt introduction — a heading plus its
 *  bullet items, each carried in both site languages. Text-only manufacturer
 *  graphics (feature lists, callout blocks) are re-authored as this structured
 *  content rather than shown as Chinese images, so they render as native,
 *  selectable, responsive HTML. */
export type SeriesIntroSection = {
  title: string;
  titleEn: string;
  items: { t: string; tEn: string }[];
};

/** Rebuilt 产品介绍 content: an opening line, an optional applications line, and
 *  the manufacturer's feature groups — all bilingual, all native HTML. */
export type SeriesIntro = {
  lead: string;
  leadEn: string;
  applications?: string;
  applicationsEn?: string;
  sections: SeriesIntroSection[];
};

/**
 * ── Spec-sheet blocks ──────────────────────────────────────────────────────
 * The manufacturer's 产品参数 / 可选配件 plates are flat images with baked-in
 * Chinese text. Rather than overlay-translate the whole plate, the text-and-
 * table plates are re-authored as an ordered list of native, bilingual blocks
 * (`specSheet` / `accessorySheet`); genuine artwork — dimension drawings, cable
 * illustrations — is cropped out of the plate and carried through as an `image`
 * block so the drawing itself is never redrawn. A series with a sheet renders it
 * in place of the corresponding image strip; a series without one falls back to
 * the plate images.
 *
 * Localized strings inside blocks carry both languages as a `{ vi, en }` pair:
 * the block data nests deep enough that parallel `*_En` fields would read far
 * worse than one pair per string. The view layer resolves each pair to the
 * active locale.
 */
export type Loc = { vi: string; en: string };

/** One body cell of a parameter table. A bare string fills a single model
 *  column; the object form spans `cs` columns — the manufacturer merges shared
 *  ratings (insulation class, brake voltage) across every model of a frame. */
export type SheetCell =
  | string
  | { v: string; cs?: number }
  /** A value that reads differently per locale (e.g. a cooling method). Resolved
   *  to a plain `{ v, cs }` cell at the view layer. */
  | { vi: string; en: string; cs?: number };

/** A body row of a transposed parameter table: a localized row label, an
 *  optional unit printed beneath it, then one cell per model column. */
export type SheetParamRow = { label: Loc; unit?: string; cells: SheetCell[] };

/** A run of parameter rows sharing an optional vertical group label on the far
 *  left — the manufacturer's rotated spanning cells (位置控制, 永磁抱闸…). */
export type SheetParamGroup = { vlabel?: Loc; rows: SheetParamRow[] };

/** A row of the item/value spec list (the general-spec plate): a localized item
 *  label and its value as one or more localized lines. */
export type SheetSpecRow = { item: Loc; lines: Loc[] };

/** A run of spec rows sharing an optional vertical group label on the far left. */
export type SheetSpecGroup = { vlabel?: Loc; rows: SheetSpecRow[] };

/** One branch of a model-code decode diagram: the code chunk it points at, the
 *  meaning of that position, and any enumerated values under it. */
export type SheetNamingBranch = { seg: string; label: Loc; options?: Loc[] };

/** One row of the cable reference table: the cable model code, an optional
 *  bracket sub-label (with/without brake), the cropped illustration(s) of the
 *  cable, and the motor range it fits (which spans several rows via `fitRows`). */
export type SheetCableRow = {
  model: string;
  bracket?: Loc;
  images: { src: string; w: number; h: number }[];
  /** Compatible motor range, printed once and spanning `fitRows` rows. Present
   *  only on the first row of each span. */
  fit?: Loc;
  fitRows?: number;
};

export type SheetBlock =
  | { kind: "heading"; text: Loc; sub?: Loc }
  | { kind: "note"; text: Loc }
  /** A bullet list — the manufacturer's feature plates state each capability as
   *  its own line, so they read as a list rather than a paragraph. */
  | { kind: "bullets"; title?: Loc; items: Loc[] }
  /** The manufacturer's feature plate: a run of capability groups, each a
   *  full-width titled band over its own bullet list. Kept as one block because
   *  the bands read as a single stacked unit — unlike `intro.sections`, which
   *  summarises a series in a card row. */
  | { kind: "featureGroups"; groups: { title: Loc; items: Loc[] }[] }
  /** `note` is a remark about this drawing specifically (a fitting constraint, a
   *  cable requirement); it prints inside the figure's frame so it cannot be
   *  read as belonging to whatever block follows. */
  | { kind: "image"; src: string; w: number; h: number; alt: Loc; caption?: Loc; note?: Loc }
  /** Two or three drawings that belong side by side — the manufacturer prints
   *  the front views of several frame sizes on one line to be compared. */
  | {
      kind: "imageRow";
      images: { src: string; w: number; h: number; alt: Loc; caption?: Loc }[];
    }
  | { kind: "naming"; code: string; branches: SheetNamingBranch[] }
  | {
      kind: "specList";
      itemHeader: Loc;
      valueHeader: Loc;
      groups: SheetSpecGroup[];
    }
  | {
      kind: "paramTable";
      /** Label above the table, where a heading covers several tables at once
       *  (the inverter's per-supply rating tables). */
      title?: Loc;
      itemHeader?: Loc;
      /** Spanning header over the model columns (产品参数 tables). Omit for the
       *  dimension L-tables, whose model codes are the only header row. */
      modelHeader?: Loc;
      /** The family's part-number pattern ("S600/E-2T***G"), printed as the row
       *  that heads the model columns — the manufacturer names the family once
       *  and lets each column carry only the part of the code that varies. Where
       *  it is absent the model columns head themselves. */
      modelPattern?: string;
      models: string[];
      groups: SheetParamGroup[];
    }
  | {
      kind: "cableTable";
      cols: { model: Loc; style: Loc; fit: Loc };
      rows: SheetCableRow[];
    }
  /** A generic multi-column text table (fault-code lists, parameter-function
   *  grids) that is neither an item/value spec list nor a transposed parameter
   *  grid. `cols` are the header labels; each row is one localized cell per
   *  column. A row cell may span columns via `{ c, cs }`. */
  | {
      kind: "dataTable";
      title?: Loc;
      cols: Loc[];
      rows: { cells: (Loc | { c: Loc; cs?: number })[] }[];
    }
  /** A responsive grid of product cards — an option-board / accessory catalogue
   *  where each item is a cropped thumbnail plus a localized name, description,
   *  and language-neutral tags (part number, mounting slot). */
  | {
      kind: "cardGrid";
      items: {
        src: string;
        w: number;
        h: number;
        title: Loc;
        desc?: Loc;
        tags?: string[];
      }[];
    };

/** Datasheet body of a series detail page. `naming` decodes the model code;
 *  `tables` are the selection/compatibility grids; `figures` are the scanned
 *  datasheet plates that carry no machine-readable equivalent. Absent where a
 *  series has no per-model breakdown yet — the page then shows series-level
 *  specs only.
 *
 *  `intro` is the re-authored bilingual 产品介绍 content. `paramImages` and
 *  `accessoryImages` mirror the manufacturer's 产品参数 / 可选配件 galleries,
 *  downloaded and re-hosted locally as WebP; text-only plates among them are
 *  progressively replaced by native tables/figures, photo-style plates keep the
 *  overlay-localized image. */
export type SeriesDetail = {
  /** `figure` is the manufacturer's own decode diagram, which reads better than
   *  the prose breakdown because each label points at the character it decodes.
   *  Where it exists it replaces `lines`; series without one still render the
   *  prose. */
  naming?: {
    code: string;
    lines: string[];
    linesEn: string[];
    figure?: SeriesFigure;
    /** The code split into its meaningful chunks, each with the label that
     *  decodes it. Used where the manufacturer publishes no decode diagram —
     *  the page then draws one from this instead of listing prose. Takes
     *  precedence over `lines`, and `figure` over both. */
    segments?: SeriesCodeSegment[];
  };
  /** 产品介绍 — re-authored bilingual introduction content. */
  intro?: SeriesIntro;
  /** Re-authored 产品介绍 detail: the feature plates whose copy is interleaved
   *  with a diagram, rebuilt as native bilingual blocks and rendered under the
   *  Introduction tab beneath `intro`. The diagrams themselves ride along as
   *  `image` blocks so each one stays beside the text it illustrates. */
  introSheet?: SheetBlock[];
  /** 产品介绍 gallery — the manufacturer's introduction plates (product
   *  diagrams, wiring/topology charts, brochure pages) that are not pure text,
   *  shown under the Introduction tab beneath the re-authored `intro` copy.
   *  Pure-text plates are re-authored into `intro` instead of kept here. */
  introduction?: SeriesPhoto[];
  /** Selection / compatibility grids. Omitted where the per-model data lives in
   *  the rebuilt `specSheet` instead — carrying both would print the same
   *  ratings twice on one tab. */
  tables?: SeriesModelTable[];
  figures?: SeriesFigure[];
  /** 产品参数 gallery — spec sheets published as images, shown under the
   *  Specifications tab below the machine-readable series specs. */
  paramImages?: SeriesPhoto[];
  /** Re-authored 产品参数 sheet: text/table plates rebuilt as native bilingual
   *  blocks, rendered under the Specifications tab after the naming decode and
   *  selection tables. Cropped drawings ride along as `image` blocks; whatever
   *  plates have not been rebuilt yet stay in `paramImages` beneath it. */
  specSheet?: SheetBlock[];
  /** 资料下载 — downloadable documents (URL catalogue only). */
  documentation?: SeriesDocumentation[];
  /** 可选配件 gallery — the manufacturer's optional-accessory strip. */
  accessoryImages?: SeriesPhoto[];
  /** Re-authored 可选配件 sheet: renders in place of `accessoryImages`. */
  accessorySheet?: SheetBlock[];
};

export type ProductSeries = {
  slug: string;
  category: SeriesCategory;
  /** Sub-type section this series is listed under; omitted where the category
   *  is not subdivided (inverters). */
  kind?: SeriesKind;
  /** Whether this series appears in the category listing. Accessory series
   *  (servo motor, cables) set this false: they are companion parts surfaced
   *  from the drive detail page, not standalone list cards. Defaults to true. */
  listed?: boolean;
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
