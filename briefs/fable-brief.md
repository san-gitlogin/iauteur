# iAuteur — Expert Brief for Fable

> **What this is.** A complete, self-contained briefing so you (Fable) can improve
> the prompt/authoring system of a video factory called **iAuteur** WITHOUT reading
> the codebase. Everything below — the live system prompt, all 136 components, the
> data schema, the validation rules, the laws, and a real failure — is copied
> verbatim from the actual source files. Nothing here is invented.
>
> **The one question we most need you to answer:** how do we get *any* LLM — from a
> sub-1-million-parameter locally-hosted model, through 7B–70B open models, up to
> frontier APIs (Claude/GPT/Gemini) — to reliably emit a **valid, render-correct**
> iAuteur spec on the first try? Today even Gemini fails (see §9).

---

## 1 · What iAuteur is

iAuteur is a **Remotion** (React-in-video) factory: a single JSON file *is* the movie.
A "spec" describes a video as an ordered list of **scenes**; each scene names a
**component type** (one of **136** in the library), a spoken **narration** line, a
**duration**, a **transition**, a **background**, and a **data** object holding that
component's content. The renderer turns the JSON into an MP4 (landscape 1920×1080
"long" and vertical 1080×1920 "shorts"), in a chosen **design pack** (one of
30) and **theme** (38 dark + 4 light).

There is **no built-in LLM.** The creative step is done by the *user's own* LLM:
our console generates a big prompt, the user pastes it into their chat model with a
topic, the model returns spec JSON, and the user pastes it back. We then generate an
**Edge-TTS voiceover** with word-level timestamps that re-time every animation to the
spoken word, and render.

## 2 · The end goal

- **100% UI-driven** for a non-technical creator: no CLI, no hand-editing JSON, no
  prompt engineering. They pick a topic + look, copy a prompt, paste JSON back, click
  Voiceover, click Render.
- **Bring-your-own-LLM, any LLM.** It must work with whatever model the user has —
  **including tiny locally-hosted models (even <1M parameters)**, mid-size open models,
  and frontier APIs. This is the hard requirement we need your help on.
- **Rich, not boring.** Viewers tire of pure animation. We want to weave in **images,
  videos, and logos from _official_ sources** (press kits, brand assets, CC0/Wikimedia,
  simple-icons for logos) — legally and correctly, never invented.
- **Professional, trustworthy output** — factually grounded, on-brand, lint-clean.

## 3 · The pipeline today

1. **Configure** (console UI): topic, source text, format, screenplay preset, audience,
   design pack, theme, background, channel.
2. **Generate LLM prompt** → the console compiles the prompt in §4 and the user pastes
   it into their LLM.
3. **Paste JSON back** → the console validates it with the linter (§7) and saves it.
4. **Voiceover** → Edge-TTS makes per-scene audio + word timestamps; a sync step rewrites
   each scene's duration and every `atWord` anchor to the real audio (millisecond-exact),
   and sets `scene.audio`.
5. **Render** → Remotion bakes narration into the MP4.

## 4 · The CURRENT system prompt (verbatim — this is what we hand the LLM)

This is generated live from the component catalog + linter constants. It lists all
136 components but only gives each a one-line purpose — critically, **it does NOT teach
the per-component `data` field schema** (see §6). Judge it hard.

```text
You are the DIRECTOR + SCREENWRITER for **iAuteur**, a Remotion video factory.
Produce a single JSON video specification. Output **ONLY** the JSON (see OUTPUT
at the end). Do not add prose before or after the JSON code block(s).

## The brief
- **Topic:** How HTTPS keeps the web secure
- **Format:** both  (long = 1920×1080 landscape; shorts = 1080×1920 vertical)
- **Screenplay preset:** explainer
- **Audience:** general
- **Design pack:** corptrust  →  set brand.design="corptrust", brand.theme="corptrust"
- **Light twin:** brand.themeLight="daylight"
- **Channel name:** YOUR CHANNEL

## TRUTH — the most important rule
No source was provided. For an evergreen / conceptual topic ("how X works"),
definitional facts are fine. Do NOT invent time-sensitive numbers (prices, current
versions, "latest" anything); if the topic needs those, write `MISSING: <fact>` in
the narration and mark illustrative numbers with data.source="illustrative".

## The JSON schema
```jsonc
{
  "meta": {
    "topic": "<full descriptive topic>",
    "format": "long",   // "long" or "short" (per file)
    "fps": 30,
    "onePayoff": "<the ONE thing the viewer takes away>",
    "openLoop": "<the curiosity question the hook opens>",
    "analogy": "<the through-line analogy>",
    "screenplay": "explainer"
  },
  "brand": {
    "theme": "corptrust",          // DARK skin (light renders automatically)
    "design": "corptrust",         // the design pack
    "themeLight": "daylight",
    "channel": "YOUR CHANNEL"
  },
  "thumbnail": { "title": "<short punchy>", "badge": "<2-4 words>", "asset": "lucide:<icon>" },
  "scenes": [
    {
      "id": "s01",                 // s01, s02, … in order
      "type": "HOOK",              // scene 1 MUST be HOOK
      "narration": "<the exact spoken sentence — this becomes the voiceover>",
      "durationFrames": 210,       // ESTIMATE ≈ (words in narration × 12) + 30
      "timingSource": "estimated", // ALWAYS "estimated" — the app re-times from real TTS
      "background": "zoneA",       // zoneA | zoneB | zoneC (rotate for rhythm) or a named background
      "data": { /* type-specific — see components below; use atWord anchors */ }
    }
    // … more scenes … last scene MUST be OUTRO_CTA (or RECAP)
  ]
}
```

### Field rules
- **narration** is the spoken line. Keep it natural and paced; it drives the voiceover
  and the scene length. One clear idea per scene.
- **durationFrames**: estimate only. Rough guide ≈ (number of words × 12) + 30 at 30fps.
  The app regenerates real per-word timing from Edge-TTS afterwards, so approximate is fine.
- **timingSource** must be "estimated".
- **atWord** (inside data): the 1-based WORD INDEX within THIS scene's narration at which
  that element animates in. Count the words in the narration and point anchors at the moment
  the narrator says the relevant word. Every animated element (headline, node, bar, step…)
  takes an atWord so motion lands on the voice.
- **transition** (optional, from scene 2 on): one of `fade`, `slide`, `push`, `zoom`, `morph`, `wipe`, `iris`, `clock`, `dip`, `blinds`, `pixel`, `whippan`, `zoomthrough`, `letterbox`, `filmburn`, `glitch`.
- **background** per scene: zoneA/zoneB/zoneC (theme zones) or a named background: `aurora`, `grid`, `aurora-grid`, `plain`, `bokeh`, `starfield`, `grid-pulse`, `wave`, `ripple`, `gradient`, `geo`, `matrix-rain`, `noise`, `ember`.
- **anim** (where a component takes one): `fadeUp`, `rise`, `blur`, `pop`, `scale`, `bounce`, `bubble`, `spin`, `stack`, `slideLeft`, `slideRight`, `slideUp`, `slideDown`, `clip`, `wipe`.
- **semantic colors** (where a component takes a color): `blue`, `green`, `red`, `orange`, `purple`, `yellow`.
- **assets**: icons/logos only from these sources — `lucide:` (Lucide icon set); `si:` (simple-icons brand mark); `img:` (Local file in public/assets/). Never invent image files.

## HARD LAWS (the linter rejects violations)
1. Scene 1 is **HOOK**. The last scene is **OUTRO_CTA** (or RECAP).
2. **Anti-monotony:** never place two same-family components adjacent; across a video of
   N≥8 scenes use at least ~min(8, N/2) DISTINCT component types, and no single type more
   than ~35% of scenes. Reach broadly across the component palette below.
3. **Text budgets** (characters): hookHeadline ≤ 30 chars · headline ≤ 48 chars · pill ≤ 36 chars · badgeInCard ≤ 24 chars · kicker ≤ 18 chars · stepTitle ≤ 14 chars · stepSub ≤ 30 chars · message ≤ 64 chars · monoLine ≤ 34 chars · listItem ≤ 44 chars · recapPoint ≤ 46 chars · source ≤ 64 chars · quote ≤ 120 chars · coverTitle ≤ 26 chars · statValue ≤ 12 chars · panelTitle ≤ 44 chars.
4. **Deterministic only** — no reference to randomness; motion is frame-driven.
5. **Theme fits the topic** — pick a design whose mood matches the subject.

## COMPONENT PALETTE — every available scene `type` (choose the RIGHT one per beat)
Each entry: TYPE [category] — what it is. USE WHEN: when to reach for it.

- **HOOK** [structure] — First 8s. State the stake so the viewer cannot scroll. USE WHEN: Always scene 1. · assets: heroAsset
- **TITLE_CARD** [structure] — Name the topic for 2-3s after the hook. USE WHEN: Right after HOOK.
- **CONCEPT_DIAGRAM** [diagram] — How-it-works chain of 2-4 nodes + edges. USE WHEN: Explain a mechanism/flow. · assets: nodes[].asset
- **DIAGRAM** [diagram] — System-architect diagramming: flow / sequence / block / tree / hub. USE WHEN: sequence=protocols/handshakes; tree=hierarchy/cert-chain/DNS; block=architecture; hub=one-to-many; flow=pipeline. · assets: diagram.nodes[].asset
- **KINETIC_TEXT** [text] — A single line as a dynamic moment: 8 FX (typewriter/glitch/split/char-spin/highlight/bounce/wave/outline). USE WHEN: A punch, breather, statement, or intro title — anywhere static text would feel flat.
- **PHOTO** [media] — Full-bleed image with a deterministic Ken Burns move + caption. USE WHEN: Set a scene, show a real place/thing, or a breather with an image. · assets: photo.asset (required)
- **SOUND_WAVE** [media] — Animated audio waveform bars. USE WHEN: Audio / podcast / "listen" beats.
- **REVEAL** [structure] — Spotlight iris opens to reveal a statement (kicker + big line + sub). USE WHEN: A cinematic "here is the point" moment or act reveal.
- **LOGO_REVEAL** [structure] — Branded mark strokes on + icon + wordmark. USE WHEN: Intro sting or outro branding. · assets: logo.asset
- **CAROUSEL** [structure] — A 3D rotating ring of cards — "the toolkit / the ecosystem / the options". USE WHEN: Show a set of 3-6 related components with depth and motion. · assets: carousel.items[].asset
- **CREDITS_ROLL** [structure] — Movie-style scrolling role/name rows — a stylish sign-off. USE WHEN: Recap the cast of concepts, or a cinematic outro before the CTA.
- **SUBSCRIBE_REMINDER** [structure] — Compact mid-roll subscribe nudge — shaking bell + SUBSCRIBE button + one-line ask. USE WHEN: A light reminder partway through (NOT the branded end-card — that is CHANNEL_CARD).
- **LIST_BUILD** [list] — "N things this changes" — icon list, two-tier rows. USE WHEN: Enumerate 3-5 points. · assets: items[].icon
- **STAT_CALLOUT** [data] — ONE hero number counting up (+ optional logo strip). USE WHEN: A single number is the story. · assets: logos[]
- **RECAP** [structure] — Close the hook loop: 3-4 points. USE WHEN: Penultimate.
- **OUTRO_CTA** [structure] — Final <=5s, one CTA, centered. USE WHEN: Last scene.
- **STEP_FLOW** [diagram] — Pipeline of 3-5 named stages. USE WHEN: Sequential process (RAG, CI/CD).
- **CHAT_MOCKUP** [mockup] — Show a conversation/failure happening. USE WHEN: AI answer, support thread, DM.
- **STAT_PANELS** [data] — Myth-bust / tradeoff: 2-3 metrics + verdict. USE WHEN: Compare metrics with a conclusion.
- **QUOTE_SPOTLIGHT** [editorial] — An insight/quote anchors the argument. USE WHEN: A person or principle carries weight. · assets: person.asset
- **SPLIT_PATHS** [diagram] — One system, two behaviours (router, hit/miss). USE WHEN: Branching / either-or.
- **BAR_COMPARE** [chart] — Benchmarks/rankings: 2-4 horizontal bars. USE WHEN: Compare magnitudes with values.
- **CHANNEL_CARD** [branding] — Designed subscribe moment. USE WHEN: Near the end, once. · assets: brand.logo
- **LINE_CHART** [chart] — Trends over time, 1-3 series (+ area). USE WHEN: Something changes across time.
- **DONUT** [chart] — Parts of a whole (2-6 segments). variant:pie = solid wedges. USE WHEN: Composition/share of total.
- **PROGRESS** [chart] — Rings or bars filling to targets. USE WHEN: Completion / coverage / scores.
- **TIMELINE** [chart] — Ordered dated milestones (history/roadmap). USE WHEN: A sequence of dates matters.
- **QUADRANT** [chart] — 2x2 positioning map / scatter. USE WHEN: Landscape of options on two axes.
- **CODE_WINDOW** [mockup] — Editor/terminal that types code then shows output. USE WHEN: Technical topic: show real code + result.
- **LOWER_THIRD** [branding] — Broadcast name/role bar — introduce a person, tool, or entity. USE WHEN: Name who/what is on screen. · assets: lowerThird.asset
- **CHAPTER** [structure] — Section divider: big number + title + rules. USE WHEN: Break a longer video into parts.
- **NOTIFICATION** [mockup] — Stack of toast notifications popping in (reactions, alerts). USE WHEN: Show reactions/alerts/DMs arriving. · assets: notifications[].icon
- **COUNTDOWN** [structure] — Number ticking from N down to GO. USE WHEN: Build tension to a launch/reveal.
- **FLIP_CARD** [editorial] — Card flips 180° to reveal its back (myth→fact, before→after). USE WHEN: Overturn a claim / reveal the twist.
- **GALLERY** [media] — A grid of image/logo tiles revealing in a stagger. USE WHEN: Show a set of tools/logos/screenshots. · assets: gallery.tiles[].asset (required)
- **COMPARISON_SLIDER** [media] — Before/after box; divider wipes to reveal after. USE WHEN: Show a transformation (old vs new UI, before/after). · assets: comparison.before.asset, comparison.after.asset
- **PHOTO_STACK** [media] — Overlapping cards that fan out as they drop in. USE WHEN: A pile of evidence/screenshots/receipts. · assets: photoStack.cards[].asset
- **IMAGE_SCENE** [media] — A single framed image — tilted polaroid or picture-in-picture. USE WHEN: Feature ONE screenshot/photo (a result, a scene, a demo). · assets: image.asset (required), image.pip.asset
- **PIPELINE** [diagram] — A staged flow with a token advancing; the engine behind the CI/boot/serverless/journey variants. USE WHEN: Any staged flow. variant:"ci"=CI/CD run (status+ms+reason); "boot"=init sequence (ms chips); "serverless"=event chain (badges+travelling token); "journey"=E2E user journey (system badge + pass/fail). · assets: stages[].asset

Additional available component types (same JSON shape — pick these too when they fit the beat; see references/scene_library.md for details):
`FUNNEL`, `WATERFALL`, `PICTOGRAM`, `RADAR`, `CANDLESTICK`, `BOX_PLOT`, `TREEMAP`, `SANKEY`, `ICON_GRID`, `ICON_CALLOUT`, `ICON_BURST`, `LOGO_WALL`, `LOGO_VERSUS`, `LOGO_TIMELINE`, `FORMULA`, `MOLECULE`, `DNA_HELIX`, `LABELED_FIGURE`, `VECTOR_FIELD`, `CIRCUIT_FLOW`, `TICKER_TAPE`, `MAP_RADAR`, `ACTIVITY_CARD`, `LOCATION_MAP`, `BITS`, `MEMORY`, `PACKET`, `LAYERED_STACK`, `GRID_ARRAY`, `SPEC_COMPARE`, `DIE_SHOT`, `NEURAL_NET`, `DATACENTER`, `TRANSFORMER_BLOCK`, `CACHE_PYRAMID`, `CALL_STACK`, `TOKENIZER`, `FILE_TREE`, `DATABASE_TABLE`, `GIT_BRANCH`, `STATE_MACHINE`, `EMBEDDING_SPACE`, `QUEUE`, `API_REQUEST_RESPONSE`, `BOOLEAN_LOGIC_GATES`, `HASH_FUNCTION`, `SORTING_VISUAL`, `CLOCK_SIGNAL`, `GPU_CLUSTER`, `ZOOM_SCALE`, `ENCRYPTION`, `POINTER_DIAGRAM`, `NUMBER_BASE`, `CODE_EDITOR`, `TERMINAL_SESSION`, `LOG_STREAM`, `CODE_DIFF`, `ERROR_TRACE`, `WINDOW_FRAME`, `AUTOMATION_RUN`, `DOM_INSPECT`, `NETWORK_WATERFALL`, `DEVICE_FRAME`, `CLOUD_ARCH`, `K8S_CLUSTER`, `COST_METER`, `SLO_GAUGE`, `IAC_PLAN`, `ERD`, `PROCESS_TABLE`, `KERNEL_BOUNDARY`, `TEST_RUNNER`, `TEST_MATRIX`, `CONTEXT_METER`, `AGENT_HARNESS`, `KNOWLEDGE_GRAPH`, `RETRIEVAL_RANK`, `MODEL_STAGES`, `CONFIDENCE_GATE`, `SANDBOX_BOX`, `DRILL_IN`, `EVAL_DASHBOARD`, `VIDEO_HERO`, `VIDEO_SPOTLIGHT`, `MEDIA_CALLOUT`, `MEDIA_COMPARE`, `MEDIA_STAT_OVERLAY`, `SCREENSHOT_CASCADE`, `FLOATING_QUOTE_PILL`, `OVERLAY_SPLIT_DEFINITIONS`, `CYCLE_LOOP`, `STEP_STACK_OVERLAY`, `TITLE_BANNER_FOCUS`, `TALKING_POINTS`, `SLIDE_BULLETS_PIP`, `CAPTION_KINETIC_OVERLAY`, `PHOTO_TIMELINE`

## DESIGN PACKS (set brand.design to one key)
`cyberpunk` (cyberpunk) · `swiss` (swiss) · `neobrutalism` (neobrutalism) · `vaporwave` (vaporwave) · `bauhaus` (bauhaus) · `luxury` (luxury) · `terminalcli` (terminalcli) · `retro` (retro) · `material` (material) · `neumorphism` (neumorphism) · `artdeco` (artdeco) · `monochrome` (monochrome) · `academia` (academia) · `newsprint` (newsprint) · `clay` (clay) · `organic` (organic) · `industrial` (industrial) · `playgeo` (playgeo) · `maximalism` (maximalism) · `simpledark` (simpledark) · `flatdesign` (flatdesign) · `sketch` (sketch) · `kinetic` (kinetic) · `crypto` (crypto) · `corptrust` (corptrust) · `businessdeck` (businessdeck) · `techstyle` (techstyle) · `boldtype` (boldtype) · `botanical` (botanical) · `moderndark` (moderndark)

## DARK THEMES for brand.theme (light renders automatically)
Usually brand.theme = your chosen design pack (its dark twin). Core skins you can also use: `studio`, `neonGrid`, `midnight`, `terminal`, `linear`, `vapor`, `luxe`.
brand.themeLight ∈ `daylight`, `paper`, `brutalist`, `creatorGlowLight`.

## OUTPUT
Return **TWO** JSON code blocks: first the long-form spec (meta.format="long", landscape
pacing, ~10–14 scenes unless documentary), then the shorts spec (meta.format="short", a
tight 5–7 scene vertical cut of the same story). Nothing else.

Begin now. Output only the JSON.
```

## 5 · The full component library (136 types — 39 have catalog entries)

- **HOOK** [structure] — First 8s. State the stake so the viewer cannot scroll. _USE WHEN:_ Always scene 1. _assets:_ heroAsset
- **TITLE_CARD** [structure] — Name the topic for 2-3s after the hook. _USE WHEN:_ Right after HOOK.
- **CONCEPT_DIAGRAM** [diagram] — How-it-works chain of 2-4 nodes + edges. _USE WHEN:_ Explain a mechanism/flow. _assets:_ nodes[].asset
- **DIAGRAM** [diagram] — System-architect diagramming: flow / sequence / block / tree / hub. _USE WHEN:_ sequence=protocols/handshakes; tree=hierarchy/cert-chain/DNS; block=architecture; hub=one-to-many; flow=pipeline. _assets:_ diagram.nodes[].asset
- **KINETIC_TEXT** [text] — A single line as a dynamic moment: 8 FX (typewriter/glitch/split/char-spin/highlight/bounce/wave/outline). _USE WHEN:_ A punch, breather, statement, or intro title — anywhere static text would feel flat.
- **PHOTO** [media] — Full-bleed image with a deterministic Ken Burns move + caption. _USE WHEN:_ Set a scene, show a real place/thing, or a breather with an image. _assets:_ photo.asset*
- **SOUND_WAVE** [media] — Animated audio waveform bars. _USE WHEN:_ Audio / podcast / "listen" beats.
- **REVEAL** [structure] — Spotlight iris opens to reveal a statement (kicker + big line + sub). _USE WHEN:_ A cinematic "here is the point" moment or act reveal.
- **LOGO_REVEAL** [structure] — Branded mark strokes on + icon + wordmark. _USE WHEN:_ Intro sting or outro branding. _assets:_ logo.asset
- **CAROUSEL** [structure] — A 3D rotating ring of cards — "the toolkit / the ecosystem / the options". _USE WHEN:_ Show a set of 3-6 related components with depth and motion. _assets:_ carousel.items[].asset
- **CREDITS_ROLL** [structure] — Movie-style scrolling role/name rows — a stylish sign-off. _USE WHEN:_ Recap the cast of concepts, or a cinematic outro before the CTA.
- **SUBSCRIBE_REMINDER** [structure] — Compact mid-roll subscribe nudge — shaking bell + SUBSCRIBE button + one-line ask. _USE WHEN:_ A light reminder partway through (NOT the branded end-card — that is CHANNEL_CARD).
- **LIST_BUILD** [list] — "N things this changes" — icon list, two-tier rows. _USE WHEN:_ Enumerate 3-5 points. _assets:_ items[].icon
- **STAT_CALLOUT** [data] — ONE hero number counting up (+ optional logo strip). _USE WHEN:_ A single number is the story. _assets:_ logos[]
- **RECAP** [structure] — Close the hook loop: 3-4 points. _USE WHEN:_ Penultimate.
- **OUTRO_CTA** [structure] — Final <=5s, one CTA, centered. _USE WHEN:_ Last scene.
- **STEP_FLOW** [diagram] — Pipeline of 3-5 named stages. _USE WHEN:_ Sequential process (RAG, CI/CD).
- **CHAT_MOCKUP** [mockup] — Show a conversation/failure happening. _USE WHEN:_ AI answer, support thread, DM.
- **STAT_PANELS** [data] — Myth-bust / tradeoff: 2-3 metrics + verdict. _USE WHEN:_ Compare metrics with a conclusion.
- **QUOTE_SPOTLIGHT** [editorial] — An insight/quote anchors the argument. _USE WHEN:_ A person or principle carries weight. _assets:_ person.asset
- **SPLIT_PATHS** [diagram] — One system, two behaviours (router, hit/miss). _USE WHEN:_ Branching / either-or.
- **BAR_COMPARE** [chart] — Benchmarks/rankings: 2-4 horizontal bars. _USE WHEN:_ Compare magnitudes with values.
- **CHANNEL_CARD** [branding] — Designed subscribe moment. _USE WHEN:_ Near the end, once. _assets:_ brand.logo
- **LINE_CHART** [chart] — Trends over time, 1-3 series (+ area). _USE WHEN:_ Something changes across time.
- **DONUT** [chart] — Parts of a whole (2-6 segments). variant:pie = solid wedges. _USE WHEN:_ Composition/share of total.
- **FUNNEL** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **WATERFALL** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **PICTOGRAM** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **RADAR** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **CANDLESTICK** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **BOX_PLOT** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **TREEMAP** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **SANKEY** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **ICON_GRID** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **ICON_CALLOUT** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **ICON_BURST** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **LOGO_WALL** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **LOGO_VERSUS** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **LOGO_TIMELINE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **FORMULA** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **MOLECULE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **DNA_HELIX** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **LABELED_FIGURE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **VECTOR_FIELD** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **CIRCUIT_FLOW** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **TICKER_TAPE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **MAP_RADAR** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **PROGRESS** [chart] — Rings or bars filling to targets. _USE WHEN:_ Completion / coverage / scores.
- **TIMELINE** [chart] — Ordered dated milestones (history/roadmap). _USE WHEN:_ A sequence of dates matters.
- **QUADRANT** [chart] — 2x2 positioning map / scatter. _USE WHEN:_ Landscape of options on two axes.
- **CODE_WINDOW** [mockup] — Editor/terminal that types code then shows output. _USE WHEN:_ Technical topic: show real code + result.
- **LOWER_THIRD** [branding] — Broadcast name/role bar — introduce a person, tool, or entity. _USE WHEN:_ Name who/what is on screen. _assets:_ lowerThird.asset
- **CHAPTER** [structure] — Section divider: big number + title + rules. _USE WHEN:_ Break a longer video into parts.
- **NOTIFICATION** [mockup] — Stack of toast notifications popping in (reactions, alerts). _USE WHEN:_ Show reactions/alerts/DMs arriving. _assets:_ notifications[].icon
- **COUNTDOWN** [structure] — Number ticking from N down to GO. _USE WHEN:_ Build tension to a launch/reveal.
- **FLIP_CARD** [editorial] — Card flips 180° to reveal its back (myth→fact, before→after). _USE WHEN:_ Overturn a claim / reveal the twist.
- **GALLERY** [media] — A grid of image/logo tiles revealing in a stagger. _USE WHEN:_ Show a set of tools/logos/screenshots. _assets:_ gallery.tiles[].asset*
- **COMPARISON_SLIDER** [media] — Before/after box; divider wipes to reveal after. _USE WHEN:_ Show a transformation (old vs new UI, before/after). _assets:_ comparison.before.asset, comparison.after.asset
- **PHOTO_STACK** [media] — Overlapping cards that fan out as they drop in. _USE WHEN:_ A pile of evidence/screenshots/receipts. _assets:_ photoStack.cards[].asset
- **IMAGE_SCENE** [media] — A single framed image — tilted polaroid or picture-in-picture. _USE WHEN:_ Feature ONE screenshot/photo (a result, a scene, a demo). _assets:_ image.asset*, image.pip.asset
- **ACTIVITY_CARD** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **LOCATION_MAP** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **BITS** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **MEMORY** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **PACKET** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **PIPELINE** [diagram] — A staged flow with a token advancing; the engine behind the CI/boot/serverless/journey variants. _USE WHEN:_ Any staged flow. variant:"ci"=CI/CD run (status+ms+reason); "boot"=init sequence (ms chips); "serverless"=event chain (badges+travelling token); "journey"=E2E user journey (system badge + pass/fail). _assets:_ stages[].asset
- **LAYERED_STACK** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **GRID_ARRAY** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **SPEC_COMPARE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **DIE_SHOT** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **NEURAL_NET** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **DATACENTER** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **TRANSFORMER_BLOCK** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **CACHE_PYRAMID** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **CALL_STACK** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **TOKENIZER** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **FILE_TREE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **DATABASE_TABLE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **GIT_BRANCH** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **STATE_MACHINE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **EMBEDDING_SPACE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **QUEUE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **API_REQUEST_RESPONSE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **BOOLEAN_LOGIC_GATES** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **HASH_FUNCTION** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **SORTING_VISUAL** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **CLOCK_SIGNAL** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **GPU_CLUSTER** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **ZOOM_SCALE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **ENCRYPTION** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **POINTER_DIAGRAM** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **NUMBER_BASE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **CODE_EDITOR** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **TERMINAL_SESSION** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **LOG_STREAM** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **CODE_DIFF** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **ERROR_TRACE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **WINDOW_FRAME** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **AUTOMATION_RUN** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **DOM_INSPECT** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **NETWORK_WATERFALL** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **DEVICE_FRAME** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **CLOUD_ARCH** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **K8S_CLUSTER** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **COST_METER** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **SLO_GAUGE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **IAC_PLAN** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **ERD** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **PROCESS_TABLE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **KERNEL_BOUNDARY** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **TEST_RUNNER** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **TEST_MATRIX** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **CONTEXT_METER** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **AGENT_HARNESS** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **KNOWLEDGE_GRAPH** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **RETRIEVAL_RANK** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **MODEL_STAGES** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **CONFIDENCE_GATE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **SANDBOX_BOX** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **DRILL_IN** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **EVAL_DASHBOARD** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **VIDEO_HERO** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **VIDEO_SPOTLIGHT** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **MEDIA_CALLOUT** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **MEDIA_COMPARE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **MEDIA_STAT_OVERLAY** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **SCREENSHOT_CASCADE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **FLOATING_QUOTE_PILL** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **OVERLAY_SPLIT_DEFINITIONS** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **CYCLE_LOOP** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **STEP_STACK_OVERLAY** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **TITLE_BANNER_FOCUS** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **TALKING_POINTS** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **SLIDE_BULLETS_PIP** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **CAPTION_KINETIC_OVERLAY** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)
- **PHOTO_TIMELINE** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)

## 6 · The data-contract reality (the core problem)

Every scene has a `data` object. But `data` is typed as ONE big flat interface where
**every field is optional** — each component reads only the handful of fields it needs,
and that "type → which fields" mapping lives in component code, **not** in any schema the
LLM ever sees. So an LLM guesses field names, and guesses wrong (see §9). The linter
(§7) checks budgets, transitions, durations and a few structural rules — but it does
**NOT** validate data field names, so wrong-but-plausible JSON passes lint and then
renders **blank or broken**.

Scene shape:
```ts
interface Scene {
  id: string;                 // "s01", "s02", …
  type: string;               // one of the 136 component types
  narration: string;          // the spoken line (drives voiceover + duration)
  durationFrames: number;     // 30fps; HOOK must be ≤ 240 (8s)
  timingSource?: string;      // "estimated" from the LLM; "tts" after voiceover
  background: 'zoneA'|'zoneB'|'zoneC';
  transition?: string;        // scene cut — ONE OF: fade, slide, push, zoom, morph, wipe, iris, clock, dip, blinds, pixel, whippan, zoomthrough, letterbox, filmburn, glitch
  data: SceneData;            // the component content (below)
}
```

The flat data surface (abridged head shown; note how nothing tells the LLM which
fields belong to which type):
```ts
export interface SceneData {
  // HOOK
  headline?: string;
  subtext?: string;
  heroAsset?: string | null;
  headlineAtWord?: number;
  heroAtWord?: number;
  // TITLE_CARD
  title?: string;
  subtitle?: string;
  // CONCEPT_DIAGRAM
  nodes?: DiagramNode[];
  edges?: DiagramEdge[];
  // DIAGRAM (multi-layout: flow / sequence / block / tree / hub)
  diagram?: DiagramData;
  // KINETIC_TEXT (dynamic text moment)
  kinetic?: KineticData;
  // PHOTO (full-bleed Ken Burns image)
  photo?: PhotoData;
  // SOUND_WAVE / REVEAL / LOGO_REVEAL
  wave?: WaveData;
  reveal?: RevealData;
  logo?: LogoData;
  // CAROUSEL / CREDITS_ROLL / SUBSCRIBE_REMINDER
  carousel?: CarouselData;
  credits?: CreditsData;
  subscribe?: SubscribeData;
  // LIST_BUILD / RECAP
  heading?: string;
  items?: ListItem[];
  points?: ListItem[];
  // STAT_CALLOUT
  value?: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  atWord?: number;
  // OUTRO_CTA
  message?: string;
  sub?: string;
  // studio components
  headlineColor?: SemColor;
  source?: string;
  anim?: string; // entrance override for the scene's primary element (see ENTRANCES)
  steps?: StepItem[];
  caption?: {text: string; color?: SemColor; atWord: number};
  panelLabel?: string;
  panelColor?: SemColor;
  messages?: ChatMessage[];
  sideCard?: {kicker: string; kickerColor?: SemColor; lines: MonoLine[]; atWord: number};
  gridVisual?: {kicker: string; legendA: string; legendB: string; atWord: number};
  stats?: StatPanelItem[];
  verdict?: {text: string; color?: SemColor; atWord: number};
  person?: {name: string; role: string; asset?: string | null};
  quote?: string;
  transformation?: {from: string; to: string; color?: SemColor; atWord: number};
  center?: {kicker?: string; title: string; color?: SemColor; atWord: number};
  left?: PathCard;
  right?: PathCard;
  // STAT_CALLOUT logo strip / BAR_COMPARE / CHANNEL_CARD
  /* … many more optional fields, one cluster per component … */
}
```

**Animations vs transitions (a real trap):** `transition` is a scene-level cut and must
be one of: fade, slide, push, zoom, morph, wipe, iris, clock, dip, blinds, pixel, whippan, zoomthrough, letterbox, filmburn, glitch. Separately, some components take an *animation* in
their data (`anim`/`kinetic.fx`) from a DIFFERENT set: fadeUp, rise, blur, pop, scale, bounce, bubble, spin, stack, slideLeft, slideRight, slideUp, slideDown, clip, wipe. LLMs conflate
these (they put `pop`/`slideUp` — which are animations — into `transition`).

## 7 · The validation contract (the rules a spec must satisfy)

A spec must pass the linter before anything renders. `[REJECT]` = hard error; `[warn]`
= warning. There are **777 distinct checks** in total — most are per-component
field validations (evidence of how strict, and how *implicit*, the data contract is).
The **global/structural** rules every author must satisfy:

- [REJECT] NO DYNAMIC MOMENT: add at least one of DIAGRAM/KINETIC_TEXT/REVEAL/PHOTO/CAROUSEL/… so the video isn't all boxes, lists and numbers.
- [REJECT] OVER-RELIANCE: sub-type … used …× (>~… for … scenes) — swap some for other component types.
- [REJECT] PALETTE TOO NARROW: only … distinct sub-types across … scenes (need ≥…). Vary components — see references/scene_library.md; don't reuse the same few.
- [REJECT] PIPELINE-FAMILY OVER-USE: … staged-flow scenes (>~… for …) — reach for DIAGRAM/DRILL_IN/sequence to vary the skeleton, not just the chips.
- [REJECT] SAME-FAMILY ADJACENCY: scenes … and … are both …-family — vary the skeleton (a different component), not just the variant.
- [REJECT] asset "img:…" not found in …/ — drop the file there first (see PROJECT_RULES.md §Assets)
- [REJECT] brand.background "…" unknown. Known: aurora, grid, aurora-grid, plain, bokeh, starfield, grid-pulse, wave, ripple, gradient, geo, matrix-rain, noise, ember (omit for theme default)
- [REJECT] brand.theme "…" is a LIGHT theme — brand.theme is BY LAW the DARK skin (…); light variants render automatically. Use brand.themeLight to pick the light twin.
- [REJECT] brand.theme "…" unknown. Known: …
- [REJECT] brand.themeLight "…" must be one of: …
- [REJECT] cover.title "…" > … chars — thumbnails are fragments, not sentences
- [REJECT] duplicate scene id …
- [REJECT] long spec missing "thumbnail": {title, badge, asset} — thumbnails must derive from the topic, never go stale
- [REJECT] no scenes
- [REJECT] scene 1 must be HOOK — first 5 seconds decide retention
- [REJECT] thumbnail.title "…" > … chars
- [warn] last scene is …; expected OUTRO_CTA (or RECAP)
- [warn] meta.screenplay "…" unknown. Known: …
- [warn] meta.topicAxes has <2 strategy axes (entity-novelty/economic-pain/sovereignty/tribal-conflict) — historically this profile lands ~50-300 views; see channel_playbook.md §1
- [warn] only … scenes — thin video
- [warn] only … transition kind(s) used — vary scene.transition (16 available) so the cutting has rhythm.
- [warn] … scenes — likely too long for … (expected ≤…); split into parts or set meta.screenplay:"documentary" for long-form

Plus **755 per-scene / per-component field checks** (names, ranges, ids). A sample:

- [REJECT] …: ACTIVITY_CARD max 9 bars
- [REJECT] …: ACTIVITY_CARD needs a value
- [REJECT] …: ACTIVITY_CARD needs ≥3 bars
- [REJECT] …: ACTIVITY_CARD range > 12 chars
- [REJECT] …: ACTIVITY_CARD title > 22 chars
- [REJECT] …: ACTIVITY_CARD trend > 32 chars
- [REJECT] …: ACTIVITY_CARD value > 8 chars
- [REJECT] …: AGENT_HARNESS agent label > 16 chars
- [REJECT] …: AGENT_HARNESS chip "…" > 16 chars
- [REJECT] …: AGENT_HARNESS guardrail label > 18 chars
- [REJECT] …: AGENT_HARNESS guardrail reason > 24 chars
- [REJECT] …: AGENT_HARNESS max 2 chips per ring (3 concentric rings × 3 chips over-packs the lower arc — proven in the Program-3 matrix; ships as a legend-ladder enhancement, Program 4)
- [REJECT] …: AGENT_HARNESS max 3 rings
- [REJECT] …: AGENT_HARNESS needs ≥2 rings

## 8 · The director laws (from the project skill, verbatim)

## Hard rules — THEME & VARIETY LAW
- `brand.theme` is BY LAW a DARK skin; the 7 core skins are studio|neonGrid|midnight|terminal|linear|vapor|luxe, and every design pack also ships a dark theme twin (neobrutalism, cyberpunk, material, … — 38 dark themes total; the authoritative list is `DARK_THEMES` in `scripts/lint-spec.mjs`). Light variants render automatically; `brand.themeLight` (daylight|paper|brutalist) picks the light twin. Never set a light theme as brand.theme — the linter rejects it.
- ROTATION IS MANDATORY: list every existing topics/*/long.json brand.theme first; never repeat the most recent; vary the background variant too, and vary the scene MIX (don't open every video HOOK→TITLE_CARD→STEP_FLOW). Two consecutive same-looking videos = defect.
- 42 render-ready themes exist today (38 dark + 4 light) spanning the 30 design packs; for genuinely new looks, propose 2-3 from references/design_index.md (30 design skills) — conversion is a one-time approved Claude Code job under design_contract.md.

## Hard rules — TRUTH LAW
- Today's date comes from the runtime environment, never from training memory.
- Facts come ONLY from the user's source or a live web search performed now. Time-sensitive claims (prices, versions, "current/latest X") with no fresh source → web-search or emit `MISSING: <fact>`; NEVER fill from memory.
- Derived files (voiceover_*.txt, indexes) are generated by scripts (`npm run voiceover -- <slug>`), never hand-written by the model.
- Stage gates survive interruptions: a session limit or "continue" never authorizes skipping an approval gate.

## Hard rules
- Text budgets in `references/text_budgets.md` are LAW — they exist because every overflow past them broke a real layout.
- Headlines: exactly ONE `[accented phrase]`. Semantic colors MEAN (green=works, red=broken, blue=tech/info, purple=AI/agent, orange=tension, yellow=cost); they never decorate.
- Studio scenes always carry a `source` footer (≤64 chars, factual).
- Never invent quotes from real people; paraphrase with attribution or use fictional personas.
- HOOK ≤8s, states stakes, no greetings. RECAP closes the hook's loop. OUTRO centered (end-screen safe).
- IP GUARDRAIL (hard, library-wide): components DISPLAY supplied or library assets — they NEVER generate or hand-draw copyrighted characters, game/movie/celebrity art, mascots, or brand marks. Brand logos come ONLY from `si:` (simple-icons) SVGs, never redrawn or recoloured beyond the pack's mono treatment; generic glyphs come from `lucide:`; a figure's centre subject (`LABELED_FIGURE`, `VECTOR_FIELD` freebody body) is an AssetIcon glyph or a confirmed `img:`, never redrawn anatomy or scientific art. Numbers, prices, and positions shown in charts / `TICKER_TAPE` / `MAP_RADAR` are ILLUSTRATIVE and carry a `source` unless taken from a fresh, cited source.
- If the user provides a design reference (screenshots/links) for a NEW look: do not fake it in JSON — new looks require new theme/components in the Remotion project first. Produce (a) a theme object for `src/themes.ts`, (b) component code following `src/ui.tsx` primitives (Panel/Kicker/Pill/SourceFooter, word anchors, useScale), (c) a demo scene for the gallery spec, (d) a new row for the scene library table — then future specs may reference it.

## 9 · A REAL failure (Google Gemini, from the current prompt)

We gave the §4 prompt to Gemini for the topic *"Instagram's newest AI tool didn't
survive the week."* It produced fluent, well-structured JSON that was **rejected**, and
worse, contained silent schema errors lint can't catch.

**Linter result + the deeper mismatches:**
```text
Instagram's newest AI tool didn't survive the week — Gemini output, lint result
=================================================================================
This is a REAL failure case: the JSON below was produced by Google Gemini from the
iAuteur "Generate LLM prompt" output, pasted back into the console, and REJECTED by
the linter. It is kept verbatim as evidence for the Fable brief.

── lint long.json ──
⚠ WARNINGS (3)
  • 11 scenes — likely too long for explainer (expected ≤10); split into parts or set meta.screenplay:"documentary" for long-form
  • meta.topicAxes has <2 strategy axes (entity-novelty/economic-pain/sovereignty/tribal-conflict) — historically this profile lands ~50-300 views; see channel_playbook.md §1
  • s05: studio scene without a "source" footer — the credibility strip is part of the look

✗ REJECTED (3 errors)
  • s01: HOOK is 8.6s — must be ≤8s
  • s04: transition "pop" unknown. Known: fade, slide, push, zoom, morph, wipe, iris, clock, dip, blinds, pixel, whippan, zoomthrough, letterbox, filmburn, glitch
  • s06: transition "slideUp" unknown. Known: fade, slide, push, zoom, morph, wipe, iris, clock, dip, blinds, pixel, whippan, zoomthrough, letterbox, filmburn, glitch

── lint shorts.json ──
⚠ WARNINGS (1)
  • s05: studio scene without a "source" footer — the credibility strip is part of the look

✗ REJECTED (2 errors)
  • s03: transition "pop" unknown. Known: fade, slide, push, zoom, morph, wipe, iris, clock, dip, blinds, pixel, whippan, zoomthrough, letterbox, filmburn, glitch
  • s06: transition "slideUp" unknown. Known: fade, slide, push, zoom, morph, wipe, iris, clock, dip, blinds, pixel, whippan, zoomthrough, letterbox, filmburn, glitch

DEEPER (linter did NOT catch these — data field-name mismatches that render blank/wrong):
  • s06 STAT_CALLOUT used statValue:"160K"/statLabel/kicker → real fields are numeric value + label + prefix/suffix (a string "160K" never counts up).
  • s11 OUTRO_CTA used headline/subhead/buttonText → real fields are message/sub.
  • s10 RECAP used title + points:[strings] → real fields are heading + points:ListItem[] (objects).
  • s01 HOOK used kicker + atWord → real fields are subtext + headlineAtWord/heroAtWord (HOOK has no kicker).
  • CONCEPT_DIAGRAM nodes lacked per-node atWord; a "title" field is not read by that component.
```

**Gemini's long.json (verbatim):**
```json
{
  "meta": {
    "topic": "Instagram's newest AI tool didn't survive the week",
    "format": "long",
    "fps": 30,
    "onePayoff": "Tech giants cannot push opt-out AI training without facing massive creator backlash.",
    "openLoop": "Why did Meta kill its brand new AI image tool after just three days?",
    "analogy": "A product launch that turned into a digital fire drill.",
    "screenplay": "explainer"
  },
  "brand": {
    "theme": "moderndark",
    "design": "moderndark",
    "themeLight": "daylight",
    "channel": "YOUR CHANNEL"
  },
  "thumbnail": {
    "title": "DEAD IN 3 DAYS",
    "badge": "Meta AI Backlash",
    "asset": "lucide:alert-triangle"
  },
  "scenes": [
    {
      "id": "s01",
      "type": "HOOK",
      "narration": "Meta launched a brand new AI tool on Tuesday. By Friday, it was completely dead. Here is what happened.",
      "durationFrames": 258,
      "timingSource": "estimated",
      "background": "zoneA",
      "data": {
        "headline": "Dead in 3 Days",
        "kicker": "META AI",
        "heroAsset": "lucide:skull",
        "atWord": 9
      }
    },
    {
      "id": "s02",
      "type": "TITLE_CARD",
      "transition": "slide",
      "narration": "The tool was called Muse Image, built by Meta Superintelligence Labs.",
      "durationFrames": 162,
      "timingSource": "estimated",
      "background": "zoneB",
      "data": {
        "title": "MUSE IMAGE",
        "subtitle": "The 72-Hour Lifespan",
        "atWord": 4
      }
    },
    {
      "id": "s03",
      "type": "CONCEPT_DIAGRAM",
      "transition": "morph",
      "narration": "It allowed users to generate AI images directly from other people's public Instagram posts.",
      "durationFrames": 204,
      "timingSource": "estimated",
      "background": "zoneC",
      "data": {
        "title": "How It Worked",
        "nodes": [
          { "id": "n1", "label": "Public Posts", "asset": "lucide:image" },
          { "id": "n2", "label": "Muse Image", "asset": "lucide:cpu" },
          { "id": "n3", "label": "AI Gen", "asset": "lucide:wand-2" }
        ],
        "edges": [
          { "from": "n1", "to": "n2" },
          { "from": "n2", "to": "n3" }
        ],
        "atWord": 4
      }
    },
    {
      "id": "s04",
      "type": "NOTIFICATION",
      "transition": "pop",
      "narration": "But immediately, users panicked. They flooded X and Reddit, warning that this created a massive space for deepfakes.",
      "durationFrames": 246,
      "timingSource": "estimated",
      "background": "zoneA",
      "data": {
        "title": "The Backlash",
        "notifications": [
          { "title": "Reddit User", "message": "How do I opt out of this?!", "icon": "si:reddit" },
          { "title": "X User", "message": "Huge privacy concerns here.", "icon": "si:x" },
          { "title": "Creator", "message": "Perfect tool for deepfakes...", "icon": "lucide:alert-circle" }
        ],
        "atWord": 6
      }
    },
    {
      "id": "s05",
      "type": "QUOTE_SPOTLIGHT",
      "transition": "fade",
      "narration": "Privacy advocates like Apar Gupta accused Meta of taking an excuse to violate our consent and privacy again and again.",
      "durationFrames": 270,
      "timingSource": "estimated",
      "background": "zoneB",
      "data": {
        "quote": "An excuse to violate our consent and privacy again and again.",
        "author": "Apar Gupta",
        "role": "Internet Freedom Foundation",
        "person": { "asset": "lucide:user" },
        "atWord": 9
      }
    },
    {
      "id": "s06",
      "type": "STAT_CALLOUT",
      "transition": "slideUp",
      "narration": "The pressure mounted when SAG-AFTRA, representing a hundred and sixty thousand professionals, urged members to opt out.",
      "durationFrames": 246,
      "timingSource": "estimated",
      "background": "zoneC",
      "data": {
        "statValue": "160K",
        "statLabel": "Entertainment Professionals",
        "kicker": "SAG-AFTRA Warning",
        "atWord": 10
      }
    },
    {
      "id": "s07",
      "type": "FLIP_CARD",
      "transition": "whippan",
      "narration": "They called the lack of an opt-in an utter miscalculation of public sentiment regarding obvious digital dangers.",
      "durationFrames": 234,
      "timingSource": "estimated",
      "background": "zoneA",
      "data": {
        "frontTitle": "Meta's Approach",
        "frontSubtitle": "Opt-Out Only",
        "backTitle": "Union Demand",
        "backSubtitle": "Clear OPT-IN Required",
        "atWord": 7
      }
    },
    {
      "id": "s08",
      "type": "TIMELINE",
      "transition": "slide",
      "narration": "By Friday, Meta surrendered. They released a blog post admitting the feature missed the mark and shut it down.",
      "durationFrames": 258,
      "timingSource": "estimated",
      "background": "zoneB",
      "data": {
        "title": "The Rollback",
        "events": [
          { "date": "Tuesday", "label": "Launched via PR" },
          { "date": "Mid-Week", "label": "SAG-AFTRA & CAA Revolt" },
          { "date": "Friday", "label": "Feature Killed" }
        ],
        "atWord": 4
      }
    },
    {
      "id": "s09",
      "type": "LIST_BUILD",
      "transition": "wipe",
      "narration": "We saw this happen in twenty twenty five when OpenAI's Sora 2 faced similar backlash and eventually shut down in March.",
      "durationFrames": 282,
      "timingSource": "estimated",
      "background": "zoneC",
      "data": {
        "title": "A Familiar Pattern",
        "items": [
          { "title": "OpenAI Sora 2", "subtitle": "Shut down March 2025", "icon": "lucide:video" },
          { "title": "Trademark Issues", "subtitle": "Studio Ghibli angered", "icon": "lucide:copyright" },
          { "title": "Celeb Protection", "subtitle": "Registering likeness marks", "icon": "lucide:shield-check" }
        ],
        "atWord": 11
      }
    },
    {
      "id": "s10",
      "type": "RECAP",
      "transition": "push",
      "narration": "To recap: Muse Image launched Tuesday, sparked instant privacy backlash, and was entirely pulled by Friday.",
      "durationFrames": 222,
      "timingSource": "estimated",
      "background": "zoneA",
      "data": {
        "title": "The Short Life of Muse Image",
        "points": [
          "Launched Tuesday",
          "Deepfake & Privacy Panic",
          "Killed on Friday"
        ],
        "atWord": 4
      }
    },
    {
      "id": "s11",
      "type": "OUTRO_CTA",
      "transition": "fade",
      "narration": "For more breaking news on AI and creator rights, hit subscribe to YOUR CHANNEL.",
      "durationFrames": 198,
      "timingSource": "estimated",
      "background": "zoneB",
      "data": {
        "headline": "Stay Informed",
        "subhead": "Subscribe for more updates",
        "buttonText": "Subscribe",
        "atWord": 9
      }
    }
  ]
}
```

**Gemini's shorts.json (verbatim):**
```json
{
  "meta": {
    "topic": "Instagram's newest AI tool didn't survive the week",
    "format": "short",
    "fps": 30,
    "onePayoff": "Meta's attempt to use public IG posts for AI images was crushed by immediate backlash.",
    "openLoop": "How did Meta's newest AI tool die in just 3 days?",
    "analogy": "A product launch that turned into a digital fire drill.",
    "screenplay": "explainer"
  },
  "brand": {
    "theme": "moderndark",
    "design": "moderndark",
    "themeLight": "daylight",
    "channel": "YOUR CHANNEL"
  },
  "thumbnail": {
    "title": "DEAD IN 3 DAYS",
    "badge": "Meta Backlash",
    "asset": "lucide:alert-triangle"
  },
  "scenes": [
    {
      "id": "s01",
      "type": "HOOK",
      "narration": "Instagram's brand new AI tool survived exactly three days before Meta completely killed it.",
      "durationFrames": 210,
      "timingSource": "estimated",
      "background": "zoneA",
      "data": {
        "headline": "Dead in 3 Days",
        "kicker": "META AI",
        "heroAsset": "lucide:skull",
        "atWord": 10
      }
    },
    {
      "id": "s02",
      "type": "CONCEPT_DIAGRAM",
      "transition": "slide",
      "narration": "Muse Image tried letting users generate AI images from anyone's public Instagram posts.",
      "durationFrames": 198,
      "timingSource": "estimated",
      "background": "zoneB",
      "data": {
        "title": "The Flawed Idea",
        "nodes": [
          { "id": "n1", "label": "Public Posts", "asset": "lucide:image" },
          { "id": "n2", "label": "Muse Image", "asset": "lucide:bot" },
          { "id": "n3", "label": "AI Gen", "asset": "lucide:wand-2" }
        ],
        "edges": [
          { "from": "n1", "to": "n2" },
          { "from": "n2", "to": "n3" }
        ],
        "atWord": 4
      }
    },
    {
      "id": "s03",
      "type": "NOTIFICATION",
      "transition": "pop",
      "narration": "Users immediately panicked on X and Reddit, terrified of deepfakes and privacy violations.",
      "durationFrames": 198,
      "timingSource": "estimated",
      "background": "zoneC",
      "data": {
        "title": "Massive Backlash",
        "notifications": [
          { "title": "Privacy", "message": "Violating consent!", "icon": "lucide:shield-off" },
          { "title": "Creators", "message": "Deepfake nightmare", "icon": "lucide:alert-circle" }
        ],
        "atWord": 3
      }
    },
    {
      "id": "s04",
      "type": "STAT_CALLOUT",
      "transition": "whippan",
      "narration": "Even SAG-AFTRA's hundred and sixty thousand members stepped in, calling it an utter miscalculation.",
      "durationFrames": 210,
      "timingSource": "estimated",
      "background": "zoneA",
      "data": {
        "statValue": "160K",
        "statLabel": "Union Members",
        "kicker": "SAG-AFTRA Response",
        "atWord": 3
      }
    },
    {
      "id": "s05",
      "type": "QUOTE_SPOTLIGHT",
      "transition": "fade",
      "narration": "By Friday, Meta surrendered, admitting the feature quote missed the mark.",
      "durationFrames": 174,
      "timingSource": "estimated",
      "background": "zoneB",
      "data": {
        "quote": "This feature missed the mark, so it's no longer available.",
        "author": "Meta",
        "role": "Instagram Blog",
        "person": { "asset": "si:meta" },
        "atWord": 8
      }
    },
    {
      "id": "s06",
      "type": "OUTRO_CTA",
      "transition": "slideUp",
      "narration": "Subscribe to YOUR CHANNEL for more fast tech breakdowns.",
      "durationFrames": 150,
      "timingSource": "estimated",
      "background": "zoneC",
      "data": {
        "headline": "Stay Informed",
        "subhead": "Subscribe for daily AI news",
        "buttonText": "Subscribe",
        "atWord": 1
      }
    }
  ]
}
```

## 10 · What we already suspect — and where we need your judgement

Our working hypotheses (challenge them):
1. **Teach the exact per-type data schema, not just a purpose.** The prompt should carry,
   for each component the video will use, its precise field list (names, types, required,
   budgets) + a tiny valid example. Open question: how to do this for 136 components without
   blowing the context window of small models.
2. **A two-stage flow may beat one-shot:** stage 1 the LLM picks an ordered list of
   component types (a "shot list"); stage 2 it fills only those components' schemas. This
   shrinks what a small model must hold at once.
3. **Constrained/GBNF/JSON-Schema decoding** for local models (llama.cpp/Ollama grammars)
   to make invalid JSON structurally impossible — is this the right backbone for the
   sub-1M / tiny-model requirement, or is that requirement unrealistic and we should set a
   floor (e.g. a 3B instruct model)?
4. **A repair loop:** feed linter errors back to the model (or auto-fix mechanically:
   remap known field aliases like statValue→value, clamp HOOK to 8s, coerce
   transition-that-is-actually-an-anim). How much should be deterministic auto-repair vs
   model round-trips?
5. **Official media/logos:** how to let the model REQUEST an image/video/logo (e.g. emit
   `assetsNeeded` with an official-source query) and have the console fetch it safely
   (simple-icons for logos; Wikimedia/press-kit/CC0 for images) rather than inventing files.

**Please analyse and advise on, at minimum:**
- A concrete prompt architecture that makes **valid, render-correct** specs likely on the
  **first** try across the whole model-size spectrum, and exactly how it degrades for tiny
  local models (what's the realistic floor, and the design for models below it?).
- How to represent 136 component schemas compactly (progressive disclosure? retrieval of
  only the chosen components' schemas? a compressed DSL instead of raw JSON?).
- The right split between (a) prompt design, (b) deterministic pre/post-processing &
  auto-repair, (c) a validate→repair model loop, and (d) constrained decoding.
- A plan to incorporate official images/videos/logos so videos aren't all-animation.
- Anything about our current prompt (§4), laws (§8), or validation (§7) that is wrong,
  missing, or counterproductive.

## 11 · What we want back from you

1. A critique of the current prompt (§4) — what to cut, add, or restructure.
2. A recommended **prompt architecture** (with the schema-teaching + shot-list ideas
   resolved) that we can implement in our console's prompt generator.
3. A clear **model-tier strategy**: what to do for frontier APIs vs mid open models vs
   tiny/local models (and the honest floor).
4. A **deterministic auto-repair** spec (field-alias map, clamps, coercions) so near-miss
   JSON becomes valid without a model round-trip.
5. An **official-media/logo** sourcing design.
6. Any correction to our assumptions in §10.

Write for engineers who will implement your recommendations directly. Be concrete.
