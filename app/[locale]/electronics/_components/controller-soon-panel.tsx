import { Link } from "@/lib/i18n/navigation";
import { CategoryIcon } from "@/components/category-icon";
import CircuitTraces from "@/components/circuit-traces";

/** Copy for the placeholder panel, resolved by the page (the list is a client
 *  component and cannot reach the server translator itself). */
export type ControllerSoonCopy = {
  eyebrow: string;
  /** Label set inside the glyph plate itself. Without it the plate is wordless
   *  and duplicates the "photo pending" placeholder on a series card, which
   *  means the opposite thing — there the model exists and only its render is
   *  missing. Naming the plate is what keeps the two apart. */
  plate: string;
  body: string;
  contact: string;
  browse: string;
};

// Blueprint registration marks: an L in each corner of the glyph plate, the
// drafting convention for a plate that is set up but not yet drawn.
const CORNERS = [
  "top-2 left-2 border-t border-l",
  "top-2 right-2 border-t border-r",
  "bottom-2 left-2 border-b border-l",
  "bottom-2 right-2 border-b border-r",
];

/**
 * Stands in for the product list when a controller sub-type is announced in the
 * browse taxonomy but carries no model yet. Built on the same two-column frame
 * as ProductBundleCard so the list keeps its rhythm, then swapped to the
 * catalogue's "in progress" language: dashed gold rules instead of solid, the
 * sub-type glyph under a scan line where the controller render would sit, and a
 * pair of actions so the branch is never a dead end.
 */
export function ControllerSoonPanel({
  label,
  icon,
  copy,
  onBrowseAll,
}: {
  /** Localized sub-type name, e.g. "Điều khiển robot". */
  label: string;
  /** CategoryIcon slug for the sub-type, matching the tree branch's glyph. */
  icon: string;
  copy: ControllerSoonCopy;
  /** Clears the sub-type filter, sending the visitor back to the full list. */
  onBrowseAll: () => void;
}) {
  return (
    <article className="relative overflow-hidden rounded-[3px] border border-dashed border-gold-1/45 bg-white grid md:grid-cols-[minmax(0,300px)_1fr]">
      {/* Blueprint texture, gold atmosphere and the brand trace network — all
          decorative, and all already muted by the global reduced-motion rules. */}
      <span aria-hidden className="absolute inset-0 qs-dot-bg opacity-60" />
      <span aria-hidden className="qs-glow hidden sm:block right-[4%] top-[-45%] w-[32%] h-[190%]" />
      <CircuitTraces
        variant="light"
        className="hidden md:block absolute inset-y-0 right-0 w-[46%] opacity-[.38] [mask-image:radial-gradient(ellipse_at_right,#000_18%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_18%,transparent_72%)]"
      />

      {/* ── Glyph plate, in the slot the controller render occupies on a card ── */}
      <div className="relative p-5 sm:p-7 border-b md:border-b-0 md:border-r border-dashed border-gold-1/30">
        {/* Same gold seam the product card draws on its column divider, so the
            placeholder still reads as one of the list's plates. */}
        <span aria-hidden className="absolute top-0 right-0 hidden md:block w-px h-10 bg-gold" />
        <div
          className="relative grid place-items-center overflow-hidden rounded-[2px] border border-dashed border-gold-1/40 min-h-[200px]"
          style={{ background: "radial-gradient(circle at 50% 38%, #ffffff, #ecebe5)" }}
        >
          <span aria-hidden className="qs-scan z-10" />
          {/* Glyph over its own caption: the caption states what is missing (a
              model, not a photograph) in the gold register, so the plate reads
              correctly on its own before the copy beside it is reached. */}
          <div className="flex flex-col items-center gap-3.5">
            <CategoryIcon name={icon} className="w-[112px] h-[112px] text-gold-1/55" />
            <span className="font-mono text-label-xs font-semibold tracking-[.16em] uppercase text-gold-1/75">
              {copy.plate}
            </span>
          </div>
          {CORNERS.map((pos) => (
            <span key={pos} aria-hidden className={`absolute w-3.5 h-3.5 border-gold-1/50 ${pos}`} />
          ))}
        </div>
      </div>

      {/* ── Status, name and the way out ── */}
      <div className="relative p-5 sm:p-7 flex flex-col items-start gap-4">
        <span className="inline-flex items-center gap-2 px-2.5 py-1 border border-gold-1/40 font-mono text-label-xs font-semibold tracking-[.16em] uppercase text-gold-1">
          <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse motion-reduce:animate-none" />
          {copy.eyebrow}
        </span>
        {/* Matches the model heading on a product card, so a placeholder branch
            carries the same weight in the list as a real one. */}
        <h3 className="font-display font-bold text-subhead tracking-[-.01em] m-0">{label}</h3>
        <p className="text-body text-[#3a3a3a] leading-[1.7] max-w-[52ch] m-0">{copy.body}</p>
        <div className="flex flex-wrap gap-3 mt-auto pt-1">
          <Link href="/contact" className="qs-btn qs-btn-gold qs-btn-sm">
            {copy.contact}
            <span aria-hidden className="arr">→</span>
          </Link>
          <button type="button" onClick={onBrowseAll} className="qs-btn qs-btn-ghost qs-btn-sm cursor-pointer">
            {copy.browse}
          </button>
        </div>
      </div>
    </article>
  );
}
