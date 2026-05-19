import { z } from "zod";

// Shared schema for translatable VI-required, EN-optional text fields.
// Streams import this so the shape stays consistent across entities.
export const i18nText = z.object({
  vi: z.string().min(1),
  en: z.string().optional(),
});

export const i18nTextOptional = z.object({
  vi: z.string().optional(),
  en: z.string().optional(),
});

export type I18nTextInput = z.infer<typeof i18nText>;
