import { z } from "zod";
import { i18nText } from "./i18n-text-schema";

// Stub — the Applications+Services stream finalizes this.
export const serviceInput = z.object({
  slug: z.string().min(1),
  title: i18nText,
  hero: z.object({
    headline: i18nText,
    subhead: i18nText,
    ctaPrimary: i18nText.optional(),
    ctaSecondary: i18nText.optional(),
  }),
  stats: z.array(z.unknown()).default([]),
  intro: z.array(i18nText).default([]),
  process: z.array(z.unknown()).default([]),
  included: z.array(z.unknown()).default([]),
  faqs: z.array(z.unknown()).default([]),
  tiers: z.array(z.unknown()).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type ServiceInput = z.infer<typeof serviceInput>;
