import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import CircuitTraces from "@/components/circuit-traces";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllDownloads, getDownloadGroups, groupByDocument, formatBytes } from "@/lib/data/downloads";
import type { DownloadFile } from "@/lib/data/downloads";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildTrail, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "downloads" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  const title = t("meta.title");
  const description = seo("downloadsDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/downloads", locale),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/downloads",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Downloads({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "downloads.index" });

  const groups = getDownloadGroups();
  const all = getAllDownloads();
  const modelCount = new Set(all.map((d) => d.productSlug).filter(Boolean)).size;

  // Compose the display title for a file from its language-neutral data.
  const titleOf = (d: DownloadFile): string => {
    if (d.titleKey) return t(`titles.${d.titleKey}`);
    if (d.category === "operation" || d.category === "installation") {
      return `${d.model} — ${t(`docType.${d.category}`)}`;
    }
    return d.model ?? "";
  };

  const stats = [
    { v: String(all.length), l: t("stats.docs") },
    { v: String(modelCount), l: t("stats.models") },
    { v: "VN / EN", l: t("stats.lang") },
  ];

  const nav = await getTranslations({ locale, namespace: "nav" });
  const breadcrumb = buildTrail(locale, nav("home"), [
    { name: nav("downloads"), path: "/downloads" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* HERO */}
      <section
        className="relative overflow-hidden border-b border-line"
        style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}
      >
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-50" aria-hidden="true"></div>
        {/* breathing gold atmosphere + brand PCB signature bleeding off the right */}
        <div className="qs-glow hidden sm:block right-[6%] top-[-30%] w-[34%] h-[150%]" aria-hidden="true"></div>
        <CircuitTraces
          variant="light"
          className="hidden lg:block absolute bottom-0 right-0 w-[40%] h-[86%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_bottom_right,#000_22%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_at_bottom_right,#000_22%,transparent_72%)]"
        />
        <div className="relative z-10 max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 pt-12 pb-16">
          <div className="qs-crumb mb-8">
            <Link href="/">{t("breadcrumb.home")}</Link>
            <span className="sep">/</span>
            <span className="here">{t("breadcrumb.current")}</span>
          </div>
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
            <div className="order-2 lg:order-none">
              <div className="qs-eyebrow qs-rise" style={{ animationDelay: "0ms" }}>{t("hero.eyebrow")}</div>
              <h1 className="qs-h1 mt-3.5">
                <span className="block overflow-hidden pb-[.06em]">
                  <span className="block qs-rise" style={{ animationDelay: "90ms" }}>{t("hero.heading1")}</span>
                </span>
                <span className="block overflow-hidden pb-[.06em]">
                  <span className="block qs-rise" style={{ animationDelay: "190ms" }}>
                    <em className="not-italic font-semibold qs-gold-shimmer">
                      {t("hero.headingEm")}
                    </em>
                  </span>
                </span>
              </h1>
              <p className="qs-lede mt-5 max-w-[52ch] qs-rise" style={{ animationDelay: "300ms" }}>{t("hero.lede")}</p>

              {/* stats */}
              <div className="mt-9 flex gap-10 qs-rise" style={{ animationDelay: "400ms" }}>
                {stats.map((s) => (
                  <div key={s.l}>
                    <div className="font-display text-h2 font-bold text-ink leading-none">{s.v}</div>
                    <div className="font-mono text-label-xs text-muted tracking-[.16em] uppercase mt-1.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* hero image */}
            <div className="order-1 lg:order-none qs-rise relative aspect-4/3 overflow-hidden" style={{ animationDelay: "260ms" }}>
              <Image
                src="/downloads/hero.webp"
                alt={t("hero.imageAlt")}
                fill
                priority
                sizes="(max-width:768px) 100vw, 45vw"
                className="qs-kenburns w-full h-full object-contain"
              />
              {/* gold blueprint scan sweeping the documents */}
              <div className="qs-scan" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY SECTIONS */}
      {groups.map((group, gi) => (
        <section
          key={group.category}
          className={gi % 2 === 0 ? "py-12 sm:py-16 bg-white" : "py-12 sm:py-16 bg-paper border-y border-line"}
        >
          <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
            <div className="qs-section-head">
              <div className="max-w-[62ch]">
                <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">
                  [ {t("count", { count: group.files.length })} ]
                </span>
                <h2 className="qs-h2 mt-2">{t(`sections.${group.category}.heading`)}</h2>
                <p className="text-meta text-muted leading-[1.7] mt-3 mb-0">
                  {t(`sections.${group.category}.desc`)}
                </p>
              </div>
            </div>

            {/* file table — language variants of the same document share one row */}
            <div className="border border-line bg-white">
              {/* header row (hidden on mobile) */}
              <div className="hidden md:grid grid-cols-[1fr_120px_minmax(220px,auto)] gap-4 px-5 py-3 bg-[#0e0e0c] text-[#cfc9b8] font-mono text-label-xs tracking-[.16em] uppercase">
                <span>{t("table.name")}</span>
                <span>{t("table.version")}</span>
                <span className="text-right">{t("table.download")}</span>
              </div>
              {groupByDocument(group.files).map((doc) => {
                const head = doc.variants[0];
                return (
                  <div
                    key={doc.key}
                    className="grid grid-cols-1 md:grid-cols-[1fr_120px_minmax(220px,auto)] gap-x-4 gap-y-3 items-center px-5 py-4 border-t border-line hover:bg-paper transition-colors"
                  >
                    {/* name */}
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-[52px] flex-shrink-0 border border-line grid place-items-center font-display font-extrabold text-label-xs tracking-[-.02em] bg-white text-ink">
                        {head.ext}
                      </span>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-semibold text-ink text-meta tracking-[-.005em]">
                          {titleOf(head)}
                        </span>
                        {head.productSlug && (
                          <Link
                            href={`/products/${head.productSlug}`}
                            className="font-mono text-label text-gold-1 tracking-[.06em] hover:underline w-fit"
                          >
                            {head.model} →
                          </Link>
                        )}
                      </div>
                    </div>
                    {/* version / date */}
                    <span className="font-mono text-label text-muted md:text-[#3a3a3a]">
                      {head.version ?? (head.date ? head.date.slice(0, 7).replace("-", "/") : "—")}
                    </span>
                    {/* download — one button per available language */}
                    <div className="flex gap-2 md:justify-end">
                      {doc.variants.map((v) => (
                        <a
                          key={v.slug}
                          href={v.fileUrl}
                          download
                          className="flex-1 md:flex-initial inline-flex flex-col items-center gap-0.5 whitespace-nowrap border border-ink bg-ink text-white px-4 py-2 hover:bg-gold-3 hover:border-gold-3 transition-colors"
                        >
                          <span className="font-mono text-label tracking-[.14em] uppercase">
                            {v.lang.toUpperCase()} ↓
                          </span>
                          <span className="font-mono text-label-xs tracking-[.06em] opacity-60">
                            {formatBytes(v.sizeBytes)}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* HELPERS */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white border-t border-line">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 grid md:grid-cols-2 gap-6">
          <div className="border border-line p-8 relative
                          before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
            <div className="font-mono text-label-xs text-gold-1 tracking-[.16em] uppercase">{t("plc.tag")}</div>
            <h3 className="font-display font-semibold text-subhead tracking-[-.01em] mt-2.5 mb-3">{t("plc.heading")}</h3>
            <p className="text-meta text-[#4a4842] leading-[1.7] m-0 mb-6">{t("plc.body")}</p>
            <Link className="qs-btn qs-btn-gold qs-btn-sm" href="/contact">{t("plc.register")}</Link>
          </div>
          <div className="border border-line p-8 relative
                          before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
            <div className="font-mono text-label-xs text-gold-1 tracking-[.16em] uppercase">{t("macro.tag")}</div>
            <h3 className="font-display font-semibold text-subhead tracking-[-.01em] mt-2.5 mb-3">{t("macro.heading")}</h3>
            <p className="text-meta text-[#4a4842] leading-[1.7] m-0 mb-6">{t("macro.body")}</p>
            <div className="flex gap-3">
              <Link className="qs-btn qs-btn-gold qs-btn-sm" href="/contact">{t("macro.request")}</Link>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/contact">{t("macro.contact")}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
