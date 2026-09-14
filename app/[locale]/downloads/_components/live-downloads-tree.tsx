"use client";

import { useLiveManuals } from "@/lib/crm/live-manuals-context";
import type { PublicManual } from "@/lib/crm/manuals-client";
import { DownloadsTree, type DlGroup, type DlProduct, type DlRow } from "./downloads-tree";


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
