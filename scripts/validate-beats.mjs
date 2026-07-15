#!/usr/bin/env node
// BEAT-SHEET VALIDATOR — runs on the tiny Stage-1 artifact BEFORE Stage 2, so the
// structural laws are enforced cheaply on ~20 lines instead of across 3,000 output
// tokens. Same rules (and numbers) as the linter, applied to the plan.
// Usage: node scripts/validate-beats.mjs <beats.json>
import fs from 'node:fs';
import {MANIFEST, MANIFEST_TYPES} from './lib/manifest.mjs';
import {TOPIC_AXES, HOOK_MAX_WORDS, RESTRICTED_FAMILIES, FAMILY, CONSOLIDATED} from './lib/constants.mjs';
import {SCREENPLAYS} from './screenplays.mjs';

const file = process.argv[2];
if (!file) { console.error('Usage: node scripts/validate-beats.mjs <beats.json>'); process.exit(2); }
const raw = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const beats = raw.beats || raw;
const meta = raw.meta || {};
const errors = [], warns = [];
const E = (m) => errors.push(m), W = (m) => warns.push(m);
const familyOf = (t) => MANIFEST[t]?.family || t; // manifest is the R1-verified family source
// The linter's FINE-GRAINED shape-family (same FAMILY/CONSOLIDATED constants the
// linter's GATE 2 uses): two adjacent scenes of one CONSOLIDATED skeleton (e.g.
// two code-surfaces) read as monotony even across the coarse manifest family.
// Enforcing it HERE means the beat sheet is rejected pre-render for the SAME
// reason the linter would reject the assembled spec (no surprise at Stage 2).
const linterFamilyOf = (t) => FAMILY[t] || t;
const words = (s) => (s ?? '').trim().split(/\s+/).filter(Boolean).length;

if (!Array.isArray(beats) || !beats.length) E('no beats');
const n = beats.length;

if (beats[0] && beats[0].type !== 'HOOK') E('beat 1 must be HOOK');
const last = beats[n - 1]?.type;
if (last && !['OUTRO_CTA', 'RECAP'].includes(last)) E(`last beat is ${last}; must be OUTRO_CTA or RECAP`);

for (const b of beats) {
  if (!MANIFEST_TYPES.includes(b.type)) E(`${b.id || '?'}: type "${b.type}" is not in the offered palette (${MANIFEST_TYPES.length} types)`);
  if (!(b.narration || '').trim()) W(`${b.id || '?'}: empty narration`);
  if (b.type === 'HOOK' && words(b.narration) > HOOK_MAX_WORDS) E(`${b.id || 's01'}: HOOK narration ${words(b.narration)} words > ${HOOK_MAX_WORDS} (won't fit ≤8s)`);
}

for (let i = 1; i < n; i++) {
  // Coarse manifest-family adjacency is ADVISORY only: the FINAL linter enforces
  // just the fine CONSOLIDATED set (below), so erroring here would false-reject a
  // beat sheet the assembled spec would pass (e.g. CONCEPT_DIAGRAM then STEP_FLOW,
  // two visually-distinct diagram-category beats). Keep it as a nudge, not a gate.
  const fa = familyOf(beats[i].type);
  if (fa === familyOf(beats[i - 1].type) && RESTRICTED_FAMILIES.includes(fa))
    W(`beats ${i} and ${i + 1} are both ${fa}-family — varying the skeleton usually reads better (advisory; not enforced)`);
  // fine-grained: mirror the linter's CONSOLIDATED adjacency exactly (this IS a gate).
  const lfa = linterFamilyOf(beats[i].type);
  if (lfa === linterFamilyOf(beats[i - 1].type) && CONSOLIDATED.has(lfa))
    E(`consolidated-family adjacency: beats ${i} and ${i + 1} are both ${lfa} — the linter will reject this; reach for a different skeleton (see references/scene_library.md)`);
}

if (n >= 8) {
  const distinct = new Set(beats.map((b) => b.type)).size;
  const need = Math.min(8, Math.round(n * 0.5));
  if (distinct < need) E(`palette too narrow: ${distinct} distinct types across ${n} beats (need ≥${need})`);
  const counts = {};
  for (const b of beats) counts[b.type] = (counts[b.type] || 0) + 1;
  const cap = Math.max(4, Math.ceil(n * 0.35));
  for (const [t, c] of Object.entries(counts)) if (c > cap) E(`over-reliance: ${t} used ${c}× (>${cap} for ${n} beats)`);
}

const sp = SCREENPLAYS[meta.screenplay];
if (sp?.scenes && (n < sp.scenes[0] || n > sp.scenes[1])) W(`${n} beats — outside ${meta.screenplay} range ${sp.scenes[0]}–${sp.scenes[1]}`);
const axes = meta.topicAxes;
if (!Array.isArray(axes) || axes.length < 2) W('meta.topicAxes has <2 axes (pick ≥2: ' + TOPIC_AXES.join('/') + ')');
else for (const a of axes) if (!TOPIC_AXES.includes(a)) W(`topicAxes "${a}" unknown`);

for (const w of warns) console.log('⚠ ' + w);
if (errors.length) { for (const e of errors) console.log('✗ ' + e); console.log(`\n✗ BEAT SHEET REJECTED (${errors.length} error(s)) — fix before Stage 2.`); process.exit(1); }
console.log(`✓ BEAT SHEET OK (${n} beats${warns.length ? `, ${warns.length} warning(s)` : ''}) — proceed to Stage 2.`);
