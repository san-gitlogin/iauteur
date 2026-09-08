# Chapter 7 — A Real Screen, Built From Scratch, Showing Real Data

## The promise of this chapter

By the end of this chapter, someone watching has:

- built a genuinely small frontend, from an empty folder, with no framework and no build step
- clicked through it in a real browser: pick a report, pick a test, see the detail
- watched a real screenshot, a real table, and a real failure message all appear correctly, automatically, based on what kind of data each one actually is
- seen a professional, restrained visual design applied to that same screen - one accent color, dot-plus-label status badges, a responsive layout - not a raw, undecorated page
- understood exactly why one extra setting (CORS) had to exist for any of this to work at all

---

## What has to be true before you record

This folder has two halves that both need to run at the same time:

```
backend_api/   <- Chapter 6's API, with one addition: CORS enabled
frontend/      <- brand new: the Flask app + the webpage
```

```powershell
pip show flask fastapi uvicorn
```

On the machine this was built on: `Flask 3.1.3`, `fastapi 0.141.1`, `uvicorn 0.51.0`.

---

## The narration script

### Scene 1 — Two servers, one screen

**SCREEN:** Two terminal windows side by side, both empty for now.

**SAY:**

"Today we're running two things at once, and I want you to actually see both of them, because this is exactly how real applications are usually built. One program answers questions — that's our backend from Chapter 6. The other one shows a person a screen and asks those questions on their behalf — that's the new part, our frontend. Let's start the backend first."

```powershell
cd backend_api
python -m uvicorn main:app --port 8834
```

**SAY:**

"That's running. Now, before we build the frontend, there's one small but important thing I added to this copy of the backend."

**SCREEN:** `backend_api/main.py`, the CORS section.

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**SAY:**

"Browsers are protective by default. If a webpage running on one address tries to call an API running on a different address, the browser blocks it, unless the API explicitly says 'yes, that's allowed.' That's what this does. Without it, our frontend would load, and every single request would silently fail. Keep this in mind — it's one of the most common 'why isn't this working' moments in real projects."

### Scene 2 — Building the page itself, one small piece at a time

**SCREEN:** New folder, `frontend/`, empty.

**SAY:**

"Let's build the actual screen. No React, no Vue, nothing to install and configure for hours. Just Flask serving one page, and plain JavaScript doing the asking."

```python
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html", api_base_url="http://127.0.0.1:8834")

if __name__ == "__main__":
    app.run(port=5050, debug=True)
```

**SAY:**

"That's the whole Flask app. One page, and it tells that page where the backend actually lives."

**SCREEN:** `templates/index.html`, showing the three-panel layout — Reports, Test Cases, Test Case Detail.

**SAY:**

"Three sections, side by side. Pick a report on the left, its test cases show up in the middle, pick one of those, and the full detail shows up on the right. That's the entire flow we're about to wire up."

### Scene 3 — Making it look like something someone would actually want to use

**SCREEN:** `static/style.css`, the `:root` custom properties at the top.

**SAY:**

"Before we wire up any data, a quick word on how this looks, because a working screen that's unpleasant to look at undersells everything we've built. The rule here is restraint. One accent color for anything clickable or informational — a calm blue. One attention color, reserved only for things that actually need attention — failed and broken statuses, a deliberate red. Everything else uses a small set of neutral greys. No rainbow of colors competing for attention."

**SCREEN:** Show a status badge - a small colored dot next to the word "PASSED" or "FAILED", not a solid filled pill.

**SAY:**

"Status badges are a dot plus a label, not a big solid block of color. It's a small choice, but it keeps a page full of test results calm to actually scan, rather than looking like a wall of colored blocks."

**SCREEN:** Resize the browser narrower, showing the three-column grid collapse into a single column.

**SAY:**

"And the layout itself is a responsive grid - three columns on a wide screen, collapsing down to one column, stacked, on anything narrower. One real bug worth mentioning here: early on, a long, unbroken line of text inside one of these panels - like a raw HTML snippet with no natural line breaks - was stretching the ENTIRE page horizontally, not just its own little box. The fix was one line of CSS, `min-width: 0` on the panel, overriding a CSS Grid default that assumes every item wants to grow to fit its content, no matter how wide that makes everything else. Worth remembering any time a grid layout mysteriously scrolls sideways."

### Scene 4 — The part that actually asks questions: app.js

**SCREEN:** `static/app.js`, built section by section.

**SAY (on `loadReports`):**

"This function does exactly one thing. It asks the backend for the list of reports, and for each one, it builds a small clickable item on the page. When you click it, it calls this next function."

```javascript
async function selectReport(reportId, clickedItem) {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}/test-cases`);
  const testCases = await response.json();
  // ...builds the middle list, one item per test case, with a status badge
}
```

**SAY:**

"Same idea, one level deeper — ask for the test cases inside the report you just clicked. And clicking one of THOSE calls the deepest function, which asks for full detail — steps and attachments and all."

**SAY (on `renderAttachment` — the important one):**

"Here's the part I actually want you to slow down and look at."

```javascript
if (attachment.mime_type.startsWith("image/")) {
  const img = document.createElement("img");
  img.src = rawUrl;                       // points straight at the backend
} else if (!attachment.has_binary_content) {
  const pre = document.createElement("pre");
  pre.textContent = attachment.text_content;
} else {
  const link = document.createElement("a");
  link.href = rawUrl;
  link.textContent = `Download ${attachment.name}`;
}
```

"One function, three different outcomes, decided purely by what kind of data it's actually looking at. Any image type - PNG or JPEG - becomes a real `<img>` tag pointed straight at our backend's raw-bytes endpoint from Chapter 6. Anything text-shaped becomes readable text. And anything else genuinely binary, like our zip archive, becomes a plain download link, because a browser has no sensible way to just 'render' a zip file inline. This started out only handling `image/png` and `text/csv` by name - it's now generalized to any image type and a binary/text split, with a real fallback instead of quietly showing nothing for a zip file."

### Scene 5 — Running it for real

**SCREEN:** Second terminal.

```powershell
cd frontend
python app.py
```

**SAY:**

"Running on port 5050. Let's open it."

**SCREEN:** Browser, `http://127.0.0.1:5050`. Show the report card reading "Homepage Checks Run 1 (7 passed, 1 failed, 1 broken, 1 skipped)."

**SAY:**

"There's our report card. All four real outcomes, counted correctly - seven passed, one failed, one broken, one skipped. Let's click into it."

**SCREEN:** Click "Homepage Checks Run 1." Show all 10 test cases appearing with their dot-plus-label badges - passed, passed, passed, skipped, failed, passed, passed, passed, broken, passed.

**SAY:**

"Ten test cases, every real outcome represented with its own badge. Let's click into the screenshot one."

**SCREEN:** Click "Homepage screenshot is captured." Scroll right to reveal the detail panel with the real screenshot rendered inline.

**SAY:**

"There it is. A real screenshot, taken by a real browser back in Chapter 1, decoded in Chapter 2, stored in Chapter 4, served by our API in Chapter 6, and now sitting on an actual webpage we built ourselves, just now. Let's check the failed one."

**SCREEN:** Click "This check is written to fail on purpose." Show the red failure box with the real `AssertionError` message, and the HTML snippet rendered as readable text underneath.

**SAY:**

"And there's our failure, in a clearly marked box, with the exact reason it failed — `AssertionError` — right there. Nothing on this screen is decoration. Every single piece of it came from a real chain of code we wrote ourselves, chapter by chapter."

### Scene 6 — Wrap-up

**SAY:**

"So here's what we just built. A real screen, from an empty folder, with no framework, that asks a real backend real questions, and shows whatever comes back in the way that actually makes sense for that kind of data — text as text, pictures as pictures, downloads for anything else — with a calm, professional design wrapped around all of it.

We've now gone the entire distance — from a test that visits a real website, all the way to a screen a person can actually look at and understand. Next time, we're going to make this thing smart — we're going to ask an AI to look at a failed test and tell us, in plain English, what it thinks went wrong. See you there."

---

## What to show on screen — director's notes

| Moment | What to show | Why |
|---|---|---|
| Scene 1 (CORS) | A small padlock icon on the browser side, and an "allowed" stamp appearing on the API side once CORS is added | Makes an invisible browser security rule visible |
| Scene 2 | The three-panel layout appearing as empty boxes first, labelled, before any data flows in | Sets the structure before the behavior |
| Scene 3 (design) | A quick before/after: a plain unstyled HTML page, then a soft dissolve into the final calm, restrained design | Justifies spending screen time on visual design, not just code |
| Scene 3 (min-width bug) | A long unbroken line of text visibly stretching a mock panel sideways, then snapping back into place the instant `min-width: 0` is added | Makes an easy-to-miss CSS bug concrete and memorable |
| Scene 4 (renderAttachment) | A small fork-in-the-road icon at the `if/else if/else`, same visual language used back in Chapter 4's `is_text_mime_type` check | Deliberately echoes an earlier chapter's visual so the pattern feels familiar, not new |
| Scene 5 | Slow, deliberate clicks, a short pause after each one before scrolling to the result | Give each of the data types (image/failure) its own beat to land |
| Scene 6 | The finished three-panel screen, then a soft zoom into the red failure badge with a small "?" icon appearing next to it | Sets up "what if something could explain this for us" as the hook into Chapter 8 |

### Suggested on-screen animation / graphic overlays

- **Scene 1:** A small shield icon appears over the frontend-to-backend arrow, cracks open once CORS is added, with a soft "allowed" checkmark.
- **Scene 2:** The three panels draw themselves in outline, left to right, each with a small numbered "1, 2, 3" label showing the order data flows through them.
- **Scene 3:** The status badge close-up animates from a solid color block into the final dot-plus-label design, showing the "restraint" decision visually.
- **Scene 4:** As `renderAttachment` is discussed, three small icons (picture, paragraph, download arrow) animate dropping into their matching branch.
- **Scene 5:** Each clicked list item gets a soft highlight-flash the moment its detail appears on the right, so viewers on a smaller screen don't lose track of cause and effect.
- **Scene 6:** A small animated question mark pulses gently next to the red failure badge, then the screen dims slightly and a new title card fades in: "Chapter 8 - Asking AI Why."

---

## Key takeaways

1. A frontend doesn't need a framework to be real — a single HTML page, a little CSS, and plain `fetch()` calls are enough to prove a full pipeline end to end.
2. CORS exists to stop a webpage from silently calling APIs it has no business calling — when a frontend and backend run on different ports, the backend has to explicitly opt in with `CORSMiddleware` or every request will fail quietly.
3. A restrained design system - one accent color, one attention color reserved for real problems, a small neutral palette, dot-plus-label badges instead of solid color blocks - reads as calm and professional even on a genuinely small, hand-built page.
4. CSS Grid items default to `min-width: auto`, meaning a long unbroken string of text inside a grid item can stretch the entire layout sideways. Add `min-width: 0` to grid items that hold free-form text.
5. Deciding how to render each attachment - any `image/*` type inline, non-binary content as text, genuinely binary non-image content as a download link - is the same "match the data to its right treatment" idea from Chapter 4's `is_text_mime_type` rule, reapplied one layer up on the frontend.
6. Pointing an `<img>` tag straight at a backend URL (rather than trying to embed image data by hand) lets the browser do all the image-decoding work for you, for free.
7. Building the frontend last, once the backend is proven correct, means almost every bug you hit while building the page is a rendering bug, not a data bug — the data was already trustworthy by the time you got here.

---

## Verified facts used in this script

- Backend server log confirmed real calls: `GET /reports`, `GET /reports/1/test-cases`, `GET /test-cases/1`, `GET /attachments/1/raw`, `GET /test-cases/5` — all returned `200 OK`.
- Opened the real page at `http://127.0.0.1:5050` in a live browser against the current 10-scenario dataset: the report card correctly read "Homepage Checks Run 1 (7 passed, 1 failed, 1 broken, 1 skipped)"; clicking it correctly populated all 10 test cases with their correct status badges (7 passed, 1 skipped, 1 failed, 1 broken); clicking "Homepage screenshot is captured" rendered the real PNG screenshot inline via an `<img>` tag; clicking "This check is written to fail on purpose" rendered a red failure box containing the real `AssertionError` message plus the HTML snippet attachment as readable text.
- Fixed a real gap found while verifying this chapter: the report card previously read `report.passed_count` / `report.failed_count` only, meaning a report with broken or skipped tests would show a count that didn't add up to the real total (e.g. "7 passed, 1 failed" when the report actually had 10 test cases). Fixed in `static/app.js` to include `broken_count`/`skipped_count`, matching the corrected backend schema from Chapter 4/6.
- No third-party JavaScript library used anywhere — `app.js` is plain, dependency-free JavaScript.

## Files that belong in the project folder for this chapter

```
chapter_07_flask_frontend/
  backend_api/                 <- Chapter 6's API + CORSMiddleware added, schema with broken/skipped counts
    main.py, schema.sql, decode_report.py, store_report.py, bundle.html, tutorial.db, requirements.txt
  frontend/
    app.py                     <- tiny Flask app, serves one page
    templates/index.html       <- the three-panel layout
    static/style.css           <- design system: CSS variables, badges, panels, tables, images, min-width fix
    static/app.js               <- all the fetch() calls and rendering logic
    requirements.txt            <- Flask
```
