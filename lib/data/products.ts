import {
  products,
  type Product,
  type KitItem,
  type ProductPhoto,
  type SpecColumn,
  type ProductGalleryPhoto,
  type ProductSpecGroup,
} from "@/data/products";
import type { Locale } from "@/lib/i18n/config";

export type ProductSpec = { l: string; v: string | string[] };
export type ProductSpecColumn = SpecColumn;
export type ProductImage = { url: string; alt: string };
export type ProductKitItem = KitItem;
export type ProductFrontPhoto = ProductPhoto;

/** What a gallery photo depicts, derived from its (Vietnamese) source alt text. */
export type ShotKind = "ui" | "wiring" | "application" | "rear" | "side" | "product";
export type ProductGalleryImage = ProductGalleryPhoto & { kind: ShotKind };

export type ProductView = {
  slug: string;
  series: string;
  axes: string;
  display: string;
  badge: string | null;
  tag: string;
  name: string;
  desc: string;
  bullets: string[];
  interfaces: ProductSpecColumn[];
  specs: ProductSpec[];
  image: ProductFrontPhoto;
  bundle: ProductKitItem[];
  images: ProductImage[];
  /** Crawled enrichment (legacy site). Optional — not every model has it. */
  overview: string | null;
  highlights: string[];
  overviewImage: ProductFrontPhoto | null;
  video: { youtubeId: string; title?: string } | null;
  gallery: ProductGalleryImage[];
  documents: string[];
  software: string[];
  accessories: string[];
  sourceUrl: string | null;
  detailedSpecs: ProductSpecGroup[];
  gCodes: string[];
  sort: number;
  publishedAt: Date | null;
};

/**
 * Pins a photo to a section of the detail page from its Vietnamese alt text.
 * Runs on the source alt (before EN localization) so classification is stable
 * across locales.
 */
function classifyShot(alt: string): ShotKind {
  const a = alt.toLowerCase();
  if (a.includes("giao diện")) return "ui";
  if (a.includes("sơ đồ") || a.includes("kết nối")) return "wiring";
  if (a.includes("ứng dụng thực tế")) return "application";
  if (a.includes("mặt sau")) return "rear";
  if (a.includes("mặt bên")) return "side";
  return "product";
}

// --- English localization of formulaic Vietnamese catalogue strings ---------
// Prose (overview/highlights) is authored per product as `overviewEn` /
// `highlightsEn`; the maps below cover the repeating catalogue vocabulary so it
// need not be duplicated on every model.

const BUNDLE_LABEL_EN: Record<string, string> = {
  "Bộ nguồn 24V": "24V Power Supply",
  "Tay quay MPG 4 trục": "4-axis MPG Handwheel",
  "Board I/O Link RLTR": "I/O Link RLTR Board",
  "Board I/O Link 1616": "I/O Link 1616 Board",
  "Board I/O Link 32": "I/O Link 32 Board",
};

const SPEC_TITLE_EN: Record<string, string> = {
  "Thông số chính": "Key specifications",
  "Đặc tính kỹ thuật": "Specifications",
  "Phần cứng": "Hardware",
  "Chức năng": "Functions",
};

const SPEC_LABEL_EN: Record<string, string> = {
  "Số trục điều khiển": "Control axes",
  "Kích thước": "Dimensions",
  "Màn hình": "Display",
  "Số cổng I/O": "I/O ports",
  "Điện áp đầu vào": "Input voltage",
  "Giao thức điều khiển": "Control protocol",
  "Chế độ điều khiển": "Control mode",
  "Vật liệu vỏ": "Housing material",
  "Bù rơ cơ khí (Backlash)": "Backlash compensation",
  "Bù sai số hành trình (Pitch Error)": "Pitch error compensation",
};

const SPEC_VALUE_EN: Record<string, string> = {
  Có: "Yes",
  Không: "No",
  "Ladder tích hợp": "Integrated Ladder",
  "Tất cả các trục": "All axes",
  "Vòng hở (Open loop)": "Open loop",
  "Vòng kín (Closed loop)": "Closed loop",
};

function localizeAxes(axes: string): string {
  // "4 trục" -> "4 axes"
  return axes.replace(/trục/g, "axes");
}

function localizeBundleLabel(label: string): string {
  if (BUNDLE_LABEL_EN[label]) return BUNDLE_LABEL_EN[label];
  const m = label.match(/^Bộ điều khiển (.+)$/); // "Bộ điều khiển F54" -> "F54 Controller"
  if (m) return `${m[1]} Controller`;
  return label; // already English (Servo Drive, Tool Setter, 3D Touch Probe, …)
}

function localizeSpecValue(v: string | string[]): string | string[] {
  return Array.isArray(v) ? v.map((x) => SPEC_VALUE_EN[x] ?? x) : SPEC_VALUE_EN[v] ?? v;
}

function localizeSpecGroup(group: ProductSpecGroup): ProductSpecGroup {
  return {
    title: SPEC_TITLE_EN[group.title] ?? group.title,
    rows: group.rows.map((r) => ({ l: SPEC_LABEL_EN[r.l] ?? r.l, v: localizeSpecValue(r.v) })),
  };
}

// "Bộ điều khiển CNC 4 trục F54" -> "F54 4-axis CNC Controller"
function localizeBaseAlt(s: string): string {
  const m = s.match(/^Bộ điều khiển CNC (\d+) trục (.+)$/);
  return m ? `${m[2]} ${m[1]}-axis CNC Controller` : s;
}

function localizeAlt(alt: string): string {
  let m: RegExpMatchArray | null;
  if ((m = alt.match(/^Mặt sau (.+)$/))) return `Rear — ${localizeBaseAlt(m[1])}`;
  if ((m = alt.match(/^Mặt bên (.+)$/))) return `Side — ${localizeBaseAlt(m[1])}`;
  if ((m = alt.match(/^Giao diện vận hành trên (.+)$/)))
    return `Operating interface — ${localizeBaseAlt(m[1])}`;
  if ((m = alt.match(/^Sơ đồ kết nối thiết bị ngoại vi cho (.+)$/)))
    return `Peripheral wiring diagram — ${localizeBaseAlt(m[1])}`;
  if ((m = alt.match(/^Ứng dụng thực tế (.+) trên máy CNC$/)))
    return `${localizeBaseAlt(m[1])} in the field on a CNC machine`;
  return localizeBaseAlt(alt);
}

// Vietnamese is the primary copy; English variants are served on the `en`
// locale. Spec values that are numbers/units stay shared.
function toView(p: Product, index: number, locale: Locale): ProductView {
  const source = p.gallery ?? [];
  const en = locale === "en";
  const gallery: ProductGalleryImage[] = source.map((g) => ({
    ...g,
    alt: en ? localizeAlt(g.alt) : g.alt,
    kind: classifyShot(g.alt),
  }));
  const detailedSpecs = p.detailedSpecs ?? [];
  const bundle = p.bundle;
  return {
    slug: p.slug,
    series: p.series,
    axes: en ? localizeAxes(p.axes) : p.axes,
    display: p.display,
    badge: p.badge ?? null,
    tag: en ? p.tagEn : p.tag,
    name: p.name,
    desc: en ? p.descEn : p.desc,
    bullets: en ? p.bulletsEn : p.bullets,
    interfaces: p.interfaces,
    specs: p.specs,
    image: p.image,
    bundle: en ? bundle.map((c) => ({ ...c, label: localizeBundleLabel(c.label) })) : bundle,
    // Reuse the existing image slot for the crawled photo gallery.
    images: gallery.map((g) => ({ url: g.src, alt: g.alt })),
    overview: (en ? p.overviewEn ?? p.overview : p.overview) ?? null,
    highlights: (en ? p.highlightsEn ?? p.highlights : p.highlights) ?? [],
    overviewImage: p.overviewImage ?? null,
    video: p.video ?? null,
    gallery,
    documents: p.documents ?? [],
    software: p.software ?? [],
    accessories: p.accessories ?? [],
    sourceUrl: p.sourceUrl ?? null,
    detailedSpecs: en ? detailedSpecs.map(localizeSpecGroup) : detailedSpecs,
    gCodes: p.gCodes ?? [],
    sort: index,
    publishedAt: null,
  };
}

export function getAllProducts(locale: Locale): ProductView[] {
  return products.map((p, i) => toView(p, i, locale));
}

export function getProductBySlug(slug: string, locale: Locale): ProductView | null {
  const index = products.findIndex((p) => p.slug === slug);
  return index === -1 ? null : toView(products[index], index, locale);
}

export function getProductSlugs(): string[] {
  return products.map((p) => p.slug);
}
