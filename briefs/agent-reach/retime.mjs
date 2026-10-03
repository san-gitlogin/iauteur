#!/usr/bin/env node
// RE-TIME THE TAKES FOR THE CUT, then make every segment play STRAIGHT.
//   node briefs/agent-reach/retime.mjs
//
// Why both halves exist (measured on this cut, 2026-10-03):
//
// 1. A terminal step is mostly typing and waiting, and the camera's marks only exist on its LAST
//    frame. The timing solver places every zoom and callout in the hold AFTER a clip's footage, so a
//    28-word step under a sentence that names its result at word 20 cannot be solved: ten recorded
//    beats failed with "0 word(s) of script after its footage ends". Speeding the step up (always
//    from the untouched original, seg-NN.x1.mp4) gets the finished screen up before the words that
//    point at it. Every sped-up clip says so in its label.
//
// 2. The renderer normally spreads a clip's slack across its internal pauses, which stretches the
//    footage over its whole airtime and leaves no hold at all. A dense motion map makes it play at
//    1x and then freeze on the finished frame, which is the picture the camera moves are measured on.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const SPEED = {
  'ar-x': {search: 2, fail: 2, fix: 4, posts: 2},
  'ar-reddit': {search: 2},
  'ar-translate': {zh: 2, translated: 2},
  'ar-install': {pip: 12, check: 2, doctor: 2},
  'ar-read': {web: 2, ytsearch: 3, subs: 3, read: 3, rss: 3, gh: 2},
  'ar-exa': {search: 3},
  'ar-agent': {install: 8},
  'ar-agent2': {ask: 6},
};
const ALL = ['ar-repo', 'ar-readme', 'ar-install', 'ar-read', 'ar-x', 'ar-reddit', 'ar-exa', 'ar-agent', 'ar-agent2', 'ar-translate'];

for (const [slug, steps] of Object.entries(SPEED))
  for (const [id, k] of Object.entries(steps))
    console.log(execFileSync('node', ['briefs/tokens21/speed-seg.mjs', slug, id, String(k)], {encoding: 'utf8'}).trim());

for (const slug of ALL) {
  const f = `public/rec/${slug}/manifest.json`;
  const m = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const st of m.steps) {
    if (!st.segmentFrames) continue;
    st.changes = Array.from({length: Math.ceil(st.segmentFrames / 6)}, (_, i) => i * 6);
  }
  fs.writeFileSync(f, JSON.stringify(m, null, 2));
}
// MEASURED MARKS on the agent's finished answer (ar-agent2#ask). An interactive agent take cannot be given
// text marks in advance, because nobody knows what the answer will say. These two rectangles were read off
// this take's last frame (1600x900 capture): the line where Claude names a tool per platform, and the block
// of the answer itself. `covers` is the text under each, copied from the take's own screen text.
{
  const f = 'public/rec/ar-agent2/manifest.json';
  const m = JSON.parse(fs.readFileSync(f, 'utf8'));
  const st = m.steps.find((x) => x.id === 'ask');
  const rows = String(st.screenText ?? '').split('\n');
  const plan = rows.find((r) => /agent-reach: X via/.test(r)) ?? '';
  const i = rows.findIndex((r) => r.trim() === 'X'), j = rows.findIndex((r) => /^\${3}$/.test(r.trim()));
  if (!plan || i < 0 || j < 0) throw new Error('ar-agent2: the answer is not where the measured marks expect it; re-measure');
  const R = (x, y, w, h, covers) => ({x, y, w, h, covers, block: {x, y, w, h}});
  st.marks = {...(st.marks ?? {}),
    plan: R(90, 279, 970, 22, plan.replace(/^[^A-Za-z]+/, '').trim()),
    answer: R(88, 316, 1500, 372, rows.slice(i, j).join(' ').replace(/\s+/g, ' ').trim().slice(0, 600))};
  fs.writeFileSync(f, JSON.stringify(m, null, 2));
}
// The same for the install take (ar-agent#install): the line where Claude reports Agent Reach is already on
// the machine, read off the take's last frame.
{
  const f = 'public/rec/ar-agent/manifest.json';
  const m = JSON.parse(fs.readFileSync(f, 'utf8'));
  const st = m.steps.find((x) => x.id === 'install');
  const row = String(st.screenText ?? '').split('\n').find((r) => /already (seems to be|installed)/.test(r));
  if (!row) throw new Error('ar-agent: the "already installed" line is not on the last frame; re-measure');
  const R = (x, y, w, h, covers) => ({x, y, w, h, covers, block: {x, y, w, h}});
  st.marks = {...(st.marks ?? {}), found: R(100, 430, 1440, 24, row.replace(/^[^A-Za-z]+/, '').trim().slice(0, 200))};
  fs.writeFileSync(f, JSON.stringify(m, null, 2));
}
console.log(`straightened ${ALL.length} takes`);
