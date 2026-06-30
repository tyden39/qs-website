import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllDatasheets } from "@/lib/data/datasheets";
import { DatasheetRequestForm } from "../_components/datasheet-request-form";
import type { Locale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "downloads" });
  return { title: t("meta.datasheetsTitle") };
}

function fmtBytes(b: number): string {
  if (b === 0) return "—";
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function DownloadsDatasheetsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "downloads.datasheets" });
  const datasheets = await getAllDatasheets(locale as Locale);
  const langLabel: Record<string, string> = {
    vi: t("lang.vi"),
    en: t("lang.en"),
    both: t("lang.both"),
  };

  // Collect unique categories for filter display
  const categories = Array.from(new Set(datasheets.map((d) => d.category))).sort();
  const series = Array.from(new Set(datasheets.map((d) => d.series))).sort();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0e0e0c] text-[#cfc9b8] border-b border-[#2a2620]">
        <div className="absolute inset-0 qs-grid-bg opacity-[.12]"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-9 pb-11">
          <div className="qs-crumb mb-5">
            <Link href={`/${locale}`} className="!text-[#a8a499]">{t("breadcrumb.home")}</Link>
            <span className="sep" style={{ color: "#5a5650" }}>/</span>
            <Link href={`/${locale}/downloads`} className="!text-[#a8a499]">{t("breadcrumb.downloads")}</Link>
            <span className="sep" style={{ color: "#5a5650" }}>/</span>
            <span className="here !text-gold-2">{t("breadcrumb.current")}</span>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <div className="qs-eyebrow !text-gold-2">{t("eyebrow")}</div>
              <h1 className="font-display font-bold text-[48px] text-white tracking-[-.02em] m-0 mt-2">
                {t("heading")}
              </h1>
              <div className="mt-2.5 text-[#a8a499] text-[15px]">
                {t("description")}
              </div>
            </div>
            <div className="flex gap-8 text-right">
              {[
                { v: String(datasheets.length), l: t("stats.docs") },
                { v: "2026", l: t("stats.version") },
                { v: "VN/EN", l: t("stats.lang") },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-[24px] font-bold text-gold-2">{s.v}</div>
                  <div className="font-mono text-[10px] text-[#7a7570] tracking-[.16em] uppercase mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="py-12 pb-24 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="grid grid-cols-[260px_1fr] gap-12 items-start">
            {/* SIDEBAR FILTERS (static display — JS filtering is Phase 9+ enhancement) */}
            <aside>
              <span className="font-mono text-[10px] text-gold-3 tracking-[.16em] uppercase mb-3.5 block">
                {t("sidebar.filter")}
              </span>

              {categories.length > 0 && (
                <div className="border border-line bg-white mb-4">
                  <div className="px-4 py-3 border-b border-line font-mono text-[11px] text-ink tracking-[.12em] uppercase font-semibold">
                    {t("sidebar.category")}
                  </div>
                  <ul className="list-none py-2 m-0">
                    {categories.map((cat) => (
                      <li key={cat} className="flex items-center gap-2.5 px-4 py-2">
                        <span className="text-[13px] text-[#3a3a3a]">{cat}</span>
                        <span className="ml-auto font-mono text-[10px] text-muted">
                          {datasheets.filter((d) => d.category === cat).length}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {series.length > 0 && (
                <div className="border border-line bg-white mb-4">
                  <div className="px-4 py-3 border-b border-line font-mono text-[11px] text-ink tracking-[.12em] uppercase font-semibold">
                    {t("sidebar.series")}
                  </div>
                  <ul className="list-none py-2 m-0">
                    {series.map((s) => (
                      <li key={s} className="flex items-center gap-2.5 px-4 py-2">
                        <span className="text-[13px] text-[#3a3a3a]">{s}</span>
                        <span className="ml-auto font-mono text-[10px] text-muted">
                          {datasheets.filter((d) => d.series === s).length}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>

            {/* MAIN TABLE */}
            <main>
              {datasheets.length === 0 ? (
                <div className="border border-line bg-paper p-12 text-center">
                  <p className="text-muted text-sm m-0">{t("empty")}</p>
                </div>
              ) : (
                <>
                  {/* toolbar */}
                  <div className="flex justify-between items-center px-5 py-3.5 bg-paper border border-line mb-5">
                    <span className="font-mono text-[11px] text-muted tracking-[.1em]">
                      {t("toolbar.showing", { count: datasheets.length })}
                    </span>
                  </div>

                  {/* table */}
                  <table className="w-full border-collapse bg-white border border-line text-sm">
                    <thead>
                      <tr className="bg-[#0e0e0c] text-[#cfc9b8]">
                        {[t("table.name"), t("table.series"), t("table.lang"), t("table.version"), t("table.size"), t("table.download")].map(
                          (h, i) => (
                            <th
                              key={h}
                              className={`px-4 py-3.5 font-mono text-[10px] font-semibold tracking-[.16em] uppercase border-b border-[#2a2620] ${
                                i >= 4 ? "text-right" : "text-left"
                              } ${i === 0 ? "w-[40%]" : ""}`}
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {datasheets.map((d) => (
                        <tr key={d.slug} className="border-b border-line hover:bg-paper transition-colors">
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-[52px] flex-shrink-0 border border-line grid place-items-center font-display font-extrabold text-[10px] tracking-[-.02em] bg-white text-ink">
                                {d.ext.toUpperCase()}
                              </div>
                              <div className="flex flex-col gap-1">
                                <div className="font-semibold text-ink text-[14px] tracking-[-.005em]">
                                  {d.name}
                                </div>
                                <div className="font-mono text-[11px] text-muted tracking-[.06em]">
                                  {d.category}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle font-mono text-[12px] text-[#3a3a3a]">
                            {d.series}
                          </td>
                          <td className="p-4 align-middle font-mono text-[11px] text-muted">
                            {langLabel[d.lang] ?? d.lang}
                          </td>
                          <td className="p-4 align-middle font-mono text-xs text-[#3a3a3a]">
                            {d.version ?? "—"}
                          </td>
                          <td className="p-4 align-middle font-mono text-xs text-ink text-right">
                            {fmtBytes(d.sizeBytes)}
                          </td>
                          <td className="p-4 align-middle text-right" style={{ minWidth: "200px" }}>
                            <DatasheetRequestForm
                              datasheetSlug={d.slug}
                              datasheetName={d.name}
                              fileUrl={d.fileUrl}
                              locale={locale}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </main>
          </div>
        </div>
      </section>
    </>
  );
}
