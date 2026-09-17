// Client for the CRM's public Company Doc "Website" tree — same
// unauthenticated, cross-origin setup as manuals-client.ts (base URL from
// NEXT_PUBLIC_CRM_API_BASE). Only the "Website" branch is ever exposed by
// the CRM; Phòng Ban/Dự Án stay internal and are never reachable here.

export type PublicDocNode = {
  id: string;
  nodeType: "folder" | "document";
  name: string;
  description?: string;
  /** Documents only — absolute URL, made absolute below if the API returned
   *  a relative one. */
  fileUrl?: string;
  /** Documents only, ManualHub-linked leaves only — "vi"/"en", straight from
   *  the (product, document_type, language) slot this leaf was synced into,
   *  not parsed out of Name's "(VI)"/"(EN)" display suffix. undefined for a
   *  plain CompanyDoc upload, which has no language edition of its own. */
  language?: string;
  /** The other two thirds of that same slot key — (productId, documentType)
   *  together identify "the same logical document" across its VI/EN leaves,
   *  so live-download-groups.ts can merge them back into one row with two
   *  download buttons instead of two separate rows. */
  productId?: string;
  documentType?: string;
  children?: PublicDocNode[];
};

const DEFAULT_API_BASE = "https://crm.qstcnc.com/api/v1";

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_CRM_API_BASE ?? DEFAULT_API_BASE).replace(/\/+$/, "");
}

// A relative file_url on this endpoint is already one of the CRM's own
// self-hosted routes — either "/api/v1/public/company-docs/{id}/files/{id}"
// (a plain CompanyDoc upload) or "/api/v1/public/manualhub/documents/{id}/
// files/{id}" (a ManualHub-linked leaf, mirrored verbatim from that
// document's own content.file_url — see qs-crm-be's company_doc_sync.go).
// Either way it already carries the "/api/v1" prefix, so it must be
// resolved against the bare origin, not apiBase() (which already ends in
// "/api/v1" itself) — doing the latter doubles the prefix into
// ".../api/v1/api/v1/..." and 404s.
function apiOrigin(): string {
  return apiBase().replace(/\/api\/v1$/, "");
}

function toPublicDocNode(raw: Record<string, unknown>): PublicDocNode {
  const fileUrl = raw.file_url ? String(raw.file_url) : undefined;
  const manualhubDocumentId = raw.manualhub_document_id ? String(raw.manualhub_document_id) : undefined;
  const children = Array.isArray(raw.children)
    ? (raw.children as Record<string, unknown>[]).map(toPublicDocNode)
    : undefined;
  return {
    id: String(raw.id ?? ""),
    nodeType: raw.node_type === "document" ? "document" : "folder",
    name: String(raw.name ?? ""),
    description: raw.description ? String(raw.description) : undefined,
    // A ManualHub-linked leaf's own file_url is whatever raw format it was
    // authored in (often .docx, converted to PDF on the fly only through
    // ManualHub's own download-pdf route) — always send those through that
    // route instead, same as manuals-client.ts's download_url, so every
    // visitor gets a PDF regardless of the source format. A plain
    // CompanyDoc upload (no manualhub_document_id) has no such conversion
    // step, so its own file_url — already whatever real format was
    // uploaded (pdf/zip/rar) — is used as-is.
    fileUrl: manualhubDocumentId
      ? `${apiBase()}/public/manualhub/documents/${manualhubDocumentId}/download-pdf`
      : fileUrl
        ? fileUrl.startsWith("http")
          ? fileUrl
          : `${apiOrigin()}${fileUrl}`
        : undefined,
    language: raw.manualhub_language ? String(raw.manualhub_language) : undefined,
    productId: raw.manualhub_product_id ? String(raw.manualhub_product_id) : undefined,
    documentType: raw.manualhub_document_type ? String(raw.manualhub_document_type) : undefined,
    children,
  };
}

export type GetWebsiteTreeResult = { ok: true; root: PublicDocNode } | { ok: false; error: string };

export async function getPublicWebsiteTree(): Promise<GetWebsiteTreeResult> {
  let res: Response;
  try {
    res = await fetch(`${apiBase()}/public/company-docs/website-tree`, {
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

  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!data) return { ok: false, error: "Empty response" };
  return { ok: true, root: toPublicDocNode(data) };
}
