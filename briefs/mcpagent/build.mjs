#!/usr/bin/env node
// BUILD — topics/code-an-ai-agent-with-mcp/long.json
//
// CODING AN AI AGENT WITH MCP, FOR SOMEBODY WHO HAS NEVER SEEN IT.
//
// Owner's brief: *"Coding an AI Agent in under 20 minutes or even less. We are gonna demo
// MCP… Beginner friendly. Coding video where you must create files and code and show the
// output… This should not compromise beginner friendly at any cost."*
//
// WHAT IS DIFFERENT FROM THE LAST CUT, and all of it is a rule paid for there:
//
//   · OVERLAYS, NOT ONLY CALLOUTS. The last video shipped 45 callouts and ZERO overlays —
//     every explanation a text label on a leader line. `clips[].overlay` DEPICTS what a
//     line does (rows / chain / split / swap / tally); a callout only NAMES a thing already
//     on screen. The linter rejects a coding spec with no overlays now.
//   · THE VOICE RATE IS NOT TOUCHED. Pace comes from words over a clip, never from playback
//     speed. `check-holds.mjs` is the measurement.
//   · THE LIBRARY IS CREDITED — spoken, on screen, and in meta.seo.sources, which the
//     linter enforces against the install command baked into the footage.
//   · NO PROVIDER TOUR. Owner: *"dont waste your time with explaining about ollama… just
//     mention you are gonna use azure open ai api and you can also use any api of your
//     choice."* One line, then on with it.
//
// THE OPENING IS AN ARCHITECTURE DRAWING, top to bottom with real branches, because the
// owner asked for the plan to be drawn before any code is typed. Fixing that beat turned up
// two defects in the tree layout — levels centred independently of their parents, and edge
// labels silently dropped — both repaired in src/diagrams/layouts.ts.
import fs from 'node:fs';

const CH = 'THE NBX STUDIO';

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
const rec = (narration, caption, premise, clips, extra = {}) =>
  scene('RECORDED_STEP', narration, {
    recordedStep: {caption, premise, layout: 'full', color: 'blue', clips, ...extra},
  });

// `atWord` is anchor-spec's OUTPUT; the word THIS script picked is the INTENT, so it moves
// to `wantAtWord` on clips, callouts, zooms AND overlays before it ever reaches the solver.
const intent = (o = {}) => {
  const move = (e) => (e && e.atWord != null ? {...e, wantAtWord: e.atWord, atWord: undefined} : e);
  const out = {...o};
  if (o.callouts) out.callouts = o.callouts.map(move);
  if (o.zooms) out.zooms = o.zooms.map(move);
  return out;
};
const A = (id, label, opts = {}) => ({ref: `rec:mcp-agent#${id}`, label, focus: true, ...intent(opts)});
const W = (id, label, opts = {}) => ({ref: `rec:mcp-official#${id}`, label, focus: true, ...intent(opts)});

const scenes = [];

// ═══ OPENING ═════════════════════════════════════════════════════════════════
{
  const n = "An AI agent, in Python, that reads your logs and answers you. " +
            "Five files. Let's write them.";
  scenes.push(scene('HOOK', n, {
    headline: 'CODE AN AI AGENT',
    subtext: 'Python + MCP, five files, every line typed',
    hookVariant: 'statement',
    headlineAtWord: at(n, 'AI'),
  }));
}

{
  const n =
    `Welcome to ${CH}. Today we build an AI agent in Python — ` +
    "a program handed a question in plain English, that works out which of your own " +
    "tools answers it, runs that tool, and replies. " +
    "MCP is what makes it possible. So what does that take?";
  scenes.push(scene('TITLE_CARD', n, {
    title: 'Code an AI agent with MCP',
    subtitle: 'from an empty folder, every line typed',
  }));
}

// THE PLAN, DRAWN. Owner: *"You must at first have a component that properly animates. A
// top to bottom flow chart that has clear branches… like an architecture diagram."*
{
  const n =
    "Here's everything we're about to build, and it's five files. " +
    "At the top: your question, typed in plain English. " +
    "That goes into agent dot py, the loop you write yourself. " +
    "The loop asks a model which tool to use — " +
    "I am using Azure OpenAI here, and any API you like will do just as well. " +
    "The tools themselves live in server dot py, which is your MCP server. " +
    "Server dot py wraps tools dot py: three ordinary Python functions, nothing clever. " +
    "Two of them read service dot log, a log file your own app wrote. " +
    "The other calls the orders API, a small web service running on your machine. " +
    "Five files, top to bottom, and we type every line of all of them.";
  scenes.push(scene('DIAGRAM', n, {diagram: {
    layout: 'tree',
    nodes: [
      {id: 'q', label: 'Your question', sub: 'in plain English', color: 'blue',
       atWord: at(n, 'question')},
      {id: 'agent', label: 'agent.py', sub: 'the loop you write', color: 'purple',
       parent: 'q', atWord: at(n, 'agent')},
      {id: 'model', label: 'Azure OpenAI', sub: 'picks a tool', color: 'orange',
       parent: 'agent', atWord: at(n, 'Azure')},
      {id: 'server', label: 'server.py', sub: 'your MCP server', color: 'green',
       parent: 'agent', atWord: at(n, 'server')},
      {id: 'tools', label: 'tools.py', sub: 'three functions', color: 'blue',
       parent: 'server', atWord: at(n, 'tools', 2)},
      {id: 'log', label: 'service.log', sub: 'your app wrote it', color: 'purple',
       parent: 'tools', atWord: at(n, 'log')},
      {id: 'api', label: 'the orders API', sub: 'a small web service', color: 'orange',
       parent: 'tools', atWord: at(n, 'orders')},
    ],
    edges: [
      {from: 'q', to: 'agent', label: 'you ask', atWord: at(n, 'loop')},
      {from: 'agent', to: 'model', label: 'which tool?', atWord: at(n, 'which')},
      {from: 'agent', to: 'server', label: 'run it', atWord: at(n, 'themselves')},
      {from: 'server', to: 'tools', label: 'wraps', atWord: at(n, 'wraps')},
      {from: 'tools', to: 'log', label: 'reads', atWord: at(n, 'read')},
      {from: 'tools', to: 'api', label: 'calls', atWord: at(n, 'calls')},
    ],
  }}));
}

{
  const n =
    "Before we type a single line, here's the thing that makes an agent necessary at all. " +
    "A model runs on somebody else's machines. " +
    "The model can't open your log file, it can't call your service, " +
    "and it can't see your database, because none of those are text it was given. " +
    "Everything useful is on your side of that line. " +
    "The only thing that ever crosses is code you write — " +
    "which is exactly what we spend the next twenty minutes doing.";
  scenes.push(scene('MCP_REACH', n, {mcpReach: {
    headline: 'What a model [cannot touch]',
    caption: 'the hard line',
    premise: "The model runs on a provider's servers. Everything on the right is on your machine, and the line between them is real.",
    color: 'purple',
    atWord: 1,
    ends: [{label: 'THE MODEL'}, {label: 'YOUR MACHINE'}],
    cells: [
      {label: 'your log file', sub: 'service.log, written by your app',
       icon: 'lucide:file-text', text: 'out', atWord: at(n, 'log')},
      {label: 'your service', sub: 'the API on port 8000',
       icon: 'lucide:server', text: 'out', atWord: at(n, 'service')},
      {label: 'your database', sub: 'every row behind your app',
       icon: 'lucide:database', text: 'out', atWord: at(n, 'database')},
      {label: 'your code', sub: 'the one thing that reaches both',
       icon: 'lucide:terminal', text: 'bridge', atWord: at(n, 'crosses')},
    ],
  }}));
}

// ═══ CHAPTER 1 — the folder, and the tools we install ════════════════════════
scenes.push(chapter(
  "Nothing installed yet. Let's go from an empty folder to a running service.",
  1, 'From an empty folder', 'one command, and six libraries'));

{
  const n =
    "Here's the folder, and there's nothing in it but seven empty files. " +
    "uv init makes it a Python project — that's the pyproject file and the lock file. " +
    "Then one command brings in everything we need. " +
    "mcp is the official Python SDK for the Model Context Protocol, " +
    "written and maintained by the people who designed the protocol, " +
    "and we'll look at their own page for it in a few minutes. " +
    "FastAPI and uvicorn give us a small web service to point the agent at. " +
    "httpx makes HTTP calls, openai talks to the model, " +
    "and python-dotenv reads our settings out of a file.";
  scenes.push(rec(n, 'an empty folder, and six libraries',
    'The project, and the packages the whole video is built on.',
    [A('look', 'seven empty files'),
     A('init', 'uv init', {wantAtWord: at(n, 'init'),
       callouts: [{text: 'now it is a project', mark: 'made', side: 'right', color: 'green',
                   atWord: at(n, 'pyproject')}]}),
     A('add', 'the libraries', {wantAtWord: at(n, 'command')}),
     A('added', 'written into the project', {wantAtWord: at(n, 'SDK'),
       callouts: [{text: 'the official MCP SDK', side: 'top', color: 'purple',
                   atWord: at(n, 'official')},
                  {text: 'a service to point at', side: 'bottom', color: 'blue',
                   atWord: at(n, 'FastAPI')}]})],
    {sourceNote: 'mcp — the official Python SDK: github.com/modelcontextprotocol/python-sdk'}));
}

// ═══ CHAPTER 2 — a service, and the log it writes ════════════════════════════
scenes.push(chapter(
  "First the thing an agent would investigate: a service, and the log it leaves behind.",
  2, 'A service to ask about', 'and the log it writes itself'));

{
  const n =
    "New file, api dot py. Api dot py is a tiny web service, and FastAPI makes one in a few lines. " +
    "We import it, we create the app, " +
    "and we keep three orders in a plain Python dictionary — " +
    "no database, because a database isn't what this video is about. " +
    "Notice the third one: SO one thousand and three, lost in transit. " +
    "One of these three is not fine, and that is deliberate — " +
    "we want the log to have something in it worth asking about. " +
    "And if you've never used FastAPI before, that's fine — " +
    "the whole idea is that you write an ordinary Python function, " +
    "put one line above it saying which web address should call it, " +
    "and FastAPI does the web part for you.";
  scenes.push(rec(n, 'a small service, in a few lines',
    'The app the agent will later be asked about.',
    [A('openapi', 'an empty file'),
     A('api1', 'the app, and three orders', {wantAtWord: at(n, 'import'),
       zooms: [{mark: 'app', atWord: at(n, 'create')}, {mark: 'orders', atWord: at(n, 'third')}],
       callouts: [{text: 'no database needed', mark: 'orders', side: 'right', color: 'green',
                   atWord: at(n, 'dictionary')}]})]));
}

{
  const n =
    "Now the part that matters most, and it's only ten lines. " +
    "A middleware is a piece of code that runs on every single request, " +
    "before and after the real work. " +
    "We note the time, we let the request happen, we measure how long it took, " +
    "and we write one line to a file called service dot log. " +
    "That's it. That's where our log comes from — " +
    "the app writes it, request by request, exactly like yours does at work. " +
    "No fixture, no sample file, nothing downloaded. " +
    "Ten lines, and the service starts keeping its own diary.";
  scenes.push(rec(n, 'the app writes its own log',
    'A middleware that records one line per request.',
    [A('api2', 'a line per request', {
       zooms: [{mark: 'mw', atWord: at(n, 'middleware')}, {mark: 'write', atWord: at(n, 'write')}],
       callouts: [{text: 'runs on every request', mark: 'mw', side: 'right', color: 'purple',
                   atWord: at(n, 'every')},
                  {text: 'one line, per request', mark: 'write', side: 'right', color: 'blue',
                   atWord: at(n, 'file')}]})]));
}

{
  const n =
    "So here's the journey every single request now takes. " +
    "A request arrives, the middleware starts a clock, the route does the actual work, " +
    "the middleware stops the clock, and one line drops into the log. " +
    "Five steps, whether the request took one millisecond or two seconds, " +
    "which means the log is complete by construction rather than by luck.";
  // PIPELINE was cast here first and is the wrong shape for a TAUGHT beat: its stages
  // march on a fixed 22-frame interval from ONE scene anchor (src/scenes/Pipeline.tsx),
  // which is the fixed-interval pattern LAW 0i.1 forbids — the fourth stage lights
  // whether or not the voice has reached it. A flow diagram anchors every node AND
  // every edge on its own word, so the request travels at the speed of the sentence.
  scenes.push(scene('DIAGRAM', n, {diagram: {
    layout: 'flow',
    direction: 'horizontal',
    nodes: [
      {id: 'rq', label: 'a request', sub: 'GET /orders', color: 'blue',
       atWord: at(n, 'arrives')},
      {id: 'm1', label: 'middleware', sub: 'start the clock', color: 'purple',
       atWord: at(n, 'starts')},
      {id: 'rt', label: 'the route', sub: 'your actual code', color: 'blue',
       atWord: at(n, 'route')},
      {id: 'm2', label: 'middleware', sub: 'stop the clock', color: 'purple',
       atWord: at(n, 'stops')},
      {id: 'lg', label: 'one log line', sub: 'into service.log', color: 'green',
       atWord: at(n, 'drops')},
    ],
    edges: [
      {from: 'rq', to: 'm1', label: 'every one', atWord: at(n, 'middleware')},
      {from: 'm1', to: 'rt', label: 'then the work', atWord: at(n, 'work')},
      {from: 'rt', to: 'm2', label: 'and back out', atWord: at(n, 'clock', 2)},
      {from: 'm2', to: 'lg', label: 'one line', atWord: at(n, 'log')},
    ],
  }}));
}

{
  const n =
    "And three routes. Slash orders lists them. " +
    "Slash orders slash an id returns one, or a four oh four if there's no such order. " +
    "And slash checkout is deliberately awful: " +
    "it sleeps for anywhere from under a second to nearly two and a half, " +
    "and more than half the time it fails outright with a five hundred. " +
    "That's on purpose, because we're manufacturing a real problem — " +
    "so that later the agent has something true to find, " +
    "rather than us pretending it found something. " +
    "A checkout that's slow and flaky is about the most ordinary " +
    "production complaint there is, which is exactly why it makes a good example. " +
    "Nobody has ever opened a log looking for the route that works.";
  scenes.push(rec(n, 'three routes, one of them bad on purpose',
    'The endpoints, including the one that will misbehave.',
    [A('api3', 'the routes', {
       zooms: [{mark: 'checkout', atWord: at(n, 'checkout')},
               {at: 'full', atWord: at(n, 'purpose')}],
       callouts: [{text: 'slow on purpose', mark: 'checkout', side: 'right', color: 'orange',
                   atWord: at(n, 'sleeps')},
                  {text: 'and fails half the time', mark: 'flaky', side: 'right', color: 'red',
                   atWord: at(n, 'half')}]}),
     A('saveapi', 'saved', {wantAtWord: at(n, 'manufacturing')})]));
}

{
  const n =
    "And if the word route is new to you, that's all a route is. " +
    "A web address on the left, a Python function behind it, " +
    "and whatever that function returns comes back as JSON on the right. " +
    "Nothing more mysterious than that, so if routes felt intimidating, they should not.";
  scenes.push(scene('API_REQUEST_RESPONSE', n, {api: {
    headline: 'A route is [an address plus a function]',
    method: 'GET',
    path: '/orders/SO-1003',
    requestLines: ['GET /orders/SO-1003'],
    status: '200',
    statusText: 'OK',
    responseLines: ['{"id": "SO-1003",', ' "status": "lost"}'],
    clientLabel: 'anything',
    serverLabel: 'api.py',
    atWord: at(n, 'address'),
  }}));
}

{
  const n =
    "Start it. The ampersand at the end puts it in the background, " +
    "so the service keeps running and we get our prompt back — " +
    "without that ampersand the terminal would sit there serving, " +
    "and we would have nowhere left to type. " +
    "Six seconds later, uvicorn says application startup complete. " +
    "Uvicorn is the little web server FastAPI runs on, " +
    "and that line is it telling us our service is live on port eight thousand. " +
    "So the service is up and listening, " +
    "and so far it has served exactly nobody.";
  scenes.push(rec(n, 'the service goes live',
    'Starting the API in the background.',
    [A('serve', 'into the background', {
       callouts: [{text: '& keeps it running', mark: null, side: 'top', color: 'green',
                   atWord: at(n, 'background')}]}),
     A('serveup', 'the service is live', {wantAtWord: at(n, 'Six'),
       callouts: [{text: 'up on port 8000', mark: 'up', side: 'right', color: 'green',
                   atWord: at(n, 'thousand')}]})]));
}

{
  const n =
    "So it needs some traffic, and we're going to write something that makes some. " +
    "Sixty requests, split between listing orders, fetching one, and checking out, " +
    "and a random number decides which of the three each request goes to. " +
    "Run it, and every single one of those requests goes through our middleware " +
    "and lands as a line in service dot log, because the middleware sees every one of them. " +
    "Look at the last few. A checkout that failed after nearly a second, " +
    "and orders that came back in one millisecond. " +
    "That file isn't a fixture. Our own app just wrote it, " +
    "one line per request, while we watched. And that matters, " +
    "because everything we build from here reads this file — " +
    "so if the log is honest, the answers will be too. " +
    "This is the part people skip, and then wonder why their agent " +
    "keeps making things up. Give it something true to read, " +
    "and half the problem is already solved. " +
    "And look at the shape of a line while it's on screen: " +
    "a timestamp, a level, a route, a status code, and a duration in milliseconds. " +
    "Five fields, separated by spaces. " +
    "Every function we write next reads exactly that.";
  scenes.push(rec(n, 'real traffic, and a real log',
    'Generating traffic, and reading what the app recorded.',
    [A('opentraffic', 'something to call it with'),
     A('traffic1', 'sixty requests', {wantAtWord: at(n, 'Sixty'),
       zooms: [{mark: 'loop', atWord: at(n, 'split')}]}),
     A('savetraffic', 'saved'),
     A('runtraffic', 'making the traffic', {wantAtWord: at(n, 'Run'),
       callouts: [{text: 'each one becomes a log line', mark: null, side: 'top',
                   color: 'blue', atWord: at(n, 'lands')}]}),
     A('seelog', 'the log it wrote', {wantAtWord: at(n, 'Look'),
       zooms: [{mark: 'line', atWord: at(n, 'checkout')}]})]));
}

{
  const n =
    "Here's what our app actually wrote, close up. " +
    "Every line is one request: the time, the level, the route, " +
    "the status code, and how long it took. " +
    "Look at the difference — orders came back in a millisecond, " +
    "and that one checkout took the best part of a second and then failed anyway.";
  scenes.push(scene('LOG_STREAM', n, {logs: {
    rate: 'per request',
    highlight: 4,
    atWord: at(n, 'checkout'),
    lines: [
      {level: 'info', tag: 'the 5 fields', text: '19:38:51 INFO  /orders/SO-1001  200 1ms'},
      {level: 'info', tag: '1ms', text: '19:38:51 INFO  /orders  200 1ms'},
      {level: 'warn', tag: 'failed, slow', text: '19:38:52 ERROR /checkout  500 976ms'},
      {level: 'info', tag: '1ms', text: '19:38:52 INFO  /orders  200 1ms'},
      {level: 'info', tag: '1ms', text: '19:38:52 INFO  /orders  200 1ms'},
    ],
  }}));
}

// ═══ CHAPTER 3 — three ordinary functions ════════════════════════════════════
scenes.push(chapter(
  "Now three plain Python functions. No AI anywhere near them yet.",
  3, 'Three plain functions', 'the ones you probably already have'));

{
  const n =
    "New file, tools dot py, and there's nothing clever in it. " +
    "The first function counts errors. " +
    "That function walks the log a line at a time, " +
    "splits each line into its five pieces — time, level, route, status, duration — " +
    "keeps the ones where the level is ERROR, " +
    "and tallies them up by route using a Counter. " +
    "That's eight lines of ordinary Python, and it's the kind of function " +
    "you've almost certainly written before. " +
    "Counter is the one piece worth naming: it's a dictionary that counts for you, " +
    "so you never have to check whether a key already exists before adding one to it. " +
    "Everything else here is a split, a comparison, and a loop — " +
    "nothing you would need to look up, and nothing that knows " +
    "anything at all about AI.";
  scenes.push(rec(n, 'count the errors',
    'Plain Python over the log. No AI involved.',
    [A('opentools', 'plain Python, no AI yet'),
     A('t1', 'count the errors', {wantAtWord: at(n, 'first'),
       zooms: [{mark: 'split5', atWord: at(n, 'splits')},
               {mark: 'counter', atWord: at(n, 'tallies')}],
       callouts: [{text: 'five pieces per line', mark: 'split5', side: 'right', color: 'blue',
                   atWord: at(n, 'duration')},
                  {text: 'counted, not guessed', mark: 'counter', side: 'right', color: 'green',
                   atWord: at(n, 'Counter')}]})]));
}

{
  const n =
    "And this is what that function does to the file. " +
    "It reads every line, and keeps only the ones marked ERROR. " +
    "Out of sixty requests, exactly one route ever failed — " +
    "so the whole answer it hands back is a single sentence: " +
    "checkout failed seven times. " +
    "Sixty lines in, one line out, in a form a model can read in one go.";
  scenes.push(scene('DATABASE_TABLE', n, {database: {
    headline: 'Keep the ERROR lines, count the routes',
    tableName: 'service.log',
    query: 'level == ERROR, tallied by route',
    columns: ['time', 'level', 'route', 'took'],
    rows: [
      ['19:38:51', 'INFO', '/orders/SO-1001', '1ms'],
      ['19:38:51', 'INFO', '/orders', '1ms'],
      ['19:38:52', 'ERROR', '/checkout', '976ms'],
      ['19:38:52', 'INFO', '/orders', '1ms'],
      ['19:38:52', 'INFO', '/orders', '1ms'],
    ],
    highlight: [2, 2],
    highlightAtWords: [at(n, 'ERROR'), at(n, 'seven')],
    atWord: at(n, 'reads'),
  }}));
}

{
  const n =
    "The second function measures speed. Same walk through the same file, " +
    "but this time we collect every duration per route, " +
    "average them, and sort so the slowest route comes out first. " +
    "And the third function doesn't touch the log at all — " +
    "it calls the API we just built, over HTTP, using a library called httpx, " +
    "and hands back whatever the service says. " +
    "So one function reads a file, and one calls a service. " +
    "Between them, that's most of the tools you'll ever write: " +
    "something you already have on disk, and something you already run. " +
    "Neither of them knows anything about AI, and neither of them needs to. " +
    "If httpx is new to you, it's just a library for making web requests from Python — " +
    "the same thing your browser does when you type an address, " +
    "except your code is doing it and reading the answer back as data.";
  scenes.push(rec(n, 'measure it, and call it',
    'The other two functions: one reads, one calls.',
    [A('t2', 'measure the speed', {wantAtWord: at(n, 'second'),
       zooms: [{mark: 'avg', atWord: at(n, 'average')}]}),
     A('t3', 'and one that calls the API', {wantAtWord: at(n, 'third'),
       zooms: [{mark: 'httpx', atWord: at(n, 'httpx')}],
       callouts: [{text: 'a file, or a service', mark: 'httpx', side: 'right', color: 'purple',
                   atWord: at(n, 'disk')}]})]));
}

{
  const n =
    "Save the file, and then run both of them straight from the terminal, " +
    "before any of this goes near a model. " +
    "They work. Checkout failed several times, " +
    "and it's well over a second slower than everything else. " +
    "Now notice what we didn't do there. " +
    "No AI has been involved so far, and none is needed yet. " +
    "These are plain functions, and you can run them, test them, " +
    "and trust them long before a model ever sees them. " +
    "Hold on to that, because when your agent eventually does something strange — " +
    "and it will — this is the layer you can check on its own, " +
    "with no model anywhere in the way. " +
    "That's a genuinely useful habit, not just a tidy one.";
  scenes.push(rec(n, 'and they already work',
    'Running the functions on their own, before any model.',
    [A('savetools', 'saved'),
     A('runtools', 'they already work', {wantAtWord: at(n, 'terminal'),
       zooms: [{mark: 'failed', atWord: at(n, 'failed')},
               {mark: 'slow', atWord: at(n, 'slower')}],
       callouts: [{text: 'over a second slower', mark: 'slow', side: 'right', color: 'orange',
                   atWord: at(n, 'else')}]})]));
}


{
  const n =
    "So put the two side by side. " +
    "You already know this function's name and its arguments. " +
    "A model knows neither, and it needs one more thing you've never written: " +
    "a description of the function, in a shape it was trained to read.";
  scenes.push(scene('SPEC_COMPARE', n, {compare: {
    headline: 'What a model needs that you do not',
    atWord: at(n, 'side'),
    a: {name: 'you call it', color: 'blue'},
    b: {name: 'a model calls it', color: 'green'},
    rows: [
      {label: 'knows the name', a: 'yes', b: 'only if told', winner: 'a'},
      {label: 'knows the arguments', a: 'yes', b: 'only if told', winner: 'a'},
      {label: 'needs a description', a: 'no', b: 'yes', winner: 'b'},
    ],
  }}));
}

// ═══ CHAPTER 4 — the problem, and what MCP is ════════════════════════════════
scenes.push(chapter(
  "So here's the problem. Those functions work, and a model can't touch them.",
  4, 'What MCP actually is', 'a standard way to hand over your tools'));

{
  const n =
    "A model is a text machine: it reads text, and it writes text. " +
    "So a model can't open your log file, and it can't call your API, " +
    "because neither of those is text. " +
    "So to let it use a function, somebody has to describe that function to it: " +
    "the name, what it does, and every argument it takes, in a very particular JSON shape. " +
    "You can write that by hand. People did, for years, for every function, " +
    "and then again for every provider, because each one wanted it slightly differently. " +
    "MCP is the agreement that ended that. " +
    "One standard shape for describing a tool, " +
    "so anything that speaks it can use anything else that speaks it.";
  scenes.push(scene('DIAGRAM', n, {diagram: {
    layout: 'flow',
    direction: 'horizontal',
    nodes: [
      {id: 'f', label: 'your function', sub: 'plain Python', color: 'blue',
       atWord: at(n, 'function')},
      {id: 'd', label: 'a description', sub: 'name, args, purpose', color: 'orange',
       atWord: at(n, 'describe')},
      {id: 'm', label: 'the model', sub: 'reads text only', color: 'purple',
       atWord: at(n, 'model')},
      {id: 's', label: 'MCP', sub: 'one agreed shape', color: 'green',
       atWord: at(n, 'agreement')},
    ],
    edges: [
      {from: 'f', to: 'd', label: 'somebody writes', atWord: at(n, 'hand')},
      {from: 'd', to: 'm', label: 'in JSON', atWord: at(n, 'JSON')},
      {from: 's', to: 'd', label: 'fixes the shape', atWord: at(n, 'standard')},
    ],
  }}));
}

{
  const n =
    "And here's why that description became a standard rather than a habit. " +
    "Before MCP, every app that wanted tools wrote its own wiring " +
    "to every service it cared about — an editor, a chat client, an agent, " +
    "times your files, your database, your ticket tracker. " +
    "That's a line for every pair, and somebody maintains all of them. " +
    "MCP is the hub in the middle. " +
    "One connection each, instead of one connection per pair — " +
    "multiplication turned into addition.";
  scenes.push(scene('MCP_MESH', n, {mcpMesh: {
    headline: 'Why a standard [had to exist]',
    caption: 'the multiplication',
    premise: 'Apps on the left, the things they need on the right. Every line is an integration somebody writes and then maintains.',
    color: 'orange',
    atWord: 1,
    cells: [
      {label: 'editor', icon: 'lucide:file-code', text: 'client', atWord: at(n, 'editor')},
      {label: 'chat client', icon: 'lucide:message-square', text: 'client', atWord: at(n, 'chat')},
      {label: 'agent', icon: 'lucide:bot', text: 'client', atWord: at(n, 'agent')},
      {label: 'your files', icon: 'lucide:folder', text: 'server', atWord: at(n, 'files')},
      {label: 'your database', icon: 'lucide:database', text: 'server', atWord: at(n, 'database')},
      {label: 'ticket tracker', icon: 'lucide:ticket', text: 'server', atWord: at(n, 'tracker')},
      {label: 'MCP', icon: 'lucide:git-fork', text: 'hub', atWord: at(n, 'hub')},
    ],
  }}));
}

// ═══ CHAPTER 5 — the server ══════════════════════════════════════════════════
scenes.push(chapter(
  "And this is the whole trick: you don't write that description. A decorator does.",
  5, 'Your first MCP server', 'the docstring becomes the schema'));

{
  const n =
    "New file, server dot py. Two imports, and one object. " +
    "A quick note on the import, because this changed recently: " +
    "in version one of the SDK this class was called FastMCP. " +
    "In version two it is MCPServer. " +
    "If you follow a tutorial written last year, that's the line that will break, " +
    "and the error message tells you exactly this. " +
    "Now watch what happens to our function. " +
    "The function is unchanged — we literally call the one in tools dot py — " +
    "but above it goes at mcp dot tool. " +
    "And that's it. That decorator reads the function's name, " +
    "reads its type hints, reads its docstring, " +
    "and builds the JSON description we just talked about, for you. " +
    "The docstring isn't a comment any more. The docstring is the tool's description, " +
    "and it's what the model reads to decide whether this is the tool it wants. " +
    "So write that sentence carefully, because it is the only thing " +
    "the model will ever see about your function, " +
    "and a vague one gets your tool ignored.";
  scenes.push(rec(n, 'the docstring becomes the schema',
    'The same three functions, wrapped as MCP tools.',
    [A('openserver', 'the MCP server'),
     A('s1', 'one import, one decorator', {wantAtWord: at(n, 'import'),
       zooms: [{mark: 'imp', atWord: at(n, 'FastMCP')},
               {mark: 'dec', atWord: at(n, 'decorator')},
               {mark: 'doc', atWord: at(n, 'docstring', 2)}],
       overlay: {kind: 'swap', atWord: at(n, 'builds'),
                 from: 'def recent_errors() -> str:', to: '{ "name": "recent_errors", ... }'},
       callouts: [{text: 'v1 called this FastMCP', mark: 'imp', side: 'right', color: 'orange',
                   atWord: at(n, 'version', 2)},
                  {text: 'the model reads this', mark: 'doc', side: 'right', color: 'green',
                   atWord: at(n, 'reads', 4)}]})]));
}

{
  const n =
    "The other two get the same treatment. " +
    "Look at get order, though, because it takes an argument. " +
    "Order id, typed as a string. " +
    "That type hint isn't decoration — " +
    "it becomes a required field in the description, " +
    "so the model knows it must supply an order id, and that it has to be text. " +
    "Then one more thing, and it's not a tool at all: a resource. " +
    "A tool is something the model can DO. A resource is something it can READ. " +
    "The resource hands over the whole log at a name, log colon slash slash today. " +
    "And at the bottom, mcp dot run. That's a complete MCP server, " +
    "in about thirty lines. Save it, and notice what we didn't have to write: " +
    "not one line of JSON, and not one line of protocol.";
  scenes.push(rec(n, 'arguments, and a resource',
    'The remaining tools, and the difference between a tool and a resource.',
    [A('s2', 'the other two', {
       zooms: [{mark: 'arg', atWord: at(n, 'argument')}],
       overlay: {kind: 'split', atWord: at(n, 'DO'),
                 left: 'tool', right: 'resource',
                 leftNote: 'something it can DO', rightNote: 'something it can READ'},
       callouts: [{text: 'the hint becomes a required field', mark: 'arg', side: 'right',
                   color: 'blue', atWord: at(n, 'required')}]}),
     A('s3', 'a resource, and run', {wantAtWord: at(n, 'resource'),
       zooms: [{mark: 'res', atWord: at(n, 'today')}, {mark: 'run', atWord: at(n, 'bottom')}]}),
     A('saveserver', 'saved', {wantAtWord: at(n, 'Save')})]));
}

{
  const n =
    "Let me show you what that decorator actually produced, " +
    "because it's the single most important idea in the video. " +
    "The function name became the tool name. " +
    "The type hint became the argument type. " +
    "And the docstring — that sentence you wrote for a human — " +
    "became the description the model reads when it decides whether to call this at all. " +
    "So write that docstring like you're telling a new colleague what the function is for.";
  scenes.push(scene('MCP_SCHEMA', n, {mcpSchema: {
    headline: 'The docstring [is the description]',
    caption: 'what the decorator built',
    premise: 'On the left, the function you wrote. On the right, the JSON the model is handed.',
    color: 'green',
    atWord: 1,
    codeTitle: 'server.py',
    // SchemaBind draws its right-hand pane from `cells`: text:'reg' rows are the binding,
    // everything else is a line of the JSON the model is handed. Omitting them renders the
    // header "WHAT THE MODEL ACTUALLY SEES" over nothing, which is worse than no pane.
    cells: [
      {label: '@mcp.tool()', sub: 'registers what follows', text: 'reg',
       atWord: at(n, 'decorator')},
      {label: 'name', sub: 'get_order', atWord: at(n, 'name')},
      {label: 'parameters', sub: 'order_id — string, required', atWord: at(n, 'hint')},
      {label: 'description', sub: 'Look up one order by its id, for example SO-1003.',
       atWord: at(n, 'docstring')},
    ],
    lines: [
      {text: '@mcp.tool()', detail: 'This one line does all of the registering.',
       atWord: at(n, 'decorator')},
      {text: 'def get_order(order_id: str) -> str:',
       detail: 'The name becomes the tool name; the type hint becomes the argument type.',
       atWord: at(n, 'name')},
      {text: '    """Look up one order by its id, for example SO-1003."""',
       detail: 'This sentence is what the model reads to decide whether to call it.',
       atWord: at(n, 'docstring')},
      {text: '    return tools.get_order(order_id)'},
    ],
  }}));
}

{
  const n =
    "One more distinction, and beginners trip on it constantly. " +
    "A tool is something the model decides to run. " +
    "A resource is something your code goes and fetches, " +
    "the way an app opens a file. " +
    "Same server, same file, completely different trigger, which means the two are never interchangeable — " +
    "and that's the only difference worth remembering.";
  scenes.push(scene('MCP_CONTROL', n, {mcpControl: {
    headline: 'Who pulls [the trigger]',
    caption: 'tool, or resource',
    premise: 'Both live in server.py. The only question is who decides when they run.',
    color: 'blue',
    atWord: 1,
    cells: [
      {label: 'a tool', sub: 'the model decides to run it', owner: 'ai',
       icon: 'lucide:wrench', atWord: at(n, 'tool')},
      {label: 'a resource', sub: 'your code asks for it, like opening a file', owner: 'code',
       icon: 'lucide:file-text', atWord: at(n, 'resource')},
    ],
  }}));
}

// ═══ CHAPTER 6 — the official pages ══════════════════════════════════════════
scenes.push(chapter(
  "Before we use it — this is somebody's work, and it's worth knowing whose.",
  6, 'Where this comes from', 'the protocol, and the SDK'));

{
  const n =
    "MCP is an open protocol, and this is its own site. " +
    "MCP isn't an OpenAI thing or an Anthropic thing you have to buy into — " +
    "it's a published specification, and anyone can implement it. " +
    "The getting started pages here are genuinely good, and they are the place to go next. " +
    "And this is the package we installed: " +
    "the official Python SDK for MCP servers and clients, " +
    "on GitHub, MIT licensed, in their own words right there under the name. " +
    "If you build anything on this, that repository is where the source lives, " +
    "where the issues go, and where the examples are. " +
    "Both links are in the description.";
  scenes.push(rec(n, 'the protocol, and the SDK',
    'The Model Context Protocol’s own site, and the official Python SDK.',
    [W('site', 'the protocol’s own site',
       {zooms: [{mark: 'name', atWord: at(n, 'site')}]}),
     W('intro', 'their getting started', {wantAtWord: at(n, 'started')}),
     W('repo', 'the official SDK', {wantAtWord: at(n, 'package')}),
     W('about', 'in their own words', {wantAtWord: at(n, 'GitHub'),
       callouts: [{text: 'their description, not mine', mark: 'official', side: 'left',
                   color: 'green', atWord: at(n, 'words')}]})],
    {sourceNote: 'modelcontextprotocol.io · github.com/modelcontextprotocol/python-sdk — read 2026-09-04',
     card: {place: 'right', width: 0.24}}));
}

// ═══ CHAPTER 7 — settings ════════════════════════════════════════════════════
scenes.push(chapter(
  "Two small files before the agent, and they keep your key out of your code.",
  7, 'Where the key lives', 'never in the code, not once'));

{
  const n =
    "Three settings, in a file called dot env. " +
    "The address you're talking to, the key, and which model you want. " +
    "Mine is an Azure OpenAI deployment; yours can be any provider that speaks this API. " +
    "I have masked my key with asterisks, " +
    "because a key on screen is a key you have to go and change. " +
    "Then dot gitignore, with one line in it: dot env. " +
    "That's the whole protection. Git now walks past your settings file " +
    "as though it were not there. Thirty seconds of work, once, " +
    "and the difference between a key that's yours and a key that's public. " +
    "And do this before your first commit, not after, " +
    "because once a key has been pushed anywhere it is no longer yours, " +
    "whether or not you delete the commit afterwards.";
  scenes.push(rec(n, 'settings in a file, never in the code',
    'The two files that keep a key out of a repository.',
    [A('openenv', 'the three settings'),
     A('typeenv', 'masked on purpose', {wantAtWord: at(n, 'address'),
       zooms: [{mark: 'url', atWord: at(n, 'address')}, {mark: 'masked', atWord: at(n, 'masked')}],
       callouts: [{text: 'yours goes here', mark: 'masked', side: 'right', color: 'red',
                   atWord: at(n, 'asterisks')}]}),
     A('openignore', 'and git never sees it', {wantAtWord: at(n, 'protection')}),
     A('typeignore', 'one line', {wantAtWord: at(n, 'walks'),
       callouts: [{text: 'git walks past it now', mark: 'ignored', side: 'right', color: 'green',
                   atWord: at(n, 'there')}]})]));
}

// ═══ CHAPTER 8 — the agent ═══════════════════════════════════════════════════
scenes.push(chapter(
  "Now the agent itself, and it's the only genuinely new idea in the video.",
  8, 'The loop', 'ask, choose, run, answer'));

{
  const n =
    "Quick check on where we are. Only agent dot py is left, " +
    "and it's the one file that talks to a model. " +
    "Api dot py is the service, traffic dot py filled the log, " +
    "tools dot py holds the functions, server dot py describes them.";
  scenes.push(scene('FILE_TREE', n, {fileTree: {
    headline: 'Four done, [one to go]',
    atWord: at(n, 'agent'),
    highlight: 4,
    nodes: [
      {name: 'api.py', depth: 0, kind: 'file'},
      {name: 'traffic.py', depth: 0, kind: 'file'},
      {name: 'tools.py', depth: 0, kind: 'file'},
      {name: 'server.py', depth: 0, kind: 'file'},
      {name: 'agent.py', depth: 0, kind: 'file', color: 'green'},
    ],
  }}));
}

{
  const n =
    "Last file, agent dot py. " +
    "The first block starts our server and connects to it. " +
    "Stdio server parameters means: run this program, " +
    "and talk to it through its standard input and output — " +
    "the same pipes you use when you pipe one command into another. " +
    "The server is just another program, started by ours; there's no port and no network. " +
    "Then initialize, which is the handshake: " +
    "the two sides tell each other what they can do before anything else happens. " +
    "Think of it like the first ten seconds of a phone call. " +
    "Our side says which version of the protocol it speaks, " +
    "the server says the same and lists what it offers, " +
    "and only then does either of them get down to business. " +
    "You'll never write that handshake yourself — " +
    "the library does it, and that's most of why MCP is worth using. " +
    "Notice too that we never told our agent where the tools live, " +
    "or what they are called, or what arguments they take. " +
    "We told it which program to start, and the protocol handles the rest, " +
    "which is precisely the part you would otherwise be writing by hand.";
  scenes.push(rec(n, 'start the server, connect to it',
    'The client half: launching the server and shaking hands.',
    [A('openagent', 'the last file'),
     A('ag1', 'the imports', {wantAtWord: at(n, 'first')}),
     A('ag1b', 'connect over stdio', {wantAtWord: at(n, 'Stdio'),
       zooms: [{mark: 'params', atWord: at(n, 'run')},
               {mark: 'init', atWord: at(n, 'initialize')}],
       overlay: {kind: 'chain', atWord: at(n, 'handshake'),
                 steps: ['agent.py', 'starts server.py', 'stdin / stdout', 'ready']},
       callouts: [{text: 'no port, no network', mark: 'params', side: 'right', color: 'purple',
                   atWord: at(n, 'network')}]})]));
}

{
  const n =
    "A word on that choice, because you'll meet the other one soon. " +
    "Stdio means the two programs share a machine and pass text through a pipe. " +
    "Streamable HTTP means the server lives elsewhere, reached over the network. " +
    "The messages are identical either way. " +
    "Start with stdio, because there's nothing to deploy and nothing to secure, " +
    "and you can move to HTTP later without touching a single tool.";
  scenes.push(scene('MCP_TRANSPORT', n, {mcpTransport: {
    headline: 'Same room, or [a phone call]',
    caption: 'two transports',
    premise: 'Both move identical JSON. The only difference is whether the two programs share a machine.',
    color: 'green',
    atWord: 1,
    vars: [{label: 'messages=same', sub: 'both transports', atWord: at(n, 'identical')}],
    cells: [
      {label: 'stdio', sub: 'what we are using',
       out: ['same machine', 'nothing to deploy', 'nothing to secure'],
       atWord: at(n, 'Stdio')},
      {label: 'streamable-http', sub: 'when the server lives elsewhere', text: 'remote',
       out: ['a remote server', 'many clients at once', 'now you own the security'],
       atWord: at(n, 'Streamable')},
    ],
  }}));
}

{
  const n =
    "And this is what is actually travelling down that pipe. " +
    "Not magic, and not English — plain JSON messages, one per line. " +
    "We send tools slash list, and the server sends back three tool definitions. " +
    "Later we send tools slash call, with a name and arguments, " +
    "and back comes whatever the function returned. " +
    "Every MCP server on earth speaks exactly these messages, " +
    "which is the entire reason yours can be used by something you didn't write.";
  scenes.push(scene('MCP_WIRE', n, {mcpWire: {
    headline: 'Every arrow is [one message]',
    caption: 'what crosses the pipe',
    premise: 'The client is agent.py. The server is server.py. Each arrow is one JSON-RPC message.',
    color: 'blue',
    atWord: 1,
    codeTitle: 'agent.py',
    ends: [{label: 'AGENT'}, {label: 'SERVER'}],
    cells: [
      {label: 'tools/list', sub: 'what can you do?', dir: 'out', atWord: at(n, 'list'),
       out: ['{"method":"tools/list","id":1}']},
      {label: '3 tools', sub: 'recent_errors · slowest_routes · get_order', dir: 'back',
       atWord: at(n, 'three'),
       out: ['{"result":{"tools":[', '  {"name":"recent_errors", …},', '  {"name":"get_order", …}]}}']},
      {label: 'tools/call', sub: 'run recent_errors, no arguments', dir: 'out',
       atWord: at(n, 'call'),
       out: ['{"method":"tools/call",', ' "params":{"name":"recent_errors",', '  "arguments":{}}}']},
    ],
    lines: [
      {text: 'tools = await session.list_tools()', detail: 'Ask the server what it can do.',
       atWord: at(n, 'list')},
      {text: 'result = await session.call_tool(', detail: 'Run one of them, by name.',
       atWord: at(n, 'call')},
      {text: '    "recent_errors", {})'},
    ],
  }}));
}

{
  const n =
    "Then we ask the server what it has. List tools comes back with all three, " +
    "each one carrying the description and the schema that the decorator built. " +
    "We reshape them into the format the OpenAI library expects — " +
    "and that's genuinely all this block does, it's a rename, not a translation. " +
    "Notice input underscore schema there: " +
    "in version one of the SDK that was inputSchema, in camel case. " +
    "Then we print how many tools the model can see, " +
    "because when this goes wrong that number is the first thing you want.";
  scenes.push(rec(n, 'ask what tools exist',
    'Fetching the tool list and handing it to the model.',
    [A('ag2', 'list, then reshape', {
       zooms: [{mark: 'list', atWord: at(n, 'List')},
               {mark: 'schema', atWord: at(n, 'input')}],
       overlay: {kind: 'chain', atWord: at(n, 'reshape'),
                 steps: ['server.py', 'list_tools()', '3 schemas', 'the model']},
       callouts: [{text: 'v1 spelled it inputSchema', mark: 'schema', side: 'right',
                   color: 'orange', atWord: at(n, 'camel')}]})]));
}

{
  const n =
    "Now the model. Same client as any other OpenAI call, " +
    "same messages list — and one new argument: tools. " +
    "Tools is the menu we just built. " +
    "We're not telling it which tool to use. We're telling it what exists. " +
    "What comes back is different from a normal reply: " +
    "instead of text, the model may hand us tool calls — " +
    "the name of a function it wants run, and the arguments it wants passed. " +
    "Nothing has been executed at that point. The model has only asked. " +
    "Running it is still entirely our job, which is exactly the safety property " +
    "you want in something that can reach your data.";
  scenes.push(rec(n, 'hand it the menu',
    'The call, with the tool list attached.',
    [A('ag3', 'one new argument', {wantAtWord: at(n, 'model'),
       zooms: [{mark: 'tools', atWord: at(n, 'tools')}],
       overlay: {kind: 'split', atWord: at(n, 'different'),
                 left: 'a normal reply', right: 'tool_calls',
                 leftNote: 'here is some text', rightNote: 'run this, with these arguments'},
       callouts: [{text: 'what exists, not what to use', mark: 'tools', side: 'right',
                   color: 'green', atWord: at(n, 'exists')}]})]));
}

{
  const n =
    "Before we write it, hold the shape in your head, " +
    "because every agent you'll ever read is some version of this ring. " +
    "Ask the model, with the tool list attached. " +
    "Read what it asked for. Run that tool. Hand the result back. " +
    "Then ask once more, and this time it answers in words. " +
    "Ours goes round exactly once, which is all this question needs. " +
    "Wrap those four steps in a while loop instead, " +
    "and the model can go round as many times as it likes — " +
    "read the errors, then go and fetch the order behind one of them. " +
    "That one change is the whole difference between a helper and an agent.";
  scenes.push(scene('MCP_LOOP', n, {mcpLoop: {
    headline: 'Ask, run, [ask again]',
    caption: 'the agent loop',
    premise: 'agent.py sits between the model and the server, relaying until the model answers in words instead of tool calls.',
    color: 'orange',
    atWord: 1,
    codeTitle: 'agent.py',
    cells: [
      {label: 'ask the model', sub: '+ the tool list', atWord: at(n, 'Ask')},
      {label: 'tool_calls', sub: 'what it wants run', atWord: at(n, 'asked')},
      {label: 'call_tool', sub: 'you run it', atWord: at(n, 'Run')},
      {label: 'role: tool', sub: 'the result goes back', atWord: at(n, 'Hand')},
      {label: 'it answers', sub: 'words, not tool calls', text: 'exit', atWord: at(n, 'words')},
    ],
    lines: [
      {text: 'answer = client.chat.completions.create(',
       detail: 'One ask, with the menu attached.', atWord: at(n, 'Ask')},
      {text: '    model=..., messages=messages, tools=menu)'},
      {text: 'for call in picked.tool_calls:',
       detail: 'Run every tool it asked for. Ours needs one pass.', atWord: at(n, 'Run')},
      {text: '    result = await session.call_tool(...)', atWord: at(n, 'tool')},
      {text: 'final = client.chat.completions.create(',
       detail: 'Ask again with the results in the conversation.', atWord: at(n, 'once')},
    ],
  }}));
}

{
  const n =
    "So we run whatever it picked. For each tool call: " +
    "read the arguments it chose, print them so we can watch it think, " +
    "and call that tool through MCP. " +
    "Then we hand the result back, with role tool, " +
    "which is how you tell the model this is what your function returned. " +
    "And finally we ask it once more, with the results now in the conversation, " +
    "and this time it just answers. That's the loop. " +
    "Ask, choose, run, answer. " +
    "Notice the for: it runs every tool the model asked for in this one round. " +
    "Put a while around those four steps and the model gets to come back — " +
    "read the errors, then go after the order behind one of them — " +
    "and that is the upgrade I would make first. " +
    "Either way, the difference from a chatbot is the same: " +
    "a chatbot answers from what it already knows, " +
    "and an agent goes and gets what it does not. " +
    "Save the file. That is every line of code in this project, " +
    "and agent dot py — the only file here that talks to a model — " +
    "comes to about seventy lines, most of which is connecting and reshaping. " +
    "MCP is carrying everything else. " +
    "No parsing, no schema wrangling, no if-statement per tool — " +
    "which is the whole reason this fits in one screen.";
  scenes.push(rec(n, 'run it, and feed the answer back',
    'The loop: execute the chosen tool and return the result.',
    [A('ag4', 'run whatever it picked', {wantAtWord: at(n, 'picked'),
       zooms: [{mark: 'call', atWord: at(n, 'call')}, {mark: 'role', atWord: at(n, 'role')}],
       overlay: {kind: 'chain', atWord: at(n, 'loop'),
                 steps: ['question', 'it chooses', 'we run it', 'it answers']},
       callouts: [{text: 'this is what your function said', mark: 'role', side: 'right',
                   color: 'blue', atWord: at(n, 'returned')}]}),
     A('ag5', 'and let it answer', {wantAtWord: at(n, 'finally')}),
     A('saveagent', 'saved', {wantAtWord: at(n, 'Save')})]));
}

// ═══ CHAPTER 9 — the payoff ══════════════════════════════════════════════════
scenes.push(chapter(
  "Everything is written. Let's ask it something we never told it how to answer.",
  9, 'Ask it a question', 'in plain English'));

{
  const n =
    "Our checkout is misbehaving. What does the log say? Two sentences. " +
    "Nobody wired that question to anything. " +
    "The model can see three tools, and it picks one. Recent errors. " +
    "Nobody told it which — it read three descriptions, " +
    "and decided that was the one that answers a question about the log. " +
    "Then the answer comes back in plain English: " +
    "the checkout process has failed seven times, " +
    "and it suggests looking at the error messages next. " +
    "That's our log, read by our function, chosen by the model, " +
    "and none of that plumbing was hand-written. " +
    "That's what MCP bought us.";
  scenes.push(rec(n, 'it picks the tools itself',
    'The finished agent, answering a question nobody scripted.',
    [A('runagent', 'asking in plain English', {
       zooms: [{mark: 'sees', atWord: at(n, 'three')},
               {mark: 'chose', atWord: at(n, 'Recent')},
               {at: 'full', atWord: at(n, 'answer')}],
       overlay: {kind: 'split', atWord: at(n, 'descriptions'),
                 left: 'three tools offered', right: 'one tool chosen',
                 leftNote: 'recent_errors · slowest_routes · get_order',
                 rightNote: 'recent_errors — nobody told it which'},
       callouts: [{text: 'it chose this one itself', mark: 'chose', side: 'right', color: 'green',
                   atWord: at(n, 'told')}]})]));
}

{
  const n =
    "And notice the shape you've ended up with. " +
    "Plain Python at the bottom, a layer that only describes it, " +
    "and any client at all on top. " +
    "Swap that top layer and the other two never change.";
  scenes.push(scene('LAYERED_STACK', n, {stack: {
    headline: 'Three layers, [one of them swappable]',
    signal: 'down',
    atWord: at(n, 'layer'),
    layers: [
      {label: 'any MCP client', sub: 'ours, an editor, a desktop', color: 'green'},
      {label: 'server.py', sub: 'describes them, nothing else', color: 'purple'},
      {label: 'tools.py', sub: 'plain Python, no AI in it', color: 'blue'},
    ],
  }}));
}

// ═══ CHAPTER 10 — where to go next ═══════════════════════════════════════════
scenes.push(chapter(
  "That's a working agent. Here's how it grows, and where to read next.",
  10, 'Where this goes', 'from one file to fifty tools'));

{
  const n =
    "Four things worth knowing before you build on this. " +
    "First: one server object. Every tool registers on the same mcp, " +
    "and they register the moment the file is imported. " +
    "Second: when server dot py gets long, split it, " +
    "so the server file stays a description and never becomes a codebase. " +
    "Put your tools in their own modules, import mcp from the server, decorate there, " +
    "and import those modules before you call run, " +
    "because a tool that is never imported is a tool that never registers. " +
    "Six tools become fifty, and the server file never grows at all. " +
    "One object, many modules, and nothing surprising in between.";
  scenes.push(scene('LIST_BUILD', n, {
    heading: 'Growing past one file',
    items: [
      {text: 'One mcp object — tools register at import', atWord: at(n, 'First')},
      {text: 'Split tools into their own modules', atWord: at(n, 'Second')},
      {text: 'Import those modules before mcp.run()', atWord: at(n, 'run')},
      {text: 'Six tools become fifty, same server file', atWord: at(n, 'Six')},
      {text: 'server.py stays a description, not code', atWord: at(n, 'description')},
      {text: 'Import mcp from the server, decorate there', atWord: at(n, 'decorate')},
    ],
  }));
}

{
  const n =
    "Third, the trap that will cost you an evening: " +
    "if you launch the server as a script and your modules import it by package name, " +
    "Python loads that file twice, and every tool registers on the copy nobody is serving. " +
    "Your tools just vanish. Run it as a module instead, and the problem never appears. " +
    "And fourth: build something small this week and break it on purpose, " +
    "because that is genuinely the fastest way through. " +
    "Then read the SDK's own guide, kept current by the people who wrote the library, " +
    "and better than mine. That is where I would go next.";
  scenes.push(scene('LIST_BUILD', n, {
    heading: 'The trap, and what to read next',
    items: [
      {text: 'Double import — tools silently vanish', atWord: at(n, 'twice')},
      {text: 'Launch it as a module, not a script', atWord: at(n, 'module')},
      {text: 'Then read the SDK guide and keep going', atWord: at(n, 'guide')},
      {text: 'Kept current by the people who wrote it', atWord: at(n, 'current')},
      {text: 'Build something small — break it on purpose', atWord: at(n, 'Build')},
    ],
  }));
}

{
  const n =
    "So that's the whole thing: a service, a log, three ordinary functions, " +
    "a decorator that describes them, and a loop that lets a model choose. " +
    "The protocol is open and the SDK is on GitHub, both linked below — " +
    "go and read their getting started, because it's better than mine. " +
    "And there's a lot more in there: prompts, resources you can subscribe to, " +
    "and running a server over HTTP instead of stdio.";
  scenes.push(scene('RECAP', n, {
    heading: 'What you built',
    points: [
      {text: 'a service that logs itself', atWord: at(n, 'service')},
      {text: 'three plain Python functions', atWord: at(n, 'functions')},
      {text: 'an MCP server that describes them', atWord: at(n, 'decorator')},
      {text: 'an agent loop that chooses', atWord: at(n, 'loop')},
    ],
  }));
}

{
  const n =
    "Point it at something of your own tonight. " +
    "A log you already have, an API you already run. " +
    "Change the three functions, keep everything else, and see what it does. " +
    "If this got you started, subscribe — and tell me what you pointed it at.";
  scenes.push(scene('OUTRO_CTA', n, {
    message: 'Change the three functions. Keep the rest.',
    sub: 'modelcontextprotocol.io · github.com/modelcontextprotocol/python-sdk',
  }));
}

const spec = {
  meta: {
    topic: 'Building an AI agent that calls your own tools, with MCP',
    subject: 'Python',
    format: 'long',
    fps: 30,
    audience: 'beginner',
    onePayoff: 'wrap plain Python functions as MCP tools and let a model choose between them',
    openLoop: 'what does it actually take to code an AI agent?',
    analogy: 'a menu you hand the model, instead of telling it what to order',
    screenplay: 'documentary',
    topicAxes: ['skill-build', 'sovereignty'],
    seo: {
      title: 'Code An AI Agent With MCP — Python, Every Line Typed',
      altTitles: [
        'Build Your First MCP Server And Agent — Python, For Beginners',
        'MCP Explained By Building One — Python, Every Line Typed',
      ],
      hook: 'What does it actually take to code an AI agent?',
      breakdown: 'a small service, the log it writes, three plain Python functions, an MCP ' +
        'server that describes them to a model, and the agent loop that picks one — typed line by line',
      queries: [
        'mcp python tutorial',
        'model context protocol python example',
        'how to build an mcp server',
        'ai agent python tutorial for beginners',
        'mcp tool calling example',
        'fastmcp mcpserver difference',
        'openai function calling with mcp',
        'azure openai python agent',
        'mcp server stdio transport',
        'how does an ai agent choose a tool',
      ],
      hashtags: ['#python', '#mcp', '#ai', '#tutorial'],
      pinned: 'What would you point this at first — a log, or an API?',
      tags: ['mcp', 'model context protocol', 'python', 'ai agent', 'mcp server',
             'tool calling', 'openai', 'azure openai', 'fastapi', 'beginner python',
             'ai tutorial', 'mcp python sdk', 'agent loop', 'function calling'],
      sources: [
        'Model Context Protocol — https://modelcontextprotocol.io',
        'mcp, the official Python SDK — https://github.com/modelcontextprotocol/python-sdk',
        'fastapi — https://fastapi.tiangolo.com',
        'uvicorn — https://www.uvicorn.org',
        'httpx — https://www.python-httpx.org',
        'openai Python SDK — https://github.com/openai/openai-python',
        'python-dotenv — https://github.com/theskumar/python-dotenv',
        'uv — https://docs.astral.sh/uv/',
      ],
    },
  },
  brand: {
    theme: 'moderndark', themeLight: 'daylight', design: 'moderndark',
    background: 'plain', channel: CH, logo: 'img:channel_logo.png',
  },
  thumbnail: {
    title: 'Code An AI Agent With MCP',
    badge: 'Python · MCP · Beginners',
    note: 'five files, from an empty folder',
    asset: 'si:python',
    logos: ['si:python', 'si:openai', 'si:fastapi', 'si:anthropic'],
  },
  scenes,
};

fs.writeFileSync('topics/code-an-ai-agent-with-mcp/long.json', JSON.stringify(spec, null, 2) + '\n');
const words = scenes.reduce((a, s) => a + s.narration.trim().split(/\s+/).length, 0);
console.log(`wrote topics/code-an-ai-agent-with-mcp/long.json — ${scenes.length} scenes, ` +
            `${words} words (~${Math.floor(words / 3.11 / 60)}m${String(Math.round((words / 3.11) % 60)).padStart(2, '0')}s)`);
