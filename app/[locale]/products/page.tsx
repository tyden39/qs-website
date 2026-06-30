import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getAllProducts } from "@/lib/data/products";
import { ProductBundleCard } from "@/components/products/product-bundle-card";
import { ProductListFilter, type ProductFilterItem } from "./_components/product-list-filter";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildBreadcrumbList, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://qstech.vn";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const title = t("productsTitle");
  const description = t("productsDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/products"),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/products",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Products({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "product.page" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  const products = await getAllProducts(locale);
  const features = t.raw("features") as string[];
  // Filter metadata derived from product data; the async card is pre-rendered
  // on the server and handed to the client filter as an opaque node.
  const items: ProductFilterItem[] = products.map((p, i) => ({
    slug: p.slug,
    axisNum: parseInt(p.axes, 10) || 0,
    displayNum: parseFloat(p.display) || 0,
    // Control interface drives the toolbar chips; derive it from the spec columns.
    controlInterface: p.interfaces.map((c) => c.name).join(" ").toLowerCase(),
    node: <ProductBundleCard key={p.slug} product={p} index={i} total={products.length} />,
  }));
  const breadcrumb = buildBreadcrumbList([
    { name: t("breadcrumb.home"), url: `${APP_URL}${locale === "en" ? "/en" : ""}` },
    { name: seo("productsTitle"), url: `${APP_URL}${locale === "en" ? "/en" : ""}/products` },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
        style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-12 pb-14">
          <div className="qs-crumb mb-8">
            <Link href="/">{t("breadcrumb.home")}</Link><span className="sep">/</span>
            <Link href="/products">{t("breadcrumb.products")}</Link><span className="sep">/</span>
            <span className="here">{t("breadcrumb.current")}</span>
          </div>
          <div className="grid md:grid-cols-[1fr_1.4fr] gap-12 items-center">
            <div>
              <div className="qs-eyebrow">{t("eyebrow")}</div>
              <h1 className="qs-h1 mt-3.5" style={{ fontSize: "54px" }}>{t("heading")}</h1>
              <p className="qs-lede mt-4">{t("lede")}</p>
              <div className="mt-7 flex flex-col gap-2.5">
                {features.map(f => (
                  <div key={f} className="flex items-center gap-3.5 text-sm
                                          before:content-[''] before:block before:w-6 before:h-px before:bg-gold">{f}</div>
                ))}
              </div>
              <div className="flex gap-3 mt-7">
                <Link className="qs-btn qs-btn-ghost" href="/downloads">{t("catalogBtn")}</Link>
              </div>
            </div>
            <div className="relative aspect-16/10 bg-white border border-line p-6 overflow-hidden">
              <div className="absolute inset-3 border border-dashed border-gold opacity-30 pointer-events-none"></div>
              <div className="absolute bottom-4 left-6 z-10 font-mono text-[10px] tracking-[.18em] uppercase text-muted">{t("seriesTag")}</div>
              <Image
                src="/img/products/products-hero-controllers.webp"
                alt={seo("productsTitle")}
                width={1600}
                height={1609}
                priority
                sizes="(max-width: 768px) 90vw, 640px"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="py-16" id="list">
        <div className="max-w-wrap mx-auto px-12">
          <ProductListFilter
            items={items}
            labels={{
              filters: t.raw("toolbar.filters") as string[],
              sortOptions: t.raw("toolbar.sortOptions") as string[],
              tree: t.raw("sidebar.tree") as string[],
              axes: t.raw("sidebar.axes") as string[],
              sidebarHeading: t("sidebar.heading"),
              supportTitle: t("sidebar.support.title"),
              supportCta: t("sidebar.support.cta"),
              showing: t("toolbar.showing"),
              ofModels: t("toolbar.ofModels"),
              sortLabel: t("toolbar.sortLabel"),
              emptyState: t("toolbar.empty"),
            }}
          />
        </div>
      </section>
    </>
  );
}
