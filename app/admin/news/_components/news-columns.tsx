"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteNews } from "@/app/admin/_actions/news";

export type NewsRow = {
  slug: string;
  titleVi: string;
  category: string;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
  tags: string[];
};

function fmtDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("vi-VN");
}

function DeleteButton({ slug }: { slug: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Xóa bài viết "${slug}"?`)) return;
    startTransition(async () => {
      await deleteNews(slug);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="text-xs font-mono text-rust hover:underline disabled:opacity-50"
    >
      {pending ? "…" : "Xóa"}
    </button>
  );
}

export function NewsTable({ rows }: { rows: NewsRow[] }) {
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");

  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex gap-2 mb-4">
        {(["all", "draft", "published"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-mono border rounded capitalize transition-colors ${
              filter === s ? "bg-ink text-white border-ink" : "border-line hover:bg-paper"
            }`}
          >
            {s === "all" ? "Tất cả" : s === "draft" ? "Nháp" : "Đã đăng"}
            {s !== "all" && (
              <span className="ml-1.5 opacity-60">
                ({rows.filter((r) => r.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-muted text-sm py-8 text-center">Không có bài viết nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2.5 px-3 font-mono text-[11px] text-muted tracking-wider uppercase">Slug</th>
                <th className="text-left py-2.5 px-3 font-mono text-[11px] text-muted tracking-wider uppercase">Tiêu đề VI</th>
                <th className="text-left py-2.5 px-3 font-mono text-[11px] text-muted tracking-wider uppercase">Danh mục</th>
                <th className="text-left py-2.5 px-3 font-mono text-[11px] text-muted tracking-wider uppercase">Trạng thái</th>
                <th className="text-left py-2.5 px-3 font-mono text-[11px] text-muted tracking-wider uppercase">Đăng ngày</th>
                <th className="text-left py-2.5 px-3 font-mono text-[11px] text-muted tracking-wider uppercase">Cập nhật</th>
                <th className="py-2.5 px-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.slug} className="border-b border-line hover:bg-paper transition-colors">
                  <td className="py-2.5 px-3 font-mono text-xs text-muted">{row.slug}</td>
                  <td className="py-2.5 px-3 font-display text-sm font-medium max-w-[280px] truncate">
                    {row.titleVi}
                  </td>
                  <td className="py-2.5 px-3 text-xs">{row.category}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        row.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {row.status === "published" ? "Đã đăng" : "Nháp"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs font-mono text-muted">{fmtDate(row.publishedAt)}</td>
                  <td className="py-2.5 px-3 text-xs font-mono text-muted">{fmtDate(row.updatedAt)}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/news/${row.slug}/edit`}
                        className="text-xs font-mono hover:underline"
                      >
                        Sửa
                      </Link>
                      <DeleteButton slug={row.slug} />
                    </div>
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
