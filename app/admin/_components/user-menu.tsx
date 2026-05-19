"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

type Props = {
  user: { name?: string | null; email: string; role?: string | null };
};

export function UserMenu({ user }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSignOut() {
    setPending(true);
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 border border-line bg-white px-3 py-1.5 text-sm"
      >
        <span className="font-mono text-[10px] tracking-[.16em] uppercase text-muted">
          {user.role ?? "user"}
        </span>
        <span className="font-medium">{user.name || user.email}</span>
        <span className="text-muted">▾</span>
      </button>
      {open ? (
        <div className="absolute right-0 mt-1 w-56 bg-white border border-line shadow-md z-30">
          <div className="px-3 py-2 border-b border-line">
            <div className="text-sm font-medium">{user.name || "QS Admin"}</div>
            <div className="text-xs text-muted truncate">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            disabled={pending}
            className="w-full text-left px-3 py-2 text-sm hover:bg-paper disabled:opacity-60"
          >
            {pending ? "Đang thoát..." : "Đăng xuất"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
