#!/usr/bin/env node
// AUDIT — DETERMINISM GATE. Renders sampled frames of the full showcase TWICE and
// byte-compares the PNGs. Any difference is nondeterminism (P0) — the exact class
// that breaks seeded layouts (KNOWLEDGE_GRAPH scatter, GRID heatmap, HASH scramble)
// and any Math.random slip. No eyeballing: bytes are the judge.
// Usage: node scripts/audit-determinism.mjs [design]
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const design = process.argv[2] ?? 'material';
const outDir = 'audit/determinism';
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});

const hash = (p) => createHash('sha1').update(fs.readFileSync(p)).digest('hex');
const defects = [];

for (const comp of [`${design}-wide`, `${design}-new-wide`]) {
  const c = await selectComposition({serveUrl, id: comp, inputProps: {themeOverride: design, designOverride: design}});
  // sample 6 evenly-spaced frames across the composition
  const frames = Array.from({length: 6}, (_, i) => Math.floor((c.durationInFrames * (i + 1)) / 7));
  for (const f of frames) {
    const a = path.join(outDir, `${comp}_${f}_a.png`);
    const b = path.join(outDir, `${comp}_${f}_b.png`);
    await renderStill({composition: c, serveUrl, output: a, frame: f, imageFormat: 'png', inputProps: {themeOverride: design, designOverride: design}});
    await renderStill({composition: c, serveUrl, output: b, frame: f, imageFormat: 'png', inputProps: {themeOverride: design, designOverride: design}});
    const ha = hash(a);
    const hb = hash(b);
    const ok = ha === hb;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${comp} @${f}  ${ha.slice(0, 10)} ${ok ? '==' : '!='} ${hb.slice(0, 10)}`);
    if (!ok) defects.push({comp, frame: f, a: ha, b: hb});
    fs.rmSync(a); fs.rmSync(b);
  }
}
fs.writeFileSync(path.join(outDir, 'result.json'), JSON.stringify({design, defects, ok: defects.length === 0}, null, 2));
console.log(`\nDETERMINISM: ${defects.length === 0 ? 'PASS (byte-identical everywhere)' : `FAIL — ${defects.length} nondeterministic frame(s) [P0]`}`);
process.exit(defects.length === 0 ? 0 : 1);
