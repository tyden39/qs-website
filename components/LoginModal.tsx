"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import Image from "@/components/media/image";
import { useAuth } from "@/lib/auth/auth-context";

export function LoginModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations("auth");
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      onClose();
    } catch {
      setError(t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-[380px] bg-ink-2 border border-white/10 rounded-lg p-8 text-white"
      >
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo-st.webp" alt="" width={64} height={64} className="h-16 w-auto mb-4" />
          <h2 className="font-display font-semibold text-title m-0">{t("loginTitle")}</h2>
        </div>

        {error && (
          <p className="text-[13px] text-red-400 mb-4" role="alert">
            {error}
          </p>
        )}

        <label className="block mb-4">
          <span className="block text-label-xs text-white/60 mb-1.5">{t("email")}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            autoComplete="username"
            autoFocus
            required
            className="w-full bg-white/5 border border-white/15 rounded px-3 py-2.5 text-white placeholder:text-white/35 outline-none focus:border-gold"
          />
        </label>

        <label className="block mb-2">
          <span className="block text-label-xs text-white/60 mb-1.5">{t("password")}</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              autoComplete="current-password"
              required
              className="w-full bg-white/5 border border-white/15 rounded px-3 py-2.5 pr-10 text-white placeholder:text-white/35 outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
              aria-label={t("password")}
            >
              👁
            </button>
          </div>
        </label>

        <div className="text-right mb-5">
          <a href="#" className="text-[13px] text-gold-2 hover:underline">
            {t("forgotPassword")}
          </a>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-gold-1 py-2.5 font-mono font-semibold uppercase tracking-widest text-ink hover:bg-gold transition-colors disabled:opacity-60"
        >
          {isSubmitting ? t("submitting") : t("submit")}
        </button>

        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute top-4 right-4 text-white/50 hover:text-white/80"
        >
          ✕
        </button>
      </form>
    </div>
  );
}
