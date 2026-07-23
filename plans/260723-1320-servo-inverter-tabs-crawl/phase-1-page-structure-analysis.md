# Phase 1: Page Structure Analysis & Crawl Strategy

**Date:** 2026-07-23  
**Status:** ✅ Complete  
**Scope:** 7 detail pages across servo + inverter product lines

---

## URLs Analyzed

### Servo (2 series)
- ✅ https://savch.net/sdv3home/55.html
- ✅ https://savch.net/sda2home/57.html

### Inverters (5 models)
- ✅ https://savch.net/minixilieS600E/328.html (S600E model A)
- ✅ https://savch.net/minixilieS600E/8.html (S600E model B)
- ✅ https://savch.net/tongyongxilieS3100AE/53.html (S3100AE)
- ✅ https://savch.net/gongcheng/314.html (Penta model A)
- ✅ https://savch.net/gongcheng/313.html (Penta model B)

---

## Unified Tab Structure

**All 7 pages use identical 5-tab layout:**

| # | Tab ID | Tab Label (CN) | Content Type | Mapping | Notes |
|---|--------|---|---|---|---|
| 1 | `intro` | 产品介绍 | HTML prose + images | → `introduction` tab | Product description, features, images |
| 2 | `params` | 产品参数 | Specifications (table/images/grid) | → `specifications` tab | Rated voltage, frequency, power range, dims |
| 3 | `video` | 操作视频 | Empty placeholder | → Skip (not needed) | Always "暂无操作视频" — no content to crawl |
| 4 | `downloads` | 资料下载 | Multi-format document links | → `documentation` tab | PDFs (manual, brochures, cert), RAR (drawings, soft), ZIP (tools) |
| 5 | `accessories` | 可选配件 | Product image gallery | → `accessories` tab | 4–9 images, mostly decorative; need text link mapping |

---

## Content Extraction Strategy

### Tab 1: 产品介绍 (Introduction)

**Content:**
- Prose description (2–5 paragraphs)
- Product feature images (8–9 images in grid)
- Inline product specs as text (voltage, frequency, power, control modes)

**Extraction:**
- Extract prose HTML → sanitize (keep `<p>, <strong>, <em>, <br>`)
- Extract images → validate (PNG/JPG) → save to `public/img/products/series/{slug}/intro/`
- Limit HTML to 2000 chars; truncate with "…" if longer

**Field mapping:**
```json
{
  "introduction": {
    "html": "Sanitized prose content...",
    "images": [
      { "src": "/img/products/series/sdv3/intro/img-001.webp", "w": 900, "h": 600, "alt": "..." }
    ]
  }
}
```

### Tab 2: 产品参数 (Specifications)

**Content:**
- Spec images (technical diagrams, dimensional drawings, wiring schematics)
- OR spec table (HTML grid, JSON data)
- Parameter labels + values

**Extraction:**
- Extract images → validate → save to `public/img/products/series/{slug}/specs/`
- If HTML table present: parse columns/rows → CSV → convert to schema
- Keep existing `tables` + `figures` structure (user wants to preserve)

**Field mapping:**
```json
{
  "specifications": {
    "tables": [ /* existing model selection tables */ ],
    "figures": [
      { "src": "/img/products/series/sdv3/specs/sch-motor.webp", "w": 900, "h": 1170, "alt": "..." }
    ]
  }
}
```

**Note:** User wants to keep existing product specification tables on UI — do NOT replace with new data from this tab. This tab provides *supplementary* technical reference images.

### Tab 3: 操作视频 (Videos)

**Status:** Skip — all pages show "暂无操作视频" (no videos available)

### Tab 4: 资料下载 (Downloads / Documentation)

**Content:**
- Document list grouped by category:
  - 产品手册 (Product Manuals) — 3–5 PDFs
  - 图纸 (Technical Drawings) — 2–6 PDFs + RAR files
  - 软件 (Software) — 0–4 RAR/ZIP archives
  - 彩页 (Brochures) — 1 PDF
  - 证书 (Certificates) — 1 PDF (CE marking)
- Each doc: title, size, language, download link

**File format counts observed:**
- **S600E/328:** 9 PDFs + 2 RAR = 11 files
- **S3100AE/53:** 11 PDFs + 2 RAR = 13 files
- **Penta/313:** 2 PDFs + 1 RAR + 1 ZIP = 4 files

**Extraction:**
- Parse document table → extract title, language, URL, file size
- Validate URLs (HTTP HEAD request)
- Categorize by type (manual, drawing, software, brochure, cert)
- Store as array (do NOT download files; just catalog URLs)

**Field mapping:**
```json
{
  "documentation": [
    {
      "title": "S600E User Manual (Chinese)",
      "category": "manual",
      "lang": "zh",
      "url": "https://savch.net/uploads/20250904/...",
      "format": "pdf",
      "size_mb": 4.4,
      "date": "2025-09-04"
    },
    {
      "title": "Dimensional Drawings (2D/3D)",
      "category": "drawing",
      "lang": "en",
      "url": "https://savch.net/uploads/20250905/...",
      "format": "rar",
      "size_mb": 2.1
    }
  ]
}
```

### Tab 5: 可选配件 (Accessories)

**Content:**
- Product images (4–9 images per page)
- Product names / model codes (often in image alt text or nearby labels)
- Links to product detail pages (sometimes)

**Extraction:**
- Extract images → validate → save to `public/img/products/series/{slug}/accessories/`
- Extract image alt text or nearby text → parse for product codes (SCH, DL-, SA2FK-, etc.)
- Try to link to existing series by matching slug (e.g., `sch-motor`, `dl-power-cable`)
- If no match: create placeholder entry for manual review

**Field mapping:**
```json
{
  "accessories": [
    {
      "kind": "motor",
      "slug": "sch-motor",  // link to series
      "name": "SCH Servo Motor",
      "tag": "H series",
      "image": { "src": "/img/products/series/sdv3/accessories/motor.webp", "w": 300, "h": 225, "alt": "..." }
    },
    {
      "kind": "cable",
      "slug": "dl-power-cable",
      "name": "Power Cable DL-",
      "tag": "DL-SCH086(ZD1V)-N-L",
      "image": { "src": "/img/products/series/sdv3/accessories/cable.webp", "w": 300, "h": 225, "alt": "..." }
    }
  ]
}
```

---

## Image Processing Pipeline

**Reuse existing approach** (from servo-subgroup-crawl):

1. **Validate:** PNG must have `IEND` chunk; PDF must open in PyMuPDF; JPG must decode
2. **Convert:** All images → WebP (better compression, browser support)
3. **Resize:** 
   - `intro` images: max 1200px width
   - `specs` images: max 1200px width (keep aspect ratio)
   - `accessories` images: max 300px width (thumbnail)
4. **Deduplicate:** Skip if image already in `public/img/products/series/{slug}/`
5. **Place:** `public/img/products/series/{slug}/{section}/`

**Tool:** ImageMagick + WebP codec (or sharp.js in Node)

---

## HTML Sanitization Rules

**Allowed tags:** `<p>, <br>, <strong>, <em>, <b>, <u>, <ul>, <ol>, <li>, <h2>, <h3>, <a>, <blockquote>`  
**Allowed attrs:** `href, title, rel, target`  
**Tool:** isomorphic-dompurify (already used in codebase)

---

## Document URL Validation

**Strategy:**
```bash
for each doc_url:
  HTTP HEAD request → check status 200 + content-type (application/pdf, etc.)
  if not found (404): SKIP or mark as "broken"
  if redirects: follow → update URL
  if timeout: retry 2x, then skip
```

**Tool:** Node.js `https` module or `curl`

---

## Mapping to Series

### Current `series.json` entries to update:

**Servo:**
- `sdv3` (from `/sdv3home/55.html`)
- `sda2` (from `/sda2home/57.html`)

**Inverters:**
- `s600e` (from `/minixilieS600E/328.html` + `/minixilieS600E/8.html`)
  - Decide: merge both models into 1 series entry, or create separate?
  - **Recommend:** 1 entry for `s600e` series (both models share same hardware class)
- `s3100ae` (from `/tongyongxilieS3100AE/53.html`)
- `penta` (from `/gongcheng/313.html` + `/gongcheng/314.html`)
  - Decide: merge both models or separate?
  - **Recommend:** 1 entry for `penta` series (both 4T and 12T variants)

---

## Schema Summary

**New fields added to `series.detail`:**

```json
{
  "naming": { /* existing */ },
  "introduction": {
    "html": "string",
    "images": [{ "src": "string", "w": number, "h": number, "alt": "string" }]
  },
  "specifications": {
    "tables": [{ /* existing */ }],
    "figures": [{ "src": "string", "w": number, "h": number, "alt": "string", "srcEn": "string", "altEn": "string" }]
  },
  "documentation": [
    {
      "title": "string",
      "category": "manual | drawing | software | brochure | certificate",
      "lang": "zh | en | vi | id",
      "url": "string (https://...)",
      "format": "pdf | rar | zip",
      "size_mb": number,
      "date": "YYYY-MM-DD"
    }
  ],
  "accessories": [
    {
      "kind": "motor | cable | connector | other",
      "slug": "string (series slug)",
      "name": "string",
      "tag": "string (model code)",
      "image": { "src": "string", "w": number, "h": number, "alt": "string" }
    }
  ]
}
```

---

## Next Phase: Phase 2 → Schema Validation

- [ ] Finalize structure (confirm with user)
- [ ] Update TypeScript types in `lib/data/series.ts`
- [ ] Add i18n keys to `messages/*/product.json`
- [ ] Create migration script (add new fields to existing entries)

---

## Questions / Blockers

1. **S600E + Penta variants:** Should we merge model A + B into 1 series entry, or keep separate?
   - **Answer needed:** Merge or split?
2. **Accessories linking:** How to handle if product code extracted doesn't match any series slug?
   - **Option:** Skip, or create orphan entry for manual review later?
3. **Documentation crawl:** Should we store file URLs only, or also download + hash for CDN replication?
   - **Answer needed:** URL storage or full download?

