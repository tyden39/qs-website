"use client";

import { useState } from "react";
import type { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import type { ServiceFormValues } from "@/lib/validation/service-schema";
import { PricingTierCard } from "./pricing-tier-card";

type RegisterFn = UseFormReturn<ServiceFormValues>["register"];
type Errors = UseFormReturn<ServiceFormValues>["formState"]["errors"];

type Props = {
  form: UseFormReturn<ServiceFormValues>;
  processArray: UseFieldArrayReturn<ServiceFormValues, "process">;
  includedArray: UseFieldArrayReturn<ServiceFormValues, "included">;
  faqsArray: UseFieldArrayReturn<ServiceFormValues, "faqs">;
  tiersArray: UseFieldArrayReturn<ServiceFormValues, "tiers">;
  onSubmit: (data: ServiceFormValues) => Promise<void>;
  serverError: string | null;
  submitLabel: string;
  cancelHref: string;
  slugEditable: boolean;
};

export function ServiceFormFields({
  form,
  processArray,
  includedArray,
  faqsArray,
  tiersArray,
  onSubmit,
  serverError,
  submitLabel,
  cancelHref,
  slugEditable,
}: Props) {
  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {serverError && (
        <div className="border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-sm">{serverError}</div>
      )}

      <CoreSection register={register} errors={errors} slugEditable={slugEditable} />
      <HeroSection register={register} errors={errors} />

      {/* Process steps */}
      <section className="border border-line bg-white p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <h2 className="font-medium text-sm">Quy trình</h2>
          <button type="button"
            onClick={() => processArray.append({ num: processArray.fields.length + 1, day: { vi: "" }, title: { vi: "" }, desc: { vi: "" }, duration: { vi: "" } })}
            className="text-xs px-2 py-1 border border-line hover:bg-paper-2">+ Thêm bước</button>
        </div>
        {processArray.fields.map((f, idx) => (
          <ProcessStepCard key={f.id} index={idx} register={register}
            label={`Bước #${idx + 1}: ${watch(`process.${idx}.title.vi`) || "..."}`}
            onRemove={() => processArray.remove(idx)} />
        ))}
        {processArray.fields.length === 0 && <p className="text-xs text-muted">Chưa có bước nào.</p>}
      </section>

      {/* Included */}
      <section className="border border-line bg-white p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <h2 className="font-medium text-sm">Dịch vụ bao gồm</h2>
          <button type="button"
            onClick={() => includedArray.append({ has: true, name: { vi: "" }, note: { vi: "" }, tag: { vi: "" } })}
            className="text-xs px-2 py-1 border border-line hover:bg-paper-2">+ Thêm mục</button>
        </div>
        {includedArray.fields.map((f, idx) => (
          <IncludedRow key={f.id} index={idx} register={register} onRemove={() => includedArray.remove(idx)} />
        ))}
        {includedArray.fields.length === 0 && <p className="text-xs text-muted">Chưa có mục nào.</p>}
      </section>

      {/* FAQs */}
      <section className="border border-line bg-white p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <h2 className="font-medium text-sm">Câu hỏi thường gặp</h2>
          <button type="button"
            onClick={() => faqsArray.append({ q: { vi: "" }, a: { vi: "" } })}
            className="text-xs px-2 py-1 border border-line hover:bg-paper-2">+ Thêm câu hỏi</button>
        </div>
        {faqsArray.fields.map((f, idx) => (
          <FaqCard key={f.id} index={idx} register={register}
            label={`FAQ #${idx + 1}: ${watch(`faqs.${idx}.q.vi`) || "..."}`}
            onRemove={() => faqsArray.remove(idx)} />
        ))}
        {faqsArray.fields.length === 0 && <p className="text-xs text-muted">Chưa có câu hỏi nào.</p>}
      </section>

      {/* Pricing tiers */}
      <section className="border border-line bg-white p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <h2 className="font-medium text-sm">Bảng giá <span className="text-muted font-normal">(tối đa 3 gói)</span></h2>
          {tiersArray.fields.length < 3 && (
            <button type="button"
              onClick={() => tiersArray.append({ name: "", title: { vi: "" }, price: { vi: "" }, priceNote: { vi: "" }, features: [], cta: { vi: "" }, featured: false })}
              className="text-xs px-2 py-1 border border-line hover:bg-paper-2">+ Thêm gói</button>
          )}
        </div>
        {tiersArray.fields.map((f, idx) => (
          <PricingTierCard key={f.id} index={idx} control={control} register={register}
            label={`Gói #${idx + 1}: ${watch(`tiers.${idx}.name`) || "..."}`}
            onRemove={() => tiersArray.remove(idx)} />
        ))}
        {tiersArray.fields.length === 0 && <p className="text-xs text-muted">Chưa có gói giá nào.</p>}
        {errors.tiers?.root && <p className="text-xs text-red-600">{errors.tiers.root.message}</p>}
      </section>

      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting}
          className="px-5 py-2 bg-ink text-paper text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {isSubmitting ? "Đang lưu..." : submitLabel}
        </button>
        <a href={cancelHref} className="px-5 py-2 border border-line text-sm hover:bg-paper-2">Huỷ</a>
      </div>
    </form>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function CoreSection({ register, errors, slugEditable }: { register: RegisterFn; errors: Errors; slugEditable: boolean }) {
  return (
    <section className="border border-line bg-white p-4 space-y-3">
      <h2 className="font-medium text-sm border-b border-line pb-2">Thông tin cơ bản</h2>
      <label className="block">
        <span className="text-xs text-muted">Slug *</span>
        <input {...register("slug")} disabled={!slugEditable}
          className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink disabled:bg-paper-2" placeholder="ten-dich-vu" />
        {errors.slug && <span className="text-xs text-red-600">{errors.slug.message}</span>}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><span className="text-xs text-muted">Tiêu đề (VI) *</span>
          <input {...register("title.vi")} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" />
          {errors.title?.vi && <span className="text-xs text-red-600">{errors.title.vi.message}</span>}
        </label>
        <label className="block"><span className="text-xs text-muted">Tiêu đề (EN)</span>
          <input {...register("title.en")} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><span className="text-xs text-muted">Trạng thái</span>
          <select {...register("status")} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none bg-white">
            <option value="draft">Nháp</option>
            <option value="published">Đã xuất bản</option>
          </select>
        </label>
        <label className="block"><span className="text-xs text-muted">Thứ tự</span>
          <input type="number" {...register("sort")} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
      </div>
    </section>
  );
}

function HeroSection({ register, errors }: { register: RegisterFn; errors: Errors }) {
  return (
    <section className="border border-line bg-white p-4 space-y-3">
      <h2 className="font-medium text-sm border-b border-line pb-2">Hero section</h2>
      <div className="grid grid-cols-2 gap-2">
        <label className="block"><span className="text-xs text-muted">Tiêu đề hero (VI) *</span>
          <input {...register("hero.headline.vi")} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" />
          {errors.hero?.headline?.vi && <span className="text-xs text-red-600">{errors.hero.headline.vi.message}</span>}
        </label>
        <label className="block"><span className="text-xs text-muted">Tiêu đề hero (EN)</span>
          <input {...register("hero.headline.en")} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block"><span className="text-xs text-muted">Phụ đề (VI) *</span>
          <textarea {...register("hero.subhead.vi")} rows={2} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
        <label className="block"><span className="text-xs text-muted">Phụ đề (EN)</span>
          <textarea {...register("hero.subhead.en")} rows={2} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block"><span className="text-xs text-muted">CTA chính (VI)</span>
          <input {...register("hero.ctaPrimary.vi")} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
        <label className="block"><span className="text-xs text-muted">CTA chính (EN)</span>
          <input {...register("hero.ctaPrimary.en")} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block"><span className="text-xs text-muted">CTA phụ (VI)</span>
          <input {...register("hero.ctaSecondary.vi")} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
        <label className="block"><span className="text-xs text-muted">CTA phụ (EN)</span>
          <input {...register("hero.ctaSecondary.en")} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
      </div>
    </section>
  );
}

function ProcessStepCard({ index, register, label, onRemove }: { index: number; register: RegisterFn; label: string; onRemove: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-line">
      <div className="flex items-center justify-between px-3 py-2 bg-paper-2 border-b border-line">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex-1 text-left text-sm font-medium">{open ? "▾" : "▸"} {label}</button>
        <button type="button" onClick={onRemove} className="text-xs text-red-600 hover:underline ml-3">Xoá</button>
      </div>
      {open && (
        <div className="p-3 grid gap-2">
          <label className="block"><span className="text-xs text-muted">Số thứ tự *</span>
            <input type="number" {...register(`process.${index}.num`)} className="mt-1 w-20 border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-xs text-muted">Ngày (VI)</span>
              <input {...register(`process.${index}.day.vi`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
            <label className="block"><span className="text-xs text-muted">Ngày (EN)</span>
              <input {...register(`process.${index}.day.en`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-xs text-muted">Tiêu đề (VI) *</span>
              <input {...register(`process.${index}.title.vi`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
            <label className="block"><span className="text-xs text-muted">Tiêu đề (EN)</span>
              <input {...register(`process.${index}.title.en`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-xs text-muted">Mô tả (VI) *</span>
              <textarea {...register(`process.${index}.desc.vi`)} rows={2} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
            <label className="block"><span className="text-xs text-muted">Mô tả (EN)</span>
              <textarea {...register(`process.${index}.desc.en`)} rows={2} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-xs text-muted">Thời gian (VI)</span>
              <input {...register(`process.${index}.duration.vi`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
            <label className="block"><span className="text-xs text-muted">Thời gian (EN)</span>
              <input {...register(`process.${index}.duration.en`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
          </div>
        </div>
      )}
    </div>
  );
}

function IncludedRow({ index, register, onRemove }: { index: number; register: RegisterFn; onRemove: () => void }) {
  return (
    <div className="border border-line p-3 grid gap-2">
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
        <label className="block"><span className="text-xs text-muted">Tên (VI) *</span>
          <input {...register(`included.${index}.name.vi`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
        <label className="block"><span className="text-xs text-muted">Tên (EN)</span>
          <input {...register(`included.${index}.name.en`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
        <button type="button" onClick={onRemove} className="mb-0.5 text-xs text-red-600 hover:underline">Xoá</button>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register(`included.${index}.has`)} className="w-4 h-4" />
        <span className="text-xs">Có trong gói</span>
      </label>
    </div>
  );
}

function FaqCard({ index, register, label, onRemove }: { index: number; register: RegisterFn; label: string; onRemove: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-line">
      <div className="flex items-center justify-between px-3 py-2 bg-paper-2 border-b border-line">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex-1 text-left text-sm font-medium">{open ? "▾" : "▸"} {label}</button>
        <button type="button" onClick={onRemove} className="text-xs text-red-600 hover:underline ml-3">Xoá</button>
      </div>
      {open && (
        <div className="p-3 grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-xs text-muted">Câu hỏi (VI) *</span>
              <textarea {...register(`faqs.${index}.q.vi`)} rows={2} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
            <label className="block"><span className="text-xs text-muted">Câu hỏi (EN)</span>
              <textarea {...register(`faqs.${index}.q.en`)} rows={2} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-xs text-muted">Trả lời (VI) *</span>
              <textarea {...register(`faqs.${index}.a.vi`)} rows={3} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
            <label className="block"><span className="text-xs text-muted">Trả lời (EN)</span>
              <textarea {...register(`faqs.${index}.a.en`)} rows={3} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
          </div>
        </div>
      )}
    </div>
  );
}
