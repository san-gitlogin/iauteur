# SQLite course — the capture decisions

**The transcripts live in [`TRANSCRIPTS.md`](TRANSCRIPTS.md), which is GENERATED from the
recordings themselves** (`node scripts/gen-captures.mjs sqlite sqlite-act1 sqlite-act2
sqlite-act3`). This file holds the part a generator cannot produce: why this version, why this
command, and what each beat is for.

That split is not tidiness. The transcripts were hand-written here first, and adding
`executemany` to Act III moved a running row count from 5 to 8 — so this file was wrong about
its own footage within the hour. The recording refused to film the stale number, which is the
anti-hallucination rule working, but nothing was ever going to catch the DOC. Now the doc is
derived, and `--check` fails when it drifts.

---

## The binary we teach

| | |
|---|---|
| Taught version | **SQLite 3.53.4** (2026-07-24) |
| Installed at | `tools/sqlite/sqlite3.exe` — gitignored, referenced as `{{TOOLS}}` |
| The machine's own CLI | 3.36.0 (2021-06-18) — **untouched** |
| Python's bundled engine | 3.37.2, under Python 3.10.4 |

**Why the isolated install matters, measured rather than assumed:** the machine's 3.36.0 does
**not** support `STRICT` tables (3.37+). A course written from memory would have taught
`CREATE TABLE ... STRICT`, and it would have failed on camera with `near "STRICT": syntax error`.
On 3.53.4 it works — and its type error is itself a lesson, which is why Act I records a
deliberately failing insert (`strict-error`, asserted at exit 1).

Act III runs on Python's own **3.37.2**, a different build from the 3.53.4 CLI, reading the very
same file. That is the lesson, not a mismatch to hide.

Also confirmed present on 3.53.4: `.mode box` (rounded borders, which hold up at video scale)
and `RETURNING` (3.35+), used so `UPDATE` and `INSERT` can *show* what they changed instead of
being followed by a second `SELECT`.

---

## The beats each act is built around

### ACT I — it is a FILE, not a server

The payoff is `Get-Item shop.db` printing **8192** bytes. Eight kilobytes, no port, no daemon.
That is the fact the whole course rests on, and it is a number on screen rather than a claim.

`strict-error` is the other load-bearing beat: STRICT is only teachable by watching it refuse
something. The step asserts **both** the exact message and exit code 1, so if a future SQLite
starts accepting the value the recording fails rather than quietly filming a lesson that is no
longer true.

`.schema` closes the act — the database describing itself, in the same words the viewer typed.

### ACT II — real querying

Two payoffs. First the JOIN: revenue per product, where the top row (`Mechanical keyboard`,
6 units, 534.0) is the arithmetic of two tables the viewer watched being filled.

Then the one that carries the act — **`SCAN orders` becomes `SEARCH orders USING INDEX
idx_orders_product (product_id=?)`**. One line of output, one word different, and that word is
the entire concept. Both are measured marks, so a neon callout can land on the changed token.

The `null` beat earns its place by settling the most-misunderstood thing in SQL in a single
query: `note = ''` renders a **blank** cell while `note IS NULL` renders **1**. Comparing to
NULL yields NULL, never true or false. No diagram needed — the two columns side by side are the
lesson.

### ACT III — the same file, from real code

`row-factory` is a small beat with a big payoff: `row[1]` versus `row["name"]`.

The strongest beat in the act is `run-params` — one row from the parameterised query, and the
**whole table** from the hand-built one.

**Why the injected rows print one per line, and why that is a CAPTURE decision rather than a
style one:** the first draft printed the whole list on a single `unsafe -> [...]` line. At
1600px that wraps across two xterm rows, and a callout rectangle is measured from ONE row
element — so the payoff could not have been highlighted at all. A row per line keeps every line
markable, and one safe result above four stolen ones is the better picture anyway.

`run-rollback` ends the act: delete everything, watch the connection report 0, then take it all
back. Nothing else makes a transaction feel real that quickly.

---

## Identity check (LAW 0m corollary 2 — this repo is PUBLIC)

No name, email, hostname or absolute path appears in any transcript. Two structural reasons
rather than one careful reading:

1. The recording prompt is primed to show only the workspace folder leaf (`PS shop>`), so a
   capture cannot put a home directory on screen.
2. The demo scripts reference the pinned binary as `{{TOOLS}}/sqlite/sqlite3.exe`, never a path
   off this machine, and `scripts/check-publish-safety.mjs` blocks the push if that ever
   regresses (it was tested against a deliberate plant and fires on both HOME_PATH and
   IDENTITY).
