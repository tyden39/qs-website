"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { createSearchDb, searchDb, type SearchDb, type SearchRecord } from "@/lib/search/engine";

/** A featured product card, derived from real catalogue data by the layout. */
export type FeaturedProduct = {
  slug: string;
  name: string;
  /** `axes · display`, e.g. "4 trục · 5"". */
  meta: string;
  /** Localized product tag line, e.g. "F54 CNC Controller". */
  tag: string;
  img: string;
};

const MAX_SUGGESTIONS = 7;

function close() {
  document.getElementById("qs-search-panel")?.classList.remove("open");
  document.getElementById("qs-search-backdrop")?.classList.remove("open");
}

export default function SearchPanel({
  featured,
  productCount,
}: {
  featured: FeaturedProduct[];
  productCount: number;
}) {
  const t = useTranslations("search.panel");
  const tType = useTranslations("search.results.typeLabels");
  const locale = useLocale();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [db, setDb] = useState<SearchDb | null>(null);
  const [suggestions, setSuggestions] = useState<SearchRecord[]>([]);
  // Keyboard-highlighted row among the live suggestions (-1 = none).
  const [active, setActive] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  // The index is locale-specific, so drop any built engine when the locale changes.
  useEffect(() => {
    setDb(null);
    setSuggestions([]);
  }, [locale]);

  // Prebuilt index is fetched and the Orama engine built lazily (once, per
  // locale) the first time the user types, so an unopened panel costs nothing.
  useEffect(() => {
    if (!query || db) return;
    let alive = true;
    fetch(`/search-index.${locale}.json`)
      .then((r) => r.json())
      .then((recs: SearchRecord[]) => createSearchDb(recs))
      .then((built) => alive && setDb(built))
      .catch(() => {
        /* index unavailable — suggestions stay empty */
      });
    return () => {
      alive = false;
    };
  }, [query, db, locale]);

  // Run the Orama query whenever the engine is ready or the term changes.
  useEffect(() => {
    if (!db || !query.trim()) {
      setSuggestions([]);
      return;
    }
    let alive = true;
    searchDb(db, query, MAX_SUGGESTIONS).then((hits) => alive && setSuggestions(hits));
    return () => {
      alive = false;
    };
  }, [db, query]);

  useEffect(() => setActive(-1), [query]);

  function go(href: string) {
    close();
    router.push(href);
  }

  function submit(q: string) {
    const term = q.trim();
    go(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (active >= 0 && suggestions[active]) go(suggestions[active].href);
    else submit(query);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const syncTop = () => {
      const nav = document.querySelector(".qs-nav") as HTMLElement | null;
      const panel = document.getElementById("qs-search-panel");
      if (nav && panel) panel.style.top = `${nav.getBoundingClientRect().bottom}px`;
    };
    syncTop();
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", syncTop, { passive: true });
    window.addEventListener("resize", syncTop);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", syncTop);
      window.removeEventListener("resize", syncTop);
    };
  }, []);

  const querying = query.trim().length > 0;

  return (
    <>
      <div id="qs-search-panel" className="qs-search-panel">
        <div className="qs-wrap-wide pt-7 pb-9 max-h-[min(72vh,640px)] overflow-y-auto">
          {/* search input */}
          <form onSubmit={onSubmit} className="flex items-center gap-3 border-0 border-b-2 border-ink px-1 pb-3.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-55"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
            <input id="qs-search-field" name="q" placeholder={t("placeholder")} autoComplete="off"
                   role="combobox" aria-expanded={querying} aria-autocomplete="list" aria-controls="qs-search-suggestions"
                   value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown}
                   className="flex-1 border-0 outline-0 bg-transparent text-lg font-display font-medium text-ink placeholder:text-muted placeholder:font-normal"/>
            <button type="button" onClick={close} aria-label={t("close")} className="w-11 h-11 grid place-items-center text-muted hover:text-ink text-sm">✕</button>
          </form>

          {/* live suggestions (autocomplete) */}
          {querying ? (
            <div className="mt-6">
              <div className="font-mono text-[10px] tracking-[.18em] uppercase text-muted mb-3.5">{t("suggestions")}</div>
              {db && suggestions.length === 0 ? (
                <p className="text-sm text-muted py-2">{t("noSuggestions", { query: query.trim() })}</p>
              ) : (
                <div id="qs-search-suggestions" ref={listRef} role="listbox" className="flex flex-col border border-line divide-y divide-line">
                  {suggestions.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      role="option"
                      aria-selected={i === active}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(s.href)}
                      className={`flex items-center gap-3.5 px-4 py-3 text-left transition-colors ${i === active ? "bg-paper" : "bg-white hover:bg-paper"}`}
                    >
                      <span className="font-mono text-[9px] tracking-[.14em] uppercase text-gold-1 border border-line px-1.5 py-1 shrink-0 min-w-[74px] text-center">
                        {tType(s.type)}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display font-semibold text-[15px] text-ink truncate">{s.title}</span>
                        {s.excerpt && <span className="block text-xs text-muted truncate">{s.excerpt}</span>}
                      </span>
                    </button>
                  ))}
                  {/* full-results escape hatch */}
                  <button
                    type="button"
                    onClick={() => submit(query)}
                    className="flex items-center gap-2 px-4 py-3 text-left bg-white hover:bg-paper transition-colors font-mono text-[11px] tracking-[.1em] uppercase text-ink"
                  >
                    {t("searchFor", { query: query.trim() })}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-1"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* featured products */
            <div className="mt-6">
              <div className="font-mono text-[10px] tracking-[.18em] uppercase text-muted mb-3.5">{t("featured")}</div>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-px bg-line border border-line">

                {featured.map((p) => (
                  <Link key={p.slug} href={`/products/${p.slug}`} onClick={close}
                        className="bg-white p-4 hover:bg-paper transition-colors flex flex-col text-ink">
                    <div className="relative h-28 mb-3 border border-line overflow-hidden"
                         style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}>
                      <Image src={p.img} alt={p.name} fill sizes="200px" className="object-contain p-3" />
                    </div>
                    <div className="flex flex-col gap-[3px]">
                      <b className="font-display font-bold text-base tracking-[-.01em]">{p.name}</b>
                      <span className="font-mono text-[10px] text-muted tracking-[.1em]">{p.meta}</span>
                      <span className="text-xs text-[#4a4842] mt-0.5">{p.tag}</span>
                    </div>
                  </Link>
                ))}
                <Link href="/products" onClick={close}
                      className="bg-ink hover:bg-[#0a0a0a] p-4 flex flex-col text-white transition-colors">
                  <div className="h-20 bg-[#0a0a0a] grid place-items-center mb-3 border border-ink-3 text-gold-2">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </div>
                  <div className="flex flex-col gap-[3px]">
                    <b className="font-display font-bold text-base tracking-[-.01em] bg-gold-grad bg-clip-text text-transparent">{t("viewAll")}</b>
                    <span className="font-mono text-[10px] text-[#a8a499] tracking-[.1em]">{t("productCount", { count: productCount })}</span>
                    <span className="text-xs text-[#a8a499] mt-0.5">{t("fullCatalog")}</span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <div id="qs-search-backdrop" onClick={close} className="qs-search-backdrop"></div>
    </>
  );
}
