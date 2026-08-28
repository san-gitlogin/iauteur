// HOOK CONTACT SHEET — every opening silhouette, both aspects, in one browser.
//
// LAW 0o's corollary says the sweep is the only honest check: render stills before rendering a
// single video. `scripts/proof.mjs` does that per topic but shells out to `npx` once per frame,
// which both dies in this environment (ERR_INVALID_PACKAGE_CONFIG out of npm's own libnpmexec)
// and pays for a fresh browser every time. This opens ONE browser and takes the whole sheet.
//
// Two frames per scene on purpose: one while the entrance is still running, one after it settles.
// A composition can look finished at rest and be broken in motion — a word cluster that has not
// arrived yet, an edge drawing from the wrong origin, a mark that lands outside its own frame.
import path from 'node:path';
import fs from 'node:fs';
import {selectComposition, renderStill} from '@remotion/renderer';
import {bundle} from '@remotion/bundler';

const [slug = 'hook-proof', ...rest] = process.argv.slice(2);
const marks = rest.length ? rest.map(Number) : [30, 80];

// RE-BUNDLE EVERY TIME. `src/topicsIndex.ts` imports each topic's JSON, so the SPEC is compiled
// into the bundle alongside the components — a sheet taken against a stale bundle silently shows
// the previous spec. Cost me one confusing render: an already-fixed `background` kept throwing.
const serveUrl = await bundle({
  entryPoint: path.resolve('src/index.ts'),
  outDir: path.resolve('out/hookbundle'),
});
const spec = JSON.parse(fs.readFileSync(`topics/${slug}/long.json`, 'utf8'));
const outDir = path.resolve(`out/proof/${slug}`);
fs.mkdirSync(outDir, {recursive: true});

for (const aspect of ['wide-dark', 'short-dark']) {
  const id = `${slug}-${aspect}`;
  const composition = await selectComposition({serveUrl, id});
  let offset = spec.cover ? (spec.cover.frames ?? 2) : 0;
  for (const s of spec.scenes) {
    for (const m of marks) {
      const frame = offset + Math.min(m, s.durationFrames - 1);
      const variant = s.data?.hookVariant ?? 'auto';
      const out = path.join(outDir, `${aspect}_${s.id}_${variant}_f${m}.png`);
      await renderStill({composition, serveUrl, output: out, frame});
      console.log(`${aspect}  ${s.id.padEnd(4)} ${String(variant).padEnd(11)} f${String(m).padEnd(4)} -> ${path.basename(out)}`);
    }
    offset += s.durationFrames;
  }
}
console.log(`\nsheet in ${outDir}`);
