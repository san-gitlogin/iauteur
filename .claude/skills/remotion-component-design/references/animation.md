# Animation: making motion feel smooth, intentional, and physical

Smoothness is not a rendering property — it is a *curve* property. Linear motion reads as robotic; motion that accelerates and decelerates like a physical object reads as alive. Every technique below is a way of shaping the velocity curve.

## The two motion primitives

### 1. `spring()` — for anything entering, exiting, or reacting

Springs are the default for UI-like motion because they encode physics (mass, stiffness, damping) instead of hand-drawn curves, and they compose: their output is a 0→1 progress you can map onto anything.

```tsx
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const enter = spring({
  frame,
  fps,
  config: { damping: 200 },      // ALWAYS set damping explicitly
  durationInFrames: 0.5 * fps,   // optional: stretch/compress to exact duration
  delay: 3,                       // frames to wait before starting
});

// Map progress onto properties:
const translateY = interpolate(enter, [0, 1], [40, 0]);
const opacity = enter; // progress is already 0→1
```

**Spring personality table** — choose by the feeling the element should convey:

| Feel | config | Use for |
|---|---|---|
| Crisp, professional, no bounce | `{ damping: 200 }` | Text, cards, UI panels, corporate work. **This is the default.** |
| Gentle settle, whisper of overshoot | `{ damping: 30, stiffness: 100 }` | Hero titles, logos that should feel premium |
| Playful bounce | `{ damping: 10, stiffness: 100 }` | Icons, emoji, casual/social content |
| Heavy, weighty | `{ damping: 40, mass: 3, stiffness: 60 }` | Large objects, dramatic reveals |
| Snappy pop | `{ damping: 15, stiffness: 200 }` | Small badges, notification dots, cursor clicks |

Rules:
- Bounce (`damping < 30`) is seasoning: at most one bouncy family of elements per scene. Everything bouncing = nothing bouncing.
- Never animate `opacity` with a bouncy spring (opacity > 1 clips, > and <0 flashes). Drive opacity with a damped spring or a clamped interpolate even when position bounces.
- To know how long a spring runs, use `measureSpring({ config, fps })` — or pass `durationInFrames` to force it.

### 2. `interpolate()` + `Easing` — for time-boxed, precisely-choreographed motion

```tsx
import { interpolate, Easing } from 'remotion';

const x = interpolate(frame, [0, 20], [0, 300], {
  easing: Easing.bezier(0.4, 0.0, 0.2, 1),   // "standard" material curve
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',                  // ← clamp BOTH, always, unless deliberate
});
```

**Easing selection table:**

| Curve | Code | Character / use |
|---|---|---|
| Standard | `Easing.bezier(0.4, 0.0, 0.2, 1)` | Default for everything on-screen moving to a new position |
| Decelerate (ease-out) | `Easing.out(Easing.cubic)` | **Entrances** — fast arrival, gentle stop |
| Accelerate (ease-in) | `Easing.in(Easing.cubic)` | **Exits** — gentle start, fast departure |
| Ease-in-out strong | `Easing.inOut(Easing.quart)` | Camera-like pans, large layout shifts |
| Linear | `Easing.linear` | ONLY for: constant spins, marquees, progress bars tied to real time, counters |
| Anticipation | `Easing.bezier(0.68, -0.3, 0.32, 1.3)` | Wind-up before launch; use sparingly, it's loud |

Multi-stop choreography in one call — this is how you build "move in, hold, move out" without state:

```tsx
const opacity = interpolate(
  frame,
  [0, 15, durationInFrames - 10, durationInFrames],
  [0, 1, 1, 0],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);
```

The input range MUST be monotonically increasing. If two stops would collide (short scenes), guard with `Math.max`.

## Timing: the numbers that feel right (at 30fps — scale by `fps/30`)

| Event | Frames | Seconds |
|---|---|---|
| Micro-feedback (dot, glow pulse) | 6–9 | 0.2–0.3 |
| Standard element entrance | 12–18 | 0.4–0.6 |
| Hero/title entrance | 20–30 | 0.7–1.0 |
| Element exit | ~60% of its entrance | — |
| Scene cross-transition | 15–25 | 0.5–0.8 |
| Hold for reading one line of text | ≥ word count × 0.35s, min 1.5s | — |
| Stagger between sibling elements | 2–5 | 0.07–0.17 |

Two universal principles:
- **Exits are faster than entrances.** Attention should be spent on arrival, not departure.
- **Nothing important happens in the first 5 frames or last 10 frames of a scene** — transitions eat those.

## Staggering: how families of elements enter

Siblings (list items, stat cards, chart bars) enter as a cascade, not a block and not a slog:

```tsx
{items.map((item, i) => {
  const progress = spring({
    frame,
    fps,
    delay: i * 3,               // 3-frame stagger; 5 for ≤3 items, 2 for ≥8 items
    config: { damping: 200 },
  });
  return (
    <div key={item.id} style={{
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [24, 0])}px)`,
    }}>…</div>
  );
})}
```

- Stagger direction should match reading direction or data direction (bars left→right, list top→bottom).
- Cap the total cascade at ~1s: for many items, shrink the per-item delay rather than extending the scene.

## Text animation

Text is the highest-stakes element: it must be READ, so motion must never fight legibility.

**Line/block level (default):** fade + rise (translateY 24–40px → 0) with damping-200 spring. This is the safest, most professional treatment and should be your default.

**Word-level kinetic type:** split on spaces, animate each word with a 2–4 frame stagger. Use for headlines ≤ 8 words. Words rise or scale from 0.9→1; never rotate individual words unless the brief is playful.

**Character-level:** reserve for short hero words (≤ 12 chars) or typewriter effects. Typewriter = reveal count via linear interpolate + `Math.floor`, and hide the trailing characters with `visibility`, never by changing the string width mid-layout:

```tsx
const charsShown = Math.floor(interpolate(frame, [0, text.length * 2], [0, text.length], clampBoth));
```

**Hard rules for text motion:**
- Animate `transform` and `opacity` only. Never animate `font-size`, `letter-spacing`, or `width` on text — layout reflow per frame looks like jitter and IS jitter.
- If text scales, scale the container (`transform: scale()`), and keep final scale exactly 1 so it lands pixel-crisp.
- Blur-in text (`filter: blur(8px)→0`) is elegant but expensive; keep it to hero moments, ≤ 15 frames, and never combined with per-character stagger.
- Motion-blur trick for fast-moving text: skip it; use `@remotion/motion-blur`'s `<Trail>` only when asked.

**Counters / numbers:**

```tsx
const value = interpolate(frame, [0, 1.2 * fps], [0, 8421], {
  easing: Easing.out(Easing.exp),   // fast start, slow settle = satisfying
  ...clampBoth,
});
<span style={{ fontVariantNumeric: 'tabular-nums' }}>
  {Math.round(value).toLocaleString('en-US')}
</span>
```

`tabular-nums` is mandatory — proportional digits change width every frame and the number shakes.

## Sequencing scenes

```tsx
import { Series } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';

// Hard cuts / simple chaining:
<Series>
  <Series.Sequence durationInFrames={90}><SceneA /></Series.Sequence>
  <Series.Sequence durationInFrames={120}><SceneB /></Series.Sequence>
</Series>

// Overlapping transitions (note: transitions SUBTRACT from total duration):
<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}><SceneA /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />
  <TransitionSeries.Sequence durationInFrames={120}><SceneB /></TransitionSeries.Sequence>
</TransitionSeries>
```

- Pick ONE transition style per video and reuse it. Mixed wipes/slides/flips per cut is the clearest amateur tell.
- `fade` suits calm/premium; `slide`/`wipe` suit energetic content and should follow a consistent direction (all left, or alternating deliberately).
- Inside `<Sequence>`, `useCurrentFrame()` starts at 0 — design every scene assuming it owns its own timeline from frame 0.
- Use `premountFor={30}` on Sequences containing videos/heavy images so assets are decoded before appearing.

## Ambient motion during holds

A frame where literally nothing moves for 2+ seconds reads as a rendering failure. During holds, add ONE of:
- Background gradient drifting (see design-system.md, animate `backgroundPosition` or gradient stop positions over 10–20s loops)
- A slow scale creep on hero imagery: `scale(1 → 1.03)` across the whole hold (the "Ken Burns" for stills)
- Floating particles/orbs at opacity ≤ 0.15, positions driven by `Math.sin(frame / 40 + random(seed) * Math.PI * 2)` — sin of frame is deterministic and loop-friendly
- `@remotion/noise` (`noise2D(seed, x, frame * 0.01)`) for organic wander

Keep ambient amplitude tiny (≤ 8px drift, ≤ 3% scale). It should be felt, not noticed.

## Looping

For seamless loops (backgrounds, spinners): make every periodic function complete an integer number of cycles over `durationInFrames`. `Math.sin((frame / durationInFrames) * Math.PI * 2 * k)` loops perfectly for integer k. Remotion's `<Loop durationInFrames={n}>` replays children — the child's first and last frame must match visually.

## Anti-patterns (reject these in review)

- Linear easing on positional moves (robotic)
- Everything entering at once on frame 0 (wall of motion, nothing readable)
- Entrances longer than 1s for non-hero elements (sluggish)
- Opacity driven by bouncy springs (flashing)
- Unclamped interpolations (elements sail past their targets)
- Rotation on body text (unreadable), or continuous rotation faster than 0.5 rev/s on anything large
- Two simultaneous focal animations competing in the same beat — motion is hierarchy; only one thing gets the loudest move at a time
