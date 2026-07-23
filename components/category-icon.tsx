import type { SVGProps } from "react";

/**
 * Line icons (24×24, stroke = currentColor) for the catalogue's top-level
 * sections and category groups. Keys are stable slugs shared by the header nav
 * and the catalogue sidebar tree, so one glyph represents a category everywhere
 * it appears. The caller sizes and colours the icon via `className`.
 */
const PATHS: Record<string, React.ReactNode> = {
  // ── Top-level sections ────────────────────────────────────────────────
  electronics: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3" />
    </>
  ),
  machine: (
    <>
      <path d="M4 20h16" />
      <rect x="6" y="4" width="12" height="4" rx="1" />
      <path d="M12 8v4m0 0-2.5 4m2.5-4 2.5 4" />
    </>
  ),
  applications: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </>
  ),
  services: (
    <>
      <path d="M14.7 6.3a3.5 3.5 0 0 0-4.6 4.6L4 17l3 3 6.1-6.1a3.5 3.5 0 0 0 4.6-4.6l-2.3 2.3-2-2 2.3-2.3Z" />
    </>
  ),
  downloads: (
    <>
      <path d="M12 3v11m0 0-4-4m4 4 4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </>
  ),
  about: (
    <>
      <path d="M4 20V6l8-3 8 3v14" />
      <path d="M9 20v-4h6v4" />
      <path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01" />
    </>
  ),
  news: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="1" />
      <path d="M8 9h8M8 12h8M8 15h5" />
    </>
  ),
  contact: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),

  // ── Electronics groups ────────────────────────────────────────────────
  controllers: (
    <>
      <rect x="8" y="8" width="8" height="8" rx="1" />
      <path d="M12 8V4M12 20v-4M8 12H4M20 12h-4M12 11v2M11 12h2" />
    </>
  ),
  servo: (
    <>
      <rect x="4" y="7" width="11" height="10" rx="1" />
      <path d="M15 10h4v4h-4M4 12H2" />
    </>
  ),
  inverter: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="1" />
      <path d="M6 13c1.4-3.5 2.8-3.5 4.2 0s2.8 3.5 4.2 0" />
    </>
  ),
  dnc: (
    <>
      <rect x="3" y="4" width="7" height="6" rx="1" />
      <rect x="14" y="14" width="7" height="6" rx="1" />
      <path d="M10 7h4a3 3 0 0 1 3 3v4" />
    </>
  ),
  accessory: (
    <>
      <path d="M9 3v4M15 3v4M7 7h10v3a5 5 0 0 1-10 0V7ZM12 15v6" />
    </>
  ),

  // ── Machine-building groups ───────────────────────────────────────────
  automation: (
    <>
      <path d="M5 21v-6l6-3.2" />
      <circle cx="11" cy="8" r="2" />
      <path d="M11.8 9.8 16 12v4" />
      <circle cx="5" cy="21" r="1" />
    </>
  ),
  inspection: (
    <>
      <path d="M12 4v16M7 20h10" />
      <path d="m12 7-7 3m7-3 7 3" />
      <path d="M2 13a3 3 0 0 0 6 0L5 9Zm14 0a3 3 0 0 0 6 0l-3-4Z" />
    </>
  ),

  // ── Applications: materials ───────────────────────────────────────────
  metal: (
    <>
      <path d="M3 9l4-3h10l4 3-4 3H7L3 9Z" />
      <path d="M7 12v4h10v-4" />
    </>
  ),
  wood: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="4" />
      <ellipse cx="7" cy="12" rx="2" ry="2.4" />
      <path d="M7 12h.01" />
    </>
  ),
  stone: (
    <>
      <path d="M5 14.5 8 7l5-2 6 5-2 6.5-8 2-4-4Z" />
    </>
  ),
  jewelry: (
    <>
      <path d="M6 3h12l3 6-9 12L3 9l3-6Z" />
      <path d="M3 9h18M9 3 6 9l6 12 6-12-3-6" />
    </>
  ),

  // ── Sub-types (deepest flyout) ────────────────────────────────────────
  motion: (
    <>
      <circle cx="18" cy="12" r="2.5" />
      <path d="M3 12h9.5m0 0-3-3m3 3-3 3" />
    </>
  ),
  cnc: (
    <>
      <path d="M5 5v14h14" />
      <path d="m5 19 14-14M19 5v5M19 5h-5" />
    </>
  ),
  robot: (
    <>
      <circle cx="6" cy="19" r="1.5" />
      <path d="M6 19v-4.5l5-2.5 2.5-4" />
      <path d="M13.5 12l3.5 1.5V17" />
      <circle cx="11" cy="12" r="1" />
    </>
  ),
  cobot: (
    <>
      <rect x="8" y="3" width="4" height="4" rx="2" />
      <path d="M10 7v3l-4 3v5" />
      <path d="M10 10l4.5 2.5V17" />
    </>
  ),
  milling: (
    <>
      <path d="M9 3h6v9l-3 8-3-8V3Z" />
      <path d="M9 7h6M9 10h6" />
    </>
  ),
  router: (
    <>
      <path d="M8 3h8v7l-4 3-4-3V3Z" />
      <path d="M12 13v8" />
    </>
  ),
};

/**
 * Renders the category glyph for `name`, or nothing when the key is unknown so
 * a missing icon degrades to a text-only menu row rather than a broken box.
 */
export function CategoryIcon({
  name,
  ...rest
}: { name: string } & SVGProps<SVGSVGElement>) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {path}
    </svg>
  );
}
