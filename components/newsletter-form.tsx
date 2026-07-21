"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";

type NewsletterInput = { email: string; locale: "vi" | "en"; honeypot?: string };

export function NewsletterForm({ locale = "vi" }: { locale?: string }) {
  const t = useTranslations("contact.newsletter");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Schema built inside the component so the validation message is localized.
  const newsletterSchema = z.object({
    email: z.email(t("invalidEmail")),
    locale: z.enum(["vi", "en"]),
    honeypot: z.string().optional(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { locale: locale as "vi" | "en", honeypot: "" },
  });

  async function onSubmit(values: NewsletterInput) {
    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source: "newsletter" }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-meta text-gold-2 leading-relaxed">
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4">
      {/* Honeypot */}
      <input {...register("honeypot")} type="text" tabIndex={-1} aria-hidden="true" style={{ display: "none" }} />
      <input {...register("locale")} type="hidden" />

      <div className="flex items-stretch gap-0">
        <input
          {...register("email")}
          type="email"
          placeholder={t("placeholder")}
          className={`flex-1 min-w-0 border ${errors.email ? "border-red-400" : "border-[#2a2a2a]"} bg-transparent px-4 py-2.5 text-body text-[#cfc9b8] placeholder:text-[#5a5650] focus:outline-none focus:border-gold-1 transition-colors`}
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="border border-l-0 border-[#2a2a2a] px-4 py-2.5 font-mono text-label-xs tracking-[.14em] uppercase text-[#cfc9b8] hover:border-gold-1 hover:text-gold-2 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {status === "submitting" ? t("submitting") : t("submit")}
        </button>
      </div>

      {errors.email && (
        <p className="mt-1 text-meta text-red-400">{errors.email.message}</p>
      )}
      {status === "error" && (
        <p className="mt-1 text-meta text-red-400">{t("error")}</p>
      )}
    </form>
  );
}
