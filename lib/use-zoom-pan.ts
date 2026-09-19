"use client";

import { useCallback, useRef, useState, type RefObject } from "react";

/** Current transform of the viewed image. */
export type ZoomView = { scale: number; x: number; y: number };
/** Rest-scale image size + its visible container — together drive pan bounds. */
export type PanMetrics = {
  contentW: number;
  contentH: number;
  containerW: number;
  containerH: number;
};

const MIN = 1;
const MAX = 4;
/** Scale the double-tap / double-click jump lands on. */
const DOUBLE = 2.5;
const SWIPE_THRESHOLD = 48;
/** Max ms between taps to count as a double-tap. */
const DOUBLE_TAP_MS = 300;

type Point = { x: number; y: number };

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const clampScale = (s: number) => Math.max(MIN, Math.min(MAX, s));

/**
 * Pointer-driven zoom + pan for a viewport-filling image. One hook covers mouse
 * wheel, pinch, double-tap/click, and drag-to-pan, and — while at rest scale —
 * turns a horizontal drag into a `onSwipe` so neighbouring images stay reachable.
 * Translation is clamped so the zoomed image's edges stop at the container edge.
 *
 * `metricsRef` carries the image's rest-scale size and its visible container box;
 * clamping against the real container (not the whole window) lets pan reach the
 * top/bottom that a header or padding would otherwise hide.
 */
export function useZoomPan(
  onSwipe: (dir: 1 | -1) => void,
  metricsRef?: RefObject<PanMetrics | null>,
) {
  const [view, setView] = useState<ZoomView>({ scale: 1, x: 0, y: 0 });

  // Gesture bookkeeping — refs so mid-gesture updates never re-render.
  const pointers = useRef(new Map<number, Point>());
  const pinch = useRef<{ dist: number; scale: number } | null>(null);
  const swipeStart = useRef<Point | null>(null);
  const moved = useRef(false);
  const lastTap = useRef(0);

  const clamp = useCallback(
    (v: ZoomView): ZoomView => {
      if (v.scale <= 1) return { scale: v.scale, x: 0, y: 0 };
      const m = metricsRef?.current;
      const contentW = (m?.contentW ?? window.innerWidth) * v.scale;
      const contentH = (m?.contentH ?? window.innerHeight) * v.scale;
      const viewW = m?.containerW ?? window.innerWidth;
      const viewH = m?.containerH ?? window.innerHeight;
      // Image is centred in the container, so the reachable travel each way is
      // half the overflow past the container box.
      const maxX = Math.max(0, (contentW - viewW) / 2);
      const maxY = Math.max(0, (contentH - viewH) / 2);
      return {
        scale: v.scale,
        x: Math.max(-maxX, Math.min(maxX, v.x)),
        y: Math.max(-maxY, Math.min(maxY, v.y)),
      };
    },
    [metricsRef],
  );

  const reset = useCallback(() => setView({ scale: 1, x: 0, y: 0 }), []);

  /** Zoom to `next`, keeping the image point under (cx, cy) fixed on screen. */
  const zoomAt = useCallback(
    (next: number, cx: number, cy: number) =>
      setView((v) => {
        const scale = clampScale(next);
        const cX = window.innerWidth / 2;
        const cY = window.innerHeight / 2;
        // Image-space offset currently under the cursor, then re-anchor it.
        const ux = (cx - cX - v.x) / v.scale;
        const uy = (cy - cY - v.y) / v.scale;
        return clamp({ scale, x: cx - cX - scale * ux, y: cy - cY - scale * uy });
      }),
    [clamp],
  );

  /** Multiply the current scale from the centre — for the on-screen +/− buttons. */
  const zoomBy = useCallback(
    (factor: number) =>
      setView((v) => clamp({ scale: clampScale(v.scale * factor), x: v.x, y: v.y })),
    [clamp],
  );

  const toggleAt = useCallback(
    (cx: number, cy: number) =>
      setView((v) => {
        if (v.scale > 1) return { scale: 1, x: 0, y: 0 };
        const cX = window.innerWidth / 2;
        const cY = window.innerHeight / 2;
        const ux = (cx - cX) / 1;
        const uy = (cy - cY) / 1;
        return clamp({ scale: DOUBLE, x: cx - cX - DOUBLE * ux, y: cy - cY - DOUBLE * uy });
      }),
    [clamp],
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      setView((v) => {
        const scale = clampScale(v.scale * Math.exp(-e.deltaY * 0.0015));
        const cX = window.innerWidth / 2;
        const cY = window.innerHeight / 2;
        const ux = (e.clientX - cX - v.x) / v.scale;
        const uy = (e.clientY - cY - v.y) / v.scale;
        return clamp({ scale, x: e.clientX - cX - scale * ux, y: e.clientY - cY - scale * uy });
      });
    },
    [clamp],
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Leave the nav / close buttons to their own click handlers.
    if ((e.target as HTMLElement).closest("button")) return;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: dist(a, b), scale: 0 };
      swipeStart.current = null;
    } else if (pointers.current.size === 1) {
      swipeStart.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // Two fingers → pinch zoom around their midpoint.
      if (pointers.current.size >= 2) {
        const [a, b] = [...pointers.current.values()];
        const p = pinch.current;
        if (!p) return;
        if (p.scale === 0) p.scale = view.scale; // captured on first move to read live scale
        const m = mid(a, b);
        zoomAt((p.scale * dist(a, b)) / p.dist, m.x, m.y);
        moved.current = true;
        return;
      }

      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved.current = true;
      // One finger while zoomed → pan.
      if (view.scale > 1) {
        setView((v) => clamp({ scale: v.scale, x: v.x + dx, y: v.y + dy }));
      }
    },
    [view.scale, zoomAt, clamp],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      const start = swipeStart.current;
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) pinch.current = null;
      if (pointers.current.size > 0) return;

      // A clean, near-still touch release is a tap — watch for a double-tap to
      // zoom. Mouse gets this via the browser's own `dblclick` (onDoubleClick).
      if (!moved.current && e.pointerType !== "mouse") {
        const now = Date.now();
        if (now - lastTap.current < DOUBLE_TAP_MS) {
          toggleAt(e.clientX, e.clientY);
          lastTap.current = 0;
        } else {
          lastTap.current = now;
        }
      } else if (start && view.scale === 1) {
        // Horizontal drag at rest scale → navigate.
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) onSwipe(dx < 0 ? 1 : -1);
      }
      swipeStart.current = null;
    },
    [view.scale, onSwipe, toggleAt],
  );

  const handlers = {
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onDoubleClick: (e: React.MouseEvent) => toggleAt(e.clientX, e.clientY),
  };

  return { view, isZoomed: view.scale > 1, reset, zoomBy, handlers };
}
