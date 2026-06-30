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

// Seed dates are pre-formatted display strings (e.g. "28 · 04 · 2026"); array
// order is already newest-first, so no re-sort is needed.
function toView(n: News): NewsView {
  return {
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
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
