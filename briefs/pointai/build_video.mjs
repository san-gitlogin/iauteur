#!/usr/bin/env node
// BUILD — topics/ai-on-your-own-files/long.json
//
// ONE STANDALONE BEGINNER TUTORIAL. Nothing before it, nothing after it, no episode number
// anywhere. A viewer who has never called an API can follow it end to end and finish with a
// tool that runs on their own machine, on their own file.
//
// THE THREE INSTRUMENTS, and each is used only for what it is actually good at:
//   LIVE_CODE      every line of code, TYPED, each line anchored to its own narration word
//                  so the keyboard and the mouth land together. No footage can do this — a
//                  capture replays at the speed it was captured and then freezes.
//   RECORDED_STEP  the things a drawing cannot honestly claim: a real toolchain installing,
//                  a real interpreter printing, and somebody else's website.
//                  demos/live-setup.json (dsf 1.5, supersampled) + where-keys-come-from.
//   drawn beats    the flow of the thing, and the arithmetic. A picture of a mechanism.
//
// SOURCES. Prices and free-tier terms are READ OFF the official pages in the recording —
// Google's own pricing page and Groq's own rate-limit docs — and dated on screen. The
// enterprise logos are Ollama's own front page, attributed as such. Every figure printed by
// the tool was produced by running it on this machine.
//
// NO KEY IS EVER ON SCREEN. The demo runs against Ollama on localhost, which needs no key,
// so the .env can be typed in full and honestly. The cloud line beside it is masked at
// source, which cannot be un-masked the way a blur can.
import fs from 'node:fs';

const CH = 'THE NBX STUDIO';
const DATED = 'Read from the providers’ own pages, 2026-09-04';

const normw = (w) => String(w).toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (narration, word, nth = 1) => {
  const ws = narration.split(/\s+/).map(normw);
  const want = normw(word);
  let seen = 0;
  for (let i = 0; i < ws.length; i++) if (ws[i] === want && ++seen === nth) return i + 1;
  throw new Error(`anchor ${JSON.stringify(word)} (#${nth}) not found in: ${narration.slice(0, 80)}…`);
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
const rec = (narration, caption, premise, clips, extra = {}) =>
  scene('RECORDED_STEP', narration, {
    recordedStep: {caption, premise, layout: 'full', color: 'blue', clips, ...extra},
  });

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
    "Here's the whole shape of the project, and it's smaller than you'd think. " +
    "Your file goes into Python. " +
    "Python describes the file — counts the rows, works out the ranges, spots the gaps — " +
    "and the description is a few hundred words instead of forty thousand rows. " +
    "The description goes to the model, " +
    "and what comes back is a sentence you can act on. " +
    "Four boxes. That is the entire project, and everything after this is typing, "  +
    "because the shape never changes.";
  scenes.push(scene('DIAGRAM', n, {diagram: {
    layout: 'flow',
    direction: 'horizontal',
    nodes: [
      {id: 'f', label: 'Your file', sub: 'csv, log, export', color: 'blue',
       atWord: at(n, 'file')},
      {id: 'p', label: 'Python', sub: 'counts and measures', color: 'green',
       atWord: at(n, 'Python')},
      {id: 'd', label: 'A description', sub: 'a few hundred words', color: 'purple',
       atWord: at(n, 'describes')},
      {id: 'm', label: 'The model', sub: 'reads, then answers', color: 'orange',
       atWord: at(n, 'model')},
    ],
    edges: [
      {from: 'f', to: 'p', label: 'you point it', atWord: at(n, 'goes')},
      {from: 'p', to: 'd', label: 'no AI yet', atWord: at(n, 'ranges')},
      {from: 'd', to: 'm', label: 'facts, not rows', atWord: at(n, 'goes', 2)},
    ],
  }}));
}

// ═══ CHAPTER 1 — where a key comes from ══════════════════════════════════════
scenes.push(chapter(
  "First question everybody asks, and it's the right one: where do you get an AI to talk to?",
  1, 'Where the AI comes from', 'three doors, and one is free forever'));

{
  const n =
    "Three options, and the free ones come first because they are not a consolation prize. " +
    "Option one runs the model on your own laptop — this is Ollama's own site. " +
    "No account, no card, and nothing you type leaves the machine, " +
    "which for work files is often the only option allowed.";
  scenes.push(rec(n,
    'free, and it never leaves your laptop',
    'Ollama’s own home page — a model that runs on your machine.',
    [{ref: 'rec:where-keys-come-from#ollama', label: 'Ollama, on its own site', focus: true,
      zooms: [{at: 'full', atWord: at(n, 'laptop')}]}],
    {sourceNote: 'Source: ollama.com — read 2026-09-04'}));
}

{
  // THE ENTERPRISE PROOF, AND IT IS THEIR CLAIM RATHER THAN MINE. These are the marks on
  // Ollama's own front page, above the line "Trusted by more than 9M developers" — recorded
  // in the clip above, and attributed in the source strip so nobody has to take my word.
  const n =
    "And before you write that off as a hobby thing — " +
    "these are the logos Ollama puts on its own front page. " +
    "Apple. NVIDIA. Netflix. NASA. Intel. " +
    "Running a model on hardware you control is not the amateur option, " +
    "it's what you do when the data cannot leave the building.";
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
    "Option two is a cloud key, no card. " +
    "Here is Google's own pricing page, and the word free is theirs, not mine. " +
    "Free input and output tokens, limits instead of a bill. " +
    "But read the line at the bottom, because that line decides everything: " +
    "on the free tier your content improves their products; on paid it does not. " +
    "That is the real difference between the columns.";
  scenes.push(rec(n,
    'free in their own words — and the catch',
    'Google’s published pricing for the Gemini API.',
    [{ref: 'rec:where-keys-come-from#gemini', label: 'the free and paid columns', focus: true,
      callouts: [{text: 'their word, not mine', mark: 'free', side: 'right', color: 'green',
                  atWord: at(n, 'free')}]},
     {ref: 'rec:where-keys-come-from#freetier', label: 'the line that decides it', focus: true,
      wantAtWord: at(n, 'bottom')}],
    {sourceNote: 'Source: ai.google.dev/gemini-api/docs/pricing — read 2026-09-04'}));
}

{
  const n =
    "Groq works the same way — a key with no card, and rate limits instead of a bill. " +
    "Requests per minute, tokens per minute, and when you hit one you wait rather than pay. " +
    "Their own docs page lists every limit, and the numbers move, so check them on the day.";
  scenes.push(rec(n,
    'limits instead of a bill',
    'Groq’s published rate limits.',
    [{ref: 'rec:where-keys-come-from#groq', label: 'the limits, published', focus: true,
      zooms: [{mark: 'limits', atWord: at(n, 'minute')}, {at: 'full', atWord: at(n, 'numbers')}]}],
    {sourceNote: 'Source: console.groq.com/docs/rate-limits — read 2026-09-04'}));
}

{
  // THE ROWS ARE WALKED, NOT SUMMARISED. The first draft priced only the PAID door while the
  // card listed all three, so four of five rows appeared while something else was being
  // said — which the sync audit caught and a viewer would have felt as reading one thing
  // and hearing another. The sentence now visits the doors in the order the card lists them.
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
        {label: 'Data leaves your PC', a: 'no (Ollama)', b: 'yes', atWord: at(n, 'leaves')},
        {label: 'Cloud, no card', a: 'Groq · Google', b: '—', winner: 'a', atWord: at(n, 'cloud')},
        {label: 'A few hundred files', a: '£0', b: '~£1', atWord: at(n, 'pound')},
        {label: 'Switching later', a: '3 lines', b: '3 lines', atWord: at(n, 'swapping')},
      ],
      atWord: at(n, 'doors'),
    },
    source: DATED,
  }));
}

// ═══ CHAPTER 2 — from nothing to a project ═══════════════════════════════════
scenes.push(chapter(
  "Right — nothing installed. Let's go from an empty folder to a working project.",
  2, 'From an empty folder', 'one command, and Python comes with it'));

{
  const n =
    "Here's my folder. One file in it: fifty orders from a made-up shop, " +
    "standing in for whatever export lands on your desk — a test run, a sprint, a supplier list. " +
    "Eight columns, plain text, nothing special about it. " +
    "That's the file we're going to teach a model to read.";
  scenes.push(rec(n,
    'one folder, one file',
    'An ordinary folder with one CSV in it.',
    [{ref: 'rec:live-setup#look', label: 'the folder', focus: true,
      callouts: [{text: 'your file goes here', mark: 'csv', side: 'right', color: 'blue',
                  atWord: at(n, 'orders')}]},
     {ref: 'rec:live-setup#peek', label: 'the first rows', focus: true,
      wantAtWord: at(n, 'columns'),
      callouts: [{text: 'a header row, then data', mark: 'header', side: 'bottom', color: 'green',
                  atWord: at(n, 'text')}]}]));
}

{
  const n =
    "Now, uv. One command installs uv, and here is the part that saves you an evening: " +
    "uv brings Python along with it. " +
    "You don't install Python separately, you don't set up a virtual environment, " +
    "and you don't need to know what either of them is. " +
    "Type uv init, and there's your project, because uv writes the scaffolding for you. " +
    "It writes a config file, a Python version, and a place for your code — " +
    "and that's the whole ceremony.";
  scenes.push(rec(n,
    'one command, and the project exists',
    'uv creating the project from nothing.',
    [{ref: 'rec:live-setup#init', label: 'uv init', focus: true,
      callouts: [{text: 'that is the whole setup', mark: 'made', side: 'bottom', color: 'green',
                  atWord: at(n, 'project')}]},
     {ref: 'rec:live-setup#tree', label: 'what it wrote', focus: true,
      wantAtWord: at(n, 'writes'),
      callouts: [{text: 'what this project needs', mark: 'proj', side: 'right', color: 'blue',
                  atWord: at(n, 'config')},
                 {text: 'which Python to use', mark: 'pyver', side: 'right', color: 'purple',
                  atWord: at(n, 'version')}]}]));
}

{
  const n =
    "One more command and we have the library. " +
    "The library is called openai, and here is the thing worth knowing: openai is not only for OpenAI. " +
    "Ollama speaks it, Groq speaks it, Google speaks it, Azure speaks it. " +
    "One library, and you pick the provider with a setting, not a rewrite.";
  scenes.push(rec(n,
    'one library, every provider',
    'Installing the client library the whole video uses.',
    [{ref: 'rec:live-setup#add', label: 'installing the library', focus: true,
      callouts: [{text: 'this one talks to all of them', mark: 'lib', side: 'right', color: 'green',
                  atWord: at(n, 'speaks')}]}]));
}

// ═══ CHAPTER 3 — the key, safely ═════════════════════════════════════════════
scenes.push(chapter(
  "Before a single line of Python, the habit that matters most.",
  3, 'Where the key lives', 'never in your code — not once'));

{
  const n =
    "Settings go in a file called dot env, and we type it now. " +
    "Three lines. " +
    "Base URL is which provider you're talking to, and mine points at my own laptop. " +
    "API key: on Ollama there isn't one, so the word ollama is a placeholder the library " +
    "insists on and the server ignores. " +
    "And model is which brain you want. " +
    "Underneath, the same three lines for a cloud provider, so you can see where a real key " +
    "would go — and notice I've starred mine out, because a key on screen is a key gone. " +
    "Seven lines. That is the entire configuration for this project.";
  scenes.push(scene('LIVE_CODE', n, {liveCode: {
    headline: 'Three lines choose your provider',
    filename: '.env',
    language: 'ini',
    newFile: true,
    color: 'green',
    lines: [
      {text: 'AI_BASE_URL=http://localhost:11434/v1', detail: 'which provider you talk to',
       atWord: at(n, 'Base')},
      {text: 'AI_API_KEY=ollama', detail: 'a placeholder — Ollama ignores it',
       atWord: at(n, 'key')},
      {text: 'AI_MODEL=qwen3:4b', detail: 'which brain you want', atWord: at(n, 'model')},
      {text: '', atWord: at(n, 'Underneath')},
      {text: '# a cloud provider instead:', detail: 'same three lines, different values',
       atWord: at(n, 'cloud')},
      {text: '# AI_BASE_URL=https://api.groq.com/openai/v1', atWord: at(n, 'provider', 2)},
      {text: '# AI_API_KEY=gsk_************************', detail: 'yours is a long secret string',
       atWord: at(n, 'starred')},
    ],
    caption: 'settings in a file, never in the code',
    atWord: at(n, 'Settings'),
  }}));
}

{
  const n =
    "And one line in gitignore, which is the list of things git must never pick up. " +
    "Put dot env in that list and your key stays on your machine even when your code doesn't. " +
    "Thirty seconds of work, and the difference between a key that is yours " +
    "and a key that is on the internet.";
  scenes.push(scene('LIVE_CODE', n, {liveCode: {
    headline: 'One line keeps it yours',
    filename: '.gitignore',
    language: 'ini',
    color: 'red',
    before: [{text: '# Python-generated files'}, {text: '__pycache__/'}, {text: '.venv'}],
    lines: [
      {text: '', atWord: at(n, 'gitignore')},
      {text: '# never commit your key', detail: 'a note for future you', atWord: at(n, 'list')},
      {text: '.env', detail: 'now git cannot take it', atWord: at(n, 'machine')},
    ],
    caption: 'thirty seconds, once',
    atWord: at(n, 'line'),
  }}));
}

// ═══ CHAPTER 4 — the first call ══════════════════════════════════════════════
scenes.push(chapter(
  "Now the bit you came for. Nine lines, and you're talking to a model.",
  4, 'Your first call', 'nine lines, and what each one does'));

{
  const n =
    "New file, ask dot py, and we write it together. " +
    "Import os so we can read those settings. " +
    "Import load dotenv, which is the thing that actually reads the dot env file. " +
    "Import OpenAI — the library, remember, not the company. " +
    "Call load dotenv, and now the settings are available. " +
    "Then build the client: base URL and api key, both pulled from the file rather than " +
    "typed here. " +
    "That's the client done, and it works against any of the four providers we looked at. " +
    "Read it back once — every one of those lines is either an import or a setting.";
  scenes.push(scene('LIVE_CODE', n, {liveCode: {
    headline: 'Building the client',
    filename: 'ask.py',
    language: 'py',
    newFile: true,
    color: 'blue',
    lines: [
      {text: 'import os', detail: 'so we can read settings', atWord: at(n, 'os')},
      {text: 'from dotenv import load_dotenv', detail: 'reads the .env file',
       atWord: at(n, 'dotenv')},
      {text: 'from openai import OpenAI', detail: 'the library, not the company',
       atWord: at(n, 'OpenAI')},
      {text: '', atWord: at(n, 'Call')},
      {text: 'load_dotenv()', detail: 'settings are now available', atWord: at(n, 'available')},
      {text: '', atWord: at(n, 'build')},
      {text: 'client = OpenAI(', detail: 'one client, any provider', atWord: at(n, 'client')},
      {text: '    base_url=os.getenv("AI_BASE_URL"),', detail: 'from the file, not from here',
       atWord: at(n, 'base')},
      {text: '    api_key=os.getenv("AI_API_KEY"),', atWord: at(n, 'api')},
      {text: ')', atWord: at(n, 'api')},
    ],
    caption: 'the client, built from settings',
    atWord: at(n, 'file'),
  }}));
}

{
  const n =
    "And now the call itself, which is the single most useful thing in this video. " +
    "Chat completions create. " +
    "Model — which one, from the settings. " +
    "Messages — and this is the part worth slowing down for. " +
    "A message has a role, and a message has content. " +
    "Role user means this is you talking. " +
    "Content is what you're actually asking. " +
    "And that is the whole interface: " +
    "you send a list of messages, you get one back. " +
    "Print the answer, and print usage while we're here, because tokens are what you're billed on. " +
    "Eleven lines, and every single one of them is either a setting or a message.";
  scenes.push(scene('LIVE_CODE', n, {liveCode: {
    headline: 'The one call that does everything',
    filename: 'ask.py',
    language: 'py',
    color: 'purple',
    before: [{text: 'client = OpenAI('}, {text: '    base_url=os.getenv("AI_BASE_URL"),'},
             {text: '    api_key=os.getenv("AI_API_KEY"),'}, {text: ')'}],
    lines: [
      {text: '', atWord: at(n, 'call')},
      {text: 'answer = client.chat.completions.create(', detail: 'the one call, every time',
       atWord: at(n, 'completions')},
      {text: '    model=os.getenv("AI_MODEL"),', detail: 'which model, from settings',
       atWord: at(n, 'Model')},
      {text: '    messages=[', detail: 'a list — this is the conversation',
       atWord: at(n, 'Messages')},
      {text: '        {"role": "user",', detail: 'role: who is speaking', atWord: at(n, 'Role')},
      {text: '         "content": "Reply with the word: ready"},', detail: 'content: what you ask',
       atWord: at(n, 'Content')},
      {text: '    ],', atWord: at(n, 'list')},
      {text: ')', atWord: at(n, 'back')},
      {text: '', atWord: at(n, 'Print')},
      {text: 'print(answer.choices[0].message.content)', detail: 'the reply, as text',
       atWord: at(n, 'answer')},
      {text: 'print(answer.usage)', detail: 'what it cost you', atWord: at(n, 'usage')},
    ],
    caption: 'a role, some content, and an answer',
    atWord: at(n, 'call'),
  }}));
}

{
  const n =
    "Save the file, run it, and there is the word back from a model running on my own laptop. " +
    "Underneath is the usage line: fifteen tokens went in, and tokens are what you are charged for. " +
    "A token is roughly three quarters of a word. " +
    "Fifteen of them costs so little it is hard to write down, " +
    "and on Ollama it costs nothing at all, because it never left the room.";
  scenes.push(rec(n,
    'the first answer, and what it cost',
    'Running the nine lines we just wrote.',
    [{ref: 'rec:live-setup#runask', label: 'ask.py, running', focus: true,
      zooms: [{mark: 'answer', atWord: at(n, 'word')},
              {mark: 'tokens', atWord: at(n, 'usage')},
              {at: 'full', atWord: at(n, 'token')}],
      callouts: [{text: 'the model answered', mark: 'answer', side: 'right', color: 'green',
                  atWord: at(n, 'back')},
                 {text: 'what you are billed on', mark: 'tokens', side: 'right', color: 'yellow',
                  atWord: at(n, 'charged')}]}]));
}

// ═══ CHAPTER 5 — describing a file ═══════════════════════════════════════════
scenes.push(chapter(
  "So the model talks. Now let's point it at your own file.",
  5, 'Describing your file', 'Python counts so the model needn’t'));

{
  const n =
    "And go round the thing everybody tries first. " +
    "The instinct is to paste the whole file into a chat window and ask your question. " +
    "On fifty rows that works fine. " +
    "On forty thousand rows it stops working, " +
    "because every row has to fit in the model's window at once.";
  scenes.push(scene('STAT_CALLOUT', n, {
    value: 40000,
    label: 'rows a paste cannot carry',
    atWord: at(n, 'thousand'),
    source: 'An ordinary Monday-morning export',
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
    atWord: at(n, 'better'),
  }}));
}

{
  const n =
    "New file, describe dot py. " +
    "Import csv — that's Python's own reader, and it's free. " +
    "Import statistics for the averages. " +
    "Read the file into a list of rows. Dict reader hands back each row as a little dictionary, " +
    "so we can ask for a column by name. " +
    "Print how many rows we got, so we know the file actually loaded. " +
    "No AI involved yet, and nothing has left the machine — so far this is arithmetic.";
  scenes.push(scene('LIVE_CODE', n, {liveCode: {
    headline: 'Reading the file',
    filename: 'describe.py',
    language: 'py',
    newFile: true,
    color: 'green',
    lines: [
      {text: 'import csv', detail: "Python's own reader, free", atWord: at(n, 'csv')},
      {text: 'import statistics', detail: 'for the averages', atWord: at(n, 'statistics')},
      {text: '', atWord: at(n, 'Read')},
      {text: 'rows = list(csv.DictReader(open("orders.csv")))',
       detail: 'each row becomes a dictionary', atWord: at(n, 'Dict')},
      {text: 'print("rows:", len(rows))', detail: 'how many did we get?',
       atWord: at(n, 'Print')},
    ],
    caption: 'no model involved yet',
    atWord: at(n, 'file'),
  }}));
}

{
  // The narration WALKS THE CODE IN ORDER, so each line lands on the word that names it and
  // the anchors ascend without being forced. Writing the sentence to fit the listing is the
  // cheap half of making a typing beat sync; forcing anchors onto whatever words happen to
  // be there is the expensive half, and it reads badly.
  const n =
    "Now we go through the columns, one at a time. " +
    "For each column we pull out its values, skipping the blanks. " +
    "Then we make an empty list for the numbers. " +
    "We loop over the values, and we try turning each one into a number. " +
    "If that works, it goes in the list. " +
    "And if it raises a value error, we let it pass — " +
    "because a word is not a number, and that is fine.";
  scenes.push(scene('LIVE_CODE', n, {liveCode: {
    headline: 'Is this column a number?',
    filename: 'describe.py',
    language: 'py',
    color: 'blue',
    before: [{text: 'rows = list(csv.DictReader(open("orders.csv")))'},
             {text: 'print("rows:", len(rows))'}],
    lines: [
      {text: '', atWord: at(n, 'columns')},
      {text: 'for name in rows[0]:', detail: 'every column, one at a time',
       atWord: at(n, 'column')},
      {text: '    values = [r[name] for r in rows if r[name]]',
       detail: 'its values, blanks skipped', atWord: at(n, 'values')},
      {text: '    numbers = []', detail: 'an empty list to fill', atWord: at(n, 'empty')},
      {text: '    for v in values:', atWord: at(n, 'loop')},
      {text: '        try:', detail: 'try it, and cope if it fails', atWord: at(n, 'try')},
      {text: '            numbers.append(float(v))', detail: 'it converted — keep it',
       atWord: at(n, 'works')},
      {text: '        except ValueError:', detail: 'not a number, and that is fine',
       atWord: at(n, 'raises')},
      {text: '            pass', atWord: at(n, 'pass')},
    ],
    caption: 'try it, and cope when it fails',
    atWord: at(n, 'go'),
  }}));
}

{
  const n =
    "So: if the count of numbers matches the count of values, every one converted, " +
    "and we print the smallest, the largest and the average. " +
    "Otherwise it's a text column, so we count how often each value shows up " +
    "and print the top three. " +
    "Twenty lines, no model, and every one of those figures is exact, " +
    "because Python counted them rather than guessing. " +
    "Take a look at the whole thing — that is the describer, finished.";
  scenes.push(scene('LIVE_CODE', n, {liveCode: {
    headline: 'Numbers get measured, words get counted',
    filename: 'describe.py',
    language: 'py',
    color: 'purple',
    before: [{text: '        except ValueError:'}, {text: '            pass'}],
    lines: [
      {text: '', atWord: at(n, 'count')},
      {text: '    if len(numbers) == len(values):', detail: 'every value converted',
       atWord: at(n, 'matches')},
      {text: '        print(f"{name:<16} min {min(numbers):<7}"',
       detail: 'smallest, largest, average', atWord: at(n, 'smallest')},
      {text: '              f" max {max(numbers):<7}"', atWord: at(n, 'largest')},
      {text: '              f" mean {round(statistics.fmean(numbers), 2)}")',
       atWord: at(n, 'average')},
      {text: '        continue', atWord: at(n, 'Otherwise')},
      {text: '', atWord: at(n, 'text')},
      {text: '    counts = {}', detail: 'how often each value shows up',
       atWord: at(n, 'count', 3)},
      {text: '    for v in values:', atWord: at(n, 'often')},
      {text: '        counts[v] = counts.get(v, 0) + 1', atWord: at(n, 'shows')},
      {text: '    top = sorted(counts.items(), key=lambda kv: -kv[1])[:3]',
       detail: 'the three most common', atWord: at(n, 'three')},
      {text: '    line = ", ".join(f"{k} {n}" for k, n in top)',
       detail: 'stitch them into one string', atWord: at(n, 'Twenty')},
      {text: '    print(f"{name:<16} {line}")', atWord: at(n, 'Twenty')},
    ],
    caption: 'exact, because Python counted',
    atWord: at(n, 'count'),
  }}));
}

// ═══ CHAPTER 6 — the live correction ═════════════════════════════════════════
scenes.push(chapter(
  "Run it — and then we'll fix the thing you'll notice straight away.",
  6, 'Run it, then fix it', 'the bit tutorials usually edit out'));

{
  const n =
    "Fifty rows. And then a line per column: " +
    "the dates, the regions, the couriers, the products, " +
    "delivery days from three point eight seven up to nineteen point four, " +
    "order value from eighteen to ninety-six, " +
    "and the two statuses. " +
    "Eight columns described in a few hundred words, and every figure exact.";
  scenes.push(rec(n,
    'fifty rows, described',
    'The describer running on the order file.',
    [{ref: 'rec:live-setup#rundesc', label: 'describe.py, running', focus: true,
      zooms: [{mark: 'days', atWord: at(n, 'delivery')},
              {marks: ['courier', 'status'], atWord: at(n, 'statuses')},
              {at: 'full', atWord: at(n, 'described')}],
      callouts: [{text: 'measured, not guessed', mark: 'days', side: 'right', color: 'green',
                  atWord: at(n, 'nineteen')}]}]));
}

{
  const n =
    "But look at the first line of that output. Order id. " +
    "Fifty orders, fifty different ids, and we're printing the top three of them — " +
    "which tells you nothing at all, because a column where every value is different " +
    "has no top three. " +
    "So let's fix it, right here, before we rank anything. " +
    "If the number of distinct counts equals the number of values, " +
    "then every single one is unique, so we skip the column entirely. " +
    "Two lines typed in, save, and run it again. " +
    "There — order id is gone, and what's left is seven rows that actually tell you something.";
  scenes.push(scene('LIVE_CODE', n, {liveCode: {
    headline: 'Two lines, typed in',
    filename: 'describe.py',
    language: 'py',
    color: 'orange',
    before: [{text: '    counts = {}'}, {text: '    for v in values:'},
             {text: '        counts[v] = counts.get(v, 0) + 1'}],
    lines: [
      {text: '    if len(counts) == len(values):', detail: 'every value is different',
       atWord: at(n, 'distinct')},
      {text: '        continue', detail: 'so there is nothing to rank',
       atWord: at(n, 'skip')},
    ],
    runCmd: 'uv run python describe.py',
    runAtWord: at(n, 'save'),
    output: [
      {text: 'rows: 50'},
      {text: 'region           North 20, Central 20, Remote 10'},
      {text: 'courier          RapidPost 20, CityLink 20, FarReach 10', color: 'green'},
      {text: 'delivery_days    min 3.87   max 19.4   mean 5.26', color: 'green'},
      {text: 'status           delivered 48, lost_in_transit 2', color: 'green'},
    ],
    outAtWord: at(n, 'again'),
    caption: 'order_id gone, the useful rows left',
    atWord: at(n, 'output'),
  }}));
}

// ═══ CHAPTER 7 — facts, not rows ═════════════════════════════════════════════
scenes.push(chapter(
  "Last file. This is where the two halves meet.",
  7, 'Hand it the facts', 'the description goes, the rows stay home'));

{
  const n =
    "Analyse dot py. " +
    "Run the describer and keep what it printed — that's what subprocess does here, " +
    "and capture output is the flag that hands us the text instead of letting it scroll past. " +
    "Build the same client as before. " +
    "Then the call, with one new thing in it: a system message. " +
    "Role system is the standing instruction — who the model is being, for this whole call. " +
    "Role user is the question, and notice what we are sending it: " +
    "the description first, then the question. Not one row of the original file. " +
    "Thirteen lines, and the second half of the project is done.";
  scenes.push(scene('LIVE_CODE', n, {liveCode: {
    headline: 'The description goes, the rows stay',
    filename: 'analyse.py',
    language: 'py',
    newFile: true,
    color: 'blue',
    lines: [
      {text: 'import subprocess', detail: 'to run our own describer',
       atWord: at(n, 'subprocess')},
      {text: 'facts = subprocess.run(', detail: 'run it and keep the output',
       atWord: at(n, 'here')},
      {text: '    ["python", "describe.py"],', atWord: at(n, 'capture')},
      {text: '    capture_output=True, text=True).stdout',
       detail: 'hands us the text', atWord: at(n, 'text')},
      {text: '', atWord: at(n, 'client')},
      {text: 'answer = client.chat.completions.create(', atWord: at(n, 'call')},
      {text: '    model=os.getenv("AI_MODEL"),', atWord: at(n, 'new')},
      {text: '    messages=[', atWord: at(n, 'system')},
      {text: '        {"role": "system", "content":', detail: 'who the model is being',
       atWord: at(n, 'standing')},
      {text: '         "You are a data analyst. Use only these facts."},',
       atWord: at(n, 'being')},
      {text: '        {"role": "user", "content":', detail: 'the question', atWord: at(n, 'question')},
      {text: '         facts + "\\n\\nWhat stands out?"},', detail: 'description, then question',
       atWord: at(n, 'description')},
      {text: '    ])', atWord: at(n, 'row')},
    ],
    caption: 'a system message, and the facts',
    atWord: at(n, 'Analyse'),
  }}));
}

{
  const n =
    "And there it is. " +
    "A model on my own laptop, given eight lines of description instead of fifty rows, " +
    "telling me ninety-six per cent of orders arrived, and that delivery times vary a lot — " +
    "with a maximum of nineteen point four days against a mean of five point two six. " +
    "The model found the odd one, from a description rather than the rows. " +
    "That is a tool you built, running on your machine, on your file, for nothing at all.";
  scenes.push(rec(n,
    'the answer, from your own machine',
    'The finished tool, reading the description and answering.',
    [{ref: 'rec:live-setup#runan', label: 'analyse.py, running', focus: true,
      zooms: [{at: 'full', atWord: at(n, 'laptop')},
              {at: 'full', atWord: at(n, 'maximum')},
              {at: 'full', atWord: at(n, 'built')}]}]));
}

// ═══ CHAPTER 8 — where this goes ═════════════════════════════════════════════
scenes.push(chapter(
  "So what do you actually do with this on Monday morning?",
  8, 'What to do with it', 'same twenty lines, your file'));

{
  const n =
    "Nothing in that describer knows what a courier is, and that is the point. " +
    "It counts, measures and spots blanks, so it works on any file with a header row. " +
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
    "And the rule that keeps it honest, which is worth more than the code: " +
    "if a number matters, compute it. " +
    "How many rows are in this file? Compute it — Python never miscounts. " +
    "Which courier is slowest? Compute that too. " +
    "What do these six complaints have in common? Ask the model. " +
    "Summarise the week in a sentence? Ask the model. " +
    "That is reading, and reading is what a model is for. " +
    "Keep those two jobs apart — Python counts, the model reads — " +
    "and a model will not lie to you about a number, because you never asked it to count one. " +
    "That habit is worth more than the forty lines we wrote.";
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
      {text: 'What do these complaints share?', title: 'no', sub: 'reading', color: 'blue',
       atWord: at(n, 'complaints')},
      {text: 'Summarise this week in a sentence', title: 'no', sub: 'reading', color: 'blue',
       atWord: at(n, 'reading', 2)},
    ],
    atWord: at(n, 'rule'),
  }}));
}

{
  const n =
    "So that's the whole thing. " +
    "A folder, one command, a settings file, and about forty lines of Python. " +
    "You picked a provider without a credit card, you kept your key out of your code, " +
    "and you built something that reads a file and tells you what's in it. " +
    "Everything after this is the same four boxes with a different file in the first one. " +
    "The shape does not change, which is why it keeps working.";
  scenes.push(scene('RECAP', n, {
    heading: 'What you just built',
    points: [
      {text: 'A provider, free, no card', atWord: at(n, 'provider')},
      {text: 'A key that never touches your code', atWord: at(n, 'key')},
      {text: 'Python describes, the model reads', atWord: at(n, 'reads')},
      {text: 'Forty lines, any file with a header', atWord: at(n, 'boxes')},
    ],
  }));
}

{
  const n =
    "Point it at your own export tonight — whatever's sitting in your downloads folder. " +
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
        'Your First AI Tool In Python — No Credit Card Needed',
      ],
      hook: 'What does it actually take to get an AI reading your own files?',
      breakdown:
        'where to get an AI to talk to for free, how to keep your key out of your code, and ' +
        'forty lines of Python that describe any file and hand the description to a model',
      queries: [
        'how to use openai api in python',
        'python ai tutorial for beginners',
        'free ai api key no credit card',
        'run ai model locally ollama python',
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
        'python', 'ai', 'openai api', 'ollama', 'groq', 'gemini', 'beginner python',
        'uv', 'dotenv', 'api key', 'csv analysis', 'data analysis', 'llm tutorial',
        'ai for testers', 'ai for analysts', 'local ai',
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
    title: 'PYTHON READS IT',
    badge: 'your files, your machine',
    note: 'no credit card needed',
    asset: 'si:python',
  },
  scenes,
};

fs.writeFileSync('topics/ai-on-your-own-files/long.json', JSON.stringify(spec, null, 2) + '\n');
const words = scenes.reduce((a, s) => a + s.narration.split(/\s+/).length, 0);
const secs = Math.round(words / 3.05);
console.log(`wrote topics/ai-on-your-own-files/long.json — ${scenes.length} scenes, ${words} words ` +
  `(~${Math.floor(secs / 60)}m${String(secs % 60).padStart(2, '0')}s at 3.05 words/s)`);
