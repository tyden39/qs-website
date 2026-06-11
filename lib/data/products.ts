import type { Locale } from "@/lib/i18n/config";
import { products, type Product } from "@/data/products";

// View contract consumed by pages + SEO helpers. Source is now the static
// `data/products.ts` seed (single-language VI); EN reuses the same text.
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
  specs: { l: string; v: string }[];
  images: { url: string; alt: string }[];
  sort: number;
  publishedAt: Date | null;
};

function toView(row: Product, index: number): ProductView {
  return {
    slug: row.slug,
    series: row.series,
    axes: row.axes,
    display: row.display,
    badge: row.badge ?? null,
    tag: row.tag,
    name: row.name,
    desc: row.desc,
    bullets: row.bullets,
    specs: row.specs,
    images: [],
    sort: index,
    publishedAt: null,
  };
}

// `locale` kept in the signature for a stable contract; seed is single-language.
export async function getAllProducts(_locale: Locale): Promise<ProductView[]> {
  return products.map(toView);
}

export async function getProductBySlug(slug: string, _locale: Locale): Promise<ProductView | null> {
  const index = products.findIndex((p) => p.slug === slug);
  return index === -1 ? null : toView(products[index], index);
}

export async function getProductSlugs(): Promise<string[]> {
  return products.map((p) => p.slug);
}
