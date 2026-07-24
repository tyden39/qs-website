import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { SeriesView } from "@/lib/data/series";

/**
 * List card for a drive-line series (QS Servo, Savch inverters). The catalogue
 * sells these at series level, so the card carries series-wide facts only and
 * links through to the series datasheet page. Unknown facts are omitted, never
 * dashed out. What the servo set is made of is told by the list page's own
 * sections (drives / motors / cables), so the card does not repeat it.
 */
export async function SeriesCard({
  series,
  index,
  total,
}: {
  series: SeriesView;
  index: number;
  total: number;
}) {
  const t = await getTranslations("product.seriesCard");
  const idx = String(index + 1).padStart(2, "0");

  return (
    <article className="qs-card grid md:grid-cols-[minmax(0,300px)_1fr] group shadow-[0_2px_22px_-14px_rgba(0,0,0,0.22)]">
      {/* ── Series render + positioning ── */}
      <div className="relative flex flex-col bg-white p-7 border-b md:border-b-0 md:border-r border-line">
        <span aria-hidden className="absolute top-0 right-0 hidden md:block w-px h-10 bg-gold" />
        {series.image ? (
          <Link
            href={`/controller/${series.slug}`}
            aria-label={series.name}
            className="relative grid place-items-center border border-line rounded-[2px] p-4 overflow-hidden min-h-[180px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}
          >
            <span aria-hidden className="qs-scan z-10" />
            <Image
              src={series.image.src}
              alt={series.image.alt}
              width={series.image.w}
              height={series.image.h}
              sizes="(max-width: 768px) 90vw, 240px"
              className="w-auto max-h-[200px] max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </Link>
        ) : (
          <div
            className="grid place-items-center border border-dashed border-gold rounded-[2px] p-4 min-h-[180px]"
            style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}
          >
            <span className="font-mono text-label-xs tracking-[.16em] uppercase text-muted">
              {t("imageUpdating")}
            </span>
          </div>
        )}

        <div className="mt-5 font-mono text-label-xs tracking-[.18em] uppercase text-gold-1">
          {series.brand}
        </div>
        <h3 className="mt-1.5 font-display font-bold text-subhead tracking-[-.01em] m-0">
          <Link
            href={`/controller/${series.slug}`}
            className="text-ink no-underline transition-colors hover:text-gold-1 focus-visible:outline-none focus-visible:text-gold-1"
          >
            {series.name}
          </Link>
        </h3>
        <p className="mt-2.5 m-0 text-meta text-[#3a3a3a] leading-[1.65]">{series.desc}</p>

        <Link href={`/controller/${series.slug}`} className="qs-link mt-auto pt-6 self-start">
          {t("details")} <span aria-hidden>→</span>
        </Link>
      </div>

      {/* ── Series spec grid ── */}
      <div className="p-6 flex flex-col">
        <div className="flex items-end justify-between gap-4 pb-3 mb-4 border-b border-line">
          <div>
            <div className="qs-eyebrow">{t("specifications")}</div>
            <div className="mt-1 font-mono text-label-xs tracking-[.14em] uppercase text-muted">
              {t("seriesLabel")} {idx} / {String(total).padStart(2, "0")} · {series.tag}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-px bg-line border border-line rounded-[2px] overflow-hidden">
          {series.specs.map((s) => (
            <div key={s.l} className="bg-white px-4 py-3 flex flex-col gap-1">
              <span className="font-mono text-label-xs leading-snug tracking-[.06em] uppercase text-muted">
                {s.l}
              </span>
              <span className="text-meta font-semibold tracking-[-.005em] text-ink tabular-nums">
                {s.v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
