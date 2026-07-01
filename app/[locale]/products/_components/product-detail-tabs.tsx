"use client";

import { useState, type ReactNode } from "react";

export type ProductDetailTab = {
  /** Stable key + used for aria wiring. */
  id: string;
  label: string;
  content: ReactNode;
};

/**
 * Switchable product-detail tabs rendered as a boxed segmented control so the
 * strip reads as navigation — visually distinct from the numbered data grids
 * (e.g. "Full Package") lower on the page. Only the active panel is shown; the
 * rest stay mounted-but-hidden so server-rendered images aren't re-fetched.
 */
export function ProductDetailTabs({ tabs }: { tabs: ProductDetailTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  return (
    <>
      <section className="bg-[#f7f5ef]/95 border-b border-line sticky top-[72px] z-30 backdrop-blur-md">
        <div className="max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-14 py-3 overflow-x-auto">
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
                  onClick={() => setActive(tab.id)}
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
