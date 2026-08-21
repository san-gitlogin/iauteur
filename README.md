<p align="center">
  <img src="brand/iauteur-banner.png" alt="iAuteur — topic in, film out" width="820" />
</p>

<p align="center">
  <a href="docs/media/iauteur-introducing.mp4">
    <img src="docs/media/iauteur-introducing-poster.png" width="820"
         alt="Watch: introducing iAuteur — the whole workflow, screen by screen" />
  </a>
</p>

<p align="center">
  <b><a href="docs/media/iauteur-introducing.mp4">▶&nbsp; Introducing iAuteur</a></b><br>
  <sub>Twenty-one hours of editing, or this: type one line into iAuteur, copy the brief iAuteur
  writes, paste it into whichever assistant you already use, paste the file back, preview a scene,
  press the button on the one scene that needs a picture nobody has built yet, pick a voice — and
  out come four finished videos. Then the same thing again with your own AI key, one button and no
  pasting at all. Every step on screen, with iAuteur's own progress rail running underneath so you
  always know where you are. Made by iAuteur, about iAuteur. Spec:
  <code>topics/iauteur-introducing/</code>.</sub>
</p>
<p align="center">
  <a href="LICENSE"><img alt="MIT licence" src="https://img.shields.io/badge/licence-MIT-green"></a>
  <a href="CONTRIBUTING.md"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen"></a>
  <a href="https://remotion.dev"><img alt="Built with Remotion" src="https://img.shields.io/badge/built%20with-Remotion-0B84F3"></a>
  <img alt="Node" src="https://img.shields.io/badge/Node-%E2%89%A518-339933?logo=nodedotjs&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white">
  <img alt="341 components" src="https://img.shields.io/badge/components-341-E8A22E">
  <img alt="30 design packs" src="https://img.shields.io/badge/design%20packs-30-E8A22E">
  <img alt="42 themes" src="https://img.shields.io/badge/themes-42-E8A22E">
  <img alt="Works with any LLM" src="https://img.shields.io/badge/works%20with-any%20LLM-8957E5">
</p>

Turn a **topic** into a finished tech‑explainer video. You (or any LLM) describe the video as a
**JSON spec**; [Remotion](https://remotion.dev) renders it to MP4 — 16:9 long‑form **and** 9:16 shorts,
each in **dark and light**. The project ships a large, audited component library (**341 scene types**)
that automatically reskins across **30 design packs** and **42 themes**.

> **The JSON is the movie.** `topics/<slug>/long.json` + `shorts.json` → Remotion renders exactly what
> the spec says. Scene components are deterministic and read theme tokens, so one spec looks native in
> every design pack and in dark or light with zero extra work.

**This is not a stock‑footage generator.** Every scene is a real, hand‑built animated component — charts,
diagrams, device mockups, timelines — that reads theme tokens and re‑skins itself. A linter counts your
words against per‑component budgets and refuses to render an overfull scene, and animations are anchored
to individual **words** of the narration, so the payoff lands exactly when it's spoken.

**Bring your own model.** The director that writes the JSON is *any* LLM. Point the console at your own
API key (OpenAI, Azure, Groq, OpenRouter, Together, Hugging Face, or a **local Ollama**) and it runs the
whole authoring loop for you — or use no key at all and paste prompts into whatever chat you already have
open. Both paths are first‑class; see [the two ways to author](#the-two-ways-to-author).

---

## 🎬 Make your first video

You do **not** need to understand code. Install two things, run one command, then mostly click buttons.

### 1 · Install the two prerequisites (once, ~10 minutes)

| | What | Where |
|---|---|---|
| 1 | **Node.js** — click the big green **LTS** button and run the installer | [nodejs.org](https://nodejs.org) |
| 2 | **Python** — on Windows, tick **"Add Python to PATH"** during install | [python.org/downloads](https://www.python.org/downloads/) |

Then, in a terminal opened at the project folder, run these two lines once:

```bash
npm install
pip install -r webui/requirements.txt
```

### 2 · Start the console

```bash
python webui/app.py
```

Open **http://127.0.0.1:5000**. You'll see five numbered steps down the left — go top to bottom.

### Step 1 · Topic — say what the video is about

Type your idea (e.g. *"How Wi‑Fi works"*). Paste an article into **Source material** if the facts must come
from a specific source; leave it blank for evergreen topics.

<img src="docs/img/01-topic.png" alt="Step 1 — entering the topic" width="100%">

### Step 2 · Design — pick the look

Click a design pack. Each thumbnail is the *same scene* rendered in that pack, so you're comparing like for
like. This one choice sets the theme for every scene in the video.

<img src="docs/img/02-design.png" alt="Step 2 — choosing a design pack" width="100%">

### Step 3 · Author — write the script

This is where the video actually gets written, and there are **two ways to do it**:

**Automatic** — open **AI automation**, paste in an API key (or point it at a local Ollama), and click run.
It writes the beat sheet, fills in every scene, validates, and stops before rendering so you can review.

**Manual (no API key)** — click **Generate beat‑sheet prompt**, **copy**, paste it into ChatGPT / Claude /
Copilot, and paste the reply back. Then do the same for the fill prompt. Slower, but costs nothing and
works with any chat you already pay for.

Either way you land here, with the script laid out beat by beat. The meters count your words against each
component's budget and turn **red** when a line is too long to fit on screen:

<img src="docs/img/03-author.png" alt="Step 3 — reviewing narration beat by beat" width="100%">

**Preview any beat before committing to a full render.** Click **▶ preview** on any row and it asks once
whether you want narration, then renders just that beat and plays it inline:

<img src="docs/img/04-preview-ask.png" alt="Preview asking whether the beat needs narration" width="100%">

A beat you haven't filled in yet still previews — it uses that component's own sample content and labels it
`SAMPLE`, so you can check the look and motion before writing a single number.

### Step 4 · Voiceover (optional)

Pick a voice and generate. The narration is spoken, then the scene timings are re‑synced to the **real
audio** — so what you saw in the preview is what you get in the render.

> **Write it to be said, not read.** The linter runs a *human-voice guard* over every spec before
> you get here: it measures how much your sentence lengths vary, how often a sentence opens with
> "It" or "This", how many sentences start the same way, and whether you use contractions at all.
> Flat, evenly-metered, pronoun-heavy prose is the thing that makes a good-looking video sound
> machine-made — name the subject, use "you'll" and "here's", and let some sentences run long while
> others land in three words.

<img src="docs/img/05-voiceover.png" alt="Step 4 — choosing a voice" width="100%">

### Step 5 · Render

Click **Render — wide · dark** for the main 16:9 video. The same spec also gives you a light version and
both 9:16 vertical cuts, with no extra work. Progress streams in the console at the bottom; finished files
land under **Outputs** and in `topics/<slug>/out/`.

<img src="docs/img/06-render.png" alt="Step 5 — rendering the four variants" width="100%">

> **Renders take a few minutes.** The first one also downloads a headless Chromium and fonts. Watch the
> progress bar — it isn't stuck.

<sub>Screenshots are generated from the running app by <code>python scripts/docs_shots.py</code>, so they
stay in step with the UI.</sub>

---

## Table of contents
- [🎬 Make your first video](#-make-your-first-video)
- [Showcase](#showcase)
- [What this project is](#what-this-project-is)
- [How it works (architecture)](#how-it-works-architecture)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Make a video from a topic](#make-a-video-from-a-topic)
- [The two ways to author](#the-two-ways-to-author)
- [The Web Console (`webui/`)](#the-web-console-webui)
- [Command reference](#command-reference)
- [Project structure](#project-structure)
- [The component library](#the-component-library)
- [Voiceover & rendering](#voiceover--rendering)
- [Reproducibility — what's committed](#reproducibility--whats-committed)
- [Troubleshooting](#troubleshooting)
- [Repository conventions](#repository-conventions)
- [Contributing](#contributing)
- [Credits & attribution](#credits--attribution)
- [Changelog](CHANGELOG.md)
- [Licence](#licence)

---

## Showcase

A handful of the **341 components**, rendered straight from JSON specs across different design packs
(finance in `corptrust`, science in `organic`) — dark themes shown:

<table>
<tr>
<td align="center"><img src="docs/media/ticker-tape.png" width="270" alt="TICKER_TAPE"/><br/><code>TICKER_TAPE</code></td>
<td align="center"><img src="docs/media/candlestick.png" width="270" alt="CANDLESTICK"/><br/><code>CANDLESTICK</code></td>
<td align="center"><img src="docs/media/sankey.png" width="270" alt="SANKEY"/><br/><code>SANKEY</code></td>
</tr>
<tr>
<td align="center"><img src="docs/media/vector-field.png" width="270" alt="VECTOR_FIELD"/><br/><code>VECTOR_FIELD</code></td>
<td align="center"><img src="docs/media/radar.png" width="270" alt="RADAR"/><br/><code>RADAR</code></td>
<td align="center"><img src="docs/media/dna-helix.png" width="270" alt="DNA_HELIX"/><br/><code>DNA_HELIX</code></td>
</tr>
</table>

Each is one deterministic component that reskins across all 30 design packs and dark/light. Browse the whole
library live with `npm run dev` — open any `<design>-wide` composition and scrub.

---

## What this project is

A pipeline that converts a **tech topic** (a bare idea, a title, or a source article) into **renderable
video**. It has three layers:

1. **A spec format** — a JSON document (`meta` + `brand` + `scenes[]` + `thumbnail`/`cover`) that fully
   describes a video. This is the contract between "the idea" and "the pixels."
2. **A render engine** — a Remotion (React) project that maps each `scene.type` to a component, applies a
   theme + design pack, and renders deterministic frames. Same spec → 4 deliverables (wide/short × dark/light).
3. **A director skill** — a Markdown instruction set (`.claude/skills/tech-video-director/`) that teaches an
   LLM how to turn a topic into a valid spec: pick a theme, write a tight script, choose the right components,
   place word‑anchored animations, and pass the linter.

The creative step (topic → spec) is done by an LLM; the mechanical steps (validate, preview, render) are
deterministic scripts. The two never mix — which is what makes the whole thing portable across any AI tool.

## How it works (architecture)

```mermaid
flowchart LR
  T[Topic / article] -->|LLM reads the director skill| S[JSON spec<br/>topics/&lt;slug&gt;/long.json + shorts.json]
  S -->|npm run lint| L{Linter gate<br/>budgets · anti-monotony · structure}
  L -->|pass| R[Remotion]
  R --> W[wide-dark / wide-light .mp4]
  R --> H[short-dark / short-light .mp4]
  R --> TH[thumbnail / cover .png]
  L -->|fail| S
```

- **Entry:** `src/index.ts` → `src/Root.tsx` registers every Studio composition.
  - Per topic: `<slug>-wide-dark`, `<slug>-wide-light`, `<slug>-short-dark`, `<slug>-short-light`,
    `<slug>-thumb` (1280×720 still), `<slug>-cover` (1080×1920 still).
  - Per design pack: `<design>-wide` / `-short` (the full component showcase) and `<design>-new-wide` / `-new-short` (a focused reel of the newest components).
- **Renderer:** `src/MainComposition.tsx` holds the `scene.type → component` registry. For each scene it
  composes `Background → SceneTransition → SceneFx → the component (+ optional picture‑in‑picture)`.
- **Themes vs design packs:** `brand.theme` is the **dark skin**; its light twin (`brand.themeLight`,
  default `daylight`) renders automatically. `brand.design` optionally selects one of the 30 **design packs**,
  which can override specific components *and* reskins everything else via theme tokens.

## Prerequisites

- **Node.js ≥ 18** (LTS 20 or 22 recommended). `.nvmrc` pins **22** — run `nvm use` if you use nvm.
- **~2 GB free disk** for `node_modules` + Remotion's headless Chromium (auto‑downloaded on the first render).
- **Network on first run** — Remotion fetches Google Fonts and, once, a Chromium binary; both are cached after.
- **Web Console + voiceover:** Python 3.9+ and `pip install -r webui/requirements.txt`
  (Flask + edge‑tts). Optional for the pure‑CLI path, required for the five‑step console above.
- **Optional — AI automation:** an API key from any supported provider, *or* a local Ollama. The provider
  adapter needs no extra package; `litellm` is only for Bedrock / Vertex / Anthropic‑native endpoints.

Everything core runs through `npm` scripts — no global installs required.

## Quick start

```bash
git clone https://github.com/san-gitlogin/iauteur.git
cd iauteur
npm install          # restores exact versions from package-lock.json
npm run dev          # opens Remotion Studio at http://localhost:3000
```

In Studio's left sidebar you'll see the **topic videos** (e.g. `how-llms-work-wide-dark`) and the
**design showcases** (e.g. `material-wide`, `cyberpunk-new-wide`). Press play, scrub the timeline, flip
designs. Editing any `topics/<slug>/*.json` hot‑reloads instantly.

## Make a video from a topic

The end‑to‑end flow. Steps 1 and 3 are done by an LLM (the "director"); the rest are deterministic commands.

**1. Scaffold the topic folder.**
```bash
npm run new-topic -- how-dns-works "How DNS Resolves a Domain"
# creates topics/how-dns-works/{long.json, shorts.json, out/} with empty stub specs
```

**2. Hand the topic to an LLM as "the director."** Point your AI assistant at the skill and ask it to
fill the specs (see [the two ways to author](#the-two-ways-to-author) for exact prompts). The
director follows `.claude/skills/tech-video-director/SKILL.md`, which walks it through:
- pick an **angle** + audience and a **screenplay** preset (explainer / listicle / versus / deep‑dive / documentary / hype‑launch);
- choose a **theme** (rotated so no two videos look alike) and background;
- write a tight, sound‑off‑legible **script** (~150 wpm; `durationFrames ≈ words × 12 + 30`);
- map each beat to the **right component by intent** (a trend → `LINE_CHART`, a comparison → `BAR_COMPARE`, an equation → `FORMULA`, a company → `LOGO_WALL`, …) while obeying the **anti‑monotony law**;
- set **word anchors** (`atWord`) so each element animates in exactly when the narration names it;
- add a `thumbnail` (long) / `cover` (shorts) block;
- run a silent **critic pass** before emitting.

The result is written to `topics/how-dns-works/long.json` and `shorts.json`.

**3. Validate — the render gate.**
```bash
npm run lint            # hard budgets, structure, anti-monotony (nothing renders until this passes)
npm run critique        # optional: qualitative per-scene review
```
Fix the **spec** (never the linter) until it passes.

**4. Preview.**
```bash
npm run dev             # then open how-dns-works-wide-dark, -short-dark, etc.
```

**5. (Optional) Add narration.** See [Voiceover & rendering](#voiceover--rendering).

**6. Render the finished files.**
```bash
npm run render -- how-dns-works wide-dark     # → topics/how-dns-works/out/wide-dark.mp4
npm run render -- how-dns-works short-dark    # → .../out/short-dark.mp4
npm run render -- how-dns-works thumb         # → .../out/thumb.png
```
Variants: `wide-dark` · `wide-light` · `short-dark` · `short-light` · `thumb` · `cover`.

**7. (Optional) Package a standalone bundle** you can zip and hand off:
```bash
npm run package -- how-dns-works              # → dist/how-dns-works-video/ (+ .zip)
```

## The two ways to author

The creative step (topic → spec) needs a language model. The mechanical steps (validate, preview, render)
are deterministic scripts that need no model at all. You choose how the creative step happens.

### A · Automatic — the console drives your model

Open **AI automation** in Step 3, paste an API key, pick a model, and run. The console writes the beat
sheet, casts a component per beat, fills every scene, re‑lints, and applies fix rounds — streaming each
step into the console — then **stops before rendering** so you review before spending render time.

Nine provider shapes are supported out of the box (`webui/ai_providers.json`):

| | Providers |
|---|---|
| **Hosted** | OpenAI · Azure OpenAI · Groq · Together · OpenRouter · Hugging Face |
| **Local** | **Ollama** — point it at `http://localhost:11434`, no key, nothing leaves your machine |
| **Other** | any OpenAI‑compatible endpoint (`custom`), or `litellm` for Bedrock / Vertex / Anthropic‑native |

The adapter (`scripts/ai/provider.py`) uses only the Python standard library — `litellm` is an optional
install needed solely for the non‑OpenAI‑shaped providers.

**Your key stays local.** It's written to a gitignored `.env` and used only by the Flask app on your own
machine. There is no hosted iAuteur service and nothing is sent anywhere except to the provider you chose.

### B · Manual — no key, any chat you already have

The console generates carefully‑built prompts; you paste them into ChatGPT, Claude, Copilot, Gemini,
whatever you use, and paste the reply back. Two prompts (beat sheet, then fill) or one combined prompt for
stronger models. Costs nothing beyond the subscription you already pay for.

This also works entirely outside the console, with a coding agent that can read the repo:

> "Read `.claude/skills/tech-video-director/SKILL.md` and the files it references, then write
> `topics/<slug>/long.json` and `shorts.json` for the topic: **<your topic>**. Follow every law
> (theme rotation, text budgets, anti‑monotony, word anchors, truth). When done, I'll run `npm run lint`
> and paste any errors back for you to fix."

Works with Copilot, Claude Code, Cursor, Cline, Aider, or a local model behind Continue.dev. Smaller local
models do better if you paste `scene_library.md` + `text_budgets.md` inline and work **one scene at a
time**, re‑linting after each chunk.

### Whichever you pick, the guarantees are the same

The model only ever proposes JSON. The linter is the judge — budgets, anti‑monotony, structure, and word
anchors are all enforced by deterministic code, so a bad generation fails loudly instead of rendering an
ugly video.

## The Web Console (`webui/`)

A local **Flask** control panel — the recommended way to drive the whole pipeline.

```bash
pip install -r webui/requirements.txt
python webui/app.py                      # http://127.0.0.1:5000
```

It gives you the five‑step flow shown [above](#-make-your-first-video): topic and source, the 30 design
packs as visual choices, authoring (automatic or manual), per‑beat preview, voiceover, and one‑click
renders — with a live log of every command it runs. It also carries a **Component Lab** for building an
entirely new scene component and wiring it in, type‑checked, with rollback if it doesn't compile.

Design thumbnails come from `out/proof/designs/`; if the gallery is empty, generate them once with
`node scripts/preview-designs.mjs`.

## Command reference

| Command | What it does |
|---|---|
| `npm run dev` | Remotion Studio (live preview) at :3000 |
| `npm run new-topic -- <slug> "Title"` | Scaffold `topics/<slug>/` + regenerate the index (refuses existing slugs) |
| `npm run lint` | Validate every spec — budgets, anti‑monotony, structure. **The render gate.** |
| `npm run critique -- <spec>` | Qualitative per‑scene design review (no arg → all topics + gallery) |
| `npm run render -- <slug> <variant>` | Render one variant → `topics/<slug>/out/`. Variant = `wide-dark`\|`wide-light`\|`short-dark`\|`short-light`\|`thumb`\|`cover` |
| `npm run package -- <slug>` | Build a self‑contained `dist/<slug>-video/` bundle + zip |
| `npm run chapters -- <slug>` | Generate YouTube chapters from scene durations |
| `npm run voiceover -- <slug>` | Generate voiceover **text** (`sceneId\|narration`) from the spec (never hand‑written) |
| `npm run gen-index` | Regenerate `src/topicsIndex.ts` from the `topics/` folders |
| `npm run schema` | Regenerate `specs/video.schema.json` from the component manifest |
| `npm run template -- T1,T2,…` | Print a starter spec skeleton (manifest examples) for the given scene types |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run audit` | Full library gate: census → self‑test → tsc → lint → audio‑check → determinism |

`npm run render` calls `npx remotion render <slug>-<variant>` under the hood; the first render downloads a
headless Chromium automatically.

### Upload kits (generated, never hand-written)

Every video render also writes the publishing metadata, so it can never drift from the spec:

| File | Contains |
|---|---|
| `out/upload.md` | Long-cut title and description in the channel's house pattern, **⏱️ chapters with timestamps derived from scene frames**, 🔗 sources collected from `data.source`, subscribe line, and a ≤500-char tags block. |
| `out/upload-shorts.md` | The short's own title and description, a **▶️ FULL EPISODE** pointer naming the long cut, source credit, `#Shorts`, and tags. No chapters — a sub-60s vertical has nothing to chapter. |

Creative fields come from `meta.seo` (authored at spec time, with fallbacks to `meta.openLoop` /
`meta.onePayoff`); timestamps and sources are machine-derived. Where an episode's on-screen
`data.source` values are all illustrative, `meta.seo.sources` supplies a render-invisible credit so
the description still attributes properly without adding a footer to a finished video.

## Spec schema (the editor floor)

`specs/video.schema.json` is a draft‑07 JSON Schema **derived from the component manifest**
(`scripts/lib/manifest.mjs`) by `npm run schema`. `.vscode/settings.json` binds it to every
`topics/*/long.json`, `topics/*/shorts.json` and `specs/gallery.json`, so the editor gives you
**autocomplete and inline validation** as you author a spec — one source (the manifest) feeds the
LLM prompt, the normalizer, the field validator **and** this schema.

It is a **floor, not the whole law.** The schema checks:

- **shape** — each scene's `data` matches its type (via a per‑type `if type == X then …` branch, all 341 types);
- **enums** — `brand.theme` (dark skins), `themeLight`, `background`, each scene `transition`/`anim`/`background`, `meta.format`;
- **string budgets** — `maxLength` on every text field, mirrored from the linter.

It does **not** check required‑ness, counts, adjacency or cross‑field rules — those belong to the
linter (`npm run lint`). So **schema‑green ≠ lint‑green**: a spec can satisfy the schema and still be
rejected by the linter's deeper rules, but a schema failure is always a real shape/enum/budget error.
`npm run gate` runs `gen-schema --check` to guarantee the committed schema never drifts from the manifest.

### What the linter checks that a schema cannot

Beyond shape and budgets, `lint-spec.mjs` enforces the craft rules that decide whether a video
actually teaches. These were each learned by shipping something that did not, and they are the
reason a spec can be schema-valid and still rejected:

| Guard | What it measures | Why |
|---|---|---|
| **Human voice** | sentence-length σ, pronoun-opener share, repeated openers, contraction rate | A script with zero contractions and evenly-metered sentences reads as a machine reading a manual, and no amount of good visuals rescues it. Measured across a whole spec, never per scene. |
| **Opening contract** | branding in scene 1 (error), missing greeting, title/thumbnail words absent from the opening, no question in the first four beats | A viewer arrives carrying an expectation set by what they clicked. Leading with branding is the most-documented way to lose the first 30 seconds; opening a curiosity loop and then satisfying it is the difference between a click promise and clickbait. |
| **Motion-earned ceiling** | scene seconds vs anchored elements (4s each past the first, hard stop 30s) | A flat cap throttles explanation. A long scene is an invitation to *step something more*, not to trim the teaching. |
| **Teaching density** | ≥4s per taught code line; `CODE_RUN` needs ≥2 distinct anchors | Narrating *about* code is not teaching it. Below that rate nobody can read along. |
| **Moving backgrounds** | `grid-pulse`, `ripple`, `wave`, `matrix-rain`, `ember` | A background that animates sits behind the teaching and competes with it. |
| **Per-component semantics** | e.g. a race whose fast route wins after the slow one finishes; a "one exception" picture with no exception; a predicate that rejects nothing | The most valuable rules are the editorial ones. A component should refuse to draw a picture that argues the opposite of its own point. |

Warnings are advisory to the linter and **rejections in practice** — fix them before voicing, since
re-voicing costs a full build → voiceover → sync loop.

## Project structure

```
topics/<slug>/          One folder per video: long.json + shorts.json (TRACKED — the authored work)
                        plus out/ renders (NOT tracked — regenerable, and 3.9 GB of them).
briefs/                 The source each spec was authored from. The JSON is the truth, not the .py
                        beside it — see briefs/README.md before running any builder.
specs/gallery.json      Component showcase (every type demoed) — feeds the design-preview compositions.
specs/demo-*.json       Finance + science demo videos that exercise the full library.
src/
  index.ts · Root.tsx   Remotion entry + composition registration (topics + design showcases).
  MainComposition.tsx   Scene registry: maps scene.type → component (341 types).
  types.ts              The spec schema (VideoSpec, Scene, BrandConfig, SceneData…).
  themes.ts             42 themes (38 dark + 4 light) — all colour/font/scale tokens.
  designs/<pack>/       The 30 design packs (per-pack component overrides + chrome + chart kit).
  scenes/               The 339 scene component files.
  charts/ diagrams/ motion/   Chart bodies · the DIAGRAM engine · the animation library.
  dsaViz.tsx            The two-up rig (CodeStage/SoloStage/StatePane) + the algorithm depictions.
                        StatePane MEASURES its own inner height and publishes it via stackBudget —
                        every depiction sizes to that, never to a constant (LAW 0o).
  linuxViz.tsx          The Linux effect-pane depictions, incl. MetricChart (real declared series).
  mcpViz.tsx            The 16 protocol depictions behind the MCP_* scene types.
  ui.tsx · kit.tsx      Shared primitives (Headline, Panel, useScale, useSem, GaugeRing, ChromeFrame…).
  topicsIndex.ts        AUTO-GENERATED by gen-index — never edit by hand.
scripts/                Tooling: lint, render, new-topic, package, chapters, voiceover, audit, gen-index…
.claude/skills/         tech-video-director (the authoring contract) + 30 design-* skills.
webui/                  Optional Flask console (brief builder + pipeline runner).
audit/                  census.json · matrix.md · register.md — the library's audit state.
docs/                   ARCHITECTURE.html.  PROGRAM_3_FINAL.md — component-library build report.
CLAUDE.md · PROJECT_RULES.md   Repo laws and the topic lifecycle (read before large changes).
```

## The component library

**341 scene types** grouped into families — core editorial (HOOK, TITLE_CARD, LIST_BUILD, STAT_CALLOUT,
RECAP, OUTRO_CTA…), charts (LINE_CHART, BAR_COMPARE, DONUT, FUNNEL, WATERFALL, RADAR, CANDLESTICK, SANKEY,
TREEMAP, BOX_PLOT, PICTOGRAM…), diagrams & engines (DIAGRAM, PIPELINE, NEURAL_NET, STATE_MACHINE,
KNOWLEDGE_GRAPH…), code/cloud/AI surfaces (CODE_EDITOR, TERMINAL_SESSION, CLOUD_ARCH, K8S_CLUSTER,
AGENT_HARNESS, RETRIEVAL_RANK…), icons/logos (ICON_GRID, LOGO_WALL, LOGO_VERSUS…), topic‑general set‑pieces
(FORMULA, MOLECULE, DNA_HELIX, CIRCUIT_FLOW, VECTOR_FIELD, TICKER_TAPE, MAP_RADAR…), and a media / creator‑
overlay family (VIDEO_HERO, CAPTION_KINETIC_OVERLAY, PHOTO_TIMELINE…), plus a workflow family that draws
real software rather than diagrams of it (APP_WINDOW, PROMPT_HANDOUT, CHAT_TRIO, VIDEO_PLAYER,
BEAT_BOARD, COMPONENT_LAB, AUTO_RUN, SCENE_FORGE, CHECK_SWEEP, PRODUCTION_GRIND, REPO_CTA, INTRO_CARD).

Two families were built for whole courses and are worth calling out, because they are what the
library looks like when it is doing its job rather than decorating:

- **Command surfaces** (109 `CMD_*` types — CMD_VMSTAT, CMD_CHMOD, CMD_JOURNALCTL…). Each draws one
  Linux command's real output beside a picture of what the command did to the machine, with the
  terminal transcript verbatim and a chart plotting a declared series, not a sine wave.
- **Protocol surfaces** (17 `MCP_*` types). MCP is a protocol, so nothing in the algorithm or chart
  families fits: what has to move is a message, a direction, and who is in control. MCP_WIRE is a
  running sequence diagram with the envelope crossing between two machines; MCP_CONTROL wires each
  primitive back to whoever fires it; MCP_MESH draws the M×N integration explosion one wire at a
  time and collapses it through a hub; MCP_REACH puts the model on one side of a hard line and your
  files, database and calendar on the other, with your code as the only crossing.

A **teaching family** joined the library while producing a full tutorial course, and it is the one to
reach for when a beat has to *explain* rather than present: `CODE_RUN` (a program taught line by line,
each with a plain-English note and its own result), `BROWSER_STEP` (the page built from the steps),
`FIXTURE_CREW`, `QUIZ_CARD`, `THEATER_STAGE`, `OVERLAY_BLOCK`, `FROZEN_FRAME` (a live run held
mid-breath), `RECORD_DRAFT` (actions becoming code, then judged), `WORKER_SPREAD`, `ORDER_ROULETTE`,
`SEARCH_NARROW`, `SET_LOGIC`, `SEALED_BOX`, `BACKSTAGE_PHONE`, `STAGE_HANDOFF`, `HAND_STAMP`,
`SCOPE_LADDER`, `MAIL_ROOM`, `SAD_PATHS`, `TRACE_SCRUB`, `CHANGE_RIPPLE`, `RULE_TEST` and others.

Most were built rather than reused, on purpose: **a card that only PRINTS an idea is not a visual —
build the one that ENACTS it.** When a concept beat gets a generic card, the viewer is asked to build
the picture themselves, and they build it from their own life rather than yours.

Separately from the scene types, a scene can carry a **`stepRail`** — the app-progress chrome drawn by
the shell *over* whatever component the beat uses, so a multi-step walkthrough never loses the viewer.
It composes with all 341 types without any of them knowing about it.

The authoritative, always‑current catalog is `.claude/skills/tech-video-director/references/scene_library.md`
(the "USE WHEN" table + the data shape for each type). `PROGRAM_3_FINAL.md` summarises how the library was
built and audited. To browse them visually, run `npm run dev` and open any `<design>-wide` composition.

## Voiceover & rendering

Specs render silently by default. To add narration (optional, three steps — the last two are run manually
because they need Python/network):

```bash
npm run voiceover -- <slug>                                   # 1. derive voiceover_*.txt from the spec
python scripts/voiceover.py topics/<slug>/long.json <slug>_long   # 2. edge-tts → public/audio/*.mp3 + out/tts/*_timestamps.json
node scripts/sync.mjs topics/<slug>/long.json out/tts/<slug>_long_timestamps.json <slug>_long  # 3. rewrite anchors to exact frames
```
Then `npm run lint` and re‑render. (Requires `pip install edge-tts` and internet for step 2.)

## Reproducibility — what's committed

- **Committed:** all source, specs, topics, design packs, skills, docs, `public/assets/` (images + demo clips
  that specs reference), and `package-lock.json` (exact dependency versions). A fresh `npm install` reproduces
  the toolchain exactly on any machine.
- **Ignored** (see `.gitignore`): `node_modules/`, render outputs (`out/`, `dist/`, `*.zip`), logs, Python
  caches, `.env*`. All regenerated locally — nothing required to run is left out.
- **First run only:** Remotion downloads Chromium once and fetches Google Fonts over the network.

## Troubleshooting

- **`npm run render` can't find the composition** — run `npm run gen-index` (regenerates `src/topicsIndex.ts`
  so new topics register), then retry. Confirm the spec passes `npm run lint`.
- **A spec won't render / lint fails** — the linter prints the exact budget or structure error; fix the spec,
  never the linter. Text over budget → shorten the idea, don't shrink the font.
- **Studio shows a webpack "Restoring failed … Expected end of object" warning** — a stale build cache; it's
  discarded and rebuilt automatically. Harmless. Delete `node_modules/.cache` to silence it.
- **Fonts or Chromium fail to download** — you're offline; connect once so Remotion can cache them.
- **Design gallery empty in the Web Console** — run `node scripts/preview-designs.mjs` to generate the
  thumbnails into `out/proof/designs/`.

## Repository conventions

- **Topics are immutable** once shipped — `new-topic` refuses existing slugs; create a new one instead.
- **`brand.theme` must be a dark theme**; the light twin renders automatically. Rotate themes across videos.
- **Truth first** — facts come only from a provided source or a live search; never invent stats, quotes, or dates.
- **Text budgets are law**, enforced by the linter. Deterministic motion only (no unseeded randomness).
- Building or changing a **component** is a code job that follows
  `.claude/skills/tech-video-director/references/component_authoring.md` (six wiring files + both‑aspect proofs).
- `CLAUDE.md` and `PROJECT_RULES.md` hold the full working rules — read them before large changes.

## Contributing

**Contributions are wanted, at any size.** A typo fix, a bug report with a screenshot, a whole new
scene component — you don't need permission to start.

Start with **[CONTRIBUTING.md](CONTRIBUTING.md)**. It covers setup, the health check that tells your
breakage apart from pre-existing breakage, the rules that decide whether a PR gets merged, and the
six-file recipe for adding a scene component (plus the tool that wires those six files for you and
rolls back cleanly if a gate fails).

The most useful contributions right now:

| | |
|---|---|
| **Make a video and say what confused you** | No code needed. The docs were written by someone who already knows the answers, so fresh confusion is real information |
| **A scene that looks wrong** | Send the still, the component type, the design pack, and the aspect. Most visual bugs live in one pack or one aspect only |
| **A new scene component** | There are 341 and the library is nowhere near done. This is the flagship contribution |
| **A design pack** | A whole visual language every component inherits automatically |

One warning worth repeating from the contributor guide: **`tsc` and the gate have never once caught a
visual defect in this repo.** Every one was found by rendering a still and looking at it. If you change
a component, please look at it — in both aspects, and in a flat design as well as a glowing one.

Fork it and do something strange with it, too. That needs no issue and no permission.

## Credits & attribution

This project was built **on top of** the work below, using AI assistance (Claude / Claude Code). The
scene components and motion in `src/` are original, deterministic re‑implementations, but the ideas,
template vocabulary, and design languages were learned and adapted from these sources — full credit to them:

- **[Remotion](https://remotion.dev)** — the React video‑rendering engine this whole project runs on.
  Note Remotion's own [license](https://remotion.dev/license) (free for individuals & small teams; larger
  companies need a paid licence).
- **ReactVideoEditor (RVE) — Remotion Templates** · <https://github.com/reactvideoeditor/remotion-templates>
  (demos: <https://www.reactvideoeditor.com/remotion-templates>). RVE's collection of 81 free Remotion
  templates is where this project's animation/component vocabulary was learned and built on top of.
- **DesignPrompts** · <https://www.designprompts.dev/> — source of the 30 design‑language prompts in
  `design_variations_prompts/`, which the 30 design packs (`src/designs/`) and `design-*` skills are adapted from.
- **Icons & logos** — [Lucide](https://lucide.dev) (ISC) for glyphs and [Simple Icons](https://simpleicons.org)
  (CC0) for brand logos, rendered via `src/AssetIcon.tsx`. Brand logos are used nominatively; see
  `.claude/skills/tech-video-director/references/asset_rules.md`.
- **AI assistance** — scaffolding, components, and docs were developed with Claude / Claude Code.

Trademarks and brand logos belong to their respective owners. If you redistribute this repository, keep this
section and honour each upstream project's licence.

## Licence

This project's own source is **[MIT](LICENSE)** — use it, fork it, ship things with it.

One thing to check before you do that commercially: **Remotion, the engine that does the rendering, is
not MIT.** It is free for individuals and small teams, but companies above a certain size need a paid
licence — read <https://remotion.dev/license>. The MIT licence here covers this repository's code and
cannot relicense Remotion, so that obligation is yours, not this project's.

Bundled glyphs are [Lucide](https://lucide.dev) (ISC) and brand logos are [Simple Icons](https://simpleicons.org)
(CC0), used nominatively. `public/assets/` also contains reference images fetched during authoring, each with
its provenance recorded in `public/assets/SOURCES.json` — check that file before reusing one.

**[`NOTICE.md`](NOTICE.md) has the full third-party picture** — read it before shipping anything commercial.

Drop your own logo in as `public/assets/channel_logo.png` and every spec's `brand.logo` picks it up.
