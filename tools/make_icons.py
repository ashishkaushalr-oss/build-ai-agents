"""Derive every icon size the web app (and later the iOS app) needs from the master app icon.

Source: assets/icon-src/AppIcon-1024.png, rasterised from assets/icon-src/AppIcon-1024.svg, the "A Mark"
design: a bold A drawn as a single peak with a white dot in place of the crossbar (the agent), on #09090B.
The dark and tinted SVG variants in the same folder are for the iOS 18 appearances and are not used on the web.

Outputs in assets/: icon-1024.png (square, opaque), apple-touch-icon.png (180, square, opaque: iOS masks it),
icon-maskable-512/192.png (square, opaque: Android masks them), icon-512/192.png and favicon-32.png with
transparent rounded corners for browsers, and icon-preview.png showing the icon at home-screen sizes.
Run: python tools/make_icons.py
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'icon-src', 'AppIcon-1024.png')
OUT = os.path.join(ROOT, 'assets')
RADIUS = 0.2237        # iOS corner radius as a fraction of the side (22.37%)
K = 4                  # supersampling for smooth corners


def rounded(img, radius_frac=RADIUS):
    s = img.size[0]
    big = Image.new('L', (s * K, s * K), 0)
    ImageDraw.Draw(big).rounded_rectangle([0, 0, s * K - 1, s * K - 1], radius=radius_frac * s * K, fill=255)
    out = img.convert('RGBA')
    out.putalpha(big.resize((s, s), Image.LANCZOS))
    return out


def preview(master):
    """The icon at home-screen sizes on a light and a dark background."""
    sizes = [180, 120, 80, 60, 40]
    pad, gap = 40, 36
    width = pad * 2 + sum(sizes) + gap * (len(sizes) - 1)
    half = 200 + pad * 2
    sheet = Image.new('RGBA', (width, half * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(sheet)
    d.rectangle([0, 0, width, half], fill=(0xF4, 0xF6, 0xFB, 255))
    d.rectangle([0, half, width, half * 2], fill=(0x0B, 0x10, 0x20, 255))
    for row, fg in ((0, (0x0E, 0x16, 0x26, 255)), (1, (0xEA, 0xF0, 0xFF, 255))):
        x = pad
        for s in sizes:
            ic = rounded(master.resize((s, s), Image.LANCZOS))
            y = row * half + pad + (180 - s) // 2
            sheet.alpha_composite(ic, (x, y))
            label = '%d px' % s
            d.text((x + s / 2 - len(label) * 3, row * half + pad + 190), label, fill=fg)
            x += s + gap
    return sheet


def main():
    master = Image.open(SRC).convert('RGB')
    assert master.size == (1024, 1024), 'master must be 1024 x 1024'
    master.save(os.path.join(OUT, 'icon-1024.png'))
    master.resize((180, 180), Image.LANCZOS).save(os.path.join(OUT, 'apple-touch-icon.png'))
    for s in (512, 192):
        master.resize((s, s), Image.LANCZOS).save(os.path.join(OUT, 'icon-maskable-%d.png' % s))
        rounded(master.resize((s, s), Image.LANCZOS)).save(os.path.join(OUT, 'icon-%d.png' % s))
    rounded(master.resize((32, 32), Image.LANCZOS)).save(os.path.join(OUT, 'favicon-32.png'))
    preview(master).save(os.path.join(OUT, 'icon-preview.png'))
    for f in sorted(os.listdir(OUT)):
        p = os.path.join(OUT, f)
        if os.path.isfile(p):
            print('%-26s %7d bytes' % (f, os.path.getsize(p)))


if __name__ == '__main__':
    main()
