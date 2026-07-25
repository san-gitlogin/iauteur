#!/usr/bin/env node
// TWO-PASTE FLOW DRIVER — the ONE backend the console UI calls, and the surface
// the Phase-1 walkthrough seals. Every subcommand emits ONE JSON object on stdout.
// The heavy lifting lives in already-tested modules (gen-prompt, validate-beats,
// assemble, normalize-spec, lint-spec, gen-fix-prompt); this wires them into the
// screen-by-screen flow with deterministic re-ask / fix text.
//
//   flow.mjs stage1   <cfg.json>                 → { mode, prompt }
//   flow.mjs single   <cfg.json>                 → { mode, prompt }
//   flow.mjs validate <cfg.json> <beats.json>    → { ok, verdict, reask, beats }
//   flow.mjs stage2   <cfg.json> <beats.json>    → { mode, prompt }
//   flow.mjs assemble <cfg.json> <reply.json>    → { ok, firstTry, spec, changes, warnings, lint, fixPrompt }
//   flow.mjs applyfix <cfg.json> <spec.json> <patch.json> → { ok, lint, spec, fixPrompt }
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {assembleSpec} from './lib/assemble.mjs';
import {normalizeSpec} from './lib/normalize-spec.mjs';
import {MANIFEST_TYPES} from './lib/manifest.mjs';
import {BUDGET, HOOK_MAX_WORDS, TRANSITIONS, FPS, FPW, HOOK_MAX_FRAMES} from './lib/constants.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NODE = process.execPath;
const TMP = path.join(ROOT, 'out', 'tmp', 'flow');
fs.mkdirSync(TMP, {recursive: true});

const readJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, ''));
const slugify = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'topic';
const emit = (o) => { process.stdout.write(JSON.stringify(o)); };

function gen(cfgFile, mode, beatsFile) {
  return execFileSync(NODE, ['scripts/gen-prompt.mjs', cfgFile, mode, ...(beatsFile ? [beatsFile] : [])], {cwd: ROOT, encoding: 'utf8'});
}
function run(script, args) {
  try { return {code: 0, out: execFileSync(NODE, [script, ...args], {cwd: ROOT, encoding: 'utf8'})}; }
  catch (e) { return {code: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '')}; }
}
const lint = (f) => run('scripts/lint-spec.mjs', [f]);
const errCount = (out) => Number((out.match(/REJECTED \((\d+)/) || [, '0'])[1]);

const [cmd, cfgArg, arg2, arg3] = process.argv.slice(2);
if (cmd === 'budgets') {   // for the console's per-scene meters (single source: constants.mjs)
  // fps/fpw/hookMaxFrames let the console estimate a beat's duration with the SAME
  // formula normalize-spec uses (max(60, words*FPW+30), HOOK capped), so a per-beat
  // preview runs the length the real render will — not a flat guess that truncates
  // the scene's build-in and looks broken.
  emit({budget: BUDGET, hookMaxWords: HOOK_MAX_WORDS, sentenceMaxWords: 20, transitions: TRANSITIONS,
    fps: FPS, fpw: FPW, hookMaxFrames: HOOK_MAX_FRAMES});
  process.exit(0);
}
if (!cmd || !cfgArg) { console.error('usage: flow.mjs <stage1|single|validate|stage2|assemble|applyfix|budgets> <cfg.json> [beats|reply|spec] [patch]'); process.exit(2); }
const cfg = readJSON(cfgArg);
const slug = slugify(cfg.topic);
const scratch = (name) => path.join(TMP, `${slug}-${name}`);

if (cmd === 'stage1' || cmd === 'single') {
  emit({mode: cmd === 'single' ? 'single-paste (frontier)' : 'two-paste (stage 1 — beat sheet)', prompt: gen(cfgArg, cmd)});
} else if (cmd === 'validate') {
  const beats = readJSON(arg2);
  const bf = scratch('beats.json');
  fs.writeFileSync(bf, JSON.stringify(beats));
  const v = run('scripts/validate-beats.mjs', [bf]);
  const ok = v.code === 0;
  emit({
    ok, verdict: v.out.trim(),
    reask: ok ? '' : 'Your beat sheet was rejected. Fix these and resend the JSON:\n\n' + v.out.trim(),
    beats: beats.beats || beats,
  });
} else if (cmd === 'stage2') {
  const bf = scratch('beats.json');
  fs.writeFileSync(bf, JSON.stringify(readJSON(arg2)));
  emit({mode: 'two-paste (stage 2 — fill)', prompt: gen(cfgArg, 'stage2', bf)});
} else if (cmd === 'assemble') {
  // GUARD: a BEAT SHEET (has `beats`, no `scenes`) pasted into the fill/assemble box
  // would assemble to 0 scenes, then the fix-prompt path emits a nonsensical "fix 0
  // scenes / id: undefined" prompt. Stop early with a clear instruction instead.
  const _reply = readJSON(arg2);
  if (!Array.isArray(_reply.scenes) && Array.isArray(_reply.beats)) {
    emit({ok: false, firstTry: false, spec: null, changes: [], warnings: [], lint: '', fixPrompt: '',
      error: 'That looks like a BEAT SHEET (it has "beats", not "scenes"). In the two-paste flow: validate the beat sheet, generate the Stage-2 "fill" prompt, then paste the FILLED reply here — a fill reply has a top-level "scenes" array.'});
    process.exit(0);
  }
  // console owns the envelope; the model reply supplies story + thumbnail + scenes
  const {spec, changes: asm} = assembleSpec(_reply, cfg);
  const sf = scratch('spec.json');
  fs.writeFileSync(sf, JSON.stringify(spec, null, 2));
  const before = lint(sf);
  const firstTry = before.code === 0;
  const {changes: norm, warnings} = normalizeSpec(spec);
  fs.writeFileSync(sf, JSON.stringify(spec, null, 2));
  const after = lint(sf);
  const out = {ok: after.code === 0, firstTry, errBefore: errCount(before.out), errAfter: errCount(after.out),
    spec, changes: [...asm, ...norm], warnings, lint: after.out.trim(), fixPrompt: ''};
  if (!out.ok) {
    // PREFLIGHT: if the model ignored the palette (most scenes are not real
    // component types), the normal per-scene fix-prompt would be a wall of noise.
    // Emit ONE concise contract reminder instead — the cheap fix for a model that
    // reverted to a generic “video JSON” prior instead of using our types.
    const nsc = (spec.scenes || []).length;
    const unknown = (spec.scenes || []).filter((s) => !MANIFEST_TYPES.includes(s.type));
    if (nsc && unknown.length >= Math.max(2, Math.ceil(nsc * 0.5))) {
      out.contractMiss = true;
      out.fixPrompt = [
        `CONTRACT NOT FOLLOWED: ${unknown.length} of ${nsc} scenes use a component type that is not in the palette.`,
        'You must use ONLY the offered component types (e.g. HOOK, STAT_CALLOUT, BAR_COMPARE, DIAGRAM, DEVICE_FRAME, LIST_BUILD, QUOTE_SPOTLIGHT, RECAP, OUTRO_CTA — see the palette).',
        'Each scene MUST be shaped: { "type": "<PALETTE_TYPE>", "narration": "...", "data": { /* that type’s schema */ } } — never "scene"/"props", never invent type names.',
        'Return the SAME story, re-mapped onto real palette types, as the single JSON object the OUTPUT section specifies (no meta, no brand).',
      ].join('\n');
    } else {
      out.fixPrompt = run('scripts/gen-fix-prompt.mjs', [sf]).out.trim();
    }
  }
  emit(out);
} else if (cmd === 'applyfix') {
  // arg2 = the (assembled) spec on disk shape; arg3 = the model's corrected-scenes patch
  const spec = readJSON(arg2);
  const patch = readJSON(arg3);
  const patches = Array.isArray(patch) ? patch : (patch.scenes || []);
  const byId = Object.fromEntries((spec.scenes || []).map((s, i) => [s.id || `s${String(i + 1).padStart(2, '0')}`, s]));
  for (const p of patches) {
    if (p.id && byId[p.id]) Object.assign(byId[p.id], p);   // scene fix
    else if (p.id && p.narration != null) { const t = byId[p.id]; if (t) t.narration = p.narration; } // narration-only
  }
  const sf = scratch('spec.json');
  fs.writeFileSync(sf, JSON.stringify(spec, null, 2));
  normalizeSpec(spec);
  fs.writeFileSync(sf, JSON.stringify(spec, null, 2));
  const after = lint(sf);
  const out = {ok: after.code === 0, lint: after.out.trim(), spec, fixPrompt: ''};
  if (!out.ok) out.fixPrompt = run('scripts/gen-fix-prompt.mjs', [sf]).out.trim();
  emit(out);
} else { console.error('unknown command ' + cmd); process.exit(2); }
