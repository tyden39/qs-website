import type { KitIcon } from "@/data/products";

/**
 * Technical line-art icons for the components shipped inside a machine kit.
 * Drawn in the site's industrial datasheet palette — brushed-grey casings,
 * steel-navy screens/bodies, and a restrained gold accent — so the bundle grid
 * reads as engineering schematics rather than generic product thumbnails.
 *
 * Gradients are namespaced per `<svg>` via the `gid` prefix so multiple icons
 * can render on one page without colliding `<defs>` ids.
 */

type Props = { type: KitIcon; className?: string };

const STEEL_FROM = "#23425c";
const STEEL_TO = "#0b1b29";
const CASE_FROM = "#edebE5";
const CASE_TO = "#b9b5a9";
const STROKE = "#8a867d";
const GOLD = "#e8c878";

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-case`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={CASE_FROM} />
        <stop offset="1" stopColor={CASE_TO} />
      </linearGradient>
      <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={STEEL_FROM} />
        <stop offset="1" stopColor={STEEL_TO} />
      </linearGradient>
    </defs>
  );
}

function Controller({ id }: { id: string }) {
  return (
    <>
      <Defs id={id} />
      <rect x="10" y="12" width="100" height="60" rx="4" fill={`url(#${id}-case)`} stroke={STROKE} />
      <rect x="17" y="19" width="52" height="40" rx="2" fill={`url(#${id}-steel)`} />
      <text x="22" y="30" fontFamily="JetBrains Mono, monospace" fontSize="5.5" fill={GOLD}>QS COORD</text>
      <text x="22" y="40" fontFamily="JetBrains Mono, monospace" fontSize="6.5" fill="#fff">X 279.030</text>
      <text x="22" y="49" fontFamily="JetBrains Mono, monospace" fontSize="6.5" fill="#fff">Y 235.003</text>
      <g fill="#7d7a70">
        {[0, 1, 2, 3].map((c) =>
          [0, 1, 2, 3].map((r) => (
            <rect key={`${c}-${r}`} x={76 + c * 8} y={20 + r * 9} width="6" height="6" rx="1" />
          )),
        )}
      </g>
    </>
  );
}

function Drive({ id }: { id: string }) {
  return (
    <>
      <Defs id={id} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${20 + i * 28} 10)`}>
          <rect width="22" height="64" rx="3" fill={`url(#${id}-steel)`} stroke="#0a1620" />
          <rect x="4" y="6" width="14" height="10" rx="1.5" fill="#0a1620" />
          <circle cx="11" cy="11" r="1.6" fill={GOLD} />
          <rect x="6" y="24" width="10" height="2" rx="1" fill="#3a5670" />
          <rect x="6" y="30" width="10" height="2" rx="1" fill="#3a5670" />
          <rect x="6" y="52" width="10" height="6" rx="1" fill="#11283b" />
        </g>
      ))}
    </>
  );
}

function Motor({ id }: { id: string }) {
  return (
    <>
      <Defs id={id} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${14 + i * 33} 22)`}>
          <rect x="0" y="0" width="14" height="40" rx="2" fill="#0a1620" />
          <rect x="14" y="6" width="22" height="28" rx="3" fill={`url(#${id}-case)`} stroke={STROKE} />
          <rect x="36" y="14" width="9" height="12" rx="1.5" fill={`url(#${id}-steel)`} />
          <rect x="45" y="18" width="6" height="4" rx="1" fill="#7d7a70" />
          <line x1="20" y1="6" x2="20" y2="34" stroke={STROKE} strokeWidth="0.8" />
          <line x1="30" y1="6" x2="30" y2="34" stroke={STROKE} strokeWidth="0.8" />
        </g>
      ))}
    </>
  );
}

function Psu({ id }: { id: string }) {
  return (
    <>
      <Defs id={id} />
      <rect x="16" y="16" width="88" height="52" rx="3" fill={`url(#${id}-case)`} stroke={STROKE} />
      <g stroke="#9a968c" strokeWidth="1.4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1="22" y1={24 + i * 7} x2="62" y2={24 + i * 7} />
        ))}
      </g>
      <rect x="70" y="24" width="28" height="20" rx="1.5" fill="#f3e6b6" stroke="#caa84e" />
      <text x="84" y="37" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="5" fill="#7a6324">24V</text>
      <g fill="#11283b">
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={72 + i * 6} y="52" width="3" height="10" rx="0.5" />
        ))}
      </g>
    </>
  );
}

function Mpg({ id }: { id: string }) {
  return (
    <>
      <Defs id={id} />
      <rect x="34" y="8" width="52" height="34" rx="6" fill={`url(#${id}-case)`} stroke={STROKE} />
      <circle cx="48" cy="22" r="6" fill={`url(#${id}-steel)`} />
      <circle cx="48" cy="22" r="2" fill={GOLD} />
      <circle cx="72" cy="22" r="6" fill="#0a1620" />
      <line x1="72" y1="18" x2="72" y2="26" stroke={GOLD} strokeWidth="1.4" />
      <circle cx="60" cy="58" r="16" fill="none" stroke={STROKE} strokeWidth="3" />
      <circle cx="60" cy="58" r="11" fill={`url(#${id}-case)`} stroke={STROKE} />
      <circle cx="60" cy="50" r="3" fill="#0a1620" />
      <line x1="60" y1="42" x2="60" y2="34" stroke={STROKE} strokeWidth="2" />
    </>
  );
}

function IoBoard({ id }: { id: string }) {
  return (
    <>
      <Defs id={id} />
      <rect x="12" y="12" width="96" height="60" rx="3" fill="#1f5a3a" stroke="#123a25" />
      <rect x="12" y="12" width="96" height="60" rx="3" fill="none" stroke="#2f7a4f" strokeWidth="0.6" />
      <rect x="20" y="22" width="26" height="20" rx="1.5" fill="#0c1f14" />
      <text x="33" y="34" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="5" fill={GOLD}>I/O</text>
      <rect x="54" y="22" width="16" height="16" rx="1" fill="#11281a" stroke="#2f7a4f" strokeWidth="0.6" />
      <g fill="#caa84e">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={20 + i * 11} y="58" width="7" height="6" rx="0.5" />
        ))}
      </g>
      <circle cx="82" cy="28" r="2" fill={GOLD} />
      <circle cx="92" cy="28" r="2" fill="#5ab8e0" />
      <g stroke="#2f7a4f" strokeWidth="0.8" fill="none">
        <path d="M46 32 H54" />
        <path d="M70 30 H80 V44" />
      </g>
    </>
  );
}

function ToolSetter({ id }: { id: string }) {
  return (
    <>
      <Defs id={id} />
      {/* magnetic base */}
      <ellipse cx="60" cy="72" rx="30" ry="7" fill="#0a1620" />
      <rect x="34" y="50" width="52" height="20" rx="3" fill={`url(#${id}-steel)`} stroke="#0a1620" />
      {/* sensor body */}
      <rect x="46" y="20" width="28" height="32" rx="3" fill={`url(#${id}-case)`} stroke={STROKE} />
      <circle cx="60" cy="20" r="9" fill={`url(#${id}-steel)`} stroke={STROKE} />
      <circle cx="60" cy="20" r="3.4" fill={GOLD} />
      {/* side connector */}
      <rect x="30" y="34" width="16" height="7" rx="1.5" fill="#11283b" />
      <circle cx="33" cy="37.5" r="2.4" fill="#3a5670" />
    </>
  );
}

function Probe({ id }: { id: string }) {
  return (
    <>
      <Defs id={id} />
      {/* shank */}
      <rect x="52" y="8" width="16" height="16" rx="2" fill={`url(#${id}-steel)`} stroke="#0a1620" />
      {/* body */}
      <rect x="44" y="24" width="32" height="30" rx="4" fill={`url(#${id}-case)`} stroke={STROKE} />
      <circle cx="60" cy="39" r="4" fill={GOLD} />
      {/* stylus + ruby ball */}
      <line x1="60" y1="54" x2="60" y2="70" stroke={STROKE} strokeWidth="2.4" />
      <circle cx="60" cy="74" r="5" fill="#c8443a" stroke="#8a2a23" />
    </>
  );
}

const RENDERERS: Record<KitIcon, (p: { id: string }) => React.ReactElement> = {
  controller: Controller,
  drive: Drive,
  motor: Motor,
  psu: Psu,
  mpg: Mpg,
  ioboard: IoBoard,
  toolsetter: ToolSetter,
  probe: Probe,
};

export function KitComponentIcon({ type, className }: Props) {
  const Renderer = RENDERERS[type];
  const id = `kit-${type}`;
  return (
    <svg viewBox="0 0 120 84" className={className} role="presentation" aria-hidden="true">
      <Renderer id={id} />
    </svg>
  );
}
