import { z } from "zod";

export const leadInput = z.object({
  source: z.enum(["contact", "newsletter", "datasheet", "inquiry"]),
  name: z.string().min(1).max(120).nullish(),
  email: z.email("Invalid email address"),
  phone: z.string().max(40).nullish(),
  company: z.string().max(120).nullish(),
  message: z.string().max(2000).nullish(),
  payload: z.record(z.string(), z.unknown()).nullish(),
  locale: z.enum(["vi", "en"]).default("vi"),
  // Honeypot: must be empty — bots fill it, humans leave it blank
  honeypot: z.string().max(0, "Bot detected").optional(),
});

export type LeadInput = z.infer<typeof leadInput>;

// Newsletter-specific: email only
export const newsletterInput = z.object({
  email: z.email("Invalid email address"),
  locale: z.enum(["vi", "en"]).default("vi"),
  honeypot: z.string().max(0, "Bot detected").optional(),
});
export type NewsletterInput = z.infer<typeof newsletterInput>;

// Datasheet request: email + datasheet slug
export const datasheetRequestInput = z.object({
  email: z.email("Invalid email address"),
  name: z.string().min(1).max(120).nullish(),
  company: z.string().max(120).nullish(),
  datasheetSlug: z.string().min(1),
  locale: z.enum(["vi", "en"]).default("vi"),
  honeypot: z.string().max(0, "Bot detected").optional(),
});
export type DatasheetRequestInput = z.infer<typeof datasheetRequestInput>;

// Lead status update (admin only)
export const leadStatusUpdate = z.object({
  status: z.enum(["new", "contacted", "qualified", "closed"]),
  assignedTo: z.string().nullish(),
});
export type LeadStatusUpdate = z.infer<typeof leadStatusUpdate>;
