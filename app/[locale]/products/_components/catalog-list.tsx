import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getCatalogProducts, type CatalogCategory } from "@/lib/data/catalog";
import { CatalogProductCard } from "@/components/products/catalog-product-card";
import type { Locale } from "@/lib/i18n/config";

/**
 * List panel for a catalogue group (DNC units or accessories). Mirrors the
 * controller tab's two-column shell — an intro/support rail on the left, cards
 * on the right — but without the filter toolbar: these groups are short enough
 * that filtering them would be more chrome than help.
 */
export async function CatalogList({
  locale,
  category,
}: {
  locale: Locale;
  category: CatalogCategory;
}) {
  const t = await getTranslations({ locale, namespace: "product.page" });
  const products = getCatalogProducts(locale, category);

  return (
    <div className="flex flex-col gap-8 md:grid md:grid-cols-[240px_1fr] md:gap-16 md:items-start">
      <div className="order-1 flex flex-col gap-6">
        <div className="border border-line bg-white p-5">
          <div className="font-mono text-[11px] tracking-[.16em] uppercase text-ink pb-3.5 border-b border-ink">
            {t(`tabs.${category}.label`)}
          </div>
          <p className="m-0 mt-3.5 text-[13px] text-muted leading-[1.7]">
            {t(`tabs.${category}.blurb`)}
          </p>
        </div>

        <aside className="border border-line bg-white p-5">
          <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-2">
            {t("sidebar.support.title")}
          </div>
          <p className="m-0 text-[13px] text-muted leading-[1.6]">
            <a href="tel:+84909663350" className="hover:text-ink">(+84) 909.663.350</a>
            <br />
            <a href="tel:+84922322338" className="hover:text-ink">(+84) 922.322.338</a>
            <br />
            <a href="mailto:support@qstcnc.com" className="hover:text-ink">support@qstcnc.com</a>
          </p>
          <Link className="qs-btn qs-btn-sm mt-3.5" href="/contact">
            {t("sidebar.support.cta")}
          </Link>
        </aside>
      </div>

      <main className="order-2 min-w-0 flex flex-col gap-6">
        {products.map((p, i) => (
          <CatalogProductCard key={p.slug} product={p} index={i} total={products.length} />
        ))}
      </main>
    </div>
  );
}
