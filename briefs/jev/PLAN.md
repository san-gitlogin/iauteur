# JEV — production plan

**Slug:** `jev-decisions-measured` · **Subject:** Jev (TypeSafe AI) · **Format:** one long + one shorts
**Locked in the LAW 0 interview (2026-09-18):** moderndark / daylight, background `grid`,
`en-US-AvaMultilingualNeural` at +8%, runtime uncapped — author fully, title after measuring.

Facts and sources: [`FACTS.md`](FACTS.md). **Nothing in the cut comes from anywhere else.**

---

## 1. The angle

Every other video this week is reading the tweet out loud. Ours does three things none of
them do:

1. **Opens the primary sources on camera** — the thread, the homepage, the launch post, the
   evals site, the docs, the GitHub org, and Vercel's independent listing.
2. **Films TypeSafe's own caveats.** Their blog publishes "Nuance" boxes admitting the evals
   were written by their own capabilities team and that the demo state "paints our model in
   an advantageous light." Nobody is covering that. Showing a company marking its own
   homework, on their page, is the most credible thing in the video.
3. **Measures one number ourselves.** `typesafe-ai/system-one-adapter-python` runs the exact
   same API against an ordinary LLM and reports `usage.latency` and
   `n_retries_malformed_structure`. We run it on camera. That is the only figure in the cut
   that is ours, and it is the one the audience will trust.

**One payoff:** Jev is *not* smarter than the frontier models — it is level with Terra and
below Sol and Opus 5 — and it wins anyway, by being ~440× cheaper and ~95× faster at the
one job software actually asks an LLM to do.

**Open loop:** what does a frontier model look like when you delete its ability to speak?

---

## 2. The claims, and how each one is paid for

Attractive claims are fine; unpaid ones are not. Every headline number gets a **receipt
beat** (the figure on its own source page, on camera) and, where it is vendor-reported, a
**caveat beat**. Both are scheduled below, not left to good intentions.

| claim | receipt (on camera) | caveat (on camera) |
|---|---|---|
| ChatGPT's co-creator built it | his own sentence in the launch post + his thread | we say "co-invented ChatGPT" is how the press frames it; his own words are "the research behind ChatGPT" — we read HIS line |
| 200× faster | typesafe.ai homepage, scene 4 | scene 33: their own Nuance box — these are "on the higher end of real world gains" |
| 400× cheaper | same | same |
| $42 per billion input tokens | typesafe.ai + **Vercel AI Gateway**, an independent listing | it is early-access pricing they say they "can't prove isn't subsidised" — their words |
| It cannot hallucinate | the docs' declared output space | The Register's point: it cannot hallucinate because it does not emit language — that is a different claim from being right |
| 0% type errors | evals site | their own line: "our number is not empirical" |
| 150 ms in the browser | read off our own frame | our network latency is larger than their compute — say so |

**Claims we will NOT make:** that Jev beats frontier LLMs on intelligence (it does not); that
it replaces an LLM; that 193.6×/444.6× are independent results; any parameter count, layer
count, architecture detail or context window (all undisclosed — Vercel prints "not
applicable"); and nothing about the `LLaDA` fork sitting in their GitHub org, which is
suggestive of the architecture and is not evidence.

---

## 3. Shape — 47 scenes, 16 recorded (34%)

Arithmetic first, per the method: `OVER-RELIANCE` caps any sub-type at `ceil(0.35 × n)`, so
16 recorded beats needs ≥46 scenes. That is *why* there are 31 drawn ones — they are the
plan, not padding. Reference shape is `archify-live-map` (39% footage, "beautifully
crafted"): hook → intent → **the source of truth at scene 3** → mechanism → demo.

`REC` = recorded footage · `★` = new component to build · everything else drawn.

### ACT 0 — the claim (scenes 1–5, 2 REC)

| # | beat | cast |
|---|---|---|
| 1 | A frontier model shipped this week that cannot write a single word. That is not a limitation — it is the product. | `HOOK` |
| 2 | Welcome back. Today we open every official page this thing has, run it, and then measure one half of its claim ourselves. | `TITLE_CARD` |
| 3 | **REC** — the founder's launch thread on X. His own words: two years in stealth, a new training method, a model that can't generate text. | `RECORDED_STEP` `rec:jev-tweet` |
| 4 | **REC** — typesafe.ai. 193.6× faster, 444.6× cheaper, $42 per billion, and the intelligence-vs-cost chart. Read off the page. | `RECORDED_STEP` `rec:jev-home` |
| 5 | What this video answers: what it is, what it costs, what it can't do, and whether the numbers hold. | `LIST_BUILD` |

### ACT 1 — what a System One model actually is (6–16, 3 REC)

| # | beat | cast |
|---|---|---|
| 6 | Chapter: the question he has been asking for four years. | `CHAPTER` |
| 7 | **REC** — the launch post. "Models have been superhuman at chat for years, so where is all the automation?" and "a frontier-intelligence function call: unstructured state in, typed probabilistic decisions out." | `RECORDED_STEP` `rec:jev-blog#opening` |
| 8 | Your software does not want a paragraph. It wants `queue = billing`. Depict a plain `if` that cannot judge, and the same `if` with a judgement in its condition slot. | ★ `SMART_IF` |
| 9 | Fast thinking and slow thinking — as two kinds of question one app asks in a single request, not a book quote. | `SPLIT_PATHS` |
| 10 | **REC** — "Frontiers, Old and New," their comparison table, walked row by row. This table is the spine of the whole video. | `RECORDED_STEP` `rec:jev-blog#table` |
| 11 | **The core picture.** One token at a time, each conditioned on the last — against every declared answer resolving in a single pulse. | ★ `PARALLEL_SAMPLER` |
| 12 | Why that is the whole speed story: the LLM pays for the shape of the answer; Jev was told the shape in advance. | ★ `DECISION_SLOTS` |
| 13 | What today's approach really is: generate a string, then stand a validator in front of it — and sometimes it bounces. | `TYPE_GATE` (reused deliberately: it depicts the *LLM* mechanism, which is exactly what it is for) |
| 14 | **REC** — the docs quickstart, line by line: `Choice`, `Score`, `Noul`, and the response with `probabilities` and `confidence`. | `RECORDED_STEP` `rec:jev-docs` |
| 15 | The three primitives, enacted: pick one of a set / place a point on a scale / lean toward yes. Name "Noul" plainly — it is a yes/no probability, not a boolean. | `ICON_CALLOUT` + `API_REQUEST_RESPONSE` |
| 16 | Confidence 0.94 against a threshold of 0.90: one path automates, the other goes to a human. This is the feature, not the footnote. | `CONFIDENCE_GATE` |

### ACT 2 — run it (17–27, 5 REC) — see §6 for the access fork

| # | beat | cast |
|---|---|---|
| 17 | Chapter: enough reading — let's give it something to decide. | `CHAPTER` |
| 18 | **REC** — a plain positive review, three questions attached. Answers land; read the latency off the frame. | `RECORDED_STEP` |
| 19 | Read the probabilities out loud: 72% technical, 27% sales, and a confidence of 58%. Low confidence on a happy customer is the *correct* answer, and here is why. | `CONFIDENCE_GATE` (2nd and final use) |
| 20 | **REC** — add "none / no department needed" to the choice set. Same message, confidence snaps to 100%. | `RECORDED_STEP` |
| 21 | What just happened: the answer space is the question. Give it an honest option and it takes it. | ★ `DECISION_SLOTS` (2nd use) |
| 22 | **REC** — a complaint written in Hinglish, ending in a refund demand. Billing 63 / technical 37. | `RECORDED_STEP` |
| 23 | **REC** — delete the refund line; it flips to technical at 100%, urgency 31%, frustration near 2. | `RECORDED_STEP` |
| 24 | It did that in a language nobody wrote a rule for. That is the part a regex never gets to. | `KINETIC_TEXT` over the frame |
| 25 | **REC** — the nonsense case: physical theft and one line of source code. It must answer something, and it does. | `RECORDED_STEP` |
| 26 | The honest limit: it cannot tell you why. No trace, no reasoning, no argument — a number and a shrug. | `MODEL_SHRUG` |
| 27 | So ask it only what you would accept an answer to without an explanation. | `RECAP` |

### ACT 3 — the evidence, read honestly (28–35, 3 REC)

| # | beat | cast |
|---|---|---|
| 28 | Chapter: extraordinary claims, and the receipts they published. | `CHAPTER` |
| 29 | **REC** — evals.typesafe.ai: the Pareto plots, accuracy against cost and against time, on a log scale. | `RECORDED_STEP` `rec:jev-evals` |
| 30 | **REC** — drill into one workflow: security incidents, the questions, the disagreements. | `RECORDED_STEP` `rec:jev-evals#workflow` |
| 31 | The table nobody is quoting: Jev 67.8%, Terra 67.9%, Sol 74.1%, Opus 5 73.1%. **It is not the smartest.** | `BAR_COMPARE` |
| 32 | And then the other two columns: $0.0004 against $0.1761, 0.4s against 37.8s. Same accuracy band, three orders of magnitude apart. | `COST_METER` |
| 33 | **REC** — their own Nuance boxes: written by their capabilities team, referenced against Astra and Fable, "on the higher end of real world gains." | `RECORDED_STEP` `rec:jev-blog#nuance` |
| 34 | What "it can't hallucinate" actually means — and what it does not mean. It cannot produce a shape you did not declare. It can still pick the wrong one. | `QUADRANT` |
| 35 | Structured-output error rates: Jev 0%, Opus 5 5.73%, Haiku 4.5 45.5% — and their admission that the 0% is derived, not measured. | `EVAL_DASHBOARD` |

### ACT 4 — the demos they built for fun (36–40, 2 REC)

| # | beat | cast |
|---|---|---|
| 36 | Chapter: what you do with decisions that cost nothing. | `CHAPTER` |
| 37 | **REC** — press play on the Doom demo on their blog and let it run. A bot reacting to structured game state, ten queries a second. | `RECORDED_STEP` `rec:jev-blog#doom` |
| 38 | Ten queries a second is about seven dollars an hour. Price a frontier model at that rate and the number stops being funny. | `COST_METER` (2nd use) |
| 39 | **REC** — the Wikiracing demo, playing. Choosing between hundreds of links per hop, finishing in fewer steps. | `RECORDED_STEP` `rec:jev-blog#wikirace` |
| 40 | Why Wikiracing is the sharper demo: high-cardinality choice is where a hallucinated option is fatal — and Jev's ceiling is 255 options, above which it scores first and chooses second. | ★ `DECISION_SLOTS` variant / `RETRIEVAL_RANK` |

### ACT 5 — use it today (41–47, 3 REC)

| # | beat | cast |
|---|---|---|
| 41 | Chapter: how you actually get hold of this. | `CHAPTER` |
| 42 | **REC** — github.com/typesafe-ai. The official SDKs, the star counts, MIT — read off the frame. | `RECORDED_STEP` `rec:jev-github` |
| 43 | **REC** — terminal, full frame: install the adapter, run the same questions against an ordinary LLM, print latency and `n_retries_malformed_structure`. **Our number.** | `RECORDED_STEP` `rec:jev-adapter` |
| 44 | What that retry counter means for anyone building today, with or without early access. | `LOG_STREAM` |
| 45 | **REC** — terminal: `claude plugin marketplace add typesafe-ai/skills`, then the skill invoked in Claude Code. | `RECORDED_STEP` `rec:jev-skill` |
| 46 | Where this sits in a real agent: the frontier model reasons, Jev decides, code executes. Not a replacement — a layer. | `AGENT_HARNESS` |
| 47 | Jevons paradox, which is where the name came from: make a decision cheap enough and you will make millions of them. Then the verdict and the outro. | ★ `JEVONS_CURVE` → `OUTRO_CTA` |

**Estimated runtime:** ~18–22 min at the measured 3.05 words/s. Per your standing rule, the
runtime is an output — we measure the finished cut, then title it.

---

## 4. The four builds

LAW 0e.8 expects 2–4 new components per episode. I checked the manifest first: `CONFIDENCE_GATE`,
`TYPE_GATE`, `COST_METER`, `EVAL_DASHBOARD`, `AGENT_HARNESS`, `QUADRANT` and `MODEL_SHRUG`
already exist and are honest fits, so they are reused — but never more than twice each
(SAME PICTURE THRICE).

| ★ | the object the viewer should see | why nothing existing does it |
|---|---|---|
| `SMART_IF` | a real `if` statement whose condition slot is empty, and a judgement physically dropping into it | every existing option would *print* "smart if-statement" as a caption. LAW 0d. |
| `PARALLEL_SAMPLER` | **the picture of the video.** Top: tokens emitted one at a time, each chained to the last, a clock ticking. Bottom: four typed slots, all filling on one pulse. Same question, same instant. | `TOKENIZER` shows only the sequential half; there is no component that contrasts the two sampling modes in one frame |
| `DECISION_SLOTS` | the answer space declared *before* the question: shaped sockets, and only a peg of that shape can exist. Nothing is rejected because nothing else can be produced. | `TYPE_GATE` depicts rejection-after-generation — the LLM mechanism. Using it for Jev would teach the wrong thing, which is why it is cast for the LLM beat instead |
| `JEVONS_CURVE` | cost per decision collapsing while call volume explodes past it — the two lines crossing, the name paying off | a `LINE_CHART` would plot it; this has to *enact* the induced demand, and it is the closing image |

Each is anchored per element (`atWord`), no fixed frame intervals — LAW 0i.

---

## 5. Recording plan — 9 demos

Order: **record before scripting.** Narration is written against the frames.

Global: `surface: browser`, `theme: light` (their pages are light), viewport 1600×900,
`deviceScaleFactor: 4`, **`masterWidth: 3840`**, zooms ≤2×. Terminal takes use
`"terminalOnly": true` and **no** `maximizePanel` step.

| demo | steps | notes |
|---|---|---|
| `jev-tweet.json` | the launch thread; scroll tweet 1 → 2 → 3; click play on the embedded side-by-side clip | **needs a logged-in persistent profile** (`profile: out/rec-profile-web`). x.com returns 402 to any fetcher — it is only recordable in a real signed-in browser |
| `jev-home.json` | headline → 193.6×/444.6× → the $42/billion line → the intelligence-vs-cost chart | the claim beat; marks on each figure |
| `jev-blog.json` | opening question → "function call" line → Frontiers table (4 scroll steps) → the two Nuance boxes → **click play on both Vimeo embeds** | the embeds are `controls: true, autoplay: false`, so a `click` on the play button plus `holdMs: 12000, maxHoldMs: 12000` keeps the whole take. Confirm which of the two is Doom by looking at the frame |
| `jev-evals.json` | the two Pareto plots → drill into security incidents → a disagreement | log-scale axes; hold ≥3s, they need reading |
| `jev-docs.json` | quickstart → the Python example → the response JSON | the code beat; `sed`-style narrow framing so the response shape is legible at 2× |
| `jev-vercel.json` | the Jev model page: price, **Max output tokens: 0**, context window "not applicable" | independent listing — 20 seconds of screen time that carries a lot of weight |
| `jev-github.json` | the org page → `typesafe-sdk-python` → `system-one-adapter-python` description → licence | star counts are time-sensitive: read them off the frame that ships, never from `FACTS.md` |
| `jev-adapter.json` | terminal: `pip install 'system-one-adapter[openai]'` → run our script → print latency, `n_retries`, `n_retries_malformed_structure` | **grep the capture for your git name/email and any API key before a frame is drawn** |
| `jev-skill.json` | terminal: `claude plugin marketplace add typesafe-ai/skills` → `claude plugin install` → invoke the skill | full-frame terminal; Claude Code streams, so no bottom-third panel |
| `jev-playground.json` | *Path A only* — the four playground runs of Act 2 | see §6 |

Diagnose every new demo with a 4-step slice before committing to the full run.

---

## 6. The one fork: do we have early access?

**Path A — you have a console.typesafe.ai login.** Act 2 is filmed in the playground, exactly
as planned: the four cases, real latencies read off the frame. Best version of the video.

**Path B — no access.** Act 2 becomes *"here is what it does, measured against the thing it
replaces"* and is filmed in the terminal with `system-one-adapter-python`: identical code,
identical questions, an ordinary LLM behind it, and our own latency and malformed-retry
counts on screen. We then show the playground second-hand via the blog's own recorded
side-by-side, clearly labelled as theirs. Scene count holds; two RECORDED beats move from
browser to terminal. **The video works either way** — Path B is arguably more honest, it
just loses the "watch it answer in 150ms" moment.

Waitlist is at typesafe.ai; Vercel AI Gateway (`typesafe-ai/jev`) is the other door and may
be faster than the waitlist if you already have a Vercel account.

---

## 7. Title, thumbnail, shorts

**Title (yours, locked):**
`ChatGPT's Co-Creator Just Released This New Model — 200× Faster, 400× Cheaper`

Alts to A/B:
- `The AI That Can't Write A Word — And Costs $42 Per Billion Tokens`
- `Jev Explained: The Model That Replaces Your if-Statements (Tested)`
- `ChatGPT's Co-Creator Deleted Text Generation. The Result Is 200× Faster.`

**Thumbnail:** title `200× FASTER · 400× CHEAPER`, badge `JEV`, note
`IT CANNOT WRITE A WORD`. Art = a set-piece still of the real answer panel — probabilities,
confidence, and the latency readout — captured with `scripts/snap.mjs`, full-bleed through
`art`, never a rounded tile. Logo row along the bottom: TypeSafe, OpenAI, Anthropic, Vercel.
The shorts cover gets the same treatment, not a cropped afterthought.

**Shorts (~50s), one cut:** the single most arresting fact, start to finish —
*"this model's spec sheet says max output tokens: zero"* → the Vercel page on screen → what
it returns instead (probabilities + confidence) → $42 per billion, output free → one
playground/adapter answer landing → "full breakdown on the channel." Cut from beats that
already rendered well; no new recording.

**Description sources:** every URL in `FACTS.md`, in the order they appear on screen.

---

## 8. Order of work, and the gates

```
demos → RECORD (9 takes) → pull a frame from every take → build → bake-rec
→ anchor-spec → preflight.mjs → voiceover.py → sync.mjs → gates → render-long
→ thumb → gen-upload-kit
```

`node scripts/preflight.mjs jev-decisions-measured` **must pass before a single word is
voiced** — typecheck, `check-recordings`, `anchor-spec`, `lint-spec`,
`check-narration-visual`. Then `npm run gate`, `check-holds`, `audit-sync`,
`check-field-use`. Warnings count as rejections.

And the part no gate does: **pull a still from every new component, every callout, and the
top of every segment, and look at it.** `checkSourceShown` will also want a recorded beat
that actually navigates to typesafe.ai — scenes 4, 7 and 33 satisfy it.

---

## 9. What I need from you

1. **Early access — yes or no?** Decides Path A vs Path B. Everything else is ready either way.
2. **X login in the recorder profile.** Tweets cannot be fetched; they can only be filmed
   signed in. If you'd rather not sign in on camera, I'll cut scene 3 to the launch post's
   byline instead and we lose the thread.
3. **The long transcript you pasted** — is that your own draft, or another creator's video?
   If it's someone else's, I won't reuse its narration or structure; the playground cases in
   Act 2 are generic enough that we'd run our own anyway.
4. **Sponsor read** — the pasted text has a Trusted Router segment. Include one, and at what
   position? (Convention on your longer cuts is roughly a third in; here that's around scene 17.)
