"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { FilterPrePaintCleanup, setFilterParams, useFilterParams } from "@/lib/use-filter-params";
import type { NewsCategoryId } from "@/lib/data/news";

export type NewsListItem = {
  slug: string;
  title: string;
  excerpt: string;
  cat: string;
  date: string;
  categoryId: NewsCategoryId;
  img: string | null;
};

// Tab order mirrors the `news.list.tabs` label array; index 0 is "all".
const TAB_IDS: ("all" | NewsCategoryId)[] = ["all", "products", "events", "customers", "technical", "company"];
const PAGE_SIZE = 9;
const CAT_KEY = "cat";
const PAGE_KEY = "page";

export function NewsListFilter({ articles }: { articles: NewsListItem[] }) {
  const t = useTranslations("news");
  const tabLabels = t.raw("list.tabs") as string[];

  // Tab + page live in the URL so a filtered/paged view can be linked and is
  // restored on first load. Absent = the "all" tab, page 1.
  const params = useFilterParams();
  const catParam = params.get(CAT_KEY);
  const activeTab: "all" | NewsCategoryId =
    catParam && (TAB_IDS as string[]).includes(catParam) ? (catParam as NewsCategoryId) : "all";
  const page = Math.max(1, parseInt(params.get(PAGE_KEY) ?? "1", 10) || 1);

  // Counts span the whole set so each tab matches what it actually surfaces:
  // the "All" tab shows a featured banner + grid; a category tab shows its full
  // set in the grid (no banner).
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: articles.length };
    for (const id of TAB_IDS) if (id !== "all") c[id] = 0;
    for (const a of articles) c[a.categoryId] += 1;
    return c;
  }, [articles]);

  const showFeatured = activeTab === "all";
  const feat = articles[0];
  // Every article is rendered into the grid (see the map below) so the pre-paint
  // primer can reveal a category before hydration; React then hides the ones
  // outside the active tab and page. The "all" tab drops the featured article
  // from the grid since it already leads as the banner.
  const inFilter = (a: NewsListItem) =>
    activeTab === "all" ? a.slug !== feat?.slug : a.categoryId === activeTab;
  const filtered = articles.filter(inFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleSlugs = new Set(
    filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE).map((a) => a.slug),
  );

  const selectTab = (id: "all" | NewsCategoryId) =>
    setFilterParams({ [CAT_KEY]: id === "all" ? null : id, [PAGE_KEY]: null });
  const setPage = (p: number) => setFilterParams({ [PAGE_KEY]: p === 1 ? null : String(p) });

  return (
    <>
      <FilterPrePaintCleanup />
      {/* TABS */}
      <div className="bg-white border-b border-line sticky top-18 z-30">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {TAB_IDS.map((id, i) => (
            <button
              key={id}
              type="button"
              onClick={() => selectTab(id)}
              className={`shrink-0 whitespace-nowrap py-4 px-4 sm:px-5 text-meta font-medium border-b-2 transition-colors cursor-pointer bg-transparent ${activeTab === id ? "text-ink border-gold-2" : "text-[#5a5650] border-transparent hover:text-ink"}`}
            >
              {tabLabels[i]}<span className="font-mono text-label-xs text-muted ml-1.5 tracking-widest">{counts[id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FEATURED — editorial highlight, shown only on the "All" tab. Kept in
          the DOM (hidden off-tab) so the primer can drop it before paint. */}
      {feat && (
        <section className="py-12 sm:py-16 bg-white" hidden={!showFeatured} data-f-hide-when="cat">
          <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
            <Link
              href={`/news/${feat.slug}`}
              className="group relative grid md:grid-cols-[1.35fr_1fr] bg-white border border-line rounded-[3px] overflow-hidden transition-all duration-200 hover:border-ink-3 hover:shadow-[0_1px_0_rgba(0,0,0,.04),0_18px_44px_-20px_rgba(0,0,0,.28)]"
            >
              {/* gold accent rail */}
              <span className="absolute left-0 top-0 z-20 h-full w-[3px] bg-gold-grad scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300" />
              <div className="aspect-[16/10] md:aspect-auto md:min-h-[420px] bg-ink-2 md:border-r border-line overflow-hidden relative">
                {feat.img ? (
                  <>
                    <Image src={feat.img} alt={feat.title} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  </>
                ) : (
                  <FeaturePlaceholder />
                )}
                {/* category marker */}
                <span className="absolute top-4 left-4 z-10 font-mono text-label-xs tracking-[.16em] uppercase font-semibold bg-gold text-ink-2 py-1 px-2.5 rounded-[2px] shadow-sm">
                  {feat.cat}
                </span>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-between">
                <div>
                  <span className="qs-eyebrow">{t("list.featuredLabel")}</span>
                  <h2 className="font-display font-bold text-h2 tracking-[-.015em] leading-[1.3] mt-4 mb-4 text-balance line-clamp-3 group-hover:text-ink transition-colors">{feat.title}</h2>
                  <p className="text-[#3a3a3a] text-body leading-[1.7] m-0 line-clamp-4">{feat.excerpt}</p>
                </div>
                <div className="mt-8 pt-4 border-t border-line flex items-center justify-between font-mono text-label text-muted tracking-[.14em]">
                  <span>{feat.date} · {t("meta.author")}</span>
                  <span className="inline-flex items-center gap-1.5 text-ink group-hover:translate-x-0.5 transition-transform">{t("list.readTime")}</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* GRID */}
      <section className="py-12 sm:py-16 pb-14 sm:pb-16 bg-white">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">{t("list.gridEyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("list.gridHeading")}</h2>
            </div>
            <span className="font-mono text-label text-muted tracking-[.1em] uppercase">{filtered.length} {t("list.articlesShort")}</span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
              {articles.map(n => (
                <Link key={n.slug} href={`/news/${n.slug}`}
                      hidden={!visibleSlugs.has(n.slug)}
                      data-f-cat={n.categoryId}
                      className="group relative bg-white border border-line rounded-[3px] flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-ink-3 hover:shadow-[0_1px_0_rgba(0,0,0,.04),0_16px_36px_-18px_rgba(0,0,0,.22)]">
                  <div className="aspect-[5/3] border-b border-line bg-paper-2 overflow-hidden relative">
                    {n.img ? (
                      <>
                        <Image src={n.img} alt={n.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </>
                    ) : (
                      <ThumbPlaceholder label={n.cat} />
                    )}
                    <span className="absolute top-3 left-3 z-10 font-mono text-label-xs tracking-[.16em] uppercase font-semibold bg-white/90 backdrop-blur-sm text-ink py-1 px-2 rounded-[2px] border border-line shadow-sm">{n.cat}</span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-display font-semibold text-title leading-[1.35] tracking-[-.005em] mb-3 line-clamp-2 group-hover:text-ink transition-colors">{n.title}</h3>
                    <p className="text-meta text-[#5a5650] leading-[1.6] flex-1 m-0 mb-4 line-clamp-3">{n.excerpt}</p>
                    <div className="flex items-center justify-between pt-3.5 border-t border-line font-mono text-label-xs text-muted tracking-[.14em]">
                      <span>{n.date}</span>
                      <span className="text-ink opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-body text-[#3a3a3a] leading-[1.7] m-0 py-12 text-center">{t("list.empty")}</p>
          )}

          {/* pagination — touch devices get the 44px minimum hit area, mouse
              pointers keep the compact 36px squares */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 mt-12">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
                className="px-4 h-9 pointer-coarse:h-11 border border-line grid place-items-center font-mono text-label text-muted hover:border-ink hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >{t("list.prev")}</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 pointer-coarse:w-11 pointer-coarse:h-11 border grid place-items-center font-mono text-label cursor-pointer ${p === safePage ? "border-ink bg-ink text-white" : "border-line text-muted hover:border-ink hover:text-ink"}`}
                >{p}</button>
              ))}
              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
                className="px-4 h-9 pointer-coarse:h-11 border border-line grid place-items-center font-mono text-label text-muted hover:border-ink hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >{t("list.next")}</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/** Technical placeholder for the featured card when no image is provided. */
function FeaturePlaceholder() {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <rect width="600" height="400" fill="#1a1a1a" />
        <g stroke="#2a2a2a" strokeWidth="1">
          {Array.from({ length: 19 }, (_, i) => <line key={`v${i}`} x1={i * 32} y1="0" x2={i * 32} y2="400" />)}
          {Array.from({ length: 13 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 32} x2="600" y2={i * 32} />)}
        </g>
        <circle cx="300" cy="200" r="118" fill="none" stroke="#3a3530" strokeWidth="1.5" />
        <circle cx="300" cy="200" r="72" fill="none" stroke="#8a6f35" strokeWidth="1.5" />
        <line x1="150" y1="200" x2="450" y2="200" stroke="#3a3530" strokeWidth="1" />
        <line x1="300" y1="50" x2="300" y2="350" stroke="#3a3530" strokeWidth="1" />
        <circle cx="300" cy="200" r="4" fill="#e8c878" />
        <text x="36" y="374" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#8a6f35" letterSpacing="2">QS · TECHNOLOGY</text>
      </svg>
    </div>
  );
}

/** Technical placeholder for grid thumbnails when no image is provided. */
function ThumbPlaceholder({ label }: { label: string }) {
  return (
    <div className="qs-img-ph absolute inset-0 !border-0">
      <div className="flex flex-col items-center gap-2 text-muted">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="opacity-50">
          <rect x="3" y="4" width="18" height="16" rx="1" />
          <circle cx="8.5" cy="9.5" r="1.75" />
          <path d="M21 16l-5-5L5 20" />
        </svg>
        <span className="font-mono text-label-xs tracking-[.18em] uppercase">FIG · {label}</span>
      </div>
    </div>
  );
}
