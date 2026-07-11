#!/usr/bin/env node
// Derives voiceover text files FROM the spec (single source of truth).
// Models must never hand-write these. Usage: node scripts/gen-voiceover.mjs <slug>
import fs from 'node:fs';
const slug = process.argv[2];
if (!slug) { console.error('Usage: node scripts/gen-voiceover.mjs <slug>'); process.exit(2); }
for (const kind of ['long', 'shorts']) {
  const p = `topics/${slug}/${kind}.json`;
  if (!fs.existsSync(p)) continue;
  const spec = JSON.parse(fs.readFileSync(p, 'utf8'));
  const out = spec.scenes.map((s) => `${s.id}|${s.narration}`).join('\n') + '\n';
  fs.writeFileSync(`topics/${slug}/voiceover_${kind}.txt`, out);
  console.log(`✓ topics/${slug}/voiceover_${kind}.txt (${spec.scenes.length} lines)`);
}
