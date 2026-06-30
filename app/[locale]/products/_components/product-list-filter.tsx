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
  series: "F" | "Astro";
  axisNum: number;
  displayNum: number;
  isTouch: boolean;
  node: React.ReactNode;
};

type Labels = {
  filters: string[];
  sortOptions: string[];
  tree: string[];
  axes: string[];
  sidebarHeading: string;
  supportTitle: string;
  supportCta: string;
  showing: string;
  ofModels: string;
  sortLabel: string;
  emptyState: string;
};

// Chip index → predicate (0 = "standard set" = no filter).
function matchesChip(item: ProductFilterItem, chip: number): boolean {
  switch (chip) {
    case 1:
      return item.series === "F";
    case 2:
      return item.series === "Astro";
    case 3:
      return item.isTouch;
    default:
      return true;
  }
}

// Sidebar axis labels are ordered "3 trục".."6 trục" → axis count 3..6.
const AXIS_VALUES = [3, 4, 5, 6];

export function ProductListFilter({ items, labels }: { items: ProductFilterItem[]; labels: Labels }) {
  const [chip, setChip] = useState(0);
  const [axis, setAxis] = useState<number | null>(null);
  const [sort, setSort] = useState(0);
  const [openTree, setOpenTree] = useState<number | null>(0);

  const visible = useMemo(() => {
    const filtered = items.filter(
      (it) => matchesChip(it, chip) && (axis === null || it.axisNum === axis),
    );
    const sorted = [...filtered];
    if (sort === 1) sorted.sort((a, b) => a.axisNum - b.axisNum);
    else if (sort === 2) sorted.sort((a, b) => a.displayNum - b.displayNum);
    return sorted;
  }, [items, chip, axis, sort]);

  const count = String(visible.length).padStart(2, "0");

  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-16">
      {/* sidebar */}
      <aside>
        <h4 className="font-mono text-[11px] tracking-[.16em] uppercase text-ink m-0 mb-4 pb-3.5 border-b border-ink">{labels.sidebarHeading}</h4>
        <ul className="list-none p-0 m-0">
          {labels.tree.map((n, idx) => {
            const open = openTree === idx;
            return (
              <li key={n} className="border-b border-line">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenTree(open ? null : idx)}
                  className="w-full flex justify-between items-center py-3 text-sm font-medium text-left cursor-pointer bg-transparent border-0"
                >
                  {n}<span className="text-gold-1">{open ? "▾" : "›"}</span>
                </button>
                {open ? (
                  <ul className="pb-3 list-none m-0 p-0">
                    {labels.axes.map((s, i) => {
                      const value = AXIS_VALUES[i];
                      const active = axis === value;
                      return (
                        <li key={s} className="border-0">
                          <button
                            type="button"
                            onClick={() => setAxis(active ? null : value)}
                            className={`w-full text-left block py-1.5 px-3 text-[13px] border-l cursor-pointer bg-transparent ${active ? "text-ink border-gold font-medium" : "text-muted border-line hover:text-ink"}`}
                          >
                            {s}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
        <div className="mt-8 bg-white border border-line p-5">
          <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-2">{labels.supportTitle}</div>
          <p className="m-0 text-[13px] text-muted leading-[1.6]">(+84) 909.663.350<br />support@qstcnc.com</p>
          <Link className="qs-btn qs-btn-sm mt-3.5" href="/contact">{labels.supportCta}</Link>
        </div>
      </aside>

      {/* list */}
      <main>
        <div className="flex justify-between items-center bg-white border border-line px-6 py-4 mb-6">
          <div className="flex gap-6 items-center">
            <span className="font-mono text-xs tracking-widest text-muted">{labels.showing} <b className="text-ink font-semibold">{count}</b> {labels.ofModels}</span>
            <div className="flex gap-1.5">
              {labels.filters.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChip(i)}
                  className={`px-3 py-1.5 font-mono text-[11px] tracking-widest uppercase border cursor-pointer ${i === chip ? "bg-ink text-white border-ink" : "border-line text-muted hover:border-ink"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 items-center">
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
