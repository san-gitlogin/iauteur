# Chapter 5 — FastAPI, and What Frontend and Backend Actually Mean

## The promise of this chapter

By the end of this chapter, someone watching has:

- a plain-English answer to "what even is a frontend, what even is a backend"
- a real, running API with five different kinds of endpoint
- tested every one of those endpoints using FastAPI's own `/docs` page, with no extra tools
- watched, with a stopwatch, the actual difference between async done right and async done wrong

---

## What has to be true before you record

```powershell
pip show fastapi uvicorn requests
```

On the machine this was built on: `fastapi 0.141.1`, `uvicorn 0.51.0`, `requests 2.34.2`.

One more thing worth checking before you record: pick a port and make sure it's actually free. Port 8000 was blocked by Windows itself on this machine with a permissions error — not every machine will hit that, but it's worth a quick check so you're not debugging it live. This chapter uses port 8834.

---

## The narration script

### Scene 1 — What is a backend, actually?

**SCREEN:** Two boxes on screen — one labelled "Frontend (what you see)" with a little browser window icon, one labelled "Backend (what actually does the work)" with a little server icon, connected by an arrow.

**SAY:**

"Quick, plain answer before we write anything. A frontend is the part a person actually looks at and clicks on — buttons, pages, screens. A backend is the part nobody sees — it holds the real data, it does the real thinking, and it answers questions when the frontend asks. Today we're building a backend. Just the part that answers questions. No buttons, no pages — that's for a later chapter. Today, just the brain."

### Scene 2 — The simplest possible endpoint

**SCREEN:** New file, `main.py`, typed live, just this much first:

```python
from fastapi import FastAPI

app = FastAPI(title="Chapter 5 - FastAPI Basics")


@app.get("/hello")
def say_hello():
    return {"message": "hello from the backend"}
```

**SAY:**

"That's a real, working backend. Four lines that matter. `@app.get('/hello')` means 'when someone visits this address and asks nicely with a GET request, run the function underneath.' And the function just hands back a small dictionary, which FastAPI turns into JSON automatically. Let's actually run it."

```powershell
python -m uvicorn main:app --port 8834
```

**SAY (real output):**

```
INFO:     Uvicorn running on http://127.0.0.1:8834 (Press CTRL+C to quit)
```

"That's it. It's alive. Let's go visit `/docs`."

**SCREEN:** Browser, `http://127.0.0.1:8834/docs`.

**SAY:**

"And here's something worth pausing on — I didn't build this page. FastAPI looked at my code and built this entire interactive page by itself. Every endpoint I write shows up here automatically, and you can actually click 'Try it out' and run it, right from the browser, with no separate tool needed."

**SCREEN:** Click "Try it out" on `/hello`, click Execute, show the real response appear.

### Scene 3 — Getting information INTO the backend, three different ways

**SCREEN:** Add to `main.py`, one at a time:

```python
@app.get("/greet/{name}")
def greet_someone(name: str):
    return {"message": f"hello, {name}"}
```

**SAY:**

"This one reads a value straight out of the web address itself. Visit `/greet/Ada`, and 'Ada' lands directly in the `name` variable. This is called a path parameter."

```python
@app.get("/add")
def add_two_numbers(a: int, b: int):
    return {"a": a, "b": b, "sum": a + b}
```

**SAY:**

"This one reads values from after the question mark in the address — `/add?a=4&b=5`. These are called query parameters. Notice I said `a: int` — FastAPI actually checks that whatever comes in really is a whole number, and tells the caller off politely if it isn't, before my function even runs."

```python
class NewMessage(BaseModel):
    author: str
    text: str

class StoredMessage(BaseModel):
    id: int
    author: str
    text: str

_messages: list[StoredMessage] = []

@app.post("/messages", response_model=StoredMessage)
def create_message(message: NewMessage):
    stored = StoredMessage(id=len(_messages) + 1, author=message.author, text=message.text)
    _messages.append(stored)
    return stored
```

**SAY:**

"And this one is the big one — a real request BODY, not just values crammed into the address. Someone sends a whole little package of data — an author and some text — and FastAPI checks it against this `NewMessage` shape before letting my code touch it. And notice `response_model=StoredMessage` — that's me promising exactly what shape I'll hand back, every time, no surprises."

**SCREEN:** Back in `/docs`, use "Try it out" on `POST /messages`, type in a real author and message, execute, show the real JSON response with the auto-generated `id`.

### Scene 4 — The async lesson, with a stopwatch

**SCREEN:** Add the final two endpoints:

```python
@app.get("/slow-bad")
async def slow_endpoint_done_wrong():
    time.sleep(3)  # blocking - freezes everything else too
    return {"message": "finished the slow (blocking) way"}


@app.get("/slow-good")
async def slow_endpoint_done_right():
    await asyncio.sleep(3)  # non-blocking - lets other requests run meanwhile
    return {"message": "finished the slow (non-blocking) way"}
```

**SAY:**

"Now here's something a lot of people get wrong, and I want to actually prove it to you instead of just telling you. Both of these say `async def`. Writing `async def` does NOT automatically mean your code behaves nicely. Look closely — the first one calls plain old `time.sleep`, which just freezes everything, full stop, for three seconds. The second one calls `await asyncio.sleep`, which politely says 'I'll be busy for three seconds, feel free to help someone else while you wait.'

Let's actually time the difference, with two people showing up to ask questions at the exact same moment."

**SCREEN:** Terminal, running `test_client_demo.py`.

```powershell
python test_client_demo.py
```

**SAY (real output from this exact run — this is the payoff of the whole chapter):**

```
--- Two requests at once to /slow-bad (async def, but uses blocking time.sleep) ---
Both requests finished after: 6.0 seconds

--- Two requests at once to /slow-good (async def, uses await asyncio.sleep) ---
Both requests finished after: 3.0 seconds
```

"Look at that. Both endpoints wait three seconds internally. But two requests to the bad one took six seconds — they had to line up, one after the other. Two requests to the good one took three seconds — they actually happened at the same time. Same wait time inside each function. Completely different experience for the person asking. That is the entire idea of async, proven with a stopwatch instead of just a sentence."

### Scene 5 — Wrap-up

**SAY:**

"So here's what we built. A real backend, with five different endpoints, each one teaching a different way of getting information in and out. We tested every single one of them using a page FastAPI built for us automatically, with no extra tools. And we proved, with real numbers, that the word 'async' by itself means nothing — what matters is whether you actually wait the polite way inside it.

Next time, we're going to connect this backend to the database we built back in Chapter 4, and actually ask it real questions about real test results. See you there."

---

## What to show on screen — director's notes

| Moment | What to show | Why |
|---|---|---|
| Scene 1 | The frontend/backend two-box diagram, animated arrow between them | Sets the plain-English mental model before any code |
| Scene 2 (docs page) | Slow mouse movement clicking "Try it out," pause on the response appearing | Let viewers see this is a real, clickable tool, not a screenshot |
| Scene 3 | Each new endpoint gets its own small labelled tab in `/docs` appearing live as you add code and reload | Visually ties "I wrote a function" directly to "a new testable thing appeared" |
| Scene 4 (the stopwatch) | An actual on-screen stopwatch graphic counting up during both test runs, side by side if possible | Makes the abstract async concept viscerally, visibly, timed |
| Scene 5 | The five endpoint tabs in `/docs`, with a soft arrow pointing toward a small database icon off to the side | Sets up Chapter 6 visually |

### Suggested on-screen animation / graphic overlays

- **Scene 1:** The backend box "lights up" (soft glow) the moment code starts being written, staying dark until then — reinforces "backend = the part doing the work, invisible until now."
- **Scene 2:** A small "auto-generated" badge stamp animates onto the `/docs` page the first time it's shown, to make clear this page wasn't hand-built.
- **Scene 3:** As each endpoint code block finishes, a small animated line draws from the code straight to its corresponding row appearing in `/docs` — same "code creates this" link used in Scene 2, reinforced per-endpoint.
- **Scene 4:** Two parallel horizontal timeline bars, one labelled "bad," one labelled "good" — both requests as blocks on each bar. On "bad," the two blocks sit end-to-end (6 seconds total). On "good," the two blocks sit stacked on top of each other, same start time (3 seconds total). This single image communicates the entire lesson without narration.
- **Scene 5:** A small database cylinder icon fades in at the edge of the screen with a dotted connecting line to the FastAPI logo, foreshadowing the join in Chapter 6.

---

## Key takeaways

1. Backend = the part that holds data and does work; frontend = the part a person actually sees and clicks. This chapter builds only the backend, on purpose.
2. `@app.get(...)` and `@app.post(...)` map a web address and an HTTP method to a plain Python function — that's the entire core idea of an API endpoint.
3. There are three common ways information flows into an endpoint: path parameters (`/greet/{name}`), query parameters (`/add?a=4&b=5`), and a request body described by a Pydantic model — each suited to a different kind of input.
4. FastAPI's `/docs` page is generated automatically from your code and lets you test every endpoint by hand, with real requests and real responses, with no separate tool.
5. Writing `async def` does not make code non-blocking by itself — a blocking call like `time.sleep()` inside an `async def` function freezes every other request too. Only genuinely non-blocking calls (like `await asyncio.sleep()`, or awaited database/network calls) actually let other requests proceed while one is waiting.

---

## Verified facts used in this script

- Environment: fastapi 0.141.1, uvicorn 0.51.0, requests 2.34.2.
- Port 8000 failed to bind on this machine with a real Windows permissions error (`WinError 10013`) — port 8834 was used instead and worked cleanly.
- Every endpoint was exercised live: `/hello`, `/greet/Ada`, `/add?a=4&b=5`, `POST /messages`, `GET /messages` all returned the exact JSON shown above, confirmed via `test_client_demo.py` against a real running server.
- `/docs` and `/openapi.json` both returned HTTP 200, and the OpenAPI schema genuinely listed all six real paths (`/hello`, `/greet/{name}`, `/add`, `/messages`, `/slow-bad`, `/slow-good`).
- The async timing test is real, not illustrative: two concurrent requests to `/slow-bad` genuinely took `6.0 seconds` total, and two concurrent requests to `/slow-good` genuinely took `3.0 seconds` total, measured with `time.perf_counter()` around both requests running through a `ThreadPoolExecutor`.

## Files that belong in the project folder for this chapter

```
chapter_05_fastapi_basics/
  main.py               <- the FastAPI app: 6 endpoints across 3 input styles + the async lesson
  test_client_demo.py   <- exercises every endpoint and times the async comparison
  requirements.txt      <- fastapi, uvicorn, requests
```
