"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeUserRole, deactivateUser } from "@/app/admin/_actions/users";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean | null;
  emailVerified: boolean;
  createdAt: Date;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Quản trị viên",
  editor: "Biên tập viên",
  customer: "Khách hàng",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "border-purple-300 bg-purple-50 text-purple-700",
  editor: "border-blue-300 bg-blue-50 text-blue-700",
  customer: "border-line bg-paper text-muted",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function RoleSelect({
  userId,
  currentRole,
  currentUserId,
}: {
  userId: string;
  currentRole: string | null;
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isSelf = userId === currentUserId;

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value;
    startTransition(async () => {
      await changeUserRole({ userId, role });
      router.refresh();
    });
  }

  return (
    <select
      defaultValue={currentRole ?? "customer"}
      disabled={pending || isSelf}
      onChange={handleChange}
      title={isSelf ? "Không thể thay đổi role của chính bạn" : undefined}
      className="border border-line bg-white px-2 py-1 text-[12px] font-mono focus:outline-none focus:border-ink disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="customer">Khách hàng</option>
      <option value="editor">Biên tập viên</option>
      <option value="admin">Quản trị viên</option>
    </select>
  );
}

function DeactivateButton({
  userId,
  banned,
  currentUserId,
}: {
  userId: string;
  banned: boolean | null;
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isSelf = userId === currentUserId;

  function handleClick() {
    if (!confirm("Vô hiệu hoá tài khoản này?")) return;
    startTransition(async () => {
      await deactivateUser({ userId });
      router.refresh();
    });
  }

  if (banned) {
    return (
      <span className="font-mono text-[10px] text-muted tracking-[.1em] uppercase">
        Đã vô hiệu
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending || isSelf}
      title={isSelf ? "Không thể vô hiệu hoá tài khoản của chính bạn" : undefined}
      className="border border-line px-3 py-1 font-mono text-[10px] tracking-[.1em] uppercase hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "..." : "Vô hiệu"}
    </button>
  );
}

interface UserTableProps {
  rows: UserRow[];
  currentUserId: string;
}

export function UserTable({ rows, currentUserId }: UserTableProps) {
  if (rows.length === 0) {
    return (
      <div className="border border-line bg-paper p-10 text-center">
        <p className="text-muted text-sm m-0">Không có người dùng nào.</p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-white overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-line bg-paper">
            <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">
              Tên / Email
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">
              Role
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">
              Trạng thái
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] tracking-[.14em] uppercase text-muted">
              Ngày tạo
            </th>
            <th className="px-4 py-3 text-right font-mono text-[10px] tracking-[.14em] uppercase text-muted">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => {
            const role = u.role ?? "customer";
            const roleClass = ROLE_COLORS[role] ?? ROLE_COLORS.customer;
            return (
              <tr
                key={u.id}
                className="border-b border-line hover:bg-paper transition-colors align-top"
              >
                <td className="px-4 py-3">
                  <div className="font-semibold text-ink">{u.name}</div>
                  <div className="font-mono text-[11px] text-muted">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 border font-mono text-[10px] tracking-[.1em] uppercase mb-1 ${roleClass}`}
                  >
                    {ROLE_LABELS[role] ?? role}
                  </span>
                  <div>
                    <RoleSelect
                      userId={u.id}
                      currentRole={u.role}
                      currentUserId={currentUserId}
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  {u.banned ? (
                    <span className="inline-block px-2 py-0.5 border border-red-300 bg-red-50 text-red-700 font-mono text-[10px] tracking-[.1em] uppercase">
                      Vô hiệu
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 border border-green-300 bg-green-50 text-green-700 font-mono text-[10px] tracking-[.1em] uppercase">
                      Hoạt động
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-muted whitespace-nowrap">
                  {formatDate(u.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeactivateButton
                    userId={u.id}
                    banned={u.banned}
                    currentUserId={currentUserId}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
