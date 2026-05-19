import { z } from "zod";
import { i18nText } from "./i18n-text-schema";

export const datasheetInput = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  name: i18nText,
  fileUrl: z.string().url("Must be a valid URL"),
  productSlug: z.string().min(1).nullish(),
  category: z.string().min(1).max(80),
  series: z.string().min(1).max(80),
  lang: z.enum(["vi", "en", "both"]),
  ext: z.string().min(1).max(10),
  version: z.string().max(40).nullish(),
  sizeBytes: z.number().int().nonnegative().default(0),
  status: z.enum(["draft", "published"]).default("draft"),
  sort: z.number().int().default(0),
});

export type DatasheetInput = z.infer<typeof datasheetInput>;

// Partial update schema (all fields optional except slug identity)
export const datasheetUpdate = datasheetInput.partial().omit({ slug: true });
export type DatasheetUpdate = z.infer<typeof datasheetUpdate>;
