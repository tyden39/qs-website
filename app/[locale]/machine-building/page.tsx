import type { Metadata } from "next";
import Image from "@/components/media/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Reveal from "@/components/reveal";
import CircuitTraces from "@/components/circuit-traces";
import { MachineCard } from "@/components/products/machine-card";
import { CategoryHeroFigure, CategoryTreeHero, CategoryTreePanels, HERO_FIGURE_SIZES, type CategoryTreeGroup, type CategoryTreeChild } from "../electronics/_components/product-category-tree";
import { SortableCardList } from "../electronics/_components/sortable-card-list";
import { FilterPrePaint } from "@/lib/filter-prepaint";
import { FilterPrePaintCleanup } from "@/lib/use-filter-params";
import { getMachines, MACHINE_TYPES, type MachineView, type MachineCategory } from "@/lib/data/machines";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildTrail, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cnc" });
  const title = t("seo.title");
  const description = t("seo.description");
  const alternates = buildAlternates("/machine-building", locale);
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: alternates.canonical,
      images: [{ url: "/home/cnc-machine-hero.webp", width: 1672, height: 941, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// Static, non-translated fields (assets, numbers, routing) — localized text is
// merged in from the `cnc` namespace by position, mirroring the home page.
const MACHINE_IMG = { src: "/home/cnc-machine-hero.webp", w: 1672, h: 941 };

export default async function CncPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "cnc" });

  const machines = getMachines(locale);
  const pt = await getTranslations({ locale, namespace: "product.page" });
  const breadcrumb = buildTrail(locale, t("breadcrumb.home"), [
    { name: t("breadcrumb.current"), path: "/machine-building" },
  ]);

  // Sidebar tree = machine types (CNC / Automation / Inspection); the CNC branch
  // (the only type with several categories) expands to its categories. Each
  // branch's right panel is a stacked card list with the shared count + sort
  // toolbar, matching the /electronics catalogue.
  const catsOf = (ms: MachineView[]): MachineCategory[] => {
    const order: MachineCategory[] = [];
    for (const m of ms) if (!order.includes(m.category)) order.push(m.category);
    return order;
  };
  // Hero figure for the active machine type — a bare machine render that fills the
  // shared HERO_IMAGE_SLOT (standard size lives in the tree component).
  const machineFigure = (img: { src: string }, alt: string, priority = false) => (
    // Keyed: the figure crosses the RSC boundary and is reconciled from a lazy
    // reference inside the tree's group list, which React reads as an array child.
    <Image key={img.src} src={img.src} alt={alt} fill priority={priority}
           sizes={HERO_FIGURE_SIZES} className="object-contain" />
  );
  const machineGroups: CategoryTreeGroup[] = MACHINE_TYPES.map((ty) => ({
    ty,
    ms: machines.filter((m) => m.type === ty),
  }))
    .filter((g) => g.ms.length > 0)
    .map(({ ty, ms }, gi) => {
      const cats = catsOf(ms);
      const children: CategoryTreeChild[] | undefined =
        cats.length > 1
          ? cats.map((cat) => ({
              id: cat,
              icon: cat,
              label: t(`machines.categories.${cat}`),
              count: ms.filter((m) => m.category === cat).length,
            }))
          : undefined;
      // The CNC branch leads with the polished machine-hall render; the other
      // types use their first machine's thumbnail.
      const heroImg = ty === "cnc" ? MACHINE_IMG : ms[0].thumbnail;
      return {
        id: ty,
        label: t(`machines.types.${ty}`),
        // Only the trailing word gilds; the gold tail is defined per type/locale
        // where it differs from the whole title (else the whole title gilds).
        labelGold: t.has(`machines.typesGold.${ty}`)
          ? t(`machines.typesGold.${ty}`)
          : undefined,
        count: ms.length,
        thumb: ms[0].thumbnail,
        blurb: t(`machines.typeBlurb.${ty}`),
        heroImage: machineFigure(heroImg, t(`machines.types.${ty}`), gi === 0),
        children,
        node: (
          <SortableCardList
            items={ms.map((m, i) => ({
              key: m.slug,
              name: m.model,
              subtype: m.category,
              node: <MachineCard machine={m} index={i} total={ms.length} />,
            }))}
            sortOptions={pt.raw("toolbar.sortBasic") as string[]}
            showing={pt("toolbar.showing")}
            unit={pt("toolbar.ofMachines")}
            sortLabel={pt("toolbar.sortLabel")}
          />
        ),
      };
    });

  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* HERO — dark machine hall: sidebar tree + the active type's intro/figure */}
      <section className="relative bg-ink text-[#cfc9b8] overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
        <CircuitTraces variant="dark" className="absolute inset-y-0 left-[-8%] w-[46%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_left,#000_20%,transparent_66%)] [-webkit-mask-image:radial-gradient(ellipse_at_left,#000_20%,transparent_66%)]" />
        <div className="qs-glow" style={{ top: "-140px", right: "18%", width: "420px", height: "420px" }} aria-hidden="true"></div>
        <div className="relative z-10 max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 py-12 lg:py-16">
          <nav className="qs-crumb qs-crumb-dark mb-7 text-[#8f8878]">
            <Link href="/">{t("breadcrumb.home")}</Link><span className="sep">/</span>
            <span className="here text-[#eee9d7]">{t("breadcrumb.current")}</span>
          </nav>
          {/* Applies the URL filter (machine type / sub-category) before paint,
              so a shared machine link doesn't flash the default group first.
              The first machine type is the no-param default. Rendered before the
              tagged intro/list panels so its style is in place as they parse. */}
          <FilterPrePaint
            keys={[
              { key: "g", def: machineGroups[0]?.id, unhide: true },
              { key: "t" },
            ]}
          />
          <Reveal>
            <CategoryTreeHero
              eyebrow={pt("groups.eyebrow")}
              allLabel={pt("types.all")}
              viewListLabel={t("machines.viewList")}
              tone="dark"
              groups={machineGroups}
            />
          </Reveal>
        </div>
        {/* The active type's machine render, bleeding off the right edge of the
            hero. Sits after the wrapper so the pre-paint primer above still
            governs it, and under the wrapper's z-10 so the copy stays on top. */}
        <CategoryHeroFigure groups={machineGroups} tone="dark" />
      </section>

      {/* MACHINE LINE-UP — the active type's machines, full width below the hero */}
      <section id="list" className="relative py-8 sm:py-10 lg:py-14 bg-paper border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute top-0 right-0 w-[38%] h-[70%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_top_right,#000_24%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_right,#000_24%,transparent_70%)]" />
        <div className="relative max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <Reveal>
            <CategoryTreePanels groups={machineGroups} />
          </Reveal>
        </div>
      </section>

      {/* CTA — closing consultation band. Extra bottom padding balances the band
          against the section padding above it now that the footer sits flush. */}
      <section className="relative py-8 sm:py-10 lg:py-14 mb-8 sm:mb-10 lg:mb-14 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute top-0 left-0 w-[36%] h-[70%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_top_left,#000_24%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_left,#000_24%,transparent_70%)]" />
        <div className="relative mx-auto px-5 sm:px-8 lg:px-12 max-w-[880px] text-center">
          <Reveal>
            <h2 className="qs-h2">{t("cta.heading")}</h2>
            <p className="qs-lede mx-auto mt-5">{t("cta.body")}</p>
            <div className="flex flex-wrap justify-center gap-3 mt-9">
              <Link className="qs-btn qs-btn-gold" href="/contact">{t("cta.button")} <span className="arr">→</span></Link>
            </div>
          </Reveal>
        </div>
      </section>
      <FilterPrePaintCleanup />
    </>
  );
}
