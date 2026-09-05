#!/usr/bin/env node
// GEN — demos/mcp-agent.json
//
// CODING AN AI AGENT WITH MCP, TYPED FROM AN EMPTY FOLDER.
//
// Owner's constraints, carried from the last cut and restated for this one:
//   *"you need to code type everything and perform voice over. No leaving anything. No
//    readymade code or logfile usage."*  and  *"Let user know what we are gonna achieve
//    using what."*
//
// So NOTHING here is pre-written. The five files are created empty by `prep` and every
// character is typed on camera. The service log is not a fixture either — `api.py` grows a
// middleware that writes a line per request, and `traffic.py` fires sixty requests at it, so
// `service.log` exists because the app made it. `/checkout` is genuinely slow and genuinely
// flaky, so the story the agent finds at the end is a real one it had to go and look up.
//
// THE ARC, and it is the reason for the step order:
//   1. an app, and the log it writes            (you already have these)
//   2. three plain Python functions over them   (these already work)
//   3. the problem: a model cannot call them
//   4. `@mcp.tool()` — the docstring IS the schema
//   5. Inspector — see the tools without writing an agent
//   6. the loop — the model picks a tool, we run it, it answers
//
// VERSION, AND WHY IT MATTERS. `mcp` 2.x RENAMED FastMCP to MCPServer, and moved
// `inputSchema` to `input_schema`. Anything written against 1.x — including the reference
// this was learned from — fails on its first line today with a ModuleNotFoundError that
// names the rename. A beginner running `uv add "mcp[cli]"` gets 2.x, so 2.x is what gets
// typed. Verified against mcp 2.1.1 before a single frame was recorded.
//
// THE KEY IS NEVER ON SCREEN. `.env` is typed with the key masked at source and the
// resource named YOUR-RESOURCE; the real values are exported from /tmp/iauteur-secret,
// outside the workspace, and `load_dotenv()` does not override an existing env var — so the
// run is genuine and nothing sensitive is ever rendered.
import fs from 'node:fs';

// ── THE FILES, EXACTLY AS THEY ARE TYPED ────────────────────────────────────────
// Split into blocks so each one is its own step with its own explanation over it.

const API_1 = `import random
import time

from fastapi import FastAPI, HTTPException, Request

app = FastAPI()

ORDERS = {
    "SO-1001": {"id": "SO-1001", "region": "North", "status": "delivered"},
    "SO-1002": {"id": "SO-1002", "region": "Central", "status": "delivered"},
    "SO-1003": {"id": "SO-1003", "region": "Remote", "status": "lost_in_transit"},
}`;

const API_2 = `

@app.middleware("http")
async def write_a_log_line(request: Request, call_next):
    started = time.time()
    reply = await call_next(request)
    took = max(1, int((time.time() - started) * 1000))
    level = "ERROR" if reply.status_code >= 400 else "INFO "
    with open("service.log", "a") as log:
        log.write(f"{time.strftime('%H:%M:%S')} {level} {request.url.path:<16} "
                  f"{reply.status_code} {took}ms\\n")
    return reply`;

const API_3 = `

@app.get("/orders")
def list_orders():
    return list(ORDERS.values())


@app.get("/orders/{order_id}")
def get_order(order_id: str):
    if order_id not in ORDERS:
        raise HTTPException(status_code=404, detail="no such order")
    return ORDERS[order_id]


@app.post("/checkout")
def checkout():
    time.sleep(random.uniform(0.8, 2.4))
    if random.random() < 0.55:
        raise HTTPException(status_code=500, detail="upstream timeout")
    return {"ok": True}`;

const TRAFFIC = `import random

import httpx

API = "http://127.0.0.1:8000"

for _ in range(60):
    roll = random.random()
    if roll < 0.4:
        httpx.get(f"{API}/orders")
    elif roll < 0.7:
        httpx.get(f"{API}/orders/SO-1001")
    else:
        httpx.post(f"{API}/checkout")

print("done - look at service.log")`;

const TOOLS_1 = `from collections import Counter

import httpx

LOG = "service.log"
API = "http://127.0.0.1:8000"


def recent_errors() -> str:
    """Count the errors in the service log, grouped by route."""
    hits = Counter()
    for line in open(LOG):
        time, level, route, status, took = line.split()
        if level == "ERROR":
            hits[route] += 1
    return "\\n".join(f"{route} failed {n} times" for route, n in hits.most_common())`;

const TOOLS_2 = `

def slowest_routes() -> str:
    """Report each route's average response time, slowest first."""
    times = {}
    for line in open(LOG):
        time, level, route, status, took = line.split()
        times.setdefault(route, []).append(int(took.removesuffix("ms")))
    rows = sorted(times.items(), key=lambda kv: -sum(kv[1]) / len(kv[1]))
    return "\\n".join(f"{r} took {sum(v) // len(v)}ms on average" for r, v in rows)`;

const TOOLS_3 = `

def get_order(order_id: str) -> str:
    """Look up one order by its id, from the orders service."""
    reply = httpx.get(f"{API}/orders/{order_id}")
    if reply.status_code == 404:
        return f"there is no order called {order_id}"
    return str(reply.json())`;

// mcp 2.x: MCPServer, not FastMCP.
const SERVER_1 = `from mcp.server.mcpserver import MCPServer

import tools

mcp = MCPServer("service-tools")


@mcp.tool()
def recent_errors() -> str:
    """Count the errors in the service log, grouped by route."""
    return tools.recent_errors()`;

const SERVER_2 = `

@mcp.tool()
def slowest_routes() -> str:
    """Report each route's average response time, slowest first."""
    return tools.slowest_routes()


@mcp.tool()
def get_order(order_id: str) -> str:
    """Look up one order by its id, for example SO-1003."""
    return tools.get_order(order_id)`;

const SERVER_3 = `

@mcp.resource("log://today")
def todays_log() -> str:
    """The raw service log for today."""
    return open("service.log").read()


if __name__ == "__main__":
    mcp.run()`;

const AGENT_1 = `import asyncio
import json
import os
import sys

from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from openai import OpenAI

load_dotenv()`;

const AGENT_1B = `


async def main(question: str) -> None:
    params = StdioServerParameters(command=".venv/bin/python", args=["server.py"])

    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()`;

const AGENT_2 = `

            found = await session.list_tools()
            menu = [
                {
                    "type": "function",
                    "function": {
                        "name": tool.name,
                        "description": tool.description,
                        "parameters": tool.input_schema,
                    },
                }
                for tool in found.tools
            ]
            print(f"the model can see {len(menu)} tools\\n")`;

const AGENT_3 = `

            client = OpenAI(
                base_url=os.getenv("AI_BASE_URL"),
                api_key=os.getenv("AI_API_KEY"),
            )
            messages = [{"role": "user", "content": question}]

            answer = client.chat.completions.create(
                model=os.getenv("AI_MODEL"), messages=messages, tools=menu
            )
            picked = answer.choices[0].message`;

const AGENT_4 = `

            messages.append(picked)
            for call in picked.tool_calls:
                args = json.loads(call.function.arguments)
                print(f"it chose {call.function.name}({args})")
                result = await session.call_tool(call.function.name, args)
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": call.id,
                        "content": result.content[0].text,
                    }
                )`;

const AGENT_5 = `

            final = client.chat.completions.create(
                model=os.getenv("AI_MODEL"), messages=messages
            )
            print()
            print(final.choices[0].message.content)


asyncio.run(main(sys.argv[1]))`;

// Masked at source. The real values arrive as environment variables, from outside the
// workspace, and are never typed, echoed or committed.
const ENV = `AI_BASE_URL=https://YOUR-RESOURCE.openai.azure.com/openai/v1/
AI_API_KEY=****************************
AI_MODEL=gpt-4o`;

const demo = {
  slug: 'mcp-agent',
  surface: 'vscode',
  theme: 'dark',
  workspace: 'mcp-agent',
  viewport: {width: 1600, height: 900},
  // Renders above the delivery resolution and downsamples with lanczos — a supersample.
  deviceScaleFactor: 1.5,
  fps: 30,
  maximizePanel: false,
  prep: {
    files: {
      '.env': '', '.gitignore': '', 'api.py': '', 'traffic.py': '',
      'tools.py': '', 'server.py': '', 'agent.py': '',
    },
    commands: [
      'mkdir -p /tmp/iauteur-bin && cp {{TOOLS}}/uv/uv /tmp/iauteur-bin/',
      'export PATH="/tmp/iauteur-bin:$PATH" UV_NO_MODIFY_PATH=1',
      "printf '[user]\\n\\tname = dev\\n\\temail = dev@example.com\\n' > /tmp/iauteur-gitconfig",
      'export GIT_CONFIG_GLOBAL=/tmp/iauteur-gitconfig',
      'export AI_API_KEY="$(cat /tmp/iauteur-secret/key)"',
      'export AI_BASE_URL="$(cat /tmp/iauteur-secret/base)"',
      'export AI_MODEL=gpt-4o',
      // Idempotent: a second take must start from the same empty folder as the first.
      'rm -rf .venv src uv.lock pyproject.toml README.md .python-version main.py .git service.log server.log',
    ],
  },
  steps: [
    // ── the empty folder ───────────────────────────────────────────────────────
    {id: 'look', action: 'run', cmd: 'ls', label: 'nothing but empty files', focus: 'terminal',
     clearFirst: true, expect: {exitCode: 0},
     marks: [{id: 'files', text: 'api.py'}]},
    {id: 'init', action: 'run', cmd: 'uv init --app', label: 'one command makes the project',
     focus: 'terminal', expect: {contains: 'Initialized project', exitCode: 0},
     marks: [{id: 'made', text: 'Initialized project'}]},
    // `uv add` resolves ~40 packages and the interesting lines scroll off the top, so the
    // first take failed on both the read-back AND the marks: `+ mcp` was in the buffer but
    // not in the WINDOW, and a mark can only point at something on screen. So the install
    // runs unmarked, and a short `uv pip list` right after gives six stable, visible rows.
    {id: 'add', action: 'run',
     cmd: 'uv add "mcp[cli]" fastapi "uvicorn[standard]" httpx openai python-dotenv',
     label: 'the SDK, the web framework, and the client', focus: 'terminal', clearFirst: true,
     timeout: 240000, expect: {exitCode: 0}},
    // `cat pyproject.toml` printed the whole file, so the dependency block scrolled off the
    // top and the only thing left on screen was the tail — while the mark for `mcp[cli]`
    // still resolved against the clipped row and drew a box on the PROMPT. Print just the
    // block: every library the narration names is then visible and markable, and the
    // authors stanza (a real name and email on a real machine) never reaches the frame.
    {id: 'added', action: 'run', cmd: 'sed -n 10,17p pyproject.toml',
     label: 'the six, written into the project', focus: 'terminal', clearFirst: true,
     expect: {contains: 'mcp[cli]', exitCode: 0},
     marks: [{id: 'deps', text: 'mcp[cli]'},
             {id: 'web', text: 'fastapi'},
             {id: 'serve', text: 'uvicorn[standard]'},
             {id: 'envlib', text: 'python-dotenv'}]},

    // ── api.py, and the log it writes ──────────────────────────────────────────
    {id: 'openapi', action: 'openFile', path: 'api.py', label: 'an empty file'},
    {id: 'openapiSettle', action: 'pause', ms: 1200, label: 'an empty file'},
    {id: 'api1', action: 'type', text: API_1, label: 'the app, and three orders',
     marks: [{id: 'app', text: 'app = FastAPI()'}, {id: 'orders', text: '"SO-1003"'}]},
    {id: 'api2', action: 'type', text: API_2, label: 'a middleware that writes the log',
     marks: [{id: 'mw', text: '@app.middleware("http")'}, {id: 'write', text: 'log.write'}]},
    {id: 'api3', action: 'type', text: API_3, label: 'three routes, one of them flaky',
     marks: [{id: 'checkout', text: '@app.post("/checkout")'},
             {id: 'flaky', text: 'random.random() < 0.55'}]},
    {id: 'saveapi', action: 'save', label: 'saved'},

    // ── run it, and make it write its own log ──────────────────────────────────
    // ONE TERMINAL, NOT A SPLIT. `prep` runs its exports in the FIRST integrated terminal,
    // and a split is a NEW shell — so a second pane would not have AI_API_KEY and the agent
    // would read the masked value out of .env and fail. Backgrounding with `&` keeps the
    // server alive in the shell that has the environment, and `tail` shows it is up. The
    // requests from traffic.py land in the same file, which is better footage anyway.
    {id: 'serve', action: 'run', cmd: 'uv run uvicorn api:app --port 8000 > server.log 2>&1 &',
     label: 'start it in the background', focus: 'terminal', clearFirst: true,
     expect: {exitCode: 0}},
    {id: 'serveup', action: 'run', cmd: 'sleep 6 && tail -3 server.log',
     label: 'the service is up', focus: 'terminal', timeout: 60000,
     expect: {contains: 'Application startup complete', exitCode: 0},
     marks: [{id: 'up', text: 'Application startup complete'}]},
    {id: 'opentraffic', action: 'openFile', path: 'traffic.py', label: 'something to call it with'},
    {id: 'opentrafficSettle', action: 'pause', ms: 1200, label: 'an empty file'},
    {id: 'traffic1', action: 'type', text: TRAFFIC, label: 'sixty requests',
     marks: [{id: 'loop', text: 'for _ in range(60)'}, {id: 'post', text: '/checkout'}]},
    {id: 'savetraffic', action: 'save', label: 'saved'},
    {id: 'runtraffic', action: 'run', cmd: 'uv run python traffic.py', label: 'making real traffic',
     focus: 'terminal', timeout: 240000, expect: {contains: 'done', exitCode: 0},
     marks: [{id: 'done', text: 'done'}]},
    {id: 'seelog', action: 'run', cmd: 'tail -6 service.log',
     label: 'the log the app just wrote', focus: 'terminal', clearFirst: true,
     expect: {contains: 'ms', exitCode: 0},
     marks: [{id: 'line', text: '/checkout'}]},

    // ── three plain functions ──────────────────────────────────────────────────
    {id: 'opentools', action: 'openFile', path: 'tools.py', label: 'plain Python, no AI yet'},
    {id: 'opentoolsSettle', action: 'pause', ms: 1200, label: 'an empty file'},
    {id: 't1', action: 'type', text: TOOLS_1, label: 'count the errors',
     marks: [{id: 'split5', text: 'line.split()'}, {id: 'counter', text: 'hits[route] += 1'}]},
    {id: 't2', action: 'type', text: TOOLS_2, label: 'average the response times',
     marks: [{id: 'avg', text: 'sum(v) // len(v)'}]},
    {id: 't3', action: 'type', text: TOOLS_3, label: 'and one that calls the API',
     marks: [{id: 'httpx', text: 'httpx.get'}]},
    {id: 'savetools', action: 'save', label: 'saved'},
    {id: 'runtools', action: 'run',
     cmd: 'uv run python -c "import tools; print(tools.recent_errors()); print(tools.slowest_routes())"',
     label: 'they already work', focus: 'terminal', clearFirst: true,
     expect: {contains: 'checkout', exitCode: 0},
     marks: [{id: 'failed', text: 'failed'}, {id: 'slow', text: 'on average'}]},

    // ── the same functions, as MCP tools ───────────────────────────────────────
    {id: 'openserver', action: 'openFile', path: 'server.py', label: 'the MCP server'},
    {id: 'openserverSettle', action: 'pause', ms: 1200, label: 'an empty file'},
    {id: 's1', action: 'type', text: SERVER_1, label: 'one import, one decorator',
     marks: [{id: 'imp', text: 'from mcp.server.mcpserver import MCPServer'},
             {id: 'dec', text: '@mcp.tool()'},
             {id: 'doc', text: 'Count the errors in the service log'}]},
    {id: 's2', action: 'type', text: SERVER_2, label: 'the other two',
     marks: [{id: 'arg', text: 'def get_order(order_id: str) -> str:'}]},
    {id: 's3', action: 'type', text: SERVER_3, label: 'a resource, and run it',
     marks: [{id: 'res', text: '@mcp.resource("log://today")'},
             {id: 'run', text: 'mcp.run()'}]},
    {id: 'saveserver', action: 'save', label: 'saved'},

    // ── the settings file ──────────────────────────────────────────────────────
    {id: 'openenv', action: 'openFile', path: '.env', label: 'the three settings'},
    {id: 'openenvSettle', action: 'pause', ms: 1200, label: 'an empty file'},
    {id: 'typeenv', action: 'type', text: ENV, label: 'masked, and never in the code',
     marks: [{id: 'url', text: 'AI_BASE_URL'}, {id: 'masked', text: 'AI_API_KEY'},
             {id: 'model', text: 'AI_MODEL'}]},
    {id: 'saveenv', action: 'save', label: 'saved'},
    {id: 'openignore', action: 'openFile', path: '.gitignore', label: 'and git never sees it'},
    {id: 'openignoreSettle', action: 'pause', ms: 1200, label: 'an empty file'},
    {id: 'typeignore', action: 'type', text: '.env\n', label: 'one line',
     marks: [{id: 'ignored', text: '.env'}]},
    {id: 'saveignore', action: 'save', label: 'saved'},

    // ── the agent ──────────────────────────────────────────────────────────────
    {id: 'openagent', action: 'openFile', path: 'agent.py', label: 'the last file'},
    {id: 'openagentSettle', action: 'pause', ms: 1200, label: 'an empty file'},
    {id: 'ag1', action: 'type', text: AGENT_1, label: 'the imports',
     marks: [{id: 'imports', text: 'from mcp import ClientSession, StdioServerParameters'}]},
    {id: 'ag1b', action: 'type', text: AGENT_1B, label: 'start the server, connect to it',
     marks: [{id: 'params', text: 'StdioServerParameters'},
             {id: 'init', text: 'await session.initialize()'}]},
    {id: 'ag2', action: 'type', text: AGENT_2, label: 'ask what tools exist',
     marks: [{id: 'list', text: 'await session.list_tools()'},
             {id: 'schema', text: 'tool.input_schema'}]},
    {id: 'ag3', action: 'type', text: AGENT_3, label: 'hand the menu to the model',
     marks: [{id: 'tools', text: 'tools=menu'}]},
    {id: 'ag4', action: 'type', text: AGENT_4, label: 'run whatever it picked',
     marks: [{id: 'call', text: 'await session.call_tool'},
             {id: 'role', text: '"role": "tool"'}]},
    {id: 'ag5', action: 'type', text: AGENT_5, label: 'and let it answer',
     marks: [{id: 'final', text: 'final.choices[0].message.content'}]},
    {id: 'saveagent', action: 'save', label: 'saved'},

    // ── the payoff ─────────────────────────────────────────────────────────────
    {id: 'runagent', action: 'run',
     cmd: 'uv run python agent.py "our checkout is misbehaving - what does the log say? Two sentences."',
     label: 'asking in plain English', focus: 'terminal', clearFirst: true,
     timeout: 300000, expect: {contains: 'it chose', exitCode: 0},
     marks: [{id: 'sees', text: 'the model can see'}, {id: 'chose', text: 'it chose'}]},
  ],
};

fs.writeFileSync('demos/mcp-agent.json', JSON.stringify(demo, null, 2) + '\n');
const typed = demo.steps.filter((s) => s.action === 'type').length;
console.log(`wrote demos/mcp-agent.json — ${demo.steps.length} steps, ${typed} typing blocks`);
