#!/usr/bin/env python
"""Generate a mobile asset set: 50%-downscaled copies of every sprite and
background into a `mobile/` subdir, leaving the full-res desktop originals
untouched. The 1280x720 game frame is heavily oversampled on phones, so half
resolution is invisible there while cutting decode-memory ~4x (the thing that
OOM-crashes mobile Safari on load).

Sprites carry an alpha channel (rembg cutouts) — we keep RGBA and only resize +
optimize; no palette quantization, which would chew up the cutout edges.

Run with the Pillow venv:
    /home/harry/.venvs/sprites/bin/python tools/shrink_mobile.py
"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIRS = [os.path.join(HERE, "public", "sprites"), os.path.join(HERE, "public", "bg")]
SCALE = 0.5


def main() -> None:
    total_in = total_out = 0
    for d in DIRS:
        out_dir = os.path.join(d, "mobile")
        os.makedirs(out_dir, exist_ok=True)
        for name in sorted(os.listdir(d)):
            if not name.lower().endswith(".png"):
                continue
            src = os.path.join(d, name)
            dst = os.path.join(out_dir, name)
            im = Image.open(src)
            w, h = im.size
            small = im.resize((max(1, round(w * SCALE)), max(1, round(h * SCALE))), Image.LANCZOS)
            small.save(dst, "PNG", optimize=True)
            si, so = os.path.getsize(src), os.path.getsize(dst)
            total_in += si
            total_out += so
            print(f"{name:24s} {w}x{h} {si/1e6:5.2f}MB -> {small.size[0]}x{small.size[1]} {so/1e6:5.2f}MB")
    print(f"\ntotal: {total_in/1e6:.1f}MB -> {total_out/1e6:.1f}MB")


if __name__ == "__main__":
    main()
