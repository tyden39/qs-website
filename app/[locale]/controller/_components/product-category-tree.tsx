"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useId, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { setFilterParams, useFilterParams } from "@/lib/use-filter-params";
import { scrollToList } from "@/lib/scroll-to-list";

/** Active group, named by id so a link survives the catalogue being reordered. */
const GROUP_KEY = "g";
/** Sub-type branch selected inside the active group. */
const TYPE_KEY = "t";

/**
 * The one standard hero-image slot shared by every catalogue page — a fixed
 * aspect box the figure fills (`object-contain` for product renders,
 * `object-cover` for photos). It floats inside the intro so the blurb wraps
 * beside it and runs full-width below it. Its column width is set by the float
 * wrapper (see `CategoryTreeHero`); keeping the aspect here is the single source
 * of truth, so pages must not set their own box.
 */
export const HERO_IMAGE_SLOT = "relative w-full aspect-[4/3]";

/**
 * The subcategory chosen inside the currently active group, or null for "all".
 * The tree provides it; a group's client list (currently the controllers'
 * `ProductListFilter`) reads it to narrow itself. Leaf-group lists ignore it.
 */
const CategoryFilterContext = createContext<string | null>(null);
export function useCategorySubfilter(): string | null {
  return useContext(CategoryFilterContext);
}

/** A subcategory branch under a group (e.g. a controller `type`). `icon` is a
 *  CategoryIcon slug shown before the label, mirroring the header's sub-type
 *  leaves; omit for a branch that has no matching glyph. */
export type CategoryTreeChild = { id: string; label: string; count: number; icon?: string };

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
   *  branch with no single render (e.g. material categories); such a branch
   *  falls back to `icon`. */
  thumb?: { src: string; w: number; h: number };
  /** CategoryIcon slug drawn in the thumbnail tile when `thumb` is absent, so a
   *  render-less group (materials) still reads as a labelled branch. */
  icon?: string;
  children?: CategoryTreeChild[];
  /** Hero intro heading for this group (defaults to `label`). Shown beside the
   *  sidebar when the group is active. */
  heroTitle?: string;
  /** One- or two-sentence intro shown under the hero heading for this group. */
  blurb?: string;
  /** Pre-rendered (server) hero figure for this group — the illustration shown
   *  opposite the sidebar when the group is active. */
  heroImage?: React.ReactNode;
  node: React.ReactNode;
};

/** The 28px light tile shared by the render thumbnail and the icon fallback. */
function TileFrame({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`grid place-items-center w-7 h-7 shrink-0 rounded-[2px] border transition-colors ${
        active ? "border-line-2" : "border-line"
      }`}
      style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}
    >
      {children}
    </span>
  );
}

function Thumb({ src, w, h, active }: { src: string; w: number; h: number; active: boolean }) {
  return (
    <TileFrame active={active}>
      <Image
        src={src}
        alt=""
        aria-hidden
        width={w}
        height={h}
        sizes="28px"
        className="max-w-[22px] max-h-[22px] w-auto h-auto object-contain"
      />
    </TileFrame>
  );
}

function IconTile({ name, active }: { name: string; active: boolean }) {
  return (
    <TileFrame active={active}>
      <CategoryIcon name={name} className={`w-4 h-4 ${active ? "text-gold-1" : "text-muted"}`} />
    </TileFrame>
  );
}

/** Tone the hero intro adopts from the page it sits in — dark heroes need light
 *  copy, light heroes need ink copy. */
export type CategoryHeroTone = "light" | "dark";

/**
 * Reads the active group + selected sub-branch from the shared URL filter store.
 * Both halves of the split catalogue — the hero (sidebar + intro) and the list
 * panels below — call this so they render the same selection without threading
 * state between the two sections; the store's module-level listeners keep them
 * in sync when either half writes a new selection.
 *
 * An absent or unknown group id resolves to the first group, so a hand-edited or
 * stale link still lands on a valid view. A sub-branch id only counts for the
 * group that declares it, so a leftover `t` never narrows a foreign group to
 * nothing.
 */
function useCategoryState(groups: CategoryTreeGroup[]) {
  const params = useFilterParams();
  const named = groups.findIndex((g) => g.id === params.get(GROUP_KEY));
  const active = named === -1 ? 0 : named;
  const activeGroup = groups[active];
  const branch = params.get(TYPE_KEY);
  const child = activeGroup.children?.some((c) => c.id === branch) ? branch : null;
  return { active, activeGroup, child };
}

/**
 * The catalogue hero: a hierarchical group tree in a left sidebar paired with
 * the active group's intro (heading + blurb + figure) on the right. Selecting a
 * group swaps the intro in place; selecting a sub-branch narrows the list below.
 * The matching list lives in `CategoryTreePanels`, rendered under the hero — the
 * two share selection through the URL store, so this half owns navigation while
 * that half owns the results.
 *
 * Intro panels stay mounted; the inactive ones are `hidden` and carry `data-f-g`
 * so the pre-paint primer can reveal the right one before hydration (matching
 * the list panels). Picking a group does not scroll — the reader stays on the
 * freshly-swapped intro; the "view list" affordance and sub-branch picks are the
 * deliberate jumps down to the results.
 */
export function CategoryTreeHero({
  groups,
  eyebrow,
  allLabel,
  tone = "light",
  viewListLabel,
}: {
  groups: CategoryTreeGroup[];
  /** Mono kicker above the tree that primes it as page-level navigation. */
  eyebrow?: string;
  /** "All" label for a group's reset branch (shows every item in the group). */
  allLabel: string;
  /** Page background the hero sits on, so the intro copy stays legible. */
  tone?: CategoryHeroTone;
  /** Label for the affordance that scrolls down to the list; omit to hide it. */
  viewListLabel?: string;
}) {
  const { active, activeGroup, child } = useCategoryState(groups);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const dark = tone === "dark";

  // Keep the tree's expansion in sync with the URL selection so the active
  // group's branch is revealed — and its selected sub-branch highlighted — even
  // when the selection was made from the header menu rather than clicked here.
  // Runs on group/sub-branch change; a manual collapse (which leaves the URL
  // untouched) therefore persists until the next selection.
  useEffect(() => {
    const kids = activeGroup.children ?? [];
    setExpandedGroupId(kids.length > 0 ? activeGroup.id : null);
  }, [active, child, activeGroup]);

  // The first group is the default view, so it stays out of the query; picking a
  // group always clears the previous group's branch. Unlike the sub-branch pick,
  // switching group deliberately does not scroll — the reader stays on the intro
  // that just swapped in.
  const selectGroup = (i: number) => {
    const groupId = groups[i].id;
    const kids = groups[i].children ?? [];
    if (i === active && kids.length > 0) {
      // Toggle expansion when re-clicking an already-active group with children.
      setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
    } else {
      setFilterParams({ [GROUP_KEY]: i === 0 ? null : groupId, [TYPE_KEY]: null });
      setExpandedGroupId(groupId);
    }
  };
  // Narrowing to a sub-branch filters in place, keeping the current scroll
  // position instead of jumping to the list.
  const selectChild = (id: string | null) => {
    setFilterParams({ [TYPE_KEY]: id });
  };

  return (
    <div className="lg:grid lg:grid-cols-[248px_1fr] lg:gap-12 lg:items-stretch">
      {/* LEFT — tree (desktop) / stacked selects (mobile+tablet); the desktop card
          stretches to the full height of the intro column. */}
      <div className="mb-8 lg:mb-0 flex flex-col gap-6 lg:h-full">
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

        {/* desktop: the hierarchical tree, filling the column height */}
        <nav
          aria-label={eyebrow ?? groups.map((g) => g.label).join(" / ")}
          className="hidden lg:block border border-line bg-white p-5 lg:flex-1"
        >
          {eyebrow ? (
            <div className="pb-3.5 border-b border-ink font-mono text-label tracking-[.16em] uppercase text-ink">
              {eyebrow}
            </div>
          ) : null}
          <ul className="list-none p-0 m-0">
            {groups.map((g, i) => {
              const isActive = i === active;
              const isExpanded = expandedGroupId === g.id;
              const kids = g.children ?? [];
              return (
                <li key={g.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    aria-pressed={isActive}
                    aria-expanded={kids.length > 0 ? isExpanded : undefined}
                    onClick={() => selectGroup(i)}
                    className={`w-full flex items-center gap-3 py-3 text-meta font-medium text-left cursor-pointer bg-transparent border-0 ${
                      isActive ? "text-ink" : "text-ink/85 hover:text-ink"
                    }`}
                  >
                    {g.thumb ? (
                      <Thumb src={g.thumb.src} w={g.thumb.w} h={g.thumb.h} active={isActive} />
                    ) : g.icon ? (
                      <IconTile name={g.icon} active={isActive} />
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
                        className={`shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    ) : null}
                  </button>

                  {isActive && isExpanded && kids.length > 0 ? (
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
                              <span className="flex items-center gap-2 min-w-0">
                                {c.icon ? <CategoryIcon name={c.icon} className="w-4 h-4 shrink-0 opacity-75" /> : null}
                                <span className="truncate">{c.label}</span>
                              </span>
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

      </div>

      {/* RIGHT — the active group's figure on top, intro copy below; all mounted,
          inactive hidden. */}
      <div className="min-w-0">
        {groups.map((g, i) => (
          <div
            key={g.id}
            role="region"
            aria-label={g.label}
            hidden={i !== active}
            // Pre-paint hook: lets the primer reveal this group's intro (overriding
            // the server `hidden`) and hide the rest before hydration, matching the
            // list panels below.
            data-f-g={g.id}
          >
            <div>
              {/* Title spans the full width on top. */}
              <h2 className={`qs-h2 ${dark ? "text-white" : "text-ink"}`}>
                {g.heroTitle ?? g.label}
              </h2>
              {/* Below: the figure floats to one side (narrower) and the copy
                  wraps beside it, then runs full-width under the image. `flow-root`
                  contains the float so the block sizes to its content. */}
              <div className="mt-5 flow-root">
                {g.heroImage ? (
                  <div className="float-right w-2/5 max-w-[260px] ml-6 mb-3">
                    <div className={HERO_IMAGE_SLOT}>{g.heroImage}</div>
                  </div>
                ) : null}
                {g.blurb ? (
                  <p className={`text-body leading-[1.7] ${dark ? "text-[#a8a499]" : "text-muted"}`}>
                    {g.blurb}
                  </p>
                ) : null}
                {viewListLabel ? (
                  <button
                    type="button"
                    onClick={() => scrollToList()}
                    className={`mt-6 inline-flex items-center gap-2 font-mono text-label tracking-[.14em] uppercase cursor-pointer bg-transparent border-0 p-0 ${
                      dark ? "text-gold-2 hover:text-white" : "text-gold-1 hover:text-ink"
                    }`}
                  >
                    {viewListLabel}
                    <span aria-hidden="true">↓</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The list half of the split catalogue, rendered below `CategoryTreeHero`. Shows
 * the active group's list full-width; every group stays mounted so a group's own
 * filter state (the controllers' sort/interface chips) survives a round trip to
 * another group, with inactive panels `hidden` and their context forced to null
 * so a hidden list never mis-filters. Reads the same URL selection as the hero.
 */
export function CategoryTreePanels({ groups }: { groups: CategoryTreeGroup[] }) {
  const { active, child } = useCategoryState(groups);
  const base = useId();
  return (
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
  );
}
