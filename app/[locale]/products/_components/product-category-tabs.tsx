"use client";

import Image from "next/image";
import { useId, useState } from "react";

/**
 * A catalogue group. `node` is the pre-rendered (async server) list for that
 * group, passed through the RSC boundary so switching tabs is a pure
 * client-side toggle and no list re-renders on the server.
 */
export type ProductCategoryTab = {
  id: string;
  label: string;
  count: number;
  /** Representative product render shown as the tab's thumbnail. */
  thumb: { src: string; w: number; h: number };
  node: React.ReactNode;
};

/**
 * Top-level catalogue switch: CNC controllers / DNC transfer units /
 * accessories. Rendered as the same boxed segmented control the product detail
 * page uses, so the two tab strips read as one system — with a product
 * thumbnail ahead of each label to make the groups scannable.
 *
 * Inactive panels stay mounted but hidden so the controller tab's filter state
 * survives a round trip to another tab and back.
 */
export function ProductCategoryTabs({ tabs }: { tabs: ProductCategoryTab[] }) {
  const [active, setActive] = useState(0);
  const base = useId();

  return (
    <>
      <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0 mb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          role="tablist"
          aria-label={tabs.map((t) => t.label).join(" / ")}
          // `min-w-max` keeps the strip from squeezing the tabs on a phone —
          // it scrolls instead; `w-full` stretches the box past the last tab so
          // the border spans the whole content column on desktop.
          className="flex w-full min-w-max bg-white border border-line shadow-[0_12px_34px_-28px_rgba(20,17,10,.45)]"
        >
          {tabs.map((tab, i) => {
            const isActive = i === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${base}-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`${base}-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  e.preventDefault();
                  const next = (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
                  setActive(next);
                  document.getElementById(`${base}-tab-${tabs[next].id}`)?.focus();
                }}
                className={`relative min-h-11 flex items-center gap-3 px-4 sm:px-5 py-2.5 text-[13.5px] font-semibold tracking-[-.005em] whitespace-nowrap border-t-2 transition-colors cursor-pointer ${
                  i > 0 ? "border-l border-l-line" : ""
                } ${
                  // The strip runs full width, so the last tab needs a closing
                  // rule against the empty space that follows it.
                  i === tabs.length - 1 ? "border-r border-r-line" : ""
                } ${
                  isActive
                    ? "bg-[#11120f] text-white border-t-gold-2"
                    : "border-t-transparent text-[#5a5650] hover:text-ink hover:bg-paper"
                }`}
              >
                {/* Thumbnail sits on its own light tile so the render stays
                    legible against the dark active state. */}
                <span
                  className={`grid place-items-center w-9 h-9 shrink-0 rounded-[2px] border transition-colors ${
                    isActive ? "border-white/15" : "border-line"
                  }`}
                  style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}
                >
                  <Image
                    src={tab.thumb.src}
                    alt=""
                    aria-hidden
                    width={tab.thumb.w}
                    height={tab.thumb.h}
                    sizes="36px"
                    className="max-w-[28px] max-h-[28px] w-auto h-auto object-contain"
                  />
                </span>
                {tab.label}
                <span
                  className={`font-mono text-[10px] tabular-nums ${
                    isActive ? "text-gold-2" : "text-line-2"
                  }`}
                >
                  {String(tab.count).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${base}-panel-${tab.id}`}
          aria-labelledby={`${base}-tab-${tab.id}`}
          hidden={i !== active}
        >
          {tab.node}
        </div>
      ))}
    </>
  );
}
