// Canonical origin for the site, without a trailing slash. Everything that
// builds an absolute URL — canonical tags, hreflang, sitemap, JSON-LD, OG
// image resolution — reads this so a single env var controls them all.
// Falls back to production so a build with no env still emits real URLs
// instead of localhost.
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://qstcnc.com";

/**
 * Absolute URL for a locale-scoped path, in the exact shape the page canonical
 * uses: `/{locale}` prefix (localePrefix is "always", so VI carries `/vi` too)
 * plus the trailing slash that `trailingSlash: true` produces.
 *
 * Every absolute URL that names a page of this site — JSON-LD `url`, breadcrumb
 * `item`, entity identifiers — must go through here. A URL that differs from the
 * canonical by so much as a missing prefix or slash reads to a crawler as a
 * separate page, which splits the entity across two URLs.
 */
export function localeUrl(path: string, locale: string): string {
  const normalized = path === "/" || path === "" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${APP_URL}/${locale}${normalized}/`;
}
