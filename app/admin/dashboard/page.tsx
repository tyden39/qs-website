import Link from "next/link";
import { getProductCount } from "@/lib/data/products";
import { getNewsCount } from "@/lib/data/news";
import { getApplicationCount } from "@/lib/data/applications";
import { getServiceCount } from "@/lib/data/services";
import { getDatasheetCount } from "@/lib/data/datasheets";

const tiles = [
  { href: "/admin/products", label: "Products", get: getProductCount },
  { href: "/admin/news", label: "News", get: getNewsCount },
  { href: "/admin/applications", label: "Applications", get: getApplicationCount },
  { href: "/admin/services", label: "Services", get: getServiceCount },
  { href: "/admin/datasheets", label: "Datasheets", get: getDatasheetCount },
];

export default async function Dashboard() {
  const counts = await Promise.all(tiles.map((t) => t.get()));
  return (
    <div>
      <div className="font-mono text-[10px] tracking-[.16em] uppercase text-gold-1">[ Overview ]</div>
      <h1 className="font-display font-bold text-3xl mt-2 mb-6 tracking-[-.01em]">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tiles.map((tile, i) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="bg-white border border-line p-5 hover:border-ink transition-colors"
          >
            <div className="font-mono text-[10px] tracking-[.18em] uppercase text-muted">
              {tile.label}
            </div>
            <div className="font-display text-4xl font-bold mt-2 tracking-[-.02em]">
              {counts[i]}
            </div>
            <div className="font-mono text-[10px] text-muted mt-1">
              records · click to manage →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
