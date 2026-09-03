#!/usr/bin/env node
// GEN — demos/live-setup.json
//
// THE FOOTAGE IS ONLY THE PART A COMPONENT CANNOT FAKE.
//
// The code is TYPED by `LIVE_CODE`, which anchors each line to its own narration word, so
// the keyboard and the mouth land together — a capture cannot do that, because it replays
// at the speed it was captured and then freezes. What a capture CAN do, and a drawing never
// honestly can, is show a real toolchain really installing and a real interpreter really
// printing. So this demo records exactly that and nothing else:
//
//   the folder, the data, uv making a project, the library installing, and three runs.
//
// It is also a third of the size. The 32-step version captured every keystroke at 3200x1800
// and left 2.7 GB of frames behind when it ran out of disk; this one records the eight
// moments that carry evidence.
//
// The files are written by prep because the video never claims to be writing them HERE —
// the writing is the LIVE_CODE beats, and this is the beat where what was written runs.
import fs from 'node:fs';

const SRC = 'ai-analyst-tutorial';
const CSV = `${SRC}/samples/orders.csv`;
if (!fs.existsSync(CSV)) throw new Error(`missing sample data: ${CSV}`);

const ENV = `AI_BASE_URL=http://localhost:11434/v1
AI_API_KEY=ollama
AI_MODEL=qwen3:4b
`;

const ASK = `import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    base_url=os.getenv("AI_BASE_URL"),
    api_key=os.getenv("AI_API_KEY"),
)

answer = client.chat.completions.create(
    model=os.getenv("AI_MODEL"),
    messages=[
        {"role": "user", "content": "Reply with exactly the word: ready"},
    ],
)

print(answer.choices[0].message.content)
print(answer.usage)
`;

const DESCRIBE = `import csv
import statistics

rows = list(csv.DictReader(open("orders.csv")))
print("rows:", len(rows))
print()

for name in rows[0]:
    values = [r[name] for r in rows if r[name]]
    numbers = []
    for v in values:
        try:
            numbers.append(float(v))
        except ValueError:
            pass

    if len(numbers) == len(values):
        print(f"{name:<16} min {min(numbers):<7} max {max(numbers):<7}"
              f" mean {round(statistics.fmean(numbers), 2)}")
        continue

    counts = {}
    for v in values:
        counts[v] = counts.get(v, 0) + 1
    if len(counts) == len(values):
        continue
    top = sorted(counts.items(), key=lambda kv: -kv[1])[:3]
    line = ", ".join(f"{k} {n}" for k, n in top)
    print(f"{name:<16} {line}")
`;

const ANALYSE = `import os
import subprocess
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
facts = subprocess.run(
    ["python", "describe.py"], capture_output=True, text=True
).stdout

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

print(answer.choices[0].message.content)
`;

const demo = {
  slug: 'live-setup',
  surface: 'vscode',
  theme: 'dark',
  workspace: 'setup-live',
  viewport: {width: 1600, height: 900},
  // 1.5, not 2. Two was verifiably sharp and filled the disk; 1.5 still RENDERS above the
  // delivery resolution (2400x1350 downscaled to 1920 with lanczos is a supersample), which
  // is the thing that was wrong before — the old captures were UPSCALED from 1600.
  deviceScaleFactor: 1.5,
  fps: 30,
  maximizePanel: true,
  prep: {
    files: {'.env': ENV, 'ask.py': ASK, 'describe.py': DESCRIBE, 'analyse.py': ANALYSE},
    copy: {'orders.csv': CSV},
    commands: [
      'mkdir -p /tmp/iauteur-bin && cp {{TOOLS}}/uv/uv /tmp/iauteur-bin/',
      'export PATH="/tmp/iauteur-bin:$PATH" UV_NO_MODIFY_PATH=1',
      "printf '[user]\\n\\tname = dev\\n\\temail = dev@example.com\\n' > /tmp/iauteur-gitconfig",
      'export GIT_CONFIG_GLOBAL=/tmp/iauteur-gitconfig',
      'rm -rf .venv src uv.lock pyproject.toml README.md .python-version main.py .git .gitignore',
    ],
  },
  steps: [
    {id: 'look', action: 'run', cmd: 'ls', label: 'the folder you start from', focus: 'terminal',
     clearFirst: true, expect: {contains: 'orders.csv', exitCode: 0},
     marks: [{id: 'csv', text: 'orders.csv'}]},
    {id: 'peek', action: 'run', cmd: 'head -3 orders.csv', label: 'the data itself',
     focus: 'terminal', expect: {contains: 'SO-1001', exitCode: 0},
     marks: [{id: 'header', text: 'order_id,date,region'}, {id: 'row1', text: 'SO-1001'}]},
    {id: 'init', action: 'run', cmd: 'uv init --app', label: 'one command makes the project',
     focus: 'terminal', clearFirst: true, expect: {contains: 'Initialized project', exitCode: 0},
     marks: [{id: 'made', text: 'Initialized project'}]},
    {id: 'tree', action: 'run', cmd: 'ls -a', label: 'what uv wrote for you', focus: 'terminal',
     expect: {contains: 'pyproject.toml', exitCode: 0},
     // NOT `.venv`: `uv init` does not create one — `uv add` does, two steps later — and
     // the runner refused to measure a rectangle for a file that was not on screen, which
     // is exactly the guard doing its job rather than inventing a callout target.
     marks: [{id: 'proj', text: 'pyproject.toml'}, {id: 'pyver', text: '.python-version'}]},
    {id: 'add', action: 'run', cmd: 'uv add openai python-dotenv',
     label: 'the one library every provider speaks', focus: 'terminal', clearFirst: true,
     expect: {contains: 'openai', exitCode: 0}, marks: [{id: 'lib', text: '+ openai'}]},
    {id: 'runask', action: 'run', cmd: 'uv run python ask.py', label: 'the first call, running',
     focus: 'terminal', clearFirst: true, timeout: 240000,
     expect: {contains: 'ready', exitCode: 0},
     marks: [{id: 'answer', text: 'ready'}, {id: 'tokens', text: 'CompletionUsage'}]},
    {id: 'rundesc', action: 'run', cmd: 'uv run python describe.py',
     label: 'fifty rows, described by Python', focus: 'terminal', clearFirst: true,
     expect: {contains: 'delivery_days', exitCode: 0},
     marks: [{id: 'days', text: 'delivery_days'}, {id: 'courier', text: 'courier'},
             {id: 'status', text: 'status'}]},
    {id: 'runan', action: 'run', cmd: 'uv run python analyse.py',
     label: 'the model reads the description', focus: 'terminal', clearFirst: true,
     timeout: 300000, expect: {exitCode: 0}},
  ],
};

fs.writeFileSync('demos/live-setup.json', JSON.stringify(demo, null, 2) + '\n');
console.log(`wrote demos/live-setup.json — ${demo.steps.length} steps at dsf ${demo.deviceScaleFactor}`);
