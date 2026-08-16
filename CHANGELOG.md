# Changelog

All notable changes to iAuteur are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Scope note.** iAuteur is a video *factory*: the repo ships the engine (components, linter,
> pipeline scripts, design packs) — the videos themselves live in `topics/`, which is local
> content and deliberately untracked. Entries below describe engine changes. Where a rule was
> learned by shipping a real series, the measurement that produced it is recorded, because the
> measurement is the part that generalises.

---

## [Unreleased]

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
