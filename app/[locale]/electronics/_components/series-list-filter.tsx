"use client";

import { setFilterParams, useFilterParams } from "@/lib/use-filter-params";
import { TypeSection } from "./type-sections";
import { TypeFilterChips, type TypeFilterItem } from "./type-filter-chips";
import { ListToolbar } from "./list-toolbar";

/**
 * A sub-type block of series cards. `nodes` are the pre-rendered (async server)
 * `SeriesCard`s, passed through the RSC boundary so the filter narrows the list
 * client-side without re-rendering the cards.
 */
const KIND_KEY = "kind";

export type SeriesFilterSection = {
  id: string;
  label: string;
  items: { slug: string; node: React.ReactNode }[];
};

/**
 * Client filter for a series group with sub-types (the servo set: drive /
 * motor / cable). Mirrors the machines and controllers pages — an "All" chip
 * plus one per sub-type narrows the list; there is no sort (a handful of
 * series per kind reads fine in catalogue order).
 */
export function SeriesListFilter({
  sections,
  allLabel,
  navLabel,
  totalCount,
  showingLabel,
  unitLabel,
}: {
  sections: SeriesFilterSection[];
  allLabel: string;
  navLabel: string;
  totalCount: number;
  showingLabel: string;
  unitLabel: string;
}) {
  // Series kind carries its own query key: this list also renders inside the
  // catalogue tree, where `t` already belongs to the tree's own branches.
  const kind = useFilterParams().get(KIND_KEY);
  const type = sections.some((s) => s.id === kind) ? (kind as string) : "all";
  const visible = type === "all" ? sections : sections.filter((s) => s.id === type);
  const visibleCount = visible.reduce((n, s) => n + s.items.length, 0);

  const chips: TypeFilterItem[] = [
    { id: "all", label: allLabel, count: totalCount },
    ...sections.map((s) => ({ id: s.id, label: s.label, count: s.items.length })),
  ];

  return (
    <>
      <ListToolbar showing={showingLabel} count={visibleCount} total={totalCount} unit={unitLabel}>
        <TypeFilterChips
          items={chips}
          active={type}
          onSelect={(id) => setFilterParams({ [KIND_KEY]: id === "all" ? null : id })}
          label={navLabel}
          className=""
        />
      </ListToolbar>
      <div className="flex flex-col gap-12">
        {visible.map((s) => (
          <TypeSection key={s.id} id={s.id} label={s.label} count={s.items.length}>
            <div className="flex flex-col gap-6">
              {s.items.map((it) => (
                <div key={it.slug}>{it.node}</div>
              ))}
            </div>
          </TypeSection>
        ))}
      </div>
    </>
  );
}
