# Screenplay Presets — pick the shape of the video

Scene ORDER + PACING are a deliberate choice, not one fixed mould. Before scene
selection, pick a preset that fits the topic and declare it as `meta.screenplay`.
`npm run critique` reports the video's preset + whether the scene order adheres,
and infers one if you don't declare it. Definitions live in `scripts/screenplays.mjs`.

Rotate presets across videos just like themes — two consecutive videos on the
same preset AND theme is a defect.

## The five presets

| Preset | Use when | Arc | Scenes | Pacing |
|--------|----------|-----|--------|--------|
| **explainer** | default; "how X works / why X matters" | HOOK → TITLE_CARD → problem → 2-3 explainers → payoff → RECAP → OUTRO | 7-10 | steady |
| **listicle** | "N things / tips / mistakes / tools" | HOOK → TITLE_CARD → LIST_BUILD → 3-5 item scenes → RECAP → OUTRO | 6-9 | fast |
| **versus** | A vs B, old vs new, migrations | HOOK → TITLE_CARD → SPLIT_PATHS → BAR_COMPARE → STAT_PANELS (verdict) → RECAP → OUTRO | 7-9 | balanced |
| **deep-dive** | architecture, protocols, research, long-form | HOOK → TITLE_CARD → CHAPTER → diagram/code → STAT_PANELS → CHAPTER → chart/timeline → RECAP → OUTRO | 9-12 | deliberate, chaptered |
| **documentary** | full 8-15 min explainers, "complete guide", multi-part | HOOK → TITLE → AGENDA → [ CHAPTER → 5-8 beats → payoff ] ×5-6 → RECAP → OUTRO | 28-60 | chaptered, long-form |
| **hype-launch** | launches, reveals, "it's here" | HOOK → COUNTDOWN → TITLE_CARD → STAT_CALLOUT → NOTIFICATION → GALLERY → FLIP_CARD → OUTRO | 6-9 | energetic |

## Per-preset craft
- **explainer** — transitions `fade/wipe/iris`; bg `aurora-grid/grid`; moderate entrance variety (pop/slide/rise). One idea per scene.
- **listicle** — transitions `slide/push/wipe`; bg `aurora/bokeh/gradient`; HIGH entrance variety — give each item a DIFFERENT `data.anim` (slideLeft / bounce / pop / spin) so the list doesn't feel repetitive.
- **versus** — transitions `push/wipe`; bg `grid/plain`; symmetric entrances for the two sides, a distinct one for the verdict. Give both sides equal screen time.
- **deep-dive** — transitions `dip/iris/letterbox`; bg `aurora-grid/geo`; CALM entrances (blur/rise) — restraint reads as authoritative. Use `CHAPTER` dividers to segment.
- **hype-launch** — transitions `zoom/pixel/blinds/whippan/glitch/zoomthrough`; bg `gradient/ripple/starfield`; LOUD entrances (bounce/spin/pop/bubble) + more emphasis motion. Big numbers, reactions, a countdown.

## How it connects
- Declare `"meta": { ..., "screenplay": "listicle" }`.
- The critic checks: opens with HOOK, closes with OUTRO_CTA/RECAP, required scene types present, scene count in range — and prints the preset's suggested transitions / backgrounds / entrance-variety so you can apply them via `scene.transition`, `brand.background`, and `data.anim`.
- Presets are GUIDES + CHECKS, not hard rules; the linter still owns text budgets.
