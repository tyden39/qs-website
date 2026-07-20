import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import CircuitTraces from "@/components/circuit-traces";
import type { CatalogProductView } from "@/lib/data/catalog";
import type { Locale } from "@/lib/i18n/config";

/**
 * Detail page for DNC units and accessories.
 *
 * Deliberately simpler than the controller template: there is no protocol
 * datasheet, kit grid or G-code list to show, so the page is hero → spec table
 * → feature walkthrough → quote CTA. Products whose source page carried no
 * feature copy (most boards) simply drop that band.
 */
export async function CatalogDetail({
  product,
  locale,
}: {
  product: CatalogProductView;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "product.detailPage" });
  const tc = await getTranslations({ locale, namespace: "product.card" });

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#10110f] text-white border-b border-[#28261f]">
        <div className="absolute inset-0 qs-grid-bg opacity-[.12]" />
        <div
          className="absolute -right-20 top-0 h-[420px] w-[420px] rounded-full bg-gold-2/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative qs-wrap-wide pt-8 pb-14 lg:pt-10 lg:pb-16">
          <div className="qs-crumb mb-8 text-[#8f8878]">
            <Link href="/">{t("breadcrumb.home")}</Link>
            <span className="sep">/</span>
            <Link href="/products">{t("breadcrumb.products")}</Link>
            <span className="sep">/</span>
            <span className="here text-[#eee9d7]">{product.name}</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(420px,.86fr)] gap-10 lg:gap-14 items-center">
            <div>
              <small className="block font-mono text-[11px] text-gold-2 tracking-[.18em] uppercase mb-4">
                {t("modelLine", { name: product.name })}
              </small>
              <h1 className="font-display font-bold tracking-[-.035em] leading-[1.02] text-balance m-0 text-[clamp(32px,5.5vw,64px)]">
                {product.tag}
              </h1>
              <p className="mt-6 text-[17px] leading-[1.75] text-[#c9c2b3] max-w-[68ch]">
                {product.desc}
              </p>

              <div className="mt-8 flex items-baseline gap-3">
                <span className="font-mono text-[10px] tracking-[.18em] uppercase text-[#837b6c]">
                  {t("priceLabel")}
                </span>
                {product.price ? (
                  <span className="font-display text-[28px] font-semibold tracking-[-.02em] text-white">
                    {product.price}
                  </span>
                ) : (
                  <span className="font-display text-[22px] font-semibold tracking-[-.01em] text-gold-2">
                    {tc("priceOnRequest")}
                  </span>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="qs-btn qs-btn-gold" href="/contact">
                  {t("quoteBtn")}
                </Link>
                <a
                  className="qs-btn border border-white/25 bg-transparent text-white hover:bg-white hover:text-ink"
                  href="#specs"
                >
                  {t("specsLink")}
                </a>
              </div>
            </div>

            <div
              className="relative grid place-items-center border border-white/10 p-6 lg:p-8 overflow-hidden"
              style={{ background: "radial-gradient(circle at 50% 38%, #1b1c17, #101109)" }}
            >
              <div
                className="absolute inset-3 border border-dashed border-gold opacity-25 pointer-events-none"
                aria-hidden="true"
              />
              <Image
                src={product.image.src}
                alt={product.image.alt}
                width={product.image.w}
                height={product.image.h}
                priority
                sizes="(max-width: 768px) 90vw, 520px"
                className="w-auto max-h-[380px] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Specifications ── */}
      <section id="specs" className="relative overflow-hidden bg-paper border-b border-line py-14 lg:py-18">
        <CircuitTraces
          variant="light"
          className="hidden md:block absolute inset-y-0 right-0 w-[34%] opacity-[.45] [mask-image:radial-gradient(ellipse_at_right,#000_18%,transparent_66%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_18%,transparent_66%)]"
        />
        <div className="relative qs-wrap-wide">
          <div className="qs-eyebrow mb-5">{t("specsEyebrow")}</div>
          <div className="border border-line">
            <div className="bg-[#11120f] px-4 py-3.5">
              <span className="font-display text-[15px] font-bold tracking-[-.01em] text-white">
                {product.name}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-px bg-line border-t border-line">
              {product.specs.map((s) => (
                <div key={s.l} className="bg-white px-4 py-3.5 flex flex-col gap-1">
                  <span className="font-mono text-[10px] leading-snug tracking-[.06em] uppercase text-muted">
                    {s.l}
                  </span>
                  <span className="text-[14px] font-semibold tracking-[-.005em] text-ink tabular-nums">
                    {s.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features (only where the catalogue documents them) ── */}
      {product.features.length > 0 && (
        <section className="py-14 lg:py-20 bg-white border-b border-line">
          <div className="qs-wrap-wide">
            <div className="qs-eyebrow mb-8">{t("featuresHeading")}</div>
            <div className="flex flex-col gap-12 lg:gap-16">
              {product.features.map((f, i) => (
                <div
                  key={f.title}
                  className={`grid gap-8 lg:gap-12 items-center ${
                    f.photo ? "md:grid-cols-2" : ""
                  }`}
                >
                  <div className={f.photo && i % 2 === 1 ? "md:order-2" : ""}>
                    <div className="font-mono text-[10px] tracking-[.18em] text-gold-1">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h2 className="mt-2.5 font-display font-bold text-[26px] tracking-[-.02em] m-0">
                      {f.title}
                    </h2>
                    <p className="mt-3.5 m-0 text-[15px] leading-[1.75] text-[#3a3a3a] max-w-[62ch]">
                      {f.body}
                    </p>
                  </div>
                  {f.photo && (
                    <div
                      className={`relative grid place-items-center border border-line p-5 overflow-hidden ${
                        i % 2 === 1 ? "md:order-1" : ""
                      }`}
                      style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}
                    >
                      <Image
                        src={f.photo.src}
                        alt={f.photo.alt}
                        width={f.photo.w}
                        height={f.photo.h}
                        sizes="(max-width: 768px) 90vw, 560px"
                        className="w-auto max-h-[320px] max-w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-18 lg:py-20 bg-white">
        <div className="qs-wrap-wide">
          <div className="bg-[#11120f] text-[#cfc9b8] p-7 sm:p-10 lg:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center border border-[#28261f]">
            <div>
              <h3 className="font-display font-bold text-3xl text-white tracking-[-.01em] m-0">
                {t("ctaHeading", { name: product.name })}
              </h3>
              <p className="text-[#a8a499] mt-2 max-w-[60ch] m-0 text-[15px] leading-relaxed">
                {t("catalogCtaBody")}
              </p>
            </div>
            <Link className="qs-btn qs-btn-gold" href="/contact">
              {t("ctaBtn")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
