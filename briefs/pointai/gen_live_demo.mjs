#!/usr/bin/env node
// GEN — demos/live-analyst.json
//
// THE WHOLE TUTORIAL, TYPED. Owner: *"every single code needs to be typed and it should be
// an absolute tutorial for beginners. From top to bottom no assumption."* and *"Make sure
// you do live correction and show. Don't say this is wrong that is wrong. You should make
// it work."*
//
// So: nothing is written to disk except two EMPTY files and the data file the viewer would
// already have. Every character of every program appears by being typed, in blocks small
// enough that one block is one thing to explain. The program is then RUN, and where its
// output is not good enough it is CORRECTED ON CAMERA and run again — which is what
// actually happens when a person writes code, and is worth more than any slide saying so.
//
// NO KEY IS EVER ON SCREEN. The demo talks to Ollama on localhost, which needs no key at
// all (`AI_API_KEY=ollama` is required by the library and ignored by the server), so the
// .env can be typed in full, honestly, with nothing masked and nothing faked. The CLOUD
// alternative is typed underneath it as a comment with the key masked at source — which is
// the house rule and is safer than blurring in post, because a mask cannot be un-masked.
import fs from 'node:fs';

const CSV = 'ai-analyst-tutorial/samples/orders.csv';
if (!fs.existsSync(CSV)) throw new Error(`missing sample data: ${CSV}`);

// ── the .env, typed ──────────────────────────────────────────────────────────
const ENV = `AI_BASE_URL=http://localhost:11434/v1
AI_API_KEY=ollama
AI_MODEL=qwen3:4b

# a cloud provider instead — same three lines, different values:
# AI_BASE_URL=https://api.groq.com/openai/v1
# AI_API_KEY=gsk_****************************
# AI_MODEL=llama-3.3-70b-versatile`;

// ── ask.py, typed in two blocks ──────────────────────────────────────────────
const ASK_A = `import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    base_url=os.getenv("AI_BASE_URL"),
    api_key=os.getenv("AI_API_KEY"),
)`;

const ASK_B = `
answer = client.chat.completions.create(
    model=os.getenv("AI_MODEL"),
    messages=[
        {"role": "user", "content": "Reply with exactly the word: ready"},
    ],
)

print(answer.choices[0].message.content)
print(answer.usage)`;

// ── describe.py, typed in four blocks, then corrected ────────────────────────
const D1 = `import csv
import statistics

rows = list(csv.DictReader(open("orders.csv")))
print("rows:", len(rows))
print()`;

const D2 = `
for name in rows[0]:
    values = [r[name] for r in rows if r[name]]`;

const D3 = `    numbers = []
    for v in values:
        try:
            numbers.append(float(v))
        except ValueError:
            pass
`;

const D4 = `    if len(numbers) == len(values):
        print(f"{name:<16} min {min(numbers):<7} max {max(numbers):<7}"
              f" mean {round(statistics.fmean(numbers), 2)}")
        continue
`;

const D5 = `    counts = {}
    for v in values:
        counts[v] = counts.get(v, 0) + 1
    top = sorted(counts.items(), key=lambda kv: -kv[1])[:3]
    print(f"{name:<16} " + ", ".join(f"{k} {n}" for k, n in top))`;

// THE CORRECTION, inserted live in front of the line that ranks the values. Derived, never
// typed by hand: a line number written into a demo drifts the moment the code above it does.
const FULL = [D1, D2, D3, D4, D5].join('\n');
const FIX_BEFORE = '    top = sorted(counts.items(), key=lambda kv: -kv[1])[:3]';
const fixLine = FULL.split('\n').findIndex((l) => l === FIX_BEFORE) + 1;
if (fixLine <= 0) throw new Error('could not locate the line the correction goes in front of');
const FIX = `    if len(counts) == len(values):
        continue
`;

// ── analyse.py, typed in two blocks ──────────────────────────────────────────
const AN_A = `import os
import subprocess
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
facts = subprocess.run(
    ["python", "describe.py"], capture_output=True, text=True
).stdout`;

const AN_B = `
client = OpenAI(
    base_url=os.getenv("AI_BASE_URL"),
    api_key=os.getenv("AI_API_KEY"),
)

answer = client.chat.completions.create(
    model=os.getenv("AI_MODEL"),
    messages=[
        {"role": "system", "content": "You are a data analyst. Use only these facts."},
        {"role": "user", "content": facts + "\\n\\nWhat stands out?"},
    ],
)

print(answer.choices[0].message.content)`;

const demo = {
  slug: 'live-analyst',
  surface: 'vscode',
  theme: 'dark',
  workspace: 'analyst-live',
  viewport: {width: 1600, height: 900},
  fps: 30,
  prep: {
    // TWO EMPTY FILES AND THE DATA. Nothing else is put on disk: `uv init` creates the
    // project on camera, and every character of every program is typed on camera.
    files: {'.env': '', 'ask.py': '', 'describe.py': '', 'analyse.py': ''},
    copy: {'orders.csv': CSV},
    commands: [
      'mkdir -p /tmp/iauteur-bin && cp {{TOOLS}}/uv/uv /tmp/iauteur-bin/',
      'export PATH="/tmp/iauteur-bin:$PATH" UV_NO_MODIFY_PATH=1',
      "printf '[user]\\n\\tname = dev\\n\\temail = dev@example.com\\n' > /tmp/iauteur-gitconfig",
      'export GIT_CONFIG_GLOBAL=/tmp/iauteur-gitconfig',
      // .gitignore IS IN THIS LIST FOR A REASON. The take types `.env` into it, so a
      // second run starts with a .gitignore that already excludes `.env` — and VS Code's
      // Quick Open honours .gitignore, so `openFile .env` finds nothing and the recording
      // dies four steps in. A demo that only works the first time is a demo that cannot be
      // re-recorded, which is the whole point of keeping them in the repo.
      'rm -rf .venv src uv.lock pyproject.toml README.md .python-version main.py .git .gitignore',
    ],
  },
  steps: [
    // ── the folder you start from ──────────────────────────────────────────
    {id: 'look', action: 'run', cmd: 'ls', label: 'what is in the folder', focus: 'terminal',
     clearFirst: true, expect: {contains: 'orders.csv', exitCode: 0},
     marks: [{id: 'csv', text: 'orders.csv'}]},
    {id: 'peek', action: 'run', cmd: 'head -3 orders.csv', label: 'the data, first rows',
     focus: 'terminal', expect: {contains: 'SO-1001', exitCode: 0},
     marks: [{id: 'header', text: 'order_id,date,region'}]},

    // ── the project ────────────────────────────────────────────────────────
    {id: 'init', action: 'run', cmd: 'uv init --app', label: 'one command starts the project',
     focus: 'terminal', clearFirst: true, expect: {contains: 'Initialized project', exitCode: 0},
     marks: [{id: 'made', text: 'Initialized project'}]},
    {id: 'add', action: 'run', cmd: 'uv add openai python-dotenv',
     label: 'the one library every provider speaks', focus: 'terminal',
     expect: {contains: 'openai', exitCode: 0}, marks: [{id: 'lib', text: '+ openai'}]},

    // ── the key, and where it must never go ────────────────────────────────
    {id: 'openenv', action: 'openFile', path: '.env', label: 'the file settings live in',
     focus: 'editor'},
    {id: 'typeenv', action: 'type', at: 'start', focus: 'editor', typeDelay: 34,
     label: 'three lines choose your provider', text: ENV,
     marks: [{id: 'base', text: 'AI_BASE_URL=http://localhost'},
             {id: 'masked', text: 'AI_API_KEY=gsk_'}]},
    {id: 'saveenv', action: 'save', label: 'save it'},
    {id: 'openignore', action: 'openFile', path: '.gitignore',
     label: 'the list of things git must never take', focus: 'editor'},
    {id: 'typeignore', action: 'type', at: 'end', focus: 'editor', typeDelay: 42,
     label: 'one line keeps your key out of git', text: '\n# never commit your key\n.env',
     marks: [{id: 'ignored', text: '.env'}]},
    {id: 'saveignore', action: 'save', label: 'save'},

    // ── the first call ─────────────────────────────────────────────────────
    {id: 'openask', action: 'openFile', path: 'ask.py', label: 'an empty file', focus: 'editor'},
    {id: 'typeclient', action: 'type', at: 'start', focus: 'editor', typeDelay: 32,
     label: 'read the settings, build the client', text: ASK_A,
     marks: [{id: 'import', text: 'from openai import OpenAI'},
             {id: 'baseurl', text: 'base_url=os.getenv'}]},
    {id: 'typecall', action: 'type', at: 'end', focus: 'editor', typeDelay: 30,
     label: 'the one call that does every job here', text: ASK_B,
     marks: [{id: 'create', text: 'client.chat.completions.create'},
             {id: 'messages', text: 'messages=['},
             {id: 'role', text: '"role": "user"'},
             {id: 'content', text: 'answer.choices[0].message.content'}]},
    {id: 'saveask', action: 'save', label: 'save'},
    {id: 'runask', action: 'run', cmd: 'uv run python ask.py', label: 'run it', focus: 'terminal',
     clearFirst: true, timeout: 180000, expect: {contains: 'ready', exitCode: 0},
     marks: [{id: 'answer', text: 'ready'}, {id: 'tokens', text: 'CompletionUsage'}]},

    // ── describing the file in Python ──────────────────────────────────────
    {id: 'opendesc', action: 'openFile', path: 'describe.py', label: 'a second empty file',
     focus: 'editor'},
    {id: 'd1', action: 'type', at: 'start', focus: 'editor', typeDelay: 32,
     label: 'read the file and count the rows', text: D1,
     marks: [{id: 'reader', text: 'csv.DictReader'}]},
    {id: 'd2', action: 'type', at: 'end', focus: 'editor', typeDelay: 32,
     label: 'walk the columns, one at a time', text: D2,
     marks: [{id: 'loop', text: 'for name in rows[0]:'}]},
    {id: 'd3', action: 'type', at: 'end', focus: 'editor', typeDelay: 30,
     label: 'try turning each value into a number', text: D3,
     marks: [{id: 'try', text: 'numbers.append(float(v))'}]},
    {id: 'd4', action: 'type', at: 'end', focus: 'editor', typeDelay: 30,
     label: 'a number column gets min, max and mean', text: D4,
     marks: [{id: 'mean', text: 'statistics.fmean'}]},
    {id: 'd5', action: 'type', at: 'end', focus: 'editor', typeDelay: 30,
     label: 'everything else gets counted instead', text: D5,
     marks: [{id: 'counts', text: 'counts[v] = counts.get(v, 0) + 1'}]},
    {id: 'savedesc', action: 'save', label: 'save'},
    {id: 'rundesc', action: 'run', cmd: 'uv run python describe.py',
     label: 'run it — and read what comes out', focus: 'terminal', clearFirst: true,
     expect: {contains: 'delivery_days', exitCode: 0},
     marks: [{id: 'noise', text: 'order_id'}, {id: 'days', text: 'delivery_days'}]},

    // ── the correction, live ───────────────────────────────────────────────
    {id: 'gotofix', action: 'reveal', target: 'editor', line: fixLine, text: 'top = sorted',
     label: 'back to the line that ranks them', focus: 'editor'},
    {id: 'typefix', action: 'type', focus: 'editor', typeDelay: 40,
     label: 'skip a column where every value is different', text: FIX,
     marks: [{id: 'guard', text: 'if len(counts) == len(values):'}]},
    {id: 'savefix', action: 'save', label: 'save'},
    {id: 'rerun', action: 'run', cmd: 'uv run python describe.py', label: 'run it again',
     focus: 'terminal', clearFirst: true, expect: {contains: 'delivery_days', exitCode: 0},
     marks: [{id: 'clean', text: 'delivery_days'}, {id: 'courier', text: 'courier'}]},

    // ── handing the description to the model ───────────────────────────────
    {id: 'openan', action: 'openFile', path: 'analyse.py', label: 'the last file',
     focus: 'editor'},
    {id: 'a1', action: 'type', at: 'start', focus: 'editor', typeDelay: 32,
     label: 'run the describer and keep what it printed', text: AN_A,
     marks: [{id: 'capture', text: 'capture_output=True'}]},
    {id: 'a2', action: 'type', at: 'end', focus: 'editor', typeDelay: 30,
     label: 'send the facts, not the rows', text: AN_B,
     marks: [{id: 'system', text: '"role": "system"'},
             {id: 'facts', text: 'facts + '}]},
    {id: 'savean', action: 'save', label: 'save'},
    {id: 'runan', action: 'run', cmd: 'uv run python analyse.py',
     label: 'the model reads the description', focus: 'terminal', clearFirst: true,
     timeout: 300000, expect: {exitCode: 0}},
  ],
};

fs.writeFileSync('demos/live-analyst.json', JSON.stringify(demo, null, 2) + '\n');
console.log(`wrote demos/live-analyst.json — ${demo.steps.length} steps, ` +
  `correction goes in at line ${fixLine}`);
