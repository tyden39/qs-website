import { notFound } from "next/navigation";
import { news } from "@/data/news";

export function generateStaticParams() { return news.map(n => ({ slug: n.slug })); }

export default function NewsDetail({ params }: { params: { slug: string } }) {
  const n = news.find(x => x.slug === params.slug);
  if (!n) notFound();
  return (
    <article className="py-20">
      <div className="qs-wrap max-w-3xl">
        <div className="qs-eyebrow">[ {n.date} · {n.cat} ]</div>
        <h1 className="qs-h2 mt-3 mb-6">{n.title}</h1>
        <div className="aspect-[16/9] bg-paper-2 border border-line mb-8"></div>
        <div className="prose prose-neutral max-w-none">
          <p className="text-lg leading-relaxed text-[#3a3a3a]">{n.excerpt}</p>
          <p className="text-base leading-relaxed text-[#3a3a3a] mt-5">Nội dung bài viết chi tiết. Tích hợp MDX hoặc CMS sau để biên tập trực tiếp.</p>
        </div>
      </div>
    </article>
  );
}
