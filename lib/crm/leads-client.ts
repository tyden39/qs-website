import type { CrmLeadPayload } from "@/lib/validation/crm-lead-schema";

// Client for the CRM public lead endpoint.
// Contract: qs-crm `docs/lead-form-page-guide.md` §2 — unauthenticated,
// rate-limited 5 req/min/IP, cross-origin (CSP `connect-src` must allow it).

const DEFAULT_API_BASE = "https://crm.qstcnc.com/api/v1";

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_CRM_API_BASE ?? DEFAULT_API_BASE).replace(/\/+$/, "");
}

// Fields the CRM's 400 messages can be attributed to. The CRM answers in
// English prose (e.g. "invalid lead: phone number must be a valid Vietnamese
// phone number …") with a generic code, so — as with the duplicate check below —
// the message text is the only discriminator. Mapping it to a field lets the form
// show its own localized message under the right input instead of echoing the
// raw English sentence to a Vietnamese visitor.
export type LeadField = "phone" | "email";

function fieldOf(message: string): LeadField | undefined {
  if (/phone/i.test(message)) return "phone";
  if (/email/i.test(message)) return "email";
  return undefined;
}

// Discriminated result so callers can render the right message per outcome.
export type CreateLeadResult =
  | { ok: true }
  | { ok: false; kind: "validation"; error: string; code?: string; field?: LeadField }
  | { ok: false; kind: "rate_limit" }
  | { ok: false; kind: "duplicate" }
  | { ok: false; kind: "server"; status: number; error: string }
  | { ok: false; kind: "network"; error: string };

export async function createPublicLead(payload: CrmLeadPayload): Promise<CreateLeadResult> {
  let res: Response;
  try {
    res = await fetch(`${apiBase()}/public/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return { ok: false, kind: "network", error: err instanceof Error ? err.message : "Network error" };
  }

  if (res.status === 201) return { ok: true };
  if (res.status === 429) return { ok: false, kind: "rate_limit" };

  const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
  // The CRM reports a duplicate phone as `400 {"error":"phone number already exists","code":"BAD_REQUEST"}`
  // — the code is generic, so the message text is the only discriminator.
  if (res.status === 409 || /already exists/i.test(data.error ?? "")) return { ok: false, kind: "duplicate" };
  if (res.status === 400) {
    const error = data.error ?? "Validation failed";
    return { ok: false, kind: "validation", error, code: data.code, field: fieldOf(error) };
  }
  return { ok: false, kind: "server", status: res.status, error: data.error ?? `Request failed (${res.status})` };
}
