import Link from "next/link";
import { requireRole } from "@/lib/auth/require";
import { InviteForm } from "../_components/invite-form";

export default async function AdminInvitePage() {
  await requireRole(["admin"]);

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">
          Admin · Users ·{" "}
          <Link href="/admin/users" className="hover:underline">
            Danh sách
          </Link>{" "}
          · Mời người dùng
        </div>
        <h1 className="font-display font-bold text-2xl tracking-[-.01em] mt-1">
          Mời người dùng mới
        </h1>
        <p className="text-sm text-muted mt-2">
          Gửi lời mời qua email. Người nhận có 24 giờ để kích hoạt tài khoản.
        </p>
      </div>

      <div className="border border-line bg-white p-7">
        <InviteForm />
      </div>
    </div>
  );
}
