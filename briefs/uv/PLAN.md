# uv — course plan

**Series:** `uv Python Tutorial #N — <context>` (keeps the channel's established format;
LAW 0e r.7b makes the format a contract once set).
**Chapters:** 14, numbered **00–13, contiguous** — LAW 0p's corollary: a numbering hole is
a defect, and the MCP series shipped one.
**Slugs:** `uv-00-why-projects-break` … `uv-13-ship-it`, plus `uv-course` for the full cut.
**Audience:** absolute beginner to Python. Chosen deliberately by the owner.
**Design:** `terminalcli` pack. Background must be still (LAW 0h).
**Voice:** `en-US-AvaMultilingualNeural`. **Thumbnail art:** `si:uv` (verified present).
**Format:** long 16:9 + matching 9:16 short per chapter, thumbnail, upload kit.

---

## The one rule this course is built on

Every concept beat is a **PAIR**:

> **the picture, then the proof.**

A drawn object that gives the intuition — then the **real terminal output or real file**
that proves it, from `research/03-real-transcripts.md`.

This exists because the two failure modes are opposite and both are recorded. Analogy
alone is LAW 0d's "a word on screen is not a picture" (vague, the viewer builds it wrong).
Artefact alone is what makes a beginner course cold and unfollowable. The Linux and MCP
cuts got corrected in both directions. Pairing them is the resolution, and it is also why
the premise line (LAW 0l) must stay on screen for the whole chapter: it is the sentence
that keeps the picture and the proof attached to each other.

**No beat ships with an invented terminal transcript.** Everything shown was captured by
running uv 0.12.5. Where a transcript is still missing it is listed at the end of
`03-real-transcripts.md` and must be captured before that chapter is written.

## The trap this course will fall into if nobody stops it

**I watched the shipped Linux masterclass** (87 min, from a backup holding the renders — they are
gitignored, so this was the first time the cut itself could be inspected rather than its
spec). Four frames sampled at arbitrary points, 240s / 900s / 2400s / 4000s. **All four
were the same picture:**

> a **terminal pane on the left**, and on the right a bordered box titled in caps
> containing **seven or eight rows of text that light up in sequence**.

That is verbatim LAW 0n — *"a bordered box containing rows of text that light up.
Different data, identical picture."* LAW 0n was written on 2026-08-21 about the MCP cut;
the Linux cut has the same disease, and it is the course the owner held up as the example
of how many rounds it took to get right. Two further faults visible in the same frames:

1. **The left pane was completely empty in two of the four** — no prompt, no command, a
   blank 40% of the screen. Whatever second you land on, one pane is often doing nothing.
   That is LAW 0i's defect restated: one pane idle while the other steps.
2. **Both panes underfill.** Content sits in the top half; the bottom third is black.
   LAW 0o fixed panes overflowing — this is the same measurement failure inverted, and a
   dark panel on a dark ground reads as "unfinished slide", not as breathing room.
3. In the `awk` frame, the title promised *"awk splits a line into fields"* and labelled
   `$1 $2 $3` — **with no line on screen to split.** LAW 0k's corollary exactly: a card
   that quotes a source must show the source.

Sampling caveat, stated honestly: **four frames of an 87-minute video is indicative, not a
census.** The programmatic contact-sheet sweep is what would prove the rate. But four for
four is more than enough to set the rule, because uv is at *maximum* risk here — a CLI
tool, taught on the `terminalcli` pack, is precisely the setup that drifts into
terminal-left / list-right and never leaves.

### The rule

**THE RIGHT PANE IS NOT A LIST. If a beat's second pane is rows of text, the beat is not
designed yet.**

- The terminal pane earns its place only when a **real command with real output** is in it,
  and it must be doing something for most of the scene — not empty at the top and frozen
  after 11%.
- The other pane holds **the object**: a parcel, a shelf, a rack, a bracket on a number
  line, a folder opening. If the honest answer to "what object is it" is "rows saying what
  is happening", cut the beat and design it again.
- **Two panes is not the only layout.** The strongest beats in this course — the lone
  script that runs itself, the resolver refusing — want ONE full-bleed picture, not a
  split. Do not inherit the split as a default just because the previous course used it.
- Explanatory text belongs in the **narration**, which is where it costs nothing. Putting
  it on screen as a lit row is how a beat looks busy while teaching nothing.

## The spine analogy — established in 00, carried to 13

Physical, culturally neutral, every element an object that can move (LAW 0d, LAW 0j):

| Idea | Object on screen |
|---|---|
| a package | a sealed **parcel** with a printed label: name + version |
| a dependency | opening the parcel reveals a **note listing more parcels** |
| the shared install location | one **shelf** every project reaches into |
| the collision | two projects grabbing **the same slot**, one label overwriting the other |
| a virtual environment | **a shelf per project**, walled |
| `uv run` | the thing that **walks you to the right shelf** before you do anything |
| the lockfile | a **packing list** with exact IDs and seals (the sha256) |
| the resolver | brackets on a **number line** that must overlap |
| the cache | a **local depot**; the second delivery is instant |
| a tool | a machine **wheeled in and out** (uvx) vs **bolted to the floor** (tool install) |
| Python versions | a **rack of engines**, one tagged to the project |

Established explicitly in 00 with the words said out loud ("Picture a shelf…"), never
assumed later. Cross-references say "the previous chapter", never "last episode"
(LAW 0l corollary — a course is not a concatenation).

---

## The chapters

Each row: what the title promises → what beat one delivers (LAW 0p) → the real artefact.

### 00 — Why your Python projects keep breaking
**Promise:** the thing that has been going wrong, named at last.
**Opens on:** the breakage, not on uv. A limitation the viewer can feel comes before any
feature (LAW 0p). uv is not mentioned until the final beat, as the answer to a question
the viewer is now holding.
**Teaches:** what a package is · what a dependency is · that one package drags in others ·
why two projects on one machine fight · that the fix is a *folder*, and almost nobody made
one by hand.
**Real artefact:** `uv add rich` → **five** `+` lines when the viewer asked for one package.
That is transitive dependency, shown before it is defined.
**Builds:** `PARCEL_LABEL`, `DEPENDENCY_UNFOLD`, `SHELF_CLASH`.
**Closes the loop with:** "one command, and you never think about this again."

### 01 — Installing uv, and the chicken-and-egg problem it solves
**Promise:** installed and working — and you will understand what you just ran.
**Owner ruling (2026-08-21): installation IS a lesson.** My first draft treated it as
four minutes of housekeeping and proposed folding it into 00. That was wrong, and the
reason it was wrong is the actual spine of the chapter:

> **A tool that installs Python cannot itself require Python.**

That is a real idea, a beginner can hold it, and everything else in the chapter hangs
off it. `pip` lives *inside* a Python installation — so pip can never fix a broken or
missing Python, because it needs one to run. uv is a **Rust binary that sits beside
Python**, which is why one line of curl works on a machine with no Python at all.
Chapter 04 later downloads a whole CPython on demand; that is only possible because of
what this chapter explains.

**Teaches:** what the standalone installer actually is (a binary, not a package) ·
**why `pip install uv` is the worst of the routes** — it puts uv inside the very thing
uv exists to manage, and it is the one route where `uv self update` then fails ·
what `curl … | sh` really does and why a beginner should be able to read it before
running it · **PATH** — what it is, why the installer edits a shell profile, and why the
terminal must be restarted (every beginner hits this) · verifying with `uv --version` and
reading the build hash and date · where things land (`uv cache dir` / `tool dir` /
`python dir`, Windows AND Unix) · that uninstalling is three commands, not a control panel.
**Real artefact:** the three `dir` outputs on both platforms, and a real `uv --version`
line including the commit hash and build date.
**Builds:** `BOOTSTRAP_PARADOX` (pip drawn *inside* the Python it depends on, and dying
with it; uv drawn *beside* it, still standing) and `INSTALL_ROUTES` (several roads, one
destination, the viewer's OS road lighting — and the pip road marked as the trap).
**Runtime:** comfortably ≥5:00 once the paradox is taught properly. It is not filler.

### 02 — Run any Python tool without installing it
**Promise:** use a tool you have not installed.
**Teaches:** `uvx` ≡ `uv tool run` (exactly) · the environment is built in the cache and is
disposable · `uvx ruff@0.3.0` / `@latest` · `--from` when command ≠ package
(`uvx --from httpie http`) · `--with` · from git.
**Real artefact:** **`uvx ruff --version`: 5.792s cold, 0.294s warm.** Measured here.
Both timings on screen. This also plants the cache loop that chapter 11 closes.
**Builds:** `EPHEMERAL_BAY` (mode: dissolve).

### 03 — Tools you actually keep
**Promise:** when to install instead of borrow.
**Teaches:** `uv tool install` · the tool dir · symlink on Unix / copy on Windows · PATH and
`uv tool update-shell` · `list` / `upgrade` / `upgrade --all` / `uninstall` · constraint
syntax differing from uvx's `@` · **"installing a tool does not make its modules available
in the current environment"** — the most common beginner misunderstanding here ·
"tool environments are not intended to be mutated directly".
**Real artefact:** `uv tool list` + the shim's real path. *(capture pending)*
**Builds:** `EPHEMERAL_BAY` (mode: dock — same component, second mode; the two modes ARE
the argument, so this is one build reused *as a contrast*, not a generic reuse).

### 04 — A script that installs its own dependencies
**Promise:** one file, no setup, it just runs.
**Teaches:** `uv run script.py` · `--with rich` for one invocation · PEP 723 `# /// script`
inline metadata · `uv init --script` · `uv add --script` · the shebang
`#!/usr/bin/env -S uv run --script` · `uv lock --script` · **"the project's dependencies
will be ignored"** when inline metadata is present.
**Real artefact:** the whole capture #12 — `uv init --script --python 3.12` **downloading a
21 MiB CPython on the spot**, then `uv run demo.py` going from nothing to output in
**1.824s**. The strongest single demo in the course.
**Builds:** `SCRIPT_SELFCONTAINED` (the header lifts off the file and becomes the
environment that runs it).

### 05 — Let uv own your Pythons
**Promise:** stop installing Python by hand, ever.
**Teaches:** managed vs system · **"uv will automatically download Python versions when
they are required"** · `uv python install 3.12` / multiple / `pypy@3.11` · `uv python list`
· `uv python pin` and `.python-version` (searched in this dir and every parent) ·
`python-build-standalone` (not python.org) · `--default` and why bare `python` is not on
PATH by default · **"uv will use the first compatible version — not the newest"**.
**Real artefact:** the real `uv python list` rack — 3.15.0rc1 down to 3.8, freethreaded
variants, pypy, graalpy, `<download available>` vs real paths. ⚠ **Scrub any real install path.**
**Builds:** `INTERPRETER_RACK`.

### 06 — Your first real project
**Promise:** a proper project, made for you.
**Teaches:** `uv init` · every file it writes and what each one is for · `pyproject.toml`
line by line (LAW 0e r.2: ≥4s per taught line) · `--app` vs `--lib` vs `--no-package` vs
`--bare` · `[project.scripts]` and `uv run hello-world`.
**Real artefact:** capture #1 verbatim. ⚠ **The `authors` line carries the owner's real
name and email — replace with `Ada Lovelace <ada@example.com>` on screen.**
**Say out loud:** *"Prior to v0.12, uv did not define a build system for applications by
default"* — every older tutorial shows a different tree, and a beginner who sees the
mismatch assumes they broke something.
**Builds:** `PROJECT_TREE_GROW`.

### 07 — Adding dependencies
**Promise:** add a package properly, and see what it costs.
**Teaches:** `uv add` · **`uv add rich` writes `rich>=15.0.0`, a lower bound, NOT a pin** —
beginners assume it pins · `uv add --dev` → `[dependency-groups]` · `--group` · `--optional`
· `uv remove` · reading `+` / `~` / `Uninstalled` in the output · `uv tree`.
**Real artefact:** the real `uv tree`, where **`pygments` appears under both `rich` and
`pytest`** — one copy in the environment, two packages needing it. Shared dependency,
drawn by the tool itself on real data.
**Builds:** `DEP_GRAPH_LIVE` (LAW 0k: declared parentage, visible edges, the version
badge ON the node — all four DSA failures were exactly this).

### 08 — What a virtual environment actually is
**Promise:** the thing everyone told you to make and nobody explained.
**Why it exists:** this is the owner's own five-year gap and the emotional centre of the
course. It is deliberately placed AFTER the viewer has already been using `.venv` without
knowing — so the chapter explains something they already own (LAW 0g r.3).
**Teaches:** it is a folder, nothing more · `pyvenv.cfg` · `Scripts/` vs `bin/`,
`Lib/` vs `lib/` · `site-packages` is just folders · `uv venv` · activation per shell ·
**activation vs `uv run`, and why `uv run` is the answer** · discovery order
(`VIRTUAL_ENV` → `CONDA_PREFIX` → `.venv` here or in a parent) · why `.venv` is not
committed, and that uv writes the `.gitignore` itself.
**Real artefact:** capture #8 — the real six-line `pyvenv.cfg`. **`include-system-site-packages
= false` IS the isolation**, and it goes on screen at the moment the question is asked.
**Builds:** `VENV_ANATOMY`.

### 09 — The lockfile, and why your teammate gets the same thing
**Promise:** identical installs on every machine.
**Teaches:** locking ≠ syncing · `uv.lock` is TOML, committed, never hand-edited · the
sha256 is *which exact bytes*, not just which version · when the lockfile goes stale (and
that **loosening a constraint that still admits the locked version does not**) · **uv
ignores new releases until you explicitly upgrade** · `--locked` / `--frozen` / `--no-sync`
· **`uv sync` is `--exact` by default and REMOVES extra packages**.
**Real artefact:** capture #6 (real hashes) and #7 (`Checked 13 packages in 3ms` — what a
no-op sync looks like).
**Builds:** `PACKING_LIST` and `TWO_MACHINES`.

### 10 — How uv chooses versions
**Promise:** what happens when two packages disagree.
**Teaches:** resolution defined · highest (default) / `lowest` / `lowest-direct` · universal
(projects) vs platform-specific (pip interface) · markers · reading a conflict.
**Real artefact:** capture #13, **verbatim** — uv narrating its own reasoning:
*"Because pytest>=9.1.1 depends on pluggy>=1.5,<2 and your project depends on pluggy<1.0,
we can conclude that…"*. Do not paraphrase it and do not invent a tidier one. The animation
is handed to us: two bracket ranges on one version line that fail to overlap.
**Also:** the docs' own worked example (foo needs `lib>=1.0.0`, bar needs `lib>=2.0.0` →
`lib 2.0.0`) as the *succeeding* case, shown first so the failure has a baseline.
**Builds:** `CONSTRAINT_LINE`.

### 11 — Why it is this fast
**Promise:** the honest reason, not a benchmark graphic.
**Teaches:** what is cached and keyed on what (HTTP headers / URL / **git commit hash** /
mtime / immutable filename) · it stores built wheels too, so C extensions are not recompiled
· `cache-keys` · `uv cache clean` / `clean <pkg>` / `prune` / `prune --ci` / `dir` ·
versioned buckets so several uv versions share one cache.
**Real artefact:** the 5.792s → 0.294s pair from chapter 02, now explained. Closes the loop
opened there — LAW 0g r.2: every loop opened must be paid off.
⚠ **The only doc-sourced speed claim is the homepage's "10-100x".** `/reference/benchmarks/`
has no figures at all. State the measured pair as measured-on-this-machine and attribute the
10-100x as Astral's claim, on screen, or leave it out.
**Builds:** `DEPOT_SHORTCUT`.

### 12 — Coming from pip
**Promise:** everything you already know, translated.
**Teaches:** `uv pip install` as the familiar door · `uv venv` · `uv pip compile` / `sync`
replacing pip-tools (and that **compile prints unless you pass `-o`**) · `uv pip install`
vs `uv pip sync` (leftovers vs exact) · migrating: `uv init` + `uv add -r requirements.in`,
`-c` to preserve pins, `--dev`, `--group` · the mapping requirements.in → `[project.dependencies]`,
requirements.txt → `uv.lock`.
**Then the sharp edges**, from the 18 documented divergences — pick the ones that bite a
beginner: no `--user` · ignores `pip.conf` and `PIP_INDEX_URL` · requires a venv ·
no `.pyc` at install time · **`requires-python` upper bounds ignored entirely** ·
"stricter than pip, and will often reject packages that pip would install".
**Builds:** `STRICT_GATE` (one parcel, two gates: pip waves it through, uv stamps it with
the reason). ⚠ Do **not** build a two-column ledger of all 18 — that is LAW 0n's
"rows of text that light up". Depict two or three concretely; list the rest in the
description and the flashcards.

### 13 — Ship it
**Promise:** your code, installable by anyone.
**Teaches:** `uv build` → `dist/` · sdist and wheel, and that the **wheel is built from the
sdist** (the output says so) · `--no-sources` before publishing and why · `uv version`
/ `--bump minor` / `--dry-run` · `uv publish` with `UV_PUBLISH_TOKEN` · Trusted Publishers
(no credentials at all) · verifying with
`uv run --with <pkg> --no-project -- python -c "import <pkg>"`.
**Real artefact:** capture #14 — real filenames and sizes
(`hello_world-0.1.0-py3-none-any.whl`, 1614 bytes).
⚠ **LAW 11.** Never run `uv publish` against real PyPI, never with a live token, never echo
one. TestPyPI or a dry run only. No token-shaped string on screen, ever.
**Builds:** `DIST_OUTPUT`.

---

## Components to invent

Written per LAW 0e r.1 / SKILL §4(a2): **this is the ideal-component description, written
before opening the library.** `node scripts/cast.mjs` runs next and each of these is the
ACCEPTANCE TEST a library candidate has to pass at ~90%, not a decision already made.

LAW 0n's test applied to every row: *name the OBJECT the viewer sees.* If the answer were
"a row that says X" it would not be on this list.

| # | Component | The object, and what MOVES |
|---|---|---|
| 1 | `PARCEL_LABEL` | A sealed parcel with a printed label. The label's **version field** is the moving part — it changes and the parcel is a different thing. |
| 2 | `DEPENDENCY_UNFOLD` | The parcel opens; a folded note extends listing three more; three more parcels arrive and stack. Real data: rich → markdown-it-py → mdurl, + pygments. |
| 3 | `SHELF_CLASH` | One shelf, two projects reaching in. Both target one slot. The version tag flips; the first project's run turns red. **The failure is the animation**, not a caption about failure. |
| 4 | `INSTALL_ROUTES` | One destination, several roads, the viewer's OS road lighting. One road (`pip install uv`) is marked as the trap and leads back into the thing being escaped. |
| 4b | `BOOTSTRAP_PARADOX` | pip drawn **inside** a Python installation, tethered to it — the Python is removed and pip goes with it. uv drawn **beside** it, unaffected, still able to put a new Python back. The chapter-01 idea, and nothing on screen is a text row. |
| 5 | `EPHEMERAL_BAY` | *Two modes.* **dissolve**: a machine wheels into a bay, runs, and the bay empties. **dock**: it bolts down and a shim arm extends out to PATH. The modes are the uvx-vs-install argument (the `CHANGE_RIPPLE` pattern). |
| 6 | `SCRIPT_SELFCONTAINED` | A real `.py` file. Its `# /// script` header **lifts off the page**, becomes a small environment beside it, and the file runs inside it. |
| 7 | `INTERPRETER_RACK` | A rack of engine blocks labelled 3.10 … 3.15, pypy, graalpy. Some solid (installed, real path), some ghosted (`<download available>`). One is pulled and a `.python-version` tag clips onto the project. |
| 8 | `PROJECT_TREE_GROW` | A file tree that **grows file by file** as init runs, each file's real content appearing in it. Structure declared, data on it (LAW 0k). |
| 9 | `DEP_GRAPH_LIVE` | The real `uv tree`, as a graph: declared parentage, **visible** edges in user units, the version badge **on** the node. `pygments` drawn once with **two** edges into it — the shared-dependency payoff. |
| 10 | `VENV_ANATOMY` | The `.venv` folder opening: Scripts/ Lib/ pyvenv.cfg. `pyvenv.cfg` unfolds to its six real lines and `include-system-site-packages = false` is the one that lights. |
| 11 | `PACKING_LIST` | A packing list where each row carries a **seal** (the real sha256). The seal is checked, not just the name. |
| 12 | `TWO_MACHINES` | Two machines, one list travelling between them, both shelves ending identical. Then one machine ignores the list and drifts — the contrast is the lesson. |
| 13 | `CONSTRAINT_LINE` | A version number line. Bracket ranges slide on from each requirer. **Overlap → a pin drops in. No overlap → the brackets stop short of each other** and uv's real error text is what explains it. |
| 14 | `DEPOT_SHORTCUT` | First request goes out to the network, slow, with a live stopwatch. Second request short-circuits to a local depot. **Two real timings on screen: 5.792s and 0.294s.** |
| 15 | `STRICT_GATE` | One parcel, two gates side by side. pip's gate opens. uv's gate stamps DENIED with the actual reason. Concrete, two or three cases — never all 18 as rows. |
| 16 | `DIST_OUTPUT` | A source tree compressed into an sdist; the sdist **opens and produces** the wheel (real ordering); both land in `dist/` with real filenames and byte sizes. |

**Reuse policy.** Structural furniture (`HOOK`, `TITLE_CARD`, `CHAPTER`, `RECAP`,
`OUTRO_CTA`, `QUIZ_CARD`) and `CODE_RUN` / `BROWSER_STEP`-equivalents are exempt and
expected. Everything else: a concept beat that reaches for a generic card is the defect
(LAW 0e r.8). `EPHEMERAL_BAY` appearing in both 02 and 03 is a **contrast**, not a reuse —
its second mode is the argument of chapter 03.

**Before writing any component:** `component_authoring.md`, eight touchpoints, theme tokens
only (it must reskin across all 30 packs), a linter validation block sized to the 9:16
container, and `showcaseSpec.ts`. And **LAW 0n's three-for-three bug**: when an item type
gains a field, grep every `.map((c) =>` in `src/scenes/` before rendering anything.

---

## Verification, before a single render

Non-negotiable, and it is the cheapest thing in this whole plan:

1. Bundle once (`remotion bundle`), then `remotion still <bundle> <comp> --frame=N`.
2. **2–3 frames per scene, BOTH aspects**, into contact sheets.
3. **Scan them programmatically**, not by eye — a script found 6 of 6 defects where
   eyeballing a sheet found 2 (LAW 0k corollary, LAW 0n corollary).
4. Specifically assert: no content outside its pane (LAW 0o), no icon fell back to the
   generic glyph, and for LAW 0i — pick two adjacent anchors in a **synced** spec, render
   both frames, and confirm the element that should still be dark IS dark.

A render is hours. A still is two seconds.

---

## Flashcards

Two different artefacts, deliberately not the same thing:

**A · The study deck** — `briefs/uv/flashcards/<slug>.tsv`, in the owner's specified format:
one card per line, `Question<TAB>Answer`, no numbering, no labels, no other formatting.
Mixed types across each deck — definition, application, comparison, example. Long ideas
split across several small cards. No filler, no anecdotes. Shipped as a companion link in
the description and the pinned comment.

**B · The on-screen quiz** — a different shape, governed by LAW 0e-q. A quiz with no
thinking gap is not a quiz:

> question → **pause invitation (~4s of words that give nothing away)** → `Ready?` →
> answer + why, with `revealAtWord` anchored on `Ready?`

`lint-spec.mjs` enforces ≥9 words and a real pause cue between the question mark and the
reveal, pre-sync. Do not let a squeezed scene eat the pause — that is the failure that law
records, and it happened because the pause is the only part carrying no information.

---

## Narration rules specific to this course

On top of LAW 0f (name the subject, contractions, burstiness, teach don't narrate):

- **No jargon before it is built.** "Dependency", "environment", "resolver", "lockfile",
  "wheel", "index" each get a plain sentence of their own the first time, with the picture
  already on screen. The owner's brief: *avoid jargon where possible*, absolute beginner.
- **Never say "it"** when the screen holds a parcel, a shelf and a file. Say *the parcel*,
  *that lockfile*, *your project*, *uv*.
- **The `>=` surprise, the `--exact` removal, and "installing a tool does not make its
  modules importable"** are the three things a beginner gets wrong. Say each one twice.
- The owner has used pip for five years and never made a venv. That is not an unusual
  viewer — it is the *typical* one. Nothing in the narration may imply they should
  already have known.

---

## Status

**Done:** 85 doc pages enumerated, ~20 read in depth, facts recorded with sources, and
14 real transcripts captured by running uv 0.12.5 in an isolated sandbox.

**Next, in order:** capture the remaining transcripts listed at the foot of
`03-real-transcripts.md` → beat map for 00 → `cast.mjs` against these 16 descriptions →
`casting.md` with a written reason per beat → build the components that survive that →
spec → voiceover → sync → lint → stills → render.

**Decided by the owner, 2026-08-21:**
- **Chapter 01 stays, and installation IS a lesson.** I was wrong to propose folding it.
  Rewritten around the chicken-and-egg problem — a tool that installs Python cannot itself
  require Python — which is a real idea, carries a real component (`BOOTSTRAP_PARADOX`),
  explains why `pip install uv` is the trap route, and sets up chapter 04's on-demand
  CPython download. Comfortably ≥5:00 once taught properly.
- **`uv-course` full cut is wanted.** A single stitched cut via
  `scripts/build-course-cut.mjs`, as `mcp-course` and `dsa-dojo-course` already do. One
  extra render pass, no extra authoring. Build it last, after all 14 chapters are final —
  a course cut assembled from chapters that later change is wasted hours.

## Calibration note — expect to BUILD far fewer than 16

`topics/linux-commands-masterclass/component-register.md` opens with its own correction:

> *"This register specified 98 new components. The shipped video does NOT follow it: it
> was built from the 195 components already in the library plus **6** new ones … and
> reaches 62 distinct components across 129 scenes."*

98 planned, 6 built. That is the honest prior for this plan's 16. The 16 descriptions are
the **acceptance test**, not a build list — `cast.mjs` runs first, an existing type is cast
where it matches ~90%, and only the genuine gaps get built. Expect single digits.

But note *which* correction the Linux course did **not** make: it reused the library
heavily and still shipped the lit-rows template in four of four sampled frames. **Reusing
more is not the same as depicting better.** The number to optimise is not "how few new
components" — it is "how many beats show an object". Both failures are on the record now:
over-building a register nobody follows, and under-designing the beats that get reused.
