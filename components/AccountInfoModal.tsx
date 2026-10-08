"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/auth-context";
import type { AuthUser } from "@/lib/auth/types";

export function AccountInfoModal({ user, onClose }: { user: AuthUser; onClose: () => void }) {
  const t = useTranslations("auth.menu");
  const { updateFullName } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Username is the login email for website accounts, so it is not shown separately.
  // Email and phone are read-only: the self-service profile API only edits the name.
  const rows: { label: string; value: string }[] = [
    { label: t("info.email"), value: user.email || "—" },
    { label: t("info.phone"), value: user.phone || "—" },
    { label: t("info.roles"), value: user.roles?.length ? user.roles.map((r) => r.name).join(", ") : "—" },
  ];

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setError(t("info.fullNameRequired"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateFullName(fullName);
      setEditing(false);
    } catch {
      setError(t("info.error"));
    } finally {
      setSaving(false);
    }
  }

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
          <div>
            <dt className="text-label-xs text-white/60 mb-1">{t("info.fullName")}</dt>
            <dd className="m-0">
              {editing ? (
                <form onSubmit={save} className="space-y-2">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoFocus
                    aria-label={t("info.fullName")}
                    className="w-full bg-white/5 border border-white/15 rounded px-3 py-2 text-[14px] text-white outline-none focus:border-white/40"
                  />
                  {error && <p className="text-label-xs text-red-400 m-0">{error}</p>}
                  <div className="flex gap-3 text-label-xs">
                    <button type="submit" disabled={saving} className="text-gold-1 hover:underline disabled:opacity-60">
                      {saving ? t("info.saving") : t("info.save")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setFullName(user.full_name ?? "");
                        setError("");
                      }}
                      className="text-white/60 hover:text-white"
                    >
                      {t("info.cancel")}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14px] break-words">{user.full_name || "—"}</span>
                  <button type="button" onClick={() => setEditing(true)} className="text-label-xs text-gold-1 hover:underline">
                    {t("info.edit")}
                  </button>
                </div>
              )}
            </dd>
          </div>
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
