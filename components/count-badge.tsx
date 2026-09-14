/** Light chrome (paper sidebars) vs dark chrome (ink machine-hall sidebar). */
export type CountBadgeTone = "light" | "dark";

/**
 * The small numeral that trails a navigation row — how many items sit behind it.
 *
 * Drawn as a filled chip rather than bare text: at 11–12px a mono numeral set in
 * a hairline grey (the previous treatment) sat near 2:1 against paper, well under
 * the 4.5:1 body-text floor, so the counts read as decoration instead of data.
 * The chip carries its own background, which lets the numeral use a colour dark
 * enough to clear that floor while still reading as secondary to the label.
 *
 * Fixed minimum width plus tabular figures keeps one- and two-digit counts the
 * same size, so a column of rows lines up and switching branches never nudges
 * the layout.
 */
export default function CountBadge({
  children,
  active = false,
  tone = "light",
  className = "",
}: {
  /** The count, already zero-padded. */
  children: React.ReactNode;
  active?: boolean;
  tone?: CountBadgeTone;
  className?: string;
}) {
  const skin =
    tone === "dark"
      ? active
        ? "bg-gold-2 text-[#141510]"
        : "bg-white/[.07] text-[#a8a294]"
      : active
        ? "bg-gold-1 text-white"
        : "bg-paper-2 text-muted";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center min-w-[2.15em] px-1.5 py-[3px] rounded-[2px]
                  font-mono text-label font-semibold leading-none tabular-nums transition-colors ${skin} ${className}`}
    >
      {children}
    </span>
  );
}
