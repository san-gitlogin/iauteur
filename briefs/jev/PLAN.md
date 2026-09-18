# JEV — production plan (v3)

**Slug:** `jev-decisions-measured` · **`meta.subject`: `Jev`** · one long + one shorts
**Locked in the LAW 0 interview (2026-09-18):** moderndark / daylight, background `grid`,
`en-US-AvaMultilingualNeural` at **+8%** (house rate, not a knob), runtime uncapped.
**No sponsor segment.**

Facts and sources: [`FACTS.md`](FACTS.md). Nothing in the cut comes from anywhere else.
The reference transcript is a **fact source only** — every idea in it is carried, none of its
phrasing is.

> **v3 changes.** v2 would have been rejected by three of our own laws: scene 1 never said the
> word "Jev" (LAW 0g, an ERROR), there was no footage in the first three scenes (SHOW THE RESULT
> BEFORE THE METHOD), and the narration plan leaned on "our own numbers, not theirs" — which is
> the self-authentication LAW 0f bans outright. All three are fixed below.

---

## 1. The angle

**We run Jev on camera, and most people covering this can't.** You're not on the early-access
waitlist and you don't need to be: Jev is served through **Vercel AI Gateway** as
`typesafe-ai/jev` via `experimental_evaluate` in AI SDK 7.0.105+, live since Sep 16. That is a
documented, independent route.

Four things the cut has that the coverage doesn't:

1. **A run on screen, with the clock visible.**
2. **A side-by-side race.** One state, one set of questions, Jev and an ordinary LLM started
   together. One lands. The other is still typing. The whole argument in one shot.
3. **The question Jev can't answer.** Same case through an LLM, then *why did you pick that?* —
   and it argues its case for two paragraphs. Jev returns a number and nothing else. That's the
   most useful thirty seconds in the video for anyone choosing between them.
4. **TypeSafe's own caveats, filmed.** Their launch post publishes "Nuance" boxes admitting the
   evals were written by their own capabilities team and that the demo state "paints our model
   in an advantageous light." Nobody is showing that.

**One payoff:** Jev isn't smarter than the frontier models — 67.8% against Sol's 74.1% and
Opus 5's 73.1% — and it wins anyway, by being ~440× cheaper and ~95× faster at the one job
software actually asks a model to do.

**Open loop:** what does a frontier model look like when you take away its ability to speak?

**A note on how that gets said.** LAW 0f: never narrate that your own work is genuine. No "real
terminal", no "measured here", no "our numbers, not theirs". The timer is on screen; it argues
for itself. Provenance lives in `briefs/` and `meta.seo.sources`, never in the presenter's mouth.

---

## 2. The claims, and how each is paid for

Every headline number gets a **receipt beat** (the figure on its own source page, in frame) and,
where it is vendor-reported, a **caveat beat**. Both are scheduled in §3.

| claim | receipt | caveat |
|---|---|---|
| ChatGPT's co-creator built it | his own sentence in the launch post, plus his thread (sc. 4–5) | we read *his* line — "the research behind ChatGPT" — and note "co-inventor" is the press's word |
| 200× faster | typesafe.ai, sc. 5 | sc. 52: their own Nuance box, "on the higher end of real world gains" |
| 400× cheaper | same | same |
| $42 per billion input tokens | typesafe.ai **and** the Vercel listing (sc. 23) | early-access pricing they admit they "can't prove isn't subsidised" |
| It cannot hallucinate | the declared output space, sc. 15 | sc. 53: it can't hallucinate because it doesn't emit language. Different claim from being right |
| 0% type errors | evals site, sc. 54 | their own line: "our number is not empirical" |
| It answers in milliseconds | the clock in frame, sc. 33–34 | one machine, one connection, and the network leg is bigger than the model leg |

**Claims we will not make:** that Jev beats frontier LLMs on intelligence (it doesn't); that it
replaces an LLM; that 193.6×/444.6× are independent; any parameter count, layer count,
architecture detail or context window (undisclosed — Vercel prints "not applicable"); the "$5
free credit" from the reference video (undocumented); and nothing about the `LLaDA` fork in
their GitHub org, which is suggestive and is not evidence.

---

## 3. Shape — 68 scenes, 22 recorded (32%)

Arithmetic first: `OVER-RELIANCE` caps a sub-type at `ceil(0.35 × n)` = 24, so 22 recorded beats
is comfortable and the 46 drawn ones are the plan, not padding. Reference shape is
`archify-live-map`. `REC` = footage · `★` = new component · everything else drawn.

### ACT 0 — the claim (1–6, 3 REC)

| # | beat | cast |
|---|---|---|
| 1 | **"Jev is a frontier AI model that cannot write a single word."** Subject named in the first sentence (LAW 0g). Headline `JEV — 200× FASTER, 400× CHEAPER`, `hookVariant: figure`, `heroAsset` drives the backdrop | `HOOK` |
| 2 | Greet, then the intent: today we open every page TypeSafe has published, get hold of Jev without the waitlist, and put it in front of the same questions an LLM gets | `TITLE_CARD` |
| 3 | **REC — four seconds of the race.** Two panels, one already answered, one still typing. "That's where this ends up." Result before method | `rec:jev-bench#race` (teaser cut) |
| 4 | **REC** — the founder's launch thread. Two years in stealth, a new training method, a model that can't generate text | `rec:jev-tweet` |
| 5 | **REC** — typesafe.ai itself. What it claims, who it's from, 193.6× / 444.6× / $42 per billion, read off the page | `rec:jev-home` |
| 6 | What we answer: what it is, what it costs, what it gives up, whether the numbers hold | `LIST_BUILD` |

### ACT 1 — what a System One model is (7–21, 3 REC)

| # | beat | cast |
|---|---|---|
| 7 | Chapter: the question he's been asking for four years | `CHAPTER` |
| 8 | **REC** — the launch post: "superhuman at chat for years, so where is all the automation?" and "unstructured state in, typed probabilistic decisions out" | `rec:jev-blog#opening` |
| 9 | Your software doesn't want a paragraph. It wants `queue = billing`. An `if` with an empty condition slot | ★ `SMART_IF` |
| 10 | The slot filling: a row of health readings arrives as JSON, and no rule you can write catches "something's off here" | ★ `SMART_IF` (payoff half) |
| 11 | You *can* do this with an LLM. Hammer, screw — depicted, not named (LAW 0d) | `SPLIT_PATHS` |
| 12 | Quiz: which of these four jobs actually needs a sentence back? Question → pause invitation → `Ready?` → answer (LAW 0e-q: ≥9 words of gap, real cue) | `QUIZ_CARD` |
| 13 | **REC** — "Frontiers, Old and New," row by row. This table is the spine of the video | `rec:jev-blog#table` |
| 14 | **The core picture.** Tokens emitted one at a time, chained, a clock ticking — against four typed slots filling on one pulse | ★ `PARALLEL_SAMPLER` |
| 15 | So the LLM is paying for the *shape* of the answer. Jev was told the shape in advance | ★ `DECISION_SLOTS` |
| 16 | What we do today: generate a string, then stand a validator in front of it, and sometimes it bounces | `TYPE_GATE` (deliberate reuse — it depicts the **LLM** mechanism, which is what it's for) |
| 17 | **The objection.** "My model already has JSON mode." The schema constrains the decoder; the model still emits one token at a time and still bills you for them | `API_REQUEST_RESPONSE` |
| 18 | RLHF trains for what a person would rather read. RLCD trains for a probability that's honest about itself | `MODEL_STAGES` |
| 19 | What "calibrated" actually means: a hundred decisions sorted by confidence, and the accuracy tracking the claim | `PICTOGRAM` |
| 20 | **REC** — the docs quickstart, line by line: `Choice`, `Score`, `Noul`, and the response | `rec:jev-docs` |
| 21 | The three primitives: pick one of a set, place a point on a scale, lean toward yes. And the Noul question answered — through Vercel's API it's just `boolean` | `API_REQUEST_RESPONSE` (2nd) |

### ACT 2 — get it, run it, time it (22–37, 7 REC)

| # | beat | cast |
|---|---|---|
| 22 | Chapter: you don't need the waitlist | `CHAPTER` |
| 23 | **REC** — the Vercel listing: `typesafe-ai/jev`, $0.042 per million in, and a spec line reading **Max output tokens: 0** | `rec:jev-vercel` |
| 24 | **REC** — terminal, full frame: `npm i ai@7`, the gateway key, the first call coming back | `rec:jev-setup` |
| 25 | The call taught line by line: `state`, `questions`, the three types, `criteria`. ≥4s per taught line, every term named the first time | `CODE_RUN` |
| 26 | **REC** — run one, a happy customer. Answers land, probabilities spread, clock visible | `rec:jev-bench#happy` |
| 27 | Read the spread. It isn't confident — and on a message like that, low confidence is the correct answer | `CONFIDENCE_GATE` |
| 28 | **REC** — run two: add "none — no routing needed" to the option set. Same message, and it snaps | `rec:jev-bench#none` |
| 29 | The answer space *is* the question. Give it an honest option and it takes it | ★ `DECISION_SLOTS` (2nd) |
| 30 | **REC** — run three: a complaint half in Hindi, half in English, ending in a refund demand | `rec:jev-bench#hinglish` |
| 31 | **REC** — run four: drop the refund line. It flips, and the urgency and frustration numbers move with it | `rec:jev-bench#nore` |
| 32 | Nobody wrote a rule for that language, and nobody had to | `KINETIC_TEXT` over the frame |
| 33 | **REC — the race**, in full, ending on `result.usage` printed | `rec:jev-bench#race` |
| 34 | Two legs to any call: the model's, and the wire's. Watch which one dominates | `STAT_CALLOUT` |
| 35 | Price per million in — and then remember output is zero | `COST_METER` |
| 36 | What that does to a loop that makes ten decisions a request. Both series are arithmetic on the two published prices, and the assumption is spoken out loud (LAW 0f: no invented curve) | `LINE_CHART` (savings variant) |
| 37 | Where we've got to | `RECAP` |

### ACT 3 — what it gives up (38–44, 2 REC)

| # | beat | cast |
|---|---|---|
| 38 | Chapter: now the part the launch post doesn't lead with | `CHAPTER` |
| 39 | **REC** — the nonsense case: a theft, some stolen source code, three departments that all fit badly. It answers from the set it was given | `rec:jev-bench#theft` |
| 40 | **REC** — the same case through an LLM. Then *why did you pick that?* — and it argues. Then we push back, and it holds its reasoning | `rec:jev-llm#why` |
| 41 | Jev can't do that. No trace, no reason, no argument | `MODEL_SHRUG` |
| 42 | Where that matters: a refused loan, a flagged transaction, a rejected claim. In those, the explanation *is* the product | `RESPONSIBILITY_SPLIT` |
| 43 | Their own FAQ on what it's bad at: System 2 work, specialised domains, anything generative | `SPLIT_PATHS` (2nd) |
| 44 | The rule: only ask it things you'd accept an answer to without an explanation | `RECAP` (2nd) |

### ACT 4 — the evidence, read honestly (45–54, 3 REC)

| # | beat | cast |
|---|---|---|
| 45 | Chapter: extraordinary claims, and the receipts they published | `CHAPTER` |
| 46 | What a "workflow eval" even is: a compute graph written in code, and every model gets the same graph | `DIAGRAM` (flow) |
| 47 | **REC** — evals.typesafe.ai: accuracy against cost, accuracy against time, log scale | `rec:jev-evals` |
| 48 | **REC** — drill into security incidents: the questions, the disagreements | `rec:jev-evals#workflow` |
| 49 | The row nobody quotes: Jev 67.8, Terra 67.9, Sol 74.1, Opus 5 73.1. **It is not the smartest** | `BAR_COMPARE` |
| 50 | Then the other columns: $0.0004 against $0.1761, 0.4 seconds against 37.8 | `COST_METER` (2nd) |
| 51 | How the reference answers were made — the average of Astra and Fable. The yardstick is two competitors' opinions, which cuts both ways | `DIAGRAM` (2nd) |
| 52 | **REC** — their own Nuance boxes, on their own page | `rec:jev-blog#nuance` |
| 53 | What "can't hallucinate" means, and what it doesn't. It can't produce a shape you didn't declare. It can absolutely pick the wrong one | `QUADRANT` |
| 54 | Structured-output error rates: 0%, 5.73%, 45.5% — and their own admission that the 0% is derived | `EVAL_DASHBOARD` |

### ACT 5 — the demos they built for fun (55–59, 2 REC)

| # | beat | cast |
|---|---|---|
| 55 | **REC** — press play on Doom and let it run. A bot reacting to structured game state, ten queries a second | `rec:jev-blog#doom` |
| 56 | Ten a second is about seven dollars an hour. Price a frontier model at that rate and the joke stops being funny | `STAT_CALLOUT` (2nd) |
| 57 | **REC** — Wikiracing, playing. Hundreds of links a hop, finishing in fewer steps | `rec:jev-blog#wikirace` |
| 58 | Why that's the sharper demo: with high-cardinality choice a hallucinated option is fatal. The ceiling is 255 — above it, score first, then choose | `RETRIEVAL_RANK` |
| 59 | Both names, and they're the argument: Kahneman's fast thinking, and Jevons, whose coal got cheaper and whose country then burned far more of it | `TIMELINE` |

### ACT 6 — where this belongs (60–68, 2 REC)

| # | beat | cast |
|---|---|---|
| 60 | Chapter: what you'd build with it this week | `CHAPTER` |
| 61 | **REC** — github.com/typesafe-ai: the official SDKs, the star counts, MIT | `rec:jev-github` |
| 62 | **REC** — terminal: `claude plugin marketplace add typesafe-ai/skills`, then the skill invoked | `rec:jev-skill` |
| 63 | Where it sits in a real agent: the big model reasons, Jev decides, code executes | `AGENT_HARNESS` |
| 64 | A concrete one: a gateway in front of several accounts, deciding which request gets the last of the quota — on urgency, on what the session is doing, on what's left | `STATE_MACHINE` |
| 65 | The other one people will reach for first: Jev grading an LLM's answer before it reaches a user | `RULE_TEST` |
| 66 | And where not to put it: anything you must explain to a regulator, anything that needs code written, anything under a couple of hundred milliseconds | `SAD_PATHS` |
| 67 | Make a decision cheap enough and you'll make millions of them | ★ `JEVONS_CURVE` |
| 68 | The verdict, and where to read every bit of this yourself | `OUTRO_CTA` |

**Estimated runtime:** ~25–29 min at the measured 3.05 words/s. Runtime is an output — measure
the finished cut, then title it (a secondary line can promise "under 30 minutes").

---

## 4. The four builds

LAW 0e.8 expects 2–4 new components. I checked the manifest first: `CONFIDENCE_GATE`,
`TYPE_GATE`, `COST_METER`, `EVAL_DASHBOARD`, `AGENT_HARNESS`, `MODEL_SHRUG`, `QUADRANT`,
`RETRIEVAL_RANK`, `RESPONSIBILITY_SPLIT`, `RULE_TEST`, `STATE_MACHINE` and `PICTOGRAM` already
exist and are honest fits. Nothing non-furniture is used three times (SAME PICTURE THRICE).

| ★ | the object the viewer sees | why nothing existing does it |
|---|---|---|
| `SMART_IF` | a real `if` with an empty condition slot, and a judgement dropping into it. Second beat: the health JSON arrives and the slot fills from it | everything existing would *print* "smart if-statement" as a caption |
| `PARALLEL_SAMPLER` | **the picture of the video.** Top lane: tokens emitted one at a time, chained, a clock ticking along. Bottom: four typed slots filling on a single pulse. Same question, same instant, one frame | `TOKENIZER` draws only the sequential half; nothing contrasts the two sampling modes together |
| `DECISION_SLOTS` | the answer space declared *before* the question — shaped sockets, and only a peg of that shape can exist. Nothing is rejected because nothing else can be made | `TYPE_GATE` depicts rejection-after-generation, the **LLM** mechanism — which is exactly why it's cast for beat 16 instead |
| `JEVONS_CURVE` | cost per decision collapsing while call volume explodes past it, the lines crossing | a `LINE_CHART` would plot it; this has to enact induced demand |

Every element on its own `atWord`, no fixed frame intervals (LAW 0i.1). Each new type goes into
`src/showcaseSpec.ts`, reads theme tokens only, and gets MIN/MAX/MIX fixtures at both aspects.

---

## 5. The bench — built before any recording

Act 2 needs a surface where a decision *lands*, not a terminal printing JSON. `briefs/jev/bench/`:

- state on the left, three typed questions under it, editable on camera
- right: a probability bar per option filling as the answer arrives, the confidence figure, and
  a millisecond clock
- **race mode** — same state to Jev and to an LLM at once, two panels, two clocks

Rules it has to obey, because it's going on camera: no key on screen ever (LAW 11); nothing that
identifies you in a frame; light theme to match their pages; type large enough to read at 2×.
**Probe it headlessly before authoring the demo** — press every control, print what changes —
so the beats are written against the UI rather than against my memory of it.

Cost: roughly an evening. Fallback is a full-frame terminal running the same script; the
teaching survives, the moment doesn't. My recommendation is to build it.

---

## 6. Recording plan — 10 demos

**Record before scripting.** Narration is written against frames that exist.

Global: `surface: browser`, `theme: light`, viewport 1600×900, `deviceScaleFactor: 4`,
**`masterWidth: 3840`**, zooms ≤2×. Terminal takes set `"terminalOnly": true` and add **no**
`maximizePanel` step. Every camera move is authored as `{at: '<exact words from the narration>'}`
and `check-camera.mjs` must pass. Every clip on a page we don't own carries its own
`sourceNote` — per clip, not per scene, wherever a beat cuts between sites.

| demo | steps | notes |
|---|---|---|
| `jev-tweet` | the thread: tweet 1 → 2 → 3, then play the embedded clip | **needs the logged-in profile.** I'll prompt you to sign in once before this take; x.com refuses fetchers, so it exists only as footage |
| `jev-home` | headline → 193.6×/444.6× → $42 per billion → the chart | marks on each figure |
| `jev-blog` | opening question → the "function call" line → the Frontiers table (4 scrolls) → both Nuance boxes → **play both Vimeo embeds** | embeds are `controls: true, autoplay: false`; `click` the play control, then `holdMs: 12000, maxHoldMs: 12000` (the per-step override) so the whole hold survives. Confirm from the frame which one is Doom |
| `jev-evals` | both Pareto plots → security incidents → one disagreement | log axes; hold ≥3s, they have to be readable |
| `jev-docs` | quickstart → the Python example → the response JSON | narrow framing so the response shape is legible at 2× |
| `jev-vercel` | price, **Max output tokens: 0**, context "not applicable" | twenty seconds that carry a lot of weight |
| `jev-github` | the org → `typesafe-sdk-python` → `system-one-adapter-python` → licence | star counts are time-sensitive: read off the shipping frame, never off `FACTS.md` (LAW 3) |
| `jev-setup` | `npm i ai@7`, the key, the first call returning | **grep the capture for your name, email, paths and any key-shaped string before a frame is drawn** (LAW 0m.2, LAW 11) |
| `jev-bench` | the six runs plus the race | the centrepiece; diagnose with a 4-step slice first |
| `jev-llm` | the theft case through an LLM, then "why?", then the pushback | full-frame terminal or the bench's LLM panel |
| `jev-skill` | `claude plugin marketplace add typesafe-ai/skills` → install → invoke | full-frame terminal; Claude Code streams |

**Every package installed on camera must appear by name in `meta.seo.sources`** (LAW 0f, enforced):
`ai` (the AI SDK), `system-one-adapter`, `typesafe-sdk`, and the `typesafe-ai/skills` plugin.

**Assets.** No `si:` logo exists for TypeSafe. Either fetch an officially licensed mark with
`scripts/fetch-asset.mjs`, or declare it under `assetsNeeded` — a lucide glyph is the
placeholder, never the plan (LAW 0b). `si:vercel`, `si:openai`, `si:anthropic` are available for
the thumbnail's logo row.

---

## 7. Narration: humane, not AI-ish

You asked for this specifically. Some of it our linter already measures (sentence-length spread,
pronoun fog, repeated openers, contraction rate); the rest is new and becomes a gate in §8.

**Banned outright:** "dive in", "let's unpack", "in today's video", "buckle up", "game changer",
"revolutionise", "the future of", "it's not just X, it's Y", "here's the thing", "that's the
beauty of it", "seamlessly", "leverage", "landscape", "at the end of the day".

**Also banned — and this is the one that catches me** (LAW 0f): never defend the footage.
No "real terminal", no "typed live", no "measured here", no "our own numbers rather than
theirs". A person demonstrating their own screen doesn't argue that it's genuine; only a machine
anticipating the accusation does. The clock is in frame. Let it work.

**Cadence.** AI writing has a metronome — everything lands between twelve and eighteen words.
Break it. Four words. Then a longer one that runs past twenty and takes its time getting where
it's going, because that's what a person sounds like thinking out loud. Never three consecutive
sentences of the same length. And a short sentence still has a subject and a verb — *"There are
three things worth knowing here"*, not *"Three things."* (recorded backfire: 45–57% fragments).

**No reflex triads.** Use two. Use five. Use one.

**Contractions throughout.** "it's", "you'd", "doesn't", "that'll".

**Name the thing.** Say *Jev*, *the choice question*, *that probability* — not "it". The
listener has no scrollback.

**React to what's on screen, in the moment.** When the clock says the answer beat the network,
say so as a person noticing it. When something's underwhelming, say that too — the theft answer
is genuinely a bit rubbish, and pretending otherwise costs more than admitting it.

**Admit what you didn't know.** "I read the word Noul four times before I worked out it just
means yes or no." That buys more credibility than a paragraph of explanation.

**Say numbers the way a person says them.** "Forty-two dollars for a *billion* tokens", with the
stress where a human puts it — never "zero point zero four two per million".

One genuine pause invitation per chapter, at the beat carrying the concept. Never as a tic.

---

## 8. Gates, including the one this adds

```
bench → demos → RECORD (11 takes) → a frame pulled from EVERY take → build → bake-rec
→ anchor-spec → retarget-anchors --preflight → preflight.mjs → voiceover.py → sync.mjs
→ retarget-anchors → gates → render-long → thumb → gen-upload-kit
```

`node scripts/preflight.mjs jev-decisions-measured` **must pass before a word is voiced**. Then
`npm run gate`, `check-holds`, `audit-sync`, `check-camera`, `check-recordings --slug`,
`check-field-use`. Warnings are rejections.

**The seal for §7: extend the existing HUMAN-VOICE GUARD in `lint-spec.mjs`** — it already
measures sentence-length spread, pronoun fog, repeated openers and contraction rate, so this adds
two checks to it rather than a new script: the banned-phrase list above (including the
self-authentication set, which LAW 0f states and nothing currently enforces on narration), and a
reflex-triad count. Break-test both directions, then run it across the cuts you've praised —
`archify-live-map`, `fluidram-tested`, `uv-getting-started`. If it fires on those, the rule is
wrong and I retune it before it gates anything.

And the part no gate does: **pull a still from every new component, every callout, and the top of
every segment, and look at it.** `checkSourceShown` also wants a recorded beat that actually
navigates to typesafe.ai — scenes 5, 8 and 52 satisfy it.

---

## 9. Title, thumbnail, shorts

**Title (yours, locked):**
`ChatGPT's Co-Creator Just Released This New Model — 200× Faster, 400× Cheaper`

The HOOK headline must share its distinctive words (linter-enforced): `JEV — 200× FASTER,
400× CHEAPER`, with the "cannot write a word" line as subtext.

Alts to A/B:
- `The AI That Can't Write A Word — And Costs $42 Per Billion Tokens`
- `I Put Jev Against An LLM. One Finished Before The Other Started.`
- `ChatGPT's Co-Creator Deleted Text Generation. It Got 200× Faster.`

**Thumbnail:** title `200× FASTER · 400× CHEAPER`, badge `JEV` (this is what satisfies the
subject-naming guard), note `IT CANNOT WRITE A WORD`. Art = a set-piece still from the race —
two panels, one finished, one mid-stream, both clocks visible — drawn **free** through `art`:
full size, no rounded tile, no shadow box. Real logo row along the bottom. The shorts cover gets
the same care.

**Shorts (~50s):** names Jev in the first sentence (LAW 0g applies to shorts too) → the spec
sheet reading **Max output tokens: 0** → what it returns instead → $42 per billion, output free
→ the race landing → "full breakdown on the channel." Recorded clips carry `focus: false` in
vertical — a 16:9 capture in a 9:16 frame is a reframe, not a crop.

**`meta.seo`:** author `hook` (the description's opening line — it falls back to `openLoop`
otherwise and opens on a bare question), `description`, `breakdown`, **both `tags` and
`queries`** (a spec with only `queries` ships an empty tag box), and `sources` listing every URL
in `FACTS.md` plus every package installed on camera.

---

## 10. What I need from you

1. **A Vercel account with AI Gateway enabled**, key in the environment. That's the whole access
   story — no waitlist.
2. **An LLM key** for the comparison half. The race and the "ask it why" beat both need one.
3. **The X sign-in** — I'll prompt you right before the `jev-tweet` take; you sign in once in the
   recorder profile and it persists for the shoot.
4. **The bench: build it, or terminal-only?** §5. I'd build it.
