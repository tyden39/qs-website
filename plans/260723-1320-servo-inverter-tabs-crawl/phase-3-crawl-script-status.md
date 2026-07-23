# Phase 3: Crawl Script — Status Report

**Date:** 2026-07-23  
**Status:** 🟡 In Progress (skeleton + placeholders)

---

## What's Done ✅

1. **Script skeleton:** `scripts/crawl-series-detail-tabs.py`
   - Loads `series.json`
   - Fetches all 7 URLs via BeautifulSoup
   - Defines `crawl_page()` → extracts 4 tabs
   - Image download + WebP conversion pipeline
   - Logging + error handling

2. **Dependencies verified:**
   - `requests` (HTTP fetch)
   - `beautifulsoup4` (HTML parsing)
   - `pillow` (image processing)

3. **Output structure ready:**
   - `TabContent` TypedDict (introduction_html, introduction_images, documentation, accessories)
   - Series mapping (crawl keys → series slugs)

---

## What Needs Fine-Tuning 🔧

### 1. HTML Selectors (BLOCKING)

Current script uses **placeholders**:
```python
intro_tab = soup.find("div", {"data-tab": "intro"})
docs_tab = soup.find("div", {"data-tab": "downloads"})
acc_tab = soup.find("div", {"data-tab": "accessories"})
```

**Action needed:** Inspect actual pages to find real selectors.

**Method 1 — Browser DevTools:**
- Open https://savch.net/sdv3home/55.html in Chrome
- Right-click intro tab → Inspect
- Note the actual `class`, `id`, `data-*` attributes
- Test selector in Console: `document.querySelector("...")`

**Method 2 — Script inspection:**
```python
soup = BeautifulSoup(requests.get(url).content, "html.parser")
# Print all divs with class containing 'tab'
for div in soup.find_all("div", class_=re.compile("tab")):
    print(div.get("id"), div.get("class"))
```

**Once you find selectors:**
- Update `extract_introduction_html()` selector
- Update `extract_documentation()` selector
- Update `extract_accessories()` selector

---

### 2. Category Detection (Documentation)

Current logic:
```python
if "drawing" in href.lower() or "图纸" in title:
    category = "drawing"
```

**Better approach:** Parse document table structure to detect category from table headers.

**Observed from Phase 1 analysis:**
- 产品手册 (Manual) → PDF titles contain "手册", "Manual", "User"
- 图纸 (Drawing) → titles contain "图纸", "Drawing", size > 1MB, format RAR
- 软件 (Software) → titles contain "软件", "Software", format RAR/ZIP
- 彩页 (Brochure) → title contains "彩页", "Brochure"
- 证书 (Certificate) → title contains "证书", "Certificate", small PDF

**Action:** Refine regex patterns + file size detection.

---

### 3. Accessories Slug Mapping (Requires Manual Review)

Current hardcoded mapping:
```python
if "SCH" in alt:
    product_code = "sch-motor"
elif "DL-" in alt:
    product_code = "dl-power-cable"
elif "SA2FK" in alt:
    product_code = "sa2fk-encoder-cable"
```

**Problem:** Not all products may have these codes in alt text.

**Action needed:**
1. After first crawl run, review extracted accessories
2. Build accurate product code → series slug mapping
3. Update script OR handle unknowns gracefully (skip with warning)

---

### 4. Image Processing

**Current:** Download image → validate → convert to WebP → save

**Missing:**
- Deduplicate (skip if already in public/img/...)
- Resize (limit width to 1200px for intro, 300px for accessories)
- EXIF data cleanup
- Fallback if WebP conversion fails (keep as PNG/JPG)

**Recommended:** Use existing image processing from the codebase (check if there's a helper).

---

### 5. Series Merging (Not Implemented)

Current script only **crawls and prints**. Missing:
1. Merge `TabContent` into `series.detail` structure
2. Handle image paths (generate `/img/products/series/{slug}/intro/img-001.webp`)
3. Write updated `series.json` with new fields
4. Git commit message + change summary

**Pseudocode:**
```python
series["detail"]["introduction"] = {
    "html": content["introduction_html"],
    "images": [
        {
            "src": "/img/products/series/sdv3/intro/img-001.webp",
            "w": 1200,
            "h": 800,
            "alt": "...",
            "altEn": "..."  # Need both locales!
        }
    ]
}
series["detail"]["documentation"] = content["documentation"]
series["detail"]["accessories"] = content["accessories"]

# Write back
with open(SERIES_JSON, "w") as f:
    json.dump(series_data, f, indent=2, ensure_ascii=False)
```

---

## Test Plan

**Phase 3a — Debug Selectors (1 URL)**
```bash
python3 scripts/crawl-series-detail-tabs.py --debug https://savch.net/sdv3home/55.html
```
- Prints all discovered tabs + content
- Verify selectors are correct
- Iterate until tabs are found

**Phase 3b — Crawl & Validate (all 7 URLs)**
```bash
python3 scripts/crawl-series-detail-tabs.py
```
- Crawls all 7 URLs
- Downloads images
- Merges into series.json
- Prints summary

**Phase 3c — QA**
- `npx tsc --noEmit` (type check)
- `npx eslint app lib data` (linting)
- Visual inspection of images in `public/img/`
- Load detail page in browser → verify tabs render

---

## Known Blockers

1. **HTML selector discovery** — Need actual DevTools inspection or BeautifulSoup dump
2. **Document language detection** — Can't auto-detect lang from URL/title reliably
3. **Image alt text localization** — Currently only EN alt present; need VI translations
4. **Accessor linking** — Some product images may not have identifiable codes

---

## Next Steps

1. **User confirms:** Which URL to test first? (recommend: SDV3)
2. **Debug selectors:** Inspect actual HTML + update script
3. **Run Phase 3a:** Verify tabs are extracted correctly
4. **Implement merging:** Add code to update series.json
5. **Test Phase 3b:** Crawl all 7 URLs
6. **QA Phase 3c:** Visual + type check

---

## Files to Update

- ✅ `data/series.ts` — types added
- ✅ `lib/data/series.ts` — toDetailView updated
- ✅ `messages/*/product.json` — tab labels added
- ⏳ `app/[locale]/products/_components/series-detail.tsx` — add ProductDetailTabs (Phase 4)
- 🟡 `scripts/crawl-series-detail-tabs.py` — selectors + merging (Phase 3)

---

## Confidence Level

- Schema update: **High** (types, i18n verified, no errors)
- Crawl script skeleton: **Medium** (structure good, selectors need validation)
- End-to-end flow: **Medium** (depends on actual HTML structure)

