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
