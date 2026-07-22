import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getCatalogProducts } from "@/lib/data/catalog";
import { CatalogList } from "../_components/catalog-list";
import { CategoryShell, categoryMetadata } from "../_components/category-page";
import type { Locale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: Locale }> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryMetadata(params, "dnc");
}

export default async function DncPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const count = getCatalogProducts(locale, "dnc").length;
  return (
    <CategoryShell locale={locale} id="dnc" count={count}>
      <CatalogList locale={locale} category="dnc" />
    </CategoryShell>
  );
}
