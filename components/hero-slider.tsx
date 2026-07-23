"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import CircuitTraces from "@/components/circuit-traces";
import { useHorizontalSwipe } from "@/lib/use-swipe";

export type HeroSlide = {
  /** Short label that follows the live-dot eyebrow, e.g. "Premium High-End". */
  tag: string;
  /** Product name — rendered with the gold shimmer on the first headline line. */
  name: string;
  /** Second headline line, e.g. "Controller". */
  sub: string;
  desc: string;
  /** Detail-page href for the primary CTA. */
  href: string;
  img: string;
  /** Figure caption under the device render. */
  fig: string;
  /** Spec readout rows: [key, value]. */
  specs: [string, string][];
};

const INTERVAL = 7000; // ms each slide stays before auto-advancing

/**
 * Hero product slider — keeps the original dark blueprint stage (PCB traces, gold
 * ember glow, registration ticks) static while the thesis / device render / spec
 * readout cross-fade per product. Re-keying each content column on slide change
 * replays the staggered `qs-sweep-in` entrance, so every advance feels orchestrated.
 *
 * Autoplay pauses on spec-sheet hover or keyboard focus, advances with ←/→, and honours
 * prefers-reduced-motion (no autoplay, no progress bar). The first slide renders on
 * the server so crawlers and no-JS visitors still get a real <h1> + spec sheet.
 */
export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const t = useTranslations("home");
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animate, setAnimate] = useState(true);
  const rootRef = useRef<HTMLElement>(null);

  const go = useCallback(
    (i: number) => setActive((i + slides.length) % slides.length),
    [slides.length],
  );

  // Honour prefers-reduced-motion: no autoplay, no progress bar.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setAnimate(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Auto-advance; pause while hovered/focused.
  useEffect(() => {
    if (!animate || paused || slides.length < 2) return;
    const id = window.setInterval(
      () => setActive((a) => (a + 1) % slides.length),
      INTERVAL,
    );
    return () => window.clearInterval(id);
  }, [animate, paused, active, slides.length]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(active + 1);
    else if (e.key === "ArrowLeft") go(active - 1);
  };

  // Touch users advance the carousel by swiping anywhere on the stage.
  const swipe = useHorizontalSwipe((dir) => go(active + dir));

  const s = slides[active];
  const sweep = (delay: number): React.CSSProperties => ({ animationDelay: `${delay}ms` });

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label={t("hero.regionAria")}
      onKeyDown={onKeyDown}
      {...swipe}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative bg-ink text-[#cfc9b8] overflow-hidden border-b border-[#221e18]"
    >
      <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.14]" aria-hidden="true" />
      {/* PCB trace network — concentrated in opposite corners, faded inward */}
      <div className="absolute top-0 left-0 w-[34%] h-[50%] opacity-[.6] [mask-image:radial-gradient(ellipse_at_top_left,#000_38%,transparent_74%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_left,#000_38%,transparent_74%)]" aria-hidden="true">
        <CircuitTraces variant="dark" className="w-full h-full" />
      </div>
      <div className="absolute bottom-0 right-0 w-[34%] h-[50%] opacity-[.6] rotate-180 [mask-image:radial-gradient(ellipse_at_top_left,#000_38%,transparent_74%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_left,#000_38%,transparent_74%)]" aria-hidden="true">
        <CircuitTraces variant="dark" className="w-full h-full" />
      </div>
      {/* gold radial glow pool, centered behind the product */}
      <div className="absolute inset-0 hidden lg:flex items-center justify-center" aria-hidden="true">
        <div className="qs-glow !relative" style={{ width: "600px", height: "600px" }} />
      </div>

      {/* blueprint registration ticks */}
      <div className="hidden lg:block absolute top-7 left-7 w-4 h-4 border-l border-t border-[#3a352c]" aria-hidden="true" />
      <div className="hidden lg:block absolute top-7 right-7 w-4 h-4 border-r border-t border-[#3a352c]" aria-hidden="true" />
      <div className="hidden lg:block absolute bottom-7 left-7 w-4 h-4 border-l border-b border-[#3a352c]" aria-hidden="true" />
      <div className="hidden lg:block absolute bottom-7 right-7 w-4 h-4 border-r border-b border-[#3a352c]" aria-hidden="true" />

      <div className="relative qs-wrap-wide grid md:grid-cols-2 lg:grid-cols-[1fr_minmax(360px,432px)_0.92fr] gap-8 md:gap-10 xl:gap-16 items-center lg:min-h-[clamp(580px,84vh,860px)] pt-10 md:pt-16 lg:pt-24 pb-8 lg:pb-10">
        {/* LEFT — thesis (re-keyed → re-runs the staggered sweep on each slide) */}
        <div
          key={`t-${active}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="text-center md:text-left"
          aria-live="polite"
        >
          <span className="qs-eyebrow qs-sweep-in !text-gold-2 before:hidden justify-center md:justify-start" style={sweep(60)}>
            <span className="qs-live-dot mr-1" aria-hidden="true" />QS Technology · {s.tag}
          </span>
          <h1 className="qs-h1 mt-4 text-white" style={{ fontSize: "clamp(46px,6vw,96px)", lineHeight: ".94" }}>
            <span className="block overflow-hidden pb-[.04em]">
              <span className="qs-sweep-in inline-block" style={sweep(150)}>
                <span className="qs-gold-shimmer font-semibold">{s.name}</span>
              </span>
            </span>
            <span className="block overflow-hidden pb-[.04em]">
              <span className="qs-sweep-in inline-block" style={sweep(270)}>{s.sub}</span>
            </span>
          </h1>
          {/* line-clamp caps phone copy at 4 lines and min-h matches that cap, so
              switching slides never reflows the stack below (no scroll jump)
              while short copy no longer leaves a tall blank gap. */}
          <p className="mt-6 lg:mt-7 min-h-[7rem] sm:min-h-[6rem] lg:min-h-[7rem] text-body sm:text-title leading-[1.7] text-[#b4afa0] max-w-[50ch] mx-auto md:mx-0 line-clamp-4 sm:line-clamp-none qs-sweep-in" style={sweep(400)}>
            {s.desc}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-8 lg:mt-9 qs-sweep-in" style={sweep(500)}>
            <Link className="qs-btn qs-btn-gold" href={s.href}>{t("hero.detailCta")} <span className="arr">→</span></Link>
            <Link className="qs-btn bg-transparent border border-[#3a352c] text-[#e8e6df] hover:bg-white hover:text-ink hover:border-white" href="/electronics">{t("hero.allCta")}</Link>
          </div>
        </div>

        {/* CENTER — frameless device render floating directly on the dark blueprint stage */}
        <div
          key={`c-${active}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="order-first md:order-none qs-sweep-in"
          style={sweep(120)}
        >
          <div className="relative w-full max-w-[456px] mx-auto">
            <div className="qs-float relative h-[clamp(240px,36vh,560px)] lg:h-[clamp(432px,62vh,672px)]">
              {/* gold pool the product floats above */}
              <div className="qs-breathe pointer-events-none absolute inset-x-0 bottom-0 h-3/4" style={{ background: "radial-gradient(ellipse 56% 58% at 50% 100%, rgba(232,200,120,.34), transparent 70%)" }} />
              <Image
                src={s.img}
                alt={`${t("hero.imgAltPrefix")} ${s.name}`}
                fill
                sizes="(max-width:1024px) 90vw, 456px"
                priority={active === 0}
                className="object-contain object-center drop-shadow-[0_34px_46px_rgba(0,0,0,.6)]"
              />
              <div className="qs-scan" aria-hidden="true" />
            </div>
            {/* gold pedestal line the product sits above */}
            <div className="pointer-events-none mx-auto h-px w-[76%] bg-gradient-to-r from-transparent via-gold-2/70 to-transparent" />
          </div>
        </div>

        {/* RIGHT — spec readout; rows light up on hover. Hovering the spec sheet pauses autoplay.
            Phones/tablets drop the readout entirely: the thesis + device render are the story at
            those widths, and the specs live on the detail page one tap away. */}
        <ul
          key={`s-${active}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="hidden lg:flex lg:flex-col lg:min-h-[17.5rem] text-[#cfc9b8] w-full lg:max-w-[440px]"
        >
          {s.specs.map(([k, v], i) => (
            <li
              key={k}
              className="qs-spec flex items-baseline justify-between gap-4 py-3.5 border-t border-[#2a2620] qs-sweep-in"
              style={sweep(420 + i * 90)}
            >
              <span className="qs-spec-k font-mono text-label-xs tracking-[.18em] uppercase text-[#8a8676]">{k}</span>
              <span className="qs-spec-v font-display text-body font-medium text-white text-right">{v}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* SLIDE SELECTOR — a control bar lifted onto its own surface so it reads on the dark stage (not flat black-on-black) */}
      <div className="relative qs-wrap-wide pb-10 sm:pb-12 lg:pb-16">
        {/* phones: the 3-row selector collapses to swipe-friendly dots (44px hit areas) */}
        <div className="flex sm:hidden justify-center">
          {slides.map((slide, i) => (
            <button
              key={slide.name + i}
              type="button"
              onClick={() => go(i)}
              aria-label={slide.name}
              aria-current={i === active ? "true" : undefined}
              className="grid h-11 w-11 place-items-center"
            >
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-7 bg-gold-2" : "w-1.5 bg-[#4a4436]"
                }`}
              />
            </button>
          ))}
        </div>
        <div className="relative hidden sm:block overflow-hidden rounded-[3px] border border-[#37301f] bg-gradient-to-b from-[#17130c] to-[#0c0a06] shadow-[0_22px_50px_-28px_rgba(0,0,0,.85)]">
          {/* lit gold seam along the top edge */}
          <div className="pointer-events-none absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(232,200,120,.55),transparent)" }} aria-hidden="true"></div>
          <div className="grid grid-cols-3 divide-x divide-[#2c2719]">
            {slides.map((slide, i) => (
              <button
                key={slide.name + i}
                type="button"
                onClick={() => go(i)}
                data-active={i === active ? "true" : undefined}
                aria-label={`Xem ${slide.name}`}
                aria-current={i === active ? "true" : undefined}
                className="qs-hero-tab group relative overflow-hidden text-left px-5 py-4 flex items-center gap-4 bg-transparent transition-colors duration-300 hover:bg-white/[.04] data-[active=true]:bg-gold-2/[.07]"
              >
                <span className="font-mono text-label tabular-nums text-[#7a7565] group-data-[active=true]:text-gold-2 transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-body font-semibold tracking-[-.01em] text-[#aaa498] group-data-[active=true]:text-white transition-colors truncate">
                    {slide.name}
                  </span>
                  <span className="block font-mono text-label-xs tracking-[.16em] uppercase text-[#6b6453] group-data-[active=true]:text-gold-1 transition-colors truncate">
                    {slide.tag}
                  </span>
                </span>
                <span className="font-mono text-meta text-[#46402f] group-data-[active=true]:text-gold-2 group-hover:translate-x-0.5 transition-all">→</span>
                {/* autoplay progress seam — restarts whenever this tab becomes active */}
                <span className="pointer-events-none absolute left-0 bottom-0 h-[2px] w-full bg-transparent">
                  {i === active && animate && !paused && slides.length > 1 && (
                    <span
                      key={active}
                      className="block h-full bg-gold-2"
                      style={{ animation: `qs-progress ${INTERVAL}ms linear forwards` }}
                    />
                  )}
                  {i === active && (!animate || paused) && <span className="block h-full bg-gold-2/70" />}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
