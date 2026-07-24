import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Reveal from "@/components/reveal";
import CircuitTraces from "@/components/circuit-traces";
import CncFeatureVideo from "./_components/cnc-feature-video";
import { MachineCard } from "@/components/products/machine-card";
import { CategoryTreeHero, CategoryTreePanels, type CategoryTreeGroup, type CategoryTreeChild } from "../controller/_components/product-category-tree";
import { SortableCardList } from "../controller/_components/sortable-card-list";
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
  return {
    title,
    description,
    alternates: buildAlternates("/mechatronics", locale),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/mechatronics",
      images: [{ url: "/home/cnc-machine-hero.webp", width: 1672, height: 941, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// Static, non-translated fields (assets, numbers, routing) — localized text is
// merged in from the `cnc` namespace by position, mirroring the home page.
const MACHINE_IMG = { src: "/home/cnc-machine-hero.webp", w: 1672, h: 941 };
const VIDEO_ID = "kLcNpeHu-2A";

export default async function CncPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "cnc" });

  const machines = getMachines(locale);
  const pt = await getTranslations({ locale, namespace: "product.page" });
  const breadcrumb = buildTrail(locale, t("breadcrumb.home"), [
    { name: t("breadcrumb.current"), path: "/mechatronics" },
  ]);

  // Sidebar tree = machine types (CNC / Automation / Inspection); the CNC branch
  // (the only type with several categories) expands to its categories. Each
  // branch's right panel is a stacked card list with the shared count + sort
  // toolbar, matching the /controller catalogue.
  const catsOf = (ms: MachineView[]): MachineCategory[] => {
    const order: MachineCategory[] = [];
    for (const m of ms) if (!order.includes(m.category)) order.push(m.category);
    return order;
  };
  // Hero figure for the active machine type — a bare machine render that fills the
  // shared HERO_IMAGE_SLOT (standard size lives in the tree component).
  const machineFigure = (img: { src: string }, alt: string, priority = false) => (
    <Image src={img.src} alt={alt} fill priority={priority}
           sizes="(max-width:768px) 55vw, 300px" className="object-contain" />
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
        <div className="relative max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 py-12 lg:py-16">
          <nav className="qs-crumb mb-7 text-[#8f8878]">
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
          <Reveal eager>
            <CategoryTreeHero
              eyebrow={pt("groups.eyebrow")}
              allLabel={pt("types.all")}
              viewListLabel={t("machines.viewList")}
              tone="dark"
              groups={machineGroups}
            />
          </Reveal>
        </div>
      </section>

      {/* MACHINE LINE-UP — the active type's machines, full width below the hero */}
      <section id="list" className="relative py-12 sm:py-16 lg:py-24 bg-paper border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute top-0 right-0 w-[38%] h-[70%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_top_right,#000_24%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_right,#000_24%,transparent_70%)]" />
        <div className="relative max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <Reveal eager>
            <CategoryTreePanels groups={machineGroups} />
          </Reveal>
        </div>
      </section>

      {/* VIDEO — the machine cutting on camera */}
      <section className="relative bg-ink text-[#cfc9b8] py-12 sm:py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
        <CircuitTraces variant="dark" className="absolute inset-y-0 right-[-8%] w-[48%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_66%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_66%)]" />
        <div className="qs-glow" style={{ bottom: "-160px", left: "20%", width: "440px", height: "440px" }} aria-hidden="true"></div>
        <div className="relative max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-[#2a2620] mb-12">
              <div>
                <span className="font-mono text-label text-gold-2 tracking-[.16em] uppercase inline-flex items-center gap-2"><span className="qs-live-dot"></span>{t("video.eyebrow")}</span>
                <h2 className="qs-h2 text-white mt-3">{t("video.heading")}</h2>
                <p className="text-[#a8a499] text-body leading-[1.7] mt-4 max-w-[64ch] m-0">{t("video.body")}</p>
              </div>
              <a className="qs-btn bg-transparent text-white border border-[#4a453a] hover:bg-white/10 qs-btn-sm shrink-0" href="https://youtube.com/@qstechnology7516" target="_blank" rel="noopener noreferrer">{t("video.youtube")} <span className="arr">→</span></a>
            </div>
          </Reveal>
          <Reveal>
            <div className="max-w-[980px] mx-auto">
              <CncFeatureVideo youtubeId={VIDEO_ID} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA — closing consultation band */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-paper overflow-hidden">
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
