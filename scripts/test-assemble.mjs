#!/usr/bin/env node
// ASSEMBLER GATE — proves the "envelope out of the model contract" round-trip:
//  1) a LEAN model reply (story + thumbnail + scenes, NO meta/brand) assembles
//     from the console cfg and lints PASS after normalize.
//  2) the console owns the envelope: a model that emits its OWN meta/brand is
//     ignored-with-log and cfg values win.
//  3) a scene missing narration yields a narration-ONLY fix-prompt (R3).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {assembleSpec} from './lib/assemble.mjs';
import {normalizeSpec} from './lib/normalize-spec.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NODE = process.execPath;
const tmp = path.join(ROOT, 'out', 'tmp');
fs.mkdirSync(tmp, {recursive: true});
const lint = (f) => { try { execFileSync(NODE, ['scripts/lint-spec.mjs', f], {encoding: 'utf8'}); return {code: 0, out: ''}; } catch (e) { return {code: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '')}; } };
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, ''));

let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fails++; };

const cfg = read(path.join(ROOT, 'briefs', 'examples', 'pw-cfg.json'));
const lean = read(path.join(ROOT, 'briefs', 'examples', 'lean-reply.json'));

// 1) lean shape → assemble → normalize → lint PASS
const {spec, changes: asm1} = assembleSpec(lean, cfg);
ok(asm1.length === 0, 'lean reply emits NO envelope (nothing to ignore)');
ok(spec.meta.topic === cfg.topic, 'console owns meta.topic');
ok(spec.brand.design === cfg.design, 'console owns brand.design');
normalizeSpec(spec);
const f1 = path.join(tmp, 'assembled-lean.json');
fs.writeFileSync(f1, JSON.stringify(spec, null, 2));
const r1 = lint(f1);
ok(r1.code === 0, 'assembled lean spec lints PASS' + (r1.code ? '\n' + r1.out.split('\n').filter((l) => /[•*]/.test(l)).join('\n') : ''));

// 2) model that emits its OWN envelope → ignored-with-log, cfg wins
const rogue = {...lean, meta: {topic: 'WRONG TOPIC', channel: 'ROGUE'}, brand: {design: 'cyberpunk', theme: 'cyberpunk'}};
const {spec: s2, changes: asm2} = assembleSpec(rogue, cfg);
ok(asm2.some((c) => /ignored model-emitted meta/.test(c)), 'rogue meta ignored-with-log');
ok(asm2.some((c) => /ignored model-emitted brand/.test(c)), 'rogue brand ignored-with-log');
ok(s2.meta.topic === cfg.topic && s2.brand.design === cfg.design, 'cfg overrides rogue envelope');

// 3) missing narration → narration-only fix-prompt
const blanked = JSON.parse(JSON.stringify(spec));
blanked.scenes[2].narration = '';
const f3 = path.join(tmp, 'blanked-narration.json');
fs.writeFileSync(f3, JSON.stringify(blanked, null, 2));
let fx = '';
try { fx = execFileSync(NODE, ['scripts/gen-fix-prompt.mjs', f3], {encoding: 'utf8'}); } catch (e) { fx = (e.stdout || '') + (e.stderr || ''); }
ok(/missing their spoken narration/.test(fx), 'fix-prompt is narration-only');
ok(fx.includes(blanked.scenes[2].id), 'fix-prompt names the blank scene id');
ok(!/Schema \(/.test(fx), 'fix-prompt does NOT dump component schemas');
ok(/"narration"/.test(fx) && !/durationFrames/.test(fx), 'fix-prompt asks only for narration');

console.log(fails ? `\n\u2717 ASSEMBLE GATE FAILED (${fails})` : '\n\u2713 ASSEMBLE GATE PASSED');
process.exit(fails ? 1 : 0);
