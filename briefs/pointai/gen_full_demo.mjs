#!/usr/bin/env node
// GEN — demos/azure-full.json
//
// THE COMPLETE SESSION, TYPED, ON AZURE OPENAI. No skips.
//
// Owner: *"I really want you not to take any shortcuts... using ollama instead of openai.
// Not recording complete VS code typing and explanation too many skips."*
//
// Both were mine. I swapped the provider to Ollama because it kept a key off screen, which
// solved MY problem rather than his — he told me the live demo runs on the Azure deployment
// he has configured. And I recorded thirty-two steps of real typing and then cast a drawn
// component instead, because the drawn one was easier to synchronise.
//
// So: every file in the project is created and typed here, in blocks small enough that one
// block is one thing to explain, against the Azure gpt-4o deployment. Nothing is written to
// disk except four EMPTY files and the CSV a viewer would already have.
//
// ── HOW THE KEY STAYS OFF SCREEN WITHOUT FAKING THE RUN ──────────────────────────────────
// Owner: *"show it in the video, but blur it while putting in the video."*
//
// The .env is typed in full on camera with the secret MASKED AT SOURCE — asterisks, plus a
// placeholder resource name, because the real endpoint host names his employer's Azure
// resource and that should not go on YouTube either. The real values are exported into the
// shell by prep, read from a file OUTSIDE the workspace so the key is never typed, never
// echoed and never in the scrollback; prep output is cleared before the camera rolls.
// `load_dotenv()` does not override an existing environment variable, so the exported real
// values win and the run is genuine. What the viewer is taught — put it in .env — is exactly
// right for them; only the recording masks it. Nothing about the output is staged.
import fs from 'node:fs';

const SRC = 'ai-analyst-tutorial';
const CSV = `${SRC}/samples/orders.csv`;
if (!fs.existsSync(CSV)) throw new Error(`missing sample data: ${CSV}`);
if (!fs.existsSync('/tmp/iauteur-secret/key') || !fs.existsSync('/tmp/iauteur-secret/base')) {
  throw new Error('stage the endpoint and key first in /tmp/iauteur-secret/ — never committed, never typed, never in a repo path');
}

// ── what gets TYPED on camera ────────────────────────────────────────────────
const ENV = `AI_BASE_URL=https://YOUR-RESOURCE.openai.azure.com/openai/v1/
AI_API_KEY=****************************
AI_MODEL=gpt-4o`;

const IGNORE = `
# never commit your key
.env`;

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
    line = ", ".join(f"{k} {n}" for k, n in top)
    print(f"{name:<16} {line}")`;

// The correction, inserted live in front of the line that ranks the values. The line number
// is DERIVED — a number typed into a demo drifts the moment the code above it changes.
const FULL = [D1, D2, D3, D4, D5].join('\n');
const FIX_BEFORE = '    top = sorted(counts.items(), key=lambda kv: -kv[1])[:3]';
const fixLine = FULL.split('\n').findIndex((l) => l === FIX_BEFORE) + 1;
if (fixLine <= 0) throw new Error('could not locate the line the correction goes in front of');
const FIX = `    if len(counts) == len(values):
        continue
`;

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
        {"role": "user", "content": facts + "\\n\\nWhat stands out? Two sentences."},
    ],
)

print(answer.choices[0].message.content)`;

const demo = {
  slug: 'azure-full',
  surface: 'vscode',
  theme: 'dark',
  workspace: 'azure-full',
  viewport: {width: 1600, height: 900},
  // Renders ABOVE the delivery resolution and is downscaled with lanczos — a supersample.
  // The old captures were UPSCALED from 1600, which is what read as a soft, cheap window.
  deviceScaleFactor: 1.5,
  fps: 30,
  prep: {
    files: {'.env': '', '.gitignore': '', 'ask.py': '', 'describe.py': '', 'analyse.py': ''},
    copy: {'orders.csv': CSV},
    commands: [
      'mkdir -p /tmp/iauteur-bin && cp {{TOOLS}}/uv/uv /tmp/iauteur-bin/',
      'export PATH="/tmp/iauteur-bin:$PATH" UV_NO_MODIFY_PATH=1',
      "printf '[user]\\n\\tname = dev\\n\\temail = dev@example.com\\n' > /tmp/iauteur-gitconfig",
      'export GIT_CONFIG_GLOBAL=/tmp/iauteur-gitconfig',
      // THE REAL VALUES, READ FROM A FILE, NEVER TYPED. `$(cat …)` keeps the secret out of
      // the command line, out of the terminal buffer and out of this repository. prep output
      // is cleared before the take starts, and load_dotenv() will not override these.
      'export AI_API_KEY="$(cat /tmp/iauteur-secret/key)"',
      'export AI_BASE_URL="$(cat /tmp/iauteur-secret/base)"',
      'export AI_MODEL=gpt-4o',
      // .gitignore is removed too: the take types `.env` into it, and VS Code's Quick Open
      // honours .gitignore — so on a second run the file it is about to open is invisible.
      'rm -rf .venv src uv.lock pyproject.toml README.md .python-version main.py .git',
    ],
  },
  steps: [
    // ══ the folder you start from ════════════════════════════════════════════
    {id: 'look', action: 'run', cmd: 'ls', label: 'the folder you start from', focus: 'terminal',
     clearFirst: true, expect: {contains: 'orders.csv', exitCode: 0},
     marks: [{id: 'csv', text: 'orders.csv'}]},
    {id: 'peek', action: 'run', cmd: 'head -3 orders.csv', label: 'the data itself',
     focus: 'terminal', expect: {contains: 'SO-1001', exitCode: 0},
     marks: [{id: 'header', text: 'order_id,date,region'}, {id: 'row1', text: 'SO-1001'}]},

    // ══ the project ══════════════════════════════════════════════════════════
    {id: 'init', action: 'run', cmd: 'uv init --app', label: 'one command makes the project',
     focus: 'terminal', clearFirst: true, expect: {contains: 'Initialized project', exitCode: 0},
     marks: [{id: 'made', text: 'Initialized project'}]},
    {id: 'tree', action: 'run', cmd: 'ls -a', label: 'what uv wrote for you', focus: 'terminal',
     expect: {contains: 'pyproject.toml', exitCode: 0},
     marks: [{id: 'proj', text: 'pyproject.toml'}, {id: 'pyver', text: '.python-version'}]},
    {id: 'add', action: 'run', cmd: 'uv add openai python-dotenv',
     label: 'one library, every provider', focus: 'terminal', clearFirst: true,
     expect: {contains: 'openai', exitCode: 0}, marks: [{id: 'lib', text: '+ openai'}]},

    // ══ the key, typed, masked ═══════════════════════════════════════════════
    {id: 'openenv', action: 'openFile', path: '.env', label: 'where settings live',
     focus: 'editor'},
    {id: 'typeenv', action: 'type', at: 'start', focus: 'editor', typeDelay: 36,
     label: 'three lines choose your provider', text: ENV,
     marks: [{id: 'url', text: 'AI_BASE_URL=https://YOUR-RESOURCE'},
             {id: 'masked', text: 'AI_API_KEY=****'},
             {id: 'model', text: 'AI_MODEL=gpt-4o'}]},
    {id: 'saveenv', action: 'save', label: 'save it'},
    {id: 'openignore', action: 'openFile', path: '.gitignore',
     label: 'what git must never take', focus: 'editor'},
    {id: 'typeignore', action: 'type', at: 'end', focus: 'editor', typeDelay: 46,
     label: 'one line keeps the key yours', text: IGNORE,
     marks: [{id: 'ignored', text: '.env'}]},
    {id: 'saveignore', action: 'save', label: 'save'},

    // ══ the first call ═══════════════════════════════════════════════════════
    {id: 'openask', action: 'openFile', path: 'ask.py', label: 'an empty file', focus: 'editor'},
    {id: 'client', action: 'type', at: 'start', focus: 'editor', typeDelay: 33,
     label: 'imports, and the client', text: ASK_A,
     marks: [{id: 'import', text: 'from openai import OpenAI'},
             {id: 'baseurl', text: 'base_url=os.getenv'},
             {id: 'apikey', text: 'api_key=os.getenv'}]},
    {id: 'thecall', action: 'type', at: 'end', focus: 'editor', typeDelay: 31,
     label: 'the one call that does every job', text: ASK_B,
     marks: [{id: 'create', text: 'client.chat.completions.create'},
             {id: 'messages', text: 'messages=['},
             {id: 'role', text: '"role": "user"'},
             {id: 'content', text: 'answer.choices[0].message.content'},
             {id: 'usage', text: 'print(answer.usage)'}]},
    {id: 'saveask', action: 'save', label: 'save'},
    {id: 'runask', action: 'run', cmd: 'uv run python ask.py', label: 'run it', focus: 'terminal',
     clearFirst: true, timeout: 240000, expect: {contains: 'ready', exitCode: 0},
     marks: [{id: 'answer', text: 'ready'}, {id: 'tokens', text: 'CompletionUsage'}]},

    // ══ describing the file ══════════════════════════════════════════════════
    {id: 'opendesc', action: 'openFile', path: 'describe.py', label: 'a second empty file',
     focus: 'editor'},
    {id: 'd1', action: 'type', at: 'start', focus: 'editor', typeDelay: 33,
     label: 'read the file, count the rows', text: D1,
     marks: [{id: 'reader', text: 'csv.DictReader'}, {id: 'count', text: 'print("rows:"'}]},
    {id: 'd2', action: 'type', at: 'end', focus: 'editor', typeDelay: 33,
     label: 'walk the columns', text: D2,
     marks: [{id: 'loop', text: 'for name in rows[0]:'},
             {id: 'vals', text: 'values = [r[name]'}]},
    {id: 'd3', action: 'type', at: 'end', focus: 'editor', typeDelay: 31,
     label: 'try each value as a number', text: D3,
     marks: [{id: 'try', text: 'numbers.append(float(v))'},
             {id: 'except', text: 'except ValueError:'}]},
    {id: 'd4', action: 'type', at: 'end', focus: 'editor', typeDelay: 31,
     label: 'a number column gets measured', text: D4,
     marks: [{id: 'mean', text: 'statistics.fmean'}, {id: 'minmax', text: 'min {min(numbers)'}]},
    {id: 'd5', action: 'type', at: 'end', focus: 'editor', typeDelay: 31,
     label: 'everything else gets counted', text: D5,
     marks: [{id: 'counts', text: 'counts[v] = counts.get(v, 0) + 1'},
             {id: 'top', text: 'top = sorted(counts.items()'}]},
    {id: 'savedesc', action: 'save', label: 'save'},
    {id: 'rundesc', action: 'run', cmd: 'uv run python describe.py',
     label: 'run it, and read the output', focus: 'terminal', clearFirst: true,
     expect: {contains: 'delivery_days', exitCode: 0},
     marks: [{id: 'noise', text: 'order_id'}, {id: 'days', text: 'delivery_days'},
             {id: 'courier', text: 'courier'}]},

    // ══ the correction, live ═════════════════════════════════════════════════
    {id: 'gotofix', action: 'reveal', target: 'editor', line: fixLine, text: 'top = sorted',
     label: 'back to the line that ranks them', focus: 'editor'},
    {id: 'typefix', action: 'type', focus: 'editor', typeDelay: 42,
     label: 'two lines, typed in', text: FIX,
     marks: [{id: 'guard', text: 'if len(counts) == len(values):'}]},
    {id: 'savefix', action: 'save', label: 'save'},
    {id: 'rerun', action: 'run', cmd: 'uv run python describe.py', label: 'run it again',
     focus: 'terminal', clearFirst: true, expect: {contains: 'delivery_days', exitCode: 0},
     marks: [{id: 'clean', text: 'delivery_days'}, {id: 'region', text: 'region'},
             {id: 'status', text: 'status'}]},

    // ══ facts, not rows ══════════════════════════════════════════════════════
    {id: 'openan', action: 'openFile', path: 'analyse.py', label: 'the last file',
     focus: 'editor'},
    {id: 'a1', action: 'type', at: 'start', focus: 'editor', typeDelay: 33,
     label: 'run the describer, keep the output', text: AN_A,
     marks: [{id: 'sub', text: 'import subprocess'},
             {id: 'capture', text: 'capture_output=True'}]},
    {id: 'a2', action: 'type', at: 'end', focus: 'editor', typeDelay: 31,
     label: 'send the facts, not the rows', text: AN_B,
     marks: [{id: 'system', text: '"role": "system"'},
             {id: 'user', text: '"role": "user"'},
             {id: 'facts', text: 'facts + '}]},
    {id: 'savean', action: 'save', label: 'save'},
    {id: 'runan', action: 'run', cmd: 'uv run python analyse.py',
     label: 'the model reads the description', focus: 'terminal', clearFirst: true,
     timeout: 300000, expect: {exitCode: 0}},
  ],
};

fs.writeFileSync('demos/azure-full.json', JSON.stringify(demo, null, 2) + '\n');
console.log(`wrote demos/azure-full.json — ${demo.steps.length} steps, ` +
  `${demo.steps.filter((s) => s.action === 'type').length} typing blocks, ` +
  `correction at line ${fixLine}`);
