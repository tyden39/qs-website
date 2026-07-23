"use client";

import { useMemo, useState } from "react";
import { useCategorySubfilter } from "./product-category-tree";
import { setFilterParams, slugIndex, useFilterParams } from "@/lib/use-filter-params";

// Query slug per chip/option, indexed to match the localized label arrays.
// Index 0 is the unfiltered default and is never written to the URL.
const INTERFACES: readonly (string | null)[] = [null, "pulse-train", "ethercat", "mechatrolink"];
const SORTS: readonly (string | null)[] = [null, "axis", "display"];
const INTERFACE_KEY = "iface";
/** Shared with the other list toolbars; slugs keep each menu's meaning distinct. */
const SORT_KEY = "sort";

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
  /** Catalogue sub-type (motion / cnc / robot / cobot) — the subcategory the
   *  sidebar tree filters by. */
  type: string;
  /** Lowercased control interface string (e.g. "pulse train · ethercat"). */
  controlInterface: string;
  node: React.ReactNode;
};

type Labels = {
  filters: string[];
  sortOptions: string[];
  showing: string;
  ofModels: string;
  /** Toggle label for the collapsible mobile filter panel. */
  filtersLabel: string;
  /** Accessible name for the mobile connection-interface select. */
  interfaceLabel: string;
  sortLabel: string;
  emptyState: string;
};

// Interface slugs a product carries, for the pre-paint `data-f-iface` hook.
// Mirrors `matchesChip` so the primer and the React filter agree on a match.
function ifaceTokens(controlInterface: string): string {
  const tokens: string[] = [];
  if (controlInterface.includes("pulse train")) tokens.push("pulse-train");
  if (controlInterface.includes("ethercat")) tokens.push("ethercat");
  if (controlInterface.includes("mechatrolink")) tokens.push("mechatrolink");
  return tokens.join(" ");
}

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

/**
 * Controllers list panel: the interface chips + sort toolbar above a stacked
 * list of product cards. Category navigation lives in the outer sidebar tree —
 * the selected subcategory (controller `type`) arrives through
 * `useCategorySubfilter` and narrows the list here.
 */
export function ProductListFilter({ items, labels }: { items: ProductFilterItem[]; labels: Labels }) {
  const params = useFilterParams();
  const chip = slugIndex(INTERFACES, params.get(INTERFACE_KEY));
  const sort = slugIndex(SORTS, params.get(SORT_KEY));
  // Selected controller type from the sidebar tree, or null for "all".
  const type = useCategorySubfilter();
  // Mobile-only: collapse the filter controls to a single count + toggle row so
  // the product list sits closer to the top on small screens. No effect from sm up.
  const [open, setOpen] = useState(false);
  // When collapsed, hide each mobile control below the sm breakpoint only —
  // tablet/desktop keep their own responsive visibility untouched.
  const collapse = open ? "" : "max-sm:hidden";

  const visible = useMemo(() => {
    const filtered = items.filter(
      (it) => matchesChip(it, chip) && (type === null || it.type === type),
    );
    const sorted = [...filtered];
    if (sort === 1) sorted.sort((a, b) => a.axisNum - b.axisNum);
    else if (sort === 2) sorted.sort((a, b) => a.displayNum - b.displayNum);
    return sorted;
  }, [items, chip, sort, type]);

  const count = String(visible.length).padStart(2, "0");
  const total = String(items.length).padStart(2, "0");
  // Only surface the "/ total" fragment once a filter is actually narrowing the
  // list — unfiltered, the running count already equals the catalogue total and
  // repeating it just echoes the group's own count.
  const isFiltered = visible.length !== items.length;
  // Mobile only: let the toolbar frame appear with the filter controls when the
  // panel is expanded, instead of permanently boxing the collapsed summary row.
  // sm+ keeps its always-on box untouched.
  const mobileFrame = open ? "max-sm:bg-white max-sm:border max-sm:border-line max-sm:px-4 max-sm:py-4" : "";

  return (
    <div className="min-w-0">
      <div className={`flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:bg-white sm:border sm:border-line sm:px-6 sm:py-4 mb-6 ${mobileFrame}`}>
        <div className="flex flex-col gap-3 min-w-0 sm:flex-row sm:gap-6 sm:items-center">
          {/* count + minimize toggle share a row on mobile; the toggle disappears
              from sm up where the controls always stay expanded */}
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-meta tracking-widest text-muted shrink-0">{labels.showing} <b className="text-ink font-semibold">{count}</b>{isFiltered ? <> / <b className="text-ink font-semibold">{total}</b></> : null} {labels.ofModels}</span>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="sm:hidden flex items-center gap-1.5 font-mono text-label tracking-widest uppercase text-muted border border-line py-1 px-2.5 cursor-pointer"
            >
              {labels.filtersLabel}
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}>
                <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
          {/* connection-interface select — mobile stand-in for the desktop chips.
              Selects hold 16px on mobile: iOS Safari auto-zooms the page when a
              focused control's font-size is under 16px. */}
          <select
            aria-label={labels.interfaceLabel}
            value={chip}
            onChange={(e) => setFilterParams({ [INTERFACE_KEY]: INTERFACES[Number(e.target.value)] })}
            className={`qs-select ${collapse} sm:hidden min-w-0 max-w-full font-mono text-[16px] tracking-[.08em] uppercase border border-line py-1.5 px-3 bg-white cursor-pointer`}
          >
            {labels.filters.map((c, i) => (
              <option key={c} value={i}>{c}</option>
            ))}
          </select>
          {/* chips: same interface filter, shown inline from tablet up where the
              toolbar has room to wrap them */}
          <div className="hidden sm:flex gap-1.5 flex-wrap">
            {labels.filters.map((c, i) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilterParams({ [INTERFACE_KEY]: INTERFACES[i] })}
                className={`shrink-0 px-3 py-1.5 font-mono text-label tracking-widest uppercase border cursor-pointer ${i === chip ? "bg-ink text-white border-ink" : "border-line text-muted hover:border-ink"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className={`${collapse} flex gap-3 items-center w-full sm:w-auto sm:shrink-0`}>
          <select
            aria-label={labels.sortLabel}
            value={sort}
            onChange={(e) => setFilterParams({ [SORT_KEY]: SORTS[Number(e.target.value)] })}
            className="qs-select w-full sm:w-auto font-mono text-[16px] lg:text-label tracking-[.08em] uppercase border border-line py-1.5 px-3 bg-white cursor-pointer"
          >
            {labels.sortOptions.map((o, i) => (<option key={o} value={i}>{o}</option>))}
          </select>
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="flex flex-col gap-6">
          {visible.map((it) => (
            <div key={it.slug} data-f-t={it.type} data-f-iface={ifaceTokens(it.controlInterface)}>
              {it.node}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body text-[#3a3a3a] leading-[1.7] m-0 py-12 text-center">{labels.emptyState}</p>
      )}
    </div>
  );
}
