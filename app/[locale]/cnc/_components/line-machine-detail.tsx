import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Reveal from "@/components/reveal";
import { LightboxTrigger, type LightboxShot } from "@/components/media/image-lightbox";
import {
  LogIn,
  Cog,
  LogOut,
  RotateCw,
  Layers,
  Gauge,
  ScanLine,
  ShieldCheck,
  MonitorCog,
  Scale,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { MachineView } from "@/lib/data/machines";
import type { Locale } from "@/lib/i18n/config";

/**
 * Detail template for line-integrated machines (automation / inspection). Unlike
 * the dark CNC datasheet layout, this is a bright "line station" page: a light
 * stainless hero with an andon readout, an animated infeed → cycle → discharge
 * process flow, an in-context photo gallery, control-panel and applications
 * cards. Rendered by the detail page when a machine ships `line`/`control` data.
 */

/** Icons cycled across the feature callouts (one stroke width throughout). */
const FEATURE_ICONS: LucideIcon[] = [RotateCw, Layers, Gauge, ScanLine, ShieldCheck, Scale];
/** Icons for the three line-flow stations: in → process → out. */
const FLOW_ICONS: LucideIcon[] = [LogIn, Cog, LogOut];

export default async function LineMachineDetail({
  machine,
  locale,
}: {
  machine: MachineView;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "cnc" });
  const label = (k: string) => t(`machines.labels.${k}`);
  const d = (k: string, v?: Record<string, string>) => t(`machines.detail.${k}`, v);

  const readout = machine.specs.slice(0, 3);
  const category = t(`machines.categories.${machine.category}`);

  // Hero figure and gallery grid are illustrations, not links — each zooms as
  // its own group. Gallery shots carry no dimensions; the lightbox fill-boxes them.
  const zoomLabel = d("galleryZoom");
  const heroShots: LightboxShot[] = [
    { src: machine.image.src, w: machine.image.w, h: machine.image.h, alt: machine.model },
  ];
  const galleryShots: LightboxShot[] = machine.gallery.map((s) => ({ src: s.src, alt: s.caption }));

  return (
    <>
      {/* HERO — light line station: model, andon readout, key specs + machine figure */}
      <section className="relative bg-paper overflow-hidden border-b border-line">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-40" aria-hidden="true"></div>
        <div className="relative qs-wrap-wide py-12 lg:py-16">
          <Reveal>
            <nav className="qs-crumb">
              <Link href="/cnc" className="hover:text-ink">{d("crumb")}</Link>
              <span className="sep" aria-hidden="true">/</span>
              <span className="here">{machine.model}</span>
            </nav>
          </Reveal>

          <div className="mt-8 grid lg:grid-cols-[1.02fr_1.22fr] gap-10 lg:gap-16 items-center">
            <Reveal className="order-2 lg:order-1">
              <span className="inline-flex items-center gap-2 font-mono text-label tracking-[.18em] uppercase text-white bg-steelblue px-2.5 py-1">
                {category}
              </span>
              <h1 className="qs-h1 mt-4">{machine.model}</h1>
              <p className="qs-lede mt-5">{machine.tagline}</p>

              {/* andon status — the machine reads "ready" on the line */}
              <div className="mt-6 inline-flex items-center gap-2.5 font-mono text-meta tracking-[.12em] uppercase text-muted">
                <span className="qs-andon inline-block w-2.5 h-2.5 rounded-full bg-signal" aria-hidden="true"></span>
                {d("statusReady")}
              </div>

              {/* key spec readout — control-panel digits */}
              <dl className="mt-7 grid grid-cols-3 gap-px bg-line border border-line">
                {readout.map((s) => (
                  <div key={s.k} className="bg-white px-4 py-4">
                    <dt className="font-mono text-label-xs tracking-[.12em] uppercase text-muted m-0">{label(s.k)}</dt>
                    <dd className="font-display font-bold text-ink text-title leading-tight mt-2 m-0 tabular-nums tracking-[-.01em]">{s.v}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link className="qs-btn qs-btn-gold" href="/contact">{d("ctaButton")} <span className="arr">→</span></Link>
                <Link className="qs-btn qs-btn-ghost" href="/cnc">{d("backToList")}</Link>
              </div>
            </Reveal>

            <Reveal className="order-1 lg:order-2" delay={120}>
              <figure className="relative m-0 border border-line bg-white">
                <div className="relative h-[360px] sm:h-[440px] lg:h-[540px] w-full overflow-hidden bg-white">
                  <Image
                    src={machine.image.src}
                    alt={machine.model}
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-contain p-6 lg:p-10 [filter:drop-shadow(0_16px_28px_rgba(52,86,111,.18))]"
                    priority
                  />
                  <LightboxTrigger
                    group={heroShots}
                    index={0}
                    ariaLabel={zoomLabel}
                    className="absolute inset-0 z-[6]"
                  />
                  {/* corner registration ticks */}
                  <div className="pointer-events-none absolute inset-3" aria-hidden="true">
                    <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-steelblue/50"></span>
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-steelblue/50"></span>
                    <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-steelblue/50"></span>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-steelblue/50"></span>
                  </div>
                </div>
                <figcaption className="px-5 py-3 border-t border-line flex items-center justify-between">
                  <span className="font-mono text-label tracking-[.16em] uppercase text-muted">{machine.model}</span>
                  <span className="font-mono text-label tracking-[.16em] uppercase text-steelblue tabular-nums">{readout[0]?.v}</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PROCESS FLOW — infeed → cycle → discharge, on an animated conveyor */}
      {machine.line.length > 0 && (
        <section className="relative py-12 sm:py-16 lg:py-24 bg-paper-2 border-b border-line overflow-hidden">
          <div className="relative qs-wrap-wide">
            <Reveal>
              <div className="pb-6 border-b border-line mb-12 max-w-[70ch]">
                <span className="font-mono text-label text-steelblue tracking-[.16em] uppercase inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-steelblue"></span>{d("lineHeading")}
                </span>
                <p className="text-body text-muted mt-3 m-0">{d("lineBody", { model: machine.model })}</p>
              </div>
            </Reveal>

            {/* end-cap → stations → end-cap, connected by a running belt line */}
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-5 lg:gap-0">
              <FlowEndCap label={d("inLabel")} />
              {machine.line.map((step, i) => {
                const Icon = FLOW_ICONS[Math.min(i, FLOW_ICONS.length - 1)];
                return (
                  <div key={step.title} className="contents lg:flex lg:flex-1 lg:items-stretch">
                    {/* belt connector (desktop only) */}
                    <span className="hidden lg:flex items-center px-2 shrink-0" aria-hidden="true">
                      <span className="h-1.5 w-full min-w-[28px] qs-conveyor"></span>
                    </span>
                    <Reveal delay={i * 90} className="lg:flex-1">
                      <div className="group relative h-full bg-white border border-line p-6 transition-colors duration-200 hover:border-steelblue">
                        <div className="flex items-center justify-between">
                          <span className="grid place-items-center w-10 h-10 rounded-full bg-steelblue/10 text-steelblue">
                            <Icon className="w-5 h-5" strokeWidth={1.7} aria-hidden="true" />
                          </span>
                          <span className="font-mono text-h2 font-bold leading-none text-line-2 tabular-nums select-none" aria-hidden="true">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-ink text-lede tracking-[-.01em] mt-4">{step.title}</h3>
                        <p className="text-meta leading-[1.6] text-muted mt-2 m-0">{step.desc}</p>
                      </div>
                    </Reveal>
                  </div>
                );
              })}
              <span className="hidden lg:flex items-center px-2 shrink-0" aria-hidden="true">
                <span className="h-1.5 w-full min-w-[28px] qs-conveyor"></span>
              </span>
              <FlowEndCap label={d("outLabel")} />
            </div>
          </div>
        </section>
      )}

      {/* GALLERY — the machine on a real line, captioned */}
      {machine.gallery.length > 0 && (
        <section className="relative py-12 sm:py-16 lg:py-24 bg-paper overflow-hidden">
          <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-40" aria-hidden="true"></div>
          <div className="relative qs-wrap-wide">
            <Reveal>
              <div className="pb-6 border-b border-line mb-10">
                <span className="font-mono text-label text-steelblue tracking-[.16em] uppercase inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-steelblue"></span>{d("galleryHeading")}
                </span>
              </div>
            </Reveal>
            <div className={`grid grid-cols-1 gap-4 ${machine.gallery.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
              {machine.gallery.map((shot, i) => (
                <Reveal key={shot.src} delay={i * 70}>
                  <figure className="group m-0 border border-line bg-white overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={shot.src}
                        alt={shot.caption}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover [filter:saturate(.97)_contrast(1.03)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                      />
                      <LightboxTrigger
                        group={galleryShots}
                        index={i}
                        ariaLabel={zoomLabel}
                        className="absolute inset-0 z-[6]"
                      />
                    </div>
                    <figcaption className="px-4 py-3 border-t border-line font-mono text-label leading-[1.5] text-muted">
                      <span className="text-steelblue mr-1.5">{String(i + 1).padStart(2, "0")}</span>{shot.caption}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURES — icon callouts on hairline dividers */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-paper-2 border-y border-line">
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="pb-6 border-b border-line mb-10">
              <span className="font-mono text-label text-steelblue tracking-[.16em] uppercase inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-steelblue"></span>{d("featuresHeading")}
              </span>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line border border-line">
            {machine.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <Reveal key={f.title} delay={i * 70}>
                  <div className="h-full bg-white p-6 lg:p-7 flex gap-4">
                    <span className="grid place-items-center w-10 h-10 shrink-0 rounded-[3px] bg-steelblue/10 text-steelblue">
                      <Icon className="w-5 h-5" strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-ink text-lede tracking-[-.01em]">{f.title}</h3>
                      <p className="text-meta leading-[1.6] text-muted mt-2 m-0">{f.desc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* SPECS + CONTROL + APPLICATIONS */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-40" aria-hidden="true"></div>
        <div className="relative qs-wrap-wide grid gap-12 lg:gap-16 items-start lg:grid-cols-[1.15fr_.85fr]">
          <Reveal>
            <div className="pb-6 border-b border-line mb-8">
              <span className="font-mono text-label text-steelblue tracking-[.16em] uppercase inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-steelblue"></span>{d("specsHeading")}
              </span>
              <h2 className="qs-h2 mt-3">{machine.model}</h2>
            </div>
            <dl className="m-0">
              {machine.specs.map((s) => (
                <div key={s.k} className="flex items-baseline justify-between gap-6 py-3 border-b border-line">
                  <dt className="text-meta text-muted m-0">{label(s.k)}</dt>
                  <dd className="font-mono text-meta text-ink text-right m-0 tabular-nums">{s.v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-meta leading-[1.6] text-muted mt-5 m-0">{d("specsNoteAuto")}</p>
          </Reveal>

          <div className="flex flex-col gap-8 lg:sticky lg:top-24">
            {machine.control && (
              <Reveal delay={100}>
                <div className="border border-line bg-white p-7">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-label text-steelblue tracking-[.16em] uppercase">{d("controlSystemHeading")}</span>
                    <MonitorCog className="w-5 h-5 text-steelblue" strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <p className="font-display font-bold text-ink text-title tracking-[-.02em] mt-4">{machine.control.system}</p>

                  {/* andon stack-light motif */}
                  <div className="mt-5 flex items-center gap-4">
                    <span className="flex flex-col gap-1 p-1.5 rounded-[3px] bg-ink/[.04] border border-line" aria-hidden="true">
                      <span className="w-3 h-3 rounded-full bg-rust/70"></span>
                      <span className="w-3 h-3 rounded-full bg-gold/70"></span>
                      <span className="qs-andon w-3 h-3 rounded-full bg-signal"></span>
                    </span>
                    <p className="text-meta leading-[1.6] text-muted m-0">{d("controlSystemBody", { system: machine.control.system })}</p>
                  </div>

                  <ul className="mt-6 m-0 p-0 list-none grid gap-2.5">
                    {machine.control.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-meta text-ink">
                        <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-steelblue shrink-0" aria-hidden="true"></span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}

            {machine.applications.length > 0 && (
              <Reveal delay={160}>
                <div className="border border-line bg-white p-7">
                  <span className="font-mono text-label text-steelblue tracking-[.16em] uppercase">{d("applicationsHeading")}</span>
                  <p className="text-meta leading-[1.6] text-muted mt-3 m-0">{d("applicationsBody")}</p>
                  <ul className="mt-5 flex flex-wrap gap-2 m-0 p-0 list-none">
                    {machine.applications.map((a) => (
                      <li key={a} className="font-mono text-label tracking-[.06em] text-ink bg-paper border border-line rounded-full px-3 py-1.5">
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* CTA — closing consultation band */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-paper-2 border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-50" aria-hidden="true"></div>
        <div className="relative qs-wrap-wide max-w-[880px] text-center">
          <Reveal>
            <h2 className="qs-h2">{d("ctaHeading")}</h2>
            <p className="qs-lede mx-auto mt-5">{d("ctaBody")}</p>
            <div className="flex flex-wrap justify-center gap-3 mt-9">
              <Link className="qs-btn qs-btn-gold" href="/contact">{d("ctaButton")} <span className="arr">→</span></Link>
              <Link className="qs-btn qs-btn-ghost" href="/cnc">{d("backToList")}</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/** Infeed / discharge end-cap that bookends the process flow. */
function FlowEndCap({ label }: { label: string }) {
  return (
    <div className="flex lg:flex-col items-center justify-center gap-2 shrink-0 lg:w-[104px] bg-white border border-line px-4 py-4 lg:py-0">
      <ArrowRight className="w-5 h-5 text-steelblue lg:rotate-0 rotate-90" strokeWidth={1.7} aria-hidden="true" />
      <span className="font-mono text-label-xs tracking-[.14em] uppercase text-muted text-center">{label}</span>
    </div>
  );
}
