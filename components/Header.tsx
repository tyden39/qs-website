"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";

function openSearch(){
  document.getElementById("qs-search-panel")?.classList.add("open");
  document.getElementById("qs-search-backdrop")?.classList.add("open");
  setTimeout(() => document.getElementById("qs-search-field")?.focus(), 50);
}

export default function Header() {
  const t = useTranslations("nav");
  // i18n-aware usePathname returns the locale-stripped path so active-state
  // matching works regardless of /en prefix.
  const path = usePathname();
  const is = (href: string) => path === href || (href !== "/" && path.startsWith(href));

  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever navigation lands on a new route, and lock
  // body scroll while it is open so the page behind cannot drift.
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const left = [
    ["/products", t("products")],
    ["/cnc", t("cnc")],
    ["/applications", t("applications")],
    ["/services", t("services")],
    ["/downloads", t("downloads")],
  ] as const;
  const right = [
    ["/about", t("about")],
    ["/news", t("news")],
    ["/contact", t("contact")],
  ] as const;
  const all = [...left, ...right];

  return (
    <>
      <div className="qs-topstrip">
        <div className="qs-wrap-wide py-1.5 flex justify-between items-center gap-6">
          <span className="min-w-0 truncate"><span className="qs-topstrip-dot"></span>QS Technology Co., Ltd · {t("tagline")}</span>
          {/* On phones the tap-to-call hotline is the highest-value strip item, so
              it stays visible while the full hotline+email pair waits for md. */}
          <a href="tel:+84909663350" className="md:hidden shrink-0 qs-topstrip-link">(+84) 909.663.350</a>
          <span className="hidden md:inline shrink-0">
            Hotline <a href="tel:+84909663350" className="qs-topstrip-link">(+84) 909.663.350</a>
            {" · "}
            <a href="mailto:support@qstcnc.com" className="qs-topstrip-link">support@qstcnc.com</a>
          </span>
        </div>
      </div>

      <nav className="qs-nav relative">
        <div className="qs-wrap-wide flex items-center justify-between gap-4 lg:gap-0 h-[64px] lg:h-[72px]">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <span className="grid place-items-center h-[38px] lg:h-[42px]">
                <Image src="/logo-st.png" alt="ST" width={1707} height={877} priority className="h-[38px] lg:h-[42px] w-auto block" />
              </span>
              <div className="flex flex-col leading-[1.1]">
                <b className="font-display font-bold text-sm tracking-[.04em] whitespace-nowrap">QS TECHNOLOGY</b>
                <small className="hidden sm:block font-mono text-[9px] text-muted tracking-[.18em] uppercase whitespace-nowrap">CNC · Automation · Vietnam</small>
              </div>
            </Link>
            <div className="hidden lg:flex gap-0.5">
              {left.map(([h,l]) => (
                <Link key={h} href={h} className={`qs-menu-link p-2 lg:px-4! lg:py-2! ${is(h) ? "is-active" : ""}`}>{l}</Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-2">
            <div className="hidden lg:flex gap-0.5">
              {right.map(([h,l]) => (
                <Link key={h} href={h} className={`qs-menu-link p-2 lg:px-4! lg:py-2! ${is(h) ? "is-active" : ""}`}>{l}</Link>
              ))}
            </div>
            <div className="flex items-center gap-1.5 pl-2 lg:border-l border-line lg:ml-1">
              <button onClick={openSearch} aria-label={t("search")} className="qs-icon-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
              </button>
              <div className="hidden sm:block"><LocaleSwitcher /></div>
              <a href="https://crm.qstcnc.com/login" className="hidden lg:inline-flex items-center rounded bg-ink px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-widest text-white transition-colors hover:bg-black">{t("login")}</a>
              {/* hamburger — only below the desktop nav breakpoint. Wrapped in a
                  plain div so `lg:hidden` wins: `.qs-icon-btn` is an unlayered
                  rule and would otherwise beat the layered utility on the button. */}
              <div className="lg:hidden flex">
                <button
                  onClick={() => setOpen((v) => !v)}
                  aria-label={open ? t("close") : t("menu")}
                  aria-expanded={open}
                  aria-controls="qs-mobile-menu"
                  className="qs-icon-btn"
                >
                  {open ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER — slide-down anchored to the sticky bar (below lg).
            Absolute `top-full` keeps it glued under the bar whether or not the
            topstrip has scrolled away. */}
        <div
          id="qs-mobile-menu"
          className={`lg:hidden absolute top-full inset-x-0 z-50 origin-top bg-white border-t border-line shadow-[0_24px_40px_-20px_rgba(20,18,14,.28)] transition-[transform,opacity] duration-200 ${open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0 pointer-events-none"}`}
        >
          <div className="qs-wrap-wide py-4 flex flex-col max-h-[calc(100dvh-64px)] overflow-y-auto">
            {all.map(([h, l]) => (
              <Link
                key={h}
                href={h}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between py-3.5 border-b border-line font-display font-medium text-[17px] tracking-[-.005em] transition-colors ${is(h) ? "text-gold-1" : "text-ink hover:text-gold-1"}`}
              >
                {l}
                <span className={`font-mono text-sm ${is(h) ? "text-gold-1" : "text-muted"}`}>→</span>
              </Link>
            ))}
            <a
              href="https://crm.qstcnc.com/login"
              onClick={() => setOpen(false)}
              className="mt-5 qs-btn qs-btn-gold justify-center"
            >
              {t("login")}
            </a>
            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5 font-mono text-[11px] tracking-[.1em] uppercase text-muted">
                <a href="tel:+84909663350" className="hover:text-ink">Hotline · (+84) 909.663.350</a>
                <a href="mailto:support@qstcnc.com" className="hover:text-ink lowercase tracking-[.06em]">support@qstcnc.com</a>
              </div>
              <div className="sm:hidden shrink-0"><LocaleSwitcher /></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop — dims the page behind the open drawer (sits below the z-50 nav
          bar so the close button stays live). */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-[rgba(10,8,6,.45)] transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />
    </>
  );
}
