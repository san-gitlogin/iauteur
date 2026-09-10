# APPLE, SEPTEMBER 2026 — SOURCE DOSSIER

Six announcements from the **"Surprise and Shine"** event, **9 September 2026**. This file is
the factual authority for the video series. Every figure here carries its source. Anything a
presenter says out loud must appear below, or it does not get said (LAW 3, LAW 0m).

Captured **10 September 2026**. Region: **US** (`apple.com`, not `apple.com/in`) — owner's call,
because the dollar figures are what every other channel quotes and what the Newsroom carries.

## SOURCES

| # | What | Where |
|---|---|---|
| S1 | iPhone Duo announcement | `apple.com/newsroom/2026/09/apple-unveils-iphone-duo/` |
| S2 | iPhone 18 Pro / Pro Max announcement | `apple.com/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/` |
| S3 | Apple Watch Ultra 4 announcement | `apple.com/newsroom/2026/09/apple-unveils-apple-watch-ultra-4/` |
| S4 | iPhone 18 Pro product page | `apple.com/iphone-18-pro/` |
| S5 | Event recap | `macrumors.com/2026/09/09/apple-september-2026-event-recap/` |
| S6 | Owner's feature brief | supplied in-session, 2026-09-10 |
| S7 | iPhone 18 Pro buy page (price ladder, finish order) | `apple.com/shop/buy-iphone/iphone-18-pro` |

---

## iPhone 18 Pro / iPhone 18 Pro Max

**The spine of the pilot video: a photograph that can prove it is a photograph.**

| Fact | Value | Src |
|---|---|---|
| Chip | A20 Pro, **vapor-cooled**; first 2nm smartphone chip | S4, S5 |
| Main camera | 48MP Fusion Main, **variable aperture** | S4 |
| Aperture stops | **ƒ/1.48 · ƒ/1.8 · ƒ/2.8 · ƒ/4**, via **six laser-cut blades** | S2 |
| Authenticity | **Apple Reference Image** — signs photo data at the pixel level at capture | S2, S6 |
| Finishes | **Black · Silver · Glacier · Burgundy** ("all-new burgundy") | S2 |
| Body | Unibody, **Ceramic Shield front and back** | S4 |
| Enclosure | 85% recycled aluminium | S2 |
| Dynamic Island | Smaller; now shows **three Live Activities at once** | S2, S5 |
| Battery | Pro Max **up to 45 hours** video playback; **6 more hours** than 17 Pro Max | S2, S4 |
| Storage | 256GB / 512GB / 1TB / 2TB | S2 |
| Price | **$1,199** Pro · **$1,299** Pro Max | S2, S7 |
| Dates | Pre-order **5:00 a.m. PT, 12 Sep** · available **18 Sep** | S4 |

Editing features (S6, to verify on the page before narrating): Clean Up, Extend, Spatial
Reframing. Also **iPhone Handoff** — one number live across two iPhones, T-Mobile (US) and
Telekom (Germany) at launch (S2).

### THE PRICE LADDER — read off Apple's own buy page (S7)

| Storage | iPhone 18 Pro | step |
|---|---|---|
| 256GB | **$1,199** | — |
| 512GB | **$1,399** | +$200 |
| 1TB | **$1,799** | +$400 |
| 2TB | **$2,399** | +$600 |

iPhone 18 Pro Max: **from $1,299**. Finishes are listed on the page in this order:
Burgundy, Glacier, Silver, Black.

**THE HIGH-END FIND.** Each step up the ladder costs $200 more than the step before it, so the
last one is three times the first. And a 2TB iPhone 18 Pro at **$2,399** is **$400 more than a
14-inch MacBook Pro**, which Apple prices at **$1,999** — a figure printed in the financing
disclosure on the very same page as the iPhone ladder. Both numbers, one capture, no comparison
shopping required. That is the beat.

### THE FINISH RAMP — measured, not guessed

Sampled off Apple's own macro photography (5,310 reddish pixels, sparse walk, sorted by
luminance). An anodised surface is a RAMP, so a component that fills it flat will read as a
coloured rectangle no matter how good the silhouette is.

    Burgundy   #2a1618  deep shadow   (p05)
               #412027  body          (p50)
               #673842  lit edge      (p85)
               #a16974  specular      (p98)

### THE OTHER THREE FINISHES — what is actually known, and what is not

**Only Burgundy is measured.** It has a dedicated macro on the product page, which is why the
ramp above is trustworthy. The other three do not, and two attempts to get them failed in ways
worth recording so nobody repeats them:

1. **Sampling the picker chip by offset** returned `#e7e7e7 / #fdfdfd / #ffffff / #ffffff` — the
   label's background, not the chip. Guessing a pixel offset from a text node's bounding box is
   not a measurement.
2. **Clicking each swatch and re-sampling the hero image** returned four near-identical ramps
   with pixel counts of 49324, 49325, 49325, 49325 — i.e. the same photograph four times. The
   click never changed the image. **Identical n across variants is the tell**; without it this
   would have shipped as four "measured" ramps that were one ramp.

What IS known are Apple's own picker swatches, read from the centre of each dot in the
*"Finish. Pick your favorite."* control (S7):

| Finish | Apple's swatch |
|---|---|
| Burgundy | `#c5b4b8` |
| Glacier | `#f8fbff` |
| Silver | `#fdfdfd` |
| Black | `#c0c0c0` |

These are genuine published Apple values, but they are **pastel UI tokens, not body colours** —
a `#c0c0c0` chip captioned "Black" reads as an error to a viewer. And **Glacier `#f8fbff` and
Silver `#fdfdfd` are three points apart**; at chip size they are the same colour, so a palette
built naively on them shows two identical swatches.

**The design answer, not a data answer:** the palette component treats each finish as a small
RAMP rather than a flat fill — deep body tone into pastel specular, which is what an anodised
surface is and what the Burgundy measurement demonstrates. Chips carry a ring so a dark one is
still an object on a dark ground, and the NAME does the identifying work. Glacier is given its
measurable blue bias against Silver's neutral. Do not present any of the three as a measured
body colour, in narration or on screen.

---

## iPhone Duo — the first foldable iPhone

| Fact | Value | Src |
|---|---|---|
| Inner display | **7.6in**, nano-texture finish, minimises glare | S1 |
| Outer display | **5.4in**, 90% of the screen area of iPhone 18 Pro | S1 |
| Claim | Thinnest iPhone ever **when open** | S1, S5 |
| Chip | A20 Pro, **dual-battery architecture**, advanced thermal management | S1 |
| Camera | 48MP Fusion Ultra Wide; **Center Stage** front camera, any orientation | S1 |
| Durability | **IP68** | S5 |
| Storage / colours | from 256GB; two colours | S5 |
| Pencil | **$79 USB-C Apple Pencil only** — not Apple Pencil Pro | S5 |
| Dates | Pre-order **16 Oct** · launch **23 Oct** · ships **iOS 27.1** | S5 |

From S6, to verify: side-button **Touch ID** (open or closed), **Duo Preview** (rear cameras
for selfies, framed on the outer screen), **Smart Take** (fires when everyone is posed).

---

## Apple Watch Series 12 & Ultra 4

| Fact | Value | Src |
|---|---|---|
| Series 12 chip | S11 | S5 |
| Series 12 case | New finishes incl. **ceramic**; wider than the previous generation | S5 |
| Health | **Eight** new health/fitness features, both models | S5 |
| Audio | **Three** Audio Intelligence features, both models | S5 |
| Ultra 4 everyday | **up to 50 hours** · **84 hours** Low Power | S3 |
| Ultra 4 workout | **10 hours** outdoor workout, **25% more** than the previous model | S3 |
| Ultra 4 endurance | **Max Extended Workout: up to 45 hours** outdoor tracking, GPS every second | S3 |

⚠ **The two 45-hour figures are DIFFERENT products.** iPhone 18 Pro Max = 45h *video playback*.
Ultra 4 = 45h *Max Extended Workout tracking*. Ultra 4's everyday figure is **50h**, which is the
"two-day battery" the headlines used. Say which one, every time.

From S6: **Vitals app** daily Readiness Score (Recover / Pace yourself / Go for it); VO2 Max
assessment by stepping in place in front of the iPhone camera; **Live Rewind** and **Siri Recaps**
on a Siri modular face, without recording raw audio.

---

## AirPods 5

| Fact | Value | Src |
|---|---|---|
| ANC | Improved, and **standard across the line** | S5 |
| Tiers | Higher-priced model gates wireless charging | S5 |

From S6, to verify: ANC in an **open-ear** design; Adaptive Audio; hands-free **Live
Translation**; **stem volume** swipe on the $149 model.

---

## iOS 27

Releases **14 September**. iPhone Handoff (T-Mobile US, Telekom Germany at launch); tap-to-redeem
gift cards on the back of the iPhone; Siri AI with daily usage limits and a paid **Expanded
Access** tier. macOS **Golden Gate**, iPadOS 27, watchOS 27, tvOS 27 seeded as release candidates. (S5)

---

## RULES FOR THIS SERIES

1. **DRAW IT AS A SCHEMATIC, NOT AS A PHOTOGRAPH** (owner, 2026-09-10: *"You need not picture
   the phone realistically. Since its modern dark, you can have a kinda wireframe kinda design
   which will be beautiful and fits right. Even if you use burgundy or something, it will not
   look nice in modern dark."*). He is right twice over. A filled Burgundy body on a near-black
   ground is a dark shape on dark, and a filled shape can only fade in — **a stroke can DRAW
   ITSELF**, which is the whole reason this reads as animation rather than a slide. So the device
   is a luminous line drawing: outline, plateau, lens circles, dimension ticks, built path by
   path on the voice.

   **Colour therefore moves to its own component.** The finishes are not the fill of the phone;
   they are a named palette row, which is where a colour can actually be the subject and be read.
   The measured ramp below is for THAT component. Apple's own renders are not licensed for reuse
   in any case.
2. **Recorded page footage is a QUOTATION** (LAW 0f). Say "on Apple's own product page" out loud,
   and set `recordedStep.sourceNote` so the credit stands on screen for the whole beat.
3. **A figure with no row in this file does not get spoken.** The owner's brief (S6) is a content
   brief, not a source; each of its claims is verified against Apple before it reaches narration.
4. **Name the product in the first sentence** (LAW 0g.1). "iPhone 18 Pro", not "the new one".
