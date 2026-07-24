"use client";
import Image from "next/image";
import { useEffect, useState, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { CategoryIcon } from "@/components/category-icon";
import { setFilterParams, useFilterParams } from "@/lib/use-filter-params";

function closeSearch(){
  document.getElementById("qs-search-panel")?.classList.remove("open");
  document.getElementById("qs-search-backdrop")?.classList.remove("open");
}

export default function Header() {
  const t = useTranslations("nav");
  // Sub-type labels are reused from the catalogue namespaces (not duplicated in
  // nav.json) so the flyout wording tracks the pages one-to-one.
  const tp = useTranslations("product");
  const tc = useTranslations("cnc");
  // i18n-aware usePathname returns the locale-stripped path so active-state
  // matching works regardless of /en prefix.
  const path = usePathname();
  const is = (href: string) => path === href || (href !== "/" && path.startsWith(href));

  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever navigation lands on a new route. Comparing
  // the previous path during render (rather than in an effect) applies the reset
  // in the same pass, avoiding an extra render and the set-state-in-effect rule.
  const [prevPath, setPrevPath] = useState(path);
  if (prevPath !== path) {
    setPrevPath(path);
    setOpen(false);
  }

  // Opening the search panel closes the mobile drawer, and vice versa, so only
  // one overlay is ever live at a time.
  function openSearch() {
    setOpen(false);
    document.getElementById("qs-search-panel")?.classList.add("open");
    document.getElementById("qs-search-backdrop")?.classList.add("open");
    setTimeout(() => document.getElementById("qs-search-field")?.focus(), 50);
  }
  function toggleMenu() {
    setOpen((v) => {
      if (!v) closeSearch();
      return !v;
    });
  }

  // Lock body scroll while the drawer is open so the page behind cannot drift.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Mobile-drawer accordions: at most one catalogue submenu (openSub) and one
  // nested sub-type list (openSub2) is expanded at a time. Tracked by href so
  // the state survives the drawer close reset.
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [openSub2, setOpenSub2] = useState<string | null>(null);

  // Catalogue dropdown children deep-link into each landing page's category
  // tree via its `?g=<group>[&t=<type>]` filter (see lib/use-filter-params). The
  // ids are the tree's own slugs — including the Vietnamese material tags the
  // applications tree derives its ids from — so they are URL-encoded here. A
  // child that carries a clean sub-type taxonomy adds a `&t=..` flyout.
  // `icon` is a CategoryIcon slug on the catalogue dropdown leaves at every
  // depth; omitted on top-level items (no room in the desktop bar).
  type NavLeaf = { page: string; g: string; type?: string; label: string; icon?: string };
  type NavChild = NavLeaf & { children?: NavLeaf[] };
  type NavItem = { href: string; label: string; children?: NavChild[] };
  // Href carries only the filter query — no `#list` anchor — so a cross-page
  // click lands at the page top with the filter applied rather than scrolling
  // down to the list; a same-page click is intercepted by onLeafClick instead.
  const leafHref = (l: NavLeaf) =>
    `${l.page}?g=${encodeURIComponent(l.g)}${l.type ? `&t=${encodeURIComponent(l.type)}` : ""}`;
  // When already on the leaf's page, filter in place instead of a full
  // navigation (which would jump to the page top), keeping the current scroll
  // position rather than scrolling to the list.
  // `trailingSlash: true` makes usePathname() return "/controller/", so compare
  // with trailing slashes stripped or the same-page branch never matches.
  const samePath = (a: string, b: string) =>
    (a.replace(/\/+$/, "") || "/") === (b.replace(/\/+$/, "") || "/");
  const onLeafClick = (e: MouseEvent, l: NavLeaf) => {
    setOpen(false);
    // Release focus so the desktop flyout — kept open by group-focus-within for
    // keyboard reach — collapses once the pointer leaves after a same-page click.
    (e.currentTarget as HTMLElement).blur();
    if (!samePath(path, l.page)) return; // different page → let the Link navigate
    e.preventDefault();
    setFilterParams({ g: l.g, t: l.type ?? null });
  };

  // A dropdown leaf is active when the current page and its filter query match
  // the leaf's deep-link. A group leaf (no `type`) also lights up while any of
  // its sub-types is selected, giving the open branch an ancestor highlight.
  const params = useFilterParams();
  const curG = params.get("g");
  const curT = params.get("t");
  const leafActive = (l: NavLeaf) =>
    samePath(path, l.page) && curG === l.g && (l.type ? curT === l.type : true);
  // Desktop leaves carry a transparent left rail so the active gold rail adds no
  // width shift; mobile leaves promote the muted text to gold when active.
  const leafState = (l: NavLeaf) =>
    leafActive(l)
      ? "border-gold-1 bg-paper text-gold-1 font-semibold"
      : "border-transparent text-ink hover:bg-paper hover:text-gold-1";
  const leafStateMobile = (l: NavLeaf) =>
    leafActive(l) ? "text-gold-1 font-semibold" : "text-muted hover:text-gold-1";

  const electronicsChildren: NavChild[] = [
    {
      page: "/controller", g: "controllers", icon: "controllers", label: t("submenu.electronics.controllers"),
      children: (["motion", "cnc", "robot", "cobot"] as const).map((ct) => ({
        page: "/controller", g: "controllers", type: ct, icon: ct, label: tp(`page.types.controllers.${ct}`),
      })),
    },
    { page: "/controller", g: "servo", icon: "servo", label: t("submenu.electronics.servo") },
    { page: "/controller", g: "inverter", icon: "inverter", label: t("submenu.electronics.inverter") },
    { page: "/controller", g: "dnc", icon: "dnc", label: t("submenu.electronics.dnc") },
    { page: "/controller", g: "accessory", icon: "accessory", label: t("submenu.electronics.accessory") },
  ];
  const machineChildren: NavChild[] = [
    {
      page: "/mechatronics", g: "cnc", icon: "machine", label: t("submenu.machineBuilding.cnc"),
      children: (["milling", "router", "jewelry"] as const).map((cat) => ({
        page: "/mechatronics", g: "cnc", type: cat, icon: cat, label: tc(`machines.categories.${cat}`),
      })),
    },
    { page: "/mechatronics", g: "automation", icon: "automation", label: t("submenu.machineBuilding.automation") },
    { page: "/mechatronics", g: "inspection", icon: "inspection", label: t("submenu.machineBuilding.inspection") },
  ];
  const applicationsChildren: NavChild[] = ([
    ["kim loại", "metal"],
    ["gỗ", "wood"],
    ["đá", "stone"],
    ["kim hoàn", "jewelry"],
    ["automation", "automation"],
  ] as const).map(([id, key]) => ({
    page: "/applications", g: id, icon: key, label: t(`submenu.applications.${key}`),
  }));

  const left: NavItem[] = [
    { href: "/controller", label: t("products"), children: electronicsChildren },
    { href: "/mechatronics", label: t("cnc"), children: machineChildren },
    { href: "/applications", label: t("applications"), children: applicationsChildren },
    { href: "/services", label: t("services") },
    { href: "/downloads", label: t("downloads") },
  ];
  const right: NavItem[] = [
    { href: "/about", label: t("about") },
    { href: "/news", label: t("news") },
    { href: "/contact", label: t("contact") },
  ];
  const all = [...left, ...right];

  // Desktop nav item: a plain link, or a hover/focus dropdown trigger when the
  // catalogue entry carries category children. The panel opens on hover and on
  // keyboard focus (group-focus-within) so it is reachable without a pointer.
  const renderDesktopItem = (item: NavItem) => {
    const active = is(item.href);
    if (!item.children) {
      return (
        <Link key={item.href} href={item.href} className={`qs-menu-link p-2 lg:px-4! lg:py-2! ${active ? "is-active" : ""}`}>
          {item.label}
        </Link>
      );
    }
    return (
      <div key={item.href} className="relative group">
        {/* Blur on click: the trigger would otherwise keep focus after navigating
            and group-focus-within would hold the panel open past the hover out. */}
        <Link
          href={item.href}
          onClick={(e) => (e.currentTarget as HTMLElement).blur()}
          className={`qs-menu-link p-2 lg:px-4! lg:py-2! inline-flex items-center gap-1 ${active ? "is-active" : ""}`}
        >
          {item.label}
          <svg className="opacity-60 transition-transform duration-200 group-hover:rotate-180" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </Link>
        {/* pt-2 bridges the hover gap so the pointer can cross into the panel */}
        <div className="absolute left-0 top-full pt-2 z-50 hidden group-hover:block group-focus-within:block">
          <div className="min-w-[13rem] bg-white border border-line shadow-[0_24px_40px_-20px_rgba(20,18,14,.28)] py-1.5">
            {item.children.map((c) =>
              c.children ? (
                // Nested flyout: opens to the right of the parent row on hover/focus.
                <div key={leafHref(c)} className="relative group/sub">
                  <Link href={leafHref(c)} onClick={(e) => onLeafClick(e, c)} className={`flex items-center justify-between gap-4 px-4 py-2.5 border-l-2 text-meta whitespace-nowrap transition-colors ${leafState(c)}`}>
                    <span className="flex items-center gap-2.5 min-w-0">
                      {c.icon ? <CategoryIcon name={c.icon} className="w-[18px] h-[18px] shrink-0 opacity-75" /> : null}
                      {c.label}
                    </span>
                    <svg className="opacity-50" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>
                  </Link>
                  <div className="absolute left-full top-0 pl-1 hidden group-hover/sub:block group-focus-within/sub:block">
                    <div className="min-w-[12rem] bg-white border border-line shadow-[0_24px_40px_-20px_rgba(20,18,14,.28)] py-1.5">
                      {c.children.map((s) => (
                        <Link key={leafHref(s)} href={leafHref(s)} onClick={(e) => onLeafClick(e, s)} className={`flex items-center gap-2.5 px-4 py-2.5 border-l-2 text-meta whitespace-nowrap transition-colors ${leafState(s)}`}>
                          {s.icon ? <CategoryIcon name={s.icon} className="w-4 h-4 shrink-0 opacity-75" /> : null}
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={leafHref(c)} href={leafHref(c)} onClick={(e) => onLeafClick(e, c)} className={`flex items-center gap-2.5 px-4 py-2.5 border-l-2 text-meta whitespace-nowrap transition-colors ${leafState(c)}`}>
                  {c.icon ? <CategoryIcon name={c.icon} className="w-[18px] h-[18px] shrink-0 opacity-75" /> : null}
                  {c.label}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    );
  };

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
            <a href="tel:+84922322338" className="qs-topstrip-link">(+84) 922.322.338</a>
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
                <Image src="/logo-st.webp" alt="ST" width={320} height={164} priority className="h-[38px] lg:h-[42px] w-auto block" />
              </span>
              <div className="flex flex-col leading-[1.1]">
                <b className="font-display font-bold text-meta tracking-[.04em] whitespace-nowrap">QS TECHNOLOGY</b>
                <small className="hidden sm:block font-mono text-label-xs text-muted tracking-[.18em] uppercase whitespace-nowrap">CNC · Automation · Vietnam</small>
              </div>
            </Link>
            <div className="hidden lg:flex gap-0.5">
              {left.map(renderDesktopItem)}
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-2">
            <div className="hidden lg:flex gap-0.5">
              {right.map(renderDesktopItem)}
            </div>
            <div className="flex items-center gap-1.5 pl-2 lg:border-l border-line lg:ml-1">
              <button onClick={openSearch} aria-label={t("search")} className="qs-icon-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
              </button>
              <div className="hidden sm:block"><LocaleSwitcher /></div>
              <a href="https://crm.qstcnc.com/login" className="hidden lg:inline-flex items-center rounded bg-ink px-3 py-1 text-label font-mono font-semibold uppercase tracking-widest text-white transition-colors hover:bg-black">{t("login")}</a>
              {/* hamburger — only below the desktop nav breakpoint. Wrapped in a
                  plain div so `lg:hidden` wins: `.qs-icon-btn` is an unlayered
                  rule and would otherwise beat the layered utility on the button. */}
              <div className="lg:hidden flex">
                <button
                  onClick={toggleMenu}
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
            {all.map((item) => {
              const { href: h, label: l, children } = item;
              if (!children) {
                return (
                  <Link
                    key={h}
                    href={h}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between py-3.5 border-b border-line font-display font-medium text-lede tracking-[-.005em] transition-colors ${is(h) ? "text-gold-1" : "text-ink hover:text-gold-1"}`}
                  >
                    {l}
                    <span className={`font-mono text-meta ${is(h) ? "text-gold-1" : "text-muted"}`}>→</span>
                  </Link>
                );
              }
              // Catalogue entry: the label navigates to the landing page, while
              // the chevron toggles the category sub-list in place.
              const expanded = openSub === h;
              return (
                <div key={h} className="border-b border-line">
                  <div className="flex items-center justify-between">
                    <Link
                      href={h}
                      onClick={() => setOpen(false)}
                      className={`flex-1 py-3.5 font-display font-medium text-lede tracking-[-.005em] transition-colors ${is(h) ? "text-gold-1" : "text-ink hover:text-gold-1"}`}
                    >
                      {l}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setOpenSub((v) => (v === h ? null : h))}
                      aria-expanded={expanded}
                      aria-label={l}
                      className="p-2 -mr-2 text-muted"
                    >
                      <svg className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                  </div>
                  {expanded && (
                    <div className="pb-2 pl-3 flex flex-col">
                      {children.map((c) => {
                        if (!c.children) {
                          return (
                            <Link
                              key={leafHref(c)}
                              href={leafHref(c)}
                              onClick={(e) => onLeafClick(e, c)}
                              className={`flex items-center gap-2.5 py-2.5 font-display text-meta transition-colors ${leafStateMobile(c)}`}
                            >
                              {c.icon ? <CategoryIcon name={c.icon} className="w-4 h-4 shrink-0 opacity-70" /> : null}
                              {c.label}
                            </Link>
                          );
                        }
                        // Nested sub-type list: label links to the filtered
                        // group, chevron expands the sub-types in place.
                        const childKey = leafHref(c);
                        const sub2 = openSub2 === childKey;
                        return (
                          <div key={childKey}>
                            <div className="flex items-center justify-between">
                              <Link
                                href={childKey}
                                onClick={(e) => onLeafClick(e, c)}
                                className={`flex-1 flex items-center gap-2.5 py-2.5 font-display text-meta transition-colors ${leafStateMobile(c)}`}
                              >
                                {c.icon ? <CategoryIcon name={c.icon} className="w-4 h-4 shrink-0 opacity-70" /> : null}
                                {c.label}
                              </Link>
                              <button
                                type="button"
                                onClick={() => setOpenSub2((v) => (v === childKey ? null : childKey))}
                                aria-expanded={sub2}
                                aria-label={c.label}
                                className="p-2 -mr-2 text-muted"
                              >
                                <svg className={`transition-transform duration-200 ${sub2 ? "rotate-180" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
                              </button>
                            </div>
                            {sub2 && (
                              <div className="pb-1 pl-3 flex flex-col">
                                {c.children.map((s) => (
                                  <Link
                                    key={leafHref(s)}
                                    href={leafHref(s)}
                                    onClick={(e) => onLeafClick(e, s)}
                                    className={`flex items-center gap-2.5 py-2 font-display text-label transition-colors ${leafStateMobile(s)}`}
                                  >
                                    {s.icon ? <CategoryIcon name={s.icon} className="w-3.5 h-3.5 shrink-0 opacity-70" /> : null}
                                    {s.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            <a
              href="https://crm.qstcnc.com/login"
              onClick={() => setOpen(false)}
              className="mt-5 qs-btn qs-btn-gold justify-center"
            >
              {t("login")}
            </a>
            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5 font-mono text-label tracking-[.1em] uppercase text-muted">
                <a href="tel:+84909663350" className="hover:text-ink">Hotline · (+84) 909.663.350</a>
                <a href="tel:+84922322338" className="hover:text-ink">Hotline · (+84) 922.322.338</a>
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
