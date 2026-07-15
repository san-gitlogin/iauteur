// Targeted single-still proof: render specific scenes at specific fractions.
// Usage: node scripts/_sceneproof.mjs <spec.json> <design> <wide|vert> <tag> <sId:frac,sId:frac,...>
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [specPath, design = 'moderndark', aspect = 'vert', tag = 'sceneproof', list = ''] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const want = new Map(list.split(',').filter(Boolean).map((p) => { const [id, f] = p.split(':'); return [id, parseFloat(f || '0.6')]; }));
const outDir = `out/proof/${tag}`;
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {spec, themeOverride: design, designOverride: design};
const comp = aspect === 'wide' ? `${design}-wide` : `${design}-short`;
const c = await selectComposition({serveUrl, id: comp, inputProps, timeoutInMilliseconds: 180000});

let off = 0;
for (const s of spec.scenes) {
  if (want.has(s.id)) {
    const frac = want.get(s.id);
    const frame = off + Math.floor(s.durationFrames * frac);
    await renderStill({composition: c, serveUrl, output: path.join(outDir, `${aspect}_${s.id}_${s.type}.png`), frame, inputProps, imageFormat: 'png', timeoutInMilliseconds: 180000});
    console.log('OK', aspect, s.id, s.type, 'frame', frame);
  }
  off += s.durationFrames;
}
console.log('DONE', outDir);
