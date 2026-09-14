import type { CrmLeadPayload } from "@/lib/validation/crm-lead-schema";

// Client for the CRM public lead endpoint.
// Contract: qs-crm `docs/lead-form-page-guide.md` §2 — unauthenticated,
// rate-limited 5 req/min/IP, cross-origin (CSP `connect-src` must allow it).

const DEFAULT_API_BASE = "https://crm.qstcnc.com/api/v1";

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_CRM_API_BASE ?? DEFAULT_API_BASE).replace(/\/+$/, "");
}

// Discriminated result so callers can render the right message per outcome.
export type CreateLeadResult =
  | { ok: true }
  | { ok: false; kind: "validation"; error: string; code?: string }
  | { ok: false; kind: "rate_limit" }
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
  if (res.status === 400) {
    return { ok: false, kind: "validation", error: data.error ?? "Validation failed", code: data.code };
  }
  return { ok: false, kind: "server", status: res.status, error: data.error ?? `Request failed (${res.status})` };
}
