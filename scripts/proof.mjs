#!/usr/bin/env node
// PROOF SHEET — renders ONE still per scene so you review every frame
// in seconds without scrubbing. The visual half of the critique.
// Usage: node scripts/proof.mjs <CompositionId> <spec.json>
import fs from 'node:fs';
import {execSync} from 'node:child_process';

const [comp, file] = process.argv.slice(2);
if (!comp || !file) {
  console.error('Usage: node scripts/proof.mjs <CompositionId> <spec.json>');
  process.exit(2);
}
const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
fs.mkdirSync('out/proof', {recursive: true});

let offset = spec.cover ? (spec.cover.frames ?? 2) : 0;
const shots = [];
if (spec.cover) shots.push({name: 'cover', frame: 0});
for (const s of spec.scenes) {
  // 60% into the scene: entrances done, exit fade not started
  shots.push({name: s.id + '_' + s.type, frame: offset + Math.floor(s.durationFrames * 0.6)});
  offset += s.durationFrames;
}
for (const shot of shots) {
  const outfile = `out/proof/${comp}_${shot.name}.png`;
  console.log(`→ ${outfile} (frame ${shot.frame})`);
  execSync(`npx remotion still ${comp} "${outfile}" --frame=${shot.frame}`, {stdio: 'inherit'});
}
console.log(`\n✓ Proof sheet: ${shots.length} stills in out/proof/ — review before rendering the video.\n`);
