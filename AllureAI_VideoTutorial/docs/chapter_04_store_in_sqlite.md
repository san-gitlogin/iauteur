# Chapter 4 — Decoding a Report and Actually Keeping It

## The promise of this chapter

By the end of this chapter, someone watching has:

- taken the decoder from Chapter 2 and the database from Chapter 3 and joined them into one working pipeline
- watched a real screenshot land in the database as raw binary bytes, and a real log land as readable text, in the same run
- seen all four real outcomes - passed, failed, broken, skipped - land correctly, both per test case AND in the report's own summary row
- read the data straight back out of SQLite to prove nothing got lost or mixed up along the way

This is the shortest chapter of the series in terms of new ideas — that's on purpose. The hard thinking already happened in Chapters 2 and 3. This chapter is where it pays off.

---

## What has to be true before you record

You need `bundle.html` from Chapter 2 and `schema.sql` from Chapter 3. This chapter's folder already carries its own copies of both, so it stands on its own — but if you want to regenerate them fresh:

```powershell
cd ../chapter_02_decode_allure_report
python build_single_file_report.py ../chapter_01_generate_allure_report/allure-results-bdd -o bundle.html
```

No new installs. Still just the Python standard library.

---

## The narration script

### Scene 1 — Two things we already built, about to meet

**SCREEN:** Two file icons side by side — `decode_report.py` labelled "Chapter 2" and `schema.sql` labelled "Chapter 3" — sliding toward each other.

**SAY:**

"We've actually done the hard part already, in two separate pieces. Chapter 2 gave us a way to turn a packed report back into clean Python objects. Chapter 3 gave us a database that's shaped exactly to hold those objects. Today, we just introduce them to each other. That's really it. Let's watch it happen."

### Scene 2 — The one new piece: matching data to the right column

**SCREEN:** `store_report.py`, focus on this part first:

```python
is_text = is_text_mime_type(attachment.mime_type)
text_content = attachment.data.decode("utf-8", errors="replace") if is_text else None
binary_content = None if is_text else attachment.data
```

**SAY:**

"This is the only genuinely new decision in this whole chapter. For every attachment, we check its type using one rule — is it a `text/...` type, or one of a small list of text-shaped `application/...` types like JSON, XML, or YAML? If so, we turn its raw bytes into a proper text string and put it in `text_content`, leaving `binary_content` empty. Otherwise — a screenshot, a zip archive — we leave the bytes exactly as they are and put them straight into `binary_content`, leaving `text_content` empty. This is us actually keeping the promise we made back in Chapter 3, in real code."

**SCREEN:** Scroll down to show the rest of the function — inserting the report row (now with all four status counts, not just passed/failed), then a test case row per test, then a step row per step, then an attachment row per attachment, each one picking up the `id` SQLite just handed back (`cursor.lastrowid`) so the next table knows which parent it belongs to.

**SAY:**

"Notice this pattern repeating three times — insert a row, grab the ID SQLite just gave it back, use that ID as the 'belongs to' link for the next table down. That's genuinely the whole trick behind connecting tables together in a relational database.

Also notice the very first row we insert — the report row itself — now carries four counts, not two: passed, failed, broken, and skipped. Early on, this only tracked passed and failed, which meant a report with a broken test or a skipped test would show a summary that didn't add up to the real total. That's now fixed, at the schema level, not just papered over in a print statement."

### Scene 3 — Running the whole pipeline

**SCREEN:** Terminal.

```powershell
python store_report.py bundle.html --db-path tutorial.db --report-name "Homepage Checks Run 1"
```

**SAY (real output from this exact run against the current 10-scenario suite — read it slowly, this is the payoff of three chapters of work):**

```
Report #1: 'Homepage Checks Run 1' - 7 passed, 1 failed, 1 broken, 1 skipped
  - [passed] Homepage screenshot is captured  (3 steps, 1 attachments, 402357 binary bytes, 0 text characters)
  - [passed] Homepage check summary is recorded in three formats  (5 steps, 4 attachments, 0 binary bytes, 2268 text characters)
  - [passed] Homepage response time is measured 3 times  (3 steps, 1 attachments, 0 binary bytes, 72 text characters)
  - [skipped] This check is skipped on purpose  (2 steps, 0 attachments, 0 binary bytes, 0 text characters)
  - [failed] This check is written to fail on purpose  (3 steps, 1 attachments, 0 binary bytes, 2000 text characters)
  - [passed] Homepage evidence is archived into a zip file  (3 steps, 2 attachments, 10015 binary bytes, 2000 text characters)
  - [passed] Homepage mentions Python  (3 steps, 1 attachments, 0 binary bytes, 2000 text characters)
  - [passed] Homepage screenshot is also captured as a JPEG  (3 steps, 1 attachments, 291013 binary bytes, 0 text characters)
  - [broken] This check is broken by an unexpected error  (2 steps, 0 attachments, 0 binary bytes, 0 text characters)
  - [passed] Homepage responds successfully  (3 steps, 1 attachments, 0 binary bytes, 773 text characters)
```

"Look at the very first line - `7 passed, 1 failed, 1 broken, 1 skipped`. That's ten test cases, every single one accounted for by the report's own summary row, not just by counting lines yourself. Then look at the attachment numbers underneath - the PNG screenshot landed as 402,357 binary bytes, the JPEG screenshot as 291,013 binary bytes, the zip archive as 10,015 binary bytes, and every text-shaped attachment - JSON, XML, YAML, CSV, HTML - landed as real character counts, zero binary bytes. That's not something I typed in to look convincing. That came out of SQLite itself, after the data made the whole trip from an HTML file, through our decoder, into a database, and back out again through a query."

### Scene 4 — Wrap-up

**SAY:**

"So here's what happened. We took a report squashed inside one file, pulled it apart, and this time, instead of just printing it to the screen, we gave it a permanent home — a real database, with the right kind of data in the right kind of column, and the right count for all four outcomes, automatically, every time. No more re-decoding the same file over and over. It lives in `tutorial.db` now, and it stays there.

Next time, we're going to build a way for anything on the internet — a browser, another program, anything — to actually ask this database questions, using something called an API. That's where FastAPI comes in. See you there."

---

## What to show on screen — director's notes

| Moment | What to show | Why |
|---|---|---|
| Scene 1 | The two-icons-sliding-together animation, quick, under 3 seconds | Sets "this chapter is a merge, not a from-scratch build" immediately |
| Scene 2 | Split screen — the `is_text_mime_type` check on the left, a screenshot thumbnail flowing into "binary_content" and a JSON icon flowing into "text_content" on the right | Visually repeats the Chapter 3 promise, now shown actually happening |
| Scene 2 (lastrowid pattern) | A small animated chain of three linked circles (Report → Test Case → Step), each one lighting up as its row is inserted and its ID is "passed" to the next | Makes the parent-child ID linking visible instead of abstract |
| Scene 3 | Highlight the `7 passed, 1 failed, 1 broken, 1 skipped` line with a soft glow the moment it appears, hold for a beat | This is the chapter's proof moment - give it room to land |
| Scene 4 | A small padlock icon animating onto the `tutorial.db` file, implying "this is now permanent, not thrown away when the script ends" | Reinforces why a database matters over just printing to a screen |

### Suggested on-screen animation / graphic overlays

- **Scene 1:** Two labelled puzzle pieces (Chapter 2 piece, Chapter 3 piece) sliding together and clicking into place with a satisfying snap.
- **Scene 2:** A small fork-in-the-road icon animating at the `is_text_mime_type` check — one path glowing for text, the other for binary, depending on which branch actually runs for each attachment as it's processed.
- **Scene 3:** As each of the ten result lines prints, a tiny colored dot (green passed, red failed, orange broken, grey skipped) appears to its left, building a small ten-dot summary strip by the end.
- **Scene 4:** Fade from the terminal into a simple database-cylinder icon with the ten test cases shown as small labelled blocks stacked inside it.

---

## Key takeaways

1. Once your decoder produces a clean, predictable shape (Chapter 2) and your schema expects that exact shape (Chapter 3), "connecting" them is mostly just writing loops that insert rows — the hard design thinking happens before this step, not during it.
2. Deciding which column an attachment's data belongs in (`text_content` vs `binary_content`) is a one-line rule based on its MIME type — simple rules, applied consistently, are enough to keep different data types from getting mixed up.
3. `cursor.lastrowid` is how you link a freshly inserted child row back to its freshly inserted parent row — the same three-step pattern (insert parent, grab its ID, insert children using that ID) repeats at every level of a nested structure.
4. If your summary tracks fewer outcomes than your data actually has (only passed/failed, when there are really four possible statuses), the summary will look plausible while quietly being wrong the moment a broken or skipped test shows up. Track every real outcome your schema allows for, not just the common two.
5. Reading data back out of the database immediately after writing it is the cheapest way to catch a storage mistake before it becomes a much harder bug to find later.
6. A database is not just "a place data sits" — it's what turns a one-time script result into something that survives after the script ends and can be asked about again later, by anything, at any time. That's exactly what makes Chapter 5's API layer possible.

---

## Verified facts used in this script

- `python store_report.py bundle.html --db-path tutorial.db --report-name "Homepage Checks Run 1"` (against the current 10-scenario `bundle.html`) really printed `Report #1: 'Homepage Checks Run 1' - 7 passed, 1 failed, 1 broken, 1 skipped` followed by all ten test cases with their real attachment counts, read straight back out of SQLite after storage.
- The PNG screenshot landed with `402357 binary bytes, 0 text characters`; the JPEG screenshot with `291013 binary bytes, 0 text characters`; the zip archive with `10015 binary bytes` alongside `2000 text characters` (the same step also attached a text log); every purely text-shaped attachment landed with `0 binary bytes` and a real character count.
- Fixed a real gap discovered while updating this chapter: the `reports` table (and every script/endpoint reading from it) originally tracked only `passed_count`/`failed_count`. A report containing broken or skipped tests would silently show a summary that didn't add up to its real total. The schema (`schema.sql`), `store_report.py`'s insert and read-back logic, and every downstream chapter's API model and frontend report card were all updated together to add `broken_count`/`skipped_count`, keeping the fix consistent everywhere the `reports` table is used.
- No third-party packages used — `decode_report.py` (carried over unchanged from Chapter 2) and `store_report.py` both rely only on the Python standard library (`sqlite3`, `base64`, `gzip`, `json`, `re`, `dataclasses`, `pathlib`, `argparse`).

## Files that belong in the project folder for this chapter

```
chapter_04_store_in_sqlite/
  schema.sql          <- carried over from Chapter 3, now with broken_count/skipped_count added
  decode_report.py    <- carried over from Chapter 2, unchanged
  store_report.py      <- decodes bundle.html and writes it into SQLite, now tracking all 4 statuses
  bundle.html          <- carried over from Chapter 2, the input file (current 10-scenario suite)
  tutorial.db          <- generated, now actually holds real test data
```
