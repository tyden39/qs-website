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

/**
 * Final tilt by record kind. A model query ("sdv3", "f54") is a request for the
 * product, not for its twelve manuals: the library of per-series documents would
 * otherwise fill an entire results page on title matches alone and push the page
 * the visitor asked for out of sight. Pages rank first, their paperwork behind.
 */
const TYPE_WEIGHT: Record<SearchRecord["type"], number> = {
  product: 1,
  machine: 1,
  app: 1,
  service: 1,
  news: 0.9,
  pdf: 0.6,
};

export interface SearchDb {
  db: AnyOrama;
  /** record id → original (unfolded) record, for display. */
  byId: Map<string, SearchRecord>;
  /**
   * Folded short lines per record — the title and the meta line — for the fuzzy
   * subsequence pass. Meta joins the title because it is where the identifiers
   * sit (model code, axis count, series) and it is printed on the result card,
   * so a match there is a match the visitor can see.
   */
  titles: { id: string; parts: string[] }[];
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
 * A greedy left-to-right walk decides each candidate match, but the walk is
 * restarted from every position where the query's first character occurs and the
 * best result wins. Starting only at the first occurrence would score "sdv3"
 * against "QS servo SDV3" through the s of "QS" — a scattered path that scores
 * low or trips the density gate — and miss the tight run further along. The
 * targets here are one-line titles, so the extra passes cost nothing.
 */
export function fuzzyMatch(query: string, target: string): number | null {
  let best: number | null = null;
  for (let from = 0; from <= target.length - query.length; from++) {
    if (target[from] !== query[0]) continue;
    let qi = 0;
    let score = 0;
    let prev = -2;
    for (let ti = from; ti < target.length && qi < query.length; ti++) {
      if (target[ti] !== query[qi]) continue;
      let bonus = 1;
      if (ti === prev + 1) bonus += 4; // contiguous with previous match
      if (ti === 0 || /[\s/_.\-]/.test(target[ti - 1])) bonus += 6; // word boundary
      score += bonus;
      prev = ti;
      qi++;
    }
    if (qi < query.length) continue; // not a subsequence from here
    if (prev - from + 1 > query.length * 4) continue; // too scattered to be intentional
    if (best === null || score > best) best = score;
  }
  return best;
}

/** Build an in-memory Orama index from the fetched records. */
export async function createSearchDb(records: SearchRecord[]): Promise<SearchDb> {
  const db = create({ schema: SCHEMA });
  const byId = new Map<string, SearchRecord>();
  const titles: { id: string; parts: string[] }[] = [];
  const docs = records.map((r) => {
    byId.set(r.id, r);
    // Title and meta stay separate lines: the walk is greedy, so a code buried
    // after the title ("QS servo drive" · "SDV3") would otherwise be reached
    // through scattered earlier letters and thrown out as too spread apart.
    titles.push({
      id: r.id,
      parts: [r.title, r.meta.join(" ")].filter(Boolean).map(foldDiacritics),
    });
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

  // BM25 pass (token/prefix match), tried strictest-first and loosened only
  // when a step finds nothing.
  //
  // Vietnamese is why the order matters. Its words are one short syllable, so a
  // one-character typo tolerance turns "tần" into "tăng", "tân", "tấn", "tan"…
  // — matching a third of the index — and a union across words then ranks a
  // document holding one loose syllable above the page holding the whole phrase.
  // So: every word, spelled as typed, first; typo tolerance only if that finds
  // nothing; any single word last. The fuzzy pass below runs regardless, so a
  // compressed model code ("as10") is caught even when every step here misses.
  const params = {
    term,
    properties: SEARCH_FIELDS as unknown as string[],
    boost: BOOST,
    limit: cap,
  };
  let res = await search(db, { ...params, threshold: 0 });
  if (res.hits.length === 0) res = await search(db, { ...params, threshold: 0, tolerance: 1 });
  if (res.hits.length === 0) res = await search(db, { ...params, tolerance: 1 });
  const bm25 = new Map<string, number>();
  let maxBm = 0;
  for (const hit of res.hits) {
    const id = String(hit.id);
    bm25.set(id, hit.score);
    if (hit.score > maxBm) maxBm = hit.score;
  }

  // Fuzzy subsequence pass over each record's title and meta line, keeping the
  // better of the two. Spaces are stripped from the query so a spaced query
  // ("as 10") behaves like the glued form the user usually types.
  const fuzzy = new Map<string, number>();
  let maxFz = 0;
  if (term.length >= FUZZY_MIN_LEN) {
    const compact = term.replace(/\s+/g, "");
    for (const { id, parts } of titles) {
      let best: number | null = null;
      for (const part of parts) {
        const s = fuzzyMatch(compact, part);
        if (s !== null && (best === null || s > best)) best = s;
      }
      if (best === null) continue;
      fuzzy.set(id, best);
      if (best > maxFz) maxFz = best;
    }
  }

  // Blend the two normalised signals and rank the union of candidates.
  const ids = new Set<string>([...bm25.keys(), ...fuzzy.keys()]);
  const ranked = [...ids]
    .map((id) => {
      const b = maxBm ? (bm25.get(id) ?? 0) / maxBm : 0;
      const f = maxFz ? (fuzzy.get(id) ?? 0) / maxFz : 0;
      const weight = TYPE_WEIGHT[byId.get(id)?.type ?? "product"];
      return { id, score: (b + f * FUZZY_WEIGHT) * weight };
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
