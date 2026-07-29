import Image from "@/components/media/image";
import { Link } from "@/lib/i18n/navigation";
import ContactCta from "@/components/contact-cta";
import { getTranslations } from "next-intl/server";
import CircuitTraces from "@/components/circuit-traces";
import { buildCatalogProduct, buildTrail, JsonLd } from "@/lib/seo/jsonld";
import { ProductHeroGallery, type HeroShot } from "./product-hero-gallery";
import { ProductVideo } from "./product-video";
import type { CatalogProductView } from "@/lib/data/catalog";
import type { Locale } from "@/lib/i18n/config";

// How many spec rows the hero lifts into its facts strip. Catalogue order is the
// authoring order, so the leading rows are the ones worth reading first.
const HERO_FACTS = 4;

// The strip sets its values at display size in a quarter-width cell, so it only
// works for the short ones — a dimension, a voltage, a port count. Some products
// document a spec as a full sentence ("thường 5 mm; một số phiên bản…"), which
// would run to four wrapped lines and tower over the rest of the row.
const HERO_FACT_MAX = 30;

/**
 * Detail page for DNC units and accessories.
 *
 * Deliberately simpler than the controller template: there is no protocol
 * datasheet, kit grid or G-code list to show, so the page is hero → spec table
 * → feature walkthrough → video → quote CTA. Each band after the hero drops out
 * on products the catalogue never documented that way — most boards ship spec
 * rows only.
 *
 * Because the catalogue ranges from a fully photographed DNC unit down to an
 * accessory with a single spec row, every band is laid out to look deliberate
 * when it is nearly empty. Two rules carry that: each band opens with the same
 * full-width rule under its heading, so the frame is drawn even when little
 * hangs off it, and the content below spreads across that full width in columns
 * rather than running one narrow measure down a 1680px page.
 */
export async function CatalogDetail({
  product,
  locale,
}: {
  product: CatalogProductView;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "product.detailPage" });
  const tPage = await getTranslations({ locale, namespace: "product.page" });

  // The two catalogue categories live on their own list pages now; the crumb
  // walks through the right one.
  const categoryPath = product.category === "dnc" ? "/electronics/dnc" : "/electronics/accessories";
  const categoryLabel = tPage(`groups.${product.category}.label`);
  const productJsonLd = buildCatalogProduct(product, locale);
  // A newly listed accessory can go up before its spec sheet arrives; the table
  // and the link that jumps to it appear only once there are rows to show.
  const hasSpecs = product.specs.length > 0;
  // The catalogue photo leads, then the extra hardware shots (port sides, rear
  // face). Products with no extra shots fall back to a one-slide hero, which the
  // gallery renders as a plain frame — no thumbnails, no autoplay.
  const heroShots: HeroShot[] = [product.image, ...product.gallery].map((im) => ({
    src: im.src,
    w: im.w,
    h: im.h,
    alt: im.alt,
  }));
  // The hero facts strip only pays for itself when it fills its own row, so it
  // waits for a product documented with at least that many scannable rows.
  const scannable = product.specs.filter((s) => s.v.length <= HERO_FACT_MAX);
  const heroFacts = scannable.length >= HERO_FACTS ? scannable.slice(0, HERO_FACTS) : [];
  // Some catalogue entries illustrate a feature with a shot the hero gallery
  // already carries. Showing it twice on one page reads as padding, so the hero
  // keeps it and the feature falls back to its text-only row.
  const heroSrcs = new Set(heroShots.map((s) => s.src));
  const features = product.features.map((f) => ({
    ...f,
    photo: f.photo && !heroSrcs.has(f.photo.src) ? f.photo : null,
  }));
  const breadcrumb = buildTrail(locale, t("breadcrumb.home"), [
    { name: t("breadcrumb.products"), path: "/electronics" },
    { name: categoryLabel, path: categoryPath },
    { name: product.name, path: `/electronics/${product.slug}` },
  ]);

  // The band has two shapes, picked by whether the catalogue illustrated this
  // product. Photographed features keep the walkthrough rows — body text with
  // its shot alongside. Features documented in words only would leave that photo
  // column empty on every row, so they read as a table instead: number, title,
  // description, all on one axis across the full frame.
  const anyFeaturePhoto = features.some((f) => f.photo);

  const featureIndex = (i: number) => (
    <div className="font-mono text-label-xs tracking-[.18em] text-gold-1 tabular-nums md:pt-1.5">
      {String(i + 1).padStart(2, "0")}
    </div>
  );

  // Every band opens the same way: eyebrow + heading on the left, an optional
  // count on the right, and one hairline ruled across the full frame.
  const bandHead = (eyebrow: string, heading: string, count?: number) => (
    <div className="qs-section-head">
      <div>
        <span className="qs-eyebrow">{eyebrow}</span>
        <h2 className="qs-h2 mt-2.5 text-ink">{heading}</h2>
      </div>
      {/* The tally is a drawing-sheet flourish, not information — below md the
          head stacks and it would orphan onto its own line under the title. */}
      {count !== undefined && (
        <span className="hidden md:inline font-mono text-label-xs text-muted tracking-[.16em] uppercase shrink-0">
          {String(count).padStart(2, "0")}
        </span>
      )}
    </div>
  );

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumb} />
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#10110f] text-white border-b border-[#28261f]">
        <div className="absolute inset-0 qs-grid-bg opacity-[.12]" />
        <div
          className="absolute -right-20 top-0 h-[420px] w-[420px] rounded-full bg-gold-2/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative qs-wrap-detail pt-8 pb-12 lg:pt-10 lg:pb-14">
          <div className="qs-crumb qs-crumb-dark mb-8 text-[#8f8878]">
            <Link href="/">{t("breadcrumb.home")}</Link>
            <span className="sep">/</span>
            <Link href="/electronics">{t("breadcrumb.products")}</Link>
            <span className="sep">/</span>
            <Link href={categoryPath}>{categoryLabel}</Link>
            <span className="sep">/</span>
            <span className="here text-[#eee9d7]">{product.name}</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(420px,.86fr)] gap-10 lg:gap-14 items-center">
            <div className="order-2 md:order-1">
              <small className="block font-mono text-label text-gold-2 tracking-[.18em] uppercase mb-4">
                {t("modelLine", { name: product.name })}
              </small>
              {/* Some products head the page with a bare model designation —
                  one long token with no space or hyphen to wrap at, which
                  browsers will happily run past the column. Those headings set
                  in a smaller size so the token fits on one line, with
                  `break-words` as the last-resort backstop. */}
              <h1
                className={`font-display font-bold tracking-[-.035em] leading-[1.02] text-balance break-words m-0 ${
                  /\s/.test(product.tag)
                    ? "text-[clamp(32px,5.5vw,64px)]"
                    : "text-[clamp(26px,4.2vw,46px)]"
                }`}
              >
                {product.tag}
              </h1>
              <p className="mt-6 text-lede leading-[1.75] text-[#c9c2b3] max-w-[62ch] sm:text-justify">
                {product.desc}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="qs-btn qs-btn-gold" href="/contact">
                  {t("quoteBtn")}
                </Link>
                {hasSpecs && (
                  <a
                    className="qs-btn border border-white/25 bg-transparent text-white hover:bg-white hover:text-ink"
                    href="#specs"
                  >
                    {t("specsLink")}
                  </a>
                )}
              </div>
            </div>

            <div className="order-1 md:order-2">
              <ProductHeroGallery
                shots={heroShots}
                name={product.name}
                calibrationLabel={t("calibrationLabel")}
                zoomLabel={t("lightbox.zoom")}
              />
            </div>
          </div>

          {/* Facts strip: squares off the hero and puts the numbers a buyer
              scans for above the fold, ahead of the full table below. */}
          {heroFacts.length > 0 && (
            <dl className="mt-10 lg:mt-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border border-white/10">
              {heroFacts.map((s) => (
                <div key={s.l} className="bg-[#141510] px-4 py-3.5 sm:px-5 sm:py-4">
                  <dt className="font-mono text-label-xs tracking-[.16em] uppercase text-[#837b6c]">
                    {s.l}
                  </dt>
                  <dd className="m-0 mt-1.5 font-display text-title font-semibold tracking-[-.02em] text-white tabular-nums">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* ── Specifications ── */}
      {hasSpecs && (
        <section
          id="specs"
          className="relative overflow-hidden scroll-mt-24 bg-paper border-b border-line py-8 sm:py-10 lg:py-14"
        >
          <CircuitTraces
            variant="light"
            className="hidden md:block absolute inset-y-0 right-0 w-[34%] opacity-[.45] [mask-image:radial-gradient(ellipse_at_right,#000_18%,transparent_66%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_18%,transparent_66%)]"
          />
          <div className="relative qs-wrap-detail">
            {bandHead(t("specsEyebrow"), t("catalogSpecsHeading"), product.specs.length)}

            {/* Where the catalogue wrote one, a lead paragraph sits between the
                ruled head and the table — the sheet's preamble. A shot of the
                product in situ runs alongside it when there is one; without it
                the copy keeps a narrow measure instead of spanning the frame. */}
            {(product.specsIntro || product.specsPhoto) && (
              <div
                className={`mb-8 lg:mb-10 grid items-center gap-6 lg:gap-12 ${
                  product.specsIntro && product.specsPhoto
                    ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]"
                    : ""
                }`}
              >
                {product.specsIntro && (
                  <p className="m-0 max-w-[80ch] text-body leading-[1.8] text-[#3a3a3a] sm:text-justify">
                    {product.specsIntro}
                  </p>
                )}
                {/* The shot fills its frame at its own aspect ratio: these
                    photos carry their own backdrop — some black, some white —
                    so any panel colour behind them would clash with half the
                    catalogue. Letting the image cover the box sidesteps it. */}
                {product.specsPhoto && (
                  <figure className="m-0 overflow-hidden border border-line">
                    <Image
                      src={product.specsPhoto.src}
                      alt={product.specsPhoto.alt}
                      width={product.specsPhoto.w}
                      height={product.specsPhoto.h}
                      sizes="(max-width: 1024px) 92vw, 480px"
                      className="block w-full h-auto"
                    />
                  </figure>
                )}
              </div>
            )}

            {/*
              Hairlines live on the cells, not on a `gap-px` sheet behind them: a
              spec count that does not fill its last row would otherwise leave
              the backing colour showing as a grey block. Each cell draws its own
              right and bottom rule and the grid hangs 1px past the frame, so the
              trailing rules are clipped instead of doubling the frame — the
              table closes cleanly at any column count and any row count.
            */}
            <div className="overflow-hidden border border-line bg-white">
              <div className="border-b border-line bg-[#11120f] px-5 py-3.5">
                <span className="font-display text-body font-bold tracking-[-.01em] text-white">
                  {product.name}
                </span>
              </div>
              <div className="-mr-px -mb-px grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {product.specs.map((s) => (
                  <div
                    key={s.l}
                    className="flex flex-col gap-1.5 border-r border-b border-line px-5 py-4"
                  >
                    <span className="font-mono text-label-xs leading-snug tracking-[.08em] uppercase text-muted">
                      {s.l}
                    </span>
                    <span className="text-meta font-semibold tracking-[-.005em] text-ink tabular-nums">
                      {s.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Features (only where the catalogue documents them) ── */}
      {features.length > 0 && (
        <section className="py-8 sm:py-10 lg:py-14 bg-white border-b border-line">
          <div className="qs-wrap-detail">
            {bandHead(t("featuresHeading"), t("catalogFeaturesHeading"), features.length)}

            {/* The band head already rules a line across the frame, so the rows
                below only carry their own bottom divider. */}
            <div>
              {anyFeaturePhoto
                ? features.map((f, i) => (
                    <article
                      key={f.title}
                      className="grid gap-x-8 gap-y-4 border-b border-line py-8 sm:py-10 lg:py-12 md:grid-cols-[3rem_minmax(0,1fr)]"
                    >
                      {featureIndex(i)}
                      <div
                        className={`grid gap-6 lg:gap-12 items-start ${
                          f.photo ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]" : ""
                        }`}
                      >
                        <div>
                          <h3 className="font-display font-bold text-subhead tracking-[-.02em] m-0">
                            {f.title}
                          </h3>
                          <p className="mt-3.5 m-0 text-body leading-[1.75] text-[#3a3a3a] max-w-[58ch]">
                            {f.body}
                          </p>
                        </div>
                        {f.photo && (
                          <figure
                            className="m-0 relative overflow-hidden border border-line p-4"
                            style={{
                              background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)",
                            }}
                          >
                            <Image
                              src={f.photo.src}
                              alt={f.photo.alt}
                              width={f.photo.w}
                              height={f.photo.h}
                              sizes="(max-width: 1024px) 90vw, 416px"
                              className="w-full h-auto object-contain"
                            />
                          </figure>
                        )}
                      </div>
                    </article>
                  ))
                : features.map((f, i) => (
                    <article
                      key={f.title}
                      className="grid items-start gap-x-8 gap-y-4 border-b border-line py-8 sm:py-10 md:grid-cols-[3rem_minmax(0,24rem)_minmax(0,1fr)]"
                    >
                      {featureIndex(i)}
                      <h3 className="font-display font-bold text-subhead tracking-[-.02em] m-0 text-balance">
                        {f.title}
                      </h3>
                      <p className="m-0 text-body leading-[1.75] text-[#3a3a3a] max-w-[68ch]">
                        {f.body}
                      </p>
                    </article>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Video (lazy YouTube facade — no embed weight until played) ── */}
      {product.video && (
        <section className="py-8 sm:py-10 lg:py-14 bg-paper border-b border-line">
          <div className="qs-wrap-detail">
            {bandHead(t("videoEyebrow"), t("videoHeading"))}

            {/* A 16:9 frame across the full 1680px frame would tower over the
                page, so the player keeps its original width, centred under the
                rule rather than hugging one edge of it. */}
            <div className="mx-auto max-w-[960px]">
              <ProductVideo
                youtubeId={product.video.youtubeId}
                title={product.video.title}
                playLabel={t("videoPlay")}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <ContactCta
        wrap="detail"
        heading={t("ctaHeading", { name: product.name })}
        body={t("catalogCtaBody")}
        ctaLabel={t("ctaBtn")}
      />
    </>
  );
}
