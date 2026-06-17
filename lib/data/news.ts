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
  tags: string[];
  publishedAt: Date | null;
  date: string;
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
    coverImage: null,
    category: n.cat,
    cat: n.cat,
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
