# Video Studio Console

A local **Flask** control panel for this Remotion video factory. It does **not**
call any AI — it builds the brief you hand to Claude Code / Copilot in chat, and
runs the deterministic local steps (scaffold / lint / critique / render / Studio).

## The workflow (where AI fits)

```
┌── Console (this app) ──┐        ┌──── Chat (Claude/Copilot) ────┐
│ topic + config         │        │                                │
│ pick design (preview)  │  ───▶  │ reads briefs/<slug>.md,        │
│ "Generate brief"       │  paste │ writes topics/<slug>/*.json    │
│                        │  line  │ lints + critiques              │
│ Lint / Render / Studio │  ◀───  │ "it's ready"                   │
└────────────────────────┘        └────────────────────────────────┘
```

The app writes a self-contained brief to `briefs/<slug>.md` and shows a one-line
message to paste in chat. The AI authors the spec into the topic folder. Then you
come back and click **Render** / **Open Studio**.

## Run

```powershell
py -m pip install -r webui/requirements.txt
py webui/app.py
```

Open http://127.0.0.1:5000

## Panels
1. **Configure** — topic, pasted source (for TRUTH grounding), format, screenplay
   preset, audience, target length, light twin, background, channel, notes, and an
   optional "scaffold now" checkbox.
2. **Pick a design** — 30 live thumbnails (from `out/proof/designs/`). Selecting one
   sets `brand.design` + `brand.theme`.
3. **Hand to AI, then render** — the chat handoff line + full brief, plus buttons to
   lint / critique / render / open Remotion Studio and preview outputs.

## Notes
- Design thumbnails come from `out/proof/designs/`. Regenerate them any time with
  `node scripts/preview-designs.mjs <sceneId>`.
- Render buttons run the existing `scripts/render-topic.mjs`; long renders may take a
  while — for very long videos prefer a terminal.
- The existing-topics dropdown shows each topic's theme so you can rotate designs.
