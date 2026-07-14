#!/usr/bin/env node
// MANIFEST ANTI-DRIFT gate. The manifest is a third copy of the truth; this stops
// it rotting. For every manifest entry, verify each declared field name actually
// exists in the matching src/types.ts interface:
//   - data_root types → fields must be properties of `SceneData`,
//   - data_key types  → fields must be properties of the interface SceneData maps
//     that key to (e.g. flip → FlipData).
// Object-typed fields (person/center/left/right/front/back) resolve against a
// global union of every property name in types.ts as a fallback. Unresolvable
// entries are LISTED, never silently skipped. Part of `npm run gate`.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {MANIFEST} from './lib/manifest.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'src', 'types.ts'), 'utf8');

// property names per interface + a global union
const ifaceProps = {};
const globalProps = new Set();
const re = /export interface (\w+)\s*{([\s\S]*?)\n}/g;
let m;
while ((m = re.exec(src))) {
  const name = m[1];
  const props = new Set();
  for (const pm of m[2].matchAll(/^\s*(\w+)\??:/gm)) { props.add(pm[1]); globalProps.add(pm[1]); }
  ifaceProps[name] = props;
}
// SceneData: map a nested key → its interface name (e.g. `flip?: FlipData`)
const keyIface = {};
if (ifaceProps.SceneData) {
  for (const km of (src.match(/export interface SceneData \{[\s\S]*?\n\}/)?.[0] || '').matchAll(/^\s*(\w+)\??:\s*([A-Za-z0-9_]+)/gm))
    keyIface[km[1]] = km[2];
}

const misses = [];
let checked = 0;
for (const [type, man] of Object.entries(MANIFEST)) {
  const targetIface = man.data_key ? (keyIface[man.data_key] || null) : 'SceneData';
  const props = targetIface ? ifaceProps[targetIface] : null;
  for (const field of Object.keys(man.fields || {})) {
    checked++;
    const inTarget = props && props.has(field);
    const inGlobal = globalProps.has(field);
    if (!inTarget && !inGlobal)
      misses.push(`${type}.${field} — not found in ${targetIface || 'unresolved(' + man.data_key + ')'} nor anywhere in types.ts`);
    else if (!inTarget && inGlobal && targetIface)
      misses.push(`${type}.${field} — not in ${targetIface} (found elsewhere; verify mapping)`, );
  }
  if (man.data_key && !targetIface) misses.push(`${type} — data_key "${man.data_key}" has no matching SceneData interface mapping`);
}

console.log(`MANIFEST CHECK: ${Object.keys(MANIFEST).length} types, ${checked} field(s) verified against src/types.ts.`);
if (misses.length) { console.log('\n✗ DRIFT / UNRESOLVED:'); for (const l of misses) console.log('  • ' + l); console.log('\n✗ MANIFEST GATE FAILED'); process.exit(1); }
console.log('✓ MANIFEST GATE PASSED (every declared field exists in types.ts)');
