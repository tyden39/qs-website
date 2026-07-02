"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { createSearchDb, searchDb, type SearchDb, type SearchRecord, type SearchType } from "@/lib/search/engine";

const PAGE_SIZE = 10;
const RECENT_KEY = "qs-recent-searches";
const TYPE_ORDER: SearchType[] = ["product", "pdf", "news", "app", "faq"];
// Upper bound on hits pulled from Orama for one query; the index is small, so
// this fetches every match and pagination happens client-side below.
const MAX_RESULTS = 500;

// Static export has no server runtime, so the query is read on the client from
// the URL and matched against a prebuilt index fetched per locale.
export function SearchResults() {
  const t = useTranslations("search.results");
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();

  const query = (params.get("q") ?? "").trim();
  const rawType = params.get("type");
  const activeType: SearchType | "all" = TYPE_ORDER.includes(rawType as SearchType)
    ? (rawType as SearchType)
    : "all";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);

  const [db, setDb] = useState<SearchDb | null>(null);
  const [scored, setScored] = useState<SearchRecord[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    setDb(null);
    fetch(`/search-index.${locale}.json`)
      .then((r) => r.json())
      .then((recs: SearchRecord[]) => createSearchDb(recs))
      .then((built) => alive && setDb(built))
      .catch(() => {
        /* index unavailable — results stay empty */
      });
    return () => {
      alive = false;
    };
  }, [locale]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw) as string[]);
    } catch {
      /* storage unavailable — skip recents */
    }
  }, []);

  useEffect(() => {
    if (!query) return;
    setRecent((prev) => {
      const next = [query, ...prev.filter((x) => x.toLowerCase() !== query.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [query]);

  useEffect(() => {
    if (!db || !query) {
      setScored([]);
      return;
    }
    let alive = true;
    searchDb(db, query, MAX_RESULTS).then((hits) => alive && setScored(hits));
    return () => {
      alive = false;
    };
  }, [db, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: scored.length };
    for (const ty of TYPE_ORDER) c[ty] = 0;
    for (const r of scored) c[r.type] += 1;
    return c;
  }, [scored]);

  const filtered = activeType === "all" ? scored : scored.filter((r) => r.type === activeType);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function navigate(next: { q?: string; type?: string; page?: number }) {
    const q = next.q ?? query;
    const type = next.type ?? activeType;
    const p = next.page ?? 1;
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (type && type !== "all") sp.set("type", type);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    navigate({ q, type: "all", page: 1 });
  }

  // Tabs: "All" plus every type that has at least one match.
  const tabTypes: (SearchType | "all")[] = ["all", ...TYPE_ORDER.filter((ty) => counts[ty] > 0)];

  return (
    <>
      {/* HERO */}
      <section
        className="relative overflow-hidden border-b border-line"
        style={{ background: "linear-gradient(180deg, #fafaf7, #f0eee8)", padding: "48px 0 32px" }}
      >
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12">
          <div className="qs-crumb">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <span className="here">{t("breadcrumbCurrent")}</span>
          </div>
          <h1
            className="font-display font-bold mt-3.5 leading-[1.05] tracking-[-.015em]"
            style={{ fontSize: "clamp(34px, 3.6vw, 44px)" }}
          >
            {t("resultsFor")} &quot;
            <em className="not-italic bg-gold-grad bg-clip-text text-transparent">{query || "…"}</em>&quot;
          </h1>
          {query && db && (
            <div className="mt-3.5 font-mono text-[11px] text-muted tracking-[.14em] uppercase">
              <b className="text-ink font-medium">{scored.length}</b> {t("statsSuffix")}
            </div>
          )}
        </div>
      </section>

      {/* INPUT */}
      <section className="bg-white border-b border-line sticky top-[72px] z-30 py-6">
        <div className="max-w-wrap mx-auto px-12">
          <form onSubmit={onSubmit} className="flex gap-3.5 items-center border border-ink bg-white px-[18px] py-3.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0 opacity-50">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" />
            </svg>
            <input
              name="q"
              defaultValue={query}
              key={query}
              autoComplete="off"
              className="flex-1 border-0 outline-0 text-lg font-display font-medium text-ink"
            />
            <button type="submit" className="px-4 py-2.5 bg-ink text-white font-mono text-[11px] tracking-[.14em] uppercase cursor-pointer">
              {t("searchBtn")}
            </button>
          </form>
        </div>
      </section>

      {/* TABS */}
      {scored.length > 0 && (
        <section className="bg-white border-b border-line">
          <div className="max-w-wrap mx-auto px-12">
            <div className="flex flex-wrap">
              {tabTypes.map((ty) => (
                <button
                  key={ty}
                  onClick={() => navigate({ type: ty, page: 1 })}
                  className={`py-3.5 px-[18px] font-mono text-[11px] tracking-[.14em] uppercase cursor-pointer bg-transparent border-0 border-b-2
                              ${activeType === ty ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
                >
                  <b className="font-display text-[13px] tracking-normal normal-case font-semibold text-ink">
                    {t(`typeLabels.${ty}`)}
                  </b>
                  <span className="font-mono text-[11px] text-gold-1 ml-2">{counts[ty]}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BODY */}
      <section className="bg-white py-12 pb-24">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1fr_280px] gap-12 items-start">
          <div>
            {!query && <p className="text-[15px] text-[#3a3a3a] leading-[1.7] m-0">{t("emptyPrompt")}</p>}

            {query && db && scored.length === 0 && (
              <p className="text-[15px] text-[#3a3a3a] leading-[1.7] m-0">{t("noResults", { query })}</p>
            )}

            {pageItems.length > 0 && (
              <div className="flex flex-col gap-px bg-line border border-line">
                {pageItems.map((r) => (
                  <Link
                    key={r.id}
                    href={r.href}
                    className="bg-white px-7 py-6 grid grid-cols-[120px_1fr] gap-6 text-ink relative
                               hover:bg-paper hover:pl-[34px] transition-all
                               before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:bg-gold before:w-0
                               hover:before:w-[3px] before:transition-all"
                  >
                    <Thumb kind={r.type} />
                    <div>
                      <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase flex gap-3.5">
                        <span>[ {t(`typeLabels.${r.type}`)} ]</span>
                      </div>
                      <h3
                        className="mt-1.5 mb-1.5 font-display text-[19px] font-semibold leading-[1.3] tracking-[-.005em]"
                        dangerouslySetInnerHTML={{ __html: highlight(r.title, query) }}
                      />
                      <p
                        className="m-0 text-[#3a3a3a] text-[13.5px] leading-[1.6] max-w-[65ch]"
                        dangerouslySetInnerHTML={{ __html: highlight(r.excerpt, query) }}
                      />
                      {r.meta.length > 0 && (
                        <div className="mt-2.5 font-mono text-[10px] text-muted tracking-[.12em] uppercase flex gap-[18px]">
                          {r.meta.map((m) => (
                            <span key={m}>{m}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {filtered.length > PAGE_SIZE && (
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-line">
                <div className="font-mono text-[11px] text-muted tracking-[.12em]">
                  {t("showing", {
                    start: (safePage - 1) * PAGE_SIZE + 1,
                    end: (safePage - 1) * PAGE_SIZE + pageItems.length,
                    total: filtered.length,
                  })}
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => navigate({ page: p })}
                      className={`w-9 h-9 border border-line grid place-items-center font-mono text-xs
                                  ${p === safePage ? "bg-ink text-white border-ink" : "bg-white text-ink"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="sticky top-40 flex flex-col gap-6">
            {scored.length > 0 && (
              <div className="border border-line bg-paper p-[22px]">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-3.5">{t("filtersTitle")}</div>
                <ul className="list-none p-0 m-0 flex flex-col">
                  {(["all", ...TYPE_ORDER] as const).map((ty) => (
                    <li key={ty}>
                      <button
                        onClick={() => navigate({ type: ty, page: 1 })}
                        className={`w-full flex justify-between py-2 border-b border-line last:border-b-0 text-[13px] cursor-pointer text-left
                                    ${activeType === ty ? "font-semibold" : ""}`}
                      >
                        <span>{t(`typeLabels.${ty}`)}</span>
                        <span className="font-mono text-[10px] text-gold-1">{counts[ty] ?? 0}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recent.length > 0 && (
              <div className="border border-line bg-paper p-[22px]">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-3.5">{t("recentTitle")}</div>
                <ul className="list-none p-0 m-0 flex flex-col">
                  {recent.map((term) => (
                    <li key={term}>
                      <Link
                        href={`/search?q=${encodeURIComponent(term)}`}
                        className="block py-2.5 border-b border-dashed border-line last:border-b-0 text-[13px] text-[#3a3a3a] leading-[1.5] hover:text-ink"
                      >
                        {term}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border border-ink bg-ink text-[#cfc9b8] p-[22px]">
              <div className="font-mono text-[10px] text-gold-2 tracking-[.16em] uppercase mb-3.5">{t("helpTitle")}</div>
              <p className="m-0 mb-3.5 text-[13px] leading-[1.6] text-[#a8a499]">{t("helpBody")}</p>
              <Link className="qs-btn qs-btn-gold qs-btn-sm inline-flex" href="/contact">
                {t("helpCta")}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, query: string) {
  const safe = escapeHtml(text);
  const tokens = query
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .map(escapeReg);
  if (!tokens.length) return safe;
  const re = new RegExp(`(${tokens.join("|")})`, "gi");
  return safe.replace(re, '<mark class="bg-[#fff5d8] text-ink px-0.5 border-b border-gold">$1</mark>');
}

function Thumb({ kind }: { kind: SearchType }) {
  const wrap = "aspect-[5/4] bg-paper-2 border border-line overflow-hidden grid place-items-center";
  if (kind === "faq") {
    return <div className={`${wrap} bg-ink text-gold-2 font-display text-3xl font-bold`}>?</div>;
  }
  return (
    <div className={wrap}>
      <svg viewBox="0 0 100 80" className="w-full h-full">
        {kind === "product" && (
          <>
            <rect x="6" y="10" width="88" height="60" fill="#1a1a1a" stroke="#3a3a3a" />
            <rect x="14" y="18" width="60" height="36" fill="#0a3a3a" />
            <g fill="#3a3a3a">
              <rect x="78" y="18" width="12" height="10" />
              <rect x="78" y="32" width="12" height="10" />
              <rect x="78" y="46" width="12" height="10" />
            </g>
            <rect x="14" y="58" width="60" height="6" fill="#e8c878" />
          </>
        )}
        {kind === "pdf" && (
          <>
            <rect x="14" y="6" width="60" height="68" fill="#fff" stroke="#d8d6cf" />
            <rect x="14" y="6" width="20" height="20" fill="#f5f3ee" />
            <rect x="20" y="48" width="48" height="12" fill="#c8553d" />
            <text x="44" y="58" fontFamily="JetBrains Mono,monospace" fontSize="6" fontWeight="700" fill="#fff" textAnchor="middle">
              PDF
            </text>
          </>
        )}
        {kind === "news" && (
          <>
            <rect width="100" height="80" fill="#2a2520" />
            <rect x="14" y="20" width="72" height="40" fill="#cfc9b8" />
            <circle cx="50" cy="40" r="10" fill="#e8c878" />
          </>
        )}
        {kind === "app" && (
          <>
            <rect x="20" y="14" width="60" height="22" fill="#cfc9b8" stroke="#8a8680" />
            <rect x="26" y="38" width="48" height="32" fill="#a8a499" stroke="#5a5650" />
          </>
        )}
      </svg>
    </div>
  );
}
