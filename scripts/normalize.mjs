#!/usr/bin/env node
// Normalize a spec file IN PLACE (deterministic auto-repair) before linting.
// Usage: node scripts/normalize.mjs topics/<slug>/long.json
import fs from 'node:fs';
import {normalizeSpec} from './lib/normalize-spec.mjs';

const file = process.argv[2];
if (!file) { console.error('Usage: node scripts/normalize.mjs <spec.json>'); process.exit(2); }
const spec = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const {spec: out, changes, warnings} = normalizeSpec(spec);
fs.writeFileSync(file, JSON.stringify(out, null, 2));
if (changes.length) {
  console.log(`✓ normalized ${file} — ${changes.length} auto-fix(es):`);
  for (const c of changes) console.log('  • ' + c);
} else {
  console.log(`✓ ${file} already clean (no auto-fixes needed)`);
}
if (warnings && warnings.length) {
  console.log(`⚠ ${warnings.length} note(s) for the creator (not auto-fixed):`);
  for (const w of warnings) console.log('  • ' + w);
}
