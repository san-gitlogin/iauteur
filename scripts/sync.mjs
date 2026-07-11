#!/usr/bin/env node
// Converts ESTIMATED timing into REAL TTS timing — the sync step.
// Word anchors become exact frames (stored as fractional atWord so components
// need zero changes: wordToFrame((frame/12)+1) === frame).
// Usage: node scripts/sync.mjs specs/long.json out/tts/long_timestamps.json long
import fs from 'node:fs';

const [specPath, tsPath, prefix] = process.argv.slice(2);
if (!specPath || !tsPath || !prefix) {
  console.error('Usage: node scripts/sync.mjs <spec.json> <timestamps.json> <prefix>');
  process.exit(2);
}
const FPS = 30, FPW = 12;
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const ts = JSON.parse(fs.readFileSync(tsPath, 'utf8'));

const retarget = (obj, words) => {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'atWord' && typeof v === 'number') {
      const idx = Math.min(Math.max(1, Math.round(v)), words.length) - 1;
      const frame = Math.round(words[idx] * FPS);
      obj.atWord = +(frame / FPW + 1).toFixed(3); // fractional anchor = exact frame
    } else retarget(v, words);
  }
};

for (const scene of spec.scenes) {
  const t = ts[scene.id];
  if (!t) { console.warn(`! no timestamps for ${scene.id}, keeping estimate`); continue; }
  retarget(scene.data, t.words);
  scene.durationFrames = Math.ceil(t.duration * FPS) + 10;
  scene.audio = `audio/${prefix}_${scene.id}.mp3`;
  scene.timingSource = 'tts';
}
fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
console.log(`✓ ${specPath} re-timed from real audio (${Object.keys(ts).length} scenes). Lint, then Studio.`);
