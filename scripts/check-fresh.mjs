#!/usr/bin/env node
// FRESHNESS SEAL — is the rendered file actually newer than the things that decide what it
// looks like?
//
// WHY THIS EXISTS (2026-08-30, and it cost the owner's trust rather than just time).
//
// A standing highlight was being drawn from geometry measured at the END of a step while the
// clip was still playing, so it appeared next to a command that had not been typed yet. I
// found it, fixed it, verified the fix with two stills — and then re-rendered two of the four
// cuts and forgot the other two. The owner watched one of the forgotten ones and reported the
// bug back to me, seven minutes after I had committed its fix.
//
// Nothing in the pipeline was wrong. The spec was right, the code was right, every gate was
// green. The ARTIFACT was stale, and no gate had an opinion about artifacts. "I fixed it" and
// "the file on disk has the fix" are different claims, and only one of them was being checked.
//
// So: a render is stale when it is older than anything that determines it —
//   · its own spec (bake, anchor and sync all rewrite the spec, so this covers recordings,
//     frame counts and audio timings too),
//   · any renderer source under src/ (a component change repaints every video),
//   · the audio it was muxed against.
//
// Deliberately mtime-based rather than hash-based. A content hash would be stricter and would
// also be wrong here: touching a comment in an unrelated component genuinely does not change
// the pixels, but proving that costs a render, which is the thing being avoided. An mtime
// check is CONSERVATIVE — it can cry stale when nothing visual changed, and it can never miss
// a real staleness. For a gate whose failure mode is "you shipped a bug you had already
// fixed", erring toward re-rendering is the correct bias.
//
// SCOPE IS THE WHOLE DIFFICULTY, and the first version got it wrong.
//
// Run across every topic, this seal reported 87 of 91 renders stale — because ~90 archived
// videos are all older than the current `src/`, which is true, unactionable, and precisely the
// "gate you learn to ignore" failure this file's own commit message warns about. A video that
// shipped six weeks ago is not stale; it is FINISHED. `src/` has moved on and nobody intends
// to re-render it.
//
// So the default scope is WHAT YOU ARE WORKING ON, taken from git: any topic with uncommitted
// changes, or touched by the last few commits. That is exactly the set where "did I remember to
// re-render?" is a live question — and it is the set the original mistake lived in.
//
// Usage:
//   node scripts/check-fresh.mjs                 topics in flight (uncommitted or recent)
//   node scripts/check-fresh.mjs <slug> [...]    just these
//   node scripts/check-fresh.mjs --all           every topic — expect archive noise
import fs from 'node:fs';
import path from 'node:path';
import {execSync} from 'node:child_process';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const quiet = process.argv.includes('--quiet');
const all = process.argv.includes('--all');

/** Topic slugs git says are in flight: uncommitted, or touched in the last N commits. */
const inFlight = (commits = 8) => {
  const slugs = new Set();
  const collect = (out) => {
    for (const line of String(out).split(/\r?\n/)) {
      const m = /(?:^|\s)topics[\/\\]([^\/\\]+)[\/\\]/.exec(line);
      if (m) slugs.add(m[1]);
    }
  };
  try {
    // SKIP UNTRACKED. `git status --porcelain` marks a never-committed directory `??`, and this
    // repo has ~90 of them — old topic folders that were never added. They are not "in flight",
    // they have simply never been committed, and counting them put the whole archive back in
    // scope (62 topics, 58 "stale"), which is the noise this scoping exists to remove.
    const st = execSync('git status --porcelain -- topics', {encoding: 'utf8'});
    collect(String(st).split(/\r?\n/).filter((l) => !l.startsWith('??')).join('\n'));
  } catch { /* not a repo */ }
  try { collect(execSync(`git log --name-only --pretty=format: -${commits} -- topics`, {encoding: 'utf8'})); } catch { /* shallow or empty */ }
  return [...slugs];
};

/** Newest mtime under a directory tree, and WHICH file it was. Skips nothing. */
const newestUnder = (dir) => {
  let newest = 0, which = dir;
  const walk = (d) => {
    let entries;
    try { entries = fs.readdirSync(d, {withFileTypes: true}); } catch { return; }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else {
        const m = fs.statSync(full).mtimeMs;
        if (m > newest) { newest = m; which = full; }
      }
    }
  };
  walk(dir);
  return {mtime: newest, file: which};
};

const mtime = (f) => { try { return fs.statSync(f).mtimeMs; } catch { return 0; } };
const ago = (ms) => {
  const s = Math.round(ms / 1000);
  if (s < 90) return `${s}s`;
  if (s < 5400) return `${Math.round(s / 60)}m`;
  return `${(s / 3600).toFixed(1)}h`;
};

// The renderer. Every video is a function of this, so a change here dates every output.
//
// NAMING THE FILE IS THE POINT. This gate is deliberately conservative — mtime against the
// whole of src/, so it can never miss a real staleness — and the cost is that an edit to one
// component dates every video, including the ones that never render that component. Measured
// straight after it was built: a typography change in `linuxViz.tsx` marked four cuts stale,
// none of which uses a single CMD_* scene. Re-rendering those would have been two hours spent
// proving nothing.
//
// Reporting WHICH file is newest turns that from a two-hour re-render into a five-second
// judgement: read the filename, ask whether the spec in question uses it. The conservative
// bias stays — the gate still reports — but it now hands over what a person needs to act.
const SRC_INFO = newestUnder('src');
const SRC = SRC_INFO.mtime;

const everySlug = () => fs.readdirSync('topics', {withFileTypes: true})
  .filter((e) => e.isDirectory()).map((e) => e.name);

const slugs = args.length ? args : all ? everySlug() : inFlight();
const scope = args.length ? 'named' : all ? 'all' : 'in flight (git)';

if (!slugs.length) {
  console.log('✓ FRESHNESS SEAL — no topic is in flight, so nothing can be stale');
  process.exit(0);
}

const stale = [];
const fresh = [];
let checked = 0;

for (const slug of slugs) {
  const outDir = path.join('topics', slug, 'out');
  if (!fs.existsSync(outDir)) continue;

  for (const file of fs.readdirSync(outDir)) {
    if (!file.endsWith('.mp4')) continue;
    const render = path.join(outDir, file);
    const rendered = mtime(render);
    if (!rendered) continue;
    checked++;

    // wide-* renders come from long.json, short-* from shorts.json.
    const specName = file.startsWith('short') ? 'shorts.json' : 'long.json';
    const spec = path.join('topics', slug, specName);
    const specM = mtime(spec);
    if (!specM) continue;   // a render with no spec beside it is somebody's manual export

    // The audio this cut was voiced from, found through the spec's own scene ids.
    let audioM = 0;
    try {
      const s = JSON.parse(fs.readFileSync(spec, 'utf8'));
      for (const sc of s.scenes ?? []) {
        const a = sc.audio ?? sc.voice ?? null;
        if (typeof a === 'string') audioM = Math.max(audioM, mtime(path.join('public', a.replace(/^\/+/, ''))));
      }
    } catch { /* a spec that will not parse is the linter's problem, not this seal's */ }

    const newestInput = Math.max(specM, SRC, audioM);
    const why = newestInput === specM ? specName
      : newestInput === audioM ? 'its audio'
      : SRC_INFO.file.split(/[\\/]/).slice(-2).join('/');

    if (rendered < newestInput) {
      stale.push({render, behind: newestInput - rendered, why});
    } else {
      fresh.push(render);
    }
  }
}

if (!checked) {
  console.log(`no rendered output among ${slugs.length} ${scope} topic(s) — nothing to check`);
  process.exit(0);
}

if (stale.length) {
  console.error(`\n✗ STALE RENDERS — ${stale.length} of ${checked} output file(s) are older than what decides them\n`);
  for (const s of stale.sort((a, b) => b.behind - a.behind)) {
    console.error(`  ${s.render}`);
    console.error(`      ${ago(s.behind)} behind ${s.why} — the file on disk does NOT contain the current work`);
  }
  console.error(`\nRe-render them before claiming any of this shipped. A fix that is committed but`);
  console.error(`not rendered is a fix the viewer never sees — which has happened, and is why this`);
  console.error(`gate exists.\n`);
  process.exit(1);
}

if (!quiet) {
  console.log(`✓ FRESHNESS SEAL — all ${checked} rendered file(s) across ${slugs.length} ${scope} ` +
    `topic(s) are newer than their spec, their audio and src/`);
}
