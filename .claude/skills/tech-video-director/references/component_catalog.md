# Component Catalog — the director's palette

The renderer maps `scene.type` to a component. This file gives the facts you need to
CHOOSE and PLACE the core editorial/chart/mockup types.

> **Source of truth for the FULL type list is `references/scene_library.md`** — it now holds
> 136 types including the tech-education / architecture families (BITS, MEMORY, PACKET,
> PIPELINE, LAYERED_STACK, GRID_ARRAY, SPEC_COMPARE, DIE_SHOT, NEURAL_NET, DATACENTER,
> TRANSFORMER_BLOCK, CACHE_PYRAMID, CALL_STACK, TOKENIZER, FILE_TREE, DATABASE_TABLE,
> GIT_BRANCH, STATE_MACHINE, EMBEDDING_SPACE, QUEUE, API_REQUEST_RESPONSE, BOOLEAN_LOGIC_GATES,
> HASH_FUNCTION, SORTING_VISUAL, CLOCK_SIGNAL, GPU_CLUSTER, ZOOM_SCALE, ENCRYPTION,
> POINTER_DIAGRAM, NUMBER_BASE, …). To ADD a new type, follow `references/component_authoring.md`.
> The machine-readable twin is `scripts/catalog.mjs`; the automated review is `npm run critique`.

## Chart-by-intent (pick the visual that matches the DATA's shape)
| The data is… | Use | Notes |
|---|---|---|
| a number that changed over time | `LINE_CHART` | 1-3 series, `area:true` for volume |
| parts of a whole (%) | `DONUT` | 2-6 segments + center metric |
| a ranking / magnitudes | `BAR_COMPARE` | 2-4 bars, value labels |
| completion / coverage / a score | `PROGRESS` | rings (default) or `variant:"bar"` |
| options on two trade-off axes | `QUADRANT` | 2x2 map, ≤6 points |
| a sequence of dates | `TIMELINE` | ≤5 milestones; reflows vertical on Shorts |
| ONE hero number | `STAT_CALLOUT` | counts up; optional `si:` logo strip |
| runnable code + its result | `CODE_WINDOW` | types code, shows output panel |

Rule: never place two of the SAME chart back-to-back; vary the widget so the eye
keeps getting a new shape. `npm run critique` flags this automatically.

## The core editorial scene types (this catalog's palette — the full 136 live in scene_library.md)
Structure: `HOOK` (always 1st, ≤8s) · `TITLE_CARD` · `RECAP` · `OUTRO_CTA` (last).
Diagram/flow: `CONCEPT_DIAGRAM` · `STEP_FLOW` · `SPLIT_PATHS`.
List/editorial: `LIST_BUILD` · `QUOTE_SPOTLIGHT`.
Data/chart: `STAT_CALLOUT` · `STAT_PANELS` · `BAR_COMPARE` · `LINE_CHART` · `DONUT` · `PROGRESS` · `TIMELINE` · `QUADRANT`.
Mockup: `CHAT_MOCKUP` · `CODE_WINDOW`.
Branding: `CHANNEL_CARD`.

For each type's full spec — wide vs vertical layout, dark/light colour behaviour,
fonts, motion, asset slots and their licensed source, and good neighbours — read
`scripts/catalog.mjs` (`CATALOG`), or run `npm run critique -- <spec>` which prints
all of it per scene against your actual draft.

## Assets & their source (the critic verifies every one)
- `lucide:<name>` — Lucide icon set, ISC licensed, bundled. Free, no attribution.
- `si:<slug>` — simple-icons brand mark. Nominative use only (identify the brand; never imply endorsement).
- `img:<file>` — a local file in `public/assets/`. MUST be your own capture or CC0/public-domain. The linter blocks a missing file; the critic prints whether it is present.
Never invent an `img:` path. If a screenshot/photo would help, list it under `assetsNeeded` and use an icon fallback.

## Motion vocabulary (src/motion) — how things ENTER, EMPHASISE, MOVE
Entrances: `fadeUp` `slideIn` `blurIn` `scalePop` `springPop` `stackIn` `riseIn` `clipReveal`.
Text: `typewriter` `revealAt` (word/char stagger) `highlightAt` `bounceIn` `bubblePop` `glitchText` `charSpin` `outlineText`.
Emphasis (one focus per frame): `pulse` `floaty` `shake` (two-freq) `glowPulse` `sweep`.
Numbers: `counterValue` `countUp` `compactNumber` `odometerOffset`.
Cinematic/whole-scene: `cameraPush` `parallax` `whipPan` (scaleX stretch) `kenBurns` `letterbox` `spotlightReveal` `vignettePulse` `zoomPulse` `grainOpacity`.
FX (ported from RVE): `scaleRotate` `splitOffset` `particle` `waveBar` `glitchSettle` (decaying RGB) `squashDrop` (squash-and-stretch).
Path/chart: `pathDraw` `drawProgress` `arcSweep`.
All are pure functions of the frame, clamped, ×scale-safe. Entrances 12–18 frames; ONE glow/emphasis focus per frame.

## Per-element entrance selector — `data.anim` (VARIETY LEVER)
Any scene can override its primary element's ENTRANCE via `"anim"` in scene.data. This is
how two videos using the same scene type still move differently — vary it across scenes/videos.
Values (see `src/motion/entrance.ts` `ENTRANCES`): `fadeUp` `rise` `blur` `pop` `scale` `bounce`
`bubble` `spin` `stack` `slideLeft` `slideRight` `slideUp` `slideDown` `clip` `wipe`. Omit for the scene's
sensible default (HOOK/TITLE→`pop`, LIST/RECAP→`stack`, NOTIFICATION→`bubble`). Wired in: HOOK, TITLE_CARD,
LIST_BUILD, STAT_CALLOUT, RECAP, OUTRO_CTA, STEP_FLOW, CONCEPT_DIAGRAM, SPLIT_PATHS, GALLERY, PHOTO_STACK, NOTIFICATION.

## Backgrounds (brand.background) — 11 options
`aurora` `grid` `aurora-grid` `plain` `bokeh` `starfield` (golden-angle fly-through) `grid-pulse`
`wave` `ripple` (dot-matrix) `gradient` (rotating tri-color) `geo` (nested morph). One per video; vary across videos.

## Scene transitions (scene.transition) — 16 options
`fade` (default) `slide` `push` `zoom` `morph` `wipe` `iris` `clock` `dip` `blinds` `pixel`
`whippan` (fast motion-blur slide-in) `zoomthrough` (dramatic scale rush) `letterbox` (cinematic bars retract) `filmburn` (warm light-leak flash) `glitch` (jitter + scanline). The cinematic four (whippan/zoomthrough/letterbox/filmburn) suit hooks, reveals & act breaks; use sparingly.

## 81-template coverage (RVE reference library)
Every one of the 81 templates is mapped in `scripts/catalog.mjs` (`RVE_81`). Statuses: `core`
(already a scene) · `added` (built scene/primitive/transition/background) · `motion` (an applicable
helper) · `deferred` (off-grammar, reasoned). The 81 REAL `.tsx` files were read and their
techniques ported faithfully (deterministic reauthoring where originals used Math.random / CSS
keyframes). `npm run critique` prints the live tally.
