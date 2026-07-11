#!/usr/bin/env node
// Correct mm:ss chapters derived from spec frames — never hand-computed.
// Usage: npm run chapters -- <slug>
import fs from 'node:fs';
const slug = process.argv[2];
if (!slug) { console.error('Usage: npm run chapters -- <slug>'); process.exit(2); }
const spec = JSON.parse(fs.readFileSync(`topics/${slug}/long.json`, 'utf8'));
const mmss = (f) => {
  const s = Math.floor(f / 30);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
let offset = spec.cover ? (spec.cover.frames ?? 2) : 0;
const lines = [];
for (const sc of spec.scenes) {
  const label = (sc.data?.headline ?? sc.data?.heading ?? sc.type).replace(/[\[\]]/g, '');
  lines.push(`${mmss(offset)} ${label}`);
  offset += sc.durationFrames;
}
fs.writeFileSync(`topics/${slug}/chapters.txt`, lines.join('\n') + '\n');
console.log(`✓ topics/${slug}/chapters.txt (${lines.length} chapters, all timestamps machine-verified)`);
