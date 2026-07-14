"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import type { MachineView } from "@/lib/data/machines";

/**
 * CNC machine catalogue browser. Left column is a thumbnail grid (3 per row) —
 * photo and model only. Clicking a thumbnail selects it and shows that
 * machine's specs in the panel; the panel's button navigates to the detail
 * page. On viewports below `lg` the panel stacks below the grid, so the whole
 * block stays within one screen height.
 */
export default function MachineList({ machines }: { machines: MachineView[] }) {
  const t = useTranslations("cnc.machines");
  const [activeSlug, setActiveSlug] = useState(machines[0]?.slug);
  const active = machines.find((m) => m.slug === activeSlug) ?? machines[0];

  const specLabel = (k: string) => t(`labels.${k}`);

  return (
    <div className="grid lg:grid-cols-[1.35fr_1fr] gap-8 lg:gap-10 items-start">
      {/* THUMBNAIL GRID — photo + model, 3 per row */}
      <ul
        className="m-0 p-0 list-none grid grid-cols-2 sm:grid-cols-3 gap-3"
        aria-label={t("listLabel")}
      >
        {machines.map((m, i) => {
          const isActive = m.slug === active?.slug;
          return (
            <li key={m.slug} className="m-0">
              <button
                type="button"
                onClick={() => setActiveSlug(m.slug)}
                aria-pressed={isActive}
                className={`group block w-full text-left border bg-white transition-colors duration-200 ${
                  isActive ? "border-ink" : "border-line hover:border-ink/40"
                }`}
              >
                <span className="relative block aspect-[4/3] bg-paper-2/50 overflow-hidden">
                  <span className="absolute inset-0 qs-grid-bg opacity-50" aria-hidden="true"></span>
                  <Image
                    src={m.image.src}
                    alt={m.model}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-contain p-3 relative"
                    priority={i === 0}
                  />
                  <span
                    className={`absolute left-0 top-0 h-full w-0.5 bg-gold transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden="true"
                  ></span>
                </span>
                <span className="block px-3 py-2.5 border-t border-line">
                  <span className="block font-display font-bold text-ink tracking-[-.01em] text-[14px] leading-none">
                    {m.model}
                  </span>
                  <span className="block font-mono text-[10.5px] text-muted mt-1.5">
                    {t(`categories.${m.category}`)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* SPEC PANEL — no photo; follows the selected thumbnail */}
      <div className="lg:sticky lg:top-24">
        {active && (
          <div className="border border-line bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-grad" aria-hidden="true"></div>

            <div className="px-6 pt-6 pb-4 border-b border-line">
              <span className="qs-tag">{t(`categories.${active.category}`)}</span>
              <h3 className="font-display font-bold text-ink text-[22px] tracking-[-.02em] leading-none mt-3">
                {active.model}
              </h3>
              <p className="text-[13px] leading-[1.6] text-muted mt-2.5 m-0">
                {active.tagline}
              </p>
            </div>

            <dl className="m-0 px-6 py-1">
              {active.highlights.map((s) => (
                <div
                  key={s.k}
                  className="flex items-baseline justify-between gap-6 py-2 border-b border-line last:border-0"
                >
                  <dt className="text-[12.5px] text-muted m-0">{specLabel(s.k)}</dt>
                  <dd className="font-mono text-[12.5px] text-ink text-right m-0">{s.v}</dd>
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
  );
}
