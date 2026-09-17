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
  children?: PublicDocNode[];
};

const DEFAULT_API_BASE = "https://crm.qstcnc.com/api/v1";

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_CRM_API_BASE ?? DEFAULT_API_BASE).replace(/\/+$/, "");
}

function toPublicDocNode(raw: Record<string, unknown>): PublicDocNode {
  const fileUrl = raw.file_url ? String(raw.file_url) : undefined;
  const children = Array.isArray(raw.children)
    ? (raw.children as Record<string, unknown>[]).map(toPublicDocNode)
    : undefined;
  return {
    id: String(raw.id ?? ""),
    nodeType: raw.node_type === "document" ? "document" : "folder",
    name: String(raw.name ?? ""),
    description: raw.description ? String(raw.description) : undefined,
    fileUrl: fileUrl ? (fileUrl.startsWith("http") ? fileUrl : `${apiBase()}${fileUrl}`) : undefined,
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
