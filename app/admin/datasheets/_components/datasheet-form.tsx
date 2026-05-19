"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { datasheetInput } from "@/lib/validation/datasheet-schema";

// Use the Zod output type (with defaults resolved) so useForm<> types align with
// zodResolver's resolved output type and avoid the Resolver<> mismatch from .default().
type DatasheetFormValues = {
  slug: string;
  name: { vi: string; en?: string };
  fileUrl: string;
  productSlug?: string | null;
  category: string;
  series: string;
  lang: "vi" | "en" | "both";
  ext: string;
  version?: string | null;
  sizeBytes: number;
  status: "draft" | "published";
  sort: number;
};

interface Props {
  defaultValues?: Partial<DatasheetFormValues>;
  onSubmit: (data: DatasheetFormValues) => Promise<void>;
  submitLabel?: string;
}

const CATEGORIES = ["Datasheet", "Catalogue", "Manual", "Firmware", "CAD"];
const SERIES = ["F-series", "Astro-series", "Servo & Drive", "Accessories", "Other"];

export function DatasheetForm({ defaultValues, onSubmit, submitLabel = "Lưu" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DatasheetFormValues>({
    resolver: zodResolver(datasheetInput) as never,
    defaultValues: {
      lang: "vi",
      status: "draft",
      ext: "pdf",
      sizeBytes: 0,
      sort: 0,
      ...defaultValues,
    },
  });

  const fileUrl = watch("fileUrl");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadError("Chỉ chấp nhận file PDF.");
      return;
    }
    setUploadError("");
    setUploading(true);
    try {
      // Client-direct upload via Vercel Blob — bypasses 1MB Server Action limit
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        contentType: "application/pdf",
      });
      setValue("fileUrl", blob.url, { shouldValidate: true });
      setValue("sizeBytes", file.size, { shouldValidate: true });
      setValue("ext", "pdf");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload thất bại.");
    } finally {
      setUploading(false);
    }
  }

  async function handleFormSubmit(data: DatasheetFormValues) {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-2xl">
      {/* Slug */}
      <Field label="Slug *" error={errors.slug?.message}>
        <input {...register("slug")} placeholder="f54-datasheet-vi" className={inputCls(!!errors.slug)} />
        <p className="mt-1 text-xs text-muted">Chỉ dùng chữ thường, số và dấu gạch ngang.</p>
      </Field>

      {/* Name VI */}
      <Field label="Tên tài liệu (VI) *" error={errors.name?.vi?.message}>
        <input {...register("name.vi")} placeholder="F54 — Datasheet kỹ thuật" className={inputCls(!!errors.name?.vi)} />
      </Field>

      {/* Name EN */}
      <Field label="Tên tài liệu (EN)" error={errors.name?.en?.message}>
        <input {...register("name.en")} placeholder="F54 — Technical Datasheet" className={inputCls(!!errors.name?.en)} />
      </Field>

      {/* PDF Upload */}
      <div>
        <label className="block font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-1.5">
          File PDF *
        </label>
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-ink file:mr-4 file:border file:border-line file:bg-paper file:px-4 file:py-2 file:font-mono file:text-[11px] file:tracking-[.12em] file:uppercase file:cursor-pointer hover:file:bg-ink hover:file:text-white hover:file:border-ink transition-colors"
        />
        {uploading && <p className="mt-1 text-xs text-gold-1">Đang upload…</p>}
        {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
        {fileUrl && !uploading && (
          <p className="mt-1 text-xs text-green-700 truncate">
            ✓ {fileUrl}
          </p>
        )}
        {/* Hidden field to hold the blob URL */}
        <input {...register("fileUrl")} type="hidden" />
        {errors.fileUrl && <p className="mt-1 text-xs text-red-500">{errors.fileUrl.message}</p>}
        <input {...register("sizeBytes", { valueAsNumber: true })} type="hidden" />
        <input {...register("ext")} type="hidden" />
      </div>

      {/* Product slug */}
      <Field label="Product Slug (FK)" error={errors.productSlug?.message}>
        <input {...register("productSlug")} placeholder="f54 (để trống nếu không liên kết)" className={inputCls(!!errors.productSlug)} />
      </Field>

      {/* Category + Series row */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Danh mục *" error={errors.category?.message}>
          <select {...register("category")} className={inputCls(!!errors.category)}>
            <option value="">— Chọn —</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Dòng sản phẩm *" error={errors.series?.message}>
          <select {...register("series")} className={inputCls(!!errors.series)}>
            <option value="">— Chọn —</option>
            {SERIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      {/* Lang */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-2">Ngôn ngữ *</legend>
        <div className="flex gap-4">
          {([["vi", "Tiếng Việt"], ["en", "English"], ["both", "VN + EN"]] as const).map(([val, lbl]) => (
            <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
              <input {...register("lang")} type="radio" value={val} className="accent-ink" />
              {lbl}
            </label>
          ))}
        </div>
        {errors.lang && <p className="mt-1 text-xs text-red-500">{errors.lang.message}</p>}
      </fieldset>

      {/* Version + Sort row */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Phiên bản" error={errors.version?.message}>
          <input {...register("version")} placeholder="v2.4" className={inputCls(!!errors.version)} />
        </Field>
        <Field label="Thứ tự (sort)" error={errors.sort?.message}>
          <input {...register("sort", { valueAsNumber: true })} type="number" min={0} className={inputCls(!!errors.sort)} />
        </Field>
      </div>

      {/* Status */}
      <Field label="Trạng thái" error={errors.status?.message}>
        <select {...register("status")} className={inputCls(!!errors.status)}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </Field>

      {submitError && (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-4 py-3">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || uploading}
        className="qs-btn qs-btn-gold disabled:opacity-60"
      >
        {isSubmitting ? "Đang lưu…" : submitLabel}
      </button>
    </form>
  );
}

function inputCls(hasError: boolean) {
  return `w-full border ${hasError ? "border-red-400" : "border-line"} bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-ink transition-colors`;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
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
