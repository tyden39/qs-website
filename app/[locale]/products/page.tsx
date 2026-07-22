import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { CONTROLLER_TYPES, getAllProducts } from "@/lib/data/products";
import { getMachines, MACHINE_TYPES } from "@/lib/data/machines";
import { getCatalogProducts } from "@/lib/data/catalog";
import { getSeries, getSeriesCount, SERIES_KINDS } from "@/lib/data/series";
import { GroupGrid, type ProductGroupTile } from "./_components/group-grid";
import CircuitTraces from "@/components/circuit-traces";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildTrail, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

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
    alternates: buildAlternates("/products", locale),
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
  const machines = getMachines(locale);
  const features = t.raw("features") as string[];
  const tiles = t.raw("tiles") as string[];
  // Split the hero title so the final word carries the animated gold sheen —
  // "QS Products" → gold "Products"; "Sản phẩm QS" → gold "QS".
  const headingWords = t("heading").trim().split(/\s+/);
  const headingGold = headingWords.pop() ?? "";
  const headingLead = headingWords.join(" ");
  // Each group card is illustrated by the first product in its group, so the
  // thumbnails follow the catalogue instead of hardcoding a path that can go
  // stale. Servo and inverters have no single lead product, so they point at
  // the SDV3 / S3100 series renders.
  const dncProducts = getCatalogProducts(locale, "dnc");
  const accessoryProducts = getCatalogProducts(locale, "accessory");
  const servo = getSeries(locale, "servo");
  // Each card names the sub-types actually stocked in its group, so the reader
  // knows what a group holds before opening it. Groups sold as one flat family
  // (inverters, DNC units, accessories) list none.
  const machineTypes = MACHINE_TYPES.filter((id) => machines.some((m) => m.type === id)).map((id) =>
    t(`types.machines.${id}`),
  );
  const controllerTypes = CONTROLLER_TYPES.filter((id) =>
    products.some((p) => p.type === id),
  ).map((id) => t(`types.controllers.${id}`));
  const servoKinds = SERIES_KINDS.filter((id) => servo.some((s) => s.kind === id)).map((id) =>
    t(`types.servo.${id}`),
  );
  const groups: ProductGroupTile[] = [
    {
      id: "machines",
      count: machines.length,
      thumb: machines[0].image,
      types: machineTypes,
    },
    {
      id: "controllers",
      // Card thumb reuses the controllers group hero render rather than the
      // first product image, matching GROUP_HERO.controllers.
      count: products.length,
      thumb: { src: "/img/products/products-hero-controllers.webp", w: 1400, h: 1408 },
      types: controllerTypes,
    },
    {
      id: "servo",
      count: getSeriesCount("servo"),
      thumb: { src: "/img/products/series/sdv3.webp", w: 300, h: 225 },
      types: servoKinds,
    },
    {
      id: "inverter",
      count: getSeriesCount("inverter"),
      thumb: { src: "/img/products/series/s3100.webp", w: 300, h: 225 },
      types: [],
    },
    { id: "dnc", count: dncProducts.length, thumb: dncProducts[0].image, types: [] },
    {
      id: "accessory",
      count: accessoryProducts.length,
      thumb: accessoryProducts[0].image,
      types: [],
    },
  ];
  const breadcrumb = buildTrail(locale, t("breadcrumb.home"), [
    { name: seo("productsTitle"), path: "/products" },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
        style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-50" aria-hidden="true"></div>
        {/* breathing gold atmosphere behind the product render */}
        <div className="qs-glow hidden sm:block right-[4%] top-[-30%] w-[38%] h-[150%]" aria-hidden="true"></div>
        {/* brand PCB signature peeking around the render, masked to a soft fade */}
        <CircuitTraces
          variant="light"
          className="hidden lg:block absolute top-0 right-0 w-[42%] h-full opacity-[.4] [mask-image:radial-gradient(ellipse_at_top_right,#000_22%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_right,#000_22%,transparent_70%)]"
        />
        <div className="relative z-10 max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 pt-10 pb-12 lg:pt-12 lg:pb-14">
          <div className="qs-crumb mb-8">
            <Link href="/">{t("breadcrumb.home")}</Link><span className="sep">/</span>
            <span className="here">{t("breadcrumb.current")}</span>
          </div>
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-none">
              <div className="qs-eyebrow qs-rise" style={{ animationDelay: "0ms" }}>{t("eyebrow")}</div>
              <h1 className="qs-h1 mt-3.5 qs-rise" style={{ animationDelay: "90ms" }}>
                {headingLead && <>{headingLead} </>}
                <em className="not-italic qs-gold-shimmer">{headingGold}</em>
              </h1>
              <p className="qs-lede mt-4 qs-rise" style={{ animationDelay: "190ms" }}>{t("lede")}</p>
              <div className="mt-7 flex flex-col gap-2.5 qs-rise" style={{ animationDelay: "290ms" }}>
                {features.map(f => (
                  <div key={f} className="flex items-center gap-3.5 text-meta
                                          before:content-[''] before:block before:w-6 before:h-px before:bg-gold">{f}</div>
                ))}
              </div>
            </div>
            {/* System-chain montage: machine → controller → drive. Each render sits
                on its own light tile so the frame reads as the whole product stack
                rather than a single controller. Assets are reused from the machine
                and controller catalogues — no bespoke hero art. */}
            <div className="order-1 lg:order-none relative aspect-16/10 bg-white border border-line p-4 sm:p-6 overflow-hidden">
              <div className="absolute inset-3 border border-dashed border-gold opacity-30 pointer-events-none"></div>
              <div className="relative h-full grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { src: "/img/machines/qsm215.webp", label: tiles[0] },
                  { src: "/img/products/astro-10i-front.webp", label: tiles[1] },
                  { src: "/img/products/components/servo-drive.webp", label: tiles[2] },
                ].map((tile, i) => (
                  <div
                    key={tile.src}
                    className={`flex flex-col ${i > 0 ? "border-l border-line/70" : ""}`}
                  >
                    <div
                      className="relative flex-1 min-h-0"
                      style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}
                    >
                      <Image
                        src={tile.src}
                        alt={`${tile.label} — ${seo("productsTitle")}`}
                        fill
                        priority={i === 1}
                        sizes="(max-width: 768px) 30vw, 210px"
                        className="object-contain p-2 sm:p-3"
                      />
                    </div>
                    <div className="pt-2 text-center font-mono text-label-xs tracking-[.16em] uppercase text-[#5a5650]">
                      <span className="text-line-2">{String(i + 1).padStart(2, "0")}</span> {tile.label}
                    </div>
                  </div>
                ))}
              </div>
              {/* gold blueprint scan sweeping the product renders — kept last so
                  it paints above the opaque product tiles instead of behind. */}
              <div className="qs-scan" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </section>

      {/* BODY — one card per catalogue group, each opening its own list page */}
      <section className="py-12 lg:py-16" id="list">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <GroupGrid locale={locale} groups={groups} />
        </div>
      </section>
    </>
  );
}
