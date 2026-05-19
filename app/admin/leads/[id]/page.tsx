import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/require";
import { adminGetLead, adminGetLeadAuditHistory } from "@/app/admin/_actions/leads";
import { LeadStatusForm } from "../_components/lead-status-form";

type Props = { params: Promise<{ id: string }> };

const SOURCE_LABELS: Record<string, string> = {
  contact: "Liên hệ trực tiếp",
  newsletter: "Newsletter",
  datasheet: "Yêu cầu Datasheet",
  inquiry: "Yêu cầu Dịch vụ",
};

const STATUS_COLORS: Record<string, string> = {
  new: "border-blue-300 bg-blue-50 text-blue-700",
  contacted: "border-yellow-300 bg-yellow-50 text-yellow-700",
  qualified: "border-green-300 bg-green-50 text-green-700",
  closed: "border-line bg-paper text-muted",
};

export default async function LeadDetailPage({ params }: Props) {
  await requireRole(["admin", "editor"]);
  const { id } = await params;
  const leadId = parseInt(id, 10);
  if (isNaN(leadId)) notFound();

  const [lead, history] = await Promise.all([
    adminGetLead(leadId),
    adminGetLeadAuditHistory(leadId),
  ]);
  if (!lead) notFound();

  const payload = lead.payload as Record<string, unknown> | null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-[10px] text-muted tracking-[.14em] uppercase">
        <Link href="/admin/leads" className="hover:text-ink transition-colors">Leads</Link>
        <span>/</span>
        <span className="text-gold-1">#{lead.id}</span>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-8 items-start">
        {/* LEFT: Lead details */}
        <div className="space-y-6">
          <div className="border border-line bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-1">
                  {SOURCE_LABELS[lead.source] ?? lead.source}
                </div>
                <h1 className="font-display font-bold text-xl tracking-[-.01em] m-0">
                  {lead.name ?? lead.email}
                </h1>
              </div>
              <span className={`inline-block px-3 py-1 border font-mono text-[10px] tracking-[.12em] uppercase ${STATUS_COLORS[lead.status] ?? ""}`}>
                {lead.status}
              </span>
            </div>

            {/* Contact fields */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 border-t border-line pt-4">
              {[
                ["Email", lead.email],
                ["Điện thoại", lead.phone ?? "—"],
                ["Công ty", lead.company ?? "—"],
                ["Ngôn ngữ", lead.locale === "vi" ? "Tiếng Việt" : "English"],
                ["Nguồn", SOURCE_LABELS[lead.source] ?? lead.source],
                ["Thời gian", new Date(lead.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })],
                ["IP", lead.ip ?? "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="font-mono text-[10px] text-muted tracking-[.12em] uppercase mb-0.5">{label}</div>
                  <div className="text-sm text-ink">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Message */}
          {lead.message && (
            <div className="border border-line bg-white p-6">
              <div className="font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-3">Nội dung</div>
              <p className="text-sm text-[#3a3a3a] leading-[1.7] whitespace-pre-wrap m-0">{lead.message}</p>
            </div>
          )}

          {/* Payload (extra data like datasheet_slug) */}
          {payload && Object.keys(payload).length > 0 && (
            <div className="border border-line bg-paper p-6">
              <div className="font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-3">Payload</div>
              <dl className="space-y-2">
                {Object.entries(payload).map(([k, v]) => (
                  <div key={k} className="flex gap-4">
                    <dt className="font-mono text-[11px] text-muted w-36 shrink-0">{k}</dt>
                    <dd className="text-sm text-ink m-0">{typeof v === "object" ? JSON.stringify(v) : String(v ?? "")}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Audit history */}
          <div className="border border-line bg-white p-6">
            <div className="font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-4">Lịch sử thao tác</div>
            {history.length === 0 ? (
              <p className="text-sm text-muted m-0">Chưa có thay đổi nào.</p>
            ) : (
              <ol className="space-y-3">
                {history.map((entry) => (
                  <li key={entry.id} className="flex gap-4 items-start">
                    <div className="w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-[10px] bg-paper border border-line px-2 py-0.5 tracking-[.1em] uppercase">
                          {entry.action}
                        </span>
                        <span className="font-mono text-[10px] text-muted">
                          {new Date(entry.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                        </span>
                      </div>
                      {entry.diff != null && (
                        <pre className="mt-1 text-xs text-muted bg-paper border border-line px-3 py-2 overflow-x-auto">
                          {JSON.stringify(entry.diff as Record<string, unknown>, null, 2)}
                        </pre>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* RIGHT: Status management */}
        <div className="border border-line bg-white p-6 sticky top-6">
          <div className="font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-4">Quản lý trạng thái</div>
          <LeadStatusForm
            leadId={lead.id}
            currentStatus={lead.status}
            currentAssignedTo={lead.assignedTo}
          />
        </div>
      </div>
    </div>
  );
}
