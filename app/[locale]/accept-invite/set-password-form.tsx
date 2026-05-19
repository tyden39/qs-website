"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptInvite } from "@/app/admin/_actions/users";

interface Props {
  token: string;
  email: string;
  locale: string;
}

export function SetPasswordForm({ token, email, locale }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (!name.trim()) {
      setError("Vui lòng nhập tên hiển thị.");
      return;
    }

    startTransition(async () => {
      const result = await acceptInvite({ token, email, password, name: name.trim() });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.replace("/admin/dashboard");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="border border-line bg-paper px-4 py-3">
        <span className="font-mono text-[10px] tracking-[.14em] uppercase text-muted">
          Email
        </span>
        <p className="font-mono text-sm text-ink mt-0.5">{email}</p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] tracking-[.14em] uppercase text-muted">
          Tên hiển thị <span className="text-red-500">*</span>
        </span>
        <input
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nguyễn Văn A"
          className="border border-line bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-ink"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] tracking-[.14em] uppercase text-muted">
          Mật khẩu <span className="text-red-500">*</span>
        </span>
        <input
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          className="border border-line bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-ink"
        />
        <span className="font-mono text-[10px] text-muted">
          Ít nhất 8 ký tự
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] tracking-[.14em] uppercase text-muted">
          Xác nhận mật khẩu <span className="text-red-500">*</span>
        </span>
        <input
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="border border-line bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-ink"
        />
      </label>

      {error ? (
        <div className="text-sm text-[#c8553d] font-mono bg-red-50 border border-red-200 px-4 py-3">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="qs-btn qs-btn-gold mt-2 justify-center disabled:opacity-60"
      >
        {pending ? "Đang kích hoạt..." : "Kích hoạt tài khoản →"}
      </button>
    </form>
  );
}
