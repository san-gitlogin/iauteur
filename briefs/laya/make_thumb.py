#!/usr/bin/env python3
"""Compose the Laya thumbnail ART PLATE -> public/assets/laya_thumb_art.png

    python3 briefs/laya/make_thumb.py

WHY A PLATE RATHER THAN A GLYPH (LAW 0b, and the owner's thumbnail corollary): the claim on
this thumbnail is a NUMBER — nineteen thousand stars in five days — and the only honest way to
sell a number is to show the page that prints it. So the art is the repository's own page,
whole and legible, parked right and faded into the ground, with the star counter crisp and a
clean left third for the headline the pack draws on top.

The source frame is the take that shipped (`public/rec/laya-gh/seg-02.mp4`, 3840x2160), so the
number on the plate and the number in the video are the same number, read at the same moment.

Rendered at 2x and downsampled, so type and UI edges stay clean.
"""
import os
import subprocess
from PIL import Image, ImageDraw, ImageFilter

S = 2
W, H = 1920 * S, 1080 * S
BG = (7, 10, 9)                 # terminalcli sits on a near-black green-black ground
GRID = (16, 26, 20)
OUT = "public/assets/laya_thumb_art.png"
SEG = "public/rec/laya-gh/seg-02.mp4"
FRAME = "/tmp/laya_repo_4k.png"

if not os.path.exists(FRAME):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-sseof", "-0.4", "-i", SEG,
                    "-frames:v", "1", FRAME, "-y"], check=True)

img = Image.new("RGB", (W, H), BG)

# ── ground: a faint grid, so the left third is not a flat black rectangle ─────────────
grid = Image.new("RGB", (W, H), BG)
gd = ImageDraw.Draw(grid)
step = 96 * S
for x in range(0, W, step):
    gd.line([(x, 0), (x, H)], fill=GRID, width=max(1, S))
for y in range(0, H, step):
    gd.line([(0, y), (W, y)], fill=GRID, width=max(1, S))
img = Image.blend(img, grid, 0.6)

# ── the repo page, WHOLE, parked right ───────────────────────────────────────────────
# It keeps its own aspect ratio: a supplied image that is stretched or cropped to a box is
# the paste-up look the owner rejected, and an <img> will happily run off its pane.
page = Image.open(FRAME).convert("RGB")
target_h = int(H * 0.92)
scale = target_h / page.height
page = page.resize((int(page.width * scale), target_h), Image.LANCZOS)

# Crop to the right-hand portion of the page: the About box, the star count, the licence
# and the release tag all live there, and that is the half worth showing at this size.
keep_w = int(page.width * 0.62)
page = page.crop((page.width - keep_w, 0, page.width, page.height))

px = W - page.width  # flush right: a +60 offset pushed the Star counter off the frame
py = (H - page.height) // 2
img.paste(page, (px, py))

# ── fade the page into the ground, left edge and outer edges ─────────────────────────
# A hard cut at the image edge reads as a screenshot dropped on a background; a real
# gradient makes it part of the plate.
mask = Image.new("L", (W, H), 0)
md = ImageDraw.Draw(mask)
md.rectangle([px, py, W, py + page.height], fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(10 * S))
grad = Image.new("L", (W, H), 255)
gg = ImageDraw.Draw(grad)
fade_w = int(W * 0.30)
for i in range(fade_w):
    a = int(255 * (i / fade_w) ** 1.5)
    gg.line([(px + i, 0), (px + i, H)], fill=a)
gg.rectangle([0, 0, px, H], fill=0)
mask = Image.composite(mask, Image.new("L", (W, H), 0), grad)

ground = Image.new("RGB", (W, H), BG)
ground = Image.blend(ground, grid, 0.6)
img = Image.composite(img, ground, mask)

# ── a soft veil over the left third, so the headline always has clean ground ─────────
veil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
vd = ImageDraw.Draw(veil)
for i in range(int(W * 0.56)):
    a = int(215 * (1 - i / (W * 0.56)) ** 1.1)
    vd.line([(i, 0), (i, H)], fill=(4, 8, 6, a))
img = Image.alpha_composite(img.convert("RGBA"), veil).convert("RGB")

img = img.resize((W // S, H // S), Image.LANCZOS)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
img.save(OUT)
print(f"{OUT}  {img.size[0]}x{img.size[1]}")


# ── the SHORTS cover, 9:16 ────────────────────────────────────────────────────────────
# The owner's note on the Archify cut: the shorts cover gets the same care as the wide
# thumbnail — both draw the subject through `art`, full size, no rounded tile. A vertical
# frame has no room for the file listing, so this crops to the About sidebar, where the
# star count, the licence and the description all sit together.
CW, CH = 1080 * S, 1180 * S
cover = Image.new("RGB", (CW, CH), BG)
cgrid = Image.new("RGB", (CW, CH), BG)
cg = ImageDraw.Draw(cgrid)
for x in range(0, CW, step):
    cg.line([(x, 0), (x, CH)], fill=GRID, width=max(1, S))
for y in range(0, CH, step):
    cg.line([(0, y), (CW, y)], fill=GRID, width=max(1, S))
cover = Image.blend(cover, cgrid, 0.6)

side = Image.open(FRAME).convert("RGB")
# The About column occupies roughly the right quarter of the 3840-wide capture.
side = side.crop((int(side.width * 0.695), int(side.height * 0.11),
                  int(side.width * 0.985), int(side.height * 0.98)))
sscale = (CW * 0.94) / side.width
side = side.resize((int(side.width * sscale), int(side.height * sscale)), Image.LANCZOS)
if side.height > CH * 0.94:
    side = side.crop((0, 0, side.width, int(CH * 0.94)))

sx = (CW - side.width) // 2
sy = int(CH * 0.03)
cover.paste(side, (sx, sy))

# Fade the panel's bottom edge into the ground so it does not end on a hard line.
fade = Image.new("L", (CW, CH), 255)
fd = ImageDraw.Draw(fade)
tail = int(CH * 0.10)
for i in range(tail):
    fd.line([(0, sy + side.height - tail + i), (CW, sy + side.height - tail + i)],
            fill=int(255 * (1 - i / tail) ** 1.2))
fd.rectangle([0, sy + side.height, CW, CH], fill=0)
cover = Image.composite(cover, Image.blend(Image.new("RGB", (CW, CH), BG), cgrid, 0.6), fade)

cover = cover.resize((CW // S, CH // S), Image.LANCZOS)
COVER_OUT = "public/assets/laya_cover_art.png"
cover.save(COVER_OUT)
print(f"{COVER_OUT}  {cover.size[0]}x{cover.size[1]}")
