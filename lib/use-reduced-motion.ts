"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia?.(QUERY).matches ?? false;
}

// The server can't know the visitor's preference, so it renders the motion-on
// branch; the store re-syncs on the client right after hydration.
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Reactive `prefers-reduced-motion` without a set-state-in-effect. Reading an
 * external browser value through `useSyncExternalStore` keeps the reduced-motion
 * flag in sync (including live OS changes) and satisfies the React Compiler
 * rules that flag synchronous `setState` inside effects.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
