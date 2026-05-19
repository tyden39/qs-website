"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";

// Flat schema without .default() to avoid Resolver<> type mismatch
const datasheetRequestSchema = z.object({
  email: z.email("Email không hợp lệ"),
  name: z.string().min(1).max(120).optional(),
  company: z.string().max(120).optional(),
  datasheetSlug: z.string().min(1),
  locale: z.enum(["vi", "en"]),
  honeypot: z.string().optional(),
});
type DatasheetRequestInput = z.infer<typeof datasheetRequestSchema>;

interface Props {
  datasheetSlug: string;
  datasheetName: string;
  fileUrl: string;
  locale?: string;
}

export function DatasheetRequestForm({ datasheetSlug, datasheetName, fileUrl, locale = "vi" }: Props) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatasheetRequestInput>({
    resolver: zodResolver(datasheetRequestSchema),
    defaultValues: {
      datasheetSlug,
      locale: locale as "vi" | "en",
      honeypot: "",
    },
  });

  async function onSubmit(values: DatasheetRequestInput) {
    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "datasheet",
          email: values.email,
          name: values.name,
          company: values.company,
          locale: values.locale,
          honeypot: values.honeypot,
          payload: { datasheet_slug: datasheetSlug, datasheet_name: datasheetName },
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      // Trigger download after successful lead capture
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-paper border border-line p-5 text-center">
        <p className="text-sm text-[#3a3a3a] m-0">
          Cảm ơn! File đang tải xuống.{" "}
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-gold-1 underline">
            Nhấn đây nếu không tự động
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
      {/* Honeypot */}
      <input {...register("honeypot")} type="text" tabIndex={-1} aria-hidden="true" style={{ display: "none" }} />
      <input {...register("datasheetSlug")} type="hidden" />
      <input {...register("locale")} type="hidden" />

      <p className="text-[12px] text-muted m-0">
        Nhập email để tải <strong className="text-ink">{datasheetName}</strong>
      </p>

      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <input
            {...register("email")}
            type="email"
            placeholder="email@company.vn"
            className={`w-full border ${errors.email ? "border-red-400" : "border-line"} bg-white px-3 py-2 text-sm focus:outline-none focus:border-ink transition-colors`}
          />
          {errors.email && (
            <p className="mt-0.5 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center h-9 border border-ink bg-ink text-white px-4 font-mono text-[11px] tracking-[.14em] uppercase hover:bg-gold-3 hover:border-gold-3 disabled:opacity-50 whitespace-nowrap"
        >
          {status === "submitting" ? "…" : "Tải ↓"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-xs text-red-500">Có lỗi xảy ra. Vui lòng thử lại.</p>
      )}
    </form>
  );
}
