# Assets: logos, PNG, SVG, video, audio, fonts, and data

Assets are where renders silently break (blank frames, flashes, missing fonts). The rules here make asset handling deterministic.

## The universal rules

1. Files live in `public/`; reference them ONLY via `staticFile('logo.svg')` — never relative paths or absolute URLs into your own project. Remote URLs are allowed but pin them and prefer downloading into `public/` for reproducible renders.
2. Use Remotion's media tags — `<Img>`, `<OffthreadVideo>`, `<Audio>`, `<IFrame>` — never raw `<img>/<video>/<audio>`. Remotion's tags pause the render until the asset is decoded for that exact frame; raw tags race the screenshot and lose.
3. Anything async that Remotion's tags DON'T cover (fetches, canvas work, manual font loads) gets `const h = delayRender('reason'); … continueRender(h);` — and a try/catch that calls `cancelRender(err)` so failures are loud, not blank.

## Raster images (PNG / JPG / WebP): logos, photos, screenshots

```tsx
<Img src={staticFile('logo.png')} style={{ width: 280 * s, height: 'auto' }} />
```

- **Resolution**: source ≥ 1.5× its largest displayed size at final resolution, or it ships soft. Upscaling a 200px logo to 600px is visible; ask for or find a larger source, or switch to SVG.
- **Sizing**: photos/screenshots in fixed frames get `objectFit: 'cover'` (fills, crops) — logos get `objectFit: 'contain'` or width + `height:'auto'` (NEVER crop or stretch a logo; never distort its aspect ratio; never recolor a raster logo with filters unless brand guidelines say a white/mono version exists — ask for the right variant instead).
- **Logo clear space**: keep other elements at least the logo's own height/2 away on all sides. Place logos in corners (inside safe area) or centered for reveals; size 5–8% of frame width for a corner watermark, 15–25% for a hero reveal.
- **Logo entrance recipes** (pick one, matched to brand temperament): fade + scale 0.92→1 damped spring (safe, premium) · blur-in 12px→0 + opacity ≤15 frames (elegant) · mask-wipe reveal (a container with `overflow:hidden` and the logo translating up into it) · draw-on if an SVG path version exists (see below).
- **Photo treatment on themed backgrounds**: rounded corners from the radius scale + elevation shadow, and in dark mode a 1px `border: rgba(255,255,255,0.08)` so the photo edge doesn't dissolve into the background. Bright photos behind text always get a scrim (design-system.md).
- **Ken Burns** for stills held ≥ 2.5s: wrap in `overflow:hidden` box, animate inner `scale(1.0→1.06)` and a slight translate, linear or ease-in-out over the whole hold.
- Screenshots: never full-bleed raw — put them in a browser-chrome or device frame (simple CSS: rounded top bar + three dots), it instantly reads intentional.

## SVG: the native language of motion graphics

Prefer SVG for logos, icons, diagrams, arrows — infinitely sharp, and every attribute is animatable via interpolate.

**Inline it as a React component** (paste path data into JSX) rather than `<Img src>` whenever you want to animate its internals or recolor it with theme tokens:

```tsx
const Logo: React.FC<{ progress: number; theme: Theme }> = ({ progress, theme }) => (
  <svg viewBox="0 0 120 120" width={200 * s}>
    <path d="…" fill={theme.fg} opacity={progress} />
    <circle cx={60} cy={60} r={interpolate(progress, [0, 1], [0, 44])} fill={theme.accent} />
  </svg>
);
```

- **Recoloring**: swap `fill`/`stroke` to theme tokens — this is how one logo asset serves both dark and light themes. If the SVG has hardcoded fills, replace them with `currentColor` and set `color` on the svg.
- **Draw-on (line-art reveal)**: the `pathLength={1}` + `strokeDasharray={1}` + animated `strokeDashoffset` pattern from layout.md works on ANY path — logos, signatures, chart lines, underlines. Stagger multiple paths by 3–5 frames for a hand-drawn build.
- **Icon systems**: use `lucide-react` (available, tree-shaken, stroke-based so they draw-on beautifully and inherit `color`). One icon family per video; mixed icon styles is an instant tell.
- **Morphing** between paths needs identical command structure — use `@remotion/paths` (`interpolatePath`, `getLength`, `getPointAtLength` — the latter is also how you attach a dot/label that rides along a path).
- Transform-origin gotcha: SVG transforms default to origin 0,0 of the viewBox. Set `transformBox: 'fill-box', transformOrigin: 'center'` in style, or wrap in a positioned div and transform the div.

## Video inside video

```tsx
<OffthreadVideo src={staticFile('demo.mp4')} startFrom={2 * fps} endAt={8 * fps}
  style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
```

- **`<OffthreadVideo>` always for final renders** — it extracts exact frames via FFmpeg (no seek-timing flakiness). `<Video>` only if you need `playbackRate` or `loop` props interactively; even then consider trimming the asset instead.
- `startFrom/endAt` are in frames of YOUR composition timeline. Match composition fps to footage fps when possible; otherwise Remotion resamples (fine, but avoid judder-sensitive content).
- Embedded video used as a background ALWAYS gets a scrim before text goes over it; embedded video as content gets the same rounded-corner + border treatment as photos.
- Wrap video scenes in `<Sequence premountFor={30}>` so decoding starts before the video appears — kills first-frame flashes.
- Transparent-video overlays (confetti etc.): use WebM/VP9 with alpha, and remember final export needs an alpha-capable codec if transparency must survive to the output.

## Audio (when asked)

`<Audio src={staticFile('music.mp3')} volume={(f) => interpolate(f, [0, 30], [0, 0.8], clampBoth)} />` — volume accepts a per-frame function; use it for fade-in and a fade-out over the last second (an audio hard-cut at the end sounds broken). Duck music under voiceover by interpolating volume down to ~0.2 during speech. Sound-design accents (whooshes on transitions) sit at low volume (0.3–0.5) and their transient must land ON the visual hit frame, not near it. For music-reactive visuals, `@remotion/media-utils` `getAudioData` + `visualizeAudio` exist — read their docs when needed.

## Fonts

- Google Fonts: `@remotion/google-fonts/<Family>` — zero-config, handles delayRender.
- Custom/brand fonts: put `.woff2` in `public/`, then `@remotion/fonts`: `loadFont({ family: 'Brand', url: staticFile('brand.woff2') })` at module top level.
- NEVER load fonts via CSS `@import` or `<link>` — the render can screenshot before the font arrives → one flash-of-wrong-font frame mid-video, the classic hard-to-debug artifact.

## Data-driven components (charts, feeds, API data)

- Prefer **fetch-then-render**: pull data at build time or via `calculateMetadata` on the Composition (also lets duration depend on data length), pass as props. Runtime fetching inside components needs delayRender and makes renders non-reproducible.
- Charts: build from SVG primitives with the anchor system (layout.md) rather than heavy chart libraries — you control the build-on animation (bars growing with staggered springs, lines drawing-on, dots riding the path via `getPointAtLength`). Axis labels and gridlines at `border`-token strength so data stays the hero.
- Numbers in data displays: `tabular-nums` always (animation.md).

## Pre-flight asset checklist

- [ ] Every asset path goes through `staticFile()`; files actually exist in `public/`
- [ ] No raw `<img>/<video>/<audio>` tags anywhere
- [ ] Logos: correct variant per theme (light/dark), aspect ratio untouched, clear space respected
- [ ] SVGs recolor via tokens; raster images sized ≥1.5× display size
- [ ] Videos use OffthreadVideo, premounted, muted unless audio is intended
- [ ] Fonts via @remotion/google-fonts or @remotion/fonts — no CSS imports
- [ ] Any manual async wrapped in delayRender/continueRender with cancelRender on error
