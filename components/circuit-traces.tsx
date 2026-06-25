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

// Large 560×560 tile so the routing reads as organic and rarely repeats; sparse, varied traces.
const TILE = 560;
const traces = [
  "M0 70 H150 V210 H300 V120 H440 V60 H560",
  "M90 0 V70",
  "M300 0 V60 H410",
  "M0 300 H80 V430 H230 V330 H370",
  "M230 560 V470 H400 V380 H560",
  "M150 210 V300",
  "M440 120 V250 H520 V450 H560",
  "M0 490 H120 V560",
  "M370 330 V440 H470",
  "M520 0 V40 H560",
];
const flowIdx = new Set([0, 3, 4, 6]);
const pads: [number, number][] = [
  [150, 70], [150, 210], [300, 210], [300, 120], [440, 120], [440, 60],
  [90, 70], [410, 60], [80, 300], [80, 430], [230, 430], [230, 330],
  [370, 330], [400, 470], [520, 250], [520, 450], [120, 490], [470, 440],
];

// Stable unique id per instance (one render each in static export).
let counter = 0;

export default function CircuitTraces({
  variant = "dark",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const id = `pcb-${(counter += 1)}`;
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
