/**
 * Shape of a single searchable record in the prebuilt per-locale index
 * (`public/search-index.<locale>.json`, produced by scripts/build-search-index.ts).
 * Shared by the index builder, the Orama engine, and both UI surfaces.
 */
export type SearchType = "product" | "pdf" | "news" | "app" | "faq";

export interface SearchRecord {
  id: string;
  type: SearchType;
  title: string;
  excerpt: string;
  href: string;
  meta: string[];
  // Space-joined searchable text (lower-weighted than title in the ranker).
  keywords: string;
}
