"use client";

import { useMemo, useState } from "react";
import { TypeSection } from "./type-sections";
import { TypeFilterChips, type TypeFilterItem } from "./type-filter-chips";
import { ListToolbar } from "./list-toolbar";

/**
 * Filter metadata derived on the server for each product. `node` is the
 * pre-rendered (async server) `ProductBundleCard`, passed through the RSC
 * boundary so filtering/sorting happens client-side without re-rendering the
 * card itself.
 */
export type ProductFilterItem = {
  slug: string;
  /** Catalogue sub-type — the section this model is listed under, and the
      value the filter chips narrow by. */
  type: string;
  node: React.ReactNode;
};

type Labels = {
  showing: string;
  /** Localized count noun ("models"). */
  unit: string;
  emptyState: string;
  /** Sub-type sections in display order, localized. */
  types: { id: string; label: string }[];
  typeNavLabel: string;
  /** Label for the "show every type" filter chip. */
  allLabel: string;
};

export function ProductListFilter({ items, labels }: { items: ProductFilterItem[]; labels: Labels }) {
  // "all" shows every sub-type; otherwise the list narrows to the picked type.
  const [type, setType] = useState("all");

  const visible = useMemo(
    () => (type === "all" ? items : items.filter((it) => it.type === type)),
    [items, type],
  );

  // Only non-empty sections render; a filtered-out type drops its heading.
  const sections = useMemo(
    () =>
      labels.types
        .map((t) => ({ ...t, items: visible.filter((it) => it.type === t.id) }))
        .filter((s) => s.items.length > 0),
    [labels.types, visible],
  );

  // Chips always list every sub-type from the full catalogue (with its total
  // count), so a type never vanishes from the row just because it is filtered.
  const chips: TypeFilterItem[] = useMemo(
    () => [
      { id: "all", label: labels.allLabel, count: items.length },
      ...labels.types.map((t) => ({
        id: t.id,
        label: t.label,
        count: items.filter((it) => it.type === t.id).length,
      })),
    ],
    [items, labels.allLabel, labels.types],
  );

  return (
    <main className="min-w-0">
      <ListToolbar
        showing={labels.showing}
        count={visible.length}
        total={items.length}
        unit={labels.unit}
      >
        <TypeFilterChips
          items={chips}
          active={type}
          onSelect={setType}
          label={labels.typeNavLabel}
          className=""
        />
      </ListToolbar>

      {sections.length > 0 ? (
        <div className="flex flex-col gap-12">
          {sections.map((s) => (
            <TypeSection key={s.id} id={s.id} label={s.label} count={s.items.length}>
              <div className="flex flex-col gap-6">
                {s.items.map((it) => (
                  <div key={it.slug}>{it.node}</div>
                ))}
              </div>
            </TypeSection>
          ))}
        </div>
      ) : (
        <p className="text-body text-[#3a3a3a] leading-[1.7] m-0 py-12 text-center">{labels.emptyState}</p>
      )}
    </main>
  );
}
