import type { MetadataRoute } from "next";
import { getProductSlugs } from "@/lib/data/products";
import { getNewsSlugs } from "@/lib/data/news";
import { getApplicationSlugs } from "@/lib/data/applications";
import { getServiceSlugs } from "@/lib/data/services";

export const dynamic = "force-static";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://qstech.vn";

const STATIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/downloads",
  "/search",
  "/products",
  "/news",
  "/applications",
  "/services",
];

// Each entity gets two <url> entries (VI and EN), each carrying the same
// vi/en/x-default alternates triple. Per Google's hreflang+sitemap spec, every
// locale variant must appear with the full alternate set including itself.
function buildEntries(path: string): MetadataRoute.Sitemap {
  // localePrefix is "always": every public URL carries a /vi or /en prefix.
  const viUrl = path === "/" ? `${APP_URL}/vi` : `${APP_URL}/vi${path}`;
  const enUrl = path === "/" ? `${APP_URL}/en` : `${APP_URL}/en${path}`;
  const languages = { vi: viUrl, en: enUrl, "x-default": viUrl };
  const priority = path === "/" ? 1.0 : 0.8;
  return [
    { url: viUrl, lastModified: new Date(), changeFrequency: "weekly", priority, alternates: { languages } },
    { url: enUrl, lastModified: new Date(), changeFrequency: "weekly", priority, alternates: { languages } },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productSlugs, newsSlugs, applicationSlugs, serviceSlugs] =
    await Promise.all([
      getProductSlugs(),
      getNewsSlugs(),
      getApplicationSlugs(),
      getServiceSlugs(),
    ]);

  return [
    ...STATIC_PATHS.flatMap(buildEntries),
    ...productSlugs.flatMap((slug) => buildEntries(`/products/${slug}`)),
    ...newsSlugs.flatMap((slug) => buildEntries(`/news/${slug}`)),
    ...applicationSlugs.flatMap((slug) => buildEntries(`/applications/${slug}`)),
    ...serviceSlugs.flatMap((slug) => buildEntries(`/services/${slug}`)),
  ];
}
