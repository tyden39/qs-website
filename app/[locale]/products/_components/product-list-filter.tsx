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
  /** Machine-type application slugs this controller is suited to. */
  applications: string[];
  node: React.ReactNode;
};

/** A machine-type category in the sidebar tree (application slug + label). */
export type CategoryNode = { slug: string; label: string };

type Labels = {
  filters: string[];
  sortOptions: string[];
  tree: CategoryNode[];
  sidebarHeading: string;
  /** "All machine types" — the reset option for the mobile/tablet category select. */
  allMachines: string;
  supportTitle: string;
  supportCta: string;
  showing: string;
  ofModels: string;
  /** Toggle label for the collapsible mobile filter panel. */
  filtersLabel: string;
  /** Accessible name for the mobile connection-interface select. */
  interfaceLabel: string;
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
  // Selected machine-type category (application slug), or null for "all".
  const [category, setCategory] = useState<string | null>(null);
  // Mobile-only: collapse the filter controls to a single count + toggle row so
  // the product list sits closer to the top on small screens. No effect from sm up.
  const [open, setOpen] = useState(false);
  // When collapsed, hide each mobile control below the sm breakpoint only —
  // tablet/desktop keep their own responsive visibility untouched.
  const collapse = open ? "" : "max-sm:hidden";

  const visible = useMemo(() => {
    const filtered = items.filter(
      (it) =>
        matchesChip(it, chip) &&
        (category === null || it.applications.includes(category)),
    );
    const sorted = [...filtered];
    if (sort === 1) sorted.sort((a, b) => a.axisNum - b.axisNum);
    else if (sort === 2) sorted.sort((a, b) => a.displayNum - b.displayNum);
    return sorted;
  }, [items, chip, sort, category]);

  const count = String(visible.length).padStart(2, "0");
  const total = String(items.length).padStart(2, "0");
  // Only surface the "/ total" fragment once a filter is actually narrowing the
  // list — unfiltered, the running count already equals the catalogue total and
  // repeating it just echoes the tab's own count.
  const isFiltered = visible.length !== items.length;
  // Mobile only: let the toolbar frame appear with the filter controls when the
  // panel is expanded, instead of permanently boxing the collapsed summary row
  // (which then doubles the category select directly above it). sm+ keeps its
  // always-on box untouched.
  const mobileFrame = open ? "max-sm:bg-white max-sm:border max-sm:border-line max-sm:px-4 max-sm:py-4" : "";

  return (
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[240px_1fr] lg:gap-16 lg:items-start">
      {/* sidebar — category tree and technical-support card, desktop only. On
          mobile/tablet the category moves into the toolbar as a select and the
          support card is hidden to keep the list front and centre. */}
      <div className="order-1 hidden lg:flex flex-col gap-6">
        <nav className="border border-line bg-white p-5">
          <div className="pb-3.5 border-b border-ink font-mono text-label tracking-[.16em] uppercase text-ink">
            {labels.sidebarHeading}
          </div>
          <ul className="list-none p-0 m-0">
            {labels.tree.map((cat) => {
              const active = category === cat.slug;
              return (
                <li key={cat.slug} className="border-b border-line">
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(active ? null : cat.slug)}
                    className={`w-full flex justify-between items-center py-3 text-meta font-medium text-left cursor-pointer bg-transparent border-0 ${active ? "text-gold-1" : "text-ink"}`}
                  >
                    {cat.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* technical-support card */}
        <aside className="border border-line bg-white p-5">
          <div className="font-mono text-label-xs text-gold-1 tracking-[.16em] uppercase mb-2">{labels.supportTitle}</div>
          <p className="m-0 text-meta text-muted leading-[1.6]">
            <a href="tel:+84909663350" className="hover:text-ink">(+84) 909.663.350</a>
            <br />
            <a href="tel:+84922322338" className="hover:text-ink">(+84) 922.322.338</a>
            <br />
            <a href="mailto:support@qstcnc.com" className="hover:text-ink">support@qstcnc.com</a>
          </p>
          <Link className="qs-btn qs-btn-sm mt-3.5" href="/contact">{labels.supportCta}</Link>
        </aside>
      </div>

      {/* list */}
      <main className="order-2 min-w-0">
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
            {/* category select — mobile/tablet stand-in for the desktop sidebar tree.
                Selects hold 16px below lg: iOS Safari auto-zooms the page when a
                focused control's font-size is under 16px. Desktop (fine pointer)
                keeps the 11px mono label size. */}
            <select
              aria-label={labels.sidebarHeading}
              value={category ?? ""}
              onChange={(e) => setCategory(e.target.value || null)}
              className={`qs-select ${collapse} lg:hidden min-w-0 max-w-full font-mono text-[16px] tracking-[.08em] uppercase border border-line py-1.5 px-3 bg-white cursor-pointer`}
            >
              <option value="">{labels.allMachines}</option>
              {labels.tree.map((cat) => (
                <option key={cat.slug} value={cat.slug}>{cat.label}</option>
              ))}
            </select>
            {/* connection-interface select — mobile stand-in for the desktop chips */}
            <select
              aria-label={labels.interfaceLabel}
              value={chip}
              onChange={(e) => setChip(Number(e.target.value))}
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
                  onClick={() => setChip(i)}
                  className={`shrink-0 px-3 py-1.5 font-mono text-label tracking-widest uppercase border cursor-pointer ${i === chip ? "bg-ink text-white border-ink" : "border-line text-muted hover:border-ink"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className={`${collapse} flex gap-3 items-center w-full sm:w-auto sm:shrink-0`}>
            <span className="hidden sm:inline font-mono text-label text-muted tracking-widest uppercase">{labels.sortLabel}</span>
            <select
              aria-label={labels.sortLabel}
              value={sort}
              onChange={(e) => setSort(Number(e.target.value))}
              className="qs-select w-full sm:w-auto font-mono text-[16px] lg:text-label tracking-[.08em] uppercase border border-line py-1.5 px-3 bg-white cursor-pointer"
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
          <p className="text-body text-[#3a3a3a] leading-[1.7] m-0 py-12 text-center">{labels.emptyState}</p>
        )}
      </main>
    </div>
  );
}
