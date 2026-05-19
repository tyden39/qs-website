import {
  pgTable,
  text,
  timestamp,
  jsonb,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Translatable text payload: VI is required, EN optional. Renderer falls
// back to VI when an EN value is missing.
export type I18nText = { vi: string; en?: string };

export type ProductSpec = { l: string; v: string };
export type ProductImage = { url: string; alt: I18nText };

export const product = pgTable(
  "product",
  {
    slug: text("slug").primaryKey(),
    series: text("series").notNull(),
    axes: text("axes").notNull(),
    display: text("display").notNull(),
    badge: text("badge"),
    tag: jsonb("tag").$type<I18nText>().notNull(),
    name: jsonb("name").$type<I18nText>().notNull(),
    desc: jsonb("desc").$type<I18nText>().notNull(),
    bullets: jsonb("bullets").$type<I18nText[]>().notNull().default([]),
    specs: jsonb("specs").$type<ProductSpec[]>().notNull().default([]),
    images: jsonb("images").$type<ProductImage[]>().notNull().default([]),
    status: text("status").notNull().default("draft"),
    sort: integer("sort").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  },
  (t) => [
    index("product_status_sort_idx").on(t.status, t.sort),
    index("product_series_idx").on(t.series),
  ],
);

export type ApplicationWorkflow = { n: string; label: I18nText; title: I18nText; desc: I18nText };
export type ApplicationDeployment = { name: string; loc: I18nText };

export const application = pgTable(
  "application",
  {
    slug: text("slug").primaryKey(),
    title: jsonb("title").$type<I18nText>().notNull(),
    summary: jsonb("summary").$type<I18nText>().notNull(),
    heroImage: text("hero_image"),
    workflow: jsonb("workflow").$type<ApplicationWorkflow[]>().notNull().default([]),
    specs: jsonb("specs").$type<Array<{ label: I18nText; value: I18nText }>>().notNull().default([]),
    deployments: jsonb("deployments").$type<ApplicationDeployment[]>().notNull().default([]),
    status: text("status").notNull().default("draft"),
    sort: integer("sort").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  },
  (t) => [index("application_status_sort_idx").on(t.status, t.sort)],
);

export type ServiceProcessStep = { num: number; day: I18nText; title: I18nText; desc: I18nText; duration: I18nText };
export type ServiceIncluded = { has: boolean; name: I18nText; note: I18nText; tag: I18nText };
export type ServiceFaq = { q: I18nText; a: I18nText };
export type ServiceTier = { name: string; title: I18nText; price: I18nText; priceNote: I18nText; features: I18nText[]; cta: I18nText; featured?: boolean };

export type ServiceStat = { label: I18nText; value: I18nText };

export const service = pgTable(
  "service",
  {
    slug: text("slug").primaryKey(),
    title: jsonb("title").$type<I18nText>().notNull(),
    hero: jsonb("hero").$type<{ headline: I18nText; subhead: I18nText; ctaPrimary?: I18nText; ctaSecondary?: I18nText }>().notNull(),
    stats: jsonb("stats").$type<ServiceStat[]>().notNull().default([]),
    intro: jsonb("intro").$type<I18nText[]>().notNull().default([]),
    process: jsonb("process").$type<ServiceProcessStep[]>().notNull().default([]),
    included: jsonb("included").$type<ServiceIncluded[]>().notNull().default([]),
    faqs: jsonb("faqs").$type<ServiceFaq[]>().notNull().default([]),
    tiers: jsonb("tiers").$type<ServiceTier[]>().notNull().default([]),
    status: text("status").notNull().default("draft"),
    sort: integer("sort").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  },
  (t) => [index("service_status_sort_idx").on(t.status, t.sort)],
);

export const news = pgTable(
  "news",
  {
    slug: text("slug").primaryKey(),
    title: jsonb("title").$type<I18nText>().notNull(),
    excerpt: jsonb("excerpt").$type<I18nText>().notNull(),
    bodyHtml: jsonb("body_html").$type<I18nText>().notNull(),
    bodyJson: jsonb("body_json").$type<{ vi?: unknown; en?: unknown } | null>(),
    coverImage: text("cover_image"),
    category: text("category").notNull(),
    tags: text("tags").array().notNull().default([]),
    status: text("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  },
  (t) => [
    index("news_status_published_idx").on(t.status, t.publishedAt),
    index("news_category_idx").on(t.category),
  ],
);

export const datasheet = pgTable(
  "datasheet",
  {
    slug: text("slug").primaryKey(),
    name: jsonb("name").$type<I18nText>().notNull(),
    fileUrl: text("file_url").notNull(),
    productSlug: text("product_slug").references(() => product.slug, { onDelete: "set null" }),
    category: text("category").notNull(),
    series: text("series").notNull(),
    lang: text("lang").$type<"vi" | "en" | "both">().notNull(),
    ext: text("ext").notNull(),
    version: text("version"),
    docDate: timestamp("doc_date", { withTimezone: true }),
    sizeBytes: integer("size_bytes").notNull().default(0),
    status: text("status").notNull().default("draft"),
    featured: text("featured"),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  },
  (t) => [
    index("datasheet_product_idx").on(t.productSlug),
    index("datasheet_category_idx").on(t.category),
    index("datasheet_status_idx").on(t.status),
  ],
);
