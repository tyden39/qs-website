import Link from "next/link";
import { requireRole } from "@/lib/auth/require";
import { adminListLeads } from "@/app/admin/_actions/leads";
import { LEAD_STATUSES, LEAD_SOURCES } from "@/lib/leads/constants";

type Props = { searchParams: Promise<{ status?: string; source?: string }> };

const STATUS_COLORS: Record<string, string> = {
  new: "border-blue-300 bg-blue-50 text-blue-700",
  contacted: "border-yellow-300 bg-yellow-50 text-yellow-700",
  qualified: "border-green-300 bg-green-50 text-green-700",
  closed: "border-line bg-paper text-muted",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  qualified: "Tiềm năng",
  closed: "Đóng",
};

const SOURCE_LABELS: Record<string, string> = {
  contact: "Liên hệ",
  newsletter: "Newsletter",
  datasheet: "Datasheet",
  inquiry: "Dịch vụ",
};

export default async function AdminLeadsPage({ searchParams }: Props) {
  await requireRole(["admin", "editor"]);
  const { status, source } = await searchParams;

  const leads = await adminListLeads({
    status: status ?? undefined,
    source: source ?? undefined,
    limit: 100,
  });

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v); });
    const qs = sp.toString();
    return `/admin/leads${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">Admin · Leads</div>
        <h1 className="font-display font-bold text-2xl tracking-[-.01em] mt-1">Inbox liên hệ</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="font-mono text-[10px] text-muted tracking-[.14em] uppercase">Lọc:</span>

        {/* Status filter */}
        <div className="flex gap-1.5">
          <Link
            href={buildUrl({ source })}
            className={`px-3 py-1.5 border font-mono text-[10px] tracking-[.12em] uppercase transition-colors ${
              !status ? "bg-ink text-white border-ink" : "border-line hover:border-ink"
            }`}
          >
            Tất cả
          </Link>
          {LEAD_STATUSES.map((s) => (
            <Link
              key={s}
              href={buildUrl({ status: s, source })}
              className={`px-3 py-1.5 border font-mono text-[10px] tracking-[.12em] uppercase transition-colors ${
                status === s ? "bg-ink text-white border-ink" : "border-line hover:border-ink"
              }`}
            >
              {STATUS_LABELS[s] ?? s}
            </Link>
          ))}
        </div>

        <span className="text-line">|</span>

        {/* Source filter */}
        <div className="flex gap-1.5">
          {LEAD_SOURCES.map((src) => (
            <Link
              key={src}
              href={buildUrl({ status, source: source === src ? undefined : src })}
              className={`px-3 py-1.5 border font-mono text-[10px] tracking-[.12em] uppercase transition-colors ${
                source === src ? "bg-gold text-ink border-gold-3" : "border-line hover:border-ink"
              }`}
            >
              {SOURCE_LABELS[src] ?? src}
            </Link>
          ))}
        </div>

        <span className="ml-auto font-mono text-[11px] text-muted">{leads.length} kết quả</span>
      </div>

      {/* Table */}
      {leads.length === 0 ? (
        <div className="border border-line bg-paper p-10 text-center">
          <p className="text-muted text-sm m-0">Không có lead nào phù hợp bộ lọc.</p>
        </div>
      ) : (
        <div className="border border-line bg-white overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-line bg-paper">
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted w-10">#</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">Tên / Email</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">Công ty</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">Nguồn</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">Trạng thái</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">Thời gian</th>
                <th className="px-4 py-3 text-right font-mono text-[10px] tracking-[.14em] uppercase text-muted">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-line hover:bg-paper transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{lead.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{lead.name ?? "—"}</div>
                    <div className="font-mono text-[11px] text-muted">{lead.email}</div>
                  </td>
                  <td className="px-4 py-3 text-[#3a3a3a] text-[13px]">{lead.company ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 border border-line bg-paper font-mono text-[10px] tracking-[.1em] uppercase">
                      {SOURCE_LABELS[lead.source] ?? lead.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 border font-mono text-[10px] tracking-[.1em] uppercase ${STATUS_COLORS[lead.status] ?? ""}`}>
                      {STATUS_LABELS[lead.status] ?? lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted whitespace-nowrap">
                    {new Date(lead.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="inline-flex items-center border border-line px-3 py-1.5 font-mono text-[10px] tracking-[.12em] uppercase hover:border-ink transition-colors"
                    >
                      Xem →
                    </Link>
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
