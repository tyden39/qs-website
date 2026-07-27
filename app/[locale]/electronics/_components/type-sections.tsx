/**
 * Sub-type sectioning shared by the group list pages. A group that sells more
 * than one kind of thing (machines, controllers, the servo set) splits its list
 * into anchored sections instead of getting its own routes — the sub-types are
 * a reading aid, not destinations worth a URL.
 *
 * Label-driven and hook-free so it works in the server-rendered lists and
 * inside the client-side type filters alike.
 */

/**
 * One section of the list: rule + heading + count, then the group's own cards.
 * `scroll-mt` keeps the heading clear of the sticky header when jumped to.
 */
export function TypeSection({
  id,
  label,
  count,
  children,
}: {
  id: string;
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
      <div className="flex items-baseline gap-3 pb-2.5 mb-5 border-b border-line">
        <h2
          id={`${id}-heading`}
          className="m-0 font-display font-bold text-subhead tracking-[-.01em] text-ink"
        >
          {label}
        </h2>
        <span className="font-mono text-label-xs tracking-[.14em] text-gold-2 tabular-nums">
          {String(count).padStart(2, "0")}
        </span>
      </div>
      {children}
    </section>
  );
}
