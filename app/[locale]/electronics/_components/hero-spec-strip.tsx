export type HeroSpecItem = { l: string; v: string };

// A value short enough to read as a rating ("0.4 – 5.5 kW") carries the display
// size; anything longer is a phrase or a separated list, and at display size it
// wrapped to three lines and towered over the ratings beside it. Those step down
// to body size so the row keeps one reading rhythm.
const VALUE_DISPLAY_MAX = 24;

// The strip is a full-bleed block, so a trailing part-row leaves visible empty
// cells (six items over four columns left two dark holes). The last cell absorbs
// the tail instead, which also hands the longest value the widest cell.
const TAIL_SPAN_SM = ["", "sm:col-span-2"];
const TAIL_SPAN_LG = ["", "lg:col-span-4", "lg:col-span-3", "lg:col-span-2"];

// Values list their variants with a middot ("1 pha 220 V · 3 pha 440 V"). In a
// narrow cell the browser broke them anywhere, splitting a single rating across
// two lines ("3 pha / 220 V"), which reads as two ratings. Binding the spaces
// inside each variant leaves the middots as the only break points.
const bindVariants = (v: string) =>
  v.includes(" · ")
    ? v
        .split(" · ")
        .map((part) => part.replace(/ /g, " "))
        .join(" · ")
    : v;

/**
 * Key ratings rendered as a dark grid under a product or series hero title, so
 * the numbers a buyer scans for sit with the name rather than behind a tab.
 */
export function HeroSpecStrip({
  items,
  className = "",
}: {
  items: HeroSpecItem[];
  className?: string;
}) {
  if (items.length === 0) return null;

  const tailSpan = `${TAIL_SPAN_SM[items.length % 2]} ${
    TAIL_SPAN_LG[items.length % 4]
  }`;

  return (
    <dl
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10 m-0 ${className}`}
    >
      {items.map((s, i) => (
        <div
          key={s.l}
          className={`bg-[#141510] px-4 py-3.5 sm:px-5 sm:py-4 ${
            i === items.length - 1 ? tailSpan : ""
          }`}
        >
          <dt className="font-mono text-label-xs tracking-[.16em] uppercase text-[#837b6c]">
            {s.l}
          </dt>
          <dd
            className={`m-0 mt-1.5 font-display font-semibold tracking-[-.02em] leading-[1.45] text-balance text-white tabular-nums ${
              s.v.length <= VALUE_DISPLAY_MAX ? "text-title" : "text-body"
            }`}
          >
            {bindVariants(s.v)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
