#!/usr/bin/env python3
"""AI background removal for VN sprites.

Uses rembg's BiRefNet model — SOTA dichotomous segmentation that gets topology
right (carves enclosed holes like the gap between legs) and handles fine hair,
so no hand-tuned post-processing is needed. It segments the character, so it
never eats eyes, glasses, or badges the way a color/flood-fill rule does.

Setup (one time):
    python3 -m venv ~/.venvs/sprites
    ~/.venvs/sprites/bin/pip install "rembg[cpu]" onnxruntime pillow

Usage:
    ~/.venvs/sprites/bin/python3 tools/remove_bg.py in1.png[:out_name] in2.png ...
    # each arg is SRC or SRC:OUTNAME. Without OUTNAME, writes next to SRC.
    # OUTNAME (no extension) writes public/sprites/<OUTNAME>.png

Example (a new Liaison sprite):
    ~/.venvs/sprites/bin/python3 tools/remove_bg.py ~/Downloads/liaison.png:liaison_neutral
"""

import sys
from pathlib import Path

from rembg import remove, new_session
from PIL import Image

SPRITES = Path(__file__).resolve().parent.parent / 'public' / 'sprites'
MODEL = 'birefnet-general'


def main(args: list[str]) -> None:
    if not args:
        print(__doc__)
        return
    session = new_session(MODEL)
    for arg in args:
        src, _, out = arg.partition(':')
        img = Image.open(src).convert('RGBA')
        result = remove(img, session=session)
        dst = (SPRITES / f'{out}.png') if out else Path(src)
        result.save(dst)
        print(f'wrote {dst}')


if __name__ == '__main__':
    main(sys.argv[1:])
