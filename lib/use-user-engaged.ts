"use client";

import { useSyncExternalStore } from "react";

/**
 * The gestures that close the browser's Largest Contentful Paint window. Chrome
 * stops nominating new LCP candidates at the first of these, so anything that
 * repaints a large element *before* one of them lands is measured as the page's
 * LCP — including a carousel that advanced on its own.
 */
const EVENTS = ["scroll", "pointerdown", "keydown", "wheel", "touchstart"] as const;

let engaged = false;
let attached = false;
const listeners = new Set<() => void>();

function attach(): void {
  if (attached || typeof window === "undefined") return;
  attached = true;
  const onFirst = () => {
    for (const type of EVENTS) window.removeEventListener(type, onFirst);
    engaged = true;
    for (const notify of listeners) notify();
  };
  for (const type of EVENTS) window.addEventListener(type, onFirst, { passive: true });
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  attach();
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): boolean {
  return engaged;
}

// The server can't know whether the visitor has acted yet, so it renders the
// not-yet-engaged branch; the store re-syncs on the client after hydration.
function getServerSnapshot(): boolean {
  return false;
}

/**
 * `true` once the visitor has scrolled, tapped, or typed — i.e. once the LCP
 * measurement window has closed. Gate auto-advancing media on this: a carousel
 * that rotates while the window is still open hands the metric to whichever
 * slide happens to paint last, at several seconds in, instead of the preloaded
 * first slide. State is module-level, so every carousel on the page flips at
 * the same gesture and each one only pays for a single set of listeners.
 */
export function useUserEngaged(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
