---
name: remotion-component-design
description: Design and build beautiful, smooth, theme-aware Remotion video components (React-based programmatic video). Use this skill whenever the user asks to create, edit, or review a Remotion composition, scene, animation, motion graphic, explainer video, animated UI element, kinetic typography, animated chart, intro/outro, or any "video from code" request — even if they don't say the word "Remotion" but mention rendering video with React. Covers design thinking, layout/ratio/spacing, color theory for dark & light themes, animation smoothness, text animation, arrows/callouts, gradients/blur/opacity, backgrounds, and handling logos/PNG/SVG/video assets.
---

# Remotion Component Design

Build video components the way a motion-design studio would: **decide what the viewer should feel and understand first, then derive every frame from that decision.** Remotion is React where time is a prop. Every visual state is a pure function of the current frame. If you internalize only one thing, internalize that.

This file contains the workflow and the non-negotiable rules. Deep recipes live in `references/` — read the ones the task needs **before writing code**:

| Read this file | When the task involves |
|---|---|
| `references/animation.md` | Any motion: springs, easing, timing, staggering, transitions, exits, counters |
| `references/design-system.md` | Colors, dark/light themes, typography, spacing, gradients, blur, opacity, shadows |
| `references/layout.md` | Aspect ratios, safe areas, grids, scaffolding, alignment, arrows/callouts pointing at things |
| `references/assets.md` | Logos, PNG, SVG, video-in-video, audio, fonts, external data |

For a typical "make me an animated X" request you will need **all four**. Read them. They are short and dense on purpose.

---

## The Iron Rules of Remotion (never violate these)

These exist because Remotion renders by screenshotting each frame independently, possibly in parallel across multiple threads. Anything not derived from the frame number breaks determinism and produces flicker, tearing, or frames that differ between preview and render.

1. **All motion derives from `useCurrentFrame()`.** Never use CSS `transition`, CSS `@keyframes` animations, `setTimeout`, `setInterval`, `requestAnimationFrame`, or animation libraries that run on wall-clock time (GSAP timelines, Framer Motion's default mode). They will render frozen or torn.
2. **Never use `Math.random()`.** Use `random(seed)` from `remotion` — deterministic per seed, safe across render threads. Give every random element a stable string seed (`random('particle-' + i)`).
3. **Never hardcode pixel values tied to one resolution without deriving from `useVideoConfig()`.** Read `{ width, height, fps, durationInFrames }` and compute from them.
4. **Never hardcode frame counts assuming 30fps.** Write durations as `seconds * fps` (e.g. `const enterDur = 0.5 * fps`), so the component survives fps changes.
5. **Use `<Img>` / `<OffthreadVideo>` / `<Audio>` from `remotion`, never raw `<img>` / `<video>` tags.** Remotion's tags block the frame until the asset is decoded; raw tags produce blank frames in renders.
6. **Async work must be wrapped in `delayRender()` / `continueRender()`** (fonts, fetched data, measured layout) or done via `@remotion/google-fonts` / `prefetch` which handle it for you.
7. **`interpolate()` calls must clamp** — `{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }` — unless the design deliberately wants values to keep going. Unclamped interpolation is the #1 cause of elements flying off-screen or opacity going negative.
8. **Composition dimensions must be even numbers** (h264 requirement). Use standard sizes from `references/layout.md`.

## Component architecture

Structure every project the same way so any agent can navigate it:

```
src/
├── Root.tsx              # <Composition> registrations only
├── compositions/         # One file per full video (scenes wired with <Series>/<TransitionSeries>)
├── scenes/               # One file per scene (a self-contained chapter)
├── components/           # Reusable animated pieces (TitleCard, StatCounter, Arrow, LogoReveal…)
├── lib/
│   ├── theme.ts          # THE single source of design tokens (see design-system.md)
│   ├── timing.ts         # Named durations & easing presets (see animation.md)
│   └── layout.ts         # Grid, safe areas, anchor points shared by components AND arrows
└── public/               # Static assets, referenced via staticFile()
```

Rules that make components composable:

- **Components take `progress` or delays as props, not absolute frames.** A component that hardcodes "start at frame 90" can never be reused. Instead, let `<Sequence from={90}>` place it — inside a Sequence, `useCurrentFrame()` restarts at 0, which is exactly what you want. Compose scenes by nesting Sequences; never by passing global frame offsets around.
- **Every component accepts a `theme` prop** (or reads a ThemeContext) — never raw hex codes inside components. This is how dark/light support becomes a one-line switch instead of a rewrite.
- **Shared geometry lives in `lib/layout.ts`.** If an arrow points at a card, both the card position and the arrow endpoint come from the same exported constant. This is the only reliable way things "properly align" — alignment is a data problem, not an eyeballing problem.
- **Use Zod schemas + `defaultProps`** on Compositions so props are editable in the Remotion Studio sidebar and validated at render time.
- **`<AbsoluteFill>` is your layer system.** Background layer → content layer → foreground/overlay layer, each an AbsoluteFill, in that JSX order. Never position layers with z-index hacks when stacking order in JSX does the job.

## The design-thinking pipeline (do this before writing any code)

Follow these steps in your reasoning. Small agents: write the output of each step as a comment block at the top of the composition file so the plan is auditable.

**Step 1 — Extract the message.** From the user's request, state in one sentence: *who watches this, where (platform → ratio), and the single thing they must understand or feel.* Everything that doesn't serve that sentence gets cut. If the platform is unstated: business/explainer → 16:9, social/reels → 9:16, ambiguous → ask or default 16:9 and say so.

**Step 2 — Storyboard in text.** List the scenes as beats with rough durations in seconds: `[0.0–1.5] logo resolves → [1.5–4.0] headline + supporting stat → [4.0–7.0] diagram builds with arrows → [7.0–8.0] CTA`. A video is a sentence in time; each beat is a clause. One idea per beat. If a beat needs two ideas, it's two beats.

**Step 3 — Choose the visual direction.** Pick palette, type pairing, and one *signature element* (the thing the viewer remembers — a distinctive transition, a drawing-on diagram, a particular background texture). Spend your boldness in exactly one place; keep everything else quiet and disciplined. Avoid the AI-tell defaults called out in `references/design-system.md`. Write the tokens into `lib/theme.ts` — both dark and light variants — before any component exists.

**Step 4 — Block the layout.** For each scene, sketch an ASCII wireframe honoring safe areas and the spacing scale (`references/layout.md`). Decide the anchor points now and put them in `lib/layout.ts`.

**Step 5 — Choreograph.** For each element, decide: entrance (when, how, duration), hold behavior (static? subtle ambient motion?), exit (exits are ~40% faster than entrances). Elements that belong together enter as a staggered family (2–5 frame offsets), not simultaneously and not one-at-a-time-slowly. Full recipes in `references/animation.md`.

**Step 6 — Build layer by layer, self-critique.** Build background → primary content → secondary/annotations → polish. After each scene, review against the checklist below. If your environment can't render, review the code against the checklist explicitly — every check is verifiable by reading code.

## Quality checklist (verify every scene against all of these)

Motion
- [ ] Nothing pops into existence with 0-frame appearance unless it's a deliberate hard cut
- [ ] All `interpolate` calls clamp; all springs have explicit `damping` config
- [ ] Exits exist (scenes don't just truncate mid-motion) and are faster than entrances
- [ ] Related elements stagger; unrelated elements don't fight for attention in the same beat
- [ ] Something subtle moves during holds ≥ 2s (ambient drift, gradient shift) — dead-still frames feel broken in video

Design
- [ ] Zero raw hex codes in components — everything from `theme`
- [ ] Renders correctly in BOTH dark and light theme (swap the token set and check contrast rules in design-system.md)
- [ ] Text ≥ minimum sizes for the ratio (layout.md), contrast ≥ 4.5:1 body / 3:1 large text
- [ ] All content inside safe areas; spacing values come from the scale, not ad-hoc numbers
- [ ] Arrows/callouts share coordinates with their targets via `lib/layout.ts`

Correctness
- [ ] No `Math.random`, no CSS transitions/keyframes, no timers
- [ ] All assets via `staticFile()` + Remotion tags; fonts via `@remotion/google-fonts` or delayRender
- [ ] Durations expressed as `seconds * fps`; sizes derived from `useVideoConfig` scale factor
- [ ] Even composition dimensions; total `durationInFrames` matches the storyboard

## Defaults when the user under-specifies (small-agent fallback table)

| Unspecified | Default |
|---|---|
| Resolution / ratio | 1920×1080 @ 30fps |
| Scene length | 3–5s per beat; whole video ≤ 30s unless asked |
| Entrance animation | `spring` translateY 40→0 + opacity 0→1, damping 200, ~0.5s |
| Easing for interpolate | `Easing.bezier(0.4, 0.0, 0.2, 1)` |
| Stagger between siblings | 3 frames @ 30fps (scale by fps/30) |
| Theme | Dark variant of the token system, unless brand assets imply light |
| Font | One display + one body from @remotion/google-fonts (see design-system.md pairings) |
| Background | Themed subtle gradient with slow ambient drift, never flat pure black/white |

## Rendering notes (for when the user renders locally)

Preview: `npx remotion studio`. Render: `npx remotion render <CompositionId> out/video.mp4`. Transparency needs `--codec=prores --prores-profile=4444` or vp9 webm with `--pixel-format=yuva420p`. GIF: `--codec=gif --every-nth-frame=2 --fps=15` mindset. Heavy `filter: blur()` / `backdrop-filter` on large areas slows renders dramatically — see design-system.md for cheaper equivalents. If a sandbox can't run headless Chromium, still deliver the complete project; it will render on the user's machine unchanged, because everything above is deterministic by construction.
