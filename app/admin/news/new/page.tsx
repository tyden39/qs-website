import Link from "next/link";
import { getTagSuggestions } from "@/app/admin/_actions/news";
import { NewsForm } from "../_components/news-form";

export const metadata = { title: "Thêm tin tức — QS Admin" };

export default async function NewsNewPage() {
  const tagSuggestions = await getTagSuggestions();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/news" className="text-xs font-mono text-muted hover:text-ink">
          ← Danh sách tin tức
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight mt-2">Thêm bài viết mới</h1>
      </div>
      <NewsForm mode="create" tagSuggestions={tagSuggestions} />
    </div>
  );
}
