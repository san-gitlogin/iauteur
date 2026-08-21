#!/usr/bin/env node
// Concatenates the rendered DSA Dojo episodes into ONE "full course" upload and
// authors its chapter list. The series ships as 12 separate videos AND as this
// single cut (owner's packaging choice: *"Both: series + a compiled cut"*).
//
// Chapters come from the SPECS, not from the mp4s: each episode contributes one
// top-level chapter at its cumulative start, plus its own authored seo.chapters
// pushed down as sub-beats. Offsets are summed from durationFrames, so a chapter
// stamp can never drift from the video the way a re-measured one would.
//
// Stamps are HH:MM:SS throughout — a 75-minute cut crosses the hour mark, and
// YouTube does not parse a minute field past 59 (see gen-upload-kit.mjs).
// Usage: node scripts/build-course-cut.mjs
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {channelName} from './lib/env.mjs';

// Two courses share this compiler now, so the running order and the output folder
// are named per course rather than hard-coded.
const TAGS_DSA = [
  'dsa', 'dsa patterns', 'data structures and algorithms', 'coding interview',
  'leetcode', 'leetcode patterns', 'mangos', 'faang interview', 'maang',
  'meta interview', 'google interview', 'nvidia interview', 'openai interview',
  'anthropic interview', 'spacex interview', 'software engineering interview',
  'two pointers', 'sliding window', 'binary search', 'hashmap', 'stack',
  'bfs', 'dfs', 'backtracking', 'dynamic programming', 'greedy',
  'fast and slow pointers', 'algorithms', 'python', 'interview preparation',
  'coding interview preparation', 'tech interview', 'the nbx studio',
];
const TAGS_MCP = [
  'mcp', 'model context protocol', 'claude', 'anthropic', 'mcp server', 'mcp client',
  'mcp tutorial', 'python', 'fastmcp', 'mcpserver', 'elicitation', 'mcp sampling',
  'mcp roots', 'mcp transport', 'streamable http', 'stdio', 'json rpc', 'ai tools',
  'llm tools', 'agentic', 'tool use', 'ai agents', 'anthropic api', 'claude api',
  'mcp deprecated', 'mcp 2026', 'ai engineering', 'the nbx studio',
];

const COURSES = {
  dsa: {
    out: 'topics/dsa-dojo-course',
    order: [
      'dsa-dojo-00-framework', 'dsa-dojo-01-two-pointers', 'dsa-dojo-02-sliding-window',
      'dsa-dojo-03-binary-search', 'dsa-dojo-04-hashmap', 'dsa-dojo-05-stack',
      'dsa-dojo-06-bfs', 'dsa-dojo-07-dfs', 'dsa-dojo-08-dp',
      'dsa-dojo-09-greedy', 'dsa-dojo-10-fast-slow', 'dsa-dojo-11-problems',
    ],
    numbered: (i) => i >= 1 && i <= 10,
    label: (i, name) => `Pattern ${String(i).padStart(2, '0')} — ${name}`,
    title: 'The Complete DSA Pattern for cracking MANGOS - 10 Patterns That Cover Almost Every Interview Qn',
    alts: [
      'Crack MANGOS: 10 DSA Patterns That Cover Almost Every Interview Question',
      'I Traced All 10 DSA Patterns Line By Line So You Never Memorise Another Solution',
      'The Only DSA Course You Need Before Meta, Anthropic, NVIDIA, Google, OpenAI or SpaceX',
    ],
    lede: 'Most people fail coding interviews because they memorised two hundred solutions instead of ten patterns.',
    sub: 'MANGOS \u2014 Meta, Anthropic, NVIDIA, Google, OpenAI, SpaceX.',
    body: (ch) => `In this video, ${ch} traces all ten interview patterns line by line — the signal words that give each one away, the code running on real data one step at a time, and the four problems to go and do after each. This is the whole course in one sitting.`,
    sources: [
      'Pattern set and problem lists: https://github.com/san-gitlogin/dsa-pattern-dojo',
      'Interactive dojo: https://san-gitlogin.github.io/dsa-pattern-dojo/',
    ],
    next: (ch) => `Each pattern is also a standalone episode on ${ch} — start with whichever one you keep failing.`,
    pinned: 'Do not watch this end to end and call it studying. Watch one pattern, then go and do its four problems before the next. The patterns only stick once your own code has failed at least once.',
    queries: ['dsa patterns for coding interviews','complete dsa course for faang','leetcode patterns explained',
      'how to prepare for maang interviews','two pointers sliding window binary search explained',
      'dynamic programming for interviews','bfs dfs graph patterns interview','coding interview preparation full course'],
    hashtags: '#dsa #leetcode #codinginterview #faang #mangos #algorithms #datastructures #thenbxstudio',
    tags: TAGS_DSA,
  },
  mcp: {
    out: 'topics/mcp-course',
    order: [
      'mcp-00-how-claude-works', 'mcp-01-what-is-mcp', 'mcp-02-three-primitives',
      'mcp-03-build-a-server', 'mcp-04-client-and-loop', 'mcp-05-resources-prompts',
      'mcp-06-sampling', 'mcp-07-roots', 'mcp-08-notifications',
      'mcp-09-transport', 'mcp-10-elicitation', 'mcp-11-everything',
    ],
    numbered: () => true,
    label: (i, name) => `Chapter ${String(i + 1).padStart(2, '0')} — ${name}`,
    title: 'Learn MCP Properly — The Complete Model Context Protocol Course (2026 Spec)',
    alts: [
      'MCP From Scratch: Every Primitive, Traced Line By Line',
      'The MCP Course That Tells You Which Features Are Already Deprecated',
      'Model Context Protocol, Explained Properly — Tools, Resources, Prompts, Elicitation',
    ],
    lede: 'Most MCP tutorials online teach an SDK that no longer exists and three features the spec has already deprecated.',
    sub: 'Checked against specification 2026-07-28 and the current Python SDK.',
    body: (ch) => `In this course, ${ch} builds up the Model Context Protocol from a single Claude API call — the three primitives and who controls each, a server and client written line by line, the agentic loop, elicitation in both modes, and an honest account of what the specification has deprecated and what replaces it.`,
    sources: [
      'MCP specification 2026-07-28: https://modelcontextprotocol.io/specification/latest',
      'Deprecated features registry: https://modelcontextprotocol.io/specification/2026-07-28/deprecated',
      'Python SDK: https://github.com/modelcontextprotocol/python-sdk',
      'Course inspiration: https://github.com/san-gitlogin/learn-mcp',
    ],
    next: (ch) => `Every chapter is also a standalone video on ${ch} — start wherever you are stuck.`,
    pinned: 'Heads up: Sampling, Roots and Logging are all DEPRECATED as of spec 2026-07-28 (SEP-2577). They still work and stay in the spec for at least a year, which is why they are taught here — but do not start anything new on them. Each chapter says so, with the migration path.',
    queries: ['what is mcp','model context protocol tutorial','mcp server python','mcp client python',
      'mcp elicitation','mcp sampling deprecated','mcp roots','mcp transport stdio http','fastmcp mcpserver'],
    hashtags: '#mcp #claude #anthropic #python #ai #thenbxstudio',
    tags: TAGS_MCP,
  },
};
const COURSE = COURSES[process.argv[2] ?? 'dsa'];
if (!COURSE) { console.error(`usage: build-course-cut <${Object.keys(COURSES).join('|')}>`); process.exit(2); }
const ORDER = COURSE.order;
const OUT = COURSE.out;
const FPS = 30;

const hms = (f) => {
  const s = Math.floor(f / FPS);
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
    .map((n) => String(n).padStart(2, '0')).join(':');
};

// ── gather ──────────────────────────────────────────────────────────────────
const eps = ORDER.map((slug) => {
  const spec = JSON.parse(fs.readFileSync(`topics/${slug}/long.json`, 'utf8'));
  const mp4 = `topics/${slug}/out/wide-dark.mp4`;
  if (!fs.existsSync(mp4)) throw new Error(`missing render: ${mp4}`);
  const cover = spec.cover ? (spec.cover.frames ?? 2) : 0;
  // per-scene starts within the episode, so authored sub-chapters can be offset
  let o = cover;
  const starts = {};
  for (const sc of spec.scenes) { starts[sc.id] = o; o += sc.durationFrames; }
  return {slug, spec, mp4, frames: o, starts, seo: spec.meta?.seo ?? {}};
});

// frame count in the file must match the spec, or every later chapter is wrong
for (const e of eps) {
  const n = Number(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=nb_frames', '-of', 'csv=p=0', e.mp4], {encoding: 'utf8'}).trim().replace(/,/g, ''));
  if (n !== e.frames) throw new Error(`${e.slug}: spec ${e.frames} frames, file ${n}`);
}

// ── concat ──────────────────────────────────────────────────────────────────
fs.mkdirSync(`${OUT}/out`, {recursive: true});
const listPath = `${OUT}/out/concat.txt`;
fs.writeFileSync(listPath, eps.map((e) => `file '${process.cwd()}/${e.mp4}'`).join('\n') + '\n');
const finalMp4 = `${OUT}/out/wide-dark.mp4`;
console.log(`· concatenating ${eps.length} episodes …`);
execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0',
  '-i', listPath, '-c', 'copy', '-movflags', '+faststart', finalMp4], {stdio: 'inherit'});

const total = eps.reduce((a, e) => a + e.frames, 0);
const got = Number(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-count_frames', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', finalMp4],
  {encoding: 'utf8'}).trim().replace(/,/g, ''));
if (got !== total) throw new Error(`concat drift: expected ${total} frames, got ${got}`);
console.log(`✓ ${finalMp4} — ${hms(total)} (${total} frames, verified)`);

// ── chapters ────────────────────────────────────────────────────────────────
// One chapter per episode, then that episode's own authored beats indented under
// it. YouTube needs the first chapter at 00:00:00 and >=10s between marks.
const marks = [];
let off = 0;
for (const [i, e] of eps.entries()) {
  const label = e.seo.courseChapter ?? e.spec.meta?.topic ?? e.slug;
  // 0 is the framework and 11 is the live problem set — neither is a numbered pattern
  marks.push(`${hms(off)} - ${COURSE.numbered(i) ? COURSE.label(i, label) : label}`);
  let last = off;
  for (const c of e.seo.chapters ?? []) {
    const f = off + (e.starts[c.id] ?? 0);
    if (f - last < 10 * FPS) continue;
    marks.push(`${hms(f)} -   ${c.title}`);
    last = f;
  }
  off += e.frames;
}
marks[0] = marks[0].replace(/^\d\d:\d\d:\d\d/, '00:00:00');


// YouTube tags. Comma-separated, hard-capped at 500 chars — truncated at the last
// whole tag that fits, never mid-word.
let tagLine = '';
for (const tg of COURSE.tags) {
  const next = tagLine ? `${tagLine}, ${tg}` : tg;
  if (next.length > 500) break;
  tagLine = next;
}

const channel = eps[0].spec.brand?.channel ?? channelName();
const md = [
  '# TITLE',
  COURSE.title,
  '',
  '## Alternate titles',
  ...COURSE.alts.map((t) => `- ${t}`),
  '',
  '# DESCRIPTION',
  '',
  COURSE.lede,
  '',
  COURSE.sub,
  '',
  COURSE.body(channel),
  '',
  '⏱️ CHAPTERS',
  ...marks,
  '',
  '🔗 SOURCES & REFERENCES',
  ...COURSE.sources.map((x) => `- ${x}`),
  '',
  '👇 SUBSCRIBE & WATCH NEXT',
  COURSE.next(channel),
  '',
  '📌 PINNED COMMENT',
  COURSE.pinned,
  '',
  'User Queries:',
  ...COURSE.queries,
  '',
  COURSE.hashtags,
  '',
  '# TAGS (comma-separated, \u2264500 chars — paste into YouTube tags field)',
  tagLine,
].join('\n');

fs.writeFileSync(`${OUT}/out/upload.md`, md.trim() + '\n');
console.log(`✓ ${OUT}/out/upload.md — ${marks.length} chapters`);
