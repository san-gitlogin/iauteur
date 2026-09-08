# Chapter 9 — Upload a Real Report, Get an Instant AI Summary, and Talk to It

## The promise of this chapter

By the end of this chapter, someone watching has:

- uploaded a REAL Allure HTML report - not just our own Chapter 2 bundle format - and watched it decode and store correctly
- seen the app automatically detect which of three formats it just received (our own bundle, real Allure legacy, or allure-combine)
- watched an AI summary appear automatically, the instant a report is opened, with the exact list of failing tests pulled straight from the database
- searched a grid of multiple reports by name
- built a real chat box that talks to the AI about whichever test is currently open, streaming word by word, and genuinely remembering earlier messages
- seen the exact same UI work with zero AI setup (stub) and with a real Azure OpenAI account, side by side

This is the last chapter, and it's the one where every earlier chapter's work finally shows up on one screen at once - the finished **Allure AI Report Analyser**.

---

## What has to be true before you record

Same two AI modes as Chapter 8 apply here too:

```powershell
pip show fastapi uvicorn openai flask
```

`fastapi 0.141.1`, `uvicorn 0.51.0`, `openai 3.9.0`, `Flask 3.1.3`.

```powershell
# optional - only if you want the real AI instead of the stub
$env:AZURE_OPENAI_API_KEY = "your-own-key"
$env:AZURE_OPENAI_ENDPOINT = "https://your-own-resource.openai.azure.com"
```

This chapter's backend needs both a copy of Chapter 2's `bundle.html` AND at least one real Allure HTML export to demonstrate the upload feature properly - one in our own format, one genuinely produced by Allure.

---

## The narration script

### Scene 1 — What's actually new in this final chapter

**SCREEN:** A simple four-item checklist: "Upload a real report" / "Automatic AI summary" / "Search a grid of reports" / "A real, remembering, streaming chat."

**SAY:**

"Everything up to this point assumed one report, already sitting there, already in our own tutorial format. This chapter removes both of those training wheels. We're going to accept a genuinely real Allure HTML export, uploaded through a browser. We're going to show an AI-written summary automatically, the second a report opens, no button required. We're going to let someone search across many reports. And we're going to build a real conversation with memory. Four new things. Let's take them one at a time."

### Scene 2 — Understanding a REAL Allure HTML file, not just our own

**SCREEN:** `allure_html_decoder.py`, the `is_combine_format` function, then a side-by-side of two real Allure export snippets - one containing `Promise.allSettled`, one containing `server_data`/`respondWith`.

**SAY:**

"Here's something worth knowing if you ever work with real Allure reports. There isn't just one single-file format - there are genuinely two, depending on which tool packed it. An older, 'legacy' style, built around a JavaScript call named `Promise.allSettled`. And a newer style, produced by a tool called `allure-combine`, built around something called `server_data`. Same idea as our own Chapter 2 bundle - squash everything into one file - but a completely different internal shape. This module was ported, faithfully, from a real production report analyzer, specifically so this tutorial's decoder understands genuine Allure exports, not just its own toy format."

**SCREEN:** `_flatten_steps()`.

**SAY:**

"One more real-world wrinkle - actual Allure reports nest steps inside steps inside steps, arbitrarily deep. Our own `TestCase`/`Step` shape from Chapter 2 expects one flat list. This function walks that real nested structure and flattens it, depth-first, into the exact same flat shape we've used since Chapter 2 - which means everything downstream, storage, the API, the frontend, needed zero changes to understand real Allure data once this one function existed."

### Scene 3 — Detecting the format automatically on upload

**SCREEN:** `main.py`, `upload_report`.

```python
html_text = raw_bytes.decode("utf-8", errors="ignore")

if '<script id="report-bundle"' in html_text:
    detected_format = "tutorial-bundle"
    test_cases = decode_report(tmp_path)
elif allure_html_decoder.is_combine_format(html_text):
    detected_format = "allure-combine"
    test_cases = allure_html_decoder.decode_any_report(tmp_path)
elif "Promise.allSettled" in html_text:
    detected_format = "allure-legacy"
    test_cases = allure_html_decoder.decode_any_report(tmp_path)
else:
    raise HTTPException(status_code=400, detail="Unrecognized report format...")
```

**SAY:**

"No dropdown asking 'which format is this.' We just sniff the file's own content for a telltale sign of each of the three formats we understand, and pick the right decoder automatically. If none of the three signs are there, we say so honestly, with a clear 400 error, instead of guessing."

### Scene 4 — One storage function, no matter which decoder ran

**SCREEN:** `store_test_cases()`.

**SAY:**

"This is the payoff of Chapter 2's design decision to settle on one shape - `TestCase`, `Step`, `Attachment` - early on. It doesn't matter which of the three decoders just ran. The moment we have a `list[TestCase]`, storing it is identical, one shared function, same as Chapter 4. New format support didn't need new storage code - only a new way of arriving at the same shape."

### Scene 5 — An AI summary that appears automatically, not on request

**SCREEN:** `main.py`, `analyze_report`, the `isinstance(provider, StubAIProvider)` branch.

**SAY:**

"Chapter 8's AI endpoint analyzed one test, on request. This one analyzes an ENTIRE report, automatically, the instant it's opened. And here's a real bug worth mentioning honestly - the very first version of this reused Chapter 8's per-test stub logic for a whole report, and it gave nonsense, like saying a whole mixed-result report 'passed,' because that stub only understood one test at a time. The fix was to recognize we're in stub mode and build a numerically correct sentence directly from the real counts we already have - `len(failing_tests)` out of `len(test_case_rows)` - rather than stretching logic designed for one test to describe many."

**SCREEN:** Browser, load a report, watch the AI Summary panel populate immediately, no button clicked.

**SAY (real response for the current dataset - 10 test cases, 2 needing attention):**

> "2 of 10 test case(s) need attention (status: failed or broken). See the highlighted list below for the exact reason behind each one - it's read straight from the test results, not summarized."
>
> 2 test case(s) need attention:
> - **[failed] This check is written to fail on purpose** — AssertionError
> - **[broken] This check is broken by an unexpected error** — KeyError: 'x-definitely-not-a-real-header'

"Notice that failing-tests list isn't written by the AI at all - it's built directly from a SQL query. Only the narrative sentence above it is AI-written. That way, 'what actually failed' is always exactly right, no matter how the AI happens to phrase things."

### Scene 6 — A grid you can search

**SCREEN:** Browser, the Reports panel, type into the search box.

**SAY:**

"Once there's more than one report, a plain list stops being enough. So there's a real search box now, filtering the report grid by name as you type, entirely on the frontend, no extra request to the backend needed for something this simple."

### Scene 7 — What makes a chat different from a normal API call

**SCREEN:** A simple diagram - a normal request/response arrow, then next to it, the same arrow but drawn as a dotted stream of small packets arriving one after another.

**SAY:**

"Every endpoint we've built so far works the same way - you ask, you wait, you get the whole answer at once. A real chat needs to feel different. It needs to feel alive, with words appearing as they're written, and it needs to remember what you already said to it. That's two new things to build - streaming, and memory. Let's do memory first, because streaming is easier to appreciate once there's an actual conversation happening."

### Scene 8 — Giving each conversation a memory

**SCREEN:** `chat_manager.py`, the `ChatSession` and `SessionStore` classes.

```python
@dataclass
class ChatSession:
    session_id: str
    history: list[dict] = field(default_factory=list)
    current_test_case_context: Optional[str] = None
    ...

class SessionStore:
    def get_or_create(self, session_id: str) -> ChatSession:
        if session_id not in self._sessions:
            self._sessions[session_id] = ChatSession(session_id=session_id)
        return self._sessions[session_id]
```

**SAY:**

"Nothing complicated here. Every browser tab gets its own random `session_id`, the moment it loads. The first time we see a session_id, we create a little box to remember its conversation. Every time after that, we just hand back the same box. That's the entire idea behind 'memory' - it's just a list that keeps growing, one box per conversation."

### Scene 9 — Not sending the AI more than it can handle

**SCREEN:** `TokenManager.trim_history`.

**SAY:**

"Here's something that trips people up the first time they build a real chat. AI models charge for, and can only hold, a limited amount of text per request - measured in tokens, not characters. If a conversation goes on long enough, we can't just send the ENTIRE history every time - it would eventually stop fitting, or get expensive fast. So this function keeps the newest messages, and quietly drops the oldest ones once we're close to the limit. The system message - who the AI is, and what test case we're discussing - always stays, no matter what gets trimmed."

### Scene 10 — Two ways to answer, both able to stream now

**SCREEN:** `ai_provider.py`, `stream_chat` on both providers.

**SAY:**

"Same idea as Chapter 8 - one stub, one real, both behind the same shape. But now both of them can hand back their answer in PIECES instead of all at once."

```python
def stream_chat(self, messages: list[dict]) -> Iterator[str]:
    stream = self.client.chat.completions.create(
        model=self.deployment_name, messages=messages, stream=True, max_tokens=400,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta
        if delta and delta.content:
            yield delta.content
```

"That one word, `stream=True`, is the entire difference on the real AI side. Instead of waiting for the whole reply, Azure OpenAI sends it to us piece by piece, and we just pass each piece straight through."

### Scene 11 — Sending those pieces to the browser as they arrive

**SCREEN:** `main.py`, `/chat/stream`.

```python
@app.post("/chat/stream")
def chat_stream(request: ChatRequest):
    session = session_store.get_or_create(request.session_id)
    if request.test_case_id is not None:
        detail = get_test_case_detail(request.test_case_id)
        session.current_test_case_context = build_analysis_context(detail)
    session.add_message("user", request.message)

    messages_for_ai = token_manager.trim_history(build_system_message(session.current_test_case_context), session.history)
    provider = get_ai_provider()

    def token_stream():
        full_reply = ""
        for piece in provider.stream_chat(messages_for_ai):
            full_reply += piece
            yield piece
        session.add_message("assistant", full_reply)

    return StreamingResponse(token_stream(), media_type="text/plain")
```

**SAY:**

"`StreamingResponse` is FastAPI's way of saying 'don't wait for this function to finish - send each piece the moment it's `yield`-ed.' And notice we still remember the full reply at the end, and save it into the session's history, so the NEXT message in this conversation has it available too."

### Scene 12 — The browser side: reading a stream as it arrives

**SCREEN:** `chat.js`.

```javascript
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  assistantBubble.textContent += decoder.decode(value, { stream: true });
}
```

**SAY:**

"This is the browser doing the exact same trick in reverse. `response.body.getReader()` lets us read the network response as it's still arriving, piece by piece, and every piece we get, we just tack onto the same little chat bubble on screen. That loop is the entire 'streaming' effect - nothing fancier than that."

### Scene 13 — Watching it all work, twice

**SCREEN:** The finished app, `http://127.0.0.1:5050`, chat panel at the bottom. Pick the failed test, ask "Why did this test fail?" - first with no AI account configured.

**SAY (real response, stub mode):**

> "I'm running without a real AI account right now, so I can only give a canned reply. You asked: Why did this test fail? -- once real Azure OpenAI credentials are set, I'll actually read the conversation and answer properly."

"Good - that's the honest fallback working exactly as designed, with zero setup. Now let's restart the backend with a real account and ask the exact same question."

**SCREEN:** Same question, same test case, real credentials this time.

**SAY (real response, live Azure OpenAI, streamed word by word on screen):**

> "The test failed because the assertion `assert expected_text in context.response.text` did not pass. Specifically, the expected text 'This text will never appear on python.org' was not found in the downloaded homepage HTML content from https://www.python.org. This caused an AssertionError, leading to the test failure."

"Look at that - it didn't just say 'it failed.' It quoted the actual line of code and the actual expected text, straight out of the context we built for it, and it streamed onto the screen exactly like a real conversation would."

**SAY:**

"Now let's prove the memory really works. Same conversation, new question - not about the test directly, but about something I already said."

**SCREEN:** Type "What was the exact status again?" in the same session.

**SAY (real response):**

> "The exact status of the test is: failed."

"It didn't need me to repeat myself. That's a real memory, held server-side, in that little session box we built earlier this chapter."

### Scene 14 — Wrap-up: the whole series, in one screen

**SCREEN:** The finished app, full screen - the searchable reports grid, the automatic AI summary, the test case list, the detail panel with a real screenshot, and the chat panel underneath, mid-conversation.

**SAY:**

"Look at everything on this one screen. A report we generated from nothing, in Chapter 1. Data we decoded out of a packed file, in Chapter 2 - and now, real Allure exports too, in either of their real formats. A database we planned before we built it, in Chapter 3, and connected in Chapter 4, tracking every one of the four real outcomes correctly. An API we tested by hand before writing a single line of frontend code, in Chapters 5 and 6. A screen we built ourselves, with no framework, and a calm, professional design, in Chapter 7. An AI that can explain a single failure honestly, with or without a real account, from Chapter 8 - and now, an entire report's worth of failures, summarized automatically the moment it opens. And finally, a real, remembering, streaming conversation about all of it.

Nothing in this series was assumed. Every command, every number, every AI response you saw was real, run on a real machine, while building this. That's the whole point. Go build your own version of this - you already know how every piece of it works."

---

## What to show on screen — director's notes

| Moment | What to show | Why |
|---|---|---|
| Scene 2 | Two real Allure HTML snippets side by side, one highlighted `Promise.allSettled`, the other highlighted `server_data` | Makes the two-real-formats fact concrete rather than abstract |
| Scene 3 | The three `if/elif/elif` branches lighting up in turn as a real file is dragged in, only one lighting up green | Shows automatic detection as a visible decision, not magic |
| Scene 5 (the honest aside) | A quick before/after: the buggy "This test PASSED" sentence for a mixed-result report, crossed out, replaced by the corrected "2 of 10 need attention" sentence | Makes the fix concrete and memorable |
| Scene 5 (summary panel) | The AI Summary panel populating the INSTANT the report is clicked, no spinner delay implied | Sells "automatic," not "on request" |
| Scene 6 | Typing into the search box, reports visibly filtering in real time | A small, satisfying, self-explanatory moment |
| Scene 10-12 | Split screen, server-side `yield` on the left and browser-side `reader.read()` loop on the right, synchronized | Shows the two ends of the same stream as one continuous idea |
| Scene 13 (stub vs real) | Identical question, identical test selected, side-by-side recording, stub answer fading into the real answer | The single clearest "before/after" moment in the whole series |
| Scene 13 (memory proof) | Highlight the word "failed" in the follow-up answer with a thin line drawn back to the earlier message where the status was first mentioned | Makes memory visually provable, not just claimed |
| Scene 14 | A slow, single continuous scroll or zoom-out across the whole finished screen, no cuts | The closing shot - let the whole build be seen as one thing |

### Suggested on-screen animation / graphic overlays

- **Scene 2:** The nested-steps flattening animates as a tree of boxes collapsing into a single flat row of boxes, left to right.
- **Scene 3:** A small funnel icon with three colored inputs (bundle/legacy/combine) narrowing down to one green checkmark output.
- **Scene 5:** Each new message/summary line types itself onto screen at a natural reading pace, not appearing all at once.
- **Scene 6:** Report cards visibly fading out one by one as non-matching characters are typed into the search box.
- **Scene 8:** Each new message appended to `history` animates in as a small tile sliding into the session's box, building a visible stack.
- **Scene 9:** A fill bar labeled "token budget," with old tiles visibly popping off the far end once the bar would overflow.
- **Scene 11:** Small dots traveling one at a time from a "server" icon to a "browser" icon, timed to roughly match real streaming speed (not instant).
- **Scene 13:** A soft "no AI" grey badge on the stub answer flipping to a green "live AI" badge on the real answer, same position both times.
- **Scene 14:** Gentle Ken-Burns style slow zoom-out from the chat bubble to the full screen, ending on a static frame for the closing line.

---

## Key takeaways

1. Real-world file formats often come in more than one shape for the same underlying idea (Allure "legacy" vs "allure-combine") - detect format from real content signals inside the file itself, don't assume one canonical shape.
2. Deeply nested real-world data (arbitrarily nested Allure steps) can be normalized once, early, into a flat shape your whole system already understands - that one flattening function is what let three different real formats reuse every downstream chapter's code unchanged.
3. Settling on one shared data shape early (Chapter 2's `TestCase`/`Step`/`Attachment`) pays off again here - `store_test_cases()` doesn't care which of three decoders produced its input.
4. A summary built for "one item" (Chapter 8's per-test stub) does not automatically generalize to "many items" (a whole report) - check explicitly for that mismatch rather than assuming reused logic still makes sense at a different scale.
5. Keep AI-derived narrative text and database-derived factual lists separate - build the "what actually failed" list directly from SQL, and let the AI only narrate around it, so the facts are always right regardless of how the AI phrases things.
6. Streaming is two matching halves: the server `yield`-ing pieces as they're ready (`StreamingResponse`), and the browser reading the response body incrementally (`response.body.getReader()`) instead of waiting for it to fully arrive.
7. Chat "memory" is nothing more than a growing list kept somewhere on the server, keyed by a session id - no special AI feature required, just ordinary state.
8. Real AI conversations need active token management - trimming old history to fit a budget - because the alternative is a request that silently grows until it stops working or gets expensive.
9. A finished multi-chapter project is best proven by showing it side by side with an earlier, simpler version of the same feature (stub vs real) - the contrast does more convincing than either version alone.

---

## Verified facts used in this script

- `GET /reports` (current dataset) returned `{'passed_count': 7, 'failed_count': 1, 'broken_count': 1, 'skipped_count': 1}` for the 10-scenario report, rendered correctly on the report card in a live browser check.
- `POST /reports/1/analyze` (stub mode, live) returned the exact summary sentence `"2 of 10 test case(s) need attention (status: failed or broken). See the highlighted list below for the exact reason behind each one - it's read straight from the test results, not summarized."` plus a `failing_tests` list of exactly 2 entries: `[failed] This check is written to fail on purpose - AssertionError` and `[broken] This check is broken by an unexpected error - KeyError: 'x-definitely-not-a-real-header'` — confirmed live via browser accessibility snapshot, matching the database exactly.
- Live browser check confirmed clicking the report immediately populated the AI Summary panel with no separate button click required, and populated all 10 test cases with correct status badges (7 passed, 1 failed, 1 broken, 1 skipped).
- Live browser check confirmed the report search box filters correctly: typing a non-matching string produced "No reports match your search."
- Fixed a real bug found and corrected while building this feature: the whole-report AI stub summary originally reused Chapter 8's per-test stub logic, which only understood one test's status at a time, producing nonsensical output (e.g. claiming a report with real failures "passed"). Fixed by special-casing `isinstance(provider, StubAIProvider)` in `analyze_report()` to build a numerically correct sentence directly from `len(failing_tests)` / `len(test_case_rows)`.
- Fixed the same `reports`-table gap noted in Chapters 4/6/7's docs: `UploadResponse`'s counts, the `/reports` query, `store_test_cases()`'s insert, and the `context_lines` totals sent to the AI in `analyze_report()` all now include `broken_count`/`skipped_count`, not just passed/failed.
- Stub mode streaming: `POST /chat/stream` for a fresh session streamed multiple chunks incrementally (verified via the browser's incremental rendering, not a single fake burst).
- Real Azure OpenAI mode (credentials set only via environment variables, never written to any file in this project): the same endpoint streamed a real reply that correctly identified the specific failing assertion and expected text from the context it was given, without being told what to look for; a same-session follow-up question ("What was the exact status again?") correctly returned "The exact status of the test is: failed," proving the server-side session history was genuinely used.
- No third-party JavaScript library used anywhere in the frontend — `app.js` and `chat.js` are both plain, dependency-free JavaScript.

## Files that belong in the project folder for this chapter

```
chapter_09_ai_frontend/
  backend_api/
    schema.sql, decode_report.py, store_report.py, bundle.html, tutorial.db   <- carried over, schema now tracks all 4 statuses
    allure_html_decoder.py   <- NEW: decodes real Allure HTML (legacy + allure-combine formats)
    ai_provider.py            <- extended with stream_chat() on both providers
    chat_manager.py            <- TokenManager, ChatSession, SessionStore, build_system_message()
    main.py                    <- upload endpoint, whole-report analyze endpoint, chat streaming endpoint, CORS
    requirements.txt
  frontend/
    app.py, templates/index.html   <- reports grid + search, AI summary panel, upload form, detail panel, chat panel
    static/style.css                <- design system carried from Chapter 7, plus grid/upload/summary styling
    static/app.js                    <- report search/filter, upload handler, loadReportSummary(), renderReportSummary()
    static/chat.js                   <- the streaming fetch + chat bubble rendering
```
