"""
main.py

A small, self-contained FastAPI app used to teach five ideas:
  1. The simplest possible endpoint (no input at all)
  2. Reading a value out of the URL path
  3. Reading a value out of the query string (?key=value)
  4. Reading a whole structured body (a Pydantic model), and returning one back
  5. What "async" actually buys you - and what happens when you get it wrong

Run it with:
    python -m uvicorn main:app --reload --port 8834

Then open http://127.0.0.1:8834/docs in a browser - FastAPI builds that
page for you automatically, from this exact code, with zero extra work.
"""
import asyncio
import time

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Chapter 5 - FastAPI Basics")


# ---------------------------------------------------------------------------
# 1. The simplest possible endpoint.
# ---------------------------------------------------------------------------
@app.get("/hello")
def say_hello():
    """No input, no parameters. Just a fixed answer."""
    return {"message": "hello from the backend"}


# ---------------------------------------------------------------------------
# 2. A value read straight out of the URL itself - a "path parameter."
# ---------------------------------------------------------------------------
@app.get("/greet/{name}")
def greet_someone(name: str):
    """Visiting /greet/Ada sends "Ada" straight into this function."""
    return {"message": f"hello, {name}"}


# ---------------------------------------------------------------------------
# 3. Values read from after the "?" in the URL - "query parameters."
# ---------------------------------------------------------------------------
@app.get("/add")
def add_two_numbers(a: int, b: int):
    """Visiting /add?a=4&b=5 sends a=4 and b=5 straight into this function."""
    return {"a": a, "b": b, "sum": a + b}


# ---------------------------------------------------------------------------
# 4. A whole structured request body, described as a Pydantic model.
#    FastAPI reads the incoming JSON, checks it matches this shape, and
#    hands you a real Python object - not a raw dictionary you have to
#    trust blindly.
# ---------------------------------------------------------------------------
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
    """
    Sending {"author": "Sam", "text": "hi"} as the request body creates
    a new stored message and hands back exactly the shape declared by
    `response_model` - nothing more, nothing less.
    """
    stored = StoredMessage(id=len(_messages) + 1, author=message.author, text=message.text)
    _messages.append(stored)
    return stored


@app.get("/messages", response_model=list[StoredMessage])
def list_messages():
    return _messages


# ---------------------------------------------------------------------------
# 5. Async, done wrong and done right.
#
#    /slow-bad is declared `async def`, but calls the BLOCKING time.sleep()
#    inside it. Because it's blocking, it freezes the ONE thread that
#    handles every request, so a second request has to wait for the
#    first one to completely finish before it even starts.
#
#    /slow-good is also `async def`, but calls `await asyncio.sleep()`,
#    which politely hands control back while it waits. A second request
#    can start running during that wait, instead of queueing behind it.
# ---------------------------------------------------------------------------
@app.get("/slow-bad")
async def slow_endpoint_done_wrong():
    time.sleep(3)  # blocking - freezes everything else too
    return {"message": "finished the slow (blocking) way"}


@app.get("/slow-good")
async def slow_endpoint_done_right():
    await asyncio.sleep(3)  # non-blocking - lets other requests run meanwhile
    return {"message": "finished the slow (non-blocking) way"}
