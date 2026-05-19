import { z } from "zod";
import { i18nText } from "./i18n-text-schema";

// Stub — the Products stream finalizes this with all admin form rules.
export const productInput = z.object({
  slug: z.string().min(1),
  series: z.string().min(1),
  axes: z.string().min(1),
  display: z.string().min(1),
  badge: z.string().nullish(),
  tag: i18nText,
  name: i18nText,
  desc: i18nText,
  bullets: z.array(i18nText).default([]),
  specs: z.array(z.object({ l: z.string(), v: z.string() })).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type ProductInput = z.infer<typeof productInput>;
