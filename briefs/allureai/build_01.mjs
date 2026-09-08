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
    "Then one command brings in the four libraries this chapter needs, " +
    "and I want to name each one, because a list of installs you can't read " +
    "is where a beginner gets left behind. " +
    "behave is the BDD runner — it reads tests written as plain English sentences. " +
    "allure-behave is the bridge that turns what behave did into Allure's evidence files. " +
    "playwright drives a real browser, which is how we'll take a screenshot. " +
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
                  {text: 'drives a real browser', mark: 'pw', side: 'right',
                   color: 'purple', atWord: at(n, 'drives')},
                  {text: 'fetches pages from Python', mark: 'req', side: 'right',
                   color: 'orange', atWord: at(n, 'fetches')}]})]));
}

{
  const n =
    "One more install, and it's a browser rather than a library. " +
    "playwright needs an actual copy of Chromium to drive, " +
    "so this downloads one and keeps it somewhere shared on your machine. " +
    "You run this once, ever. " +
    "After that, every project on the machine uses the same copy.";
  scenes.push(rec(n, 'and one real browser',
    'Playwright fetching the browser it will drive.',
    [A('browser', 'downloaded once, used everywhere', {wantAtWord: at(n, 'Chromium')})]));
}


// ═══ CHAPTER 2 — the checks, written in plain English ════════════════════════
scenes.push(chapter(
  "Before any Python, we describe what we want to check — in English.",
  2, 'Plain English first', 'ten checks, written as sentences'));

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
    [A('feat2', 'a request, and a word on the page', {
       callouts: [{text: 'no Python in this file yet', mark: null, side: 'top',
                   color: 'green', atWord: at(n, 'contain')}]})]));
}

{
  const n =
    "Three more, and now we're asking for evidence. " +
    "One opens a real browser and takes a full page screenshot. " +
    "One sends the same request three times and records how long each took, " +
    "which gives us a small table. " +
    "And one takes the same screenshot again as a JPEG instead of a PNG, " +
    "so we can see later that the report handles both without caring which is which.";
  scenes.push(rec(n, 'a screenshot, and a timing table',
    'Checks that produce evidence rather than just a yes or no.',
    [A('feat3', 'three checks that leave proof behind', {wantAtWord: at(n, 'browser')})]));
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
    [A('feat4', 'binary, and three text shapes', {wantAtWord: at(n, 'zip')})]));
}

{
  const n =
    "And now the three that carry this chapter. " +
    "One is written to fail — a normal check that asks for text the page will never contain. " +
    "One is written to break, which is a different thing, and we'll come back to it in a second. " +
    "And one carries a tag that tells behave to skip it, so it never runs at all. " +
    "Every tutorial writes tests that pass. " +
    "Writing tests that deliberately do the other three is the only way " +
    "to see what those outcomes actually look like.";
  scenes.push(rec(n, 'the three nobody shows you',
    'A check written to fail, one written to break, and one written to be skipped.',
    [A('feat5', 'fail, break, skip', {
       callouts: [{text: 'never runs at all', mark: 'skip', side: 'right',
                   color: 'purple', atWord: at(n, 'tag')}]}),
     A('savefeat', 'saved')]));
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
      {label: "KeyError: 'x-definitely-not-a-real-header'", sub: 'the test itself threw',
       text: 'broken', atWord: at(n, 'right')},
    ],
  }));
}


// ═══ CHAPTER 3 — the Python behind every English line ════════════════════════
scenes.push(chapter(
  "Those sentences do nothing on their own. Now we give each one some Python.",
  3, 'The Python behind the English', 'one function per sentence'));

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
      {label: 'Given the target website is "https://www.python.org"',
       text: '@given(...)', sub: 'def step_set_target(context, url)', atWord: at(n, 'decorator')},
      {label: 'When I send a GET request to the homepage',
       text: '@when(...)', sub: 'def step_get_homepage(context)', atWord: at(n, 'matches')},
      {label: 'Then the response status code should be 200',
       text: '@then(...)', sub: 'def step_check_status(context, expected_code)',
       atWord: at(n, 'braces')},
    ],
  }));
}

{
  const n =
    "New file, and it opens with a long comment. " +
    "I'm leaving it there on purpose, because a note explaining why a file exists " +
    "is worth more than the file being three lines shorter. " +
    "It says something worth knowing: Allure supports twenty attachment types. " +
    "We're using nine of them, which is enough to cover every SHAPE evidence comes in — " +
    "a picture, a table, plain text, structured text, and a compressed archive. " +
    "Adding the other eleven would be padding, since they all work the same way.";
  scenes.push(rec(n, 'a note to whoever opens this next',
    'The steps file, and the comment at the top of it.',
    [A('opensteps', 'the second file'),
     A('st1', 'why this file exists', {wantAtWord: at(n, 'comment')}),
     A('st1b', 'twenty types exist, we use nine', {wantAtWord: at(n, 'twenty')})]));
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
    [A('st3', 'what, called what, of what type', {
       zooms: [{mark: 'contains', atWord: at(n, 'underneath')}],
       callouts: [{text: 'the name you click in the report', mark: null, side: 'top',
                   color: 'green', atWord: at(n, 'name')}]})]));
}

{
  const n =
    "This one opens a real browser. " +
    "context dot browser is a Chromium that's already running — " +
    "we set that up in a moment, in a separate file. " +
    "new page opens a fresh tab at a fixed size, " +
    "goto navigates to the address, " +
    "and wait until load means: don't carry on until the page has finished loading. " +
    "Then screenshot with full page true captures the whole page, " +
    "not just the part that fits on screen, " +
    "and hands us raw bytes. " +
    "We close the tab, keep the bytes, and attach them as a PNG in the step below.";
  scenes.push(rec(n, 'a real browser, and a screenshot',
    'Opening a tab, navigating, capturing the full page, closing it again.',
    [A('st4', 'open, go, capture, close', {
       callouts: [{text: 'the whole page, not just the visible part', mark: null,
                   side: 'top', color: 'purple', atWord: at(n, 'fits')}]})]));
}

{
  const n =
    "Now a loop that measures. " +
    "For each of three attempts we note the clock, send the request, " +
    "and work out how many milliseconds it took. " +
    "perf counter is a timer built for measuring short durations. " +
    "Each result goes into a list as a small row: attempt, status code, duration. " +
    "Then we write those rows as CSV — comma separated values, which is just a table as text — " +
    "using a buffer in memory, so nothing is ever written to disk. " +
    "The whole table becomes one attachment.";
  scenes.push(rec(n, 'three timed requests, as a table',
    'A loop that records timings, and turns them into a CSV attachment.',
    [A('st5', 'measure, collect, attach', {
       callouts: [{text: 'built in memory, never written to disk', mark: null,
                   side: 'top', color: 'blue', atWord: at(n, 'buffer')}]})]));
}

{
  const n =
    "The same page again, and only one thing changed. " +
    "type equals jpeg on the screenshot call, " +
    "and attachment type dot JPG on the attach call. " +
    "Everything else is identical. " +
    "I'm doing this deliberately, " +
    "because at the end you'll watch our report render both of these " +
    "without ever asking which format it's looking at.";
  scenes.push(rec(n, 'the same page, as a JPEG',
    'A second image format, changed in exactly two places.',
    [A('st6', 'two words different', {wantAtWord: at(n, 'jpeg')})]));
}

{
  const n =
    "A zip, built entirely in memory. " +
    "BytesIO is a file that lives in memory rather than on disk. " +
    "We open a ZipFile writing into it, " +
    "write str puts a named file inside the archive — " +
    "here the whole page, and a small note beside it — " +
    "and then we hand the finished bytes to allure dot attach with type ZIP. " +
    "This is the one attachment in the chapter that is genuinely binary. " +
    "Hold on to that, because it's the one that behaves differently at the end.";
  scenes.push(rec(n, 'a zip, built in memory',
    'An archive assembled without ever touching the disk.',
    [A('st7', 'the one that is truly binary', {
       callouts: [{text: 'a file that lives in memory', mark: null, side: 'top',
                   color: 'orange', atWord: at(n, 'BytesIO')}]})]));
}

{
  const n =
    "Three functions, and they all say the same three facts. " +
    "The address, the status code, and how long the page was. " +
    "The first writes them as JSON, using json dot dumps with an indent so it's readable. " +
    "The second writes the same facts as XML, with angle brackets, " +
    "built with an f-string — that's the f before the quote, " +
    "which lets you drop a value straight into the text. " +
    "The third writes them as YAML, which is just name colon value on each line. " +
    "Same facts, three formats, three attachment types.";
  scenes.push(rec(n, 'one summary, three formats',
    'The same three facts written as JSON, XML and YAML.',
    [A('st8', 'json, xml, yaml', {wantAtWord: at(n, 'JSON')})]));
}

{
  const n =
    "And the last two, which are the ones this chapter is really about. " +
    "The broken one fetches the page, then reads a header called " +
    "X dash Definitely Not A Real Header. " +
    "That header does not exist, so Python raises a KeyError. " +
    "Read that line again: there's no assert here at all. " +
    "Nothing is being checked. " +
    "The test simply falls over — and that is exactly what Allure calls broken. " +
    "The skipped one calls context dot scenario dot skip, " +
    "with a reason, and behave stops before running anything.";
  scenes.push(rec(n, 'the broken one, and the skipped one',
    'A test that throws before it checks, and a test that never runs.',
    [A('st9', 'no assert anywhere in this one', {
       zooms: [{mark: 'keyerror', atWord: at(n, 'header', 2)}],
       callouts: [{text: 'no assert — nothing is being checked', mark: 'keyerror',
                   side: 'right', color: 'orange', atWord: at(n, 'assert')},
                  {text: 'stops before it runs', mark: 'skipcall', side: 'right',
                   color: 'purple', atWord: at(n, 'reason')}]}),
     A('savesteps', 'saved')]));
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

// ═══ CHAPTER 4 — one browser for the whole run ═══════════════════════════════
scenes.push(chapter(
  "One small file left before we can run any of this.",
  4, 'One browser, shared', 'setup and teardown'));

{
  const n =
    "Opening a fresh browser for every scenario would be slow, " +
    "so we open one at the start of the run and share it. " +
    "This file has a name behave looks for — environment dot py — " +
    "and behave calls the functions inside it automatically. " +
    "before all runs once, before anything else. " +
    "It starts Playwright and launches Chromium, " +
    "and parks both on context, which is why every step could reach context dot browser. " +
    "after all runs once at the very end, and closes them cleanly. " +
    "If you've used pytest, this is the same idea as a fixture.";
  scenes.push(rec(n, 'open it once, close it once',
    'The lifecycle file behave looks for by name.',
    [A('openenv', 'the third file'),
     A('env1', 'why this file exists', {wantAtWord: at(n, 'environment')}),
     A('env2', 'before all, and after all', {wantAtWord: at(n, 'before'),
       callouts: [{text: 'closed cleanly, even after a failure', mark: null, side: 'top',
                   color: 'green', atWord: at(n, 'cleanly')}]}),
     A('saveenv', 'saved')]));
}


// ═══ CHAPTER 5 — the run, and the raw evidence ═══════════════════════════════
scenes.push(chapter(
  "Three files written. Let's run them and see all four outcomes at once.",
  5, 'The first run', 'and the files it leaves behind'));

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
    [A('rawcount', 'ten results, thirteen attachments', {
       zooms: [{mark: 'results', atWord: at(n, 'Ten')}],
       callouts: [{text: 'plain files, nothing running', mark: null, side: 'top',
                   color: 'green', atWord: at(n, 'database')}]})]));
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
    [A('statuses', 'the four words, in the data', {
       zooms: [{mark: 'sbroken', atWord: at(n, 'Broken')}],
       callouts: [{text: 'written by the library, not by us', mark: 'sskipped',
                   side: 'right', color: 'green', atWord: at(n, 'library')}]})]));
}

{
  const n =
    "And the two failure messages, side by side. " +
    "AssertionError — the check ran and refused what it got. " +
    "KeyError, on a header that was never there — the test fell over first. " +
    "That's the same distinction we drew earlier, " +
    "except now it's a real message from a real file, " +
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

// ═══ CHAPTER 6 — our own report builder ══════════════════════════════════════
scenes.push(chapter(
  "Now the part that replaces the Java tool entirely — and it's one Python file.",
  6, 'Our own report builder', 'from JSON files to one HTML page'));

{
  const n =
    "Last file. It opens with a docstring saying what the script does, " +
    "and then the rule it uses to decide what to do with each piece of evidence. " +
    "I want you to read that rule now, because it's the cleverest thing in the chapter " +
    "and it fits in two questions. " +
    "There's no lookup table of twenty types anywhere in this file.";
  scenes.push(rec(n, 'what this script is for',
    'The report builder, and the rule stated at the top of it.',
    [A('openrpt', 'the last file'),
     A('rpt1', 'a docstring, and a promise', {wantAtWord: at(n, 'docstring')}),
     A('rpt2', 'two questions, no lookup table', {wantAtWord: at(n, 'rule', 2)})]));
}

{
  const n =
    "Then the imports and the first function. " +
    "load results walks the folder, opens every file ending in result dot json, " +
    "and returns them as a list of Python dictionaries. " +
    "Path comes from pathlib, and glob finds files by pattern. " +
    "Ten files in, ten dictionaries out. That's the whole function.";
  scenes.push(rec(n, 'read every result file',
    'Loading the ten result files into memory.',
    [A('rpt3', 'ten files in, ten dictionaries out', {wantAtWord: at(n, 'walks')})]));
}

{
  const n =
    "Here's the first question, and it's one line. " +
    "Does this attachment's type start with the word image slash? " +
    "Every image type does — image slash png, image slash jpeg, image slash gif — " +
    "so one check covers all of them, including formats we haven't used. " +
    "If it's an image, we read the bytes, encode them as base64, " +
    "and drop them straight into an img tag. " +
    "base64 is a way of writing binary data using only ordinary letters and numbers, " +
    "which is what lets a picture live inside an HTML file " +
    "instead of sitting next to it as a separate file. " +
    "That's why the report ends up being a single page you can send to somebody.";
  scenes.push(rec(n, 'is it a picture?',
    'One check that covers every image format, and how the picture gets inside the page.',
    [A('rpt4', 'one line, every image format', {
       callouts: [{text: 'binary written as ordinary letters', mark: null, side: 'top',
                   color: 'purple', atWord: at(n, 'base64')}]})]));
}

{
  const n =
    "The second question, and then the honest answer for everything else. " +
    "Is this text-shaped? " +
    "Plain text and HTML and CSV obviously are. " +
    "So are JSON, XML and YAML — even though their types don't start with the word text, " +
    "which is exactly the trap this check is written to avoid. " +
    "If it's text-shaped, we decode it and show it. " +
    "And if it's neither — our zip file — we don't guess. " +
    "We write a download link instead. " +
    "Trying to show a zip as text would produce a screen of garbage, " +
    "and a link that works is worth more than a preview that doesn't. " +
    "Pause here and read those two questions together, " +
    "because that pair is the entire attachment system.";
  scenes.push(rec(n, 'is it text? otherwise, a link',
    'The second question, and the fallback for anything that is neither.',
    [A('rpt5', 'text, or an honest link', {
       zooms: [{mark: 'download', atWord: at(n, 'download')}],
       callouts: [{text: 'JSON and XML are not text/* — hence the check', mark: null,
                   side: 'top', color: 'orange', atWord: at(n, 'trap')}]})]));
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
    "The next three functions build the page, one layer at a time. " +
    "render step draws a single step and then calls itself for any steps nested inside it, " +
    "which is how a step with sub-steps comes out indented correctly. " +
    "render test draws one scenario: its name, a coloured badge for its status, " +
    "and the message if it has one. " +
    "Look at how the status is used — it picks a CSS class, " +
    "and that class is what gives passed its green and broken its amber. " +
    "Four statuses, four colours, and nothing else on the page is coloured at all.";
  scenes.push(rec(n, 'a step, then a whole test',
    'The two functions that turn one result into HTML.',
    [A('rpt6', 'a step, and the steps inside it', {wantAtWord: at(n, 'render')}),
     A('rpt7', 'one test, and its status', {wantAtWord: at(n, 'scenario')}),
     A('rpt8', 'its message, when it has one', {wantAtWord: at(n, 'message'),
       callouts: [{text: 'the status picks the colour', mark: null, side: 'top',
                   color: 'blue', atWord: at(n, 'class', 2)}]})]));
}

{
  const n =
    "Then its evidence, and the shell of the page around everything. " +
    "The style block is deliberately small — four status colours, " +
    "a readable font, and enough spacing to breathe. " +
    "I'm not going to read CSS to you line by line, " +
    "but do notice there are no other colours in it. " +
    "A report that colours everything tells you nothing about anything.";
  scenes.push(rec(n, 'its evidence, and the page around it',
    'Attachments rendered into the test, and the page shell they sit in.',
    [A('rpt9', 'the evidence for one test', {wantAtWord: at(n, 'evidence')}),
     A('rpt10', 'four colours, and nothing else', {wantAtWord: at(n, 'style')})]));
}

{
  const n =
    "And the last two pieces. " +
    "build report counts each status as it goes — " +
    "and this is where a lot of homemade reports quietly go wrong. " +
    "It counts four things, separately. " +
    "An earlier version of this script counted passed and failed only, " +
    "and silently reported the wrong total, " +
    "because the broken and skipped ones had nowhere to go. " +
    "Then main is the command line part: " +
    "which folder to read, where to write, and what to call the report. " +
    "Save it, and that's every line of code in this chapter.";
  scenes.push(rec(n, 'count all four, then write it out',
    'The counting, and the command-line entry point.',
    [A('rpt11', 'four counters, not two', {
       zooms: [{mark: 'counts', atWord: at(n, 'four')}],
       callouts: [{text: 'two counters would lose two outcomes', mark: 'counts',
                   side: 'right', color: 'red', atWord: at(n, 'wrong')}]}),
     A('rpt12', 'the command line entry point', {wantAtWord: at(n, 'main')}),
     A('savertp', 'saved')]));
}

// ═══ CHAPTER 7 — the payoff ══════════════════════════════════════════════════
scenes.push(chapter(
  "Everything is written. Let's build the report and see what we made.",
  7, 'The report', 'one file, everything inside it'));

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
     A('size', 'both screenshots are inside it', {wantAtWord: at(n, 'megabyte')})]));
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
    "and every one of them is worth reading properly. " +
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
      breakdown: 'ten BDD checks in plain English, a real browser, nine kinds of evidence, all four Allure outcomes, and a report builder written from nothing in one Python file',
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
    background: 'zoneA',
  },
  thumbnail: {
    title: 'Build a Real Allure Report',
    badge: 'Python · No Java · Beginners',
    note: 'ten checks, four outcomes, one file',
    asset: 'si:python',
    logos: ['si:python', 'si:qameta', 'si:cucumber', 'si:playwright'],
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
