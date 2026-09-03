"use client";

import { useLiveManuals } from "@/lib/crm/live-manuals-context";
import type { PublicManual } from "@/lib/crm/manuals-client";
import { DownloadsTree, type DlGroup, type DlProduct, type DlRow } from "./downloads-tree";

// Wraps the static <DownloadsTree> (sidebar groups → "Tất cả tài liệu" +
// per-product entries → click a product, its docs show on the right) and
// merges in live ManualHub documents client-side, so a manual published in
// ManualHub shows up right inside the existing sidebar navigation — under
// its real product, in its real family — instead of a separate section.
//
// This site is a static export (see next.config.mjs: `output: "export"`,
// no server runtime), so the merge has to happen in the browser after
// mount; the first paint is the static, build-time snapshot, then live
// documents fold in a moment later. That's an acceptable tradeoff — no
// rebuild+redeploy needed for a new manual to appear. The actual fetch +
// localStorage cache lives in LiveManualsProvider (lib/crm/live-manuals-context.tsx),
// shared with the hero's live document count so the page makes one CRM
// request, not two.
//
// Family membership below is hardcoded to the exact product codes seeded in
// qs-crm-be/seeds/000013_website_product_catalog.sql — there is no
// "family/category" concept on the BE side (ManualHub only knows
// product_id), so this is the one place that knowledge has to live.
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

export function LiveDownloadsTree({
  groups,
  eyebrow,
  allLabel,
  headers,
  support,
  docGroupLabels,
  docTypeLabels,
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
}) {
  const liveItems = useLiveManuals();

  const merged = liveItems ? mergeLive(groups, liveItems, docGroupLabels, docTypeLabels) : groups;

  return (
    <DownloadsTree groups={merged} eyebrow={eyebrow} allLabel={allLabel} headers={headers} support={support} />
  );
}

function mergeLive(
  groups: DlGroup[],
  items: PublicManual[],
  docGroupLabels: Record<string, string>,
  docTypeLabels: Record<string, string>,
): DlGroup[] {
  // productCode -> documentType -> rows, so a product with manuals of two
  // types (operation + installation) gets both tabs populated.
  const byProduct = new Map<string, Map<string, PublicManual[]>>();
  for (const m of items) {
    const familyId = m.productCode ? FAMILY_BY_PRODUCT_CODE[m.productCode] : undefined;
    if (!familyId || !m.productCode) continue; // no known family — nothing to merge into (see module comment)
    if (!byProduct.has(m.productCode)) byProduct.set(m.productCode, new Map());
    const byType = byProduct.get(m.productCode)!;
    const type = m.documentType ?? "";
    if (!byType.has(type)) byType.set(type, []);
    byType.get(type)!.push(m);
  }
  if (byProduct.size === 0) return groups;

  return groups.map((group) => {
    if (!group.products) return group;
    const productsById = new Map(group.products.map((p) => [p.id, p]));

    for (const [productCode, byType] of byProduct) {
      if (FAMILY_BY_PRODUCT_CODE[productCode] !== group.id) continue;
      const existing = productsById.get(productCode);
      const liveGroups = buildDocGroups(byType, docGroupLabels, docTypeLabels);
      if (existing) {
        // Merge: keep static doc-groups, append/replace matching-id ones
        // with the live rows so a manual actually published in ManualHub
        // takes over from whatever static placeholder existed for it.
        const byId = new Map(existing.groups.map((g) => [g.id, g]));
        for (const lg of liveGroups) byId.set(lg.id, lg);
        productsById.set(productCode, { ...existing, groups: [...byId.values()].filter((g) => g.rows.length > 0) });
      } else {
        productsById.set(productCode, {
          id: productCode,
          label: byType.values().next().value?.[0]?.productName ?? productCode,
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
      ext: "PDF",
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
