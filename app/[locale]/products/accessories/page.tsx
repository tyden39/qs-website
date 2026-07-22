import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getCatalogProducts } from "@/lib/data/catalog";
import { CatalogList } from "../_components/catalog-list";
import { CategoryShell, categoryMetadata } from "../_components/category-page";
import type { Locale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: Locale }> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryMetadata(params, "accessory");
}

export default async function AccessoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const count = getCatalogProducts(locale, "accessory").length;
  return (
    <CategoryShell locale={locale} id="accessory" count={count}>
      <CatalogList locale={locale} category="accessory" />
    </CategoryShell>
  );
}
