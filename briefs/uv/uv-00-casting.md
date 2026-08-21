# Casting board — uv chapter 00

LAW 0c: picked per beat, with a stated reason, before any scene JSON is written.
LAW 0e r.1: the ideal component was described in `uv-00-beats.json` FIRST; the library was
opened afterwards. Board run: `node scripts/cast.mjs` over all 341 types.

## What the board actually said

The top matches were `SCOPE_LADDER` for a `ModuleNotFoundError` cold open, `MCP_REACH` for
"what is a package", `RULE_TEST` for a broken import. Scores of 8–16 on keyword overlap
with `use_when` text describing **Playwright fixtures and MCP boundaries**. Not one beat
had a candidate above the ~90% bar LAW 0e r.1 sets.

That is the expected result, not a failure of the board: 341 types built for four courses
about other subjects. The board did its job by making the absence legible instead of
letting me reach for the nearest-looking card.

## The architecture finding that decides everything

The Linux course is not 116 components. It is **one shell plus 56 pictures**:

- `src/CommandStage.tsx` — the two-up shell. Real terminal left, effect pane right.
  Every element resolves from its own `atWord` via `wordToFrame`; the file states outright
  that nothing runs on a fixed interval, which is LAW 0i satisfied in code.
- `src/linuxViz.tsx` — `REGISTRY`, **56 depiction kinds** (`fs-tree`, `net-path`,
  `perm-switches`, …). `Depiction` dispatches on a string.
- The 116 `CMD_*` scene types are thin wrappers: pick a viz kind, pass steps through.

So **the picture lives in the depiction, not the scene type.** LAW 0n says exactly this —
registering a type and wiring eight touchpoints is plumbing, not a depiction. Building 22
new scene types for this chapter would be 22 units of plumbing around the same problem.

**Decision: uv's objects are built as new DEPICTION KINDS, reusing the stage.** That is
also what the Linux register's own correction points to — 98 planned types, 6 shipped,
56 depictions doing the actual work.

## Two defects in the existing stage, found by reading it

1. **`CommandStage` is hard-locked to two-up.** Both panes always render:
   `flex: '1 1 46%'` terminal, `'1 1 54%'` effect, no single-pane mode. **This is the
   direct cause of the empty left pane in two of the four frames I sampled** — a beat whose
   terminal has nothing to say yet still renders an empty 46% of the screen. It also makes
   the template unavoidable: every beat that uses the stage is a split, forever.
2. **`Depiction` falls back silently:** `const R = REGISTRY[kind] ?? FileContent`. Name a
   kind that does not exist and you get a generic file pane with no error. That is LAW 0n's
   "scan for the fallback, do not eyeball it" waiting to happen. **A new-kind typo would
   render something plausible and wrong.**

Both need addressing before uv scenes are written. Fix 1 is a `layout?: 'split' | 'terminal'`
prop — small, additive, and it fixes the empty-pane defect for the whole existing library,
not just this course. Fix 2 is a dev-time throw plus a linter check that every `kind` used
in a spec exists in `REGISTRY`.

## Per-beat casting

| Beat | Decision | Reason |
|---|---|---|
| s01 cold open, real traceback | stage in **terminal-only** mode | The beat is one screen failing. An effect pane here would be the empty 46% that ruins the sampled frames. Needs fix 1. |
| s02 title card | **REUSE** `TITLE_CARD` | Structural furniture, exempt (LAW 0e r.8). |
| s03 open the loop | **BUILD** `two-projects` | Two folders, one touched, the other going dark. Nothing in the library draws project-level blast radius; `RESPONSIBILITY_SPLIT` sorts lines into bins, which is a different assertion. |
| s04 what a package is | **BUILD** `pkg-parcel` | The object is a sealed parcel whose **version field** is the moving part. `ICON_CALLOUT` would print it; this must enact a version changing. |
| s05 where they come from | **BUILD** `pkg-index` | A warehouse the parcel is pulled from. Deliberately not a cloud glyph (LAW 0j). |
| s06 install lands | **REUSE** stage + `pkg-parcel` | Genuine two-up: a real command AND a visible effect, simultaneously. This is what the split is *for*. |
| s07 four arrived | **REUSE** stage + **BUILD** `dep-unfold` | pip prints the constraint beside each extra package, so the terminal carries real content the whole beat. The right pane opens the parcel and the note names the others. |
| s08 silent hold | stage in **terminal-only** mode | A 2–3s look-at-it beat on real output (LAW 0e r.4). No second pane, by definition. |
| s09–s10 one shelf, two demands | **BUILD** `shelf-share` | Two projects reaching into one shelf; one slot, two competing labels. The reaching is the animation. |
| s11 the eviction | **REUSE** stage + **BUILD** `shelf-evict` | pip narrates the overwrite itself, so the terminal is live throughout; the shelf shows the old label lifted out. Answers s03's loop. |
| s12 ERROR then Successfully | **terminal-only, full-bleed** | Two real adjacent lines contradicting each other. Splitting this would weaken it — PLAN.md: two panes is not the only layout. |
| s13 nothing crashes | **REUSE** stage + `shelf-evict` | The one beat where two-up is the argument: shelf visibly wrong on one side, program visibly running on the other. Both true at once. |
| s14 `pip check` | **REUSE** stage + `shelf-evict` (health phase) | One row of the shelf failing. A phase of an existing kind, not a new one. |
| s15 wrong shelf | **REUSE** `shelf-share` (second mode) | Same object, different failure: the program pointed at the shelf that lacks the parcel. A mode, not a new kind. |
| s16 quiz | **REUSE** `QUIZ_CARD` | Furniture, exempt. Must carry a real thinking gap (LAW 0e-q). |
| s17–s18 walls go up | **BUILD** `shelf-split` | The single shelf dividing, both versions coexisting. The wall going up IS the idea. |
| s19 the ceremony | **BUILD** `env-ceremony` | The create/activate/forget ritual as a sequence you must perform every time. |
| s20 it collapses | **REUSE** `env-ceremony` (collapse phase) | The whole ritual folding into one line. Same object, and the collapse only reads because s19 built it. |
| s21 recap | **REUSE** `RECAP` | Furniture. Ties back to established objects; no new pictures. |
| s22 outro | **REUSE** `OUTRO_CTA` | Furniture. |

## Totals

**BUILD — 7 depiction kinds:** `two-projects`, `pkg-parcel`, `pkg-index`, `dep-unfold`,
`shelf-share`, `shelf-evict`, `shelf-split`, `env-ceremony`
(8 listed; `shelf-evict` covers s11/s13/s14 and `shelf-share` covers s09/s10/s15, so several
beats share one kind with different phases — that is contrast, not reuse-as-defect.)

**BUILD — 0 new scene types.** The uv chapters ride the existing stage.

**ENGINE — 2 small fixes**, both benefiting the whole library:
`layout: 'split' | 'terminal'` on `CommandStage`, and a loud failure for an unknown
depiction kind.

**REUSE — 5 furniture types** (`TITLE_CARD`, `QUIZ_CARD`, `RECAP`, `OUTRO_CTA`, plus `HOOK`
if s01 needs it) and **`CommandStage` itself**, whose written reason is: uv is a
command-line tool, the stage already types real commands per word anchor with multi-line
real output, and rebuilding that would be waste. That is the ~90% match LAW 0e r.1 asks for.

Compare to PLAN.md's opening guess of 16 new components. The Linux register's correction —
98 planned, 6 built — was the right prior, and this is what it looks like applied.

## Split discipline for this chapter

Of 22 beats, **4 use the two-up split** (s06, s07, s11, s13) — each because a command and
its effect are genuinely simultaneous. **3 are terminal-only** (s01, s08, s12). The rest are
one full picture or furniture. That ratio is the point: in the sampled Linux frames the
split was 4 of 4.
