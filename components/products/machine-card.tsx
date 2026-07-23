import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { MachineView } from "@/lib/data/machines";

/**
 * Grid card for a CNC / automation machine on the machine-building list. Carries
 * the machine render, its category tag, model, tagline and a few highlight spec
 * rows, then links to the datasheet — mirroring the /electronics catalogue cards
 * so both catalogues read as one system. The whole card is the link.
 */
export async function MachineCard({
  machine,
  index,
  total,
}: {
  machine: MachineView;
  index: number;
  total: number;
}) {
  const t = await getTranslations("cnc.machines");
  const idx = String(index + 1).padStart(2, "0");
  // Two leading spec rows keep the card compact while still previewing the data
  // machines are chosen on; the full table lives on the datasheet.
  const preview = machine.highlights.slice(0, 2);

  return (
    <Link
      href={`/machine-building/${machine.slug}`}
      className="qs-card group flex flex-col bg-white border border-line
                 shadow-[0_2px_22px_-14px_rgba(0,0,0,0.22)] transition-colors hover:border-ink"
    >
      <div className="relative p-5">
        <div
          className="relative grid place-items-center border border-line rounded-[2px] aspect-4/3 overflow-hidden"
          style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}
        >
          <span aria-hidden className="qs-scan z-10" />
          <Image
            src={machine.thumbnail.src}
            alt={machine.model}
            width={machine.thumbnail.w}
            height={machine.thumbnail.h}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 340px"
            className="w-auto max-h-[82%] max-w-[82%] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            priority={index === 0}
          />
        </div>
      </div>
      <div className="flex flex-col flex-1 px-5 pb-5">
        <div className="flex items-baseline justify-between gap-3 font-mono text-label-xs tracking-[.14em] uppercase">
          <span className="text-muted shrink-0">
            {idx} / {String(total).padStart(2, "0")}
          </span>
          <span className="text-gold-2 truncate">{t(`categories.${machine.category}`)}</span>
        </div>
        <h3 className="mt-2 font-display font-bold text-subhead tracking-[-.01em] m-0 group-hover:text-gold-1 transition-colors">
          {machine.model}
        </h3>
        <p className="mt-2 m-0 text-meta text-muted leading-[1.6] line-clamp-2">{machine.tagline}</p>
        {preview.length > 0 ? (
          <dl className="m-0 mt-3.5 pt-3.5 border-t border-line">
            {preview.map((s) => (
              <div key={s.k} className="flex items-baseline justify-between gap-4 py-1">
                <dt className="text-label-xs text-muted m-0">{t(`labels.${s.k}`)}</dt>
                <dd className="font-mono text-label-xs text-ink text-right m-0">{s.v}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <span className="qs-link mt-auto pt-5 self-start">
          {t("viewDetail")} <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
