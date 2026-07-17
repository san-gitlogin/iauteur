---
name: iauteur-studio
description: Use this WHENEVER the user wants to DO anything the iAuteur web console (webui/) does — but from Claude Code, with no browser. Covers configuring a video, authoring specs, lint/critique, edge-tts voiceover + sync, rendering every variant, launching Remotion Studio, listing outputs, managing topics, and building a brand-new component. Conducts a short interactive interview with sensible DEFAULTS the user can accept or override, then runs the exact same deterministic scripts the webui runs. This is the full-parity, browser-free control panel.
---

# iAuteur Studio — the console, in Claude Code

The Flask app in `webui/` is a GUI wrapper around a set of deterministic Node/Python
scripts. It never calls an AI — the human pastes a prompt into a chat LLM and pastes
JSON back. **In Claude Code you ARE that LLM *and* you can run every script yourself**,
so the browser is optional. This skill gives you feature-for-feature parity with the
UI. Anything a button in the console does, you do here by running the same command.

Read this together with the `tech-video-director` skill (the creative law: angle,
themes, budgets, critic pass, upload kit) and — when building components — the
`component-author` recipe (`references/component_authoring.md`).

---

## THE INTERACTION CONTRACT (how to ask, default, and override)

The console is a form with defaults. Reproduce that feel:

1. **Interview once, up front — a HARD GATE, not a suggestion.** When the user asks
   for a video (or "use the console"), your FIRST action is one batched
   AskUserQuestion round (format · minutes · design · voice/voiceover · thumbnail
   art) — BEFORE new-topic, before research, before any authoring. Recorded
   failure 2026-07-17: a session silently self-picked design, format, and voice and
   only asked about voiceover at the end. Do not repeat that. Skip only questions
   the user's message already answered.
2. **Every question carries a DEFAULT.** Show it. If the user says "use defaults",
   "you pick", "just go", or answers only some, fill the rest from the defaults table
   below and STATE what you chose. Never block waiting on an optional answer — but
   the ASK itself (rule 1) is never skipped.
3. **Override any time.** "make it cyberpunk", "shorts only", "British voice",
   "target 8 minutes" — re-apply and continue. Config is data, not a gate.
4. **Only TRUTH and immutability are hard gates** (see the director skill): never
   invent time-sensitive facts, never overwrite a topic that already has a rendered
   `.mp4`. Everything else is a preference with a default.

---

## THE CONFIG (every field the UI exposes) + DEFAULTS

Ask these; anything unanswered takes the default. These mirror `webui/app.py` exactly.

| Field | Options | Default | Notes |
|---|---|---|---|
| **topic** | free text | — (required) | the only mandatory answer |
| **slug** | kebab-case | derived from topic | `node scripts/new-topic.mjs` refuses duplicates |
| **format** | both · long · shorts | **both** | long = 1920×1080, shorts = 1080×1920 |
| **design** | 30 packs (see list) | **moderndark** | the user's standing default; see ROTATION LAW below |
| **theme** | a DARK theme | = the design's dark twin | never a light theme (linter rejects) |
| **themeLight** | daylight · paper · brutalist | **daylight** | the auto light variant |
| **background** | theme default · aurora · grid · aurora-grid · plain · bokeh · starfield · grid-pulse · wave · ripple · gradient · geo | **theme default** | vary across videos, never within |
| **preset** (screenplay) | explainer · listicle · versus · deep-dive · documentary · hype-launch | **explainer** | sets scene-count range + arc |
| **audience** | general · beginner · dev | **general** | changes the whole beat map |
| **channel** | free text | **YOUR CHANNEL** | from `references/channel_profile.md` |
| **minutes** | number | — (optional) | 8+ min → documentary + chapters |
| **notes** | free text | — (optional) | constraints, must-haves |
| **source** | pasted article / URL text | — (optional) | TRUTH grounding; no source → evergreen facts only or `MISSING:` |
| **voice** (voiceover) | any edge-tts voice | **en-US-ChristopherNeural** | 320+ voices, all languages, see Voiceover |

**The 30 design packs:** cyberpunk, swiss, neobrutalism, vaporwave, bauhaus, luxury,
terminalcli, retro, material, neumorphism, artdeco, monochrome, academia, newsprint,
clay, organic, industrial, playgeo, maximalism, simpledark, flatdesign, sketch,
kinetic, crypto, corptrust, businessdeck, techstyle, boldtype, botanical, moderndark.

**ROTATION LAW.** **moderndark is the standing default and MAY repeat** when the user
picks no design — differentiate consecutive moderndark videos via background variant +
screenplay + scene mix instead. When proposing any NON-default design, list existing
choices first (read each `topics/*/long.json` `brand.theme`) and never repeat the most
recent. Two consecutive same-looking videos is a defect.

---

## THE PIPELINE (each UI step → the command you run)

Author in this order. Each stage is a console button; the command is the same script.

### 0 · Environment (Windows)
`npm`/`npx` are often blocked by execution policy — call `node <script>` directly. If PATH
goes flaky between commands, prefix: `$env:Path = "C:\Windows\System32;C:\Windows;C:\Program Files\nodejs"`.
`python` may not be on PATH — use `py`. ~60 font-fetch warnings per render are normal.
After big renders, kill leaked processes: `Get-Process node | Stop-Process -Force`.

### 1 · Scaffold the topic  (UI: "scaffold" checkbox / new-topic)
```
node scripts/new-topic.mjs <slug> "<Title>"
```
Creates `topics/<slug>/{long.json,shorts.json,out/}` and regenerates the index. REFUSES an
existing slug (topics are immutable). Then set `brand.theme`, `brand.design`, `brand.channel`.

### 2 · Author the spec  (UI: get-prompt → paste-JSON — collapses here)
You are the director. Write `topics/<slug>/long.json` (and `shorts.json` unless long-only)
FOLLOWING THE `tech-video-director` SKILL end to end: angle, theme, script (spoken voice,
research the topic beyond the one line), scene selection + anti-monotony, word anchors,
the mandatory critic pass, and a `thumbnail` (long) / `cover` (shorts) block.

The webui's two-step "generate a prompt, paste JSON back" exists only because the browser's
LLM can't touch the repo. You can. If you WANT the exact console prompt for reference:
```
node scripts/gen-prompt.mjs <cfg.json> single      # or: stage1 | stage2 <beats.json>
```
The full flow driver (validate beats, assemble a lean reply, auto-fix loop) is also here:
```
node scripts/flow.mjs stage1|single|validate|stage2|assemble|applyfix|budgets <cfg.json> [payload.json]
```

### 3 · Auto-repair + index  (UI: intake does this silently)
Before linting, run the deterministic normalizer — it fixes field aliases, animation-used-
as-transition, HOOK overruns, "160K" strings, root-vs-nested data, with no model round-trip:
```
node scripts/normalize.mjs topics/<slug>/long.json
node scripts/normalize.mjs topics/<slug>/shorts.json
node scripts/gen-index.mjs
```

### 4 · Lint  (UI: "Lint")  — the real gate; nothing renders until it PASSES
```
node scripts/lint-spec.mjs topics/<slug>/long.json
node scripts/lint-spec.mjs topics/<slug>/shorts.json
```

### 5 · Critique  (UI: "Critique")  — qualitative per-scene review
```
node scripts/critique.mjs topics/<slug>/long.json
```
Fix every linter error and address every critique warning by editing the SPEC (never the rules).

### 6 · Voiceover  (UI: voice + kind + Install/Generate) — edge-tts, optional
Install once (UI "Install / upgrade Edge-TTS"):  `py -m pip install --upgrade "edge-tts>=7,<8"`
List voices (UI dropdown, 320+ across every language): `py -c "import asyncio,edge_tts;print('\n'.join(sorted(v['ShortName'] for v in asyncio.run(edge_tts.list_voices()))))"`
Then, per format (`<kind>` = long | shorts; voice optional, default en-US-ChristopherNeural):
```
py scripts/voiceover.py topics/<slug>/<kind>.json <slug>_<kind> [voice]
node scripts/sync.mjs topics/<slug>/<kind>.json out/tts/<slug>_<kind>_timestamps.json <slug>_<kind>
```
Sync retimes every word anchor to the REAL audio (fractional anchors, `timingSource:"tts"`,
`scene.audio` set). Needs internet (Microsoft endpoint). NEVER hand-edit tts anchors afterward.
The `voiceover.py` text is derived from the spec — never hand-write voiceover files.

### 7 · Render  (UI: the 4 render buttons + thumb/cover)
```
node scripts/render-topic.mjs <slug> wide-dark|wide-light|short-dark|short-light|thumb|cover
```
→ `topics/<slug>/out/<variant>.mp4` (or `.png` for thumb/cover). A render that exits 0 but
writes no file >4 KB is a FAILURE (usually a Chromium/npx or network issue) — report it, don't
claim success. Verify the output file exists and is non-trivial in size.

### 8 · Preview in Studio  (UI: "Open Studio")
```
node node_modules/@remotion/cli/remotion-cli.js studio     # or: npm run dev
```
Shows `<slug>-wide-dark|wide-light|short-dark|short-light` + thumb/cover stills per topic.

### 9 · Outputs / package  (UI: outputs list + download)
Rendered files live in `topics/<slug>/out/`. Ship a standalone folder:
```
node scripts/package-video.mjs <slug>      # or: npm run package -- <slug>
```

---

## BUILDING A NEW COMPONENT (beyond the UI — the reason to use Claude Code)

The browser console can only ARRANGE the existing library. Creating a component needs
file + terminal access, so it is a Claude-Code-only capability. Do it when a beat has no
honest fit AND the concept will recur.

**Build-vs-reuse decision rule (apply before authoring a scene):**
1. Run the REACH-FOR map (director skill §4b): does one of the ~136 types already fit the
   SHAPE of what the narration names? If yes → reuse it. A number is not automatically a
   STAT_CALLOUT; a comparison is not automatically a list — match the shape, not the surface.
2. No honest fit AND the concept is REUSABLE (you'd want it in future videos) → build a new
   component following `references/component_authoring.md` (the six wiring files + manifest
   entry + render-proof). In this architecture "new" and "reusable" are the same job:
   a token-driven, `×scale`, both-aspect component is reusable by construction, and the
   moment it lands in `scripts/lib/manifest.mjs` the director prompt teaches it forever.
3. No fit but it's a genuine ONE-OFF → prefer the closest existing shape; do not bloat the
   library with single-use widgets (every extra type slows every future prompt).

**Fast path — scaffold first.** Instead of hand-writing the plumbing, run:
```
node scripts/new-component.mjs <config.json>
```
Give it `{type, name, dataKey, category, family, dynamic, purpose, useWhen, fields[]}`. It
WRITES a token-driven, ×scale, both-aspect `src/scenes/<Name>.tsx` skeleton that compiles
and renders immediately, and emits an exact copy-paste WIRING REPORT (`out/scaffold/<TYPE>.md`)
for the other six touch-points + the manifest entry + a linter budget block. Apply those
edits, regenerate the derived files (`node scripts/gen-schema.mjs` + `node scripts/gen-types.mjs`),
then do the render-proof loop. You still write the REAL visualization inside the `.tsx` — the
scaffolder removes the plumbing, not the craft.

**The recipe** is `references/component_authoring.md` — read it fully before touching
`src/`. Definition of done: tokens + `×scale` only; wide AND vertical proven; material +
neobrutalism stills viewed; Three Guards + budgets; all six files wired (types, scene,
registry, linter TYPES+DYNAMIC+budgets, scene_library, showcaseSpec) + the manifest entry;
`tsc` + `lint-all` clean; gate green.

---

## FULL GATE (run after any change to `scripts/` or `src/`)
```
npm run gate            # or run each: check-manifest, drift-check, test-normalize-fleet,
                        # test-fix-prompt, test-assemble, test-ui-walkthrough, gen-schema --check,
                        # test-asset-protocol, gen-types --check, test-si-resolver
```
Never weaken a rule to make the gate pass — fix the spec or the component.

---

## COMMAND QUICK-REFERENCE (UI action → command)

| UI action | Command |
|---|---|
| New topic / scaffold | `node scripts/new-topic.mjs <slug> "<Title>"` |
| Get LLM prompt | `node scripts/gen-prompt.mjs <cfg.json> single` |
| Two-paste flow | `node scripts/flow.mjs <subcmd> <cfg.json> [payload.json]` |
| Auto-repair intake | `node scripts/normalize.mjs topics/<slug>/<kind>.json` |
| Rebuild index | `node scripts/gen-index.mjs` |
| Lint | `node scripts/lint-spec.mjs topics/<slug>/<kind>.json` |
| Critique | `node scripts/critique.mjs topics/<slug>/long.json` |
| Install edge-tts | `py -m pip install --upgrade "edge-tts>=7,<8"` |
| Voiceover | `py scripts/voiceover.py topics/<slug>/<kind>.json <slug>_<kind> [voice]` |
| Sync audio | `node scripts/sync.mjs topics/<slug>/<kind>.json out/tts/<slug>_<kind>_timestamps.json <slug>_<kind>` |
| Render | `node scripts/render-topic.mjs <slug> <variant>` |
| Open Studio | `node node_modules/@remotion/cli/remotion-cli.js studio` |
| Package | `node scripts/package-video.mjs <slug>` |
| Chapters | `node scripts/gen-chapters.mjs <slug>` |
| Scaffold a NEW component | `node scripts/new-component.mjs <config.json>` |
| Gate | `npm run gate` |
