import { z } from "zod";
import { i18nText } from "./i18n-text-schema";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const workflowStepSchema = z.object({
  n: z.string().min(1, "Step number required"),
  label: i18nText,
  title: i18nText,
  desc: i18nText,
});

const specSchema = z.object({
  label: i18nText,
  value: i18nText,
});

const deploymentSchema = z.object({
  name: z.string().min(1, "Client name required"),
  loc: i18nText,
});

export const applicationSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(slugPattern, "Slug must be lowercase alphanumeric with hyphens"),
  title: i18nText,
  summary: i18nText,
  heroImage: z.string().url().optional().or(z.literal("")),
  workflow: z.array(workflowStepSchema).default([]),
  specs: z.array(specSchema).default([]),
  deployments: z.array(deploymentSchema).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  sort: z.coerce.number().int().default(0),
});

// Output type (post-parse): arrays are required — used in server actions
export type ApplicationSchemaType = z.output<typeof applicationSchema>;

// Input type (pre-parse): arrays are optional — matches what RHF+zodResolver infer
export type ApplicationFormValues = z.input<typeof applicationSchema>;

// Keep backward-compat alias for existing consumers of the stub
export const applicationInput = applicationSchema;
export type ApplicationInput = ApplicationSchemaType;

export type WorkflowStepInput = z.output<typeof workflowStepSchema>;
export type SpecInput = z.output<typeof specSchema>;
export type DeploymentInput = z.output<typeof deploymentSchema>;
