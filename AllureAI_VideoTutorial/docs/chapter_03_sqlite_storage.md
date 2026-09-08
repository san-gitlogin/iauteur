# Chapter 3 — Planning a Database Before You Touch a Single Line of Code

## The promise of this chapter

By the end of this chapter, someone watching has:

- learned the actual thinking process behind designing a database, before any SQL is written
- seen four different kinds of data (short text, long text, tables, images) sorted into the right kind of column
- built a real SQLite database from a plan file, and printed the real result back to prove it matches

No web requests, no browser, no third-party installs. Just `sqlite3`, which ships inside Python already.

---

## What has to be true before you record

Nothing extra to install. `sqlite3` is part of the Python standard library.

```powershell
python --version
python -c "import sqlite3; print(sqlite3.sqlite_version)"
```

On the machine this was built on: `Python 3.14.6`, SQLite version printed successfully (bundled with Python, no separate install needed).

---

## The narration script

### Scene 1 — Don't write SQL yet. Ask a question first.

**SCREEN:** A blank whiteboard or blank text file — no code yet.

**SAY:**

"Before we write a single line of SQL, I want to ask one question out loud: what different KINDS of data do we actually have? Not field names yet — just kinds.

We've got short text, like a test's name, or whether it passed or failed. We've got long text, like a big error message or a stack trace. We've got small structured tables, like that CSV of timing results from Chapter 1. And we've got raw images — an actual screenshot, made of bytes, not letters.

That's it. Four kinds. And here's the useful bit — SQLite only really gives you a small handful of storage boxes to put things in: plain text, whole numbers, decimal numbers, and raw bytes. So 'planning a schema' really just means matching each kind of data we have to the right box SQLite gives us."

### Scene 2 — Drawing the shape before the SQL

**SCREEN:** A simple hand-drawn-style diagram (or a whiteboard tool) — three boxes stacked: Report, containing Test Case, containing Step, containing Attachment, with arrows showing "one report has many test cases, one test case has many steps, one step has many attachments."

**SAY:**

"And this shape isn't new — this is exactly the shape we already discovered in Chapter 2 when we wrote our decoder. One report holds many test cases. One test case holds many steps, in order. One step holds however many pieces of evidence it needs. We're not inventing a new plan here — we're just giving the plan we already proved works a permanent home."

### Scene 3 — Turning the plan into SQL, table by table

**SCREEN:** `schema.sql`, built one table at a time, pausing on each.

**SAY (on the `reports` table):**

"First table, `reports`. One row per time you ran your whole test suite. Simple counts, a name, a timestamp."

**SAY (on the `test_cases` table):**

"Second table, `test_cases`. Notice `failure_message` and `failure_trace` — these are the long-text box. And notice this line right here."

```sql
report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE
```

"That's how we say 'this test case belongs to that report.' And `ON DELETE CASCADE` means if you ever delete a report, its test cases get cleaned up automatically instead of being left behind as orphans."

**SAY (on `test_steps`):**

"Third table, steps. Same idea, one level down, and notice `step_order` — a plain number, so we can always show steps in the order they actually ran, not some random database order."

**SAY (on `attachments`, the important one):**

"And here's the table where our four kinds of data question actually shows up in the SQL. Look —"

```sql
text_content    TEXT,     -- used for text/plain, text/html, text/csv
binary_content  BLOB      -- used for image/png and anything else non-text
```

"Two columns, side by side. For any given attachment, exactly one of these gets filled in, and the other one stays empty. A screenshot fills `binary_content` and leaves `text_content` empty. A CSV table fills `text_content` and leaves `binary_content` empty. That's the whole trick for storing 'different types of data' in one table — you don't force everything into one column, you give each kind of data its own column, and only use the one that fits."

### Scene 4 — Building it for real

**SCREEN:** `init_db.py`, quick read-through — not much to it, on purpose.

**SAY:**

"This script does two things. It reads our plan file and runs it, which creates the actual database file on disk. And then — because I don't want you to just trust me that it worked — it asks SQLite itself to describe every table it just made, and prints that back."

**SCREEN:** Terminal.

```powershell
python init_db.py
```

**SAY (real output from this exact run):**

```
Database created at: ...\tutorial.db

Table: attachments
  - id               INTEGER     [PRIMARY KEY]
  - step_id          INTEGER     [NOT NULL]
  - name             TEXT        [NOT NULL]
  - mime_type        TEXT        [NOT NULL]
  - text_content     TEXT
  - binary_content   BLOB

Table: reports
  - id               INTEGER     [PRIMARY KEY]
  - report_name      TEXT        [NOT NULL]
  - created_at       TEXT        [NOT NULL]
  - passed_count     INTEGER     [NOT NULL]
  - failed_count     INTEGER     [NOT NULL]

Table: test_cases
  - id               INTEGER     [PRIMARY KEY]
  - report_id        INTEGER     [NOT NULL]
  - name             TEXT        [NOT NULL]
  - status           TEXT        [NOT NULL]
  - failure_message  TEXT
  - failure_trace    TEXT

Table: test_steps
  - id               INTEGER     [PRIMARY KEY]
  - test_case_id     INTEGER     [NOT NULL]
  - step_order       INTEGER     [NOT NULL]
  - name             TEXT        [NOT NULL]
  - status           TEXT        [NOT NULL]
```

"There it is. Not something I typed up for the video — that's SQLite itself, describing the database we just built, back to us, in plain sight."

### Scene 5 — Wrap-up

**SAY:**

"So here's what actually happened. We didn't start with SQL. We started by asking what kinds of data we actually have. We matched each kind to a plain, sensible column type. We wrote that plan down as four small tables, connected to each other the same way our real data is already connected. And then we built it for real, and had the database itself confirm it back to us.

Next time, we're going to take the decoder we built in Chapter 2 and this database we just built, and connect them — decode a real report, and actually put its data in here, permanently. See you there."

---

## What to show on screen — director's notes

| Moment | What to show | Why |
|---|---|---|
| Scene 1 | Four small icons appearing one at a time — a letter "T" for short text, a paragraph icon for long text, a small grid for tables, a picture icon for images | Makes "four kinds of data" a visual list before any SQL exists |
| Scene 2 | The nested-box diagram, drawn live, stroke by stroke | Reinforces the shape from Chapter 2 without repeating the whole decoder explanation |
| Scene 3 (attachments table) | Split the screen — SQL on the left, and on the right, a small screenshot thumbnail feeding into a "BLOB" box while a CSV icon feeds into a "TEXT" box | Makes the "one column stays empty" rule visual, not just spoken |
| Scene 4 | The terminal output appearing table by table, matching pace with the narration reading each one | Avoids a wall of text dumping all at once |
| Scene 5 | The four-table diagram from Scene 3, with a small arrow pointing off-screen toward a "decoder" icon from Chapter 2 | Sets up next chapter visually |

### Suggested on-screen animation / graphic overlays

- **Scene 1:** Each of the four data-kind icons drops into its own small labelled box (TEXT, INTEGER, REAL, BLOB) with a soft snap animation, like a sorting game.
- **Scene 2:** The nested boxes (Report > Test Case > Step > Attachment) draw themselves in with a thin outline animation, one border at a time, each with a small "1 → many" arrow between levels.
- **Scene 3:** As `ON DELETE CASCADE` is highlighted, show a tiny animated sequence — a report box gets an "X" through it, and its child test-case boxes fade away a beat later, a step behind, showing the cascade visually.
- **Scene 4:** Each printed table name gets a small green checkmark stamp as it appears, building a short row of four checkmarks by the end.
- **Scene 5:** A slow zoom-out from the four-table diagram to reveal a fifth, dotted-outline box labelled "decoder" off to the side, with a "next time" label — a soft hook into Chapter 4.

---

## Key takeaways

1. Plan a schema by asking "what kinds of data do I have," not by guessing column names first.
2. SQLite gives you a small number of true storage types — match your data kinds to them honestly instead of stuffing everything into TEXT.
3. A table that stores "different types of attachments" doesn't need a clever trick — it just needs one column per kind of data, with the rule that only one of them is ever filled in per row.
4. Foreign keys with `ON DELETE CASCADE` keep a database from filling up with orphaned rows when a parent record is removed.
5. Always ask the database to describe itself back to you (`PRAGMA table_info`) after creating a schema — don't just trust that your SQL file did what you meant.

---

## Verified facts used in this script

- `python init_db.py` really created `tutorial.db` and printed the four real tables (`attachments`, `reports`, `test_cases`, `test_steps`) with their real column names, types, and NOT NULL/PRIMARY KEY flags exactly as shown above (the `sqlite_sequence` internal bookkeeping table SQLite creates automatically was also present, and is fine to mention or skip on camera).
- No third-party packages used anywhere in this chapter — `sqlite3` is part of the Python standard library, confirmed by successfully importing it and printing `sqlite3.sqlite_version` before writing this script.

## Files that belong in the project folder for this chapter

```
chapter_03_sqlite_storage/
  schema.sql      <- the plan: 4 tables, matching Report > TestCase > Step > Attachment
  init_db.py      <- builds tutorial.db from schema.sql and prints it back
  tutorial.db     <- generated, empty database (structure only, no data yet)
```
