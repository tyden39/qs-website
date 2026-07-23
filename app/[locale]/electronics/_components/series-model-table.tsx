"use client";

import { useMemo, useState } from "react";
import type { SeriesModelTableView } from "@/lib/data/series";

/**
 * A model-selection grid on a series detail page. Long datasheet tables scroll
 * sideways rather than squeeze so columns stay legible, and the first column
 * (the model / part number) stays emphasised so a row reads off its identifier.
 *
 * When the table names a `filterCol`, its distinct cell values become a chip row
 * (all + each value) that narrows the rows client-side — the motor list spans
 * both supply voltages and 50-odd frames, so a filter keeps it browsable without
 * splitting one datasheet into many. Filtering is the only interactivity, so the
 * chips are the sole reason this is a client component.
 */
export function SeriesModelTable({
  table,
  allLabel,
  filterLabel,
}: {
  table: SeriesModelTableView;
  allLabel: string;
  filterLabel: string;
}) {
  const filterIndex = table.filterCol
    ? table.cols.findIndex((c) => c.key === table.filterCol)
    : -1;

  // Distinct values in first-appearance order + how many rows each covers, so a
  // chip can show its count the way the group-list chips do.
  const values = useMemo(() => {
    if (filterIndex < 0) return [];
    const counts = new Map<string, number>();
    for (const row of table.rows) {
      const v = row[filterIndex];
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return [...counts.entries()].map(([value, count]) => ({ value, count }));
  }, [table.rows, filterIndex]);

  const [active, setActive] = useState<string>("all");

  const rows =
    filterIndex < 0 || active === "all"
      ? table.rows
      : table.rows.filter((row) => row[filterIndex] === active);

  return (
    <figure className="m-0">
      <figcaption className="mb-3 font-display text-body font-semibold tracking-[-.01em] text-ink">
        {table.caption}
      </figcaption>

      {values.length > 1 && (
        <nav
          aria-label={filterLabel}
          className="mb-4 flex flex-wrap gap-1.5"
        >
          {[{ value: "all", count: table.rows.length, label: allLabel }, ...values.map((v) => ({ ...v, label: v.value }))].map(
            (chip) => {
              const isActive = chip.value === active;
              return (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => setActive(chip.value)}
                  aria-pressed={isActive}
                  className={`shrink-0 inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 font-mono text-label tracking-widest uppercase border cursor-pointer transition-colors ${
                    isActive
                      ? "bg-ink text-white border-ink"
                      : "border-line text-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  {chip.label}
                  <span className={`tabular-nums ${isActive ? "text-white/70" : "text-gold-2"}`}>
                    {String(chip.count).padStart(2, "0")}
                  </span>
                </button>
              );
            },
          )}
        </nav>
      )}

      <div className="overflow-x-auto border border-line">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {table.cols.map((c) => (
                <th
                  key={c.key}
                  className="bg-[#11120f] px-4 py-3 text-left font-mono text-label-xs tracking-[.08em] uppercase text-gold-2 whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-t border-line even:bg-paper hover:bg-[#faf8f2]">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={
                      ci === 0
                        ? "px-4 py-2.5 font-display text-meta font-bold tracking-[-.01em] text-ink whitespace-nowrap"
                        : "px-4 py-2.5 text-meta text-[#3a3a3a] tabular-nums whitespace-nowrap"
                    }
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {table.note && (
        <p className="mt-3 m-0 text-meta leading-[1.6] text-muted max-w-[80ch]">{table.note}</p>
      )}
    </figure>
  );
}
