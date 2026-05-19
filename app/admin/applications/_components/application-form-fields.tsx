"use client";

import { useState } from "react";
import type { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import type { ApplicationFormValues } from "@/lib/validation/application-schema";
import { DeploymentCard } from "./deployment-card";

type Props = {
  form: UseFormReturn<ApplicationFormValues>;
  workflowArray: UseFieldArrayReturn<ApplicationFormValues, "workflow">;
  specsArray: UseFieldArrayReturn<ApplicationFormValues, "specs">;
  deploymentsArray: UseFieldArrayReturn<ApplicationFormValues, "deployments">;
  onSubmit: (data: ApplicationFormValues) => Promise<void>;
  serverError: string | null;
  submitLabel: string;
  cancelHref: string;
  slugEditable: boolean;
};

export function ApplicationFormFields({
  form,
  workflowArray,
  specsArray,
  deploymentsArray,
  onSubmit,
  serverError,
  submitLabel,
  cancelHref,
  slugEditable,
}: Props) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {serverError && (
        <div className="border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-sm">
          {serverError}
        </div>
      )}

      {/* Core fields */}
      <section className="border border-line bg-white p-4 space-y-3">
        <h2 className="font-medium text-sm border-b border-line pb-2">Thông tin cơ bản</h2>

        <label className="block">
          <span className="text-xs text-muted">Slug *</span>
          <input
            {...register("slug")}
            disabled={!slugEditable}
            className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink disabled:bg-paper-2"
            placeholder="ten-ung-dung"
          />
          {errors.slug && <span className="text-xs text-red-600">{errors.slug.message}</span>}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-muted">Tiêu đề (VI) *</span>
            <input {...register("title.vi")} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            {errors.title?.vi && <span className="text-xs text-red-600">{errors.title.vi.message}</span>}
          </label>
          <label className="block">
            <span className="text-xs text-muted">Tiêu đề (EN)</span>
            <input {...register("title.en")} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-muted">Tóm tắt (VI) *</span>
            <textarea {...register("summary.vi")} rows={3} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            {errors.summary?.vi && <span className="text-xs text-red-600">{errors.summary.vi.message}</span>}
          </label>
          <label className="block">
            <span className="text-xs text-muted">Tóm tắt (EN)</span>
            <textarea {...register("summary.en")} rows={3} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-muted">Ảnh hero (URL)</span>
          <input {...register("heroImage")} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink" placeholder="https://..." />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-muted">Trạng thái</span>
            <select {...register("status")} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink bg-white">
              <option value="draft">Nháp</option>
              <option value="published">Đã xuất bản</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-muted">Thứ tự</span>
            <input type="number" {...register("sort")} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
          </label>
        </div>
      </section>

      {/* Workflow */}
      <section className="border border-line bg-white p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <h2 className="font-medium text-sm">Quy trình ứng dụng</h2>
          <button
            type="button"
            onClick={() => workflowArray.append({ n: String(workflowArray.fields.length + 1), label: { vi: "" }, title: { vi: "" }, desc: { vi: "" } })}
            className="text-xs px-2 py-1 border border-line hover:bg-paper-2"
          >
            + Thêm bước
          </button>
        </div>
        {workflowArray.fields.map((field, idx) => (
          <WorkflowStepCard
            key={field.id}
            index={idx}
            register={register}
            label={`Bước #${idx + 1}: ${watch(`workflow.${idx}.title.vi`) || "..."}`}
            onRemove={() => workflowArray.remove(idx)}
          />
        ))}
        {workflowArray.fields.length === 0 && <p className="text-xs text-muted">Chưa có bước nào.</p>}
      </section>

      {/* Specs */}
      <section className="border border-line bg-white p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <h2 className="font-medium text-sm">Thông số kỹ thuật</h2>
          <button
            type="button"
            onClick={() => specsArray.append({ label: { vi: "" }, value: { vi: "" } })}
            className="text-xs px-2 py-1 border border-line hover:bg-paper-2"
          >
            + Thêm thông số
          </button>
        </div>
        {specsArray.fields.map((field, idx) => (
          <SpecRow key={field.id} index={idx} register={register} onRemove={() => specsArray.remove(idx)} />
        ))}
        {specsArray.fields.length === 0 && <p className="text-xs text-muted">Chưa có thông số nào.</p>}
      </section>

      {/* Deployments */}
      <section className="border border-line bg-white p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <h2 className="font-medium text-sm">Triển khai thực tế</h2>
          <button
            type="button"
            onClick={() => deploymentsArray.append({ name: "", loc: { vi: "" } })}
            className="text-xs px-2 py-1 border border-line hover:bg-paper-2"
          >
            + Thêm triển khai
          </button>
        </div>
        {deploymentsArray.fields.map((field, idx) => (
          <DeploymentCard
            key={field.id}
            index={idx}
            register={register}
            errors={errors}
            label={watch(`deployments.${idx}.name`) || `Triển khai #${idx + 1}`}
            onRemove={() => deploymentsArray.remove(idx)}
          />
        ))}
        {deploymentsArray.fields.length === 0 && <p className="text-xs text-muted">Chưa có triển khai nào.</p>}
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-ink text-paper text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Đang lưu..." : submitLabel}
        </button>
        <a href={cancelHref} className="px-5 py-2 border border-line text-sm hover:bg-paper-2">
          Huỷ
        </a>
      </div>
    </form>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

type RegisterFn = UseFormReturn<ApplicationFormValues>["register"];

function WorkflowStepCard({
  index,
  register,
  label,
  onRemove,
}: {
  index: number;
  register: RegisterFn;
  label: string;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-line">
      <div className="flex items-center justify-between px-3 py-2 bg-paper-2 border-b border-line">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex-1 text-left text-sm font-medium">
          {open ? "▾" : "▸"} {label}
        </button>
        <button type="button" onClick={onRemove} className="text-xs text-red-600 hover:underline ml-3">Xoá</button>
      </div>
      {open && (
        <div className="p-3 grid gap-2">
          <label className="block">
            <span className="text-xs text-muted">Số bước *</span>
            <input {...register(`workflow.${index}.n`)} className="mt-1 w-24 border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink" placeholder="1" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-xs text-muted">Nhãn (VI) *</span>
              <input {...register(`workflow.${index}.label.vi`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
            <label className="block"><span className="text-xs text-muted">Nhãn (EN)</span>
              <input {...register(`workflow.${index}.label.en`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-xs text-muted">Tiêu đề (VI) *</span>
              <input {...register(`workflow.${index}.title.vi`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
            <label className="block"><span className="text-xs text-muted">Tiêu đề (EN)</span>
              <input {...register(`workflow.${index}.title.en`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-xs text-muted">Mô tả (VI) *</span>
              <textarea {...register(`workflow.${index}.desc.vi`)} rows={2} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
            <label className="block"><span className="text-xs text-muted">Mô tả (EN)</span>
              <textarea {...register(`workflow.${index}.desc.en`)} rows={2} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
          </div>
        </div>
      )}
    </div>
  );
}

function SpecRow({
  index,
  register,
  onRemove,
}: {
  index: number;
  register: RegisterFn;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
      <label className="block">
        <span className="text-xs text-muted">Tên thông số (VI) *</span>
        <input {...register(`specs.${index}.label.vi`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" placeholder="Độ phân giải" />
      </label>
      <label className="block">
        <span className="text-xs text-muted">Giá trị (VI) *</span>
        <input {...register(`specs.${index}.value.vi`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" placeholder="1920×1080" />
      </label>
      <button type="button" onClick={onRemove} className="mb-0.5 text-xs text-red-600 hover:underline">Xoá</button>
    </div>
  );
}
