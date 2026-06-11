"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Flat schema without .default() to avoid Resolver<> type mismatch
const inquirySchema = z.object({
  source: z.literal("inquiry"),
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z.email("Email không hợp lệ"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại").max(40),
  company: z.string().max(120).optional(),
  message: z.string().max(2000).optional(),
  locale: z.enum(["vi", "en"]),
  honeypot: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

interface Props {
  serviceSlug?: string;
  serviceName?: string;
  locale?: string;
}

export function InquiryForm({ serviceSlug, serviceName, locale = "vi" }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      source: "inquiry" as const,
      locale: locale as "vi" | "en",
      honeypot: "",
      payload: serviceSlug ? { service_slug: serviceSlug, service_name: serviceName } : undefined,
    },
  });

  // Lead capture is temporarily closed during the CRM migration.
  function onSubmit() {
    /* disabled — see CRM migration notice below */
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-line p-8" noValidate>
      {/* Honeypot */}
      <input {...register("honeypot")} type="text" tabIndex={-1} aria-hidden="true" style={{ display: "none" }} />
      <input {...register("source")} type="hidden" />
      <input {...register("locale")} type="hidden" />

      <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-4">
        [ Yêu cầu tư vấn dịch vụ{serviceName ? ` · ${serviceName}` : ""} ]
      </div>

      <div className="space-y-4">
        <Field label="Họ & tên *" error={errors.name?.message}>
          <input {...register("name")} type="text" placeholder="Nguyễn Văn A" className={inputCls(!!errors.name)} />
        </Field>

        <Field label="Công ty" error={errors.company?.message}>
          <input {...register("company")} type="text" placeholder="Công ty TNHH ABC" className={inputCls(!!errors.company)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Email *" error={errors.email?.message}>
            <input {...register("email")} type="email" placeholder="name@company.vn" className={inputCls(!!errors.email)} />
          </Field>
          <Field label="Điện thoại *" error={errors.phone?.message}>
            <input {...register("phone")} type="tel" placeholder="+84 28 3636 1234" className={inputCls(!!errors.phone)} />
          </Field>
        </div>

        <Field label="Nội dung" error={errors.message?.message}>
          <textarea
            {...register("message")}
            rows={4}
            placeholder="Mô tả yêu cầu, quy mô, thời gian mong muốn…"
            className={`${inputCls(!!errors.message)} resize-none`}
          />
        </Field>

        <p className="text-sm text-[#5a5650] border border-line bg-paper px-4 py-3 leading-[1.6]">
          Đang chuyển sang hệ thống CRM mới — vui lòng email trực tiếp{" "}
          <a href="mailto:sales@qstechnology.vn" className="text-gold-1 underline">sales@qstechnology.vn</a>.
        </p>

        <button
          type="submit"
          disabled
          className="qs-btn qs-btn-gold w-full justify-center disabled:opacity-60"
        >
          Gửi yêu cầu →
        </button>
      </div>
    </form>
  );
}

function inputCls(hasError: boolean) {
  return `w-full border ${hasError ? "border-red-400" : "border-line"} bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors`;
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
