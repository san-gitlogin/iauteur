# DEMO VIDEO PLAN — v3 · "how easy this is"

The video that markets iAuteur, **made by iAuteur**, for the README embed, LinkedIn and YouTube.

> **RESUME BLOCK.** This file is the source of truth and survives context loss.
> On pickup: (1) `npm run gate` must exit 0, (2) read LOCKED DECISIONS — settled with the owner, do
> **not** re-litigate and do **not** re-ask, (3) find the first unchecked box in PROGRESS, (4) work
> ONE phase, audit it against real artifacts per CLAUDE.md LAW 10, tick the box, commit, continue.
> Never tick a box you have not verified by looking at the actual output.

---

## WHY THERE IS A v3 — THE ONE RULE THAT MATTERS

v2 shipped (98s, commit `7803f48`). The owner liked the film and the voiceover — and rejected the
**visual language**:

> "you see we have a box flowing from iAuteur to ChatGPT and back, what does it even describe… you
> are explaining neat, but the visual doesn't correlate or is not easy to grasp that fast."

### THE RULE: depict it LITERALLY, screen by screen. No abstract diagrams.

An arrow between two labelled boxes is a *description* of the flow. What the owner wants is the flow
itself: **a browser window with the real iAuteur UI in it, a title being typed, a Copy button being
clicked, three assistant windows with the prompt pasted into them, the answer coming back, the paste,
the preview, the review, the re-paste, a component being built, the voice being picked, the render
finishing.** One beat per real screen, each animated.

> "This level of granularity, with perfect components that matches the design and with proper clear
> smooth animations is what I wanted. That's how people understand."

Corollaries, all of them hard rules:

1. **Never demo the product's output with a component built for something else.** v2 showed the
   sample videos through `SCREENSHOT_CASCADE` (a screenshot stack). *"The clarity breaks over there,
   that is a clear no when we are showing a demo of what we get."* A video needs a **player**.
2. **Never call the vertical cut "a video for phones."** That output is **shorts content**, **shorts**
   or **reels** — the words creators actually use, and what attracts them. (The word "phone" is fine
   when it genuinely means the device; it is the OUTPUT that must never be named after hardware.)
3. **Zero developer jargon** on screen or in narration: JSON, spec, lint, budget, anchor, render,
   component, type-check, `.tsx`, file names, `tsc`.
4. **Narration alone is not the deliverable.** If the picture doesn't carry the same idea in the
   seconds it is on screen, the beat has failed regardless of how good the line is.

---

## LOCKED DECISIONS (settled — do not re-ask)

| | Decision |
|---|---|
| **Length** | **3–4 minutes.** Explicitly unconstrained: *"I don't care how long it goes"* — granularity wins |
| **Audience** | Anyone who needs videos — creators (shorts/reels), teachers, marketers, founders |
| **Depiction** | **Literal screens, never abstract diagrams** (see THE RULE above) |
| **Beats** | **12** — the most `deep-dive` allows (9–12) with no scene-count warning; each beat runs longer |
| **New components** | **5** (see the table). Existing ones are reused only where they already draw a real screen |
| **Voice** | `en-US-AvaMultilingualNeural` (project-wide default) |
| **Design pack** | `moderndark` · light twin `daylight` · watermark `img:iauteur_logo.png` |
| **Slug** | **`iauteur-how-easy`** (v2 is rendered, and topics are immutable once rendered) |

---

## THE FIVE NEW COMPONENTS

Every one of these draws a **real screen**, not a metaphor for one.

| # | TYPE | dataKey | Draws | Must NOT look like |
|---|---|---|---|---|
| 1 | `APP_WINDOW` | `appWindow` | A real app window: traffic-light title bar, the 5-step rail down the left with one step active, and a content area of labelled fields — one of which types itself in, with a button that visibly clicks. Data-driven so it can be the intake screen, the paste-back screen or the voice screen | `TOPIC_INTAKE` (a bare field, no app around it), `CODE_EDITOR`, `DEVICE_FRAME` |
| 2 | `PROMPT_HANDOUT` | `promptHandout` | The prompt the console hands you, as a real block of text with a **Copy** button that clicks and confirms | `CODE_WINDOW`, `PROMPT_HANDOFF` (the v2 abstract loop — this replaces it) |
| 3 | `CHAT_TRIO` | `chatTrio` | Three assistant windows side by side. The prompt pastes into each, a thinking pulse runs, an answer block comes back | `CHAT_MOCKUP` (one conversation), `LOGO_WALL` (just brands) |
| 4 | `VIDEO_PLAYER` | `videoPlayer` | A real player: chrome, play control, a scrubber that actually advances, a running time, the clip inside. **This is how output is shown, always** | `SCREENSHOT_CASCADE`, `DEVICE_FRAME`, `VIDEO_HERO` (full-bleed, no player) |
| 5 | `SCENE_FORGE` | `sceneForge` | A component being made **for one specific scene** — described, drawn, wired, then rendering live in the row it belongs to. Shows that each scene can get its own unique piece | `LAB_ASSEMBLY` (a generic build rail with no scene attached) |

`PROMPT_HANDOFF` (v2) stays in the library but is **not used again in the demo** — it is the exact
component the owner called out.

---

## THE 12 BEATS — one real screen each

| # | TYPE | The screen | Notes |
|---|---|---|---|
| s01 | `HOOK` | the human problem | — |
| s02 | `APP_WINDOW` ★new | **Step 1.** The console, Topic screen. The title types itself in, then the description | never show a filename |
| s03 | `PROMPT_HANDOUT` ★new | **Step 2.** The question it wrote for you, and the Copy button clicking | say "the question" |
| s04 | `CHAT_TRIO` ★new | Paste it into ChatGPT, Claude or Gemini — whichever you already pay for. The answer comes back | say "the answer" |
| s05 | `APP_WINDOW` ★new | Back in the console: paste the answer in, the scenes appear | — |
| s06 | `CHECK_SWEEP` | It reviews every line and rewrites what doesn't fit — and that is why you sometimes paste once more | existing; already a literal screen |
| s07 | `VIDEO_PLAYER` ★new | Preview any single scene right there, before rendering anything | — |
| s08 | `SCENE_FORGE` ★new | Nothing fits this scene? One gets made **for that scene** — every scene can have its own | — |
| s09 | `APP_WINDOW` ★new | Pick the voice, hear it | — |
| s10 | `ASPECT_TWIN` | Render → widescreen and vertical, dark and light. **Shorts and reels from the same idea** | existing; captions say "shorts" / "reels", never "for phones" |
| s11 | `VIDEO_PLAYER` ★new | The real videos, playing in a real player | the samples, done properly this time |
| s12 | `OUTRO_CTA` | The reveal, spoken | — |

**Adjacency + reuse are already checked:** `APP_WINDOW` runs at s02/s05/s09 (3 uses, cap is 5 for 12
beats, none adjacent); `VIDEO_PLAYER` at s07/s11 (not adjacent). Every new type is its own
CONSOLIDATED family (`FAMILY[t] || t`), so nothing can trip the hard gate.

**Length.** Ava reads ~3 words/sec. 3.5 minutes ≈ 210s ≈ **630 words over 12 beats ≈ 50 words per
beat** — roughly three spoken sentences each, every sentence ≤20 words. That is far more room than v2
had, and it is what buys the granularity.

---

## DOES THIS FLOW BACK INTO THE PRODUCT?

The owner's question: *"I hope however you did this, is all part of the prompts/system prompts that we
have in iAuteur that flows through AI so that we get the right output every time."*

Honest answer: **partly, and the gap is being closed.** Already enforced for every video by machine —
the component contracts and per-field budgets (`manifest.mjs` → `gen-prompt.mjs` → `lint-spec.mjs`),
the casting protocol, payoff-early timing, the ≥5-transition rule. What was **not** encoded, and is
being added in Phase A, is the *direction*: audience-first language, no jargon, and depict literally
rather than diagrammatically.

---

## PROGRESS

Tick only after inspecting the real artifact. One phase at a time (LAW 10).

### Phase A · make the direction part of the product, not just this video
- [x] `gen-prompt.mjs`: a `DIRECTION` block (WHO IS WATCHING, AND WHAT THEY SEE) emitted in **stage1, stage2 and single-paste** — audience-first language, DEPICT-DON'T-DIAGRAM, the output-needs-its-own-shape corollary, and shorts/reels/devices over "phone". Verified by generating a prompt and reading it back
- [x] Director skill: **LAW OF DEPICTION** at the top of `scene_library.md`, with the v2 box-diagram written up as the worked counter-example and three tests to apply before casting a beat
- [x] `docs/STATE.md` records the rule under Gotchas, so Copilot/Cursor/a fresh clone picks it up too

### Phase B · build the 5 new components (one per phase, fully audited before the next)
- [ ] 1 · `APP_WINDOW` — assembled · budgets in `lint-spec.mjs` · MIN/MAX/MIX · both aspects · a second pack · `tsc` clean · gate 0
- [ ] 2 · `PROMPT_HANDOUT` — same audit
- [ ] 3 · `CHAT_TRIO` — same audit
- [ ] 4 · `VIDEO_PLAYER` — same audit
- [ ] 5 · `SCENE_FORGE` — same audit

### Phase C · author
- [ ] Beat sheet for `iauteur-how-easy`, validates clean
- [ ] All 12 scenes through the console API (validate → stage2 → assemble → intake)
- [ ] Grep the spec: zero jargon, and the vertical output is called **shorts/reels**, never "for phones"
- [ ] `npm run lint` passes with zero warnings, both formats

### Phase D · voice + render
- [ ] Voiceover (Ava) + `sync.mjs` re-time
- [ ] Stills reviewed for all 12 beats **after** the voiceover pass
- [ ] `wide-dark` + `short-dark` rendered and watched end to end
- [ ] `thumb` + `cover`

### Phase E · ship
- [ ] README embed swapped to v3; `docs/media/` refreshed
- [ ] `docs/STATE.md` + counts updated
- [ ] Committed and pushed to `main`

---

## PAID-FOR LESSONS (v1 + v2 — all of these cost real time)

- **An abstract beat the audience cannot decode is a failed beat.** The v2 `PROMPT_HANDOFF` loop was
  technically correct, well composed, and communicated nothing.
- **`tsc` and the gate never caught a single visual defect.** Every one was found by rendering a still
  and looking at it.
- **Proof before the voiceover pass is not proof.** `sync.mjs` rescales every `atWord` to a
  *fractional* value. A component using `atWord` as an integer position key silently breaks —
  `WORD_ANCHOR_RAIL` lost every mark and the pre-sync stills looked perfect.
- **Re-running `/api/intake` after `sync.mjs` reverts the spec to estimated timings.** Sync last, or
  sync again after saving.
- **`component-flow.mjs assemble` never writes text budgets** to `lint-spec.mjs` (only `DYNAMIC`).
  Hand-write a validation block per component, sized to the NARROW (vertical) container.
- **Its generated `<Name>Item` interface is fixed** (`label/text/title/sub/detail/color/asset/atWord`).
  Anything else per item moves to a top-level field.
- **The Fit guard truncates what the Budget guard allows.** Size cells from budget arithmetic, then
  render the MAX fixture and look.
- **A flex row aligned `flex-start` puts a connector on the row's top edge**, not the node centre line
  — offset by `(nodeD - thickness) / 2`.
- Editing `manifest.mjs` by hand desyncs `specs/video.schema.json` — `npm run schema && npm run types`.
- Chain commands with `&&`, never `;` — a v1 commit landed on a red gate that way.

## OPEN (does not block)

**Channel references before the repo goes public.** `channel_profile.md`, `CLAUDE.md`,
`public/assets/channel_logo.png`, `scripts/gen-upload-kit.mjs` and `briefs/` name YOUR CHANNEL in
plain text. `topics/*` is gitignored so no video content is exposed.
