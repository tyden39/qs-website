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

// Seed dates are pre-formatted display strings (e.g. "28 · 04 · 2026"); array
// order is already newest-first, so no re-sort is needed.
function toView(n: News): NewsView {
  return {
    slug: n.slug,
    title: n.title,
    excerpt: cleanExcerpt(n.excerpt, n.title),
    bodyHtml: n.body,
    bodyJson: null,
    coverImage: n.cover ?? null,
    category: n.cat,
    cat: n.cat,
    categoryId: CATEGORY_ID_BY_LABEL[n.cat] ?? "company",
    tags: n.tags ?? [],
    publishedAt: null,
    date: n.date,
  };
}

export function getAllNews(_locale: Locale): NewsView[] {
  return news.map(toView);
}

export function getNewsBySlug(slug: string, _locale: Locale): NewsView | null {
  const n = news.find((x) => x.slug === slug);
  return n ? toView(n) : null;
}

export function getNewsSlugs(): string[] {
  return news.map((n) => n.slug);
}
