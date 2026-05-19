"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteUser } from "@/app/admin/_actions/users";

export function InviteForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const email = data.get("email") as string;
    const name = data.get("name") as string;
    const role = data.get("role") as string;

    if (!email || !name || !role) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    startTransition(async () => {
      try {
        await inviteUser({ email, name, role });
        setSuccess(`Đã gửi lời mời tới ${email}.`);
        form.reset();
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Đã xảy ra lỗi. Thử lại.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-md">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] tracking-[.14em] uppercase text-muted">
          Email <span className="text-red-500">*</span>
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="off"
          placeholder="user@example.com"
          className="border border-line bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-ink"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] tracking-[.14em] uppercase text-muted">
          Tên hiển thị <span className="text-red-500">*</span>
        </span>
        <input
          type="text"
          name="name"
          required
          autoComplete="off"
          placeholder="Nguyễn Văn A"
          className="border border-line bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-ink"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] tracking-[.14em] uppercase text-muted">
          Vai trò <span className="text-red-500">*</span>
        </span>
        <select
          name="role"
          required
          defaultValue="editor"
          className="border border-line bg-white px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-ink"
        >
          <option value="editor">Biên tập viên (Editor)</option>
          <option value="admin">Quản trị viên (Admin)</option>
        </select>
      </label>

      {error ? (
        <div className="text-sm text-[#c8553d] font-mono bg-red-50 border border-red-200 px-4 py-3">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="text-sm text-green-700 font-mono bg-green-50 border border-green-200 px-4 py-3">
          {success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="qs-btn qs-btn-gold self-start disabled:opacity-60"
      >
        {pending ? "Đang gửi..." : "Gửi lời mời →"}
      </button>
    </form>
  );
}
