import { applications, type Application } from "@/data/applications";
import { getProductBySlug, type ProductView } from "@/lib/data/products";
import type { Locale } from "@/lib/i18n/config";

export type ApplicationView = {
  slug: string;
  title: string;
  summary: string;
  heroImage: string | null;
  workflow: { n: string; label: string; title: string; desc: string }[];
  specs: { label: string; value: string }[];
  deployments: { name: string; loc: string }[];
  /** Controller model slugs suited to this machine type. */
  products: string[];
  sort: number;
};

// Shop-floor still shown on the catalog card and detail hero. Shared with the
// home application deck (public/home/app-*.webp).
const heroImages: Record<string, string> = {
  "phay-cnc": "/home/app-phay-cnc.webp",
  "cua-long": "/home/app-cua-long.webp",
  "dan-keo": "/home/app-dan-keo.webp",
  "thuc-pham": "/home/app-thuc-pham.webp",
  "uon-lo-xo": "/home/app-uon-lo-xo.webp",
  "mong-go": "/home/app-mong-go.webp",
  "kim-hoan": "/home/app-kim-hoan.webp",
};

function toView(a: Application, index: number): ApplicationView {
  return {
    slug: a.slug,
    title: a.machine,
    summary: a.summary,
    heroImage: heroImages[a.slug] ?? null,
    workflow: a.workflow,
    specs: a.specs,
    deployments: a.deployments,
    products: a.products,
    sort: index,
  };
}

export function getApplicationBySlug(slug: string, _locale: Locale): ApplicationView | null {
  const index = applications.findIndex((a) => a.slug === slug);
  return index === -1 ? null : toView(applications[index], index);
}

export function getApplicationSlugs(): string[] {
  return applications.map((a) => a.slug);
}

/** Product views for the controllers suited to an application (catalogue order). */
export function getApplicationProducts(slug: string, locale: Locale): ProductView[] {
  const app = applications.find((a) => a.slug === slug);
  if (!app) return [];
  return app.products
    .map((productSlug) => getProductBySlug(productSlug, locale))
    .filter((p): p is ProductView => p !== null);
}

/** Reverse mapping: application slugs whose machine type lists this product. */
export function getApplicationSlugsForProduct(productSlug: string): string[] {
  return applications.filter((a) => a.products.includes(productSlug)).map((a) => a.slug);
}
