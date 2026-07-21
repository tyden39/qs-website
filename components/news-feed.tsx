"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";

export type NewsItem = {
  href: string;
  img: string;
  cat: string;
  date: string;
  title: string;
  desc: string;
  /** Read-time label, e.g. "4 phút đọc". */
  read: string;
  /** Optional corner badge on the lead cover. */
  badge?: string;
};

const INTERVAL = 5500; // ms each story stays featured before auto-advancing

/**
 * Newsroom feed — the active story fills the immersive lead on the left while the
 * right column lists every story with a thumbnail. Autoplay walks the list and
 * swaps the lead (re-keyed → replays the qs-rise cross-fade); hovering/focusing the
 * feed pauses the cycle and lets the pointer drive which story is featured.
 *
 * Each row's gold edge bar only shows on hover (uniform across rows). The *active*
 * row is marked differently — lit thumbnail + gold title + an autoplay progress seam
 * — so the live indicator never looks like a frozen border. Honours
 * prefers-reduced-motion (no autoplay, static progress). First item renders on the
 * server so the lead headline + cover are in the initial HTML.
 */
export default function NewsFeed({ items }: { items: NewsItem[] }) {
  const t = useTranslations("news.feed");
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animate, setAnimate] = useState(true);

  // Honour prefers-reduced-motion: no autoplay, no progress bar.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setAnimate(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Auto-advance the featured story; pause while the feed is hovered/focused.
  useEffect(() => {
    if (!animate || paused || items.length < 2) return;
    const id = window.setInterval(
      () => setActive((a) => (a + 1) % items.length),
      INTERVAL,
    );
    return () => window.clearInterval(id);
  }, [animate, paused, active, items.length]);

  const lead = items[active];

  return (
    <div
      className="grid md:grid-cols-[1.25fr_1fr] gap-8 lg:gap-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* LEAD — the active story, re-keyed so each advance replays the rise/cross-fade */}
      <Link
        href={lead.href}
        aria-live="polite"
        className="group relative block aspect-video overflow-hidden rounded-[6px] bg-ink-2"
      >
        <Image
          key={active}
          src={lead.img}
          alt={lead.title}
          fill
          sizes="(max-width:1024px) 100vw, 52vw"
          className="qs-rise object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(10,10,8,.94) 6%,rgba(10,10,8,.36) 48%,rgba(10,10,8,.08) 100%)" }} />
        {/* perpetual broadcast scan-line + ember breathe */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] qs-scan" aria-hidden="true" />
        <div className="qs-breathe pointer-events-none absolute inset-x-0 bottom-0 h-1/2" style={{ background: "radial-gradient(ellipse 72% 82% at 28% 124%, rgba(232,200,120,.22), transparent 70%)" }} aria-hidden="true" />
        {/* light sheen sweeping across the cover on hover */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1000ms] ease-out" style={{ background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,.14) 50%, transparent 60%)" }} aria-hidden="true" />
        <div className="pointer-events-none absolute inset-4 border border-white/12 transition-colors duration-500 group-hover:border-gold-2/55">
          <span className="absolute -top-px -left-px w-3.5 h-3.5 border-t border-l border-gold-2" />
          <span className="absolute -top-px -right-px w-3.5 h-3.5 border-t border-r border-gold-2" />
          <span className="absolute -bottom-px -left-px w-3.5 h-3.5 border-b border-l border-gold-2" />
          <span className="absolute -bottom-px -right-px w-3.5 h-3.5 border-b border-r border-gold-2" />
        </div>
        {lead.badge && (
          <span className="absolute top-7 left-7 font-mono text-label-xs text-gold-2 tracking-[.2em] uppercase">[ {lead.badge} ]</span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-8 lg:p-10">
          <h3 className="font-display font-semibold text-white text-subhead lg:text-h2 leading-[1.12] tracking-[-.01em] max-w-[24ch]">{lead.title}</h3>
          <p className="text-[#d2ccba] text-meta leading-[1.6] mt-3.5 max-w-[52ch]">{lead.desc}</p>
          <div className="mt-5 font-mono text-label-xs text-gold-2 tracking-[.14em]">{lead.date} · {lead.read}</div>
        </div>
      </Link>

      {/* WIRE FEED — every story with a thumbnail; active row drives the lead */}
      <div className="flex flex-col">
        <div className="relative flex items-center justify-between pb-3 mb-1 border-b border-line">
          <span className="qs-trace pointer-events-none absolute left-0 right-0 bottom-[-1px] h-px" aria-hidden="true" />
          <span className="font-mono text-label-xs tracking-[.18em] uppercase text-muted inline-flex items-center gap-2"><span className="qs-live-dot" />{t("latest")}</span>
          <span className="font-mono text-label-xs tracking-[.14em] text-gold-1">{String(items.length).padStart(2, "0")} {t("bulletins")}</span>
        </div>
        {items.map((n, i) => (
          <Link
            key={n.href + i}
            href={n.href}
            data-active={i === active ? "true" : undefined}
            onMouseEnter={() => setActive(i)}
            className="qs-wire group relative grid grid-cols-[auto_1fr_auto] gap-4 items-center py-4 border-b border-line transition-[padding] duration-300 hover:pl-3 qs-rise"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* gold edge bar — hover only, identical for every row */}
            <span className="absolute left-0 inset-y-3 w-[2px] bg-gold-2 origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
            {/* thumbnail — lit when the row is the featured story */}
            <span className="relative w-[78px] h-[58px] shrink-0 overflow-hidden rounded-[3px] border border-line transition-colors duration-300 group-hover:border-gold-2/70 group-data-[active=true]:border-gold-2/70">
              <Image src={n.img} alt="" fill sizes="78px" className="object-cover transition-transform duration-500 group-hover:scale-105 group-data-[active=true]:scale-105" />
              <span className="absolute inset-0 bg-ink/25 transition-opacity duration-300 group-hover:opacity-0 group-data-[active=true]:opacity-0" />
            </span>
            <div className="min-w-0">
              <span className="font-mono text-label-xs text-muted tracking-[.16em] uppercase block mb-1">{n.cat} · {n.date}</span>
              <h4 className="font-display font-semibold text-meta leading-[1.35] m-0 tracking-[-.005em] text-ink line-clamp-2 transition-colors group-hover:text-gold-1 group-data-[active=true]:text-gold-1">{n.title}</h4>
            </div>
            <span className="font-mono text-gold-1 text-meta opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">→</span>
            {/* autoplay progress seam — only under the active row, restarts on advance */}
            {i === active && (
              <span className="pointer-events-none absolute left-0 right-0 bottom-0 h-[2px] bg-line/60 overflow-hidden">
                {animate && !paused && items.length > 1 ? (
                  <span key={active} className="block h-full bg-gold-2" style={{ animation: `qs-progress ${INTERVAL}ms linear forwards` }} />
                ) : (
                  <span className="block h-full w-2/5 bg-gold-2/70" />
                )}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
