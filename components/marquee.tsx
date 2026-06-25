import type { CSSProperties } from "react";

/**
 * CSS-only infinite marquee. Renders two identical tracks back-to-back so the loop is
 * seamless; pauses on hover and freezes under prefers-reduced-motion (see globals.css).
 * Items inherit colour from the parent band. `reverse` scrolls right-to-left.
 */
export default function Marquee({
  items,
  speed = 42,
  reverse = false,
}: {
  items: string[];
  speed?: number;
  reverse?: boolean;
}) {
  const style = {
    "--mq-dur": `${speed}s`,
    "--mq-dir": reverse ? "reverse" : "normal",
  } as CSSProperties;

  const Track = ({ hidden = false }: { hidden?: boolean }) => (
    <div className="qs-marquee-track" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center whitespace-nowrap font-mono text-[11px] tracking-[.2em] uppercase px-7">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-2 mr-7" aria-hidden="true"></span>
          {it}
        </span>
      ))}
    </div>
  );

  return (
    <div className="qs-marquee" style={style}>
      <Track />
      <Track hidden />
    </div>
  );
}
