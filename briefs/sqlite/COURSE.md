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

A stepping scene earns up to 30s. 20 minutes is therefore **~45 scenes minimum**, and the
existing 15 recorded steps carry only about a third of that. **The gap is filled by teaching
more SQL, never by padding narration.** The additional captures below exist for that reason.

---

## ACT I — It is a file

| # | Beat | Surface | Status |
|---|---|---|---|
| 1 | Hook: you did not install anything | concept | to author |
| 2 | What SQLite is, and what it is not | **new component** `DB_TWO_WAYS` — a server with a port and a daemon beside a single file icon | to build |
| 3 | The version, and why the version matters | `rec#version` | **captured** |
| 4 | Making a table, line by line | `rec#create` | **captured** |
| 5 | What a column TYPE really promises | **new component** `TYPE_GATE` — a value walking at a gate that stamps it or turns it away | to build |
| 6 | STRICT, and the error that teaches it | `rec#strict-error` | **to capture** |
| 7 | Putting rows in | `rec#insert` | **to capture** |
| 8 | Reading them back | `rec#select` | **captured** |
| 9 | Asking for SOME of them — `WHERE` | `rec#where` | **to capture** |
| 10 | Putting them in order — `ORDER BY` | `rec#order` | **to capture** |
| 11 | Changing one — `UPDATE` … `RETURNING` | `rec#update` | **to capture** |
| 12 | Removing one — `DELETE` | `rec#delete` | **to capture** |
| 13 | `.schema` — the database describing itself | `rec#schema` | **to capture** |
| 14 | **PAYOFF: it is 8192 bytes** | `rec#just-a-file` | **captured** |
| 15 | Where this is already running near you | **new component** `WHERE_IT_RUNS` — phone, browser, aircraft, all revealing the same file | to build |

## ACT II — Real querying

| # | Beat | Surface | Status |
|---|---|---|---|
| 16 | One table is never enough | **new component** `FOREIGN_KEY_LINK` — a row reaching across and holding an id | to build |
| 17 | The second table | `rec#add-orders` | **captured** |
| 18 | What a JOIN actually does | **new component** `JOIN_MERGE` — two rows physically sliding together on the matching id | to build |
| 19 | The join, in the editor | `rec#open-revenue` | **captured** |
| 20 | The answer | `rec#revenue` | **captured** |
| 21 | Counting things — `COUNT`, `AVG` | `rec#aggregate` | **to capture** |
| 22 | `GROUP BY` — one row per bucket | **new component** `GROUP_BUCKETS` — rows falling into labelled buckets, each collapsing to one | to build |
| 23 | `HAVING` vs `WHERE` | `rec#having` | **to capture** |
| 24 | NULL is not zero, and not empty | `rec#null` | **to capture** |
| 25 | How does it FIND a row? | **new component** `SCAN_VS_SEEK` — a finger down every row, versus a jump straight to one | to build |
| 26 | `EXPLAIN QUERY PLAN` — SCAN | `rec#plan-before` | **captured** |
| 27 | Adding the index | `rec#index` | **captured** |
| 28 | **PAYOFF: SEARCH USING INDEX** | `rec#plan-after` | **captured** |
| 29 | What an index costs | **new component** `INDEX_LEDGER` — the write side of the bargain | to build |
| 30 | Quiz (LAW 0e-q: gap + pause cue + `Ready?`) | concept | to author |

## ACT III — From real code

| # | Beat | Surface | Status |
|---|---|---|---|
| 31 | The same file, from Python | `rec#open-read` | **captured** |
| 32 | Connect, cursor, close | `rec#run-read` | **captured** |
| 33 | Getting columns by NAME | `rec#row-factory` | **to capture** |
| 34 | Two ways to ask the same question | `rec#open-params` | **captured** |
| 35 | What a placeholder actually does | **new component** `PLACEHOLDER_SEAL` — a value handed over sealed, versus glued into the sentence | to build |
| 36 | **PAYOFF: one row, or all four** | `rec#run-params` | **captured** |
| 37 | Many rows at once — `executemany` | `rec#executemany` | **to capture** |
| 38 | Writing, and the commit | `rec#run-write` | **captured** |
| 39 | What `rollback` is for | `rec#rollback` | **to capture** |
| 40 | A transaction, depicted | **new component** `TRANSACTION_DOOR` — work staged behind a door that either opens or is swept away | to build |
| 41 | When SQLite is the wrong answer | **new component** `WHEN_NOT_SQLITE` — the writer queue backing up | to build |
| 42 | Recap — the three facts, each as it appeared | concept | to author |
| 43 | Outro / CTA | structural | to author |

---

## Component budget (LAW 0n corollary — plan PICTURES, not scene types)

**Eleven new pictures**, not eleven wrappers around a lit-up row list. Each is named by the
OBJECT the viewer should see, per LAW 0n's test:

`DB_TWO_WAYS` · `TYPE_GATE` · `WHERE_IT_RUNS` · `FOREIGN_KEY_LINK` · `JOIN_MERGE` ·
`GROUP_BUCKETS` · `SCAN_VS_SEEK` · `INDEX_LEDGER` · `PLACEHOLDER_SEAL` ·
`TRANSACTION_DOOR` · `WHEN_NOT_SQLITE`

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
