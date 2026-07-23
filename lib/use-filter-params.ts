"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

/**
 * Catalogue filter state mirrored in the page URL, so a narrowed list can be
 * linked, bookmarked, and walked back with the browser's back button.
 *
 * Deliberately not next/navigation's `useSearchParams`: the catalogue pages are
 * statically generated, and reading search params during render opts the whole
 * client subtree out of static rendering — crawlers would receive an empty shell
 * where the product cards should be. Here the server snapshot is always empty,
 * so the prerendered HTML carries the full unfiltered catalogue and the URL is
 * applied once on hydration.
 *
 * The store is module-level so every list on a page reads one source of truth:
 * a choice made in one group panel is still in effect when another is revealed.
 */

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  // Back/forward moves between filter states, so the store follows popstate.
  if (listeners.size === 0) window.addEventListener("popstate", notify);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("popstate", notify);
  };
}

// The snapshot is a primitive, which React compares by value — re-reading the
// location every render is therefore both safe and always current.
const getSnapshot = () => window.location.search;
const getServerSnapshot = () => "";

/** The current filter query. Empty on the server and until hydration. */
export function useFilterParams(): URLSearchParams {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => new URLSearchParams(search), [search]);
}

/**
 * Merge `patch` into the URL query and re-render every subscriber. A null or
 * empty value drops its key, keeping default state out of the URL. Writes go
 * through `replaceState` so refining a list neither stacks a history entry per
 * keystroke nor scrolls the page back to the top.
 */
export function setFilterParams(patch: Record<string, string | null>) {
  const query = new URLSearchParams(window.location.search);
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === "") query.delete(key);
    else query.set(key, value);
  }
  const search = query.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`,
  );
  notify();
}

/**
 * Removes the pre-paint primer style (see `filter-prepaint.tsx`) once React has
 * hydrated and re-rendered from the URL. By mount time the client snapshot has
 * been applied, so the DOM already shows the filtered list and dropping the
 * style causes no flash — while leaving it in place would wrongly keep hiding
 * items after the user changes the filter client-side. Renders nothing.
 */
export function FilterPrePaintCleanup(): null {
  useEffect(() => {
    document.getElementById("qs-prefilter")?.remove();
  }, []);
  return null;
}

/**
 * Position of `value` in a table of query slugs, falling back to 0 — the
 * unfiltered default — for an absent or unrecognised value. Filters store slugs
 * rather than indices so a key shared by two toolbars keeps its meaning in each:
 * a slug one list does not offer simply reads as the default there.
 */
export function slugIndex(table: readonly (string | null)[], value: string | null): number {
  const index = table.indexOf(value);
  return index === -1 ? 0 : index;
}
