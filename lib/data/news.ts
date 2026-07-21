import { news, type News } from "@/data/news";
import type { Locale } from "@/lib/i18n/config";

export type NewsView = {
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  bodyJson: unknown | null;
  coverImage: string | null;
  category: string;
  cat: string;
  /** Locale-independent category key; pairs with the `news.list.tabs` order. */
  categoryId: NewsCategoryId;
  tags: string[];
  publishedAt: Date | null;
  date: string;
  /** Estimated reading time in minutes, derived from the article body. */
  readMinutes: number;
};

export type NewsCategoryId = "products" | "events" | "customers" | "technical" | "company";

// Seed categories are Vietnamese display strings; map them to stable ids so
// tab filtering works across locales without re-translating the data.
const CATEGORY_ID_BY_LABEL: Record<string, NewsCategoryId> = {
  "Sản phẩm mới": "products",
  "Sản phẩm": "products",
  "Sự kiện": "events",
  "Khách hàng": "customers",
  "Kỹ thuật": "technical",
  "Công ty": "company",
};

// Excerpts come from crawled content: the article title is often glued to the
// front, whitespace is collapsed oddly, and the text is cut mid-word with a
// dangling dash/quote. Normalize for card display so summaries read cleanly.
function cleanExcerpt(raw: string, title: string): string {
  let s = (raw ?? "").replace(/\s+/g, " ").trim();
  const t = title.replace(/\s+/g, " ").trim();
  // Drop a leading copy of the title (case/punctuation-insensitive prefix).
  if (t && s.toLowerCase().startsWith(t.toLowerCase())) {
    s = s.slice(t.length).replace(/^["'“”‘’\s:.,–—-]+/, "").trim();
  }
  // Trim trailing dangling punctuation/quotes/dashes left by the crawl cutoff.
  s = s.replace(/[\s"'“”‘’:,–—-]+$/, "").trim();
  // If it doesn't end on a sentence boundary, it was truncated — signal it.
  if (s && !/[.!?…]$/.test(s)) s += "…";
  return s;
}

// Estimate reading time from the article body: strip HTML tags, count words,
// divide by an average reading pace and round up (never below one minute).
function readingMinutes(bodyHtml: string): number {
  const text = (bodyHtml ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 1;
  const words = text.split(" ").length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Seed dates are display strings in `DD · MM · YYYY`. Parse them into a real
 * Date so the SEO layer has a machine-readable publish date — `Article`
 * structured data, the OG `article:published_time` tag, and the sitemap
 * `lastmod` all read this. Anchored at UTC noon so a timezone shift can never
 * roll the date onto an adjacent day.
 *
 * Returns null on a malformed date rather than an Invalid Date, since callers
 * guard on null and an Invalid Date would throw on `.toISOString()`.
 */
function parsePublishedAt(display: string): Date | null {
  const m = /^(\d{2}) · (\d{2}) · (\d{4})$/.exec(display);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), 12));
  return Number.isNaN(d.getTime()) ? null : d;
}

// Seed dates are pre-formatted display strings (e.g. "28 · 04 · 2026"); array
// order is already newest-first, so no re-sort is needed. Vietnamese is the
// primary copy; `*En` fields serve the `en` locale and fall back to Vietnamese
// per-field so a partially translated article still renders. The category id
// always derives from the Vietnamese label, keeping tab filtering stable.
function toView(n: News, locale: Locale): NewsView {
  const en = locale === "en";
  const title = (en ? n.titleEn : null) ?? n.title;
  const excerpt = (en ? n.excerptEn : null) ?? n.excerpt;
  const body = (en ? n.bodyEn : null) ?? n.body;
  const cat = (en ? n.catEn : null) ?? n.cat;
  return {
    slug: n.slug,
    title,
    excerpt: cleanExcerpt(excerpt, title),
    bodyHtml: body,
    bodyJson: null,
    coverImage: n.cover ?? null,
    category: cat,
    cat,
    categoryId: CATEGORY_ID_BY_LABEL[n.cat] ?? "company",
    tags: (en ? n.tagsEn : null) ?? n.tags ?? [],
    publishedAt: parsePublishedAt(n.date),
    date: n.date,
    readMinutes: readingMinutes(body),
  };
}

export function getAllNews(locale: Locale): NewsView[] {
  return news.map((n) => toView(n, locale));
}

export function getNewsBySlug(slug: string, locale: Locale): NewsView | null {
  const n = news.find((x) => x.slug === slug);
  return n ? toView(n, locale) : null;
}

export function getNewsSlugs(): string[] {
  return news.map((n) => n.slug);
}
