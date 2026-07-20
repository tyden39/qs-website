# Prompt — mobile swipe rail for a card section

Reusable prompt for converting any home/listing card section to the same mobile pattern used by the PRODUCTS section (`app/[locale]/page.tsx`). Paste it and replace `<SECTION>`.

---

## Prompt

Convert the `<SECTION>` card list to the mobile swipe rail pattern already used by the PRODUCTS section on the home page. Match that implementation exactly — do not invent a new style.

Reference implementation:
- Rail + cards: `app/[locale]/page.tsx`, the block starting at `id="home-product-rail"`
- Swipe hint: `components/rail-nudge.tsx`
- Chevron animation: `.qs-swipe-nudge` in `app/globals.css`

Requirements:

1. **Rail container** — below `md`, a horizontal snap rail; from `md` up, the section's existing static grid, unchanged.
   ```
   flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain
   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
   md:grid md:grid-cols-<N> md:overflow-visible
   gap-px bg-line border border-line
   ```
   Give it a unique `id` (e.g. `home-<section>-rail`) for the hint button to target.

2. **Card wrapper** — one full-width card per screen:
   ```
   flex items-stretch w-full shrink-0 snap-start bg-white md:w-auto md:bg-transparent
   ```
   - **No height utility anywhere on the wrapper or the card** — not `h-full`, not `h-full!`. `align-items: stretch` only applies to flex items whose cross-size is `auto`; any explicit height opts the item out of stretching, and a short card then leaves the container's `bg-line` showing as a grey band under its footer.
   - `bg-white` belongs on the wrapper (the element being stretched), not only on the inner card. `md:bg-transparent` so the desktop hover lift still reveals the divider grid.

3. **Image/media box inside the card** — absorbs the slack so no card ends with dead space:
   ```
   flex-1 min-h-[180px] md:flex-none md:h-[200px] lg:h-[248px]
   ```
   Fixed height only from `md` up, where all cards are visible at once and must match. On the rail only one card is on screen, so size variance between them never shows.

4. **Swipe hint** — reuse `<RailNudge>` as-is:
   ```tsx
   <RailNudge targetId="home-<section>-rail" label={t("<ns>.swipeHint")} className="md:hidden" />
   ```
   Sits directly after the rail, `mt-2`. Add a `swipeHint` key to both `messages/vi/<ns>.json` and `messages/en/<ns>.json` ("Vuốt để xem thêm" / "Swipe for more"). Do not restyle the button.

Constraints:
- Desktop (`md`+) must render identically to before the change.
- No new CSS unless the section needs something `globals.css` genuinely lacks — `.qs-swipe-nudge` already exists.
- Keep the section's existing card markup, hover treatment, and `Reveal` stagger.

Verify with `yarn build`, then check on a phone width that: the rail snaps one card per swipe, no grey band under the shortest card, and the desktop grid is unchanged.

---

## Notes

- `globals.css` is Tailwind v4 (`@import "tailwindcss"`). Its unlayered rules (e.g. `.qs-reveal`) outrank utility classes on conflicting properties — relevant if a section needs to override `opacity`/`transform` on a `Reveal`.
- Candidate sections on the home page: APPLICATIONS (line ~213), NEWSROOM (line ~339). Both currently use their own layouts; confirm the card structure before applying.

## Open questions

- Should the rail pattern apply to the standalone listing pages (`/products`, `/news`) too, or home page only?
