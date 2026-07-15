import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Reveal from "@/components/reveal";
import CircuitTraces from "@/components/circuit-traces";
import {
  Box,
  Gauge,
  Zap,
  Ruler,
  Cpu,
  Wrench,
  Weight,
  Layers,
  Plug,
  Crosshair,
  Move3d,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { getMachineBySlug, getMachineSlugs } from "@/lib/data/machines";
import LineMachineDetail from "../_components/line-machine-detail";
import { routing } from "@/lib/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import type { Locale } from "@/lib/i18n/config";

/** Spec keys promoted to the hero stat strip (in order). */
const HERO_SPEC_KEYS = ["axes", "spindleSpeed", "spindlePower", "machineTravel"];

/**
 * Icon per spec key — mirrors the icon spec-badges on the QSM-125 datasheet.
 * Falls back to a generic gear for any unmapped key.
 */
const SPEC_ICON: Record<string, LucideIcon> = {
  axes: Box,
  spindleSpeed: Gauge,
  spindlePower: Zap,
  machineTravel: Ruler,
  machineSize: Move3d,
  controller: Cpu,
  toolMagazine: Wrench,
  toolHead: Wrench,
  weight: Weight,
  tableLoad: Layers,
  powerSupply: Plug,
  positioning: Crosshair,
  repeatability: Crosshair,
  resolution: Crosshair,
  // Automation / inspection lines
  throughput: Gauge,
  conveyorSpeed: Gauge,
  productTypes: Layers,
  power: Zap,
  capacity: Weight,
  tolerance: Crosshair,
};
const specIcon = (k: string): LucideIcon => SPEC_ICON[k] ?? Settings;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const m = getMachineBySlug(slug, locale);
  if (!m) return {};
  const t = await getTranslations({ locale, namespace: "cnc" });
  const title = `${m.model} — ${t(`machines.categories.${m.category}`)}`;
  return {
    title,
    description: m.tagline,
    alternates: buildAlternates(`/cnc/${slug}`),
    openGraph: {
      title,
      description: m.tagline,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: `/cnc/${slug}`,
      images: [{ url: m.image.src, width: m.image.w, height: m.image.h, alt: m.model }],
    },
    twitter: { card: "summary_large_image", title, description: m.tagline },
  };
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getMachineSlugs().map((slug) => ({ locale, slug })),
  );
}

export default async function MachineDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const machine = getMachineBySlug(slug, locale);
  if (!machine) notFound();

  // Line-integrated machines (bottle rotator, checkweigher…) ship process-flow
  // data and render the light "line station" template instead of the dark CNC
  // datasheet layout below.
  if (machine.line.length > 0) {
    return <LineMachineDetail machine={machine} locale={locale} />;
  }

  const t = await getTranslations({ locale, namespace: "cnc" });

  const label = (k: string) => t(`machines.labels.${k}`);
  // Promote the CNC hero specs when present; automation/inspection machines that
  // carry none of those keys fall back to their own leading spec rows.
  const cncHeroSpecs = HERO_SPEC_KEYS.map((k) => machine.specs.find((s) => s.k === k)).filter(
    (s): s is NonNullable<typeof s> => Boolean(s),
  );
  const heroSpecs = cncHeroSpecs.length > 0 ? cncHeroSpecs : machine.specs.slice(0, 4);

  // Feature grid columns follow the item count (max 4) so the row fills
  // without leaving empty cells. Static classes keep Tailwind's JIT happy.
  const featureCols =
    [
      "",
      "sm:grid-cols-1 lg:grid-cols-1",
      "sm:grid-cols-2 lg:grid-cols-2",
      "sm:grid-cols-2 lg:grid-cols-3",
      "sm:grid-cols-2 lg:grid-cols-4",
    ][Math.min(machine.features.length, 4)] ?? "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <>
      {/* HERO — dark machine hall: model, controller, key specs + machine figure */}
      <section className="relative bg-ink text-[#cfc9b8] overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
        <CircuitTraces variant="dark" className="absolute inset-y-0 left-[-8%] w-[46%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_left,#000_20%,transparent_66%)] [-webkit-mask-image:radial-gradient(ellipse_at_left,#000_20%,transparent_66%)]" />
        <div className="qs-glow" style={{ top: "-140px", right: "18%", width: "420px", height: "420px" }} aria-hidden="true"></div>
        <div className="relative qs-wrap-wide py-14 lg:py-20">
          <Reveal>
            <nav className="qs-crumb text-[#7d7a70]">
              <Link href="/cnc" className="hover:text-white">{t("machines.detail.crumb")}</Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span className="text-[#a8a499]">{machine.model}</span>
            </nav>
          </Reveal>
          <div className="mt-8 grid lg:grid-cols-[minmax(360px,1fr)_1.15fr] gap-12 lg:gap-16 items-center">
            <Reveal>
              <span className="inline-block font-mono text-[11px] tracking-[.2em] uppercase text-ink bg-gold px-2.5 py-1">
                {t(`machines.categories.${machine.category}`)}
              </span>
              <h1 className="qs-h1 text-white mt-4">{machine.model}</h1>
              <p className="text-[#a8a499] text-base leading-[1.7] mt-5 max-w-[52ch]">{machine.tagline}</p>

              <dl className="mt-9 grid grid-cols-2 gap-px bg-[#2a2620] border border-[#2a2620]">
                {heroSpecs.map((s) => {
                  const Icon = specIcon(s.k);
                  return (
                    <div key={s.k} className="bg-ink px-4 py-3.5">
                      <dt className="flex items-center gap-1.5 font-mono text-[10px] tracking-[.14em] uppercase text-gold-2 m-0">
                        <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                        {label(s.k)}
                      </dt>
                      <dd className="font-display font-semibold text-white text-[17px] mt-1.5 m-0 tracking-[-.01em]">{s.v}</dd>
                    </div>
                  );
                })}
              </dl>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative border border-[#2a2620] bg-white/[.02] overflow-hidden">
                <div className="relative h-[380px] sm:h-[460px] lg:h-[560px] w-full overflow-hidden">
                  {/* blueprint grid + ambient gold bloom behind the machine */}
                  <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.12]" aria-hidden="true"></div>
                  <div className="qs-breathe pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 58% at 50% 54%, rgba(232,200,120,.22), transparent 70%)" }} aria-hidden="true"></div>
                  {/* perpetual scan beam reading the machine */}
                  <div className="pointer-events-none absolute inset-x-8 top-0 h-[2px] qs-scan" aria-hidden="true"></div>
                  {/* machine levitates on a slow loop */}
                  <div className="qs-float absolute inset-0">
                    <Image
                      src={machine.image.src}
                      alt={machine.model}
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-contain p-6 lg:p-10 [filter:drop-shadow(0_18px_26px_rgba(0,0,0,.5))]"
                      priority
                    />
                  </div>
                  {/* corner registration ticks */}
                  <div className="pointer-events-none absolute inset-3" aria-hidden="true">
                    <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-gold-2/50"></span>
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-gold-2/50"></span>
                    <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-gold-2/50"></span>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-gold-2/50"></span>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-[#2a2620] flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-[.16em] uppercase text-[#7d7a70]">{machine.model}</span>
                  <span className="font-mono text-[11px] tracking-[.16em] uppercase text-gold-2">
                    {machine.axes > 0
                      ? `${machine.axes} ${t("machines.axesUnit")}`
                      : t(`machines.categories.${machine.category}`)}
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FEATURES — datasheet callout boxes */}
      <section className="relative py-24 bg-paper border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="pb-7 border-b border-line mb-12 max-w-[70ch]">
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2"><span className="qs-live-dot"></span>{t("machines.detail.featuresHeading")}</span>
            </div>
          </Reveal>
          <div className={`grid grid-cols-1 ${featureCols} gap-px bg-line border border-line`}>
            {machine.features.map((f, i) => {
              const idx = String(i + 1).padStart(2, "0");
              return (
                <Reveal key={f.title} delay={i * 80}>
                  <div className="group bg-white h-full flex flex-col">
                    {/* datasheet detail crop — or a blueprint plate when the feature ships no photo */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-paper-2/60">
                      <div className="absolute inset-0 qs-grid-bg opacity-50" aria-hidden="true"></div>
                      {f.img ? (
                        <Image
                          src={f.img}
                          alt={`${machine.model} — ${f.title}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="relative object-cover [filter:saturate(.96)_contrast(1.03)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center font-mono font-semibold text-[68px] leading-none text-ink/[.06] select-none" aria-hidden="true">{idx}</span>
                      )}
                      <span className="absolute top-3 left-3 z-10 font-mono text-[11px] tracking-[.14em] text-ink bg-gold px-2 py-0.5">{idx}</span>
                      {/* corner registration ticks — reads the crop like the hero's scan */}
                      <div className="pointer-events-none absolute inset-2.5 z-10" aria-hidden="true">
                        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/60"></span>
                        <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/60"></span>
                        <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/60"></span>
                        <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/60"></span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1 border-t border-line">
                      <h3 className="font-display font-bold text-ink text-[18px] tracking-[-.01em]">{f.title}</h3>
                      <p className="text-[14px] leading-[1.65] text-muted mt-2.5 m-0">{f.desc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* SPECS — full datasheet table + controller card */}
      <section className="relative bg-ink text-[#cfc9b8] py-24 overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
        <CircuitTraces variant="dark" className="absolute inset-y-0 right-[-8%] w-[48%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_66%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_66%)]" />
        <div className={`relative qs-wrap-wide grid gap-12 lg:gap-16 items-start ${machine.controller ? "lg:grid-cols-[1.2fr_.8fr]" : ""}`}>
          <Reveal>
            <div className="pb-7 border-b border-[#2a2620] mb-8">
              <span className="font-mono text-[11px] text-gold-2 tracking-[.16em] uppercase inline-flex items-center gap-2"><span className="qs-live-dot"></span>{t("machines.detail.specsHeading")}</span>
              <h2 className="qs-h2 text-white mt-3">{machine.model}</h2>
            </div>
            <dl className="m-0">
              {machine.specs.map((s) => (
                <div key={s.k} className="flex items-baseline justify-between gap-6 py-3.5 border-b border-[#2a2620]">
                  <dt className="text-[14px] text-[#a8a499] m-0">{label(s.k)}</dt>
                  <dd className="font-mono text-[14px] text-white text-right m-0">{s.v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-[12px] leading-[1.6] text-[#7d7a70] mt-5 m-0">{t("machines.detail.specsNote")}</p>
          </Reveal>

          {machine.controller && (
            <Reveal delay={120}>
              <div className="border border-[#2a2620] bg-white/[.02] p-7 lg:sticky lg:top-24">
                <span className="font-mono text-[11px] text-gold-2 tracking-[.16em] uppercase">{t("machines.detail.controllerHeading")}</span>
                <p className="font-display font-bold text-white text-[22px] tracking-[-.02em] mt-4">{machine.controller}</p>
                <p className="text-[14px] leading-[1.7] text-[#a8a499] mt-4 m-0">
                  {t("machines.detail.controllerBody", { controller: machine.controller })}
                </p>
                {machine.controllerSlug && (
                  <Link className="qs-btn bg-transparent text-white border border-[#4a453a] hover:bg-white/10 qs-btn-sm mt-6" href={`/products/${machine.controllerSlug}`}>
                    {t("machines.detail.controllerLink")} <span className="arr">→</span>
                  </Link>
                )}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* CTA — closing consultation band */}
      <section className="relative py-24 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute top-0 left-0 w-[36%] h-[70%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_top_left,#000_24%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_left,#000_24%,transparent_70%)]" />
        <div className="relative qs-wrap-wide max-w-[880px] text-center">
          <Reveal>
            <h2 className="qs-h2">{t("machines.detail.ctaHeading")}</h2>
            <p className="qs-lede mx-auto mt-5">{t("machines.detail.ctaBody")}</p>
            <div className="flex flex-wrap justify-center gap-3 mt-9">
              <Link className="qs-btn qs-btn-gold" href="/contact">{t("machines.detail.ctaButton")} <span className="arr">→</span></Link>
              <Link className="qs-btn qs-btn-ghost" href="/cnc">{t("machines.detail.backToList")}</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
