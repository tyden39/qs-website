"use client";
import Image from "next/image";
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

  const left = [
    ["/products", t("products")],
    ["/applications", t("applications")],
    ["/services", t("services")],
    ["/downloads", t("downloads")],
  ] as const;
  const right = [
    ["/about", t("about")],
    ["/news", t("news")],
    ["/contact", t("contact")],
  ] as const;

  return (
    <>
      <div className="qs-topstrip">
        <div className="max-w-wrap mx-auto px-12 py-1.5 flex justify-between gap-6">
          <span><span className="qs-topstrip-dot"></span>QS Technology Co., Ltd · Vietnam Made CNC Systems · Est. 2014</span>
          <span className="hidden md:inline">Hotline +84 28 3636 1234 · sales@qstechnology.vn</span>
        </div>
      </div>

      <nav className="qs-nav">
        <div className="max-w-wrap mx-auto px-12 flex items-center justify-between gap-8 h-[72px]">
          <div className="flex items-center gap-7">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid place-items-center h-[42px]">
                <Image src="/logo-st.png" alt="ST" width={120} height={42} priority className="h-[42px] w-auto block" />
              </span>
              <div className="flex flex-col leading-[1.1]">
                <b className="font-display font-bold text-sm tracking-[.04em]">QS TECHNOLOGY</b>
                <small className="font-mono text-[9px] text-muted tracking-[.18em] uppercase">CNC · Automation · Vietnam</small>
              </div>
            </Link>
            <div className="hidden md:flex gap-0.5">
              {left.map(([h,l]) => (
                <Link key={h} href={h} className={`qs-menu-link ${is(h) ? "is-active" : ""}`}>{l}</Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-7">
            <div className="hidden md:flex gap-0.5">
              {right.map(([h,l]) => (
                <Link key={h} href={h} className={`qs-menu-link ${is(h) ? "is-active" : ""}`}>{l}</Link>
              ))}
            </div>
            <div className="flex items-center gap-1.5 pl-2 border-l border-line ml-1">
              <button onClick={openSearch} aria-label={t("search")} className="qs-icon-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
              </button>
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
