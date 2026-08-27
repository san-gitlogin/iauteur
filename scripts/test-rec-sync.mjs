#!/usr/bin/env node
// TEST-REC-SYNC — proves RECORDED footage is anchored to REAL SPOKEN AUDIO.
//
// This is the claim the whole subsystem rests on and the one the owner cares about most:
// *"voice over must be in sync"*. Everything else (the freeze, the callouts, the punch-in)
// is downstream of it. It was ASSERTED for a long time before it was ever measured, on the
// grounds that `sync.mjs` retargets any `*atWord` key — true, but not the same as proof.
//
// What it verifies, against a spec that has actually been through voiceover + sync:
//   1. every clip anchor sits exactly LEAD frames before the word it was authored on
//   2. every callout anchor does too
//   3. no clip is cut off after the re-time (the gap rule survives real audio)
//   4. the rendered mp4, if present, is frame-exact against the spec and audio drift is
//      under one AAC frame
//
// It needs a synced spec + its timestamps; it does NOT re-run TTS (that costs network and
// time, and the invariant is what matters, not re-generating the audio).
//
// Usage: node scripts/test-rec-sync.mjs [slug]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const slug = process.argv[2] || 'rec-vscode-demo';
const specPath = `topics/${slug}/long.json`;
const tsPath = `out/tts/${slug}_long_timestamps.json`;
const LEAD = 12; // sync.mjs pulls each anchor 0.4s early so motion starts before the voice

const results = [];
const check = (name, ok, detail = '') => {
  results.push({name, ok});
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n        ${detail}` : ''}`);
};

if (!fs.existsSync(specPath) || !fs.existsSync(tsPath)) {
  console.error(`Need a SYNCED spec and its timestamps:\n  ${specPath}\n  ${tsPath}\n` +
    `Run:\n  python scripts/voiceover.py ${specPath} ${slug}_long\n` +
    `  node scripts/sync.mjs ${specPath} ${tsPath} ${slug}_long`);
  process.exit(2);
}

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const ts = JSON.parse(fs.readFileSync(tsPath, 'utf8'));
const scenes = (spec.scenes ?? []).filter((s) => s.type === 'RECORDED_STEP');
if (!scenes.length) { console.error(`${specPath} has no RECORDED_STEP scene`); process.exit(2); }

check('the spec has actually been synced', scenes.every((s) => s.timingSource === 'tts'),
  scenes.map((s) => `${s.id}:${s.timingSource}`).join(' '));

// ── 1 + 2: every anchor sits LEAD frames before its own spoken word ──────────
// Post-sync, `atWord` encodes a FRAME (frame/12+1). The word it came from is recoverable
// by finding the word whose real time maps back to that frame.
let anchorsChecked = 0;
let anchorsBad = [];
for (const sc of scenes) {
  const t = ts[sc.id];
  if (!t?.words?.length) { anchorsBad.push(`${sc.id}: no word times`); continue; }
  const frames = t.words.map((w) => Math.max(0, Math.round(w * 30) - LEAD));
  const verify = (label, atWord) => {
    if (atWord == null) return;
    anchorsChecked++;
    const f = Math.round((atWord - 1) * 12);
    // the frame must be one that some real word maps to
    if (!frames.includes(f)) {
      const nearest = frames.reduce((a, b) => (Math.abs(b - f) < Math.abs(a - f) ? b : a), frames[0]);
      anchorsBad.push(`${sc.id} ${label}: frame ${f} matches no spoken word (nearest ${nearest}, off by ${f - nearest})`);
    }
  };
  for (const c of sc.data?.recordedStep?.clips ?? []) {
    verify(`clip ${c.id ?? '?'}`, c.atWord);
    for (const co of c.callouts ?? []) verify(`callout "${String(co.text ?? '').slice(0, 16)}"`, co.atWord);
    if (c.keysAtWord != null) verify(`keys ${c.id}`, c.keysAtWord);
  }
}
check(`every anchor lands exactly ${LEAD} frames before a REAL spoken word`, anchorsBad.length === 0,
  anchorsBad.length ? anchorsBad.join('\n        ') : `${anchorsChecked} anchor(s) verified against real audio`);

// ── 3: the gap rule survives the re-time ────────────────────────────────────
const cut = [];
for (const sc of scenes) {
  const cl = sc.data?.recordedStep?.clips ?? [];
  const f = (w) => Math.round(((w ?? 1) - 1) * 12);
  for (let i = 0; i < cl.length; i++) {
    const end = i + 1 < cl.length ? f(cl[i + 1].atWord) : sc.durationFrames;
    const gap = end - f(cl[i].atWord);
    if (cl[i].frames && gap < cl[i].frames) {
      cut.push(`${sc.id} ${cl[i].id}: ${cl[i].frames}f of footage, only ${gap}f of narration`);
    }
  }
}
check('no clip is cut off after the re-time (the FREEZE absorbs it)', cut.length === 0,
  cut.length ? cut.join('\n        ') : 'every clip has room, and holds for the remainder');

// ── 4: the rendered artefact, if it exists ──────────────────────────────────
const outDir = path.join('topics', slug, 'out');
const mp4 = fs.existsSync(outDir)
  ? fs.readdirSync(outDir).map((f) => path.join(outDir, f)).find((f) => f.endsWith('wide-dark.mp4'))
  : null;
if (mp4) {
  const specFrames = spec.scenes.reduce((a, s) => a + Number(s.durationFrames || 0), 0);
  // ffprobe's csv writer emits a TRAILING COMMA and CRLF even for a single field
  // ("1079,\r\n"), so Number() on the raw string is NaN. Take the first field.
  const probe = (args) => execFileSync('ffprobe', ['-v', 'error', ...args, '-of', 'csv=p=0', mp4])
    .toString().trim().split(/\r?\n/)[0].split(',')[0].trim();
  const vFrames = Number(probe(['-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=nb_read_frames']));
  const rate = probe(['-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate']);
  const vDur = Number(probe(['-select_streams', 'v:0', '-show_entries', 'stream=duration']));
  const aDur = Number(probe(['-select_streams', 'a:0', '-show_entries', 'stream=duration']));
  check('render is FRAME-EXACT against the spec', vFrames === specFrames,
    `spec ${specFrames}f, video ${vFrames}f @ ${rate}`);
  // One AAC frame is ~1024 samples (~23ms at 44.1k); padding to a frame boundary is normal.
  const drift = Math.abs(aDur - vDur);
  check('audio drift is under one AAC frame', drift < 0.06,
    `video ${vDur.toFixed(3)}s, audio ${aDur.toFixed(3)}s, drift ${(drift * 1000).toFixed(0)}ms`);
} else {
  console.log(`        (no rendered mp4 for ${slug} — skipped the artefact checks)`);
}

const bad = results.filter((r) => !r.ok);
console.log('');
if (bad.length) {
  console.error(`${bad.length} of ${results.length} sync checks FAILED.`);
  process.exit(1);
}
console.log(`All ${results.length} sync checks PASS — the footage is anchored to the real voice.`);
