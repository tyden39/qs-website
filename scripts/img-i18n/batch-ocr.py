#!/usr/bin/env python3
"""OCR every product detail image once and emit one spec JSON per image.

Each spec item carries the detected box, the raw OCR text, and (for boxes that
contain Chinese characters) an empty "vi" field to be filled in by translation.
Pure Latin / numeric boxes get "vi": null so the renderer leaves them untouched.

Usage:
    batch-ocr.py <out_specs_dir> [series ...]
"""
import sys, os, json, re
import numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR

SERIES_ROOT = "public/img/products/series"
SUBS = ("intro", "params", "accessories")
CJK = re.compile(r"[㐀-鿿豈-﫿　-〿＀-￯]")


def has_cjk(s):
    return bool(CJK.search(s))


def main():
    out_dir = sys.argv[1]
    series = sys.argv[2:] or ["sdv3", "sda2", "s600", "s600e", "s3100", "penta-12t"]
    os.makedirs(out_dir, exist_ok=True)
    ocr = RapidOCR()
    for s in series:
        for sub in SUBS:
            d = os.path.join(SERIES_ROOT, s, sub)
            if not os.path.isdir(d):
                continue
            for name in sorted(os.listdir(d)):
                if not name.endswith(".webp"):
                    continue
                path = os.path.join(d, name)
                img = Image.open(path).convert("RGB")
                result, _ = ocr(np.array(img))
                items = []
                for box, text, score in (result or []):
                    xs = [p[0] for p in box]
                    ys = [p[1] for p in box]
                    items.append({
                        "box": [round(min(xs)), round(min(ys)),
                                round(max(xs)), round(max(ys))],
                        "zh": text,
                        "vi": "" if has_cjk(text) else None,
                    })
                stem = f"{s}--{sub}--{os.path.splitext(name)[0]}"
                meta = {"image": path, "size": list(img.size), "items": items}
                json.dump(meta, open(os.path.join(out_dir, stem + ".json"), "w"),
                          ensure_ascii=False, indent=1)
                n_zh = sum(1 for it in items if it["vi"] == "")
                print(f"{stem:34} boxes={len(items):3} cjk={n_zh}")


if __name__ == "__main__":
    main()
