#!/usr/bin/env node
// CHECK-RECORDINGS — the seal that makes "recordings stay local" safe.
//
// Decision D4: captures are gitignored and never pushed. That is right for a public repo,
// but it means a fresh clone has SPECS THAT REFERENCE FOOTAGE THAT IS NOT THERE. Without
// a check, the failure mode is silent and late: the bake fails, or worse, a stale capture
// renders the wrong frames.
//
// So this is the lockfile, in the only form that is honest here: the demo scripts ARE the
// recordings' source, so instead of shipping bytes we verify that every reference resolves
// and tell you the exact command to regenerate what is missing.
//
// It checks three things per referenced step:
//   1. the capture manifest exists
//   2. the step id is in it
//   3. the segment file on disk still has the frame count the SPEC was baked against
//      (a stale spec renders the wrong length and silently breaks the freeze boundary)
//
// Usage: node scripts/check-recordings.mjs [--quiet]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const quiet = process.argv.includes('--quiet');
// --slug <slug> scopes the sweep to ONE topic. render-topic.mjs uses it, because the
// question a render asks is "do I have the footage for THIS cut", not "is every recording
// in the repo present on this machine".
const slugArg = (() => {
  const i = process.argv.indexOf('--slug');
  return i >= 0 ? process.argv[i + 1] : null;
})();
const REF = /rec:([A-Za-z0-9._-]+)#([A-Za-z0-9._-]+)/g;

// slug -> the demo file that produces it, so the fix is a command, not a puzzle.
const demoBySlug = new Map();
if (fs.existsSync('demos')) {
  for (const f of fs.readdirSync('demos').filter((x) => x.endsWith('.json'))) {
    try {
      const d = JSON.parse(fs.readFileSync(path.join('demos', f), 'utf8'));
      if (d.slug) demoBySlug.set(d.slug, path.join('demos', f));
    } catch { /* a malformed demo is not this seal's problem */ }
  }
}

const specs = [];
if (fs.existsSync('topics')) {
  for (const t of fs.readdirSync('topics')) {
    for (const f of ['long.json', 'shorts.json']) {
      if (slugArg && t !== slugArg) continue;
      const p = path.join('topics', t, f);
      if (fs.existsSync(p)) specs.push(p);
    }
  }
}

const probeFrames = (file) => {
  try {
    const out = execFileSync('ffprobe',
      ['-v', 'error', '-select_streams', 'v:0', '-count_frames',
       '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', file]).toString().trim();
    return Number(out.split(/\r?\n/)[0]);
  } catch { return null; }
};

const problems = [];
// A recording whose public/rec/<slug>/ is not on this machine is a DIFFERENT condition from
// a spec defect, and conflating them made `npm run gate` permanently red on a fresh clone —
// which is the "gate you learn to ignore" that docs/STATE.md warns about in its own
// check-fresh note. Recordings are gitignored by design (D4), so a clone HAS every spec and
// NONE of the footage. That is expected, it is one command from fixed, and it must not mask
// the failures that ARE spec defects: NOT BAKED, STALE, an unknown step id, a segment
// missing while its manifest is present, or a prep hook left in the transcript.
// Scoped to a slug (a render), absence IS fatal — you cannot render footage you do not have.
const absent = new Map(); // slug -> fix command
const used = new Map(); // slug -> Set(stepId)
let refCount = 0;

for (const sp of specs) {
  const text = fs.readFileSync(sp, 'utf8');
  let m;
  REF.lastIndex = 0;
  while ((m = REF.exec(text))) {
    const [, slug, stepId] = m;
    refCount++;
    if (!used.has(slug)) used.set(slug, new Set());
    used.get(slug).add(stepId);

    const manPath = path.resolve('public/rec', slug, 'manifest.json');
    const fix = demoBySlug.has(slug)
      ? `npm run record -- ${demoBySlug.get(slug)}`
      : `(no demo in demos/ produces slug "${slug}" — write one, or fix the reference)`;

    if (!fs.existsSync(manPath)) {
      // Once per SLUG, not once per reference — 28 identical lines for one missing
      // recording buried the one line that mattered.
      absent.set(slug, fix);
      continue;
    }
    const man = JSON.parse(fs.readFileSync(manPath, 'utf8'));
    const step = (man.steps || []).find((s) => s.id === stepId);
    if (!step) {
      problems.push(`${sp}: "${slug}" has no step "${stepId}" (has: ${(man.steps || []).map((s) => s.id).join(', ')})\n      fix: ${fix}`);
      continue;
    }
    const seg = path.resolve('public/rec', slug, step.segment);
    if (!fs.existsSync(seg)) {
      problems.push(`${sp}: segment missing on disk for ${slug}#${stepId}\n      fix: ${fix}`);
      continue;
    }
  }
}

// Freshness: the SPEC's baked frame count must still match the file. This is the stale
// trap that already bit once — bake used to be one-way, so a re-record left specs
// pointing at the previous take's numbers.
for (const sp of specs) {
  let spec;
  try { spec = JSON.parse(fs.readFileSync(sp, 'utf8')); } catch { continue; }
  for (const scene of spec.scenes ?? []) {
    for (const clip of scene?.data?.recordedStep?.clips ?? []) {
      // A CLIP WITH A ref BUT NO BAKED src IS THE WORST CASE, NOT ONE TO SKIP.
      //
      // PAID FOR: rebuilding shorts.json from its builder wipes the bake (the builder writes
      // `ref` only), and the next render drew the "NOT BAKED" placeholder for the whole beat
      // — a 47-second short shipped as an empty box with a play icon in it. This seal ran and
      // reported PASSED, because the freshness loop skipped any clip without a `src`: the
      // one state that is always broken was the one state it ignored.
      if (!clip.src || clip.frames == null) {
        problems.push(
          `${sp}: clip "${clip.id ?? clip.ref ?? '?'}" has a ref but is NOT BAKED ` +
          `(no ${!clip.src ? 'src' : 'frames'}) — it will render as a placeholder.
` +
          `      fix: node scripts/bake-rec.mjs ${sp}   then re-anchor and re-sync`);
        continue;
      }
      const abs = path.resolve('public', clip.src);
      if (!fs.existsSync(abs)) continue; // already reported above
      const real = probeFrames(abs);
      if (real != null && real !== Number(clip.frames)) {
        const slug = String(clip.src).split('/')[1];
        problems.push(
          `${sp}: STALE — clip "${clip.id ?? clip.src}" was baked at ${clip.frames} frames, the file has ${real}\n` +
          `      fix: node scripts/bake-rec.mjs ${sp}` +
          (demoBySlug.has(slug) ? `   (or re-record: npm run record -- ${demoBySlug.get(slug)})` : ''));
      }
    }
  }
}

// PREP MUST LEAVE NO TRACE. The exit-code prompt hook is typed into the terminal before
// capture starts; it must never reach a manifest (and therefore never a spec, a caption or
// a callout). Cheap to check, and the kind of leak that would otherwise ship quietly.
const HOOK = /function prompt|LASTEXITCODE|iauteur-rec-exit|__iauteur_hook|PROMPT_COMMAND/;
for (const slug of used.keys()) {
  const p = path.resolve('public/rec', slug, 'manifest.json');
  if (!fs.existsSync(p)) continue;
  const raw = fs.readFileSync(p, 'utf8');
  if (HOOK.test(raw)) {
    problems.push(`public/rec/${slug}/manifest.json: PREP-phase prompt-hook text leaked into the ` +
      `capture manifest. It should be cleared before the take — re-record.`);
  }
}

if (!quiet) {
  console.log(`RECORDING CHECK: ${refCount} reference(s) across ${specs.length} spec(s), ` +
    `${used.size} recording(s) used, ${demoBySlug.size} demo script(s) available.`);
  for (const [slug, steps] of used) {
    const ok = fs.existsSync(path.resolve('public/rec', slug, 'manifest.json'));
    console.log(`  ${ok ? 'ok  ' : 'MISS'} ${slug}  (${[...steps].join(', ')})`);
  }
}

// Absent footage: fatal for a render (--slug), a notice for the repo-wide sweep.
if (absent.size) {
  const lines = [...absent].map(([slug, fix]) => `  • ${slug}  ->  ${fix}`);
  if (slugArg) {
    console.error(`\n\u2717 RECORDING CHECK FAILED: footage for "${slugArg}" is not on this machine:`);
    for (const l of lines) console.error(l);
    process.exit(1);
  }
  console.error(`\nNOTE: ${absent.size} recording(s) referenced by a spec are not on this machine:`);
  for (const l of lines) console.error(l);
  console.error('Recordings are gitignored by design (they stay local), so a fresh clone has every');
  console.error('spec and no footage. This does not fail the gate — but the render of those topics');
  console.error('WILL refuse until they are re-recorded.');
}

if (problems.length) {
  console.error('\n\u2717 RECORDING CHECK FAILED:');
  for (const p of problems) console.error(`  \u2022 ${p}`);
  console.error('\nRecordings are gitignored on purpose (they stay local). The demo scripts in');
  console.error('demos/ are what regenerates them, so nothing is lost — it just has to be run.');
  process.exit(1);
}
if (!quiet) console.log('\u2713 RECORDING CHECK PASSED (every rec: reference resolves and is fresh)');
