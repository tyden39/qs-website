import { products, type Product } from "@/data/products";
import type { Locale } from "@/lib/i18n/config";

export type ProductSpec = { l: string; v: string };
export type ProductImage = { url: string; alt: string };

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
  specs: ProductSpec[];
  images: ProductImage[];
  sort: number;
  publishedAt: Date | null;
};

// `locale` is retained on the public signatures for API compatibility. The
// file-backed seed is currently Vietnamese-only; English falls back to the same
// content until bilingual content is reintroduced.
function toView(p: Product, index: number): ProductView {
  return {
    slug: p.slug,
    series: p.series,
    axes: p.axes,
    display: p.display,
    badge: p.badge ?? null,
    tag: p.tag,
    name: p.name,
    desc: p.desc,
    bullets: p.bullets,
    specs: p.specs,
    images: [],
    sort: index,
    publishedAt: null,
  };
}

export function getAllProducts(_locale: Locale): ProductView[] {
  return products.map((p, i) => toView(p, i));
}

export function getProductBySlug(slug: string, _locale: Locale): ProductView | null {
  const index = products.findIndex((p) => p.slug === slug);
  return index === -1 ? null : toView(products[index], index);
}

export function getProductSlugs(): string[] {
  return products.map((p) => p.slug);
}
