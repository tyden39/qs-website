"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteProduct } from "@/app/admin/_actions/products";
import type { ProductAdminRow } from "@/lib/data/products";
import type { I18nText, ProductImage } from "@/lib/db/schema/catalog";

type SortKey = "name" | "series" | "status" | "updatedAt";
type SortDir = "asc" | "desc";

type Props = {
  rows: ProductAdminRow[];
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
    archived: "bg-gray-100 text-gray-600",
  };
  const labels: Record<string, string> = {
    published: "Xuất bản",
    draft: "Bản nháp",
    archived: "Lưu trữ",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function DeleteButton({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    setError(null);
    startTransition(async () => {
      const res = await deleteProduct(slug);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-red-600 hover:text-red-800"
      >
        Xóa
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h2 className="text-base font-semibold">Xác nhận xóa sản phẩm</h2>
            <p className="text-sm text-muted">
              Sản phẩm &ldquo;{name}&rdquo; sẽ được chuyển vào trạng thái lưu
              trữ. Hành động này có thể khôi phục bởi admin.
            </p>
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm border border-line rounded hover:bg-paper-2 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirm}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ProductTable({ rows }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = rows
    .filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = ((r.name as I18nText).vi ?? "").toLowerCase();
        return r.slug.includes(q) || name.includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = ((a.name as I18nText).vi ?? "").localeCompare(
          (b.name as I18nText).vi ?? "",
        );
      } else if (sortKey === "series") {
        cmp = a.series.localeCompare(b.series);
      } else if (sortKey === "status") {
        cmp = a.status.localeCompare(b.status);
      } else {
        // updatedAt
        cmp =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      <span className="ml-1 text-[10px]">{sortDir === "asc" ? "▲" : "▼"}</span>
    ) : (
      <span className="ml-1 text-[10px] opacity-30">▲▼</span>
    );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, slug..."
          className="border border-line rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-60"
        />
        <div className="flex gap-1">
          {["all", "draft", "published", "archived"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                statusFilter === s
                  ? "bg-primary text-white border-primary"
                  : "border-line hover:bg-paper-2"
              }`}
            >
              {s === "all"
                ? "Tất cả"
                : s === "draft"
                  ? "Bản nháp"
                  : s === "published"
                    ? "Xuất bản"
                    : "Lưu trữ"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">
          {search || statusFilter !== "all"
            ? "Không tìm thấy sản phẩm phù hợp."
            : "Chưa có sản phẩm nào."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded border border-line">
          <table className="w-full text-sm">
            <thead className="bg-paper-2 text-muted text-xs uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2 text-left w-16">Ảnh</th>
                <th
                  className="px-3 py-2 text-left cursor-pointer select-none"
                  onClick={() => toggleSort("name")}
                >
                  Tên sản phẩm <SortIcon col="name" />
                </th>
                <th className="px-3 py-2 text-left hidden md:table-cell">Slug</th>
                <th
                  className="px-3 py-2 text-left cursor-pointer select-none hidden md:table-cell"
                  onClick={() => toggleSort("series")}
                >
                  Dòng <SortIcon col="series" />
                </th>
                <th
                  className="px-3 py-2 text-left cursor-pointer select-none"
                  onClick={() => toggleSort("status")}
                >
                  Trạng thái <SortIcon col="status" />
                </th>
                <th
                  className="px-3 py-2 text-left cursor-pointer select-none hidden lg:table-cell"
                  onClick={() => toggleSort("updatedAt")}
                >
                  Cập nhật <SortIcon col="updatedAt" />
                </th>
                <th className="px-3 py-2 text-left w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {filtered.map((row) => {
                const firstImg = (row.images as ProductImage[])[0];
                const nameVi = (row.name as I18nText).vi ?? row.slug;
                return (
                  <tr key={row.slug} className="hover:bg-paper-2 transition-colors">
                    <td className="px-3 py-2">
                      {firstImg ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={firstImg.url}
                          alt={firstImg.alt?.vi ?? nameVi}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-paper-2 rounded flex items-center justify-center text-muted text-[10px]">
                          —
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 font-medium">{nameVi}</td>
                    <td className="px-3 py-2 text-muted font-mono text-xs hidden md:table-cell">
                      {row.slug}
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell">{row.series}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-3 py-2 text-muted text-xs hidden lg:table-cell">
                      {new Date(row.updatedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/products/${row.slug}/edit`}
                          className="text-xs text-primary hover:underline"
                        >
                          Sửa
                        </Link>
                        <DeleteButton slug={row.slug} name={nameVi} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
