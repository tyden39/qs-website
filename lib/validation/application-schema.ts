import { z } from "zod";
import { i18nText } from "./i18n-text-schema";

// Stub — the Applications+Services stream finalizes this.
export const applicationInput = z.object({
  slug: z.string().min(1),
  title: i18nText,
  summary: i18nText,
  heroImage: z.string().nullish(),
  workflow: z.array(z.unknown()).default([]),
  specs: z.array(z.unknown()).default([]),
  deployments: z.array(z.unknown()).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type ApplicationInput = z.infer<typeof applicationInput>;
