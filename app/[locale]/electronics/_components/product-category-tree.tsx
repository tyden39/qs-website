"use client";

import Image from "@/components/media/image";
import { createContext, useContext, useId, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import CountBadge from "@/components/count-badge";
import { setFilterParams, useFilterParams } from "@/lib/use-filter-params";
import { scrollToList } from "@/lib/scroll-to-list";

/** Active group, named by id so a link survives the catalogue being reordered. */
const GROUP_KEY = "g";
/** Sub-type branch selected inside the active group. */
const TYPE_KEY = "t";

/**
 * The one standard hero-image slot shared by every catalogue page — the box a
 * group's figure fills (`object-contain` for product renders, `object-cover`
 * for photos). Below `lg` that box is a 4:3 card stacked under the heading;
 * from `lg` up `CategoryHeroFigure` re-uses the same node full-height against
 * the right edge of the viewport. Keeping the box here is the single source of
 * truth, so pages must not set their own.
 */
export const HERO_IMAGE_SLOT = "relative w-full aspect-[4/3]";

/**
 * The `sizes` that goes with that slot, kept beside it for the same reason: the
 * box is defined here, so the width the browser is told about has to be too.
 *
 * Below `lg` the figure is the 4:3 card inside the padded container, so it is
 * near enough the full viewport. From `lg` up its width is `--qs-bleed`, which
 * globals.css defines as `min(27vw, 415px)` — the two tiers below say exactly
 * that, switching at the 1537px where 27vw reaches the 415px cap. The old
 * blanket `38vw` overstated it by up to 1.8x, which on a 2x desktop put the
 * catalogue hero on the 1400w original (337 KB) instead of the 960w (180 KB).
 */
export const HERO_FIGURE_SIZES = "(max-width:1023px) 92vw, (min-width:1537px) 415px, 27vw";

/**
 * The subcategory chosen inside the currently active group, or null for "all".
 * The tree provides it; a group's client list (currently the controllers'
 * `ProductListFilter`) reads it to narrow itself. Leaf-group lists ignore it.
 */
const CategoryFilterContext = createContext<string | null>(null);
export function useCategorySubfilter(): string | null {
  return useContext(CategoryFilterContext);
}
/** Widens a group's list back to "all", for a list that offers its own way out of
 *  a narrowed branch. Lives here so `TYPE_KEY` stays this module's business. */
export function clearCategorySubfilter(): void {
  setFilterParams({ [TYPE_KEY]: null });
}

/** A subcategory branch under a group (e.g. a controller `type`). `icon` is a
 *  CategoryIcon slug shown before the label, mirroring the header's sub-type
 *  leaves; omit for a branch that has no matching glyph. `soon` marks a branch
 *  the taxonomy announces but the catalogue has yet to fill: its text replaces
 *  the count so the row never reads as a broken "00". */
export type CategoryTreeChild = { id: string; label: string; count: number; icon?: string; soon?: string };

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
  /** Trailing portion of the hero heading to gild with the gold sheen; defaults
   *  to the whole title. Defined per-locale so a compound last word (e.g. "điều
   *  khiển") gilds as a unit rather than splitting on an inner space. */
  labelGold?: string;
  /** One- or two-sentence intro shown under the hero heading for this group. */
  blurb?: string;
  /** Pre-rendered (server) hero figure for this group — the illustration shown
   *  opposite the sidebar when the group is active. */
  heroImage?: React.ReactNode;
  node: React.ReactNode;
};

/** Tone the hero adopts from the page it sits in — dark heroes need light copy
 *  and dark chrome, light heroes need ink copy on paper chrome. */
export type CategoryHeroTone = "light" | "dark";

/**
 * Every tone-dependent surface in the hero, resolved once per render. Keeping
 * them in one table is what lets the same sidebar/figure/intro markup sit on the
 * paper catalogue heroes and on the ink machine-hall hero without either page
 * restating colours.
 */
const TONE = {
  light: {
    rail: "border-line bg-white",
    railHead: "border-ink text-ink",
    row: "border-line",
    label: "text-ink/85 hover:text-ink",
    labelOn: "text-gold-1",
    child: "text-muted hover:text-ink",
    childOn: "text-gold-1",
    select: "border-line bg-white text-ink",
    title: "text-ink",
    blurb: "text-muted",
    cta: "text-gold-1 hover:text-ink",
    frame: "border-line",
    frameBg: "radial-gradient(circle at 50% 34%, #ffffff, #eceae4)",
    tile: "border-line",
    tileOn: "border-line-2",
    tileBg: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)",
    glyph: "text-muted",
    scroll: "[--qs-scroll-thumb:var(--color-line-2)]",
  },
  dark: {
    rail: "border-[#2a2620] bg-[#141510]",
    railHead: "border-[#4a453a] text-[#eee9d7]",
    row: "border-[#26241e]",
    label: "text-[#bdb7a8] hover:text-white",
    labelOn: "text-gold-2",
    child: "text-[#8f8878] hover:text-[#eee9d7]",
    childOn: "text-gold-2",
    select: "border-[#2a2620] bg-[#141510] text-[#eee9d7]",
    title: "text-white",
    blurb: "text-[#a8a499]",
    cta: "text-gold-2 hover:text-white",
    frame: "border-[#2a2620]",
    frameBg: "radial-gradient(circle at 50% 34%, #24251f, #121310)",
    tile: "border-[#2a2620]",
    tileOn: "border-[#4a453a]",
    tileBg: "radial-gradient(circle at 50% 38%, #24251f, #16170f)",
    glyph: "text-[#8f8878]",
    scroll: "[--qs-scroll-thumb:#4a453a]",
  },
} as const;

type ToneSkin = (typeof TONE)[CategoryHeroTone];

/** The 28px tile shared by the render thumbnail and the icon fallback. */
function TileFrame({ active, skin, children }: { active: boolean; skin: ToneSkin; children: React.ReactNode }) {
  return (
    <span
      className={`grid place-items-center w-7 h-7 shrink-0 rounded-[2px] border transition-colors ${
        active ? skin.tileOn : skin.tile
      }`}
      style={{ background: skin.tileBg }}
    >
      {children}
    </span>
  );
}

function Thumb({ src, w, h, active, skin }: { src: string; w: number; h: number; active: boolean; skin: ToneSkin }) {
  return (
    <TileFrame active={active} skin={skin}>
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

function IconTile({ name, active, skin }: { name: string; active: boolean; skin: ToneSkin }) {
  return (
    <TileFrame active={active} skin={skin}>
      <CategoryIcon name={name} className={`w-4 h-4 ${active ? "text-gold-1" : skin.glyph}`} />
    </TileFrame>
  );
}

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
 * The catalogue hero, laid out as three bands on desktop: the group tree in a
 * left rail, the active group's heading + blurb in the middle, and that group's
 * figure framed on the right. The rail stretches to the band's height so the
 * three read as one plate. Below `lg` it stacks — selects, heading, figure, then
 * the blurb — so the picture still lands high on a phone.
 *
 * Selecting a group swaps the intro in place; selecting a sub-branch narrows the
 * list below.
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
  mobileFigure = true,
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
  /** Whether to stack the group's figure under the heading below `lg`. Set false
   *  on a page whose `heroImage` is drawn from the group's own list — there the
   *  phone would show the same photo twice in one column (once as the hero, once
   *  as the first card), which reads as the page repeating itself rather than as
   *  two bands. The desktop bleed is unaffected: `CategoryHeroFigure` frames the
   *  photo quite differently from a card, so the collision never arises there. */
  mobileFigure?: boolean;
}) {
  const { active, activeGroup, child } = useCategoryState(groups);
  const skin = TONE[tone];

  // The tree's expansion follows the URL selection, so the active group's branch
  // is revealed — and its selected sub-branch highlighted — even when the
  // selection was made from the header menu rather than clicked here. A manual
  // collapse leaves the URL untouched and therefore persists until the next
  // selection.
  //
  // Compared during render rather than synced from an effect, so the reset lands
  // in the same pass as the selection change instead of a second render.
  const branchFor = (g: CategoryTreeGroup) => ((g.children ?? []).length > 0 ? g.id : null);
  const selection = `${active} ${child ?? ""}`;
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(() => branchFor(activeGroup));
  const [prevSelection, setPrevSelection] = useState(selection);
  if (prevSelection !== selection) {
    setPrevSelection(selection);
    setExpandedGroupId(branchFor(activeGroup));
  }

  // The first group is the default view, so it stays out of the query; picking a
  // group always clears the previous group's branch. Unlike the sub-branch pick,
  // switching group deliberately does not scroll — the reader stays on the intro
  // that just swapped in.
  const selectGroup = (i: number) => {
    const groupId = groups[i].id;
    const kids = groups[i].children ?? [];
    if (i === active && kids.length > 0) {
      if (child) {
        // A sub-branch is selected — re-clicking the parent resets the group to
        // its "all" view and keeps the branch revealed, so the parent can always
        // be reactivated from a narrowed child.
        setFilterParams({ [TYPE_KEY]: null });
        setExpandedGroupId(groupId);
      } else {
        // No sub-branch selected — toggle the dropdown.
        setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
      }
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
    // `qs-hero-copy` holds the copy clear of the figure bleeding in from the
    // right; `lg:min-h` keeps the band tall enough to carry that figure now that
    // the copy alone no longer sets the hero's height.
    <div className="qs-hero-copy lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10 xl:gap-12 lg:items-stretch lg:min-h-[340px]">
      {/* LEFT — tree (desktop) / stacked selects (mobile+tablet); the desktop rail
          stretches to the full height of the intro band beside it. */}
      <div className="mb-8 lg:mb-0">
        {/* mobile/tablet: the tree collapses to a group select, plus a
            subcategory select when the active group has branches. */}
        <div className="lg:hidden flex flex-col gap-3">
          <select
            aria-label={eyebrow ?? groups.map((g) => g.label).join(" / ")}
            value={active}
            onChange={(e) => selectGroup(Number(e.target.value))}
            className={`qs-select w-full font-mono text-[16px] tracking-[.08em] uppercase border py-2.5 px-3 cursor-pointer ${skin.select}`}
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
              className={`qs-select w-full font-mono text-[16px] tracking-[.08em] uppercase border py-2.5 px-3 cursor-pointer ${skin.select}`}
            >
              <option value="">{allLabel}</option>
              {activeGroup.children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.soon ?? String(c.count).padStart(2, "0")})
                </option>
              ))}
            </select>
          ) : null}
        </div>

        {/* desktop: the hierarchical tree, filling the band's height and
            scrolling internally when the tree is taller than the band. */}
        <nav
          aria-label={eyebrow ?? groups.map((g) => g.label).join(" / ")}
          className={`hidden lg:flex lg:flex-col lg:h-full lg:max-h-[540px] border p-5 ${skin.rail}`}
        >
          {eyebrow ? (
            <div
              className={`pb-3.5 mb-1 border-b font-mono text-[19px] font-semibold tracking-[.16em] uppercase ${skin.railHead}`}
            >
              {eyebrow}
            </div>
          ) : null}
          {/* `-mr-2.5 pr-2.5` runs the list 10px into the rail's right padding and
              pads the content back, so a scrollbar (only when the catalogue outgrows
              the band) rides in that gutter instead of crossing the row rules — the
              rules stop where they always did. Both classes are inert when nothing
              overflows. */}
          <ul
            className={`list-none p-0 m-0 min-h-0 overflow-y-auto overscroll-contain qs-scroll -mr-2.5 pr-2.5 ${skin.scroll}`}
          >
            {groups.map((g, i) => {
              const isActive = i === active;
              const isExpanded = expandedGroupId === g.id;
              const kids = g.children ?? [];
              return (
                <li key={g.id} className={`border-b last:border-b-0 ${skin.row}`}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    aria-expanded={kids.length > 0 ? isExpanded : undefined}
                    onClick={() => selectGroup(i)}
                    title={g.label}
                    // The gold rule on the active row runs in the rail's padding
                    // (-left-5), reading as a tab marker on the panel edge rather
                    // than an indent inside the list.
                    className={`relative w-full flex items-center gap-3 py-3 text-[18px] font-medium text-left cursor-pointer bg-transparent border-0 transition-colors
                                before:absolute before:-left-5 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-0
                                before:bg-gold before:transition-[height] before:duration-300 ${
                                  isActive ? "before:h-[62%]" : ""
                                } ${isActive ? skin.labelOn : skin.label}`}
                  >
                    {g.thumb ? (
                      <Thumb src={g.thumb.src} w={g.thumb.w} h={g.thumb.h} active={isActive} skin={skin} />
                    ) : g.icon ? (
                      <IconTile name={g.icon} active={isActive} skin={skin} />
                    ) : null}
                    {/* One row, one line: a label too long for the 300px rail is
                        clipped with an ellipsis rather than wrapped, so the tree keeps
                        an even rhythm. The full text stays reachable as the row's
                        `title` (and is never the only copy of it — the intro heading
                        beside the rail spells the active group out in full). */}
                    <span className="flex-1 min-w-0 truncate">{g.label}</span>
                    <CountBadge active={isActive} tone={tone}>
                      {String(g.count).padStart(2, "0")}
                    </CountBadge>
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
                    // Branches hang off a hairline stem so they read as children of
                    // the row above rather than a second flat list.
                    <ul className={`list-none p-0 m-0 pb-2 ml-[13px] pl-6 border-l ${skin.row}`}>
                      {kids.map((c) => {
                        const on = child === c.id;
                        return (
                          <li key={c.id}>
                            <button
                              type="button"
                              aria-pressed={on}
                              onClick={() => selectChild(c.id)}
                              title={c.soon ? `${c.label} — ${c.soon}` : c.label}
                              className={`w-full flex justify-between items-center gap-2 py-1.5 text-[15px] text-left cursor-pointer bg-transparent border-0 transition-colors ${
                                on ? `${skin.childOn} font-medium` : skin.child
                              }`}
                            >
                              <span className={`flex items-center gap-2 min-w-0 ${c.soon && !on ? "opacity-70" : ""}`}>
                                {c.icon ? <CategoryIcon name={c.icon} className="w-4 h-4 shrink-0 opacity-75" /> : null}
                                {/* Clipped rather than wrapped, matching the group rows:
                                    the longest Vietnamese branch names ("Điều khiển
                                    chuyển động") outrun the rail even with the compact
                                    dot marker, and a ragged mix of one- and two-line rows
                                    reads worse than an ellipsis. Full text lives in the
                                    row's `title`. */}
                                <span className="min-w-0 truncate">{c.label}</span>
                              </span>
                              <CountBadge active={on} tone={tone}>
                                {c.soon ? (
                                  <>
                                    {/* An announced-but-empty branch shows a plain zero
                                        count, so every row in the rail carries the same
                                        numeral shape. Spelling it out ("Sắp có"/"Soon")
                                        made a chip ~2.7x the width of a two-digit count,
                                        which wrapped every such row onto two lines in the
                                        300px rail; the words survive for screen readers
                                        and as the row's hover title. */}
                                    <span aria-hidden="true">00</span>
                                    <span className="sr-only">{c.soon}</span>
                                  </>
                                ) : (
                                  String(c.count).padStart(2, "0")
                                )}
                              </CountBadge>
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

      {/* RIGHT — the active group's heading over a copy/figure pair; all groups
          stay mounted, inactive ones hidden. */}
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
            className="lg:h-full lg:flex lg:flex-col"
          >
            {/* Heading spans the band; only the trailing `labelGold` portion gets
                the gold sheen (the whole title when unset), so a compound last
                word gilds as one unit.

                The visible group's heading is the page's <h1> and the mounted-but-
                hidden ones are <h2>, so the document always carries exactly one
                <h1> naming what the reader is actually looking at. Without this
                split every group would claim <h1> (six per page) or none would —
                and these catalogue hubs are the site's main ranking targets, so a
                heading-less document costs them their strongest on-page signal.
                Server-side no group is selected, so index 0 wins and the
                prerendered HTML a crawler reads is stable. */}
            {(() => {
              const title = g.heroTitle ?? g.label;
              const at = g.labelGold ? title.lastIndexOf(g.labelGold) : -1;
              const head = at > 0 ? title.slice(0, at) : "";
              const tail = at >= 0 ? title.slice(at) : title;
              const Heading = i === active ? "h1" : "h2";
              return (
                <Heading className={`qs-h1 text-balance ${skin.title}`}>
                  {head}
                  <span className="qs-gold-shimmer inline-block">{tail}</span>
                </Heading>
              );
            })()}
            {/* Below lg the figure is a framed card between the heading and the
                blurb, so the picture still lands high on a phone. From lg up it
                is dropped here and drawn full-height by `CategoryHeroFigure`
                against the right edge of the viewport instead. */}
            <div className="mt-6 lg:mt-7">
              {mobileFigure && g.heroImage ? (
                <figure
                  className={`lg:hidden relative m-0 mb-7 border overflow-hidden ${HERO_IMAGE_SLOT} ${skin.frame}`}
                  style={{ background: skin.frameBg }}
                >
                  {g.heroImage}
                  {/* Slow gold sweep — the same instrument-panel cue the product
                      cards use, marking the figure as a live readout. */}
                  <div className="qs-scan" aria-hidden="true"></div>
                  {/* Corner ticks: registration marks that frame the render without
                      boxing it in a heavier border. */}
                  <span aria-hidden="true" className="absolute top-0 left-0 w-3 h-px bg-gold/70"></span>
                  <span aria-hidden="true" className="absolute top-0 left-0 w-px h-3 bg-gold/70"></span>
                  <span aria-hidden="true" className="absolute bottom-0 right-0 w-3 h-px bg-gold/70"></span>
                  <span aria-hidden="true" className="absolute bottom-0 right-0 w-px h-3 bg-gold/70"></span>
                </figure>
              ) : null}
              {g.blurb ? (
                // 20px, matching the hero description size used site-wide (`qs-lede`).
                <p className={`text-title leading-[1.6] max-w-[52ch] m-0 sm:text-justify ${skin.blurb}`}>{g.blurb}</p>
              ) : null}
              {viewListLabel ? (
                <button
                  type="button"
                  onClick={() => scrollToList()}
                  className={`mt-7 group inline-flex items-center gap-2 font-mono text-[16px] tracking-[.14em] uppercase cursor-pointer bg-transparent border-0 p-0 transition-colors ${skin.cta}`}
                >
                  {viewListLabel}
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-y-0.5">
                    ↓
                  </span>
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The active group's figure, run full-height off the right edge of the viewport
 * — the hero's anchor from `lg` up. It is a sibling of the hero's content
 * wrapper rather than a column inside it, because a column can only ever be as
 * wide as the centred container; bleeding past that edge is what buys the
 * figure its size. Pages render it as a direct child of a `relative
 * overflow-hidden` hero section, *after* the content wrapper so the pre-paint
 * primer (which must precede any `data-f-g` markup) still governs it, and below
 * that wrapper's `z-10` so the copy always wins the overlap.
 *
 * Its left edge dissolves into the page instead of butting against the copy, so
 * the bleed reads as one continuous plate rather than a pasted-on panel. Below
 * `lg` it draws nothing — `CategoryTreeHero` carries the framed card there.
 */
export function CategoryHeroFigure({
  groups,
  tone = "light",
}: {
  groups: CategoryTreeGroup[];
  tone?: CategoryHeroTone;
}) {
  const { active } = useCategoryState(groups);
  const skin = TONE[tone];
  return (
    // Held to 70% of the hero's height and centred on it vertically, so equal
    // bands of the page show above and below and the bleed reads as inset rather
    // than edge-to-edge. Width *and* horizontal anchor both come from
    // `qs-hero-figure`: the figure rides the viewport edge on ordinary desktops
    // and pins to the centred container once the viewport outgrows it (see the
    // "Catalogue hero bleed" block in globals.css).
    <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 h-[70%] z-[1] qs-hero-figure">
      {groups.map((g, i) =>
        g.heroImage ? (
          <div
            key={g.id}
            hidden={i !== active}
            // Same pre-paint hook as the intro and list panels, so a shared
            // link's figure is the right one before hydration.
            data-f-g={g.id}
            className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(90deg,transparent_0%,#000_16%)] [-webkit-mask-image:linear-gradient(90deg,transparent_0%,#000_16%)]"
          >
            {/* The lightbox the render sits on, carried by its own layer so it
                can dissolve on every side. It used to run off the viewport edge,
                where only its top and bottom showed; now that the figure pins to
                the container it would otherwise read as a hard-cornered white
                rectangle pasted on the paper. Masked, it reads as the halo the
                heroes already put behind a product render. The mask stays off
                `heroImage` itself so no part of the render is faded. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 [mask-image:radial-gradient(closest-side_at_50%_46%,#000_58%,transparent_100%)] [-webkit-mask-image:radial-gradient(closest-side_at_50%_46%,#000_58%,transparent_100%)]"
              style={{ background: skin.frameBg }}
            />
            {g.heroImage}
            <div className="qs-scan" aria-hidden="true"></div>
          </div>
        ) : null,
      )}
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
