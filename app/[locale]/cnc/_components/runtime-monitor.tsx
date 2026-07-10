"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Shop-floor runtime readout strip — a DEMO of what a DNC-linked live feed would
 * show (cumulative machine hours, spindle load, feed, active program, parts count).
 * Explicitly labelled as simulated data: values ramp/jitter client-side after mount.
 * When a real DNC data source exists, replace the interval simulation with a fetch.
 * SSR renders the seed values so there is no hydration mismatch.
 */

const SEED = {
  runtime: 18452.6, // cumulative machine hours
  spindle: 68, // %
  feed: 3200, // mm/min
  parts: 47,
};
const PROGRAMS = ["O1042 · BRACKET-A", "O1180 · MANIFOLD", "O0967 · MOUNT-PLATE"];

export default function RuntimeMonitor({ locale }: { locale: string }) {
  const t = useTranslations("cnc.monitor");
  const [runtime, setRuntime] = useState(SEED.runtime);
  const [spindle, setSpindle] = useState(SEED.spindle);
  const [feed, setFeed] = useState(SEED.feed);
  const [parts, setParts] = useState(SEED.parts);
  const [prog, setProg] = useState(0);
  const nfRef = useRef(new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US"));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ticks = 0;
    const id = window.setInterval(() => {
      ticks++;
      setRuntime((r) => Math.round((r + 0.1) * 10) / 10);
      setSpindle(52 + Math.round(Math.random() * 38)); // 52–90 %
      setFeed(2400 + Math.round(Math.random() * 24) * 100); // 2400–4800
      if (ticks % 9 === 0) setParts((p) => p + 1);
      if (ticks % 14 === 0) setProg((p) => (p + 1) % PROGRAMS.length);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const nf = nfRef.current;
  const whole = Math.floor(runtime);
  const decimal = Math.round((runtime - whole) * 10); // single decimal digit, 0–9
  const runtimeStr = nf.format(whole) + (locale === "vi" ? "," : ".") + decimal;
  const feedUnit = locale === "vi" ? "mm/ph" : "mm/min";

  const cells = [
    { label: t("runtime"), value: runtimeStr, unit: "h", wide: true },
    { label: t("spindle"), value: String(spindle), unit: "%" },
    { label: t("feed"), value: nf.format(feed), unit: feedUnit },
    { label: t("parts"), value: String(parts), unit: "" },
    { label: t("program"), value: PROGRAMS[prog], unit: "", mono: true, wide: true },
  ];

  return (
    <div className="bg-ink text-[#cfc9b8] border-b border-[#2a2620]">
      <div className="qs-wrap-wide py-3.5 flex flex-wrap items-center gap-x-8 gap-y-3">
        {/* status + demo notice */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[.18em] uppercase text-gold-2">
            <span className="qs-live-dot" aria-hidden="true"></span>{t("status")}
          </span>
          <span className="font-mono text-[10px] tracking-[.14em] uppercase text-[#8a8676]">{t("label")}</span>
        </div>

        {/* readout cells */}
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3 flex-1 min-w-0">
          {cells.map((c) => (
            <div key={c.label} className={`flex flex-col ${c.wide ? "" : "min-w-[64px]"}`}>
              <span className="font-mono text-[9px] tracking-[.14em] uppercase text-[#8a8676] leading-none">{c.label}</span>
              <span className="font-mono text-[15px] text-gold-2 tabular-nums leading-tight mt-1">
                {c.value}
                {c.unit && <span className="text-[10px] text-[#8a8676] ml-1">{c.unit}</span>}
              </span>
            </div>
          ))}
        </div>

        {/* demo flag */}
        <span className="shrink-0 font-mono text-[9px] tracking-[.14em] uppercase text-[#6f6b5e] border border-[#2a2620] px-2 py-1">
          {t("demo")}
        </span>
      </div>
    </div>
  );
}
