# DEMO VIDEO PLAN — v5 · "try it yourself"

The video that markets iAuteur, **made by iAuteur**, for the README embed, LinkedIn and YouTube.

> **RESUME BLOCK.** This file is the source of truth and survives context loss.
> On pickup: (1) `npm run gate` must exit 0, (2) read LOCKED DECISIONS — settled with the owner, do
> **not** re-litigate and do **not** re-ask, (3) find the first unchecked box in PROGRESS, (4) work
> ONE phase, audit it against real artifacts per CLAUDE.md LAW 10, tick the box, commit, continue.
> Never tick a box you have not verified by looking at the actual output.

Topic folder: `topics/iauteur-try-it-yourself/` · 16 beats long, 11 beats shorts.
Predecessors (immutable, still on disk): `iauteur-explains-itself` (v1), `iauteur-what-you-get` (v2),
`iauteur-how-easy` (v3), `iauteur-made-easy` (v4).

---

## THE FOUR RULES, IN THE ORDER THEY WERE PAID FOR

Each one came from a rejection. Each is now enforced somewhere a future session cannot miss it.

### 1. Write for the audience (v1 rejected)
General audience — creators, teachers, marketers, founders. If a person in that audience wouldn't
say a word at dinner, it doesn't belong in the narration. Enforced in the `DIRECTION` block of
`scripts/gen-prompt.mjs`, emitted with every generated prompt (stage1, stage2, single).

### 2. Depict, don't diagram (v2 rejected)
> "you see we have a box flowing from iAuteur to ChatGPT and back, what does it even describe…"

Draw the real screen, not a picture of the relationship between screens. Enforced in
`references/scene_library.md` (LAW OF DEPICTION, opens the file) and the same `DIRECTION` block.

### 3. Depiction is necessary, not sufficient (v3 rejected — this version)
v3 obeyed rules 1 and 2 completely and was still rejected. Four separate defects:

| What the owner saw | The rule | Where it now lives |
|---|---|---|
| Assistants returned four anonymous green bars | **Show the artifact.** If the answer is a file, draw the file | `src/jsonInk.tsx` + `CHAT_TRIO.answerJson`; linter **warns** when a CHAT_TRIO has none |
| The paste-back beat *typed* the answer in | **The gesture must match the words** | `APP_WINDOW` field `mode:'paste'`; linter **errors** if a field is both typed and pasted |
| Preview players showed a bare title on an empty frame | **Cut proof clips from the dense middle, and loop them** | `VIDEO_PLAYER` clip `seconds` + `endBehavior:'loop'`; linter **warns** on a clip with no `seconds` |
| Nine components, no idea which step any of them was | **Never lose the thread** | `scene.stepRail` — a scene-level layer the shell draws over *any* component |

> "the connection is lost, at what step we are… when you are animating and showing our steps in the
> iauteur, the steps must be visible. This brings to a new implementation of multi-components in a
> single screen."

`stepRail` is that implementation. It is deliberately **not** component nesting: the shell mounts it
beside the beat's component (exactly how `ScenePipLayer` works), so it composes with all 157 types
and cannot break any of their layouts.

### 4. A per-item control belongs on every item (v4 rejected — this version)
v4 drew "any scene can have a component built for it" as one workbench hanging off a list.

> "the per component generation based on beats needs a lot of rework — right now you just have that
> under one scene, where it's just not good or easy to understand. It should be like how we see in
> iAuteur: we see individual scenes, and we have individual buttons to create a new component for
> the scenes, where we shall have another component and scene that just says how we get a new
> component generated in detail."

Two rules, both now in the `DIRECTION` block and `scene_library.md`:
- **Draw the control on EVERY item.** A single control beside a list reads as one global action,
  which is the opposite of what the product does. `BEAT_BOARD` draws the console's real beat list —
  every row with its own `＋ component` and `▶ preview`, and one of them pressed.
- **One capability, one beat.** A scene showing both the affordance *and* what it does lands neither.
  `BEAT_BOARD` is the affordance; `COMPONENT_LAB` is the detail — the ask in plain words, the stages,
  the gates it must survive, and the piece landing back in that scene.

Same round, two more:
- **Show the fully automatic path.** *"add a new scene that just describes how easy it is to automate
  it entirely when we have an AI API."* → `AUTO_RUN`: a masked key, one button, and a log that writes
  itself. The log is the proof; an arrow labelled "automated" is not.
- **End on a real address.** *"you must show check out at github with proper github logo and the repo
  link."* → `REPO_CTA`: the GitHub mark, `san-gitlogin/iauteur`, and the URL set large enough to read
  off the frame. Every fact on the card is verifiable — the linter warns on anything that looks like
  an invented star/fork/download count (LAW 3).

### 5. Two content rules, from v3
- **Open on the pain, not the product.** *"you can show the tiring production process… tired of
  creating tutorial videos for an organization, making youtube videos, animating them."* → the new
  `PRODUCTION_GRIND` component draws the evening someone loses to an editing timeline. It is beat 2,
  before iAuteur appears at all.
- **Say it's powered by Remotion.** Beat 11, out loud, in the narration.

---

## LOCKED DECISIONS — do not re-ask

- **Design**: moderndark + daylight light twin. Background `aurora` (v3 used the default — LAW 2
  wants consecutive moderndark videos differentiated by background + scene mix).
- **Voice**: `en-US-AvaMultilingualNeural`. Non-negotiable; Christopher "sounds like an AI".
- **Watermark**: `img:iauteur_logo.png` — the iAuteur mark, not the channel mark, because the video
  is about the product.
- **Length**: 3–4 minutes is explicitly fine. Granularity earns it.
- **Vocabulary**: the vertical cut is **shorts content / shorts / reels** — never "a video for
  phones". "Phone" is fine when it genuinely means the device; the *output* is never named after
  hardware.
- **Jargon**: none in the narration — no "JSON", "spec", "lint", "component", "render", ".tsx".
  **The JSON is SHOWN, never named.** The narration calls it "a file" and "the answer". Showing the
  artifact (rule 3) and not speaking jargon (rule 1) are not in conflict: the eye reads the file,
  the ear hears plain English.
- **Both aspects ship.** Wide for YouTube/README, tall for shorts and reels.

---

## THE 16 BEATS

Rail = the `stepRail` state carried on that beat. Beats without one sit outside the product — and
`AUTO_RUN` deliberately has none, because it is the beat that skips the whole rail.

| # | Type | Rail | What it shows |
|---|---|---|---|
| s01 | HOOK | — | a whole week, for one three-minute video |
| s02 | PRODUCTION_GRIND | — | the old way: 5 chores, a crowded timeline, 21 hours |
| s03 | APP_WINDOW | 1 Topic · *saying what it's about* | one line, who it's for, the look |
| s04 | PROMPT_HANDOUT | 3 Script · *it writes the brief for you* | the brief it wrote, Copy pressed |
| s05 | CHAT_TRIO | 3 Script · *pasted into your assistant* | **the JSON coming back**, in three windows |
| s06 | APP_WINDOW | 3 Script · *pasting the answer back in* | **the JSON pasted**, Ctrl+V, 12 scenes in |
| s07 | CHECK_SWEEP | 3 Script · *reading it back for you* | it catches a crowded line and rewrites it |
| s08 | VIDEO_PLAYER | 3 Script · *previewing one scene* | one scene, previewed, really playing |
| s09 | **BEAT_BOARD** | 3 Script · *one button per scene* | **every row with its own ＋ component**, one pressed |
| s10 | **COMPONENT_LAB** | 3 Script · *building the piece it needs* | **the ask, the stages, the gates, it lands in s05** |
| s11 | APP_WINDOW | 4 Voice · *picking a voice* | Ava, listen, timed to the words |
| s12 | ASPECT_TWIN | 5 Render · *rendered with Remotion* | one description → four videos |
| s13 | **AUTO_RUN** | — | **a masked key, one button, a log that writes itself** |
| s14 | VIDEO_PLAYER | — | three finished videos, really playing |
| s15 | **REPO_CTA** | — | **the GitHub mark, san-gitlogin/iauteur, the URL** |
| s16 | OUTRO_CTA | — | including this one · sub carries the URL again |

Palette: 14 distinct types across 16 beats (need ≥8). APP_WINDOW ×3 (cap 6), VIDEO_PLAYER ×2, no two
of a family adjacent. 7 distinct transition kinds (need ≥5).

**Accepted warnings** (deliberate, not defects):
- *16 scenes vs deep-dive's ≤12* — every beat is a real step; dropping one breaks the walkthrough.
- *s02 17.3s "feels static"* — the rule assumes a still frame. The grind's playhead crawls the entire
  beat and five bars land on five different words. It is the busiest frame in the video.
- *shorts: 11 scenes vs explainer's ≤10* — same reason; the vertical cut carries the same story.

---

## PROGRESS

- [x] **A · Clips.** Re-cut all three proof clips from the dense middle of a scene (market @141s,
      product @47s, tech @178s), 10–14s, watermark cropped out entirely. `VIDEO_PLAYER` loops them.
      *Audit: contact sheets of the source renders, then the rendered players — all three show
      fully-drawn, moving content.*
- [x] **B · CHAT_TRIO returns JSON.** `answerJson` + `answerFile`, streamed line by line with a
      caret, coloured by `src/jsonInk.tsx`. Falls back to ruled lines when absent (back-compat).
      *Audit: proof stills, both aspects, material + neobrutalism.*
- [x] **C · APP_WINDOW pastes.** `mode:'paste'` (lands whole, Ctrl+V chip, border flash) and
      multi-line JSON `lines`. The button waits for the paste before confirming. *Audit: same stills.*
- [x] **D · Step rail.** `scene.stepRail` + `src/StepRail.tsx`, mounted by the shell. **Also fixed a
      latent bug it exposed**: `sync.mjs` only retargeted `scene.data`, so any scene-level anchor
      (`stepRail`, and `pip` before it) survived TTS as a raw word index. It now walks the whole
      scene. *Audit: proof stills + the synced spec shows fractional rail anchors.*
- [x] **E · PRODUCTION_GRIND.** New component, wired through `component-flow assemble`. Needed a
      numeric slot on the generic item template (`value`), which the lab now provides for everyone.
      *Audit: MIN + MAX fixtures × both aspects × 2 designs; gate green at 157 types.*
- [x] **F · Author + voice.** Both specs lint clean; TTS with Ava; synced.
- [x] **G · Render, verify, ship.** `wide-dark.mp4` 2:51 (41.8 MB, video+audio confirmed),
      `short-dark.mp4` 0:57 (12.1 MB), `thumb.png`, `cover.png`, `upload.md` (13 authored chapters).
      *Audit: a frame pulled at ~78% of every beat FROM THE FINISHED MP4 — all 13 wide and all 8
      vertical verified by eye. Web copy at `docs/media/iauteur-made-easy.mp4` (4.0 MB) + poster,
      embedded at the top of README; v3's web copy deleted. Gate 10/10, tsc clean, both specs pass.
      Commit `b491947`, pushed to main.*

### v5 phases

- [x] **H · BEAT_BOARD.** The console's real beat list: every row with `＋ component` and `▶ preview`,
      one pressed, that row flipping to `★ SPEND_DIAL` / `↺ recreate`. *Audit: MIN + MAX × both
      aspects × material + neobrutalism. Fixed a Fit-vs-Budget miss — real type names
      ("s04 · DONUT_BREAKDOWN", 21 glyphs) ellipsised at a 210px column; sized from a 22-glyph budget.*
- [x] **I · COMPONENT_LAB.** The creator drawer: which scene it is for, the ask typing itself in,
      three stages completing on their own words with progress bars, the gate chips going green, and
      the piece landing in scene 5. *Audit: same matrix, MIN (2 stages, no gates) included.*
- [x] **J · AUTO_RUN.** Masked key (LAW 11 — the linter rejects anything key-shaped in `keyMask`),
      the model, the ticked options, one button, and a six-line log that writes itself. *Audit: same
      matrix.*
- [x] **K · REPO_CTA.** The GitHub mark via `si:github`, `san-gitlogin/iauteur`, the description,
      three verifiable facts and the URL at 34px. *Audit: same matrix, MIN (no facts, no description)
      included. Linter warns on any fact that reads as a popularity count (LAW 3) and rejects a URL
      that is not a bare host/path.*
- [x] **L · Author + voice.** 16 beats long, 11 shorts; both lint clean after sync (2 and 1 accepted
      warnings). TTS with Ava.
- [x] **M · Render, verify, ship.** `wide-dark.mp4` 3:24 (49.8 MB, video+audio confirmed),
      `short-dark.mp4` 1:18 (16.5 MB), `thumb.png`, `cover.png`, `upload.md` (16 authored chapters).
      *Audit: a frame pulled at ~80% of every beat FROM THE FINISHED MP4 — all 16 wide and all 11
      vertical verified by eye. Chased one suspected dim frame in the closing tech clip; it was the
      contact-sheet downscale, not the render (checked at full resolution across the beat). Web copy
      at `docs/media/iauteur-try-it-yourself.mp4` (4.9 MB) + poster, embedded at the top of README;
      v4's web copy deleted. Gate 11/11, tsc clean, both specs pass.*

---

## PAID-FOR LESSONS

1. **`tsc` and the gate have never caught a single visual defect.** Every one was found by rendering
   a still and looking at it. Both are necessary; neither is sufficient.
2. **Proof before the voiceover pass is not proof.** Anchors move when real audio arrives.
3. **The narrow aspect is where layouts break.** Three stacked players overran the vertical frame and
   clipped the last label — invisible in wide, obvious in tall.
4. **A component that fails the gate rolls back atomically.** Read the tsc error; it is usually
   telling you the data contract is wrong, not the code.
5. **A rejection that names four defects is usually naming one cause.** Here it was: the viewer could
   not tell what they were looking at. Artifact, gesture, motion and place are four ways of fixing
   that, and all four were needed.

---

## OPEN — needs the owner, do not action unilaterally

**Channel references before the repo goes public.** `references/channel_profile.md`, `CLAUDE.md`,
`public/assets/channel_logo.png`, `scripts/gen-upload-kit.mjs` and `briefs/` name YOUR CHANNEL in
plain text. `topics/*` is gitignored, so no video content is exposed. The owner will make the repo
public and post the video on LinkedIn as their work, but said *"ill never mention ill use it for my
youtube channel"* — so this needs their decision before visibility is flipped.
