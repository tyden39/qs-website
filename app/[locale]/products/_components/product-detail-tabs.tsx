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
      <section className="bg-white border-b border-line sticky top-[72px] z-30">
        <div className="max-w-wrap mx-auto px-12 py-3 overflow-x-auto">
          <div role="tablist" className="inline-flex bg-paper border border-line">
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
                  className={`relative px-6 py-3 text-[13.5px] font-semibold tracking-[-.005em] whitespace-nowrap border-t-2 transition-colors ${
                    i > 0 ? "border-l border-l-line" : ""
                  } ${
                    isActive
                      ? "bg-white text-ink border-t-gold-2"
                      : "border-t-transparent text-[#5a5650] hover:text-ink hover:bg-white/60"
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
