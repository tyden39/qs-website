"use client";

import { useMemo, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";

/**
 * Interactive spec configurator (illustrative mockup). Picking a travel package,
 * spindle and tool magazine recomputes the summary panel live; the quote button
 * deep-links to /contact with the built configuration pre-filled into the message
 * field (read there from ?message=). Option data is language-neutral (model codes +
 * numbers); numbers are locale-formatted at render, and all UI labels come from i18n.
 */

type Travel = { id: string; model: string; xyz: [number, number, number]; table: [number, number]; load: number };
type Spindle = { id: string; taper: string; rpm: number; kw: number };
type Magazine = { id: string; tools: number };

const TRAVELS: Travel[] = [
  { id: "650", model: "VMC-650", xyz: [650, 420, 500], table: [800, 420], load: 400 },
  { id: "850", model: "VMC-850", xyz: [850, 500, 540], table: [1000, 500], load: 500 },
  { id: "1160", model: "VMC-1160", xyz: [1100, 600, 640], table: [1300, 600], load: 800 },
];
const SPINDLES: Spindle[] = [
  { id: "bt40-12", taper: "BT40", rpm: 12000, kw: 11 },
  { id: "bt40-15", taper: "BT40", rpm: 15000, kw: 15 },
  { id: "bt50-8", taper: "BT50", rpm: 8000, kw: 18.5 },
];
const MAGAZINES: Magazine[] = [
  { id: "16", tools: 16 },
  { id: "24", tools: 24 },
  { id: "32", tools: 32 },
];

const DEFAULTS = { travel: "850", spindle: "bt40-12", magazine: "24" };

export default function MachineConfigurator({ locale }: { locale: string }) {
  const t = useTranslations("cnc.configurator");
  const [travelId, setTravelId] = useState(DEFAULTS.travel);
  const [spindleId, setSpindleId] = useState(DEFAULTS.spindle);
  const [magId, setMagId] = useState(DEFAULTS.magazine);

  const nf = useMemo(
    () => new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US"),
    [locale],
  );

  const travel = TRAVELS.find((x) => x.id === travelId)!;
  const spindle = SPINDLES.find((x) => x.id === spindleId)!;
  const mag = MAGAZINES.find((x) => x.id === magId)!;

  const travelStr = travel.xyz.map((n) => nf.format(n)).join(" / ") + " mm";
  const tableStr = `${nf.format(travel.table[0])} × ${nf.format(travel.table[1])} mm · ${nf.format(travel.load)} kg`;
  const spindleStr = `${spindle.taper} · ${nf.format(spindle.rpm)} ${locale === "vi" ? "v/ph" : "rpm"} · ${spindle.kw} kW`;
  const magStr = `${mag.tools} ${locale === "vi" ? "dao" : "tools"}`;
  const accuracyStr = "±0.005 mm";

  const summary = [
    { k: t("summary.model"), v: travel.model },
    { k: t("summary.travel"), v: travelStr },
    { k: t("summary.table"), v: tableStr },
    { k: t("summary.spindle"), v: spindleStr },
    { k: t("summary.magazine"), v: magStr },
    { k: t("summary.accuracy"), v: accuracyStr },
  ];

  // Pre-fill the contact message with a readable build sheet.
  const quoteMessage = [
    t("quoteIntro"),
    ...summary.map((r) => `• ${r.k}: ${r.v}`),
  ].join("\n");
  const quoteHref = `/contact?message=${encodeURIComponent(quoteMessage)}`;

  const isDefault =
    travelId === DEFAULTS.travel && spindleId === DEFAULTS.spindle && magId === DEFAULTS.magazine;

  const reset = () => {
    setTravelId(DEFAULTS.travel);
    setSpindleId(DEFAULTS.spindle);
    setMagId(DEFAULTS.magazine);
  };

  return (
    <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-8 lg:gap-12 items-start">
      {/* OPTION GROUPS */}
      <div className="space-y-8">
        <OptionGroup
          title={t("groups.travel")}
          index="01"
          options={TRAVELS.map((x) => ({ id: x.id, top: x.model, sub: x.xyz.map((n) => nf.format(n)).join("/") + " mm" }))}
          value={travelId}
          onChange={setTravelId}
        />
        <OptionGroup
          title={t("groups.spindle")}
          index="02"
          options={SPINDLES.map((x) => ({ id: x.id, top: x.taper, sub: `${nf.format(x.rpm)} ${locale === "vi" ? "v/ph" : "rpm"}` }))}
          value={spindleId}
          onChange={setSpindleId}
        />
        <OptionGroup
          title={t("groups.magazine")}
          index="03"
          options={MAGAZINES.map((x) => ({ id: x.id, top: `${x.tools}`, sub: locale === "vi" ? "dao" : "tools" }))}
          value={magId}
          onChange={setMagId}
        />
      </div>

      {/* LIVE SUMMARY */}
      <div className="border border-line bg-white relative overflow-hidden lg:sticky lg:top-24">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-grad" aria-hidden="true"></div>
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-[.18em] uppercase text-gold-1 inline-flex items-center gap-2">
            <span className="qs-live-dot" aria-hidden="true"></span>{t("summary.label")}
          </span>
          <span className="font-display font-bold text-ink tracking-[-.02em]">{travel.model}</span>
        </div>
        <dl className="m-0 px-6 py-2">
          {summary.map((r) => (
            <div key={r.k} className="flex items-baseline justify-between gap-6 py-3 border-b border-line last:border-0">
              <dt className="text-[13px] text-muted m-0">{r.k}</dt>
              <dd className="font-mono text-[13px] text-ink text-right m-0">{r.v}</dd>
            </div>
          ))}
        </dl>
        <div className="px-6 pt-2 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link className="qs-btn qs-btn-gold" href={quoteHref}>
              {t("quoteCta")} <span className="arr">→</span>
            </Link>
            <button
              type="button"
              onClick={reset}
              disabled={isDefault}
              className="font-mono text-[11px] tracking-[.12em] uppercase text-muted border-b border-transparent hover:text-ink hover:border-ink disabled:opacity-40 disabled:hover:text-muted disabled:hover:border-transparent transition-colors"
            >
              {t("resetCta")}
            </button>
          </div>
          <p className="text-[12px] leading-[1.6] text-muted mt-4 m-0">{t("note")}</p>
        </div>
      </div>
    </div>
  );
}

function OptionGroup({
  title,
  index,
  options,
  value,
  onChange,
}: {
  title: string;
  index: string;
  options: { id: string; top: string; sub: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="font-mono text-[11px] tracking-[.2em] uppercase text-gold-1 pb-3 border-b-2 border-gold/60 flex items-center justify-between">
        {title}
        <span className="text-muted">{index}</span>
      </h3>
      <div className="grid grid-cols-3 gap-2.5 mt-4" role="radiogroup" aria-label={title}>
        {options.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.id)}
              className={`text-left px-3 py-3 border transition-colors duration-200 ${
                active
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink hover:border-ink-3"
              }`}
            >
              <span className="block font-display font-semibold text-[14px] leading-tight tracking-[-.01em]">{o.top}</span>
              <span className={`block font-mono text-[10px] mt-1 ${active ? "text-gold-2" : "text-muted"}`}>{o.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
