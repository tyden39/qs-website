"use client";

import { useEffect } from "react";

/**
 * Replays a short "landing" animation on whichever rail card swipes into view.
 *
 * Only runs while the section is actually a rail — from `md` up every card is on
 * screen at once, so there is nothing to land and the observer is torn down. Purely
 * additive: cards render fully visible and the class is added after the fact, so
 * no-JS users and the md+ grid are unaffected (reduced motion is handled in CSS).
 *
 * Cards are marked with `data-rail-card` rather than observing the rail's direct
 * children: the children are `Reveal` wrappers carrying their own opacity/transform
 * transition, and animating the same properties on the same element would override
 * the scroll-reveal stagger.
 */
export default function RailLand({
  targetId,
  query = "(max-width: 767px)",
}: {
  targetId: string;
  /** Viewport range where the section renders as a rail. Defaults to below `md`. */
  query?: string;
}) {
  useEffect(() => {
    const rail = document.getElementById(targetId);
    if (!rail) return;

    const mq = window.matchMedia(query);
    let observer: IntersectionObserver | null = null;

    const stop = () => {
      observer?.disconnect();
      observer = null;
    };

    const start = () => {
      if (observer) return;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target as HTMLElement;
            // Drop and force a reflow so the animation restarts even if the previous
            // run has not finished — fast swipes otherwise leave the card static.
            el.classList.remove("qs-rail-land");
            void el.offsetWidth;
            el.classList.add("qs-rail-land");
          }
        },
        { root: rail, threshold: 0.6 },
      );
      for (const card of rail.querySelectorAll("[data-rail-card]")) observer.observe(card);
    };

    const apply = () => (mq.matches ? start() : stop());
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      stop();
    };
  }, [targetId, query]);

  return null;
}
