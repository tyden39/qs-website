import type { Locale } from "@/lib/i18n/config";
import { news, type News } from "@/data/news";

// View contract consumed by pages + SEO helpers. Source is now the static
// `data/news.ts` seed (single-language VI); EN reuses the same text.
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

// Seed stores the display date as "DD · MM · YYYY"; derive a real Date for
// structured-data (`datePublished`) and leave the display string untouched.
function parsePublishedAt(display: string): Date | null {
  const parts = display.split("·").map((p) => p.trim());
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map(Number);
  if (!dd || !mm || !yyyy) return null;
  return new Date(Date.UTC(yyyy, mm - 1, dd));
}

function toView(row: News): NewsView {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    bodyHtml: row.body,
    bodyJson: null,
    coverImage: null,
    category: row.cat,
    cat: row.cat,
    tags: row.tags ?? [],
    publishedAt: parsePublishedAt(row.date),
    date: row.date,
  };
}

export async function getAllNews(_locale: Locale): Promise<NewsView[]> {
  return news.map(toView);
}

export async function getNewsBySlug(slug: string, _locale: Locale): Promise<NewsView | null> {
  const row = news.find((n) => n.slug === slug);
  return row ? toView(row) : null;
}

export async function getNewsSlugs(): Promise<string[]> {
  return news.map((n) => n.slug);
}
