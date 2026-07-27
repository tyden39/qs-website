"use client";

import { FilterIcon } from "./filter-icons";

export type TypeFilterItem = { id: string; label: string; count: number };

/**
 * Controlled sub-type filter row shared by the group list pages (machines,
 * controllers, servo). `items[0]` is the "all" chip — rendered without a glyph;
 * the rest are sub-types keyed to a FilterIcon glyph. The active chip is filled
 * (bg-ink) so the row reads as a control, not a set of links. Selection state
 * lives in the parent, which decides what the choice shows.
 */
export function TypeFilterChips({
  items,
  active,
  onSelect,
  label,
  className = "pb-1 mb-6",
}: {
  items: TypeFilterItem[];
  active: string;
  onSelect: (id: string) => void;
  label: string;
  /** Wrapper spacing/layout — defaults to a standalone row; pass "" to drop the
      bottom margin when the chips sit inside a toolbar bar. */
  className?: string;
}) {
  return (
    <nav aria-label={label} className={`flex gap-1.5 flex-wrap ${className}`}>
      {items.map((it) => {
        const isActive = it.id === active;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onSelect(it.id)}
            aria-pressed={isActive}
            className={`shrink-0 inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 font-mono text-label tracking-widest uppercase border cursor-pointer transition-colors ${
              isActive
                ? "bg-ink text-white border-ink"
                : "border-line text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {it.id !== "all" && (
              <span className={isActive ? "text-white" : "text-gold-1"}>
                <FilterIcon id={it.id} />
              </span>
            )}
            {it.label}
            <span className={`tabular-nums ${isActive ? "text-white/70" : "text-gold-2"}`}>
              {String(it.count).padStart(2, "0")}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
