import Link from "next/link";
import { getAllNewsForAdmin } from "@/lib/data/news";
import { NewsTable } from "./_components/news-columns";

export const metadata = { title: "Tin tức — QS Admin" };

export default async function NewsListPage() {
  const rows = await getAllNewsForAdmin();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Tin tức</h1>
          <p className="text-muted text-sm mt-1">{rows.length} bài viết</p>
        </div>
        <Link href="/admin/news/new" className="qs-btn qs-btn-primary">
          + Thêm bài viết
        </Link>
      </div>
      <NewsTable rows={rows} />
    </div>
  );
}
