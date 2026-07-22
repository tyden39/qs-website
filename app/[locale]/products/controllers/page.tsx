import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CONTROLLER_TYPES, getAllProducts } from "@/lib/data/products";
import { ProductBundleCard } from "@/components/products/product-bundle-card";
import { ProductListFilter, type ProductFilterItem } from "../_components/product-list-filter";
import { CategoryShell, categoryMetadata } from "../_components/category-page";
import type { Locale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: Locale }> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryMetadata(params, "controllers");
}

export default async function ControllersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "product.page" });
  const products = await getAllProducts(locale);
  // Filter metadata derived from product data; the async card is pre-rendered
  // on the server and handed to the client filter as an opaque node.
  const items: ProductFilterItem[] = products.map((p, i) => ({
    slug: p.slug,
    type: p.type,
    node: <ProductBundleCard key={p.slug} product={p} index={i} total={products.length} />,
  }));
  return (
    <CategoryShell locale={locale} id="controllers" count={products.length}>
      <ProductListFilter
        items={items}
        labels={{
          showing: t("toolbar.showing"),
          unit: t("toolbar.ofModels"),
          emptyState: t("toolbar.empty"),
          types: CONTROLLER_TYPES.map((id) => ({ id, label: t(`types.controllers.${id}`) })),
          typeNavLabel: t("types.navLabel"),
          allLabel: t("types.all"),
        }}
      />
    </CategoryShell>
  );
}
