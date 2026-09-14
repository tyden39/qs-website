"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";

/** Sticky site header height — 72px on desktop, 64px on mobile. */
const headerOffset = () => (window.innerWidth >= 1024 ? 72 : 64);

export type ProductDetailTab = {
  /** Stable key + used for aria wiring and the URL hash (e.g. `#resources`). */
  id: string;
  label: string;
  content: ReactNode;
};

/**
 * Switchable product-detail tabs rendered as a boxed segmented control so the
 * strip reads as navigation — visually distinct from the numbered data grids
 * (e.g. "Full Package") lower on the page. Only the active panel is shown; the
 * rest stay mounted-but-hidden so server-rendered images aren't re-fetched.
 *
 * Each tab is addressable by URL hash (`#overview`, `#specs`, `#resources`), so
 * links elsewhere on the page can open a specific tab. Arriving at (or changing
 * to) a matching hash activates that tab and scrolls the strip into view under
 * the sticky site header.
 */
export function ProductDetailTabs({ tabs }: { tabs: ProductDetailTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  // Zero-height marker rendered just above the strip. The strip itself is
  // `sticky`, so once pinned its own rect reports the pinned position, not the
  // one it occupies in the document — the marker is what stays put.
  const anchorRef = useRef<HTMLDivElement>(null);
  const idsKey = tabs.map((t) => t.id).join(",");

  /** Document scroll position that parks the strip right under the header. */
  const stripScrollTop = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return null;
    return el.getBoundingClientRect().top + window.scrollY - headerOffset();
  }, []);

  const scrollToStrip = useCallback(() => {
    const top = stripScrollTop();
    if (top !== null) window.scrollTo({ top, behavior: "smooth" });
  }, [stripScrollTop]);

  useEffect(() => {
    const ids = new Set(idsKey.split(","));
    const applyHash = (scroll: boolean) => {
      const hash = window.location.hash.slice(1);
      if (ids.has(hash)) {
        setActive(hash);
        if (scroll) scrollToStrip();
      }
    };
    // On load, honor a deep-link hash (and pull it into view).
    applyHash(true);
    // In-page anchors (e.g. the hero "All downloads" link) fire hashchange.
    const onHashChange = () => applyHash(true);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [idsKey, scrollToStrip]);

  const selectTab = (id: string) => {
    setActive(id);
    // Re-anchor only when the page is scrolled past the strip's own position —
    // i.e. the strip is pinned and the reader is down inside the panel. Above
    // that point the panel top is already in view, so a scroll would just yank.
    const top = stripScrollTop();
    if (top !== null && window.scrollY > top) {
      window.scrollTo({ top, behavior: "smooth" });
    }
    // Keep the URL shareable without a scroll jump (replaceState won't fire
    // hashchange, so this stays a manual, in-place tab switch).
    if (window.location.hash.slice(1) !== id) {
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <>
      <div ref={anchorRef} aria-hidden className="h-0" />
      <section className="bg-[#f7f5ef]/95 border-b border-line sticky top-16 lg:top-[72px] z-30 backdrop-blur-md">
        <div className="qs-wrap-detail py-3 overflow-x-auto">
          <div role="tablist" className="inline-flex bg-white border border-line shadow-[0_12px_34px_-28px_rgba(20,17,10,.45)]">
            {tabs.map((tab, i) => {
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => selectTab(tab.id)}
                  className={`relative min-h-11 px-5 sm:px-6 py-3 text-meta font-semibold tracking-[-.005em] whitespace-nowrap border-t-2 transition-colors cursor-pointer ${
                    i > 0 ? "border-l border-l-line" : ""
                  } ${
                    isActive
                      ? "bg-[#11120f] text-white border-t-gold-2"
                      : "border-t-transparent text-[#5a5650] hover:text-ink hover:bg-paper"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={active !== tab.id}
        >
          {tab.content}
        </div>
      ))}
    </>
  );
}
