#!/usr/bin/env node
// GEN — demos/analyst-data.json + demos/analyst-fixed.json
//
// The footage for episode 3. Both demos share ONE workspace ("analyst"), so the two
// takes look like one continuous session; the only difference is `_outliers`.
//
// WHY TWO DEMOS AND NOT ONE WITH A TYPED FIX. The recorder's `type` action appends at
// the caret and has no line-replace, so "edit this one line" would have to be faked with
// key chords or left as a stray duplicate line on screen. The change itself is a DIFF and
// CODE_DIFF is the component built to draw one — so the footage carries the two things a
// component cannot fake (a real red run and a real green run) and the edit between them is
// drawn. Nothing here is staged: both runs are the same file with the one line the repo's
// own history changed.
//
// SOURCE. `src/analyst/` and `samples/orders.csv` are copied verbatim from
// ai-analyst-tutorial/. `_outliers` is rewound to the version that shipped the bug
// recorded in docs/04-TEST-EVIDENCE.md §4.2 — sorted by VALUE rather than by distance
// from the median: `sorted(odd)` rather than `sorted(odd, key=...)`. The `[:5]` slice that
// shows only five of them lives in profile() and never moved.
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'ai-analyst-tutorial';
// The tutorial repo was written on Windows, so every source file is CRLF. VS Code renders
// that fine and the recorder reads it back fine — but the read-back comparison and every
// `marks` lookup then carries a stray \r, so normalise once, here, at the copy.
const lf = (s) => s.replace(/\r\n/g, '\n');
const read = (rel) => lf(fs.readFileSync(path.join(SRC, rel), 'utf8'));
const real = read('src/analyst/data.py');

const FIXED = 'return sorted(odd, key=lambda n: -abs(n - middle))';
const BUGGY = 'return sorted(odd)';
if (!real.includes(FIXED)) throw new Error('data.py no longer contains the fixed return line');
// REWIND THE COMMENT TOO. The docstring's last two sentences are the lesson the bug
// taught; leaving them above the buggy line would put the answer on screen in the beat
// that asks the question, and would be a continuity error a viewer can read.
const buggy = real
  .replace(FIXED, BUGGY)
  .replace('    middle = statistics.median(ordered)\n', '')
  .replace(`
    Returned worst-first. Sorting these by value instead would have quietly
    hidden the biggest spike behind four mild ones.
`, '');

// ── the two files the demo adds to the package ───────────────────────────────
const PROFILE_SHOW = `"""Print the profile the way a person reads it."""

import sys
from pathlib import Path

sys.path.insert(0, "src")
from analyst.data import profile

p = profile(Path("samples/orders.csv"))
cols = p["columns"]
print(f'orders.csv  ->  {p["row_count"]} rows, {len(cols)} columns')

for name in ("delivery_days", "courier", "status"):
    info = cols[name]
    print()
    print(f'{name:<16}{info["kind"]}')
    if info["kind"] == "number":
        for key in ("missing", "distinct", "min", "max", "mean", "stdev"):
            print(f'  {key:<10} {info[key]}')
    else:
        for value, count in info["top"]:
            print(f'  {value:<18} {count}')
`;

const CHECK = `"""The one check that caught the bug: does the tool name the worst delay?"""

import sys
from pathlib import Path

sys.path.insert(0, "src")
from analyst.data import profile

results = []


def check(name, ok, detail=""):
    results.append(ok)
    print(f'    [{"PASS" if ok else "FAIL"}] {name}' + (f" - {detail}" if detail else ""))


print("4. DATA: profile is computed in Python, not guessed")
p = profile(Path("samples/orders.csv"))
days = p["columns"]["delivery_days"]

check("row count is exact", p["row_count"] == 50, str(p["row_count"]))
check("delivery_days is numeric despite the blanks", days["kind"] == "number")
check("found the 2 undelivered orders", days["missing"] == 2, str(days["missing"]))
check("flagged the slow deliveries as outliers",
      days.get("outliers", 0) > 0, f'outliers={days.get("outliers")}')
check("named the worst delay, 19.4 days",
      19.4 in days.get("outlier_values", []), str(days.get("outlier_values")))

passed = sum(results)
print(f"  {passed} passed, {len(results) - passed} failed")
sys.exit(0 if passed == len(results) else 1)
`;

const groundTruth = read('probes/ground_truth.py');

const pkg = (dataPy) => ({
  'src/analyst/__init__.py': read('src/analyst/__init__.py'),
  'src/analyst/config.py': read('src/analyst/config.py'),
  'src/analyst/core.py': read('src/analyst/core.py'),
  'src/analyst/data.py': dataPy,
  'profile_show.py': PROFILE_SHOW,
  'check.py': CHECK,
  'ground_truth.py': groundTruth.replace('parents[1]', 'parents[0]'),
});

// A venv built once, from the pinned uv in tools/. Everything on camera is then a plain
// `python x.py`, which is what the viewer will type on their own machine.
const PREP_COMMANDS = [
  'mkdir -p /tmp/iauteur-bin && cp {{TOOLS}}/uv/uv /tmp/iauteur-bin/',
  'export PATH="/tmp/iauteur-bin:$PATH" UV_NO_MODIFY_PATH=1',
  'test -d .venv || uv venv --python 3.13 >/dev/null 2>&1',
  'uv pip install --quiet openai python-dotenv >/dev/null 2>&1',
  'export PATH="$PWD/.venv/bin:$PATH"',
];

const base = (dataPy) => ({
  surface: 'vscode',
  theme: 'dark',
  workspace: 'analyst',
  viewport: {width: 1600, height: 900},
  fps: 30,
  maximizePanel: true,
  prep: {
    files: pkg(dataPy),
    copy: {'samples/orders.csv': `${SRC}/samples/orders.csv`},
    commands: PREP_COMMANDS,
  },
});

// The line number is DERIVED, never typed. A hand-written number drifts the moment the
// file above it changes, and Go to Line would then reveal the wrong line, confidently.
const buggyLine = buggy.split('\n').findIndex((l) => l.trim() === BUGGY) + 1;
if (buggyLine <= 0) throw new Error('could not locate the rewound return line');

const red = {
  slug: 'analyst-data',
  ...base(buggy),
  steps: [
    {
      id: 'rows', action: 'run', cmd: 'head -4 samples/orders.csv',
      label: 'the first rows of the order file', focus: 'terminal', clearFirst: true,
      expect: {contains: 'SO-1001', exitCode: 0},
      marks: [{id: 'header', text: 'order_id,date,region'}, {id: 'first', text: 'SO-1001'}],
    },
    {
      id: 'profile', action: 'run', cmd: 'python profile_show.py',
      label: 'fifty rows described without a model', focus: 'terminal', clearFirst: true,
      expect: {contains: '19.4', exitCode: 0},
      marks: [{id: 'max', text: '19.4'}, {id: 'mean', text: '5.2592'},
              {id: 'courier', text: 'FarReach'}, {id: 'status', text: 'lost_in_transit'}],
    },
    {
      id: 'redtest', action: 'run', cmd: 'python check.py',
      label: 'the check that went red', focus: 'terminal', clearFirst: true,
      expect: {contains: '[FAIL] named the worst delay'},
      marks: [{id: 'fail', text: '[FAIL] named the worst delay, 19.4 days'},
              {id: 'mild', text: '[5.48, 5.5, 5.52, 5.54, 5.55]'}],
    },
  ],
};

const green = {
  slug: 'analyst-fixed',
  ...base(real),
  steps: [
    {
      id: 'greentest', action: 'run', cmd: 'python check.py',
      label: 'the same check, after the one-line change', focus: 'terminal', clearFirst: true,
      expect: {contains: '[PASS] named the worst delay', exitCode: 0},
      marks: [{id: 'pass', text: '[PASS] named the worst delay, 19.4 days'},
              {id: 'worst', text: '[19.4, 19.1, 18.9, 5.61, 5.57]'}],
    },
    {
      id: 'truth', action: 'run', cmd: 'python ground_truth.py',
      label: 'counting the lost parcels per courier', focus: 'terminal', clearFirst: true,
      expect: {contains: 'FarReach   0 lost of 10 orders', exitCode: 0},
      marks: [{id: 'farreach', text: 'FarReach   0 lost of 10'},
              {id: 'rapidpost', text: 'RapidPost  2 lost of 20'},
              {id: 'north', text: 'SO-1042'}],
    },
  ],
};

// A THIRD DEMO, FOR THE EDITOR BEATS ONLY.
//
// `maximizePanel: true` gives the terminal the whole window, which is exactly right for the
// four terminal beats and leaves the editor a sliver. `openFile` still passed — it checks the
// active TAB — and then `reveal` could not scroll to a line that had nowhere to be visible.
// Toggling the panel back mid-take did not restore enough height either. So the editor beats
// get their own take, with the default layout, in the SAME workspace and the same buggy file:
// the cut reads as one session because it is one session.
const code = {
  slug: 'analyst-code',
  ...base(buggy),
  maximizePanel: false,   // overrides base() — this take is about the editor
  steps: [
    {
      id: 'open', action: 'openFile', path: 'src/analyst/data.py',
      label: 'the function the check is about', focus: 'editor',
    },
    {
      // BOTH `line` AND `text`. `reveal` searches only the RENDERED rows, and Monaco
      // virtualises: the return line sits ~90 lines down, so it is not in the DOM until
      // something scrolls to it. `line` drives Go to Line/Column (which does the scroll);
      // `text` is then the proof that the scroll actually landed on it.
      id: 'line', action: 'reveal', target: 'editor', line: buggyLine,
      text: 'return sorted(odd)',
      label: 'the line that sorted them the wrong way', focus: 'editor',
    },
  ],
};

for (const d of [red, green, code]) {
  fs.writeFileSync(`demos/${d.slug}.json`, JSON.stringify(d, null, 2) + '\n');
  console.log(`wrote demos/${d.slug}.json — ${d.steps.length} step(s)`);
}
