// PHASE A — MATRIX SHOT HARNESS.
// Renders the REAL showcase composition (<design>-wide / <design>-short, which bake
// showcaseSpec as defaultProps) one still per scene at its 55% midpoint — i.e. the
// exact default appearance of every component in the library, in the given pack &
// aspect. This is the MIX / default-props column of the matrix, rendered from the
// shipped showcase (not a hand fixture). Reads the AUTHORITATIVE scene index emitted
// by scripts/dump-showcase.mjs (audit/showcase-scenes.json) — the same `showcaseScenes`
// array the composition derives from, so labels + frame offsets can never drift. Run
// `node scripts/dump-showcase.mjs` first if the showcase changed.
//   node scripts/matrix-shots.mjs <design> [aspects=both]
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const design = process.argv[2] || 'material';
const which = process.argv[3] || 'both';

const dumpPath = path.resolve('audit/showcase-scenes.json');
if (!fs.existsSync(dumpPath)) {
  console.error('MISSING audit/showcase-scenes.json — run: node scripts/dump-showcase.mjs');
  process.exit(1);
}
const ordered = JSON.parse(fs.readFileSync(dumpPath, 'utf8')).map((s) => ({
  sc: s.id,
  type: s.type,
  frame: s.midFrame,
}));

const outDir = `out/matrix/${design}`;
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});

const aspects = which === 'both' ? [['wide', `${design}-wide`], ['vert', `${design}-short`]]
  : which === 'wide' ? [['wide', `${design}-wide`]] : [['vert', `${design}-short`]];

for (const [asp, comp] of aspects) {
  const c = await selectComposition({serveUrl, id: comp});
  for (const s of ordered) {
    const out = path.join(outDir, `${asp}_${s.sc}_${s.type}.png`);
    await renderStill({composition: c, serveUrl, output: out, frame: s.frame, imageFormat: 'png', scale: 0.5});
    process.stdout.write('.');
  }
  console.log(` ${asp} ${ordered.length} shots`);
}
console.log('DONE', outDir);
