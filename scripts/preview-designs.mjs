// Throwaway: render one flagship scene of the TeraWulf video across all 30
// design packs, so every design can be compared side by side. Bundles ONCE.
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const specPath = 'topics/terawulf-anthropic-lease/long.json';
const sceneId = process.argv[2] || 's04';
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

// absolute frame at 60% into the chosen scene
let off = spec.cover ? spec.cover.frames ?? 2 : 0;
let frame = 0;
for (const s of spec.scenes) {
  if (s.id === sceneId) {
    frame = off + Math.floor(s.durationFrames * 0.6);
    break;
  }
  off += s.durationFrames;
}

const designs = [
  'cyberpunk', 'swiss', 'neobrutalism', 'vaporwave', 'bauhaus', 'luxury',
  'terminalcli', 'retro', 'material', 'neumorphism', 'artdeco', 'monochrome',
  'academia', 'newsprint', 'clay', 'organic', 'industrial', 'playgeo',
  'maximalism', 'simpledark', 'flatdesign', 'sketch', 'kinetic', 'crypto',
  'corptrust', 'businessdeck', 'techstyle', 'boldtype', 'botanical', 'moderndark',
];

const compId = 'terawulf-anthropic-lease-wide-dark';
const outDir = 'out/proof/designs';
fs.mkdirSync(outDir, {recursive: true});

console.log(`Bundling once… (scene ${sceneId}, frame ${frame})`);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});

let i = 0;
for (const d of designs) {
  i++;
  const s = JSON.parse(JSON.stringify(spec));
  s.brand.theme = d;
  s.brand.design = d;
  const inputProps = {spec: s};
  try {
    const comp = await selectComposition({serveUrl, id: compId, inputProps});
    await renderStill({
      composition: comp,
      serveUrl,
      output: path.join(outDir, `${String(i).padStart(2, '0')}_${d}.png`),
      frame,
      inputProps,
      imageFormat: 'png',
    });
    console.log(`✓ ${i}/30 ${d}`);
  } catch (e) {
    console.log(`✗ ${i}/30 ${d} — ${e.message}`);
  }
}
console.log(`\nDone → ${outDir}/`);
