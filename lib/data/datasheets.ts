import { cacheTag, cacheLife } from "next/cache";
import { and, eq, asc, count, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { datasheet, type I18nText } from "@/lib/db/schema/catalog";
import type { Locale } from "@/lib/i18n/config";
import { pickLocale } from "./i18n-field";

export type DatasheetView = {
  slug: string;
  name: string;
  fileUrl: string;
  productSlug: string | null;
  category: string;
  series: string;
  lang: "vi" | "en" | "both";
  ext: string;
  version: string | null;
  docDate: Date | null;
  sizeBytes: number;
  featured: boolean;
};

function toView(row: typeof datasheet.$inferSelect, locale: Locale): DatasheetView {
  return {
    slug: row.slug,
    name: pickLocale<string>(row.name as I18nText, locale) ?? row.slug,
    fileUrl: row.fileUrl,
    productSlug: row.productSlug,
    category: row.category,
    series: row.series,
    lang: row.lang,
    ext: row.ext,
    version: row.version,
    docDate: row.docDate,
    sizeBytes: row.sizeBytes,
    featured: Boolean(row.featured),
  };
}

function langFilter(locale: Locale) {
  return or(eq(datasheet.lang, locale), eq(datasheet.lang, "both"));
}

export async function getAllDatasheets(locale: Locale): Promise<DatasheetView[]> {
  "use cache";
  cacheTag("datasheets");
  cacheLife("hours");
  const rows = await db
    .select()
    .from(datasheet)
    .where(and(eq(datasheet.status, "published"), langFilter(locale)))
    .orderBy(asc(datasheet.sort), sql`${datasheet.docDate} DESC NULLS LAST`);
  return rows.map((r) => toView(r, locale));
}

export async function getDatasheetsForProduct(productSlug: string, locale: Locale): Promise<DatasheetView[]> {
  "use cache";
  cacheTag(`datasheets:product:${productSlug}`);
  cacheLife("hours");
  const rows = await db
    .select()
    .from(datasheet)
    .where(
      and(
        eq(datasheet.status, "published"),
        eq(datasheet.productSlug, productSlug),
        langFilter(locale),
      ),
    )
    .orderBy(asc(datasheet.sort));
  return rows.map((r) => toView(r, locale));
}

export async function getDatasheetCount(): Promise<number> {
  "use cache";
  cacheTag("datasheets");
  cacheLife("minutes");
  const [{ value }] = await db.select({ value: count() }).from(datasheet);
  return Number(value ?? 0);
}
