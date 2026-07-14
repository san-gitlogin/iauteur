// PHASE-2 STILL BUILDER (Q3): build a lint-valid spec whose scenes ARE the
// manifest examples for a given list of types, so `scripts/_proof.mjs` can render
// a still per type proving the entry renders REAL content. Reusable every batch.
//   node scripts/_manifestproof.mjs REVEAL,LOWER_THIRD,... [outfile]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {MANIFEST} from './lib/manifest.mjs';
import {normalizeSpec} from './lib/normalize-spec.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const types = (process.argv[2] || '').split(',').map((s) => s.trim()).filter(Boolean);
const out = process.argv[3] || path.join(ROOT, 'out', 'tmp', 'manifest-batch.json');
if (!types.length) { console.error('usage: _manifestproof.mjs TYPE1,TYPE2,...'); process.exit(2); }

// generic narration long enough to cover the example's atWord anchors
const NARR = 'This scene explains the idea clearly and simply so every viewer follows along here.';
const scenes = [];
// HOOK first (structural law) unless the batch already starts with one
if (types[0] !== 'HOOK') scenes.push({type: 'HOOK', narration: 'Here is the single idea that changes everything you thought.', data: MANIFEST.HOOK.example});
for (const t of types) {
  if (!MANIFEST[t]) { console.error('not manifested: ' + t); process.exit(2); }
  scenes.push({type: t, narration: NARR, data: JSON.parse(JSON.stringify(MANIFEST[t].example))});
}
scenes.push({type: 'OUTRO_CTA', narration: 'Subscribe for more clear breakdowns like this one every week.', data: MANIFEST.OUTRO_CTA.example});

const spec = {
  meta: {topic: 'Manifest batch proof', format: 'long', fps: 30},
  brand: {theme: 'material', design: 'material', themeLight: 'daylight', channel: 'PROOF'},
  thumbnail: {title: 'Manifest proof', badge: 'TEST', asset: 'lucide:check'},
  scenes,
};
const {changes} = normalizeSpec(spec);
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, JSON.stringify(spec, null, 2));
console.log(`built ${scenes.length} scenes (${changes.length} normalize fixes) → ${path.relative(ROOT, out)}`);
console.log('scene ids: ' + spec.scenes.map((s) => `${s.id}:${s.type}`).join(' '));
