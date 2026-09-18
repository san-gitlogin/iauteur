// THROWAWAY — generic stress proof. `node scripts/_proof.mjs <TYPE> <dataKey> <fixtures.json> <f1,f2,..>`
// Fixtures file: {min:{...}, max:{...}, mix?:"@manifest"}. Delete after viewing (authoring §3.5).
import fs from 'node:fs';
import path from 'node:path';
const P = (r) => path.resolve(process.cwd(), r);
const [TYPE, KEY, fixFile, framesArg] = process.argv.slice(2);
const {bundle} = await import('file://' + P('node_modules/@remotion/bundler/dist/index.js'));
const {selectComposition, renderStill} = await import('file://' + P('node_modules/@remotion/renderer/dist/index.js'));
const {MANIFEST} = await import('file://' + P('scripts/lib/manifest.mjs'));

const fixtures = JSON.parse(fs.readFileSync(P(fixFile), 'utf8'));
for (const k of Object.keys(fixtures)) {
  if (fixtures[k] === '@manifest') fixtures[k] = MANIFEST[TYPE].example[KEY];
}
const frames = framesArg.split(',').map(Number);

const spec = (d) => ({meta: {topic: TYPE, format: 'long', fps: 30}, scenes: [
  {id: 's01', type: TYPE, narration: 'proof', durationFrames: 220,
   timingSource: 'estimated', background: 'zoneA', data: {[KEY]: d}},
]});

const outDir = P(`out/proof/${TYPE.toLowerCase()}`);
fs.rmSync(outDir, {recursive: true, force: true});
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: P('src/index.ts'), onProgress: () => {}});
const jobs = [['material-wide', 'material'], ['material-short', 'material'],
              ['neobrutalism-wide', 'neobrutalism'], ['neobrutalism-short', 'neobrutalism']];
for (const [name, d] of Object.entries(fixtures)) {
  for (const [id, design] of jobs) {
    for (const f of frames) {
      const inputProps = {spec: spec(d), themeOverride: design, designOverride: design};
      const composition = await selectComposition({serveUrl, id, inputProps});
      const out = path.join(outDir, `${name}_${id}_f${f}.png`);
      await renderStill({composition, serveUrl, output: out, frame: f, inputProps,
        chromiumOptions: {gl: 'angle'}, logLevel: 'error'});
      console.log('·', path.relative(process.cwd(), out));
    }
  }
}
console.log('done');
