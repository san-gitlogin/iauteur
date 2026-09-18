# JEV — production plan (v4, final shape)

**Slug:** `jev-decisions-measured` · **`meta.subject`: `Jev`** · one long + one shorts
**Locked in the LAW 0 interview (2026-09-18):** moderndark / daylight, background `grid`,
`en-US-AvaMultilingualNeural` at **+8%**, runtime uncapped, **no sponsor**.
**Owner's call, same day:** no payment of any kind, and no hands-on running of Jev.

Facts and sources: [`FACTS.md`](FACTS.md). Nothing in the cut comes from anywhere else.
The reference transcript and the LangChain post are **fact sources only** — every idea in them
is carried, none of their phrasing is.

> **v4 changes.** Running Jev costs money on every available route (verified from the gateway
> model APIs, not from marketing). No payment means no live demo, so the hands-on act is gone
> and the cut becomes a **sourced explainer**. That removes the race — and buys back five
> recorded beats, because TypeSafe published four playable demo videos and two pages about
> themselves that nobody covering this is filming. `briefs/jev/bench/probe.mjs` is parked.

---

## 1. The angle

**The most thoroughly sourced thing anyone will publish about Jev.** Every claim in this video is
read off the page that makes it, on camera, and every caveat is read off the page that admits it.
That is a real and defensible identity, and it is one the coverage is not competing for — the
Medium write-ups paraphrase the launch post, and the video creators with early access show their
own playground and stop there.

Five things this cut has that the coverage doesn't:

1. **The team page.** TypeSafe's own words: *"Diogo co-invented RLHF and InstructGPT, the methods
   that lead to ChatGPT and GPT4."* The title's claim, paid from the company's own page rather
   than a journalist's paraphrase. Nobody is filming it.
2. **All four demo videos, played.** Doom and Wikiracing on the blog, the side-by-side, and a
   Loom walkthrough buried on the docs' smart-home demo page. Most coverage mentions two.
3. **Their own Nuance boxes.** The launch post admits the evals were written by their own
   capabilities team, that the reference answers bias toward OpenAI and Anthropic, and that the
   demo state "paints our model in an advantageous light." A company marking its own homework.
4. **The price confirmed twice independently** — Vercel's listing and OpenRouter's — neither of
   them TypeSafe.
5. **LangChain's harness write-up**, which shows what people are actually wiring it into: model
   routing and a pre-execution risk guard on tool calls.

**One payoff:** Jev isn't smarter than the frontier models — 67.8% against Sol's 74.1% and
Opus 5's 73.1% — and it wins anyway, by being ~440× cheaper and ~95× faster at the one job
software actually asks a model to do.

**Open loop:** what does a frontier model look like when you take away its ability to speak?

**What we do not do.** We never imply we ran it. Every demo on screen is introduced as TypeSafe's
own recording, out loud and with `sourceNote` under it for the whole beat — that is LAW 0f's
quotation rule, and it is required, not optional. Equally, we never defend our own footage: no
"real", no "measured here". The pages argue for themselves.

---

## 2. The claims, and how each is paid for

| claim | receipt (on camera) | caveat (on camera) |
|---|---|---|
| ChatGPT's co-creator built it | **typesafe.ai/team**, sc. 8 — their own wording | "co-invented RLHF and InstructGPT, the methods that lead to ChatGPT" is a lineage claim, and we say it in those words rather than flattening it |
| 200× faster | typesafe.ai, sc. 5 | sc. 43: their own Nuance box, "on the higher end of real world gains". LangChain quote this figure *from TypeSafe* — said that way |
| 400× cheaper | same | same |
| $42 per billion input tokens | typesafe.ai, **Vercel** (sc. 48) and **OpenRouter** (sc. 49) | early-access pricing they admit they "can't prove isn't subsidised" |
| It cannot hallucinate | the declared output space, sc. 20 | sc. 44: it can't produce a shape you didn't declare; it can absolutely pick the wrong one |
| 0% type errors | evals site, sc. 45 | their own line: "our number is not empirical" |
| It answers in 70–500 ms | their side-by-side recording, sc. 28 | their laptops, their network, their choice of state — all stated |

**Claims we will not make:** that we ran it; that Jev beats frontier LLMs on intelligence; that it
replaces an LLM; that 193.6×/444.6× are independent; any parameter count, layer count,
architecture detail or context window (undisclosed — Vercel's API literally returns
`context_window: 0`); the "$5 free credit" from the reference video; and nothing about the
`LLaDA` fork in their GitHub org.

---

## 3. Shape — 66 scenes, 22 recorded (33%)

`OVER-RELIANCE` caps a sub-type at `ceil(0.35 × 66)` = 24, so 22 is comfortable.
`REC` = footage · `★` = new component · everything else drawn.

### ACT 0 — the claim (1–6, 3 REC)

| # | beat | cast |
|---|---|---|
| 1 | **"Jev is a frontier AI model that cannot write a single word."** Subject in the first sentence (LAW 0g). Headline `JEV — 200× FASTER, 400× CHEAPER` | `HOOK` |
| 2 | Greet, then the intent: today we go through every page TypeSafe has published about Jev — the claims, the receipts, and the caveats they printed about themselves | `TITLE_CARD` |
| 3 | **REC — their side-by-side, four seconds of it.** Answers landing all at once on one side, a sentence typing itself out on the other. Said plainly: this is TypeSafe's own demo | `rec:jev-home#sbs` |
| 4 | **REC** — the founder's launch thread | `rec:jev-tweet` |
| 5 | **REC** — typesafe.ai: 193.6× faster, 444.6× cheaper, $42 per billion | `rec:jev-home` |
| 6 | What we cover | `LIST_BUILD` |

### ACT 1 — who made this (7–11, 2 REC)

| # | beat | cast |
|---|---|---|
| 7 | Chapter: before a single benchmark, who is this | `CHAPTER` |
| 8 | **REC — the team page.** "Diogo co-invented RLHF and InstructGPT, the methods that lead to ChatGPT and GPT4. Previously, he was at Google Brain." And the COO, ex-Meta FAIR | `rec:jev-team` |
| 9 | What RLHF actually is, in plain English — the thing that turned a text predictor into something you could talk to. You need this to understand what he changed | `MODEL_STAGES` |
| 10 | **REC** — the manifesto: "Build Prod, Not God" | `rec:jev-manifesto` |
| 11 | Two years in stealth, forty million dollars, and a model that won't talk | `TIMELINE` |

### ACT 2 — what a System One model is (12–26, 3 REC)

| # | beat | cast |
|---|---|---|
| 12 | Chapter | `CHAPTER` |
| 13 | **REC** — the launch post: "superhuman at chat for years, so where is all the automation?" and "a frontier-intelligence function call: unstructured state in, typed probabilistic decisions out" | `rec:jev-blog#opening` |
| 14 | Your software doesn't want a paragraph. It wants `queue = billing`. An `if` with an empty condition slot | ★ `SMART_IF` |
| 15 | The slot filling: health readings arrive as JSON, and no rule you can write catches "something's off here" | ★ `SMART_IF` (payoff) |
| 16 | You *can* do this with an LLM. Hammer, screw — depicted, not named (LAW 0d) | `SPLIT_PATHS` |
| 17 | Quiz: which of these four jobs actually needs a sentence back? Question → pause invitation → `Ready?` → answer (LAW 0e-q) | `QUIZ_CARD` |
| 18 | **REC** — "Frontiers, Old and New," row by row. The spine of the video | `rec:jev-blog#table` |
| 19 | **The core picture.** Tokens emitted one at a time, chained, a clock ticking — against four typed slots filling on one pulse | ★ `PARALLEL_SAMPLER` |
| 20 | The answer space declared *before* the question. Nothing is rejected, because nothing else can be made | ★ `DECISION_SLOTS` |
| 21 | What we do today: generate a string, then stand a validator in front of it, and sometimes it bounces | `TYPE_GATE` (deliberate — it depicts the **LLM** mechanism) |
| 22 | "But my model already has JSON mode." The schema constrains the decoder; the model still emits one token at a time and still bills you | `API_REQUEST_RESPONSE` |
| 23 | RLHF trains for what a person would rather read. RLCD trains for a probability honest about itself | `MODEL_STAGES` (2nd) |
| 24 | **REC** — their own animation of calibrated decisions, on the homepage | `rec:jev-home#calib` |
| 24b | What "calibrated" actually means, which their loop doesn't say: a hundred decisions sorted by confidence, accuracy tracking the claim | `PICTOGRAM` |
| 25 | **REC** — the docs quickstart, taught line by line, and the response with `probabilities` and `confidence` | `rec:jev-docs#quickstart` |
| 26 | The three primitives, and the Noul question answered — through Vercel's API it's just `boolean` | `API_REQUEST_RESPONSE` (2nd) |

### ACT 3 — the demos, played (27–35, 4 REC)

| # | beat | cast |
|---|---|---|
| 27 | Chapter: what it looks like when it runs | `CHAPTER` |
| 28 | **REC — the side-by-side in full**, and the figures printed beside it: $0.000081 against $0.013880, 0.114 seconds against 8.566. Read off the frame | `rec:jev-home#sbs` |
| 29 | What you just watched, against the picture from earlier: parallel resolution versus a token stream | ★ `PARALLEL_SAMPLER` (2nd) |
| 30 | **REC — Doom, playing.** A bot reacting to structured game state | `rec:jev-blog#doom` |
| 31 | Ten queries a second, about seven dollars an hour — their engineer's own figure, from the post | `STAT_CALLOUT` |
| 32 | **REC — Wikiracing, playing.** Hundreds of links a hop | `rec:jev-blog#wikirace` |
| 33 | Why that's the sharper demo: with high-cardinality choice a hallucinated option is fatal. The ceiling is 255 — above it, score first, then choose | `RETRIEVAL_RANK` |
| 34 | **REC — the smart-home walkthrough** on the docs (the Loom nobody is showing) | `rec:jev-docs#smarthome` |
| 35 | Speculative fan-out: ask every question up front, including the ones that turn out irrelevant, because they all land in one round trip. Their docs draw the slow alternative for you | `DIAGRAM` (flow) |

### ACT 4 — the receipts, read honestly (36–46, 3 REC)

| # | beat | cast |
|---|---|---|
| 36 | Chapter: extraordinary claims, and the receipts they published | `CHAPTER` |
| 37 | What a "workflow eval" even is: a compute graph in code, and every model gets the same graph | `DIAGRAM` (2nd) |
| 38 | **REC** — evals.typesafe.ai: accuracy against cost, accuracy against time, log scale | `rec:jev-evals` |
| 39 | **REC** — drill into security incidents, and one disagreement | `rec:jev-evals#workflow` |
| 40 | The row nobody quotes: Jev 67.8, Terra 67.9, Sol 74.1, Opus 5 73.1. **It is not the smartest** | `BAR_COMPARE` |
| 41 | Then the other columns: $0.0004 against $0.1761, 0.4 seconds against 37.8 | `COST_METER` |
| 42 | The yardstick: reference answers are the average of Astra and Fable. Two competitors' opinions, which cuts both ways — and they say so | `TEST_MATRIX` |
| 43 | **REC** — their own Nuance boxes, on their own page | `rec:jev-blog#nuance` |
| 44 | **REC** — their Hallucinations section, the loop running | `rec:jev-home#halluc` |
| 44b | What "can't hallucinate" means, and what it doesn't | ★ `DECISION_SLOTS` (2nd) |
| 45 | Structured-output error rates: 0%, 5.73%, 45.5% — and their own admission that the 0% is derived | `EVAL_DASHBOARD` |
| 46 | Which of these you can check yourself, and which you're taking on trust. Said plainly, with the line between them drawn | `RECAP` |

### ACT 5 — the price, checked twice (47–52, 3 REC)

| # | beat | cast |
|---|---|---|
| 47 | Chapter: the number that made everyone look twice | `CHAPTER` |
| 48 | **REC** — the Vercel listing: $0.042 per million in, and a spec line reading **Max output tokens: 0** | `rec:jev-vercel` |
| 49 | **REC** — OpenRouter: the same price, from a second party with no stake in the claim | `rec:jev-openrouter` |
| 50 | Forty-two dollars for a *billion* tokens, and output free. Said the way a person says it | `COST_METER` (2nd) |
| 51 | Make a decision cheap enough and you'll make millions of them — which is the paradox the model is named after | ★ `JEVONS_CURVE` |
| 52 | **REC** — github.com/typesafe-ai: the official SDKs, the star counts, MIT | `rec:jev-github` |

### ACT 6 — where it belongs, and where it doesn't (53–64, 2 REC)

| # | beat | cast |
|---|---|---|
| 53 | Chapter: what people are actually wiring this into | `CHAPTER` |
| 54 | **REC** — LangChain's write-up and the integration docs: `TypeSafeClassifier`, and state that takes messages straight from an agent | `rec:jev-langchain` |
| 55 | Model routing: Jev decides whether a request needs the fast model or the expensive one. Lookups and small edits go left; architecture goes right | `AGENT_HARNESS` |
| 56 | The guardrail: risk-classify a tool call *before* it runs | `RULE_TEST` |
| 57 | One you could build yourself: a gateway deciding which request gets the last of the quota | `STATE_MACHINE` |
| 58 | **REC** — the Claude Code plugin repo, `typesafe-ai/skills` | `rec:jev-github#skills` |
| 59 | And the thing it will never do: tell you why | `MODEL_SHRUG` |
| 60 | Where that matters — a refused loan, a flagged transaction, a rejected claim. There, the explanation *is* the product | `RESPONSIBILITY_SPLIT` |
| 61 | Their own FAQ on what it's bad at: System 2 work, specialised domains, anything generative | `SPLIT_PATHS` (2nd) |
| 62 | And not under a couple of hundred milliseconds — so not high-frequency anything | `SAD_PATHS` |
| 63 | The verdict: what's proven, what's vendor-reported, and what to watch for next | `QUADRANT` |
| 64 | Where to read every bit of this yourself | `OUTRO_CTA` |

**Estimated runtime:** ~23–27 min at the measured 3.05 words/s. Runtime is an output — measure,
then title.

---

## 4. The four builds

Manifest checked first. `MODEL_STAGES`, `TYPE_GATE`, `API_REQUEST_RESPONSE`, `PICTOGRAM`,
`RETRIEVAL_RANK`, `DIAGRAM`, `TEST_MATRIX`, `EVAL_DASHBOARD`, `COST_METER`, `AGENT_HARNESS`,
`RULE_TEST`, `STATE_MACHINE`, `MODEL_SHRUG`, `RESPONSIBILITY_SPLIT`, `SAD_PATHS`, `QUADRANT`,
`TIMELINE` and `BAR_COMPARE` all exist and are honest fits. Nothing non-furniture runs three times.

| ★ | the object the viewer sees | why nothing existing does it |
|---|---|---|
| `SMART_IF` | a real `if` with an empty condition slot, and a judgement dropping into it; then the health JSON arriving and filling it | everything existing would *print* "smart if-statement" as a caption |
| `PARALLEL_SAMPLER` | **the picture of the video**, and it now carries two beats. Top lane: tokens one at a time, chained, a clock ticking. Bottom: four typed slots filling on one pulse | `TOKENIZER` draws only the sequential half; nothing contrasts the two modes in one frame |
| `DECISION_SLOTS` | the answer space declared *before* the question — shaped sockets, only a peg of that shape can exist. Reused at 44 to show the honest limit: the right shape, the wrong choice | `TYPE_GATE` depicts rejection-after-generation, the **LLM** mechanism — which is why it's cast at 21 instead |
| `JEVONS_CURVE` | cost per decision collapsing while call volume explodes past it, the lines crossing | a `LINE_CHART` would plot it; this has to enact induced demand |

Every element on its own `atWord`, no fixed frame intervals (LAW 0i.1). Each new type goes into
`src/showcaseSpec.ts`, reads theme tokens only, and gets MIN/MAX/MIX fixtures at both aspects.

---

## 5. Recording plan — 12 takes, all browser

No terminal takes at all now, which simplifies the shoot: one surface, one set of settings, and
nothing on this machine can leak into a frame.

Global: `surface: browser`, `theme: light` (their pages are light), viewport 1600×900,
`deviceScaleFactor: 4`, **`masterWidth: 3840`**, zooms ≤2×. Every camera move authored as
`{at: '<exact words from the narration>'}`; `check-camera.mjs` must pass. **Every clip carries its
own `sourceNote`** — these are all other people's pages, and several beats cut between sites.

| take | steps | notes |
|---|---|---|
| `jev-tweet` | the thread: tweet 1 → 2 → 3, then play the embedded clip | **needs the logged-in profile.** I'll prompt you to sign in once; x.com refuses fetchers, so it exists only as footage |
| `jev-home` | headline → 193.6×/444.6× → $42 per billion → the chart → **scroll to the side-by-side loop and hold** → the calibrated-decisions GIF → the Hallucinations loop | five animated assets, all autoplay-on-view with `preload="none"`: scroll, settle ~1500 ms, then `holdMs`/`maxHoldMs` 10–12 s. Confirm from a frame that it is PLAYING, not parked on its poster. The workhorse take |
| `jev-team` | Diogo's card read in full → Sasha's card → back out | the beat that pays the title. Frame the sentence, not the photo |
| `jev-manifesto` | "Build Prod, Not God" → the argument under it | short, 20 seconds |
| `jev-blog` | opening question → the "function call" line → the Frontiers table (3 scrolls) → **play the side-by-side** → the Nuance boxes → the FAQ accordion opened | the workhorse take |
| `jev-blog#doom` | click play, let it run | `holdMs: 12000, maxHoldMs: 12000` (per-step override) so the whole hold survives. Confirm from the frame which Vimeo id is Doom |
| `jev-blog#wikirace` | click play, let it run | same |
| `jev-docs` | quickstart → the Python example → the response JSON → the three primitive pages → the fan-out pattern | narrow framing so the response shape is legible at 2× |
| `jev-docs#smarthome` | click play on the Loom | the one nobody else is showing |
| `jev-evals` | both Pareto plots → security incidents → one disagreement | log axes; hold ≥3s, they must be readable |
| `jev-vercel` | price, **Max output tokens: 0**, context "not applicable" | independent listing #1 |
| `jev-openrouter` | the Jev model page, the same price | independent listing #2 |
| `jev-github` | the org → `typesafe-sdk-python` → `system-one-adapter-python` → licence → `skills` | star counts are time-sensitive: read off the shipping frame, never off `FACTS.md` (LAW 3) |
| `jev-langchain` | the blog post → the integration docs page | third-party adoption |

**Assets.** No `si:` logo exists for TypeSafe — fetch an officially licensed mark with
`scripts/fetch-asset.mjs` or declare it under `assetsNeeded`; a lucide glyph is the placeholder,
never the plan (LAW 0b). `si:vercel`, `si:openai`, `si:anthropic`, `si:langchain` for the logo row.

---

## 6. Narration: humane, not AI-ish

**Banned outright:** "dive in", "let's unpack", "in today's video", "buckle up", "game changer",
"revolutionise", "the future of", "it's not just X, it's Y", "here's the thing", "that's the
beauty of it", "seamlessly", "leverage", "landscape", "at the end of the day".

**Also banned** (LAW 0f): defending the footage. No "real", no "measured here". And on this cut
the mirror rule matters more than usual — **never imply we ran it**. The demos are theirs, said
so, every time.

**Cadence.** AI writing has a metronome — everything between twelve and eighteen words. Break it.
Four words. Then a longer one that runs past twenty and takes its time getting where it's going.
Never three consecutive sentences of the same length. A short sentence still has a subject and a
verb — *"There are three things worth knowing here"*, not *"Three things."*

**No reflex triads.** Two. Or five. Or one.

**Contractions throughout.** **Name the thing** — say *Jev*, *that probability*, *the choice
question*; the listener has no scrollback. **React to what's on screen**, in the moment.
**Admit what you didn't know** — *"I read the word Noul four times before I worked out it just
means yes or no."* **Say numbers like a person** — "forty-two dollars for a *billion* tokens".

One genuine pause invitation per chapter. Never as a tic.

---

## 7. Gates

```
takes → a frame pulled from EVERY take → build → bake-rec → anchor-spec
→ retarget-anchors --preflight → preflight.mjs → voiceover.py → sync.mjs
→ retarget-anchors → gates → render-long → thumb → gen-upload-kit
```

`node scripts/preflight.mjs jev-decisions-measured` **before a word is voiced**. Then
`npm run gate`, `check-holds`, `audit-sync`, `check-camera`, `check-recordings --slug`,
`check-field-use`. Warnings are rejections.

**The seal for §6: extend the existing HUMAN-VOICE GUARD in `lint-spec.mjs`** — it already
measures sentence-length spread, pronoun fog, repeated openers and contraction rate, so this adds
the banned-phrase list (including the self-authentication set LAW 0f states and nothing currently
enforces) and a reflex-triad count. Break-test both directions, then run it across
`archify-live-map`, `fluidram-tested` and `uv-getting-started` — if it fires on cuts you liked,
the rule is wrong and I retune it before it gates anything.

`checkSourceShown` wants a recorded beat that navigates to typesafe.ai — scenes 5, 8, 13 and 43
satisfy it comfortably.

---

## 8. Title, thumbnail, shorts

**Title (yours, locked):**
`ChatGPT's Co-Creator Just Released This New Model — 200× Faster, 400× Cheaper`

The HOOK headline shares its distinctive words (linter-enforced): `JEV — 200× FASTER, 400×
CHEAPER`, with "it cannot write a word" as subtext.

Alts to A/B:
- `The AI That Can't Write A Word — And Costs $42 Per Billion Tokens`
- `Jev, Explained From Every Page TypeSafe Published`
- `ChatGPT's Co-Creator Deleted Text Generation. It Got 200× Faster.`

**Thumbnail:** title `200× FASTER · 400× CHEAPER`, badge `JEV` (this satisfies the subject-naming
guard), note `IT CANNOT WRITE A WORD`. Art = a purpose-drawn object, not a screenshot in a tile:
the `PARALLEL_SAMPLER` picture rendered large — a token chain above, four typed slots below —
drawn **free** through `art`, full size, no rounded tile, no shadow box. Logo row along the
bottom. Shorts cover gets the same care.

**Shorts (~50s):** names Jev in the first sentence (LAW 0g applies to shorts too) → the spec sheet
reading **Max output tokens: 0** → what it returns instead → $42 per billion, output free → four
seconds of their side-by-side, attributed → "full breakdown on the channel." Recorded clips carry
`focus: false` in vertical — a 16:9 capture in a 9:16 frame is a reframe, not a crop.

**`meta.seo`:** author `hook` (the description's opening line), `description`, `breakdown`, **both
`tags` and `queries`**, and `sources` listing every URL in `FACTS.md`.

---

## 9. Next step

Nothing is blocked. The only thing I need from you before recording starts is **the X sign-in**,
and only for the `jev-tweet` take — I'll prompt you at that moment. Every other take is a public
page.

Step 2 is the casting board (`scripts/cast.mjs` over the beat map, one pick per beat with a
written reason into `topics/<slug>/casting.md`), then the four builds, then the shoot.
