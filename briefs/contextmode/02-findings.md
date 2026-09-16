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

## THE HEADLINE NUMBER, and why it is the one that ships

**Real code work on the flagship model: 14% cheaper, 2.2× less raw data in the window, peak
context down 19%.**

| Claude Opus 5, code comprehension | plain | with context-mode |
|---|---|---|
| tool bytes into context | 43.1 KB [39.5–47.7] | **19.2 KB** [14.9–24.8] |
| peak context | 37.8K [36.1–40.0] | **30.6K** [27.9–33.7] |
| cost | $0.379 [$0.346–$0.410] | **$0.325** [$0.302–$0.353] |
| rubric score | 12/12 ×3 | 12/12 ×3 |

This cell is the one a claim can rest on: **the ranges on both counted measures do not overlap**,
all three measures move the same way, and accuracy is identical. The video's claim is "about 15%
cheaper", which is the conservative end of what was measured.

⚠ **COST IS THE NOISY COLUMN.** Within a single arm, cost spans 2–3× purely because of
prompt-cache warmth — a run whose prefix is already cached is billed at a fraction of a cold one.
Tool bytes and peak context are counted from the transcript and not priced, so every conclusion
here rests on those; cost is quoted only where the counted measures agree with it.

## THE FULL RESULT — three arms

Arm three is the free alternative: no plugin, no per-turn rent, just context-mode's *argument*
rewritten against Claude Code's native tools in a 1.2 KB `CLAUDE.md`.

| task · model | arm | tool bytes | peak | cost | ctx calls |
|---|---|---|---|---|---|
| **code · Opus 5** | plain | 43.1 KB | 37.8K | $0.379 | — |
| | **plugin** | **19.2 KB (2.2×)** | **30.6K** | **$0.325** | 0 |
| | CLAUDE.md | 36.2 KB (1.2×) | 41.1K | $0.430 | 0 |
| **code · Haiku** | plain | 151.0 KB | 82.8K | $0.302 | — |
| | **plugin** | **52.7 KB (2.9×)** | **54.5K** | **$0.227** | 10 |
| | CLAUDE.md | 82.1 KB (1.8×) | 60.1K | $0.239 | 0 |
| **log · Opus 5** | plain | 0.8 KB | 18.2K | $0.088 | — |
| | plugin | 0.6 KB | 21.4K | $0.114 | 0 |
| | CLAUDE.md | 0.4 KB | 23.6K | $0.143 | 0 |
| **log · Haiku** | plain | 4.1 KB | 25.8K | $0.033 | — |
| | plugin | 1.0 KB (4.2×) | 26.1K | $0.026 | 3 |
| | **CLAUDE.md** | **0.1 KB (51×)** | **23.8K** | **$0.017** | 0 |

**What the third arm settled.** The free `CLAUDE.md` is real but *unreliable*: it wins the simple
aggregation cell outright (51× less into the window — the model writes one `awk` line and stops)
and it helps on Haiku code work, but on Opus code work it spans 38–120 KB run to run and ends up
costing more than plain. **The plugin is the consistent one**, and consistency is what a
recommendation needs. The prompt is worth copying; it is not a replacement.

## THE PER-CELL DETAIL

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

## OFF-CAMERA — what this means for iauteur

**The video must NOT mention iauteur, this repo, or that the tool was trialled here** (owner,
2026-09-16: a viewer has no idea what iauteur is, and it buries the point). On screen the test
bed is named plainly for what it is: a real open-source repository, `tt-a1i/archify`. What
follows is an internal engineering note only.

### Measured on this machine's own sessions

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

## Correction — `--plugin-dir` is NOT fully isolated

The validation runs were described as leaving `~/.claude` untouched. That was wrong, and it was
caught by hashing the config rather than by reasoning about it.

context-mode's postinstall writes a **global `SessionStart` hook** —
`~/.claude/hooks/context-mode-cache-heal.mjs`, plus the matching entry in `settings.json` — the
first time it loads, including under `--plugin-dir`. It is a real fix for a real Claude Code
issue (auto-update breaking `CLAUDE_PLUGIN_ROOT`), not anything sinister, but it means:

1. **A `--plugin-dir` load still writes outside the workspace.** `CONTEXT_MODE_DIR` redirects its
   SQLite stores and nothing else.
2. **`plugin uninstall` does not remove it.** After uninstalling the plugin and removing the
   marketplace, the hook, the `enabledPlugins` / `extraKnownMarketplaces` entries, the 157 MB
   plugin cache and `~/.claude/context-mode/` all remained. A hook pointing at a deleted plugin
   is a liability, so all of it was removed by hand and the config re-verified.

**The measurements are unaffected** — the hook heals cache paths and touches no token accounting —
but the isolation claim needed correcting, and a viewer installing this should know that removing
it is not a one-liner.

**Method lesson:** a hash proves a file changed; it cannot restore it. The baseline here was
snapshotted as a hash and the *content* copy was taken later, so the original bytes were
unrecoverable and the file had to be reconstructed field by field. Snapshot the CONTENT.
