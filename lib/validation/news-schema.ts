import { z } from "zod";
import { i18nText, i18nTextOptional } from "./i18n-text-schema";

const i18nHtml = z.object({
  vi: z.string(),
  en: z.string().optional(),
});

const i18nJson = z.object({
  vi: z.unknown().optional(),
  en: z.unknown().optional(),
});

export const newsInput = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  category: z.string().min(1, "Category is required"),
  title: i18nText,
  excerpt: i18nText,
  bodyHtml: i18nHtml,
  bodyJson: i18nJson.optional(),
  coverImage: z.string().url("Must be a valid URL").nullish(),
  tags: z.array(z.string()),
  status: z.enum(["draft", "published"]),
  publishedAt: z.coerce.date().nullish(),
  imageAlt: i18nTextOptional.optional(),
}).refine(
  (d) => d.status !== "published" || d.publishedAt != null,
  { message: "Published articles require a publishedAt date", path: ["publishedAt"] }
);

export type NewsInput = z.infer<typeof newsInput>;
