// Real downloadable assets served as static files from `public/downloads/`.
// Files are grouped into four categories shown as sections on the Downloads page.
// Display titles are composed in the UI from `model` + a localized doc-type
// label (see messages/*/downloads.json), so this data stays language-neutral.
//
// Data now lives in `downloads.json` (edited by the internal admin app); this
// module keeps the types and re-exports the JSON so consumers are unchanged.
import downloadsData from "./downloads.json";

export type DownloadExt = "PDF" | "ZIP";
export type DownloadLang = "vi" | "en";
export type DownloadCategory = "catalogue" | "operation" | "installation" | "software";

export type DownloadFile = {
  slug: string;
  ext: DownloadExt;
  category: DownloadCategory;
  /** Language-neutral model/product label, e.g. "F54", "Astro 10i". Null when a titleKey is used. */
  model: string | null;
  /** i18n key under `downloads.titles.*` for items whose name must be localized (catalogue). */
  titleKey?: string;
  lang: DownloadLang;
  version: string | null;
  /** Document date when encoded in the source filename (YYYY-MM-DD). */
  date: string | null;
  sizeBytes: number;
  fileUrl: string;
  /** Links the file to a product detail page when applicable. */
  productSlug?: string;
};

export const downloads = downloadsData as unknown as DownloadFile[];
