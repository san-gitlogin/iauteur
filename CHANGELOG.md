# Changelog

All notable changes to iAuteur are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Scope note.** iAuteur is a video *factory*: the repo ships the engine (components, linter,
> pipeline scripts, design packs). The videos live in `topics/`. As of 2026-08-21 their **specs**
> (`long.json`, `shorts.json`) are tracked — they are the authored work product and 1.3 MB for the
> whole channel — while `topics/*/out/` renders and `public/audio/` stay untracked, being large and
> regenerable. Entries below describe engine changes. Where a rule was learned by shipping a real
> series, the measurement that produced it is recorded, because the measurement is the part that
> generalises.

---

## [Unreleased]

### 2026-09-02 (later still) — a maximised terminal fills the frame, and the card has nowhere to go

Owner, on the recorded beats: *"the vignette kinda blurs what's happening… component overlay
overlapping exactly at the time where something is highlighted and is being explained."*

Both are one cause, and it was a fix from earlier the same day. Maximising the terminal panel
(gotcha 69, done to make marks measurable) meant that by the sixth step the screen still held
every command from the first five and the ink reached the bottom edge. The overlay solver
picks the tallest ink-free band; with no free band left it put the caption card **on** the
live output, and the 250px bottom scrim dimmed the lines being narrated.

Measured on the shipped cut: terminal ink to **y=846**, card starting at **y=800**.

**`clearFirst` on the first step of each scene.** The clear runs before the step's t0 mark, so
it never appears in the footage, and it is what a person demonstrating something actually
does. Deepest ink across all thirteen steps is now **y=536 of 900** — the bottom 40% is free,
the card sits clear of the work, and each beat shows only its own output instead of a wall of
accumulated text. Steps that must show accumulation (`ls -a` right after `uv run`) keep the
screen deliberately.

Two guards fell out of it: clearing an already-empty screen changes no bytes, so `runCommand`'s
"buffer changed and ends at a prompt" completion never fires and the first beat hung for its
full timeout — the clear is skipped when the buffer holds one line. And the `[accent]` bracket
syntax is **per-type**: `UV_STAGE.headline` parses it, `HOOK.headline` and
`RECORDED_STEP.caption` print the brackets. A census over the catalogue is the cheap check —
96 of 97 hooks and 34 of 35 captions never used them.

### 2026-09-02 (later) — the script was telling viewers it was made by a machine

Owner, on the first cut: *"Did anyone ask that you are doing all real? You yourself are
letting users know that you are doing real stuffs, indirectly stating you are AI. Dude,
watchers are humans — such scriptings are not good."*

He is right, and it is a writing law rather than a one-off edit. **A person demonstrating
their own screen never defends its authenticity.** Only someone anticipating the accusation
says "on a real machine", "typed live and read back", "real numbers rather than a marketing
page", "measured here". Eighteen such claims were counted in one 20-scene spec — in
narration, in premises, in a verdict, on the title card, and in the thumbnail note. Every
one is cut. The provenance still belongs in `meta.seo.sources` and in `briefs/`, where it
is a production record; on screen it is a tell.

Four more defects from the same review, all found by looking at frames:

- **The screen said FIVE and the voice said FOUR.** The hook and thumbnail promised "one
  tool, not five" while the narration named four. Now five are named and drawn (pip,
  virtualenv, pyenv, pipx, poetry).
- **"Python" was never spoken in the first four scenes** of a video about a Python tool.
  It is in the first sentence now, and on the hook card.
- **Three silent field drops** (see `docs/STATE.md`): `TITLE_CARD` has no `asset`, so the
  logo never rendered — the owner reported it as *"the logo is hidden somewhere"*; `HOOK`
  does not parse the `[accent]` syntax, so it printed the brackets, and a census showed 96
  of 97 shipped hooks never used them; `install-routes` takes its last stage item as the
  DESTINATION, so an item authored as a fifth peer detached and floated mid-pane.
- **Adjacent duplicate headings** — "borrow a tool, or keep it" immediately followed by
  "Borrow it, or keep it", and an act title repeated three beats later.

### 2026-09-02 — the macOS port: twelve defects, and only two of them were "macOS is different"

The screen-recording subsystem was built and measured entirely on Windows. Standing it up on
a Mac to produce the uv walkthrough found twelve faults. Two were genuine platform
differences; the other ten were **latent bugs the Windows machine had been getting away
with**, and several were silently corrupting what a recording claimed to be true. Full
detail with the measurements is in `docs/SCREEN_RECORDING.md` gotchas 57-70.

#### Fixed — three that made a recording LIE

A recording that fails is cheap. A recording that succeeds while being wrong is the thing
this subsystem exists to prevent, and three separate bugs did exactly that.

- **Every exit code in every recording was 1**, including `echo hello`. The POSIX prompt
  hook separated its two fields with a literal tab built by `String.fromCharCode(9)` — and
  that string is *typed into a live shell*, where a tab is COMPLETION, not a character. The
  exit file came back as `False1`, `readExitStatus` split on a tab it could not find, and
  fell through to its "not True" branch. PowerShell escaped its tab as `` `t `` and never
  typed a control character, which is why Windows never saw it. `expect: {exitCode: 0}`
  would have failed on every command that worked, while the manifest still reported
  `truth: 'read-back'`.
- **The next command lost its first character** after each step. Reading the scrollback
  through `Terminal: Select All` + `Copy Selection` costs the terminal one key event, so
  `echo BBB` ran as `cho BBB` — a real command, with real output, recorded as truth.
  `readScrollback` no longer touches the palette: it runs after the step's t1 mark, when
  nothing is writing to the buffer, and simply walks the viewport with 40% overlap and
  stitches the windows. Deterministic precisely where gotcha 41's polling was not.
  `runCommand` also reads the command line back and compares it EXACTLY before pressing
  Enter, because a stray character makes a different command that the runner cannot
  distinguish from intent afterwards.
- **`code` on PATH was Cursor.** A VS Code fork answers `--version`, serves `serve-web` and
  mounts `.monaco-workbench`, so every assertion passed and the footage would have been a
  different product — in a course about VS Code. The CLI is now identified by
  `serve-web --help`, whose first line names the product, and the runner refuses a fork
  rather than record one.

#### Fixed — two that aborted every take

- **`readBuffer` was reading an accessibility mirror.** VS Code mounts a second, one-row
  xterm holding just the current command line; being mounted later it won the old "last
  mounted xterm with size" heuristic. `cat pyproject.toml` completed perfectly in the real
  terminal while the runner read the mirror's single line, saw no prompt, and died on its
  timeout — on a command that had already succeeded. Every recording died on its third
  step, because the mirror only exists once there is a command line to mirror.
- **`--default-folder` does not exist on VS Code 1.109.1**, and gotcha 12's flat claim that
  `?folder=` "DOES NOT WORK" is true of 1.134.0 and false here. Passing the unsupported flag
  makes the CLI exit immediately, which surfaces 180 seconds later as "did not become ready"
  with no cause in it. The runner asks the build which route it supports, and
  `openWorkbench` now ASSERTS the folder bound — by the folder name in the window title, not
  by the Explorer's contents, since a demo that creates its own files starts empty.

#### Fixed — identity, again, one layer down

`assertNoIdentity` checked the home path and the repo path. The first frame of the first Mac
recording carried `<handle>@<machine>` — the default zsh prompt — which is neither. **This is
the same miss as the 2026-08-30 repo-wide leak**, whose write-up already said it in so many
words: *"`<handle>@box` is not a path."* That gate was fixed and this guard was not, so the
identical hole stayed open in the layer closest to the pixels. It now matches `user@` and the
hostname too.

Related, and preventive rather than a post-hoc grep: **recording workspaces moved out of the
repo** to `/tmp/iauteur-rec`. They were under `out/`, i.e. under the operator's home, and uv
prints `Building myapp @ file:///Users/<operator>/…` on every dependency change — so the
guard fired correctly and made the take *impossible* rather than safe. And a scaffolding tool
reads the git identity: `uv init` stamps the operator's real name and email into
`pyproject.toml`, so a capture points `GIT_CONFIG_GLOBAL` at a scratch config and the DEFAULT
behaviour is still what gets taught.

#### Added — `maximizePanel`, and a fixture that runs anywhere

- The default terminal panel is ~13 rows. An 18-line `cat` scrolled a third of itself away
  before a mark could be measured, and the take died on "Mark could not be measured" — the
  runner correctly refusing to invent a rectangle. It is also the wrong picture: on a
  terminal demo the editor half holds only the VS Code watermark. `"maximizePanel": true`
  takes it to **42 rows**, after `openTerminal` and asserting the row count moved.
- `scripts/lib/record/framepaint.mjs` — a dependency-free PNG writer with a 5x7 bitmap font.
  `gen-rec-fixture` used ffmpeg's `drawtext`, which needs `--enable-libfreetype`; the
  Homebrew build here does not have it, so the entire seven-script `test-rec-*` suite died
  on a machine where the product worked fine. The fixture paints its own frames and hands
  ffmpeg a PNG sequence — the same encode path the real capture already uses.

#### Fixed — `npm run gate` was red, on both machines

- **`normalize.mjs` was destroying five shipped features.** Its `META_KEEP` allowlist
  predated LAW 0g's 2026-08-30 amendment, which made `meta.subject` REQUIRED — so normalize
  deleted `subject` as unknown and the very next lint rejected the spec it had just cleaned.
  Four shipped specs went pass → fail through a normalize. The thumbnail allowlist had the
  same rot, silently stripping `logos`, `note`, `titleStruck` and `replaces`. Both lists now
  live in `scripts/lib/constants.mjs` as `META_KEYS` / `THUMB_KEYS`, read by the normalizer
  AND by `gen-schema.mjs`, so the three copies that drifted are one.
- `assembleSpec` never carried `meta.subject`, so **every console-authored spec would fail
  lint** on a field the model is not allowed to own — the same shape as the `brand.logo`
  drop that test already pins. Fixture specs updated to the amended LAW 0g.
- **`check-recordings` could never pass on a fresh clone.** Recordings are gitignored by
  design, so a clone has every spec and no footage, and the seal treated that identically to
  a spec defect — the "gate you learn to ignore" that `docs/STATE.md` warns about in its own
  check-fresh note. Absent footage is now a NOTICE on the repo-wide sweep and FATAL for a
  render, which is stricter where it matters: `render-topic.mjs` passes `--slug` and asks
  only about the cut it is about to render. NOT BAKED and STALE stay fatal everywhere; all
  four directions were break-tested by injecting the fault.


### 2026-08-23 — `scripts/render-covers.mjs`: the covers nobody could afford to render

#### Added

`render-topic.mjs <slug> cover` shells out to `npx remotion still`, which re-bundles the
whole project on every call. That is fine for one cover and absurd for twenty — which is
why the entire Playwright Dojo series shipped nineteen shorts with **no cover still at
all**, and nobody noticed until the shorts were collected for upload. `render-covers.mjs`
bundles ONCE and renders every missing cover against that bundle; it defaults to "every
topic that has a rendered short, an authored `cover` block, and no `out/cover.png`", so
the gap cannot silently reopen.

The general shape of the defect is worth keeping: **a per-item script that pays a fixed
setup cost per invocation will not be run in bulk, and the work it does simply will not
happen.** The cost was not the render (a still is ~2s); it was the bundle in front of it.


### 2026-08-22 — the uv course: fourteen chapters, one scene type, nineteen pictures

#### Added — `scripts/lib/uv-build.mjs`, one harness for a whole course

Every chapter's `build.mjs` is a list of beats and nothing else; duration and every anchor
are computed from the narration. The Playwright series carries the same twenty-line
preamble in every topic builder, and when the frames-per-word estimate was re-measured only
the episode being worked on got the new number. A course is not a concatenation of videos,
and its build rig should not be one either.

The harness header records the eight authoring rules, each of which cost a build-lint-fix
round trip before it was written down — a beat earns 16 seconds with two anchored elements
and four more per anchor beyond, the greeting guard recognises only specific forms, bare
pronouns must stay under 4.5%, and so on. It also refuses a HOOK over 15 words at build
time, because the 8-second cap is only checked AFTER sync and a two-word overrun otherwise
costs a whole second TTS pass. Measured: 21 words of Ava audio is 8.2 seconds.

#### Added — `quizReveal(narration)`

LAW 0e-q wants question → pause invitation → "Ready?" → answer, and the linter measures the
gap from the last question mark before the reveal. But "Ready?" is itself a question mark,
so anchoring the reveal after it reports a one-word thinking gap however long the pause
actually was. Chapter 00 passed that by luck; chapter 01 did not, which is why the anchor
is now computed from the words rather than from a fraction.

#### Added — eleven more depictions, and 251 flashcards

`bootstrap-paradox`, `install-routes`, `ephemeral-bay`, `interpreter-rack`, `project-tree`,
`constraint-line`, `packing-list`, `depot-cache`, `script-header`, `strict-gate` and
`dist-output`, taking `src/uvViz.tsx` to nineteen kinds behind one scene type. Plus
`briefs/uv/flashcards/*.tsv` — fourteen decks, one card per line as `Question<TAB>Answer`,
validated so every line has exactly two fields.

#### Changed — three more caps, each replaced by a measurement

The step-label cap went 44 → 52 → 60, because the real Windows installer one-liner is 58
visible characters and LAW 0m forbids trimming a real artefact to fit somebody's guess.
`dist-output` labels are real distribution filenames and `depot-cache`'s last label is a
caption sentence, so both joined the wide-label set. And the over-reliance cap now keys
`UV_STAGE` by `kind`: eight distinct depictions were being counted as one component used
eight times, which is the opposite of what that cap exists to catch.

#### Added — `briefs/uv/research/05-uv-transcripts-2.md`

The gaps the first research pass listed as still-to-capture, captured by running uv 0.12.5
installed isolated into a scratchpad via `UV_INSTALL_DIR`. Three of them changed what the
course teaches: `uv pip compile` PRINTS and writes nothing without `-o`; `uv sync` removed
three packages nobody asked it to touch; and the obvious verification command does NOT work
(`rich` exposes no `__version__`), which is recorded precisely so it never goes on screen as
if it did. Scrubbed before commit — `uv init` writes an `authors` line from the local git
config, and `briefs/` is tracked in a public repository.

### 2026-08-22 — proofing the eight uv depictions found six defects and three wrong caps

162 stills — 8 kinds x MIN/MAX/MIX + 2 terminal-layout + a ring-state fixture, at both
aspects, on `terminalcli`, `neobrutalism` and `material`. Every one scanned rather than
eyeballed. Final state: `edge-scan` 0 flags across all 162; `pane-fill` clean except two
deliberately compact two-object pictures (~32-41%) and the terminal-layout rows, which
have no right pane to fill.

#### Fixed — `env-ceremony` was a list, which is the one thing this course cannot ship

It took `items[]` and drew numbered rows lighting up in order. At its cap that is nine
identical text rows in the right-hand pane: the lit-rows template four sampled frames of
the shipped Linux cut all shared, reproduced inside the course written to avoid it. The
idea is a LOOP, and a loop is a shape — it is now a ring of six recognisable objects
(`lucide:package-plus`, `toggle-right`, `brain`, `toggle-left`, `rotate-ccw`,
`alarm-clock`) with a marker travelling it, contracting into one command on the payoff.
Recorded as a LAW 0n corollary: say the SHAPE out loud before writing the component; if
the answer is "the items, in order", it is a caption list whatever the field names say.

#### Fixed — the verdict rendered on every beat and was visible on none

Every uv depiction sets `height:100%` on its own root. Inside the effect pane's flex
column that claimed the whole pane and pushed `VizVerdict` out under `overflow:hidden`.
The pane's budget already reserved the strip, so the arithmetic looked right in review and
was wrong on screen. Found by proofing a still.

#### Fixed — three more layout defects, all of them MAX-only

A 48-char headline wraps in every pack at 16:9 and the second line landed on the premise
and on the stage border. The terminal pane, which does not scroll, was cut mid-line with
no affordance at 45 output lines. `dep-unfold` squeezed ten parcels to unreadable slivers
with the tenth clipping the pane, and hung its spine in space instead of off the parcel
that named the dependencies. **The MIX fixture showed none of these** — which is the
lesson: proof at the caps, because whatever the linter permits somebody will author.

#### Changed — three UV_STAGE caps, each replaced by a measurement

| Cap | Was | Now | Why |
|---|---|---|---|
| `headline` | 48 | 38 | 48 wraps onto the stage at 16:9; 38 is one line in the widest-glyph pack |
| `steps[].label` | 44 | 52 | the real install one-liner is 46 visible chars, and LAW 0m forbids trimming a real artefact to fit a guess |
| `stage[]` count | 10, flat | 2-7, per kind | each picture has its own capacity; a blanket ceiling let two of them burst |

Plus two new rules: a total terminal-line budget (17 split / 26 terminal, counting
commands + output lines + notes, because the pane does not scroll), and a wider stage
label cap for `env-ceremony`, whose labels are commands rather than package names. All
five were proved by injecting the violation and watching each one fire.

#### Added — `scripts/pane-fill.mjs` and `scripts/gen-uv-fixtures.mjs`

`pane-fill` measures the depiction's ink box against the pane and prints the fraction —
the counterpart to `edge-scan`, which catches content spilling OUT while this catches
content that never grew IN. It found that five of eight uv depictions had a size ceiling
binding before the measured budget did, floating the picture in a pane up to five times
its height. It also documents two things about itself, because both cost a wrong
conclusion first: a terminal-layout beat has no right pane and reads ~0%, and the ink
threshold has to be low enough to see deliberately DIM content or a full pane reads as a
third of one.

`gen-uv-fixtures` generates MIN / MAX / MIX from the linter's own bound tables, so the
fixture cannot drift from the contract it is testing.

### 2026-08-22 — one scene type, eight pictures: the uv course stage

#### Added — `UV_STAGE`, and a viz registry that cannot fail quietly

The uv course adds exactly **one** scene type. `src/uvViz.tsx` holds the pictures: `pkg-parcel`,
`pkg-index`, `dep-unfold`, `shelf-share`, `shelf-evict`, `shelf-split`, `two-projects`,
`env-ceremony` — each built from parcel/plank/folder atoms, each reading `stackBudget()` (LAW 0o)
and resolving every element from its own `atWord` (LAW 0i).

The shape was chosen by measuring the Linux course rather than copying it: 116 registered `CMD_*`
types, **one** shared two-up shell, **56** depiction kinds — and a component register that opens by
admitting *98 specified, 6 built*. A plan counted in scene types over-promises by an order of
magnitude, so the plan is now counted in pictures. Recorded as a LAW 0n corollary.

#### Added — `layout: "terminal"` on `CommandStage`

`CommandStage` was hard-locked to two-up. Four frames sampled from the shipped Linux cut were the
same split, and in two of them the left pane was empty — a beat whose whole content is one screen
has no second pane to draw, and forcing one yields dead space or a list invented to fill it.
Purely additive: `'split'` stays the default, and all 111 existing callers are untouched.

#### Fixed — three silent viz fallbacks, and a seal that was blind

`linuxViz`/`dsaViz`/`mcpViz` each substituted a real picture for an unknown kind (`?? FileContent`,
`?? SignalMatch`, `?? ControlBoard`). A one-character typo therefore drew a confident WRONG picture
that passed tsc (it is a string), passed the linter (the kind is chosen inside the component, never
in the spec), rendered fine, and showed up on a contact sheet as *a* picture. Now:
`src/unknownKind.tsx` renders the failure loudly in semantic red — loud, not fatal, because throwing
would abort a 90-minute render at minute 80 over a typo — and `scripts/check-viz-kinds.mjs` (gate
seal #11, `npm run gate` is now 11 seals) catches it in milliseconds before any render.

The seal's first version reported a green tick **while blind**: it matched `kind="x"` but not
`kind={"x"}`, which is 110 of the 140 call sites. It was caught only by deliberately breaking a real
file and watching the script pass. It now carries a self-test that fails if its own extractor goes
blind — the general lesson being that a guard is unverified until a fault has been injected into it.

### 2026-08-21 — research is done by running the tool, not by reading about it

#### Added — LAW 0m corollary: capture the artefact, documentation is a secondary source

LAW 0m already required real artefacts with real data on screen. It did not say where to get one,
and the assumed answer — the project's own documentation — turns out to be unsafe. Measured while
researching a new course, in a single pass:

| The docs said | The tool actually did |
|---|---|
| build constraint `uv_build>=0.12.5,<0.13` | writes `<0.13.0` |
| `uv init` creates a `.git/` directory | it did not |
| a page titled **Benchmarks** | contains **no benchmark numbers at all**, only a pointer elsewhere |

The third is the dangerous one: a "10× faster" figure lifted from a page called Benchmarks would
have been an invention wearing a citation, which is LAW 3's worst failure mode.

Running the tool also produced **better teaching material than the documentation contains** — a
real dependency tree in which one package appears under two parents (the shared-dependency idea,
drawn for free on real data), and a forced resolver conflict in which the tool narrates its own
reasoning in plain English. Neither exists in the docs.

Three rules ship with the corollary:

1. **Pin the version you teach**, and install it **isolated** (a scratchpad install dir) — never
   upgrade the owner's tooling as a side effect of research. The machine here had a version two
   minors behind, across a release that changed the very command the course opens on.
2. **A capture from a real machine carries the operator's identity.** `init` stamped a GitHub name
   and email into the generated file from local git config; a version listing printed real install
   paths off a second drive. `briefs/` is tracked and this repo is public, so every capture is now
   grepped for names, emails and local paths before commit.
3. **Never run the publishing or destructive command to get a transcript.** A dry run or a test
   registry — and no token-shaped string on screen, ever (LAW 11).

#### Added — three operational gotchas in `docs/STATE.md`

- **The renders are gitignored, so a fresh machine cannot review shipped work.** `topics/*/out/`
  is the only copy of what shipped and it is untracked, so on a clone you have every spec and no
  way to see a frame — and review silently degrades into reading JSON. That is how a visual defect
  survives. Proven: four frames pulled from a backup of the 87-minute Linux masterclass showed the
  same picture four times out of four — terminal pane left, a box of seven-or-eight lit text rows
  right, both panes underfilled, the left one **empty** in two of the four. That is LAW 0n's exact
  defect, in the cut that was held up as the good example. Get the mp4 and pull frames before
  critiquing or extending any shipped course; if `out/` is absent, say so rather than reviewing the
  spec and calling it a review.

- **A checkout that is behind looks exactly like a repo that never had the work.** A session 21
  commits behind was asked about files and laws it could not see, and nearly reported them as
  nonexistent. `git fetch` before concluding anything named in a handover prompt is missing;
  a manifest or topic count disagreeing with STATE.md is the tell.
- **The `skip-worktree` channel logo aborts `git pull`**, and the wrong fixes are committing it or
  discarding it blind. The back-up → unflag → checkout → pull → restore → re-flag procedure is now
  written down with the verification steps.

### 2026-08-21 — the MCP course, and the layout bug wearing four faces

#### Fixed — one cause behind four separate owner complaints

`stackBudget()` returned the constant `vertical ? 960 : 430`: a guess at a pane's inner height that
ignored everything already in the pane. A three-line premise ate 120px and every depiction still
sized itself to the full 960, so the surplus left through the bottom border.

| Symptom reported | Was actually |
|---|---|
| a premise sitting on top of the machines in a short | pane overflowing upward — `justify-content: center` overflows **both** ways |
| a JSON payload overrunning the vars strip | same surplus, leaving through the floor |
| three cards ballooning until the last was cut off by the frame | row caps of 156px against a budget that was never measured |
| "the graph is kinda like a patty inside a burger" | a fixed 168px plot floating in a 700px card |

Panes now measure — stage height, less the caption bar, less the *wrapped* premise, less the vars
strip, less padding — and publish the remainder through `BudgetCtx`. `StatePane` and the Linux
effect pane both provide it. Recorded as **LAW 0o**, with the rules that fell out of it:

- Fit **both** axes. `CodePane` sized its font by height alone, so a 52-character line needed 1060px
  of a 976px pane and was sliced mid-token.
- Travel by your own width, never half of it. A pill at `left: pct%` with `translateX(-50%)` has
  half of itself outside the track at both ends of its run — which is why a message envelope
  "just gets hidden behind the container" the moment it moved.
- A squashed viewBox squashes **type**. `preserveAspectRatio="none"` distorted every chart axis
  label; they are HTML over the plot now, strokes are `non-scaling-stroke`, and the trace head is a
  div rather than an ellipse.
- Breathing room is not smaller type. Space comes from carrying less on the beat.

#### Fixed — icon weight

Lucide's 2px stroke is drawn for a 24px glyph; at the 50-100px sizes a diagram node uses it renders
as a 6-8px marker line. Stroke now thins as the glyph grows, holding optical weight constant.

#### Added — 2 scene types (library **339 → 341**), and 3 depictions rebuilt

Written against **LAW 0n**: name the object the viewer should see; if the answer is "a row that
says X", that is a caption, not a depiction.

| Type | What it draws |
|---|---|
| `MCP_MESH` | the M×N integration explosion — four apps wired to four services one wire at a time until sixteen cross the frame, then a hub lands and eight re-route through it. The tally reads the wires actually on screen, so the arithmetic cannot drift from the drawing. |
| `MCP_REACH` | the hard line: the model on one side, your files/database/calendar on the other, each locked or reachable, your code the only crossing. |

Rebuilt: `MCP_WIRE` is now a running sequence diagram (lifelines, the crossed half of the wire drawn
behind the envelope, the addressed machine lighting on arrival, payload docked to the side that
*received* it). `MCP_CONTROL` became a switchboard — deciders in their own column, a curve from each
primitive back to whoever fires it, a charge travelling down it on the beat; two primitives owned by
the same actor visibly share a wire, which no arrangement of cards can show.

#### Fixed — chapter one answered the wrong question (**LAW 0p**)

It opened on `client.messages.create()` and its arguments: every sentence true, all of it answering
a question a first-time viewer has not asked. A title is a promise. It now opens on what Claude *is*
and what it cannot touch, then on your code as the only thing on both sides of that line; the API
anatomy arrives as the answer to a question the viewer is by then holding.

Also: the series shipped 00-09, 11, 12 — twelve chapters and no chapter ten, because two slugs were
typed from the brief index rather than the chapter index. Numbering with a hole is a defect nobody
reviewing content will catch and every viewer scanning a playlist will.

#### Added — brief builders can no longer destroy the corrections

The `.py` builders and the `.json` briefs beside them had diverged; the JSON was the correct copy.
Re-running them proved it: nine dropped scenes outright, and the rest reverted *content* while
keeping the scene list identical — chapter four's builder still wrote `FastMCP`, the class name
corrected to `MCPServer` weeks earlier. Nothing downstream would complain.

All builders now write through `briefs/_guard.write()`, which compares the whole document against
the JSON on disk, refuses on any difference, and dumps what it wanted to `<name>.candidate.json` for
diffing. 19 refuse; the ones that still write are the short generators. They also no longer contain
hardcoded `/Users/...` paths, so they run on any machine.

`briefs/linux/rewrite/regen.py` regenerates all 109 `src/scenes/Cmd*.tsx` from a table; running it
during this audit reverted the multi-line command-output fix and the 9:16 stage change across every
one of them. `git diff` caught it. It is now named as do-not-run in `briefs/README.md`.


Everything below was learned producing a 19-episode tutorial course end to end. The recurring
theme: **the linter is where a lesson becomes permanent.** A rule written only in prose gets
forgotten by the next session; a rule with a guard behind it cannot be.

### Added

#### 33 new scene components (library **162 → 195 types**)

Built under the "invent first, cast second" rule — describe the ideal component for the beat
*before* looking at the library, and build when nothing matches ~90%.

| Component | What it draws |
|---|---|
| `THEATER_STAGE` | A live proscenium stage: curtains part, a spotlight travels and pools at an actor's feet. |
| `QUIZ_CARD` | Question, a silent thinking beat with a draining hairline, then the answer lifts with a one-line why. |
| `CODE_RUN` | A whole program dimmed; one line lights at its own word, a plain-English note crossfades in a fixed strip, its result lands beside it. |
| `BROWSER_STEP` | The page is BUILT from the steps — `fill` makes an input, `click` the button, `assert` the banner. |
| `FIXTURE_CREW` | Dependency injection drawn: an empty argument slot, a crew building browser→context→page, teardown clearing in reverse. |
| `OVERLAY_BLOCK` | A banner covering a button; the pointer bounces off, waits, the banner lifts, the press lands. |
| `CHANGE_RIPPLE` | One edit vs fifty, in two modes — the modes ARE the argument. |
| `RULE_TEST` | A stated rule judged against real cases. |
| `SAVED_SEARCH` | An un-run query beside an untouched page. |
| `RESPONSIBILITY_SPLIT` | Real lines sorted into two bins. |
| `CROWD_MATCH` | One query resolving to many elements, with live group readouts. |
| `ROW_FILTER` | Narrowing to one row, then acting INSIDE it. |
| `INDEX_DRIFT` | Two pointers, one by index and one by meaning; the list re-orders and only one is still right. |
| `FRAME_BOUNDARY` | A search that dies at an iframe border, then crosses. |
| `TRAP_TRIGGER` | Ordering as correctness: the same two events, and only the order differs. |
| `DIALOG_GATE` · `PICKER_BYPASS` | A native dialog blocking the thread; a file picker sidestepped. |
| `SHOT_SCOPE` · `FLAG_HARVEST` · `TRACE_SCRUB` | Screenshot scope; the flags that produce evidence; a scrubbable recording you can travel backwards through. |
| `MAIL_ROOM` · `SAD_PATHS` | Every request stopping at your desk; the states nobody tests, made cheap. |
| `HAND_STAMP` · `SCOPE_LADDER` | A repeated toll becoming a one-off; how OFTEN a thing runs. |
| `BACKSTAGE_PHONE` | Two routes to the same answer, raced against a clock — the fast one lands mid-queue. |
| `STAGE_HANDOFF` | One job on two transports; only the half under test is lit. |
| `SEARCH_NARROW` | A search that gets SMALLER — the room shrinks, the selector never got longer. |
| `SET_LOGIC` | An operator resolving over a candidate shelf, with a live survivor count. |
| `SEALED_BOX` | Probes piercing a boundary, and the single exception that recoils. |
| `WORKER_SPREAD` | A queue dealt across parallel lanes against a wall clock. |
| `ORDER_ROULETTE` | The same dependent work dealt repeatedly, landing differently every run. |
| `FROZEN_FRAME` | A live run held mid-breath, browser still open, inspector sliding in. |
| `RECORD_DRAFT` | Actions becoming code in real time, then an honest verdict on the output. |

Every one is theme-token'd (reskins across all 30 design packs), gated (`tsc` + manifest/schema/
types drift), lint-blocked, and proofed MIN/MAX/MIX × both aspects × two design packs.

#### Shorts upload kits

`gen-upload-kit.mjs` only ever produced `upload.md` for the long cut, while every `shorts.json`
carried authored `meta.seo` that nothing consumed. It now also writes **`out/upload-shorts.md`**:
short title, hook and payoff, a **▶️ FULL EPISODE** pointer naming the long cut (a feeder short
that never says where the rest lives is a dead end), source credit, `#Shorts`, and the tags block.
No chapters — a sub-60s vertical has nothing to chapter.

#### `meta.seo.sources`

An authored, render-invisible credit for a spec whose only on-screen `data.source` values are
illustrative (the generator correctly rejects `"illustrative"` as non-factual). Previously such an
episode credited nothing in either cut, and the only fix would have been adding an on-screen footer
— i.e. re-rendering a shipped video. Credits now live in spec metadata the upload kit reads.

### Changed — laws, and the guards that enforce them

Five laws were added to `CLAUDE.md`, each mirrored into the director skill, the Copilot
instructions and the linter. Warnings are treated as rejections.

- **LAW 0e — TEACH, DON'T NARRATE.** Measured across 7 shipped episodes: 24 code beats, *not one*
  explained a line; a 12-line block ran at 1.0s per line; 46 sentences ran 22+ words in a breath.
  Now: code the viewer must read is taught line by line at ≥4s per line; the effect is shown, not
  described; a **runtime FLOOR of 5:00** (budget *scenes*, not words per scene); concept beats get
  purpose-built components — reuse of generic cards is the defect; and a series title format is a
  contract once established.
- **LAW 0f — WRITE FOR A MOUTH, NOT A PAGE.** Measured: **0 contractions in 900+ words, every
  episode**; "And" opening 11–15 sentences per script; sentence lengths clustered within ±3 words
  of the mean. The **HUMAN-VOICE GUARD** now measures burstiness (σ), pronoun-opener share,
  repeated openers and contraction rate across the whole spec.
- **LAW 0g — THE FIRST THIRTY SECONDS ARE A CONTRACT.** A viewer arrives carrying an expectation
  set by the title and thumbnail. Three phases: confirm the click (0–5s, no branding — leading with
  it is the most-documented way to lose this window), promise the payoff (5–15s, where a greeting
  is *woven in*, never announced), open a loop (15–30s). Create curiosity and then **satisfy** it;
  that is the only difference between a click promise and clickbait. The **GREETING GUARD** errors
  on a welcome or channel name in scene 1, and warns on a missing greeting, an unmet
  title/thumbnail promise, or an opening containing no question.
- **LAW 0h — THE BACKGROUND MUST NOT MOVE.** A pulsing background shipped behind four episodes
  purely to satisfy a "shift the look once per act" plan. A plan is not a reason to put a large
  moving object behind the thing the viewer is meant to read. The linter warns on `grid-pulse`,
  `ripple`, `wave`, `matrix-rain` and `ember`.
- **LAW 0d — an analogy must be DRAWN, not named.** Recorded failure: a course built on
  *browser = theatre* rendered it as styled rows — but "theatre" means a cinema hall across much of
  the world, so the analogy silently inverted.

### Changed — the scene ceiling is now earned by motion

A flat 16s-per-scene warning was throttling explanation ("our hard limitation on the seconds per
beat is affecting how well we explain concepts"). Root cause: `sync.mjs` never truncated below real
audio, so the *warning* was the only cap — and it was being treated as a rejection. Replaced in
both `lint-spec.mjs` and `sync.mjs` with a ceiling earned by motion: **4s per anchored element past
the first, hard stop 30s**; a static card still gets 16s. The practical consequence is that a
"scene runs long" warning is an invitation to *add* an anchored step (each buys 4s and teaches
another line), not to trim.

### Fixed

- **`CODE_RUN` lit the wrong half of a wrapped line.** A continuation inherits its head's anchor
  and `lit = i === active` picked the LAST member, so the tail lit while the head dimmed and the
  note strip went blank. The whole anchor GROUP now lights.
- **A row travelling by a share of its container's width overruns its target** — use a short nudge
  plus a width change and an edge dock, so a moving element can never leave its container.
- **`flex: 1` across a horizontal lane is an aspect trap** — fine at 1920 wide, truncates every
  label at 1080. Wrap with an aspect-aware `flex: 1 1 <basis>px`.
- **`marginLeft` on a full-width child spills it outside the frame** — an indented level must also
  shrink its `width`.
- **A count rendered as `{n} {label}` printed "1 locators matched".** The linter now warns when a
  `countLabel` cannot survive n=1.
- **A component whose "off" state is only reachable by omitting an anchor still fires on its
  internal default** — check any component with a second phase before authoring a scene that wants
  only the first.
- Empty optional panes now collapse rather than rendering as empty chrome.

### Security

- No change to the secrets posture, re-verified this cycle: `.env` and `.env.*` are ignored
  (`.env.example` is the tracked template), `topics/*` is untracked local content, and the channel
  logo is `skip-worktree`. Channel identity is read from `brand.channel` / `IAUTEUR_CHANNEL` and is
  never hardcoded in shared code — verified by scanning every changed file before commit.

---

## [1.0.0] — 2026-08

Initial public release: MIT licence, channel identity removed from the repo, contributor docs
(`CONTRIBUTING`, `SECURITY`, `CODE_OF_CONDUCT`, issue and PR templates), and third-party terms
moved to `NOTICE.md`.
