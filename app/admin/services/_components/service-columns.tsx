"use client";

import Link from "next/link";
import type { ServiceRow } from "@/lib/data/services";
import type { I18nText } from "@/lib/db/schema/catalog";

type Props = {
  rows: ServiceRow[];
  onDelete: (slug: string) => void;
};

function titleVi(row: ServiceRow): string {
  return (row.title as I18nText)?.vi ?? row.slug;
}

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(d);
}

export function ServiceTable({ rows, onDelete }: Props) {
  if (rows.length === 0) {
    return (
      <div className="border border-line bg-white p-8 text-sm text-muted text-center">
        Chưa có dịch vụ nào.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-paper-2">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-muted">Slug</th>
            <th className="px-4 py-2 text-left font-medium text-muted">Tiêu đề (VI)</th>
            <th className="px-4 py-2 text-left font-medium text-muted">Trạng thái</th>
            <th className="px-4 py-2 text-left font-medium text-muted">Cập nhật</th>
            <th className="px-4 py-2 text-right font-medium text-muted">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.slug} className="border-b border-line last:border-0 hover:bg-paper-2">
              <td className="px-4 py-2 font-mono text-xs">{row.slug}</td>
              <td className="px-4 py-2">{titleVi(row)}</td>
              <td className="px-4 py-2">
                <span
                  className={`inline-block px-2 py-0.5 text-[11px] font-mono rounded-sm ${
                    row.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-2 text-muted">{fmtDate(row.updatedAt)}</td>
              <td className="px-4 py-2 text-right flex justify-end gap-2">
                <Link
                  href={`/admin/services/${row.slug}/edit`}
                  className="px-3 py-1 text-xs border border-line rounded-sm hover:bg-paper-2"
                >
                  Sửa
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(row.slug)}
                  className="px-3 py-1 text-xs border border-red-200 text-red-700 rounded-sm hover:bg-red-50"
                >
                  Xoá
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
