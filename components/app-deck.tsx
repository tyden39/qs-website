import Image from "next/image";
import type { CSSProperties } from "react";
import { Link } from "@/lib/i18n/navigation";

type App = { slug: string; n: string; t: string; img: string; d: string };

const CARD_H = "clamp(440px, 70vh, 600px)"; // tall, near full-screen
const WIDTH = "34%"; // all cards equal width
const OVERLAP = "12%"; // diagonal overlap → leaves the stacking spacing
const STEP_Y = 48; // vertical stagger → top-left to bottom-right

/**
 * Applications deck — large, equal-width upright cards stacked diagonally
 * (top-left → bottom-right). Hovering a card lifts it to the front and reveals its
 * description (animated). Pure CSS hover; honors reduced-motion (see globals.css).
 */
export default function AppDeck({ items }: { items: App[] }) {
  return (
    <div
      className="hidden md:flex items-start w-full"
      style={{ minHeight: `calc(${CARD_H} + ${STEP_Y * (items.length - 1) + 46}px)` }}
    >
      {items.map((a, i) => (
        <Link
          key={a.slug}
          href={`/applications/${a.slug}`}
          className="qs-app-card group relative shrink-0 overflow-hidden rounded-[5px] bg-ink-2"
          style={{
            width: WIDTH,
            height: CARD_H,
            marginTop: i * STEP_Y,
            marginLeft: i ? `-${OVERLAP}` : 0,
            zIndex: i + 1,
          } as CSSProperties}
        >
          <Image
            src={a.img}
            alt={a.t}
            fill
            sizes="(max-width:1280px) 45vw, 36vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(0deg,rgba(10,10,8,.92) 0%,rgba(10,10,8,.18) 52%,transparent 80%)" }}
          />

          {/* decorative frame with gold corner ticks */}
          <div className="pointer-events-none absolute inset-4 border border-white/15 transition-colors duration-500 group-hover:border-gold-2/60">
            <span className="absolute -top-px -left-px w-3.5 h-3.5 border-t border-l border-gold-2"></span>
            <span className="absolute -top-px -right-px w-3.5 h-3.5 border-t border-r border-gold-2"></span>
            <span className="absolute -bottom-px -left-px w-3.5 h-3.5 border-b border-l border-gold-2"></span>
            <span className="absolute -bottom-px -right-px w-3.5 h-3.5 border-b border-r border-gold-2"></span>
          </div>

          <span className="absolute top-7 left-7 font-mono text-[11px] text-gold-2 tracking-[.22em] uppercase">{a.n}</span>
          <div className="absolute inset-x-0 bottom-0 p-7 lg:p-9">
            <h4 className="font-display font-semibold text-white text-2xl leading-tight">{a.t}</h4>
            <div className="grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-500 delay-75">
              <div className="overflow-hidden">
                <p className="text-[#d2ccba] text-sm leading-[1.65] mt-3.5">{a.d}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[.14em] uppercase text-gold-2">Chi tiết →</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
