import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { PRODUCT_GROUPS, type ProductGroupId } from "./category-page";
import type { Locale } from "@/lib/i18n/config";

export type ProductGroupTile = {
  id: ProductGroupId;
  count: number;
  /** Representative render; null shows the dashed updating frame instead. */
  thumb: { src: string; w: number; h: number } | null;
  /** Sub-types stocked in this group, localized. Empty where the group is not
   *  subdivided — the card then shows the blurb alone. */
  types: string[];
};

/**
 * The /products landing grid: one card per catalogue group, each linking to
 * that group's own list page. The whole card is the link — the list page (not
 * the card) is where browsing happens, so there is nothing else to click here.
 */
export async function GroupGrid({
  locale,
  groups,
}: {
  locale: Locale;
  groups: ProductGroupTile[];
}) {
  const t = await getTranslations({ locale, namespace: "product.page" });
  const tSeries = await getTranslations({ locale, namespace: "product.seriesCard" });
  const total = String(groups.length).padStart(2, "0");

  return (
    <>
      <div className="qs-eyebrow">{t("groups.eyebrow")}</div>
      <h2 className="font-display text-title sm:text-subhead font-semibold tracking-[-.015em] text-ink mt-1.5 mb-7">
        {t("groups.heading")}
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {groups.map((g, i) => (
          <Link
            key={g.id}
            href={`/products/${PRODUCT_GROUPS[g.id].segment}`}
            className="qs-card group flex flex-col bg-white border border-line
                       shadow-[0_2px_22px_-14px_rgba(0,0,0,0.22)] transition-colors hover:border-ink"
          >
            <div className="relative p-6">
              {g.thumb ? (
                <div
                  className="relative border border-line rounded-[2px] aspect-16/10 overflow-hidden"
                  style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}
                >
                  {/* fill + object-contain fits any thumb ratio inside the
                      landscape frame — portrait machine renders included — so
                      nothing crops. Padding keeps the render off the border. */}
                  <Image
                    src={g.thumb.src}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 340px"
                    className="object-contain p-[9%] transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span aria-hidden className="qs-scan opacity-0 group-hover:opacity-100" />
                </div>
              ) : (
                <div
                  className="grid place-items-center border border-dashed border-gold rounded-[2px] aspect-16/10"
                  style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}
                >
                  <span className="font-mono text-label-xs tracking-[.16em] uppercase text-muted">
                    {tSeries("imageUpdating")}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col flex-1 px-6 pb-6">
              <div className="flex items-baseline justify-between font-mono text-label-xs tracking-[.14em] uppercase">
                <span className="text-muted">
                  {String(i + 1).padStart(2, "0")} / {total}
                </span>
                <span className="text-gold-2 tabular-nums">{String(g.count).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-2 font-display font-bold text-subhead tracking-[-.01em] m-0 group-hover:text-gold-1 transition-colors">
                {t(`groups.${g.id}.label`)}
              </h3>
              <p className="mt-2 m-0 text-meta text-muted leading-[1.65]">
                {t(`groups.${g.id}.blurb`)}
              </p>
              {g.types.length > 0 && (
                <p className="mt-2.5 m-0 font-mono text-label-xs tracking-[.08em] text-[#5a5650] leading-[1.7]">
                  {g.types.join(" · ")}
                </p>
              )}
              <span className="qs-link mt-auto pt-5 self-start">
                {t("groups.viewList")} <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
