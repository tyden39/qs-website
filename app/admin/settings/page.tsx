import { requireRole } from "@/lib/auth/require";

export default async function AdminSettingsPage() {
  await requireRole(["admin"]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "(not set)";
  const resendFrom = process.env.RESEND_FROM ?? "(not set)";

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">
          Admin · Settings
        </div>
        <h1 className="font-display font-bold text-2xl tracking-[-.01em] mt-1">
          Cài đặt hệ thống
        </h1>
        <p className="text-sm text-muted mt-2">
          Cấu hình chi tiết sẽ khả dụng trong phiên bản tiếp theo.
        </p>
      </div>

      {/* Environment info — read-only */}
      <div className="border border-line bg-white p-6 space-y-4">
        <h2 className="font-mono text-[11px] tracking-[.14em] uppercase text-muted border-b border-line pb-3">
          Thông tin môi trường
        </h2>

        <dl className="space-y-3">
          <div className="flex flex-col gap-0.5">
            <dt className="font-mono text-[10px] tracking-[.14em] uppercase text-muted">
              App URL
            </dt>
            <dd className="font-mono text-sm text-ink">{appUrl}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="font-mono text-[10px] tracking-[.14em] uppercase text-muted">
              Email gửi đi (RESEND_FROM)
            </dt>
            <dd className="font-mono text-sm text-ink">{resendFrom}</dd>
          </div>
        </dl>
      </div>

      <div className="border border-line border-dashed bg-paper p-6 text-center">
        <p className="font-mono text-[11px] tracking-[.12em] uppercase text-muted">
          Cài đặt thương hiệu, màu sắc, OG image mặc định sẽ khả dụng ở Phase 11+
        </p>
      </div>
    </div>
  );
}
