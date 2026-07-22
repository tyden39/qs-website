import type { MetadataRoute } from "next";
import { getProductSlugs } from "@/lib/data/products";
import { getCatalogSlugs } from "@/lib/data/catalog";
import { getAllNews } from "@/lib/data/news";
import { getApplicationSlugs } from "@/lib/data/applications";
import { getServiceSlugs } from "@/lib/data/services";
import { getMachineSlugs } from "@/lib/data/machines";
import { localeUrl } from "@/lib/seo/app-url";

export const dynamic = "force-static";

// Indexable pages only. `/search` is deliberately absent: it is noindex, and a
// sitemap that lists noindex URLs sends Google a contradictory signal.
const STATIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/downloads",
  "/products",
  "/products/machines",
  "/products/controllers",
  "/products/servo",
  "/products/inverters",
  "/products/dnc",
  "/products/accessories",
  "/news",
  "/applications",
  "/services",
];

/**
 * Each entity gets two <url> entries (VI and EN), each carrying the same
 * vi/en/x-default alternates triple. Per Google's hreflang+sitemap spec, every
 * locale variant must appear with the full alternate set including itself.
 *
 * `lastModified` is emitted only when a real content date is known (currently
 * news articles). Stamping build time on every URL would tell crawlers the whole
 * site changed on each deploy; once Google finds lastmod unreliable it discounts
 * the field site-wide, which would waste the accurate dates too. Omitting beats
 * guessing — a missing lastmod is simply "unknown", not a false claim.
 */
function buildEntries(path: string, lastModified?: Date): MetadataRoute.Sitemap {
  // localePrefix is "always": every public URL carries a /vi or /en prefix, and
  // the trailing slash matches `trailingSlash: true`, so sitemap URLs equal the
  // page canonicals exactly (no 308 redirect on crawl).
  const viUrl = localeUrl(path, "vi");
  const enUrl = localeUrl(path, "en");
  const languages = { vi: viUrl, en: enUrl, "x-default": viUrl };
  const priority = path === "/" ? 1.0 : 0.8;
  const shared = { priority, alternates: { languages }, ...(lastModified ? { lastModified } : {}) };
  return [
    { url: viUrl, ...shared },
    { url: enUrl, ...shared },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productSlugs, applicationSlugs, serviceSlugs] = await Promise.all([
    getProductSlugs(),
    getApplicationSlugs(),
    getServiceSlugs(),
  ]);

  // Locale is irrelevant here — only slug and publish date are read, and both
  // are language-neutral.
  const news = getAllNews("vi");
  // The news index legitimately changes whenever the newest article lands.
  const latestNews = news.reduce<Date | undefined>(
    (acc, n) => (n.publishedAt && (!acc || n.publishedAt > acc) ? n.publishedAt : acc),
    undefined,
  );

  return [
    ...STATIC_PATHS.flatMap((path) =>
      buildEntries(path, path === "/news" ? latestNews : undefined),
    ),
    ...getMachineSlugs().flatMap((slug) => buildEntries(`/cnc/${slug}`)),
    ...[...productSlugs, ...getCatalogSlugs()].flatMap((slug) =>
      buildEntries(`/products/${slug}`),
    ),
    ...news.flatMap((n) => buildEntries(`/news/${n.slug}`, n.publishedAt ?? undefined)),
    ...applicationSlugs.flatMap((slug) => buildEntries(`/applications/${slug}`)),
    ...serviceSlugs.flatMap((slug) => buildEntries(`/services/${slug}`)),
  ];
}
