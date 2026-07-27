/**
 * Thin-stroke pictograms for the sub-type filter chips on the group list
 * pages, keyed by the catalogue's type ids. One glyph per id so a chip row
 * scans faster than labels alone: XY axes for motion control, a spindle over
 * the table for CNC (machines and controllers share the id and the glyph), a
 * jointed arm for robot, an arm working beside a person for cobot, a conveyor
 * for automation, a magnifier for inspection, a drive enclosure for servo
 * drivers, a motor with output shaft, and a plug for cables. Stroke-only at
 * 1.5px to match the site's mono-line iconography. Unknown ids render nothing,
 * so chips degrade to plain labels if a new sub-type ships without a glyph.
 */
const FILTER_ICON_PATHS: Record<string, React.ReactNode> = {
  motion: (
    <>
      <path d="M4 16 L16 16 M13 13.5 L16 16 L13 18.5 M4 16 L4 4 M1.5 6.5 L4 4 L6.5 6.5" />
      <circle cx="10" cy="10" r="1.4" />
    </>
  ),
  cnc: (
    <>
      <rect x="7" y="3" width="6" height="7" />
      <path d="M8.5 10 L10 14 L11.5 10 M3 17 L17 17" />
    </>
  ),
  robot: (
    <>
      <path d="M3 17 L9 17 M6 17 L6 13 L10 9 L14 8 M14 8 L16.5 5.5 M14 8 L16.5 10.5" />
      <circle cx="6" cy="13" r="1.6" />
      <circle cx="10" cy="9" r="1.6" />
    </>
  ),
  cobot: (
    <>
      <path d="M2.5 17 L7.5 17 M5 17 L5 12.5 L9 10.5 L12 11" />
      <circle cx="5" cy="12.5" r="1.4" />
      <circle cx="15" cy="6" r="1.8" />
      <path d="M15 7.8 L15 12.5 M15 12.5 L13.2 16.5 M15 12.5 L16.8 16.5 M15 9.5 L12 11" />
    </>
  ),
  automation: (
    <>
      <rect x="7.5" y="4" width="5" height="5" />
      <path d="M3.5 12 L16.5 12" />
      <circle cx="6" cy="14.5" r="1.6" />
      <circle cx="14" cy="14.5" r="1.6" />
    </>
  ),
  inspection: (
    <>
      <circle cx="8.5" cy="8.5" r="4.8" />
      <path d="M12 12 L16.5 16.5 M6.5 8.5 L8 10 L10.5 7" />
    </>
  ),
  driver: (
    <>
      <rect x="5" y="3.5" width="10" height="13" />
      <path d="M7.5 6.5 L12.5 6.5 M7.5 9 L12.5 9" />
      <circle cx="10" cy="13.5" r="0.9" />
    </>
  ),
  motor: (
    <>
      <circle cx="8" cy="10" r="4.5" />
      <circle cx="8" cy="10" r="1.5" />
      <path d="M12.5 10 L17 10" />
    </>
  ),
  cable: (
    <>
      <path d="M3 10 L6.5 10" />
      <rect x="6.5" y="6.5" width="5" height="7" />
      <path d="M11.5 8 L14.5 8 M11.5 12 L14.5 12" />
    </>
  ),
};

export function FilterIcon({ id, size = 13 }: { id: string; size?: number }) {
  const paths = FILTER_ICON_PATHS[id];
  if (!paths) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {paths}
    </svg>
  );
}
