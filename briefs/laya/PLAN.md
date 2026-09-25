# LAYA — production plan

**Slug:** `laya-decisions-open` · **`meta.subject`: `Laya`** · one long + one shorts.
**Locked in the LAW 0 interview (2026-09-23):** both formats · **10–12 min** wide ·
design pack **terminalcli** · voice `en-US-AvaMultilingualNeural` at +8% ·
**the demo is installed and run locally, on this machine, on CPU.**

Facts and sources: [`FACTS.md`](FACTS.md). Nothing in the cut comes from anywhere else.
The LangChain reference transcript the owner supplied is a **fact source and a shape reference
only** — its teaching ORDER is worth copying, none of its phrasing is (LAW 0f quotation rule,
and the standing "no sponsor segments" rule: it is a vendor talk, we are not).

Previous cut on the neighbouring subject: `topics/jev-decisions-measured` (64 scenes, 17:36).
**This is not a sequel and must not look like one** — different pack, different picture set,
and the four Jev-era builds (`SMART_IF`, `PARALLEL_SAMPLER`, `DECISION_SLOTS`, `JEVONS_CURVE`)
are used at most once each, never as the spine.

---

## 1. The angle

**The free one is not a knock-off — it is older than the thing it is an alternative to, it
publishes its own failures, and you can run it on a laptop in four minutes.**

Five things this cut has that the coverage does not:

1. **We run it.** Every other Laya video reads the README. We `pip install laya` on camera, write
   the triage script, and film the answers and the timings this machine actually produced.
2. **The dates.** March 2025 and September 2025 arXiv papers, Jev on 15 Sep 2026, Laya on
   18 Sep 2026. We put them on one line and let the viewer do the arithmetic. We do **not**
   adjudicate the priority claim in our own voice.
3. **The `[MASK]` mechanism, drawn.** Everyone says "single forward pass". Nobody shows *why* it
   is one pass — an option slot per candidate, packed into the sequence, read back out of it.
4. **The "Honest limits" section, filmed.** The README has a heading with that name, admitting
   the base checkpoints sit below the majority-class baseline, and printing three open issue
   numbers against its own model. A review that skips it is an advert.
5. **Where Jev still wins**, said out loud: Banking77, 0.870 against 0.425, and 255 options out
   of the box against a 3-tokens-per-label squeeze.

**One payoff:** the open model is not winning because it is better at everything — it loses
badly on wide label sets — it is winning because it is 7× faster, honest about its calibration,
and costs nothing to run beside your own data.

**Open loop:** what does an AI model look like when it is not allowed to write a single word —
and why did eighteen thousand people star it in five days?

**What we never say:** that we measured 33 ms (we ran on CPU — the repo's own CPU figure is
193–464 ms and our footage prints its own); that Laya beats Jev outright; that the priority
dispute is settled; that Jev is bad.

---

## 2. Every claim, and how it is paid for

| claim | receipt (on camera) | caveat (on camera) |
|---|---|---|
| 18.5k stars in five days | sc. 3 — the GitHub page, stars and the created date | said as a fact about attention, not about quality |
| free / Apache 2.0 | sc. 3 — the licence on the repo page | sc. 33 — free to run still costs a GPU or a slow CPU |
| 33 ms, single forward pass | sc. 30 — the README speed table, on their page | sc. 24 — **our** run is CPU and prints its own number |
| 7× faster than Jev | sc. 30 — the repo's own comparison row | the Jev figure is third-party published, not measured there — said out loud |
| cannot hallucinate | sc. 17 — the declared output space | sc. 34 — it cannot emit a shape you did not declare; it can absolutely pick the wrong one |
| better calibrated | sc. 31 — ECE 0.081 vs 0.246 | **after** temperature fitting; multilingual ships with none |
| drop-in for Jev | sc. 36 — `POST /v1/systemone`, same schema | it is the wire that matches, not the accuracy |
| it beats Jev | sc. 31 — four benchmark rows | sc. 32–33 — **Banking77: 0.425 against 0.870**, and the zero-shot floor |

---

## 3. Shape — 38 scenes, 12 recorded (32%, cap `ceil(0.35 × 38)` = 14)

Budget: sync lands at **~0.363 s per written word**, so 11:00 ≈ **1,815 words**, ≈ 48 words a
beat. Beats are budgeted first and written to (memory: *budget the beat before you voice it*).

`REC` = footage · `★` = new picture in `LAYA_STAGE` · everything else drawn from the library.

### ACT 0 — the claim (1–6, 2 REC, ~290 words)

| # | beat | cast |
|---|---|---|
| 1 | **"There is an AI model that cannot write a single word — and that is exactly why people want it."** Then the turn: it is free, it is Apache 2.0, and it is a drop-in for the most hyped launch of the month | `HOOK` |
| 2 | Greet, then the intent (LAW 0g): today we install Laya on this machine, ask it three typed questions about a real support email, and read what it says — including the parts its own README admits it gets wrong | `TITLE_CARD` |
| 3 | **REC — github.com/NandhaKishorM/laya.** The archify shape puts the source of truth at scene THREE. Description read off the page, then the stars, then Apache 2.0, then the created date | `rec:laya-gh` |
| 4 | The problem, depicted: an agent loop that stops and calls a generative model to answer *"which team handles this?"* — tokens streaming out one at a time for a one-word answer | `AGENT_HARNESS` |
| 5 | ★ **`one-pass`** — the same question answered two ways against one clock: a sentence typing itself out, beside every option scored at once | `LAYA_STAGE` ★ |
| 6 | What this video covers, four items each on its own anchor | `LIST_BUILD` |

### ACT 1 — who built it, and when (7–11, 1 REC, ~250 words)

| # | beat | cast |
|---|---|---|
| 7 | Chapter: *"Before the model — the dates."* | `CHAPTER` |
| 8 | **REC — the dev.to write-up.** His title, and the paragraph in his own words. Attributed as his account, on his page | `rec:laya-devto` |
| 9 | The dates on one line: arXiv Mar 2025 · arXiv Sep 2025 · Jev 15 Sep 2026 · Laya 18 Sep 2026 | `TIMELINE` |
| 10 | His own framing of the difference — vertical (turn-by-turn sales conversion) against horizontal (any typed question about any state) | `SPLIT_PATHS` |
| 11 | What he shipped that the closed lab did not: weights, dataset, two papers, an Apache licence — and the one thing he did not ship, a hosted SLA | `RESPONSIBILITY_SPLIT` |

### ACT 2 — what it actually is (12–21, 1 REC, ~520 words)

| # | beat | cast |
|---|---|---|
| 12 | Chapter: *"A decision engine, not a writer."* | `CHAPTER` |
| 13 | State in, typed questions in, typed answers out. The **state** is any text, email, ticket or JSON | `API_REQUEST_RESPONSE` |
| 14 | `choice` — pick one label, get a probability for every option | `DECISION_SLOTS` |
| 15 | `score` and `noul` — a level on a rubric, and a calibrated probability between 0 and 1. Name `noul` out loud, it is a made-up word and a beginner will stall on it | `TRADEOFF_SCALE` |
| 16 | ★ **`mask-slots`** — **the picture of this video.** The packed sequence with one `[MASK]` per option, the encoder reading the whole thing at once, the hidden states gathered *at those positions*, one logit each, softmax. This is why it is one pass | `LAYA_STAGE` ★ |
| 17 | Why it cannot produce broken JSON: the output space is the slots you declared. Nothing is parsed, because nothing was written | `TYPE_GATE` |
| 18 | ★ **`entropy-dial`** — confidence is `1 − H(p)/log K`, so a flat spread reads 0.00 and a spike reads 1.00. It is computed from the distribution, not asserted by the model | `LAYA_STAGE` ★ |
| 19 | ★ **`proper-score`** — RLCD. Plain cross-entropy is only minimised as the winning logit runs to infinity, and a +1/0 reward pushes the top probability to 1. Both buy accuracy by destroying calibration. A strictly proper scoring rule pays the most only when the reported numbers are the true ones | `LAYA_STAGE` ★ |
| 20 | The three checkpoints and their sizes, and the fact that a router picks between them per request | `MODEL_STAGES` |
| 21 | Quiz: an email arrives in Hindi and you send it to the English checkpoint — what does it cost you? (≥9 words of gap, a real pause cue) | `QUIZ_CARD` |

### ACT 3 — run it here (22–28, 5 REC, ~440 words)

| # | beat | cast |
|---|---|---|
| 22 | Chapter: *"Four commands, on this laptop."* | `CHAPTER` |
| 23 | **REC — `python3 -m venv .venv`, `pip install laya`, the version check.** `terminalOnly`, full frame | `rec:laya-install` |
| 24 | **REC — the script, taught line by line** (LAW 0e.2): the import, the `Router()`, the state, and one question of each type | `rec:laya-code` |
| 25 | **REC — run it.** The answers land: department, urgency, churn risk, the routing line and the milliseconds this machine took. Said plainly: this is CPU, and the repo's GPU figure is a different number | `rec:laya-run` |
| 26 | What just happened, drawn over the numbers we just watched | `LAYA_STAGE` (`one-pass`, 2nd use) |
| 27 | **REC — the same state in Hindi**, routed to the multilingual checkpoint, with the router's own `reason` string read off the screen | `rec:laya-hindi` |
| 28 | ★ **`router-gate`** — script detection in under half a millisecond, *before* the forward pass. And the reason it has to be before: the English checkpoint scores **0.000 on Khmer at 0.952 confidence.** Wrong every time, and sure of itself | `LAYA_STAGE` ★ |

### ACT 4 — the receipts, including the bad ones (29–33, 2 REC, ~330 words)

| # | beat | cast |
|---|---|---|
| 29 | Chapter: *"Now the numbers — theirs and the ones they lose."* | `CHAPTER` |
| 30 | **REC — the README speed table and the vs-Jev table**, read off the repo page, with the repo's own disclaimer that Jev's figures are third-party published | `rec:laya-bench` |
| 31 | Four rows where Laya wins, drawn so the sizes are comparable at a glance | `BAR_COMPARE` |
| 32 | **REC — the "Honest limits" heading**, scrolled to and read. The base checkpoints below the majority-class baseline; three open issue numbers against its own model | `rec:laya-limits` |
| 33 | ★ **`budget-split`** — where Jev wins: 77 options sharing a 256-token head budget is 3 tokens a label, so the labels stop being distinguishable. 0.425 against 0.870, and Jev takes 255 options out of the box | `LAYA_STAGE` ★ |

### ACT 5 — where it belongs (34–38, 1 REC, ~285 words)

| # | beat | cast |
|---|---|---|
| 34 | The four built-in presets: router, guard, moderation, triage — one line each | `ICON_GRID` |
| 35 | Confidence gating at 0.85: act, or escalate to a human. The act head learned the 62.5% break-even from a cost matrix on its own | `CONFIDENCE_GATE` |
| 36 | ★ **`free-swap`** — `laya-serve` speaks `POST /v1/systemone`, the same schema Jev returns, so a working Jev client changes one string. That is what "free alternative" actually means here | `LAYA_STAGE` ★ |
| 37 | **REC — a third party's page**: `omp-laya-judge`, a local System-1 judge, 0 tokens, ~0.3 s on CPU. Adoption shown on somebody else's repo, not claimed on ours | `rec:laya-community` |
| 38 | Recap + the line between what we watched and what we read, then the CTA | `RECAP` → `OUTRO_CTA` |

---

## 4. Recordings

| slug | surface | what |
|---|---|---|
| `laya-gh` | browser | the repo page: description, stars, licence, created date |
| `laya-devto` | browser | the write-up: title and his paragraph |
| `laya-bench` | browser | README speed table + the vs-Jev table |
| `laya-limits` | browser | the "Honest limits" section |
| `laya-community` | browser | `omp-laya-judge` on GitHub |
| `laya-install` | vscode, `terminalOnly` | venv, `pip install laya`, version check |
| `laya-code` | vscode | `triage.py` in the editor, taught line by line |
| `laya-run` | vscode, `terminalOnly` | the run, the answers, the timing |
| `laya-hindi` | vscode, `terminalOnly` | the Hindi state, the routing reason |

**Warm caches are honest, a faked run is not.** The pip cache and the Hugging Face cache are
warm before the take, because the download is not the teaching and a viewer watching 843 MB
arrive learns nothing. The commands are real, the outputs are what this machine printed, and
the timings on screen are the timings it took.

**Identity.** `assertNoIdentity()` fails a take that prints the operator's home path, so the
workspace stays at `/tmp/iauteur-rec/laya-lab`. Grep every capture before it is drawn.

---

## 5. New pictures — `LAYA_STAGE`, one type, six kinds (`src/layaViz.tsx`)

Following the `O55_STAGE` precedent. Each names an OBJECT, not a topic:

| kind | the object |
|---|---|
| `one-pass` | one clock, two lanes: tokens arriving one at a time against every option scored together |
| `mask-slots` | a packed sequence with a slot per option, read back at those exact positions |
| `entropy-dial` | a distribution's spread turning a dial from 0.00 to 1.00 |
| `proper-score` | a reward surface whose single peak sits where the reported numbers equal the true ones |
| `router-gate` | a gate before the model, and behind it a meter reading 95% over an answer that is wrong |
| `budget-split` | a fixed token budget cut into 77 pieces until the labels stop being legible |
| `free-swap` | one string in a client changing, and the same envelope arriving somewhere else |

Every element anchors on its own `atWord` — no fixed frame intervals anywhere (LAW 0i.1).

---

## 6. Title and thumbnail — clickbait, and true

The owner asked for pure clickbait. The constraint is that every word must still be defensible
off a page we filmed.

**Title (chosen):** `This FREE AI Model Beats A $400M Lab's — And Runs On Your Laptop`
— *pending a check that no funding figure is claimed anywhere we can source; if it is not
sourceable the number comes out and the fallback title ships.*

**Fallbacks, all sourced:**
- `The FREE Jev Alternative — 7× Faster, Apache 2.0, 18,000 Stars In 5 Days`
- `He Built It A Year Before The Frontier Lab Did. Then He Gave It Away.`
- `This AI Model Cannot Write A Word — And It's Free`

**Thumbnail:** big title, a badge, and the subject drawn through `art` at full size — the repo
page with the star count legible, not a glyph on a card. A row of real brand logos
(GitHub, Hugging Face, PyTorch, Python) along the bottom.
