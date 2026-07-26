# Component Authoring — the LAW for building or fixing a scene component

This is the canonical, do-not-skip recipe for adding a NEW scene component to the
render library, or FIXING an existing one, so it is correct for **every future
video** and renders perfectly in **all 30 design packs** at both aspect ratios,
dark and light. It encodes everything the studio has learned. If you build a
component and skip a step here, it is a defect.

Read this together with `design_contract.md` (the physics), `scene_library.md`
(the director-facing catalog) and `craft_patterns.md` (visual polish).

---

## 0. Mental model — why a component "just works" in 30 designs

A component NEVER hardcodes a colour, font, radius, border or glow. It reads
**theme tokens**. The theme is chosen per video by `brand.theme` (the dark skin:
studio | neonGrid | midnight | terminal | linear | vapor | luxe) and
`brand.themeLight` (daylight | paper | brutalist); a `brand.design` pack
(src/designs/<pack>/) can additionally reskin shared primitives. Because the
component only ever asks the theme for values, the SAME component code renders
natively in cyberpunk neon, luxe gold, neobrutalism flat-hard, daylight light,
etc., with zero per-design branches. **Hardcoding any visual constant is the
single most common way to break design adaptation — don't.**

### The token vocabulary (get everything from here)
```
const t = useTheme();
t.colors.bg | panel | panelBorder | text | muted | onAccent | glowSoft
t.colors.accent | accent2 | accent3
t.colors.sem.{blue|green|red|orange|purple|yellow}   // SEMANTIC colours
t.fonts.display | body | mono | accent                // NEVER 'sans'/'Arial'
t.style.cornerRadius   // 0 on neobrutalism → multiply every radius by this
t.style.glow           // 0 on flat themes → gate every boxShadow/drop-shadow on this
t.style.displayWeight | displayTracking

const sem = useSem();                 // sem('blue') → t.colors.sem.blue
const {scale, vertical} = useScale(); // scale multiplies EVERY px; vertical = shorts
hexA('#rrggbb', 0.4)                  // token colour + alpha
```
Rules that make adaptation automatic:
- **Radius**: `16 * scale * t.style.cornerRadius` — collapses to sharp corners on neobrutalism.
- **Glow/shadow**: only emit when `t.style.glow > 0`, and scale it by `t.style.glow`.
- **Colour**: semantic tokens carry MEANING consistently, so pick a convention and keep it
  (e.g. green=compute/active/success, blue=data/memory, orange=network/warning, red=danger,
  purple=AI/compute2, yellow=cache/power). A component and its neighbours should "rhyme".
- **Fonts**: `t.fonts.display` for headings, `t.fonts.body` for prose, `t.fonts.mono` for
  code/addresses/ids/values, `t.fonts.accent` for flourishes. Never a literal family.
- **Contrast on light themes**: text uses `t.colors.text`/`muted` (theme-correct); when you put a
  glyph on a coloured fill use `t.colors.onAccent`; for icons use `AssetIcon` with `on={bgColor}`
  so its luminance guard keeps it visible.

### Shared primitives (use them; they carry design-pack delegation)
`Headline` (one accented phrase via `[brackets]`), `SourceFooter`, `Panel`, `Pill`,
`Kicker`, `AccentSpan`, `DottedConnector` from `../ui`; `AssetIcon` (props: `bare`,
`tint`, `on`) from `../AssetIcon`. `Headline`/`Panel` auto-delegate to the active
design pack's grammar — so using them is how a fallback scene inherits the pack's
voice. Prefer them over hand-rolled headers/cards.

---

## 1. The wiring checklist — EIGHT touchpoints, every time

`node scripts/component-flow.mjs assemble` wires all eight for you, runs tsc + the gate, and rolls
back atomically if anything fails — prefer it. Doing it by hand means all of these:

1. **`scripts/lib/constants.mjs`** — add `'TYPE_KEY'` to the `TYPES` array, else the linter rejects
   the type. (Corrected 2026-07-26: `TYPES` used to live in `lint-spec.mjs`, which now imports it
   from here. An older revision of this checklist sent people to the wrong file.)
2. **`scripts/lib/manifest.mjs`** — the type's data contract plus a **valid `example`**. This is the
   SINGLE SOURCE OF TRUTH for every component's shape; `check-manifest` fails the gate if the
   manifest and `types.ts` disagree, and the schema/types generators read from here.
3. **`src/types.ts`** — add the `<Name>Data` interface (+ any sub-interfaces) next to its
   siblings, and add ONE optional field to `SceneData` (e.g. `pipeline?: PipelineData;`).
4. **`src/scenes/<Name>.tsx`** — the component. `React.FC<{scene: Scene}>`, read
   `scene.data.<field>`, guard `if (!d) return <AbsoluteFill />;`. Tokens + `×scale` only.
5. **`src/MainComposition.tsx`** — `import {<Name>}` and add `TYPE_KEY: <Name>` to `registry`.
6. **`scripts/lint-spec.mjs`** — TWO edits:
   - if the component is visual/animated, add `'TYPE_KEY'` to the `DYNAMIC` array (anti-monotony);
   - add a validation block (`if (d.<field>) { … }`) with a **character budget for every text
     field** sized to the NARROWEST (vertical) container, plus count/enum/index-range checks.
7. **`references/scene_library.md`** — add a row: `| TYPE_KEY | USE-WHEN intent | data-shape with budgets |`.
8. **`src/showcaseSpec.ts`** — add an `x-<name>` demo scene to the `extra[]` array so the component
   shows up in EVERY design composition (the review surface) and gets a smoke render for free.

Then regenerate the derived files (`node scripts/gen-schema.mjs`, `node scripts/gen-types.mjs` — never
hand-edit `specs/video.schema.json` or `src/sceneTypes.generated.ts`), confirm
`node node_modules/typescript/bin/tsc --noEmit` is clean, `node scripts/lint-all.mjs` shows only
pre-existing known rejections, and `npm run gate` exits 0.

**Removing a type:** `node scripts/component-flow.mjs remove <TYPE>` reverse-wires all eight cleanly —
but it only strips the type from `DYNAMIC`, so **delete your hand-written validation block in
`lint-spec.mjs` yourself** and grep for residue.

---

## 2. Layout & animation rules (make defects impossible, not unlikely)

- **Every px is `× scale`.** A raw pixel literal on a size/gap/offset is a defect.
- **Both aspects are first-class.** Decide the wide (row / left→right) and the vertical
  (column / top→bottom) layout up front; branch on `vertical`. Never ship a component proven in
  only one aspect. SVG diagrams: swap the "along" and "cross" axes for vertical.
- **Three Guards on bounded text** (Budget in linter + Fit via fitText + Wrap fallback).
  `whiteSpace:'nowrap'` is banned unless paired with a maxWidth. Prefer `overflow:hidden` +
  `textOverflow:'ellipsis'` on single-line labels inside fixed-width cells.
- **Deterministic motion only.** Pure functions of `useCurrentFrame()`; every `interpolate`
  clamps both sides (`{extrapolateLeft:'clamp', extrapolateRight:'clamp'}`). NO `Math.random()`
  unseeded (use a `Math.sin(i*..)` hash for "random-looking" but stable values), NO CSS
  `@keyframes`/transitions.
- **Entrances 12–18 frames; ONE glow/emphasis focus per frame.** Stagger children by index.
- **BASE ≤38 FRAMES — never dead-screen until a late anchor (user-reported defect, 2026-07-18).**
  A component's base visual (the diagram, board, frame, stack — whatever the narration is
  describing) must be on screen within 38 frames of scene start. A lone scene-level anchor
  (`d.atWord`) may only time an EMPHASIS payoff (a bracket, tag, verdict, highlight), never the
  whole render tree. Idiom: `const start = Math.min(wordToFrame(d.atWord ?? 1), 38);` for the
  base; `wordToFrame(d.atWord)` un-clamped only for the payoff element. Per-item anchors
  (bars/rows/logos popping at their naming words) are the GOOD pattern and stay un-clamped, as
  do genuine twist components where withholding IS the design (REVEAL's iris, FLIP_CARD's flip
  — which must still show a front/cover from frame 0). All 73 existing base-gated sites were
  clamped in the 2026-07-18 sweep (incl. the pack CODE_WINDOWs' typing start); new components
  must ship with this contract from day one.
- **Alignment via structure, not magic numbers.** Use CSS grid / flexbox / SVG maths so cells
  cannot drift. For labels pinned to a shape, render them INSIDE the same SVG as `<text>` (or
  anchored to the same element) — never as an absolutely-positioned div whose coordinates
  re-derive the layout (that drifts the moment the layout changes).
- **Icons**: `AssetIcon asset="lucide:x"` (UI glyph) or `si:brand` (brand mark), always with
  `bare` inside cards, plus `tint` and `on={bgItSitsOn}` so the contrast guard keeps it visible.

---

## 3. Render-proof discipline (never claim done without viewing stills)

1. Write a throwaway spec `specs/_x.json` (a few scenes, one per component under test) and a
   throwaway `scripts/_x.mjs` that `bundle()`s once then `renderStill`s under
   `material-wide`, `material-short` (BOTH aspects) and `neobrutalism-wide` (a flat, hard,
   grid design — the opposite of material) at the frames where each scene animates.
2. **Stress fixtures, not a happy demo (Template-Hardening Law, design_contract.md).** Prove each
   component against THREE content fixtures — **MIN** (shortest legal content, min items, optional
   fields omitted), **MAX** (every text field at its budget ceiling, max items, all optional fields,
   widest numbers so compaction fires) and **MIX** (mid-length, icons on some items only) — each ×
   both aspects × material + neobrutalism. If a MAX fixture breaks the layout, fix the COMPONENT or
   tighten the budget — never the fixture. Layouts must be content-aware (grow with content,
   min-heights not fixed, collapsing icon slots, minWidth+ellipsis label cells).
3. **Sample at each scene's MIDPOINT, not its boundary.** Scenes of 200f each span
   `[200k, 200(k+1))`; sample ≈ `200k + 100`. Sampling on the boundary renders the NEXT scene's
   first (faded-in / blank) frame — a classic false "blank component" scare.
4. VIEW every still. Material proves rounded+glow; neobrutalism proves flat+sharp+grid+light-ink —
   together they prove theme adaptation. Fix anything, re-render, re-view.
5. `tsc` clean + `lint-all` clean, then DELETE the throwaways (`specs/_x.json`, `scripts/_x.mjs`,
   `out/proof/...`). Do not leave scaffolding behind.

Environment notes (Windows PowerShell): `npm`/`npx` are blocked by execution policy — call
`node <script>` directly (Studio: `node node_modules/@remotion/cli/remotion-cli.js studio`).
PATH goes flaky between commands — prefix with
`$env:Path = "C:\Windows\System32;C:\Windows;C:\Program Files\nodejs"`. ~60 font-loading network
warnings per render are normal; ignore them.

---

## 4. Fixing an existing component for a video (the "template needs a tweak" case)

When a specific video reveals a component isn't perfect, **fix the COMPONENT, not the spec.** A
per-video hack in a topic JSON is forbidden (topics are immutable once rendered, and the next
video would inherit the same flaw). The fix must:
- stay token-driven and `×scale` (so it still adapts to all 30 designs and both aspects);
- be re-proven with stills at BOTH aspects and at least material + neobrutalism BEFORE it's done;
- keep every existing budget valid (don't silently make text longer than the linter allows);
- preserve the data shape (adding an OPTIONAL field is fine; renaming/removing breaks shipped specs).
Because the fix lives in the component, every future video that uses the type gets it for free —
which is the whole point of this library.

---

## 5. Lessons already paid for (do NOT re-learn these the hard way)

- `counterValue(frame, start, TARGET, durationFrames=40)` — 3rd arg is the target VALUE, 4th is
  duration. Passing an end-frame as the target prints a wrong number (once showed 54 for a 32).
- SVG diagram labels: render as `<text>` anchored to the shape's own coords. An absolutely
  positioned `<div>` that recomputes the centred-SVG origin will drift — we removed one.
- A stray grid child (even `display:contents`) counts as a cell and shifts a CSS-grid table by one
  column. Only emit the exact cells the grid template expects.
- **Centred layouts crowd the headline on wide.** `AbsoluteFill` centres the content column and the
  `Headline` is absolute near the top; a tall block rises under it. Increasing the block's
  `marginTop` alone just re-centres (the column gets taller). FIX = make the block SHORTER on wide
  (smaller plot/card) AND add top margin, so its top clears the headline band (~y 180×scale).
- Axis/legend or caption collisions: give the flow real gap, or move the label into the column
  flow instead of absolute-offsetting it past the container (which risks horizontal overflow on
  vertical, where scale=width/1080 and things are tighter).
- An "active"/highlighted element should glow in ITS OWN semantic colour, not the global accent
  (e.g. a red rack's uplink is red, not blue).
- Give narrow cells a `minWidth`/floor so chips inside them never clip on the tight vertical build.
- Neural-net / graph edges: draw ALL edges faintly at full length first, then draw the lit portion
  progressively ON TOP — so a mid-animation frame never shows dangling half-edges.
- Position per-item labels to the item's real coordinate (e.g. a layer's node-line), not via
  `justify-content:space-between`, which is offset by the container padding.
- **Tooltips / popovers render OPAQUE (panel bg + shadow), placed BELOW the anchored line, and are
  collision-flipped ABOVE only when the frame bottom would clip them.** A translucent tooltip between
  code lines reads as a broken overlap (CODE_EDITOR squiggle catch).
- **Path-like strings (URLs, file paths, ARNs, image tags, selectors) middle-truncate** via
  `middleTruncate` (src/kit.tsx) — keep the origin/head AND the leaf/tail, drop the middle
  (`app.example.com/…/checkout`). NEVER end-truncate a path (the leaf is usually the point).
- **Shared grammars, never reimplemented.** Code colour = `codeSyntax.ts`; log levels = `logLevelColor` +
  `LogRow`; network phases = `phaseColor` + `WaterfallRow`; window chrome = `ChromeFrame`; content =
  `ContentSlot`. A devtools console reuses LogRow; a devtools network panel reuses WaterfallRow — if you
  find yourself redrawing a grammar inside a new component, stop and consume the primitive.
- **Segmented bars compute in px from an EXPLICIT width — flex distribution and phase math don't mix.**
  A bar split into proportional segments (waterfall phases, CONTEXT_METER segments, error-budget splits)
  must live in a container with a fixed `width: barW` (not `flex:1`), and each segment's left/width is
  `(ms/maxMs)*barW`. Under `flex:1` the container width is unknown at compute time, so the segments land
  wrong (WaterfallRow catch). Same law for GaugeRing arcs: the ring is sized from a fixed radius, never
  a flex box.
- **A nested-box layout (CLOUD_ARCH, and any boundary-in-boundary scene) must lay its contents along the
  LONG axis of the aspect — horizontal on wide, VERTICAL on shorts.** A horizontal-only nesting engine
  renders a tiny squished strip on vertical (CLOUD_ARCH vert catch): measure + place both branch on
  `!vertical`, and a single `fit` scale keeps it inside the frame on both. Fixed-width nodes must also
  CLAMP their text — a two-line `-webkit-line-clamp` label (not an end-ellipsis that eats "Load Bal…") and
  a `overflow:hidden` sub with the node itself `overflow:hidden` so an ARN never bleeds into its neighbour.
- **A radial/ring layout must be sized to FIT THE FRAME, and its top labels must clear the headline.** A
  square ring box of side 1180 is taller than the 1080 wide-frame → the bottom node clips off-screen
  (KNOWLEDGE_GRAPH catch: size the box to ~800 wide / ~920 vertical). A concentric-ring diagram's outer-ring
  top label lands right under the headline → shrink the box until it clears (AGENT_HARNESS wide catch, worse
  under a tall neo headline box). Always prove the MAX fixture on BOTH aspects AND a tall-headline design (neo).
- **Deterministic layout from a hash of the ids (never unseeded randomness).** KNOWLEDGE_GRAPH seeds its ring
  rotation from `hash(nodeIds) + seed` so a shipped spec re-renders byte-identically forever (Remotion law).
  If a seed produces an overlap, perturb the seed deterministically and store the resolved value in the spec.
- **Build a motion grammar ONCE and share it.** The guardrail/sandbox bounce is `bounceTravel` in kit.tsx —
  AGENT_HARNESS and SANDBOX_BOX both consume it so "an action hits a wall" reads identically. Same pattern as
  GaugeRing (every gauge), ChromeFrame (every window), ContentSlot (every framed surface): if two scenes need
  the same motion or chrome, it's a kit primitive, not a copy.
- **Radial layouts must not stack items on the same spoke, and a travelling element needs a CLEAR LANE.** In a
  concentric-ring diagram, placing chip `j=0` of every ring at the same angle stacks them radially — fine at
  rest, a pile-up the moment a guardrail/probe travels through that spoke (AGENT_HARNESS audit catch: the
  guardrail chip + its red stamp buried the ring chips at the bounce frame, invisible in the isolated proof but
  obvious in-composition at the emphasis frame). Fan items across an arc, STAGGER per ring so different rings
  never share a spoke, and route any travelling element (guardrail, probe, cursor) down an arc that holds no
  items. This defect only shows MID-MOTION — always sample the emphasis/bounce frame, not just settle.
- **Frames vs slots (ContentSlot law):** a frame (ChromeFrame / WINDOW_FRAME / DEVICE_FRAME) draws chrome
  and NEVER reaches inside the slot; a ContentSlot owns its own inner padding and NEVER draws chrome. Slot
  content animates AFTER the frame settles (motion hierarchy). Every frame's MIN fixture is the `empty`
  slot kind — a bare frame must still look intentional, not broken.
- Design packs with LIGHT panels set `kit.ink`; core `Panel` skips delegation for them so
  theme-coloured children stay readable. If your component draws its own card, respect the same:
  on light fills use dark ink, gate glow on `t.style.glow`.
- **Consolidated VARIANTS are additive, discoverable, and family-throttled.** When a type hosts
  variants (PIPELINE's status system): (a) add ONLY optional fields — the default path must stay
  byte-identical (prove it: render the flow demo, confirm pixel-stable = GATE 4); (b) size cards with
  a TALLER fixed height only in the variant path (`hasStatus ? tallH : originalH`) so the default
  render is untouched; (c) give EACH variant its own scene_library row + catalog.mjs entry + showcase
  demo + stress fixtures + budgets (a director scans by intent, e.g. "CI", not by parent type); (d)
  the linter treats TYPE+VARIANT as one sub-type for the distinct-count/35%-cap but ALL variants of a
  family as one shape-family for adjacency, and caps the family at ~25% (`FAMILY`/`subTypeOf` in
  lint-spec.mjs) — so consolidation can't game the anti-monotony law; (e) sibling variants must read
  as different BEATS — differentiate by chip SYSTEM (status badges vs bare ms vs event badges vs system
  pills), not just labels.
- **Architecture-Kit primitives (src/kit.tsx)** — BoundaryGroup / LegendRow / EdgeLabelChip /
  StatusBadge. BoundaryGroup label sits IN the border over a `t.colors.bg` backing (never overlaps
  children); inner padding ≥24×scale content-aware; nest ≤3. A DOCKED LegendRow needs horizontal
  padding (≥56×scale) + boxSizing:border-box so 5 max-length items wrap instead of kissing the frame
  edge on vertical (and set `hideOnVertical` when the diagram needs the height). EdgeLabelChip is an
  SVG `<g>` offset along the edge NORMAL — render it inside the same `<svg>` as the edges (shared coords).
- **Windowed components share ONE chrome (src/kit.tsx `ChromeFrame`)** — CODE_EDITOR / TERMINAL_SESSION
  now, WINDOW_FRAME's browser/mac/windows/linux later. Add a variant to ChromeFrame, NEVER re-implement a
  title bar in a consumer. Traffic lights are token-driven (flat squares when cornerRadius is 0). An editor
  tab must read ACTIVE by CONTRAST (different background), not only an underline — neobrutalism has no glow.
- **ONE syntax map for all code (src/codeSyntax.ts `tokenizeCode`+`roleColor`)** — keywords=purple,
  strings=green, numbers=yellow, functions/calls=blue, comments=muted, errors=red. Every code component
  consumes it; none defines local colours, or adjacent code scenes look like different products. When you
  migrate an existing code component to the map, it's ADDITIVE (same data) — re-prove one shipped scene (GATE 4).
- **An inline lint/error tooltip must be an OPAQUE popover** (`t.colors.panel` bg + shadow + coloured
  border), placed BELOW the errored line (above only near the bottom). A translucent tooltip visually
  collides with the code line behind it — a real MAX-fixture catch.
- **A VARIANT can flip a component's whole reading direction.** ERROR_TRACE (CALL_STACK mode:"trace")
  reads DOWNWARD (most-recent first) with the culprit mid-list + "raised here" — do NOT reuse the upward
  push/`top` language. Auto-detect via `scene.type === 'ERROR_TRACE'` so directors needn't set the mode.
- **Deterministic scroll/stream** (LOG_STREAM): reveal ~1 line / 6–8 frames (readability > realism); to
  PIN a line, compute a piecewise reveal that holds for ~30 frames at the highlight, then resumes — all a
  pure function of frame, no timers.

---

---

## 5b. VISUAL CRAFT LAWS — a component that compiles is NOT done; a component is done when it is BEAUTIFUL

A scaffold gives you a token-driven, `×scale`, both-aspect skeleton. That is the START. The
laws below are what turn a skeleton into a broadcast-quality scene, and they are checked in the
render-proof (view the stills against each). If a still fails one of these, fix the component.

### Typography & calligraphy
- **Font ROLES, never a literal family.** `t.fonts.display` = headings / hero lines (heavy, use
  `t.style.displayWeight` + `t.style.displayTracking`); `t.fonts.body` = prose, labels, subs;
  `t.fonts.mono` = numbers, code, ids, addresses, kickers (tabular figures); `t.fonts.accent` =
  a script/serif flourish ONLY (a kicker or one short aside) — never body text, never data.
- **Hierarchy: one dominant size per frame.** Step sizes on a ratio (~1.25–1.5), never two
  competing large texts. The eye must know where to land first.
- **Weight & tracking:** big display gets slightly TIGHT tracking; uppercase mono kickers get
  POSITIVE letter-spacing (~2–3×scale); body stays default. Line-height: display 1.05–1.12,
  body 1.3–1.45 — never cramped, never airy.
- **Calligraphy/accent fonts are seasoning:** ≤1 short accent-font phrase per frame; if it must
  be READ at a glance, it is body/display, not script.

### Alignment & visual perfection
- **Align via STRUCTURE (grid / flex / SVG math), never magic offsets.** Labels pinned to a shape
  live in that shape's own SVG coord space (see §5 lessons) so they never drift.
- **One optical center, generous safe margins.** Content sits in the middle band; nothing touches
  edges (≥48×scale wide, more on vertical). Numerals tabular; icon+label share a baseline.
- **One spacing rhythm.** Pick a gap scale (e.g. 6/12/20/28×scale) and reuse it — no one-off gaps.
- **One focal point per frame.** Exactly one glow/emphasis; everything else recedes. Two focal
  points = no focal point.

### Transparency, opacity & blur (the most common "looks broken" bug)
- **Anything that must be READ sits on an OPAQUE surface** (`t.colors.panel` + border, shadow gated
  on `t.style.glow`). Tooltips, popovers, labels over content/code, callout cards = opaque. A
  translucent panel over text/code reads as a broken overlap (a real, paid-for catch — §5).
- **Alpha (`hexA`) is for DE-EMPHASIS only** — faint gridlines, inactive edges, glow halos, a scrim
  behind a hero. Never put legible text on a semi-transparent fill over a busy background.
- **Blur is conditional.** `backdrop-blur` only when the backdrop is busy AND the foreground stays
  high-contrast; on flat themes (`t.style.glow === 0`, e.g. neobrutalism) prefer a SOLID fill over
  blur/glass. Never leave an element at rest at partial opacity — fade interpolations clamp 0→1.

### Colour theory & dark/light (recap of §0 — verify in the proof)
- Semantic colours MEAN (green=works, red=broken, blue=info, purple=AI, orange=tension, yellow=cost);
  an active element glows in ITS OWN semantic colour, not the global accent.
- Contrast: text = `t.colors.text`/`muted`; glyph on a coloured fill = `t.colors.onAccent`; icons via
  `AssetIcon on={bg}` (luminance guard). Verify on a LIGHT twin (daylight/paper) AND dark.

### Motion
- Entrances 12–18f, staggered by index; deterministic (pure function of frame); clamp both sides;
  content animates AFTER its frame/chrome settles. No `whiteSpace:'nowrap'` without a `maxWidth`.

---

## 6. Definition of done (all must be true)
[ ] tokens + `×scale` only — zero hardcoded colours/fonts/radii/px
[ ] wide AND vertical layouts defined and render-proven (stills viewed)
[ ] proven in material (rounded+glow) AND neobrutalism (flat+sharp+grid) — adaptation confirmed
[ ] proven on a LIGHT twin (daylight/paper) too — contrast holds, no invisible text
[ ] TYPOGRAPHY: display/body/mono/accent roles correct; one dominant size; tracking + line-height tuned
[ ] ALIGNMENT: structural (grid/flex/SVG), one optical centre, one spacing rhythm, safe margins, one focal point
[ ] TRANSPARENCY: read-text on OPAQUE surfaces; alpha/blur only for de-emphasis; nothing stuck at partial opacity
[ ] COLOUR: semantic colours carry meaning; active element glows in its own colour; contrast verified both modes
[ ] Three Guards on every bounded text; budgets added to `lint-spec.mjs`
[ ] all six wiring files updated (types, scene, registry, linter TYPES+DYNAMIC+budgets, scene_library, showcaseSpec)
[ ] `tsc` clean; `lint-all` clean apart from known immutable-topic rejections
[ ] throwaway proof spec/script/stills deleted
[ ] `references/scene_library.md` row added; this file's lessons honoured
