# Archify — production dossier

## What Archify is (from the source, 2026-09-12)
- An **agent skill**, not a CLI you point at a repo: the agent writes typed JSON IR, and
  archify's zero-dependency Node CLI deterministically compiles it to one self-contained
  interactive HTML file. Repo: github.com/tt-a1i/archify, MIT, 58.8k stars.
- Five types: architecture, workflow, sequence, dataflow, lifecycle.
- Commands used on camera: `validate <type> <json> --quality showcase` (one-line receipt),
  `deliver <type> <json> <html> --json` (atomic: only a passing candidate replaces the target,
  receipt carries sha256 + bytes + 9 artifact checks).
- Viewer: `/` node finder, focus -> Upstream/Downstream authored reach, `R` route probe,
  `L` lens, `M` map radar, `P` story, `T` theme, `E` export (PNG/SVG/WebM/share cards).
- Declared out of scope: automatic Mermaid parsing, general auto-layout, hosted sharing, WYSIWYG.

## THE PROMPT IS THE SPEC — the scripting rule for this video (owner, 2026-09-12)
Owner: *"You need to handle scripting too, the prompt has created me this JSON like that."*

`iauteur-pipeline.architecture.json` looks the way it looks because of the INSTRUCTION that
produced it: ten nodes, one primary path, seven named files to read. That is the honest and
the teachable point — the diagram is downstream of the request, the typed JSON is the
reviewable artifact, and a vague prompt yields a vague map.

So the narration MUST:
- put the prompt on screen and read its constraints aloud (at most twelve nodes, one primary path,
  three guided views, the evidence files, validate then deliver, three insights);
- say the agent wrote the typed source, and archify compiled and checked it;
- describe only what the recorded run performs, and say so when a stretch of thinking is cut;
- teach the viewer to write the prompt as a spec: scope, node budget, one primary path,
  the files that count as evidence.

## The prompt on camera (demos/archify-live.json, verbatim)
Use the archify skill to map the architecture of the iauteur repository in this workspace: how a
topic spec becomes a rendered video. Keep it to at most 12 nodes with one primary path, and add
three guided views. Use iauteur/README.md, iauteur/src/Root.tsx and these files in iauteur/scripts
as evidence: render-topic.mjs, bake-rec.mjs, voiceover.py, sync.mjs and lint-spec.mjs. Write
iauteur.architecture.json, validate it at showcase quality, then deliver iauteur.architecture.html
with --json. Skip visual-check. Finish with three short architectural insights for a system architect.

## Production facts (the shipped take, 2026-09-13, for truth-to-footage)
- One uninterrupted run, recorded whole: 226.7s of footage, Claude Code v2.1.270, "Cogitated for
  2m 59s". The skill loaded, the agent read the architecture schema, ran wc -l over the evidence,
  grepped README headings, read the top of lint-spec.mjs and Archify's authoring-contract notes on
  repository evidence, then wrote the JSON with a heredoc.
- The first validation returned ok: false; three rounds of fixes followed (two labels moved, ports
  set on the render-checks edge, canvas narrowed 1640 -> 1380) before deliver passed.
- Result: 11 nodes, 10 connections, 3 summary cards, 3 guided views (Primary render path,
  Pre-render gates, Voice and footage baking); spec 5,899 bytes, HTML 813,146 bytes.
- Insights it gave: the spec is shared mutable state guarded by a lock file; the render gates live
  only in render-topic.mjs; timing depends on recorded inputs, so reproducibility rests on keeping
  timestamps and capture manifests stable.
- The cut uses jump cuts (scripts/split-rec-step.mjs): prompt 0-45s, reading 62-90s, write
  158-200s, result 200s-end. 45-62s is excluded because Claude Code's weekly-usage warning is on
  screen there; that warning must never ship.
- The clone's own CLAUDE.md and .claude were set aside for the take so the agent would not load
  iauteur's production laws while reading the repository, and restored afterwards.
- Recording surface: VS Code for Web (code serve-web) with a real terminal, Claude Code running
  interactively so the agent's tool calls stream on camera.
