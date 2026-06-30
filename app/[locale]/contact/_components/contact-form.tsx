"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { createPublicLead } from "@/lib/crm/leads-client";
import {
  CRM_BUSINESS_GROUP_CODES,
  CRM_SERVICE_CODES,
  type CrmLeadPayload,
} from "@/lib/validation/crm-lead-schema";

// Posts to the CRM public lead endpoint. Field shape mirrors the CRM contract
// (qs-crm `docs/lead-form-page-guide.md` §2): name + phone required, email
// optional, business_field (group code or free text), services[] of known codes.
const contactSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  // Optional, but must be a valid email when provided.
  email: z.union([z.literal(""), z.email()]).optional(),
  businessGroup: z.string().optional(),
  businessFieldOther: z.string().max(120).optional(),
  services: z.array(z.enum(CRM_SERVICE_CODES)).optional(),
  message: z.string().max(2000).optional(),
  // Honeypot: humans leave it blank, bots fill it.
  honeypot: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { businessGroup: "", services: [], honeypot: "" },
  });

  const isOther = watch("businessGroup") === "other";

  async function onSubmit(values: ContactFormValues) {
    // Silent bot drop — don't POST, don't tip off the bot.
    if (values.honeypot) {
      reset();
      setStatus("success");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    const businessField =
      values.businessGroup === "other"
        ? values.businessFieldOther?.trim() || undefined
        : values.businessGroup || undefined;
    const services = values.services && values.services.length > 0 ? values.services : undefined;

    const payload: CrmLeadPayload = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      ...(values.email?.trim() ? { email: values.email.trim() } : {}),
      ...(businessField ? { business_field: businessField } : {}),
      ...(values.message?.trim() ? { notes: values.message.trim() } : {}),
      ...(services ? { services } : {}),
    };

    const result = await createPublicLead(payload);
    if (result.ok) {
      reset();
      setStatus("success");
      return;
    }

    setStatus("error");
    if (result.kind === "rate_limit") setErrorMsg(t("error.rateLimit"));
    else if (result.kind === "validation") setErrorMsg(result.error);
    else setErrorMsg(t("error.generic"));
  }

  if (status === "success") {
    return (
      <div className="bg-white border border-line p-6 sm:p-8">
        <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-3">
          {t("success.eyebrow")}
        </div>
        <h3 className="font-display font-semibold text-xl tracking-[-.005em] m-0 mb-3">
          {t("success.heading")}
        </h3>
        <p className="text-sm text-[#3a3a3a] leading-[1.7] m-0">{t("success.body")}</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-5 font-mono text-[11px] tracking-[.14em] uppercase text-gold-1 underline underline-offset-2"
        >
          {t("form.sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-line p-6 sm:p-8" noValidate>
      {/* Honeypot — hidden from humans, bots fill it */}
      <input {...register("honeypot")} type="text" tabIndex={-1} aria-hidden="true" style={{ display: "none" }} />

      <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-5">
        {t("form.eyebrow")}
      </div>
      <h3 className="font-display font-semibold text-xl tracking-[-.005em] m-0 mb-2.5">
        {t("form.heading")}
      </h3>
      <p className="text-sm text-[#5a5650] leading-[1.6] m-0 mb-6">{t("form.note")}</p>

      <div className="space-y-5">
        <FormField label={t("form.name")} error={errors.name && t("error.validation.name")}>
          <input
            {...register("name")}
            type="text"
            placeholder={t("form.namePlaceholder")}
            className={inputCls(!!errors.name)}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
          <FormField label={t("form.phone")} error={errors.phone && t("error.validation.phone")}>
            <input
              {...register("phone")}
              type="tel"
              placeholder={t("form.phonePlaceholder")}
              className={inputCls(!!errors.phone)}
            />
          </FormField>
          <FormField label={t("form.email")} error={errors.email && t("error.validation.email")}>
            <input
              {...register("email")}
              type="email"
              placeholder={t("form.emailPlaceholder")}
              className={inputCls(!!errors.email)}
            />
          </FormField>
        </div>

        <FormField label={t("form.businessField")} error={errors.businessFieldOther?.message}>
          <select {...register("businessGroup")} className={inputCls(false)}>
            <option value="">{t("form.businessFieldPlaceholder")}</option>
            {CRM_BUSINESS_GROUP_CODES.map((code) => (
              <option key={code} value={code}>
                {t(`form.businessOptions.${code}`)}
              </option>
            ))}
            <option value="other">{t("form.businessOptions.other")}</option>
          </select>
        </FormField>

        {isOther && (
          <FormField label={t("form.businessFieldOther")}>
            <input
              {...register("businessFieldOther")}
              type="text"
              placeholder={t("form.businessFieldOtherPlaceholder")}
              className={inputCls(false)}
            />
          </FormField>
        )}

        <fieldset>
          <legend className="block font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-2.5">
            {t("form.services")}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {CRM_SERVICE_CODES.map((code) => (
              <label
                key={code}
                className="flex items-center gap-2.5 border border-line px-3 py-2.5 text-sm cursor-pointer hover:border-ink transition-colors"
              >
                <input {...register("services")} type="checkbox" value={code} className="accent-gold-1" />
                {t(`form.serviceOptions.${code}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <FormField label={t("form.message")}>
          <textarea
            {...register("message")}
            rows={5}
            placeholder={t("form.messagePlaceholder")}
            className={`${inputCls(false)} resize-none`}
          />
        </FormField>

        {status === "error" && (
          <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-4 py-3">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="qs-btn qs-btn-gold w-full justify-center mt-2 disabled:opacity-60"
        >
          {status === "submitting" ? t("form.submitting") : t("form.submit")}
        </button>
      </div>
    </form>
  );
}

function inputCls(hasError: boolean) {
  return `w-full border ${hasError ? "border-red-400" : "border-line"} bg-white px-4 py-3 text-base sm:text-sm focus:outline-none focus:border-ink transition-colors`;
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block">
        <span className="block font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-1.5">
          {label}
        </span>
        {children}
      </label>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
