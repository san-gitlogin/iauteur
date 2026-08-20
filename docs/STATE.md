# PROJECT STATE — read this after CLAUDE.md

Portable, tool-agnostic orientation for any assistant or human picking this repo up on any
machine (Claude Code, Copilot, Cursor, a fresh clone). `CLAUDE.md` holds the **laws**; this file
holds **current state, hard-won gotchas, and how to prove the repo is healthy.**

Keep it current. When you finish a unit of work, update "Recent work" and "Open threads" here in
the same commit — that is what makes the next session on a different machine cheap.

---

## Prove it's healthy before changing anything

```bash
npm run gate                      # 10 seals; must exit 0
npm run typecheck                 # tsc --noEmit
python scripts/test-webui-http.py # 12 Flask endpoint checks
python scripts/docs_shots.py      # regenerates docs/img/*.png from the live console
```

On Windows, prefix Python with `PYTHONIOENCODING=utf-8` or the seals crash on `→` in cp1252.

## Where things live

| Path | What |
|---|---|
| `topics/<slug>/long.json` + `shorts.json` | one folder per video. **Gitignored** — local content, not repo code |
| `src/scenes/` | the 195 scene components |
| `src/designs/<pack>/` | 30 design packs (layout/motion overrides) |
| `src/themes.ts` | 42 themes (38 dark + 4 light) |
| `scripts/lib/manifest.mjs` | **the single source of truth** for every component's data contract + a valid `example` |
| `scripts/component-flow.mjs` | Component Lab orchestrator: `stage1/validate/stage2/assemble/remove/preview/example/shapes` |
| `scripts/flow.mjs` | spec authoring flow: `stage1/single/validate/stage2/assemble/applyfix/budgets` |
| `scripts/ai/provider.py` | AI adapter — 9 providers, stdlib only (`litellm` optional) |
| `webui/app.py` + `static/app.js` | the Flask console (the 5-step pipeline) |
| `.claude/skills/tech-video-director/` | the creative law: scene library, budgets, casting board |
| `.claude/skills/iauteur-studio/` | console parity from the CLI, + `component_authoring.md` |

Counts are load-bearing and drift. Verify, never quote from memory:

```bash
node --input-type=module -e "import {MANIFEST_TYPES} from './scripts/lib/manifest.mjs'; console.log(MANIFEST_TYPES.length)"
```

## Recent work

### 2026-08-18 — `linux-commands-masterclass` shipped (87 min), and the rebuild that got it there
The first cut (38 min) was rejected on three counts; all three turned out to be measurable defects
rather than taste, and the fixes are now laws (0i, 0j, 0f-9, 12).

- **Sync.** Components ignored per-element anchors and ran on fixed intervals; the spec builder
  also consumed markers in a fixed order, so the terminal finished typing at a **median 11% of the
  narration in 110 of 110 scenes**. Markers are now TYPED (`|` step, `^` picture, `@` perms,
  `~` verdict) and interleave; `src/CommandStage.tsx` and `src/linuxViz.tsx` contain no fixed
  interval. Proven with two stills from the synced spec.
- **Depiction.** 110 components were routing through 6 generic archetypes → **`src/linuxViz.tsx`,
  56 distinct depictions** + a per-beat caption on every scene.
- **Script.** 5,657 → 16,161 words; 81 of 110 commands now expand their name; every beat ends on
  an anchor-free landing line.
- **Two linter rules were numerically inconsistent** and the conflict was invisible until a beat
  tried to satisfy both: the scene ceiling granted a flat 4s head/tail while PAYOFF TIMING reserves
  the final 15% of the narration for an anchor-free landing. On a 55s beat that is 8s. The ceiling
  is now `180 × anchors + 120` (5s per depicted beat + a proportional tail), hard stop 70s. **When
  a guard keeps rejecting well-formed work, check it against the OTHER guards before rewriting the
  work.**
- **Render:** 8 segments + `scripts/build-audio-track.mjs` + stream-copy mux (see LAW 12).
  156,521 frames, 0ms audio drift, 967 MB.
- Residual: one lint warning (global pronoun density 5.1% vs 4.5%). Reverted rather than shipped a
  false claim — see LAW 0f rule 9.

New/changed tooling: `scripts/build-audio-track.mjs` (new), `scripts/build-linux-spec.mjs` (typed
markers), `scripts/gen-upload-kit.mjs` (HH:MM:SS chapters, `seo.tags`), `scripts/lint-spec.mjs`
(ceiling), `src/linuxViz.tsx` (new), `src/CommandStage.tsx` (padding + pacing fixes).

### 2026-08-16 — a 19-episode course shipped, and five laws came out of it

Produced a full tutorial course end to end (spec → voice → sync → render → upload kit, ×19, plus
19 shorts). The engine changes are in `CHANGELOG.md`; what matters for the next session is **why**
they exist, because each was a measured failure first:

| Law | The measurement that produced it |
|---|---|
| **0e** teach, don't narrate | 24 code beats across 7 episodes, *not one* explained a line; a 12-line block at 1.0s/line |
| **0f** write for a mouth | **0 contractions in 900+ words, every episode**; "And" opening 11–15 sentences per script |
| **0g** the opening is a contract | 19 episodes opened with no greeting AND no echo of the title/thumbnail the viewer clicked |
| **0h** the background must not move | a pulsing ring shipped behind 4 episodes to satisfy a "vary the look per act" plan |
| **0e r.6a** runtime floor | episodes slid 5:20 avg → 3:16 because the scene COUNT was held flat |

**The transferable lesson: a rule written only in prose gets forgotten by the next session.** Every
one of the above has a guard in `lint-spec.mjs` now, and that is why they will hold. When you learn
something the hard way here, the work is not done until it is machine-checked.

**Library 162 → 195 scene types.** 33 built for this course, all gated + proofed MIN/MAX/MIX ×
both aspects × two design packs. The build-vs-reuse test that produced them is **semantic**: ask
what a component ASSERTS about the world, not what it looks like. Two near-misses worth knowing —
`FRAME_BOUNDARY` (blocked until an explicit crossing call) must not stand in for shadow DOM (needs
no such call), and `TRACE_SCRUB` (a recording of a finished run) must not stand in for
`page.pause()` (a live run you can still touch). Both would have taught the opposite of the truth.

**`gen-upload-kit.mjs` now also emits `out/upload-shorts.md`** — shorts were rendering with no
publishing metadata at all, because the generator only ever read `long.json`.



### 2026-07-26 · contributor-facing docs (public repo, part 2)
The repo is public, so a stranger now has to be able to get in. Added:

- **`CONTRIBUTING.md`** — the mental model ("the JSON is the movie"), setup, the health check that
  separates your breakage from pre-existing breakage, a difficulty-labelled list of ways to help, the
  **eight rules that decide whether a PR merges** (each traced to a real defect), both routes for adding
  a component, the definition of done (MIN/MAX/MIX × both aspects × material + neobrutalism), and how
  to file a visual bug so it's reproducible.
- **`SECURITY.md`** — private advisory reporting, and the three risks that actually exist here (a
  leaked provider key, prompt injection via pasted source material, and the fact that rendering runs
  a browser so a stranger's spec is untrusted input).
- **`.github/`** — PR template carrying the gate checklist, and three issue forms: *a scene looks
  wrong* (forces still + type + design pack + aspect, without which a visual bug is unreproducible),
  *propose a component*, *something didn't work*.
- README: MIT + PRs-welcome badges, a Contributing section, TOC entry.
- **`HANDOFF.md` now carries a STALE banner** pointing here. It was misinforming readers with a
  136-component count and `/memories/repo/*` paths that never existed off one machine.

**A real doc bug surfaced while writing this, now fixed:** `component_authoring.md` described the
wiring as "SIX files" and told you to add `TYPES` in `lint-spec.mjs`. `TYPES` actually lives in
`scripts/lib/constants.mjs` (lint-spec imports it), and `scripts/lib/manifest.mjs` is a required
touchpoint the list omitted entirely — so **the canonical by-hand recipe was wrong and would have
failed the gate.** It is now an accurate eight-touchpoint checklist in both that file and
CONTRIBUTING.md, with the correction noted inline so nobody "restores" the old six. Verified against
`component-flow.mjs`'s own `targets` map, which wires exactly those seven files plus the component.

### 2026-07-26 · OPEN-SOURCED — MIT licence + channel identity removed (commit `e746553`)
The repo is prepared to go public. Two decisions by the owner drove it: licence **MIT**, and the
channel identity **stripped rather than published**.

- **`LICENSE`** (MIT) at the root. It says explicitly that it cannot relicense **Remotion** — free for
  individuals and small teams, paid above a size threshold (<https://remotion.dev/license>) — so that
  obligation sits with whoever clones this, not with the project. `package.json` gained
  `license`/`repository`/`homepage`/`bugs`/`keywords` and **keeps `private: true`** so nobody publishes
  it to npm by accident. README has a Licence section.
- **Channel identity gone.** `logo/` deleted (11 brand marks). `public/assets/channel_logo.png` is now
  iAuteur's own clapperboard mark, so the `brand.logo` slot still resolves and no spec or script changed
  behaviour — **drop your own square PNG in at that path to rebrand every video at once.** The channel
  name became `YOUR CHANNEL` across 32 files, along with the example `@handle`, the newsprint pack's
  masthead default, the terminal-cli pack's prompt hostname, and the asset-fetch User-Agent.
  `channel_profile.md` now ships as an unfilled, self-explaining template.
- **History rewritten**, because the name was in 19 commits' content and 3 commit messages — dropping the
  `logo/` paths alone would have left it greppable. `git filter-repo --invert-paths --path logo/
  --replace-text --replace-message` over all 81 commits: 4.5s, history structure and all 81 commits
  preserved, `.git` 55MB → 39MB, force-pushed to `main`. Pre-rewrite backup bundle was taken first.

**Deliberately NOT scrubbed** (both verified as safe, don't "fix" them):
`public/assets/SOURCES.json` still records `picsum.photos/seed/nbx-*` — it is a provenance record of URLs
actually fetched, and rewriting it would make the record untrue; a picsum seed carries no brand signal.
`package-lock.json` has one match inside a base64 integrity hash — coincidence, not a name.

**Gotcha worth keeping:** grep could not have caught the real risk here. The tracked demo video is a
rendered artifact, so a channel logo baked into its frames would have shipped invisibly. It was clean only
because that spec used `img:iauteur_logo.png`, and `brand.channel` renders through **`CHANNEL_CARD` only**
— which neither cut uses. **Check rendered media, not just source, before publishing.**

**Verified:** tsc clean · `npm run gate` 10/10, exit 0, 162 types · shipped topic lints (17 scenes /
4 known warnings) · every touched `.py`/`.js`/`.mjs`/`.json` parses · 648 tracked files.

### 2026-07-25 · per-beat preview (commit `2fe5bcc`)
Preview is offered on **every** beat and every assembled scene, not only ones carrying `data`.
Click → one inline question (silent / with voiceover / cancel, remembered per session) → streamed
progress under that beat → player with a caption stating whether you're seeing **your content** or
the component's **sample content**.

Five real bugs fixed in the process — all worth knowing because they bite again:

1. `/api/component/preview-stream` **never yielded its `done` SSE event**, so the Component Lab's
   "Render preview" reported failure on every *successful* render. It had never worked.
2. That same drawer passed the **unwrapped** example as `sceneData`. Components read
   `scene.data.<dataKey>`, so it drew an empty scene. Only visible once (1) was fixed — caught by
   extracting an mp4 frame, not by a green test.
3. The voiced preview spoke `en-US-AnaNeural` because `renderVoiceOptions()` left the
   alphabetically-first voice selected. A wrong default here is *heard*, not just displayed.
4. **"Has data" ≠ "can draw."** Beat sheets often carry a stub like `{"source":"illustrative"}` —
   non-empty, but with none of the fields the component reads. Drawability is now judged against
   the manifest field contract (`component-flow.mjs example`), mirrored client-side off
   `CONFIG.sceneShapes` (`component-flow.mjs shapes`).
5. ANSI bundler noise (Remotion font warnings) rendered into the progress label where a percentage
   belongs, reading like a failure.

**Invariant worth protecting:** sample data is *never* written onto a beat. Persisting it would let
placeholder numbers ride into Stage 2 and the saved spec disguised as authored facts (CLAUDE.md LAW 3).

Preview length uses normalize-spec's own formula — `max(60, words*FPW+30)`, HOOK capped at
`HOOK_MAX_FRAMES` — so a preview runs what the real render runs. A flat guess truncates the scene's
build-in and reads as broken. `flow.mjs budgets` exposes `fps`/`fpw`/`hookMaxFrames` for this.

### 2026-07-25 · docs (commit `e064e2d`)
README now leads with the **automatic** AI path; manual copy-paste is the no-API-key fallback. It
previously claimed "this repo contains no model calls" and "no built-in automation that calls a
local model" — both false since the AI pipeline landed, and they buried the best feature.
Screenshots are generated by `scripts/docs_shots.py` (Playwright drives the real console) so they
can be regenerated instead of rotting.

## Gotchas that cost real time

- **DEPICT, DON'T DIAGRAM — the rule that cost two re-shoots of the demo.** v1 was written for people
  who already knew the jargon; v2 fixed the words but drew a step of the flow as two labelled boxes
  with arrows between them, and the owner's reaction was "what does it even describe?" A viewer
  decodes a picture of a screen instantly and an abstract graph slowly, if at all. Prefer the
  component that draws the REAL screen/object/document; never demo an output with a component built
  for something else (a video needs a player). This is now enforced in the prompt itself — the
  `DIRECTION` block in `gen-prompt.mjs`, emitted in stage1, stage2 AND single-paste — and written up
  as the LAW OF DEPICTION at the top of the director skill's `scene_library.md`. Audience vocabulary
  too: **shorts / reels / devices**, never "phone".

- **DEPICTION IS NOT ENOUGH — the four defects that cost a third re-shoot (v3, 2026-07-26).** v3
  obeyed DEPICT-DON'T-DIAGRAM completely and was still rejected, because a real screen can still fail
  to say what the viewer is looking at:
  1. **Show the artifact.** The assistants handed back anonymous ruled bars. If a step produces a
     file, draw the file — `CHAT_TRIO.answerJson` + `src/jsonInk.tsx` (the one shared JSON ink).
  2. **The gesture must match the words.** The paste beat animated the answer *typing itself in*.
     `APP_WINDOW` fields take `mode:'paste'`; the linter errors if a field is typed AND pasted.
  3. **Proof clips must be cut from the dense MIDDLE of a scene and looped.** Every clip was cut from
     a scene's first seconds, so the player showed a bare title on an empty frame. `VIDEO_PLAYER`
     clips now carry `seconds` and loop; the linter warns when one doesn't.
  4. **Never lose the thread.** Nine components, no way to tell which step of the product any of them
     belonged to. `scene.stepRail` is a scene-level layer the shell draws over ANY component — the
     sanctioned way to get two components onto one screen. Never nest one component inside another.

- **A PER-ITEM CONTROL MUST BE DRAWN ON EVERY ITEM (v4 rejected, 2026-07-26).** "Any scene can have a
  component built for it" was drawn as one workbench hanging off a list. Owner: *"it should be like
  how we see in iAuteur — we see individual scenes, and we have individual buttons."* A single control
  beside a list reads as ONE GLOBAL ACTION. Draw the list the way the product draws it, control
  repeated on every row, one of them pressed — `BEAT_BOARD`. And **one capability, one beat**: the
  affordance and the detail are two screens in the product, so they are two beats
  (`BEAT_BOARD` → `COMPONENT_LAB`). A scene trying to be both lands neither.

- **Scene-level anchors were invisible to `sync.mjs` until 2026-07-26.** It retargeted `scene.data`
  only, so `stepRail.atWord` (and `pip.atWord`, latent since PiP shipped) survived TTS as a raw word
  index while every other anchor became an exact frame. It now walks the whole scene. If you add
  another scene-level layer, its anchors are already covered — but check `sceneAnchorRoot()` in
  `lint-spec.mjs` too.

- **Trust the artifact, not the exit code.** A green test proved the drawer preview "worked" while
  it was rendering an empty donut. Extract a frame (`ffmpeg -vf "select=eq(n\,140)"`) and *look*.
- **The console hard-disables every job button while one job runs** (`setBusy` + `JOB_BTN_SEL`,
  which includes `.beatbtns button`). When driving the UI in a test, wait on `!S.busy`, not on a
  video selector — a selector matches an *older* player and returns instantly.
- **Steps 4 and 5 refuse to open until a spec is saved** (`setStep` guard). A screenshot harness
  must set `S.saved = true` first.
- `component-flow.mjs` **always exits 0** and reports failure via `{ok:false}` in stdout. Parse
  stdout; never trust the exit code.
- Remotion renders fetch Google Fonts per render. On a bad connection later scenes throw
  `[NetworkError]`. Kill leaked processes (`Get-Process node | Stop-Process -Force`) and retry.

### 2026-07-26 · demo video v6 — SHIPPED (v1–v5 superseded)

**`topics/iauteur-introducing/`** — 17 scenes wide (3:38) + 13 vertical (1:33), moderndark on
`aurora`, Ava. This is what the README embeds.

**v5 was rejected on two things: it never introduced the product, and the script was full of
unnamed "it"s.** *"Before the step 1 we need to have an intro to our app."* and *"I see so many
places you are describing 'it'. What is it bro. You should be specific."*

**One new component, count 161 → 162 — with a build-then-scrap in between.** First attempt was
`PRODUCT_INTRO`, a full pivot beat (kicker, mark, name, promise line, feature chips) — rejected on
sight for being too heavy and removed cleanly via `component-flow.mjs remove` (verified: grep for
residue, tsc clean). Replaced with `INTRO_CARD`: kicker, the name at 150px, a rule sweeping out from
centre, nothing else, 3–5 seconds. Linter warns if a spec sets `data.headline` on it (the name IS
the headline) or lets it run past ~6.7s (it holds one line; longer than that it stops landing and
starts pausing).

**Every line of narration was rewritten to name its subject.** No bare "it" for iAuteur, an
assistant, a file, a component, or a key anywhere in either spec — verified with a regex scan
(`it (writes|reads|renders|builds|checks|works|fits|drops|wires|plays|hands|rewrites)`) across every
scene of both specs, zero matches. This is a narration-craft rule with no automated gate (a bare
"it" is sometimes correct grammar) — re-read the full script aloud before voicing.

### 2026-07-26 · demo video v5 (superseded)

**`topics/iauteur-try-it-yourself/`** — 16 scenes wide + 11 vertical, moderndark on `aurora`, Ava.
Superseded by v6; its web copy has been removed from `docs/media/`.

**v4 was rejected on the component-generation beat and the ending.** It compressed "every scene has
its own build button" and "here is what that button does" into a single scene with one workbench
beside a list, and it never told anyone where to get the thing.

**Four new components, count 157 → 161:**
- `BEAT_BOARD` — the console's real beat list: `s04 · DONUT` + narration + `12/20w` + **its own**
  `＋ component` and `▶ preview` on every row; one is pressed and that row becomes `★ SPEND_DIAL`.
- `COMPONENT_LAB` — the creator drawer in detail: the ask typed in plain words, stages completing on
  their own anchors, the gate chips (checked / wired in / type-checked / undone if wrong), and the
  piece landing in the scene it was built for.
- `AUTO_RUN` — the hands-off path: a **masked** key (LAW 11; the linter rejects anything key-shaped
  in `keyMask`), one button, and a log that writes itself. The log is the proof.
- `REPO_CTA` — the closing address: `si:github`, `san-gitlogin/iauteur`, verifiable facts only, and
  the URL at 34px. The linter warns on any fact that reads as a popularity count (LAW 3) and rejects
  a URL that is not a bare host/path.

`SCENE_FORGE` stays in the library but is retired from the demo — `BEAT_BOARD` + `COMPONENT_LAB`
replace it.

### 2026-07-26 · demo video v4 (superseded)

**`topics/iauteur-made-easy/`** — 13 scenes wide + 8 vertical, moderndark on an `aurora` background,
Ava. Superseded by v5; its web copy has been removed from `docs/media/`.

**v3 was rejected on four specific defects, all of them "I can't tell what I'm looking at":** the
assistants' reply was anonymous bars instead of the JSON it really is; the paste-back beat *typed*
the answer; the preview players showed a bare title over an empty frame; and across nine components
there was no way to tell which step of the product any beat belonged to. All four are written up
under Gotchas and are now enforced by the linter, the manifest and the shell.

**One new component + one new scene-level layer.** `PRODUCTION_GRIND` (the evening lost to an editing
timeline — the video now opens on the pain, before iAuteur appears) takes the count 156 → **157**.
`scene.stepRail` (`src/StepRail.tsx`) is not a scene type: it is drawn by the shell over whatever the
beat cast, so all 157 types compose with it for free. The video also credits **Remotion** out loud.

**The component lab gained a numeric item slot.** `buildInterface` emitted an all-strings
`<Name>Item`, so PRODUCTION_GRIND could not be assembled at all (its chores carry hours). Items now
get `value?: number`.

### 2026-07-26 · demo video v3 (superseded)

**`topics/iauteur-how-easy/`** — 2:38 wide (12 scenes) + vertical (10 scenes), moderndark, Ava.
Superseded by v4; its web copy has been removed from `docs/media/`.

**v2 was rejected on VISUAL LANGUAGE.** The narration was fine; a step of the flow was drawn as two
labelled boxes with arrows between them and the owner's reaction was *"what does it even describe?"*
v3 is one REAL SCREEN per beat: the console with a title typing in, the Copy button clicking, three
assistant windows taking the paste, the answer pasted back, the review rewriting a line, a scene
previewed in a player, a component forged for one row, the voice picked, then the outputs.

**Five components built for it** — `APP_WINDOW`, `PROMPT_HANDOUT`, `CHAT_TRIO`, `VIDEO_PLAYER`,
`SCENE_FORGE`. Count 151 → **156**. `PROMPT_HANDOFF` (the v2 box diagram) stays in the library but
is retired from the demo.

**The rule is now in the product, not just this video** — see DEPICT-DON'T-DIAGRAM under Gotchas.

### 2026-07-25 · demo video v2 (superseded)

**`topics/iauteur-what-you-get/`** — 98s wide (12 scenes) + 44s vertical (8 scenes), moderndark,
`en-US-AvaMultilingualNeural`. Superseded. v1 (`iauteur-explains-itself`, 67s) still exists on disk
but is superseded too.

**v1 was rejected on DIRECTION, not craft.** It explained how the tool works to someone who already
knows what a linter is, with `tsc clean` and `long.json` on screen. v2 is a product ad about what you
GET, for anyone who needs videos — zero jargon, real proof clips, the code-driven part demoted to a
payoff. The full brief and the banned-word list live in [`docs/DEMO_VIDEO_PLAN.md`](DEMO_VIDEO_PLAN.md).

**Three components were built for it**, depicting the real console flow: `TOPIC_INTAKE` (a title
typing into a field), `PROMPT_HANDOFF` (the round trip to whichever assistant you already use) and
`CHECK_SWEEP` (checks sweeping the answer, one catching a problem and repairing it). Count 148 → **151**.

**Project-wide default voice is now `en-US-AvaMultilingualNeural`** — Christopher "sounds like an AI".

Proof clips: `public/assets/video/sample_{market,product,tech}.mp4`, cut from this project's own
renders and cropped to remove the channel watermark. Covering it with the iAuteur logo was the first
attempt and produced TWO logos at full bleed; cropping to 1780×1001 (still 16:9) removes it entirely.

### 2026-07-25 · demo video v1
"iAuteur explaining itself" is written, voiced, rendered and embedded at the top of the README.
`topics/iauteur-explains-itself/out/` holds `wide-dark.mp4` (67.5s, 10 scenes), `short-dark.mp4`
(42.5s, 7 scenes), `thumb.png` and `cover.png`; a 1.5 MB web copy + poster live in `docs/media/`
(tracked — `topics/` is not). All 8 middle components were built for it: `SPEC_TO_FRAME`,
`CAST_BOARD`, `LAB_ASSEMBLY`, `BUDGET_METER_ROW`, `WORD_ANCHOR_RAIL`, `RESKIN_CAROUSEL`,
`ASPECT_TWIN`, `PIPELINE_GATE`. Component count 140 → **148**. Casting reasons, including why each
near-miss existing component was rejected, are in `topics/iauteur-explains-itself/casting.md`
(untracked with `topics/`). Full recipe: [`docs/DEMO_VIDEO_PLAN.md`](DEMO_VIDEO_PLAN.md).

**Authoring it through the real console surfaced four bugs no gate could see** (commit `c02dbee`):

1. `assembleSpec` never wrote `brand.logo`, so **every** console-authored spec rendered with no
   watermark, no thumbnail stamp and no OUTRO circle — 29 shipped specs across 16 topics. Nothing
   required the field. Now defaulted + `cfg.logo` override + linter warning + a console picker.
2. Stage 1 collects `onePayoff/openLoop/analogy/topicAxes`; Stage 2 never passed them on, so all
   four were dropped on every two-paste video. `flow.mjs assemble` now takes the beat sheet as an
   optional extra payload (identified by shape, not argument position).
3. `SPEC_TO_FRAME.specLines` documented preserved indentation but lacked `preserveWs`, so normalize
   flattened the JSON before the component saw it. `check-manifest.mjs` now fails any field whose
   note promises significant whitespace without the flag.
4. **`sync.mjs` rescales every `atWord` to a FRACTIONAL value** (3 → 2.917) to re-time onto the real
   audio. `WORD_ANCHOR_RAIL` used `atWord` as both a time *and* an integer position key, so every
   mark silently vanished from TTS-synced renders. If a component uses `atWord` as an index, round
   for position and keep the raw value for timing. It was the only one that did — check any new one.

Two things `component-flow.mjs assemble` does **not** do, which cost time every single build:

1. **It never writes text budgets to `lint-spec.mjs`** — only `DYNAMIC`. Without a hand-written
   validation block an overfull scene renders. Add one per component, sized to the NARROW
   (vertical) container.
2. **Its generated `<Name>Item` interface is fixed** (`label/text/title/sub/detail/color/asset/atWord`).
   Anything else per item — a boolean flag, a number — must move to a top-level field
   (`chosenIndex`, `used[]`), which is usually better data design anyway since the linter can then
   enforce it.

The recurring defect across all five: **the Fit guard truncating what the Budget guard allows.**
Every component so far shipped with a cell narrower than its own budget until the MAX fixture was
rendered and *looked at*. Size cells from the budget arithmetic, not by eye. And editing
`manifest.mjs` by hand desyncs `specs/video.schema.json` — regenerate (`npm run schema && npm run
types`) or the gate goes red.

## 2026-08-19 — DSA Dojo: the visual-correctness rebuild

The 12-episode DSA Pattern Dojo series shipped once and the owner rejected the visuals on sight:
*"few animations are lacking visual correctness and are complicated to understand ... when You show
a tree, there must be lines visible right ... you are showing numbers at the very bottom very
small ... I liked the first episode, then after that you are just in a hurry."* Every complaint was
verifiable from a single still. See **LAW 0k** in CLAUDE.md.

What was actually wrong, and why it survived to a render:

- **The array family was rebuilt; nothing else was.** Two-pointers and sliding window use `CellRow`
  and look right, which is exactly why episode 1 passed. Trees, graphs, DP tables and cost bars went
  through generic primitives that were never designed to draw those shapes.
- `TreeDFS` drew an indented list with a 14px elbow glyph. No parent→child edges at all.
- `GridBFS` drew a complete bipartite graph between distance levels — not the graph being traced.
  It matched by luck on the authored five-node example.
- Every edge was `strokeWidth={0.5}` + `non-scaling-stroke` in `panelBorder` grey: invisible.
- BFS distances — the whole output of the pattern — sat in a row of tiny pills along the bottom
  edge instead of on the nodes.
- `CellRow` (46px/19px), `DpTable` (42px/18px) and the cost bars were fixed-size, so a six-cell DP
  table was a thin ribbon in a panel two-thirds empty.
- `CodePane`'s fixed font silently clipped line 1 and line 18 of an 18-line listing.
- The problem-intro cards in EP11 showed signal words lifted from a question that was never on
  screen; the narration says *"circle the words"* over nothing to circle.

Fixes: `VizCell` gained `parent` / `links`; `layoutTree` recovers parentage from an authored depth
outline so existing briefs draw real trees unchanged; nodes size to their labels and the viewBox
sizes to content plus label width; strokes moved to user units and accent colour; distances render
as badges on the node; `CellRow` / `DpTable` / cost bars / `CodePane` all derive size from item
count. `DSA_SIGNALS` gained `problem`.

Two process lessons, both cheap and both skipped:

1. **Audit by still.** `remotion bundle` once, then `remotion still <bundle> <comp> --frame=N` is
   ~2s. 122 trace scenes across 12 episodes → contact sheets in four minutes. Every defect above is
   obvious in the sheets. This is now the gate before any batch render.
2. **Read the whole builder output.** `build-dsa-spec.mjs` had already printed
   `needs 1 line marker(s), has 0` for two scenes; the run was checked with `tail -1`, which showed
   only the summary line, and the scenes rendered with a dead code pane. Both builders now treat a
   marker/anchor fault as **fatal** and refuse to write the spec (`✗ REFUSED`), so it cannot be
   skimmed past. Verified against a deliberately broken brief.

Also this session: EP09 and EP10 were ~4.5 min against a 6–7 min series average because each
*named* its second technique in a bullet and never traced it (greedy's sort-by-END; fast/slow's
find-the-middle and Floyd cycle-start). Both gained a full traced act and a second quiz — 7.4 and
7.0 min. Source credit to the owner's repo was added to all 12 briefs so it survives a rebuild.

## 2026-08-20 — DSA Dojo: setup text, overlay geometry, and a course that is actually continuous

Second round of owner review on the same series. Four separate complaints, all correct, all
reproducible from a single frame. See **LAW 0l** in CLAUDE.md.

**1. The sliding-window frame was smaller than the boxes it contained.** A regression I introduced
the day before: making `CellRow` responsive changed cell height to `clamp(56, 660/n, 110)` while the
window overlay kept `height: 74` and `top: -8`. Its horizontal maths also used a plain percentage,
ignoring the 6px gaps, so the frame drifted sideways as the window slid. Row geometry now lives in
one exported `cellMetrics()` and `CELL_GAP`; the window frame and `PointerRail` both measure from
it. Any overlay that restates a row's numbers will drift again — take them from there.

**2. The narration used analogies before giving them.** Sliding Window's hook said *"same houses"*
and its cost beat said *"six houses"*; the train and the houses were not introduced until `s05`.
Hooks for EP01/02/06/08 rewritten to establish the picture first, and every trace beat now carries a
`premise`: one standing sentence, unanchored, above the animation, saying what the viewer is looking
at and what stands for what.

A subtlety worth keeping: **the premise has to describe the picture actually on screen.** The first
pass put the episode's analogy on every DSA beat, so a signal-word card claimed "each box is a house
you pass" while its boxes held the words *subarray* and *contiguous*, and a cost chart said the same
over a set of bars. Signals cards and cost charts now carry their own line. EP05 had the same fault
in reverse — its premise said "each box is a garment" over boxes showing `{ [ ( ) ] }`.

**3. The compiled cut was a concatenation, not a course.** Every episode opened *"welcome back to the
Dojo"* and closed as if the video were ending. All 12 title cards rewritten as chapter openings
("Pattern two of ten in the NBX Studio Dojo: Sliding Window …"), which also satisfies the LAW 0g
greeting without planting a boundary; cross-references now say "the previous pattern", never "last
episode". One set of renders serves both the standalone episodes and the course.

**4. More visualiser faults, found by sweeping stills.** `LinkedRunners` was still fixed-size (44px
nodes, 15px type) and — worse — **never drew the loop-back edge at all**, so the cycle the entire
pattern is about was invisible while the narration described it. Rewritten as SVG with an arced
back-edge. `BruteVsOpt` and `SignalMatch` overflowed their panes once a premise was added: a centred
flex column taller than its box overflows in *both* directions, so the first row rode up over the
premise and the last was clipped. Both now budget against the panel.

**The bug behind several bugs:** every scene component mapped cells field-by-field
(`{label, sub, value, color, atWord, state}`) and silently dropped `parent`, `links` and `tag`. So
the declared topology never reached the renderer — BFS had been falling back to its guessed edges
the whole time, and EP10's cycle could not be drawn no matter what the brief said. Fixed in all 13
scene files, and the fields added to the generated item template in `component-flow.mjs` so new
components inherit them.

**Process, again.** `build-dsa-spec.mjs` refused EP10 with six anchor faults — but an earlier run of
that same build had been piped to `>/dev/null 2>&1`, so the refusal was silent and the render used a
stale spec. Suppressing a builder's output defeats the fatal guard added the day before. New tool:
`scripts/audit-dsa.mjs` checks what no single frame can show (anchors past the end of the narration,
anchors past the scene's own length, panes with nothing to draw, missing premises). Visual gate is
now **three frames per scene** — 25/55/88% — because one still cannot reveal a motion glitch; 594
frames across 12 episodes, montaged into per-episode contact sheets.

## Open threads

- **Demo video** — done, see the dated entry above. One thing outstanding: GitHub does not play a
  repo-relative `<video>` inline, so the README currently shows the poster linked to the mp4. For
  true inline playback the owner can drag `docs/media/iauteur-explains-itself.mp4` into any GitHub
  issue comment and swap the resulting `user-attachments` URL into a `<video src=…>` tag.
- **The back catalogue has no watermark.** 29 specs across 16 topics predate the `brand.logo` fix and
  now warn on lint. Re-rendering them would stamp the logo; nothing was changed for them
  automatically because `topics/` is the owner's content, not repo code.
- **Repo going public** — the code side is DONE (MIT licence, channel identity stripped and purged from
  history; see the dated entry above). What remains is not a code task: **flipping visibility on GitHub**,
  which only the owner should do. Two notes for whoever picks this up. (1) Force-pushing rewritten history
  leaves the old objects unreachable but not instantly destroyed on GitHub's side; they can persist until
  GitHub garbage-collects, and on a public repo an unreachable object is still fetchable **by exact SHA**.
  Nobody has those SHAs — the repo was private with no forks, clones, issues or PRs — so the practical risk
  is very low, but the airtight option is to delete and recreate the repo from the clean local history
  before going public. (2) The `LICENSE` copyright line reads `san-gitlogin (https://github.com/san-gitlogin)`;
  swap in a legal name if the copyright should be attributable to a person.
- `HANDOFF.md` is a stale program tracker (Session 7, 2026-07-12; still says "manifest 17→136", now
  148) and references `/memories/repo/*` paths that don't exist outside one machine. Treat this
  file as current instead.
