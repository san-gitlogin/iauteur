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

## 5a. Lessons paid for building 18 components for one course (2026-08-15/16)

**Layout traps that only appear at MAX, or only in VERTICAL — check both, always:**
- **`flex: 1` across a horizontal lane is an aspect trap.** Five step-pills sharing a lane look
  fine at 1920 wide and truncate every label to three words at 1080. Use
  `flexWrap: 'wrap'` with an aspect-aware `flex: 1 1 <basis>px` so vertical wraps to two rows
  instead of shrinking each pill into uselessness. (`BACKSTAGE_PHONE`)
- **`marginLeft` on a full-width child pushes it past the body edge** and spills its contents
  outside the frame. An indented/nested level must ALSO set `width: bodyW - indent*i` — which, in
  a component about narrowing scope, is the very thing it exists to show. (`SEARCH_NARROW`)
- **A collapsing element must keep a visible outline.** A half-truncated word with no container
  around it reads as a rendering glitch; an empty stub reads as "walked past". (`SEARCH_NARROW`)
- **A count rendered as `{n} {label}` must read in the SINGULAR.** A shipped frame printed
  "1 locators matched". The linter now warns when a `countLabel` cannot survive n=1.

**Make the component enforce its own EDITORIAL contract, not just its field lengths.** The most
valuable rules written this round were the semantic ones, and each caught a real authoring bug:
- `BACKSTAGE_PHONE` rejects `hopAtWord >= the last step` — a race where the fast route wins *after*
  the slow one finishes is not a race, it is two lists that happen to be stacked.
- `SEALED_BOX` requires ≥1 piercing probe and at most 1 blocked — all-blocked reads as a wall (the
  opposite lesson), several blocked reads as a general barrier rather than one exception.
- `SET_LOGIC` rejects an operator that keeps everything or nothing — a predicate with no rejects is
  a list, one with no survivors teaches nothing about the operator.
- `ORDER_ROULETTE` rejects an all-fail or all-pass roulette — one failing run reads as a bug
  somebody can fix, and the entire lesson is that there is nothing fixed to fix.
- `FROZEN_FRAME` rejects a freeze on the first line (nothing has moved, so there is no stillness to
  see) or the last (nothing left to step into).
- `RECORD_DRAFT` rejects a draft with nothing dropped — that sells generated output as a finished
  test, the exact defect the component exists to show.

**The "should I build it?" test is SEMANTIC, not visual.** `FRAME_BOUNDARY` and a shadow-DOM beat
look alike — a document inside a document — but `FRAME_BOUNDARY`'s model is "blocked until you make
an explicit crossing call", and shadow DOM needs no such call. Reusing it would have sent viewers
hunting for a `shadow_locator()` that does not exist. Likewise `TRACE_SCRUB` (a recording of a run
that finished) must not stand in for `page.pause()` (a live run you can still interact with).
**Ask what the component ASSERTS about the world, not what it looks like.**

## 5a-2. BREATHING ROOM, AND WHY VERTICAL IS NOT A RESIZE (owner, 2026-08-16)

Owner: *"make sure the component you create fits within the window with breathable space to
visually see and understand — that quality is getting degraded as we improve our narration, and
that quality should also be properly maintained."* Correct, and the failure has a shape.

**A component's meaning often lives in a SPATIAL RELATIONSHIP, and stacking destroys it.**
`RECORD_DRAFT` puts the action you performed beside the line it generated: in wide, the pairing is
free, because the two sit on the same row. Switching `flexDirection` to `column` for vertical
turned that into **ten near-identical rows in one undifferentiated wall** — every pairing gone,
which is to say the entire lesson gone, while the frame simultaneously had huge dead space above
and below. Cramped in the middle and empty at the edges is the worst of both.

**So: wide → vertical is a RE-ARRANGEMENT, not a resize.** Ask what relationship the layout is
carrying, then rebuild that relationship for the new aspect. `RECORD_DRAFT` now renders vertical as
*pairs* — the action, then its generated line indented beneath it — so the correspondence survives.
Share the row RENDERERS between both layouts (so styling can never drift) and branch only on
ARRANGEMENT.

**Checklist before calling a component done:**
- [ ] **Look at the vertical MAX proof and ask what it MEANS**, not just whether it fits. If two
      things belonged together in wide, prove they still read as belonging together stacked.
- [ ] **Gaps scale with grouping.** Rows within a group ~5-7px; between groups ~16px+. Uniform
      gaps are what turn a structure into a wall.
- [ ] **Content should not exceed ~75% of frame height.** If it does, cut items or split the beat —
      do not shrink type. A component that only fits by getting smaller has already failed.
- [ ] **Dead space at top/bottom while the middle is dense** means the layout is wrong, not that
      there is too much content.
- [ ] **Anything that travels stays inside its container** — a moving element must never rely on
      the frame edge to stop it (see the width-shrink + edge-dock note in §5a).
- [ ] **Never let narration quality and visual quality trade against each other.** They degrade
      together when a beat is over-stuffed; the fix for both is fewer ideas per beat, not smaller
      type and faster words.

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


---

## PAID-FOR LESSONS — the 109-command masterclass (2026-08-18)

### 1. Multiply scale, never string-splice it
Shipped for weeks, in the shared two-up stage:

```js
padding: `${vertical ? 22 : 26}px`.replace('px', `${scale}px`),   // WRONG
```

At `scale === 1` that is `"26px".replace("px","1px")` → **`"261px"`**. Every right-hand picture
rendered crushed into a corner, in a cut the owner had already watched. The class of bug is
building a CSS length by string surgery. Always compute it:

```js
padding: (vertical ? 22 : 26) * scale,                             // RIGHT
```

Grep any component you touch for `.replace('px'` and for template-literal arithmetic.

### 2. Resolve anchor lists with a PURE function, not a hook
A depiction usually lights a list of elements, each on its own anchor. Calling `useCurrentFrame()`
inside `.map()` works only while the list length never changes and reads as a rules-of-hooks
violation to every linter and reviewer. Read the frame once and pass it down:

```tsx
export const liveAt = (frame: number, atWord?: number, ramp = 9) =>
  atWord == null ? 1 : interpolate(frame, [wordToFrame(atWord), wordToFrame(atWord) + ramp], [0, 1], clamp);
```

### 3. Proof stills BEFORE the long render, and pick frames that prove something
A 90-minute render is two hours. Render a dozen stills first, one per new depiction, at ~78% of
each scene. Two of the three real layout bugs in this build were caught this way and would
otherwise have cost a full render.

For a SYNC claim, compute the absolute frame of two adjacent anchors from the synced spec and
render both: one where the later element must still be dark, one where it must be lit. "It looks
right" is not a proof.

### 4. A registered TYPE is not a new PICTURE
110 components were assembled through the full eight-touchpoint flow and every one of them
rendered through the same six generic archetypes. The wiring was correct and the work was still
the defect the owner named (LAW 0j). Before assembling, write down what MOVES in this component
and how that motion IS the explanation. If the answer is "the labels change", stop.

### 5. Give every instance its own caption
`stageTitle` (or whatever your component calls the caption above the picture) defaulted to one
generic string across all 110 scenes. Author it per beat from that beat's subject — "where you are
standing", "nine switches", "the delete gate", "two separate switches".

### 6. When a data-driven component needs structure, pass the structure
A tree renderer needs DEPTH. Deriving it from array index or from heuristics on the label text
("does it contain a space?") produces a plausible-looking wrong tree. Add the explicit field
(`value` as depth) and author it; where a beat list genuinely is not a hierarchy, render it as an
honest single column rather than an empty tree beside a list.

---

## Drawing structures (trees, graphs, grids) — added 2026-08-19

Recorded after the DSA cut shipped four visual-correctness defects the owner caught on sight.
See LAW 0k in CLAUDE.md for the verdict; this is the how.

**Declare the topology in the data.** `VizCell` carries `parent` (label of the parent node) and
`links` (extra non-tree neighbours). Never derive adjacency from array position or from a `value`
that happens to encode depth — that produced a complete bipartite graph between BFS levels, which
looked plausible on the authored example and would be wrong on the next one. Where a brief is
authored as an indented outline, `layoutTree` recovers parentage from the depth sequence (nearest
preceding node one level shallower); an explicit `parent` always wins.

**Lay a tree out like a tree.** Leaves take equal slots, a parent is centred on the midpoint of its
children. Indenting rows by depth and drawing a small elbow renders a bulleted list, not a tree.

**Strokes in user units.** `strokeWidth={0.5}` plus `vectorEffect="non-scaling-stroke"` is half a
device pixel regardless of how large the drawing is. Drop the vector-effect and size the stroke in
viewBox units so it scales; give the live edge the accent colour and the dormant one the text
colour at ~0.3 alpha, never `panelBorder`, which disappears on a dark panel.

**Size the viewBox to the content, including label width.** A vertical chain in a fixed 100-wide box
gets `meet`-scaled down to a cluster of small pills. Compute the box from the actual extent, and add
the widest node's half-width to each side or the outermost node is sliced by the panel edge. Add
bottom room when any node carries a caption beneath it.

**Nodes size to their label.** A node showing `[1,2,3]` is not a circle. Anything past two
characters becomes a pill wide enough for its text.

**The payload rides on the object.** If the algorithm computes a per-node value (a BFS distance, a
DP cell, a count), draw it on the node. A legend along the bottom edge makes the viewer do a lookup
while the narration moves on.

**Everything that shows data is responsive.** Derive cell height and font size from the item count
against the available panel, with a floor and a ceiling — never a fixed pixel height. The rule of
thumb in `CellRow` / `DpTable`: `h = clamp(56, 660/n, 110)`, `font = clamp(19, h*0.34, 33)`. The
code pane does the same against its line count, or a long listing loses its first and last lines to
the top border and the note bar.

**Verify with stills, not renders.** `npx remotion bundle src/index.ts --out-dir=<dir>` once, then
`npx remotion still <dir> <slug>-wide-dark out.png --frame=N` per scene (~2s each). Montage them
into contact sheets and read the sheets. A full 12-episode visual audit is four minutes; the same
audit done by watching rendered mp4s is a day, which is why it did not happen.

## Overlays, setup text, and the fields that must survive mapping — added 2026-08-20

**An overlay measures itself from the thing it overlays.** Row geometry lives in `cellMetrics(n, big)`
and `CELL_GAP` in `dsaViz.tsx`. The sliding-window frame and `PointerRail` both derive from it. Never
restate a cell height or a gap in the overlay — when the row was made responsive and the frame kept
`height: 74`, the window rendered *smaller than the boxes it contained*, and a percentage-based `left`
that ignored the gaps drifted further off with every cell. Positions step by `(cellWidth + gap)`:

```
left: `calc((100% - ${gapsPx}px) / ${n} * ${i} + ${i * CELL_GAP * scale}px)`
```

**Every pane carries a `premise`.** One plain sentence above the picture, unanchored, constant for the
episode: what the viewer is looking at and what stands for what. It is not the `caption` — that is a
per-beat title. And it must describe *the picture actually on screen*: putting the episode's analogy on
a signal-word card claims "each box is a house you pass" over boxes reading *subarray* and *contiguous*.
Signal cards and cost charts get their own line.

**Budget against the panel, and remember centred overflow goes both ways.** A flex column with
`justifyContent: center` that is taller than its box overflows above *and* below — the first row rides
up over the premise and the last is clipped. Size rows from a height budget:
`barH = clamp(18, (AVAIL/n - LABEL)/1.42, 52)`.

**Fields must survive the scene component's cell mapping.** Every `Dsa*.tsx` maps cells explicitly:

```tsx
const cells: VizCell[] = (d.cells ?? []).map((c) => ({
  label: c.label, sub: c.sub, value: c.value, color: c.color, atWord: c.atWord, state: c.text,
  parent: c.parent, links: c.links, tag: c.tag,   // ← or the topology never arrives
}));
```

Omitting `parent`/`links` there means a declared edge is silently dropped and the shape falls back to a
guess: BFS drew guessed edges for weeks, and a linked-list cycle described in the narration could not be
drawn at all. When adding a field to `VizCell`, add it to the item template in `component-flow.mjs`
**and** to all 13 mappings.

**Never pipe a builder to /dev/null.** `build-dsa-spec.mjs` refuses on an anchor fault, and a refusal
sent to `/dev/null` leaves the previous spec in place — the render then silently uses stale data. If you
must quieten a build, keep stderr.

**Gate: `node scripts/audit-dsa.mjs`, then three frames per scene.** The audit catches what no frame can
show — anchors past the end of the narration, anchors past the scene's own length, panes with nothing to
draw, missing premises. Then sweep stills at 25/55/88% of each scene and montage per episode; one still
cannot reveal a motion glitch.

## Real artefacts: terminal output and charts — added 2026-08-20

**Terminal output** lives in `out?: string[]` on the step item, verbatim, header row included.
`CommandStage` reveals it line by line, sizes the mono type to the whole transcript, and scrolls the
active command into view once the session outgrows the pane. The old `[text, sub]` pair gave two
lines and is now only the fallback for un-migrated scenes. If narration names a column, that column
must exist in `out`.

**Charts** use `MetricChart` (`kind="metric-chart"`), never a bare path. The item supplies
`series: number[]` plus `unit`, optional `threshold`, and three `xLabels`. The card renders a titled
header, y-axis ticks with real numbers, x-axis ticks, gridlines, the threshold as a labelled dashed
rule, and a live read-out that counts up with the drawn line. Items without a series fall back to
the sparkline, so nothing regresses — but a beat that talks about values must carry them.

**Vertical budgets are not wide budgets.** The Shorts state pane is ~2.5x taller and the code/terminal
pane is ~540, not the full stage. Every stacked list takes `stackBudget(v)`; `cellMetrics(n, big,
vertical)` sizes rows. When content still will not fit at a readable size, remove content — trim to
two command steps and three output lines — rather than shrinking the type.
