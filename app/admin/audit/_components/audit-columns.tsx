import type { AuditLogRow } from "@/app/admin/_actions/audit-queries";
import { DiffViewer } from "./diff-viewer";

const ACTION_COLORS: Record<string, string> = {
  create: "border-green-300 bg-green-50 text-green-700",
  update: "border-blue-300 bg-blue-50 text-blue-700",
  delete: "border-red-300 bg-red-50 text-red-700",
  invite: "border-purple-300 bg-purple-50 text-purple-700",
  role_change: "border-yellow-300 bg-yellow-50 text-yellow-700",
  deactivate: "border-orange-300 bg-orange-50 text-orange-700",
  accept_invite: "border-teal-300 bg-teal-50 text-teal-700",
};

function ActionBadge({ action }: { action: string }) {
  const cls =
    ACTION_COLORS[action] ?? "border-line bg-paper text-muted";
  return (
    <span
      className={`inline-block px-2 py-0.5 border font-mono text-[10px] tracking-[.1em] uppercase ${cls}`}
    >
      {action}
    </span>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

interface AuditTableProps {
  rows: AuditLogRow[];
}

export function AuditTable({ rows }: AuditTableProps) {
  if (rows.length === 0) {
    return (
      <div className="border border-line bg-paper p-10 text-center">
        <p className="text-muted text-sm m-0">Không có bản ghi audit nào.</p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-white overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-line bg-paper">
            <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted w-10">
              #
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">
              Thời gian
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">
              Actor
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">
              Action
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">
              Entity
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">
              Diff / ID
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-line hover:bg-paper transition-colors align-top"
            >
              <td className="px-4 py-3 font-mono text-xs text-muted">
                {row.id}
              </td>
              <td className="px-4 py-3 font-mono text-[11px] text-muted whitespace-nowrap">
                {formatDate(row.createdAt)}
              </td>
              <td className="px-4 py-3">
                {row.actorEmail ? (
                  <>
                    <div className="font-semibold text-ink text-[13px]">
                      {row.actorName ?? "—"}
                    </div>
                    <div className="font-mono text-[11px] text-muted">
                      {row.actorEmail}
                    </div>
                  </>
                ) : (
                  <span className="font-mono text-[11px] text-muted">system</span>
                )}
              </td>
              <td className="px-4 py-3">
                <ActionBadge action={row.action} />
              </td>
              <td className="px-4 py-3">
                <span className="inline-block px-2 py-0.5 border border-line bg-paper font-mono text-[10px] tracking-[.1em] uppercase">
                  {row.entity}
                </span>
              </td>
              <td className="px-4 py-3 max-w-xs">
                <DiffViewer diff={row.diff} entityId={row.entityId} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
