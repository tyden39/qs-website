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
export type CatalogVideoView = { youtubeId: string; title: string };

export type CatalogProductView = {
  slug: string;
  category: CatalogCategory;
  name: string;
  tag: string;
  desc: string;
  specs: CatalogSpec[];
  image: CatalogImage;
  gallery: CatalogImage[];
  features: CatalogFeatureView[];
  video: CatalogVideoView | null;
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
  "Loại đầu dò": "Probe type",
  "Độ chính xác": "Accuracy",
  "Hướng kích hoạt": "Trigger directions",
  "Quá hành tối đa X–Y": "Max overtravel, X–Y",
  "Quá hành tối đa Z": "Max overtravel, Z",
  "Lực kích hoạt phương Z": "Trigger force, Z",
  "Lực kích hoạt mặt phẳng X–Y": "Trigger force, X–Y plane",
  "Kim đo tiêu chuẩn": "Standard stylus",
  "Dòng tải đầu ra tối đa": "Max output load current",
  "Cấp bảo vệ": "Protection rating",
  "Chiều dài tổng thể": "Overall length",
  "Đường kính thân": "Body diameter",
  "Đường kính lớn nhất": "Max diameter",
  "Đường kính cán lắp": "Shank diameter",
};

const SPEC_VALUE_EN: Record<string, string> = {
  Có: "Yes",
  "Nhựa ABS": "ABS plastic",
  "Đầu dò kích hoạt tiếp xúc 3D": "3D touch-trigger probe",
  // Vietnamese writes the decimal separator as a comma, English as a point.
  "1.000 gf (xấp xỉ 9,81 N)": "1,000 gf (approx. 9.81 N)",
  "65–130 gf (xấp xỉ 0,64–1,28 N)": "65–130 gf (approx. 0.64–1.28 N)",
  "147,3 mm": "147.3 mm",
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
    gallery: (p.gallery ?? []).map((photo) => toImage(photo, en)),
    features: p.features.map((f) => ({
      title: en ? f.titleEn : f.title,
      body: en ? f.bodyEn : f.body,
      photo: f.photo ? toImage(f.photo, en) : null,
    })),
    video: p.video ? { youtubeId: p.video.youtubeId, title: en ? p.video.titleEn : p.video.title } : null,
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

/** True when a `/electronics/[slug]` route should render the catalogue template. */
export function isCatalogSlug(slug: string): boolean {
  return catalogProducts.some((p) => p.slug === slug);
}
