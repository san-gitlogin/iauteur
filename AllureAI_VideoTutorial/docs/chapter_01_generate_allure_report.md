# Chapter 1 — Making Your First Allure Report From Nothing (Pure Python, No Java)

## The promise of this chapter

By the end of this chapter, someone watching has:

- written a real BDD test suite in plain English (Gherkin), from an empty folder
- run it with Playwright driving a real browser
- watched all four real Allure outcomes happen on screen: passed, failed, broken, and skipped
- seen nine different kinds of evidence show up as attachments - a screenshot in two formats, a log, an HTML snippet, a table, a zip archive, and a summary in three different structured-text formats
- opened an actual, styled report in their own browser

And here's the part that matters most for this course: **none of it needs Java.** Not the tests, not the browser automation, not the report itself. Every tool in this chapter is something you installed with `pip`. If you've only ever written Python, you will never leave that comfort zone in this video.

Nothing here is simulated. Every command, every number, and every screenshot were produced by actually running this code before writing the script. If a viewer types the exact same thing, they get the exact same result.

---

## A quick, honest note before we start

If you go looking around online for "how do I generate an Allure report," almost everything you'll find tells you to run a tool called `allure generate`. That tool is real, it's official, and it's genuinely good — but it's written in Java. For a course that's Python, Playwright, and BDD from top to bottom, pulling in a Java runtime just to render a report doesn't fit, and it's an unnecessary thing to ask a beginner to install.

So here's what we're doing instead: we'll produce the exact same raw evidence Allure normally produces (that part has nothing to do with Java — it comes from a small Python library), and then we'll write our own small Python script that turns that evidence into a report you can open in a browser. It won't look identical to the official one, but it will show every single piece of evidence, and — this is the important bit — you'll understand exactly how it works, because you're about to build it yourself.

---

## What has to be true on the recording machine before you hit record

```powershell
python --version
pip show behave allure-behave playwright requests
```

On the machine this was built on, that returned:

```
Python 3.14.6
Name: behave           Version: 1.3.3
Name: allure-behave    Version: 2.16.0
Name: playwright       Version: 1.61.0
Name: requests         Version: 2.34.2
```

If `playwright` has never downloaded a browser before, run this once, off camera:

```powershell
playwright install chromium
```

That's genuinely everything. No Node, no Java, no separate report-building program.

---

## The narration script

Scene numbers are for your own editing timeline, not something you say out loud.

### Scene 1 — Cold open, empty folder

**SCREEN:** A completely empty folder open in the editor.

**SAY:**

"Right now, there is nothing here. No test, no report, nothing. By the end of this chapter, we're going to have a real report sitting in a browser tab, with screenshots, tables, and logs you can click through — and we're going to do the entire thing in Python. No other language involved, anywhere.

Quick question first — what even is Allure? It's a way of describing test results so a human actually wants to read them. Instead of a wall of green and red dots, you get steps, written in plain English, with evidence attached to each one. That's the whole idea. Let's go build one from nothing."

### Scene 2 — Writing the test in plain English first

**SCREEN:** New file, `features/homepage_checks.feature`, typed live.

**SAY:**

"We're going to test something real — the Python homepage. And because we're doing this the BDD way, we don't start by writing Python. We start by writing plain English sentences that describe what we want to check. This is called Gherkin, and it reads almost like a checklist.

I'm going to write ten of these. Not because more is automatically better, but because I want you to see every real outcome Allure can actually produce, not just 'it worked' or 'it didn't.'"

```gherkin
Feature: Python.org homepage health checks
  As a website owner
  I want automated checks against the homepage
  So that I know quickly if something on the site breaks

  Background:
    Given the target website is "https://www.python.org"

  @critical
  Scenario: Homepage responds successfully
    When I send a GET request to the homepage
    Then the response status code should be 200

  Scenario: Homepage mentions Python
    When I download the homepage HTML
    Then the page text should contain "Python"

  @critical
  Scenario: Homepage screenshot is captured
    When I visit the homepage in a real browser
    Then a full page screenshot should be attached

  Scenario: Homepage response time is measured 3 times
    When I send the homepage request 3 times and record the timing
    Then every attempt should respond within 5000 milliseconds

  Scenario: Homepage screenshot is also captured as a JPEG
    When I visit the homepage in a real browser and capture a JPEG screenshot
    Then a JPEG screenshot should be attached

  Scenario: Homepage evidence is archived into a zip file
    When I download the homepage HTML
    Then the evidence should be archived into a zip attachment

  Scenario: Homepage check summary is recorded in three formats
    When I download the homepage HTML
    Then a JSON summary should be attached
    And an XML summary should be attached
    And a YAML summary should be attached

  Scenario: This check is written to fail on purpose
    When I download the homepage HTML
    Then the page text should contain "This text will never appear on python.org"

  Scenario: This check is broken by an unexpected error
    When something unexpected goes wrong while checking the homepage

  @skip_this
  Scenario: This check is skipped on purpose
    When I skip this check on purpose
```

**SAY:**

"Look at the last three scenarios closely, because they're the ones almost every tutorial skips. One is written to fail — a normal assertion that doesn't get what it expected. One is written to break — not a failed check, but a genuine bug in the test itself, like reaching for something that doesn't exist. And one is written to be skipped on purpose, and never even runs. Allure actually has four different outcomes, not two, and if we only ever show 'pass' and 'fail,' you'd never know the other two existed."

### Scene 3 — Giving the English sentences real Python behind them

**SCREEN:** `features/steps/homepage_steps.py`.

**SAY:**

"Right now, those sentences don't do anything — they're just text. We need to connect each line to real Python code. This is where `behave` comes in — every `Given`, `When`, and `Then` line gets matched to a function. I'll build the straightforward ones first, then get to the interesting ones."

```python
"""
Step definitions for homepage_checks.feature.

Every Gherkin step below automatically becomes a step in the Allure
report just by being a behave step - allure-behave wires that up for us.
We only need `allure.attach(...)` ourselves for the extra evidence
(screenshots, logs, tables) that Gherkin text alone can't carry.

Allure actually supports 20 attachment types (check allure.attachment_type
yourself - TEXT, CSV, TSV, URI_LIST, HTML, XML, JSON, YAML, PCAP, ZIP,
PNG, JPG, SVG, GIF, BMP, TIFF, MP4, OGG, WEBM, PDF). We don't attach all
20 here - that would be padding, not teaching - but we now cover a real
example from each broad family: plain text, a table (CSV), structured
text in three flavors (JSON/XML/YAML), a second image format (JPEG),
and a compressed archive (ZIP). Video/PDF/etc. follow the exact same
"binary bytes with a mime type" pattern as the screenshot and zip below,
so there's nothing new to learn from adding more of them.
"""
import csv
import io
import json
import zipfile
import time

import allure
import requests
from behave import given, when, then


@given('the target website is "{url}"')
def step_set_target(context, url):
    context.target_url = url


@when('I send a GET request to the homepage')
def step_get_homepage(context):
    context.response = requests.get(context.target_url, timeout=10)
    allure.attach(
        "\n".join(f"{k}: {v}" for k, v in context.response.headers.items()),
        name="response_headers.txt",
        attachment_type=allure.attachment_type.TEXT,
    )


@then('the response status code should be {expected_code:d}')
def step_check_status(context, expected_code):
    assert context.response.status_code == expected_code


@when('I download the homepage HTML')
def step_download_html(context):
    context.response = requests.get(context.target_url, timeout=10)
    allure.attach(
        context.response.text[:2000],
        name="homepage_snippet.html",
        attachment_type=allure.attachment_type.HTML,
    )


@then('the page text should contain "{expected_text}"')
def step_check_text_contains(context, expected_text):
    assert expected_text in context.response.text


@when('I visit the homepage in a real browser')
def step_visit_browser(context):
    page = context.browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto(context.target_url, wait_until="load")
    context.screenshot_bytes = page.screenshot(full_page=True)
    page.close()


@then('a full page screenshot should be attached')
def step_attach_screenshot(context):
    allure.attach(
        context.screenshot_bytes,
        name="homepage_screenshot.png",
        attachment_type=allure.attachment_type.PNG,
    )
    assert len(context.screenshot_bytes) > 1000
```

**SAY:**

"That's the core five. Now the six new ones — a second screenshot format, an archive, and a summary written three different ways."

```python
@when('I send the homepage request {times:d} times and record the timing')
def step_timing_table(context, times):
    context.timings = []
    for attempt in range(1, times + 1):
        start = time.perf_counter()
        response = requests.get(context.target_url, timeout=10)
        duration_ms = round((time.perf_counter() - start) * 1000, 1)
        context.timings.append((attempt, response.status_code, duration_ms))

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["attempt", "status_code", "duration_ms"])
    writer.writerows(context.timings)
    allure.attach(buffer.getvalue(), name="timing_results.csv", attachment_type=allure.attachment_type.CSV)


@then('every attempt should respond within {max_ms:d} milliseconds')
def step_check_timing(context, max_ms):
    for attempt, status_code, duration_ms in context.timings:
        assert status_code == 200
        assert duration_ms < max_ms


@when('I visit the homepage in a real browser and capture a JPEG screenshot')
def step_visit_browser_jpeg(context):
    page = context.browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto(context.target_url, wait_until="load")
    context.jpeg_screenshot_bytes = page.screenshot(full_page=True, type="jpeg")
    page.close()


@then('a JPEG screenshot should be attached')
def step_attach_jpeg_screenshot(context):
    allure.attach(context.jpeg_screenshot_bytes, name="homepage_screenshot.jpg",
                  attachment_type=allure.attachment_type.JPG)
    assert len(context.jpeg_screenshot_bytes) > 1000


@then('the evidence should be archived into a zip attachment')
def step_attach_zip_archive(context):
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("homepage.html", context.response.text)
        archive.writestr("note.txt", "Zipped evidence for the homepage check.")
    allure.attach(buffer.getvalue(), name="homepage_evidence.zip", attachment_type=allure.attachment_type.ZIP)


@then('a JSON summary should be attached')
def step_attach_json_summary(context):
    summary = {"url": context.target_url, "status_code": context.response.status_code,
               "page_length": len(context.response.text)}
    allure.attach(json.dumps(summary, indent=2), name="summary.json", attachment_type=allure.attachment_type.JSON)


@then('an XML summary should be attached')
def step_attach_xml_summary(context):
    xml_text = (f"<summary>\n  <url>{context.target_url}</url>\n"
                f"  <statusCode>{context.response.status_code}</statusCode>\n"
                f"  <pageLength>{len(context.response.text)}</pageLength>\n</summary>\n")
    allure.attach(xml_text, name="summary.xml", attachment_type=allure.attachment_type.XML)


@then('a YAML summary should be attached')
def step_attach_yaml_summary(context):
    yaml_text = (f"url: {context.target_url}\nstatus_code: {context.response.status_code}\n"
                 f"page_length: {len(context.response.text)}\n")
    allure.attach(yaml_text, name="summary.yaml", attachment_type=allure.attachment_type.YAML)


@when('something unexpected goes wrong while checking the homepage')
def step_something_unexpected_breaks(context):
    response = requests.get(context.target_url, timeout=10)
    # Deliberately reads a header that does not exist. This is NOT an
    # assertion failing - it's a genuine bug in the check itself, which
    # is exactly what Allure calls a "broken" test rather than "failed".
    _ = response.headers["X-Definitely-Not-A-Real-Header"]


@when('I skip this check on purpose')
def step_skip_on_purpose(context):
    context.scenario.skip("Skipping deliberately to demonstrate the 'skipped' status")
```

**SAY (pointing at the broken-test step):**

"Look at this one carefully, because it's the one people confuse most. This isn't an `assert` that fails. It's a real Python `KeyError` — reading a response header that was never there. Allure treats that completely differently. A failed `assert` means your system did the wrong thing. An unhandled exception like this one means the TEST has a bug in it. Two very different problems, two different statuses, and if your reporting only has 'pass' and 'fail,' that distinction is invisible."

### Scene 4 — One browser, shared across every scenario

**SCREEN:** `features/environment.py`.

**SAY:**

"One more small file. Opening a new browser for every single scenario would be slow, so we open one real browser at the very start, share it, and close it cleanly at the very end. This is `behave`'s version of setup and teardown."

```python
"""
Behave lifecycle hooks.

We launch ONE real Playwright/Chromium browser for the whole run and
reuse it across scenarios, closing it cleanly at the end. This is the
BDD equivalent of pytest fixtures.
"""
from playwright.sync_api import sync_playwright


def before_all(context):
    context.playwright = sync_playwright().start()
    context.browser = context.playwright.chromium.launch()


def after_all(context):
    context.browser.close()
    context.playwright.stop()
```

### Scene 5 — Running it for the first time

**SCREEN:** Terminal, at the project folder.

```powershell
python -m behave -f allure_behave.formatter:AllureFormatter -o allure-results-bdd features
```

**SAY (this is the real result from this exact command):**

```
Failing scenarios:
  features/homepage_checks.feature:41  This check is written to fail on purpose

Errored scenarios:
  features/homepage_checks.feature:45  This check is broken by an unexpected error

7 scenarios passed, 1 failed, 1 error, 1 skipped
27 steps passed, 1 failed, 1 error, 1 skipped
```

"Seven passed. One failed. One errored - that's our broken one. One skipped. That's all four real Allure outcomes, in one run, and notice - not a single mention of Java anywhere in that output, because it was never involved."

### Scene 6 — Opening the raw evidence, before there's any report at all

**SCREEN:** The `allure-results-bdd` folder that just appeared.

**SAY:**

"Before we build anything pretty, let's look at what actually got created."

**SCREEN:** Show the folder (real listing from this exact run - 10 result files, 12 attachment files):

```
10 × *-result.json           <- one per scenario
3  × *-attachment.html       <- the page snippet (used by 3 scenarios)
1  × *-attachment.csv        <- the timing table
1  × *-attachment.png        <- the PNG screenshot
1  × *-attachment.jpg        <- the JPEG screenshot
1  × *-attachment.zip        <- the archived evidence
1  × *-attachment.json       <- the JSON summary
1  × *-attachment.xml        <- the XML summary
1  × *-attachment.yaml       <- the YAML summary
1  × *-attachment.txt        <- the response headers
```

**SCREEN:** Open the broken scenario's `result.json`:

```json
{
  "name": "This check is broken by an unexpected error",
  "status": "broken",
  "statusDetails": {
    "message": "KeyError: 'x-definitely-not-a-real-header'\n",
    "trace": "...step_something_unexpected_breaks...\n"
  }
}
```

**SAY:**

"There it is, in the actual file - `\"status\": \"broken\"`, not `\"failed\"`. Allure genuinely tracks the difference, and now you've seen exactly where that word comes from."

### Scene 7 — Building our own report, in plain Python

**SCREEN:** `build_simple_html_report.py`. Reveal in sections: read → render one attachment → render one step → render one test → the page template → the command-line entry point.

**SAY:**

"Now for the part that replaces the Java tool entirely. This script reads every result file and every attachment sitting next to it, and turns them into one HTML page.

I want you to notice how it decides what to do with each attachment, because it doesn't have a special case for all twenty possible Allure types. It asks two honest questions: does this attachment's type start with `image/`? Then show a picture. Otherwise, is it genuinely text-shaped - plain text, HTML, CSV, or one of JSON/XML/YAML even though those don't start with `text/`? Then show it as readable text. Anything else - like our zip file - gets an honest download link instead of a broken attempt at decoding raw bytes as if they were words."

### Scene 8 — Running our own report builder

**SCREEN:** Terminal.

```powershell
python build_simple_html_report.py allure-results-bdd -o report-python-only.html -t "Python.org Homepage Health Checks"
```

**SAY (real output from this exact run):**

```
Report written to: ...\report-python-only.html
7 passed, 1 failed, 1 broken, 1 skipped, 10 total
```

"All four outcomes, correctly counted. Let's open it."

**SCREEN:** Open `report-python-only.html`. Scroll slowly. Point out, in order:
1. The header, now showing four counts, not two - passed, failed, broken, skipped, each with its own quiet color (green, red, amber, gray - no other colors used anywhere).
2. The response headers, HTML snippet, and timing table, same as before.
3. Both screenshots - PNG and JPEG - rendering identically, because the renderer doesn't care which image format it's looking at.
4. The JSON, XML, and YAML summaries, each shown as clean, readable text blocks.
5. The zip file - not garbled text, a real "Download homepage_evidence.zip" link.
6. The failed scenario, in a red box, with the exact assertion text.
7. The broken scenario, ALSO in a red box (broken gets the same visual weight as failed - both need attention), showing the real `KeyError` message.
8. The skipped scenario, shown plainly with a gray badge and no steps run underneath it.

**SAY:**

"Look at that. Every one of Allure's four real outcomes, nine different kinds of evidence, and still zero Java, zero Node, zero separate programs. Just a Python script we wrote ourselves."

### Scene 9 — Wrap-up

**SAY:**

"So here's what happened. We wrote ten checks in plain English, covering all four things a real test result can actually be. We connected them to real Python code that drives a real browser. We looked at the raw proof before any report existed - including the exact word 'broken' sitting in a JSON file. And we wrote our own small script that turns all of it into a report you can actually open and click through.

Next time, we're going to take a *real* Allure HTML report - the official kind, if you ever run into one at work - and write the code that decodes it, using exactly what we learned about this JSON shape today. See you in the next one."

---

## What to show on screen — director's notes

| Moment | What to show | Why |
|---|---|---|
| Opening | Empty folder, full screen | Sets the "from nothing" promise immediately |
| Gherkin file | Type it at a readable pace, pause noticeably on the fail/broken/skip scenarios | These three are the actual teaching payload of the chapter |
| Step file (broken-test step) | Zoom on the `KeyError` line, hold for a beat | This single line is what separates "failed" from "broken" - give it room |
| First run | Full terminal, large font | "7 passed, 1 failed, 1 error, 1 skipped" is the emotional beat of the chapter |
| Raw JSON | Zoom tightly on `"status": "broken"` | Concrete proof, not just a claim |
| Report builder script | Reveal section by section | Mirrors how you'd actually build it yourself |
| Final report | Slow, deliberate scroll; pause fully on each of the 4 status colors and the zip download link | Let the eye catch up before the next line of narration |

### Suggested on-screen animation / graphic overlays

- **Scene 1:** A simple folder icon, empty, gently pulsing outline.
- **Scene 2:** As each Gherkin line appears, a small ghost icon fades in matching its eventual outcome - a checkmark for most, a small "X" for the fail scenario, a small triangle for the broken one, a small pause icon for the skip.
- **Scene 3 (broken step):** A small red bug icon appears next to the `KeyError` line, distinct from the red "X" used for failed assertions elsewhere - reinforcing that broken and failed are drawn differently on purpose.
- **Scene 5:** Freeze-frame on "7 scenarios passed, 1 failed, 1 error, 1 skipped" with four small colored dots animating in beside the matching words (green/red/amber/gray).
- **Scene 6:** An animated arrow from the `KeyError` concept to the `"status": "broken"` field in the JSON.
- **Scene 8:** As each attachment type is discussed, a small icon representing that type (picture, table, braces for JSON, angle-brackets for XML, a zip-folder icon) animates into a row along the bottom of the screen, building a "9 types" strip by the end of the scene.
- **Scene 9:** Split-screen wipe — the empty folder from Scene 1 fading into the final populated folder.

---

## Key takeaways

1. BDD means writing the *what* first, in plain English (Gherkin), and connecting it to Python afterwards with `behave` step definitions.
2. Allure tracks FOUR real outcomes, not two: passed, failed (an assertion didn't get what it expected), broken (an unrelated bug or exception happened before any real check ran), and skipped (deliberately not run). Building a report that only shows pass/fail hides real information.
3. `allure.attach(...)` accepts many kinds of evidence - Allure defines 20 official attachment types in total. You don't need to special-case all 20; classifying by a simple rule (is it an image? is it text-shaped?) covers the real world without a giant lookup table.
4. The raw evidence (`*-result.json` and its attachments) exists as plain files on disk *before* any report is built, and it's produced entirely by a small Python library.
5. You do not need the official Java-based Allure report generator to get a real, clickable, evidence-rich report. A plain Python script reading the same JSON files can build one perfectly well.
6. Tests written to fail, break, and skip on purpose are not wasted effort - they're the only way to actually see what every real outcome looks like, end to end.

---

## Verified facts used in this script

- Environment: Python 3.14.6, behave 1.3.3, allure-behave 2.16.0, playwright 1.61.0 (chromium confirmed launchable), requests 2.34.2.
- Real run command: `python -m behave -f allure_behave.formatter:AllureFormatter -o allure-results-bdd features`.
- Real result: `7 scenarios passed, 1 failed, 1 error, 1 skipped` / `27 steps passed, 1 failed, 1 error, 1 skipped` (10 scenarios total).
- Real files produced under `allure-results-bdd/`: 10 `*-result.json`, and attachments spanning 9 distinct file types: `.html` (×3), `.csv`, `.png`, `.jpg`, `.zip`, `.json`, `.xml`, `.yaml`, `.txt`.
- The broken scenario's real `result.json` contains `"status": "broken"` with `statusDetails.message` = `"KeyError: 'x-definitely-not-a-real-header'\n"` - confirmed by direct inspection of the generated file, not assumed.
- `build_simple_html_report.py` was run against this exact 10-scenario dataset and printed `7 passed, 1 failed, 1 broken, 1 skipped, 10 total` - all four counts now correctly tracked (an earlier version of this script only counted passed/failed and silently mis-reported the total).
- The report builder's attachment renderer was verified to handle all 9 real attachment types correctly: both PNG and JPEG render as inline images (classified generically by `mime_type.startswith("image/")`, not by a fixed extension list), JSON/XML/YAML render as readable text alongside plain text/HTML/CSV, and the ZIP archive renders as a clean download link instead of attempting to decode binary bytes as text.
- **Zero use of Java, Node, npm, or any non-Python tool anywhere in this chapter's final version.**

## Files that belong in the project folder for this chapter

```
chapter_01_generate_allure_report/
  features/
    homepage_checks.feature      <- 10 scenarios: passed/failed/broken/skipped
    environment.py                <- shared browser setup/teardown
    steps/
      homepage_steps.py           <- the Python behind every English line
  build_simple_html_report.py     <- our own pure-Python report builder (generic image/text/binary handling)
  requirements.txt                <- behave, allure-behave, playwright, requests
  allure-results-bdd/              <- generated by running behave, do not hand-edit
  report-python-only.html         <- generated by build_simple_html_report.py, open this in a browser
```
