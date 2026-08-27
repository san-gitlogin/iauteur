#!/usr/bin/env node
// BAKE-REC — resolve authored `rec:<slug>#<step>` references against the capture
// manifest, so the renderer receives a self-contained spec and `src/video.tsx` needs
// no knowledge of recordings at all.
//
//   authored :  {"ref": "rec:my-demo#run-tests", "label": "run the tests", "atWord": 26}
//   baked    :  {..., "src": "rec/my-demo/seg-03.mp4", "frames": 45,
//                "bbox": {...}, "id": "run-tests"}
//
// THIS IS ALSO THE ANTI-HALLUCINATION GATE. A step whose manifest entry is not marked
// `truth: "read-back"` did not have its output verified against the real terminal, and
// baking REFUSES it. The pipeline fails loudly rather than shipping a guess.
// (`truth: "fixture"` is allowed only with --allow-fixture, for the contract tests.)
//
// Usage:
//   node scripts/bake-rec.mjs <spec.json> [--out <file>] [--allow-fixture]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const args = process.argv.slice(2);
const specPath = args[0];
if (!specPath) {
  console.error('Usage: node scripts/bake-rec.mjs <spec.json> [--out <file>] [--allow-fixture]');
  process.exit(2);
}
const outIdx = args.indexOf('--out');
const outPath = outIdx >= 0 ? args[outIdx + 1] : specPath;
const allowFixture = args.includes('--allow-fixture');

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const manifests = new Map();
const fail = (m) => {
  console.error(`BAKE FAIL: ${m}`);
  process.exit(1);
};

const loadManifest = (slug) => {
  if (manifests.has(slug)) return manifests.get(slug);
  const p = path.resolve('public/rec', slug, 'manifest.json');
  if (!fs.existsSync(p)) fail(`no capture manifest at ${p} — record the demo first`);
  const m = JSON.parse(fs.readFileSync(p, 'utf8'));
  manifests.set(slug, m);
  return m;
};

// Never trust a recorded number: measure the artefact. A manifest can go stale if a
// segment is re-encoded or hand-touched, and a wrong frame count silently breaks the
// freeze boundary — the one thing this whole design rests on.
const probeFrames = (file) => {
  const out = execFileSync('ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-count_frames',
     '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', file]).toString().trim();
  const n = Number(out.split(/\r?\n/)[0]);
  if (!Number.isFinite(n) || n <= 0) fail(`could not probe frame count of ${file}`);
  return n;
};

let baked = 0;
let refreshed = 0;
const scenes = Array.isArray(spec.scenes) ? spec.scenes : [];
for (const [si, scene] of scenes.entries()) {
  const d = scene?.data?.recordedStep;
  if (!d || !Array.isArray(d.clips)) continue;

  let slugForCapture = null;
  for (const [ci, clip] of d.clips.entries()) {
    const where = `scene ${si} (${scene.type}) clip ${ci}`;
    if (!clip.ref) {
      if (!clip.src) fail(`${where}: neither ref nor src`);
      continue; // hand-authored src, nothing to resolve
    }
    const m = /^rec:([A-Za-z0-9._-]+)#(.+)$/.exec(String(clip.ref));
    if (!m) fail(`${where}: malformed ref ${JSON.stringify(clip.ref)} (want rec:<slug>#<step>)`);
    const [, slug, stepId] = m;
    slugForCapture = slugForCapture || slug;

    const man = loadManifest(slug);
    const step = (man.steps || []).find((s) => s.id === stepId);
    if (!step) {
      const have = (man.steps || []).map((s) => s.id).join(', ');
      fail(`${where}: step "${stepId}" not in ${slug}'s manifest. Steps present: ${have}`);
    }

    // ── the gate ────────────────────────────────────────────────────────────
    // 'no-output' is a step that makes NO claim about output (a deliberate pause). There
    // is nothing there that could have been fabricated, so it passes the gate. Anything
    // else must have been READ BACK from the real screen.
    const ok = step.truth === 'read-back' || step.truth === 'no-output' ||
               (allowFixture && step.truth === 'fixture');
    if (!ok) {
      fail(
        `${where}: step "${stepId}" has truth="${step.truth}". ` +
        `Only output READ BACK from the real terminal may ship. ` +
        `Re-record it, or pass --allow-fixture if this is a contract test.`,
      );
    }

    const rel = path.posix.join('rec', slug, step.segment);
    const abs = path.resolve('public', rel);
    if (!fs.existsSync(abs)) fail(`${where}: segment missing on disk: ${abs}`);
    const real = probeFrames(abs);
    if (step.segmentFrames != null && Number(step.segmentFrames) !== real) {
      fail(`${where}: manifest says ${step.segmentFrames} frames, file has ${real}. Manifest is stale — re-record.`);
    }

    // KEEP `ref`. Deleting it made baking ONE-WAY: after a re-record the spec still
    // carried the previous take's frame counts and bounding boxes, bake reported
    // "nothing to bake", and the render silently used stale numbers. Measured on a real
    // re-record: 3 of 3 clips stale, with marks 10x too wide. `ref` is the authored
    // intent and stays; `src`/`frames`/`bbox`/`marks` are DERIVED and are refreshed on
    // every bake. Re-baking is therefore idempotent and safe to run after every capture.
    const wasStale = clip.frames != null && Number(clip.frames) !== real;
    if (wasStale) refreshed++;
    clip.id = step.id;
    clip.src = rel;
    clip.frames = real;
    if (step.bbox) clip.bbox = step.bbox;
    if (step.marks) clip.marks = step.marks;
    // The KEYS the runner actually pressed. Carried through so a KEYCAP overlay is a
    // record of what happened, never a hand-typed guess that can drift from the take.
    if (step.keys) clip.keys = step.keys;

    // A callout must point at a rectangle the RUNNER MEASURED. Referencing a mark the
    // capture does not contain is caught here, not silently drawn in the wrong place.
    for (const co of clip.callouts ?? []) {
      if (co.mark && !(step.marks && step.marks[co.mark])) {
        const have = Object.keys(step.marks ?? {});
        fail(`${where}: callout points at mark "${co.mark}", which step "${stepId}" did not measure. ` +
             (have.length ? `Marks present: ${have.join(', ')}.` : 'That step recorded no marks — add one to demo.json.'));
      }
    }
    baked++;
  }

  if (slugForCapture && !d.capture) {
    const man = loadManifest(slugForCapture);
    d.capture = {width: man.viewport?.width ?? 1920, height: man.viewport?.height ?? 1080};
  }
}

if (!baked) {
  console.log('nothing to bake (no rec: references in this spec)');
} else {
  fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));
  console.log(`OK  resolved ${baked} clip reference(s) -> ${outPath}` +
    (refreshed ? `  (${refreshed} were STALE and have been refreshed from the new capture)` : ''));
}
