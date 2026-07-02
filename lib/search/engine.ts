/**
 * Client-side search engine backed by Orama (in-browser, no server runtime —
 * the site is a static export). It ranks the prebuilt per-locale index with
 * BM25, matches word prefixes as-you-type, and tolerates single-character
 * typos, giving the header autocomplete and the results page the same
 * Elasticsearch-style behaviour without any backend.
 *
 * Language: every indexed field and every query is diacritic-folded, so a
 * Vietnamese query works with or without accents ("dieu khien" ≈ "điều khiển")
 * while English is unaffected. Folded text is used only for matching; the
 * original record (kept in `byId`) is what the UI renders.
 */
import { create, insertMultiple, search, type AnyOrama } from "@orama/orama";
import type { SearchRecord } from "./types";

export type { SearchRecord, SearchType } from "./types";

const SCHEMA = { title: "string", keywords: "string", excerpt: "string" } as const;
const SEARCH_FIELDS = ["title", "keywords", "excerpt"] as const;
// Field weights mirror the previous scorer: title ≫ keywords > excerpt.
const BOOST = { title: 3, keywords: 2, excerpt: 1 } as const;

export interface SearchDb {
  db: AnyOrama;
  /** record id → original (unfolded) record, for display. */
  byId: Map<string, SearchRecord>;
}

/**
 * Diacritic-insensitive folding. Decomposes accents (NFD) and drops the
 * combining marks, then maps đ/Đ (which have no decomposition) to d. A no-op
 * for plain ASCII.
 */
export function foldDiacritics(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();
}

/** Build an in-memory Orama index from the fetched records. */
export async function createSearchDb(records: SearchRecord[]): Promise<SearchDb> {
  const db = create({ schema: SCHEMA });
  const byId = new Map<string, SearchRecord>();
  const docs = records.map((r) => {
    byId.set(r.id, r);
    return {
      id: r.id,
      title: foldDiacritics(r.title),
      keywords: foldDiacritics(r.keywords),
      excerpt: foldDiacritics(r.excerpt),
    };
  });
  await insertMultiple(db, docs);
  return { db, byId };
}

/** Ranked matches for a raw query, best first (empty for a blank query). */
export async function searchDb(
  { db, byId }: SearchDb,
  query: string,
  limit: number,
): Promise<SearchRecord[]> {
  const term = foldDiacritics(query).trim();
  if (!term) return [];
  const res = await search(db, {
    term,
    properties: SEARCH_FIELDS as unknown as string[],
    boost: BOOST,
    tolerance: 1,
    limit,
  });
  const out: SearchRecord[] = [];
  for (const hit of res.hits) {
    const rec = byId.get(String(hit.id));
    if (rec) out.push(rec);
  }
  return out;
}
