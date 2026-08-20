#!/usr/bin/env node
// Spec-level consistency audit for the DSA series. Stills catch what a frame LOOKS
// like; this catches faults that are invisible in any single frame — an element
// anchored past the end of the narration (it never fires), a pane with nothing in
// it, an anchor landing after the scene has already cut. Run before rendering.
// Usage: node scripts/audit-dsa.mjs
import fs from 'node:fs';

const FRAMES_PER_WORD = 12;
// any course topic, not just the dojo
const PREFIX = process.argv[2] ?? 'dsa-dojo';
// fixtures are render-proof scaffolding, not shipping content
const files = fs.readdirSync('topics').filter((d) => d.startsWith(PREFIX) && !d.endsWith('-proof') && fs.existsSync(`topics/${d}/long.json`));
let faults = 0, warns = 0;

for (const slug of files.sort()) {
  const spec = JSON.parse(fs.readFileSync(`topics/${slug}/long.json`, 'utf8'));
  for (const sc of spec.scenes) {
    const words = (sc.narration ?? '').trim().split(/\s+/).filter(Boolean).length;
    const dur = sc.durationFrames ?? 0;
    const say = (lvl, msg) => { console.log(`${lvl} ${slug} ${sc.id} (${sc.type}): ${msg}`); lvl === '✗' ? faults++ : warns++; };

    // walk every atWord in the scene
    const anchors = [];
    const walk = (o, path) => {
      if (!o || typeof o !== 'object') return;
      for (const [k, val] of Object.entries(o)) {
        if (/atWord$/i.test(k) && typeof val === 'number') anchors.push({path: `${path}.${k}`, w: val});
        else walk(val, `${path}.${k}`);
      }
    };
    walk(sc.data, '');

    for (const a of anchors) {
      // an anchor past the last spoken word never lands while the words are heard
      if (a.w > words + 1) say('✗', `${a.path} anchored at word ${a.w} but the narration is ${words} words`);
      // ... and one past the scene's own length never lands at all
      const f = (a.w - 1) * FRAMES_PER_WORD;
      if (f >= dur) say('✗', `${a.path} fires at frame ${Math.round(f)} but the scene is ${dur} frames`);
    }

    // a data pane with a key but nothing to draw is a blank right-hand panel
    for (const [key, d] of Object.entries(sc.data ?? {})) {
      if (!d || typeof d !== 'object' || !key.startsWith('dsa')) continue;
      const drawable = ['cells', 'lines', 'aux', 'pointers', 'vars'].reduce((n, k) => n + (Array.isArray(d[k]) ? d[k].length : 0), 0);
      if (drawable === 0) say('✗', `${key} has nothing to draw — the pane renders empty`);
      if (d.premise && d.premise.length > 190) say('!', `premise is ${d.premise.length} chars — it will crowd the picture`);
      if (d.problem && d.problem.length > 240) say('!', `problem is ${d.problem.length} chars`);
      // every trace pane should carry the standing setup
      if (/^(dsa(Ptrs|Window|Bsearch|Hash|Stack|Grid|Tree|Dp|Intervals|List)|mcp(Wire|Loop|Schema|Uri|Sampling|Roots|Progress|Flags|Elicit|Api))$/.test(key) && !d.premise)
        say('!', `${key} has no premise — the viewer is given no setup for this picture`);
    }
  }
}
console.log(`\n${faults} fault(s), ${warns} warning(s) across ${files.length} episodes`);
process.exit(faults ? 1 : 0);
