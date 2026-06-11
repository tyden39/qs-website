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
 * Build hreflang alternates for a given path.
 * Locale URLs are always prefixed (`/vi/*`, `/en/*`); x-default points to VI.
 */
export function buildAlternates(path: string): AlternatesResult {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return {
    canonical: `${APP_URL}/vi${normalized}`,
    languages: {
      vi: `${APP_URL}/vi${normalized}`,
      en: `${APP_URL}/en${normalized}`,
      "x-default": `${APP_URL}/vi${normalized}`,
    },
  };
}
