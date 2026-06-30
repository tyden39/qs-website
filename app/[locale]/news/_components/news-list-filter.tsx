"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import type { NewsCategoryId } from "@/lib/data/news";

export type NewsListItem = {
  slug: string;
  title: string;
  excerpt: string;
  cat: string;
  date: string;
  categoryId: NewsCategoryId;
};

// Tab order mirrors the `news.list.tabs` label array; index 0 is "all".
const TAB_IDS: ("all" | NewsCategoryId)[] = ["all", "products", "events", "customers", "technical", "company"];
const PAGE_SIZE = 9;

export function NewsListFilter({ articles }: { articles: NewsListItem[] }) {
  const t = useTranslations("news");
  const tabLabels = t.raw("list.tabs") as string[];

  const [activeTab, setActiveTab] = useState<"all" | NewsCategoryId>("all");
  const [page, setPage] = useState(1);

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
  const filtered = activeTab === "all"
    ? articles.slice(1)
    : articles.filter((a) => a.categoryId === activeTab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function selectTab(id: "all" | NewsCategoryId) {
    setActiveTab(id);
    setPage(1);
  }

  return (
    <>
      {/* TABS */}
      <div className="bg-white border-b border-line sticky top-18 z-30">
        <div className="max-w-wrap mx-auto px-12 flex">
          {TAB_IDS.map((id, i) => (
            <button
              key={id}
              type="button"
              onClick={() => selectTab(id)}
              className={`py-4 px-5 text-sm font-medium border-b-2 transition-colors cursor-pointer bg-transparent ${activeTab === id ? "text-ink border-gold-2" : "text-[#5a5650] border-transparent hover:text-ink"}`}
            >
              {tabLabels[i]}<span className="font-mono text-[10px] text-muted ml-1.5 tracking-widest">{counts[id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FEATURED — editorial highlight, shown only on the "All" tab */}
      {showFeatured && feat && (
        <section className="py-14 bg-white">
          <div className="max-w-wrap mx-auto px-12">
            <div className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase mb-5">{t("list.featuredLabel")}</div>
            <Link href={`/news/${feat.slug}`}
                  className="grid md:grid-cols-[1.3fr_1fr] bg-white border border-line hover:border-ink transition-colors">
              <div className="aspect-[5/3] bg-ink-2 border-r border-line overflow-hidden">
                <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
                  <rect width="600" height="360" fill="#1a1815"/>
                  <g fill="#3a3530"><rect x="60" y="80" width="200" height="200"/><rect x="280" y="80" width="120" height="200"/><rect x="420" y="80" width="120" height="200"/></g>
                  <rect x="80" y="120" width="160" height="100" fill="#0a1a2a"/>
                  <text x="100" y="150" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="#e8c878">QS · 2026</text>
                  <text x="100" y="180" fontFamily="JetBrains Mono,monospace" fontSize="20" fill="#fff" fontWeight="700">ASTRO 12X</text>
                  <circle cx="500" cy="180" r="20" fill="#c8553d"/>
                </svg>
              </div>
              <div className="p-12 flex flex-col justify-center">
                <span className="font-mono text-[10px] bg-gold text-ink-2 py-1 px-2.5 self-start tracking-[.16em] uppercase font-semibold">[ {feat.cat} ]</span>
                <h2 className="font-display font-bold text-[34px] tracking-[-.015em] leading-[1.15] mt-4 mb-4">{feat.title}</h2>
                <p className="text-[#3a3a3a] text-[15px] leading-[1.7] m-0 mb-5">{feat.excerpt}</p>
                <div className="font-mono text-[11px] text-muted tracking-[.14em] pt-4 border-t border-line flex justify-between">
                  <span>{feat.date} · {t("meta.author")}</span><span>{t("list.readTime")}</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* GRID */}
      <section className="py-14 pb-16 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("list.gridEyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("list.gridHeading")}</h2>
            </div>
            <span className="font-mono text-[11px] text-muted tracking-[.1em] uppercase">{filtered.length} {t("list.articlesShort")}</span>
          </div>

          {pageItems.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {pageItems.map(n => (
                <Link key={n.slug} href={`/news/${n.slug}`}
                      className="bg-white border border-line flex flex-col hover:-translate-y-0.5 hover:border-ink transition-all">
                  <div className="aspect-[5/3] border-b border-line bg-paper-2 overflow-hidden grid place-items-center">
                    <span className="font-mono text-[10px] text-muted tracking-[.16em]">FIG · {n.cat.toUpperCase()}</span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ {n.cat} ]</span>
                    <h3 className="font-display font-semibold text-lg leading-[1.35] tracking-[-.005em] mt-2.5 mb-3">{n.title}</h3>
                    <p className="text-[13px] text-[#5a5650] leading-[1.6] flex-1 m-0 mb-4">{n.excerpt}</p>
                    <div className="font-mono text-[10px] text-muted tracking-[.14em] pt-3.5 border-t border-line">{n.date}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-[#3a3a3a] leading-[1.7] m-0 py-12 text-center">{t("list.empty")}</p>
          )}

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 mt-12">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
                className="px-4 h-9 border border-line grid place-items-center font-mono text-[11px] text-muted hover:border-ink hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >{t("list.prev")}</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 border grid place-items-center font-mono text-[11px] cursor-pointer ${p === safePage ? "border-ink bg-ink text-white" : "border-line text-muted hover:border-ink hover:text-ink"}`}
                >{p}</button>
              ))}
              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
                className="px-4 h-9 border border-line grid place-items-center font-mono text-[11px] text-muted hover:border-ink hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >{t("list.next")}</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
