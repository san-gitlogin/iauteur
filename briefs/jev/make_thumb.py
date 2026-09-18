#!/usr/bin/env python3
"""Compose the Jev thumbnail.

    python3 briefs/jev/make_thumb.py

Why this exists rather than the stock `thumb` composition: the owner asked for the launch post
to sit in the frame WHOLE and readable, faded into the ground, with real breathing room around a
three-line headline and a kicker. The pack's thumbnail slot fits `art` into a fixed box, which
either shrinks the post to a stamp or crops it — both read as paste-up. Changing that slot is a
component change (LAW 9, needs approval); this composes the plate directly instead, and stays
reproducible because it is a script, not a one-off export.

Rendered at 2x and downsampled, so the type edges stay clean.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os

S = 2                                   # supersample
W, H = 1280 * S, 720 * S
BG = (8, 9, 18)
INK = (244, 245, 250)
ACCENT = (128, 132, 245)
OUT = "topics/jev-decisions-measured/out/thumb.png"
POST = "/tmp/tweet_full.png"
LOGO = "public/assets/channel_logo.png"

FONTS = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial Bold.ttf",
]
MONO = [
    "/System/Library/Fonts/Menlo.ttc",
    "/System/Library/Fonts/Supplemental/Courier New Bold.ttf",
]


def font(paths, size):
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default(size)


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# ── ground: a faint grid so the left side is not a flat black rectangle ────────────────────
grid = Image.new("RGB", (W, H), BG)
gd = ImageDraw.Draw(grid)
step = 96 * S
for x in range(0, W, step):
    gd.line([(x, 0), (x, H)], fill=(18, 20, 34), width=max(1, S))
for y in range(0, H, step):
    gd.line([(0, y), (W, y)], fill=(18, 20, 34), width=max(1, S))
img = Image.blend(img, grid, 0.55)
d = ImageDraw.Draw(img)

# ── the post, whole, parked right, faded in ───────────────────────────────────────────────
post = Image.open(POST).convert("RGB")
ph = int(H * 0.94)
pw = int(post.width * ph / post.height)
post = post.resize((pw, ph), Image.LANCZOS)

px = W - pw - int(28 * S)
py = (H - ph) // 2
layer = Image.new("RGB", (W, H), BG)
layer.paste(post, (px, py))

mask = Image.new("L", (W, H), 0)
md = ImageDraw.Draw(mask)
fade_a, fade_b = px - int(40 * S), px + int(pw * 0.30)   # transparent → solid across the post
for x in range(W):
    if x < fade_a:
        a = 0
    elif x > fade_b:
        a = 255
    else:
        a = int(255 * (x - fade_a) / (fade_b - fade_a))
    md.line([(x, 0), (x, H)], fill=a)
# soften the top and bottom edges too, so the post melts into the frame instead of ending
for y in range(H):
    edge = min(y, H - 1 - y)
    if edge < int(46 * S):
        k = edge / (46 * S)
        for xseg in range(px - int(40 * S), W, 8 * S):
            cur = mask.getpixel((min(xseg, W - 1), y))
            md.line([(xseg, y), (min(xseg + 8 * S, W - 1), y)], fill=int(cur * k))
mask = mask.filter(ImageFilter.GaussianBlur(7 * S))
img = Image.composite(layer, img, mask)
d = ImageDraw.Draw(img)

# ── left column gets clean ground under the type ──────────────────────────────────────────
veil = Image.new("L", (W, H), 0)
vd = ImageDraw.Draw(veil)
solid_to, ramp_to = int(W * 0.44), int(W * 0.66)
for x in range(W):
    if x < solid_to:
        a = 232
    elif x < ramp_to:
        a = int(232 * (1 - (x - solid_to) / (ramp_to - solid_to)))
    else:
        a = 0
    vd.line([(x, 0), (x, H)], fill=a)
veil = veil.filter(ImageFilter.GaussianBlur(22 * S))
img = Image.composite(Image.new("RGB", (W, H), BG), img, veil)
d = ImageDraw.Draw(img)

M = int(62 * S)                      # one margin, used everywhere, so the spacing is a system

# ── kicker ────────────────────────────────────────────────────────────────────────────────
kf = font(MONO, int(23 * S))
kicker = "EVERYTHING YOU NEED TO KNOW ABOUT JEV"
kb = d.textbbox((0, 0), kicker, font=kf)
kw, kh = kb[2] - kb[0], kb[3] - kb[1]
pad_x, pad_y = int(18 * S), int(12 * S)
ky = int(54 * S)
d.rounded_rectangle([M, ky, M + kw + pad_x * 2, ky + kh + pad_y * 2],
                    radius=int(9 * S), fill=ACCENT)
d.text((M + pad_x, ky + pad_y - kb[1]), kicker, font=kf, fill=(12, 13, 26))

# ── headline: three lines, generous leading ───────────────────────────────────────────────
hf = font(FONTS, int(88 * S))
lines = ["AN AI MODEL", "200× FASTER,", "400× CHEAPER"]
lead = int(101 * S)
y = ky + kh + pad_y * 2 + int(54 * S)
for ln in lines:
    d.text((M + int(2 * S), y), ln, font=hf, fill=INK)
    y += lead

# ── the line that carries the authority ───────────────────────────────────────────────────
nf = font(MONO, int(27 * S))
note = "BY THE CO-CREATOR OF CHATGPT"
ny = y + int(26 * S)
d.line([(M, ny + int(15 * S)), (M + int(34 * S), ny + int(15 * S))], fill=ACCENT, width=int(4 * S))
d.text((M + int(50 * S), ny), note, font=nf, fill=ACCENT)

# ── channel mark, small, bottom right ─────────────────────────────────────────────────────
if os.path.exists(LOGO):
    lg = Image.open(LOGO).convert("RGBA")
    lh = int(46 * S)
    lg = lg.resize((int(lg.width * lh / lg.height), lh), Image.LANCZOS)
    img.paste(lg, (W - lg.width - int(26 * S), H - lh - int(22 * S)), lg)

img = img.resize((1280, 720), Image.LANCZOS)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
img.save(OUT)
print("wrote", OUT, img.size)
