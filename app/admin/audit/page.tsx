import Link from "next/link";
import { requireRole } from "@/lib/auth/require";
import {
  getAuditLog,
  getAuditEntities,
  getAuditActions,
} from "@/app/admin/_actions/audit-queries";
import { AuditTable } from "./_components/audit-columns";

type Props = {
  searchParams: Promise<{
    actor?: string;
    entity?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 50;

export default async function AdminAuditPage({ searchParams }: Props) {
  await requireRole(["admin"]);

  const { actor, entity, action, from, to, page: pageStr } = await searchParams;
  const page = Math.max(0, parseInt(pageStr ?? "0", 10) || 0);

  const [{ rows, total }, entities, actions] = await Promise.all([
    getAuditLog({ actor, entity, action, from, to, page, pageSize: PAGE_SIZE }),
    getAuditEntities(),
    getAuditActions(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = { actor, entity, action, from, to, page: String(page), ...params };
    Object.entries(merged).forEach(([k, v]) => {
      if (!v) return;
      if (k === "page" && v === "0") return;
      sp.set(k, v);
    });
    const qs = sp.toString();
    return `/admin/audit${qs ? `?${qs}` : ""}`;
  }

  function pageUrl(p: number) {
    return buildUrl({ page: p > 0 ? String(p) : undefined });
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">
          Admin · Audit
        </div>
        <h1 className="font-display font-bold text-2xl tracking-[-.01em] mt-1">
          Nhật ký hoạt động
        </h1>
      </div>

      {/* Filters */}
      <form method="GET" action="/admin/audit" className="flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-muted tracking-[.14em] uppercase">
            Actor (email)
          </span>
          <input
            name="actor"
            defaultValue={actor}
            placeholder="email@..."
            className="border border-line bg-white px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-ink w-44"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-muted tracking-[.14em] uppercase">
            Entity
          </span>
          <select
            name="entity"
            defaultValue={entity ?? ""}
            className="border border-line bg-white px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-ink"
          >
            <option value="">Tất cả</option>
            {entities.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-muted tracking-[.14em] uppercase">
            Action
          </span>
          <select
            name="action"
            defaultValue={action ?? ""}
            className="border border-line bg-white px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-ink"
          >
            <option value="">Tất cả</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-muted tracking-[.14em] uppercase">
            Từ ngày
          </span>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="border border-line bg-white px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-ink"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-muted tracking-[.14em] uppercase">
            Đến ngày
          </span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="border border-line bg-white px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-ink"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="qs-btn qs-btn-gold px-4 py-1.5 font-mono text-[11px] tracking-[.12em] uppercase"
          >
            Lọc
          </button>
          <Link
            href="/admin/audit"
            className="inline-flex items-center border border-line px-4 py-1.5 font-mono text-[11px] tracking-[.12em] uppercase hover:border-ink transition-colors"
          >
            Xóa lọc
          </Link>
        </div>

        <span className="ml-auto font-mono text-[11px] text-muted self-end">
          {total} bản ghi
        </span>
      </form>

      <AuditTable rows={rows} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 justify-end">
          {page > 0 && (
            <Link
              href={pageUrl(page - 1)}
              className="border border-line px-3 py-1.5 font-mono text-[11px] tracking-[.1em] hover:border-ink transition-colors"
            >
              ← Trước
            </Link>
          )}
          <span className="font-mono text-[11px] text-muted">
            Trang {page + 1} / {totalPages}
          </span>
          {page < totalPages - 1 && (
            <Link
              href={pageUrl(page + 1)}
              className="border border-line px-3 py-1.5 font-mono text-[11px] tracking-[.1em] hover:border-ink transition-colors"
            >
              Sau →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
