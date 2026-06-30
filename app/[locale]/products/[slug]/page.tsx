import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllProducts, getProductBySlug, getProductSlugs } from "@/lib/data/products";
import { KitComponentIcon } from "@/components/products/kit-component-icon";
import { routing } from "@/lib/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildProduct, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProductBySlug(slug, locale);
  if (!p) return {};
  return {
    title: p.name,
    description: p.desc?.slice(0, 160),
    alternates: buildAlternates(`/products/${slug}`),
    openGraph: {
      title: p.name,
      description: p.desc,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: `/products/${slug}`,
      images: [
        {
          url: p.images?.[0]?.url ?? "/og-default.png",
          width: 1200,
          height: 630,
          alt: p.images?.[0]?.alt ?? p.name,
        },
      ],
    },
    twitter: { card: "summary_large_image", title: p.name, description: p.desc },
  };
}

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

// Overview HTML is crawled from the legacy site; sanitize before rendering.
function safeHtml(raw: string): string {
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "b", "u", "ul", "ol", "li", "h2", "h3", "h4", "a", "blockquote"],
    ALLOWED_ATTR: ["href", "title", "rel", "target"],
  });
}

export default async function ProductDetail({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "product.detailPage" });
  const p = await getProductBySlug(slug, locale);
  if (!p) notFound();
  const all = await getAllProducts(locale);
  const related = all.filter((x) => x.slug !== slug).slice(0, 3);
  const productJsonLd = buildProduct(p, locale);

  const featureText = t.raw("features") as { t: string; d: string }[];
  const features = featureText.map((f, i) => ({ ...f, n: String(i + 1).padStart(2, "0") }));
  const tabLabels = t.raw("tabs") as string[];
  const tabMeta = [
    { n: "01", h: "#specs" },
    { n: "02", h: "#docs" },
    { n: "03", h: "#sw" },
    { n: "04", h: "#drawing" },
  ];
  const tabs = tabMeta.map((m, i) => ({ ...m, l: tabLabels[i] }));

  return (
    <>
      <JsonLd data={productJsonLd} />
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-12 pb-16">
          <div className="qs-crumb mb-8">
            <Link href="/">{t("breadcrumb.home")}</Link><span className="sep">/</span>
            <Link href="/products">{t("breadcrumb.products")}</Link><span className="sep">/</span>
            <Link href="/products">{t("breadcrumb.category")}</Link><span className="sep">/</span>
            <span className="here">{p.name}</span>
          </div>
          <div className="grid md:grid-cols-[1fr_1.1fr] gap-16 items-center">
            <div>
              <small className="block font-mono text-xs text-gold-1 tracking-[.18em] uppercase mb-3.5">{t("modelLine", { name: p.name })}</small>
              <h1 className="qs-h1">{p.tag}</h1>
              <div className="flex flex-col gap-3.5 mt-8">
                {features.map(f => (
                  <div key={f.n} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 border border-gold grid place-items-center font-mono text-[10px] text-gold-1 shrink-0 mt-0.5">{f.n}</div>
                    <div>
                      <b className="block font-semibold text-[15px]">{f.t}</b>
                      <span className="text-muted text-[13px]">{f.d}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* visual */}
            <div className="bg-white border border-line p-10 relative">
              <div className="absolute inset-3 border border-dashed border-gold opacity-30 pointer-events-none"></div>
              <div className="grid place-items-center p-8 sm:p-10 min-h-[300px]"
                   style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}>
                <Image
                  src={p.image.src}
                  alt={`${p.tag} — ${t("breadcrumb.category")}`}
                  width={p.image.w}
                  height={p.image.h}
                  priority
                  sizes="(max-width: 768px) 90vw, 480px"
                  className="w-auto max-h-[340px] max-w-full object-contain"
                />
              </div>
              <div className="absolute bottom-3 right-4 font-mono text-[10px] tracking-[.18em] uppercase text-muted">QS · {p.name.toUpperCase()}</div>
              <div className="absolute bottom-3 left-4 font-mono text-[10px] tracking-[.18em] uppercase text-muted">0 — 100 — 200mm</div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW — crawled marketing copy + per-model highlights */}
      {(p.overview || p.highlights.length > 0) && (
        <section className="py-16 bg-white border-b border-line">
          <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1.4fr_1fr] gap-16 items-start">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("overviewEyebrow")}</span>
              <h2 className="qs-h2 mt-2 mb-5">{t("overviewHeading")}</h2>
              {p.overview && (
                <div
                  className="prose prose-sm max-w-none text-[15px] leading-[1.8] text-[#2a2520]"
                  dangerouslySetInnerHTML={{ __html: safeHtml(p.overview) }}
                />
              )}
            </div>
            {p.highlights.length > 0 && (
              <aside className="bg-paper border border-line p-7">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-4">{t("highlightsHeading")}</div>
                <ul className="list-none p-0 m-0 space-y-2.5">
                  {p.highlights.map((h) => (
                    <li key={h} className="text-[13.5px] text-ink leading-[1.5] pl-5 relative before:content-['▸'] before:absolute before:left-0 before:top-0 before:text-gold-1">{h}</li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </section>
      )}

      {/* TABS */}
      <section className="bg-white border-b border-line sticky top-[72px] z-30">
        <div className="max-w-wrap mx-auto px-12 flex gap-0">
          {tabs.map((tab, i) => (
            <a key={tab.n} href={tab.h} className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-baseline gap-3 ${i===0 ? "text-ink border-gold-2" : "text-[#5a5650] border-transparent hover:text-ink"}`}>
              <span className="font-mono text-[10px] text-gold-1 tracking-[.16em]">{tab.n}</span>
              {tab.l}
            </a>
          ))}
        </div>
      </section>

      {/* SPECS + QUOTE */}
      <section className="py-20 bg-white scroll-mt-32" id="specs">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1.4fr_1fr] gap-16 items-start">
          <div>
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("specsEyebrow")}</span>
            <h2 className="qs-h2 mt-2 mb-6">{t("specsHeading")}</h2>
            <div className="border border-line bg-white overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th className="px-5 py-3.5 align-bottom font-mono text-[10px] text-muted tracking-[.14em] uppercase font-medium">
                      {t("specsColHead")}
                    </th>
                    {p.interfaces.map((c) => (
                      <th key={c.name} className="px-5 py-3.5 align-bottom border-l border-line">
                        <span className="block font-display text-[13px] font-semibold text-ink leading-tight">{c.name}</span>
                        {c.note && (
                          <span className="block font-mono text-[10px] text-gold-1 tracking-[.14em] uppercase mt-0.5">{c.note}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.specs.map((s, i) => {
                    const cells = Array.isArray(s.v) ? s.v : null;
                    return (
                      <tr key={s.l} className={`${i % 2 === 0 ? "bg-paper" : ""} ${i < p.specs.length - 1 ? "border-b border-line" : ""}`}>
                        <th scope="row" className="px-5 py-4 align-top font-mono text-[11px] text-muted tracking-[.14em] uppercase font-medium">
                          {s.l}
                        </th>
                        {cells
                          ? cells.map((v, j) => (
                              <td key={j} className="px-5 py-4 align-top border-l border-line font-display text-[15px] font-semibold text-ink">
                                {v}
                              </td>
                            ))
                          : (
                              <td colSpan={p.interfaces.length} className="px-5 py-4 align-top border-l border-line font-display text-[15px] font-semibold text-ink">
                                {s.v}
                              </td>
                            )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <aside id="quote" className="bg-paper border border-line p-7 sticky top-32">
            <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">{t("quoteEyebrow", { name: p.name })}</div>
            <h3 className="font-display font-semibold text-xl tracking-[-.005em] mt-2 mb-2">{t("quoteHeading")}</h3>
            <p className="text-[13px] text-muted leading-[1.6] m-0 mb-5">{t("quoteBody")}</p>
            <Link className="qs-btn qs-btn-gold w-full justify-center" href="/contact">{t("quoteBtn")}</Link>
          </aside>
        </div>
      </section>

      {/* DOCUMENTS + SOFTWARE + ACCESSORIES (crawled catalogue) */}
      {(p.documents.length > 0 || p.software.length > 0 || p.accessories.length > 0) && (
        <section className="py-16 bg-paper border-t border-line">
          <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-2 gap-12">
            <div id="docs" className="scroll-mt-32">
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("docsEyebrow")}</span>
              <h2 className="qs-h2 mt-2 mb-2">{t("docsHeading")}</h2>
              <p className="text-[13px] text-muted leading-[1.6] m-0 mb-5">{t("docsHint")}</p>
              <ul className="list-none p-0 m-0 border border-line bg-white">
                {p.documents.map((d, i) => (
                  <li key={d} className={`flex items-center gap-3 px-5 py-3.5 ${i < p.documents.length - 1 ? "border-b border-line" : ""}`}>
                    <span className="font-mono text-[10px] text-gold-1 tracking-[.14em]">[ {String(i + 1).padStart(2, "0")} ]</span>
                    <span className="font-display text-[15px] font-semibold text-ink">{d}</span>
                  </li>
                ))}
              </ul>
              {p.accessories.length > 0 && (
                <div className="mt-7">
                  <span className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase block mb-3">{t("accessoriesHeading")}</span>
                  <div className="flex flex-wrap gap-2">
                    {p.accessories.map((a) => (
                      <span key={a} className="font-mono text-[11px] text-ink bg-white border border-line px-2.5 py-1.5">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div id="sw" className="scroll-mt-32">
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("swEyebrow")}</span>
              <h2 className="qs-h2 mt-2 mb-2">{t("swHeading")}</h2>
              <p className="text-[13px] text-muted leading-[1.6] m-0 mb-5">{t("swHint")}</p>
              <ul className="list-none p-0 m-0 border border-line bg-white">
                {p.software.map((s, i) => (
                  <li key={s} className={`flex items-center gap-3 px-5 py-3.5 ${i < p.software.length - 1 ? "border-b border-line" : ""}`}>
                    <span className="font-mono text-[10px] text-gold-1 tracking-[.14em]">[ {String(i + 1).padStart(2, "0")} ]</span>
                    <span className="font-display text-[15px] font-semibold text-ink">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* GALLERY — real product photos */}
      {p.gallery.length > 0 && (
        <section id="drawing" className="py-16 bg-white border-t border-line scroll-mt-32">
          <div className="max-w-wrap mx-auto px-12">
            <div className="qs-section-head">
              <div>
                <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("galleryEyebrow")}</span>
                <h2 className="qs-h2 mt-2">{t("galleryHeading")}</h2>
              </div>
              {p.sourceUrl && (
                <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="qs-btn qs-btn-ghost qs-btn-sm">{t("sourceLink")}</a>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-line border border-line">
              {p.gallery.map((g, i) => (
                <div key={g.src} className="bg-white grid place-items-center p-6 min-h-[240px]">
                  <Image
                    src={g.src}
                    alt={g.alt}
                    width={g.w}
                    height={g.h}
                    sizes="(max-width: 768px) 45vw, 360px"
                    loading={i < 3 ? undefined : "lazy"}
                    className="w-auto max-h-[260px] max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PACKAGE */}
      <section className="py-20 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("packageEyebrow", { name: p.name })}</span>
              <h2 className="qs-h2 mt-2">CNC Controller — Full Package</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-line border border-line">
            {p.bundle.map((c, i) => {
              // real render when available; controller reuses the front photo
              const photo = c.photo ?? (c.icon === "controller" ? p.image : null);
              return (
                <div key={c.label} className="bg-white p-6 flex flex-col gap-3">
                  <div className="font-mono text-[10px] text-gold-1 tracking-[.16em]">[ {String(i + 1).padStart(2, "0")} ]</div>
                  <div className="bg-paper border border-line grid place-items-center p-4 h-[150px]">
                    {photo ? (
                      <Image
                        src={photo.src}
                        alt={c.label}
                        width={photo.w}
                        height={photo.h}
                        sizes="160px"
                        className="max-h-[118px] w-auto max-w-full object-contain"
                      />
                    ) : (
                      <KitComponentIcon type={c.icon} className="h-3/4 w-auto" />
                    )}
                  </div>
                  <div className="font-display font-semibold text-[15px] text-ink leading-[1.35]">{c.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section className="py-20 bg-paper">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("relatedEyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("relatedHeading")}</h2>
            </div>
            <div className="flex gap-2">
              <button className="w-9 h-9 border border-line grid place-items-center hover:border-ink">‹</button>
              <button className="w-9 h-9 border border-line grid place-items-center hover:border-ink">›</button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map(r => (
              <Link key={r.slug} href={`/products/${r.slug}`}
                    className="bg-white border border-line p-6 flex flex-col gap-4 hover:-translate-y-0.5 hover:border-ink transition-all">
                <div className="grid place-items-center border border-line rounded-[2px] p-6 min-h-[190px]"
                     style={{background:"radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)"}}>
                  <Image
                    src={r.image.src}
                    alt={r.tag}
                    width={r.image.w}
                    height={r.image.h}
                    sizes="(max-width: 768px) 90vw, 280px"
                    className="w-auto max-h-[150px] max-w-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display font-semibold text-lg m-0">{r.name}</h3>
                  <span className="font-mono text-[11px] text-muted tracking-[.12em] uppercase">{r.axes} · {r.display}</span>
                  <p className="text-[13px] text-[#5a5650] leading-[1.55] m-0 mt-0.5 line-clamp-2">{r.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white border-t border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="bg-ink text-[#cfc9b8] p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h3 className="font-display font-bold text-3xl text-white tracking-[-.01em] m-0">{t("ctaHeading", { name: p.name })}</h3>
              <p className="text-[#a8a499] mt-2 max-w-[60ch] m-0 text-[15px]">{t("ctaBody")}</p>
            </div>
            <Link className="qs-btn qs-btn-gold" href="/contact">{t("ctaBtn")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
