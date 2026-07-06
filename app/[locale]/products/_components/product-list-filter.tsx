"use client";

import { useMemo, useState } from "react";
import { Link } from "@/lib/i18n/navigation";

/**
 * Filter metadata derived on the server for each product. `node` is the
 * pre-rendered (async server) `ProductBundleCard`, passed through the RSC
 * boundary so filtering/sorting happens client-side without re-rendering the
 * card itself.
 */
export type ProductFilterItem = {
  slug: string;
  axisNum: number;
  displayNum: number;
  /** Lowercased control interface string (e.g. "pulse train · ethercat"). */
  controlInterface: string;
  node: React.ReactNode;
};

type Labels = {
  filters: string[];
  sortOptions: string[];
  tree: string[];
  sidebarHeading: string;
  supportTitle: string;
  supportCta: string;
  showing: string;
  ofModels: string;
  sortLabel: string;
  emptyState: string;
};

// Chip index → predicate (0 = "all" = no filter). Chips 1..3 match the control
// interface declared by each product (Pulse Train / EtherCat / Mechatrolink).
function matchesChip(item: ProductFilterItem, chip: number): boolean {
  switch (chip) {
    case 1:
      return item.controlInterface.includes("pulse train");
    case 2:
      return item.controlInterface.includes("ethercat");
    case 3:
      return item.controlInterface.includes("mechatrolink");
    default:
      return true;
  }
}

export function ProductListFilter({ items, labels }: { items: ProductFilterItem[]; labels: Labels }) {
  const [chip, setChip] = useState(0);
  const [sort, setSort] = useState(0);
  // Machine-type filter rules aren't defined yet — category tracks selection
  // for the active UI state only, it doesn't narrow `visible` yet.
  const [category, setCategory] = useState<number | null>(null);
  // On mobile the category tree collapses into an accordion so it never buries
  // the product list; on desktop (md+) it's always expanded via CSS.
  const [treeOpen, setTreeOpen] = useState(false);

  const visible = useMemo(() => {
    const filtered = items.filter((it) => matchesChip(it, chip));
    const sorted = [...filtered];
    if (sort === 1) sorted.sort((a, b) => a.axisNum - b.axisNum);
    else if (sort === 2) sorted.sort((a, b) => a.displayNum - b.displayNum);
    return sorted;
  }, [items, chip, sort]);

  const count = String(visible.length).padStart(2, "0");

  return (
    <div className="flex flex-col gap-8 md:grid md:grid-cols-[240px_1fr] md:gap-x-16 md:gap-y-8 md:items-start">
      {/* category nav — collapses to an accordion on mobile, fixed left column on desktop */}
      <nav className="order-1 md:col-start-1 md:row-start-1">
        <button
          type="button"
          aria-expanded={treeOpen}
          aria-controls="category-tree"
          onClick={() => setTreeOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-3 border border-line bg-white px-4 py-3 md:px-0 md:py-0 md:pb-3.5 md:border-0 md:border-b md:border-ink md:bg-transparent md:pointer-events-none font-mono text-[11px] tracking-[.16em] uppercase text-ink cursor-pointer md:cursor-default"
        >
          {labels.sidebarHeading}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            className={`md:hidden text-muted transition-transform duration-200 ${treeOpen ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <ul id="category-tree" className={`list-none p-0 m-0 mt-2 md:mt-0 ${treeOpen ? "block" : "hidden"} md:block`}>
          {labels.tree.map((n, idx) => {
            const active = category === idx;
            return (
              <li key={n} className="border-b border-line">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(active ? null : idx)}
                  className={`w-full flex justify-between items-center py-3 text-sm font-medium text-left cursor-pointer bg-transparent border-0 ${active ? "text-gold-1" : "text-ink"}`}
                >
                  {n}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* support card — bottom of the stack on mobile, under the nav on desktop */}
      <aside className="order-3 md:col-start-1 md:row-start-2 bg-white border border-line p-5">
        <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-2">{labels.supportTitle}</div>
        <p className="m-0 text-[13px] text-muted leading-[1.6]">
          <a href="tel:+84909663350" className="hover:text-ink">(+84) 909.663.350</a>
          <br />
          <a href="mailto:support@qstcnc.com" className="hover:text-ink">support@qstcnc.com</a>
        </p>
        <Link className="qs-btn qs-btn-sm mt-3.5" href="/contact">{labels.supportCta}</Link>
      </aside>

      {/* list */}
      <main className="order-2 min-w-0 md:col-start-2 md:row-start-1 md:row-span-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center bg-white border border-line px-4 sm:px-6 py-4 mb-6">
          <div className="flex flex-col gap-3 min-w-0 sm:flex-row sm:gap-6 sm:items-center">
            <span className="font-mono text-xs tracking-widest text-muted shrink-0">{labels.showing} <b className="text-ink font-semibold">{count}</b> {labels.ofModels}</span>
            {/* chips: scroll horizontally on mobile so a long interface list never
                clips or pushes the sort control off-screen; wrap inline on desktop */}
            <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {labels.filters.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChip(i)}
                  className={`shrink-0 px-3 py-1.5 font-mono text-[11px] tracking-widest uppercase border cursor-pointer ${i === chip ? "bg-ink text-white border-ink" : "border-line text-muted hover:border-ink"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 items-center shrink-0">
            <span className="font-mono text-[11px] text-muted tracking-widest uppercase">{labels.sortLabel}</span>
            <select
              value={sort}
              onChange={(e) => setSort(Number(e.target.value))}
              className="font-mono text-[11px] tracking-[.08em] uppercase border border-line py-1.5 px-3 bg-white cursor-pointer"
            >
              {labels.sortOptions.map((o, i) => (<option key={o} value={i}>{o}</option>))}
            </select>
          </div>
        </div>

        {visible.length > 0 ? (
          <div className="flex flex-col gap-6">
            {visible.map((it) => (
              <div key={it.slug}>{it.node}</div>
            ))}
          </div>
        ) : (
          <p className="text-[15px] text-[#3a3a3a] leading-[1.7] m-0 py-12 text-center">{labels.emptyState}</p>
        )}
      </main>
    </div>
  );
}
