import { downloads, type DownloadFile, type DownloadCategory } from "@/data/downloads";

export type { DownloadFile, DownloadCategory } from "@/data/downloads";

// Fixed display order of the four download sections.
export const DOWNLOAD_CATEGORY_ORDER: DownloadCategory[] = [
  "catalogue",
  "operation",
  "installation",
  "software",
];

export type DownloadGroup = {
  category: DownloadCategory;
  files: DownloadFile[];
};

// All files are listed regardless of UI locale — a Vietnamese visitor may still
// need an English-only manual — with the file's own language shown as a badge.
export function getAllDownloads(): DownloadFile[] {
  return downloads;
}

export function getDownloadGroups(): DownloadGroup[] {
  return DOWNLOAD_CATEGORY_ORDER.map((category) => ({
    category,
    files: downloads.filter((d) => d.category === category),
  })).filter((g) => g.files.length > 0);
}

// Files surfaced on a product detail page: everything tagged to this product
// (manuals, firmware updates) plus the shared editor/explorer software that
// applies to every controller. Kept in download-category order for stable UI.
export function getProductDownloads(slug: string): DownloadFile[] {
  const rank = (d: DownloadFile) => DOWNLOAD_CATEGORY_ORDER.indexOf(d.category);
  return downloads
    .filter((d) => d.productSlug === slug || (d.category === "software" && !d.productSlug))
    .slice()
    .sort((a, b) => rank(a) - rank(b));
}

// Human-readable file size. Shared by the Downloads page and product detail.
export function formatBytes(b: number): string {
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// A single document and its language variants (e.g. F54 operation manual VI + EN).
export type DownloadDoc = {
  key: string;
  variants: DownloadFile[];
};

const LANG_ORDER: Record<string, number> = { vi: 0, en: 1 };

// Collapse files that are the same document in different languages into one
// entry, preserving the source order of first appearance. Variants are sorted
// Vietnamese-first. Identity = titleKey (catalogue) or model (manuals); software
// items have unique models so each stays on its own row.
export function groupByDocument(files: DownloadFile[]): DownloadDoc[] {
  const order: string[] = [];
  const map = new Map<string, DownloadFile[]>();
  for (const f of files) {
    // Scope identity by category so the same model's operation vs installation
    // manual stay on separate rows when categories are mixed (product page).
    const key = `${f.category}::${f.titleKey ?? f.model ?? f.slug}`;
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(f);
  }
  return order.map((key) => ({
    key,
    variants: map.get(key)!.slice().sort((a, b) => LANG_ORDER[a.lang] - LANG_ORDER[b.lang]),
  }));
}
