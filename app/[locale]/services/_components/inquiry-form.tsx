"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";
import { createPublicLead } from "@/lib/crm/leads-client";
import { type CrmLeadPayload, type CrmServiceCode } from "@/lib/validation/crm-lead-schema";

// Maps a service-detail slug to its CRM service code. Slugs without a known
// mapping send no `services` (never send unknown codes — CRM rejects them).
const SERVICE_SLUG_TO_CRM_CODE: Record<string, CrmServiceCode> = {
  retrofit: "machine_upgrade",
};

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().trim().min(1, "Vui lòng nhập số điện thoại"),
  email: z.union([z.literal(""), z.email("Email không hợp lệ")]).optional(),
  message: z.string().max(2000).optional(),
  honeypot: z.string().optional(),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

interface Props {
  serviceSlug?: string;
  serviceName?: string;
}

export function InquiryForm({ serviceSlug, serviceName }: Props) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { honeypot: "" },
  });

  async function onSubmit(values: InquiryFormValues) {
    if (values.honeypot) {
      reset();
      setStatus("success");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    const code = serviceSlug ? SERVICE_SLUG_TO_CRM_CODE[serviceSlug] : undefined;
    const payload: CrmLeadPayload = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      ...(values.email?.trim() ? { email: values.email.trim() } : {}),
      ...(values.message?.trim() ? { notes: values.message.trim() } : {}),
      ...(code ? { services: [code] } : {}),
    };

    const result = await createPublicLead(payload);
    if (result.ok) {
      reset();
      setStatus("success");
      return;
    }

    setStatus("error");
    if (result.kind === "rate_limit") setErrorMsg("Quá nhiều yêu cầu. Vui lòng chờ và thử lại.");
    else if (result.kind === "validation") setErrorMsg(result.error);
    else setErrorMsg("Có lỗi xảy ra. Vui lòng thử lại.");
  }

  if (status === "success") {
    return (
      <div className="bg-paper border border-line p-8 text-center">
        <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-2">
          [ Gửi thành công ]
        </div>
        <p className="text-sm text-[#3a3a3a] m-0">Cảm ơn! Đội QS sẽ liên hệ trong 4 giờ làm việc.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 font-mono text-[11px] tracking-[.14em] uppercase text-gold-1 underline"
        >
          Gửi yêu cầu khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-line p-6 sm:p-8" noValidate>
      {/* Honeypot */}
      <input {...register("honeypot")} type="text" tabIndex={-1} aria-hidden="true" style={{ display: "none" }} />

      <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-4">
        [ Yêu cầu tư vấn dịch vụ{serviceName ? ` · ${serviceName}` : ""} ]
      </div>

      <div className="space-y-4">
        <Field label="Họ & tên *" error={errors.name?.message}>
          <input {...register("name")} type="text" placeholder="Nguyễn Văn A" className={inputCls(!!errors.name)} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
          <Field label="Điện thoại *" error={errors.phone?.message}>
            <input {...register("phone")} type="tel" placeholder="0901 234 567" className={inputCls(!!errors.phone)} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input {...register("email")} type="email" placeholder="name@company.vn" className={inputCls(!!errors.email)} />
          </Field>
        </div>

        <Field label="Nội dung" error={errors.message?.message}>
          <textarea
            {...register("message")}
            rows={4}
            placeholder="Mô tả yêu cầu, quy mô, thời gian mong muốn…"
            className={`${inputCls(false)} resize-none`}
          />
        </Field>

        {status === "error" && (
          <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-4 py-3">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="qs-btn qs-btn-gold w-full justify-center disabled:opacity-60"
        >
          {status === "submitting" ? "Đang gửi…" : "Gửi yêu cầu →"}
        </button>
      </div>
    </form>
  );
}

function inputCls(hasError: boolean) {
  return `w-full border ${hasError ? "border-red-400" : "border-line"} bg-white px-4 py-3 text-base sm:text-sm focus:outline-none focus:border-ink transition-colors`;
}

function Field({
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
        <span className="block font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-1.5">{label}</span>
        {children}
      </label>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
