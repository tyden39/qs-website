import { z } from "zod";

// Stub — the Datasheets+Leads stream finalizes this with bot/spam rules.
export const leadInput = z.object({
  source: z.string().min(1),
  name: z.string().max(120).nullish(),
  email: z.email(),
  phone: z.string().max(40).nullish(),
  company: z.string().max(120).nullish(),
  message: z.string().max(2000).nullish(),
  payload: z.unknown().nullish(),
  locale: z.enum(["vi", "en"]).default("vi"),
});

export type LeadInput = z.infer<typeof leadInput>;
