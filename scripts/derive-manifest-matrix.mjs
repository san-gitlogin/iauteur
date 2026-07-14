#!/usr/bin/env node
// DERIVE the Phase-2 manifest burn-down (R8: the denominator is scripted, never
// hand-listed). Reads the linter's authoritative TYPES registry and the current
// MANIFEST coverage, then emits MANIFEST_MATRIX.md — one row per remaining type,
// columns CLASS / INTERFACE_READ / ENTRY / GATE / STILL, all UNVIEWED. Re-running
// PRESERVES any row already marked (parses the existing file's sealed rows).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {TYPES} from './lib/constants.mjs';
import {MANIFEST_TYPES} from './lib/manifest.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'MANIFEST_MATRIX.md');

const manifested = new Set(MANIFEST_TYPES);
const remaining = TYPES.filter((t) => !manifested.has(t));

// preserve prior verdicts (a row is sealed by inspecting the artifact, not regen)
const prior = {};
if (fs.existsSync(OUT)) {
  for (const line of fs.readFileSync(OUT, 'utf8').split('\n')) {
    const m = line.match(/^\|\s*`([A-Z0-9_]+)`\s*\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|/);
    if (m) prior[m[1]] = {class: m[2].trim(), iface: m[3].trim(), entry: m[4].trim(), gate: m[5].trim(), still: m[6].trim()};
  }
}
const cell = (t, k, d) => (prior[t] && prior[t][k]) ? prior[t][k] : d;

const L = [];
L.push('# MANIFEST_MATRIX — Phase 2 contract (manifest 17 → 136)');
L.push('');
L.push('Derived by `node scripts/derive-manifest-matrix.mjs` from the linter `TYPES`');
L.push('registry (R8 — never hand-listed). One row per type NOT yet in the manifest.');
L.push('A row seals only when: CLASS logged · INTERFACE_READ (types.ts) · ENTRY written');
L.push('· GATE (check-manifest green) · STILL (a _sceneproof render showing real content).');
L.push('No still, no seal (Q3). Work in batches of 5–8; run `npm run gate` after each batch.');
L.push('');
L.push(`- Total linter types: **${TYPES.length}**`);
L.push(`- Manifested (offered by gen-prompt): **${MANIFEST_TYPES.length}**`);
L.push(`- Remaining (this matrix): **${remaining.length}**`);
const sealed = remaining.filter((t) => /SEALED|PASS/i.test(cell(t, 'still', '')));
L.push(`- Sealed so far: **${sealed.length}** · UNVIEWED: **${remaining.length - sealed.length}**`);
L.push('');
L.push('CLASS legend: EXISTS-pattern (reuse a parent type\'s notation) · VARIANT (reuse');
L.push('parent + variant note) · NEW-primitive (new schema) · BLOCKED (interface');
L.push('unreachable from types.ts — reason required).');
L.push('');
L.push('| Type | CLASS | INTERFACE_READ | ENTRY | GATE | STILL |');
L.push('|------|-------|----------------|-------|------|-------|');
for (const t of remaining) {
  L.push(`| \`${t}\` | ${cell(t, 'class', '—')} | ${cell(t, 'iface', 'UNVIEWED')} | ${cell(t, 'entry', 'UNVIEWED')} | ${cell(t, 'gate', 'UNVIEWED')} | ${cell(t, 'still', 'UNVIEWED')} |`);
}
L.push('');
L.push('## Already manifested (sealed in Sessions 4–6, offered by gen-prompt)');
L.push(MANIFEST_TYPES.map((t) => `\`${t}\``).join(' · '));
L.push('');
fs.writeFileSync(OUT, L.join('\n'));
console.log(`MANIFEST_MATRIX.md: ${remaining.length} remaining rows (${sealed.length} sealed), ${MANIFEST_TYPES.length} manifested.`);
