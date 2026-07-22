/**
 * Toolbar bar shared by the sub-type group list pages (machines, controllers,
 * servo). The filter chips are the control and sit on the left; the running
 * "Showing NN [/ MM] unit" count sits on the right (stacked above on mobile).
 * The `/ MM` total only appears once a filter is narrowing the list, so the
 * unfiltered count never just echoes the group total already shown in the page
 * header. Presentational and hook-free, so both server and client parents can
 * render it.
 */
export function ListToolbar({
  showing,
  count,
  total,
  unit,
  children,
}: {
  showing: string;
  /** Visible (post-filter) item count. */
  count: number;
  /** Full group total. */
  total: number;
  /** Localized noun: "models" / "machines" / "series". */
  unit: string;
  /** The filter chips row. */
  children: React.ReactNode;
}) {
  const isFiltered = count !== total;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center bg-white border border-line px-4 py-3.5 sm:px-6 sm:py-4 mb-6">
      {children}
      <span className="font-mono text-meta tracking-widest text-muted shrink-0">
        {showing} <b className="text-ink font-semibold">{String(count).padStart(2, "0")}</b>
        {isFiltered ? <> / <b className="text-ink font-semibold">{String(total).padStart(2, "0")}</b></> : null} {unit}
      </span>
    </div>
  );
}
