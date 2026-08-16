# CLAUDE.md — read this FIRST; it replaces exploration

This repo is a video factory: JSON specs in `topics/<slug>/` → Remotion renders them. You (Claude) write specs and run scripts. You NEVER hand-edit component code during video production, never hand-write derived files, never overwrite an existing topic.

> **Then read [`docs/STATE.md`](docs/STATE.md).** This file is the LAWS (what you must always do);
> STATE.md is the CURRENT SITUATION (what exists today, where it lives, which gotchas have already
> cost time, and what's in flight). Update STATE.md in the same commit as the work it describes —
> that is what makes the next session, on any machine or tool, cheap. Copilot users:
> `.github/copilot-instructions.md` points here.

## LAW 0 — THE INTERVIEW GATE (recorded failure 2026-07-17: a session skipped this and self-picked everything)
When the user asks for a video — ANY phrasing — your FIRST action, before scaffolding, research, or writing a single scene, is ONE batched AskUserQuestion round covering everything their message didn't already answer:
1. **format** — long / shorts / both (default: both)
2. **target minutes** (default: 4–5 for long)
3. **design pack** (default: **moderndark** — the user's standing default; vary the background + scene mix between consecutive videos so they don't look identical)
4. **voiceover** — yes/no + voice (default: **en-US-AvaMultilingualNeural**, the user's confirmed favourite — it reads as a person, not a synthesiser)
5. **thumbnail art** — real brand logo via `si:` / user-supplied image / set-piece still (NEVER default to a generic lucide glyph)
Show the default on every option. "Use defaults" fills the rest — but the user must be ASKED, never silently defaulted. Skip only the questions their request already answered.

## STANDING DEFAULTS (the user's own — override only if they say so)
- Channel: whatever `references/channel_profile.md` says (unfilled default: **YOUR CHANNEL**) · logo:
  `public/assets/channel_logo.png` — ships as iAuteur's own mark; drop your own PNG in at that path to rebrand
  every video at once
- Design/theme when unspecified: **moderndark** · Voice: **en-US-AvaMultilingualNeural** (edge-tts)
- **`brand.logo: "img:channel_logo.png"` in EVERY spec** — it drives the in-video watermark (bottom-right wide / top-left vertical), the thumbnail + cover stamp, and the OUTRO_CTA subscribe circle. new-topic scaffolds it; never delete it.

## LAW 0c — COMPONENTS ARE CAST PER BEAT, NEVER ONE-SHOT
Scene types are chosen via the CASTING BOARD, one beat at a time — never in a single pass from memory (measured result of one-shot: 81 of 137 components never used, picks biased to the top of the catalog). Flow: beat map → `node scripts/cast.mjs <beats.json>` → pick per beat with a stated reason into `topics/<slug>/casting.md` (≥2 ★NEVER-USED picks when honest fits exist) → only then write scenes. `node scripts/snap.mjs <url> <file> "<note>"` captures reference-page screenshots so the media components are usable. For long videos, cast per chapter with a fresh subagent per act reporting to the master. Full recipe: director skill §4.

## LAW 0d — TEXT IS NOT A VISUAL; AN ANALOGY MUST BE DRAWN, NOT NAMED (2026-08-09)
Styled words + narration is the WEAKEST beat you can ship — it makes the viewer build the picture,
and they build it from their own life, not yours. Before casting any explanatory beat, answer three
questions: (1) **would it still teach with the sound off?** (2) **could a viewer elsewhere in the
world picture the wrong thing?** (3) **is anything moving, and is the motion the explanation?**
Recorded defect: a course built on *browser = theatre, page = stage, locator = spotlight* rendered
those as styled rows — but **"theatre" means a cinema hall in India and much of the world**, so the
analogy silently inverts and every later lesson inherits the error. Any analogy resting on a
cultural referent (theatre, baseball, diner, commute) must be DEPICTED — a live stage with curtains
and a spotlight travelling to an actor — never merely captioned. When existing components can only
render the idea as text, that is the trigger to BUILD one (LAW 6 + `component_authoring.md`), not to
settle. Prefer animated, theme-token'd, voice-synced components over any static card. Full rule +
the worked case: director skill `references/scene_library.md` → "A WORD ON SCREEN IS NOT A PICTURE".

## LAW 0e — TEACH, DON'T NARRATE (owner verdict on a shipped course, 2026-08-13)
For any TUTORIAL / course video, narrating *about* code is not teaching it. Measured failure across
7 shipped episodes: 24 code beats, **not one explained a line**; a 12-line block ran at **1.0s per
line**; output never sat beside the line that produced it; 46 sentences ran 22+ words in one breath;
and `words × 9.5 + 30` left exactly **1 second** of silence per scene, so nothing was ever left on
screen to look at. Binding rules:
1. **INVENT FIRST, CAST SECOND.** The casting board opens by DESCRIBING the ideal component for the
   beat, before looking at the library. Cast an existing type only if it matches ~90%; otherwise
   build it (LAW 6 + `component_authoring.md`). Reuse from the previous episode needs a written
   reason it is still the best shape — "it fits" is not one.
2. **Code the viewer is asked to read is taught LINE BY LINE** — `CODE_RUN` (each line its own
   anchor + a plain-English note + its result beside it), **≥4s per taught line**; the linter warns
   below that. `CODE_WINDOW` is only for a block nobody is being asked to read.
3. **Show the effect, not a description of it** — `BROWSER_STEP` (the page is built from the code
   and visibly moves per line), `OVERLAY_BLOCK` (a click intercepted, bouncing off the thing on top).
4. **Author silent look-at-it beats** (2-3s, no narration) when code or a picture lands. The
   pipeline never creates them.
5. **Write for the ear**: sentences ≤14 words (hard cap 18), everyday words, define a term the first
   time in its own sentence, say the key sentence twice, address the viewer ("look at line three").
6a. **RUNTIME HAS A FLOOR, NOT A CAP** (owner, 2026-08-16: *"the video length is becoming much
   smaller than before, which is the opposite of what I asked"*). Measured regression: Act I ran
   **5:02-6:06** (avg 5:20); EP08-11 fell to 4:50 → 3:52 → 3:16 → 3:16. Cause: the >=4s-per-line
   rule plus the scene ceiling capped taught lines per scene at ~4, and I held the SCENE COUNT
   constant instead of growing it — so total teaching shrank by 40%. **Budget SCENES, not words
   per scene.** A long cut lands **>=5:00**; check the builder's pre-sync estimate BEFORE voicing
   (sync lands within ~5% of it) and, if short, add the beats you were folding in — never padding.
   Every lesson has more teachable ideas than the cut is using; go back to the source and count.
6. **No runtime cap on a lesson**, and **no flat 16s cap on a beat** (amended 2026-08-15 —
   *"our hard limitation on the seconds per beat is affecting how well we explain concepts"*).
   The scene ceiling is now EARNED BY MOTION: a stepping scene gets 4s per anchored element up
   to 30s; a static card still gets 16s. See the STATIC-SCENE GUARD in `scripts/lint-spec.mjs`
   (mirrored by the settle `cap` in `sync.mjs`). Note `sync.mjs` never truncates below the real
   audio, so a long read always played in full — it was the WARNING that was capping the teaching.
7. **Judge twice before shipping**: as a school owner watching a teacher, and as an absolute
   beginner. If the beginner cannot follow, it is a DEFECT.
7b. **A SERIES TITLE FORMAT IS A CONTRACT.** Once a playlist establishes one, every later
   episode keeps it. Recorded break: EP01-08 shipped `Playwright Python Tutorial #N — <context>`
   and EP09-11 silently dropped the prefix, so the playlist stopped scanning as one course.
   `meta.seo.title` is authored per episode — check it against the previous episode's, not against
   what reads well alone. (Shorts keep their own convention: `<hook> #playwright #python`.)
8. **Concept beats get a PURPOSE-BUILT component — reuse is the defect** (owner, 2026-08-15:
   *"I am bored seeing all the same components again and again when you are explaining important
   concepts"*). Named offenders: `STICKY_NOTE` (27 uses), `REVEAL`, `SPLIT_PATHS`, `ICON_GRID` —
   the generic cards that got cast for the definition, the memory hook and the comparison in
   every single episode. Exempt: structural furniture (`HOOK`, `TITLE_CARD`, `CHAPTER`, `RECAP`,
   `OUTRO_CTA`, `QUIZ_CARD`) and `CODE_RUN`/`BROWSER_STEP`, which rule 2/3 mandate. Expect
   **2–4 new components per episode**, not zero. A card that only PRINTS the idea is not a
   visual — build the one that ENACTS it (RULE_TEST judges the rule; SAVED_SEARCH shows the
   un-run query; RESPONSIBILITY_SPLIT files the real lines).
Full case + the measurements: `docs/PLAYWRIGHT_DOJO_SERIES.md` §4c.

## LAW 0f — WRITE FOR A MOUTH, NOT A PAGE (owner verdict, 2026-08-16)
Owner: *"You often use IT, and you speak about something that's on the screen, but you forget
what the context is about, and you start speaking in a very AI manner. Humans are not adaptable
to that."* Measured across the shipped Playwright course: **0 contractions in 900+ words, every
episode**; "And" opening 11-15 sentences in a single script; sentence lengths clustered within
±3 words of the mean. That is a machine reading a manual, and no amount of good visuals rescues it.

A voiceover is SPOKEN. Before any spec goes to `voiceover.py`, the narration must pass as
something a person would actually say out loud:

1. **NAME THE SUBJECT.** Never "it does X" when the screen holds a page, a locator and a file —
   say *the locator*, *that zip*, *your test*, *Playwright*. The listener has no scrollback.
2. **CONTRACTIONS.** "you'll", "here's", "don't", "that's". edge-tts speaks them perfectly.
   Written-out forms are the single loudest tell.
3. **BURSTINESS — BUT WRITE SENTENCES.** Swing the LENGTH: a short sentence next to a 25-word run.
   *"That's it."* then a long winding clause. **This is not a licence to clip everything.**
   ⚠ **RECORDED BACKFIRE (2026-08-16):** this rule as originally written produced **45-57%
   fragments** across four episodes — *"Three tools today."* · *"Six seconds each."* · *"In the
   sidebar."* Owner: *"that's just a blunt sentence with no grammar."* A short sentence still has
   a subject and a verb. *"There are three tools I want to show you today"* is short AND a
   sentence; *"Three tools today"* is a caption someone read off a slide. **Cap fragments at
   ~1 in 5, and make every one of them deliberate.**
4. **VARY THE WAY IN — NOT THE SUBJECT'S NAME.** Not every sentence starts "And" / "So" / "The".
   Open on an adverb, a question, a dependent clause, a mid-thought observation.
   ⚠ **RECORDED BACKFIRE (2026-08-16):** read as "avoid repetition" generally, this rule made me
   duck the subject's own name — measured **~54 bare pronouns per episode against "Playwright"
   said 1-5 times in 880 words.** Owner: *"your usage of IT is hell of a lot. When you say IT,
   what is IT?"* **Repeating a subject noun is not repetition, it is clarity.** Say *Playwright*,
   *the locator*, *your test*, *that trace file* as often as the sentence needs. Vary the
   sentence OPENERS and the connective tissue; never vary away from naming the thing.
   And note the trap on the other side: *"the one you see"*, *"the thing that's highlighted"* are
   just as useless as "it" — vague pointing is not naming.
5. **ASIDES AND QUIRKS.** Em-dash asides, parentheticals, a rhetorical question, the occasional
   deliberate fragment. Small redundancies are human. *"Be honest — have you ever watched one?"*
6. **CONCRETE OVER GENERIC.** "three in the morning", "a hundred green tests", "one crime scene
   photo" — not "in certain situations" or "various artifacts".
7. **NEVER FORCE IT.** Sprinkled slang reads worse than plain prose. The test is simple: read the
   scene aloud. If you would not say the sentence to a colleague, rewrite it.
8. **TEACH — DO NOT NARRATE.** (owner, 2026-08-16: *"you are teaching, not just explaining
   concepts. Like a human, you are sharing your experience, in a beautiful way which hits harder
   to the listener. The scripts are just like narration and not like teaching."*) A narrator
   states what is true. A teacher makes you *feel why it matters* before handing you the
   mechanism, and stays with you through the part that trips people. Concretely:
   - **Motivation before mechanism.** Why you'd ever want this, then what it is. Not the reverse.
   - **Carry the reasoning in the sentence.** *because* · *which means* · *so* · *otherwise* ·
     *and that's why*. A list of true statements is not an explanation.
   - **Share the experience.** *"I've lost an afternoon to this."* *"The first time I saw this I
     didn't believe it."* Earned, specific, never invented for effect.
   - **Anticipate the confusion.** *"And if you're wondering why that underscore is there — and
     you should be —"*. Answering the question the learner already has is what teaching IS.
   - **Say the consequence.** What actually happens if they get it wrong, in their week.
   - **Land it.** End the beat on the sentence you'd want them to repeat to a colleague.

**This is enforced.** `scripts/lint-spec.mjs` runs a HUMAN-VOICE GUARD over the whole spec —
sentence-length standard deviation, pronoun-opener share, repeated openers, contraction rate — and
warns on each. Warnings are rejections. Check the narration BEFORE voicing; re-voicing costs a
full build → voiceover → sync loop.

**Note on LAW 0e rule 5:** the "<=14 words" cap was written to stop 22-word unbroken breath
chains. It caps a CLAUSE, not a sentence. A 25-word sentence with commas, an em-dash and a natural
breath point is good spoken English; a 15-word sentence with no pause is not.

## LAW 0g — THE FIRST THIRTY SECONDS ARE A CONTRACT (owner, 2026-08-16)
Owner, twice: *"In all videos, greeting is missing… saying welcome to <channel>, then asking some
questions and answering them with what we're gonna see today."* Then, sharpening it: *"you must
look at how latest videos start, how they introduce suspense, how they increase curiosity, how they
make sure the watcher relates to what they knew, or what they anticipated by clicking the video by
looking at the title or thumbnail. Introducing doesn't always mean 'Hi welcome to channel name' —
it must be absolutely different when and wherever possible."*

Both are right, and the second is the important one. **A greeting is not an intro. The intro is a
contract with a person who clicked something.** They arrived carrying an expectation set by your
title and thumbnail, and the opening either confirms that expectation or loses them. Nineteen
shipped episodes opened cold with no welcome AND no acknowledgement of why the viewer clicked.

### The three phases (this is the shape, every episode)

| Phase | Runs | Job |
|---|---|---|
| **1 · Confirm the click** | 0–5s | Continue the *exact* promise of the title and thumbnail, in the viewer's own words. They must know within a breath that they are in the right place. No welcome, no channel name, no logo — leading with branding is the single most-documented way to lose this window. |
| **2 · Promise the payoff** | 5–15s | The one concrete thing they get for staying. This is where the greeting lives, woven in — an aside, not an announcement. |
| **3 · Open the loop** | 15–30s | An information gap that only closes by watching: a question posed and deliberately not yet answered, a result shown before its method, a claim that sounds wrong. |

### The rules

1. **Echo the click promise in scene 1.** If the thumbnail says `NO BROWSER` and the title says
   *API testing with no browser*, the first sentence is about a test running with no browser. A
   viewer who cannot tell in five seconds that this is the video they clicked, leaves.
2. **Create curiosity, then SATISFY it.** That is the whole difference between a click promise and
   clickbait — both open a gap, only one closes it. Every loop opened in the first 30s must be
   paid off in the body, and the RECAP is where you prove you did.
3. **Relate to what they already know.** "You already know this one, actually" · "Remember the
   fresh context from episode eight?" · "You've hit this and you know you have." Anchoring the new
   thing to something they own is what makes a beginner feel capable instead of lost.
4. **The greeting is never a formula.** "Hi, welcome to <channel>" 22 times is a jingle, and a
   playlist binge makes it unbearable. Rotate the *form*, not just the words: a welcome; a
   mid-thought aside that happens to name the channel; a question thrown at the viewer; a
   confession; picking up a thread from last episode. **Some episodes should not greet at all** —
   if the cold open is strong and the loop is tight, forcing a welcome in damages it.
5. **Name the channel from `brand.channel`**, never a hardcoded string in shared code. The channel
   name is local content (see the brand-identity note under STANDING DEFAULTS).
6. **Never force enthusiasm.** "Let's gooo" reads worse than plain warmth. LAW 0f's test still
   governs: would you say this sentence out loud, to a colleague?

**Enforced.** `scripts/lint-spec.mjs` runs a GREETING GUARD on long specs: it REJECTS a welcome or
channel name in scene 1, warns when the opening never echoes the title/thumbnail promise, warns
when no question is posed in the opening beats (no loop opened), and warns on a second greeting.

## LAW 0h — THE BACKGROUND MUST NOT MOVE (owner, 2026-08-16)
Owner, on a pulsing ring shipped behind four episodes: *"I don't like the circular animation going
on in the background, it's very distracting."* It was added purely to satisfy a "shift the
background once per Act" plan — a plan is not a reason to put a large moving object behind the
thing the viewer is meant to read.

**Before choosing a background for any teaching video, ask whether it MOVES.** If it does, it is
competing with the lesson, and the answer is no. Ambient gradients and still grids are fine;
pulsing, sweeping, orbiting and drifting are not. Named offender: **`grid-pulse`**. Visual variety
between consecutive episodes comes from the scene mix and the purpose-built components — which is
where it actually lives — not from animating the wallpaper. `brand.background` is metadata: fixing
it is an edit to the spec plus a re-render, with no re-voice and no re-sync.

## LAW 0b — TOPIC ASSETS ARE FETCHED, NOT SKIPPED
When the topic names a company / product / person / place, gather its art DURING authoring — don't ship icon-only videos:
1. Brand logos: verify + use `si:<slug>` (`node -e "const si=require('simple-icons');console.log(Object.keys(si).filter(k=>/name/i.test(k)))"`).
2. No si: logo? Fetch an OFFICIAL press-kit / CC0 image: `node scripts/fetch-asset.mjs <url> <file> "<source note>"` → lands in `public/assets/` with provenance in SOURCES.json; reference it as `img:<file>`. Only sources you are CONFIDENT are licensed for reuse — when unsure, ask the user instead of fetching.
3. Nothing safe found? Declare it under `assetsNeeded` and tell the user exactly what to drop into `public/assets/` — a lucide glyph is the placeholder, never the plan.

## Map
- `topics/<slug>/long.json + shorts.json` — one folder per video topic, IMMUTABLE once rendered. Outputs land in `topics/<slug>/out/`.
- `src/scenes/` components · `src/themes.ts` (10 themes) · `src/ui.tsx` primitives · `src/topicsIndex.ts` AUTO-GENERATED (never edit).
- `.claude/skills/tech-video-director/` — the creative law (scene library, budgets, critic checklist, design contract). 30 `design-*` skills = convertible design languages.
- `.claude/skills/iauteur-studio/` — FULL PARITY with the `webui/` browser console, from Claude Code (no browser). When the user wants to make/configure/voice/render a video or "use the console", follow this skill: interview them with defaults they can override, then run the same scripts the UI runs. It also carries the build-vs-reuse decision rule + points to `component_authoring.md` for building a NEW component (a Claude-Code-only capability the browser can't do).
- `specs/gallery.json` — component showcase. `PROJECT_RULES.md` — system laws.

## Commands (use these; do not improvise)
- New topic: `npm run new-topic -- <slug> "Title"` (scaffolds folder + regenerates index; REFUSES existing slugs)
- Validate: `npm run lint` (all topics + gallery; NOTHING renders until it passes)
- Voiceover text: `npm run voiceover -- <slug>` (derived from spec — NEVER write these files yourself)
- TTS: `python scripts/voiceover.py topics/<slug>/long.json <slug>_long` then `node scripts/sync.mjs topics/<slug>/long.json out/tts/<slug>_long_timestamps.json <slug>_long`
- Preview: `npm run dev` (Studio shows `<slug>-wide-dark|wide-light|short-dark|short-light` + stills per topic)
- Proof stills: `node scripts/proof.mjs <slug>-wide-dark topics/<slug>/long.json`
- Package standalone: `npm run package -- <slug>` (self-contained dist/<slug>-video/ + zip: extract → npm install → npm run dev)
- Render: `npm run render -- <slug> wide-dark|wide-light|short-dark|short-light|thumb|cover` — video renders auto-generate `topics/<slug>/out/upload.md` (YouTube title + description, house pattern) via `scripts/gen-upload-kit.mjs`; author the creative fields as `meta.seo` in the spec (see director skill §8b). Chapters/timestamps/sources are machine-derived from the spec — never hand-written.

## Laws (violations = defects)
1. `brand.theme` is a DARK skin — the 7 core skins are studio|neonGrid|midnight|terminal|linear|vapor|luxe, and each of the 30 design packs also has a dark theme twin (38 dark themes total; authoritative list = `DARK_THEMES` in scripts/lint-spec.mjs). Light variants render automatically (`brand.themeLight`: daylight|paper|brutalist, default daylight). The linter enforces this.
2. THEME ROTATION: when the user picks no design, **moderndark is the standing default (LAW 0) and MAY repeat** — differentiate consecutive moderndark videos via background variant + screenplay + scene mix instead. When proposing a non-default design, list existing `topics/*/long.json` brand.theme values and avoid repeating the most recent. Same-looking consecutive videos are a defect.
3. TRUTH: facts come ONLY from the user's source or live web search. Today's date comes from your environment, never from training memory. Anything time-sensitive (prices, versions, releases, "current X") without a fresh source → search the web or output `MISSING: <fact>`. Inventing stats, quotes, or dates is the worst possible failure.
4. Stage gates survive interruptions: if the user asked for Stage 1 only, session limits or "continue" do NOT authorize later stages — re-confirm.
5. Budgets are counted, not estimated. The linter is the judge; fix specs, never rules.
6. DESIGN PACKS: real visual variety comes from packs (src/designs/<pack>/ — different layouts/shapes/motion), selected via brand.design; themes only reskin. Building a pack = a dedicated approved job from a design-* skill; NEVER during video production.
8. ANIMATION TIMING — PAYOFF EARLY, BASE EARLIER: name each scene's visual payoff in the first ~70% of its narration (anchored elements animate AT the naming word and need settle time; linter warns on last-15% anchors — treat as rejection). scripts/sync.mjs guarantees a settle tail after the last anchor; never hand-trim scene tails to "tighten" pacing. Components enforce BASE ≤38 FRAMES: a scene-level anchor times only the emphasis payoff, never the whole visual (see component_authoring.md §2) — the base diagram is on screen within ~1.3s regardless of where the anchor lands.
9. Component/theme changes follow the skill's design_contract.md (Three Guards, ×scale, both-aspect proofs) and require explicit user approval. Building or fixing a scene component is a defined job: follow `.claude/skills/tech-video-director/references/component_authoring.md` (the six wiring files, theme-token adaptation across all 30 designs, the render-proof loop, and the paid-for lessons). Never hardcode colours/fonts/radii/px — read theme tokens so every one of the 30 designs reskins the component automatically; add each new component to `src/showcaseSpec.ts` so it appears in every design composition for review.
10. PHASE-GATED DELIVERY (user standing rule, 2026-07-24): for any multi-phase feature, work ONE phase at a time. After completing each phase you MUST (a) inspect the actual on-disk result, (b) run an audit — tests/gates/tsc/lint as applicable — against the real artifacts (never assume), (c) fix everything the audit surfaces, and only THEN (d) proceed to the next phase. Re-read the original requirement + the recorded plan before each phase so scope never drifts. Report the audit result per phase.
11. SECRETS: never print, echo, log, or commit API keys/tokens. Keys live only in a gitignored `.env` (`.env.example` is the tracked template). If a user pastes a live secret in chat, flag it and tell them to rotate it.
