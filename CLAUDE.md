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

## LAW 0g — THE FIRST THIRTY SECONDS ARE A CONTRACT (owner, 2026-08-16)
Owner, twice: *"In all videos, greeting is missing… saying welcome to <channel>, then asking some
questions and answering them with what we're gonna see today."* Then, sharpening it: *"you must
look at how latest videos start, how they introduce suspense, how they increase curiosity, how they
make sure the watcher relates to what they knew, or what they anticipated by clicking the video by
looking at the title or thumbnail. Introducing doesn't always mean 'Hi welcome to channel name' —
it must be absolutely different when and wherever possible."*

Both are right, and the second is the important one. **A greeting is not an intro. The intro is a
contract with a person who clicked something.** They arrived carrying an expectation set by your
title and thumbnail, and the opening either confirms that expectation or loses them. Nineteen
shipped episodes opened cold with no welcome AND no acknowledgement of why the viewer clicked.

### The three phases (this is the shape, every episode)

| Phase | Runs | Job |
|---|---|---|
| **1 · Confirm the click** | 0–5s | Continue the *exact* promise of the title and thumbnail, in the viewer's own words. They must know within a breath that they are in the right place. No welcome, no channel name, no logo — leading with branding is the single most-documented way to lose this window. |
| **2 · Promise the payoff** | 5–15s | The one concrete thing they get for staying. This is where the greeting lives, woven in — an aside, not an announcement. |
| **3 · Open the loop** | 15–30s | An information gap that only closes by watching: a question posed and deliberately not yet answered, a result shown before its method, a claim that sounds wrong. |

### The rules

1. **Echo the click promise in scene 1.** If the thumbnail says `NO BROWSER` and the title says
   *API testing with no browser*, the first sentence is about a test running with no browser. A
   viewer who cannot tell in five seconds that this is the video they clicked, leaves.
2. **Create curiosity, then SATISFY it.** That is the whole difference between a click promise and
   clickbait — both open a gap, only one closes it. Every loop opened in the first 30s must be
   paid off in the body, and the RECAP is where you prove you did.
3. **Relate to what they already know.** "You already know this one, actually" · "Remember the
   fresh context from episode eight?" · "You've hit this and you know you have." Anchoring the new
   thing to something they own is what makes a beginner feel capable instead of lost.
4. **The greeting is never a formula.** "Hi, welcome to <channel>" 22 times is a jingle, and a
   playlist binge makes it unbearable. Rotate the *form*, not just the words: a welcome; a
   mid-thought aside that happens to name the channel; a question thrown at the viewer; a
   confession; picking up a thread from last episode. **Some episodes should not greet at all** —
   if the cold open is strong and the loop is tight, forcing a welcome in damages it.
5. **Name the channel from `brand.channel`**, never a hardcoded string in shared code. The channel
   name is local content (see the brand-identity note under STANDING DEFAULTS).
6. **Never force enthusiasm.** "Let's gooo" reads worse than plain warmth. LAW 0f's test still
   governs: would you say this sentence out loud, to a colleague?

**Enforced.** `scripts/lint-spec.mjs` runs a GREETING GUARD on long specs: it REJECTS a welcome or
channel name in scene 1, warns when the opening never echoes the title/thumbnail promise, warns
when no question is posed in the opening beats (no loop opened), and warns on a second greeting.

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
