# Home Effects & Motion System

> Catalog of every visual effect, animation, and interaction pattern used on the home page (`app/[locale]/page.tsx`), packaged for reuse across the whole site.
>
> Companion to [design-guidelines.md](design-guidelines.md) (tokens, typography, layout). All effects honour `prefers-reduced-motion` — that wiring lives at the bottom of [app/globals.css](../app/globals.css).

The home page layers a **subtle, perpetual "the machine is alive" motion language** over the static technical-drawing base: drifting blueprint grids, animated PCB traces, floating product renders, gold scan beams, count-ups, marquees, and autoplay feeds. The aesthetic stays *industrial / instrument panel* — never SaaS bounce. Gold (`#e8c878`) is the single accent that "lights up".

> ⚠️ This supersedes the legacy "Motion" note in `design-guidelines.md` ("no scroll-driven animations, print-still"). The home page intentionally introduced ambient + scroll-reveal motion. Treat **this file** as the canonical motion reference.

---

## 1. How to apply (the 3 building blocks)

Every page should reuse the same scaffold the home page uses:

1. **Wrap entrances in `<Reveal>`** — scroll-triggered fade+rise. Add `delay={i * 70..80}` to stagger lists/grids.
2. **Give each section an atmosphere layer** — `qs-grid-bg qs-grid-drift` + optional `<CircuitTraces>` + optional `qs-glow` (see §4).
3. **Use the animation utility classes** (§3) for living detail — the section keeps breathing after the reveal finishes.

All motion components are client components but render their final state on the server (SSR-safe, crawler-safe, no-JS-safe).

---

## 2. Reusable components

Drop-in components in `components/`. Props summarised; read the file for full types.

| Component | File | Purpose | Key props |
|---|---|---|---|
| `Reveal` | `reveal.tsx` | One-shot scroll fade+rise (IntersectionObserver, threshold .15, disconnects after fire) | `as`, `className`, `delay` (ms stagger) |
| `CountUp` | `count-up.tsx` | Ramps 0→`to` when scrolled in; can re-run periodically | `to`, `suffix`, `pad`, `duration`, `repeatEvery` (ms) |
| `Marquee` | `marquee.tsx` | CSS-only seamless ticker, pauses on hover | `items[]`, `speed` (s), `reverse` |
| `CircuitTraces` | `circuit-traces.tsx` | Decorative animated PCB trace network (brand signature) | `variant` (`dark`/`light`), `className` |
| `HeroSlider` | `hero-slider.tsx` | Dark blueprint product carousel; static stage + cross-fading content, 7s autoplay, ←/→ keys | `slides[]` (`HeroSlide`) |
| `AppDeck` | `app-deck.tsx` | Expanding vertical filmstrip; one panel opens at a time, 4.2s autoplay | `items[]` (slug/n/t/img/d) |
| `NewsFeed` | `news-feed.tsx` | Editorial lead + wire list; active row drives lead, 5.5s autoplay | `items[]` (`NewsItem`) |
| `VideoReel` | `video-reel.tsx` | YouTube showreel; feature still → click-to-embed facade, 6s autoplay | `items[]` (`VideoItem`: `youtubeId`, `title`, `duration?`) |

**Shared autoplay pattern** (HeroSlider / AppDeck / NewsFeed / VideoReel): `setInterval` advance, **pause on hover + focus-within**, re-key the active element so `qs-rise` replays, a gold **progress seam** (`qs-progress`) runs under/over the active item, and `prefers-reduced-motion` disables autoplay + freezes the seam. Copy this pattern for any new "self-cycling" UI.

---

## 3. Animation utility classes (from `app/globals.css`)

Apply these classes anywhere. Most pair with an absolutely-positioned `aria-hidden` decorative div.

| Class | Effect | Typical use |
|---|---|---|
| `.qs-reveal` / `.is-visible` | Fade + 12px rise on scroll-in. Use via `<Reveal>`, not by hand. | Section entrances, staggered grids |
| `.qs-grid-drift` | Slowly pans the 32px grid (38s loop). Combine with `.qs-grid-bg`. | Section background atmosphere |
| `.qs-glow` | Breathing blurred gold radial pool (6.5s pulse). Position via inline `style`. | Behind hero product, CTA bands |
| `.qs-kenburns` | Slow zoom/pan (24s alternate) for editorial photos. | Full-bleed factory/about photos |
| `.qs-float` | Gentle ±12px vertical levitation (6.5s). | Product renders on a pedestal |
| `.qs-scan` | Gold scan beam sweeping top→bottom (4.8s). Stagger with `animationDelay`. | Product stages, media covers |
| `.qs-breathe` | Opacity breathe .42↔.72 (5s) for pedestal/ember glows. | Gold pool under products/covers |
| `.qs-rise` | Kinetic load-in: 115%→0 translate + fade (cubic-bezier). Stagger via `animationDelay`. | Hero headline lines, re-keyed content |
| `.qs-gold-shimmer` | Animated gold gradient clipped to text (7s). | Hero product name, stat numbers |
| `.qs-trace` | Gold scanner sweeping along a section-header hairline (5.5s). | Section-head bottom rule |
| `.qs-marquee` / `-track` | Infinite horizontal ticker, hover-pause. Use via `<Marquee>`. | Ticker bands |
| `.qs-pcb-flow` / `.qs-pcb-pad` | Animated current pulse + breathing solder pads. Use via `<CircuitTraces>`. | Brand-signature backgrounds |
| `.qs-live-dot` | Soft blinking gold status dot (2.4s). | "live / đang phát / cập nhật" labels |
| `.qs-play` | Pulsing concentric gold rings (2.8s). | Video play buttons |
| `.qs-progress` | 0→100% width fill (timed). | Autoplay progress seams |
| `.qs-spec` | Hover/focus row: gold left-bar grows, baseline trace sweeps, value nudges, key turns gold. | Spec readouts, key-value lists |
| `.qs-strip` / `.qs-panel` | Filmstrip flex-grow expand + cross-fade + desaturate. Use via `<AppDeck>`. | Application / gallery decks |
| `.qs-hero-arrow` / `.qs-hero-tab` | Carousel prev/next chips + active rail seam. | Sliders |

---

## 4. Section atmosphere recipe

Every light (`bg-paper`) content section on the home page uses the same backdrop stack. Reuse verbatim on other pages:

```tsx
<section className="relative py-24 bg-paper overflow-hidden">
  {/* drifting blueprint grid */}
  <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true" />
  {/* corner PCB traces, radial-masked so they fade inward (optional) */}
  <CircuitTraces variant="light"
    className="hidden md:block absolute bottom-0 right-0 w-[44%] h-[72%] opacity-[.55]
               [mask-image:radial-gradient(ellipse_at_bottom_right,#000_26%,transparent_72%)]" />
  <div className="relative qs-wrap-wide">
    {/* content — wrap blocks in <Reveal> */}
  </div>
</section>
```

Dark sections (`bg-ink`) use the same stack at lower opacity: grid `opacity-[.1]`, traces `variant="dark"`, plus a top gold seam (`linear-gradient(90deg,transparent,rgba(232,200,120,.6),transparent)` on a `h-px`) and/or a `qs-glow`.

**Section header** pattern: eyebrow (mono + `qs-live-dot`) → `qs-h2` on the left, lede/CTA on the right, a bottom `border-line` rule with a `qs-trace` sweep absolutely placed on it.

---

## 5. Reusable interaction patterns (hand-built, not classes)

These recur across cards/covers — lift them when building new pages:

- **Hover-lift datasheet card**: `hover:-translate-y-2 hover:shadow-[0_30px_60px_-22px_rgba(20,16,8,.45)] hover:ring-1 hover:ring-gold-2/70` + a `before:` top accent bar that grows on `group-hover`.
- **Product stage**: white→`#f1efe8` gradient box + `qs-grid-bg` + `qs-scan` beam + `qs-breathe` pedestal glow + gold baseline (`bg-gradient-to-r from-transparent via-gold-2/70 to-transparent`) + `qs-float` render. Hover adds inner gold shadow, corner ticks, scale, and a sheen sweep.
- **Sheen sweep**: `pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms]` with a diagonal white gradient. Used on product renders + media covers.
- **Corner registration ticks**: 4 absolutely-positioned 3–3.5 spans with `border-t/l/r/b border-gold-2`, often inside an `inset-4 border-white/12` frame; reveal on `group-hover` for cards, always-on for media covers.
- **Index tick**: `w-6 h-px bg-gold` that widens to `w-10` on `group-hover`, beside a mono `01/02…` number (stats).
- **Gold-bar wire row**: hover grows a 2px gold left bar (`scale-y-0 → scale-y-100`), nudges padding (`hover:pl-3`), reveals a `→`, turns title gold. Active row marked separately (lit thumb + gold title + progress seam) so "live" never looks like a frozen border.

---

## 6. Home page section → effects map

| Section | Effects in play |
|---|---|
| **Hero** (`HeroSlider`) | grid-drift, dual corner `CircuitTraces`, centered `qs-glow`, registration ticks, `qs-rise` staggered headline, `qs-gold-shimmer` name, `qs-float`+`qs-breathe`+`qs-scan` product, `qs-spec` rows, `qs-hero-tab`/`qs-hero-arrow`, autoplay + progress |
| **Ticker** | dual `Marquee` (opposing directions) on dark band |
| **Products** | atmosphere recipe + light traces, hover-lift cards, product stages (scan/breathe/float/sheen/ticks), `qs-trace` header |
| **Stats** | dark band, top gold seam + glow wash, `CountUp` (`repeatEvery`) with `qs-gold-shimmer`, index ticks, staggered `Reveal` |
| **Applications** | `AppDeck` filmstrip (expand/cross-fade/desaturate, autoplay) + mobile stacked cards |
| **About** | full-bleed `qs-kenburns` photo, seam blend, dark traces + grid, `qs-live-dot` caption |
| **Showreel** | `VideoReel` (HD facade, `qs-play`, scan/breathe/sheen, playlist wire rows) |
| **CTA** | dark band, traces, `qs-glow`, hover image scale + inner gold glow |
| **Newsroom** | `NewsFeed` (immersive lead + wire feed, autoplay, scan/breathe/sheen) |

---

## 7. Accessibility & performance

- **`prefers-reduced-motion: reduce`** is handled centrally in `globals.css`: reveals show instantly, drifts/glows/floats/scans/marquees/shimmer/dots freeze, autoplay disables, progress seams become static. **Any new effect must add a reduced-motion fallback there.**
- Animate **compositor-cheap** props only — `transform`, `opacity`, `background-position`, `filter`. Avoid animating `width`/`height`/`top` except where already done (scan beam, filmstrip flex-grow, progress).
- All decorative layers are `aria-hidden="true"` / `pointer-events-none`.
- Autoplay UIs pause on hover **and** focus-within for keyboard users; sliders take ←/→.
- SSR-first: first slide/item + final count render server-side for crawlers & no-JS.

---

## 8. Checklist — applying to a new page

- [ ] Wrap section content in `<Reveal>`; stagger lists with `delay={i * 70}`.
- [ ] Add the §4 atmosphere stack (`qs-grid-bg qs-grid-drift` + optional traces/glow).
- [ ] Use `qs-wrap-wide` (edge-to-edge) or `qs-wrap` (1280px) per layout.
- [ ] Section header: eyebrow + `qs-live-dot` → `qs-h2`, bottom rule with `qs-trace`.
- [ ] Reuse a component (§2) for any feed/slider/deck rather than re-rolling autoplay.
- [ ] Living detail via §3 classes; hover detail via §5 patterns.
- [ ] Keep gold as accent only; respect 1px borders & `rounded-[2px/3px]` (design-guidelines P·05/P·06).
- [ ] Verify with reduced-motion enabled — nothing should move or break.
```
