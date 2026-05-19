import { cacheTag, cacheLife } from "next/cache";
import { and, eq, asc, count } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  application,
  type I18nText,
  type ApplicationWorkflow,
  type ApplicationDeployment,
} from "@/lib/db/schema/catalog";
import type { Locale } from "@/lib/i18n/config";
import { pickLocale } from "./i18n-field";

export type ApplicationView = {
  slug: string;
  title: string;
  summary: string;
  heroImage: string | null;
  workflow: { n: string; label: string; title: string; desc: string }[];
  specs: { label: string; value: string }[];
  deployments: { name: string; loc: string }[];
  sort: number;
};

function toView(row: typeof application.$inferSelect, locale: Locale): ApplicationView {
  const workflow = (row.workflow as ApplicationWorkflow[]).map((s) => ({
    n: s.n,
    label: pickLocale<string>(s.label, locale) ?? "",
    title: pickLocale<string>(s.title, locale) ?? "",
    desc: pickLocale<string>(s.desc, locale) ?? "",
  }));
  const specs = (row.specs as Array<{ label: I18nText; value: I18nText }>).map((s) => ({
    label: pickLocale<string>(s.label, locale) ?? "",
    value: pickLocale<string>(s.value, locale) ?? "",
  }));
  const deployments = (row.deployments as ApplicationDeployment[]).map((d) => ({
    name: d.name,
    loc: pickLocale<string>(d.loc, locale) ?? "",
  }));
  return {
    slug: row.slug,
    title: pickLocale<string>(row.title as I18nText, locale) ?? row.slug,
    summary: pickLocale<string>(row.summary as I18nText, locale) ?? "",
    heroImage: row.heroImage,
    workflow,
    specs,
    deployments,
    sort: row.sort,
  };
}

export async function getAllApplications(locale: Locale): Promise<ApplicationView[]> {
  "use cache";
  cacheTag("applications");
  cacheLife("hours");
  const rows = await db
    .select()
    .from(application)
    .where(eq(application.status, "published"))
    .orderBy(asc(application.sort), asc(application.slug));
  return rows.map((r) => toView(r, locale));
}

export async function getApplicationBySlug(slug: string, locale: Locale): Promise<ApplicationView | null> {
  "use cache";
  cacheTag(`application:${slug}`);
  cacheLife("hours");
  const [row] = await db
    .select()
    .from(application)
    .where(and(eq(application.slug, slug), eq(application.status, "published")))
    .limit(1);
  return row ? toView(row, locale) : null;
}

export async function getApplicationSlugs(): Promise<string[]> {
  "use cache";
  cacheTag("applications");
  cacheLife("hours");
  const rows = await db
    .select({ slug: application.slug })
    .from(application)
    .where(eq(application.status, "published"));
  return rows.map((r) => r.slug);
}

export async function getApplicationCount(): Promise<number> {
  "use cache";
  cacheTag("applications");
  cacheLife("minutes");
  const [{ value }] = await db.select({ value: count() }).from(application);
  return Number(value ?? 0);
}
