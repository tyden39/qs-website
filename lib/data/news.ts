import { cacheTag, cacheLife } from "next/cache";
import { and, eq, desc, count } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { news, type I18nText } from "@/lib/db/schema/catalog";
import type { Locale } from "@/lib/i18n/config";
import { pickLocale } from "./i18n-field";

// ── Admin helpers (not cached — always fresh for the admin console) ──────────

export type NewsAdminRow = {
  slug: string;
  titleVi: string;
  category: string;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
  tags: string[];
};

export async function getAllNewsForAdmin(): Promise<NewsAdminRow[]> {
  const rows = await db
    .select({
      slug: news.slug,
      title: news.title,
      category: news.category,
      status: news.status,
      publishedAt: news.publishedAt,
      updatedAt: news.updatedAt,
      tags: news.tags,
    })
    .from(news)
    .orderBy(desc(news.updatedAt));

  return rows.map((r) => ({
    slug: r.slug,
    titleVi: (r.title as I18nText).vi ?? r.slug,
    category: r.category,
    status: r.status,
    publishedAt: r.publishedAt,
    updatedAt: r.updatedAt,
    tags: r.tags ?? [],
  }));
}

export async function getNewsByIdForAdmin(slug: string) {
  const [row] = await db.select().from(news).where(eq(news.slug, slug)).limit(1);
  if (!row) return null;
  return row;
}

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

function formatDate(d: Date | null, locale: Locale): string {
  if (!d) return "";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  if (locale === "en") return `${yyyy}-${mm}-${dd}`;
  return `${dd} · ${mm} · ${yyyy}`;
}

function toView(row: typeof news.$inferSelect, locale: Locale): NewsView {
  const bodyJson = row.bodyJson as { vi?: unknown; en?: unknown } | null;
  return {
    slug: row.slug,
    title: pickLocale<string>(row.title as I18nText, locale) ?? row.slug,
    excerpt: pickLocale<string>(row.excerpt as I18nText, locale) ?? "",
    bodyHtml: pickLocale<string>(row.bodyHtml as I18nText, locale) ?? "",
    bodyJson: bodyJson ? (bodyJson[locale] ?? bodyJson.vi ?? null) : null,
    coverImage: row.coverImage,
    category: row.category,
    cat: row.category,
    tags: row.tags ?? [],
    publishedAt: row.publishedAt,
    date: formatDate(row.publishedAt, locale),
  };
}

export async function getAllNews(locale: Locale): Promise<NewsView[]> {
  "use cache";
  cacheTag("news");
  cacheLife("hours");
  const rows = await db
    .select()
    .from(news)
    .where(eq(news.status, "published"))
    .orderBy(desc(news.publishedAt));
  return rows.map((r) => toView(r, locale));
}

export async function getNewsBySlug(slug: string, locale: Locale): Promise<NewsView | null> {
  "use cache";
  cacheTag(`news:${slug}`);
  cacheLife("hours");
  const [row] = await db
    .select()
    .from(news)
    .where(and(eq(news.slug, slug), eq(news.status, "published")))
    .limit(1);
  return row ? toView(row, locale) : null;
}

export async function getNewsSlugs(): Promise<string[]> {
  "use cache";
  cacheTag("news");
  cacheLife("hours");
  const rows = await db.select({ slug: news.slug }).from(news).where(eq(news.status, "published"));
  return rows.map((r) => r.slug);
}

export async function getNewsCount(): Promise<number> {
  "use cache";
  cacheTag("news");
  cacheLife("minutes");
  const [{ value }] = await db.select({ value: count() }).from(news);
  return Number(value ?? 0);
}
