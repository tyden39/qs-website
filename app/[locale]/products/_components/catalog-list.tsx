import { getCatalogProducts, type CatalogCategory } from "@/lib/data/catalog";
import { CatalogProductCard } from "@/components/products/catalog-product-card";
import type { Locale } from "@/lib/i18n/config";

/**
 * List panel for a catalogue group (DNC units or accessories). These are
 * simple items — a board, a cable, a power supply — so they browse best as a
 * compact card grid matching the /products landing rhythm; the full spec
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

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map((p, i) => (
        <CatalogProductCard key={p.slug} product={p} index={i} total={products.length} />
      ))}
    </div>
  );
}
