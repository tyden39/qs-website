import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { MachineView } from "@/lib/data/machines";

/**
 * List card for a CNC / automation machine. Same spread as the /controller
 * series cards — machine render, category and tagline on the left, the
 * highlight spec matrix on the right — so both catalogues read as one system.
 * The full spec table lives on the datasheet page.
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
  const href = `/mechatronics/${machine.slug}`;

  return (
    <article className="qs-card grid md:grid-cols-[minmax(0,300px)_1fr] group shadow-[0_2px_22px_-14px_rgba(0,0,0,0.22)]">
      {/* ── Machine render + positioning ── */}
      <div className="relative flex flex-col bg-white p-7 border-b md:border-b-0 md:border-r border-line">
        <span aria-hidden className="absolute top-0 right-0 hidden md:block w-px h-10 bg-gold" />
        <Link
          href={href}
          aria-label={machine.model}
          className="relative grid place-items-center border border-line rounded-[2px] p-4 overflow-hidden min-h-[180px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}
        >
          <span aria-hidden className="qs-scan z-10" />
          <Image
            src={machine.thumbnail.src}
            alt={machine.model}
            width={machine.thumbnail.w}
            height={machine.thumbnail.h}
            sizes="(max-width: 768px) 90vw, 240px"
            className="w-auto max-h-[200px] max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            priority={index === 0}
          />
        </Link>

        <div className="mt-5 font-mono text-label-xs tracking-[.18em] uppercase text-gold-1">
          {t(`categories.${machine.category}`)}
        </div>
        <h3 className="mt-1.5 font-display font-bold text-subhead tracking-[-.01em] m-0">
          <Link
            href={href}
            className="text-ink no-underline transition-colors hover:text-gold-1 focus-visible:outline-none focus-visible:text-gold-1"
          >
            {machine.model}
          </Link>
        </h3>
        <p className="mt-2.5 m-0 text-meta text-[#3a3a3a] leading-[1.65]">{machine.tagline}</p>

        <Link href={href} className="qs-link mt-auto pt-6 self-start">
          {t("viewDetail")} <span aria-hidden>→</span>
        </Link>
      </div>

      {/* ── Highlight spec grid ── */}
      <div className="p-6 flex flex-col">
        <div className="flex items-end justify-between gap-4 pb-3 mb-4 border-b border-line">
          <div>
            <div className="qs-eyebrow">{t("specsTitle")}</div>
            <div className="mt-1 font-mono text-label-xs tracking-[.14em] uppercase text-muted">
              {t("listLabel")} {idx} / {String(total).padStart(2, "0")} · {machine.model}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-px bg-line border border-line rounded-[2px] overflow-hidden">
          {machine.highlights.map((s) => (
            <div key={s.k} className="bg-white px-4 py-3 flex flex-col gap-1">
              <span className="font-mono text-label-xs leading-snug tracking-[.06em] uppercase text-muted">
                {t(`labels.${s.k}`)}
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
