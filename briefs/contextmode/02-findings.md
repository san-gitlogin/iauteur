# context-mode — measured findings

Every number here comes from Claude Code's own session transcripts, read by
`scripts/ctx-measure.mjs` / `scripts/ctx-score.mjs`. **`ctx_stats` was never used as evidence** —
it is the tool reporting on itself.

**Rig.** macOS, Claude Code 2.1.273, context-mode 1.0.169 loaded with `--plugin-dir` (never
installed into `~/.claude`), `CONTEXT_MODE_DIR` pointed into the workspace. Workload: a shallow
clone of `tt-a1i/archify` @ `62a2f4a3`. Both arms get an identical prompt and identical base
tools (`Read Grep Glob Bash`); the treatment arm adds the six context-mode tools and the
plugin's hooks, and nothing else. **Three runs per arm per cell**, driver `scripts/ctx-ab.mjs`,
manifests in `out/ctx-ab/`.

---

## THE RESULT

Four cells: two shapes of work × two models. Tool bytes = raw bytes that entered the context
window.

| cell | tool bytes off → on | peak context off → on | cost | ctx tools called | accuracy off → on |
|---|---|---|---|---|---|
| **Opus 5 · log analysis** | 0.8 → 0.6 KB | 18.2K → 21.4K | **+28.5%** | **0 / 3 runs** | perfect → perfect |
| **Opus 5 · code comprehension** | 43.1 → 19.2 KB | 37.8K → 30.6K | **−14.2%** | **0 / 3 runs** | 12/12 → 12/12 |
| **Haiku 4.5 · log analysis** | 4.1 → 1.0 KB | 25.8K → 26.1K | **−20.4%** | 3 / 3 runs | trap-prone in both |
| **Haiku 4.5 · code comprehension** | 151.0 → 52.7 KB | 82.8K → 54.5K | **−24.9%** | 10 / 3 runs | **7.3 → 10.0 of 12** |

**Three of four cells win. The one that loses is the one where there was nothing to save.**

## The decision rule this produces

Loading the plugin adds its eleven tool definitions plus the injected routing text to the
prompt **on turn one, and that prompt is re-sent on every turn**:

| model | first prompt off | first prompt on | rent |
|---|---|---|---|
| Opus 5 | 15.6–15.7K | 18.7–19.1K | **+3.1–3.4K tok/turn** |
| Haiku 4.5 | 21.0–21.1K | 23.3K | **+2.2K tok/turn** |

So: **context-mode has to keep more out of the window than it costs in rent.**

- Session already lean (Opus writing one `awk` line, 0.8 KB into context) → rent dominates →
  **+28.5%**.
- Session pulling real weight (151 KB) → **−24.9% and a better answer.**

The heavier the session, the more it wins. That is the whole verdict in one sentence.

## The finding that surprised me: the prompt does more than the tools

On Opus, context-mode tools were called **zero times in six treatment runs** — and the
code-comprehension cell still got 14.2% cheaper, with tool bytes cut from 43.1 KB to 19.2 KB.

Nothing sandboxed anything. What changed was that the SessionStart hook injects a
`<context_window_protection>` block telling the model that every byte a tool returns costs
reasoning capacity for the rest of the session. Opus read that, stopped reaching for `Read`, and
used targeted `Grep`/`Bash` instead.

**Two separable effects, and they should not be credited to each other:**

1. **The routing prompt** — changes how any model uses its *ordinary* tools. Free to copy: the
   same paragraph in a `CLAUDE.md` would do much of this.
2. **The sandbox tools** — only actually get called by the weaker model. Haiku called them 13
   times across six runs; Opus, never.

## Why Opus never calls them

Opus writes an `awk` one-liner and runs it through Claude Code's ordinary `Bash` tool. **`Bash`
is already a sandbox that returns only stdout** — a 535 KB access log produced **0.8 KB** of
context with context-mode switched off.

The product is pitched against `Read`, `WebFetch` and MCP servers that dump raw payloads. It is
not pitched against a model that already programs its analysis — and "think in code",
context-mode's own third principle, is **what Opus 5 does by default**.

## Accuracy — the check most reviews skip

A saving is worthless if the answer degrades, so both arms were scored against a rubric written
from the source **before any run** (`01-rubric.md`), and the log task carries a deliberate trap:
a plain text search for `500` returns **51** hits because one successful request has a 500-*byte*
response. The true answer is **50**, from three IPs.

- **Opus: 12/12 on the code task in all six runs, and the log trap avoided 6/6.** Identical in
  both arms — context-mode changed the cost, not the correctness.
- **Haiku, code task: control 12 / 5 / 5, treatment 9 / 9 / 12.** The control named the wrong
  functions twice — the `collect*` helpers instead of the `clean*` gates, one in the wrong file.
  The treatment named the right four every time. **Cheaper, lighter and more accurate.**
- **Haiku, log task: trap-prone in both arms** (control 1/3 wrong, treatment 2/3 wrong). At n=3
  that gap is not a signal; the honest statement is that context-mode neither caused nor
  prevented Haiku's errors there.

## A lesson about the method, recorded because it nearly shipped

The **first** Opus code-comprehension run, n=1, showed the treatment *losing* badly — 51.4 KB of
tool output against the control's 24.1 KB. Run three times, the same cell reads 19.2 KB against
43.1 KB: the opposite conclusion. **One agent run is an anecdote.** A draft of this document
stated the wrong verdict from that single run, and only repetition caught it.

---

## What this means for iauteur — measured on the owner's own sessions

The question was whether iauteur's own loop wastes tokens on validation output. Measured across
the real Claude Code sessions on this machine (≥5 assistant turns):

| turns | peak context | tool bytes into window |
|---|---|---|
| 9,874 | 999.9K | **4,102 KB** |
| 877 | 738.8K | 464 KB |
| 224 | 284.4K | 368 KB |

Median **464 KB** per session; **3 of 3 above 50 KB**. Against a rent of ~3.4K tokens a turn,
that is firmly on the winning side of the rule above — these are exactly the byte-heavy sessions
where the Haiku code-comprehension cell showed a 25% saving.

**Recommendation: adopt it for iauteur**, with two honest qualifications:

1. The measured Opus benefit came from the routing *prompt*, not the tools. Much of it is
   reproducible by putting the same argument in `CLAUDE.md` — cheaper, with no MCP server and no
   per-turn rent. **That alternative should be measured before committing** (it is the obvious
   next experiment and it is not yet run).
2. Licence is **Elastic-2.0**, not MIT. Fine for local development use; read it before it goes
   anywhere near a hosted service.

## Not tested — and the video must say so

- **Session continuity / compaction recovery**, which is half the product. These tasks ran 3–92
  turns and never compacted, so nothing here evaluates it.
- **External MCP servers returning raw payloads** (Playwright snapshots, issue dumps) — the case
  the vendor benchmarked. This rig used none, so the vendor's 96–98% figures are neither
  confirmed nor contradicted; they measure a different situation.
- Two README claims are **not** repeatable on screen: the "used across teams at Microsoft /
  Google / Meta…" badge wall links to `#` with no evidence, and the 98% headline is the vendor
  benchmarking its own tool on its own fixtures.
