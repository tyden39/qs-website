import { notFound } from "next/navigation";
import Link from "next/link";
import { getNewsByIdForAdmin } from "@/lib/data/news";
import { getTagSuggestions } from "@/app/admin/_actions/news";
import { NewsForm } from "../../_components/news-form";
import type { NewsInput } from "@/lib/validation/news-schema";
import type { I18nText } from "@/lib/db/schema/catalog";

export const metadata = { title: "Sửa tin tức — QS Admin" };

type Props = { params: Promise<{ id: string }> };

export default async function NewsEditPage({ params }: Props) {
  const { id } = await params;
  const [row, tagSuggestions] = await Promise.all([
    getNewsByIdForAdmin(id),
    getTagSuggestions(),
  ]);

  if (!row) notFound();

  const title = row.title as I18nText;
  const excerpt = row.excerpt as I18nText;
  const bodyHtml = row.bodyHtml as I18nText;
  const bodyJson = row.bodyJson as { vi?: unknown; en?: unknown } | null;

  const defaultValues: Partial<NewsInput> = {
    slug: row.slug,
    category: row.category,
    title: { vi: title.vi, en: title.en },
    excerpt: { vi: excerpt.vi, en: excerpt.en },
    bodyHtml: { vi: bodyHtml.vi ?? "", en: bodyHtml.en },
    bodyJson: {
      vi: bodyJson?.vi,
      en: bodyJson?.en,
    },
    coverImage: row.coverImage ?? undefined,
    tags: row.tags ?? [],
    status: row.status as "draft" | "published",
    publishedAt: row.publishedAt ?? undefined,
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/news" className="text-xs font-mono text-muted hover:text-ink">
          ← Danh sách tin tức
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight mt-2">
          Sửa: {title.vi}
        </h1>
      </div>
      <NewsForm
        mode="edit"
        slug={row.slug}
        defaultValues={defaultValues}
        tagSuggestions={tagSuggestions}
      />
    </div>
  );
}
