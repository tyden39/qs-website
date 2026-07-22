import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildTrail, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

/**
 * The six catalogue groups. `id` doubles as the i18n key under
 * `product.page.groups.*`; `segment` is the URL path piece under /products.
 * Static segments win over the `/products/[slug]` dynamic route, so these
 * names must never collide with a product or catalogue slug.
 */
export const PRODUCT_GROUPS = {
  machines: { segment: "machines", seoKey: "productsMachines" },
  controllers: { segment: "controllers", seoKey: "productsControllers" },
  servo: { segment: "servo", seoKey: "productsServo" },
  inverter: { segment: "inverters", seoKey: "productsInverters" },
  dnc: { segment: "dnc", seoKey: "productsDnc" },
  accessory: { segment: "accessories", seoKey: "productsAccessories" },
} as const;

export type ProductGroupId = keyof typeof PRODUCT_GROUPS;

/**
 * Hero render for each group's list page, shown object-contained on a light
 * tile in the header band. Controllers reuse the Products page controller
 * render and machines reuse the (currently hidden) CNC page machine hero, per
 * request; the remaining groups point at their strongest catalogue asset.
 */
const GROUP_HERO: Record<ProductGroupId, { src: string; w: number; h: number }> = {
  machines: { src: "/home/cnc-machine-hero.webp", w: 1672, h: 941 },
  controllers: { src: "/img/products/products-hero-controllers.webp", w: 1400, h: 1408 },
  servo: { src: "/img/products/components/servo-motor.webp", w: 600, h: 434 },
  inverter: { src: "/img/products/series/s3100.webp", w: 300, h: 225 },
  dnc: { src: "/img/products/catalog/micro-dnc-2d.webp", w: 1400, h: 980 },
  accessory: { src: "/img/products/components/mpg-pendant.webp", w: 450, h: 504 },
};

export async function categoryMetadata(
  params: Promise<{ locale: Locale }>,
  id: ProductGroupId,
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const group = PRODUCT_GROUPS[id];
  const title = t(`${group.seoKey}Title`);
  const description = t(`${group.seoKey}Description`);
  const path = `/products/${group.segment}`;
  return {
    title,
    description,
    alternates: buildAlternates(path, locale),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: path,
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * Shared frame for a group's list page: header band (breadcrumb, group name +
 * count, group blurb, switcher pills to the sibling groups) above the list
 * panel, closed by a slim support band. The panel itself is whatever the group
 * already uses — machine grid, filtered controller list, catalogue or series
 * cards.
 */
export async function CategoryShell({
  locale,
  id,
  children,
}: {
  locale: Locale;
  id: ProductGroupId;
  children: React.ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "product.page" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  const label = t(`groups.${id}.label`);
  const hero = GROUP_HERO[id];
  const breadcrumb = buildTrail(locale, t("breadcrumb.home"), [
    { name: seo("productsTitle"), path: "/products" },
    { name: label, path: `/products/${PRODUCT_GROUPS[id].segment}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <section
        className="relative overflow-hidden border-b border-line"
        style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}
      >
        <div className="absolute inset-0 qs-grid-bg opacity-50" aria-hidden="true"></div>
        {/* breathing gold atmosphere behind the group hero render */}
        <div className="qs-glow hidden lg:block right-[3%] top-[-40%] w-[34%] h-[170%]" aria-hidden="true"></div>
        <div className="relative z-10 max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 pt-8 pb-9">
          <div className="qs-crumb">
            <Link href="/">{t("breadcrumb.home")}</Link>
            <span className="sep">/</span>
            <Link href="/products">{t("breadcrumb.products")}</Link>
            <span className="sep">/</span>
            <span className="here">{label}</span>
          </div>
          <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_minmax(0,1.05fr)] lg:gap-12 lg:items-center">
            <div>
              <h1 className="qs-h1 m-0">
                <em className="not-italic qs-gold-shimmer">{label}</em>
              </h1>
              <p className="qs-lede mt-3.5 max-w-[54ch]">{t(`groups.${id}.blurb`)}</p>
            </div>
            {/* Group hero render on a light tile — reuses catalogue assets, no
                bespoke art. object-contain keeps every shape (square controller,
                landscape machine, tall pendant) whole inside the frame. */}
            <div className="relative aspect-16/10 bg-white border border-line overflow-hidden">
              <div className="absolute inset-3 border border-dashed border-gold opacity-30 pointer-events-none"></div>
              <div
                className="absolute inset-0"
                style={{ background: "radial-gradient(circle at 50% 40%, #ffffff, #ecebe5)" }}
                aria-hidden="true"
              ></div>
              <Image
                src={hero.src}
                alt={`${label} — ${seo("productsTitle")}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-contain p-5 sm:p-7"
              />
              {/* gold blueprint scan sweeping the render — painted last so it sits
                  above the opaque product tile. */}
              <div className="qs-scan" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">{children}</div>
      </section>

      {/* Support band shared by all six group pages — replaces the per-list
          support sidebar so the list column keeps the full width. */}
      <section className="border-t border-line bg-white">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 py-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <div className="font-mono text-label-xs text-gold-1 tracking-[.16em] uppercase shrink-0">
            {t("sidebar.support.title")}
          </div>
          <p className="m-0 text-meta text-muted leading-[1.6]">
            <a href="tel:+84909663350" className="hover:text-ink">(+84) 909.663.350</a>
            <span aria-hidden> · </span>
            <a href="tel:+84922322338" className="hover:text-ink">(+84) 922.322.338</a>
            <span aria-hidden> · </span>
            <a href="mailto:support@qstcnc.com" className="hover:text-ink">support@qstcnc.com</a>
          </p>
          <Link className="qs-btn qs-btn-sm sm:ml-auto" href="/contact">
            {t("sidebar.support.cta")}
          </Link>
        </div>
      </section>
    </>
  );
}
