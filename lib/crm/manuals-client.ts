// Client for the CRM's ManualHub public manual listing/download endpoints.
// Same origin and CORS setup as the lead form (see leads-client.ts) —
// unauthenticated, cross-origin, base URL from NEXT_PUBLIC_CRM_API_BASE.
// Only ever returns the currently-active released manuals; drafts, pending
// review, and superseded versions never reach this API at all.

export type PublicManual = {
  id: string;
  productId: string;
  productName?: string;
  /** qs-crm-be products.code — for the real catalog this equals this
   *  site's own productSlug (see qs-crm-be's
   *  seeds/000013_website_product_catalog.sql), so it's the join key for
   *  grouping a manual under /electronics/{productCode}. Empty for any
   *  product qs-crm-be doesn't have a matching real record for yet. */
  productCode?: string;
  title: string;
  description?: string;
  documentType?: string;
  format?: string;
  language: string;
  version: string;
  releasedAt?: string;
  /** Always a PDF regardless of the authored format (docx source gets
   *  converted server-side) — the one format any visitor's device opens. */
  downloadUrl: string;
};

const DEFAULT_API_BASE = "https://crm.qstcnc.com/api/v1";

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_CRM_API_BASE ?? DEFAULT_API_BASE).replace(/\/+$/, "");
}

function toPublicManual(raw: Record<string, unknown>): PublicManual {
  const downloadUrl = String(raw.download_url ?? "");
  return {
    id: String(raw.id ?? ""),
    productId: String(raw.product_id ?? ""),
    productName: raw.product_name ? String(raw.product_name) : undefined,
    productCode: raw.product_code ? String(raw.product_code) : undefined,
    title: String(raw.title ?? ""),
    description: raw.description ? String(raw.description) : undefined,
    documentType: raw.document_type ? String(raw.document_type) : undefined,
    format: raw.format ? String(raw.format) : undefined,
    language: String(raw.language ?? ""),
    version: String(raw.version ?? ""),
    releasedAt: raw.released_at ? String(raw.released_at) : undefined,
    // The API returns a relative path (see qs-crm-be's PublicList) so it
    // works the same in dev and prod regardless of which host is serving —
    // made absolute here against the same base every other CRM call uses.
    downloadUrl: downloadUrl.startsWith("http") ? downloadUrl : `${apiBase()}${downloadUrl}`,
  };
}

export type ListManualsResult =
  | { ok: true; items: PublicManual[] }
  | { ok: false; error: string };

export async function listPublicManuals(params?: {
  productId?: string;
  documentType?: string;
  language?: string;
}): Promise<ListManualsResult> {
  const query = new URLSearchParams();
  if (params?.productId) query.set("product_id", params.productId);
  if (params?.documentType) query.set("document_type", params.documentType);
  if (params?.language) query.set("language", params.language);
  const qs = query.toString();

  let res: Response;
  try {
    res = await fetch(`${apiBase()}/public/manualhub/documents${qs ? `?${qs}` : ""}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: data.error ?? `Request failed (${res.status})` };
  }

  const data = (await res.json().catch(() => ({ items: [] }))) as { items?: Record<string, unknown>[] };
  return { ok: true, items: (data.items ?? []).map(toPublicManual) };
}
