#!/usr/bin/env python3
"""Erase Chinese text regions on a product detail image and redraw them in
Vietnamese, sampling each region's background/foreground colour so the result
keeps the original palette while using one consistent font family.

Usage:
    translate-image.py <image_in> <spec.json> <image_out>

spec.json: {"items": [{"box": [x0,y0,x1,y1], "vi": "...", "b": false,
                       "align": "left"|"center"|"right"}]}
Boxes without a "vi" value (or with vi == null) are left untouched, so
pure-numeric / model-code regions are never redrawn.
"""
import sys, os, json
from collections import Counter
from PIL import Image, ImageDraw, ImageFont

FONT_DIR = "/home/ducnguyen/.local/share/fonts/vietnamese-pack"
FONT_REG = f"{FONT_DIR}/BeVietnamPro-Regular.ttf"
FONT_MED = f"{FONT_DIR}/BeVietnamPro-Medium.ttf"
FONT_SB = f"{FONT_DIR}/BeVietnamPro-SemiBold.ttf"
FONT_BOLD = f"{FONT_DIR}/BeVietnamPro-Bold.ttf"


def quant(px):
    return (px[0] // 16, px[1] // 16, px[2] // 16)


def sample_colors(img, box):
    """Return (bg, fg) colours for a text box by clustering its pixels."""
    x0, y0, x1, y1 = box
    crop = img.crop((x0, y0, x1, y1)).convert("RGB")
    px = list(crop.getdata())
    if not px:
        return (255, 255, 255), (60, 57, 51)
    # Background = the most common colour bucket.
    buckets = Counter(quant(p) for p in px)
    bg_bucket = buckets.most_common(1)[0][0]
    bg_pixels = [p for p in px if quant(p) == bg_bucket]
    bg = tuple(sum(c) // len(bg_pixels) for c in zip(*bg_pixels))
    # Foreground = pixels far from bg; take their median-ish average.
    def dist(p):
        return sum((a - b) ** 2 for a, b in zip(p, bg))
    fg_pixels = [p for p in px if dist(p) > 60 * 60]
    if fg_pixels:
        fg = tuple(sum(c) // len(fg_pixels) for c in zip(*fg_pixels))
    else:
        fg = (60, 57, 51)
    return bg, fg


def fit_size(draw, text, path, box_h, max_w, max_size=40):
    """Largest font size fitting the box height, shrinking if too wide.

    Capped at max_size so an over-tall OCR box (e.g. a large vertical watermark
    label) never blows the translated line up to an overpowering size.
    """
    size = min(max_size, max(10, int(box_h * 1.0)))
    while size >= 9:
        font = ImageFont.truetype(path, size)
        l, t, r, b = draw.textbbox((0, 0), text, font=font)
        if (r - l) <= max_w and (b - t) <= box_h * 1.25:
            return size
        size -= 1
    return 9


def render_spec(items, img_in, img_out):
    """Erase Chinese boxes and draw their Vietnamese text; save to img_out."""
    img = Image.open(img_in).convert("RGB")
    draw = ImageDraw.Draw(img)
    W, _ = img.size
    boxes = [it["box"] for it in items]

    def right_limit(box):
        """Nearest box edge to the right on the same row — a collision barrier."""
        x0, y0, x1, y1 = box
        cy = (y0 + y1) / 2
        lim = W - 4
        for bx0, by0, bx1, by1 in boxes:
            if bx0 >= x1 and by0 - 2 <= cy <= by1 + 2:
                lim = min(lim, bx0 - 4)
        return lim

    def is_vertical(box):
        # Narrow, tall box = vertical CJK label in a diagram; leave it untouched
        # (drawing horizontal Vietnamese there never fits and mangles the art).
        w, h = box[2] - box[0], box[3] - box[1]
        return w <= 45 and h >= w * 1.4

    draw_items = [it for it in items if it.get("vi") and not is_vertical(it["box"])]

    # Pass 1: resolve max width and an individually-fitted size for each item.
    for it in draw_items:
        x0, y0, x1, y1 = it["box"]
        align = it.get("align", "left")
        if align == "right":
            max_w = it.get("maxw", x1 - 4)
        else:
            max_w = it.get("maxw", right_limit(it["box"]) - x0)
        it["_maxw"] = max(20, min(max_w, W - 4))
        font_path = FONT_BOLD if it.get("b") else FONT_REG
        it["_fit"] = it.get("size") or fit_size(
            draw, it["vi"], font_path, y1 - y0, it["_maxw"])

    # Pass 2: uniform font size per group. Explicit "grp" wins; otherwise items
    # of the same original text height share a size (bucketed to 3px), so a tier
    # of same-size labels stays visually even after translation.
    def gkey(it):
        if it.get("grp"):
            return it["grp"]
        h = it["box"][3] - it["box"][1]
        return f"_h{round(h / 3)}"

    grp_size = {}
    for it in draw_items:
        g = gkey(it)
        grp_size[g] = min(grp_size.get(g, 999), it["_fit"])
    for it in draw_items:
        it["_fit"] = grp_size[gkey(it)]

    # Pass 3: erase originals and draw the Vietnamese text.
    for it in draw_items:
        x0, y0, x1, y1 = it["box"]
        box_h, box_w = y1 - y0, x1 - x0
        bg, fg = sample_colors(img, it["box"])
        draw.rectangle([x0 - 1, y0 - 1, x1 + 1, y1 + 1], fill=bg)
        font_path = FONT_BOLD if it.get("b") else FONT_REG
        font = ImageFont.truetype(font_path, it["_fit"])
        l, t, r, b = draw.textbbox((0, 0), it["vi"], font=font)
        tw, th = r - l, b - t
        align = it.get("align", "left")
        if align == "center":
            tx = x0 + (box_w - tw) // 2
        elif align == "right":
            tx = x1 - tw
        else:
            tx = x0
        ty = y0 + (box_h - th) // 2 - t
        draw.text((tx - l, ty), it["vi"], font=font, fill=fg)

    os.makedirs(os.path.dirname(os.path.abspath(img_out)), exist_ok=True)
    img.save(img_out, "WEBP", quality=92, method=6)


def main():
    img_in, spec_path, img_out = sys.argv[1], sys.argv[2], sys.argv[3]
    spec = json.load(open(spec_path))
    render_spec(spec["items"], img_in, img_out)
    print(f"wrote {img_out}")


if __name__ == "__main__":
    main()
