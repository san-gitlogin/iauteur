# context-mode — validation plan and video brief

**Status:** PLAN. Nothing recorded, nothing authored, no tokens spent on agent runs yet.
**Owner decisions (LAW 0 interview, 2026-09-16):** sandbox first and decide after · long cut
8–10 min · long + shorts · thumbnail is a drawn object (the context window, filling).
**Standing:** moderndark · en-US-AvaMultilingualNeural · precise, not padded.

---

## 0. What is already verified on this machine (2026-09-16)

Facts below were measured or read from the source here, not from the README's prose. Anything
that reaches the screen gets re-verified against the frame that ships (LAW 0m, VIDEO_METHOD §0).

| fact | value | how it was obtained |
|---|---|---|
| repo | `github.com/mksglu/context-mode` | live GitHub API |
| stars / forks / open issues | **23,185 / 1,674 / 251** | live GitHub API, 2026-09-16 |
| created / last push | 2026-02-23 / 2026-09-16 | live GitHub API |
| version in the clone | **1.0.169** | `package.json` |
| licence | **Elastic-2.0 (ELv2)** — not MIT | `package.json`, `LICENSE` |
| author | Mert Köseoğlu | `package.json` |
| runs here? | **yes** — `node cli.bundle.mjs doctor` → *Server test: PASS* | run locally |
| runtimes found | Bun 1.1.34 (JS/TS, "FAST"), Python 3.12.2, zsh, ruby, perl — **6/11 languages** | doctor output |
| Claude Code here | 2.1.273 | `claude --version` |
| workload repo | `github.com/tt-a1i/archify`, MIT | `briefs/archify/00-dossier.md` (re-verify star count live before it is spoken) |

**Two claims in the README that must NOT be repeated on screen.** The "Used across teams at
Microsoft / Google / Meta / …" badge wall links to `#` and carries no evidence — it is
decoration, and repeating it would be inventing a fact (LAW 3). The "98%" headline is the
vendor's own benchmark of its own tool; we quote it as *their claim* and then measure our own.

---

## 1. The question the video actually answers

Not *"does context-mode save context"* — the vendor benchmark already asserts that, and a
video that re-asserts it is an advert. The question is the one an engineer asks:

> **On a real repository, doing real work, does it save enough to be worth installing — and
> does the answer survive?**

Three sub-questions, each measurable:

1. **The saving.** How much less of the 200K window does the same task occupy?
2. **The fixed cost nobody mentions.** Eleven MCP tool definitions plus the routing text the
   SessionStart hook injects are themselves tokens, paid on every single turn. There is a
   break-even, and it is measurable.
3. **The quality.** `ctx_execute_file` saves 95–100% *by summarising*, which is lossy — the
   project's own BENCHMARK.md admits a summarised React doc is "useless for coding". So: did
   the run with context-mode reach the **same answer**?

Sub-question 3 is the one every existing review skips, and it is why this cut is worth making.

---

## 2. How context is measured — independently of the tool

**`ctx_stats` is the tool grading its own homework. It is reported, never relied on.**

Claude Code writes a JSONL transcript per session under `~/.claude/projects/<slug>/<id>.jsonl`.
Every assistant message carries `message.usage`, verified here to contain:

```
input_tokens · cache_creation_input_tokens · cache_read_input_tokens · output_tokens
```

From that, per run, without trusting context-mode at all:

- **peak context occupancy** = max over turns of `input + cache_creation + cache_read`
  (that sum IS the prompt size sent that turn)
- **billed tokens**, split into fresh vs cache-read, because they are priced differently
- **bytes of tool output that entered the window** — sum of every `tool_result` block's length
- **turns, wall time, and whether it compacted**

`scripts/ctx-measure.mjs` (to be written, phase 2) does this and prints a table. It is an
iauteur script, tracked, so the measurement can be re-run and argued with.

**The honest caveat this measurement exposes:** in Claude Code most of the window is
*cache-read* on every turn, which is billed at a fraction of fresh input. So "tokens kept out
of the window" and "money saved" are **not** the same number. Expect this to be one of the
sharper findings, and it belongs in the cut.

---

## 3. The experiment

**Workspace:** `/tmp/iauteur-rec/ctxmode` (the recorder's root), containing a shallow clone of
`tt-a1i/archify`. Real repository, real files, not a fixture.

**Isolation — the owner chose sandbox-first, so this is a hard boundary:**

| surface | how it stays clean |
|---|---|
| storage | `CONTEXT_MODE_DIR=/tmp/iauteur-rec/ctxmode/.cm-store` — verified env var, absolute |
| plugin | `claude --plugin-dir <clone>` or a project-local `.mcp.json`; **never** `/plugin marketplace add` into the live config during measurement |
| config | throwaway `CLAUDE_CONFIG_DIR` for the take, so `~/.claude` is untouched |
| proof | `~/.claude` tree hashed before and after; the doctor probe already run today wrote two empty dirs and they were removed |

### Test 1 — the spine: one task, two runs

Identical prompt, identical repo, identical allowed tools. Only the routing differs.

> *"In this repository, work out how archify turns a typed JSON IR into the final HTML. Read
> the CLI entry point, the validator and the compiler, and list every check that
> `validate --quality showcase` applies, naming the file and line for each."*

Chosen because the natural plain-tools path is several large `Read`s whose full text lands in
the window, and because **the answer is checkable**: the set of checks exists in the source, so
a rubric can be built from it beforehand and scored blind.

- **Run A (control):** plain `Read` / `Grep` / `Bash`.
- **Run B (treatment):** context-mode loaded, routing active.

Scored on: peak occupancy · billed tokens (fresh vs cached) · tool-output bytes into the window
· wall time · **checks found / missed / invented** against the rubric.

### Test 2 — our own case: iauteur's validation output

The reason the owner raised this: *"lots of tokens are getting wasted during validation."*
`npm run gate` prints a wall of field-use notices (~100 lines before it even reaches the seals).
Same A/B, one task: *"run the gate and tell me what is failing and why."* This is the test that
decides whether context-mode gets wired into iauteur for real.

### Test 3 — the fixed cost, no agent run needed

Turn one of each transcript, compared. The difference is the price of the eleven tool
definitions plus the injected routing text, paid on every turn of every session. Produces the
break-even: *below N KB of tool output in a session, context-mode costs you more than it saves.*
Cheap to measure, and it is the most useful number in the video.

**Every run is dry-run OFF camera first.** Confirm it completes, produces the artifact, trips no
permission prompt mid-take, and that `waitFor` matches something the TOOL prints — never a
string from our own prompt, which resolves instantly and cut a take at second 44 once.

---

## 4. The cut (8–10 min, moderndark, Ava at +8%)

Order follows LAW 0g and the 2026-09-16 rule — **the result is shown before the method.**

| # | beat | what the viewer SEES |
|---|---|---|
| 1 | name it, greet, state the job | subject *context-mode* in the first sentence |
| 2 | **the payoff, up front** | three seconds of the finished A/B: two occupancy bars, measured |
| 3 | the problem | the 200K window filling with slabs of raw tool output until it hits the wall |
| 4 | what it actually is | the boundary: raw output into a sandbox, one thin line of stdout crossing |
| 5 | the index | a file shredded into chunks dropping into SQLite; a query pulls two back |
| 6 | install it | real install on camera, `ctx_doctor` green |
| 7 | run A | live Claude Code, plain tools, window filling |
| 8 | run B | same prompt, routed |
| 9 | the numbers | from Claude Code's own accounting, side by side |
| 10 | **did the answer survive?** | rubric: checks found / missed |
| 11 | the honest part | the fixed cost, the break-even, cache pricing, the lossy summarise path |
| 12 | verdict + what we did in iauteur | and the recap that closes the loop |

**Narration rules that bind here** (all previously paid for): name every term the first time it
is spoken — *MCP*, *context window*, *compaction*, *FTS5*, *BM25*, *stdout*, *sandbox* — in the
same breath, in plain English. Contractions. Sentence lengths that swing. Never say the footage
is real. One pause invitation, at the A/B numbers. No number spoken without its unit and its
subject.

**Components.** One new scene type, `CTX_STAGE`, dispatching purpose-built pictures through
`src/ctxViz.tsx` — the proven `uvViz` / `appleViz` / `memViz` shape, and the reason the
over-reliance gate stays honest (`subTypeOf` counts pictures, not the wrapper). Planned kinds,
each an OBJECT rather than a card:

`window-fill` · `sandbox-boundary` · `fts-index` · `token-scales` (fixed cost vs saving, tipping
only past break-even) · `cache-ledger` · `ab-bars` (declared measured data) · `answer-rubric`.

Shorts: one 9:16 cut from the strongest beat — the measured before/after — reframed, not cropped.

---

## 5. Phases, gated (LAW 10). Each ends with an audit against the real artefact.

| phase | work | ends when |
|---|---|---|
| **1** | this plan, approved | owner says go |
| **2** | `scripts/ctx-measure.mjs` + rubric built from archify source + **dry runs of both tasks off camera** | both tasks complete headlessly, numbers reproduce twice, rubric scores blind |
| **3** | the real measurement, recorded — `demos/ctxmode-*.json`, expensive take split from cheap ones | takes on disk, every mark proven, frames pulled and read |
| **4** | `briefs/contextmode/01-findings.md` — every number traced to a transcript | the findings are the script's only source |
| **5** | casting → `CTX_STAGE` + viz kinds → spec → preflight | `preflight.mjs` green BEFORE a word is voiced |
| **6** | voice → sync → gates → stills → render → thumb → upload kit | frames EXACT, drift 0 ms, audio ≈ −22 dB |
| **7** | the adoption decision for iauteur, written up from the numbers | owner's call, with evidence |

## 6. What this costs, stated plainly

Phase 3 spends the owner's model tokens on **four** live Claude Code runs (two tasks × A/B),
plus the dry runs in phase 2. A take is an asset, not a temp file — recordings archive to
`public/rec/_prev/` and the expensive agent take is recorded in its own slug so any later
framing fix re-records only the free takes beside it.

## 7. The risk that would change the video

If the measured saving on a real repository is small, or the answer degrades, **the video says
so.** The title and thumbnail are chosen after the numbers exist, never before. A cut that
reports "it helps here, not there, and here is the break-even" is more useful than one that
repeats a vendor's 98%, and it is the only version that stays true.
