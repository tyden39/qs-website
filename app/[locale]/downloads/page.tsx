import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import CircuitTraces from "@/components/circuit-traces";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllDownloads, getDownloadGroups, groupByDocument, formatBytes } from "@/lib/data/downloads";
import type { DownloadDoc, DownloadFile } from "@/lib/data/downloads";
import { getSeries } from "@/lib/data/series";
import { DownloadsTree } from "./_components/downloads-tree";
import type { DlGroup, DlProduct, DlRow } from "./_components/downloads-tree";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildTrail, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

/** Doc-group order inside a drive product — mirrors the order the product
 *  detail page groups its documentation in. */
const DRIVE_DOC_ORDER = ["manual", "drawing", "software", "brochure", "certificate"] as const;

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
  const servo = getSeries(locale, "servo");
  const inverter = getSeries(locale, "inverter");

  // Compose the display title for a local controller/catalogue/software file.
  const titleOf = (d: DownloadFile): string => {
    if (d.titleKey) return t(`titles.${d.titleKey}`);
    if (d.category === "operation" || d.category === "installation") {
      return `${d.model} — ${t(`docType.${d.category}`)}`;
    }
    return d.model ?? "";
  };

  // A local file (public/downloads) collapses its language editions into one row.
  const localRow = (doc: DownloadDoc): DlRow => {
    const head = doc.variants[0];
    return {
      key: doc.key,
      title: titleOf(head),
      ext: head.ext,
      version: head.version ?? (head.date ? head.date.slice(0, 7).replace("-", "/") : "—"),
      productHref: head.productSlug ? `/controller/${head.productSlug}` : undefined,
      productLabel: head.productSlug ? head.model ?? undefined : undefined,
      variants: doc.variants.map((v) => ({
        lang: v.lang.toUpperCase(),
        url: v.fileUrl,
        sizeLabel: formatBytes(v.sizeBytes),
      })),
    };
  };
  const catFiles = (category: DownloadFile["category"]): DownloadFile[] =>
    groups.find((g) => g.category === category)?.files ?? [];
  const localRows = (category: DownloadFile["category"]): DlRow[] =>
    groupByDocument(catFiles(category)).map(localRow);

  // Controllers: one product per model → doc groups (operation, installation),
  // each group's manuals collapsed across languages.
  const controllerProducts = (): DlProduct[] => {
    const files = [...catFiles("operation"), ...catFiles("installation")];
    const order: string[] = [];
    const byModel = new Map<string, DownloadFile[]>();
    for (const f of files) {
      const id = f.productSlug ?? f.model ?? f.slug;
      if (!byModel.has(id)) {
        byModel.set(id, []);
        order.push(id);
      }
      byModel.get(id)!.push(f);
    }
    return order.map((id) => {
      const list = byModel.get(id)!;
      const groups = (["operation", "installation"] as const)
        .map((cat) => ({
          id: cat,
          label: t(`docGroup.${cat}`),
          rows: groupByDocument(list.filter((f) => f.category === cat)).map(localRow),
        }))
        .filter((dg) => dg.rows.length > 0);
      return { id, label: list[0].model ?? id, groups };
    });
  };

  // Drive (servo/inverter) families: one product per series → doc groups
  // (manual, drawing, software, brochure, certificate) pulled from the series
  // data. Documents are external source PDFs, also shown on the detail page.
  const driveProducts = (list: typeof servo): DlProduct[] =>
    list
      .map((s) => {
        const docs = s.detail?.documentation ?? [];
        const groups = DRIVE_DOC_ORDER.map((cat) => ({
          id: cat,
          label: t(`docGroup.${cat}`),
          rows: docs
            .filter((d) => d.category === cat)
            .map((d, i) => ({
              key: `${s.slug}-${cat}-${i}`,
              title: d.title,
              ext: d.format.toUpperCase(),
              version: "—",
              productHref: `/controller/${s.slug}`,
              productLabel: s.name,
              variants: [
                {
                  lang: d.lang.toUpperCase(),
                  url: d.url,
                  sizeLabel: d.size_mb ? `${d.size_mb} MB` : "—",
                  external: true,
                },
              ],
            })),
        })).filter((dg) => dg.rows.length > 0);
        return { id: s.slug, label: s.name, groups };
      })
      .filter((p) => p.groups.length > 0);

  const driveDocCount = (list: typeof servo) =>
    list.reduce((n, s) => n + (s.detail?.documentation?.length ?? 0), 0);

  const family = (id: string, extra: Partial<DlGroup>): DlGroup => ({
    id,
    label: t(`families.${id}.label`),
    heading: t(`families.${id}.heading`),
    desc: t(`families.${id}.desc`),
    ...extra,
  });

  const tree: DlGroup[] = [
    family("catalogue", { rows: localRows("catalogue") }),
    family("controllers", { products: controllerProducts() }),
    family("servo", { products: driveProducts(servo) }),
    family("inverter", { products: driveProducts(inverter) }),
    family("software", { rows: localRows("software") }),
  ].filter((g) => (g.products ? g.products.length > 0 : (g.rows?.length ?? 0) > 0));

  const totalDocs = all.length + driveDocCount(servo) + driveDocCount(inverter);
  const modelCount =
    new Set(all.map((d) => d.productSlug).filter(Boolean)).size + servo.length + inverter.length;

  const stats = [
    { v: String(totalDocs), l: t("stats.docs") },
    { v: String(modelCount), l: t("stats.models") },
    { v: "VN / EN / ZH", l: t("stats.lang") },
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

      {/* LIBRARY TREE */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <DownloadsTree
            groups={tree}
            eyebrow={t("tree.eyebrow")}
            allLabel={t("tree.all")}
            headers={{ name: t("table.name"), version: t("table.version"), download: t("table.download") }}
            support={{ title: t("tree.support"), cta: t("tree.supportCta") }}
          />
        </div>
      </section>

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
