import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { CatalogProductView } from "@/lib/data/catalog";

/**
 * List card for DNC units and accessories. These have no machine kit to show,
 * so the layout is render on the left and the spec table on the right — the
 * densest useful summary for a board or a cable.
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
  // The card shows a preview of the table; the rest lives on the detail page.
  const preview = product.specs.slice(0, 6);
  const rest = product.specs.length - preview.length;

  return (
    <article className="qs-card grid md:grid-cols-[minmax(0,300px)_1fr] group shadow-[0_2px_22px_-14px_rgba(0,0,0,0.22)]">
      {/* ── Product render ── */}
      <div className="relative flex flex-col bg-white p-7 border-b md:border-b-0 md:border-r border-line">
        <span aria-hidden className="absolute top-0 right-0 hidden md:block w-px h-10 bg-gold" />
        <Link
          href={`/products/${product.slug}`}
          aria-label={product.name}
          className="relative grid place-items-center border border-line rounded-[2px] p-4 overflow-hidden min-h-[180px]"
          style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}
        >
          <span aria-hidden className="qs-scan opacity-0 group-hover:opacity-100" />
          <Image
            src={product.image.src}
            alt={product.image.alt}
            width={product.image.w}
            height={product.image.h}
            sizes="(max-width: 768px) 90vw, 240px"
            className="w-auto max-h-[200px] max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        <h3 className="mt-5 font-display font-bold text-[22px] tracking-[-.01em] m-0">
          <Link href={`/products/${product.slug}`} className="hover:text-gold-1 transition-colors">
            {product.name}
          </Link>
        </h3>

        <p className="mt-2.5 m-0 text-[13px] text-[#3a3a3a] leading-[1.65]">{product.desc}</p>

        <div className="mt-4 font-mono text-[11px] tracking-[.08em] uppercase">
          {product.price ? (
            <span className="text-ink font-semibold">{product.price}</span>
          ) : (
            <span className="text-gold-1">{t("priceOnRequest")}</span>
          )}
        </div>

        <Link href={`/products/${product.slug}`} className="qs-link mt-auto pt-6 self-start">
          {t("viewDetails")} <span aria-hidden>→</span>
        </Link>
      </div>

      {/* ── Spec table ── */}
      <div className="p-6 flex flex-col">
        <div className="flex items-end justify-between gap-4 pb-3 mb-4 border-b border-line">
          <div>
            <div className="qs-eyebrow">{t("specifications")}</div>
            <div className="mt-1 font-mono text-[10px] tracking-[.14em] uppercase text-muted">
              {t("modelLabel")} {idx} / {String(total).padStart(2, "0")} · {product.tag}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-px bg-line border border-line rounded-[2px] overflow-hidden">
          {preview.map((s) => (
            <div key={s.l} className="bg-white px-4 py-3 flex flex-col gap-1">
              <span className="font-mono text-[10px] leading-snug tracking-[.06em] uppercase text-muted">
                {s.l}
              </span>
              <span className="text-[13.5px] font-semibold tracking-[-.005em] text-ink tabular-nums">
                {s.v}
              </span>
            </div>
          ))}
        </div>

        {rest > 0 && (
          <div className="mt-3 font-mono text-[10px] tracking-[.14em] uppercase text-muted">
            {t("moreSpecs", { count: rest })}
          </div>
        )}
      </div>
    </article>
  );
}
