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
    const key = f.titleKey ?? f.model ?? f.slug;
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
