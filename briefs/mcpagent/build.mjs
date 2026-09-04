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
  const n = "An AI that reads your logs, calls your API, and answers you. " +
            "Five files. Let's write them.";
  scenes.push(scene('HOOK', n, {
    headline: 'CODE AN AI AGENT',
    subtext: 'five files, and MCP holds them together',
    hookVariant: 'statement',
    headlineAtWord: at(n, 'AI'),
  }));
}

{
  const n =
    `Welcome to ${CH}. Today we build an AI agent — ` +
    "a program that is handed a question in plain English, works out which of your own " +
    "tools can answer it, runs that tool, and replies. " +
    "The thing that makes it possible is MCP, the Model Context Protocol. " +
    "So what does that actually take?";
  scenes.push(scene('TITLE_CARD', n, {
    title: 'Code an AI agent with MCP',
    subtitle: 'from an empty folder, every line typed',
  }));
}

// THE PLAN, DRAWN. Owner: *"You must at first have a component that properly animates. A
// top to bottom flow chart that has clear branches… like an architecture diagram."*
{
  const n =
    "Here is everything we are about to build, and it is five files. " +
    "At the top: your question, typed in plain English. " +
    "That goes into agent dot py, the loop you write yourself. " +
    "The loop asks a model which tool to use — " +
    "I am using Azure OpenAI here, and any API you like will do just as well. " +
    "The tools themselves live in server dot py, which is your MCP server. " +
    "It wraps tools dot py: three ordinary Python functions, nothing clever. " +
    "One of them reads service dot log, a log file your own app wrote. " +
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
      {from: 'tools', to: 'log', label: 'reads', atWord: at(n, 'reads')},
      {from: 'tools', to: 'api', label: 'calls', atWord: at(n, 'calls')},
    ],
  }}));
}

// ═══ CHAPTER 1 — the folder, and the tools we install ════════════════════════
scenes.push(chapter(
  "Nothing installed yet. Let's go from an empty folder to a running service.",
  1, 'From an empty folder', 'one command, and six libraries'));

{
  const n =
    "Here is the folder, and there is nothing in it but seven empty files. " +
    "uv init makes it a Python project — that is the pyproject file and the lock file. " +
    "Then one command brings in everything we need. " +
    "mcp is the official Python SDK for the Model Context Protocol, " +
    "written and maintained by the people who designed the protocol, " +
    "and we will look at their own page for it in a few minutes. " +
    "FastAPI and uvicorn give us a small web service to point the agent at. " +
    "httpx makes HTTP calls, openai talks to the model, " +
    "and python-dotenv reads our settings out of a file.";
  scenes.push(rec(n, 'an empty folder, and six libraries',
    'The project, and the packages the whole video is built on.',
    [A('look', 'seven empty files'),
     A('init', 'uv init', {wantAtWord: at(n, 'init'),
       callouts: [{text: 'now it is a project', mark: 'made', side: 'right', color: 'green',
                   atWord: at(n, 'pyproject')}]}),
     A('add', 'the libraries', {wantAtWord: at(n, 'command'),
       zooms: [{mark: 'mcp', atWord: at(n, 'SDK')}, {at: 'full', atWord: at(n, 'httpx')}],
       callouts: [{text: 'the official MCP SDK', mark: 'mcp', side: 'right', color: 'purple',
                   atWord: at(n, 'official')},
                  {text: 'a service to point at', mark: 'fastapi', side: 'right', color: 'blue',
                   atWord: at(n, 'FastAPI')}]})],
    {sourceNote: 'mcp — the official Python SDK: github.com/modelcontextprotocol/python-sdk'}));
}

// ═══ CHAPTER 2 — a service, and the log it writes ════════════════════════════
scenes.push(chapter(
  "First the thing an agent would investigate: a service, and the log it leaves behind.",
  2, 'A service to ask about', 'and the log it writes itself'));

{
  const n =
    "New file, api dot py. This is a tiny web service, and FastAPI makes one in a few lines. " +
    "We import it, we create the app, " +
    "and we keep three orders in a plain Python dictionary — " +
    "no database, because a database is not what this video is about. " +
    "Notice the third one: SO one thousand and three, lost in transit. " +
    "That is going to matter later.";
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
    "Now the part that matters most, and it is only six lines. " +
    "A middleware is a piece of code that runs on every single request, " +
    "before and after the real work. " +
    "We note the time, we let the request happen, we measure how long it took, " +
    "and we write one line to a file called service dot log. " +
    "That is it. That is where our log comes from — " +
    "the app writes it, request by request, exactly like yours does at work.";
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
    "And three routes. Slash orders lists them. " +
    "Slash orders slash an id returns one, or a four oh four if there is no such order. " +
    "And slash checkout is deliberately awful: " +
    "it sleeps for up to two and a half seconds, " +
    "and more than half the time it fails outright with a five hundred. " +
    "That is on purpose. We are manufacturing a real problem, " +
    "so that later the agent has something true to find.";
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
    "Start it. The ampersand at the end puts it in the background, " +
    "so the service keeps running and we get our prompt back. " +
    "Six seconds later, uvicorn says application startup complete — " +
    "the service is live on port eight thousand. " +
    "Now it needs some traffic, so we write something to make some. " +
    "Sixty requests, split between listing orders, fetching one, and checking out. " +
    "Run it, and every single one of those requests goes through our middleware " +
    "and lands as a line in service dot log. " +
    "Look at the last few: a checkout that took nearly two seconds, " +
    "and orders that came back in one millisecond. " +
    "That file is not a fixture. Our own app just wrote it.";
  scenes.push(rec(n, 'real traffic, and a real log',
    'The service running, and the log filling up.',
    [A('serve', 'into the background', {
       callouts: [{text: '& keeps it running', mark: null, side: 'top', color: 'green',
                   atWord: at(n, 'background')}]}),
     A('serveup', 'the service is live', {wantAtWord: at(n, 'seconds'),
       callouts: [{text: 'up on port 8000', mark: 'up', side: 'right', color: 'green',
                   atWord: at(n, 'thousand')}]}),
     A('opentraffic', 'something to call it with', {wantAtWord: at(n, 'traffic')}),
     A('traffic1', 'sixty requests', {wantAtWord: at(n, 'Sixty'),
       zooms: [{mark: 'loop', atWord: at(n, 'split')}]}),
     A('savetraffic', 'saved'),
     A('runtraffic', 'making real traffic', {wantAtWord: at(n, 'Run')}),
     A('seelog', 'the log it wrote', {wantAtWord: at(n, 'Look'),
       zooms: [{mark: 'line', atWord: at(n, 'checkout', 2)}],
       callouts: [{text: 'written by the app itself', mark: 'line', side: 'right',
                   color: 'green', atWord: at(n, 'fixture')}]})]));
}

// ═══ CHAPTER 3 — three ordinary functions ════════════════════════════════════
scenes.push(chapter(
  "Now three plain Python functions. No AI anywhere near them yet.",
  3, 'Three plain functions', 'the ones you probably already have'));

{
  const n =
    "New file, tools dot py, and there is nothing clever in it. " +
    "The first function counts errors. " +
    "It walks the log a line at a time, " +
    "splits each line into its five pieces — time, level, route, status, duration — " +
    "keeps the ones where the level is ERROR, " +
    "and tallies them up by route using a Counter. " +
    "That is ten lines of ordinary Python, and it is the kind of function " +
    "you have almost certainly written before.";
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
    "The second one measures speed. Same walk through the same file, " +
    "but this time we collect every duration per route, " +
    "average them, and sort so the slowest is first. " +
    "And the third one does not touch the log at all — " +
    "it calls the API we just built, over HTTP, and hands back what it says. " +
    "So one function reads a file and one calls a service. " +
    "Between them that is most of the tools you will ever write. " +
    "Save it, and run both, straight from the terminal. " +
    "They work. Checkout failed several times, and it is well over a second slower " +
    "than everything else. No AI has been involved so far, and none is needed yet.";
  scenes.push(rec(n, 'and they already work',
    'The other two functions, and their output.',
    [A('t2', 'measure the speed', {wantAtWord: at(n, 'second'),
       zooms: [{mark: 'avg', atWord: at(n, 'average')}]}),
     A('t3', 'and one that calls the API', {wantAtWord: at(n, 'third'),
       zooms: [{mark: 'httpx', atWord: at(n, 'HTTP')}],
       callouts: [{text: 'a file, or a service', mark: 'httpx', side: 'right', color: 'purple',
                   atWord: at(n, 'service', 2)}]}),
     A('savetools', 'saved', {wantAtWord: at(n, 'Save')}),
     A('runtools', 'they already work', {wantAtWord: at(n, 'run'),
       zooms: [{mark: 'failed', atWord: at(n, 'failed')}, {at: 'full', atWord: at(n, 'needed')}],
       callouts: [{text: 'over a second slower', mark: 'slow', side: 'right', color: 'orange',
                   atWord: at(n, 'slower')}]})]));
}


// ═══ CHAPTER 4 — the problem, and what MCP is ════════════════════════════════
scenes.push(chapter(
  "So here is the problem. Those functions work, and a model cannot touch them.",
  4, 'What MCP actually is', 'a standard way to hand over your tools'));

{
  const n =
    "A model is a text machine. It reads text and it writes text. " +
    "It cannot open your log file and it cannot call your API. " +
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
    ],
    edges: [
      {from: 'f', to: 'd', label: 'somebody writes', atWord: at(n, 'hand')},
      {from: 'd', to: 'm', label: 'in JSON', atWord: at(n, 'JSON')},
    ],
  }}));
}

// ═══ CHAPTER 5 — the server ══════════════════════════════════════════════════
scenes.push(chapter(
  "And this is the whole trick: you do not write that description. A decorator does.",
  5, 'Your first MCP server', 'the docstring becomes the schema'));

{
  const n =
    "New file, server dot py. One import, and one object. " +
    "A quick note on the import, because this changed recently: " +
    "in version one of the SDK this class was called FastMCP. " +
    "In version two it is MCPServer. " +
    "If you follow a tutorial written last year, that is the line that will break, " +
    "and the error message tells you exactly this. " +
    "Now watch what happens to our function. " +
    "It is the same function — we literally call the one in tools dot py — " +
    "but above it goes at mcp dot tool. " +
    "And that is it. That decorator reads the function's name, " +
    "reads its type hints, reads its docstring, " +
    "and builds the JSON description we just talked about, for you. " +
    "The docstring is not a comment any more. It is the tool's description, " +
    "and it is what the model reads to decide whether this is the tool it wants.";
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
    "That type hint is not decoration — " +
    "it becomes a required field in the description, " +
    "so the model knows it must supply an order id, and that it has to be text. " +
    "Then one more thing, and it is not a tool at all: a resource. " +
    "A tool is something the model can DO. A resource is something it can READ. " +
    "This one hands over the whole log at a name, log colon slash slash today. " +
    "And at the bottom, mcp dot run. Save it. " +
    "That is a complete MCP server, in about thirty lines.";
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

// ═══ CHAPTER 6 — the official pages ══════════════════════════════════════════
scenes.push(chapter(
  "Before we use it — this is somebody's work, and it is worth knowing whose.",
  6, 'Where this comes from', 'the protocol, and the SDK'));

{
  const n =
    "MCP is an open protocol, and this is its own site. " +
    "It is not an OpenAI thing or an Anthropic thing that you have to buy into — " +
    "it is a published specification, and anyone can implement it. " +
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
    "The address you are talking to, the key, and which model you want. " +
    "Mine is an Azure OpenAI deployment; yours can be any provider that speaks this API. " +
    "I have masked my key with asterisks, " +
    "because a key on screen is a key you have to go and change. " +
    "Then dot gitignore, with one line in it: dot env. " +
    "That is the whole protection. Git now walks past your settings file " +
    "as though it were not there. Thirty seconds of work, once, " +
    "and the difference between a key that is yours and a key that is public.";
  scenes.push(rec(n, 'settings in a file, never in the code',
    'The two files that keep a key out of a repository.',
    [A('openenv', 'the three settings'),
     A('typeenv', 'masked on purpose', {wantAtWord: at(n, 'address'),
       zooms: [{mark: 'url', atWord: at(n, 'address')}, {mark: 'masked', atWord: at(n, 'masked')}],
       callouts: [{text: 'yours goes here', mark: 'masked', side: 'right', color: 'red',
                   atWord: at(n, 'asterisks')}]}),
     A('saveenv', 'saved', {wantAtWord: at(n, 'change')}),
     A('openignore', 'and git never sees it', {wantAtWord: at(n, 'gitignore')}),
     A('typeignore', 'one line', {wantAtWord: at(n, 'line'),
       callouts: [{text: 'git walks past it now', mark: 'ignored', side: 'right', color: 'green',
                   atWord: at(n, 'walks')}]}),
     A('saveignore', 'saved', {wantAtWord: at(n, 'seconds')})]));
}

// ═══ CHAPTER 8 — the agent ═══════════════════════════════════════════════════
scenes.push(chapter(
  "Now the agent itself, and it is the only genuinely new idea in the video.",
  8, 'The loop', 'ask, choose, run, answer'));

{
  const n =
    "Last file, agent dot py. " +
    "The first block starts our server and connects to it. " +
    "Stdio server parameters means: run this program, " +
    "and talk to it through its standard input and output — " +
    "the same pipes you use when you pipe one command into another. " +
    "The server is just a program on your machine; there is no port and no network. " +
    "Then initialize, which is the handshake: " +
    "the two sides tell each other what they can do before anything else happens.";
  scenes.push(rec(n, 'start the server, connect to it',
    'The client half: launching the server and shaking hands.',
    [A('openagent', 'the last file'),
     A('ag1', 'connect over stdio', {wantAtWord: at(n, 'first'),
       zooms: [{mark: 'params', atWord: at(n, 'Stdio')},
               {mark: 'init', atWord: at(n, 'initialize')}],
       overlay: {kind: 'chain', atWord: at(n, 'handshake'),
                 steps: ['agent.py', 'starts server.py', 'stdin / stdout', 'ready']},
       callouts: [{text: 'no port, no network', mark: 'params', side: 'right', color: 'purple',
                   atWord: at(n, 'network')}]})]));
}

{
  const n =
    "Then we ask the server what it has. List tools comes back with all three, " +
    "each one carrying the description and the schema that the decorator built. " +
    "We reshape them into the format the OpenAI library expects — " +
    "and that is genuinely all this block does, it is a rename, not a translation. " +
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
    "That is the menu we just built. " +
    "We are not telling it which tool to use. We are telling it what exists. " +
    "What comes back is different from a normal reply: " +
    "instead of text, the model may hand us tool calls — " +
    "the name of a function it wants run, and the arguments it wants passed.";
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
    "So we run whatever it picked. For each tool call: " +
    "read the arguments it chose, print them so we can watch it think, " +
    "and call that tool through MCP. " +
    "Then we hand the result back, with role tool, " +
    "which is how you tell the model this is what your function returned. " +
    "And finally we ask it once more, with the results now in the conversation, " +
    "and this time it just answers. That is the loop. " +
    "Ask, choose, run, answer. Save it.";
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
    "Our checkout is misbehaving. What does the log say, and how bad is it? " +
    "Nobody wired that question to anything. " +
    "The model can see three tools. " +
    "It chose recent errors — and then it chose slowest routes as well, " +
    "because one question needed both, and it worked that out on its own. " +
    "And the answer: checkout has failed repeatedly, " +
    "it averages well over a second, and everything else comes back in one millisecond. " +
    "That is our log, read by our functions, chosen by the model, " +
    "and none of that plumbing was hand-written. " +
    "That is what MCP bought us.";
  scenes.push(rec(n, 'it picks the tools itself',
    'The finished agent, answering a question nobody scripted.',
    [A('runagent', 'asking in plain English', {
       zooms: [{mark: 'sees', atWord: at(n, 'three')},
               {mark: 'chose', atWord: at(n, 'chose')},
               {at: 'full', atWord: at(n, 'answer')}],
       overlay: {kind: 'tally', atWord: at(n, 'both'), value: 2, label: 'tools chosen, unprompted'},
       callouts: [{text: 'nobody told it which', mark: 'chose', side: 'right', color: 'green',
                   atWord: at(n, 'own')}]})]));
}

// ═══ CHAPTER 10 — where to go next ═══════════════════════════════════════════
scenes.push(chapter(
  "That is a working agent. Here is how it grows, and where to read next.",
  10, 'Where this goes', 'from one file to fifty tools'));

{
  const n =
    "Three things worth knowing before you build on this. " +
    "First: one server object. Every tool registers on the same mcp, " +
    "and they register the moment the file is imported. " +
    "Second: when server dot py gets long, split it. " +
    "Put tools in their own modules, import mcp from the server, decorate there, " +
    "and import those modules before you call run. " +
    "Six tools become fifty without the server file growing at all. " +
    "And third, the one that will cost you an evening: " +
    "if you run the server as a script and your modules import it by package name, " +
    "Python loads it twice, and every tool registers on the copy nobody is serving. " +
    "Your tools just vanish. One line fixes it, and now you know it exists.";
  scenes.push(scene('LIST_BUILD', n, {
    heading: 'Growing past one file',
    items: [
      {text: 'One mcp object — tools register at import', atWord: at(n, 'First')},
      {text: 'Split tools into modules as it grows', atWord: at(n, 'Second')},
      {text: 'Import those modules before mcp.run()', atWord: at(n, 'run')},
      {text: 'Beware the double import — tools vanish', atWord: at(n, 'twice')},
    ],
  }));
}

{
  const n =
    "So that is the whole thing: a service, a log, three ordinary functions, " +
    "a decorator that describes them, and a loop that lets a model choose. " +
    "The protocol is open and the SDK is on GitHub, both linked below — " +
    "go and read their getting started, because it is better than mine. " +
    "And there is a lot more in there: prompts, resources you can subscribe to, " +
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
      title: 'Code An AI Agent With MCP — Python, Under 20 Minutes',
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
    title: 'Code An AI Agent In Under 20 Mins',
    badge: 'Beginners · MCP',
    note: 'five files, every line typed',
    asset: 'si:python',
    logos: ['si:python', 'si:openai', 'si:fastapi', 'si:githubcopilot'],
  },
  scenes,
};

fs.writeFileSync('topics/code-an-ai-agent-with-mcp/long.json', JSON.stringify(spec, null, 2) + '\n');
const words = scenes.reduce((a, s) => a + s.narration.trim().split(/\s+/).length, 0);
console.log(`wrote topics/code-an-ai-agent-with-mcp/long.json — ${scenes.length} scenes, ` +
            `${words} words (~${Math.floor(words / 3.11 / 60)}m${String(Math.round((words / 3.11) % 60)).padStart(2, '0')}s)`);
