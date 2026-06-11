import { Link } from "@/lib/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { getAllDatasheets } from "@/lib/data/datasheets";
import { DatasheetRequestForm } from "../_components/datasheet-request-form";
import type { Locale } from "@/lib/i18n/config";

export const metadata = { title: "Datasheet kỹ thuật — Downloads — QS Technology" };

type Props = { params: Promise<{ locale: string }> };

function fmtBytes(b: number): string {
  if (b === 0) return "—";
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const langLabel: Record<string, string> = { vi: "Tiếng Việt", en: "English", both: "VN / EN" };

export default async function DownloadsDatasheetsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const datasheets = await getAllDatasheets(locale as Locale);

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
            <Link href={`/${locale}`} className="!text-[#a8a499]">Trang chủ</Link>
            <span className="sep" style={{ color: "#5a5650" }}>/</span>
            <Link href={`/${locale}/downloads`} className="!text-[#a8a499]">Tải tài liệu</Link>
            <span className="sep" style={{ color: "#5a5650" }}>/</span>
            <span className="here !text-gold-2">Datasheet kỹ thuật</span>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <div className="qs-eyebrow !text-gold-2">Document Library · Datasheets</div>
              <h1 className="font-display font-bold text-[48px] text-white tracking-[-.02em] m-0 mt-2">
                Datasheet kỹ thuật
              </h1>
              <div className="mt-2.5 text-[#a8a499] text-[15px]">
                Thông số chi tiết, sơ đồ chân và quy chuẩn lắp đặt cho từng model controller QS.
              </div>
            </div>
            <div className="flex gap-8 text-right">
              {[
                { v: String(datasheets.length), l: "Tài liệu" },
                { v: "2026", l: "Phiên bản" },
                { v: "VN/EN", l: "Ngôn ngữ" },
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
                Danh mục
              </span>

              {categories.length > 0 && (
                <div className="border border-line bg-white mb-4">
                  <div className="px-4 py-3 border-b border-line font-mono text-[11px] text-ink tracking-[.12em] uppercase font-semibold">
                    Danh mục
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
                    Dòng sản phẩm
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
                  <p className="text-muted text-sm m-0">Chưa có datasheet nào được công bố.</p>
                </div>
              ) : (
                <>
                  {/* toolbar */}
                  <div className="flex justify-between items-center px-5 py-3.5 bg-paper border border-line mb-5">
                    <span className="font-mono text-[11px] text-muted tracking-[.1em]">
                      Hiển thị <b className="text-ink font-semibold">{datasheets.length}</b> tài liệu
                    </span>
                  </div>

                  {/* table */}
                  <table className="w-full border-collapse bg-white border border-line text-sm">
                    <thead>
                      <tr className="bg-[#0e0e0c] text-[#cfc9b8]">
                        {["Tên tài liệu", "Dòng", "Ngôn ngữ", "Phiên bản", "Dung lượng", "Tải về"].map(
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
