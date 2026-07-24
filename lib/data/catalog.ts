import {
  catalogProducts,
  type CatalogProduct,
  type CatalogCategory,
  type CatalogSpec,
  type CatalogPhoto,
} from "@/data/catalog";
import type { Locale } from "@/lib/i18n/config";

export type { CatalogCategory, CatalogSpec };

/** A photo resolved to one locale — `alt` already carries the right language. */
export type CatalogImage = { src: string; w: number; h: number; alt: string };
export type CatalogFeatureView = { title: string; body: string; photo: CatalogImage | null };

export type CatalogProductView = {
  slug: string;
  category: CatalogCategory;
  name: string;
  tag: string;
  desc: string;
  specs: CatalogSpec[];
  image: CatalogImage;
  features: CatalogFeatureView[];
  sourceUrl: string;
};

/**
 * Spec labels are authored in Vietnamese (the catalogue's primary language);
 * this covers the vocabulary shared across the DNC and accessory rows so each
 * product need not carry a duplicate English table.
 */
const SPEC_LABEL_EN: Record<string, string> = {
  "Kích thước": "Dimensions",
  "USB port": "USB port",
  "Điện áp đầu vào": "Input voltage",
  "Điện áp đầu ra": "Output voltage",
  "Dòng đầu ra": "Output current",
  "RS232 port": "RS232 port",
  "Vỏ hộp": "Housing",
  "Kích thước màn hình": "Display size",
  "Bộ nhớ": "Memory",
  "Số cổng Input": "Input ports",
  "Số cổng Output": "Output ports",
  "Số cổng COM đầu vào": "Input COM ports",
  "Số cổng COM đầu ra": "Output COM ports",
  "Cổng giao tiếp": "Interface port",
  "Chế độ I/O link": "I/O Link mode",
  "Chế độ PLC": "PLC mode",
  "Tín hiệu đầu ra Analog": "Analog output signal",
  "Chiều dài cáp": "Cable length",
  "Cổng kết nối": "Connector",
  "Khối lượng": "Weight",
  "Đầu nối": "Connector",
  Model: "Model",
};

const SPEC_VALUE_EN: Record<string, string> = {
  Có: "Yes",
  "Nhựa ABS": "ABS plastic",
};

function localizeSpec(row: CatalogSpec): CatalogSpec {
  return {
    l: SPEC_LABEL_EN[row.l] ?? row.l,
    // Values are mostly numbers and units, which carry across unchanged; only
    // the handful of Vietnamese words need mapping.
    v: SPEC_VALUE_EN[row.v] ?? row.v,
  };
}

function toImage(photo: CatalogPhoto, en: boolean): CatalogImage {
  return { src: photo.src, w: photo.w, h: photo.h, alt: en ? photo.altEn : photo.alt };
}

function toView(p: CatalogProduct, locale: Locale): CatalogProductView {
  const en = locale === "en";
  return {
    slug: p.slug,
    category: p.category,
    name: (en ? p.nameEn : null) ?? p.name,
    tag: en ? p.tagEn : p.tag,
    desc: en ? p.descEn : p.desc,
    specs: en ? p.specs.map(localizeSpec) : p.specs,
    image: toImage(p.image, en),
    features: p.features.map((f) => ({
      title: en ? f.titleEn : f.title,
      body: en ? f.bodyEn : f.body,
      photo: f.photo ? toImage(f.photo, en) : null,
    })),
    sourceUrl: p.sourceUrl,
  };
}

export function getCatalogProducts(locale: Locale, category?: CatalogCategory): CatalogProductView[] {
  const source = category ? catalogProducts.filter((p) => p.category === category) : catalogProducts;
  return source.map((p) => toView(p, locale));
}

export function getCatalogProductBySlug(slug: string, locale: Locale): CatalogProductView | null {
  const p = catalogProducts.find((x) => x.slug === slug);
  return p ? toView(p, locale) : null;
}

export function getCatalogSlugs(): string[] {
  return catalogProducts.map((p) => p.slug);
}

/** True when a `/controller/[slug]` route should render the catalogue template. */
export function isCatalogSlug(slug: string): boolean {
  return catalogProducts.some((p) => p.slug === slug);
}
