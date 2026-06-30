import { products, type Product, type KitItem, type ProductPhoto, type SpecColumn } from "@/data/products";
import { productExtras, type ProductGalleryPhoto } from "@/data/products-extra";
import type { Locale } from "@/lib/i18n/config";

export type ProductSpec = { l: string; v: string | string[] };
export type ProductSpecColumn = SpecColumn;
export type ProductImage = { url: string; alt: string };
export type ProductKitItem = KitItem;
export type ProductFrontPhoto = ProductPhoto;
export type ProductGalleryImage = ProductGalleryPhoto;

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
  gallery: ProductGalleryImage[];
  documents: string[];
  software: string[];
  accessories: string[];
  sourceUrl: string | null;
  sort: number;
  publishedAt: Date | null;
};

// Vietnamese is the primary copy; `tag`/`desc`/`bullets` switch to their English
// variants on the `en` locale. Spec values and crawled extras stay shared.
function toView(p: Product, index: number, locale: Locale): ProductView {
  const extra = productExtras[p.slug] ?? {};
  const gallery = extra.gallery ?? [];
  const en = locale === "en";
  return {
    slug: p.slug,
    series: p.series,
    axes: p.axes,
    display: p.display,
    badge: p.badge ?? null,
    tag: en ? p.tagEn : p.tag,
    name: p.name,
    desc: en ? p.descEn : p.desc,
    bullets: en ? p.bulletsEn : p.bullets,
    interfaces: p.interfaces,
    specs: p.specs,
    image: p.image,
    bundle: p.bundle,
    // Reuse the existing image slot for the crawled photo gallery.
    images: gallery.map((g) => ({ url: g.src, alt: g.alt })),
    overview: extra.overview ?? null,
    highlights: extra.highlights ?? [],
    gallery,
    documents: extra.documents ?? [],
    software: extra.software ?? [],
    accessories: extra.accessories ?? [],
    sourceUrl: extra.sourceUrl ?? null,
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
