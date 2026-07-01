import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProductBySlug, getProductSlugs, type ProductView } from "@/lib/data/products";
import { getProductDownloads, groupByDocument, formatBytes, type DownloadFile } from "@/lib/data/downloads";
import { KitComponentIcon } from "@/components/products/kit-component-icon";
import { ProductDetailTabs, type ProductDetailTab } from "../_components/product-detail-tabs";
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

function safeHtml(raw: string): string {
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "b", "u", "ul", "ol", "li", "h2", "h3", "h4", "a", "blockquote"],
    ALLOWED_ATTR: ["href", "title", "rel", "target"],
  });
}

function findSpec(p: ProductView, needles: string[]): string | null {
  const normalizedNeedles = needles.map((n) => n.toLowerCase());
  for (const group of p.detailedSpecs) {
    for (const row of group.rows) {
      const label = row.l.toLowerCase();
      if (normalizedNeedles.some((n) => label.includes(n))) {
        return Array.isArray(row.v) ? row.v.join(" · ") : row.v;
      }
    }
  }
  for (const row of p.specs) {
    const label = row.l.toLowerCase();
    if (normalizedNeedles.some((n) => label.includes(n))) {
      return Array.isArray(row.v) ? row.v.join(" · ") : row.v;
    }
  }
  return null;
}

function SpecLedger({ title, rows }: { title: string; rows: { l: string; v: string | string[] }[] }) {
  return (
    <section className="bg-white border border-line">
      <h3 className="font-mono text-[11px] tracking-[.16em] uppercase text-ink px-5 py-4 border-b border-line bg-paper">
        {title}
      </h3>
      <dl className="divide-y divide-line">
        {rows.map((row) => (
          <div key={row.l} className="grid grid-cols-[minmax(120px,.82fr)_1fr] gap-4 px-5 py-3.5">
            <dt className="font-mono text-[10px] tracking-[.12em] uppercase text-muted leading-relaxed">{row.l}</dt>
            <dd className="m-0 text-[15px] font-semibold tracking-[-.01em] text-ink text-right sm:text-left">
              {Array.isArray(row.v) ? row.v.join(" · ") : row.v}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default async function ProductDetail({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "product.detailPage" });
  const tDl = await getTranslations({ locale, namespace: "downloads.index" });
  const p = await getProductBySlug(slug, locale);
  if (!p) notFound();

  const productJsonLd = buildProduct(p, locale);
  const tabLabels = t.raw("tabs") as string[];
  const featureText = t.raw("features") as { t: string; d: string }[];
  const featured = p.gallery[0] ?? { src: p.image.src, w: p.image.w, h: p.image.h, alt: p.tag };
  const morePhotos = p.gallery[0] ? p.gallery.slice(1) : [];
  const overviewHtml = p.overview ?? `<p>${p.desc}</p>`;
  const detailedSpecs = p.detailedSpecs.length > 0 ? p.detailedSpecs : [{ title: t("specsHeading"), rows: p.specs }];
  const heroStats = [
    { l: t("factAxes"), v: p.axes },
    { l: t("factDisplay"), v: p.display },
    { l: "I/O", v: findSpec(p, ["standard i/o", "i/o ports"]) ?? "—" },
    { l: "Look-Ahead", v: findSpec(p, ["look-ahead"]) ?? "—" },
  ];

  const downloadDocs = groupByDocument(getProductDownloads(slug));
  const downloadTitle = (d: DownloadFile): string => {
    if (d.titleKey) return tDl(`titles.${d.titleKey}`);
    if (d.category === "operation" || d.category === "installation") return `${d.model} — ${tDl(`docType.${d.category}`)}`;
    return d.model ?? "";
  };

  const overviewPanel = (
    <section className="bg-[#f7f5ef] py-16 lg:py-20">
      <div className="qs-wrap-wide">
        <div className="grid lg:grid-cols-[minmax(0,1.12fr)_420px] gap-10 lg:gap-16 items-start">
          <article className="min-w-0">
            <span className="qs-eyebrow">{t("overviewEyebrow")}</span>
            <h2 className="qs-h2 mt-3 max-w-[760px]">{t("overviewHeading")}</h2>
            <div
              className="prose prose-sm mt-6 max-w-[74ch] prose-p:text-[16px] prose-p:leading-[1.85] prose-p:text-[#2f2c26] prose-p:my-4"
              dangerouslySetInnerHTML={{ __html: safeHtml(overviewHtml) }}
            />

            {p.highlights.length > 0 && (
              <div className="mt-10 border-y border-line">
                <div className="grid md:grid-cols-[220px_1fr] gap-px bg-line">
                  <div className="bg-[#f7f5ef] py-5 pr-6">
                    <div className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("highlightsHeading")}</div>
                  </div>
                  <ul className="list-none m-0 p-0 bg-white divide-y divide-line">
                    {p.highlights.map((h, i) => (
                      <li key={h} className="grid grid-cols-[44px_1fr] items-start gap-4 px-5 py-3.5">
                        <span className="font-mono text-[10px] text-gold-1 tracking-[.16em]">{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-[14.5px] leading-[1.55] text-ink">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </article>

          <aside className="lg:sticky lg:top-32">
            <div className="bg-[#131410] text-[#ded8c7] border border-[#2d2b23] p-5 sm:p-6 shadow-[0_26px_70px_-48px_rgba(25,18,4,.9)]">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="font-mono text-[10px] tracking-[.18em] uppercase text-gold-2/85">Machine passport</div>
                  <div className="font-display text-2xl font-bold text-white mt-1">{p.name}</div>
                </div>
                <div className="h-10 w-10 border border-gold-2/40 grid place-items-center font-mono text-[10px] text-gold-2">QS</div>
              </div>
              <dl className="divide-y divide-white/10">
                {heroStats.map((f) => (
                  <div key={f.l} className="grid grid-cols-[120px_1fr] gap-4 py-4">
                    <dt className="font-mono text-[10px] tracking-[.16em] uppercase text-[#8f8878]">{f.l}</dt>
                    <dd className="m-0 font-semibold text-white text-right">{f.v}</dd>
                  </div>
                ))}
              </dl>
              <Link className="qs-btn qs-btn-gold w-full justify-center mt-2" href="/contact">{t("quoteBtn")}</Link>
              {p.sourceUrl && (
                <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center font-mono text-[11px] tracking-[.1em] uppercase text-gold-2 hover:text-white">
                  {t("sourceLink")}
                </a>
              )}
            </div>
          </aside>
        </div>

        {featured && (
          <div className="mt-14">
            <div className="flex items-center justify-between gap-4 border-b border-line pb-3 mb-6">
              <span className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">{t("galleryHeading")}</span>
              <span className="font-mono text-[10px] text-muted tracking-[.14em]">{String(p.gallery.length).padStart(2, "0")} ảnh</span>
            </div>
            <div className="grid lg:grid-cols-[1.12fr_.88fr] gap-px bg-line border border-line">
              <figure className="m-0 bg-white min-h-[320px] p-6 sm:p-8 lg:p-10 grid place-items-center relative overflow-hidden">
                <div className="absolute inset-0 qs-grid-bg opacity-35" />
                <Image
                  src={featured.src}
                  alt={featured.alt}
                  width={featured.w}
                  height={featured.h}
                  sizes="(max-width: 1024px) 92vw, 720px"
                  className="relative w-auto max-h-[520px] max-w-full object-contain"
                />
              </figure>
              <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-px bg-line">
                {morePhotos.slice(0, 3).map((g) => (
                  <figure key={g.src} className="m-0 bg-white p-5 min-h-[210px] grid place-items-center">
                    <Image
                      src={g.src}
                      alt={g.alt}
                      width={g.w}
                      height={g.h}
                      sizes="(max-width: 1024px) 46vw, 360px"
                      loading="lazy"
                      className="w-auto max-h-[250px] max-w-full object-contain"
                    />
                  </figure>
                ))}
              </div>
            </div>

            {morePhotos.length > 3 && (
              <div className="mt-px grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-line border border-line border-t-0">
                {morePhotos.slice(3).map((g) => (
                  <figure key={g.src} className="m-0 bg-white p-5 min-h-[190px] grid place-items-center">
                    <Image
                      src={g.src}
                      alt={g.alt}
                      width={g.w}
                      height={g.h}
                      sizes="(max-width: 768px) 45vw, 300px"
                      loading="lazy"
                      className="w-auto max-h-[210px] max-w-full object-contain"
                    />
                  </figure>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );

  const specsPanel = (
    <section className="bg-white py-16 lg:py-20">
      <div className="qs-wrap-wide grid xl:grid-cols-[1fr_360px] gap-10 lg:gap-14 items-start">
        <div>
          <span className="qs-eyebrow">{t("specsEyebrow")}</span>
          <h2 className="qs-h2 mt-3 mb-8">{t("specsHeading")}</h2>
          <div className="grid lg:grid-cols-2 gap-5">
            {detailedSpecs.map((group) => (
              <SpecLedger key={group.title} title={group.title} rows={group.rows} />
            ))}
          </div>

          {p.gCodes.length > 0 && (
            <section className="mt-6 bg-[#11120f] text-white border border-[#27251f] p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-white/10 pb-4 mb-5">
                <div>
                  <div className="font-mono text-[10px] tracking-[.18em] uppercase text-gold-2/80">G-code matrix</div>
                  <h3 className="font-display text-xl font-semibold m-0 mt-1">Các mã G-code hỗ trợ</h3>
                </div>
                <span className="font-mono text-[11px] text-[#aaa18f]">{p.gCodes.length} codes</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.gCodes.map((code) => (
                  <span key={code} className="font-mono text-[11px] tracking-[.08em] border border-white/10 bg-white/[.04] px-3 py-2 text-[#eee9d7]">
                    {code}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside id="quote" className="xl:sticky xl:top-32 bg-paper border border-line p-6 sm:p-7">
          <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">{t("quoteEyebrow", { name: p.name })}</div>
          <h3 className="font-display font-semibold text-2xl tracking-[-.015em] mt-2 mb-2">{t("quoteHeading")}</h3>
          <p className="text-[14px] text-muted leading-[1.7] m-0 mb-5">{t("quoteBody")}</p>
          <div className="grid grid-cols-3 gap-px bg-line border border-line mb-5">
            {heroStats.slice(0, 3).map((stat) => (
              <div key={stat.l} className="bg-white p-3">
                <div className="font-mono text-[9px] text-muted tracking-[.14em] uppercase">{stat.l}</div>
                <div className="text-[13px] font-semibold text-ink mt-1 truncate">{stat.v}</div>
              </div>
            ))}
          </div>
          <Link className="qs-btn qs-btn-gold w-full justify-center" href="/contact">{t("quoteBtn")}</Link>
        </aside>
      </div>
    </section>
  );

  const resourcesPanel = (
    <section className="py-16 bg-paper">
      <div className="qs-wrap-wide">
        <div className="qs-section-head">
          <div className="max-w-[62ch]">
            <span className="qs-eyebrow">{t("resourcesEyebrow")}</span>
            <h2 className="qs-h2 mt-2">{t("resourcesHeading")}</h2>
            <p className="text-[14px] text-muted leading-[1.7] mt-3 mb-0">{t("resourcesHint")}</p>
          </div>
          <Link href="/downloads" className="qs-btn qs-btn-ghost qs-btn-sm">{t("resourcesAllLink")}</Link>
        </div>

        <div className="border border-line bg-white">
          <div className="hidden md:grid grid-cols-[1fr_120px_minmax(200px,auto)] gap-4 px-5 py-3 bg-[#0e0e0c] text-[#cfc9b8] font-mono text-[10px] tracking-[.16em] uppercase">
            <span>{tDl("table.name")}</span>
            <span>{tDl("table.version")}</span>
            <span className="text-right">{tDl("table.download")}</span>
          </div>
          {downloadDocs.map((doc) => {
            const head = doc.variants[0];
            return (
              <div key={doc.key} className="grid grid-cols-1 md:grid-cols-[1fr_120px_minmax(200px,auto)] gap-x-4 gap-y-3 items-center px-5 py-4 border-t border-line hover:bg-paper transition-colors">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-[52px] flex-shrink-0 border border-line grid place-items-center font-display font-extrabold text-[10px] tracking-[-.02em] bg-white text-ink">
                    {head.ext}
                  </span>
                  <span className="font-semibold text-ink text-[14px] tracking-[-.005em] min-w-0">{downloadTitle(head)}</span>
                </div>
                <span className="font-mono text-[11px] text-muted md:text-[#3a3a3a]">
                  {head.version ?? (head.date ? head.date.slice(0, 7).replace("-", "/") : "—")}
                </span>
                <div className="flex gap-2 md:justify-end">
                  {doc.variants.map((v) => (
                    <a key={v.slug} href={v.fileUrl} download className="flex-1 md:flex-initial inline-flex flex-col items-center gap-0.5 whitespace-nowrap border border-ink bg-ink text-white px-4 py-2 hover:bg-gold-3 hover:border-gold-3 transition-colors">
                      <span className="font-mono text-[11px] tracking-[.14em] uppercase">{v.lang.toUpperCase()} ↓</span>
                      <span className="font-mono text-[9px] tracking-[.06em] opacity-60">{formatBytes(v.sizeBytes)}</span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

  const tabs: ProductDetailTab[] = [
    { id: "overview", label: tabLabels[0], content: overviewPanel },
    { id: "specs", label: tabLabels[1], content: specsPanel },
    ...(downloadDocs.length > 0 ? [{ id: "resources", label: tabLabels[2], content: resourcesPanel }] : []),
  ];

  return (
    <>
      <JsonLd data={productJsonLd} />
      <section className="relative overflow-hidden bg-[#10110f] text-white border-b border-[#28261f]">
        <div className="absolute inset-0 qs-grid-bg opacity-[.12]" />
        <div className="absolute -right-20 top-0 h-[420px] w-[420px] rounded-full bg-gold-2/10 blur-3xl" aria-hidden="true" />
        <div className="relative qs-wrap-wide pt-8 pb-14 lg:pt-10 lg:pb-16">
          <div className="qs-crumb mb-8 text-[#8f8878]">
            <Link href="/">{t("breadcrumb.home")}</Link><span className="sep">/</span>
            <Link href="/products">{t("breadcrumb.products")}</Link><span className="sep">/</span>
            <span className="here text-[#eee9d7]">{p.name}</span>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,.86fr)] gap-10 lg:gap-14 items-center">
            <div>
              <small className="block font-mono text-[11px] text-gold-2 tracking-[.18em] uppercase mb-4">{t("modelLine", { name: p.name })}</small>
              <h1 className="font-display font-bold tracking-[-.035em] leading-[.98] text-balance m-0 text-[clamp(44px,7vw,92px)]">
                {p.tag}
              </h1>
              <p className="mt-6 text-[17px] leading-[1.75] text-[#c9c2b3] max-w-[68ch]">{p.desc}</p>
              <div className="mt-8 grid sm:grid-cols-3 gap-px bg-white/10 border border-white/10 max-w-[820px]">
                {featureText.map((f, i) => (
                  <div key={f.t} className="bg-[#141510] p-4">
                    <div className="font-mono text-[10px] tracking-[.18em] text-gold-2/80">0{i + 1}</div>
                    <b className="block text-white font-semibold mt-2">{f.t}</b>
                    <span className="block text-[13px] leading-[1.55] text-[#9f9788] mt-1">{f.d}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="qs-btn qs-btn-gold" href="/contact">{t("quoteBtn")}</Link>
                <Link className="qs-btn border border-white/25 bg-transparent text-white hover:bg-white hover:text-ink" href="/downloads">{t("resourcesAllLink")}</Link>
              </div>
            </div>

            <figure className="m-0 relative min-h-[420px] bg-[#171812] border border-white/10 p-6 sm:p-9 shadow-[0_34px_90px_-58px_rgba(0,0,0,.95)]">
              <div className="absolute inset-4 border border-dashed border-gold-2/25 pointer-events-none" />
              <div className="absolute top-4 left-5 font-mono text-[10px] tracking-[.18em] uppercase text-[#8f8878]">calibration view</div>
              <div className="absolute bottom-4 right-5 font-mono text-[10px] tracking-[.18em] uppercase text-[#8f8878]">QS · {p.name.toUpperCase()}</div>
              <div className="absolute left-7 right-7 top-1/2 h-px bg-gold-2/20" aria-hidden="true" />
              <div className="relative grid place-items-center min-h-[360px]">
                <Image
                  src={p.image.src}
                  alt={`${p.tag} — CNC controller render`}
                  width={p.image.w}
                  height={p.image.h}
                  priority
                  sizes="(max-width: 1024px) 90vw, 520px"
                  className="w-auto max-h-[430px] max-w-full object-contain drop-shadow-[0_28px_44px_rgba(0,0,0,.45)]"
                />
              </div>
            </figure>
          </div>

          <dl className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {heroStats.map((stat) => (
              <div key={stat.l} className="bg-[#141510] px-4 py-4 sm:px-5 sm:py-5">
                <dt className="font-mono text-[10px] tracking-[.16em] uppercase text-[#837b6c]">{stat.l}</dt>
                <dd className="m-0 mt-2 font-display text-[22px] font-semibold tracking-[-.02em] text-white">{stat.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <ProductDetailTabs tabs={tabs} />

      <section className="py-16 lg:py-20 bg-white">
        <div className="qs-wrap-wide">
          <div className="qs-section-head">
            <div>
              <span className="qs-eyebrow">{t("packageEyebrow", { name: p.name })}</span>
              <h2 className="qs-h2 mt-2">CNC Controller — Full Package</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-line border border-line">
            {p.bundle.map((c, i) => {
              const photo = c.photo ?? (c.icon === "controller" ? p.image : null);
              return (
                <div key={c.label} className="bg-white p-5 sm:p-6 flex flex-col gap-3 min-h-[238px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] text-gold-1 tracking-[.16em]">[ {String(i + 1).padStart(2, "0")} ]</span>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                  <div className="bg-paper border border-line grid place-items-center p-4 h-[150px]">
                    {photo ? (
                      <Image src={photo.src} alt={c.label} width={photo.w} height={photo.h} sizes="160px" className="max-h-[118px] w-auto max-w-full object-contain" />
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

      <section className="py-18 lg:py-20 bg-white border-t border-line">
        <div className="qs-wrap-wide">
          <div className="bg-[#11120f] text-[#cfc9b8] p-7 sm:p-10 lg:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center border border-[#28261f]">
            <div>
              <h3 className="font-display font-bold text-3xl text-white tracking-[-.01em] m-0">{t("ctaHeading", { name: p.name })}</h3>
              <p className="text-[#a8a499] mt-2 max-w-[60ch] m-0 text-[15px] leading-relaxed">{t("ctaBody")}</p>
            </div>
            <Link className="qs-btn qs-btn-gold" href="/contact">{t("ctaBtn")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
