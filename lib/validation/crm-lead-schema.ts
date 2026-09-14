import { z } from "zod";

// Contract source of truth: qs-crm `docs/lead-form-page-guide.md` §2.
// The CRM backend stores codes only — display labels are this site's i18n.

// Service codes — must match the CRM backend exactly; unknown codes are
// rejected with 400. (qs-crm `internal/core/lead/validation.go`)
export const CRM_SERVICE_CODES = [
  "control_unit",
  "machine_manufacturing",
  "machine_upgrade",
] as const;
export type CrmServiceCode = (typeof CRM_SERVICE_CODES)[number];

// Business-group codes the CRM form offers. Any other string is accepted as
// free text, so the UI also allows an "other" free-text entry.
export const CRM_BUSINESS_GROUP_CODES = [
  "builder",
  "end_user",
  "commercial",
  "manufacturing",
  "machine_manufacturing",
] as const;
export type CrmBusinessGroupCode = (typeof CRM_BUSINESS_GROUP_CODES)[number];

// Canonical wire payload for POST {API_BASE}/public/leads. Optional fields are
// omitted (never sent empty) when building the payload from form state.
export const crmLeadPayloadSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  email: z.email().optional(),
  business_field: z.string().trim().min(1).optional(),
  notes: z.string().trim().min(1).max(2000).optional(),
  services: z.array(z.enum(CRM_SERVICE_CODES)).min(1).optional(),
});
export type CrmLeadPayload = z.infer<typeof crmLeadPayloadSchema>;
