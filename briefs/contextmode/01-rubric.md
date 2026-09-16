# Test 1 rubric — established from source BEFORE either run

Repo under test: `tt-a1i/archify` @ `62a2f4a3fe76946b56354ea7db2d47d0d763ae5b` (shallow clone,
2026-09-16), package `archify` 2.17.0-dev.1, MIT.

Scored blind: both transcripts are graded against this table, which was written first.

## The task, given verbatim to both runs

> In this repository, find every composition check that runs ONLY when `--quality showcase` is
> passed. For each one, give the exported function name, the file, the line it is declared on,
> and the diagnostic code it emits. Then name one composition check that looks similar but runs
> at every quality level, and say how you can tell the difference.

Chosen because the answer is finite, exact, and sits inside a 57 KB file — so the plain-tools
path puts real weight in the window, and a wrong answer is unmistakable.

## Ground truth

All in `renderers/shared/geometry.mjs`. A gate is showcase-only when it early-returns on
`qualityProfileForGate(profile, profileIsAuthoritative) !== 'showcase'`.

| # | exported function | declared | guard line | diagnostic code(s) |
|---|---|---|---|---|
| 1 | `cleanCrossingProblems` | 484 | 495 | `composition/proper-crossing` |
| 2 | `cleanAmbiguousCorridorProblems` | 622 | 633 | `composition/ambiguous-corridor` |
| 3 | `cleanRouteRhythmProblems` | 858 | 870 | `composition/micro-segment` **and** `composition/short-interior-segment` |
| 4 | `cleanLabelRouteClearanceProblems` | 901 | 913 | `composition/label-route-clearance` |

**Four functions, five codes.**

## The trap

`cleanBorderRunProblems` (line 715, code `composition/container-border-run`) is the distractor.
It reads almost identically but its guard is `if (!qualityProfileForGate(...)) return []` — it
requires a profile to *exist*, not to *equal* `showcase`, so it runs at **standard too**.

Telling the difference requires reading the guard expression, not the function name or the
message text. A run that skims will list five gates and be wrong.

## How the profile is resolved (supporting detail, credit if mentioned)

`renderers/shared/cli.mjs:155-156` — `process.env.ARCHIFY_QUALITY_PROFILE || meta.quality_profile`,
then anything that is not exactly `showcase` collapses to `standard`.
`qualityProfileForGate` (geometry.mjs:946) lets the env var override a non-authoritative profile.

## Scoring

| points | criterion |
|---|---|
| 5 | one per correct diagnostic code found |
| 4 | one per correct function name |
| 4 | one per correct file+line (±3 lines tolerated) |
| +3 | identifies `cleanBorderRunProblems` as the non-showcase lookalike |
| +2 | explains the guard difference (`!== 'showcase'` vs truthiness) |
| −3 | **each** invented gate, wrong code, or showcase-only claim about border-run |

Max 18. A run scoring below 12 has not answered the question, whatever it cost.

## Context pressure this task creates

| file the naive path reads | lines | bytes |
|---|---|---|
| `renderers/shared/geometry.mjs` | 1,423 | 57,175 |
| `bin/archify.mjs` | 2,139 | 78,627 |
| `renderers/shared/cli.mjs` | 218 | 10,188 |
| **total** | **3,780** | **145,990** |

~146 KB of source, roughly 40K tokens, about a fifth of the 200K window — before the model has
written a sentence. That is the pressure the experiment is measuring.
