#!/usr/bin/env node
/**
 * build_long.mjs — the context-mode review, built from the measured findings.
 *
 * WHY A BUILDER RATHER THAN HAND-WRITTEN JSON. Every anchor is a 1-indexed WORD position inside
 * that scene's narration, and hand-counting them is how an element ends up landing on the wrong
 * word. Here the narration carries `^` immediately before the word an element should arrive on;
 * the builder strips the markers, counts, and fills the scene's declared anchor paths IN ORDER.
 * Edit a sentence and the anchors move with it.
 *
 * EVERY FIGURE SPOKEN COMES FROM briefs/contextmode/02-findings.md, which comes from Claude Code's
 * own transcripts. Nothing here is estimated. The pre-sync runtime estimate prints at the measured
 * read rate (3.05 words/s for Ava at +8%) — NOT the production bible's 150 wpm human figure, which
 * once under-estimated a cut by 18% and only showed up after the audio existed.
 */

import fs from 'node:fs';

const FPW = 9.84;          // frames per word at 30fps / 3.05 words-per-sec (measured, Ava +8%)
const PAD = 30;            // settle tail
const WPS = 3.05;

/** Split narration on `^` markers: returns the clean text and the 1-indexed word of each marker. */
function anchors(text) {
  const words = [];
  const marks = [];
  for (const raw of text.split(/\s+/).filter(Boolean)) {
    if (raw.startsWith('^')) { marks.push(words.length + 1); words.push(raw.slice(1)); }
    else words.push(raw);
  }
  return { narration: words.join(' '), marks, count: words.length };
}

/** Assign marks into the scene data at the declared dotted paths, in order. */
function apply(data, paths, marks, id) {
  if (paths.length > marks.length) {
    throw new Error(`${id}: ${paths.length} anchor path(s) declared but only ${marks.length} "^" marker(s) in the narration`);
  }
  paths.forEach((p, i) => {
    const parts = p.split('.');
    let node = data;
    for (const k of parts.slice(0, -1)) {
      const idx = /^\d+$/.test(k) ? Number(k) : k;
      node = node[idx];
      if (node === undefined) throw new Error(`${id}: anchor path "${p}" does not exist`);
    }
    node[parts.at(-1)] = marks[i];
  });
}

const S = [];
const OVER = [];
// >=5 distinct transition kinds across a long cut (linter). Assigned by position so adjacent
// beats never share one, rather than sprinkled by hand and drifting.
const TRANSITIONS = ['fade', 'push', 'wipe', 'dip', 'slide', 'zoom'];
/** scene(id, type, narrationWithMarkers, data, anchorPaths, extra) */
function scene(id, type, text, data, paths = [], extra = {}) {
  const { narration, marks, count } = anchors(text);
  const key = DATA_KEY[type];
  if (key) { data = { [key]: data }; paths = paths.map((p) => `${key}.${p}`); }
  apply(data, paths, marks, id);
  // Mirrors sceneCeiling() in scripts/lint-spec.mjs EXACTLY. A first draft of this guard used
  // 180*n+120 for every scene and flagged ten beats that the linter is perfectly happy with —
  // a guard stricter than the rule it mirrors just makes you trim things that did not need it.
  const anchorCount = new Set(paths).size;
  const ceiling = anchorCount < 2 ? 480 : Math.max(480, Math.min(180 * anchorCount + 120, 2100));
  const need = Math.round(count * FPW + PAD);
  if (need > ceiling) {
    OVER.push(`${id} (${type}): ${count} words needs ${need}f but ${anchorCount} anchor(s) earn ${ceiling}f — SPLIT the beat or anchor more elements. Never trim the explanation.`);
  }
  S.push({
    id, type,
    transition: extra.transition || TRANSITIONS[S.length % TRANSITIONS.length],
    background: extra.background || 'zoneA',
    narration,
    data,
    durationFrames: Math.round(count * FPW + PAD),
    ...(extra.layout ? { layout: extra.layout } : {}),
  });
}

const rec = (ref, label, more = {}) => ({ ref, label, ...more });

// scene.data.<key> — read from scripts/lib/manifest.mjs, not from memory.
const DATA_KEY = {
  CONTEXT_METER: 'context', WATERFALL: 'waterfallChart', DIAGRAM: 'diagram',
  SANDBOX_BOX: 'sandbox', RETRIEVAL_RANK: 'retrieval', SPEC_COMPARE: 'compare',
  TEST_MATRIX: 'testMatrix', TRADEOFF_SCALE: 'tradeoff', LOG_STREAM: 'logs',
  BOX_PLOT: 'boxPlot',
};

// ─── ACT 1 · the worry, the answer, the ground ──────────────────────────────

scene('s01', 'HOOK',
  '^Context-mode promises to save ninety-eight percent of your ^context ^window. Does it?',
  { headline: 'context-mode: 98%?', subtext: 'It promises 98%. I measured 14%.', heroAsset: 'lucide:gauge', hookVariant: 'ask' },
  ['atWord', 'heroAtWord', 'headlineAtWord'], { transition: 'dip' });

scene('s02', 'RECORDED_STEP',
  'That is the whole video in one ^table. The same job, done twice, on a real repository — and every number here came out of Claude Code\'s own books, not out of the plugin\'s.',
  { recordedStep: { clips: [rec('rec:ctxmode-proof#table', 'the measured table', { focus: true })] } },
  ['recordedStep.clips.0.wantAtWord']);

scene('s03', 'TITLE_CARD',
  "Welcome back. Today we install context-mode, point the plugin at a real repository, and measure what happens to your ^bill — properly, with numbers you can check yourself.",
  { title: 'Context-mode, measured', subtitle: 'Install it, measure the bill, decide' },
  ['atWord']);

scene('s04', 'CONTEXT_METER',
  "First, the thing being saved. A model reads everything through one fixed ^window — two hundred thousand tokens for Claude.",
  { headline: 'One window, shared by everything', windowTokens: 200000,
    segments: [ { label: 'system', tokens: 14000, kind: 'system' }, { label: 'tools', tokens: 18000, kind: 'tools' },
                { label: 'history', tokens: 38000, kind: 'history' }, { label: 'free', tokens: 130000, kind: 'free' } ],
    verdict: 'Nothing leaves until the session ends' },
  ['atWord']);

scene('s05', 'WATERFALL',
  "Everything shares it. Your ^system prompt takes a slice. Every ^tool definition takes a slice. Everything said so far takes a slice. And what is ^left is the room the model has to actually think in. A token, by the way, is roughly ^three quarters of a word, so that window is smaller than it sounds.",
  { unit: 'tok',
    bars: [ { label: 'system prompt', value: 14000 }, { label: 'tool definitions', value: 18000 },
            { label: 'the conversation', value: 38000 }, { label: 'room to think', value: 130000, isTotal: true } ] },
  ['bars.0.atWord', 'bars.1.atWord', 'bars.3.atWord', 'bars.2.atWord'], { transition: 'push' });

scene('s06', 'CONTEXT_METER',
  "Here's what costs you money. Your agent reads one big file, and the whole thing ^lands in that window.",
  { headline: 'One file read, and it stays', windowTokens: 200000,
    segments: [ { label: 'system', tokens: 14000, kind: 'system' }, { label: 'tools', tokens: 18000, kind: 'tools' },
                { label: 'that one log', tokens: 96000, kind: 'history' }, { label: 'free', tokens: 72000, kind: 'free' } ],
    verdict: 'Re-sent on every turn that follows' },
  ['atWord']);

scene('s07', 'BAR_COMPARE',
  "And the file isn't read once and dropped. Those same tokens are ^re-sent on every turn that follows, because the model has no memory apart from this window. Which means a careless read isn't a one-off charge — the read is ^rent, and you go on paying it for the rest of the session.",
  { bars: [ { label: 'read once', sub: 'you think', value: 96, display: '96K tok' },
            { label: 'over 40 turns', sub: 'you actually pay', value: 3840, display: '3.8M tok', color: 'orange' } ],
    source: 'the same tokens, re-sent every turn' },
  ['bars.0.atWord', 'bars.1.atWord']);

scene('s08', 'QUOTE_SPOTLIGHT',
  "A tool that keeps those bytes out of your context window starts to sound worth having. ^Here is what context-mode claims to save you, written on the project's own front page.",
  { quote: 'Save 98% of your context window.', person: { name: 'context-mode', role: 'the project README' },
    source: 'github.com/mksglu/context-mode — Elastic-2.0' },
  ['atWord']);

// ─── ACT 2 · what it is, and what it charges ────────────────────────────────

scene('s09', 'DIAGRAM',
  "What is it, then? Four things wearing one name. An ^MCP server — Model Context Protocol, the standard way a tool plugs into an agent. A set of ^hooks that fire around your session. A ^sandbox that runs code in a separate process. And a ^SQLite index — full-text search — which holds anything too big to keep in the conversation itself.",
  { layout: 'hub',
    nodes: [ { id: 'a', label: 'your agent', asset: 'lucide:bot' },
             { id: 'm', label: 'MCP server', sub: 'six tools', asset: 'lucide:plug' },
             { id: 'h', label: 'hooks', sub: 'wrap it', asset: 'lucide:anchor' },
             { id: 's', label: 'sandbox', sub: 'own process', asset: 'lucide:box' },
             { id: 'd', label: 'SQLite index', sub: 'text search', asset: 'lucide:database' } ],
    edges: [ { from: 'a', to: 'm' }, { from: 'a', to: 'h' }, { from: 'm', to: 's' }, { from: 'm', to: 'd' } ] },
  ['nodes.1.atWord', 'nodes.2.atWord', 'nodes.3.atWord', 'nodes.4.atWord']);

scene('s10', 'SANDBOX_BOX',
  "Underneath, the idea is a good one. Your agent sends a little code into the ^sandbox, and only what that code printed is allowed back out.",
  { label: 'the sandbox', allowed: ['your code', 'what it printed'], blocked: ['the 535 KB log', 'raw page text'] },
  ['atWord']);

scene('s11', 'RETRIEVAL_RANK',
  "And when something is too big even for that — a whole access log, say — context-mode cuts it into ^chunks and files them in a search index. Later, a query pulls back only the chunks that ^match, scored by a formula called BM25 — which is just a way of ranking how well a passage answers a search. The ^rest never enters the conversation at all, which is the entire point of doing it this way.",
  { chunks: [ { label: 'access log · lines 1–500', scoreA: 0.31, scoreFinal: 0.22 },
              { label: 'access log · the 500 errors', scoreA: 0.72, scoreFinal: 0.94 },
              { label: 'access log · lines 4k–4.5k', scoreA: 0.28, scoreFinal: 0.18 } ] },
  ['atWord', 'rerankAtWord', 'fuseAtWord']);

scene('s12', 'RECORDED_STEP',
  "Installing ^it takes two commands, and you can run them straight from your terminal, exactly as you see here. One adds the marketplace — which is simply a list of plugins that Claude Code already knows about, the way a package manager knows where to look for things. The ^second installs this particular plugin from that ^list, and wires up its tools and its hooks for you automatically.",
  { recordedStep: { clips: [ rec('rec:ctxmode-install#market', 'add the marketplace', { focus: true }),
             rec('rec:ctxmode-install#install', 'install the plugin', { focus: true }) ],
    sourceNote: 'context-mode · github.com/mksglu/context-mode' } },
  ['recordedStep.clips.0.wantAtWord', 'recordedStep.clips.1.wantAtWord', 'recordedStep.atWord']);

scene('s13', 'RECORDED_STEP',
  "No config file, no API key, nothing else to set up. But before the plugin saves you anything, the plugin costs you something — and helpfully, Claude Code will tell you exactly how much. Ask for the ^details, and Claude Code reports nine hundred and seventy tokens, ^always on, added to every single session you start from now on.",
  { recordedStep: { clips: [ rec('rec:ctxmode-install#cost', "Claude Code's own estimate",
      { focus: true, callouts: [{ text: '~970 tokens, added to every session', mark: 'alwayson' }] }) ] } },
  ['recordedStep.clips.0.wantAtWord']);

scene('s14', 'WATERFALL',
  "Nine hundred and seventy's honest, but incomplete, and the gap matters. That figure counts the plugin's ^skills. It doesn't count the eleven ^tool definitions the server registers, and it doesn't count the ^routing instructions the hooks push in at startup, because neither of those exists until the session is running. Measured on a live session, the ^real per-turn cost of switching it on is about three and a half thousand tokens, and you pay that again on every single turn.",
  { unit: 'tok',
    bars: [ { label: 'skills', value: 970 }, { label: 'tool definitions', value: 1800 },
            { label: 'routing text', value: 630 }, { label: 'real, per turn', value: 3400, isTotal: true } ] },
  ['bars.0.atWord', 'bars.1.atWord', 'bars.2.atWord', 'bars.3.atWord'], { transition: 'push' });

// ─── ACT 3 · measuring it honestly ──────────────────────────────────────────

scene('s15', 'SPEC_COMPARE',
  "How do you ^check a saving like this? Context-mode ships its own ^statistics command, and I didn't take a single number from that command — because a tool reporting on itself counts only the bytes ^diverted, and can't see what its own tool definitions cost you. Claude Code, though, writes a ^transcript of every session, and every turn in it records what that turn was billed.",
  { headline: 'Two ways to count',
    a: { name: 'its own stats' }, b: { name: 'the transcript' },
    rows: [ { label: 'who wrote it', a: 'the plugin', b: 'Claude Code', winner: 'b' },
            { label: 'counts diverted bytes', a: 'yes', b: 'yes', winner: 'tie' },
            { label: 'sees its own cost', a: 'no', b: 'yes', winner: 'b' } ] },
  ['atWord', 'rows.0.atWord', 'rows.1.atWord', 'rows.2.atWord']);

scene('s16', 'WATERFALL',
  "Every turn records four numbers. ^Fresh tokens. Tokens ^written to the cache. Tokens served straight ^from that cache. Add those three together and you get the exact size of the prompt that went ^out, which is the honest measure of how full that window really was at that moment.",
  { unit: 'tok',
    bars: [ { label: 'fresh', value: 18 }, { label: 'written to cache', value: 20294 },
            { label: 'read from cache', value: 190064 }, { label: 'the prompt sent', value: 210376, isTotal: true } ] },
  ['bars.0.atWord', 'bars.1.atWord', 'bars.2.atWord', 'bars.3.atWord']);

scene('s16b', 'BAR_COMPARE',
  "One catch worth knowing, because it explains the rest of this video. Those tokens are not all billed the same. Most of the window on any given turn is a ^cache read, charged at a small ^fraction of a fresh one, which changes the arithmetic completely.",
  { bars: [ { label: 'fresh tokens', sub: 'full price', value: 20312, display: '20.3K' },
            { label: 'read from cache', sub: 'a fraction', value: 190064, display: '190K', color: 'blue' } ],
    source: 'one measured turn — most of the window is a cache read' },
  ['bars.1.atWord', 'bars.0.atWord']);

scene('s16c', 'RECAP',
  "The bytes you keep out of the ^window and the money you actually ^save are related, but they're not the same number. That's why I report ^both, and why the cost column in this video is the one I trust least.",
  { heading: 'Two different questions',
    points: [ { text: 'Bytes kept out: counted, steady' },
              { text: 'Money saved: priced, and noisy' },
              { text: 'Cache warmth moves cost 2-3x on its own' } ] },
  ['points.0.atWord', 'points.1.atWord', 'points.2.atWord']);

scene('s17', 'TEST_MATRIX',
  "Here's the test. One real open-source repository, two different jobs — a code task and a log task — run against both Opus and Haiku, and every box run ^three times, because one agent run proves nothing.",
  { rows: ['code task', 'log task'], cols: ['Opus', 'Haiku'],
    cells: [ { r: 0, c: 0, status: 'pass' }, { r: 0, c: 1, status: 'pass' },
             { r: 1, c: 0, status: 'pass' }, { r: 1, c: 1, status: 'pass' } ],
    headline: 'Twelve cells, three runs each' },
  ['atWord']);

scene('s18', 'RECORDED_STEP',
  "Here is the job with the plugin switched ^off. Same question, same file, nothing installed at all. Now watch carefully what the agent reaches for, because this is the whole argument of the video. Notice that the agent doesn't open the file at all. Instead, the agent writes one small ^command, runs the command, and reads the handful of lines that come back — so the log never enters the ^conversation in the first place.",
  { recordedStep: { clips: [ rec('rec:ctxmode-before#run', 'no plugin at all',
      { focus: true, callouts: [{ text: 'it writes a command instead of reading the file', mark: null }] }) ] } },
  ['recordedStep.clips.0.wantAtWord']);

scene('s19', 'RECORDED_STEP',
  "And here is the ^answer the agent lands on. Fifty failed requests, from three addresses, with a count for each one. Exactly right — and the half-megabyte of log behind that answer never went anywhere near the model's memory. No plugin was involved at any point.",
  { recordedStep: { clips: [ rec('rec:ctxmode-before#answer', 'and the answer', { focus: true }) ] } },
  ['recordedStep.clips.0.wantAtWord']);

scene('s20', 'RECORDED_STEP',
  "Now the same question with the plugin ^on. Watch the tool list this time, because one of context-mode's own ^tools fires here instead of Bash. Out goes the file to the ^sandbox, the counting happens out there away from the conversation, and only a short summary ever comes back across — so that's the mechanism doing exactly what it says on the tin.",
  { recordedStep: { clips: [ rec('rec:ctxmode-after#run', 'with the plugin on',
      { focus: true, callouts: [{ text: 'a context-mode tool fires — not Bash', mark: null }] }) ] } },
  ['recordedStep.clips.0.wantAtWord']);

scene('s21', 'BAR_COMPARE',
  "On the code-reading job, with the big model, three runs each — it does the job. Without the plugin, ^forty-three kilobytes of raw material ended up in the window. With it, ^nineteen. Less than half the material, for exactly the same piece of work — which means the window stays emptier for longer.",
  { bars: [ { label: 'plugin off', sub: 'three runs', value: 43.1, display: '43.1 KB' },
            { label: 'plugin on', sub: 'three runs', value: 19.2, display: '19.2 KB', color: 'green' } ],
    source: "measured from Claude Code's own session transcripts" },
  ['bars.0.atWord', 'bars.1.atWord']);

scene('s21b', 'RECAP',
  "Peak usage dropped about a ^fifth, because the agent simply never pulled the whole file in. And the answers scored ^identically — twelve out of twelve on a checklist I wrote from the source before either run started. Nothing was bought by making the model ^worse, which is the part I most wanted to check.",
  { heading: 'The code job, both arms',
    points: [ { text: 'Peak context: 37.8K to 30.6K' }, { text: 'Rubric: 12/12 either way' },
              { text: 'No accuracy traded for the saving' } ] },
  ['points.0.atWord', 'points.1.atWord', 'points.2.atWord']);

// ─── ACT 4 · where it does not pay ──────────────────────────────────────────

scene('s22', 'SANDBOX_BOX',
  "But here's what surprised me. On the log job, the plugin ^lost — and the reason was already on screen. Claude Code already has a tool that runs a command and hands back only what it printed. It's called Bash.",
  { label: 'Bash, already', allowed: ['one line of output'], blocked: ['the 535 KB log'] },
  ['atWord'], { transition: 'push' });

scene('s23', 'BAR_COMPARE',
  "With the plugin off, that five-hundred-kilobyte log put ^zero point eight kilobytes into the conversation. With the plugin on, ^zero point six. Two tenths of a kilobyte saved — and on that job it's twenty-eight percent more expensive, because the rent never stopped being charged.",
  { bars: [ { label: 'plugin off', sub: 'of a 535 KB log', value: 0.8, display: '0.8 KB' },
            { label: 'plugin on', sub: 'of a 535 KB log', value: 0.6, display: '0.6 KB' } ],
    source: 'log task, Opus 5, three runs per arm' },
  ['bars.0.atWord', 'bars.1.atWord']);

scene('s24', 'TRADEOFF_SCALE',
  "Which gives you a rule you can use ^tonight: context-mode has to keep more out of the window than the rent context-mode charges for being there.",
  { headline: 'It has to beat its own [rent]',
    left: { label: 'rent', sub: '~3.4K every turn', asset: 'lucide:receipt' },
    right: { label: 'bytes kept out', sub: 'grows with work', asset: 'lucide:shield' },
    lean: 0.35 },
  ['atWord']);

scene('s25', 'RECORDED_STEP',
  "One ^more thing, and almost nobody checks this — which is a shame, because this is the part that actually matters. A saving isn't the same thing as a right answer. Read that run again, the one with the plugin switched on, slowly. Fifty-one failed requests, the model reports, coming from four different ^addresses, and sounds completely confident.",
  { recordedStep: { clips: [ rec('rec:ctxmode-after#tail', 'read it again, carefully',
      { focus: true }) ] } },
  ['recordedStep.clips.0.wantAtWord']);

scene('s26', 'LOG_STREAM',
  "Fifty, from three, is the true answer, as the other run worked out a minute ago. The access log has a trap in it, deliberately. Look at the third line: a request to cart ^succeeded — status two hundred — and happened to return exactly five hundred bytes. Every other line here is a genuine checkout failure.",
  { lines: [ { level: 'error', tag: '10.0.3.17', text: '"GET /api/v1/checkout" 500 4821' },
             { level: 'error', tag: '10.0.6.29', text: '"GET /api/v1/checkout" 500 1130' },
             { level: 'info',  tag: '10.0.7.2',  text: '"GET /api/v1/cart" 200 500' },
             { level: 'error', tag: '10.0.1.4',  text: '"GET /api/v1/checkout" 500 7742' } ],
    highlight: 2, rate: '5,000 lines' },
  ['atWord']);

scene('s27', 'SPEC_COMPARE',
  "A plain text search for five hundred finds that line and counts the line as a failure. What happened is that the small model read the text instead of the column — with the plugin on, and with the plugin off. Context-mode didn't ^cause the mistake, and didn't ^prevent the mistake ^either. If you take one thing from this video, take this: cheaper is not the same as righter, and no plugin does that part for you.",
  { headline: 'Cheaper is not righter', source: 'log task, Haiku 4.5, three runs per arm',
    a: { name: 'plugin off' }, b: { name: 'plugin on' },
    rows: [ { label: 'bytes into context', a: '4.1 KB', b: '1.0 KB', winner: 'b' },
            { label: 'cost', a: 'baseline', b: '−20%', winner: 'b' },
            { label: 'fell for the trap', a: 'yes', b: 'yes', winner: 'tie' } ] },
  ['rows.0.atWord', 'rows.1.atWord', 'rows.2.atWord']);

scene('s28', 'SPEC_COMPARE',
  "And this is the finding I keep thinking about. On the big model, across six runs with the plugin installed, its ^tools were called zero times. Not once. Those runs were still cheaper — because the hooks push in a ^paragraph telling the model that every byte a tool returns costs it ^later. Having read that, the model used its ordinary tools more carefully. The prompt did the work here — not the sandbox.",
  { headline: 'Which half did the work?',
    a: { name: 'its tools' }, b: { name: 'its prompt' },
    rows: [ { label: 'times called', a: '0', b: 'every turn', winner: 'b' },
            { label: 'cut bytes on Opus', a: 'no', b: 'yes', winner: 'b' },
            { label: 'costs per turn', a: 'yes', b: 'a paragraph', winner: 'b' } ] },
  ['rows.0.atWord', 'rows.1.atWord', 'rows.2.atWord']);

scene('s29', 'BOX_PLOT',
  "I ^tested that on its own — the same argument written into a plain instructions file, no plugin and no rent. It does help. But look at the ^spread: the plugin lands in the same narrow band every run, while the free ^paragraph swings wildly from one run to the next, which is the whole problem with relying on it.",
  { boxes: [ { label: 'plugin', min: 48.4, q1: 49.5, median: 52.7, q3: 56.0, max: 60.7 },
             { label: 'paragraph', min: 38.4, q1: 55.0, median: 82.1, q3: 104.0, max: 120.0 } ],
    unit: 'KB' },
  ['atWord', 'boxes.0.atWord', 'boxes.1.atWord']);

scene('s29b', 'TRADEOFF_SCALE',
  "On one job the paragraph came out ^worse than doing nothing at all. Copy the wording by all means, because the wording is free and the wording helps. Just don't treat a paragraph as a replacement for something that behaves the same way every single run.",
  { headline: 'Copy the wording, but it is not a [replacement]',
    left: { label: 'a free paragraph', sub: 'swings run to run', asset: 'lucide:file-text' },
    right: { label: 'the plugin', sub: 'same band, always', asset: 'lucide:package' },
    lean: 0.3 },
  ['atWord']);

// ─── ACT 5 · the verdict ────────────────────────────────────────────────────

scene('s30', 'TRADEOFF_SCALE',
  "So, should you install context-mode? If your sessions are already ^tidy, the plugin'll cost more than it saves. But if you're on a cheaper model, or your work drags in big files and chatty tool output, context-mode is a clear win.",
  { headline: 'Worth it when the session is [heavy]',
    left: { label: 'tidy session', sub: 'rent for nothing', asset: 'lucide:feather' },
    right: { label: 'heavy session', sub: 'a quarter cheaper', asset: 'lucide:weight' },
    lean: 0.5 },
  ['atWord']);

scene('s31', 'SPEC_COMPARE',
  "Two honest gaps before you go. I never tested session ^continuity — the part that rebuilds your state after the conversation compacts — because these jobs were short and none of them ever ^compacted. And I used no external servers that dump huge ^payloads, which is the exact case their own benchmark is built on.",
  { headline: 'What this video did not test',
    a: { name: 'tested' }, b: { name: 'not tested' },
    rows: [ { label: 'sandbox + index', a: 'yes', b: '—', winner: 'a' },
            { label: 'per-turn cost', a: 'yes', b: '—', winner: 'a' },
            { label: 'session continuity', a: '—', b: 'not tested', winner: 'b' },
            { label: 'raw MCP payloads', a: '—', b: 'not tested', winner: 'b' } ] },
  ['rows.2.atWord', 'rows.0.atWord', 'rows.3.atWord']);

scene('s31b', 'CONTEXT_METER',
  "Their ninety-eight percent isn't a ^lie. It's measuring a different case — one full of raw payloads — and your case probably isn't that one.",
  { headline: 'Their number, and yours', windowTokens: 200000,
    segments: [ { label: 'their case', tokens: 120000, kind: 'history' }, { label: 'raw payloads', tokens: 44000, kind: 'tools' },
                { label: 'your case', tokens: 36000, kind: 'free' } ],
    verdict: 'Both numbers can be true at once' },
  ['atWord']);

scene('s32', 'RECAP',
  "Three numbers worth keeping. It costs about ^three and a half thousand tokens a turn whether you use it or not. On heavy work it cut raw material by ^more than half, and came out around fourteen percent cheaper. On light work it charged ^twenty-eight percent more, and gave nothing back for it.",
  { heading: 'What twelve measured runs said',
    points: [ { text: '~3.4K tokens per turn, always' },
              { text: 'Heavy work: 2.2× less, ~14% cheaper' },
              { text: 'Light work: 28% more expensive' } ] },
  ['points.0.atWord', 'points.1.atWord', 'points.2.atWord']);

scene('s33', 'QUOTE_SPOTLIGHT',
  "Context-mode is by ^Mert Koseoglu, it's on GitHub under the Elastic licence, and the link is below. Go and read it — it's a genuinely clever piece of engineering whichever way the numbers fall for you.",
  { quote: 'Measure it on your own work before you commit to it.',
    person: { name: 'context-mode', role: 'by Mert Koseoglu' },
    source: 'github.com/mksglu/context-mode — Elastic-2.0' },
  ['atWord']);

scene('s34', 'OUTRO_CTA',
  "And if this saved you running the experiment yourself, ^subscribe — then go and measure it on your own work.",
  { message: 'Measure it on your own work', sub: 'THE NBX STUDIO' },
  ['atWord']);

// ─── emit ───────────────────────────────────────────────────────────────────

const spec = {
  meta: {
    topic: 'Context-mode, measured', format: 'long', fps: 30,
    subject: 'context-mode',
    audioPrefix: 'context-mode-measured_long',
    screenplay: 'documentary',
    topicAxes: ['economic-pain', 'entity-novelty'],
    onePayoff: 'Whether context-mode actually lowers what you pay, measured rather than claimed.',
    openLoop: 'It promises to save 98% of your context window. What does it actually save?',
    seo: {
      title: 'Context-Mode Promises 98%. I Measured 14%.',
      altTitles: ['I Measured Context-Mode: Does It Really Cut Your AI Bill?',
                  'The 98% Context Saving, Measured On Real Work'],
      hook: 'Does context-mode actually cut what you pay for Claude Code? I ran twelve measured tests to find out.',
      breakdown: 'what context-mode does, what it costs every turn, and the one rule that tells you whether it will pay for you',
      queries: ['does context-mode save tokens', 'context mode claude code review',
                'how to reduce claude code context usage', 'claude code token cost plugin',
                'context mode mcp server worth it', 'reduce ai coding costs',
                'claude code context window full', 'mcp context window optimization',
                'context mode vs claude md', 'how to measure claude code token usage'],
      hashtags: ['#claudecode', '#ai', '#mcp', '#developertools'],
      tags: ['context-mode', 'claude code', 'mcp', 'context window', 'ai coding', 'token cost',
             'anthropic', 'claude', 'ai agents', 'developer tools', 'code review', 'benchmark',
             'ai cost optimization', 'sqlite fts5', 'bm25', 'claude code plugin', 'llm context',
             'prompt caching', 'agentic coding', 'open source'],
      sources: ['context-mode — github.com/mksglu/context-mode (Elastic-2.0), by Mert Koseoglu',
                'archify — github.com/tt-a1i/archify (MIT), the repository used as the test bed'],
      pinned: 'What would you want measured next — session continuity, or a Playwright-heavy session?',
    },
  },
  brand: { theme: 'moderndark', themeLight: 'daylight', design: 'moderndark',
           background: 'aurora', channel: 'THE NBX STUDIO', logo: 'img:channel_logo.png' },
  thumbnail: { title: 'IT PROMISES 98%', badge: 'context-mode', note: 'I measured 14%',
               asset: 'lucide:gauge' },
  scenes: S,
};

fs.writeFileSync('topics/context-mode-measured/long.json', JSON.stringify(spec, null, 2) + '\n');

if (OVER.length) {
  console.error('\nSCENE CEILING — earned by motion (180 x anchors + 120):');
  for (const o of OVER) console.error('  ' + o);
  console.error('');
}
const words = S.reduce((a, s) => a + s.narration.split(/\s+/).length, 0);
const frames = S.reduce((a, s) => a + s.durationFrames, 0);
console.log(`wrote topics/context-mode-measured/long.json`);
console.log(`  ${S.length} scenes · ${words} words · ${frames} frames`);
console.log(`  pre-sync estimate ~${Math.floor(words / WPS / 60)}m${String(Math.round(words / WPS % 60)).padStart(2, '0')}s at a MEASURED ${WPS} words/s (Ava +8%)`);
