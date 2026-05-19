import { z } from "zod";
import { i18nText } from "./i18n-text-schema";

// Stub — the News stream finalizes this with Tiptap-aware body validation.
export const newsInput = z.object({
  slug: z.string().min(1),
  category: z.string().min(1),
  title: i18nText,
  excerpt: i18nText,
  bodyHtml: i18nText,
  bodyJson: z.object({ vi: z.unknown().optional(), en: z.unknown().optional() }).nullish(),
  coverImage: z.string().nullish(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  publishedAt: z.coerce.date().nullish(),
});

export type NewsInput = z.infer<typeof newsInput>;
