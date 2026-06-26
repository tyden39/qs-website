# Design Guidelines

> *Industrial precision, made legible.*
> Source: `design-concept.md` (DC-2026 · Rev 01) — this file is the implementation companion that maps the concept to Tailwind tokens, CSS classes, and codebase conventions.

The visual language is **technical drawing meets editorial print**: warm paper background, carbon ink, gold-bronze accents, and JetBrains-Mono labels that frame each section like an engineering drawing. The goal: gợi cảm giác *bản vẽ kỹ thuật + bảng định mức + tấm nhãn máy*. **Never** SaaS gradients, glows, or emoji.

## Philosophy — 6 Principles

| # | Principle | Implementation rule |
|---|---|---|
| P·01 | **Bản vẽ kỹ thuật** | 1px sharp borders, 32px grid, faint gridlines. No large rounding, no soft drop shadows. |
| P·02 | **Vật liệu thật** | Paper `#f5f3ee`, carbon `#0a0a0a`, gold-bronze `#c9a35a`. Colors evoke materials, not pixels. |
| P·03 | **Đọc được từ xa** | Inter Tight bold display with `-0.02em`. Hierarchy always 3-tier: *eyebrow mono → display → body sans*. |
| P·04 | **Mono = số liệu** | JetBrains Mono reserved for product codes, eyebrows, labels, breadcrumb, footer — every "this is technical data" signal. |
| P·05 | **Vàng dùng tiết kiệm** | Gold appears only at: highlight em-text, active menu underline, image-placeholder corner ticks, badges, corner accents. **Never** as a large background. |
| P·06 | **Lưới = quyền lực** | 1280px · 12 cols · gutter 16 · padding 48. Every section gets a 1px top/bottom border. No floating blocks. |

> **Manifesto** — "Bộ điều khiển CNC tốt là bộ điều khiển không cần hướng dẫn sử dụng. Website của nó cũng vậy."

## Color tokens

Tokens live in [app/globals.css](app/globals.css) under `@theme`. Use them via Tailwind utilities (`bg-paper`, `text-ink`, `border-line`, `text-gold-1`, etc.).

### Primary

| Token | Hex / Value | Role |
|---|---|---|
| `--color-ink` | `#0A0A0A` | Foreground for ≥80% of text on paper. Footer, nav. |
| `--color-paper` | `#F5F3EE` | Default body background. Warmer than white — reduces glare. |
| `--gold-grad` | `linear-gradient(180deg, #f0d28a, #c9a35a, #8a6f35)` | Sole chromatic accent. Headline `em`, gold buttons, badges. |
| `Snow` (white) | `#FFFFFF` | Card / panel background to separate from paper. **Never** as page background. |

### Neutrals — warm gray scale (hue ~60°, sat < 2%)

| Token | Hex | Usage |
|---|---|---|
| `paper-0` | `#fafaf7` | Hero gradient top |
| `paper-1` / `--color-paper-2` | `#f0eee8` → `#ecebe5` | Card placeholder, hover background |
| `--color-line` | `#d8d6cf` | Borders / dividers |
| `--color-line-2` | `#b8b6ae` | Stronger dividers |
| `--color-muted` | `#6b6960` | Secondary text, mono labels |
| `--color-ink-2` | `#1a1a1a` | Footer, body text |
| `--color-ink-3` | `#2a2a2a` | Borders inside dark sections |

> **Never** use cool gray — it breaks the paper feel.

### Gold scale (on-paper vs on-dark)

| Token | Hex | When to use |
|---|---|---|
| `--color-gold` | `#c9a35a` | Strokes, accent rules, icons |
| `--color-gold-1` / `--color-gold-3` | `#8a6f35` | Eyebrow text **on paper** |
| `--color-gold-2` | `#e8c878` | Gold text **on dark** (factory, CTA, stat blocks) |

### Status (use sparingly — forms / alerts only)

| Token | Hex | Use |
|---|---|---|
| `accent` | `#1F6FEB` | Link, focus ring |
| `ok` | `#3A7D5C` | Success, "Do" tag |
| `--color-rust` / `danger` | `#C8553D` | Alert, "Don't" tag, status dots, video play indicator |

> Status colors **never** appear in marketing UI.

## Typography

Three families, three voices. **No fourth font.**

| Variable | Family | Weights | Role |
|---|---|---|---|
| `--font-display` | **Inter Tight** | 700 / 600 | Headlines, hero, `qs-h1`/`h2`/`h3` |
| `--font-sans` | **Inter** | 400 / 500 / 600 / 700 | Body copy, UI |
| `--font-mono` | **JetBrains Mono** | 400 / 500 | Eyebrow, label, code, numbers |

### Type scale

| Token | Spec |
|---|---|
| `.qs-h1` | Inter Tight 700 · `clamp(36px, 4.6vw, 64px)` · `-0.025em` · line-height 1.02 |
| `.qs-h2` | Inter Tight 700 · `clamp(26px, 2.4vw, 36px)` · `-0.02em` · line-height 1.1 |
| `.qs-h3` | Inter Tight 600 · 20px · `-0.01em` |
| `.qs-lede` | Inter 400 · 17px · 1.55 · max 60ch |
| Body | Inter 400 · 15px · 1.55 |
| `.qs-eyebrow` | JetBrains Mono 500 · 11px · `0.18em` · UPPER · gold-1, with 24px gold dash before |
| Mono code | JetBrains Mono 500 · 13px · `0.06em` |

Hero variants may override `.qs-h1` with inline `style={{ fontSize: "clamp(...)" }}`. Keep letter-spacing `-.02em` to `-.025em`.

## Layout

1280px container · 12 cols · gutter 16 · padding 48 — **no exceptions**.

| Rule | Value | Note |
|---|---|---|
| Container | `.qs-wrap` — `max-w-wrap` (1280px) · `px-12` | Mobile (<900px) drops to `--pad: 24px`. |
| Section padding | `py-20` to `py-24` (80–96px) | Dense narrative blocks: `py-16`. Tight stacks: `py-12`. |
| Grid gap | `gap-px` over `bg-line` | Faux 1px engineering rule between cards. Inner cards sit on `bg-white`/`bg-ink`. |
| Grid gap (airy) | `gap-6` (24px) | When breathing room is needed (apps grid). |
| Radius | `rounded-[3px]` | Only on buttons / inputs. Cards & images: 0px. |
| Section head | `.qs-section-head` | Eyebrow + h2 left, CTA right, bottom rule. |

### Layout patterns

- **Hero** — 12-col full or 7/5 split (headline + lede vs. visual)
- **Product strip** — 3 cols, `gap-px`, gold tick top of each cell
- **Apps grid** — 4 cols, `gap-6`, bordered cards
- **Dark stats** — 4 cols on `#0e0e0c`, gold tick top-left per cell

## Motifs — 6 signature details

These are the brand DNA. Without them, the page still works — but stops feeling QS.

| # | Motif | Implementation |
|---|---|---|
| M·01 | **Corner tick · 4 corners** | 14px L-shape, 1.5px stroke, gold-bronze. Placed at 2 symmetric corners of image placeholders. |
| M·02 | **Gold gradient clip** | Headline `<em>` uses `background-clip: text` with 3-stop gold gradient. |
| M·03 | **Mono ribbon · tag** | Black bg, gold text. Used for product badges, top-strip nav (`.qs-topstrip`). |
| M·04 | **Striped placeholder** | `.qs-img-ph` — 45° stripes + corner tick. **Every** un-imaged slot uses this; no icon-set fallback. |
| M·05 | **Spec stamp · 2-line** | Technical name above (mono · gold), commercial name below (display · ink). |
| M·06 | **Background grid 32px** | `.qs-grid-bg` — `rgba(0,0,0,.04)` overlay on hero sections to reinforce the drawing feel. |

## Components

Each component has **one correct variant**. Extend via size or state modifiers, not structural rewrites.

### Buttons

| Class | Use |
|---|---|
| `.qs-btn` | Primary — ink background, white text |
| `.qs-btn-gold` | Main CTA — gold gradient, gold-3 border, ink text |
| `.qs-btn-ghost` | Secondary — ink outline, inverts on hover |
| `.qs-btn-sm` | Compact modifier — padding 7×12, 12px font |
| `.qs-link` | Mono pill text-link, e.g. "Xem catalogue →" |

Always include the arrow: `→` for primary CTAs, `↓` for downloads, `‹` `›` for pagination, `↵` for submit. **No emoji.**

### Tags & eyebrows

- `.qs-tag` — mono 10px, `tracking-[.12em]`, `border-line`, padding 4×8
- `.qs-eyebrow` — mono 11px, `tracking-[.18em]`, 24px gold dash before
- `.qs-crumb` — breadcrumb mono, separator at opacity 0.4

### Product card (`.qs-card`)

- White bg, `border-line` 1px, `rounded-[3px]`
- Structure: `num` (mono · gold) → `img` (placeholder) → `h5` (display) → `ft` (mono)
- Hover: `-translate-y-0.5` + `border-ink-3`
- 24px gold corner accent top-right (M·01 variant)

### Dark stat-row

- Background `#0e0e0c`, 3–4 cols, `gap-px` on `#2a2620`
- 24×2px gold tick top-left of each cell
- Number: Inter Tight 700, `gold-2`, 28–48px
- Label: mono 9–10px, `tracking-[.16em]`, `#7a7570`

## Imagery

- **No bitmap product photos yet.** Visuals are inline SVG technical drawings — see [app/page.tsx](app/page.tsx) and [app/products/[slug]/page.tsx](app/products/[slug]/page.tsx) for canonical examples.
- **Placeholders** use `.qs-img-ph` (striped) or radial gradient `radial-gradient(circle, #fff, #f0eee8)` with a mono caption like `FIG · 01`.
- **Aspect ratios**: `aspect-[4/5]`, `aspect-[5/3]`, `aspect-video`, `aspect-square`.
- **Logo**: `public/logo-st.png` — Header (`h-[42px]`), Footer (`h-12`, `brightness-105`).

## Background patterns

- `.qs-grid-bg` — 32px technical grid. Low opacity (`opacity-50` light / `opacity-[.12]` dark) inside `.relative` parent.
- Hero gradient: `linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)` applied inline.

## Dark sections

Used on: home stats strip, application hero, About factory, "By the numbers", newsletter / final CTA.

- Background `bg-ink`, text `text-[#cfc9b8]`
- **Switch gold** from `gold-1` (#8a6f35) → `gold-2` (#e8c878) for legibility
- Borders shift `line` (#d8d6cf) → `[#2a2620]` / `[#2a2a2a]`

## Iconography

- 14×14 to 18×18 stroke icons inline as SVG. `stroke="currentColor"` so they inherit text color.
- 22×22 rounded check / dash badges in feature tables.
- 9×13 Vietnam flag as CSS pseudo-element on `.qs-icon-btn .flag` for the language toggle.

## Spacing rhythm

- Vertical: `mb-3.5` (eyebrow → headline), `mt-2` (headline → subtitle), `mt-5`/`mt-6`/`mt-7` (intro), `mt-10`/`mt-12` (section breaks)
- Cards: `p-6`–`p-8` by content density. Aside callouts: `p-7`.

## Motion

> Full motion + effects catalog: [home-effects-and-motion.md](home-effects-and-motion.md) — scroll-reveal, ambient drift, PCB traces, scan beams, autoplay feeds, and the reusable component/utility list. **That file is canonical for motion.**

- Subtle hover translations: `hover:-translate-y-0.5`, `hover:-translate-y-px`
- Hover bg swaps: `hover:bg-paper`, `hover:bg-paper-2`
- Search panel: `max-height` transition (`.28s ease`) — **do not** rewrite as height transition
- Scroll-reveal (`<Reveal>`) and perpetual ambient motion are now part of the language; all of it respects `prefers-reduced-motion`. Keep motion subtle/industrial — no SaaS bounce, no scroll-jacking parallax.

## Forms

- Label: mono uppercase 10–11px in muted, 6px bottom margin
- Input: `border border-line` on white, `focus:border-ink` (no ring)
- Radio chips: pill border, hardens to `border-ink` on hover
- `Field` and `RadioGroup` are duplicated in [app/services/page.tsx](app/services/page.tsx) and [app/contact/page.tsx](app/contact/page.tsx). If a third form appears, lift them to `components/Form.tsx`.

## Voice & copywriting

> Như một kỹ sư trưởng — ngắn, chính xác, không phô trương.

Short sentences. Concrete numbers. Full technical codenames. Avoid empty marketing words.

### ✅ Do

- "Bộ điều khiển F-86 · 6 trục · 24V"
- "Lắp đặt trong 4 giờ. Bảo hành 36 tháng."
- "12,400 bộ đang vận hành tại Việt Nam."
- Numbers first, explanation after
- Codenames always in mono

### ❌ Avoid

- "Giải pháp công nghệ đột phá cho ngành 4.0"
- "Trải nghiệm khác biệt, tiên phong"
- "Đồng hành cùng quý khách hàng…"
- Emoji ✨🚀💡 — never
- SaaS buzzwords: "seamless", "synergy"
- Marketing claims without numeric backing

## Don't

- Don't introduce new color tokens or fonts without updating both this file and [app/globals.css](app/globals.css).
- Don't use `rounded-xl`/`2xl`. Corner radius is `rounded-[2px]`–`rounded-[3px]` only.
- Don't add drop shadows beyond the soft `qs-card` hover shadow.
- Don't decorate buttons with emoji. Use `→`, `↓`, `↵`, `›`, `‹`, `+`, `✕`.
- Don't break the **eyebrow → headline → lede → action** sequence in marketing sections.
- Don't use gold as a large background fill (P·05).
- Don't drop the 1px section borders (P·06).

---

*Implementation companion to `design-concept.md` (DC-2026 · Rev 01).*
