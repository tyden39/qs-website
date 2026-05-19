import Link from "next/link";
import { adminListDatasheets } from "@/app/admin/_actions/datasheets";
import { requireRole } from "@/lib/auth/require";
import { DeleteDatasheetButton } from "./_components/delete-datasheet-button";

export default async function AdminDatasheetsPage() {
  await requireRole(["admin", "editor"]);
  const datasheets = await adminListDatasheets();

  function fmtBytes(b: number) {
    if (b === 0) return "—";
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">Admin · Datasheets</div>
          <h1 className="font-display font-bold text-2xl tracking-[-.01em] mt-1">Datasheets</h1>
        </div>
        <Link href="/admin/datasheets/new" className="qs-btn qs-btn-gold qs-btn-sm">
          + Thêm datasheet
        </Link>
      </div>

      {datasheets.length === 0 ? (
        <div className="border border-line bg-paper p-10 text-center">
          <p className="text-muted text-sm m-0">Chưa có datasheet nào. Nhấn &quot;+ Thêm datasheet&quot; để tạo mới.</p>
        </div>
      ) : (
        <div className="border border-line bg-white overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-line bg-paper">
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">Slug</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">Tên (VI)</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">Danh mục</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">Dòng</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">Lang</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">Size</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">Status</th>
                <th className="px-4 py-3 text-right font-mono text-[10px] tracking-[.14em] uppercase text-muted">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {datasheets.map((d) => (
                <tr key={d.slug} className="border-b border-line hover:bg-paper transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{d.slug}</td>
                  <td className="px-4 py-3 font-semibold text-ink max-w-[220px] truncate">
                    {(d.name as { vi: string }).vi}
                  </td>
                  <td className="px-4 py-3 text-[#3a3a3a]">{d.category}</td>
                  <td className="px-4 py-3 text-[#3a3a3a]">{d.series}</td>
                  <td className="px-4 py-3 font-mono text-xs uppercase">{d.lang}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{fmtBytes(d.sizeBytes)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 font-mono text-[10px] tracking-[.1em] uppercase border ${
                      d.status === "published"
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-line bg-paper text-muted"
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/datasheets/${d.slug}/edit`}
                      className="inline-flex items-center border border-line px-3 py-1.5 font-mono text-[10px] tracking-[.12em] uppercase hover:border-ink transition-colors mr-2"
                    >
                      Sửa
                    </Link>
                    <DeleteDatasheetButton slug={d.slug} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
