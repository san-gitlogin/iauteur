// throwaway media proof: node scripts/_mediaproof.mjs <compBase> <theme> <design> <tag>
// Renders specs/matrix/_media.json through an EXISTING <compBase>-wide/-short
// composition shell, injecting theme + design via inputProps. This lets us proof
// a THEME that isn't a design pack (e.g. creatorGlow) by riding a pack shell but
// overriding themeOverride/designOverride.
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [compBase = 'material', theme = 'creatorGlow', design = '', tag = 'media', specPath = 'specs/matrix/_media.json'] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const outDir = `out/proof/${tag}`;
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {spec, themeOverride: theme, designOverride: design || undefined};

for (const [comp, asp] of [[`${compBase}-wide`, 'wide'], [`${compBase}-short`, 'vert']]) {
  let off = 0;
  const c = await selectComposition({serveUrl, id: comp, inputProps});
  for (const s of spec.scenes) {
    const frame = off + Math.floor(s.durationFrames * 0.62);
    off += s.durationFrames;
    await renderStill({composition: c, serveUrl, output: path.join(outDir, `${asp}_${s.id}.png`), frame, inputProps, imageFormat: 'png'});
    console.log('OK', asp, s.id);
  }
}
console.log('DONE', outDir);
