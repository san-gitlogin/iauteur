#!/usr/bin/env node
// COMPONENT CRITIC — a design review for every scene in a spec. Complements the
// linter (which enforces hard budgets); this reports the QUALITATIVE dimensions:
// why a component was chosen, how it displays, wide vs vertical, dark/light
// colour, fonts, motion, the ASSETS it uses and WHERE they come from, alignment,
// and how each scene sits next to its neighbours.
//
// Usage:
//   node scripts/critique.mjs topics/<slug>/long.json
//   node scripts/critique.mjs            (critiques gallery + every topic)

import fs from 'node:fs';
import path from 'node:path';
import {CATALOG, RVE_81, classifyAsset, rveSummary} from './catalog.mjs';
import {SCREENPLAYS, inferScreenplay} from './screenplays.mjs';

const IMG_DIR = 'public/assets';
const bar = (s = 74) => '─'.repeat(s);
const words = (s) => (s ?? '').trim().split(/\s+/).filter(Boolean).length;

// recursively collect every asset-looking string in an object
const collectAssets = (obj, out = []) => {
  if (typeof obj === 'string') {
    const c = classifyAsset(obj);
    if (c) out.push({raw: obj, ...c});
  } else if (obj && typeof obj === 'object') {
    for (const v of Object.values(obj)) collectAssets(v, out);
  }
  return out;
};
const countAnchors = (obj, n = 0) => {
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'atWord' && typeof v === 'number') n++;
      else n = countAnchors(v, n);
    }
  }
  return n;
};

function critiqueScene(scene, prev, next, brand) {
  const cat = CATALOG[scene.type];
  const lines = [];
  const warns = [];
  const d = scene.data ?? {};
  const push = (label, text) => lines.push(`  ${label.padEnd(11)}: ${text}`);

  lines.push(`${bar()}`);
  const head = d.headline ?? d.title ?? d.heading ?? d.message ?? d.code?.filename ?? '';
  lines.push(`▎ ${scene.id} · ${scene.type}${head ? `  “${String(head).replace(/[[\]]/g, '')}”` : ''}`);

  if (!cat) {
    warns.push('unknown type — no catalog entry');
    push('Verdict', '⚠ UNKNOWN TYPE — add it to scripts/catalog.mjs');
    return {lines, warns};
  }

  push('Context', `${cat.purpose}  (use when: ${cat.useWhen})`);
  push('Display', cat.layout);
  push('Aspect', `wide → ${cat.aspect.wide}  |  vertical → ${cat.aspect.vertical}`);
  push('Colour', cat.color);
  push('Fonts', cat.fonts);
  push('Motion', cat.motion);

  // assets + their source
  const assets = collectAssets(scene.type === 'CHANNEL_CARD' && brand?.logo ? {...d, _logo: brand.logo} : d);
  if (assets.length) {
    for (const a of assets) {
      let extra = '';
      if (a.prefix === 'img:') {
        const exists = fs.existsSync(path.join(IMG_DIR, a.name));
        extra = exists ? '  [file present ✓]' : '  [MISSING FILE ✗ — linter will block]';
        if (!exists) warns.push(`asset ${a.raw} missing in ${IMG_DIR}/`);
      }
      push('Asset', `${a.raw}${extra}\n               ↳ ${a.source}`);
    }
  } else {
    const slotNote = cat.assets?.slots?.length
      ? `optional slot(s): ${cat.assets.slots.map((s) => s.path).join(', ')} — ${cat.assets.note}`
      : 'none required.';
    push('Assets', slotNote);
  }

  // alignment / overlay heuristics
  const alignNotes = [];
  if (scene.type === 'CODE_WINDOW' && d.headline) alignNotes.push('headline set but CODE_WINDOW ignores it (window is the focus) — move copy into narration');
  if (scene.type === 'QUOTE_SPOTLIGHT' && d.person && !d.person.asset) alignNotes.push('person has no photo — renders name/role only (fine, but a face lifts trust)');
  if ((scene.type === 'TIMELINE') && (d.timeline?.milestones?.length ?? 0) >= 5) alignNotes.push('5 milestones is the max — on vertical they stack tall; confirm no crowding');
  if ((scene.type === 'DONUT') && (d.donut?.segments?.length ?? 0) > 5) alignNotes.push('>5 donut segments get thin — legend readability drops on vertical');
  push('Align', alignNotes.length ? alignNotes.join('; ') : 'headline top · content centred · source bottom — no edge collisions.');

  // anchors vs narration
  const anchors = countAnchors(d);
  const wc = words(scene.narration);
  push('Timing', `${anchors} anchored element(s) · narration ${wc} words · ${scene.durationFrames}f (~${(scene.durationFrames / 30).toFixed(1)}s)`);

  // neighbours / continuity
  const nb = [];
  if (prev) {
    nb.push(`prev ${prev.type}${prev.type === scene.type ? ' ⚠ SAME TYPE twice in a row (repetition)' : ' ✓'}`);
    const pc = CATALOG[prev.type]?.category, cc = cat.category;
    if (pc && cc && pc === cc && ['chart', 'data'].includes(cc)) nb.push('⚠ two data/chart scenes back-to-back — vary the widget between them');
    if (prev.type === scene.type) warns.push(`${scene.id}: same type as previous (${scene.type})`);
  } else {
    nb.push(scene.type === 'HOOK' ? 'opens the video ✓ (HOOK)' : '⚠ first scene is not HOOK');
    if (scene.type !== 'HOOK') warns.push('first scene must be HOOK');
  }
  if (next) nb.push(`next ${next.type} ✓`);
  else nb.push(['OUTRO_CTA', 'RECAP'].includes(scene.type) ? 'closes the video ✓' : `⚠ last scene is ${scene.type} (expected OUTRO_CTA/RECAP)`);
  push('Neighbours', nb.join('  ·  '));

  push('Verdict', warns.length ? `⚠ NEEDS REVIEW (${warns.length})` : '✓ ACCEPTABLE');
  return {lines, warns};
}

function critiqueSpec(file) {
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
  const scenes = spec.scenes ?? [];
  console.log(`\n╔${'═'.repeat(76)}`);
  console.log(`║ CRITIQUE · ${file}`);
  console.log(`║ ${spec.meta?.topic ?? ''}`.slice(0, 78));
  console.log(`║ theme=${spec.brand?.theme ?? '—'} light=${spec.brand?.themeLight ?? 'daylight'} design=${spec.brand?.design ?? '—'} bg=${spec.brand?.background ?? 'theme default'}`);
  console.log(`╚${'═'.repeat(76)}`);

  // screenplay overview
  const order = scenes.map((s) => s.type);
  console.log(`\n  SCREENPLAY: ${order.join(' → ')}`);
  const dupes = order.filter((t, i) => i > 0 && order[i - 1] === t);
  if (dupes.length) console.log(`  ⚠ consecutive repeats: ${[...new Set(dupes)].join(', ')}`);
  const cats = scenes.map((s) => CATALOG[s.type]?.category ?? '?');
  console.log(`  RHYTHM: ${cats.join(' · ')}`);

  // shape-family monotony guard (what let 12 box+arrow flows slip through before)
  const BOXFLOW = ['CONCEPT_DIAGRAM', 'STEP_FLOW', 'SPLIT_PATHS'];
  const boxCount = order.filter((t) => BOXFLOW.includes(t)).length;
  const boxCap = Math.max(2, Math.round(scenes.length * 0.22));
  if (boxCount > boxCap)
    console.log(`  ⚠ SHAPE MONOTONY: ${boxCount} box+arrow flow scenes (>~${boxCap}) — swap some for DIAGRAM (sequence/tree/block/hub), KINETIC_TEXT, PHOTO, REVEAL, or a chart.`);
  const DYNAMIC = ['DIAGRAM', 'KINETIC_TEXT', 'PHOTO', 'REVEAL', 'SOUND_WAVE', 'LOGO_REVEAL'];
  if (scenes.length > 12 && !order.some((t) => DYNAMIC.includes(t)))
    console.log(`  ⚠ VISUAL VARIETY: long video with none of DIAGRAM/KINETIC_TEXT/PHOTO/REVEAL/SOUND_WAVE — add dynamic/visual moments so it isn't all boxes, lists and numbers.`);

  // screenplay preset detection + adherence
  const declared = spec.meta?.screenplay;
  const preset = declared && SCREENPLAYS[declared] ? declared : inferScreenplay(order);
  const sp = SCREENPLAYS[preset];
  console.log(`  PRESET: ${preset}${declared ? '' : ' (inferred — set meta.screenplay to lock it)'} — ${sp.purpose}`);
  console.log(`  ARC:    ${sp.arc}`);
  const spIssues = [];
  if (order[0] !== sp.open) spIssues.push(`opens with ${order[0]}, preset wants ${sp.open}`);
  if (!sp.close.includes(order[order.length - 1])) spIssues.push(`closes with ${order[order.length - 1]}, preset wants ${sp.close.join('/')}`);
  for (const r of sp.required) if (!order.includes(r)) spIssues.push(`missing required ${r}`);
  if (scenes.length < sp.scenes[0] || scenes.length > sp.scenes[1]) spIssues.push(`${scenes.length} scenes (preset range ${sp.scenes[0]}-${sp.scenes[1]})`);
  console.log(spIssues.length ? `  ADHERENCE: ⚠ ${spIssues.join('; ')}` : `  ADHERENCE: ✓ matches ${preset}`);
  console.log(`  PACING: ${sp.pacing}  ·  transitions: ${sp.transitions.join('/')}  ·  bg: ${sp.backgrounds.join('/')}`);

  let allWarns = 0;
  scenes.forEach((s, i) => {
    const {lines, warns} = critiqueScene(s, scenes[i - 1], scenes[i + 1], spec.brand);
    console.log('\n' + lines.join('\n'));
    allWarns += warns.length;
  });

  console.log(`\n${bar()}`);
  console.log(allWarns ? `  ⚠ ${allWarns} item(s) to review in ${file}` : `  ✓ all scenes acceptable — ${file}`);
  return allWarns;
}

// ---- main ----
const arg = process.argv[2];
let files;
if (arg) files = [arg];
else {
  files = ['specs/gallery.json'];
  const tdir = 'topics';
  if (fs.existsSync(tdir)) {
    for (const slug of fs.readdirSync(tdir)) {
      for (const f of ['long.json', 'shorts.json']) {
        const p = path.join(tdir, slug, f);
        if (fs.existsSync(p)) files.push(p);
      }
    }
  }
}

const {total, counts} = rveSummary();
console.log(`\n81-TEMPLATE COVERAGE (RVE library): ${total} considered`);
console.log(`  ${Object.entries(counts).map(([k, v]) => `${k}:${v}`).join('  ')}`);
console.log(`  (core/added/motion = usable now · planned = approved next · deferred = off-grammar, reasoned)`);

let totalWarns = 0;
for (const f of files) {
  if (!fs.existsSync(f)) { console.log(`\n(skip ${f} — not found)`); continue; }
  totalWarns += critiqueSpec(f);
}
console.log(`\n${totalWarns ? `Done — ${totalWarns} review item(s) across ${files.length} spec(s).` : `Done — clean across ${files.length} spec(s).`}\n`);
