import {
  products,
  HERO_TRIPTYCH,
  type Product,
  type KitItem,
  type ProductPhoto,
  type SpecColumn,
  type ProductGalleryPhoto,
  type SpecCol,
  type SpecSection,
  type ProductSpecSheet,
  type HeroTriptych,
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
  /** Front / rear / on-machine studio renders shown in the detail-page hero. */
  heroTriptych: HeroTriptych | null;
  gallery: ProductGalleryImage[];
  documents: string[];
  software: string[];
  accessories: string[];
  sourceUrl: string | null;
  specSheet: ProductSpecSheet;
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
  "Thông số chung": "General",
  "Thông số phần cứng": "Hardware",
  "Thông số phần mềm": "Software",
};

const SPEC_LABEL_EN: Record<string, string> = {
  "Kích thước": "Dimensions",
  "Vật liệu vỏ": "Housing material",
  "Số trục điều khiển": "Control axes",
  "Số trục điều khiển bằng PLC": "PLC-controlled axes",
  "Số trục chính điều khiển đồng thời": "Simultaneous spindle axes",
  "Số lượng dao có thể quản lý": "Tool table capacity",
  "Block Processing Time": "Block processing time",
  "Min. Control Unit": "Min. control unit",
  "Số cổng I/O tích hợp": "Integrated I/O ports",
  "Số cổng I/O mở rộng tối đa": "Max. expanded I/O ports",
  "Màn hình": "Display",
  "USB port": "USB port",
  "Quản lý parameter Servo": "Servo parameter management",
  "Bù sai số hành trình (Backlash)": "Backlash compensation",
  "Bù sai số cơ khí (Pitch Error)": "Pitch error compensation",
  "Thay dao tự động (ATC)": "Automatic tool change (ATC)",
};

const SPEC_VALUE_EN: Record<string, string> = {
  "Có hỗ trợ": "Supported",
  "Tất cả các trục": "All axes",
  "PLC Ladder tích hợp": "Integrated PLC Ladder",
};

// Localize a single spec value: exact map first, then the recurring Vietnamese
// unit words that appear inside otherwise numeric values.
function localizeSpecValueStr(v: string): string {
  if (SPEC_VALUE_EN[v]) return SPEC_VALUE_EN[v];
  return v.replace(/trục/g, "axes").replace(/dòng/g, "lines");
}

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
  return Array.isArray(v) ? v.map(localizeSpecValueStr) : localizeSpecValueStr(v);
}

function localizeSpecCol(c: SpecCol): SpecCol {
  // Protocol name is a proper noun; loop mode is already English in the source.
  return { name: c.name, loop: c.loop };
}

function localizeSpecSection(section: SpecSection): SpecSection {
  return {
    title: SPEC_TITLE_EN[section.title] ?? section.title,
    rows: section.rows.map((r) => ({ l: SPEC_LABEL_EN[r.l] ?? r.l, v: localizeSpecValue(r.v) })),
  };
}

function localizeSpecSheet(sheet: ProductSpecSheet): ProductSpecSheet {
  return {
    cols: sheet.cols.map(localizeSpecCol),
    sections: sheet.sections.map(localizeSpecSection),
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
  const specSheet: ProductSpecSheet = p.specSheet ?? { cols: [], sections: [] };
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
    heroTriptych: HERO_TRIPTYCH[p.slug] ?? null,
    gallery,
    documents: p.documents ?? [],
    software: p.software ?? [],
    accessories: p.accessories ?? [],
    sourceUrl: p.sourceUrl ?? null,
    specSheet: en ? localizeSpecSheet(specSheet) : specSheet,
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
