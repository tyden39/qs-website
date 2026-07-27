"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLightbox } from "@/components/media/image-lightbox";
import { useHorizontalSwipe } from "@/lib/use-swipe";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export type HeroShot = { src: string; w: number; h: number; alt: string };

const AUTOPLAY_MS = 4000;

/**
 * Interactive hero gallery: a fixed-size "calibration frame" main viewer with a
 * thumbnail strip. Shots are stacked and cross-faded so the frame never resizes
 * when the image changes, and it auto-advances (pausing on hover / reduced
 * motion). Used for the product-name shots so the hero reads as a showcase
 * rather than a single static render.
 */
export function ProductHeroGallery({
  shots,
  name,
  calibrationLabel,
  zoomLabel,
}: {
  shots: HeroShot[];
  name: string;
  calibrationLabel: string;
  zoomLabel: string;
}) {
  const { open } = useLightbox();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();

  const autoplay = shots.length > 1 && !reduced;
  const swipe = useHorizontalSwipe((dir) => setActive((i) => (i + dir + shots.length) % shots.length));
  const swipeProps = shots.length > 1 ? swipe : {};

  useEffect(() => {
    if (!autoplay || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % shots.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [autoplay, shots.length, paused, active]);

  const current = shots[active] ?? shots[0];
  if (!current) return null;

  return (
    <figure
      className="m-0 relative bg-[#171812] border border-white/10 p-3 shadow-[0_34px_90px_-58px_rgba(0,0,0,.95)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* <div className="absolute inset-4 sm:inset-6 border border-dashed border-gold-2/25 pointer-events-none" />
      <div className="absolute top-4 left-5 font-mono text-label-xs tracking-[.18em] uppercase text-[#8f8878]">
        {calibrationLabel}
      </div> */}
      <div className="absolute bottom-2 right-2 z-10 font-mono text-label-xs tracking-[.18em] uppercase text-[#8f8878]">
        QS · {name.toUpperCase()}
      </div>

      <div className="relative h-[320px] sm:h-[380px] bg-paper border border-white/10" {...swipeProps}>
        {shots.map((s, i) => (
          <div
            key={s.src}
            aria-hidden={i !== active}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === active ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 90vw, 520px"
              className="object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,.18)]"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => open(shots, active)}
          aria-label={zoomLabel}
          className="absolute inset-0 z-[6] cursor-zoom-in"
        />
      </div>

      {autoplay && (
        <div className="relative mt-4 h-[3px] w-full overflow-hidden bg-white/10">
          <div
            key={active}
            data-paused={paused}
            style={{ ["--qs-autoplay" as string]: `${AUTOPLAY_MS}ms` }}
            className="qs-gallery-progress h-full w-full bg-gold-2"
          />
        </div>
      )}

      <figcaption className="relative mt-3 h-4 overflow-hidden text-center font-mono text-label-xs tracking-[.14em] uppercase text-[#8f8878]">
        <span className="block truncate">{current.alt}</span>
      </figcaption>

      {shots.length > 1 && (
        <div className="relative mt-4 flex gap-2 overflow-x-auto px-1 py-2">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={s.alt}
              aria-current={i === active}
              className={`grid h-16 w-16 shrink-0 place-items-center border bg-paper transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-2/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171812] ${
                i === active
                  ? "border-gold-2 ring-2 ring-gold-2/60 ring-offset-2 ring-offset-[#171812] shadow-[0_0_18px_-4px_rgba(232,200,120,.7)]"
                  : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/35"
              }`}
            >
              <Image
                src={s.src}
                alt=""
                width={s.w}
                height={s.h}
                sizes="64px"
                className="max-h-[52px] w-auto max-w-[52px] object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}
