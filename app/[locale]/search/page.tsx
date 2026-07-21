import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SearchResults } from "./_components/search-results";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search.results" });
  return {
    title: t("metaTitle"),
    // Search-results pages are thin, query-dependent, and near-duplicates of one
    // another — classic index bloat that dilutes crawl budget for the product and
    // application pages. `follow` still lets crawlers traverse the results out to
    // those pages. Also dropped from the sitemap, which must list only indexables.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
