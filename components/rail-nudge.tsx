"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronsRight, RotateCcw } from "lucide-react";

/**
 * Swipe affordance + position readout for a horizontal snap rail. Sits below the
 * rail — with full-width cards there is no peeking neighbour to imply the strip
 * scrolls, so the dots carry the position (and how much is left) while the label
 * plus drifting chevron carry the swipe cue. Reaching the last card flips the cue
 * into an explicit end state ("end of list · back to start"), so the rail never
 * feels like it silently stopped.
 *
 * Tapping advances one card; from the last card it wraps back to the first,
 * keeping a single control useful at every position instead of dead-ending at
 * the end of the rail. Purely an enhancement: the rail is swipeable (and
 * keyboard-scrollable) without it.
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
  const t = useTranslations("common");
  const [count, setCount] = useState(0);
  const [index, setIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const rail = document.getElementById(targetId);
    if (!rail) return;

    const measure = () => {
      // Direct children are the snap cards; skip display:none ones (e.g. the
      // grid-only summary tile on the applications rail).
      const cards = (Array.from(rail.children) as HTMLElement[]).filter(
        (c) => c.offsetWidth > 0,
      );
      setCount(cards.length);

      // 8px slack absorbs sub-pixel scroll positions so the last card still
      // counts as the end.
      const end = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8;
      setAtEnd(end);

      // Active card = the one whose left edge sits closest to the rail's left
      // edge (snap-start rails). At the end the rightmost card wins outright,
      // so the last dot lights even when several cards share the viewport.
      const railLeft = rail.getBoundingClientRect().left;
      let nearest = 0;
      let best = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.getBoundingClientRect().left - railLeft);
        if (d < best) {
          best = d;
          nearest = i;
        }
      });
      setIndex(end && cards.length > 0 ? cards.length - 1 : nearest);
    };

    measure();
    rail.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      rail.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [targetId]);

  const advance = () => {
    const rail = document.getElementById(targetId);
    if (!rail) return;
    const step = rail.clientWidth;
    const wrap = rail.scrollLeft + step >= rail.scrollWidth - 8;
    rail.scrollTo({ left: wrap ? 0 : rail.scrollLeft + step, behavior: "smooth" });
  };

  // A single card has nothing to swipe to — drop the cue entirely.
  if (count === 1) return null;

  return (
    <div className={`mt-2 flex flex-col items-center ${className}`}>
      {count > 1 && (
        <div className="flex items-center gap-2" aria-hidden="true">
          {Array.from({ length: count }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-gold-2" : "w-1.5 bg-ink/20"
              }`}
            />
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={advance}
        className="flex items-center justify-center gap-2 px-4 py-3
                   font-mono text-label tracking-[.16em] uppercase text-gold-1
                   transition-colors active:text-ink"
      >
        <span className="underline underline-offset-[6px] decoration-gold-2">
          {atEnd ? t("railEnd") : label}
        </span>
        {atEnd ? (
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
        ) : (
          <ChevronsRight className="qs-swipe-nudge h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
