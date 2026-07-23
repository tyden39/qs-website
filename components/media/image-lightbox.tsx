"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { useZoomPan, type PanMetrics } from "@/lib/use-zoom-pan";

/** Fraction of the viewport the image fits into at rest — matches the CSS caps. */
const FIT_W = 0.82;
const FIT_H = 0.7;

/** Rest-scale on-screen size for an image, honouring its native resolution. */
function fitSize(iw: number, ih: number): { w: number; h: number } {
  const ratio = iw / ih;
  const w = Math.min(iw, window.innerWidth * FIT_W, window.innerHeight * FIT_H * ratio);
  return { w, h: w / ratio };
}

/** `w`/`h` are optional — shots that only carry a src are rendered fill-boxed. */
export type LightboxShot = { src: string; w?: number; h?: number; alt: string };
type Labels = {
  prev: string;
  next: string;
  close: string;
  zoomIn: string;
  zoomOut: string;
  zoomReset: string;
};

type LightboxCtx = { open: (group: LightboxShot[], index: number) => void };
const Ctx = createContext<LightboxCtx | null>(null);

/** Opens the shared lightbox. Safe to call from any client child of the provider. */
export function useLightbox(): LightboxCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLightbox must be used within <LightboxProvider>");
  return ctx;
}

/**
 * Full-screen image viewer, mounted once per locale layout so any page can zoom
 * an image that isn't already a link. Each trigger hands over its own group of
 * shots, so prev/next cycles only within that group (hero shots, feature grid,
 * bundle photos…). Keyboard: Esc / ← / →.
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

  const current = group?.[index];
  // Pan bounds live in a ref (no re-render): the image's rest size plus the
  // real visible container box, so pan can reach edges the header/padding hide.
  // The <img> is sized in CSS below, so it stays viewport-reactive without state.
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const metricsRef = useRef<PanMetrics | null>(null);
  const { view, isZoomed, reset, zoomBy, handlers } = useZoomPan(go, metricsRef);

  useEffect(() => {
    if (!current?.w || !current?.h) {
      metricsRef.current = null;
      return;
    }
    const measure = () => {
      const box = viewportRef.current;
      if (!box) return;
      const { w, h } = fitSize(current.w!, current.h!);
      metricsRef.current = {
        contentW: w,
        contentH: h,
        containerW: box.clientWidth,
        containerH: box.clientHeight,
      };
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [current?.src, current?.w, current?.h]);

  // Start every image at rest scale — including after prev/next.
  useEffect(() => reset(), [index, group, reset]);

  useEffect(() => {
    if (!group) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "+" || e.key === "=") zoomBy(1.5);
      else if (e.key === "-" || e.key === "_") zoomBy(1 / 1.5);
      else if (e.key === "0") reset();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [group, go, close, zoomBy, reset]);

  const navBtn =
    "grid h-12 w-12 place-items-center border border-white/25 text-white text-subhead leading-none hover:bg-white hover:text-ink transition-colors";

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
          <div
            className="flex items-center justify-between px-5 py-4 font-mono text-label tracking-[.16em] uppercase text-[#cfc9b8]"
            onClick={(e) => e.stopPropagation()}
          >
            <span>
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => zoomBy(1 / 1.5)}
                aria-label={labels.zoomOut}
                className={navBtn}
              >
                −
              </button>
              <button
                type="button"
                onClick={() => zoomBy(1.5)}
                aria-label={labels.zoomIn}
                className={navBtn}
              >
                +
              </button>
              {isZoomed && (
                <button
                  type="button"
                  onClick={reset}
                  aria-label={labels.zoomReset}
                  className={`${navBtn} w-auto px-3 text-label`}
                >
                  1:1
                </button>
              )}
              <button type="button" onClick={close} aria-label={labels.close} className={navBtn}>
                ✕
              </button>
            </div>
          </div>

          <div
            ref={viewportRef}
            className={`relative flex-1 flex items-center justify-center overflow-hidden touch-none select-none ${
              isZoomed ? "cursor-grab" : "cursor-zoom-in"
            }`}
            onClick={(e) => e.stopPropagation()}
            {...handlers}
          >
            {count > 1 && (
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={labels.prev}
                className={`absolute left-3 sm:left-6 top-1/2 z-10 -translate-y-1/2 ${navBtn}`}
              >
                ‹
              </button>
            )}

            <figure className="m-0">
              <div
                className="bg-paper border border-white/10 p-3 sm:p-4 shadow-[0_40px_100px_-30px_rgba(0,0,0,.9)] animate-[qs-rise_.35s_ease-out]"
                style={{
                  // Pan lives in `transform` (crisp); zoom grows the image's layout
                  // size (see CSS below) so the browser re-samples the source webp
                  // instead of stretching a downscaled bitmap. Fill shots have no
                  // intrinsic size, so they fall back to a transform scale.
                  transform: `translate(${view.x}px, ${view.y}px)${
                    current.w && current.h ? "" : ` scale(${view.scale})`
                  }`,
                  transformOrigin: "center center",
                  willChange: "transform",
                }}
              >
                {current.w && current.h ? (
                  <Image
                    key={current.src}
                    src={current.src}
                    alt={current.alt}
                    width={current.w}
                    height={current.h}
                    sizes="90vw"
                    draggable={false}
                    style={{
                      // Rest fit = native px capped to the viewport; × scale to zoom.
                      width: `calc(min(${current.w}px, ${FIT_W * 100}vw, ${
                        FIT_H * 100 * (current.w / current.h)
                      }dvh) * ${view.scale})`,
                      height: "auto",
                    }}
                    className="block object-contain"
                  />
                ) : (
                  // Shots without intrinsic dimensions fill a viewport-sized box instead.
                  <div className="relative h-[70dvh] w-[82vw]">
                    <Image
                      key={current.src}
                      src={current.src}
                      alt={current.alt}
                      fill
                      sizes="90vw"
                      draggable={false}
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            </figure>

            {count > 1 && (
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={labels.next}
                className={`absolute right-3 sm:right-6 top-1/2 z-10 -translate-y-1/2 ${navBtn}`}
              >
                ›
              </button>
            )}

            {/* Caption overlays the foot of the frame so it never shifts the
                image off-centre — which would skew the pan bounds. */}
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-8 text-center font-mono text-label tracking-[.14em] uppercase text-[#cfc9b8]">
              {current.alt}
            </figcaption>
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
  /** Omit to use the trigger as a transparent overlay above a `fill` image. */
  children?: ReactNode;
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
