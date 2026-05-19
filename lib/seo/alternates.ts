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
 * Vietnamese is the default locale (no prefix). English uses /en prefix.
 */
export function buildAlternates(path: string): AlternatesResult {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return {
    canonical: `${APP_URL}${normalized}`,
    languages: {
      vi: `${APP_URL}${normalized}`,
      en: `${APP_URL}/en${normalized}`,
      "x-default": `${APP_URL}${normalized}`,
    },
  };
}
