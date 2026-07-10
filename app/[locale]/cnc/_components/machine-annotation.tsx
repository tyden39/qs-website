import Image from "next/image";

export type CalloutText = { t: string; d: string };

/**
 * Anchor points for each callout, as percentages of the machine photo
 * (public/home/app-phay-cnc.webp — spindle / coolant / ball screw / workholding / table).
 * `side` picks which side of the pad the label chip extends on desktop.
 */
export const CALLOUT_POINTS = [
  { x: 52, y: 34, side: "right" },
  { x: 62, y: 44, side: "left" },
  { x: 85, y: 20, side: "left" },
  { x: 45, y: 63, side: "left" },
  { x: 74, y: 84, side: "left" },
] as const;

/**
 * Machine photo annotated like an engineering figure: numbered solder-pad markers
 * pulse on the image, each wired to a label chip by a gold leader line (desktop).
 * On mobile the chips would collide, so pads stay numbered and a legend list below
 * the photo carries the text. Pure CSS — pads use animate-ping (hidden under
 * prefers-reduced-motion via motion-reduce), hovering a pad lights its chip.
 */
export default function MachineAnnotation({
  img,
  alt,
  caption,
  legendLabel,
  callouts,
}: {
  img: string;
  alt: string;
  caption: string;
  legendLabel: string;
  callouts: CalloutText[];
}) {
  return (
    <div>
      <div className="relative aspect-[3/2] overflow-hidden border border-[#2a2620] bg-ink-2">
        <Image
          src={img}
          alt={alt}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 60vw"
          className="object-cover"
        />
        {/* darken edges so pads and chips stay readable over the bright photo */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(10,10,8,.55) 0%,rgba(10,10,8,.08) 34%,transparent 60%)" }} aria-hidden="true"></div>
        {/* blueprint scan beam reading the machine */}
        <div className="pointer-events-none absolute inset-x-6 top-0 h-[2px] qs-scan" aria-hidden="true"></div>
        {/* registration frame — same corner ticks as the showreel screen */}
        <div className="pointer-events-none absolute inset-3 border border-white/10" aria-hidden="true">
          <span className="absolute -top-px -left-px w-3.5 h-3.5 border-t border-l border-gold-2"></span>
          <span className="absolute -top-px -right-px w-3.5 h-3.5 border-t border-r border-gold-2"></span>
          <span className="absolute -bottom-px -left-px w-3.5 h-3.5 border-b border-l border-gold-2"></span>
          <span className="absolute -bottom-px -right-px w-3.5 h-3.5 border-b border-r border-gold-2"></span>
        </div>

        {/* numbered solder pads wired to label chips */}
        {callouts.map((c, i) => {
          const p = CALLOUT_POINTS[i];
          if (!p) return null;
          const left = p.side === "left";
          return (
            <div
              key={c.t}
              className="group absolute z-10"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {/* transform centers the 28px pad on the anchor point; the label chain
                  then extends toward `side` without moving the pad off its target */}
              <div
                className={`relative flex items-center ${left ? "flex-row-reverse" : ""}`}
                style={{ transform: left ? "translate(calc(-100% + 14px), -50%)" : "translate(-14px, -50%)" }}
              >
                {/* pad — pulsing ring like the PCB solder pads */}
                <span className="relative grid place-items-center w-7 h-7 shrink-0">
                  <span className="motion-reduce:hidden absolute inset-0 rounded-full bg-gold-2/40 animate-ping" style={{ animationDuration: "2.6s", animationDelay: `${i * 0.5}s` }} aria-hidden="true"></span>
                  <span className="relative grid place-items-center w-7 h-7 rounded-full border border-gold-2 bg-ink/75 backdrop-blur-[2px] font-mono text-[10px] text-gold-2 transition-colors duration-300 group-hover:bg-gold-2 group-hover:text-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>
                {/* leader line + label chip — desktop only */}
                <span className="hidden md:block w-7 lg:w-10 h-px shrink-0 bg-gradient-to-r from-gold-2/80 to-gold-2/30" aria-hidden="true"></span>
                <span className={`hidden md:block w-[190px] lg:w-[215px] shrink-0 border border-white/15 bg-ink/80 backdrop-blur-[3px] px-3 py-2 transition-colors duration-300 group-hover:border-gold-2/70 ${left ? "text-right" : ""}`}>
                  <b className="block font-display font-semibold text-[12px] leading-snug text-white transition-colors duration-300 group-hover:text-gold-2">{c.t}</b>
                  <span className="block font-mono text-[10px] leading-[1.5] text-[#b8b4a6] mt-0.5">{c.d}</span>
                </span>
              </div>
            </div>
          );
        })}

        {/* live caption */}
        <div className="absolute left-4 bottom-3 flex items-center gap-2 font-mono text-[10px] tracking-[.16em] uppercase text-[#e8e6df]">
          <span className="qs-live-dot" aria-hidden="true"></span>{caption}
        </div>
      </div>

      {/* mobile legend — the label chips collapse into a numbered list */}
      <ol className="md:hidden mt-4 border border-[#2a2620] divide-y divide-[#2a2620]">
        <li className="px-4 py-2.5 font-mono text-[10px] tracking-[.18em] uppercase text-gold-2">{legendLabel}</li>
        {callouts.map((c, i) => (
          <li key={c.t} className="flex gap-3.5 px-4 py-3">
            <span className="grid place-items-center w-6 h-6 shrink-0 rounded-full border border-gold-2/70 font-mono text-[9px] text-gold-2">{String(i + 1).padStart(2, "0")}</span>
            <span className="min-w-0">
              <b className="block font-display font-semibold text-[13px] text-white leading-snug">{c.t}</b>
              <span className="block text-[12px] leading-[1.55] text-[#a8a499] mt-0.5">{c.d}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
