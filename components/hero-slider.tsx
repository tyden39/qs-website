"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import CircuitTraces from "@/components/circuit-traces";

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
 * replays the staggered `qs-rise` entrance, so every advance feels orchestrated.
 *
 * Autoplay pauses on hover/focus, advances with ←/→, and honours
 * prefers-reduced-motion (no autoplay, no progress bar). The first slide renders on
 * the server so crawlers and no-JS visitors still get a real <h1> + spec sheet.
 */
export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
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

  const s = slides[active];
  const rise = (delay: number): React.CSSProperties => ({ animationDelay: `${delay}ms` });

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="Bộ điều khiển nổi bật"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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

      <div className="relative qs-wrap-wide grid lg:grid-cols-[1fr_minmax(300px,360px)_0.92fr] gap-10 xl:gap-16 items-center min-h-[clamp(580px,84vh,860px)] pt-16 lg:pt-24 pb-8 lg:pb-10">
        {/* LEFT — thesis (re-keyed → re-runs the staggered rise on each slide) */}
        <div key={`t-${active}`} className="text-center lg:text-left" aria-live="polite">
          <span className="qs-eyebrow qs-rise !text-gold-2 before:hidden justify-center lg:justify-start" style={rise(60)}>
            <span className="qs-live-dot mr-1" aria-hidden="true" />QS Technology · {s.tag}
          </span>
          <h1 className="qs-h1 mt-4 text-white" style={{ fontSize: "clamp(46px,6vw,96px)", lineHeight: ".94" }}>
            <span className="block overflow-hidden pb-[.04em]">
              <span className="qs-rise inline-block" style={rise(150)}>
                <span className="qs-gold-shimmer font-semibold">{s.name}</span>
              </span>
            </span>
            <span className="block overflow-hidden pb-[.04em]">
              <span className="qs-rise inline-block" style={rise(270)}>{s.sub}</span>
            </span>
          </h1>
          <p className="mt-7 text-lg leading-[1.7] text-[#b4afa0] max-w-[50ch] mx-auto lg:mx-0 qs-rise" style={rise(400)}>
            {s.desc}
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-9 qs-rise" style={rise(500)}>
            <Link className="qs-btn qs-btn-gold" href={s.href}>Thông tin chi tiết <span className="arr">→</span></Link>
            <Link className="qs-btn bg-transparent border border-[#3a352c] text-[#e8e6df] hover:bg-white hover:text-ink hover:border-white" href="/products">Xem toàn bộ controller</Link>
          </div>
        </div>

        {/* CENTER — device render on a blueprint stage (contained so mixed aspect ratios all read as a product on a pedestal) */}
        <div key={`c-${active}`} className="order-first lg:order-none qs-rise" style={rise(120)}>
          <div className="qs-float relative bg-white border border-line p-6 w-full max-w-[340px] mx-auto shadow-[0_40px_80px_-30px_rgba(0,0,0,.7)]">
            <div className="flex items-center gap-1.5 pb-4 mb-4 border-b border-line">
              <span className="w-2.5 h-2.5 rounded-full bg-rust" />
              <span className="w-2.5 h-2.5 rounded-full bg-line-2" />
              <span className="w-2.5 h-2.5 rounded-full bg-line-2" />
              <span className="ml-auto font-mono text-[10px] tracking-[.16em] uppercase text-muted">{s.name}</span>
            </div>
            <div className="relative h-[clamp(280px,34vh,360px)] overflow-hidden" style={{ background: "linear-gradient(180deg,#ffffff 0%,#f1efe8 100%)" }}>
              <div className="absolute inset-0 qs-grid-bg opacity-40" aria-hidden="true" />
              {/* gold pedestal the product stands on */}
              <div className="pointer-events-none absolute left-4 right-4 bottom-3 h-px bg-gradient-to-r from-transparent via-gold-2/70 to-transparent" />
              <div className="qs-breathe pointer-events-none absolute inset-x-0 bottom-0 h-3/4" style={{ background: "radial-gradient(ellipse 58% 64% at 50% 102%, rgba(232,200,120,.3), transparent 70%)" }} />
              <Image
                src={s.img}
                alt={`Bộ điều khiển CNC QS ${s.name}`}
                fill
                sizes="(max-width:1024px) 90vw, 340px"
                priority={active === 0}
                className="object-contain object-bottom p-3"
              />
              <div className="qs-scan" aria-hidden="true" />
            </div>
            <div className="mt-4 font-mono text-[9px] tracking-[.18em] uppercase text-muted">{s.fig}</div>
          </div>
        </div>

        {/* RIGHT — spec readout; rows light up on hover */}
        <ul key={`s-${active}`} className="flex flex-col text-[#cfc9b8] w-full max-w-[420px] mx-auto lg:mx-0">
          <li className="flex items-center justify-between pb-3 qs-rise" style={rise(340)}>
            <span className="font-mono text-[10px] tracking-[.22em] uppercase text-[#8a8676]">Thông số kỹ thuật</span>
            <span className="inline-flex items-center gap-1.5">
              <button type="button" onClick={() => go(active - 1)} aria-label="Sản phẩm trước" className="qs-hero-arrow">‹</button>
              <button type="button" onClick={() => go(active + 1)} aria-label="Sản phẩm tiếp theo" className="qs-hero-arrow">›</button>
            </span>
          </li>
          {s.specs.map(([k, v], i) => (
            <li
              key={k}
              className="qs-spec flex items-baseline justify-between gap-4 py-3.5 border-t border-[#2a2620] qs-rise"
              style={rise(420 + i * 90)}
            >
              <span className="qs-spec-k font-mono text-[10px] tracking-[.18em] uppercase text-[#8a8676]">{k}</span>
              <span className="qs-spec-v font-display text-[15px] font-medium text-white text-right">{v}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* SLIDE SELECTOR — datasheet tabs, active one carries the autoplay progress seam */}
      <div className="relative qs-wrap-wide pb-12 lg:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#221e18] border border-[#221e18]">
          {slides.map((slide, i) => (
            <button
              key={slide.name + i}
              type="button"
              onClick={() => go(i)}
              data-active={i === active ? "true" : undefined}
              aria-label={`Xem ${slide.name}`}
              aria-current={i === active ? "true" : undefined}
              className="qs-hero-tab group relative bg-ink overflow-hidden text-left px-5 py-4 flex items-center gap-4 transition-colors duration-300 hover:bg-[#141009]"
            >
              <span className="font-mono text-[11px] tabular-nums text-[#6b6453] group-data-[active=true]:text-gold-2 transition-colors">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[15px] font-semibold tracking-[-.01em] text-[#8a8676] group-data-[active=true]:text-white transition-colors truncate">
                  {slide.name}
                </span>
                <span className="block font-mono text-[9px] tracking-[.16em] uppercase text-[#5a554a] group-data-[active=true]:text-gold-1 transition-colors truncate">
                  {slide.tag}
                </span>
              </span>
              <span className="font-mono text-sm text-[#3a352c] group-data-[active=true]:text-gold-2 group-hover:translate-x-0.5 transition-all">→</span>
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
    </section>
  );
}
