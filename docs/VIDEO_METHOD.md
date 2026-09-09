# THE METHOD THAT WORKS — read this before making a video

Distilled from the session that produced `topics/code-an-ai-agent-with-mcp`
(76 scenes, 35:40) and `topics/ai-on-your-own-files`. The owner's verdict on that
session: *"the new components created, the animations, the audits, the thumb creation
were all perfect"* — and, separately, that a later session which had the same CODE did
**not** reproduce the same quality. The code was never the missing part. This is.

CLAUDE.md holds the LAWS (what you must always do). STATE.md holds the SITUATION.
**This holds the ORDER OF WORK and the judgement calls** — the things that were being
done in the good session and skipped in the bad one.

---

## 0. The single biggest difference

**Every claim on screen was checked against a frame, not against intent.**

Not "I authored a callout on the mcp mark" — but `ffmpeg -sseof -0.2 -i seg-NN.mp4
-frames:v 1 out.png`, then LOOK at it. Every serious defect in that session was found
by pulling a still, and none was found by reading code:

| found by looking | would never have been found by reasoning |
|---|---|
| a callout pointing at the shell prompt instead of the dependency | the spec said `mark: 'deps'` and looked right |
| `MCP_SCHEMA` rendering an empty right-hand pane | the component was "wired", just never given `cells` |
| the whole cut silent | frames EXACT, drift 0 ms, every gate green |
| the script describing a different run than the footage | every number was internally consistent |

**Budget for it.** A still costs one second. Pull one per new component, one per beat
where a callout points at something, and one at the top of every segment.

---

## 1. The order of work (do not reorder)

    brief → gen_demo.mjs → RECORD → build.mjs → bake-rec → anchor-spec → lint-spec
    → voiceover.py → sync.mjs → gates → render-long → thumb → gen-upload-kit

**Record BEFORE writing the script.** The narration is written against footage that
exists, with the frames open. Writing the script first is how you end up describing a
run the viewer never sees.

**Never re-run `build.mjs` after voicing without re-running bake → anchor → sync.**
A rebuild resets `timingSource` to estimated and the audio drifts against the picture.

**Cheap vs expensive, so you spend the right one:**

| change | cost |
|---|---|
| move an `atWord` / change a mark / edit a callout | rebuild + bake + anchor + sync — seconds |
| change any NARRATION | full re-voice — ~15 min for 76 scenes |
| change anything in `src/` | full re-render with `--fresh` — ~60 min |
| change the recording | re-record + everything downstream |

Batch narration edits. Do them all, then voice once.

---

## 2. Casting: say the OBJECT out loud first

Before choosing a component, finish this sentence: *"the viewer should see a ___"*.
If the answer is "a row that says X", you have a caption, not a depiction — build or
pick something that ENACTS the idea. Ring, wall, pipe, envelope crossing a gap,
boundary line with things on either side.

**The components that carried the good cut**, and what each is for:

- `MCP_REACH` — a hard boundary with things on either side. What a model *cannot* touch.
- `MCP_MESH` — M×N wires actually drawn, with a tally that counts the wires. Use when the
  argument IS the count.
- `MCP_SCHEMA` — code on the left, the JSON it generated on the right. **Needs `cells`,
  not just `lines`** — supply both or half of it renders empty.
- `MCP_WIRE` — real JSON-RPC envelopes crossing between two named pillars.
- `MCP_LOOP` — a ring that genuinely cycles, with the exit node coloured differently.
- `MCP_CONTROL` — lanes stamped with WHO pulls the trigger (ai / code / user).
- `DATABASE_TABLE`, `LOG_STREAM`, `SPEC_COMPARE`, `FILE_TREE`, `LAYERED_STACK`,
  `API_REQUEST_RESPONSE`, `DIAGRAM` (flow/tree) — all verified to render well.

**Avoid `PIPELINE`** for anything taught: it marches its stages on a fixed 22-frame
interval from one anchor, so stage four lights whether or not the voice got there
(LAW 0i.1). Use `DIAGRAM` flow, which anchors every node AND edge.

**Before authoring a component you have not used**, open a topic that already uses it
and copy the real data shape — the manifest examples are copy-pasted placeholders and
several are wrong.

---

## 3. The over-reliance cap is asking for more explanation

`RECORDED_STEP` (or any type) is capped at ~35% of scenes. On a live-coding course this
fires constantly. **There are two ways to satisfy it and only one is honest:**

- merging footage beats — fastest, and it deletes teaching. The owner rejected this
  outright: *"i dont want you to take any sort of easy path."*
- adding drawn beats — costs ~2 new scenes per footage beat, and every one of them is
  something the viewer now understands.

Always the second. Fifteen drawn beats went into that cut and it got better.

---

## 4. Ceilings: `180 × anchors + 120` frames, capped at 2100

A beat earns runtime by having anchored elements. When the linter says a scene runs
longer than it earns, the remedies are, in order: **more anchored elements**, or **split
the beat**. Never trim the explanation — that is how a video becomes unfollowable.

Pre-sync estimates run at 12 frames/word; the voice delivers **9.65**. So a pre-sync
warning of X seconds is really **X × 0.8**. Do that multiplication before "fixing"
anything, or you will churn on beats that are already fine.

---

## 5. Runtime is free; the title is chosen afterwards

Author every beat at the length the explanation needs. Measure. Then title it with the
next round number up — 35:40 becomes *"Under 40 Minutes"*. The owner's best performer is
the uv course: long, complete, titled to promise completeness.

Thumbnail: big title, tags in the badge, a row of real brand logos along the bottom.
Never a single logo on a white card.

---

## 6. The gates, and what each actually proves

    npm run gate                          # 37 owner corrections still have a mechanism
    node scripts/lint-spec.mjs <spec>     # budgets, field caps, data shapes, voice guard
    node scripts/check-holds.mjs <spec>   # a clip you must READ stays up ≥2s
    node scripts/audit-sync.mjs <spec> <timestamps>
    node scripts/check-recordings.mjs --slug <slug>
    node scripts/check-field-use.mjs <spec>

**What no gate proves:** that the picture is right. Gates catch structure. Frames catch
truth. A cut once passed every one of these in total silence.

---

## 7. Recording

- **Diagnose with a 4-step demo, never the 49-step one.** Slice `demo.steps.slice(0,4)`
  into a throwaway slug. Same failure, one minute instead of ten.
- **A failed recording writes NOTHING** and `public/rec/` is gitignored — a late failure
  loses the whole take. Validate mark texts before committing to a long run.
- **A mark must point at something on a laid-out row.** xterm and Monaco keep scrolled-out
  rows in the DOM at `0×0`; the runner now refuses those, and records what each mark
  `covers`. If a needle appears twice on screen, the LAST one wins — check which.
- **Long output scrolls the thing you want to mark off screen.** Print less
  (`sed -n 10,17p` beats `cat`).
- **One mark answers for one callout.** Two labels cannot sit beside one rectangle; the
  second gets pushed into empty frame.
- **Grep every capture for the operator's identity** before it is drawn. `uv init` stamps
  the local git name and email into `pyproject.toml`.

---

## 8. Script

Written for the ear, against the frames, for someone who has written a for-loop and
nothing else.

- **Name every term the first time it is on screen, in the same breath.** `stdio`,
  `async`/`await`, a context manager, a list comprehension, an f-string, `json.loads`.
  The lines an author skims are the ones that lose a beginner.
- **Say why a line exists, not what it says.**
- **One pause invitation per chapter**, at the moment that carries the concept.
  *"Pause here and read the whole block before we run it."* Never as a tic.
- **The voice rate is `+8%` and is not a tuning knob.** When a beat is too fast the fix is
  MORE WORDS OVER THAT CLIP — never playback speed.
- **Numbers come from the frames that will ship**, not from a verification run of the same
  code. A rerun is a different take: timings, counts, and a model's choice of tool all change.

---

## 9. Rendering

    node scripts/render-long.mjs <slug> <comp> 10          # 10 segments
    node scripts/render-long.mjs <slug> <comp> 10 --fresh  # after ANY src/ edit

- Segments are cached and keyed on frame count. That catches a segment from a spec with
  different boundaries; it does **not** catch one whose components changed underneath it.
  **After editing `src/`, always `--fresh`.**
- `pkill` on the wrapper does not stop the render. Kill `remotion-cli.js render`,
  `compositor-darwin`, and `chrome-headless-shell`, then confirm with `pgrep`.
- The verification prints three numbers and all three matter:
  **frames EXACT · drift 0 ms · audio mean ≈ −22 dB.** Silence measures −91.
- `meta.audioPrefix` must be set whenever the voice prefix is not `<first-hyphen-segment>_long`.

---

## 10. When the owner sends a screenshot

He is not asking for that instance to be patched. He is asking why the class was possible.

1. Reproduce it — pull the frame, confirm you see what he saw.
2. Find the CAUSE, not the symptom. It took three diagnostic takes to learn that a
   mis-pointed callout was a scrolled-out DOM row measuring `0×0`.
3. Fix it so it cannot recur, and **seal it** in `check-corrections.mjs`.
4. Test the seal by breaking something on purpose.
5. Write the argument into CLAUDE.md — the guard goes on the ARGUMENT, not the surface.
   Finish the sentence *"the same reasoning also applies to ___"* before you stop.

## The over-reliance cap is arithmetic, so do it before you write

`RECORDED_STEP` (or any sub-type) is capped at `ceil(0.35 × scenes)`. Read that backwards
before authoring: **a chapter with R typing beats needs at least `R / 0.35` scenes in
total**, so 36 recorded beats needs 101 scenes and therefore ~65 drawn ones. Discovering
this after the script is written costs a full authoring pass; deciding it first makes the
drawn beats part of the plan, which is where they belong anyway — a picture between every
two typing blocks is better teaching than a wall of screen recording.

The fix is never to merge footage into fewer scenes. It is always to add drawings.

## Two solver traps that no amount of rewriting fixes

**The word round-trip.** `anchor-spec` places a clip at a FRAME and stores it as a WORD, and
`wordOf` ROUNDS. A clip placed at frame 279 comes back as word 24 = frame 276, and the
previous clip ships three frames short — reported as "243f of footage but only 240f of
narration before the next step". Adding words moves both numbers and the error survives.
Fixed 2026-09-09 by ceiling the automatic path to a whole word, the way the override path
already did.

**Callouts live in the HOLD, and the hold ends at 80% of the read.** A callout must land
after its clip's footage AND before `0.8 × narration`. So a clip of F frames needs a beat of
at least `(F/12 + callouts + 3) / 0.8` words — for 1417 frames and one callout, ~152 words,
not the ~127 the error message quotes. Budget with the 0.8 in the arithmetic or you will
expand the same beat twice.

## An explanatory component must step on WORDS, not on a cadence

`LayeredStack`, `FileTree` and `LogStream` all revealed their rows on a fixed frame interval
(26, 7 and 7 frames). On a forty-second beat that means the picture completes inside the
first second and then sits still while the voice is still explaining it. All three now take
an optional per-element `atWord` and fall back to the old cadence when it is absent, so
existing specs are untouched. When you add a drawn beat, anchor every element: the lint's
dwell warning ("that earns 16s") is measuring exactly this.

## Run every audio-free gate BEFORE you voice — `scripts/preflight.mjs`

Typecheck, `check-recordings`, `anchor-spec`, `lint-spec` and `check-narration-visual` can
all answer before a single word is spoken. `render-topic` runs some of them, but that is an
hour too late: on Allure chapter 1 the capture had been silently downscaled to 1920 while
the spec zoomed 3.2x into it, and nothing said so until after 101 scenes had been voiced and
synced. The fix was a re-record, which changes every clip length, which invalidates the
sync, which means re-voicing whatever no longer fits.

    node scripts/preflight.mjs <slug>      # must pass before scripts/voiceover.py

`masterWidth` is the specific trap: it defaults to **1920**, so raising `deviceScaleFactor`
alone changes nothing about what is written to disk. A demo that zooms past 2x needs
`deviceScaleFactor: 4` AND `masterWidth: 0`.

## The report you build is not the report the tool builds — say which is which

The Allure course produces genuine `allure-results` (the official `allure-behave` adapter
writes them) and then renders them with a Python script of our own, because the official
renderer is Java. Both halves of that are worth saying out loud, because a viewer who
half-notices will assume the whole thing is a mock-up.

The proof costs one command. `npm i -D allure-commandline` needs no admin rights, and with
a JRE present `allure generate <results> -o <dir>` produces the official report from the
same folder; `widgets/summary.json` carries its own counts. On this machine both readers
return `7 passed, 1 failed, 1 broken, 1 skipped, 10 total`. Run the reference implementation
beside your own and show them agreeing — it is the strongest thing a "build it yourself"
chapter can do, and it takes ninety seconds of screen time.
