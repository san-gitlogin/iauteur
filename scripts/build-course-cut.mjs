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

const ORDER = [
  'dsa-dojo-00-framework', 'dsa-dojo-01-two-pointers', 'dsa-dojo-02-sliding-window',
  'dsa-dojo-03-binary-search', 'dsa-dojo-04-hashmap', 'dsa-dojo-05-stack',
  'dsa-dojo-06-bfs', 'dsa-dojo-07-dfs', 'dsa-dojo-08-dp',
  'dsa-dojo-09-greedy', 'dsa-dojo-10-fast-slow', 'dsa-dojo-11-problems',
];
const OUT = 'topics/dsa-dojo-course';
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
  const isPattern = i >= 1 && i <= 10;
  marks.push(`${hms(off)} - ${isPattern ? `Pattern ${String(i).padStart(2, '0')} — ${label}` : label}`);
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

const channel = eps[0].spec.brand?.channel ?? channelName();
const md = [
  '# TITLE',
  'The Complete DSA Pattern Dojo — 10 Patterns That Cover Almost Every Interview Question',
  '',
  '## Alternate titles',
  '- Every DSA Pattern You Need For MAANG Interviews (Full Course)',
  '- I Traced All 10 DSA Patterns Line By Line So You Never Memorise Another Solution',
  '- The Only DSA Course You Need Before Your Next Interview',
  '',
  '# DESCRIPTION',
  '',
  'Most people fail coding interviews because they memorised two hundred solutions instead of ten patterns.',
  '',
  `In this video, ${channel} traces all ten interview patterns line by line — the signal words that give each one away, the code running on real data one step at a time, and the four problems to go and do after each. This is the whole course in one sitting.`,
  '',
  '⏱️ CHAPTERS',
  ...marks,
  '',
  '🔗 SOURCE',
  '- Pattern set and problem lists: https://github.com/san-gitlogin/dsa-pattern-dojo',
  '- Interactive dojo: https://san-gitlogin.github.io/dsa-pattern-dojo/',
  '',
  '👇 SUBSCRIBE & WATCH NEXT',
  `Each pattern is also a standalone episode on ${channel} — start with whichever one you keep failing.`,
  '',
  '📌 PINNED COMMENT',
  'Do not watch this end to end and call it studying. Watch one pattern, then go and do its four problems before the next. The patterns only stick once your own code has failed at least once.',
  '',
  'User Queries:',
  'dsa patterns for coding interviews',
  'complete dsa course for faang',
  'leetcode patterns explained',
  'how to prepare for maang interviews',
  'two pointers sliding window binary search explained',
  'dynamic programming for interviews',
  'bfs dfs graph patterns interview',
  'coding interview preparation full course',
  '',
  '#dsa #leetcode #codinginterview #faang #maang #algorithms #datastructures #thenbxstudio',
].join('\n');

fs.writeFileSync(`${OUT}/out/upload.md`, md.trim() + '\n');
console.log(`✓ ${OUT}/out/upload.md — ${marks.length} chapters`);
