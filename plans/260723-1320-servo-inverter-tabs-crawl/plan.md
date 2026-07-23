# Servo & Inverter Detail Pages — Tab-based Crawl

**Date:** 2026-07-23  
**Scope:** Crawl Introduction + Specs + Accessories + Documentation from savch.net detail pages  
**Output:** Expanded `series.json` + tabbed UI on SeriesDetail pages

---

## URLs to Crawl

### Inverters (biến tần)
- S600E: https://savch.net/minixilieS600E.html
- S3100AE: https://savch.net/tongyongxilieS3100AE.html
- Penta: https://savch.net/gongcheng.html

### Servo (động cơ)
- SDV3: https://savch.net/sdv3home/55.html
- SDA2: https://savch.net/sda2home/57.html

---

## Phase 1: Page Structure Analysis

**Task:** Scout each URL to understand:
- Tab structure (HTML selectors)
- Content in each tab (prose, tables, images, lists)
- Image sources (local vs CDN)
- Links to documentation / accessories

**Deliverable:** `analysis.md` with:
- Tab selectors + content structure
- Image extraction strategy
- Data mapping to schema

---

## Phase 2: Extend `series.json` Schema

Current `series.detail` structure:
```json
{
  "naming": { ... },
  "tables": [ ... ],
  "figures": [ ... ]
}
```

**Proposed new structure:**
```json
{
  "introduction": {
    "html": "...",  // HTML prose content (sanitized)
    "images": [ { "src": "...", "w": 900, "h": 600, "alt": "..." } ]
  },
  "specifications": {
    "tables": [ ... ],  // Existing spec tables
    "figures": [ ... ]   // Existing figures
  },
  "accessories": [
    {
      "kind": "motor|cable|connector|other",
      "name": "SCH 60mm Motor",
      "tag": "SCH060201C",
      "desc": "...",
      "image": { "src": "...", "w": 300, "h": 225, "alt": "..." },
      "link": "/products/sch-motor"  // cross-ref to series
    }
  ],
  "documentation": [
    {
      "title": "User Manual (Chinese)",
      "lang": "zh",
      "url": "https://savch.net/uploads/...",
      "format": "pdf",
      "size": "2.5 MB"
    }
  ]
}
```

**Note:** Keep existing `naming` + `specs` fields. Restructure as:
- `introduction`: new
- `specifications`: wrap existing `tables` + `figures`
- `accessories`: new (extract from page)
- `documentation`: new (extract from page)

---

## Phase 3: Crawl Script

**Tool:** Python + BeautifulSoup + PyMuPDF (existing approach)

**Script:** `scratchpad/crawl-series-tabs.py`

**Steps:**
1. Fetch page HTML
2. Extract tab content (Introduction, Specs, Accessories, Docs)
3. Sanitize HTML (keep `<p>, <strong>, <em>, <table>, <img>`)
4. Extract images → validate (PNG/JPG) → place in `public/img/products/series/{slug}/`
5. Extract doc links → validate (PDF exists) → store URL + metadata
6. Extract accessories → link to existing series (or mark for manual mapping)
7. Merge with existing `series.json` entry

**Output:** Updated `data/series.json` (commit-ready)

---

## Phase 4: UI Update — ProductDetailTabs

**Files:**
- `app/[locale]/products/_components/series-detail.tsx` — wrap content in tabs
- Add tab labels to `messages/en/product.json` + `messages/vi/product.json`

**Tab structure on SeriesDetail:**
1. **Introduction** → prose + images
2. **Specifications** → existing spec tables + figures (naming + tables + figures)
3. **Accessories** → grid of related series (motors, cables, connectors)
4. **Documentation** → download links (PDF list)

**Fallback:** If tab empty → show placeholder ("Coming soon")

---

## Acceptance Criteria

- [ ] All 5 URLs crawled successfully
- [ ] Images processed + placed in correct path
- [ ] `series.json` updated with new schema (all 5 series)
- [ ] SeriesDetail UI shows 4 tabs (Intro, Specs, Accessories, Docs)
- [ ] Tab content renders correctly (images, tables, links)
- [ ] Cross-links to related series work (accessories tab)
- [ ] i18n works (both EN + VI labels)
- [ ] Type checking passes (`npx tsc --noEmit`)
- [ ] No regressions in existing detail pages

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Page structure changed | Scout first; build selectors resilient to minor layout changes |
| Images fail to load | Validate with magic numbers; skip corrupt images; log warnings |
| Doc links broken | Check HTTP status; skip 404s; fall back to archive links |
| Large HTML prose | Limit to first N characters; truncate with "..." if over 2000 chars |
| Accessories link mismatch | Manual mapping post-crawl if needed |

---

## Next Steps

1. ✅ Approve this plan
2. → Phase 1: Scout page structure + propose selectors
3. → Phase 2: Update schema + validate
4. → Phase 3: Crawl script + test on 1 URL
5. → Phase 4: UI components + integrate
6. → Phase 5: QA + commit
