/**
 * Client-side search engine backed by Orama (in-browser, no server runtime —
 * the site is a static export). It ranks the prebuilt per-locale index with
 * BM25, matches word prefixes as-you-type, and tolerates single-character
 * typos, giving the header autocomplete and the results page the same
 * Elasticsearch-style behaviour without any backend.
 *
 * On top of BM25 it runs a VS Code / fzf style fuzzy *subsequence* pass over
 * the (short) record titles. That is what lets a compressed query like "as10"
 * reach "Astro 10i": a, s, 1, 0 appear in order inside the title even though
 * BM25 tokenisation never produces an "as10" token. The two signals are
 * normalised and blended so titles still rank by relevance, not by which pass
 * happened to match.
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

// How much a perfect fuzzy-title match counts relative to a perfect BM25 hit
// (both normalised to [0,1] first). ~1.0 lets a strong title match stand in
// when BM25 finds nothing (e.g. "as10"), without drowning real content hits.
const FUZZY_WEIGHT = 1;
// Skip the fuzzy pass for a single character — every title trivially matches it.
const FUZZY_MIN_LEN = 2;

export interface SearchDb {
  db: AnyOrama;
  /** record id → original (unfolded) record, for display. */
  byId: Map<string, SearchRecord>;
  /** Folded titles, for the fuzzy subsequence pass (short strings only). */
  titles: { id: string; folded: string }[];
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

/**
 * Fuzzy subsequence score (VS Code / fzf style). `query` must appear in order
 * inside `target` — gaps allowed — or the match is rejected (null). The score
 * rewards contiguous runs and matches at word boundaries so tight, model-code
 * style matches outrank scattered ones. A density gate drops matches whose
 * characters are spread too far apart to be intentional, which keeps the pass
 * from polluting results with accidental subsequences in long prose titles.
 *
 * Uses a greedy left-to-right walk: it always detects a subsequence when one
 * exists; only the score (not the yes/no) is slightly non-optimal versus the
 * full dynamic-programming variant, which is fine for these short titles.
 */
export function fuzzyMatch(query: string, target: string): number | null {
  let qi = 0;
  let score = 0;
  let prev = -2;
  let start = -1;
  for (let ti = 0; ti < target.length && qi < query.length; ti++) {
    if (target[ti] !== query[qi]) continue;
    if (start < 0) start = ti;
    let bonus = 1;
    if (ti === prev + 1) bonus += 4; // contiguous with previous match
    if (ti === 0 || /[\s/_.\-]/.test(target[ti - 1])) bonus += 6; // word boundary
    score += bonus;
    prev = ti;
    qi++;
  }
  if (qi < query.length) return null; // not a subsequence
  const span = prev - start + 1;
  if (span > query.length * 4) return null; // too scattered to be intentional
  return score;
}

/** Build an in-memory Orama index from the fetched records. */
export async function createSearchDb(records: SearchRecord[]): Promise<SearchDb> {
  const db = create({ schema: SCHEMA });
  const byId = new Map<string, SearchRecord>();
  const titles: { id: string; folded: string }[] = [];
  const docs = records.map((r) => {
    byId.set(r.id, r);
    titles.push({ id: r.id, folded: foldDiacritics(r.title) });
    return {
      id: r.id,
      title: foldDiacritics(r.title),
      keywords: foldDiacritics(r.keywords),
      excerpt: foldDiacritics(r.excerpt),
    };
  });
  await insertMultiple(db, docs);
  return { db, byId, titles };
}

/** Ranked matches for a raw query, best first (empty for a blank query). */
export async function searchDb(
  { db, byId, titles }: SearchDb,
  query: string,
  limit: number,
): Promise<SearchRecord[]> {
  const term = foldDiacritics(query).trim();
  if (!term) return [];

  // The index is small, so pull a generous set of BM25 hits and rank the merged
  // candidate set client-side; the caller's `limit` is applied at the very end.
  const cap = Math.max(limit, 200);

  // BM25 pass (token/prefix match with single-char typo tolerance).
  const res = await search(db, {
    term,
    properties: SEARCH_FIELDS as unknown as string[],
    boost: BOOST,
    tolerance: 1,
    limit: cap,
  });
  const bm25 = new Map<string, number>();
  let maxBm = 0;
  for (const hit of res.hits) {
    const id = String(hit.id);
    bm25.set(id, hit.score);
    if (hit.score > maxBm) maxBm = hit.score;
  }

  // Fuzzy subsequence pass over titles. Spaces are stripped from the query so a
  // spaced query ("as 10") behaves like the glued form the user usually types.
  const fuzzy = new Map<string, number>();
  let maxFz = 0;
  if (term.length >= FUZZY_MIN_LEN) {
    const compact = term.replace(/\s+/g, "");
    for (const { id, folded } of titles) {
      const s = fuzzyMatch(compact, folded);
      if (s === null) continue;
      fuzzy.set(id, s);
      if (s > maxFz) maxFz = s;
    }
  }

  // Blend the two normalised signals and rank the union of candidates.
  const ids = new Set<string>([...bm25.keys(), ...fuzzy.keys()]);
  const ranked = [...ids]
    .map((id) => {
      const b = maxBm ? (bm25.get(id) ?? 0) / maxBm : 0;
      const f = maxFz ? (fuzzy.get(id) ?? 0) / maxFz : 0;
      return { id, score: b + f * FUZZY_WEIGHT };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const out: SearchRecord[] = [];
  for (const { id } of ranked) {
    const rec = byId.get(id);
    if (rec) out.push(rec);
  }
  return out;
}
