"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";

// Flat schema avoids .default() issues with react-hook-form Resolver types
const contactSchema = z.object({
  source: z.literal("contact"),
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z.email("Email không hợp lệ"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại").max(40),
  company: z.string().max(120).optional(),
  message: z.string().max(2000).optional(),
  locale: z.enum(["vi", "en"]),
  honeypot: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm({ locale = "vi" }: { locale?: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { source: "contact" as const, locale: locale as "vi" | "en", honeypot: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Gửi thất bại");
      }
      setStatus("success");
      reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white border border-line p-6 sm:p-8">
        <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-3">
          [ Gửi thành công ]
        </div>
        <h3 className="font-display font-semibold text-xl tracking-[-.005em] m-0 mb-3">
          Cảm ơn bạn đã liên hệ!
        </h3>
        <p className="text-sm text-[#3a3a3a] leading-[1.7] m-0">
          Đội QS sẽ phản hồi trong vòng 4 giờ làm việc (8:00–17:30, T2–T6).
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-5 font-mono text-[11px] tracking-[.14em] uppercase text-gold-1 underline underline-offset-2"
        >
          Gửi yêu cầu khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-line p-6 sm:p-8" noValidate>
      {/* Honeypot — hidden from humans, bots fill it */}
      <input {...register("honeypot")} type="text" tabIndex={-1} aria-hidden="true" style={{ display: "none" }} />
      <input {...register("source")} type="hidden" />
      <input {...register("locale")} type="hidden" />

      <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-5">
        [ 02 · Form liên hệ ]
      </div>
      <h3 className="font-display font-semibold text-xl tracking-[-.005em] m-0 mb-6">
        Yêu cầu báo giá &amp; tư vấn
      </h3>

      <div className="space-y-5">
        <FormField label="Họ & tên *" error={errors.name?.message}>
          <input
            {...register("name")}
            type="text"
            placeholder="Nguyễn Văn A"
            className={inputCls(!!errors.name)}
          />
        </FormField>

        <FormField label="Công ty" error={errors.company?.message}>
          <input
            {...register("company")}
            type="text"
            placeholder="Công ty TNHH ABC"
            className={inputCls(!!errors.company)}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
          <FormField label="Email *" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              placeholder="name@company.vn"
              className={inputCls(!!errors.email)}
            />
          </FormField>
          <FormField label="Điện thoại *" error={errors.phone?.message}>
            <input
              {...register("phone")}
              type="tel"
              placeholder="+84 28 3636 1234"
              className={inputCls(!!errors.phone)}
            />
          </FormField>
        </div>

        <FormField label="Nội dung yêu cầu" error={errors.message?.message}>
          <textarea
            {...register("message")}
            rows={5}
            placeholder="Mô tả nhu cầu, loại máy, số trục, sản phẩm quan tâm…"
            className={`${inputCls(!!errors.message)} resize-none`}
          />
        </FormField>

        {status === "error" && (
          <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-4 py-3">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="qs-btn qs-btn-gold w-full justify-center mt-2 disabled:opacity-60"
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
