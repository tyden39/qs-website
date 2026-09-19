"use client";

import { useLiveManuals } from "@/lib/crm/live-manuals-context";
import type { PublicManual } from "@/lib/crm/manuals-client";
import { useLiveWebsiteDocs } from "@/lib/crm/live-website-docs-context";
import type { PublicDocNode } from "@/lib/crm/company-docs-client";
import { DownloadsTree, type DlGroup, type DlProduct, type DlRow } from "./downloads-tree";

// The 5 static families above already mirror these exact CRM category
// names (see qs-crm-be's 000206_company_doc_website_tree migration) — any
// OTHER category an admin adds in the CRM shows up here as an extra family
// instead of duplicating one of the 5. Keyed by the CRM node's own name.
const STATIC_FAMILY_NAMES = new Set(["Catalogue & Hồ sơ", "Bộ điều khiển", "QS Servo", "Biến tần", "Phần mềm & Dữ liệu"]);

// "controllers"/"servo"/"inverter" already merge live ManualHub documents
// by product code (see mergeLive below) — "catalogue" and "software" have
// no product to key off of, so their live source is this site's own CRM
// "Website" doc tree instead, matched by the CRM folder's name. An admin
// adding/editing a document under either CRM folder shows up here without
// a site deploy, same as the other three families.
const WEBSITE_FOLDER_NAME_BY_FAMILY_ID: Record<string, string> = {
  catalogue: "Catalogue & Hồ sơ",
  software: "Phần mềm & Dữ liệu",
};

// Product-family folders (servo/inverter/controllers) whose *own* Website
// folder also accepts a document not tied to any model — an admin uploads it
// straight into "QS Servo" instead of one of the per-model subfolders that
// mirror ManualHub. There's no product to attach it to, so it gets its own
// catch-all card inside the family instead (see mergeGenericFolderProduct).
const GENERIC_PRODUCT_FOLDER_BY_FAMILY_ID: Record<string, string> = {
  controllers: "Bộ điều khiển",
  servo: "QS Servo",
  inverter: "Biến tần",
};

function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "muc"
  );
}

function extFromUrl(url: string): string {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
  return match ? match[1].toUpperCase() : "LINK";
}

// The static catalogue/software baseline mirrors its files locally
// ("/downloads/catalogue/qs-product-catalogue.pdf"), while the CRM's
// company_doc_nodes rows for the exact same files were seeded with the
// live site's absolute URL ("https://qstcnc.com/downloads/catalogue/
// qs-product-catalogue.pdf" — see qs-crm-be's 000207 migration). Same
// file, different URL string, so an exact-string dedup misses it and the
// same PDF shows up twice. Comparing by filename instead catches that.
function urlFilename(url: string): string {
  return url.split(/[?#]/)[0].split("/").pop() ?? url;
}

// A file dropped straight into a product family's own "Website" folder (e.g.
// "QS Servo") rather than one of its per-model subfolders — those subfolders
// are ManualHub's own mirror of the per-product documents already merged in
// by mergeLive, so descending into them here would double them up. Only the
// folder's direct document children have nowhere else to go.
function directDocRows(node: PublicDocNode): DlRow[] {
  return (node.children ?? [])
    .filter((c): c is PublicDocNode & { fileUrl: string } => c.nodeType === "document" && !!c.fileUrl)
    .map((c) => ({
      key: c.id,
      title: c.name,
      ext: extFromUrl(c.fileUrl),
      version: "—",
      variants: [{ lang: extFromUrl(c.fileUrl), url: c.fileUrl, sizeLabel: "" }],
    }));
}

function collectDocRows(node: PublicDocNode): DlRow[] {
  const rows: DlRow[] = [];
  const walk = (n: PublicDocNode) => {
    if (n.nodeType === "document" && n.fileUrl) {
      rows.push({
        key: n.id,
        title: n.name,
        ext: extFromUrl(n.fileUrl),
        version: "—",
        variants: [{ lang: extFromUrl(n.fileUrl), url: n.fileUrl, sizeLabel: "" }],
      });
      return;
    }
    for (const child of n.children ?? []) walk(child);
  };
  for (const child of node.children ?? []) walk(child);
  return rows;
}

/** New CRM-managed categories under "Website" beyond the 5 static ones —
 *  rendered as extra families appended after them, so adding a category in
 *  the ERP shows up here as the next tab without any code change. */
function buildExtraFamilies(root: PublicDocNode | null): DlGroup[] {
  if (!root?.children) return [];
  return root.children
    .filter((child) => child.nodeType === "folder" && !STATIC_FAMILY_NAMES.has(child.name))
    .map((child) => ({
      id: slugify(child.name),
      label: child.name,
      heading: child.name,
      desc: child.description ?? "",
      rows: collectDocRows(child),
    }))
    .filter((g) => (g.rows?.length ?? 0) > 0);
}

// Appends live CRM documents onto "catalogue"/"software"'s static rows
// (see WEBSITE_FOLDER_NAME_BY_FAMILY_ID) — additive, never replacing a
// static row, since nothing here can tell a CRM doc apart from its static
// counterpart other than URL. Deduped by file URL so re-uploading the same
// static file's real link into the CRM doesn't double it up on the page.
function mergeLiveWebsiteDocs(groups: DlGroup[], root: PublicDocNode | null): DlGroup[] {
  if (!root?.children) return groups;
  const folderByName = new Map(root.children.map((c) => [c.name, c]));

  return groups.map((group) => {
    const folderName = WEBSITE_FOLDER_NAME_BY_FAMILY_ID[group.id];
    if (!folderName) return group;
    const folder = folderByName.get(folderName);
    if (!folder) return group;

    const existingFilenames = new Set(
      (group.rows ?? []).flatMap((r) => (r.variants ?? []).map((v) => urlFilename(v.url))),
    );
    const liveRows = collectDocRows(folder).filter(
      (r) => !(r.variants ?? []).every((v) => existingFilenames.has(urlFilename(v.url))),
    );
    if (liveRows.length === 0) return group;
    return { ...group, rows: [...(group.rows ?? []), ...liveRows] };
  });
}


// CRM's products.code (lowercased) doesn't match this site's productSlug
// 1:1 for the models the static catalogue already knows about — "Astro 6AV"
// 's only CRM row is coded 6AVE, not 6AV. Map every such real CRM code to
// the productSlug it should merge into. 10iV/10iVE are deliberately NOT
// mapped here — they're two distinct CRM products and each gets its own
// card (falls through to the "unmapped" branch in mergeLive, using its own
// code as the slug) rather than being merged into one "Astro 10i" card.
const SLUG_BY_PRODUCT_CODE: Record<string, string> = {
  "f54": "f54",
  "f86": "f86",
  "f10t": "f10t",
  "6ah": "astro-6ah",
  "6ave": "astro-6av",
};

const FAMILY_BY_PRODUCT_CODE: Record<string, string> = {
  "f54": "controllers",
  "f86": "controllers",
  "f10t": "controllers",
  "astro-10s": "controllers",
  "astro-6ah": "controllers",
  "astro-6av": "controllers",
  "astro-10i": "controllers",
  "sdv3": "servo",
  "sch-motor": "servo",
  "s600": "inverter",
  "s3100": "inverter",
};

// A document dropped straight into a product family's own Website folder
// (see GENERIC_PRODUCT_FOLDER_BY_FAMILY_ID) has no model to merge into, so it
// gets one catch-all product card per family instead — appended after the
// real model cards, replaced wholesale on every refresh (its id is derived,
// never collides with a real model slug).
function mergeGenericFolderProduct(
  groups: DlGroup[],
  root: PublicDocNode | null,
  genericLabel: string,
  docGroupLabel: string,
): DlGroup[] {
  if (!root?.children) return groups;
  const folderByName = new Map(root.children.map((c) => [c.name, c]));

  return groups.map((group) => {
    if (!group.products) return group;
    const folderName = GENERIC_PRODUCT_FOLDER_BY_FAMILY_ID[group.id];
    if (!folderName) return group;
    const folder = folderByName.get(folderName);
    if (!folder) return group;

    const rows = directDocRows(folder);
    const genericId = `${group.id}-general`;
    const products = group.products.filter((p) => p.id !== genericId);
    if (rows.length === 0) return { ...group, products };

    products.push({ id: genericId, label: genericLabel, groups: [{ id: "manual", label: docGroupLabel, rows }] });
    return { ...group, products };
  });
}

export function LiveDownloadsTree({
  groups,
  eyebrow,
  allLabel,
  headers,
  support,
  docGroupLabels,
  docTypeLabels,
  genericProductLabel,
}: {
  groups: DlGroup[];
  eyebrow: string;
  allLabel: string;
  headers: { name: string; version: string; download: string };
  support: { title: string; cta: string };
  /** i18n `downloads.index.docGroup` — labels for the per-product tabs
   *  (e.g. "Hướng dẫn vận hành") a live document's document_type maps to. */
  docGroupLabels: Record<string, string>;
  /** i18n `downloads.index.docType` — used to compose a live row's title,
   *  same as the static tree's own titleOf(). */
  docTypeLabels: Record<string, string>;
  /** i18n `downloads.index.tree.generic` — card label for documents filed
   *  straight into a family's Website folder rather than a model subfolder. */
  genericProductLabel: string;
}) {
  const liveItems = useLiveManuals();
  const websiteRoot = useLiveWebsiteDocs();

  const merged = liveItems ? mergeLive(groups, liveItems, docGroupLabels, docTypeLabels) : groups;
  const withWebsiteDocs = mergeLiveWebsiteDocs(merged, websiteRoot);
  const withGeneric = mergeGenericFolderProduct(withWebsiteDocs, websiteRoot, genericProductLabel, docGroupLabels.manual);
  const withExtras = [...withGeneric, ...buildExtraFamilies(websiteRoot)];

  return (
    <DownloadsTree groups={withExtras} eyebrow={eyebrow} allLabel={allLabel} headers={headers} support={support} />
  );
}

function mergeLive(
  groups: DlGroup[],
  items: PublicManual[],
  docGroupLabels: Record<string, string>,
  docTypeLabels: Record<string, string>,
): DlGroup[] {
  // productSlug -> documentType -> rows, so a product with manuals of two
  // types (operation + installation) — or two CRM product rows sharing one
  // slug, like 10iV/10iVE both under "astro-10i" — gets everything merged
  // under the one card.
  const byProduct = new Map<string, Map<string, PublicManual[]>>();
  const familyBySlug = new Map<string, string>();
  for (const m of items) {
    // CRM product_code case doesn't reliably match this site's lowercase
    // productSlug (e.g. "F86" vs "f86"), and some CRM codes don't match the
    // slug at all (6AVE vs astro-6av, 10iV/10iVE both vs astro-10i) — go
    // through SLUG_BY_PRODUCT_CODE rather than lowercasing productCode
    // directly. Any CRM product with no entry here still gets shown (using
    // its own code as the slug, defaulted into "controllers") — the site's
    // product list is meant to track the CRM catalog automatically: every
    // CRM product that has at least one released ManualHub document shows
    // up, and one with none simply never appears (nothing here builds an
    // empty card).
    const productCode = m.productCode?.toLowerCase();
    if (!productCode) continue;
    const slug = SLUG_BY_PRODUCT_CODE[productCode] ?? productCode;
    familyBySlug.set(slug, FAMILY_BY_PRODUCT_CODE[slug] ?? "controllers");
    if (!byProduct.has(slug)) byProduct.set(slug, new Map());
    const byType = byProduct.get(slug)!;
    const type = m.documentType ?? "";
    if (!byType.has(type)) byType.set(type, []);
    byType.get(type)!.push(m);
  }
  if (byProduct.size === 0) return groups;

  return groups.map((group) => {
    if (!group.products) return group;
    const productsById = new Map(group.products.map((p) => [p.id, p]));

    for (const [slug, byType] of byProduct) {
      if (familyBySlug.get(slug) !== group.id) continue;
      const existing = productsById.get(slug);
      const liveGroups = buildDocGroups(byType, docGroupLabels, docTypeLabels);
      if (existing) {
        // Merge: keep static doc-groups, append/replace matching-id ones
        // with the live rows so a manual actually published in ManualHub
        // takes over from whatever static placeholder existed for it.
        const byId = new Map(existing.groups.map((g) => [g.id, g]));
        for (const lg of liveGroups) byId.set(lg.id, lg);
        productsById.set(slug, { ...existing, groups: [...byId.values()].filter((g) => g.rows.length > 0) });
      } else {
        productsById.set(slug, {
          id: slug,
          label: byType.values().next().value?.[0]?.productName ?? slug,
          groups: liveGroups,
        });
      }
    }

    return { ...group, products: [...productsById.values()] };
  });
}

function buildDocGroups(
  byType: Map<string, PublicManual[]>,
  docGroupLabels: Record<string, string>,
  docTypeLabels: Record<string, string>,
) {
  return [...byType.entries()].map(([type, manuals]) => ({
    id: type || "manual",
    label: docGroupLabels[type] ?? type ?? "—",
    rows: groupByLanguage(manuals, docTypeLabels),
  }));
}

// "2026/09" from an ISO releasedAt — same "YYYY/MM" shape as the static
// tree's own date-as-version fallback (see page.tsx's editionVersion).
function formatReleaseDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  return iso.slice(0, 7).replace("-", "/");
}

// Collapses VI/EN editions of the same manual into one DlRow with two
// download buttons, same as the static tree's groupByDocument().
//
// VI and EN editions are independent ManualHub lineages (unlinked records,
// each published on its own schedule — see ManualHubApp.tsx's create flow),
// so they can legitimately release on different days and sit on different
// version numbers. The row no longer carries one shared version for both;
// each variant button shows its own edition's release date instead (falling
// back to "v<version>" if the API ever omits releasedAt), so a visitor can
// tell at a glance whether the EN PDF is older than the VI one.
function groupByLanguage(manuals: PublicManual[], docTypeLabels: Record<string, string>): DlRow[] {
  const sorted = [...manuals].sort((a, b) => (a.language === "vi" ? -1 : b.language === "vi" ? 1 : 0));
  const head = sorted[0];
  const docType = head.documentType ? docTypeLabels[head.documentType] ?? head.documentType : "";
  return [
    {
      key: head.id,
      title: docType ? `${head.productName ?? head.title} — ${docType}` : head.title,
      ext: extFromUrl(head.downloadUrl),
      version: "—",
      variants: sorted.map((m) => ({
        lang: m.language.toUpperCase(),
        url: m.downloadUrl,
        sizeLabel: "",
        version: formatReleaseDate(m.releasedAt) ?? (m.version ? `v${m.version}` : undefined),
      })),
    },
  ];
}
