# CLAUDE.md — read this FIRST; it replaces exploration

This repo is a video factory: JSON specs in `topics/<slug>/` → Remotion renders them. You (Claude) write specs and run scripts. You NEVER hand-edit component code during video production, never hand-write derived files, never overwrite an existing topic.

> **Then read [`docs/STATE.md`](docs/STATE.md).** This file is the LAWS (what you must always do);
> STATE.md is the CURRENT SITUATION (what exists today, where it lives, which gotchas have already
> cost time, and what's in flight). Update STATE.md in the same commit as the work it describes —
> that is what makes the next session, on any machine or tool, cheap. Copilot users:
> `.github/copilot-instructions.md` points here.

## LAW 0 — THE INTERVIEW GATE (recorded failure 2026-07-17: a session skipped this and self-picked everything)
When the user asks for a video — ANY phrasing — your FIRST action, before scaffolding, research, or writing a single scene, is ONE batched AskUserQuestion round covering everything their message didn't already answer:
1. **format** — long / shorts / both (default: both)
2. **target minutes** (default: 4–5 for long)
3. **design pack** (default: **moderndark** — the user's standing default; vary the background + scene mix between consecutive videos so they don't look identical)
4. **voiceover** — yes/no + voice (default: **en-US-AvaMultilingualNeural**, the user's confirmed favourite — it reads as a person, not a synthesiser)
5. **thumbnail art** — real brand logo via `si:` / user-supplied image / set-piece still (NEVER default to a generic lucide glyph)
Show the default on every option. "Use defaults" fills the rest — but the user must be ASKED, never silently defaulted. Skip only the questions their request already answered.

## STANDING DEFAULTS (the user's own — override only if they say so)
- Channel: whatever `references/channel_profile.md` says (unfilled default: **YOUR CHANNEL**) · logo:
  `public/assets/channel_logo.png` — ships as iAuteur's own mark; drop your own PNG in at that path to rebrand
  every video at once
- Design/theme when unspecified: **moderndark** · Voice: **en-US-AvaMultilingualNeural** (edge-tts)
- **`brand.logo: "img:channel_logo.png"` in EVERY spec** — it drives the in-video watermark (bottom-right wide / top-left vertical), the thumbnail + cover stamp, and the OUTRO_CTA subscribe circle. new-topic scaffolds it; never delete it.

## LAW 0c — COMPONENTS ARE CAST PER BEAT, NEVER ONE-SHOT
Scene types are chosen via the CASTING BOARD, one beat at a time — never in a single pass from memory (measured result of one-shot: 81 of 137 components never used, picks biased to the top of the catalog). Flow: beat map → `node scripts/cast.mjs <beats.json>` → pick per beat with a stated reason into `topics/<slug>/casting.md` (≥2 ★NEVER-USED picks when honest fits exist) → only then write scenes. `node scripts/snap.mjs <url> <file> "<note>"` captures reference-page screenshots so the media components are usable. For long videos, cast per chapter with a fresh subagent per act reporting to the master. Full recipe: director skill §4.

## LAW 0d — TEXT IS NOT A VISUAL; AN ANALOGY MUST BE DRAWN, NOT NAMED (2026-08-09)
Styled words + narration is the WEAKEST beat you can ship — it makes the viewer build the picture,
and they build it from their own life, not yours. Before casting any explanatory beat, answer three
questions: (1) **would it still teach with the sound off?** (2) **could a viewer elsewhere in the
world picture the wrong thing?** (3) **is anything moving, and is the motion the explanation?**
Recorded defect: a course built on *browser = theatre, page = stage, locator = spotlight* rendered
those as styled rows — but **"theatre" means a cinema hall in India and much of the world**, so the
analogy silently inverts and every later lesson inherits the error. Any analogy resting on a
cultural referent (theatre, baseball, diner, commute) must be DEPICTED — a live stage with curtains
and a spotlight travelling to an actor — never merely captioned. When existing components can only
render the idea as text, that is the trigger to BUILD one (LAW 6 + `component_authoring.md`), not to
settle. Prefer animated, theme-token'd, voice-synced components over any static card. Full rule +
the worked case: director skill `references/scene_library.md` → "A WORD ON SCREEN IS NOT A PICTURE".

## LAW 0e — TEACH, DON'T NARRATE (owner verdict on a shipped course, 2026-08-13)
For any TUTORIAL / course video, narrating *about* code is not teaching it. Measured failure across
7 shipped episodes: 24 code beats, **not one explained a line**; a 12-line block ran at **1.0s per
line**; output never sat beside the line that produced it; 46 sentences ran 22+ words in one breath;
and `words × 9.5 + 30` left exactly **1 second** of silence per scene, so nothing was ever left on
screen to look at. Binding rules:
1. **INVENT FIRST, CAST SECOND.** The casting board opens by DESCRIBING the ideal component for the
   beat, before looking at the library. Cast an existing type only if it matches ~90%; otherwise
   build it (LAW 6 + `component_authoring.md`). Reuse from the previous episode needs a written
   reason it is still the best shape — "it fits" is not one.
2. **Code the viewer is asked to read is taught LINE BY LINE** — `CODE_RUN` (each line its own
   anchor + a plain-English note + its result beside it), **≥4s per taught line**; the linter warns
   below that. `CODE_WINDOW` is only for a block nobody is being asked to read.
3. **Show the effect, not a description of it** — `BROWSER_STEP` (the page is built from the code
   and visibly moves per line), `OVERLAY_BLOCK` (a click intercepted, bouncing off the thing on top).
4. **Author silent look-at-it beats** (2-3s, no narration) when code or a picture lands. The
   pipeline never creates them.
5. **Write for the ear**: sentences ≤14 words (hard cap 18), everyday words, define a term the first
   time in its own sentence, say the key sentence twice, address the viewer ("look at line three").
6a. **RUNTIME HAS A FLOOR, NOT A CAP** (owner, 2026-08-16: *"the video length is becoming much
   smaller than before, which is the opposite of what I asked"*). Measured regression: Act I ran
   **5:02-6:06** (avg 5:20); EP08-11 fell to 4:50 → 3:52 → 3:16 → 3:16. Cause: the >=4s-per-line
   rule plus the scene ceiling capped taught lines per scene at ~4, and I held the SCENE COUNT
   constant instead of growing it — so total teaching shrank by 40%. **Budget SCENES, not words
   per scene.** A long cut lands **>=5:00**; check the builder's pre-sync estimate BEFORE voicing
   (sync lands within ~5% of it) and, if short, add the beats you were folding in — never padding.
   Every lesson has more teachable ideas than the cut is using; go back to the source and count.
6. **No runtime cap on a lesson**, and **no flat 16s cap on a beat** (amended 2026-08-15 —
   *"our hard limitation on the seconds per beat is affecting how well we explain concepts"*).
   The scene ceiling is now EARNED BY MOTION: a stepping scene gets 4s per anchored element up
   to 30s; a static card still gets 16s. See the STATIC-SCENE GUARD in `scripts/lint-spec.mjs`
   (mirrored by the settle `cap` in `sync.mjs`). Note `sync.mjs` never truncates below the real
   audio, so a long read always played in full — it was the WARNING that was capping the teaching.
7. **Judge twice before shipping**: as a school owner watching a teacher, and as an absolute
   beginner. If the beginner cannot follow, it is a DEFECT.
7b. **A SERIES TITLE FORMAT IS A CONTRACT.** Once a playlist establishes one, every later
   episode keeps it. Recorded break: EP01-08 shipped `Playwright Python Tutorial #N — <context>`
   and EP09-11 silently dropped the prefix, so the playlist stopped scanning as one course.
   `meta.seo.title` is authored per episode — check it against the previous episode's, not against
   what reads well alone. (Shorts keep their own convention: `<hook> #playwright #python`.)
8. **Concept beats get a PURPOSE-BUILT component — reuse is the defect** (owner, 2026-08-15:
   *"I am bored seeing all the same components again and again when you are explaining important
   concepts"*). Named offenders: `STICKY_NOTE` (27 uses), `REVEAL`, `SPLIT_PATHS`, `ICON_GRID` —
   the generic cards that got cast for the definition, the memory hook and the comparison in
   every single episode. Exempt: structural furniture (`HOOK`, `TITLE_CARD`, `CHAPTER`, `RECAP`,
   `OUTRO_CTA`, `QUIZ_CARD`) and `CODE_RUN`/`BROWSER_STEP`, which rule 2/3 mandate. Expect
   **2–4 new components per episode**, not zero. A card that only PRINTS the idea is not a
   visual — build the one that ENACTS it (RULE_TEST judges the rule; SAVED_SEARCH shows the
   un-run query; RESPONSIBILITY_SPLIT files the real lines).
Full case + the measurements: `docs/PLAYWRIGHT_DOJO_SERIES.md` §4c.

## LAW 0i — THE PICTURE MOVES WITH THE VOICE (owner verdict, 2026-08-17 → 2026-08-18)
Owner, on a shipped 38-minute cut: *"The voice just narrates its content, but the actual
animation on screen? Still going on. The next cut comes, voice speaks everything, animation
is happening still. This happens for each and every scene cut."* Then, after the first fix:
*"on the left you show a bunch of commands, your left side command animation just completes
quicker, and you are still explaining the first command."*

Two DIFFERENT defects, both measured, both structural:

1. **Components that ignore their own anchors.** The first six command components read only the
   SCENE-level `atWord` and then marched their elements on fixed intervals (`stepLen = 34`,
   `per = 26`, `per = 30`). The per-element `atWord` values authored in the spec — which the
   linter counted to grant the scene its runtime — were never read by the rendering code.
   **Rule: no explanatory component may contain a fixed frame interval.** Every moment resolves
   from an element's own anchor via `wordToFrame`. Resolve a whole list with the PURE helper
   (`liveAt(frame, atWord)`), never a hook inside a `.map()`.
2. **Anchors that all land in the first fifth.** The spec builder consumed markers in a fixed
   ORDER (every terminal step, then every stage element), which forced the author to put all the
   terminal anchors at the front of the sentence. Measured across the whole cut: the terminal
   finished typing at a **median 11% of the narration** in **110 of 110** scenes, then sat frozen
   for the remaining 89% while only the right pane moved. **Rule: markers are TYPED, not
   positional** (`|` step, `^` picture beat, `@` perms, `~` verdict), so a beat can interleave —
   type, draw what it did, type the next. The builder enforces a floor: on a multi-command beat
   the last command lands at ≥50% of the TAUGHT portion (the words up to the last anchor, so a
   proper landing line is not punished); on a single-command beat, ≥22%.

**Prove it before you render.** Pick a scene, compute the absolute frame of two adjacent anchors
from the SYNCED spec, render both stills, and confirm the element that should still be dark IS
dark. A sync claim without two frames behind it is a guess.

## LAW 0j — DEPICT THE MECHANISM, NOT A LABELLED CARD (owner verdict, 2026-08-18)
Owner: *"This is lazy ass animation work, just displaying components and highlighting them while
speaking about it. Does it help? Just showing text and highlighting it DOES NOT WORK AT ALL."*
He was right, and the count is the proof: 110 purpose-registered components were all routing
through **six generic archetypes** (rows, tree, meters, flow, perms, hops). Registering a new
scene TYPE is not the same as building a new PICTURE — the rebuild shipped **56 distinct
depictions** for the same 110 beats.

LAW 0d says an analogy must be drawn rather than named. This extends it to every explanatory beat:
**the thing being taught must be the thing that moves.** A folder tree where a YOU-ARE-HERE puck
walks and the folders stay pinned. Nine permission switches that physically throw and count up to
an octal digit. A signal packet the process catches and saves from, versus one the kernel delivers
past it. Two service switches where a reboot kills only one. If your component would still make
sense with the labels swapped for lorem, it is a card, not a depiction.

Corollary: **the caption is per-beat.** A generic stage title repeated on every scene ("what
happens", 110 of 110) is the same defect in miniature — it tells the viewer nothing and makes the
set look templated. Author one caption per beat, from that beat's subject.

## LAW 0k — DRAW THE STRUCTURE, AND PUT THE DATA ON IT (owner verdict, 2026-08-19)
Owner, on the DSA cut: *"when You show a tree, there must be lines visible right, and there must be
pointers pointing at right place showing the right data somewhat bigger, where in few episodes I
see you are showing numbers at the very bottom very small ... I liked the first episode, then after
that you are just in a hurry."* All of it was true. Four separate failures, one root cause: LAW 0j
was satisfied for the ARRAY family and then generic primitives were reused for every other shape.

1. **A topology must be declared, never inferred from position.** The graph renderer drew an edge
   from every node in one level to every node in the next — a complete bipartite graph, not the
   graph being traced. It happened to look right on a five-node example and would have been
   silently wrong on the next one. Cells now carry `parent` / `links`; a tree recovers parentage
   from the authored depth outline. Declared structure, drawn structure.
2. **An edge has to be visible to be an edge.** The lines were `strokeWidth={0.5}` with
   `vectorEffect="non-scaling-stroke"` in the muted panel-border grey: half a device pixel on a
   dark panel, i.e. nothing. Strokes belong in user units so they scale with the drawing, and an
   edge the voice is talking about takes the accent colour.
3. **The answer goes ON the object, not in a legend.** BFS computes a distance per node; the
   distances were a row of tiny pills along the bottom edge, so the viewer had to match node to
   legend while being talked over. The number now rides on the node as a badge. If a beat has a
   payload, the payload sits where the eye already is.
4. **Components size to the space they are given.** `CellRow` was a fixed 46px cell with 19px type
   and `DpTable` a fixed 42px — a six-cell DP table rendered as a thin ribbon of small numbers in a
   panel with two-thirds of its height empty. Cell height and font are now derived from the item
   count. Same for the cost bars, which stacked against the top edge, and for the code pane, whose
   fixed font silently clipped the first and last lines of an 18-line listing.

Corollary — **a card that quotes a source must show the source.** The problem-intro cards lifted
signal words out of a question that was only ever spoken; the narration said *"circle the words"*
with no words on screen to circle. Owner: *"You are just narrating it thinking that user would
memorize the question or what?"* `DSA_SIGNALS` now takes a `problem` string, on screen unanchored
for the whole beat.

Corollary — **audit by still, not by render.** These shipped because episodes were reviewed as
finished mp4s, one at a time, hours apart. Bundle once (`remotion bundle`), then
`remotion still <bundle> <comp> --frame=N` costs ~2s: 122 trace scenes across 12 episodes became a
set of contact sheets in four minutes, and every defect above is visible in them at a glance.
Review the sheet BEFORE committing hours of render.

## LAW 0l — GIVE THE PICTURE BEFORE YOU USE IT, AND KEEP IT ON SCREEN (owner, 2026-08-20)
Owner: *"you start to speak about houses before you even say what you are actually gonna show. And
there is no text that displays like consider you are in a train, and you are counting houses. You
straight away speak like user already would know about the house concept which is wrong ... you are
not displaying a text that user would often refer to and remember what we are speaking about."*

Sliding Window's hook said *"same houses"* and its cost beat said *"six houses"* — the train and the
houses were not introduced until two scenes later. The analogy was **used before it was given**, in
almost every episode.

Two rules, and they are separate:

1. **Establish, then use.** The first time a beat leans on an analogy, the narration names it
   outright: *"Picture a row of houses, each with a number painted on the door."* An analogy that
   arrives after its own vocabulary is worse than no analogy — the viewer spends the beat working
   out what a house is instead of following the point.
2. **The setup stays on screen.** Every trace pane carries a `premise`: one plain sentence saying
   what the viewer is looking at and what stands for what ("You are on a train. Each box is a house
   you pass; the window shows exactly k = 3 at once"). It is unanchored and constant for the whole
   episode, because its job is to be re-readable at any moment by someone who looked away. The
   per-beat `caption` is a title; the `premise` is the frame. They are not the same field and one
   does not substitute for the other.

Corollary — **an overlay must measure itself from the thing it overlays.** The sliding-window frame
hard-coded `height: 74` while the row beneath it had been made responsive, so the frame rendered
*smaller than the boxes it was supposed to contain*, and its percentage maths ignored the gaps
between cells so it drifted sideways as the window moved. Row geometry now lives in one exported
`cellMetrics()`; the window frame and the pointer rail both measure from it. If you size something
that sits on top of a row, take the numbers from there — never restate them.

Corollary — **a course is not a concatenation.** Episodes that each open *"welcome back to the
Dojo"* and close *"that's the end"* do not become a course when joined end to end. Title cards are
written as CHAPTER openings ("Pattern two: Sliding Window …") which read correctly both standalone
and in sequence, and cross-references say "the previous pattern", never "last episode".

## LAW 0m — SHOW THE REAL ARTEFACT, WITH REAL DATA (owner verdict, 2026-08-20)
Owner, on the shipped Linux masterclass: *"the commands you execute on the left, you show one line
and one description, and that's it ... on the right you say third column, 4th column, on the left I
just see the command executed and there is just one line displaying it."* And: *"you say spikes,
chart, green, red — dude that doesn't even look like a chart, it just looks like a curvy line broken
in middle. But where's the chart???"*

Both are the same failure: a component drawing a PLACEHOLDER where the artefact belongs.

1. **Terminal output is verbatim, and multi-line.** `ls -l`, `vmstat`, `ps`, `df` print a header row
   and columns. If the narration says "the third column", the third column must be on screen to
   point at. Items carry `out?: string[]` — the real shape, header included. Two lines of invented
   output is not a mock, it is a placeholder.
2. **A chart needs DECLARED data and the furniture of a chart.** Never synthesise a shape. A chart
   is a bordered card with a title, a y-axis carrying real numbers and a unit, x-axis ticks,
   gridlines, an optional named threshold, and a read-out. A path with none of that is a squiggle,
   and the viewer can tell.
3. **A depiction must depict the thing named.** The journal was twelve grey bars of random width;
   owner: *"journalctl animation is shitty and not relevant and not understandable."* It is now real
   journald lines, struck through as each filter excludes them, with the surviving count per flag.

Corollary — **vertical holds far less than wide, and the answer is less content, not smaller type.**
Seventeen lines in a Shorts pane forces ~12px, which is unreadable on a phone. Cut steps and trim
output until the type can stay large. Owner: *"viewability is professional and feasible (not too
short for users to stare) ... dont care if length shoots up, the content must be right."*

Corollary — **CAPTURE THE ARTEFACT BY RUNNING THE TOOL. Documentation is a SECONDARY source**
(2026-08-21, authoring the uv course). LAW 0m says show the real artefact; this says where to get
one. A docs page is prose *about* the tool, and it drifts. Measured in a single afternoon's
research: the docs render a build constraint as `<0.13` where the tool writes `<0.13.0`; the
projects guide shows a `.git/` directory that `init` did not create; and the page titled
*Benchmarks* contains **no benchmark numbers at all**, only a pointer elsewhere — so a speed claim
copied from it would have been invented. Install the tool, run every command the course will show,
and paste the transcript. A plausible-looking terminal transcript is the exact failure LAW 0m
exists for, and writing one from a docs page feels like sourcing while producing fiction.
Three rules fall out of it:
1. **Pin the version you teach.** The machine had uv 0.10.9; current was 0.12.5, and v0.12 changed
   what `uv init` writes. Capturing on the stale binary would have taught a file tree that no
   longer exists. Install the exact current release **isolated** (`UV_INSTALL_DIR` into the
   scratchpad) — never upgrade the owner's machine as a side effect of research.
2. **A capture from a real machine carries the operator's identity.** `uv init` stamped the
   owner's GitHub name and noreply email into `pyproject.toml` from the local git config, and the
   interpreter list printed real install paths off a second drive. `briefs/` is TRACKED and the
   repo is PUBLIC. Grep every capture for names, emails and local paths before it is committed or
   drawn (LAW 11, and the brand-identity note under STANDING DEFAULTS).
3. **Never run the destructive or publishing command for a transcript.** `uv publish` against real
   PyPI, with a real token, to get a pretty screenshot, is not a capture — it is a release. Dry-run
   or a test registry, and no token-shaped string on screen ever.

## LAW 0n — A REGISTERED TYPE IS NOT A PICTURE (owner verdict, 2026-08-21)
Owner, on the MCP cut: *"ALL FUCKN VIDEOS have the same container, text, highlight, some arrows,
highlights speak ... thats boring af. And its the same thing that I repeatedly asked not to do in
the linux course, and you again started doing the same."* He was right, and it is the SECOND time:
LAW 0j was written for exactly this and I reproduced the defect in a new repo area.

The measurement: fifteen registered MCP scene types, and thirteen of them rendered the same
archetype — **a bordered box containing rows of text that light up**. Different data, identical
picture. Registering a scene TYPE, adding a data key and wiring eight touchpoints is plumbing; it is
not a depiction.

**The test, before you write the component:** name the OBJECT the viewer should see. If the answer
is "a row that says X", stop — that is a caption. A protocol message is an envelope crossing between
two machines. A file permission is a folder, a key, and a shield that stamps DENIED. A transport is
a laptop and a cable, or a laptop and a globe and a server. A deprecation is a warning triangle, a
clock, and an arrow to its replacement.

**Use the icon libraries — they are already wired.** `AssetIcon` takes `lucide:<name>` and
`si:<brand>`; items carry an `icon` field. A checklist of four things renders as four DIFFERENT
recognisable objects (`si:python`, `lucide:package`, `si:anthropic`, `lucide:key-round`), never four
copies of the same generic glyph. When every item falls back to the default box, that is the smell.

Corollary — **scan for the fallback, do not eyeball it.** After wiring icons, six cells still
rendered as a generic cube because nobody had named a glyph for them. One script over every
control-board cell found all six; reviewing frames by eye had found two.

Corollary — **the field-dropping bug is now three-for-three.** Scene components map cells
explicitly, and each new field must be added to every mapping or it silently never arrives:
`parent`/`links` on the DSA cut, `out`/`series` on the Linux cut, `icon` here. When you add a field
to an item type, grep every `\.map((c) =>` in `src/scenes/` before you render anything.

Corollary — **count SCENE TYPES against PICTURES, and plan the smaller number.** The Linux
course registered 116 `CMD_*` scene types; all of them are thin wrappers that pick a string from one
shared registry of 56 depiction kinds, drawn by one shared two-up shell. Its own component register
opens by admitting the gap: *98 new components specified, 6 actually built.* A plan expressed in
scene types is therefore a plan of plumbing, and it will over-promise by an order of magnitude.
The uv course adds **ONE** scene type (`UV_STAGE`) and grows `src/uvViz.tsx` instead — the budget
you commit to is the number of distinct PICTURES, and it is the only number worth planning.

Corollary — **an unregistered kind must be loud.** All three viz dispatchers used to substitute a
real picture for a kind they did not know (`?? FileContent`, `?? SignalMatch`, `?? ControlBoard`),
so a one-character typo produced a confidently-drawn WRONG picture that passed tsc, passed the
linter (the kind is chosen inside the component, never in the spec) and rendered fine.
`src/unknownKind.tsx` now renders the failure in semantic red; `scripts/check-viz-kinds.mjs` catches
it before any render. A seal like that must be tested by BREAKING a real file on purpose — the first
version of that script reported a green tick while blind to 110 of 140 call sites.

Corollary — **`Math.min(budget * f, CONST)` — the CONST must never be the binding term.**
Every depiction caps its size against a constant so it stays sane when crowded. That
constant is a CEILING for the crowded case; the moment it binds in the ordinary case the
picture floats in a pane two to five times its height, which is the "patty inside a
burger" complaint. Five of eight uv depictions shipped that way on the first pass —
`pkg-index` drew its warehouse wall at 24% of the pane's height. **`scripts/pane-fill.mjs`
measures the ink box against the pane and prints the fraction**; run it on every new kind,
at both aspects, because a contact sheet makes an undersized picture look composed. Two
caveats it states about itself: a terminal-layout beat has no right pane and reads ~0%,
and deliberately DIM content needs the low ink threshold or a full pane reads as a third
of one.

Corollary — **proof at the CAPS, not at the content you happen to have written.** A MIX
fixture (the realistic content) showed none of the four layout defects a MAX fixture
(every field at the linter's cap, every collection at its ceiling) showed immediately: a
2-line headline landing on the premise and on the stage border, a terminal pane cut
mid-line with no affordance, ten dependency parcels squeezed to unreadable slivers, and a
verdict rendered on every beat and visible on none of them. Whatever the linter permits,
somebody will eventually author. `scripts/gen-uv-fixtures.mjs` is the pattern: generate
MIN (sparsest legal) / MAX (at every cap) / MIX (what ships) from the linter's own bound
tables, so the fixture cannot drift from the contract it is testing.

Corollary — **a cap is a measurement, not a taste.** Three UV_STAGE caps were wrong on the
first pass and all three were found by rendering: the headline cap of 48 wrapped in every
pack at 16:9 (now 38); the step-label cap of 44 was shorter than the real install
one-liner at 46, which LAW 0m forbids trimming (now 52); and a blanket "max 10 stage
items" ignored that each picture has its own capacity (now per-kind, 2 to 7). When you
write a number into the linter, say in the comment what you measured to get it.

Corollary — **a component with a payoff STATE needs a fixture per state.** `env-ceremony`
holds a ring that turns and then collapses into one command. One still at the 55% mark
caught the collapse and never showed the ring — half the component shipped unlooked-at
until a second fixture held the collapse anchor back.

Corollary — **a list-shaped data model becomes a list on screen.** `env-ceremony` took
`items[]` of steps and rendered them as numbered rows that lit up in order; at its cap
that is nine identical text rows in the right-hand pane — the exact lit-rows template
four sampled frames of the shipped Linux cut all shared, reproduced in a course written
to avoid it. The idea was a LOOP, and a loop is a shape: it is now a ring of six
recognisable objects with a marker travelling it and a collapse at the end. **Before you
write the component, say the SHAPE out loud** — a ring, a spine, a shelf, a wall going
up. If the answer is "the items, in order", you have a caption list, whatever the field
names say.

## LAW 0o — THE PANE MEASURES ITSELF, AND NOTHING LEAVES IT (owner verdict, 2026-08-21)
Owner, on the reworked MCP shorts: *"I see the top and bottom are getting overlapped with the
content inside, there is no room to breathe."* And separately, on a Linux chart: *"the graph is
kinda like a patty inside a burger."* And on the wire: *"the moment it moves, it just gets hidden
behind the container."* Three complaints, three symptoms, **one cause**.

`stackBudget()` returned the constant `vertical ? 960 : 430` — a guess at a pane's inner height
that took no account of what was already in the pane. A three-line premise ate 120px and every
depiction still sized itself to the full 960, so the surplus went out through the bottom border.
The chart went the other way: a fixed 168px plot in a 700px card, floating.

**The rules, all of them paid for:**

1. **Measure, never assume.** A pane computes its own budget — stage height, less the caption bar,
   less the WRAPPED premise, less the vars strip, less its own padding — and publishes it through
   `BudgetCtx` / `PaneBudget`. Depictions read `stackBudget(v)` and get the truth. If you build a
   new stage, it provides a budget or its children will overflow it.
2. **A cap is not a layout.** Row heights capped at 156px against a 700px pane draw content in the
   top half and leave the rest black — which reads as an unfinished slide. Rows take their real
   share of the real budget; a ceiling exists only to stop a two-row beat becoming two billboards.
3. **Fit BOTH axes.** `CodePane` sized its font by height alone, so in 9:16 a 52-character line
   needed 1060px of a 976px pane and was sliced mid-token. Every fit has two budgets and the
   smaller one wins.
4. **`justify-content: center` overflows both ways.** Centred flex content that outgrows its box
   pushes out of the TOP as well as the bottom. Use `safe center` everywhere content is centred in
   a fixed box; it degrades to flex-start exactly when it would otherwise overflow.
5. **Travel by your own width, never by half of it.** A pill positioned `left: pct%` with
   `translateX(-50%)` has half of itself outside the track at both ends of its run. Use
   `translateX(-pct%)`: left edge pinned at the start, right edge at the end, never a pixel outside.
6. **Breathing room is not smaller type.** Owner: *"if you go too small with content for giving
   breathable space, user wont see shit."* Space comes from carrying LESS on the beat, never from
   shrinking what is there. In 9:16, growing the type and cutting a row is the correct trade.
7. **A squashed viewBox squashes everything inside it.** `preserveAspectRatio="none"` distorts
   strokes and, worse, TYPE. Pin strokes with `vectorEffect="non-scaling-stroke"` and lay every
   label out as HTML over the plot. A circle in a squashed viewBox is an ellipse — position an HTML
   dot instead.
8. **One card per thing.** A titled effect pane holding a chart that draws its own titled card is a
   box in a box with a gutter of dead space between them.

Corollary — **the sweep is the only honest check.** Render 2-3 frames per scene at both aspects
into a contact sheet before rendering a single video. Every fault above was invisible in the code
and obvious in a still. And read the FULL still, not the thumbnail: a dark panel on a dark ground
looks like empty space when it is scaled down, so measure content extents programmatically before
concluding a pane is under-filled.

## LAW 0p — ANSWER THE TITLE, AND ANSWER IT FOR A BEGINNER (owner verdict, 2026-08-21)
Owner on MCP chapter one: *"mcp 00 is SHITTY AF. The title says whats claude and how claude works,
and inside I see you start explaining about using anthropics claude as an API. Dude WTF. Is it even
beginner friendly? Ask these questions often."*

The chapter opened on `client.messages.create(...)` and its arguments. Every sentence was true and
the whole thing answered a question a first-time viewer has not asked yet. A title is a promise;
the first two minutes either pay it or the viewer leaves.

**The check, on every chapter, before writing a single beat:**
- Read the title as a stranger. What does it promise? Does beat one deliver THAT, or the mechanism
  behind it?
- Name the thing before you use it. "What Claude actually is, and what it genuinely cannot reach"
  comes before any argument of any call.
- A limitation is a better opening than a feature. The viewer has felt the limitation; they have
  not yet felt the need for the feature.
- Mechanism lands only once it is the ANSWER to a question the viewer is now holding.

Corollary — **numbering with a hole is a defect.** The MCP series shipped as 00-09, 11, 12: twelve
chapters, no chapter ten, because two slugs were typed from the brief index rather than the chapter
index. Nobody reviewing the content would catch it; a viewer scanning the playlist catches it
immediately. Check the sequence, not just the contents.

Corollary — **a builder that is behind its output is a trap.** `briefs/mcp/ep01.json` carried two
beats that `ep01_03.py` had never produced, because the JSON was patched directly in a later pass.
Re-running the builder would have silently deleted them. Before you run a brief builder, diff its
scene ids against the JSON it writes.

## LAW 0f — WRITE FOR A MOUTH, NOT A PAGE (owner verdict, 2026-08-16)

### Corollary — EXPLAIN IT TO SOMEONE WHO ARRIVED TODAY (owner, 2026-09-03)

Owner, on an informatory cut: *"For someone who's looking at this video for the first time,
the technical aspects you explain need more clarity and more normal English explaining what
is what, the terms you mention and where it is useful… Rather than sounding more like human,
you always cut short what you speak and users end up not understanding anything. Just
mentioning IT, that, etc by just showing the video thinking user would understand would not
help. You must always think at a human level."*

Five rules, all of them about the same failure — writing for someone who already knows.

1. **A JARGON TERM IS EXPLAINED THE FIRST TIME IT IS SPOKEN, IN THE SAME BREATH.** Not in a
   later beat, not on a card, not by showing a chart with the name on it. *"agentic scientific
   research — and agentic just means the model works on its own: it is handed a task, and it
   has to pick the tools, write the code and reach an answer without a person steering each
   step."* A benchmark name, a units label, a product tier and an industry noun all count.
2. **NAME THE THING, EVERY TIME.** The PRONOUN FOG guard measures sentence OPENERS; the rule
   is wider than the guard. "It", "that", "this one" are only allowed when the noun is in the
   same sentence. On screen there is a picture doing the pointing and in a viewer's ears there
   is not.
3. **DO NOT READ OUT WHAT THE CHART ALREADY SHOWS.** Reciting four bar values duplicates the
   picture and spends the runtime the scene ceiling grants. Say what the numbers MEAN — the
   shape, the comparison, the caveat — and let the bars carry the digits. This is LAW 0d's
   argument pointed at narration.
4. **NEVER TRIM AN EXPLANATION TO FIT A CEILING.** The scene ceiling is `5s per distinct
   anchor`, so a beat that needs more words needs more ANCHORED ELEMENTS or a SPLIT — those
   are the two remedies the linter names, in that order. Cutting the explanation to fit is how
   a video ends up terse and unfollowable, which is the complaint above.
5. **A NUMBER SPOKEN WITHOUT ITS UNIT OR ITS SUBJECT IS NOISE.** *"Twenty-four point seven, to
   fifty-two point six"* was a real HOOK, and the owner heard it as *"a rubbish voice over,
   don't know what."* Read aloud with no picture yet, a bare pair of decimals is a string of
   digits. Every figure gets its unit and the thing it measures.

### Corollary — WHAT YOU RECORD FROM SOMEONE ELSE IS A QUOTATION (owner, 2026-09-03)

Owner: *"when you show the browser screen recording, you must always say in the official
website, and at the bottom there must be a text stating the source which is very very
important."*

Recording our own terminal is a demonstration. Recording a page we do not own is a quotation,
and a quotation carries its attribution ON SCREEN, for the whole beat — a credit in the
description is invisible while the video plays.

- **Say it out loud** in the narration: *"this is Anthropic's official website, on the page
  where they announced it."*
- **Set `recordedStep.sourceNote`.** It renders as a standing strip along the bottom and is
  never anchored. `scripts/lint-spec.mjs` REQUIRES it whenever a beat's recording carries a
  `startUrl` — i.e. exactly when the footage came from the open web.
- **Move the camera like a person reading.** A static screenshot held for twenty seconds is
  not footage. `clips[].zooms` takes a list of measured marks: come in on the thing being
  named, pan across to the number, pull back to `at:'full'`. A viewer follows a gaze.

### Corollary — AN OVERLAY GOES WHERE THE WORK IS NOT (owner, twice: 2026-09-02, 2026-09-03)

Owner: *"I always mentioned component overlays are not just meant to be horizontal sitting on
the middle, it can be placed anywhere, on the sides as well… just like how we have a window in
Android Studio to look into the device at the side, while the main content still matters and
is highlighted."*

`recordedStep.card` has taken `{place, aspect, width}` since it was built, and the manifest
note has always said a card should be *"narrow and parked to one side so it sits BESIDE the
listing instead of across it"*. It was still authored as a centred strip twice, over a full
table, hiding the rows being discussed. **Default `auto` only when the footage genuinely
leaves a free horizontal band.** Dense footage — a full-page table, a maximised terminal — has
no free band, only free SIDE margins, so it takes `place:'right'` (or left) with a `portrait`
aspect and a width around 0.26.

### Corollary — THE THUMBNAIL NAMES THE THING (owner, 2026-09-03)

Owner: *"The thumb too is horrible, and nobody would click it. Whats that? IT DOUBLED? What
does that even mean for an user who sees the thumbnail? The HOT TOPIC must be the bolder one,
CLAUDE FABLE or MYTHOS 5.1, thats how user would click."*

A thumbnail is read with no sentence before it, so a claim whose subject is missing asks a
stranger to guess — the bare-pronoun failure of rule 2 above, committed on the one surface
with no previous line to supply the noun. The **name** is what someone is scrolling for; the
claim is what earns the click once they have stopped. Name first, claim underneath. Enforced:
the linter rejects a thumbnail whose title, badge and note never contain `meta.subject`.

### Corollary — A FIELD NOTHING READS IS A LIE, AND SO IS A LAW NOTHING GATES (2026-09-03)

One session, chasing one owner complaint about overlays, turned up **five** places where
the repo was carrying an instruction nobody executed. They are the same bug wearing
different clothes, and every one of them was silent — valid spec, green linter, clean
`tsc`, successful render, and the thing simply not on screen.

| what was declared | what read it | how it showed up |
|---|---|---|
| `clips[].zooms` — 32 authored camera moves, repo-wide | nothing, on any `layout:'full'` beat (the default) | *"the screen recording is just displaying the part"* — the camera had **never** moved on a wide cut, including in `topics/rec-camera-moves` |
| `ChartSeries.atWord` | nothing — one `drawProgress` served every series | a two-line comparison drew both lines at once while the voice introduced the first |
| `stats[].note` on `moderndark`, the standing default | nothing — `MdStatPanels` drew kicker + value | a panel reading **STILL DEARER / per word**, its note *"than Opus 5 · GPT-5.6"* — the entire comparison — never drawn |
| a clip's authored `atWord` | `anchor-spec.mjs`, which overwrote it every run | the scroll landed three words into the next sentence |
| `inkFor()` on the browser surface | nothing — both selectors were VS Code's | every browser recording told the overlay solver the page was empty |

**The rules that fall out, and they are cheap:**

1. **When you add a field, add the code that reads it in the same commit, or do not add
   the field.** `scripts/check-field-use.mjs` now proves this for design packs: repo-wide
   a notice (62 fields are dropped across 28 packs today), and **fatal** for the pack a
   spec actually uses, on the types it contains, for the values it sets.
2. **A field the spec author writes and a field the pipeline computes may not share a
   name.** `anchor-spec` owns `atWord`; the author's intent is `wantAtWord`. Reading intent
   back out of an output makes the pass non-idempotent — its second run obeys its own first
   answer.
3. **A measurement that fails soft must fail loudly instead.** `inkFor()` returned `[]` for
   a surface it had no selector for, and `[]` reads as "the screen is empty". Anything that
   MEASURES gets a check that at least one measurement is non-empty
   (`check-recordings.mjs`), and that check distinguishes *not measured yet* (a notice) from
   *measured and found nothing* (fatal).
4. **A LAW WITH NO GATE IS A HABIT.** CLAUDE.md has said *"NOTHING renders until it
   passes"* for as long as the linter has existed, and `render-topic.mjs` never once ran
   the linter — a REJECTED spec rendered a 5.7MB deliverable while this was being written.
   It runs it now. When you write a rule down, name the script that enforces it in the same
   breath; if you cannot, you have written a wish.
5. **Grepping is not a gate either.** LAW 0n's answer to field-dropping was *"grep every
   `.map((c) =>` before you render"*, and the bug then happened three more times. The
   corollary count went 3 → 8 under a rule made of good intentions.

### Corollary — A TRANSFORM RESERVES NO LAYOUT SPACE, AND A TRAVEL HAS TWO ENDS (2026-09-03)

`COLUMN_SPLIT` tears a table in half: in 9:16 the upper column travels UP and the lower one
travels DOWN, both on `transform: translateY`. A transform paints outside the flow and takes
no room in it, so the lower half landed on top of the question card beneath it. I reserved
clearance at that end, re-rendered — and the file-name kicker above the board was *still*
missing, because the UPPER half was riding over it.

**One travel has two edges, and fixing the one you happened to look at is how a field ends up
declared, drawn, and invisible.** Whenever something moves by transform, ask what is on the
other side of it too. The same sweep applies to `translateX` on a wide cut, to a pill that
overshoots its track, and to any `landAt` overshoot near a container edge.

### Corollary — NEVER FIX PACING WITH THE VOICE SPEED (owner, 2026-09-04)

Owner, on a cut voiced at -10%: *"why does ava sound slow!!! it was perfect before… I need
ava to sound like before."* And, ruling on it generally: *"the voice syncs purely must be
maintained in your scripting by planning properly the beats and the cuts. You should not or
never adjust the pace of the voice to match."*

**THE HOUSE RATE IS `+8%` AND IT IS NOT A TUNING KNOB.** It had been dropped to -10% to fix
a real complaint — typed code flashing past too fast to read — and that was the wrong lever
in the most expensive way available: it inflates EVERY gap in the video to buy dwell on the
few that needed it, so the listener pays everywhere for a problem in one place.

The measurement, on the same cut, is the whole argument:

  | | first cut | at -10% | back at +8% |
  |---|---|---|---|
  | rate | 187 wpm | 156 wpm | 186 wpm |
  | median hold, clips you must read | 3.9s | 11.8s | **11.8s** |

Same speed the owner likes, three times the dwell of the cut he complained about — because
the fix was always WORDS OVER THE CLIP, never playback speed.

**So when a beat is too fast, the remedies are, in order:** more explanation over that clip
(which is LAW 0e arrived at from the other direction); move an anchor; split the beat; cut a
step from the capture. `scripts/check-holds.mjs` measures the thing you are actually fixing.
Sealed in `check-corrections.mjs` — the rate cannot be edited without the gate going red.

### Corollary — CREDIT THE LIBRARY YOU INSTALL ON CAMERA (owner, 2026-09-04)

Owner: *"you must also credit the library. If they have official git make sure to address in
our video and ask users to look into documentation or the github page etc."*

A tutorial that types `uv add mcp` is standing on somebody's unpaid work, and the viewer's
next question — *where do I read more?* — has exactly one right answer: the maintainers' own
page, not a summary of it. So every package installed on camera earns three things:

1. **Its name and what it is, said out loud** — *"the official Python SDK for the Model
   Context Protocol"*, not "a library".
2. **Its own page ON SCREEN at least once**, recorded like any other quotation (LAW 0f):
   the docs site or the GitHub repo, with `recordedStep.sourceNote` under it.
3. **A line in `meta.seo.sources`**, which is what puts it in the video description where
   somebody can click it.

Say where to go next in the outro too: the docs for learning, the repo for the source and
the issue tracker.

**Enforced.** `lint-spec.mjs` reads every clip's baked `shows` for an install command
(`uv add`, `pip install`, `npm install`), extracts the package names, and REJECTS the spec
when a package installed on camera is not named in `meta.seo.sources`. It cannot be
satisfied by a vague note — the package's own name has to be in the credit line.

### Corollary — AN OVERLAY ON A CODE LINE DEPICTS WHAT THE LINE DOES (owner, 2026-09-04)

Owner: *"when you are explaining about a code line, if needed, the overlay component is meant
to have components animated and display what the line does graphically instead of just
showing text."*

**Measured on the cut that prompted this: 45 callouts, ZERO overlays.** `RecordedStep`
has carried an animated `overlay` on every clip since it was built, it is wired, and three
other topics use it — and every single explanation in a 19-minute coding tutorial was a text
label with a leader line. A caption pointing at a line is not a depiction of what the line
does; it is LAW 0j's "lazy ass animation" defect wearing a callout's clothes.

`clips[].overlay` takes `{kind, atWord, …}`:
- **`rows`** — the TABLE and what the step did to each row (kept / cut / new). The manifest
  already says PREFER this for anything a query or a filter changed.
- **`chain`** — a token walking down a pipeline, one stage at a time.
- **`split`** — one input sent to two fates (the try/except branch; number vs text).
- **`swap`** — one word becoming another (a name resolving to a value).
- **`tally`** — a number counting up (rows read, tokens billed).

**The test, per code line: could this be drawn as something HAPPENING?** `float(v)` on a
column is a `split`. `counts[v] = counts.get(v,0)+1` is a `tally`. `subprocess.run(...)` is a
`chain`. Reserve `callouts` for naming a thing that is already on screen — a file, a button,
a key — and stop using them to narrate behaviour.

### Corollary — A HOLD IS THE UNIT OF COMPREHENSION, AND NOTHING MEASURED IT (owner, 2026-09-04)

Owner, on a 13-minute beginner tutorial: *"You are hurrying at many places where the
voiceover is shooting very fast while the on screen typing and highlighting just flashes
only for a few seconds which is not processable by a human eye… at one point your voiceover
syncs with what is shown but while its syncing with whats shown, the time given for human
to process is bare minimum."*

Every gate said the cut was fine. The linter passed. `audit-sync` passed — every element
landed on the word that named it. **Sync is not comprehension.** A thing can arrive at
exactly the right moment and still be gone before anyone has read it.

**The number nothing was computing: HOLD.** Footage plays at CAPTURE speed no matter what
the voice does, so for a clip the only thing that decides how long the finished state stays
on screen is how long the narration over it lasts:

    hold = (next anchor − this anchor) − footage frames

Measured on the shipped cut: the beat where a whole block of code is typed held for
**0.3 SECONDS** after the last character landed. Median across twelve typing blocks: 3.9s,
with four under 2s.

Two causes, both invisible in code review:

1. **`voiceover.py` was pinned at `rate="+8%"`** — actively sped up, and there since before
   this repo measured anything. It delivered **3.11 words/sec, 187 wpm**. A presenter talks
   at that rate; someone typing along does not. It is `-10%` now (~2.6 w/s, 155 wpm), which
   is the production bible's own range, and it hands ~20% more dwell to every frame at zero
   cost. **Changing the rate changes every hold in the video** — it is the biggest single
   lever, and it was a constant nobody had questioned.
2. **A beat's word count was written to the narration's needs, not the footage's.** If a
   6-second typing block gets a 6-second sentence, the hold is zero by construction. The
   sentence over a block of code has to outlast the typing, which in practice means
   EXPLAINING what was typed rather than announcing it — LAW 0e again, arrived at from the
   other direction.

**Measure it before rendering.** Compute the hold for every clip and read the bottom of the
list. Under ~2s on a typing block is a defect; a save or a `cd` can be short because there
is nothing to read.

Corollary to the corollary — **a beat whose visual is a sentence is the thing to cut when
you need the time.** Owner, same review: *"you are speaking about something where something
meaningful can be shown where you just waste the duration by just showing [a KINETIC_TEXT
card] and animation."* The card in question read *"Every value different means nothing to
rank"* — which is the narration, set in type, animated. The beat is about a column whose
values never repeat, so the fix was to put THE COLUMN on screen with its counts beside it.
If a component's whole content is a restatement of the sentence, it is spending runtime that
the footage beside it needed.

### Corollary — ESTIMATE THE READ AT A MEASURED RATE (2026-09-03)

A builder's pre-sync estimate is the ONLY chance to catch a short cut before paying for a
voice-and-sync round trip, and LAW 0e.6a already says to check it. It is worth nothing if the
rate is wrong. The episode-3 builder estimated at **150 words a minute** — the figure
`docs/02-PRODUCTION-BIBLE.md` gives for a *human* read — and `en-US-AvaMultilingualNeural`
delivered the same script at **183**. So the builder printed 15m20s, sync produced **12m15s**
against a 15:00 brief, and the 18% shortfall only existed after the audio did.

- **Estimating LOW is the dangerous direction.** A high estimate shows up as a ceiling warning
  you fix in the builder; a low one shows up as a finished, too-short cut.
- **Print the rate and what measured it** (`~3.05 words/s`), so the next author can see the
  assumption instead of inheriting it. Re-measure when the voice changes.
- **The remedy for a short cut is more BEATS, never more words in the beats you have** — every
  beat is already at the ceiling its anchors earned, so padding one just trips the guard.

### Corollary — AN ANCHOR CAN BE A LIST, AND THE PLUMBING HAS TO KNOW (2026-09-03)

`DATABASE_TABLE` lit every matched row on one ramp, so a beat that reads three order numbers
aloud lit all three at once — and, carrying a single anchor, could never earn more than the
16s static ceiling however much it had to say. The fix is per-row anchors, and the field is a
LIST: `highlightAtWords`, parallel to `highlight`.

Both `sync.mjs` and `lint-spec.mjs`'s `collectAnchors` test `/atword$/i && typeof v ===
'number'`, so an array matched neither — the recursion walked into it, found keys `"0"`/`"1"`,
and moved on. The list would have **survived sync as raw word indices** while every other
anchor in the scene became a frame, and the rows would have lit at arbitrary moments with
nothing failing anywhere. Both now handle any `…AtWords` key. **When you add an anchor in a
new SHAPE, grep for every place that recognises anchors by name** — the retargeter, the range
check, and the scene-ceiling counter are three separate readers of the same convention.

### Corollary — FIX THE CLASS, NOT THE INSTANCE (owner, 2026-09-03)

Owner, on a finished cut: *"this issue of this title card is persisting please correct"* —
pointing at a HOOK card reading **IT DOUBLED**. He had already rejected those exact three
words, and I had already written a linter guard for them. The guard checked
`spec.thumbnail` and only `spec.thumbnail`, so the same words on the same video, on the
surface a viewer meets FIRST, sailed straight through.

**When a correction lands, the guard goes on the ARGUMENT, not the surface.** The argument
was "a claim with no subject asks a stranger to guess". That argument covers every surface
read with no sentence in front of it: the thumbnail, the cover, and above all the HOOK card,
which is on screen at second zero and is what a muted autoplay shows. Before writing a
guard, finish this sentence: *"the same reasoning also applies to ___"* — and if the blank
has anything in it, the guard is not done.

Two more of the same shape, found in the same frame:

- **A VARIANT THE COPY CANNOT SUPPORT IS SILENTLY DISCARDED.** `hookVariant: 'figure'` draws
  a number counting up; its branch is guarded `if (variant === 'figure' && fig)`, and `fig`
  is null when neither the headline nor the subtext contains a digit. Authored over "IT
  DOUBLED", it fell through to a different silhouette entirely, with no error. The spec asked
  for one design and got another. Now rejected by the linter, along with `reveal` without a
  `heroAsset`.
- **`overflow: hidden` ON THE ELEMENT WHOSE CHILD IS MEANT TO OVERHANG.** The plaque hook's
  corner mark is translated by −46% of its own size to STRADDLE the card's corner, four lines
  under the `overflow: hidden` that clipped it — so what shipped was a sliver of a tile
  cropped on two sides. The comment promised "three quarters of it outside the frame". If an
  element is positioned to hang outside its parent, the parent cannot clip: make them
  siblings in an unclipped wrapper.

### Corollary — CAST THE FOOTAGE BY WATCHING IT, NEVER BY ITS LABEL (owner, 2026-09-03)

Owner: *"you speak about comparison table, but you are showing this first, later you show
the table — why so?"*

He was watching a beat whose narration says *"scroll down and their comparison table
appears… first column is the new model"* over nine seconds of a **scatter chart** headed
*"A new performance frontier"*. The comparison table did not arrive until the next beat.

**Cause: I cast a clip from its NAME.** The demo step was called `bench` and labelled *"the
benchmark they lead with"*, its mark read `Terminal-Bench-Science 0.1`, so I wrote
`label: 'scrolling to the table'` and never opened the footage. Every signal I used was a
word about the step; none was the step. LAW 0k already says *audit by still, not by render* —
this is that failure moved one stage earlier, into casting.

**Nothing in the spec could have told me, and that was the real defect.** A baked clip
carried an id, a frame count, a bbox and marks — not one word about what is ON it. So:

1. **The capture records what the step SHOWS.** `headingFor()` reads the step's own heading
   (or the largest type on screen when there is none) and `bake-rec` bakes it as `shows`.
   The spec then reads `{label: 'scrolling to the table', shows: 'A new performance
   frontier'}` — a contradiction you cannot skim past.
2. **The render preflight prints every pair.** `check-recordings --slug` lists
   `your label -> the screen's own words` for every cast clip before a frame is rendered,
   so this is in front of you whether you thought to look or not.
3. **A label is a claim about content, so it is evidence of nothing.** When casting a
   recorded step, the question is never "what is this step called" — it is "what is on the
   last frame". `ffmpeg -sseof -0.2 -i seg-NN.mp4 -frames:v 1 out.png` costs a second.

### Corollary — A SCROLL IS A TRAVEL, AND A CAPTURE IS NOT A SCREENSHOT (owner, 2026-09-03)

Owner: *"the scroll you are doing is not smooth, why? And why aren't you using the browser
on full screen or whatever, why do I see the browser window cut?"*

Two separate causes, both in the recorder, both invisible in code review:

1. **`page.mouse.wheel(0, 1200)` is a teleport.** It delivers the entire distance in ONE
   event: the page is at the top on one captured frame and 1200px down on the next, then
   holds still for 900ms. There was nothing to smooth — there were no intermediate frames.
   A scroll is now delivered in ~16ms increments along an ease-in-out curve, with duration
   scaled to distance the way a real trackpad flick is (~1.1s per 1000px, clamped
   420–1600ms). Measured: the same four steps went from 119 captured frames to 339.
   `scrollIntoViewIfNeeded` teleports for the same reason — compute the delta and travel it.
2. **A 1600×900 capture in a 1920×1080 frame is a 1.2× UPSCALE**, and every glyph is
   resampled — which is the softness that reads as a cheap window. Simply widening the CSS
   viewport to 1920 makes it *worse for the viewer*: a site with a max-width column just
   gains empty margin, so the words shrink relative to the frame. `deviceScaleFactor`
   separates the two: **lay out at the width the site expects, render at the delivery
   resolution.** Chrome rounds the factor up (1.2 → 2, i.e. 3200×1800), so the segment
   encoder downscales to 1920 with lanczos — which is a supersample, sharper than either.
   Captures already at or below 1920 are passed through untouched.

**The general rule: a recording is FOOTAGE, and footage has motion and resolution.** Both
defects came from treating a capture as a sequence of screenshots that happen to be stored
in an mp4. Ask of every recorder action: *what does this look like at 30 frames a second?*

### Corollary — FIVE OF THE SAME CARD IS NOT A DESIGN (owner, 2026-09-03)

Owner, on the pricing beat: *"this one too. Not a graph but something different. I need
variations."* — and, on the cost beat: *"the component needs to be like a line chart which
shows the drastic reduction in cost with green lines. You know the drill. Beautiful component
with animation."*

`STAT_PANELS` was carrying five of twenty-one beats in one cut. It is under the 35%
over-reliance cap and it was still the wrong answer, because the cap measures repetition and
the owner was describing MONOTONY. LAW 0e.8 already says a concept beat gets a purpose-built
component; this extends it to the arithmetic beats, which are the ones that quietly default
to a card because a card can hold any number.

**Say the OBJECT out loud before you cast.** Two beats, two objects, and neither is a card:

- *"only one line on the price list moved"* → a **price sticker**. `RATE_SHEET` draws a rate
  sheet where the rows that held take a HELD stamp and the one that moved has its old price
  struck through in front of you — the strike DRAWS, it does not fade, because a strike is a
  gesture — and the new price drops in beside it with a −75% chip. A bar chart of
  $10 / $50 / $1 / $0.25 would have drawn four similar bars and buried the only fact there is.
- *"the cut is worth this much over a long session"* → not two lines to compare by eye, but
  the **area between them**. `LINE_CHART` variant `savings` draws the old cost as a dim dashed
  ceiling, the new as a lit glowing floor, and fills the widening wedge between them as the
  new line draws. The gap IS the saving, so nobody has to measure it.

Corollary to the corollary: **a derived payoff still needs an anchor.** The savings total
first landed on `newLine.atWord + 52` — a hardcoded frame interval inside an explanatory
component, which is precisely what LAW 0i.1 forbids. It takes `totalAtWord` now, so the
number arrives on the word that says it.

### Corollary — A CURVE YOU MADE UP IS A LIE WITH AXES ON IT (2026-09-03)

LAW 0m.2 says a chart needs declared data. Two invented figures shipped into a lint-clean
spec anyway, because both *looked* like research:

- a `PICTOGRAM` row at **12**, a value in no source — I had averaged "ten or fifteen" into a
  single number for tidiness. Drawing both ends is more honest, matches the sentence, and
  bought the beat a third anchor.
- a `LINE_CHART` plotting `[10,26,42,58,74,90]` against `[10,18,26,33,40,47]` — a plausible
  widening gap, drawn with gridlines, units and a legend, and entirely fabricated.

**A worked example is legitimate; an undeclared one is not.** Both series are now straight
arithmetic on the two prices Anthropic published, the assumption that generates them is
SPOKEN ("about ten million tokens' worth an hour"), and the legend carries the unit prices
themselves (`Old $1/M`, `New $0.25/M`) so a viewer can check the slope instead of trusting
it. Before any chart ships, say out loud where each number came from. "It looks right" is
the feeling this rule exists to overrule.

### Corollary — NEVER NARRATE THAT YOUR OWN WORK IS REAL (owner, 2026-09-02)

Owner, on the uv cut: *"Did anyone ask that you are doing all real? You yourself are letting
users know that you are doing real stuffs, indirectly stating you are AI. Dude, watchers are
humans — such scriptings are not good."*

**A person demonstrating their own screen never defends its authenticity.** Nobody says "this
is a real terminal" for the same reason nobody says "I am not lying to you" — the claim only
occurs to someone anticipating the accusation, and hearing it makes a viewer wonder why it
needed saying. It reads as a machine reassuring you, which is the exact impression LAW 0f
exists to prevent.

Measured on one 20-scene spec: **18 such claims** — "on a real machine", "a genuinely empty
folder", "typed live and read back", "real numbers rather than a marketing page", "measured
here", plus a thumbnail note reading *Real terminal, real output*. Cut all of them.

- BANNED on screen and in narration: real / really-as-defence / genuinely / actually-as-proof
  when applied to the FOOTAGE, "typed live", "read back", "verbatim", "captured", "measured
  here", "on this machine", "not a mock", "no edits". Ordinary uses stay — *"what is a venv,
  really?"* and *"the only real question"* are how people talk.
- The provenance still gets recorded, in `meta.seo.sources` and in `briefs/`. That is a
  production record, and it belongs where a reader can check it, not in the presenter's mouth.
- The footage does the arguing. If a beat only convinces because the narration insists it is
  genuine, the beat is weak — show the thing instead.

Related, same review: **say what the video is ABOUT in the first breath.** A tour of a Python
tool that never says "Python" until scene five has failed LAW 0g.1 in spirit even when
`meta.subject` passes the linter. And **the screen and the mouth must agree on numbers** — a
hook card reading NOT FIVE over narration that names four tools is the mismatch a viewer
notices first.
Owner: *"You often use IT, and you speak about something that's on the screen, but you forget
what the context is about, and you start speaking in a very AI manner. Humans are not adaptable
to that."* Measured across the shipped Playwright course: **0 contractions in 900+ words, every
episode**; "And" opening 11-15 sentences in a single script; sentence lengths clustered within
±3 words of the mean. That is a machine reading a manual, and no amount of good visuals rescues it.

A voiceover is SPOKEN. Before any spec goes to `voiceover.py`, the narration must pass as
something a person would actually say out loud:

1. **NAME THE SUBJECT.** Never "it does X" when the screen holds a page, a locator and a file —
   say *the locator*, *that zip*, *your test*, *Playwright*. The listener has no scrollback.
2. **CONTRACTIONS.** "you'll", "here's", "don't", "that's". edge-tts speaks them perfectly.
   Written-out forms are the single loudest tell.
3. **BURSTINESS — BUT WRITE SENTENCES.** Swing the LENGTH: a short sentence next to a 25-word run.
   *"That's it."* then a long winding clause. **This is not a licence to clip everything.**
   ⚠ **RECORDED BACKFIRE (2026-08-16):** this rule as originally written produced **45-57%
   fragments** across four episodes — *"Three tools today."* · *"Six seconds each."* · *"In the
   sidebar."* Owner: *"that's just a blunt sentence with no grammar."* A short sentence still has
   a subject and a verb. *"There are three tools I want to show you today"* is short AND a
   sentence; *"Three tools today"* is a caption someone read off a slide. **Cap fragments at
   ~1 in 5, and make every one of them deliberate.**
4. **VARY THE WAY IN — NOT THE SUBJECT'S NAME.** Not every sentence starts "And" / "So" / "The".
   Open on an adverb, a question, a dependent clause, a mid-thought observation.
   ⚠ **RECORDED BACKFIRE (2026-08-16):** read as "avoid repetition" generally, this rule made me
   duck the subject's own name — measured **~54 bare pronouns per episode against "Playwright"
   said 1-5 times in 880 words.** Owner: *"your usage of IT is hell of a lot. When you say IT,
   what is IT?"* **Repeating a subject noun is not repetition, it is clarity.** Say *Playwright*,
   *the locator*, *your test*, *that trace file* as often as the sentence needs. Vary the
   sentence OPENERS and the connective tissue; never vary away from naming the thing.
   And note the trap on the other side: *"the one you see"*, *"the thing that's highlighted"* are
   just as useless as "it" — vague pointing is not naming.
5. **ASIDES AND QUIRKS.** Em-dash asides, parentheticals, a rhetorical question, the occasional
   deliberate fragment. Small redundancies are human. *"Be honest — have you ever watched one?"*
6. **CONCRETE OVER GENERIC.** "three in the morning", "a hundred green tests", "one crime scene
   photo" — not "in certain situations" or "various artifacts".
7. **NEVER FORCE IT.** Sprinkled slang reads worse than plain prose. The test is simple: read the
   scene aloud. If you would not say the sentence to a colleague, rewrite it.
8. **TEACH — DO NOT NARRATE.** (owner, 2026-08-16: *"you are teaching, not just explaining
   concepts. Like a human, you are sharing your experience, in a beautiful way which hits harder
   to the listener. The scripts are just like narration and not like teaching."*) A narrator
   states what is true. A teacher makes you *feel why it matters* before handing you the
   mechanism, and stays with you through the part that trips people. Concretely:
   - **Motivation before mechanism.** Why you'd ever want this, then what it is. Not the reverse.
   - **Carry the reasoning in the sentence.** *because* · *which means* · *so* · *otherwise* ·
     *and that's why*. A list of true statements is not an explanation.
   - **Share the experience.** *"I've lost an afternoon to this."* *"The first time I saw this I
     didn't believe it."* Earned, specific, never invented for effect.
   - **Anticipate the confusion.** *"And if you're wondering why that underscore is there — and
     you should be —"*. Answering the question the learner already has is what teaching IS.
   - **Say the consequence.** What actually happens if they get it wrong, in their week.
   - **Land it.** End the beat on the sentence you'd want them to repeat to a colleague.

9. **AN AUTOMATED REWRITE MAY NOT INVENT A CLAIM.** The voice guard is measurable, so it is
   tempting to satisfy it with a bulk pass. Two recorded failures: (a) a contraction pass produced
   *"Lost track of where you're?"* and shipped it, because it contracted a verb that ENDED its
   clause — never contract when the second token carries clause punctuation; (b) a pass replacing
   bare "it" with the subject's name produced **three false statements**, including *"open a ten
   gigabyte log with less and less appears on screen"* (the LOG appears) and *"that's sig kill, and
   kill can't be caught"* (SIGKILL cannot; `kill` obviously can). It also silently dropped a space
   (`"andless"`). **Any bulk rewrite is AUDITED site by site before it ships, and a style metric is
   never worth a wrong claim (LAW 3 outranks the guard).** If the audit is too large to do
   honestly, revert the pass and report the residual warning instead.

**This is enforced.** `scripts/lint-spec.mjs` runs a HUMAN-VOICE GUARD over the whole spec —
sentence-length standard deviation, pronoun-opener share, repeated openers, contraction rate — and
warns on each. Warnings are rejections. Check the narration BEFORE voicing; re-voicing costs a
full build → voiceover → sync loop.

**Note on LAW 0e rule 5:** the "<=14 words" cap was written to stop 22-word unbroken breath
chains. It caps a CLAUSE, not a sentence. A 25-word sentence with commas, an em-dash and a natural
breath point is good spoken English; a 15-word sentence with no pause is not.

## LAW 0e-q — A QUIZ WITHOUT A GAP IS NOT A QUIZ (owner, 2026-08-17)
Owner, on a shipped episode: *"there is no gap at all between you asking the question and the
answer getting highlighted."* Correct, and it made the quiz beat worthless — a viewer who is never
given time to commit to an answer learns nothing from being told the right one.

**Cause, and it is the same one twice now:** the quizzes were trimmed to fit a per-scene second
ceiling, and the first thing cut was the thinking pause, because it is the only part that carries
no information. Every squeeze finds the teaching first.

**The gap has to be FILLED, not silent.** A scene's narration is one continuous TTS block, so
there is no silence available inside it — the thinking time is bought with words that give nothing
away. The pattern that worked for a dozen episodes:

> "…which check is reliable here? **Have a think, and pause the video if you want longer.**
> Ready? It is C, because expect keeps re-checking until that toast turns up."

Question → **pause invitation (~4s)** → `Ready?` → answer + why, with `revealAtWord` anchored on
`Ready?`. Never question → `Ready?` → answer, which is what a squeezed quiz collapses into.

**Enforced.** `lint-spec.mjs` measures the words between the QUESTION MARK and the reveal, and
requires both a real gap (≥9 words) and an actual pause cue. It runs PRE-SYNC, because afterwards
`revealAtWord` holds a frame rather than a word index — and pre-sync is when the narration can
still be rewritten without paying for a re-voice.

## LAW 0g — SAY WHAT THIS IS, TO WHOM, BEFORE ANYTHING ELSE (owner, 2026-08-16 → **amended 2026-08-30**)

⚠ **THIS LAW WAS REWRITTEN BY THE OWNER ON 2026-08-30, AND THE AMENDMENT REVERSES PART OF
WHAT IT USED TO SAY.** The earlier version banned a greeting and the channel name from scene
1 on retention grounds, and it produced exactly the failure he then reported:

> *"we need to improve our scripting, every video just starts like user already know what we
> are talking about! NO!. You need to say like we are gonna see on sqlite, or vscode or
> whatever, the title that you show initially should not be some random one liner sentence
> that doesnt even match with what the user clicked on and wanted to hear. The welcome to my
> channel and today we are gonna learn about or talk about or see about or whatever about
> something, then proceed with things. This is something that we have to improve universally
> in iauteur and not just for specific cases."*

**He is right, and the measurement backs him.** Four shipped openings, four failures — not one
of them names its own subject in the first sentence:

| cut | scene 1 opened | names the subject? |
|---|---|---|
| SQLite query plans | *"Your query got slow…"* | no — never says SQLite |
| SQLite course | *"You didn't install a database…"* | no |
| SQL injection short | *"Same table. Same Python."* | no |
| VS Code shortcuts | *"…shortcuts on that card"* | no — and **which card?** |

The old law's cold-open rule, applied literally, produces a riddle. *"Six of the hundred and
forty nine shortcuts on that card do nothing"* is a fine second sentence and a terrible first
one, because the viewer has not been told there is a card, or that this is VS Code. A cold
open only works when the audience already shares the context; a tutorial viewer does not.

### The shape, every video

1. **NAME THE SUBJECT IN THE FIRST SENTENCE.** *SQLite.* *VS Code.* *uv.* Not "the database",
   not "that card", not "it". The viewer must be able to tell in one breath that this is the
   thing they clicked. **This is an ERROR, not a warning.**
2. **GREET, AND SAY WHAT WE ARE GOING TO DO.** *"Welcome to <channel> — today we're going to
   take SQLite from an empty folder to querying two tables."* The greeting is welcome in scene
   1 now; it is no longer a rejection. Vary the FORM between episodes (a welcome, an aside, a
   question, picking up a thread) — vary the wording, never vary away from naming the thing.
3. **THE ON-SCREEN TITLE MUST MATCH THE CLICK.** The HOOK's headline is not a mood-setting
   one-liner; it is the promise the thumbnail and title made, in the viewer's own words.
   `NO SERVER` for a video titled *The Database That Is Just A File* is a different claim, and
   the viewer notices. Headline and `seo.title` share their distinctive words or the headline
   is wrong.
4. **THEN open the loop.** A question the body answers, a result shown before its method, a
   claim that sounds wrong. Curiosity still matters — it just comes AFTER the viewer knows
   what they are watching, not instead of it.
5. **Create curiosity, then SATISFY it.** Every loop opened in the opening is paid off in the
   body, and the RECAP is where you prove it.
6. **Name the channel from `brand.channel`**, never a hardcoded string in shared code.
7. **Never force enthusiasm.** "Let's gooo" reads worse than plain warmth. LAW 0f's test
   still governs: would you say this sentence out loud, to a colleague?

### What is enforced

`scripts/lint-spec.mjs` runs a GREETING GUARD, on **long cuts AND shorts**:
- **ERROR** — scene 1 does not name `meta.subject` (a new REQUIRED field: the thing being
  taught, spelled as a person would say it: `SQLite`, `VS Code`, `uv`).
- **ERROR** — the HOOK headline shares no distinctive word with `meta.seo.title`.
- **WARNING** — no greeting anywhere in the opening beats (long cuts; a short has no room).
- **WARNING** — no intent line ("today we're going to…", "we'll look at…") in the opening.
- **WARNING** — greeted more than once; a second reads as a jingle.
- **WARNING** — no question in the opening beats, so no loop is open.

The old rule REJECTED a welcome in scene 1. That rejection is gone. If a future session finds
this law and the retention argument for a cold open persuasive: the owner has heard it, and
overruled it, twice. Name the subject.

## LAW 0h — THE BACKGROUND MUST NOT MOVE (owner, 2026-08-16)
Owner, on a pulsing ring shipped behind four episodes: *"I don't like the circular animation going
on in the background, it's very distracting."* It was added purely to satisfy a "shift the
background once per Act" plan — a plan is not a reason to put a large moving object behind the
thing the viewer is meant to read.

**Before choosing a background for any teaching video, ask whether it MOVES.** If it does, it is
competing with the lesson, and the answer is no. Ambient gradients and still grids are fine;
pulsing, sweeping, orbiting and drifting are not. Named offender: **`grid-pulse`**. Visual variety
between consecutive episodes comes from the scene mix and the purpose-built components — which is
where it actually lives — not from animating the wallpaper. `brand.background` is metadata: fixing
it is an edit to the spec plus a re-render, with no re-voice and no re-sync.

## LAW 0b — TOPIC ASSETS ARE FETCHED, NOT SKIPPED
When the topic names a company / product / person / place, gather its art DURING authoring — don't ship icon-only videos:
1. Brand logos: verify + use `si:<slug>` (`node -e "const si=require('simple-icons');console.log(Object.keys(si).filter(k=>/name/i.test(k)))"`).
2. No si: logo? Fetch an OFFICIAL press-kit / CC0 image: `node scripts/fetch-asset.mjs <url> <file> "<source note>"` → lands in `public/assets/` with provenance in SOURCES.json; reference it as `img:<file>`. Only sources you are CONFIDENT are licensed for reuse — when unsure, ask the user instead of fetching.
3. Nothing safe found? Declare it under `assetsNeeded` and tell the user exactly what to drop into `public/assets/` — a lucide glyph is the placeholder, never the plan.

## Map
- `topics/<slug>/long.json + shorts.json` — one folder per video topic, IMMUTABLE once rendered. Outputs land in `topics/<slug>/out/`.
- `src/scenes/` components · `src/themes.ts` (10 themes) · `src/ui.tsx` primitives · `src/topicsIndex.ts` AUTO-GENERATED (never edit).
- `.claude/skills/tech-video-director/` — the creative law (scene library, budgets, critic checklist, design contract). 30 `design-*` skills = convertible design languages.
- `.claude/skills/iauteur-studio/` — FULL PARITY with the `webui/` browser console, from Claude Code (no browser). When the user wants to make/configure/voice/render a video or "use the console", follow this skill: interview them with defaults they can override, then run the same scripts the UI runs. It also carries the build-vs-reuse decision rule + points to `component_authoring.md` for building a NEW component (a Claude-Code-only capability the browser can't do).
- `specs/gallery.json` — component showcase. `PROJECT_RULES.md` — system laws.

## Commands (use these; do not improvise)
- New topic: `npm run new-topic -- <slug> "Title"` (scaffolds folder + regenerates index; REFUSES existing slugs)
- Validate: `npm run lint` (all topics + gallery; NOTHING renders until it passes)
- Voiceover text: `npm run voiceover -- <slug>` (derived from spec — NEVER write these files yourself)
- TTS: `python scripts/voiceover.py topics/<slug>/long.json <slug>_long` then `node scripts/sync.mjs topics/<slug>/long.json out/tts/<slug>_long_timestamps.json <slug>_long`
- Preview: `npm run dev` (Studio shows `<slug>-wide-dark|wide-light|short-dark|short-light` + stills per topic)
- Proof stills: `node scripts/proof.mjs <slug>-wide-dark topics/<slug>/long.json`
- Package standalone: `npm run package -- <slug>` (self-contained dist/<slug>-video/ + zip: extract → npm install → npm run dev)
- Render: `npm run render -- <slug> wide-dark|wide-light|short-dark|short-light|thumb|cover` — video renders auto-generate `topics/<slug>/out/upload.md` (YouTube title + description, house pattern) via `scripts/gen-upload-kit.mjs`; author the creative fields as `meta.seo` in the spec (see director skill §8b). Chapters/timestamps/sources are machine-derived from the spec — never hand-written.

## Laws (violations = defects)
1. `brand.theme` is a DARK skin — the 7 core skins are studio|neonGrid|midnight|terminal|linear|vapor|luxe, and each of the 30 design packs also has a dark theme twin (38 dark themes total; authoritative list = `DARK_THEMES` in scripts/lint-spec.mjs). Light variants render automatically (`brand.themeLight`: daylight|paper|brutalist, default daylight). The linter enforces this.
2. THEME ROTATION: when the user picks no design, **moderndark is the standing default (LAW 0) and MAY repeat** — differentiate consecutive moderndark videos via background variant + screenplay + scene mix instead. When proposing a non-default design, list existing `topics/*/long.json` brand.theme values and avoid repeating the most recent. Same-looking consecutive videos are a defect.
3. TRUTH: facts come ONLY from the user's source or live web search. Today's date comes from your environment, never from training memory. Anything time-sensitive (prices, versions, releases, "current X") without a fresh source → search the web or output `MISSING: <fact>`. Inventing stats, quotes, or dates is the worst possible failure.
4. Stage gates survive interruptions: if the user asked for Stage 1 only, session limits or "continue" do NOT authorize later stages — re-confirm.
5. Budgets are counted, not estimated. The linter is the judge; fix specs, never rules.
6. DESIGN PACKS: real visual variety comes from packs (src/designs/<pack>/ — different layouts/shapes/motion), selected via brand.design; themes only reskin. Building a pack = a dedicated approved job from a design-* skill; NEVER during video production.
8. ANIMATION TIMING — PAYOFF EARLY, BASE EARLIER: name each scene's visual payoff in the first ~70% of its narration (anchored elements animate AT the naming word and need settle time; linter warns on last-15% anchors — treat as rejection). scripts/sync.mjs guarantees a settle tail after the last anchor; never hand-trim scene tails to "tighten" pacing. Components enforce BASE ≤38 FRAMES: a scene-level anchor times only the emphasis payoff, never the whole visual (see component_authoring.md §2) — the base diagram is on screen within ~1.3s regardless of where the anchor lands.
9. Component/theme changes follow the skill's design_contract.md (Three Guards, ×scale, both-aspect proofs) and require explicit user approval. Building or fixing a scene component is a defined job: follow `.claude/skills/tech-video-director/references/component_authoring.md` (the six wiring files, theme-token adaptation across all 30 designs, the render-proof loop, and the paid-for lessons). Never hardcode colours/fonts/radii/px — read theme tokens so every one of the 30 designs reskins the component automatically; add each new component to `src/showcaseSpec.ts` so it appears in every design composition for review.
10. PHASE-GATED DELIVERY (user standing rule, 2026-07-24): for any multi-phase feature, work ONE phase at a time. After completing each phase you MUST (a) inspect the actual on-disk result, (b) run an audit — tests/gates/tsc/lint as applicable — against the real artifacts (never assume), (c) fix everything the audit surfaces, and only THEN (d) proceed to the next phase. Re-read the original requirement + the recorded plan before each phase so scope never drifts. Report the audit result per phase.
11. SECRETS: never print, echo, log, or commit API keys/tokens. Keys live only in a gitignored `.env` (`.env.example` is the tracked template). If a user pastes a live secret in chat, flag it and tell them to rotate it.
12. LONG-FORM DELIVERY (paid for on the 87-minute Linux cut, 2026-08-18). A feature-length
   render does not behave like a 5-minute one, and both failures cost a full render each:
   - **Remotion buffers every frame to disk before encoding.** Measured: 4.4 GB of scratch at 20%
     of 156,521 frames, i.e. ~21 GB for the whole timeline, against 10 GB free. Render in
     SEGMENTS (`--frames=START-END`), delete the temp dir between passes, then `ffmpeg -f concat
     -c copy`. Peak scratch drops to one segment.
   - **Remotion's audio mixer expands every scene mp3 to a full-timeline WAV.** At 147 scenes that
     is unaffordable. Render `--muted`, build the track with `scripts/build-audio-track.mjs`
     (pads each scene to its exact `durationFrames`), then stream-copy the two together. Verify
     the mux: frame count must equal the spec's, and audio drift must be ~0ms (it was 0).
   - **`kill <pid>` on a render does not stop it.** `npm exec` is a wrapper; the `node` child keeps
     running and quietly competes for CPU and disk with whatever you start next. Kill the child
     too and confirm with `pgrep -f "remotion render"` BEFORE launching a replacement.
   - **Chapter stamps roll over.** YouTube cannot parse a minute field past 59, so `62:32` silently
     broke every chapter after the one-hour mark. `gen-upload-kit.mjs` now picks `HH:MM:SS` vs
     `MM:SS` once per video from its total length.
   - **`seo.tags` is a separate field from `seo.queries`.** `queries` fills the description's User
     Queries block; `tags` fills YouTube's tag box (comma-joined, hard-capped at 500 chars). A spec
     with only `queries` ships an EMPTY tag box. Author both.
