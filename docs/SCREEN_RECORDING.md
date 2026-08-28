# SCREEN RECORDING — the LIVE PERFORMANCE layer

> **This file is the AUTHORITY for the screen-recording work.** `CLAUDE.md` holds the laws,
> `docs/STATE.md` holds repo-wide state, this file holds *this subsystem*: the plan, what is
> implemented, what is pending, what must be tested, and every gotcha already paid for.
> **Update it in the same commit as the work it describes.** A session that gets compacted
> re-reads this file and continues without re-deriving anything.

---

## 0. THE GOAL, IN ONE PARAGRAPH

iAuteur today is a **synthesis** engine: 341 components *draw* an idea; nothing on screen ever
happened. This subsystem adds a second source of truth — **captured reality**. Real software,
really executed, really recorded, sitting inside the same spec, on the same clock, under the same
laws, with iAuteur overlays drawn on top. The viewer sees the thing actually work and can
reproduce it. **Recordings never publish to the repo; they stay local.** A small curated set may
ship as *examples* so other people (and their AIs) can see the shape of the output.

## 1. THE ONE HARD PROBLEM

A synthesised scene is paced by the **voice** (`atWord` → `wordToFrame`). A screen recording is
paced by **whatever the machine did that day**. Every law in CLAUDE.md — 0i (picture moves with
the voice), 0e.2 (>=4s per taught line), 0l (setup stays on screen) — assumes the visual obeys the
voice. **Dropping an mp4 into a spec imports the exact defect the 2026-08-17 owner verdict was
about, permanently, because it is baked into pixels.**

**Therefore: never capture a blob. Capture a SEGMENTED PERFORMANCE + an EVENT MANIFEST.**
Every demo is a machine-executed script. The runner emits video *plus* JSON of what happened when
and where on screen. That manifest is what makes footage retimable, anchorable, overlay-able and
re-recordable.

### Three invariants (candidate LAW 0m — promote to CLAUDE.md once P1 lands)

1. **A recording is never a blob.** Always *segments + manifest*. No spec may reference a whole
   capture file.
2. **No recorded or overlay component contains a fixed frame interval.** LAW 0i.1 applies
   verbatim. Footage gets no exemption.
3. **The runner owns the whole viewport.** Anything on screen the runner did not put there is a
   bug, not a recording.

### The anti-hallucination rule (owner, 2026-08-26 — non-negotiable)

> *"you must have solid control over what is being executed, and what the terminal would actually
> display, at no cost there must be hallucinations, assumptions, skipping of showing crucial parts."*

**Every character shown as terminal output MUST have been read back from the real terminal.**
No reconstruction, no "what it would print", no elision. If the runner cannot read the output
back, the recording FAILS — it does not guess. Exit codes come from the shell, not from
inference. This is a hard gate in the runner, not a guideline.

---

## 2. DECISIONS TAKEN (owner, 2026-08-26)

| # | Decision | Consequence |
|---|---|---|
| D1 | **Option A "Stage Crew"** — Playwright-driven browser + real terminal. No OS screen-grabbing. | One code path, cross-OS, deterministic, bbox-driven overlays. |
| D2 | **VS Code for Web via `code serve-web`** is the IDE surface. | Collapses "IDE capture" into the browser runner. Any tech stack demoable. **VERIFIED WORKING** — see §3. |
| D3 | **Real Playwright Chromium**, not Remotion's bundled `chrome-headless-shell`. | The shell has *no automation client* — `snap.mjs` only uses the `--screenshot=` CLI flag. It physically cannot do input. Playwright is required, not preferred. |
| D4 | **Renders and recordings stay LOCAL.** Never pushed. A curated few ship as examples. | The heavyweight OCR safety seal (old R1/S7) is **descoped** to light provenance + opt-in redaction. Owner: *"I don't care if my recording has my name in it, it will be the same for users."* |
| D5 | **Local VM / Ubuntu box is a FUTURE surface**, not MVP. | Owner acknowledges it gives confidence for full-screen capture but "needs higher cadence". Design the runner interface so it slots in. |
| D6 | Owner does not always watch his own cuts end-to-end. | The pipeline must *catch* problems mechanically — contact sheets, lint gates, buffer diffs — not rely on review. |
| D7 | **VS Code renders DARK by default; light is an option, never the default** (owner, 2026-08-26). | `demo.json` takes `theme: "dark" \| "light"`, defaulting to `"dark"`. The settings module maps it to a real VS Code theme id — `Default Dark Modern` / `Default Light Modern` — and everything else in the recipe (font sizes, DOM renderer, cursor) is theme-independent. Never hardcode a theme id at a call site. |

---

## 3. VERIFIED FACTS (measured on this machine, 2026-08-26 — never re-derive)

Machine: Windows 11, node v24.13.1, npm 11.8.0.

| Fact | Evidence |
|---|---|
| VS Code **1.134.0** installed; CLI at `/d/Program Files/Visual Studio Code/Microsoft VS Code/bin/code` | `code --version` |
| **`code serve-web` exists and serves** | HTTP 200, 4271 bytes at `127.0.0.1:9911`. Flags: `--port --without-connection-token --accept-server-license-terms --server-data-dir --default-folder --connection-token` |
| First launch **downloads** the server; returns **HTTP 202** with a self-reloading page until ready | Must poll for 200, not just for the port to open |
| **Playwright 1.62.1** installed as devDependency; Chromium build **1234** (+ headless shell) at `~/AppData/Local/ms-playwright/` | `npx playwright --version` |
| Playwright **drives the VS Code Web workbench** | `.monaco-workbench` present; `?folder=<abs path>` opens the folder (Explorer showed `ws`) |
| **Command palette works** — `Control+Shift+P` then typing filters correctly | screenshot `p1-02-palette.png` |
| **THE INTEGRATED TERMINAL REALLY EXECUTES** — real PowerShell, real cwd | `echo NONCE1787750823682` → `NONCE1787750823682`; `python hello.py` → `Hello, iAuteur!` |
| `ffmpeg` + `ffprobe` on PATH (gyan.dev full build, 2026-04-30) | `ffmpeg -version` |
| Repo already has the render-side video primitive: `ClipVideo`/`VideoBackdrop` on `OffthreadVideo` in `src/video.tsx`, with freeze-past-duration | read the file |
| `scripts/sync.mjs` retargets **any** key matching `/atword$/i`, recursively | read the file — **this is why S2 is achievable with a zero-line diff** |
| Asset protocol today: `img:` `si:` `lucide:` in `src/AssetIcon.tsx` + `resolveSrc` in `src/video.tsx`. No `vid:`/`rec:` yet | grep |

### GOTCHAS ALREADY PAID FOR

1. **Neither `--server-data-dir/data/User/settings.json` NOR workspace `.vscode/settings.json`
   drives the web client.** Both were tried; the browser came up **light-themed** with the Welcome
   page both times. Web user settings live per-origin in the **browser**, not on the server.
   **SOLVED** — see "The settings recipe" below.
2. **`.xterm-rows` had 0 nodes; `.xterm canvas` had 4** — xterm.js was on the canvas/webgl
   renderer, so terminal text was unreadable from the DOM even though it rendered fine visually.
   **SOLVED** by `terminal.integrated.gpuAcceleration: "off"`, which switches xterm.js to the DOM
   renderer. Verified: `rows:1, canvas:1`, and the buffer read back exactly.
3. **Frame pollution out of the box:** a `Welcome` tab, the **Chat / Copilot side panel**, a
   *"A git repository was found in the parent folders"* toast, and a *"Show welcome page on
   startup"* checkbox. All must be suppressed in the PREP phase.
4. **The default prompt is enormous** — the full absolute scratch path wrapped across two lines and
   looked terrible. Recording workspaces need a short path and a clean prompt.
5. Probe scripts must live **inside the repo** or `import 'playwright'` fails to resolve
   (`ERR_MODULE_NOT_FOUND`) — node resolves from the file's directory, not cwd.
6. VS Code Web shows `Ctrl+Shift+C` for *Create New Terminal* (not the desktop backtick binding) —
   web keybindings differ. **Drive by command palette, never by raw keyboard shortcut.**
7. Bash heredocs in this environment break on backticks/quotes in prose. Write large docs with the
   Write tool, not `cat <<EOF`.
8. **The secondary side bar comes BACK after a settings reload.** `View: Close Secondary Side Bar`
   in prep looked like it worked, then the Chat/Copilot column reappeared because the workbench
   restores its own layout on boot. Two fixes, both needed: the setting
   `workbench.secondarySideBar.defaultVisibility: "hidden"`, **and** a verify-and-retry loop in
   `prep()`. General lesson: **a palette command is fire-and-forget — assert the effect, then
   retry.** A blind invocation silently left a whole column in frame.
9. **Do not require the terminal buffer to GROW to detect command completion.** `clear` SHRINKS
   it, so priming hung for the full 120s timeout and threw. Completion is "the buffer CHANGED, it
   now ends at a prompt, and it has stopped moving".
10. **VS Code shell integration gives NO exit codes here.** Measured in VS Code Web + PowerShell:
    `.terminal-command-decoration` count 0, every exit code null. Worse, setting a custom
    `terminal.integrated.profiles.windows` to get a short prompt **displaces the args VS Code uses
    to bootstrap shell integration**, so that path makes it strictly worse.
    **Solution — the prompt hook.** PowerShell runs `prompt` after every command, so the primed
    prompt captures `$?` and `$LASTEXITCODE` and writes them to a file outside the workspace,
    printing nothing. Zero pixels of pollution, and the value is the shell's own. Verified:
    a successful command reports 0/ok=true, a failing one reports 2/ok=false.
    `$ok = $?` must be the FIRST statement in the function — almost anything else resets `$?`.
11. **An assertion that can pass while blind is worse than no assertion.** The renderer check ran
    before any terminal existed and read `rows=0, canvas=0`, which satisfied
    `rows > 0 || canvas === 0` and reported PASS. It now runs after `openTerminal()` and asserts
    `rows > 0` strictly. Check what a green tick would look like if the feature were absent.
12. ⚠ **THE BIG ONE: `?folder=<path>` DOES NOT WORK with `code serve-web`.** The workbench
    resolves that path in the **browser's** context, where there is no file system. Measured
    symptoms: the Explorer shows the workspace as an unreadable **leaf** (`aria-expanded=null`,
    zero children, and clicking / ArrowRight / *File: Refresh Explorer* all do nothing), and
    Quick Open returns `[]` for a file that is definitely on disk.
    **What makes this so confusing is the split:** the integrated terminal runs SERVER-side, so it
    sits in the folder happily and runs its files — the shell can see files the editor cannot.
    Chasing it as a "collapsed tree" or a "bad workspace location" wasted a full diagnostic cycle
    (both a repo path and an OS-temp path behaved identically, which is what finally ruled the
    location out).
    **The fix:** bind the folder at server start with the CLI flag `--default-folder <abs path>`
    and navigate to the **bare server URL with no query string**. Verified: the Explorer then
    lists `hello.py` and `notes.txt` at `aria-level 1`.
    **Consequence for the design:** a serve-web instance is bound to ONE folder for its lifetime,
    so each recording starts its own server on its own free port and stops it afterwards. There is
    no cross-recording server reuse. `stop()` also reaps whatever still holds the port, because
    `code` on Windows is a shell shim and killing it can leave the real server alive.
13. **WORKSPACE TRUST blocks the terminal.** The moment the folder is genuinely open, VS Code
    puts up *"Do you trust the authors of the files in this folder? Creating a terminal process
    requires executing code"* and a Restricted Mode banner. The terminal then exists
    (`.xterm-rows` = 1) but stays **empty forever**, which looks exactly like a shell that failed
    to start. Fix: `security.workspace.trust.enabled: false` (+ `startupPrompt`/`banner`/
    `untrustedFiles`), plus a click-through in `prep()` as a fallback. Note this only appeared
    AFTER fixing #12 — one fix uncovered the next.
14. **Every leaked server compounds.** Each failed run left a `code serve-web` alive; after 26 of
    them the machine could not start a terminal at all, and recordings failed for a reason that
    had nothing to do with the code being debugged. `stop()` now kills by command-line match on
    the port. **When a run fails repeatedly, count the orphaned processes before trusting any
    other diagnosis.**
15. **Housekeeping must not be recorded — the PREPARE/PERFORM split.** Focusing the terminal or
    editor is done through the command palette, and doing it inside the timed body put a
    three-second shot of the palette overlay into the footage. Segments dropped from 7.5s to
    3.4s once focus moved into `<action>Prepare`, which runs *before* the start mark. Anything
    that is not the performance belongs in prepare().
16. **Focus follows the action, never inheritance.** Two mirror bugs: after an editor step a
    `run` typed the command straight into the source file (the terminal never changed, so it
    timed out); after a `run` step a `type` sent a whole line into the shell. Every action now
    states where it is typing.
17. **`extensions.ignoreRecommendations: true`.** A *"install the recommended Python extension"*
    toast fired MID-TAKE and landed in the footage. Language recommendations trigger the first
    time a file type is opened, so clearing toasts during prep does not catch them.
18. **Don't require the terminal buffer to GROW to detect completion** (see #9) — and don't
    anchor CDP timestamps to arrival time either. **Measured: `Page.screencastFrame`'s
    `metadata.timestamp` is EPOCH SECONDS and agrees with `Date.now()` to within 1ms**, so it is
    directly comparable to step marks. An earlier version "anchored" it to the first frame's
    arrival, which only added a way to be wrong.
19. **Mark at the PAINT, not at the DOM change.** Two `requestAnimationFrame`s after the change
    guarantees the browser has painted; marking at the mutation put every boundary a frame early.
20. **The concat demuxer needs the last image listed twice**, and that repeat adds frames —
    measured 32 out for a 30-frame plan. Pin the count with `-frames:v`.
21. **A punch-in is not `transform-origin`, and not the bbox CENTRE.** Two separate errors, both
    visible only in a render. (a) `transform-origin: X% Y%` pins the region to X%,Y% of the
    STAGE, not to the middle of the frame — translate the point of interest to the centre and
    scale about the centre instead (`scale() translate()`, right-to-left). (b) Centring on the
    bbox centre is wrong for the shape that matters most: a terminal panel is full width with
    LEFT-ALIGNED text, so its centre is empty space and the punch-in cropped every visible
    character away. Anchor the **leading edge** when the bbox is wider than the visible window,
    the **top** when it is taller, then clamp inside the captured frame.
23. **BAKING MUST BE IDEMPOTENT — the staleness trap.** The first version DELETED `ref` once
    resolved, which made baking one-way: after a re-record, bake reported *"nothing to bake"*
    and the spec silently kept the PREVIOUS take's frame counts and bounding boxes. Measured on
    a real re-record: **3 of 3 clips stale, with marks ten times too wide**, and the render used
    them without complaint. `ref` is the authored intent and STAYS; `src`/`frames`/`bbox`/`marks`
    are DERIVED and refreshed on every bake. `record.mjs` now auto-rebakes every spec that
    references the slug, because "remember to re-bake" is not a mechanism.
24. **A callout must point at a MEASURED rectangle, never a typed coordinate.** `demo.json`
    declares named marks; the runner measures them; the spec references them by name. A mark
    the capture did not record is a bake failure, not a mis-drawn arrow.
25. **Measure the TEXT, not the row.** An xterm row is a full-width div, so using its rect drew
    a highlight stretching the whole terminal (w=1214) instead of around the words (w=132). A
    `Range` over the matched characters gives the true glyph extent — and the text is split
    across several spans, so it needs a tree walk.
26. **Overlays must live INSIDE the zoom container.** Drawn outside it while compensating with
    `1/zoom`, they neither followed the punch-in nor rendered at the right size.
27. **Default a callout to the SIDE, not above.** The things worth pointing at are lines in a
    stacked pane; a label placed above lands squarely on the previous line and hides it
    (measured: the label covered `Hello, iAuteur!`). There is almost always empty space to the
    right of a line of text.
41. ⚠ **POLLING CANNOT RECOVER FAST SCROLLBACK — and this would have wrecked the SQLite
    course.** `.xterm-rows` holds only the VISIBLE rows. The obvious fix — poll during the
    run and stitch the overlapping windows — works for a slow writer and FAILS for a fast
    one: `python -c "for i in range(1,61): print(...)"` finishes in ~10ms, so the screen
    goes from a prompt to sixty lines inside ONE poll interval. Measured: **12 of 60 lines
    recovered, with 2 provable stitch gaps.** Any `SELECT * FROM`, test run or install would
    have reported a truncated transcript as if it were complete.
    **The fix is to ask VS Code for its own scrollback**: `Terminal: Select All` then
    `Terminal: Copy Selection` puts the WHOLE buffer on the clipboard. Verified **60/60**.
    Two consequences worth keeping straight:
      · it SELECTS text, which is visible — so it runs in `runFinalize`, AFTER the segment's
        t1 mark, and never lands in the footage;
      · the FOOTAGE shows what was on screen and the MANIFEST records what the command
        actually printed. Different scopes, both true, neither guessed. When the scrollback
        cannot be read at all, the step is marked `truth: 'partial-visible-only'` so the
        bake gate refuses it rather than passing off the tail as the whole.
42. **The stitcher was still worth keeping** for the slow-writer case (it reconstructs a
    scrolling window exactly, with a `gaps` count when it cannot prove the join) — but it is
    no longer the thing the truth claim rests on.
43. **Framing a narrow target by its CENTRE splits the dead space either side.** Measured on
    the first zoom-to-a-line render: a third of the stage was blank editor to the left of the
    words. Text reads left-to-right, so sit the target near the LEADING edge with reading
    room after it.
44. **In-clip events must be placed in a SECOND pass**, once each clip's real window is
    known. Placing them inside pass 1 meant a single-clip scene (where there is no "leading
    slack") gave every event 12 frames of room while **944 frames of hold sat unused** — all
    five collapsed onto the same word.
37. **A fallback that is never exercised is not a fallback.** `snap.mjs`'s Remotion-shell
    path was only reachable when Playwright is absent, so it was tested by running the
    resolver directly against this machine's install — it found `win64` by DETECTION, which
    is the whole point of the change.
38. **The keycap row has to be BUDGETED and RESERVED.** Adding it without counting it in
    `chromeH` pushed the premise up into the headline (LAW 0o again, third time). And it must
    be reserved as blank space on steps that have no keys, or the stage jumps between clips.
39. **`split` without auto-focus is a DOWNGRADE.** Giving a third of the frame to the side
    panel shrinks the footage by the same third; the first split render made the terminal
    unreadable. Split auto-focuses for exactly the reason vertical does — the footage no
    longer has the width to carry a whole 16:9 screen legibly.
40. **A trimmer that always fires eats real pauses; one that never fires is decoration.**
    The dead-air test asserts BOTH directions: a low cap must shorten a frozen stretch, and
    the default cap must leave a one-second pause alone.
31. **THE VIEW WINDOW replaced three transform hacks.** Sizing the stage from a constant
    (`vertical ? 980 : 1180`) and then moving the picture with `transform: scale() translate()`
    produced a different bug at every step: a wrong origin, a wrong centre, and a stroke width
    that had to be divided by the zoom. Modelling it instead as *"which rectangle of the capture
    does the stage show"* — lay the whole capture out at scale `k`, slide it so the window sits in
    the stage — made all three disappear, because a bbox in capture space then maps to screen by
    percentage alone.
32. **`vertical ? 980 : 1180` is the CONST-binds defect, verbatim** (LAW 0o). In 9:16 it drew a
    608px-tall 16:9 strip inside a 1920px frame: the picture floating in a pane three times its
    height. A vertical cut must CROP the capture to a portrait window, never letterbox it.
33. **COVER, not contain, when choosing the window** — take the SMALLER candidate. Taking the
    larger meant a wide, short target (a terminal panel — the shape that matters most) asked for a
    window 92% of the capture, i.e. no punch-in at all and unreadable type.
34. **Do not let the vertical stage take the whole column.** A 16:9 capture has NO portrait region
    that holds a terminal at readable size *and* fills a 0.65 aspect; the surplus comes back as a
    dead band of empty editor above the content. Cap the stage at a squarish ~0.8 and hand the
    reclaimed height to the rail and caption.
35. **A compensation factor outlives the thing it compensated for.** The callout label carried
    `scale(1/zoom)`, correct while the container was transform-scaled. Under the view-window model
    the box is absolutely sized, so the label's font-size was already in real pixels and the
    leftover factor shrank it to unreadable at high punch-in. SVG strokes still divide by `k`
    (they are in user units); HTML must not. **When you change how something is scaled, grep for
    every division by the old factor.**
36. **A short owes the viewer a HOOK and a CTA too.** The linter rejected a one-scene shorts spec
    with *"scene 1 must be HOOK"* — the retention contract is not relaxed for 9:16.
29. **A browser "page" bbox means the VIEWPORT, not `body`.** `body` returned the full document
    rect — measured 2153px tall in a 900px viewport, and `y=-700` after a scroll — which would
    make any punch-in nonsense. The capture contains the viewport; the bbox must too.
30. **Windows holds directory handles after a browser or ffmpeg exits.** `fs.rmSync` on the
    output dir threw `EPERM` on the immediately following run. Use `maxRetries`/`retryDelay`
    rather than racing it.
28. **The manifest gate catches mis-scoped fields.** Declaring `callouts` as a scene-level field
    when it actually lives on each clip failed `check-manifest.mjs` with
    *"not in RecordedStepData (found elsewhere)"*. Document a nested field in its parent's note.
22. **"Fit the whole region on screen" gives a zoom BELOW 1** for a wide, short bbox — measured
    k = 0.92 for a 1252×300 terminal in a 1600×900 capture, i.e. no punch-in at all. Use the
    LARGER ratio (cover, with cropping), capped, floored at 1.
56. **A SEAL THAT SKIPS THE BROKEN STATE IS NOT A SEAL.** Rebuilding a spec from its builder
    wipes the bake — a builder writes `ref` only — and the next render drew the "NOT BAKED"
    placeholder for a whole 47-second short. `check-recordings` ran and reported **PASSED**:
    its freshness loop opened with `if (!clip.src || clip.frames == null) continue;`, so the
    one state that is always wrong was the one state it ignored. It was checking that baked
    numbers were FRESH while saying nothing about a clip never baked at all. It now fails,
    names the clip and prints the three commands that fix it — and `render-topic.mjs` runs it
    BEFORE rendering, so a placeholder can never reach an mp4 again. Both break-tested.
    **After re-running any spec builder: bake -> anchor -> sync -> lint. Every time.**
53. **`layout: "full"` IS THE DEFAULT, AND THE MANIFEST SAID SO ALL ALONG.** Owner: *"have
    the video as base and include components that float over the video that does not hide the
    content."* The manifest field note has always read *"full (default) = the footage IS the
    frame, overlays on top"* — the component never implemented it, so every recorded beat got
    the bordered card. The card costs about a third of the frame in chrome, which forces a
    harder punch-in to keep text readable, which is what cut commands off at the right. In
    full-bleed the capture fills the frame, **the camera does not move at all**, and emphasis
    moves from the lens to the neon box. `layout: "card"` asks for the old panel back. Wide
    only — a 16:9 capture in a 9:16 frame has to crop to a third of its width.
54. **"OUTSIDE THE BBOX" IS NOT "EMPTY" — USE THE MARKS.** Placing the floating overlays took
    five renders. Pinned to the floor they covered the terminal; flipped by `column-reverse`
    every child reversed and the lot piled at the bottom; pinned to the free EDGE the premise
    and the cluster took opposite edges and the premise landed on the terminal; joined into
    one group they still sat on the editor's first lines. The bbox is a PANE, not the writing
    in it. **Every mark the runner measured is a rectangle around real text**, so the union of
    all marks in the scene, projected to screen space, gives the tallest genuinely ink-free
    band — and the group goes in the middle of that. On the schema beat that is between the
    last line of code and the top of the terminal, with both fully readable.
55. **THE WINDOW MUST CONTAIN ITS TARGET'S WIDTH, and the box must be clamped to the view.**
    Owner: *"mostly the highlights that is done gets hidden to the right"*. `Math.min(width-
    driven, height-driven)` — COVER, gotcha 33 — was written for a wide, short TERMINAL bbox.
    Applied to a MARK, whose height is one text line, the height candidate is always tiny, so
    a 723px-wide line got a 381px window and the highlight box left the screen with its label
    attached. Width leads, height follows. Where a line still cannot fit (9:16 over a 16:9
    capture tops out near 720 capture-px) the box is CLAMPED to the visible region so it
    frames the visible part rather than leaving the video.
51. **A PULL-BACK IS A RELEASE, NOT A TEACHING BEAT — and one the viewer cannot register is
    worse than none.** Found by pulling a frame out of the FINISHED 16:9 mp4: the SCAN ->
    SEARCH payoff, the beat that cut exists for, rendered at full zoom with the one-word
    difference about eleven pixels tall. `zooms: [{mark}, {at:'full'}]` plus a callout gave
    zoom / callout / pull-back at words 81.0 / 81.8 / 82.75, because pass 2 spread in-clip
    events EVENLY across the room after the footage — so the release shared airtime with the
    beat it was meant to follow. Against the 18-frame ease the label was legible punched-in
    for under half a second, in **four scenes of the long cut**, including the 8192-byte
    reveal. Two changes, both in the solver so no spec has to remember: a trailing
    `{at:'full'}` is pinned to the END of the clip window with the teaching beats spread
    before it; and when it still cannot earn **36 frames (1.2s)** it is DROPPED and the beat
    re-solved without it — the punch-in simply holds to the end, which is what the payoff
    wanted. All five premature pull-backs across the three cuts disappeared.
52. **`npx` IS NOT A DEPENDENCY WORTH HAVING.** `npx remotion render` died with
    `ERR_INVALID_PACKAGE_CONFIG` pointing at npm's own `libnpmexec/package.json`, minutes
    after `npx remotion bundle` had worked in the same shell — and then did it again on a
    later bundle. The CLI is a dependency and its path is known, so `render-topic.mjs` calls
    `node node_modules/@remotion/cli/remotion-cli.js` directly. One less moving part between
    a finished spec and a file.
49. **LAW 8 BOUNDS THE LAST ANCHOR, NOT THE LAST CLIP — and a callout is an anchor.** The
    solver placed each final clip correctly at ~72% of the read and then, in pass 2, put that
    clip's callouts *after* its footage, which landed them past the last spoken word: 13
    scenes of the SQLite course were rejected with *"atWord 105 exceeds narration word count
    (96)"*. Clamping the callouts to the last word only moved the defect — every one of those
    beats then reported *"payoff lands in the last 15%"*. The real fix is in PASS 1: reserve
    `clipFrames[last] + FPW * (callouts[last] + 1)` before distributing any slack, and close
    the final event window at **80% of the read** rather than at the last word. Fixing it
    took 14 warnings and 6 errors off the spec at once, and it is fixed for every future
    recording spec rather than worked around in this one.
50. **A DEMO SPEC IS SHAPED BY TWO LINTER NUMBERS, so plan against them from the first
    draft.** `OVER-RELIANCE` caps any sub-type at `ceil(scenes * 0.35)` — a first pass put
    every recorded step in its own scene (29 RECORDED_STEPs of 47) and was rejected outright.
    And the scene ceiling is `180 * distinct_anchors + 120` frames, capped at 70s, so a beat
    earns runtime by depicting more. Together they say: **fewer, richer recorded scenes** —
    31 clips across 13 scenes, two or three to a beat, which is also how a person narrates
    them. `briefs/sqlite/build_long.mjs` checks itself against both before it writes, which
    turned a slow lint-and-guess loop into a fast one.
45. **MONACO RENDERS EVERY SPACE AS U+00A0.** Measured with a probe that dumped the char codes
    of each `.view-line`: `includes(" ")` was **false on all seven lines** of a SQL file, and
    the normalised comparison was true. Consequence: `marksFor` matched on raw `innerText`, so
    **no editor mark containing a space could ever be measured**, and the runner correctly
    refused to invent a rectangle — aborting the whole Act II take at step 2. Terminal marks
    were unaffected because xterm writes ordinary spaces, which is exactly why this survived
    every earlier test. The substitution is one character for one character, so normalising
    NBSP → space preserves the indices the `Range` depends on. **Marks are now asserted in
    BOTH surfaces** in `test-rec-surface.mjs`, and that assertion was break-tested by making
    the normalisation a no-op (2 checks went red, and only those 2).
46. **LOOK FOR THE EXISTING GUARD BEFORE WRITING ONE.** On finding that three demo scripts had
    pinned a tool with an absolute `C:/Users/<name>/...` path, I wrote a whole new
    `check-identity.mjs` and wired it into `npm run audit` — and then the push was rejected by
    `scripts/check-publish-safety.mjs`, which this repo has had all along: 232 lines covering
    HOME_PATH, IDENTITY, EMAIL, private keys, API-key shapes, foreign drives and binaries, on
    a pre-push hook over the unpushed range. Tested directly against the original leak, it
    fires on **both** HOME_PATH and IDENTITY. The new script was deleted as redundant.
    Two things worth keeping from the detour: the leak was real, and the fix belongs at the
    SOURCE (gotcha 47) rather than in one more gate. And a smaller lesson, paid for by a break
    test on the deleted script before it was deleted: a guard that reads `git ls-files` alone
    is blind to a brand-new untracked file — which is exactly why `check-publish-safety` runs
    on the staged/range diff instead.
47. **A demo script must never contain a machine path — `{{TOOLS}}` / `{{REPO}}`.** `demos/` is
    TRACKED and this repo is PUBLIC. The recording was never at risk (the prompt is primed to
    show only the workspace leaf) but the SCRIPT that produces it was. Demos now write
    `Set-Alias sq '{{TOOLS}}/sqlite/sqlite3.exe'`; `expandTokens()` in the runner resolves it
    at run time on whatever machine is recording, `tools/` is gitignored, and `prep.requires`
    tells a fresh clone which binary to download and why that version. Proven by re-recording
    all three acts from the detoxed demos: 15/15 steps verified, and `sqlite --version` still
    read **3.53.4** off the screen, so the token resolved to the pinned binary and not to a
    system fallback.
48. **Backslashes do not survive this environment's heredocs, and `node -e` is worse.** Three
    separate edits were lost today to escaping alone: a `node -e` builder died twice on quotes
    inside quotes, and a Python heredoc silently collapsed `\\r` to a real carriage return, so
    an anchor string that looked identical to the file never matched. A related trap: an
    em-dash inside a match string did not survive stdin either. **Use the Write/Edit tools for
    any content with backslashes, quotes or non-ASCII; build JSON with a committed builder
    script, never an inline `-e`.** When a literal control character is genuinely needed in
    source, write it by code point (`String.fromCharCode(160)`) — an invisible NBSP sitting
    inside a regex literal is a landmine for the next reader.

### THE SETTINGS RECIPE (solved 2026-08-26 — this is the load-bearing trick)

Web user settings cannot be seeded from disk. They must be written **through the real settings
editor, once, in the PREP phase**, into a **persistent Chromium profile** so they survive every
later run:

1. `chromium.launchPersistentContext(PROFILE, {permissions: ['clipboard-read','clipboard-write']})`
2. Palette → `Preferences: Open User Settings (JSON)`
3. `navigator.clipboard.writeText(json)` → `Control+A` → `Control+V` → `Control+S`
   **PASTE, NEVER TYPE.** Monaco auto-closes brackets and quotes; typed JSON arrives mangled.
4. **Reload the page** — the theme and the renderer only take effect from a clean boot.

Settings that matter, and why:

| Setting | Why |
|---|---|
| `terminal.integrated.gpuAcceleration: "off"` | **The critical one.** Switches xterm.js to the DOM renderer so `.xterm-rows` exists and the buffer is readable = ground truth. |
| `editor.cursorBlinking: "solid"`, `terminal.integrated.cursorBlinking: false` | A blinking cursor makes frames non-deterministic and defeats frame hashing. |
| `workbench.colorTheme`, font sizes | Legibility at 1080p and a stable look. |
| `workbench.startupEditor: "none"`, `git.openRepositoryInParentFolders: "never"`, `chat.commandCenter.enabled: false` | Frame hygiene (invariant 3). |

**Do not assert success by reading `.monaco-editor` innerText** — it only contains the *visible*
virtualised lines, so the check reports a false negative. Assert on the *effect* after reload
(dark class on `.monaco-workbench`, `.xterm-rows` count > 0) instead.

### The PREP / TAKE split (design consequence of gotcha #3)

The runner has two phases. **PREP is never recorded**: launch server, apply settings, close
Welcome, dismiss toasts, hide the Chat panel, scaffold files, warm the terminal. **TAKE is
recorded**: only the authored steps. This keeps the frame clean without faking anything.

---

## 4. ARCHITECTURE

```
AUTHORING   topics/<slug>/demo.json      <- intent only. no frames, no pixels, no durations
            topics/<slug>/long.json      <- scenes referencing rec:<slug>#<step>
   |
CAPTURE     npm run record <slug>
   |        +- VsCodeRunner   (Playwright -> code serve-web)   -+
   |        +- BrowserRunner  (Playwright -> any URL)           +-> ONE runner interface
   |        +- TerminalRunner (pty, native render)              |   run(demo) -> manifest + media
   |        +- [VmRunner]     (future, D5)                     -+
   |                 |
   |        topics/<slug>/rec/
   |          manifest.json   <- per step: id, t_start, t_end, bbox, text, stdout, exitCode
   |          seg-NN.mp4      <- CFR, one clip per step
   |          frames/*.png    <- sampled, for contact sheets
   |
COMPOSE     scenes anchor segments by atWord
            -> sync.mjs (UNCHANGED) retargets to real TTS frames
            -> Remotion: ClipVideo + overlays read bbox from the manifest
                     |
            out/<slug>_long.mp4
```

**Render-time property that makes this worth building:** footage is captured once and **re-timed
on every render**. Rewrite the narration and the demo re-paces itself.

---

## 5. STATUS BOARD

Legend: `[x]` done & proven · `[~]` in progress · `[ ]` pending · `[!]` blocked/needs decision

### P0 — Feasibility & contract  **COMPLETE**

- [x] Verify `code serve-web` exists, serves, and is drivable by Playwright
- [x] Verify the integrated terminal **really executes** (nonce echo + real python run)
- [x] Install Playwright 1.62.1 + Chromium 1234 as devDependency
- [x] Confirm Remotion's headless shell cannot do input (justifies D3)
- [x] Write this file
- [x] **Close the anti-hallucination feasibility gate** — settings recipe + DOM renderer + buffer
      read-back all proven on the real machine
- [x] `demo.json` schema — frozen and exercised (`demos/vscode-hello.json`)
- [x] `manifest.json` schema — frozen and emitted by the real runner
- [x] Runner interface `recordDemo(demo) -> {manifest, dir}`
- [ ] Paper-walk the schema against two real past episodes (one browser-heavy, one CLI-heavy)

### P1 — The contract (GOLD base). No runner. Fixture-driven. **COMPLETE 2026-08-26**

- [x] `rec:<slug>#<step>` protocol — resolved by `scripts/bake-rec.mjs`, **not** by `resolveSrc`.
      Recordings live in `public/rec/<slug>/` (gitignored) so `staticFile()` already reaches them:
      **`src/video.tsx` needed ZERO changes.**
- [x] `RecordedStep` scene (`src/scenes/RecordedStep.tsx`): plays segment k from its own anchor via
      `<Sequence from={curStart}>` + `ClipVideo endBehavior="freeze"`, holding the last frame until
      the next anchor. No fixed frame interval anywhere in the file (LAW 0i.1).
- [x] Manifest entry in `scripts/lib/manifest.mjs` + `TYPES` in `scripts/lib/constants.mjs`
      + `RECORDED_STEP` added to lint's `DYNAMIC` list + registry in `src/MainComposition.tsx`
      + `RecordedStepData`/`RecordedClip`/`RecordedBBox` in `src/types.ts` + regenerated
      `sceneTypes.generated.ts` and `specs/video.schema.json` (343 types) + `src/showcaseSpec.ts`
      entry so it renders in all 30 design previews (LAW 9 wiring).
- [x] Lint rules in `lint-spec.mjs` — **6 of them, each proven to fire** by
      `scripts/test-rec-lint.mjs`, which breaks the real passing spec one way at a time
      (LAW 0n corollary: a seal must be tested by breaking a file on purpose).
- [x] **PROOF S2: `sync.mjs` diff is EMPTY**, and proven functionally — authored anchors at words
      4/12/25 retargeted to frames 33/153/348 from fake TTS word times, and `durationFrames` grew
      420 → 610 to fit the audio. **A recording re-paces itself to the voice with no re-capture.**
- [x] **PROOF S3: the two-frame test PASSES** — `scripts/test-rec-contract.mjs`, 5 checks.

### P1 ARTEFACTS

| Path | What |
|---|---|
| `scripts/gen-rec-fixture.mjs` | builds `public/rec/_fixture/` — segments with the **frame number burned into every frame**, so a still is a measurement. `npm run rec-fixture` |
| `scripts/bake-rec.mjs` | resolves `rec:` → `src`/`frames`/`bbox`/`capture`, **and is the anti-hallucination gate**. `npm run bake-rec` |
| `scripts/test-rec-contract.mjs` | the two-frame proof. `npm run test-rec-contract` |
| `scripts/test-rec-lint.mjs` | proves the lint seals fire. `npm run test-rec-lint` |
| `topics/rec-contract-test/long.json` | the permanent regression fixture (HOOK → RECORDED_STEP → OUTRO_CTA; lints clean) |
| `npm run test-rec` | both tests, in order |

### P2 — VS Code / browser runner  **WORKING END TO END**

**Modules: `scripts/lib/record/vscode.mjs` (surface) + `scripts/lib/record/terminal.mjs`
(execution + ground truth). Integration test: `npm run test-rec-surface` — 15 checks,
all passing against the real machine.**

- [x] a. **Make settings actually apply** — solved via the settings recipe (§3)
- [x] b. Force DOM terminal renderer, then **read `.xterm-rows` back as ground truth** — proven
- [x] c. PREP phase — clears toasts, closes all editors, kills stray terminals, hides the
      Chat/Copilot secondary side bar (**verify-and-retry**, see gotcha #8), and primes a short
      prompt. Frame verified clean by assertion *and* by still.
- [x] d. `serve-web` lifecycle — launch, poll for HTTP **200** (202 = still downloading), reuse an
      already-running server, teardown.
- [x] e. **Real exit codes** via a PowerShell prompt hook (gotcha #10) — success 0, failure 2,
      measured. Human-ish typing with bounded jitter.
- [ ] e2. Eased cursor travel with overshoot (typing is done; pointer motion is not)
- [x] f. **CDP screencast capture → CFR segments** (`scripts/lib/record/capture.mjs`).
      NOT Playwright `recordVideo` — that is VFR and only finalises on context close.
      Screencast gives per-frame timestamps, which are resampled onto an exact fps grid.
      Proven by `npm run test-rec-capture` (11 checks).
- [x] g. **bbox export on every interaction** — `run` steps get the terminal panel, editor
      steps the editor, plus any raw CSS selector via `focus:`. Verified in a real manifest.
- [x] i. Editor actions — `openFile`, `type`, `save`, `pause`, `run`, each with read-back
      verification.
- [x] **`scripts/record.mjs` + `scripts/lib/record/runner.mjs`** — demo.json → segments +
      manifest, end to end, proven on a real 5-step demo.
- [ ] h. Cross-OS: kill the `win64` hardcode in `scripts/snap.mjs` while in here
- [ ] j. Non-Windows: the exit-code prompt hook and the process reaper are PowerShell-only

### P2 ARTEFACTS

| Path | What |
|---|---|
| `scripts/lib/record/vscode.mjs` | serve-web lifecycle (own port per recording, bound folder), the settings recipe, PREP |
| `scripts/lib/record/terminal.mjs` | real execution + **ground-truth read-back** + the exit-code prompt hook |
| `scripts/lib/record/capture.mjs` | CDP screencast → resampled **CFR** segments |
| `scripts/lib/record/runner.mjs` | demo.json → manifest + segments; prepare/perform split |
| `scripts/record.mjs` | the CLI. `npm run record -- demos/vscode-hello.json` |
| `demos/vscode-hello.json` | the worked example: open → run → type → save → run again |
| `topics/rec-vscode-demo/long.json` | a spec built on REAL footage; lints clean, renders |
| `npm run test-rec-surface` | 15 checks against the live machine |
| `npm run test-rec-capture` | 11 checks on frame accuracy |

### P3 — BROWSER surface  **WORKING** (`scripts/lib/record/browser.mjs`)

Owner's brief: *"Have pure control and understanding of playwright to work with browsers, to be
able to browse, or show proofs, or show outputs."* Same contract, same capture, same manifest —
a different stage. `surface: "browser"` in demo.json routes to it.

- [x] Actions: `goto` (reports the URL the browser ACTUALLY landed on + the real title +
      HTTP status; a 4xx throws), `click` (reads the element's text, confirms navigation or
      expected text), `fill` (reads the field back and compares), `expect` (fails loudly when
      the proof is not on the page), `scroll`, `pause`
- [x] Analytics/tracker requests blocked, `reducedMotion: reduce`, colour scheme follows `theme`
- [x] Named marks + bboxes work unchanged (selector or text)
- [x] Proven against the owner's own live site — `demos/browser-dojo.json` captured
      `san-gitlogin.github.io/playwright-dojo` at 1600x900, CFR 30, `h1` read back as
      "The Playwright Dojo". **57 output frames from 6 screencast frames** — the hold path
      working on a real, static page.
- [ ] A native-render terminal path (`TerminalReplay`) is no longer needed for the VS Code
      surface; revisit only if a non-VS-Code shell demo is ever wanted.

### P4 — Overlays (all bbox-driven, all `atWord`-anchored)

- [x] **ZOOM punch-in** — `focus: true` on a clip. Cover-fits the step's bbox, leading-edge
      anchored, clamped inside the frame.
- [x] **SPOTLIGHT** — dims everything outside the step's bbox.
- [x] **CALLOUT with NAMED MARKS** — the real unlock. `demo.json` declares
      `marks: [{id, selector}]` or `{id, text}`; the runner MEASURES them (a Range over the
      matched characters, so the box hugs the glyphs, not the full-width row); the spec points
      a callout at a mark BY NAME. Nothing is hand-positioned, so a callout survives a
      re-record or a viewport change. Verified on both surfaces: the terminal line
      `Hello, world!` and editor line 6.
- [x] **KEYCAP** — the chord the RUNNER ACTUALLY PRESSED, drawn as keys. Recorded at
      capture time (`keys` in the manifest), so it can never drift from the take: if the
      demo stops pressing Ctrl+S, the keycaps stop saying Ctrl+S. This is the one overlay
      that answers *"what did you just DO"*, which a screen recording otherwise hides.
- [x] **ZOOM / PAN / NEON, all inside one clip** — a clip carries a SEQUENCE of camera
      moves (`zooms`), each on its own spoken word, so a step can go to the code, PAN to the
      output, then pull back while the footage holds. Pan needs no separate code path: two
      same-sized marks IS a pan. Moves are eased with the repo's `easeInOutCubic` (a linear
      move reads as a slide, not a camera). Neon uses the `t.style.glow` THEME TOKEN, the
      same one `NeonText` uses, so a flat pack degrades to a clean outline. The highlight
      DRAWS ON over 14 frames rather than pulsing — a pulse keeps moving after the point is
      made, which is the standing distraction LAW 0h exists for.
- [x] **SCROLLED OUTPUT recovered in full** — see gotcha #41; this is the one that would
      have silently truncated every SQLite `SELECT`.
- [ ] `CURSOR_GHOST` (only useful for pointer-driven demos; ours are keyboard-driven)
- [ ] `DIFF_FLASH`
- [x] **SHORTS / 9:16 — auto punch-in on the active bbox** (risk R10, closed). In vertical,
      focusing is not optional: any clip with a bbox punches in by default (`focus: false`
      opts out), because a 16:9 capture shown whole is unreadable on a phone.
- [x] **THE VIEW WINDOW** — the whole layout is now ONE calculation: a rectangle in capture
      space that the stage shows. Wide, vertical and the punch-in are the same code path,
      which replaced three separate transform hacks that each carried their own bug.
- [x] **SPLIT composition** (`layout: "split"`) — footage one side, the demo's own steps
      read down the other, ticked as each word is spoken. Split AUTO-FOCUSES for the same
      reason vertical does: giving a third of the frame to the panel shrinks the footage by
      the same third, and the first split render proved that made the terminal unreadable.
      Defaults OFF; `full` is right for most beats.
- [ ] PiP · a full iAuteur component composited beside footage (needs scene nesting)

### P5 — Determinism & provenance  **COMPLETE**

- [x] **S5 determinism measured** — `npm run test-rec-determinism` records the same demo
      TWICE and compares. See §6 for what determinism can honestly mean here.
- [x] **Provenance is in every manifest** — os, node, VS Code version, Playwright version,
      `recordedAt`, theme, viewport, fps, workspace, start URL. `snap.mjs` now records its
      capture ENGINE and viewport in `SOURCES.json` too.
- [x] **`scripts/check-recordings.mjs` is the lockfile** — in the only honest form available
      here. Captures are gitignored (D4), so instead of shipping bytes it verifies every
      `rec:` reference resolves and is FRESH, and prints the exact `npm run record` command
      for anything missing. Wired into `npm run gate`. Proven by breaking it two ways.
- [x] `public/rec/` gitignored (renders stay local, D4)

### P3b — Cross-OS (criterion S6)

- [x] `scripts/snap.mjs` no longer hardcodes `win64` — it uses Playwright's Chromium, with
      Remotion's headless shell as a platform-DETECTED fallback. Both paths exercised.
- [x] The exit-code prompt hook is platform-branched (PowerShell / bash+zsh) and emits the
      SAME two-field format, so one parser serves both. The POSIX branch is verified in real
      bash (see §6).
- [x] The server reaper is platform-branched (`Get-CimInstance` / `pkill` + `lsof`).
- [ ] **UNVERIFIED ON THIS MACHINE:** the full mac/Linux path through VS Code. The shell
      one-liner is tested; the integration is not. Say so rather than claiming S6 outright.

### P4b — SQLite course captures  **COMPLETE 2026-08-27**

The first real course built on this subsystem, and the thing that exercised it end to end.

- [x] Pin the version being taught. The machine's SQLite is **3.36.0 (2021)** and has **no
      `STRICT` tables** — a course written from memory would have failed on camera. 3.53.4 is
      installed into gitignored `tools/sqlite/`, the operator's own install untouched (LAW 0m).
- [x] `briefs/sqlite/CAPTURES.md` — every transcript produced by RUNNING the tool, including
      the version table and the identity check.
- [x] `demos/sqlite-act1.json` — 4 steps · version · create · select · **the file is 8192 bytes**
- [x] `demos/sqlite-act2.json` — 6 steps · second table · the JOIN · revenue · **SCAN → SEARCH**
- [x] `demos/sqlite-act3.json` — 5 steps · connect · read · **safe vs. injected** · commit
- [x] **31/31 steps verified by read-back** (12 + 9 + 10), marks measured in both editor and
      terminal, including one step asserted to FAIL (exit 1) because STRICT is only teachable
      by watching it refuse something.
- [x] `briefs/sqlite/TRANSCRIPTS.md` is GENERATED from the manifests
      (`npm run captures`, `npm run captures-check`). The hand-written transcripts had already
      drifted: adding `executemany` moved a running row count 5 -> 8, the recording refused to
      film the stale number, and nothing would have caught the DOC.
- [x] All three demos carry `{{TOOLS}}` rather than a machine path (gotcha 47), re-recorded
      from the detoxed scripts to prove the token resolves to the pinned 3.53.4.

Act III's Python prints one result row per line rather than one list. That is a CAPTURE
decision, not a style one: the single-line form wraps across two xterm rows at 1600px, and a
callout rectangle is measured from ONE row element, so the injection payoff could not have been
highlighted. It is also the better picture — one safe row above four stolen ones.

### P4c — SQLite course COMPONENTS  **6 of 11 built, 2026-08-27**

`briefs/sqlite/COURSE.md` is the course plan and the live status board for this part.
Built and render-verified at both aspects: **DB_TWO_WAYS · TYPE_GATE · JOIN_MERGE ·
SCAN_VS_SEEK · PLACEHOLDER_SEAL · TRANSACTION_DOOR**. Every one of them had at least one
defect that was invisible in the code and obvious in a still.

### P4d — SQLite course SPECS  **BUILT, VOICED, SYNCED, LINT-CLEAN (2026-08-27)**

| Cut | Slug | Scenes | Runtime | State |
|---|---|---|---|---|
| Long 16:9 | `sqlite-the-database-that-is-just-a-file` `long.json` | 37 | **14:00** | synced, lint-clean |
| Short 9:16 | same topic, `shorts.json` | 3 | ~0:50 | synced, lint-clean, verify-render PASSED |
| Short 16:9 | `sqlite-scan-vs-search` `long.json` | 4 | ~1:25 | synced, lint-clean |

All 11 components built and render-verified. All 31 clips used. Voiced with
`en-US-AvaMultilingualNeural`, re-timed by `sync.mjs` from the real audio.

**RUNTIME IS BELOW THE 20–30 MIN ASK — 14:00, and this is reported rather than padded.**
The scene ceiling (`180 * anchors + 120`, hard cap 70s) bounds how long any one beat may run,
so more minutes means more BEATS, not longer ones (LAW 0e rule 6a says exactly this: the fix
is more teaching, never padding). Reaching 20 minutes needs roughly 15–20 more taught beats
and the captures to back them — the SQL surface has them (LEFT JOIN, UNIQUE, DEFAULT, CHECK,
dates, LIKE/IN, subqueries, VACUUM, WAL, ATTACH), so this is more work, not a dead end.

**ALL THREE CUTS ARE RENDERED AND VERIFIED (2026-08-28).**

| Cut | File | Frames | Audio drift |
|---|---|---|---|
| Long 16:9, 13:58 | `topics/sqlite-the-database-that-is-just-a-file/out/wide-dark.mp4` | 25135 **exact** | −9 ms |
| Short 9:16, 0:39 | same topic, `out/short-dark.mp4` | 1172 **exact** | 59 ms |
| Short 16:9, 1:13 | `topics/sqlite-scan-vs-search/out/wide-dark.mp4` | 2176 **exact** | 43 ms |

Each ships with its `upload.md` (YouTube title, description, chapters). The long cut was
rendered `--muted` and stream-copied against a separately built audio track (LAW 12).

**KNOWN LIMIT, and where the fix belongs.** In 9:16 the tail of a long source line is still
cut: a 0.8-aspect stage over a 16:9 capture tops out near 720 capture-px of width, and
`params.py` has lines around 900px. That is not a framing bug to chase in the component — it
is LAW 0m's vertical corollary, *less content per beat, never smaller type*. The fix is a
capture-side one: wrap the Python in `demos/sqlite-act3.json` so no line exceeds ~700px, then
re-record, re-bake, re-anchor, re-sync. Everything else in the frame is now complete.
### P6 — Proof episode

- [ ] Re-cut one Playwright Dojo episode with real footage; judge as school owner AND as beginner

### P8 — KEYBOARD SHORTCUTS (owner, 2026-08-28)

Owner: *"check out the keybindings docs and the Windows shortcuts PDF thoroughly and in depth,
have every shortcut verified using VS Code web which you use. You don't wanna always use the search
thing you do and execute, some places shortcuts might help you work even faster ... we should also
test and review and do a feedback loop testing of the same not settling on any assumptions while
actual things must work with different types of projects containing different files, executing
different coding languages, viewing images / viewing different types of text files."*

Two motives, and they are separate. **Speed:** the runner drives almost everything through the
command palette (open a file, focus the terminal, split an editor), which is three interactions and
about two seconds where a chord is one and about two hundred milliseconds. **Truth on camera:** a
tutorial that shows the palette every time is teaching the palette; a real developer's hands use
keys, and the keycap overlay already exists to show them.

**Sources.** `briefs/vscode-shortcuts/reference.json` is the Windows shortcut card, transcribed —
149 pressable chords in 11 categories. That is the CLAIM. LAW 0m governs what happens next: the
card is a printed document for the DESKTOP app and we drive VS Code for the Web, so nothing on it
is trusted until this machine says so.

- [x] a. **Dump the build's own keybinding table.** `node scripts/probe-keys.mjs --dump` drives
      `Preferences: Open Default Keybindings (JSON)` and reads the buffer back through the
      clipboard (NOT by scraping Monaco — it virtualises its lines and a DOM scrape would silently
      truncate a 4000-line document to the viewport). Result: **1144 bindings, VS Code 1.134.0**,
      in `out/probe/keys/default-keybindings.jsonc`.
- [x] b. **Cross-check card against build.** `node scripts/keys-crosscheck.mjs` →
      **143 of 149 card chords are bound here.** The four that are not are all desktop-only, and
      the reason is the browser: `ctrl+shift+w` (closes the browser window), `ctrl+=` / `ctrl+-`
      (browser zoom), `ctrl+k r` (reveal in OS file manager). Two more are mouse gestures.
- [x] c. **Press every one of them for real.** `node scripts/probe-keys.mjs --probe`. A chord counts
      as verified only when a snapshot of the workbench MOVED in the specific way that command
      would move it. "The key dispatched without throwing" is not evidence — almost every chord
      carries a `when` clause (`ctrl+c` alone has ten bindings), so *bound* and *works here, now,
      with this focus* are different claims.
- [ ] d. Teach the runner a general `keys` action (any chord, incl. two-key chords) with read-back.
- [ ] e. Replace palette-driven steps with verified chords where a chord is faster and safe.
- [ ] f. Feedback-loop the whole thing across project types, languages and file kinds.
- [ ] g. The VS Code shortcuts course itself.

**Paid for already:**

- The probe's first Display run reported four failures and **all four were the probe's fault, not
  VS Code's** — Zen Mode had visibly hidden the sidebar, panel and activity bar while the check
  looked for a `.zen-mode` class this build does not set. Fixed by measuring zen mode *by its
  effect*. Same for the markdown preview (its iframe mounts outside `.part.editor`) and the editor
  layout toggle (changes group ORIENTATION, not group count). A shortcut probe is mostly a test of
  your own observables; write the failure reason to say **what did move**, or every failure looks
  identical.
- **Never pin the serve-web port.** A fixed port turned the recorded shim-leak into a hard stop:
  the listener outlives the run by several seconds after the process is gone, so the next
  invocation waited the full 180s timeout and failed. `startServer` picks a free one.
- **A setup must not depend on the thing under test.** The probe opens files through the palette
  rather than Ctrl+P, because Ctrl+P is one of the chords being measured.

### P7 — Polish

- [ ] Dead-air compressor with an honest speed chip
- [ ] `CURSOR_GHOST` · `KEYCAP` · `DIFF_FLASH`
- [ ] Contact sheets per recording
- [ ] `webui/app.py` Record step
- [ ] Director-skill guidance: when a recording beats an animation, and when it does not

---

## 6. TEST LEDGER

Every claim here must be reproducible. `[PASS]`/`[FAIL]` with the date it was last run.

| Test | What it proves | Status |
|---|---|---|
| `serve-web` returns HTTP 200 | the IDE surface exists | **[PASS]** 2026-08-26 |
| Playwright reaches `.monaco-workbench` | the IDE is drivable | **[PASS]** 2026-08-26 |
| Nonce echo round-trips through the terminal | execution is REAL, not simulated | **[PASS]** 2026-08-26 |
| `python hello.py` prints `Hello, iAuteur!` | real interpreter, real file | **[PASS]** 2026-08-26 |
| Settings applied (dark, DOM renderer, fonts) | the frame is controlled | **[PASS]** 2026-08-26 via the settings recipe |
| Terminal buffer readable from DOM | **ground truth for the anti-hallucination rule** | **[PASS]** 2026-08-26 — nonce + `Hello, iAuteur!` both read back |
| Clean frame (no Welcome/Chat/toast/extra terminals) | invariant 3 | **[FAIL]** 2026-08-26 — PREP phase not built yet (P2-c) |
| `sync.mjs` diff empty **and** anchors retarget (4/12/25 → f33/153/348, dur 420→610) | S2 | **[PASS]** 2026-08-26 |
| Two-frame anchor proof — 5 checks | S3 / LAW 0i | **[PASS]** 2026-08-26 `npm run test-rec-contract` |
| 6 RECORDED_STEP lint seals fire when the spec is broken | the rules are not decorative | **[PASS]** 2026-08-26 `npm run test-rec-lint` |
| `npm run gate` (11 seals, 343 types) | repo health after the wiring | **[PASS]** 2026-08-26 |
| `npx tsc --noEmit` | type surface | **[PASS]** 2026-08-26 |
| `npm run lint` (all topics) | no regression | **[PASS]** 2026-08-26 — 19 rejections, **all pre-existing** (verified by stashing the lint changes and re-counting: 19 either way). `rec-contract-test` passes. |
| **VS Code surface, end to end on the real machine** — 15 checks | the whole P2 premise | **[PASS]** 2026-08-26 `npm run test-rec-surface` |
| nonce round-trips through the real terminal | output cannot be fabricated | **[PASS]** 2026-08-26 |
| real exit codes (0 on success, 2 on failure) | assertions can be trusted | **[PASS]** 2026-08-26 prompt hook |
| clean TAKE frame (no Welcome/Chat/toasts, short prompt) | invariant 3 | **[PASS]** 2026-08-26 — asserted AND eyeballed in `out/rec-proof/surface-dark-terminal.png` |
| **Capture pipeline: exact CFR, correct content per segment, static period held** — 11 checks | frame accuracy (P2-f) | **[PASS]** 2026-08-26 `npm run test-rec-capture` |
| **A REAL 5-step VS Code demo records end to end** | the whole subsystem | **[PASS]** 2026-08-26 `npm run record -- demos/vscode-hello.json` |
| A spec built on real footage bakes, lints and renders | the loop closes | **[PASS]** 2026-08-26 `topics/rec-vscode-demo` |
| Freeze holds on REAL footage across 120 frames | LAW 0i over captured video | **[PASS]** 2026-08-26 — f400 vs f520, YMAX **3** |
| bbox punch-in lands on the terminal text | S4 | **[PASS]** 2026-08-26 — `out/rec-proof/rv-f980b.png` |
| `npm run lint` (all topics) after P2 | no regression | **[PASS]** 2026-08-26 — still 19, all pre-existing; no `rec-*` topic rejected |
| **Callouts land on measured marks**, both surfaces | S4 / "highlight where to look" | **[PASS]** 2026-08-27 — `out/rec-proof/co6-f680.png`, `co6-f1030.png` |
| Re-record → specs auto-rebake, no stale frames | the staleness trap (gotcha #23) | **[PASS]** 2026-08-27 — bake reports "3 were STALE and have been refreshed" |
| **Browser surface records a REAL live site** | the browser half of the brief | **[PASS]** 2026-08-27 `npm run record -- demos/browser-dojo.json` |
| **9:16 renders phone-readable** — stage fills the column, terminal legible, callout lands | R10 / LAW 0o | **[PASS]** 2026-08-27 — `out/rec-proof/vert-ship.png` |
| Wide punch-in still correct after the view-window rewrite | no regression | **[PASS]** 2026-08-27 — `out/rec-proof/wide-final2.png` |
| Two-frame contract proof survives the render rewrite | LAW 0i | **[PASS]** 2026-08-27 — FREEZE YMAX 2 |
| **Scrolled output recovered IN FULL** — 60/60 vs 12/60 visible | the truncation trap | **[PASS]** 2026-08-27 (in `test-rec-surface`, now 18 checks) |
| **Zoom / pan / neon, 5 moves in one clip, all voice-anchored** | the camera asks | **[PASS]** 2026-08-27 — `out/rec-proof/cam2-f836.png` |
| **⭐ VOICE SYNC ON REAL AUDIO — 5 checks** | the claim everything rests on | **[PASS]** 2026-08-27 `npm run test-rec-sync` |
| **Anchor solver: 36-layout sweep, 0 constraint violations** | automatic planning | **[PASS]** 2026-08-27 `npm run test-rec-anchors` |
| Auto-anchored spec accepted by the REAL linter | the solver's whole purpose | **[PASS]** 2026-08-27 |
| **Same script → same footage (S5)** — 7 checks | determinism | **[PASS]** 2026-08-27 `npm run test-rec-determinism` |
| **Dead-air trim fires, and does NOT over-fire** | R3 (boring footage) | **[PASS]** 2026-08-27 — 200ms cap 30f→6f; default cap leaves a 1s pause alone |
| **KEYCAP shows the chord the runner pressed** | "what did you just do" | **[PASS]** 2026-08-27 — `out/rec-proof/keycap2.png` |
| **SPLIT layout, auto-focused** | the brief's "side by side" | **[PASS]** 2026-08-27 — `out/rec-proof/split2.png` |
| **check-recordings catches a missing capture AND a stale bake** | the gitignored-footage hazard | **[PASS]** 2026-08-27 — proven by breaking it two ways |
| `snap.mjs` works cross-OS via Playwright; fallback resolves by detection | S6 | **[PASS]** 2026-08-27 |
| POSIX exit hook emits the same format as PowerShell | S6 | **[PASS]** 2026-08-27 — verified in real bash |
| **An EDITOR mark with spaces measures** (Monaco U+00A0, gotcha 45) | callouts can point at CODE, not only output | **[PASS]** 2026-08-27 — 238px tight box; break-tested by no-op'ing the normalisation (exactly 2 checks went red) |
| **A mark on text that is NOT on screen is refused** | the anti-hallucination rule, at the overlay layer | **[PASS]** 2026-08-27 — also refuses text that has scrolled away |
| **`check-publish-safety` catches a machine path in a demo script** | the public-repo hazard (gotcha 46) | **[PASS]** 2026-08-27 — planted a real home path in a demo: BLOCKs on HOME_PATH **and** IDENTITY |
| **SQLite course: 15 steps across 3 acts, all read-back verified** | the subsystem carries a real course | **[PASS]** 2026-08-27 — `sqlite3 --version` read **3.53.4** off the screen |
| **`{{TOOLS}}` token resolves to the pinned binary** | demos are machine-independent | **[PASS]** 2026-08-27 — all 3 acts re-recorded from detoxed demos, 15/15 |

### ⭐ THE SYNC PROOF (the one that mattered most)

This was ASSERTED for a long time before it was MEASURED. `sync.mjs` retargets any `*atWord`
key — true, but not the same as proof. The full loop
(`voiceover.py` → `sync.mjs` → `remotion render`) had never been run on a spec containing
footage until 2026-08-27. Measured on `rec-vscode-demo` with real edge-tts (Ava):

| | |
|---|---|
| scene re-timed from the estimate | **1048f → 760f** (real audio 25.0s) |
| every anchor sits before its own spoken word | **exactly 12 frames (0.4s), 7/7** |
| clips cut off by the shorter scene | **none** — freeze absorbed 153f / 100f / 87f / 192f |
| rendered video | **frame-exact: 1079f @ 30/1**, matching the spec |
| audio drift | **44ms** — under one AAC frame, i.e. container padding |

**This is the whole thesis demonstrated end to end:** footage captured on the machine's
clock, re-timed onto the narrator's, with the freeze absorbing a 288-frame difference and
nothing needing a re-capture. `npm run test-rec-sync` locks it in.

**PAID-FOR:** ffprobe's csv writer emits a TRAILING COMMA and CRLF even for a single field
(`"1079,
"`), so `Number()` on the raw string is `NaN` and an artefact check silently
"fails" for a reason that has nothing to do with the artefact. Split on comma, take field 0.

### S5, and what determinism can honestly mean

Byte-identical video is impossible and claiming it would be dishonest: a real shell takes a
different number of milliseconds every run. What MUST be identical is everything the spec and
the viewer depend on — and it is:

| Property | Result |
|---|---|
| step sequence | identical |
| **output read back from the terminal** | identical, character for character |
| exit codes | identical |
| bboxes | **0px drift** |
| named marks | **0px drift** |
| segment lengths | 1–2 frames apart — **reported, never asserted** |

So a re-record is a **drop-in replacement**: every callout still lands, every anchor still
means the same thing, and only the durations move.

### The dead-air trim, measured on a real demo

| | frames |
|---|---|
| captured | 406 |
| kept | 232 |
| **removed** | **174 (5.8s, 43%)** |

Screencast only emits a frame when something CHANGES, so a long run of the SAME frame means
the screen was frozen and the machine was waiting. Cutting that is not "speeding up the
footage" — during a trimmed run nothing happened, so no information is lost and nothing is
misrepresented. That is why it needs no speed chip. A stretch where the picture IS moving (a
spinner, a progress bar) has no repeated frame and is never touched.

### The capture pipeline, as measured

| Check | Result |
|---|---|
| every segment is constant `30/1` fps | ✔ |
| segment length matches the marked span (±1 frame) | ✔ 31/31, 31/31, 30/30 |
| each segment SHOWS its own phase (phases ~100 luma apart) | ✔ 29.9 / 127.2 / 229.2 |
| **a STATIC period still yields a full-length clip** | ✔ **30 output frames from 1 captured frame** |

That last row is the one that matters in practice: CDP screencast only emits a frame when
something CHANGES, so an idle stretch of a demo produces no frames at all. Resampling holds the
last painted frame, so idle time costs almost no disk and still cuts to a full-length clip.

### The two-frame proof, as measured

| Check | Frames (scene-relative) | YMAX | Verdict |
|---|---|---|---|
| PRE-ROLL — segment 1 starts on its word | 35 vs 36 | 212 | differs ✔ |
| ADVANCE — the clip really plays | 66 vs 67 | 144 | differs ✔ |
| **FREEZE — exhausted clip HOLDS for the voice** | 120 vs 131 | **2** | same ✔ |
| SWITCH — segment 2 starts on its word | 131 vs 132 | 184 | differs ✔ |
| SWITCH-3 — segment 3 starts on its word | 200 vs 288 | 189 | differs ✔ |

**PAID-FOR LESSON — never compare still HASHES.** Two reasons, both measured: the background
animates independently of the footage (so crop to the footage), and video decode is not bit-exact
frame to frame — a genuinely frozen clip still measured YMAX 2 between two stills. Assert a
NUMERIC threshold. The separation is huge (frozen 2 · identical 0 · one frame of motion 144 ·
a segment switch 184), so the thresholds are not delicate: same ≤ 8, different ≥ 40.

**PAID-FOR LESSON — a Windows path inside an ffmpeg/ffprobe FILTER dies on the drive-letter
colon** (`Failed to avformat_open_input 'C'`), because `:` is the filter option separator. Hit
twice: once on `drawtext=fontfile=`, once on `movie=`. Fix: run with `cwd` set and pass **bare
filenames**, or copy the asset next to the output. Do not try to escape it.

---

## 6a. EVERY COMMAND IN THIS SUBSYSTEM

| Command | What |
|---|---|
| `npm run record -- demos/x.json` | capture a demo → `public/rec/<slug>/`, then AUTO-REBAKE every spec that uses it |
| `npm run bake-rec -- <spec>` | resolve `rec:` refs (idempotent; refreshes stale numbers) |
| `npm run check-recordings` | every `rec:` reference resolves and is fresh — **in `npm run gate`** |
| `npm run rec-fixture` | rebuild the frame-numbered contract fixture |
| `npm run test-rec` | lint seals + capture + contract (the fast suite) |
| `npm run test-rec-surface` | 15 checks against a live VS Code — needs the machine |
| `npm run test-rec-capture` | 13 checks on frame accuracy and the dead-air trim |
| `npm run test-rec-contract` | the 5-check two-frame proof |
| `npm run test-rec-lint` | proves the 6 lint seals fire when a spec is broken |
| `npm run anchor-spec -- <spec>` | **place every anchor automatically** from measured footage |
| `npm run test-rec-anchors` | sweeps 36 layouts; proves the solver satisfies the linter by construction |
| `npm run test-rec-sync` | **the voice-sync proof** — anchors vs real spoken audio |
| `npm run test-rec-determinism` | records twice and compares (S5) |

**50 automated checks in total**, on top of the repo's own 12 gate seals.
(`test-rec-surface` grew from 18 to **23**: the five new ones are the mark seals of gotcha 45.)

### Writing a demo that pins a tool

A demo script is TRACKED and this repo is PUBLIC, so it may not contain a path off your
machine. Reference pinned binaries through a token and say what is needed:

```json
"prep": {
  "requires": [{
    "tool": "sqlite3 3.53.4",
    "put":  "tools/sqlite/sqlite3.exe",
    "why":  "the machine SQLite here was 3.36.0, which has no STRICT tables",
    "from": "https://sqlite.org/download.html"
  }],
  "commands": ["Set-Alias sq '{{TOOLS}}/sqlite/sqlite3.exe'"]
}
```

`{{TOOLS}}` → `<repo>/tools` and `{{REPO}}` → the repo root, both resolved at run time by
`expandTokens()`. `tools/` is gitignored: the binaries are large, platform-specific and not
ours to redistribute.

## 6a2. THE AUTOMATIC PLANNING LOOP (2026-08-27)

Owner: *"the planning should also happen automatically"*. Every anchor before this was
hand-computed — fine for four clips, impossible for a sixty-scene course. The split is now:

> **the author writes WHAT happens and WHAT to say; the tool computes WHEN each thing lands.**

```bash
npm run record -- demos/x.json          # capture; auto-rebakes dependent specs
node scripts/bake-rec.mjs <spec>        # resolve rec: refs -> measured frame counts
node scripts/anchor-spec.mjs <spec>     # <- SOLVE every atWord from those counts
npm run lint                            # accepts by construction
python scripts/voiceover.py <spec> <p>  # real TTS
node scripts/sync.mjs <spec> <ts> <p>   # re-time onto the real voice
```

`scripts/lib/record/anchors.mjs` makes four constraints true **by construction** rather than
by hand-checking: the GAP RULE (no clip cut off), BASE ≤38, ascending anchors, and LAW 8
(payoff not in the last 15%). Callouts land *after* their clip's footage has played, so the
viewer sees the thing before it is labelled.

It **refuses honestly** rather than producing something the linter will reject:
- narration shorter than the footage → *"800f of clips need at least 74 words, the script has
  20. Write 54 more words, or shorten the capture."*
- too many steps to fit before the payoff limit → *"Split the beat, or grow the script to ~N
  words."*

And it refuses to touch an already-SYNCED spec, because post-sync `atWord` holds a frame
rather than a word index.

## 6b. HOW TO RECORD A DEMO (the working loop, as of 2026-08-26)

```bash
# 1. author intent — see demos/vscode-hello.json for the worked example
#    { slug, theme: "dark"|"light", workspace, prep: {files, openFile, commands},
#      steps: [ {id, action: run|type|openFile|save|pause, ..., label, focus, expect} ] }

npm run record -- demos/vscode-hello.json      # -> public/rec/<slug>/ (gitignored)

# 2. reference the steps from a spec
#    "clips": [ {"ref": "rec:<slug>#<step-id>", "label": "...", "atWord": 4, "focus": true} ]

node scripts/bake-rec.mjs topics/<slug>/long.json   # resolves refs; ENFORCES the truth gate
npm run lint                                        # gap rule, anchors, budgets
npx remotion bundle && npx remotion still build <slug>-wide-dark --frame=N out/x.png
```

**Anchor rule:** the narration gap between two clips must be at least the first clip's own
frame count, or the footage is cut off mid-action. The linter says so with the exact numbers.
Longer gaps are fine and are the point — the segment FREEZES on its last frame and waits.

**demo.json options that matter**

| Field | Where | What |
|---|---|---|
| `theme` | demo | `dark` (default) / `light` (owner decision D7) |
| `surface` | demo | `vscode` (default) / `browser` |
| `maxHoldMs` | demo or step | dead-air cap; a frame may hold this long before the wait is cut. Default 1200ms |
| `marks` | step | `[{id, selector}]` or `[{id, text}]` — rectangles the runner MEASURES for callouts |
| `expect` | step | `{contains, exitCode}` — the step FAILS the recording if reality disagrees |
| `focus` | clip (spec) | punch in on the step's bbox. Automatic in 9:16 and in `split` |
| `callouts` | clip (spec) | `[{text, mark, side, color, atWord}]` — points at a measured mark |
| `layout` | scene (spec) | `full` (default) / `split` |

**`focus: true`** punches in on the step's bbox. Use it on the payoff step; a 1600×900 capture
letterboxed into a scene is too small to read otherwise.

---

## 7. HOW TO RESUME (for a compacted or fresh session)

1. Read `CLAUDE.md` (laws) → `docs/STATE.md` (repo state) → **this file** (this subsystem).
2. Everything in §3 is measured on the real machine. **Trust it; do not re-derive it.**
3. Take the first unchecked box in §5 in order. **P1 before P2** — building the runner first is the
   documented way this project fails (footage that can never obey the voice).
4. Start the IDE surface with:
   `code serve-web --port 9911 --without-connection-token --accept-server-license-terms --server-data-dir <dir>`
   then poll `http://127.0.0.1:9911/` for **200** (202 = still downloading).
5. Probe scripts must live inside the repo (gotcha #5). Delete them when done.
6. **No mocks. No assumptions. Test against the real machine.** If output cannot be read back
   from the real terminal, the recording fails — it never guesses.
