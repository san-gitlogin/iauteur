// EVERY DESIGN PACK'S OPENING, THREE SILHOUETTES EACH, IN ONE BROWSER.
//
// tsc passing on the port of 29 packs proves the code compiles; it proves nothing about whether
// artdeco's sunburst still frames its icon, whether maximalism's clipped-gradient headline survives
// being split into word spans, or whether a mark sized for a 148px stack still works at reveal's
// 250px. LAW 0o's corollary: the sweep is the only honest check.
//
// Root.tsx registers a `<pack>-wide` composition per design whose props are {spec, themeOverride,
// designOverride}, so the hook-proof spec can be pushed through all thirty without thirty topics.
//
// Three frames per pack, chosen for what each one can break:
//   v7 stack      the classic — exercises plate, kicker, mark, divider and sub together
//   v2 statement  flush left, word-by-word — where a clipped-gradient headline goes invisible
//   v5 reveal     the mark alone at its largest, then shrunk beside the words
import path from 'node:path';
import fs from 'node:fs';
import {selectComposition, renderStill} from '@remotion/renderer';
import {bundle} from '@remotion/bundler';

const spec = JSON.parse(fs.readFileSync('topics/hook-proof/long.json', 'utf8'));
const PACKS = fs.readdirSync('src/designs', {withFileTypes: true})
  .filter((e) => e.isDirectory()).map((e) => e.name).sort();

// scene id -> absolute frame, near the END of the beat so every entrance has settled. 62% looked
// reasonable and wasn't: `reveal` anchors its headline at word five, which lands at frame 60 of a
// 96-frame beat, so the sheet caught it half-faded and I nearly filed a contrast bug against it.
const at = {};
let off = 0;
for (const s of spec.scenes) {
  at[s.id] = off + s.durationFrames - 8;
  off += s.durationFrames;
}
const SHOTS = [['v7', 'stack'], ['v2', 'statement'], ['v5', 'reveal']];

const serveUrl = await bundle({
  entryPoint: path.resolve('src/index.ts'),
  outDir: path.resolve('out/hookbundle'),
});
const outDir = path.resolve('out/proof/hook-packs');
fs.mkdirSync(outDir, {recursive: true});

let n = 0;
for (const pack of PACKS) {
  const id = `${pack}-wide`;
  const inputProps = {spec, themeOverride: pack, designOverride: pack};
  let composition;
  try {
    composition = await selectComposition({serveUrl, id, inputProps});
  } catch {
    console.log(`SKIP ${pack} — no ${id} composition`);
    continue;
  }
  for (const [sid, label] of SHOTS) {
    const out = path.join(outDir, `${pack}_${label}.png`);
    try {
      await renderStill({composition, serveUrl, output: out, frame: at[sid], inputProps});
      n++;
    } catch (e) {
      console.log(`FAIL ${pack}/${label}: ${String(e.message).split('\n')[0]}`);
    }
  }
  console.log(`${pack}`);
}
console.log(`\n${n} still(s) in ${outDir}`);
