# DEMO VIDEO PLAN — v2 · "iAuteur explaining itself"

The video that markets iAuteur, **made by iAuteur**, for the README embed and a LinkedIn post.

> **RESUME BLOCK.** This file is the source of truth and survives context loss.
> On pickup: (1) `npm run gate` must exit 0, (2) read LOCKED DECISIONS — settled with the owner, do
> not re-litigate, do not re-ask, (3) find the first unchecked box in PROGRESS, (4) work ONE phase,
> audit it against real artifacts per CLAUDE.md LAW 10, tick the box, commit, continue.
> Never tick a box you have not verified by looking at the actual output.

---

## WHY THERE IS A v2 (read this before writing a single line)

v1 shipped (67s, commit `7aa7e31`) and the owner rejected the **direction**, not the craft:

> "think of it like a 40-50 year old person sees the video, what the hell would he understand… you
> should have directed the video for general audiences… what will another third person understand
> just by seeing JSON, lint, etc… direct the video like an apple ad and not like a technical
> tutorial. This needs extreme rework!"

**What v1 got wrong.** It explained *how iAuteur works* to someone who already knows what a linter
is. Narration was clipped to fit budgets until it stopped being English. On-screen text said `tsc
clean`, `long.json`, `the linter`, `budgets`, `word anchors`.

**What v2 must be.** A product ad about *what you get*, for anyone who needs videos — creators,
teachers, marketers, founders. Emotional open, real proof, then the reveal. **The fact that it is
code-driven is a payoff, not the premise.**

### Hard rules for every line of v2

1. **Zero jargon.** Banned on screen and in narration: JSON, spec, lint/linter, budget, anchor,
   render, component, type-check, `.tsx`, file names, `tsc`. If a 50-year-old would not say it at
   dinner, it does not go in.
2. **Narration is spoken English**, not compressed telegram. Two natural sentences beat one clipped
   one. Read every line aloud before accepting it.
3. **Show the outcome before the mechanism.** Real videos on screen before any explanation of how.
4. **The reveal lands last** and is *spoken*, expressively: everything you just watched, this video
   included, was made this way.

---

## LOCKED DECISIONS (settled — do not re-ask)

| | Decision |
|---|---|
| **Length** | **~2 minutes** (owner's pick over 60s / 90s) |
| **Audience** | **Anyone who needs videos** — creators, teachers, marketers, founders. Not developers |
| **Proof footage** | **Real clips from already-rendered videos, made neutral.** Owner's pick over raw clips or mockups |
| **Beats** | **12** — the most `deep-dive` allows (9–12) without a scene-count warning |
| **New components** | **3**, depicting the REAL console flow (owner's explicit ask, see below) |
| **Voice** | **en-US-AvaMultilingualNeural** — now the project-wide default. Christopher "sounds like an AI" |
| **Design pack** | `moderndark` · light twin `daylight` |
| **Watermark** | iAuteur's own logo — `brand.logo: "img:iauteur_logo.png"` |

### The owner's ask for the three new components

> "I wanna show them how easy it is, maybe create new components that accurately depict what we have
> as flow in iAuteur. The title putting, content, then how we can ask any LLM anything, we get the
> response, we just paste it here and do some validations. Those steps must be clear with newly
> generated components, and animations."

So the middle of the video is the **actual three-step flow**, animated, in plain words:

| # | TYPE | dataKey | Shows | Must NOT look like |
|---|---|---|---|---|
| 1 | `TOPIC_INTAKE` | `topicIntake` | Step 1 — a title being **typed** into a real field, plus the two or three choices beside it | `CODE_EDITOR`, `CHAT_MOCKUP`, any generic form |
| 2 | `PROMPT_HANDOFF` | `promptHandoff` | Step 2 — copy the question → hand it to **any** AI you already use → the answer comes back and is pasted in. The round trip IS the content | `API_REQUEST_RESPONSE` (a wire protocol), `CHAT_MOCKUP` (a conversation) |
| 3 | `CHECK_SWEEP` | `checkSweep` | Step 3 — the checks run down the answer, tick by tick; one catches a problem and it is fixed, not shipped | `TEST_RUNNER` (a CI log), `PIPELINE_GATE` (already exists, single gate) |

`PROMPT_HANDOFF` carries the "**works with the AI you already pay for**" argument, which is one of
the strongest selling points and appears nowhere in v1.

---

## THE 12 BEATS

| # | TYPE | Beat does | Jargon risk to watch |
|---|---|---|---|
| s01 | `HOOK` | You have something worth explaining; making a video shouldn't cost you a week | — |
| s02 | `LIST_BUILD` | What it takes today: script, design every slide, record, edit, then do it again vertical | keep every item a plain verb phrase |
| s03 | `TITLE_CARD` | The name lands: **iAuteur** | — |
| s04 | `TOPIC_INTAKE` ★new | Step 1 — you type what it's about. That's the hard part done | never show a filename |
| s05 | `PROMPT_HANDOFF` ★new | Step 2 — hand the question to any AI you already use; paste the answer back | say "the answer", never "the JSON" |
| s06 | `CHECK_SWEEP` ★new | Step 3 — it checks the answer and fixes what's off before you ever see it | say "too crowded", never "over budget" |
| s07 | `VIDEO_HERO` | And out comes **this** — a real video, full bleed | — |
| s08 | `SCREENSHOT_CASCADE` | And these. Three real videos, three different subjects | — |
| s09 | `WORD_ANCHOR_RAIL` | Every picture appears exactly when you say the word | plain words in `words[]`, plain mark labels |
| s10 | `LAB_ASSEMBLY` | Need a picture that doesn't exist yet? It gets made for you | stages must be plain: designed / built / checked |
| s11 | `ASPECT_TWIN` | One description. Big screen, phone, dark, light. No extra work | captions in plain English |
| s12 | `OUTRO_CTA` | **The reveal**, spoken: everything you just watched — this video included | — |

Not in v2 (kept in the README, where the technical story belongs): `SPEC_TO_FRAME`, `CAST_BOARD`,
`BUDGET_METER_ROW`, `RESKIN_CAROUSEL`, `PIPELINE_GATE`. They are good components; they are not what
sells the product to this audience.

**Word budget.** 12 beats × ~20 words ≈ 3,400 frames ≈ 113s before TTS re-timing. HOOK caps at 17
words. Adjacency is safe: every new type is its own CONSOLIDATED family (`FAMILY[t] || t`).

**Slug.** v1 is rendered, and topics are IMMUTABLE once rendered (`/api/intake` returns 409). v2
goes to a fresh slug: **`iauteur-what-you-get`**.

---

## THE PROOF CLIPS (done)

`public/assets/video/sample_{market,product,tech}.mp4` — 5s each, 1280×720, silent.

Cut from already-rendered videos, then made neutral: those renders carry the **channel** watermark,
so the iAuteur logo is composited exactly over it at 76px, fully covering it. Nothing traces back to
the channel. Sources: `apple-overtakes-nvidia` @149s (green install-base grid),
`gpt-live-full-duplex-voice` @39s (speed-vs-depth scale), `kimi-k3-deep-dive` @179s (sparse-expert
grid). Originals untouched — `topics/*` is immutable once rendered.

---

## PROGRESS

Tick only after inspecting the real artifact. One phase at a time (LAW 10).

### Phase A · groundwork
- [x] Default voice switched to `en-US-AvaMultilingualNeural` across app.py, voiceover.py, app.js, CLAUDE.md, both skills
- [x] `LAB_ASSEMBLY` connector alignment fixed — legs sat on the row's top edge instead of the node centre line
- [x] All 8 v1 components confirmed wired: in the `MainComposition` registry, in `showcaseSpec.ts`, zero hardcoded colours (all 30 packs reskin them)
- [x] Three neutral proof clips cut and stamped
- [ ] Beat sheet written for slug `iauteur-what-you-get` and `validate-beats.mjs` passes

### Phase B · build the 3 new components (one per phase, fully audited before the next)
- [ ] 1 · `TOPIC_INTAKE` — assembled · budgets in `lint-spec.mjs` · MIN/MAX/MIX · both aspects viewed · a second pack viewed · `tsc` clean · gate 0
- [ ] 2 · `PROMPT_HANDOFF` — same audit
- [ ] 3 · `CHECK_SWEEP` — same audit

### Phase C · author
- [ ] All 12 scenes written through the console API (validate → stage2 → assemble → intake)
- [ ] **Read every narration line aloud.** Any line that isn't natural English gets rewritten
- [ ] Zero banned words on screen or in narration (grep the spec for: json, lint, budget, anchor, tsc, .tsx, spec)
- [ ] `npm run lint` passes with zero warnings for both formats

### Phase D · voice + render
- [ ] Voiceover with `en-US-AvaMultilingualNeural`, `sync.mjs` re-timed
- [ ] Stills reviewed for all 12 beats **after** the voiceover pass, not before (v1 lesson — see below)
- [ ] `wide-dark` rendered and watched end to end; `short-dark` too
- [ ] `thumb` + `cover` with real art

### Phase E · ship
- [ ] README embed replaced with v2; `docs/media/` refreshed
- [ ] `docs/STATE.md` updated
- [ ] Committed and pushed to `main`

---

## PAID-FOR LESSONS (v1 — all of these cost real time)

- **`tsc` and the gate never caught a single visual defect.** Every one was found by rendering a
  still and looking at it.
- **Proof before the voiceover pass is not proof.** `sync.mjs` rescales every `atWord` to a
  *fractional* value to re-time onto real audio. A component that uses `atWord` as an integer
  position key silently breaks — `WORD_ANCHOR_RAIL` lost every mark and the pre-sync stills looked
  perfect. Round for position, keep the raw value for timing.
- **`component-flow.mjs assemble` never writes text budgets** to `lint-spec.mjs` (only `DYNAMIC`).
  Hand-write a validation block per component, sized to the NARROW (vertical) container.
- **Its generated `<Name>Item` interface is fixed** (`label/text/title/sub/detail/color/asset/atWord`).
  Anything else per item moves to a top-level field — usually better design anyway.
- **The Fit guard truncates what the Budget guard allows.** Size cells from budget arithmetic, not
  by eye, then render the MAX fixture and look.
- **A flex row aligned `flex-start` puts a 4px connector on the row's top edge**, not on the node
  centre line — offset it by `(nodeD - thickness) / 2`. This shipped in v1's `LAB_ASSEMBLY`.
- Editing `manifest.mjs` by hand desyncs `specs/video.schema.json` — `npm run schema && npm run types`.
- Chain commands with `&&`, never `;` — a v1 commit landed on a red gate that way.

## OPEN (does not block)

**Channel references before the repo goes public.** `channel_profile.md`, `CLAUDE.md`,
`public/assets/channel_logo.png`, `scripts/gen-upload-kit.mjs` and `briefs/` name YOUR CHANNEL in
plain text. `topics/*` is gitignored so no video content is exposed. Decide before flipping visibility.
