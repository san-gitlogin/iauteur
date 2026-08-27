# SQLite — the course plan

**Interview answers on record (LAW 0):** surface = **CLI first, then Python** · aspects =
**16:9 + 9:16** · design pack = **moderndark** · voice = **en-US-AvaMultilingualNeural**.

Three deliverables:

| Cut | Target | Slug |
|---|---|---|
| Long | **20–30 min** | `sqlite-the-database-that-is-just-a-file` |
| Shorts (9:16) | ~50s | same topic, `shorts.json` |
| Short wide (16:9) | ~90s | `sqlite-scan-vs-search` |

---

## The spine

Every act ends on a fact the viewer watched appear on screen, not on a summary.

| Act | The question it answers | The beat it lands on |
|---|---|---|
| I | *Where does the database actually live?* | `shop.db  8192` — eight kilobytes, no server |
| II | *How does it find rows without reading them all?* | `SCAN orders` → `SEARCH orders USING INDEX` |
| III | *How do I use it from real code without getting owned?* | one row, versus the whole table |

---

## Runtime budget (LAW 0e rule 6a — budget SCENES, not words per scene)

A stepping scene earns up to 30s. 20 minutes is therefore **~45 scenes minimum**. The first
pass had 15 recorded steps, which carried about a third of that; the course now has **31**,
because the gap is filled by teaching more SQL and never by padding narration.

---

## ACT I — It is a file

| # | Beat | Surface | Status |
|---|---|---|---|
| 1 | Hook: you did not install anything | concept | to author |
| 2 | What SQLite is, and what it is not | **new component** `DB_TWO_WAYS` — a server with a port and a daemon beside a single file icon | **BUILT** |
| 3 | The version, and why the version matters | `rec#version` | **captured** |
| 4 | Making a table, line by line | `rec#create` | **captured** |
| 5 | What a column TYPE really promises | **new component** `TYPE_GATE` — a value walking at a gate that stamps it or turns it away | **BUILT** |
| 6 | STRICT, and the error that teaches it | `rec#strict-error` | **captured** |
| 7 | Putting rows in | `rec#insert` | **captured** |
| 8 | Reading them back | `rec#select` | **captured** |
| 9 | Asking for SOME of them — `WHERE` | `rec#where` | **captured** |
| 10 | Putting them in order — `ORDER BY` | `rec#order` | **captured** |
| 11 | Changing one — `UPDATE` … `RETURNING` | `rec#update` | **captured** |
| 12 | Removing one — `DELETE` | `rec#delete` | **captured** |
| 13 | `.schema` — the database describing itself | `rec#schema` | **captured** |
| 14 | **PAYOFF: it is 8192 bytes** | `rec#just-a-file` | **captured** |
| 15 | Where this is already running near you | **new component** `WHERE_IT_RUNS` — phone, browser, aircraft, all revealing the same file | **BUILT** |

## ACT II — Real querying

| # | Beat | Surface | Status |
|---|---|---|---|
| 16 | One table is never enough | **new component** `TABLE_SPLIT` — a fat table with a repeated column, splitting in two | **BUILT** |
| 17 | The second table | `rec#add-orders` | **captured** |
| 18 | What a JOIN actually does | **new component** `JOIN_MERGE` — two rows physically sliding together on the matching id | **BUILT** |
| 19 | The join, in the editor | `rec#open-revenue` | **captured** |
| 20 | The answer | `rec#revenue` | **captured** |
| 21 | Counting things — `COUNT`, `AVG` | `rec#aggregate` | **captured** |
| 22 | `GROUP BY` — one row per bucket | **new component** `GROUP_BUCKETS` — rows falling into labelled buckets, each collapsing to one | **BUILT** |
| 23 | `HAVING` vs `WHERE` | `rec#having` | **captured** |
| 24 | NULL is not zero, and not empty | `rec#null` | **captured** |
| 25 | How does it FIND a row? | **new component** `SCAN_VS_SEEK` — a finger down every row, versus a jump straight to one | **BUILT** |
| 26 | `EXPLAIN QUERY PLAN` — SCAN | `rec#plan-before` | **captured** |
| 27 | Adding the index | `rec#index` | **captured** |
| 28 | **PAYOFF: SEARCH USING INDEX** | `rec#plan-after` | **captured** |
| 29 | What an index costs | **new component** `INDEX_LEDGER` — the write side of the bargain | **BUILT** |
| 30 | Quiz (LAW 0e-q: gap + pause cue + `Ready?`) | concept | to author |

## ACT III — From real code

| # | Beat | Surface | Status |
|---|---|---|---|
| 31 | The same file, from Python | `rec#open-read` | **captured** |
| 32 | Connect, cursor, close | `rec#run-read` | **captured** |
| 33 | Getting columns by NAME | `rec#row-factory` | **captured** |
| 34 | Two ways to ask the same question | `rec#open-params` | **captured** |
| 35 | What a placeholder actually does | **new component** `PLACEHOLDER_SEAL` — a value handed over sealed, versus glued into the sentence | **BUILT** |
| 36 | **PAYOFF: one row, or all four** | `rec#run-params` | **captured** |
| 37 | Many rows at once — `executemany` | `rec#executemany` | **captured** |
| 38 | Writing, and the commit | `rec#run-write` | **captured** |
| 39 | What `rollback` is for | `rec#rollback` | **captured** |
| 40 | A transaction, depicted | **new component** `TRANSACTION_DOOR` — work staged behind a door that either opens or is swept away | **BUILT** |
| 41 | When SQLite is the wrong answer | **new component** `WHEN_NOT_SQLITE` — the writer queue backing up | **BUILT** |
| 42 | Recap — the three facts, each as it appeared | concept | to author |
| 43 | Outro / CTA | structural | to author |

---

## Component budget (LAW 0n corollary — plan PICTURES, not scene types)

**Eleven new pictures**, not eleven wrappers around a lit-up row list. Each is named by the
OBJECT the viewer should see, per LAW 0n's test:

| Component | Beat | Status |
|---|---|---|
| `DB_TWO_WAYS` | a tower you must build, beside a finished file | **BUILT** |
| `TYPE_GATE` | a value passed, a value refused, the real error | **BUILT** |
| `JOIN_MERGE` | two rows travel together and become one | **BUILT** |
| `SCAN_VS_SEEK` | a finger down every row, versus one jump | **BUILT** |
| `PLACEHOLDER_SEAL` | the sentence, and what a value does to it | **BUILT** |
| `TRANSACTION_DOOR` | the delete that ran without happening | **BUILT** |
| `GROUP_BUCKETS` | rows falling into buckets, each collapsing to one | **BUILT** |
| `TABLE_SPLIT` | a fat table with a repeated column, splitting in two | **BUILT** |
| `INDEX_LEDGER` | one write, two destinations, and the bill | **BUILT** |
| `WHERE_IT_RUNS` | four objects, one identical file inside each | **BUILT** |
| `WHEN_NOT_SQLITE` | readers stream through, writers queue at one door | **BUILT** |

**All eleven built**, every one verified by rendering at both aspects — and every one
of them had at least one defect that was invisible in the code and obvious in a still.
`FOREIGN_KEY_LINK` was dropped and replaced by `TABLE_SPLIT`: as specified it was a
second JOIN picture, and two components drawing the same relationship is exactly the
reuse LAW 0e rule 8 rejects.

None of them may be satisfied by `STICKY_NOTE`, `REVEAL`, `SPLIT_PATHS` or `ICON_GRID`
(LAW 0e rule 8 names those as the offenders).

---

## Capture backlog

15 steps exist. **14 more** are needed for the beats marked *to capture*:

- **act1**: `strict-error` · `insert` · `where` · `order` · `update` · `delete` · `schema`
- **act2**: `aggregate` · `having` · `null`
- **act3**: `row-factory` · `executemany` · `rollback`

Same rule as the first fifteen: run it, read it back, never write the transcript from memory.
`strict-error` is deliberately a FAILING command — the runner must report a real non-zero
exit and the real message, which is exactly what makes it teachable.
