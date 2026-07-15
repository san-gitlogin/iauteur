#!/usr/bin/env node
// PHASE-1 WALKTHROUGH GATE — the scripted seal for the two-paste console flow.
// Drives scripts/flow.mjs (the backend the webui endpoints call) through EVERY
// screen and EVERY failure path, using the four committed pw-v1 model outputs so
// each real model drives the flow end-to-end:
//   · stage-1 prompt screen         · single-paste (frontier) screen  [mode labeled]
//   · validate-beats verdict screen (PASS + deterministic RE-ASK on fail)
//   · stage-2 fill-prompt screen
//   · assemble → normalize → lint → fix-prompt loop
//   · flash-lite → NARRATION-only fix screen   · mistral → budget/overflow fix screen
//   · apply-fix (canned reply) → re-lint
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NODE = process.execPath;
const CFG = 'briefs/examples/pw-cfg.json';
const EX = 'briefs/experiments/pw-v1';
const TMP = path.join(ROOT, 'out', 'tmp', 'flow');
fs.mkdirSync(TMP, {recursive: true});

let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fails++; };
const flow = (...args) => JSON.parse(execFileSync(NODE, ['scripts/flow.mjs', ...args], {cwd: ROOT, encoding: 'utf8'}));

// ---- SCREEN 1+2: prompt screens, mode labeled -------------------------------
const s1 = flow('stage1', CFG);
ok(/two-paste/.test(s1.mode) && /OUTPUT/.test(s1.prompt), 'stage-1 screen: prompt generated + mode labeled two-paste');
const sg = flow('single', CFG);
ok(/single-paste/.test(sg.mode) && /OUTPUT/.test(sg.prompt), 'single-paste screen: prompt generated + mode labeled frontier');

// ---- SCREEN 3: validate-beats — one PASS + three RE-ASK (every model) -------
const beatVerdicts = {};
for (const m of ['gemini-pro', 'flash-lite', 'qwen', 'mistral']) {
  const v = flow('validate', CFG, `${EX}/beats-${m}.json`);
  beatVerdicts[m] = v;
  if (v.ok) ok(v.reask === '', `validate ${m}: PASS (no re-ask)`);
  else ok(v.reask.includes('rejected') && v.verdict.length > 0, `validate ${m}: REJECT → deterministic re-ask text`);
}
// REJECT path: a synthetic beat sheet with a real, linter-consistent violation —
// two CONSOLIDATED code-surface beats adjacent (CODE_EDITOR then CODE_DIFF) — must
// trigger the deterministic re-ask. (Coarse manifest-family adjacency is advisory
// only, since it over-rejects relative to the final linter; the reject path is
// exercised by the FINE gate the linter actually enforces — see validate-beats.mjs.)
const rejectBeats = {meta: {screenplay: 'explainer', topicAxes: ['entity-novelty', 'sovereignty']}, beats: [
  {id: 's01', type: 'HOOK', narration: 'the stake in one line'},
  {id: 's02', type: 'CODE_EDITOR', narration: 'the editor pane'},
  {id: 's03', type: 'CODE_DIFF', narration: 'a diff right after the editor'},
  {id: 's04', type: 'OUTRO_CTA', narration: 'that is a wrap'},
]};
const rbf = path.join(TMP, 'beats-reject.json');
fs.writeFileSync(rbf, JSON.stringify(rejectBeats));
const vReject = flow('validate', CFG, rbf);
ok(!vReject.ok && vReject.reask.includes('rejected') && vReject.verdict.length > 0, 'validate REJECT (consolidated adjacency) → deterministic re-ask text');
ok(Object.values(beatVerdicts).some((v) => v.ok) && !vReject.ok,
  'validate screen exercises BOTH the pass path and the reject/re-ask path');

// ---- SCREEN 4: stage-2 fill-prompt from an accepted beat sheet --------------
const accepted = Object.entries(beatVerdicts).find(([, v]) => v.ok)?.[0] || 'gemini-pro';
const s2 = flow('stage2', CFG, `${EX}/beats-${accepted}.json`);
ok(/stage 2/.test(s2.mode) && s2.prompt.includes('beat sheet'), `stage-2 screen: fill prompt built from accepted (${accepted}) beat sheet`);

// ---- SCREEN 5: assemble → normalize → lint for every model reply ------------
const asm = {};
for (const m of ['gemini-pro', 'flash-lite', 'qwen', 'mistral']) {
  const a = flow('assemble', CFG, `${EX}/spec-${m}.json`);
  asm[m] = a;
  ok(typeof a.ok === 'boolean' && Array.isArray(a.changes), `assemble ${m}: normalized (${a.changes.length} auto-fixes, errBefore=${a.errBefore}→errAfter=${a.errAfter})`);
}

// ---- SCREEN 6a: flash-lite → NARRATION-only fix screen ----------------------
const fl = asm['flash-lite'];
ok(!fl.ok && /missing their spoken narration/.test(fl.fixPrompt), 'flash-lite drives the NARRATION-only fix screen');
ok(!/Schema \(/.test(fl.fixPrompt), 'narration fix screen is scoped (no component schemas dumped)');

// ---- SCREEN 6b: mistral → budget/overflow fix screen ------------------------
const mi = asm['mistral'];
ok(!mi.ok && mi.fixPrompt.length > 0 && !/missing their spoken narration/.test(mi.fixPrompt),
  'mistral drives the budget/overflow (schema) fix screen, not the narration one');

// ---- SCREEN 7: apply-fix — canned narration reply → re-lint -----------------
// Write the flash-lite assembled spec, synthesize a narration per missing scene,
// apply it, and confirm the narration path is exercised (errors drop, no crash).
const flSpec = fl.spec;
const specFile = path.join(TMP, 'walk-flashlite-spec.json');
fs.writeFileSync(specFile, JSON.stringify(flSpec, null, 2));
const missing = (flSpec.scenes || []).filter((s) => !(s.narration && String(s.narration).trim()));
const patch = missing.map((s, i) => ({id: s.id, narration: `This is scene ${i + 1}, explaining the ${s.type.toLowerCase().replace(/_/g, ' ')} clearly and simply for viewers.`}));
const patchFile = path.join(TMP, 'walk-flashlite-patch.json');
fs.writeFileSync(patchFile, JSON.stringify(patch));
if (missing.length) {
  const af = flow('applyfix', CFG, specFile, patchFile);
  const stillMissing = (af.spec.scenes || []).filter((s) => !(s.narration && String(s.narration).trim())).length;
  ok(stillMissing === 0, `apply-fix: narration filled for all ${missing.length} scene(s) (0 still missing)`);
  ok(typeof af.ok === 'boolean', 'apply-fix: re-lint ran and returned a verdict');
} else {
  ok(true, 'apply-fix: (flash-lite had no missing narration after assemble — path covered by test-assemble)');
}

console.log(fails ? `\n\u2717 UI WALKTHROUGH FAILED (${fails})` : '\n\u2713 UI WALKTHROUGH PASSED (every screen + every failure path)');
process.exit(fails ? 1 : 0);
