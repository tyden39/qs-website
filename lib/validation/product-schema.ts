import { z } from "zod";
import { i18nText } from "./i18n-text-schema";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const productImageSchema = z.object({
  url: z.string().min(1),
  alt: z.object({
    vi: z.string().min(1, "Alt text VI is required"),
    en: z.string().min(1, "Alt text EN is required"),
  }),
});

const productSpecSchema = z.object({
  l: z.string().min(1),
  // Single value spanning all interface columns, or one value per column.
  v: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
});

const specColumnSchema = z.object({
  name: z.string().min(1),
  note: z.string().optional(),
});

const bulletSchema = z.object({
  vi: z.string().min(1),
  en: z.string().optional(),
});

export const productSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(slugPattern, "Slug must be lowercase alphanumeric with hyphens"),
  series: z.string().min(1, "Series is required"),
  axes: z.string().min(1, "Axes is required"),
  display: z.string().min(1, "Display is required"),
  badge: z.string().optional(),
  tag: i18nText,
  name: i18nText,
  desc: i18nText,
  bullets: z.array(bulletSchema).default([]),
  interfaces: z.array(specColumnSchema).default([]),
  specs: z.array(productSpecSchema).default([]),
  images: z.array(productImageSchema).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  sort: z.number().int().default(0),
});

// Output type (after Zod defaults applied) — used by server actions
export type ProductSchema = z.infer<typeof productSchema>;
// Input type (before defaults) — used by RHF useForm generic
export type ProductFormInput = z.input<typeof productSchema>;

export const createProductSchema = productSchema;
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = productSchema.extend({
  id: z.string().min(1),
});
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// Keep backward compat with existing stub consumers
export const productInput = productSchema;
export type ProductInput = ProductSchema;
