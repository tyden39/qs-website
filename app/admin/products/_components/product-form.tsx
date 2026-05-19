"use client";

import { useEffect, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  productSchema,
  type ProductSchema,
  type ProductFormInput,
} from "@/lib/validation/product-schema";
import { createProduct, updateProduct } from "@/app/admin/_actions/products";
import { ImageUploader } from "./image-uploader";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  defaultValues?: Partial<ProductFormInput> & { id?: string };
};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const SERIES_OPTIONS = ["F", "Astro", "Other"];
const STATUS_OPTIONS = [
  { value: "draft", label: "Bản nháp" },
  { value: "published", label: "Xuất bản" },
  { value: "archived", label: "Lưu trữ" },
];

export function ProductForm({ mode, defaultValues }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProductFormInput, unknown, ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      slug: "",
      series: "",
      axes: "",
      display: "",
      badge: "",
      tag: { vi: "", en: "" },
      name: { vi: "", en: "" },
      desc: { vi: "", en: "" },
      bullets: [],
      specs: [],
      images: [],
      status: "draft",
      sort: 0,
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isDirty },
  } = form;

  const nameVi = watch("name.vi");
  const slugValue = watch("slug");

  // Auto-generate slug from name.vi only in create mode and when slug untouched
  useEffect(() => {
    if (mode !== "create") return;
    if (!nameVi) return;
    const auto = slugify(nameVi);
    // Only auto-set if the current slug looks auto-generated (matches what we'd produce)
    if (!slugValue || slugValue === slugify(slugValue)) {
      setValue("slug", auto, { shouldDirty: false });
    }
  }, [nameVi, mode, setValue, slugValue]);

  const {
    fields: bulletFields,
    append: appendBullet,
    remove: removeBullet,
  } = useFieldArray({ control, name: "bullets" });

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({ control, name: "specs" });

  function onSubmit(data: ProductSchema): void {
    startTransition(async () => {
      let result:
        | { ok: true; slug: string }
        | { ok: false; error: string };

      if (mode === "edit" && defaultValues?.id) {
        result = await updateProduct({ ...data, id: defaultValues.id });
      } else {
        result = await createProduct(data);
      }

      if (!result.ok) {
        if (result.error === "Slug already taken") {
          form.setError("slug", {
            message: "Slug này đã được sử dụng. Vui lòng chọn slug khác.",
          });
        } else {
          form.setError("root", { message: result.error });
        }
        return;
      }

      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      {errors.root && (
        <div className="rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {errors.root.message}
        </div>
      )}

      {/* ── Core fields ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Thông tin cơ bản
        </h2>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Slug (URL) <span className="text-red-500">*</span>
          </label>
          <input
            {...register("slug")}
            type="text"
            placeholder="vd: f-86-pro"
            className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="text-xs text-muted mt-0.5">
            Tự động tạo từ tên VI. Chỉ chứa chữ thường, số, gạch ngang.
          </p>
          {errors.slug && (
            <p className="text-xs text-red-600 mt-0.5">{errors.slug.message}</p>
          )}
        </div>

        {/* Series + Axes + Display row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Dòng sản phẩm <span className="text-red-500">*</span>
            </label>
            <select
              {...register("series")}
              className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            >
              <option value="">-- Chọn --</option>
              {SERIES_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.series && (
              <p className="text-xs text-red-600 mt-0.5">{errors.series.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Số trục <span className="text-red-500">*</span>
            </label>
            <input
              {...register("axes")}
              type="text"
              placeholder="VD: 3, 4, 5"
              className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.axes && (
              <p className="text-xs text-red-600 mt-0.5">{errors.axes.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Màn hình <span className="text-red-500">*</span>
            </label>
            <input
              {...register("display")}
              type="text"
              placeholder="VD: 10.1 inch"
              className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.display && (
              <p className="text-xs text-red-600 mt-0.5">{errors.display.message}</p>
            )}
          </div>
        </div>

        {/* Badge + Sort */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nhãn (badge)</label>
            <input
              {...register("badge")}
              type="text"
              placeholder="VD: Mới, Hot..."
              className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Thứ tự sắp xếp</label>
            <input
              {...register("sort", { valueAsNumber: true })}
              type="number"
              className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <select
            {...register("status")}
            className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ── Bilingual fields ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Nội dung song ngữ
        </h2>

        {/* Language tabs implemented as a simple visual split */}
        <div className="border border-line rounded overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-line">
            {/* VI column */}
            <div className="p-4 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                Tiếng Việt (bắt buộc)
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tag phân loại <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("tag.vi")}
                  type="text"
                  placeholder="VD: Máy CNC 3 trục"
                  className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {errors.tag?.vi && (
                  <p className="text-xs text-red-600 mt-0.5">{errors.tag.vi.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name.vi")}
                  type="text"
                  placeholder="Tên sản phẩm"
                  className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {errors.name?.vi && (
                  <p className="text-xs text-red-600 mt-0.5">{errors.name.vi.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  {...register("desc.vi")}
                  rows={3}
                  placeholder="Mô tả ngắn về sản phẩm..."
                  className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                />
              </div>
            </div>

            {/* EN column */}
            <div className="p-4 space-y-4 bg-paper-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                English (không bắt buộc)
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tag</label>
                <input
                  {...register("tag.en")}
                  type="text"
                  placeholder="e.g. 3-axis CNC machine"
                  className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Product name</label>
                <input
                  {...register("name.en")}
                  type="text"
                  placeholder="Product name"
                  className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  {...register("desc.en")}
                  rows={3}
                  placeholder="Short product description..."
                  className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bullets ──────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Điểm nổi bật
        </h2>

        {bulletFields.map((field, idx) => (
          <div key={field.id} className="border border-line rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted">#{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeBullet(idx)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Xóa
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-0.5">
                  VI <span className="text-red-500">*</span>
                </label>
                <input
                  {...register(`bullets.${idx}.vi`)}
                  type="text"
                  placeholder="Điểm nổi bật..."
                  className="w-full border border-line rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {errors.bullets?.[idx]?.vi && (
                  <p className="text-xs text-red-600 mt-0.5">
                    {errors.bullets[idx].vi?.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium mb-0.5">EN</label>
                <input
                  {...register(`bullets.${idx}.en`)}
                  type="text"
                  placeholder="Feature highlight..."
                  className="w-full border border-line rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => appendBullet({ vi: "", en: "" })}
          className="text-sm text-primary hover:underline"
        >
          + Thêm điểm nổi bật
        </button>
      </section>

      {/* ── Specs ────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Thông số kỹ thuật
        </h2>

        {specFields.map((field, idx) => (
          <div key={field.id} className="flex gap-3 items-start">
            <div className="flex-1">
              <input
                {...register(`specs.${idx}.l`)}
                type="text"
                placeholder="Tên thông số (VD: Hành trình X)"
                className="w-full border border-line rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.specs?.[idx]?.l && (
                <p className="text-xs text-red-600 mt-0.5">
                  {errors.specs[idx].l?.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <input
                {...register(`specs.${idx}.v`)}
                type="text"
                placeholder="Giá trị (VD: 600 mm)"
                className="w-full border border-line rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.specs?.[idx]?.v && (
                <p className="text-xs text-red-600 mt-0.5">
                  {errors.specs[idx].v?.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeSpec(idx)}
              className="shrink-0 text-xs text-red-600 hover:text-red-800 mt-2"
            >
              Xóa
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => appendSpec({ l: "", v: "" })}
          className="text-sm text-primary hover:underline"
        >
          + Thêm thông số
        </button>
      </section>

      {/* ── Images ───────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Hình ảnh
        </h2>
        <ImageUploader form={form} />
        {errors.images && (
          <p className="text-xs text-red-600">{errors.images.message}</p>
        )}
      </section>

      {/* ── Submit ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 border-t border-line">
        <button
          type="submit"
          disabled={isPending || !isDirty}
          className="px-5 py-2 bg-primary text-white text-sm rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Đang lưu..." : "Lưu"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-4 py-2 text-sm border border-line rounded hover:bg-paper-2 transition-colors"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
