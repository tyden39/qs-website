"use client";

import { useTranslations } from "next-intl";
import type { AuthUser } from "@/lib/auth/types";

export function AccountInfoModal({ user, onClose }: { user: AuthUser; onClose: () => void }) {
  const t = useTranslations("auth.menu");

  const rows: { label: string; value: string }[] = [
    { label: t("info.fullName"), value: user.full_name || "—" },
    { label: t("info.username"), value: user.username },
    { label: t("info.email"), value: user.email || "—" },
    { label: t("info.roles"), value: user.roles?.length ? user.roles.map((r) => r.name).join(", ") : "—" },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[380px] bg-ink-2 border border-white/10 rounded-lg p-8 text-white">
        <h2 className="font-display font-semibold text-title m-0 mb-6">{t("info.title")}</h2>

        <dl className="space-y-4">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-label-xs text-white/60 mb-1">{row.label}</dt>
              <dd className="text-[14px] m-0 break-words">{row.value}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={onClose}
          aria-label={t("info.close")}
          className="absolute top-4 right-4 text-white/50 hover:text-white/80"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
