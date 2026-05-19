import { cacheTag, cacheLife } from "next/cache";
import { and, eq, asc, count } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  service,
  type I18nText,
  type ServiceProcessStep,
  type ServiceIncluded,
  type ServiceFaq,
  type ServiceTier,
  type ServiceStat,
} from "@/lib/db/schema/catalog";
import type { Locale } from "@/lib/i18n/config";
import { pickLocale } from "./i18n-field";

export type ServiceView = {
  slug: string;
  title: string;
  hero: { headline: string; subhead: string; ctaPrimary: string | null; ctaSecondary: string | null };
  stats: { label: string; value: string }[];
  intro: string[];
  process: { num: number; day: string; title: string; desc: string; duration: string }[];
  included: { has: boolean; name: string; note: string; tag: string }[];
  faqs: { q: string; a: string }[];
  tiers: { name: string; title: string; price: string; priceNote: string; features: string[]; cta: string; featured: boolean }[];
};

function toView(row: typeof service.$inferSelect, locale: Locale): ServiceView {
  const hero = row.hero as { headline: I18nText; subhead: I18nText; ctaPrimary?: I18nText; ctaSecondary?: I18nText };
  return {
    slug: row.slug,
    title: pickLocale<string>(row.title as I18nText, locale) ?? row.slug,
    hero: {
      headline: pickLocale<string>(hero.headline, locale) ?? "",
      subhead: pickLocale<string>(hero.subhead, locale) ?? "",
      ctaPrimary: hero.ctaPrimary ? pickLocale<string>(hero.ctaPrimary, locale) : null,
      ctaSecondary: hero.ctaSecondary ? pickLocale<string>(hero.ctaSecondary, locale) : null,
    },
    stats: (row.stats as ServiceStat[]).map((s) => ({
      label: pickLocale<string>(s.label, locale) ?? "",
      value: pickLocale<string>(s.value, locale) ?? "",
    })),
    intro: (row.intro as I18nText[]).map((s) => pickLocale<string>(s, locale) ?? "").filter(Boolean),
    process: (row.process as ServiceProcessStep[]).map((p) => ({
      num: p.num,
      day: pickLocale<string>(p.day, locale) ?? "",
      title: pickLocale<string>(p.title, locale) ?? "",
      desc: pickLocale<string>(p.desc, locale) ?? "",
      duration: pickLocale<string>(p.duration, locale) ?? "",
    })),
    included: (row.included as ServiceIncluded[]).map((i) => ({
      has: i.has,
      name: pickLocale<string>(i.name, locale) ?? "",
      note: pickLocale<string>(i.note, locale) ?? "",
      tag: pickLocale<string>(i.tag, locale) ?? "",
    })),
    faqs: (row.faqs as ServiceFaq[]).map((f) => ({
      q: pickLocale<string>(f.q, locale) ?? "",
      a: pickLocale<string>(f.a, locale) ?? "",
    })),
    tiers: (row.tiers as ServiceTier[]).map((t) => ({
      name: t.name,
      title: pickLocale<string>(t.title, locale) ?? "",
      price: pickLocale<string>(t.price, locale) ?? "",
      priceNote: pickLocale<string>(t.priceNote, locale) ?? "",
      features: t.features.map((f) => pickLocale<string>(f, locale) ?? "").filter(Boolean),
      cta: pickLocale<string>(t.cta, locale) ?? "",
      featured: t.featured ?? false,
    })),
  };
}

export async function getAllServices(locale: Locale): Promise<ServiceView[]> {
  "use cache";
  cacheTag("services");
  cacheLife("hours");
  const rows = await db
    .select()
    .from(service)
    .where(eq(service.status, "published"))
    .orderBy(asc(service.sort), asc(service.slug));
  return rows.map((r) => toView(r, locale));
}

export async function getServiceBySlug(slug: string, locale: Locale): Promise<ServiceView | null> {
  "use cache";
  cacheTag(`service:${slug}`);
  cacheLife("hours");
  const [row] = await db
    .select()
    .from(service)
    .where(and(eq(service.slug, slug), eq(service.status, "published")))
    .limit(1);
  return row ? toView(row, locale) : null;
}

export async function getServiceSlugs(): Promise<string[]> {
  "use cache";
  cacheTag("services");
  cacheLife("hours");
  const rows = await db
    .select({ slug: service.slug })
    .from(service)
    .where(eq(service.status, "published"));
  return rows.map((r) => r.slug);
}

export async function getServiceCount(): Promise<number> {
  "use cache";
  cacheTag("services");
  cacheLife("minutes");
  const [{ value }] = await db.select({ value: count() }).from(service);
  return Number(value ?? 0);
}

// ── Admin helpers (no caching — always fresh) ──────────────────────────────

export type ServiceRow = typeof service.$inferSelect;

export async function adminListServices(): Promise<ServiceRow[]> {
  return db
    .select()
    .from(service)
    .orderBy(asc(service.sort), asc(service.slug));
}

export async function adminGetServiceById(slug: string): Promise<ServiceRow | null> {
  const [row] = await db
    .select()
    .from(service)
    .where(eq(service.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function serviceSlugExists(
  slug: string,
  excludeSlug?: string,
): Promise<boolean> {
  const [row] = await db
    .select({ slug: service.slug })
    .from(service)
    .where(eq(service.slug, slug))
    .limit(1);
  if (!row) return false;
  return row.slug !== excludeSlug;
}
