#!/usr/bin/env node
// CASTING BOARD — kills one-shot component selection and its primacy bias.
// For EACH beat, mechanically scores ALL manifest types against the beat's
// intent and prints a candidate slate with channel-wide usage counts and
// NEVER-USED flags. Code does the retrieval, so a component's position in
// scene_library.md no longer decides whether it gets considered.
//
// Measured 2026-07-17: 81 of 137 types had NEVER been used; used types
// averaged doc-line 112 vs 167 for never-used ones. This script is the fix.
//
// Usage:
//   node scripts/cast.mjs <beats.json>          beats: [{id, intent}, …]
//   node scripts/cast.mjs topics/<slug>/long.json   (re-cast an existing spec:
//       each scene's narration becomes the beat intent — audit mode)
//
// Output: a per-beat slate (top intent matches + one best per family +
// long-tail spotlights). The director MUST pick from the slate per beat and
// state the reason before writing any scene JSON.
import fs from 'node:fs';
import {MANIFEST} from './lib/manifest.mjs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/cast.mjs <beats.json | topics/<slug>/long.json>');
  process.exit(2);
}

// ---- channel-wide usage ledger (every topic ever shipped) ----
const usage = {};
for (const d of fs.existsSync('topics') ? fs.readdirSync('topics') : []) {
  for (const f of ['long.json', 'shorts.json']) {
    const p = `topics/${d}/${f}`;
    if (!fs.existsSync(p)) continue;
    try {
      for (const sc of JSON.parse(fs.readFileSync(p, 'utf8')).scenes ?? [])
        usage[sc.type] = (usage[sc.type] || 0) + 1;
    } catch { /* stub specs */ }
  }
}

// ---- beats ----
const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const beats = Array.isArray(raw)
  ? raw
  : (raw.scenes ?? []).map((s) => ({id: s.id, intent: s.narration ?? '', current: s.type}));
if (!beats.length) { console.error('No beats found.'); process.exit(1); }

const STOP = new Set('a an the of to in on for with and or is are was were be it its this that as at by from into over under one two three'.split(' '));
// Bridge narration vocabulary to component vocabulary (a beat says "dollars",
// the component says "cost") — without this the purpose-built match is missed.
const SYN = {
  dollars: 'cost', dollar: 'cost', priced: 'cost', pricing: 'cost', price: 'cost', bill: 'cost', cheap: 'cost', expensive: 'cost', paid: 'cost',
  benchmark: 'eval', benchmarks: 'eval', scored: 'eval', score: 'eval', scores: 'eval', leaderboard: 'eval', arena: 'eval', tested: 'eval', testing: 'eval',
  parameters: 'model', weights: 'model', experts: 'mixture', codebase: 'code', announcement: 'screenshot', announced: 'timeline', launch: 'timeline',
  fast: 'latency', slow: 'latency', memory: 'ram', money: 'cost', percent: 'share', market: 'ticker', stock: 'ticker', download: 'release',
};
const tok = (s) => {
  const base = (s ?? '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
  return [...new Set([...base, ...base.map((w) => SYN[w]).filter(Boolean)])];
};

const entries = Object.entries(MANIFEST).map(([type, m]) => ({
  type,
  family: m.family ?? m.category ?? '—',
  useWhen: m.use_when ?? '',
  bag: new Set([...tok(type.replace(/_/g, ' ')), ...tok(m.purpose), ...tok(m.use_when)]),
  used: usage[type] || 0,
}));

const score = (intentToks, e) => {
  let s = 0;
  for (const w of intentToks) {
    if (e.bag.has(w)) s += 2;
    else for (const b of e.bag) if (b.startsWith(w) || w.startsWith(b)) { s += 1; break; }
  }
  return s;
};

const fmt = (e, sc) => `${e.type}${e.used ? ` (used ×${e.used})` : ' ★NEVER-USED'}${sc !== undefined ? ` [match ${sc}]` : ''} — ${e.useWhen.slice(0, 90)}`;

console.log(`\nCASTING BOARD · ${beats.length} beat(s) · library ${entries.length} types · ${entries.filter((e) => !e.used).length} never used on this channel`);
console.log('Rule: pick per beat, state the reason, prefer the purpose-built shape; ≥2 honest ★NEVER-USED picks per video.\n');

for (const b of beats) {
  const it = tok(b.intent);
  const ranked = entries.map((e) => ({e, s: score(it, e)})).sort((a, b2) => b2.s - a.s || a.e.used - b2.e.used);
  const top = ranked.filter((r) => r.s > 0).slice(0, 8);
  // best unused match beyond the top slate = the long-tail spotlight
  const spot = ranked.filter((r) => r.s > 0 && !r.e.used && !top.includes(r)).slice(0, 3);
  console.log('─'.repeat(78));
  console.log(`▎ ${b.id}${b.current ? `  (currently: ${b.current})` : ''}`);
  console.log(`  intent: ${(b.intent ?? '').slice(0, 110)}`);
  for (const r of top) console.log(`    • ${fmt(r.e, r.s)}`);
  if (spot.length) {
    console.log('    long-tail spotlights:');
    for (const r of spot) console.log(`    ☆ ${fmt(r.e, r.s)}`);
  }
}
console.log('─'.repeat(78));
console.log('\nMost-worn types on this channel (avoid unless truly the best shape):');
console.log('  ' + Object.entries(usage).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([t, c]) => `${t}×${c}`).join(' · '));
