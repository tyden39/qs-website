#!/usr/bin/env python3
"""Render every filled spec JSON in a directory to a translated webp.

By default writes previews to <preview_dir>. With --apply it overwrites the
original image path recorded in each spec (public/...), replacing Chinese with
Vietnamese in place.

Usage:
    batch-render.py <specs_dir> [--preview <dir>] [--apply] [glob]
"""
import sys, os, json, glob as globmod
import importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location(
    "translate_image", os.path.join(HERE, "translate-image.py"))
ti = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ti)


def main():
    specs_dir = sys.argv[1]
    apply = "--apply" in sys.argv
    preview = "previews"
    if "--preview" in sys.argv:
        preview = sys.argv[sys.argv.index("--preview") + 1]
    pats = [a for a in sys.argv[2:]
            if not a.startswith("--") and a != preview]
    pat = pats[0] if pats else "*.json"
    for jf in sorted(globmod.glob(os.path.join(specs_dir, pat))):
        meta = json.load(open(jf))
        stem = os.path.splitext(os.path.basename(jf))[0]
        out = meta["image"] if apply else os.path.join(preview, stem + ".webp")
        ti.render_spec(meta["items"], meta["image"], out)
        print(("APPLY " if apply else "prev  ") + out)


if __name__ == "__main__":
    main()
