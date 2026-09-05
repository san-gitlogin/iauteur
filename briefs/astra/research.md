# GPT-6 Astra — RESEARCH DOSSIER
Gathered 2026-09-05. PRIMARY SOURCES ONLY. Every figure here carries its origin.
Nothing in this file may be spoken in the video unless the source column says where it came from.

## 1. IDENTITY / RELEASE
| fact | value | source |
|---|---|---|
| model id | `gpt-6-astra` | developers.openai.com model card |
| limited preview | 2026-09-03 | Wikipedia |
| public release | 2026-09-04 | Wikipedia; OpenRouter "Release Date: September 4, 2026" |
| successor to | GPT-5.6 Sol | Wikipedia, Fortune |
| knowledge cutoff | Apr 30, 2026 | model card; Artificial Analysis |

## 2. SPECS (developers.openai.com model card — PRIMARY)
- Context window: **1,050,000 tokens**  (AA renders it "1M tokens (~1500 A4 pages)")
- Max output: **128,000 tokens**
- Modalities: input text + image; output text
- Features: streaming, structured_outputs, function_calling, file_search, image_input, web_search, prompt_caching
- Tools: web search, code interpreter, computer use, image generation, MCP
- Endpoints: Chat Completions + Batch. NOT Realtime, Assistants, Fine-tuning, Embeddings
- Rate limits (Standard Tier 5): 15,000 RPM · 40,000,000 TPM · batch queue 15,000,000,000

## 3. PRICING (model card + OpenRouter agree — GOOD, two independent confirmations)
- Input **$10 / 1M**
- Output **$50 / 1M**
- Cached input **$1 / 1M**
- Cache write **$12.50 / 1M**
- Batch = half price; "Fast mode at 2x the rate" (search snippet — VERIFY ON CAMERA)
- "price 2.5x GPT-5.6 Sol's" (search snippet — VERIFY)

## 4. ARTIFICIAL ANALYSIS (artificialanalysis.ai/models/releases/gpt-6-astra — PRIMARY)
Intelligence Index **v4.2**, composed of: AA-Briefcase, GDPval-AA v2, t3-Banking,
Terminal-Bench v2.1, SciCode, Humanity's Last Exam, GDP.pdf, CritPt, AA-Omniscience, AA-LCR v1.1

| variant | index | output speed | cost / index task |
|---|---|---|---|
| Max | 55 | 62 t/s | $2.57 |
| Xhigh | 54 | 57 t/s | $1.85 |
| High | 53 | 61 t/s | $1.41 |
| Medium | 52 | 58 t/s | $1.16 |
| Low | 49 | 59 t/s | $0.63 |
| Non-reasoning | 48 | n/a | $1.42 |

- Lowest time-to-first-token: **GPT-6 Astra (low) at 1.95s**
- "Prices vary up to 4.1x across models"

### CONFLICT — RESOLVED 2026-09-05
emergent.sh claimed "Fable 5.1 leads the AA Index 66 to Astra's 61"; the live AA v4.2 page
returned 55/54/53/52/49/48 for the Astra variants. RESOLUTION, from the Medium piece:
OpenAI's OWN launch table quotes an AA Intelligence Index figure, and on it "Astra is behind
Claude Fable 5.1, Claude Opus 5, and Claude Fable 5."
So the DIRECTION is confirmed by three independent sources (AA live page, OpenAI's own table,
the Medium review): **Astra does not lead the Artificial Analysis Intelligence Index.**
The absolute NUMBERS differ between OpenAI's table and AA's live v4.2 page — different index
snapshot. THEREFORE: never speak a bare AA index number. Always say whose table it is, and
prefer the DIRECTION (Astra trails Fable 5.1) which every source agrees on.

## 5. OPENROUTER (openrouter.ai/openai/gpt-6-astra — PRIMARY)
Description, verbatim:
> "GPT-6 Astra is OpenAI's flagship model for demanding end-to-end work. It is suited for
> advanced analysis, software engineering, deep research, scientific work, and document
> creation, with particular strengths in long-horizon agentic tasks that involve computer
> and browser use."
- Providers: OpenAI and Azure (US)
- P50: best throughput 53 t/s · best latency 2.89s · uptime (3d) 100% · availability (3d) 98.85%
  NOTE: AA says 57-62 t/s, OpenRouter says 53 t/s. Different measurement, not a contradiction —
  say WHOSE number it is whenever one is spoken.

## 6. ARC PRIZE — ARC-AGI-3 (arcprize.org/blog/astra — PRIMARY) *** THE HONEST-REVIEWER BEAT ***
| harness | score (Semi-Private) | cost |
|---|---|---|
| Standard (provider-neutral) | **62.7%** | **$26,098** |
| Provider Adapter (high reasoning) | **99.9%** | **$18,817** |

- Human baseline: ~500 general-public participants, approx **$12.78 per attempted game**
- Astra used fewer actions than the human baseline on **96.0% of levels**
- Astra used **51.7% fewer actions per level on average**
- Standard harness = "provider-neutral interface" with visible note-taking.
  Provider Adapter = "opaque reasoning state between requests" + "compaction for longer conversations."
- ARC Prize verdict, verbatim: Astra "represents a noticeable step-function change in frontier
  model capabilities" BUT "saturating the benchmark would not represent 'proof of achieving AGI.'"
  They stress ARC-AGI-3's "tightly bounded scope" with "deterministic, closed-ended mechanics."

*** THE STORY: Fortune reported the 99.9% with NO cost and NO harness caveat. The same model
scores 62.7% on the neutral harness. That gap IS the video's credibility beat. ***

## 7. FORTUNE (2026-09-03) — quotes
- Greg Brockman (President/Cofounder): computer use "can zip through spreadsheets, fill out
  forms, and navigate across web pages often at superhuman speed"
- Brockman: "It's not unreasonable to feel that we are now in the AGI era"
- Mia Glaese (VP Research): "shows how far we've come from sort of aspirationally training for
  computer use to bringing real value"
- Aidan Clark (VP Research): "It's the first time we've pretrained on more than 100,000 GPUs at
  our Stargate site in Texas"
- Fortune's benchmark line: ARC-AGI-3 **99.9% with tools vs GPT-5.6 Sol's 7.8%**;
  ExploitBench **100% vs GPT-5.6 Sol's 78.5%**  (VERIFY BOTH ON CAMERA)
- Safety experts: the new architecture "makes models harder to control"

## 8. WIKIPEDIA — architecture + safety
- "by far" OpenAI's largest training run; pretraining on >100,000 GPUs at Stargate, Texas
- NEW REASONING TECHNIQUE: **"recurrent depth"** — obscures the model's reasoning process,
  raising "concerns regarding the model's monitorability"
- Shipped as a "restricted version that rejects certain prompts" in cybersecurity
- Delays added after the **"Hugging Face incident" (July 2026)** for extra safeguards
- Cyber access gated: testers first, expanding via **"Daybreak Blue"** for defensive use
- Example tasks cited: tax returns, video game scene building, food ordering, job searches

## 9. CYBERSECURITY
- OpenAI says Astra meets the **"Critical" cybersecurity threshold** under its Preparedness
  Framework (search snippet + CNBC headline — CNBC 403'd, VERIFY ON CAMERA)
- Fortune: can "find and exploit previously unknown security flaws without human oversight"

## 10. ROLLOUT
- Day one: limited orgs (**Daybreak** program)
- Then ChatGPT Plus, Pro, Business, Enterprise "over the coming days"
- Then OpenAI API and AWS
- 9to5Mac: major upgrade to ChatGPT AND Codex

## 11. STILL TO CAPTURE (all 403'd to fetch — MUST be recorded in the real browser)
- [ ] openai.com/index/gpt-6-astra/  (the announcement itself — 403)
- [ ] medium.com/@unicodeveloper/gpt-6-astra-a-taste-of-agi-938515afc5c7  (403)
- [ ] reddit.com/r/developersIndia/.../gpt_6o_astra_is_insanely_good...  (blocked)
- [ ] CNBC cyber piece (403)
- [ ] Forbes "curious false start" (403) — what WAS the false start?
- [ ] products actually built on Astra + proof pages
- [ ] "recurrent depth" — find a primary technical description

---

# 12. THE MEDIUM REVIEW — PRIMARY, AND THE SPINE OF THE VIDEO
**"GPT-6 Astra. A taste of AGI?" by unicodeveloper**, ~10 min read, published 2026-09-04.
https://medium.com/@unicodeveloper/gpt-6-astra-a-taste-of-agi-938515afc5c7

>>> OWNER INSTRUCTION, 2026-09-05, NON-NEGOTIABLE:
>>> "MEdium content is very important - and you must credit the author in the bottom as source"
>>> => every beat drawn from this piece carries `recordedStep.sourceNote` naming
>>>    unicodeveloper + the article title, ON SCREEN, for the whole beat (LAW 0f).
>>> => `meta.seo.sources` carries the author, the title and the URL.
>>> => the narration SAYS the author's name out loud the first time we use their work.

## 12a. OPENAI'S OWN BENCHMARK TABLE (as reported in the review)
| benchmark | GPT-6 Astra | GPT-5.6 Sol | Claude Fable 5.1 | Claude Opus 5 |
|---|---|---|---|---|
| BenchCAD | **95.9%** | 83.3% | 84.3% | 82.1% |
| FrontierMath Tier 4 | **97.6%** (~98%, "saturates") | — | — | — |
| ARC-AGI-3 | **99.9%** | 7.8% (per Fortune) | — | — |
| ExploitBench | **100.0%** | 78.5% | — | — |
| ExploitGym | **42.4%** | 30.3% | — | — |
| SRE-Bench (1 attempt) | **88.0%** | 55.9% | — | — |
| OSWorld 2.0 | **72.6%** @ ~40 min/task | 65.7% @ ~75 min/task | — | — |
| Humanity's Last Exam (w/ tools) | 57.2% | — | **65.0%** ← FABLE WINS | — |
| AA Intelligence Index | behind | — | **ahead** ← FABLE WINS | ahead |

*** THE INTEGRITY BEAT: OpenAI's own launch table shows Astra LOSING two benchmarks to
Claude Fable 5.1. A launch post that publishes its own defeats is worth pointing at. ***

## 12b. WHAT ASTRA ACTUALLY IS — the review's central claim
> "Astra is not being pitched as a better chatbot. It is being pitched as a computer operator."
> "The chatbot era was about answers. Astra feels like it is about action."
> "Astra feels like an operator. Fable feels like a craftsperson." (distinction credited to Theo on X)

OSWorld 2.0 is the number that carries this: **72.6% at ~40 min/task vs Sol's 65.7% at ~75 min.**
Review's read: "the claim is not just that it is smarter. The claim is that it gets more done,
faster. That is the number businesses will care about."

Named everyday tasks OpenAI cites: fill forms, update CRM records, organize calendars, research
online, draft documents, analyze scientific data, generate plots, create websites, run frontend
QA, install software, troubleshoot what it sees on screen.
Review's framing, worth quoting: *"That sounds boring until you remember that most work is
boring... If Astra is genuinely good at that, it matters."*

## 12c. THE 3D / BLENDER STORY
- Models a house in **Blender**, then turns it into a **walkable Unreal Engine 5 scene**.
- BenchCAD 95.9% is the benchmark behind it (see table).
- Why it is hard, per the review: "spatial reasoning, geometry, camera movement, materials,
  scale, lighting, object placement" — "closer to 'understand the house as a manipulable object.'"
- Sites in ChatGPT: create, host and share websites, web apps and games directly from a prompt.

## 12d. THE MATH STORY — AND ITS CAVEAT
- FrontierMath Tier 4 ~98% (table: 97.6%).
- OpenAI says an internal Astra resolved or made substantial progress on **ten** long-standing
  problems in maths and theoretical CS: sphere packing, coding theory, non-sofic groups,
  Connes's rigidity conjecture, arithmetic circuit complexity, quantum parallel repetition,
  lattice cryptography, Ehrhart's volume conjecture, Ramsey theory, extremal graph theory.
- Repo: **openai/PrimeGaps186**. Target: liminf (p_{n+1} - p_n) <= 186
- *** CAVEAT THE VIDEO MUST KEEP: the repo's Lean formalization is CONDITIONAL ON THREE
  EXPLICIT INPUT AXIOMS. The review's own words: "I would not write 'Astra solved prime gaps'
  without qualification." Honest version: "contributed to serious mathematical research
  outputs, including Lean-formalized work, but some public results still depend on
  assumptions and need expert review." ***

## 12e. SCIENCE
SOTA or highly competitive on: Terminal-Bench Science, GeneBench Pro, LifeSciBench,
MedChemBench, HealthBench Professional.
The review's point is the LOOP, not the score: "open data, run analysis, generate plots, notice
weirdness, compare hypotheses, and write up what changed." — "it could compress a lot of the
slow connective tissue of research."
(NOTE: the Valyu mentions in the piece read as a sponsor/affiliate aside — do NOT carry them.)

## 12f. CYBERSECURITY — "where the jokes stop"
- **First OpenAI model to reach the Critical cybersecurity threshold** under the Preparedness Framework.
- With the right tools and access it "can find previously unknown security flaws and develop new
  ways to exploit them across many well-protected systems without a person guiding each step."
- ExploitBench 100.0% (Sol 78.5%) · ExploitGym 42.4% (Sol 30.3%) · SRE-Bench 88.0% (Sol 55.9%)
- Review's line: "A model that can operate computers this well is no longer just a productivity
  tool. It is infrastructure."
- Public version refuses advanced cyber requests and carries extra safeguards.

## 12g. THE AGI VERDICT — the video's closing argument
> "GPT-6 Astra does not prove AGI, but it makes the 'AGI era' argument harder to dismiss."
> "Astra makes the AGI argument less embarrassing to have in public."
> "But AGI is not a launch post. It is not one benchmark. It is not a demo video. It is
> definitely not a tweet thread."
Pair with ARC Prize's own verdict (§6) — they agree, and they own the benchmark.

## 12h. ASTRA vs FABLE 5.1 — the comparison the audience wants
- **Astra**: computer use, tool use, scientific work, porting large apps, browser automation,
  3D reasoning, Blender, game creation, agent swarms, self-prompting, office software.
- **Fable 5.1**: clean mergeable code, frontend design judgement, careful writing,
  reasoning-heavy work. Wins HLE-with-tools and the AA index.

# 13. REAL THINGS BUILT WITH IT — with proof pages
The review separates OFFICIAL from CREATOR-REPORTED. KEEP THAT SEPARATION ON SCREEN.
## Official
- GPT-6 Astra launch page · safety overview · system card
- "Ten advances in mathematics and theoretical computer science"
- openai/PrimeGaps186 repo
- ARC-AGI leaderboard · OpenAI launch video
## Creator-reported (label as REPORTED, not verified)
- **ABYSSAL - The Living Deep** — playable procedural ocean, Ethan Mollick
  https://abyssal-living-deep.netlify.app  · source: github.com/emollick/abyssal-living-deep
  "seeded reefs, kelp forests, whales and bioluminescent depths"
- **WebGL shader city** on twigl.app (Ethan Mollick)
- Library of Alexandria simulation (Ethan Mollick)
- Blender house -> Unreal walkthrough (Tom Krcha, reported)
- Zillow-to-3D walkthrough (Yunfan Ye, reported)
- Tidal Rush kart-racing demo · FPS map (Riley Brown) · multi-agent Unreal world (Matt Shumer)
- Karan's Astra vs Fable 5.1 Blender comparison
- Ben Davis: Final Cut, Affinity Photo, Blender thread
- **explainx.ai** roundup: "GPT-6 Astra Demos: 11 Best Launch-Week Showcases (2026)" —
  "tracked the video, creator, and timestamp behind 11 demos, then graded which ones actually prove" it
Review's own caution, which the video repeats: *"I'd treat the official links as confirmed
claims. I'd treat the creator links as demos worth studying, not final evidence."*

# 14. AVAILABILITY (review FAQ, agrees with §10)
Limited orgs first -> ChatGPT Plus, Pro, Business, Enterprise -> OpenAI API, Microsoft Azure,
AWS Bedrock. API name `gpt-6-astra`. Fast mode: up to 2x faster, 2x the price.
