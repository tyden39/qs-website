"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { AuthApiError } from "@/lib/auth/api";
import Image from "@/components/media/image";
import { useAuth } from "@/lib/auth/auth-context";

// Mirrors what /auth/website-register enforces server-side: a password of at
// least 8 characters with an uppercase letter and a digit, and a required
// phone number — the CRM keys a sales lead off the phone, not the email.
// Phone *format* is only loosely checked here: the CRM owns the real rule (VN
// mobile/landline plus E.164) and re-running it would be a second copy to keep
// in sync, so a malformed number comes back as a server-side error instead.
const registerSchema = z.object({
  full_name: z.string().trim().min(1),
  phone: z.string().trim().min(8),
  email: z.email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function describeRegisterError(err: unknown, t: ReturnType<typeof useTranslations>): string {
  if (err instanceof AuthApiError) {
    if (err.code === "PHONE_ALREADY_EXISTS") return t("error.phoneAlreadyExists");
    if (err.code === "USER_ALREADY_EXISTS") return t("error.userAlreadyExists");
  }
  return t("error.generic");
}

export function RegisterModal({
  onClose,
  onSwitchToLogin,
}: {
  onClose: () => void;
  onSwitchToLogin: () => void;
}) {
  const t = useTranslations("auth.register");
  const tAuth = useTranslations("auth");
  const { register: registerAccount } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  // Shown in place of the form once the account exists, so the visitor gets
  // explicit confirmation rather than the modal just vanishing.
  const [isDone, setIsDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await registerAccount({ ...values, region: "VN" });
      setIsDone(true);
    } catch (err) {
      setServerError(describeRegisterError(err, t));
    }
  });

  const fieldCls = (invalid: boolean) =>
    `w-full bg-white/5 border rounded px-3 py-2.5 text-white placeholder:text-white/35 outline-none focus:border-gold ${
      invalid ? "border-red-400/70" : "border-white/15"
    }`;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={isDone ? (e) => e.preventDefault() : onSubmit}
        className="relative w-full max-w-[420px] bg-ink-2 border border-white/10 rounded-lg p-8 text-white"
      >
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo-st.webp" alt="" width={64} height={64} className="h-16 w-auto mb-4" />
          <h2 className="font-display font-semibold text-title m-0">
            {isDone ? t("successTitle") : t("title")}
          </h2>
        </div>

        {isDone ? (
          <>
            <p className="mb-6 text-center text-[14px] text-white/70" role="status">
              {t("successMessage")}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded bg-gold-1 py-2.5 font-mono font-semibold uppercase tracking-widest text-ink hover:bg-gold transition-colors"
            >
              {t("successClose")}
            </button>
          </>
        ) : (
          <>
        {serverError && (
          <p className="text-[13px] text-red-400 mb-4" role="alert">
            {serverError}
          </p>
        )}

        <label className="block mb-4">
          <span className="block text-label-xs text-white/60 mb-1.5">{t("fullName")}</span>
          <input
            {...register("full_name")}
            autoComplete="name"
            autoFocus
            className={fieldCls(!!errors.full_name)}
          />
          {errors.full_name && <span className="mt-1 block text-[12px] text-red-400">{t("error.fullName")}</span>}
        </label>

        <label className="block mb-4">
          <span className="block text-label-xs text-white/60 mb-1.5">{t("phone")}</span>
          <input
            {...register("phone")}
            type="tel"
            autoComplete="tel"
            placeholder={t("phonePlaceholder")}
            className={fieldCls(!!errors.phone)}
          />
          {errors.phone && <span className="mt-1 block text-[12px] text-red-400">{t("error.phone")}</span>}
        </label>

        <label className="block mb-4">
          <span className="block text-label-xs text-white/60 mb-1.5">{tAuth("email")}</span>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder={tAuth("emailPlaceholder")}
            className={fieldCls(!!errors.email)}
          />
          {errors.email && <span className="mt-1 block text-[12px] text-red-400">{t("error.email")}</span>}
        </label>

        <label className="block mb-5">
          <span className="block text-label-xs text-white/60 mb-1.5">{tAuth("password")}</span>
          <input
            {...register("password")}
            type="password"
            autoComplete="new-password"
            placeholder={tAuth("passwordPlaceholder")}
            className={fieldCls(!!errors.password)}
          />
          <span className={`mt-1 block text-[12px] ${errors.password ? "text-red-400" : "text-white/45"}`}>
            {t("passwordHint")}
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-gold-1 py-2.5 font-mono font-semibold uppercase tracking-widest text-ink hover:bg-gold transition-colors disabled:opacity-60"
        >
          {isSubmitting ? t("submitting") : t("submit")}
        </button>

        <p className="mt-4 text-center text-[13px] text-white/60">
          {t("haveAccount")}{" "}
          <button type="button" onClick={onSwitchToLogin} className="text-gold-2 hover:underline">
            {tAuth("submit")}
          </button>
        </p>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label={tAuth("close")}
          className="absolute top-4 right-4 text-white/50 hover:text-white/80"
        >
          ✕
        </button>
      </form>
    </div>
  );
}
