import { notFound } from "next/navigation";
import { products } from "@/data/products";

export function generateStaticParams() {
  return products.map(p => ({ slug: p.slug }));
}

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const p = products.find(x => x.slug === params.slug);
  if (!p) notFound();
  return (
    <section className="py-20">
      <div className="qs-wrap grid md:grid-cols-2 gap-16 items-start">
        <div className="border border-line bg-paper-2 aspect-square grid place-items-center font-display font-bold text-6xl">{p.name}</div>
        <div>
          <div className="qs-eyebrow">[ {p.axes} · {p.display} ]</div>
          <h1 className="qs-h2 mt-3">{p.name}</h1>
          <p className="text-lg text-[#3a3a3a] mt-4 leading-relaxed">{p.tag}</p>
          <div className="grid grid-cols-2 gap-px bg-line mt-8 border border-line">
            {p.specs.map(s => (
              <div key={s.l} className="bg-white p-4">
                <div className="font-mono text-[10px] text-muted tracking-[.16em] uppercase">{s.l}</div>
                <div className="font-display font-semibold text-base mt-1">{s.v}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-8">
            <a href="/contact" className="qs-btn qs-btn-gold">Yêu cầu báo giá</a>
            <a href="/downloads" className="qs-btn qs-btn-ghost">Tải datasheet</a>
          </div>
        </div>
      </div>
    </section>
  );
}
