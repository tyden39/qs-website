"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message ?? "Đăng nhập thất bại");
        return;
      }
      router.replace(callbackUrl);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] tracking-[.14em] uppercase text-muted">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-line bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-ink"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] tracking-[.14em] uppercase text-muted">Mật khẩu</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-line bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-ink"
        />
      </label>
      {error ? (
        <div className="text-sm text-[#c8553d] font-mono">{error}</div>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="qs-btn qs-btn-gold mt-2 justify-center disabled:opacity-60"
      >
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
