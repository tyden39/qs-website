import { z } from "zod";
import { i18nText } from "./i18n-text-schema";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const processStepSchema = z.object({
  num: z.coerce.number().int().min(1),
  day: i18nText,
  title: i18nText,
  desc: i18nText,
  duration: i18nText,
});

const includedSchema = z.object({
  has: z.boolean().default(true),
  name: i18nText,
  note: i18nText,
  tag: i18nText,
});

const faqSchema = z.object({
  q: i18nText,
  a: i18nText,
});

const tierSchema = z.object({
  name: z.string().min(1, "Tier name required"),
  title: i18nText,
  price: i18nText,
  priceNote: i18nText,
  features: z.array(i18nText).default([]),
  cta: i18nText,
  featured: z.boolean().default(false),
});

const statSchema = z.object({
  label: i18nText,
  value: i18nText,
});

export const serviceSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(slugPattern, "Slug must be lowercase alphanumeric with hyphens"),
  title: i18nText,
  hero: z.object({
    headline: i18nText,
    subhead: i18nText,
    ctaPrimary: z.object({ vi: z.string().optional(), en: z.string().optional() }).optional(),
    ctaSecondary: z.object({ vi: z.string().optional(), en: z.string().optional() }).optional(),
  }),
  stats: z.array(statSchema).default([]),
  intro: z.array(z.object({ vi: z.string().min(1), en: z.string().optional() })).default([]),
  process: z.array(processStepSchema).default([]),
  included: z.array(includedSchema).default([]),
  faqs: z.array(faqSchema).default([]),
  tiers: z.array(tierSchema).max(3, "Maximum 3 pricing tiers").default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  sort: z.coerce.number().int().default(0),
});

// Output type (post-parse): arrays required — used in server actions
export type ServiceSchemaType = z.output<typeof serviceSchema>;

// Input type (pre-parse): arrays optional — matches RHF+zodResolver inference
export type ServiceFormValues = z.input<typeof serviceSchema>;

// Backward-compat alias
export const serviceInput = serviceSchema;
export type ServiceInput = ServiceSchemaType;

export type ProcessStepInput = z.output<typeof processStepSchema>;
export type IncludedInput = z.output<typeof includedSchema>;
export type FaqInput = z.output<typeof faqSchema>;
export type TierInput = z.output<typeof tierSchema>;
