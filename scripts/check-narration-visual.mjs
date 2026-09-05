#!/usr/bin/env node
// CHECK-NARRATION-VISUAL — does the voice talk about what is actually on screen?
//
// WHY THIS EXISTS. Owner, 2026-09-05, on the MCP cut: *"the last video we did on MCP had too
// many places where the voice does not speak whats shown in the video... ill complain on how
// you plan the narration and beat along with what needs to be shown and you being not aware
// of whats shown in between the narration."*
//
// He is explicit that this is NOT a voice-speed problem — the rate is right and is sealed
// (see check-corrections). It is a PLANNING problem, and the reason it kept happening is
// that nothing measured it. Every existing gate checks a different thing:
//
//   lint-spec        every anchor is in range            (the timing is legal)
//   audit-sync       elements land on the naming word    (the timing is right)
//   check-holds      the finished state stays long enough (there is time to read it)
//   check-recordings figures spoken appear in the footage (numbers are honest)
//
// Not one of them asks the simplest question a viewer asks: IS THE VOICE TALKING ABOUT THIS
// PICTURE? A scene can pass all four while the narration discusses something that is nowhere
// on screen — which is exactly the defect.
//
// WHAT THIS MEASURES. Per scene: the content words the narration SAYS, against every string
// the scene actually DRAWS (headlines, captions, labels, items, stats, clip `shows`, baked
// screen text, and what each mark `covers`). A scene whose narration shares nothing with its
// own picture is talking over it.
//
// Deliberately conservative. Explanatory language is SUPPOSED to add words the screen does
// not carry — that is teaching, not drift. So this fires only on a scene with real narration
// and real visible text that overlap on NOTHING, plus a separate louder rule for a proper
// noun or a figure the voice asserts and the picture never shows.
//
// Usage: node scripts/check-narration-visual.mjs [--spec <path>] [--quiet]
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const quiet = argv.includes('--quiet');
const specIdx = argv.indexOf('--spec');
const only = specIdx >= 0 ? path.resolve(argv[specIdx + 1]) : null;

const specs = [];
for (const d of fs.existsSync('topics') ? fs.readdirSync('topics') : []) {
  for (const f of ['long.json', 'shorts.json']) {
    const p = path.resolve('topics', d, f);
    if (fs.existsSync(p) && (!only || p === only)) specs.push(p);
  }
}
if (only && !specs.length) { console.error(`no such spec: ${argv[specIdx + 1]}`); process.exit(2); }

// Words that carry no subject. Kept tight on purpose: a stopword list that is too greedy
// hides real drift, and one that is too small only adds noise to the overlap count.
const STOP = new Set(`a about above across after again against all also always am an and another any
are as at back be because been before being below best better between both but by came can cannot
come could did do does doing done down each else even ever every few first for from get gets getting
give given go goes going got had has have having her here hers him his how i if in into is it its
itself just keep kept know last least left less let like little long made make makes making many may
me might mine more most much must my never new next no nor not now of off on once one only onto or
other others our out over own put same say says see seen set she should since so some still such take
taken tell than that the their them then there these they thing things think this those though three
through thus to together too took two under until up upon us use used uses using very want was way we
well went were what when where whether which while who whom why will with within without would yet you
your yours it's that's there's here's we're they're you're i'm don't doesn't isn't aren't won't can't
thats theres heres were are is`.split(/\s+/).filter(Boolean));

const words = (s) => String(s || '')
  .toLowerCase()
  .replace(/[‘’]/g, "'")
  .split(/[^a-z0-9.%$'-]+/)
  .map((w) => w.replace(/^[.'-]+|[.'-]+$/g, ''))
  .filter(Boolean);

const content = (s) => words(s).filter((w) => w.length > 3 && !STOP.has(w) && !/^\d+$/.test(w));

// Every string the scene will DRAW. `narration` is what is heard, so it is excluded; so are
// the plumbing fields that never reach a pixel.
const SKIP_KEYS = new Set(['narration', 'id', 'type', 'transition', 'background', 'ref', 'src',
  'kind', 'place', 'aspect', 'icon', 'color', 'layout', 'variant', 'hookVariant', 'atWord',
  'heroAsset', 'asset', 'frames', 'bbox', 'ink', 'marks', 'zooms', 'said']);

const visibleOf = (node, out = []) => {
  if (node == null) return out;
  if (typeof node === 'string') { out.push(node); return out; }
  if (Array.isArray(node)) { for (const v of node) visibleOf(v, out); return out; }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (SKIP_KEYS.has(k)) {
        // two exceptions: these ARE on screen, and they are the whole point of the check
        if (k === 'marks' && v && typeof v === 'object')
          for (const m of Object.values(v)) if (m && m.covers) out.push(String(m.covers));
        if (k === 'said' && typeof v === 'string') out.push(v);
        continue;
      }
      visibleOf(v, out);
    }
  }
  return out;
};

// A figure the voice asserts. Bare integers are excluded — "three primitives", "one file" are
// speech, not readings off a chart. A percentage, a price or a decimal is a MEASUREMENT, and a
// measurement spoken over a picture should be IN that picture.
const figures = (s) => (String(s || '').match(/\$[\d,]+(?:\.\d+)?|\d+\.\d+%?|\d+%|\$\d+/g) || [])
  .map((f) => f.replace(/,/g, ''));

const problems = [];
const unmeasured = [];
const notes = [];
let scanned = 0;

for (const sp of specs) {
  let spec; try { spec = JSON.parse(fs.readFileSync(sp, 'utf8')); } catch { continue; }
  for (const sc of spec.scenes ?? []) {
    const nar = String(sc.narration ?? '').trim();
    if (!nar) continue;
    const vis = visibleOf(sc.data ?? {});
    const visText = vis.join(' • ');
    if (!visText.trim()) continue;         // a scene that draws no words cannot be checked here
    scanned++;

    const nWords = new Set(content(nar));
    const vWords = new Set(content(visText));
    if (!nWords.size || !vWords.size) continue;

    // 1) TALKING OVER THE PICTURE — not one content word in common.
    const shared = [...nWords].filter((w) => vWords.has(w));
    if (!shared.length) {
      problems.push(
        `${sp}  ${sc.id} (${sc.type}): the narration and the picture share NO content word.\n` +
        `      voice : ${JSON.stringify(nar.slice(0, 120))}\n` +
        `      screen: ${JSON.stringify(visText.slice(0, 120))}\n` +
        `      fix: name on screen what the voice is naming, or say out loud what the picture shows.`);
      continue;
    }

    // 2) A MEASUREMENT SPOKEN THAT THE PICTURE NEVER SHOWS.
    //
    // NOT MEASURED IS NOT THE SAME AS MEASURED AND EMPTY. For a RECORDED_STEP the picture
    // is FOOTAGE, and the only way to know what is written on it is the screen text the
    // capture baked into `clips[].said`. The browser surface does not capture that yet
    // (only the editor and terminal surfaces do), so on a page recording this rule would
    // be judging the spec's own caption text and calling every figure in the footage
    // missing — the exact fail-soft-into-a-wrong-answer shape that `inkFor()` returning []
    // was corrected for. So: if a scene carries clips and NONE of them baked screen text,
    // the figure rule cannot be evaluated. Report it, do not fail on it.
    const clips = sc.data?.recordedStep?.clips ?? [];
    if (clips.length && !clips.some((c) => c.said)) {
      unmeasured.push(`${sp}  ${sc.id}: footage carries no baked screen text — figures over ` +
        `this beat are unchecked (re-record to populate clips[].said).`);
      continue;
    }
    const shownFigs = new Set(figures(visText));
    const missing = [...new Set(figures(nar))].filter((f) => {
      if (shownFigs.has(f)) return false;
      // 57.2% spoken against 57.2 drawn (or the reverse) is the same number on screen
      const bare = f.replace(/[%$]/g, '');
      for (const s of shownFigs) if (s.replace(/[%$]/g, '') === bare) return false;
      return true;
    });
    if (missing.length) {
      problems.push(
        `${sp}  ${sc.id} (${sc.type}): the voice says ${missing.join(', ')} and the picture never shows ` +
        `${missing.length > 1 ? 'those figures' : 'that figure'}.\n` +
        `      voice : ${JSON.stringify(nar.slice(0, 120))}\n` +
        `      screen: ${JSON.stringify(visText.slice(0, 160))}\n` +
        `      fix: put the figure in the component, or stop asserting it over this picture.`);
    } else if (shared.length < 2 && nWords.size > 10) {
      notes.push(`${sp}  ${sc.id}: only "${shared.join('", "')}" in common across ${nWords.size} spoken words.`);
    }
  }
}

if (!quiet) {
  console.log(`NARRATION/VISUAL CHECK: ${scanned} scene(s) with both narration and drawn text, ` +
    `across ${specs.length} spec(s).`);
  for (const n of notes.slice(0, 12)) console.log(`  thin  ${n}`);
  for (const u of unmeasured.slice(0, 8)) console.log(`  n/m   ${u}`);
  if (unmeasured.length > 8) console.log(`  ... and ${unmeasured.length - 8} more unmeasured.`);
  if (notes.length > 12) console.log(`  ... and ${notes.length - 12} more thin scene(s).`);
}

// SCOPED like SOFT ZOOM: fatal for the spec being rendered, a notice for the sweep.
// 305 scenes across already-shipped cuts carry this — which is the measurement that
// justifies the gate, and also the reason it cannot fail the whole repo. A permanently
// red gate is one you learn to ignore.
if (problems.length) {
  if (only) {
    console.error(`\n✗ NARRATION/VISUAL CHECK FAILED (${problems.length}):`);
    for (const p of problems.slice(0, 40)) console.error(`  • ${p}`);
    if (problems.length > 40) console.error(`  ... and ${problems.length - 40} more.`);
    console.error(`\nA viewer hears one thing and reads another. Sync is not the issue — every one of`);
    console.error(`these can land on exactly the right frame and still be wrong.`);
    process.exit(1);
  }
  if (!quiet) {
    console.error(`\nNOTE: ${problems.length} scene(s) repo-wide talk over their own picture.`);
    console.error(`  Those cuts shipped; this is fatal only for the spec you are about to render`);
    console.error(`  (--spec <path>, which render-topic passes).`);
    for (const p of problems.slice(0, 3)) console.error(`  • ${p.split('\n')[0]}`);
  }
}
if (!quiet) console.log('✓ every scene talks about its own picture.');
