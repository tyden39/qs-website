"use client";

// Doc/model counts derived purely from the CRM's live "Website" tree — no
// static baseline anymore (see page.tsx: the whole page is ERP-driven now).
// "Models" counts the tree's immediate children under each top-level family
// folder that is itself a folder (e.g. each product under "Bộ điều khiển"),
// falling back to the family folder itself when it has no sub-folders.

import { useLiveWebsiteDocs } from "@/lib/crm/live-website-docs-context";
import type { PublicDocNode } from "@/lib/crm/company-docs-client";

function countDocuments(node: PublicDocNode): number {
  if (node.nodeType === "document") return 1;
  return (node.children ?? []).reduce((sum, c) => sum + countDocuments(c), 0);
}

function countModels(root: PublicDocNode): number {
  let count = 0;
  for (const family of root.children ?? []) {
    if (family.nodeType !== "folder") continue;
    const subFolders = (family.children ?? []).filter((c) => c.nodeType === "folder");
    count += subFolders.length > 0 ? subFolders.length : 1;
  }
  return count;
}

export function LiveDocCount() {
  const root = useLiveWebsiteDocs();
  return <>{root ? countDocuments(root) : 0}</>;
}

export function LiveModelCount() {
  const root = useLiveWebsiteDocs();
  return <>{root ? countModels(root) : 0}</>;
}
