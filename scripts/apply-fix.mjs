#!/usr/bin/env node
// INGEST a model's fix reply. Replaces scenes by id, re-normalizes, re-lints.
// Usage: node scripts/apply-fix.mjs <spec.json> <fix-array.json>
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NODE = process.execPath;
const [specPath, fixPath] = process.argv.slice(2);
if (!specPath || !fixPath) { console.error('Usage: node scripts/apply-fix.mjs <spec.json> <fix-array.json>'); process.exit(2); }

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8').replace(/^\uFEFF/, ''));
let fixes = JSON.parse(fs.readFileSync(fixPath, 'utf8').replace(/^\uFEFF/, ''));
fixes = Array.isArray(fixes) ? fixes : (fixes.scenes || [fixes]);

const byId = Object.fromEntries(spec.scenes.map((s, i) => [s.id, i]));
let applied = 0;
for (const fx of fixes) {
  if (fx && fx.id != null && byId[fx.id] != null) { Object.assign(spec.scenes[byId[fx.id]], fx); applied++; }
  else console.log(`! fix for unknown scene id "${fx && fx.id}" ignored`);
}
fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
console.log(`✓ applied ${applied} corrected scene(s) → ${specPath}`);

console.log('\n── re-normalize ──');
try { console.log(execFileSync(NODE, [path.join(ROOT, 'scripts', 'normalize.mjs'), specPath], {encoding: 'utf8'}).trim()); } catch (e) { console.log((e.stdout || '') + (e.stderr || '')); }
console.log('\n── re-lint ──');
let code = 0;
try { console.log(execFileSync(NODE, [path.join(ROOT, 'scripts', 'lint-spec.mjs'), specPath], {encoding: 'utf8'}).trim()); }
catch (e) { console.log(((e.stdout || '') + (e.stderr || '')).trim()); code = e.status ?? 1; }
process.exit(code);
