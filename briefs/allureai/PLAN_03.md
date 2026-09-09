# Chapter 3 — Planning a database before writing a line of SQL

## Verified on THIS machine (2026-09-09)

Python **3.12.2**, SQLite **3.45.1** (bundled — nothing to install). The doc was written
against Python 3.14.6; do not quote its version.

`python init_db.py` creates `tutorial.db` and prints back four tables plus SQLite's own
`sqlite_sequence` bookkeeping table:

```
attachments   id, step_id, name, mime_type, text_content, binary_content
reports       id, report_name, created_at, passed/failed/broken/skipped_count
test_cases    id, report_id, name, status, failure_message, failure_trace
test_steps    id, test_case_id, step_order, name, status
```

`schema.sql` is 71 lines: 4 `CREATE TABLE` and 3 `CREATE INDEX`, one index per foreign key.
`init_db.py` is 65 lines. Two files, 136 lines, and no third-party import anywhere.

## The chapter's real argument

It is NOT "here is some SQL". It is: **decide what kinds of data you have, then match each
kind to a storage box the database actually offers.** Four kinds against four boxes:

| the data | example from chapter 1 | the box |
|---|---|---|
| short text | a scenario name, a status | `TEXT` |
| long text | an AssertionError trace | `TEXT` |
| small tables | the three-row timing CSV | `TEXT` (it is still text) |
| raw bytes | a PNG screenshot | `BLOB` |

`text_content` and `binary_content` sitting side by side in `attachments` is the whole
chapter in one row: the same idea as chapter 1's two-question rule, now expressed as a
schema. That callback should be explicit on camera.

## Pictures this chapter needs

Three of these do not exist yet:

1. **`type-boxes`** — four kinds of data on the left, four SQLite storage types on the
   right, each dropping into its box as it is named. The chapter's thesis, drawn.
2. **`schema-tree`** — reports > test_cases > test_steps > attachments, with the foreign
   key drawn as the physical link. This is `nested-boxes` from chapter 2 turned into
   tables, so it must LOOK related — same colours, same order.
3. **`index-lookup`** — a scan reading every row against an index jumping straight to it.
   Justifies the three `CREATE INDEX` lines instead of leaving them as noise.

Reuse from chapter 2: `nested-boxes` for the object shape before it becomes tables.

## Continuity to protect

- Chapter 2 ended on "these objects go into a database". Chapter 3 must open on the same
  three classes and show the tables being derived FROM them, not invented.
- Four outcome counts on `reports` are the same four from chapter 1. Say so.
- Chapter 4 fills this database. Chapter 3 only builds it empty — say that out loud so
  nobody waits for data that is not coming.

## Arithmetic

`init_db.py` (65) + `schema.sql` (71) is far less typing than chapter 1, so expect ~12–14
recorded beats -> **at least 40 scenes**, ~26 drawn. Shorter chapter, ~20 minutes.
