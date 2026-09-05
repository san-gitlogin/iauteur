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

const probeWidth = (file) => {
  try {
    const out = execFileSync('ffprobe',
      ['-v', 'error', '-select_streams', 'v:0',
       '-show_entries', 'stream=width', '-of', 'csv=p=0', file]).toString().trim();
    return Number(out.split(/\r?\n/)[0]);
  } catch { return null; }
};

// THE MASTER MUST OUTLIVE THE ZOOM (owner, 2026-09-05: *"even zooming in, panning in does
// not degrade the quality of my video"*).
//
// Two bugs put soft footage on screen and NOTHING reported either one:
//   1. capture.mjs downscaled every segment to 1920, which is a supersample only for a
//      camera that never moves;
//   2. browser.mjs asked for deviceScaleFactor 1.2 (i.e. exactly 1920) and omitted Chrome's
//      high-DPI flags, so even an explicit request for dsf 4 was SILENTLY capped at 2.
// Both produced a valid manifest, a green linter and a clean render.
//
// `RecordedStep` frames a target with `winW = max(bw*1.08, capW / 3.2)` and then stretches
// the master to `capW * (stageW / view.w)`. So a clip's deepest authored zoom fixes exactly
// how many real pixels its master must carry:
//
//     required master width = (capW / winW) x 1920
//
// Below that the renderer is upscaling and the sharpness is gone before it starts. This is
// the arithmetic, run against the artefact — never against the setting we asked for.
const DELIVERY_W = 1920;   // wide cut. 9:16 delivers 1080 wide at a 4.2 divisor => less demanding.
const TIGHTEST = 3.2;      // RecordedStep's wide, non-split, non-gentle divisor.

// HOW MUCH UPSCALE IS ACTUALLY A DEFECT — measured, not chosen.
//
// The first version of this gate demanded 1:1 (master >= zoom x delivery). That is the
// ideal, and as a PASS/FAIL line it is wrong: it fails a master that is a hair under and
// says nothing about how bad the miss is. Master pixels are also paid for at render time —
// Remotion decodes every frame through Chrome — so demanding 1:1 everywhere is what made a
// 19-minute cut of 6400px footage die at frame 2144 with 4GB free.
//
// So the threshold comes off a curve. One page, one CSS region, the pipeline's deepest zoom
// (a 500px window delivered at 1920), each master compared against a 6400px reference:
//
//     master   upscale   SSIM     PSNR
//     4800     1.47x     0.9955   33.0 dB
//     3200     2.20x     0.9901   30.2 dB
//     1920     3.67x     0.9788   27.0 dB
//     (and the real shipped pipeline, 1920 from a 1.2x-upscaled capture: 0.969 / 24.7 dB)
//
// Degradation is gradual, so the line goes where SSIM leaves 0.99 — the usual
// "visually near-identical" bar — which is a ~2.2x upscale. TOLERANCE is set just inside it.
// This still rejects, loudly, every case the gate was written for: the Fable 5.1 cut's 3.2x,
// and the 174 clips found repo-wide.
const TOLERANCE = 2.0;

const zoomFactorFor = (clip, capW) => {
  const rectOf = (z) => {
    if (z.at === 'full') return null;
    if (z.marks?.length) {
      const rs = z.marks.map((m) => clip.marks?.[m]).filter(Boolean);
      if (!rs.length) return null;
      const x = Math.min(...rs.map((r) => Number(r.x)));
      const x1 = Math.max(...rs.map((r) => Number(r.x) + Number(r.w)));
      return {w: x1 - x};
    }
    if (z.mark) return clip.marks?.[z.mark] ?? null;
    return clip.bbox ?? null;
  };
  // A clip with `focus` and no authored zooms is still punched in by the default path.
  const entries = (clip.zooms ?? []).length ? clip.zooms : (clip.focus ? [{}] : []);
  let worst = 1;
  for (const z of entries) {
    const r = rectOf(z);
    const bw = r ? Number(r.w) : capW;
    if (!Number.isFinite(bw) || bw <= 0) continue;
    const winW = Math.max(bw * 1.08, capW / TIGHTEST);
    worst = Math.max(worst, capW / winW);
  }
  return worst;
};

const probeFrames = (file) => {
  try {
    const out = execFileSync('ffprobe',
      ['-v', 'error', '-select_streams', 'v:0', '-count_frames',
       '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', file]).toString().trim();
    return Number(out.split(/\r?\n/)[0]);
  } catch { return null; }
};

const problems = [];
// SOFT ZOOM is scoped like absent footage: FATAL for the topic you are about to render
// (--slug), a NOTICE for the repo-wide sweep. 174 clips across already-shipped cuts carry
// this defect; failing the whole gate on them would make `npm run gate` permanently red,
// which is precisely the "gate you learn to ignore" docs/STATE.md warns about. The footage
// that ships NEXT is the footage that has to be right.
const softZoom = [];
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

      // ── THE MASTER MUST OUTLIVE THE ZOOM ────────────────────────────────────
      // Measured, per clip, against the file on disk. See the note on `zoomFactorFor`.
      const capW = Number(scene?.data?.recordedStep?.capture?.width ?? 0);
      if (capW > 0) {
        const zf = zoomFactorFor(clip, capW);
        if (zf > 1.01) {
          const haveW = probeWidth(abs);
          const idealW = Math.ceil((zf * DELIVERY_W) / 2) * 2;
          const needW = Math.ceil((idealW / TOLERANCE) / 2) * 2;
          if (haveW != null && haveW < needW) {
            const slug = String(clip.src).split('/')[1];
            const dsf = Math.ceil((idealW / capW) * 100) / 100;
            softZoom.push(
              `${sp}: SOFT ZOOM — clip "${clip.id ?? clip.src}" zooms ${zf.toFixed(2)}x, so the ` +
              `renderer stretches its master to ${idealW}px, but the file is only ${haveW}px wide ` +
              `(the floor, at the measured ${TOLERANCE}x tolerance, is ${needW}px).\n` +
              `      The camera is upscaling ${(idealW / haveW).toFixed(2)}x and the sharpness is ` +
              `already gone before the render starts.\n` +
              `      fix: raise the capture — set "deviceScaleFactor": ${Math.max(2, Math.ceil(dsf))} ` +
              `and "masterWidth": 0 in demos/${demoBySlug.get(slug) ? path.basename(demoBySlug.get(slug)) : `<${slug}>.json`}, ` +
              `then re-record and re-bake.`);
          }
        }
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

const preInk = [];
// EVERY RECORDING MUST KNOW WHERE ITS OWN INK IS.
//
// `inkFor()` measures the text on screen so the overlay solver can place a card or a
// callout where the work is NOT (LAW 0f corollary, AN OVERLAY GOES WHERE THE WORK IS NOT).
// It fails SOFT: the DOM query returns [] and the take is written with `ink: null`, which
// the solver reads as "the screen is empty" and happily lays a label over the thing the
// voice is discussing. Nothing anywhere said so.
//
// It shipped exactly that way. Both row selectors were VS Code's (`.view-line`,
// `.xterm-rows`), so BROWSER captures measured nothing at all — `public/rec/fable-page`
// carried ink 0 on all four steps — and the Fable long cut placed *"the one it replaces"*
// on top of the `60.9% (Mythos 5.1)` sub-label it was pointing at.
//
// A recorded step is footage of a screen with something on it. If NO step in a recording
// has ink, the measurement did not run — that is the assertion.
for (const slug of used.keys()) {
  const p = path.resolve('public/rec', slug, 'manifest.json');
  if (!fs.existsSync(p)) continue;
  let man;
  try { man = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { continue; }
  const steps = Array.isArray(man.steps) ? man.steps : [];
  if (!steps.length) continue;
  const fix = demoBySlug.has(slug)
    ? `npm run record -- ${demoBySlug.get(slug)}`
    : `demos/${slug}.json`;
  // TWO DIFFERENT FACTS, AND CONFLATING THEM WOULD HIDE THE ONE THAT MATTERS.
  //
  // A manifest with NO `ink` KEY was written before inkFor() existed (2026-08-29). Nothing
  // is wrong with the recorder; the take is simply older than the measurement. That is a
  // notice repo-wide — those takes already shipped — and fatal only for the topic you are
  // about to render, on the same argument check-sync makes about estimated word timings.
  //
  // A manifest that HAS the key and is EMPTY on every step is the live defect: inkFor()
  // ran, looked, and found nothing. That is never true of real footage, so it never
  // degrades to a notice.
  const measured = steps.some((st) => Object.prototype.hasOwnProperty.call(st, 'ink'));
  const withInk = steps.filter((st) => Array.isArray(st.ink) && st.ink.length).length;
  if (!measured) {
    const msg = `public/rec/${slug}/manifest.json: recorded ${String(man.recordedAt ?? '?').slice(0, 10)}, ` +
      `before ink was measured — overlays on this footage are placed blind.\n      fix: ${fix}`;
    if (slugArg) problems.push(msg);
    else preInk.push(msg);
  } else if (withInk === 0) {
    problems.push(`public/rec/${slug}/manifest.json: NO STEP has measured ink (${steps.length} ` +
      `step(s), surface "${man.surface ?? '?'}"). inkFor() ran and found nothing on screen, so ` +
      `every overlay on this footage will be placed blind and can land on the content.\n` +
      `      fix: re-record — ${fix}` +
      `\n      If it still reports zero, inkFor() has no selector for this surface.`);
  }
}
if (preInk.length && !quiet) {
  console.error(`\nNOTE: ${preInk.length} recording(s) predate ink measurement:`);
  for (const m of preInk) console.error(`  \u2022 ${m}`);
  console.error('Their overlays were solved without knowing where the text was. This does NOT fail');
  console.error('the gate — those cuts shipped — but re-record before re-rendering any of them.');
}

// WHAT EACH CAST CLIP ACTUALLY SHOWS, printed next to the label the author gave it.
//
// Owner: *"you speak about comparison table, but you are showing this first, later you show
// the table — why so?"* A clip labelled "scrolling to the table" was playing footage headed
// "A new performance frontier". The label was authored from the demo's step name; the
// footage was never opened. `bake-rec` now bakes `shows` for exactly this, and the render
// preflight prints the pairs, so casting a clip from its name instead of its content is in
// front of you before the render starts rather than in the finished cut.
if (slugArg && !quiet) {
  const pairs = [];
  for (const file of specs) {
    let spec; try { spec = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
    for (const sc of spec.scenes ?? []) {
      for (const c of sc.data?.recordedStep?.clips ?? []) {
        if (c.shows) pairs.push({id: `${sc.id}/${c.id ?? c.ref}`, label: c.label ?? '—', shows: c.shows});
      }
    }
  }
  if (pairs.length) {
    console.log('\n  WHAT EACH CLIP SHOWS  (your label -> the screen\'s own words)');
    const w = Math.max(...pairs.map((p) => p.id.length));
    for (const p of pairs) {
      console.log(`    ${p.id.padEnd(w)}  ${String(p.label).padEnd(26)}  ->  ${p.shows.slice(0, 58)}`);
    }
    console.log('  If a label and the screen disagree, the clip was cast from its name, not its content.');
  }

  // ── FIGURES: every number the narration speaks over footage, against the footage ──
  //
  // PAID FOR, 2026-09-04. The MCP agent script was written from a VERIFICATION run and
  // the video was a SEPARATE recording of the same project. Same code, different dice:
  // "checkout failed five times" over a terminal reading "failed 7 times", "it chose
  // recent_errors and then slowest_routes" over footage where it chose one, and a
  // quoted answer nobody on screen ever gave. The linter passed, the sync audit passed,
  // the hold check passed, and the payoff beat described a run the viewer never sees.
  //
  // Nothing could have caught it, because `shows` captured the last COMMAND and never
  // the OUTPUT. Now that clips carry `said`, the figures a scene SPEAKS can be held
  // against the text its own footage DISPLAYS. This is a report, not a rejection: most
  // spoken numbers are legitimately not on screen ("five files", "three routes"), so it
  // prints what it could not find and leaves the judgement to a person — which is the
  // same contract as the label/screen table above.
  const WORD = {one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7',
                eight: '8', nine: '9', ten: '10', eleven: '11', twelve: '12', twenty: '20',
                thirty: '30', forty: '40', fifty: '50', sixty: '60', seventy: '70',
                eighty: '80', ninety: '90', hundred: '100', thousand: '1000'};
  const spoken = (text) => {
    const out = new Set();
    // NOT \b at the end: the screen writes "1589ms" and the mouth says "1589            // milliseconds", and a trailing word boundary makes those two disagree.
    for (const m of String(text).matchAll(/\d[\d,]*/g)) out.add(m[0].replace(/[,.]+$/, ''));
    for (const m of String(text).toLowerCase().matchAll(/\b[a-z]+\b/g))
      if (WORD[m[0]]) out.add(WORD[m[0]]);
    return [...out];
  };
  const rows = [];
  let measured = 0;
  for (const file of specs) {
    let spec; try { spec = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
    for (const sc of spec.scenes ?? []) {
      const clips = sc.data?.recordedStep?.clips ?? [];
      const said = clips.map((c) => c.said).filter(Boolean).join('\n');
      if (!said) continue;
      measured++;
      const onScreen = new Set(spoken(said));
      const missing = spoken(sc.narration ?? '').filter((n) => !onScreen.has(n));
      if (missing.length) rows.push({id: sc.id, missing});
    }
  }
  if (!measured && pairs.length) {
    console.log('\n  FIGURES: not measured — this recording predates the screen-text capture.');
    console.log('  Re-record to populate clips[].said, then every spoken number is checkable.');
  } else if (rows.length) {
    console.log('\n  FIGURES SPOKEN THAT THE FOOTAGE DOES NOT SHOW');
    for (const r of rows) console.log(`    ${r.id}  ${r.missing.join(', ')}`);
    console.log('  Some of these are fine (counts of files, of routes). Any that name a RESULT');
    console.log('  are the script describing a different run from the one on camera.');
  } else if (measured) {
    console.log(`\n  FIGURES: every number spoken over footage appears in it (${measured} scene(s)).`);
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

// Master too small for the zoom: fatal for a render (--slug), a notice repo-wide.
if (softZoom.length) {
  const mine = slugArg
    ? softZoom.filter((l) => l.includes(`/${slugArg}/`) || l.includes(`${slugArg}.json`))
    : [];
  if (slugArg && mine.length) {
    console.error(`\n\u2717 RECORDING CHECK FAILED: ${mine.length} clip(s) in "${slugArg}" zoom ` +
      `further than their footage can carry:`);
    for (const l of mine) console.error(`  \u2022 ${l}`);
    console.error(`\n  The camera is upscaling. Re-record the demo at a higher deviceScaleFactor`);
    console.error(`  with "masterWidth": 0, then re-bake. Bytes are not the constraint — measured`);
    console.error(`  on a dense page, native 6400px cost 536KB against 108KB at 1920.`);
    process.exit(1);
  }
  if (!quiet) {
    console.error(`\nNOTE: ${softZoom.length} clip(s) zoom further than their master can carry.`);
    console.error(`  These cuts already shipped; re-record before re-rendering any of them.`);
    for (const l of softZoom.slice(0, 5)) console.error(`  \u2022 ${l.split('\n')[0]}`);
    if (softZoom.length > 5) console.error(`  ... and ${softZoom.length - 5} more (run with --slug <topic> to see one topic's).`);
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
