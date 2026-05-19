import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Đăng nhập — QS Technology" };

export default function LoginPage() {
  return (
    <section className="min-h-[70vh] bg-paper border-b border-line">
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="qs-eyebrow">QS Admin</div>
        <h1 className="font-display font-bold text-[36px] tracking-[-.02em] mt-2 mb-6">Đăng nhập</h1>
        <div className="bg-white border border-line p-7">
          <Suspense fallback={<div className="text-sm text-muted">Đang tải...</div>}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-sm text-muted">
          Quên mật khẩu? <Link className="underline" href="/contact">Liên hệ quản trị</Link>.
        </p>
      </div>
    </section>
  );
}
