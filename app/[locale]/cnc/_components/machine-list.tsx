"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { TypeSection } from "@/app/[locale]/products/_components/type-sections";
import {
  TypeFilterChips,
  type TypeFilterItem,
} from "@/app/[locale]/products/_components/type-filter-chips";
import { ListToolbar } from "@/app/[locale]/products/_components/list-toolbar";
import type { MachineView } from "@/lib/data/machines";

/** A sub-type block of the thumbnail grid (CNC / automation / inspection). */
export type MachineSection = { id: string; label: string; machines: MachineView[] };

/**
 * CNC machine catalogue browser. Left column is a thumbnail grid (3 per row) —
 * photo and model only. On `lg+` clicking a thumbnail selects it and shows that
 * machine's specs in the side panel; the panel's button navigates to the detail
 * page. Below `lg` the spec panel is hidden and each thumbnail is a plain link
 * that goes straight to the detail page.
 *
 * Pass `sections` to split the grid by machine type (the /products/machines
 * page does); without it the grid stays flat and the type filter is not
 * rendered.
 */
export default function MachineList({
  machines,
  sections,
  typeNavLabel = "",
  allLabel = "",
  showingLabel = "",
  unitLabel = "",
}: {
  machines: MachineView[];
  sections?: MachineSection[];
  typeNavLabel?: string;
  /** Label for the "show every type" filter chip. */
  allLabel?: string;
  /** Toolbar count labels — only used when `sections` is supplied. */
  showingLabel?: string;
  unitLabel?: string;
}) {
  const t = useTranslations("cnc.machines");

  // Type filter: "all" shows every section, otherwise only the picked one.
  // Only meaningful when `sections` is supplied (the /products/machines page).
  const [typeFilter, setTypeFilter] = useState("all");
  const visibleSections = useMemo(
    () =>
      typeFilter === "all"
        ? (sections ?? [])
        : (sections ?? []).filter((s) => s.id === typeFilter),
    [sections, typeFilter],
  );
  // Machines the grid can currently show — the spec panel selection is kept
  // within this set so filtering never leaves a hidden machine "selected".
  const visibleMachines = useMemo(
    () => (sections ? visibleSections.flatMap((s) => s.machines) : machines),
    [sections, visibleSections, machines],
  );

  const [activeSlug, setActiveSlug] = useState(machines[0]?.slug);
  const active =
    visibleMachines.find((m) => m.slug === activeSlug) ?? visibleMachines[0];

  const specLabel = (k: string) => t(`labels.${k}`);

  // Thumbnails are real detail-page links. On `lg+` (where the spec panel is
  // visible) a click just selects the machine instead of navigating.
  const selectOnDesktop = (e: React.MouseEvent, slug: string) => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      e.preventDefault();
      setActiveSlug(slug);
    }
  };

  // One thumbnail tile, shared by the flat grid and the sectioned one.
  const thumbnail = (m: MachineView) => {
    const isActive = m.slug === active?.slug;
    return (
      <li key={m.slug} className="m-0">
        <Link
          href={`/cnc/${m.slug}`}
          onClick={(e) => selectOnDesktop(e, m.slug)}
          aria-current={isActive ? "true" : undefined}
          className={`group block w-full text-left border bg-white transition-colors duration-200 ${
            isActive ? "lg:border-ink" : "border-line hover:border-ink/40"
          }`}
        >
          <span className="relative block aspect-[5/4] bg-white overflow-hidden">
            <Image
              src={m.thumbnail.src}
              alt={m.model}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-contain p-1.5"
              priority={m.slug === machines[0]?.slug}
            />
          </span>
          <span className="block px-3 py-2.5 border-t border-line">
            <span className="block font-display font-bold text-ink tracking-[-.01em] text-meta leading-none">
              {m.model}
            </span>
            <span className="block font-mono text-label-xs text-muted mt-1.5">
              {t(`categories.${m.category}`)}
            </span>
          </span>
        </Link>
      </li>
    );
  };

  const gridClass = "m-0 p-0 list-none grid grid-cols-2 sm:grid-cols-3 gap-3";

  // "All" chip plus one per section — filters the grid to the picked type.
  const chips: TypeFilterItem[] = [
    { id: "all", label: allLabel, count: machines.length },
    ...(sections ?? []).map((s) => ({
      id: s.id,
      label: s.label,
      count: s.machines.length,
    })),
  ];

  return (
    <>
      {sections && (
        <ListToolbar
          showing={showingLabel}
          count={visibleMachines.length}
          total={machines.length}
          unit={unitLabel}
        >
          <TypeFilterChips
            items={chips}
            active={typeFilter}
            onSelect={setTypeFilter}
            label={typeNavLabel}
            className=""
          />
        </ListToolbar>
      )}
      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-8 lg:gap-10 items-start">
      {/* THUMBNAIL GRID — photo + model, 3 per row */}
      {sections ? (
        <div className="min-w-0 flex flex-col gap-9">
          {visibleSections.map((s) => (
            <TypeSection key={s.id} id={s.id} label={s.label} count={s.machines.length}>
              <ul className={gridClass} aria-label={s.label}>
                {s.machines.map(thumbnail)}
              </ul>
            </TypeSection>
          ))}
        </div>
      ) : (
        <ul className={gridClass} aria-label={t("listLabel")}>
          {machines.map(thumbnail)}
        </ul>
      )}

      {/* SPEC PANEL — no photo; follows the selected thumbnail. Desktop only;
          on mobile the thumbnails link straight to the detail page. */}
      <div className="hidden lg:block lg:sticky lg:top-24">
        {active && (
          <div className="border border-line bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-grad" aria-hidden="true"></div>

            <div className="px-6 pt-6 pb-4 border-b border-line">
              <span className="qs-tag">{t(`categories.${active.category}`)}</span>
              <h3 className="font-display font-bold text-ink text-subhead tracking-[-.02em] leading-none mt-3">
                {active.model}
              </h3>
              <p className="text-meta leading-[1.6] text-muted mt-2.5 m-0 line-clamp-2 min-h-[42px]">
                {active.tagline}
              </p>
            </div>

            <dl className="m-0 px-6 py-1">
              {active.highlights.map((s) => (
                <div
                  key={s.k}
                  className="flex items-baseline justify-between gap-6 py-2 border-b border-line last:border-0"
                >
                  <dt className="text-meta text-muted m-0">{specLabel(s.k)}</dt>
                  <dd className="font-mono text-meta text-ink text-right m-0">{s.v}</dd>
                </div>
              ))}
            </dl>

            <div className="px-6 pt-3 pb-5">
              <Link className="qs-btn qs-btn-gold qs-btn-sm" href={`/cnc/${active.slug}`}>
                {t("viewDetail")} <span className="arr">→</span>
              </Link>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
