import { Link } from "@/lib/i18n/navigation";

export type ContactCtaWrap = "wide" | "detail";

type ContactCtaProps = {
  /** Mono kicker above the heading; omitted on most pages. */
  eyebrow?: string;
  heading: string;
  body: string;
  ctaLabel: string;
  /** Detail pages run in the narrower qs-wrap-detail container. */
  wrap?: ContactCtaWrap;
  /** Hairline above the section, for pages whose preceding block shares its background. */
  bordered?: boolean;
};

/**
 * Closing call to action: a dark card on a light section, heading + body on the
 * left and the contact button on the right.
 *
 * The section stays below the full padding tier because the card already carries
 * p-7/p-10/p-12 — giving the section the full tier would count the same breathing
 * room twice, once outside the card and once inside it. It still runs a little
 * wider than the compact tier so the hairline above sits closer to the midpoint
 * between the preceding section and the card.
 *
 * paper-2 is the surface here because it is the one light tone the sections that
 * precede this block never use — they alternate white, paper and #f7f5ef, and on
 * the detail pages the section that lands above depends on which tab is open, so
 * no other tone can promise a visible boundary. The step also carries the eye
 * into the dark footer.
 */
export default function ContactCta({
  eyebrow,
  heading,
  body,
  ctaLabel,
  wrap = "wide",
  bordered = false,
}: ContactCtaProps) {
  return (
    <section className={`qs-closing-cta py-10 sm:py-12 lg:py-16 bg-paper-2${bordered ? " border-t border-line" : ""}`}>
      <div className={wrap === "detail" ? "qs-wrap-detail" : "max-w-wrap mx-auto px-5 sm:px-8 lg:px-12"}>
        <div className="bg-[#11120f] text-[#cfc9b8] p-7 sm:p-10 lg:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center border border-[#28261f]">
          <div>
            {eyebrow && (
              <p className="font-mono text-label text-gold-2 tracking-[.14em] uppercase m-0 mb-3">{eyebrow}</p>
            )}
            <h3 className="font-display font-bold text-h2 text-white tracking-[-.01em] m-0">{heading}</h3>
            <p className="text-[#a8a499] mt-2 max-w-[60ch] m-0 text-body leading-relaxed">{body}</p>
          </div>
          <Link className="qs-btn qs-btn-gold" href="/contact">{ctaLabel}</Link>
        </div>
      </div>
    </section>
  );
}
