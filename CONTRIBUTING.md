# Contributing to iAuteur

Welcome. This project is one person's evenings-and-weekends work, made open so other people can
build on it. Contributions of every size are wanted — a typo fix, a bug report with a screenshot, a
whole new scene component. **You do not need permission to start.**

Read this page once and you will know how the repo thinks, what will get a pull request merged, and
what will get it sent back.

---

## The one idea you need

**The JSON is the movie.**

A video is a spec file — `topics/<slug>/long.json` — listing scenes. Each scene names a **component**
(`TIMELINE`, `CHAT_TRIO`, `DONUT_BREAKDOWN`…), some data, and a line of narration.
[Remotion](https://remotion.dev) renders that spec to MP4.

Everything follows from that:

- Components never hardcode a colour or a font. They read **theme tokens**, so one spec renders
  natively in 30 design packs and 42 themes, in dark and light, at 16:9 and 9:16 — with no
  per-design branches.
- Animation is anchored to **individual words** of the narration, so a reveal lands on the word that
  names it.
- A **linter** counts every text field against that component's character budget and refuses to
  render a scene that would overflow.

If you keep those three in mind, the strict rules further down will read as obvious rather than
arbitrary.

---

## Ways to contribute

| | What | Needs code? |
|---|---|---|
| **Make a video with it** | Then tell us what was confusing. This is genuinely the most useful early contribution — the docs are written by someone who already knows the answers. | No |
| **Report a scene that looks wrong** | Overlapping text, a clipped label, something invisible on a light theme. **Attach the still and say which design pack and aspect.** See [reporting a visual bug](#reporting-a-visual-bug). | No |
| **Improve the docs** | If a step didn't work for you, that is a bug in the docs. Fix it. | No |
| **Fix a component's layout** | The most valuable code contribution. A component that breaks on long content, on `neobrutalism`, or in vertical. | Yes |
| **Add a new scene component** | The flagship contribution. There are 162; the library is nowhere near done. See [adding a component](#adding-a-scene-component). | Yes |
| **Add a design pack** | A whole visual language (layout, shapes, motion) that every component inherits. Ambitious and very welcome. | Yes |
| **Improve the console or the scripts** | The Flask console (`webui/`), the linter, the AI adapter, the render pipeline. | Yes |

**Do crazy stuff.** Fork it, wire it to a different renderer, drive it from a Discord bot, generate
specs from an RSS feed. You do not need to ask, and it does not need to come back here.

---

## Setup (about 15 minutes)

You need **Node 18+** and **Python 3** ([nodejs.org](https://nodejs.org),
[python.org](https://www.python.org/downloads/) — on Windows tick *"Add Python to PATH"*).

```bash
git clone https://github.com/san-gitlogin/iauteur.git
cd iauteur
npm install
pip install -r webui/requirements.txt
```

Then prove the repo is healthy **before you change anything**, so you can tell your breakage from
pre-existing breakage:

```bash
npm run gate        # 10 seals; must exit 0
npm run typecheck   # tsc --noEmit
```

Two useful extras:

```bash
npm run dev                        # Remotion Studio — every scene, live, hot-reloading
python webui/app.py                # the console at http://127.0.0.1:5000
python scripts/test-webui-http.py  # Flask endpoint checks
```

> **On Windows PowerShell**, `npm`/`npx` are sometimes blocked by execution policy. Call node
> directly: `node scripts/lint-all.mjs`, or `node node_modules/@remotion/cli/remotion-cli.js studio`.
> Also prefix Python with `PYTHONIOENCODING=utf-8` or the seals crash on `→` in cp1252.

`npm run lint` currently reports a few **pre-existing** rejections in old topics under `topics/`.
Those are local content, not repo code, and are not your problem — just don't add new ones.

---

## The rules that decide whether a PR is merged

These are not style preferences. Each one exists because breaking it produced a visible defect in a
real video.

**1. Theme tokens only — never a hardcoded visual constant.**
```tsx
const t = useTheme();
t.colors.bg | panel | panelBorder | text | muted | onAccent
t.colors.accent | accent2 | accent3
t.colors.sem.{blue|green|red|orange|purple|yellow}   // semantic: carry MEANING
t.fonts.display | body | mono | accent               // never 'Arial', never 'sans-serif'
t.style.cornerRadius   // 0 on neobrutalism → multiply every radius by it
t.style.glow           // 0 on flat themes → gate every shadow on it
```
A literal `#3b82f6`, `'Inter'`, or `borderRadius: 12` is a defect: it will look wrong in at least one
of the 42 themes.

**2. Every pixel is `× scale`.**
`const {scale, vertical} = useScale();` — a raw pixel literal on any size, gap or offset is a defect,
because it won't hold at a different resolution.

**3. Both aspect ratios are first-class.**
Decide the wide layout (usually a row) and the vertical layout (usually a column) up front and branch
on `vertical`. **A component proven in only one aspect is not finished.** Most defects in this repo's
history were invisible in wide and obvious in vertical.

**4. Text is guarded three times.** Budget (a character limit in the linter), Fit (measure and shrink),
Wrap (a fallback that can't overflow). `whiteSpace: 'nowrap'` is banned unless paired with a
`maxWidth`.

**5. Motion is deterministic.** Pure functions of `useCurrentFrame()`. Every `interpolate` clamps both
ends: `{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}`. No unseeded `Math.random()` — use a
`Math.sin(i * 12.9898)` hash for stable "random-looking" values. No CSS `@keyframes` or transitions;
Remotion renders frame by frame and they will not appear.

**6. The base visual is on screen within 38 frames.** Whatever the narration is describing — the
diagram, the board, the stack — must be visible in ~1.3s. A scene-level `atWord` anchor may time an
*emphasis* payoff (a highlight, a verdict) but never the whole render tree:
```tsx
const start = Math.min(wordToFrame(d.atWord ?? 1), 38);  // the base
const payoff = wordToFrame(d.atWord ?? 1);               // the emphasis only
```
Per-item anchors — rows popping in at their own naming words — are the *good* pattern and stay
unclamped.

**7. Budgets are law. Fix the spec, never the linter.** If text doesn't fit, shorten the idea or widen
the component. Never raise the budget to silence the error, and never shrink the font to fit.

**8. Never hand-edit a generated file.** These are derived, and the gate will catch you:

| File | Regenerate with |
|---|---|
| `src/topicsIndex.ts` | `npm run gen-index` |
| `src/sceneTypes.generated.ts` | `npm run types` |
| `specs/video.schema.json` | `npm run schema` |

`scripts/lib/manifest.mjs` is the **single source of truth** for every component's data contract. If
the manifest and a type disagree, the manifest wins and the gate will say so.

---

## Adding a scene component

The high-value contribution. Two routes.

### Route A — let the tool wire it (recommended)

`scripts/component-flow.mjs` is the orchestrator behind the console's Component Lab. It writes and
wires the component, runs `tsc` and the gate, and **rolls everything back atomically if a gate
fails** — so a failed attempt leaves no mess.

```bash
node scripts/component-flow.mjs stage1   <cfg.json>                  # design the data contract
node scripts/component-flow.mjs validate <cfg.json> <config.json>    # check what came back
node scripts/component-flow.mjs stage2   <cfg.json> <config.json>    # write the component
node scripts/component-flow.mjs assemble <cfg.json> <config.json> <Component.tsx>
node scripts/component-flow.mjs proof    <cfg.json> <config.json>    # render stills
node scripts/component-flow.mjs remove   <TYPE>                      # clean reverse-wiring
```

One caveat learned the hard way: `remove` unwires the seven generated touchpoints but **does not**
remove a hand-written validation block from `scripts/lint-spec.mjs`. Delete that yourself and grep for
residue.

### Route B — by hand, eight touchpoints

`component-flow.mjs assemble` wires all of these for you, which is why Route A is recommended. If you
do it by hand, this is the full list:

| | File | What to add |
|---|---|---|
| 1 | `scripts/lib/constants.mjs` | your `'TYPE_KEY'` in the `TYPES` array — without it the linter rejects the type |
| 2 | `scripts/lib/manifest.mjs` | the data contract and a **valid `example`**. This is the single source of truth; the `check-manifest` gate fails if a type here disagrees with `types.ts` |
| 3 | `src/types.ts` | the `<Name>Data` interface, plus one optional field on `SceneData` |
| 4 | `src/scenes/<Name>.tsx` | the component. `React.FC<{scene: Scene}>`, read `scene.data.<field>`, guard `if (!d) return <AbsoluteFill />;` |
| 5 | `src/MainComposition.tsx` | the import, and `TYPE_KEY: <Name>` in `registry` |
| 6 | `scripts/lint-spec.mjs` | a validation block with a **character budget for every text field, sized to the narrowest (vertical) container**; and add the key to `DYNAMIC` if it's animated |
| 7 | `.claude/skills/.../references/scene_library.md` | a row saying when a director should pick it |
| 8 | `src/showcaseSpec.ts` | an `x-<name>` demo scene, so it appears in every design composition |

Then regenerate the derived files — `npm run schema` and `npm run types` — and run `npm run gate`.

> Note: `component_authoring.md` describes this as a "six files" checklist and says `TYPES` lives in
> `lint-spec.mjs`. That moved to `scripts/lib/constants.mjs`, and `manifest.mjs` is now a required
> touchpoint. The table above is current.

Prefer the shared primitives from `src/ui.tsx` — `Headline`, `Panel`, `Pill`, `Kicker`,
`SourceFooter`, `AssetIcon`. They already delegate to the active design pack, which is how a
component inherits a pack's voice for free.

### Definition of done

A component that compiles is not finished. It is finished when you have **looked at it**:

- **Three content fixtures**: **MIN** (shortest legal content, optional fields omitted), **MAX**
  (every field at its budget ceiling, max items), **MIX** (mid-length, icons on some items only).
- **× both aspects × two opposite designs** — `material` (rounded, glowing) and `neobrutalism` (flat,
  sharp, light ink). Together those prove theme adaptation.
- **Sample each scene at its MIDPOINT**, not its boundary. Sampling on a boundary renders the *next*
  scene's first faded-in frame — that is the classic false "blank component" scare, and it has wasted
  hours.
- If a MAX fixture breaks the layout, **fix the component or tighten the budget — never the fixture.**
- `npm run typecheck` clean, `npm run gate` exit 0, then delete your throwaway specs and scripts.

The full law, with the lessons behind each rule, is in
[`.claude/skills/tech-video-director/references/component_authoring.md`](.claude/skills/tech-video-director/references/component_authoring.md).

> **`tsc` and the gate have never once caught a visual defect in this repo.** Every single one was
> found by rendering a still and looking at it. Please look.

---

## Reporting a visual bug

A good report here is specific in four ways. Without these, a scene bug is close to unreproducible:

1. **The still** — a screenshot or the rendered PNG.
2. **The component type** — e.g. `BEAT_BOARD`.
3. **The design pack and theme** — e.g. `neobrutalism`, light.
4. **The aspect** — wide (16:9) or vertical (9:16).

If you can, include the scene's JSON. A four-line spec that reproduces it is the best bug report
possible.

---

## Pull requests

- **Branch from `main`.** Small, focused PRs review faster than big ones.
- **Say what you looked at.** For a component or layout change, include a before/after still. This
  matters more than the diff.
- **Run these before pushing**: `npm run typecheck`, `npm run gate`, and `npm run lint` (no *new*
  rejections).
- **Commit messages**: a short imperative subject, then a body explaining *why* — the constraint you
  hit, the thing that surprised you. The history here is used as a source of truth by later
  contributors, human and AI, so a message that explains a decision is worth real time.
- Don't commit anything under `topics/` (gitignored — it's local video content), `out/`, or `.env`.

**Licensing:** contributions are accepted under the repository's [MIT licence](LICENSE). By opening a
PR you are agreeing your contribution ships under those terms.

**Assets:** only add an image you have the right to redistribute — your own capture, or CC0 /
public-domain. Never a watermarked image, another creator's frames or thumbnails, or a random image
off the web. Brand logos come from `si:<slug>` (Simple Icons, CC0) and are used nominatively to
identify the product being discussed. Record provenance in `public/assets/SOURCES.json`. See
[`NOTICE.md`](NOTICE.md).

---

## Security

Never commit an API key. Keys live only in `.env`, which is gitignored; `.env.example` is the tracked
template. If you leak one, rotate it immediately — the git history is public. See
[`SECURITY.md`](SECURITY.md).

---

## Where the deep docs are

The repo has a lot of documentation, and it is not all aimed at you. Here is what's what.

**Written for humans:**

| Doc | What it is |
|---|---|
| [`README.md`](README.md) | What the project is, and a click-by-click first video |
| **this file** | How to contribute |
| [`docs/STATE.md`](docs/STATE.md) | **Read this second.** Current state, recent work, and every gotcha that has already cost someone time |
| [`PROJECT_RULES.md`](PROJECT_RULES.md) | The studio's own rules, including a "where do I fix *what*" table |
| [`docs/ARCHITECTURE.html`](docs/ARCHITECTURE.html) | System map — open it in a browser |
| [`NOTICE.md`](NOTICE.md) | Third-party terms. **Remotion is not MIT** — read this before commercial use |

**Written for AI coding agents** (useful to read, but phrased as law because an agent needs it that
way):

| Doc | What it is |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | The laws an agent must follow. The fastest way to understand the repo's constraints |
| `.claude/skills/tech-video-director/` | The creative law: scene catalog, text budgets, casting, component authoring |
| `.claude/skills/iauteur-studio/` | The console's workflow, driven from a CLI instead of a browser |
| `.github/copilot-instructions.md` | Points Copilot at `CLAUDE.md` |

**Historical, may be stale:** `HANDOFF.md`, `PROGRAM_3_FINAL.md`, `ASSET_MATRIX.md`,
`MANIFEST_MATRIX.md`, `PROMPT_DRIFT_MATRIX.md`, `RENDER_PROOF.md`. These are records of past work.
When one disagrees with `docs/STATE.md`, **STATE.md is right.**

### Working with an AI agent

This repo was built with heavy AI assistance and is unusually good to work on with one. Point your
agent at `CLAUDE.md` and `docs/STATE.md` first — between them they replace most exploration. The
`.claude/skills/` directory gives an agent the whole authoring workflow, and
`scripts/component-flow.mjs` gives it a component-building path with automatic rollback.

You are equally welcome to ignore all of that and write TypeScript by hand.

---

## Getting help

Open an issue. A question is a valid issue — if something was unclear enough to ask about, the answer
belongs in the docs, and "I got stuck at step 3" is genuinely useful information.

Be kind to other contributors. That's the whole code of conduct.
