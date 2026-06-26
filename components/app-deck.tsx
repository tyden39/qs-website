"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Link } from "@/lib/i18n/navigation";

type App = { slug: string; n: string; t: string; img: string; d: string };

const STRIP_H = "clamp(460px, 72vh, 640px)";
const INTERVAL = 4200; // ms each card stays open before auto-advancing

/**
 * Applications filmstrip — equal vertical slabs that expand one at a time.
 * The open panel widens to a cinematic still (full-colour image, gold scan-line,
 * content rising from the base) while the rest collapse to slim industrial spines.
 *
 * The open panel auto-advances on a timer; hovering any panel pauses the cycle and
 * focuses that panel. Reduced-motion users get a static first panel (no autoplay,
 * no progress). Width/opacity transitions live in globals.css (.qs-strip / .qs-panel).
 */
export default function AppDeck({ items }: { items: App[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animate, setAnimate] = useState(true);

  // Honour prefers-reduced-motion: no autoplay, no progress bar.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setAnimate(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Auto-advance the open card; pause while the strip is hovered.
  useEffect(() => {
    if (!animate || paused) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % items.length);
    }, INTERVAL);
    return () => window.clearInterval(id);
  }, [animate, paused, items.length]);

  return (
    <div
      className="qs-strip hidden md:flex w-full"
      style={{ height: STRIP_H }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((a, i) => (
        <Link
          key={a.slug}
          href={`/applications/${a.slug}`}
          data-open={i === active ? "true" : undefined}
          onMouseEnter={() => setActive(i)}
          className="qs-panel group relative block overflow-hidden rounded-[6px] bg-ink-2"
        >
          {/* Image */}
          <Image
            src={a.img}
            alt={a.t}
            fill
            sizes="(max-width:1280px) 60vw, 46vw"
            className="qs-shot object-cover"
          />
          {/* Base darkening so type always reads */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(0deg,rgba(10,10,8,.94) 4%,rgba(10,10,8,.34) 46%,rgba(10,10,8,.12) 100%)" }}
          />

          {/* Gold scan-line — only meaningful once the panel is open */}
          <div className="qs-open pointer-events-none absolute inset-x-0 top-0 h-[2px] qs-scan" />

          {/* Decorative frame + corner ticks */}
          <div className="pointer-events-none absolute inset-4 border border-white/12 transition-colors duration-500 group-hover:border-gold-2/55">
            <span className="absolute -top-px -left-px w-3.5 h-3.5 border-t border-l border-gold-2" />
            <span className="absolute -top-px -right-px w-3.5 h-3.5 border-t border-r border-gold-2" />
            <span className="absolute -bottom-px -left-px w-3.5 h-3.5 border-b border-l border-gold-2" />
            <span className="absolute -bottom-px -right-px w-3.5 h-3.5 border-b border-r border-gold-2" />
          </div>

          {/* COLLAPSED state — sideways spine: big index up top, vertical title */}
          <div className="qs-spine pointer-events-none absolute inset-0 p-6">
            <span className="font-mono text-[11px] text-gold-2 tracking-[.24em] uppercase">{a.n}</span>
            <div className="absolute bottom-7 left-1/2 -translate-x-1/2">
              <span
                className="block whitespace-nowrap font-display font-semibold text-white/92 text-[32px] tracking-tight"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                {a.t}
              </span>
            </div>
          </div>

          {/* OPEN state — full content block */}
          <div className="qs-open absolute inset-0 flex flex-col justify-end p-8 lg:p-10">
            <span className="font-mono text-[11px] text-gold-2 tracking-[.22em] uppercase">
              Ứng dụng · {a.n}
            </span>
            <h4 className="font-display font-semibold text-white text-[28px] lg:text-[34px] leading-[1.05] tracking-tight mt-3 max-w-[20ch]">
              {a.t}
            </h4>
            <p className="text-[#d2ccba] text-[15px] leading-[1.65] mt-4 max-w-[46ch]">{a.d}</p>
            <span className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] tracking-[.16em] uppercase text-gold-2">
              <span className="qs-live-dot" />
              Xem chi tiết →
            </span>
            {/* auto-advance progress — restarts each time this panel becomes active */}
            {animate && !paused && i === active && (
              <div key={active} className="mt-5 h-[2px] w-full max-w-[46ch] bg-white/15 overflow-hidden rounded-full">
                <div className="h-full bg-gold-2" style={{ animation: `qs-progress ${INTERVAL}ms linear forwards` }} />
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
