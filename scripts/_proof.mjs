// reusable throwaway proof harness: node scripts/_proof.mjs <spec.json> <design> <tag>
// renders each scene of <spec> at 55% through the <design>-wide and <design>-short
// design compositions (spec injected via inputProps), one still per scene per aspect.
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [specPath, design = 'material', tag = 'proof'] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const outDir = `out/proof/${tag}`;
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {spec, themeOverride: design, designOverride: design};

for (const [comp, asp] of [[`${design}-wide`, 'wide'], [`${design}-short`, 'vert']]) {
  let off = 0;
  const c = await selectComposition({serveUrl, id: comp, inputProps});
  for (const s of spec.scenes) {
    const frame = off + Math.floor(s.durationFrames * 0.55);
    off += s.durationFrames;
    await renderStill({composition: c, serveUrl, output: path.join(outDir, `${asp}_${s.id}.png`), frame, inputProps, imageFormat: 'png'});
    console.log('OK', asp, s.id);
  }
}
console.log('DONE', outDir);
