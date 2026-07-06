"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";

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
  const stripRef = useRef<HTMLDivElement>(null);
  const idsKey = tabs.map((t) => t.id).join(",");

  useEffect(() => {
    const ids = new Set(idsKey.split(","));
    const scrollToStrip = () => {
      const el = stripRef.current;
      if (!el) return;
      // Sticky site header is 72px on desktop / 64px on mobile — clear it.
      const offset = window.innerWidth >= 1024 ? 72 : 64;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    };
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
  }, [idsKey]);

  const selectTab = (id: string) => {
    setActive(id);
    // Keep the URL shareable without a scroll jump (replaceState won't fire
    // hashchange, so this stays a manual, in-place tab switch).
    if (window.location.hash.slice(1) !== id) {
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <>
      <section className="bg-[#f7f5ef]/95 border-b border-line sticky top-16 lg:top-[72px] z-30 backdrop-blur-md">
        <div ref={stripRef} className="max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-14 py-3 overflow-x-auto">
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
                  className={`relative min-h-11 px-5 sm:px-6 py-3 text-[13.5px] font-semibold tracking-[-.005em] whitespace-nowrap border-t-2 transition-colors cursor-pointer ${
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
