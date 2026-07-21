import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
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
  Activity,
  Target,
  GraduationCap,
  FlaskConical,
  Component,
  Gem,
  PenTool,
  Frame,
  Download,
  FileText,
  Check,
  PhoneCall,
  type LucideIcon,
} from "lucide-react";
import type { MachineView } from "@/lib/data/machines";
import {
  groupSpecs,
  parseTravel,
  specValue,
  splitSpecValue,
  PERFORMANCE_KEYS,
  WORKSPACE_KEYS,
} from "@/lib/data/machine-datasheet";
import { getProductBySlug } from "@/lib/data/products";
import { getAllDownloads, getProductDownloads } from "@/lib/data/downloads";
import { LightboxTrigger, type LightboxShot } from "@/components/media/image-lightbox";
import { MachineHeroGallery } from "./machine-hero-gallery";
import type { Locale } from "@/lib/i18n/config";

/**
 * Editorial datasheet template for the CNC machines (milling, router, jewelry).
 * Every machine renders the same nine sections regardless of how complete its
 * data is: sections the catalogue cannot fill yet — machining-capability photos,
 * standard/optional equipment — show an "updating" placeholder in place of the
 * content rather than collapsing, so the page shape stays comparable across
 * models and the gaps are visible.
 *
 * Sections derive from the machine's own spec rows wherever possible (see
 * `lib/data/machine-datasheet`); the controller card and downloads read the
 * products and downloads catalogues so nothing is duplicated as machine copy.
 * Line-integrated machines use `line-machine-detail` instead.
 */

/** Spec keys promoted to the hero stat strip (in order). */
const HERO_SPEC_KEYS = ["axes", "spindleSpeed", "spindlePower", "machineTravel"];

/** Icon per spec key; unmapped keys fall back to a generic gear. */
const SPEC_ICON: Record<string, LucideIcon> = {
  axes: Box,
  spindleSpeed: Gauge,
  spindlePower: Zap,
  machinePower: Zap,
  vacuumPump: Zap,
  machineTravel: Move3d,
  machineSize: Ruler,
  controller: Cpu,
  toolMagazine: Wrench,
  toolHead: Wrench,
  collet: Wrench,
  toolCapacity: Wrench,
  weight: Weight,
  tableLoad: Layers,
  tableSize: Layers,
  spindleNose: Ruler,
  powerSupply: Plug,
  airPressure: Plug,
  positioning: Crosshair,
  repeatability: Crosshair,
  resolution: Crosshair,
  rapidSpeed: Activity,
  rapidSpeedZ: Activity,
  feedSpeed: Activity,
  transmission: Move3d,
  rotaryAxis: Move3d,
  axisServo: Settings,
  lubrication: Settings,
  frameMaterial: Box,
  materials: Layers,
  spindleTaper: Wrench,
  chipRemoval: Settings,
  coolant: Settings,
  atc: Wrench,
};
const specIcon = (k: string): LucideIcon => SPEC_ICON[k] ?? Settings;

/** Icon per spec-table group id. */
const GROUP_ICON: Record<string, LucideIcon> = {
  capacity: Box,
  spindle: Gauge,
  feed: Move3d,
  accuracy: Crosshair,
  machine: Weight,
  cnc: Cpu,
  other: Settings,
};

/** Icon per use-case `icon` key authored in `data/machines.ts`. */
const USE_CASE_ICON: Record<string, LucideIcon> = {
  precision: Target,
  components: Component,
  prototype: FlaskConical,
  training: GraduationCap,
  mold: Layers,
  jewelry: Gem,
  engraving: PenTool,
  complex3d: Move3d,
  largePart: Frame,
};

/** Feature grid columns follow the item count (max 4) so the row fills without
 *  empty cells. Static classes keep Tailwind's JIT happy. */
const GRID_COLS = [
  "",
  "sm:grid-cols-1 lg:grid-cols-1",
  "sm:grid-cols-2 lg:grid-cols-2",
  "sm:grid-cols-2 lg:grid-cols-3",
  "sm:grid-cols-2 lg:grid-cols-4",
];
const gridCols = (n: number) => GRID_COLS[Math.min(n, 4)] ?? GRID_COLS[4];

/** Section heading with the shared live-dot rule. */
function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-4 border-b border-line mb-7 max-w-[70ch]">
      <h2 className="qs-panel-title">
        <span className="qs-live-dot" />
        {children}
      </h2>
    </div>
  );
}

/** Stands in for a whole section whose content the catalogue can't fill yet. */
function PlaceholderPanel({ label }: { label: string }) {
  return (
    <div className="relative border border-line bg-white overflow-hidden">
      <div className="absolute inset-0 qs-grid-bg opacity-50" aria-hidden="true" />
      <p className="relative font-mono text-label tracking-[.16em] uppercase text-muted text-center px-6 py-14 m-0">
        {label}
      </p>
    </div>
  );
}

export default async function MachineDatasheet({
  machine,
  locale,
}: {
  machine: MachineView;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "cnc" });
  const label = (k: string) => t(`machines.labels.${k}`);
  const d = (k: string, v?: Record<string, string>) => t(`machines.detail.${k}`, v);
  const tbd = d("tbd");

  const category = t(`machines.categories.${machine.category}`);

  // Hero promotes the CNC spec keys when present, else the leading spec rows.
  const cncHeroSpecs = HERO_SPEC_KEYS.map((k) => machine.specs.find((s) => s.k === k)).filter(
    (s): s is NonNullable<typeof s> => Boolean(s),
  );
  const heroSpecs = cncHeroSpecs.length > 0 ? cncHeroSpecs : machine.specs.slice(0, 4);

  const heroGalleryShots = machine.heroShots.map((s) => ({
    src: s.src,
    thumbnailSrc: s.src === machine.image.src ? machine.thumbnail.src : undefined,
    w: s.w,
    h: s.h,
    alt: `${machine.model} — ${t(`machines.detail.shots.${s.kind}`)}`,
  }));
  const heroFooterRight = machine.axes > 0 ? `${machine.axes} ${t("machines.axesUnit")}` : category;

  // Photos on this page are illustrations, not links, so each grid gets its own
  // zoomable group and prev/next cycles only within that grid. Feature and
  // capability shots carry no intrinsic dimensions — the lightbox fill-boxes them.
  const zoomLabel = d("galleryZoom");
  const heroFallbackShots: LightboxShot[] = [
    { src: machine.image.src, w: machine.image.w, h: machine.image.h, alt: machine.model },
  ];
  const featureShots: LightboxShot[] = machine.features
    .filter((f) => f.img)
    .map((f) => ({ src: f.img as string, alt: `${machine.model} — ${f.title}` }));
  let featureSeen = 0;
  const featureShotIndex = machine.features.map((f) => (f.img ? featureSeen++ : -1));
  const capabilityShots: LightboxShot[] = machine.capabilities
    .filter((c) => c.img)
    .map((c) => ({ src: c.img as string, alt: c.caption }));
  let capabilitySeen = 0;
  const capabilityShotIndex = machine.capabilities.map((c) => (c.img ? capabilitySeen++ : -1));

  const travel = parseTravel(specValue(machine.specs, "machineTravel"));
  const specGroups = groupSpecs(machine.specs);

  // The controller card and its capability tags come from the products
  // catalogue, so controller copy lives in exactly one place.
  const controller = machine.controllerSlug ? getProductBySlug(machine.controllerSlug, locale) : null;

  // Downloads: the real catalogue PDF for this locale, the controller's own
  // manual, and a placeholder card for the machine datasheet we don't host yet.
  const catalogue =
    getAllDownloads().find((f) => f.category === "catalogue" && f.lang === locale) ??
    getAllDownloads().find((f) => f.category === "catalogue") ??
    null;
  const controllerDoc = machine.controllerSlug
    ? getProductDownloads(machine.controllerSlug).find(
        (f) => f.category === "operation" || f.category === "installation",
      ) ?? null
    : null;

  return (
    <>
      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}
      >
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-50" aria-hidden="true" />
        <div className="qs-glow hidden sm:block right-[6%] top-[-30%] w-[34%] h-[150%]" aria-hidden="true" />
        <CircuitTraces
          variant="light"
          className="hidden lg:block absolute bottom-0 right-0 w-[40%] h-[86%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_bottom_right,#000_22%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_at_bottom_right,#000_22%,transparent_72%)]"
        />
        <div className="relative z-10 qs-wrap-wide py-12 lg:py-16">
          <nav className="qs-crumb mb-6">
            <Link href="/cnc">{d("crumb")}</Link>
            <span className="sep">/</span>
            <span className="here">{machine.model}</span>
          </nav>
          <div className="grid md:grid-cols-2 lg:grid-cols-[minmax(360px,1fr)_1.15fr] gap-10 lg:gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="qs-eyebrow qs-rise" style={{ animationDelay: "0ms" }}>
                {category}
              </div>
              <h1 className="qs-h1 mt-3.5 qs-rise" style={{ animationDelay: "90ms" }}>
                <em className="not-italic font-semibold qs-gold-shimmer">{machine.model}</em>
              </h1>
              {machine.subtitle && (
                <p
                  className="font-display font-semibold text-ink text-title mt-2 qs-rise"
                  style={{ animationDelay: "170ms" }}
                >
                  {machine.subtitle}
                </p>
              )}
              <p className="qs-lede mt-5 max-w-[52ch] qs-rise" style={{ animationDelay: "260ms" }}>
                {machine.tagline}
              </p>

              <dl
                className="mt-9 grid grid-cols-2 gap-px bg-line border border-line qs-rise"
                style={{ animationDelay: "380ms" }}
              >
                {heroSpecs.map((s) => {
                  const Icon = specIcon(s.k);
                  return (
                    <div key={s.k} className="bg-white px-4 py-3.5">
                      <dt className="flex items-center gap-1.5 font-mono text-label-xs tracking-[.14em] uppercase text-gold-1 m-0">
                        <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                        {label(s.k)}
                      </dt>
                      <dd className="font-display font-semibold text-ink text-lede mt-1.5 m-0 tracking-[-.01em]">
                        {s.v}
                      </dd>
                    </div>
                  );
                })}
              </dl>

              <div className="flex flex-wrap gap-3 mt-8 qs-rise" style={{ animationDelay: "480ms" }}>
                <Link className="qs-btn qs-btn-gold" href="/contact">
                  {d("heroQuote")} <span className="arr">→</span>
                </Link>
                <Link className="qs-btn qs-btn-ghost inline-flex items-center gap-2" href="/downloads">
                  <Download className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" /> {d("heroBrochure")}
                </Link>
              </div>
            </div>

            <div className="order-1 qs-rise md:order-2" style={{ animationDelay: "220ms" }}>
              {heroGalleryShots.length > 0 ? (
                <MachineHeroGallery
                  shots={heroGalleryShots}
                  model={machine.model}
                  footerRight={heroFooterRight}
                  zoomLabel={d("galleryZoom")}
                />
              ) : (
                <div className="relative border border-line bg-white overflow-hidden">
                  <div className="relative h-[380px] sm:h-[460px] lg:h-[560px] w-full overflow-hidden bg-white">
                    <div className="qs-float absolute inset-0">
                      <Image
                        src={machine.image.src}
                        alt={machine.model}
                        fill
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        className="object-contain p-6 lg:p-10"
                        priority
                      />
                    </div>
                    <LightboxTrigger
                      group={heroFallbackShots}
                      index={0}
                      ariaLabel={zoomLabel}
                      className="absolute inset-0 z-[6]"
                    />
                    <div className="pointer-events-none absolute inset-3" aria-hidden="true">
                      <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-gold-1/50" />
                      <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-gold-1/50" />
                      <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-gold-1/50" />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-gold-1/50" />
                    </div>
                  </div>
                  <div className="px-5 py-3 border-t border-line flex items-center justify-between">
                    <span className="font-mono text-label tracking-[.16em] uppercase text-muted">
                      {machine.model}
                    </span>
                    <span className="font-mono text-label tracking-[.16em] uppercase text-gold-1">
                      {heroFooterRight}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SUITABLE APPLICATIONS ── */}
      <section className="relative py-10 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <PanelTitle>{d("useCasesHeading")}</PanelTitle>
          </Reveal>
          {machine.useCases.length > 0 ? (
            <div className={`grid grid-cols-1 ${gridCols(machine.useCases.length)} gap-px bg-line border border-line`}>
              {machine.useCases.map((u, i) => {
                const Icon = USE_CASE_ICON[u.icon] ?? Target;
                return (
                  <Reveal key={u.title} delay={i * 80}>
                    <div className="group bg-white h-full p-6">
                      <span className="inline-flex items-center justify-center w-11 h-11 border border-line text-gold-1 bg-paper-2/50 transition-colors group-hover:border-gold-1/40">
                        <Icon className="w-5 h-5" strokeWidth={1.6} aria-hidden="true" />
                      </span>
                      <h3 className="font-display font-bold text-ink text-body tracking-[-.01em] mt-4">{u.title}</h3>
                      <p className="text-meta leading-[1.6] text-muted mt-2 m-0">{u.desc}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <PlaceholderPanel label={tbd} />
          )}
        </div>
      </section>

      {/* ── HIGHLIGHTS ── */}
      <section className="relative py-10 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true" />
        <CircuitTraces
          variant="light"
          className="hidden lg:block absolute top-0 left-0 w-[34%] h-full opacity-[.35] [mask-image:radial-gradient(ellipse_at_left,#000_18%,transparent_68%)] [-webkit-mask-image:radial-gradient(ellipse_at_left,#000_18%,transparent_68%)]"
        />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <PanelTitle>{d("featuresHeading")}</PanelTitle>
          </Reveal>
          {machine.features.length > 0 ? (
            <div
              className={`flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain ${gridCols(machine.features.length)} gap-px bg-line border border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:overflow-visible`}
            >
              {machine.features.map((f, i) => {
                const idx = String(i + 1).padStart(2, "0");
                return (
                  <Reveal
                    key={f.title}
                    delay={i * 80}
                    className="w-[88%] shrink-0 snap-start sm:w-auto sm:shrink"
                  >
                    <div className="group bg-white h-full flex flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden bg-paper-2/60">
                        <div className="absolute inset-0 qs-grid-bg opacity-50" aria-hidden="true" />
                        {f.img ? (
                          <Image
                            src={f.img}
                            alt={`${machine.model} — ${f.title}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="relative object-cover [filter:saturate(.96)_contrast(1.03)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                          />
                        ) : null}
                        {f.img ? (
                          <LightboxTrigger
                            group={featureShots}
                            index={featureShotIndex[i]}
                            ariaLabel={zoomLabel}
                            className="absolute inset-0 z-[6]"
                          />
                        ) : (
                          <span
                            className="absolute inset-0 flex items-center justify-center font-mono font-semibold text-[68px] leading-none text-ink/[.06] select-none"
                            aria-hidden="true"
                          >
                            {idx}
                          </span>
                        )}
                        <div className="pointer-events-none absolute inset-2.5 z-10" aria-hidden="true">
                          <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/60" />
                          <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/60" />
                          <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/60" />
                          <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/60" />
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1 border-t border-line">
                        <h3 className="font-display font-bold text-ink text-body tracking-[-.01em]">{f.title}</h3>
                        <p className="text-meta leading-[1.6] text-muted mt-2 m-0">{f.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <PlaceholderPanel label={tbd} />
          )}
        </div>
      </section>

      {/* ── MACHINING CAPABILITIES + WORKING SPACE ── */}
      <section className="relative py-10 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true" />
        <div className="relative qs-wrap-wide grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          <Reveal>
            <PanelTitle>{d("capabilitiesHeading")}</PanelTitle>
            {machine.capabilities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line">
                {machine.capabilities.map((c, i) => (
                  <div key={c.caption} className="bg-white">
                    <div className="relative aspect-square overflow-hidden bg-paper-2/60">
                      <div className="absolute inset-0 qs-grid-bg opacity-50" aria-hidden="true" />
                      {c.img && (
                        <>
                          <Image
                            src={c.img}
                            alt={c.caption}
                            fill
                            sizes="(max-width: 640px) 50vw, 12vw"
                            className="relative object-cover [filter:saturate(.96)_contrast(1.03)]"
                          />
                          <LightboxTrigger
                            group={capabilityShots}
                            index={capabilityShotIndex[i]}
                            ariaLabel={zoomLabel}
                            className="absolute inset-0 z-[6]"
                          />
                        </>
                      )}
                    </div>
                    <p className="font-mono text-label tracking-[.06em] text-center text-muted px-2 py-2.5 border-t border-line m-0">
                      {c.caption}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <PlaceholderPanel label={tbd} />
            )}
          </Reveal>

          <Reveal delay={120}>
            <PanelTitle>{d("workspaceHeading")}</PanelTitle>
            <div className="grid sm:grid-cols-[minmax(0,240px)_1fr] gap-8 items-center">
              {/* isometric working-envelope wireframe; axis figures read the
                  machine's own travel spec, dashes when it publishes none */}
              <svg
                viewBox="0 0 240 200"
                className="w-full max-w-[240px] mx-auto sm:mx-0"
                role="img"
                aria-label={d("envelopeAlt", {
                  travel: specValue(machine.specs, "machineTravel") ?? tbd,
                })}
                fill="none"
              >
                <g stroke="var(--color-gold-1)" strokeWidth="1.3" strokeLinejoin="round">
                  <path d="M70 40 L190 40 L190 120 L70 120 Z" strokeOpacity=".35" strokeDasharray="4 4" />
                  <path d="M30 70 L150 70 L150 150 L30 150 Z" />
                  <path d="M30 70 L70 40 M150 70 L190 40 M150 150 L190 120 M30 150 L70 120" />
                </g>
                <g stroke="var(--color-gold-1)" strokeWidth="1" strokeOpacity=".6">
                  <path d="M30 162 L150 162 M30 158 L30 166 M150 158 L150 166" />
                  <path d="M18 70 L18 150 M14 70 L22 70 M14 150 L22 150" />
                  {/* depth dimension runs parallel to the isometric edge (40,-30) */}
                  <path d="M155 156 L195 126 M152.6 152.8 L157.4 159.2 M192.6 122.8 L197.4 129.2" />
                </g>
                <g fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-muted)">
                  <text x="90" y="176" textAnchor="middle">
                    X {travel ? `${travel.x} ${travel.unit}` : "—"}
                  </text>
                  <text x="8" y="114" textAnchor="middle" transform="rotate(-90 8 114)">
                    Z {travel ? `${travel.z} ${travel.unit}` : "—"}
                  </text>
                  <text x="178" y="152">
                    Y {travel ? `${travel.y} ${travel.unit}` : "—"}
                  </text>
                </g>
              </svg>

              <dl className="m-0 flex-1">
                {WORKSPACE_KEYS.map((k) => {
                  const Icon = specIcon(k);
                  const v = specValue(machine.specs, k);
                  return (
                    <div key={k} className="flex items-start gap-3 py-3 border-b border-line first:border-t">
                      <Icon className="w-4 h-4 mt-0.5 shrink-0 text-gold-1" strokeWidth={1.6} aria-hidden="true" />
                      <div>
                        <dt className="text-meta text-muted m-0">{label(k)}</dt>
                        <dd className={`font-mono text-meta mt-0.5 m-0 ${v ? "text-ink" : "text-muted/70"}`}>
                          {v ?? tbd}
                        </dd>
                      </div>
                    </div>
                  );
                })}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PERFORMANCE + CNC CONTROLLER ── */}
      <section className="relative py-10 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true" />
        <div className="relative qs-wrap-wide grid lg:grid-cols-2 gap-10 lg:gap-12 items-stretch">
          <Reveal className="flex flex-col">
            <PanelTitle>{d("performanceHeading")}</PanelTitle>
            <div className="grid grid-cols-2 gap-px bg-line border border-line flex-1">
              {PERFORMANCE_KEYS.map((k) => {
                const Icon = specIcon(k);
                const raw = specValue(machine.specs, k);
                const split = raw ? splitSpecValue(raw) : null;
                return (
                  <div key={k} className="bg-white px-5 py-7 flex flex-col justify-center text-center">
                    <Icon className="w-6 h-6 mx-auto text-gold-1" strokeWidth={1.5} aria-hidden="true" />
                    <div
                      className={`font-display font-semibold text-subhead mt-3 tracking-[-.02em] leading-none ${
                        split ? "text-ink" : "text-muted/50"
                      }`}
                    >
                      {split ? split.value : "—"}
                    </div>
                    <div className="font-mono text-label-xs tracking-[.12em] uppercase text-gold-1 mt-1.5 min-h-[13px]">
                      {split?.unit}
                    </div>
                    <p className="text-meta leading-[1.5] text-muted mt-2.5 m-0">{label(k)}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={120} className="flex flex-col">
            <PanelTitle>{d("controllerCardHeading")}</PanelTitle>
            {controller ? (
              <div className="grid sm:grid-cols-[220px_1fr] gap-6 items-stretch flex-1">
                <div className="relative border border-line bg-white overflow-hidden min-h-[280px]">
                  <Image
                    src={controller.image.src}
                    alt={controller.name}
                    fill
                    sizes="220px"
                    className="object-contain p-3"
                  />
                  <LightboxTrigger
                    group={[
                      {
                        src: controller.image.src,
                        w: controller.image.w,
                        h: controller.image.h,
                        alt: controller.name,
                      },
                    ]}
                    index={0}
                    ariaLabel={zoomLabel}
                    className="absolute inset-0 z-[6]"
                  />
                </div>
                <div>
                  <p className="font-display font-bold text-ink text-title tracking-[-.01em]">
                    {machine.controller ?? controller.name}
                  </p>
                  <p className="text-meta leading-[1.65] text-muted mt-2 m-0">{controller.desc}</p>
                  <div className="flex flex-wrap gap-2 mt-6">
                    {controller.bullets.map((b) => (
                      <span
                        key={b}
                        className="inline-flex items-center gap-1.5 font-mono text-label tracking-[.04em] text-ink border border-line bg-white px-2.5 py-1.5"
                      >
                        <Check className="w-3 h-3 text-gold-1 shrink-0" strokeWidth={2.4} aria-hidden="true" />
                        {b}
                      </span>
                    ))}
                  </div>
                  <Link
                    className="qs-btn qs-btn-ghost inline-flex items-center gap-2 mt-6"
                    href={`/products/${controller.slug}`}
                  >
                    {d("controllerLink")} <span className="arr">→</span>
                  </Link>
                </div>
              </div>
            ) : (
              <PlaceholderPanel label={tbd} />
            )}
          </Reveal>
        </div>
      </section>

      {/* ── TECHNICAL SPECIFICATIONS ── */}
      <section className="relative py-10 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <PanelTitle>{d("specsHeading")}</PanelTitle>
          </Reveal>
          <div className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain gap-px bg-line border border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-6">
            {specGroups.map((g, i) => {
              const Icon = GROUP_ICON[g.id] ?? Settings;
              return (
                <Reveal
                  key={g.id}
                  delay={i * 60}
                  className="w-[88%] shrink-0 snap-start sm:w-auto sm:shrink"
                >
                  <div className="bg-white h-full">
                    <div className="flex items-center gap-2 px-4 py-3.5 border-b border-line">
                      <Icon className="w-4 h-4 text-gold-1 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                      <span className="font-display font-bold text-ink text-meta">
                        {d(`specGroups.${g.id}`)}
                      </span>
                    </div>
                    {g.rows.length > 0 ? (
                      <dl className="m-0 px-4 py-1">
                        {g.rows.map((r) => (
                          <div key={r.k} className="py-2.5 border-b border-line/70 last:border-b-0">
                            <dt className="text-label leading-tight text-muted m-0">{label(r.k)}</dt>
                            <dd className="font-mono text-meta text-ink mt-1 m-0">{r.v}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="font-mono text-label tracking-[.1em] uppercase text-muted/70 px-4 py-6 m-0">
                        {tbd}
                      </p>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
          <p className="text-meta leading-[1.6] text-muted mt-5 m-0">{d("specsNote")}</p>
        </div>
      </section>

      {/* ── STANDARD & OPTIONAL CONFIGURATION ── */}
      <section className="relative py-10 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <PanelTitle>{d("configHeading")}</PanelTitle>
          </Reveal>
          <div className="grid lg:grid-cols-2 gap-px bg-line border border-line">
            <div className="bg-white p-7">
              <h3 className="font-display font-bold text-ink text-body mb-5">{d("standardHeading")}</h3>
              {machine.standardEquip.length > 0 ? (
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 m-0 p-0 list-none">
                  {machine.standardEquip.map((it) => (
                    <li key={it} className="flex items-start gap-2.5 text-meta leading-[1.5] text-ink">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-gold-1" strokeWidth={2.2} aria-hidden="true" />
                      {it}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-mono text-label tracking-[.1em] uppercase text-muted/70 m-0">{tbd}</p>
              )}
            </div>
            <div className="bg-white p-7">
              <h3 className="font-display font-bold text-ink text-body mb-5">{d("optionalHeading")}</h3>
              {machine.optionalEquip.length > 0 ? (
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 m-0 p-0 list-none">
                  {machine.optionalEquip.map((it) => (
                    <li key={it} className="flex items-start gap-2.5 text-meta leading-[1.5] text-muted">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-line-2" strokeWidth={2.2} aria-hidden="true" />
                      {it}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-mono text-label tracking-[.1em] uppercase text-muted/70 m-0">{tbd}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── DOWNLOADS ── */}
      <section className="relative py-10 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <PanelTitle>{d("downloadsHeading")}</PanelTitle>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line border border-line">
            {/* Machine datasheet — not hosted yet, so the card states as much
                instead of linking somewhere that has no sheet behind it. */}
            <Reveal>
              <div className="bg-white h-full p-6 flex items-start gap-4">
                <span className="inline-flex items-center justify-center w-12 h-14 border border-line bg-paper-2/50 text-muted/60 shrink-0">
                  <FileText className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-ink text-body tracking-[-.01em]">
                    {d("datasheetTitle")}
                  </h3>
                  <p className="font-mono text-label tracking-[.08em] text-gold-1 mt-0.5">{machine.model}</p>
                  <p className="text-meta leading-[1.55] text-muted mt-2 m-0">{d("datasheetDesc")}</p>
                  <span className="inline-flex items-center gap-1.5 font-mono text-label tracking-[.1em] uppercase text-muted/70 mt-3">
                    {tbd}
                  </span>
                </div>
              </div>
            </Reveal>

            {catalogue && (
              <Reveal delay={80}>
                <a
                  href={catalogue.fileUrl}
                  className="group bg-white h-full p-6 flex items-start gap-4 hover:bg-paper-2/40 transition-colors"
                >
                  <span className="inline-flex items-center justify-center w-12 h-14 border border-line bg-paper-2/50 text-gold-1 shrink-0">
                    <FileText className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-ink text-body tracking-[-.01em]">
                      {d("catalogueTitle")}
                    </h3>
                    <p className="font-mono text-label tracking-[.08em] text-gold-1 mt-0.5">
                      {catalogue.ext} · {catalogue.lang.toUpperCase()}
                    </p>
                    <p className="text-meta leading-[1.55] text-muted mt-2 m-0">{d("catalogueDesc")}</p>
                    <span className="inline-flex items-center gap-1.5 font-mono text-label tracking-[.1em] uppercase text-ink mt-3 group-hover:text-gold-1 transition-colors">
                      {d("downloadCta")}{" "}
                      <span className="arr transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </a>
              </Reveal>
            )}

            {controllerDoc ? (
              <Reveal delay={160}>
                <a
                  href={controllerDoc.fileUrl}
                  className="group bg-white h-full p-6 flex items-start gap-4 hover:bg-paper-2/40 transition-colors"
                >
                  <span className="inline-flex items-center justify-center w-12 h-14 border border-line bg-paper-2/50 text-gold-1 shrink-0">
                    <FileText className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-ink text-body tracking-[-.01em]">
                      {d("controllerDocTitle")}
                    </h3>
                    <p className="font-mono text-label tracking-[.08em] text-gold-1 mt-0.5">
                      {controllerDoc.model}
                    </p>
                    <p className="text-meta leading-[1.55] text-muted mt-2 m-0">{d("controllerDocDesc")}</p>
                    <span className="inline-flex items-center gap-1.5 font-mono text-label tracking-[.1em] uppercase text-ink mt-3 group-hover:text-gold-1 transition-colors">
                      {d("downloadCta")}{" "}
                      <span className="arr transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </a>
              </Reveal>
            ) : (
              <Reveal delay={160}>
                <div className="bg-white h-full p-6 flex items-start gap-4">
                  <span className="inline-flex items-center justify-center w-12 h-14 border border-line bg-paper-2/50 text-muted/60 shrink-0">
                    <FileText className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-ink text-body tracking-[-.01em]">
                      {d("controllerDocTitle")}
                    </h3>
                    <p className="text-meta leading-[1.55] text-muted mt-2 m-0">{d("controllerDocDesc")}</p>
                    <span className="inline-flex items-center gap-1.5 font-mono text-label tracking-[.1em] uppercase text-muted/70 mt-3">
                      {tbd}
                    </span>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative bg-ink text-[#cfc9b8] py-12 sm:py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true" />
        <CircuitTraces
          variant="dark"
          className="absolute inset-y-0 right-[-8%] w-[48%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_66%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_66%)]"
        />
        <div className="relative qs-wrap-wide grid lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <Reveal>
            <h2 className="qs-h2 text-white max-w-[24ch]">{d("ctaHeading")}</h2>
            <p className="text-body leading-[1.7] text-[#a8a499] mt-4 max-w-[54ch]">{d("ctaBody")}</p>
          </Reveal>
          <Reveal delay={120}>
            <div className="flex flex-col gap-3">
              <Link className="qs-btn qs-btn-gold justify-center" href="/contact">
                {d("heroQuote")} <span className="arr">→</span>
              </Link>
              <Link
                className="qs-btn bg-transparent text-white border border-[#4a453a] hover:bg-white/10 inline-flex items-center justify-center gap-2"
                href="/contact"
              >
                <PhoneCall className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" /> {d("ctaButton")}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
