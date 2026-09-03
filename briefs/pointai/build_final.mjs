#!/usr/bin/env node
// BUILD — topics/ai-on-your-own-files/long.json
//
// ONE STANDALONE BEGINNER TUTORIAL, AND EVERY LINE OF CODE IS TYPED ON CAMERA.
//
// Owner, after two rounds of me cutting corners: *"I really want you not to take any
// shortcuts... using ollama instead of openai. Not recording complete VS code typing and
// explanation too many skips."*
//
// So, plainly: the provider is the AZURE OPENAI gpt-4o deployment he actually demos on, and
// all THIRTY-THREE captured steps are cast — twelve of them typing blocks. Nothing is
// summarised, nothing is redrawn, nothing is skipped. `demos/azure-full.json` creates every
// file from empty and types every character; this spec plays those clips on the narrator's
// clock, one block per explanation.
//
// WHY DRAWN BEATS STILL APPEAR BETWEEN THEM. Two reasons, and neither is convenience.
// SAME-FAMILY ADJACENCY is a hard linter error — two footage beats cannot sit side by side —
// and more importantly a viewer needs somewhere to put the idea down between blocks of
// typing. So the concept beats sit BETWEEN files, never instead of them: the four-box shape
// of the project, the anatomy of a message, the wrong way to store a key struck out, and the
// rule at the end. The code is always the footage.
//
// SOURCES. The three key options are read off the vendors' own pages in
// `demos/where-keys-come-from.json`, dated on screen. The enterprise logos are the marks
// Ollama puts on its own front page and are attributed as such. Every figure the tool prints
// was produced by the run in the recording, against Azure.
//
// NO SECRET IS ON SCREEN. Swept: no key, no resource host, no username, no home path appears
// in any captured frame. The .env is typed in full with the key masked at source and the
// resource named YOUR-RESOURCE; the real values reach the process from outside the workspace.
import fs from 'node:fs';

const CH = 'THE NBX STUDIO';
const DATED = 'Read from the providers’ own pages, 2026-09-04';

const normw = (w) => String(w).toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (narration, word, nth = 1) => {
  const ws = narration.split(/\s+/).map(normw);
  const want = normw(word);
  let seen = 0;
  for (let i = 0; i < ws.length; i++) if (ws[i] === want && ++seen === nth) return i + 1;
  throw new Error(`anchor ${JSON.stringify(word)} (#${nth}) not found in: ${narration.slice(0, 90)}…`);
};

const TRANS = ['fade', 'push', 'slide', 'zoom', 'wipe', 'dip', 'morph', 'iris'];
const BG = ['zoneA', 'zoneB', 'zoneC'];
let i = 0;
const scene = (type, narration, data, extra = {}) => {
  const s = {id: `s${String(i + 1).padStart(2, '0')}`, type, narration,
             transition: TRANS[i % TRANS.length], background: BG[i % BG.length], data, ...extra};
  i++;
  return s;
};
const chapter = (narration, number, title, subtitle) =>
  scene('CHAPTER', narration, {chapter: {number: String(number).padStart(2, '0'), title, subtitle}});
/** A footage beat. `clips` are cast from the capture; anchor-spec solves their timing. */
const rec = (narration, caption, premise, clips, extra = {}) =>
  scene('RECORDED_STEP', narration, {
    recordedStep: {caption, premise, layout: 'full', color: 'blue', clips, ...extra},
  });
// AN AUTHORED WORD IS `wantAtWord`, NOT `atWord`. On a clip AND on every event inside it,
// `atWord` is anchor-spec's OUTPUT; the word this script chose — the word the narration
// actually says — is the INTENT, and it goes in its own field so the solver can honour it
// without ever reading its own previous answer back as an instruction. Written as `atWord`
// in the beats below for readability, and moved here, once.
const intent = (o = {}) => {
  const move = (e) => (e && e.atWord != null ? {...e, wantAtWord: e.atWord, atWord: undefined} : e);
  const out = {...o};
  if (o.callouts) out.callouts = o.callouts.map(move);
  if (o.zooms) out.zooms = o.zooms.map(move);
  return out;
};
const A = (id, label, opts = {}) => ({ref: `rec:azure-full#${id}`, label, focus: true, ...intent(opts)});
const W = (id, label, opts = {}) => ({ref: `rec:where-keys-come-from#${id}`, label, focus: true, ...intent(opts)});

const scenes = [];

// ═══ OPENING ═════════════════════════════════════════════════════════════════
{
  const n = "Python, a file on your desk, and an AI that reads it for you. " +
            "Nothing installed yet. Let's fix that.";
  scenes.push(scene('HOOK', n, {
    headline: 'PYTHON READS YOUR FILES',
    subtext: 'from an empty folder, in one sitting',
    hookVariant: 'statement',
    headlineAtWord: at(n, 'Python'),
  }));
}

{
  const n =
    `Welcome to ${CH}. Today we build a small Python tool that takes any file you've got — ` +
    "a spreadsheet, an export, a log — and hands it to an AI that tells you what is in there. " +
    "No Python experience, no credit card. " +
    "So what does that actually take?";
  scenes.push(scene('TITLE_CARD', n, {
    title: 'Make an AI read your own files',
    subtitle: 'a complete Python project, from an empty folder',
  }));
}

{
  const n =
    "Your file goes into Python. " +
    "Python describes the file — counts the rows, works out the ranges, spots the gaps — " +
    "so the description that comes out is a few hundred words " +
    "instead of forty thousand rows. " +
    "That description is what goes to the model, " +
    "and what comes back is a sentence you can act on. " +
    "Four boxes, and that's the whole shape of the project. " +
    "Everything after this is typing, because the shape never changes.";
  scenes.push(scene('DIAGRAM', n, {diagram: {
    layout: 'flow',
    direction: 'horizontal',
    nodes: [
      {id: 'f', label: 'Your file', sub: 'csv, log, export', color: 'blue', atWord: at(n, 'file')},
      {id: 'p', label: 'Python', sub: 'counts and measures', color: 'green', atWord: at(n, 'Python')},
      {id: 'd', label: 'A description', sub: 'a few hundred words', color: 'purple',
       atWord: at(n, 'description')},
      {id: 'm', label: 'The model', sub: 'reads, then answers', color: 'orange', atWord: at(n, 'model')},
    ],
    edges: [
      {from: 'f', to: 'p', label: 'you point it', atWord: at(n, 'into')},
      {from: 'p', to: 'd', label: 'no AI yet', atWord: at(n, 'ranges')},
      {from: 'd', to: 'm', label: 'facts, not rows', atWord: at(n, 'goes', 2)},
    ],
  }}));
}

// ═══ CHAPTER 1 — where the AI comes from ═════════════════════════════════════
scenes.push(chapter(
  "First question everybody asks, and it's the right one: where do you get an AI to talk to?",
  1, 'Where the AI comes from', 'three doors, and two of them are free'));

{
  const n =
    "Three doors, and the free ones come first because they are not a consolation prize. " +
    "Door one runs the model on your own laptop — this is Ollama's own site. " +
    "No account, no card, and nothing you type leaves the machine, " +
    "which for work files is often the only option allowed.";
  scenes.push(rec(n, 'free, and it never leaves your laptop',
    'Ollama’s own home page — a model that runs on your machine.',
    [W('ollama', 'Ollama, on its own site', {zooms: [{at: 'full', atWord: at(n, 'laptop')}]})],
    {sourceNote: 'Source: ollama.com — read 2026-09-04'}));
}

{
  const n =
    "Apple. NVIDIA. Netflix. NASA. Intel. " +
    "Those are the logos Ollama puts on its own front page, " +
    "which is worth knowing before you write a local model off as a hobby thing. " +
    "Running a model on hardware you control is not the amateur option — " +
    "it's the only option when the data cannot leave the building.";
  scenes.push(scene('LOGO_WALL', n, {
    logoWall: {
      logos: [
        {icon: 'si:apple', label: 'Apple', atWord: at(n, 'Apple')},
        {icon: 'si:nvidia', label: 'NVIDIA', atWord: at(n, 'NVIDIA')},
        {icon: 'si:netflix', label: 'Netflix', atWord: at(n, 'Netflix')},
        {icon: 'si:nasa', label: 'NASA', atWord: at(n, 'NASA')},
        {icon: 'si:intel', label: 'Intel', atWord: at(n, 'Intel')},
      ],
      cols: 5,
    },
    source: 'Logos shown on ollama.com, read 2026-09-04',
  }));
}

{
  const n =
    "Door two is a cloud key, no card. " +
    "Here is Google's own pricing page, and the word free is theirs, not mine. " +
    "Free input and output tokens, limits instead of a bill. " +
    "But read the line at the bottom, because that line decides everything: " +
    "on the free tier your content improves their products; on paid it does not. " +
    "That's the real difference between the columns.";
  scenes.push(rec(n, 'free in their own words — and the catch',
    'Google’s published pricing for the Gemini API.',
    [W('gemini', 'the free and paid columns',
       {callouts: [{text: 'their word, not mine', mark: 'free', side: 'right', color: 'green',
                    atWord: at(n, 'free')}]}),
     W('freetier', 'the line that decides it', {wantAtWord: at(n, 'bottom')})],
    {sourceNote: 'Source: ai.google.dev/gemini-api/docs/pricing — read 2026-09-04'}));
}

{
  const n =
    "So, three doors. On your own laptop, Ollama — free, and nothing leaves the machine. " +
    "In the cloud with no card at all, Groq or Google. " +
    "Or you pay, and for a few hundred files a month that comes to roughly a pound. " +
    "Start on a free door and change your mind later, " +
    "because swapping is three lines in a file and no code at all.";
  scenes.push(scene('SPEC_COMPARE', n, {
    compare: {
      headline: 'Three doors, and what each costs',
      a: {name: 'free', color: 'green'},
      b: {name: 'paid', color: 'blue'},
      rows: [
        {label: 'On your own laptop', a: 'Ollama', b: '—', winner: 'a', atWord: at(n, 'laptop')},
        {label: 'Nothing leaves the PC', a: 'Ollama', b: 'no', winner: 'a',
         atWord: at(n, 'leaves')},
        {label: 'Cloud, no card', a: 'Groq · Google', b: '—', winner: 'a', atWord: at(n, 'cloud')},
        {label: 'A few hundred files', a: '£0', b: '~£1', atWord: at(n, 'hundred')},
        {label: 'Switching later', a: '3 lines', b: '3 lines', atWord: at(n, 'swapping')},
      ],
      atWord: at(n, 'doors'),
    },
    source: DATED,
  }));
}

{
  const n =
    "Groq works the same way — a key with no card, and rate limits instead of a bill. " +
    "Requests per minute, tokens per minute, and when you hit one you wait rather than pay. " +
    "I'm going to use a fourth door for the rest of this video: Azure OpenAI, " +
    "because that's what my employer already pays for, and it's the same three settings. " +
    "Whichever door you pick, everything from here is identical.";
  scenes.push(rec(n, 'limits instead of a bill',
    'Groq’s published rate limits.',
    [W('groq', 'the limits, published',
       {zooms: [{mark: 'limits', atWord: at(n, 'minute')}, {at: 'full', atWord: at(n, 'Azure')}],
        callouts: [{text: 'you wait, you don’t pay', mark: 'limits', side: 'right', color: 'green',
                    atWord: at(n, 'wait')}]})],
    {sourceNote: 'Source: console.groq.com/docs/rate-limits — read 2026-09-04'}));
}

// ═══ CHAPTER 2 — from an empty folder ════════════════════════════════════════
scenes.push(chapter(
  "Right. Nothing installed. Let's go from an empty folder to a working project.",
  2, 'From an empty folder', 'one command, and Python comes with it'));

{
  const n =
    "Here is my folder, and there is one file in it: " +
    "fifty orders from a made-up shop, standing in for whatever export lands on your desk — " +
    "a test run, a sprint, a supplier list. " +
    "Look at the first three rows. A header row, then data. " +
    "Eight columns, plain text, nothing special about any of it. " +
    "That's the file we're going to teach a model to read.";
  scenes.push(rec(n, 'one folder, one file',
    'An ordinary folder with one CSV in it.',
    [A('look', 'the folder',
       {callouts: [{text: 'your file goes here', mark: 'csv', side: 'right', color: 'blue',
                    atWord: at(n, 'orders')}]}),
     A('peek', 'the first rows', {wantAtWord: at(n, 'rows'),
       callouts: [{text: 'a header, then data', mark: 'header', side: 'bottom', color: 'green',
                   atWord: at(n, 'header')}]})]));
}

{
  const n =
    "A Python install. A virtual environment. Pip, to fetch the libraries. " +
    "And a requirements file, so somebody else can rebuild what you built. " +
    "That is four things you would normally have to learn before writing a line, " +
    "and uv replaces all four of them. " +
    "One sentence about uv, then, because uv is the thing that saves you an evening: " +
    "you never have to learn what any of those four were.";
  // ICON_GRID reads `data.iconGrid`. This was authored flat — the shape LIST_BUILD
  // uses three scenes later — and rendered nineteen seconds of black.
  scenes.push(scene('ICON_GRID', n, {iconGrid: {
    cols: 4,
    items: [
      {icon: 'si:python', label: 'Python install', atWord: at(n, 'Python')},
      {icon: 'lucide:box', label: 'virtual env', atWord: at(n, 'virtual')},
      {icon: 'lucide:package', label: 'pip', atWord: at(n, 'Pip')},
      {icon: 'lucide:file-text', label: 'requirements', atWord: at(n, 'requirements')},
    ],
  }}));
}

{
  const n =
    "So: uv init. One command, and there is the project. " +
    "Look at what uv wrote for you. A pyproject file, which is the list of what this project needs. " +
    "A python-version file, so anyone rebuilding it gets the same Python you had. " +
    "Then one more command for the library. " +
    "The library is called openai, and here's the thing worth knowing: openai isn't only for OpenAI. " +
    "Ollama speaks it, Groq speaks it, Google speaks it, and Azure speaks it. " +
    "One library, and you pick the provider with a setting, not a rewrite.";
  scenes.push(rec(n, 'one command, then one library',
    'uv creating the project, then installing the client library.',
    [A('init', 'uv init',
       {callouts: [{text: 'that is the whole setup', mark: 'made', side: 'bottom', color: 'green',
                    atWord: at(n, 'project')}]}),
     A('tree', 'what it wrote', {wantAtWord: at(n, 'wrote'),
       callouts: [{text: 'what this project needs', mark: 'proj', side: 'right', color: 'blue',
                   atWord: at(n, 'pyproject')},
                  {text: 'which Python to use', mark: 'pyver', side: 'right', color: 'purple',
                   atWord: at(n, 'rebuilding')}]}),
     A('add', 'installing the library', {wantAtWord: at(n, 'library'),
       callouts: [{text: 'this one talks to all of them', mark: 'lib', side: 'right', color: 'green',
                   atWord: at(n, 'speaks')}]})]));
}

// ═══ CHAPTER 3 — the key ═════════════════════════════════════════════════════
scenes.push(chapter(
  "Before a single line of Python, the habit that matters most.",
  3, 'Where the key lives', 'never in your code — not once'));

{
  const n =
    "This is the mistake, and it's worth seeing once. " +
    "You paste the key straight into the code, because it's quicker and it works. " +
    "Then one day the folder becomes a git repository, and the key goes wherever the code goes.";
  scenes.push(scene('CODE_DIFF', n, {diff: {
    fileName: 'ask.py',
    rows: [
      {kind: 'ctx', text: 'client = OpenAI('},
      {kind: 'del', text: '    api_key="sk-YOUR-REAL-KEY-PASTED-RIGHT-HERE"'},
      {kind: 'add', text: '    api_key=os.getenv("AI_API_KEY")'},
      {kind: 'ctx', text: ')'},
    ],
    stat: {plus: 1, minus: 1},
    atWord: at(n, 'mistake'),
  }}));
}

// SIX CLIPS AND A HUNDRED AND SEVENTY WORDS WAS ONE BEAT TOO MANY. The solver put the
// last save at 86% of the read — LAW 8 wants the payoff named by ~70% — and the honest
// remedy for a beat carrying too much is to split it, not to trim the explanation.
// It is also the better lesson: type the settings file, say what the ignore list DOES,
// then type it.
{
  const n =
    "The fix is one line: read the key from the environment instead, " +
    "and keep the value somewhere git is told to ignore. " +
    "So we type the settings file first. Three lines, and they choose your provider. " +
    "Base URL is the address you are talking to — mine is an Azure deployment, " +
    "and yours will be whichever door you picked. " +
    "API key is the secret, and I have masked mine with asterisks, " +
    "because a key on screen is a key gone. Yours goes in exactly that spot. " +
    "And model is which brain you want; mine is gpt-4o. " +
    "Three lines, and every provider in this video reads them the same way — " +
    "Ollama, Groq, Google or Azure, with no change to the code at all.";
  scenes.push(rec(n, 'settings in a file, never in the code',
    'The file that holds the key, so the code never has to.',
    [A('openenv', 'an empty settings file'),
     A('typeenv', 'three lines, typed', {wantAtWord: at(n, 'Base'),
       callouts: [{text: 'the address you talk to', mark: 'url', side: 'right', color: 'blue',
                   atWord: at(n, 'address')},
                  {text: 'masked — yours goes here', mark: 'masked', side: 'right', color: 'red',
                   atWord: at(n, 'masked')},
                  {text: 'which brain', mark: 'model', side: 'right', color: 'purple',
                   atWord: at(n, 'brain')}]}),
     A('saveenv', 'saved', {wantAtWord: at(n, 'gpt-4o')})]));
}

{
  const n =
    "So what does gitignore actually do? " +
    "Every file in that folder is queued to go wherever the code goes. " +
    "Gitignore is the list that stops one. " +
    "Put dot env on it, and your settings stay on your machine " +
    "however many times you push.";
  scenes.push(scene('PIPELINE_GATE', n, {pipelineGate: {
    headline: 'Everything ships — [except what is listed]',
    proposerLabel: 'every file you write',
    gateLabel: '.gitignore',
    outputLabel: 'pushed to GitHub',
    passLabel: 'ships',
    rejectLabel: 'stays on your machine',
    checks: ['.env'],
    footNote: 'one line, written once, on day one',
    color: 'green',
    atWord: at(n, 'stops'),
  }}));
}

{
  const n =
    "So the second file. Gitignore is the list of things git must never pick up, " +
    "and we add dot env to it. " +
    "Thirty seconds of work, and the difference between a key that is yours " +
    "and a key that is on the internet. " +
    "Do it on the first day of a project and you'll never think about it again. " +
    "Two files, once, and the key stays yours for good — " +
    "on this project, and on every project you start after it.";
  scenes.push(rec(n, 'one line, and git looks away',
    'The ignore list, and the one name on it.',
    [A('openignore', 'the gitignore'),
     A('typeignore', 'one line, typed', {wantAtWord: at(n, 'add'),
       callouts: [{text: 'thirty seconds, once', mark: 'ignored', side: 'right', color: 'green',
                   atWord: at(n, 'seconds')}]}),
     A('saveignore', 'saved', {wantAtWord: at(n, 'internet')})]));
}

// ═══ CHAPTER 4 — the first call ══════════════════════════════════════════════
scenes.push(chapter(
  "Now the bit you came for. Nine lines, and you are talking to a model.",
  4, 'Your first call', 'nine lines, and what each one does'));

{
  const n =
    "New file, ask dot py, and we write it together, line by line. " +
    "Import os, so we can read those settings. " +
    "Import load dotenv, which is the thing that actually reads the settings file. " +
    "Import OpenAI — the library, remember, not the company. " +
    "Call load dotenv, and the settings are available. " +
    "Then build the client. Base URL and api key, both pulled from the file rather than typed here. " +
    "That's the client finished, and it works against any of the four doors we looked at.";
  scenes.push(rec(n, 'imports, then the client',
    'Writing the client, one line at a time.',
    [A('openask', 'an empty file'),
     A('client', 'imports, then the client', {wantAtWord: at(n, 'Import'),
       callouts: [{text: 'the library, not the company', mark: 'import', side: 'right',
                   color: 'blue', atWord: at(n, 'company')},
                  {text: 'from the file, not from here', mark: 'apikey', side: 'right',
                   color: 'green', atWord: at(n, 'pulled')}]})]));
}

{
  const n =
    "Your program on one side, the model on the other — " +
    "that is what a call actually is, and once you have this, " +
    "everything else in the video is a variation on it. " +
    "You send a list of messages. " +
    "Each message has a role — who is speaking — and content, which is what they said. " +
    "The model reads the list and adds one message of its own. " +
    "You read that reply out of choices, index zero, message, content. " +
    "That's the whole interface, and the interface doesn't get bigger than this.";
  scenes.push(scene('DIAGRAM', n, {diagram: {
    layout: 'sequence',
    nodes: [
      {id: 'you', label: 'Your program', sub: 'builds the list', color: 'blue',
       atWord: at(n, 'program')},
      {id: 'mdl', label: 'The model', sub: 'reads, then replies', color: 'purple',
       atWord: at(n, 'model')},
    ],
    edges: [
      {from: 'you', to: 'mdl', label: 'role and content', atWord: at(n, 'role')},
      {from: 'mdl', to: 'you', label: 'choices[0]', atWord: at(n, 'choices')},
    ],
  }}));
}

{
  const n =
    "So: chat completions create. " +
    "Model, from the settings. " +
    "Messages, and this is that list. " +
    "Role user, meaning this is you talking, and content, which is the question. " +
    "Then print the reply, and print usage too, because usage is what you are billed on. " +
    "Save it, run it — and there is the word back, from a gpt-4o deployment. " +
    "Fourteen tokens went in and two came back. " +
    "A token is roughly three quarters of a word, so that request cost a fraction of a penny.";
  scenes.push(rec(n, 'the call, and what it cost',
    'Typing the call, then running it against Azure OpenAI.',
    [A('thecall', 'typing the call', {
       callouts: [{text: 'a list of messages', mark: 'messages', side: 'right', color: 'blue',
                   atWord: at(n, 'list')},
                  {text: 'who is speaking', mark: 'role', side: 'right', color: 'purple',
                   atWord: at(n, 'Role')},
                  {text: 'what you are billed on', mark: 'usage', side: 'right', color: 'yellow',
                   atWord: at(n, 'billed')}]}),
     A('saveask', 'saved', {wantAtWord: at(n, 'Save')}),
     A('runask', 'running it', {wantAtWord: at(n, 'run'),
       zooms: [{mark: 'answer', atWord: at(n, 'word')},
               {mark: 'tokens', atWord: at(n, 'Fourteen')},
               {at: 'full', atWord: at(n, 'token')}],
       callouts: [{text: 'the word came back', mark: 'answer', side: 'right', color: 'green',
                   atWord: at(n, 'back')}]})]));
}

// ═══ CHAPTER 5 — describing a file ═══════════════════════════════════════════
scenes.push(chapter(
  "So the model talks. Now let's point it at your own file.",
  5, 'Describing your file', 'Python counts so the model needn’t'));

{
  const n =
    "Forty thousand rows. " +
    "An ordinary export, and the thing everybody tries " +
    "to paste into a chat window first. " +
    "On fifty rows, pasting works fine. " +
    "At forty thousand it stops, " +
    "because every row has to fit in the model's window at once.";
  scenes.push(scene('STAT_CALLOUT', n, {
    value: 40000,
    label: 'rows a paste cannot carry',
    atWord: at(n, 'Forty'),
    source: 'An ordinary export off an ordinary system',
  }));
}

{
  const n =
    "So we do something cheaper and better. " +
    "Python describes the file first, and we send the description instead — " +
    "because a description stays the same size however big the file gets.";
  scenes.push(scene('KINETIC_TEXT', n, {kinetic: {
    text: 'Describe the file. Send the description.',
    fx: 'highlight',
    sub: 'the whole idea, in six words',
    color: 'green',
    atWord: at(n, 'cheaper'),
  }}));
}

{
  const n =
    "New file, describe dot py. " +
    "Import csv — that's Python's own reader, and it costs nothing. " +
    "Import statistics for the averages. " +
    "Read the file into a list of rows. Dict reader hands back each row as a small dictionary, " +
    "so we can ask for a column by name. " +
    "Print how many rows we got, so we know the file actually loaded. " +
    "Then walk the columns, one at a time, " +
    "and for each column pull out its values, skipping the blanks. " +
    "No AI involved yet, and nothing has left the machine — so far this is arithmetic.";
  scenes.push(rec(n, 'read the file, walk the columns',
    'The describer, typed from empty.',
    [A('opendesc', 'a second empty file'),
     A('d1', 'reading the file', {wantAtWord: at(n, 'Import'),
       callouts: [{text: "Python's own reader", mark: 'reader', side: 'right', color: 'green',
                   atWord: at(n, 'Dict')}]}),
     A('d2', 'walking the columns', {wantAtWord: at(n, 'walk'),
       callouts: [{text: 'its values, blanks skipped', mark: 'vals', side: 'right', color: 'blue',
                   atWord: at(n, 'blanks')}]})]));
}

{
  const n =
    "Now the question each column has to answer: is this a number, or is it a word? " +
    "And the honest way to find out is to try. " +
    "If every value converts, the column is a number column. " +
    "If any value refuses, the column is text.";
  scenes.push(scene('FLIP_CARD', n, {flip: {
    front: {label: 'try it', text: 'Does every value convert?', color: 'blue'},
    back: {label: 'then', text: 'Measure it — or count it', color: 'green'},
    atWord: at(n, 'try'),
  }}));
}

{
  const n =
    "So: an empty list for the numbers. " +
    "Loop over the values, and try turning each one into a number. " +
    "If that works it goes in the list; if it raises a value error we let it pass, " +
    "because a word isn't a number and that's fine. " +
    "Then, if the count of numbers matches the count of values, every one converted — " +
    "so print the smallest, the largest and the average, all on one line. " +
    "That's the whole numeric branch, and it's only three lines long. " +
    "Otherwise the column is text, so count how often each value shows up, " +
    "take the top three, and print those instead. " +
    "Twenty lines, no model, and every figure exact, because Python counted rather than guessing. " +
    "The AI hasn't been involved yet, and it doesn't need to be. " +
    "Every one of those numbers comes out of the file, not out of a model.";
  scenes.push(rec(n, 'numbers get measured, words get counted',
    'The rest of the describer, typed line by line.',
    [A('d3', 'try each value as a number', {
       zooms: [{mark: 'try', atWord: at(n, 'try')}],
       callouts: [{text: 'not a number — that is fine', mark: 'except', side: 'right',
                   color: 'orange', atWord: at(n, 'fine')}]}),
     A('d4', 'a number column measured', {wantAtWord: at(n, 'matches'),
       callouts: [{text: 'the smallest and the largest', mark: 'minmax', side: 'right',
                   color: 'blue', atWord: at(n, 'smallest')},
                  {text: 'and the average of them', mark: 'mean', side: 'right',
                   color: 'green', atWord: at(n, 'average')}]}),
     A('d5', 'the text branch', {wantAtWord: at(n, 'Otherwise'),
       callouts: [{text: 'the three most common', mark: 'top', side: 'right', color: 'blue',
                   atWord: at(n, 'three')}]})]));
}

// ═══ CHAPTER 6 — run it, then fix it ═════════════════════════════════════════
scenes.push(chapter(
  "Run it — and then we fix the thing you will notice straight away.",
  6, 'Run it, then fix it', 'the part tutorials usually edit out'));

{
  const n =
    "Save it, and run it. " +
    "Fifty rows, and then a line for each column. " +
    "The dates, the regions, the couriers, the products. " +
    "Delivery days runs from three point eight seven up to nineteen point four. " +
    "Order value from eighteen to ninety-six. " +
    "And two statuses: forty-eight delivered, two lost in transit. " +
    "Eight columns described in a few hundred words, and every figure measured rather than guessed.";
  scenes.push(rec(n, 'fifty rows, described',
    'The describer running on the order file.',
    [A('savedesc', 'saved'),
     A('rundesc', 'describe.py, running', {wantAtWord: at(n, 'run'),
       zooms: [{mark: 'days', atWord: at(n, 'Delivery')},
               {mark: 'courier', atWord: at(n, 'statuses')},
               {at: 'full', atWord: at(n, 'described')}],
       callouts: [{text: 'three point eight seven to nineteen point four', mark: 'days',
                   side: 'right', color: 'green', atWord: at(n, 'nineteen')}]})]));
}

{
  const n =
    "But look at the first line of that output. Order id. " +
    "Fifty orders, fifty different ids, and we are printing the top three of them — " +
    "which tells you nothing at all, " +
    "because a column where every value is different has no top three.";
  scenes.push(scene('KINETIC_TEXT', n, {kinetic: {
    text: 'Every value different means nothing to rank',
    fx: 'split',
    sub: 'so skip the column entirely',
    color: 'orange',
    atWord: at(n, 'nothing'),
  }}));
}

{
  const n =
    "So we fix it, right here, before the line that ranks anything. " +
    "If the number of distinct counts equals the number of values, " +
    "then every single one is unique, so we skip that column entirely. " +
    "Two lines, and that's the whole correction. " +
    "Save, and run it again. " +
    "There — order id is gone, and what is left is seven rows that actually tell you something. " +
    "That's the loop, by the way: write it, run it, look at what came out, and correct it.";
  scenes.push(rec(n, 'two lines, and run it again',
    'Correcting the describer in front of you.',
    [A('gotofix', 'back to the ranking line'),
     A('typefix', 'two lines, typed in', {wantAtWord: at(n, 'distinct'),
       callouts: [{text: 'every value is different', mark: 'guard', side: 'right', color: 'orange',
                   atWord: at(n, 'unique')}]}),
     A('savefix', 'saved', {wantAtWord: at(n, 'Save')}),
     A('rerun', 'run it again', {wantAtWord: at(n, 'again'),
       callouts: [{text: 'order_id is gone', mark: 'region', side: 'right', color: 'green',
                   atWord: at(n, 'gone')}]})]));
}

// ═══ CHAPTER 7 — facts, not rows ═════════════════════════════════════════════
scenes.push(chapter(
  "Last file. This is where the two halves meet.",
  7, 'Hand it the facts', 'the description goes, the rows stay home'));

{
  const n =
    "Analyse dot py — the last file we write, and the shortest of the three. " +
    "Import subprocess, which lets one Python program run another. " +
    "Then run the describer and keep what it printed — " +
    "capture output is the flag that hands us the text instead of letting it scroll past. " +
    "Load the settings the same way as before. " +
    "That variable, facts, now holds the whole description as a string.";
  scenes.push(rec(n, 'run the describer, keep the output',
    'The last file, typed from empty.',
    [A('openan', 'the last empty file'),
     A('a1', 'the shortest of the three', {wantAtWord: at(n, 'Import'),
       callouts: [{text: 'hands us the text', mark: 'capture', side: 'right', color: 'blue',
                   atWord: at(n, 'flag')}]})]));
}

{
  const n =
    "A system message — that's the one new thing in this call, and it's worth a moment. " +
    "Role user is the question you are asking right now; " +
    "role system is the standing instruction — who the model is being, for the whole call. " +
    "Here it says: you are a data analyst, use only these facts. " +
    "That second half matters, because it tells the model not to fill in gaps from memory.";
  scenes.push(scene('DIAGRAM', n, {diagram: {
    layout: 'block',
    nodes: [
      {id: 'sys', label: 'system', sub: 'who you are being', color: 'purple',
       atWord: at(n, 'system')},
      {id: 'usr', label: 'user', sub: 'what you are asking', color: 'blue', atWord: at(n, 'user')},
      {id: 'out', label: 'the reply', sub: 'shaped by both', color: 'green', atWord: at(n, 'analyst')},
    ],
    edges: [
      {from: 'sys', to: 'out', label: 'standing rule', atWord: at(n, 'standing')},
      {from: 'usr', to: 'out', label: 'this question', atWord: at(n, 'question')},
    ],
  }}));
}

{
  const n =
    "So we type it. The client, same as before. " +
    "The call, same as before. " +
    "Messages, with the system line first and then the user line, " +
    "and notice what we are sending it: the description Python already wrote, " +
    "and then the question. " +
    "Not one row of the original file goes anywhere near the model — " +
    "the model only ever sees the eight lines of summary. " +
    "Save, run — and there it is. " +
    "Azure gpt-4o, handed eight lines of description instead of fifty rows, " +
    "telling me the Remote region and the FarReach courier have far fewer entries, " +
    "and that despite a mean order value of forty-six point two, two orders were lost in transit. " +
    "That's a tool you built, running on your file.";
  scenes.push(rec(n, 'the answer, from a description',
    'The finished tool, reading the description and answering.',
    [A('a2', 'sending the facts', {
       callouts: [{text: 'the standing instruction', mark: 'system', side: 'right', color: 'purple',
                   atWord: at(n, 'system')},
                  {text: 'description, then question', mark: 'facts', side: 'right', color: 'blue',
                   atWord: at(n, 'description', 2)}]}),
     A('savean', 'saved', {wantAtWord: at(n, 'Save')}),
     A('runan', 'save, then run', {wantAtWord: at(n, 'run'),
       zooms: [{at: 'full', atWord: at(n, 'telling')}]})]));
}

// ═══ CHAPTER 8 — what to do with it ══════════════════════════════════════════
scenes.push(chapter(
  "So what do you actually do with this on Monday morning?",
  8, 'What to do with it', 'same twenty lines, your file'));

{
  const n =
    "Nothing in that describer knows what a courier is, and that's the point. " +
    "The describer counts, measures and spots blanks, so it works on any file with a header row. " +
    "A tester points the describer at test durations and pass rates. " +
    "A developer points it at build times per release, because a build log is a file too. " +
    "An analyst points it at any export from any system. " +
    "Supply chain: lead times and stock levels. " +
    "Support: response and resolution times. " +
    "Same twenty lines, a different file, and not one word of the code has to change.";
  scenes.push(scene('LIST_BUILD', n, {
    heading: 'Same twenty lines, your file',
    items: [
      {text: 'Testing — durations, pass rates per suite', atWord: at(n, 'tester')},
      {text: 'Development — build times per release', atWord: at(n, 'developer')},
      {text: 'Analysis — any export from any system', atWord: at(n, 'analyst')},
      {text: 'Supply chain — lead times and stock', atWord: at(n, 'chain')},
      {text: 'Support — response and resolution times', atWord: at(n, 'Support')},
    ],
  }));
}

{
  const n =
    "And the rule that keeps the whole thing honest, which is worth more than the code. " +
    "If a number matters, compute it. " +
    "How many rows are in this file? Compute it — Python never miscounts. " +
    "Which courier is slowest? Compute that too. " +
    "What do these six complaints have in common? Ask the model. " +
    "Summarise the week in a sentence? Ask the model. " +
    "That's reading, and reading is what a model is for. " +
    "Keep those two jobs apart — Python counts, the model reads — " +
    "and a model will not lie to you about a number, because you never asked it to count one.";
  scenes.push(scene('RULE_TEST', n, {ruleTest: {
    rule: 'If a number matters, compute it',
    kicker: 'the one rule',
    okLabel: 'compute it',
    noLabel: 'ask it',
    cases: [
      {text: 'How many rows are in this file?', title: 'ok', sub: 'counting', color: 'green',
       atWord: at(n, 'rows')},
      {text: 'Which courier is slowest?', title: 'ok', sub: 'counting', color: 'green',
       atWord: at(n, 'courier')},
      {text: 'What do these complaints share?', title: 'no', sub: 'judgement', color: 'blue',
       atWord: at(n, 'complaints')},
      {text: 'Summarise the week in a sentence', title: 'no', sub: 'judgement', color: 'blue',
       atWord: at(n, 'Summarise')},
    ],
    atWord: at(n, 'rule'),
  }}));
}

{
  const n =
    "So that's the whole thing. " +
    "A folder, two commands, a settings file, and about forty lines of Python. " +
    "You picked a provider, you kept your key out of your code, " +
    "and you built something that reads a file and tells you what is in it. " +
    "Everything after this is the same four boxes with a different file in the first one. " +
    "The shape doesn't change, which is why it keeps working.";
  scenes.push(scene('RECAP', n, {
    heading: 'What you just built',
    points: [
      {text: 'A provider — free, or one you already pay for', atWord: at(n, 'provider')},
      {text: 'A key that never touches your code', atWord: at(n, 'key')},
      {text: 'Python describes, the model reads', atWord: at(n, 'reads')},
      {text: 'Forty lines, any file with a header', atWord: at(n, 'boxes')},
    ],
  }));
}

{
  const n =
    "Point it at your own export tonight — whatever is sitting in your downloads folder. " +
    "Change the filename, run it, and see what the model says. " +
    "If this got you started, subscribe, and tell me what you pointed it at.";
  scenes.push(scene('OUTRO_CTA', n, {
    message: 'Change the filename. Run it.',
    sub: 'works on any file with a header row',
  }));
}

// ═════════════════════════════════════════════════════════════════════════════
const spec = {
  meta: {
    topic: 'Building a small Python tool that hands any file to an AI',
    subject: 'Python',
    format: 'long',
    fps: 30,
    audience: 'beginner',
    onePayoff: 'describe a file in Python, then let the model read the description',
    openLoop: 'what does it actually take to get an AI reading your own files?',
    analogy: 'four boxes: your file, Python, a description, the model',
    screenplay: 'documentary',
    topicAxes: ['skill-build', 'economic-pain', 'sovereignty'],
    seo: {
      title: 'Make AI Read Your Own Files — A Complete Python Project (Beginner)',
      altTitles: [
        'Use AI On Your Own Files — Python, From An Empty Folder',
        'Your First AI Tool In Python — Every Line Typed',
      ],
      hook: 'What does it actually take to get an AI reading your own files?',
      breakdown:
        'where to get an AI to talk to for free, how to keep your key out of your code, and ' +
        'forty lines of Python — typed line by line — that describe any file and hand the ' +
        'description to a model',
      queries: [
        'how to use openai api in python',
        'python ai tutorial for beginners',
        'free ai api key no credit card',
        'azure openai python example',
        'analyse csv with ai python',
        'uv python project tutorial',
        'how much does the openai api cost',
        'python dotenv api key best practice',
        'ai for testers and analysts',
        'chat completions api explained',
      ],
      hashtags: ['#python', '#ai', '#tutorial', '#beginners'],
      pinned: 'What file are you going to point it at first?',
      tags: [
        'python', 'ai', 'openai api', 'azure openai', 'ollama', 'groq', 'gemini',
        'beginner python', 'uv', 'dotenv', 'api key', 'csv analysis', 'data analysis',
        'llm tutorial', 'ai for testers', 'ai for analysts', 'local ai',
      ],
      sources: [
        'https://ollama.com',
        'https://ai.google.dev/gemini-api/docs/pricing',
        'https://console.groq.com/docs/rate-limits',
      ],
    },
  },
  brand: {
    theme: 'moderndark', themeLight: 'daylight', design: 'moderndark',
    background: 'plain', channel: CH, logo: 'img:channel_logo.png',
  },
  thumbnail: {
    // NAME FIRST, CLAIM UNDERNEATH. "PYTHON READS IT" asked a scroller what IT was —
    // the bare-subject failure the owner rejected on the FABLE thumbnail, on the one
    // surface that has no sentence in front of it.
    title: 'AI READS YOUR FILES',
    badge: 'Python · from an empty folder',
    note: 'no credit card needed',
    asset: 'si:python',
  },
  scenes,
};

fs.writeFileSync('topics/ai-on-your-own-files/long.json', JSON.stringify(spec, null, 2) + '\n');
const words = scenes.reduce((a, s) => a + s.narration.split(/\s+/).length, 0);
const secs = Math.round(words / 3.05);
const clips = scenes.reduce((a, s) => a + (s.data.recordedStep?.clips?.length ?? 0), 0);
console.log(`wrote topics/ai-on-your-own-files/long.json — ${scenes.length} scenes, ` +
  `${clips} clips cast, ${words} words (~${Math.floor(secs / 60)}m${String(secs % 60).padStart(2, '0')}s)`);
