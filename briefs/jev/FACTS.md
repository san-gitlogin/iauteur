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
