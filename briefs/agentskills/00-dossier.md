# agent-skills — the Prove-It pattern · DOSSIER

Every number here was measured **on this machine on 2026-09-24**, not read off a README.
LAW 0m: if a number is spoken in the cut, it came from a command run here, and the frame
that ships is the frame it was read from.

Topic: `topics/agent-skills-prove-it` · design `moderndark` · voice Ava Multilingual +8% (unchanged)
Format: both (wide 1920×1080 + short 1080×1920)

---

## 1. The subject

**`addyosmani/agent-skills`** — "Production-grade engineering skills for AI coding agents."

Read from the GitHub API (`gh api repos/addyosmani/agent-skills`), 2026-09-24:

| field | value |
|---|---|
| stars | **98,799** |
| forks | **10,380** |
| licence | MIT |
| created | 2026-02-15 |
| last push | 2026-09-23 |
| homepage | `skills.addy.ie` |
| topics | agent-skills, antigravity, claude-code, codex, cursor, skills |
| author | Addy Osmani (@addyosmani) |

**Say "ninety-nine thousand" only if the frame shows it.** The star count moves; re-read it
immediately before the record take and use whatever the captured frame says.

Contents of the clone (verified by `ls`, not by the README):

- `skills/` — **25** directories, each one skill
- `commands/` — **9** `.toml` files: `build, code-simplify, constraints, planning, review, ship, spec, test, webperf`
- `agents/` — 4: `code-reviewer, security-auditor, test-engineer, web-performance-auditor`
- `hooks/` — `session-start.sh`, `sdd-cache-*.sh`, `simplify-ignore.sh` (+ their `-test.sh` twins)
- `evals/`, `references/`, `docs/`, `scripts/`
- `AGENTS.md`, `CLAUDE.md`, `plugin.json`, `.claude-plugin/`, `.codex-plugin/`, `.gemini/`, `.opencode/`, `.agents/`

The six phases and their skills (from the README, cross-checked against `ls skills/`):

| phase | skills |
|---|---|
| Define | interview-me · idea-refine · spec-driven-development · constraint-driven-development |
| Plan | planning-and-task-breakdown |
| Build | incremental-implementation · test-driven-development · context-engineering · source-driven-development · doubt-driven-development · frontend-ui-engineering · api-and-interface-design |
| Verify | browser-testing-with-devtools · debugging-and-error-recovery |
| Review | code-review-and-quality · code-simplification · security-and-hardening · performance-optimization |
| Ship | git-workflow-and-versioning · ci-cd-and-automation · deprecation-and-migration · documentation-and-adrs · observability-and-instrumentation · shipping-and-launch |

Plus the meta-skill `using-agent-skills` (25th).

### Install lines (both are real; film the Claude Code one)

    npx skills add addyosmani/agent-skills          # the cross-agent CLI, 70+ agents
    /plugin marketplace add addyosmani/agent-skills # Claude Code
    /plugin install agent-skills@addy-agent-skills

---

## 2. The mechanism — what a "skill" actually is

`skills/test-driven-development/SKILL.md` — **one markdown file, 16,517 bytes, nothing else
in the directory.** Its entire frontmatter:

```yaml
---
name: test-driven-development
description: Drives development with tests using the red-green-refactor loop. Use when
  implementing any logic, fixing any bug, or changing any behavior. Use when you need to
  prove that code works, when a bug report arrives, or when you're about to modify existing
  functionality.
---
```

**This is the beat that makes the whole thing click, and it must be said in plain words:**
the `description` is not documentation — it is the *trigger*. The agent reads every skill's
description, and when your request matches one, that file's body is loaded into the
conversation. A skill is a markdown file the agent decides to read. There is no runtime, no
plugin API, no compilation step. Say that out loud; a beginner will otherwise assume it is code.

`commands/test.toml` is the other half — a slash command is a `description` plus a `prompt`
string that says *"Invoke the test-driven-development skill"* and then spells out the loop.
Show both files on screen: the command is the doorbell, the skill is the room.

The `/test` prompt, verbatim, carries the pattern we are about to film:

> For bug fixes (Prove-It pattern):
> 1. Write a test that reproduces the bug (must FAIL)
> 2. Confirm the test fails
> 3. Implement the fix
> 4. Confirm the test passes
> 5. Run the full test suite for regressions

And the skill's own first rule, which is the thesis of the video:

> Write the test first. It must fail. **A test that passes immediately proves nothing.**

Also worth one beat — the skill refuses to assume the toolchain:

> Never assume a default like `npm test` — a Gradle, Cargo, or pytest project has its own equivalent.

---

## 3. The demonstration — a real bug, with an answer key

Not a toy. `sindresorhus/slugify`, 2,703 stars, MIT, the library that turns a title into a
URL slug. We check out the commit **before** a real fix, let the skill work blind, then
compare what it wrote against what the maintainer actually shipped.

This is the `ocr-blind` shape that worked: a sealed workspace with a known answer.

| | |
|---|---|
| repo | `sindresorhus/slugify` (2,703 stars, MIT) |
| we check out | **`2acf5b3`** — tagged `3.0.1`, the parent |
| the real fix | **`6d97501`** — "Fix `slugifyWithCounter()` returning the same slug twice (#82)", 2026-09-09 |
| fix size | `index.js` +13 −4 · `test.js` +30 −0 |
| node here | v23.11.0 · test runner `xo && ava` |

### The bug, in three lines anyone understands

Measured here at `2acf5b3`:

```
slugify("foo")   -> foo
slugify("foo")   -> foo-2
slugify("foo 2") -> foo-2      ← the same slug, twice
```

The counter's only job is to never repeat itself, and it repeats itself. Two different
titles, one URL. The cause: the counter is keyed on the *incoming* slug, so it cannot see a
slug it previously handed out by appending a number to a *different* input.

### The fact that carries the video

At `2acf5b3`, with the bug live:

```
$ npm test
  24 tests passed
$ echo $?
0
```

**Twenty-four green tests and the bug is still there.** That is the argument for writing the
failing test first, and it is footage, not a claim. Open on it.

### The answer key (do not show before the agent has finished)

Upstream added a `returned` Set beside the existing `occurrences` Map, and a loop that keeps
bumping the counter while the candidate is already taken:

```js
const returned = new Set();
...
while (returned.has(result.toLowerCase())) {
  newCounter += 1;
  occurrences.set(stringLower, newCounter);
  result = `${string}-${newCounter}`;
}
returned.add(result.toLowerCase());
```

…and `countable.reset()` clears both. The shipped test covers four cases: the collision in
each order, a run that must bump twice (`bar`, `bar 2`, `bar 3`, `bar` → `bar-4`), and a
case-insensitive collision with `{lowercase: false}`.

**If the agent's fix differs from upstream, that is a result, not a failure — say so on
camera and read both.** The claim being tested is that the skill produces a failing test
first and a green suite after, not that it channels Sindre Sorhus.

---

## 4. What must not happen

- **No number spoken that is not on the frame that ships.** Star counts especially.
- **The agent take is `terminalOnly: true`.** No `maximizePanel` step beside it — a toggle
  called twice is a no-op wearing a success message.
- **Film the repo page early, scene 3**, and say out loud it is the official page.
- **The suite must be run before the fix on camera.** "24 passed" pre-fix is the whole point;
  if it is only asserted in narration the video has no evidence.
- The workspace is sealed at `2acf5b3` with no remote history visible, so the agent cannot
  read the future. Prove it on camera with `git log --oneline -1`.
