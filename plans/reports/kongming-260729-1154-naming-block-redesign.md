# Kongming — Naming-block ("model-code decode") redesign

Advisory report. Target: `SheetNaming` in
`/home/ducnguyen/ws/qs/qs-website/app/[locale]/electronics/_components/series-spec-sheet.tsx` (line ~246).
Complaint: block is bulky ("cồng kềnh") with too much whitespace.

## TL;DR

Stop rendering the decode as a card grid. Render it as a two-column legend
**table** in the sheet's existing house style — the model code itself becomes
the table's dark header bar (`#11120f`, like every other block's `TH_CLASS`
bar), and each segment becomes one self-sized row: `01 SCH | Dòng sản phẩm
[chips…]`, with the option list flowing horizontally as `TOKEN_CLASS` chips
instead of stacking vertically as bullets. This removes every source of dead
space at once: no row-height equalization, no duplicated poster-size code
strip, no per-card padding, no one-line-per-option lists. Worst case (12
branches) drops from ~700px of ragged panel to ~500px of solid table; the
4-branch cases collapse from a full card row + strip to ~200px.

## Root cause — why it feels bulky (4 independent causes)

1. **Grid row-height equalization.** `grid sm:grid-cols-2 lg:grid-cols-4`
   stretches every card in a row to the tallest card. Option counts per branch
   are 0, 6, 1, 5, 2, 2, 3, 2, 2, 2, 1, 2 (SCH block, `data/series.json:1372`),
   so a 6-option card sits beside a 0-option card and ~70% of several cards is
   empty. Dead space is proportional to the *variance* of option counts, and
   the real data has high variance. This is the dominant cause.
2. **Wrong metaphor.** Cards say "each segment is a thing worth a panel." The
   data is a 12-row key→meaning legend. Every sibling block in this file
   (`SheetSpecList`, `SheetParamTable`, `SheetDataTable`) renders key/value
   data as a dense hairline table; the naming block is the only "poster"
   outlier, which is exactly why it reads as off-brand bulk.
3. **Duplication + oversized type.** Each segment and its index are rendered
   twice (top strip and card). The strip uses `font-display text-title
   sm:text-subhead` (~20–24px) centered, inside a `p-6 lg:p-8` frame, plus
   `mt-7` to the grid — hero styling for reference content.
4. **Vertical option bullets.** Each option ("060: 60 mm" — ~10 chars) costs a
   full line. Six options = six lines for ~60 characters of content.

## Options

### Option A — Legend table, code as dark header bar (RECOMMENDED)

```
┌───────────────────────────────────────────────────────────────┐
│ SCH  060  401  C   2   N   D   3   1   0   H   (5)   ← dark bar
│  1    2    3   4   5   6   7   8   9  10  11   12    ← gold idx
├───────────┬───────────────────────────────────────────────────┤
│ 01 SCH    │ Dòng sản phẩm                                     │
│ 02 060    │ Cỡ khung  [060: 60 mm][080: 80 mm][090: 90 mm] …  │
│ 03 401    │ Công suất  [40 × 10¹ = 400 W]                     │
│ 04 C      │ Tốc độ định mức  [A: 1000][B: 2000][C: 3000] …    │
│ …         │                                                   │
└───────────┴───────────────────────────────────────────────────┘
```

- Rows size to their own content (`<tr>` = intrinsic height): a 0-option row
  costs one line (~36px), a 6-option row costs one or two.
- Options as inline-wrapping `TOKEN_CLASS` chips — the exact chip already used
  for code runs in table cells (`CellText`), so it's house vocabulary.
- The strip is not deleted — it is **demoted and merged**: it becomes the
  table's header bar in `font-display text-meta sm:text-title` white on
  `#11120f` with `text-gold-2` indices, matching every other block's dark
  header. Zero duplication cost, keeps the position→row map.
- Key cell is `<th scope="row">` on `bg-[#f3f6f8]` — same anatomy as
  `SheetSpecList`'s item cells.
- Mobile 360px: header bar `flex-wrap`s segments (numbers keep the mapping);
  key column shrink-to-fits (~90px), chips wrap in the value column. No
  horizontal scroll needed, no JS, still a server component.
- Cons: worst case is still ~500px tall (dense, but tall); wrapped code bar on
  phones loses the single-line look (the numbering exists precisely to absorb
  this — same trade the current strip already makes with `flex-wrap`).

### Option B — Keep cards, fix packing with CSS multi-column

`sm:columns-2 lg:columns-4 gap-px` on the wrapper, `break-inside-avoid` on
cards → masonry-ish packing, kills the equalization dead space. Minimal diff.

- Cons: reading order becomes down-then-across (fights the left-to-right code
  strip), columns end at ragged bottoms, the hairline `gap-px bg-line` seam
  trick doesn't translate cleanly to CSS columns, and the poster strip +
  padding + one-line-per-option problems all remain. Cheapest patch, weakest
  result. Not recommended.

### Option C — Option A + two-column body on `lg`

Same row anatomy as A but div-based rows in a `lg:columns-2` container
(`break-inside-avoid` per row) → 12-branch worst case halves to ~280px.

- Cons: reading order down-then-across (acceptable for a *numbered* legend,
  but still), per-row borders need care at column tops, rows in the two
  columns won't share heights. Hold this as an escalation if Option A's ~500px
  worst case still draws complaints. Don't start here — YAGNI: 3 of the 4
  naming blocks have only 4 branches and won't benefit.

## Recommended implementation (drop-in `SheetNaming`)

```tsx
/**
 * Model-code decode. The example code opens the block as a dark header bar —
 * each meaningful chunk indexed — and is decoded one chunk per table row:
 * index and chunk as the row key, the meaning and alternative codes flowing
 * inline. Rows size to their own content, so a chunk with six options and a
 * chunk with none each cost exactly what they need.
 */
function SheetNaming({ block }: { block: Extract<SheetBlockView, { kind: "naming" }> }) {
  return (
    <div className="border border-line bg-white">
      {/* The code itself is the table's header. Segments wrap as units on
          narrow viewports; each carries its row number so the mapping
          survives the wrap. Hidden from AT — the caption reads the code
          unfragmented. */}
      <div
        aria-hidden="true"
        className="flex flex-wrap items-end gap-x-2.5 gap-y-2.5 bg-[#11120f] px-4 py-3 sm:px-5"
      >
        {block.branches.map((br, i) => (
          <span key={i} className="flex flex-col items-center gap-1">
            <span className="font-display text-meta sm:text-title font-bold tracking-[-.01em] text-white whitespace-nowrap">
              {br.seg}
            </span>
            <span className="h-px w-full bg-gold-2/60" />
            <span className="font-mono text-label-xs tracking-[.08em] text-gold-2 tabular-nums leading-none">
              {i + 1}
            </span>
          </span>
        ))}
      </div>

      <table className="w-full border-collapse">
        <caption className="sr-only">{block.code}</caption>
        <tbody>
          {block.branches.map((br, i) => (
            <tr key={i} className={i > 0 ? "border-t border-line" : undefined}>
              <th
                scope="row"
                className="w-px whitespace-nowrap bg-[#f3f6f8] px-3 py-2 text-left align-top sm:px-4"
              >
                <span className="font-mono text-label-xs text-gold-1 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="ml-2 font-display text-meta font-bold tracking-[-.01em] text-ink">
                  {br.seg}
                </span>
              </th>
              <td className="px-3 py-2 align-top sm:px-4">
                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                  <span className="mr-1 text-meta font-semibold tracking-[-.005em] text-ink">
                    {br.label}
                  </span>
                  {br.options?.map((o, oi) => (
                    <span key={oi} className={TOKEN_CLASS}>
                      {o}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

Implementation notes:

- `w-px whitespace-nowrap` on the row header = shrink-to-fit key column, a
  standard table trick; no fixed widths to break on `(ZD1V)`-length segments.
- `TOKEN_CLASS` is module-scope `const` (line ~303); referencing it from a
  function declared earlier in the file is fine (functions run after module
  evaluation).
- Wrapper switches `bg-paper p-6 lg:p-8` → `bg-white` with **no** padding: the
  bar and cells carry their own padding, like every other table block. This
  alone removes ~50–65px of frame.
- If chips feel busy (26 chips in the SCH block), the lighter fallback is
  plain `text-meta text-muted` text joined with `·` — denser and quieter,
  weaker scannability. Try chips first; they match the sheet's token idiom.

### Optional flourish (skip unless asked)

Highlight the option the example code actually uses (row 02's "060: 60 mm"
when the seg is `060`) by swapping in a gold-bordered chip:

```tsx
const isActive = o.split(/[:=]/)[0]?.trim() === br.seg;
// isActive ? "inline-block border border-gold-1 bg-white px-1.5 py-0.5
//   font-mono text-label-xs tracking-[.02em] font-semibold text-ink
//   whitespace-nowrap" : TOKEN_CLASS
```

Use a full separate class string, not an appended override — `border-line` vs
`border-gold-1` conflict resolution by string order is not reliable in
Tailwind. Data check: `:` and `=` separators both occur ("060: 60 mm",
"0.4 = 0.4 kW"), and the SDV3 power row's active seg is `0.4` which matches
`0.4 = 0.4 kW` under this split. Verify visually per block; if any block
misfires, drop the flourish rather than special-casing.

## What to avoid

- **Leader-line diagram revival** — already abandoned for the right reason
  (fixed positions vs 360px). CSS anchor positioning could do it now but is
  not yet universally shipped; not worth it for a legend.
- **Accordion / details-per-segment** — adds interaction cost to reference
  content users want to scan, hides the options from a plain page-scan, and
  buys nothing since the collapsed rows are already one line each in Option A.
  (It would stay a server component via `<details>`, but still: don't.)
- **`grid-auto-rows` / masonry patches on the existing cards** (Option B) —
  treats the symptom, keeps the wrong metaphor.
- **A `thead` with column labels** — the view model has no localized header
  strings (`{ code, branches }` only), and inventing them means touching
  `lib/data/series` + both locales for zero reader value. The code bar *is*
  the header.
- **New abstractions** — this stays one function; reuse `TOKEN_CLASS` only.

## Q4 — top code strip: keep, changed, or merged?

**Merged.** Keep the segmented, indexed code — it is the map the rows point
into — but demote it from centered poster typography to the block's dark
header bar (white `font-display text-meta sm:text-title`, `text-gold-2`
indices, thin `bg-gold-2/60` underline per segment). Do not keep it as a
separate centered element above the table; that is the duplication that makes
the block feel twice-told.

## Accessibility

- Replace the `sr-only` span with `<caption className="sr-only">{block.code}
  </caption>` — same content, now semantically attached to the table.
- Put `aria-hidden="true"` on the whole header bar (today only the small
  numbers are hidden, so SRs read the code twice: once fragmented, once via
  sr-only). Text stays selectable and indexable — `aria-hidden` affects
  neither.
- Row indices ("01") stay visible and readable — they are content (the map to
  the bar), not decoration.
- `<th scope="row">` gives each row a proper header ("01 SCH") so SR users
  hear the key before the meaning. A 2-column legend without column `<th>`s is
  fine.

## Success metrics

- SCH worst-case block height ≲ ~520px desktop (from ~700px) with no region of
  empty panel larger than one line.
- 4-branch blocks (SDV3, DL-SCH, SA2FK) fit in ≲ ~220px.
- No horizontal scrollbar at 360px; code bar wraps with indices intact.
- Stakeholder no longer flags the block; it reads as kin to `SheetSpecList`.

## Assumptions

- Sheet column is ~700–900px+ on desktop (rendered full-width inside the tab
  content in `series-detail.tsx`), so most chip rows fit one line —
  **medium** confidence; if the column is much narrower, more rows wrap to two
  lines and Option C's `lg:columns-2` variant becomes worth revisiting.
- "Bulky" = dead space + poster feel, not "too much information" — **high**;
  if the stakeholder actually wants options hidden, `<details>` rows would be
  the answer, but nothing in the complaint says that.
- `gold-2` resolves as a color usable with the `/60` opacity modifier under
  Tailwind v4 (`bg-gold-2` is used at line 155) — **high**; if it's a
  non-color token, use `bg-gold-2` plain or `bg-gold`.
- Keeping row indices visible (not aria-hidden) matches current behavior and
  intent — **high**.

Status: DONE
Summary: Root cause is grid row-equalization + card metaphor + duplicated poster strip + vertical bullets; recommended fix is a house-style legend table whose dark header bar is the segmented code, with options as inline-wrapping TOKEN_CLASS chips. Drop-in JSX provided.
Concerns/Blockers: none.
