#!/usr/bin/env node
// BUILD — topics/allure-ai-01-first-report/long.json
//
// ALLURE AI, CHAPTER 1 — a real test report, built from an empty folder, in Python only.
//
// Everything spoken here was measured on THIS machine before a word was written:
// uv 0.12.9, Python 3.12.2, behave 1.3.3, allure-behave 2.16.0, playwright 1.62.0,
// requests 2.34.2. The run gives `7 scenarios passed, 1 failed, 1 error, 1 skipped`,
// 10 result files and 13 attachments, and the report prints
// `7 passed, 1 failed, 1 broken, 1 skipped, 10 total`. The chapter doc quotes a different
// machine (Python 3.14.6, playwright 1.61.0, 3 html attachments) — those numbers are NOT
// used anywhere in this script.
import fs from 'node:fs';

const CH = 'THE NBX STUDIO';
const SLUG = 'allure-ai-01-first-report';

const normw = (w) => String(w).toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (narration, word, nth = 1) => {
  const ws = narration.split(/\s+/).map(normw);
  const want = normw(word);
  let seen = 0;
  for (let i = 0; i < ws.length; i++) if (ws[i] === want && ++seen === nth) return i + 1;
  throw new Error(`anchor ${JSON.stringify(word)} (#${nth}) not found in: ${narration.slice(0, 100)}…`);
};

const TRANS = ['fade', 'push', 'slide', 'zoom', 'wipe', 'dip', 'morph', 'iris'];
const BG = ['zoneA', 'zoneB', 'zoneC'];
let i = 0;
const scenes = [];
const scene = (type, narration, data, extra = {}) => {
  const s = {id: `s${String(i + 1).padStart(2, '0')}`, type, narration,
             transition: TRANS[i % TRANS.length], background: BG[i % BG.length], data, ...extra};
  i++;
  return s;
};
const chapter = (narration, number, title, subtitle) =>
  scene('CHAPTER', narration, {chapter: {number: String(number).padStart(2, '0'), title, subtitle}});
const rec = (narration, caption, premise, clips, extra = {}) =>
  scene('RECORDED_STEP', narration, {
    recordedStep: {caption, premise, layout: 'full', color: 'blue', clips, ...extra},
  });
// `atWord` is anchor-spec's OUTPUT; the word THIS script picked is the author's INTENT, so
// it travels as `wantAtWord` and the solver can never read its own previous answer back.
const intent = (o = {}) => {
  const move = (e) => (e && e.atWord != null ? {...e, wantAtWord: e.atWord, atWord: undefined} : e);
  const out = {...o};
  if (o.callouts) out.callouts = o.callouts.map(move);
  if (o.zooms) out.zooms = o.zooms.map(move);
  return out;
};
const A = (id, label, opts = {}) => ({ref: `rec:allure-01#${id}`, label, focus: true, ...intent(opts)});
const stage = (narration, kind, data) => scene('ALLURE_STAGE', narration, {allureStage: {kind, ...data}});

// ── DRAWN BEATS ──────────────────────────────────────────────────────────────
// One picture per idea, sitting beside the typing it explains. These are not
// decoration: the over-reliance cap exists because a wall of screen recording
// teaches worse than footage with a drawing between every block, and every one
// of these earns its place by explaining something the code alone cannot show.
const diagram = (n, d) => scene('DIAGRAM', n, {diagram: {layout: 'tree', ...d}});
const list    = (n, heading, items) => scene('LIST_BUILD', n, {heading, items});
const compare = (n, d) => scene('SPEC_COMPARE', n, {compare: d});
const layers  = (n, d) => scene('LAYERED_STACK', n, {stack: {signal: 'down', ...d}});
const tree    = (n, d) => scene('FILE_TREE', n, {fileTree: d});
const table   = (n, d) => scene('DATABASE_TABLE', n, {database: d});
const api     = (n, d) => scene('API_REQUEST_RESPONSE', n, {api: d});
const logs    = (n, d) => scene('LOG_STREAM', n, {logs: d});

// ═══ OPENING ═════════════════════════════════════════════════════════════════
{
  const n = "An empty folder, and a test report you can click through. " +
            "Allure, in Python — no Java anywhere.";
  scenes.push(scene('HOOK', n, {
    headline: 'A REAL ALLURE REPORT',
    subtext: 'pure Python, from an empty folder',
    hookVariant: 'statement',
    headlineAtWord: at(n, 'Allure'),
  }));
}

{
  const n =
    `Welcome to ${CH}. Today we're building an Allure test report in Python, ` +
    "starting from a folder with nothing in it. " +
    "Allure is a way of writing down test results so a person actually wants to read them — " +
    "steps in plain English, with the evidence attached to each one. " +
    "Almost every guide you'll find says you need Java for this part. " +
    "We're not going to use any.";
  scenes.push(scene('TITLE_CARD', n, {
    title: 'A real Allure report, in pure Python',
    subtitle: 'ten checks, four outcomes, nine kinds of evidence',
  }));
}

{
  const n =
    "Before we write a line, here's the idea the whole chapter rests on. " +
    "Most people think a test either passes or fails. " +
    "Allure tracks four outcomes, and the difference between them is genuinely useful. " +
    "Passed means the check ran and got what it expected. " +
    "Failed means the check ran and got something else — your software misbehaved. " +
    "Broken means the test itself fell over before it could check anything — " +
    "that's a bug in your test, not in your software. " +
    "And skipped means it never ran at all, on purpose. " +
    "We're going to write ten checks today that land in all four of those trays, " +
    "because you cannot understand a report that only ever shows you two.";
  scenes.push(stage(n, 'outcome-bins', {
    headline: 'Four outcomes, [not two]',
    caption: 'what a result can be',
    premise: 'Every scenario in a run lands in exactly one of these four trays. The count under each tray is what actually dropped into it.',
    color: 'blue',
    atWord: 1,
    cells: [
      {label: 'Homepage responds', text: 'passed', atWord: at(n, 'Passed')},
      {label: 'Mentions Python', text: 'passed', atWord: at(n, 'ran')},
      {label: 'Screenshot captured', text: 'passed', atWord: at(n, 'expected')},
      {label: 'Response time', text: 'passed', atWord: at(n, 'Failed')},
      {label: 'JPEG screenshot', text: 'passed', atWord: at(n, 'else')},
      {label: 'Zipped evidence', text: 'passed', atWord: at(n, 'misbehaved')},
      {label: 'Three summaries', text: 'passed', atWord: at(n, 'Broken')},
      {label: 'Written to fail', text: 'failed', atWord: at(n, 'fell')},
      {label: 'Unexpected error', text: 'broken', atWord: at(n, 'bug')},
      {label: 'Skipped on purpose', text: 'skipped', atWord: at(n, 'skipped')},
    ],
  }));
}

// ═══ CHAPTER 1 — the folder and the four libraries ═══════════════════════════
scenes.push(chapter(
  "Let's start where every project starts: an empty folder and one command.",
  1, 'From an empty folder', 'uv, and four libraries'));

{
  const n =
    "Here's everything we have. Four empty files, and no code in any of them. " +
    "We're going to use uv to set this up. " +
    "If uv is new to you, it's a tool that manages Python projects and packages — " +
    "the same job pip does, quite a lot faster, " +
    "and you only need the two commands you're about to watch. " +
    "uv init makes this folder into a Python project, " +
    "which writes a file called pyproject dot toml. " +
    "That file is the list of what this project needs to run.";
  scenes.push(rec(n, 'an empty folder, and one command',
    'Four empty files, and the command that turns the folder into a project.',
    [A('look', 'nothing written yet', {
       callouts: [{text: 'four files, all empty', mark: 'feat', side: 'right', color: 'blue',
                   atWord: at(n, 'files')}]}),
     A('init', 'now it is a project', {wantAtWord: at(n, 'init'),
       callouts: [{text: 'the list of what this needs', mark: 'made', side: 'right',
                   color: 'green', atWord: at(n, 'pyproject')}]})]));
}

{
  const n =
    "Look at what that one command left behind, because it's the whole project. " +
    "pyproject dot toml is the list of what this project depends on — " +
    "you edit it, or a command edits it for you, and it is the truth about the project. " +
    "Underneath it, a folder called dot venv: " +
    "a private copy of Python that belongs to this folder alone, " +
    "so what we install here can never collide with anything else on your machine. " +
    "And in a moment there will be a lock file, " +
    "which records the exact version of every single package that got installed, " +
    "including the packages your packages needed. " +
    "That is the layer that makes a project reproducible: " +
    "hand somebody the lock file and they get the run you had, " +
    "rather than whatever happens to be newest today.";
  scenes.push(layers(n, {
    headline: 'What uv [actually made]',
    atWord: at(n, 'behind'),
    layers: [
      {label: 'pyproject.toml', sub: 'what this project depends on', color: 'green',
       atWord: at(n, 'pyproject')},
      {label: '.venv', sub: 'a Python for this folder', color: 'purple',
       atWord: at(n, 'venv')},
      {label: 'uv.lock', sub: 'the exact versions, pinned', color: 'blue',
       atWord: at(n, 'lock')},
    ],
  }));
}

{
  const n =
    "And look at what this replaces, " +
    "because if you have done Python before, you have done the left hand column. " +
    "Create a virtual environment. Remember to activate it, " +
    "in a different way on Windows than on Mac. " +
    "Install packages one at a time with pip, " +
    "then freeze them into a requirements file, and hope that file stays honest. " +
    "uv folds all of that into two ideas: add a package, run a command. " +
    "The environment is created when it is needed, " +
    "the lock file is written without being asked, " +
    "and there is no activate step to forget.";
  scenes.push(compare(n, {
    headline: 'The old way, [and this]',
    source: 'uv 0.12.9 on this machine — the commands we run in this chapter',
    atWord: at(n, 'column'),
    a: {name: 'pip and venv', color: 'orange'},
    b: {name: 'uv', color: 'green'},
    rows: [
      {label: 'make an environment', a: 'python -m venv', b: 'automatic', winner: 'b',
       atWord: at(n, 'environment')},
      {label: 'turn it on', a: 'activate it', b: 'never needed', winner: 'b',
       atWord: at(n, 'activate')},
      {label: 'add a package', a: 'pip install', b: 'uv add', winner: 'tie',
       atWord: at(n, 'pip')},
      {label: 'pin the versions', a: 'pip freeze', b: 'uv.lock, free', winner: 'b',
       atWord: at(n, 'freeze')},
    ],
  }));
}

{
  const n =
    "Then one command brings in the four libraries this chapter needs, " +
    "and I want to name each one, because a list of installs you can't read " +
    "is where a beginner gets left behind. " +
    "behave is the BDD runner — it reads tests written as plain English sentences. " +
    "allure-behave is the bridge that turns what behave did into Allure's evidence files. " +
    "playwright drives a Chromium browser, which is how we'll take a screenshot. " +
    "And requests fetches web pages from Python. " +
    "Four libraries, one command, and every one of them is pure Python.";
  scenes.push(rec(n, 'four libraries, four jobs',
    'One install command, and the job each package does.',
    [A('add', 'one command', {wantAtWord: at(n, 'command')}),
     A('deps', 'what landed in the project', {wantAtWord: at(n, 'behave'),
       callouts: [{text: 'reads plain-English tests', mark: 'behave', side: 'right',
                   color: 'blue', atWord: at(n, 'BDD')},
                  {text: 'turns the run into evidence files', mark: 'allure', side: 'right',
                   color: 'green', atWord: at(n, 'bridge')},
                  {text: 'drives Chromium for us', mark: 'pw', side: 'right',
                   color: 'purple', atWord: at(n, 'drives')},
                  {text: 'fetches pages from Python', mark: 'req', side: 'right',
                   color: 'orange', atWord: at(n, 'fetches')}]})]));
}

{
  const n =
    "Four names went into that command, and each one has a single job. " +
    "behave is the runner: it reads the English, finds the Python, and executes it. " +
    "allure dash behave is the translator: it listens to the run " +
    "and writes out result files in the shape Allure expects. " +
    "playwright drives Chromium, which is how we get a screenshot of a page. " +
    "And requests fetches web pages from Python without a browser, " +
    "which is faster when a picture is not what you are after. " +
    "Two of those are about running tests, and two are about producing evidence. " +
    "That split is the whole chapter in one line.";
  scenes.push(stage(n, 'toolbelt', {
    headline: 'Four tools, [two jobs]',
    caption: 'what each one is for',
    premise: 'Two of these run the tests. Two of them produce the evidence. Each tool drops into the pouch it belongs to as it is named.',
    color: 'blue',
    atWord: 1,
    cells: [
      {label: 'behave', sub: 'runs the English', text: 'run', icon: 'lucide:play',
       color: 'blue', atWord: at(n, 'runner')},
      {label: 'allure-behave', sub: 'writes the results', text: 'run', icon: 'lucide:file-json',
       color: 'purple', atWord: at(n, 'translator')},
      {label: 'playwright', sub: 'drives Chromium', text: 'evidence', icon: 'lucide:camera',
       color: 'green', atWord: at(n, 'playwright')},
      {label: 'requests', sub: 'fetches pages', text: 'evidence', icon: 'lucide:globe',
       color: 'orange', atWord: at(n, 'requests')},
    ],
  }));
}

{
  const n =
    "One more install, and it's a browser rather than a library. " +
    "playwright needs an actual copy of Chromium to drive, " +
    "so this downloads one and keeps it somewhere shared on your machine. " +
    "You run this once, ever. " +
    "After that, every project on the machine uses the same copy.";
  scenes.push(rec(n, 'and one browser driver',
    'Playwright fetching the browser it will drive.',
    [A('browser', 'downloaded once', {wantAtWord: at(n, 'Chromium')})]));
}

{
  const n =
    "That last command deserves a proper explanation, " +
    "because it is the one people get caught by. " +
    "Installing the playwright library gives you Python code that knows how to drive a browser. " +
    "It does not give you a browser. " +
    "The browser is a separate few hundred megabytes " +
    "that playwright downloads on its own, into a shared folder on your machine, " +
    "and that is what the install chromium command is doing. " +
    "It happens once per machine, and every project afterwards uses the same copy. " +
    "So if you have run this before, that command finishes almost immediately, " +
    "and if you have never run it, this is the slow part of the setup.";
  scenes.push(diagram(n, {
    nodes: [
      {id: 'lib', label: 'playwright', sub: 'the Python library', color: 'blue',
       atWord: at(n, 'library')},
      {id: 'dl', label: 'install chromium', sub: 'downloads once', color: 'purple',
       parent: 'lib', atWord: at(n, 'downloads')},
      {id: 'br', label: 'Chromium', sub: 'a shared folder', color: 'orange',
       parent: 'dl', atWord: at(n, 'shared')},
      {id: 'shot', label: 'a screenshot', sub: 'what we came for', color: 'green',
       parent: 'br', atWord: at(n, 'immediately')},
    ],
  }));
}

{
  const n =
    "So this is where the project stands before we write anything. " +
    "A pyproject file listing four dependencies. " +
    "A lock file pinning them. " +
    "A dot venv folder holding the private Python. " +
    "And a features folder, which is empty, " +
    "and which is where the next three files are going to live. " +
    "Four things on disk, and none of them written by hand.";
  scenes.push(tree(n, {
    headline: 'The folder, [before we write anything]',
    atWord: at(n, 'stands'),
    highlight: 3,
    nodes: [
      {name: 'pyproject.toml', depth: 0, kind: 'file', color: 'green', atWord: at(n, 'pyproject')},
      {name: 'uv.lock', depth: 0, kind: 'file', color: 'blue', atWord: at(n, 'lock')},
      {name: '.venv', depth: 0, kind: 'folder', color: 'purple', atWord: at(n, 'venv')},
      {name: 'features', depth: 0, kind: 'folder', color: 'orange', atWord: at(n, 'features')},
    ],
  }));
}


// ═══ CHAPTER 2 — the checks, written in plain English ════════════════════════
scenes.push(chapter(
  "Before any Python, we describe what we want to check — in English.",
  2, 'Plain English first', 'ten checks, written as sentences'));

{
  const n =
    "Before we type it, here is the shape of the file we are about to write, " +
    "because every one of these files looks the same. " +
    "At the top, a Feature — one line saying what this file is about. " +
    "Under it, an optional Background: steps that run before every scenario, " +
    "so you write them once instead of ten times. " +
    "Then the scenarios themselves, one per check. " +
    "And inside each scenario, steps beginning with Given, When or Then. " +
    "Four levels, and the indentation is what tells you which level you are on. " +
    "This format is called Gherkin, and it is not specific to Python — " +
    "the same file would run under Java or Ruby or JavaScript with a different runner.";
  scenes.push(diagram(n, {
    nodes: [
      {id: 'f', label: 'Feature', sub: 'what the file is about', color: 'blue',
       atWord: at(n, 'Feature')},
      {id: 'b', label: 'Background', sub: 'before each scenario', color: 'purple',
       parent: 'f', atWord: at(n, 'Background')},
      {id: 's', label: 'Scenario', sub: 'one check', color: 'green',
       parent: 'f', atWord: at(n, 'scenarios')},
      {id: 'st', label: 'Given/When/Then', sub: 'the steps inside', color: 'orange',
       parent: 's', atWord: at(n, 'steps', 2)},
    ],
  }));
}

{
  const n =
    "This is BDD, which stands for behaviour driven development, " +
    "and the idea behind the name is simpler than the name is. " +
    "You write down what the software should do, as ordinary sentences, " +
    "before you write any code to check it. " +
    "The sentences follow a small pattern called Gherkin: " +
    "Given sets the scene, When does the thing, and Then checks the result. " +
    "Three words, and you already know the whole grammar. " +
    "Feature names what we're testing. " +
    "Background is a line that runs before every single check, " +
    "so we don't repeat ourselves ten times.";
  scenes.push(rec(n, 'a feature, and one shared setup line',
    'The first lines of the feature file: what we are testing, and what every check starts with.',
    [A('openfeat', 'an empty file'),
     A('feat1', 'Feature, and Background', {wantAtWord: at(n, 'Feature')})]));
}

{
  const n =
    "And those three words are not decoration — they mean different things, " +
    "and using them properly is most of what makes a feature file readable. " +
    "Given describes the world before anything happens. " +
    "It is setup: a website exists, a user is logged in, a basket has two items in it. " +
    "When is the single action you are testing. " +
    "One thing happens: a request is sent, a button is clicked. " +
    "Then is what you expect afterwards, and it is the only place a check belongs. " +
    "If you find yourself checking something in a Given, " +
    "that check is in the wrong place, and the failure will point at the wrong line. " +
    "Given, When, Then: context, action, expectation.";
  scenes.push(compare(n, {
    headline: 'Three words, [three jobs]',
    source: 'Gherkin — the format behave reads, shared across languages',
    atWord: at(n, 'decoration'),
    a: {name: 'the word', color: 'blue'},
    b: {name: 'what it is for', color: 'green'},
    rows: [
      {label: 'Given', a: 'context', b: 'world before', winner: 'tie',
       atWord: at(n, 'Given')},
      {label: 'When', a: 'action', b: 'the one thing', winner: 'tie',
       atWord: at(n, 'When')},
      {label: 'Then', a: 'expectation', b: 'checks go here', winner: 'b',
       atWord: at(n, 'Then', 2)},
    ],
  }));
}

{
  const n =
    "Now the checks themselves, and each one is three lines at most. " +
    "The first sends a plain web request to the Python homepage " +
    "and expects the number two hundred back, " +
    "which is what the web says when something worked. " +
    "The second downloads the page and checks the word Python is somewhere in it. " +
    "Notice what these sentences do NOT contain: any Python at all. " +
    "Somebody who has never programmed could read this file and tell you what it checks, " +
    "and that is the entire point of writing tests this way.";
  scenes.push(rec(n, 'the first two checks',
    'Two scenarios, written as sentences anyone can read.',
    [A('feat2', 'a request, then a check', {
       callouts: [{text: 'no Python in this file yet', mark: null, side: 'top',
                   color: 'green', atWord: at(n, 'contain')}]})]));
}

{
  const n =
    "Underneath that first check, this is all that happens. " +
    "A GET request goes out to the address in the Given, " +
    "and a response comes back. " +
    "A response has a status code — a three digit number saying how it went — " +
    "and a body, which is the HTML of the page. " +
    "Two hundred means the server understood and is giving you what you asked for. " +
    "The first scenario checks that number. " +
    "The second one goes into the body and looks for a word. " +
    "Same single request, two different questions asked of it.";
  scenes.push(api(n, {
    headline: 'One request, [two questions]',
    method: 'GET',
    path: 'https://www.python.org',
    requestLines: ['GET https://www.python.org'],
    status: '200',
    statusText: 'OK',
    responseLines: ['<html> … Python … </html>'],
    clientLabel: 'requests',
    serverLabel: 'python.org',
    atWord: at(n, 'GET'),
  }));
}

{
  const n =
    "Three more, and now we're asking for evidence. " +
    "One opens a Chromium window and takes a full page screenshot. " +
    "One sends the same request three times and records how long each took, " +
    "which gives us a small table. " +
    "And one takes the same screenshot again as a JPEG instead of a PNG, " +
    "so we can see later that the report handles both without caring which is which.";
  scenes.push(rec(n, 'a screenshot, and a timing table',
    'Checks that produce evidence rather than just a yes or no.',
    [A('feat3', 'checks that leave proof', {wantAtWord: at(n, 'Chromium')})]));
}

{
  const n =
    "Let me draw the timing check before we write it, " +
    "because the shape of the evidence is the point. " +
    "We send the same request three times, " +
    "and for each one we write down which attempt it was, " +
    "what the status code came back as, and how many milliseconds it took. " +
    "Three rows, three columns. " +
    "That is a table, and a table is exactly the sort of thing " +
    "that is miserable to read in a log line and pleasant to read in a report. " +
    "Look at the numbers in the third column when we run it for real: " +
    "the first attempt is almost always the slow one.";
  scenes.push(table(n, {
    headline: 'Three attempts, [three rows]',
    tableName: 'the CSV we attach',
    query: 'built in memory, never written to disk',
    columns: ['attempt', 'status', 'ms'],
    rows: [['1', '200', 'slowest'], ['2', '200', 'quicker'], ['3', '200', 'quicker']],
    highlight: [0, 1, 2],
    highlightAtWords: [at(n, 'attempt'), at(n, 'status'), at(n, 'milliseconds')],
    atWord: at(n, 'draw'),
  }));
}

{
  const n =
    "Two more. One archives the page into a zip file, " +
    "which matters because a zip is binary — " +
    "it is not text, and you'll see the report treat it differently at the end. " +
    "And one writes the same three facts as JSON, as XML, and as YAML. " +
    "Same information, three shapes, " +
    "so we can watch one rule handle all three without a special case for each.";
  scenes.push(rec(n, 'a zip, and three ways to write a summary',
    'Evidence in a binary format, and the same summary in three text formats.',
    [A('feat4', 'binary, and text shapes', {wantAtWord: at(n, 'zip')})]));
}

{
  const n =
    "Three summaries of the same three facts, " +
    "and the reason for writing all three is not that a report needs three. " +
    "It is that JSON, XML and YAML are the three shapes " +
    "you will actually be handed by other tools, " +
    "and each one arrives with a different attachment type on it. " +
    "JSON is application slash json. XML is application slash xml. " +
    "YAML is application slash yaml. " +
    "Three different labels, all describing text a person can read. " +
    "Remember that, because in the last chapter " +
    "those three labels are the exact reason our report needs one extra line of code.";
  scenes.push(list(n, 'Same facts, three shapes', [
    {text: 'JSON — application/json', atWord: at(n, 'JSON', 2)},
    {text: 'XML — application/xml', atWord: at(n, 'XML', 2)},
    {text: 'YAML — application/yaml', atWord: at(n, 'YAML', 2)},
    {text: 'all three are readable text', atWord: at(n, 'read')},
  ]));
}

{
  const n =
    "And now the three that carry this chapter. " +
    "The first is written to fail — " +
    "an ordinary check that asks for text the page will never contain. " +
    "The second is written to break, which is a different thing entirely, " +
    "and we will come back to it in a minute. " +
    "The third carries a tag, and that tag tells behave to skip it, " +
    "so the scenario never runs at all. " +
    "Now, why go to the trouble of writing three tests that don't pass? " +
    "Because every tutorial you have ever watched writes tests that pass, " +
    "which means every report you have ever seen in a tutorial is one colour. " +
    "You learn what green looks like and you learn nothing else. " +
    "The moment a real suite goes red at two in the morning, " +
    "the thing you actually need to read is the difference " +
    "between a test that found a problem and a test that had a problem, " +
    "and you can only learn to read that difference " +
    "by deliberately producing all four outcomes " +
    "and looking at what the report does with each of them.";
  scenes.push(rec(n, 'the three nobody shows you',
    'A check written to fail, one written to break, and one written to be skipped.',
    [A('feat5', 'fail, break, skip', {
       callouts: [{text: 'never runs at all', mark: 'skip', side: 'right',
                   color: 'purple', atWord: at(n, 'outcomes')}]}),
     A('savefeat', 'saved')]));
}

{
  const n =
    "Let me be precise about what each of those three proves, " +
    "because they are answering three different questions. " +
    "The failing one proves your check works: " +
    "when the page really is wrong, the suite really does go red. " +
    "A test that has never failed has never been shown to work. " +
    "The broken one proves the reporting works: " +
    "when your test itself falls over, you can tell that apart from a genuine failure. " +
    "And the skipped one proves the wiring works: " +
    "the tag was read, the scenario was left alone, and it was recorded rather than lost. " +
    "Three tests that do not pass, and each one buys you something real.";
  scenes.push(list(n, 'What each one proves', [
    {text: 'failing — your check works', atWord: at(n, 'failing')},
    {text: 'broken — the report can tell', atWord: at(n, 'broken')},
    {text: 'skipped — the tag was read', atWord: at(n, 'skipped')},
  ]));
}

{
  const n =
    "All ten are written, so let's put those three side by side and read them properly. " +
    "The first one asks the page to contain a sentence that isn't there. " +
    "That's an ordinary check, getting an ordinary no. " +
    "The second says something unexpected goes wrong — " +
    "and the word unexpected is doing real work in that sentence. " +
    "The third has that skip tag above it. " +
    "Pause here for a moment and read all three, " +
    "because the difference between the first two is the thing " +
    "most people never learn about test reports.";
  scenes.push(rec(n, 'the three, side by side',
    'The three deliberate scenarios, printed together.',
    [A('special', 'read these three properly', {
       zooms: [{mark: 'sbrok', atWord: at(n, 'unexpected')}],
       callouts: [{text: 'an ordinary check, getting a no', mark: 'sfail', side: 'right',
                   color: 'red', atWord: at(n, 'ordinary')},
                  {text: 'never runs', mark: 'sskip', side: 'right',
                   color: 'purple', atWord: at(n, 'third')}]})]));
}

{
  const n =
    "So this is the plan for the whole run, written down. " +
    "Ten scenarios. Seven of them we expect to pass. " +
    "One we expect to fail, because we wrote it that way. " +
    "One we expect to break, because it asks for a header that does not exist. " +
    "And one we expect to be skipped, because of the tag above it. " +
    "Keep this table in your head, " +
    "because in about ten minutes behave is going to print four numbers, " +
    "and this is what those four numbers should be. " +
    "If you predict the output before you run it, " +
    "you learn something whichever way it turns out.";
  scenes.push(table(n, {
    headline: 'What we expect [before we run]',
    tableName: 'the feature file',
    query: 'ten scenarios, four outcomes',
    columns: ['how many', 'outcome', 'why'],
    rows: [
      ['7', 'passed', 'plain checks'],
      ['1', 'failed', 'wants absent txt'],
      ['1', 'broken', 'missing header'],
      ['1', 'skipped', 'tagged @skip'],
    ],
    highlight: [0, 1, 2, 3],
    highlightAtWords: [at(n, 'Seven'), at(n, 'fail'), at(n, 'break'), at(n, 'skipped')],
    atWord: at(n, 'plan'),
  }));
}

{
  const n =
    "So here's that difference, drawn. " +
    "On the left, a check that fails. " +
    "The test runs, it reaches the assert — that's the line that does the checking — " +
    "and the assert looks at what came back and says no, this isn't what I was promised. " +
    "The check was reached, and the check said no. " +
    "On the right, a check that breaks. " +
    "The test falls over before it ever gets to the assert. " +
    "Reading a header that doesn't exist throws an error, " +
    "and the checking line is never reached at all. " +
    "That's the whole distinction, and it's worth holding on to: " +
    "failed means your software is wrong, " +
    "broken means your test is wrong. " +
    "Two completely different problems, and two different people who need to fix them.";
  scenes.push(stage(n, 'fail-vs-broken', {
    headline: 'Failed, or [broken]?',
    caption: 'was the check ever reached?',
    premise: 'Both tests travel toward the same assert. The one on the left arrives and is refused. The one on the right never gets there.',
    color: 'red',
    atWord: 1,
    cells: [
      {label: 'AssertionError', sub: 'the page did not contain the text',
       text: 'failed', atWord: at(n, 'left')},
      {label: "KeyError: no such header", sub: 'the test itself threw',
       text: 'broken', atWord: at(n, 'right')},
    ],
  }));
}


// ═══ CHAPTER 3 — the Python behind every English line ════════════════════════
scenes.push(chapter(
  "Those sentences do nothing on their own. Now we give each one some Python.",
  3, 'The Python behind it', 'one function per sentence'));

{
  const n =
    "Here's how a sentence and a function find each other. " +
    "You write a normal Python function. " +
    "Above it you put a decorator — that's the line starting with an at sign — " +
    "and inside the decorator you put the sentence it answers. " +
    "When behave reads your feature file and hits that sentence, " +
    "it looks for the function whose decorator matches, and runs it. " +
    "The curly braces you'll see are placeholders: " +
    "whatever the sentence has in that position gets handed to the function as an argument. " +
    "So one function can answer a whole family of sentences.";
  scenes.push(stage(n, 'step-binding', {
    headline: 'How a sentence finds [its code]',
    caption: 'the decorator is the wire',
    premise: 'The English line lives in the feature file, the function lives in the steps file, and the decorator is what joins them.',
    color: 'green',
    atWord: 1,
    cells: [
      {label: 'Given the target website',
       text: '@given(...)', sub: 'def step_set_target(context, url)', atWord: at(n, 'decorator')},
      {label: 'When I send a GET request',
       text: '@when(...)', sub: 'def step_get_homepage(context)', atWord: at(n, 'matches')},
      {label: 'Then the status is 200',
       text: '@then(...)', sub: 'def step_check_status(context, code)',
       atWord: at(n, 'braces')},
    ],
  }));
}

{
  const n =
    "One more picture before the typing, " +
    "because this is the part that feels like magic until you see it. " +
    "behave reads a line of English out of the feature file. " +
    "It then looks through every function in the steps folder " +
    "for one whose decorator holds a matching sentence. " +
    "When it finds one, it calls that function. " +
    "The sentence in the file and the sentence in the decorator have to match — " +
    "that is the entire binding. " +
    "There is no registry, no configuration, no naming convention on the function itself. " +
    "The function can be called anything at all. " +
    "The string above it is what does the work.";
  scenes.push(diagram(n, {
    nodes: [
      {id: 'line', label: 'a line of English', sub: 'in the .feature file', color: 'blue',
       atWord: at(n, 'English')},
      {id: 'scan', label: 'behave looks', sub: 'through the steps', color: 'purple',
       parent: 'line', atWord: at(n, 'looks')},
      {id: 'dec', label: '@when("...")', sub: 'the matching sentence', color: 'orange',
       parent: 'scan', atWord: at(n, 'decorator')},
      {id: 'fn', label: 'your function', sub: 'name it anything', color: 'green',
       parent: 'dec', atWord: at(n, 'anything')},
    ],
  }));
}

{
  const n =
    "New file, and it opens with a long comment. " +
    "I'm leaving that comment in on purpose, " +
    "because a note explaining why a file exists " +
    "is worth far more than the file being three lines shorter. " +
    "Six months from now, the person opening this — " +
    "and it might well be you — " +
    "gets the reasoning instead of having to reconstruct it. " +
    "And it says something worth knowing. " +
    "Allure supports twenty attachment types. " +
    "We are going to use nine of them, " +
    "and nine is a deliberate number rather than a random one. " +
    "Evidence really only comes in a handful of shapes: " +
    "a picture, a table, plain text, structured text, and a compressed archive. " +
    "Nine attachments is enough to put at least one of every shape into the report, " +
    "which means that by the end of this chapter " +
    "you will have seen the report handle every kind of thing it can be handed. " +
    "Adding the other eleven types would be padding — " +
    "each one would travel down a path you have already watched work.";
  scenes.push(rec(n, 'a note to whoever opens this next',
    'The steps file, and the comment at the top of it.',
    [A('opensteps', 'the second file'),
     A('st1', 'why this file exists', {wantAtWord: at(n, 'comment')}),
     A('st1b', 'twenty exist, we use nine', {wantAtWord: at(n, 'Allure')})]));
}

{
  const n =
    "Then the imports, and each one is a promise about what this file is going to do. " +
    "csv and io build the timing table in memory. " +
    "json, zipfile and time are what they sound like. " +
    "allure is the library that attaches evidence. " +
    "requests fetches pages. " +
    "And from behave we take given, when and then — the three decorators " +
    "that let a function claim an English sentence.";
  scenes.push(rec(n, 'the imports, and what each is for',
    'Seven imports, and the job each one has in this file.',
    [A('st1c', 'seven imports', {wantAtWord: at(n, 'imports')})]));
}

{
  const n =
    "Seven imports, and I want to group them rather than list them, " +
    "because they fall into three families. " +
    "csv, io, json and zipfile are all standard library — " +
    "they ship with Python, and they exist to build the evidence in memory. " +
    "time is standard library too, and it is how we measure. " +
    "allure and requests are the two installed packages: " +
    "one attaches evidence, one fetches pages. " +
    "And the behave import is different from all of them, " +
    "because it does not give us a function to call. " +
    "It gives us three decorators, " +
    "and a decorator is a way of attaching a label to a function " +
    "so that something else can find it later.";
  scenes.push(stage(n, 'import-shelf', {
    headline: 'Seven imports, [three crates]',
    caption: 'where each one comes from',
    premise: 'Four ship with Python. Two we installed. And one is a different kind of thing entirely.',
    color: 'purple',
    atWord: 1,
    cells: [
      {label: 'csv, io, json, zipfile, time', sub: 'ships with Python',
       color: 'blue', atWord: at(n, 'library')},
      {label: 'allure, requests', sub: 'we installed these',
       color: 'green', atWord: at(n, 'packages')},
      {label: 'given, when, then', sub: 'decorators, not functions',
       color: 'orange', atWord: at(n, 'decorators')},
    ],
  }));
}

{
  const n =
    "Now the first three functions, and I'll go line by line. " +
    "The Given stores the address on something called context. " +
    "context is a box behave hands to every step in a scenario, " +
    "so anything you put on it in one step is still there in the next one. " +
    "That's how the When knows which website to visit. " +
    "The When calls requests dot get, which fetches the page, " +
    "and stores the answer on context as well. " +
    "It also attaches every response header as a text file, " +
    "which is our first piece of evidence. " +
    "And the Then does the actual checking: " +
    "assert, then the thing that must be true. " +
    "If it is true, nothing happens and the test carries on. " +
    "If it isn't, Python raises an AssertionError, " +
    "and that is the exact word you'll see in the report later.";
  scenes.push(rec(n, 'a target, a request, a check',
    'The first three step functions, and the context object that connects them.',
    [A('st2', 'given, when, then', {
       zooms: [{mark: 'assertline', atWord: at(n, 'assert')}],
       callouts: [{text: 'a box that survives between steps', mark: null, side: 'top',
                   color: 'blue', atWord: at(n, 'box')},
                  {text: 'raises AssertionError when false', mark: 'assertline', side: 'right',
                   color: 'red', atWord: at(n, 'AssertionError')}]})]));
}

{
  const n =
    "Stop on that assert for a second, because it is doing two jobs. " +
    "The first is obvious: it checks something, " +
    "and stops the scenario if the check comes out false. " +
    "The second is the message after the comma. " +
    "That message only ever gets used when the check fails, " +
    "and it is what you will be reading at some future point " +
    "when you have no memory of writing this test. " +
    "Expected two hundred, got five hundred and three " +
    "tells you what happened. " +
    "Assertion failed tells you nothing you did not already know. " +
    "Write the message for the person reading the report, not for yourself now.";
  scenes.push(compare(n, {
    headline: 'The message [is the whole point]',
    source: 'assert in Python — the second argument is the failure message',
    atWord: at(n, 'assert'),
    a: {name: 'a bare assert', color: 'orange'},
    b: {name: 'with a message', color: 'green'},
    rows: [
      {label: 'what the report says', a: 'AssertionError', b: '503, not 200',
       winner: 'b', atWord: at(n, 'message')},
      {label: 'what you do next', a: 'open the code', b: 'you know it', winner: 'b',
       atWord: at(n, 'happened')},
    ],
  }));
}

{
  const n =
    "The next pair downloads the page and keeps a piece of it. " +
    "allure dot attach is the line to learn in this whole file, " +
    "so let's read its three arguments properly. " +
    "First, the thing you're attaching — here, the first two thousand characters of the page. " +
    "Second, a name, which is what you'll click on in the report. " +
    "Third, the type, which tells Allure how to treat those bytes. " +
    "Attachment type dot HTML means show it as a web snippet. " +
    "Change that third argument and the same bytes get shown a completely different way. " +
    "Then the check underneath is another assert — " +
    "is the expected text somewhere in the page we downloaded?";
  scenes.push(rec(n, 'attaching your first evidence',
    'allure.attach, and the three arguments that decide what the report does with it.',
    [A('st3', 'what, called what', {
       zooms: [{mark: 'contains', atWord: at(n, 'underneath')}],
       callouts: [{text: 'the name you click in the report', mark: null, side: 'top',
                   color: 'green', atWord: at(n, 'name')}]})]));
}

{
  const n =
    "allure dot attach takes three things, and they are worth naming. " +
    "The body, which is the evidence itself — either text or raw bytes. " +
    "The name, which is the caption a person will read above it in the report. " +
    "And the attachment type, which is a label saying what kind of thing this is. " +
    "That third one is the one people skip, " +
    "and it is the one that decides everything downstream. " +
    "The type is why a screenshot appears as a picture, " +
    "why a CSV appears as a table, " +
    "and why our zip is going to come out as a link instead of a mess. " +
    "Body, name, type. Get the type right and the report does the rest.";
  scenes.push(layers(n, {
    headline: 'allure.attach [takes three things]',
    atWord: at(n, 'three'),
    layers: [
      {label: 'body', sub: 'text, or raw bytes', color: 'blue', atWord: at(n, 'body')},
      {label: 'name', sub: 'the caption in the report', color: 'purple', atWord: at(n, 'name')},
      {label: 'attachment_type', sub: 'decides how it is shown', color: 'green',
       atWord: at(n, 'type')},
    ],
  }));
}

{
  const n =
    "This one opens a Chromium window. " +
    "context dot browser is a Chromium that's already running — " +
    "we set that up in a moment, in a separate file. " +
    "new page opens a fresh tab at a fixed size, " +
    "twelve hundred and eighty by eight hundred, " +
    "so every screenshot comes out the same shape whichever machine runs it. " +
    "goto navigates to the address. " +
    "wait until load means: hold here until the page has finished loading. " +
    "Leave that out and you can capture a blank white rectangle " +
    "and spend an hour wondering why. " +
    "Then we take the picture, close the tab, and attach the bytes. " +
    "Notice the order there — the tab is closed before the attachment happens, " +
    "because the bytes are already ours by then, " +
    "and a browser tab left open is how a quick suite turns into a slow one. " +
    "And the picture itself: full page true. " +
    "That means the entire page, including everything below the fold " +
    "that you would have to scroll down to see, " +
    "rather than the one screenful a person happens to be looking at.";
  scenes.push(rec(n, 'a browser, and a screenshot',
    'Opening a tab, navigating, capturing the full page, closing it again.',
    [A('st4', 'open, go, capture, close', {
       callouts: [{text: 'the whole page, not just the visible part', mark: null,
                   side: 'top', color: 'purple', atWord: at(n, 'scroll')}]})]));
}

{
  const n =
    "Four objects, and they nest inside each other, " +
    "and having them straight in your head helps, " +
    "because the names come up constantly in Playwright. " +
    "The browser is the running Chromium process — expensive, and shared. " +
    "A page is one tab inside it — cheap, and thrown away after use. " +
    "goto is the navigation, " +
    "and the screenshot is the only thing that leaves this function alive. " +
    "Everything above it gets closed. " +
    "That is the pattern for anything expensive: " +
    "open it high up, use it briefly, and take only the result away with you.";
  scenes.push(diagram(n, {
    nodes: [
      {id: 'br', label: 'browser', sub: 'one Chromium, shared', color: 'purple',
       atWord: at(n, 'browser')},
      {id: 'pg', label: 'page', sub: 'one tab, thrown away', color: 'blue',
       parent: 'br', atWord: at(n, 'page')},
      {id: 'go', label: 'goto', sub: 'navigate and wait', color: 'orange',
       parent: 'pg', atWord: at(n, 'goto')},
      {id: 'sh', label: 'screenshot bytes', sub: 'the only thing kept', color: 'green',
       parent: 'go', atWord: at(n, 'alive')},
    ],
  }));
}

{
  const n =
    "Now a loop that measures. " +
    "For each of three attempts we note the clock, send the request, " +
    "and work out how many milliseconds it took. " +
    "perf counter is a timer built for measuring short durations — " +
    "it counts elapsed time and ignores everything else the machine is busy with. " +
    "We take a reading before the request and another after, " +
    "subtract the first from the second, " +
    "multiply by a thousand to turn seconds into milliseconds, and round it. " +
    "Three attempts rather than one, because a single number tells you very little. " +
    "The first request usually includes a connection being opened from scratch, " +
    "and the ones after it are quicker for that reason alone. " +
    "Each result goes into a list as a small row: attempt, status code, duration. " +
    "Then we write those rows as CSV — comma separated values, " +
    "which is a table written as plain text: one row per line, cells separated by commas. " +
    "And we write it into a string buffer, " +
    "which behaves like an open file but lives in memory, " +
    "so the table exists only inside the running test " +
    "and no stray file is ever left behind on your disk.";
  scenes.push(rec(n, 'three timed requests, as a table',
    'A loop that records timings, and turns them into a CSV attachment.',
    [A('st5', 'measure, collect, attach', {
       callouts: [{text: 'built in memory, never written to disk', mark: null,
                   side: 'top', color: 'blue', atWord: at(n, 'disk')}]})]));
}

{
  const n =
    "And here is why three attempts rather than one. " +
    "The first request has to do work the others do not: " +
    "find the address of the server, open a connection to it, " +
    "and negotiate the encryption. " +
    "Only after all of that does it ask for the page. " +
    "The second and third requests skip most of that, " +
    "because the connection is already warm. " +
    "So a single timing is not a measurement of the site — " +
    "it is a measurement of the site plus your first handshake. " +
    "Any time you see one number quoted as a response time, " +
    "that is the question to ask: was it the first one?";
  scenes.push(compare(n, {
    headline: 'Why the first one [is always slower]',
    source: 'measured with time.perf_counter across three attempts',
    atWord: at(n, 'three'),
    a: {name: 'first request', color: 'orange'},
    b: {name: 'the ones after', color: 'green'},
    rows: [
      {label: 'find the server', a: 'yes', b: 'cached', winner: 'b', atWord: at(n, 'address')},
      {label: 'open a connection', a: 'yes', b: 'reused', winner: 'b', atWord: at(n, 'connection')},
      {label: 'set up encryption', a: 'yes', b: 'reused', winner: 'b', atWord: at(n, 'encryption')},
      {label: 'ask for the page', a: 'yes', b: 'yes', winner: 'tie', atWord: at(n, 'warm')},
    ],
  }));
}

{
  const n =
    "The same page again, and only one thing changed. " +
    "type equals jpeg on the screenshot call, " +
    "and attachment type dot JPG on the attach call. " +
    "Everything else is identical, line for line. " +
    "I'm doing this deliberately, for two reasons. " +
    "The first is that PNG and JPEG are genuinely different formats — " +
    "one keeps every pixel exactly as it was, " +
    "the other throws some detail away to be smaller — " +
    "so a report that handles both is handling a real case, " +
    "rather than the same case twice. " +
    "The second reason is what happens at the end. " +
    "You'll watch our own report draw both of these pictures " +
    "without ever asking which format it's looking at. " +
    "One check, written once, covering both. " +
    "Keep that in mind for the next few minutes.";
  scenes.push(rec(n, 'the same page, as a JPEG',
    'A second image format, changed in exactly two places.',
    [A('st6', 'two words different', {wantAtWord: at(n, 'jpeg')})]));
}

{
  const n =
    "And since we now have both, " +
    "here is the difference between the two formats in one line each. " +
    "PNG keeps every pixel exactly as it was. " +
    "Nothing is thrown away, the file is larger, " +
    "and it is what you want for a screenshot of text, " +
    "because text is where lost detail shows up first as fuzzy edges. " +
    "JPEG throws detail away in a way most eyes do not notice on a photograph, " +
    "and gets a much smaller file for it. " +
    "For a page full of writing, PNG. For a photograph, JPEG. " +
    "And for a report that has to handle whatever it is given: both, " +
    "which is precisely why we attached one of each.";
  scenes.push(compare(n, {
    headline: 'PNG and JPEG, [side by side]',
    source: 'both captured from the same page, in the same scenario',
    atWord: at(n, 'formats'),
    a: {name: 'PNG', color: 'blue'},
    b: {name: 'JPEG', color: 'orange'},
    rows: [
      {label: 'detail', a: 'every pixel', b: 'some dropped', winner: 'a',
       atWord: at(n, 'pixel')},
      {label: 'file size', a: 'larger', b: 'much smaller', winner: 'b',
       atWord: at(n, 'larger')},
      {label: 'best for', a: 'text, screens', b: 'photographs', winner: 'tie',
       atWord: at(n, 'photograph')},
    ],
  }));
}

{
  const n =
    "A zip file, built entirely in memory. " +
    "BytesIO is the trick here. " +
    "It behaves exactly like an open file — you write to it the same way — " +
    "but there is no file on disk anywhere. " +
    "We open a ZipFile writing into it, " +
    "and write str puts a named entry inside the archive: " +
    "here the whole page, and a small note beside it. " +
    "Then we ask the buffer for its contents " +
    "and hand those finished bytes to allure dot attach with type ZIP. " +
    "Two entries, one archive, zero files written into your project folder. " +
    "Why bother with an archive at all? " +
    "Because real suites attach bundles — " +
    "a folder of logs, a set of downloaded files, a database dump beside its schema. " +
    "Any time the evidence is more than one thing, " +
    "it arrives as an archive, and this is what that looks like in code. " +
    "It is also the one attachment in this chapter that is genuinely binary. " +
    "A zip is compressed: the bytes have been rewritten into a shorter form " +
    "that only a zip reader knows how to unpack. " +
    "Open one in a text editor and you get a screenful of nonsense. " +
    "Hold on to that fact, " +
    "because at the very end it is the single piece of evidence " +
    "that behaves differently from all the others, " +
    "and the reason why is a decision we make together in a few minutes.";
  scenes.push(rec(n, 'a zip, built in memory',
    'An archive assembled without ever touching the disk.',
    [A('st7', 'the truly binary one', {
       callouts: [{text: "the only one you can't read as text", mark: null, side: 'top',
                   color: 'orange', atWord: at(n, 'nonsense')}]})]));
}

{
  const n =
    "The in-memory pattern deserves one picture, " +
    "because you will use it far beyond this chapter. " +
    "At the bottom, a buffer: a stretch of memory that behaves like a file. " +
    "On top of it, a ZipFile, writing into that buffer " +
    "exactly as it would write into a file on disk. " +
    "Above that, the entries you add. " +
    "And at the end you ask the buffer for its bytes, " +
    "and hand those to Allure. " +
    "The whole archive existed only inside the running process. " +
    "No temporary folder, no file to delete afterwards, " +
    "and no risk of two tests running at once " +
    "and quietly overwriting each other's evidence.";
  scenes.push(layers(n, {
    headline: 'An archive [with no file]',
    atWord: at(n, 'picture'),
    layers: [
      {label: 'the entries you add', sub: 'writestr, one per file', color: 'green',
       atWord: at(n, 'entries')},
      {label: 'ZipFile', sub: 'writes as if to disk', color: 'purple', atWord: at(n, 'ZipFile')},
      {label: 'BytesIO buffer', sub: 'memory that acts like a file', color: 'blue',
       atWord: at(n, 'buffer')},
    ],
  }));
}

{
  const n =
    "Three functions, and they all say the same three facts: " +
    "the address, the status code, and how long the page was. " +
    "The first writes them as JSON, " +
    "using json dot dumps with an indent so a person can read it, " +
    "instead of one long unbroken line. " +
    "The second writes the same facts as XML, with angle brackets, " +
    "built with an f-string — that's the letter f before the quote mark, " +
    "which lets you drop a value straight into the middle of some text " +
    "without gluing strings together by hand. " +
    "The third writes them as YAML, which is name, colon, value on each line, " +
    "and that is the whole format. " +
    "Same three facts, three shapes, three attachment types. " +
    "I'm writing all three on purpose, " +
    "because in a few minutes our report will show all three, " +
    "and none of them will need a single line of code of its own.";
  scenes.push(rec(n, 'one summary, three formats',
    'The same three facts written as JSON, XML and YAML.',
    [A('st8', 'json, xml, yaml', {wantAtWord: at(n, 'JSON')})]));
}

{
  const n =
    "Put those three side by side as text, " +
    "because they carry identical information and read very differently. " +
    "JSON uses braces and quotes, and every tool on earth reads it. " +
    "XML wraps each value in a pair of tags, " +
    "which is heavier to look at but carries its own structure. " +
    "YAML strips almost everything away " +
    "and leaves name, colon, value, one per line. " +
    "Same three facts in all three. " +
    "When our report renders them at the end, " +
    "it will show all three as readable text " +
    "without knowing or caring which is which.";
  scenes.push(table(n, {
    headline: 'Same three facts, [three files]',
    tableName: 'the summaries',
    query: 'identical information, different shapes',
    columns: ['format', 'looks like', 'type'],
    rows: [
      ['JSON', '{"status":200}', 'application/json'],
      ['XML', '<status>200</s>', 'application/xml'],
      ['YAML', 'status: 200', 'application/yaml'],
    ],
    highlight: [0, 1, 2],
    highlightAtWords: [at(n, 'JSON'), at(n, 'XML'), at(n, 'YAML')],
    atWord: at(n, 'Put'),
  }));
}

{
  const n =
    "And the last two, which are the ones this chapter is really about. " +
    "The broken one fetches the page, " +
    "and then reads a header called X dash Definitely Not A Real Header. " +
    "That header does not exist, " +
    "so Python raises a KeyError and the scenario stops right there. " +
    "The skipped one calls context dot scenario dot skip with a reason, " +
    "and behave stops before running a single line of it. " +
    "Now go back to the broken one and look for the word assert. " +
    "There isn't one. " +
    "Nothing in that scenario is being checked, " +
    "which means nothing in it can be judged wrong. " +
    "The code simply falls over on its way to the check, " +
    "and that is precisely what Allure calls broken. " +
    "The skipped scenario never even got that far. " +
    "It reached a decision, stepped aside, " +
    "and left a reason behind for whoever reads the report.";
  scenes.push(rec(n, 'the broken one, and the skipped one',
    'A test that throws before it checks, and a test that never runs.',
    [A('st9', 'no assert anywhere', {
       zooms: [{mark: 'keyerror', atWord: at(n, 'back')}],
       callouts: [{text: 'no assert — nothing is being checked', mark: 'keyerror',
                   side: 'right', color: 'orange', atWord: at(n, 'checked')},
                  {text: 'stops before it runs', mark: 'skipcall', side: 'right',
                   color: 'purple', atWord: at(n, 'reason', 2)}]}),
     A('savesteps', 'saved')]));
}

{
  const n =
    "Three paths through a single scenario, and this is the distinction " +
    "that most people never get taught. " +
    "A scenario runs, reaches its check, and the check is happy: passed. " +
    "A scenario runs, reaches its check, and the check says no: failed. " +
    "That is your software being wrong, " +
    "and it is the outcome you actually want your suite to find. " +
    "A scenario runs and falls over before it ever reaches the check: broken. " +
    "That is your test being wrong, or the world underneath it having changed. " +
    "And a scenario that never starts: skipped. " +
    "Failed points at your software. Broken points at your test. " +
    "Read those two the same way and you will spend your morning debugging the wrong thing.";
  scenes.push(diagram(n, {
    nodes: [
      {id: 's', label: 'a scenario runs', sub: 'or does not', color: 'blue',
       atWord: at(n, 'paths')},
      {id: 'p', label: 'reaches the check', sub: 'passed, or failed', color: 'green',
       parent: 's', atWord: at(n, 'passed')},
      {id: 'b', label: 'falls over first', sub: 'broken — your test', color: 'orange',
       parent: 's', atWord: at(n, 'broken')},
      {id: 'k', label: 'never starts', sub: 'skipped — on purpose', color: 'purple',
       parent: 's', atWord: at(n, 'skipped')},
    ],
  }));
}

{
  const n =
    "Step back for a second and look at what we just attached. " +
    "Nine kinds of evidence, from one test run. " +
    "Response headers as text. A page snippet as HTML. A timing table as CSV. " +
    "A screenshot as PNG, and the same one as JPEG. " +
    "An archive as ZIP. And the same summary as JSON, XML and YAML. " +
    "Allure has twenty of these types in total, " +
    "but the nine here cover every family — " +
    "so once the report can handle these, it can handle the rest.";
  scenes.push(stage(n, 'evidence-shelf', {
    headline: 'Nine kinds of [evidence]',
    caption: 'from a single run',
    premise: 'Each of these came from one allure.attach call in the steps file, and each will be rendered by the report we are about to write.',
    color: 'purple',
    atWord: 1,
    cells: [
      {label: 'response_headers.txt', sub: 'TEXT', icon: 'lucide:file-text', color: 'blue',
       atWord: at(n, 'headers')},
      {label: 'homepage_snippet.html', sub: 'HTML', icon: 'lucide:code', color: 'blue',
       atWord: at(n, 'snippet')},
      {label: 'timing_results.csv', sub: 'CSV', icon: 'lucide:table', color: 'green',
       atWord: at(n, 'timing')},
      {label: 'homepage_screenshot.png', sub: 'PNG', icon: 'lucide:image', color: 'purple',
       atWord: at(n, 'screenshot')},
      {label: 'homepage_screenshot.jpg', sub: 'JPG', icon: 'lucide:image', color: 'purple',
       atWord: at(n, 'JPEG')},
      {label: 'homepage_evidence.zip', sub: 'ZIP', icon: 'lucide:archive', color: 'orange',
       atWord: at(n, 'archive')},
      {label: 'summary.json', sub: 'JSON', icon: 'lucide:braces', color: 'yellow',
       atWord: at(n, 'JSON')},
      {label: 'summary.xml', sub: 'XML', icon: 'lucide:file-code', color: 'yellow',
       atWord: at(n, 'XML')},
      {label: 'summary.yaml', sub: 'YAML', icon: 'lucide:list', color: 'yellow',
       atWord: at(n, 'YAML')},
    ],
  }));
}

{
  const n =
    "And this is what the run is about to leave on disk. " +
    "A folder named allure-results-bdd, " +
    "and inside it two kinds of file. " +
    "Result files, one per scenario, holding the name, the outcome, " +
    "the steps and a pointer to each piece of evidence. " +
    "And attachment files, one per piece of evidence, " +
    "holding the actual bytes: the screenshots, the table, the archive. " +
    "The result file never contains the evidence. It contains its file name. " +
    "That separation is the reason a run with a hundred screenshots " +
    "still has small, readable result files.";
  scenes.push(tree(n, {
    headline: 'What a run [leaves behind]',
    atWord: at(n, 'disk'),
    highlight: 1,
    nodes: [
      {name: 'allure-results-bdd', depth: 0, kind: 'folder', color: 'blue', atWord: at(n, 'folder')},
      {name: '*-result.json', depth: 1, kind: 'file', color: 'green', atWord: at(n, 'Result')},
      {name: '*-attachment.png', depth: 1, kind: 'file', color: 'purple', atWord: at(n, 'attachment')},
      {name: '*-attachment.csv', depth: 1, kind: 'file', color: 'orange', atWord: at(n, 'table')},
      {name: '*-attachment.zip', depth: 1, kind: 'file', color: 'orange', atWord: at(n, 'archive')},
    ],
  }));
}

// ═══ CHAPTER 4 — one browser for the whole run ═══════════════════════════════
scenes.push(chapter(
  "One small file left, and it is the one that gives us a browser to share.",
  4, 'One browser, shared', 'setup and teardown'));

{
  const n =
    "The lifecycle first, because behave gives you hooks at four levels " +
    "and picking the right one is the whole skill. " +
    "before all runs once, at the very start of the entire run. " +
    "before feature runs once per file. " +
    "before scenario runs before every single scenario. " +
    "And there is a matching after for each of them. " +
    "The rule is simple: put a thing at the level where its cost belongs. " +
    "Launching a browser is expensive, so it goes in before all and happens once. " +
    "Clearing a cookie is cheap and must not leak between tests, " +
    "so it would go in before scenario and happen ten times. " +
    "Put an expensive thing at the scenario level " +
    "and your suite gets ten times slower for no benefit at all.";
  scenes.push(diagram(n, {
    nodes: [
      {id: 'all', label: 'before_all', sub: 'once — the browser', color: 'green',
       atWord: at(n, 'once')},
      {id: 'feat', label: 'before_feature', sub: 'once per file', color: 'blue',
       parent: 'all', atWord: at(n, 'file')},
      {id: 'sc', label: 'before_scenario', sub: 'ten times — cheap only', color: 'purple',
       parent: 'feat', atWord: at(n, 'scenario')},
      {id: 'aft', label: 'after_all', sub: 'closes what it opened', color: 'orange',
       parent: 'all', atWord: at(n, 'matching')},
    ],
  }));
}

{
  const n =
    "Opening a fresh browser for every scenario would be slow, " +
    "so we open one at the start of the run and share it across all ten. " +
    "This file has a name behave looks for — environment dot py — " +
    "and it is the name that matters here, not the contents. " +
    "Put it in the right place, " +
    "and behave calls the functions inside it automatically. " +
    "before all runs once, ahead of everything else. " +
    "It starts Playwright, launches Chromium, " +
    "and parks both of them on context, " +
    "which is why every step we wrote could reach context dot browser " +
    "without ever creating one. " +
    "after all runs once at the very end, and shuts them down. " +
    "And it runs even when a scenario has failed, which is the part that matters — " +
    "a browser process left alive after a failed test " +
    "is how a machine slowly fills up with ghosts. " +
    "If you've used pytest, this is the same idea as a fixture.";
  scenes.push(rec(n, 'open it once, close it once',
    'The lifecycle file behave looks for by name.',
    [A('openenv', 'the third file'),
     A('env1', 'why this file exists', {wantAtWord: at(n, 'environment')}),
     A('env2', 'before all, and after all', {wantAtWord: at(n, 'before'),
       callouts: [{text: 'closed cleanly, even after a failure', mark: null, side: 'top',
                   color: 'green', atWord: at(n, 'ghosts')}]}),
     A('saveenv', 'saved')]));
}

{
  const n =
    "And the saving is not theoretical. " +
    "Launching Chromium takes roughly a second, " +
    "and that is a second of nothing useful happening. " +
    "Ten scenarios with their own browser is ten of those seconds, " +
    "and every scenario you add costs another one. " +
    "One shared browser pays the cost once and then never again, " +
    "so the tenth scenario is as cheap as the second. " +
    "That is the difference between a suite you run before every commit " +
    "and a suite you avoid running at all. " +
    "The pattern is worth stealing for anything slow to start: " +
    "a database connection, a logged-in session, a loaded model.";
  scenes.push(compare(n, {
    headline: 'One browser, [or ten]',
    source: 'the cost of launching Chromium, ten scenarios in this feature file',
    atWord: at(n, 'saving'),
    a: {name: 'one per scenario', color: 'orange'},
    b: {name: 'one for the run', color: 'green'},
    rows: [
      {label: 'launches', a: 'ten', b: 'one', winner: 'b', atWord: at(n, 'Ten')},
      {label: 'cost of scenario 10', a: 'the same again', b: 'nothing extra', winner: 'b',
       atWord: at(n, 'tenth')},
      {label: 'as you add tests', a: 'grows', b: 'flat', winner: 'b', atWord: at(n, 'commit')},
    ],
  }));
}


// ═══ CHAPTER 5 — the run, and the raw evidence ═══════════════════════════════
scenes.push(chapter(
  "Three files written. Let's run them and see all four outcomes at once.",
  5, 'The first run', 'and the files it leaves behind'));

{
  const n =
    "The command has four parts, and each one is doing a specific thing. " +
    "uv run means: run this inside the project's own environment, " +
    "using the packages we installed and no others. " +
    "python dash m behave means: run behave as a module — " +
    "which is how you run an installed tool without needing it on your PATH. " +
    "dash f, and then the name of a formatter, " +
    "chooses what gets written out as the run happens. " +
    "The formatter we name is the Allure one, which came from allure-behave. " +
    "And dash o names the folder it writes into. " +
    "Formatter and folder: those two flags are the entire integration. " +
    "There is no config file in this project, and nothing was registered anywhere.";
  scenes.push(stage(n, 'command-anatomy', {
    headline: 'One command, [four parts]',
    caption: 'the line we are about to run',
    premise: 'The command reads left to right, and each segment answers a different question. The bracket under a segment is its job.',
    color: 'green',
    atWord: 1,
    cells: [
      {label: 'uv run', sub: 'inside this project', color: 'green', atWord: at(n, 'environment')},
      {label: 'python -m behave', sub: 'run behave as a module', color: 'blue', atWord: at(n, 'module')},
      {label: '-f allure_behave.formatter:AllureFormatter', sub: 'what gets written out',
       color: 'purple', atWord: at(n, 'formatter')},
      {label: '-o allure-results-bdd', sub: 'where it writes', color: 'orange',
       atWord: at(n, 'folder', 2)},
    ],
  }));
}

{
  const n =
    "This command is longer than most, so let's read it. " +
    "uv run python dash m behave runs behave inside the project we made. " +
    "Dash f picks a formatter, and the formatter is the allure one — " +
    "that's the part that writes evidence instead of just printing to the screen. " +
    "Dash o says where to put it. " +
    "And features on the end is the folder to read tests from. " +
    "Now look at the last line. " +
    "Seven scenarios passed. One failed. One errored — that's our broken one, " +
    "and behave calls it an error while Allure calls it broken, same thing. " +
    "One skipped. " +
    "All four outcomes, from one run, and not one mention of Java in that output.";
  scenes.push(rec(n, 'all four outcomes, in one run',
    'behave running the ten scenarios, with the Allure formatter attached.',
    [A('behave', 'seven, one, one, one', {
       zooms: [{mark: 'tally', atWord: at(n, 'Seven')}],
       overlay: {kind: 'tally', atWord: at(n, 'four'), value: 4, label: 'outcomes, one run'},
       callouts: [{text: 'behave says error, Allure says broken', mark: 'tally', side: 'right',
                   color: 'orange', atWord: at(n, 'errored')}]})]));
}

{
  const n =
    "Read the last four lines of that output carefully, " +
    "because behave uses a word here that Allure does not. " +
    "It says one error, where Allure will say broken. " +
    "Same scenario, same cause, two different vocabularies, " +
    "and this trips people up constantly when they compare the two. " +
    "behave counts scenarios in the first line and steps in the second, " +
    "which is why the numbers look similar but do not match. " +
    "Seven scenarios passed. One failed. One errored. One skipped. " +
    "Ten scenarios, exactly as we planned twenty minutes ago, " +
    "and every one of those outcomes was written on purpose.";
  scenes.push(logs(n, {
    rate: 'end of run',
    highlight: 1,
    atWord: at(n, 'output'),
    lines: [
      {level: 'info', tag: 'scenarios', text: '7 passed, 1 failed, 1 error, 1 skipped',
       atWord: at(n, 'lines')},
      {level: 'warn', tag: 'error/broken', text: '1 error  ->  Allure will say broken',
       atWord: at(n, 'error')},
      {level: 'info', tag: 'steps', text: '27 passed, 1 failed, 1 error, 1 skipped',
       atWord: at(n, 'second')},
      {level: 'info', tag: 'took', text: 'ten scenarios, one shared browser',
       atWord: at(n, 'planned')},
    ],
  }));
}

{
  const n =
    "Before we build anything that looks nice, let's see what behave actually wrote. " +
    "Ten result files, one per scenario. " +
    "Then the attachments: four HTML snippets, " +
    "and one each of zip, yaml, xml, text, png, json, jpg and csv. " +
    "These are ordinary files sitting in a folder. " +
    "No database, no server, nothing running. " +
    "That's worth knowing, because it means anything that can read JSON " +
    "can build a report from this — including the script we're about to write.";
  scenes.push(rec(n, 'what behave actually wrote',
    'The results folder: one file per scenario, plus every attachment.',
    [A('rawcount', 'ten results, 13 files', {
       zooms: [{mark: 'results', atWord: at(n, 'Ten')}],
       callouts: [{text: 'plain files, nothing running', mark: null, side: 'top',
                   color: 'green', atWord: at(n, 'database')}]})]));
}

{
  const n =
    "Ten result files and thirteen attachment files, " +
    "and the arithmetic there rewards a second of attention. " +
    "Ten scenarios means ten result files — that one is easy. " +
    "The thirteen is nine attachments from the evidence scenarios, " +
    "plus the extra ones behave writes for the HTML snippets. " +
    "What matters is the shape: " +
    "the result files are small and describe what happened, " +
    "and the attachment files are large and hold the actual evidence. " +
    "Everything our report needs is in that folder. " +
    "No database, no server, no state anywhere else — " +
    "which is exactly why a plain Python script can read it.";
  scenes.push(table(n, {
    headline: 'Ten and thirteen, [in one folder]',
    tableName: 'allure-results-bdd',
    query: 'measured on this machine after the run',
    columns: ['what', 'how many', 'holds'],
    rows: [
      ['*-result.json', '10', 'one per scenario'],
      ['*-attachment.*', '13', 'evidence bytes'],
      ['anything else', '0', 'no server, no db'],
    ],
    highlight: [0, 1, 2],
    highlightAtWords: [at(n, 'Ten'), at(n, 'thirteen', 2), at(n, 'database')],
    atWord: at(n, 'rewards'),
  }));
}

{
  const n =
    "And here's the proof for everything I claimed at the start. " +
    "This pulls every status out of those files and shows each one once. " +
    "Broken. Failed. Passed. Skipped. " +
    "Four words, in the actual data, written by the library rather than by me. " +
    "The word broken is genuinely in there, " +
    "and now you've seen exactly which file it comes from.";
  scenes.push(rec(n, 'four outcomes, in the files themselves',
    'Every distinct status in the raw result files.',
    [A('statuses', 'four words, in the data', {
       zooms: [{mark: 'sbroken', atWord: at(n, 'Broken')}],
       callouts: [{text: 'written by the library, not by us', mark: 'sskipped',
                   side: 'right', color: 'green', atWord: at(n, 'library')}]})]));
}

{
  const n =
    "Four lines came back from that command, and that is the proof. " +
    "We asked the raw files for every distinct status value they contain, " +
    "and got exactly four: passed, failed, broken and skipped. " +
    "Not two. " +
    "And notice where the word broken appeared: " +
    "in the data, written by allure-behave, " +
    "even though behave itself printed the word error on screen. " +
    "The translation happened when the result file was written. " +
    "From here on, everything downstream — our report, " +
    "or the official Allure tool, or anything else that reads this folder — " +
    "sees four outcomes, because four is what is actually stored.";
  scenes.push(table(n, {
    headline: 'Four statuses, [in the raw JSON]',
    tableName: '*-result.json',
    query: 'sorted, unique — four lines back',
    columns: ['status', 'how many', 'means'],
    rows: [
      ['passed', '7', 'ran, was happy'],
      ['failed', '1', 'ran, said no'],
      ['broken', '1', 'fell over first'],
      ['skipped', '1', 'never ran'],
    ],
    highlight: [0, 1, 2, 3],
    highlightAtWords: [at(n, 'passed'), at(n, 'failed'), at(n, 'broken'), at(n, 'skipped')],
    atWord: at(n, 'proof'),
  }));
}

{
  const n =
    "And the two failure messages, side by side. " +
    "AssertionError — the check ran and refused what it got. " +
    "KeyError, on a header that was never there — the test fell over first. " +
    "That's the same distinction we drew earlier, " +
    "except now it's a message lifted out of a result file, " +
    "and you can see why one report line saying failed would have hidden it completely.";
  scenes.push(rec(n, 'two kinds of breakage, in the data',
    'The two distinct failure messages the run produced.',
    [A('messages', 'assertion, and exception', {
       zooms: [{mark: 'keymsg', atWord: at(n, 'KeyError')}],
       overlay: {kind: 'split', atWord: at(n, 'distinction'),
                 left: 'AssertionError', right: 'KeyError',
                 leftNote: 'your software was wrong',
                 rightNote: 'your test was wrong'},
       callouts: [{text: 'the check ran, and refused', mark: 'assertmsg', side: 'right',
                   color: 'red', atWord: at(n, 'refused')}]})]));
}

{
  const n =
    "Two messages, and they are the clearest illustration of the difference " +
    "you will see anywhere. " +
    "AssertionError came from a line we wrote deliberately — " +
    "we asked for text that was never on the page, and the check said no. " +
    "The software was asked a question and gave the wrong answer. " +
    "KeyError came from somewhere else entirely: " +
    "the test asked a dictionary for a key that was not there, " +
    "and Python stopped the function on the spot. " +
    "The software was never even asked. " +
    "One of these means fix the site. The other means fix the test. " +
    "And you can tell them apart without opening a single file, " +
    "because the report carries the distinction.";
  scenes.push(compare(n, {
    headline: 'Two errors, [two different jobs]',
    source: 'the message fields, read straight out of the result files',
    atWord: at(n, 'messages'),
    a: {name: 'AssertionError', color: 'red'},
    b: {name: 'KeyError', color: 'orange'},
    rows: [
      {label: 'Allure calls it', a: 'failed', b: 'broken', winner: 'tie',
       atWord: at(n, 'AssertionError')},
      {label: 'who is wrong', a: 'the software', b: 'the test', winner: 'tie',
       atWord: at(n, 'KeyError')},
      {label: 'what you do', a: 'fix the site', b: 'fix the test', winner: 'tie',
       atWord: at(n, 'site')},
    ],
  }));
}

{
  const n =
    "One more thing before we build the report: " +
    "the shape of a single result file, " +
    "because our script is about to read exactly these fields. " +
    "At the top, the name of the scenario and its status. " +
    "Then status details, which only exists when something went wrong, " +
    "and holds the message and the traceback. " +
    "Then a list of steps, each with its own name and status — " +
    "and each step can hold steps of its own. " +
    "And hanging off the steps, the attachments: " +
    "a name, a type, and the file name where the bytes live. " +
    "Five fields. That is the entire format we need to understand.";
  scenes.push(diagram(n, {
    nodes: [
      {id: 'r', label: 'result.json', sub: 'one per scenario', color: 'blue',
       atWord: at(n, 'shape')},
      {id: 'n', label: 'name + status', sub: 'what ran, how it went', color: 'green',
       parent: 'r', atWord: at(n, 'name')},
      {id: 'd', label: 'statusDetails', sub: 'message and trace', color: 'red',
       parent: 'r', atWord: at(n, 'details')},
      {id: 's', label: 'steps[]', sub: 'can hold more steps', color: 'purple',
       parent: 'r', atWord: at(n, 'steps')},
      {id: 'a', label: 'attachments[]', sub: 'name, type, file name', color: 'orange',
       parent: 's', atWord: at(n, 'attachments')},
    ],
  }));
}

// ═══ CHAPTER 6 — our own report builder ══════════════════════════════════════
scenes.push(chapter(
  "Now our own report builder — one Python file that replaces the Java tool entirely.",
  6, 'Our own report builder', 'from JSON files to one HTML page'));

{
  const n =
    "So here is the whole pipeline, now that both halves exist. " +
    "behave runs the English and calls your Python. " +
    "allure-behave listens and writes result files into a folder. " +
    "That folder is the handover point, " +
    "and it is the reason the next part is possible at all. " +
    "Normally you would now hand that folder to the official Allure tool, " +
    "which is a Java program, and get a report out of it. " +
    "We are going to hand it to a Python script instead. " +
    "Same folder, same files, different reader. " +
    "Nothing we wrote in the last three files changes by one character.";
  scenes.push(diagram(n, {
    nodes: [
      {id: 'b', label: 'behave', sub: 'runs the English', color: 'blue',
       atWord: at(n, 'behave')},
      {id: 'f', label: 'allure-behave', sub: 'writes the results', color: 'purple',
       parent: 'b', atWord: at(n, 'listens')},
      {id: 'dir', label: 'allure-results-bdd', sub: 'the handover point', color: 'green',
       parent: 'f', atWord: at(n, 'handover')},
      {id: 'java', label: 'the official tool', sub: 'Java — what we avoid', color: 'orange',
       parent: 'dir', atWord: at(n, 'Java')},
      {id: 'ours', label: 'our Python script', sub: 'same folder, new eyes', color: 'green',
       parent: 'dir', atWord: at(n, 'instead')},
    ],
  }));
}

{
  const n =
    "Last file of the four, and it is comfortably the biggest one. " +
    "Open it, and give it a second to settle. " +
    "It opens with a docstring — that's the block of text in triple quotes " +
    "at the top of a Python file — and this one is doing real work. " +
    "It says what the script is, and then what the script deliberately avoids. " +
    "No Java. No Node. No report generator binary of any kind. " +
    "Just the Python standard library, " +
    "reading the exact same result files the Allure formatter already wrote to disk. " +
    "That is the promise of this whole chapter, stated in six lines of English. " +
    "Underneath it come the imports, and every one of them earns its place: " +
    "argparse for the command line, base sixty four for turning pictures into text, " +
    "csv for reading the timing table, html for escaping, " +
    "io for the in-memory buffers, json for the result files, " +
    "and Path for walking the folder. " +
    "Seven imports, and every single one ships with Python itself.";
  scenes.push(rec(n, 'what this script is for',
    'The report builder, and the rule stated at the top of it.',
    [A('openrpt', 'the last file'),
     A('rpt1', 'a docstring, and a promise', {wantAtWord: at(n, 'real')}),
     A('rpt2', 'seven built-in imports', {wantAtWord: at(n, 'imports')})]));
}

{
  const n =
    "load results is the first function, and it is short. " +
    "It walks the results folder, " +
    "opens every file whose name ends in result dot json, " +
    "and reads each one into a Python dictionary. " +
    "glob is the pattern matcher — the star means any characters at all. " +
    "Then it sorts them by their start time, " +
    "so the report lists the scenarios in the order they ran, " +
    "rather than the order the folder happened to hand them over in. " +
    "Ten files in, ten dictionaries out.";
  scenes.push(rec(n, 'read every result file',
    'Loading the ten result files into memory.',
    [A('rpt3', 'ten files, ten dicts', {wantAtWord: at(n, 'glob')})]));
}

{
  const n =
    "Three steps, and each one is a single line of Python. " +
    "glob turns a folder and a pattern into a list of file paths. " +
    "json dot load turns one of those files into a dictionary — " +
    "keys and values you can reach into with square brackets. " +
    "And sort puts them in the order they started. " +
    "That middle step is the important one to internalise: " +
    "the moment json dot load runs, " +
    "you are no longer dealing with a file at all. " +
    "You have an ordinary Python dictionary, " +
    "and everything you already know about dictionaries applies.";
  scenes.push(layers(n, {
    headline: 'From folder [to dictionaries]',
    atWord: at(n, 'steps'),
    layers: [
      {label: 'a sorted list of results', sub: 'oldest first', color: 'green',
       atWord: at(n, 'sort')},
      {label: 'json.load', sub: 'file becomes a dictionary', color: 'purple',
       atWord: at(n, 'dictionary')},
      {label: 'glob("*-result.json")', sub: 'folder becomes paths', color: 'blue',
       atWord: at(n, 'glob')},
    ],
  }));
}

{
  const n =
    "render attachment is where the rule lives. " +
    "First it works out three things: where the file is, " +
    "what type it claims to be, and what to call it on the page. " +
    "Then a guard — if the file is missing, " +
    "say so on the page instead of crashing. " +
    "A report that builds with one honest gap in it " +
    "is far more useful than a report that refuses to build at all. " +
    "Then it reads the bytes, and asks the first question. " +
    "Does this type start with image slash? " +
    "Every image type does — image slash png, image slash jpeg, " +
    "image slash gif, image slash webp — " +
    "so this one line covers formats we haven't even used. " +
    "The question after it is CSV, " +
    "and look at what it does: it parses the rows " +
    "and builds a real HTML table out of them, " +
    "so the timing table arrives as a table rather than three lines of commas. " +
    "Now come back to the image branch for a second, " +
    "because there's one idea in there to slow down for. " +
    "base sixty four is a way of writing binary data " +
    "using only ordinary letters and numbers. " +
    "That is what lets an entire screenshot live inside the HTML file itself, " +
    "instead of sitting beside it as a separate file, " +
    "and it is the reason the report you open at the end " +
    "is one single page you can email to somebody.";
  scenes.push(rec(n, 'is it a picture?',
    'One check that covers every image format, and how the picture gets inside the page.',
    [A('rpt4', 'one line, every image', {
       callouts: [{text: 'one file, pictures included', mark: null, side: 'top',
                   color: 'purple', atWord: at(n, 'email')}]})]));
}

{
  const n =
    "The base sixty four idea deserves its own picture, " +
    "because it is what makes a single-file report possible. " +
    "A PNG on disk is binary — bytes that mean nothing as text. " +
    "base sixty four rewrites those bytes " +
    "using sixty four ordinary characters: letters, digits and two symbols. " +
    "The result is about a third larger, and it is safe to put anywhere text goes. " +
    "Then we write it into an img tag as a data URI — " +
    "which is a way of saying, the picture is not somewhere else, it is right here. " +
    "The browser decodes it and draws it. " +
    "The cost is a bigger file. " +
    "The benefit is a report you can attach to an email and send to somebody " +
    "with no folder of images travelling beside it.";
  scenes.push(diagram(n, {
    nodes: [
      {id: 'png', label: 'screenshot bytes', sub: 'binary, on disk', color: 'purple',
       atWord: at(n, 'binary')},
      {id: 'b64', label: 'base64', sub: 'same bytes, as text', color: 'blue',
       parent: 'png', atWord: at(n, 'rewrites')},
      {id: 'uri', label: 'data: URI', sub: 'the picture, inline', color: 'orange',
       parent: 'b64', atWord: at(n, 'URI')},
      {id: 'one', label: 'one HTML file', sub: 'travels on its own', color: 'green',
       parent: 'uri', atWord: at(n, 'email')},
    ],
  }));
}

{
  const n =
    "HTML gets its own branch — escaped, and shown inside a pre block, " +
    "so the page snippet appears as code " +
    "instead of being rendered as part of our own report. " +
    "That escaping matters more than it looks. " +
    "We captured a chunk of somebody else's HTML, " +
    "and if we dropped it into our page unescaped " +
    "their markup would become part of our report — " +
    "their headings, their styles, possibly their scripts. " +
    "Escaping turns their angle brackets into ordinary characters, " +
    "so their page is shown rather than run. " +
    "And then the interesting one. " +
    "Read the comment above it, because it explains a trap that catches people. " +
    "You would expect every text-shaped thing " +
    "to have a type starting with the word text. " +
    "Plain text does. HTML does. CSV does. " +
    "But JSON is application slash json. " +
    "XML is application slash xml. YAML is application slash yaml. " +
    "All three are perfectly readable text, " +
    "and all three would fall straight past a check " +
    "that only looks for types beginning with text slash. " +
    "So the code keeps a small set of those three application types " +
    "and asks: does the type start with text slash, or is it one of these? " +
    "If yes, decode it and show it. " +
    "And if the answer is no — which for us means the zip file, and only the zip file — " +
    "the code refuses to guess. It writes a download link instead. " +
    "Showing a zip as text gives you a screenful of garbage characters, " +
    "and a link that opens is worth more than a preview that lies. " +
    "So: two questions, and then a third branch " +
    "that is really an honest admission — some things cannot be previewed, " +
    "and the useful thing to do with them is hand them over intact.";
  scenes.push(rec(n, 'is it text? otherwise, a link',
    'The second question, and the fallback for anything that is neither.',
    [A('rpt5', 'text, or an honest link', {
       zooms: [{mark: 'download', atWord: at(n, 'guess')}],
       callouts: [{text: 'a working link beats a garbled preview', mark: 'download',
                   side: 'right', color: 'orange', atWord: at(n, 'lies')},
                  {text: 'hand it over intact', mark: null, side: 'top',
                   color: 'blue', atWord: at(n, 'intact')}]})]));
}

{
  const n =
    "This is the table that explains that extra line of code. " +
    "On the left, the type as it appears in the result file. " +
    "On the right, whether a check for text slash would catch it. " +
    "Plain text, HTML and CSV all begin with text slash, so they are caught. " +
    "JSON, XML and YAML begin with application slash, so they are missed, " +
    "even though every one of them is text a person can read. " +
    "And the zip is application slash zip and genuinely is not text. " +
    "So the rule cannot be a simple prefix check, " +
    "and it cannot be a list of twenty types either. " +
    "It is a prefix check plus three named exceptions, " +
    "which is the smallest thing that gets all nine right.";
  scenes.push(table(n, {
    headline: 'Why the prefix check [is not enough]',
    tableName: 'nine attachments',
    query: 'does it start with text/ ?',
    columns: ['type', 'text/ prefix', 'readable'],
    rows: [
      ['text/plain', 'yes', 'yes'],
      ['text/html', 'yes', 'yes'],
      ['text/csv', 'yes', 'yes'],
      ['application/json', 'no', 'yes'],
      ['application/xml', 'no', 'yes'],
      ['application/zip', 'no', 'no'],
    ],
    highlight: [3, 4, 5],
    highlightAtWords: [at(n, 'JSON'), at(n, 'missed'), at(n, 'zip')],
    atWord: at(n, 'table'),
  }));
}

{
  const n =
    "Now the rule, drawn. " +
    "An attachment arrives. Question one: does its type start with image slash? " +
    "Yes — it gets shown as a picture, and the PNG and the JPEG both take that route " +
    "without the code ever knowing which is which. " +
    "No — question two: is it text-shaped? " +
    "Yes for text, HTML, CSV, JSON, XML and YAML — all six shown as readable text. " +
    "And no for the zip, which takes the third route and comes out as a download link. " +
    "Two questions. Three outcomes. Nine kinds of evidence handled, " +
    "and it would handle the other eleven the same way.";
  scenes.push(stage(n, 'attachment-router', {
    headline: 'Two questions, [three fates]',
    caption: 'no lookup table anywhere',
    premise: 'Every attachment enters here. The first question sorts out pictures, the second sorts out anything readable, and whatever is left gets a link.',
    color: 'orange',
    atWord: 1,
    cells: [
      {label: 'image/png', text: 'image', atWord: at(n, 'picture')},
      {label: 'image/jpeg', text: 'image', atWord: at(n, 'JPEG')},
      {label: 'text/plain', text: 'text', atWord: at(n, 'readable')},
      {label: 'text/html', text: 'text', atWord: at(n, 'HTML')},
      {label: 'text/csv', text: 'text', atWord: at(n, 'CSV')},
      {label: 'application/json', text: 'text', atWord: at(n, 'JSON')},
      {label: 'application/xml', text: 'text', atWord: at(n, 'XML')},
      {label: 'application/x-yaml', text: 'text', atWord: at(n, 'YAML')},
      {label: 'application/zip', text: 'download', atWord: at(n, 'zip')},
    ],
  }));
}

{
  const n =
    "And here is every attachment we produced, " +
    "with the route each one takes through that rule. " +
    "The PNG and the JPEG go down the image branch and come out as pictures. " +
    "The headers and the HTML snippet and the three summaries " +
    "go down the text branch and come out readable. " +
    "The CSV takes its own branch and comes out as a table. " +
    "And the zip falls through everything and comes out as a link. " +
    "Nine pieces of evidence, four routes, " +
    "and not one line of code that mentions any of them by name.";
  scenes.push(table(n, {
    headline: 'Nine attachments, [four routes]',
    tableName: 'the routes',
    query: 'no lookup table anywhere in the code',
    columns: ['evidence', 'route', 'shown as'],
    rows: [
      ['PNG, JPEG', 'image branch', 'a picture'],
      ['CSV', 'csv branch', 'an HTML table'],
      ['headers + 4 more', 'text branch', 'readable text'],
      ['ZIP', 'fallback', 'a download link'],
    ],
    highlight: [0, 1, 2, 3],
    highlightAtWords: [at(n, 'PNG'), at(n, 'CSV'), at(n, 'text'), at(n, 'zip')],
    atWord: at(n, 'route'),
  }));
}

{
  const n =
    "render step draws one step of a scenario. " +
    "It takes the step's name and its status and puts them in a row. " +
    "It gathers that step's attachments " +
    "by calling the attachment function we just wrote. " +
    "And then look at the last part: it calls itself. " +
    "A step in Allure can contain other steps inside it, " +
    "nested as deep as the test wants to go, " +
    "and a function that calls itself is how you draw a shape " +
    "when you don't know in advance how deep it goes. " +
    "That's recursion, and this is one of the few everyday places " +
    "where it is genuinely the simplest answer rather than a clever one. " +
    "The depth argument goes up by one each time it descends a level, " +
    "and min depth three stops the indentation from marching " +
    "off the right hand edge of the page on a deeply nested test.";
  scenes.push(rec(n, 'one step, and the steps inside it',
    'A function that draws a step, then draws whatever is nested inside it.',
    [A('rpt6', 'it calls itself', {wantAtWord: at(n, 'row'),
       callouts: [{text: 'depth becomes indentation', mark: null, side: 'top',
                   color: 'blue', atWord: at(n, 'edge')}]})]));
}

{
  const n =
    "Recursion is the one idea in this chapter " +
    "that is genuinely hard the first time, so here it is drawn. " +
    "A scenario has steps. A step can have steps inside it. " +
    "Those steps can have steps inside them. " +
    "You cannot write a loop for that, " +
    "because you would have to know in advance how many levels deep to go. " +
    "So instead the function handles one step, " +
    "and for each step inside it, calls itself with depth plus one. " +
    "It stops on its own, because eventually a step has no children " +
    "and the loop over them runs zero times. " +
    "That is the part people worry about: " +
    "the ending is not something you write, it is something the data provides.";
  scenes.push(diagram(n, {
    nodes: [
      {id: 'd0', label: 'a step', sub: 'depth 0 — no indent', color: 'blue',
       atWord: at(n, 'scenario')},
      {id: 'd1', label: 'a step inside it', sub: 'depth 1 — 20px in', color: 'purple',
       parent: 'd0', atWord: at(n, 'inside')},
      {id: 'd2', label: 'one inside that', sub: 'depth 2 — 40px in', color: 'orange',
       parent: 'd1', atWord: at(n, 'them')},
      {id: 'end', label: 'no children', sub: 'loop runs zero times', color: 'green',
       parent: 'd2', atWord: at(n, 'children')},
    ],
  }));
}

{
  const n =
    "render test draws one whole scenario: " +
    "the name, a badge saying what happened, and every step underneath it. " +
    "Watch how the badge gets its colour. " +
    "The status word itself becomes part of a CSS class name, " +
    "so a scenario with status passed gets the class for passed, " +
    "and the stylesheet gives that class its green. " +
    "There is no table anywhere mapping statuses to colours — " +
    "the data names its own class. " +
    "Between the heading and the steps sits the failure box, " +
    "and it is built only when there is something to put in it. " +
    "status details is the field we read straight out of the raw JSON earlier, " +
    "the one holding AssertionError and KeyError. " +
    "If a result carries it, we show the message and the trace. " +
    "If it doesn't, the variable stays an empty string " +
    "and the page gets nothing extra at all — " +
    "rather than an empty red box sitting under every passing test, " +
    "which is exactly the sort of detail " +
    "that makes people quietly stop trusting a report.";
  scenes.push(rec(n, 'one test, its badge, its message',
    'The scenario header, where its colour comes from, and the box that only sometimes exists.',
    [A('rpt7', 'status names its class', {wantAtWord: at(n, 'badge'),
       callouts: [{text: 'an empty box under a passing test costs you trust',
                   mark: null, side: 'top', color: 'green',
                   atWord: at(n, 'trusting')}]})]));
}

{
  const n =
    "The status word doing double duty gets its own slide, " +
    "because it is a technique you can lift straight out of here. " +
    "The word passed arrives in the data. " +
    "We drop it into the class attribute of the element. " +
    "The stylesheet already has a rule for that class name, " +
    "and the rule sets a colour. " +
    "So the data chose the colour, and no Python decided anything. " +
    "The alternative is a dictionary in the code " +
    "mapping four status words to four colour codes, " +
    "and then a fifth status arrives one day and quietly gets no colour. " +
    "Let the data name the class, " +
    "and the only place you touch is the stylesheet.";
  scenes.push(layers(n, {
    headline: 'The data [names its own class]',
    atWord: at(n, 'duty'),
    layers: [
      {label: '"status": "passed"', sub: 'from the result file', color: 'blue',
       atWord: at(n, 'arrives')},
      {label: 'class="badge passed"', sub: 'dropped straight in', color: 'purple',
       atWord: at(n, 'attribute')},
      {label: '.badge.passed → green', sub: 'the stylesheet decides', color: 'green',
       atWord: at(n, 'colour')},
    ],
  }));
}

{
  const n =
    "Now the page itself, and it starts with something " +
    "that trips up almost everybody the first time. " +
    "PAGE TEMPLATE is an ordinary Python string " +
    "that we are going to call format on later, " +
    "and format treats curly braces as placeholders. " +
    "Title in braces means: put the title here. " +
    "But CSS is made of curly braces. " +
    "Every rule in a stylesheet opens with one and closes with one. " +
    "So every literal brace in here has to be written twice: " +
    "two open braces to mean one, two closing braces to mean one. " +
    "Copy some CSS into a format string and forget that, " +
    "and Python throws a KeyError at you naming a CSS property, " +
    "with an error message that gives you no hint about what is really wrong. " +
    "Learn this the first time rather than the third. " +
    "Now the style itself. " +
    "A dark strip across the top, a light grey page behind it, " +
    "and each test drawn as a white card with a soft shadow, " +
    "so the tests read as separate objects rather than one long wall of text. " +
    "And look at the colours defined here: green, red, amber, grey. " +
    "One for passed, one for failed, one for broken, one for skipped, " +
    "and that is the entire palette of this report. " +
    "Each card also gets a thick coloured stripe " +
    "down its left hand edge in the same colour. " +
    "That stripe is the reason you can scroll this report at speed " +
    "and still know how a test went " +
    "from the corner of your eye, before you have read a single word of it.";
  scenes.push(rec(n, 'a template, and four colours',
    'The page template, the doubled braces it needs, and one colour per outcome.',
    [A('rpt8', 'two braces to mean one', {wantAtWord: at(n, 'braces'),
       callouts: [{text: 'one colour per outcome, and no others',
                   mark: null, side: 'top', color: 'blue',
                   atWord: at(n, 'stripe', 2)}]})]));
}

{
  const n =
    "The doubled brace catches everybody once, " +
    "so let us make it concrete. " +
    "In a format string, a single open brace starts a placeholder, " +
    "and Python expects a name after it. " +
    "Body in single braces means: substitute the body here. " +
    "But a CSS rule opens with a brace and a space, " +
    "and Python reads that as a placeholder with a broken name. " +
    "Doubling it tells Python: this is a literal brace, leave it alone. " +
    "So placeholders stay single, and every piece of real CSS gets doubled. " +
    "That is the entire rule, " +
    "and it is why the stylesheet you are looking at is full of double braces " +
    "when the finished page has ordinary single ones.";
  scenes.push(compare(n, {
    headline: 'One brace, [or two]',
    source: 'str.format in Python — braces are placeholders',
    atWord: at(n, 'concrete'),
    a: {name: 'single brace', color: 'blue'},
    b: {name: 'doubled brace', color: 'green'},
    rows: [
      {label: 'what Python sees', a: 'a placeholder', b: 'a real brace', winner: 'tie',
       atWord: at(n, 'placeholder')},
      {label: 'use it for', a: '{title} {body}', b: 'CSS rules', winner: 'tie',
       atWord: at(n, 'CSS')},
      {label: 'get it wrong', a: 'KeyError', b: 'renders fine', winner: 'b',
       atWord: at(n, 'doubled')},
    ],
  }));
}

{
  const n =
    "The rest of the stylesheet, " +
    "and this is where the report stops looking like a homework exercise. " +
    "First the badges — those little pill shapes beside each status. " +
    "The same four colours as before, " +
    "and notice they are defined once for the test badge and the step badge together, " +
    "on a single line. " +
    "A step and a scenario with the same status " +
    "can therefore never disagree about what green means, " +
    "because there is only one place where green is written down. " +
    "Then the steps themselves. " +
    "Depth one gets twenty pixels of left margin. Depth two gets forty. " +
    "Remember the recursion we wrote a few minutes ago, " +
    "where depth went up by one every time the function went a level deeper? " +
    "This is where that number turns into something you can actually see. " +
    "Nesting in the data becomes indentation on the page, " +
    "and the entire mechanism is two lines of CSS " +
    "plus one argument in a Python function. " +
    "Then the attachments, and three small decisions to stop on. " +
    "The first: images get max width one hundred percent. " +
    "That means a full page screenshot two thousand pixels tall " +
    "shrinks to fit inside its card, " +
    "instead of tearing the layout apart and pushing everything sideways. " +
    "The second: the pre blocks get overflow x auto. " +
    "One very long line of JSON — and minified JSON is one enormous line — " +
    "scrolls inside its own box, " +
    "rather than stretching the whole page out to the width of that line. " +
    "The third: the download link is styled as a bordered, rounded rectangle " +
    "with a colour change when you hover over it, " +
    "because a link that is about to hand somebody a zip file " +
    "should look like a button rather than like a word in a sentence. " +
    "And last, the failure box: a soft red background, " +
    "a darker red for the message itself, " +
    "and the traceback underneath with white space pre wrap, " +
    "so a Python traceback keeps its line breaks " +
    "instead of collapsing into one long unreadable paragraph. " +
    "Read all of that again as a group and you will see a pattern. " +
    "None of it is decoration. " +
    "Every single rule in this stylesheet exists " +
    "because without it something specific and identifiable looks wrong, " +
    "and that is a reasonable test to apply to any stylesheet you write.";
  scenes.push(rec(n, 'the rest of the stylesheet',
    'Badges, indentation, and three rules that each fix one specific problem.',
    [A('rpt9', 'depth becomes indent', {wantAtWord: at(n, 'badges'),
       callouts: [{text: 'every rule fixes something specific',
                   mark: null, side: 'top', color: 'green',
                   atWord: at(n, 'decoration')}]})]));
}

{
  const n =
    "Three of those rules deserve remembering by name, " +
    "because each one prevents a specific ugly thing " +
    "that you will otherwise meet in your own reports. " +
    "Max width on images stops a tall screenshot from breaking the layout. " +
    "Overflow on a pre block stops one long line " +
    "from stretching the whole page sideways. " +
    "And white space pre wrap on the traceback " +
    "stops a stack trace from collapsing into a paragraph. " +
    "Three problems, three lines. " +
    "If you ever write a report by hand and something looks wrong, " +
    "there is a decent chance it is one of these three.";
  scenes.push(stage(n, 'rule-fix', {
    headline: 'Three rules, [three repairs]',
    caption: 'each one prevents something',
    premise: 'On the left, the shape that overflows its box. The rule lands, and the shape fits.',
    color: 'blue',
    atWord: 1,
    cells: [
      {label: 'max-width: 100%', sub: 'the screenshot that broke the layout',
       color: 'blue', atWord: at(n, 'Max')},
      {label: 'overflow-x: auto', sub: 'the line that stretched the page',
       color: 'purple', atWord: at(n, 'Overflow')},
      {label: 'white-space: pre-wrap', sub: 'the traceback that became a paragraph',
       color: 'green', atWord: at(n, 'traceback')},
    ],
  }));
}

{
  const n =
    "And then the page's actual skeleton, which is refreshingly short. " +
    "A header with the title in it, " +
    "then four spans — passed, failed, broken, skipped — " +
    "each one holding a placeholder that gets filled in with a number. " +
    "Then main, and inside it a single placeholder called body, " +
    "which is where every rendered test will land. " +
    "That is the whole document. " +
    "Everything else you will see in the finished report " +
    "is generated by the functions we already wrote " +
    "and poured into that one gap.";
  scenes.push(rec(n, 'the shell of the page',
    'A header, four counts, and one placeholder for everything else.',
    [A('rpt10', 'four counts and one gap', {wantAtWord: at(n, 'header'),
       callouts: [{text: 'every test lands in this one placeholder', mark: null,
                   side: 'top', color: 'purple', atWord: at(n, 'gap')}]})]));
}

{
  const n =
    "The finished document has three parts, and that is all. " +
    "A header holding the title and the four counts. " +
    "A main section holding one card per scenario. " +
    "And a stylesheet, sitting inside the page rather than beside it. " +
    "That last point is what makes this a single file. " +
    "No linked stylesheet, no folder of images, no scripts. " +
    "One HTML file that you can email, " +
    "attach to a ticket, or open on a machine with no network — " +
    "and it looks the same as it did on yours.";
  scenes.push(layers(n, {
    headline: 'Three parts, [one file]',
    atWord: at(n, 'parts'),
    layers: [
      {label: 'header', sub: 'title and four counts', color: 'blue', atWord: at(n, 'header')},
      {label: 'main', sub: 'one card per scenario', color: 'green', atWord: at(n, 'main')},
      {label: '<style> inline', sub: 'no linked files at all', color: 'purple',
       atWord: at(n, 'stylesheet')},
    ],
  }));
}

{
  const n =
    "build report ties it all together, " +
    "and there is a real lesson buried in the middle of it. " +
    "It loads the results, and if it found none " +
    "it stops with a clear message rather than writing an empty page. " +
    "Then it counts. Four counters, one per outcome, " +
    "each one a sum over the results with a condition attached. " +
    "That pattern — sum one for each item where something is true — " +
    "is the shortest way to count matching things in Python. " +
    "Then it renders every test into the body, " +
    "drops the counts and the body into the page template, " +
    "writes the file, and prints a one line summary. " +
    "Now the lesson. " +
    "An earlier version of this script had two counters: passed and failed. " +
    "It ran without complaining. " +
    "It produced a page that looked completely fine. " +
    "And it quietly reported the wrong total, " +
    "because broken and skipped had nowhere to be counted " +
    "and simply vanished from the summary. " +
    "That is the failure mode of a homemade report — " +
    "it doesn't crash, it just tells you less than the truth. " +
    "Four outcomes in the data means four counters in the code.";
  scenes.push(rec(n, 'count all four, not two',
    'The counting, and the bug that hides when you only count two things.',
    [A('rpt11', 'one counter per outcome', {wantAtWord: at(n, 'counts'),
       zooms: [{mark: 'counts', atWord: at(n, 'lesson', 2)}],
       callouts: [{text: 'two counters lose two outcomes', mark: 'counts',
                   side: 'right', color: 'red', atWord: at(n, 'vanished')}]})]));
}

{
  const n =
    "Let me show you the two-counter bug as numbers, " +
    "because that is how it hides. " +
    "With two counters, the header reads seven passed and one failed. " +
    "Eight. And the run had ten scenarios in it. " +
    "The two missing ones did not error, did not warn, " +
    "and did not appear anywhere on the page. " +
    "They were simply absent, " +
    "and the report looked completely healthy while being wrong. " +
    "With four counters the numbers add up to ten, " +
    "and any mismatch between the sum and the total is visible immediately. " +
    "That is why the last line of our script prints the total as well: " +
    "so the report can be checked against itself.";
  scenes.push(table(n, {
    headline: 'Eight, [out of ten]',
    tableName: 'two counters vs four',
    query: 'the same run, counted two ways',
    columns: ['counters', 'header shows', 'scenarios run'],
    rows: [
      ['passed, failed', '8', '10'],
      ['all four', '10', '10'],
    ],
    highlight: [0, 1],
    highlightAtWords: [at(n, 'Eight'), at(n, 'mismatch')],
    atWord: at(n, 'show'),
  }));
}

{
  const n =
    "And main, which is the command line part. " +
    "argparse is Python's built-in way of reading arguments. " +
    "One required argument, the results folder. " +
    "Two optional ones with defaults, for the output name and the title — " +
    "which is why in a moment we can leave them both out and it still works. " +
    "Then the if name equals main line at the bottom, " +
    "which means: only run this when the file is executed directly, " +
    "and stay quiet when something else imports it. " +
    "Save the file. " +
    "That is every line of code in this chapter — " +
    "four files, four hundred and ninety eight lines, " +
    "all of it typed in front of you.";
  scenes.push(rec(n, 'the command line entry point',
    'argparse, and the line that makes a file both runnable and importable.',
    [A('rpt12', 'one required, two optional', {wantAtWord: at(n, 'argparse'),
       callouts: [{text: 'runnable, and importable', mark: null, side: 'top',
                   color: 'purple', atWord: at(n, 'imports')}]}),
     A('savertp', 'saved')]));
}

{
  const n =
    "Four files, and that is the whole chapter on disk. " +
    "The feature file, ten scenarios in English, fifty lines. " +
    "The steps file, the Python behind those sentences, a hundred and eighty five lines. " +
    "The environment file, the browser lifecycle, eighteen lines. " +
    "And the report builder, two hundred and forty five lines. " +
    "Just under five hundred lines in total, " +
    "and you watched every one of them get typed. " +
    "Nothing was downloaded, nothing was scaffolded, " +
    "and there is no generated file anywhere in this project " +
    "except the ones the run produced.";
  scenes.push(tree(n, {
    headline: 'Four files, [498 lines]',
    atWord: at(n, 'files'),
    highlight: 4,
    nodes: [
      {name: 'features', depth: 0, kind: 'folder', color: 'blue', atWord: at(n, 'disk')},
      {name: 'homepage_checks.feature', depth: 1, kind: 'file', color: 'blue',
       atWord: at(n, 'feature')},
      {name: 'steps', depth: 1, kind: 'folder', color: 'purple', atWord: at(n, 'steps')},
      {name: 'homepage_steps.py', depth: 2, kind: 'file', color: 'purple',
       atWord: at(n, 'sentences')},
      {name: 'environment.py', depth: 1, kind: 'file', color: 'orange',
       atWord: at(n, 'lifecycle')},
      {name: 'build_simple_html_report.py', depth: 0, kind: 'file', color: 'green',
       atWord: at(n, 'builder')},
    ],
  }));
}

// ═══ CHAPTER 7 — the payoff ══════════════════════════════════════════════════
scenes.push(chapter(
  "Everything is written. Let's build the report and see what we made.",
  7, 'The report', 'one file, everything inside it'));

{
  const n =
    "Before we run it, decide what you expect to see, " +
    "because a prediction you got wrong teaches you more than one you got right. " +
    "The header should say seven passed, one failed, one broken, one skipped. " +
    "Every scenario should have its steps listed underneath it. " +
    "The two screenshots should appear as pictures, not as links. " +
    "The timing rows should appear as a table with borders. " +
    "The three summaries should be readable as text. " +
    "And the zip should be the only thing on the page that is a link. " +
    "Five predictions. Let us see how many hold.";
  scenes.push(list(n, 'What should be on the page', [
    {text: '7 / 1 / 1 / 1 in the header', atWord: at(n, 'header')},
    {text: 'both images drawn inline', atWord: at(n, 'pictures')},
    {text: 'the CSV as a real table', atWord: at(n, 'borders')},
    {text: 'the summaries as text', atWord: at(n, 'readable')},
    {text: 'the zip, and only the zip, a link', atWord: at(n, 'link')},
  ]));
}

{
  const n =
    "We point the script at the results folder, give it a title, and run it. " +
    "The output name has a sensible default, so we can leave it out. " +
    "And there's the line that matters: " +
    "seven passed, one failed, one broken, one skipped, ten total. " +
    "Four counts, each separate, adding up correctly. " +
    "Compare that to the run from earlier and every number agrees. " +
    "Then look at the file — nearly a megabyte, " +
    "and that's because both screenshots are inside it. " +
    "One file. You could email this to somebody " +
    "and they'd see every screenshot, every table and every message, " +
    "with nothing to install.";
  scenes.push(rec(n, 'four counts, and one file',
    'Building the report, and the size of what comes out.',
    [A('build', 'seven, one, one, one, ten', {
       zooms: [{mark: 'tally2', atWord: at(n, 'seven')}],
       overlay: {kind: 'rows', atWord: at(n, 'agrees'),
                 rows: [{text: 'behave said: 7 passed, 1 failed, 1 error, 1 skipped', state: 'kept'},
                        {text: 'our report says: 7 passed, 1 failed, 1 broken, 1 skipped', state: 'kept'},
                        {text: 'ten scenarios, counted four ways', state: 'new'}]},
       callouts: [{text: 'every number agrees with the run', mark: 'tally2', side: 'right',
                   color: 'green', atWord: at(n, 'Compare')}]}),
     A('size', 'both screenshots inside', {wantAtWord: at(n, 'megabyte')})]));
}

{
  const n =
    "There it is, and every prediction held. " +
    "Seven passed, one failed, one broken, one skipped, ten total — " +
    "the same four numbers behave reported, " +
    "with the one word that changed along the way. " +
    "And the file is just under a megabyte, " +
    "which deserves a moment of thought. " +
    "Almost all of that is the two screenshots, " +
    "written into the page as base sixty four. " +
    "That is the price of a single file, " +
    "and for a report you attach to an email it is a price worth paying. " +
    "If it ever became a problem, " +
    "the fix is one branch in render attachment: write images beside the page instead. " +
    "You now know exactly where that change would go.";
  scenes.push(table(n, {
    headline: 'The finished report, [measured]',
    tableName: 'the report file',
    query: 'the numbers this run actually produced',
    columns: ['what', 'value', 'from'],
    rows: [
      ['passed', '7', 'the result files'],
      ['failed/broken/sk', '1 / 1 / 1', 'the result files'],
      ['total scenarios', '10', 'ten result files'],
      ['file size', '~1 MB', 'mostly images'],
    ],
    highlight: [0, 1, 2, 3],
    highlightAtWords: [at(n, 'Seven'), at(n, 'skipped'), at(n, 'total'), at(n, 'megabyte')],
    atWord: at(n, 'held'),
  }));
}

{
  const n =
    "So how does this compare with the official Allure report? " +
    "Honestly, and it matters that I am honest about it: " +
    "the official one is better looking, " +
    "and it has history, trends, retries and a search box that ours does not. " +
    "If you have Java on your machine and you want all of that, use it. " +
    "What ours gives you is different. " +
    "It needs no Java runtime. " +
    "It is two hundred and forty five lines you can read in one sitting. " +
    "When it shows you something odd, you can go and find the line responsible. " +
    "And it produces one file rather than a folder of them. " +
    "For learning what is actually in these result files, " +
    "reading a script you wrote beats reading a tool you did not.";
  scenes.push(compare(n, {
    headline: 'The official tool, [and ours]',
    source: 'Allure Report — qameta.io, and the script in this chapter',
    atWord: at(n, 'compare'),
    a: {name: 'official Allure', color: 'orange'},
    b: {name: 'our script', color: 'green'},
    rows: [
      {label: 'needs Java', a: 'yes', b: 'no', winner: 'b', atWord: at(n, 'Java')},
      {label: 'trends and history', a: 'yes', b: 'no', winner: 'a', atWord: at(n, 'history')},
      {label: 'lines you can read', a: 'a big codebase', b: '245 lines', winner: 'b',
       atWord: at(n, 'lines')},
      {label: 'output', a: 'a folder', b: 'one file', winner: 'b', atWord: at(n, 'sitting')},
    ],
  }));
}

{
  const n =
    "And those last two lines the script prints are not decoration either. " +
    "The first says Report written to, with the full path, " +
    "so you can open it without hunting. " +
    "And it repeats the counts, " +
    "so if you are watching this scroll past in a build log " +
    "you can see the shape of the run without opening anything at all. " +
    "A script that produces a file should always tell you where it put it. " +
    "It costs one line, and it saves the next person a minute every single time.";
  scenes.push(logs(n, {
    rate: 'last 2 lines',
    highlight: 0,
    atWord: at(n, 'prints'),
    lines: [
      {level: 'info', tag: 'where', text: 'Report written to: report-...html',
       atWord: at(n, 'first')},
      {level: 'info', tag: 'what', text: '7 passed 1 failed 1 broken 1 skipped',
       atWord: at(n, 'repeats')},
    ],
  }));
}

{
  const n =
    "One file changes what you can do with a result. " +
    "You can attach it to an email, " +
    "and the person opening it needs no tool and no network. " +
    "You can drop it onto a ticket as evidence " +
    "that the thing you reported really did happen. " +
    "You can publish it as a build artefact " +
    "and click it from a pipeline run months later. " +
    "And you can archive it, " +
    "because a single self-contained file still opens in ten years, " +
    "which is more than can be said for a folder of assets " +
    "and a tool that has moved on four major versions.";
  scenes.push(diagram(n, {
    nodes: [
      {id: 'f', label: 'one HTML file', sub: 'self-contained', color: 'green',
       atWord: at(n, 'file')},
      {id: 'e', label: 'an email', sub: 'no tool needed', color: 'blue',
       parent: 'f', atWord: at(n, 'email')},
      {id: 't', label: 'a ticket', sub: 'evidence attached', color: 'purple',
       parent: 'f', atWord: at(n, 'ticket')},
      {id: 'c', label: 'a build artefact', sub: 'clickable months later', color: 'orange',
       parent: 'f', atWord: at(n, 'pipeline')},
    ],
  }));
}

{
  const n =
    "And this is where the series goes from here. " +
    "Chapter two takes the same idea into pytest, " +
    "which is where most Python testing actually lives. " +
    "Chapter three is about the metadata Allure understands — " +
    "severity, owners, links back to your ticket system. " +
    "Later chapters cover running this inside a pipeline, " +
    "history and trends across runs, " +
    "and what changes when the suite is large enough to run in parallel. " +
    "All of it builds on what you just wrote, " +
    "and the result folder stays the handover point in every single one.";
  scenes.push(list(n, 'Where the series goes', [
    {text: 'chapter 2 — the same, in pytest', atWord: at(n, 'pytest')},
    {text: 'chapter 3 — severity, owners, links', atWord: at(n, 'metadata')},
    {text: 'later — pipelines and history', atWord: at(n, 'pipeline')},
    {text: 'the results folder never changes', atWord: at(n, 'handover')},
  ]));
}

{
  const n =
    "So look at what happened here. " +
    "We wrote ten checks as English sentences. " +
    "We gave each sentence a small Python function, " +
    "and attached nine different kinds of evidence along the way. " +
    "We ran it once and got all four outcomes — " +
    "including the two most tutorials pretend don't exist. " +
    "We read the raw files before any report existed, " +
    "and found the word broken sitting in the data. " +
    "And then we wrote our own report builder, " +
    "in one Python file, with a rule that fits in two questions. " +
    "Java was never involved. Neither was Node, or any separate program. " +
    "Next chapter, we take a real Allure report — the official kind, " +
    "the sort you'd actually meet at work — and write the code that opens it back up.";
  scenes.push(scene('RECAP', n, {
    recap: {
      heading: 'What you built',
      points: [
        {text: 'Ten checks, written as plain English', atWord: at(n, 'sentences')},
        {text: 'A Python function behind every sentence', atWord: at(n, 'function')},
        {text: 'Nine kinds of evidence, one run', atWord: at(n, 'evidence')},
        {text: 'All four outcomes, including broken', atWord: at(n, 'outcomes')},
        {text: 'Your own report builder, in one file', atWord: at(n, 'builder')},
      ],
    },
  }));
}

{
  const n =
    "If this was useful, subscribe — the next chapter is already coming. " +
    "The links to behave, allure-behave, Playwright and requests are in the description, " +
    "and every one of them repays a careful read. " +
    "See you in chapter two.";
  scenes.push(scene('OUTRO_CTA', n, {
    outro: {heading: 'Chapter 2: opening a real report back up', sub: 'links in the description'},
  }));
}

// ═══ THE SPEC ════════════════════════════════════════════════════════════════
const spec = {
  meta: {
    topic: 'Building a real Allure test report in pure Python, with no Java',
    subject: 'Allure',
    format: 'long',
    fps: 30,
    audience: 'beginner',
    // A SERIES TITLE FORMAT IS A CONTRACT (LAW 0e.7b). Every later chapter keeps
    // `Allure AI #N — …`, and the numbering has no holes.
    series: 'Allure AI',
    chapterNumber: 1,
    onePayoff: 'write ten BDD checks, run them, and build your own clickable report — all in Python',
    openLoop: 'what does a test report look like when it has four outcomes instead of two?',
    analogy: 'four trays a result can land in, rather than a pass/fail switch',
    screenplay: 'masterclass',
    audioPrefix: 'allure01_long',
    topicAxes: ['skill-build', 'craft'],
    seo: {
      // The runtime decides the claim, and the claim rounds UP to the next round
      // number — so this is set from the measured cut, never before it.
      title: 'Allure AI #1 — Build a Real Test Report in Pure Python (No Java)',
      altTitles: [
        'Allure Reports Without Java — Python, Playwright and BDD From Scratch',
        'Your First Allure Report in Pure Python — Every Line Typed',
      ],
      hook: 'What does a test report look like when it has four outcomes instead of two?',
      breakdown: 'ten BDD checks in plain English, a Chromium screenshot, nine kinds of evidence, all four Allure outcomes, and a report builder written from nothing in one Python file',
      queries: [
        'allure report python',
        'allure report without java',
        'behave allure tutorial',
        'allure behave playwright',
        'bdd python allure report',
        'allure attachment types python',
        'allure broken vs failed',
        'generate allure html report python',
        'python test report from scratch',
        'gherkin behave beginners tutorial',
      ],
      hashtags: ['#python', '#testing', '#allure', '#bdd'],
      pinned: 'Which outcome surprised you — broken, or skipped?',
      tags: [
        'allure', 'allure report', 'python', 'behave', 'bdd', 'gherkin', 'playwright',
        'test automation', 'test reporting', 'allure behave', 'python testing',
        'qa automation', 'uv python', 'html report',
      ],
      sources: [
        'behave — https://github.com/behave/behave',
        'allure-behave, the Allure adapter for behave — https://github.com/allure-framework/allure-python',
        'Allure Report — https://allurereport.org',
        'playwright, the Python browser automation library — https://playwright.dev/python/',
        'requests — https://requests.readthedocs.io',
        'uv — https://docs.astral.sh/uv/',
      ],
    },
  },
  brand: {
    channel: CH,
    logo: 'img:channel_logo.png',
    theme: 'moderndark',
    design: 'moderndark',
    background: 'grid',
  },
  thumbnail: {
    title: 'Build a Real Allure Report',
    badge: 'Python · No Java · Beginners',
    note: 'ten checks, four outcomes, one file',
    asset: 'si:python',
    logos: ['si:python', 'si:cucumber', 'lucide:file-check-2', 'lucide:camera'],
  },
  scenes,
};

fs.writeFileSync(`topics/${SLUG}/long.json`, JSON.stringify(spec, null, 2) + '\n');
const words = scenes.reduce((a, s) => a + s.narration.trim().split(/\s+/).length, 0);
console.log(`wrote topics/${SLUG}/long.json — ${scenes.length} scenes, ` +
            `${words} words (~${Math.floor(words / 3.11 / 60)}m${String(Math.round((words / 3.11) % 60)).padStart(2, '0')}s)`);
// PRINT THE CENSUS EVERY BUILD — a beat dropped by a block edit is invisible downstream.
const census = {};
for (const s of scenes) census[s.type] = (census[s.type] ?? 0) + 1;
console.log('  ' + Object.entries(census).sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `${k}:${v}`).join(' '));
