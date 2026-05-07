import Link from "next/link";
import { news } from "@/data/news";

export const metadata = { title: "Tin tức — QS Technology" };

export default function News() {
  return (
    <section className="py-20">
      <div className="qs-wrap">
        <div className="qs-eyebrow">[ Tin tức · cập nhật ]</div>
        <h1 className="qs-h2 mt-2 mb-10">Bản tin QS Technology</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map(n => (
            <Link key={n.slug} href={`/news/${n.slug}`} className="border border-line bg-white block hover:border-ink transition-colors">
              <div className="aspect-[5/3] bg-paper-2 border-b border-line"></div>
              <div className="p-5">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">{n.date} · {n.cat}</div>
                <h3 className="font-display font-semibold text-lg mt-2 leading-snug">{n.title}</h3>
                <p className="text-sm text-muted mt-2 leading-relaxed line-clamp-2">{n.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
