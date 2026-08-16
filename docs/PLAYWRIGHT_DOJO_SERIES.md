# The Playwright Dojo — series plan (22 episodes)

Source of truth for the content: **https://github.com/san-gitlogin/playwright-dojo**
(live at https://san-gitlogin.github.io/playwright-dojo/). Every fact, every line of code and
every terminal output in these videos comes from that repo's `src/data/act1.js`, `act2.js`,
`act3.js`, `drills.js`, `cheatsheet.js` — never from memory (CLAUDE.md LAW 3).

Decided with the owner on 2026-08-09: **one lesson = one video**, 22 episodes, **5–7 min** each
plus **one shorts cut** each, **moderndark** throughout, voice **en-US-AvaMultilingualNeural**.

---

## 1. The spine — say it once, spend it twenty-one times

The Dojo is built on one analogy, and it is the single biggest asset this series has:

> **Browser = theater · Page = stage · Locator = spotlight · Action = stage direction ·
> Assertion = the critic · Trace = the recording**

EP00 plants it. Every later episode opens by pointing at **its own slot** in that map, and never
re-explains the whole thing. This is what turns 22 uploads into one course instead of 22 unrelated
tutorials — and it is why a viewer who lands on EP14 first still knows where they are.

**Do not invent new analogies per episode.** The Dojo already assigns one to nearly every lesson
(the locator ladder mnemonic, the hand-stamp, the black box, the mail room, the pre-flight
checklist, the walkie-talkie). Use the Dojo's own — the viewer who also reads the site must find
the same words in both places.

## 2. Who is watching, and how one video serves all of them

The owner's requirement is noob → pro in the same video. That is a structural problem, not a
tone problem, and the fix is that **every episode carries three separate payloads**:

| Payload | For whom | Where it sits |
|---|---|---|
| The plain-English teach | Total beginner | The body — every idea before any code |
| The memory hook | The learner who wants to retain it | After the step it belongs to (the Dojo's `tip`) |
| The pro corner | Experienced / interview-prep | Near the end — the trap, the gotcha, the "why this is asked" |

A beginner never hits a term that has not been explained on screen first. A pro gets something
they did not know by the last 90 seconds. Neither is patronised, because the segments are
visibly labelled and a pro can see the beginner part is not for them.

**Language rules** (owner's standing direction): no unexplained jargon in narration. Terms the
lesson is *teaching* (locator, fixture, trace) get defined the first time they are spoken. Terms
the lesson is not teaching do not appear at all. Never say "it" without naming the subject —
say Playwright, the browser, the locator, the test, your terminal.

## 3. The episode skeleton — the format viewers learn to expect

Same shape every time, 14–18 scenes, 5–7 minutes. Recognisable structure is what makes a series
bingeable; the variation lives in the content and the casting, not in the running order.

| # | Beat | Runs | What is on screen |
|---|---|---|---|
| 1 | **Cold open — the pain** | 10–15s | The problem this lesson kills, shown as a real screen (a crashed run, a 25-min suite, 200 logins). Never a title card. |
| 2 | **Episode title** | 3–5s | `EP07 · Auto-Waiting` — small, fast, out of the way |
| 3 | **The anchor** | 5–8s | This lesson's one slot in the theater map, alone on screen |
| 4–N | **The teach** | ~60% | Per Dojo `step`: the idea in plain words → the real code with that step's exact highlighted lines → the real terminal output. One idea per screen. |
| — | **Memory hook** | 5–8s | The Dojo's `tip` card, dropped in right after its step |
| N+1 | **The quiz** | **~12s hard cap** | The Dojo's `challenge`: question + options on screen, a **5-second beat**, then the answer and a one-line `why` |
| N+2 | **The pro corner** | 25–40s | The interview trap / the gotcha / what breaks in CI |
| N+3 | **Recap** | 10s | One line, mapped back to the analogy |
| N+4 | **Next + CTA** | 8–10s | Next episode by name, and the Dojo address large enough to read |

**The quiz beat is the anti-boredom engine.** It is already written for all 19 lessons, it forces
the viewer to participate, and it is the single strongest retention device available here. It is
non-negotiable in every episode.

**Quiz timing is capped (owner's direction, 2026-08-09).** The video does not sit and wait for the
viewer to think — that is what the pause button is for. The shape is:

1. Question + options appear together (~3s of narration reading the question)
2. **A 5-second silent beat.** No countdown ring, no ticking, no drum roll — those turn a
   thinking gap into dead air you can feel. A quiet progress hairline is the most that appears.
3. The narration says "pause here if you want longer" **once, in EP01 only** — after that the
   audience knows the format and repeating it every episode is nagging.
4. Answer highlights, one-line `why`, move on.

**Total ≤12 seconds.** If a `challenge` cannot be read in 3 seconds, the question gets shortened
for the video (the site keeps the full wording). A quiz that outstays its welcome costs more
retention than it earns.

**Depiction rule (owner's standing direction, cost three re-shoots on the last series):** show the
real screen, never a boxes-and-arrows diagram. Code is shown as code with the right lines lit.
Terminal output is shown as a terminal. A browser is shown as a browser window. If a beat can only
be drawn as an abstract graph, the beat is wrong — re-cut it.

## 4. The 22 episodes

Slugs follow `pw-dojo-NN-<lesson-id>` so the folder order matches the playlist order and the
lesson id ties each video back to the site.

### Act I — Basics · background `aurora`

| EP | Slug | Title | Dojo tagline |
|---|---|---|---|
| 01 | `pw-dojo-01-setup` | Meet Playwright + Setup | You are the writer. The browser is your theater. |
| 02 | `pw-dojo-02-first-script` | Your First Script | Open the theater, raise the curtain, take a bow. |
| 03 | `pw-dojo-03-sync-async` | Sync vs Async | Walkie-talkie vs group chat. |
| 04 | `pw-dojo-04-locators` | Locators — Find Your Actor | The spotlight that finds elements on the stage. |
| 05 | `pw-dojo-05-actions` | Actions — Direct the Scene | Click, fill, check, select — your stage directions. |
| 06 | `pw-dojo-06-assertions` | Assertions — The Critic | expect() — the critic who checks the show went right. |
| 07 | `pw-dojo-07-autowait` | Auto-Waiting — The Superpower | Why you'll (almost) never write time.sleep() again. |

### Act II — Intermediate · background `grid`

| EP | Slug | Title | Dojo tagline |
|---|---|---|---|
| 08 | `pw-dojo-08-pytest` | pytest — Your Test Crew | Stop writing boilerplate. Just ask for a page. |
| 09 | `pw-dojo-09-pom` | Page Object Model | One drawer per room — organize or drown. |
| 10 | `pw-dojo-10-many-elements` | Many Elements — Crowd Control | When the spotlight finds a whole chorus line. |
| 11 | `pw-dojo-11-frames-tabs` | Frames, Tabs & Popups | Stages within stages, and doors to new ones. |
| 12 | `pw-dojo-12-dialogs-files` | Dialogs, Uploads & Downloads | Alert boxes, file pickers, and saving the goods. |
| 13 | `pw-dojo-13-evidence` | Screenshots, Video & Trace | The flight recorder of your test suite. |

### Act III — Advanced · background `grid`

| EP | Slug | Title | Dojo tagline |
|---|---|---|---|
| 14 | `pw-dojo-14-network` | Network — Intercept & Mock | You control the mail room now. |
| 15 | `pw-dojo-15-auth` | Auth — Login Once, Reuse Forever | The hand-stamp trick. |
| 16 | `pw-dojo-16-api-testing` | API Testing — Skip the Stage | Sometimes you call the backstage phone directly. |
| 17 | `pw-dojo-17-advanced-locators` | Advanced Locators & Shadow DOM | Spotlight tricks for the trickiest stages. |
| 18 | `pw-dojo-18-parallel-ci` | Parallel Runs & CI | Many stages at once, on a robot's schedule. |
| 19 | `pw-dojo-19-debugging` | Debugging Like a Pro | Pause the play, inspect the stage, cheat with codegen. |

### Bookends

| EP | Slug | Title | Background | Shape |
|---|---|---|---|---|
| 00 | `pw-dojo-00-trailer` | The Playwright Dojo — start here | `aurora-grid` | 60–90s. Plants the analogy, shows the road map, real clips from finished episodes. **Authored after Act I exists** — a trailer needs real footage, and cutting clips from unrendered episodes is impossible. |
| 20 | `pw-dojo-20-drill-room` | The Drill Room — 12 scenarios | `bokeh` | Game-show shape, not lesson shape: scenario → "call the move" pause → the solution. Longer than 7 min is acceptable here; may split into two if the cut demands it. |
| 21 | `pw-dojo-21-cheatsheet` | Cheat Sheet + interview answers | `plain` | Reference shape: 6 sections + the interview one-liners. Deliberately flat and scannable — this is the one people re-watch before an interview. |

**Why the backgrounds change per Act:** moderndark is the standing default and may repeat
(LAW 2), but consecutive videos that look identical are a defect. The background shifts once per
Act, so the playlist signals difficulty visually — and the scene mix shifts with it, since Act III
leans on network/parallel/CI beats that Act I never uses.

> **`grid-pulse` IS BANNED ON THIS SERIES** (owner, 2026-08-16: *"I don't like the circular
> animation going on in the background, it's very distracting"*). Act III originally shipped on
> `grid-pulse` purely to satisfy "shift the background once per Act" — but its pulsing ring is a
> large moving object BEHIND the teaching, competing with the thing the viewer is meant to read.
> Act III uses **`grid`**, the same still background as Act II. **The per-Act shift is not worth a
> single frame of distraction**: differentiate consecutive episodes with the scene mix and the
> purpose-built components instead, which is where the variety actually is. Before picking any
> background for a teaching video, ask whether it MOVES — if it does, it is competing with the
> lesson and the answer is no.

## 4b. Craft — the three things that get an episode rejected

Owner's direction, 2026-08-09: *"no misalignment, no delayed animations, no out-of-sync voice
over."* These are not new rules — the repo already enforces all three. What is new is that on this
series they are **rejection criteria, not warnings.** Below is where each one actually lives, so
nothing here is a paraphrase from memory.

### Text pretending to be a visual (added after EP01 review, 2026-08-09)

**From EP02 onward, a styled word is not an explanation.** EP01 rendered the theater mapping as
five styled rows and read them aloud. That is the weakest beat shape available, and it failed in a
specific, instructive way: **"theatre" means a cinema hall in India** and much of the world, so a
viewer pictures a projection screen, the analogy inverts, and every later episode built on it is
wrong for them. Narration cannot fix this — the narration uses the same ambiguous word.

Three questions before casting any explanatory beat:

1. **Would it still teach with the sound off?**
2. **Could a viewer elsewhere in the world picture the wrong thing?**
3. **Is anything moving, and is the motion itself the explanation?**

The spotlight *travelling across a stage and landing on one actor* teaches "locator" better than
the word ever will. When the existing library can only render an idea as styled text, that is the
trigger to **build a component** — not to settle. Component builds stay a separate phase from spec
authoring (LAW 6), but they are now expected for this series rather than exceptional.

EP01 ships as-is by the owner's decision. This rule starts at EP02.

### Misalignment

- **Three Guards on every bounded text** (`design_contract.md`): a linter character **Budget**
  sized to the *narrowest* container, a runtime **Fit** shrink, and a **Wrap** fallback.
  `whiteSpace: nowrap` is banned unless paired with `maxWidth` + fitText.
- **Alignment comes from structure, never magic numbers** (`component_authoring.md` §2). Labels
  pinned to a shape render *inside the same SVG*, never as an absolutely-positioned div — those
  drift the instant the layout changes.
- **Every dimension is `× scale`.** A raw pixel literal is a defect.
- **Optical, not mathematical, centering**: text beside an icon aligns to cap-height, not the
  line-box; the icon slot collapses with no ghost gap when the icon is absent.
- **Both aspects are first-class.** Nothing ships proven only in landscape — proof stills at
  1920×1080 *and* 1080×1920. "Looks fine wide" is half a test.

### Delayed animation

- **BASE ≤38 FRAMES.** The base visual is on screen within ~1.3 seconds of scene start, always. A
  scene-level `atWord` may time an *emphasis* payoff (a highlight, a verdict, a bracket) — never
  the whole render tree. This exists because the owner reported it directly: *"this is something I
  don't wanna see ever."*
- **Entrances 12–18 frames**, children staggered by index, **one glow/emphasis focus per frame**.
- **Motion hierarchy**: containers settle first, contents second, connectors third, emphasis last.
  A child never animates before its parent exists.
- **Payoff named in the first ~70% of the narration.** The linter warns when the last anchor fires
  too close to the scene end; on this series that warning is a rejection, and the fix is to name
  the payoff earlier in the script — never to stretch the scene.
- **Deterministic motion only**: pure functions of `useCurrentFrame()`, every `interpolate` clamped
  both sides. No CSS transitions, no unseeded randomness.

### Out-of-sync voiceover

- The pipeline is **not optional and not reorderable**: write spec → `npm run lint` →
  `scripts/voiceover.py` → **`scripts/sync.mjs`** → render. `sync.mjs` retimes every anchor in the
  scene against the *real* TTS timestamps, turning word indexes into exact frames. Rendering
  before sync means every animation fires at a guessed time.
- **Never hand-trim a scene tail to "tighten" pacing.** `sync.mjs` guarantees a settle tail after
  the last anchor; trimming it re-breaks the sync it just fixed.
- **Known trap:** `sync.mjs` rescales `atWord` to *fractional* values (3 → 2.917). Any component
  that uses `atWord` as both a time and an integer index must round for position and keep the raw
  value for timing — this silently deleted every mark in one component before.
- **Scene-level layers are covered but verify anyway**: `sync.mjs` walks the whole scene now, not
  just `scene.data`. If a new scene-level layer appears, check `sceneAnchorRoot()` in the linter.

### And the one that catches all three

**Trust the artifact, not the exit code.** A green run has already proved a scene "worked" while it
rendered an empty frame. Every episode: extract a frame from the dense middle and *look at it*.
`component-flow.mjs` in particular always exits 0 and reports failure inside its stdout.

## 4c. THE TEACHING LAWS — owner's correction, 2026-08-13, binding from EP08

Owner verdict on EP01-07: *"partially it's crap and I am not able to follow up with what it's
doing."* Measured, not guessed:

- **24 code beats across 7 episodes; not one explains code line by line.** EP05 s22 puts **12 lines
  of Python on screen for 11.7s = 1.0 second per line**. EP06 s19: 11 lines / 14.8s. A beginner
  cannot read that, let alone learn it. §5b rule 4 below ("notice the shape, not the letters") was
  an excuse for going too fast, and is hereby revoked.
- **Output was divorced from the line that produced it.** The viewer never saw *this line → this
  result*, which is the entire job of a programming tutorial.
- **Written for a reader, not a listener.** 46 sentences of 22+ words in one breath; "actually" ×20;
  quietly / genuinely / underneath / "dressed as engineering".
- **No pause, ever.** `durationFrames = words × 9.5 + 30` gives exactly **1 second** of silence per
  scene, at the end. Nothing is ever left on screen to just look at.
- **Runtime was the wrong constraint.** Capping at 5-7 min meant every trim came out of
  *explanation*, because chapters/titles/quizzes are structural and explanation is not.

### The rules now

1. **INVENT FIRST, CAST SECOND.** The casting board opens by *describing the ideal component for
   this beat* before it is allowed to look at the library. An existing component may only be cast
   if it matches that description ~90%. Otherwise it goes on the build list
   (`component_authoring.md`). Reusing a component from the previous episode needs a written reason
   it is still the best shape — "it fits" is not one.
2. **Teach code line by line with `CODE_RUN`.** Each line gets its own `atWord`, a plain-English
   note, and — if it produces anything — the result appearing beside it in the same moment.
   **≥4 seconds per taught line.** The linter now WARNS below that, and a warning is a rejection.
   `CODE_WINDOW` is for a block the viewer is *not* being asked to read.
3. **Show the page, not a description of it, with `BROWSER_STEP`.** The page is built from the
   steps; each line visibly moves something.
4. **Silent look-at-it beats.** When code or a picture lands, budget 2-3s with no narration before
   the explanation starts. The pipeline will never create these — author them.
5. **Write for the ear.** Sentences ≤14 words (hard cap 18). Everyday words only. Define any term
   the first time in its own short sentence. Say the key sentence twice, in different words.
   Address the viewer: "watch this", "look at line three".
6. **No runtime cap.** 8-12 min is fine. Viewers can speed up; they cannot un-confuse themselves.
   A lesson ends when it is clear.
7. **Judge every episode twice before shipping**: as a school owner watching a teacher, and as an
   absolute beginner. If the beginner cannot follow, it is a defect — not a nitpick.

### Amendments of 2026-08-15 (owner, mid-EP09)

**A. The per-beat second limit was capping the teaching, and it was only a warning.**
Owner: *"our hard limitation on the seconds for the content per beat is affecting how well we
explain concepts, we need to handle that somehow."* Diagnosis: `sync.mjs` **never truncates a
scene below its real audio** (`durationFrames = max(audio + 10, min(lastAnchor + 75, cap))`), so
the 16s ceiling was never a hard stop — it was the linter's STATIC-SCENE GUARD warning, which
this series treats as a rejection. That guard assumed a scene shows ONE thing and then sits
there. A **stepping** component does not. Combined with >=4s per taught line, a flat 16s capped a
code beat at FOUR lines.

Fix (both files, matching maths): the ceiling is **earned by motion**. Distinct internal anchors
past the first buy 4s each, to a hard stop of **30s**; a genuinely static card still gets 16s.

| scene | ceiling |
|---|---|
| 0-1 anchored elements (a card) | 16s |
| 3 stepped elements | 16s |
| 5 stepped elements | 24s |
| 6+ stepped elements | 30s (hard stop) |

**B. Reused editorial cards on concept beats are now a defect.** Owner: *"component usage is
still the worst … I am bored seeing all the same components again and again when you are
explaining important concepts."* Named offenders and their use counts at EP09: `STICKY_NOTE`
**27x**, `REVEAL` (nearly every episode), `SPLIT_PATHS`, `ICON_GRID`. These were being cast for
the definition, the memory hook and the comparison in *every* episode.

Rule: a beat carrying an important CONCEPT gets a purpose-built component. Exempt: structural
furniture (`HOOK`, `TITLE_CARD`, `CHAPTER`, `RECAP`, `OUTRO_CTA`, `QUIZ_CARD`) and
`CODE_RUN`/`BROWSER_STEP` (rules 2-3 mandate them). **Expect 2-4 new components per episode.**
EP09 shipped with **zero** `STICKY_NOTE`, **zero** `REVEAL`, **zero** `SPLIT_PATHS`.

### Built for EP09 (2026-08-15, all four gated + proofed MIN/MAX/MIX x both aspects x material + neobrutalism)

| Type | data_key | What it draws | Replaced |
|---|---|---|---|
| **`CHANGE_RIPPLE`** | `changeRipple` | What ONE change costs. `scattered`: the line is copied inside every dependent card, the rename lands, the repair crawls card by card and one is MISSED. `central`: the same line lives in one holder above the fleet, one edit ripples outward and every dependent heals. Running both modes in one video IS the argument. | nothing — no component related a source of truth to its dependents |
| **`RULE_TEST`** | `ruleTest` | A rule stated once in a plaque, then APPLIED to 2-4 real cases, each judged at its own word with a stamped verdict badge and a one-line reason. The linter warns if every case passes — a rule with no failing case has no edge. | `STICKY_NOTE` (the memory hook) |
| **`SAVED_SEARCH`** | `savedSearch` | A query that has NOT run. The query card sits beside a page whose elements are all untouched, chip reading "saved, not run"; at the trigger a scan band sweeps and ONE element lights. The un-run half is the lesson. | `REVEAL` (the lazy-locator claim) |
| **`RESPONSIBILITY_SPLIT`** | `respSplit` | A boundary drawn by sorting. Two labelled bins, a neutral pile between them, each real line docking to its side at its own word while the tallies climb. | `SPLIT_PATHS` (HOW vs WHAT) |

Defects found and fixed during that build, worth not re-learning:
- **A filed row that travels toward its bin by a share of the PILE's width overruns the bin.**
  At 6 lines the rows slid clean over both bin labels. Motion that must not collide should be a
  short nudge plus a **width change + edge dock + thick side border** — a row that never leaves
  its container cannot overlap its neighbours.
- **Right-aligning an unsorted row pre-announces its answer.** Gate the alignment on the filing
  progress, not on the row's side.
- **`CODE_RUN` lit the wrong line of a wrapped pair (found in EP09 s11, fixes EP08 too).**
  A continuation line inherits its head's anchor, and `lit = i === active` picked the LAST member
  of the group — so the bare `"button", name="Login")` lit while the `self.login_btn = ...` that
  gives it meaning dimmed, and the note strip went blank because continuations carry no `detail`.
  Now the whole anchor GROUP lights and the note/label come from whichever member carries them.

### 4d. THE HUMAN VOICE — owner's correction, 2026-08-16, binding from EP13

Owner: *"You often use IT, and you speak about something that's on the screen, but you forget what
the context is about, and you start speaking in a very AI manner."* Measured across the shipped
episodes, and the numbers are damning:

| | EP01 | EP08 | EP12 | EP13 (before) |
|---|---|---|---|---|
| contractions in ~900 words | 1 | **0** | **0** | **0** |
| sentence-length std dev | 7.3 | **2.9** | 5.0 | 5.4 |
| sentences opening "And" | - | - | **15** | 11 |

Zero contractions is the loudest possible tell. EP08's std dev of 2.9 means nearly every sentence
was the same length — a direct side effect of the "<=14 words" rule being read as a target rather
than a ceiling.

The fix is CLAUDE.md **LAW 0f** plus a HUMAN-VOICE GUARD in `lint-spec.mjs` that measures four
signals over the whole spec and warns on each: burstiness (sentence-length std dev), pronoun-opener
share, repeated openers, and contraction rate. On this series those warnings are rejections.

EP13 was rewritten under the new law before voicing. Earlier episodes ship as they are — the owner
was explicit that only videos rendered from here on matter.

### Built for EP10-EP11 (2026-08-15, all five gated + proofed MIN/MAX/MIX x both aspects x material + neobrutalism)

| Type | data_key | What it draws | Episode |
|---|---|---|---|
| **`CROWD_MATCH`** | `crowdMatch` | One query resolving to MANY elements: the whole set lights at once with a live count badge, then group readouts (`count()`, `all_inner_texts()`, `all()`) land one at a time beside it. `pickIndex` singles one out for first/last/nth; `strict` stamps the set as illegal to ACT on. The plural cousin of `SAVED_SEARCH`. | EP10 |
| **`ROW_FILTER`** | `rowFilter` | Narrowing AND containment in one picture: every row carries the same child control, the condition lands, the failures drop away, and the SURVIVOR's control is pressed while the identical ones stay untouched. The table-row recipe interviewers ask for. | EP10 |
| **`INDEX_DRIFT`** | `indexDrift` | Two pointers on one row — one by INDEX, one by MEANING. The list re-orders; the index pointer stays put and is now aimed at a stranger while the meaning pointer travels. Ordering-independence, drawn. | EP10 |
| **`FRAME_BOUNDARY`** | `frameBoundary` | A document inside a document, and a search that cannot cross it. The sweep dies at the dashed border with a timeout stamp while the target sits plainly visible inside; the crossing call then steps over and the same locator lands. | EP11 |
| **`TRAP_TRIGGER`** | `trapTrigger` | Ordering as correctness. Two events, and the ORDER decides whether the third thing exists. `trap` = listener first, event caught; `missed` = action first, the event flies past an unarmed catcher. Showing the failing order is what turns a with-block from syntax into an answer. | EP11 |

Defects found and fixed during those builds:
- **A row travelling by a share of its CONTAINER's width overruns its target.** `RESPONSIBILITY_SPLIT`
  at 6 lines slid clean over both bins; `ROW_FILTER` at MAX pushed dropped rows past the browser
  frame's left edge. Fix in both: a short nudge plus a **width change + edge dock**, so a moving
  element can never leave its container.
- **Three ceiling-length segments cannot share one line.** `ROW_FILTER`'s chain
  (`rows.filter(...).click()`) is the payoff sentence — it now WRAPS. Truncating the line the
  lesson is teaching is never acceptable.
- **Right-aligning an unsorted row pre-announces its answer** — gate alignment on filing progress.
- **A component whose "off" state is only reachable by omitting an anchor still fires on its
  default.** `FRAME_BOUNDARY` crosses at `sweepStart + 110` when `crossAtWord` is absent, so a
  scene meant to hold the failure forever crosses anyway. The fix was editorial, not code: merge
  the symptom and the crossing into ONE scene rather than fake a never-crossing state.

### Built for EP18-EP19 (2026-08-16, all four gated + proofed MIN/MAX/MIX × both aspects × material + neobrutalism)

| Type | data_key | What it draws | Episode |
|---|---|---|---|
| **`WORKER_SPREAD`** | `workerSpread` | A queue dealt out across parallel lanes against a wall clock. The lanes fill at their own rate and finish ragged, and the sequential total sits struck through beside the parallel one. The work never got faster — it got spread, and the linter *warns* when the `note` is missing, because parallelism without "only because tests are isolated" teaches a foot-gun. | EP18 |
| **`ORDER_ROULETTE`** | `orderRoulette` | The same chained tests dealt four times, landing in a different order each run, verdict flipping PASS/FAIL/FAIL/PASS. The instability IS the picture: the linter rejects an all-fail or all-pass roulette, because one failing run reads as a bug somebody could go and fix, and the lesson is that there is nothing fixed to fix. | EP18 |
| **`FROZEN_FRAME`** | `frozenFrame` | A LIVE run held mid-breath. The playhead walks the script and the page changes with it, then the freeze line stops everything dead — playhead locked, page keeping its half-filled state, Inspector sliding in. Rejects a freeze on the first line (nothing has moved, so there is no stillness) or the last (nothing left to step into). | EP19 |
| **`RECORD_DRAFT`** | `recordDraft` | Actions becoming code in real time, then an honest verdict on the output: keepers light, the rest greys out with a reason, and the "no assertions / no test names / no structure" flags land under it. Rejects a draft with nothing dropped — that sells generated output as a finished test, the exact defect it exists to show. | EP19 |

**`TRACE_SCRUB` was deliberately NOT reused for EP19's `pause()` beat.** A trace is a recording of
a run that already finished; `pause()` is a live run you can still interact with. Casting the same
component for both would quietly teach that they are the same tool — the precise confusion the
lesson exists to prevent. Rule 8's "build it" test is semantic, not visual.

### Built for EP17 (2026-08-16, all three gated + proofed MIN/MAX/MIX × both aspects × material + neobrutalism)

| Type | data_key | What it draws | Episode |
|---|---|---|---|
| **`SEARCH_NARROW`** | `searchNarrow` | A search that gets SMALLER. Each link enters a region: the sibling at that level collapses to an empty stub, the chosen one keeps the light, and the next level opens indented *and narrower* inside it. By the last link the target has nowhere left to hide. The shrinking room is the lesson — the selector never got longer. | EP17 |
| **`SET_LOGIC`** | `setLogic` | An operator evaluated over a real shelf of candidates, each carrying the properties it actually has. Survivors light green with a ✓, rejects grey out and sink with a ×, and a live count ticks as they resolve. Used TWICE in EP17 on purpose — same shape, `and_` then `filter(has_not=)` — because "same shelf, different operator, different answer" is exactly what it was built to show. | EP17 |
| **`SEALED_BOX`** | `sealedBox` | A shell that looks like it should block access and mostly does not. Probes travel toward the wall in turn; the ones that pierce cross it and light the sealed contents, the exception recoils with a stamp. The picture is the EXCEPTION, so the rule has to visibly succeed first. | EP17 |

Rules these three encode, each of which caught something:
- `SEARCH_NARROW` **requires links to fire in narration order** — level 3 opening before the search
  has entered level 2 would contradict the voice on screen.
- `SET_LOGIC` **rejects an operator that keeps everything or nothing.** A predicate with no rejects
  is a list; one with no survivors teaches nothing about the operator.
- `SEALED_BOX` **requires ≥1 'through' probe and at most 1 'blocked'.** All-blocked reads as a wall
  (the opposite lesson); several blocked reads as a general barrier rather than one exception.

**Layout defect paid for here:** `marginLeft` on a full-width child pushes it past the body edge and
spills its contents outside the frame. A nested/indented level must set **`width: bodyW - indent*i`
alongside the margin** — which also happens to be the thing the component is trying to show. And a
collapsing sibling must keep a visible outline: a half-truncated word with no container around it
reads as a rendering glitch, an empty stub reads as "walked past".

### Built for EP16 (2026-08-16, both gated + proofed MIN/MAX/MIX × both aspects × material + neobrutalism)

| Type | data_key | What it draws | Episode |
|---|---|---|---|
| **`BACKSTAGE_PHONE`** | `backstagePhone` | Two routes to the same answer, RACED. The top lane walks the long way through stage steps with a clock climbing beside each; the bottom lane is one direct hop that lands mid-queue, and a verdict badge drops when it answers. The gap between the two clock readings is the whole lesson — nobody is told the API is faster, they watch it win. | EP16 |
| **`STAGE_HANDOFF`** | `stageHandoff` | One job, two transports. Scaffolding runs down a dim rail with its cost stamped beside it; a handoff marker fires; the remaining steps walk onto a lit stage inside real browser chrome. The LIT PROPORTION is the argument — how little of the run is the thing under test. | EP16 |

Two things worth keeping from these builds:
- **A component can enforce its own editorial contract.** `BACKSTAGE_PHONE`'s linter *rejects*
  `hopAtWord >= the last step's atWord`, because a phone that answers after the play has finished
  is no longer a race — it is two lists that happen to be stacked. The rule caught a real authoring
  bug on the first EP16 build and forced a better narration (the phone now interrupts mid-queue).
  Likewise `STAGE_HANDOFF` rejects an `api` step after the first `ui` step, because the component
  draws one rail then one stage and interleaving would silently reorder the steps against the voice.
- **`flex: 1` across a horizontal lane is an aspect trap.** Five steps sharing a vertical lane
  truncated every label to three words. `flexWrap: 'wrap'` with an aspect-aware
  `flex: 1 1 <basis>px` wraps to two rows instead of shrinking each pill into uselessness. Check
  any multi-item horizontal lane at MAX in VERTICAL before shipping it.

### Built for these laws (2026-08-14, all three gated + proofed MIN/MAX/MIX × both aspects × material + neobrutalism)

| Type | data_key | What it draws |
|---|---|---|
| **`CODE_RUN`** | `codeRun` | The whole program on screen (dimmed); one line lights at its own word, a plain-English note crossfades in a fixed strip, and that line's result lands in the pane beside it. Debugger-stepping grammar. |
| **`BROWSER_STEP`** | `browserStep` | A browser built FROM the code: a `fill` step makes an input, `click` the button, `assert` the banner. Each step fires at its word and the element visibly does the thing. |
| **`OVERLAY_BLOCK`** | `overlayBlock` | A click being intercepted: banner covers the button, pointer travels in and BOUNCES (shared `bounceTravel` wall grammar), a wait pill holds, the banner lifts, the same pointer lands and presses. |

Component defects found and fixed during that build, worth not re-learning: `t.colors.panel` is
**translucent** in several themes — anything that must OCCLUDE needs the opaque
`bg + linear-gradient(panel,panel)` idiom; a `z-index` on a positioned wrapper creates a stacking
context that **traps** its children's z-index; and a fixed-offset absolutely-positioned button
overflows at MAX budget — anchor to an edge and let the moving part travel by percentage.

## 5. Casting — per beat, never one-shot

LAW 0c is binding: components are chosen **per beat** through the casting board
(`node scripts/cast.mjs <beats.json>`), with a stated reason per pick recorded in
`topics/<slug>/casting.md`, and **≥2 never-used picks** per episode where an honest fit exists.
Measured cost of skipping this: 81 of 137 components never got used.

So this plan deliberately does **not** pre-assign components. What it fixes instead is the
*candidate pool* per recurring beat, to be narrowed at the board:

- **Cold open (the pain)** — something that depicts the failure literally: a broken run, a stalled
  suite, a wall of repeated logins
- **Code + highlighted lines** — a real code surface that supports per-line emphasis, since every
  Dojo step ships its own `hl` array
- **Terminal output** — a real terminal surface; the Dojo ships genuine captured output, so this
  must never be faked as a generic "success" animation
- **Memory hook** — a card/pull-quote surface that can hold 3–5 short lines
- **Quiz** — a question-with-options surface where one option can be revealed correct
- **Ladders/lists** (the locator ladder, the pre-flight checklist, the debugging toolbox) — ordered
  list or ranking surfaces
- **Comparisons** (sync vs async, Playwright vs Selenium, fill vs typing, UI vs API) — versus surfaces
- **Anything with a step order** (the script skeleton, trap-then-trigger, login-once-reuse) — flow
  or timeline surfaces

Specialist components must be **≥¼ of scenes** in every episode (owner's standing rule; the linter
warns and warnings are treated as rejections here).

## 5b. The code-width constraint — measured, and it binds every episode

`CODE_EDITOR` enforces **≤10 lines, each ≤38 characters** (tabs = 2 spaces) as hard linter
**errors**, sized to the narrow vertical container. Its embedded terminal allows cmd ≤48, output
≤44 chars × ≤4 lines. `TERMINAL_SESSION` allows 1–3 commands, cmd ≤48, output ≤4 lines ≤52.

Measured against the Dojo's real code:

| | |
|---|---|
| code blocks | 55 |
| total code lines | 488 |
| **lines over 38 chars** | **240 — 49.2%** |
| longest line | 78 chars |
| longest block | 19 lines (cap is 10) |
| **blocks needing rework** | **53 of 55** |

So half the course's code cannot be pasted in as-is. **This is not a problem to route around — it
is the constraint that makes the videos good.** A 19-line block at the type size needed to fit is
unreadable on a phone and unteachable at any size. The rule for this series:

1. **Show the excerpt, not the file.** Every Dojo step already ships an `hl` array naming the
   exact lines it is teaching. Show those lines plus just enough neighbours for context — 4 to 8
   lines, never the cap of 10 unless the block genuinely needs it.
2. **Wrap long Python at legal break points.** `browser = p.chromium.launch(headless=False)` (43)
   becomes two lines that are still valid, runnable Python. Wrapping is honest; truncating is not.
3. **Never invent or abbreviate code into something that would not run.** If a line cannot be
   shown truthfully inside the budget, the beat gets split into two screens instead.
4. ~~**The full block still gets shown once per lesson** as a "notice the shape, not the letters"
   beat.~~ **REVOKED 2026-08-13 (see §4c).** That rule was an excuse for running code past the
   viewer at 1.0-2.5s per line. Code the viewer is asked to READ is taught line by line with
   `CODE_RUN` at **>=4 seconds per line**, with each line's result beside it. A whole block may
   still appear when the viewer is explicitly NOT being asked to read it (a "this is what a test
   file looks like" establishing shot) — that is `CODE_WINDOW`, and it must be the exception.

Terminal output gets the same treatment: the Dojo's captured output is real and must stay real, so
long lines are shown as the excerpt that carries the result, never reworded.

## 6. Assets

**The Playwright mark — sourced from Wikimedia Commons at the owner's direction (2026-08-09):**

- `public/assets/playwright_wordmark.svg` — [File:Playwright_Logo.svg](https://commons.wikimedia.org/wiki/File:Playwright_Logo.svg),
  952×192, **Apache-2.0**, artist **Microsoft**, credited upstream to
  `microsoft/playwright` `packages/recorder/public/playwright-logo.svg`. Provenance in `SOURCES.json`.
- `public/assets/playwright_logo_sq.svg` — a **derived** square-canvas wrap of the above (952×952
  viewBox, wordmark centred at y=380, no pixels altered). Needed because `AssetIcon` renders every
  `img:` asset in a **square** box with `objectFit: cover`, which would crop a 5:1 wordmark down to
  its middle. Use the square file in any icon-shaped slot, the wordmark in wide title/CTA slots.

Apache-2.0 §6 grants no trademark licence, so the mark is used **nominatively** — to identify
Playwright in a tutorial about Playwright. The earlier repo-sourced square mark was deleted as
superseded, and its `SOURCES.json` entry removed so the record still matches what is on disk.

> **RESOLVED in EP01 (2026-08-09).** SVG renders correctly through `AssetIcon` — no rasterising
> needed. But the wordmark's **text path ships as `#111111`**, which is invisible on a dark
> thumbnail. The derived square file recolours that one fill to `#FFFFFF` (matching Playwright's
> own dark-background usage on playwright.dev); mask artwork and colours are untouched. Both the
> square wrap and the recolour are recorded in `SOURCES.json`. A first attempt recoloured
> `#2D4552` and was wrong — that is the mask outline. The text is **path 7, spanning x 45–740**.

## 6b. Calibrations paid for in EP01 — apply to every remaining episode

**1. `data_key` wrapping is the single most dangerous mistake here.** Components read
`scene.data.<data_key>`, and the linter **skips validation entirely when the key is absent**. Writing
fields at the top level of `data` therefore produces a scene that renders **completely empty and
still passes lint clean.** In EP01 this hit every scene except the five top-level types (HOOK,
TITLE_CARD, LIST_BUILD, RECAP, OUTRO_CTA) and was invisible until the proof stills were *looked at*.
The per-episode builder must wrap from the manifest (`MANIFEST[type].data_key`) rather than by hand.
The moment the wrap was fixed, the linter immediately caught a real budget breach it had been
silently skipping — so a suspiciously clean lint on a new spec is a symptom, not a success.

**1b. NEVER re-run the episode builder after `sync.mjs` has run.** The builder regenerates
`long.json` from scratch with *estimated* durations and *integer* anchors. `sync.mjs` has by then
replaced every duration with the real audio length and every `atWord` with a fractional frame-exact
value (`2.833`, `7.417`…). Re-running the builder silently throws all of that away, and the spec
still lints clean — you would only find out when the render fired every animation at a guessed
time. For a metadata-only fix (a title, a tag, `meta.seo`, `onePayoff`), **edit `long.json`
directly** and leave the builder alone; update the builder source too so a future from-scratch
rebuild agrees, but do not execute it.

**1c. `meta.onePayoff` must be a NOUN PHRASE, not a sentence.** The upload kit renders it into a
fixed house pattern — *"In this video, &lt;channel&gt; breaks down &lt;onePayoff&gt;"*. A sentence
produces "breaks down Playwright drives real browsers from Python", which is broken English in the
YouTube description. Write it to complete the clause: *"how Playwright drives real browsers…"*.

**1h. The description's SOURCES block comes from `scene.data.source` — TOP LEVEL ONLY (EP05).**
A `source` nested under a component's data_key (`data.stickyNote.source`) renders on screen as a
footer and is invisible to `gen-upload-kit.mjs`. EP03 got its links by accident (CHAT_MOCKUP and
STAT_CALLOUT have no data_key); EP04 printed "0 sources". Every episode should mirror the Dojo URL
up after the builder's last `add()`:
`S[S.length - 1].data.source = 'san-gitlogin.github.io/playwright-dojo';`
The component ignores the extra key, so it is metadata-only — safe on an already-synced `long.json`
with no re-render.

**1i. A manifest field is not proof the component draws it (EP06).** `TIMELINE`'s milestone `sub`
is in the manifest, is budget-checked by the linter at ≤30 chars — and `charts/Timeline.tsx` draws
only `date` and `title`. Everything written into `sub` vanishes silently, exactly like the
`data_key` (1) and nested-object (1e) failures. **Milestones are also spaced EVENLY, never by their
date**, so a timeline cannot show that two events share an instant; say it in the `date` chip
(`0 ms` → `still 0 ms` → `800 ms`). Before writing any field, grep the component for it.

**1j. Some components have a semantic that quietly contradicts the beat (EP06).** Three found in
one episode, each of which lints clean and renders "fine":
- **`CHECK_SWEEP` turns a caught row GREEN.** Its model is *gate catches → gets repaired → passes*,
  so `caughtIndex` with no repair renders a green tick under a "1 problem found" stamp. Use it for
  an all-clear sweep; put a genuine failure in a component that stays failed.
- **`THEATER_STAGE` `curtain: 'falling'` closes the curtains over frames 10–34** and leaves the
  rest of the scene as a solid drape with the actors hidden. It is an *exit* beat only. For "the
  show is over", use `curtain: 'up'` and let the caption carry it.
- **`CYCLE_LOOP` does not cap its node anchors at 38 frames** the way `THEATER_STAGE` does, so a
  late `atWord` leaves the screen empty (LAW 8). Anchor its nodes inside the first ~20%.

**1k. `REVEAL` renders NOTHING before its anchor — and it shipped that way in five episodes
(found in EP06).** `src/scenes/Reveal.tsx:16` is `const start = wordToFrame(d.atWord ?? 1)` with
**no `Math.min(…, 38)`**, unlike `THEATER_STAGE`, so the kicker, statement and sub are all gated on
one anchor and the scene is blank until it fires. `wordToFrame` is `(word − 1) × 12`, so a synced
`atWord` of 14.08 = **157 frames = 5.2 seconds of empty screen**. Audit across the series:

| Episode | Scene | Blank open |
|---|---|---|
| EP01 | s10 / s15 / s29 | 4.2s / 1.4s / 1.6s |
| EP02 | s11 | 3.2s |
| EP04 | s28 | 2.8s |
| EP05 | s17 | 4.3s |
| EP06 | s14 | 5.2s — **fixed + re-rendered** |
| EP07 | s21 | 7.2s — **fixed before first render** |

**Interim rule: anchor `REVEAL` with `A(0.05)`, never on the payoff word.** The card comes up at
once and holds; that is strictly better than a black screen, and it is the only fix available from a
spec. Note the anchor cannot be trusted pre-sync either — `sync.mjs` remaps `atWord` to the frame
the word is *actually spoken*, so a "small" integer can still land late if the read is slow.
**The real fix is a one-line cap in `Reveal.tsx`, which is a component change (LAW 6/9) and needs
its own approved job** — plus re-renders of EP01, EP02, EP04 and EP05 if those are to be corrected.
Check any component that gates its whole tree on a single anchor for the same bug.

**1d. `out/upload.md` is generated by `render-topic.mjs`, not by Remotion.** Rendering by calling
the Remotion CLI directly (which this series does, see below) skips it — run
`node scripts/gen-upload-kit.mjs <slug>` manually afterwards.

**1e. Nested object fields are objects, and the linter does not check inside them (EP04).**
`SPLIT_PATHS`'s PathCard takes `badge: {text, color}` and `lines: [{text, color?}]`. Passing plain
strings renders an **empty pill and blank rows** — and lints clean, exactly like the `data_key`
failure above. Same rule applies to any manifest field noted as `{…}` or `items`: read the
component source before writing it, and never trust a clean lint as proof a scene has content.

**1f. The 16-second scene warning only fires AFTER `sync.mjs`.** Real Ava audio runs longer than
9.5 fpw on comma-heavy lists — a spoken list of six items came back ~1.5s over estimate twice in
EP04. The fix is to edit the builder and re-run **build → voiceover → sync in full**; that is the
legitimate loop (what 1b forbids is re-running the builder *alone* after sync). Budget two passes
on any episode with a read-aloud list.

**1g. Anchor the quiz reveal to an exact phrase, not a fraction (EP04).** EP03 anchored
`revealAtWord` at 62% of the narration and lit the answer up *before the question had finished
being read*. Shape that works: question + options in the first ~45% of the words, the "pause here
if you want longer" invitation next (that gap plays as ~4 seconds of thinking time), the answer at
~74%, anchored by a `W('Ready?')`-style exact-phrase helper in the builder.

**2. The 12-frames-per-word budget overestimates Ava by ~25%.** EP01 estimated 5.60 min from
`words × 12 + 30` and came back **4.46 min** after `sync.mjs` re-timed it against the real audio.
Measured rate: **≈9.5 frames per word (~0.32 s/word)**, not 12. To land inside the 5–7 min target,
size the script at roughly **1000–1300 narration words**, not the ~800 that 12 fpw suggests. The
pre-sync number printed by the builder is an over-estimate every time — never trust it as the
delivered runtime.

**Available as built-in brand marks:** `si:python`, `si:pytest`, `si:selenium`, `si:github`,
`si:firefox`, `si:googlechrome`, `si:safari`. **`si:playwright` does not exist** — do not reach
for it.

**To capture with `scripts/snap.mjs`** when the episodes that need them come up: the Dojo site
itself (EP00, and every episode's CTA), playwright.dev (EP01), the Trace Viewer (EP13), the
codegen window (EP19).

**Thumbnails:** the Playwright mark plus that episode's own set-piece. Never a bare lucide glyph
(standing rule). Channel logo stamps automatically via `brand.logo`.

## 7. Production order and the gate on each episode

**EP01 is the pilot.** It is authored, rendered and reviewed *alone*, because it settles the
skeleton, the pacing, the card styling, the quiz timing and the SVG-logo question for all 22. Only
after the owner approves EP01 does the series go into sequence.

Then: Act I in order → Act II → Act III → EP00 trailer (needs real clips) → EP20 → EP21.

Per-episode gate, in this order, before anything is called done:

1. Beat map → `cast.mjs` → `casting.md` with a reason per beat
2. Write both specs (long + shorts)
3. `npm run lint` — must pass; **warnings count as rejections on this series**
4. Proof stills (`scripts/proof.mjs`) — and actually *look at them*
5. Voiceover → `sync.mjs`
6. Render → **extract a frame from the middle and look at it** (a green exit code has proven
   nothing here before)
7. `out/upload.md` reviewed — title, description, chapters, playlist position

**Phase gate (LAW 10):** one episode at a time. Finishing EP01 does not authorise EP02 — the owner
re-confirms. Session limits and "continue" do not carry the gate.

## 8. Playlist and upload

Playlist: **The Playwright Dojo — Playwright + Python**, ordered EP00 → EP21. Every description
ends at the live site and the repo. Each episode's `meta.seo` is authored at spec time; chapters,
timestamps and sources are machine-derived and never hand-written.

Titles are written for search, not for cleverness — a beginner types "playwright locators python",
so EP04's title carries those words. The Dojo's own tagline becomes the hook line in the
description, not the title.
