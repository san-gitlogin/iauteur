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
- put the prompt on screen and read its constraints aloud ("ten nodes, one primary path");
- say the agent wrote the typed source, and archify compiled and checked it;
- never imply the map appeared from nothing, and never claim the on-camera run re-read the
  whole repository. The shipped take shows: check the source against `render-topic.mjs`,
  validate at showcase quality, deliver with `--json`.
- teach the viewer to write the prompt as a spec: scope, node budget, one primary path,
  the files that count as evidence.

## Production facts (what actually happened, for truth-to-footage)
- The first full mapping run (7 files, 10 nodes) wrote the typed JSON, then the account hit
  its daily limit mid-run; that take was discarded, and the limit screen must never ship.
- The shipped agent take is scoped to check + validate + deliver, for cost. The JSON on screen
  is the agent's own work from the mapping run.
- Recording surface: VS Code for Web (`code serve-web`) with a real terminal, Claude Code v2.1.269
  running interactively so the agent's tool calls stream on camera.
