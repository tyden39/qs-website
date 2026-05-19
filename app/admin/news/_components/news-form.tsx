"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { upload } from "@vercel/blob/client";
import { newsInput, type NewsInput } from "@/lib/validation/news-schema";
import { createNews, updateNews } from "@/app/admin/_actions/news";
import { TagsInput } from "./tags-input";
import type { TiptapValue } from "@/components/tiptap-editor";
import type { JSONContent } from "@tiptap/react";

const TiptapEditor = dynamic(
  () => import("@/components/tiptap-editor").then((m) => m.TiptapEditor),
  { ssr: false, loading: () => <div className="h-60 border border-line bg-paper animate-pulse rounded" /> },
);

type Props = {
  mode: "create" | "edit";
  slug?: string;
  defaultValues?: Partial<NewsInput>;
  tagSuggestions: string[];
};

const DRAFT_KEY = (id: string) => `draft:news:${id}`;

const BASE_DEFAULTS: NewsInput = {
  slug: "",
  category: "",
  status: "draft",
  tags: [],
  title: { vi: "", en: "" },
  excerpt: { vi: "", en: "" },
  bodyHtml: { vi: "", en: "" },
  bodyJson: { vi: undefined, en: undefined },
  coverImage: null,
  publishedAt: null,
};

export function NewsForm({ mode, slug, defaultValues, tagSuggestions }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"vi" | "en">("vi");
  const [coverUploading, setCoverUploading] = useState(false);
  const prompted = useRef(false);

  const form = useForm<NewsInput>({
    // Cast required: @hookform/resolvers v5 + Zod 4 output types diverge when
    // .refine() is present; both types are structurally identical at runtime.
    resolver: zodResolver(newsInput) as unknown as Resolver<NewsInput>,
    defaultValues: { ...BASE_DEFAULTS, ...defaultValues },
  });

  const draftId = mode === "edit" && slug ? slug : "new";

  // Draft recovery on mount
  useEffect(() => {
    if (prompted.current) return;
    prompted.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY(draftId));
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<NewsInput>;
      if (confirm("Tìm thấy bản nháp chưa lưu. Khôi phục?")) {
        form.reset({ ...BASE_DEFAULTS, ...defaultValues, ...draft });
      } else {
        localStorage.removeItem(DRAFT_KEY(draftId));
      }
    } catch { /* ignore parse errors */ }
  // form.reset is stable; defaultValues is render-stable from server
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  // Auto-save draft with 1s debounce
  useEffect(() => {
    const sub = form.watch((values) => {
      const timer = setTimeout(() => {
        try { localStorage.setItem(DRAFT_KEY(draftId), JSON.stringify(values)); } catch { /* quota */ }
      }, 1000);
      return () => clearTimeout(timer);
    });
    return () => sub.unsubscribe();
  }, [form, draftId]);

  function onSubmit(data: NewsInput) {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createNews(data);
        } else {
          await updateNews(slug!, data);
        }
        localStorage.removeItem(DRAFT_KEY(draftId));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Lỗi không xác định");
      }
    });
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Chỉ chấp nhận PNG, JPEG, WebP"); return;
    }
    setCoverUploading(true);
    try {
      const blob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/upload" });
      form.setValue("coverImage", blob.url);
    } catch { setError("Upload ảnh bìa thất bại"); }
    finally { setCoverUploading(false); }
  }

  const tiptapChange = (locale: "vi" | "en") => (v: TiptapValue) => {
    form.setValue(`bodyHtml.${locale}`, v.html);
    form.setValue(`bodyJson.${locale}`, v.json ?? undefined);
  };

  const viHtml = form.watch("bodyHtml.vi") ?? "";
  const enHtml = form.watch("bodyHtml.en") ?? "";
  const viJson = form.watch("bodyJson.vi");
  const enJson = form.watch("bodyJson.en");
  const coverImage = form.watch("coverImage");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded">{error}</div>}

      {/* Slug + Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="qs-label">Slug *</label>
          <input {...form.register("slug")} className="qs-input" placeholder="ten-bai-viet" />
          {form.formState.errors.slug && <p className="qs-error">{form.formState.errors.slug.message}</p>}
        </div>
        <div>
          <label className="qs-label">Danh mục *</label>
          <input {...form.register("category")} className="qs-input" placeholder="Sản phẩm mới" />
          {form.formState.errors.category && <p className="qs-error">{form.formState.errors.category.message}</p>}
        </div>
      </div>

      {/* Bilingual tabs */}
      <div>
        <div className="flex border-b border-line mb-4">
          {(["vi", "en"] as const).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setActiveTab(loc)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-b-2 -mb-px transition-colors ${
                activeTab === loc ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {loc === "vi" ? "Tiếng Việt" : "English"}
            </button>
          ))}
        </div>

        {(["vi", "en"] as const).map((loc) => (
          <div key={loc} className={activeTab === loc ? "space-y-4" : "hidden"}>
            <div>
              <label className="qs-label">Tiêu đề {loc === "vi" ? "*" : "(EN)"}</label>
              <input {...form.register(`title.${loc}`)} className="qs-input" />
            </div>
            <div>
              <label className="qs-label">Tóm tắt {loc === "vi" ? "*" : "(EN)"}</label>
              <textarea {...form.register(`excerpt.${loc}`)} rows={3} className="qs-input resize-none" />
            </div>
            <div>
              <label className="qs-label">Nội dung {loc === "vi" ? "*" : "(EN)"}</label>
              <TiptapEditor
                value={{
                  html: loc === "vi" ? viHtml : (enHtml ?? ""),
                  json: (loc === "vi" ? viJson : enJson) as JSONContent | null,
                }}
                onChange={tiptapChange(loc)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Cover image */}
      <div>
        <label className="qs-label">Ảnh bìa</label>
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="Cover preview" className="mb-2 h-32 object-cover rounded border border-line" />
        )}
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleCoverUpload} className="text-sm" />
        {coverUploading && <p className="text-xs text-muted mt-1">Đang upload…</p>}
      </div>

      {/* Tags */}
      <div>
        <label className="qs-label">Tags</label>
        <Controller
          control={form.control}
          name="tags"
          render={({ field }) => (
            <TagsInput value={field.value} onChange={field.onChange} suggestions={tagSuggestions} />
          )}
        />
      </div>

      {/* Status + publishedAt */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="qs-label">Trạng thái</label>
          <select {...form.register("status")} className="qs-input">
            <option value="draft">Nháp</option>
            <option value="published">Đã đăng</option>
          </select>
        </div>
        <div>
          <label className="qs-label">Ngày đăng</label>
          <Controller
            control={form.control}
            name="publishedAt"
            render={({ field }) => (
              <input
                type="date"
                className="qs-input"
                value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
              />
            )}
          />
          {form.formState.errors.publishedAt && (
            <p className="qs-error">{form.formState.errors.publishedAt.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending} className="qs-btn qs-btn-primary">
          {pending ? "Đang lưu…" : mode === "create" ? "Tạo bài viết" : "Lưu thay đổi"}
        </button>
        <a href="/admin/news" className="qs-btn qs-btn-ghost">Hủy</a>
      </div>
    </form>
  );
}
