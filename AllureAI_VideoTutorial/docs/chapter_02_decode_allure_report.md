# Chapter 2 — What's Actually Inside a Test Report, and How to Open It Back Up

## The promise of this chapter

By the end of this chapter, someone watching has:

- learned why test tools squash a whole folder of evidence into one file
- watched that squashing happen, with real numbers on screen
- written a decoder, from nothing, that opens that one file back up
- proven it works by checking the decoded numbers match the original test run exactly - across all four real Allure outcomes, not just pass/fail

Everything in this chapter is standard-library Python. No new installs at all.

---

## What has to be true before you record

You need the `allure-results-bdd` folder from Chapter 1 to already exist (this is the 10-scenario suite - passed/failed/broken/skipped). If it doesn't:

```powershell
cd ../chapter_01_generate_allure_report
python -m behave -f allure_behave.formatter:AllureFormatter -o allure-results-bdd features
```

That's the only requirement. This chapter's own two scripts use only things already built into Python (`base64`, `gzip`, `json`, `re`, `dataclasses`, `pathlib`) — nothing to `pip install`.

---

## The narration script

### Scene 1 — Why would anyone hide data inside a file?

**SCREEN:** The `allure-results-bdd` folder from Chapter 1, showing all 22 of its separate files.

**SAY:**

"Look at this folder from last time. Twenty-two separate files, for just ten checks. Now imagine you wanted to email your test report to a teammate, or upload it somewhere. Sending twenty-two loose files is annoying.

So here's the trick almost every reporting tool uses. Take everything and squash it into one single file. That one file can be emailed, uploaded, dragged into a chat message, whatever you like. The catch is, once you squash it down, you need a way to open it back up. That's what we're building today."

### Scene 2 — Squashing it down

**SCREEN:** `build_single_file_report.py`, opened, scroll through it slowly.

**SAY:**

"There are only five real steps to this trick. Read every result and attachment file into one big dictionary. Turn the whole thing into JSON text. Squeeze that text down with gzip. Turn the squeezed bytes into base64 text, so they survive being pasted inside a webpage. Drop that text inside a script tag."

**SCREEN:** Terminal.

```powershell
python build_single_file_report.py ../chapter_01_generate_allure_report/allure-results-bdd -o bundle.html
```

**SAY (real numbers from this exact run, with the full 10-scenario suite):**

```
Raw JSON size:        965,820 characters
Gzip-compressed size: 660,296 bytes
Base64 (final) size:  880,396 characters
Single-file report written to: bundle.html
```

"Almost a million characters of test evidence - ten checks, nine kinds of attachments, all four outcomes - and it all fits in one file now."

### Scene 3 — Opening it back up

**SCREEN:** `decode_report.py`, built section by section.

**SAY:**

"First, three small building blocks - `TestCase`, `Step`, and `Attachment`, using Python's `dataclass`. Then the actual unpacking, the same five steps as before, just backwards."

**SCREEN:** Terminal.

```powershell
python decode_report.py bundle.html
```

**SAY (real output from this exact run):**

```
Decoded 10 test cases from bundle.html
  passed: 7  failed: 1  broken: 1  skipped: 1
  - [passed] Homepage screenshot is captured  (3 steps, 1 attachments)
  - [passed] Homepage check summary is recorded in three formats  (5 steps, 4 attachments)
  - [passed] Homepage response time is measured 3 times  (3 steps, 1 attachments)
  - [skipped] This check is skipped on purpose  (2 steps, 0 attachments)
  - [failed] This check is written to fail on purpose  (3 steps, 1 attachments)
        reason: AssertionError
  - [passed] Homepage evidence is archived into a zip file  (3 steps, 2 attachments)
  - [passed] Homepage mentions Python  (3 steps, 1 attachments)
  - [passed] Homepage screenshot is also captured as a JPEG  (3 steps, 1 attachments)
  - [broken] This check is broken by an unexpected error  (2 steps, 0 attachments)
  - [passed] Homepage responds successfully  (3 steps, 1 attachments)
```

"Ten test cases. Seven passed, one failed, one broken, one skipped - every single outcome from Chapter 1, accounted for by number, not just by eyeballing a screen. That's proof, not a claim."

**SAY (an honest aside worth keeping in the video):**

"Small side note - the very first version of this script only printed passed and failed counts, and silently said nothing about broken or skipped tests, even though it had decoded them correctly the whole time. That's an easy mistake to make: the DATA was always right, but the SUMMARY printed from it wasn't telling the whole story. Worth remembering any time you write a script that summarizes something - check that your summary counts everything your data actually contains."

### Scene 4 — Wrap-up

**SAY:**

"So here's what happened. We took a folder full of separate files and squashed it into one. We wrote our own decoder that turns it back into clean Python objects - test cases, their steps, and their attachments, as actual raw bytes we can do something with, across all four real outcomes.

Next time, we're going to take those exact objects and put them somewhere permanent - a real database. See you there."

---

## What to show on screen — director's notes

| Moment | What to show | Why |
|---|---|---|
| Scene 1 | 22 small file icons animate sliding together into one file icon | Makes "why squash it" visceral before any code |
| Scene 2, step-by-step | A size bar shrinking from 965,820 → 660,296 then growing to 880,396 | Turns an abstract idea into three concrete numbers moving on screen |
| Scene 3 (decode result) | The status line `passed: 7 failed: 1 broken: 1 skipped: 1` appearing one word at a time, each with its matching quiet color | Reinforces the four-outcome idea from Chapter 1 |
| Scene 3 (the honest aside) | A small "before/after" split showing the old two-number summary next to the new four-number one | Makes the lesson about summaries concrete, not just spoken |
| Scene 4 | A simple animated arrow from "Attachment (raw bytes)" sliding toward a database icon | Foreshadows Chapter 3 |

### Suggested on-screen animation / graphic overlays

- **Scene 1:** Ten small file icons animate sliding together and merging into one file icon.
- **Scene 2:** A literal size bar the viewer watches shrink then grow slightly, ending at the base64 number.
- **Scene 3:** As the three dataclasses are introduced, a small nested-box diagram builds live (TestCase containing Step containing Attachment).
- **Scene 3 (decode result):** Two terminal snapshots side by side - Chapter 1's `7 scenarios passed, 1 failed, 1 error, 1 skipped` and this chapter's `passed: 7 failed: 1 broken: 1 skipped: 1` - a green checkmark animates in between them once both are visible.
- **Scene 4:** A simple animated arrow from "Attachment (raw bytes)" sliding toward a database icon off to the right.

---

## Key takeaways

1. "Single file" reports are just: gather everything into one structure, compress it, encode it as safe text, and hide it inside a container file. Five repeatable steps, nothing magic.
2. `gzip` shrinks repetitive text like JSON well; it does much less for already-compressed binary data like a PNG or JPEG screenshot.
3. `base64` exists purely so raw bytes can travel safely through text-only places — it does not compress anything, it just re-encodes.
4. Deciding your target data shape (`TestCase` / `Step` / `Attachment`) before writing the decoder makes the decoder itself almost boring to write.
5. The best way to prove a decoder is correct is to compare its output numbers against a known-correct source — and make sure your summary actually counts every outcome your data contains, not just the two most common ones.

---

## Verified facts used in this script

- `python build_single_file_report.py ../chapter_01_generate_allure_report/allure-results-bdd -o bundle.html` (against the current 10-scenario Chapter 1 suite) printed: `Raw JSON size: 965,820 characters`, `Gzip-compressed size: 660,296 bytes`, `Base64 (final) size: 880,396 characters`.
- `python decode_report.py bundle.html` printed `Decoded 10 test cases from bundle.html`, `passed: 7  failed: 1  broken: 1  skipped: 1`, and correctly listed all 10 test cases with their real attachment counts and the exact failure reason `AssertionError` for the deliberately-broken-on-purpose scenario.
- Fixed a real gap in `decode_report.py`'s own summary print: it originally counted only `passed`/`failed`, silently omitting `broken`/`skipped` from the printed total even though the underlying decode was always correct. Now prints all four.
- Both scripts use only Python's standard library — confirmed zero third-party imports in either file.

## Files that belong in the project folder for this chapter

```
chapter_02_decode_allure_report/
  build_single_file_report.py   <- squashes a results folder into one HTML file
  decode_report.py               <- unpacks that HTML file back into TestCase objects (now counts all 4 statuses)
  bundle.html                    <- generated, the actual single-file report
```
