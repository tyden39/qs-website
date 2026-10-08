"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { forgotPassword } from "@/lib/auth/api";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await forgotPassword(email.trim());
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="w-full max-w-md bg-white border border-line p-6 sm:p-8">
      <h1 className="font-display font-semibold text-title m-0 mb-2.5">{t("forgot.title")}</h1>
      {status === "sent" ? (
        <p className="text-meta text-[#3a3a3a] leading-[1.7] m-0">{t("forgot.sent")}</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <p className="text-meta text-[#5a5650] leading-[1.6] m-0">{t("forgot.desc")}</p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            className="w-full border border-line bg-white px-4 py-3 text-[16px] sm:text-meta focus:outline-none focus:border-ink transition-colors"
          />
          {status === "error" && (
            <p className="text-meta text-red-600 border border-red-200 bg-red-50 px-4 py-3">{t("forgot.error")}</p>
          )}
          <button type="submit" disabled={status === "submitting"} className="qs-btn qs-btn-gold w-full">
            {status === "submitting" ? t("forgot.submitting") : t("forgot.submit")}
          </button>
        </form>
      )}
      <Link href="/" className="inline-block mt-5 text-meta text-gold-1 underline underline-offset-2">
        {t("forgot.back")}
      </Link>
    </div>
  );
}
