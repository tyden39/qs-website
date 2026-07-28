# Catalogue sidebar redesign — scrollbar + "SẮP CÓ" wrap

Advisory report (kongming). Files verified by reading, not memory:
- `app/[locale]/electronics/_components/product-category-tree.tsx` (nav L314-317, ul L325, group button L332-366, child list L368-403)
- `components/count-badge.tsx` (chip metrics L39-40)
- `app/globals.css` (tokens L6-25; no existing scrollbar utility — grep confirms)
- `app/[locale]/electronics/page.tsx` (`soon` set at L85: `typeCount(ct) === 0 ? t("types.soon") : undefined`)
- `app/[locale]/machine-building/page.tsx` L74-105 (dark tone, children never carry `soon` today)
- `messages/vi/product.json` L115 `"soon": "Sắp có"`, en `"Soon"`
- CountBadge call sites: this tree + `downloads-tree.tsx` (counts only — unaffected)

## TL;DR

The two defects share one root cause: the "SẮP CÓ" text chip is ~2.7× wider than
a two-digit count chip, which wraps three child rows to two lines, which pushes
the tree past the 540px band, which summons the native scrollbar. Fix the chip
first — replace the word with a gold dot in the same `CountBadge` slot (text
kept for screen readers and hover title) — and the tree drops back under 540px,
so the scrollbar disappears in the default view. Keep `overflow-y-auto` as a
safety valve but style it with a small `qs-scroll` utility (thin, tone-matched
thumb, transparent track) and carve it a gutter so it never cuts the row rules
again. Drop the group label from 18px to 17px so "Thiết bị truyền DNC" holds one
line.

## The arithmetic (why rows wrap)

Rail inner width = 300 − 2×20 (p-5) = **260px**.

Child row budget: indent `ml-[13px] pl-6` = 37px → 223px; minus 16px icon +
8px gap + 12px `gap-3` + chip. "SẮP CÓ" chip ≈ 6 chars × 7.2px mono + 12px
padding + tracking ≈ **70px** → label gets ~135px. "Điều khiển chuyển động" at
15px needs ~158px → wraps. With a dot chip at the `min-w-[2.15em]` floor
(≈26px) and `gap-2`, the label gets ~165px → fits on one line.

Group row budget (leaf, no chevron): 260 − 28 tile − 12 gap − 26 chip − 12 gap
≈ 177px. "Thiết bị truyền DNC" at 18px medium needs ~175-180px — right on the
edge, hence the wrap. At 17px it needs ~168px → fits with margin.

Tree height after the fix (electronics, controllers expanded): 40 rail padding
+ ~48 header + 5×~52 group rows + 4×~34.5 children + 8 = **~495px < 540px** —
no scrollbar in the default view. The bar only returns if the catalogue grows,
which is exactly when a (now styled) scrollbar is the correct behaviour.

## 1. Scroll treatment — keep the cap, style the valve

**Recommendation: keep `lg:max-h-[540px]` + `overflow-y-auto`; add a `qs-scroll`
utility and a scrollbar gutter.** Do not drop the cap: the hero is composed as
one plate (`lg:min-h-[340px]`, rail `lg:h-full`, figure held to 70% of band
height in `CategoryHeroFigure` L514). An uncapped rail would set the grid row
height, stretching the band and inflating the bleed figure as the catalogue
grows — the composition would degrade precisely when content grows. Fade masks
are extra machinery for a state that, after the chip fix, only exists on future
growth (YAGNI).

### `app/globals.css` — add near the other `qs-*` utilities

```css
/* ─── Thin, tone-matched scrollbar for panels that scroll internally (the
   catalogue rail). The thumb colour comes from --qs-scroll-thumb so a dark
   skin can restate it without a second utility; the track stays transparent
   so the panel's own rules keep reading through. ─── */
.qs-scroll {
  --qs-scroll-thumb: var(--color-line-2);
  scrollbar-width: thin;
  scrollbar-color: var(--qs-scroll-thumb) transparent;
}
/* Safari has no scrollbar-color; the legacy pseudo-elements give it the same
   thin thumb (browsers honouring the standard props above ignore these). */
.qs-scroll::-webkit-scrollbar { width: 6px; }
.qs-scroll::-webkit-scrollbar-track { background: transparent; }
.qs-scroll::-webkit-scrollbar-thumb { background: var(--qs-scroll-thumb); border-radius: 3px; }
```

### `product-category-tree.tsx`

TONE table — add one key per skin so the thumb matches the chrome:

```ts
// light (after `glyph`):
scroll: "[--qs-scroll-thumb:var(--color-line-2)]",
// dark:
scroll: "[--qs-scroll-thumb:#4a453a]",   // matches railHead border
```

L325 — the scrolling `<ul>`:

```tsx
<ul className={`list-none p-0 m-0 min-h-0 overflow-y-auto overscroll-contain qs-scroll -mr-2.5 pr-2.5 ${skin.scroll}`}>
```

`-mr-2.5 pr-2.5` extends the list 10px into the rail's right padding and pads
the content back, so when the bar does appear it rides in that gutter — the row
rules (`border-b` on the `li`, sized to the content box) stop where they always
did and the thumb never crosses them. When nothing overflows, the classes are
visually inert. `overscroll-contain` stops the page scrolling when the rail's
scroll ends.

## 2. The "soon" marker — gold dot in the count slot

**Recommendation: keep `CountBadge` in the trailing slot, but when `c.soon` is
set render a 6px gold dot instead of the word.** The chip collapses to its
`min-w-[2.15em]` floor — same footprint as "07"/"02" — so every row aligns and
every label gets its line back. Signal stack for sighted users: dot-not-number
+ slightly dimmed label + hover `title`; clicking still lands on the soon panel
which explains itself. Screen readers keep the full string via `sr-only`.

Crucially, **do not change the data shape**: `c.soon` stays the translated
string, because the mobile `<select>` (L305: `{c.label} ({c.soon ?? count})`)
and the soon panel still need the words. This is a desktop-render-only change.

L376-398 — child button, full replacement of the button element:

```tsx
<button
  type="button"
  aria-pressed={on}
  onClick={() => selectChild(c.id)}
  title={c.soon || undefined}
  className={`w-full flex justify-between items-center gap-2 py-1.5 text-[15px] text-left cursor-pointer bg-transparent border-0 transition-colors ${
    on ? `${skin.childOn} font-medium` : skin.child
  }`}
>
  <span className={`flex items-center gap-2 min-w-0 ${c.soon && !on ? "opacity-70" : ""}`}>
    {c.icon ? <CategoryIcon name={c.icon} className="w-4 h-4 shrink-0 opacity-75" /> : null}
    {/* Wraps rather than truncates: a clipped branch name is worse than a
        two-line row (rare now that the marker is a dot). */}
    <span className="min-w-0 text-balance">{c.label}</span>
  </span>
  <CountBadge active={on} tone={tone}>
    {c.soon ? (
      <>
        {/* An announced-but-empty branch marks itself with a gold dot in the
            numeral slot: the word ("Sắp có"/"Soon") is ~2.7× a two-digit chip
            and wrapped every such row onto two lines in the 300px rail. The
            text survives for screen readers and as the button's hover title;
            the h-3 box keeps the chip the same height as a numeral chip. */}
        <span aria-hidden="true" className="grid place-items-center w-3 h-3">
          <span className={`w-1.5 h-1.5 rounded-full ${on ? "bg-current" : tone === "dark" ? "bg-gold-2" : "bg-gold"}`} />
        </span>
        <span className="sr-only">{c.soon}</span>
      </>
    ) : (
      String(c.count).padStart(2, "0")
    )}
  </CountBadge>
</button>
```

Notes:
- `gap-3` → `gap-2` on the button buys 4px of label room (the outer gap; the
  icon/label inner gap stays `gap-2`).
- The old `className={c.soon ? "tracking-[.1em] uppercase" : ""}` prop on
  `CountBadge` goes away entirely — nothing else uses it.
- Dot colours: inactive = `bg-gold` (#c9a35a) on the light `bg-paper-2` chip,
  `bg-gold-2` (#e8c878) on the dark `bg-white/[.07]` chip — both legible.
  Active (`on`) = `bg-current`, inheriting the chip's active text colour
  (white on gold-1 light, #141510 on gold-2 dark), since a gold dot on a gold
  chip would vanish.
- The `w-3 h-3` wrapper matters: `text-label` at `leading-none` gives numeral
  chips 12px of content height; the bare 6px dot would make the soon chip 6px
  shorter and break the row rhythm.
- `count-badge.tsx` needs **no code change**; optionally amend its doc comment
  ("or a short marker such as 'soon'" → "or a marker glyph for an announced
  branch") so the comment tracks reality.

Rejected alternatives: shortened token ("S.CÓ") — still wide, reads as a typo;
caption under the label — reintroduces the second line deliberately;
hover-only — invisible on touch and undiscoverable; disabled/greyed row — the
row is a real destination (the soon panel), it must stay clickable-looking.

## 3. Row rhythm

- **Group label L340: `text-[18px]` → `text-[17px]`.** One-point drop is below
  the perception threshold at a glance but moves the longest leaf label
  ("Thiết bị truyền DNC") from ~178px needed to ~168px against a 177px budget.
  Keep `gap-3`, `py-3`, the 28px tile, and `text-balance` (graceful fallback
  if a future label is longer still). If you refuse to touch the size, the
  alternative is `gap-3` → `gap-2.5` on the group button (buys 6px) — but 17px
  is the safer single change.
- **Children: keep the 16px `CategoryIcon`.** It mirrors the header's sub-type
  leaves and, after the dot fix, the longest child label fits with it present.
  Keep `text-[15px]`, `py-1.5`.
- **Keep the stem geometry `ml-[13px] pl-6`** — 13 + 24 = 37px puts child text
  within ~3px of the group label's start (28 tile + 12 gap = 40px), which is
  why the tree reads as aligned. Shrinking the indent would break that.
- Eyebrow (L320) and everything else: unchanged.

## 4. Regression watch

- **Dark variant (`machine-building`)**: its children never set `soon` today
  (L81-89 builds them without it), so only the scrollbar change shows there —
  covered by `TONE.dark.scroll`. The dot branch is still tone-correct if a
  soon child ever appears.
- **Applications page**: light tone, groups with icons — same code path,
  benefits identically.
- **Mobile `<select>`**: untouched; `c.soon` string preserved in data, so
  "Điều khiển robot (Sắp có)" still renders in the option text.
- **`downloads-tree.tsx`**: uses `CountBadge` with numerals only; CountBadge
  is unchanged, so no effect.
- **Chromium/Firefox** honour `scrollbar-width/color` (standard props win and
  the webkit pseudos are ignored); **Safari** falls back to the webkit rules.
  No behaviour change where neither is supported — you just keep the native
  bar, now rarer.

## Work checklist

1. `app/globals.css`: add the `qs-scroll` block.
2. `product-category-tree.tsx` TONE table: add `scroll` key to both skins.
3. L325 `<ul>`: add `overscroll-contain qs-scroll -mr-2.5 pr-2.5 ${skin.scroll}`.
4. L340 group button: `text-[18px]` → `text-[17px]`.
5. L376-398 child button: `gap-3`→`gap-2`, add `title`, dim-when-soon span,
   dot-or-count chip content; delete the `tracking/uppercase` className prop.
6. Verify: electronics vi at 1024/1280/1440 — no scrollbar with controllers
   expanded, all rows single-line; machine-building dark — rail unchanged bar
   the (likely absent) scrollbar; mobile selects still show "(Sắp có)";
   VoiceOver/NVDA reads "Điều khiển robot, Sắp có".

## Success metrics

- No native scrollbar on electronics desktop at default zoom, vi and en.
- Zero two-line rows in the rail (vi, 300px rail, controllers expanded).
- If forced (window zoom 125%+), the scrollbar is a 6px tone-matched thumb in
  the padding gutter, not crossing row rules.
- Accessible name of soon rows still contains "Sắp có"/"Soon".

## Assumptions

- Label width estimates use ~0.5em average glyph width for the site's sans at
  medium weight (high confidence for the pass/fail calls with ≥8px margin;
  medium for "Thiết bị truyền DNC" at 17px — if it still wraps, add
  `gap-2.5` on the group button as the second lever).
- The 18px group label was not a deliberate recent decision that must be
  preserved (medium confidence — commit 6a9247b enlarged *home* card text, not
  the rail; if 18px is sacred, use the gap-2.5 alternative instead).
- A gold dot is learnable as "coming soon" given the dimmed label, hover
  title, and the explanatory soon panel one click away (medium-high; if it
  tests poorly, the fallback is `text-label-xs` "SẮP CÓ" at 10px in the chip —
  ~46px — which still un-wraps two of the three offending labels but not
  "Điều khiển chuyển động").
