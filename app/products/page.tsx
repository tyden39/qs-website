import Link from "next/link";
import { products } from "@/data/products";

export const metadata = { title: "Bộ điều khiển CNC — QS Technology" };

export default function Products() {
  return (
    <section className="py-20">
      <div className="qs-wrap">
        <div className="qs-eyebrow">[ Catalog · {products.length} model ]</div>
        <h1 className="qs-h2 mt-2 mb-10">Bộ điều khiển CNC</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="border border-line bg-white block hover:border-ink transition-colors">
              <div className="aspect-[5/3] bg-paper-2 border-b border-line grid place-items-center font-display text-4xl font-bold">{p.name}</div>
              <div className="p-6">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">{p.axes} · {p.display}</div>
                <h3 className="font-display font-semibold text-xl mt-2">{p.name}</h3>
                <p className="text-sm text-muted mt-2 leading-relaxed">{p.tag}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
