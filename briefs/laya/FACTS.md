# LAYA — the fact base

Slug: `laya-decisions-open` · subject: **Laya** · checked 2026-09-23.
Every figure in the cut comes from this file, and every line here names the page that makes it.
Where a figure is the AUTHOR'S OWN claim rather than something reproducible, it is marked
**[claim]** and must be attributed out loud in the narration.

Pronunciation: **LAH-yah** (Sanskrit/Malayalam *laya*, "rhythm/dissolution"). Goes in
`meta.pronounce`, never in the script (LAW: respell for the voice, not for the reader).
Author: **Nandakishor M** — say "NAN-da-kee-shor". Company: **Convai Innovations**.

---

## 1. The repository — github.com/NandhaKishorM/laya

Read off the GitHub API and the repo page on 2026-09-23.

| fact | value |
|---|---|
| description | "Non-autoregressive System 1 decision engine. Typed choice, score and yes/no decisions over any text in a single forward pass, in 100+ languages, with a router that picks the right checkpoint per request." |
| stars | **18,522** |
| forks | 1,566 |
| open issues | 96 |
| watchers | 79 |
| contributors | **33** |
| licence | **Apache 2.0** |
| language | Python |
| created | **2026-09-18** |
| last push | 2026-09-23 |
| homepage | huggingface.co/convaiinnovations/laya |

**The number that carries the story: the repo is five days old.** Created 2026-09-18,
18.5k stars by 2026-09-23. TypeSafe launched Jev on 2026-09-15.

PyPI `laya`: version **0.3.7**, requires Python **>=3.10**, **17 releases** between
2026-09-18 and 2026-09-23. Summary: "Fast, non-autoregressive System 1 decision engine with
calibrated probabilities."

Hugging Face `convaiinnovations/laya`: **2,800 likes**, created 2026-09-18, licence apache-2.0,
pipeline `text-classification`.

---

## 2. What it is (README, top)

> "Multilingual, non-autoregressive System 1 decision engine. Typed decisions over 100+ languages
> in a single forward pass — 33 ms — trained with reinforcement learning against strictly proper
> scoring rules (RLCD), with a router that picks the right checkpoint per request."

Laya evaluates typed questions (`choice`, `score`, `noul`) over any state — text, email, ticket
or JSON document — in a single forward pass. **33 ms for one question, 7.2 ms/question batched,
measured on a T4.** No text generation, so nothing to parse and nothing to hallucinate.

### The three primitives (README, "Decision Primitives")

| primitive | output | use cases |
|---|---|---|
| `choice` | top label, probabilities per option, confidence | department routing, intent classification, topic categorisation |
| `score` | expected level on an ordinal rubric, distribution, confidence | frustration level, ticket urgency, harm severity |
| `noul` | calibrated probability P(true), 0.0–1.0 | phishing, spam, jailbreak detection, churn risk |

`noul` is the repo's own name for the boolean primitive — it is Jev's name for it too, and it is
what keeps the two wire-compatible.

### Three checkpoints and a Router (README table)

| checkpoint | encoder | params | context | for |
|---|---|---|---|---|
| `laya` | ModernBERT-large | 421M | 512 | English |
| `laya-multilingual` | mmBERT-base | 322M | 1024 | 100+ languages, 2× faster |
| `laya-typed-decisions` | ModernBERT-large | 421M | 1024 | the typed-decisions workflows |

Weight files, from the HF API: `laya` **843 MB**, `multilingual` **644 MB**,
`typed-decisions` **843 MB** — 2.37 GB for all three.

---

## 3. The architecture (dev.to engineering write-up) **[author's own write-up]**

"I Built Non-Autoregressive Decision Models a Year Ago. Then a Frontier Lab Called It a
'Breakthrough'." — published **2026-09-18**, by Nandakishor M.

- Encoder: **ModernBERT-large**, 395M params, **28 layers**, hidden dim 1024, 16 heads, GeGLU,
  RoPE to 8,192 tokens. **Bidirectional** — every token attends to the whole state and every
  option at once.
- Decision head transformer: ~25.2M params, 2 layers.
- Option scorer: ~1.05M params. One scalar logit per option.
- Act/escalate head: ~0.26M params.
- **Total 421M.**

**The `[MASK]` mechanism — this is the beat that explains "single forward pass".**
The prompt is packed as:

```
[CLS] choice question: Which team should handle `body`? [SEP]
[MASK] billing: payments [MASK] tech: bugs [MASK] other: general [SEP]
{"subject": "Refund request", "body": "I was billed twice..."} [SEP]
```

Every option gets its own `[MASK]` token. After the encoder and the decision head, the hidden
states at exactly those marker positions are gathered, projected to one scalar each, and
softmaxed. **The answer is read out of the sequence, not generated after it.** Five questions
about one email collate into one batch and go through ModernBERT once.

**Confidence is normalised entropy**, not a number the model writes:
`Confidence = 1 - H(p)/log(K)`. All options equal → **0.00**. One option at 1.0 → **1.00**.

**RLCD**: Reinforcement Learning for Calibrated Decisions. Trained with a **strictly proper
scoring rule** as the reward — a rule whose expected score is uniquely maximised when the
reported distribution equals the true one, so the model is paid most for being honest.
Composite reward = log score + 0.5 × spherical − 1.0 × ranked probability score. Pure policy
gradient (GRPO-style group baseline, 8 noisy samples per question), **zero supervised
cross-entropy**.

Why not plain cross-entropy or naive RL: CE is minimised only as the winning logit runs to
infinity, and a binary +1/0 reward pushes the top probability to 1.0 and everything else to 0.
**Both maximise accuracy by destroying calibration.**

Act head cost matrix: correct **+1.0**, incorrect **−3.0**, escalate **−0.5** → acting pays only
when `P(correct) > 2.5/4.0 = 0.625`. The policy learns the **62.5%** threshold on its own.

---

## 4. The story (dev.to) **[author's own account — attribute every sentence]**

- March 2025: arXiv **2503.23303**, RL over conversion trajectories; weights and an open dataset
  on Hugging Face; a PyPI package; a write-up on r/LocalLLaMA.
- September 2025: arXiv **2510.01237** — schema-based decisions guided by reinforcement learning.
- September 2026: TypeSafe AI, founded by **Diogo Almeida** (a co-inventor of ChatGPT at OpenAI),
  launches **Jev** — "the exact same non-autoregressive decision concept", in his words,
  "without technical papers, without open weights, and with zero open training datasets."
- His own summary of the difference: his earlier model used PPO over sequence representations for
  turn-by-turn conversion in vertical sales conversations; Jev generalised it horizontally.
- His words, and worth quoting exactly because it is the emotional spine of the video:
  *"It is incredibly frustrating when something you poured your heart into for months as an
  open-source researcher gets overlooked because it was built for a vertical use case, while a
  funded lab packages the same core idea horizontally and gets all the glory. But that is the
  open-source story in general."*
- What he did next: rebuilt it horizontally, open, on a bidirectional encoder. Laya.

**We do not adjudicate the priority claim.** We say what he published and when, we say what
TypeSafe shipped and when, and we let the dates stand. No accusation is made in our own voice.

---

## 5. Speed (README "Speed", measured on a Tesla T4)

| questions per call | `laya` | `laya-multilingual` |
|---|---|---|
| 1 | 39.5 ms | **32.8 ms** |
| 5 | 84.5 ms | **40.1 ms** |
| 10 | 158.6 ms (15.9 ms/q) | **72.3 ms (7.2 ms/q)** |
| 50 | 771 ms | **337 ms (6.8 ms/q)** |

Batched throughput **103–332 questions/sec on a single T4**.

Jev, **independently measured by two third parties** — AbdelStark/jev-benchmarks and
nibzard/decision-model-benchmark — at **236–276 ms p50**. So Laya answers a single question
roughly **6–7× faster**, and the repo says so in those words.

**CPU is slower and the repo says so**: `Router(preload=True)` is 32.8 ms on GPU but
**193–464 ms on CPU**. Our own demo runs on CPU — we say the CPU number out loud and never
claim the T4 one for our own footage.

---

## 6. Laya vs Jev (README, "Laya (with routing) vs Jev")

The repo's own framing, which we repeat: every Laya figure is what `Router().predict(...)`
actually returns. **Jev figures are third-party published, never measured in that repo** — no
TypeSafe API access — so sample sizes and prompts differ.

| | Jev 1.13.0 | Laya (routed) | |
|---|---|---|---|
| typed-decisions, 2,000 decisions | 0.727 | **0.766** | +0.039 |
| AG News, 4 labels | 0.910 | **0.950** | +0.040 |
| DAIR Emotion, 6 labels | 0.480 | **0.595** | +0.115 |
| **Banking77 (72 vs 77 labels)** | **0.870** | 0.425 | **Jev leads** |
| ECE *(lower better)* | 0.246 | **0.081** | 3× better, post-temperature |
| p50 latency, 1 question | 236–276 ms | **32.8 ms** | 7.8× faster |
| languages usable | no published benchmark | **45 of 51** | — |
| weights | closed API | **Apache 2.0** | — |
| cost | $0.042 / 1M tokens | **$0 self-hosted** | — |

On DAIR Emotion, **Jev assigned zero probability to the true label on 16% of examples** — a hard
failure for anything branching on confidence.

---

## 7. The honest limits — the repo's own section, and the reason this video is trustworthy

README has a heading literally called **"Honest limits"**. It must be filmed, because a review
that only reads the wins is an advert.

1. **The base checkpoints are near chance on typed-decisions zero-shot** — 0.362 and 0.352
   against a 0.318 random baseline and a **0.461 majority-class baseline**. They sit *below*
   always-guessing-the-most-common-answer. The 0.766 headline comes from the checkpoint
   **fine-tuned on that benchmark's own training split**. The repo's own words: *"Laya is a fast
   base to specialise, not a zero-shot decision engine."*
2. **High-cardinality choice questions lose.** Options share a fixed `head_max_len` budget — 192
   tokens on English, 256 on multilingual — so Banking77's 77 options get `(256-16)//77` ≈
   **3–4 tokens each** and the labels stop being distinguishable. 0.425 against Jev's 0.870.
   **Jev supports up to 255 options out of the box.** Fixes offered: raise `head_max_len` to 512,
   shortlist with embeddings (`predict_shortlist`), or split the label set.
3. **`score` is the weakest primitive** — SST-5 0.372.
4. **`noul` can follow its own option labels instead of the state** (issue **#156**), most
   strongly on the English checkpoint: a confident "no" for clearly positive input. The repo's
   workaround is to ask it as a two-option `choice` with neutral keys. *A shipped bug, printed
   by the author, in the README.*
5. **`laya-multilingual` has a position bias on `score`** (issue **#131**) — it rarely picks the
   first-listed level, in any language.
6. **`action.act_probability` carries no usable signal yet** (issue **#185**): reads 1.0 for
   almost every input, AUROC **0.30** against correctness. Gate on `confidence` instead, which
   reaches AUROC **0.77** on the same items.
7. **Both checkpoints are over-confident as shipped.** Refitting one temperature per (question
   type, option count) moves mean ECE **0.466 → 0.081** (`laya`) and **0.314 → 0.106**
   (`laya-multilingual`). **`laya-multilingual` ships with no fitted temperatures at all**, so
   fit them before trusting its probabilities.

---

## 8. Why the Router exists (README, "Why Route: The Evidence")

Shared benchmark, 17,416 questions, one T4, identical questions per model:

| benchmark | English `laya` | `laya-multilingual` | `Router` |
|---|---|---|---|
| MASSIVE intent, English | **0.783** | 0.657 | **0.783** |
| MASSIVE intent, 13 other languages | 0.306 | **0.451** | **0.451** |
| XNLI, English | **0.860** | 0.843 | **0.860** |
| XNLI, 14 other languages | 0.521 | **0.731** | **0.731** |
| languages usable (>3× random) | 23 / 51 | 45 / 51 | **45 / 51** |
| latency, 1 question | 39.5 ms | **32.8 ms** | **32.8 ms** |

**The killer line, and the reason routing is a mechanism and not a convenience:**
the English checkpoint scores **0.000 accuracy on Khmer at 0.952 confidence.** Wrong every
single time, and 95% sure of itself. *Confidence gating cannot save you* — so the decision has
to be made **before** the forward pass. The router detects script in **under 0.5 ms of pure
Python**, no model involved.

Across all 51 languages the English checkpoint macro-averages **0.227** with macro ECE 0.733.

Routing is **by script**, and the repo is explicit that this is a limitation too: Latin-script
Spanish or Portuguese is answered by the English checkpoint unless you set
`Router(default="multilingual")` or pass `lang_guess=`.

---

## 9. Free, and drop-in for Jev

**Self-hosting (README, "Self-Hosting: HTTP Server (Jev-compatible)")**
`pip install "laya[serve]"` then `laya-serve` → binds 0.0.0.0:8000, speaks **`POST /v1/systemone`**,
the same wire protocol as TypeSafe's hosted Jev API. The answer payload is schema-identical —
`choice`/`score`/`noul` answers plus a `{input_tokens, output_tokens}` usage block — so an
existing Jev client **changes its `baseUrl` and nothing else**. The repo names a real one that
works this way: the `hs-jev` Haskell client.

**Hosted, also free**: impossibl serves Laya at `https://api.impossibl.com/v1/systemone`,
wire-compatible with TypeSafe's System One API, at `max_len` 8192, unmodified checkpoints.

**Cost, said plainly**: Jev is **$0.042 per million input tokens**. Laya self-hosted is **$0**,
and runs on a commodity GPU, Apple MPS, or plain CPU.

---

## 10. Built-in workflow presets (README) — the use-case act

```python
laya.router_questions()      # 1. route a request to a small or a frontier model
laya.guard_questions()       # 2. prompt guardrails: jailbreaks, injections, leaks
laya.moderation_questions()  # 3. content safety: toxicity, harassment, threats
laya.triage_questions()      # 4. support triage: intent, urgency, frustration, churn
```

**Confidence gating**, the pattern the whole thing exists for:

```python
if conf >= 0.85:
    route_automatically(dept)       # no human in the loop
else:
    escalate_to_human_agent(dept, reason=f"Low confidence ({conf:.2f})")
```

**Community tools already built on it** — proof of adoption, on third-party pages:
- `omp-laya-judge` — an oh-my-pi plugin: local System-1 judge MCP server, **0 tokens, ~0.3 s on CPU**.
- `laya-adk-toolkit` — Google ADK tools that call Laya's typed decisions as agent tools.
- `cklxx/laya-browser` — a fine-tune for browser-use/jev-ultrafast: element top-1 among ~45
  candidates **0.10 → 0.66** zero-shot to fine-tuned, real-task success **0% → 62%**, at
  **17–23 ms per step**, on a single 16 GB GPU with no paid API.

---

## 11. What we will NOT say

- That we measured 33 ms. **We ran it on CPU**; the repo's own CPU figure is 193–464 ms and our
  own take shows its own timings on screen. Never borrow the T4 number for our footage.
- That Laya "beats" Jev outright. It wins on the repo's chosen benchmarks and **loses on
  Banking77 by a distance**, which we show.
- That the priority dispute is settled. We report dates and publications, not verdicts.
- Any figure from the dev.to head-to-head table (83.8% macro, 10.4× faster) **as a measured
  fact** — those are the author's launch-day claims, and the repo's own BENCHMARKS.md is more
  conservative. If a dev.to figure is used at all it is said as *"in his write-up he claims"*.
- That Jev is bad. Jev's own numbers are third-party published and its 255-option ceiling is a
  real advantage we state out loud.

---

## 12. Sources, in the order the cut uses them

1. GitHub — NandhaKishorM/laya — https://github.com/NandhaKishorM/laya
2. README "Honest limits" — https://github.com/NandhaKishorM/laya#honest-limits
3. BENCHMARKS.md — https://github.com/NandhaKishorM/laya/blob/main/BENCHMARKS.md
4. Hugging Face — convaiinnovations/laya — https://huggingface.co/convaiinnovations/laya
5. Hugging Face Space — laya-demo — https://huggingface.co/spaces/convaiinnovations/laya-demo
6. PyPI — laya — https://pypi.org/project/laya/
7. Dev.to — the engineering write-up — https://dev.to/nandakishor_m_6cc0adfde9f/i-built-non-autoregressive-decision-models-a-year-ago-then-a-frontier-lab-called-it-a-18me
8. arXiv 2503.23303 · arXiv 2510.01237 — the two earlier papers
9. impossibl — hosted Laya — https://impossibl.com/convaiinnovations/laya
10. Our own take — `pip install laya` and `Router.predict` on this machine, on CPU

---

## 13. WHAT THE CAMERA FILMED — the only numbers the script may speak

Every figure below was read out of `public/rec/<slug>/manifest.json` **after** the take, i.e.
off the frames that ship. A re-record changes them and the script changes with it
(VIDEO_METHOD §8: numbers come from the frames that will ship).

Machine: Apple Silicon, **CPU only, no GPU**. laya **0.3.7**, torch **2.14.0**,
transformers **5.17.0**, Python **3.12.2**. The repo's 32.8 ms is a **T4** number and is always
attributed to the repo, never to our footage.

### `rec:laya-install` — it installs in one command
`python3 -V` → **Python 3.12.2** · `python3 -m venv .venv` · `.venv/bin/python -m pip install laya`
→ **`Successfully installed … laya-0.3.7 … torch-2.14.0 …`**, 33 packages, **29.6 s** wall clock
with a warm pip cache · `.venv/bin/python -I -c "import laya; print(laya.__version__)"` → **`0.3.7`**.

### `rec:laya-run#go` — three typed questions about one email

```
department : billing
confidence : 0.853
urgency    : 1.77
churn risk : 0.822
routed to  : english
first call : 7123 ms
decision   :   80 ms
```

**Say it exactly this way:** the first call is **7.1 seconds** because it builds the model;
the decision itself is **80 milliseconds**, and that is three questions, not one, on a laptop
CPU. Department **billing** is right, churn risk **0.822** is right — they did threaten to cancel.

**The warning printed itself, unprompted, above the answers:**
> `RuntimeWarning: laya: this checkpoint ships invalid temperatures or values outside [0.5, 5];
> using choice:11+=0.1005… -> 0.5. Treat confidence from the affected entries as uncalibrated.`

The package tells you, on load, which of its own confidence numbers not to trust. That is a
beat, not a blemish, and it is on screen in the take.

### `rec:laya-hindi#route` — the router, and the limit it cannot fix

```
both checkpoints loaded

english  ->  english       churn 0.918   194 ms
hindi    ->  multilingual  churn 0.041    16 ms

why it chose that, without running the model:
  english       0.08 ms  English Latin text
  multilingual  0.11 ms  non-Latin script (devanagari, 100% of letters);
                         the English checkpoint cannot read it
```

Both states say the same thing: *refund us today or we cancel*. The English checkpoint returns
**0.918**. The multilingual checkpoint, on the Hindi, returns **0.041** — and the routing was
CORRECT; Devanagari genuinely belongs to the multilingual checkpoint.

**The routing decision itself costs 0.08–0.11 ms** — pure Python, no forward pass. The repo
claims under half a millisecond. We filmed a tenth of one.

**How the narration must frame the 0.041.** Not "the model got it wrong". The README's own
"Honest limits" says `laya-multilingual` **ships with no fitted temperatures at all**, and that
`noul` is its weakest primitive. So the number is not on a scale you can put `> 0.5` against.
We reproduced the limitation its author printed himself — which is the most trustworthy thing
a review can do. The instruction that follows is the repo's own: **fit calibration on your own
data before you threshold.**

### `rec:laya-gh` — the repo page, filmed 2026-09-23

**19.3k stars** (the API said 18,522 earlier the same day — it moves; speak the number on the
frame), **1.6k forks**, **83 watching**, 32 issues, 49 pull requests, **10 releases**, latest
**v0.3.7**, **Apache-2.0 license**, most recent commit **minutes** before the take. Created
**18 September 2026** — five days earlier.

### `rec:laya-readme` — filmed on their page
The speed table, the vs-Jev table **with its disclaimer paragraph in frame**, the
**"Where Jev leads"** heading, the **"Honest limits"** heading, and the
*"ships with no fitted temperatures"* line our own run then demonstrated.

### `rec:laya-devto` — filmed
Title, byline **"Nandakishor M · Posted on 18 Sept"**, the arXiv references, and the
*"incredibly frustrating"* paragraph.
