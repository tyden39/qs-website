"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import type { UseFormReturn } from "react-hook-form";
import type { ProductSchema, ProductFormInput } from "@/lib/validation/product-schema";

type ImageEntry = { url: string; alt: { vi: string; en: string } };
type UploadingFile = { name: string; progress: number; error?: string };

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<ProductFormInput, any, ProductSchema>;
};

export function ImageUploader({ form }: Props) {
  const { watch, setValue } = form;
  const images: ImageEntry[] = watch("images") ?? [];
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const valid: File[] = [];
    for (const file of Array.from(files)) {
      if (file.type === "image/svg+xml") {
        alert(`SVG not allowed: ${file.name}`);
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`File type not allowed: ${file.name} (${file.type})`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;

    setUploading(valid.map((f) => ({ name: f.name, progress: 0 })));

    const results: ImageEntry[] = [];
    for (let i = 0; i < valid.length; i++) {
      const file = valid[i];
      try {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: file.type,
          onUploadProgress: ({ percentage }) => {
            setUploading((prev) =>
              prev.map((u, idx) =>
                idx === i ? { ...u, progress: percentage } : u,
              ),
            );
          },
        });
        results.push({ url: blob.url, alt: { vi: "", en: "" } });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setUploading((prev) =>
          prev.map((u, idx) => (idx === i ? { ...u, error: msg } : u)),
        );
      }
    }

    setValue("images", [...images, ...results], { shouldDirty: true });
    setUploading([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(idx: number) {
    setValue(
      "images",
      images.filter((_, i) => i !== idx),
      { shouldDirty: true },
    );
  }

  function updateAlt(idx: number, lang: "vi" | "en", value: string) {
    const next = images.map((img, i) =>
      i === idx ? { ...img, alt: { ...img.alt, [lang]: value } } : img,
    );
    setValue("images", next, { shouldDirty: true });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-3 py-1.5 text-sm border border-line rounded bg-white hover:bg-paper-2 transition-colors"
        >
          Chọn ảnh
        </button>
        <span className="text-xs text-muted">PNG, JPEG, WebP — tối đa 50 MB mỗi ảnh</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploading.length > 0 && (
        <ul className="space-y-1">
          {uploading.map((u) => (
            <li key={u.name} className="text-sm text-muted flex items-center gap-2">
              <span className="truncate max-w-[200px]">{u.name}</span>
              {u.error ? (
                <span className="text-red-600">{u.error}</span>
              ) : (
                <span>{u.progress}%</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {images.length > 0 && (
        <ul className="space-y-4">
          {images.map((img, idx) => (
            <li
              key={img.url}
              className="flex gap-4 p-3 border border-line rounded bg-white"
            >
              {/* thumbnail */}
              <div className="shrink-0 w-20 h-20 bg-paper-2 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt.vi || "product image"}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* alt text fields */}
              <div className="flex-1 space-y-2">
                <div>
                  <label className="block text-xs font-medium text-muted mb-0.5">
                    Alt text (VI) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={img.alt.vi}
                    onChange={(e) => updateAlt(idx, "vi", e.target.value)}
                    placeholder="Mô tả hình ảnh bằng tiếng Việt"
                    className="w-full border border-line rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-0.5">
                    Alt text (EN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={img.alt.en}
                    onChange={(e) => updateAlt(idx, "en", e.target.value)}
                    placeholder="Image description in English"
                    className="w-full border border-line rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="shrink-0 text-xs text-red-600 hover:text-red-800 self-start mt-1"
                aria-label="Remove image"
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
