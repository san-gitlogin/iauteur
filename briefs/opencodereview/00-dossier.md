# Open Code Review — production dossier

Subject: **alibaba/open-code-review** (`ocr`), Apache-2.0, Go.
Every claim below is traced to a primary source: the repo's own README, the two PNGs the README
embeds, the GitHub API, the npm registry API, or a command we ran on this machine on 2026-09-17.
**No number in this dossier came from a blog post.** Two third-party blogs quote the benchmark
correctly, but the authoritative copy is `imgs/benchmark-en.png` in the repo, read directly.

---

## 1 · What it is, in one sentence

An AI code-review CLI that pairs a **deterministic pipeline** (which files, which rules, where the
comment lands) with an **LLM agent** (which does the judging) — so the parts that must not go wrong
are handled by code, not by a prompt.

Repo description, verbatim (GitHub API, 2026-09-17):

> Fast, efficient, battle-tested at Alibaba's scale. Hybrid architecture code review tool:
> deterministic pipelines + LLM Agent, precise line-level comments, built-in multi-language ruleset
> (NPE, thread-safety, XSS, SQL injection), OpenAI & Anthropic compatible.

README, verbatim:

> It originated as Alibaba Group's internal official AI code review assistant — over the past two
> years, it has served tens of thousands of developers and identified millions of code defects.
> After thorough validation at massive scale, we incubated it into an open source project.

## 2 · Repo facts (GitHub API + npm API, 2026-09-17)

| Fact | Value | Source |
|---|---|---|
| Stars | **33,639** | `gh api repos/alibaba/open-code-review` |
| Forks | 2,396 | same |
| License | **Apache-2.0** | same |
| Language | **Go** | same |
| Created | **2026-05-18** | same |
| Latest release | **v1.12.4**, 2026-09-16 | `releases/latest` |
| Contributors | ~176 | contributors API, last page |
| npm, last 30 days | **329,386** | `api.npmjs.org` — matches the README's "329K+" exactly |
| npm, last 7 days | 93,428 | same |
| Installed for this video | `ocr` **v1.12.4** (`f1101fd7f`) darwin/arm64 | `ocr --version` |

> ⚠ **Stars move fast** — this repo is on Trendshift and gained ~22k in the window where blogs
> quoted 11,801. **The number said aloud must match the frame we film.** Re-read it at record time
> and write the recorded value here before voicing. LAW: numbers come from the frames that ship.

Badges on the page (film these): Trendshift trending, npm version, build status, Apache-2.0,
DeepWiki, **OpenSSF Best Practices — Gold**, platform badges (Windows/macOS/Linux), agent badges
(Claude Code / Codex / Cursor / Kimi Code), and five README translations (EN/中文/日本語/한국어/Русский).

## 3 · The headline strip (`imgs/highlights-en.png`, read off the image)

| 20K+ | 3M+ | 329K+ | 1/9 | 25.10% |
|---|---|---|---|---|
| internal active users | real-world tasks | npm downloads | token cost | AACR-Bench |
| Battle-tested inside Alibaba Group | Code review tasks executed to date | last 30 days | **vs. Claude Code · 1,000 PRs** | SEM.F1 benchmark score |

**Important nuance, and we say it out loud:** the *1/9 token* figure is measured over **1,000 PRs**,
a different and larger sample than the 200-PR leaderboard. On the leaderboard's own same-model row
the ratio is steeper (1/14.7). Quote 1/9 as *the project's stated figure* and let the table speak
for itself; do not present 1/14.7 as "the" number.

## 4 · The benchmark — AACR-Bench (`imgs/benchmark-en.png`, read off the image)

Built from **50** popular open-source repos, **200** real Pull Requests, **10** languages,
cross-validated by **80+ senior engineers**, **1,505** annotated ground-truth issues.
Dataset is public on Hugging Face: `Alibaba-Aone/aacr-bench`.

The rows that matter (verbatim from the image):

| # | Model | Harness | F1 | Precision | Recall | Avg time | Avg token |
|---|---|---|---|---|---|---|---|
| 1 | Claude-4.6-Opus | **Open Code Review** v1.3.1 | **25.10%** | 33.90% (301/889) | 20.00% (301/1505) | **1m23s** | **385K** |
| 2 | Qwen3.8-Max | Open Code Review v1.8.7 | 23.00% | 33.90% (262/774) | 17.40% | 5m14s | 334K |
| 7 | Claude-4.8-Opus | Open Code Review v1.3.1 | 17.90% | **37.80%** (176/465) ← best precision in the table | 11.70% | 1m6s | 352K |
| 9 | Claude-4.8-Opus | Claude Code v2.1.169 | 14.13% | 15.93% (191/1200) | 12.70% | 5m38s | 2,062K |
| 12 | Claude-4.6-Opus | **Claude Code** v2.1.169 | 11.57% | 7.23% (435/5980) | **28.90%** ← best recall | 13m6s | 5,664K |
| 14 | GPT-5.5 | Codex v0.140.0 | 8.36% | 27.82% (74/266) | 4.92% | 2m58s | 525K |

### The same-model comparison — the spine of the video

Same model (Claude-4.6-Opus), two harnesses:

|  | Open Code Review | Claude Code | ratio |
|---|---|---|---|
| F1 | 25.10% | 11.57% | **2.2× better** |
| Precision | 33.90% | 7.23% | **4.7× better** |
| Recall | 20.00% | 28.90% | 0.69× — **OCR is worse, on purpose** |
| Time | 1m23s | 13m6s | **9.5× faster** |
| Tokens | 385K | 5,664K | **14.7× fewer** |

### The single most teachable pair of numbers in the whole project

Look at the precision fractions, not the percentages:

- Claude Code reported **5,980 findings** to correctly identify 435 real defects → **5,545 false alarms.**
- Open Code Review reported **889 findings** to correctly identify 301 → **588 false alarms.**

That is the whole argument in two counts, and it is drawable: a wall of ~6,000 comment pills where
only 435 light up, beside a much smaller wall of 889 where 301 light up. This is the "fewer findings
is the feature" beat, and it is honest in both directions.

### Be honest about the ceiling — this is a trust beat, do not cut it

33.9% precision means **two out of every three things OCR reports are still not real defects**, and
20% recall means **it misses four defects in five**. Both tools are far from solved. Saying this out
loud is what separates a review from an advert, and it is the correct reading of the table.

Two further honest notes:
- The benchmark's own harness versions differ across rows (OCR v1.3.1/v1.8.7 vs Claude Code
  v2.1.169), and it is **Alibaba's own benchmark of Alibaba's own tool**. Name that.
- **Alibaba published a leaderboard that their own model does not win.** #1 is Anthropic's
  Claude-4.6-Opus; Alibaba's Qwen3.8-Max is #2. That is a real mark of good faith and is worth
  fifteen seconds — it is the reason to take the rest of the table seriously.
- The benchmark predates the Claude 5 family; it measures 4.6/4.8-Opus.

## 5 · The mechanism (README "Core Design", verbatim claims)

**The problem it names with general-purpose agents:** incomplete coverage ("agents tend to cut
corners" on large changesets), **position drift** (line numbers drift off target), and unstable
quality (prompt-sensitive). Root cause, in their words: *"a purely language-driven architecture
lacks hard constraints on the review process."*

**Deterministic half — hard constraints:**
1. **Precise file selection** — which files to review, which to filter.
2. **Smart file bundling** — related files become one review unit; each bundle is a sub-agent with
   isolated context (divide and conquer; enables concurrency).
3. **Fine-grained rule matching** — a template engine matches rules to each file's characteristics.
4. **External positioning and reflection modules** — separate passes for *where* the comment lands
   and *whether the content holds up*.

**Agent half — dynamic decisions:** scenario-tuned prompts, and a scenario-tuned toolset distilled
from production tool-call traces (call frequency, per-tool repetition, effect of new tools on the
call chain).

### ★ The best single discovery in this research

`ocr rules check <path>` prints the exact rule text the model will be given for that file. Two
commands put the entire thesis on screen:

- `ocr rules check main.go` → **Pattern `**/*.go`**, a deep Go-specific checklist: typed nil in a
  non-nil interface, copying a `sync.Mutex` after first use, `sync.Once` not retrying after a
  panic, `%w` vs `%v` error wrapping, context inheritance.
- `ocr rules check README.md` → **Pattern `default`**, a generic four-bucket checklist:
  *"Is the logic correct? Are there security vulnerabilities such as SQL injection or XSS?"*

Specific versus generic, side by side, in plain text. And the Go ruleset **opens with the design
philosophy in one readable line**:

> *"Favor precision over recall: report only defects that are likely real in the changed code and
> its reachable context. **A false positive costs reviewer trust.**"*

That sentence is the bridge from the benchmark to the mechanism: the precision/recall trade in the
table is not an accident of the model, it is **an instruction written into the rule file**. If the
video has one "oh, that's how it works" moment, this is it.

It also instructs the model *not* to duplicate what `go vet`, Staticcheck, `go test -race`, the
compiler or `gofmt` already catch — i.e. the deterministic tools keep their job, and the LLM is
pointed only at what they cannot express.

## 6 · The two execution modes — say which one is on camera

| | **Default (OCR-managed)** | **Delegation mode** |
|---|---|---|
| Who runs the LLM | OCR, via its own configured provider | **your coding agent, with its own model** |
| API key needed | yes (`ocr config provider` / `model`) | **no** |
| Commands | `ocr review` | `ocr delegate preview` → `ocr delegate rule` |
| Claude Code slash command | `/open-code-review:review` | `/open-code-review:delegate-review` |
| Is this what the benchmark measured? | **yes** | **no** |

**We film delegation mode**, because there is no OCR LLM provider configured on this machine, and
because it is the mode that matches the video's hook — it runs *inside* Claude Code on Claude
Code's own model. **The narration must say plainly that the benchmark numbers were measured in the
default mode, not the mode on screen.** (Method: *"the report you build is not the report the tool
builds — say which is which."*)

Delegation mode is also the better teaching artifact: the hybrid architecture becomes **three
visible commands** — OCR selects the files, OCR supplies the rules, the agent does the judging.
You can watch the seam between deterministic and probabilistic.

## 7 · Install path (verbatim, both verified on this machine)

```bash
npm install -g @alibaba-group/open-code-review   # → ocr v1.12.4
```
Inside Claude Code:
```text
/plugin marketplace add alibaba/open-code-review
/plugin install open-code-review@open-code-review
```
Installs `/open-code-review:review` and `/open-code-review:delegate-review`.

What the slash commands actually do (read from the plugin's own command `.md` files, not the docs):
- **`review`** — runs `ocr review --audience agent`, then the host agent **triages** every comment
  High/Medium/Low, **silently discards Low**, shows the rest, and **autonomously applies fixes**.
- **`delegate-review`** — `ocr delegate preview` → `ocr delegate rule <paths>` → agent reads each
  diff and reviews → classify, discard Low, **auto-fix High and Medium that are safe and well-defined**.

So the payoff beat is not "it printed a list" — it is **it found the bug and then fixed it.**

### ⚠ Prerequisite that bit us, and belongs on camera
**Git ≥ 2.41 is required.** This machine had Apple git **2.39.5**, and every `ocr` invocation
printed `warning: git 2.39.5 is older than the minimum supported version 2.41.0`. Fixed with
`brew install git` → **2.55.0**, which resolves ahead of `/usr/bin/git` on PATH. Verify the warning
is absent before recording — it must not appear in a single frame.

## 8 · The live demonstration — target and why

**`grpc/grpc-go` PR #9290 — "endpointsharding: decouple locking, and simplify ChildState API"**
Merged 2026-08-14 · `https://github.com/grpc/grpc-go/pull/9290` · merge `538bb2f7`
Base merge-base: `fa603ec26e697cf94db719db21a38d7dde24c033` · head fetched as `pr9290` (`8683e19a`).

Five files, +183/−192. Three are reviewable production Go; two are tests, excluded automatically.

Why this PR:
- It is a **concurrency refactor** — a two-level locking strategy in a load balancer. Locking is the
  single hardest thing to review by eye, which makes it the fair, interesting test.
- The PR body itself claims the result is **"deadlock-free"** and describes a strict lock hierarchy.
  A claim on the record is something we can point a reviewer at.
- It is Google-maintained, in a repo the audience knows, and it was **approved and merged by humans.**
- OCR's Go ruleset has dedicated sections on exactly this: mutex copying, `sync.Once`, goroutines
  and cancellation, value semantics.

**Verified on this machine (real output, 2026-09-17):**

```
$ ocr delegate preview --from fa603ec2… --to pr9290
# Files (3 reviewable / 5 total)
- mode: range
- total_insertions: 183
- total_deletions: 192
  - balancer/endpointsharding/endpointsharding.go [modified] +168/-171
  - balancer/ringhash/picker.go                   [modified] +1/-1
~~- balancer/ringhash/picker_test.go  [modified] +1/-11 (excluded: default_path)~~
  - balancer/ringhash/ringhash.go                 [modified] +11/-9
~~- balancer/ringhash/ringhash_test.go [modified] +2/-0 (excluded: default_path)~~
```

**This one screen is the deterministic half doing its whole job**, and it is already legible: a
count, a mode, and two files struck through **with a stated reason**. Film it and hold it.

`ocr delegate rule <the three paths>` then returns **78 lines** headed:

```
### Rule Group 1: system / **/*.go
Applies to:
  - balancer/endpointsharding/endpointsharding.go
  - balancer/ringhash/picker.go
  - balancer/ringhash/ringhash.go
```

— which is **smart file bundling**, visible: three files, grouped by shared rule content, one unit.

### Run A findings (vetting run, 2026-09-17) — **nothing at High or Medium**

The delegated review came back clean, and it showed its work: it checked lock ordering and
deadlocks, an unlocked write to `epState.endpoint`, unsynchronised reads of `es.endpoints`, a loop
variable captured in a closure (safe — the module targets Go 1.25), `ExitIdle` racing `Close`, and
the removal of the `ExitIdler` interface against every caller in the repo.

**This is not a failed demo — it is the control, and it is the precision claim demonstrated.**
Pointed at code three Google engineers already approved, it added **zero noise**. A reviewer that
never says "nothing to report" is a reviewer nobody keeps. But it cannot carry the video alone, so
it is paired with Run B below.

---

## 8b · Run B — the blind test, and the reason this video is worth making

A tool review is only interesting if the tool is given something it can fail. So the second run is
a **genuine blind test against a bug that really shipped**, with no staging and no planted code.

**`grpc/grpc-go` PR #7461** — *"grpc: make client report `Internal` status when server response
contains unsupported encoding"* — commit `6d0aaaec`, 2024-08-06, by a Google engineer, reviewed and
merged. Base `338595ca`. 4 files, +95/−16; `test/compressor_test.go` is auto-excluded, leaving
`rpc_util.go`, `server.go`, `stream.go`.

**Seven days later**, commit `5c4da090` landed with the message — verbatim —
> **`grpc: fix a bug introduced in #7461 (#7505)`**

That is the answer key, written by the maintainers, in the git history. We do not show it to the
reviewer.

### The bug, exactly

PR #7461 rewrote two call sites in `stream.go` from an assignment to a short variable declaration:

```go
// before
err = recv(a.p, cs.codec, a.s, a.dc, m, *cs.callInfo.maxReceiveMessageSize, nil, a.decomp)
if err == nil {
    return toRPCErr(errors.New("grpc: client streaming protocol violation: get <nil>, want <EOF>"))
}
if err == io.EOF { return a.s.Status().Err() }
return toRPCErr(err)

// after  ← the defect
if err := recv(a.p, cs.codec, a.s, a.dc, m, *cs.callInfo.maxReceiveMessageSize, nil, a.decomp, false); err == nil {
    return toRPCErr(errors.New("grpc: client streaming protocol violation: get <nil>, want <EOF>"))
}
if err == io.EOF { return a.s.Status().Err() }   // ← a DIFFERENT err
return toRPCErr(err)                              // ← always nil here
```

`err :=` declares a **new** `err` whose scope is the `if` statement only. The two lines below it
now read the enclosing function's *named return value* `err` (from
`func (a *csAttempt) recvMsg(m any, payInfo *payloadInfo) (err error)`), which is still `nil`.
So the real error from `recv` is thrown away: `err == io.EOF` is never true, and the function
returns `toRPCErr(nil)`. **A failed receive reports success.** Identical defect at both call sites
(`csAttempt.recvMsg` and `addrConnStream.RecvMsg`).

Why this is the ideal test case:
- **It compiles.** The type checker has nothing to say.
- **`go vet` does not catch it** — shadow analysis is not in the default vet suite.
- **Human reviewers at Google missed it**, and it shipped in a release.
- It is a **two-character** change with a real, user-visible consequence.
- It is trivially drawable: two boxes both labelled `err`, one of which only exists inside the `if`.

And OCR's own Go ruleset claims this territory — "Errors, Panics, and API Contracts": *"Errors
returned from calls that are ignored, overwritten, or converted into success/default values that
hide a failed operation."* That is a verbatim description of this bug. So the test is fair: we are
asking the tool to find the thing its own rules say it looks for.

**`ocr delegate preview` on that range, verified on this machine:**
```
# Files (3 reviewable / 4 total)  · from 338595ca → pr7461 · +95/-16
  - rpc_util.go  [modified] +12/-6
  - server.go    [modified] +1/-1
  - stream.go    [modified] +5/-9
~~- test/compressor_test.go [modified] +77/-0 (excluded: default_path)~~
```

### Blind-run result — **it found it. Both call sites. High severity.**

Run 1 (2026-09-17, full clone) reported, verbatim:

> 1. **High**, `stream.go:1124`: in `csAttempt.recvMsg`, the second `recv` call now uses
>    `if err := recv(...)`, so that `err` only exists inside the `if`. The `err == io.EOF` check and
>    `return toRPCErr(err)` below it (lines 1127–1130) now read the function's return value `err`,
>    which is still nil. … Callers see success, and `clientStream.RecvMsg` calls `cs.finish(nil)`,
>    so stats and retry logic also treat the call as successful.
> 2. **High**, `stream.go:1444`: `addrConnStream.RecvMsg` has the same scoping bug. … the deferred
>    `as.finish(err)` records the call as successful instead of failed.
>
> The fix for both is to keep the old `err = recv(...)` assignment for the second call.

**Every line number verified exact** against `git show pr7461:stream.go`: 1124 is the
`if err := recv(...)` line, 1127 the `io.EOF` check, 1130 the `return toRPCErr(err)`; 1444/1447/1450
are the same three at the second site. **No position drift** — which is the specific failure mode
the README accuses general-purpose agents of, so this is a fair on-camera test of that claim too.

It also went *past* the maintainers' own commit message by naming the downstream consequences
(`cs.finish(nil)`, stats and retry logic recording a failed call as successful), correctly cleared
`rpc_util.go` and `server.go`, and noted the missing regression test — which is exactly the test the
maintainers added in the follow-up.

### ⚠ Integrity check on that run, and the re-run

The first run was executed in a **full clone, where `git log --all` still reached the fix commit
`5c4da090`** (verified: `git log --all --oneline | grep -c 5c4da090` → `1`). Nothing in the output
suggests the agent read it, and the diagnosis is derived from the code — but "probably didn't peek"
is not a standard this video can ship on. LAW: check against evidence, not intent.

So the run was repeated in a **truncated workspace** built with
`git fetch --depth=2 origin 6d0aaaec`, containing only `6d0aaaec` and its parent `338595ca`, with
the answer key verified absent (`grep -c 5c4da090` → `0`). **That truncated workspace is what the
camera records**, and the verification command belongs on screen: proving the answer was unreachable
is part of the demonstration, not a footnote.

Result of the clean re-run: _see `briefs/opencodereview/02-blindrun.md`._

### ⚠ Fairness condition for the recorded take
The clone must **not** contain the future. At `pr7461` the fix commit `5c4da090` is still reachable
via `git log --all` / other branches, and an agent that greps the history could read the answer key.
For the take, build the workspace as a repo truncated at `6d0aaaec` (e.g. clone, `git checkout
--orphan`-free approach: `git fetch --depth` the two commits only, or delete all other refs and
`git reflog expire`/`gc`). Verify with `git log --all --oneline | grep 5c4da090` returning nothing
**before** the camera rolls. Reviewing a diff is what the workflow does anyway, but the test is only
honest if the answer is genuinely unreachable.

## 9 · Recording notes (carry forward from the last two cuts)

- `"terminalOnly": true` on every agent take. **Do not** also add a `maximizePanel` step —
  a toggle called twice is a no-op wearing a success message.
- Check the Claude Code footer for a weekly-usage warning before choosing cut points; it must
  never ship.
- Set the clone's own `CLAUDE.md`/`.claude` aside during a take so the agent does not load this
  repo's production laws, and restore after.
- `deviceScaleFactor: 4` + `masterWidth: 3840`, zooms ≤ 2x.
- Grep every capture for the operator's identity before it is drawn (git name/email).
- A mark must point at a laid-out row; long output scrolls the target away — print less.
- The GitHub page beat is **scene three**, before the mechanism.

## 10 · Sources

- `https://github.com/alibaba/open-code-review` — README, `imgs/benchmark-en.png`,
  `imgs/highlights-en.png`, `plugins/open-code-review/README.md`,
  `plugins/open-code-review/claude-code/commands/{review,delegate-review}.md`
- GitHub REST API (repo metadata, releases, contributors), 2026-09-17
- `api.npmjs.org` download counts, 2026-09-17
- `https://huggingface.co/datasets/Alibaba-Aone/aacr-bench` — the benchmark dataset
- `https://github.com/grpc/grpc-go/pull/9290` — the PR reviewed on camera
- Commands run locally on 2026-09-17: `ocr --version`, `ocr rules check`, `ocr delegate preview`,
  `ocr delegate rule`
- ⚠ `https://open-codereview.ai/docs/*` returns **404** to a plain HTTP client (client-side routed
  site). The README links there heavily. Do not cite a docs URL we could not open — the repo is the
  source of truth for this cut.
