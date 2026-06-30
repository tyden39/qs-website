import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ProductView } from "@/lib/data/products";
import { KitComponentIcon } from "./kit-component-icon";

/**
 * Product item rendered as a machine kit: a featured controller on the left
 * (eyebrow → gold machine-type chip → render → model + key specs) and the
 * grid of bundled components on the right, mirroring the QS catalogue spread.
 */
export async function ProductBundleCard({
  product,
  index,
  total,
}: {
  product: ProductView;
  index: number;
  total: number;
}) {
  const t = await getTranslations("product.card");
  const idx = String(index + 1).padStart(2, "0");
  const count = String(product.bundle.length).padStart(2, "0");
  const badge = product.badge
    ? t.has(`badge.${product.badge}`)
      ? t(`badge.${product.badge}`)
      : product.badge
    : null;

  return (
    <article className="qs-card grid md:grid-cols-[minmax(0,300px)_1fr] group">
      {/* ── Featured controller ── */}
      <div className="relative flex flex-col bg-paper p-7 border-b md:border-b-0 md:border-r border-line">
        {/* gold seam echoing the catalogue's accent rule */}
        <span
          aria-hidden
          className="absolute top-0 right-0 hidden md:block w-px h-10 bg-gold"
        />
        <div className="font-mono text-[10px] tracking-[.18em] uppercase text-muted">
          {t("bundleFor")}
        </div>

        <div className="mt-2.5 self-start bg-gold-grad border border-gold-1 rounded-[2px] px-4 py-2">
          <span className="font-display font-extrabold text-[17px] tracking-[.04em] uppercase text-ink leading-none">
            {t("machine")} {product.axes}
          </span>
        </div>

        {/* controller render — real front-face photo */}
        <div
          className="relative mt-6 grid place-items-center border border-line rounded-[2px] p-4 overflow-hidden min-h-[180px]"
          style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}
        >
          <span aria-hidden className="qs-scan opacity-0 group-hover:opacity-100" />
          <Image
            src={product.image.src}
            alt={`${product.tag} — ${t("frontView")}`}
            width={product.image.w}
            height={product.image.h}
            sizes="(max-width: 768px) 90vw, 240px"
            className="w-auto max-h-[200px] max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>

        <h3 className="mt-5 font-display font-bold text-[22px] tracking-[-.01em] m-0">
          <span className="text-muted font-medium text-[15px]">{t("model")}</span> {product.name}
        </h3>

        <ul className="list-none p-0 m-0 mt-3 flex flex-col gap-1.5">
          {product.bullets.map((b) => (
            <li
              key={b}
              className="text-[13px] text-[#3a3a3a] flex gap-2.5 before:content-['—'] before:text-gold-1 before:font-mono"
            >
              {b.includes(":") ? (
                <span>
                  {b.split(":")[0]}:{" "}
                  <b className="font-semibold">{b.split(":").slice(1).join(":").trim()}</b>
                </span>
              ) : (
                b
              )}
            </li>
          ))}
        </ul>

        <Link
          href={`/products/${product.slug}`}
          className="qs-link mt-auto pt-6 self-start"
        >
          {t("viewDetails")} <span aria-hidden>→</span>
        </Link>
      </div>

      {/* ── Bundle component grid ── */}
      <div className="p-6 flex flex-col">
        <div className="flex items-end justify-between gap-4 pb-3 mb-4 border-b border-line">
          <div>
            <div className="qs-eyebrow">{t("components")}</div>
            <div className="mt-1 font-mono text-[10px] tracking-[.14em] uppercase text-muted">
              {t("modelLabel")} {idx} / {String(total).padStart(2, "0")} · {product.tag}
            </div>
          </div>
          <span className="font-mono text-[11px] tracking-widest text-muted whitespace-nowrap">
            <b className="text-ink font-semibold">{count}</b> {t("parts")}
          </span>
        </div>

        {/* hairline-divided datasheet matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-line border border-line rounded-[2px] overflow-hidden">
          {product.bundle.map((c, i) => (
            <div
              key={c.label}
              className="group/tile relative bg-white p-4 flex flex-col items-center text-center transition-colors hover:bg-paper"
            >
              <span className="absolute top-2 right-2.5 font-mono text-[9px] text-line-2 tracking-widest">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="grid place-items-center h-[68px] w-full">
                <KitComponentIcon
                  type={c.icon}
                  className="h-full w-auto transition-transform duration-200 group-hover/tile:-translate-y-0.5"
                />
              </div>
              <div className="mt-3 font-mono text-[10px] leading-[1.5] tracking-[.06em] uppercase text-muted">
                {c.label}
              </div>
            </div>
          ))}
        </div>

        {badge && (
          <div className="mt-4 flex items-center gap-2.5">
            <span className="qs-live-dot" aria-hidden />
            <span className="font-mono text-[10px] tracking-[.16em] uppercase text-gold-1">
              {badge}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
