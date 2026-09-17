// Maps the CRM's live "Website" doc tree (PublicDocNode) into the DlGroup[]
// shape DownloadsTree/DocTable already render — reusing that component
// keeps the original two-pane layout (sidebar + right-side table, including
// its own "no rows" empty state) instead of a bespoke tree renderer, so an
// empty family/product looks exactly like the design always intended: a
// selectable row with an empty table, not a missing section.
//
// A family with sub-folders (e.g. "Bộ điều khiển" → one folder per
// controller model) becomes a DlGroup with `products`; each product's own
// document descendants (flattened — a product folder is never more than
// one level deep in practice) become a single generic doc-group's rows. A
// family with no sub-folders (e.g. "Catalogue & Hồ sơ") lists its documents
// directly as `rows`, matching a leaf family in the original design.
//
// A ManualHub-linked VI/EN pair — same productId + documentType, see
// company-docs-client.ts's PublicDocNode — collapses into ONE row with two
// variant buttons (VI ↓ / EN ↓), matching DocTable's original two-language
// layout, instead of two separate rows for the same logical document. A
// plain CompanyDoc upload (no productId/documentType) has no pairing key,
// so it always renders as its own single-variant row.

import type { PublicDocNode } from "@/lib/crm/company-docs-client";
import type { DlDocGroup, DlGroup, DlProduct, DlRow, DlVariant } from "./downloads-tree";

function extLabel(url: string): string {
  const clean = url.split(/[?#]/)[0];
  const dot = clean.lastIndexOf(".");
  return dot === -1 ? "FILE" : clean.slice(dot + 1).toUpperCase();
}

// Strips the "(VI)"/"(EN) - v1.0" suffix SyncManualHubDocument bakes into
// Name (see qs-crm-be's service.go) — a paired row shows one title, not the
// first variant's language-specific one.
function baseTitle(name: string): string {
  const stripped = name.replace(/\s*\((?:VI|EN|vi|en)\)(?:\s*-\s*v[\w.]+)?\s*$/, "").trim();
  return stripped || name;
}

function toVariant(doc: PublicDocNode): DlVariant {
  const ext = extLabel(doc.fileUrl ?? "");
  return { lang: doc.language ? doc.language.toUpperCase() : ext, url: doc.fileUrl ?? "", sizeLabel: ext };
}

function collectDocuments(node: PublicDocNode): PublicDocNode[] {
  if (node.nodeType === "document") return node.fileUrl ? [node] : [];
  return (node.children ?? []).flatMap(collectDocuments);
}

function toRows(docs: PublicDocNode[]): DlRow[] {
  const paired = new Map<string, PublicDocNode[]>();
  const singles: PublicDocNode[] = [];

  for (const doc of docs) {
    const key = doc.productId && doc.documentType ? `${doc.productId}::${doc.documentType}` : null;
    if (!key) {
      singles.push(doc);
      continue;
    }
    const group = paired.get(key);
    if (group) group.push(doc);
    else paired.set(key, [doc]);
  }

  const rows: DlRow[] = [];
  for (const group of paired.values()) {
    const ext = extLabel(group[0].fileUrl ?? "");
    rows.push({
      key: group.map((d) => d.id).sort().join("+"),
      title: baseTitle(group[0].name),
      ext,
      version: "—",
      variants: group.map(toVariant),
    });
  }
  for (const doc of singles) {
    rows.push({ key: doc.id, title: doc.name, ext: extLabel(doc.fileUrl ?? ""), version: "—", variants: [toVariant(doc)] });
  }
  return rows;
}

export function buildLiveDownloadGroups(root: PublicDocNode | null, genericDocGroupLabel: string): DlGroup[] {
  if (!root) return [];
  const families = (root.children ?? []).filter((c) => c.nodeType === "folder");

  return families.map((family): DlGroup => {
    const subFolders = (family.children ?? []).filter((c) => c.nodeType === "folder");
    const directDocs = (family.children ?? []).filter((c) => c.nodeType === "document" && c.fileUrl);

    if (subFolders.length === 0) {
      return {
        id: family.id,
        label: family.name,
        heading: family.name,
        desc: family.description ?? "",
        rows: toRows(directDocs),
      };
    }

    const products: DlProduct[] = subFolders.map((sub) => {
      const rows = toRows(collectDocuments(sub));
      const groups: DlDocGroup[] = [{ id: "all", label: genericDocGroupLabel, rows }];
      return { id: sub.id, label: sub.name, groups };
    });

    return {
      id: family.id,
      label: family.name,
      heading: family.name,
      desc: family.description ?? "",
      products,
    };
  });
}
