import { applications, type Application } from "@/data/applications";
import { getProductBySlug, type ProductView } from "@/lib/data/products";
import type { Locale } from "@/lib/i18n/config";

export type ApplicationView = {
  slug: string;
  title: string;
  summary: string;
  heroImage: string | null;
};

// Shop-floor still shown on the catalog card and detail hero. Shared with the
// home application deck (public/home/app-*.webp).
const heroImages: Record<string, string> = {
  "phay-cnc": "/home/app-phay-cnc.webp",
  "cua-long": "/home/app-cua-long.webp",
  "dan-keo": "/home/app-dan-keo.webp",
  "uon-lo-xo": "/home/app-uon-lo-xo.webp",
  "mong-go": "/home/app-mong-go.webp",
  "kim-hoan": "/home/app-kim-hoan.webp",
  "dieu-khac-da": "/home/app-dieu-khac-da.webp",
  "cat-da": "/home/app-cat-da.webp",
  "dieu-khac-go": "/home/app-dieu-khac-go.webp",
};

// Vietnamese is the primary copy; `machineEn` / `summaryEn` serve the `en`
// locale (metadata, JSON-LD, and the search index all read this view).
function toView(a: Application, locale: Locale): ApplicationView {
  const en = locale === "en";
  return {
    slug: a.slug,
    title: (en ? a.machineEn : null) ?? a.machine,
    summary: (en ? a.summaryEn : null) ?? a.summary,
    heroImage: heroImages[a.slug] ?? null,
  };
}

export function getApplicationBySlug(slug: string, locale: Locale): ApplicationView | null {
  const a = applications.find((x) => x.slug === slug);
  return a ? toView(a, locale) : null;
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
