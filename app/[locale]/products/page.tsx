import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllProducts } from "@/lib/data/products";
import { ProductBundleCard } from "@/components/products/product-bundle-card";
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
  const tree = t.raw("sidebar.tree") as string[];
  const axes = t.raw("sidebar.axes") as string[];
  const filters = t.raw("toolbar.filters") as string[];
  const sortOptions = t.raw("toolbar.sortOptions") as string[];
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
            <Link href="#">{t("breadcrumb.products")}</Link><span className="sep">/</span>
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
          <div className="grid md:grid-cols-[240px_1fr] gap-16">
            {/* sidebar */}
            <aside>
              <h4 className="font-mono text-[11px] tracking-[.16em] uppercase text-ink m-0 mb-4 pb-3.5 border-b border-ink">{t("sidebar.heading")}</h4>
              <ul className="list-none p-0 m-0">
                {tree.map((n, idx) => {
                  const open = idx === 0;
                  return (
                    <li key={n} className="border-b border-line">
                      <a href="#" className="flex justify-between items-center py-3 text-sm font-medium">
                        {n}<span className="text-gold-1">{open ? "▾" : "›"}</span>
                      </a>
                      {open ? (
                        <ul className="pb-3 list-none m-0 p-0">
                          {axes.map((s, i) => (
                            <li key={s} className="border-0">
                              <a href="#" className={`block py-1.5 px-3 text-[13px] border-l ${i === 0 ? "text-ink border-gold font-medium" : "text-muted border-line"}`}>{s}</a>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-8 bg-white border border-line p-5">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-2">{t("sidebar.support.title")}</div>
                <p className="m-0 text-[13px] text-muted leading-[1.6]">+84 28 3636 1234<br />tech@qstechnology.vn</p>
                <Link className="qs-btn qs-btn-sm mt-3.5" href="/contact">{t("sidebar.support.cta")}</Link>
              </div>
            </aside>

            {/* list */}
            <main>
              <div className="flex justify-between items-center bg-white border border-line px-6 py-4 mb-6">
                <div className="flex gap-6 items-center">
                  <span className="font-mono text-xs tracking-widest text-muted">{t("toolbar.showing")} <b className="text-ink font-semibold">06</b> {t("toolbar.ofModels")}</span>
                  <div className="flex gap-1.5">
                    {filters.map((c, i) => (
                      <button key={c} className={`px-3 py-1.5 font-mono text-[11px] tracking-widest uppercase border ${i === 0 ? "bg-ink text-white border-ink" : "border-line text-muted"}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="font-mono text-[11px] text-muted tracking-widest uppercase">{t("toolbar.sortLabel")}</span>
                  <select className="font-mono text-[11px] tracking-[.08em] uppercase border border-line py-1.5 px-3 bg-white">
                    {sortOptions.map((o) => (<option key={o}>{o}</option>))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {products.map((p, i) => (
                  <ProductBundleCard key={p.slug} product={p} index={i} total={products.length} />
                ))}
              </div>
            </main>
          </div>
        </div>
      </section>
    </>
  );
}
