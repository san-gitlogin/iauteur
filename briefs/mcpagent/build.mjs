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
const D = (id, label, opts = {}) => ({ref: `rec:mcp-docs#${id}`, label, focus: true, ...intent(opts)});

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
    "We are using uv here, which is a tool that manages Python projects and packages. " +
    "If you have used pip before, uv does the same job and does it much faster — " +
    "and if you have not, you only need the two commands you are about to see. " +
    "uv init makes this folder a Python project. " +
    "That writes pyproject dot toml, which is the list of what this project needs, " +
    "and a lock file, which pins the exact versions " +
    "so it installs the same way on your machine as it does on mine.";
  scenes.push(rec(n, 'an empty folder, and one command',
    'Turning a folder into a Python project.',
    [A('look', 'nothing here yet'),
     A('init', 'now it is a project', {wantAtWord: at(n, 'init'),
       zooms: [{mark: 'made', atWord: at(n, 'writes')}],
       callouts: [{text: 'the list of what this needs', mark: 'made', side: 'right',
                   color: 'blue', atWord: at(n, 'pyproject')},
                  {text: 'pins the exact versions', mark: 'made', side: 'right',
                   color: 'green', atWord: at(n, 'lock')}]})]));
}

{
  const n =
    "Then one command brings in everything we need. " +
    "uv add downloads them and writes them into that list, in one step. " +
    "mcp is the official Python SDK for the Model Context Protocol, " +
    "written and maintained by the people who designed the protocol, " +
    "and we'll look at their own page for it in a few minutes. " +
    "FastAPI and uvicorn give us a small web service to point the agent at — " +
    "FastAPI is the framework you write the routes in, " +
    "and uvicorn is the program that actually serves them. " +
    "httpx is how Python makes web requests — the same thing your browser does " +
    "when you type an address, except from code. " +
    "openai is the library for talking to the model. " +
    "And python-dotenv reads our settings out of a file " +
    "so that a key never has to be typed into the code. " +
    "Six libraries, one command, and that is the whole setup.";
  scenes.push(rec(n, 'six libraries, and what each is for',
    'One install command, and the job each package does.',
    [A('add', 'one command', {wantAtWord: at(n, 'add')}),
     A('added', 'all six, installed', {wantAtWord: at(n, 'mcp'),
       zooms: [{mark: 'deps', atWord: at(n, 'FastAPI')}],
       callouts: [{text: 'the official MCP SDK', mark: 'deps', side: 'right',
                   color: 'green', atWord: at(n, 'official')},
                  {text: 'serves what FastAPI defines', mark: 'deps', side: 'right',
                   color: 'blue', atWord: at(n, 'uvicorn', 2)},
                  {text: 'keeps the key out of the code', mark: 'deps', side: 'right',
                   color: 'purple', atWord: at(n, 'python-dotenv')}]})]));
}

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
    "That dictionary is worth looking at on its own, " +
    "because everything later in the video comes back to it. " +
    "Three orders. Two of them delivered and perfectly boring. " +
    "And SO one thousand and three, sitting in Remote, lost in transit. " +
    "In a real system this would be a database table with a million rows. " +
    "Here it is three lines of Python, " +
    "because the point of the video is what happens around the data, not the data itself.";
  scenes.push(scene('DATABASE_TABLE', n, {database: {
    headline: 'Three orders, one of them a problem',
    tableName: 'ORDERS in api.py',
    query: 'a plain Python dictionary',
    columns: ['id', 'region', 'status'],
    rows: [
      ['SO-1001', 'North', 'delivered'],
      ['SO-1002', 'Central', 'delivered'],
      ['SO-1003', 'Remote', 'lost_in_transit'],
    ],
    highlight: [0, 1, 2],
    highlightAtWords: [at(n, 'Three'), at(n, 'delivered'), at(n, 'lost')],
    atWord: at(n, 'dictionary'),
  }}));
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
    "One thing to be clear about before we start it, " +
    "because two names get confused constantly. " +
    "FastAPI is the library you write in — the decorators, the routes, the functions. " +
    "Uvicorn is the program that listens on a port and hands requests to it. " +
    "FastAPI on its own serves nothing. " +
    "Uvicorn on its own has nothing to serve. " +
    "You need both, and the command we are about to run starts the second one " +
    "and points it at the first.";
  scenes.push(scene('DIAGRAM', n, {diagram: {
    layout: 'flow',
    direction: 'horizontal',
    nodes: [
      {id: 'net', label: 'a request', sub: 'browser, or httpx', color: 'blue',
       atWord: at(n, 'requests')},
      {id: 'uv', label: 'uvicorn', sub: 'listens on port 8000', color: 'purple',
       atWord: at(n, 'Uvicorn')},
      {id: 'fa', label: 'FastAPI', sub: 'your routes in api.py', color: 'green',
       atWord: at(n, 'FastAPI')},
    ],
    edges: [
      {from: 'net', to: 'uv', label: 'hits the port', atWord: at(n, 'listens')},
      {from: 'uv', to: 'fa', label: 'to your function', atWord: at(n, 'hands')},
    ],
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
    "Random dot random gives a number between zero and one, " +
    "so under nought point four goes to orders, " +
    "under nought point seven fetches a single order, " +
    "and everything left over hits checkout. " +
    "That is roughly forty percent, thirty percent, thirty percent — " +
    "which is only there so the log looks like a real afternoon " +
    "rather than sixty identical lines.";
  scenes.push(rec(n, 'sixty requests, not all the same',
    'A tiny script that gives the service something to do.',
    [A('opentraffic', 'something to call it with'),
     A('traffic1', 'sixty requests', {wantAtWord: at(n, 'checking'),
       zooms: [{mark: 'loop', atWord: at(n, 'random')}],
       callouts: [{text: 'picks one of the three routes', mark: 'loop', side: 'right',
                   color: 'blue', atWord: at(n, 'four')},
                  {text: 'so the timings vary like real traffic', mark: 'post', side: 'right',
                   color: 'purple', atWord: at(n, 'afternoon')}]})]));
}

{
  const n =
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
    "Pause here and learn that shape, " +
    "because every function we write next reads exactly that, " +
    "and if you ever adapt this to your own log, this is the line you change.";
  scenes.push(rec(n, 'a real log, written by your own app',
    'Running the traffic, and reading what the service recorded.',
    [A('runtraffic', 'making the traffic', {
       callouts: [{text: 'each one becomes a log line', mark: 'done', side: 'top',
                   color: 'blue', atWord: at(n, 'lands')}]}),
     A('seelog', 'the log it wrote', {wantAtWord: at(n, 'Look'),
       zooms: [{mark: 'line', atWord: at(n, 'checkout')}],
       callouts: [{text: 'written by the app, not by us', mark: 'line', side: 'right',
                   color: 'green', atWord: at(n, 'fixture')},
                  {text: 'time · level · route · code · ms', mark: 'line', side: 'right',
                   color: 'orange', atWord: at(n, 'timestamp')}]})]));
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

{
  const n =
    "One more piece of vocabulary, and then we press some buttons. " +
    "Every web response carries a number, and you only need three of them today. " +
    "Two hundred means it worked. " +
    "Four oh four means you asked for something that is not there. " +
    "Five hundred means the server itself broke. " +
    "You are about to see all three come back from your own code, " +
    "and they end up in your log file too, " +
    "which is how the agent will eventually tell good requests from bad ones.";
  scenes.push(scene('SPEC_COMPARE', n, {compare: {
    headline: 'The three status codes you need',
    source: 'HTTP status codes — RFC 9110, and the ones this service returns',
    atWord: at(n, 'number'),
    a: {name: 'what happened', color: 'blue'},
    b: {name: 'in the log as', color: 'orange'},
    rows: [
      {label: '200 — it worked', a: 'normal', b: 'INFO', winner: 'a',
       atWord: at(n, 'worked')},
      {label: '404 — not there', a: 'your ask', b: 'INFO', winner: 'tie',
       atWord: at(n, 'four')},
      {label: '500 — server broke', a: 'their fault', b: 'ERROR', winner: 'b',
       atWord: at(n, 'broke')},
    ],
  }}));
}

{
  const n =
    "Before we type any code, here is what those six libraries are for, in one place. " +
    "Two of them build the service: FastAPI writes the routes, uvicorn serves them. " +
    "One makes web requests out: httpx. " +
    "One talks to the model: openai. " +
    "One keeps your key out of the code: python-dotenv. " +
    "And one is the whole reason we are here: mcp. " +
    "Nothing else gets installed for the rest of this video.";
  scenes.push(scene('LIST_BUILD', n, {
    heading: 'Six libraries, six jobs',
    items: [
      {text: 'fastapi — write the routes', atWord: at(n, 'FastAPI')},
      {text: 'uvicorn — actually serve them', atWord: at(n, 'uvicorn')},
      {text: 'httpx — make web requests from code', atWord: at(n, 'httpx')},
      {text: 'openai — talk to the model', atWord: at(n, 'openai')},
      {text: 'python-dotenv — keep the key out', atWord: at(n, 'python-dotenv')},
      {text: 'mcp — the protocol itself', atWord: at(n, 'mcp')},
    ],
  }));
}

// ═══ CHAPTER 2b — the service, proven in a browser ═══════════════════════════
//
// OWNER, 2026-09-05: *"I need you to show if the api server is running, how it is run, how
// it is served. Open the /docs of the server and show example api calls actually being made
// and how response comes back."* FastAPI ships Swagger UI at /docs for free, so the viewer
// can see the routes they just typed, press Execute, and watch a real response arrive —
// including the 500 from the route we broke on purpose.
scenes.push(chapter(
  "Before we go near AI, let's prove the service is real. It has a web page of its own.",
  3, 'Your service, in a browser', 'press a button, watch a real request go'));

{
  const n =
    "Our service is still running in the background from earlier, on port eight thousand. " +
    "So open a browser and go to that address, slash docs. " +
    "And there it is — a page we did not write. " +
    "FastAPI builds this for you out of the routes in api dot py, " +
    "and it is genuinely one of the best reasons to use it. " +
    "Look at what is listed: slash orders, slash orders slash order id, and slash checkout. " +
    "Those are the three functions we typed, " +
    "with the exact names and the exact arguments we gave them. " +
    "Nobody wrote this documentation. It was read out of the code.";
  scenes.push(rec(n, 'the page FastAPI writes for you',
    'The service running on port 8000, documenting itself.',
    [D('docs', 'a page we did not write', {
       callouts: [{text: 'generated from api.py', mark: 'title', side: 'right',
                   color: 'green', atWord: at(n, 'builds')}]}),
     D('routes', 'the three routes we typed', {wantAtWord: at(n, 'listed'),
       overlay: {kind: 'chain', atWord: at(n, 'code'),
                 steps: ['api.py', 'FastAPI reads it', 'OpenAPI schema', '/docs page']},
       callouts: [{text: 'the same names you typed', mark: null, side: 'top',
                   color: 'blue', atWord: at(n, 'arguments')}]})], {sourceNote: 'Your own machine — 127.0.0.1:8000'}));
}

{
  const n =
    "Now let's actually call one. Click slash orders to open it, " +
    "then Try it out, then Execute. " +
    "And watch what comes back. " +
    "There is the curl command it sent, so you can see the request in plain form. " +
    "There is the request URL. " +
    "Two hundred, which is HTTP for it worked. " +
    "And the response body: our three orders, as JSON, " +
    "straight out of that dictionary we typed into api dot py. " +
    "This is worth sitting with for a second. " +
    "You wrote a Python function, and it is now answering web requests. " +
    "That is the whole of what a web service is.";
  scenes.push(rec(n, 'press Execute, get a real answer',
    'A real HTTP request, and the JSON that comes back.',
    [D('openlist', 'open the route', {wantAtWord: at(n, 'Click')}),
     D('tryit', 'try it out', {wantAtWord: at(n, 'Try')}),
     D('exec', 'send it', {wantAtWord: at(n, 'Execute')}),
     D('scrollresp', 'down to the answer'),
     D('resp', 'three orders, as JSON', {wantAtWord: at(n, 'curl'),
       zooms: [{mark: 'json', atWord: at(n, 'body')}],
       callouts: [{text: 'the dict from api.py, as JSON', mark: 'json', side: 'right',
                   color: 'blue', atWord: at(n, 'dictionary')}]}),
     D('closelist', 'close it')], {sourceNote: 'Your own machine — 127.0.0.1:8000'}));
}

{
  const n =
    "Let's do one more, the one that takes an argument. " +
    "Slash orders slash order id. Try it out, " +
    "and this time there is a box to fill in, because that route needs to know which order. " +
    "Type SO one thousand and three — the one we made lost in transit — and Execute. " +
    "And there is the row, on its own: " +
    "id SO one thousand and three, region Remote, status lost in transit. " +
    "Look at the request URL while it is up: slash orders slash SO one thousand and three. " +
    "The order id you typed became part of the address. " +
    "That is what those curly braces in the route meant.";
  scenes.push(rec(n, 'one order, by its id',
    'A path parameter, and the single row it returns.',
    [D('openone', 'open the route', {wantAtWord: at(n, 'Slash')}),
     D('tryone', 'try it out', {wantAtWord: at(n, 'Try')}),
     D('fillid', 'the id goes in', {wantAtWord: at(n, 'Type')}),
     D('execone', 'send it', {wantAtWord: at(n, 'Execute')}),
     D('scrollone', 'down to the answer'),
     D('lost', 'lost in transit', {wantAtWord: at(n, 'row'),
       zooms: [{mark: 'status', atWord: at(n, 'status')}],
       callouts: [{text: 'the id became part of the URL', mark: 'status', side: 'right',
                   color: 'purple', atWord: at(n, 'address')}]}),
     D('closeone', 'close it')], {sourceNote: 'Your own machine — 127.0.0.1:8000'}));
}

{
  const n =
    "And now the interesting one. Slash checkout, the route we deliberately broke. " +
    "Try it out, Execute — and notice it takes a moment, " +
    "because that route sleeps for up to two and a half seconds before it does anything. " +
    "And there is the answer: five hundred, internal server error. " +
    "That is not a mistake in our code. That is our code doing exactly what we told it to. " +
    "More than half the time this route fails, " +
    "and every one of those failures has just been written into service dot log " +
    "by the middleware, with the status and how long it took. " +
    "That is the problem our agent is going to investigate.";
  scenes.push(rec(n, 'the route that fails on purpose',
    'A live 500, and the log line it just wrote.',
    [D('opencheckout', 'open the route', {wantAtWord: at(n, 'Slash')}),
     D('trycheckout', 'try it out', {wantAtWord: at(n, 'Try')}),
     D('execcheckout', 'and wait for it', {wantAtWord: at(n, 'Execute')}),
     D('scrollcheckout', 'down to the answer'),
     D('checkoutresp', 'five hundred, live', {wantAtWord: at(n, 'answer'),
       overlay: {kind: 'split', atWord: at(n, 'mistake'),
                 left: 'a bug', right: 'on purpose',
                 leftNote: 'something you would fix',
                 rightNote: 'something for the agent to find'},
       callouts: [{text: 'written to service.log just now', mark: null, side: 'top',
                   color: 'orange', atWord: at(n, 'middleware')}]})], {sourceNote: 'Your own machine — 127.0.0.1:8000'}));
}

{
  const n =
    "One last idea before we leave the browser, " +
    "because it is the hinge the whole video turns on. " +
    "A normal web page sends back HTML, which is shaped for a human to look at. " +
    "Our routes send back JSON, which is shaped for a program to read. " +
    "Same request, same server, completely different audience. " +
    "And that is exactly why a model can eventually use this: " +
    "JSON is text with a known structure, " +
    "and text with a known structure is the only thing a model can work with.";
  scenes.push(scene('SPEC_COMPARE', n, {compare: {
    headline: 'HTML is for eyes, JSON is for code',
    atWord: at(n, 'HTML'),
    a: {name: 'a web page', color: 'blue'},
    b: {name: 'our API', color: 'green'},
    rows: [
      {label: 'sends back', a: 'HTML', b: 'JSON', winner: 'tie', atWord: at(n, 'JSON')},
      {label: 'meant for', a: 'a person', b: 'a program', winner: 'tie',
       atWord: at(n, 'audience')},
      {label: 'a model can read it', a: 'barely', b: 'yes', winner: 'b',
       atWord: at(n, 'structure')},
    ],
  }}));
}

// ═══ CHAPTER 3 — three ordinary functions ════════════════════════════════════
scenes.push(chapter(
  "Now three plain Python functions. No AI anywhere near them yet.",
  4, 'Three plain functions', 'the ones you probably already have'));

{
  const n =
    "New file, tools dot py, and there's nothing clever in it. " +
    "The first function counts errors. " +
    "That function walks the log a line at a time. " +
    "Line dot split with nothing in the brackets " +
    "chops a line wherever there is whitespace, " +
    "which is why the log was written with spaces between the fields. " +
    "We hand the five pieces straight into five names — " +
    "time, level, route, status, duration — in one line, " +
    "and that is a genuinely nice piece of Python called unpacking. " +
    "Then we keep only the lines where level is ERROR, " +
    "and tally them up by route using a Counter. " +
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
       zooms: [{mark: 'split5', atWord: at(n, 'chops')},
               {mark: 'counter', atWord: at(n, 'tally')}],
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

{
  const n =
    "And the second function gives back this. " +
    "Every route, with how long it took on average, slowest first. " +
    "Checkout at fifteen hundred and eighty nine milliseconds, " +
    "and everything else at one. " +
    "Two numbers is all it takes to see which route is the problem — " +
    "and notice that neither function needed to be clever. " +
    "One counted. One averaged. " +
    "That is genuinely the level of code we are handing to a model.";
  scenes.push(scene('DATABASE_TABLE', n, {database: {
    headline: 'Slowest first, and it is not close',
    tableName: 'slowest_routes()',
    query: 'average duration per route',
    columns: ['route', 'average'],
    rows: [
      ['/checkout', '1589ms'],
      ['/orders', '1ms'],
      ['/orders/SO-1001', '1ms'],
    ],
    highlight: [0, 1],
    highlightAtWords: [at(n, 'Checkout'), at(n, 'else')],
    atWord: at(n, 'route'),
  }}));
}

// ═══ CHAPTER 4 — the problem, and what MCP is ════════════════════════════════
scenes.push(chapter(
  "So here's the problem. Those functions work, and a model can't touch them.",
  5, 'What MCP actually is', 'a standard way to hand over your tools'));

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

{
  const n =
    "It is worth being concrete about what MCP is saving you, " +
    "because you can absolutely do this without it. " +
    "By hand, you write the JSON description of every function yourself, " +
    "you keep it in step with the code every time an argument changes, " +
    "and you write a different version for each provider you want to support. " +
    "With MCP, you write a decorator, " +
    "and the description is generated from the function that is already there. " +
    "It is the difference between maintaining a second copy of your code " +
    "and not having one.";
  scenes.push(scene('SPEC_COMPARE', n, {compare: {
    headline: 'By hand, or by decorator',
    atWord: at(n, 'concrete'),
    a: {name: 'by hand', color: 'orange'},
    b: {name: 'with MCP', color: 'green'},
    rows: [
      {label: 'write the JSON', a: 'you do', b: 'generated', winner: 'b',
       atWord: at(n, 'yourself')},
      {label: 'when args change', a: 'edit twice', b: 'edit once', winner: 'b',
       atWord: at(n, 'step')},
      {label: 'per provider', a: 'one each', b: 'one, total', winner: 'b',
       atWord: at(n, 'provider')},
    ],
  }}));
}

// ═══ CHAPTER 5 — the server ══════════════════════════════════════════════════
scenes.push(chapter(
  "And this is the whole trick: you don't write that description. A decorator does.",
  6, 'Your first MCP server', 'the docstring becomes the schema'));

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
    "and a vague one gets your tool ignored. " +
    "Pause here and compare the two halves of this file for a second — " +
    "the function underneath is untouched, and the line above it is the entire change.";
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

{
  const n =
    "MCP has three of these building blocks, and we have used two. " +
    "A tool is something the model decides to run. " +
    "A resource is something your code fetches, like opening a file. " +
    "And the third is a prompt — a canned instruction the server can offer, " +
    "which we are not using today but you will see mentioned everywhere. " +
    "The difference between all three is only ever who pulls the trigger: " +
    "the AI, your code, or the person sitting there.";
  scenes.push(scene('MCP_CONTROL', n, {mcpControl: {
    headline: 'Three primitives, [three triggers]',
    caption: 'who decides',
    premise: 'All three live in the same server file. The only question is who starts them.',
    color: 'purple',
    atWord: 1,
    cells: [
      {label: 'tool', sub: 'the model decides to run it', owner: 'ai',
       icon: 'lucide:wrench', atWord: at(n, 'tool')},
      {label: 'resource', sub: 'your code fetches it', owner: 'code',
       icon: 'lucide:file-text', atWord: at(n, 'resource')},
      {label: 'prompt', sub: 'the person picks it', owner: 'user',
       icon: 'lucide:message-square', atWord: at(n, 'prompt')},
    ],
  }}));
}

// ═══ CHAPTER 6 — the official pages ══════════════════════════════════════════
scenes.push(chapter(
  "Before we use it — this is somebody's work, and it's worth knowing whose.",
  7, 'Where this comes from', 'the protocol, and the SDK'));

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
  8, 'Where the key lives', 'never in the code, not once'));

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

{
  const n =
    "One more word on that key, because it is the mistake that costs people real money. " +
    "A key in your code is a key in your git history, " +
    "and a key in git history is a key on the internet the moment you push. " +
    "Deleting the line later does not help — git remembers. " +
    "A key in dot env, with dot env in dot gitignore, never enters history at all. " +
    "That is the entire difference, and it takes thirty seconds.";
  scenes.push(scene('SPEC_COMPARE', n, {compare: {
    headline: 'Where the key lives decides everything',
    atWord: at(n, 'key'),
    a: {name: 'in the code', color: 'red'},
    b: {name: 'in .env', color: 'green'},
    rows: [
      {label: 'enters git history', a: 'yes', b: 'never', winner: 'b',
       atWord: at(n, 'history')},
      {label: 'deleting fixes it', a: 'no', b: 'n/a', winner: 'b',
       atWord: at(n, 'Deleting')},
      {label: 'cost if pushed', a: 'your bill', b: 'nothing', winner: 'b',
       atWord: at(n, 'internet')},
    ],
  }}));
}

// ═══ CHAPTER 8 — the agent, one line at a time ═══════════════════════════════
//
// OWNER, 2026-09-05: *"Your explanation on agent.py is not at all beginner friendly. You are
// not explaining it line by line rather you are just speaking and moving on very rapidly…
// I felt left out with so much stdout or something related code lines were shown and I was
// clueless on what, and why it was needed."*
//
// So this chapter is rebuilt from six beats to fourteen. Every import is named and given a
// job. `async`, `await`, `stdin`/`stdout`, a context manager, a list comprehension, an
// f-string and `json.loads` are each defined the first time they appear, in the same breath,
// in plain English. Runtime is free (the title rounds up afterwards) — the only thing that
// matters here is that somebody who has written a for-loop and nothing else can follow it.
scenes.push(chapter(
  "Now the agent itself. This is the only genuinely new idea in the video, so we go slowly.",
  9, 'The agent, line by line', 'ask, run, answer'));

{
  const n =
    "Last file, agent dot py, and we start with the imports. " +
    "I want to name all eight of these, because every one of them does a job here " +
    "and a list of imports you cannot read is where a beginner gets left behind. " +
    "Asyncio is Python's library for doing things that involve waiting. " +
    "Json turns text into Python data and back. " +
    "Os reads settings from the environment. " +
    "Sys gives us the question typed on the command line. " +
    "Load dotenv is the one that opens our dot env file and puts those three settings " +
    "into the environment, so os can find them. " +
    "Then three pieces from the MCP library, and one from OpenAI. " +
    "We will meet each of those three the moment we use it, " +
    "so do not worry about them yet.";
  scenes.push(rec(n, 'eight imports, eight jobs',
    'The imports, and what each one is actually for.',
    [A('openagent', 'the last file'),
     A('ag1', 'the imports', {wantAtWord: at(n, 'beginner'),
       zooms: [{mark: 'imports', atWord: at(n, 'Asyncio')}],
       callouts: [{text: 'reads .env into the environment', mark: 'imports', side: 'right',
                   color: 'green', atWord: at(n, 'dotenv')},
                  {text: 'three from MCP, one from OpenAI', mark: 'imports', side: 'right',
                   color: 'purple', atWord: at(n, 'three')}]})]));
}

{
  const n =
    "Before the next block, two words that are about to appear everywhere. " +
    "Async, and await. " +
    "Normally Python runs one line, finishes it, then runs the next. " +
    "But talking to another program means waiting — waiting for it to start, " +
    "waiting for it to reply. " +
    "A function marked async is one that is allowed to pause in the middle. " +
    "And await is the word that marks the pause: " +
    "it means go and do this, and wake me up when there is an answer. " +
    "That is the whole idea. " +
    "You will see await on every line that talks to the server, and nowhere else. " +
    "If you have never written async Python, you do not need to understand it deeply today. " +
    "You need to know that await means waiting for something outside this program.";
  scenes.push(scene('SPEC_COMPARE', n, {compare: {
    headline: 'What async and await actually mean',
    atWord: at(n, 'Normally'),
    a: {name: 'ordinary code', color: 'blue'},
    b: {name: 'async code', color: 'green'},
    rows: [
      {label: 'runs top to bottom', a: 'yes', b: 'yes', winner: 'a',
       atWord: at(n, 'Normally')},
      {label: 'can pause mid-way', a: 'no', b: 'yes', winner: 'b',
       atWord: at(n, 'pause')},
      {label: 'written as', a: 'def', b: 'async def', winner: 'b',
       atWord: at(n, 'marked')},
      {label: 'marks the wait', a: '—', b: 'await', winner: 'b',
       atWord: at(n, 'await', 2)},
      {label: 'used for', a: 'the rest', b: 'talking out', winner: 'b',
       atWord: at(n, 'server')},
      {label: 'needed today?', a: 'yes', b: 'just the word', winner: 'a',
       atWord: at(n, 'deeply')},
    ],
  }}));
}

{
  const n =
    "Now the block that starts the server, and there is a lot in five lines. " +
    "Async def main means: here is our program, and it is allowed to wait. " +
    "Stdio server parameters is us describing how to start the server. " +
    "Command is which Python to run, and args is which file to hand it — server dot py. " +
    "So we are not connecting to something already running. " +
    "We are saying: start this program for me. " +
    "Then stdio client, and this is the word I owe you an explanation for. " +
    "Stdio is short for standard input and standard output. " +
    "Every program on your machine is born with two pipes: " +
    "one it reads from, and one it writes to. " +
    "When you type a command and see output, you are using them. " +
    "That is all the connection is here — our program writes a question into the server's " +
    "input pipe, and reads the answer out of its output pipe. " +
    "No port. No network. No server to deploy. " +
    "Pause here for a moment and look at those five lines, " +
    "because that is the entire connection, and it never gets more complicated than this.";
  scenes.push(rec(n, 'start it, and talk through two pipes',
    'Launching server.py and connecting to it over standard input and output.',
    [A('ag1b', 'connect over stdio', {
       zooms: [{mark: 'params', atWord: at(n, 'Command')},
               {mark: 'init', atWord: at(n, 'pipes')}],
       releases: [{atWord: at(n, 'input')}],
       overlay: {kind: 'chain', atWord: at(n, 'Stdio', 2),
                 steps: ['agent.py', 'starts server.py', 'stdin / stdout', 'connected']},
       callouts: [{text: 'which program to start', mark: 'params', side: 'right',
                   color: 'blue', atWord: at(n, 'args')},
                  {text: 'stdin = read · stdout = write', mark: 'init', side: 'right',
                   color: 'orange', atWord: at(n, 'born')},
                  {text: 'no port, no network', mark: 'params', side: 'right', color: 'purple',
                   atWord: at(n, 'network')}]})]));
}

{
  const n =
    "Two more pieces of that block, and both are Python you will meet again. " +
    "Async with means: open this thing, and close it properly when we are done, " +
    "even if something goes wrong in between. " +
    "It is the same idea as opening a file with the word with. " +
    "The two names in brackets, read and write, are those two pipes. " +
    "Client session wraps them into a conversation, " +
    "so instead of writing raw text down a pipe we get to call methods with names. " +
    "And then await session dot initialize — the handshake. " +
    "Both sides say which version of the protocol they speak " +
    "and what they can do, before anything else happens. " +
    "You will never write that yourself. The library does it, " +
    "and honestly that is a large part of what MCP is worth.";
  scenes.push(scene('MCP_WIRE', n, {mcpWire: {
    headline: 'The handshake, [before anything else]',
    caption: 'what crosses the pipe',
    premise: 'agent.py wrote into server.py\'s input pipe and read its output. Each arrow is one JSON-RPC message.',
    color: 'blue',
    atWord: 1,
    codeTitle: 'agent.py',
    ends: [{label: 'AGENT'}, {label: 'SERVER'}],
    cells: [
      {label: 'initialize', sub: 'which version do you speak?', dir: 'out',
       atWord: at(n, 'initialize'),
       out: ['{"method":"initialize",', ' "params":{"protocolVersion":…}}']},
      {label: 'ready', sub: 'and here is what I can do', dir: 'back',
       atWord: at(n, 'handshake'),
       out: ['{"result":{"capabilities":', '  {"tools":{}, "resources":{}}}}']},
    ],
    lines: [
      {text: 'async with stdio_client(params) as (read, write):',
       detail: 'Open the two pipes, and close them properly afterwards.',
       atWord: at(n, 'read')},
      {text: '    async with ClientSession(read, write) as session:',
       detail: 'Wrap the pipes into a conversation with named methods.',
       atWord: at(n, 'session')},
      {text: '        await session.initialize()',
       detail: 'The handshake. The library writes it, not you.',
       atWord: at(n, 'initialize')},
      {text: '        # from here on, session is the server',
       detail: 'Everything after this line talks through those two pipes.',
       atWord: at(n, 'version')},
    ],
  }}));
}

{
  const n =
    "Next, we ask the server what it has, and reshape the answer. " +
    "Await session dot list tools goes down the pipe and comes back with all three, " +
    "each one carrying the name, the description and the schema " +
    "that our decorator built back in server dot py. " +
    "Then this block in square brackets is a list comprehension. " +
    "If that is new to you, it is Python's short way of writing a for loop " +
    "that builds a list: for every tool in what came back, make one dictionary. " +
    "And what we are building is the exact shape the OpenAI library wants — " +
    "a type, a name, a description, and the parameters. " +
    "This is genuinely all this block does. It is a rename, not a translation. " +
    "One thing to notice: input underscore schema, with an underscore. " +
    "In version one of the SDK that was inputSchema, in camel case, " +
    "and it is the single most common line to break when you follow an older tutorial. " +
    "Then the last line prints how many tools the model can see. " +
    "That f before the quote makes it an f-string, " +
    "which just means Python drops the value of len menu straight into the text.";
  scenes.push(rec(n, 'ask what exists, then reshape it',
    'Fetching the tool list and putting it in the shape the model expects.',
    [A('ag2', 'list, then reshape', {
       zooms: [{mark: 'list', atWord: at(n, 'list')},
               {mark: 'schema', atWord: at(n, 'input')}],
       overlay: {kind: 'chain', atWord: at(n, 'comprehension'),
                 steps: ['server.py', 'list_tools()', '3 tool schemas', 'the menu']},
       callouts: [{text: 'a for-loop that builds a list', mark: 'list', side: 'right',
                   color: 'blue', atWord: at(n, 'comprehension')},
                  {text: 'built by the decorator, back in server.py', mark: 'schema',
                   side: 'right', color: 'green', atWord: at(n, 'decorator')},
                  {text: 'v1 spelled it inputSchema', mark: 'schema', side: 'right',
                   color: 'orange', atWord: at(n, 'camel')}]})]));
}

{
  const n =
    "That number is the first thing to look at when something goes wrong. " +
    "Zero means the server started but registered nothing. " +
    "Three means everything up to here is working.";
  scenes.push(scene('LOG_STREAM', n, {logs: {
    rate: 'check first',
    highlight: 2,
    atWord: at(n, 'zero'),
    lines: [
      {level: 'warn', tag: 'registered 0', text: 'the model can see 0 tools'},
      {level: 'warn', tag: 'never started', text: 'connection closed'},
      {level: 'info', tag: 'all good', text: 'the model can see 3 tools'},
    ],
  }}));
}

{
  const n =
    "Now the model. " +
    "OpenAI here is the client object, and we hand it two things out of our dot env file: " +
    "the address to talk to, and the key. " +
    "Because the address is configurable, this same code points at Azure OpenAI, " +
    "or at OpenAI directly, or at anything else that speaks the same API. " +
    "Messages is the conversation, and it starts with one entry: " +
    "role user, content the question. " +
    "Role is just who is speaking — user is you, assistant is the model, " +
    "and there is a third one we will meet in a minute. " +
    "Then the call itself. Same create you would use for any chat, " +
    "same messages list, and one new argument: tools, which is our menu. " +
    "We are not telling it which tool to use. We are telling it what exists. " +
    "And picked is us digging the reply out of the response object — " +
    "choices, the first one, its message.";
  scenes.push(rec(n, 'hand it the menu',
    'The model call, with the tool list attached.',
    [A('ag3', 'one new argument', {wantAtWord: at(n, 'OpenAI'),
       zooms: [{mark: 'tools', atWord: at(n, 'tools')}],
       overlay: {kind: 'split', atWord: at(n, 'exists'),
                 left: 'what we send', right: 'what we do NOT send',
                 leftNote: 'the question + all three tools',
                 rightNote: 'any instruction about which one to use'},
       callouts: [{text: 'the address makes it portable', mark: 'tools', side: 'right',
                   color: 'green', atWord: at(n, 'Azure')},
                  {text: 'what exists, not what to use', mark: 'tools', side: 'right',
                   color: 'blue', atWord: at(n, 'exists')}]})]));
}

{
  const n =
    "What comes back is different from a normal reply, and this is the heart of it. " +
    "Instead of text, the model may hand us tool calls — " +
    "the name of a function it wants run, and the arguments it wants passed. " +
    "Nothing has been executed at that point. The model has only asked. " +
    "It cannot reach your log, it cannot reach your service, " +
    "and it certainly cannot run anything on your machine. " +
    "Running it is still entirely our job — " +
    "which is exactly the safety property you want " +
    "in something that can reach your data.";
  scenes.push(scene('MCP_REACH', n, {mcpReach: {
    headline: 'It asks. [You run it.]',
    caption: 'who does what',
    premise: 'The model returns a request. Your code decides whether to honour it. That boundary never moves.',
    color: 'purple',
    atWord: 1,
    ends: [{label: 'THE MODEL'}, {label: 'YOUR CODE'}],
    cells: [
      {label: 'names a tool', sub: 'recent_errors', icon: 'lucide:message-square',
       text: 'out', atWord: at(n, 'name')},
      {label: 'runs nothing', sub: 'it has no hands', icon: 'lucide:ban',
       text: 'out', atWord: at(n, 'executed')},
      {label: 'your code runs it', sub: 'or refuses to', icon: 'lucide:terminal',
       text: 'bridge', atWord: at(n, 'job')},
    ],
  }}));
}

{
  const n =
    "Before we write the next block, hold the shape in your head, " +
    "because every agent you will ever read is some version of this ring. " +
    "You ask the model, with the tool list attached. " +
    "You read what it asked for. You run that tool. You hand the result back. " +
    "Then you ask once more, and this time it answers in words instead of tool calls. " +
    "Ours goes round exactly once, which is all this question needs. " +
    "Wrap those four steps in a while loop instead, " +
    "and the model can go round as many times as it likes — " +
    "read the errors, then go and fetch the order behind one of them. " +
    "That one change is the whole difference between a helper and an agent, " +
    "and it is the first upgrade I would make to this file.";
  scenes.push(scene('MCP_LOOP', n, {mcpLoop: {
    headline: 'Ask, run, [ask again]',
    caption: 'the agent loop',
    premise: 'agent.py sits between the model and the server, relaying until the model answers in words instead of tool calls.',
    color: 'orange',
    atWord: 1,
    codeTitle: 'agent.py',
    cells: [
      {label: 'ask the model', sub: '+ the tool list', atWord: at(n, 'ask')},
      {label: 'tool_calls', sub: 'what it wants run', atWord: at(n, 'asked')},
      {label: 'call_tool', sub: 'you run it', atWord: at(n, 'run')},
      {label: 'role: tool', sub: 'the result goes back', atWord: at(n, 'hand')},
      {label: 'it answers', sub: 'words, not tool calls', text: 'exit', atWord: at(n, 'words')},
    ],
    lines: [
      {text: 'answer = client.chat.completions.create(',
       detail: 'One ask, with the menu attached.', atWord: at(n, 'attached')},
      {text: '    model=..., messages=messages, tools=menu)'},
      {text: 'for call in picked.tool_calls:',
       detail: 'Run every tool it asked for. Ours needs one pass.', atWord: at(n, 'asked')},
      {text: '    result = await session.call_tool(...)', atWord: at(n, 'tool', 2)},
      {text: 'final = client.chat.completions.create(',
       detail: 'Ask again, with the results in the conversation.', atWord: at(n, 'more')},
    ],
  }}));
}

{
  const n =
    "So we run whatever it picked, and there are five lines here worth going through one by one. " +
    "First, messages dot append picked. " +
    "We put the model's own message back into the conversation, " +
    "because the next time we ask, it needs to remember what it just asked for. " +
    "Second, for call in picked dot tool calls — " +
    "it may have asked for more than one, so we loop over all of them. " +
    "Third, json dot loads. " +
    "The arguments arrive as a string of text, not as Python data, " +
    "so this is the line that turns that text into a real dictionary we can pass along. " +
    "Fourth, we print what it chose, purely so we can watch it think. " +
    "And fifth, await session dot call tool — " +
    "the name it asked for, the arguments it chose, sent down that same pipe. " +
    "That is the line where the model's request finally becomes your function running.";
  scenes.push(rec(n, 'read the request, run the tool',
    'Turning what the model asked for into a real function call.',
    [A('ag4', 'run whatever it picked', {
       zooms: [{mark: 'call', atWord: at(n, 'fifth')}],
       overlay: {kind: 'chain', atWord: at(n, 'loads'),
                 steps: ['"{}" as text', 'json.loads', 'a real dict', 'call_tool()']},
       callouts: [{text: 'arguments arrive as TEXT', mark: 'call', side: 'right',
                   color: 'orange', atWord: at(n, 'string')},
                  {text: 'it may ask for more than one', mark: 'call', side: 'right',
                   color: 'blue', atWord: at(n, 'Second')}]})]));
}

{
  const n =
    "Then we hand the result back, and the shape of this matters. " +
    "Role tool — that is the third role I promised you. " +
    "User is you, assistant is the model, and tool means " +
    "this is what your function returned. " +
    "Tool call id is how the model knows which of its requests this answers, " +
    "which is why we loop with the id rather than just appending an answer. " +
    "And result dot content zero dot text — " +
    "MCP hands back a list of content pieces, because a tool could return " +
    "text or an image or a file. Ours returns one piece of text, so we take the first. " +
    "Pause here and read the whole block, " +
    "because this is the part people get wrong when they write it from memory.";
  scenes.push(rec(n, 'feed the answer back',
    'The result returns to the conversation as a tool message.',
    [A('ag5', 'and let it answer', {
       zooms: [{mark: 'final', atWord: at(n, 'Role')}],
       overlay: {kind: 'rows', atWord: at(n, 'assistant'),
                 rows: [{text: 'role: user — the question you typed', state: 'kept'},
                        {text: 'role: assistant — the tool it wants', state: 'kept'},
                        {text: 'role: tool — what your function returned', state: 'new'}]},
       callouts: [{text: 'ties the answer to the request', mark: 'final', side: 'right',
                   color: 'blue', atWord: at(n, 'id')},
                  {text: 'a list, because a tool could return anything', mark: 'final',
                   side: 'right', color: 'purple', atWord: at(n, 'pieces')}]})]));
}

{
  const n =
    "And finally we ask one more time. " +
    "Same client, same model, the same messages list — " +
    "except the list now contains the answer your function produced. " +
    "Notice what is missing from this second call: tools. " +
    "We do not offer the menu again, because we want words this time, not another request. " +
    "Then we print what it says. " +
    "The very last line, asyncio dot run of main of sys argv one, " +
    "is what actually starts everything: " +
    "asyncio dot run is how you launch an async function, " +
    "and sys argv one is the question you type after the file name. " +
    "Save the file. That is every line of code in this project, " +
    "and agent dot py — the only file here that talks to a model — " +
    "comes to about seventy lines, most of which is connecting and reshaping. " +
    "MCP is carrying everything else.";
  scenes.push(rec(n, 'ask again, and print the answer',
    'The second call, this time without the menu.',
    [A('ag5', 'the second call', {
       zooms: [{mark: 'final', atWord: at(n, 'again')}],
       overlay: {kind: 'split', atWord: at(n, 'Notice'),
                 left: 'first call', right: 'second call',
                 leftNote: 'messages + tools=menu',
                 rightNote: 'messages only — give me words'},
       callouts: [{text: 'now holds your function\'s answer', mark: 'final', side: 'right',
                   color: 'blue', atWord: at(n, 'produced')},
                  {text: 'no tools = give me words', mark: 'final', side: 'right',
                   color: 'green', atWord: at(n, 'missing')}]}),
     A('saveagent', 'saved', {wantAtWord: at(n, 'Save'),
       callouts: [{text: 'the question you type goes here', mark: null, side: 'top',
                   color: 'purple', atWord: at(n, 'argv')}]})]));
}

{
  const n =
    "And one honest warning before we run it. " +
    "A tool is your code, and it runs with your permissions. " +
    "Ours only reads a log file and calls a service next door, " +
    "which is about as harmless as it gets. " +
    "But a tool that deletes files would delete files, " +
    "and a tool that spends money would spend money. " +
    "The model does not run anything — your code does — " +
    "so the question is never what will the model do, " +
    "it is what did I give it the ability to do.";
  scenes.push(scene('MCP_REACH', n, {mcpReach: {
    headline: 'A tool runs with [your permissions]',
    caption: 'the honest warning',
    premise: 'The model only ever names a tool. Whatever that tool can reach, it reaches as you.',
    color: 'red',
    atWord: 1,
    ends: [{label: 'THE MODEL'}, {label: 'YOUR MACHINE'}],
    cells: [
      {label: 'reads service.log', sub: 'what ours does', icon: 'lucide:file-text',
       text: 'in', atWord: at(n, 'reads')},
      {label: 'deletes files', sub: 'if you wrote that tool', icon: 'lucide:trash-2',
       text: 'out', atWord: at(n, 'deletes')},
      {label: 'spends money', sub: 'if you wrote that tool', icon: 'lucide:credit-card',
       text: 'out', atWord: at(n, 'spend')},
      {label: 'your code decides', sub: 'the only real gate', icon: 'lucide:shield',
       text: 'bridge', atWord: at(n, 'ability')},
    ],
  }}));
}

// ═══ CHAPTER 9 — the payoff ══════════════════════════════════════════════════
scenes.push(chapter(
  "Everything is written. Let's ask it something we never told it how to answer.",
  10, 'Ask it a question', 'in plain English'));

{
  const n =
    "Our checkout is misbehaving. What does the log say? Two sentences, " +
    "typed the way you would say them to a colleague. " +
    "Nobody wired that question to anything. " +
    "The model can see three tools, and it picks one. Recent errors. " +
    "Nobody told it which — it read three descriptions, " +
    "and decided that was the one that answers a question about the log. " +
    "And now look at the last line, because this is the moment. " +
    "That paragraph is written by the model, " +
    "and the number in it — seven — came out of your log file, " +
    "read by your function, through your MCP server. " +
    "The checkout process has failed seven times, it says, " +
    "and it suggests looking at the error messages next. " +
    "Pause here and read that sentence properly. " +
    "Nothing in this project was hand-wired to answer that question. " +
    "You have taken an ordinary Python application and made it AI capable — " +
    "it can now be asked things in English, " +
    "and it goes and finds the answer in your own data. " +
    "That is what MCP bought us.";
  scenes.push(rec(n, 'it picks the tools itself',
    'The finished agent, answering a question nobody scripted.',
    [A('runagent', 'asking in plain English', {
       zooms: [{mark: 'sees', atWord: at(n, 'three')},
               {mark: 'chose', atWord: at(n, 'Recent')},
               {at: 'full', atWord: at(n, 'moment')}],
       overlay: {kind: 'split', atWord: at(n, 'descriptions'),
                 left: 'three tools offered', right: 'one tool chosen',
                 leftNote: 'recent_errors · slowest_routes · get_order',
                 rightNote: 'recent_errors — nobody told it which'},
       callouts: [{text: 'it chose this one itself', mark: 'chose', side: 'right', color: 'green',
                   atWord: at(n, 'told')},
                  {text: 'written by the model, from YOUR log', mark: 'chose', side: 'right',
                   color: 'green', atWord: at(n, 'paragraph')}]})]));
}

{
  const n =
    "And here is the part that makes this worth the trouble. " +
    "Nothing in server dot py knows what model we used. " +
    "Go and read it again — there is no OpenAI in there, no Azure, no API key. " +
    "It only describes three functions in the one shape the protocol agreed on. " +
    "Which means the same file, unchanged, " +
    "works with Claude Desktop, with an editor like Cursor or VS Code, " +
    "with somebody else's agent, or with the one we just wrote. " +
    "You write the tool once, and every client that speaks MCP can use it. " +
    "That is the whole reason a standard was worth having, " +
    "and it is why this is a genuinely useful thing to have built.";
  scenes.push(scene('MCP_MESH', n, {mcpMesh: {
    headline: 'One server, [every client]',
    caption: 'why the standard pays',
    premise: 'server.py names no model and holds no key. Anything that speaks MCP can pick it up as it is.',
    color: 'green',
    atWord: 1,
    cells: [
      {label: 'Claude Desktop', icon: 'si:anthropic', text: 'client', atWord: at(n, 'Claude')},
      {label: 'Cursor / VS Code', icon: 'lucide:file-code', text: 'client', atWord: at(n, 'editor')},
      {label: 'our agent.py', icon: 'lucide:bot', text: 'client', atWord: at(n, 'wrote')},
      {label: 'recent_errors', icon: 'lucide:file-text', text: 'server', atWord: at(n, 'describes')},
      {label: 'slowest_routes', icon: 'lucide:timer', text: 'server', atWord: at(n, 'functions')},
      {label: 'get_order', icon: 'lucide:package', text: 'server', atWord: at(n, 'shape')},
      {label: 'server.py', icon: 'lucide:git-fork', text: 'hub', atWord: at(n, 'once')},
    ],
  }}));
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

{
  const n =
    "Let's follow one question all the way through, now that every piece exists. " +
    "You type a sentence. " +
    "Agent dot py sends it to the model along with three tool descriptions. " +
    "The model picks one and sends the name back. " +
    "Agent dot py runs it through the MCP server, " +
    "which calls the plain Python function, which reads your log file. " +
    "The answer goes back into the conversation, " +
    "the model is asked once more, and it replies in English. " +
    "Seven steps. You wrote six of them.";
  scenes.push(scene('DIAGRAM', n, {diagram: {
    layout: 'flow',
    direction: 'horizontal',
    nodes: [
      {id: 'q', label: 'your question', sub: 'plain English', color: 'blue',
       atWord: at(n, 'sentence')},
      {id: 'ag', label: 'agent.py', sub: 'sends it with the menu', color: 'purple',
       atWord: at(n, 'descriptions')},
      {id: 'md', label: 'the model', sub: 'names one tool', color: 'orange',
       atWord: at(n, 'picks')},
      {id: 'sv', label: 'server.py', sub: 'runs the function', color: 'green',
       atWord: at(n, 'server')},
      {id: 'lg', label: 'service.log', sub: 'your own data', color: 'blue',
       atWord: at(n, 'log')},
    ],
    edges: [
      {from: 'q', to: 'ag', label: 'you type it', atWord: at(n, 'type')},
      {from: 'ag', to: 'md', label: '+ the menu', atWord: at(n, 'three')},
      {from: 'md', to: 'sv', label: 'run this one', atWord: at(n, 'back')},
      {from: 'sv', to: 'lg', label: 'reads it', atWord: at(n, 'reads')},
    ],
  }}));
}

{
  const n =
    "What a tool call looks like on the wire is worth one last look. " +
    "The model does not send code. It does not send a command. " +
    "It sends a small piece of JSON with two fields: " +
    "a name, and the arguments. " +
    "That is the entire mechanism. " +
    "Everything else in this video is us deciding what to do about it.";
  scenes.push(scene('API_REQUEST_RESPONSE', n, {api: {
    headline: 'A tool call is [two fields]',
    method: 'TOOL',
    path: 'recent_errors',
    requestLines: ['what the model sent:'],
    status: 'JSON',
    statusText: 'that is all',
    responseLines: ['{"name":"recent_errors",', ' "arguments":"{}"}'],
    clientLabel: 'the model',
    serverLabel: 'agent.py',
    atWord: at(n, 'JSON'),
  }}));
}

{
  const n =
    "One question you will hit within a day of building your own: " +
    "what happens when a tool fails? " +
    "Ours cannot really — it reads a file that is definitely there. " +
    "But if get order is handed an id that does not exist, " +
    "it returns the words there is no order called that, as text. " +
    "And that is the pattern worth copying: " +
    "a tool that fails should return a sentence explaining what went wrong, " +
    "not raise an exception. " +
    "The model reads that sentence, understands it, and can try something else. " +
    "An exception just kills your program.";
  scenes.push(scene('SPEC_COMPARE', n, {compare: {
    headline: 'When a tool fails, hand back words',
    atWord: at(n, 'fails'),
    a: {name: 'raise an error', color: 'red'},
    b: {name: 'return words', color: 'green'},
    rows: [
      {label: 'the program', a: 'stops', b: 'carries on', winner: 'b',
       atWord: at(n, 'exception')},
      {label: 'the model', a: 'sees nothing', b: 'reads why', winner: 'b',
       atWord: at(n, 'reads')},
      {label: 'it can retry', a: 'no', b: 'yes', winner: 'b',
       atWord: at(n, 'else')},
    ],
  }}));
}

// ═══ CHAPTER 10 — where to go next ═══════════════════════════════════════════
scenes.push(chapter(
  "That's a working agent. Here's how it grows, and where to read next.",
  11, 'Where this goes', 'from one file to fifty tools'));

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
{
  const n =
    "Here is what this project looks like once it grows, " +
    "so the shape is not a surprise later. " +
    "Tools becomes a folder instead of a file, with one module per subject — " +
    "logs, orders, whatever your work actually is. " +
    "Server dot py stays small, because all it does is import those modules " +
    "so their decorators run. " +
    "And agent dot py may well disappear, " +
    "because by then you point a real client at the server instead.";
  scenes.push(scene('FILE_TREE', n, {fileTree: {
    headline: 'What it looks like [at fifty tools]',
    atWord: at(n, 'grows'),
    highlight: 1,
    nodes: [
      {name: 'server.py', depth: 0, kind: 'file', color: 'green'},
      {name: 'tools', depth: 0, kind: 'folder', color: 'purple'},
      {name: 'logs.py', depth: 1, kind: 'file'},
      {name: 'orders.py', depth: 1, kind: 'file'},
      {name: 'billing.py', depth: 1, kind: 'file'},
      {name: '.env', depth: 0, kind: 'file'},
    ],
  }}));
}

{
  const n =
    "And three things to actually go and do, " +
    "because reading about this does not make it stick. " +
    "First, change a docstring to something vague and run the agent again — " +
    "watch it pick the wrong tool, and you will never forget " +
    "that the description is what it reads. " +
    "Second, add a fourth tool of your own, over a file you already have. " +
    "Third, point Claude Desktop or your editor at this same server, " +
    "and watch your functions turn up somewhere you did not write.";
  scenes.push(scene('LIST_BUILD', n, {
    heading: 'Three things to try this week',
    items: [
      {text: 'Break a docstring — watch it choose wrong', atWord: at(n, 'vague')},
      {text: 'Add a fourth tool over your own file', atWord: at(n, 'Second')},
      {text: 'Point a real client at the same server', atWord: at(n, 'Third')},
      {text: 'The description is what it reads', atWord: at(n, 'description')},
    ],
  }));
}

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
    // The audio files are mcpagent_long_sNN.mp3, NOT code_long_sNN.mp3 — render-long
    // guesses the prefix from the FIRST HYPHEN-SEGMENT of the slug when this is absent,
    // and this slug starts "code-", so every scene fell through to anullsrc and a
    // 21-minute silent track shipped. Whenever the voice prefix is not `<first>_long`,
    // it has to be stated here.
    audioPrefix: 'mcpagent_long',
    format: 'long',
    fps: 30,
    audience: 'beginner',
    onePayoff: 'wrap plain Python functions as MCP tools and let a model choose between them',
    openLoop: 'what does it actually take to code an AI agent?',
    analogy: 'a menu you hand the model, instead of telling it what to order',
    screenplay: 'masterclass',
    topicAxes: ['skill-build', 'sovereignty'],
    seo: {
      title: 'Learn MCP Properly — Build An AI Agent In Python, Under 40 Minutes (2026)',
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
    title: 'Learn MCP Properly — Build An AI Agent',
    badge: 'Python · Under 40 Mins · Beginners',
    note: 'five files, every line typed, from empty',
    asset: 'si:python',
    logos: ['si:python', 'si:openai', 'si:fastapi', 'si:anthropic'],
  },
  scenes,
};

fs.writeFileSync('topics/code-an-ai-agent-with-mcp/long.json', JSON.stringify(spec, null, 2) + '\n');
const words = scenes.reduce((a, s) => a + s.narration.trim().split(/\s+/).length, 0);
console.log(`wrote topics/code-an-ai-agent-with-mcp/long.json — ${scenes.length} scenes, ` +
            `${words} words (~${Math.floor(words / 3.11 / 60)}m${String(Math.round((words / 3.11) % 60)).padStart(2, '0')}s)`);

// PRINT THE CENSUS, EVERY BUILD.
//
// PAID FOR, 2026-09-05: rewriting chapter 8 as one block replaced a region by index and
// silently took MCP_LOOP with it. The spec still built, still passed the linter, still
// synced — and the ring beat the owner had just asked me to FIX was no longer in the
// video, so the fix would have shipped unused. Nothing downstream can notice a beat that
// was never authored; the only cheap moment to catch it is here, in the diff between one
// build and the next.
const census = {};
for (const s of scenes) census[s.type] = (census[s.type] ?? 0) + 1;
console.log('  ' + Object.entries(census).sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `${k}:${v}`).join(' '));
