"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  locale?: string;
}

export function DatasheetRequestForm({ datasheetSlug, datasheetName, locale = "vi" }: Props) {
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

  // Lead capture is temporarily closed during the CRM migration; datasheet
  // downloads stay gated until the CRM endpoint lands. Submission is a no-op.
  function onSubmit() {
    /* disabled — see CRM migration notice below */
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
      {/* Honeypot */}
      <input {...register("honeypot")} type="text" tabIndex={-1} aria-hidden="true" style={{ display: "none" }} />
      <input {...register("datasheetSlug")} type="hidden" />
      <input {...register("locale")} type="hidden" />

      <p className="text-[12px] text-muted m-0">
        Tải <strong className="text-ink">{datasheetName}</strong>
      </p>

      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <input
            {...register("email")}
            type="email"
            placeholder="email@company.vn"
            disabled
            className={`w-full border ${errors.email ? "border-red-400" : "border-line"} bg-paper px-3 py-2 text-sm focus:outline-none focus:border-ink transition-colors disabled:opacity-60`}
          />
          {errors.email && (
            <p className="mt-0.5 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled
          className="inline-flex items-center h-9 border border-ink bg-ink text-white px-4 font-mono text-[11px] tracking-[.14em] uppercase hover:bg-gold-3 hover:border-gold-3 disabled:opacity-50 whitespace-nowrap"
        >
          Tải ↓
        </button>
      </div>

      <p className="text-[11px] text-muted leading-relaxed">
        Đang chuyển sang hệ thống CRM mới — vui lòng email{" "}
        <a href="mailto:sales@qstechnology.vn" className="text-gold-1 underline">sales@qstechnology.vn</a>{" "}
        để nhận tài liệu.
      </p>
    </form>
  );
}
