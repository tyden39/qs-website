import type { SeriesCodeSegmentView } from "@/lib/data/series";

/**
 * Model-code decode drawn from data, for series where the manufacturer
 * publishes no decode diagram of its own (the Savch inverters).
 *
 * Deliberately not a copy of the manufacturer's leader-line layout: leader
 * lines need fixed pixel positions, which do not survive a narrow viewport.
 * Numbering each chunk and listing the keys underneath carries the same
 * mapping, reflows on mobile, and — unlike the scanned diagrams used for the
 * servo series — leaves the decode text in the HTML for search.
 */
export function SeriesNamingCode({
  code,
  segments,
}: {
  code: string;
  segments: SeriesCodeSegmentView[];
}) {
  return (
    <div className="border border-line bg-paper p-6 lg:p-8">
      <div className="flex flex-wrap items-end gap-x-2 gap-y-4">
        {segments.map((seg, i) => (
          <div key={`${seg.text}-${i}`} className="flex flex-col items-center gap-1.5">
            <span className="font-display text-title sm:text-subhead font-bold tracking-[-.02em] text-ink">
              {seg.text}
            </span>
            <span className="w-full h-px bg-gold" aria-hidden="true" />
            <span
              className="font-mono text-label-xs tracking-[.08em] text-gold-1 tabular-nums"
              aria-hidden="true"
            >
              {i + 1}
            </span>
          </div>
        ))}
      </div>

      {/* The full code as one string, for anyone reading the page with a screen
          reader or copying the designation out. */}
      <span className="sr-only">{code}</span>

      <ol className="mt-7 flex flex-col gap-2.5 m-0 p-0 list-none">
        {segments.map((seg, i) => (
          <li
            key={`${seg.text}-${i}-label`}
            className="flex gap-3 text-meta leading-[1.6] text-[#3a3a3a]"
          >
            <span className="font-mono text-label-xs text-gold-1 tabular-nums pt-0.5 shrink-0">
              {i + 1}
            </span>
            <span>
              <b className="font-semibold text-ink">{seg.text}</b>
              {" — "}
              {seg.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
