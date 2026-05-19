import Link from "next/link";

export const metadata = { title: "Không có quyền — QS Technology" };

export default function ForbiddenPage() {
  return (
    <section className="min-h-[70vh] bg-paper grid place-items-center">
      <div className="max-w-md text-center px-6">
        <div className="font-mono text-[11px] tracking-[.18em] uppercase text-gold-1">[ 403 ]</div>
        <h1 className="font-display font-bold text-4xl mt-3 tracking-[-.02em]">Bạn không có quyền truy cập</h1>
        <p className="mt-4 text-sm text-muted">
          Tài khoản hiện tại không có quyền vào khu vực này. Liên hệ quản trị viên nếu bạn nghĩ
          đây là lỗi.
        </p>
        <div className="mt-7 flex gap-3 justify-center">
          <Link className="qs-btn qs-btn-gold" href="/">Về trang chủ</Link>
          <Link className="qs-btn qs-btn-ghost" href="/login">Đăng nhập lại</Link>
        </div>
      </div>
    </section>
  );
}
