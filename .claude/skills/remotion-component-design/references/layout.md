# Layout: ratio, scaffolding, spacing, and making things actually align

Alignment failures are almost never taste failures — they are architecture failures. The cure is a single source of geometric truth (`lib/layout.ts`) that every component, arrow, and annotation reads from.

## Aspect ratios and canvas setup

| Platform / use | Size | fps | Notes |
|---|---|---|---|
| YouTube, web, presentations (default) | 1920×1080 (16:9) | 30 | 60fps only for fast motion/gaming content |
| Reels / TikTok / Shorts | 1080×1920 (9:16) | 30 | One idea per screen; type runs larger relative to width |
| Instagram feed / square | 1080×1080 (1:1) | 30 | Center-weighted compositions |
| 4:5 portrait feed | 1080×1350 | 30 | |
| Banners/ads | per spec | 30 | Dimensions must be even numbers |

**Design resolution-independently.** Compute a scale factor and size *everything* through it:

```tsx
const { width, height, fps } = useVideoConfig();
const s = width / 1920;               // 1 at Full HD; all px values below multiply by s
```

For components reused across ratios, branch layout on orientation (`width > height ? row : column`), not on exact pixel checks.

## Safe areas

Content must not kiss the edges. Reserve margins:
- 16:9 → 5% of width each side (96px at 1920) for standard work; 7–8% for anything broadcast-like.
- 9:16 → 6% sides, and keep critical content out of the top ~12% and bottom ~18% (platform UI chrome: captions, buttons, progress bars live there).
- Put these in layout.ts as `SAFE`, and let `<AbsoluteFill style={{ padding: SAFE }}>` enforce them once, at the scene root — not per component.

## The spacing scale (scaffolding)

All padding/gaps come from one geometric scale — at 1080p base: **8, 16, 24, 32, 48, 64, 96, 128** (×`s`). Semantic mapping:

| Token | px @1080p | Use |
|---|---|---|
| `space.xs` 8 | icon↔label gap, chip padding |
| `space.sm` 16 | within a tight group (label above value) |
| `space.md` 24 | card internal padding (small cards) |
| `space.lg` 32–48 | card internal padding (standard), gap between siblings |
| `space.xl` 64 | between distinct groups |
| `space.xxl` 96–128 | between major regions / section breathing |

Two laws:
1. **Proximity encodes relationship.** Gap inside a group < gap between groups, always, by at least one scale step. If a caption sits equidistant between two images, the viewer can't tell which it belongs to.
2. **Padding scales with the box.** A full-screen panel gets `xl`, a chip gets `xs`. Internal padding of a card ≥ the border radius of the card (visually, radius eats into perceived padding).

Border radius scale: 8 / 16 / 24 / 999(pill) ×`s`, consistent per element class across the whole video.

## Grid and composition

- Use a **12-column mental grid** for 16:9 (content region divided into 12; a side-by-side scene = 5 cols text, 1 gutter, 6 cols visual). For 9:16, think in vertical thirds/fourths instead.
- Implement with flexbox/grid CSS inside AbsoluteFills — Remotion is just Chrome, all CSS layout works. Prefer `display:flex; gap:` over margin arithmetic; gaps can't collapse or double up.
- **Optical centering beats mathematical centering**: a vertically-centered text block reads low — shift it up ~2–3% of height. Play-button-like asymmetric shapes need nudging toward their visual mass.
- **Rule of thirds** for focal placement when the layout is a hero visual + supporting text: put the focal point on a third-line intersection, not dead center, unless the design is deliberately symmetric/monumental.
- **Every scene gets ONE focal point.** Layout, scale, contrast, and motion all agree on what it is. If two things claim focus, demote one (smaller, muted, delayed entrance).
- Balance mass: a heavy element left wants a counterweight right (text block, negative space used deliberately, or ambient element). Squint-test the wireframe: the frame shouldn't tip.

## The anchor system: making arrows, labels, and callouts ACTUALLY align

The moment one element points at another (arrow → card, label → chart bar, highlight ring → button), their coordinates must come from the same data. Never eyeball two numbers into agreement.

```tsx
// lib/layout.ts — geometry as data, ONE definition
export const DIAGRAM = {
  api:   { x: 480,  y: 540, w: 320, h: 160 },
  db:    { x: 1440, y: 540, w: 320, h: 160 },
};
export const anchor = (b: Box, side: 'top'|'right'|'bottom'|'left'|'center') => {
  switch (side) {
    case 'right':  return { x: b.x + b.w / 2, y: b.y };
    case 'left':   return { x: b.x - b.w / 2, y: b.y };
    case 'top':    return { x: b.x, y: b.y - b.h / 2 };
    case 'bottom': return { x: b.x, y: b.y + b.h / 2 };
    default:       return { x: b.x, y: b.y };
  }
};
```

The card renders at `DIAGRAM.api`; the arrow runs `anchor(DIAGRAM.api,'right') → anchor(DIAGRAM.db,'left')`. Move the card, the arrow follows. This one pattern eliminates the entire class of "arrow points at nothing" bugs.

### Arrows done properly (SVG, animated draw-on)

Render connective tissue in ONE full-frame SVG layer sitting between background and content (so lines pass under cards but over the background):

```tsx
const ArrowLayer: React.FC<{theme: Theme}> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const p1 = anchor(DIAGRAM.api, 'right'), p2 = anchor(DIAGRAM.db, 'left');
  // Curved connector: control point offset perpendicular for a gentle arc
  const d = `M ${p1.x} ${p1.y} C ${p1.x + 120} ${p1.y}, ${p2.x - 120} ${p2.y}, ${p2.x} ${p2.y}`;
  const LEN = 700; // ≥ real path length; overshoot is fine with pathLength trick below
  const draw = spring({ frame, fps, delay: 20, config: { damping: 200 }, durationInFrames: 0.6 * fps });
  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <path d={d} pathLength={1}
          stroke={theme.accent} strokeWidth={4} fill="none" strokeLinecap="round"
          strokeDasharray={1} strokeDashoffset={1 - draw} />
        {/* Arrowhead: separate triangle, fades in as the line completes */}
        <g opacity={interpolate(draw, [0.85, 1], [0, 1], clampBoth)}
           transform={`translate(${p2.x} ${p2.y}) rotate(${angleDeg(p1, p2)})`}>
          <path d="M 0 0 L -16 -8 L -16 8 Z" fill={theme.accent} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

Notes that make this robust: `pathLength={1}` normalizes any path so dashoffset math is always 0→1 (no measuring path lengths); the arrowhead is a separate element revealed at the end (SVG `marker-end` can't animate cleanly with dashoffset); curved connectors (single gentle arc) look designed, elbow connectors (H-then-V lines) look technical — pick per brief, but pick one style per video.

**Choreography rule for pointing:** the target exists BEFORE the pointer. Sequence = card enters → arrow draws toward it → label fades in near the arrowhead. An arrow drawn toward empty space that a card then fills reads as broken (unless that anticipation is the deliberate joke).

### Callouts / highlight rings

- Highlight ring: absolutely-positioned rounded rect at the target's box (from layout.ts) inflated by `space.sm`, `border: 3px solid accent`, scale 1.15→1 + opacity 0→1 spring. Optional single pulse afterward (scale 1→1.04→1 over 0.8s) — one pulse, not infinite.
- Dimming spotlight: full-frame overlay `rgba(bg, 0.6)` with a CSS `mask`/`clip-path` hole at the target box — focuses attention without moving anything.
- Callout label placement: prefer outside the target on the side with most free space; connect with a short 45° leader line; never cover the thing being explained.

## Z-order scaffolding (fixed layer order, top of every scene)

```tsx
<AbsoluteFill style={{ background: theme.bg }}>      {/* 1 background + ambient */}
  <BackgroundLayer />
  <ArrowLayer />                                      {/* 2 connective tissue */}
  <AbsoluteFill style={{ padding: SAFE }}>           {/* 3 content in safe area */}
    <Content />
  </AbsoluteFill>
  <OverlayLayer />                                    {/* 4 vignettes, grain, captions, watermark */}
</AbsoluteFill>
```

JSX order = stacking order. Reach for explicit `zIndex` only when an element must cross layers mid-animation.
