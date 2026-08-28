// STILLS OF ONE SHOWCASE COMPONENT, both aspects, several moments.
//
// LAW 0o's corollary: the sweep is the only honest check, and a component with a payoff STATE
// needs a frame per state — a single still at the 55% mark once caught a ring mid-collapse and
// the ring itself shipped unlooked-at. CURSOR_WALK has three states worth seeing: the diagram at
// rest, the question in flight, and the head part-way down the rows.
//
// Usage: node scripts/component-sheet.mjs <SCENE_TYPE> [design] [frame,frame,...]
import path from 'node:path';
import fs from 'node:fs';
import {selectComposition, renderStill} from '@remotion/renderer';
import {bundle} from '@remotion/bundler';

const [type, design = 'moderndark', framesArg] = process.argv.slice(2);
if (!type) {
  console.error('Usage: node scripts/component-sheet.mjs <SCENE_TYPE> [design] [f1,f2,f3]');
  process.exit(2);
}
const marks = (framesArg ? framesArg.split(',') : ['20', '60', '110', '170']).map(Number);

const {showcaseSpec} = await import('../src/showcaseSpec.ts').catch(() => ({showcaseSpec: null}))
  .then((m) => m, () => ({showcaseSpec: null}));

// showcaseSpec is TypeScript, so read the offsets out of the compiled bundle instead of importing
// it: the scene list and its durations are all we need and they are plain data in the source.
// USE THE AUTHORITATIVE INDEX, do not re-derive it.
//
// `scripts/dump-showcase.mjs` emits audit/showcase-scenes.json from the SAME `scenes` array the
// composition renders, and says so in its own comment: "frame offsets can NEVER drift". Two
// attempts at scraping showcaseSpec.ts instead both produced wrong offsets — the file builds its
// list from three concatenated sources, so a regex over the raw text counts scenes that the
// composition does not contain, and the sheet rendered a QUOTE_SPOTLIGHT labelled CURSOR_WALK.
const INDEX = 'audit/showcase-scenes.json';
if (!fs.existsSync(INDEX)) {
  console.error(`${INDEX} is missing — run: node scripts/dump-showcase.mjs`);
  process.exit(1);
}
const rows = JSON.parse(fs.readFileSync(INDEX, 'utf8'));
const hit = rows.find((r) => r.type === type);
const target = hit ? {...hit, start: hit.startFrame, frames: hit.durationFrames} : null;
if (!target) {
  console.error(`${type} is not in src/showcaseSpec.ts — every new component must be added there ` +
    `so it appears in all 30 design compositions for review (LAW 9).`);
  process.exit(1);
}
console.log(`${type} — showcase frames ${target.start}..${target.start + target.frames}`);

const serveUrl = await bundle({
  entryPoint: path.resolve('src/index.ts'),
  outDir: path.resolve('out/hookbundle'),
});
const outDir = path.resolve(`out/proof/${type.toLowerCase()}`);
fs.mkdirSync(outDir, {recursive: true});

for (const aspect of ['wide', 'short']) {
  const composition = await selectComposition({serveUrl, id: `${design}-${aspect}`});
  for (const m of marks) {
    const frame = target.start + Math.min(m, target.frames - 1);
    const out = path.join(outDir, `${design}_${aspect}_f${m}.png`);
    await renderStill({composition, serveUrl, output: out, frame});
    console.log(`  ${aspect} f${String(m).padEnd(4)} -> ${path.basename(out)}`);
  }
}
console.log(`\nsheet in ${outDir}`);
