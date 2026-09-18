# JEV — verified facts and their sources

Fetched 2026-09-18. **Every figure below came off a page I actually fetched.** Nothing is
from memory; nothing is estimated. Column 3 is the discipline that matters: a vendor number
and an independently checkable number are not the same evidence, and the cut must say which
is which out loud.

**Time-sensitive values (star counts, prices, "early access") get re-read off the frame that
ships** — never from this file. This file is what we point the camera at, not what we quote.

## The thing

| fact | value | status |
|---|---|---|
| Model | Jev | official |
| Company | TypeSafe AI | official |
| Founder / CEO | Diogo Almeida | official (blog byline) |
| His claim | "At OpenAI, I helped build the methods that made language models useful at following instructions and talking with people. That work ended up as the research behind ChatGPT." | **his own words, verbatim** — the blog |
| Press framing | "co-inventor of ChatGPT"; equal-contribution primary author of the InstructGPT paper; contributed to GPT-4 | third-party (DataCamp, VKTR, The Register) |
| Model class | System One Model | official |
| Released | Sep 15, 2026 | official (blog dateline) |
| Availability | Early access, waitlist; also on Vercel AI Gateway | official + Vercel |
| Funding | $40M seed, led by DCVC | third-party (The Register, search) |
| Named after | William Stanley Jevons (Jevons paradox); class named after Kahneman's System 1 | official FAQ |
| Stealth period | two years | official |

## The numbers

| figure | value | status |
|---|---|---|
| Speed vs frontier LLMs | 40×–200× faster on System One-shaped queries | **vendor** |
| Homepage headline | 193.6× faster, 444.6× cheaper | **vendor**, and the blog's own Nuance box calls these "on the higher end of real world gains" |
| End-to-end latency | 70 ms – 500 ms | vendor, "run from our laptops on the West Coast" |
| LLM baseline latency | 3 – 329 seconds | vendor |
| Side-by-side demo | TypeSafe $0.000081 / 0.114 s vs LLM $0.013880 / 8.566 s | vendor (the recorded demo) |
| Input price | $0.042 / MTok = **$42 per billion** | official — and independently listed |
| Output price | $0 — "too cheap to meter" | official |
| Vercel AI Gateway listing | `typesafe-ai/jev`, $0.042/1M input, **Max output tokens: 0**, context window: not applicable, type: "evaluation" | **independent third party** — this is the strongest price/shape evidence in the video |
| vs Fable 5.1 input price | 238× lower | vendor |
| LLM input price range they quote | $0.20 – $10 / MTok | vendor |
| Type errors | 0% — "schema matching is guaranteed… mathematically impossible" to falsify | official, and the blog admits "our number is not empirical" |
| Choice cardinality ceiling | 255 (above that: a 2-stage score-then-choose, hence occasional slowdown) | official |

## The workflow evals (evals.typesafe.ai)

Four workflows: **security incidents, agent-trace observability, invoice processing,
customer service**. Reference answers = the average of GPT-6 Astra and Fable 5.1.

| model | accuracy | cost/case | latency |
|---|---|---|---|
| Jev | 67.8% | $0.0004 | 0.4 s |
| GPT-5.6 Terra | 67.9% | $0.0304 | 10.1 s |
| GPT-5.6 Sol | 74.1% | $0.0836 | 23.3 s |
| Claude Opus 5 | 73.1% | $0.1761 | 37.8 s |

Structured-output error rate: Jev 0%, Opus 5 5.73%, Haiku 4.5 45.5%.

**The caveats are TypeSafe's own, published on their own page** — film them:
- "they were made by individuals on our model capabilities team, so some bias could exist"
- reference = average of Astra and Fable, which "biases answers towards OpenAI and
  Anthropic's models. We likely underestimate the relative performance of our model and
  DeepSeek's models"
- LLM hallucination numbers come from OpenRouter, "there almost certainly is bias here"
- the side-by-side state is "short, dense" and "paints our model in an advantageous light"

Note the honest reading of the table: **Jev is not the most accurate.** It is level with
Terra and *below* Sol and Opus 5 — while costing ~440× less than Opus and answering ~95×
faster. That is the real claim, and it is more interesting than "better".

## The three primitives

| type | what it does | response field |
|---|---|---|
| `Choice` | pick one of a declared set | `choice` + `probabilities` per option + `confidence` |
| `Score` | numeric / rubric rating | `score` + `confidence` |
| `Noul` | yes/no | `noul` (a probability, 0–1) |

Real response shape from the docs quickstart:

```json
{"answers": {
  "department":  {"choice": "billing", "probabilities": {"billing": 0.84, "technical": 0.159, "sales": 0.001}, "confidence": 0.596},
  "frustration": {"score": 1.035, "confidence": 0.842},
  "is_urgent":   {"noul": 0.999}
}}
```

Endpoint `POST https://api.typesafe.ai/v1/systemone`, model alias `jev-latest`, auth
`TYPESAFE_API_KEY`, `pip install typesafe-sdk`.

## Official GitHub (github.com/typesafe-ai) — read stars off the frame at record time

| repo | ★ at 2026-09-18 | why it matters to us |
|---|---|---|
| `skills` | 122 | **Claude Code plugin** — `claude plugin marketplace add typesafe-ai/skills` |
| `typesafe-sdk-js` | 90 | official JS SDK, MIT |
| `system-one-adapter-python` | 82 | **the one that unlocks this video** — see below |
| `typesafe-sdk-python` | 56 | official Python SDK |

`system-one-adapter-python` is "a drop-in replacement for `typesafe_sdk`'s `system_one` API,
backed by LLM APIs instead of TypeSafe… useful for comparing TypeSafe against an LLM on
cost/speed/intelligence." Its response adds `usage.latency`, `n_retries` and
**`n_retries_malformed_structure`**.

That means **we can measure the LLM half ourselves, on camera, with no JEV access at all** —
same questions, same code, our own latency and our own count of malformed structured
outputs. It is the only number in the whole video that is ours.

## Media we can put on screen

| asset | where | note |
|---|---|---|
| Doom demo | Vimeo embed on the launch blog, `controls: true, autoplay: false` | a bot playing Doom off structured game state; ~10 queries/sec ≈ **$7/hour**, per the blog |
| Wikiracing demo | second Vimeo embed, same blog | hundreds-to-thousands-of-links choices; Jev finishes in fewer steps |
| Side-by-side demo | on the blog + the homepage | Jev's answers resolving at once vs a token stream |
| Founder's launch thread | x.com/CompleteSkeptic | needs a logged-in recorder profile |
| Company account | x.com/typesafeai | |
| Evals scatter plots | evals.typesafe.ai | accuracy vs cost, accuracy vs time, log scale |

## Sources

- https://typesafe.ai/ — homepage
- https://typesafe.ai/blog/introducing-system-one-models-and-jev — the launch post
- https://evals.typesafe.ai/ — the workflow evals
- https://docs.typesafe.ai/introduction/quickstart — quickstart, code, response shape
- https://vercel.com/ai-gateway/models/jev — independent listing
- https://github.com/typesafe-ai — official org
- https://x.com/CompleteSkeptic — Diogo Almeida
- https://www.datacamp.com/blog/system-one-models-jev
- https://www.theregister.com/ai-and-ml/2026/09/16/typesafe-ai-debuts-model-for-machines-that-plays-doom/5296711
- Medium — Mehul Gupta, "Jev AI is 200x Faster than ChatGPT" (the article that started this)

**Could not fetch programmatically:** x.com returns 402 to fetchers, and the shared
playground link (`console.typesafe.ai/playground?share=…` on the blog) 307-redirects to
`/login`. Both are recordable in a logged-in browser; neither is quotable from here.

---

## The access route (found 2026-09-18 — this changes the video)

**Jev is callable today without the TypeSafe waitlist**, through Vercel AI Gateway.

- Model id: `typesafe-ai/jev` · requires **AI SDK 7.0.105+** · `experimental_evaluate` from `ai`
- Evaluation is **AI SDK only** — not available over the OpenAI-, Anthropic- or
  Cohere-compatible endpoints
- Billed per token at the model's rates; `result.usage` returns `{inputTokens, outputTokens}`
- Vercel changelog: "TypeSafe AI's Jev now available on AI Gateway", Sep 16, 2026

```typescript
import { experimental_evaluate as evaluate } from 'ai';

const result = await evaluate({
  model: 'typesafe-ai/jev',
  state: 'My card was charged twice for one order.',
  questions: {
    route:    { type: 'choice',  instructions: 'Route this support ticket.',
                criteria: { billing: 'payment or charge problems',
                            shipping: 'delivery problems',
                            technical: 'application bugs' } },
    urgency:  { type: 'score',   instructions: 'How urgent is this ticket?',
                criteria: ['low', 'medium', 'high'] },
    refunded: { type: 'boolean', instructions: 'Was a refund requested?' },
  },
});
// route:    { type: 'choice',  choice: 'billing', probabilities: {billing: 1, shipping: 0, technical: 0} }
// urgency:  { type: 'score',   score: 2.97, probabilities: {'0': 0, '1': 0, '2': 0.02, '3': 0.98} }
// refunded: { type: 'boolean', probability: 0.99 }
```

**A naming detail worth a beat:** TypeSafe's own SDK calls the yes/no type `Noul`; the AI SDK
surface calls it `'boolean'` and returns `probability`. The reference video asks out loud why
it isn't just called boolean — through Vercel, it is. `state` also accepts an object or an
array, not only a string, so structured records go in as-is.

## From the reference video — VERIFY ON CAMERA BEFORE IT SHIPS

These came from the transcript, not from a page I fetched. Each is useful; none goes on
screen until it has been confirmed from a source in frame.

| item | status |
|---|---|
| "$5 of free credit" on early access | **unverified** — no free-credit programme is documented anywhere I could find. Do not say it |
| DeepSeek V4.1 Flash at $0.15 / M input (≈3.5× Jev) | **verify on its pricing page before the comparison beat** |
| Playground UI wording, confidence figures (72/27/1, 58%, etc.) | those are *his* runs. Ours will differ — every number we speak comes off our own frame |
| "150 ms model, 357 ms network, on a VPN" | the shape of the point is right and we reproduce it with our own numbers |
| ~290 tokens of JSON in the response | ours will differ; read `result.usage` on camera instead |
| Jev picked "technical, 87%" for the theft case | our run decides; the *teaching* point (it must answer something from the set it was given) holds regardless |

Ideas taken from the reference video and kept, rephrased in our own terms: the smart
if-statement framing, the health-data example, the hammer-and-screwdriver point, the
"can't tell you why" comparison against an LLM, the multi-account routing use case, and
the trading caveat. **No phrasing is reused.**

---

## Additional primary sources (added 2026-09-18, after the no-payment decision)

**typesafe.ai/team — TypeSafe's own words on the founders.** This is what pays the title claim,
and it is on their page rather than a journalist's:

> "Diogo co-invented RLHF and InstructGPT, the methods that lead to ChatGPT and GPT4.
> Previously, he was at Google Brain."

COO **Sasha Sheng**, ex-research engineer at Meta/FAIR (News Feed, AI Experiences, AI Research),
published at NeurIPS and ECCV. Manifesto page headline: **"Build Prod, Not God."**

**LangChain — "Building a harness with Jev"** (third-party engineering write-up, user-supplied):
- official integration package `langchain-typesafe` (PyPI 0.0.1a2), exposing `TypeSafeClassifier`
- `state` accepts text, structured data, or LangChain messages
- two middleware patterns shown: **model routing** (Jev decides fast model vs powerful model —
  "direct lookups, extraction, and localized changes" to the fast one, "architecture and
  high-stakes decisions" to the capable one) and **AutoModeMiddleware** (Jev risk-classifies a
  tool call before it executes, as a guardrail on bash and similar)
- *"Adding questions barely changes the response time and costs only the tokens for the extra
  questions, which are cheap."*
- named adoption: browser agents, trading, email triage
- verdict: *"We're pretty thrilled about Jev and the possibilities that come with it."*
- **note:** their "200x faster and 400x lower cost" line is quoted FROM TypeSafe, not measured by
  LangChain. Attribute it that way on screen.

**Every playable demo video, confirmed in the page source:**

| video | host | where |
|---|---|---|
| side-by-side (Jev vs LLM) | Vimeo | launch blog |
| Doom | Vimeo `1227495732` | launch blog |
| Wikiracing | Vimeo `1227495711` | launch blog |
| smart-home assistant | Loom `18c4dbcf8db546dfb2d7f2ef018e78e4` | docs.typesafe.ai/demos/smart-home |

All are `controls: true, autoplay: false` — a click on the play control plus a long per-step
`holdMs`/`maxHoldMs` records them playing. Confirm from the frame which Vimeo id is Doom.

**Speculative fan-out** (docs/patterns) — the pattern the smart-home demo teaches: ask every
question up front, including ones that turn out irrelevant, because they all resolve in one
parallel request and code filters afterwards. The docs spell out the slow alternative
(sequential API calls, each waiting on the last) — a ready-made picture.

## Access: settled, with evidence

There is **no free route to running Jev**. Verified from the APIs, not from marketing:

- `GET https://ai-gateway.vercel.sh/v1/models` returns `typesafe-ai/jev` with
  `pricing: {input: "0.000000042", output: "0"}`, `context_window: 0`, `max_tokens: 0`,
  `type: "evaluation"`. Non-zero input price, so it is not a free-tier model.
- OpenRouter carries it in beta (`~typesafe/jev-latest`, `typesafe/jev-1.13`); it is absent from
  the public `/api/v1/models` list and is paid.
- docs.typesafe.ai has **no** pricing, limits, quota or free-trial page. The reference video's
  "$5 free credit" is documented nowhere and must not be said.
- The console playground is behind `/login`; the shared playground link on the blog 307s there.

Owner's decision, 2026-09-18: **no payment, no hands-on**. The cut is a sourced explainer.
`briefs/jev/bench/probe.mjs` is PARKED — verified working against `ai@7.0.106`, ready if early
access ever arrives, and not used by this video.

## Sources, second batch

- https://typesafe.ai/team · https://typesafe.ai/manifesto
- https://docs.typesafe.ai/demos/smart-home · https://docs.typesafe.ai/llms.txt
- https://www.langchain.com/blog/building-a-harness-with-jev
- https://docs.langchain.com/oss/python/integrations/providers/typesafe · PyPI `langchain-typesafe`
- https://openrouter.ai/typesafe/jev-1.13 · https://vercel.com/ai-gateway/models/jev

---

## The homepage animates the whole argument (owner spotted this, 2026-09-18)

`typesafe.ai` carries **five animated assets**, all `loop muted playsinline preload="none"`
(Framer) — so they autoplay when scrolled into view. No click needed; scroll, settle, hold.

| asset | what sits with it | why it matters |
|---|---|---|
| `<video>` webm | **the side-by-side**, under copy reading *"TypeSafe AI · Cost $0.000081 · Completed in 0.114s"* and *"LLMs · Cost $0.013880 · Completed in 8.566s"*, with the line *"Watch the real video"* | the cost AND the time are laid out beside the animation, so one frame carries the comparison and its numbers |
| `<video>` mp4 | the **Hallucinations** section | their own animation of the type-error / hallucination claim |
| GIF 590×270 | immediately after *"…for calibrated decisions"* | calibration, animated by them |
| GIF 1440×540 | full-width band | section banner |
| GIF 1080×1080 | square, rendered at 260px | section illustration |

**Recording note:** `preload="none"` means the asset only loads once it is in view. The step must
scroll to it, settle ~1500 ms, and only then hold — with `holdMs`/`maxHoldMs` raised to 10–12 s so
a full loop survives the take. Check the frame to confirm it is actually playing and not parked on
its poster.

This is why the side-by-side beats now come off the HOMEPAGE rather than the blog: the blog's copy
of the demo has no figures next to it, and the homepage's does.

---

## Correction from the live probe (2026-09-18) — what the homepage ACTUALLY shows

Probed in a real browser, not read off the HTML. The homepage does **not** print
"193.6× faster / 444.6× cheaper" as text anywhere. Those figures are named on the launch
blog ("this is where the claims of 193.6x faster, 444.6x cheaper on our home page comes
from"), and on the homepage they are inside the *Workflow Intelligence vs. Cost* chart image.

What the homepage does print, with its scroll positions:

| y | content |
|---|---|
| 616 | H1 — "The First (Public) System One Model; Jev Gives AI The Properties Of Code" |
| 2355 | H1 — "We Took The Opposite Research Direction" |
| 3217 | "Decisions, Not Strings" · "Calibrated Confidence" · "More Like Code" (subtexts at 3279) |
| 4583 | "LLMs" · "Watch the real video" |
| 4614 | **Cost $0.000081** (TypeSafe) vs **Cost $0.013880** (LLMs) |
| 4634 | **Completed in 0.114s** vs **Completed in 8.566s** |
| 4764 | `<video webm autoplay=TRUE loop>` — **the side-by-side. It autoplays; scroll and hold, no click** |
| 5654 | H2 — "Jev's Intelligence Per Dollar Is Literally Off The Charts." |
| 5942 | "Workflow Intelligence vs. Cost" · "Hallucinations" |
| 6048 | `<video mp4 autoplay=FALSE loop>` — **the Hallucinations loop. This one needs a click** |
| 6587 | "Zero Hallucinations" · "Machine-Native Intelligence" |
| 7424 | **H2 "$42"** and **H2 "238x"** · 7491: "Per Billion input tokens." / "Lower input price than Claude Fable 5.1" |
| 9319+ | the FAQ, opened by clicking each question |

**The FAQ is the caveat beat, in their own voice.** The questions include, verbatim:
*"How Is This Different From JSON Mode Or Structured Outputs?"*, *"Are These Prices Temporary
Or Subsidized?"*, *"Can Jev Still Get Things Wrong?"*, *"What Is Jev Good At? Where Does It
Struggle?"* and *"Is Jev Deterministic?"* — a company asking itself every question the video
needs to ask. Film these rather than paraphrasing them.

**So:** scene 5 reads $42 and 238× off the homepage; the 193.6×/444.6× pair is read off the
blog where it is actually stated, in the same beat as the nuance that qualifies it.

---

## CORRECTION #2 — read off the homepage's own frames (2026-09-18)

My earlier "the homepage doesn't print 193.6×/444.6×" was **wrong**, and so were the
error-rate numbers I had taken from a third-party summary. Both are now read off the frame.

**The claim and its caveat are in one shot.** `193.6x Faster,` / `444.6x Cheaper.` in huge type,
with `*Based On Workflows For System One Tasks (Proof)` directly underneath it. Film both in the
same beat — the asterisk is theirs, not ours.

**Jev.Cost — "PRICE PER MILLION TOKENS [USD]", their own table, input | output:**

| model | input | output |
|---|---|---|
| GPT-6 Astra (OpenAI) | $10.00 | $50.00 |
| Claude Fable 5.1 (Anthropic) | $10.00 | $50.00 |
| Claude Opus 5 | $5.00 | $25.00 |
| GPT-5.6 Sol* | $4.00 | $20.00 |
| GPT-5.6 Terra | $2.00 | $12.00 |
| Claude Sonnet 5 | $2.00 | $10.00 |
| Claude Haiku 4.5 | $1.00 | $5.00 |
| GPT-5.6 Luna | $0.20 | $1.20 |
| **Jev (TypeSafe AI)** | **$0.042** | **FREE** |

Under it: **$42** "Per Billion input tokens." and **238x** "Lower input price than Claude Fable 5.1".

**Hallucinations — "Structured Output Error Rate", their chart:**

| model | rate |
|---|---|
| **Jev-1.0** | **0.00%** |
| GPT-5.6 Luna | 0.49% |
| GPT-5.6 Terra | 0.58% |
| Gemini 3.1 Pro | 1.92% |
| GPT-5.6 Sol | 1.93% |
| Gemini 3.8 Flash | 2.38% |
| Claude Opus 5 | 3.76% |
| Claude Fable 5.1 | 7.99% |
| Claude Sonnet 5 | 12.6% |

**A second, DIFFERENT chart in the same loop — "Tool Call Error Rate":** Jev-1.0 0.00%,
Claude Opus 5 0.34%, Claude Fable 5.1 0.80%, Gemini 3.8 Flash 1.88%, Gemini 3.1 Pro 2.64%,
Claude Sonnet 5 3.03%, GPT-5.6 Terra 5.41%, GPT-5.6 Luna 14.3%, GPT-5.6 Sol 22.1%.

**Do not conflate the two.** They measure different things and rank the models differently
(Sonnet 5 is worst on structured output at 12.6%; Sol is worst on tool calls at 22.1%). Say
which chart is on screen.

**~~Structured-output error rate: Jev 0%, Opus 5 5.73%, Haiku 4.5 45.5%~~** — struck out. Those
came from DataCamp's write-up and do not match TypeSafe's own published chart. The numbers above
are the ones on the page, and the page wins.

**Also on the homepage:** a "Pareto.Curve" panel (accuracy vs avg cost per workflow, log x-axis)
placing Jev at roughly $0.0004 / ~68% against Sol, Terra, Opus 5, Sonnet 5, Luna, Haiku 4.5 and
two DeepSeek v4 variants — the "not the smartest, and three orders of magnitude cheaper" claim in
a single picture, from their own site. And a "String Tax" panel (TypeSafe AI vs LLM, side by
side) sitting directly beneath the 444.6× block.

**These panels live INSIDE the looping videos**, not in the DOM, so they carry no markable text
and they cycle — a take has to hold 12-15s on each section to catch the panel it wants. The site
renders **pink**, not dark.
