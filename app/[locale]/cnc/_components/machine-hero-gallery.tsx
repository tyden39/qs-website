"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useHorizontalSwipe } from "@/lib/use-swipe";

export type MachineHeroGalleryShot = { src: string; w: number; h: number; alt: string };

const AUTOPLAY_MS = 4000;

/**
 * Hero slideshow for the CNC datasheet detail page — the light counterpart of
 * the product page's dark `ProductHeroGallery`. Keeps the datasheet frame
 * (white plate, corner registration ticks, model / axes footer) but cross-fades
 * through the machine's studio shots, auto-advancing (pausing on hover / reduced
 * motion) with a thumbnail strip and click-to-zoom.
 */
export function MachineHeroGallery({
  shots,
  model,
  footerRight,
  zoomLabel,
  closeLabel,
}: {
  shots: MachineHeroGalleryShot[];
  model: string;
  footerRight: string;
  zoomLabel: string;
  closeLabel: string;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  const autoplay = shots.length > 1 && !reduced && !zoomed;

  useEffect(() => {
    if (!autoplay || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % shots.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [autoplay, shots.length, paused, active]);

  const go = useCallback(
    (dir: number) => setActive((i) => (i + dir + shots.length) % shots.length),
    [shots.length],
  );
  const swipe = useHorizontalSwipe(go);
  const swipeProps = shots.length > 1 ? swipe : {};

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [zoomed, go]);

  const current = shots[active] ?? shots[0];
  if (!current) return null;

  return (
    <div
      className="relative border border-line bg-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[380px] sm:h-[460px] lg:h-[560px] w-full overflow-hidden bg-white" {...swipeProps}>
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
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-contain p-6 lg:p-10"
              priority={i === 0}
            />
          </div>
        ))}

        {/* zoom trigger sits under the corner ticks / progress bar */}
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={zoomLabel}
          className="absolute inset-0 z-[6] cursor-zoom-in"
        />

        {/* corner registration ticks */}
        <div className="pointer-events-none absolute inset-3 z-[7]" aria-hidden="true">
          <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-gold-1/50"></span>
          <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-gold-1/50"></span>
          <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-gold-1/50"></span>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-gold-1/50"></span>
        </div>

        {autoplay && (
          <div className="absolute bottom-0 inset-x-0 z-[7] h-[3px] overflow-hidden bg-line/60">
            <div
              key={active}
              data-paused={paused}
              style={{ ["--qs-autoplay" as string]: `${AUTOPLAY_MS}ms` }}
              className="qs-gallery-progress h-full w-full bg-gold-1"
            />
          </div>
        )}
      </div>

      {shots.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-t border-line px-3 py-3">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={s.alt}
              aria-current={i === active}
              className={`grid h-16 w-16 shrink-0 place-items-center border bg-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-1/70 ${
                i === active
                  ? "border-gold-1 ring-1 ring-gold-1/50"
                  : "border-line opacity-70 hover:opacity-100 hover:border-ink/35"
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

      <div className="px-5 py-3 border-t border-line flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[.16em] uppercase text-muted truncate">{current.alt}</span>
        <span className="font-mono text-[11px] tracking-[.16em] uppercase text-gold-1 shrink-0 pl-3">{footerRight}</span>
      </div>

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex flex-col bg-black/92 backdrop-blur-sm"
          onClick={() => setZoomed(false)}
        >
          <div className="flex items-center justify-between px-5 py-4 font-mono text-[11px] tracking-[.16em] uppercase text-[#cfc9b8]">
            <span>
              {String(active + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => setZoomed(false)}
              aria-label={closeLabel}
              className="grid h-12 w-12 place-items-center border border-white/25 text-white text-2xl leading-none hover:bg-white hover:text-ink transition-colors"
            >
              ✕
            </button>
          </div>
          <div
            className="relative flex-1 flex items-center justify-center px-4 pb-6"
            onClick={(e) => e.stopPropagation()}
            {...swipeProps}
          >
            <figure className="m-0 flex flex-col items-center gap-4 max-w-full">
              <div className="bg-white border border-white/10 p-3 sm:p-4 shadow-[0_40px_100px_-30px_rgba(0,0,0,.9)]">
                <Image
                  key={current.src}
                  src={current.src}
                  alt={current.alt}
                  width={current.w}
                  height={current.h}
                  sizes="90vw"
                  className="h-auto w-auto max-h-[74vh] max-w-[82vw] object-contain"
                />
              </div>
              <figcaption className="text-center font-mono text-[11px] tracking-[.14em] uppercase text-[#8f8878]">
                {model} · {current.alt}
              </figcaption>
            </figure>
          </div>
        </div>
      )}
    </div>
  );
}
