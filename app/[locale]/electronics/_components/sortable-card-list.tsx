"use client";

import { useMemo } from "react";
import { useCategorySubfilter } from "./product-category-tree";
import { setFilterParams, slugIndex, useFilterParams } from "@/lib/use-filter-params";

// Query slug per sort option; index 0 is catalogue order and stays out of the
// URL. The key is shared with the controllers' toolbar, whose menu offers other
// slugs — one this list cannot honour simply reads as catalogue order here.
const SORTS: readonly (string | null)[] = [null, "name"];
const SORT_KEY = "sort";

/**
 * A card in a sortable list. `node` is the pre-rendered (async server) card,
 * passed through the RSC boundary so sorting reorders the list client-side
 * without re-rendering the card. `name` is the sort key for the name option;
 * catalogue order is the original array order. `subtype` matches the sidebar
 * tree's subcategory id — when a branch is selected the list narrows to it;
 * leave it undefined for groups without subcategory branches.
 */
export type SortableCard = { key: string; name: string; subtype?: string; node: React.ReactNode };

/**
 * Toolbar + list for the groups that browse as a plain card list (servo,
 * inverters, DNC, accessories, machines, applications). Mirrors the
 * controllers' toolbar frame — count on the left, a sort select on the right
 * (no visible label) — so every group panel reads the same. The active sidebar
 * subcategory (from `useCategorySubfilter`) narrows the list; `sortOptions[0]`
 * is catalogue order and index 1 sorts by `name`. Layout is a stacked column of
 * full-width cards or a card grid.
 */
export function SortableCardList({
  items,
  sortOptions,
  showing,
  unit,
  sortLabel,
  layout = "stack",
}: {
  items: SortableCard[];
  /** [0] = catalogue order, [1] = name A→Z. */
  sortOptions: string[];
  showing: string;
  unit: string;
  /** Accessible name for the sort select (the visible label is dropped). */
  sortLabel: string;
  layout?: "stack" | "grid";
}) {
  const sort = slugIndex(SORTS, useFilterParams().get(SORT_KEY));
  const subtype = useCategorySubfilter();

  const visible = useMemo(() => {
    const filtered = subtype === null ? items : items.filter((it) => it.subtype === subtype);
    if (sort !== 1) return filtered;
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [items, sort, subtype]);

  const wrap = layout === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-6";
  const count = String(visible.length).padStart(2, "0");
  const total = String(items.length).padStart(2, "0");
  // Only surface "/ total" once a branch is narrowing the list, so the
  // unfiltered count never just echoes the group total.
  const isFiltered = visible.length !== items.length;

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center bg-white border border-line px-4 py-3.5 sm:px-6 sm:py-4 mb-6">
        <span className="font-mono text-meta tracking-widest text-muted shrink-0">
          {showing} <b className="text-ink font-semibold">{count}</b>{isFiltered ? <> / <b className="text-ink font-semibold">{total}</b></> : null} {unit}
        </span>
        <select
          aria-label={sortLabel}
          value={sort}
          onChange={(e) => setFilterParams({ [SORT_KEY]: SORTS[Number(e.target.value)] })}
          className="qs-select w-full sm:w-auto font-mono text-[16px] lg:text-label tracking-[.08em] uppercase border border-line py-1.5 px-3 bg-white cursor-pointer"
        >
          {sortOptions.map((o, i) => (
            <option key={o} value={i}>{o}</option>
          ))}
        </select>
      </div>
      <div className={wrap}>
        {visible.map((it) => (
          <div key={it.key}>{it.node}</div>
        ))}
      </div>
    </>
  );
}
