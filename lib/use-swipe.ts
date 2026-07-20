"use client";

import { useRef } from "react";

/**
 * Horizontal swipe detection for touch surfaces (carousels, lightboxes).
 * Fires `onSwipe(1)` for a leftward swipe (advance) and `onSwipe(-1)` for a
 * rightward one, only when the gesture is mostly horizontal and travels past
 * `threshold` px — vertical page scrolling is left untouched.
 */
export function useHorizontalSwipe(onSwipe: (dir: 1 | -1) => void, threshold = 48) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (!start.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy)) onSwipe(dx < 0 ? 1 : -1);
    },
  };
}
