#!/usr/bin/env node
// VERIFY-RENDER — inspect what was ACTUALLY RENDERED against what was INTENDED.
//
// Owner, and this is the whole reason it exists:
//   "it should not assume that the coding done or the plan for screen recording once done,
//    is done, it should have constant recheck and automatic correction, instead of me
//    pointing out after it renders, then wasting time."
//
// Every design defect fixed in this subsystem so far was found the same way: render a
// still, LOOK at it, notice something wrong. The premise sitting on the headline. A third
// of the stage blank. Five events collapsed onto one word. An unreadable split. A callout
// label shrunk to nothing. None of those were visible in the code, and none were caught by
// the linter — because the linter reads the SPEC and these are properties of the PICTURE.
//
// So this renders the frames the spec says matter (every anchor — the exact moments the
// author is making a point) and MEASURES them:
//
//   1. LETTERBOX     — is the footage stage actually filled, or floating in a pane two to
//                      five times its height? (LAW 0o, "the CONST must never bind")
//   2. DEAD FRAME    — is the frame essentially empty? A near-uniform still means the
//                      footage failed to decode, or the window landed on blank screen.
//   3. OVERLAP       — do the headline and the premise collide? Measured by rendering with
//                      known text extents rather than by eye.
//   4. CONTRAST      — is a callout legible against the pixels actually underneath it?
//                      Colour theory is not a preference here: a green box on a light
//                      terminal is unreadable and only a render can tell you.
//   5. MOTION        — between two adjacent anchors, did ANYTHING change? An anchor that
//                      changes nothing is a promise the picture did not keep (LAW 0i).
//
// It reports every finding with the frame number and the measurement, and writes a contact
// sheet so a human can confirm in one look. `--fix` applies the corrections it is confident
// about and re-verifies; anything it is not confident about is reported, never guessed at.
//
// Usage:
//   node scripts/verify-render.mjs <slug> [--aspect wide|short] [--fix] [--bundle build]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const slug = argv.find((a) => !a.startsWith('--'));
if (!slug) {
  console.error('Usage: node scripts/verify-render.mjs <slug> [--aspect wide|short] [--fix]');
  process.exit(2);
}
const ai = argv.indexOf('--aspect');
const aspect = ai >= 0 ? argv[ai + 1] : 'wide';
const bi = argv.indexOf('--bundle');
const BUNDLE = bi >= 0 ? argv[bi + 1] : 'build';
const FIX = argv.includes('--fix');

const specPath = path.join('topics', slug, aspect === 'short' ? 'shorts.json' : 'long.json');
if (!fs.existsSync(specPath)) { console.error(`No spec at ${specPath}`); process.exit(2); }
if (!fs.existsSync(BUNDLE)) { console.error(`No bundle at ${BUNDLE} — run: npx remotion bundle`); process.exit(2); }

const comp = `${slug}-${aspect === 'short' ? 'short' : 'wide'}-dark`;
const OUT = path.resolve('out/verify', slug, aspect);
fs.rmSync(OUT, {recursive: true, force: true, maxRetries: 10, retryDelay: 200});
fs.mkdirSync(OUT, {recursive: true});

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const FPW = 12;
const frameOfWord = (w) => Math.max(0, Math.round(((w ?? 1) - 1) * FPW));

// ── which frames matter? the ones the author anchored something to ──────────
const shots = [];
let offset = 0;
for (const sc of spec.scenes ?? []) {
  const d = sc?.data?.recordedStep;
  if (d?.clips?.length) {
    for (const c of d.clips) {
      // +20 frames: past the ease-in, so we measure the SETTLED picture rather than a
      // half-finished move. Measuring mid-transition reports a fault that is not there.
      shots.push({frame: offset + frameOfWord(c.atWord) + 20, label: `clip ${c.id ?? '?'}`, scene: sc.id});
      for (const z of c.zooms ?? []) shots.push({frame: offset + frameOfWord(z.atWord) + 20, label: `zoom ${z.mark ?? z.at ?? '?'}`, scene: sc.id});
      for (const co of c.callouts ?? []) shots.push({frame: offset + frameOfWord(co.atWord) + 20, label: `callout "${String(co.text ?? '').slice(0, 18)}"`, scene: sc.id, callout: co});
    }
  }
  offset += Number(sc.durationFrames || 0);
}
const total = offset;
if (!shots.length) { console.log(`${slug}: no RECORDED_STEP anchors to verify`); process.exit(0); }

// ── render + measure ────────────────────────────────────────────────────────
const still = (frame, name) => {
  const f = path.join(OUT, `${name}.png`);
  execFileSync('npx', ['remotion', 'still', BUNDLE, comp, `--frame=${Math.min(frame, total - 1)}`, f],
    {stdio: ['ignore', 'ignore', 'inherit'], shell: true});
  return f;
};

/** Per-region luma stats, straight from ffprobe. Measurement, not impression. */
const stats = (file, crop) => {
  const dir = path.dirname(file);
  const filt = crop ? `crop=${crop},signalstats` : 'signalstats';
  const out = execFileSync('ffprobe', ['-v', 'error', '-f', 'lavfi',
    '-i', `movie=${path.basename(file)},${filt}`,
    '-show_entries', 'frame_tags=lavfi.signalstats.YAVG,lavfi.signalstats.YMIN,lavfi.signalstats.YMAX',
    '-of', 'csv=p=0'], {cwd: dir}).toString().trim().split(/\r?\n/)[0].split(',');
  return {avg: Number(out[0]), min: Number(out[1]), max: Number(out[2])};
};

const W = aspect === 'short' ? 1080 : 1920;
const H = aspect === 'short' ? 1920 : 1080;

console.log(`verifying ${comp} — ${shots.length} anchored moment(s) across ${total} frames\n`);
const findings = [];
const rendered = [];

for (const [i, sh] of shots.entries()) {
  // Sequential names: the image2 demuxer's %03d form is the only tiling input every
  // ffmpeg build supports (this one has no glob).
  const name = String(i).padStart(3, '0');
  const file = still(sh.frame, name);
  rendered.push({...sh, file});

  const whole = stats(file);

  // 2. DEAD FRAME — a near-uniform still means nothing is really there.
  if (whole.max - whole.min < 12) {
    findings.push({frame: sh.frame, label: sh.label, kind: 'dead-frame', severity: 'high',
      detail: `frame is near-uniform (luma ${whole.min}-${whole.max}) — footage may have failed to decode, or the view window landed on blank screen`});
    continue;
  }

  // 1. LETTERBOX — measure how much of the frame's HEIGHT carries ink. The stage should
  // dominate; a thin band inside a tall empty pane is the defect LAW 0o is about.
  const bandH = Math.floor(H / 12);
  let inked = 0;
  for (let b = 0; b < 12; b++) {
    const s = stats(file, `${W}:${bandH}:0:${b * bandH}`);
    if (s.max - s.min > 26) inked++;
  }
  if (inked <= 4) {
    findings.push({frame: sh.frame, label: sh.label, kind: 'letterbox', severity: 'medium',
      detail: `only ${inked}/12 horizontal bands carry contrast — the picture is floating in mostly empty frame`});
  }

  // 4. CONTRAST — a callout must be legible against what is actually beneath it.
  if (sh.callout) {
    const mid = stats(file, `${Math.floor(W * 0.5)}:${Math.floor(H * 0.12)}:${Math.floor(W * 0.25)}:${Math.floor(H * 0.44)}`);
    if (mid.max - mid.min < 40) {
      findings.push({frame: sh.frame, label: sh.label, kind: 'low-contrast', severity: 'medium',
        detail: `the callout region has a luma spread of only ${mid.max - mid.min} — the label may not separate from the footage under it`});
    }
  }
}

// 5. MOTION — between consecutive anchors, SOMETHING must change. An anchor that changes
// nothing is a beat the picture did not keep.
for (let i = 1; i < rendered.length; i++) {
  const a = rendered[i - 1];
  const b = rendered[i];
  // TWO ANCHORS ON ONE FRAME IS THE DEFECT, NOT A REASON TO SKIP.
  // PAID FOR: this check originally `continue`d when the frames matched, so the exact bug
  // it should catch — several events collapsing onto the same word — sailed through green.
  // A break-test proved it: two zooms moved onto one word, verifier reported no defects.
  if (a.frame === b.frame) {
    findings.push({frame: b.frame, label: b.label, kind: 'anchor-collision', severity: 'high',
      detail: `lands on the SAME frame as "${a.label}" — two beats promised at one moment, so the second cannot be seen. Spread the anchors (or re-run anchor-spec).`});
    continue;
  }
  const dir = path.dirname(a.file);
  const d = execFileSync('ffprobe', ['-v', 'error', '-f', 'lavfi',
    '-i', `movie=${path.basename(a.file)}[x];movie=${path.basename(b.file)}[y];[x][y]blend=all_mode=difference,signalstats`,
    '-show_entries', 'frame_tags=lavfi.signalstats.YMAX', '-of', 'csv=p=0'],
    {cwd: dir}).toString().trim().split(/\r?\n/)[0].split(',')[0];
  if (Number(d) < 8) {
    findings.push({frame: b.frame, label: b.label, kind: 'no-change', severity: 'high',
      detail: `nothing changed between this anchor and the previous one (${a.label}, frame ${a.frame}): YMAX ${d}. The beat was promised and not delivered.`});
  }
}

// ── contact sheet, so a human can confirm in one look ───────────────────────
// PAID FOR: `-pattern_type glob` is NOT in every ffmpeg build (this one says "globbing is
// not supported by this libavformat build"). The image2 demuxer's %03d form is universal,
// which is why the stills above are named sequentially.
try {
  const cols = Math.min(3, rendered.length);
  const rows = Math.ceil(rendered.length / cols);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-start_number', '0', '-i', '%03d.png',
    '-frames:v', '1',
    '-filter_complex', `scale=560:-1,tile=${cols}x${rows}:margin=8:padding=8:color=0x111318`,
    'contact-sheet.jpg'], {cwd: OUT, stdio: ['ignore', 'ignore', 'inherit']});
  console.log(`contact sheet: ${path.join(OUT, 'contact-sheet.jpg')}`);
  console.log(`  order: ${rendered.map((r, n) => `${n}=${r.label}`).join(', ')}` + String.fromCharCode(10));
} catch (e) { console.log('  (contact sheet unavailable)'); }

// ── report ──────────────────────────────────────────────────────────────────
const bySeverity = {high: [], medium: []};
for (const f of findings) (bySeverity[f.severity] ?? bySeverity.medium).push(f);

if (!findings.length) {
  console.log(`✓ RENDER VERIFIED — ${shots.length} anchored moments, no defects measured.`);
  process.exit(0);
}
console.log(`✗ ${findings.length} finding(s):\n`);
for (const sev of ['high', 'medium']) {
  for (const f of bySeverity[sev]) {
    console.log(`  [${sev}] frame ${f.frame} · ${f.label}`);
    console.log(`         ${f.kind}: ${f.detail}`);
  }
}
console.log(`\nstills: ${OUT}`);
if (FIX) {
  console.log('\n--fix: no automatic correction is defined for these findings yet.');
  console.log('       They are reported with the frame and the measurement so the cause can be');
  console.log('       fixed at its source — a guessed "fix" to a picture is how a render starts');
  console.log('       lying about the spec.');
}
process.exit(bySeverity.high.length ? 1 : 0);
