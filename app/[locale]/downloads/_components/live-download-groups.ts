// Maps the CRM's live "Website" doc tree (PublicDocNode) into the DlGroup[]
// shape DownloadsTree/DocTable already render — reusing that component
// keeps the original two-pane layout (sidebar + right-side table, including
// its own "no rows" empty state) instead of a bespoke tree renderer, so an
// empty family/product looks exactly like the design always intended: a
// selectable row with an empty table, not a missing section.
//
// A family with sub-folders (e.g. "Bộ điều khiển" → one folder per
// controller model) becomes a DlGroup with `products`; each product's own
// document-type subfolders (e.g. "Hướng dẫn vận hành", "Hướng dẫn lắp đặt")
// become that product's doc-group tabs (see buildDocGroups) — a product
// folder with no type subfolders falls back to one generic tab. A family
// with no sub-folders (e.g. "Catalogue & Hồ sơ") lists its documents
// directly as `rows`, matching a leaf family in the original design.
//
// A ManualHub-linked VI/EN pair — same productId + documentType, see
// company-docs-client.ts's PublicDocNode — collapses into ONE row with two
// variant buttons (VI ↓ / EN ↓), matching DocTable's original two-language
// layout, instead of two separate rows for the same logical document. A
// plain CompanyDoc upload (no productId/documentType) has no pairing key,
// so it always renders as its own single-variant row.

import type { PublicDocNode } from "@/lib/crm/company-docs-client";
import { formatBytes } from "@/lib/data/downloads";
import { products as controllerProducts } from "@/data/products";
import { productSeries } from "@/data/series";
import type { DlDocGroup, DlGroup, DlProduct, DlRow, DlVariant } from "./downloads-tree";

const norm = (s: string) => s.toLowerCase().replace(/[\s-]/g, "");

// The CRM's "Website" folders are named once, in Vietnamese, and used as-is
// for both nodeType and id — so a family's label/heading/desc never changed
// with the site locale (an English visitor still saw "Bộ điều khiển"). This
// maps the CRM's fixed Vietnamese folder name to the family id under
// `downloads.index.families` in messages/<locale>/downloads.json, whose
// label/heading/desc DO have an English edition — an EN visitor gets those
// instead of the raw CRM name. A folder that isn't one of these five (an
// admin-added extra category) has no such i18n entry and keeps showing its
// own CRM name in every locale, same as before.
const FAMILY_ID_BY_CRM_NAME: Record<string, string> = {
  "Catalogue & Hồ sơ": "catalogue",
  "Bộ điều khiển": "controllers",
  "QS Servo": "servo",
  "Biến tần": "inverter",
  "Phần mềm & Dữ liệu": "software",
};

type FamilyLabels = Record<string, { label: string; heading: string; desc: string }>;

function familyText(
  crmName: string,
  crmDescription: string | undefined,
  familyLabels: FamilyLabels,
): { label: string; heading: string; desc: string } {
  const id = FAMILY_ID_BY_CRM_NAME[crmName];
  const localized = id ? familyLabels[id] : undefined;
  return localized ?? { label: crmName, heading: crmName, desc: crmDescription ?? "" };
}

// Controller model name (e.g. "F54", "Astro 10i") -> its {slug, name} (the
// name in full, e.g. "Astro 6AH" not just "6AH") for its /electronics/<slug>
// detail page, so a document row filed under that model's Website subfolder
// can link back to it AND show the site's own full product name rather than
// the CRM's bare folder name. Product `name` has no per-locale variant (see
// data/products.ts), so this map is locale-neutral too. QS Servo/Biến tần
// subfolders aren't controller products at all — their real names/pages
// live in data/series.ts (productSeries) instead, keyed the same way and
// merged in below, since /electronics/[slug] resolves either source at
// that same URL shape (see app/[locale]/electronics/[slug]/page.tsx).
const PRODUCT_BY_NORM_NAME = new Map([
  ...controllerProducts.map((p) => [norm(p.name), { slug: p.slug, name: p.name }] as const),
  ...productSeries.map((s) => [norm(s.name), { slug: s.slug, name: s.name }] as const),
]);

// The CRM's "Bộ điều khiển" subfolder names don't always match
// data/products.json's own `name` field closely enough for norm() alone to
// bridge them — the "Astro " prefix is dropped in the CRM, and some models
// carry a trailing version letter there ("10iV"/"10iVE", "6AVE") that
// products.json doesn't (just "Astro 10i", "Astro 6AV"). Without this, those
// CRM folders' rows silently lose their "→ <model>" detail-page link (no
// error, just `product.href` staying undefined) even though the model does
// have a real page — and their title keeps showing the bare CRM name
// ("6AH") instead of the site's real product name ("Astro 6AH"). Keyed by
// norm(CRM folder name) -> the matching product's own norm(name), so a
// lookup miss on PRODUCT_BY_NORM_NAME gets a second chance through this
// alias before giving up on a match entirely. Extend this whenever a
// newly-added CRM model folder's name doesn't naturally match its
// products.json entry.
const CRM_FOLDER_NAME_ALIAS: Record<string, string> = {
  [norm("6AH")]: norm("Astro 6AH"),
  [norm("6AVE")]: norm("Astro 6AV"),
  [norm("10iV")]: norm("Astro 10i"),
  [norm("10iVE")]: norm("Astro 10i"),
  // "QS Servo" family: CRM's "QS servo driver" vs. series.json's "QS servo
  // drive" ("driver" vs "drive" — a real, near-miss name difference, not a
  // formatting one norm() could bridge on its own). "Biến tần" (S600, ...)
  // isn't listed here because its CRM folder names already match a
  // productSeries entry's `name` exactly once norm()'d.
  [norm("QS servo driver")]: norm("QS servo drive"),
};

// Resolves a CRM "Bộ điều khiển" subfolder name to the matching real product
// (slug + full display name), trying the alias map when a direct norm()
// match fails. Undefined when the CRM added a model folder with no
// corresponding products.json entry at all yet.
function resolveProductForCrmFolder(crmName: string): { slug: string; name: string } | undefined {
  const key = norm(crmName);
  return PRODUCT_BY_NORM_NAME.get(key) ?? PRODUCT_BY_NORM_NAME.get(CRM_FOLDER_NAME_ALIAS[key] ?? "");
}

// Extension lives on the final path segment only — looking for the last "."
// in the whole URL instead misfires on a route with no real extension (e.g.
// ".../download-pdf"), where the last "." is actually inside the domain
// (crm.qstcnc.com), slicing everything after it — the entire path — into
// the "extension" and printing it as the button label.
function extLabel(url: string): string {
  const clean = url.split(/[?#]/)[0];
  const segment = clean.slice(clean.lastIndexOf("/") + 1);
  const dot = segment.lastIndexOf(".");
  if (dot !== -1) return segment.slice(dot + 1).toUpperCase();
  // A route with no real filename extension (both the ManualHub-linked and
  // the plain CompanyDoc download routes serve everything through a
  // "download-pdf" endpoint — see company-docs-client.ts) is always a PDF.
  return /pdf/i.test(segment) ? "PDF" : "FILE";
}

// Strips whatever variant suffix SyncManualHubDocument bakes into Name (see
// qs-crm-be's companydoc.Service) — a paired row shows one title, not the
// first variant's language-specific one. Two formats have existed over
// time: the older "(VI)"/"(EN) - v1.0" and the current "- VI"/"- EN" — both
// stripped here so this keeps working regardless of which convention a
// given row's `name` happens to be in (old unsynced data vs. freshly
// re-published documents). Only ever used as a fallback now — see
// buildTitle below, which bypasses `name` (and this stripping) entirely
// whenever the row's own product/type are known structurally.
function baseTitle(name: string): string {
  const stripped = name
    .replace(/\s*\((?:VI|EN|vi|en)\)(?:\s*-\s*v[\w.]+)?\s*$/, "")
    .replace(/\s*-\s*(?:VI|EN|vi|en)\s*$/, "")
    .trim();
  return stripped || name;
}

// The two bilingual PDFs under "Catalogue & Hồ sơ" (the product catalogue
// and the company profile) predate document_type on plain CompanyDoc
// uploads and, in practice, still don't reliably carry it from the CRM —
// their `name` is baked once, in Vietnamese, with no English edition, so an
// English visitor saw the raw Vietnamese title. Recognizing them by that
// fixed name — the one deliberate exception to buildTitle's "CRM-data-driven,
// never a name lookup" rule above — lets buildTitle treat them as if
// document_type were set, so its normal `!productLabel && typeLabel` branch
// replaces the name with the localized docGroup label instead. Once the CRM
// actually tags these with a document_type, `doc.documentType` below wins
// and this map is never consulted for them.
const DOC_TYPE_BY_KNOWN_NAME: Record<string, string> = {
  [norm("Catalogue sản phẩm")]: "product_catalogue",
  [norm("Hồ sơ công ty")]: "company_profile",
};

function resolveDocumentType(doc: PublicDocNode): string | undefined {
  return doc.documentType ?? DOC_TYPE_BY_KNOWN_NAME[norm(baseTitle(doc.name))];
}

function toVariant(doc: PublicDocNode): DlVariant {
  const ext = extLabel(doc.fileUrl ?? "");
  return {
    lang: doc.language ? doc.language.toUpperCase() : ext,
    url: doc.fileUrl ?? "",
    sizeLabel: doc.sizeBytes ? formatBytes(doc.sizeBytes) : ext,
  };
}

function collectDocuments(node: PublicDocNode): PublicDocNode[] {
  if (node.nodeType === "document") return node.fileUrl ? [node] : [];
  return (node.children ?? []).flatMap(collectDocuments);
}

// "2026/09/18" from an ISO updatedAt — plain date, no time, since the table
// column only needs to answer "is this stale?" at a glance.
function formatUpdated(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 10).replace(/-/g, "/");
}

// The most recent updatedAt across a VI/EN pair, so the row-level column
// reflects whichever edition changed last.
function latestUpdated(docs: PublicDocNode[]): string {
  const isoTimes = docs.map((d) => d.updatedAt).filter((v): v is string => !!v);
  if (isoTimes.length === 0) return "—";
  return formatUpdated(isoTimes.sort().at(-1));
}

// "<name> — <type label>" so a bare ManualHub title (often just the model,
// e.g. "F54") reads as a distinct document once several document types for
// the same model sit in one list — same composition the (now dead) legacy
// live-downloads-tree.tsx used for its own title.
function titleWithType(name: string, documentType: string | undefined, docTypeLabels: Record<string, string>): string {
  const label = documentType ? (docTypeLabels[documentType] ?? documentType) : undefined;
  return label ? `${name} — ${label}` : name;
}

// The CRM bakes a document's title (`name`) in whichever language it was
// last published in — a Vietnamese-locale visitor could otherwise see an
// English row's raw name ("F54 - Operation Guide - EN") sitting next to a
// translated Vietnamese one, or see the type label doubled up once
// titleWithType appends its own (baseTitle can't reliably strip a suffix
// it's never seen before, e.g. a future naming convention). Whenever the
// row's product model and document type are both known structurally
// (`productLabel` from the CRM subfolder name, `doc.documentType` from
// `manualhub_document_type`), this bypasses `name` entirely and builds
// "<Model> — <type label in the page's own locale>" straight from
// `docTypeLabels`, the exact same source titleWithType already uses for
// tab labels — so the title is always correctly localized regardless of
// what language the underlying document happened to be authored/published
// in. A hand-uploaded file with no product folder (e.g. directly under
// "Catalogue & Hồ sơ") still gets a real localized title as long as its
// `document_type` is set in the CRM (the free-text "Loại tài liệu" field on
// plain CompanyDoc documents) — the type label alone becomes the title.
// This is deliberately CRM-data-driven rather than a per-document name
// lookup hardcoded here: adding a new file just means giving it a
// document_type that already has (or gets, once) a docTypeLabels entry —
// it never requires touching this file again. Only falls back to the CRM's
// own baked name (via baseTitle) when the document has no documentType at
// all to build a title from — see resolveDocumentType's own comment for the
// one deliberate exception to "CRM-data-driven".
function buildTitle(
  doc: PublicDocNode,
  docTypeLabels: Record<string, string>,
  productLabel: string | undefined,
  appendType: boolean,
  // QS Servo/Biến tần: each file under a model is its own distinct
  // document (manufacturer-provided manuals, wiring diagrams, dimension
  // sheets, ...), not a VI/EN pair of "the same document" the way a
  // controller's operation/installation manual is — collapsing them all
  // down to "<Model> — <type>" would make genuinely different documents
  // (e.g. "SDV3 Basic Wiring Diagram" and "SDV3 Control Wiring Diagram")
  // show up with the identical title. True here keeps each row's own
  // filename-derived name regardless of documentType/productLabel.
  preferRawName = false,
): string {
  if (preferRawName) {
    // Never appends the type label here, tab or no tab — a raw filename
    // like "SDV3 Basic Wiring Diagram" already reads as a complete title
    // on its own; tacking "— Sổ tay & hướng dẫn" onto it is redundant even
    // outside a type tab (unlike the productLabel branch below, where
    // "<Model>" alone genuinely needs the type to stay meaningful).
    return baseTitle(doc.name);
  }
  const documentType = resolveDocumentType(doc);
  const typeLabel = documentType ? (docTypeLabels[documentType] ?? documentType) : undefined;
  if (!productLabel && typeLabel) {
    return typeLabel;
  }
  if (productLabel && documentType) {
    const label = docTypeLabels[documentType] ?? documentType;
    return appendType ? `${productLabel} — ${label}` : productLabel;
  }
  const base = baseTitle(doc.name);
  return appendType ? titleWithType(base, documentType, docTypeLabels) : base;
}

// A VI/EN pair carries two independently-authored names (ManualHub names
// each edition on its own), so a paired row must pick the edition matching
// the page's own locale for its title instead of always the first doc
// pushed into the group — otherwise a Vietnamese page could show the raw
// English document name (or vice versa) depending on array order.
function pickTitleDoc(group: PublicDocNode[], locale: string): PublicDocNode {
  const want = locale.toUpperCase();
  return group.find((d) => d.language?.toUpperCase() === want) ?? group[0];
}

function toRows(
  docs: PublicDocNode[],
  docTypeLabels: Record<string, string>,
  locale: string,
  product?: { href?: string; label: string },
  // False when the caller already scoped these docs into a document-type
  // tab (the CRM's own subfolder, e.g. "Hướng dẫn vận hành") — the tab label
  // already says the type, so repeating it in every row's title would be
  // redundant clutter.
  appendType = true,
  // See buildTitle's own doc comment — true for QS Servo/Biến tần, where
  // every document is genuinely distinct rather than a VI/EN pair of "the
  // same" document.
  preferRawName = false,
): DlRow[] {
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
    const titleDoc = pickTitleDoc(group, locale);
    const ext = extLabel(group[0].fileUrl ?? "");
    rows.push({
      key: group.map((d) => d.id).sort().join("+"),
      title: buildTitle(titleDoc, docTypeLabels, product?.label, appendType, preferRawName),
      ext,
      version: latestUpdated(group),
      variants: group.map(toVariant),
      productHref: product?.href,
      productLabel: product?.label,
    });
  }
  for (const doc of singles) {
    rows.push({
      key: doc.id,
      title: buildTitle(doc, docTypeLabels, product?.label, appendType, preferRawName),
      ext: extLabel(doc.fileUrl ?? ""),
      version: latestUpdated([doc]),
      variants: [toVariant(doc)],
      productHref: product?.href,
      productLabel: product?.label,
    });
  }
  return rows;
}

// A model folder's (e.g. "F54") documents carry their document type as a
// field on the leaf itself (manualhub_document_type: "operation" /
// "installation" / "maintenance") — the CRM does not nest a subfolder per
// type — so the tabs come from grouping by that field, not from folder
// structure. Untyped documents (plain CompanyDoc uploads with no
// manualhub_document_type) fall into one shared tab.
//
// Every row's own title still carries "<Product> — <Type>" regardless of
// which tab it's in (toRows' `appendType` is always true below) — the tab
// already scopes the list to one type, but the row keeps repeating it so a
// row copied/screenshotted/linked out of tab context (e.g. search results,
// a shared link) still reads on its own, and so every product's rows look
// the same whether split into tabs or not.
function buildDocGroups(
  node: PublicDocNode,
  docTypeLabels: Record<string, string>,
  locale: string,
  product: { href?: string; label: string } | undefined,
  genericLabel: string,
  // See buildTitle's own doc comment — true for QS Servo/Biến tần. Only
  // affects each row's own title (still every file's own filename, never
  // collapsed to "<Model> — <type>") — tabs still split by document_type
  // exactly as for any other family, so admins can still organize QS
  // Servo/Biến tần files into type tabs via the CRM's fixed catalog while
  // each row keeps reading as its own distinct document.
  preferRawName = false,
): DlDocGroup[] {
  const docs = collectDocuments(node);
  const byType = new Map<string, PublicDocNode[]>();
  for (const doc of docs) {
    const type = doc.documentType ?? "";
    const bucket = byType.get(type);
    if (bucket) bucket.push(doc);
    else byType.set(type, [doc]);
  }

  // Nothing to split on (every doc untyped, or only one type present) — one
  // flat tab, same as a document that has no type info to show a tab for.
  if (byType.size <= 1) {
    return [{ id: "all", label: genericLabel, rows: toRows(docs, docTypeLabels, locale, product, true, preferRawName) }];
  }

  const groups: DlDocGroup[] = [];
  for (const [type, typeDocs] of byType) {
    if (!type) {
      groups.push({ id: "general", label: genericLabel, rows: toRows(typeDocs, docTypeLabels, locale, product, true, preferRawName) });
      continue;
    }
    groups.push({
      id: type,
      label: docTypeLabels[type] ?? type,
      rows: toRows(typeDocs, docTypeLabels, locale, product, true, preferRawName),
    });
  }
  return groups;
}

export function buildLiveDownloadGroups(
  root: PublicDocNode | null,
  genericDocGroupLabel: string,
  docTypeLabels: Record<string, string>,
  locale: string,
  familyLabels: FamilyLabels,
): DlGroup[] {
  if (!root) return [];
  const families = (root.children ?? []).filter((c) => c.nodeType === "folder");

  return families.map((family): DlGroup => {
    const subFolders = (family.children ?? []).filter((c) => c.nodeType === "folder");
    const directDocs = (family.children ?? []).filter((c) => c.nodeType === "document" && c.fileUrl);
    const { label, heading, desc } = familyText(family.name, family.description, familyLabels);
    // QS Servo/Biến tần: every file is its own distinct document (see
    // buildTitle's own comment) — keep each row's actual filename as its
    // title instead of collapsing by document_type.
    const preferRawName = family.name === "QS Servo" || family.name === "Biến tần";

    if (subFolders.length === 0) {
      return {
        id: family.id,
        label,
        heading,
        desc,
        rows: toRows(directDocs, docTypeLabels, locale, undefined, true, preferRawName),
      };
    }

    const products: DlProduct[] = subFolders
      .map((sub) => {
        // `href`/full `name` only resolve for controller models registered
        // in products.json — a servo/inverter series subfolder simply gets
        // no link and keeps its bare CRM name, same as today. `label` (the
        // model name to actually show, e.g. "Astro 6AH" once resolved) must
        // stay set even without a match — falling back to the CRM's own
        // `sub.name` ("6AH") — or buildTitle (see toRows) loses the model
        // name entirely and falls back to the CRM's own baked `name`
        // string, which can double up the type label once titleWithType
        // appends its own on top (a bug this fixes: e.g. "6AH - Operation
        // Guide — Hướng dẫn vận hành").
        const resolved = resolveProductForCrmFolder(sub.name);
        const productLabel = resolved?.name ?? sub.name;
        const product = {
          href: resolved ? `/electronics/${resolved.slug}` : undefined,
          label: productLabel,
        };
        const groups = buildDocGroups(sub, docTypeLabels, locale, product, genericDocGroupLabel, preferRawName);
        return { id: sub.id, label: productLabel, groups };
      })
      // A model folder the CRM created but never filed a document under yet
      // would otherwise show up as a selectable card with an empty table —
      // drop it instead so the tree only lists models that actually have
      // something to download.
      .filter((p) => p.groups.some((g) => g.rows.length > 0));

    return {
      id: family.id,
      label,
      heading,
      desc,
      products,
    };
  });
}
