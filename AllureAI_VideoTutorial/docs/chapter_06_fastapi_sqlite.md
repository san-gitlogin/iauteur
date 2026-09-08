# Chapter 6 — Asking the Database Real Questions Through an API

## The promise of this chapter

By the end of this chapter, someone watching has:

- connected the FastAPI skills from Chapter 5 to the real database from Chapter 4
- fetched a list of reports, then the test cases inside one report, then the full detail of one test case, each a little deeper than the last
- seen all four real outcomes - passed, failed, broken, skipped - come back correctly through the API, both per test case and in the report's own summary
- watched a real screenshot come back out of an API call as an actual image, not text or a description of an image
- proven every one of these with real data, not a placeholder

Note on scope: this chapter's API is read-only and has no upload or AI endpoints - those come later, in Chapters 8 and 9.

---

## What has to be true before you record

This folder carries its own copies of Chapter 4's `schema.sql`, `decode_report.py`, `store_report.py`, and `bundle.html`, plus a fresh `tutorial.db` built from them. If you want to rebuild it from scratch:

```powershell
python store_report.py bundle.html --db-path tutorial.db --report-name "Homepage Checks Run 1"
```

```powershell
pip show fastapi uvicorn requests
```

Same versions as Chapter 5: `fastapi 0.141.1`, `uvicorn 0.51.0`, `requests 2.34.2`.

---

## The narration script

### Scene 1 — Three questions, each one deeper

**SCREEN:** A simple three-step arrow diagram: "Which reports exist?" → "Which tests are in this one?" → "Tell me everything about this one test."

**SAY:**

"Today we're building exactly three questions someone might actually ask this data, each one going a little deeper than the last. Which reports do we have? Which tests are inside one of them? And, tell me absolutely everything about one specific test — its steps, and every piece of evidence attached to it. Let's build all three."

### Scene 2 — Deciding the answer shapes before writing the questions

**SCREEN:** `main.py`, the Pydantic model section only.

**SAY:**

"Just like Chapter 3, before we write the actual endpoints, we decide what shape each answer will be. A report summary — which now carries all four real status counts, not just passed and failed. A short test case summary. A full test case detail, containing a list of steps, each containing a list of attachments. Deciding this now means the endpoint functions themselves are almost boring to write — and boring, here, is a good thing."

### Scene 3 — The first two questions

**SCREEN:** `main.py`, the `/reports` and `/reports/{report_id}/test-cases` endpoints.

**SAY:**

"Notice this one detail — before answering 'which tests are in this report,' we check the report actually exists, and if it doesn't, we hand back a proper 404, Not Found, with a clear message. That's not extra decoration — that's the difference between an API that tells you honestly when something's wrong, and one that just quietly hands back nothing and leaves you guessing."

**SCREEN:** Terminal, server running, then a second terminal running the test client.

```powershell
python -m uvicorn main:app --port 8834
```
```powershell
python test_client_demo.py
```

**SAY (real output — read the reports and test case list, straight from the current 10-scenario dataset):**

```
--- GET /reports ---
[{'id': 1, 'report_name': 'Homepage Checks Run 1', 'created_at': '2026-09-08 19:19:24',
  'passed_count': 7, 'failed_count': 1, 'broken_count': 1, 'skipped_count': 1}]

--- GET /reports/1/test-cases ---
{'id': 1, 'name': 'Homepage screenshot is captured', 'status': 'passed'}
{'id': 2, 'name': 'Homepage check summary is recorded in three formats', 'status': 'passed'}
{'id': 3, 'name': 'Homepage response time is measured 3 times', 'status': 'passed'}
{'id': 4, 'name': 'This check is skipped on purpose', 'status': 'skipped'}
{'id': 5, 'name': 'This check is written to fail on purpose', 'status': 'failed'}
{'id': 6, 'name': 'Homepage evidence is archived into a zip file', 'status': 'passed'}
{'id': 7, 'name': 'Homepage mentions Python', 'status': 'passed'}
{'id': 8, 'name': 'Homepage screenshot is also captured as a JPEG', 'status': 'passed'}
{'id': 9, 'name': 'This check is broken by an unexpected error', 'status': 'broken'}
{'id': 10, 'name': 'Homepage responds successfully', 'status': 'passed'}
```

"There's our data, from Chapter 4's database, coming back out through a real API for the first time. Look at that first line closely - `passed_count: 7, failed_count: 1, broken_count: 1, skipped_count: 1`. Every one of the four real outcomes, tracked and returned, not just the two most common ones."

### Scene 4 — The deep question, and the image that comes back as an actual image

**SCREEN:** `main.py`, `get_test_case_detail` and `get_attachment_raw`.

**SAY:**

"This next one is the interesting one. For one test case, we fetch its steps, in the right order, and for every step, we fetch its attachments too. Everything, in one answer.

But look at this last endpoint — `/attachments/{id}/raw`. Every other endpoint hands back JSON. This one doesn't. It hands back the RAW bytes of the attachment, with the correct content type set. Why? Because this is what lets a future webpage just say 'put a picture here, and point it at this address' — the browser does the rest, no decoding required on the frontend's side at all."

**SCREEN:** Terminal, real output.

```
--- GET /test-cases/1 (Homepage screenshot is captured) ---
  status: passed
  step 0: Given the target website is "https://www.python.org" [passed]
  step 1: When I visit the homepage in a real browser [passed]
  step 2: Then a full page screenshot should be attached [passed]
      attachment #1: homepage_screenshot.png (image/png) has_binary_content=True

--- GET /test-cases/5 (This check is written to fail on purpose) ---
  status: failed
  failure_message: AssertionError
  step 2: Then the page text should contain "This text will never appear on python.org" [failed]

--- GET /test-cases/9 (This check is broken by an unexpected error) ---
  status: broken
  failure_message: KeyError: 'x-definitely-not-a-real-header'
  step 1: When something unexpected goes wrong while checking the homepage [broken]

--- GET /attachments/1/raw (the screenshot) ---
  status_code: 200
  content-type header: image/png
  bytes received: 402357
  first 8 bytes: b'\x89PNG\r\n\x1a\n'
  is a real PNG: True
```

"Look at those first 8 bytes — `\x89PNG\r\n\x1a\n`. That's not something I made up, that's the actual, official signature every real PNG file starts with. Our API isn't describing a picture — it's handing back a genuine, valid picture, straight out of the database, on request. And look at the two failure_message lines - `AssertionError` for the on-purpose failure, and the real `KeyError: 'x-definitely-not-a-real-header'` for the broken one. Two different real Python exceptions, both preserved exactly, both retrievable by API."

### Scene 5 — Trying it by hand in `/docs`

**SCREEN:** Browser, `/docs`, click into `GET /attachments/{attachment_id}/raw`, Try it out, put in `1`, Execute — show the actual screenshot rendered right there in the response panel.

**SAY:**

"And here's the fun bit — you don't even need a script to see this working. Punch the ID straight into `/docs`, and there's the real screenshot, rendered right in the browser's response panel, because we told it the content type was `image/png` and it believed us — correctly."

### Scene 6 — Wrap-up

**SAY:**

"So here's what we built. Three questions, each one going deeper into the data — which reports, which tests, everything about one test. And one special answer that hands back a real picture instead of a description of one. All of it reading straight out of the database we built back in Chapter 4, live, on demand, as many times as anyone wants to ask, with every one of the four real outcomes correctly tracked and returned.

Next time, we finally build something a person actually looks at — a real, if small, webpage that calls this exact API and shows all of this neatly: the pass, fail, broken and skipped badges, the tables, and yes, the picture. See you there."

---

## What to show on screen — director's notes

| Moment | What to show | Why |
|---|---|---|
| Scene 1 | The three-arrow diagram, each arrow appearing as its question gets asked in the terminal later | Sets the "getting deeper" structure early |
| Scene 3 | The 404 check highlighted with a small red "not found" icon appearing briefly | Makes error-handling feel like a deliberate, visible design choice, not an afterthought |
| Scene 4 | Zoom on `first 8 bytes: b'\x89PNG...'` | This is the chapter's proof beat — a real file signature, not a claim |
| Scene 5 | The `/docs` response panel rendering the actual screenshot | The single most satisfying visual moment of the chapter - let it breathe on screen |
| Scene 6 | The three-question diagram from Scene 1 fading into a small browser-window icon labelled "next time" | Sets up Chapter 7 |

### Suggested on-screen animation / graphic overlays

- **Scene 1:** Each arrow in the three-question diagram draws itself in as its matching endpoint is written, left to right.
- **Scene 3:** A small red "404" stamp animates onto screen briefly when the not-found check is discussed, then fades.
- **Scene 4:** The 8 raw bytes appear one at a time as small hex-code tiles flipping in, ending with a green checkmark next to "is a real PNG: True."
- **Scene 5:** A soft spotlight circle following the mouse as it clicks "Try it out" then "Execute," holding steady once the image renders.
- **Scene 6:** A simple browser-window icon slides in from off-screen, empty at first, then a small preview of tables/images/badges fade into it — a visual promise of what Chapter 7 delivers.

---

## Key takeaways

1. Design your API around the real questions someone will actually ask, from shallow to deep — "list everything," "list within one," "show me everything about one" is a natural, reusable pattern.
2. Checking that a parent record exists before querying its children (and returning a proper 404 if not) is what makes an API trustworthy instead of just quietly wrong.
3. Not every endpoint needs to return JSON — when the real answer is a binary file, returning the raw bytes with the correct `media_type` lets a browser (or an `<img>` tag) use it directly, no extra decoding needed by the caller.
4. A file's first few bytes often prove its real type on their own — a genuine PNG always starts with the same eight bytes, which is a simple, reliable way to sanity-check that "the picture really is a picture."
5. If a report's summary model only carries the two most common outcomes, it will misrepresent every report that has a broken or skipped test — carry every real status your data can have all the way through the API layer, not just at the database layer.
6. FastAPI's `/docs` isn't just for JSON responses — it can render an actual image back to you directly in the browser, which is a fast way to sanity-check a binary endpoint without writing any client code at all.

---

## Verified facts used in this script

- `GET /reports` returned the real stored report `{'id': 1, 'report_name': 'Homepage Checks Run 1', 'created_at': '2026-09-08 19:19:24', 'passed_count': 7, 'failed_count': 1, 'broken_count': 1, 'skipped_count': 1}` — the current 10-scenario dataset with all four outcomes present.
- `GET /reports/1/test-cases` returned all 10 real test cases with correct ids/names/statuses, including `skipped` (id 4) and `broken` (id 9).
- `GET /test-cases/{id}` for each of the 10 test cases returned the correct steps in order and the correct attachments per step, including `failure_message: AssertionError` for the deliberately-failed test and `failure_message: KeyError: 'x-definitely-not-a-real-header'` for the deliberately-broken test.
- `GET /attachments/1/raw` returned HTTP 200, `content-type: image/png`, `402357` bytes (matching Chapter 4's stored byte count exactly), and its first 8 bytes were confirmed to equal the real PNG file signature `b'\x89PNG\r\n\x1a\n'`.
- Fixed the same `reports` table gap noted in Chapter 4's doc: `ReportSummary`'s Pydantic model and the `/reports` SQL query here now include `broken_count`/`skipped_count`, matching the corrected schema.

## Files that belong in the project folder for this chapter

```
chapter_06_fastapi_sqlite/
  schema.sql             <- carried over from Chapter 4, now with broken_count/skipped_count
  decode_report.py       <- carried over from Chapter 4
  store_report.py        <- carried over from Chapter 4
  bundle.html            <- carried over from Chapter 4 (current 10-scenario suite)
  tutorial.db            <- generated by running store_report.py
  main.py                <- FastAPI app serving real data from tutorial.db (read-only; no upload/AI here)
  test_client_demo.py    <- exercises every endpoint against the live server
  requirements.txt       <- fastapi, uvicorn, requests
```
