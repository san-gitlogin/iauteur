# agent-skills — PLAN (beat map + shoot list)

Shape: `topics/archify-live-map` (§6c of VIDEO_METHOD) — the reference cut for a video
about a GitHub project. Eighteen scenes, seven footage, the page beat at scene THREE.
Plus the A/B spine of `context-mode-measured` / `ocr-control` vs `ocr-blind`.

---

## THE REHEARSAL CHANGED THE VIDEO (2026-09-24, measured — see `01-ab-finding.md`)

The original plan assumed: install the pack, invoke the skill, film the Prove-It loop. The
throwaway rehearsal (method §7 — diagnose on a copy, never the real take) found something
better and more honest.

**With all 25 skills installed and advertised, a plain bug report did NOT use the skill.**
It patched `index.js` first and wrote tests afterwards — the exact failure TDD prevents —
and it rewrote five existing assertions to match its own fix.

The same bench, same bug, with the skill named in the prompt, called the Skill tool first,
wrote a failing test, confirmed RED, then fixed, then confirmed GREEN.

So the cut is now an **A/B with a control arm**, which is the channel's proven "measured"
shape and a far stronger argument than a single happy path. The claim it proves is precise:
*installing a skill advertises it; something still has to invoke it.*

| | control (advertised only) | invoked |
|---|---|---|
| first tool call | read code | **Skill → test-driven-development** |
| where the fix lands | call 4, `index.js` — **before any test** | call 5, after RED is confirmed |
| test.js | +28 −5 (rewrote existing assertions) | **+16 −0** (existing tests untouched) |
| a failing test ever existed | **no** | **yes** — 2 failures, captured |
| final suite | green | green, 26 tests |

Both arms found the same root cause as upstream `6d97501` (a Set of slugs already handed
out, plus a loop that keeps bumping). The difference is not the destination, it is whether
anything was ever proved on the way — and only the invoked arm matched upstream's
discipline of leaving existing behaviour alone.

**The captured RED, which is the money frame:**

```
✘ [fail]: counter never returns a slug it already returned
  Difference (- actual, + expected):
  - 'foo-2'
  + 'foo-2-2'
```

---

## The arithmetic, done BEFORE authoring

Eight footage takes. `RECORDED_STEP` is capped at `ceil(0.35 × scenes)`, so:

    8 / 0.35 = 23 scenes minimum

Target **26 scenes**, of which 8 footage (31%) and **18 drawn**. Those eighteen drawings are
not padding to clear a gate — they are the eighteen things a beginner needs explained, and
deciding them now is what stops the ratio from being "fixed" later by deleting teaching.

---

## The shoot list (record ALL of this before a word is written)

| # | demo slug | surface | what it films |
|---|---|---|---|
| 1 | `askills-gh` | browser | the official repo page: description, stars, MIT, the ASCII lifecycle, `## How Skills Work` |
| 2 | `askills-files` | vscode | `skills/test-driven-development/SKILL.md` — one file, its frontmatter, `ls skills/` → 25 |
| 3 | `askills-install` | vscode `terminalOnly` | `npx skills add addyosmani/agent-skills` → 25 skills, the symlinks, `skills-lock.json` |
| 4 | `askills-bug` | vscode `terminalOnly` | the sealed bench: `git log -1` at `2acf5b3`, the three-line repro, `npm test` → **24 passed, exit 0** |
| 5 | `askills-control` | vscode `terminalOnly`, **live agent** | the plain bug report. Skills installed, never invoked |
| 6 | `askills-control-diff` | vscode | what the control actually did: `git diff` — fix first, five assertions rewritten |
| 7 | `askills-invoked` | vscode `terminalOnly`, **live agent** | one sentence added. Skill tool → failing test → **RED** → fix → **GREEN** |
| 8 | `askills-key` | vscode | both diffs against upstream `6d97501` — the answer key |

Takes 5 and 7 each need their **own pristine copy of the bench**, because take 5 leaves the
repo modified. Reset with `git checkout -- . && rm -rf .agents .claude skills-lock.json`
between them, or clone two benches up front. Take 6 must run before take 7 touches anything.

Rules that apply to every terminal take: `terminalOnly: true`, **no** `maximizePanel` step,
`deviceScaleFactor: 4`, `masterWidth: 3840`, zooms ≤ 2x. Grep every capture for the
operator's name and email before it is drawn — `npm install` and `git` both leak identity.

---

## The beat map (26 scenes)

Footage beats are **bold**. Everything else is drawn. Three acts: what it is · the bench ·
the two runs.

| # | beat | type | what the viewer sees |
|---|---|---|---|
| 1 | HOOK | drawn | two different titles landing on one URL, then: "Twenty-four tests passed. The bug was still there." |
| 2 | TITLE_CARD | drawn | greet; "we install a skill pack on a real broken library, and run the same bug twice — once letting the agent do as it likes, once telling it to use the skill" |
| 3 | **the repo page** | **footage** | `askills-gh` — official page, said out loud. Description, stars, MIT, who wrote it |
| 4 | what a skill IS | drawn | a markdown file with two frontmatter lines — `name` and `description` — and nothing else |
| 5 | **the real file** | **footage** | `askills-files` — SKILL.md open, its frontmatter, `ls skills/` → 25 |
| 6 | description = trigger | drawn | the agent scanning 25 descriptions, one matching, that file's body dropping into context. No runtime, no API |
| 7 | advertised ≠ in effect | drawn | **the thesis, planted early**: a listing is a menu, not an order. Pay this off at beat 20 |
| 8 | the six phases | drawn | DIAGRAM flow (never `PIPELINE`) — Define → Plan → Build → Verify → Review → Ship, 25 skills placed |
| 9 | anti-rationalization | drawn | their own design choice: every skill ships a table of excuses agents use to skip steps, with rebuttals |
| 10 | CHAPTER | drawn | "Enough reading — let's install it and point it at something that is actually broken." |
| 11 | **install** | **footage** | `askills-install` — 25 skills, the symlinks, the lockfile |
| 12 | the library | drawn | what slugify does: a title in, a URL out. One sentence |
| 13 | the counter's job | drawn | a counter that exists for exactly one reason: never hand out the same slug twice |
| 14 | **the sealed bench** | **footage** | `askills-bug` — `git log -1` at `2acf5b3`, the repro, `npm test` → 24 passed |
| 15 | 24 green, still broken | drawn | **the hero picture**: a wall of 24 green ticks, the bug sitting outside the wall, untouched |
| 16 | the blind spot | drawn | the Map keyed on the *incoming* slug vs the set of slugs already *handed out* — the second set does not exist |
| 17 | CHAPTER: run one | drawn | "First, we just tell it what's broken. The skills are installed the whole time." |
| 18 | **the control run** | **footage** | `askills-control` — the live plain-prompt run |
| 19 | **what it did** | **footage** | `askills-control-diff` — fix at call four, tests last, five assertions rewritten |
| 20 | the menu, not the order | drawn | pays off beat 7: 25 descriptions were in context and nothing invoked one |
| 21 | Prove-It, the loop | drawn | RED → GREEN → REFACTOR as a ring that genuinely cycles, RED lit; "a test that passes immediately proves nothing" |
| 22 | **run two** | **footage** | `askills-invoked` — Skill tool first, failing test, **RED**, fix, **GREEN** |
| 23 | side by side | drawn | the two tool-call orders as two tracks; the fix moves from position 4 to position 5, and a RED appears between |
| 24 | **the answer key** | **footage** | `askills-key` — both diffs against upstream `6d97501` |
| 25 | the honest verdict | drawn | both reached the maintainer's mechanism. The skill didn't make it smarter — it made it prove it, and stop moving goalposts |
| 26 | OUTRO | drawn | the one line worth keeping, the repo URL, MIT |

**Component discipline:** no component may carry three beats (`lint-spec` warns at three —
SAME PICTURE THRICE). Eighteen drawn beats across at least eight distinct depictions.

---

## The pictures to build

One scene type, `ASKILL_STAGE`, dispatching these — the `uvViz`/`appleViz` shape, and the
reason `subTypeOf` in the linter needs an `ASKILL_STAGE` branch, or eight distinct pictures
count as one over-used component.

| kind | what it enacts | beats |
|---|---|---|
| `skill-file` | a markdown file, frontmatter lit, body greyed | 4 |
| `trigger-match` | 25 descriptions scanned, one matching, body entering context | 6 |
| `menu-not-order` | a listing sitting in context with nothing acting on it | 7, 20 |
| `lifecycle` | six phases as a DIAGRAM flow with 25 skills placed | 8, 9 |
| `slug-collision` | two different titles, one URL — an arrow collision | 1, 12, 13 |
| `green-wall` | **hero** — 24 ticks in a wall, the bug outside it | 15 |
| `counter-blindspot` | Map of inputs vs Set of outputs, the Set missing | 16 |
| `rgr-ring` | red-green-refactor cycling, exit node coloured apart | 21 |
| `two-tracks` | the two tool-call orders as parallel tracks, RED appearing in one | 23 |
| `verdict` | both fixes vs upstream, three columns | 25 |

Every element of every drawn beat takes an `atWord`. A picture that completes in the first
second and then sits still while the voice explains it is the dwell warning the linter
prints, and it is the difference between a drawing and a caption.

---

## Title (chosen AFTER measuring, per §5)

Runtime is free. Author every beat at the length the explanation needs, measure the cut,
then title with the next round number up. Working promise: *"24 tests passed. The bug was
still there."* — the strongest true sentence this footage produces.

Thumbnail: big title, tags in the badge, real brand logos along the bottom. The shorts
cover gets the same care — the subject drawn through `art`, full size, never a glyph on black.
