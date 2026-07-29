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
  // One lightbox group for every image the sheet renders, in document order —
  // standalone plates, side-by-side rows and the cable-table drawings alike, so
  // zooming any one of them steps through the whole sheet.
  const shots: LightboxShot[] = blocks.flatMap((b) => {
    switch (b.kind) {
      case "image":
        return [{ src: b.src, w: b.w, h: b.h, alt: b.alt }];
      case "imageRow":
        return b.images.map((im) => ({ src: im.src, w: im.w, h: im.h, alt: im.alt }));
      case "cableTable":
        return b.rows.flatMap((r) =>
          r.images.map((im) => ({ src: im.src, w: im.w, h: im.h, alt: r.model })),
        );
      default:
        return [];
    }
  });

  // Sheet images are distinct files, so the src identifies the shot; this keeps
  // the index lookup a pure read rather than a counter mutated during render.
  const indexOf = (src: string) => shots.findIndex((s) => s.src === src);

  return (
    <div className="flex flex-col gap-6 sm:gap-7">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "heading":
            // Headings open a section, so they sit further from what precedes
            // them than the blocks inside the section sit from each other.
            return (
              <div key={i} className={i === 0 ? "" : "mt-5 sm:mt-7"}>
                <h3 className="font-display text-subhead font-bold tracking-[-.02em] text-ink m-0">
                  {block.text}
                </h3>
                {block.sub && (
                  <p className="mt-1.5 m-0 font-mono text-meta tracking-[.1em] uppercase text-gold-1">
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
          case "bullets":
            return (
              <div key={i} className="flex flex-col gap-3">
                {block.title && (
                  <p className="m-0 font-mono text-label tracking-[.1em] uppercase text-gold-1">
                    {block.title}
                  </p>
                )}
                <ul className="flex flex-col gap-2.5 m-0 p-0 list-none max-w-[86ch]">
                  {block.items.map((item, bi) => (
                    <li key={bi} className="flex gap-2.5 text-meta leading-[1.7] text-[#3a3a3a]">
                      <span aria-hidden className="text-gold-1 shrink-0">
                        ▸
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          case "featureGroups":
            return <SheetFeatureGroups key={i} block={block} />;
          case "image":
            return (
              <SheetImage
                key={i}
                block={block}
                shots={shots}
                index={indexOf(block.src)}
                zoomLabel={zoomLabel}
              />
            );
          case "imageRow":
            return (
              <div key={i} className="grid gap-4 sm:gap-6 md:grid-cols-2">
                {block.images.map((im) => (
                  <SheetImage
                    key={im.src}
                    block={{ kind: "image", ...im }}
                    shots={shots}
                    index={indexOf(im.src)}
                    zoomLabel={zoomLabel}
                  />
                ))}
              </div>
            );
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
                imageIndexOf={indexOf}
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

/**
 * The manufacturer's feature plate: each capability group is a full-width band
 * — a solid title bar over its own bullet list — stacked down the page, the way
 * the printed plate reads. Bands are tighter to each other than the surrounding
 * sheet blocks so the run holds together as one plate.
 */
function SheetFeatureGroups({
  block,
}: {
  block: Extract<SheetBlockView, { kind: "featureGroups" }>;
}) {
  return (
    <div className="flex flex-col gap-3">
      {block.groups.map((g, i) => (
        <section key={i} className="border border-line bg-white">
          <h3 className="m-0 flex items-center gap-2.5 bg-[#11120f] px-4 py-3 sm:px-5">
            <span aria-hidden className="h-3.5 w-[3px] shrink-0 bg-gold-2" />
            <span className="font-display text-meta sm:text-title font-bold tracking-[-.01em] text-white">
              {g.title}
            </span>
          </h3>
          <ul className="m-0 flex flex-col gap-2.5 list-none px-4 py-4 sm:px-5">
            {g.items.map((item, ii) => (
              <li key={ii} className="flex gap-2.5 text-meta leading-[1.7] text-[#3a3a3a]">
                <span aria-hidden className="text-gold-1 shrink-0">
                  ▸
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
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
      {block.caption && <SheetCaption text={block.caption} />}
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
      {block.note && (
        <p className="m-0 border-t border-line bg-paper px-4 py-2.5 text-meta leading-[1.7] text-muted">
          {block.note}
        </p>
      )}
    </figure>
  );
}

/** Drawing caption. Dimension plates are captioned "<frame size> · <the models
 *  that share it>", a run long enough to read as one unbroken line. The frame
 *  size leads as the plate's title and every model it covers is set as its own
 *  token, so a reader can match a part number to a drawing at a glance. A
 *  descriptive caption carries no such list and is left as plain text. */
function SheetCaption({ text }: { text: string }) {
  const parts = text.split(/ · | — /);
  const [lead, ...rest] = parts;
  // A leading frame/size label is short and carries its number; a prose opening
  // ("Bàn phím — từ 22 kW trở lên") does not, and keeps the caption undivided.
  const isLabelled = rest.length > 0 && lead.length <= 14 && /\d/.test(lead);
  return (
    <figcaption className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-b border-line px-4 py-2.5 bg-paper">
      <span className="font-display text-meta font-bold tracking-[-.01em] text-ink">
        {isLabelled ? lead : text}
      </span>
      {isLabelled &&
        rest.map((t, i) => (
          <span key={i} className={TOKEN_CLASS}>
            {t}
          </span>
        ))}
    </figcaption>
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
      <div className="flex flex-wrap items-end justify-center gap-x-1.5 gap-y-4">
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

      <div className="mt-7 grid gap-px bg-line border border-line sm:grid-cols-2 lg:grid-cols-4">
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
                  <li key={oi} className="flex gap-2 text-meta leading-[1.55] text-muted">
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
  "bg-[#eef1f4] px-2 py-3 align-middle text-center font-mono font-extrabold text-label-xs tracking-[.06em] uppercase text-[#5a6472] w-[52px] sm:w-[64px] leading-[1.3]";
const TH_CLASS =
  "bg-[#11120f] px-4 py-3 text-left font-mono text-label-xs tracking-[.08em] uppercase text-gold-2";
const TOKEN_CLASS =
  "inline-block border border-line bg-[#f3f6f8] px-1.5 py-0.5 font-mono text-label-xs tracking-[.02em] text-[#33302a] whitespace-nowrap";

/** A run of part numbers set as one middot-joined string ("S3100A/E-2T0.4G ·
 *  2T0.75G · 4T1.5G/2.2P") reads as an unbroken line, so a reader cannot pick
 *  a single model out of it. Split it only when every segment is a bare code —
 *  no spaces — and at least one carries a rating figure; prose that merely uses
 *  the middot as a separator ("ba pha 380 V · 50/60 Hz") stays as written. */
function codeTokens(text: string): string[] | null {
  const parts = text.split(" · ");
  if (parts.length < 2) return null;
  const bare = parts.every((p) => p.length > 0 && p.length <= 40 && !/\s/.test(p));
  return bare && parts.some((p) => /\d/.test(p)) ? parts : null;
}

/** Table-cell text: a code run becomes one token per model, anything else is
 *  left as plain text. */
function CellText({ text }: { text: string }) {
  const tokens = codeTokens(text);
  if (!tokens) return <>{text}</>;
  return (
    <span className="flex flex-wrap gap-1">
      {tokens.map((t, i) => (
        <span key={i} className={TOKEN_CLASS}>
          {t}
        </span>
      ))}
    </span>
  );
}

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
                      <CellText text={line} />
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
  const itemCols = hasV ? 2 : 1;
  const modelTh = block.models.map((m) => (
    <th
      key={m}
      className="bg-[#1b1c17] px-4 py-2.5 text-center font-display text-meta font-bold tracking-[-.01em] text-white whitespace-nowrap"
    >
      {m}
    </th>
  ));
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
          {block.modelHeader ? (
            <>
              <tr>
                {/* The part-number pattern takes the second header row's item
                    cell, so the item label only spans both rows without it. */}
                <th
                  className={TH_CLASS}
                  colSpan={itemCols}
                  rowSpan={block.modelPattern ? undefined : 2}
                >
                  {block.itemHeader ?? ""}
                </th>
                <th className={TH_CLASS} colSpan={modelCount}>
                  {block.modelHeader}
                </th>
              </tr>
              <tr>
                {block.modelPattern && (
                  <th
                    className="bg-[#1b1c17] px-4 py-2.5 text-left font-display text-meta font-bold tracking-[-.01em] text-white whitespace-nowrap"
                    colSpan={itemCols}
                  >
                    {block.modelPattern}
                  </th>
                )}
                {modelTh}
              </tr>
            </>
          ) : (
            <tr>
              <th className={TH_CLASS} colSpan={itemCols}>
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
                      <CellText text={v} />
                    </td>
                  );
                })}
              </tr>
            )),
          )}
        </tbody>
        </table>
      </div>
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
            {it.desc && <p className="m-0 text-meta leading-[1.6] text-muted">{it.desc}</p>}
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
                    <CellText text={cell.text} />
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
              <td className="px-4 py-3 bg-[#f3f6f8] align-middle">
                {/* A row may cover several part numbers sharing one drawing;
                    they are listed one per line rather than wrapped mid-code. */}
                <span className="font-display text-meta font-bold tracking-[-.01em] text-ink whitespace-pre-line">
                  {row.model}
                </span>
                {row.bracket && (
                  <span className="mt-1 block font-mono text-label-xs tracking-[.06em] uppercase text-muted">
                    {row.bracket}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 align-middle">
                <div className="flex flex-col items-center gap-2">
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
                  className="px-4 py-3 bg-[#f3f6f8] text-center align-middle font-display text-meta font-semibold tracking-[-.01em] text-ink whitespace-pre-line"
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
