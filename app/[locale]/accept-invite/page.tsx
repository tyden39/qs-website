import { createHash } from "crypto";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { invite } from "@/lib/db/schema/runtime";
import { eq, and, isNull, gt } from "drizzle-orm";
import { SetPasswordForm } from "./set-password-form";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; email?: string }>;
};

// GET does NOT mark invite used — defends against URL scanners / Outlook ATP
// that pre-fetch links in emails.
export default async function AcceptInvitePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token, email } = await searchParams;

  // Missing params — not a valid invite link
  if (!token || !email) {
    return <InviteError message="Liên kết lời mời không hợp lệ. Thiếu thông tin token hoặc email." />;
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  // Validate invite — read-only, no mutation
  const [row] = await db
    .select({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
      usedAt: invite.usedAt,
      revoked: invite.revoked,
    })
    .from(invite)
    .where(eq(invite.tokenHash, tokenHash));

  if (!row) {
    return <InviteError message="Liên kết lời mời không tồn tại hoặc đã bị xóa." />;
  }

  if (row.email !== email) {
    return <InviteError message="Liên kết lời mời không hợp lệ." />;
  }

  if (row.revoked) {
    return <InviteError message="Lời mời này đã bị thu hồi bởi quản trị viên." />;
  }

  if (row.usedAt) {
    return <InviteError message="Lời mời này đã được sử dụng. Vui lòng đăng nhập hoặc liên hệ quản trị viên." />;
  }

  if (row.expiresAt <= new Date()) {
    return <InviteError message="Liên kết lời mời đã hết hạn. Vui lòng yêu cầu lời mời mới." />;
  }

  const ROLE_LABELS: Record<string, string> = {
    admin: "Quản trị viên",
    editor: "Biên tập viên",
  };
  const roleLabel = ROLE_LABELS[row.role] ?? row.role;

  return (
    <section className="min-h-[70vh] bg-paper border-b border-line">
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="qs-eyebrow">QS Admin · Kích hoạt tài khoản</div>
        <h1 className="font-display font-bold text-[32px] tracking-[-.02em] mt-2 mb-2">
          Chào mừng bạn
        </h1>
        <p className="text-sm text-muted mb-6">
          Bạn được mời với vai trò{" "}
          <strong className="text-ink">{roleLabel}</strong>. Thiết lập mật khẩu
          để kích hoạt tài khoản.
        </p>
        <div className="bg-white border border-line p-7">
          <SetPasswordForm token={token} email={email} locale={locale} />
        </div>
      </div>
    </section>
  );
}

function InviteError({ message }: { message: string }) {
  return (
    <section className="min-h-[70vh] bg-paper border-b border-line">
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="qs-eyebrow">QS Admin · Lời mời</div>
        <h1 className="font-display font-bold text-[32px] tracking-[-.02em] mt-2 mb-4">
          Liên kết không hợp lệ
        </h1>
        <div className="bg-white border border-red-200 p-6">
          <p className="text-sm text-[#c8553d] font-mono">{message}</p>
        </div>
        <p className="mt-6 text-sm text-muted">
          Nếu bạn cần hỗ trợ, hãy liên hệ quản trị viên hệ thống.
        </p>
      </div>
    </section>
  );
}
