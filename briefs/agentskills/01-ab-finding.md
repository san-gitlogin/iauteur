# The A/B finding — measured 2026-09-24

Rehearsed on throwaway copies of the sealed bench (method §7: diagnose on a copy, never the
real take). Both arms: same repo, same commit `2acf5b3`, same bug, all 25 skills installed
via `npx skills add addyosmani/agent-skills`, `claude --permission-mode bypassPermissions -p`.

The **only** difference between the arms is one sentence at the front of the prompt.

---

## The prompt

Control arm:

> In this repo, `slugifyWithCounter()` can hand out the same slug twice. `slugify('foo')`
> returns `foo`, calling it again returns `foo-2`, and then `slugify('foo 2')` also returns
> `foo-2` — two different inputs, one slug. Please fix it.

Invoked arm: **"Use the test-driven-development skill."** + the identical text.

---

## What the transcripts say (tool-call order — this is the evidence)

The agent's own prose summary is NOT evidence. Both arms wrote confident summaries; only one
of them had written a failing test. Read `~/.claude/projects/<ws>/<session>.jsonl`.

### Control — skills installed and advertised, never invoked

⚠ **The rehearsal and the RECORDED take differ, and the recorded one is what ships.** The
agent is nondeterministic: the rehearsal rewrote five existing assertions and deleted a
helper; the recorded take did neither. **Do not script the claim "it rewrites your tests" —
one run cannot support it.** What both runs share, and what the script may claim, is the
ORDER: the fix lands before any test exists, and no failing test is ever produced.

**The recorded take (`public/rec/askills-control`, 42.4s) — three tool calls, total:**

```
1. Bash   ls && cat index.js && grep -n "Counter" -A30 test.js && cat package.json
2. Bash   python3 … rewrite index.js        ← THE FIX, first thing it writes
3. Bash   node -e "… 2000 random sequences, assert no duplicate"   ← its own fuzz loop
```

No Skill tool call. No failing test. `index.js` +19 −6, `test.js` +14 −0 (assertions added
INSIDE the existing `counter` test — the suite still numbers 24 tests before and after).

**The strongest fact in the whole cut, and it is checkable on screen:** the control arm
**never ran the test suite.** It verified with a randomised fuzz loop it wrote itself, and
then reported:

> *"Existing behaviour is unchanged: all the old counter tests pass as before."*

That sentence is TRUE — `npm test` does pass, 24 tests — and the agent had not run it. It
asserted a test result it never measured. The repo's own README names this exact failure in
its design notes: *"Verification is non-negotiable … 'Seems right' is never sufficient."*

### Invoked — one sentence added (`public/rec/askills-invoked`, 58.7s)

```
1. Skill  test-driven-development           ← loads the skill body, FIRST thing it does
2. Bash   ls && cat package.json && cat index.js && grep -n "Counter" …
3. Bash   sed -n 255,300p test.js; git log --oneline | head
4. Bash   python3 … append 3 tests to test.js  &&  npx ava test.js   ← WRITE, then RED
5. Edit   index.js                          ← the fix, only now
6. Bash   npm test 2>&1 | tail -15          ← GREEN, the repo's own suite
7. Bash   sed -i '' …                       ← tidies one assertion message
```

`index.js` +22 −6, `test.js` **+24 −0**. Every pre-existing assertion left alone, and the
suite grew **24 → 27 tests**.

Note call 4: the write and the failing run are one Bash call, so "confirm RED" is real but
does not appear as its own line in the read-out. Say it accurately on camera — *it wrote the
tests and ran them in the same breath, and they failed* — rather than implying a separate step.

---

## The captured RED (the money frame — take 7), verbatim from the recorded run

```
counter skips a suffixed slug that an earlier literal input already took

test.js:278

 277:   t.is(slugify('foo'), 'foo');
 278:   t.is(slugify('foo'), 'foo-3');
 279:   t.is(slugify('foo'), 'foo-4');

Difference (- actual, + expected):

- 'foo-2'
+ 'foo-3'
```

…plus a second failure, `counter output stays unique across many mixed inputs`, which asserts
`new Set(slugs).size === slugs.length` over thirteen mixed inputs — a uniqueness property
rather than a fixed expectation. And the GREEN that follows: **`27 tests passed`**.

---

## Grading both arms against upstream `6d97501`

Upstream's fix: a `returned` Set beside `occurrences`, a `while` loop that bumps the counter
while the candidate is taken, and `reset()` clearing both. `index.js` +13 −4, `test.js` +30 −0.

All three reached the SAME mechanism. Upstream named it `returned`; both arms named it
`usedSlugs`. Take 8 puts the two diffs on screen one after the other.

| | upstream `6d97501` | invoked arm | control arm |
|---|---|---|---|
| second collection of handed-out slugs | `returned` Set | `usedSlugs` Set ✓ | `usedSlugs` Set ✓ |
| bump-while-taken loop | ✓ | ✓ | ✓ |
| `reset()` clears both | ✓ | ✓ | ✓ |
| existing assertions changed | none | none ✓ | none ✓ |
| tests in the suite afterwards | 24 → 25 | 24 → **27** | 24 → **24** |
| **loaded the skill** | — | **✓ first call** | **✗ never** |
| **a failing test was run** | ✓ | **✓ RED captured** | **✗ never** |
| **ran the repo's test suite** | ✓ | **✓ 27 passed** | **✗ never — a fuzz loop instead** |
| claimed a suite result anyway | — | — | **✓ "all the old counter tests pass as before"** |

**Say this out loud on camera:** both arms reached the same mechanism, and the mechanism is
the one the maintainer shipped. The skill did not make the agent smarter. It made the agent
*prove it* — and the arm that proved it is also the arm that did not quietly move the
goalposts by rewriting five tests it had not been asked to touch.

---

## What this means for the script

The honest claim, and the only one the footage supports:

> Installing a skill pack puts twenty-five descriptions in front of the model. It does not
> put twenty-five workflows into effect. Something still has to invoke the skill — and the
> difference that makes is not a better answer, it is an answer with proof attached.

Do **not** say the pack "makes agents write better code". The control arm's final code was
the same mechanism upstream shipped. Say what changed: **whether anything was ever proved.**

Three claims the footage supports, and nothing wider:

1. The control arm never loaded a skill, though all 25 were installed and advertised.
2. The control arm never ran the test suite — it wrote its own fuzz loop — and then reported
   that the suite passed.
3. The invoked arm loaded the skill first, wrote tests that failed, fixed, and ran the
   repo's own suite to 27 green.

Three claims to **avoid**, each of which one run cannot carry:

- "it rewrites your existing tests" — the rehearsal did, the recorded take did not.
- "the skill produces better code" — both mechanisms match upstream.
- "this is what always happens" — say *this run*, once, out loud. An agent is not a function.
