import Image from "next/image";
import { LightboxTrigger, type LightboxShot } from "@/components/media/image-lightbox";
import type { SheetBlockView } from "@/lib/data/series";

/**
 * Renders a re-authored spec sheet — the ordered `specSheet` / `accessorySheet`
 * blocks that replace a manufacturer plate strip. Text and tables are native,
 * selectable, translatable HTML; genuine artwork (dimension drawings, cable
 * illustrations) rides through as `image` blocks so the drawing is shown as-is,
 * never redrawn. Every image across the sheet shares one lightbox group so the
 * zoom experience matches the plate strip it stands in for.
 */
export function SeriesSpecSheet({
  blocks,
  zoomLabel,
}: {
  blocks: SheetBlockView[];
  zoomLabel: string;
}) {
  // One lightbox group for every image in the sheet, in document order.
  const shots: LightboxShot[] = blocks
    .filter((b): b is Extract<SheetBlockView, { kind: "image" }> => b.kind === "image")
    .map((b) => ({ src: b.src, w: b.w, h: b.h, alt: b.alt }));

  let imgIndex = -1;

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "heading":
            return (
              <div key={i} className={i === 0 ? "" : "mt-2"}>
                <h3 className="font-display text-subhead font-bold tracking-[-.02em] text-ink m-0">
                  {block.text}
                </h3>
                {block.sub && (
                  <p className="mt-1.5 m-0 font-mono text-label tracking-[.1em] uppercase text-gold-1">
                    {block.sub}
                  </p>
                )}
              </div>
            );
          case "note":
            return (
              <p key={i} className="m-0 text-meta leading-[1.7] text-muted max-w-[80ch]">
                {block.text}
              </p>
            );
          case "image": {
            imgIndex += 1;
            return (
              <SheetImage
                key={i}
                block={block}
                shots={shots}
                index={imgIndex}
                zoomLabel={zoomLabel}
              />
            );
          }
          case "naming":
            return <SheetNaming key={i} block={block} />;
          case "specList":
            return <SheetSpecList key={i} block={block} />;
          case "paramTable":
            return <SheetParamTable key={i} block={block} />;
          case "cableTable":
            return (
              <SheetCableTable
                key={i}
                block={block}
                shots={shots}
                zoomLabel={zoomLabel}
                imageIndexOf={(src) => shots.findIndex((s) => s.src === src)}
              />
            );
          case "dataTable":
            return <SheetDataTable key={i} block={block} />;
          case "cardGrid":
            return <SheetCardGrid key={i} block={block} />;
        }
      })}
    </div>
  );
}

function SheetImage({
  block,
  shots,
  index,
  zoomLabel,
}: {
  block: Extract<SheetBlockView, { kind: "image" }>;
  shots: LightboxShot[];
  index: number;
  zoomLabel: string;
}) {
  return (
    <figure className="m-0 border border-line bg-white">
      {block.caption && (
        <figcaption className="flex items-baseline gap-2 border-b border-line px-4 py-2.5 bg-paper">
          <span className="font-display text-meta font-bold tracking-[-.01em] text-ink">
            {block.caption}
          </span>
        </figcaption>
      )}
      <LightboxTrigger
        group={shots}
        index={index}
        ariaLabel={`${zoomLabel} — ${block.alt}`}
        className="block w-full"
      >
        <Image
          src={block.src}
          alt={block.alt}
          width={block.w}
          height={block.h}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="w-full h-auto"
        />
      </LightboxTrigger>
    </figure>
  );
}

/**
 * Model-code decode. The manufacturer's leader-line layout needs fixed pixel
 * positions that do not survive a phone viewport, so the code is printed once
 * with each meaningful chunk marked, then decoded as numbered cards that reflow
 * — same mapping, responsive, and left in the HTML for search.
 */
function SheetNaming({ block }: { block: Extract<SheetBlockView, { kind: "naming" }> }) {
  return (
    <div className="border border-line bg-paper p-6 lg:p-8">
      <div className="flex flex-wrap items-end gap-x-1.5 gap-y-4">
        {block.branches.map((br, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="font-display text-title sm:text-subhead font-bold tracking-[-.01em] text-ink whitespace-nowrap">
              {br.seg}
            </span>
            <span className="w-full h-px bg-gold" aria-hidden="true" />
            <span
              className="font-mono text-label-xs tracking-[.08em] text-gold-1 tabular-nums"
              aria-hidden="true"
            >
              {i + 1}
            </span>
          </div>
        ))}
      </div>

      <span className="sr-only">{block.code}</span>

      <div className="mt-7 grid gap-px bg-line border border-line sm:grid-cols-2 lg:grid-cols-3">
        {block.branches.map((br, i) => (
          <div key={i} className="bg-paper p-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-label-xs text-gold-1 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-meta font-bold tracking-[-.01em] text-ink">
                {br.seg}
              </span>
            </div>
            <span className="text-meta leading-[1.55] text-[#3a3a3a]">{br.label}</span>
            {br.options && br.options.length > 0 && (
              <ul className="mt-1 flex flex-col gap-1 m-0 p-0 list-none">
                {br.options.map((o, oi) => (
                  <li key={oi} className="flex gap-2 text-label leading-[1.5] text-muted">
                    <span aria-hidden className="text-gold-1 shrink-0">
                      ·
                    </span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const V_LABEL_CLASS =
  "bg-[#eef1f4] px-2 py-3 align-middle text-center font-mono text-label-xs tracking-[.06em] uppercase text-[#5a6472] w-[52px] sm:w-[64px] leading-[1.3]";
const TH_CLASS =
  "bg-[#11120f] px-4 py-3 text-left font-mono text-label-xs tracking-[.08em] uppercase text-gold-2";

/** Item/value spec plate (the drive's general-spec sheet): a left item column
 *  and a wide value column, with runs of rows sharing a vertical group label. */
function SheetSpecList({ block }: { block: Extract<SheetBlockView, { kind: "specList" }> }) {
  const hasV = block.groups.some((g) => g.vlabel);
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={TH_CLASS} colSpan={hasV ? 2 : 1}>
              {block.itemHeader}
            </th>
            <th className={TH_CLASS}>{block.valueHeader}</th>
          </tr>
        </thead>
        <tbody>
          {block.groups.map((g, gi) =>
            g.rows.map((row, ri) => (
              <tr key={`${gi}-${ri}`} className="border-t border-line align-middle">
                {g.vlabel && ri === 0 && (
                  <td rowSpan={g.rows.length} className={V_LABEL_CLASS}>
                    {g.vlabel}
                  </td>
                )}
                <td
                  colSpan={hasV && !g.vlabel ? 2 : 1}
                  className="px-4 py-2.5 bg-[#f3f6f8] font-semibold text-meta tracking-[-.005em] text-ink align-middle w-[34%] min-w-[140px]"
                >
                  {row.item}
                </td>
                <td className="px-4 py-2.5 text-meta leading-[1.6] text-[#33302a] align-middle">
                  {row.lines.map((line, li) => (
                    <span key={li} className={li > 0 ? "block mt-1 text-[#5a5650]" : "block"}>
                      {line}
                    </span>
                  ))}
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Transposed parameter table (motor ratings): item rows down the left, one
 *  column per model, with merged ratings and a vertical brake group. */
function SheetParamTable({ block }: { block: Extract<SheetBlockView, { kind: "paramTable" }> }) {
  const hasV = block.groups.some((g) => g.vlabel);
  const modelCount = block.models.length;
  const modelTh = block.models.map((m) => (
    <th
      key={m}
      className="bg-[#1b1c17] px-4 py-2.5 text-center font-display text-meta font-bold tracking-[-.01em] text-white whitespace-nowrap"
    >
      {m}
    </th>
  ));
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full border-collapse">
        <thead>
          {block.modelHeader ? (
            <>
              <tr>
                <th className={TH_CLASS} colSpan={hasV ? 2 : 1} rowSpan={2}>
                  {block.itemHeader ?? ""}
                </th>
                <th className={TH_CLASS} colSpan={modelCount}>
                  {block.modelHeader}
                </th>
              </tr>
              <tr>{modelTh}</tr>
            </>
          ) : (
            <tr>
              <th className={TH_CLASS} colSpan={hasV ? 2 : 1}>
                {block.itemHeader ?? ""}
              </th>
              {modelTh}
            </tr>
          )}
        </thead>
        <tbody>
          {block.groups.map((g, gi) =>
            g.rows.map((row, ri) => (
              <tr key={`${gi}-${ri}`} className="border-t border-line align-middle">
                {g.vlabel && ri === 0 && (
                  <td rowSpan={g.rows.length} className={V_LABEL_CLASS}>
                    {g.vlabel}
                  </td>
                )}
                <td
                  colSpan={hasV && !g.vlabel ? 2 : 1}
                  className="px-4 py-2 bg-[#f3f6f8] text-meta text-ink align-middle whitespace-nowrap"
                >
                  <span className="font-semibold tracking-[-.005em]">{row.label}</span>
                  {row.unit && (
                    <span className="ml-1 font-mono text-label-xs text-muted">({row.unit})</span>
                  )}
                </td>
                {row.cells.map((cell, ci) => {
                  const v = typeof cell === "string" ? cell : cell.v;
                  const cs = typeof cell === "string" ? 1 : cell.cs ?? 1;
                  return (
                    <td
                      key={ci}
                      colSpan={cs}
                      className="px-4 py-2 text-center text-meta text-[#33302a] tabular-nums whitespace-nowrap"
                    >
                      {v}
                    </td>
                  );
                })}
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Option-board / accessory catalogue rendered as a responsive card grid. Each
 *  card shows a cropped thumbnail on a neutral panel, a name, a short
 *  description, and language-neutral tag badges (part number, mounting slot). */
function SheetCardGrid({ block }: { block: Extract<SheetBlockView, { kind: "cardGrid" }> }) {
  return (
    <div className="grid gap-px bg-line border border-line sm:grid-cols-2 lg:grid-cols-3">
      {block.items.map((it, i) => (
        <div key={i} className="bg-paper p-4 flex flex-col gap-3">
          <div className="flex items-center justify-center border border-line bg-white p-3 h-[150px]">
            <Image
              src={it.src}
              alt={it.title}
              width={it.w}
              height={it.h}
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              className="max-h-full w-auto object-contain"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <h4 className="m-0 font-display text-meta font-bold tracking-[-.01em] text-ink">
              {it.title}
            </h4>
            {it.desc && <p className="m-0 text-label leading-[1.55] text-muted">{it.desc}</p>}
            {it.tags && it.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {it.tags.map((t, ti) => (
                  <span
                    key={ti}
                    className="inline-block border border-line bg-[#f3f6f8] px-2 py-0.5 font-mono text-label-xs tracking-[.04em] text-[#5a6472]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Generic multi-column text table (fault codes, parameter-function grids): a
 *  header row of column labels, then wrapping text cells. The first column is
 *  emphasized as the row key; a cell may span columns via `cs`. */
function SheetDataTable({ block }: { block: Extract<SheetBlockView, { kind: "dataTable" }> }) {
  return (
    <div className="flex flex-col gap-3">
      {block.title && (
        <p className="m-0 font-mono text-label tracking-[.1em] uppercase text-gold-1">
          {block.title}
        </p>
      )}
      <div className="overflow-x-auto border border-line">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {block.cols.map((c, ci) => (
                <th key={ci} className={TH_CLASS}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri} className="border-t border-line align-top">
                {row.cells.map((cell, ci) => (
                  <td
                    key={ci}
                    colSpan={cell.cs ?? 1}
                    className={
                      ci === 0
                        ? "px-4 py-2.5 bg-[#f3f6f8] font-semibold text-meta tracking-[-.005em] text-ink align-top whitespace-nowrap"
                        : "px-4 py-2.5 text-meta leading-[1.6] text-[#33302a] align-top"
                    }
                  >
                    {cell.text}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Cable reference table: text columns (model, brake bracket, fit range) are
 *  native HTML; the "reference style" column holds the cropped cable drawing. */
function SheetCableTable({
  block,
  shots,
  zoomLabel,
  imageIndexOf,
}: {
  block: Extract<SheetBlockView, { kind: "cableTable" }>;
  shots: LightboxShot[];
  zoomLabel: string;
  imageIndexOf: (src: string) => number;
}) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={`${TH_CLASS} text-center`}>{block.cols.model}</th>
            <th className={`${TH_CLASS} text-center`}>{block.cols.style}</th>
            <th className={`${TH_CLASS} text-center`}>{block.cols.fit}</th>
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, ri) => (
            <tr key={ri} className="border-t border-line align-middle">
              <td className="px-4 py-3 bg-[#f3f6f8] align-middle whitespace-nowrap">
                <span className="font-display text-meta font-bold tracking-[-.01em] text-ink">
                  {row.model}
                </span>
                {row.bracket && (
                  <span className="mt-1 block font-mono text-label-xs tracking-[.06em] uppercase text-muted">
                    {row.bracket}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 align-middle">
                <div className="flex flex-col gap-2">
                  {row.images.map((im) => {
                    const idx = imageIndexOf(im.src);
                    return (
                      <LightboxTrigger
                        key={im.src}
                        group={shots}
                        index={idx}
                        ariaLabel={`${zoomLabel} — ${row.model}`}
                        className="block w-full max-w-[420px]"
                      >
                        <Image
                          src={im.src}
                          alt={`${row.model}`}
                          width={im.w}
                          height={im.h}
                          sizes="420px"
                          className="w-full h-auto"
                        />
                      </LightboxTrigger>
                    );
                  })}
                </div>
              </td>
              {row.fit && (
                <td
                  rowSpan={row.fitRows ?? 1}
                  className="px-4 py-3 text-center align-middle font-display text-meta font-semibold tracking-[-.01em] text-ink whitespace-pre-line"
                >
                  {row.fit}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
