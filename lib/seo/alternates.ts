const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://qstech.vn";

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
 * locales carry a prefix (/vi, /en); x-default and canonical point to the
 * Vietnamese variant.
 */
export function buildAlternates(path: string): AlternatesResult {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const viUrl = `${APP_URL}/vi${normalized}`;
  const enUrl = `${APP_URL}/en${normalized}`;
  return {
    canonical: viUrl,
    languages: {
      vi: viUrl,
      en: enUrl,
      "x-default": viUrl,
    },
  };
}
