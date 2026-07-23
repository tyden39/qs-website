#!/usr/bin/env python3
"""Fill each raw spec's empty "vi" fields from the shared glossary.

Reads specs from <raw_dir>, applies glossary.json (zh -> vi), and writes the
filled specs to <out_dir>. Reports per-image how many CJK boxes remain
untranslated (no glossary entry yet).

Usage:
    fill-glossary.py <raw_dir> <glossary.json> <out_dir>
"""
import sys, os, json, glob

raw_dir, gloss_path, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
gloss = json.load(open(gloss_path))
os.makedirs(out_dir, exist_ok=True)

total_missing = 0
for jf in sorted(glob.glob(os.path.join(raw_dir, "*.json"))):
    meta = json.load(open(jf))
    missing = 0
    for it in meta["items"]:
        if it["vi"] == "":  # CJK box awaiting translation
            v = gloss.get(it["zh"])
            if v is not None:
                it["vi"] = v
            else:
                missing += 1
    total_missing += missing
    json.dump(meta, open(os.path.join(out_dir, os.path.basename(jf)), "w"),
              ensure_ascii=False, indent=1)
    if missing:
        print(f"{os.path.basename(jf)[:-5]:34} missing={missing}")
print(f"TOTAL untranslated CJK boxes remaining: {total_missing}")
