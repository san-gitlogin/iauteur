#!/usr/bin/env node
// VIZ-KIND SEAL — every depiction kind a scene asks for must exist in a registry.
//
// Why (2026-08-21): the three viz dispatchers each substituted a real picture for an
// unknown kind — `?? FileContent`, `?? SignalMatch`, `?? ControlBoard`. A one-character
// typo therefore produced a confidently-drawn WRONG picture that passed tsc (it is just a
// string), passed the linter (the kind is chosen inside the scene component, never in the
// spec), rendered successfully, and appeared on a contact sheet as *a* picture. Only
// someone who already knew what that beat should look like would catch it.
//
// `src/unknownKind.tsx` makes it loud at render time. This makes it fail BEFORE a render,
// which is the cheap place: a render is hours, this is milliseconds.
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'src';
const SCENES = path.join(SRC, 'scenes');

// Registries, in the form `const NAME: Record<string, ...> = { 'kind': Comp, ... }`.
const REGISTRIES = [
  { file: 'src/linuxViz.tsx', start: 'const REGISTRY', label: 'linuxViz REGISTRY' },
  { file: 'src/dsaViz.tsx', start: 'const VIZ', label: 'dsaViz VIZ' },
  { file: 'src/mcpViz.tsx', start: 'const MCP_VIZ', label: 'mcpViz MCP_VIZ' },
];

const known = new Map(); // kind -> registry label
for (const r of REGISTRIES) {
  if (!fs.existsSync(r.file)) { console.error(`✗ missing registry file ${r.file}`); process.exit(1); }
  const src = fs.readFileSync(r.file, 'utf8');
  const i = src.indexOf(r.start);
  if (i < 0) { console.error(`✗ ${r.file}: could not find "${r.start}" — did the registry get renamed?`); process.exit(1); }
  // The object literal ends at the first line that is exactly "};"
  const rest = src.slice(i);
  const end = rest.indexOf('\n};');
  const body = rest.slice(0, end < 0 ? 4000 : end);
  for (const m of body.matchAll(/'([a-z0-9-]+)'\s*:/g)) known.set(m[1], r.label);
}

// Every kind any scene component asks for. Two literal spellings are in use —
// `kind="net-path"` (30 sites) and `kind={"net-path"}` (110 sites). An earlier version of
// this seal matched only the first, reported a confident green tick, and did NOT catch a
// deliberately introduced typo. It was verified by breaking a real file on purpose; that
// is the only reason the gap was found, and it is why the self-test below is not optional.
const LITERAL = /kind=\{?\s*["']([a-z0-9-]+)["']\s*\}?/g;
// `kind={d.vizKind}` — resolved from spec data at runtime, so it cannot be checked here.
// UnknownKind covers these at render time, loudly.
const DYNAMIC = /kind=\{\s*[A-Za-z_$][\w$.]*\s*\}/g;

const asked = new Map(); // kind -> [files]
let dynamic = 0;
for (const f of fs.readdirSync(SCENES)) {
  if (!/\.tsx?$/.test(f)) continue;
  const t = fs.readFileSync(path.join(SCENES, f), 'utf8');
  for (const m of t.matchAll(LITERAL)) {
    if (!asked.has(m[1])) asked.set(m[1], []);
    asked.get(m[1]).push(f);
  }
  dynamic += [...t.matchAll(DYNAMIC)].length;
}

const missing = [...asked.entries()].filter(([k]) => !known.has(k));
const orphan = [...known.keys()].filter((k) => !asked.has(k));

if (missing.length) {
  console.error(`\n✗ VIZ-KIND SEAL — ${missing.length} kind(s) asked for but registered nowhere\n`);
  for (const [k, files] of missing) {
    const near = [...known.keys()]
      .map((c) => [c, [...c].filter((ch, i) => k[i] === ch).length])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([c]) => c);
    console.error(`  '${k}'  used by ${files.join(', ')}`);
    console.error(`         closest registered: ${near.join(', ')}`);
  }
  console.error(`\nThese would render as UNKNOWN DEPICTION KIND. Register the kind, or fix the name.\n`);
  process.exit(1);
}

// SELF-TEST: prove the extraction still works, rather than trusting a green tick.
// This seal shipped once reporting success while blind to the dominant call spelling.
{
  const probes = ['kind="probe-a"', 'kind={"probe-b"}', "kind={'probe-c'}"];
  const found = probes.flatMap((p) => [...p.matchAll(new RegExp(LITERAL.source, 'g'))].map((m) => m[1]));
  const want = ['probe-a', 'probe-b', 'probe-c'];
  if (want.some((w) => !found.includes(w))) {
    console.error(`✗ VIZ-KIND SEAL is BLIND — its own extractor missed ${want.filter((w) => !found.includes(w)).join(', ')}`);
    console.error(`  A green tick from this script would be meaningless. Fix LITERAL before trusting it.`);
    process.exit(1);
  }
}

console.log(`✓ VIZ-KIND SEAL — ${asked.size} literal kind(s) asked for, all registered across ${REGISTRIES.length} registries `
  + `(${known.size} registered, ${orphan.length} unused, ${dynamic} resolved from spec data at runtime)`);
