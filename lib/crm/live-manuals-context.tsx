"use client";

// Shares one ManualHub fetch across every client component on the Downloads
// page that needs it (the sidebar tree's live-merge, the hero's document
// count) instead of each doing its own useEffect+fetch — same data, same
// localStorage cache, one network round trip per page load.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { listPublicManuals, type PublicManual } from "@/lib/crm/manuals-client";

// This site is a static export (see next.config.mjs: `output: "export"`, no
// server runtime), so the fetch has to happen in the browser after mount —
// null until then, an array once resolved (possibly still empty on error).
const LiveManualsContext = createContext<PublicManual[] | null>(null);

// Client-side cache: this page has no server runtime to cache behind, and
// the listing rarely changes between visits, so a returning visitor gets
// the last-known documents instantly from localStorage while a fresh fetch
// quietly revalidates in the background — avoiding a "blank" flash on every
// repeat visit. Bumped in the key (not just cleared) so an old cache shape
// from a prior deploy is never handed to code that no longer expects it.
const MANUALS_CACHE_KEY = "qs:manuals-cache:v1";
const MANUALS_CACHE_TTL_MS = 30 * 60 * 1000;

function readManualsCache(): PublicManual[] | null {
  try {
    const raw = localStorage.getItem(MANUALS_CACHE_KEY);
    if (!raw) return null;
    const { fetchedAt, items } = JSON.parse(raw) as { fetchedAt: number; items: PublicManual[] };
    if (typeof fetchedAt !== "number" || Date.now() - fetchedAt > MANUALS_CACHE_TTL_MS) return null;
    return items;
  } catch {
    return null; // corrupt entry or storage disabled (private mode) — just refetch
  }
}

function writeManualsCache(items: PublicManual[]): void {
  try {
    localStorage.setItem(MANUALS_CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), items }));
  } catch {
    // storage full/disabled — cache is best-effort only, live fetch still works
  }
}

export function LiveManualsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PublicManual[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = readManualsCache();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only storage read, deferred past hydration by design
    if (cached) setItems(cached);
    listPublicManuals().then((result) => {
      if (!cancelled && result.ok) {
        setItems(result.items);
        writeManualsCache(result.items);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <LiveManualsContext.Provider value={items}>{children}</LiveManualsContext.Provider>;
}

/** Live ManualHub documents once loaded, `null` before the first fetch/cache
 *  read resolves — callers fall back to a static value while null. */
export function useLiveManuals(): PublicManual[] | null {
  return useContext(LiveManualsContext);
}
