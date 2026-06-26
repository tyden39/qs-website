"use client";

import { useId } from "react";
import type { CSSProperties } from "react";

/**
 * Decorative PCB trace network — the brand signature (QS designs board mạch).
 * Rendered as a repeating SVG <pattern> at native pixel scale, so it stays crisp and
 * detailed at any container size (no blur from stretching one large copy). A few traces
 * carry an animated gold "current" pulse and the solder pads gently breathe; orthogonal
 * traces use crispEdges for razor-sharp lines. Honors prefers-reduced-motion (globals.css).
 * Always decorative / aria-hidden.
 */
type Variant = "dark" | "light";

// 560×560 tile engineered to tile SEAMLESSLY (toroidal): every point where a trace
// touches an edge has a matching point at the same coordinate on the opposite edge,
// so horizontal/vertical neighbours connect with no visible seam. Moderate density —
// 3 horizontal spanners (matched left↔right), 2 vertical spanners (matched top↔bottom),
// and 2 internal stubs for organic detail.
const TILE = 560;
const traces = [
  // Horizontal spanners — enter at x=0 and exit at x=560 at the SAME y.
  "M0 90 H120 V200 H260 V120 H400 V90 H560",   // y=90
  "M0 300 H100 V400 H250 V300 H560",            // y=300
  "M0 470 H150 V370 H320 V470 H560",            // y=470
  // Vertical spanners — enter at y=0 and exit at y=560 at the SAME x.
  "M180 0 V140 H320 V300 H180 V560",            // x=180
  "M380 560 V420 H260 V300 H380 V0",            // x=380
  // Internal stubs — no edge contact, branch off existing junctions.
  "M260 200 H360 V160",
  "M250 400 H360 V470",
];
// Animate a sparse subset only (UX: 1–2 key motions per view) — two horizontals + one vertical.
const flowIdx = new Set([0, 2, 4]);
const pads: [number, number][] = [
  [120, 90], [260, 200], [400, 120], [100, 400], [250, 300], [150, 470],
  [320, 370], [180, 140], [320, 300], [380, 420], [260, 420], [360, 160],
];

export default function CircuitTraces({
  variant = "dark",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  // useId() is stable across server render and client hydration (derived from
  // tree position), so the pattern id matches and there is no hydration mismatch.
  // Strip the colons React emits so the id is safe inside the url(#…) reference.
  const id = `pcb-${useId().replace(/:/g, "")}`;
  const stroke = variant === "dark" ? "#423d30" : "#c4b78f";
  const flow = "#e8c878";

  return (
    <svg className={className} width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={id} width={TILE} height={TILE} patternUnits="userSpaceOnUse">
          <g stroke={stroke} strokeWidth="1.3" fill="none" shapeRendering="crispEdges" className="qs-pcb-trace">
            {traces.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <g stroke={flow} strokeWidth="1.7" fill="none" className="qs-pcb-trace qs-pcb-flow">
            {traces
              .filter((_, i) => flowIdx.has(i))
              .map((d, i) => (
                <path key={i} d={d} style={{ animationDelay: `${i * 1.3}s` } as CSSProperties} />
              ))}
          </g>
          {pads.map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="2.6"
              fill={flow}
              className="qs-pcb-pad"
              style={{ animationDelay: `${(i % 6) * 0.55}s` } as CSSProperties}
            />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
