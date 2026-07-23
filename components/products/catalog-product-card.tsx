import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { CatalogProductView } from "@/lib/data/catalog";

/**
 * Compact grid card for DNC units and accessories. These are simple items — a
 * board, a cable, a power supply — so the card carries render, name and a
 * one-line description only; the spec table lives on the detail page. The
 * whole card is the link, mirroring the /electronics landing group cards.
 */
export async function CatalogProductCard({
  product,
  index,
  total,
}: {
  product: CatalogProductView;
  index: number;
  total: number;
}) {
  const t = await getTranslations("product.card");
  const idx = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/electronics/${product.slug}`}
      className="qs-card group flex flex-col bg-white border border-line
                 shadow-[0_2px_22px_-14px_rgba(0,0,0,0.22)] transition-colors hover:border-ink"
    >
      <div className="relative p-5">
        <div
          className="relative grid place-items-center border border-line rounded-[2px] aspect-16/10 overflow-hidden"
          style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}
        >
          <span aria-hidden className="qs-scan z-10" />
          <Image
            src={product.image.src}
            alt={product.image.alt}
            width={product.image.w}
            height={product.image.h}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 340px"
            className="w-auto max-h-[80%] max-w-[80%] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </div>
      <div className="flex flex-col flex-1 px-5 pb-5">
        <div className="flex items-baseline justify-between gap-3 font-mono text-label-xs tracking-[.14em] uppercase">
          <span className="text-muted shrink-0">
            {idx} / {String(total).padStart(2, "0")}
          </span>
          <span className="text-gold-2 truncate">{product.tag}</span>
        </div>
        <h3 className="mt-2 font-display font-bold text-subhead tracking-[-.01em] m-0 group-hover:text-gold-1 transition-colors">
          {product.name}
        </h3>
        <p className="mt-2 m-0 text-meta text-muted leading-[1.65]">{product.desc}</p>
        <span className="qs-link mt-auto pt-5 self-start">
          {t("viewDetails")} <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
