export type DatasheetExt = "PDF" | "DXF" | "BIN" | "ZIP";

export type Datasheet = {
  slug: string;
  ext: DatasheetExt;
  title: string;
  ref: string;
  category: string;
  series: "F-series" | "Astro-series" | "Servo" | "Bundle";
  lang: "vi" | "en" | "both";
  version: string;
  date: string;
  sizeBytes: number;
  fileUrl: string;
  featured?: boolean;
  productSlug?: string;
};

const MB = 1024 * 1024;

export const datasheets: Datasheet[] = [
  {
    slug: "qs-ds-f54",
    ext: "PDF",
    title: "F54 — Datasheet kỹ thuật chi tiết",
    ref: "QS-DS-F54 · Tiếng Việt · 24 trang",
    category: "Datasheet",
    series: "F-series",
    lang: "vi",
    version: "2.4",
    date: "2026-03-12",
    sizeBytes: Math.round(3.2 * MB),
    fileUrl: "/placeholder-datasheets/qs-ds-f54.pdf",
    productSlug: "f54",
  },
  {
    slug: "qs-ds-f86",
    ext: "PDF",
    title: "F86 — Datasheet kỹ thuật chi tiết",
    ref: "QS-DS-F86 · Tiếng Việt · 28 trang",
    category: "Datasheet",
    series: "F-series",
    lang: "vi",
    version: "2.4",
    date: "2026-03-12",
    sizeBytes: Math.round(3.8 * MB),
    fileUrl: "/placeholder-datasheets/qs-ds-f86.pdf",
    productSlug: "f86",
  },
  {
    slug: "qs-ds-f10t",
    ext: "PDF",
    title: "F10T (Cảm ứng) — Datasheet + sơ đồ chân",
    ref: "QS-DS-F10T · Tiếng Việt · 32 trang",
    category: "Datasheet",
    series: "F-series",
    lang: "vi",
    version: "2.5",
    date: "2026-02-28",
    sizeBytes: Math.round(4.6 * MB),
    fileUrl: "/placeholder-datasheets/qs-ds-f10t.pdf",
    featured: true,
    productSlug: "f10t",
  },
  {
    slug: "qs-ds-a6ah",
    ext: "PDF",
    title: "Astro 6AH — Datasheet (vòng kín)",
    ref: "QS-DS-A6AH · Tiếng Việt · 24 trang",
    category: "Datasheet",
    series: "Astro-series",
    lang: "vi",
    version: "2.4",
    date: "2026-02-15",
    sizeBytes: Math.round(3.4 * MB),
    fileUrl: "/placeholder-datasheets/qs-ds-a6ah.pdf",
    productSlug: "astro-6ah",
  },
  {
    slug: "qs-ds-a6av",
    ext: "PDF",
    title: "Astro 6AV — Datasheet (vertical install)",
    ref: "QS-DS-A6AV · Tiếng Việt · 24 trang",
    category: "Datasheet",
    series: "Astro-series",
    lang: "vi",
    version: "2.3",
    date: "2026-02-15",
    sizeBytes: Math.round(3.3 * MB),
    fileUrl: "/placeholder-datasheets/qs-ds-a6av.pdf",
    productSlug: "astro-6av",
  },
  {
    slug: "qs-cad-a10i",
    ext: "DXF",
    title: "Astro 10i — Bản vẽ lắp đặt cơ khí (DXF + STEP)",
    ref: "QS-CAD-A10i · Bundle",
    category: "CAD",
    series: "Astro-series",
    lang: "both",
    version: "1.2",
    date: "2026-02-02",
    sizeBytes: Math.round(5.9 * MB),
    fileUrl: "/placeholder-datasheets/qs-cad-a10i.zip",
    productSlug: "astro-10i",
  },
  {
    slug: "qs-fw-f-2.1.4",
    ext: "BIN",
    title: "Firmware F-series — v2.1.4 (stable)",
    ref: "QS-FW-F-2.1.4 · Cho F54 / F86 / F10T",
    category: "Firmware",
    series: "F-series",
    lang: "both",
    version: "2.1.4",
    date: "2026-03-28",
    sizeBytes: Math.round(8.6 * MB),
    fileUrl: "/placeholder-datasheets/qs-fw-f-2.1.4.bin",
    featured: true,
  },
  {
    slug: "qs-cmp-2026",
    ext: "ZIP",
    title: "Bundle so sánh — F-series & Astro-series",
    ref: "QS-CMP-2026 · 6 datasheet + bảng so sánh",
    category: "Bundle",
    series: "Bundle",
    lang: "vi",
    version: "1.0",
    date: "2026-01-20",
    sizeBytes: Math.round(22.4 * MB),
    fileUrl: "/placeholder-datasheets/qs-cmp-2026.zip",
  },
];
