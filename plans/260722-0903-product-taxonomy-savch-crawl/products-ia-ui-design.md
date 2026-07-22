# /products — Unified 6-Group Catalog: IA + UI Design

Source: kongming advisory (2026-07-22). Locked decisions upstream: Máy CNC merges as a
tab in /products while /cnc stays the marketing page; machine detail URLs stay at
/cnc/[slug]; Servo → QS brand, Biến tần → Savch brand.

## Top-level IA — flat 6-tab strip (keep existing `ProductCategoryTabs`)

Order + counts (count = browsable units in panel):

```
Máy CNC (07) · Bộ điều khiển (07) · Servo (02) · Biến tần (04) · DNC (02) · Phụ kiện (06)
```

- Reject landing grid / grouped tabs / two-level nav — labels are short, strip already
  overflow-scrolls (`min-w-max`), mounted-hidden panels preserve filter state.
- Series/sub-group selection lives INSIDE the panel, never in the top strip (respects the
  3-level affordance hierarchy: L1 underline nav · L2 bordered sidebar list · L3 black-fill chips).
- Mobile `<select>` carries only the 6 groups; nested selection stays in-panel.
- A tab ships only when its panel is self-sufficient (real render thumb, complete facts,
  working CTA). Never a phantom count or empty "coming soon" tab.

### IA tree

```
/products (catalog)
├─ Máy CNC ......... MachineList (grid + spec panel)      → /cnc/[slug]   [Phase 1 ✅]
├─ Bộ điều khiển ... ProductListFilter (sidebar+chips+sort) → /products/[slug]
├─ Servo (QS) ...... SeriesList: SDV3, SDA2               → quote CTA   [Phase 2b]
│    Phase B: + sub-group chips [Tất cả|Driver|Motor|Cáp|Đầu nối] + part rows [Phase 3]
├─ Biến tần (Savch)  SeriesList: S600/E, S3100A/E, Penta, UHS BLDC → quote CTA [Phase 2a]
├─ DNC ............. CatalogList (unchanged)
└─ Phụ kiện ........ CatalogList (unchanged)
/cnc (marketing line page — unchanged, locked)
```

New data later: `data/servo.json` + `data/inverter.json` with `lib/data/{servo,inverter}.ts`
(VI-primary + `*En`, same convention as `catalog.ts`). Do NOT overload `catalog.json`.

## Nested groups (Servo / Biến tần)

- **Biến tần** (4 series, no sub-groups): reuse `CatalogList` shell → 4 stacked series cards.
  No sidebar, no chips (4 items is under the "filter is more chrome than help" threshold).
- **Servo Phase A** (now): same — 2 series cards (SDV3, SDA2), each with a static 4-cell
  composition strip (Driver ✓ / Motor·Cáp·Đầu nối = "Đang cập nhật").
- **Servo Phase B** (part-numbers from PDFs): graduate to `ProductListFilter` architecture —
  L2 series list (sidebar) + L3 part-type chips (black-fill legit here = attribute filter) +
  dense part rows.

## Card system — 4 tiers, one shared header grammar

Shared grammar: mono index `NN / NN` · mono uppercase tag · display-font name · spec cells
(mono label-xs over semibold value) · render on light radial tile
`radial-gradient(circle at 50% 38%, #fff, #ecebe5)` · gold hover scan · white/transparent
renders only (no lifestyle shots in lists).

| Tier | Groups | Component | Status |
|---|---|---|---|
| Machine grid + spec panel | Máy CNC | `MachineList` | exists |
| Bundle card | Bộ điều khiển | `ProductBundleCard` | exists |
| **Series card** | Servo, Biến tần | new (variant of `CatalogProductCard`) | build |
| Catalog card | DNC, Phụ kiện | `CatalogProductCard` | exists |
| **Part row** | Servo parts | new | Phase 3 |

Series card: 2-col. Left = render on tile (no image → dashed gold frame + "Hình ảnh đang
cập nhật"), brand tag (`QS SERVO SERIES` / `SAVCH`), series name, one-line positioning.
Right = series-level spec cells (power/voltage/frequency/comms/control/motor/apps) — **omit
unknown cells, never render "—"**. Footer = `Nhận báo giá →` (/contact?product=slug), optional
`Datasheet (PDF) ↓`. Whole card is NOT a link (no dead detail links). When a detail page
ships, primary flips to "Xem chi tiết →", quote demotes — same slot.

## Hero generalization (done Phase 1)

- Copy (existing `product.page` keys, new values): heading `Sản phẩm QS` / `QS Products`
  (gold word = clean `QS`/`Products`); eyebrow, lede, features rewritten catalog-wide;
  breadcrumb ends at Sản phẩm (dropped redundant 3rd crumb). New key `tiles`.
- Media: single controller render → **tri-tile system chain** (Máy `qsm215.webp` · Điều khiển
  `astro-10i-front.webp` · Truyền động `components/servo-drive.webp`) on radial tiles inside
  the same dashed-gold frame + `qs-scan`. Zero new assets.
- SEO `productsTitle/Description` → catalog-wide. OG image left for the parked brand-copy decision.

## Rollout phases (each independently shippable)

- **Phase 1 — DONE (2026-07-22):** Máy CNC tab (reuse `MachineList` + `getMachines`), hero
  copy + tri-tile + breadcrumb + seo strings. `/cnc` untouched. Verified tsc + i18n + lint.
- **Phase 2a — Biến tần tab:** `data/inverter.json` (4 series from crawl notes), CatalogList
  shell, 4 series cards. Blocking: 4 Savch renders (+ redistribution OK); crawl Penta kW/V.
- **Phase 2b — Servo tab:** 2 series cards, `QS SERVO SERIES` tag, composition strip.
  Blocking: 2 driver renders; rebrand call (default: keep Savch model codes SDV3/SDA2, brand
  the line "QS Servo" — rewriting part-numbers breaks ordering/support parity).
- **Phase 3 — Servo parts:** motor/cable/connector tables from PDFs → sidebar-series +
  sub-group chips + part rows.
- **Phase 4 — optional:** series detail pages at /products/[slug], cross-links.

## Biggest risk

**Mixed-fidelity patchwork** — deep tabs (machines, controllers) next to thin placeholders
erode datasheet-grade trust. Mitigations built in: phase gates (tab ships only when
self-sufficient), placeholders are series-level FACTS not empty shells, no dead links (quote
CTA is terminal), counts never promise phantom items. Secondary risk: **role drift** between
/products (catalog) and /cnc (storytelling) — enforce "catalog features → /products,
storytelling → /cnc".
