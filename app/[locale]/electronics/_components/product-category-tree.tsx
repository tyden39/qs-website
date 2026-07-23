"use client";

import Image from "next/image";
import { createContext, useContext, useId } from "react";
import { Link } from "@/lib/i18n/navigation";
import { setFilterParams, useFilterParams } from "@/lib/use-filter-params";
import { scrollToList } from "@/lib/scroll-to-list";

/** Active group, named by id so a link survives the catalogue being reordered. */
const GROUP_KEY = "g";
/** Sub-type branch selected inside the active group. */
const TYPE_KEY = "t";

/**
 * The subcategory chosen inside the currently active group, or null for "all".
 * The tree provides it; a group's client list (currently the controllers'
 * `ProductListFilter`) reads it to narrow itself. Leaf-group lists ignore it.
 */
const CategoryFilterContext = createContext<string | null>(null);
export function useCategorySubfilter(): string | null {
  return useContext(CategoryFilterContext);
}

/** A subcategory branch under a group (e.g. a controller `type`). */
export type CategoryTreeChild = { id: string; label: string; count: number };

/**
 * A top-level catalogue group. `node` is the pre-rendered (async server) list
 * for that group, passed through the RSC boundary so switching branches is a
 * pure client toggle and no list re-renders on the server. `children` are the
 * subcategory branches; omit (or leave empty) for a leaf group.
 */
export type CategoryTreeGroup = {
  id: string;
  label: string;
  count: number;
  /** Representative product render shown as the branch's thumbnail. Omit for a
   *  text-only branch (e.g. material categories that have no single render). */
  thumb?: { src: string; w: number; h: number };
  children?: CategoryTreeChild[];
  node: React.ReactNode;
};

type SupportLabels = { title: string; cta: string };

function Thumb({ src, w, h, active }: { src: string; w: number; h: number; active: boolean }) {
  return (
    <span
      className={`grid place-items-center w-7 h-7 shrink-0 rounded-[2px] border transition-colors ${
        active ? "border-line-2" : "border-line"
      }`}
      style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}
    >
      <Image
        src={src}
        alt=""
        aria-hidden
        width={w}
        height={h}
        sizes="28px"
        className="max-w-[22px] max-h-[22px] w-auto h-auto object-contain"
      />
    </span>
  );
}

/**
 * Top-level catalogue navigation as a hierarchical tree in a left sidebar:
 * each group is a branch that, when active, expands to its subcategory
 * branches. Selecting a group shows all of it; selecting a subcategory narrows
 * the group's list through `CategoryFilterContext`. Replaces the horizontal tab
 * strip so the whole catalogue reads as one browsable tree.
 *
 * Inactive panels stay mounted but hidden so a group's own filter state (the
 * controllers' sort/interface chips) survives a round trip to another group.
 * Their context value is forced to null so a hidden list never mis-filters.
 */
export function ProductCategoryTree({
  groups,
  eyebrow,
  allLabel,
  support,
}: {
  groups: CategoryTreeGroup[];
  /** Mono kicker above the tree that primes it as page-level navigation. */
  eyebrow?: string;
  /** "All" label for a group's reset branch (shows every item in the group). */
  allLabel: string;
  support?: SupportLabels;
}) {
  const params = useFilterParams();
  const base = useId();
  // An absent or unknown group id opens the first group, so a hand-edited or
  // stale link still lands on a valid catalogue view.
  const named = groups.findIndex((g) => g.id === params.get(GROUP_KEY));
  const active = named === -1 ? 0 : named;
  const activeGroup = groups[active];
  // A branch id only means anything to the group that declares it — ignoring a
  // foreign one keeps a leftover `t` from narrowing this group to nothing.
  const branch = params.get(TYPE_KEY);
  const child = activeGroup.children?.some((c) => c.id === branch) ? branch : null;

  // The first group is the default view, so it stays out of the query; picking a
  // group always clears the previous group's branch.
  // Changing group/branch scrolls the list back to its top so the freshly
  // filtered results read from the start (and the browser can't leave the view
  // scroll-clamped when the new list is shorter).
  const selectGroup = (i: number) => {
    setFilterParams({ [GROUP_KEY]: i === 0 ? null : groups[i].id, [TYPE_KEY]: null });
    scrollToList();
  };
  const selectChild = (id: string | null) => {
    setFilterParams({ [TYPE_KEY]: id });
    scrollToList();
  };

  return (
    <div className="lg:grid lg:grid-cols-[248px_1fr] lg:gap-12 lg:items-start">
      {/* LEFT — tree (desktop) / stacked selects (mobile+tablet), plus support */}
      <div className="mb-6 lg:mb-0 lg:sticky lg:top-24 flex flex-col gap-6">
        {/* mobile/tablet: the tree collapses to a group select, plus a
            subcategory select when the active group has branches. */}
        <div className="lg:hidden flex flex-col gap-3">
          <select
            aria-label={eyebrow ?? groups.map((g) => g.label).join(" / ")}
            value={active}
            onChange={(e) => selectGroup(Number(e.target.value))}
            className="qs-select w-full font-mono text-[16px] tracking-[.08em] uppercase border border-line py-2 px-3 bg-white cursor-pointer"
          >
            {groups.map((g, i) => (
              <option key={g.id} value={i}>
                {g.label} ({String(g.count).padStart(2, "0")})
              </option>
            ))}
          </select>
          {activeGroup.children && activeGroup.children.length > 0 ? (
            <select
              aria-label={activeGroup.label}
              value={child ?? ""}
              onChange={(e) => selectChild(e.target.value || null)}
              className="qs-select w-full font-mono text-[16px] tracking-[.08em] uppercase border border-line py-2 px-3 bg-white cursor-pointer"
            >
              <option value="">{allLabel}</option>
              {activeGroup.children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({String(c.count).padStart(2, "0")})
                </option>
              ))}
            </select>
          ) : null}
        </div>

        {/* desktop: the hierarchical tree */}
        <nav
          aria-label={eyebrow ?? groups.map((g) => g.label).join(" / ")}
          className="hidden lg:block border border-line bg-white p-5"
        >
          {eyebrow ? (
            <div className="pb-3.5 border-b border-ink font-mono text-label tracking-[.16em] uppercase text-ink">
              {eyebrow}
            </div>
          ) : null}
          <ul className="list-none p-0 m-0">
            {groups.map((g, i) => {
              const isActive = i === active;
              const kids = g.children ?? [];
              return (
                <li key={g.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    aria-pressed={isActive}
                    aria-expanded={kids.length > 0 ? isActive : undefined}
                    onClick={() => selectGroup(i)}
                    className={`w-full flex items-center gap-3 py-3 text-meta font-medium text-left cursor-pointer bg-transparent border-0 ${
                      isActive ? "text-ink" : "text-ink/85 hover:text-ink"
                    }`}
                  >
                    {g.thumb ? (
                      <Thumb src={g.thumb.src} w={g.thumb.w} h={g.thumb.h} active={isActive} />
                    ) : null}
                    <span className={`flex-1 min-w-0 ${isActive ? "text-gold-1" : ""}`}>{g.label}</span>
                    <span
                      className={`font-mono text-label-xs tabular-nums ${
                        isActive ? "text-gold-2" : "text-line-2"
                      }`}
                    >
                      {String(g.count).padStart(2, "0")}
                    </span>
                    {kids.length > 0 ? (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        aria-hidden="true"
                        className={`shrink-0 transition-transform ${isActive ? "rotate-180" : ""}`}
                      >
                        <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    ) : null}
                  </button>

                  {isActive && kids.length > 0 ? (
                    <ul className="list-none p-0 m-0 pb-2 pl-10">
                      {kids.map((c) => {
                        const on = child === c.id;
                        return (
                          <li key={c.id}>
                            <button
                              type="button"
                              aria-pressed={on}
                              onClick={() => selectChild(c.id)}
                              className={`w-full flex justify-between items-center gap-3 py-1.5 text-meta text-left cursor-pointer bg-transparent border-0 ${
                                on ? "text-gold-1 font-medium" : "text-muted hover:text-ink"
                              }`}
                            >
                              <span className="min-w-0">{c.label}</span>
                              <span
                                className={`font-mono text-label-xs tabular-nums ${
                                  on ? "text-gold-2" : "text-line-2"
                                }`}
                              >
                                {String(c.count).padStart(2, "0")}
                              </span>
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
        </nav>

        {support ? (
          <aside className="hidden lg:block border border-line bg-white p-5">
            <div className="font-mono text-label-xs text-gold-1 tracking-[.16em] uppercase mb-2">
              {support.title}
            </div>
            <p className="m-0 text-meta text-muted leading-[1.6]">
              <a href="tel:+84909663350" className="hover:text-ink">(+84) 909.663.350</a>
              <br />
              <a href="tel:+84922322338" className="hover:text-ink">(+84) 922.322.338</a>
              <br />
              <a href="mailto:support@qstcnc.com" className="hover:text-ink">support@qstcnc.com</a>
            </p>
            <Link className="qs-btn qs-btn-sm mt-3.5" href="/contact">{support.cta}</Link>
          </aside>
        ) : null}
      </div>

      {/* RIGHT — the active group's list; all mounted, inactive hidden. */}
      <div className="min-w-0">
        {groups.map((g, i) => (
          <div
            key={g.id}
            role="region"
            aria-label={g.label}
            id={`${base}-panel-${g.id}`}
            hidden={i !== active}
            // Pre-paint hook: lets the primer show this group's panel (overriding
            // the server `hidden`) and hide the rest before hydration.
            data-f-g={g.id}
          >
            <CategoryFilterContext.Provider value={i === active ? child : null}>
              {g.node}
            </CategoryFilterContext.Provider>
          </div>
        ))}
      </div>
    </div>
  );
}
