# Design System: color, themes, typography, and surface effects

Everything visual flows from one token object. Components never contain raw hex values, raw pixel font sizes, or ad-hoc shadows — they read tokens. This is what makes dark/light support, brand re-skins, and consistency across scenes a data change instead of a rewrite.

## The theme contract (`lib/theme.ts`)

```tsx
export type Theme = {
  mode: 'dark' | 'light';
  bg: string;            // page background (never pure #000 or #FFF — see below)
  surface: string;       // card/panel background
  surfaceRaised: string; // elevated panels, tooltips
  border: string;        // hairlines, dividers (usually fg at 8–15% alpha)
  fg: string;            // primary text
  fgMuted: string;       // secondary text (≈ 65–70% strength of fg)
  accent: string;        // THE brand/action color — one, not three
  accentSoft: string;    // accent at low alpha for fills behind accent elements
  success: string; warning: string; danger: string; // semantic, use only semantically
  shadow: string;        // themed shadow color (see Elevation)
  fontDisplay: string;   // headline face
  fontBody: string;      // body face
  fontMono?: string;     // code/data face
};
```

Define BOTH variants up front, derived from the same hues:

```tsx
export const dark: Theme = {
  mode: 'dark',
  bg: '#0E1116',          // near-black with a hue, NOT #000
  surface: '#171B22',
  surfaceRaised: '#1F2530',
  border: 'rgba(226, 232, 240, 0.10)',
  fg: '#E9EDF3',          // near-white, NOT #FFF
  fgMuted: 'rgba(233, 237, 243, 0.64)',
  accent: '#5EA8FF',      // LIGHTER accent variant for dark bg
  accentSoft: 'rgba(94, 168, 255, 0.14)',
  /* … */
};
export const light: Theme = {
  mode: 'light',
  bg: '#F7F8FA', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
  border: 'rgba(15, 23, 42, 0.10)',
  fg: '#111827', fgMuted: 'rgba(17, 24, 39, 0.62)',
  accent: '#1D6FE0',      // DARKER accent variant for light bg
  accentSoft: 'rgba(29, 111, 224, 0.10)',
  /* … */
};
```

Pass the theme as a composition prop (Zod-typed) or React context. A component is only "done" when it looks correct under **both** objects.

## Color theory, operationalized

- **Build the palette as roles, not decorations**: one background family, one foreground family, ONE accent, plus semantic colors. The 60/30/10 rule maps to video as: ~60% background/surfaces, ~30% content (text, imagery), ≤10% accent. If accent covers more than ~10% of the frame, it stops being an accent.
- **Pick the accent from the subject's world** (finance → confident blues/greens; nature → earthy greens/ambers; dev tools → often works with a sharp mono palette + single electric accent). Then keep every other hue within ±30° of a coherent scheme (analogous) or use exactly one complementary pop.
- **Never pure black (#000) backgrounds or pure white (#FFF) text on them** — the contrast is harsh on screens and causes halation on text. Tint the near-black toward the accent's hue (2–5% saturation) for cohesion.
- **Contrast is non-negotiable**: body text ≥ 4.5:1 against its background, large display text ≥ 3:1, decorative elements exempt. When in doubt, compute relative luminance or use fg/fgMuted tokens which are pre-verified.
- **Interpolating colors over time**: use `interpolateColors(frame, [0, 60], ['#1D6FE0', '#7C3AED'])` from remotion — never lerp hex strings manually.

### Dark vs light: what actually changes (beyond swapping tokens)

| Concern | Dark theme | Light theme |
|---|---|---|
| Accent | Lighter, slightly desaturated variant (saturated darks vibrate on dark bg) | Darker, fully saturated variant |
| Elevation | Shadows barely visible → elevate via *lighter surface* + subtle border + optional soft accent glow | Classic soft shadows carry elevation |
| Shadow color | `rgba(0,0,0,0.5)` and tight, or accent-tinted glow `0 0 40px accentSoft` | `rgba(16, 24, 40, 0.10–0.18)`, larger blur |
| Overlays/scrims | White at 4–8% alpha to lighten | Black at 4–8% alpha to darken |
| Image treatment | Bright images need a subtle dark scrim to not blow out | Dark images may need a light vignette |
| Gradients | Can be more saturated/luminous (they glow) | Keep gradients quieter or they look like clipart |
| Ambient particles | opacity ≤ 0.15, light-colored | opacity ≤ 0.08, dark or accent-colored |

## Typography

- **Two faces, three at most**: a characterful display face for headlines (used with restraint), a workhorse body face, optionally a mono for data/code. Load through `@remotion/google-fonts` (handles delayRender automatically):

```tsx
import { loadFont } from '@remotion/google-fonts/Sora';
const { fontFamily: display } = loadFont();
```

Pairings that reliably look intentional (pick to match the brief's temperament, don't rotate randomly): Sora + Inter (tech, confident) · Fraunces + Work Sans (editorial, warm) · Space Grotesk + IBM Plex Sans (engineering) · Playfair Display + Source Sans 3 (premium/serif-led) · Archivo Black + Archivo (loud, poster-like). If the user has brand fonts, those win; load via `@remotion/fonts` `loadFont({ family, url: staticFile('font.woff2') })`.

- **Type scale**: derive from the composition, don't hardcode. `const s = width / 1920;` then a modular scale: hero `96*s`, h2 `56*s`, h3 `36*s`, body `28*s`, caption `20*s` (video body text runs much larger than web body text — 16px is unreadable in video). Line-height: display 1.05–1.15, body 1.4–1.5. Tighten display tracking slightly (−0.02em); loosen ALL-CAPS labels (+0.08em, smaller size, fgMuted — the classic "eyebrow").
- **Hierarchy through contrast of size AND weight AND color**, not just size: hero = big + heavy + fg; support = moderate + regular + fgMuted. If everything is bold, nothing is.
- **Max line length** ~28–36 characters for video headlines; break lines deliberately (manual `<br/>` or width caps), never let the renderer wrap arbitrarily mid-thought.

## Gradients, blur, opacity, and glass

**Gradients** — the modern default background is a *quiet* gradient, not a flat fill:
- Subtle: two stops of the bg color's hue, ±4–6% lightness apart, 135°.
- Aurora/mesh look: 2–3 large radial-gradient "orbs" (accent hues at 10–25% alpha, blur 80–150px) positioned off-center on the bg, optionally drifting slowly (see animation.md ambient rules). This reads premium in dark mode especially.
- Text-on-image scrims: `linear-gradient(transparent, rgba(bg, 0.85))` bottom-anchored behind lower-third text.
- Gradient text: `background: linear-gradient(...); WebkitBackgroundClip: 'text'; color: 'transparent'` — hero words only, and verify contrast at the gradient's weakest stop.
- Animate gradients by animating stop positions/angle via interpolate — smooth and cheap.

**Opacity discipline** — fixed alpha steps, not arbitrary values: 0.04 (barely-there tint) / 0.08 (hairline fills) / 0.14 (soft fills, accentSoft) / 0.32 (disabled) / 0.64 (muted text) / 1. Layered translucent whites/blacks at these steps produce cohesive depth automatically.

**Blur** — powerful, expensive, use surgically:
- `filter: blur(px)` on an element blurs the element; `backdropFilter: 'blur(px)'` blurs what's behind it (glassmorphism). Both work in Remotion's Chromium but are **the biggest render-speed killers** when applied to large areas every frame.
- Glass panel recipe: `background: rgba(surface, 0.55); backdropFilter: 'blur(18px) saturate(1.4)'; border: 1px solid rgba(fg, 0.12); borderRadius: 24*s`. Add a 1px top-edge highlight (`inset 0 1px 0 rgba(255,255,255,0.08)`) in dark mode to sell the material.
- Cheaper alternatives when blur covers big areas: pre-blur the background image as an asset; or fake depth-blur with a lower-opacity, slightly-scaled duplicate layer.
- Focus-pull effect (blur 12→0 while opacity 0→1) is a beautiful entrance for hero media — keep ≤ 15 frames.

**Elevation ladder** (as tokens, from flat to floating):
1. border only → 2. border + `0 1px 2px shadow` → 3. `0 8px 24px shadow` → 4. `0 24px 64px shadow` (+ glow in dark mode). Shadows animate with their element: while a card rises in, grow its shadow with the same progress value — light behaves consistently.

## Backgrounds and background animation

The background sets the emotional temperature and must never compete with content. Ordered by energy:
1. **Quiet gradient** (default) — as above, static or 15s+ drift loop.
2. **Grid/dot texture** — SVG pattern of dots or hairlines at 4–6% fg alpha; optionally a slow parallax drift (≤ 6px). Signals "technical/product".
3. **Aurora orbs** — drifting radial blobs; premium/AI/creative feel.
4. **Noise-driven flow** — `@remotion/noise` displacing particles or a waveform; distinctive, use as the signature element only.
5. **Video/imagery** — always behind a scrim so text passes contrast.

Whatever the choice: background animation cycles are LONG (10–20s), low amplitude, and looping cleanly. The viewer should never catch the background "doing a move."

## AI-tell defaults to avoid (unless the brief asks)

These read as templated because they appear regardless of subject: (1) cream `#F4F1EA` + serif + terracotta `#D97757` combo; (2) near-black + single acid-green accent with glow on everything; (3) purple-to-blue gradient on dark with glassmorphism cards as the whole identity. Also: three accent colors at once, rainbow gradients on text, drop shadows on all text by default, and Inter-for-everything with no display face. Any of these can be a *choice*; none may be a *default*. Ground the direction in the subject's actual world first (a video about coffee should not look like a crypto dashboard).
