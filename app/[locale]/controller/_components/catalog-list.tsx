import { getTranslations } from "next-intl/server";
import { getCatalogProducts, type CatalogCategory } from "@/lib/data/catalog";
import { CatalogProductCard } from "@/components/products/catalog-product-card";
import { SortableCardList } from "./sortable-card-list";
import type { Locale } from "@/lib/i18n/config";

/**
 * List panel for a catalogue group (DNC units or accessories). These are
 * simple items — a board, a cable, a power supply — so they browse best as a
 * compact card grid matching the /controller landing rhythm; the full spec
 * table lives on each detail page. Group blurb and support live in the
 * CategoryShell.
 */
export async function CatalogList({
  locale,
  category,
}: {
  locale: Locale;
  category: CatalogCategory;
}) {
  const products = getCatalogProducts(locale, category);
  const tb = await getTranslations({ locale, namespace: "product.page.toolbar" });

  // These groups carry no sub-type to filter on, so the toolbar frame holds the
  // running count plus a sort select — matching the controllers' bar so every
  // group panel reads the same.
  return (
    <SortableCardList
      layout="grid"
      items={products.map((p, i) => ({
        key: p.slug,
        name: p.name,
        node: <CatalogProductCard key={p.slug} product={p} index={i} total={products.length} />,
      }))}
      sortOptions={tb.raw("sortBasic") as string[]}
      showing={tb("showing")}
      unit={tb("ofModels")}
      sortLabel={tb("sortLabel")}
    />
  );
}
