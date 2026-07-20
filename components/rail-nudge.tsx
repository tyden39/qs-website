"use client";

import { ChevronsRight } from "lucide-react";

/**
 * Swipe affordance for a horizontal snap rail. Sits below the rail as a text label with a
 * drifting chevron — with full-width cards there is no peeking neighbour to imply the strip
 * scrolls, so the wording plus the rightward motion carry the cue.
 *
 * Tapping advances one card; from the last card it wraps back to the first, keeping a
 * single control useful at every position instead of dead-ending at the end of the rail.
 * Purely an enhancement: the rail is swipeable (and keyboard-scrollable) without it.
 */
export default function RailNudge({
  targetId,
  label,
  className = "",
}: {
  targetId: string;
  label: string;
  className?: string;
}) {
  const advance = () => {
    const rail = document.getElementById(targetId);
    if (!rail) return;
    const step = rail.clientWidth;
    // 8px slack absorbs sub-pixel scroll positions so the last card still counts as the end.
    const atEnd = rail.scrollLeft + step >= rail.scrollWidth - 8;
    rail.scrollTo({ left: atEnd ? 0 : rail.scrollLeft + step, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={advance}
      className={`mt-2 mx-auto flex items-center justify-center gap-2 px-4 py-3
                  font-mono text-[11px] tracking-[.16em] uppercase text-gold-1
                  transition-colors active:text-ink ${className}`}
    >
      <span className="underline underline-offset-[6px] decoration-gold-2">{label}</span>
      <ChevronsRight className="qs-swipe-nudge h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
    </button>
  );
}
