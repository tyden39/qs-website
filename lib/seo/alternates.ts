import type { Locale } from "@/lib/i18n/config";
import { localeUrl } from "@/lib/seo/app-url";

export type AlternatesResult = {
  canonical: string;
  languages: {
    vi: string;
    en: string;
    "x-default": string;
  };
};

/**
 * Build hreflang alternates for a given path. localePrefix is "always", so both
 * locales carry a prefix (/vi, /en). The canonical is self-referencing per
 * locale (an EN page canonicalizes to its own EN URL, not the VI variant) so
 * search engines index both language versions instead of treating EN as a
 * duplicate of VI. x-default still points to the Vietnamese variant.
 *
 * URLs carry a trailing slash to match `trailingSlash: true` in next.config,
 * so canonical/hreflang/sitemap URLs all resolve without an extra 308 redirect.
 */
export function buildAlternates(path: string, locale: Locale): AlternatesResult {
  // Root ("/") becomes "/vi/"; "/controller" becomes "/vi/controller/".
  const viUrl = localeUrl(path, "vi");
  const enUrl = localeUrl(path, "en");
  return {
    canonical: locale === "en" ? enUrl : viUrl,
    languages: {
      vi: viUrl,
      en: enUrl,
      "x-default": viUrl,
    },
  };
}
