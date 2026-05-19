import { cacheTag, cacheLife } from "next/cache";
import { and, eq, asc, count, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { product, type I18nText, type ProductSpec, type ProductImage } from "@/lib/db/schema/catalog";
import type { Locale } from "@/lib/i18n/config";
import { pickLocale } from "./i18n-field";

export type ProductView = {
  slug: string;
  series: string;
  axes: string;
  display: string;
  badge: string | null;
  tag: string;
  name: string;
  desc: string;
  bullets: string[];
  specs: ProductSpec[];
  images: { url: string; alt: string }[];
  sort: number;
  publishedAt: Date | null;
};

function toView(row: typeof product.$inferSelect, locale: Locale): ProductView {
  return {
    slug: row.slug,
    series: row.series,
    axes: row.axes,
    display: row.display,
    badge: row.badge,
    tag: pickLocale<string>(row.tag as I18nText, locale) ?? "",
    name: pickLocale<string>(row.name as I18nText, locale) ?? row.slug,
    desc: pickLocale<string>(row.desc as I18nText, locale) ?? "",
    bullets: (row.bullets as I18nText[]).map((b) => pickLocale<string>(b, locale) ?? "").filter(Boolean),
    specs: row.specs as ProductSpec[],
    images: (row.images as ProductImage[]).map((img) => ({
      url: img.url,
      alt: pickLocale<string>(img.alt, locale) ?? "",
    })),
    sort: row.sort,
    publishedAt: row.publishedAt,
  };
}

export async function getAllProducts(locale: Locale): Promise<ProductView[]> {
  "use cache";
  cacheTag("products");
  cacheLife("hours");
  const rows = await db
    .select()
    .from(product)
    .where(eq(product.status, "published"))
    .orderBy(asc(product.sort), asc(product.slug));
  return rows.map((r) => toView(r, locale));
}

export async function getProductBySlug(slug: string, locale: Locale): Promise<ProductView | null> {
  "use cache";
  cacheTag(`product:${slug}`);
  cacheLife("hours");
  const [row] = await db
    .select()
    .from(product)
    .where(and(eq(product.slug, slug), eq(product.status, "published")))
    .limit(1);
  return row ? toView(row, locale) : null;
}

export async function getProductSlugs(): Promise<string[]> {
  "use cache";
  cacheTag("products");
  cacheLife("hours");
  const rows = await db
    .select({ slug: product.slug })
    .from(product)
    .where(eq(product.status, "published"));
  return rows.map((r) => r.slug);
}

export async function getProductCount(): Promise<number> {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");
  const [{ value }] = await db.select({ value: count() }).from(product);
  return Number(value ?? 0);
}

// ── Admin-side helpers (no cache — mutations need fresh data) ────────────────

export type ProductAdminRow = typeof product.$inferSelect;

export async function getAllProductsForAdmin(): Promise<ProductAdminRow[]> {
  return db.select().from(product).orderBy(desc(product.updatedAt));
}

export async function getProductByIdForAdmin(
  slug: string,
): Promise<ProductAdminRow | null> {
  const [row] = await db
    .select()
    .from(product)
    .where(eq(product.slug, slug))
    .limit(1);
  return row ?? null;
}
