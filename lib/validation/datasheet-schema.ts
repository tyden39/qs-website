import { z } from "zod";
import { i18nText } from "./i18n-text-schema";

// Stub — the Datasheets+Leads stream finalizes this.
export const datasheetInput = z.object({
  slug: z.string().min(1),
  name: i18nText,
  fileUrl: z.string().url(),
  productSlug: z.string().nullish(),
  category: z.string().min(1),
  series: z.string().min(1),
  lang: z.enum(["vi", "en", "both"]),
  ext: z.string().min(1),
  version: z.string().nullish(),
  sizeBytes: z.number().int().nonnegative().default(0),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type DatasheetInput = z.infer<typeof datasheetInput>;
