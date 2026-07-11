# Long-form authoring — how to build 8-15 minute videos

The studio was tuned for 1-minute videos; this guide makes the **long-form** path
easy and repeatable. Validated on `topics/how-the-internet-works/` (44 scenes, 8.3 min).

## 1. Declare the documentary screenplay
Set `meta.screenplay: "documentary"`. This unlocks the long-form scene-count range
(the linter allows up to ~60 scenes instead of warning past 14) and tells the critic
to check chaptered pacing. Definition lives in `scripts/screenplays.mjs`.

## 2. Budget the runtime with math, not vibes
- 30 fps, ~150 wpm. `durationFrames ≈ words × 12 + 30` (the linter checks this within ±40%).
- Target ≈ scenes × ~30 words. **~44 scenes × ~30 words ≈ 8.3 min.** For 10 min, ~52 scenes.
- HOOK is still capped at ≤8 s — keep its narration ≤16 words.
- Content scenes (CODE_WINDOW, QUOTE, charts, QUADRANT) can carry 25-35 words and *breathe*;
  dividers (CHAPTER, LOWER_THIRD) stay short (10-20 words).

## 3. Structure as chapters (the spine)
```
HOOK → TITLE_CARD → [origin TIMELINE?] → AGENDA (LIST_BUILD ≤5 items)
[ CHAPTER divider → 5-8 mixed beats → chapter payoff (STAT/RECAP) ] × 5-6
→ global RECAP → OUTRO_CTA
```
- One `CHAPTER` before every section; vary `chapter.color` and the following transition/background so chapter 5 doesn't look like chapter 1.
- 5-6 chapters of 6-8 scenes is the sweet spot for 8-10 min.

## 4. Per-chapter recipe (avoids monotony)
Each chapter should contain, in some order:
- **1 diagram/flow** — `CONCEPT_DIAGRAM` (component relationships) or `STEP_FLOW` (ordered process). Never both adjacent — they share the row-of-panels shape.
- **1 data beat** — `STAT_CALLOUT` / `STAT_PANELS` / a chart. One is plenty per chapter.
- **1 attention anchor or breather** — `CODE_WINDOW` (typing fills long narration best) or `QUOTE_SPOTLIGHT` (a pause that lands).
- **A payoff** — end the chapter on a `STAT_CALLOUT` figure or a compact `RECAP`.

## 5. Rotate FOUR axes every beat
The critic (`npm run critique`) flags two of the same *shape* back-to-back. Vary:
1. **scene type / shape** — never two charts, two flows, or two diagrams adjacent (BAR→DONUT→TIMELINE is three "chart" shapes in a row → a defect; separate with a non-chart).
2. **entrance** — `data.anim` (pop / slide / rise / bounce / spin / blur).
3. **semantic colour** — blue=tech, green=works, red=broken, orange=tension, yellow=speed/cost, purple=AI.
4. **transition** — `scene.transition` (fade / dip / iris / wipe / push).

## 6. Repurpose existing scenes for long-form needs (no new components required)
- **Agenda / "what we'll cover"** → `LIST_BUILD` (≤5 items, icon + text + detail).
- **Key-term / definition card** → `LOWER_THIRD` (`kicker:"KEY TERM"`, title=word, subtitle=gloss ≤34 chars).
- **Origin / history beat** → `TIMELINE` (≤5 milestones) — works as an early context beat or a late "how we got here".
- **Breather** → `QUOTE_SPOTLIGHT` (a principle/quote; ≤120 chars) or a compact `RECAP`.
- **Mid-roll subscribe** (optional, ~60-70% through) → `CHANNEL_CARD` once.

## 7. Capacity ceilings (budgets are LAW — shorten the idea, not the text)
steps ≤5 (title ≤14, sub ≤30) · list/recap items ≤5/≤4 (≤44/≤46) · stats ≤3 · bars 2-4 (label ≤16, display ≤8) · donut 2-6 segs (label ≤16) · milestones ≤5 (date ≤10, title ≤18) · quadrant ≤6 pts (≤16, axis ≤14) · chat ≤4 msgs (≤64) · quote ≤120 · code ≤12 lines · lowerThird subtitle ≤34 · headline ≤48 with exactly one `[accent]`.

## 8. Verify (same gates, longer spec)
`npm run lint` (budgets + the documentary scene-count allowance) → `npm run critique -- <spec>`
(preset adherence + per-scene review + back-to-back checks). Fix every ⚠ before rendering.
Proof a handful of stills across chapters (`remotion still <slug>-wide-dark out.png --frame=N`)
rather than scrubbing 8 minutes.

## TRUTH note for long-form
Long videos need many facts. For evergreen/conceptual topics (how X works), definitional
and stable-historical facts are safe. Anything time-sensitive still needs a fresh source or
`MISSING:`. Mark illustrative figures as `ILLUSTRATIVE` in the source footer.
