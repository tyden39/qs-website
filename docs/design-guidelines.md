# Design guidelines

The visual system, as it exists in `app/globals.css`. Everything below is a
token, class or rule that ships today.

Design language in one line: **industrial datasheet on warm paper, with gold as
the single accent and technical-drawing motifs (grids, scan lines, PCB traces)
carrying the brand.**

---

## Colour tokens

Declared in the `@theme` block, so each is available as `bg-*`, `text-*`,
`border-*` and as `var(--color-*)`.

### Surfaces

| Token | Hex | Used for |
|---|---|---|
| `paper` | `#f5f3ee` | page background (also set directly on `html, body`) |
| `paper-2` | `#ecebe5` | secondary bands, hover fills on nav links and icon buttons |
| `ink` | `#0a0a0a` | dark slabs — top strip, footer, dark hero bands, primary buttons |
| `ink-2` | `#1a1a1a` | body text colour |
| `ink-3` | `#2a2a2a` | card border on hover |

### Text and rules

| Token | Hex | Used for |
|---|---|---|
| `text` | `#1a1a1a` | default copy |
| `muted` | `#6b6960` | captions, meta, crumbs, spec labels |
| `line` | `#d8d6cf` | hairline dividers, card and input borders |
| `line-2` | `#b8b6ae` | scrollbar thumb, heavier rules |

### Accents

| Token | Hex | Used for |
|---|---|---|
| `gold` | `#c9a35a` | the accent — eyebrow ticks, active underlines, mid-stop of the gradient |
| `gold-1` | `#8a6f35` | eyebrow and panel-title text (darkest gold, readable on paper) |
| `gold-2` | `#e8c878` | light gold — glows, scan lines, sheens, dark-surface hover |
| `gold-3` | `#8a6f35` | currently identical to `gold-1`; prefer `gold-1` for new work |
| `rust` | `#c8553d` | warning / secondary accent |
| `steel` | `#1a1f2e` | deep blue-black slab |
| `steelblue` | `#34566f` | reserved for the automation/inspection "line station" template |
| `steelblue-2` | `#6f93ad` | lighter step of the same process accent |
| `signal` | `#3f9a5a` | status green — the andon "ready" lamp |

**Gold gradient.** `--background-image-gold-grad` (and the equivalent
`--gold-grad` on `:root`) is
`linear-gradient(180deg, #f0d28a 0%, #c9a35a 50%, #8a6f35 100%)`. It fills
`.qs-btn-gold`, the active nav underline, the hero tab seam and the hovered
spec-row accent bar. Use the variable, not a re-declared gradient.

**Steel-blue is reserved.** It exists so the automation/inspection detail
template (conveyor belt, control chrome, andon lamps) reads as a different kind
of product from the gold CNC pages. Do not borrow it for general accents.

---

## Typography

### One family, three role names

The locale layout loads **exactly one font family**: Inter, subsets `latin` and
`vietnamese`, exposed as `--font-inter`. All three role tokens point at it:

```css
--font-display: var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif;
--font-sans:    var(--font-inter), …;
--font-mono:    var(--font-inter), …;
```

Two things to understand before "fixing" this:

- **`--font-mono` loads no monospace face.** The name is a role, not a family.
  It marks the uppercase, wide-tracked label style — eyebrows, crumbs, tags,
  spec keys, footer headings. Those render in the default sans.
- **`--font-display` is not a second face either.** Display used to be Inter
  Tight. It was dropped because `next/font` preloads every declared family at
  highest priority, so a second face put roughly 55 KB (its latin + vietnamese
  subsets) on the critical path competing with the LCP image on every page — for
  headings alone. The heading classes compensate with tighter tracking
  (`-.035em` on h1, `-.03em` on h2, `-.02em` on h3), standing in for Inter
  Tight's narrower letterforms.

The role names are kept distinct from `--font-inter` deliberately: a token whose
value referenced a custom property of the same name would be self-referencing,
and the cascade discards it.

### Type scale — the single source of truth

| Token | Size | Intended for |
|---|---|---|
| `text-label-xs` | 11px | mono tags, chips, micro crumbs |
| `text-label` | 12px | mono eyebrows, panel labels |
| `text-meta` | 14px | captions, meta, small UI |
| `text-button` | 14px | button faces, held at 14 everywhere |
| `text-body` | 16px | default paragraph copy |
| `text-lede` | 18px | intro paragraphs |
| `text-title` | 20px | card titles, small headings |
| `text-subhead` | 24px | sub-heads, stat values |
| `text-h2` | `clamp(26px, 2.4vw, 36px)` | section headings |

Every size in the app maps to one of these. Decorative one-offs — giant stat
numerals, watermark digits — stay as arbitrary values.

The two label steps are reserved for uppercase decoration where the wide tracking
carries the reading. **Anything a visitor reads as a sentence, a spec value or a
caption starts at `meta`.**

`.qs-h1` sits outside the scale on purpose at `clamp(36px, 5vw, 64px)`.

Body copy is **16px on every viewport**. Desktop previously stepped down to 15px
for a denser editorial feel, which shrank the long datasheet and description copy
exactly where it is read most closely.

`font-feature-settings: "ss01","cv11"` is set on `body`.

### `.qs-detail-type` — the detail-page floor

Detail pages are read, not scanned. Wrapping a detail page's content in
`.qs-detail-type` re-declares the three small steps at 16px:

```css
.qs-detail-type { --text-label-xs: 16px; --text-label: 16px; --text-meta: 16px; }
```

That lifts every consumer at once — eyebrows, crumbs, tags, chips, spec labels,
captions, table cells — without touching listing and marketing pages, which keep
the denser scale. Buttons are deliberately excluded: they carry their own
`--text-button` step so fixed heights and toolbar rows keep their proportions.

*Known nit:* the comment beside `.qs-lede` calls the lede step 17px while the
token is 18px. The class itself uses `text-title` (20px), so every page's opening
paragraph reads at 20px. The comment is stale, the behaviour is not.

---

## Layout

| Token / class | Value | Use |
|---|---|---|
| `--max-width-wrap` | 1280px | the frame the hero bleed measures itself against |
| `.qs-wrap-wide` | `max-w-[1680px]`, px 5 / sm 8 / lg 14 | listing and marketing pages — edge-to-edge feel, capped on ultra-wide |
| `.qs-wrap-detail` | `max-w-[1280px]`, same gutters | product and machine detail — datasheet copy reads better on a narrower measure |
| `.qs-section` | `py-12 sm:py-16 lg:py-24` | standard vertical rhythm |
| `--pad` | 48px, 24px below 1024px | shared page inset used by the hero-bleed maths |

Breakpoints follow Tailwind's defaults (sm 640, md 768, lg 1024, xl 1280,
2xl 1536) plus two bespoke nav steps at 1366 and 1680.

**Sticky header height is 64px below `lg` and 72px from `lg` up.** That number
appears in `.qs-search-panel`'s `top`, in `#list { scroll-margin-top }`, and in
`product-detail-tabs.tsx`'s `headerOffset()`. Change one and change all three.

**Stacked sections.** Where two full-padding sections meet *on the same
background*, their facing paddings add up (96 + 96 on desktop) and the page reads
as coming apart, since the only boundary is a 1px hairline. A set of
adjacent-sibling rules halves the second section's top padding for each matching
surface pair. It keys off `sm:py-16` — the padding step this group shares — so a
section that opts out of that scale opts out of the rule. Matching lives in CSS
rather than on the pages because most of these sections are conditional, and the
sibling selector sees what actually rendered.

**Closing CTA + footer.** `.qs-closing-cta:not(.bg-ink) + .qs-foot` removes the
footer's top gap, so a page ending on a call to action does not stack two light
bands before the dark footer. A dark closing block keeps the gap, or it would run
straight into the equally dark footer and read as one slab.

**Catalogue hero bleed.** From `lg` the hero figure runs off the right edge of
the viewport; the copy's right padding mirrors the figure's position at every
width via a `clamp()` pair. Past 1536px the figure pins to the container instead
of the viewport and overhangs by `--qs-pin: 128px` — otherwise at 4K it drifts
ever further from the copy and leaves ~640px of dead paper on the left. The
changeover is silent by construction: the pin engages exactly where half the
container overflow equals that overhang, and the width cap (`min(27vw, 415px)`)
is 27vw at that viewport, so nothing jumps while resizing.

---

## Component primitives

All live in `@layer components` in `app/globals.css`. Use these before writing
new utility soup.

| Class | What it is |
|---|---|
| `.qs-eyebrow` | uppercase gold-1 label, 12px, tracking `.18em`, with a 24px gold tick rule before it |
| `.qs-panel-title` | bolder section eyebrow at `meta` size, tracking `.16em` |
| `.qs-crumb` | breadcrumb trail; wraps as whole crumbs, never mid-label, because a link broken across two lines reads as two steps. Only links and separators are held together — the trailing `.here` carries a full product name and must be free to break. `.qs-crumb-dark` retints it for dark hero bands, where the default ink hover sinks into the near-black. |
| `.qs-tag` / `.qs-chip` | small uppercase metadata pills; chip is pill-shaped on translucent white |
| `.qs-h1` / `.qs-h2` / `.qs-h3` | heading steps with the compensating negative tracking |
| `.qs-lede` | opening paragraph — 20px, `leading-[1.55]`, `#3a3a3a`, capped at `60ch` |
| `.qs-btn` | primary button. 44px minimum height below `lg` for touch, compact from `lg` up. `.arr` inside slides 3px right on hover. |
| `.qs-btn-gold` / `.qs-btn-ghost` / `.qs-btn-sm` | gold-gradient, outline, and compact variants |
| `.qs-link` | uppercase mono link with a solid underline |
| `.qs-card` | white card, 1px `line` border, 3px radius; on hover the border darkens to `ink-3` and a soft lifted shadow appears |
| `.qs-section-head` | section title + lede row; stacks below `md` so the title column keeps its full width |
| `.qs-img-ph` | technical placeholder — 45° hatch over a paper gradient, used where a photo has not been shot yet |
| `.qs-select` | native-chrome reset for `<select>`, with a drawn chevron. Left **unlayered** on purpose: inside `@layer components` it would lose to the utility classes on each select. Its inset is a `var()` fallback (`--qs-select-inset`, default `0.7rem`) rather than a declaration, so a roomier control can still override it. |
| `.qs-scroll` | thin tone-matched scrollbar for panels that scroll internally; thumb colour comes from `--qs-scroll-thumb` so dark skins can restate it |
| `.qs-grid-bg` / `.qs-dot-bg` | technical-drawing line grid (32px) and gold blueprint dot field (26px) |

Radius is small throughout — 2–3px on tags, buttons and cards; 10px only on the
footer tiles; full round on chips and status dots.

---

## Motion

Motion is a brand signal here, not decoration: gold sweeps left→right, technical
surfaces drift, product renders float and get scanned.

| Class | Effect | Duration |
|---|---|---|
| `.qs-reveal` | scroll-reveal: fade + 12px rise | .6s, delay via `--reveal-delay` |
| `.qs-rise` | headline rise from 115% | .9s |
| `.qs-sweep-in` | slide in from `-4rem` with fade | 1s |
| `.qs-sweep-in-opaque` | same slide, **no fade** — for the LCP element | 1s |
| `.qs-grid-drift` / `.qs-dot-drift` | background drift | 38s / 52s |
| `.qs-glow` | breathing gold radial glow | 6.5s |
| `.qs-kenburns` | slow zoom/pan for editorial photos | 14s alternate |
| `.qs-float` | product render bob | 6.5s |
| `.qs-scan` | gold scan line sweeping a product | 4.8s alternate |
| `.qs-marquee` | ticker; pauses on hover | `--mq-dur`, default 42s |
| `.qs-gold-shimmer` | perpetual gold sheen on clipped text | 7s |
| `.qs-trace` | gold scanner along a section rule | 5.5s |
| `.qs-pcb-flow` / `.qs-pcb-pad` | current flowing along PCB traces, pads pulsing | 6s / 3.4s |
| `.qs-conveyor` / `.qs-andon` | line-station conveyor dashes and status lamp | 1s / 2.4s |
| `.qs-play` | pulsing rings on the showreel play button | 2.8s |
| `.qs-swipe-nudge` | chevron drifting right under a swipe rail | 1.9s |

Easing convention: `cubic-bezier(.16, 1, .3, 1)` for entrances and interaction,
`ease`/`linear` for ambient loops.

### Non-negotiable motion rules

1. **Every animation needs a `prefers-reduced-motion: reduce` counterpart.** The
   file has several such blocks; add to them.
2. **Never leave an invisible animation running.** `opacity: 0` does not stop the
   animation clock — an idle product card would keep laying out and painting an
   invisible 2px scan bar every frame. Pause it:
   `.group:not(:hover) .qs-scan.opacity-0 { animation-play-state: paused; }`
3. **Do not fade in the LCP element.** An element starting at `opacity: 0` is not
   a paint as far as the browser is concerned, so animating opacity on the LCP
   element pushes the metric out by delay + fade (measured around 2.8s on the
   home hero on a throttled phone profile). Use `.qs-sweep-in-opaque`, which
   keeps the motion language and lets the paint count when the pixels land.
4. **Release compositor layers once settled.** `will-change` is set only while a
   reveal is pending; a permanent layer on settled grid cells makes their 1px
   borders round away on fractional column widths, so dividers go missing.
5. **Rails opt out of reveal on small screens.** `.qs-reveal-desktop` (below
   768px) and `.qs-reveal-wide` (below 1024px) disable the reveal where a
   horizontal swipe already carries the motion. On a swipe rail the 12px vertical
   offset is worse than redundant: a box that scrolls on one axis can no longer
   leave the other visible, so it becomes a stray sliver of vertical scroll.

### Reveal fail-open

Reveal content starts at `opacity: 0`, so a page whose client JS never arrives
would paint as an empty shell under a working header. Two defences, both in the
locale layout: a `<noscript>` style for JS switched off, and a parse-time timer
that adds `.qs-reveal-failsafe` after 4 seconds if no `Reveal` component has
marked the document hydrated. The failsafe rule is last in its section so it
outranks the pending-reveal rule. The animation is lost; a blank page is worse.

---

## Accessibility

- Touch targets: `.qs-btn` is at least 44px tall below `lg`; `.qs-icon-btn` grows
  from 36px to 44px under `@media (pointer: coarse)`; breadcrumb links get a
  padding / negative-margin pair on coarse pointers so the hit area grows without
  moving the layout.
- Nav labels must never wrap — the bar has a fixed height. Vietnamese labels run
  roughly 1.6× their English counterparts, so `.qs-menu-link` steps its font size
  and horizontal padding down twice between 1366 and 1680px.
- Hover effects have `:focus-within` counterparts where they convey state (the
  hero spec readout).
- Interactive components pair the visual state with ARIA wiring — the product
  detail tabs expose their ids for aria and for URL hashes.
- `.qs-gold-shimmer` adds `padding-block: 0.2em` with a cancelling negative
  margin so stacked Vietnamese diacritics (ử, ữ) stay inside the clipped gradient
  under tight heading line-height.

---

## Detail-page templates

Five distinct detail templates exist. Pick the matching one rather than inventing
a sixth.

| Template | File | Look |
|---|---|---|
| Controller | `electronics/[slug]/page.tsx` + `product-detail-tabs` | tabbed datasheet — hero triptych, protocol spec sheet, kit grid, gallery, downloads |
| Catalogue item | `electronics/_components/catalog-detail.tsx` | deliberately simpler: hero → spec table → feature walkthrough → video → quote CTA. A DNC unit or cable has no protocol datasheet or kit to show, and each band drops out when the catalogue never documented it. |
| Drive/inverter series | `electronics/_components/series-detail.tsx` | tabs mirroring the manufacturer's own page: Introduction · Specifications · Documentation · Optional accessories. A tab with no content is dropped, never shown empty. |
| CNC machine | `machine-building/_components/machine-datasheet.tsx` | dark datasheet — hero slideshow, computed spec groups, performance strip, envelope wireframe, use cases |
| Line-integrated machine | `machine-building/_components/line-machine-detail.tsx` | light "line station" — stainless hero with andon readout, infeed → cycle → discharge flow, in-context gallery, control-panel card. Chosen automatically when a machine ships `line`/`control` data. This is where `steelblue` lives. |

Machine templates always render every section, filling gaps with an "updating"
placeholder, so every machine page has the same shape regardless of how complete
its datasheet is.

---

## Adding to the system

1. Need a colour? Check the token table first. If it genuinely does not exist,
   add it to `@theme`, not inline.
2. Need a size? Use a scale step. If nothing fits, the design is probably
   drifting — the scale is the source of truth.
3. Need a repeated composite? Add a `qs-*` class in `@layer components`.
4. Need a rule that must beat a utility class? Put it outside the layer, and
   leave any per-instance value as a `var()` fallback so a utility can still
   override it.
5. Adding motion? Write the reduced-motion counterpart in the same commit, and
   check you are not animating the LCP element's opacity.
