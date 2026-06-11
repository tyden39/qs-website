"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Flat schema without .default() to avoid Resolver<> type mismatch
const newsletterSchema = z.object({
  email: z.email("Email không hợp lệ"),
  locale: z.enum(["vi", "en"]),
  honeypot: z.string().optional(),
});
type NewsletterInput = z.infer<typeof newsletterSchema>;

export function NewsletterForm({ locale = "vi" }: { locale?: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { locale: locale as "vi" | "en", honeypot: "" },
  });

  // Lead capture is temporarily closed during the CRM migration.
  function onSubmit() {
    /* disabled — see CRM migration notice below */
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
          placeholder="email@company.vn"
          className={`flex-1 border ${errors.email ? "border-red-400" : "border-[#2a2a2a]"} bg-transparent px-4 py-2.5 text-[13px] text-[#cfc9b8] placeholder:text-[#5a5650] focus:outline-none focus:border-gold-1 transition-colors`}
        />
        <button
          type="submit"
          disabled
          className="border border-l-0 border-[#2a2a2a] px-4 py-2.5 font-mono text-[10px] tracking-[.14em] uppercase text-[#cfc9b8] hover:border-gold-1 hover:text-gold-2 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          Đăng ký →
        </button>
      </div>

      {errors.email && (
        <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
      )}
      <p className="mt-2 text-[11px] text-[#8a857c] leading-relaxed">
        Đang chuyển sang hệ thống CRM mới — vui lòng email{" "}
        <a href="mailto:sales@qstechnology.vn" className="text-gold-2 underline">sales@qstechnology.vn</a>.
      </p>
    </form>
  );
}
