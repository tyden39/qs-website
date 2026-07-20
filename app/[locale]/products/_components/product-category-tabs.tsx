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
 * accessories. Rendered as underline (nav-style) tabs — a shared rail runs the
 * width of the strip and the active tab carries a gold underscore that sits on
 * that rail, so the switch reads as top-level navigation and stays distinct
 * from the dark segmented filter row inside each panel.
 *
 * Inactive panels stay mounted but hidden so the controller tab's filter state
 * survives a round trip to another tab and back.
 */
export function ProductCategoryTabs({
  tabs,
  eyebrow,
}: {
  tabs: ProductCategoryTab[];
  /** Mono kicker above the strip that primes it as page-level navigation. */
  eyebrow?: string;
}) {
  const [active, setActive] = useState(0);
  const base = useId();

  return (
    <>
      {eyebrow ? (
        <div className="mb-2.5 font-mono text-[10px] tracking-[.18em] uppercase text-[#5a5650]">
          {eyebrow}
        </div>
      ) : null}
      <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0 mb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          role="tablist"
          aria-label={tabs.map((t) => t.label).join(" / ")}
          // `min-w-max` keeps the tabs from squeezing on a phone — the strip
          // scrolls instead; `w-full` stretches the shared rail past the last
          // tab so it spans the whole content column on desktop.
          className="flex w-full min-w-max border-b border-line"
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
                // `-mb-px` pulls the button's 2px underline over the rail's 1px
                // rule so the active gold underscore reads as one continuous line.
                className={`relative -mb-px min-h-11 flex items-center gap-3 pr-4 sm:pr-5 ${
                  i === 0 ? "pl-0" : "pl-4 sm:pl-5"
                } py-2.5 text-[13.5px] font-semibold tracking-[-.005em] whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? "border-b-gold-2 text-ink"
                    : "border-b-transparent text-[#5a5650] hover:text-ink"
                }`}
              >
                {/* Product render on its own light tile keeps the groups
                    scannable; the tile firms up under the active tab. */}
                <span
                  className={`grid place-items-center w-9 h-9 shrink-0 rounded-[2px] border transition-colors ${
                    isActive ? "border-line-2" : "border-line"
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
