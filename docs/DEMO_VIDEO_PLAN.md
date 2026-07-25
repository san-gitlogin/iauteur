# DEMO VIDEO PLAN — "iAuteur explaining itself"

The video that markets iAuteur, **made by iAuteur**, for the README embed and a LinkedIn post.
Every scene is a component built for this video. The whole job is dogfooded **through the console**
(`python webui/app.py`) — Component Lab for the builds, the 5-step flow for the spec, console render —
because "you can do this in the product" is the claim being made.

> **RESUME BLOCK.** This file is the source of truth for this job and survives context loss.
> On pickup: (1) `npm run gate` must exit 0, (2) read LOCKED DECISIONS below — they were settled in
> the LAW 0 interview and must not be re-litigated, (3) find the first unchecked box in PROGRESS,
> (4) work ONE phase, audit it against real artifacts per CLAUDE.md LAW 10, tick the box, commit,
> then continue. Never tick a box you have not verified by looking at the actual output.

---

## LOCKED DECISIONS (settled — do not re-ask)

| | Decision |
|---|---|
| **Topic** | iAuteur explaining itself — the tool documents itself |
| **Beats** | **10** = `HOOK` + **8 new components** + `OUTRO_CTA` (see the structural note below) |
| **Components** | **All 8 middle beats are newly built.** Owner reaffirmed this after being shown the cost |
| **Format** | both — `long.json` 16:9 ~90s (README) + `shorts.json` 9:16 ~60s (LinkedIn) |
| **Design pack** | `moderndark` — the standing default; vary background + scene mix, not the pack |
| **Voiceover** | yes — `en-US-ChristopherNeural` (drives word-anchored timing) |
| **Watermark** | **iAuteur's own logo, NOT the channel logo.** Copy `brand/iauteur-icon-512.png` → `public/assets/iauteur_logo.png`, set `brand.logo: "img:iauteur_logo.png"`. No render-code change needed |
| **Slug** | `iauteur-explains-itself` |

### Structural note — why 10 beats and not 8

`scripts/validate-beats.mjs` **errors** (does not warn) if beat 1 is not `HOOK` (line 30) or the last
beat is not `OUTRO_CTA`/`RECAP` (line 32). Those two slots cannot be new components. The `explainer`
screenplay allows 7–10 beats, so 10 beats yields exactly **8 new components in slots 2–9** while
passing the gate. Do not "fix" this by editing the validator — CLAUDE.md LAW 5: fix specs, never rules.

### Budget arithmetic (why ~20 words per beat)

90s × 30fps = 2700 frames. Duration is `max(60, words×FPW+30)` with `FPW=12`, so
`(2700 − 10×30) / 12 ≈ 200 words` across 10 beats ≈ **20 words per beat** — exactly
`sentenceMaxWords`. HOOK is capped at 17 words / 240 frames. Meters turn red past this; treat red as
rejection.

---

## THE 8 NEW COMPONENTS

Each earns its slot by demonstrating one specific claim, and each must be **visually distinct** from
the existing type listed as its near-miss — a rename of something that already exists is a defect.

| # | Beat | TYPE | dataKey | Demonstrates | Must NOT look like |
|---|---|---|---|---|---|
| 1 | s02 | `SPEC_TO_FRAME` | `specToFrame` | The thesis: JSON resolves into a rendered frame | `SPEC_COMPARE` (a diff), `WINDOW_FRAME` |
| 2 | s03 | `CAST_BOARD` | `castBoard` | A component is chosen per beat, with a stated reason | any plain row-list |
| 3 | s04 | `LAB_ASSEMBLY` | `labAssembly` | The Component Lab: contract → code → wired → tsc ✓ | `CODE_EDITOR`, `CODE_DIFF` |
| 4 | s05 | `BUDGET_METER_ROW` | `budgetMeter` | The linter counts words and refuses an overfull scene | `COST_METER`, `CONTEXT_METER` |
| 5 | s06 | `WORD_ANCHOR_RAIL` | `anchorRail` | Payoffs land on the spoken word | any generic timeline |
| 6 | s07 | `RESKIN_CAROUSEL` | `reskin` | One scene, many design packs | `CAROUSEL` (generic slides) |
| 7 | s08 | `ASPECT_TWIN` | `aspectTwin` | One spec → 16:9 and 9:16, dark and light | `DEVICE_FRAME` |
| 8 | s09 | `PIPELINE_GATE` | `pipelineGate` | The linter is the judge; a reject bounces back | `PIPELINE`, `PIPELINE_GANTT`, `CONFIDENCE_GATE` |

**Adjacency is a hard gate.** No two adjacent beats may share a CONSOLIDATED family:
`PIPELINE · gauge-surface · code-surface · stream-surface · framed-surface · node-graph ·
zone-surface · row-list`. Assign each new component's `category`/`family` with this in mind and prove
it with `node scripts/validate-beats.mjs <beats.json>` before writing any scene.

**Every build follows** `.claude/skills/tech-video-director/references/component_authoring.md` — six
wiring files, theme tokens only (never hardcode colour/font/radius/px, so all 30 packs reskin it),
BASE ≤38 frames, both-aspect render proofs, `tsc` gate, entry in `src/showcaseSpec.ts`. Assemble
rolls back automatically if it does not compile.

---

## PROGRESS

Tick only after inspecting the real artifact. One phase at a time (LAW 10).

### Phase 0 · groundwork
- [x] `npm run gate` exits 0 and `npm run typecheck` is clean — baseline confirmed before touching anything
- [x] `public/assets/iauteur_logo.png` exists (copied from `brand/iauteur-icon-512.png`), provenance in `public/assets/SOURCES.json`
- [x] `npm run new-topic -- iauteur-explains-itself "iAuteur — explaining itself"` scaffolded
- [x] Beat sheet written — 10 beats, all within budget, **72.4s** total runtime (`out/tmp/flow/iauteur-explains-itself-beats.json`)
- [ ] `validate-beats.mjs` passes — **DEFERRED TO PHASE 9 BY NECESSITY.** The validator rejects any
      type absent from the manifest, so it cannot pass until all 8 components are built. Structural
      rules were verified by hand instead: HOOK first, OUTRO_CTA last, 10 beats inside the explainer
      7–10 range, every beat within its word budget.
- [x] Adjacency risk cleared: `linterFamilyOf = FAMILY[t] || t`, and `assemble` never writes to
      `FAMILY`, so each new type is its own family and the CONSOLIDATED hard gate cannot trip
- [ ] Casting note recorded in `topics/iauteur-explains-itself/casting.md` — one stated reason per beat

### Phase 1–8 · build the 8 components (one per phase, in table order)
For each of `SPEC_TO_FRAME`, `CAST_BOARD`, `LAB_ASSEMBLY`, `BUDGET_METER_ROW`, `WORD_ANCHOR_RAIL`,
`RESKIN_CAROUSEL`, `ASPECT_TWIN`, `PIPELINE_GATE`:

- [x] 1 · `SPEC_TO_FRAME` — assembled via the console backend · proofs viewed in moderndark wide+vertical and neobrutalism wide · MIN/MAX/MIX stress · `tsc` clean · gate 10/10 · budgets enforced in `lint-spec.mjs`
- [ ] 2 · `CAST_BOARD`
- [ ] 3 · `LAB_ASSEMBLY`
- [ ] 4 · `BUDGET_METER_ROW`
- [ ] 5 · `WORD_ANCHOR_RAIL`
- [ ] 6 · `RESKIN_CAROUSEL`
- [ ] 7 · `ASPECT_TWIN`
- [ ] 8 · `PIPELINE_GATE`

Per-component audit, every time: assemble reports ok · `npm run typecheck` clean · `npm run gate`
still 0 · a proof still viewed in **both** aspects · looks right in `moderndark` **and** one other
pack (proves tokens, not hardcoding) · appears in `src/showcaseSpec.ts`.

### Phase 9 · author the spec
- [ ] Scenes written for all 10 beats via the console's authoring flow (prompts pasted, as a user would)
- [ ] `brand.logo: "img:iauteur_logo.png"` present · `brand.design: "moderndark"`
- [ ] `npm run lint` passes for both `long.json` and `shorts.json`
- [ ] No anchor in the last 15% of any scene (linter warns — treat as rejection)

### Phase 10 · voice + render
- [ ] Voiceover generated (`en-US-ChristopherNeural`) and `sync.mjs` re-timed the spec to real audio
- [ ] Per-beat voiced preview checked for all 10 beats in the console before full render
- [ ] `wide-dark` rendered and **watched end to end**
- [ ] `short-dark` rendered and watched
- [ ] `thumb` + `cover` rendered; thumbnail uses real art, not a bare lucide glyph (LAW 0b)

### Phase 11 · ship
- [ ] Video embedded at the top of `README.md`, replacing the banner-only opener
- [ ] `docs/STATE.md` updated: demo video done, 8 new components → component count is now **148**
- [ ] Counts refreshed everywhere (README badge + body); verify with the manifest, never by hand
- [ ] Committed and pushed to `main`

---

## OPEN QUESTION (does not block Phase 0–8)

**Channel references, before the repo goes public.** The owner will publish this repo and post the
video on LinkedIn, but does not want the YouTube channel connected to it. These tracked files name it
in plain text: `.claude/skills/tech-video-director/references/channel_profile.md`, `CLAUDE.md`,
`public/assets/channel_logo.png`, `scripts/gen-upload-kit.mjs`, `briefs/fable-brief.md` and 4 example
JSONs. `topics/*` is gitignored, so no actual video content is exposed. Decide before flipping
visibility; the demo video itself is already unaffected because it uses the iAuteur logo.

## RISK ACCEPTED

Eight brand-new, never-battle-tested components in the video that represents the project publicly is
the highest-risk configuration available. It was recommended to build 3 and cast 5 from never-used
existing components; the owner chose all-new after seeing that trade-off, which is recorded here so
the decision is not silently revisited. Mitigation: build them **one at a time**, each fully audited
and committed before the next, so a bad component is caught in isolation rather than at render time.
