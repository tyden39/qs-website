import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SeriesList } from "../_components/series-list";
import { CategoryShell, categoryMetadata } from "../_components/category-page";
import type { Locale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: Locale }> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryMetadata(params, "inverter");
}

export default async function InvertersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <CategoryShell locale={locale} id="inverter">
      <SeriesList locale={locale} category="inverter" />
    </CategoryShell>
  );
}
