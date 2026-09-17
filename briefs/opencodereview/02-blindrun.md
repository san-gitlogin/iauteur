# The blind run — verified record

Two delegated reviews, both executed on this machine on **2026-09-17**, both with
`claude -p` driving the `/open-code-review:delegate-review` workflow verbatim, both
read-only. Nothing here is paraphrased into a stronger claim than the transcript supports.

---

## Run A — the control · `grpc/grpc-go` PR #9290

Range `fa603ec2` → `pr9290`. "endpointsharding: decouple locking, and simplify ChildState API."
A concurrency refactor, reviewed and merged by Google engineers, still correct today.

**Result: nothing at High or Medium.** Zero comments.

It listed what it had ruled out and why — lock ordering and deadlock freedom, an unlocked write to
`epState.endpoint`, unsynchronised reads of `es.endpoints` across four methods, a loop variable
captured in a closure (safe: the module targets Go 1.25), `ExitIdle` racing `Close`, the removal of
the `ExitIdler` interface checked against every caller in the repo, and the ringhash changes.

**What this proves, and it is the point of running it:** pointed at good code, it added no noise.
A reviewer that never says "nothing to report" is a reviewer nobody keeps, and 7.23% precision is
what the alternative looks like. This is the precision column, demonstrated rather than quoted.

---

## Run B — the blind test · `grpc/grpc-go` PR #7461

Range `338595ca` → `6d0aaaec`. "grpc: make client report `Internal` status when server response
contains unsupported encoding." Merged 2024-08-06. **Seven days later** the maintainers landed
`5c4da090` — *"grpc: fix a bug introduced in #7461 (#7505)"*.

The reviewer was told none of that.

### Fairness — established before the result, not after

| | Run B-1 | **Run B-2 (the one we film)** |
|---|---|---|
| Workspace | full clone | `git fetch --depth=2 origin 6d0aaaec` |
| Commits reachable | entire history | **2** — `6d0aaaec` + parent `338595ca` |
| `git log --all \| grep -c 5c4da090` | **1** ⚠ | **0** ✅ |
| Verdict | correct, but not provably blind | **provably blind** |

B-1 got the right answer, but the answer key was reachable, so it does not count. B-2 is the run of
record. `git log --all --oneline` returning two lines belongs **on camera** — proving the future was
unreachable is part of the demonstration.

### Result: found, both call sites, High severity

> 1. **High**, `stream.go:1124`: the second `recv` in `csAttempt.recvMsg` now declares a new `err`
>    that only exists inside the `if`. So the `err == io.EOF` check and `return toRPCErr(err)` after
>    it read the function's return value `err`, which is still nil here. … For unary and
>    client-streaming RPCs this silently drops: a non-OK trailer status that `a.s.Status().Err()`
>    would have returned; transport errors; errors for an oversized second message or a bad
>    decompression — **including the new `Internal` error for unsupported encoding this change was
>    meant to surface.** The attempt is then finished as a success.
>
> 2. **High**, `stream.go:1444`: `addrConnStream.RecvMsg` has the same problem. … Its deferred
>    `as.finish(err)` then records the call as successful, which counts failed calls as succeeded
>    and hides the real status.
>
> The fix is to keep the original `err = recv(...)` assignment for these two second-receive calls,
> **or to check `io.EOF` and return `toRPCErr` inside the same `if/else`.**

### ★ The line that makes the video

> *"including the new `Internal` error for unsupported encoding this change was meant to surface."*

**The bug defeats the exact feature the pull request was written to add.** #7461 exists to surface an
`Internal` status; the shadowed `err` swallows it. The PR broke its own headline feature, three
Google reviewers approved it, it shipped — and a machine reading only the diff caught it in about two
minutes. That is the emotional peak of the cut and it is entirely true.

### Verification of every claim before it goes on screen

| Claim | Check | Result |
|---|---|---|
| `stream.go:1124` is the `if err := recv(...)` line | `git show pr7461:stream.go` line 1124 | ✅ exact |
| 1127 is `if err == io.EOF` | same | ✅ exact |
| 1130 is `return toRPCErr(err)` | same | ✅ exact |
| 1444/1447/1450 the same three at site two | same | ✅ exact |
| No position drift | all six line numbers | ✅ **0 drift** |
| Its suggested fix matches the real one | `git show 5c4da090` | ✅ the maintainers used the `if/else` form it named second |
| The two test files were auto-excluded | `ocr delegate preview` | ✅ `(excluded: default_path)` |

**Zero position drift on six cited line numbers** is itself a filmable result: "reported issues
frequently don't match the actual code location" is the README's own accusation against
general-purpose agents, and this is that claim under test.

---

## What must NOT be claimed

- **This is not the benchmark.** These runs are **delegation mode** — Claude Code's own model did the
  judging. The 25.10% F1 / 33.90% precision figures were measured in **OCR-managed** mode. Two
  different configurations. The narration says so.
- **Two PRs is not a sample.** n=2, chosen by us. It is a demonstration, not a measurement. Say
  "here is what happened when we pointed it at these two" — never "it catches bugs 100% of the time."
- **The deterministic half is OCR's in both runs.** File selection, exclusions and rule matching came
  from `ocr`; that part is the same in either mode, and it is the part the video is really about.
- One run per PR. We did not average, retry, or cherry-pick a best-of. If a filmed take differs from
  these transcripts, **the filmed take is what ships** — a rerun is a different take.

## Environment noise to strip before recording

The dry runs printed a trailing line about **Gmail / Google Calendar connectors needing
authorisation** — MCP config from this session leaking into the nested run. It has nothing to do with
OCR and must not appear in a frame. Launch the recorded take with MCP connectors disabled, and check
the tail of the transcript before cutting.

Also: `--audience agent`, `terminalOnly: true`, no `maximizePanel` step, and check the Claude Code
footer for the weekly-usage warning before choosing cut points.
