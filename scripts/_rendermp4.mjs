// One-off MP4 render for a topic composition via @remotion/renderer (npx is
// unavailable in this environment). Usage: node scripts/_rendermp4.mjs <compId> <out.mp4>
import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [compId, out] = process.argv.slice(2);
if (!compId || !out) { console.error('Usage: node scripts/_rendermp4.mjs <compId> <out.mp4>'); process.exit(2); }
fs.mkdirSync(path.dirname(out), {recursive: true});

console.log('bundling…');
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
console.log('selecting composition', compId);
const comp = await selectComposition({serveUrl, id: compId});
console.log(`rendering ${comp.durationInFrames} frames → ${out}`);
let last = -1;
await renderMedia({
  composition: comp,
  serveUrl,
  codec: 'h264',
  outputLocation: out,
  concurrency: 1,
  chromiumOptions: {gl: 'angle'},
  onProgress: ({progress}) => {
    const pct = Math.floor(progress * 100);
    if (pct >= last + 10) { last = pct; console.log(`  ${pct}%`); }
  },
});
console.log('DONE', out);
