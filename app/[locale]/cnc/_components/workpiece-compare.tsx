"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

/**
 * Before/after drag-to-reveal comparison. The "after" photo sits underneath; the
 * "before" layer is clipped from the right by a draggable divider. As a mockup the
 * two layers share one source image — the "before" side is CSS-treated to read like
 * unfinished raw stock (desaturated, cooler, matte) and the divider wipes to the
 * finished colour photo. Swap `beforeImg`/`afterImg` to real workpiece photos later:
 * the interaction is identical.
 *
 * Pointer-driven with a keyboard-accessible slider role (arrow keys nudge the wipe).
 */
export default function WorkpieceCompare({
  img,
  alt,
  beforeLabel,
  afterLabel,
  hint,
}: {
  img: string;
  alt: string;
  beforeLabel: string;
  afterLabel: string;
  hint: string;
}) {
  const [pos, setPos] = useState(50); // reveal position, 0–100 (% from left)
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const setFromClientX = useCallback((clientX: number) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
    else if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
    else if (e.key === "Home") setPos(0);
    else if (e.key === "End") setPos(100);
  };

  return (
    <div
      ref={frameRef}
      className="group relative aspect-[3/2] overflow-hidden border border-[#2a2620] bg-ink-2 select-none touch-none cursor-ew-resize"
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setDragging(true);
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => dragging && setFromClientX(e.clientX)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      {/* AFTER — finished part, full colour (base layer) */}
      <Image
        src={img}
        alt={alt}
        fill
        sizes="(max-width:1024px) 100vw, 60vw"
        className="object-cover"
      />
      <span className="pointer-events-none absolute top-3 right-3 z-10 font-mono text-[10px] tracking-[.16em] uppercase text-ink bg-gold-2/95 px-2 py-1">
        {afterLabel}
      </span>

      {/* BEFORE — raw stock, clipped from the right by the divider */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        aria-hidden="true"
      >
        <Image
          src={img}
          alt=""
          fill
          sizes="(max-width:1024px) 100vw, 60vw"
          className="object-cover"
          style={{ filter: "grayscale(1) contrast(1.06) brightness(.82)" }}
        />
        {/* cool matte cast so the raw side reads as unmachined billet */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(30,40,55,.34),rgba(12,16,22,.5))", mixBlendMode: "multiply" }}></div>
      </div>
      <span
        className="pointer-events-none absolute top-3 left-3 z-10 font-mono text-[10px] tracking-[.16em] uppercase text-[#e8e6df] bg-ink/80 border border-white/15 px-2 py-1"
        style={{ opacity: pos > 12 ? 1 : 0, transition: "opacity .2s" }}
      >
        {beforeLabel}
      </span>

      {/* registration frame — cohesive with the annotated hero figure */}
      <div className="pointer-events-none absolute inset-3 border border-white/10 z-10">
        <span className="absolute -top-px -left-px w-3.5 h-3.5 border-t border-l border-gold-2"></span>
        <span className="absolute -top-px -right-px w-3.5 h-3.5 border-t border-r border-gold-2"></span>
        <span className="absolute -bottom-px -left-px w-3.5 h-3.5 border-b border-l border-gold-2"></span>
        <span className="absolute -bottom-px -right-px w-3.5 h-3.5 border-b border-r border-gold-2"></span>
      </div>

      {/* divider + knob */}
      <div className="absolute inset-y-0 z-20 w-px bg-gold-2/90" style={{ left: `${pos}%` }} aria-hidden="true">
        <span className="absolute inset-y-0 -left-2 w-4"></span>
      </div>
      <button
        type="button"
        role="slider"
        aria-label={hint}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={onKeyDown}
        className="absolute top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-ink/80 border border-gold-2 backdrop-blur-[2px] text-gold-2 cursor-ew-resize focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-2"
        style={{ left: `${pos}%` }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
        </svg>
      </button>

      {/* hint pill — fades once the user starts dragging */}
      <span
        className="pointer-events-none absolute left-1/2 bottom-3 z-20 -translate-x-1/2 font-mono text-[10px] tracking-[.16em] uppercase text-[#e8e6df] bg-ink/70 border border-white/15 px-2.5 py-1"
        style={{ opacity: dragging ? 0 : 1, transition: "opacity .3s" }}
      >
        {hint}
      </span>
    </div>
  );
}
