import Link from "next/link";
import { requireRole } from "@/lib/auth/require";
import { listUsers } from "@/app/admin/_actions/users";
import { UserTable } from "./_components/user-columns";

type Props = {
  searchParams: Promise<{ role?: string; status?: string }>;
};

const ROLES = ["admin", "editor", "customer"] as const;
const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  editor: "Editor",
  customer: "Customer",
};

export default async function AdminUsersPage({ searchParams }: Props) {
  const session = await requireRole(["admin"]);
  const { role, status } = await searchParams;

  const banned =
    status === "banned" ? true : status === "active" ? false : undefined;

  const users = await listUsers({ role, banned });

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = { role, status, ...params };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    const qs = sp.toString();
    return `/admin/users${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">
            Admin · Users
          </div>
          <h1 className="font-display font-bold text-2xl tracking-[-.01em] mt-1">
            Quản lý người dùng
          </h1>
        </div>
        <Link
          href="/admin/users/invite"
          className="qs-btn qs-btn-gold font-mono text-[11px] tracking-[.12em] uppercase"
        >
          + Mời người dùng
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="font-mono text-[10px] text-muted tracking-[.14em] uppercase">
          Role:
        </span>
        <div className="flex gap-1.5">
          <Link
            href={buildUrl({ role: undefined })}
            className={`px-3 py-1.5 border font-mono text-[10px] tracking-[.12em] uppercase transition-colors ${
              !role
                ? "bg-ink text-white border-ink"
                : "border-line hover:border-ink"
            }`}
          >
            Tất cả
          </Link>
          {ROLES.map((r) => (
            <Link
              key={r}
              href={buildUrl({ role: r })}
              className={`px-3 py-1.5 border font-mono text-[10px] tracking-[.12em] uppercase transition-colors ${
                role === r
                  ? "bg-ink text-white border-ink"
                  : "border-line hover:border-ink"
              }`}
            >
              {ROLE_LABELS[r]}
            </Link>
          ))}
        </div>

        <span className="text-line">|</span>

        <span className="font-mono text-[10px] text-muted tracking-[.14em] uppercase">
          Trạng thái:
        </span>
        <div className="flex gap-1.5">
          {(
            [
              { value: undefined, label: "Tất cả" },
              { value: "active", label: "Hoạt động" },
              { value: "banned", label: "Vô hiệu" },
            ] as const
          ).map(({ value, label }) => (
            <Link
              key={label}
              href={buildUrl({ status: value })}
              className={`px-3 py-1.5 border font-mono text-[10px] tracking-[.12em] uppercase transition-colors ${
                status === value || (!status && !value)
                  ? "bg-ink text-white border-ink"
                  : "border-line hover:border-ink"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <span className="ml-auto font-mono text-[11px] text-muted">
          {users.length} người dùng
        </span>
      </div>

      <UserTable rows={users} currentUserId={session.user.id} />
    </div>
  );
}
