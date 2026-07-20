"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { useHorizontalSwipe } from "@/lib/use-swipe";

export type LightboxShot = { src: string; w: number; h: number; alt: string };
type Labels = { prev: string; next: string; close: string };

type LightboxCtx = { open: (group: LightboxShot[], index: number) => void };
const Ctx = createContext<LightboxCtx | null>(null);

/** Opens the shared lightbox. Safe to call from any client child of the provider. */
export function useLightbox(): LightboxCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLightbox must be used within <LightboxProvider>");
  return ctx;
}

/**
 * Full-screen image viewer shared across the product detail page. Each trigger
 * hands over its own group of shots, so prev/next cycles only within that group
 * (hero product shots, overview tour, bundle photos…). Keyboard: Esc / ← / →.
 */
export function LightboxProvider({ labels, children }: { labels: Labels; children: ReactNode }) {
  const [group, setGroup] = useState<LightboxShot[] | null>(null);
  const [index, setIndex] = useState(0);

  const open = useCallback((shots: LightboxShot[], i: number) => {
    if (shots.length === 0) return;
    setGroup(shots);
    setIndex(Math.max(0, Math.min(i, shots.length - 1)));
  }, []);
  const close = useCallback(() => setGroup(null), []);

  const count = group?.length ?? 0;
  const go = useCallback(
    (dir: number) => setIndex((i) => (count ? (i + dir + count) % count : 0)),
    [count],
  );
  const swipe = useHorizontalSwipe(go);

  useEffect(() => {
    if (!group) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
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
  }, [group, go, close]);

  const current = group?.[index];
  const navBtn =
    "grid h-12 w-12 place-items-center border border-white/25 text-white text-2xl leading-none hover:bg-white hover:text-ink transition-colors";

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {group && current && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex flex-col bg-black/92 backdrop-blur-sm"
          onClick={close}
        >
          <div className="flex items-center justify-between px-5 py-4 font-mono text-[11px] tracking-[.16em] uppercase text-[#cfc9b8]">
            <span>
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <button type="button" onClick={close} aria-label={labels.close} className={navBtn}>
              ✕
            </button>
          </div>

          <div
            className="relative flex-1 flex items-center justify-center px-4 pb-6"
            onClick={(e) => e.stopPropagation()}
            {...(count > 1 ? swipe : {})}
          >
            {count > 1 && (
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={labels.prev}
                className={`absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 ${navBtn}`}
              >
                ‹
              </button>
            )}

            <figure className="m-0 flex flex-col items-center gap-4 max-w-full">
              <div className="bg-paper border border-white/10 p-3 sm:p-4 shadow-[0_40px_100px_-30px_rgba(0,0,0,.9)] animate-[qs-rise_.35s_ease-out]">
                <Image
                  key={current.src}
                  src={current.src}
                  alt={current.alt}
                  width={current.w}
                  height={current.h}
                  sizes="90vw"
                  className="h-auto w-auto max-h-[70vh] max-w-[82vw] object-contain"
                />
              </div>
              <figcaption className="text-center font-mono text-[11px] tracking-[.14em] uppercase text-[#8f8878] max-w-[70ch]">
                {current.alt}
              </figcaption>
            </figure>

            {count > 1 && (
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={labels.next}
                className={`absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 ${navBtn}`}
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

/** Wraps arbitrary content in a zoom-in button that opens its group in the lightbox. */
export function LightboxTrigger({
  group,
  index,
  ariaLabel,
  className,
  children,
}: {
  group: LightboxShot[];
  index: number;
  ariaLabel: string;
  className?: string;
  children: ReactNode;
}) {
  const { open } = useLightbox();
  return (
    <button
      type="button"
      onClick={() => open(group, index)}
      aria-label={ariaLabel}
      className={`cursor-zoom-in ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
