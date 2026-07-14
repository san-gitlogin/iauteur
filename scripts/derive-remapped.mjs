#!/usr/bin/env node
// DERIVE THE RENDER-PROOF DENOMINATOR. A proof's denominator must come from the
// artifact that motivated it — here, the normalizer's own change log on the Gemini
// specs — never from memory. For each spec we normalize a COPY and report every
// scene whose DATA the normalizer rewrote (aliases/rewrites/coercions/drops/anchors),
// excluding console-owned churn (id/duration/transition-default).
// Usage: node scripts/derive-remapped.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeSpec} from './lib/normalize-spec.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const specs = [
  ['long', path.join(ROOT, 'briefs', 'examples', 'gemini-long.json')],
  ['shorts', path.join(ROOT, 'briefs', 'examples', 'gemini-shorts.json')],
];

const isDataRemap = (line) =>
  /^s\d+\b/.test(line) &&                 // tagged with a scene id
  !/ transition "/.test(line) &&          // not the transition coercion
  !/^recomputed /.test(line);             // not the duration summary

const distinctTypes = new Set();
for (const [kind, p] of specs) {
  const spec = JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
  const typeById = Object.fromEntries(spec.scenes.map((s) => [s.id, s.type]));
  const {changes} = normalizeSpec(spec);
  const byScene = {};
  for (const c of changes.filter(isDataRemap)) {
    const id = c.match(/^(s\d+)/)[1];
    (byScene[id] ||= []).push(c.replace(/^s\d+\s*/, ''));
  }
  console.log(`\n=== ${kind}.json — ${Object.keys(byScene).length} remapped scene(s) ===`);
  for (const id of Object.keys(byScene)) {
    const t = typeById[id];
    distinctTypes.add(t);
    console.log(`  ${id} ${t}`);
    for (const l of byScene[id]) console.log(`      · ${l}`);
  }
}
console.log(`\nDISTINCT REMAPPED TYPES (denominator): ${[...distinctTypes].sort().join(', ')}`);
console.log(`COUNT: ${distinctTypes.size}`);
